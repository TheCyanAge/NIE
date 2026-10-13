import test from 'node:test';
import assert from 'node:assert/strict';
import { ProjectStore, createProjectData, memoryStorage } from '../apps/web/src/engine/project/store.js';
import { addToBoard } from '../apps/web/src/engine/project/board.js';
import { markIntentional, rememberCharacter, rememberItem } from '../apps/web/src/engine/project/memory.js';
import { addRule } from '../apps/web/src/engine/rules/rules.js';
import { updateWorkingPremise, detectIntent } from '../apps/web/src/engine/intent/intent.js';
import { sanitizeAgentState } from '../apps/web/src/engine/agent/state.js';
import { seededRandom } from '../apps/web/src/engine/util/text.js';
import mindApi, {
  MIND_LIMITS, cleanStatement, clearTokenMemo, describeMind, emptyMind, forgetItem, forgetSaid, mindStats, passagesOf, recall, recallNames, rememberSaid, rememberStatements,
  sanitizeMind, statementsIn,
} from '../apps/web/src/engine/mind/index.js';
import { tokensOf } from '../apps/web/src/engine/mind/tokens.js';

// ── fixtures ─────────────────────────────────────────────────────────────────

/** A project that holds the writer's material in EVERY place the mind reads, all of it built around one secret word. */
function richProject(secret, { title = `The ${secret} story` } = {}) {
  const p = createProjectData({ title });
  rememberStatements(p, `The main character is ${secret}, a retired cartographer who counts every step. ${secret} wants to find the missing map before winter.`);
  rememberStatements(p, `The rival, Brannock of ${secret}haven, hides a forged deed in the church tower.`);
  rememberStatements(p, 'It should feel quiet and a little lonely, like snow on a roof.');
  p.profile.genre.primary = `${secret} noir`;
  p.profile.style.pov = 'close third person';
  addRule(p, { text: `${secret} may never leave the island`, category: 'world' });
  rememberCharacter(p, { name: secret, aliases: [`Old ${secret}`], notes: `a cartographer who counts every step` });
  rememberItem(p, 'themes', `${secret} and the cost of maps`);
  rememberItem(p, 'motifs', `a brass sextant that belonged to ${secret}`);
  rememberItem(p, 'timeline', `Winter, the year ${secret} arrives`);
  markIntentional(p, { detector: 'repetition', quote: `${secret} walked and walked` }, 'on purpose');
  p.conversation.workingPremise = updateWorkingPremise(null, `${secret} is haunted by a map that does not exist`, detectIntent(`${secret} is haunted by a map that does not exist`));
  const kept = addToBoard(p, { text: `Main character: ${secret} the cartographer · Also: owns a parrot`, source: 'writer' }).item;
  addToBoard(p, { text: `What if ${secret}'s parrot knows the coastline better than anyone`, source: 'nie' });
  addToBoard(p, { text: `${secret} keeps a ledger of every lie`, source: 'writer', note: `my note about ${secret}` });
  p.conversation.agent = sanitizeAgentState({
    kind: 'story',
    slots: { protagonist: { value: `${secret} the cartographer`, turn: 2, via: 'said' }, setting: { value: `an island called ${secret}holm`, turn: 3, via: 'said' } },
    extra: [`${secret} is afraid of herons`],
    turn: 4,
    committed: [{ idea: 1, turn: 3, boardId: kept.id, digest: kept.text }],
    shelf: [{ kind: 'story', slots: { protagonist: { value: `${secret}'s twin sister, a lighthouse keeper`, turn: 1, via: 'said' } }, extra: [`${secret} twin bakes bread`], shelvedAt: 3, idea: 1, turn: 3 }],
  });
  p.storyText = `${secret} walked into the room.\n\n`.repeat(3);
  return p;
}

// two tellings that open with the very same sentence and then differ
const SCRIPT_A = [
  'The harbour bell is made of bronze and older than the village charter.',
  'The harbourmaster Corin is hiding gambling debts from everyone.',
  'Mara wants to find out who sank the bell before the regatta.',
  'Is it too late to change the ending?',
  'The baker Ines watches the whole harbour from her upstairs window.',
];
const SCRIPT_B = [
  'The harbour bell is made of bronze and older than the village charter.',
  'The lighthouse keeper Odalys is writing letters to her missing brother.',
  'Piet wants to find out who painted the lighthouse before the storm.',
  'Is it too late to change the ending?',
  'The fisherman Aldo watches the whole sea from his rowing boat.',
];

function deepFreeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const k of Object.keys(o)) deepFreeze(o[k]);
  }
  return o;
}

/** Everything the mind says about a project, as one string (for "does it contain X?" and "is it the same as before?"). */
const everything = (p, q) =>
  JSON.stringify({
    passages: passagesOf(p),
    passagesNoSheet: passagesOf(p, { includeSheet: false }),
    recall: recall(p, q),
    names: recallNames(p, ['Zephyrine', 'Marlowe', 'Brannock']),
    describe: describeMind(p),
    stats: mindStats(p),
  });

const texts = (r) => r.items.map((x) => x.text);

// ── (a) isolation ────────────────────────────────────────────────────────────

test('isolation: B never sees A, in any order of calls, and the module keeps no state between calls', () => {
  const A = richProject('Zephyrine');
  const B = richProject('Marlowe');
  const qA = 'What does Zephyrine want, and who is Brannock of Zephyrinehaven?';
  const qB = 'What does Marlowe want, and who is Brannock of Marlowehaven?';
  const a1 = everything(A, qA);
  const b1 = everything(B, qB);
  assert.ok(/zephyrine/i.test(a1), 'A really holds its secret everywhere (the test means something)');
  assert.ok(!/zephyrine/i.test(b1), "none of A's strings reach B");
  assert.ok(!/marlowe/i.test(a1), "none of B's strings reach A");

  // any order; B asked about A's secret finds nothing of A's; A is unchanged by everything that happened in between
  const orders = [['A', 'B', 'A', 'B'], ['B', 'A', 'B', 'A'], ['B', 'B', 'A', 'A'], ['A', 'A', 'B', 'B']];
  for (const order of orders) {
    for (const which of order) {
      if (which === 'A') assert.equal(everything(A, qA), a1, `A is the same after ${order.join('')}`);
      else {
        assert.equal(everything(B, qB), b1, `B is the same after ${order.join('')}`);
        const wrongQuestion = recall(B, qA);
        assert.ok(!/zephyrine/i.test(JSON.stringify(wrongQuestion)), "asking B about A's secret returns none of A's text");
        assert.ok(!/zephyrine/i.test(JSON.stringify(recallNames(B, ['Zephyrine', 'Old Zephyrine']))));
      }
    }
  }
  assert.equal(recallNames(B, ['Zephyrine']).items.length, 0);
  assert.equal(recall(B, 'Zephyrine Zephyrinehaven').items.length, 0, "a name only A has finds nothing in B");

  // the one memo in the module is keyed by exact text: a text from A gives B's identical text the same answer, and an emptied memo changes nothing
  const before = everything(A, qA);
  clearTokenMemo();
  assert.equal(everything(A, qA), before);
  assert.deepEqual(tokensOf('Zephyrine walked').list, tokensOf('Zephyrine walked').list);
  assert.ok(Object.isFrozen(tokensOf('Zephyrine walked').list), 'what the memo hands out cannot be changed by a caller');
});

