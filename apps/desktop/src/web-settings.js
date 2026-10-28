import { randomUUID } from 'node:crypto';

/**
 * Web search settings, held by the main process (optional; it is off until the writer turns it on).
 * The key is encrypted with the operating system's store exactly like the online provider's key, and the page never receives it: it can only ask
 * whether one is saved. Everything the outside world provides (preferences, safeStorage, the search service, fetch) is passed in, so this is tested
 * without Electron, and the preload bridge, `main.js` and the tests all use the same code.
 *
 * Without a key of their own, a writer can use a built-in search: Wikipedia in every build, and NIE's own search service (run by the NIE developers; a build knows only its address)
 * in a build that carries one. A built-in search is used only after the writer agreed to how THAT service works (`builtin` holds the id of the one agreed to), and their own key,
 * when there is one, always runs instead.
 */

export const WEB_PROVIDERS = ['auto', 'tavily', 'brave', 'serper', 'searxng', 'custom'];
const KINDS = ['not-configured', 'auth', 'rate', 'network', 'bad-response', 'aborted']; // the only ways a search can fail, as the page is told
const CUSTOM_DEFAULTS = Object.freeze({ method: 'GET', url: '', headerName: 'Authorization', headerPrefix: 'Bearer ', bodyTemplate: '', resultsPath: 'results', titleKey: 'title', urlKey: 'url', snippetKey: 'snippet' });

/** The services that need nothing from the writer (the engine's `BUILTIN`; a test keeps the two lists the same, because this file is packed apart from the engine). */
export const BUILTIN_SERVICES = Object.freeze(['nie', 'wikipedia']);
const isBuiltin = (id) => BUILTIN_SERVICES.includes(id);
const INSTALL_ID = /^[A-Za-z0-9-]{8,64}$/; // the shape the built-in search accepts

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

/** The address of the built-in search service, from the build's `search-gateway.json` (`readText` returns the file). Only an https address counts; anything else means this build has none. */
export function readGatewayUrl(readText) {
  try {
    const raw = String(JSON.parse(readText())?.url ?? '').trim();
    const u = new URL(raw);
    return u.protocol === 'https:' && !u.username && !u.password ? raw : '';
  } catch {
    return '';
  }
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
 * @param {string} [deps.gatewayUrl]                 the address of NIE's own search service (`readGatewayUrl`); '' when this build has none
 * @param {() => string} [deps.makeId]               a new random install code
 * @param {() => (object|null)} [deps.getPack]       the open offline encyclopedia (engine/encyclopedia `Pack`), or null when none is installed
 */
export function createWebSettings({ readPrefs, writePrefs, safeStorage, createService, fetch, gatewayUrl = '', makeId = randomUUID, getPack = () => null }) {
  /** The random code sent with a built-in search so the service can limit abuse (not a name, not an account). Made the first time it is wanted and then kept; only a request carries it. */
  let made = null;
  function installId() {
    const stored = readPrefs().web;
    const p = stored && typeof stored === 'object' ? stored : {};
    if (typeof p.installId === 'string' && INSTALL_ID.test(p.installId)) return p.installId;
    made ??= makeId();
    try {
      writePrefs({ web: { ...p, installId: made } });
    } catch {
      /* it lasts for this session and is made again next time */
    }
    return made;
  }

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
      builtin: isBuiltin(p.builtin) ? p.builtin : '', // an id; the old yes/no "true" agreed to nothing in particular, so it counts as no agreement
      gatewayUrl,
      installId: installId(),
    };
  }

  const service = createService({ fetch, getConfig: read, getPack });
  const fail = (kind, message, key = '') => ({ error: { kind: KINDS.includes(kind) ? kind : 'network', message: redact(message, key) } });
  /** The agreement as it is stored after a save: the id of a built-in service this build can run, '' (or false) to take it back, and for anything else, including true, what was stored. */
  const agreement = (asked, stored) => (isBuiltin(asked) && (asked !== 'nie' || gatewayUrl) ? asked : asked === '' || asked === false ? '' : stored);
  /** Which service these settings stand for. The engine decides: a key or address of the writer's own first, the built-in search only when there is none. */
  const describe = (c) => {
    try {
      return service.describe?.(c) ?? {};
    } catch {
      return {};
    }
  };

  /**
   * What the page may know: the settings without the key, which service Automatic would pick, and where the built-in search stands: which one would run with no key of the
   * writer's own (`builtinService`, null when they chose their own service), the one they agreed to (`builtin`, '' for none). Never the address of NIE's service or the install code.
   */
  function get() {
    const c = read();
    const d = describe(c);
    const builtinService = isBuiltin(d.provider) ? d.provider : null;
    return {
      enabled: c.enabled, provider: c.provider, detected: typeof d.detected === 'string' && d.detected ? d.detected : null, baseUrl: c.baseUrl, custom: c.custom, hasKey: Boolean(c.key), keyStoredSecurely: safeStorage.isEncryptionAvailable(),
      gateway: Boolean(gatewayUrl), builtinService, builtin: c.builtin, usingBuiltin: builtinService !== null, pack: Boolean(getPack()),
    };
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
        installId: cur.installId,
        builtin: agreement(cfg.builtin, cur.builtin),
      };
      if (typeof cfg.apiKey === 'string' && cfg.apiKey) {
        if (safeStorage.isEncryptionAvailable()) Object.assign(next, { key: safeStorage.encryptString(cfg.apiKey).toString('base64'), encrypted: true });
        else Object.assign(next, { key: cfg.apiKey, encrypted: false });
      }
      if (cfg.clearKey) Object.assign(next, { key: undefined, encrypted: undefined });
      // A built-in search runs only for a writer who agreed to THAT service: with no key or address of their own, "on" without that agreement (or after withdrawing it) is stored as off.
      const key = cfg.clearKey ? '' : typeof cfg.apiKey === 'string' && cfg.apiKey ? cfg.apiKey : cur.key;
      const runs = describe({ ...cur, provider: next.provider, baseUrl: next.baseUrl, custom: next.custom, key }).provider;
      if (next.enabled && isBuiltin(runs) && next.builtin !== runs) next.enabled = false;
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
        return { provider: res.provider, results: res.results, ...(res.pack ? { pack: res.pack } : {}) };
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
