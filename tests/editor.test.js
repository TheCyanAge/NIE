import test from 'node:test';
import assert from 'node:assert/strict';
import { analyseText, analysisKey, editorialEvidence, measuredAnswer, readbackFrame, groundNames, clearGroundingCache, groundingCacheSize, speaksAboutTheWriter, findThirdPerson, standouts, topicsOf } from '../apps/web/src/engine/editor/index.js';
import { listSections } from '../apps/web/src/engine/editor/findings.js';
import { splitSections, sectionText, isHeading } from '../apps/web/src/engine/reading/sections.js';
import { buildIndex } from '../apps/web/src/engine/reading/context.js';
import { scan } from '../apps/web/src/engine/analysis/scan.js';
import { isPraiseOpener } from '../apps/web/src/engine/orchestrator/variety.js';
import { estimateTokens, splitParagraphs, words } from '../apps/web/src/engine/util/text.js';
import { styleProfile } from '../apps/web/src/engine/reading/style.js';
import { loadBible } from './fixtures/story-bible.mjs';
import { makeLongText } from './fixtures/long-text.mjs';
import { chaptered, paragraph } from './fixtures/editor-texts.mjs';
import { DIALOGUE, ESSAY, FIRST_PERSON, MEMOIR, NOSENT, POEMS, SCREENPLAY } from './fixtures/editor-genres.mjs';
import { projectWith, withRules } from './helpers.js';

// The editorial instruments: deterministic measurements of a long text, the evidence lines made from them, the read-back of a pasted text, and the check that
// stops a reply from naming people the text does not have. Every claim a line makes is recomputed here from the TEXT, not from the analysis it came from.

const { text: BIBLE, truth } = loadBible();
const A = analyseText({ text: BIBLE });

const deepFreeze = (o) => {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const v of Object.values(o)) deepFreeze(v);
  }
  return o;
};
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
/** 0-based indexes of the sections of `text` whose text matches `re` (computed with the splitter, independently of the analysis). */
const sectionsMatching = (text, re) => splitSections(text).flatMap((s) => (re.test(sectionText(text, s)) ? [s.i] : []));
const sectionOfOffset = (text, pos) => splitSections(text).find((s) => s.start <= pos && pos < s.end)?.i ?? -1;
const lines = (block) => block.split('\n').slice(1);
const wordsIn = (s) => s.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? [];

// ── shape ────────────────────────────────────────────────────────────────────

test('the analysis of the story bible is plain data in the documented shape, and its sections are the splitter\'s', () => {
  assert.deepEqual(A.failed, [], 'no instrument threw');
  assert.equal(A.words, truth.words);
  assert.equal(A.sectionCount, truth.sections);
  assert.equal(A.sections.length, truth.sections);
  assert.deepEqual({ sections: A.covered.sections, of: A.covered.of, complete: A.covered.complete }, { sections: 25, of: 25, complete: true });
  const split = splitSections(BIBLE);
  A.sections.forEach((s, k) => {
    assert.equal(s.i, k);
    assert.equal(s.start, split[k].start);
    assert.equal(s.end, split[k].end);
    assert.equal(s.words, words(sectionText(BIBLE, split[k])).length);
    for (const key of ['sentences', 'avgSentence', 'dialogueShare', 'person', 'tense', 'title']) assert.ok(key in s, key);
  });
  for (const key of ['cast', 'pacing', 'voice', 'names', 'repeats', 'figures', 'terms', 'rules', 'timeline', 'style', 'vocab']) assert.ok(key in A, key);
  assert.deepEqual(JSON.parse(JSON.stringify(A)), A, 'plain data, nothing undefined, nothing a cache could not keep');
  assert.equal(A.rules, null, 'no rules in the project: no rule instrument');
});

test('the same text gives the same analysis, whatever was analysed before (no state between calls)', () => {
  const other = chaptered([{ words: 120, name: 'Zelda Mork' }, { words: 120, name: 'Zelda Mork' }], { seed: 9 }).text;
  const again = analyseText({ text: BIBLE });
  const between = analyseText({ text: other });
  const third = analyseText({ text: BIBLE });
  assert.deepEqual(again, A);
  assert.deepEqual(third, A);
  assert.ok(!JSON.stringify(between).includes('Greyfall') && !JSON.stringify(between).includes('Ombrecht'), 'nothing of the bible in the analysis of another text');
  assert.ok(!JSON.stringify(A).includes('Zelda'), 'nothing of the other text in the bible\'s');
});

test('an index of the same text is reused, an index of another text is ignored; maxSections limits the covered sections and says so', () => {
  assert.deepEqual(analyseText({ text: BIBLE, index: buildIndex(BIBLE) }), A);
  const wrong = analyseText({ text: BIBLE, index: buildIndex('Something else entirely.\n\nAnother paragraph that is not the bible.') });
  assert.deepEqual(wrong, A);
  const few = analyseText({ text: BIBLE, maxSections: 5 });
  assert.deepEqual({ sections: few.covered.sections, of: few.covered.of, complete: few.covered.complete }, { sections: 5, of: 25, complete: false });
  assert.equal(few.sections.length, 5);
  assert.equal(few.words, truth.words, 'words is the whole text\'s, covered.words the measured part');
  assert.ok(few.covered.words < few.words);
  for (const c of few.cast) assert.ok(c.sections.every((i) => i < 5));
  const ev = editorialEvidence({ analysis: few, query: 'overall' });
  assert.match(ev.block.split('\n')[0], /only the first 5 of 25 sections were measured/);
  const rb = readbackFrame({ analysis: few });
  assert.match(rb.lines[0], /the counts cover the first 5 sections/);
});

test('the key of an analysis follows what the analysis depends on, and nothing else', () => {
  const project = withRules(projectWith(), ['Never use the word "lantern"']);
  const base = analysisKey({ text: BIBLE });
  assert.equal(analysisKey({ text: BIBLE }), base);
  assert.equal(analysisKey({ text: BIBLE, project: projectWith() }), base, 'a project without rules changes nothing');
  assert.notEqual(analysisKey({ text: BIBLE + ' ' }), base);
  assert.notEqual(analysisKey({ text: BIBLE, project }), base, 'a rule changes the analysis');
  const off = withRules(projectWith(), ['Never use the word "lantern"']);
  off.rules[0].enabled = false;
  assert.equal(analysisKey({ text: BIBLE, project: off }), base, 'a rule that is switched off does not');
  assert.notEqual(analysisKey({ text: BIBLE, maxSections: 10 }), base);
  assert.notEqual(analysisKey({ text: BIBLE, notes: [{ by: 'model', names: ['Zed'], terms: [] }] }), base);
  assert.equal(typeof analysisKey(null), 'string');
});

test('a long heading is quoted in the evidence as its first ten words, and a question mark in it cannot end the sentence', () => {
  const body = (k, n) => paragraph(n, { seed: 50 + k });
  const text = [`Chapter 1: Why does the lamp keep going out on stormy nights, again?\n\n${body(1, 110)}`, `Chapter 2\n\n${body(2, 110)}`, `Chapter 3\n\n${body(3, 110)}`, `Chapter 4: Why does the lamp keep going out on stormy nights, again?\n\n${body(4, 500)}`, `Chapter 5\n\n${body(5, 110)}`].join('\n\n');
  const a = analyseText({ text });
  const ev = editorialEvidence({ analysis: a, query: 'pacing' });
  const [line] = lines(ev.block);
  assert.match(line, /^- Pacing: section 4 \("Chapter 4: Why does the lamp keep going out on…"\) is /);
  assert.ok(!line.includes('?'));
  const rb = readbackFrame({ analysis: a });
  assert.equal((rb.question.match(/\?/g) ?? []).length, 1);
});

// ── cast ─────────────────────────────────────────────────────────────────────

test('the cast of the story bible is recovered: every character of the truth file, with exactly the sections the text puts them in', () => {
  for (const member of truth.cast) {
    const [first] = member.name.split(' ');
    const entry = A.cast.find((c) => c.name === member.name || c.name === first || c.aliases.includes(first));
    assert.ok(entry, `${member.name} is in the cast`);
    const forms = [entry.name, ...entry.aliases].map(esc).join('|');
    const re = new RegExp(`(?<![\\p{L}])(?:${forms})(?![\\p{L}])`, 'u');
    assert.deepEqual(entry.sections, sectionsMatching(BIBLE, re), `${member.name}: the sections where the name occurs`);
    assert.equal(entry.first + 1, member.firstSection, `${member.name}: first section`);
    assert.equal(entry.last + 1, member.lastSection, `${member.name}: last section`);
    assert.equal(entry.first, entry.sections[0]);
    assert.equal(entry.last, entry.sections.at(-1));
    assert.equal(entry.kind, 'person', `${member.name} acts like a person`);
    const counted = (BIBLE.match(new RegExp(`(?<![\\p{L}])(?:${forms})(?![\\p{L}])`, 'gu')) ?? []).length;
    assert.ok(entry.mentions <= counted && entry.mentions >= counted - 3 * entry.aliases.length, `${member.name}: ${entry.mentions} mentions against ${counted} occurrences`);
  }
});

test('the cast holds only names the text uses: no month, day, heading word or sentence opener; gaps are real; places and terms are not "people"', () => {
  assert.ok(A.cast.length >= 8);
  for (const c of A.cast) {
    assert.ok(BIBLE.includes(c.name), `${c.name} is in the text`);
    assert.ok(!/^(?:january|february|march|april|may|june|july|august|september|october|november|december|monday|tuesday|wednesday|thursday|friday|saturday|sunday|year|chapter|part|the|then|however|suddenly)$/i.test(c.name), c.name);
    assert.ok(c.mentions >= 3);
    for (const [from, to] of c.gaps) {
      assert.ok(to - from + 1 >= 3);
      for (let i = from; i <= to; i++) assert.ok(!c.sections.includes(i), `${c.name} is absent from section ${i + 1}`);
      assert.ok(c.sections.includes(from - 1) && c.sections.includes(to + 1), 'a gap lies between two appearances');
    }
  }
  const places = A.cast.filter((c) => c.kind === 'place').map((c) => c.name);
  assert.ok(['Greyfall', 'Ostrel', 'Pannock'].every((p) => places.includes(p)), places.join(', '));
  const termsNames = A.terms.map((t) => t.term);
  assert.ok(termsNames.includes('Ladder') && !A.cast.some((c) => c.name === 'Ladder'), '"the Ladder" is a term, not a cast member');
});

test('the reading notes are an extra: a name they found that occurs twice joins the cast, a name that does not occur does not, and nothing changes without them', () => {
  const { text } = chaptered([{ words: 110, extra: 'Zephyra waved from the dock.' }, { words: 110 }, { words: 110, extra: 'Zephyra was gone by dusk.' }, { words: 110 }], { seed: 4 });
  const bare = analyseText({ text });
  assert.ok(!bare.cast.some((c) => c.name === 'Zephyra'), 'two mentions are not enough on the counts alone');
  const notes = splitSections(text).map(() => ({ gist: 'x', names: ['Zephyra', 'Nobody Atall'], terms: ['quillfold', 'weir'], voice: '', by: 'model' }));
  const withNotes = analyseText({ text, notes });
  const z = withNotes.cast.find((c) => c.name === 'Zephyra');
  assert.ok(z && z.mentions === 2 && z.sections.join() === '0,2');
  assert.ok(!withNotes.cast.some((c) => c.name === 'Nobody Atall'), 'a name that is not in the text never joins');
  assert.ok(!withNotes.terms.some((t) => t.term === 'quillfold'), 'a term that is not in the text never joins');
  assert.equal(withNotes.usedNotes, true);
  assert.equal(bare.usedNotes, false);
  assert.deepEqual(analyseText({ text, notes: { per: notes } }), withNotes, 'notes as { per } are the same as notes as an array');
  assert.deepEqual(analyseText({ text, notes: { notes, total: 4, complete: true } }), withNotes, 'and so is what readThrough returns');
});

// ── pacing ───────────────────────────────────────────────────────────────────

