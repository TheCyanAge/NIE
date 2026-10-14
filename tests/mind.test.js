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
import { memoByText, tokensOf } from '../apps/web/src/engine/mind/tokens.js';
import { roleLinks } from '../apps/web/src/engine/mind/recall.js';

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

  const many = Array.from({ length: 30 }, (_, i) => `Villager number ${i + 1} keeps a secret lantern.`).join(' ');
  assert.equal(statementsIn(many).length, MIND_LIMITS.perMessage, `at most ${MIND_LIMITS.perMessage} from one message`);
  assert.equal(statementsIn(many)[MIND_LIMITS.perMessage - 1], `Villager number ${MIND_LIMITS.perMessage} keeps a secret lantern.`);
  const twelve = Array.from({ length: 12 }, (_, i) => `Villager number ${i + 1} keeps a secret lantern.`).join(' ');
  assert.equal(statementsIn(twelve).length, 12, 'a list of a dozen facts is kept whole');

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

// ── review round: three more scripted projects, written in other registers than the first, with 100+ paraphrased questions ──────────

const MEMOIR = [
  "Working on a memoir about growing up above my parents' fish and chip shop in Whitby",
  "I was born in 1979 and the shop closed in 1996 when Dad had his stroke",
  "Dad, Ray Pollard, never said I love you but he left the fryer oil warm for me every night",
  "my mum Dolores was the loud one, she ran the till and knew everyone's business",
  "Gran Nora lived with us in the back room and told me the town's ghost stories",
  "The big event of the book is the winter of 1987 when the sea wall collapsed and the shop flooded",
  "I want that chapter to be the emotional centre",
  "my sister Carol left for Leeds at seventeen and we barely spoke for ten years",
  "Carol and I only made up at Dad's funeral",
  "I want it to read like a long letter to Carol",
  "the voice is wry and affectionate, never self-pitying",
  "no swearing in narration, though characters can swear in dialogue",
  "Structure: twelve chapters, each named after something you could order at the counter",
  "Chapter one is called Cod and Chips, medium",
  "The readers I'm picturing are people who grew up in seaside towns and left",
  "I'm worried about being unfair to Mum",
  "She hit me once, with a wet tea towel, and I've never forgiven myself for laughing",
  "Mr Abbott, the man who delivered the potatoes, taught me to drive in his van",
  "I was the first in the family to go to university, to study English at Sheffield",
  "Dad never visited me there",
  "The shop smelled of vinegar and wet coats and the radio was always on Radio 2",
  "Every chapter ends on a smell or a taste",
  "I changed some names for privacy, Carol is real but Abbott is a pseudonym",
  "Nora died in 1991, in the back room, with the radio on",
  "Do not include the thing about my uncle's gambling, I promised Mum",
  "The book should be around 70,000 words",
  "I am writing it in the past tense but the last chapter switches to present",
  "The title might be Salt and Vinegar",
  "my agent thinks it should open with the flood but I want to open with the fryer",
  "I'm submitting to publishers in spring",
  "The pier was where Carol and I used to smoke and make plans to leave",
  "Dolores had a brother, Uncle Terry, who sold insurance and never paid for a meal",
  "The shop's name was Pollard's Plaice, which Dad hated because Mum chose the pun",
  "In 1994 a rival chippy opened across the road called The Codfather",
  "Dolores refused to sell the shop even when the council offered a lot of money",
  "I should mention the bomb scare in 1992",
  "what I remember most about Dad is his hands, scarred from the fryer",
  "The last scene is me re-opening the shop for one night in 2019",
  "I'm 46 now and I live in Manchester with my wife Jess",
  "Jess has read the first four chapters and says they're too kind",
];

