import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { PROVIDERS, isBuiltin, resolveProvider } from '../apps/web/src/engine/web/providers.js';
import { runSearch } from '../apps/web/src/engine/web/search.js';
import { WIKIPEDIA_UA, articleUrl, parseWikipediaSearch, readWikipediaPage, wikipediaSearchRequest, wikipediaTarget } from '../apps/web/src/engine/web/wikipedia.js';
import { createWebService } from '../apps/web/src/engine/web/service.js';
import { loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { modelWithReading, projectWith } from './helpers.js';

await loadLibrary();

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const SEARCH = {
  query: {
    search: [
      { title: 'Eiffel Tower', pageid: 9232, snippet: 'The <span class="searchmatch">Eiffel</span> Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France.' },
      { title: 'Eiffel Tower (disambiguation)', snippet: 'may refer to &quot;Eiffel&quot; &amp; others' },
      { title: 'Café Procope', snippet: 'a café' },
      { snippet: 'no title' },
      null,
    ],
  },
};
const LEAD = "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France. It is named after the engineer Gustave Eiffel, whose company designed and built the tower from 1887 to 1889. It is 330 metres tall, about the same height as an 81-storey building.";
const EXTRACT = { query: { pages: [{ pageid: 9232, title: 'Eiffel Tower', extract: LEAD }] } };

// ── the request, as the API documents it ─────────────────────────────────────

test('the search asks the Action API for articles, names itself, and needs no key', () => {
  const req = wikipediaSearchRequest({ query: 'how tall is the Eiffel Tower', limit: 6 });
  const u = new URL(req.url);
  assert.equal(u.origin + u.pathname, 'https://en.wikipedia.org/w/api.php');
  assert.deepEqual(Object.fromEntries(u.searchParams), { format: 'json', formatversion: '2', action: 'query', list: 'search', srsearch: 'how tall is the Eiffel Tower', srlimit: '6', srnamespace: '0', srprop: 'snippet' });
  assert.equal(req.method, 'GET');
  assert.equal(req.headers['User-Agent'], WIKIPEDIA_UA);
  assert.match(WIKIPEDIA_UA, /^NIE\/[\d.]+ \(https:\/\/github\.com\/TheCyanAge\/NIE;/); // (Wikimedia asks for a program name and a way to reach its makers)
  assert.equal(new URL(wikipediaSearchRequest({ query: 'x', limit: 99 }).url).searchParams.get('srlimit'), '8');
  assert.equal(new URL(wikipediaSearchRequest({ query: 'x', lang: 'evil.example/#' }).url).hostname, 'en.wikipedia.org', 'a language code is a code, never a host');
  assert.equal(PROVIDERS.wikipedia.needsKey, false);
});

test('results are articles with their address, the match markup and entities removed, and nothing malformed', () => {
  const rows = parseWikipediaSearch(SEARCH);
  assert.deepEqual(rows.map((r) => r.title), ['Eiffel Tower', 'Eiffel Tower (disambiguation)', 'Café Procope']);
  assert.equal(rows[0].snippet, 'The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France.');
  assert.equal(rows[1].snippet, 'may refer to "Eiffel" & others');
  assert.equal(rows[0].url, 'https://en.wikipedia.org/wiki/Eiffel_Tower');
  assert.equal(rows[1].url, 'https://en.wikipedia.org/wiki/Eiffel_Tower_(disambiguation)');
  assert.equal(rows[2].url, 'https://en.wikipedia.org/wiki/Caf%C3%A9_Procope');
  assert.deepEqual(parseWikipediaSearch({}), []);
  assert.equal(articleUrl('Hamlet (1996 film)'), 'https://en.wikipedia.org/wiki/Hamlet_(1996_film)');
});

test('a search through the usual runner needs no key and sends the program\'s name', async () => {
  const seen = [];
  const out = await runSearch({ fetch: async (url, init) => (seen.push({ url, init }), json(SEARCH)), cfg: { provider: 'auto', key: '' }, query: 'eiffel tower height', limit: 6 });
  assert.equal(out.provider, 'wikipedia');
  assert.equal(out.results.length, 3);
  assert.equal(seen[0].init.headers['User-Agent'], WIKIPEDIA_UA);
  assert.ok(!JSON.stringify(seen[0]).includes('Authorization'));
});

// ── which address is an article ──────────────────────────────────────────────

test('only a Wikipedia article address is read through the API', () => {
  assert.deepEqual(wikipediaTarget('https://en.wikipedia.org/wiki/Eiffel_Tower'), { lang: 'en', title: 'Eiffel Tower' });
  assert.deepEqual(wikipediaTarget('https://fr.wikipedia.org/wiki/Caf%C3%A9_Procope'), { lang: 'fr', title: 'Café Procope' });
  assert.deepEqual(wikipediaTarget('https://en.wikipedia.org/w/index.php?title=Eiffel_Tower&oldid=1'), { lang: 'en', title: 'Eiffel Tower' });
  for (const bad of ['http://en.wikipedia.org/wiki/X', 'https://en.wikipedia.org.evil.example/wiki/X', 'https://evil.example/wiki/X', 'https://en.wikipedia.org:8443/wiki/X', 'https://u:p@en.wikipedia.org/wiki/X', 'https://en.wikipedia.org/wiki/', 'https://en.wikipedia.org/wiki/A%7CB', 'https://en.wikipedia.org/w/api.php?action=query', 'https://en.wikipedia.org/wiki/%E0%A4%A', 'nonsense', ''])
    assert.equal(wikipediaTarget(bad), null, bad);
});

// ── reading an article ───────────────────────────────────────────────────────

test('an article is read as the plain text of its lead, in either shape of the API\'s answer', async () => {
  const seen = [];
  const take = (body) => async (url, init) => (seen.push({ url, init }), json(body));
  const a = await readWikipediaPage('https://en.wikipedia.org/wiki/Eiffel_Tower', { fetch: take(EXTRACT), maxChars: 6000 });
  assert.deepEqual([a.url, a.title, a.text], ['https://en.wikipedia.org/wiki/Eiffel_Tower', 'Eiffel Tower', LEAD]);
  const u = new URL(seen[0].url);
  assert.deepEqual([u.hostname, u.searchParams.get('prop'), u.searchParams.get('exintro'), u.searchParams.get('explaintext'), u.searchParams.get('redirects'), u.searchParams.get('titles')], ['en.wikipedia.org', 'extracts', '1', '1', '1', 'Eiffel Tower']);
  assert.equal(seen[0].init.headers['User-Agent'], WIKIPEDIA_UA);
  const old = await readWikipediaPage('https://en.wikipedia.org/wiki/Eiffel_Tower', { fetch: take({ query: { pages: { 9232: { title: 'Eiffel Tower', extract: LEAD } } } }) });
  assert.equal(old.text, LEAD);
  const clipped = await readWikipediaPage('https://en.wikipedia.org/wiki/Eiffel_Tower', { fetch: take(EXTRACT), maxChars: 100 });
  assert.ok(clipped.text.length <= 100);
});

test('an article that is missing, too short, refused or slow gives nothing, and Stop ends the read', async () => {
  const run = (res, o = {}) => readWikipediaPage('https://en.wikipedia.org/wiki/X', { fetch: async () => res, ...o });
  assert.equal(await run(json({ query: { pages: [{ title: 'X', missing: true }] } })), null);
  assert.equal(await run(json({ query: { pages: [{ title: 'X', extract: 'Too short.' }] } })), null);
  assert.equal(await run(json({}, 429)), null);
  assert.equal(await run(new Response('not json', { status: 200 })), null);
  assert.equal(await readWikipediaPage('https://en.wikipedia.org/wiki/X', { fetch: (_u, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(new Error('x')))), timeoutMs: 30 }), null);
  const ctl = new AbortController();
  const p = readWikipediaPage('https://en.wikipedia.org/wiki/X', { fetch: (_u, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(new Error('x')))), signal: ctl.signal });
  ctl.abort();
  await assert.rejects(p, (e) => e.kind === 'aborted');
  assert.equal(await readWikipediaPage('https://evil.example/wiki/X', { fetch: async () => { throw new Error('must not be called'); } }), null);
});

