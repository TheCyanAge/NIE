import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebSettings, WEB_PROVIDERS } from '../apps/desktop/src/web-settings.js';
import { createWebService } from '../apps/web/src/engine/web/service.js';
import { WebError } from '../apps/web/src/engine/web/errors.js';

// The main-process side of web search, tested without Electron: preferences, safeStorage and fetch are all fakes.

const BRAVE_KEY = 'BSAsecret-key-0123456789';
const BRAVE_BODY = { web: { results: [{ title: 'The Great Fire', url: 'https://example.org/fire?utm_source=x', description: 'London burned in 1666.' }, { title: 'A plain http page', url: 'http://example.org/old', description: 'Dropped: not https.' }] } };

function desk({ encryption = true, fetchImpl = null, createService = createWebService } = {}) {
  let prefs = {};
  const calls = [];
  const safeStorage = {
    isEncryptionAvailable: () => encryption,
    encryptString: (s) => Buffer.from(`enc:${s.split('').reverse().join('')}`),
    decryptString: (b) => b.toString().replace(/^enc:/, '').split('').reverse().join(''),
  };
  const fetchFake = fetchImpl ?? (async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(BRAVE_BODY), { status: 200, headers: { 'content-type': 'application/json' } });
  });
  const web = createWebSettings({
    readPrefs: () => prefs,
    writePrefs: (patch) => (prefs = { ...prefs, ...patch }),
    safeStorage,
    createService,
    fetch: fetchFake,
  });
  return { web, calls, prefs: () => prefs };
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
