import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { KINDS, QUESTION_TYPES, addonProblems, fillQuestion, packProblems, questionProblems, sampleValues, slotProblems } from '../apps/web/src/engine/agent/packs/schema.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../apps/web/src/engine/agent/packs');

const good = [
  ['What does {who} want badly enough to do something they would regret?', 'open'],
  ['Is {who} running toward something, or away from it?', 'either'],
  ['What if {who} gets exactly what they want in the first act: what breaks?', 'whatif'],
  ['You said {who} hides this: what would it cost them if it came out?', 'probe'],
  ['What is the smallest scene that would show {who} wanting this?', 'concrete'],
  ['What would {who} refuse to give up, even to get {want}?', 'constraint'],
  ['What should a reader feel in the first page of {place}?', 'reader'],
  ['How does {who} change when {other} is in the room?', 'contrast'],
].map(([text, type]) => ({ text, type }));
const slot = (over = {}) => ({ id: 'want', label: 'What they want', core: true, weight: 3, hint: 'what the main character is after, in their own terms', after: [], next: [], questions: good, ...over });

test('placeholders fall back to neutral phrases and take the writer\'s own material when known', () => {
  assert.equal(fillQuestion('What does {who} want?'), 'What does your main character want?');
  assert.equal(fillQuestion('{who} wants {want}: what is in the way?', sampleValues()), 'Mara wants to find her brother: what is in the way?');
  assert.equal(fillQuestion('{place} is where it starts, but where does it end?', {}), 'Your setting is where it starts, but where does it end?');
});

test('a good slot passes and every kind of question is recognised', () => {
  assert.deepEqual(slotProblems(slot()), []);
  assert.equal(QUESTION_TYPES.length, 10);
  assert.equal(KINDS.length, 8);
});

test('the validator rejects what would make NIE sound the same, put words in a writer\'s mouth, or write for them', () => {
  const bad = (text, type = 'open') => questionProblems({ text, type }).join(' | ');
  assert.match(bad('Which of these ideas resonates with your vision?'), /stock/);
  assert.match(bad('What do you think?'), /words|stock/);
  assert.match(bad('Great premise! What does {who} want?'), /praise/);
  assert.match(bad('What does {who} want? And why?'), /exactly one question/);
  assert.match(bad('What does {who} say when they mean "no"?'), /quotation/);
  assert.match(bad('Write the opening line for {who}?'), /produce text/);
  assert.match(bad('What does {who} want'), /question mark/);
  assert.match(bad('What does {nobody} want?'), /unknown placeholder/);
  assert.match(bad('What does the the {who} want?'), /reads badly/);
  assert.match(bad('What does {who} want?', 'nonsense'), /unknown type/);
  assert.deepEqual(questionProblems({ text: 'What does {who} want badly enough to do something they would regret?', type: 'open' }), []);
});

test('a slot needs enough questions, enough kinds of question, and no question said twice', () => {
  assert.match(slotProblems(slot({ questions: good.slice(0, 5) })).join('|'), /at least 8/);
  assert.match(slotProblems(slot({ questions: good.map((q) => ({ ...q, type: 'open' })) })).join('|'), /kinds of question/);
  assert.match(slotProblems(slot({ questions: [...good.slice(0, 7), { ...good[0] }] })).join('|'), /duplicate|reworded/);
  const reworded = [...good.slice(0, 7), { text: 'What does {who} want so badly that they would do something they regret?', type: 'open' }];
  assert.match(slotProblems(slot({ questions: reworded })).join('|'), /reworded/);
  assert.match(slotProblems(slot({ after: ['ghost'] }), {}).join('|'), /unknown slot/);
  assert.match(slotProblems(slot({ weight: 5 })).join('|'), /weight/);
});

test('a kind pack needs enough slots, enough core slots, and a place to start', () => {
  assert.match(packProblems({ kind: 'nonsense', slots: [] }).join('|'), /unknown kind/);
  assert.match(packProblems({ kind: 'story', intro: 'a story', noun: 'story', slots: [slot()] }).join('|'), /8 to 24 slots/);
});

// ── the real packs, wherever they have been written ──────────────────────────
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.js') && !['schema.js', 'index.js'].includes(f)) : [];
const loaded = await Promise.all(files.map(async (f) => [f, (await import(pathToFileURL(path.join(dir, f)).href)).default]));
const KIND_FILES = new Set(['story.js', 'character.js', 'world.js', 'article.js', 'essay.js', 'poem.js', 'script.js', 'other.js']);
const kindPacks = loaded.filter(([f]) => KIND_FILES.has(f));
const baseIds = Object.fromEntries(kindPacks.map(([, p]) => [p.kind, new Set(p.slots.map((s) => s.id))]));

for (const [f, pack] of kindPacks) {
  test(`pack ${f}: every slot, every question is well formed`, () => {
    assert.deepEqual(packProblems(pack), []);
    assert.equal(`${pack.kind}.js`.replace('essay.js', 'essay.js'), f);
  });
}

for (const f of ['forms.js', 'genres.js']) {
  const entry = loaded.find(([name]) => name === f);
  if (!entry) continue;
  test(`add-on packs in ${f}: every one is well formed, matches by keyword, and never reuses a slot id of the kinds it applies to`, () => {
    const list = entry[1];
    assert.ok(Array.isArray(list) && list.length >= 20, `${f} should hold at least 20 add-ons (has ${list?.length})`);
    const ids = list.map((a) => a.id);
    assert.equal(new Set(ids).size, ids.length, 'duplicate add-on ids');
    for (const a of list) {
      const kinds = a.baseKinds ?? KINDS;
      const union = new Set(kinds.flatMap((k) => [...(baseIds[k] ?? [])]));
      assert.deepEqual(addonProblems(a, { baseSlotIds: union }), []);
      for (const k of kinds) for (const s of a.add) assert.ok(!(baseIds[k] ?? new Set()).has(s.id), `${a.id}: slot id "${s.id}" is already a slot of the ${k} pack`);
    }
  });
}

test('there is a pack for every kind once the packs are written', { skip: kindPacks.length === 0 }, () => {
  assert.deepEqual(kindPacks.map(([, p]) => p.kind).sort(), [...KINDS].sort().filter((k) => kindPacks.some(([, p]) => p.kind === k)));
});
