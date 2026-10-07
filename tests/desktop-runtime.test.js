import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRuntime, validateModel, locateModel, resolveLayout, DEFAULT_MODEL, MODEL_CATALOG, serverFileName } from '../apps/desktop/src/runtime.js';
import { LlamaService, diagnose } from '../apps/desktop/src/llama-service.js';
import { OpenAICompatClient } from '../apps/web/src/engine/ai/openai-client.js';

const FAKE = fileURLToPath(new URL('./fixtures/fake-llama.mjs', import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'nie-rt-'));
const VC_FILES = ['vcruntime140.dll', 'vcruntime140_1.dll', 'msvcp140.dll']; // llama-server imports the Visual C++ runtime
const WIN_FILES = ['llama-server.exe', 'llama.dll', 'llama-common.dll', 'ggml.dll', 'ggml-base.dll', 'ggml-cpu-haswell.dll', 'mtmd.dll', ...VC_FILES];

function runtimeDir(files = WIN_FILES) {
  const d = tmp();
  for (const f of files) fs.writeFileSync(path.join(d, f), 'x');
  return d;
}
function modelFile(dir, { size = 2048, magic = 'GGUF' } = {}) {
  const p = path.join(dir, 'model.gguf');
  fs.writeFileSync(p, Buffer.concat([Buffer.from(magic), Buffer.alloc(size)]));
  return p;
}
const until = async (fn, ms = 6000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await fn()) return true; await sleep(25); } return false; };

// ── validation ───────────────────────────────────────────────────────────────

test('the whole llama.cpp runtime must be present, not just llama-server.exe (the b9085 lesson)', () => {
  const ok = validateRuntime(runtimeDir(), 'win32');
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.problems, []);

  // Exactly the broken state we hit on Windows: everything except the CPU backend.
  const noCpu = validateRuntime(runtimeDir(['llama-server.exe', 'llama.dll', 'llama-common.dll', 'ggml.dll', 'ggml-base.dll', 'mtmd.dll']), 'win32');
  assert.equal(noCpu.ok, false);
  assert.equal(noCpu.problems[0].code, 'cpu-backend-missing');
  assert.match(noCpu.problems[0].message, /no backends are loaded/);

  const onlyExe = validateRuntime(runtimeDir(['llama-server.exe']), 'win32');
  assert.deepEqual(onlyExe.problems.map((p) => p.code).sort(), ['cpu-backend-missing', 'dll-missing', 'dll-missing', 'dll-missing']);
  assert.equal(validateRuntime(runtimeDir(['llama.dll']), 'win32').problems[0].code, 'server-missing');
  assert.equal(validateRuntime(path.join(tmp(), 'nope'), 'win32').problems[0].code, 'runtime-missing');
  assert.ok(validateRuntime(runtimeDir(WIN_FILES.filter((f) => f !== 'mtmd.dll')), 'win32').warnings.length === 1);
  // The Visual C++ runtime is not part of the llama.cpp zip; a clean PC may lack it, so the package ships it and a build without it is flagged.
  const noVc = validateRuntime(runtimeDir(WIN_FILES.filter((f) => !VC_FILES.includes(f))), 'win32');
  assert.equal(noVc.ok, true, 'still usable on a PC that has the redistributable installed');
  assert.equal(noVc.warnings.length, 3);
  assert.match(noVc.warnings.join(' '), /vcruntime140\.dll/);
});

test('model validation rejects missing, truncated and non-GGUF files', () => {
  const d = tmp();
  assert.equal(validateModel(path.join(d, 'none.gguf')).problems[0].code, 'model-missing');
  assert.ok(validateModel(modelFile(d, { size: 100 }), { minBytes: 10_000 }).problems.some((p) => p.code === 'model-too-small'));
  assert.ok(validateModel(modelFile(d, { magic: '<!DO' }), { minBytes: 100 }).problems.some((p) => p.code === 'model-corrupt'));
  assert.equal(validateModel(modelFile(d), { minBytes: 100 }).ok, true);
  assert.equal(validateModel(d).problems[0].code, 'model-missing', 'a directory is not a model');
});

test('default model matches the product spec; layout differs between dev and packaged', () => {
  assert.equal(DEFAULT_MODEL.fileName, 'Qwen2.5-3B-Instruct-Q4_K_M.gguf');
  assert.ok(DEFAULT_MODEL.minBytes > 1_500_000_000 && DEFAULT_MODEL.minBytes < 1_930_000_000);
  assert.equal(MODEL_CATALOG[0], DEFAULT_MODEL);
  assert.equal(serverFileName('win32'), 'llama-server.exe');
  const dev = resolveLayout({ isPackaged: false, desktopDir: '/repo/apps/desktop', userDataDir: '/u' });
  assert.equal(dev.binDir, path.join('/repo/apps/desktop', 'bin'));
  assert.equal(dev.webRoot, path.join('/repo/apps/desktop', '..', 'web'));
  const pkg = resolveLayout({ isPackaged: true, resourcesPath: '/app/resources', desktopDir: '/x', userDataDir: '/u' });
  assert.equal(pkg.binDir, path.join('/app/resources', 'bin'));
  assert.equal(pkg.bundledModelsDir, path.join('/app/resources', 'models'));
  assert.equal(pkg.webRoot, path.join('/app/resources', 'web'));
});

