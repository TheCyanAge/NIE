import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { createWebService } from '../apps/web/src/engine/web/service.js';
import { resolveProvider } from '../apps/web/src/engine/web/providers.js';
import { sanitizeWebRecord } from '../apps/web/src/engine/web/record.js';
import { buildFromDump } from '../apps/web/src/engine/encyclopedia/build.js';
import { Pack } from '../apps/web/src/engine/encyclopedia/pack.js';
import { loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { modelWithReading, projectWith } from './helpers.js';
import { sampleDump } from './fixtures/cirrus-sample.mjs';

await loadLibrary();

const built = await buildFromDump(Readable.from([sampleDump()]), { name: 'sample', builtAt: '2026-03-04T00:00:00Z' });
const pack = await Pack.open(built.bytes);

/** A network that fails the test if anything touches it: the encyclopedia must never need one. */
const noNetwork = () => {
  const calls = [];
  const fetch = async (...args) => {
    calls.push(args);
    throw new Error('the network must not be used');
  };
  return { fetch, calls };
};

const serviceWith = (cfg = {}, { withPack = true, net = noNetwork() } = {}) => ({ web: createWebService({ fetch: net.fetch, getConfig: () => cfg, getPack: () => (withPack ? pack : null) }), net });

test('with the encyclopedia installed and no key of the writer\'s own, it is the source, with no agreement and no switch needed', () => {
  const { web } = serviceWith({ enabled: false });
  const st = web.status();
  assert.deepEqual(st, { configured: true, enabled: true, provider: 'pack', label: 'Offline encyclopedia' });
  assert.equal(web.describe({}).provider, 'pack');
});

test('the order is: the writer\'s own key, then the encyclopedia, then NIE\'s service, then Wikipedia', () => {
  assert.equal(resolveProvider({ key: 'tvly-abc', pack: true, gatewayUrl: 'https://gw.example' }).id, 'tavily');
  assert.equal(resolveProvider({ pack: true, gatewayUrl: 'https://gw.example' }).id, 'pack');
  assert.equal(resolveProvider({ pack: false, gatewayUrl: 'https://gw.example' }).id, 'nie');
  assert.equal(resolveProvider({ pack: false }).id, 'wikipedia');
  const none = resolveProvider({ provider: 'pack', pack: false });
  assert.equal(none.ready, false);
  assert.match(none.reason, /not downloaded/);
  assert.equal(serviceWith({}, { withPack: false }).web.status().provider, 'wikipedia');
});

test('a search and a read are answered from the pack and never touch the network', async () => {
  const { web, net } = serviceWith();
  const found = await web.search('how long is the Marlowe Bridge', { limit: 5 });
  assert.equal(found.provider, 'pack');
  assert.equal(found.results[0].title, 'Marlowe Bridge');
  assert.equal(found.results[0].url, 'https://en.wikipedia.org/wiki/Marlowe_Bridge');
  assert.deepEqual(found.pack, { docs: 6, builtAt: '2026-03-04T00:00:00Z', name: 'sample' });
  const page = await web.read(found.results[0].url);
  assert.match(page.text, /412 metres/);
  assert.equal(await web.read('https://en.wikipedia.org/wiki/Nonesuch'), null, 'an article that is not in the pack is not fetched');
  assert.equal(await web.read('https://example.org/page'), null, 'no page of the web is fetched either');
  assert.equal(net.calls.length, 0);
  const t = await web.test();
  assert.equal(t.ok, true);
  assert.match(t.message, /6 articles, on this computer/);
});

test('an article far below the best match is not offered as a source', async () => {
  const { web } = serviceWith();
  const found = await web.search('Karr Hills');
  assert.equal(found.results[0].title, 'Karr Hills');
  assert.ok(found.results.length <= 3, 'weak matches are cut');
  await assert.rejects(web.search('   '), /nothing to search/);
});

// ── in a conversation ────────────────────────────────────────────────────────

function setup({ withPack = true, reply = () => 'unused', local = true, online = false } = {}) {
  const calls = [];
  const chat = modelWithReading(reply, { calls });
  const engine = new AIEngine({
    local: local ? { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat } : null,
    online: online ? { configured: true, chat } : null,
    isOnline: () => online,
  });
  const { web, net } = serviceWith({}, { withPack });
  return { o: new Orchestrator({ engine, web }), calls, net };
}

test('"What is Veldhaven?" is answered with the article\'s own opening sentences, no model, nothing sent', async () => {
  const { o, calls, net } = setup();
  const project = projectWith();
  const steps = [];
  const r = await o.brainstorm({ project, message: 'What is Veldhaven?', web: true, onProgress: (p) => steps.push(p.message) });
  assert.equal(r.reply, 'Veldhaven is the largest port city of Orsland, on the mouth of the River Tamsin. About two million people live in the city, which was founded by salt traders in the ninth century. [1]');
  assert.equal(r.route, 'builtin');
  assert.equal(r.web.provider, 'pack');
  assert.equal(r.web.answeredBy, 'encyclopedia');
  assert.equal(r.web.state, 'answered');
  assert.match(r.web.note, /Quoted from the offline encyclopedia article "Veldhaven"/);
  assert.match(r.web.note, /No model wrote this, and nothing left your computer/);
  assert.equal(r.web.sources[0].url, 'https://en.wikipedia.org/wiki/Veldhaven');
  assert.deepEqual(steps.slice(0, 2), ['Looking in the offline encyclopedia…', 'Reading 3 articles…']);
  assert.equal(calls.length, 0, 'the answering model was not asked');
  assert.equal(net.calls.length, 0);
  assert.deepEqual(sanitizeWebRecord(r.web).answeredBy, 'encyclopedia', 'and the record survives being saved');
  assert.equal(project.mind.said.length, 0, 'a lookup is not something the writer told NIE');
});

test('"look up Veldhaven" is a name, so it quotes the article too', async () => {
  const { o, calls } = setup();
  const r = await o.brainstorm({ project: projectWith(), message: 'look up Veldhaven' });
  assert.match(r.reply, /^Veldhaven is the largest port city of Orsland/);
  assert.equal(calls.length, 0);
});

test('a question that is not a plain definition goes to the model, which sees articles (not "untrusted web pages") and is checked against them', async () => {
  const good = 'The Marlowe Bridge is 412 metres long [1]. It opened in 1931 [1].';
  const { o, calls, net } = setup({ reply: () => good });
  const r = await o.brainstorm({ project: projectWith(), message: 'search for how long the Marlowe Bridge is' });
  assert.equal(r.reply, good);
  assert.equal(r.route, 'local');
  assert.equal(r.web.answeredBy, 'offline model');
  assert.match(r.web.note, /Written by the offline model from \d article/);
  assert.match(r.web.note, /of the offline encyclopedia \(Wikipedia, the opening of each, as of 2026-03-04\)/);
  assert.match(r.web.note, /Nothing left your computer\./);
  const prompt = calls.at(-1).messages;
  assert.match(prompt[0].content, /offline encyclopedia/);
  assert.doesNotMatch(prompt[0].content, /untrusted web/);
  assert.match(prompt.at(-1).content, /ARTICLES \(offline encyclopedia\)/);
  assert.equal(net.calls.length, 0);
});

test('a reply that names something the articles do not hold loses that sentence, as with any source', async () => {
  const { o } = setup({ reply: () => 'The Marlowe Bridge is 412 metres long [1]. It was designed by Odile Brandt in 1929 [1].' });
  const r = await o.brainstorm({ project: projectWith(), message: 'search for who designed the Marlowe Bridge' });
  assert.doesNotMatch(r.reply, /Odile Brandt/);
  assert.match(r.reply, /412 metres/);
  assert.match(r.reply, /named something the sources don't hold/);
});

test('with no model running, the articles are shown as the encyclopedia holds them, whole leads, not snippets', async () => {
  const { o } = setup({ local: false });
  const r = await o.brainstorm({ project: projectWith(), message: 'search for how long the Marlowe Bridge is' });
  assert.equal(r.web.state, 'results-only');
  assert.match(r.reply, /No language model is running, so I can't summarise\. Here is what the encyclopedia holds:/);
  assert.match(r.reply, /\[1\] The Marlowe Bridge is a suspension bridge across the River Tamsin in the invented city of Veldhaven\. It opened in 1931/);
});

test('when the encyclopedia has nothing, NIE says what it holds and what to do, and does not guess', async () => {
  const { o, calls } = setup({ reply: () => 'should not be asked' });
  const r = await o.brainstorm({ project: projectWith(), message: 'search for the migratory habits of the quokka' });
  assert.equal(r.web.state, 'none-found');
  assert.match(r.reply, /The offline encyclopedia has nothing on "the migratory habits of the quokka"/);
  assert.match(r.reply, /opening of 6 articles/);
  assert.equal(calls.length, 0);
});

test('an online model answering from the encyclopedia is told apart: the words sent to it are counted', async () => {
  const { o } = setup({ local: false, online: true, reply: () => 'The Marlowe Bridge is 412 metres long [1].' });
  const r = await o.brainstorm({ project: projectWith(), message: 'search for how long the Marlowe Bridge is' });
  assert.equal(r.web.answeredBy, 'online model');
  assert.match(r.web.note, /words \(your question and the encyclopedia text\) were sent to your online provider/);
  assert.doesNotMatch(r.web.note, /Nothing left your computer/);
});

// ── what NIE says about itself stays true ────────────────────────────────────

test('"I can\'t look things up offline" is only said when it is true', async () => {
  const { libraryMissReply, aboutNieReply } = await import('../apps/web/src/engine/orchestrator/builtin.js');
  const miss = { near: [], related: [] };
  assert.match(libraryMissReply(miss), /can't look things up offline/);
  const withPack = libraryMissReply(miss, { encyclopedia: true });
  assert.doesNotMatch(withPack, /can't look things up offline/);
  assert.match(withPack, /offline encyclopedia on this computer may.*Web switch/);
  assert.match(aboutNieReply(null, 'does NIE work offline?'), /offline encyclopedia/);
  assert.match(aboutNieReply(null, 'is my text sent anywhere?'), /nothing you ask leaves it/);
});

test('with no model and a question the library lacks, a writer with the encyclopedia is told where to look', async () => {
  const { o } = setup({ local: false });
  const withPack = await o.brainstorm({ project: projectWith(), message: 'What is the capital of Orsland?' });
  assert.doesNotMatch(withPack.reply, /can't look things up offline/);
  const bare = setup({ local: false, withPack: false });
  const without = await bare.o.brainstorm({ project: projectWith(), message: 'What is the capital of Orsland?' });
  assert.match(without.reply, /can't look things up offline/);
});

// ── choosing the source ──────────────────────────────────────────────────────

test('a direct craft question the library holds is answered by the library even with the Web switch on; "look up" still asks the encyclopedia', async () => {
  const { o, calls, net } = setup({ local: false });
  const held = await o.brainstorm({ project: projectWith(), message: 'What is a villanelle?', web: true });
  assert.equal(held.web, null, 'not a lookup');
  assert.match(held.reply, /^From NIE's built-in library:/);
  assert.match(held.reply, /nineteen-line/);
  const asked = await o.brainstorm({ project: projectWith(), message: 'look up what a villanelle is' });
  assert.equal(asked.web.provider, 'pack');
  assert.equal(asked.web.state, 'none-found');
  assert.equal(calls.length, 0);
  assert.equal(net.calls.length, 0);
  // and a factual question the library does not hold goes to the encyclopedia with the switch on
  const other = await o.brainstorm({ project: projectWith(), message: 'Who is Ilse Quarrel?', web: true });
  assert.equal(other.web.provider, 'pack');
  assert.match(other.reply, /^Ilse Quarrel \(born 1950\) is an Orsland novelist/);
});