test('isolation: the passages of a project come only from that project (every source, ids unique and stable)', () => {
  const A = richProject('Zephyrine');
  const first = passagesOf(A);
  const second = passagesOf(A);
  assert.deepEqual(first, second, 'stable across calls');
  assert.equal(new Set(first.map((p) => p.id)).size, first.length, 'ids are unique');
  const sources = new Set(first.map((p) => p.source));
  for (const s of ['said', 'sheet', 'extra', 'set-aside', 'kept', 'board', 'character', 'theme', 'motif', 'timeline', 'deliberate', 'premise', 'rule', 'profile']) assert.ok(sources.has(s), `source ${s} is read`);
  assert.ok(first.every((p) => typeof p.text === 'string' && p.text && typeof p.where === 'string' && p.where && p.weight > 0));
  const B = richProject('Marlowe');
  assert.deepEqual(passagesOf(A), first, 'building another project in between changes nothing');
  assert.ok(!/zephyrine/i.test(JSON.stringify(passagesOf(B))));
});

test('isolation: remembering into two projects at once gives each the mind it would have had alone (even when they say the same words)', () => {
  const said = (p) => p.mind.said.map(({ n, turn, text, kind }) => ({ n, turn, text, kind }));
  const mk = () => createProjectData();
  const lines = SCRIPT_A.slice();
  const solo = mk();
  lines.forEach((l, i) => rememberStatements(solo, l, { turn: i + 1 }));
  const soloB = mk();
  SCRIPT_B.forEach((l, i) => rememberStatements(soloB, l, { turn: i + 1 }));

  const a = mk();
  const b = mk();
  const bBefore = JSON.stringify(b);
  for (let i = 0; i < lines.length; i++) {
    rememberStatements(a, lines[i], { turn: i + 1 });
    if (i === 0) assert.equal(JSON.stringify(b), bBefore, "remembering into A wrote nothing into B");
    rememberStatements(b, SCRIPT_B[i], { turn: i + 1 });
  }
  assert.deepEqual(said(a), said(solo), 'A is what it would have been alone');
  assert.deepEqual(said(b), said(soloB), 'B is what it would have been alone');
  assert.equal(said(b)[0].text, said(a)[0].text, 'B says the very same first sentence as A and still keeps it (A holding it is no reason for B not to)');
  assert.equal(a.mind.said.length, b.mind.said.length);
  assert.notEqual(a.mind.said, b.mind.said);
  assert.ok(!b.mind.said.some((e) => /Corin/.test(e.text)), "A's names did not travel");
  assert.deepEqual(said(a).map((e) => e.n), said(a).map((e, i) => i + 1));
});

// ── (b) a new project is empty ───────────────────────────────────────────────

test('a fresh project has an empty mind and holds nothing from a project made earlier in the same process', () => {
  const A = richProject('Zephyrine');
  recall(A, 'Zephyrine?');
  describeMind(A);
  const fresh = createProjectData();
  assert.deepEqual(fresh.mind, emptyMind());
  assert.deepEqual(fresh.mind.said, []);
  assert.ok(!/zephyrine/i.test(JSON.stringify(fresh)), 'no text of the earlier project');
  assert.notEqual(fresh.mind, createProjectData().mind, 'every project has its own mind object');
  assert.notEqual(fresh.mind.said, createProjectData().mind.said);
  fresh.mind.said.push({ n: 1, turn: 0, at: 0, text: 'leak', kind: 'told' });
  assert.deepEqual(createProjectData().mind.said, [], 'writing into one project never reaches the next');
  const empty = createProjectData();
  assert.equal(recall(empty, 'What does she want?').items.length, 0);
  assert.equal(recall(empty, 'What does she want?').block, '');
  assert.deepEqual(passagesOf(empty), []);
  assert.equal(describeMind(empty).counts.said, 0);
  assert.match(describeMind(empty).summary, /holds nothing/);
});

// ── (c) the store ────────────────────────────────────────────────────────────

test('store: statements survive save and load, deleting a project removes its mind and every key, and the other project is untouched', () => {
  const storage = memoryStorage();
  const store = new ProjectStore(storage);
  const a = store.create({ title: 'A' });
  rememberStatements(a, 'The lighthouse keeper Zephyrine writes letters to a sister who does not exist. The sea in this story is cold and slow.');
  rememberSaid(a, 'Zephyrine never answers the door', { kind: 'answered' });
  store.save(a);
  const b = store.create({ title: 'B' });
  rememberStatements(b, 'The baker Marlowe hides a recipe inside the church bell.');
  store.save(b);
  const bBefore = JSON.stringify(store.load(b.id).mind);

  const a2 = store.load(a.id);
  assert.deepEqual(a2.mind, a.mind, 'statements intact after a round trip through storage');
  assert.equal(a2.mind.said.length, 3);
  assert.deepEqual(a2.mind.said.map((e) => e.kind), ['told', 'told', 'answered']);
  assert.ok(!/marlowe/i.test(JSON.stringify(a2)), "B's words are not in A");
  assert.ok(!/zephyrine/i.test(JSON.stringify(store.load(b.id))), "A's words are not in B");

  store.delete(a.id);
  for (const key of storage.keys()) {
    assert.ok(!key.includes(a.id), `no key of A is left: ${key}`);
    assert.ok(!/zephyrine/i.test(String(storage.get(key))), `nothing of A in ${key}`);
  }
  assert.equal(store.load(a.id), null);
  assert.equal(JSON.stringify(store.load(b.id).mind), bBefore, 'B untouched');
  assert.equal(store.activeId, b.id);

  // erase-all removes it as well
  store.eraseAll();
  assert.ok(!storage.keys().some((k) => /project\./.test(k)));
});

test('store: a project saved without a mind (an older version) or with a garbage one loads with a valid mind', () => {
  const storage = memoryStorage();
  const store = new ProjectStore(storage);
  const p = store.create({ title: 'Old' });
  const raw = JSON.parse(storage.get(`nie.v1.project.${p.id}`));
  delete raw.mind;
  storage.set(`nie.v1.project.${p.id}`, JSON.stringify(raw));
  assert.deepEqual(store.load(p.id).mind, emptyMind());
  raw.mind = { said: 'nope', seq: 'x', v: 99, extra: { evil: true } };
  storage.set(`nie.v1.project.${p.id}`, JSON.stringify(raw));
  assert.deepEqual(store.load(p.id).mind, emptyMind());
  raw.mind = { said: [{ n: 4, turn: 2, at: 5, text: 'Mara hates fog and loves tea.', kind: 'told', evil: 1 }], seq: 2 };
  storage.set(`nie.v1.project.${p.id}`, JSON.stringify(raw));
  const loaded = store.load(p.id).mind;
  assert.equal(loaded.said.length, 1);
  assert.deepEqual(Object.keys(loaded.said[0]).sort(), ['at', 'kind', 'n', 'text', 'turn']);
  assert.equal(loaded.seq, 4, 'seq is never behind the newest entry');
});

// ── (d) sanitizeMind on garbage ──────────────────────────────────────────────