test('model lookup prefers a custom path, then the bundled model, then a downloaded copy', () => {
  const root = tmp();
  const layout = { bundledModelsDir: path.join(root, 'bundled'), userModelsDir: path.join(root, 'user') };
  fs.mkdirSync(layout.bundledModelsDir); fs.mkdirSync(layout.userModelsDir);
  assert.equal(locateModel({ layout }).exists, false);
  fs.writeFileSync(path.join(layout.userModelsDir, DEFAULT_MODEL.fileName), 'x');
  assert.equal(locateModel({ layout }).path, path.join(layout.userModelsDir, DEFAULT_MODEL.fileName));
  fs.writeFileSync(path.join(layout.bundledModelsDir, DEFAULT_MODEL.fileName), 'x');
  assert.equal(locateModel({ layout }).path, path.join(layout.bundledModelsDir, DEFAULT_MODEL.fileName));
  const custom = path.join(root, 'mine.gguf'); fs.writeFileSync(custom, 'x');
  assert.equal(locateModel({ layout, customPath: custom }).path, custom);
  assert.equal(locateModel({ layout }).downloadTarget, path.join(layout.userModelsDir, DEFAULT_MODEL.fileName));
});

test('llama-server output is turned into actionable diagnoses', () => {
  assert.match(diagnose(['load_backend: no backends are loaded.']), /CPU backend is missing/);
  assert.match(diagnose(['error: failed to load model x']), /could not be loaded/);
  assert.match(diagnose(['The code execution cannot proceed because ggml.dll was not found.']), /runtime library/);
  assert.match(diagnose(['ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate']), /memory/);
  assert.equal(diagnose(['something odd'], 'fallback'), 'fallback');
});

// ── the persistent service, driven against a fake llama-server ──────────────

function service(opts = {}) {
  const binDir = opts.binDir ?? runtimeDir();
  const modelDir = tmp();
  const cwdFile = path.join(tmp(), 'cwd.txt');
  const svc = new LlamaService({
    binDir,
    modelPath: opts.modelPath ?? modelFile(modelDir),
    model: { ...DEFAULT_MODEL, minBytes: 100 },
    ...(opts.slots ? { slots: opts.slots } : {}),
    platform: 'win32',
    // Run the fake (a node script) in place of llama-server.exe, with the same arguments.
    buildSpawn: ({ args }) => ({ command: process.execPath, args: [FAKE, ...args] }),
    clientFactory: (cfg) => new OpenAICompatClient(cfg),
    env: { ...process.env, FAKE_LLAMA_CWD_FILE: cwdFile, FAKE_LLAMA_LOAD_MS: '200', ...(opts.env ?? {}) },
    startupTimeoutMs: opts.startupTimeoutMs ?? 15000,
    ...(opts.service ?? {}),
  });
  return { svc, binDir, cwdFile };
}

test('startup is honest: starting → ready, only after the model has actually answered', async () => {
  const { svc } = service({ env: { FAKE_LLAMA_REPLY: 'ready and chatting' } });
  const states = [];
  svc.on('status', (s) => states.push(s.state));
  assert.equal(svc.status.state, 'starting');
  const status = await svc.start();
  assert.equal(status.state, 'ready');
  assert.deepEqual(states, ['starting', 'ready']);
  const seen = [];
  assert.equal(await svc.chat([{ role: 'user', content: 'hi' }], { onToken: (d) => seen.push(d) }), 'ready and chatting');
  assert.ok(seen.length > 1);
  await svc.stop();
  assert.equal(svc.status.state, 'unavailable');
});

test('llama-server runs with its own folder as cwd and on PATH, with two slots that each keep the full window', async () => {
  const { svc, binDir, cwdFile } = service();
  await svc.start();
  const [cwd, p, argLine] = fs.readFileSync(cwdFile, 'utf8').split('\n');
  assert.match(argLine, /--host 127\.0\.0\.1 /, 'bound to loopback only');
  assert.match(argLine, /-np 2\b/, 'two slots: the reading prompt and the answer prompt each keep their own prompt cache');
  assert.match(argLine, /-c 8192\b/, 'llama-server splits -c between slots, so each slot still has the whole 4,096-token window');
  assert.equal(fs.realpathSync(cwd), fs.realpathSync(binDir));
  assert.ok(p.split(path.delimiter)[0] === binDir || p.startsWith(binDir), 'runtime dir is first on PATH');
  await svc.stop();
});

