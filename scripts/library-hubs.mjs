// Lists the entries a profile can be about: genres, forms, traditions and movements, with their ids, and whether a profile file already exists for them.
//   node scripts/library-hubs.mjs [kind ...]        (default: genre form tradition movement)   --json for machine-readable output
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLibrary, KNOWLEDGE } from '../apps/web/src/engine/knowledge/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kinds = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const wanted = kinds.length ? kinds : ['genre', 'form', 'tradition', 'movement'];
await loadLibrary();
const profiled = new Set();
const dir = path.join(root, 'apps/web/src/engine/knowledge/library/profiles');
if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (f.endsWith('.js')) for (const m of (await import(path.join(dir, f))).default) profiled.add(m.parent);
const rows = KNOWLEDGE.filter((k) => wanted.includes(k.kind) && !k.derived).map((k) => ({ id: k.id, kind: k.kind, name: k.name, parent: k.parent, works: k.works?.length ?? 0, profiled: profiled.has(k.id), summary: k.summary.slice(0, 110) }));
if (process.argv.includes('--json')) console.log(JSON.stringify(rows));
else for (const r of rows) console.log(`${r.profiled ? '[done] ' : '       '}${r.kind.padEnd(9)} ${r.id.padEnd(52)} ${r.name}${r.parent ? `  (child of ${r.parent})` : ''}`);
