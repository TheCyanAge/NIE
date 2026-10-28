import { WebError } from './errors.js';
import { detectProvider, isBuiltin, isLocal, resolveProvider } from './providers.js';
import { readPage } from './page.js';
import { readWikipediaPage, wikipediaTarget } from './wikipedia.js';
import { cleanQuery, cleanResults, runSearch } from './search.js';

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
export function createWebService({ fetch: doFetch = globalThis.fetch, getConfig, getPack } = {}) {
  /** The offline encyclopedia, when one is installed and open (the desktop's main process holds it); null otherwise. */
  const pack = () => {
    try {
      return getPack?.() ?? null;
    } catch {
      return null;
    }
  };
  const cfg = () => {
    let c;
    try {
      c = getConfig?.() ?? {};
    } catch {
      c = {};
    }
    return { ...c, pack: Boolean(pack()) };
  };
  const off = () => new WebError('not-configured', 'Web search is switched off in Settings.');
  // On means the writer turned it on, and, for a built-in search, that they agreed to THAT service (`builtin` holds its id; their own key needs no such agreement).
  // The encyclopedia on this computer needs neither: downloading it was the writer's choice, and nothing it does leaves the machine.
  const live = (c, r) => isLocal(r.id) || Boolean(c.enabled && (!isBuiltin(r.id) || c.builtin === r.id));
  const askPack = async (query, { limit, signal }) => {
    const p = pack();
    if (!p) throw new WebError('not-configured', 'The offline encyclopedia is not downloaded yet.');
    const q = cleanQuery(query);
    if (!q) throw new WebError('bad-response', 'There was nothing to search for.');
    if (signal?.aborted) throw new WebError('aborted', 'Stopped.');
    let hits;
    try {
      hits = await p.search(q, { limit: Math.max(1, Math.min(8, Math.floor(limit) || 6)) });
    } catch {
      throw new WebError('bad-response', 'The offline encyclopedia could not be read. It may need to be downloaded again.');
    }
    // an article far below the best match is noise, not a source: it would only give the model something to be wrong about
    const best = hits[0]?.score ?? 0;
    const near = hits.filter((h) => h.score >= best * 0.35);
    const { docs, builtAt, name } = p.info;
    return { provider: 'pack', results: cleanResults(near, limit), pack: { docs, builtAt, name } };
  };
  return {
    status() {
      const c = cfg();
      const r = resolveProvider(c);
      const enabled = r.ready && live(c, r);
      return { configured: r.ready, enabled, provider: r.ready ? r.id : null, label: r.ready ? `${r.spec.label}${enabled ? '' : ' (switched off)'}` : r.reason || 'Web search is not set up' };
    },
    async search(query, { signal, limit = 6 } = {}) {
      const c = cfg();
      const r = resolveProvider(c);
      if (!live(c, r)) throw off();
      if (r.id === 'pack') return askPack(query, { limit, signal });
      return runSearch({ fetch: doFetch, cfg: c, query, limit, signal });
    },
    async read(url, { signal, maxChars = 6000 } = {}) {
      const c = cfg();
      const r = resolveProvider(c);
      if (!live(c, r)) return null;
      // (an article of the encyclopedia is read from the pack; this never touches the network)
      if (r.id === 'pack') {
        const page = await pack()?.readUrl(url).catch(() => null);
        return page ? { url: page.url, title: page.title, text: page.text.slice(0, maxChars) } : null;
      }
      return wikipediaTarget(url) ? readWikipediaPage(url, { fetch: doFetch, signal, maxChars }) : readPage(url, { fetch: doFetch, signal, maxChars });
    },
    async test() {
      const c = cfg();
      const r = resolveProvider(c);
      if (!r.ready) return { ok: false, provider: r.id, message: r.reason || 'Web search is not set up.' };
      if (r.id === 'pack') {
        const { docs } = pack().info;
        return { ok: true, provider: 'pack', message: `The offline encyclopedia is ready: ${docs.toLocaleString('en-US')} articles, on this computer.` };
      }
      if (isBuiltin(r.id) && c.builtin !== r.id) return { ok: false, provider: r.id, message: r.id === 'wikipedia' ? 'Agree to look things up on Wikipedia first.' : "Agree to use NIE's built-in search first." };
      try {
        const { results } = await runSearch({ fetch: doFetch, cfg: c, query: cleanQuery('test'), limit: 1 });
        return { ok: true, provider: r.id, message: `${r.spec.label} answered with ${results.length} result${results.length === 1 ? '' : 's'}.` };
      } catch (err) {
        return { ok: false, provider: r.id, message: err instanceof WebError ? err.message : `${r.spec.label} did not answer.` };
      }
    },
    describe(c = {}) {
      const r = resolveProvider({ ...c, pack: Boolean(pack()) });
      return { provider: r.id, detected: detectProvider({ key: c.key, baseUrl: c.baseUrl }), label: r.spec ? r.spec.label : 'Not set up' };
    },
  };
}