test('pacing: the section planted at four times the length is the outlier, with the ratio the numbers give', () => {
  const { text } = chaptered([{ words: 110 }, { words: 110 }, { words: 110 }, { words: 500 }, { words: 110 }, { words: 110 }], { seed: 3 });
  const split = splitSections(text);
  assert.equal(split.length, 6, 'one section per chapter');
  const wc = split.map((s) => s.words);
  const med = median(wc);
  const a = analyseText({ text });
  assert.equal(a.pacing.median, med);
  assert.equal(a.pacing.outliers.length, 1);
  const o = a.pacing.outliers[0];
  assert.deepEqual({ i: o.i, kind: o.kind, words: o.words }, { i: 3, kind: 'long', words: wc[3] });
  assert.equal(o.ratio, Math.round((wc[3] / med) * 1000) / 1000);
  assert.ok(o.ratio > 4 && o.ratio < 5);
  assert.deepEqual(a.pacing.units.map((u) => [u.from, u.to, u.title]), [0, 1, 2, 3, 4, 5].map((i) => [i, i, `Chapter ${i + 1}`]));
  assert.equal(a.pacing.unitOutliers.length, 1);
  assert.deepEqual({ from: a.pacing.unitOutliers[0].from, kind: a.pacing.unitOutliers[0].kind, title: a.pacing.unitOutliers[0].title }, { from: 3, kind: 'long', title: 'Chapter 4' });

  // the evidence line says what was counted, and every number in it is the recomputed one
  const ev = editorialEvidence({ analysis: a, query: 'does the pacing drag anywhere?' });
  assert.deepEqual(ev.used, ['pacing']);
  const [line] = lines(ev.block);
  assert.ok(line.startsWith('- Pacing: section 4 ("Chapter 4") is '), line);
  assert.ok(line.includes(`${(wc[3] / med).toFixed(1)} times`), line);
  assert.ok(line.includes(`(${fmt(wc[3])} words against ${fmt(med)})`), line);
  assert.ok(!/\b(?:slow|drag|too long|bad|good|weak|strong)\b/i.test(line.replace('does the pacing drag', '')), 'a count, not a judgment');

  // the question the read-back asks about it
  const rb = readbackFrame({ analysis: a });
  assert.match(rb.question, /^Section 4 \("Chapter 4"\) is more than three times the length of a typical stretch under a heading: did you mean that as a deliberate slowing\?$/);
  assert.ok(rb.lines.some((l) => l.startsWith('Section 4 ("Chapter 4") is ')));
});

test('pacing: a short section among long ones is the other kind of outlier, and a text of even sections has none', () => {
  const short = analyseText({ text: chaptered([{ words: 500 }, { words: 500 }, { words: 110 }, { words: 500 }, { words: 500 }, { words: 500 }], { seed: 6 }).text });
  assert.deepEqual(short.pacing.outliers.map((o) => [o.i, o.kind]), [[2, 'short']]);
  assert.ok(short.pacing.outliers[0].ratio < 0.4);
  const even = analyseText({ text: chaptered(Array(6).fill({ words: 120 }), { seed: 6 }).text });
  assert.deepEqual(even.pacing.outliers, []);
  assert.deepEqual(even.pacing.unitOutliers, []);
  const ev = editorialEvidence({ analysis: even, query: 'is the pacing even?' });
  assert.match(lines(ev.block)[0], /^- Pacing: the 6 stretches under headings run from \d+ to \d+ words, with a median of \d+\.$/);
});

test('pacing: dialogue by thirds is the share of the words in each third, and the bible has almost none', () => {
  assert.equal(A.pacing.dialogueByThirds.length, 3);
  assert.ok(A.pacing.dialogueByThirds.every((x) => x >= 0 && x <= 0.05));
  const talky = `Chapter 1\n\n${'"Come here," she said. "No," he said. "Why not?" she asked. '.repeat(12)}\n\nChapter 2\n\n${'The road ran on past the mill and the water stayed low. '.repeat(14)}\n\nChapter 3\n\n${'The light went and the road ran on past the mill. '.repeat(14)}`;
  const t = analyseText({ text: talky });
  assert.equal(t.pacing.dialogueByThirds.length, 3);
  assert.ok(t.pacing.dialogueByThirds[0] > 0.3 && t.pacing.dialogueByThirds[1] === 0 && t.pacing.dialogueByThirds[2] === 0, JSON.stringify(t.pacing.dialogueByThirds));
  const ev = editorialEvidence({ analysis: t, query: 'how is the dialogue balanced?' });
  assert.match(ev.block, /quoted dialogue is \d+%, 0% and 0% of the words in the first, middle and last thirds of the 3 sections/);
});

// ── voice ────────────────────────────────────────────────────────────────────

test('voice: a tense planted at a known section is found there, and a steady text has no shift', () => {
  const { text } = chaptered([{ words: 110 }, { words: 110 }, { words: 110 }, { words: 110, tense: 'present' }, { words: 110, tense: 'present' }, { words: 110, tense: 'present' }], { seed: 5 });
  const a = analyseText({ text });
  assert.deepEqual(a.sections.map((s) => s.tense), ['past', 'past', 'past', 'present', 'present', 'present']);
  assert.deepEqual(a.voice.shifts, [{ at: 3, what: 'tense', from: 'past', to: 'present', previous: 2 }]);
  assert.deepEqual(a.voice.tense, [{ from: 0, to: 2, value: 'past' }, { from: 3, to: 5, value: 'present' }]);
  const ev = editorialEvidence({ analysis: a, query: 'is my tense consistent?' });
  assert.equal(ev.used[0], 'voice');
  assert.ok(lines(ev.block)[0].startsWith('- Voice: section 4 reads as present tense where section 3 reads as past tense (counted from verb cues)'), ev.block);
  const rb = readbackFrame({ analysis: a });
  assert.equal(rb.question, 'Section 4 reads as present tense where section 3 reads as past tense: did you mean that change?');

  const steady = analyseText({ text: chaptered(Array(6).fill({ words: 110 }), { seed: 5 }).text });
  assert.deepEqual(steady.voice.shifts, []);
  assert.match(lines(editorialEvidence({ analysis: steady, query: 'what about the tense?' }).block)[0], /^- Voice: no change of tense or person was counted between sections that read clearly \(a clear tense in 6 of 6 sections, a clear person in 6\)\.$/);
});

test('voice: a change of person is found, and a section with too few cues is "unclear", never guessed', () => {
  const { text } = chaptered([{ words: 110 }, { words: 110 }, { words: 110 }, { words: 110, person: 'first' }, { words: 110, person: 'first' }, { words: 110, person: 'first' }], { seed: 5 });
  const a = analyseText({ text });
  assert.deepEqual(a.voice.shifts, [{ at: 3, what: 'person', from: 'third person', to: 'first person', previous: 2 }]);
  const tiny = analyseText({ text: 'Chapter 1\n\nShe ran.\n\nChapter 2\n\nShe walked home and she ate her dinner.\n\nChapter 3\n\nI sit here and I know my hands are cold.' });
  assert.ok(tiny.sections.every((s) => s.person === 'unclear' && s.tense === 'unclear'), 'sections under 60 words say nothing about person or tense');
  assert.deepEqual(tiny.voice.shifts, []);
});

// ── names that may be slips ──────────────────────────────────────────────────

test('names: a spelling one letter off a name used far more often is reported as a possible slip, with where it is', () => {
  const spec = [{ words: 110 }, { words: 110 }, { words: 110 }, { words: 110, extra: 'Linet closed the shutters.' }, { words: 110 }, { words: 110 }];
  const { text } = chaptered(spec, { seed: 8, name: 'Linnet Vass' });
  const a = analyseText({ text });
  assert.equal(a.names.length, 1);
  const n = a.names[0];
  assert.deepEqual({ a: n.a, b: n.b, sections: n.sections, bCount: n.bCount }, { a: 'Linnet', b: 'Linet', sections: [3], bCount: 1 });
  assert.equal(n.aCount, (text.match(/\bLinnet\b/g) ?? []).length);
  const ev = editorialEvidence({ analysis: a, query: 'any typos in the names?' });
  assert.ok(lines(ev.block).some((l) => l === `- Names: "Linet" appears once, in section 4, and "Linnet" appears ${n.aCount} times in all (a possible typo in a name).`), ev.block);
  assert.match(readbackFrame({ analysis: a }).question, /^"Linet" appears only in section 4 while "Linnet" appears \d+ times in all: did you intend two different names\?$/);
});

test('names: two frequent names one letter apart, a plural and a possessive are not slips', () => {
  const twins = Array.from({ length: 12 }, (_, i) => (i % 2 ? 'Then Mara left the yard.' : 'Then Mark left the yard.')).join(' ');
  assert.deepEqual(analyseText({ text: `Chapter 1\n\n${twins}\n\nChapter 2\n\n${twins}\n\nChapter 3\n\n${twins}` }).names, []);
  assert.deepEqual(A.names, [], 'the bible writes "the Ombrechts" and "Ombrecht\'s": plural and possessive forms');
});

// ── figures ──────────────────────────────────────────────────────────────────

test('figures: a measure given two numbers in two sections is flagged "conflict", one given the same number twice or two numbers in one section is not', () => {
  const spec = [
    { words: 110, extra: 'The tower holds ninety barrels when it is full.' },
    { words: 110, extra: 'The lantern weighs eleven pounds.' },
    { words: 110, extra: 'The lantern weighs eleven pounds on a dry day.' },
    { words: 110, extra: 'The vat holds forty barrels. By evening the vat holds fifty barrels.' },
    { words: 110, extra: 'The tower holds sixty barrels when it is full.' },
    { words: 110 },
  ];
  const { text } = chaptered(spec, { seed: 2 });
  const a = analyseText({ text });
  const tower = a.figures.find((f) => f.noun === 'tower');
  assert.ok(tower && tower.conflict);
  assert.deepEqual(tower.items.map((i) => [i.section, i.value, i.written]), [[0, 90, 'ninety barrels'], [4, 60, 'sixty barrels']]);
  const lantern = a.figures.find((f) => f.noun === 'lantern');
  assert.ok(lantern && !lantern.conflict);
  assert.deepEqual(lantern.items.map((i) => i.value), [11, 11]);
  assert.ok(!a.figures.some((f) => f.noun === 'vat'), 'one section: nothing to compare across sections');
  for (const f of a.figures) for (const i of f.items) {
    assert.ok(text.includes(i.quote) && wordsIn(i.quote).length <= 14, `an exact short fragment: ${i.quote}`);
    assert.ok(sectionText(text, splitSections(text)[i.section]).includes(i.quote), 'in the section it is said to be in');
  }
  const ev = editorialEvidence({ analysis: a, query: 'are the numbers consistent?' });
  assert.equal(ev.used[0], 'figures');
  // a plain noun ("the tower") may be a different one each time: the line says so, and asks whether both mean the same one
  assert.equal(tower.proper, false);
  assert.equal(lines(ev.block)[0], '- Figures: "tower" is given "ninety barrels" in section 1 and "sixty barrels" in section 5 (possibly a conflict, possibly two different things both called "tower").');
  assert.match(readbackFrame({ analysis: a }).question, /^Your text gives "ninety barrels" in section 1 and "sixty barrels" in section 5 for "tower": do both mean the same tower\?$/);
});

test('figures: the planted contradiction of the story bible is found in the sections the truth file names, and nothing else conflicts', () => {
  const planted = truth.inconsistencies[0];
  const conflicts = A.figures.filter((f) => f.conflict);
  assert.equal(conflicts.length, 1);
  const f = conflicts[0];
  assert.equal(f.noun, 'Brimmer');
  assert.deepEqual(f.items.map((i) => i.section + 1), [planted.sectionA, planted.sectionB]);
  assert.deepEqual(f.items.map((i) => i.written), ['forty thousand barrels', 'sixty thousand barrels']);
  assert.deepEqual(f.items.map((i) => i.value), [40000, 60000]);
  for (const i of f.items) assert.ok(sectionText(BIBLE, splitSections(BIBLE)[i.section]).includes(i.written));
  // "It holds forty thousand barrels" says "It": the subject was read from the sentence before, and the line says so
  assert.ok(f.items[0].inferred && !f.items[1].inferred);
  const [line] = lines(editorialEvidence({ analysis: A, query: 'are there contradictions in the numbers?' }).block);
  assert.match(line, /says "it", read as "Brimmer" from the sentence before/);
  // the runaway year (Year two or Year three) is a date, not a measure: not claimed
  assert.ok(!A.figures.some((g) => /runaway|year/i.test(g.noun)));
});

// ── time stamps ──────────────────────────────────────────────────────────────

test('timeline: the bible\'s dated entries are counted and its one jump backward is found where the truth file says', () => {
  const dated = [...BIBLE.matchAll(/^Year (\w+), (\w+)\./gm)];
  assert.equal(A.timeline.stamps.length, dated.length);
  assert.equal(A.timeline.jumps.length, 1);
  const j = A.timeline.jumps[0];
  const jump = truth.questions.find((q) => q.id === 'timeline-jump');
  assert.deepEqual([j.fromSection + 1, j.toSection + 1], jump.sections);
  assert.equal(j.from, 'Year six, July');
  assert.equal(j.to, 'Year one, November');
  for (const s of A.timeline.stamps) assert.ok(sectionText(BIBLE, splitSections(BIBLE)[s.section]).includes(s.label), s.label);
  const [line] = lines(editorialEvidence({ analysis: A, query: 'does the timeline hold up?' }).block).filter((l) => l.startsWith('- Timeline'));
  assert.equal(line, '- Timeline: the dated entries go back in time: "Year one, November" (section 21) comes after "Year six, July" (section 20) but is dated earlier.');
});