test('sanitizeMind: junk, prototype keys, huge strings, wrong types and 100,000 entries come out clean and bounded', () => {
  for (const junk of [null, undefined, 0, 7, 'text', true, [], [1, 2], () => 1, Symbol('x'), NaN]) assert.deepEqual(sanitizeMind(junk), emptyMind());
  assert.deepEqual(sanitizeMind({ said: 'nope' }), emptyMind());
  assert.deepEqual(sanitizeMind({ said: { 0: { n: 1, text: 'hello there world' } } }), emptyMind());
  assert.deepEqual(sanitizeMind(Object.create({ said: [{ n: 1, text: 'inherited entries are not entries' }] })), emptyMind());

  const proto = JSON.parse('{"__proto__": {"polluted": true, "said": [{"n": 1, "text": "via proto"}]}, "constructor": {"prototype": {"polluted": true}}, "said": [{"n": 2, "text": "Mara hides the key in the bell.", "__proto__": {"polluted": true}, "constructor": "x", "prototype": 1}]}');
  const clean = sanitizeMind(proto);
  assert.equal(clean.said.length, 1);
  assert.deepEqual(Object.keys(clean.said[0]).sort(), ['at', 'kind', 'n', 'text', 'turn']);
  assert.equal({}.polluted, undefined);
  assert.equal(clean.polluted, undefined);
  assert.deepEqual(Object.keys(clean).sort(), ['said', 'seq', 'turn', 'v']);

  const huge = sanitizeMind({ said: [{ n: 1, turn: 1, at: 1, text: 'word '.repeat(300000), kind: 'told' }] });
  assert.equal(huge.said.length, 1);
  assert.ok(huge.said[0].text.length <= MIND_LIMITS.text);
  assert.ok(!huge.said[0].text.endsWith(' '));
  const oneToken = sanitizeMind({ said: [{ n: 1, text: 'x'.repeat(1e6) }] });
  assert.ok(oneToken.said[0].text.length <= MIND_LIMITS.text);

  const weird = sanitizeMind({
    said: [
      { n: '5', turn: '3', at: '7', text: ' a\u0000b‮c  d\ne ', kind: 'bogus' },
      { n: -1, text: 'negative id' },
      { n: 1.9, text: 'fractional id' },
      { n: 2, text: '' },
      { n: 3, text: 12345 },
      { n: 4, text: { toString: () => 'object' } },
      { n: 5, text: 'duplicate id wins later', turn: Infinity, at: -50, kind: 'added' },
      null, 7, 'str', [], { text: 'no id' },
    ],
    seq: -3,
    turn: 'NaN',
  });
  assert.deepEqual(weird.said.map((e) => e.n), [1, 5]);
  assert.equal(weird.said[0].text, 'fractional id');
  assert.equal(weird.said[1].text, 'duplicate id wins later');
  assert.equal(weird.said[1].kind, 'added');
  assert.equal(weird.said[1].at, 0);
  assert.equal(weird.seq, 5);
  const ctl = sanitizeMind({ said: [{ n: 1, text: ' a\u0000b‮c  d\ne ' }] });
  assert.equal(ctl.said[0].text, 'a b c d e');

  const many = Array.from({ length: 100000 }, (_, i) => ({ n: i + 1, turn: i, at: i, text: `Statement number ${i} about the harbour ${'x'.repeat(i % 400)}`, kind: 'told' }));
  const t0 = performance.now();
  const bounded = sanitizeMind({ said: many, seq: 100000 });
  assert.ok(performance.now() - t0 < 500, 'a hostile list costs little');
  assert.equal(bounded.said.length, MIND_LIMITS.said);
  assert.equal(bounded.said.at(-1).n, 100000, 'the newest are kept');
  assert.ok(bounded.said.every((e) => e.text.length <= MIND_LIMITS.text));
  assert.ok(JSON.stringify(bounded).length < 300000);

  // idempotent and JSON-safe
  assert.deepEqual(sanitizeMind(bounded), bounded);
  assert.deepEqual(JSON.parse(JSON.stringify(bounded)), bounded);
});

// ── (e) caps ─────────────────────────────────────────────────────────────────

/** A distinct, roughly 40-word statement (every one has its own made-up words, so none is a duplicate of another). */
function longStatement(i, rnd) {
  const vocab = 'harbour lantern ferry captain secret ledger bronze winter orchard garden station engine ticket doctor teacher market bridge river cousin letter compass'.split(' ');
  const w = [`Person${i}`, `zq${i}a`, `zq${i}b`, `zq${i}c`]; // (made-up words first: a statement is cut at 260 characters)
  for (let k = 0; k < 34; k++) w.push(vocab[Math.floor(rnd() * vocab.length)]);
  return `${w.join(' ')}.`;
}

test('the caps hold over 5,000 remembered statements, and a project with a full mind stays small', () => {
  const p = createProjectData();
  const rnd = seededRandom('caps');
  let accepted = 0;
  for (let i = 0; i < 5000; i++) if (rememberSaid(p, longStatement(i, rnd), { turn: i })) accepted++;
  assert.equal(accepted, 5000);
  assert.equal(p.mind.said.length, MIND_LIMITS.said);
  assert.ok(p.mind.said.every((e) => e.text.length <= MIND_LIMITS.text), 'every statement is at most 260 characters');
  assert.ok(p.mind.said.some((e) => e.text.length > 200), 'the statements really are long');
  assert.equal(p.mind.seq, 5000);
  assert.deepEqual(p.mind.said.map((e) => e.n), Array.from({ length: 600 }, (_, k) => 4401 + k), 'the newest 600 are the ones kept, in order');
  const json = JSON.stringify(p);
  assert.ok(json.length < 300000, `a project with a full mind is ${json.length} characters`);
  assert.deepEqual(sanitizeMind(JSON.parse(json).mind), p.mind, 'a full mind survives storage unchanged');

  // a 3,000-character statement is cut at a word to 260
  const q = createProjectData();
  const cut = rememberSaid(q, `${'The harbour at dusk is the colour of old pewter and slow. '.repeat(20)}`.slice(0, 1200));
  assert.ok(cut.text.length <= MIND_LIMITS.text);
  assert.ok(/[a-z]$/.test(cut.text) || /\.$/.test(cut.text));
});

test('over the cap, what the project holds elsewhere is not what stays: an old statement the idea sheet does not hold goes first', () => {
  const p = createProjectData();
  p.conversation.agent = sanitizeAgentState({ kind: 'story', slots: { protagonist: { value: 'Mara Quill, a retired ferry captain', turn: 1, via: 'said' } } });
  rememberSaid(p, 'Mara Quill is a retired ferry captain'); // n=1: held on the sheet too
  rememberSaid(p, 'The sailmaker lives behind the chandlery'); // n=2: only in the mind
  const rnd = seededRandom('anchor');
  for (let i = 0; i < MIND_LIMITS.said; i++) rememberSaid(p, longStatement(i, rnd));
  assert.equal(p.mind.said.length, MIND_LIMITS.said);
  assert.ok(p.mind.said.some((e) => e.n === 1), 'the statement the sheet also holds is kept (it is not the oldest unheld one)');
  assert.ok(!p.mind.said.some((e) => e.n === 2), 'the oldest one nothing else holds went first');

  const q = createProjectData(); // nothing anchored: plain oldest-first
  rememberSaid(q, 'Mara Quill is a retired ferry captain');
  for (let i = 0; i < MIND_LIMITS.said; i++) rememberSaid(q, longStatement(i, seededRandom('anchor')));
  assert.ok(!q.mind.said.some((e) => e.n === 1));
});

// ── (f) recall quality ───────────────────────────────────────────────────────

