#!/usr/bin/env node
// Ask a built pack questions and print exactly what NIE would show: the top articles and, for "what is X", the quoted opening.
//   node scripts/encyclopedia-probe.mjs dist/encyclopedia/simple-en.niepack "who was Albert Einstein" "what is a sonnet"
//   node scripts/encyclopedia-probe.mjs PACK --canary     fail (exit 1) unless the common-knowledge canaries below are found; used by the build workflow
import { Pack } from '../apps/web/src/engine/encyclopedia/pack.js';
import { definitionalAnswer } from '../apps/web/src/engine/encyclopedia/define.js';

const [file, ...rest] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node scripts/encyclopedia-probe.mjs <pack> [--canary] ["question" ...]');
  process.exit(1);
}
// Plain, stable facts every general encyclopedia has: the question, and a title that must be among the top 3 hits (or the exact definition title).
const CANARIES = [
  ['who was Albert Einstein', 'Albert Einstein'],
  ['what is a sonnet', 'Sonnet'],
  ['what is photosynthesis', 'Photosynthesis'],
  ['who wrote Pride and Prejudice', 'Pride and Prejudice'],
  ['Eiffel Tower', 'Eiffel Tower'],
];
// Questions whose answer is not NAMED in them: a search over article openings finds articles about France or Italy, not Paris or Rome, and measured on the real pack no ranking
// setting fixes that (scripts/encyclopedia-eval.mjs). They are reported as a known gap, never as a pass, and do not fail the build; the model can still answer from a source that names it.
const KNOWN_GAPS = [['capital of France', 'Paris']];
const canary = rest.includes('--canary');
const questions = rest.filter((a) => a !== '--canary');

const pack = await Pack.open(file);
const i = pack.info;
console.log(`${i.name}: ${i.docs.toLocaleString('en-US')} articles, ${i.terms.toLocaleString('en-US')} terms, ${(i.bytes / 1048576).toFixed(1)} MB, built ${i.builtAt}`);

async function ask(q) {
  const t = Date.now();
  const hits = await pack.search(q, { limit: 5 });
  const ms = Date.now() - t;
  console.log(`\n? ${q}   (${ms} ms)`);
  for (const [n, h] of hits.entries()) console.log(`  ${n + 1}. ${h.title}  ${h.score.toFixed(2)}  ${h.snippet.slice(0, 110)}`);
  const sources = [];
  for (const [n, h] of hits.slice(0, 3).entries()) sources.push({ n: n + 1, title: h.title, text: (await pack.get(h.id)).text });
  const def = definitionalAnswer({ question: q, sources });
  if (def) console.log(`  → quoted: ${def.reply}`);
  return { hits, def, ms };
}

let failed = 0;
for (const q of questions) await ask(q);
if (canary) {
  for (const [q, title] of CANARIES) {
    const { hits, def, ms } = await ask(q);
    const ok = hits.slice(0, 3).some((h) => h.title === title) || def?.title === title;
    if (!ok) {
      failed++;
      console.log(`  ✗ expected "${title}" among the top 3`);
    }
    if (ms > 1500) {
      failed++;
      console.log(`  ✗ took ${ms} ms`);
    }
  }
  for (const [q, title] of KNOWN_GAPS) {
    const { hits, def } = await ask(q);
    const found = hits.slice(0, 3).some((h) => h.title === title) || def?.title === title;
    console.log(found ? `  (known gap closed: "${title}" is now in the top 3)` : `  ⚠ known gap, not a failure: "${title}" is not in the top 3; the answer is not named in the question`);
  }
  console.log(failed ? `\n${failed} canary check(s) failed.` : '\nAll canary checks passed (the known gaps above are reported, not hidden).');
}
await pack.close();
process.exit(failed ? 1 : 0);
