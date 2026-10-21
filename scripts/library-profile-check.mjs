// Checks one or more profile files the way the tests will, BEFORE the library index lists them: lint, then "does the question for each facet find that facet?".
//   node scripts/library-profile-check.mjs profiles/fantasy.js [more files ...]          (files inside the library folder)
//   node scripts/library-profile-check.mjs --staging /abs/path/fantasy.js [more ...]       (files in a staging folder, checked as if installed)
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { LIB_DIR } from './build-library-index.mjs';
import { lintLibrary } from './library-lint.mjs';
import { loadLibrary, addRecords, answerFromLibrary, PROFILE_FACETS, getEntry } from '../apps/web/src/engine/knowledge/index.js';

const argv = process.argv.slice(2);
const staging = argv.includes('--staging');
const files = argv.filter((a) => a !== '--staging');
if (!files.length) { console.error('Usage: node scripts/library-profile-check.mjs [--staging] <file> ...'); process.exit(2); }
const problems = staging ? await lintLibrary(null, files.map((f) => path.resolve(f))) : await lintLibrary(files);
if (problems.length) { console.error(problems.slice(0, 40).join('\n') + `\n\n${problems.length} lint problem(s)`); process.exit(1); }
await loadLibrary();
const records = [];
for (const f of files) records.push(...(await import(pathToFileURL(staging ? path.resolve(f) : path.join(LIB_DIR, f)).href + `?t=${Date.now()}`)).default);
addRecords(records);
const subjectOf = (name) => name.split(':')[0].replace(/\s*\(.*?\)\s*/g, ' ').trim();
let misses = 0;
for (const r of records) {
  const subject = subjectOf(r.name);
  const asks = [PROFILE_FACETS[r.topic].ask(subject), r.kw.find((k) => k.split(' ').length >= 3) ?? r.kw[0]];
  for (const q of asks) {
    const a = answerFromLibrary(q, { limit: 3 });
    const ok = a.strength !== 'none' && a.entries.slice(0, 2).some((e) => e.id === r.id || (q === asks[1] && (e.parent === r.parent || (e.kind === 'profile' && e.topic === r.topic)))); // (a keyword phrase may name two subjects, "interactive fiction vs visual novel": the same facet of either is a right answer)
    if (!ok) { misses++; console.log(`MISS  "${q}"  -> ${a.strength}: ${a.entries.map((e) => e.name).join(' | ') || '-'}   (wanted ${r.id})`); }
  }
  const def = answerFromLibrary(`What is ${subject}?`, { limit: 3 });
  if (def.entries[0]?.kind === 'profile') { misses++; console.log(`WRONG "What is ${subject}?" is answered by the facet ${def.entries[0].name}, not by the subject itself`); }
}
console.log(misses ? `\n${misses} retrieval problem(s): add or sharpen \`kw\` (how a writer would ask) and the facet name, then run again` : `OK: ${files.join(', ')} (${records.length} records, lint clean, every facet found)`);
process.exit(misses ? 1 : 0);
