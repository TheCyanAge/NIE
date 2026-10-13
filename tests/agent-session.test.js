import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { AIError } from '../apps/web/src/engine/ai/openai-client.js';
import { createAgent, parseShelfCommand } from '../apps/web/src/engine/agent/agent.js';
import { KIND_QUESTIONS } from '../apps/web/src/engine/agent/plan.js';
import { questionProblems } from '../apps/web/src/engine/agent/packs/schema.js';
import { emptyAgentState, sanitizeAgentState, stemList } from '../apps/web/src/engine/agent/state.js';
import { similarity } from '../apps/web/src/engine/orchestrator/variety.js';
import { projectWith } from './helpers.js';

// ── small packs, written here so these tests never depend on the real content packs ──────────────────────────────
const Q = {
  open: (x, y) => `What should a reader understand first about ${x}, given ${y}?`,
  either: (x, y) => `Is ${x} something the reader learns early, or does ${y} come first?`,
  whatif: (x, y) => `What if ${x} turned out to be the opposite of what {who} expects from ${y}?`,
  probe: (x, y) => `You mentioned {thing}: how does ${x} connect to ${y}?`,
  concrete: (x, y) => `What is one small, specific detail that shows ${x} within ${y}?`,
  constraint: (x, y) => `What must never change about ${x} or ${y}, whatever else you rework?`,
  reader: (x, y) => `What do you want a reader to feel when they meet ${x} and ${y}?`,
  contrast: (x, y) => `How would ${x} look different from ${y} if told by {other}?`,
};
const slot = (id, label, x, y, { core = false, weight = 1, after = [], next = [], memory } = {}) => ({
  id, label, core, weight, hint: `what the writer says about ${x}, in their own words`, after, next, ...(memory ? { memory } : {}),
  questions: Object.entries(Q).map(([type, f]) => ({ type, text: f(x, y) })),
});
const pack = (kind, slots) => ({ kind, intro: `A ${kind} test pack`, noun: kind, slots });
const STORY = [
  slot('premise', 'Premise', 'the premise', 'the hook of the book', { core: true, weight: 3, next: ['protagonist', 'setting'] }),
  slot('protagonist', 'Main character', 'the protagonist', 'the lead role', { core: true, weight: 3, next: ['want'], memory: 'character' }),
  slot('want', 'What they want', 'the central desire', 'the driving want', { core: true, weight: 3, after: ['protagonist'], next: ['obstacle'] }),
  slot('obstacle', 'What stands in the way', 'the main obstacle', 'the barrier', { core: true, weight: 2, after: ['want'], next: ['stakes'] }),
  slot('stakes', 'Stakes', 'the stakes', 'the price of failure', { core: true, weight: 2, after: ['want'], next: ['ending'] }),
  slot('setting', 'Setting', 'the setting', 'the place and period', { core: true, weight: 2, after: ['premise'], next: ['tone'], memory: 'setting' }),
  slot('tone', 'Tone', 'the tone', 'the mood', { after: ['premise'] }),
  slot('theme', 'Theme', 'the theme', 'the deeper meaning', { memory: 'theme' }),
  slot('ending', 'Ending', 'the ending', 'the final scene', { weight: 2, after: ['stakes'] }),
  slot('motifs', 'Motif', 'the recurring image', 'the repeated symbol', { memory: 'motif' }),
  slot('cast', 'Supporting cast', 'the supporting cast', 'the ensemble', { after: ['protagonist'], memory: 'character' }),
  slot('voice', 'Voice', 'the narrator voice', 'the telling style'),
];
const POEM = [
  slot('image', 'Central image', 'the central image', 'the picture', { core: true, weight: 3, next: ['feeling'] }),
  slot('speaker', 'Speaker', 'the speaker', 'the voice speaking', { core: true, weight: 2, memory: 'character' }),
  slot('feeling', 'Feeling', 'the feeling', 'the emotion', { core: true, weight: 3, after: ['image'] }),
  slot('turn', 'The turn', 'the turn', 'the pivot', { core: true, weight: 2, after: ['feeling'] }),
  slot('sound', 'Sound', 'the sound', 'the music of the words', { core: true, weight: 2 }),
  slot('form', 'Form', 'the form', 'the pattern'),
  slot('title', 'Title', 'the title', 'the name'),
  slot('ending-note', 'Last line', 'the last line', 'the closing line'),
];
const OTHER = [
  slot('idea', 'The idea', 'the idea', 'the seed', { core: true, weight: 3, next: ['who'] }),
  slot('who', 'Who it is about', 'the person at the center', 'the central person', { core: true, weight: 3, memory: 'character' }),
  slot('purpose', 'Purpose', 'the purpose', 'the reason', { core: true, weight: 2, after: ['idea'] }),
  slot('detail', 'Key detail', 'the key detail', 'the vivid particular', { core: true, weight: 2, after: ['idea'] }),
  slot('audience', 'Audience', 'the audience', 'the intended readers', { core: true, weight: 2 }),
  slot('tone', 'Tone', 'the tone', 'the mood'),
  slot('shape', 'Shape', 'the shape', 'the structure'),
  slot('limits', 'Limits', 'the limits', 'the boundaries'),
];
const testPacks = () => ({
  kinds: { story: pack('story', STORY), poem: pack('poem', POEM), other: pack('other', OTHER) },
  forms: [{ id: 'picture-book', label: 'Picture book', match: ['picture book'], baseKinds: ['story'], drop: ['voice'], add: [slot('page-turns', 'Page turns', 'the page turns', 'the reveal moments', { core: true, weight: 2, after: ['obstacle'] }), slot('illustration', 'Pictures', 'the pictures', 'the art', { after: ['page-turns'] })] }],
  genres: [{ id: 'cozy-mystery', label: 'Cozy mystery', match: ['cozy mystery', 'cozy'], baseKinds: ['story'], add: [slot('culprit', 'The culprit', 'the culprit', 'the guilty party', { core: true, weight: 2, after: ['obstacle'] }), slot('clues', 'Clues', 'the clues', 'the evidence', { after: ['culprit'] })] }],
});
/** A story pack with thirty slots, each with its own words, for pacing runs that must not run out of things to ask. */
const bigPacks = () => ({ kinds: { story: pack('story', Array.from({ length: 30 }, (_, i) => slot(`part-${i}`, `Part ${i}`, `topic${'abcdefghijklmnopqrstuvwxyz'[i % 26]}${i}a`, `topic${'abcdefghijklmnopqrstuvwxyz'[(i * 7) % 26]}${i}b`, { core: i < 6, weight: 1 }))), other: pack('other', OTHER) }, forms: [], genres: [] });

// ── a scripted writer and a fake "model" ─────────────────────────────────────
const ANSWER = {
  premise: 'A lighthouse keeper named Mara hears a drowned bell in the fog every winter night.',
  protagonist: 'Mara is a lighthouse keeper who never leaves the island.',
  want: 'Mara wants to find her brother who vanished on the ferry.',
  obstacle: 'The winter sea and her own fear of leaving the island stand in the way.',
  stakes: 'If she fails the whole village will lose its only light.',
  setting: 'It is set in a harbour town in winter fog.',
  tone: 'The tone is quiet and haunted with a little dry humour.',
  theme: 'The theme is forgiveness and what we owe the dead.',
  ending: 'The ending is bittersweet and hopeful.',
  motifs: 'The recurring image is the bell.',
  cast: 'Her neighbour Corin knows more than he says.',
  voice: 'The voice is a close and wry narrator.',
};
const FILLER = [
  'I keep thinking about how quiet the island gets after the last ferry leaves.',
  'There is a lot of fog in my head about how the middle of this should go.',
  'Sometimes I picture the lighthouse from the water at dawn.',
  'My sister says the bell scene is the part she remembers most.',
  'I am not sure yet how much of the past to show early on.',
  'It helps to say all this out loud, honestly.',
];
const FIRST = 'A lighthouse keeper named Mara hears a drowned bell in the fog every winter night, and it is a story I want to tell.';

/** The writer answers whatever NIE asked, or says something that fills nothing; "Not yet." to an offer. */
function cooperative(i, project) {
  const p = project.conversation.agent?.pending;
  if (i === 0) return FIRST;
  if (p?.kind === 'offer') return 'Not yet.';
  if (p?.kind === 'question') return p.slot === null ? 'It is a story.' : ANSWER[p.slot] ?? `My thoughts on ${p.slot} are still forming, to be honest.`;
  return FILLER[i % FILLER.length];
}

