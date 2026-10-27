#!/usr/bin/env node
// Which works the library lists have been confirmed against the web, and the next batch to check.
//   node scripts/library-verify-queue.mjs                 coverage numbers
//   node scripts/library-verify-queue.mjs --next 8 DIR    write 8 batches of 24 items (half the most-referenced unchecked works, half a seeded sample) as DIR/batch-N.items.json
// A work counts as checked when it appears in a whole-subject profile (those were fact-checked with web search) or in docs/library-checks/works-ledger.json with
// status confirmed / year_differs / author_differs. An item that was searched but left 'unsure' stays in the queue. Nothing here edits the library.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const lib = path.join(root, 'apps/web/src/engine/knowledge/library');
const ledgerPath = path.join(root, 'docs/library-checks/works-ledger.json');
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const keyOf = (title, author) => `${norm(title)}|${norm(author)}`;

const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.js') && e.name !== 'index.js') files.push(p); } })(lib);

const pairs = new Map();
const add = (title, author, year, rel) => {
  if (!title || !author) return;
  const k = keyOf(title, author);
  if (!pairs.has(k)) pairs.set(k, { title, author, years: new Set(), refs: 0, inProfile: false });
  const p = pairs.get(k);
  p.years.add(String(year));
  p.refs++;
  if (rel.startsWith('profiles/')) p.inProfile = true;
};
for (const f of files) {
  const rel = path.relative(lib, f);
  const mod = await import(f);
  for (const arr of Object.values(mod).filter(Array.isArray)) for (const r of arr) {
    if (!r || typeof r !== 'object') continue;
    for (const w of r.works ?? []) add(w?.title, w?.author, w?.year, rel);
    if (r.kind === 'work') add(r.name, r.author, r.year, rel);
  }
}

const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : [];
const resolved = new Set(ledger.filter((e) => ['confirmed', 'year_differs', 'author_differs'].includes(e.status)).map((e) => keyOf(e.title, e.author)));
const all = [...pairs.values()];
const inProfile = all.filter((p) => p.inProfile);
const inLedger = all.filter((p) => !p.inProfile && resolved.has(keyOf(p.title, p.author)));
const queue = all.filter((p) => !p.inProfile && !resolved.has(keyOf(p.title, p.author))).sort((a, b) => b.refs - a.refs || a.title.localeCompare(b.title));
console.log(`distinct works (title + author) listed in the library: ${all.length}`);
console.log(`  checked inside a searched profile: ${inProfile.length}`);
console.log(`  checked in the ledger (web search): ${inLedger.length}`);
console.log(`  not yet checked against the web: ${queue.length}`);

const nextArg = process.argv.indexOf('--next');
if (nextArg > -1) {
  const batches = Number(process.argv[nextArg + 1]);
  const out = process.argv[nextArg + 2];
  if (!batches || !out) { console.error('usage: --next <batches> <dir>'); process.exit(1); }
  fs.mkdirSync(out, { recursive: true });
  const per = 24;
  const topN = Math.min(queue.length, batches * per / 2);
  const top = queue.slice(0, topN);
  const rest = queue.slice(topN);
  let s = ledger.length + 20261027; // seeded, so the same ledger gives the same sample
  const rnd = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const sample = []; const used = new Set();
  while (sample.length < Math.min(rest.length, batches * per / 2)) { const i = Math.floor(rnd() * rest.length); if (!used.has(i)) { used.add(i); sample.push(rest[i]); } }
  const tag = (arr, t) => arr.map((p) => ({ title: p.title, author: p.author, libraryYear: [...p.years].filter((y) => y !== 'undefined').join(', ') || '(none given)', tag: t }));
  const items = [...tag(top, 'top'), ...tag(sample, 'sample')];
  for (let b = 0; b < batches; b++) {
    const slice = [...items.filter((x) => x.tag === 'top').slice(b * per / 2, (b + 1) * per / 2), ...items.filter((x) => x.tag === 'sample').slice(b * per / 2, (b + 1) * per / 2)].map((x, i) => ({ n: i + 1, ...x }));
    if (slice.length) fs.writeFileSync(path.join(out, `batch-${b + 1}.items.json`), JSON.stringify(slice, null, 1));
  }
  console.log(`wrote ${batches} batches of up to ${per} items to ${out}`);
}
