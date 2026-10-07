import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { validateRuntime, validateModel, DEFAULT_MODEL, GENERIC_MIN_MODEL_BYTES } from './runtime.js';

/**
 * The persistent local model service: one llama-server process, started once and kept alive,
 * with honest status (starting → ready | failed) and real verification that NIE can talk to it.
 *
 *   NIE UI → orchestrator → LlamaService → llama-server → Qwen
 */

const OUTPUT_LINES = 200;

/** Turn llama-server's own error output into something the writer (and a developer) can act on. */
export function diagnose(output, fallback = 'The offline model could not be started.') {
  const o = output.join('\n');
  if (/no backends are loaded/i.test(o)) return 'The llama.cpp CPU backend is missing ("no backends are loaded"). Reinstall NIE, or run `npm run fetch:runtime` for a development build.';
  if (/(?:cannot open shared object|was not found|The code execution cannot proceed|DLL load failed|0xc0000135)/i.test(o)) return 'A runtime library needed by llama-server is missing. The whole llama.cpp runtime must sit next to llama-server.';
  if (/address already in use|bind.*failed|couldn't bind/i.test(o)) return 'The local model port was already in use.';
  if (/out of memory|failed to allocate|ggml_backend_cpu_buffer_type_alloc_buffer/i.test(o)) return 'There is not enough free memory to load the offline model.';
  if (/failed to load model|error loading model|llama_model_load/i.test(o)) return 'The offline model file could not be loaded; it may be damaged or incomplete.';
  return fallback;
}

export function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class LlamaService extends EventEmitter {
  /**
   * @param {object} o
   * @param {string} o.binDir
   * @param {string} o.modelPath
   * @param {object} [o.model]               catalog entry (for minBytes / context size)
   * @param {string} [o.platform]
   * @param {(spec:{serverPath:string, modelPath:string, port:number, args:string[]}) => {command:string,args:string[]}} [o.buildSpawn]
   * @param {(cfg:object) => object} [o.clientFactory]  returns an OpenAICompatClient
   */
  constructor({ binDir, modelPath, model = DEFAULT_MODEL, platform = process.platform, buildSpawn, clientFactory, env = process.env, startupTimeoutMs = 180000, minBytes, threads, log = () => {}, maxRestarts = 2 }) {
    super();
    Object.assign(this, { binDir, modelPath, model, platform, buildSpawn, clientFactory, env, startupTimeoutMs, log, maxRestarts });
    this.minBytes = minBytes ?? model.minBytes ?? GENERIC_MIN_MODEL_BYTES;
    this.threads = threads ?? Math.max(2, Math.floor((os.availableParallelism?.() ?? os.cpus().length) / 2));
    this._status = { state: 'starting', detail: null, port: null };
    this._child = null;
    this._client = null;
    this._startPromise = null;
    this._stopping = false;
    this._restarts = 0;
    this._output = [];
  }

  get status() {
    return { ...this._status };
  }

  #set(state, detail = null, extra = {}) {
    this._status = { state, detail, port: this._status.port, ...extra };
    this.emit('status', this.status);
  }

  /** Idempotent. Resolves when the service is ready or has failed; it never throws. */
  start() {
    if (this._status.state === 'ready' && this._child) return Promise.resolve(this.status);
    this._startPromise ??= this.#startInner().finally(() => {
      this._startPromise = null;
    });
    return this._startPromise;
  }

  async #startInner() {
    this._stopping = false;
    this._output = [];
    this.#set('starting');

    const rt = validateRuntime(this.binDir, this.platform);
    if (!rt.ok) return this.#fail(rt.problems.map((p) => p.message).join(' '));
    const md = validateModel(this.modelPath, { minBytes: this.minBytes });
    if (!md.ok) return this.#fail(md.problems.map((p) => p.message).join(' '));

    let port;
    try {
      port = await freePort();
    } catch (err) {
      return this.#fail(`Could not reserve a local port: ${err.message}`);
    }
    this._status.port = port;

    const serverDir = path.dirname(rt.serverPath);
    const baseArgs = ['-m', this.modelPath, '--host', '127.0.0.1', '--port', String(port), '-c', String(this.model.contextSize ?? 4096), '-t', String(this.threads), '-np', '1'];
    const spec = this.buildSpawn ? this.buildSpawn({ serverPath: rt.serverPath, modelPath: this.modelPath, port, args: baseArgs }) : { command: rt.serverPath, args: baseArgs };

    // The runtime directory is both the working directory and on PATH, so Windows finds the backend DLLs.
    const env = { ...this.env, PATH: `${serverDir}${path.delimiter}${this.env.PATH ?? this.env.Path ?? ''}` };
    let child;
    try {
      child = spawn(spec.command, spec.args, { cwd: serverDir, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (err) {
      return this.#fail(`Could not start llama-server: ${err.message}`);
    }
    this._child = child;
    const keep = (buf) => {
      for (const line of String(buf).split(/\r?\n/)) {
        if (!line.trim()) continue;
        this._output.push(line);
        if (this._output.length > OUTPUT_LINES) this._output.shift();
      }
    };
    child.stdout.on('data', keep);
    child.stderr.on('data', keep);

    // 'close' (not 'exit') marks startup failure: it fires after stdout/stderr are drained, so the diagnosis sees all output.
    let exited = null;
    child.once('error', (err) => (exited ??= { code: null, error: err }));
    child.once('close', (code, signal) => (exited ??= { code, signal }));
    child.once('exit', (code, signal) => this.#onExit(child, code, signal));

    this._client = this.clientFactory ? this.clientFactory({ baseUrl: `http://127.0.0.1:${port}/v1`, model: 'local' }) : await this.#defaultClient(port);

    // Wait for the server to report healthy.
    const deadline = Date.now() + this.startupTimeoutMs;
    for (;;) {
      if (exited) return this.#fail(diagnose(this._output, `llama-server exited unexpectedly (code ${exited.code ?? exited.error?.message}).`), { keepChild: false });
      if (Date.now() > deadline) {
        this.#kill(child);
        return this.#fail('The offline model took too long to start.');
      }
      const h = await this._client.health();
      if (h.ok) break;
      await sleep(200);
    }

    // A file existing and a port answering is not enough: make sure the model actually replies.
    try {
      await this._client.chat([{ role: 'user', content: 'Hi' }], { stream: false, maxTokens: 1, temperature: 0 });
    } catch (err) {
      this.#kill(child);
      return this.#fail(`The model server started but could not answer: ${err.message}`);
    }
    if (exited) return this.#fail(diagnose(this._output));

    this._restarts = 0;
    this.#set('ready');
    return this.status;
  }

  async #defaultClient(port) {
    // Development and tests. The packaged app passes `clientFactory` because the web folder lives outside the asar.
    const mod = await import('../../web/src/engine/ai/openai-client.js');
    return new mod.OpenAICompatClient({ baseUrl: `http://127.0.0.1:${port}/v1`, model: 'local', jsonSchema: true });
  }

  #fail(detail, { keepChild = false } = {}) {
    if (!keepChild) this._child = null;
    this.log('local model failed:', detail);
    this.#set('failed', detail);
    return this.status;
  }

  #onExit(child, code, signal) {
    if (this._child !== child) return;
    this._child = null;
    if (this._stopping) return;
    const wasReady = this._status.state === 'ready';
    if (!wasReady) return; // startup failures are reported by the start loop
    const detail = diagnose(this._output, `The offline model stopped unexpectedly (${signal ?? `code ${code}`}).`);
    this.log('llama-server exited:', detail);
    if (this._restarts < this.maxRestarts) {
      this._restarts++;
      this.#set('starting', 'Restarting the offline model…');
      sleep(this._restarts * 800).then(() => !this._stopping && this.start());
    } else {
      this.#set('failed', detail);
    }
  }

  #kill(child) {
    try {
      child.kill();
    } catch {
      /* already gone */
    }
  }

  async stop() {
    this._stopping = true;
    const child = this._child;
    this._child = null;
    if (child) {
      const gone = new Promise((r) => child.once('exit', r));
      this.#kill(child);
      await Promise.race([gone, sleep(3000)]);
      try {
        child.kill('SIGKILL');
      } catch {
        /* ignore */
      }
    }
    this._status = { state: 'unavailable', detail: 'stopped', port: null };
    this.emit('status', this.status);
  }

  async restart() {
    await this.stop();
    this._restarts = 0;
    return this.start();
  }

  async chat(messages, opts = {}) {
    if (this._status.state !== 'ready' || !this._client) throw Object.assign(new Error('Offline NIE is not ready.'), { kind: 'error' });
    return this._client.chat(messages, opts);
  }

  get diagnostics() {
    return { status: this.status, output: [...this._output], binDir: this.binDir, modelPath: this.modelPath };
  }
}