const SCRIPT = [
  'I want to write a cozy mystery set in a fishing village called Saltmarsh.',
  'The main character is Mara Quill, a retired ferry captain who notices everything.',
  'Mara wants to find out who sank the harbour bell before the regatta.',
  'The harbourmaster, Corin Voss, opposes her because he is hiding gambling debts.',
  'If Mara fails, the village loses its only festival and Corin keeps his secret.',
  'The tone should be warm but a little eerie, like fog in the morning.',
  'The theme is that small places keep big secrets.',
  'The story begins on the morning of the regatta when the bell is found missing.',
  'The baker Ines watches the whole harbour from her upstairs window.',
  "Ines is Mara's oldest friend and the only person who knows about the letter.",
  "The letter was written by Mara's late husband Tobias, a lighthouse keeper.",
  'Tobias drowned eleven years ago during the winter storm.',
  'Mara still wears his brass compass on a chain.',
  'The ending reveals that Corin hid the bell himself to stop the village selling the harbour.',
  'The village has a rule that no boat may leave the harbour while the fog horn sounds.',
  'A rival journalist named Pell arrives from the city on the second day.',
  'Pell is writing a feature about forgotten fishing towns and keeps asking about Tobias.',
  'The story is told in third person, past tense, close on Mara.',
  'I never want any violence on the page; the only death is Tobias, long before the story.',
  'The lighthouse is closed, but its lamp is seen burning on the third night.',
  "Mara's dog, a one-eyed terrier called Biscuit, finds the first clue.",
  'The first clue is a wet rope knotted in a way only ferry crews use.',
  "Corin's daughter Wren works at the cannery and secretly helps Mara.",
  'The cannery is the largest employer in Saltmarsh and is losing money.',
  'The festival is called Bellnight and happens every autumn when the tide is lowest.',
  'On Bellnight the villagers carry lanterns down to the shore and ring the harbour bell at midnight.',
  'The story takes place over five days in October.',
  'Each chapter opens with a line from the ferry logbook.',
  'I want short chapters, none longer than about 1,200 words.',
  'The vicar, Reverend Hale, is a red herring because he visits the harbour at night.',
  'Hale is actually meeting Ines to arrange a surprise for the birthday.',
  "Mara's birthday falls on the last day of the story.",
  'The book will be around eighty thousand words.',
  'My target readers are adults who enjoy gentle mysteries like Sunday afternoon television.',
  'The mood should never turn bleak, even in the darkest scene.',
  "Pell turns out to be Tobias's nephew, searching for his uncle's logbooks.",
  "The logbooks are hidden inside the bell's wooden frame.",
  'The bell is cast bronze, taller than a child, and older than the village charter.',
  'The sea in this story is almost a character, always described in terms of moods.',
  'The working title is The Salt Bell.',
];

function scriptedProject() {
  const p = createProjectData({ title: 'The Salt Bell' });
  SCRIPT.forEach((line, i) => assert.equal(rememberStatements(p, line, { turn: i + 1 }).length, 1, `one statement: ${line}`));
  assert.equal(p.mind.said.length, 40);
  return p;
}

const QUESTIONS = [
  ['What was Mara trying to do again?', /sank the harbour bell/],
  ['Where is the story set?', /fishing village called Saltmarsh/],
  ['Who is the harbourmaster?', /Corin Voss, opposes/],
  ['Why is Corin against her?', /opposes her because he is hiding/],
  ['What does the ending reveal?', /ending reveals that Corin hid the bell/],
  ['How should the book feel?', /warm but a little eerie/],
  ['Who rings the bell at midnight?', /ring the harbour bell at midnight/],
  ['Which friend knows about the letter?', /oldest friend and the only person who knows about the letter/],
  ['What is the festival named?', /festival is called Bellnight/],
  ['When does the story take place?', /five days in October/],
  ["What breed is Mara's dog?", /one-eyed terrier called Biscuit/],
  ['Why is Pell so interested in Tobias?', /nephew|keeps asking about Tobias/],
  ['What point of view and tense am I using?', /third person, past tense/],
  ['How long should each chapter be?', /short chapters, none longer/],
  ['Is any violence allowed?', /never want any violence/],
  ["What's the working title?", /working title is The Salt Bell|^Title: The Salt Bell$/],
  ['How many words will the book be?', /eighty thousand words/],
  ['Who is the vicar secretly meeting?', /meeting Ines/],
];

test('recall: the right earlier statement is in the top 3 for paraphrased questions about a 40-statement project', () => {
  const p = scriptedProject();
  let inTop1 = 0;
  for (const [q, expected] of QUESTIONS) {
    const r = recall(p, q);
    const rank = r.items.slice(0, 3).findIndex((x) => expected.test(x.text));
    assert.ok(rank >= 0, `"${q}" should find ${expected} in its top 3, got: ${JSON.stringify(texts(r))}`);
    if (rank === 0) inTop1++;
    assert.ok(r.block.startsWith("What you already know about this project, in the writer's own words (most relevant first):\n- "));
    for (const x of r.items) assert.ok(r.block.includes(`- ${x.text} (${x.where})`), 'every line of the block says where it came from');
    assert.ok(r.items.filter((x) => x.source === 'said').every((x) => /^you said, (?:\d+ messages ago|one message ago|in your last message)$/.test(x.where)));
  }
  assert.ok(QUESTIONS.length >= 15);
  assert.ok(inTop1 >= 10, `the right statement is first for most (${inTop1} of ${QUESTIONS.length})`);
});

test('recall: nothing comes back for small talk, and a message with no usable word finds nothing', () => {
  const p = scriptedProject();
  for (const talk of ['hi', 'Hello!', 'ok', 'Okay, cool.', 'thanks', 'Thanks, that helps!', 'lol', 'good morning', 'How are you today?', "what's up", 'thank you so much', 'yes please', 'no', '???', '', '   ', 'that is great, thank you so much', 'sounds good']) {
    const r = recall(p, talk);
    assert.deepEqual(r.items, [], `nothing for "${talk}"`);
    assert.equal(r.block, '');
  }
  for (const odd of [null, undefined, 42, {}, [], 'a'.repeat(100000)]) assert.deepEqual(recall(p, odd).items, []);
  // a question about something the writer never said finds nothing rather than something random
  assert.deepEqual(recall(p, 'What is the airspeed velocity of a swallow in a spaceship?').items, []);
});

test('recall: names find their passages, even written another way (possessive, case)', () => {
  const p = scriptedProject();
  assert.match(texts(recall(p, 'Tell me about Corin'))[0], /Corin/);
  assert.match(texts(recall(p, "Corin's secret"))[0], /Corin/);
  assert.match(texts(recall(p, 'what about corin'))[0], /Corin/);
  const names = recallNames(p, ['Pell']);
  assert.equal(names.items.length, 3);
  assert.ok(names.items.every((x) => /Pell/.test(x.text)));
  assert.equal(recallNames(p, ['Nobody']).items.length, 0);
  assert.equal(recallNames(p, []).items.length, 0);
  assert.equal(recallNames(p, null).items.length, 0);
  assert.equal(recallNames(p, ['a']).items.length, 0, 'one letter is not a name');
  assert.equal(recallNames(p, ['Hale']).items.length, 2);
  assert.equal(recallNames(p, ['Hal']).items.length, 0, 'whole words only');
  const many = recallNames(p, ['Mara'], { limit: 20, budgetTokens: 2000 });
  assert.equal(many.items.length, 5, 'up to 5 from one source unless asked otherwise');
  const mentions = SCRIPT.filter((l) => /\bMara\b/.test(l)).length;
  assert.ok(mentions > 5);
  assert.equal(recallNames(p, ['Mara'], { limit: 20, budgetTokens: 2000, perSource: 40 }).items.length, mentions, 'every passage that mentions her, when asked for all');
  assert.equal(recallNames(p, ['Mara'], { limit: 3, budgetTokens: 2000, perSource: 40 }).items.length, 3);
});

