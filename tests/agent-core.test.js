import test from 'node:test';
import assert from 'node:assert/strict';
import { AIError } from '../apps/web/src/engine/ai/openai-client.js';
import { similarity, isStockQuestion } from '../apps/web/src/engine/orchestrator/variety.js';
import { addonProblems, packProblems, questionProblems } from '../apps/web/src/engine/agent/packs/schema.js';
import { LIMITS, emptyAgentState, sanitizeAgentState, freshIdea } from '../apps/web/src/engine/agent/state.js';
import { applyDetection, detectProject, slotsFor } from '../apps/web/src/engine/agent/detect.js';
import { addExtra, askable, clearSlot, describe, grasp, openSlots, setSlot, slotForRole, startSlot } from '../apps/web/src/engine/agent/sheet.js';
import { EXTRACT_SYSTEM, extractSlots, isAnswer, isShrug } from '../apps/web/src/engine/agent/extract.js';
import { isNewIdea, looksLikeCommand, looksLikeQuestion, parseKeepCommand, parseOfferReply, parseShelfCommand, parseStyleCommand, signalsDone, startsNewIdeaExplicitly } from '../apps/web/src/engine/agent/talk.js';
import { askTerms, enforceReply, nameIn, pickQuestion, placeholderValues } from '../apps/web/src/engine/agent/ask.js';
import { GAP_PATTERN, KIND_QUESTIONS, gapAfter, pickKindQuestion, planTurn } from '../apps/web/src/engine/agent/plan.js';
import { addedText, changedSinceCommit, commitIdea, confirmText, digest, holdText, offerChips, peopleIn, recapText, undoCommit } from '../apps/web/src/engine/agent/commit.js';
import { briefFor } from '../apps/web/src/engine/agent/brief.js';
import { recordAsk } from '../apps/web/src/engine/agent/agent.js';
import { MAX_IDEA_CHARS } from '../apps/web/src/engine/project/board.js';
import { estimateTokens } from '../apps/web/src/engine/util/text.js';
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
// a second phrase per slot, so questions about different slots are different questions (as they are in the real packs)
const Y = { premise: 'the hook of the book', protagonist: 'the lead role', want: 'the driving desire', obstacle: 'the barrier', stakes: 'the price of failure', setting: 'the place and period', tone: 'the mood', theme: 'the deeper meaning', ending: 'the final scene', motifs: 'the repeated symbol', cast: 'the ensemble', voice: 'the telling style', idea: 'the seed', who: 'the central person', purpose: 'the reason', detail: 'the vivid particular', audience: 'the intended readers', shape: 'the structure', limits: 'the boundaries', image: 'the picture', speaker: 'the voice speaking', feeling: 'the emotion', turn: 'the pivot', sound: 'the music of the words', form: 'the pattern', title: 'the name', 'ending-note': 'the closing line', 'page-turns': 'the reveal moments', illustration: 'the art', volta: 'the shift', 'rhyme-scheme': 'the pattern of rhymes', culprit: 'the guilty party', clues: 'the evidence', fleet: 'the armada', empire: 'the realm' };
const slot = (id, label, x, { core = false, weight = 1, after = [], next = [], memory, y = Y[id] } = {}) => ({
  id, label, core, weight, hint: `what the writer says about ${x}, in their own words`, after, next, ...(memory ? { memory } : {}),
  questions: Object.entries(Q).map(([type, f]) => ({ type, text: f(x, y) })),
});
const pack = (kind, slots) => ({ kind, intro: `A ${kind} test pack`, noun: kind, slots });
const testPacks = () => ({
  kinds: {
    story: pack('story', [
      slot('premise', 'Premise', 'the premise', { core: true, weight: 3, next: ['protagonist', 'setting'] }),
      slot('protagonist', 'Main character', 'the protagonist', { core: true, weight: 3, next: ['want'], memory: 'character' }),
      slot('want', 'What they want', 'the central desire', { core: true, weight: 3, after: ['protagonist'], next: ['obstacle'] }),
      slot('obstacle', 'What stands in the way', 'the main obstacle', { core: true, weight: 2, after: ['want'], next: ['stakes'] }),
      slot('stakes', 'Stakes', 'the stakes', { core: true, weight: 2, after: ['want'], next: ['ending'] }),
      slot('setting', 'Setting', 'the setting', { core: true, weight: 2, after: ['premise'], next: ['tone'], memory: 'setting' }),
      slot('tone', 'Tone', 'the tone', { after: ['premise'] }),
      slot('theme', 'Theme', 'the theme', { memory: 'theme' }),
      slot('ending', 'Ending', 'the ending', { weight: 2, after: ['stakes'] }),
      slot('motifs', 'Motif', 'the recurring image', { memory: 'motif' }),
      slot('cast', 'Supporting cast', 'the supporting cast', { after: ['protagonist'], memory: 'character' }),
      slot('voice', 'Voice', 'the narrator voice'),
    ]),
    other: pack('other', [
      slot('idea', 'The idea', 'the idea', { core: true, weight: 3, next: ['who'] }),
      slot('who', 'Who it is about', 'the person at the center', { core: true, weight: 3, memory: 'character' }),
      slot('purpose', 'Purpose', 'the purpose', { core: true, weight: 2, after: ['idea'] }),
      slot('detail', 'Key detail', 'the key detail', { core: true, weight: 2, after: ['idea'] }),
      slot('audience', 'Audience', 'the audience', { core: true, weight: 2 }),
      slot('tone', 'Tone', 'the tone'),
      slot('shape', 'Shape', 'the shape'),
      slot('limits', 'Limits', 'the limits'),
    ]),
    poem: pack('poem', [
      slot('image', 'Central image', 'the central image', { core: true, weight: 3, next: ['feeling'] }),
      slot('speaker', 'Speaker', 'the speaker', { core: true, weight: 2, memory: 'character' }),
      slot('feeling', 'Feeling', 'the feeling', { core: true, weight: 3, after: ['image'] }),
      slot('turn', 'The turn', 'the turn', { core: true, weight: 2, after: ['feeling'] }),
      slot('sound', 'Sound', 'the sound', { core: true, weight: 2 }),
      slot('form', 'Form', 'the form'),
      slot('title', 'Title', 'the title'),
      slot('ending-note', 'Last line', 'the last line'),
    ]),
  },
  forms: [
    { id: 'picture-book', label: 'Picture book', match: ['picture book', 'picture-book'], baseKinds: ['story'], drop: ['voice'], add: [slot('page-turns', 'Page turns', 'the page turns', { core: true, weight: 2, after: ['obstacle'] }), slot('illustration', 'Pictures', 'the pictures', { after: ['page-turns'] })] },
    { id: 'sonnet', label: 'Sonnet', match: ['sonnet', 'fourteen lines'], baseKinds: ['poem'], add: [slot('volta', 'The volta', 'the volta', { after: ['feeling'] }), slot('rhyme-scheme', 'Rhyme scheme', 'the rhyme scheme')] },
  ],
  genres: [
    { id: 'cozy-mystery', label: 'Cozy mystery', match: ['cozy mystery', 'cozy', 'whodunit'], baseKinds: ['story'], add: [slot('culprit', 'The culprit', 'the culprit', { core: true, weight: 2, after: ['obstacle'] }), slot('clues', 'Clues', 'the clues', { after: ['culprit'] })] },
    { id: 'space-opera', label: 'Space opera', match: ['space opera', 'space-opera'], baseKinds: ['story'], add: [slot('fleet', 'The fleet', 'the fleet'), slot('empire', 'The empire', 'the empire')] },
  ],
});
const ctx = { packs: testPacks() };
const with_ = (over = {}) => ({ ...emptyAgentState(), kind: 'story', ...over });
const rec = (values, turn = 1) => Object.fromEntries(Object.entries(values).map(([id, value]) => [id, { value, turn, via: 'said' }]));
const filled = (values, over = {}) => with_({ slots: rec(values), turn: 5, ...over });
const WRITER = { premise: 'A lighthouse keeper hears a drowned bell in the fog', protagonist: 'Mara, a lighthouse keeper', want: 'to find her brother', obstacle: 'Corin', setting: 'a harbour town in winter', theme: 'forgiveness', motifs: 'the bell' };
const deepFreeze = (o) => {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const v of Object.values(o)) deepFreeze(v);
  }
  return o;
};

test('the test packs are valid packs (so what the tests prove carries over to the real ones)', () => {
  const p = ctx.packs;
  for (const k of Object.values(p.kinds)) assert.deepEqual(packProblems(k), [], k.kind);
  const base = Object.fromEntries(Object.values(p.kinds).map((k) => [k.kind, new Set(k.slots.map((s) => s.id))]));
  for (const a of [...p.forms, ...p.genres]) assert.deepEqual(addonProblems(a, { baseSlotIds: new Set(a.baseKinds.flatMap((k) => [...base[k]])) }), [], a.id);
});

// ── state ────────────────────────────────────────────────────────────────────

test('sanitizeAgentState turns anything into a valid state and never throws', () => {
  const junk = [null, undefined, 0, 42, NaN, 'text', true, [], [1, 2, 3], {}, () => {}, Symbol.iterator.toString(), new Date(), { v: 'x' }];
  for (const j of junk) assert.deepEqual(sanitizeAgentState(j), emptyAgentState());
  assert.deepEqual(emptyAgentState().shelf, []);
  assert.equal(emptyAgentState().mode, 'auto');
  // hostile keys never reach the state or the prototype
  const hostile = JSON.parse('{"__proto__":{"polluted":1},"constructor":{"x":1},"slots":{"__proto__":{"value":"evil"},"constructor":{"value":"evil"},"prototype":{"value":"evil"},"premise":{"value":"fine","turn":2,"via":"answered"}},"kind":"story"}');
  const s = sanitizeAgentState(hostile);
  assert.deepEqual(Object.keys(s.slots), ['premise']);
  assert.deepEqual(s.slots.premise, { value: 'fine', turn: 2, via: 'answered' });
  assert.equal({}.polluted, undefined);
  assert.equal(Object.getPrototypeOf(s.slots), Object.prototype);
  assert.equal(s.slots.constructor, Object, 'a slot named constructor is not readable as a slot');
});

test('sanitizeAgentState clips huge strings and counts, and fixes wrong types', () => {
  const big = 'x'.repeat(100000);
  const s = sanitizeAgentState({
    kind: 'nonsense', form: 'Not An Id!', genres: ['a-b', 'a-b', 'cc', 'dd', 'ee'], mode: 'weird', turn: 'abc', sinceAsk: -5, sinceOffer: 1e15, declinedAt: 'nope', idea: 0,
    slots: { premise: { value: big, turn: 1e18, via: 'weird' }, empty: { value: '   ' }, bad: 'string', 'Not-An-Id': { value: 'x' } },
    extra: Array.from({ length: 50 }, (_, i) => `${big}${i}`).concat([null, 5, {}]),
    asked: Array.from({ length: 200 }, (_, i) => ({ slot: 'premise', text: `${big}${i}`, turn: i, answered: 'yes', type: 'open' })).concat([{ text: '' }, null, 'str']),
    pending: { kind: 'question', slot: '__proto__', text: big, turn: 3 },
    committed: Array.from({ length: 60 }, (_, i) => ({ idea: 1, turn: i, boardId: `idea_${i}`, characters: Array.from({ length: 40 }, (_, j) => big + j), digest: big })).concat([{ boardId: '' }, 7]),
    shelf: Array.from({ length: 9 }, () => ({ kind: 'story', slots: { premise: { value: 'a' } }, shelvedAt: 3 })).concat([{ slots: {} }, 'junk']),
  });
  assert.equal(s.kind, null);
  assert.equal(s.form, null);
  assert.deepEqual(s.genres, ['a-b', 'cc']);
  assert.equal(s.mode, 'auto');
  assert.equal(s.turn, 0);
  assert.equal(s.sinceAsk, 0);
  assert.ok(s.sinceOffer <= 1000);
  assert.equal(s.declinedAt, 0);
  assert.equal(s.idea, 1);
  assert.deepEqual(Object.keys(s.slots), ['premise']);
  assert.ok(s.slots.premise.value.length <= LIMITS.value);
  assert.equal(s.slots.premise.via, 'said');
  assert.ok(s.extra.length <= 12 && s.extra.every((e) => e.length <= 200));
  assert.ok(s.asked.length <= 40 && s.asked.every((a) => a.text.length <= 300 && a.answered === false));
  assert.equal(s.pending.slot, null);
  assert.ok(s.pending.text.length <= 300);
  assert.ok(s.committed.length <= 20 && s.committed.every((c) => c.digest.length <= 700 && c.characters.length <= 12 && c.characters.every((n) => n.length <= 80)));
  assert.ok(s.shelf.length <= 3);
  assert.ok(JSON.stringify(s).length < 60000, 'a hostile state stays small');
});

test('a valid state survives a JSON round trip unchanged, and sanitizing twice changes nothing', () => {
  const rich = with_({
    form: 'picture-book', genres: ['cozy-mystery'], slots: rec(WRITER, 3), extra: ['she hides a key'], turn: 7, sinceAsk: 1, sinceOffer: 3, declinedAt: 2, mode: 'interview', idea: 3,
    asked: [{ slot: 'want', text: 'What does Mara want?', type: 'open', turn: 2, answered: true, skipped: false }],
    pending: { kind: 'offer', turn: 7, partial: true },
    committed: [{ idea: 3, turn: 6, boardId: 'idea_1', characters: ['Mara'], themes: [], motifs: [], settings: [], premise: 'abcd1234', created: true, prev: null, digest: 'Premise: x', note: 'Still open: Tone' }],
    shelf: [{ kind: 'poem', form: null, genres: [], slots: { image: { value: 'a gull', turn: 1, via: 'said' } }, extra: [], shelvedAt: 4, idea: 2, turn: 4, kept: false, asked: [{ slot: 'image', text: 'What is the picture?', type: null, turn: 3, answered: true, skipped: false }] }],
  });
  const once = sanitizeAgentState(rich);
  assert.deepEqual(once, rich);
  assert.deepEqual(sanitizeAgentState(JSON.parse(JSON.stringify(once))), once);
  assert.deepEqual(sanitizeAgentState(once), once);
});

test('sanitizeAgentState survives a fuzz of random junk', () => {
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const val = (depth = 0) => {
    const r = rnd();
    if (depth > 3 || r < 0.25) return [null, undefined, 0, -1, 1e30, NaN, '', 'x'.repeat(Math.floor(rnd() * 500)), true, 'story', 'question', 'offer', '__proto__'][Math.floor(rnd() * 13)];
    if (r < 0.5) return Array.from({ length: Math.floor(rnd() * 5) }, () => val(depth + 1));
    const o = {};
    for (const k of ['kind', 'slots', 'asked', 'pending', 'committed', 'shelf', 'extra', 'genres', 'turn', 'value', 'text', 'slot', '__proto__', 'premise', 'boardId']) if (rnd() < 0.4) Object.defineProperty(o, k, { value: val(depth + 1), enumerable: true, configurable: true, writable: true });
    return o;
  };
  for (let i = 0; i < 300; i++) {
    const s = sanitizeAgentState(val());
    assert.equal(s.v, 1);
    assert.deepEqual(sanitizeAgentState(s), s);
  }
});

test('freshIdea keeps the mode, the shelf and what was kept, and nothing of the sheet', () => {
  const old = with_({ slots: rec(WRITER), mode: 'quiet', idea: 2, shelf: [{ kind: 'poem', slots: { image: { value: 'x', turn: 1, via: 'said' } }, extra: [], genres: [], shelvedAt: 1, idea: 1, turn: 1, kept: false }], committed: [{ idea: 2, turn: 1, boardId: 'a', digest: 'd' }] });
  const next = freshIdea(old);
  assert.equal(next.idea, 3);
  assert.equal(next.mode, 'quiet');
  assert.equal(next.shelf.length, 1);
  assert.equal(next.committed.length, 1);
  assert.deepEqual(next.slots, {});
  assert.equal(next.kind, null);
});

// ── detecting what is being made ─────────────────────────────────────────────

