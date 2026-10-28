import test from 'node:test';
import assert from 'node:assert/strict';
import { Counts, Limiter, handle } from '../services/search-gateway/worker.js';
import { PROVIDERS, resolveProvider } from '../apps/web/src/engine/web/providers.js';
import { createWebService } from '../apps/web/src/engine/web/service.js';
import { runSearch } from '../apps/web/src/engine/web/search.js';

const KEY = 'SERVER-SECRET-KEY-123456';
const INSTALL = 'b3f0c1d2-1111-4222-8333-444455556666';
const BRAVE = { web: { results: [{ title: 'Eiffel Tower', url: 'https://enc.example/eiffel', description: 'A wrought-iron tower in Paris.' }, { title: 'Plain http', url: 'http://insecure.example/x', description: 'dropped' }] } };

const ask = (path, { headers = {}, method = 'GET' } = {}) => new Request(`https://gw.example${path}`, { method, headers: { 'x-nie-install': INSTALL, 'cf-connecting-ip': '203.0.113.7', ...headers } });
const upstream = (calls = [], res = () => new Response(JSON.stringify(BRAVE), { status: 200, headers: { 'content-type': 'application/json' } })) => async (url, init) => (calls.push({ url, init }), res(url, init));
const env = (over = {}) => ({ SEARCH_API_KEY: KEY, SEARCH_PROVIDER: 'brave', ...over });
let clock = 1_800_000_000_000;
const deps = (calls, res) => ({ fetch: upstream(calls, res), now: () => clock });
const fresh = () => { clock += 3 * 24 * 60 * 60 * 1000; }; // (a new day, so counts from other tests do not apply)

// ── the happy path, and what is forwarded ────────────────────────────────────

test('a question is forwarded with the server\'s key and nothing about who asked, and the answer is the usual short list', async () => {
  fresh();
  const calls = [];
  const res = await handle(ask('/search?q=how%20tall%20is%20the%20Eiffel%20Tower&n=5', { headers: { cookie: 'a=b', authorization: 'Bearer x', 'user-agent': 'NIE/1' } }), env(), deps(calls));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal(res.headers.get('access-control-allow-origin'), null); // (called by the app, not by web pages)
  const body = await res.json();
  assert.equal(body.provider, 'nie');
  assert.deepEqual(body.results, [{ title: 'Eiffel Tower', url: 'https://enc.example/eiffel', snippet: 'A wrought-iron tower in Paris.' }]); // (the http link is dropped)
  assert.equal(calls.length, 1);
  const sent = JSON.stringify([calls[0].url, calls[0].init]);
  assert.match(calls[0].url, /^https:\/\/api\.search\.brave\.com\/res\/v1\/web\/search\?/);
  assert.equal(new URL(calls[0].url).searchParams.get('q'), 'how tall is the Eiffel Tower');
  assert.equal(calls[0].init.headers['X-Subscription-Token'], KEY);
  for (const secret of [INSTALL, '203.0.113.7', 'cookie', 'Bearer x', 'NIE/1']) assert.ok(!sent.includes(secret), `${secret} must not reach the search service`);
});

test('the owner chooses the search service with one setting, and the same adapters serve it', async () => {
  fresh();
  const calls = [];
  const tavily = JSON.stringify({ results: [{ title: 'T', url: 'https://t.example/a', content: 'c' }] });
  const res = await handle(ask('/search?q=eiffel+tower'), env({ SEARCH_PROVIDER: 'tavily' }), deps(calls, () => new Response(tavily, { status: 200 })));
  assert.equal(res.status, 200);
  assert.equal(calls[0].url, 'https://api.tavily.com/search');
  assert.equal((await res.json()).results[0].url, 'https://t.example/a');
});

// ── what it accepts ──────────────────────────────────────────────────────────

test('it accepts only GET /search with a short question, a small count and an install code', async () => {
  fresh();
  const calls = [];
  const d = deps(calls);
  const status = async (req, e = env()) => (await handle(req, e, d)).status;
  assert.equal(await status(ask('/other?q=hello')), 404);
  assert.equal(await status(ask('/search?q=hello', { method: 'POST' })), 405);
  assert.equal(await status(ask('/search')), 400);
  assert.equal(await status(ask('/search?q=a')), 400);
  assert.equal(await status(ask(`/search?q=${'x'.repeat(301)}`)), 400);
  assert.equal(await status(ask(`/search?q=${Array.from({ length: 25 }, () => 'word').join('+')}`)), 400); // (a search is a sentence or two, never a text)
  assert.equal(await status(ask('/search?q=hello+there&n=0')), 400);
  assert.equal(await status(ask('/search?q=hello+there&n=9')), 400);
  assert.equal(await status(ask('/search?q=hello+there&n=abc')), 400);
  assert.equal(await status(ask('/search?q=hello+there', { headers: { 'x-nie-install': '' } })), 400);
  assert.equal(await status(ask('/search?q=hello+there', { headers: { 'x-nie-install': 'bad code with spaces!' } })), 400);
  assert.equal(calls.length, 0, 'a refused request never reaches the search service');
  assert.equal(await status(ask('/search?q=hello+there')), 200);
});

