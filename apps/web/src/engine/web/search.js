import { WebError } from './errors.js';
import { PROVIDERS, SEARCH_LIMIT_MAX, resolveProvider } from './providers.js';

/** Running one search and cleaning what comes back into a short list of { title, url, snippet } that is safe to show and to link. */

const SEARCH_TIMEOUT_MS = 12000;
const MAX_JSON_BYTES = 2_000_000;
const TITLE_CHARS = 140;
const SNIPPET_CHARS = 420;
const TRACKING = /^(?:utm_[a-z]+|fbclid|gclid|mc_cid|mc_eid|ref|ref_src|igshid)$/i;

const stripTags = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const shorten = (s, n) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…`);

/** The search words that leave the computer: whitespace collapsed, no control characters, capped. */
export function cleanQuery(q) {
  return String(q ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
}

const keyOfUrl = (u) => {
  const p = new URL(u);
  for (const k of [...p.searchParams.keys()]) if (TRACKING.test(k)) p.searchParams.delete(k);
  return `${p.hostname.replace(/^www\./, '')}${p.pathname.replace(/\/+$/, '')}${p.search}`.toLowerCase();
};

/** https links only, no tracking parameters, no duplicates, short titles and snippets. */
export function cleanResults(list, limit = 6) {
  const seen = new Set();
  const out = [];
  for (const r of Array.isArray(list) ? list : []) {
    let href;
    try {
      const u = new URL(String(r?.url ?? ''));
      if (u.protocol !== 'https:' || u.username || u.password) continue;
      for (const k of [...u.searchParams.keys()]) if (TRACKING.test(k)) u.searchParams.delete(k);
      u.hash = '';
      href = u.href;
    } catch {
      continue;
    }
    const k = keyOfUrl(href);
    if (seen.has(k)) continue;
    seen.add(k);
    const title = shorten(stripTags(r.title), TITLE_CHARS) || new URL(href).hostname.replace(/^www\./, '');
    const snippet = shorten(stripTags(r.snippet), SNIPPET_CHARS);
    out.push({ title, url: href, snippet });
    if (out.length >= limit) break;
  }
  return out;
}

async function readJson(res) {
  if (!res.body?.getReader) return JSON.parse(await res.text());
  const reader = res.body.getReader();
  const parts = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_JSON_BYTES) {
      await reader.cancel().catch(() => {});
      throw new Error('too large');
    }
    parts.push(value);
  }
  const bytes = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    bytes.set(p, at);
    at += p.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

/**
 * @param {{ fetch: typeof fetch, cfg: object, query: string, limit?: number, signal?: AbortSignal, timeoutMs?: number }} o
 * @returns {Promise<{ provider: string, results: { title: string, url: string, snippet: string }[] }>}
 */
export async function runSearch({ fetch: doFetch, cfg, query, limit = 6, signal, timeoutMs = SEARCH_TIMEOUT_MS }) {
  const q = cleanQuery(query);
  if (!q) throw new WebError('bad-response', 'There was nothing to search for.');
  const { id, spec, ready, reason } = resolveProvider(cfg);
  if (!ready) throw new WebError('not-configured', reason || 'Web search is not set up.');
  const n = Math.max(1, Math.min(SEARCH_LIMIT_MAX, Math.floor(limit) || 6));
  const key = String(cfg.key ?? '').trim();
  const keyIsAddress = /^https?:\/\//i.test(key);
  const req = spec.build({ query: q, key: keyIsAddress ? '' : key, limit: n, baseUrl: keyIsAddress ? key : cfg.baseUrl, custom: cfg.custom });
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  const onAbort = () => ctl.abort();
  signal?.addEventListener('abort', onAbort, { once: true });
  if (signal?.aborted) ctl.abort();
  try {
    let res;
    try {
      res = await doFetch(req.url, { method: req.method, headers: req.headers, body: req.body, redirect: 'follow', signal: ctl.signal });
    } catch (err) {
      if (signal?.aborted) throw new WebError('aborted', 'Stopped.');
      throw new WebError('network', ctl.signal.aborted ? `${spec.label} did not answer in time.` : `Could not reach ${spec.label}. Check the internet connection and the address.`);
    }
    if (res.status === 401 || res.status === 403) throw new WebError('auth', id === 'searxng' ? 'The SearXNG instance refused the request. JSON output must be switched on in its settings, and it must allow this address.' : `${spec.label} did not accept the key. Check it in Settings.`);
    if (res.status === 429) throw new WebError('rate', `${spec.label} says the limit for this key has been reached. Try again later.`);
    if (!res.ok) throw new WebError(res.status >= 500 ? 'network' : 'bad-response', `${spec.label} answered with an error (${res.status}).`);
    let json;
    try {
      json = await readJson(res);
    } catch {
      throw new WebError('bad-response', `${spec.label} answered, but not with results NIE could read.`);
    }
    const results = cleanResults(spec.parse(json, { custom: cfg.custom }), n);
    return { provider: id, results };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

export { PROVIDERS };