// ── who is asked, and when ───────────────────────────────────────────────────

test('their own key wins, then the owner\'s gateway, then Wikipedia; each agreement is for one service only', async () => {
  assert.equal(resolveProvider({ provider: 'auto', key: 'tvly-own', gatewayUrl: 'https://g.example' }).id, 'tavily');
  assert.equal(resolveProvider({ provider: 'auto', key: '', gatewayUrl: 'https://g.example' }).id, 'nie');
  assert.equal(resolveProvider({ provider: 'auto', key: '' }).id, 'wikipedia');
  assert.equal(resolveProvider({ provider: 'brave', key: '' }).ready, false, 'a service chosen by name that lacks its key is never swapped for Wikipedia');
  assert.deepEqual(['nie', 'wikipedia', 'brave'].map(isBuiltin), [true, true, false]);

  let cfg = { enabled: true, provider: 'auto', key: '', builtin: 'wikipedia' };
  const svc = createWebService({ fetch: async () => json(SEARCH), getConfig: () => cfg });
  assert.deepEqual(svc.status(), { configured: true, enabled: true, provider: 'wikipedia', label: 'Wikipedia' });
  cfg = { ...cfg, gatewayUrl: 'https://g.example', installId: 'b3f0c1d2-1111-4222-8333' }; // the owner later adds a gateway: a new recipient, so the old agreement no longer counts
  assert.deepEqual(svc.status(), { configured: true, enabled: false, provider: 'nie', label: 'NIE search (switched off)' });
  await assert.rejects(svc.search('hello there'), (e) => e.kind === 'not-configured');
  cfg = { ...cfg, builtin: 'nie' };
  assert.equal(svc.status().enabled, true);
  cfg = { ...cfg, builtin: true }; // (an old yes/no is not an agreement to anything in particular)
  assert.equal(svc.status().enabled, false);
});