/** A fake model for the extraction call: it files the message under the slot its words point at. Anything else is an empty answer. */
const KEYWORDS = [['stakes', /\bwill lose\b|\bstakes\b/i], ['want', /\bwants?\b/i], ['obstacle', /\bstand in the way\b|\bobstacle\b/i], ['setting', /\bset in\b/i], ['ending', /\bending\b/i], ['tone', /\btone\b/i], ['theme', /\btheme\b/i], ['motifs', /\brecurring\b/i], ['cast', /\bneighbour\b/i], ['voice', /\bnarrator\b/i]];
function keywordModel(calls = [], table = {}) {
  return async (messages, opts) => {
    calls.push({ messages, opts });
    if (opts?.purpose !== 'extract') return { text: null };
    const body = messages.at(-1).content;
    const msg = body.match(/"""\n([\s\S]*?)\n"""/)?.[1] ?? '';
    const ids = new Set(body.match(/^[a-z-]+(?=: )/gm));
    const updates = table[msg] ?? [];
    if (!table[msg]) {
      const hit = KEYWORDS.find(([id, re]) => ids.has(id) && re.test(msg));
      if (hit) updates.push({ slot: hit[0], value: msg.replace(/[.!]+$/, '') });
      if (/\bMara\b/.test(msg) && ids.has('protagonist') && !hit) updates.push({ slot: 'protagonist', value: 'Mara' });
    }
    return { text: JSON.stringify({ updates: updates.slice(0, 4), extra: '' }), route: 'local' };
  };
}

/** What a model might reply: a sentence about what the writer said, and (on a turn that asks) a question of its own, good or generic. */
function modelReply(t, i) {
  const base = `That gives me a clearer picture of ${(t.state.slots.premise?.value ?? 'the idea').split(' ').slice(0, 6).join(' ')}.`;
  if (t.plan.act === 'ask') return i % 2 ? `${base} What do you think?` : `${base} Does Mara tell anyone about the bell?`;
  return base;
}

/** Play a conversation. Returns one entry per turn. `writer(i, project)` says what the writer types next. */
async function play(agent, project, { turns, writer = cooperative, chat = null, reading = { task: 'tell' }, seed, stopOn } = {}) {
  const log = [];
  const said = [];
  for (let i = 0; i < turns; i++) {
    const message = writer(i, project, log);
    const t = await agent.turn({ project, message, reading, chat, recentMessages: said.slice(), seed });
    said.push(message);
    let reply = t.handled?.reply;
    if (!reply) {
      reply = t.enforce(modelReply(t, i));
      t.record(reply);
    }
    const entry = { i, message, reply, handled: t.handled?.kind ?? null, act: t.plan.act, reason: t.plan.reason, turn: t.state.turn, note: t.note, asked: t.plan.act === 'ask' && /\?/.test(reply), t };
    log.push(entry);
    if (stopOn?.(entry)) break;
  }
  return log;
}
const newProject = (id = 'p1') => Object.assign(projectWith({}), { id });
const askedTexts = (project) => project.conversation.agent.asked.map((a) => a.text);
const infoTurns = (log) => log.filter((e) => e.act === 'ask' || e.act === 'reflect');

test('a turn hands back what the orchestrator needs, and keeps the state inside the project', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject();
  assert.deepEqual(agent.state(project), emptyAgentState(), 'a fresh project\'s agent state is empty');
  assert.deepEqual(project.conversation.agent, emptyAgentState(), 'and is created in the project');
  const t = await agent.turn({ project, message: FIRST, reading: { task: 'tell' } });
  assert.deepEqual(Object.keys(t).sort(), ['ack', 'act', 'brief', 'enforce', 'handled', 'plan', 'record', 'state']);
  assert.equal(t.handled, null);
  assert.equal(t.plan.act, 'ask');
  assert.equal(typeof t.brief, 'string');
  assert.match(t.brief, /What you understand so far \(the writer's own words\):/);
  assert.match(t.brief, /This turn:\nReply to what they just said in one or two sentences, then ask exactly ONE question about/);
  assert.equal(t.state.kind, 'story');
  assert.equal(t.state.turn, 1);
  assert.deepEqual(project.conversation.agent, t.state, 'the project holds the new state');
  assert.ok(t.state.slots.premise && t.state.slots.protagonist, 'read by the rules, with no model');
  assert.ok(JSON.stringify(project).length < 20000);
  // enforce makes the reply obey the plan; record remembers the question the writer actually saw
  assert.equal(t.state.pending, null, 'nothing is pending until the reply is recorded');
  const final = t.enforce('That is a vivid opening.');
  assert.match(final, /^That is a vivid opening\.\n\n.+\?$/);
  t.record(final);
  const after = agent.state(project);
  assert.equal(after.pending.kind, 'question');
  assert.equal(after.pending.text, final.split('\n\n')[1]);
  assert.deepEqual(after.asked.map((a) => a.text), [after.pending.text]);
  assert.equal(after.sinceAsk, 0);
  // a reply with no question records nothing
  const t2 = await agent.turn({ project, message: ANSWER.setting, reading: { task: 'tell' } });
  t2.record('Noted, a harbour town in the fog.');
  assert.equal(agent.state(project).asked.length, 1);
  assert.equal(agent.state(project).pending, null);
  assert.deepEqual((await agent.turn({ project, message: '   ' })).handled, null);
});

test('in auto mode NIE asks about 40-60% of the time, never three in a row, and never the same question twice (30+ turns, several seeds)', async () => {
  for (const seed of ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta']) {
    const agent = createAgent({ packs: bigPacks(), config: { readyScore: 5 } });
    const project = newProject(`rate-${seed}`);
    const log = await play(agent, project, { turns: 40, seed });
    const turns = infoTurns(log);
    assert.ok(turns.length >= 38, 'every turn was an ordinary one');
    const rate = turns.filter((e) => e.asked).length / turns.length;
    assert.ok(rate >= 0.35 && rate <= 0.65, `seed ${seed}: asked ${(rate * 100).toFixed(0)}% of ${turns.length} turns`);
    assert.ok(!turns.map((e) => (e.asked ? 'A' : '-')).join('').includes('AAA'), `seed ${seed}: never three in a row`);
    assert.equal(log[0].asked, true, 'the first turn asks');
    const asked = askedTexts(project);
    assert.equal(new Set(asked.map((t) => t.toLowerCase())).size, asked.length, 'no question text twice');
    for (let a = 0; a < asked.length; a++) for (let b = a + 1; b < asked.length; b++) assert.ok(similarity(asked[a], asked[b]) < 0.6, `"${asked[a]}" / "${asked[b]}"`);
    assert.ok(log.every((e) => e.reply.split('?').length <= 2), 'never more than one question in a reply');
    assert.ok(log.filter((e) => !e.asked).every((e) => !/\?/.test(e.reply)), 'turns that do not ask carry no question at all');
  }
});

test('the same conversation with the same seed is the same; another seed asks differently', async () => {
  const run = async (seed) => {
    const agent = createAgent({ packs: bigPacks(), config: { readyScore: 5 } });
    const project = newProject('det');
    const log = await play(agent, project, { turns: 24, seed });
    return log.map((e) => `${e.act}|${e.reply}`);
  };
  assert.deepEqual(await run('one'), await run('one'));
  assert.notDeepEqual(await run('one'), await run('two'));
});

test('interview mode asks on at least 90% of turns, quiet mode never asks, and the writer can change it any time', async () => {
  const agent = createAgent({ packs: bigPacks(), config: { readyScore: 5 } });
  const project = newProject('modes');
  await play(agent, project, { turns: 2 });
  const set = await agent.turn({ project, message: 'ask me one at a time', reading: { task: 'chat' } });
  assert.deepEqual([set.handled.kind, set.state.mode], ['mode', 'interview']);
  assert.match(set.handled.reply, /one/i);
  let log = await play(agent, project, { turns: 20, writer: (i, p) => (p.conversation.agent.pending?.slot ? ANSWER.want : FILLER[i % FILLER.length]) });
  assert.ok(log.filter((e) => e.asked).length / log.length >= 0.9, `interview: ${log.filter((e) => e.asked).length} of ${log.length}`);
  const quiet = await agent.turn({ project, message: 'stop asking questions', reading: { task: 'chat' } });
  assert.deepEqual([quiet.handled.kind, quiet.state.mode], ['mode', 'quiet']);
  assert.notEqual(quiet.handled.reply, set.handled.reply);
  log = await play(agent, project, { turns: 24, writer: (i) => FILLER[i % FILLER.length] });
  assert.equal(log.filter((e) => e.asked).length, 0);
  assert.ok(log.every((e) => !/\?/.test(e.reply)));
  assert.ok(log.every((e) => e.act === 'reflect'));
  const again = await agent.turn({ project, message: 'you can ask again', reading: { task: 'chat' } });
  assert.equal(again.state.mode, 'auto');
  log = await play(agent, project, { turns: 20, writer: (i, p) => (p.conversation.agent.pending?.slot ? ANSWER.want : FILLER[i % FILLER.length]) });
  assert.ok(log.some((e) => e.asked), 'questions are back');
  // the mode survives a save and a reload
  const reloaded = JSON.parse(JSON.stringify(project));
  assert.equal(agent.state(reloaded).mode, 'auto');
  assert.equal(agent.state(reloaded).asked.length, project.conversation.agent.asked.length);
});

test('questions that go unanswered are skipped, not repeated: the writer changes the subject', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('skip');
  const first = await agent.turn({ project, message: FIRST, reading: { task: 'tell' } });
  const q = first.enforce('Nice start.');
  first.record(q);
  const slotAsked = project.conversation.agent.pending.slot;
  const next = await agent.turn({ project, message: 'Give me some twists for the middle.', reading: { task: 'ideas' } });
  assert.equal(next.plan.act, 'serve');
  assert.equal(next.state.asked[0].skipped, true, 'a request instead of an answer: the question was skipped');
  assert.equal(next.state.pending, null);
  assert.equal(next.enforce('Here is a twist: the bell rings for the living. Does that help?').includes('?'), false, 'a serve turn does not interview');
  for (let i = 0; i < 6; i++) {
    const t = await agent.turn({ project, message: FILLER[i], reading: { task: 'tell' } });
    if (t.plan.act === 'ask') assert.notEqual(t.plan.slot, slotAsked, 'not re-asked within eight turns');
    t.record(t.enforce('Mm.'));
  }
});