test('recall: a character and her other names stand for each other; rules and kept ideas outrank casual remarks', () => {
  const p = scriptedProject();
  rememberCharacter(p, { name: 'Mara Quill', aliases: ['Captain Quill', 'the Captain'], notes: 'retired ferry captain' });
  addRule(p, { text: 'Never show violence on the page', category: 'world' });
  const kept = addToBoard(p, { text: 'The premise: Mara hunts the missing bell · Setting: Saltmarsh', source: 'writer' }).item;
  p.conversation.agent = sanitizeAgentState({ kind: 'story', committed: [{ idea: 1, turn: 3, boardId: kept.id, digest: kept.text }] });
  const viaAlias = recallNames(p, ['Captain Quill']);
  assert.ok(viaAlias.items.some((x) => x.source === 'character'), 'the recorded character is found by her other name');
  assert.ok(viaAlias.items.some((x) => /Mara Quill/.test(x.text) && x.source === 'said'), 'and so are the statements that use her main name');
  assert.equal(viaAlias.items[0].source, 'character', 'recorded characters come before what was said');

  const r = recall(p, 'is violence on the page allowed?');
  assert.equal(r.items[0].source, 'rule');
  assert.equal(r.items[0].text, 'Your rule: Never show violence on the page');
  assert.equal(r.items[0].where, 'a rule you set');
  const k = recall(p, 'what is the premise about the missing bell in Saltmarsh');
  assert.ok(k.items.some((x) => x.source === 'kept' && x.where === 'kept on your Idea Board'));
});

// ── what the passages and recall are made of ─────────────────────────────────

test('passages: where each comes from, what counts for more, and NIE-made board ideas are marked', () => {
  const p = richProject('Zephyrine');
  const ps = passagesOf(p);
  const by = (source) => ps.filter((x) => x.source === source);
  assert.deepEqual(by('sheet').map((x) => x.text), ['Main character: Zephyrine the cartographer', 'Time and place: an island called Zephyrineholm'], 'sheet values carry the label of the story pack, in the pack\'s order');
  assert.ok(by('sheet').every((x) => x.where === "the idea we're on"));
  assert.ok(by('extra')[0].text.startsWith('Also: Zephyrine is afraid'));
  assert.ok(by('set-aside').every((x) => x.where === 'an idea set aside'));
  assert.ok(by('set-aside').some((x) => /twin sister/.test(x.text)) && by('set-aside').some((x) => /twin bakes bread/.test(x.text)));
  assert.equal(by('kept').length, 1);
  assert.equal(by('kept')[0].where, 'kept on your Idea Board');
  const board = by('board');
  const nie = board.filter((x) => x.by === 'nie');
  assert.equal(nie.length, 1);
  assert.equal(nie[0].where, 'Idea Board, an idea from NIE');
  assert.ok(nie[0].weight < by('said')[0].weight, "NIE's own board ideas count for less than the writer's words");
  assert.ok(board.filter((x) => !x.by).every((x) => x.where === 'Idea Board' || x.where === 'your note on an Idea Board item'));
  assert.ok(by('rule')[0].text.startsWith('Your rule: Zephyrine may never leave'));
  assert.ok(by('profile').some((x) => /Genre: Zephyrine noir/.test(x.text)) && by('profile').some((x) => /Point of view: close third person/.test(x.text)));
  assert.ok(by('deliberate')[0].text.includes('"Zephyrine walked and walked"'));
  assert.ok(by('character')[0].text.startsWith('Zephyrine (also Old Zephyrine): a cartographer'));
  assert.ok(by('premise').length >= 1);
  const w = (s) => by(s)[0].weight;
  assert.ok(w('rule') >= w('kept') && w('kept') > w('sheet') && w('sheet') > w('said') && w('said') > nie[0].weight, 'rules and kept ideas > recorded parts > said > NIE ideas');
  assert.ok(ps.filter((x) => x.source === 'said').every((x) => x.where.startsWith('you said')));

  const noSheet = passagesOf(p, { includeSheet: false });
  assert.ok(!noSheet.some((x) => x.source === 'sheet' || x.source === 'extra'));
  assert.ok(noSheet.some((x) => x.source === 'set-aside') && noSheet.some((x) => x.source === 'kept'));
});

test('passages: a kept idea is only "kept" while it is still on the Idea Board', () => {
  const p = richProject('Zephyrine');
  assert.ok(passagesOf(p).some((x) => x.source === 'kept'));
  const id = p.brainstorm.board.find((i) => /cartographer · Also/.test(i.text)).id;
  assert.ok(forgetItem(p, `kept:${id}`));
  assert.ok(!passagesOf(p).some((x) => x.source === 'kept'), 'taken off the board, no longer claimed as kept');
  assert.ok(!JSON.stringify(passagesOf(p)).includes('owns a parrot'), '...and not held as a board item either');
});

test("passages: 'you said, N messages ago' counts the writer's messages", () => {
  const p = createProjectData();
  rememberStatements(p, 'The harbour bell is made of bronze and older than the charter.');
  rememberStatements(p, 'Is it going to work?');
  rememberStatements(p, 'Thanks!');
  rememberStatements(p, 'The baker watches everything from her window.');
  const where = (re) => passagesOf(p).find((x) => re.test(x.text)).where;
  assert.equal(where(/harbour bell/), 'you said, 3 messages ago');
  assert.equal(where(/baker/), 'you said, in your last message');
  rememberStatements(p, 'The tide is lowest in October when the festival begins.');
  assert.equal(where(/baker/), 'you said, one message ago');
  assert.equal(passagesOf(p, { turn: 12 }).find((x) => /baker/.test(x.text)).where, 'you said, 8 messages ago');
  const bare = createProjectData();
  rememberSaid(bare, 'The harbour bell is made of bronze.');
  assert.equal(passagesOf(bare)[0].where, 'you said, earlier in this project', 'without message numbers it only says earlier');
});

test("recall: NIE's own Idea Board ideas are shown apart, never as something the writer said", () => {
  const p = createProjectData();
  rememberStatements(p, 'The lantern festival happens when the tide is lowest.');
  addToBoard(p, { text: 'What if the lantern festival hides a second, older festival', source: 'nie' });
  const r = recall(p, 'tell me about the lantern festival');
  assert.equal(r.items.length, 2);
  const [mine, theirs] = [r.items.find((x) => !x.by), r.items.find((x) => x.by === 'nie')];
  assert.ok(mine && theirs);
  const [head, rest] = r.block.split('\n\n');
  assert.ok(head.includes('lantern festival happens') && !head.includes('older festival'));
  assert.match(rest, /^Ideas NIE gave the writer earlier that they kept on the Idea Board \(NIE's ideas, not the writer's words\):\n- What if the lantern festival hides/);
});

test("recall: a message's own statements are not offered back to it, whichever way round the two calls are made", () => {
  const p = createProjectData();
  rememberStatements(p, 'The harbour bell is made of bronze and older than the village charter.');
  const message = 'Mara wants the bell back before the regatta. What do you think the bell is made of?';
  const before = recall(p, message);
  assert.ok(before.items.some((x) => /bronze/.test(x.text)), 'asked first, the earlier statement is found');
  rememberStatements(p, message);
  const after = recall(p, message);
  assert.ok(after.items.some((x) => /Mara wants the bell back/.test(x.text)), 'asked after remembering, the message itself comes back...');
  const fixed = recall(p, message, { excludeText: message });
  assert.ok(!fixed.items.some((x) => /Mara wants the bell back/.test(x.text)), '...unless the message is passed as already shown');
  assert.ok(fixed.items.some((x) => /bronze/.test(x.text)), 'and what was said before it still is found');
});

