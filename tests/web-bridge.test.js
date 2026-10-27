import test from 'node:test';
import assert from 'node:assert/strict';
import { createBridgeWeb, createNoWeb, providerName, WEB_PROVIDER_CHOICES } from '../apps/web/src/engine/web/bridge.js';
import { WebError } from '../apps/web/src/engine/web/errors.js';
import * as service from '../apps/web/src/engine/web/service.js';
import { sanitizeWebRecord, WEB_STATES, MAX_WEB_SOURCES } from '../apps/web/src/engine/web/record.js';
import { BUILTIN_DISCLOSURE } from '../apps/web/src/ui/web-consent.js';
import { ProjectStore, memoryStorage } from '../apps/web/src/engine/project/store.js';
import { appendMessage } from '../apps/web/src/engine/project/memory.js';

// ── the page's door to web search (what window.NIE_WEB becomes) ──────────────

/** A fake preload bridge: each call is recorded, and each answer can be scripted. */
function fakeBridge(over = {}) {
  const calls = [];
  const bridge = {
    getConfig: async () => ({ enabled: true, provider: 'auto', detected: 'brave', baseUrl: '', custom: {}, hasKey: true, keyStoredSecurely: true }),
    setConfig: async (cfg) => void calls.push(['setConfig', cfg]),
    test: async () => ({ ok: true, provider: 'brave', message: 'Brave Search answered with 1 result.' }),
    status: async () => ({ configured: true, enabled: true, provider: 'brave', label: 'Brave Search' }),
    search: async (q, o) => (calls.push(['search', q, o]), { provider: 'brave', results: [{ title: 'A', url: 'https://example.org/a', snippet: 'about a' }] }),
    read: async (url) => (calls.push(['read', url]), { url, title: 'T', text: 'Text of the page.' }),
    ...over,
  };
  return { bridge, calls };
}

test('the bridge has the shape of the engine service, with status() asynchronous', async () => {
  const { bridge } = fakeBridge();
  const web = createBridgeWeb(bridge);
  for (const name of Object.keys(service.createWebService({ getConfig: () => ({}) }))) assert.equal(typeof web[name], 'function', name);
  const st = web.status();
  assert.ok(st instanceof Promise, 'status() is a promise here');
  assert.deepEqual(await st, { configured: true, enabled: true, provider: 'brave', label: 'Brave Search' });
});

test('status() never throws: a bridge that fails means web search is not available', async () => {
  const web = createBridgeWeb(fakeBridge({ status: async () => { throw new Error('ipc closed'); } }).bridge);
  assert.deepEqual(await web.status(), { configured: false, enabled: false, provider: null, label: 'Web search is not available' });
});

test('search sends the words and the limit, and returns cleaned results', async () => {
  const { bridge, calls } = fakeBridge({ search: async (q, o) => (calls.push(['search', q, o]), { provider: 'brave', results: [{ title: 'A', url: 'https://example.org/a', snippet: 'a' }, null, { title: 'no url' }, { url: 'https://example.org/b', title: 7, snippet: null }] }) });
  const web = createBridgeWeb(bridge);
  const r = await web.search('great fire', { limit: 4, signal: new AbortController().signal });
  assert.deepEqual(calls, [['search', 'great fire', { limit: 4 }]], 'the signal and nothing else but the limit crosses');
  assert.equal(r.provider, 'brave');
  assert.deepEqual(r.results, [{ title: 'A', url: 'https://example.org/a', snippet: 'a' }, { title: '', url: 'https://example.org/b', snippet: '' }]);
  await web.search('x');
  assert.deepEqual(calls.at(-1), ['search', 'x', { limit: 6 }], 'six by default');
});

