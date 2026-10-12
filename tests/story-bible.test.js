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
    q.mustMention.forEach((alts, k) => {
      if (q.control && k === 0) return; // the verdict of a "do these conflict?" control is the answerer's judgement, not a phrase of the text
      assert.ok(alts.some((a) => has(hay, a)), `${q.id}: none of ${JSON.stringify(alts)} (group ${k + 1}) is in sections ${q.sections.join(',')}`);
    });
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

// ── a question can only be passed by knowing the text ────────────────────────
// mustMention is matched as a case-insensitive substring, so an alternative that is also a piece of an ordinary word makes the question free: "four" is in
// "Fourth", "may" in every hedge, "consistent" in "inconsistent", "ration" in "generation". These tests keep every group honest from both sides.

const satisfies = (answer, q) => q.mustMention.every((alts) => alts.some((a) => has(answer, a)));

test('questions: a whole-text, timeline or contradiction question cannot be passed from one section, and a lookup from at most two', () => {
  for (const q of truth.questions) {
    if (q.kind === 'style' || q.kind === 'snippet') continue;
    const alone = sections.map((_, k) => k + 1).filter((n) => satisfies(part(n), q));
    if (q.kind === 'lookup') assert.ok(alone.includes(q.sections[0]) && alone.length <= 2, `${q.id}: a lookup is answered in its own section, not in ${alone.join(',')}`);
    else assert.deepEqual(alone, [], `${q.id} (${q.kind}) needs several places in the text, but section ${alone.join(',')} would do alone`);
  }
});

// the question itself plus what any answer says whether or not it has read the bible, with the numbers, months and hedges a generic reply is full of
const FILLER = [
  'It may be a key part of the story. At present, and in the past, the people passed it on, a lot like the report and its numbers, which told nothing.',
  'The march of events may matter: four or seven of the Fourth and Seventh, 4 and 7 and 12 and 16 and 19 and 24 and 40 and 47 and 90 in all, are the same.',
  'It is inconsistent and they disagree. A generation of migration put a price on the lake and its melt, earlier or sooner, in a solid Lid that slid.',
  'A little deaf, with an ear for it, it was sold and assigned, and retired, and it seems consistent with the seal.',
].join(' ');

test('questions: the question echoed back with generic filler passes none of them', () => {
  for (const q of truth.questions) {
    if (q.kind === 'style') continue; // those describe the writing, in the words any description of writing uses
    assert.ok(!satisfies(`${q.ask} ${FILLER}`, q), `${q.id} is passed by a generic answer`);
  }
});