test('timeline: full dates are compared too, and dates in order give no jump', () => {
  // each entry is long enough to be a section of its own
  const diary = (dates) => dates.map((d, k) => `${d}\n\n${paragraph(500, { seed: 30 + k })}`).join('\n\n');
  const back = analyseText({ text: diary(['March 3, 1987', 'March 9, 1987', 'January 2, 1987', 'April 4, 1988']) });
  assert.equal(back.sectionCount, 4);
  assert.deepEqual(back.timeline.jumps.map((j) => [j.from, j.to, j.fromSection, j.toSection]), [['March 9, 1987', 'January 2, 1987', 1, 2]]);
  const fine = analyseText({ text: diary(['March 3, 1987', 'March 9, 1987', 'April 2, 1987', 'April 4, 1988']) });
  assert.deepEqual(fine.timeline.jumps, []);
  assert.match(lines(editorialEvidence({ analysis: fine, query: 'is the timeline right?' }).block).join('\n'), /4 dated entries run from "March 3, 1987" \(section 1\) to "April 4, 1988" \(section 4\), and none goes back in time/);
  assert.match(lines(editorialEvidence({ analysis: back, query: 'is the timeline right?' }).block).join('\n'), /the dated entries go back in time: "January 2, 1987" \(section 3\) comes after "March 9, 1987" \(section 2\) but is dated earlier/);
});

// ── repeats ──────────────────────────────────────────────────────────────────

test('repeats: a phrase that comes back in three sections and an opener that starts four sentences in a row are found, and quoted exactly', () => {
  const phrase = 'the grey heron stood on one leg';
  const spec = [
    { words: 110, extra: `And ${phrase}.` },
    { words: 110 },
    { words: 110, extra: `Later ${phrase} again.` },
    { words: 110, extra: 'Then the bell rang. Then the gate shut. Then the lamp went out. Then the dog woke. Then nobody spoke.' },
    { words: 110, extra: `Still ${phrase}.` },
    { words: 110 },
  ];
  const { text } = chaptered(spec, { seed: 11, filler: 'unique' });
  const a = analyseText({ text });
  const rep = a.repeats.find((r) => r.kind === 'phrase' && r.phrase.includes('grey heron'));
  assert.ok(rep, JSON.stringify(a.repeats));
  assert.equal(rep.phrase, phrase);
  assert.equal(rep.count, 3);
  assert.deepEqual(rep.sections, [0, 2, 4]);
  const opener = a.repeats.find((r) => r.kind === 'opener' && r.phrase === 'Then');
  assert.ok(opener);
  assert.deepEqual({ count: opener.count, sections: opener.sections, at: opener.at }, { count: 5, sections: [3], at: 3 });
  for (const r of a.repeats) assert.ok(r.kind === 'opener' || (text.includes(r.phrase) && wordsIn(r.phrase).length <= 14), 'an exact short fragment');
  const ev = editorialEvidence({ analysis: a, query: 'do I repeat myself? any tics?' });
  assert.deepEqual(ev.used, ['repeats']);
  assert.ok(lines(ev.block).includes(`- Repeats: "Then" begins 5 sentences in a row in section 4 (a possible tic).`), ev.block);
  assert.ok(lines(ev.block).length <= 2);
});

test('repeats: an empty or one-word text, and a text with no repeats, report none', () => {
  assert.deepEqual(analyseText({ text: 'Hello.' }).repeats, []);
  assert.deepEqual(analyseText({ text: chaptered(Array(6).fill({ words: 110 }), { seed: 1, filler: 'unique' }).text }).repeats, []);
});

// ── the writer's own rules ───────────────────────────────────────────────────

test('rules: findings are the scan\'s, mapped to sections; a rule that needs the model is counted as not checked', () => {
  const { text } = chaptered(Array(6).fill({ words: 110 }), { seed: 12 });
  const project = withRules(projectWith(), ['Never use the word "lantern"', 'Keep the tone hopeful']);
  const a = analyseText({ text, project });
  assert.ok(a.rules);
  const report = scan({ text, project, observations: false });
  const counted = report.findings.filter((f) => f.section === 'rule' && f.class !== 'intentional-possibility');
  assert.ok(counted.length > 0 && counted.length < 25, 'fixture: lantern occurs, under the per-rule cap');
  assert.equal(a.rules.count, counted.length);
  assert.equal(a.rules.findings.length, counted.length);
  const recount = {};
  for (const f of a.rules.findings) {
    assert.equal(text.slice(f.start, f.end).toLowerCase(), 'lantern');
    assert.equal(f.quote.toLowerCase(), 'lantern');
    assert.equal(f.section, sectionOfOffset(text, f.start));
    assert.equal(f.rule, 'Never use the word "lantern"');
    recount[f.section] = (recount[f.section] ?? 0) + 1;
  }
  assert.deepEqual(a.rules.bySection, recount);
  assert.equal(a.rules.needsModel, 1);
  assert.deepEqual(a.rules.items.map((i) => i.state), ['checked', 'needs-model']);
  assert.equal(a.rules.headline, report.headline);

  const ev = editorialEvidence({ analysis: a, query: 'did I break any of my rules?' });
  assert.deepEqual(ev.used, ['rules']);
  const rows = Object.entries(recount).sort((x, y) => y[1] - x[1] || x[0] - y[0]);
  const top = rows[0];
  const [line] = lines(ev.block);
  // said only as far as the counts go: all in one section, most (a majority) in one, more in one than in any other, or no section named for a tie
  const says = rows.length === 1 ? `all of them in section ${Number(top[0]) + 1}` : top[1] * 2 > counted.length ? `most of them in section ${Number(top[0]) + 1} (${top[1]})` : rows[1][1] < top[1] ? `more of them in section ${Number(top[0]) + 1} (${top[1]}) than in any other` : `in ${rows.length} sections, no more than ${top[1]} in any one`;
  assert.ok(line.startsWith(`- Rules: ${counted.length} places are flagged against your rules, ${says}; the rule flagged most is`), line);
  assert.ok(line.includes(`the rule flagged most is "Never use the word 'lantern'" (`), line);
  assert.match(line, /One rule needs the language model and was not checked by the program\.$/);
  const rb = readbackFrame({ analysis: a });
  assert.match(rb.lines.join('\n'), /places are flagged against your rules/);
});

test('rules: none set (or none enabled) means no rule instrument, and a rule-free text says nothing was flagged', () => {
  const { text } = chaptered(Array(4).fill({ words: 110 }), { seed: 12 });
  assert.equal(analyseText({ text, project: projectWith() }).rules, null);
  const off = withRules(projectWith(), ['Never use the word "lantern"']);
  off.rules[0].enabled = false;
  assert.equal(analyseText({ text, project: off }).rules, null);
  const ev = editorialEvidence({ analysis: analyseText({ text }), query: 'did I break my rules?' });
  assert.equal(lines(ev.block)[0], '- Rules: no rules were available to check any section against.');
  const clean = analyseText({ text, project: withRules(projectWith(), ['Never use the word "zeppelin"']) });
  assert.equal(clean.rules.count, 0);
  assert.equal(lines(editorialEvidence({ analysis: clean, query: 'rules?' }).block)[0], '- Rules: the program found nothing to flag in any of the 4 sections for the 1 rule it can check.');
});

// ── evidence ─────────────────────────────────────────────────────────────────

test('evidence: the question decides which instruments speak', () => {
  const cases = [
    ['is the pacing ok?', ['pacing']],
    ['who are the main characters?', ['cast']],
    ['are there any contradictions in the numbers?', ['figures', 'timeline', 'voice']],
    ['what about my voice and tense?', ['voice']],
    ['any repeated phrases or tics?', ['repeats']],
    ['what are the invented terms?', ['terms']],
    ['', null],
    ['what do you think of the whole thing?', null],
  ];
  for (const [query, expected] of cases) {
    const ev = editorialEvidence({ analysis: A, query });
    if (expected) assert.deepEqual(ev.used.filter((u, k, arr) => arr.indexOf(u) === k).slice(0, expected.length), expected.filter((e) => ev.used.includes(e)), query);
    else assert.ok(ev.used.length >= 4, `${query || '(no question)'}: a bundle of several instruments`);
    assert.ok(ev.block.startsWith('Measured from the text itself (counted by the program, not judged; section numbers are 1-based'), query);
  }
  assert.deepEqual(topicsOf('is the tense consistent?'), ['voice', 'consistency']);
  assert.deepEqual(topicsOf('hello'), ['bundle']);
  assert.deepEqual(topicsOf('who is in it and did I break my rules'), ['cast', 'rules']);
});

test('evidence: at most six lines, each citing sections, within the budget, hedged, never judging and never "the writer"', () => {
  const project = withRules(projectWith(), ['Never use the word "belly"', 'Keep the tone hopeful']);
  const full = analyseText({ text: BIBLE, project });
  const queries = ['', 'overall', 'is it consistent?', 'who is in it?', 'pacing?', 'voice?', 'did I break my rules?', 'repeats and tics', 'tense and numbers and timeline and rules and cast'];
  for (const analysis of [A, full]) {
    for (const query of queries) {
      for (const budget of [60, 150, 260, 420, 2000]) {
        const ev = editorialEvidence({ analysis, query, budgetTokens: budget });
        if (!ev.block) {
          assert.deepEqual(ev.used, []);
          continue;
        }
        assert.ok(estimateTokens(ev.block) <= budget, `${query}/${budget}: ${estimateTokens(ev.block)} tokens`);
        assert.equal(ev.stats.tokens, estimateTokens(ev.block));
        const ls = lines(ev.block);
        assert.ok(ls.length >= 1 && ls.length <= 6, `${query}: ${ls.length} lines`);
        assert.equal(ev.stats.lines, ls.length);
        for (const l of ls) {
          assert.match(l, /^- [A-Z][a-z]+: .+\.$/, l);
          assert.match(l, /section/i, `each line cites sections: ${l}`);
          assert.ok(!/\bthe writer\b/i.test(l) && !/\bthe author\b/i.test(l), l);
          assert.ok(!isPraiseOpener(l.replace(/^- [A-Za-z]+: /, '')), l);
          assert.ok(!/\b(?:good|bad|great|excellent|weak|strong|beautiful|compelling|boring|poor|well-written|mistake|error|wrong)\b/i.test(l), `no judgment: ${l}`);
        }
        assert.ok(ev.used.length >= 1);
      }
    }
  }
  assert.deepEqual(editorialEvidence({ analysis: A, query: 'pacing', budgetTokens: 5 }).block, '', 'no room: no block, not a cut-off one');
  assert.deepEqual(editorialEvidence({ analysis: null, query: 'pacing' }), { block: '', used: [], stats: editorialEvidence({ analysis: null, query: 'pacing' }).stats });
});

test('evidence: the names line is the recomputed count, first and last section', () => {
  const [line] = lines(editorialEvidence({ analysis: A, query: 'who are the characters?' }).block);
  const m = line.match(/^- Names: (.+?) appears in (\d+) of (\d+) sections \(first in (\d+), last in (\d+)\); /);
  assert.ok(m, line);
  const [, name, n, M, first, last] = m;
  const secs = sectionsMatching(BIBLE, new RegExp(`(?<![\\p{L}])${esc(name)}(?![\\p{L}])`, 'u'));
  assert.equal(Number(n), secs.length, 'sections where the name occurs, recounted from the text');
  assert.equal(Number(M), splitSections(BIBLE).length);
  assert.equal(Number(first), secs[0] + 1);
  assert.equal(Number(last), secs.at(-1) + 1);
  const gap = lines(editorialEvidence({ analysis: A, query: 'who drops out of the story?' }).block).find((l) => /but is not named in sections/.test(l));
  assert.equal(gap, '- Names: Jessamy Tolk appears in 6 of 25 sections but is not named in sections 16 to 22.');
  const present = sectionsMatching(BIBLE, /\bJessamy\b|\bTolk\b/);
  assert.equal(present.length, 6);
  assert.ok([15, 16, 17, 18, 19, 20, 21].every((i) => !present.includes(i)) && present.includes(14) && present.includes(22));
});

test('listSections writes 1-based sections the way a person would', () => {
  assert.equal(listSections([3]), 'section 4');
  assert.equal(listSections([2, 6, 11]), 'sections 3, 7 and 12');
  assert.equal(listSections([4, 5, 6, 7, 8, 9, 10, 11, 12, 13]), 'sections 5 to 14');
  assert.equal(listSections([0, 1, 5, 6, 7]), 'sections 1, 2 and 6 to 8');
  assert.equal(listSections([0, 2, 4, 6, 8, 10, 12, 14]), 'sections 1, 3, 5, 7, 9, 11 and 2 more');
  assert.equal(listSections([]), 'no section');
});

// ── read-back ────────────────────────────────────────────────────────────────

const NOT_ABOUT_THE_WRITER = (l) => !/\b(?:the|this) (?:writer|author)\b/i.test(l);