test('detectProject: the kind comes from the hint, then the writer\'s words, then a form or genre', () => {
  const { packs } = ctx;
  assert.equal(detectProject('a story about a fox', { packs }).kind, 'story');
  assert.equal(detectProject('my novel about a fox', { packs, kindHint: 'poem' }).kind, 'poem', 'an explicit hint always wins');
  assert.equal(detectProject('my novel', { packs, kindHint: 'auto' }).kind, 'story', 'the "auto" hint says nothing');
  assert.equal(detectProject('I am writing a sonnet for my mother', { packs }).kind, 'poem');
  assert.equal(detectProject('a picture book about a sleepy bear', { packs }).kind, 'story', 'a picture book is a story (from the form\'s baseKinds)');
  assert.equal(detectProject('a bear and a boat', { packs }).kind, null, 'nothing says what it is');
  assert.deepEqual(detectProject('', { packs }), { kind: null, form: null, genres: [] });
  assert.deepEqual(detectProject(null, { packs: undefined }), { kind: null, form: null, genres: [] });
});

test('detectProject: forms and genres match whole words in any case, longest match first, at most one form and two genres', () => {
  const { packs } = ctx;
  assert.deepEqual(detectProject('A COZY MYSTERY novel set in a bakery', { packs }), { kind: 'story', form: null, genres: ['cozy-mystery'] });
  assert.deepEqual(detectProject('three sonnets about the sea', { packs }), { kind: 'poem', form: 'sonnet', genres: [] }, 'a plural matches');
  assert.equal(detectProject('a picture-book story', { packs }).form, 'picture-book');
  assert.equal(detectProject('a picture book story', { packs }).form, 'picture-book', 'a hyphen also matches a space');
  assert.deepEqual(detectProject('a space opera story with a cozy whodunit inside', { packs }).genres, ['space-opera', 'cozy-mystery'], 'the longer keyword ("space opera", 11 letters, against "whodunit", 8) ranks first');
  assert.deepEqual(detectProject('a cozy whodunit set in a space opera story', { packs }).genres.length, 2);
  assert.deepEqual(detectProject('a cozyness story', { packs }).genres, [], 'a keyword inside another word is not a match');
  const many = { ...packs, genres: [...packs.genres, { id: 'g3', label: 'G3', match: ['third genre', 'g3'], baseKinds: ['story'], add: [] }] };
  assert.equal(detectProject('a story: cozy mystery, space opera and third genre', { packs: many }).genres.length, 2);
  const longest = { ...packs, genres: [{ id: 'short', label: 'S', match: ['cozy', 'xx1'], add: [] }, { id: 'long', label: 'L', match: ['cozy mystery', 'xx2'], add: [] }] };
  assert.deepEqual(detectProject('a story, a cozy mystery', { packs: longest }).genres, ['long', 'short']);
});

test('detectProject: an add-on only applies to a kind it is for, and the call is pure and fast', () => {
  const { packs } = ctx;
  assert.deepEqual(detectProject('a poem, a picture book', { packs }), { kind: 'poem', form: null, genres: [] }, 'picture-book is for stories, so a poem does not get it');
  assert.deepEqual(detectProject('a poem, a picture book', { packs, kindHint: 'story' }), { kind: 'story', form: 'picture-book', genres: [] });
  const a = detectProject('a cozy mystery', { packs });
  assert.deepEqual(detectProject('a cozy mystery', { packs }), a);
  const t0 = Date.now();
  for (let i = 0; i < 2000; i++) detectProject('A cozy mystery novel with a picture book feel. '.repeat(20), { packs });
  assert.ok(Date.now() - t0 < 2000, 'detection of a long text, 2,000 times, is fast');
});

test('applyDetection: the kind is sticky unless hinted; a form is set once; genres accumulate to two; orphaned values move to "Also"', () => {
  const s0 = emptyAgentState();
  const a = applyDetection(s0, { kind: 'story', form: null, genres: ['cozy-mystery'] }, ctx);
  assert.equal(a.state.kind, 'story');
  assert.deepEqual(a.state.genres, ['cozy-mystery']);
  assert.equal(a.changed, true);
  assert.equal(s0.kind, null, 'the input is not touched');
  const b = applyDetection(a.state, { kind: 'poem', form: null, genres: ['space-opera'] }, ctx);
  assert.equal(b.state.kind, 'story', 'sticky');
  assert.deepEqual(b.state.genres, ['cozy-mystery', 'space-opera']);
  const c = applyDetection(b.state, { kind: 'story', form: null, genres: ['cozy-mystery'] }, ctx);
  assert.equal(c.changed, false);
  assert.equal(c.state, b.state);
  const d = applyDetection(filled({ premise: 'a bell', tone: 'dry', voice: 'wry narrator' }), { kind: 'poem', form: null, genres: [] }, ctx, { hinted: true });
  assert.equal(d.state.kind, 'poem');
  assert.deepEqual(Object.keys(d.state.slots), [], 'a poem has no premise, tone or voice slot');
  assert.deepEqual(d.state.extra, ['a bell', 'dry', 'wry narrator'], 'nothing the writer said is lost');
  // 'other' only means "nothing fits yet": a clearer description replaces it, a real kind does not give way
  const other = applyDetection(with_({ kind: 'other' }), { kind: 'poem', form: null, genres: [] }, ctx);
  assert.equal(other.state.kind, 'poem');
  assert.equal(applyDetection(with_({ kind: 'story' }), { kind: 'poem', form: null, genres: [] }, ctx).state.kind, 'story');
});

test('slotsFor: the kind pack, minus what add-ons drop, plus what they add after the slot they follow', () => {
  const ids = (s) => slotsFor(s, ctx).map((x) => x.id);
  assert.deepEqual(ids(with_()), ['premise', 'protagonist', 'want', 'obstacle', 'stakes', 'setting', 'tone', 'theme', 'ending', 'motifs', 'cast', 'voice']);
  assert.deepEqual(ids(emptyAgentState()), ['idea', 'who', 'purpose', 'detail', 'audience', 'tone', 'shape', 'limits'], 'no kind yet: the "other" pack');
  const pb = ids(with_({ form: 'picture-book' }));
  assert.ok(!pb.includes('voice'), 'dropped');
  assert.deepEqual(pb.slice(pb.indexOf('obstacle'), pb.indexOf('obstacle') + 3), ['obstacle', 'page-turns', 'illustration'], 'inserted right after the slot they follow, in the order the add-on lists them');
  const both = ids(with_({ form: 'picture-book', genres: ['cozy-mystery', 'space-opera'] }));
  assert.equal(both.includes('culprit') && both.includes('fleet') && both.includes('page-turns'), true);
  assert.equal(new Set(both).size, both.length, 'no slot twice');
  assert.deepEqual(ids(with_({ genres: ['space-opera'] })).slice(-2), ['fleet', 'empire'], 'with nothing to follow, at the end');
  assert.deepEqual(ids(with_({ form: 'sonnet' })), ids(with_()), 'a form that is not for this kind (a sonnet is for poems) adds nothing');
  assert.deepEqual(ids(with_({ form: 'ghost-form', genres: ['ghost'] })), ids(with_()), 'ids that no longer exist are ignored');
  assert.ok(Object.isFrozen(slotsFor(with_(), ctx)) === false, 'a fresh array each call');
});

// ── the sheet ────────────────────────────────────────────────────────────────

test('setSlot / clearSlot / addExtra: immutable, refuse empty, clip, keep the writer\'s words, and replace', () => {
  const s0 = with_({ turn: 2 });
  const s1 = setSlot(s0, 'premise', '  A lighthouse   keeper hears a bell  ', { turn: 2, via: 'said' });
  assert.deepEqual(s1.slots.premise, { value: 'A lighthouse keeper hears a bell', turn: 2, via: 'said' });
  assert.deepEqual(s0.slots, {}, 'the input is not touched');
  assert.equal(setSlot(s1, 'premise', '   '), s1, 'empty is refused');
  assert.equal(setSlot(s1, 'premise', null), s1);
  assert.equal(setSlot(s1, '__proto__', 'x'), s1);
  assert.equal(setSlot(s1, 'Bad Id', 'x'), s1);
  const long = 'word '.repeat(200);
  assert.ok(setSlot(s0, 'premise', long).slots.premise.value.length <= 220);
  assert.ok(!/\s$/.test(setSlot(s0, 'premise', long).slots.premise.value));
  const s2 = setSlot(s1, 'premise', 'A harbour with no ships', { turn: 4, via: 'answered' });
  assert.deepEqual(s2.slots.premise, { value: 'A harbour with no ships', turn: 4, via: 'answered' }, 'a later value replaces the earlier one');
  assert.equal(setSlot(s2, 'premise', 'A harbour with no ships', { turn: 4, via: 'answered' }), s2, 'the same value again changes nothing');
  assert.equal(setSlot(s0, 'premise', 'x', { via: 'weird' }).slots.premise.via, 'said');
  assert.deepEqual(clearSlot(s2, 'premise').slots, {});
  assert.equal(clearSlot(s0, 'premise'), s0);
  const e = addExtra(addExtra(s0, 'she hides a key'), 'She hides a key');
  assert.deepEqual(e.extra, ['she hides a key'], 'no duplicates, in any case');
  assert.equal(addExtra(s0, '  '), s0);
  let many = s0;
  for (let i = 0; i < 20; i++) many = addExtra(many, `detail number ${i}`);
  assert.equal(many.extra.length, 12);
  assert.equal(many.extra.at(-1), 'detail number 19', 'the newest are kept');
  assert.ok(addExtra(s0, 'y'.repeat(500)).extra[0].length <= 200);
});

test('grasp: weight over the core slots; ready needs 75%, five core slots and four turns', () => {
  const core = ['premise', 'protagonist', 'want', 'obstacle', 'stakes', 'setting']; // weights 3 3 3 2 2 2 = 15
  const g0 = grasp(with_(), ctx);
  assert.deepEqual({ score: g0.score, filledCore: g0.filledCore, totalCore: g0.totalCore, ready: g0.ready }, { score: 0, filledCore: 0, totalCore: 6, ready: false });
  const fill = (ids, turn) => with_({ slots: rec(Object.fromEntries(ids.map((id) => [id, `my ${id}`]))), turn });
  assert.equal(grasp(fill(['premise', 'protagonist', 'want'], 9), ctx).score, 9 / 15);
  assert.equal(grasp(fill(['premise', 'protagonist', 'want', 'obstacle'], 9), ctx).ready, false, '11/15 is under 75%');
  assert.equal(grasp(fill(['premise', 'protagonist', 'want', 'obstacle'], 9), ctx).filledCore, 4);
  assert.equal(grasp(fill(['premise', 'protagonist', 'want', 'obstacle', 'stakes'], 9), ctx).ready, true, '13/15 and five core slots');
  assert.equal(grasp(fill(['premise', 'protagonist', 'want', 'obstacle', 'stakes'], 3), ctx).ready, false, 'under four turns');
  assert.equal(grasp(fill(['premise', 'protagonist', 'want', 'obstacle', 'stakes'], 4), ctx).ready, true, 'exactly four turns');
  assert.equal(grasp(fill(core, 9), ctx).score, 1);
  assert.equal(grasp(fill(['tone', 'theme', 'ending', 'motifs', 'cast'], 9), ctx).score, 0, 'non-core slots do not count');
  const strong = with_({ slots: rec({ premise: 'a', protagonist: 'b', want: 'c' }), turn: 9 });
  assert.equal(grasp(strong, { ...ctx, config: { readyScore: 0.5, minCore: 3 } }).ready, true, 'the thresholds can be set in the config');
});

test('grasp.open is in asking order: askable core slots first, then the rest in pack order, then slots still waiting on a prerequisite', () => {
  const s = with_({ slots: rec({ setting: 'a town' }) });
  const open = grasp(s, ctx).open;
  assert.deepEqual(open.slice(0, 2), ['premise', 'protagonist'], 'core slots with nothing before them first');
  assert.ok(!open.includes('setting'));
  assert.deepEqual(askable(s, ctx).map((x) => x.id), ['premise', 'protagonist', 'theme', 'motifs', 'voice'], 'core first, then the rest in pack order; tone waits for the premise');
  assert.ok(open.indexOf('voice') < open.indexOf('tone'), 'a slot still waiting on its prerequisite comes after every askable one');
  const mid = grasp(with_({ slots: rec({ premise: 'a bell', setting: 'a town' }) }), ctx).open;
  assert.equal(mid[0], 'protagonist');
  assert.ok(mid.indexOf('tone') < mid.indexOf('want'), 'tone is askable (the premise is filled); want waits for the protagonist');
  const after = grasp(with_({ slots: rec({ protagonist: 'Mara' }) }), ctx).open;
  assert.ok(after.indexOf('want') < after.indexOf('theme'), 'once the prerequisite is filled the core slot is askable and comes first');
  // a prerequisite the idea does not have counts as filled
  const noVoice = with_({ form: 'picture-book' });
  assert.ok(openSlots(noVoice, slotsFor(noVoice, ctx)).length > 0);
  const cyc = { packs: { kinds: { other: pack('other', [slot('a1', 'A', 'a1', { core: true, after: ['b1'] }), slot('b1', 'B', 'b1', { core: true, after: ['a1'] }), ...Array.from({ length: 6 }, (_, i) => slot(`c${i}`, 'C', `c${i}`))]) } } };
  assert.ok(askable(emptyAgentState(), cyc).length > 0, 'a pack that waits on itself still has something to ask');
});

test('describe: what the panel shows', () => {
  const d = describe(with_({ slots: rec(WRITER), genres: ['cozy-mystery'], turn: 6, extra: ['she hides a key'] }), ctx);
  assert.equal(d.kind, 'story');
  assert.deepEqual(d.genres, ['cozy-mystery']);
  assert.deepEqual(d.genreLabels, ['Cozy mystery']);
  assert.deepEqual(d.filled.slice(0, 2), [{ id: 'premise', label: 'Premise', value: WRITER.premise }, { id: 'protagonist', label: 'Main character', value: WRITER.protagonist }]);
  assert.ok(d.open.every((o) => typeof o.label === 'string' && typeof o.core === 'boolean'));
  assert.ok(d.open.some((o) => o.id === 'stakes' && o.core));
  assert.deepEqual(d.extra, ['she hides a key']);
  assert.equal(d.grasp.totalCore, 6, "the genre brings a core slot of its own, which raises the score but is not required for it");
  assert.ok(d.open.some((o) => o.core && !['premise', 'protagonist', 'want', 'obstacle', 'stakes', 'setting'].includes(o.id)), 'and it is still asked about');
  assert.equal(d.grasp.ready, true, '13 of 17 by weight, five core slots, six turns');
  assert.ok(!d.filled.some((f) => f.id === 'stakes'));
});

test('slotForRole finds the main character, the setting and the rest in whichever pack is in use', () => {
  const story = slotsFor(with_(), ctx);
  assert.equal(slotForRole(story, 'who').id, 'protagonist');
  assert.equal(slotForRole(story, 'place').id, 'setting');
  assert.equal(slotForRole(story, 'thing').id, 'premise');
  assert.equal(slotForRole(story, 'want').id, 'want');
  assert.equal(slotForRole(story, 'other').id, 'obstacle');
  assert.equal(slotForRole(story, 'theme').id, 'theme');
  assert.equal(slotForRole(slotsFor(emptyAgentState(), ctx), 'who').id, 'who');
  assert.equal(slotForRole(slotsFor(with_({ kind: 'poem' }), ctx), 'who').id, 'speaker', 'by `memory` when no id says so');
  assert.equal(startSlot(story).id, 'premise');
});

// ── reading what the writer said ─────────────────────────────────────────────

const fakeModel = (reply, seen = []) => async (messages, opts) => {
  seen.push({ messages, opts });
  const text = typeof reply === 'function' ? reply(messages, opts) : reply;
  return { text: typeof text === 'string' || text === null ? text : JSON.stringify(text), route: 'local' };
};
const MSG = 'Mara is a lighthouse keeper who hears a drowned bell in the harbour fog every winter night.';