// a correct answer in the words a careful model would use must pass, and a plausible wrong one must not
const GOOD = {
  'lookup-belly': 'A belly holds ninety barrels of water when it is filled to the Mark.',
  'lookup-strands': 'Sedgewire is a rope of twelve steel strands braided around a core of treated sedge fibre.',
  'lookup-build': 'The Ladder took nineteen years to finish.',
  'lookup-rurik': 'Rurik Sennet was forty-seven in Year one, and he was the brake inspector at Greyfall.',
  'lookup-retainer': 'Tobiah took forty crowns a quarter from the Syndicate, in July of Year five.',
  'lookup-deaths': 'Eleven people died, seven in the falling car and four in the rising one.',
  'lookup-lowday1': 'Low Day fell on the twenty-fourth of September in Year one, the earliest in the records.',
  'lookup-sfs': 'SFS stands for the Sill Freight Syndicate, founded by the grain carters of Pannock.',
  'whole-people': "The story is about the Ombrechts of Greyfall (Isaura, her son Tobiah and his daughter Linnet), the dispatcher Dessa Varnholt and the brake inspector Rurik Sennet, the hydrographer Calla Reth, the Commissioner Emeric Haldric, and Jessamy Tolk, the Syndicate's night broker.",
  'whole-ending': 'The Seventh Line stops when the Brimmer runs dry, and the Reconciliation shortens the Ladder into a Summer Ladder. Linnet becomes Chief Wright, Isaura goes to the Pass, Haldric resigns and Tobiah ends with a limp.',
  'whole-rules': "A belly is never filled past the Mark, no run starts until both keys are turned, both cars halt for the Held Minute, a rope is retired after seven years, and water is assigned, never sold. They are bent in the runaway, when Dessa wrote Mark over a stuck gauge, and by the Extension Order.",
  'whole-problem': 'Old Mara, the glacier, is shrinking, so the Brimmer drains earlier each year; the Commissioner answers with rationing, grain gets dearer and pays for ghost cars, and in Year nine the Seventh Line stops and the Reconciliation shortens the Ladder.',
  'whole-mechanism': 'Two cars hang from one haul-rope over the Great Sheave. The belly of the upper car is filled with water, so it outweighs the lower car and sinks, lifting it; at the bottom the belly is emptied into the tailrace, which carries the water to the next line. It all comes from the Brimmer through the Sluice.',
  'timeline-memo': 'Haldric wrote the memo in Year four, in November, and Dessa leaked it in November of Year five.',
  'timeline-jump': "After Year six, July, the timeline jumps back to Year one, November, to Calla's report that Haldric shelved.",
  'timeline-lowday': 'It moved from the twenty-fourth of September in Year one to the sixteenth of July in Year six.',
  'timeline-order': 'Isaura lost her seal first, in May of Year three; Linnet heard the rope go flat in March of Year four.',
  'style-voice': 'It is written in the third person, mostly in the past tense, with the present tense to explain how the world works.',
  'style-memo': 'The memo is stiff, official and passive, nothing like the plain narration of the rest of the bible.',
  'style-dialogue': 'There is very little dialogue, a handful of short lines, mostly admissions.',
  'style-structure': 'It starts with how the world and the Ladder work, then the cast, then a dated chronology by year, then notes on the novel.',
  'contra-brimmer': 'No. One part says the Brimmer holds forty thousand barrels when full, and another says sixty thousand.',
  'contra-runaway': 'No. The cast notes put the runaway in the October of Year three, but the dated entries say Year two, October.',
  'contra-seal': 'Yes, they are consistent: the notes and the entries both put Isaura losing her seal in Year three, in May.',
  'snippet-heldminute': "That fits: Tobiah already takes the Syndicate's retainer in Year five to look away from the Held Minute on ghost car nights, and Isaura ends as Pass-keeper at Greyfall.",
  'snippet-linnet-ear': "It could echo Isaura, who is nearly deaf in her left ear, but Linnet's whole gift is the Ombrecht note, and the book ends with her listening in the Held Minute as Chief Wright.",
  'snippet-haldric-sister': 'A sister in Pannock would make the grain and bread prices personal for Haldric, who told the country nothing and filed the report under Prudence, so it sharpens his case about a frightened valley.',
  'snippet-calla-stakes': "The Syndicate has no reason to hide the glacier numbers; its quarrel with the Commission is about when the Ladder runs. Haldric and the Commission do, since his memo forbids circulating them and he shelved Calla's report, so his side is the likelier culprit.",
};
const WRONG = {
  'lookup-belly': 'A belly holds ninety-eight barrels, which is eight over the Mark.',
  'lookup-deaths': 'Seven people died in the Fourth Line runaway.',
  'contra-brimmer': 'No, it says forty thousand barrels everywhere.',
  'contra-seal': 'No, the bible is inconsistent about it: the cast notes say Year three, and the dated entries put it in May, but not in the same way.',
};

test('questions: a correct answer passes every one of them, and a wrong one does not', () => {
  assert.deepEqual(Object.keys(GOOD).sort(), truth.questions.map((q) => q.id).sort(), 'one correct answer per question');
  for (const q of truth.questions) assert.ok(satisfies(GOOD[q.id], q), `${q.id}: a correct answer fails`);
  for (const [id, answer] of Object.entries(WRONG)) assert.ok(!satisfies(answer, truth.questions.find((q) => q.id === id)), `${id}: a wrong answer passes`);
});

// ── the truth file says nothing the bible does not ───────────────────────────