test('read-back of a pasted text with no question: counts, structure, style, names, what stands out, one question in the second person', () => {
  const rb = readbackFrame({ analysis: A });
  assert.ok(rb.lines.length >= 6 && rb.lines.length <= 12);
  assert.equal(rb.stats.lines, rb.lines.length);
  for (const l of rb.lines) {
    assert.ok(NOT_ABOUT_THE_WRITER(l), l);
    assert.ok(!isPraiseOpener(l), l);
    assert.ok(!/\b(?:great|wonderful|beautiful|compelling|impressive|masterful|brilliant|gripping|fascinating)\b/i.test(l), l);
    assert.ok(!/^(?:you should|try |consider |make sure|avoid |fix |add |cut |remove )/i.test(l), `no orders: ${l}`);
  }
  assert.ok(!speaksAboutTheWriter(rb.lines.join('\n')));
  assert.equal(rb.lines[0], 'I counted and measured it (25 sections, 10,374 words); I did not read it section by section with the language model.');
  assert.ok(rb.lines.slice(1).every((l) => !/\bI\b/.test(l)), 'NIE speaks in the first person only about what it did');

  // every number is recomputed from the text
  const split = splitSections(BIBLE);
  const built = rb.lines.find((l) => l.startsWith('How it is built:'));
  assert.ok(built.includes(`25 sections with a median length of ${fmt(median(split.map((s) => s.words)))} words`), built);
  const dated = [...BIBLE.matchAll(/^Year (\w+), (\w+)\./gm)];
  assert.ok(built.includes(`${dated.length} dated entries, from "Year one, February" in section ${sectionOfOffset(BIBLE, dated[0].index) + 1} to "Year nine, August" in section ${sectionOfOffset(BIBLE, dated.at(-1).index) + 1}`), built);
  const namesLine = rb.lines.find((l) => l.startsWith('Names that keep coming back:'));
  const entries = [...namesLine.matchAll(/([A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+)?)(?: \(also ([^)]*)\))? \((\d+) of (\d+) sections, from section (\d+) to (\d+)\)/g)];
  assert.equal(entries.length, 3);
  for (const [, name, also, n, M, a, b] of entries) {
    const forms = [name, ...(also ? also.split(/ and |, /) : [])].map(esc).join('|');
    const secs = sectionsMatching(BIBLE, new RegExp(`(?<![\\p{L}])(?:${forms})(?![\\p{L}])`, 'u'));
    assert.deepEqual([Number(n), Number(M), Number(a), Number(b)], [secs.length, 25, secs[0] + 1, secs.at(-1) + 1], name);
  }
  const termsLine = rb.lines.find((l) => l.startsWith('Terms that recur:'));
  for (const [, term, n] of termsLine.matchAll(/([A-Za-z ]+?) \((\d+) of 25 sections\)/g)) {
    assert.equal(Number(n), sectionsMatching(BIBLE, new RegExp(`(?<![\\p{L}\\p{N}])${esc(term.trim())}(?![\\p{L}\\p{N}])`, 'iu')).length, term);
  }

  // the question: one, specific, in the second person, built from the strongest finding (the contradiction)
  assert.equal(rb.question, 'Your text gives "forty thousand barrels" in section 3 and "sixty thousand barrels" in section 21 for "Brimmer": did you mean those to be the same measure?');
  assert.equal((rb.question.match(/\?/g) ?? []).length, 1);
  assert.match(rb.question, /\byou(?:r)?\b/i);
  assert.equal(rb.stats.standouts[0], 'figures.Brimmer.barrel');
  assert.ok(rb.stats.standouts.length <= 3);
});

test('read-back: it says it read the text only if notes made by the model say so', () => {
  const split = splitSections(BIBLE);
  const note = (by) => ({ gist: 'what the part says', names: [], terms: [], voice: '', by });
  assert.match(readbackFrame({ analysis: A, notes: split.map(() => note('model')) }).lines[0], /^I read it one section at a time and kept a short note on each \(25 sections, 10,374 words\)\.$/);
  assert.match(readbackFrame({ analysis: A, notes: { per: split.map((_, k) => (k < 10 ? note('model') : null)) } }).lines[0], /^I read 10 of its 25 sections one at a time and kept a short note on each \(10,374 words in all\)\.$/);
  for (const notes of [null, [], split.map(() => note('rules')), split.map(() => null), 'junk', 42]) {
    const first = readbackFrame({ analysis: A, notes }).lines[0];
    assert.ok(first.startsWith('I counted and measured it') && first.includes('I did not read it'), `${JSON.stringify(notes)?.slice(0, 30)}: ${first}`);
    assert.ok(!/I read /.test(first));
  }
});

test('read-back: the model\'s overview is kept only as far as the text supports it', () => {
  const split = splitSections(BIBLE);
  const notes = split.map(() => ({ gist: 'x', names: [], terms: [], voice: '', by: 'model' }));
  const overview = 'This is a bible for a country built on a cable railway called the Ladder. Haldric Ombrecht plunged into danger without context. Calla Reth measures the glacier Old Mara for twelve years. The writer keeps the reader curious.';
  const rb = readbackFrame({ analysis: A, notes, overview });
  const line = rb.lines.find((l) => l.startsWith('What it is, from my notes:'));
  assert.ok(line, rb.lines.join('\n'));
  assert.ok(line.includes('cable railway called the Ladder'));
  assert.ok(line.includes('Calla Reth measures the glacier Old Mara'), 'names the text has');
  assert.ok(!line.includes('Haldric Ombrecht'), 'two real names put together are not a person the text has');
  assert.ok(!line.includes('writer'), 'third person about the writer is dropped');
  assert.equal(rb.stats.overview, 'partly');
  assert.ok(rb.stats.overviewRemoved >= 2);

  const invented = readbackFrame({ analysis: A, notes, overview: 'Marcus Vane, a captain from Torvald Keep, sails to Brightwater.' });
  assert.ok(!invented.lines.some((l) => l.startsWith('What it is')));
  assert.equal(invented.stats.overview, 'dropped');
  const plain = 'This text is told in several parts and follows a few named people. It is organised in numbered sections, each taking up one thread.';
  const kept = readbackFrame({ analysis: A, notes, overview: plain });
  assert.ok(kept.lines.includes(`What it is, from my notes: ${plain}`));
  assert.equal(kept.stats.overview, 'kept');
  const noNotes = readbackFrame({ analysis: A, notes: null, overview: 'This is a bible for a country built on a cable railway called the Ladder.' });
  assert.ok(!noNotes.lines.some((l) => l.startsWith('What it is')), 'without notes made by the model there is no overview to show');
});

test('read-back: a text with nothing that stands out has no question, and the description of the style is used only if it is safe to say', () => {
  const calm = chaptered(Array(6).fill({ words: 110 }), { seed: 21, filler: 'unique' }).text;
  const rb = readbackFrame({ analysis: analyseText({ text: calm }) });
  assert.equal(rb.question, null);
  assert.ok(rb.lines.length >= 3 && rb.lines.length <= 12);
  const withStyle = readbackFrame({ analysis: A, style: 'Counted from the text itself (10,374 words in 400 sentences), it is written in third person. Every figure here is counted.' });
  assert.ok(withStyle.lines.includes('Counted from the text itself (10,374 words in 400 sentences), it is written in third person. Every figure here is counted.'));
  const unsafe = readbackFrame({ analysis: A, style: 'The writer has a wonderful, compelling voice.' });
  assert.ok(unsafe.lines.every(NOT_ABOUT_THE_WRITER) && !unsafe.lines.some((l) => /wonderful/.test(l)));
  assert.ok(unsafe.lines.some((l) => l.startsWith('How it is written: third person')), 'the measured line instead');
});

test('read-back: the strongest finding decides the question, and each kind of finding asks about itself', () => {
  const qs = {
    tense: analyseText({ text: chaptered([{ words: 110 }, { words: 110 }, { words: 110 }, { words: 110, tense: 'present' }, { words: 110, tense: 'present' }], { seed: 5 }).text }),
    name: analyseText({ text: chaptered(Array(5).fill({ words: 110 }), { seed: 8, name: 'Linnet Vass' }).text.replace(/Linnet Vass/, 'Linet Vass') }),
  };
  assert.match(readbackFrame({ analysis: qs.tense }).question, /^Section 4 reads as present tense/);
  const dropped = chaptered([{ words: 110 }, { words: 110 }, { words: 110, name: 'Orla Penn' }, { words: 110 }, { words: 110 }, { words: 110 }, { words: 110 }, { words: 110 }, { words: 110 }, { words: 110, name: 'Orla Penn' }], { seed: 13, name: 'Orla Penn' });
  const holes = chaptered(Array(10).fill({ words: 110 }), { seed: 13, name: 'Orla Penn' });
  const parts = holes.text.split('\n\n');
  // keep her name in chapters 1-3 and 10 only: the others speak of "the keeper"
  const edited = parts.map((p, k) => (k % 2 === 1 && k >= 7 && k <= 17 ? p.replaceAll('Orla Penn', 'the keeper') : p)).join('\n\n');
  const a = analyseText({ text: edited });
  const orla = a.cast.find((c) => c.name.startsWith('Orla'));
  assert.ok(orla && orla.gaps.length >= 1, JSON.stringify(a.cast));
  assert.ok(dropped.text.length > 0);
  const rb = readbackFrame({ analysis: a });
  if (rb.question && /Orla/.test(rb.question)) assert.match(rb.question, /^Orla Penn is not named in sections? [\d to,and ]+: is that an absence you intended\?$/);
});

// ── grounding ────────────────────────────────────────────────────────────────

test('groundNames removes the sentences that name people the text does not have, and keeps the rest word for word', () => {
  const reply = [
    'Isaura Ombrecht refuses to certify old ropes, which costs her the guild seal.',
    'Haldric Ombrecht plunged into danger without context.',
    "The Brimmer holds forty thousand barrels in your text, which sits oddly beside Calla Reth's report.",
    'Then Marcus Vane arrives at Greyfall.',
    'Consider Linnet\'s ear for ropes.',
  ].join(' ');
  const r = groundNames(reply, { sources: [BIBLE], known: ['NIE'] });
  assert.equal(r.text, 'Isaura Ombrecht refuses to certify old ropes, which costs her the guild seal. The Brimmer holds forty thousand barrels in your text, which sits oddly beside Calla Reth\'s report. Consider Linnet\'s ear for ropes.');
  assert.deepEqual(r.removed.map((x) => [x.sentence, x.names]), [
    ['Haldric Ombrecht plunged into danger without context.', ['Haldric Ombrecht']],
    ['Then Marcus Vane arrives at Greyfall.', ['Marcus Vane']],
  ]);
  assert.equal(r.emptied, false);
  // nothing was reworded: what is left is a sequence of the reply's own sentences
  for (const s of r.text.split(/(?<=\.) /)) assert.ok(reply.includes(s));
});

test('groundNames: a run of capitals must occur as a run; single names must occur; the capital that opens a sentence is not judged; known names are allowed', () => {
  const src = [BIBLE];
  const ok = (s, o = {}) => groundNames(s, { sources: src, ...o }).removed.length === 0;
  assert.ok(ok('Emeric Haldric shelved the report.'));
  assert.ok(ok('Commissioner Haldric shelved the report.'), 'a title and a surname of the text');
  assert.ok(!ok('Haldric Ombrecht shelved the report.'), 'two names of the text, never together');
  assert.ok(!ok('She asked Tobiah and Corvin Ashby.'));
  assert.ok(ok('Pacing slows in the middle, and Greyfall stays quiet.'), 'an ordinary word opening a sentence, a place of the text');
  assert.ok(ok('Think about what Linnet wants.'));
  assert.ok(!ok('Think about what Torvald wants.'));
  assert.ok(ok('Torvald is a name from your last message.', { sources: [BIBLE, 'My hero is called Torvald.'] }));
  assert.ok(!ok('The style guide says to follow the Hollis Manual here.'));
  assert.ok(ok('The style guide says to follow the Hollis Manual here.', { known: ['Hollis Manual of Style'] }));
  assert.ok(ok('The style guide says to follow the Chicago Manual here.'), 'the craft\'s own best-known names are built in');
  assert.ok(ok('Use the Idea Board, then run a Full Scan in NIE.'), "NIE's own words");
  assert.ok(ok('On Monday in March the Ladder opened.'), 'days and months are never names');
  assert.ok(ok('I think Section Twelve and Chapter 3 are the ones to read.'), 'heading words and numbers are not names');
  assert.ok(ok('"Hold," Isaura said.'));
  assert.ok(!ok('Orrel\'s Crossing is where Dr. Quillon waits.'));
  assert.ok(ok('Greyfall-bound cars carry water.'), 'a compound is its first word');
});

test('groundNames: a number stated as a fact about the text must be in the text; section numbers are places, unless there is no such section', () => {
  const run = (s, o = {}) => groundNames(s, { sources: [BIBLE], ...o });
  assert.deepEqual(run('Your chapter 12 runs to 3,400 words.').removed.map((x) => x.numbers), [['3,400']]);
  assert.equal(run('The belly holds ninety barrels in your text.').removed.length, 0, 'ninety is in the text');
  assert.equal(run('The belly holds 90 barrels in your text.').removed.length, 0, '"90" and "ninety" are the same number');
  assert.deepEqual(run('Your text says the belly holds 85 barrels.').removed.map((x) => x.numbers), [['85']]);
  assert.equal(run('Here are 250 things to try on a new story.').removed.length, 0, 'not about the text');
  assert.equal(run('Look at sections 3, 7 and 12.', { sections: 25 }).removed.length, 0);
  assert.deepEqual(run('Section 99 drags.', { sections: 25 }).removed.map((x) => x.numbers), [['99']]);
  assert.equal(run('Section 99 drags.').removed.length, 0, 'without a section count a locator is left alone');
  assert.equal(run('Your draft has 25 sections and 10,374 words.', { sources: [BIBLE, '25 sections, 10,374 words'] }).removed.length, 0, 'measured facts the reply was given are sources too');
});

