import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { splitSections, sectionText, isHeading } from '../apps/web/src/engine/reading/sections.js';
import { words, splitParagraphs, dialogueSpans } from '../apps/web/src/engine/util/text.js';
import { loadBible } from './fixtures/story-bible.mjs';
import { makeLongText } from './fixtures/long-text.mjs';

// The story bible is the fixture that the offline model's whole-text reading is measured on (workflow notes-lab). These tests keep it honest: it must be the
// size and shape the measurements assume, and every fact in story-bible.truth.json must really be where the truth says it is.

const { text, truth } = loadBible();
const sections = splitSections(text);
const part = (n) => sectionText(text, sections[n - 1]);
const partsOf = (list) => list.map(part).join('\n');
const has = (hay, needle) => hay.toLowerCase().includes(needle.toLowerCase());
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const inOrder = (a, b) => a < b;
const paragraphs = splitParagraphs(text);

const NUMBERS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const STAMP = new RegExp(`^Year (${Object.keys(NUMBERS).join('|')}), (${MONTHS.join('|')})\\.`);

// ── size and shape ───────────────────────────────────────────────────────────

test('the bible is 9,600 to 10,400 words, however the words are counted', () => {
  const n = words(text).length;
  const m = text.match(/\S+/g).length;
  for (const count of [n, m]) assert.ok(count >= 9600 && count <= 10400, `${count} words`);
  assert.equal(truth.words, n, 'the truth records the word count');
});

test('it splits into 24 to 32 sections of a readable size, nothing dropped, no headings', () => {
  assert.ok(sections.length >= 24 && sections.length <= 32, `${sections.length} sections`);
  assert.equal(truth.sections, sections.length, 'the truth records the section count');
  assert.equal(sections.map((s) => sectionText(text, s)).join(''), text, 'the sections are the writer\'s exact text, in order');
  for (const s of sections) assert.ok(s.end - s.start >= 500 && s.end - s.start <= 3600, `section ${s.i + 1} is ${s.end - s.start} characters`);
  assert.ok(sections.every((s) => !s.title), 'a bible written without headings has no section titles');
  assert.ok(!paragraphs.some((p) => isHeading(p.text)));
  assert.equal(paragraphs[0].text, `${truth.title}: a story bible`, 'one title line, then prose');
});

