import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createWebSettings, readGatewayUrl, WEB_PROVIDERS } from '../apps/desktop/src/web-settings.js';
import { createWebService } from '../apps/web/src/engine/web/service.js';
import { WebError } from '../apps/web/src/engine/web/errors.js';

// The main-process side of web search, tested without Electron: preferences, safeStorage and fetch are all fakes.

const BRAVE_KEY = 'BSAsecret-key-0123456789';
const BRAVE_BODY = { web: { results: [{ title: 'The Great Fire', url: 'https://example.org/fire?utm_source=x', description: 'London burned in 1666.' }, { title: 'A plain http page', url: 'http://example.org/old', description: 'Dropped: not https.' }] } };

const GATEWAY = 'https://nie-search.example.workers.dev';
const GATEWAY_BODY = { results: [{ title: 'The Great Fire', url: 'https://example.org/fire?utm_source=x', snippet: 'London burned in 1666.' }, { title: 'Dropped: not https', url: 'http://example.org/old', snippet: 'Old.' }] };

/** `gatewayUrl` gives the build a built-in search; `start` is the preferences file as it already is; `config()` is what the service reads (inside the main process only). */
function desk({ encryption = true, fetchImpl = null, createService = createWebService, gatewayUrl = '', makeId = undefined, start = {} } = {}) {
  let prefs = start;
  let readConfig = null;
  const calls = [];
  const safeStorage = {
    isEncryptionAvailable: () => encryption,
    encryptString: (s) => Buffer.from(`enc:${s.split('').reverse().join('')}`),
    decryptString: (b) => b.toString().replace(/^enc:/, '').split('').reverse().join(''),
  };
  const fetchFake = fetchImpl ?? (async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(String(url).startsWith(GATEWAY) ? GATEWAY_BODY : BRAVE_BODY), { status: 200, headers: { 'content-type': 'application/json' } });
  });
  const web = createWebSettings({
    readPrefs: () => prefs,
    writePrefs: (patch) => (prefs = { ...prefs, ...patch }),
    safeStorage,
    createService: (opts) => ((readConfig = opts.getConfig), createService(opts)),
    fetch: fetchFake,
    gatewayUrl,
    makeId,
  });
  return { web, calls, prefs: () => prefs, config: () => readConfig() };
}

test('a fresh install has web search off, with no key, and says so', () => {
  const { web } = desk();
  const c = web.get();
  assert.equal(c.enabled, false);
  assert.equal(c.provider, 'auto');
  assert.equal(c.detected, null);
  assert.equal(c.hasKey, false);
  assert.equal(c.keyStoredSecurely, true);
  assert.equal(c.custom.method, 'GET');
  assert.equal(c.custom.headerPrefix, 'Bearer ', 'the prefix keeps its space');
  const { label, ...rest } = web.status();
  assert.deepEqual(rest, { configured: false, enabled: false, provider: null });
  assert.match(label, /not tell which|not set up/i);
});

test('the key is stored encrypted, detected for Automatic, and never comes back to the page', async () => {
  const { web, prefs } = desk();
  const saved = web.set({ enabled: true, provider: 'auto', baseUrl: '', apiKey: BRAVE_KEY });
  assert.equal(saved.hasKey, true);
  assert.equal(saved.detected, 'brave');
  assert.equal(saved.enabled, true);
  // on disk: encrypted, not the plaintext key
  assert.equal(prefs().web.encrypted, true);
  assert.ok(!JSON.stringify(prefs()).includes(BRAVE_KEY));
  // to the page: nothing that contains it, whatever it asks
  for (const out of [web.get(), saved, web.status(), await web.search('great fire of london'), await web.test()]) assert.ok(!JSON.stringify(out).includes(BRAVE_KEY));
  assert.deepEqual(web.status(), { configured: true, enabled: true, provider: 'brave', label: 'Brave Search' });
});

test('saving without a key keeps the saved one; "clear" removes it; without OS encryption the page is told it is not secure', () => {
  const { web, prefs } = desk();
  web.set({ enabled: true, provider: 'brave', apiKey: BRAVE_KEY });
  const kept = web.set({ enabled: false, provider: 'brave' });
  assert.equal(kept.hasKey, true);
  assert.equal(kept.enabled, false);
  assert.equal(web.set({ enabled: false, provider: 'brave', clearKey: true }).hasKey, false);
  assert.equal(prefs().web.key, undefined);

  const plain = desk({ encryption: false });
  const c = plain.web.set({ enabled: true, provider: 'brave', apiKey: BRAVE_KEY });
  assert.equal(c.hasKey, true);
  assert.equal(c.keyStoredSecurely, false);
  assert.equal(plain.prefs().web.encrypted, false);
  assert.ok(!JSON.stringify(c).includes(BRAVE_KEY));
});