test('the offer comes only when NIE grasps the idea, never before the fourth turn, and shows exactly what is recorded', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('offer');
  const table = {
    [FIRST]: [{ slot: 'premise', value: 'A lighthouse keeper named Mara hears a drowned bell' }, { slot: 'protagonist', value: 'Mara' }, { slot: 'setting', value: 'in the fog every winter night' }],
    'Mara wants to find her brother who vanished on the ferry and the sea and her fear stand in the way.': [{ slot: 'want', value: 'to find her brother who vanished on the ferry' }, { slot: 'obstacle', value: 'the sea and her fear' }],
    'If she fails the whole village will lose its only light.': [{ slot: 'stakes', value: 'the whole village will lose its only light' }],
  };
  const chat = keywordModel([], table);
  const msgs = [FIRST, 'Mara wants to find her brother who vanished on the ferry and the sea and her fear stand in the way.', 'If she fails the whole village will lose its only light.', 'I keep thinking about how quiet the island gets after the last ferry leaves.', 'The tone is quiet and haunted with a little dry humour.'];
  const log = await play(agent, project, { turns: 4, chat, writer: (i) => msgs[i] });
  // every core slot is filled by turn 3, but not an offer before turn 4
  const grasped = log.map((e) => agent.describe({ conversation: { agent: e.t.state } }).grasp);
  assert.equal(grasped[2].score, 1, 'by turn 3 all the core slots are filled');
  assert.deepEqual(log.slice(0, 3).map((e) => e.handled), [null, null, null], 'no offer in the first three turns');
  assert.equal(log[3].handled, 'offer', 'the fourth turn: ready, so offered');
  assert.equal(log[3].turn, 4);
  const offer = log[3].t.handled;
  assert.deepEqual(offer.suggestions.map((s) => s.label), ['Yes, keep it', 'Let me add something', 'Not yet']);
  assert.match(offer.reply, /^Here's what I've got so far, in your words:\n• Premise: A lighthouse keeper named Mara hears a drowned bell\n• Main character: Mara\n/);
  assert.match(offer.reply, /• What they want: to find her brother who vanished on the ferry/);
  assert.match(offer.reply, /Want me to keep this on your Idea Board and in this project's memory\? You can add or change anything first\.$/);
  assert.ok(!/Warmth|poison|invented/.test(offer.reply));
  assert.deepEqual(agent.state(project).pending, { kind: 'offer', turn: 4, partial: false });
  // a plain detail while the offer waits is read as an addition (it is long enough to carry new detail), and the offer stays open
  const fifth = await agent.turn({ project, message: msgs[4], reading: { task: 'tell' }, chat });
  assert.equal(fifth.handled.kind, 'added');
  assert.match(fifth.handled.reply, /^Added: Tone - The tone is quiet and haunted with a little dry humour\. Anything else, or shall I keep it\?$/);
  assert.equal(fifth.state.pending.kind, 'offer');
});

test('"yes" keeps the idea: on the Idea Board and in project memory, with the sheet kept for further work', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('yes');
  const log = await play(agent, project, { turns: 30, stopOn: (e) => e.handled === 'offer' });
  assert.equal(log.at(-1).handled, 'offer', 'a cooperative writer gets an offer');
  const yes = await agent.turn({ project, message: 'Yes, keep it.', reading: { task: 'chat' } });
  assert.equal(yes.handled.kind, 'kept');
  assert.match(yes.handled.reply, /^Kept\. It's on your Idea Board and in this project's memory \(/);
  assert.equal(project.brainstorm.board.length, 1);
  assert.equal(project.brainstorm.board[0].source, 'writer');
  assert.ok(project.brainstorm.board[0].text.includes('Mara'));
  assert.ok(project.memory.characters.some((c) => c.name === 'Mara'));
  assert.equal(yes.handled.committed.addedToBoard, true);
  assert.equal(yes.state.pending, null);
  assert.equal(yes.state.committed.length, 1);
  assert.ok(Object.keys(yes.state.slots).length >= 5, 'the sheet stays');
  // keep refining: a later "keep" updates the same entry
  const more = await agent.turn({ project, message: 'The ending is bittersweet and hopeful.', reading: { task: 'tell' }, chat: keywordModel() });
  more.record(more.enforce('Noted.'));
  const again = agent.commitNow(project);
  assert.equal(project.brainstorm.board.length, 1, 'never a duplicate');
  assert.equal(again.result.updatedBoard, true);
  const undone = agent.undo(project);
  assert.equal(undone.removed.board, 'restored');
  assert.equal(agent.undo(project).removed.board, 'removed');
  assert.equal(project.brainstorm.board.length, 0);
  assert.equal(project.memory.characters.length, 0);
});

test('"not yet" holds the offer: no new offer for four turns, then NIE may offer again', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('hold');
  const chat = keywordModel();
  const log = await play(agent, project, { turns: 30, chat, stopOn: (e) => e.handled === 'offer' });
  assert.equal(log.at(-1).handled, 'offer');
  const declined = await agent.turn({ project, message: 'Not yet.', reading: { task: 'chat' }, chat });
  assert.equal(declined.handled.kind, 'held');
  assert.match(declined.handled.reply, /nothing is saved|No rush|keep going|keep building|hold off|keep working|unsaved/i);
  assert.equal(project.brainstorm.board.length, 0, 'nothing is saved');
  assert.equal(declined.state.pending, null);
  const t0 = declined.state.turn;
  assert.equal(declined.state.declinedAt, t0);
  const kinds = [];
  for (let i = 0; i < 8; i++) {
    const t = await agent.turn({ project, message: FILLER[i % FILLER.length], reading: { task: 'tell' }, chat });
    kinds.push([t.state.turn - t0, t.handled?.kind ?? t.plan.act]);
    if (t.handled?.kind === 'offer') break;
    t.record(t.enforce('Noted.'));
  }
  const firstOffer = kinds.find(([, k]) => k === 'offer');
  assert.ok(firstOffer, 'it offers again');
  assert.ok(firstOffer[0] >= 4, `not before four turns: ${JSON.stringify(kinds)}`);
  assert.ok(kinds.filter(([n]) => n < 4).every(([, k]) => k !== 'offer'));
});