test('written the way a writer writes a bible: dense paragraphs, plain text, no markdown', () => {
  const body = paragraphs.slice(1).map((p) => words(p.text).length);
  assert.ok(body.every((n) => n >= 110 && n <= 320), `paragraph lengths ${Math.min(...body)}..${Math.max(...body)}`);
  assert.ok(body.filter((n) => n >= 120 && n <= 300).length / body.length >= 0.9, 'almost every paragraph is 120 to 300 words');
  assert.ok(!/[#*_`~[\]|<>]/.test(text), 'no markdown characters');
  assert.ok(!/^\s*(?:[-+>]|\d+[.)])\s/m.test(text), 'no list or quote markers');
  assert.ok(!text.includes('\r'));
  assert.ok(!text.includes('fog') && !/\bmoon\b/i.test(text), 'unlike the usual invented-harbour story');
});

test('dated paragraphs open with a time stamp, and the timeline jumps backward exactly once', () => {
  const stamps = paragraphs.map((p) => p.text.match(STAMP)).filter(Boolean).map((m) => NUMBERS[m[1]] * 12 + MONTHS.indexOf(m[2]));
  assert.ok(stamps.length >= 15, `${stamps.length} dated paragraphs`);
  const jumps = stamps.filter((v, k) => k > 0 && v < stamps[k - 1]);
  assert.equal(jumps.length, 1, 'one backward jump');
});

test('a few lines of dialogue, under 3% of the words, and a memo in a different register', () => {
  const spans = dialogueSpans(text);
  const spoken = spans.reduce((n, s) => n + words(s.text).length, 0);
  assert.ok(spans.length >= 4 && spans.length <= 12, `${spans.length} spoken lines`);
  assert.ok(spoken / words(text).length < 0.03, `${((spoken / words(text).length) * 100).toFixed(2)}% dialogue`);
  const memo = paragraphs.find((p) => p.text.startsWith('Confidential. To the Station Chiefs'));
  assert.ok(memo, 'the leaked memo is in the text');
  assert.ok(/This memorandum is not to be copied\./.test(text));
  assert.ok(!/[.!?]["']?\s+(?:I|We)\b/.test(memo.text), 'the memo has no first-person narration');
});

test('two invented organisations are introduced with their acronyms', () => {
  assert.ok(text.includes('The Highline Water Commission, always shortened to the HWC'));
  assert.ok(text.includes('The Sill Freight Syndicate, the SFS'));
});

// ── the truth file: everything it says is where it says ──────────────────────

test('cast: seven to nine named people, found where the truth says', () => {
  assert.ok(truth.cast.length >= 7 && truth.cast.length <= 9, `${truth.cast.length} people`);
  assert.equal(new Set(truth.cast.map((c) => c.name)).size, truth.cast.length);
  const surnames = truth.cast.map((c) => c.name.split(' ').at(-1));
  assert.ok(surnames.some((s) => surnames.filter((x) => x === s).length >= 3), 'one family of three');
  for (const c of truth.cast) {
    assert.ok(c.role.length > 20 && Array.isArray(c.aliases) && c.aliases.length >= 1, c.name);
    const re = new RegExp([c.name, ...c.aliases].map((a) => `\\b${esc(a)}\\b`).join('|'));
    const hits = sections.map((_, k) => (re.test(part(k + 1)) ? k + 1 : 0)).filter(Boolean);
    assert.equal(c.firstSection, hits[0], `${c.name} first appears in section ${hits[0]}`);
    assert.equal(c.lastSection, hits.at(-1), `${c.name} last appears in section ${hits.at(-1)}`);
  }
});

test('terms: each invented term is in the section that defines it', () => {
  assert.ok(truth.terms.length >= 8, `${truth.terms.length} terms`);
  for (const t of truth.terms) {
    assert.ok(t.definition.length > 15, t.term);
    assert.ok(t.section >= 1 && t.section <= sections.length, t.term);
    assert.ok(has(part(t.section), t.term), `"${t.term}" is in section ${t.section}`);
  }
  assert.equal(new Set(truth.terms.map((t) => t.term)).size, truth.terms.length);
});

test('timeline: labels are in the cited section, in order of appearance', () => {
  assert.ok(truth.timeline.length >= 15);
  let from = 0;
  let lastSection = 0;
  for (const e of truth.timeline) {
    assert.ok(has(part(e.section), e.label), `"${e.label}" is in section ${e.section}`);
    const at = text.toLowerCase().indexOf(e.label.toLowerCase(), from);
    assert.ok(at >= from, `"${e.label}" comes after the previous entry`);
    assert.ok(e.section >= lastSection, 'sections never go backward');
    from = at + 1;
    lastSection = e.section;
  }
  const dated = truth.timeline.filter((e) => STAMP.test(`${e.label}.`));
  assert.equal(dated.filter((e, k) => k > 0 && NUMBERS[e.label.split(/[ ,]/)[1]] < NUMBERS[dated[k - 1].label.split(/[ ,]/)[1]]).length, 1, 'the jump back in the truth too');
});

test('rules: at least six, stated plainly, in the section the truth cites', () => {
  assert.ok(truth.rules.length >= 6, `${truth.rules.length} rules`);
  for (const r of truth.rules) assert.ok(has(part(r.section), r.text), `rule "${r.text}" is in section ${r.section}`);
});

test('inconsistencies: exactly two, and they really contradict', () => {
  assert.equal(truth.inconsistencies.length, 2);
  for (const i of truth.inconsistencies) {
    assert.ok(i.description.length > 40);
    assert.ok(inOrder(i.sectionA, i.sectionB), 'A is the earlier statement, B the later one');
    assert.ok(i.sectionA >= 1 && i.sectionB <= sections.length);
  }
  const [num, date] = truth.inconsistencies;
  assert.ok(has(part(num.sectionA), 'forty thousand barrels when full') && has(part(num.sectionB), 'sixty thousand barrels when full'));
  assert.equal(text.match(/thousand barrels/g).length, 2, 'the capacity is stated twice, and differently');
  assert.ok(has(part(date.sectionA), 'in the October of Year three') && has(part(date.sectionB), 'Year two, October.'));
  assert.ok(has(part(date.sectionB), 'the Fourth Line ran away'));
});

// ── the questions ────────────────────────────────────────────────────────────

const KINDS = ['lookup', 'whole', 'timeline', 'style', 'contradiction', 'snippet'];
const MINIMUM = { lookup: 4, whole: 3, timeline: 2, style: 2, contradiction: 2, snippet: 2 };

test('questions: at least 14, every kind covered, well formed', () => {
  const qs = truth.questions;
  assert.ok(qs.length >= 14, `${qs.length} questions`);
  assert.equal(new Set(qs.map((q) => q.id)).size, qs.length, 'ids are unique');
  assert.equal(new Set(qs.map((q) => q.ask)).size, qs.length, 'no question is asked twice');
  for (const kind of KINDS) assert.ok(qs.filter((q) => q.kind === kind).length >= MINIMUM[kind], `${kind} questions`);
  for (const q of qs) {
    assert.ok(KINDS.includes(q.kind), q.id);
    assert.ok(typeof q.ask === 'string' && q.ask.length > 20, q.id);
    assert.ok(Array.isArray(q.mustMention) && q.mustMention.length >= 1, q.id);
    for (const alts of q.mustMention) assert.ok(Array.isArray(alts) && alts.length >= 1 && alts.every((a) => typeof a === 'string' && a.length > 0), q.id);
    assert.ok(q.sections.length >= 1 && q.sections.every((n, k) => Number.isInteger(n) && n >= 1 && n <= sections.length && (k === 0 || n > q.sections[k - 1])), `${q.id} cites sorted, valid sections`);
  }
});

test('questions: what a good answer must mention is really in the sections the question cites', () => {
  for (const q of truth.questions) {
    if (q.kind === 'style') continue; // those are about how the text is written, not what it says
    const hay = partsOf(q.sections);
    q.mustMention.forEach((alts, k) => assert.ok(alts.some((a) => has(hay, a)), `${q.id}: none of ${JSON.stringify(alts)} (group ${k + 1}) is in sections ${q.sections.join(',')}`));
  }
});

test('questions: each kind asks for what it says it asks for', () => {
  for (const q of truth.questions) {
    if (q.kind === 'lookup') assert.equal(q.sections.length, 1, `${q.id}: a lookup is answered in one section`);
    if (q.kind === 'whole') assert.ok(q.sections.length >= 2, `${q.id}: a whole-text question needs several sections`);
    if (q.kind === 'timeline' || q.kind === 'contradiction') assert.ok(q.sections.length >= 2, `${q.id}: needs two places`);
    // the question must not hand over its own answer
    const asked = q.mustMention.filter((alts) => alts.some((a) => has(q.ask, a))).length;
    if (q.kind === 'snippet') {
      assert.ok(q.mustMention[0].some((a) => has(q.ask, a)), `${q.id}: a snippet names the element it touches`);
      assert.ok(asked < q.mustMention.length, `${q.id}: the idea alone is not the answer`);
    } else {
      assert.ok(asked < q.mustMention.length, `${q.id}: the question already contains its answer`);
    }
  }
  const real = truth.questions.filter((q) => q.kind === 'contradiction');
  assert.ok(real.some((q) => q.mustMention.flat().some((a) => /thousand|40,000/.test(a))), 'the number conflict is asked about');
  assert.ok(real.some((q) => q.mustMention.flat().includes('Year three') && q.mustMention.flat().includes('Year two')), 'the date conflict is asked about');
});

// ── the loader ───────────────────────────────────────────────────────────────

test('loadBible is deterministic and cached, and reads the files next to it', () => {
  const again = loadBible();
  assert.equal(again, loadBible(), 'one cached object');
  assert.equal(again.text, text);
  const dir = new URL('./fixtures/', import.meta.url);
  assert.equal(again.text, readFileSync(fileURLToPath(new URL('story-bible.txt', dir)), 'utf8').replace(/\r\n?/g, '\n'));
  assert.deepEqual(again.truth, JSON.parse(readFileSync(fileURLToPath(new URL('story-bible.truth.json', dir)), 'utf8')));
  assert.deepEqual(splitSections(again.text).map((s) => s.hash), sections.map((s) => s.hash), 'the same text always makes the same sections');
});

test('the invented names appear nowhere in the other invented long text', () => {
  const other = makeLongText({ words: 9000, seed: 11 }).text;
  for (const c of truth.cast) for (const a of [c.name, ...c.aliases]) assert.ok(!other.includes(a), a);
});
