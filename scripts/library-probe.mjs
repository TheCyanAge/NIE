#!/usr/bin/env node
// Ask NIE's offline library questions the way a writer would and see what it answers.
//   node scripts/library-probe.mjs "what is a villanelle" "who vs whom"
//   node scripts/library-probe.mjs --file questions.txt          (one question per line)
// Prints, per question: strength (strong / weak / none), the entries it would answer with, and the nearest others.
import fs from 'node:fs';
import { loadLibrary, answerFromLibrary } from '../apps/web/src/engine/knowledge/index.js';

const args = process.argv.slice(2);
let questions = [];
const fi = args.indexOf('--file');
if (fi >= 0) questions = fs.readFileSync(args[fi + 1], 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
else questions = args.filter((a) => !a.startsWith('--'));
if (!questions.length) {
  console.error('Usage: node scripts/library-probe.mjs "question" ...   or   --file questions.txt');
  process.exit(2);
}
await loadLibrary();
const json = args.includes('--json');
const rows = [];
for (const q of questions) {
  const a = answerFromLibrary(q, { limit: 3 });
  rows.push({ q, strength: a.strength, answer: a.entries.map((e) => e.name), near: a.related.slice(0, 3).map((e) => e.name) });
}
if (json) console.log(JSON.stringify(rows, null, 1));
else for (const r of rows) console.log(`${r.strength.toUpperCase().padEnd(6)} ${r.q}\n         answer: ${r.answer.join(' | ') || '-'}\n         near:   ${r.near.join(' | ') || '-'}`);
