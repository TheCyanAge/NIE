import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { ProjectStore, memoryStorage } from '../apps/web/src/engine/project/store.js';
import { loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { findThirdPerson } from '../apps/web/src/engine/editor/index.js';
import { mindStats } from '../apps/web/src/engine/mind/index.js';
import { modelWithReading, projectWith } from './helpers.js';
import { makeLongText } from './fixtures/long-text.mjs';

await loadLibrary();

// The project mind and the editorial instruments inside Brainstorm: the whole path from what the writer says (earlier, in the same project) to the prompt the
// model is shown and the reply the writer reads. Fake models only; the real model is measured by the labs.

const noModel = (extra = {}) => new Orchestrator({ engine: new AIEngine({ local: null, online: null, isOnline: () => false }), ...extra });
function withModel(replyFn, { extra = {}, ...opts } = {}) {
  const calls = [];
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: modelWithReading(replyFn, { calls, ...opts }) };
  return { o: new Orchestrator({ engine: new AIEngine({ local, online: null, isOnline: () => false }), ...extra }), calls };
}
const say = (o, project, message) => o.brainstorm({ project, message });
const promptOf = (call) => call.messages.map((m) => m.content).join('\n');

const TOLD = [
  'The harbour bell is made of bronze and older than the village charter.',
  'The harbourmaster Corin is hiding gambling debts from everyone.',
  'Mara wants to find out who sank the bell before the regatta.',
  'The baker Ines watches the whole harbour from her upstairs window.',
  'Everyone in the village keeps their promises except the ferryman Piet.',
  'The regatta is held every autumn on the longest night of the tide.',
  'There is a brass lantern that only lights when someone is lying.',
  'Mara carries her late father\'s compass wherever she goes.',
];

test('what the writer said many turns ago is put in front of the model when it bears on a later question, and the reply says so', async () => {
  const { o, calls } = withModel(() => 'Corin\'s debts could drive the whole plot, and the lantern could catch him out.', { reading: () => ({ task: 'develop', topic: '' }) });
  const project = projectWith();
  for (const m of TOLD) await say(o, project, m);
  // lots of unrelated chatter in between pushes the early facts out of the recent history
  for (let i = 0; i < 12; i++) await say(o, project, `Quick note ${i}: the weather in the second act is grey and the pace is slow.`);
  calls.length = 0;
  const r = await say(o, project, 'What could the harbourmaster do when the lantern lights up?');
  const prompt = calls.map(promptOf).join('\n');
  assert.match(prompt, /gambling debts/, 'the early statement about Corin reached the prompt');
  assert.ok(r.recalled.length > 0, 'the reply carries what it drew on');
  assert.ok(r.recalled.some((x) => /gambling debts/.test(x.text)), 'in the writer\'s own words');
  assert.ok(r.recalled.every((x) => x.where), 'with where each came from');
});

test('nothing the writer said can be recalled by another project: a new project starts with an empty mind, and a switch drops what was computed', async () => {
  const { o, calls } = withModel(() => 'That could work.');
  const a = projectWith({ title: 'A' });
  for (const m of TOLD) await say(o, a, m);
  assert.ok(mindStats(a).total > 0);

  const b = projectWith({ title: 'B' });
  assert.equal(mindStats(b).said, 0, 'factory-fresh');
  o.reset();
  calls.length = 0;
  const r = await say(o, b, 'What could the harbourmaster do when the lantern lights up?');
  assert.deepEqual(r.recalled, [], 'nothing from A');
  assert.doesNotMatch(calls.map(promptOf).join('\n'), /gambling|Corin|bronze|Mara/, 'nothing from A reached the model');
  // and A still holds its own
  assert.ok(mindStats(a).total >= TOLD.length - 1);
  assert.equal(JSON.stringify(b.mind).includes('Corin'), false);
});

test('the mind is saved with the project, comes back after a reload, and is removed with it', async () => {
  const storage = memoryStorage();
  const store = new ProjectStore(storage);
  const { o } = withModel(() => 'Noted.');
  const p = store.create({ title: 'Salt Road' });
  const other = store.create({ title: 'Other' });
  await say(o, p, 'The salt road crosses a frozen lake that is only safe in January.');
  await say(o, p, 'The courier Hesper never speaks above a whisper.');
  store.save(p);
  store.save(other);
  const reloaded = new ProjectStore(storage).load(p.id);
  assert.ok(mindStats(reloaded).total >= 2, 'what was told is still held after a reload');
  assert.match(JSON.stringify(reloaded.mind), /frozen lake/);
  assert.equal(mindStats(new ProjectStore(storage).load(other.id)).said, 0, 'the other saved project holds none of it');
  assert.equal(JSON.stringify(new ProjectStore(storage).load(other.id)).includes('frozen lake'), false);
  store.delete(p.id);
  assert.equal([...storage.keys()].filter((k) => k.includes(p.id)).length, 0, 'every key of the project is gone');
  assert.ok([...storage.keys()].some((k) => k.includes(other.id)), 'the other project is untouched');
});