test('extraction with a model: schema-constrained call, and only grounded values are kept', async () => {
  const seen = [];
  const chat = fakeModel({ updates: [{ slot: 'protagonist', value: 'Mara, a lighthouse keeper' }, { slot: 'premise', value: 'A pirate queen steals the moon' }, { slot: 'want', value: 'to find the lost treasure' }, { slot: 'setting', value: 'the harbour fog' }], extra: 'She has a secret twin' }, seen);
  const out = await extractSlots({ message: MSG, state: with_(), ctx, chat });
  assert.equal(out.by, 'model');
  assert.deepEqual(out.updates, [{ slot: 'protagonist', value: 'Mara, a lighthouse keeper' }, { slot: 'setting', value: 'the harbour fog' }], 'what the writer never said is dropped, silently');
  assert.deepEqual(out.extra, [], 'an ungrounded extra is dropped too');
  const { messages, opts } = seen[0];
  assert.equal(seen.length, 1, 'one call');
  assert.deepEqual({ purpose: opts.purpose, stream: opts.stream, maxTokens: opts.maxTokens, temperature: opts.temperature, timeoutMs: opts.timeoutMs }, { purpose: 'extract', stream: false, maxTokens: 180, temperature: 0, timeoutMs: 40000 });
  assert.deepEqual(opts.json.properties.updates.items.properties.slot.enum, slotsFor(with_(), ctx).map((s) => s.id));
  assert.equal(opts.json.properties.updates.maxItems, 4);
  assert.equal(opts.json.properties.updates.items.properties.value.maxLength, 220);
  assert.equal(opts.json.properties.extra.maxLength, 220);
  assert.equal(messages[0].content, EXTRACT_SYSTEM);
  assert.match(messages[1].content, /^Slots:\npremise: what the writer says about the premise/);
  assert.ok(messages[1].content.includes(`"""\n${MSG}\n"""`));
  assert.ok(!messages[1].content.includes('answering this question'));
});

test('extraction grounding: a kept value is the writer\'s message shortened (their words, in their order), and refusals, echoes and instructions are dropped', async () => {
  // (a value that is not grounded makes the model's answer useless, so the rules read the message; only what the MODEL kept is counted here)
  const run = async (value, message = 'Mara hunts a lighthouse thief in the fog', over = {}) => {
    const out = await extractSlots({ message, state: with_(), ctx, chat: fakeModel({ updates: [{ slot: 'premise', value }], extra: '' }), ...over });
    return out.by === 'model' ? out.updates : [];
  };
  assert.equal((await run('Mara hunts thief')).length, 1, 'all stems are theirs');
  assert.equal((await run('Mara hunts a thief called Bob')).length, 0, '3 of 5 stems (60%)');
  assert.equal((await run('Mara hunts a lighthouse thief in the fog, and slyly')).length, 0, '5 of 6 stems used to pass; a word the writer never used does not');
  assert.equal((await run('lighthouse thief in the fog')).length, 1, 'shortened from the middle');
  assert.equal((await run('Mara hunts the thief')).length, 1, 'a different article is not a different word');
  assert.equal((await run('Mara hunts a lighthouse thief in the fog, and Bob')).length, 0, 'enough stems are theirs, but "Bob" is a name the writer never used');
  assert.equal((await run('Mara hunts a lighthouse thief in 1923')).length, 0, 'and so is a year they never gave');
  for (const bad of ['N/A', 'none', 'The writer did not say', 'not specified', "I'm sorry, I cannot do that", 'Write a scene about Mara and the thief', 'what the writer says about the premise, in their own words', 'slot ids and json', 'x'.repeat(300), '', '   ', '!!!']) assert.equal((await run(bad)).length, 0, `dropped: ${bad.slice(0, 40)}`);
  assert.equal((await run('Mara hunts a lighthouse thief in the fog'.repeat(1))).length, 1);
  // a refined answer may reuse what was recorded for the slot that was asked about
  const state = with_({ slots: rec({ want: 'to find her brother' }), pending: { kind: 'question', slot: 'want', text: 'What does Mara want?', turn: 1 } });
  const refine = await extractSlots({ message: 'before winter closes the ferry', state, ctx, pendingSlot: 'want', chat: fakeModel({ updates: [{ slot: 'want', value: 'to find her brother before winter closes the ferry' }], extra: '' }) });
  assert.equal(refine.by, 'model');
  assert.equal(refine.updates[0].value, 'to find her brother before winter closes the ferry');
  const noPending = await extractSlots({ message: 'before winter closes the ferry', state, ctx, chat: fakeModel({ updates: [{ slot: 'want', value: 'to find her brother before winter closes the ferry' }], extra: '' }) });
  assert.equal(noPending.by, 'rules', 'without the pending slot, "her brother" was not said in this message');
});

test('extraction keeps at most four updates, only slots this idea has, no duplicates, nothing already recorded', async () => {
  const msg = 'Mara hunts a thief in the harbour fog while the village sleeps and winter closes the ferry';
  const many = { updates: [
    { slot: 'premise', value: 'Mara hunts a thief' }, { slot: 'premise', value: 'a thief in the harbour fog' }, { slot: 'culprit', value: 'a thief' },
    { slot: 'setting', value: 'harbour fog' }, { slot: 'tone', value: 'village sleeps' }, { slot: 'theme', value: 'winter closes the ferry' }, { slot: 'ending', value: 'the village sleeps' }, { slot: 'cast', value: 'harbour fog' },
  ], extra: '' };
  const out = await extractSlots({ message: msg, state: with_({ slots: rec({ tone: 'village sleeps' }) }), ctx, chat: fakeModel(many) });
  assert.equal(out.by, 'model');
  assert.deepEqual(out.updates.map((u) => u.slot), ['premise', 'setting', 'theme', 'ending'], 'max four; `culprit` is not a slot of this idea; the second premise, the recorded tone and the repeated value are dropped');
  const withGenre = await extractSlots({ message: msg, state: with_({ genres: ['cozy-mystery'] }), ctx, chat: fakeModel({ updates: [{ slot: 'culprit', value: 'a thief' }], extra: '' }) });
  assert.deepEqual(withGenre.updates, [{ slot: 'culprit', value: 'a thief' }], 'with the genre, it is');
  const extra = await extractSlots({ message: msg, state: with_(), ctx, chat: fakeModel({ updates: [], extra: 'the village sleeps while winter closes the ferry' }) });
  assert.deepEqual(extra.extra, ['the village sleeps while winter closes the ferry'], 'a grounded extra detail is kept');
});

test('extraction falls back to the rules when the model is missing, fails, or grounds to nothing; an abort is rethrown', async () => {
  const state = with_();
  const rules = await extractSlots({ message: MSG, state, ctx, chat: null });
  assert.equal(rules.by, 'rules');
  for (const chat of [fakeModel(null), fakeModel('not json at all'), fakeModel({ updates: [], extra: '' }), fakeModel({ updates: [{ slot: 'premise', value: 'Aliens invade the moon' }], extra: '' }), async () => { throw new Error('boom'); }, async () => undefined]) {
    const out = await extractSlots({ message: MSG, state, ctx, chat });
    assert.deepEqual(out, rules, 'the same as having no model');
  }
  await assert.rejects(extractSlots({ message: MSG, state, ctx, chat: async () => { throw new AIError('stopped', { kind: 'abort' }); } }), (e) => e.kind === 'abort');
  const cut = await extractSlots({ message: MSG, state, ctx, chat: fakeModel('{"updates":[{"slot":"protagonist","value":"Mara"},{"slot":"setti') });
  assert.equal(cut.by, 'model', 'a cut-off answer is salvaged');
  assert.deepEqual(cut.updates, [{ slot: 'protagonist', value: 'Mara' }]);
});

test('extraction is deterministic: the same input and the same fake model give the same output', async () => {
  const mk = () => fakeModel({ updates: [{ slot: 'protagonist', value: 'Mara' }, { slot: 'premise', value: 'lighthouse keeper hears a drowned bell' }], extra: '' });
  const a = await extractSlots({ message: MSG, state: with_(), ctx, chat: mk() });
  const b = await extractSlots({ message: MSG, state: with_(), ctx, chat: mk() });
  assert.deepEqual(a, b);
  assert.deepEqual(await extractSlots({ message: MSG, state: with_(), ctx }), await extractSlots({ message: MSG, state: with_(), ctx }));
});

test('extraction rules: the answer goes to the slot that was asked about', async () => {
  const state = with_({ pending: { kind: 'question', slot: 'want', text: 'What does Mara want?', turn: 1 } });
  const out = await extractSlots({ message: 'To find her brother before the ferry stops running for the winter.', state, ctx, pendingSlot: 'want' });
  assert.deepEqual(out, { updates: [{ slot: 'want', value: 'To find her brother before the ferry stops running for the winter' }], extra: [], by: 'rules' });
  const bare = await extractSlots({ message: 'Mara', state, ctx, pendingSlot: 'protagonist' });
  assert.deepEqual(bare.updates, [{ slot: 'protagonist', value: 'Mara' }], 'a single name answers');
  for (const notAnAnswer of ['idk', 'Why would she want that?', 'give me some ideas', "that's everything", 'ok', '?']) {
    const none = await extractSlots({ message: notAnAnswer, state, ctx, pendingSlot: 'want' });
    assert.deepEqual(none.updates, [], notAnAnswer);
  }
  const long = await extractSlots({ message: `${'She wants her brother back. '.repeat(30)}`, state, ctx, pendingSlot: 'want' });
  assert.ok(long.updates[0].value.length <= 220 && long.updates[0].value.endsWith('.') === false || long.updates[0].value.length <= 220);
  assert.ok(/brother back$/.test(long.updates[0].value), 'clipped at a sentence boundary');
  assert.ok(isAnswer('Mara') && !isAnswer('idk') && !isAnswer('Why?'));
});

test('extraction rules: names, places and the writer\'s own theme words go to the slots that mean them; the first statement is the premise', async () => {
  const out = await extractSlots({ message: 'A magician named Orsolo is murdered backstage at a failing theatre.', state: with_(), ctx });
  assert.deepEqual(out.updates.map((u) => [u.slot, u.value]), [['protagonist', 'Orsolo'], ['setting', 'failing theatre'], ['premise', 'A magician named Orsolo is murdered backstage at a failing theatre']]);
  const lonely = await extractSlots({ message: 'Mara is lonely in a lighthouse by the sea at night.', state: with_(), ctx });
  assert.ok(!lonely.updates.some((u) => u.slot === 'theme'), '"loneliness" is NIE\'s label for what they said ("lonely"), so it is not recorded');
  const said = await extractSlots({ message: 'It is a story about loneliness, a woman alone in a lighthouse.', state: with_(), ctx });
  assert.equal(said.updates.find((u) => u.slot === 'theme')?.value, 'loneliness', 'their own word is');
  const filledFirst = await extractSlots({ message: 'A magician named Orsolo is murdered backstage at a failing theatre.', state: filled({ premise: 'a heist', protagonist: 'Jules', setting: 'Paris' }), ctx });
  assert.deepEqual(filledFirst.updates, [], 'slots that already have a value are not overwritten by guesses');
  const relative = await extractSlots({ message: 'Somebody has taken her brother and nothing will ever be the same again.', state: with_(), ctx });
  assert.ok(!relative.updates.some((u) => u.slot === 'protagonist'), '"her brother" is not who it is about');
  const q = await extractSlots({ message: 'Should the keeper in my story be a man or a woman, do you think?', state: with_(), ctx });
  assert.deepEqual(q.updates, [], 'a question records nothing');
  const short = await extractSlots({ message: 'a lighthouse story', state: with_(), ctx });
  assert.ok(!short.updates.some((u) => u.slot === 'premise'), 'fewer than six words is not a premise');
});

const miniCtx = (kind, slots) => ({ packs: { kinds: { [kind]: pack(kind, slots) }, forms: [], genres: [] } });

test('slotForRole: `strict` stops at the well-known ids, so a slot that only files into memory is not taken for the main character', () => {
  const c = miniCtx('world', [slot('difference', 'What is different', 'the difference', { core: true, weight: 3 }), slot('peoples', 'Peoples', 'the peoples', { memory: 'character' })]);
  const list = slotsFor({ ...emptyAgentState(), kind: 'world' }, c);
  assert.equal(slotForRole(list, 'who').id, 'peoples', 'good enough to find a name for a question');
  assert.equal(slotForRole(list, 'who', { strict: true }), undefined, 'but not somewhere to put a name');
  assert.equal(slotForRole(list, 'thing', { strict: true }).id, 'difference');
});

test('extraction rules: a name goes only into the main-character slot, a lone theme word never fills a core slot, and the starting slot takes a first statement whole', async () => {
  const world = miniCtx('world', [slot('difference', 'What is different', 'the difference', { core: true, weight: 3 }), slot('peoples', 'Peoples', 'the peoples', { memory: 'character' }), slot('places', 'Places', 'the places', { memory: 'setting' })]);
  const w = await extractSlots({ message: 'Captain Aldous rules a world where the tide never goes out and every town floats.', state: { ...emptyAgentState(), kind: 'world' }, ctx: world });
  assert.ok(!w.updates.some((u) => u.slot === 'peoples'), 'a name is not a people');
  assert.ok(w.updates.some((u) => u.slot === 'difference'), 'the statement is what is different about the world');
  const coreTheme = miniCtx('story', [slot('premise', 'Premise', 'the premise', { core: true, weight: 3 }), slot('theme', 'Theme', 'the theme', { core: true, weight: 2, memory: 'theme' })]);
  const lone = await extractSlots({ message: 'It is a story about loneliness, a woman alone in a lighthouse.', state: with_(), ctx: coreTheme });
  assert.ok(!lone.updates.some((u) => u.slot === 'theme'), 'one word is not an answer to "what is it about?"');
  // where the main character is also where the conversation starts (the character pack's "role"), the whole statement beats the bare name
  const character = miniCtx('character', [slot('role', 'Who they are', 'the role', { core: true, weight: 3, memory: 'character' }), slot('want', 'What they want', 'the want', { core: true, weight: 3, after: ['role'] })]);
  const msg = 'Ines is a retired ferry captain who cannot stop counting the boats that never come back.';
  const c = await extractSlots({ message: msg, state: { ...emptyAgentState(), kind: 'character' }, ctx: character });
  assert.deepEqual(c.updates, [{ slot: 'role', value: msg.replace(/\.$/, '') }]);
  assert.deepEqual((await extractSlots({ message: 'Her name is Ines', state: { ...emptyAgentState(), kind: 'character' }, ctx: character })).updates, [{ slot: 'role', value: 'Ines' }], 'a short statement (not a pitch) still files the name');
});