test('"also X" at the offer updates the sheet, says what changed, and offers again', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('add');
  const chat = keywordModel();
  const log = await play(agent, project, { turns: 30, chat, stopOn: (e) => e.handled === 'offer' });
  assert.equal(log.at(-1).handled, 'offer');
  const before = { ...project.conversation.agent.slots };
  const add = await agent.turn({ project, message: 'Also, the ending is bittersweet and hopeful.', reading: { task: 'tell' }, chat });
  assert.equal(add.handled.kind, 'added');
  assert.match(add.handled.reply, /^Added: Ending - the ending is bittersweet and hopeful\. Anything else, or shall I keep it\?$/);
  assert.equal(add.state.slots.ending.value, 'the ending is bittersweet and hopeful');
  assert.equal(add.state.slots.ending.via, 'added');
  assert.notDeepEqual(add.state.slots.ending, before.ending);
  assert.deepEqual(add.handled.suggestions.map((s) => s.label), ['Yes, keep it', 'Let me add something', 'Not yet']);
  assert.equal(add.state.pending.kind, 'offer', 'the offer is still waiting');
  assert.equal(typeof add.state.pending.partial, 'boolean');
  // a change to something already recorded says "Changed"
  const change = await agent.turn({ project, message: 'And the tone is bright and funny.', reading: { task: 'tell' }, chat });
  assert.match(change.handled.reply, /^Added: Tone - /);
  const change2 = await agent.turn({ project, message: 'But actually the tone is grim and sparse.', reading: { task: 'tell' }, chat });
  assert.match(change2.handled.reply, /^Changed: Tone - the tone is grim and sparse\./);
  // then yes: the added detail is in what is kept
  const yes = await agent.turn({ project, message: 'yes please', reading: { task: 'chat' } });
  assert.equal(yes.handled.kind, 'kept');
  assert.match(project.brainstorm.board[0].text, /Ending: the ending is bittersweet and hopeful/);
  assert.match(project.brainstorm.board[0].text, /Tone: the tone is grim and sparse/);
});

test('"also X" with no model: a detail that fits no slot is still recorded, under "Also"', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('noted');
  const log = await play(agent, project, { turns: 30, stopOn: (e) => e.handled === 'offer' });
  assert.equal(log.at(-1).handled, 'offer');
  const add = await agent.turn({ project, message: 'Also, she hides a brass key under the lamp.', reading: { task: 'tell' } });
  assert.equal(add.handled.kind, 'added');
  assert.match(add.handled.reply, /^Noted under "Also": she hides a brass key under the lamp\. Anything else, or shall I keep it\?$/);
  assert.equal(add.state.extra.at(-1), 'she hides a brass key under the lamp', 'the detail is recorded last, in the writer\'s words');
  await agent.turn({ project, message: 'yes', reading: { task: 'chat' } });
  assert.match(project.brainstorm.board[0].text, /Also: she hides a brass key under the lamp/);
});

test('a reply to the offer that is not clearly yes or no: ask once more, then carry on; a question gets an answer', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('unclear');
  const log = await play(agent, project, { turns: 30, stopOn: (e) => e.handled === 'offer' });
  assert.equal(log.at(-1).handled, 'offer');
  const hmm = await agent.turn({ project, message: 'hmm', reading: { task: 'unclear' } });
  assert.equal(hmm.handled.kind, 'offer');
  assert.match(hmm.handled.reply, /keep it/i);
  assert.equal(hmm.state.pending.again, true);
  const hmm2 = await agent.turn({ project, message: 'maybe', reading: { task: 'unclear' } });
  assert.equal(hmm2.handled, null, 'asked once; the second time it carries on as an ordinary message');
  assert.equal(hmm2.state.pending, null);
  assert.equal(project.brainstorm.board.length, 0);
  const log2 = await play(agent, project, { turns: 40, stopOn: (e) => e.handled === 'offer', writer: (i) => FILLER[i % 6] });
  const q = await agent.turn({ project, message: 'What exactly will you keep if I say yes?', reading: { task: 'craft' } });
  assert.equal(q.plan.act, 'serve', 'a question is answered, not taken for a "yes"');
  assert.equal(project.brainstorm.board.length, 0);
  assert.ok(log2.length > 0);
});

test('"remember this" part-way keeps what is recorded and says what is still missing', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('partial');
  const chat = keywordModel();
  await play(agent, project, { turns: 5, chat, writer: (i) => [FIRST, ANSWER.want, ANSWER.setting, FILLER[0], FILLER[1]][i] });
  assert.equal(agent.describe(project).grasp.ready, false);
  const keep = await agent.turn({ project, message: 'remember this', reading: { task: 'tell' } });
  assert.equal(keep.handled.kind, 'offer');
  assert.match(keep.handled.reply, /^I'll keep what we have\. Here's what I've got so far, in your words:/);
  assert.match(keep.handled.reply, /I'm still missing: /);
  assert.equal(keep.state.pending.partial, true);
  assert.equal(project.brainstorm.board.length, 0, 'it shows what it would keep, then asks');
  const yes = await agent.turn({ project, message: 'yes', reading: { task: 'chat' } });
  assert.equal(yes.handled.kind, 'kept');
  assert.match(yes.handled.reply, /Still open: /);
  assert.equal(project.brainstorm.board.length, 1);
  assert.match(project.brainstorm.board[0].note, /^Still open: /);
  // the other ways of saying it, and a full sheet is kept at once
  for (const msg of ['keep this idea', 'commit this', 'save this idea', 'remember it all']) {
    const p = newProject(`kw-${msg}`);
    await play(agent, p, { turns: 3, chat, writer: (i) => [FIRST, ANSWER.want, ANSWER.setting][i] });
    assert.equal((await agent.turn({ project: p, message: msg, reading: { task: 'tell' } })).handled.kind, 'offer', msg);
  }
  const full = newProject('full');
  const t = await play(agent, full, { turns: 30, writer: (i, p) => (p.conversation.agent?.pending?.kind === 'offer' ? 'Also, she hides a key.' : cooperative(i, p)), stopOn: (e) => e.handled === 'offer' });
  const direct = await agent.turn({ project: full, message: "that's everything, keep it", reading: { task: 'tell' } });
  assert.equal(direct.handled.kind, 'kept');
  assert.ok(t.length > 0);
  // with next to nothing recorded, "remember this" is left to the Idea Board's own command
  const empty = newProject('empty');
  const none = await agent.turn({ project: empty, message: 'remember this', reading: { task: 'tell' } });
  assert.equal(none.handled, null);
  assert.deepEqual(agent.state(empty).slots, {}, 'and "remember this" is not taken for the premise');
});

test('a new idea never loses the old one: it is set aside, can be brought back or kept, and the shelf is bounded', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('shelf');
  const chat = keywordModel();
  await play(agent, project, { turns: 6, chat, writer: (i) => [FIRST, ANSWER.want, ANSWER.setting, ANSWER.stakes, ANSWER.tone, ANSWER.ending][i] });
  const old = agent.state(project);
  assert.ok(Object.keys(old.slots).length >= 4);
  const swap = await agent.turn({ project, message: 'I have a new idea: a poem about the sea at night.', reading: { task: 'tell' }, chat });
  assert.equal(swap.note, 'I\'ve set the earlier idea aside. Say "bring back the earlier idea" to continue it, or "keep the earlier idea" to put it on your Idea Board.');
  assert.equal(swap.state.shelf.length, 1);
  assert.deepEqual(swap.state.shelf[0].slots, old.slots, 'the old sheet is intact');
  assert.equal(swap.state.shelf[0].kind, 'story');
  assert.equal(swap.state.kind, 'poem', 'this message is the first of the new idea');
  assert.equal(swap.state.idea, old.idea + 1);
  assert.ok(!swap.state.slots.want, 'a fresh sheet');
  assert.equal(swap.state.turn, 1);
  assert.equal(swap.plan.act, 'ask', 'the first turn on a new idea asks');
  assert.equal(swap.state.asked.length, 0, 'what was asked belonged to the old idea');
  // bring the old one back; the poem is set aside in turn
  const back = await agent.turn({ project, message: 'bring back the earlier idea', reading: { task: 'chat' } });
  assert.equal(back.handled.kind, 'restored');
  assert.match(back.handled.reply, /brought back the earlier idea/);
  assert.equal(back.state.kind, 'story');
  assert.deepEqual(back.state.slots, old.slots);
  assert.equal(back.state.shelf.length, 1);
  assert.equal(back.state.shelf[0].kind, 'poem');
  // keep the other one on the board without bringing it back
  const keep = await agent.turn({ project, message: 'keep the earlier idea', reading: { task: 'chat' } });
  assert.equal(keep.handled.kind, 'kept');
  assert.match(keep.handled.reply, /^Kept the earlier idea\./);
  assert.equal(keep.state.shelf.length, 0);
  assert.equal(project.brainstorm.board.length, 1);
  assert.equal(project.brainstorm.board[0].kind, 'poem');
  assert.equal((await agent.turn({ project, message: 'bring back the earlier idea', reading: { task: 'chat' } })).handled.reply, "There's no earlier idea set aside right now.");
  assert.equal(parseShelfCommand('bring back the earlier idea'), 'restore', 'exported for the orchestrator');
});

