import { WebError } from './errors.js';
import { detectProvider, resolveProvider } from './providers.js';
import { readPage } from './page.js';
import { cleanQuery, runSearch } from './search.js';

export { WebError };

/**
 * The one door to the web. The desktop's main process builds it with Node's `fetch` and the stored configuration (the key is only ever inside that process); the orchestrator
 * only sees this shape, so any model (offline, online, or none) can use it and any search service can sit behind it.
 *
 *   status()           what is set up, no network
 *   search(query)      → { provider, results: [{ title, url, snippet }] }; throws WebError
 *   read(url)          → { url, title, text } | null
 *   test()             a one-result search, to say whether the key and address work
 *   describe(cfg)      what a pasted key would be treated as
 */
export function createWebService({ fetch: doFetch = globalThis.fetch, getConfig } = {}) {
  const cfg = () => {
    try {
      return getConfig?.() ?? {};
    } catch {
      return {};
    }
  };
  const off = () => new WebError('not-configured', 'Web search is switched off in Settings.');
  return {
    status() {
      const c = cfg();
      const r = resolveProvider(c);
      const enabled = Boolean(c.enabled);
      return { configured: r.ready, enabled, provider: r.ready ? r.id : null, label: r.ready ? `${r.spec.label}${enabled ? '' : ' (switched off)'}` : r.reason || 'Web search is not set up' };
    },
    async search(query, { signal, limit = 6 } = {}) {
      const c = cfg();
      if (!c.enabled) throw off();
      return runSearch({ fetch: doFetch, cfg: c, query, limit, signal });
    },
    async read(url, { signal, maxChars = 6000 } = {}) {
      if (!cfg().enabled) return null;
      return readPage(url, { fetch: doFetch, signal, maxChars });
    },
    async test() {
      const c = cfg();
      const r = resolveProvider(c);
      if (!r.ready) return { ok: false, provider: r.id, message: r.reason || 'Web search is not set up.' };
      try {
        const { results } = await runSearch({ fetch: doFetch, cfg: c, query: cleanQuery('test'), limit: 1 });
        return { ok: true, provider: r.id, message: `${r.spec.label} answered with ${results.length} result${results.length === 1 ? '' : 's'}.` };
      } catch (err) {
        return { ok: false, provider: r.id, message: err instanceof WebError ? err.message : `${r.spec.label} did not answer.` };
      }
    },
    describe(c = {}) {
      const r = resolveProvider(c);
      return { provider: r.id, detected: detectProvider({ key: c.key, baseUrl: c.baseUrl }), label: r.spec ? r.spec.label : 'Not set up' };
    },
  };
}