test('with no key set, or switched off, it says it is busy and calls nothing', async () => {
  fresh();
  const calls = [];
  assert.equal((await handle(ask('/search?q=hello+there'), { SEARCH_PROVIDER: 'brave' }, deps(calls))).status, 503);
  assert.equal((await handle(ask('/search?q=hello+there'), env({ DISABLED: '1' }), deps(calls))).status, 503);
  assert.equal(calls.length, 0);
});

// ── the limits that bound the bill ───────────────────────────────────────────

test('each install code, each address and the whole service are limited per minute and per day', async () => {
  fresh();
  const d = deps([]);
  const code = (n) => `inst-${String(n).padStart(8, '0')}`;
  const go = (n, ip = '203.0.113.7', e = env()) => handle(ask('/search?q=hello+there', { headers: { 'x-nie-install': code(n), 'cf-connecting-ip': ip } }), e, d).then((r) => r.status);
  // one install: 6 a minute, then busy; a minute later it works again
  for (let i = 0; i < 6; i++) assert.equal(await go(1, `198.51.100.${i}`), 200);
  assert.equal(await go(1, '198.51.100.99'), 429);
  clock += 61_000;
  assert.equal(await go(1, '198.51.100.98'), 200);
  // one address: 20 a minute across many install codes
  fresh();
  for (let i = 0; i < 20; i++) assert.equal(await go(100 + i, '192.0.2.50'), 200, `request ${i}`);
  assert.equal(await go(200, '192.0.2.50'), 429);
  assert.equal(await go(201, '192.0.2.51'), 200, 'another address is not affected');
  // the whole service: a daily cap
  fresh();
  const small = env({ DAILY_CAP: '3' });
  for (let i = 0; i < 3; i++) assert.equal(await go(300 + i, `192.0.2.${100 + i}`, small), 200);
  assert.equal(await go(310, '192.0.2.120', small), 429);
  clock += 25 * 60 * 60 * 1000;
  assert.equal(await go(311, '192.0.2.121', small), 200, 'the next day starts again');
});

test('the count store drops old windows and answers within the limit', () => {
  const c = new Counts();
  assert.deepEqual([1, 2, 3, 4].map(() => c.hit('k', 3, 60_000, 1_000)), [true, true, true, false]);
  assert.equal(c.hit('k', 3, 60_000, 1_000 + 60_000), true);
  for (let i = 0; i < 6000; i++) c.hit(`x${i}`, 1, 60_000, 1_000);
  c.hit('later', 1, 60_000, 1_000 + 10 * 60_000);
  assert.ok(c.store.size < 6000);
});

test('the Durable Object keeps day counts in storage and minute counts in memory', async () => {
  const store = new Map();
  const state = { storage: { get: async (k) => store.get(k), put: async (k, v) => store.set(k, v) } };
  const lim = new Limiter(state);
  const hit = async (key, limit, windowMs) => (await lim.fetch(new Request('https://limiter/hit', { method: 'POST', body: JSON.stringify({ key, limit, windowMs }) }))).json();
  assert.deepEqual([await hit('all', 2, 86_400_000), await hit('all', 2, 86_400_000), await hit('all', 2, 86_400_000)].map((r) => r.ok), [true, true, false]);
  assert.ok([...store.keys()].some((k) => k.startsWith('all|')));
  const again = new Limiter(state); // (a restart does not give the day back)
  assert.equal((await (await again.fetch(new Request('https://limiter/hit', { method: 'POST', body: JSON.stringify({ key: 'all', limit: 2, windowMs: 86_400_000 }) }))).json()).ok, false);
});

// ── failure never leaks, and nothing is logged ───────────────────────────────

test('when the search service fails the writer is told only "busy" or "unavailable", never the key or the service\'s words', async () => {
  fresh();
  const logs = [];
  const orig = { log: console.log, error: console.error, warn: console.warn };
  console.log = console.error = console.warn = (...a) => logs.push(a.join(' '));
  try {
    for (const [status, expected] of [[401, 503], [403, 503], [429, 503], [500, 502]]) {
      const res = await handle(ask('/search?q=hello+there', { headers: { 'x-nie-install': `inst-${status}-0000000` } }), env(), deps([], () => new Response(`upstream says key ${KEY} is wrong`, { status })));
      assert.equal(res.status, expected, `upstream ${status}`);
      const text = await res.text();
      assert.ok(!text.includes(KEY) && !/upstream|brave|wrong/i.test(text), text);
    }
    const down = await handle(ask('/search?q=hello+there', { headers: { 'x-nie-install': 'inst-down-0000000' } }), env(), { fetch: async () => { throw new Error(`connect ECONNREFUSED ${KEY}`); }, now: () => clock });
    assert.equal(down.status, 502);
    assert.ok(!(await down.text()).includes(KEY));
    await handle(ask('/search?q=a+private+question+about+my+novel'), env(), deps([]));
  } finally {
    Object.assign(console, orig);
  }
  assert.deepEqual(logs, [], 'the gateway logs nothing: not the question, not the install code');
});

