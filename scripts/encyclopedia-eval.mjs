#!/usr/bin/env node
// How well does a built pack find the article that answers a common-knowledge question? Runs tests/fixtures/encyclopedia-questions.json against a pack, for the shipped ranking and for a
// few alternative settings, and prints hit@1 / hit@3 / hit@5 / reciprocal rank for each, then every question the best setting missed.
//   node scripts/encyclopedia-eval.mjs dist/encyclopedia/simple-en.niepack
//   node scripts/encyclopedia-eval.mjs PACK --min-hit3 0.8     exit 1 when the shipped setting's hit@3 is below that (used by the build workflow)
// A question whose article the pack does not hold counts as a miss: read the list, do not trust the number alone. It measures retrieval only; it says nothing about the truth of an article.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pack, TUNING } from '../apps/web/src/engine/encyclopedia/pack.js';

const [file, ...rest] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node scripts/encyclopedia-eval.mjs <pack> [--min-hit3 0.8]');
  process.exit(1);
}
const opt = (n, d) => (rest.includes(n) ? rest[rest.indexOf(n) + 1] : d);
const minHit3 = Number(opt('--min-hit3', 0));
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { questions, validation = [] } = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/encyclopedia-questions.json'), 'utf8'));
const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();

const pack = await Pack.open(file);
console.log(`${pack.info.name}: ${pack.info.docs.toLocaleString('en-US')} articles; ${questions.length} tuning questions, ${validation.length} validation questions (not tuned on)`);

// the shipped setting first, then the alternatives worth trying (the leads are all clipped to one window, so length normalisation may only add noise: b goes down to 0)
const variants = [{ name: 'shipped', tune: {} }];
for (const b of [0.5, 0.3, 0.15, 0]) {
  for (const [w, p] of [[1.0, 4], [1.0, 8], [1.5, 8], [2.0, 12]]) variants.push({ name: `b=${b} prior=${w}^${p}`, tune: { b, priorWeight: w, priorPower: p } });
}

async function run(tune, set = questions) {
  let h1 = 0;
  let h3 = 0;
  let h5 = 0;
  let rr = 0;
  const rows = [];
  for (const { q, any } of set) {
    const hits = await pack.search(q, { limit: 10, tune });
    const want = new Set(any.map(norm));
    const at = hits.findIndex((h) => want.has(norm(h.title)));
    if (at === 0) h1++;
    if (at >= 0 && at < 3) h3++;
    if (at >= 0 && at < 5) h5++;
    if (at >= 0) rr += 1 / (at + 1);
    rows.push({ q, any, at, top: hits.slice(0, 4).map((h) => h.title) });
  }
  const n = set.length;
  return { h1: h1 / n, h3: h3 / n, h5: h5 / n, mrr: rr / n, rows };
}

const results = [];
for (const v of variants) results.push({ ...v, ...(await run(v.tune)), val: validation.length ? await run(v.tune, validation) : null });
const pct = (x) => `${(x * 100).toFixed(0)}%`;
console.log('\nsetting'.padEnd(30), 'hit@1  hit@3  hit@5  MRR  | validation: hit@1  hit@3  hit@5  MRR');
for (const r of results) console.log(r.name.padEnd(29), pct(r.h1).padStart(5), pct(r.h3).padStart(6), pct(r.h5).padStart(6), r.mrr.toFixed(3).padStart(6), '  |', r.val ? `${pct(r.val.h1).padStart(14)} ${pct(r.val.h3).padStart(6)} ${pct(r.val.h5).padStart(6)} ${r.val.mrr.toFixed(3).padStart(6)}` : '-');

const best = [...results].sort((a, b) => b.h3 - a.h3 || b.mrr - a.mrr)[0];
for (const r of [results[0], ...(best === results[0] ? [] : [best])]) {
  console.log(`\nMissed in the top 3 by "${r.name}":`);
  for (const row of r.rows.filter((x) => x.at < 0 || x.at >= 3)) console.log(`  ${row.at < 0 ? 'not in top 10' : `at ${row.at + 1}`}  ${row.q}  [wanted ${row.any.join(' | ')}]  got: ${row.top.join(' | ')}`);
}
if (validation.length) {
  for (const r of [results[0], ...(best === results[0] ? [] : [best])]) {
    console.log(`\nValidation questions missed in the top 3 by "${r.name}":`);
    for (const row of r.val.rows.filter((x) => x.at < 0 || x.at >= 3)) console.log(`  ${row.at < 0 ? 'not in top 10' : `at ${row.at + 1}`}  ${row.q}  [wanted ${row.any.join(' | ')}]  got: ${row.top.join(' | ')}`);
  }
}
await pack.close();
const shipped = results[0];
if (minHit3 && shipped.h3 < minHit3) {
  console.log(`\nThe shipped setting's hit@3 is ${pct(shipped.h3)}, below ${pct(minHit3)}.`);
  process.exit(1);
}