test('groundNames with facts: a year, decade, century or rhyme scheme that no source has goes with its sentence; a century or decade is grounded by a year in it', () => {
  const src = ['The villanelle has nineteen lines. Passerat\'s poem was printed in 1606, after his death. Dylan Thomas wrote one in 1947 and published it in 1951. Nineteenth-century writers fixed the pattern; the sixteenth-century Italian villanella was a part-song. A sonnet may rhyme ABABCDCDEFEFGG. Poems of the 1950s.'];
  const bad = (s) => groundNames(s, { sources: src, known: ['NIE'], facts: true }).removed.flatMap((r) => r.numbers);
  assert.deepEqual(bad("Passerat's poem was printed in 1606."), [], 'a year the sources have');
  assert.deepEqual(bad("Passerat's poem was printed in 1607."), ['1607'], 'a year they do not');
  assert.deepEqual(bad('It became popular in the 17th century.'), [], 'the 17th century, grounded by 1606');
  assert.deepEqual(bad('It became popular in the 18th century.'), ['18th century'], 'a century nothing in the sources reaches');
  assert.deepEqual(bad('Nineteenth-century writers fixed it, and the sixteenth-century villanella was a part-song.'), [], 'centuries in words');
  assert.deepEqual(bad('It spread in the mid-20th century.'), [], 'grounded by 1947');
  assert.deepEqual(bad('Poets of the 1950s used it.'), [], 'a decade the sources have');
  assert.deepEqual(bad('Poets of the 1960s used it.'), ['1960s'], 'a decade they do not');
  assert.deepEqual(bad('It spread in the 17th and 18th centuries.'), ['18th century'], 'both centuries are judged');
  assert.deepEqual(bad('The sonnet scheme is ABABCDCDEFEFGG.'), [], 'a scheme the sources have');
  assert.deepEqual(bad('The villanelle scheme is typically ABAABCCDDCDEEDCDEE.'), ['ABAABCCDDCDEEDCDEE'], 'a scheme they do not');
  assert.deepEqual(bad('It has five tercets and a final quatrain, nothing counted that the sources lack.'), [], 'numbers in words and ordinary words are not judged here');
  const r = groundNames('The poem was printed in 1606. It was famous by 1750.', { sources: src, known: [], facts: true });
  assert.equal(r.text, 'The poem was printed in 1606.', 'only the sentence with the unsupported year goes, and nothing is reworded');
  assert.equal(groundNames('It was famous by 1750.', { sources: src, known: [] }).removed.length, 0, 'without facts the check is as it was');
});

test('groundNames with facts: headings, word counts, edition years and "the 1500s" are not mistaken for rhyme schemes, invented years or invented decades', () => {
  const run = (sources, reply) => groundNames(reply, { sources, known: [], facts: true }).removed.flatMap((r) => r.numbers);
  assert.deepEqual(run(['x'], 'You should NEVER info dump, and KEY POINTS: be brief. UNESCO set a poetry day.'), [], 'capitals that are not rhyme-scheme letters');
  assert.deepEqual(run(['x'], 'Flash fiction usually runs under 1,500 words, or 1200 pages for a saga.'), [], 'a count is not a year');
  assert.deepEqual(run(['It runs under two thousand words.'], 'It runs under 2000 words.'), [], 'a count in words in the source');
  assert.deepEqual(run(['The edition of 2017 and APA 7th ed. (2019).'], 'Chicago (2017) and APA (2019) differ.'), [], 'years a record states');
  assert.deepEqual(run(['It arrived in the sixteenth century.'], 'The sonnet reached England in the 1500s.'), [], 'the 1500s is also the sixteenth century');
  assert.deepEqual(run(['Realism grew in the 19th century.'], 'Realism grew in the mid-1800s.'), []);
  assert.deepEqual(run(['x'], 'It happened in the 1900s.'), ['1900s'], 'a decade on a hundred no source reaches');
  assert.deepEqual(run(['x'], 'The scheme is ABABCDCDEFEFGG.'), ['ABABCDCDEFEFGG']);
});

test('groundNames with facts is fast on pathological input (a long run of ordinals, in the reply or in a source)', () => {
  const t0 = Date.now();
  groundNames(`${'1st, '.repeat(10000)} end.`, { sources: ['x'], facts: true });
  groundNames(`${'first and '.repeat(8000)} end.`, { sources: ['1st-'.repeat(100000)], facts: true });
  assert.ok(Date.now() - t0 < 2500, `took ${Date.now() - t0} ms`);
});

test('sentences: "ed." and "c." do not end a sentence', async () => {
  const { sentenceSpans } = await import('../apps/web/src/engine/editor/sentences.js');
  assert.equal(sentenceSpans('APA 7th ed. (2019) uses figures for 10 and up. Chicago 17th ed. (2017) spells most out.').length, 2);
  assert.equal(sentenceSpans('Passerat (c. 1574) wrote it. Others followed.').length, 2);
});

test('groundNames: removal keeps lists and paragraphs tidy; an empty result is "" and says so; bad input is harmless', () => {
  const reply = 'Here is what I see:\n\n- Dessa Varnholt keeps the Book.\n- Torvald Henkel keeps the keys.\n- Rurik Sennet passes the brake band.\n\nThat is all.';
  const r = groundNames(reply, { sources: [BIBLE] });
  assert.equal(r.text, 'Here is what I see:\n\n- Dessa Varnholt keeps the Book.\n- Rurik Sennet passes the brake band.\n\nThat is all.');
  assert.deepEqual(r.removed.map((x) => x.names), [['Torvald Henkel']]);
  const none = groundNames('Torvald Henkel plunged into danger. Marcus Vane followed him.', { sources: [BIBLE] });
  assert.equal(none.text, '');
  assert.equal(none.emptied, true);
  assert.equal(none.removed.length, 2);
  for (const bad of [null, undefined, 42, {}, '', '   ']) assert.deepEqual(groundNames(bad, { sources: [BIBLE] }), { text: '', removed: [], emptied: false });
  assert.equal(groundNames('Isaura said so.', { sources: [null, 7, BIBLE], known: [3, null] }).text, 'Isaura said so.');
  assert.equal(groundNames('Plain words with no names at all.').text, 'Plain words with no names at all.');
  // with no sources at all every name in a reply is unsupported
  assert.equal(groundNames('Then Tobiah left.').removed.length, 1);
});

test('groundNames is quick on a long source and does not keep the writer\'s text between calls', () => {
  const big = makeLongText({ words: 150000, seed: 5 }).text;
  const t0 = performance.now();
  const r1 = groundNames('Wren Calloway carried a ledger to the boathouse. Zorgan Plimsoll waited there.', { sources: [big] });
  const r2 = groundNames('Wren Calloway carried a ledger to the boathouse. Zorgan Plimsoll waited there.', { sources: [big] });
  const ms = performance.now() - t0;
  assert.deepEqual(r1, r2);
  assert.deepEqual(r1.removed.map((x) => x.names), [['Zorgan Plimsoll']]);
  assert.ok(ms < 8000, `${Math.round(ms)} ms`);
  // another source in the next call: nothing of the first is remembered
  assert.equal(groundNames('Wren Calloway waited.', { sources: ['A story about Fenn Marlowe and the ferry.'] }).removed.length, 1);
  // the cache is bounded, and the caller can empty it when the writer switches or deletes a project
  for (let k = 0; k < 12; k++) groundNames('Anything.', { sources: [`Source number ${k} about Ilsa Quade.`] });
  assert.ok(groundingCacheSize() >= 1 && groundingCacheSize() <= 5, `${groundingCacheSize()} sources kept`);
  clearGroundingCache();
  assert.equal(groundingCacheSize(), 0);
  assert.equal(groundNames('Wren Calloway waited.', { sources: ['A story about Wren Calloway.'] }).removed.length, 0);
});

// ── speaking to the writer ───────────────────────────────────────────────────

test('speaksAboutTheWriter: the screenshot reply is caught, replies to "you" and craft talk about writers in general are not', () => {
  const screenshot = "How does the writer maintain the reader's curiosity throughout the text?";
  assert.equal(speaksAboutTheWriter(screenshot), true);
  assert.equal(speaksAboutTheWriter('This writer returns to the ledger in every part.'), true);
  assert.equal(speaksAboutTheWriter("The author's use of tense changes in section 9."), true);
  assert.equal(speaksAboutTheWriter('The user wants to keep the Ladder.'), true);
  assert.equal(speaksAboutTheWriter('How do you keep your reader curious throughout the text?'), false);
  assert.equal(speaksAboutTheWriter('Many writers hold back the cause of a stall until late.'), false);
  assert.equal(speaksAboutTheWriter('A writer can plant a clue early.'), false);
  assert.equal(speaksAboutTheWriter('The author of Dune used long appendices.'), false);
  assert.equal(speaksAboutTheWriter('Open the user interface from Settings.'), false);
  assert.equal(speaksAboutTheWriter(''), false);
  assert.equal(speaksAboutTheWriter(null), false);
  const reply = 'Your opening is slow. How does the writer maintain the reader\'s curiosity? Section 9 changes tense.';
  const found = findThirdPerson(reply);
  assert.equal(found.length, 1);
  assert.equal(found[0].phrase, 'the writer');
  assert.equal(reply.slice(found[0].start, found[0].end), 'the writer');
  assert.equal(found[0].sentence.text, "How does the writer maintain the reader's curiosity?");
  assert.equal(reply.slice(found[0].sentence.start, found[0].sentence.end), found[0].sentence.text);
  assert.deepEqual(findThirdPerson('You decide.'), []);
});

test('nothing the instruments say speaks about the person NIE is talking to in the third person', () => {
  const project = withRules(projectWith(), ['Never use the word "belly"']);
  const a = analyseText({ text: BIBLE, project });
  for (const query of ['', 'rules', 'who', 'tense', 'pacing', 'numbers', 'tics']) assert.equal(speaksAboutTheWriter(editorialEvidence({ analysis: a, query }).block), false, query);
  assert.equal(speaksAboutTheWriter(readbackFrame({ analysis: a }).lines.join('\n')), false);
  for (const f of standouts(a)) {
    assert.ok(!speaksAboutTheWriter(f.text) && !speaksAboutTheWriter(f.question), f.id);
    assert.equal((f.question.match(/\?/g) ?? []).length, 1, f.question);
    assert.ok(f.question.endsWith('?') && /\byou(?:r)?\b/i.test(f.question), f.question);
  }
});

// ── invariants over many texts ───────────────────────────────────────────────

/** Section numbers cited in a line ("section 4", "sections 3, 7 and 12", "sections 5 to 14", "first in 2, last in 27", "from section 9 to 24"), 1-based. */
function citedSections(line) {
  const out = [];
  for (const m of line.matchAll(/\bsections? ((?:\d+(?:, | and | to |, and )?)+)/g)) for (const n of m[1].matchAll(/\d+/g)) out.push(Number(n[0]));
  for (const m of line.matchAll(/\b(?:first|last) in (\d+)/g)) out.push(Number(m[1]));
  return out;
}