// ── the app's side of the same contract ──────────────────────────────────────

test('the app talks to the gateway with the question and an install code only, and reads its answer', async () => {
  const seen = [];
  const body = { provider: 'nie', results: [{ title: 'Eiffel Tower', url: 'https://enc.example/eiffel', snippet: 'A tower.' }] };
  const out = await runSearch({
    fetch: async (url, init) => (seen.push({ url, init }), new Response(JSON.stringify(body), { status: 200 })),
    cfg: { provider: 'auto', key: '', gatewayUrl: 'https://gw.example', installId: INSTALL },
    query: 'how tall is the Eiffel Tower',
    limit: 6,
  });
  assert.equal(out.provider, 'nie');
  assert.equal(out.results.length, 1);
  assert.equal(new URL(seen[0].url).origin + new URL(seen[0].url).pathname, 'https://gw.example/search');
  assert.equal(new URL(seen[0].url).searchParams.get('q'), 'how tall is the Eiffel Tower');
  assert.equal(new URL(seen[0].url).searchParams.get('n'), '6');
  assert.deepEqual(Object.keys(seen[0].init.headers).sort(), ['Accept', 'X-NIE-Install']);
  assert.equal(seen[0].init.headers['X-NIE-Install'], INSTALL);
});

test('the built-in search is used only when the writer has no key of their own, and only after they agreed', async () => {
  const base = { gatewayUrl: 'https://gw.example', installId: INSTALL };
  assert.equal(resolveProvider({ ...base, provider: 'auto', key: '' }).id, 'nie');
  assert.equal(resolveProvider({ ...base, provider: 'auto', key: 'tvly-own' }).id, 'tavily', 'their own key always wins');
  assert.equal(resolveProvider({ ...base, provider: 'brave', key: '' }).ready, false, 'a service they chose by name is never swapped for the built-in one');
  assert.equal(resolveProvider({ provider: 'auto', key: '' }).id, 'wikipedia', 'a build with no gateway has the keyless Wikipedia search');
  assert.equal(resolveProvider({ provider: 'auto', gatewayUrl: 'http://gw.example', installId: INSTALL }).id, 'wikipedia', 'a gateway over plain http is not used');
  assert.equal(PROVIDERS.nie.needsKey, false);

  let calls = 0;
  let cfg = { ...base, provider: 'auto', key: '', enabled: true, builtin: '' };
  const svc = createWebService({ fetch: async () => (calls++, new Response(JSON.stringify({ results: [{ title: 'T', url: 'https://t.example/a', snippet: 's' }] }), { status: 200 })), getConfig: () => cfg });
  assert.deepEqual(svc.status(), { configured: true, enabled: false, provider: 'nie', label: 'NIE search (switched off)' }); // (on, but not agreed)
  await assert.rejects(svc.search('hello there'), (e) => e.kind === 'not-configured');
  assert.equal(await svc.read('https://t.example/a'), null);
  assert.match((await svc.test()).message, /Agree to use NIE's built-in search first/);
  assert.equal(calls, 0, 'nothing leaves before the writer agrees');
  cfg = { ...cfg, builtin: 'nie' };
  assert.deepEqual(svc.status(), { configured: true, enabled: true, provider: 'nie', label: 'NIE search' });
  assert.equal((await svc.search('hello there')).results.length, 1);
  cfg = { ...cfg, key: 'tvly-own', builtin: '' }; // their own key needs no agreement to a built-in service
  assert.deepEqual(svc.status(), { configured: true, enabled: true, provider: 'tavily', label: 'Tavily' });
});

test('a busy gateway is reported to the writer in plain words', async () => {
  const cfg = { provider: 'auto', key: '', gatewayUrl: 'https://gw.example', installId: INSTALL };
  for (const status of [429, 503]) {
    await assert.rejects(runSearch({ fetch: async () => new Response('{}', { status }), cfg, query: 'hello there' }), (e) => e.kind === 'rate' && /busy right now/.test(e.message) && /your own search key/.test(e.message));
  }
  await assert.rejects(runSearch({ fetch: async () => new Response('{}', { status: 502 }), cfg, query: 'hello there' }), (e) => e.kind === 'network');
});
