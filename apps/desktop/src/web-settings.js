/**
 * Web search settings, held by the main process (optional; it is off until the writer turns it on).
 * The key is encrypted with the operating system's store exactly like the online provider's key, and the page never receives it: it can only ask
 * whether one is saved. Everything the outside world provides (preferences, safeStorage, the search service, fetch) is passed in, so this is tested
 * without Electron, and the preload bridge, `main.js` and the tests all use the same code.
 */

export const WEB_PROVIDERS = ['auto', 'tavily', 'brave', 'serper', 'searxng', 'custom'];
const KINDS = ['not-configured', 'auth', 'rate', 'network', 'bad-response', 'aborted']; // the only ways a search can fail, as the page is told
const CUSTOM_DEFAULTS = Object.freeze({ method: 'GET', url: '', headerName: 'Authorization', headerPrefix: 'Bearer ', bodyTemplate: '', resultsPath: 'results', titleKey: 'title', urlKey: 'url', snippetKey: 'snippet' });

const text = (v, fallback, max, trim = true) => (typeof v === 'string' ? (trim ? v.trim() : v).slice(0, max) : fallback);

/** Only the known fields of a "custom JSON search API" description, each a short string (a prefix like "Bearer " keeps its space). */
function cleanCustom(c, cur) {
  const o = c && typeof c === 'object' ? c : {};
  return {
    method: o.method === 'POST' ? 'POST' : o.method === 'GET' ? 'GET' : cur.method,
    url: text(o.url, cur.url, 2000),
    headerName: text(o.headerName, cur.headerName, 100),
    headerPrefix: text(o.headerPrefix, cur.headerPrefix, 100, false),
    bodyTemplate: text(o.bodyTemplate, cur.bodyTemplate, 4000, false),
    resultsPath: text(o.resultsPath, cur.resultsPath, 200),
    titleKey: text(o.titleKey, cur.titleKey, 100),
    urlKey: text(o.urlKey, cur.urlKey, 100),
    snippetKey: text(o.snippetKey, cur.snippetKey, 100),
  };
}

/** A message that may have been written with the key in it never reaches the page with the key in it. */
const redact = (message, key) => (key && key.length >= 8 ? String(message).split(key).join('…') : String(message));

/**
 * @param {object} deps
 * @param {() => object} deps.readPrefs            the whole preferences object
 * @param {(patch: object) => object} deps.writePrefs
 * @param {{ isEncryptionAvailable(): boolean, encryptString(s: string): Buffer, decryptString(b: Buffer): string }} deps.safeStorage
 * @param {(opts: { fetch: Function, getConfig: () => object }) => object} deps.createService   `createWebService` from the engine
 * @param {Function} deps.fetch
 */
export function createWebSettings({ readPrefs, writePrefs, safeStorage, createService, fetch }) {
  /** The plaintext configuration. It exists only inside the main process: the service reads it fresh on every call, so a saved change applies at once. */
  function read() {
    const stored = readPrefs().web;
    const p = stored && typeof stored === 'object' ? stored : {};
    let key = '';
    if (typeof p.key === 'string' && p.key) {
      try {
        key = p.encrypted ? safeStorage.decryptString(Buffer.from(p.key, 'base64')) : p.key;
      } catch {
        key = '';
      }
    }
    return {
      enabled: Boolean(p.enabled),
      provider: WEB_PROVIDERS.includes(p.provider) ? p.provider : 'auto',
      key,
      baseUrl: typeof p.baseUrl === 'string' ? p.baseUrl : '',
      custom: cleanCustom(p.custom, CUSTOM_DEFAULTS),
    };
  }

  const service = createService({ fetch, getConfig: read });
  const fail = (kind, message, key = '') => ({ error: { kind: KINDS.includes(kind) ? kind : 'network', message: redact(message, key) } });

  /** What the page may know: the settings without the key, and which service Automatic would pick. */
  function get() {
    const c = read();
    let detected = null;
    try {
      const d = service.describe?.(c)?.detected;
      detected = typeof d === 'string' && d ? d : null;
    } catch {
      detected = null;
    }
    return { enabled: c.enabled, provider: c.provider, detected, baseUrl: c.baseUrl, custom: c.custom, hasKey: Boolean(c.key), keyStoredSecurely: safeStorage.isEncryptionAvailable() };
  }

  return {
    get,
    set(cfg = {}) {
      const cur = read();
      const stored = readPrefs().web;
      const old = stored && typeof stored === 'object' ? stored : {};
      const next = {
        enabled: Boolean(cfg.enabled),
        provider: WEB_PROVIDERS.includes(cfg.provider) ? cfg.provider : 'auto',
        baseUrl: text(cfg.baseUrl, '', 2000),
        custom: cleanCustom(cfg.custom, cur.custom),
        key: old.key,
        encrypted: old.encrypted,
      };
      if (typeof cfg.apiKey === 'string' && cfg.apiKey) {
        if (safeStorage.isEncryptionAvailable()) Object.assign(next, { key: safeStorage.encryptString(cfg.apiKey).toString('base64'), encrypted: true });
        else Object.assign(next, { key: cfg.apiKey, encrypted: false });
      }
      if (cfg.clearKey) Object.assign(next, { key: undefined, encrypted: undefined });
      writePrefs({ web: next });
      return get();
    },
    /** Whether the service is set up, with no network. Only these four fields ever leave. */
    status() {
      try {
        const s = service.status();
        return { configured: Boolean(s?.configured), enabled: Boolean(s?.enabled), provider: typeof s?.provider === 'string' ? s.provider : null, label: String(s?.label ?? '') };
      } catch {
        return { configured: false, enabled: false, provider: null, label: 'Web search is not available' };
      }
    },
    /** A search never throws across the bridge: a failure is `{ error: { kind, message } }`. (The service itself refuses while the setting is off.) */
    async search(query, opts) {
      const limit = opts?.limit;
      try {
        const res = await service.search(String(query ?? ''), { limit: Number.isFinite(limit) ? Math.min(Math.max(Math.trunc(limit), 1), 10) : undefined });
        return { provider: res.provider, results: res.results };
      } catch (err) {
        return fail(err?.kind, err?.message ?? String(err), read().key);
      }
    },
    /** The text of one page (null when it can not be read, or while the setting is off). */
    async read(url) {
      if (typeof url !== 'string') return null;
      try {
        const page = await service.read(url);
        return page ? { url: String(page.url ?? url), title: String(page.title ?? ''), text: String(page.text ?? '') } : null;
      } catch {
        return null;
      }
    },
    async test() {
      try {
        const r = await service.test();
        return { ok: Boolean(r?.ok), provider: typeof r?.provider === 'string' ? r.provider : null, message: redact(r?.message ?? '', read().key) };
      } catch (err) {
        return { ok: false, provider: null, message: redact(err?.message ?? String(err), read().key) };
      }
    },
  };
}