test('a search error crosses as a WebError with the same kind and message', async () => {
  for (const kind of ['not-configured', 'auth', 'rate', 'network', 'bad-response', 'aborted']) {
    const web = createBridgeWeb(fakeBridge({ search: async () => ({ error: { kind, message: `message for ${kind}` } }) }).bridge);
    await assert.rejects(web.search('x'), (e) => e instanceof WebError && e.kind === kind && e.message === `message for ${kind}`);
  }
  const unknown = createBridgeWeb(fakeBridge({ search: async () => ({ error: { kind: 'weird', message: 'odd' } }) }).bridge);
  await assert.rejects(unknown.search('x'), (e) => e instanceof WebError && e.kind === 'network' && e.message === 'odd');
  const closed = createBridgeWeb(fakeBridge({ search: async () => { throw new Error('Object has been destroyed'); } }).bridge);
  await assert.rejects(closed.search('x'), (e) => e instanceof WebError && e.kind === 'network');
  for (const nonsense of [undefined, null, 'text', {}, { results: 'no' }]) {
    const web = createBridgeWeb(fakeBridge({ search: async () => nonsense }).bridge);
    await assert.rejects(web.search('x'), (e) => e instanceof WebError && e.kind === 'bad-response');
  }
});

test('Stop ends a search at once, even though the main process cannot take the request back', async () => {
  let release;
  const pending = new Promise((r) => (release = r));
  const { bridge, calls } = fakeBridge({ search: (q, o) => (calls.push(['search', q, o]), pending) });
  const web = createBridgeWeb(bridge);
  const ctl = new AbortController();
  const p = web.search('slow', { signal: ctl.signal });
  ctl.abort();
  await assert.rejects(p, (e) => e instanceof WebError && e.kind === 'aborted');
  release({ error: { kind: 'network', message: 'late' } }); // the late answer is ignored, with no unhandled rejection
  await new Promise((r) => setImmediate(r));

  const before = calls.length;
  await assert.rejects(web.search('never sent', { signal: ctl.signal }), (e) => e.kind === 'aborted');
  assert.equal(calls.length, before, 'an already-stopped search is not sent at all');
});

test('read returns the page, or null on any failure', async () => {
  const web = createBridgeWeb(fakeBridge().bridge);
  assert.deepEqual(await web.read('https://example.org/a'), { url: 'https://example.org/a', title: 'T', text: 'Text of the page.' });
  for (const bad of [async () => null, async () => ({}), async () => 'text', async () => { throw new Error('x'); }]) {
    assert.equal(await createBridgeWeb(fakeBridge({ read: bad }).bridge).read('https://example.org/a'), null);
  }
  const ctl = new AbortController();
  ctl.abort();
  assert.equal(await web.read('https://example.org/a', { signal: ctl.signal }), null);
});

test('test() passes the result through and never throws', async () => {
  assert.deepEqual(await createBridgeWeb(fakeBridge().bridge).test(), { ok: true, provider: 'brave', message: 'Brave Search answered with 1 result.' });
  const r = await createBridgeWeb(fakeBridge({ test: async () => { throw new Error('gone'); } }).bridge).test();
  assert.deepEqual(r, { ok: false, provider: null, message: 'gone' });
});

test('save() sends the settings (the key only inward) and then reads back what the page may know, which has no key', async () => {
  const { bridge, calls } = fakeBridge();
  const web = createBridgeWeb(bridge);
  const cfg = await web.save({ enabled: true, provider: 'auto', apiKey: 'BSA-typed-key' });
  assert.deepEqual(calls[0], ['setConfig', { enabled: true, provider: 'auto', apiKey: 'BSA-typed-key' }]);
  assert.equal(cfg.hasKey, true);
  assert.equal(web.config(), cfg);
  assert.ok(!JSON.stringify(web.config()).includes('BSA-typed-key'));
  assert.deepEqual(web.describe(), { provider: 'brave', detected: 'brave', label: 'Brave Search' });
});

test('the browser build has no web search, and says so rather than pretending', async () => {
  const web = createNoWeb();
  assert.deepEqual(await web.status(), { configured: false, enabled: false, provider: null, label: 'Web search needs the desktop app' });
  await assert.rejects(web.search('x'), (e) => e instanceof WebError && e.kind === 'not-configured' && /desktop app/.test(e.message));
  assert.equal(await web.read('https://example.org/'), null);
  assert.equal((await web.test()).ok, false);
  assert.equal(web.kind, 'none');
});

