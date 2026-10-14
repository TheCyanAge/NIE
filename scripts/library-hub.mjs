// Shows everything the library already says about one subject (a genre, form, tradition or movement), so a profile adds to it and agrees with it.
//   node scripts/library-hub.mjs <entry-id>
import { loadLibrary, getEntry, KNOWLEDGE } from '../apps/web/src/engine/knowledge/index.js';

const id = process.argv[2];
await loadLibrary();
const e = getEntry(id);
if (!e) { console.error(`No entry with id "${id}". Use: node scripts/library-hubs.mjs | grep <word>`); process.exit(1); }
const show = (k) => JSON.stringify({ id: k.id, kind: k.kind, name: k.name, aka: k.aka, summary: k.summary, conv: k.conventions, watch: k.watchFor, works: k.works, kw: k.keywords }, null, 1);
console.log('=== THE ENTRY ===\n' + show(e));
const kids = KNOWLEDGE.filter((k) => k.parent === id && k.kind !== 'profile');
if (kids.length) console.log(`\n=== ITS CHILD ENTRIES (${kids.length}) ===\n` + kids.map((k) => `- ${k.name} [${k.id}]: ${k.summary.slice(0, 130)}`).join('\n'));
const words = new Set(e.name.toLowerCase().replace(/\(.*?\)/g, ' ').split(/\W+/).filter((w) => w.length > 3));
const near = KNOWLEDGE.filter((k) => k.id !== id && k.kind !== 'work' && k.kind !== 'rule' && k.kind !== 'usage' && !k.derived && k.kind !== 'profile' && [...words].some((w) => k.name.toLowerCase().includes(w))).slice(0, 25);
if (near.length) console.log(`\n=== OTHER ENTRIES WITH A SIMILAR NAME (${near.length}) ===\n` + near.map((k) => `- ${k.name} [${k.id}, ${k.kind}]`).join('\n'));
const works = KNOWLEDGE.filter((k) => k.kind === 'work' && (k.genres ?? []).includes(id)).slice(0, 20);
if (works.length) console.log(`\n=== WORKS THE LIBRARY ALREADY TIES TO IT ===\n` + works.map((k) => `- ${k.name} (${k.author}, ${k.year})`).join('\n'));