test('the truth file invents nothing: its own words are the bible\'s', () => {
  const low = text.toLowerCase();
  const OWN_WORDS = new Set(['brake-band', 'rope-making', 'lends', 'equal', 'twice-daily', 'consortium']); // compound or inflected forms the text only has in another shape
  const strange = (s) => [...new Set(s.toLowerCase().match(/[a-z][a-z'-]{4,}/g) ?? [])].filter((w) => !OWN_WORDS.has(w) && !new RegExp(`\\b${esc(w.slice(0, Math.max(4, w.length - 3)))}`).test(low));
  for (const e of truth.timeline) assert.deepEqual(strange(e.event), [], `timeline "${e.label}": ${e.event}`);
  for (const c of truth.cast) assert.deepEqual(strange(c.role), [], `cast ${c.name}: ${c.role}`);
  for (const t of truth.terms) assert.deepEqual(strange(t.definition), [], `term ${t.term}: ${t.definition}`);
});

test('the only contradictions are the two planted ones', () => {
  // found by reading as a careful reader would, and fixed; a third one would make "did the model catch them?" unanswerable
  assert.ok(text.includes("Syndicate hands working the night shift had left the thief-pipe at Greyfall unplugged"), 'the chronology blames Syndicate hands for the open pipe');
  assert.ok(!/who owned the thief-pipe/.test(text), 'so the closing notes cannot call the pipe\'s owner undecided');
  assert.ok(text.includes("Calla's table had said so two years earlier"), 'Calla\'s tables date from Year seven, and Year nine is two years on');
  assert.ok(has(text, 'It pays no wages') && !has(text, 'same wage'), 'the guild pays no wages, so Isaura cannot be kept on at "the same wage"');
});

test('the figures the bible gives add up, so the only numbers that disagree are the planted ones', () => {
  const NUMBER = { ten: 10, eleven: 11, twelve: 12, eighty: 80 };
  const cleft = NUMBER[text.match(/mountains (\w+) kilometres long/)[1]];
  assert.ok(Math.abs(cleft - 7 * 1.5) <= 3, `a cleft ${cleft} km long cannot hold seven lines of a kilometre and a half`);
  assert.ok(has(text, 'a kilometre and a half long'));
  assert.equal(60 - 41, 19, 'First Line sixty years before Year one, Seventh forty-one: nineteen years to build');
  assert.ok(has(text, 'sixty years before Year one') && has(text, 'forty-one years before Year one') && has(text, 'nineteen years to finish'));
  assert.equal(Math.round(100 * 0.96 ** 6), 78, 'four barrels in a hundred lost at six hand-overs');
  assert.ok(has(text, 'about seventy-eight reach the First Line') && has(text, 'roughly four barrels in a hundred'));
  assert.equal((30 * 5) / 6, 25, 'a sixth off thirty runs');
  assert.ok(has(text, 'now managed twenty-five'));
  assert.equal(118 - 90, 28);
  assert.equal(98 - 90, 8);
  assert.ok(has(text, 'twenty-eight over the Mark') && has(text, 'eight above the Mark') && has(text, 'seven in the falling car and four in the rising one') && has(text, 'eleven people were dead'));
  // Low Day moves a fortnight a year earlier, as Calla's report says: Year one 24 September, Year three 27 August, Year six 16 July, Year nine 4 June
  const day = (month, d) => Date.UTC(2001, month - 1, d) / 86400000;
  assert.equal(day(9, 24) - day(8, 27), 28);
  assert.equal(day(9, 24) - 5 * 14, day(7, 16));
  assert.equal(day(7, 16) - 3 * 14, day(6, 4));
  assert.ok(has(text, 'four weeks earlier than in Year one') && has(text, 'roughly a fortnight a year'));
  // ages: Linnet fifteen in Year one is twenty-one in Year seven and twenty-three in Year nine; Isaura sixty-one went onto the walks at fourteen, forty-seven years before
  assert.ok(has(text, 'Linnet Ombrecht was fifteen in Year one') && has(text, 'at twenty-one') && has(text, 'she was twenty-three'));
  assert.equal(61 - 14, 47);
  assert.ok(has(text, 'Isaura Ombrecht was sixty-one in Year one') && has(text, 'at fourteen, forty-seven years before Year one'));
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
