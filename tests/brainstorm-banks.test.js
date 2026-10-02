import test from 'node:test';
import assert from 'node:assert/strict';
import { BANKS } from '../apps/web/src/engine/brainstorm/ideas.js';
import { KIND_IDS, LENSES, LENSES_BY_KIND } from '../apps/web/src/engine/brainstorm/lenses.js';
import { FALLBACK_SLOTS, SAMPLE_SLOTS, SLOT_NAMES, fillSlots } from '../apps/web/src/engine/brainstorm/slots.js';

/**
 * The idea banks are what offline NIE brainstorms from. They hold CONCEPT-LEVEL ideas only: a "what if", an angle,
 * a complication, a question. Never manuscript prose, dialogue or scene text. These checks keep that true.
 *
 * Format of banks/<kind>.js:   export default [ ['lens', 'Template text with optional {who} {place} {topic} {theme} slots.'], … ];
 */

const MIN_PER_LENS = 6;
const MIN_TOTAL = { story: 100, character: 60, world: 45, article: 70, essay: 50, poem: 45, script: 50 };
const GENERATED = new Set(['blend']); // genre blends come from the knowledge library, not a bank
const stop = new Set('a an and are as at be but by for from has have in into is it its of on or that the their them they this to was were what when where which who with your you not no than then so if'.split(' '));
const content = (s) => new Set(s.toLowerCase().replace(/\{\w+\}/g, '').match(/[a-z']+/g)?.filter((w) => !stop.has(w) && w.length > 2) ?? []);
const jaccard = (a, b) => {
  const inter = [...a].filter((x) => b.has(x)).length;
  return inter / (a.size + b.size - inter || 1);
};

for (const kind of KIND_IDS) {
  const bank = BANKS[kind];
  const allowed = new Set(LENSES_BY_KIND[kind].filter((l) => !GENERATED.has(l)));

  test(`bank "${kind}": shape, lenses and size`, () => {
    assert.ok(Array.isArray(bank), 'default export is an array');
    const problems = [];
    for (const [i, row] of bank.entries()) {
      if (!Array.isArray(row) || row.length !== 2 || typeof row[0] !== 'string' || typeof row[1] !== 'string') problems.push(`row ${i}: must be [lens, text]`);
      else if (!allowed.has(row[0])) problems.push(`row ${i}: lens "${row[0]}" is not valid for ${kind} (allowed: ${[...allowed].join(', ')})`);
    }
    assert.deepEqual(problems, []);
    assert.ok(bank.length >= MIN_TOTAL[kind], `${kind} has ${bank.length} ideas, needs at least ${MIN_TOTAL[kind]}`);
    const counts = Object.fromEntries([...allowed].map((l) => [l, bank.filter((r) => r[0] === l).length]));
    const thin = Object.entries(counts).filter(([, n]) => n < MIN_PER_LENS).map(([l, n]) => `${l}: ${n}`);
    assert.deepEqual(thin, [], `each lens needs at least ${MIN_PER_LENS} ideas`);
  });

  test(`bank "${kind}": every idea is a concept, not prose`, () => {
    const problems = [];
    for (const [lens, text] of bank) {
      const tag = `[${lens}] ${text.slice(0, 70)}`;
      const words = text.trim().split(/\s+/).length;
      if (text.length < 35 || text.length > 300) problems.push(`${tag}: length ${text.length} (35–300)`);
      if (words > 48) problems.push(`${tag}: ${words} words (max 48)`);
      if (!/[.?]$/.test(text)) problems.push(`${tag}: must end with . or ?`);
      if (/["“”`]/.test(text)) problems.push(`${tag}: no quotation marks or backticks (that would be dialogue or drafted text)`);
      if (/[*#_]{1,}/.test(text.replace(/\{\w+\}/g, ''))) problems.push(`${tag}: no markdown characters`);
      if (/\d/.test(text)) problems.push(`${tag}: no digits (no invented statistics or dates)`);
      if (/(?:^|[.?]\s+)(?:He|She|They|I|We)\s+\w+ed\b/.test(text)) problems.push(`${tag}: reads like narration ("She walked…"), not an idea`);
      if (/^\s/.test(text) || /\s$/.test(text) || /\s{2,}/.test(text)) problems.push(`${tag}: stray whitespace`);
      for (const m of text.matchAll(/\{(\w*)\}/g)) if (!SLOT_NAMES.includes(m[1].toLowerCase())) problems.push(`${tag}: unknown slot {${m[1]}}`);
      if (/[{}]/.test(text.replace(/\{(?:who|place|topic|theme)\}/gi, ''))) problems.push(`${tag}: stray brace`);
    }
    assert.deepEqual(problems, []);
  });

  test(`bank "${kind}": reads correctly with neutral fallbacks and with real project material`, () => {
    const problems = [];
    for (const [lens, text] of bank) {
      for (const [label, slots] of [['fallback', FALLBACK_SLOTS], ['sample', SAMPLE_SLOTS]]) {
        const out = fillSlots(text, slots);
        const tag = `[${lens}/${label}] ${out.slice(0, 80)}`;
        if (!/^[A-Z]/.test(out)) problems.push(`${tag}: must start with a capital (use {Who} at the start of a sentence)`);
        if (/\b(\w+) \1\b/i.test(out)) problems.push(`${tag}: repeated word`);
        if (/\b(?:the|a|an) (?:your|the|a|an)\b/i.test(out)) problems.push(`${tag}: article before a slot value that already has one (use {who}, not "the {who}")`);
        if (/\{|\}/.test(out)) problems.push(`${tag}: unresolved slot`);
      }
    }
    assert.deepEqual(problems, []);
  });

  test(`bank "${kind}": no duplicates or near-duplicates`, () => {
    const problems = [];
    const seen = new Map();
    for (const [lens, text] of bank) {
      const key = text.toLowerCase();
      if (seen.has(key)) problems.push(`duplicate: ${text.slice(0, 70)}`);
      seen.set(key, lens);
    }
    for (const lens of allowed) {
      const rows = bank.filter((r) => r[0] === lens).map((r) => [r[1], content(r[1])]);
      for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) if (jaccard(rows[i][1], rows[j][1]) > 0.6) problems.push(`[${lens}] too similar:\n    ${rows[i][0]}\n    ${rows[j][0]}`);
    }
    assert.deepEqual(problems, []);
  });
}

test('every lens has a label, a follow-up question and a matcher', () => {
  for (const [id, l] of Object.entries(LENSES)) {
    assert.ok(l.label && l.ask && l.match instanceof RegExp && l.follow?.length >= 2, `lens ${id} is incomplete`);
  }
});