test('an idea that was already kept needs no shelf, a tiny one is simply replaced, and four unkept ideas still lose nothing', async () => {
  const agent = createAgent({ packs: testPacks() });
  const chat = keywordModel();
  const kept = newProject('kept');
  await play(agent, kept, { turns: 30, chat, stopOn: (e) => e.handled === 'offer' });
  await agent.turn({ project: kept, message: 'yes', reading: { task: 'chat' } });
  const swap = await agent.turn({ project: kept, message: 'Another idea: a robot who paints sunsets.', reading: { task: 'tell' }, chat });
  assert.equal(swap.note, undefined, 'it is on the Idea Board already');
  assert.equal(swap.state.shelf.length, 0);
  const tiny = newProject('tiny');
  await play(agent, tiny, { turns: 2, chat, writer: (i) => [FIRST, 'Mara wants to find her brother.'][i] });
  assert.equal((await agent.turn({ project: tiny, message: 'start over', reading: { task: 'chat' } })).state.shelf.length, 0, 'under three things recorded');
  // four ideas, none kept
  const many = newProject('many');
  const starts = ['I have a new idea: a poem about the sea.', 'Another idea: a picture book about a sleepy bear.', 'New idea: a cozy mystery in a bakery.', 'A different story: a heist on a train.'];
  const script = [FIRST, ANSWER.want, ANSWER.setting, ANSWER.tone];
  for (let n = 0; n < 4; n++) {
    await play(agent, many, { turns: 4, chat, writer: (i) => (n === 0 || i > 0 ? script[i] : starts[n - 1]) });
    if (n > 0) assert.ok(Object.keys(many.conversation.agent.slots).length >= 3, `idea ${n} has substance`);
  }
  const last = await agent.turn({ project: many, message: starts[3], reading: { task: 'tell' }, chat });
  assert.ok(last.state.shelf.length <= 3, 'the shelf is bounded');
  assert.equal(last.state.shelf.length + many.brainstorm.board.length, 4, 'every unkept idea is on the shelf or on the Idea Board');
  assert.match(last.note, /on your Idea Board now, to make room/);
  assert.ok(many.brainstorm.board[0].text.length > 0);
});

test('with no kind known, NIE asks what the writer is making: itself with no model, through the model when there is one', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('kind');
  const first = await agent.turn({ project, message: 'I have an idea about a keeper who hears a bell under the sea.', reading: { task: 'tell' } });
  assert.equal(first.handled.kind, 'asked-kind');
  assert.ok(KIND_QUESTIONS.some((q) => q.text === first.handled.reply));
  assert.ok(first.handled.suggestions.some((s) => s.label === 'A poem'));
  assert.equal(agent.state(project).pending.slot, null, 'recorded as asked');
  assert.equal(agent.state(project).asked[0].text, first.handled.reply);
  const answer = await agent.turn({ project, message: 'It is a poem.', reading: { task: 'tell' } });
  assert.equal(answer.state.kind, 'poem');
  assert.equal(answer.state.asked[0].answered, true, 'the kind question was answered');
  assert.ok(answer.state.asked[0].skipped === false);
  // an answer no kind word names ("a speech") means the 'other' pack and is not asked a second time; a clearer word later replaces it
  const p5 = newProject('kind5');
  const toast = await agent.turn({ project: p5, message: 'I have an idea about a toast for my sister at her wedding.', reading: { task: 'tell' } });
  assert.equal(toast.handled.kind, 'asked-kind');
  const speech = await agent.turn({ project: p5, message: 'It is a speech.', reading: { task: 'tell' } });
  assert.equal(speech.state.kind, 'other');
  assert.equal(speech.state.asked[0].answered, true);
  assert.notEqual(speech.plan.reason, 'kind', 'not asked again');
  assert.equal((await agent.turn({ project: p5, message: 'Actually it is closer to a poem.', reading: { task: 'tell' } })).state.kind, 'poem');
  // with a model the usual path is used, so it can acknowledge what was said before asking
  const p2 = newProject('kind2');
  const viaModel = await agent.turn({ project: p2, message: 'I have an idea about a keeper who hears a bell under the sea.', reading: { task: 'tell' }, chat: keywordModel() });
  assert.equal(viaModel.handled, null);
  assert.deepEqual([viaModel.plan.act, viaModel.plan.slot, viaModel.plan.reason], ['ask', null, 'kind']);
  assert.match(viaModel.brief, /ask exactly ONE question about what kind of piece they are making/);
  const reply = viaModel.enforce('A bell under the sea is a striking thing to hear.');
  assert.ok(KIND_QUESTIONS.some((q) => reply.endsWith(q.text)));
  // a hint from the UI settles it
  const p3 = newProject('kind3');
  const hinted = await agent.turn({ project: p3, message: 'I have an idea about a keeper who hears a bell under the sea.', reading: { task: 'tell' }, kindHint: 'story' });
  assert.equal(hinted.state.kind, 'story');
  assert.notEqual(hinted.plan.reason, 'kind');
  // forms and genres are picked up from the writer's words
  const p4 = newProject('kind4');
  const genre = await agent.turn({ project: p4, message: 'I want to write a cozy mystery picture book about a baker.', reading: { task: 'tell' } });
  assert.deepEqual([genre.state.kind, genre.state.form, genre.state.genres], ['story', 'picture-book', ['cozy-mystery']]);
  assert.ok(agent.describe(p4).open.some((o) => o.id === 'culprit') && agent.describe(p4).open.some((o) => o.id === 'page-turns'));
});

test('what is not an idea being described is served, never interviewed or recorded', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('serve');
  await play(agent, project, { turns: 2 });
  const slots = { ...agent.state(project).slots };
  const before = agent.state(project).turn;
  for (const [message, reading, act] of [['Give me some twists for the middle.', { task: 'ideas' }, 'serve'], ['Is my ending too predictable?', { task: 'feedback' }, 'serve'], ["What's a villanelle?", { task: 'craft' }, 'serve'], ['Write a scene where they argue.', { task: 'write' }, 'serve'], ['What can you do?', { task: 'about-nie' }, 'serve'], ['thanks!', { task: 'chat' }, 'reflect']]) {
    const t = await agent.turn({ project, message, reading });
    assert.equal(t.plan.act, act, message);
    assert.deepEqual(t.state.slots, slots, `${message}: nothing recorded`);
    assert.equal(t.state.turn, before, 'and it is not a turn that told NIE something');
    assert.equal(t.handled, null);
  }
  const paste = Array.from({ length: 450 }, (_, i) => `word${i % 40}`).join(' ');
  const long = await agent.turn({ project, message: paste, reading: { task: 'tell' } });
  assert.equal(long.plan.act, 'serve');
  assert.deepEqual(long.state.slots, slots, 'a pasted text is not an idea being described');
  // no reading at all: light rules
  const rules = await agent.turn({ project, message: 'Why would she hide the key?' });
  assert.equal(rules.plan.act, 'serve');
  const ideas = await agent.turn({ project, message: 'give me some ideas for the ending' });
  assert.equal(ideas.plan.act, 'serve');
});

test('commands win over a waiting offer: "stop asking questions" and "new idea" drop it', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('cmd');
  await play(agent, project, { turns: 30, stopOn: (e) => e.handled === 'offer' });
  const quiet = await agent.turn({ project, message: 'stop asking questions', reading: { task: 'chat' } });
  assert.equal(quiet.handled.kind, 'mode');
  assert.equal(quiet.state.pending, null);
  assert.equal(project.brainstorm.board.length, 0);
});