test('a search goes out with the key the page never saw, comes back cleaned, and is refused while the setting is off', async () => {
  const { web, calls } = desk();
  web.set({ enabled: false, provider: 'brave', apiKey: BRAVE_KEY });
  const off = await web.search('great fire of london');
  assert.equal(off.error.kind, 'not-configured');
  assert.equal(calls.length, 0, 'nothing is sent while it is off');

  web.set({ enabled: true, provider: 'brave' });
  const res = await web.search('great fire of london', { limit: 3 });
  assert.equal(res.provider, 'brave');
  assert.deepEqual(res.results.map((r) => r.url), ['https://example.org/fire'], 'https only, tracking removed');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.headers['X-Subscription-Token'], BRAVE_KEY);
  assert.match(calls[0].url, /q=great\+fire\+of\+london/);
});

test('a failed search crosses as { error: { kind, message } } with a kind the page knows, and the key is removed from any message', async () => {
  const unauthorised = desk({ fetchImpl: async () => new Response('no', { status: 401 }) });
  unauthorised.web.set({ enabled: true, provider: 'brave', apiKey: BRAVE_KEY });
  const r = await unauthorised.web.search('anything');
  assert.deepEqual(Object.keys(r), ['error']);
  assert.equal(r.error.kind, 'auth');
  assert.match(r.error.message, /did not accept the key/);

  const offline = desk({ fetchImpl: async () => { throw new TypeError('fetch failed'); } });
  offline.web.set({ enabled: true, provider: 'brave', apiKey: BRAVE_KEY });
  assert.equal((await offline.web.search('anything')).error.kind, 'network');

  // a service that echoed the key, and one that threw something that is not a WebError
  const leaky = desk({ createService: () => ({ describe: () => ({}), status: () => ({}), search: async () => { throw new WebError('auth', `rejected ${BRAVE_KEY} for this account`); }, test: async () => ({ ok: false, provider: 'brave', message: `bad ${BRAVE_KEY}` }), read: async () => null }) });
  leaky.web.set({ enabled: true, provider: 'brave', apiKey: BRAVE_KEY });
  const e = (await leaky.web.search('x')).error;
  assert.equal(e.kind, 'auth');
  assert.ok(!e.message.includes(BRAVE_KEY));
  assert.ok(!(await leaky.web.test()).message.includes(BRAVE_KEY));
  const odd = desk({ createService: () => ({ describe: () => ({}), status: () => ({}), search: async () => { throw new Error('boom'); }, test: async () => { throw new Error('boom'); }, read: async () => { throw new Error('boom'); } }) });
  odd.web.set({ enabled: true, provider: 'brave', apiKey: BRAVE_KEY });
  assert.equal((await odd.web.search('x')).error.kind, 'network');
  assert.deepEqual(await odd.web.test(), { ok: false, provider: null, message: 'boom' });
  assert.equal(await odd.web.read('https://example.org/'), null, 'a page that can not be read is null, never a throw');
});

test('test() reports the service, and read() hands over only url, title and text', async () => {
  const { web } = desk();
  web.set({ enabled: true, provider: 'brave', apiKey: BRAVE_KEY });
  const t = await web.test();
  assert.equal(t.ok, true);
  assert.equal(t.provider, 'brave');
  assert.match(t.message, /Brave Search answered with 1 result/);

  const fake = desk({ createService: () => ({ describe: () => ({}), status: () => ({}), search: async () => ({}), test: async () => ({}), read: async (url) => ({ url, title: 'T', text: 'The text.', secret: 'nope' }) }) });
  assert.deepEqual(await fake.web.read('https://example.org/a'), { url: 'https://example.org/a', title: 'T', text: 'The text.' });
  assert.equal(await fake.web.read(42), null);
});