test('one slot is still possible, and still gets the whole window', async () => {
  const { svc, cwdFile } = service({ slots: 1 });
  await svc.start();
  const argLine = fs.readFileSync(cwdFile, 'utf8').split('\n')[2];
  assert.match(argLine, /-np 1\b/);
  assert.match(argLine, /-c 4096\b/);
  await svc.stop();
});

test('concurrent start() calls share one process and one startup', async () => {
  const { svc } = service();
  const [a, b, c] = await Promise.all([svc.start(), svc.start(), svc.start()]);
  assert.equal(a.state, 'ready');
  assert.equal(a.port, b.port);
  assert.equal(b.port, c.port);
  assert.equal((await svc.start()).state, 'ready', 'start() after ready is a no-op');
  await svc.stop();
});

test('missing CPU backend fails fast with the real reason and never pretends to be ready', async () => {
  const { svc } = service({ binDir: runtimeDir(['llama-server.exe', 'llama.dll', 'ggml.dll', 'ggml-base.dll']) });
  const states = [];
  svc.on('status', (s) => states.push(s.state));
  const s = await svc.start();
  assert.equal(s.state, 'failed');
  assert.match(s.detail, /CPU backend/);
  assert.deepEqual(states, ['starting', 'failed']);
  await assert.rejects(svc.chat([{ role: 'user', content: 'x' }]), /not ready/);
});

test('missing or incomplete model fails without spawning anything', async () => {
  const d = tmp();
  const missing = service({ modelPath: path.join(d, 'none.gguf') });
  const s1 = await missing.svc.start();
  assert.equal(s1.state, 'failed');
  assert.match(s1.detail, /model file is missing/);
  const small = service({ modelPath: modelFile(d, { size: 10 }), service: { minBytes: 1_000_000 } });
  const s2 = await small.svc.start();
  assert.match(s2.detail, /incomplete/);
  assert.equal(fs.existsSync(small.cwdFile), false, 'llama-server was never launched');
});

test('when llama-server itself reports "no backends are loaded", that is what the writer-facing detail says', async () => {
  const { svc } = service({ env: { FAKE_LLAMA_MODE: 'no-backend' } });
  const s = await svc.start();
  assert.equal(s.state, 'failed');
  assert.match(s.detail, /no backends are loaded/);
});

test('a server that dies on startup is reported, not waited on forever', async () => {
  const { svc } = service({ env: { FAKE_LLAMA_MODE: 'crash-on-start' } });
  const t = Date.now();
  const s = await svc.start();
  assert.equal(s.state, 'failed');
  assert.match(s.detail, /exited unexpectedly \(code 3\)/);
  assert.ok(Date.now() - t < 5000);
});

test('a server that answers /health but cannot chat is not "ready"', async () => {
  const { svc } = service({ env: { FAKE_LLAMA_MODE: 'http-500' } });
  const s = await svc.start();
  assert.equal(s.state, 'failed');
  assert.match(s.detail, /could not answer/);
  await svc.stop();
});

test('startup timeout is enforced', async () => {
  const { svc } = service({ env: { FAKE_LLAMA_LOAD_MS: '60000' }, startupTimeoutMs: 600 });
  const s = await svc.start();
  assert.equal(s.state, 'failed');
  assert.match(s.detail, /too long/);
  await svc.stop();
});

test('if the model process dies later, NIE restarts it automatically and says so while it does', async () => {
  const { svc } = service();
  await svc.start();
  const states = [];
  svc.on('status', (s) => states.push(s.state));
  const first = svc._child.pid;
  svc._child.kill('SIGKILL');
  assert.ok(await until(() => states.includes('starting')), 'status flips to starting, not a silent stale "ready"');
  assert.ok(await until(() => svc.status.state === 'ready'));
  assert.notEqual(svc._child.pid, first);
  await svc.stop();
});

test('stop() ends the process, and restart() brings a fresh one up', async () => {
  const { svc } = service();
  await svc.start();
  const pid = svc._child.pid;
  await svc.stop();
  assert.throws(() => process.kill(pid, 0), 'process is gone');
  const s = await svc.restart();
  assert.equal(s.state, 'ready');
  await svc.stop();
});

test('backup or renamed files are not mistaken for runtime libraries (Linux/macOS patterns are anchored)', () => {
  const dir = runtimeDir(['llama-server', 'libllama.so', 'libggml.so', 'libggml-base.so', 'libggml-cpu-x64.so.off']);
  assert.equal(validateRuntime(dir, 'linux').problems[0]?.code, 'cpu-backend-missing');
  assert.equal(validateRuntime(runtimeDir(['llama-server', 'libllama.so.1', 'libggml.so.0', 'libggml-base.so.0', 'libggml-cpu-haswell.so']), 'linux').ok, true, 'versioned library names are fine');
  assert.equal(validateRuntime(runtimeDir(['llama-server', 'libllama.so.bak', 'libggml.so', 'libggml-base.so', 'libggml-cpu.so']), 'linux').ok, false);
});