test('two projects never share anything, and a project keeps its agent state when saved and loaded', async () => {
  const agent = createAgent({ packs: testPacks() });
  const a = newProject('iso-a');
  const b = newProject('iso-b');
  await play(agent, a, { turns: 30, stopOn: (e) => e.handled === 'offer' });
  await agent.turn({ project: a, message: 'yes', reading: { task: 'chat' } });
  assert.deepEqual(agent.state(b), emptyAgentState(), 'a fresh project is factory-fresh');
  assert.equal(b.brainstorm.board.length, 0);
  assert.equal(b.memory.characters.length, 0);
  await play(agent, b, { turns: 3, writer: (i) => ['A poem about the tide and a gull.', 'The image is a gull on a post in the rain.', 'It should feel lonely but warm.'][i] });
  assert.equal(agent.state(b).kind, 'poem');
  assert.equal(agent.state(a).kind, 'story');
  for (const id of Object.keys(agent.state(b).slots)) assert.ok(!/Mara|lighthouse/i.test(agent.state(b).slots[id].value), 'nothing of the other project');
  assert.ok(a.brainstorm.board.length === 1 && b.brainstorm.board.length === 0);
  // saved, loaded, and carried on
  const loaded = JSON.parse(JSON.stringify(a));
  assert.deepEqual(agent.state(loaded), agent.state(a));
  const t = await agent.turn({ project: loaded, message: 'The ending is bittersweet and hopeful.', reading: { task: 'tell' }, chat: keywordModel() });
  assert.equal(t.state.slots.ending.value, 'The ending is bittersweet and hopeful');
  assert.ok(!agent.state(a).slots.ending || agent.state(a).slots.ending.value !== t.state.slots.ending.value, 'the original project is unchanged');
  // a stored state that is junk is read as empty rather than breaking the turn
  const broken = newProject('broken');
  broken.conversation.agent = { slots: 'nonsense', asked: 7, pending: { kind: 'question' }, __proto__: { x: 1 } };
  const ok = await agent.turn({ project: broken, message: FIRST, reading: { task: 'tell' } });
  assert.equal(ok.state.kind, 'story');
  assert.deepEqual(sanitizeAgentState(broken.conversation.agent), broken.conversation.agent);
});

test('a model that fails or is stopped does not corrupt the sheet; an abort leaves the project exactly as it was', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('abort');
  await play(agent, project, { turns: 3 });
  const snapshot = JSON.stringify(project.conversation.agent);
  await assert.rejects(agent.turn({ project, message: ANSWER.tone, reading: { task: 'tell' }, chat: async () => { throw new AIError('stopped', { kind: 'abort' }); } }), (e) => e.kind === 'abort');
  assert.equal(JSON.stringify(project.conversation.agent), snapshot);
  for (const chat of [async () => { throw new Error('model crashed'); }, async () => ({ text: null }), async () => ({ text: 'I am sorry, I cannot do that.' }), async () => ({ text: '{"updates":[{"slot":"tone","value":"completely invented words"}],"extra":""}' })]) {
    const t = await agent.turn({ project, message: ANSWER.tone, reading: { task: 'tell' }, chat });
    assert.ok(t.plan, 'the turn went on with the rules');
    for (const rec of Object.values(t.state.slots)) assert.ok(!/invented/.test(rec.value));
  }
});

test('everything works with no model at all: a whole conversation, the offer, the keep', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('nomodel');
  const log = await play(agent, project, { turns: 40, chat: null, stopOn: (e) => e.handled === 'offer' });
  assert.equal(log.at(-1).handled, 'offer');
  const state = agent.state(project);
  assert.ok(Object.values(state.slots).every((s) => Object.values(ANSWER).concat([FIRST, ...FILLER]).some((m) => m.includes(s.value.replace(/\.$/, '')) || s.value.length < 25)), 'only the writer\'s own words were recorded');
  const yes = await agent.turn({ project, message: 'ok keep it', reading: { task: 'chat' } });
  assert.equal(yes.handled.kind, 'kept');
  assert.ok(project.brainstorm.board.length === 1);
  const d = agent.describe(project);
  assert.ok(d.filled.length >= 5 && d.grasp.ready);
  assert.equal(d.filled[0].label, 'Premise');
});

test('a writer musing about the idea between answers never swaps the sheet for a new one', async () => {
  // the project id seeds which questions come when, so a few ids put the musing at different places in the conversation
  for (const id of ['unclear', 'musing-a', 'musing-b', 'musing-c', 'musing-d', 'musing-e']) {
    const agent = createAgent({ packs: testPacks() });
    const project = newProject(id);
    const log = await play(agent, project, { turns: 16, writer: (i, p) => (p.conversation.agent?.pending?.kind === 'offer' ? 'Not yet.' : cooperative(i, p)) });
    assert.equal(agent.state(project).idea, 1, `${id}: still the first idea`);
    assert.deepEqual(agent.state(project).shelf, [], `${id}: nothing was set aside`);
    assert.ok(log.every((e) => e.note === undefined), `${id}: no "set the earlier idea aside" notice`);
    assert.ok(Object.keys(agent.state(project).slots).length >= 3, `${id}: the sheet kept growing`);
  }
});

// ── the real packs (whichever are written), end to end with no model ─────────────────────────────────────────────
const packDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../apps/web/src/engine/agent/packs');
const REAL_KINDS = ['story', 'character', 'world', 'article', 'essay', 'poem', 'script', 'other'];
const loadPack = async (name) => (fs.existsSync(path.join(packDir, `${name}.js`)) ? (await import(pathToFileURL(path.join(packDir, `${name}.js`)).href)).default : null);
const realKinds = Object.fromEntries((await Promise.all(REAL_KINDS.map(async (k) => [k, await loadPack(k)]))).filter(([, p]) => p));
const realPacks = { kinds: realKinds, forms: (await loadPack('forms')) ?? [], genres: (await loadPack('genres')) ?? [] };
const PITCH = {
  story: 'A lighthouse keeper named Mara hears a drowned bell in the fog every winter night, and I want to tell her story.',
  character: 'My character is Ines, a retired ferry captain who drinks too much and cannot stop counting the boats that never come back.',
  world: 'I am building a world where the tide never goes out and every town is built on floating docks.',
  script: 'A screenplay about two sisters who inherit a failing cinema and discover a film that predicts the future.',
  article: 'I want to write an article about why small libraries are quietly turning into community centres.',
  essay: 'An essay about learning to swim at forty and what it taught me about my father.',
  poem: 'A poem about a gull on a wet post at the end of a pier in the rain.',
  other: "A speech for my sister's wedding about the summer we spent fixing up our grandfather's boat.",
};
const REAL_ANSWERS = [
  'It matters because nobody in town will talk about it openly anymore.',
  'She keeps the harbour log and a brass key and never lets either out of sight.',
  'Mostly the cold, the debt to the ferry company, and her own stubborn pride.',
  'Her brother Tomas, who left on the last ferry and never wrote back.',
  'By the end she forgives him and rings the bell herself at dawn.',
  'It should feel like early winter, quiet and a little bit dangerous.',
];