test('extraction rules never record more than four things and never invent', async () => {
  const msg = 'Mara, Corin and Jules hunt a thief in a haunted lighthouse in a lonely harbour town by the sea in winter.';
  const out = await extractSlots({ message: msg, state: with_(), ctx });
  assert.ok(out.updates.length <= 4);
  const words = msg.toLowerCase().match(/[a-z']+/g);
  for (const u of out.updates) for (const w of u.value.toLowerCase().match(/[a-z']+/g)) assert.ok(words.includes(w), `"${w}" is the writer's`);
});

// ── talk: the offer, the commands ────────────────────────────────────────────

test('parseOfferReply: yes', () => {
  for (const t of ['yes', 'Yes!', 'YES', 'yep', 'Yeah', 'yup', 'sure', 'ok', 'okay', 'Please do', 'go ahead', 'keep it', 'save it', 'commit it', 'do it', 'sounds good', "that's right", 'perfect', 'exactly', 'looks good', 'yes keep it', 'Yes, keep it.', 'yes please', 'yeah sure thanks', 'OK 👍', 'Yes keep it please', 'yes, go ahead and keep it', '👍', 'yessss', "Yes - that's exactly it!", "that's everything, keep it", 'sure thing', 'Absolutely!', 'yes definitely', 'great, keep it', 'yes keep it on my idea board', 'Okay, sounds good to me thanks']) {
    assert.deepEqual(parseOfferReply(t), { decision: 'yes', detail: '' }, t);
  }
});

test('parseOfferReply: no', () => {
  for (const t of ['no', 'No.', 'nope', 'NOPE 😅', 'not yet', 'Not yet please', 'wait', 'Wait!', 'hold on', 'Hold on a sec', "don't", 'Don\'t save it yet', 'not quite', 'not really', 'later', 'not now', 'cancel', 'no thanks', 'nah', 'no, not yet', 'Wait, wait', 'hang on']) {
    assert.deepEqual(parseOfferReply(t), { decision: 'no', detail: '' }, t);
  }
});

test('parseOfferReply: add (a detail, with the leading "also" and the like removed)', () => {
  const adds = [
    ['Also, she has a limp', 'she has a limp'], ['also she has a limp.', 'she has a limp.'], ['and she hides a key', 'she hides a key'], ['plus the ending is bittersweet', 'the ending is bittersweet'],
    ['one more thing: the sea is poisoned', 'the sea is poisoned'], ['add that the town has no name', 'the town has no name'], ['actually the villain is her sister', 'the villain is her sister'],
    ['but the ending should be sad', 'the ending should be sad'], ['except he never speaks', 'he never speaks'], ['oh and it is set in winter', 'it is set in winter'],
    ['wait, also the bell is cracked', 'the bell is cracked'], ["I'd add that the keeper is a widow", 'the keeper is a widow'], ['Yes, but make the ending darker', 'make the ending darker'],
    ['yes and she also has a sister', 'she also has a sister'], ['the ending involves a flood and nobody survives it', 'the ending involves a flood and nobody survives it'],
    ["Also: the lighthouse is older than the town 🙂", 'the lighthouse is older than the town 🙂'], ['no, not yet, I still need to work out who the villain is and why', 'I still need to work out who the villain is and why'],
    ['Mara is secretly afraid of the dark and never says so', 'Mara is secretly afraid of the dark and never says so'],
  ];
  for (const [t, detail] of adds) assert.deepEqual(parseOfferReply(t), { decision: 'add', detail }, t);
  assert.deepEqual(parseOfferReply('Actually, yes keep it'), { decision: 'yes', detail: '' }, 'a lead word before a plain yes is still a yes');
  assert.deepEqual(parseOfferReply('actually no wait'), { decision: 'no', detail: '' });
});

test('parseOfferReply: every lead-in word goes, so the detail starts at the writer\'s own words', () => {
  for (const [t, detail] of [['But actually the tone is grim and sparse.', 'the tone is grim and sparse.'], ['and also the keeper is a widow', 'the keeper is a widow'], ['Oh, and actually the bell is cracked', 'the bell is cracked'], ['plus also she limps', 'she limps'], ['Actually but the ferry never runs on Sundays', 'the ferry never runs on Sundays'], ['well, also: nobody trusts the harbour master', 'nobody trusts the harbour master']]) {
    assert.deepEqual(parseOfferReply(t), { decision: 'add', detail }, t);
  }
});

test('parseOfferReply: unclear (too short to tell, or a question)', () => {
  for (const t of ['hmm', 'maybe', 'I guess', 'what?', 'also', 'also,', 'actually', 'but', '', '   ', null, undefined, 'ok so what happens next', 'what will you keep if I say yes?', 'Also, what about the sister?', 'which parts will you save?']) {
    assert.deepEqual(parseOfferReply(t), { decision: 'unclear', detail: '' }, String(t));
  }
});

test('parseStyleCommand', () => {
  for (const t of ['ask me questions', 'Ask me some questions', 'interview me', 'walk me through it', 'ask me one at a time', 'ask me questions one by one', 'keep asking me', 'quiz me']) assert.equal(parseStyleCommand(t), 'interview', t);
  for (const t of ['stop asking questions', 'no more questions', 'just give me ideas', 'quit asking', "don't ask me questions", 'please stop the questions', 'enough questions', "don't ask me questions again", 'no questions, just ideas']) assert.equal(parseStyleCommand(t), 'quiet', t);
  for (const t of ['you can ask again', 'ask me again', 'ask questions again', 'you can ask me questions again', 'go back to asking', 'resume the questions']) assert.equal(parseStyleCommand(t), 'auto', t);
  for (const t of ['give me ideas', 'what do you think', 'Her job is to ask questions all day and she never stops, even when the whole village begs her to', 'how do I stop asking myself questions', 'questions', '', null]) assert.equal(parseStyleCommand(t), null, String(t));
});

test('parseKeepCommand: keep the whole idea, not a single note', () => {
  for (const t of ['keep this idea', 'commit this', 'remember this idea', 'save this idea', 'remember it all', "that's everything, keep it", 'remember this', 'keep it', 'Please save this to my idea board', 'commit this to memory', 'keep this idea please', "that's it, save it", 'save everything', 'ok, commit it', 'store this in memory']) assert.equal(parseKeepCommand(t), true, t);
  for (const t of ['remember this: she is afraid of water', 'remember: the bell is cracked', 'keep it simple, Mara is a keeper and she hears the bell in the fog', 'I want to keep the ending a surprise', 'the keeper will remember this forever', 'give me ideas', '', null]) assert.equal(parseKeepCommand(t), false, String(t));
});

test('signalsDone: the writer says the idea is complete', () => {
  for (const t of ["that's it", "That's everything", "I think that's all", "I'm done", 'nothing else', 'that covers it', "that's it for now", "nope, that's all", "that's it, keep it", 'I am finished', 'no more details', 'all done']) assert.equal(signalsDone(t), true, t);
  for (const t of ["it was all that she said", "that's it, the monster is her father and she never finds out", 'I am not done with the middle yet because the second act is a mess', 'tell me more', '', null]) assert.equal(signalsDone(t), false, String(t));
});

test('isNewIdea: explicit markers, and a long message about something else once three things are recorded', () => {
  const s = filled({ premise: 'a lighthouse keeper hears a drowned bell', protagonist: 'Mara wants to find her brother', setting: 'harbour town in winter fog' });
  for (const t of ['I have a new idea', 'Another idea: a robot who paints', "Let's try a different story", "let's switch to a poem about the sea", 'start over', 'Forget that', 'new idea!', "Here's a different story", 'ok so I have another story in mind', "I've got a new project"]) assert.equal(isNewIdea(t, s), true, t);
  for (const t of ['She gets a new idea about the bell', 'The clock starts over each night at the lighthouse', 'He cannot forget that night', 'Mara is a lighthouse keeper', '', null]) assert.equal(isNewIdea(t, s), false, String(t));
  const far = 'Orbiting a dying star, a crew of retired astronauts discovers that their station has been quietly rewriting history for decades.';
  assert.equal(isNewIdea(far, s), true, '12+ words, nothing in common');
  assert.equal(isNewIdea(far, filled({ premise: 'a bell', protagonist: 'Mara' })), false, 'fewer than three things recorded');
  assert.equal(isNewIdea(far, s, { skipOverlap: true }), false, 'the writer is answering a question');
  assert.equal(isNewIdea(far.split(' ').slice(0, 9).join(' '), s), false, 'under twelve words');
  assert.equal(isNewIdea('The harbour town has a lighthouse with a drowned bell and Mara hears it in the fog every winter night', s), false, 'it shares the writer\'s own words');
  assert.equal(isNewIdea('If she fails the whole village will lose its only light and her brother stays lost forever', s), false, 'a message that points back with "she" and "her" continues the idea');
  assert.equal(isNewIdea('A robot who paints sunsets for lonely sailors on a dying planet far away', s), true, 'a fresh pitch can use pronouns and still be new');
  assert.equal(isNewIdea('Meanwhile the ferry captain keeps a ledger of every crossing, every passenger, every storm and every quarrel', s, { recent: ['the ferry captain keeps a ledger'] }), false, 'what the writer said lately is shared context');
});

test('isNewIdea: a writer musing about the idea, or adding a detail, is not starting a new one, however few words they share with the sheet', () => {
  const s = filled({ premise: 'a lighthouse keeper hears a drowned bell', protagonist: 'Mara wants to find her brother', setting: 'harbour town in winter fog' });
  for (const t of [
    'I am not sure yet how much of the past to show early on in the story.',
    'I keep thinking about how quiet the island gets after the last ferry leaves each evening.',
    'There is a lot of fog in my head about how the middle of this should go.',
    'The more I say it out loud the more it feels real to me now somehow.',
    'The ferry runs twice a week and the crossing takes about forty minutes in good weather.',
    'My sister says the scene with the tide tables is the part she remembers most from it.',
    'Maybe it should feel like early autumn, melancholy but never quite hopeless or sentimental.',
    'Sometimes I wonder whether anyone would actually read a book about a place like this one.',
    'Honestly the ending is what keeps me awake because I cannot decide who gets to ring it.',
  ]) assert.equal(isNewIdea(t, s), false, t);
  // a pitch that happens to open the same way still starts something new
  for (const t of ['I have a story about a robot who paints sunsets for lonely sailors on a dying planet', "I'm writing a novel about a baker in Lagos who discovers her bread predicts the weather", 'The widow who inherits a haunted estate must decide whether to sell it or learn its secrets']) {
    assert.equal(isNewIdea(t, s), true, t);
  }
});

test('parseShelfCommand and the small judgements', () => {
  for (const t of ['bring back the earlier idea', 'Bring back my earlier story', 'go back to the previous idea', 'restore the earlier idea', 'resume the earlier poem', 'bring back the idea I set aside']) assert.equal(parseShelfCommand(t), 'restore', t);
  for (const t of ['keep the earlier idea', 'save my earlier story', 'keep the earlier idea on my board', 'commit the previous idea']) assert.equal(parseShelfCommand(t), 'keep', t);
  for (const t of ['the earlier idea was better', 'keep this idea', 'bring back the dead', '', null]) assert.equal(parseShelfCommand(t), null, String(t));
  assert.ok(looksLikeQuestion('Why would she hide it?') && looksLikeQuestion('what happens next') && !looksLikeQuestion('She hides it.'));
  assert.ok(looksLikeCommand('Give me some twists') && looksLikeCommand('stop asking questions') && looksLikeCommand("that's everything") && !looksLikeCommand('Mara hears a bell'));
});

// ── asking ───────────────────────────────────────────────────────────────────

test('placeholderValues takes the writer\'s own words and shapes them to slot into a question', () => {
  const { values, own } = placeholderValues(filled(WRITER, { genres: ['cozy-mystery'] }), ctx);
  assert.equal(values.who, 'Mara');
  assert.equal(values.place, 'the harbour town');
  assert.equal(values.thing, undefined, 'a whole sentence of premise does not slot into a question');
  assert.equal(values.want, 'to find her brother');
  assert.equal(values.other, 'Corin');
  assert.equal(values.theme, 'forgiveness');
  assert.equal(values.genre, 'cozy mystery');
  assert.equal(values.kind, 'story');
  assert.ok(!own.has('kind') && own.has('who'));
  const noun = placeholderValues(filled({ protagonist: 'a retired ferry captain who drinks too much', setting: 'on a drifting island of ice', premise: 'the drowned bell', want: 'Mara wants her brother back' }), ctx);
  assert.equal(noun.values.who, 'the retired ferry captain');
  assert.equal(noun.values.place, 'the drifting island');
  assert.equal(noun.values.thing, 'the drowned bell');
  assert.equal(noun.values.want, 'her brother back');
  assert.deepEqual(placeholderValues(filled({ protagonist: 'I', setting: '', other: 'no one' }), ctx).own.size, 0, 'a pronoun or "no one" is never slotted in');
  const bad = placeholderValues(filled({ protagonist: 'Mara "the Gull" Voss?' }), ctx);
  assert.ok(!/["?]/.test(bad.values.who));
});

test('placeholderValues drops how the writer introduced a value, keeps names and titles, and never slots a shrug or a late name into a question', () => {
  const vals = (slots) => placeholderValues(filled(slots), ctx).values;
  assert.equal(vals({ setting: 'It is set in a harbour town in winter fog' }).place, 'the harbour town');
  assert.equal(vals({ setting: 'The story takes place in Lagos in 1923' }).place, 'Lagos');
  assert.equal(vals({ setting: 'a harbour town called Saltmere' }).place, 'Saltmere');
  assert.equal(vals({ setting: 'Harrow Hall, a crumbling estate' }).place, 'Harrow Hall');
  assert.equal(vals({ setting: 'A small island off the coast of Maine in 1923' }).place, 'the small island', 'a name that only turns up late is not the place');
  assert.equal(vals({ setting: 'everywhere' }).place, undefined);
  assert.equal(vals({ theme: 'The theme is forgiveness and what we owe the dead' }).theme, 'forgiveness');
  assert.equal(vals({ theme: "It's about grief" }).theme, 'grief');
  assert.equal(vals({ premise: 'a story about a bell' }).thing, 'the bell');
  assert.equal(vals({ premise: 'It is a story about two sisters' }).thing, 'the two sisters');
  assert.equal(vals({ premise: 'A lighthouse keeper named Mara hears a drowned bell in the fog' }).thing, undefined);
  assert.equal(vals({ protagonist: 'The Widow' }).who, 'the Widow', 'a title keeps its article');
  assert.equal(vals({ protagonist: 'The lighthouse keeper' }).who, 'the lighthouse keeper');
});

test('pickQuestion fills placeholders with the writer\'s own words and prefers the most specific question', () => {
  const state = filled(WRITER);
  for (let i = 0; i < 12; i++) {
    const q = pickQuestion({ state, slotId: 'stakes', ctx, seed: `s${i}` });
    assert.ok(q && q.slot === 'stakes');
    assert.match(q.text, /\bstakes\b/, 'about this slot');
    assert.ok(!/\{|\}/.test(q.text));
    assert.deepEqual(questionProblems({ text: q.text.replace('Mara', '{who}'), type: q.type }).filter((p) => !/placeholder|reads badly/.test(p)), []);
  }
  const picked = new Set(Array.from({ length: 20 }, (_, i) => pickQuestion({ state, slotId: 'stakes', ctx, seed: `s${i}` }).text));
  assert.ok([...picked].every((t) => /Mara|Corin|the drowned bell/.test(t)), 'with their names filled in, the questions that use them are the ones chosen');
  assert.ok([...picked].some((t) => t.includes('Mara') || t.includes('Corin')), 'and the names are in the question');
  const empty = pickQuestion({ state: with_(), slotId: 'stakes', ctx, seed: 'x' });
  assert.ok(!/\{/.test(empty.text) && !/Mara/.test(empty.text));
  assert.equal(pickQuestion({ state, slotId: 'nonexistent', ctx }), null);
  assert.equal(pickQuestion({ state, slotId: 'culprit', ctx }), null, 'a slot this idea does not have');
});

test('pickQuestion never repeats a question, and returns null when the slot\'s bank is used up', () => {
  let state = filled(WRITER);
  const got = [];
  for (let i = 0; i < 12; i++) {
    const q = pickQuestion({ state, slotId: 'ending', ctx, seed: 'run' });
    if (!q) break;
    got.push(q);
    state = { ...state, turn: state.turn + 1, asked: [...state.asked, { slot: 'ending', text: q.text, type: q.type, turn: state.turn, answered: false, skipped: false }] };
  }
  assert.ok(got.length >= 5 && got.length <= 8, `${got.length} questions before the bank ran out`);
  assert.equal(new Set(got.map((q) => q.text)).size, got.length, 'none twice');
  for (let a = 0; a < got.length; a++) for (let b = a + 1; b < got.length; b++) assert.ok(similarity(got[a].text, got[b].text) < 0.6);
  assert.equal(pickQuestion({ state, slotId: 'ending', ctx, seed: 'run' }), null);
  assert.ok(pickQuestion({ state, slotId: 'tone', ctx, seed: 'run' }), 'another slot still has questions');
  // a question that is the same after filling is not asked again
  const asked = with_({ asked: [{ slot: 'ending', text: Q.open('the ending', Y.ending), type: 'open', turn: 1, answered: false, skipped: false }] });
  for (let i = 0; i < 30; i++) assert.notEqual(pickQuestion({ state: asked, slotId: 'ending', ctx, seed: `k${i}` }).text, asked.asked[0].text);
});

test('pickQuestion: a type unlike the last two, an easy type when asked, and the same choice for the same inputs', () => {
  const state = with_({ asked: [{ slot: 'tone', text: 'one?', type: 'open', turn: 1, answered: true, skipped: false }, { slot: 'theme', text: 'two?', type: 'reader', turn: 2, answered: true, skipped: false }], turn: 3 });
  for (let i = 0; i < 30; i++) {
    const q = pickQuestion({ state, slotId: 'ending', ctx, seed: `t${i}` });
    assert.ok(!['open', 'reader'].includes(q.type), q.type);
    assert.ok(['either', 'concrete'].includes(pickQuestion({ state, slotId: 'ending', ctx, seed: `t${i}`, easy: true }).type));
  }
  assert.deepEqual(pickQuestion({ state, slotId: 'ending', ctx, seed: 'same' }), pickQuestion({ state, slotId: 'ending', ctx, seed: 'same' }));
  const variety = new Set(Array.from({ length: 40 }, (_, i) => pickQuestion({ state: with_(), slotId: 'ending', ctx, seed: `v${i}` }).text));
  assert.ok(variety.size >= 3, 'different seeds ask different questions');
});

test('askTerms: the stems of what this session is about', () => {
  const terms = askTerms(filled({ premise: 'A lighthouse keeper hears a drowned bell' }, { extra: ['she hides a key'] }), ['the ferry stopped running', { role: 'user', content: 'Corin knows' }, { role: 'assistant', content: 'zebra unicorn' }]);
  for (const w of ['lighthouse', 'keeper', 'hear', 'drown', 'bell', 'hid', 'key', 'ferry', 'corin']) assert.ok(terms.has(w), w);
  assert.ok(!terms.has('zebra'), 'NIE\'s own replies are not the writer\'s terms');
  assert.ok(!terms.has('the') && !terms.has('a'));
});

const askPlan = { act: 'ask', slot: 'stakes', reason: 'core', question: { text: 'What is one small, specific detail that shows the stakes?', type: 'concrete' } };
const sessionState = filled(WRITER);
const opts = (extra = {}) => ({ state: sessionState, ctx, askedTexts: ['What does Mara fear most?'], terms: askTerms(sessionState, ['the harbour town and Corin']), ...extra });

test('enforceReply, act ask: exactly one question, about this session, never a repeat', () => {
  const bank = askPlan.question.text;
  // no question: the prepared one is added as the final paragraph
  const none = enforceReply('That is a vivid picture of the drowned bell and Mara.', askPlan, opts());
  assert.equal(none.text, `That is a vivid picture of the drowned bell and Mara.\n\n${bank}`);
  assert.deepEqual(none.changes.length, 1);
  // one good question about this session: untouched, byte for byte
  const good = 'The bell and the fog do a lot of work here.\n\nWhat does Mara lose if Corin gets there first?';
  assert.deepEqual(enforceReply(good, askPlan, opts()), { text: good, changes: [] });
  // a question that names nothing of the session: replaced in place by the prepared one
  const generic = enforceReply('That sounds like a strong start for a book.\n\nWhere is the best place to buy paper?', askPlan, opts());
  assert.equal(generic.text, `That sounds like a strong start for a book.\n\n${bank}`);
  // a stock question is replaced too
  assert.equal(enforceReply('The bell is a good image for the story.\n\nWhat do you think of this?', askPlan, opts()).text.endsWith(bank), true);
  assert.equal(enforceReply('The bell is a good image for the story.\n\nWhat do you think about the bell?', askPlan, opts()).text.endsWith('the bell?'), true, 'but one about the bell is the writer\'s own subject and stays');
  // a repeat of a question already asked
  const repeat = enforceReply('The bell is a good image for the story.\n\nWhat does Mara fear the most?', askPlan, opts());
  assert.ok(repeat.text.endsWith(bank) && !/fear/.test(repeat.text));
  // several: keep the best (most session terms, not a repeat), drop the other trailing/standalone ones
  const several = enforceReply('Mara and the bell make a strong pair in the fog.\n\nWhy is the sky blue?\n\nWhat would Corin do if Mara found her brother?\n\nHow tall is the lighthouse?', askPlan, opts());
  assert.equal((several.text.match(/\?/g) ?? []).length, 1);
  assert.match(several.text, /What would Corin do if Mara found her brother\?/);
  assert.ok(several.changes.length >= 2);
  // a question inside a list item is an idea, not the question of the turn: it stays, and the prepared one is added
  const list = enforceReply('Some directions for Mara:\n\n1. What if the bell is Corin\'s fault?\n2. What if the ferry never ran?\n\nThat is all from me.', askPlan, opts());
  assert.ok(list.text.includes("1. What if the bell is Corin's fault?") && list.text.includes('2. What if the ferry never ran?'));
  assert.ok(list.text.endsWith(bank));
  // serve + alsoAsk behaves the same way
  assert.ok(enforceReply('Here is how a sonnet turns.', { act: 'serve', alsoAsk: true, question: askPlan.question }, opts()).text.endsWith(bank));
});

test('enforceReply, other acts: a question that stands alone or ends the reply is removed (keeping at least eight words)', () => {
  const reflect = { act: 'reflect' };
  const reply = 'That is a vivid picture of Mara alone with the drowned bell.\n\nWhat does she fear most?';
  assert.equal(enforceReply(reply, reflect, opts()).text, 'That is a vivid picture of Mara alone with the drowned bell.');
  assert.equal(enforceReply('Mara hears it.\n\nWhat does she fear?', reflect, opts()).text, 'Mara hears it.\n\nWhat does she fear?', 'too little would be left');
  assert.equal(enforceReply('The bell rings once for every person the sea has taken, which is a heavy thing to carry. Why does it ring?', reflect, opts()).text, 'The bell rings once for every person the sea has taken, which is a heavy thing to carry.', 'a closing question');
  const mid = 'Why does the bell ring at night? That is the question the story has to earn, and it does.';
  assert.equal(enforceReply(mid, reflect, opts()).text, mid, 'a question in the middle of a paragraph is part of the reply');
  const intro = 'Here are some directions to think about:\n\n1. What if the bell is Corin\'s fault?\n2. What if the ferry never ran?';
  assert.equal(enforceReply(intro, reflect, opts()).text, intro, 'never inside a list item');
  // serve: one question may stay, a stock one may not
  const serve = { act: 'serve' };
  const two = 'A villanelle repeats two lines in a set pattern across five tercets and a closing quatrain.\n\nDoes that help?\n\nWhat is your poem about?';
  const out = enforceReply(two, serve, opts());
  assert.ok((out.text.match(/\?/g) ?? []).length <= 1);
  assert.ok(!/Does that help/.test(out.text));
  assert.ok(/A villanelle repeats/.test(out.text));
  const stock = 'A villanelle repeats two lines in a set pattern across five tercets and a closing quatrain.\n\nWhat do you think?';
  assert.ok(!enforceReply(stock, serve, opts()).text.includes('?'));
});

test('enforceReply never rewords, always returns a string, and is idempotent', () => {
  const replies = [
    'That sounds like a strong start for a book.\n\nWhere is the best place to buy paper?',
    'Mara and the bell make a strong pair in the fog.\n\nWhy is the sky blue?\n\nWhat would Corin do if Mara found her brother?\n\nHow tall is the lighthouse?',
    'That is a vivid picture of the drowned bell and Mara.',
    '1. What if the bell is Corin\'s fault?\n2. What if the ferry never ran?\n\nWhat do you think?',
    'Which of these ideas resonates with your vision?', '', '   ', 'One. Two? Three? Four? Five?', '???', 'Hmm\n\n\n\nWhat?',
  ];
  for (const plan of [askPlan, { act: 'reflect' }, { act: 'serve' }, { act: 'serve', alsoAsk: true, question: askPlan.question }, { act: 'offer' }, null, undefined]) {
    for (const r of replies) {
      const once = enforceReply(r, plan, opts());
      assert.equal(typeof once.text, 'string');
      assert.deepEqual(enforceReply(once.text, plan, opts()).text, once.text, `idempotent: ${JSON.stringify(r).slice(0, 40)} / ${plan?.act}`);
      // whatever stays is the model's own text, or the prepared question
      for (const sentence of once.text.split(/(?<=[.?!])\s+/).filter(Boolean)) assert.ok(r.includes(sentence.trim()) || askPlan.question.text.includes(sentence.trim()) || once.text.endsWith(askPlan.question.text), `nothing new: ${sentence}`);
    }
  }
  for (const junk of [null, undefined, 42, {}, []]) assert.equal(typeof enforceReply(junk, askPlan, opts()).text, 'string');
  assert.equal(enforceReply('x', askPlan, { }).text.includes('?'), true, 'works with no options too');
});

// ── planning ─────────────────────────────────────────────────────────────────

const bigPack = () => ({ kinds: { story: pack('story', [slot('s0', 'Start', 'topiczeroa', { core: true, weight: 1, y: 'topiczerob' }), ...Array.from({ length: 49 }, (_, i) => slot(`s${i + 1}`, `Part ${i + 1}`, `topic${'abcdefghijklmnopqrstuvwxyz'[i % 26]}${'qrstuvwxyz'[Math.floor(i / 26)]}${i}a`, { core: i < 5, y: `topic${'abcdefghijklmnopqrstuvwxyz'[(i * 7) % 26]}${i}b` }))]), other: pack('other', [slot('o0', 'O', 'o0', { core: true })]) }, forms: [], genres: [] });
const plainCtx = { packs: bigPack(), config: { readyScore: 5 } }; // 50 slots; never "ready", so only the pacing is measured

/** Play n info turns of an obliging writer who answers every question; returns the acts. */
function simulate(n, { mode = 'auto', seed = 's', words = 12, c = plainCtx, kind = 'story' } = {}) {
  let state = { ...emptyAgentState(), kind, mode };
  const acts = [];
  for (let i = 0; i < n; i++) {
    const answered = state.pending?.kind === 'question' && state.pending.slot ? [state.pending.slot] : [];
    state = { ...state, turn: state.turn + 1, slots: answered.length ? { ...state.slots, [answered[0]]: { value: `my answer ${i}`, turn: state.turn, via: 'answered' } } : state.slots };
    const plan = planTurn({ state, info: { act: answered.length ? 'answer' : 'info', updated: answered, words, signalsDone: false }, ctx: c, seed });
    state = plan.state;
    if (plan.act === 'ask') state = recordAsk(state, plan, plan.question.text);
    acts.push(plan.act);
  }
  return acts;
}

test('planTurn in auto mode asks about 40-60% of the time, never three in a row, and always on the first turn', () => {
  for (const seed of ['a', 'b', 'c', 'd', 'e', 'seed-1', 'seed-2', 'seed-3']) {
    const acts = simulate(60, { seed });
    assert.equal(acts[0], 'ask', 'the first turn on a new idea asks');
    const rate = acts.filter((a) => a === 'ask').length / acts.length;
    assert.ok(rate >= 0.35 && rate <= 0.65, `seed ${seed}: asked ${(rate * 100).toFixed(0)}%`);
    assert.ok(!acts.join(',').includes('ask,ask,ask'), `seed ${seed}: never three in a row`);
  }
  assert.ok(Math.abs(GAP_PATTERN.reduce((a, b) => a + b, 0) / GAP_PATTERN.length - 2.3) < 1e-9, 'the gaps average 2.3 turns');
  assert.deepEqual(simulate(30, { seed: 'x' }), simulate(30, { seed: 'x' }), 'deterministic');
  assert.notDeepEqual(simulate(30, { seed: 'x' }), simulate(30, { seed: 'y' }), 'but the pattern varies with the seed');
});

test('planTurn: interview mode asks on (nearly) every turn, quiet mode never asks', () => {
  const interview = simulate(40, { mode: 'interview' });
  assert.ok(interview.filter((a) => a === 'ask').length / interview.length >= 0.9);
  assert.equal(simulate(40, { mode: 'quiet' }).filter((a) => a === 'ask').length, 0);
  assert.ok(simulate(40, { mode: 'quiet' }).every((a) => a === 'reflect'));
});

test('planTurn: a longer, engaged message waits less; a very short one waits more and gets an easier question', () => {
  const base = { ...emptyAgentState(), kind: 'story', turn: 9, asked: [{ slot: 'tone', text: 'one?', type: 'open', turn: 5, answered: true, skipped: false }] };
  for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
    const [long, mid, short] = [60, 12, 2].map((w) => gapAfter(base, seed, w));
    assert.ok(long <= mid && mid <= short, `${seed}: ${long} <= ${mid} <= ${short}`);
    assert.ok(long >= 1 && short <= 4);
  }
  assert.ok(gapAfter({ ...base, asked: [{ ...base.asked[0], turn: 4 }, { ...base.asked[0], turn: 5 }] }, 'a', 80) >= 2, 'after two questions in a row, at least two turns');
  const p = planTurn({ state: { ...base, asked: [], sinceAsk: 0 }, info: { act: 'info', updated: [], words: 2 }, ctx: plainCtx, seed: 'z' });
  assert.equal(p.act, 'ask');
  assert.ok(p.easy && ['either', 'concrete'].includes(p.question.type));
});

test('planTurn: serve turns never interview (interview mode answers first, then asks one thing); chat never asks', () => {
  const state = { ...emptyAgentState(), kind: 'story', turn: 3 };
  for (const act of ['question', 'ideas', 'feedback', 'craft']) {
    const p = planTurn({ state, info: { act, updated: [], words: 8 }, ctx, seed: 's' });
    assert.equal(p.act, 'serve', act);
    assert.equal(p.alsoAsk, undefined);
    const iv = planTurn({ state: { ...state, mode: 'interview' }, info: { act, updated: [], words: 8 }, ctx, seed: 's' });
    assert.equal(iv.act, 'serve');
    assert.equal(iv.alsoAsk, true);
    assert.ok(iv.question && iv.slot);
  }
  const chat = planTurn({ state, info: { act: 'chat', updated: [], words: 2 }, ctx, seed: 's' });
  assert.equal(chat.act, 'reflect');
  assert.equal(chat.state.sinceAsk, state.sinceAsk, 'a serve or chat turn does not count toward the next question');
});

test('planTurn: which slot — what follows from the one just filled, core first, not asked lately, not skipped twice', () => {
  const first = { ...emptyAgentState(), kind: 'story', turn: 2, slots: rec({ premise: 'a bell', protagonist: 'Mara' }, 2), sinceAsk: 5 };
  const next = planTurn({ state: first, info: { act: 'answer', updated: ['protagonist'], words: 8 }, ctx, seed: 's' });
  assert.deepEqual([next.act, next.slot, next.reason], ['ask', 'want', 'follows-up'], 'protagonist is followed by want');
  const core = planTurn({ state: { ...first, slots: rec({ premise: 'a bell' }, 2) }, info: { act: 'info', updated: [], words: 8 }, ctx, seed: 's' });
  assert.ok(['protagonist', 'setting'].includes(core.slot), 'core before the rest');
  const lately = planTurn({ state: { ...first, asked: [{ slot: 'want', text: 'asked before?', type: 'open', turn: 1, answered: false, skipped: true }] }, info: { act: 'info', updated: ['protagonist'], words: 8 }, ctx, seed: 's' });
  assert.notEqual(lately.slot, 'want', 'asked within the last eight turns');
  const far = planTurn({ state: { ...first, turn: 12, asked: [{ slot: 'want', text: 'asked before?', type: 'open', turn: 3, answered: false, skipped: false }] }, info: { act: 'info', updated: ['protagonist'], words: 8 }, ctx, seed: 's' });
  assert.equal(far.slot, 'want', 'long enough ago');
  const twice = planTurn({ state: { ...first, turn: 30, asked: [1, 2].map((n) => ({ slot: 'want', text: `skipped ${n}?`, type: 'open', turn: n, answered: false, skipped: true })) }, info: { act: 'info', updated: ['protagonist'], words: 8 }, ctx, seed: 's' });
  assert.notEqual(twice.slot, 'want', 'skipped twice: not again');
});

test('planTurn: the question NIE asked is marked answered or skipped, and nothing is mutated', () => {
  const asked = { slot: 'want', text: 'What does Mara want?', type: 'open', turn: 2, answered: false, skipped: false };
  const base = deepFreeze({ ...emptyAgentState(), kind: 'story', turn: 3, slots: rec({ premise: 'a bell', protagonist: 'Mara' }), asked: [asked], pending: { kind: 'question', slot: 'want', text: asked.text, turn: 2 }, sinceAsk: 0 });
  const info = deepFreeze({ act: 'info', updated: [], words: 8, signalsDone: false });
  const skipped = planTurn({ state: base, info, ctx, seed: 's' });
  assert.equal(skipped.state.pending, null);
  assert.deepEqual(skipped.state.asked[0], { ...asked, skipped: true });
  const answered = planTurn({ state: base, info: { ...info, act: 'answer', updated: ['want'] }, ctx, seed: 's' });
  assert.deepEqual(answered.state.asked[0], { ...asked, answered: true });
  assert.equal(base.asked[0].skipped, false, 'the input is untouched');
  const chat = planTurn({ state: base, info: { ...info, act: 'chat' }, ctx, seed: 's' });
  assert.deepEqual(chat.state.pending, base.pending, 'a thank-you does not skip the question');
  // the kind question counts as answered when the kind is now known
  const kindAsked = deepFreeze({ ...emptyAgentState(), kind: 'story', turn: 2, asked: [{ slot: null, text: KIND_QUESTIONS[0].text, type: 'either', turn: 1, answered: false, skipped: false }], pending: { kind: 'question', slot: null, text: KIND_QUESTIONS[0].text, turn: 1 } });
  assert.equal(planTurn({ state: kindAsked, info, ctx, seed: 's' }).state.asked[0].answered, true);
});

test('planTurn: with no kind it asks what they are making (six phrasings), then moves on', () => {
  assert.equal(KIND_QUESTIONS.length, 6);
  for (const q of KIND_QUESTIONS) {
    assert.deepEqual(questionProblems(q), [], q.text);
    assert.ok(!isStockQuestion(q.text));
  }
  for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) assert.ok(similarity(KIND_QUESTIONS[a].text, KIND_QUESTIONS[b].text) < 0.6, 'distinct');
  let state = { ...emptyAgentState(), turn: 1 };
  const p = planTurn({ state, info: { act: 'info', updated: [], words: 9 }, ctx, seed: 's' });
  assert.deepEqual([p.act, p.slot, p.reason], ['ask', null, 'kind']);
  assert.ok(KIND_QUESTIONS.some((q) => q.text === p.question.text));
  state = recordAsk({ ...p.state, turn: 1 }, p, p.question.text);
  assert.deepEqual([state.pending.slot, state.asked[0].slot], [null, null]);
  const again = pickKindQuestion({ state, seed: 's' });
  assert.notEqual(again.text, p.question.text, 'never the same one twice');
  let s2 = state;
  for (let i = 0; i < 6; i++) {
    const q = pickKindQuestion({ state: s2, seed: 's' });
    if (!q) break;
    s2 = { ...s2, asked: [...s2.asked, { slot: null, text: q.text, type: q.type, turn: i, answered: false, skipped: true }] };
  }
  assert.ok(s2.asked.length >= 2 && s2.asked.length <= 7);
  const third = planTurn({ state: { ...s2, asked: s2.asked.slice(0, 2), sinceAsk: 9, turn: 9 }, info: { act: 'info', updated: [], words: 9 }, ctx, seed: 's' });
  assert.notEqual(third.reason, 'kind', 'after two tries it uses the general questions');
});

test('planTurn: when it offers to keep the idea', () => {
  const ready = (over = {}) => ({ ...emptyAgentState(), kind: 'story', turn: 6, sinceOffer: 4, sinceAsk: 0, slots: rec({ premise: 'a bell', protagonist: 'Mara', want: 'her brother', obstacle: 'Corin', stakes: 'the village' }), asked: [{ slot: 'tone', text: 'x?', type: 'open', turn: 1, answered: true, skipped: false }], ...over });
  const plan = (state, info = {}) => planTurn({ state, info: { act: 'info', updated: [], words: 10, signalsDone: false, ...info }, ctx, seed: 's' });
  const offer = plan(ready());
  assert.deepEqual([offer.act, offer.reason, offer.partial], ['offer', 'ready', false]);
  assert.deepEqual(offer.state.pending, { kind: 'offer', turn: 6, partial: false });
  assert.equal(offer.state.sinceOffer, 0);
  assert.notEqual(plan(ready({ sinceOffer: 1 })).act, 'offer', 'not offered again right away (sinceOffer counts this turn: 1+1 < 4)');
  assert.notEqual(plan(ready({ turn: 3 })).act, 'offer', 'under four turns');
  assert.notEqual(plan(ready({ slots: rec({ premise: 'a bell', protagonist: 'Mara' }) })).act, 'offer', 'not grasped enough');
  assert.notEqual(plan(ready({ declinedAt: 4 })).act, 'offer', 'told "not yet" two turns ago');
  assert.equal(plan(ready({ declinedAt: 2 })).act, 'offer', 'four turns after "not yet"');
  assert.notEqual(plan(ready({ mode: 'quiet' })).act, 'offer', 'quiet mode offers only when the writer says they are done');
  assert.equal(plan(ready({ mode: 'interview' })).act, 'offer', 'interview mode offers once it grasps the idea');
  const done = plan(ready({ turn: 2, sinceOffer: 0, slots: rec({ premise: 'a bell', protagonist: 'Mara' }) }), { signalsDone: true });
  assert.deepEqual([done.act, done.reason, done.partial], ['offer', 'done', true], 'the writer says they are done: a partial offer');
  assert.equal(plan(ready({ turn: 2, slots: rec({ premise: 'a bell' }) }), { signalsDone: true }).act !== 'offer', true, 'but with one thing recorded there is nothing to keep');
  assert.equal(plan(ready({ mode: 'quiet', declinedAt: 5 }), { signalsDone: true }).act, 'offer');
  assert.equal(plan(ready(), { act: 'question', signalsDone: true }).act, 'serve', 'a question gets an answer, not an offer');
  assert.equal(plan(ready({ pending: { kind: 'offer', turn: 5, partial: false } })).act, 'reflect', 'an offer is already waiting');
});

// ── keeping ──────────────────────────────────────────────────────────────────

test('recapText shows only the writer\'s words and the slot labels, what is open, and asks', () => {
  const state = filled(WRITER, { extra: ['she hides a key'] });
  const text = recapText(state, ctx);
  const lines = text.split('\n');
  assert.equal(lines[0], "Here's what I've got so far, in your words:");
  assert.ok(lines.includes('• Main character: Mara, a lighthouse keeper'));
  assert.ok(lines.includes('• Also: she hides a key'));
  assert.equal(lines.at(-1), "Want me to keep this on your Idea Board and in this project's memory? You can add or change anything first.");
  assert.match(text, /\n\nStill open: What stands in the way|\n\nStill open: Stakes/);
  for (const line of lines) assert.ok(line === '' || line.startsWith('• ') || /^(?:Here's what|I'll keep what|Still open:|I'm still missing:|Want me to keep)/.test(line), `no other prose: ${line}`);
  const partial = recapText(state, ctx, { partial: true });
  assert.ok(partial.startsWith("I'll keep what we have."));
  assert.match(partial, /I'm still missing: /);
  assert.ok(!/Still open/.test(partial));
  const everything = recapText(with_({ slots: rec(Object.fromEntries(slotsFor(with_(), ctx).map((s) => [s.id, `my ${s.id}`]))) }), ctx);
  assert.ok(!/Still open|still missing/.test(everything), 'nothing open: no line about it');
  const many = recapText(with_({ slots: rec({ premise: 'x' }) }), ctx);
  assert.match(many, /and \d+ more/, 'a long list of open slots is shortened');
});

test('offerChips have the shape of the existing suggestion chips', () => {
  const chips = offerChips(false);
  assert.deepEqual(chips.map((c) => c.label), ['Yes, keep it', 'Let me add something', 'Not yet']);
  assert.equal(chips[0].send.ask, 'Yes, keep it.');
  assert.equal(chips[1].text, 'Also, ');
  assert.equal(chips[2].send.ask, 'Not yet.');
  assert.deepEqual(offerChips(true).map((c) => c.label), chips.map((c) => c.label));
  assert.equal(parseOfferReply(chips[0].send.ask).decision, 'yes');
  assert.equal(parseOfferReply(chips[2].send.ask).decision, 'no');
});

test('digest: the writer\'s words in pack order, never over the limit, values shrunk in proportion but never below 40 characters', () => {
  const state = filled({ premise: 'A lighthouse keeper hears a drowned bell', protagonist: 'Mara', setting: 'a harbour town' }, { extra: ['she hides a key'] });
  assert.equal(digest(state, ctx), 'Premise: A lighthouse keeper hears a drowned bell · Main character: Mara · Setting: a harbour town · Also: she hides a key');
  assert.equal(digest(with_(), ctx), '');
  const words = (n, w) => Array.from({ length: n }, (_, i) => `${w}${i}`).join(' ');
  const huge = filled(Object.fromEntries(slotsFor(with_(), ctx).map((s, i) => [s.id, words(40, s.id)])), { extra: [words(40, 'extra')] });
  for (const max of [700, 400, 200, 120]) {
    const d = digest(huge, ctx, max);
    assert.ok(d.length <= max, `${d.length} <= ${max}`);
    assert.ok(d.length > 0);
  }
  assert.ok(MAX_IDEA_CHARS === 700 && digest(huge, ctx).length <= 700, 'the default fits the Idea Board');
  const d = digest(huge, ctx, 700);
  for (const part of d.split(' · ')) {
    const [label, ...rest] = part.split(': ');
    const value = rest.join(': ').replace(/…$/, '');
    const source = label === 'Also' ? huge.extra[0] : Object.entries(huge.slots).map(([, v]) => v.value).find((v) => v.startsWith(value.slice(0, 10)));
    assert.ok(source?.startsWith(value), `a shortened value is the start of what the writer said: ${part.slice(0, 50)}`);
  }
  const mid = digest(filled({ premise: words(60, 'p'), protagonist: words(60, 'q') }), ctx, 300);
  for (const part of mid.split(' · ')) assert.ok(part.split(': ').slice(1).join(': ').length >= 40, 'no value shrinks below 40 characters');
});

const boardOf = (p) => p.brainstorm.board;
const keptState = () => filled({ ...WRITER, cast: 'Corin and old Tam' }, { turn: 6, idea: 1 });

test('commitIdea puts the digest on the Idea Board and files the slots into project memory', () => {
  const project = projectWith({});
  const state = keptState();
  const { state: after, result } = commitIdea(project, state, ctx, { now: 1700000000000 });
  assert.equal(boardOf(project).length, 1);
  const item = boardOf(project)[0];
  assert.equal(item.text, digest(state, ctx));
  assert.deepEqual([item.kind, item.source, item.createdAt], ['story', 'writer', 1700000000000]);
  assert.match(item.note, /^Still open: /);
  assert.deepEqual(project.memory.characters.map((c) => c.name).sort(), ['Corin', 'Mara', 'Tam'].sort(), 'protagonist and cast: "Mara, a lighthouse keeper" is one person, "Corin and old Tam" two');
  assert.equal(project.memory.characters.find((c) => c.name === 'Mara').notes, 'Mara, a lighthouse keeper');
  assert.deepEqual(project.memory.themes, ['forgiveness']);
  assert.deepEqual(project.memory.motifs, ['the bell']);
  assert.deepEqual(project.conversation.workingPremise.settings, ['a harbour town in winter']);
  assert.equal(project.conversation.workingPremise.summary, WRITER.premise);
  assert.deepEqual([result.addedToBoard, result.updatedBoard, result.unchanged], [true, false, false]);
  assert.equal(result.boardId, item.id);
  assert.deepEqual(result.themes, ['forgiveness']);
  assert.ok(result.open.length > 0 && typeof result.digest === 'string');
  assert.equal(after.pending, null);
  assert.equal(after.sinceOffer, 0);
  assert.equal(after.committed.length, 1);
  assert.deepEqual(Object.keys(after.slots), Object.keys(state.slots), 'the sheet stays');
  assert.equal(state.committed.length, 0, 'the input state is untouched');
});

test('a later commit of the same idea updates the same Idea Board item; an unchanged one says so', () => {
  const project = projectWith({});
  let { state } = commitIdea(project, keptState(), ctx);
  const again = commitIdea(project, state, ctx);
  assert.equal(again.result.unchanged, true);
  assert.equal(boardOf(project).length, 1);
  assert.equal(again.state.committed.length, 1, 'nothing new to record');
  assert.equal(changedSinceCommit(state, ctx), false);
  state = setSlot(state, 'stakes', 'the whole village and the ferry', { turn: 7 });
  assert.equal(changedSinceCommit(state, ctx), true);
  const second = commitIdea(project, state, ctx);
  assert.equal(boardOf(project).length, 1, 'never a duplicate');
  assert.deepEqual([second.result.updatedBoard, second.result.addedToBoard], [true, false]);
  assert.match(boardOf(project)[0].text, /Stakes: the whole village and the ferry/);
  assert.equal(second.result.boardId, boardOf(project)[0].id);
  assert.equal(second.state.committed.length, 2);
  // a different idea gets its own entry
  const other = commitIdea(project, { ...filled({ premise: 'A robot learns to paint', protagonist: 'Unit 7' }), idea: 2 }, ctx);
  assert.equal(boardOf(project).length, 2);
  assert.equal(other.result.addedToBoard, true);
  // the writer edited the entry's text: their words stay, the new digest is its own entry
  const p2 = projectWith({});
  const first = commitIdea(p2, keptState(), ctx);
  p2.brainstorm.board[0].text = 'My own wording of the idea';
  const next = commitIdea(p2, setSlot(first.state, 'stakes', 'everything they own', { turn: 8 }), ctx);
  assert.equal(p2.brainstorm.board.length, 2);
  assert.equal(p2.brainstorm.board[0].text, 'My own wording of the idea');
  assert.equal(next.result.addedToBoard, true);
});

test('commitIdea leaves what the writer already had in memory alone and records only what it added', () => {
  const project = projectWith({ memory: { characters: [{ name: 'Mara', aliases: ['the Gull'], notes: 'my own notes about her' }], themes: ['Forgiveness'], motifs: [] } });
  const { state, result } = commitIdea(project, keptState(), ctx);
  assert.equal(project.memory.characters.find((c) => c.name === 'Mara').notes, 'my own notes about her', 'the writer\'s notes are never overwritten');
  assert.deepEqual(project.memory.themes, ['Forgiveness'], 'no duplicate theme in another case');
  assert.deepEqual(state.committed[0].characters.sort(), ['Corin', 'Tam'], 'only the new ones');
  assert.deepEqual(state.committed[0].themes, []);
  assert.ok(result.characters.includes('Mara'), 'but the result says Mara is in memory');
  const wp = project.conversation.workingPremise;
  assert.equal(wp.summary, WRITER.premise);
  const p2 = projectWith({});
  p2.conversation.workingPremise.summary = 'The writer\'s own premise';
  commitIdea(p2, keptState(), ctx);
  assert.equal(p2.conversation.workingPremise.summary, 'The writer\'s own premise', 'the premise is only set when empty');
});

test('undoCommit removes the Idea Board entry and exactly what the commit added', () => {
  const project = projectWith({ memory: { characters: [{ name: 'Mara', aliases: [], notes: 'mine' }], themes: ['grief'], motifs: [] } });
  const before = JSON.stringify({ memory: project.memory, board: boardOf(project), wp: project.conversation.workingPremise });
  const { state } = commitIdea(project, keptState(), ctx);
  assert.equal(boardOf(project).length, 1);
  const undone = undoCommit(project, state, ctx);
  assert.equal(JSON.stringify({ memory: project.memory, board: boardOf(project), wp: project.conversation.workingPremise }), before, 'everything is back as it was');
  assert.equal(undone.state.committed.length, 0);
  assert.equal(undone.removed.board, 'removed');
  assert.deepEqual(undone.removed.characters.sort(), ['Corin', 'Tam']);
  assert.equal(undoCommit(project, undone.state, ctx).removed, null, 'nothing more to undo');
  // undoing an update restores the earlier entry rather than deleting it
  const p2 = projectWith({});
  const a = commitIdea(p2, keptState(), ctx);
  const originalText = boardOf(p2)[0].text;
  const b = commitIdea(p2, setSlot(a.state, 'stakes', 'the whole village', { turn: 9 }), ctx);
  assert.notEqual(boardOf(p2)[0].text, originalText);
  const u = undoCommit(p2, b.state, ctx);
  assert.equal(boardOf(p2).length, 1);
  assert.equal(boardOf(p2)[0].text, originalText);
  assert.equal(u.removed.board, 'restored');
  assert.equal(u.state.committed.length, 1);
});

test('peopleIn: several people become several characters; an appositive describes one', () => {
  assert.deepEqual(peopleIn('Mara and Corin').map((p) => p.name), ['Mara', 'Corin']);
  assert.deepEqual(peopleIn('Mara, Corin and Jules').map((p) => p.name), ['Mara', 'Corin', 'Jules']);
  assert.deepEqual(peopleIn('Mara, a lighthouse keeper').map((p) => p.name), ['Mara']);
  assert.equal(peopleIn('Mara, a lighthouse keeper')[0].notes, 'Mara, a lighthouse keeper');
  assert.deepEqual(peopleIn('a retired ferry captain who drinks').map((p) => p.name), ['retired ferry captain']);
  assert.deepEqual(peopleIn('a sailor and a thief').map((p) => p.name), ['sailor', 'thief']);
  assert.deepEqual(peopleIn(''), []);
  assert.ok(peopleIn(Array.from({ length: 20 }, (_, i) => `Person${String.fromCharCode(65 + i)}x`).join(', ')).length <= 6);
});

test('confirmText, holdText and addedText say only what happened', () => {
  const project = projectWith({});
  const { result } = commitIdea(project, keptState(), ctx);
  const text = confirmText(result);
  assert.match(text, /^Kept\. It's on your Idea Board and in this project's memory \(characters: [^)]*Mara[^)]*; themes: forgiveness; motifs: the bell; settings: a harbour town in winter\)\. Say "show my idea board" any time\. Still open: /);
  assert.equal(confirmText({ ...result, open: [] }).includes('Still open'), false);
  assert.match(confirmText({ ...result, addedToBoard: false, updatedBoard: true }), /^Kept\. I updated the entry already on your Idea Board/);
  assert.match(confirmText({ ...result, unchanged: true }), /already on your Idea Board exactly as it stands/);
  assert.match(confirmText({ ...result, characters: [], themes: [], motifs: [], settings: [] }), /^Kept\. It's on your Idea Board\. Say/, 'no claim about memory when nothing went there');
  assert.match(confirmText(result, { what: 'the earlier idea' }), /^Kept the earlier idea\./);
  assert.match(confirmText({ empty: true, open: [] }), /nothing recorded yet/);
  const holds = new Set(Array.from({ length: 60 }, (_, i) => holdText(`s${i}`)));
  assert.equal(holds.size, 6, 'six phrasings');
  assert.equal(holdText('a'), holdText('a'));
  for (const h of holds) assert.ok(!/\?/.test(h) && h.length < 120);
  assert.equal(addedText([{ slot: 'want', label: 'What they want', value: 'to find her brother' }, { slot: 'setting', value: 'a harbour town' }], ctx), 'Added: What they want - to find her brother; Setting - a harbour town. Anything else, or shall I keep it?');
  assert.equal(addedText([{ slot: null, value: 'she hides a key' }], ctx), 'Noted under "Also": she hides a key. Anything else, or shall I keep it?');
  assert.equal(addedText([{ slot: 'want', label: 'What they want', value: 'to save the ferry', was: 'to find her brother' }], ctx), 'Changed: What they want - to save the ferry. Anything else, or shall I keep it?');
  assert.match(addedText([], ctx), /^I didn't find anything new to record in that\. Anything else/);
});

test('a closing full stop is not part of a detail, and NIE never doubles it', () => {
  assert.deepEqual(addExtra(with_(), 'she hides a key.').extra, ['she hides a key']);
  assert.deepEqual(addExtra(with_(), 'who took the key?').extra, ['who took the key?'], 'a question mark is the writer\'s');
  assert.equal(addedText([{ slot: null, value: 'she hides a key.' }], ctx), 'Noted under "Also": she hides a key. Anything else, or shall I keep it?');
  assert.equal(addedText([{ slot: 'want', label: 'What they want', value: 'who took it?' }], ctx), 'Added: What they want - who took it? Anything else, or shall I keep it?');
});

// ── what the model is told ───────────────────────────────────────────────────

const bigState =() => filled(Object.fromEntries(slotsFor(with_({ form: 'picture-book', genres: ['cozy-mystery'] }), ctx).map((s) => [s.id, `${s.id} ${'is described at some length by the author '.repeat(6)}`.slice(0, 220)])), {
  form: 'picture-book', genres: ['cozy-mystery'], asked: Array.from({ length: 40 }, (_, i) => ({ slot: 'tone', text: `Question number ${i} about the lighthouse and the long winter fog that never lifts over the harbour town at all?`, type: 'open', turn: i, answered: false, skipped: false })),
});

test('briefFor stays within 380 estimated tokens however much is recorded', () => {
  const notes = ['Cozy mysteries keep the violence offstage and the community at the centre of the story.', 'The puzzle is fair when the reader can see the clues that the detective sees in time.', 'A third note that should not be needed.'];
  const q = { text: pickQuestion({ state: bigState(), slotId: 'voice', ctx, seed: 'x' })?.text ?? askPlan.question.text, type: 'open' };
  for (const plan of [{ act: 'ask', slot: 'stakes', question: q }, { act: 'ask', slot: null, question: KIND_QUESTIONS[0] }, { act: 'reflect' }, { act: 'serve' }, { act: 'serve', alsoAsk: true, slot: 'ending', question: q }]) {
    for (const state of [bigState(), with_(), filled(WRITER)]) {
      const brief = briefFor({ plan, state, ctx, libraryNotes: notes });
      assert.ok(estimateTokens(brief) <= 380, `${plan.act}: ${estimateTokens(brief)} tokens`);
      assert.match(brief, /This turn:/);
    }
  }
});

test('briefFor: what is understood, what is not, the conventions, what was asked, and the one thing to do', () => {
  const state = filled(WRITER, { genres: ['cozy-mystery'], asked: Array.from({ length: 6 }, (_, i) => ({ slot: 'tone', text: `Earlier question ${i} about Mara?`, type: 'open', turn: i, answered: true, skipped: false })) });
  const plan = { act: 'ask', slot: 'stakes', question: { text: askPlan.question.text, type: 'concrete' } };
  const brief = briefFor({ plan, state, ctx, libraryNotes: ['The culprit is someone the reader has already met.', 'Violence stays offstage.', 'A third note.'] });
  assert.match(brief, /^What you understand so far \(the writer's own words\):\n- Premise: A lighthouse keeper hears a drowned bell in the fog/);
  assert.match(brief, /- Main character: Mara, a lighthouse keeper/);
  assert.match(brief, /Not yet known: [^\n]*Stakes/);
  assert.ok((brief.match(/Not yet known: ([^\n]*)/)[1].split(', ').length) <= 6);
  assert.match(brief, /Conventions to keep in mind:\n- The culprit is someone the reader has already met\.\n- Violence stays offstage\./);
  assert.ok(!brief.includes('A third note'), 'at most two');
  assert.match(brief, /Questions you have already asked \(do not repeat or reword them\):/);
  assert.ok(brief.includes('Earlier question 5 about Mara?') && brief.includes('Earlier question 2 about Mara?') && !brief.includes('Earlier question 1 about'), 'the last four');
  assert.match(brief, /This turn:\nReply in at most two short sentences that point at one specific detail they gave. Do not retell their idea, guess what happens next, add any detail of your own, or say how good it is. Then ask exactly ONE question about Stakes \(what the writer says about the stakes, in their own words\)\. Use their own names and terms; make it specific to THIS project\. It should be the kind of question: "What is one small, specific detail that shows the stakes\?"\. Do not copy it; do not ask anything already asked\. Stay with ideas, explanations and questions: their prose, dialogue and lines are theirs alone, so give none of your own\.$/);
  assert.ok(!/Conventions/.test(briefFor({ plan, state: filled(WRITER), ctx, libraryNotes: ['x note'] })), 'no conventions without a form or genre');
  // a turn that does not ask is a collaborator's turn: answer what they said, then ONE suggestion that says it is NIE's (it may bring something new, in the form of a what-if, never a line of their story)
  assert.match(briefFor({ plan: { act: 'reflect' }, state, ctx }), /This turn:\nTalk like a collaborator who is listening\. In at most three short sentences: first answer what they just said[^\n]*then give ONE suggestion of your own[^\n]*begin it with "What if", "You could", "Maybe" or "One angle:"[^\n]*never a line of their story and never stated as if it already happened\. Do not retell their idea or say how good it is\. Ask no other question\./)
  assert.match(briefFor({ plan: { act: 'serve' }, state, ctx }), /This turn:\nAnswer what they asked \(or give what they asked for\)\. Do not interview them this turn\. Stay with ideas, explanations and questions/);
  assert.match(briefFor({ plan: { act: 'ask', slot: null, question: KIND_QUESTIONS[2] }, state: emptyAgentState(), ctx }), /ask exactly ONE question about what kind of piece they are making/);
  assert.doesNotMatch(briefFor({ plan: { act: 'reflect' }, state: with_(), ctx }), /Nothing recorded|What you understand so far/, 'nothing recorded: no block (a reply said "nothing recorded yet" to the writer)');
  for (const act of ['ask', 'reflect', 'serve']) assert.ok(!/\b(?:write|draft|compose|rewrite)\b/i.test(briefFor({ plan: { ...plan, act }, state: bigState(), ctx })), 'never an instruction to write the writer\'s text');
});

// ── review fixes: each of these failed before ─────────────────────────────────

test('a shrug ("I don\'t know", "no idea what to put here", "skip that one") is never filed as the writer\'s answer; terse answers and short names are', async () => {
  for (const t of ["I don't know", 'No idea what to put here', "I'm not sure what stands in the way", 'not sure yet', "I haven't decided that yet", 'skip that one', 'Hard to say honestly', "I'll think about it", 'no clue really', 'idk', 'you tell me']) {
    assert.equal(isShrug(t), true, t);
    assert.equal(isAnswer(t), false, t);
  }
  // a hedge or a statement after the shrug is an answer, and so is a story sentence that merely contains the words
  for (const t of ["I'm not sure, maybe the sea", "I don't know. Her brother died.", 'He wants to skip town', 'She has no idea where her brother went']) assert.equal(isShrug(t), false, t);
  // everyday imperatives are how writers state a goal, so they are answers; only a request to NIE is a command
  for (const t of ['Find her brother', 'Save the village', 'Make peace with her father', 'Tell the truth about the ferry', 'Jo', 'Ed', 'What she really wants is her brother back.']) assert.equal(isAnswer(t), true, t);
  for (const t of ['Give me some twists', 'Write a scene where she leaves', 'Find a name for the ferry', 'Show me three options', 'Why?', 'ok']) assert.equal(isAnswer(t), false, t);
  // the rules do not record a shrug as the answer to the question NIE asked
  const asked = with_({ pending: { kind: 'question', slot: 'want', text: 'What does Mara want?', turn: 1 } });
  assert.deepEqual((await extractSlots({ message: "I don't know", state: asked, ctx, pendingSlot: 'want' })).updates, []);
  assert.deepEqual((await extractSlots({ message: 'Find her brother', state: asked, ctx, pendingSlot: 'want' })).updates, [{ slot: 'want', value: 'Find her brother' }]);
  // and a model that "extracts" the shrug is not believed either
  const chat = fakeModel({ updates: [{ slot: 'want', value: "I don't know" }], extra: '' });
  assert.deepEqual((await extractSlots({ message: "I don't know", state: asked, ctx, pendingSlot: 'want', chat })).updates, []);
});

test('grounding also refuses a value that flips what the writer said ("not" dropped or invented) or names something they never named', async () => {
  const run = async (value, message) => {
    const out = await extractSlots({ message, state: with_(), ctx, chat: fakeModel({ updates: [{ slot: 'want', value }], extra: '' }) });
    return out.by === 'model' ? out.updates : [];
  };
  assert.equal((await run('Mara wants to find her brother', "Mara doesn't want to find her brother")).length, 0, 'the "not" was dropped');
  assert.equal((await run('Mara wants to find her brother', 'Mara never wants to find her brother')).length, 0);
  assert.equal((await run('Mara does not want to find her brother', 'Mara wants to find her brother')).length, 0, 'a "not" the writer never said');
  assert.equal((await run("Mara doesn't want to find her brother", "Mara doesn't want to find her brother")).length, 1, 'kept when the writer said it');
  assert.equal((await run('Mara wants to find her brother', 'Mara wants to find her brother and nobody will stop her')).length, 1, 'a negation elsewhere in the message does not matter');
  assert.equal((await run('Mara wants to find her brother Tomas', 'Mara wants to find her brother')).length, 0, 'a name the writer never gave');
  assert.equal((await run('Mara wants to find her brother Tomas', 'Mara wants to find her brother Tomas')).length, 1);
});

test('parseOfferReply: "keep going" is not a yes, a half-yes is not a yes, and "let me add something" waits for the detail', () => {
  for (const t of ['keep going', 'Keep going', 'keep asking', 'keep it going', 'keep going with the questions please', 'yes keep going', 'save it for later', 'save it for later please', 'not done yet', 'not finished', "i'm not done", 'it needs more work first', "that's wrong", 'incorrect', 'that is not right']) {
    assert.deepEqual(parseOfferReply(t), { decision: 'no', detail: '' }, t);
  }
  for (const t of ['good question', 'nice try', 'keep it short', 'keep the tone']) assert.equal(parseOfferReply(t).decision, 'unclear', t);
  for (const t of ['let me add something', 'add something', 'also, one more thing', 'I want to add a few more details']) assert.deepEqual(parseOfferReply(t), { decision: 'unclear', detail: '', wantsToAdd: true }, t);
  assert.deepEqual(parseOfferReply('no wait, also she has a limp'), { decision: 'add', detail: 'she has a limp' });
  assert.deepEqual(parseOfferReply('Let me add more details: she limps'), { decision: 'add', detail: 'she limps' }, 'the composer chip\'s own words are the lead-in');
  assert.equal(parseOfferReply('keep her limp as a detail').decision, 'add');
  for (const t of ['sure why not', 'fine, whatever', 'I guess so', 'yes sir', 'sure thing', 'keep it on my idea board']) assert.equal(parseOfferReply(t).decision, 'yes', t);
});

test('commands are said TO NIE: story sentences and quoted dialogue never change the mode, keep the idea, or start a new one', () => {
  for (const t of ['The detective will not stop asking questions about the missing girl.', 'He wants her to stop asking questions', '"Stop asking questions!" she snapped.', 'she begins to ask questions again after the funeral', 'Mara asks me questions in a dream', 'I keep asking myself why']) assert.equal(parseStyleCommand(t), null, t);
  for (const t of ['Stop asking questions', 'no more questions please', 'Can you stop with the questions?', 'please ask me questions', 'You can ask again', 'one at a time, please', 'ok, interview me']) assert.notEqual(parseStyleCommand(t), null, t);
  assert.equal(signalsDone('"That\'s it," she said, and left.'), false);
  assert.equal(parseKeepCommand('"Keep it," she said.'), false);
  assert.equal(parseShelfCommand('"Bring back the earlier idea," she said.'), null);
  for (const t of ['Another idea for the ending: she burns the key.', 'New idea for the middle, the ferry sinks', 'Another idea is that the bell is hers', 'Another piece of the puzzle is the letter she finds.', 'A different story emerges in the second act.', 'Another story she tells is about the sea.', 'Forget that she ever left', 'Forget it', 'He wants to start over in a new town.', 'Starting over, the village rebuilds the pier.', '"Start over," she said.', "Let's switch to the brother's point of view"]) assert.equal(startsNewIdeaExplicitly(t), false, t);
  for (const t of ['Another idea: a robot who paints sunsets', 'New idea!', 'Different story: a heist on a train', 'I have a new idea about a robot who paints', "Let's switch to a poem", 'Forget that, we are doing a poem', 'Start over', 'A new story about a ferry captain']) assert.equal(startsNewIdeaExplicitly(t), true, t);
});

test('isNewIdea: a detail that happens to contain "a ... that" or "a ... who" is not a fresh pitch; a pitch that opens with one still is', () => {
  const s = filled({ premise: 'A lighthouse keeper named Mara hears a drowned bell in the fog every winter night', protagonist: 'Mara is a lighthouse keeper who never leaves the island', want: 'Mara wants to find her brother who vanished on the ferry', setting: 'a harbour town in winter fog' });
  for (const t of [
    'In this story the villagers have a ritual that nobody remembers the origin of anymore.',
    'There is a ferry captain who refuses to dock whenever the weather turns, and the villagers resent him for it.',
    'There is also a priest that drinks, and an old schoolteacher who keeps asking about the tides every Sunday.',
    'A stranger arrives on the last boat of the season carrying a crate that she refuses to let anyone open.',
    'Everyone in the village has a nickname that the others gave them after something embarrassing happened.',
    'She is a woman who keeps ledgers of everything the village has lost and never throws away a single receipt.',
  ]) assert.equal(isNewIdea(t, s), false, t);
  for (const t of [
    'I also want to work on an article about why small public libraries are turning into community centres everywhere.',
    'A detective who cannot remember yesterday investigates the disappearance of her own memories across the city.',
    'I have a crazy idea about a robot who paints sunsets for lonely sailors on a dying planet far away.',
  ]) assert.equal(isNewIdea(t, s), true, t);
  assert.equal(isNewIdea('I have an idea for the ending where the ferry sinks and nobody on board is ever mentioned again by the town', s), false, '"an idea for the ending" is about this idea');
});

test('looksLikeQuestion and looksLikeCommand: a statement that opens with a question word, and everyday imperatives, are not questions or commands', () => {
  for (const t of ['What she really wants is her brother back.', 'Who she is stays hidden until the end.', 'When the tide goes out the whole harbour smells of iron.', 'Do not trust the narrator', 'Find her brother', 'Save the village', 'Tell the truth about the ferry']) {
    assert.equal(looksLikeQuestion(t), false, t);
    assert.equal(looksLikeCommand(t), false, t);
  }
  for (const t of ['what happens next', 'What is the ending?', 'who would she trust', 'How do I stop asking myself questions', 'Which parts will you save', 'What if the ferry sinks', 'Does she tell anyone', 'Is it a story about grief?']) assert.equal(looksLikeQuestion(t), true, t);
  for (const t of ['Give me some twists', 'Write a scene where they argue', 'Suggest a title', 'Find a name for the ferry', 'Show me three options', 'Tell me more']) assert.equal(looksLikeCommand(t), true, t);
});

test('askable: a prerequisite the writer has declined twice, or a slot asked a moment ago, does not hide the rest of the interview', () => {
  const st = with_({ slots: rec({ premise: 'a bell' }) });
  // protagonist is not filled, so `want` (after protagonist) is blocked...
  assert.deepEqual(askable(st, ctx).map((s) => s.id).includes('want'), false);
  // ...unless the writer has passed on protagonist twice
  assert.ok(askable(st, ctx, undefined, { passed: new Set(['protagonist']), exclude: new Set(['protagonist']) }).some((s) => s.id === 'want'));
  // everything free is excluded: the blocked ones become askable rather than nothing
  const free = askable(st, ctx).map((s) => s.id);
  const rest = askable(st, ctx, undefined, { exclude: new Set(free) });
  assert.ok(rest.length > 0 && rest.every((s) => !free.includes(s.id)));
  // and the planner keeps asking after the writer passes on the same prerequisite twice
  const asked = (slotId, turn) => ({ slot: slotId, text: `Earlier question about ${slotId} ${turn}?`, type: 'open', turn, answered: false, skipped: true });
  const skipped = with_({ turn: 20, slots: rec({ premise: 'a bell', setting: 'a harbour', tone: 'quiet' }), sinceAsk: 5, asked: [asked('protagonist', 1), asked('protagonist', 2)] });
  const plan = planTurn({ state: skipped, info: { act: 'info', updated: [], words: 10, signalsDone: false }, ctx, seed: 's' });
  assert.equal(plan.act, 'ask');
  assert.notEqual(plan.slot, 'protagonist', 'not the slot they passed on twice');
  assert.ok(plan.slot, 'but something else');
  // a chain where everything follows the slot they passed on: before, nothing at all could be asked
  const chain = miniCtx('story', [slot('seed', 'Seed', 'the seed', { core: true, weight: 3, next: ['one'] }), slot('one', 'One', 'the first thing', { core: true, weight: 2, after: ['seed'], next: ['two'] }), slot('two', 'Two', 'the second thing', { core: true, weight: 2, after: ['one'] }), slot('three', 'Three', 'the third thing', { core: true, weight: 2, after: ['two'] }), slot('four', 'Four', 'the fourth thing', { weight: 1, after: ['three'] }), slot('five', 'Five', 'the fifth thing', { weight: 1, after: ['four'] }), slot('six', 'Six', 'the sixth thing', { weight: 1, after: ['five'] }), slot('seven', 'Seven', 'the seventh thing', { weight: 1, after: ['six'] })]);
  const stuck = with_({ turn: 20, sinceAsk: 5, asked: [asked('seed', 1), asked('seed', 2)] });
  const next = planTurn({ state: stuck, info: { act: 'info', updated: [], words: 10, signalsDone: false }, ctx: chain, seed: 's' });
  assert.equal(next.act, 'ask', 'the interview goes on');
  assert.equal(next.slot, 'one');
});

test('undoCommit never removes or restores an Idea Board entry the writer has edited since it was kept', () => {
  const project = projectWith({});
  const { state } = commitIdea(project, keptState(), ctx);
  boardOf(project)[0].text += ' (my own edit)';
  const undone = undoCommit(project, state, ctx);
  assert.equal(boardOf(project).length, 1, 'their edited entry stays');
  assert.match(boardOf(project)[0].text, /\(my own edit\)$/);
  assert.equal(undone.removed.board, 'edited');
  assert.ok(undone.removed.characters.length > 0, 'but the memory NIE added is still taken back');
  // the same for a note the writer wrote on it, and for an entry the writer deleted
  const p2 = projectWith({});
  const c2 = commitIdea(p2, keptState(), ctx);
  boardOf(p2)[0].note = 'my note';
  assert.equal(undoCommit(p2, c2.state, ctx).removed.board, 'edited');
  const p3 = projectWith({});
  const c3 = commitIdea(p3, keptState(), ctx);
  p3.brainstorm.board.length = 0;
  assert.equal(undoCommit(p3, c3.state, ctx).removed.board, 'gone');
});

test('keeping an empty sheet says so and leaves no offer waiting for an answer', () => {
  const project = projectWith({});
  const waiting = { ...emptyAgentState(), pending: { kind: 'offer', turn: 3, partial: false }, sinceOffer: 2 };
  const out = commitIdea(project, waiting, ctx);
  assert.equal(out.result.empty, true);
  assert.equal(out.state.pending, null);
  assert.match(confirmText(out.result), /nothing recorded yet/);
  assert.equal(boardOf(project).length, 0);
});

test('peopleIn: only a name or a phrase that opens with an article or a possessive is a person; a sentence fragment is never a character', () => {
  assert.deepEqual(peopleIn('My character is Ines, a retired ferry captain who drinks too much and cannot stop counting the boats that never come back').map((p) => p.name), ['Ines']);
  assert.deepEqual(peopleIn('Mara and her brother Tomas, who left on the last ferry and never wrote back').map((p) => p.name), ['Mara', 'Tomas']);
  assert.deepEqual(peopleIn('I want to tell her story'), []);
  assert.deepEqual(peopleIn('it is about a girl and her dog and how they survive the winter').map((p) => p.name), ['dog']);
  assert.deepEqual(peopleIn('a woman who is afraid of water, her mother, and a talking cat called Biscuit').map((p) => p.name), ['woman', 'mother', 'Biscuit']);
});

test('the shelf remembers what was asked of the idea, bidirectional overrides are stripped, and the brief tells the model to keep the writer\'s text theirs', () => {
  const shelved = sanitizeAgentState({ shelf: [{ slots: { premise: { value: 'a bell', turn: 1, via: 'said' } }, asked: [{ slot: 'want', text: 'What does Mara want?', turn: 2 }, { text: 5 }] }] });
  assert.deepEqual(shelved.shelf[0].asked.map((a) => a.text), ['What does Mara want?']);
  assert.equal(sanitizeAgentState({ slots: { premise: { value: 'a ‮bell‬ rings', turn: 1, via: 'said' } } }).slots.premise.value, 'a bell rings');
  for (const act of ['ask', 'reflect', 'serve']) assert.match(briefFor({ plan: { ...askPlan, act }, state: filled(WRITER), ctx }), /their prose, dialogue and lines are theirs alone/);
});

test('detectProject skips the regex for keywords that are nowhere in the text without changing what matches (plurals, hyphens, spaces, case)', () => {
  const packs = { forms: [{ id: 'pb', label: 'Picture book', match: ['picture-book', 'board book'], baseKinds: ['story'], add: [] }, { id: 'sn', label: 'Sonnet', match: ['sonnet'], baseKinds: ['poem'], add: [] }], genres: [] };
  assert.equal(detectProject('a picture book about bears', { packs }).form, 'pb');
  assert.equal(detectProject('My Picture-Book is about bears', { packs }).form, 'pb');
  assert.equal(detectProject('two BOARD   BOOKS for toddlers', { packs }).form, 'pb');
  assert.equal(detectProject('fourteen Sonnets in a row', { packs }).form, 'sn');
  assert.equal(detectProject('a sonneteer at work', { packs }).form, null, 'a whole word only');
});

test('extraction rules: the main character is one real name, never a place, a date, or two words NIE glued together', async () => {
  const who = async (message) => (await extractSlots({ message, state: with_(), ctx })).updates.find((u) => u.slot === 'protagonist')?.value ?? null;
  assert.equal(await who('A baker in Lagos discovers her bread predicts the weather.'), null, '"in Lagos" is where, not who');
  assert.equal(await who('It is a story about Christmas in London where nobody speaks to anyone.'), null);
  assert.equal(await who('On Monday the ferry stops running and Mara has to decide what to do about it.'), 'Mara');
  assert.equal(await who('The story follows Mara and Corin across Europe in 1923 during the strikes.'), 'Mara', 'one name, as the writer wrote it');
  assert.equal(await who('My novel is set in Lagos and follows a baker named Ada.'), 'Ada');
  for (const m of ['The story follows Mara and Corin across Europe in 1923 during the strikes.', 'My novel is set in Lagos and follows a baker named Ada.']) {
    const out = await extractSlots({ message: m, state: with_(), ctx });
    for (const u of out.updates) assert.ok(m.includes(u.value), `"${u.value}" is a piece of what the writer typed`);
  }
});

test('extraction rules: a sentence that says which slot it is for goes there, whatever NIE asked; the rest stays with the question', async () => {
  const asked = (slotId) => with_({ pending: { kind: 'question', slot: slotId, text: 'A question?', turn: 1 } });
  const run = async (message, pendingSlot = null, state = with_()) => Object.fromEntries((await extractSlots({ message, state: pendingSlot ? asked(pendingSlot) : state, ctx, pendingSlot })).updates.map((u) => [u.slot, u.value]));
  assert.deepEqual(await run('The ending is that the mayor did it, but for a kind reason.', 'setting'), { ending: 'The ending is that the mayor did it, but for a kind reason' });
  assert.deepEqual(await run('She wants to clear the name of her friend Tom, who everyone thinks did it.', 'obstacle'), { want: 'She wants to clear the name of her friend Tom, who everyone thinks did it' });
  assert.deepEqual(await run('It is set in the village of St Mawes in the 1950s.', 'tone'), { setting: 'It is set in the village of St Mawes in the 1950s' });
  assert.deepEqual(await run('If she fails Tom goes to prison and the village loses its only bakery.', 'tone'), { stakes: 'If she fails Tom goes to prison and the village loses its only bakery' });
  assert.deepEqual(await run('I think it should be warm and funny but with a real sadness underneath.', 'ending'), { tone: 'I think it should be warm and funny but with a real sadness underneath' });
  assert.deepEqual(await run('Theme: loyalty and what you owe your friends', 'tone'), { theme: 'loyalty and what you owe your friends' }, 'a label and a colon names the slot, and is not part of the value');
  assert.deepEqual(await run('The tone is quiet and haunted.'), { tone: 'The tone is quiet and haunted' }, 'with nothing asked, too');
  // several sentences, several slots; what is not routed is still the answer to the question
  assert.deepEqual(await run('It is set in a harbour town in 1923. The theme is forgiveness.', 'obstacle'), { setting: 'It is set in a harbour town in 1923', theme: 'The theme is forgiveness' });
  assert.deepEqual(await run('The sea and her own fear of leaving the island. The theme is forgiveness.', 'obstacle'), { theme: 'The theme is forgiveness', obstacle: 'The sea and her own fear of leaving the island' });
  // an ordinary answer, a sentence about something else, and a different "theme" are not routed
  assert.deepEqual(await run('The sea and her own fear of leaving the island.', 'obstacle'), { obstacle: 'The sea and her own fear of leaving the island' });
  assert.deepEqual(await run('The theme park closed years ago and nobody goes there anymore.', 'obstacle'), { obstacle: 'The theme park closed years ago and nobody goes there anymore' });
  assert.deepEqual(await run('Her ending is a mystery to everyone, including her mother.', 'obstacle'), { obstacle: 'Her ending is a mystery to everyone, including her mother' }, '"her" does not name the story\'s ending');
});

test('nameIn and the main character: a sentence opener or an adjective is not a name', () => {
  for (const v of ['Also the oven is older than the village and has a name', 'Maybe she knows more than she says', 'Meanwhile the ferry stops running']) assert.equal(nameIn(v), null, v);
  assert.equal(nameIn('Also Corin knows'), 'Corin');
  assert.equal(nameIn('Then Mara leaves'), 'Mara');
  assert.deepEqual(peopleIn('Also the oven is older than the village and has a name'), []);
});

test('memory files a theme and a place without the words that introduced them, and the board keeps the writer\'s sentence', () => {
  const project = projectWith({});
  const state = filled({ premise: 'A baker finds a body', protagonist: 'Ada Penhale', theme: 'The theme is loyalty and what you owe your friends', setting: 'It is set in the village of St Mawes in the 1950s' }, { turn: 6 });
  commitIdea(project, state, ctx);
  assert.deepEqual(project.memory.themes, ['loyalty and what you owe your friends']);
  assert.deepEqual(project.conversation.workingPremise.settings, ['the village of St Mawes in the 1950s']);
  assert.match(boardOf(project)[0].text, /Theme: The theme is loyalty and what you owe your friends/);
});

test('planTurn does not offer an idea again that was kept and has not changed since; a change makes it worth offering again', () => {
  const project = projectWith({});
  const kept = { ...commitIdea(project, keptState(), ctx).state, sinceOffer: 9 };
  const plan = (state, info = {}) => planTurn({ state, info: { act: 'info', updated: [], words: 10, signalsDone: false, ...info }, ctx, seed: 's' });
  assert.notEqual(plan(kept).act, 'offer', 'nothing new to keep');
  assert.notEqual(plan(kept, { signalsDone: true }).act, 'offer', '"that\'s it" after a keep does not repeat the recap');
  const changed = setSlot(kept, 'tone', 'quiet and haunted', { turn: 7 });
  assert.equal(plan(changed).act, 'offer');
  assert.equal(plan(changed, { signalsDone: true }).act, 'offer');
});

test('the extraction call is skipped for a shrug or three words or fewer: the rules read those just as well and a local model call takes seconds', async () => {
  const seen = [];
  const chat = fakeModel({ updates: [], extra: '' }, seen);
  const asked = with_({ pending: { kind: 'question', slot: 'want', text: 'What does Mara want?', turn: 1 } });
  for (const message of ["I don't know", 'no idea what to put here', 'her brother', 'Mara']) await extractSlots({ message, state: asked, ctx, pendingSlot: 'want', chat });
  assert.equal(seen.length, 0);
  const out = await extractSlots({ message: 'she wants to find her brother', state: asked, ctx, pendingSlot: 'want', chat });
  assert.equal(seen.length, 1);
  assert.ok(out.updates.length > 0, 'and the rules still ran when the model said nothing');
  assert.deepEqual((await extractSlots({ message: 'her brother', state: asked, ctx, pendingSlot: 'want', chat })).updates, [{ slot: 'want', value: 'her brother' }], 'a short answer is still filed');
});

test('right after a question, a short answer with its article ("the sea", "her brother", "a key") is an answer; fillers still are not', async () => {
  for (const t of ['the sea', 'her brother', 'a key', 'maybe the sea', 'fear']) assert.equal(isAnswer(t, { asked: true }), true, t);
  for (const t of ['ok', 'yes', 'thanks', 'maybe', 'the', 'idk', 'Why?', 'give me ideas']) assert.equal(isAnswer(t, { asked: true }), false, t);
  assert.equal(isAnswer('the sea'), false, 'out of the blue it is not enough to go on');
  const asked = with_({ pending: { kind: 'question', slot: 'obstacle', text: 'What stands in the way?', turn: 1 } });
  assert.deepEqual((await extractSlots({ message: 'the sea', state: asked, ctx, pendingSlot: 'obstacle' })).updates, [{ slot: 'obstacle', value: 'the sea' }]);
  assert.deepEqual((await extractSlots({ message: 'the sea', state: with_(), ctx })).updates, [], 'with nothing asked, nothing is filed');
});

test('extraction grounding: no new word, no swapped roles, no negation added or dropped', async () => {
  const run = async (value, message) => {
    const out = await extractSlots({ message, state: with_(), ctx, chat: fakeModel({ updates: [{ slot: 'premise', value }], extra: '' }) });
    return out.by === 'model' ? out.updates.filter((u) => u.slot === 'premise') : []; // (a name the rules are sure of is added to its own part; only what the model kept is counted here)
  };
  const m = 'Corin hates Mara because she took the lighthouse from his father.';
  assert.equal((await run('Corin hates Mara', m)).length, 1);
  assert.equal((await run('Mara hates Corin', m)).length, 0, 'the same words in the other order say something else');
  assert.equal((await run('Corin secretly hates Mara', m)).length, 0, '"secretly" is not theirs');
  assert.equal((await run('she took the lighthouse from his father', m)).length, 1);
  const n = 'The story is set in Lagos in 1923, and the baker Ada never sells a loaf to the mayor.';
  assert.equal((await run('set in Lagos in 1923', n)).length, 1);
  assert.equal((await run('set in not Lagos in 1923', n)).length, 0, 'a "not" from nowhere, even when the message has a "never" of its own');
  assert.equal((await run('the baker Ada sells a loaf to the mayor', n)).length, 0, 'the "never" was dropped');
  assert.equal((await run('the baker Ada never sells a loaf to the mayor', n)).length, 1);
});
