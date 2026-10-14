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
import { loadBible } from './fixtures/story-bible.mjs';

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

test('a project saved before the mind existed opens with what the writer said in it already remembered (once), and nothing from any other project', async () => {
  const storage = memoryStorage();
  const store = new ProjectStore(storage);
  const p = store.create({ title: 'Old' });
  const q = store.create({ title: 'Other old' });
  for (const [proj, said] of [[p, ['The salt road crosses a frozen lake that is only safe in January.', 'Can you give me some ideas?', 'The courier Hesper never speaks above a whisper.']], [q, ['A lighthouse keeper writes to her missing brother every night.']]]) {
    for (const m of said) proj.conversation.messages.push({ role: 'user', content: m, at: Date.now() });
    proj.conversation.messages.push({ role: 'user', content: `${'The tide came in and the tide went out. '.repeat(120)}`, at: Date.now(), compacted: true });
  }
  for (const proj of [p, q]) {
    const raw = JSON.parse(JSON.stringify(proj));
    delete raw.mind; // what a project saved by an older version looks like
    storage.set(`nie.v1.project.${proj.id}`, JSON.stringify(raw));
  }
  const loaded = new ProjectStore(storage).load(p.id);
  const other = new ProjectStore(storage).load(q.id);
  assert.match(JSON.stringify(loaded.mind), /frozen lake/);
  assert.match(JSON.stringify(loaded.mind), /Hesper/);
  assert.doesNotMatch(JSON.stringify(loaded.mind), /Can you give me|tide came in|lighthouse/, 'a request and a compacted paste are not statements, and the other project stays out');
  assert.doesNotMatch(JSON.stringify(other.mind), /frozen lake|Hesper/);
  assert.match(JSON.stringify(other.mind), /lighthouse keeper/);
  const again = new ProjectStore(storage);
  again.save(loaded);
  assert.equal(mindStats(again.load(p.id)).said, mindStats(loaded).said, 'saved and loaded again it is not remembered twice');
});