test('with the real packs every kind runs a whole conversation: well-formed, varied questions about this writer\'s project, paced like a person, then an offer', { skip: Object.keys(realKinds).length < REAL_KINDS.length && 'the kind packs are not all written yet' }, async () => {
  for (const kind of REAL_KINDS) {
    const agent = createAgent({ packs: realPacks });
    const project = newProject(`real-${kind}`);
    const said = [];
    const turns = [];
    let answers = 0;
    for (let i = 0; i < 40 && turns.at(-1)?.handled?.kind !== 'offer'; i++) {
      const pending = project.conversation.agent?.pending;
      const message = i === 0 ? PITCH[kind] : pending?.kind === 'question' ? REAL_ANSWERS[answers++ % REAL_ANSWERS.length] : FILLER[i % FILLER.length];
      const t = await agent.turn({ project, message, reading: { task: 'tell' }, kindHint: kind, recentMessages: said.slice(), seed: 'real' });
      said.push(message);
      if (!t.handled) t.record(t.enforce('That gives me a clearer picture of what you are making.'));
      turns.push(t);
    }
    const where = `[${kind}]`;
    assert.equal(turns.at(-1).handled?.kind, 'offer', `${where} NIE offers to keep it within 40 turns`);
    const state = agent.state(project);
    assert.equal(state.kind, kind, `${where} the kind the writer chose`);
    const texts = state.asked.map((a) => a.text);
    assert.ok(texts.length >= 3, `${where} asked a few questions (${texts.length})`);
    assert.equal(new Set(texts.map((x) => x.toLowerCase())).size, texts.length, `${where} no question twice`);
    for (let a = 0; a < texts.length; a++) for (let b = a + 1; b < texts.length; b++) assert.ok(similarity(texts[a], texts[b]) < 0.6, `${where} "${texts[a]}" / "${texts[b]}"`);
    for (const q of texts) assert.deepEqual(questionProblems({ text: q, type: 'open' }), [], `${where} ${q}`);
    const told = turns.filter((t) => t.plan.act === 'ask' || t.plan.act === 'reflect');
    const rate = told.filter((t) => t.plan.act === 'ask').length / told.length;
    assert.ok(rate >= 0.3 && rate <= 0.7, `${where} asked on ${(rate * 100).toFixed(0)}% of ${told.length} turns`);
    assert.ok(!told.map((t) => (t.plan.act === 'ask' ? 'A' : '-')).join('').includes('AAA'), `${where} never three in a row`);
    // everything on the sheet is the writer's own words
    const theirs = new Set(stemList(said.join(' ')));
    for (const [id, rec] of Object.entries(state.slots)) assert.ok(stemList(rec.value).every((s) => theirs.has(s)), `${where} ${id}: "${rec.value}" is not all theirs`);
    // the offer shows exactly what is recorded, and keeping it fits the Idea Board
    const offer = turns.at(-1).handled;
    for (const rec of Object.values(state.slots)) assert.ok(offer.reply.includes(rec.value), `${where} the offer shows "${rec.value}"`);
    const kept = await agent.turn({ project, message: 'Yes, keep it.', reading: { task: 'chat' } });
    assert.equal(kept.handled.kind, 'kept', where);
    assert.equal(project.brainstorm.board.length, 1, where);
    assert.ok(project.brainstorm.board[0].text.length <= 700, `${where} the digest fits (${project.brainstorm.board[0].text.length})`);
    assert.ok(agent.describe(project).grasp.ready, where);
  }
});

test('hostile and random input, odd readings and hints, and a model that misbehaves never break a turn or leave a state that is not valid', async () => {
  let seed = 4242;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const any = (list) => list[Math.floor(rnd() * list.length)];
  const PIECES = ['Mara', 'the lighthouse', 'a drowned bell', 'wants to find her brother', 'new idea', 'yes', 'no', 'not yet', 'also', 'keep this idea', 'stop asking questions', 'ask me questions', "that's everything", 'bring back the earlier idea', 'keep the earlier idea', 'What if', '?', '!!!', '👍', '\n\n', '    ', 'a poem about the sea', 'an essay on grief', 'start over', 'Give me some twists', 'Write a scene', '__proto__', 'constructor', '{who}', '"quoted"', '\u0000', 'The theme is forgiveness', 'It is set in Lagos', 'she hides a key', 'x'.repeat(300)];
  const READINGS = [null, { task: 'tell' }, { task: 'develop' }, { task: 'ideas' }, { task: 'feedback' }, { task: 'craft' }, { task: 'chat' }, { task: 'write' }, { task: 'about-nie' }, { task: 'unclear' }, { task: 'bogus' }, 'junk', 42];
  const HINTS = [null, undefined, 'story', 'poem', 'other', 'nonsense', 7];
  const CHATS = [null, async () => ({ text: null }), async () => { throw new Error('boom'); }, async () => ({ text: '{"updates":[{"slot":"premise","value":"a lighthouse keeper"}],"extra":"x"}' }), async () => ({ text: 'not json at all' })];
  const agent = createAgent({ packs: testPacks() });
  for (let run = 0; run < 6; run++) {
    const project = newProject(`fuzz-${run}`);
    for (let i = 0; i < 40; i++) {
      const message = Array.from({ length: 1 + Math.floor(rnd() * 8) }, () => any(PIECES)).join(any([' ', ', ', '. ', '']));
      const t = await agent.turn({ project, message, reading: any(READINGS), chat: any(CHATS), kindHint: any(HINTS), recentMessages: rnd() < 0.2 ? 'junk' : [message], libraryNotes: rnd() < 0.2 ? 'junk' : ['A note.'] });
      if (t.handled) {
        assert.equal(typeof t.handled.reply, 'string');
        assert.ok(Array.isArray(t.handled.suggestions));
      } else {
        const reply = t.enforce(any(['Okay.', 'That is interesting. What do you think?', '', 'Mara hears a bell. Who else hears it? And why?']));
        assert.equal(typeof reply, 'string');
        t.record(reply);
      }
      const state = project.conversation.agent;
      assert.deepEqual(sanitizeAgentState(state), state, `run ${run} turn ${i}: the stored state is always a valid one`);
      assert.ok(JSON.stringify(state).length < 40000, 'and stays small');
      assert.ok(typeof t.brief === 'string' && t.brief.length < 3000);
    }
    assert.ok(JSON.stringify(project).length < 120000, 'the whole project stays small too');
  }
});

// ── review fixes: each of these failed before ─────────────────────────────────

/** A project with the offer to keep the idea waiting for an answer. */
async function offered(id, { chat = null } = {}) {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject(id);
  const log = await play(agent, project, { turns: 30, chat, stopOn: (e) => e.handled === 'offer' });
  assert.equal(log.at(-1).handled, 'offer', `${id}: a cooperative writer gets an offer`);
  return { agent, project };
}

test('at the offer, a request, a question, a pasted text or a pitch for something else is not a detail to file under "Also"', async () => {
  const requests = [
    ['Give me some twists for the middle of the story please.', { task: 'tell' }],
    ['Write a scene where Mara finds the key under the lamp.', { task: 'tell' }],
    ['the ending could use some twists and a bigger surprise somewhere near the end', { task: 'ideas' }],
    ['Can you suggest a better title for it', { task: 'tell' }],
  ];
  for (const [i, [message, reading]] of requests.entries()) {
    const { agent, project } = await offered(`req-${i}`);
    const extra = [...agent.state(project).extra];
    const t = await agent.turn({ project, message, reading });
    assert.equal(t.handled, null, `${message}: carried on as an ordinary message, not swallowed by the offer`);
    assert.equal(t.plan.act, 'serve', message);
    assert.deepEqual(t.state.extra, extra, `${message}: nothing was filed`);
    assert.equal(t.state.pending, null, `${message}: the offer was dropped`);
    assert.equal(project.brainstorm.board.length, 0);
  }
  const { agent, project } = await offered('paste');
  const paste = 'Mara keeps the lighthouse and hears the drowned bell in the fog every winter night. '.repeat(40); // 600 words, all of them about this idea
  const extraBefore = [...agent.state(project).extra];
  const long = await agent.turn({ project, message: paste, reading: { task: 'tell' } });
  assert.equal(long.handled, null);
  assert.equal(long.plan.act, 'serve');
  assert.deepEqual(long.state.extra, extraBefore, 'a pasted text is never filed as a detail');
  // a pitch for something else, without a marker such as "new idea", sets the first idea aside rather than being added to it
  const other = await offered('pitch');
  const before = other.agent.state(other.project);
  const pitch = await other.agent.turn({ project: other.project, message: 'A detective who cannot remember yesterday investigates the disappearance of her own memories across the city.', reading: { task: 'tell' } });
  assert.equal(pitch.state.idea, before.idea + 1);
  assert.equal(pitch.state.shelf.length, 1);
  assert.deepEqual(pitch.state.shelf[0].slots, before.slots, 'the first idea is intact on the shelf');
  assert.deepEqual(pitch.state.extra, []);
  assert.match(pitch.note, /set the earlier idea aside/);
});