test('over many different texts every number the instruments hand out is in range, every quotation is an exact fragment of the text, every count is recounted', () => {
  const project = withRules(projectWith(), ['Never use the word "lantern"', 'No adverbs']);
  const diary = ['March 3, 1987', 'March 9, 1987', 'January 2, 1987', 'April 4, 1988'].map((d, k) => `${d}\n\n${paragraph(500, { seed: 40 + k })}`).join('\n\n');
  const texts = [
    BIBLE,
    makeLongText({ words: 9000, seed: 4 }).text,
    diary,
    chaptered(Array(8).fill({ words: 110 }), { seed: 31 }).text,
    chaptered([{ words: 110, extra: 'The tower holds ninety barrels.' }, { words: 500 }, { words: 110, extra: 'The tower holds sixty barrels.' }, { words: 110 }, { words: 110, tense: 'present', person: 'first' }, { words: 110 }], { seed: 32 }).text,
    chaptered(Array(7).fill({ words: 120 }), { seed: 33, filler: 'unique' }).text,
    MEMOIR,
    SCREENPLAY,
    POEMS,
    ESSAY,
    DIALOGUE,
    FIRST_PERSON,
    NOSENT,
    MEMOIR.replace(/\n/g, '\r\n'),
  ];
  for (const text of texts) {
    const a = analyseText({ text, project });
    assert.deepEqual(a.failed, []);
    const M = a.covered.sections;
    const split = splitSections(text);
    const inRange = (i) => Number.isInteger(i) && i >= 0 && i < M;
    // cast
    for (const c of a.cast) {
      assert.ok(c.sections.every(inRange) && c.sections.every((x, k) => k === 0 || x > c.sections[k - 1]), c.name);
      assert.equal(c.first, c.sections[0]);
      assert.equal(c.last, c.sections.at(-1));
      for (const [from, to] of c.gaps) assert.ok(inRange(from) && inRange(to) && from <= to);
    }
    // quotations: figures, repeats, rules, time stamps, terms
    for (const f of a.figures) for (const i of f.items) {
      assert.ok(inRange(i.section) && sectionText(text, split[i.section]).includes(i.quote) && sectionText(text, split[i.section]).includes(i.written), i.quote);
      assert.ok(wordsIn(i.quote).length <= 14 && i.quote.includes(i.written.split(/\s/)[0]));
    }
    for (const r of a.repeats) {
      assert.ok(r.sections.every(inRange));
      if (r.kind !== 'phrase') continue;
      assert.ok(text.includes(r.phrase) && wordsIn(r.phrase).length <= 14, r.phrase);
      const occurrences = (text.match(new RegExp(`(?<![\\p{L}\\p{N}])${esc(r.phrase.toLowerCase()).replace(/ /g, ' ')}(?![\\p{L}\\p{N}'’-])`, 'giu')) ?? []).length;
      assert.ok(occurrences >= r.count, `${r.phrase}: ${occurrences} occurrences, ${r.count} counted`);
      assert.deepEqual(r.sections, sectionsMatching(text, new RegExp(`(?<![\\p{L}\\p{N}])${esc(r.phrase)}(?![\\p{L}\\p{N}'’-])`, 'iu')).filter((i) => i < M), r.phrase);
    }
    if (a.rules) for (const f of a.rules.findings) assert.ok(inRange(f.section) && text.slice(f.start, f.end).startsWith(f.quote.slice(0, 1)) && text.includes(f.quote) && wordsIn(f.quote).length <= 14);
    for (const s of a.timeline.stamps) assert.ok(inRange(s.section) && sectionText(text, split[s.section]).includes(s.label));
    for (const t of a.terms) {
      assert.ok(t.sections.every(inRange));
      assert.deepEqual(t.sections, sectionsMatching(text, new RegExp(`(?<![\\p{L}\\p{N}])${esc(t.term)}(?![\\p{L}\\p{N}])`, 'iu')).filter((i) => i < M), t.term);
    }
    // pacing and voice
    for (const o of a.pacing.outliers) assert.equal(o.ratio, Math.round((o.words / a.pacing.median) * 1000) / 1000);
    for (const u of a.pacing.units) assert.ok(inRange(u.from) && inRange(u.to) && u.from <= u.to && u.words >= 0 && typeof u.title === 'string' && text.includes(u.title), u.title);
    for (const o of a.pacing.unitOutliers) assert.equal(o.ratio, Math.round((o.words / a.pacing.unitMedian) * 1000) / 1000);
    assert.equal(a.headings.count, (a.sections.reduce((n, x) => n + x.headings, 0)));
    for (const kind of ['person', 'tense']) {
      const runs = a.voice[kind];
      assert.equal(runs[0].from, 0);
      assert.equal(runs.at(-1).to, M - 1);
      runs.forEach((r, k) => k === 0 || assert.equal(r.from, runs[k - 1].to + 1));
    }
    for (const s of a.voice.shifts) {
      const label = s.what === 'tense' ? 'tense' : 'pov';
      assert.equal(styleProfile(sectionText(text, split[s.at]))[label].label, s.to);
      assert.equal(styleProfile(sectionText(text, split[s.previous]))[label].label, s.from);
      assert.ok(s.previous < s.at);
    }
    // names that may be slips occur where they say
    for (const n of a.names) for (const i of n.sections) assert.ok(new RegExp(`(?<![\\p{L}])${esc(n.b)}(?![\\p{L}])`, 'u').test(sectionText(text, split[i])), n.b);
    // every line says only sections the text has, and nothing about quality
    for (const query of ['', 'pacing', 'who', 'rules', 'tense and numbers']) {
      const ev = editorialEvidence({ analysis: a, query });
      for (const l of lines(ev.block)) assert.ok(citedSections(l).every((n) => n >= 1 && n <= M), l);
    }
    const rb = readbackFrame({ analysis: a });
    for (const l of [...rb.lines, rb.question ?? '']) assert.ok(citedSections(l).every((n) => n >= 1 && n <= M), l);
    assert.ok(rb.lines.length <= 12);
  }
});

// ── bounds, robustness ───────────────────────────────────────────────────────

test('a 150,000-word text is analysed in bounded time and bounded size', () => {
  const names = ['Isaura', 'Tobiah', 'Linnet', 'Dessa', 'Rurik', 'Calla', 'Emeric', 'Jessamy', 'Greyfall', 'Ostrel'];
  const copies = Array.from({ length: 15 }, (_, k) => BIBLE.replace(new RegExp(`\\b(${names.join('|')})`, 'g'), (m) => `${m}${'abcdefghijklmnopqrstuvwxyz'[k]}${k % 7}`));
  const big = copies.join('\n\n');
  assert.ok(big.match(/\S+/g).length >= 150000);
  const t0 = performance.now();
  const a = analyseText({ text: big });
  const ms = performance.now() - t0;
  assert.ok(ms < 15000, `${Math.round(ms)} ms for the default 120 sections`);
  assert.deepEqual(a.failed, []);
  assert.equal(a.covered.sections, 120);
  assert.equal(a.covered.complete, false);
  assert.ok(a.sectionCount > 300 && a.sections.length === 120);
  assert.ok(a.cast.length <= 40 && a.repeats.length <= 13 && a.figures.length <= 30 && a.terms.length <= 30 && a.names.length <= 10);
  assert.ok(JSON.stringify(a).length < 600000, `${JSON.stringify(a).length} characters`);
  const t1 = performance.now();
  const all = analyseText({ text: big, maxSections: 2000 });
  const ms2 = performance.now() - t1;
  assert.ok(ms2 < 40000, `${Math.round(ms2)} ms for every section`);
  assert.equal(all.covered.complete, true);
  assert.equal(all.sections.length, all.sectionCount);
  const ev = editorialEvidence({ analysis: a, query: 'overall' });
  assert.ok(estimateTokens(ev.block) <= 420);
  assert.match(ev.block.split('\n')[0], /only the first 120 of \d+ sections were measured/);
});

test('ten thousand words take well under a second (callers cache the analysis by the hash of the text)', () => {
  analyseText({ text: BIBLE }); // warm
  const t0 = performance.now();
  analyseText({ text: BIBLE });
  const ms = performance.now() - t0;
  assert.ok(ms < 1500, `${Math.round(ms)} ms`);
});

test('inputs are never mutated: a deep-frozen project, notes, index and analysis go through every function', () => {
  const project = deepFreeze(withRules(projectWith(), ['Never use the word "belly"', 'Keep the tone hopeful']));
  const notes = deepFreeze(splitSections(BIBLE).map(() => ({ gist: 'x', names: ['Isaura'], terms: ['belly'], voice: '', by: 'model' })));
  const index = buildIndex(BIBLE);
  const a = analyseText({ text: BIBLE, project, notes, index });
  assert.deepEqual(a.failed, []);
  assert.ok(a.rules && a.usedNotes);
  deepFreeze(a);
  const ev = editorialEvidence({ analysis: a, query: 'overall', project });
  assert.ok(ev.block);
  const rb = readbackFrame({ analysis: a, notes, overview: 'A bible for a country on a cable railway.', style: 'Counted from the text itself.', project });
  assert.ok(rb.lines.length);
  const sources = deepFreeze([BIBLE.slice(0, 5000)]);
  const known = deepFreeze(['NIE']);
  assert.ok(groundNames('Drevast stands.', { sources, known }).text);
  assert.ok(standouts(a).length);
});

test('junk never throws and gives empty-but-valid results', () => {
  const junk = ['', ' ', '\n\n\n', 'Hello', 'One.', '!!! ??? ...', '"Yes." "No." "Maybe."', '"Yes," she said. "No," he said.', '😀😀😀 😀🎉', 'x'.repeat(50000), 'word '.repeat(3000), '12345 67890 1,234 5.5', '\u0000\u0001\u0002 text �', 'ÀÉÎ ÕÜ ñandú Straße', 'ALL CAPS TEXT WITH NO LOWER CASE LETTERS AT ALL. ANOTHER LINE OF SHOUTING.', '# Title\n\n* * *\n\n---\n\n***', '\r\n\r\nWindows lines\r\nand more\r\n'];
  for (const text of junk) {
    const a = analyseText({ text });
    assert.deepEqual(a.failed, [], JSON.stringify(text.slice(0, 20)));
    assert.ok(Array.isArray(a.sections) && Array.isArray(a.cast) && Array.isArray(a.repeats) && Array.isArray(a.figures) && Array.isArray(a.terms) && Array.isArray(a.names));
    assert.ok(Array.isArray(a.pacing.outliers) && Array.isArray(a.voice.shifts) && Array.isArray(a.timeline.stamps));
    assert.ok(Number.isFinite(a.words) && a.words >= 0);
    assert.deepEqual(JSON.parse(JSON.stringify(a)), a);
    for (const query of ['', 'pacing', 'who', 'rules']) {
      const ev = editorialEvidence({ analysis: a, query });
      assert.equal(typeof ev.block, 'string');
      assert.ok(Array.isArray(ev.used));
      if (ev.block) assert.ok(lines(ev.block).length <= 6);
    }
    const rb = readbackFrame({ analysis: a, notes: [null], overview: 'Some words.' });
    assert.ok(Array.isArray(rb.lines) && rb.lines.length <= 12);
    assert.ok(rb.question === null || typeof rb.question === 'string');
    assert.ok(rb.lines.every((l) => typeof l === 'string' && l.length > 0 && NOT_ABOUT_THE_WRITER(l)));
    groundNames(text, { sources: [text] });
    speaksAboutTheWriter(text);
  }
  for (const bad of [undefined, null, 42, 'a string', [], {}, { text: null }, { text: 7 }, { text: 'Fine words here.', maxSections: -3 }, { text: 'Fine words here.', maxSections: NaN }, { text: 'Fine words here.', index: 'nope', notes: 5, project: 'x' }]) {
    const a = analyseText(bad);
    assert.ok(Array.isArray(a.sections));
  }
  for (const bad of [undefined, null, {}, { analysis: null }, { analysis: {} }, { analysis: { sections: 'x' } }]) {
    assert.deepEqual(editorialEvidence(bad).block, '');
    assert.deepEqual(readbackFrame(bad).lines, []);
    assert.equal(readbackFrame(bad).question, null);
  }
  const empty = analyseText({ text: '' });
  assert.deepEqual(empty.sections, []);
  assert.equal(empty.words, 0);
  assert.equal(empty.rules, null);
  assert.equal(editorialEvidence({ analysis: empty, query: 'pacing' }).block, '');
  assert.deepEqual(readbackFrame({ analysis: empty }).lines, []);
});

test('a text with one word, one sentence or no punctuation gets honest minimal results', () => {
  const one = analyseText({ text: 'Lantern' });
  assert.equal(one.words, 1);
  assert.equal(one.sectionCount, 1);
  assert.deepEqual(one.cast, []);
  assert.deepEqual(one.pacing.outliers, []);
  const rb = readbackFrame({ analysis: one });
  assert.equal(rb.lines[0], 'I counted and measured it (1 section, 1 word); I did not read it section by section with the language model.');
  assert.equal(rb.question, null);
  const dialogueOnly = analyseText({ text: '"Come here," she said. "No," he said. "Why not?" she asked. "Because," he said.' });
  assert.ok(dialogueOnly.sections[0].dialogueShare > 0.3);
  assert.deepEqual(dialogueOnly.voice.shifts, []);
});

test('a screenplay\'s speakers are its cast: three cues on a line of their own make a name, and scene headings are not names', () => {
  const cue = (name, line) => `${name}\n${line}\n\n`;
  const text = `INT. KITCHEN - NIGHT\n\nRain on the shutters. Nora stands at the stove.\n\n${cue('NORA', 'You said the lamp was fixed.')}${cue('DESMOND (O.S.)', 'I said it would be.')}${cue('NORA', 'There are nine ships out there.')}${cue('DESMOND', 'Eleven. I counted.')}${cue('NORA', 'Then go and look.')}${cue('DESMOND', 'Ah.')}INT. LAMP ROOM - LATER\n\nNora kneels beside the lens.\n\n${cue('NORA (V.O.)', 'Forty-one steps.')}`;
  const a = analyseText({ text });
  assert.deepEqual(a.cast.map((c) => [c.name, c.kind]), [['NORA', 'person'], ['DESMOND', 'person']]);
  assert.equal(a.cast[0].mentions, (text.match(/\bNora\b/gi) ?? []).length);
  assert.ok(!a.cast.some((c) => /INT|KITCHEN|LAMP/.test(c.name)));
  assert.equal(analyseText({ text: text.replace(/\n/g, '\r\n') }).cast.length, 2, 'Windows line ends too');
});

