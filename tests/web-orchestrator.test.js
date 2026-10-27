import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { WebError } from '../apps/web/src/engine/web/errors.js';
import { loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { modelWithReading, projectWith } from './helpers.js';

await loadLibrary();

const RESULTS = [
  { title: 'Eiffel Tower - Encyclopedia', url: 'https://enc.example/eiffel', snippet: 'The Eiffel Tower is a wrought-iron tower in Paris, completed in 1889.' },
  { title: 'Tower facts', url: 'https://facts.example/tower', snippet: 'It is about 330 metres tall.' },
  { title: 'Visit Paris', url: 'https://visit.example/paris', snippet: 'Tickets for the tower are sold online.' },
];
const PAGE = { url: 'https://enc.example/eiffel', title: 'Eiffel', text: "The Eiffel Tower, built by the company of Gustave Eiffel, opened in March 1889 for the World's Fair in Paris. It is 330 metres tall with its antennas." };
const isWebCall = (m) => /numbered web sources/.test(m[0]?.content ?? '');
const GOOD = 'The Eiffel Tower is about 330 metres tall [1]. It opened in 1889 for the World\'s Fair in Paris [1][2].';

function fakeWeb({ configured = true, enabled = true, provider = 'brave', results = RESULTS, pages = { [PAGE.url]: PAGE }, fail = null, searches = [], reads = [] } = {}) {
  return {
    searches,
    reads,
    status: async () => ({ configured, enabled, provider: configured ? provider : null, label: 'Brave Search' }),
    search: async (query, opts) => {
      searches.push({ query, opts });
      if (fail) throw fail;
      return { provider, results };
    },
    read: async (url) => (reads.push(url), pages[url] ?? null),
  };
}

function setup({ web = fakeWeb(), reply = () => GOOD, reading, online = false, local = true } = {}) {
  const calls = [];
  const chat = modelWithReading(reply, { calls, reading });
  const engine = new AIEngine({
    local: local ? { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat } : null,
    online: online ? { configured: true, chat } : null,
    isOnline: () => online,
  });
  return { o: new Orchestrator({ engine, web }), calls, web };
}

// ── asking for it, in words ──────────────────────────────────────────────────

test('"search the web for ..." searches with the question and nothing else, and answers from numbered sources', async () => {
  const { o, calls, web } = setup();
  const project = projectWith({ storyText: 'Captain Mara forges tide tables on a failing lighthouse island.' });
  const steps = [];
  const r = await o.brainstorm({ project, message: 'search the web for how tall the Eiffel Tower is', onProgress: (p) => steps.push(p.message) });
  assert.equal(web.searches.length, 1);
  assert.equal(web.searches[0].query, 'how tall the Eiffel Tower is'); // (the question, not the sentence around it, and nothing of the project)
  assert.doesNotMatch(JSON.stringify(web.searches), /Mara|lighthouse|tide/);
  assert.deepEqual(web.reads, [RESULTS[0].url, RESULTS[1].url, RESULTS[2].url]);
  assert.equal(r.reply, GOOD);
  assert.equal(r.route, 'local');
  assert.equal(r.web.state, 'answered');
  assert.equal(r.web.answeredBy, 'offline model');
  assert.equal(r.web.provider, 'brave');
  assert.equal(r.web.query, 'how tall the Eiffel Tower is');
  assert.deepEqual(r.web.sources.map((s) => [s.n, s.host, s.read]), [[1, 'enc.example', true], [2, 'facts.example', false], [3, 'visit.example', false]]);
  assert.match(r.web.note, /Written by the offline model from 3 sources \(1 page read, the rest search snippets\)\./);
  assert.deepEqual(steps, ['Searching the web…', 'Reading 3 pages…', 'Writing the answer from the sources…']);
  // the model saw the sources and was told not to follow them
  const prompt = calls.at(-1).messages;
  assert.match(prompt.at(-1).content, /\[1\] Eiffel Tower - Encyclopedia \(enc\.example\)/);
  assert.match(prompt[0].content, /untrusted/);
  // the reply is kept in the conversation with its sources, and is not filed as something the writer told NIE
  const saved = project.conversation.messages.at(-1);
  assert.equal(saved.role, 'assistant');
  assert.equal(saved.web.sources.length, 3);
  assert.equal(project.mind.said.length, 0);
  assert.equal(Object.keys(project.conversation.agent.slots).length, 0);
});

test('a reply that cites a source that does not exist loses the mark; one that invents a name loses the sentence', async () => {
  const reply = 'The Eiffel Tower is about 330 metres tall [9]. It was designed by Marcel Duvernay in 1887 [2]. It is in Paris [1].';
  const { o } = setup({ reply: () => reply });
  const r = await o.brainstorm({ project: projectWith(), message: 'search the web for the Eiffel Tower height' });
  assert.match(r.reply, /^The Eiffel Tower is about 330 metres tall\. /);
  assert.doesNotMatch(r.reply, /Duvernay|\[9\]/);
  assert.match(r.reply, /It is in Paris \[1\]\./);
  assert.match(r.reply, /I left out part of that reply because it named something the sources don't hold/);
  assert.equal(r.web.state, 'answered');
});

test('when nothing the model wrote is backed by the sources, the results are shown as they came', async () => {
  const { o } = setup({ reply: () => 'Marcel Duvernay and Odile Brandt drew the plans in 1871 [1].' });
  const r = await o.brainstorm({ project: projectWith(), message: 'search the web for who designed the Eiffel Tower' });
  assert.equal(r.web.state, 'results-only');
  assert.equal(r.web.answeredBy, 'none');
  assert.match(r.reply, /^I left out what my model wrote because it named things the sources don't hold\./);
  assert.match(r.reply, /\[1\] The Eiffel Tower is a wrought-iron tower in Paris, completed in 1889\./);
  assert.doesNotMatch(r.reply, /Duvernay/);
});

test('with no model running the results are listed, honestly, with no summary', async () => {
  const { o } = setup({ local: false });
  const r = await o.brainstorm({ project: projectWith(), message: 'google the height of the Eiffel Tower' });
  assert.equal(r.web.state, 'results-only');
  assert.equal(r.route, 'builtin');
  assert.match(r.reply, /^No language model is running, so I can't summarise\./);
  assert.match(r.web.note, /No summary was written/);
  assert.equal(r.web.sources.length, 3);
});

test('an online model is named, and the words sent to it are counted', async () => {
  const { o } = setup({ online: true, local: false });
  const r = await o.brainstorm({ project: projectWith(), message: 'look up how tall the Eiffel Tower is' });
  assert.equal(r.route, 'online');
  assert.equal(r.web.answeredBy, 'online model');
  assert.match(r.web.note, /Written by the online model from 3 sources/);
  assert.match(r.web.note, /About \d+ words \(your question and the web text\) were sent to your online provider\./);
});

// ── the Web switch ───────────────────────────────────────────────────────────

test('with the Web switch on, a factual question goes to the web; with it off it does not', async () => {
  const on = setup();
  const a = await on.o.brainstorm({ project: projectWith(), message: 'How tall is the Eiffel Tower?', web: true });
  assert.equal(on.web.searches.length, 1);
  assert.equal(on.web.searches[0].query, 'How tall is the Eiffel Tower');
  assert.equal(a.web?.state, 'answered');

  const off = setup();
  const b = await off.o.brainstorm({ project: projectWith(), message: 'How tall is the Eiffel Tower?', web: false });
  assert.equal(off.web.searches.length, 0);
  assert.equal(b.web, null);
});

test('with the Web switch on, talk about the writer\'s own story, ideas, feedback and small talk stay what they were', async () => {
  const project = projectWith();
  for (const message of ['hey', 'Give me some twists for my heist story', 'Is my ending too predictable?', 'My novel is a slow-burn mystery on a fishing island.', 'What does my villain want?', 'thanks!']) {
    const { o, web } = setup({ reply: () => 'Something plain.' });
    const r = await o.brainstorm({ project, message, web: true });
    assert.equal(web.searches.length, 0, message);
    assert.equal(r.web, null, message);
  }
});

test('a Web switch that is on while web search is not usable does nothing unasked', async () => {
  for (const state of [{ configured: false }, { enabled: false }]) {
    const { o, web } = setup({ web: fakeWeb(state), reply: () => 'A plain answer from the library and the model.' });
    const r = await o.brainstorm({ project: projectWith(), message: 'Who painted the Mona Lisa?', web: true });
    assert.equal(web.searches.length, 0);
    assert.equal(r.web, null);
  }
});

// ── honest when it can not or will not ───────────────────────────────────────

test('asked to search with no search set up, NIE says so and calls no model', async () => {
  const { o, calls, web } = setup({ web: fakeWeb({ configured: false }) });
  const r = await o.brainstorm({ project: projectWith(), message: 'search the web for the Eiffel Tower height' });
  assert.equal(web.searches.length, 0);
  assert.equal(calls.length, 0);
  assert.equal(r.route, 'builtin');
  assert.equal(r.web.state, 'not-configured');
  assert.match(r.reply, /Web search isn't set up/);
  assert.match(r.reply, /can't see the live web/);
});

test('asked to search while it is switched off, NIE says that instead', async () => {
  const { o, web } = setup({ web: fakeWeb({ enabled: false }) });
  const r = await o.brainstorm({ project: projectWith(), message: 'search the web for the Eiffel Tower height' });
  assert.equal(web.searches.length, 0);
  assert.match(r.reply, /switched off/);
});

test('"with sources" alone does not turn a plain question into a web search when there is no web search', async () => {
  const { o, web } = setup({ web: fakeWeb({ configured: false }), reply: () => 'A sonnet is a fourteen-line poem.' });
  const r = await o.brainstorm({ project: projectWith(), message: 'What is a sonnet, with sources', web: false });
  assert.equal(web.searches.length, 0);
  assert.doesNotMatch(r.reply, /Web search isn't set up/);
});

test('a failed search says why and invents nothing', async () => {
  for (const [kind, message] of [['auth', 'Brave Search did not accept the key. Check it in Settings.'], ['rate', 'Brave Search says the limit for this key has been reached. Try again later.'], ['network', 'Could not reach Brave Search.']]) {
    const { o, calls } = setup({ web: fakeWeb({ fail: new WebError(kind, message) }) });
    const r = await o.brainstorm({ project: projectWith(), message: 'search the web for the Eiffel Tower height' });
    assert.equal(r.web.state, 'failed', kind);
    assert.equal(r.reply, `I couldn't search the web just now. ${message}`);
    assert.equal(calls.length, 0, 'no model is asked to answer without sources');
  }
});

test('a search with no results says so and does not answer from nothing', async () => {
  const { o, calls } = setup({ web: fakeWeb({ results: [] }) });
  const r = await o.brainstorm({ project: projectWith(), message: 'search the web for zxqv blorptastic' });
  assert.equal(r.web.state, 'none-found');
  assert.match(r.reply, /found nothing for "zxqv blorptastic"/);
  assert.equal(calls.length, 0);
});

// ── what may leave the computer ──────────────────────────────────────────────

test('a long question is not sent; a pasted text is never sent', async () => {
  const long = `search the web for ${'which of the many things in my long and winding plot '.repeat(4)}`;
  const a = setup();
  const r = await a.o.brainstorm({ project: projectWith(), message: long });
  assert.equal(a.web.searches.length, 0);
  assert.match(r.reply, /more than I should send to a search service/);
  assert.equal(r.web.state, 'failed');
  assert.match(r.web.note, /Nothing was sent/);

  const b = setup({ reply: () => 'A reading of the text.' });
  const paste = `${'The rain came down on the harbour all night and nobody slept. '.repeat(80)}\n\nPlease search the web for who wrote this.`;
  await b.o.brainstorm({ project: projectWith(), message: paste });
  assert.equal(b.web.searches.length, 0);
});

test('a request to write is declined before any search or model, with or without the web', async () => {
  const { o, calls, web } = setup();
  const r = await o.brainstorm({ project: projectWith(), message: 'search the web and write me a scene where they argue', web: true });
  assert.equal(r.declined, true);
  assert.equal(web.searches.length, 0);
  assert.equal(calls.length, 0);
});

test('Stop ends a search turn', async () => {
  const ctl = new AbortController();
  const web = fakeWeb();
  const slow = { ...web, search: async () => { ctl.abort(); throw new WebError('aborted', 'Stopped.'); } };
  const { o } = setup({ web: slow });
  await assert.rejects(o.brainstorm({ project: projectWith(), message: 'search the web for the Eiffel Tower height', signal: ctl.signal }), (e) => e.kind === 'abort');
});

// ── a conversation ───────────────────────────────────────────────────────────

test('a short follow-up becomes a search of its own using the last question', async () => {
  const web = fakeWeb();
  const rewrite = (m) => (/Rewrite the follow-up/.test(m[0].content) ? 'Eiffel Tower construction date' : isWebCall(m) ? GOOD : 'ok');
  const { o } = setup({ web, reply: rewrite });
  const project = projectWith();
  await o.brainstorm({ project, message: 'search the web for Eiffel Tower height' });
  const r = await o.brainstorm({ project, message: 'search the web and when was it built?', web: true });
  assert.equal(web.searches.at(-1).query, 'Eiffel Tower construction date');
  assert.equal(r.web.query, 'Eiffel Tower construction date');

  // no model: the last question's words are joined to the follow-up
  const w2 = fakeWeb();
  const none = setup({ web: w2, local: false });
  const p2 = projectWith();
  await none.o.brainstorm({ project: p2, message: 'search the web for Eiffel Tower height' });
  await none.o.brainstorm({ project: p2, message: 'search the web and how old is it?' });
  assert.equal(w2.searches.at(-1).query, 'Eiffel Tower height how old is it');
});

test('a model that rewrites a follow-up into something unrelated is not believed', async () => {
  const web = fakeWeb();
  const { o } = setup({ web, reply: (m) => (/Rewrite the follow-up/.test(m[0].content) ? 'best pizza recipe tonight' : GOOD) });
  const project = projectWith();
  await o.brainstorm({ project, message: 'search the web for Eiffel Tower height' });
  await o.brainstorm({ project, message: 'search the web and how old is it?' });
  assert.equal(web.searches.at(-1).query, 'Eiffel Tower height how old is it');
});

test('a web answer is not remembered as something the writer said, and the next story message is unaffected', async () => {
  const { o } = setup({ reply: (m) => (isWebCall(m) ? GOOD : 'What does the keeper want most?') });
  const project = projectWith();
  await o.brainstorm({ project, message: 'search the web for how tall the Eiffel Tower is' });
  assert.equal(project.mind.said.length, 0);
  await o.brainstorm({ project, message: 'I am writing a story about a lighthouse keeper who forges tide tables.' });
  assert.equal(project.mind.said.length > 0, true);
  assert.doesNotMatch(JSON.stringify(project.mind.said), /Eiffel/);
});

test('an orchestrator with no web object behaves exactly as before', async () => {
  const { o } = setup({ web: null, reply: () => 'A villanelle is a nineteen-line poem with two refrains.' });
  const r = await o.brainstorm({ project: projectWith(), message: 'What is a villanelle?', web: true });
  assert.equal(r.web, null);
  assert.match(r.reply, /villanelle/i);
});
