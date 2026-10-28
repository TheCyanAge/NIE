import { WebError } from './errors.js';

/**
 * Web search as the page sees it. Both adapters have the shape of the engine's web service (`status`, `search`, `read`, `test`, `describe`), except that
 * `status()` is async here (the page asks the main process), so the orchestrator always does `await web.status()`.
 */

/** The choices in Settings: the id the engine knows, and the name the writer sees. */
export const WEB_PROVIDER_CHOICES = [['auto', 'Automatic'], ['tavily', 'Tavily'], ['brave', 'Brave Search'], ['serper', 'Serper'], ['searxng', 'SearXNG'], ['custom', 'Custom']];
const NAMES = { tavily: 'Tavily', brave: 'Brave Search', serper: 'Serper', searxng: 'SearXNG', custom: 'Custom search service', nie: 'NIE search', wikipedia: 'Wikipedia', pack: 'Offline encyclopedia' };
/** The name of a search service for the writer ("brave" → "Brave Search"); a name that is not a known id is shown as it is. */
export const providerName = (id) => NAMES[id] ?? (typeof id === 'string' && id.trim() ? id.trim() : 'a search service');

const KINDS = ['not-configured', 'auth', 'rate', 'network', 'bad-response', 'aborted'];
const stopped = () => new WebError('aborted', 'Stopped.');

/** The call to the main process cannot be cancelled once sent (the service has its own time limits), but the writer's Stop must not wait for it. */
const untilAborted = (promise, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(stopped());
    const onAbort = () => reject(stopped());
    signal?.addEventListener('abort', onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal?.removeEventListener('abort', onAbort));
  });

const str = (v) => (typeof v === 'string' ? v : '');

/** Desktop: the main process holds the key and makes every request (no CORS, the key never in the page). */
export function createBridgeWeb(bridge) {
  let cfg = { enabled: false, provider: 'auto', detected: null, baseUrl: '', custom: null, hasKey: false, keyStoredSecurely: true, gateway: false, builtinService: null, builtin: '', usingBuiltin: false, pack: false };
  return {
    kind: 'bridge',
    config: () => cfg,
    async refresh() {
      cfg = await bridge.getConfig();
      return cfg;
    },
    async save(next) {
      await bridge.setConfig(next);
      return this.refresh();
    },
    async status() {
      try {
        const s = await bridge.status();
        return { configured: Boolean(s?.configured), enabled: Boolean(s?.enabled), provider: str(s?.provider) || null, label: str(s?.label) };
      } catch {
        return { configured: false, enabled: false, provider: null, label: 'Web search is not available' };
      }
    },
    async search(query, { signal, limit = 6 } = {}) {
      if (signal?.aborted) throw stopped(); // a search the writer already stopped is not sent at all
      let res;
      try {
        res = await untilAborted(bridge.search(String(query ?? ''), { limit }), signal);
      } catch (err) {
        throw err instanceof WebError ? err : new WebError('network', 'The search did not go through.');
      }
      if (res?.error) throw new WebError(KINDS.includes(res.error.kind) ? res.error.kind : 'network', str(res.error.message) || 'The search did not work.');
      if (!res || !Array.isArray(res.results)) throw new WebError('bad-response', 'The search service sent back something NIE could not read.');
      const p = res.pack && typeof res.pack === 'object' ? { docs: Number.isFinite(res.pack.docs) ? res.pack.docs : 0, builtAt: str(res.pack.builtAt), name: str(res.pack.name) } : null;
      return { provider: str(res.provider), results: res.results.filter((r) => r && typeof r.url === 'string').map((r) => ({ title: str(r.title), url: r.url, snippet: str(r.snippet) })), ...(p ? { pack: p } : {}) };
    },
    async read(url, { signal } = {}) {
      if (signal?.aborted) return null;
      try {
        const page = await untilAborted(bridge.read(String(url ?? '')), signal);
        return page && typeof page.text === 'string' ? { url: str(page.url) || String(url), title: str(page.title), text: page.text } : null;
      } catch {
        return null;
      }
    },
    async test() {
      try {
        const r = await bridge.test();
        return { ok: Boolean(r?.ok), provider: str(r?.provider) || null, message: str(r?.message) };
      } catch (err) {
        return { ok: false, provider: null, message: err?.message ?? 'The test did not run.' };
      }
    },
    /** What the SAVED settings stand for (the page cannot ask the main process what an unsaved key would be taken as). */
    describe: () => {
      const provider = cfg.provider === 'auto' ? cfg.detected ?? (cfg.usingBuiltin ? cfg.builtinService : null) : cfg.provider;
      return { provider: provider ?? null, detected: cfg.detected ?? null, label: provider ? providerName(provider) : 'Not set up' };
    },
  };
}

/** The browser build has no main process to hold a key or make the request: web search is a desktop feature, and says so. */
export function createNoWeb() {
  const cfg = { enabled: false, provider: 'auto', detected: null, baseUrl: '', custom: null, hasKey: false, keyStoredSecurely: false, gateway: false, builtinService: null, builtin: '', usingBuiltin: false, pack: false };
  return {
    kind: 'none',
    config: () => cfg,
    refresh: async () => cfg,
    save: async () => cfg,
    status: async () => ({ configured: false, enabled: false, provider: null, label: 'Web search needs the desktop app' }),
    search: async () => {
      throw new WebError('not-configured', 'Web search needs the desktop app.');
    },
    read: async () => null,
    test: async () => ({ ok: false, provider: null, message: 'Web search needs the desktop app.' }),
    describe: () => ({ provider: null, detected: null, label: 'Not available' }),
  };
}