test('providers have the names a writer sees', () => {
  assert.deepEqual(WEB_PROVIDER_CHOICES.map(([id]) => id), ['auto', 'tavily', 'brave', 'serper', 'searxng', 'custom']);
  assert.equal(providerName('brave'), 'Brave Search');
  assert.equal(providerName('tavily'), 'Tavily');
  assert.equal(providerName('Some Service'), 'Some Service');
  assert.equal(providerName(null), 'a search service');
  assert.equal(providerName(''), 'a search service');
});

test('NIE\'s built-in search has a name a writer sees, is not a choice in the list, and the page starts with it unavailable', async () => {
  assert.equal(providerName('nie'), 'NIE search');
  assert.ok(!WEB_PROVIDER_CHOICES.some(([id]) => id === 'nie'), 'it is used when the writer has no key of their own, not picked from the list');
  for (const web of [createBridgeWeb(fakeBridge().bridge), createNoWeb()]) {
    const c = web.config();
    assert.deepEqual([c.gateway, c.builtin, c.usingBuiltin], [false, false, false]);
  }
});

test('the page reads where the built-in search stands from the main process, and sends the writer\'s agreement back with the rest', async () => {
  const { bridge, calls } = fakeBridge({ getConfig: async () => ({ enabled: false, provider: 'auto', detected: null, baseUrl: '', custom: {}, hasKey: false, keyStoredSecurely: true, gateway: true, builtin: false, usingBuiltin: true }) });
  const web = createBridgeWeb(bridge);
  const cfg = await web.refresh();
  assert.deepEqual([cfg.gateway, cfg.builtin, cfg.usingBuiltin], [true, false, true]);
  assert.deepEqual(web.describe(), { provider: 'nie', detected: null, label: 'NIE search' }, 'with nothing of their own, Automatic means the built-in search');
  await web.save({ ...cfg, enabled: true, builtin: true });
  assert.deepEqual(calls.at(-1)[1].builtin, true);
  assert.equal(calls.at(-1)[1].enabled, true);
});

// ── what the writer is told before the built-in search is used ───────────────

test('the disclosure is the promise to the writer, word for word', () => {
  assert.equal(BUILTIN_DISCLOSURE, 'Ready to use: NIE can look things up for you without any setup. When you use it, the words of your question are sent to a search service run by the NIE developers, which asks a search provider for them and sends the results back. Your manuscript, your project and your earlier messages are never sent. A random install code (not your name, not an account) is sent so the service can limit abuse. The service is built not to keep your questions.');
});

// ── what a reply keeps of a search ───────────────────────────────────────────

const record = (over = {}) => ({
  provider: 'brave',
  query: 'great fire of london',
  sources: [{ n: 1, title: 'The Great Fire', url: 'https://example.org/fire', host: 'example.org', read: true }, { n: 2, title: 'Pudding Lane', url: 'https://history.example.com/pl', host: 'history.example.com', read: false }],
  answeredBy: 'offline model',
  state: 'answered',
  note: 'Answered by the offline model from 2 sources; 1 page was read in full.',
  ...over,
});

test('a valid web record is kept exactly', () => {
  assert.deepEqual(sanitizeWebRecord(record()), record());
  for (const state of WEB_STATES) assert.equal(sanitizeWebRecord(record({ state })).state, state);
  assert.deepEqual(WEB_STATES, ['answered', 'results-only', 'not-configured', 'failed', 'none-found']);
});

test('a web record with no valid state, or no shape, is dropped', () => {
  for (const bad of [null, undefined, 'x', 7, [], {}, record({ state: 'maybe' }), record({ state: undefined })]) assert.equal(sanitizeWebRecord(bad), null);
});

