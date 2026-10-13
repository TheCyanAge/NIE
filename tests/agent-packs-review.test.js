import test from 'node:test';
import assert from 'node:assert/strict';
import story from '../apps/web/src/engine/agent/packs/story.js';
import character from '../apps/web/src/engine/agent/packs/character.js';
import world from '../apps/web/src/engine/agent/packs/world.js';
import { fallbackValues, fillQuestion } from '../apps/web/src/engine/agent/packs/schema.js';
import { slotForRole } from '../apps/web/src/engine/agent/sheet.js';

/**
 * What the shared validator cannot see about the story, character and world packs. Each test below failed on the first version of the packs:
 * the validator only checks that a question is well formed, not that it can be asked of an EMPTY slot (a slot is only asked while nothing is recorded
 * for it), that the answer it gets is usable as a placeholder in later questions, or that the extractor can read the slot's hint.
 */

const PACKS = { story, character, world };
const slotsOf = (pack) => pack.slots.map((s) => ({ ...s, questions: s.questions.map((q) => ({ ...q, filled: fillQuestion(q.text, fallbackValues()) })) }));
const every = (fn) => {
  for (const [kind, pack] of Object.entries(PACKS)) for (const slot of slotsOf(pack)) for (const q of slot.questions) fn(`${kind}/${slot.id}`, q);
};

test('every hint fits in what the extractor shows the model (it keeps the first 120 characters, so a longer hint is cut mid-word)', () => {
  for (const [kind, pack] of Object.entries(PACKS)) for (const s of pack.slots) assert.ok(s.hint.length <= 120, `${kind}/${s.id}: hint is ${s.hint.length} characters: "${s.hint}"`);
});

test('a slot never uses the placeholder that stands for itself: it is asked while empty, so it could only ever show the neutral fallback', () => {
  for (const [kind, pack] of Object.entries(PACKS)) {
    for (const slot of pack.slots) {
      for (const role of ['who', 'place', 'thing', 'want', 'other', 'theme']) {
        if (slotForRole(pack.slots, role)?.id !== slot.id) continue;
        for (const q of slot.questions) assert.ok(!q.text.includes(`{${role}}`), `${kind}/${slot.id}: "${q.text}" uses {${role}}, which is this slot's own (empty) value`);
      }
    }
  }
});

test('the world pack leaves {place} alone: its places slot holds a list of places, and the engine cuts a list into fragments such as "Three" or "There\'s"', () => {
  for (const s of world.slots) for (const q of s.questions) assert.ok(!/\{place\}/.test(q.text), `world/${s.id}: "${q.text}"`);
});

test('the slots whose answer becomes a placeholder ask for the thing itself: a person for the main character, so that "What does {who} want?" never reads "What does the rushes in want?"', () => {
  const PERSON = /\b(who|whose|whom|called|call|name|names|introduce|living)\b/i;
  for (const [pack, id] of [[story, 'protagonist'], [character, 'role']]) {
    const slot = pack.slots.find((s) => s.id === id);
    assert.equal(slot.questions.length >= 8, true);
    for (const q of slot.questions) assert.match(q.text, PERSON, `${pack.kind}/${id}: "${q.text}" would be answered with a trait, not with who it is`);
  }
});

test('a slot that may not exist for this writer (a secret, an opposing person, a recurring image, a hidden truth) is never asked as if it did', () => {
  const HEDGED = /\b(if|whether|anyone|anything|is there|are there|might)\b|\bor (?:is|are|does|do|nobody|nothing|no one)\b/i;
  for (const [pack, id] of [[character, 'secret'], [story, 'opposition'], [story, 'motifs'], [world, 'secrets']]) {
    for (const q of pack.slots.find((s) => s.id === id).questions) assert.match(q.text, HEDGED, `${pack.kind}/${id}: "${q.text}" takes for granted what the writer has not said`);
  }
});

test('most questions ask for the thing itself: a slot is only asked while empty, so "how early should a reader learn it?" or "how serious is it?" would be answered without ever saying what it is', () => {
  // the openers that ask only about the timing or the size of something the writer has not named yet; a few stay where the size IS the answer
  // (how old the history is, how large the map is, how strict a culture is)
  const PROPERTY_ONLY = /^(?:should a reader|when should a reader|at what point|how and when|how early|how soon|how (?:much|many|long|often|strong|serious|big|sharply|evenly|loud|loudly|wide|fast|tidy|old|close|well|concentrated|strict|steep|large|foreign|hard|heavy|far)\b|where should a reader|whose (?:view|opinion)|do you plan|roughly how)/i;
  const ASKS_FOR_IT = /(?:,| and|:) (?:what|which|who|where|whose)\b|\b(?:what|which) (?:is|are|was|were|does|do|would)\b/i;
  let total = 0;
  const only = [];
  every((where, q) => {
    total++;
    if (PROPERTY_ONLY.test(q.text) && !ASKS_FOR_IT.test(q.text.replace(PROPERTY_ONLY, ''))) only.push(`${where}: ${q.filled}`);
  });
  assert.ok(only.length / total <= 0.08, `${only.length} of ${total} questions ask only how much or when, never what:\n${only.join('\n')}`);
});