test('the long invented text keeps working: its ten characters are all found, chapters are the units, nothing conflicts', () => {
  const { text } = makeLongText({ words: 10000, seed: 7 });
  const a = analyseText({ text });
  assert.deepEqual(a.failed, []);
  assert.ok(['Ilsa Quade', 'Tomas Verrick', 'Marit Oland', 'Dov Anselm', 'Brenna Hale', 'Corin Ashby', 'Odalys Venn', 'Pell Hargrove', 'Wren Calloway', 'Fenn Marlowe'].every((n) => a.cast.some((c) => c.name === n)));
  assert.ok(a.pacing.units.length >= 15);
  assert.equal(a.pacing.units[0].title, 'Chapter 1');
  assert.ok(a.figures.every((f) => !f.conflict));
  assert.deepEqual(a.timeline.jumps, []);
});


// ── adversarial reading: texts of other kinds, read line by line against what is in them ────────────────────────────────

const countOf = (text, re) => (text.match(re) ?? []).length;
const castOf = (a) => Object.fromEntries(a.cast.map((c) => [c.name, c]));

test('a first-person memoir: the cast is the people and places it names, with recounted mentions; no month, day, feast or "the Moon" is a name; every line is true of it', () => {
  const a = analyseText({ text: MEMOIR });
  assert.deepEqual(a.failed, []);
  const cast = castOf(a);
  assert.deepEqual(Object.keys(cast).sort(), ['Aunt Dilys', 'Cardiff', 'Dad', 'Mum', 'Pryce']);
  assert.equal(cast.Dad.mentions, countOf(MEMOIR, /\bDad\b/g));
  assert.equal(cast.Mum.mentions, countOf(MEMOIR, /\bMum\b/g));
  assert.equal(cast['Aunt Dilys'].mentions, countOf(MEMOIR, /\bAunt Dilys\b/g));
  assert.equal(cast.Pryce.mentions, countOf(MEMOIR, /\bPryce\b/g));
  assert.deepEqual(cast.Pryce.sections, sectionsMatching(MEMOIR, /\bPryce\b/));
  assert.deepEqual(cast.Cardiff.sections, sectionsMatching(MEMOIR, /\bCardiff\b/));
  assert.equal(cast.Cardiff.kind, 'place');
  for (const wrong of ['March', 'Sunday', 'Monday', 'Tuesday', 'June', 'October', 'September', 'Moon', 'Then', 'Later', 'Chapter']) assert.ok(!(wrong in cast) && !a.terms.some((t) => t.term === wrong), wrong);
  // the headings are counted in the text: four chapter headings, whatever the splitter did
  assert.equal(a.headings.count, countOf(MEMOIR, /^Chapter \d/gm));
  assert.equal(a.headings.first, 'Chapter 1: The Farm at Pantglas');
  assert.equal(a.headings.last, 'Chapter 4: Leaving');
  // no quoted speech, first person, past: the style line says what the text has
  const ev = editorialEvidence({ analysis: a, query: 'what about the voice?' }).block;
  assert.match(ev, /Style: first person, mostly past tense; sentences average \d+ words; no quoted dialogue was found/);
  // nothing stands out in it, so there is nothing to ask
  assert.equal(readbackFrame({ analysis: a }).question, null);
  // the two sheep counts ("forty sheep", "all sixty of them") are not a measure of anything the program can compare: it says so rather than guess
  assert.deepEqual(a.figures, []);
});

test('a screenplay: a speaker named in capitals on a line of their own is counted with the same name in mixed case; sluglines and transitions are never names', () => {
  const a = analyseText({ text: SCREENPLAY });
  assert.deepEqual(a.failed, []);
  const cast = castOf(a);
  // "Desmond crosses to the sink" and "DESMOND (O.S.)" and "DESMOND'S KITCHEN" are one person: 11 places, not the 3 written in mixed case
  assert.equal(cast.Desmond.mentions, countOf(SCREENPLAY, /\bdesmond\b/gi));
  assert.equal(cast.Desmond.mentions, 11);
  assert.equal(cast.Desmond.kind, 'person');
  assert.equal(cast.NORA.mentions, countOf(SCREENPLAY, /\bnora\b/gi));
  assert.deepEqual(cast.Desmond.sections, [0]);
  for (const wrong of ['INT', 'EXT', 'FADE', 'CUT', 'DISSOLVE', 'THE END', 'DAWN', 'NIGHT', 'MORNING', 'DAY', 'IN', 'OUT']) assert.ok(!(wrong in cast), wrong);
  const names = editorialEvidence({ analysis: a, query: 'who are the characters?' }).block;
  assert.match(names, /Names: (?:Desmond comes up 11 times; NORA 11|NORA comes up 11 times; Desmond 11)/);
  assert.ok(!/\b(?:INT|EXT|FADE)\b/.test(names));
});