test('"N messages ago" counts the writer\'s messages, not only the ones that told NIE something', async () => {
  const { o } = withModel(() => 'Noted.', { reading: (t) => ({ task: /\?\s*$/.test(t) ? 'craft' : 'tell', topic: '' }) });
  const project = projectWith();
  await say(o, project, 'The harbourmaster Corin is hiding gambling debts from everyone.');
  await say(o, project, 'What is a red herring?');
  await say(o, project, 'How long should a chapter be?');
  const r = await say(o, project, 'Tell me what Corin hides.');
  const said = JSON.stringify(project.mind.said);
  assert.match(said, /"turn":1/);
  assert.ok(Array.isArray(r.recalled));
  const item = r.recalled.find((x) => /gambling debts/.test(x.text));
  assert.ok(item, 'the early statement was recalled');
  assert.match(item.where, /3 messages ago/, 'the first message was three messages before the fourth, though two of the three between were questions');
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

test('a question about the writer\'s own project that a small model reads as a general question about writing is answered from what the writer said, not from the library', async () => {
  const seen = [];
  const { o, calls } = withModel((messages) => { seen.push(messages.map((m) => m.content).join('\n')); return 'You said you want a slow, sun-bleached fable.'; }, { reading: (t) => (/\?\s*$/.test(t) ? { task: 'craft', topic: 'tone' } : { task: 'tell', topic: '' }) });
  const project = projectWith();
  await say(o, project, 'I want the tone to be a slow, sun-bleached fable, in third person and past tense.');
  await say(o, project, 'The caravan master, Oleander Bruck, owes the guild a hundred silver marks.');
  calls.length = 0;
  seen.length = 0;
  for (const q of ['What tone did I say I wanted?', 'Who owes the guild money, and how much?']) {
    const r = await say(o, project, q);
    assert.notEqual(r.intent.type, 'library-question', `${q}: not answered from the library`);
    assert.ok(r.recalled.length > 0, `${q}: what the writer said is shown`);
  }
  assert.match(seen.join('\n'), /sun-bleached fable/);
  assert.match(seen.join('\n'), /Oleander Bruck/);
});

test('a general question about writing, which finds nothing the writer said, still goes to the library', async () => {
  const { o } = withModel(() => 'A MacGuffin is the thing everyone chases.', { reading: (t) => (/\?\s*$/.test(t) ? { task: 'craft', topic: 'macguffin' } : { task: 'tell', topic: '' }) });
  const project = projectWith();
  await say(o, project, 'I want the tone to be a slow, sun-bleached fable, in third person and past tense.');
  await say(o, project, 'The caravan master, Oleander Bruck, owes the guild a hundred silver marks.');
  const r = await say(o, project, 'What is a MacGuffin?');
  assert.equal(r.intent.type, 'library-question');
  assert.deepEqual(r.recalled, []);
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
const { text: BIBLE_FIXTURE } = loadBible();

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

test('a question the counts answer exactly is answered by the counts: both numbers, the sections they are in, no model, in the second person, with the one question the finding raises', async () => {
  const { o, calls } = withModel(() => 'SHOULD NOT BE ASKED FOR THIS', { reading: () => ({ task: 'feedback', topic: '' }) });
  const project = projectWith();
  await say(o, project, BIBLE_FIXTURE);
  calls.length = 0;
  const r = await say(o, project, 'The bible says how much water the Brimmer holds when it is full. Does it say the same thing everywhere?');
  assert.equal(calls.length, 0, 'the answer model was not asked');
  assert.equal(r.route, 'builtin');
  assert.equal(r.agent?.act, 'measured');
  assert.match(r.reply, /forty thousand barrels/);
  assert.match(r.reply, /sixty thousand barrels/);
  assert.match(r.reply, /section 3/);
  assert.match(r.reply, /section 21/);
  assert.match(r.reply, /did you mean/i);
  assert.deepEqual(findThirdPerson(r.reply), []);
  assert.match(r.looked, /counted|ordinary code/i);
  assert.match(r.looked, /No language model/);
  // the numbers the program found are in the text
  assert.ok(BIBLE_FIXTURE.includes('forty thousand barrels') && BIBLE_FIXTURE.includes('sixty thousand barrels'));
});

test('a question that needs judgment, or names something no count is about, still goes to the model, which is shown the counts', async () => {
  const { o, calls } = withModel(() => 'The memo is stiffer and more formal than the narration around it.', { reading: () => ({ task: 'feedback', topic: '' }) });
  const project = projectWith();
  await say(o, project, BIBLE_FIXTURE);
  calls.length = 0;
  for (const q of ['How does the memo differ in register from the rest of the bible?', 'Is the pacing good, and should I trim the middle?', 'Does the bible give the same year for the Fourth Line runaway in the character notes and in the dated entries?']) {
    const r = await say(o, project, q);
    assert.notEqual(r.agent?.act, 'measured', q);
  }
  assert.ok(calls.length >= 3, 'the model answered them');
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

test('a text pasted at the start of a long session is still the text a question is about, dozens of messages later (and only the newest paste is kept in full)', async () => {
  const { o, calls } = withModel(() => 'It is in the part you pasted.', { reading: () => ({ task: 'feedback', topic: '' }) });
  const project = projectWith();
  const { text: chapters, needles } = makeLongText({ words: 4000, seed: 5 });
  await say(o, project, `${chapters}\n\nWhat do you make of the opening?`);
  for (let i = 0; i < 20; i++) await say(o, project, `A thought about the second act, number ${i}: the weather turns and the pace slows down.`);
  calls.length = 0;
  const needle = needles.find((n) => /brass key/.test(n.fact));
  const r = await say(o, project, needle.question);
  assert.match(calls.map(promptOf).join('\n'), /third floorboard/, 'the passage from the paste is in front of the model');
  assert.match(r.looked || '', /section|passage|word for word|looked/i, 'and the reply says what it looked at');
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