test('no question refers to something it never mentions ("pay it", "how old is it", "the people there", "once they have it")', () => {
  const NOTHING_TO_POINT_AT = [
    /\bpay it\b/i, /\bold is it\b/i, /\bonce they have it\b/i, /\breact to it\b/i, /\bthe people there\b/i, /\bpower there\b/i, /\b(?:these|those) (?:groups|particular people)\b/i,
    /\bwant from them\?/i, /\bwho live here\b/i, /\bthat (?:power|price|tool)\b/i, /\bdoes that change reach\b/i,
  ];
  every((where, q) => { for (const re of NOTHING_TO_POINT_AT) assert.ok(!re.test(q.filled), `${where}: "${q.filled}" matches ${re}`); });
});

test('a question does not talk about the slot\'s own subject as if the writer had already named it ("the flaw", "the cost", "the obstacle")', () => {
  const BACK = {
    'character/flaw': /\bthe flaw\b/i, 'character/secret': /\bthe secret\b/i, 'character/want': /\b(?:the|this) want\b/i, 'character/fear': /\b(?:this|the) fear\b/i,
    'world/cost': /\bthe (?:cost|price)\b/i, 'story/obstacle': /\bthe obstacle\b/i, 'world/difference': /\bthe (?:main )?difference\b/i,
  };
  every((where, q) => { if (BACK[where]) assert.ok(!BACK[where].test(q.filled), `${where}: "${q.filled}"`); });
});

test('the kind packs assume no particular world: no Tuesdays, pockets, money, dinners or market days for a character that may be a dragon or a ghost', () => {
  const EVERYDAY = /\b(tuesday|pockets?|spend money|dinner|supper|kitchens?|market day|harvest|fifteen)\b/i;
  every((where, q) => assert.ok(!EVERYDAY.test(q.filled), `${where}: "${q.filled}"`));
});

test('no craft jargon goes into a question without a plain word beside it', () => {
  every((where, q) => assert.ok(!/\b(motif|motifs|protagonist|antagonist|inciting incident)\b/i.test(q.filled), `${where}: "${q.filled}"`));
});

test('openings vary: no first word starts more than 30% of a pack\'s questions, and What plus How stay under half', () => {
  for (const [kind, pack] of Object.entries(PACKS)) {
    const firsts = pack.slots.flatMap((s) => s.questions.map((q) => fillQuestion(q.text, fallbackValues()).split(/\s+/)[0].toLowerCase()));
    const count = (w) => firsts.filter((f) => f === w).length;
    const top = Math.max(...new Set(firsts).values().map(count));
    assert.ok(top / firsts.length <= 0.3, `${kind}: one first word opens ${((top / firsts.length) * 100).toFixed(0)}% of the questions`);
    assert.ok((count('what') + count('how')) / firsts.length <= 0.5, `${kind}: What + How open ${(((count('what') + count('how')) / firsts.length) * 100).toFixed(0)}%`);
    assert.ok(firsts.includes('when') && firsts.includes('where') && firsts.includes('who'), `${kind}: uses When, Where and Who as openers`);
  }
});

test('the story and character packs still use the writer\'s own names and terms in a good share of their questions (the world pack cannot, see above)', () => {
  for (const kind of ['story', 'character']) {
    const qs = PACKS[kind].slots.flatMap((s) => s.questions);
    const share = qs.filter((q) => /\{\w+\}/.test(q.text)).length / qs.length;
    assert.ok(share >= 0.35 && share <= 0.65, `${kind}: ${(share * 100).toFixed(0)}% of questions use a placeholder`);
  }
});

// ── the order NIE asks in ────────────────────────────────────────────────────
const depth = (pack, id, seen = new Set()) => {
  if (seen.has(id)) return Infinity; // a cycle
  const slot = pack.slots.find((s) => s.id === id);
  return slot.after.length ? 1 + Math.max(...slot.after.map((a) => depth(pack, a, new Set([...seen, id])))) : 0;
};

test('what has to be known first never loops, comes earlier in the pack, and never makes a core slot wait behind a long chain or behind a slot that is not core', () => {
  for (const [kind, pack] of Object.entries(PACKS)) {
    const index = new Map(pack.slots.map((s, i) => [s.id, i]));
    for (const s of pack.slots) {
      for (const a of s.after) assert.ok(index.get(a) < index.get(s.id), `${kind}/${s.id} waits for ${a}, which comes later in the pack`);
      assert.ok(Number.isFinite(depth(pack, s.id)), `${kind}/${s.id}: loop in "after"`);
      if (!s.core) continue;
      for (const a of s.after) assert.ok(pack.slots.find((x) => x.id === a).core, `${kind}/${s.id} is core but waits for ${a}, which is not`);
      // a writer who shrugs at one question must not hide the rest of the core from NIE
      assert.ok(depth(pack, s.id) <= 2, `${kind}/${s.id} waits behind a chain of ${depth(pack, s.id)} slots`);
    }
  }
});
