// Measures the editorial instruments (apps/web/src/engine/editor/) against the invented story bible's answer key (tests/fixtures/story-bible.*), with NO model:
// they are ordinary code, so this runs anywhere in a second.
//
//   node scripts/editor-probe.mjs [--json]
//
// It reports, honestly, what the counts find and what they miss: how many of the bible's people they list (and where they say they first and last appear),
// whether the two planted inconsistencies are flagged, whether the backwards jump in the dated entries is found, which defined terms recur, and how many of the
// replies a "reply that invents things" check would cut. It never calls a model and it is not a quality score.
import { analyseText, editorialEvidence, groundNames, readbackFrame } from '../apps/web/src/engine/editor/index.js';
import { createProjectData } from '../apps/web/src/engine/project/store.js';
import { loadBible } from '../tests/fixtures/story-bible.mjs';

const { text, truth } = loadBible();
const lower = (t) => String(t).toLowerCase();
const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(0)}%` : 'n/a');
const project = createProjectData({ title: 'Probe', storyText: text });
const t0 = Date.now();
const a = analyseText({ text, project });
const ms = Date.now() - t0;
const out = { ms, sections: a.sectionCount, words: a.words, covered: a.covered };

// 1. the cast: does the list hold each of the bible's people (by name or alias), and are first/last sections right (±1)?
const castRows = truth.cast.map((c) => {
  const names = [c.name, ...(c.aliases ?? [])].map(lower);
  const hit = a.cast.find((x) => [x.name, ...(x.aliases ?? [])].some((n) => names.includes(lower(n)) || names.some((m) => lower(n).includes(m) || m.includes(lower(n)))));
  return { name: c.name, found: Boolean(hit), first: hit?.first, last: hit?.last, truthFirst: c.firstSection, truthLast: c.lastSection, firstOk: hit ? Math.abs(hit.first - c.firstSection) <= 1 : false };
});
out.cast = { found: castRows.filter((r) => r.found).length, of: castRows.length, firstOk: castRows.filter((r) => r.firstOk).length, rows: castRows, listed: a.cast.slice(0, 12).map((c) => `${c.name} (${c.kind})`) };

// 2. defined terms that recur in the list of terms
const termList = (a.terms ?? []).map((t) => lower(t.term ?? t.name ?? t));
out.terms = { found: truth.terms.filter((t) => termList.some((x) => x.includes(lower(t.term)) || lower(t.term).includes(x))).length, of: truth.terms.length };

// 3. planted inconsistencies: a figures conflict naming both numbers, or a timeline jump
const evidenceAll = editorialEvidence({ analysis: a, query: 'Is this consistent everywhere? Check the numbers and the dates.', budgetTokens: 2000 }).block;
const inconsistency = [
  { id: 'Brimmer volume (forty / sixty thousand barrels)', ok: /forty thousand/i.test(evidenceAll) && /sixty thousand/i.test(evidenceAll) },
  { id: 'Fourth Line runaway (Year two vs Year three)', ok: /runaway/i.test(evidenceAll) && /Year (?:two|three)/i.test(evidenceAll) },
];
out.inconsistencies = inconsistency;
const jump = truth.questions.find((q) => q.id === 'timeline-jump');
out.timelineJump = { ok: /go back in time/i.test(evidenceAll) && /Year six/.test(evidenceAll) && /Year one/.test(evidenceAll), asked: jump?.ask };

// 4. what the read-back says (the first thing a writer sees after pasting a text with no question)
const frame = readbackFrame({ analysis: a });
out.readback = { lines: frame.lines, question: frame.question };

// 5. the invented-names check: replies that name things the text does not
const REPLIES = [
  { r: 'Isaura Ombrecht runs the Greyfall yard and Linnet follows her.', invented: false },
  { r: 'Zephyrine Blackwood duels Maximilian Starfall at Castle Dunravel.', invented: true },
  { r: 'The Brimmer holds forty thousand barrels in section 3 and sixty thousand in section 21.', invented: false },
  { r: 'In section 99 Isaura sells the Ladder for four hundred thousand barrels.', invented: true },
];
out.grounding = REPLIES.map(({ r, invented }) => {
  const g = groundNames(r, { sources: [text], known: ['NIE'], sections: a.sectionCount });
  return { reply: r, invented, cut: g.removed.length > 0 };
});

console.log(`analysed ${a.words.toLocaleString('en-US')} words in ${a.sectionCount} sections in ${ms} ms (measured ${a.covered.sections} of ${a.covered.of} sections)`);
console.log(`cast: ${out.cast.found}/${out.cast.of} of the bible's people are in the list (${pct(out.cast.found, out.cast.of)}); first section within one: ${out.cast.firstOk}/${out.cast.of}`);
console.log(`  listed: ${out.cast.listed.join('; ')}`);
for (const r of castRows) console.log(`  ${r.found ? 'ok  ' : 'MISS'} ${r.name}: first ${r.first ?? '-'} (true ${r.truthFirst}), last ${r.last ?? '-'} (true ${r.truthLast})`);
console.log(`terms: ${out.terms.found}/${out.terms.of} defined terms are in the list of recurring terms`);
for (const i of inconsistency) console.log(`inconsistency ${i.ok ? 'FOUND' : 'missed'}: ${i.id}`);
console.log(`dated entries going backwards: ${out.timelineJump.ok ? 'FOUND' : 'missed'}`);
for (const g of out.grounding) console.log(`grounding ${g.invented === g.cut ? 'right' : 'WRONG'}: ${g.invented ? 'invented' : 'true'} reply ${g.cut ? 'was cut' : 'was kept'}: ${g.reply.slice(0, 70)}`);
console.log('read-back:');
for (const l of frame.lines) console.log(`  ${l}`);
console.log(`  ${frame.question}`);
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