test('recall options: limit, token budget, at most 3 per source, near duplicates once, exclude by id and by text', () => {
  const p = createProjectData();
  const base = ['lantern', 'ferry', 'bronze', 'orchard', 'compass', 'ledger', 'harbour', 'winter'];
  base.forEach((w, i) => rememberSaid(p, `The ${w} belongs to the keeper of the lighthouse number ${i + 1} on the coast`, { turn: i + 1 }));
  const r = recall(p, 'tell me about the keeper of the lighthouse on the coast', { limit: 20 });
  assert.equal(r.items.length, 3, 'at most 3 from one source');
  assert.ok(Object.values(r.stats.sources).every((n) => n <= 3));
  assert.equal(r.stats.considered, 8);
  assert.equal(r.stats.shown, 3);

  const q = createProjectData();
  for (let i = 0; i < 10; i++) addToBoard(q, { text: `Idea ${i}: the harbourmaster keeps a secret ledger of lost ferries number ${i * 7919}`, source: 'writer' });
  for (let i = 0; i < 10; i++) rememberSaid(q, `The harbourmaster keeps a ledger about ferries and storm number ${i * 104729}`);
  const lim = recall(q, 'harbourmaster ledger ferries', { limit: 2 });
  assert.equal(lim.items.length, 2);
  const tiny = recall(q, 'harbourmaster ledger ferries', { limit: 6, budgetTokens: 60 });
  assert.ok(tiny.items.length >= 1 && tiny.items.length < 6);
  assert.ok(Math.ceil(tiny.block.length / 3.6) <= 60 + 25, 'the block stays about within its token budget');

  const dup = createProjectData();
  rememberSaid(dup, 'Mara keeps the brass compass on a chain around her neck');
  addToBoard(dup, { text: 'Mara keeps the brass compass on a chain around her neck.', source: 'writer' });
  assert.equal(recall(dup, 'where does Mara keep the brass compass').items.length, 1, 'the same thing recorded twice is shown once');

  const first = recall(p, 'tell me about the keeper of the lighthouse on the coast');
  const byId = recall(p, 'tell me about the keeper of the lighthouse on the coast', { exclude: new Set([first.items[0].id]) });
  assert.ok(!byId.items.some((x) => x.id === first.items[0].id));
  const byText = recall(p, 'tell me about the keeper of the lighthouse on the coast', { exclude: [first.items[0].text.toUpperCase() + '!!'] });
  assert.ok(!byText.items.some((x) => x.id === first.items[0].id), 'a text already shown is matched without regard to case and punctuation');
  const shownAlready = recall(p, 'tell me about the keeper of the lighthouse on the coast', { excludeText: `Earlier in this prompt: ${first.items[0].text}` });
  assert.ok(!shownAlready.items.some((x) => x.id === first.items[0].id));
  assert.ok(recall(p, 'tell me about the keeper of the lighthouse on the coast', { minScore: 50 }).items.length === 0, 'minScore is a floor');
});

test('recall: the words of the question can be a family of the words in the statement ("want / goal", "village / set")', () => {
  const p = createProjectData();
  rememberSaid(p, 'Her goal is to reach the northern lighthouse before the ice closes.');
  rememberSaid(p, 'The kettle in the kitchen has a loose handle and whistles badly.');
  for (const t of ['The market square floods every spring', 'Rowan keeps bees behind the chapel', 'The ferry runs twice a week in summer', 'A heron stands on the old pier at dawn', 'The schoolteacher paints watercolours of storms', 'Nobody remembers who built the tower', 'The cheese from the dairy is famous across the county']) rememberSaid(p, t);
  assert.match(texts(recall(p, 'What does she want?'))[0] ?? '', /goal is to reach/);
  assert.deepEqual(recall(p, 'Where is the kettle?').items.length, 1);
});

// ── (g) timing ───────────────────────────────────────────────────────────────

test('recall is fast: 600 statements and 200 board items in under 20 ms (median)', () => {
  const p = createProjectData();
  const rnd = seededRandom('speed');
  const vocab = 'bell harbour village ferry captain regatta festival secret debt letter lighthouse storm winter fog morning baker window friend husband compass dog rope clue cannery tide lantern shore midnight vicar journalist nephew logbook frame bronze charter chapter reader mystery warm eerie theme ending twist rival cousin garden orchard river bridge market station engine train ticket doctor nurse school teacher mother brother sister uncle aunt'.split(' ');
  const sentence = (i) => `Person${i} ${Array.from({ length: 14 }, () => vocab[Math.floor(rnd() * vocab.length)]).join(' ')} unique${i}x.`;
  for (let i = 0; i < MIND_LIMITS.said; i++) rememberSaid(p, sentence(i), { turn: i + 1 });
  for (let i = 0; i < 200; i++) addToBoard(p, { text: `${sentence(1000 + i)} ${sentence(2000 + i)}`, source: i % 2 ? 'writer' : 'nie' });
  assert.equal(p.mind.said.length, 600);
  assert.equal(p.brainstorm.board.length, 200);
  const qs = ['what did the baker want again?', 'where is the story set?', 'who is Person12?', 'tell me about the lantern and the midnight bell', 'how should the ending feel?'];
  const t0 = performance.now();
  recall(p, qs[0]);
  const cold = performance.now() - t0;
  const times = [];
  for (let i = 0; i < 25; i++) {
    const t = performance.now();
    recall(p, qs[i % qs.length]);
    times.push(performance.now() - t);
  }
  times.sort((a, b) => a - b);
  assert.ok(times[12] < 20, `median ${times[12].toFixed(1)} ms`);
  assert.ok(cold < 250, `first call ${cold.toFixed(1)} ms`);
  const t1 = performance.now();
  describeMind(p);
  mindStats(p);
  assert.ok(performance.now() - t1 < 100);
  // a 150,000-word story text is counted, not read, and still quick
  p.storyText = ('The tide came in slowly over the grey harbour wall and the gulls complained about it. '.repeat(12) + '\n\n').repeat(1250);
  const t2 = performance.now();
  const d = describeMind(p);
  assert.ok(d.counts.textSections > 100);
  assert.ok(performance.now() - t2 < 1000);
});

// ── (h) rememberSaid ─────────────────────────────────────────────────────────

test('rememberSaid refuses what is not a statement: pastes, shrugs, yes/no, empty and punctuation', () => {
  const p = createProjectData();
  const paste = 'The tide came in over the grey wall and the gulls complained. '.repeat(60); // 600 words
  const refused = [
    '', '   ', '...', '?!', '—', '\n\t', null, undefined, 42, {}, [], paste, 'word '.repeat(400),
    'Yes', 'yes.', 'No', 'nope!', 'Okay', 'ok thanks', 'Sure!', 'yeah, sure', 'Thanks', 'k', 'hmm',
    "I don't know", "I don't know.", 'idk', 'dunno', 'not sure yet', "I'm not sure", 'no idea', 'I have no idea', "I haven't decided yet", "don't know really",
    'She did it', // every word a stopword: nothing to find it by
  ];
  for (const text of refused) assert.equal(rememberSaid(p, text), null, `refused: ${JSON.stringify(typeof text === 'string' ? text.slice(0, 40) : text)}`);
  assert.deepEqual(p.mind.said, []);
  assert.equal(cleanStatement('word '.repeat(399)) !== null, true, '399 words is still a statement');
  assert.equal(rememberSaid(null, 'The bell is bronze.'), null);
  assert.equal(rememberSaid(undefined, 'The bell is bronze.'), null);
  assert.equal(rememberSaid('project', 'The bell is bronze.'), null);

  // these ARE statements, even though they sound a little like the above
  for (const text of ["I don't know why she left, nobody does", 'No one in the village trusts the baker', 'Okay, so the harbourmaster is the villain', 'Mara', '1984', 'Ines']) {
    assert.ok(rememberSaid(p, text), `kept: ${text}`);
  }
});