test('reading goes to the API for an article and to the page reader for anything else', async () => {
  const urls = [];
  const svc = createWebService({
    fetch: async (url) => {
      urls.push(String(url));
      return String(url).includes('/w/api.php') ? json(EXTRACT) : new Response('<main><article><p>' + 'A page that says something about the tower and the city around it. '.repeat(6) + '</p></article></main>', { status: 200, headers: { 'content-type': 'text/html' } });
    },
    getConfig: () => ({ enabled: true, provider: 'auto', key: '', builtin: 'wikipedia' }),
  });
  assert.equal((await svc.read('https://en.wikipedia.org/wiki/Eiffel_Tower')).text, LEAD);
  assert.match((await svc.read('https://visit.example/paris')).text, /about the tower/);
  assert.ok(urls[0].includes('/w/api.php') && !urls[1].includes('/w/api.php'));
});

// ── a whole question, with a fake network ────────────────────────────────────

function wholeQuestion({ agreed = true, model = true } = {}) {
  const net = [];
  const web = createWebService({
    fetch: async (url) => {
      net.push(String(url));
      const p = new URL(url).searchParams;
      return p.get('list') === 'search' ? json(SEARCH) : p.get('titles') === 'Eiffel Tower' ? json(EXTRACT) : json({ query: { pages: [{ title: p.get('titles'), missing: true }] } });
    },
    getConfig: () => ({ enabled: true, provider: 'auto', key: '', builtin: agreed ? 'wikipedia' : '' }),
  });
  const chat = modelWithReading(() => 'The Eiffel Tower is 330 metres tall [1]. Gustave Eiffel\'s company built it from 1887 to 1889 [1].');
  const engine = new AIEngine({ local: model ? { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat } : null, online: null, isOnline: () => false });
  return { o: new Orchestrator({ engine, web }), net };
}

test('"search the web for ..." with nothing set up looks it up on Wikipedia and answers with numbered Wikipedia sources', async () => {
  const { o, net } = wholeQuestion();
  const project = projectWith({ storyText: 'Captain Mara forges tide tables on a failing lighthouse island.' });
  const r = await o.brainstorm({ project, message: 'search the web for how tall the Eiffel Tower is' });
  assert.equal(r.web.state, 'answered');
  assert.equal(r.web.provider, 'wikipedia');
  assert.equal(r.web.query, 'how tall the Eiffel Tower is');
  assert.equal(r.reply, 'The Eiffel Tower is 330 metres tall [1]. Gustave Eiffel\'s company built it from 1887 to 1889 [1].');
  assert.deepEqual(r.web.sources[0], { n: 1, title: 'Eiffel Tower', url: 'https://en.wikipedia.org/wiki/Eiffel_Tower', host: 'en.wikipedia.org', read: true });
  assert.ok(r.web.sources.every((s) => s.url.startsWith('https://en.wikipedia.org/wiki/')));
  assert.ok(net.every((u) => new URL(u).hostname === 'en.wikipedia.org'), 'only Wikipedia was contacted');
  assert.doesNotMatch(net.join('\n'), /Mara|lighthouse|tide/, 'nothing of the project was sent');
  assert.equal(project.mind.said.length, 0);
});

test('before the writer has agreed, nothing is sent and NIE says how to agree', async () => {
  const { o, net } = wholeQuestion({ agreed: false });
  const r = await o.brainstorm({ project: projectWith(), message: 'search the web for how tall the Eiffel Tower is' });
  assert.deepEqual(net, []);
  assert.match(r.reply, /Looking things up on Wikipedia is ready as soon as you agree to it/);
  assert.equal(r.web.note, 'You have not agreed to look things up on Wikipedia yet.');
});

test('with no model the Wikipedia results are listed as they came', async () => {
  const { o } = wholeQuestion({ model: false });
  const r = await o.brainstorm({ project: projectWith(), message: 'search the web for how tall the Eiffel Tower is' });
  assert.equal(r.web.state, 'results-only');
  assert.match(r.reply, /^No language model is running, so I can't summarise\./);
  assert.match(r.reply, /\[1\] The Eiffel Tower is a wrought-iron lattice tower/);
});