test('only https links survive, at most 8 sources, and every string is short', () => {
  const many = Array.from({ length: 12 }, (_, i) => ({ n: i + 1, title: `Source ${i + 1}`, url: `https://example.org/${i}`, host: 'example.org', read: false }));
  const r = sanitizeWebRecord(record({ sources: many }));
  assert.equal(r.sources.length, MAX_WEB_SOURCES);
  assert.deepEqual(r.sources.map((s) => s.n), [1, 2, 3, 4, 5, 6, 7, 8]);

  const mixed = sanitizeWebRecord(record({ sources: [
    { n: 1, title: 'Plain http', url: 'http://example.org/a', host: 'example.org' },
    { n: 2, title: 'Script', url: 'javascript:alert(1)', host: 'x' },
    { n: 3, title: 'Data', url: 'data:text/html,<b>x</b>' },
    { n: 4, title: 'With a password', url: 'https://user:pass@example.org/' },
    { n: 5, title: 'Fine', url: 'https://example.org/ok' },
    'not an object', null, { n: 6 },
  ] }));
  assert.deepEqual(mixed.sources.map((s) => [s.n, s.url]), [[1, ''], [2, ''], [3, ''], [4, ''], [5, 'https://example.org/ok']], 'a source that is not https keeps its number but loses its link');
  assert.equal(mixed.sources[4].host, 'example.org', 'the host is worked out from the link when it is missing');

  const long = sanitizeWebRecord(record({ provider: 'p'.repeat(500), query: 'q'.repeat(5000), note: 'n'.repeat(5000), sources: [{ n: 1, title: 't'.repeat(5000), url: 'https://example.org/' + 'a'.repeat(3000), host: 'h'.repeat(500) }] }));
  assert.ok(long.provider.length <= 40 && long.query.length <= 300 && long.note.length <= 400);
  assert.ok(long.sources[0].title.length <= 200 && long.sources[0].host.length <= 120);
  assert.equal(long.sources[0].url, '', 'an address that long is not a link');
});

test('unknown fields, a made-up answeredBy and non-boolean "read" are not kept', () => {
  const r = sanitizeWebRecord({ ...record({ answeredBy: 'a human', sources: [{ n: 1, title: 'T', url: 'https://example.org/', host: 'example.org', read: 'yes', html: '<script>' }] }), extra: { a: 1 } });
  assert.equal(r.answeredBy, 'none');
  assert.equal(r.sources[0].read, false);
  assert.deepEqual(Object.keys(r).sort(), ['answeredBy', 'note', 'provider', 'query', 'sources', 'state']);
  assert.deepEqual(Object.keys(r.sources[0]).sort(), ['host', 'n', 'read', 'title', 'url']);
});

// ── it is saved with the project, and checked on the way back in ─────────────

test('a reply with sources is saved with the project and comes back the same; a damaged record is cleaned or dropped', () => {
  const store = new ProjectStore(memoryStorage());
  const p = store.create({ title: 'Research' });
  appendMessage(p, 'user', 'search the web for the great fire of london');
  appendMessage(p, 'assistant', 'It began in a bakery on Pudding Lane [1].', { route: 'local', web: record() });
  appendMessage(p, 'assistant', 'An ordinary reply.', { route: 'builtin' });
  appendMessage(p, 'assistant', 'Damaged.', { web: record({ state: 'who knows' }) });
  appendMessage(p, 'assistant', 'Half bad.', { web: record({ sources: [{ n: 1, title: 'Bad link', url: 'javascript:alert(1)', host: 'x' }] }) });
  appendMessage(p, 'user', 'A user message can not carry one.', { web: record() });
  store.save(p);

  const back = store.load(p.id).conversation.messages;
  assert.deepEqual(back[1].web, record());
  assert.equal(back[1].content, 'It began in a bakery on Pudding Lane [1].');
  assert.equal(back[1].route, 'local', 'the rest of the message is untouched');
  assert.equal('web' in back[2], false);
  assert.equal('web' in back[3], false, 'a record with no valid state is dropped');
  assert.equal(back[3].content, 'Damaged.', '...and the message stays');
  assert.equal(back[4].web.sources[0].url, '');
  assert.equal('web' in back[5], false);
});

test('deleting the project deletes its web record with it', () => {
  const storage = memoryStorage();
  const store = new ProjectStore(storage);
  const p = store.create({ title: 'Research' });
  appendMessage(p, 'assistant', 'Answer [1].', { web: record() });
  store.save(p);
  assert.ok(storage.keys().some((k) => storage.get(k)?.includes('Pudding Lane')));
  store.delete(p.id);
  assert.ok(!storage.keys().some((k) => storage.get(k)?.includes('Pudding Lane')));
});