test('the Custom description keeps only its known fields, as short strings, and an unknown provider falls back to Automatic', () => {
  const { web, prefs } = desk();
  const c = web.set({
    enabled: true, provider: 'not-a-service', baseUrl: '  https://search.example.org  ',
    custom: { method: 'DELETE', url: ' https://api.example.com/s?q={query} ', headerName: 'X-Api-Key', headerPrefix: 'Token ', bodyTemplate: '{"q":"{query}"}', resultsPath: 'data.items', titleKey: 'name', urlKey: 'link', snippetKey: 'summary', evil: 'x', extra: { a: 1 } },
  });
  assert.equal(c.provider, 'auto');
  assert.equal(c.baseUrl, 'https://search.example.org');
  assert.equal(c.custom.method, 'GET', 'only GET or POST');
  assert.equal(c.custom.url, 'https://api.example.com/s?q={query}');
  assert.equal(c.custom.headerPrefix, 'Token ', 'a prefix keeps its trailing space');
  assert.deepEqual(Object.keys(c.custom).sort(), ['bodyTemplate', 'headerName', 'headerPrefix', 'method', 'resultsPath', 'snippetKey', 'titleKey', 'url', 'urlKey']);
  assert.equal(prefs().web.custom.evil, undefined);
  // a field not sent keeps what was saved; a field sent empty is empty
  const again = web.set({ enabled: true, provider: 'custom', custom: { method: 'POST', headerPrefix: '' } });
  assert.equal(again.custom.url, 'https://api.example.com/s?q={query}');
  assert.equal(again.custom.method, 'POST');
  assert.equal(again.custom.headerPrefix, '');
  const long = web.set({ enabled: true, provider: 'custom', custom: { url: 'https://x.example/?q={query}' + 'a'.repeat(5000), headerName: 'h'.repeat(500) } });
  assert.ok(long.custom.url.length <= 2000 && long.custom.headerName.length <= 100);
});

test('every provider the Settings list offers is one the main process accepts', () => {
  assert.deepEqual(WEB_PROVIDERS, ['auto', 'tavily', 'brave', 'serper', 'searxng', 'custom']);
  const { web } = desk();
  for (const p of WEB_PROVIDERS) assert.equal(web.set({ enabled: true, provider: p }).provider, p);
});

// ── NIE's built-in search: the address the build carries, the install code, and the writer's agreement ──

test('the address of the built-in search is read from the build file: only an https address counts, anything else means this build has none', () => {
  const file = (text) => () => text;
  assert.equal(readGatewayUrl(file('{ "url": "https://nie-search.example.workers.dev" }')), 'https://nie-search.example.workers.dev');
  assert.equal(readGatewayUrl(file('{ "url": "  https://nie-search.example.workers.dev/  " }')), 'https://nie-search.example.workers.dev/', 'trimmed');
  const none = ['{ "url": "" }', '{}', '{ "url": null }', '{ "url": 42 }', '{ "url": "http://nie-search.example.workers.dev" }', '{ "url": "ftp://nie-search.example.workers.dev" }',
    '{ "url": "https://user:pass@nie-search.example.workers.dev" }', '{ "url": "not a url" }', '{ "url": "javascript:alert(1)" }', 'not json', '', 'null', '[]'];
  for (const bad of none) assert.equal(readGatewayUrl(file(bad)), '', bad);
  assert.equal(readGatewayUrl(() => { throw new Error('ENOENT: no such file or directory'); }), '', 'a missing file is no built-in search, never a crash');
});

test('the build file in the repository is well formed (a release fills in the address), and the package includes it', () => {
  const read = (rel) => fs.readFileSync(new URL(`../apps/desktop/${rel}`, import.meta.url), 'utf8');
  const file = JSON.parse(read('search-gateway.json'));
  assert.deepEqual(Object.keys(file), ['url']);
  assert.equal(typeof file.url, 'string');
  assert.ok(file.url === '' || readGatewayUrl(() => read('search-gateway.json')) === file.url, 'empty, or an https address');
  assert.ok(JSON.parse(read('package.json')).build.files.includes('search-gateway.json'), 'electron-builder packs it beside main.js');
});

test('a build with no built-in search is exactly as before: nothing to agree to, and "on" stays on', () => {
  const { web } = desk();
  const c = web.set({ enabled: true, provider: 'auto' });
  assert.deepEqual([c.gateway, c.builtin, c.usingBuiltin], [false, false, false]);
  assert.equal(c.enabled, true);
  assert.deepEqual(web.status(), { configured: false, enabled: false, provider: null, label: 'NIE can not tell which search service this key is for. Choose the service in Settings.' });
  assert.equal(web.set({ enabled: true, provider: 'auto', builtin: true }).builtin, true, 'the agreement is recorded, but there is nothing for it to switch on');
  assert.equal(web.status().configured, false);
});