test('rememberSaid: a project without a mind gets one; the entry is the writer\'s words; ids grow; "forget this" removes one', () => {
  const p = { conversation: {} }; // not even a real project
  const e1 = rememberSaid(p, '  Mara   hides the key\nin the bell.  ', { turn: 3, kind: 'answered' });
  assert.deepEqual({ ...e1, at: 0 }, { n: 1, turn: 3, at: 0, text: 'Mara hides the key in the bell.', kind: 'answered' });
  assert.ok(e1.at > 0);
  assert.deepEqual(Object.keys(p.mind).sort(), ['said', 'seq', 'turn', 'v']);
  const e2 = rememberSaid(p, 'Corin lies about the ledger', { kind: 'nonsense' });
  assert.equal(e2.n, 2);
  assert.equal(e2.kind, 'told');
  assert.equal(e2.turn, 3, 'without a turn it takes the newest the mind knows');
  assert.equal(p.mind.seq, 2);

  assert.equal(forgetSaid(p, 99), false);
  assert.equal(forgetSaid(p, 'said:nope'), false);
  assert.equal(forgetSaid(p, 1), true);
  assert.deepEqual(p.mind.said.map((e) => e.n), [2]);
  assert.equal(forgetSaid(p, 'said:2'), true);
  assert.equal(forgetSaid(p, 'said:2'), false);
  const e3 = rememberSaid(p, 'The ledger is hidden in the church tower');
  assert.equal(e3.n, 3, 'a number is never reused');
  assert.equal(forgetSaid({}, 1), false);
  assert.equal(forgetSaid(null, 1), false);

  const broken = { mind: { said: 'x', seq: 'y' } };
  assert.ok(rememberSaid(broken, 'The ledger is hidden in the church tower'));
  assert.equal(broken.mind.said.length, 1);
});

test('rememberSaid: a statement and its opposite are two facts, never one ("not", "never", "no longer" change what is said)', () => {
  const p = createProjectData();
  rememberSaid(p, 'Mara is still a ferry captain', { turn: 1 });
  const neg = rememberSaid(p, 'Mara is no longer a ferry captain', { turn: 2 });
  assert.equal(p.mind.said.length, 2, 'the correction is kept next to what it corrects');
  assert.equal(neg.n, 2);
  const back = rememberSaid(p, 'Mara is still a ferry captain', { turn: 3 });
  assert.equal(back.n, 1, 'and saying the first again finds the first');
  assert.equal(p.mind.said.length, 2);
  rememberSaid(p, 'Corin did not hide the bell');
  rememberSaid(p, 'Corin did hide the bell');
  assert.equal(p.mind.said.length, 4);
  const q = createProjectData();
  rememberSaid(q, "She can't swim");
  rememberSaid(q, 'She can swim');
  assert.equal(q.mind.said.length, 2);
});

test('rememberSaid: the same thing said again is one fact; a statement that grows replaces the shorter one', () => {
  const p = createProjectData();
  const a = rememberSaid(p, 'Mara wants to find the harbour bell', { turn: 1 });
  const again = rememberSaid(p, 'mara wants to find the harbour bell!', { turn: 4 });
  assert.equal(again, a, 'the earlier entry is returned');
  assert.equal(p.mind.said.length, 1);
  assert.equal(a.turn, 4, 'and it counts as said again just now');
  assert.equal(p.mind.seq, 1);

  const inside = rememberSaid(p, 'Mara wants to find the bell', { turn: 5 }); // 90%+ of its words are already in the earlier one
  assert.equal(inside, a);
  assert.equal(p.mind.said.length, 1);

  const grown = rememberSaid(p, 'Mara wants to find the harbour bell before the regatta starts', { turn: 6 });
  assert.notEqual(grown, a);
  assert.deepEqual(p.mind.said.map((e) => e.text), ['Mara wants to find the harbour bell before the regatta starts'], 'the shorter statement is replaced, not repeated');
  assert.equal(grown.n, 2);

  rememberSaid(p, 'The baker Ines watches the harbour');
  rememberSaid(p, 'Corin hides gambling debts');
  assert.equal(p.mind.said.length, 3, 'different statements are different facts');
  const merged = rememberSaid(p, 'Corin hides gambling debts and the baker Ines watches the harbour from her window');
  assert.equal(p.mind.said.length, 2, 'one statement that contains two earlier ones replaces both');
  assert.ok(p.mind.said.some((e) => e.n === merged.n));

  const one = createProjectData();
  rememberSaid(one, 'Corin');
  assert.equal(rememberSaid(one, 'Corin hides debts').n, 2);
  assert.equal(one.mind.said.length, 1, 'a single name is absorbed by the statement that contains it');
  rememberSaid(one, 'Ines');
  assert.equal(one.mind.said.length, 2, 'but one word never swallows an unrelated statement');
});

test('statementsIn: a message becomes its statements; questions, requests and pastes become none', () => {
  assert.deepEqual(statementsIn('Yes, the bell is bronze. Can you give me ideas? Mara hates fog and loves tea. Write a scene about it. Corin lies.'), ['the bell is bronze.', 'Mara hates fog and loves tea.']);
  assert.deepEqual(statementsIn('Remember that Mara is afraid of deep water.'), ['Mara is afraid of deep water.']);
  assert.deepEqual(statementsIn('Well water in the village is brackish and cold.'), ['Well water in the village is brackish and cold.'], 'a word that is part of the sentence is not a filler');
  assert.deepEqual(statementsIn('- Corin lies about the debts\n- Ines watches the harbour at night\n1. The ending is a surprise for everyone.'), ['Corin lies about the debts', 'Ines watches the harbour at night', 'The ending is a surprise for everyone.']);
  assert.deepEqual(statementsIn('1984 was the year the harbour flooded.'), ['1984 was the year the harbour flooded.']);
  assert.deepEqual(statementsIn('Is the ending too predictable?'), []);
  assert.deepEqual(statementsIn('What is the bell made of'), [], 'a question without its mark is still a question');
  assert.deepEqual(statementsIn('Can you write the opening scene for me please'), []);
  assert.deepEqual(statementsIn('Please give me ten twists for the ending'), []);
  assert.deepEqual(statementsIn("Let's develop this idea further now"), []);
  assert.deepEqual(statementsIn('Thanks, that was really helpful today.'), []);
  assert.deepEqual(statementsIn('When the bell goes missing, Mara starts to investigate.'), ['When the bell goes missing, Mara starts to investigate.'], '"When ..." is not always a question');
  assert.deepEqual(statementsIn('Yes.'), []);
  assert.deepEqual(statementsIn(''), []);
  assert.deepEqual(statementsIn(null), []);
  assert.deepEqual(statementsIn(12), []);
  assert.deepEqual(statementsIn('Mara went home. '.repeat(200)), [], 'a pasted text of 400+ words is not a statement');

  const twelve = Array.from({ length: 12 }, (_, i) => `Villager number ${i + 1} keeps a secret lantern.`).join(' ');
  assert.equal(statementsIn(twelve).length, MIND_LIMITS.perMessage, 'at most 8 from one message');
  assert.equal(statementsIn(twelve)[7], 'Villager number 8 keeps a secret lantern.');

  // a sentence longer than a statement is cut at its clause breaks; no words are lost
  const long = `${'Mara walks the whole length of the harbour wall every morning before anyone is awake, '.repeat(3)}and she counts the boats, and she writes down every single name, because the ledger matters more than she admits to anyone in the village.`;
  const parts = statementsIn(long);
  assert.ok(parts.length >= 2 && parts.every((s) => s.length <= MIND_LIMITS.text), JSON.stringify(parts));
  assert.equal(parts.join(' ').replace(/\s+/g, ' '), long.replace(/\s+/g, ' ').replace(/, (?=and she|because)/g, ', ').trim());
});