test('a sequence of poems: lines are not sentences, the headings counted are the ones in the text, and a refrain is reported as a refrain, with a question', () => {
  const a = analyseText({ text: POEMS });
  assert.deepEqual(a.failed, []);
  // the headings the splitter recognises, recounted from the paragraphs of the text (the splitter put several of them inside two sections)
  const headings = splitParagraphs(POEMS).filter((p) => isHeading(p.text) && p.text.replace(/[#\s*_=~–—-]/g, ''));
  assert.equal(a.headings.count, headings.length);
  assert.ok(a.sectionCount < a.headings.count, 'fixture: more headings than sections');
  const rb = readbackFrame({ analysis: a });
  const built = rb.lines.find((l) => l.startsWith('How it is built'));
  assert.ok(built.includes(`${a.headings.count} headings`) && !/parts under headings/.test(built), built);
  // a stretch under a heading is measured on the text, not on the sections it happens to touch
  assert.equal(a.pacing.units.length, headings.length);
  a.pacing.units.forEach((u, k) => {
    const to = k + 1 < headings.length ? headings[k + 1].start : POEMS.length;
    assert.equal(u.words, words(POEMS.slice(headings[k].start, to)).length, u.title);
    assert.equal(u.title, headings[k].text);
  });
  // lines are not sentences: the sentence length of verse is not offered
  assert.ok(!/sentences average/.test(rb.lines.join('\n')));
  // the line "My mother kept a lamp..." / "My father kept a count..." begins four sentences of the text in a row; said as a possible tic, asked about
  const opener = a.repeats.find((r) => r.kind === 'opener');
  assert.deepEqual({ phrase: opener.phrase, count: opener.count }, { phrase: 'My', count: 4 });
  assert.match(rb.question, /^"My" begins 4 sentences in a row in section 1: did you intend that run\?$/);
});

test('an essay: the numbered list, the cited study and "The Moon" at the start of a sentence give no name, no figure and no conflict', () => {
  const a = analyseText({ text: ESSAY });
  assert.deepEqual(a.failed, []);
  assert.deepEqual(a.cast, []);
  assert.deepEqual(a.figures, [], 'list numbers, a year and a study of 32 people are not measures to compare');
  assert.deepEqual(a.timeline.jumps, []);
  assert.ok(!a.terms.some((t) => /moon/i.test(t.term)));
  const ev = editorialEvidence({ analysis: a, query: 'is it consistent? any typos?' }).block;
  assert.match(ev, /no measure stated in more than one section/);
});

test('a dialogue-heavy chapter: a person named only at the start of sentences is found, and two people answering each other are not one tic', () => {
  const a = analyseText({ text: DIALOGUE });
  assert.deepEqual(a.failed, []);
  const cast = castOf(a);
  assert.ok(cast.Tobias, 'Tobias is only ever written at the start of a sentence ("Tobias looked at the floor.")');
  assert.equal(cast.Tobias.kind, 'person');
  assert.equal(cast.Tobias.mentions, countOf(DIALOGUE, /\bTobias\b/g));
  assert.deepEqual(cast.Tobias.sections, sectionsMatching(DIALOGUE, /\bTobias\b/));
  assert.equal(cast.Imogen.mentions, countOf(DIALOGUE, /\bImogen\b/g));
  assert.equal(cast.Marsh.mentions, countOf(DIALOGUE, /\bMarsh\b/g));
  // "To Leeds?" (one speaker) and "To Leeds. To anywhere. To the station" (the other) are four "To" in a row only if the turns are run together
  assert.deepEqual(a.repeats.filter((r) => r.kind === 'opener'), []);
  assert.equal(readbackFrame({ analysis: a }).question, null);
});

test('a text with no sentences: honest, minimal, nothing invented, no question', () => {
  const a = analyseText({ text: NOSENT });
  assert.deepEqual(a.failed, []);
  assert.deepEqual(a.cast, []);
  assert.deepEqual(a.figures, []);
  assert.deepEqual(a.repeats, []);
  const rb = readbackFrame({ analysis: a });
  assert.equal(rb.question, null);
  assert.ok(rb.lines.length >= 1 && rb.lines.length <= 12);
  assert.ok(rb.lines.every((l) => !speaksAboutTheWriter(l) && !isPraiseOpener(l)));
  assert.match(editorialEvidence({ analysis: a, query: 'what is the tense?' }).block, /Voice: no section has enough verb or pronoun cues|few of its words are common English words/);
});

test('"I\'d", "I\'m" and "I\'ll" are the narrator, not a name; a feast, a language and the label of a number ("Figure 3", "Day Two") are not people', () => {
  const a = analyseText({ text: FIRST_PERSON });
  assert.deepEqual(a.failed, []);
  const bad = new Set(["I'd", "I'm", "I'll", "I've", 'Christmas', 'Easter', 'English', 'French', 'Figure', 'Table', 'Day', 'Hello', 'Okay', 'Yes', 'No', 'Prof', 'Dr']);
  for (const c of a.cast) assert.ok(!bad.has(c.name) && !c.aliases.some((x) => bad.has(x)), c.name);
  for (const t of a.terms) assert.ok(!bad.has(t.term), t.term);
  assert.ok(a.cast.some((c) => c.name === 'Tom') && a.cast.some((c) => c.name === 'Ana'));
  const rb = readbackFrame({ analysis: a });
  assert.ok(!/I'd|I'm|I'll/.test(rb.lines.join('\n')));
});

test('an age is not a measure: "nine years old" in one chapter and "ten years old" in another is a person growing up', () => {
  const pad = 'Rain fell on the roof all afternoon and nobody came to the door, so I sat with the ledger and counted the little I had left. '.repeat(4);
  const mk = (bodies) => bodies.map((b, i) => `Chapter ${i + 1}\n\n${b} ${pad}`).join('\n\n');
  assert.deepEqual(analyseText({ text: mk(['Marta was nine years old when the war began.', 'Marta was ten years old at the wedding.']) }).figures, []);
  assert.deepEqual(analyseText({ text: mk(['The boy was nine years old when it began.', 'The boy was twelve years old when it ended.']) }).figures, []);
  // a duration is still compared
  const war = analyseText({ text: mk(['The war lasted 4 years.', 'The war lasted 6 years.']) });
  assert.equal(war.figures.length, 1);
  assert.equal(war.figures[0].conflict, true);
});

test('names: a rare word that is a name plus an ordinary ending ("Marshy" for "Marsh") is not offered as a slip; a plain slip still is', () => {
  const withMarshy = DIALOGUE.replace('Outside a car went by', 'Marshy ground lay outside. Outside a car went by');
  assert.deepEqual(analyseText({ text: withMarshy }).names, []);
  const slip = DIALOGUE.replace('Tobias did not move.', 'Marhs nodded. Tobias did not move.').replace('Marsh said nothing.', 'Marsh said nothing. Marsh smiled. Marsh frowned.');
  const names = analyseText({ text: slip }).names;
  assert.deepEqual(names.map((n) => [n.a, n.b]), [['Marsh', 'Marhs']]);
});

test('read-back: a model\'s overview loses the sentences that praise the writing or tell the writer what to do, whole, and keeps the rest word for word', () => {
  const a = analyseText({ text: MEMOIR });
  const notes = a.sections.map(() => ({ by: 'model', gist: 'x', names: [], terms: [] }));
  const lineOf = (overview) => readbackFrame({ analysis: a, notes, overview }).lines.find((l) => l.startsWith('What it is'));
  assert.equal(lineOf('The prose is beautiful and the pacing is masterful. The memoir follows a family from a Welsh farm to Cardiff.'), 'What it is, from my notes: The memoir follows a family from a Welsh farm to Cardiff.');
  assert.equal(lineOf('It is a moving, compelling story with a strong voice. Dad sold sixty sheep.'), 'What it is, from my notes: Dad sold sixty sheep.');
  assert.equal(lineOf('A haunting memoir about Dad and a farm.'), undefined, 'a sentence that only praises leaves nothing');
  assert.equal(lineOf('You should cut chapter 3. Dad sold sixty sheep.'), 'What it is, from my notes: Dad sold sixty sheep.');
  assert.equal(lineOf('It tells of a poor family in Cardiff and the strike.'), 'What it is, from my notes: It tells of a poor family in Cardiff and the strike.', 'description of the story is kept');
  // a caller's own description of the style goes through the same filter
  assert.ok(!readbackFrame({ analysis: a, style: 'Counted from the text itself, it has a vivid and masterful voice.' }).lines.some((l) => /masterful/.test(l)));
});

test('rules: two rules flagged equally often are both named, and a tie between sections names no section', () => {
  const body = (k, extra) => `Chapter ${k}\n\n${paragraph(110, { seed: 20 + k, filler: 'unique' })} ${extra}`;
  // "lantern" once in each of four chapters and "ledger" once in each of the same four: two rules, four places each, one place in every section
  const text = [1, 2, 3, 4].map((k) => body(k, 'A lantern hung there beside the ledger.')).join('\n\n');
  const project = withRules(projectWith(), ['Never use the word "lantern"', 'Never use the word "ledger"']);
  const a = analyseText({ text, project });
  assert.equal(a.rules.count, 8);
  const line = lines(editorialEvidence({ analysis: a, query: 'did I break my rules?' }).block)[0];
  assert.equal(line, `- Rules: 8 places are flagged against your rules, in 4 sections, no more than 2 in any one; the rules flagged most are "Never use the word 'lantern'" and "Never use the word 'ledger'" (4 places each).`);
  // one rule, one place in each of four sections: no section is named as "the one with most"
  const one = analyseText({ text: [1, 2, 3, 4].map((k) => body(k, 'A lantern hung there.')).join('\n\n'), project: withRules(projectWith(), ['Never use the word "lantern"']) });
  const l1 = lines(editorialEvidence({ analysis: one, query: 'rules' }).block)[0];
  assert.equal(l1, `- Rules: 4 places are flagged against your rules, in 4 sections, no more than 1 in any one; the rule flagged most is "Never use the word 'lantern'" (4 places, across 4 sections).`);
  assert.match(readbackFrame({ analysis: one }).question, /^Your rule "Never use the word 'lantern'" is flagged 4 times, across 4 sections: are those places exceptions you intended\?$/);
  // all in one section, then a clear lead
  const concentrated = analyseText({ text: [1, 2, 3].map((k) => body(k, k === 2 ? 'A lantern, a lantern, a lantern.' : '')).join('\n\n'), project: withRules(projectWith(), ['Never use the word "lantern"']) });
  assert.match(lines(editorialEvidence({ analysis: concentrated, query: 'rules' }).block)[0], /^- Rules: 3 places are flagged against your rules, all of them in section 2; the rule flagged most is "Never use the word 'lantern'" \(3 places, all in section 2\)\.$/);
});

test('pacing: a section exactly twice the median is "twice", not "more than twice"', () => {
  const { text } = chaptered([{ words: 110 }, { words: 110 }, { words: 110 }, { words: 500 }, { words: 110 }, { words: 110 }], { seed: 3 });
  const a = JSON.parse(JSON.stringify(analyseText({ text })));
  a.pacing.unitOutliers[0].ratio = 2;
  assert.match(readbackFrame({ analysis: a }).question, /is twice the length of a typical stretch/);
  a.pacing.unitOutliers[0].ratio = 2.5;
  assert.match(readbackFrame({ analysis: a }).question, /is more than twice the length/);
  a.pacing.unitOutliers[0].ratio = 3;
  assert.match(readbackFrame({ analysis: a }).question, /is three times the length/);
});

test('the dated entries that go back are "dated earlier" and "comes after", true even when other entries sit between them', () => {
  const pad = 'Rain fell on the roof all afternoon and nobody came to the door, so I sat with the ledger and counted the little I had left. '.repeat(4);
  const text = ['Day 1', 'Week 2', 'Day 2', 'Week 1'].map((h) => `${h}\n\n${pad}`).join('\n\n');
  const a = analyseText({ text });
  const line = lines(editorialEvidence({ analysis: a, query: 'is the timeline right?' }).block).find((l) => l.startsWith('- Timeline'));
  assert.match(line, /^- Timeline: the dated entries go back in time: "Week 1" \(section \d\) comes after "Week 2" \(section \d\) but is dated earlier\.$/);
});

test('stretches under headings are measured on the text: a chapter that shares a section with the end of the one before it keeps its true length', () => {
  const { text } = makeLongText({ words: 10000, seed: 7 });
  const a = analyseText({ text });
  const marks = [...text.matchAll(/^Chapter \d+$/gm)];
  assert.equal(a.headings.count, marks.length);
  assert.equal(a.pacing.units.length, marks.length);
  marks.forEach((m, k) => {
    const to = k + 1 < marks.length ? marks[k + 1].index : text.length;
    assert.equal(a.pacing.units[k].words, words(text.slice(m.index, to)).length, m[0]);
    const secs = splitSections(text);
    const first = secs.find((s) => s.start <= m.index && m.index < s.end).i;
    assert.equal(a.pacing.units[k].from, first, m[0]);
  });
});

// ── grounding, the other direction: legitimate replies must survive ──────────────────────────────────────────────────────

test('groundNames keeps the craft\'s own words: terms, themes, style guides, a title-cased label, a plural of a word the sources have', () => {
  const sources = [MEMOIR];
  const keeps = [
    'Dramatic Irony works when the reader knows what Dad hides.',
    'The Call to Adventure comes in chapter 2, and the Dark Night of the Soul comes late.',
    'Your Opening Image is the cold back bedroom, and the Midpoint falls near chapter 3.',
    'The Fish Out of Water pattern applies to Cardiff.',
    "You might test the Show, Don't Tell rule on chapter 2.",
    'The Rule of Three suits the three trunks in chapter 1.',
    'Backstory is handled with Flashbacks.',
    'Themes: Loss, Memory, and Family.',
    'The themes of Loss and Memory recur.',
    'Foreshadowing Aunt Dilys\'s death would help.',
    'The Elements of Style by Strunk and White would call this prose plain.',
    'Orwell argued for plain words in "Politics and the English Language".',
    'Many Memoirs follow the Bildungsroman pattern.',
    'Adverbs cluster in the middle chapters.',
    'Plain words suit the Cardiff chapters.',
    'Humour lightens the Pryce scenes.',
    'Consider Whether Dad is hiding something.',
    'Key Observations: chapter 2 is the longest.',
  ];
  for (const reply of keeps) assert.deepEqual(groundNames(reply, { sources, known: ['NIE', 'Memoir'] }).removed, [], reply);
});

test('groundNames cuts a single invented name that opens a sentence and is followed by a verb, and leaves a label, a list head and an imperative alone', () => {
  const sources = [MEMOIR];
  const cuts = ['Torvald waits at the gate.', 'Elowen waves from the lane.', 'Gwen leaves.', 'Perhaps Zorvath is the name you want.', 'Meanwhile Zorvath waits at the Lid.'];
  for (const reply of cuts) assert.equal(groundNames(reply, { sources }).removed.length, 1, reply);
  const stays = ['Torvald: the rival of Dad.', '- **Torvald**: the rival.', 'Reconsider the ending.', 'Dad waits at the gate.', 'Pacing slows in chapter 3.', 'Readers expect more of Mrs Pryce.', 'Cardiff changes everything.', 'Plain words suit the farm.'];
  for (const reply of stays) assert.equal(groundNames(reply, { sources }).removed.length, 0, reply);
  // a name refused in one sentence goes from the others of the reply
  const r = groundNames('Torvald waits at the gate. Dad meets Torvald in chapter 2. Dad sold the sheep.', { sources });
  assert.equal(r.text, 'Dad sold the sheep.');
});

test('groundNames: an estimate that says it is one is checked within five percent, an exact claim is not', () => {
  const src = ['Your draft is 10,374 words in 25 sections.'];
  const cut = (s) => groundNames(s, { sources: src }).removed.length === 1;
  assert.equal(cut('Your draft runs to about 10,000 words.'), false);
  assert.equal(cut('The text is nearly 10,400 words.'), false);
  assert.equal(cut('Your draft runs to 10,000 words.'), true);
  assert.equal(cut('Your draft has around 12,000 words.'), true);
});

test('speaksAboutTheWriter: "the user-friendly page" and "the author-date style" are not the person NIE is talking to', () => {
  assert.equal(speaksAboutTheWriter('the user-friendly page'), false);
  assert.equal(speaksAboutTheWriter('Chicago has an author-date system as well as notes.'), false);
  assert.equal(speaksAboutTheWriter('the author-date style, and the user is here'), true);
});

test('public functions take what a caller might pass by mistake: null options, a number for a list, notes that are not lists', () => {
  assert.equal(groundNames('Hello there.', null).text, 'Hello there.');
  assert.equal(listSections({}), 'no section');
  assert.equal(listSections(7), 'no section');
  assert.equal(typeof analysisKey({ text: 'x', notes: [{ names: 5, terms: 'x', by: 'model' }, null, 3] }), 'string');
  assert.deepEqual(analyseText({ text: MEMOIR, notes: [{ names: 5, terms: 'x', by: 'model' }, null, 3, 'x'] }).failed, []);
});

test('a term a model noted is believed only as far as the text bears it out: "Book" is not a term of a text that only says "the book" in nearly every section', () => {
  const parts = Array.from({ length: 10 }, (_, i) => `Chapter ${i + 1}\n\nThe keeper opened the book again and read the page about the belly of the tank. The tide was low and the lamp was out. She closed the book and counted the steps down to the cellar before dark, as she always did in the thin season.`);
  const text = parts.join('\n\n');
  const per = Array.from({ length: 10 }, () => ({ by: 'model', gist: 'A keeper reads.', names: [], terms: ['Book', 'book', 'belly'], voice: 'plain' }));
  const terms = analyseText({ text, notes: per }).terms.map((t) => t.term.toLowerCase());
  assert.ok(!terms.includes('book'), `the ordinary word is not a term: ${terms}`);
  // a lower-case word a model noted is not a term unless the text defines it
  const six = Array.from({ length: 6 }, (_, i) => `Chapter ${i + 1}\n\nThe station was cold and she had a hand on the rail. A steel tank called a belly hung under the car. The belly held the water, and the station kept the key. She counted the steps down to the cellar before dark.`).join('\n\n');
  const noted = analyseText({ text: six, notes: Array.from({ length: 6 }, () => ({ by: 'model', gist: 'x', names: [], terms: ['station', 'hand', 'belly'], voice: 'plain' })) }).terms.map((t) => t.term.toLowerCase());
  assert.ok(!noted.includes('station') && !noted.includes('hand'), `ordinary words a note named are not terms: ${noted}`);
  assert.ok(noted.includes('belly'), `a word the text defines is: ${noted}`);
});

test('measuredAnswer: a question about a number, a date or the tense is answered by the counts, only the counts that question is about, and every number in it is in the text', () => {
  const ask = (q) => measuredAnswer({ analysis: A, query: q });
  const fig = ask('The bible says how much water the Brimmer holds when it is full. Does it say the same thing everywhere?');
  assert.ok(fig, 'answered');
  assert.deepEqual(fig.used, ['figures']);
  assert.match(fig.text, /forty thousand barrels/);
  assert.match(fig.text, /sixty thousand barrels/);
  assert.ok(BIBLE.includes('forty thousand barrels') && BIBLE.includes('sixty thousand barrels'));
  assert.ok(fig.question && /did you mean/i.test(fig.question));
  assert.ok(!speaksAboutTheWriter(fig.text));

  const time = ask('Where does the timeline jump backward, and to what moment does it go back?');
  assert.deepEqual(time.used, ['timeline'], 'a question about the timeline is not answered with the figures');
  assert.match(time.text, /Year six, July/);
  assert.match(time.text, /Year one, November/);
  assert.doesNotMatch(time.text, /thousand barrels/);

  const pov = ask('What point of view and tense is this bible written in?');
  assert.match(pov.lines[0], /^Third person/, 'what it is comes before where it changes');
  assert.match(ask('Is the pacing even throughout?').text, /Section lengths run from \d+ words/);
});

test('measuredAnswer: no answer from the counts when the question asks for a judgment, a reason or a comparison, names what nothing counted is about, or asks about the cast', () => {
  const none = [
    'Is the pacing good, and should I trim the middle?',
    'How does the memo differ in register from the rest of the bible?',
    'Does the bible give the same year for the Fourth Line runaway in the character notes and in the dated entries?',
    'Who are the main characters and what do they do?',
    'Why does the timeline jump backward?',
    'Tell me what you make of the pacing in this bible.',
    'What do you think of the pacing?',
    'What if the Commissioner lied about the numbers?',
    '',
    'Hello',
  ];
  for (const q of none) assert.equal(measuredAnswer({ analysis: A, query: q }), null, q);
  for (const bad of [null, undefined, {}, { sections: [] }, 3, 'x']) assert.equal(measuredAnswer({ analysis: bad, query: 'Is the pacing even?' }), null);
  assert.equal(measuredAnswer(null), null);
  assert.equal(measuredAnswer(), null);
});

test('measuredAnswer says when only part of a long text was measured, and never asks a question about a finding it left out', () => {
  const partial = analyseText({ text: BIBLE, maxSections: 10 });
  const r = measuredAnswer({ analysis: partial, query: 'Is the text consistent about numbers and dates?' });
  if (r) {
    assert.match(r.text, /Only the first 10 of 25 sections were measured/);
    const ids = r.lines.length;
    assert.ok(ids >= 1);
  }
  const fig = measuredAnswer({ analysis: A, query: 'Is the text consistent about numbers?' });
  if (fig?.question) assert.ok(fig.lines.some((l) => /thousand barrels/.test(l)), 'the question belongs to a line that is in the answer');
});