test('at the offer, a repeat of what is already there says nothing new was found, and "let me add something" keeps the offer open for the detail', async () => {
  const { agent, project } = await offered('dup');
  const base = agent.state(project).extra.length; // (what the writer said on the way that fitted no part is already there)
  const first = await agent.turn({ project, message: 'Also, she hides a brass key under the lamp.', reading: { task: 'tell' } });
  assert.match(first.handled.reply, /^Noted under "Also": she hides a brass key under the lamp\./);
  await agent.turn({ project, message: 'Also, there is a cat called Biscuit who steals fish.', reading: { task: 'tell' } });
  const turnBefore = agent.state(project).turn;
  const again = await agent.turn({ project, message: 'Also, she hides a brass key under the lamp.', reading: { task: 'tell' } });
  assert.equal(again.handled.kind, 'added');
  assert.match(again.handled.reply, /^I didn't find anything new to record in that\./, 'it does not claim it noted a different detail');
  assert.equal(again.state.extra.length, base + 2);
  assert.equal(again.state.turn, turnBefore, 'and a repeat is not a turn that told NIE something');
  const go = await agent.turn({ project, message: 'let me add something', reading: { task: 'tell' } });
  assert.equal(go.handled.kind, 'offer');
  assert.match(go.handled.reply, /what would you like to add|what should I add|what's the detail/i);
  assert.equal(go.state.extra.length, base + 2, '"something" is not recorded as a detail');
  assert.equal(go.state.pending.kind, 'offer');
  const detail = await agent.turn({ project, message: 'The lighthouse is older than the town itself.', reading: { task: 'tell' } });
  assert.equal(detail.handled.kind, 'added');
  assert.equal(detail.state.extra.length, base + 3);
});

test('at the offer, "keep going" and "save it for later" hold the offer: they are never a yes', async () => {
  for (const [i, message] of ['keep going', 'Keep going with the questions please', 'save it for later', "that's wrong"].entries()) {
    const { agent, project } = await offered(`hold-${i}`);
    const t = await agent.turn({ project, message, reading: { task: 'chat' } });
    assert.equal(t.handled.kind, 'held', message);
    assert.equal(project.brainstorm.board.length, 0, `${message}: nothing was saved`);
  }
});

test('"I don\'t know" is a skipped question, not an answer: nothing is filed, it is not a turn that told NIE something, and the question is not asked again', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('shrug');
  const log = await play(agent, project, { turns: 1 });
  assert.equal(log[0].asked, true);
  const st1 = agent.state(project);
  const slotAsked = st1.pending.slot;
  const filledBefore = Object.keys(st1.slots).sort();
  const shrug = await agent.turn({ project, message: "I don't know", reading: { task: 'tell' } });
  assert.deepEqual(Object.keys(shrug.state.slots).sort(), filledBefore, 'nothing was filed');
  assert.equal(shrug.state.turn, st1.turn, 'it told NIE nothing');
  assert.equal(shrug.state.asked[0].skipped, true);
  assert.equal(shrug.state.asked[0].answered, false);
  for (const message of ["I'm not sure what stands in the way", 'no idea', 'skip that one']) {
    const t = await agent.turn({ project, message, reading: null });
    assert.deepEqual(Object.keys(t.state.slots).sort(), filledBefore, message);
  }
  // a terse goal ("Find her brother") IS the answer to a question about it
  const p2 = newProject('terse');
  const agent2 = createAgent({ packs: testPacks() });
  const first = await agent2.turn({ project: p2, message: FIRST, reading: { task: 'tell' } });
  first.record(first.enforce('Okay.'));
  const pend = agent2.state(p2).pending;
  const answer = await agent2.turn({ project: p2, message: 'Find her brother', reading: { task: 'tell' } });
  assert.equal(answer.state.slots[pend.slot].value, 'Find her brother');
  assert.equal(answer.state.slots[pend.slot].via, 'answered');
  assert.ok(slotAsked);
});

test('a sentence of the story is never taken for a command to NIE', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('story-sentences');
  await play(agent, project, { turns: 3 });
  const mode = agent.state(project).mode;
  for (const message of ['The detective will not stop asking questions about the missing girl.', '"Stop asking questions!" she snapped.', 'Another piece of the puzzle is the letter she finds in the lamp.', 'A different story emerges in the second act when the ferry returns.']) {
    const t = await agent.turn({ project, message, reading: { task: 'tell' } });
    assert.equal(t.state.mode, mode, message);
    assert.equal(t.state.idea, 1, `${message}: still the first idea`);
    assert.deepEqual(t.state.shelf, [], message);
    assert.notEqual(t.handled?.kind, 'mode', message);
    t.record?.(t.enforce('Noted.'));
  }
});

test('bringing an idea back remembers what was already asked about it, so no question is repeated', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('restore-asked');
  const chat = keywordModel();
  await play(agent, project, { turns: 10, chat, writer: (i, p) => (i === 0 ? FIRST : p.conversation.agent.pending?.kind === 'question' ? ANSWER[p.conversation.agent.pending.slot] ?? FILLER[i % 6] : FILLER[i % 6]) });
  const askedBefore = askedTexts(project);
  assert.ok(askedBefore.length >= 3);
  await agent.turn({ project, message: 'I have a new idea: a poem about the sea at night.', reading: { task: 'tell' }, chat });
  assert.equal(agent.state(project).asked.length <= 1, true, 'the new idea starts with its own questions');
  const back = await agent.turn({ project, message: 'bring back the earlier idea', reading: { task: 'chat' } });
  assert.deepEqual(back.state.asked.map((a) => a.text), askedBefore, 'what the writer was asked is remembered');
  await play(agent, project, { turns: 14, chat, writer: (i) => FILLER[i % 6] });
  const all = askedTexts(project);
  for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) assert.ok(similarity(all[a], all[b]) < 0.6, `"${all[a]}" / "${all[b]}"`);
});

test('keeping the idea from an offer that has nothing under it says so and leaves no offer waiting', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('hollow');
  project.conversation.agent = { ...emptyAgentState(), pending: { kind: 'offer', turn: 3, partial: true } };
  const yes = await agent.turn({ project, message: 'yes', reading: { task: 'chat' } });
  assert.equal(yes.handled.kind, 'kept');
  assert.match(yes.handled.reply, /nothing recorded yet/);
  assert.equal(yes.state.pending, null);
  assert.equal(project.brainstorm.board.length, 0);
  const next = await agent.turn({ project, message: 'A lighthouse keeper hears a bell in the fog every night of the winter', reading: { task: 'tell' } });
  assert.equal(next.state.idea, 1, 'the next message is an ordinary one, not an answer to a stale offer');
});

test('"yes keep it and ..." keeps the idea AND lets the rest of the message through; "yes, but ..." keeps nothing; manners are not a detail', async () => {
  const both = await offered('yes-and');
  const t = await both.agent.turn({ project: both.project, message: 'Yes keep it and give me some twists for the middle.', reading: { task: 'ideas' } });
  assert.equal(t.handled, null, 'the request still gets its answer');
  assert.equal(t.plan.act, 'serve');
  assert.equal(both.project.brainstorm.board.length, 1, 'and the idea was kept');
  assert.match(t.note, /^Kept\. It's on your Idea Board/);
  assert.equal(t.state.committed.length, 1);
  assert.equal(t.state.pending, null);
  const but = await offered('yes-but');
  const b = await but.agent.turn({ project: but.project, message: 'Yes, but give me some twists for the middle first.', reading: { task: 'ideas' } });
  assert.equal(b.handled, null);
  assert.equal(b.note, undefined);
  assert.equal(but.project.brainstorm.board.length, 0, 'a reservation keeps nothing');
  const next = await offered('yes-new');
  const n = await next.agent.turn({ project: next.project, message: 'Yes keep it. New idea: a poem about the sea at night.', reading: { task: 'tell' } });
  assert.equal(next.project.brainstorm.board.length, 1);
  assert.equal(n.state.idea, 2);
  assert.equal(n.state.shelf.length, 0, 'it was kept, so there is nothing to set aside');
  const polite = await offered('yes-thanks');
  const extra = [...polite.agent.state(polite.project).extra];
  const p = await polite.agent.turn({ project: polite.project, message: 'Yes please keep it, and thanks for the help with the questions', reading: { task: 'chat' } });
  assert.equal(p.handled.kind, 'kept');
  assert.deepEqual(p.state.extra, extra, '"thanks for the help" is not a detail of the story');
});

test('recording the same reply twice is one question', async () => {
  const agent = createAgent({ packs: testPacks() });
  const project = newProject('twice');
  const t = await agent.turn({ project, message: FIRST, reading: { task: 'tell' } });
  const reply = t.enforce('Noted.');
  t.record(reply);
  t.record(reply);
  assert.equal(agent.state(project).asked.length, 1);
  assert.equal(agent.state(project).pending.kind, 'question');
});