test('the install code is made once, kept with the preferences, and survives every save, a restart and the key being removed', () => {
  let made = 0;
  const first = desk({ gatewayUrl: GATEWAY, makeId: () => `0000000${++made}-0000-4000-8000-000000000000` });
  const id = first.config().installId;
  assert.equal(id, '00000001-0000-4000-8000-000000000000');
  assert.equal(first.prefs().web.installId, id);
  first.web.get();
  first.web.status();
  first.web.set({ enabled: false, provider: 'auto' });
  first.web.set({ enabled: true, provider: 'brave', apiKey: BRAVE_KEY });
  first.web.set({ enabled: false, provider: 'auto', clearKey: true });
  assert.equal(first.config().installId, id);
  assert.equal(first.prefs().web.installId, id);
  assert.equal(made, 1, 'made once');
  const again = desk({ gatewayUrl: GATEWAY, start: first.prefs(), makeId: () => assert.fail('a saved code is never replaced') });
  assert.equal(again.config().installId, id, 'a restart keeps it');

  assert.match(desk({ gatewayUrl: GATEWAY }).config().installId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/, 'a random UUID by default');
  const damaged = desk({ gatewayUrl: GATEWAY, start: { web: { installId: 'not a valid code!' } } });
  assert.match(damaged.config().installId, /^[A-Za-z0-9-]{8,64}$/, 'a damaged code is replaced by a valid one');
});

test('a preferences file that can not be written still gives one steady install code for the session', () => {
  let made = 0;
  let readConfig = null;
  createWebSettings({ readPrefs: () => ({}), writePrefs: () => { throw new Error('EACCES'); }, safeStorage: { isEncryptionAvailable: () => true }, fetch: async () => { throw new Error('no network'); }, gatewayUrl: GATEWAY, makeId: () => `code-${++made}-abcdefgh`,
    createService: ({ getConfig }) => ((readConfig = getConfig), { describe: () => ({}) }) });
  assert.equal(readConfig().installId, 'code-1-abcdefgh');
  assert.equal(readConfig().installId, 'code-1-abcdefgh');
  assert.equal(made, 1);
});

test('without a key of their own, the built-in search is ready but runs only after the writer agrees; the page is told where that stands, never the address or the code', async () => {
  const { web, calls, prefs, config } = desk({ gatewayUrl: GATEWAY });
  const fresh = web.get();
  assert.deepEqual([fresh.gateway, fresh.builtin, fresh.usingBuiltin, fresh.hasKey, fresh.detected], [true, false, true, false, null]);
  assert.deepEqual(web.status(), { configured: true, enabled: false, provider: 'nie', label: 'NIE search (switched off)' });

  // turning web search on without having agreed is stored as off
  const unagreed = web.set({ enabled: true, provider: 'auto' });
  assert.equal(unagreed.enabled, false);
  assert.equal(prefs().web.enabled, false);
  assert.equal(web.status().enabled, false);
  assert.deepEqual(await web.search('great fire of london'), { error: { kind: 'not-configured', message: 'Web search is switched off in Settings.' } });
  assert.equal(calls.length, 0, 'nothing is sent before the writer agrees');
  assert.deepEqual(await web.test(), { ok: false, provider: 'nie', message: "Agree to use NIE's built-in search first." });
  assert.equal(calls.length, 0);

  // agreeing: web search is on, and the question goes to the service with the install code
  const agreed = web.set({ enabled: true, provider: 'auto', builtin: true });
  assert.deepEqual([agreed.enabled, agreed.builtin, agreed.usingBuiltin], [true, true, true]);
  assert.deepEqual(web.status(), { configured: true, enabled: true, provider: 'nie', label: 'NIE search' });
  const res = await web.search('great fire of london', { limit: 3 });
  assert.equal(res.provider, 'nie');
  assert.deepEqual(res.results.map((r) => r.url), ['https://example.org/fire'], 'https only, tracking removed');
  assert.equal(calls.length, 1);
  const url = new URL(calls[0].url);
  assert.equal(`${url.origin}${url.pathname}`, `${GATEWAY}/search`);
  assert.equal(url.searchParams.get('q'), 'great fire of london');
  assert.equal(calls[0].init.headers['X-NIE-Install'], config().installId);
  assert.ok(!Object.keys(calls[0].init.headers).some((h) => /authorization|key|token/i.test(h)), 'no key of any kind goes to the service');

  // nothing the page can ask for holds the code or the address
  const outputs = [fresh, unagreed, agreed, web.get(), web.status(), res, await web.test(), await web.read('https://example.org/fire')];
  for (const out of outputs) assert.ok(!JSON.stringify(out).includes(config().installId) && !JSON.stringify(out).includes('workers.dev'), JSON.stringify(out));
});