test('rememberStatements: one message, one turn, many facts; every writer message counts', () => {
  const p = createProjectData();
  const es = rememberStatements(p, 'The bell is cast bronze. The harbourmaster is hiding debts. Can you suggest a twist?');
  assert.equal(es.length, 2);
  assert.deepEqual(es.map((e) => e.turn), [1, 1]);
  assert.deepEqual(rememberStatements(p, 'Can you suggest a twist for the ending?'), []);
  assert.equal(p.mind.turn, 2, 'a question is still a message');
  const later = rememberStatements(p, 'The bell is cast bronze.', { kind: 'told' });
  assert.equal(later.length, 1);
  assert.equal(later[0], es[0], 'a repeat is the entry already held');
  assert.equal(later[0].turn, 3);
  assert.equal(p.mind.said.length, 2);
  assert.deepEqual(rememberStatements(null, 'The bell is cast bronze.'), []);
  assert.deepEqual(rememberStatements(deepFreeze(createProjectData()), 'The bell is cast bronze.'), []);
});

// ── (i) nothing is mutated by reading ────────────────────────────────────────

test('recall, recallNames, passagesOf, describeMind and mindStats never change the project they are given', () => {
  const live = richProject('Zephyrine');
  for (let i = 0; i < 30; i++) rememberStatements(live, `Villager number ${i} keeps a secret about Zephyrine and the ${i}th lantern.`);
  const before = JSON.stringify(live);
  const frozen = deepFreeze(JSON.parse(before));
  for (const p of [live, frozen]) {
    assert.ok(recall(p, 'what does Zephyrine want?').items.length > 0);
    assert.ok(recallNames(p, ['Zephyrine']).items.length > 0);
    assert.ok(passagesOf(p).length > 10);
    assert.ok(describeMind(p).items.length > 10);
    assert.ok(mindStats(p).total > 10);
    assert.ok(passagesOf(p, { includeSheet: false }).length > 5);
    assert.equal(JSON.stringify(p), before, 'unchanged');
  }
  // a project with no mind at all is read without being given one
  const bare = { title: 'bare', memory: { characters: [{ name: 'Mara', aliases: [], notes: 'ferry captain' }] } };
  assert.equal(recall(bare, 'who is Mara?').items.length, 1);
  assert.equal('mind' in bare, false);
  // odd shapes in the project do not throw
  for (const odd of [null, undefined, 7, 'x', [], {}, { memory: null, rules: 'x', brainstorm: { board: [null, 5, { text: 7 }] }, conversation: { agent: { slots: 5, shelf: 'x' }, workingPremise: [] }, profile: 3, mind: { said: [null, 4, { text: 3 }] } }]) {
    assert.doesNotThrow(() => {
      recall(odd, 'what does Mara want?');
      recallNames(odd, ['Mara']);
      passagesOf(odd);
      describeMind(odd);
      mindStats(odd);
    });
  }
});

// ── describe and forget ──────────────────────────────────────────────────────

test('describeMind: counts what is really held, lists it, says what can be removed, and says it in plain words', () => {
  const p = richProject('Zephyrine');
  const d = describeMind(p);
  assert.equal(d.counts.said, p.mind.said.length);
  assert.equal(d.counts.sheet, 3, 'two parts of the idea and one Also detail');
  assert.equal(d.counts.setAside, 1);
  assert.equal(d.counts.kept, 1);
  assert.equal(d.counts.board, 2, 'the other Idea Board items (the kept idea is counted as kept)');
  assert.equal(d.counts.characters, 1);
  assert.equal(d.counts.themes, 1);
  assert.equal(d.counts.motifs, 1);
  assert.equal(d.counts.timeline, 1);
  assert.equal(d.counts.rules, 1);
  assert.equal(d.counts.textSections, 1);
  assert.equal(d.counts.notes, 0);
  assert.equal(d.items.length, passagesOf(p).length);
  assert.match(d.summary, /^NIE holds \d+ things you've said, 3 parts of the idea you're on, 1 idea set aside, 1 kept idea, 2 other Idea Board items, 1 character, 1 theme, 1 motif, 1 timeline entry, 1 rule of yours.* for this project\./);
  assert.match(d.summary, /I read your long text \(1 section\) separately\.$/);
  for (const it of d.items) {
    assert.deepEqual(Object.keys(it).filter((k) => !['by'].includes(k)).sort(), ['id', 'removable', 'removeWith', 'source', 'text', 'where']);
    const should = it.source === 'said' || ((it.source === 'board' || it.source === 'kept') && !it.id.endsWith(':note'));
    assert.equal(it.removable, should, `${it.id} removable=${should}`);
    assert.equal(it.removeWith, !should ? null : it.source === 'said' ? 'forgetSaid' : 'removeFromBoard');
  }
  p.readingNotes = { v: 1, sections: { a1: { n: { gist: 'x' }, t: 1 }, b2: { n: { gist: 'y' }, t: 2 } }, overviews: {} };
  assert.equal(describeMind(p).counts.notes, 2);
  assert.match(describeMind(p).summary, /keep 2 reading notes on it\.$/);
  assert.deepEqual(mindStats(p), { said: p.mind.said.length, total: passagesOf(p).length, notes: 2, line: `NIE holds ${passagesOf(p).length} things for this project` });
});

test('forgetItem removes what describeMind says is removable, and only that', () => {
  const p = richProject('Zephyrine');
  const d = describeMind(p);
  const said = d.items.find((i) => i.source === 'said');
  const boardItem = d.items.find((i) => i.source === 'board' && i.removable);
  const rule = d.items.find((i) => i.source === 'rule');
  assert.equal(forgetItem(p, rule.id), false);
  assert.equal(p.rules.length, 1, 'rules are managed where the writer made them');
  assert.equal(forgetItem(p, said.id), true);
  assert.equal(forgetItem(p, said.id), false);
  assert.equal(forgetItem(p, boardItem.id), true);
  assert.equal(forgetItem(p, 'board:nonexistent'), false);
  assert.equal(forgetItem(p, 42), false);
  assert.equal(forgetItem(p, 'whatever'), false);
  const after = describeMind(p);
  assert.equal(after.counts.said, d.counts.said - 1);
  assert.equal(after.counts.board, d.counts.board - 1);
  assert.ok(!after.items.some((i) => i.id === said.id || i.id === boardItem.id));
  assert.ok(!recall(p, said.text).items.some((i) => i.id === said.id), 'forgotten means gone from recall too');
});

test('the public object and the named exports are the same functions', () => {
  for (const name of ['emptyMind', 'sanitizeMind', 'rememberSaid', 'rememberStatements', 'statementsIn', 'forgetSaid', 'forgetItem', 'passagesOf', 'recall', 'recallNames', 'describeMind', 'mindStats']) {
    assert.equal(typeof mindApi[name], 'function', name);
  }
  assert.equal(mindApi.recall, recall);
  assert.equal(mindApi.describeMind, describeMind);
});