const MEMOIR_QUESTIONS = [
  ["What was my dad called?", /Ray Pollard/],
  ["When was I born?", /born in 1979/],
  ["why did the shop shut?", /closed in 1996 when Dad had his stroke/],
  ["who is Dolores?", /my mum Dolores/],
  ["tell me about my gran", /Gran Nora/],
  ["what is the central chapter?", /emotional centre|winter of 1987/],
  ["how do Carol and I make up?", /made up at Dad's funeral|Carol and I only made up/],
  ["what is the voice like?", /wry and affectionate/],
  ["can I swear in the narration?", /no swearing in narration|No swearing in the narration/],
  ["how are the chapters named?", /named after something you could order/],
  ["what's the first chapter called?", /Chapter one is called Cod and Chips/],
  ["who is the audience?", /readers I'm picturing/],
  ["what happened with Mum and the tea towel?", /wet tea towel/],
  ["who taught me to drive?", /Mr Abbott/],
  ["where did I study?", /Sheffield/],
  ["what did the shop smell like?", /vinegar and wet coats/],
  ["how does each chapter end?", /ends on a smell or a taste/],
  ["is Abbott a real name?", /pseudonym/],
  ["when did Gran die?", /Nora died in 1991/],
  ["are there things I promised not to include?", /uncle's gambling/],
  ["how many words should it be?", /70,000 words/],
  ["which tense?", /past tense but the last chapter switches/],
  ["what might it be called?", /Salt and Vinegar/],
  ["what does my agent want?", /agent thinks it should open with the flood/],
  ["when am I submitting?", /spring/],
  ["where did Carol and I hang out as teenagers?", /pier/],
  ["what was Uncle Terry's job?", /sold insurance/],
  ["what was the shop called?", /Pollard's Plaice/],
  ["was there a competitor?", /The Codfather/],
  ["did Mum ever consider selling?", /refused to sell/],
  ["how does the book end?", /last scene is me re-opening the shop/],
  ["where do I live now?", /Manchester/],
  ["what's Jess's opinion?", /too kind/],
  ["how old am I?", /46 now/],
  ["what do I remember about Dad's hands?", /hands, scarred/],
  ["what's the problem with portraying Mum?", /worried about being unfair to Mum/],
];

const FANTASY = [
  "this is a YA fantasy, first in a trilogy, for readers around 13 to 17",
  "world is called Verrin, an archipelago of floating islands held up by singing stones",
  "the hero is Kestrel Wynne, sixteen, a stonesinger's apprentice who can't hold a note",
  "her master, Old Bram, is going deaf and hiding it from the guild",
  "the stones are going quiet, island by island, and the guild blames the sky pirates",
  "the pirates are led by Captain Ismay Thorne who actually wants to save the stones",
  "Kestrel's best friend is Dov, a cabin boy on a trading skiff who talks too much",
  "there's a love triangle I really don't want, keep the romance to a slow burn between Kestrel and Ismay's navigator, Lio",
  "Lio is nonbinary and uses they/them",
  "magic works by harmony, so two singers together are stronger than one",
  "the cost of magic is memory: every song costs the singer a memory",
  "Kestrel can't sing but she can hear the stones' true note, which nobody else can",
  "the villain is Magistrate Corvane who is silencing the stones on purpose to take over the islands",
  "Corvane believes the singing stones are slowly pulling all the islands into the sea",
  "he's partly right, which makes him a good villain",
  "twist at the end of book one: Old Bram knew Kestrel's gift and kept it from her",
  "first chapter opens on the Harvest Chorus, which goes wrong when the stone under the stage cracks",
  "the story is third person limited, past tense, with Kestrel as the only viewpoint",
  "I want the language slightly archaic but never purple",
  "no chosen one prophecy, she's good because she's stubborn not because she's special",
  "there are no elves or dwarves, just humans and the drake-whales that carry the ships",
  "drake-whales are intelligent but cannot speak, they communicate through low songs",
  "Dov's skiff is called the Lucky Penny",
  "the book is about 85,000 words",
  "Kestrel's mother vanished when she was six, and everyone says she was a pirate",
  "her mum was actually a guild spy who was caught",
  "important: this is revealed in book two, not book one",
  "the three major islands are Highmere, Saltreach and the Hollow",
  "Highmere is the guild's seat, all white towers and bells",
  "Saltreach is the trading port and the pirates' favourite market",
  "the Hollow is the oldest island, mostly deserted, where the first stone was sung",
  "Magistrate Corvane has a scar down his left cheek from a stone shard",
  "humour matters, Dov should get the jokes and Kestrel the dry one-liners",
  "no gore, but death is allowed and should have weight",
  "the title is The Quiet Stones",
  "series title is Songs of Verrin",
  "chapter length around 3,000 words, forty chapters",
  "the guild's motto is 'Hold the note'",
  "Kestrel's flaw is that she never asks for help",
  "the ending of book one: Kestrel hums the true note and the Hollow stone wakes, but she loses her earliest memory of her mother",
];

const FANTASY_QUESTIONS = [
  ["how old is the main character?", /sixteen/],
  ["who are the readers?", /readers around 13 to 17/],
  ["what's the name of the world?", /world is called Verrin/],
  ["what holds the islands up?", /singing stones/],
  ["what is Kestrel apprenticed to be?", /stonesinger/],
  ["what's wrong with Bram?", /going deaf/],
  ["who's to blame for the quiet stones according to the guild?", /guild blames the sky pirates/],
  ["who leads the pirates?", /Captain Ismay Thorne/],
  ["what does Ismay really want?", /save the stones/],
  ["who is Kestrel's best friend?", /best friend is Dov/],
  ["is there a love triangle?", /love triangle/],
  ["what are Lio's pronouns?", /they\/them/],
  ["how does magic work?", /harmony/],
  ["what does it cost to use magic?", /cost of magic is memory/],
  ["who is the bad guy?", /villain is Magistrate Corvane/],
  ["why does Corvane silence the stones?", /silencing the stones on purpose|pulling all the islands/],
  ["what is the twist in the first book?", /twist at the end of book one/],
  ["how does chapter one begin?", /first chapter opens on the Harvest Chorus/],
  ["what perspective is it told from?", /third person limited/],
  ["how should the prose sound?", /slightly archaic/],
  ["is she the chosen one?", /no chosen one prophecy|chosen/],
  ["are there elves?", /no elves or dwarves/],
  ["what carries the ships?", /drake-whales/],
  ["what is the skiff called?", /Lucky Penny/],
  ["how long is the book?", /85,000 words/],
  ["what happened to her mum?", /mother vanished|guild spy/],
  ["when is the mother revealed?", /revealed in book two/],
  ["what are the main islands?", /three major islands/],
  ["where is the guild based?", /Highmere is the guild's seat/],
  ["where do pirates shop?", /Saltreach is the trading port/],
  ["where was the first stone sung?", /Hollow is the oldest island/],
  ["how did Corvane get his scar?", /scar down his left cheek/],
  ["who gets the funny lines?", /Dov should get the jokes/],
  ["can people die in the book?", /death is allowed/],
  ["what is the series called?", /Songs of Verrin/],
  ["how many chapters?", /forty chapters/],
  ["what does the guild say?", /Hold the note/],
  ["what's Kestrel's weakness?", /never asks for help/],
  ["how does book one finish?", /ending of book one/],
];

const HEIST = [
  "It's a feature screenplay, a heist thriller, about 100 minutes",
  "A crew of five robs the Halvorsen Diamond Exchange on New Year's Eve",
  "The leader is Odette Marsh, a former insurance investigator who knows how vaults fail",
  "Her second in command is a safecracker called Big Wick, real name Winston Eze",
  "Wick is gentle and hates violence, he keeps bees on a rooftop",
  "The driver is a nineteen year old named Pip who has never actually driven a getaway",
  "The inside man is the exchange's night manager, Mr Sorensen, who is being blackmailed",
  "Sorensen is blackmailed by the police commissioner, Lucille Grange, over an old embezzlement",
  "So the twist is that the commissioner wants the robbery to happen",
  "She needs the diamonds gone before an audit exposes her",
  "Odette discovers this in the second act and has to decide whether to continue",
  "The vault has a time lock that opens for exactly eleven minutes at midnight",
  "Fireworks over the harbour cover the noise of the drilling",
  "Nobody dies in this film, it should feel like a caper, fun, stylish, a bit Ocean's Eleven",
  "The crew's safe house is a closed-down bowling alley",
  "Pip keeps losing her phone, it's a running gag",
  "I want a long single-take sequence for the vault break-in",
  "The score should be jazz, upright bass and brushed drums",
  "Third act: the crew steals the diamonds from the commissioner's own car as she tries to flee",
  "The final image is Odette handing the audit papers to a journalist",
  "Odette's backstory: she was fired for reporting her boss for fraud, and nobody believed her",
  "Winston and Odette were partners at the insurance firm before it all went wrong",
  "Dialogue should be fast, overlapping, like His Girl Friday",
  "The film is set in an unnamed European port city, in a slightly stylised 1960s",
  "Act one ends when the crew learns that the vault changed its lock the week before",
  "We need a fifth member: Tamsin, a forger who is Odette's estranged daughter",
  "Tamsin and Odette haven't spoken for six years",
  "Their reconciliation is the emotional core, in the bowling alley at 4am",
  "Rule: no one ever explains the plan to the audience in a voiceover",
  "Instead we show the plan going wrong and the crew improvising",
  "The audience should be adults who like smart comedies and old heist films",
  "Title ideas: Eleven Minutes, The Halvorsen Job, Midnight Lock",
  "I like Eleven Minutes best",
  "The budget is modest so the vault interior is one set",
  "Runtime should not go over 105 minutes",
  "There's a recurring motif of clocks and bells",
  "The commissioner has a dog, a pug called Napoleon, who is the only one that likes her",
  "I'd like the last line to be Pip's: finally somebody lets me drive",
  "The opening scene is the crew in a diner, arguing over how to split five ways",
  "Sorensen sweats a lot, he's comic relief and also genuinely scared",
];

const HEIST_QUESTIONS = [
  ["what kind of film is this?", /heist thriller/],
  ["how long is the movie?", /100 minutes|105 minutes/],
  ["what do the crew steal?", /Diamond Exchange|diamonds/],
  ["who runs the crew?", /leader is Odette|leader of the crew/],
  ["who is the safecracker?", /Big Wick|Winston Eze/],
  ["what does Wick do in his spare time?", /bees/],
  ["how old is Pip?", /nineteen year old/],
  ["who is the inside man?", /inside man is the exchange's night manager/],
  ["who is blackmailing Sorensen?", /blackmailed by the police commissioner/],
  ["what is the big twist?", /twist is that the commissioner wants/],
  ["why does Grange want the heist?", /audit exposes her|needs the diamonds gone|commissioner wants the robbery/],
  ["how long is the window to open the vault?", /exactly eleven minutes/],
  ["what covers the noise?", /Fireworks/],
  ["is anyone killed?", /Nobody dies/],
  ["where do they hide out?", /safe house is a closed-down bowling alley/],
  ["what is the running gag?", /losing her phone/],
  ["what kind of music?", /score should be jazz/],
  ["how does the third act go?", /Third act/],
  ["what is the last shot?", /final image/],
  ["what's Odette's history?", /backstory|fired for reporting/],
  ["what style of dialogue?", /fast, overlapping/],
  ["where and when is it set?", /unnamed European port city/],
  ["how does act one end?", /Act one ends/],
  ["who's Tamsin?", /fifth member: Tamsin|Tamsin and Odette/],
  ["how long since Tamsin and Odette spoke?", /six years/],
  ["where does the reconciliation happen?", /bowling alley at 4am/],
  ["can I use voiceover to explain the plan?", /no one ever explains the plan|Nobody explains the plan/],
  ["who is the audience?", /audience should be adults/],
  ["what are the title options?", /Title ideas/],
  ["which title did I pick?", /like Eleven Minutes best|Title: Eleven Minutes/],
  ["what's Pip's last line?", /last line to be Pip's/],
  ["how does the film begin?", /opening scene is the crew in a diner/],
  ["what is the budget like?", /budget is modest/],
  ["what is Sorensen like?", /sweats a lot/],
  ["what recurring images are there?", /clocks and bells/],
];

function scripted(lines, extras = () => {}) {
  const p = createProjectData({ title: 'Untitled project' });
  lines.forEach((line, i) => rememberStatements(p, line, { turn: i + 1 }));
  extras(p);
  return p;
}
const memoirProject = () =>
  scripted(MEMOIR, (p) => {
    addRule(p, { text: 'No swearing in the narration', category: 'voice' });
    rememberCharacter(p, { name: 'Carol', aliases: ['my sister'], notes: 'older sister who left for Leeds' });
  });
const fantasyProject = () =>
  scripted(FANTASY, (p) => {
    p.title = 'The Quiet Stones';
    addRule(p, { text: 'Never use the word chosen about Kestrel', category: 'voice' });
    rememberCharacter(p, { name: 'Kestrel Wynne', aliases: ['Kes'], notes: 'stonesinger apprentice' });
  });
const heistProject = () =>
  scripted(HEIST, (p) => {
    p.title = 'Eleven Minutes';
    addRule(p, { text: 'Nobody explains the plan in voiceover', category: 'style' });
    rememberCharacter(p, { name: 'Odette Marsh', aliases: ['Odette'], notes: 'leader of the crew' });
    addToBoard(p, { text: 'Main character: Odette · Ending: she hands the audit papers to a journalist', source: 'writer' });
    addToBoard(p, { text: 'What if the dog betrays the commissioner', source: 'nie' });
  });

test('recall (review): a memoir, a YA fantasy and a heist screenplay, 100+ paraphrased questions: the right statement is in the top 3 for every one', () => {
  let asked = 0;
  let first = 0;
  for (const [make, questions] of [[memoirProject, MEMOIR_QUESTIONS], [fantasyProject, FANTASY_QUESTIONS], [heistProject, HEIST_QUESTIONS]]) {
    const p = make();
    for (const [q, expected] of questions) {
      const r = recall(p, q);
      const rank = r.items.slice(0, 3).findIndex((x) => expected.test(x.text));
      assert.ok(rank >= 0, `"${q}" should find ${expected} in its top 3, got: ${JSON.stringify(texts(r).map((t) => t.slice(0, 70)))}`);
      asked++;
      if (rank === 0) first++;
    }
  }
  assert.ok(asked >= 100, `${asked} questions`);
  assert.ok(first / asked >= 0.7, `the right statement is first for most of them (${first} of ${asked})`);
});

test('recall (review): a question that is about something else finds nothing, and so does one made of words this project never used', () => {
  for (const p of [memoirProject(), fantasyProject(), heistProject()]) {
    for (const q of ['who won the football final', 'how long does it take to boil an egg', 'when was the telephone invented', 'what is the capital of France', 'how do I cook rice', 'translate hello into Spanish', 'what is the speed of light', 'weather tomorrow']) {
      assert.deepEqual(recall(p, q).items, [], `nothing for "${q}"`);
    }
  }
});

test('recall (review): "Mum" finds what was said about Dolores, a name finds what was said with the role word, and a question about a role finds the name it was given', () => {
  const p = memoirProject();
  assert.match(texts(recall(p, 'did Mum ever consider selling?')).join(' | '), /Dolores refused to sell/, 'a statement that names her finds the question that only says Mum');
  const dolores = texts(recall(p, 'tell me about Dolores', { limit: 8 }));
  assert.ok(dolores.some((t) => /my mum Dolores/.test(t)), 'the statement that names her');
  assert.match(texts(recall(p, 'What was my dad called?')).join(' | '), /Ray Pollard/);
  const q = heistProject();
  assert.match(texts(recall(q, 'why does Grange want the heist?')).join(' | '), /commissioner wants the robbery/, 'Grange is the commissioner');
});

test('roleLinks (review): who is who comes only from the passages it is given', () => {
  const A = createProjectData();
  rememberStatements(A, 'My mum Dolores ran the till and knew everyone.');
  rememberStatements(A, 'The baker Ines watches the harbour from her window.');
  const B = createProjectData();
  rememberStatements(B, 'My mum Carmen ran the ferry and knew everyone.');
  const a = roleLinks(passagesOf(A));
  const b = roleLinks(passagesOf(B));
  assert.deepEqual([...a.roles.get('mum')].sort(), ['dolor'], 'the stem of Dolores, as every word is compared');
  assert.deepEqual([...b.roles.get('mum')].sort(), ['carmen']);
  assert.ok(a.roles.get('baker')?.has('ine'), 'a trade works as a role too');
  assert.ok(!b.roles.has('baker'));
  assert.deepEqual([...roleLinks(passagesOf(A)).roles.get('mum')], ['dolor'], 'building the other one in between changed nothing');
  assert.ok(!/carmen/i.test(JSON.stringify([...roleLinks(passagesOf(A)).roles])));
  // asking B about "Mum" never turns up A's Dolores
  assert.ok(!/dolores/i.test(JSON.stringify(recall(B, 'what did Mum do?'))));
  assert.match(texts(recall(B, 'what did Mum do?'))[0], /Carmen/);
  assert.deepEqual([...roleLinks([]).roles], []);
});

test('rememberSaid (review): the same words in another order, or with another name or number, are another fact', () => {
  const p = createProjectData();
  const n = (t) => rememberSaid(p, t)?.n;
  const a = n('Mara loves Corin');
  assert.notEqual(n('Corin loves Mara'), a, 'who loves whom matters');
  const age = n('Mara is 47 years old, she lives in Saltmarsh with her dog Biscuit and works as ferry captain');
  assert.notEqual(n('Mara is 52 years old, she lives in Saltmarsh with her dog Biscuit and works as ferry captain'), age, 'a changed number is a new fact, not a repeat');
  const who = n('Corin hides the bell in the church tower above the old cannery pier near the harbour');
  assert.notEqual(n('Mara hides the bell in the church tower above the old cannery pier near the harbour'), who, 'a changed name too');
  const days = n('The next course burn happens in eleven days and the whole crew knows about it from the logs');
  assert.notEqual(n('The next course burn happens in twelve days and the whole crew knows about it from the logs'), days);
  // ...while a real repeat or a statement that grows is still one fact
  const bell = n('The harbour bell is cast bronze and older than the village charter');
  assert.equal(n('The harbour bell is cast bronze and older than the village charter.'), bell);
  assert.equal(n('MARA LOVES CORIN'), a, 'case is not a difference');
  const before = p.mind.said.length;
  const grown = n('She wants the bell before the regatta');
  const longer = n('She wants the bell before the regatta starts on Saturday');
  assert.notEqual(grown, longer);
  assert.equal(p.mind.said.length, before + 1, 'the shorter one was replaced by the longer');
});

test('statementsIn (review): requests, questions and shrugs in the forms writers really use are refused; facts in the same plain forms are kept', () => {
  const kept = (m) => {
    const p = createProjectData();
    return rememberStatements(p, m).map((e) => e.text);
  };
  const refused = [
    'did Mara ever meet him', 'what if Mara was the thief', 'what about the bell', 'how about making Corin the thief', 'Any ideas for the ending', 'Ideas for the ending please',
    'Need ideas for a villain', 'Looking for a name for the baker', 'Remind me who the villain is', 'I wonder if Mara should die', "I'm wondering whether the ending works",
    "I'd like some feedback on the ending", 'sounds good to me', 'Which of these is better', 'let us write the opening', 'Could use some help with the ending', 'hmm let me think',
    'let me think about it', 'Please write a scene about the storm.', 'Am I too wordy?', 'Can the narrator be unreliable', 'Should I use first person', 'Have you decided on a title',
    'Is there a way to make the ending better', 'Are there any plot holes', 'Have I used too many adverbs', 'Does the ending work', 'Was that too long', 'Fix this', 'Improve it',
    'that is all for today', "I'm done for now", 'see you tomorrow', 'ok that is it', 'goodnight', 'No. Absolutely not. Never.', 'Hi NIE. Hello there. Good morning.', 'Okay. Thanks. Next question.',
    'I have no idea what happens next', 'not sure about the ending', 'whatever you think', 'the second one', 'either is fine', 'surprise me', 'wait a minute', 'give me a minute',
  ];
  for (const m of refused) assert.deepEqual(kept(m), [], `refused: ${m}`);
  const facts = {
    'Do not let Mara leave the island.': ['Do not let Mara leave the island.'],
    'Never let the reader see the body.': ['Never let the reader see the body.'],
    'Where Mara goes, trouble follows.': ['Where Mara goes, trouble follows.'],
    'What she wants is the bell.': ['What she wants is the bell.'],
    'When the bell rings, everyone gathers at the pier.': ['When the bell rings, everyone gathers at the pier.'],
    'Who she really is remains a secret until the end.': ['Who she really is remains a secret until the end.'],
    'Will Turner is the baker and he distrusts everyone.': ['Will Turner is the baker and he distrusts everyone.'],
    "I don't know why she left, nobody does.": ["I don't know why she left, nobody does."],
    'Please do not use semicolons in the narration.': ['do not use semicolons in the narration.'],
    'Write down that Mara is 47.': ['Mara is 47.'],
    "I'd like the last line to be Pip's: finally somebody lets me drive": ["I'd like the last line to be Pip's: finally somebody lets me drive"],
    'AM radio plays all night in the shop.': ['AM radio plays all night in the shop.'],
    'Wonder Woman is the hero and she hates ties.': ['Wonder Woman is the hero and she hates ties.'],
    'Give her a limp.': ['Give her a limp.'],
    'Make the ending bittersweet.': ['Make the ending bittersweet.'],
  };
  for (const [m, want] of Object.entries(facts)) assert.deepEqual(kept(m), want, m);
});

test('statementsIn (review): abbreviations, measures and numbers do not end a sentence; very short sentences are kept together; a long sentence is cut, never clipped', () => {
  const said = (m) => statementsIn(m);
  assert.deepEqual(said('He is 6 ft. 2 in. tall and weighs 200 lbs. Mara is shorter than him.'), ['He is 6 ft. 2 in. tall and weighs 200 lbs.', 'Mara is shorter than him.']);
  assert.deepEqual(said('The film Vol. 2 of the series is darker. The tone shifts in Ch. 4.'), ['The film Vol. 2 of the series is darker.', 'The tone shifts in Ch. 4.']);
  assert.deepEqual(said('Mara lives at No. 5 Quay Street. Corin lives next door.'), ['Mara lives at No. 5 Quay Street.', 'Corin lives next door.']);
  assert.deepEqual(said('The bell weighs 2.5 tons. It was cast in 1801 by the Hale foundry.'), ['The bell weighs 2.5 tons.', 'It was cast in 1801 by the Hale foundry.']);
  assert.deepEqual(said('Mara visits Dr. Hale. He gives her a tonic.'), ['Mara visits Dr. Hale.', 'He gives her a tonic.']);
  // sentences too short to stand alone are one statement, so "Mara left. Corin stayed. Ines watched." is not lost
  assert.deepEqual(said('Mara left. Corin stayed. Ines watched.'), ['Mara left. Corin stayed. Ines watched.']);
  assert.deepEqual(said('Mara (47). Captain. Retired. Notices everything.'), ['Mara (47). Captain. Retired. Notices everything.']);
  assert.deepEqual(said('Chapter 3. Mara finds the rope. It is knotted.'), ['Mara finds the rope.'], 'a heading is not a statement');
  // list and heading marks are not the writer's words
  assert.deepEqual(said('# The Salt Bell\n\nMara is the main character.'), ['The Salt Bell', 'Mara is the main character.']);
  assert.deepEqual(said('- Mara is the captain\n- Corin is the harbourmaster'), ['Mara is the captain', 'Corin is the harbourmaster']);
  // a sentence longer than a statement is cut at its clauses, then at commas, then between words; every word comes back
  const long = Array.from({ length: 40 }, (_, i) => `Mara visits place${i}`).join(', ') + ' and then goes home to sleep at last.';
  assert.ok(long.length > 800);
  const pieces = said(long);
  assert.ok(pieces.length >= 4 && pieces.every((s) => s.length <= MIND_LIMITS.text), 'each piece fits a statement');
  assert.equal(pieces.join(' ').replace(/\s+/g, ' '), long, 'nothing was dropped');
  const stored = rememberStatements(createProjectData(), long);
  assert.equal(stored.map((e) => e.text).join(' '), long);
  // the two private-use characters the splitter works with are never the writer's, and cannot be used to make a sentence disappear or turn into a full stop
  assert.deepEqual(said('The bell  is bronze and old. Maras boat is red and small.'), ['The bell  is bronze and old.', 'Maras boat is red and small.']);
  // more facts than sixteen in one message are all kept (a cast list is long)
  const cast = Array.from({ length: 25 }, (_, i) => `Villager number ${i} keeps a secret.`).join(' ');
  assert.equal(said(cast).length, 25);
  assert.equal(said(Array.from({ length: 80 }, (_, i) => `Villager number ${i} keeps a secret.`).join(' ')).length, 0, 'but 400 words are a pasted text');
  assert.equal(said(Array.from({ length: 60 }, (_, i) => `Villager number ${i} keeps a secret.`).join(' ')).length, MIND_LIMITS.perMessage);
});

test('state (review): a mind that was changed by hand is repaired when the next statement is remembered, keeping what is valid', () => {
  const p = createProjectData();
  rememberStatements(p, 'Mara wants the bell before the regatta. Corin hides debts from everyone.');
  const [a, b] = p.mind.said;
  p.mind.said = [null, 7, 'x', b, a, { n: 99, text: 'no seq', turn: 1 }, { ...a }];
  rememberStatements(p, 'Ines watches the harbour from her window all day.');
  assert.ok(p.mind.said.every((e) => e && typeof e.n === 'number' && typeof e.text === 'string'));
  const ns = p.mind.said.map((e) => e.n);
  assert.deepEqual(ns, [...ns].sort((x, y) => x - y));
  assert.equal(new Set(ns).size, ns.length, 'numbers are unique');
  assert.ok(p.mind.seq >= Math.max(...ns));
  assert.ok(p.mind.said.some((e) => /Ines/.test(e.text)) && p.mind.said.some((e) => /Corin/.test(e.text)));
  assert.equal(forgetItem({ brainstorm: { board: [null, { id: 'x', text: 'y' }] } }, 'board:zzz'), false, 'a board with something unreadable in it does not throw');
});

test('hostile projects (review): a getter that throws, circular references and junk everywhere never break a read, and recall never throws', () => {
  const g = createProjectData();
  Object.defineProperty(g, 'memory', { get() { throw new Error('boom'); } });
  assert.doesNotThrow(() => {
    recall(g, 'what does Mara want to find');
    recallNames(g, ['Mara']);
    passagesOf(g);
    describeMind(g);
    mindStats(g);
    rememberStatements(g, 'Mara wants to find the bell before winter.');
  });
  const c = createProjectData();
  c.self = c;
  c.mind.self = c.mind;
  c.memory.characters.push({ name: 'Mara', aliases: c, notes: c });
  assert.doesNotThrow(() => {
    recall(c, 'who is Mara');
    describeMind(c);
    rememberStatements(c, 'Mara wants to find the bell before winter.');
    JSON.stringify(sanitizeMind(c.mind));
  });
  assert.equal(c.mind.said.length, 1);
});

test('limits (review): a project at every cap with 1,400 full-size passages is still answered quickly, and so is a 30-statement message at the cap', () => {
  const rnd = seededRandom('hostile');
  const syl = 'ka lo mi ra te vu ne so gi pa du fe zo ba ti lu ma ro si'.split(' ');
  const word = () => Array.from({ length: 2 + Math.floor(rnd() * 4) }, () => syl[Math.floor(rnd() * syl.length)]).join('');
  const text = (len) => {
    let s = '';
    while (s.length < len) s += `${word()} `;
    return s.trim().slice(0, len);
  };
  const p = createProjectData();
  for (let i = 0; i < MIND_LIMITS.said; i++) p.mind.said.push({ n: i + 1, turn: i + 1, at: 1, kind: 'told', text: text(260) });
  p.mind.seq = p.mind.turn = MIND_LIMITS.said;
  for (let i = 0; i < 200; i++) addToBoard(p, { text: text(700), source: 'writer', note: text(300) });
  for (let i = 0; i < 200; i++) p.memory.timeline.push(text(300));
  for (let i = 0; i < 200; i++) p.memory.characters.push({ name: text(20), aliases: [text(10)], notes: text(300) });
  assert.ok(passagesOf(p).length >= 1400);
  const long = Array.from({ length: 60 }, word).join(' ');
  const t0 = performance.now();
  for (let i = 0; i < 5; i++) recall(p, i % 2 ? long : `what is the name of the ${word()} of ${word()}`);
  assert.ok((performance.now() - t0) / 5 < 400, `recall ${((performance.now() - t0) / 5).toFixed(0)} ms`);
  const message = Array.from({ length: 30 }, () => `${word()} ${word()} ${word()} ${word()} ${word()} ${word()} ${word()}.`).join(' ');
  const t1 = performance.now();
  assert.equal(rememberStatements(p, message).length, 30);
  assert.ok(performance.now() - t1 < 400, `a 30-statement message at the cap took ${(performance.now() - t1).toFixed(0)} ms`);
  assert.equal(p.mind.said.length, MIND_LIMITS.said);
  assert.ok(JSON.stringify(p.mind).length < 200000);
});

test('describeMind (review): the sections of a very long text are an honest estimate ("about"), and a short one is counted exactly', () => {
  const p = createProjectData();
  p.storyText = ('The tide came in slowly over the grey harbour wall and the gulls complained about it. '.repeat(12) + '\n\n').repeat(400);
  assert.ok(p.storyText.length > 300000);
  const t0 = performance.now();
  const d = describeMind(p);
  assert.ok(performance.now() - t0 < 100);
  assert.equal(d.counts.textSectionsApprox, true);
  assert.match(d.summary, /I read your long text \(about \d+ sections\) separately\.$/);
  p.storyText = 'The tide came in.\n\nThe gulls complained.';
  const small = describeMind(p);
  assert.ok(!('textSectionsApprox' in small.counts));
  assert.match(small.summary, /\(\d+ sections?\) separately\.$/);
});

test('recall (review): every source the questions read stays untouched when the project is frozen', () => {
  for (const make of [memoirProject, fantasyProject, heistProject]) {
    const live = make();
    const before = JSON.stringify(live);
    const frozen = deepFreeze(JSON.parse(before));
    for (const [q] of (live.title === 'Eleven Minutes' ? HEIST_QUESTIONS : live.title === 'The Quiet Stones' ? FANTASY_QUESTIONS : MEMOIR_QUESTIONS).slice(0, 12)) {
      assert.equal(JSON.stringify(recall(frozen, q)), JSON.stringify(recall(live, q)));
    }
    assert.equal(JSON.stringify(live), before);
    assert.equal(JSON.stringify(frozen), before);
  }
});

test('options (review): null or nonsense options never throw and never make an answer unbounded', () => {
  const p = memoirProject();
  for (const o of [null, undefined, 7, 'x', [], { limit: NaN }, { limit: Infinity }, { limit: -3 }, { budgetTokens: 'x' }, { budgetTokens: Infinity }, { minScore: NaN }, { exclude: 'x' }, { exclude: null }]) {
    const r = recall(p, 'tell me about Dolores and the shop', o);
    assert.ok(Array.isArray(r.items) && r.items.length <= 50 && typeof r.block === 'string');
    assert.ok(recallNames(p, ['Dolores'], o).items.length <= 50);
    assert.ok(Array.isArray(passagesOf(p, o)));
  }
  assert.equal(recall(p, 'tell me about Dolores and the shop', { limit: 0 }).items.length, 0);
  const q = createProjectData();
  assert.ok(rememberSaid(q, 'Mara keeps the brass compass on a chain', null));
  assert.equal(rememberStatements(q, 'Corin hides his gambling debts from everyone.', null).length, 1);
  assert.equal(q.mind.said.length, 2);
});

test('memoByText (review): an exact-text memo is bounded, hands out frozen answers, is emptied with the token memo, and one text never gets another text\'s answer', () => {
  let calls = 0;
  const f = memoByText((text) => {
    calls++;
    return [text.toUpperCase()];
  }, { max: 50, chars: 5000 });
  const a = f('alpha');
  assert.deepEqual(a, ['ALPHA']);
  assert.ok(Object.isFrozen(a));
  assert.equal(f('alpha'), a, 'the same text, the same answer, worked out once');
  assert.equal(calls, 1);
  assert.deepEqual(f('alphA'), ['ALPHA'], 'a text that differs only in case is looked up as its own text');
  assert.equal(calls, 2);
  for (let i = 0; i < 500; i++) f(`text number ${i} ${'x'.repeat(40)}`);
  f('y'.repeat(900)); // too long to keep
  f('y'.repeat(900));
  assert.ok(calls >= 502 + 1, 'a long text is never kept');
  f('beta');
  const before = calls;
  f('beta');
  assert.equal(calls, before, 'kept');
  clearTokenMemo();
  f('beta');
  assert.equal(calls, before + 1, 'emptying the token memo empties this one too');
  assert.deepEqual(f(42), ['']);
});