test('the rule in set(): with no key or address of their own, "on" needs the agreement, and taking the agreement back switches the built-in search off', () => {
  const { web, prefs } = desk({ gatewayUrl: GATEWAY });
  assert.equal(web.set({ enabled: true, builtin: true }).enabled, true);
  assert.equal(web.set({ enabled: true }).builtin, true, 'an agreement that is not mentioned is kept');
  assert.equal(web.get().enabled, true);
  const withdrawn = web.set({ enabled: true, builtin: false });
  assert.deepEqual([withdrawn.enabled, withdrawn.builtin, withdrawn.usingBuiltin], [false, false, true]);
  assert.equal(prefs().web.enabled, false);
  assert.equal(web.set({ enabled: true, builtin: 'yes' }).enabled, false, 'only true agrees');
  assert.equal(web.set({ enabled: true, builtin: 1 }).builtin, false);
  assert.equal(web.set({ enabled: false, builtin: true }).enabled, false, 'agreeing does not by itself turn web search on');
  assert.equal(web.get().builtin, true);
});

test('a key or address of the writer\'s own always runs instead, needs no agreement, and is never swapped for the built-in search', async () => {
  const { web, calls } = desk({ gatewayUrl: GATEWAY });
  const own = web.set({ enabled: true, provider: 'auto', apiKey: BRAVE_KEY });
  assert.deepEqual([own.enabled, own.builtin, own.usingBuiltin, own.detected], [true, false, false, 'brave']);
  assert.deepEqual(web.status(), { configured: true, enabled: true, provider: 'brave', label: 'Brave Search' });
  await web.search('great fire of london');
  assert.match(calls[0].url, /^https:\/\/api\.search\.brave\.com\//);
  assert.equal(calls.length, 1);
  assert.ok(!JSON.stringify(calls[0].init.headers).includes('X-NIE-Install'), 'the code goes only to the built-in search');

  // agreeing while their own key runs changes nothing about what runs...
  const both = web.set({ enabled: true, provider: 'auto', builtin: true });
  assert.deepEqual([both.builtin, both.usingBuiltin, web.status().provider], [true, false, 'brave']);
  // ...and withdrawing it does not touch their own search
  assert.deepEqual([web.set({ enabled: true, provider: 'auto', builtin: false }).enabled, web.status().provider], [true, 'brave']);

  // an address of their own (a SearXNG instance) counts the same way
  const searx = web.set({ enabled: true, provider: 'auto', baseUrl: 'https://searx.example.org', clearKey: true });
  assert.deepEqual([searx.enabled, searx.usingBuiltin, web.status().provider], [true, false, 'searxng']);

  // a service chosen by name that is missing its key is reported as such, and is not replaced by the built-in search
  const chosen = web.set({ enabled: true, provider: 'tavily', baseUrl: '' });
  assert.equal(chosen.usingBuiltin, false);
  assert.deepEqual([web.status().configured, web.status().provider], [false, null]);
  assert.match(web.status().label, /Tavily needs a key/);
  assert.equal((await web.search('x')).error.kind, 'not-configured');
});

test('taking away the last key of their own hands a writer who never agreed back to "off"; one who agreed keeps what they agreed to', () => {
  const never = desk({ gatewayUrl: GATEWAY });
  never.web.set({ enabled: true, provider: 'auto', apiKey: BRAVE_KEY });
  const cleared = never.web.set({ enabled: true, provider: 'auto', clearKey: true });
  assert.deepEqual([cleared.hasKey, cleared.usingBuiltin, cleared.enabled], [false, true, false], 'the built-in search does not start on its own');
  assert.equal(never.web.status().enabled, false);

  const agreed = desk({ gatewayUrl: GATEWAY });
  agreed.web.set({ enabled: true, provider: 'auto', apiKey: BRAVE_KEY, builtin: true });
  const back = agreed.web.set({ enabled: true, provider: 'auto', clearKey: true });
  assert.deepEqual([back.usingBuiltin, back.builtin, back.enabled], [true, true, true], 'they agreed once');
});

test('a built-in search that fails says so without the install code, and a busy service is told as the engine words it', async () => {
  const busy = desk({ gatewayUrl: GATEWAY, fetchImpl: async () => new Response('slow down', { status: 429 }) });
  busy.web.set({ enabled: true, builtin: true });
  const r = await busy.web.search('anything');
  assert.equal(r.error.kind, 'rate');
  assert.match(r.error.message, /busy right now/);
  const down = desk({ gatewayUrl: GATEWAY, fetchImpl: async () => { throw new TypeError('fetch failed'); } });
  down.web.set({ enabled: true, builtin: true });
  const d = await down.web.search('anything');
  assert.equal(d.error.kind, 'network');
  for (const out of [r, d]) assert.ok(!JSON.stringify(out).includes(busy.config().installId) && !JSON.stringify(out).includes(down.config().installId));
});
