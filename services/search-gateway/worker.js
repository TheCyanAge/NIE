import { runSearch } from '../../apps/web/src/engine/web/search.js';
import { WebError } from '../../apps/web/src/engine/web/errors.js';

/**
 * NIE's search gateway. The installer of NIE carries this service's ADDRESS, never a search key: the key is a server secret held here (SEARCH_API_KEY), so nobody who
 * downloads NIE can take it. NIE sends the words of one question and a random install code; this forwards the words to the search service the owner chose (SEARCH_PROVIDER:
 * brave, tavily or serper) and answers with the same short list of { title, url, snippet } every NIE search uses.
 *
 * What it does to protect the owner's bill and the writers' privacy:
 *  - it accepts one thing only: GET /search?q=<2 to 300 characters, at most 24 words>&n=<1 to 8> with an install code in X-NIE-Install;
 *  - it limits each install code, each network address and the whole service (per minute and per day), and can be switched off at once (DISABLED=1);
 *  - it never logs, stores or forwards the question's author: no address, no install code and no header goes to the search service, only the words and the key;
 *  - it adds no cross-origin permission (it is called by the app, not by web pages) and tells nothing about the key or the upstream service when something fails.
 * An install code is not a secret and is not an account: a determined person can make many. The limits per address and the daily cap are what bound the cost.
 */

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const MAX_WORDS = 24;
const INSTALL_CODE = /^[A-Za-z0-9-]{8,64}$/;
const DEFAULTS = { PER_INSTALL_PER_MIN: 6, PER_INSTALL_PER_DAY: 60, PER_IP_PER_MIN: 20, PER_IP_PER_DAY: 200, DAILY_CAP: 3000 };

const number = (v, fallback) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : fallback);
const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });
const refuse = (status, error) => json({ error }, status);

/** Counting by window. A plain Map here; the Durable Object below keeps the same counts for the whole service. */
export class Counts {
  constructor(store = new Map()) {
    this.store = store;
  }

  /** Counts this hit and says whether it is within `limit` for the current window. */
  hit(key, limit, windowMs, now) {
    const slot = Math.floor(now / windowMs);
    const k = `${key}|${windowMs}|${slot}`;
    const n = (this.store.get(k) ?? 0) + 1;
    this.store.set(k, n);
    if (this.store.size > 5000) {
      for (const old of this.store.keys()) {
        const [, w, s] = old.split('|').slice(-3);
        if (Number(s) < Math.floor(now / Number(w)) - 1) this.store.delete(old);
      }
    }
    return n <= limit;
  }
}

/** The counts for the whole service live in one Durable Object so every request sees the same numbers. Day counts are kept in its storage so a restart does not give the day back. */
export class Limiter {
  constructor(state) {
    this.state = state;
    this.counts = new Counts();
  }

  async fetch(request) {
    const { key, limit, windowMs } = await request.json();
    const now = Date.now();
    if (windowMs >= DAY) {
      const slot = Math.floor(now / windowMs);
      const stored = `${key}|${slot}`;
      const n = ((await this.state.storage.get(stored)) ?? 0) + 1;
      await this.state.storage.put(stored, n);
      return Response.json({ ok: n <= limit });
    }
    return Response.json({ ok: this.counts.hit(key, limit, windowMs, now) });
  }
}

const memory = new Counts();
function limiterFor(env, now) {
  if (env.LIMITER) {
    const stub = env.LIMITER.get(env.LIMITER.idFromName('nie'));
    return async (key, limit, windowMs) => {
      const res = await stub.fetch('https://limiter/hit', { method: 'POST', body: JSON.stringify({ key, limit, windowMs }) });
      return (await res.json()).ok === true;
    };
  }
  return async (key, limit, windowMs) => memory.hit(key, limit, windowMs, now());
}

/** @param {Request} request @param {object} env @param {{ fetch?: Function, now?: () => number }} deps */
export async function handle(request, env = {}, { fetch: doFetch = globalThis.fetch, now = Date.now } = {}) {
  const url = new URL(request.url);
  if (url.pathname !== '/search') return refuse(404, 'not found');
  if (request.method !== 'GET') return refuse(405, 'method not allowed');
  if (String(env.DISABLED ?? '') === '1') return refuse(503, 'busy');

  const q = (url.searchParams.get('q') ?? '').replace(/\s+/g, ' ').trim();
  const words = q.split(' ').filter(Boolean).length;
  if (q.length < 2 || q.length > 300 || words > MAX_WORDS || /[\u0000-\u001f\u007f]/.test(q)) return refuse(400, 'bad question');
  const rawN = url.searchParams.get('n');
  const n = rawN === null ? 5 : Number(rawN);
  if (!Number.isInteger(n) || n < 1 || n > 8) return refuse(400, 'bad count');
  const install = request.headers.get('x-nie-install') ?? '';
  if (!INSTALL_CODE.test(install)) return refuse(400, 'bad install code');
  if (!env.SEARCH_API_KEY) return refuse(503, 'busy');

  const lim = (k, d) => number(env[k], d);
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const hit = limiterFor(env, now);
  const checks = [
    [`i:${install}`, lim('PER_INSTALL_PER_MIN', DEFAULTS.PER_INSTALL_PER_MIN), MINUTE],
    [`i:${install}`, lim('PER_INSTALL_PER_DAY', DEFAULTS.PER_INSTALL_PER_DAY), DAY],
    [`p:${ip}`, lim('PER_IP_PER_MIN', DEFAULTS.PER_IP_PER_MIN), MINUTE],
    [`p:${ip}`, lim('PER_IP_PER_DAY', DEFAULTS.PER_IP_PER_DAY), DAY],
    ['all', lim('DAILY_CAP', DEFAULTS.DAILY_CAP), DAY],
  ];
  for (const [key, limit, windowMs] of checks) if (!(await hit(key, limit, windowMs))) return refuse(429, 'busy');

  try {
    // only the words and the key go on: no address, no install code, no header of the writer's
    const { provider, results } = await runSearch({ fetch: doFetch, cfg: { provider: env.SEARCH_PROVIDER || 'brave', key: env.SEARCH_API_KEY }, query: q, limit: n, timeoutMs: 8000 });
    return json({ provider: 'nie', via: provider, results });
  } catch (err) {
    if (err instanceof WebError && (err.kind === 'network' || err.kind === 'aborted')) return refuse(502, 'unavailable');
    return refuse(503, 'busy'); // a refused key, a spent allowance or a service that answered badly: all the same to the writer
  }
}

export default {
  fetch: (request, env) => handle(request, env),
};
