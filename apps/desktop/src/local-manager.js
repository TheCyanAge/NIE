import { EventEmitter } from 'node:events';
import { LlamaService } from './llama-service.js';
import { downloadModel } from './model-download.js';
import { validateRuntime, validateModel, locateModel, DEFAULT_MODEL, MODEL_CATALOG } from './runtime.js';

/**
 * Owns the offline brain: finds the model (bundled, downloaded or custom), downloads it when missing,
 * runs the persistent llama-server, and reports ONE honest status the UI can show.
 *
 *   status.state: 'starting' | 'ready' | 'failed' | 'unavailable'
 */
export class LocalModelManager extends EventEmitter {
  constructor({ layout, prefs = {}, model = DEFAULT_MODEL, platform = process.platform, buildSpawn, clientFactory, fetchImpl, env, log = () => {}, autoDownload = true, serviceOptions = {} }) {
    super();
    Object.assign(this, { layout, prefs, model, platform, buildSpawn, clientFactory, fetchImpl, env, log, autoDownload, serviceOptions });
    this.service = null;
    this._status = { state: 'starting', detail: 'Starting…', phase: 'init' };
    this._download = null;
    this._abort = null;
    this._init = null;
  }

  get status() {
    return { ...this._status };
  }

  #set(state, detail = null, extra = {}) {
    this._status = { state, detail, ...extra };
    this.emit('status', this.status);
  }

  /** Runtime + model state without starting anything (for Settings → AI Model). */
  info() {
    const loc = locateModel({ layout: this.layout, model: this.model, customPath: this.prefs.customModelPath ?? null });
    return {
      status: this.status,
      model: { ...this.model, path: loc.path, exists: loc.exists, downloadTarget: loc.downloadTarget, validation: loc.exists ? validateModel(loc.path, { minBytes: this.model.minBytes }) : null },
      catalog: MODEL_CATALOG.map(({ id, label, fileName }) => ({ id, label, fileName })),
      runtime: validateRuntime(this.layout.binDir, this.platform),
      diagnostics: this.service?.diagnostics ?? null,
    };
  }

  /** Start in the background. Resolves when ready or failed; never throws. */
  init() {
    this._init ??= this.#run().finally(() => (this._init = null));
    return this._init;
  }

  async #run() {
    this.#set('starting', 'Starting the offline model…', { phase: 'check' });
    const rt = validateRuntime(this.layout.binDir, this.platform);
    if (!rt.ok) {
      this.#set('failed', rt.problems.map((p) => p.message).join(' '), { phase: 'runtime' });
      return this.status;
    }

    const isValid = (p) => validateModel(p, { minBytes: this.model.minBytes }).ok;
    let loc = locateModel({ layout: this.layout, model: this.model, customPath: this.prefs.customModelPath ?? null, validate: isValid });
    if (!loc.exists || loc.valid === false) {
      if (this.prefs.customModelPath) {
        this.#set('failed', validateModel(loc.path, { minBytes: 1 }).problems.map((p) => p.message).join(' ') || 'The selected model file is not usable.', { phase: 'model' });
        return this.status;
      }
      if (loc.exists) this.log('model file present but not usable:', loc.path);
      if (!this.autoDownload) {
        this.#set('failed', 'The offline model is not installed. Download it from Settings → AI Model.', { phase: 'model' });
        return this.status;
      }
      const ok = await this.#download(loc.downloadTarget);
      if (!ok) return this.status;
      loc = locateModel({ layout: this.layout, model: this.model, customPath: null, validate: isValid });
    }

    this.service = new LlamaService({
      binDir: this.layout.binDir,
      modelPath: loc.path,
      model: this.model,
      platform: this.platform,
      buildSpawn: this.buildSpawn,
      clientFactory: this.clientFactory,
      env: this.env,
      log: this.log,
      ...this.serviceOptions,
    });
    this.service.on('status', (s) => {
      if (s.state === 'unavailable') return this.#set('unavailable', s.detail);
      this.#set(s.state, s.detail, { phase: 'server', port: s.port });
    });
    this.#set('starting', 'Loading the offline model…', { phase: 'server' });
    await this.service.start();
    return this.status;
  }

  async #download(dest) {
    this._abort = new AbortController();
    this.#set('starting', 'Downloading the offline model…', { phase: 'download', percent: 0 });
    try {
      await downloadModel({
        url: this.model.url,
        destPath: dest,
        minBytes: this.model.minBytes,
        fetchImpl: this.fetchImpl,
        signal: this._abort.signal,
        onProgress: (p) => {
          const percent = p.percent == null ? null : Math.round(p.percent);
          if (percent !== this._status.percent) {
            this.#set('starting', `Downloading the offline model… ${percent ?? ''}${percent == null ? '' : '%'}`.trim(), { phase: 'download', percent });
            this.emit('download', { percent, received: p.received, total: p.total });
          }
        },
      });
      return true;
    } catch (err) {
      this.#set('failed', `The offline model could not be downloaded: ${err?.message ?? err}`, { phase: 'download' });
      return false;
    } finally {
      this._abort = null;
    }
  }

  cancelDownload() {
    this._abort?.abort();
  }

  async restart() {
    this.cancelDownload();
    await this.service?.stop();
    this.service = null;
    return this.init();
  }

  async stop() {
    this.cancelDownload();
    await this.service?.stop();
  }

  chat(messages, opts) {
    if (!this.service) throw Object.assign(new Error('Offline NIE is not ready.'), { kind: 'error' });
    return this.service.chat(messages, opts);
  }
}
