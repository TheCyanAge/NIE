#!/usr/bin/env node
// Build NIE's offline encyclopedia pack from a Wikipedia CirrusSearch content dump.
//   node scripts/build-encyclopedia.mjs --input simplewiki-20260101-cirrussearch-content.json.gz --out dist/encyclopedia --name simple-en --lang en
//   node scripts/build-encyclopedia.mjs --input https://dumps.wikimedia.org/... --max-docs 120000 --max-lead 1200
// Writes <out>/<name>.niepack and <out>/manifest.json (name, file, bytes, sha256, docs, built, source, license, attribution). The manifest is what apps/desktop/encyclopedia.json is made from.
// --input is a .json.gz (or plain .json) file or an https address; a dump is streamed, never held whole.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { Readable } from 'node:stream';
import { buildFromDump } from '../apps/web/src/engine/encyclopedia/build.js';
import { Pack } from '../apps/web/src/engine/encyclopedia/pack.js';

const UA = 'NIE-encyclopedia-builder/0.1 (https://github.com/TheCyanAge/NIE; builds a compact offline article pack)';

function args(argv) {
  const o = { out: 'dist/encyclopedia', name: 'simple-en', lang: 'en', maxDocs: 120000, maxLead: 1200, rank: 'auto' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--input') o.input = next();
    else if (a === '--out') o.out = next();
    else if (a === '--name') o.name = next();
    else if (a === '--title') o.title = next();
    else if (a === '--lang') o.lang = next();
    else if (a === '--max-docs') o.maxDocs = Number(next());
    else if (a === '--max-lead') o.maxLead = Number(next());
    else if (a === '--rank') o.rank = next();
    else if (a === '--built-at') o.builtAt = next();
    else if (a === '--help' || a === '-h') o.help = true;
    else throw new Error(`Unknown option ${a}`);
  }
  return o;
}

async function open(input) {
  let raw;
  if (/^https:\/\//i.test(input)) {
    const res = await fetch(input, { headers: { 'User-Agent': UA } });
    if (!res.ok || !res.body) throw new Error(`Could not download the dump (${res.status}) from ${input}`);
    raw = Readable.fromWeb(res.body);
  } else {
    raw = fs.createReadStream(input);
  }
  const gz = /\.gz$/i.test(input) || /\.gz(\?|$)/i.test(input);
  return gz ? raw.pipe(zlib.createGunzip()) : raw;
}

const o = args(process.argv.slice(2));
if (o.help || !o.input) {
  console.log('Usage: node scripts/build-encyclopedia.mjs --input <dump.json.gz | https://...> [--out dir] [--name simple-en] [--title "Simple English Wikipedia"] [--lang en] [--max-docs 120000] [--max-lead 1200] [--rank auto|popularity_score|incoming_links]');
  process.exit(o.help ? 0 : 1);
}
if (!/^[a-z0-9][a-z0-9._-]{0,60}$/i.test(o.name)) throw new Error('--name may hold letters, digits, dots, dashes and underscores only.');
if (!Number.isInteger(o.maxDocs) || o.maxDocs < 1) throw new Error('--max-docs must be a whole number of articles.');

const builtAt = o.builtAt || new Date().toISOString();
const t0 = Date.now();
const stream = await open(o.input);
const built = await buildFromDump(stream, {
  name: o.name, title: o.title ?? '', lang: o.lang, source: o.input.replace(/\?.*$/, ''), builtAt, maxDocs: o.maxDocs, maxLead: o.maxLead, rankBy: o.rank,
  onProgress: ({ read, kept }) => console.log(`  read ${read.toLocaleString('en-US')} documents, ${kept.toLocaleString('en-US')} kept so far`),
});

fs.mkdirSync(o.out, { recursive: true });
const file = `${o.name}.niepack`;
const dest = path.join(o.out, file);
fs.writeFileSync(dest, built.bytes);
const sha256 = crypto.createHash('sha256').update(built.bytes).digest('hex');

// prove the file opens and answers before saying it is built
const pack = await Pack.open(dest);
const probe = await pack.search(pack.info.docs ? (await pack.get(0)).title : 'x', { limit: 1 });
await pack.close();
if (!probe.length) throw new Error('The pack was written but a search for its own first article found nothing; it is not usable.');

const { terms } = pack.info;
const manifest = {
  name: o.name, title: o.title ?? '', file, bytes: built.bytes.length, sha256, docs: built.docs, terms, built: builtAt, version: 1, lang: o.lang,
  rankedBy: built.rankBy, maxLead: o.maxLead, source: o.input.replace(/\?.*$/, ''), license: 'CC BY-SA 4.0',
  attribution: pack.info.attribution,
};
fs.writeFileSync(path.join(o.out, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Built ${dest}: ${built.docs.toLocaleString('en-US')} articles from ${built.read.toLocaleString('en-US')} documents, ${(built.bytes.length / 1048576).toFixed(1)} MB, ranked by ${built.rankBy}, in ${((Date.now() - t0) / 1000).toFixed(0)} s.`);
console.log(`sha256 ${sha256}`);