test('"what do you remember?" is answered from what is really held (no model), in the writer\'s own words, and does not remember itself', async () => {
  const { o, calls } = withModel(() => 'Noted.');
  const project = projectWith();
  for (const m of TOLD.slice(0, 4)) await say(o, project, m);
  calls.length = 0;
  const before = mindStats(project).total;
  const r = await say(o, project, 'What do you remember about my story?');
  assert.equal(calls.length, 0, 'the model was not asked');
  assert.equal(r.route, 'builtin');
  assert.match(r.reply, /bronze|gambling debts|Mara/);
  assert.match(r.reply, /Everything NIE holds/);
  assert.match(r.reply, /only|this project/i);
  assert.equal(mindStats(project).total, before, 'the question itself was not stored as something the writer said');

  const fresh = projectWith({ title: 'Fresh' });
  const none = await say(o, fresh, 'What have I told you so far?');
  assert.doesNotMatch(none.reply, /bronze|gambling|Mara/, 'a different project holds none of it');
});

test('"what do you know about three-act structure?" is still a question for the library, not the memory', async () => {
  const { o } = withModel(() => 'Three acts: setup, confrontation, resolution.');
  const project = projectWith();
  await say(o, project, TOLD[0]);
  const r = await say(o, project, 'What do you know about three-act structure?');
  assert.doesNotMatch(r.reply, /Everything NIE holds/);
});

test('with the mind switched off nothing is recalled and nothing is stored (for A/B runs)', async () => {
  const { o, calls } = withModel(() => 'Fine.', { extra: { mind: false } });
  const project = projectWith();
  for (const m of TOLD) await say(o, project, m);
  assert.equal(mindStats(project).said, 0);
  const r = await say(o, project, 'What could the harbourmaster do when the lantern lights up?');
  assert.deepEqual(r.recalled, []);
  assert.ok(calls.length > 0);
});

// ── a long text with no question: the read-back ──────────────────────────────

const { text: BIBLE } = makeLongText({ words: 6000, seed: 11 });

test('a text pasted with no question is read back from what was counted in it: no model words it, it speaks to you, and it ends with one question', async () => {
  const { o, calls } = withModel(() => 'SHOULD NOT BE ASKED');
  const project = projectWith();
  const r = await say(o, project, BIBLE);
  assert.equal(r.route, 'builtin');
  assert.equal(r.agent?.act, 'readback');
  assert.equal(calls.length, 0, 'the answer model was not asked');
  assert.deepEqual(findThirdPerson(r.reply), [], 'never talks about "the writer" to the writer');
  assert.match(r.reply, /Chapter|section/i, 'says what it looked at');
  assert.equal((r.reply.match(/\?/g) ?? []).length <= 1, true, 'at most one question');
  assert.doesNotMatch(r.reply, /^(?:great|wonderful|fascinating|what a)/i, 'no praise opener');
});

test('a question about a long text carries the measured facts to the model, and a reply naming something that is not in the text is cut', async () => {
  const { o, calls } = withModel(() => 'Ilsa Quade is the strongest presence in it. Zephyrine Blackwood hijacks the middle chapters with a sword.', { reading: () => ({ task: 'feedback', topic: '' }) });
  const project = projectWith();
  await say(o, project, BIBLE);
  calls.length = 0;
  const r = await say(o, project, 'Who are the main characters in this text and how is the pacing?');
  const prompt = calls.map(promptOf).join('\n');
  assert.match(prompt, /Measured from the text itself/, 'the model is given counted facts');
  assert.match(r.reply, /Ilsa Quade/);
  assert.doesNotMatch(r.reply, /Zephyrine|Blackwood/, 'a name that is not in the text is left out');
  assert.match(r.reply, /left out part of that reply/i, 'and it says so');
});

test('when everything a reply names is invented, the reply is withheld with an honest note and built-in guidance', async () => {
  const { o } = withModel(() => 'Zephyrine Blackwood duels Maximilian Starfall at Castle Dunravel.', { reading: () => ({ task: 'feedback', topic: '' }) });
  const project = projectWith();
  await say(o, project, BIBLE);
  const r = await say(o, project, 'Who are the main characters in this text?');
  assert.equal(r.route, 'builtin');
  assert.match(r.reply, /could not find in your text/i);
  assert.doesNotMatch(r.reply, /Zephyrine|Starfall|Dunravel/);
});

test('a reply that talks about "the writer" to the writer is asked again once, and the "you" version is the one shown', async () => {
  let n = 0;
  const { o, calls } = withModel(() => (++n === 1 ? 'The writer sets up a stark world. How does the writer keep the reader curious about Corin Ashby?' : 'You set up a stark world, and I\'d look at how you keep a reader curious about Corin Ashby.'));
  const project = projectWith();
  const r = await say(o, project, 'I have a few thoughts about the opening of my story, which starts with a quiet harbour and a missing bell. What do you think about it?');
  assert.deepEqual(findThirdPerson(r.reply), []);
  assert.ok(calls.length >= 2, 'it asked again');
});

test('NIE never writes the writer\'s text: a pasted text with a request to rewrite it is still declined before any model call', async () => {
  const { o, calls } = withModel(() => 'SHOULD NOT BE ASKED');
  const project = projectWith();
  const r = await say(o, project, `Please rewrite this so it flows better.\n\n${BIBLE}`);
  assert.equal(r.declined, true);
  assert.equal(calls.length, 0);
});

test('with no model the same questions still work and recall from the project is honest about being lexical', () => {
  const o = noModel();
  const project = projectWith();
  return say(o, project, TOLD[1]).then(async () => {
    const r = await say(o, project, 'What did I tell you about Corin?');
    assert.ok(['builtin', 'local'].includes(r.route));
    assert.ok(Array.isArray(r.recalled));
  });
});
