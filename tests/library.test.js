import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { LIB_DIR, listDataFiles, renderIndex } from '../scripts/build-library-index.mjs';
import { KNOWLEDGE, coreEntries, loadLibrary, libraryStats, libraryStatus, search, searchScored, getEntry } from '../apps/web/src/engine/knowledge/index.js';

/**
 * The big offline library (apps/web/src/engine/knowledge/library/**). Most of it was written in parallel by many
 * authors, so these checks are strict about the things that go wrong at that scale: invented citations, copied text,
 * duplicate ids, thin entries, and facts stated without a source or an edition.
 *
 * Record format and rules: apps/web/src/engine/knowledge/library/README.md
 */

const KINDS = new Set(['genre', 'structure', 'style', 'form', 'technique', 'rule', 'guide', 'usage', 'format', 'movement', 'tradition', 'work', 'market', 'process']);
const CONFIDENCE = new Set(['established', 'varies', 'contested']);
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const URL_RE = /https?:|www\.|\.(?:com|org|net|edu|gov)\b|@\w+\.\w/i;
const CITATION_DETAIL_RE = /§|\bsec(?:tion)?s?\.?\s*\d|\bpp?\.\s*\d|\bchapters?\s+\d|\bparagraph\s+\d|\bpage\s+\d/i; // invented-looking citation detail
const longQuote = (s) => [...s.matchAll(/["“]([^"”]{1,400})["”]/g)].some((m) => m[1].trim().split(/\s+/).length > 14);
const NO_EXCLAMATION = /!/;

const files = listDataFiles();
const coreIds = new Set(coreEntries().map((k) => k.id));
const coreNames = new Set(coreEntries().map((k) => `${k.kind}|${k.name.toLowerCase()}`));

const loaded = [];
for (const f of files) {
  const mod = await import(pathToFileURL(path.join(LIB_DIR, f)).href);
  loaded.push({ file: f, mod, enrich: f.startsWith('enrich/') });
}

const strArr = (v, { min = 0, max = 12, lo = 3, hi = 300 } = {}) => Array.isArray(v) && v.length >= min && v.length <= max && v.every((x) => typeof x === 'string' && x.trim().length >= lo && x.length <= hi);

function recordProblems(r, file, prefix) {
  const p = [];
  const tag = `${file} ${r?.id ?? '(no id)'}`;
  const bad = (m) => p.push(`${tag}: ${m}`);
  if (!r || typeof r !== 'object') return [`${file}: record is not an object`];
  if (typeof r.id !== 'string' || !ID_RE.test(r.id) || r.id.length > 90) bad('id must be lowercase letters, digits and hyphens (max 90)');
  else if (prefix && !r.id.startsWith(prefix)) bad(`id must start with this file's PREFIX "${prefix}"`);
  if (!KINDS.has(r.kind)) bad(`unknown kind "${r.kind}"`);
  if (typeof r.name !== 'string' || r.name.trim().length < 2 || r.name.length > 140) bad('name must be 2-140 characters');
  if (typeof r.summary !== 'string' || r.summary.length < 40 || r.summary.length > 460) bad(`summary must be 40-460 characters (is ${r.summary?.length})`);
  else if (!/[.?)]$/.test(r.summary.trim())) bad('summary must end with a full stop');
  for (const k of ['aka', 'conv', 'watch', 'intent', 'q', 'kw', 'scope', 'refs']) {
    if (r[k] !== undefined && !strArr(r[k], { max: k === 'kw' ? 14 : 10, lo: k === 'kw' || k === 'aka' ? 2 : 6, hi: k === 'kw' ? 48 : 300 })) bad(`${k} must be an array of short strings (max 10, kw max 14)`);
  }
  if (Array.isArray(r.q) && r.q.some((x) => !/\?$/.test(x))) bad('every q (question) must end with ?');
  if (Array.isArray(r.kw) && r.kw.some((x) => x !== x.toLowerCase())) bad('kw must be lowercase');
  if (r.kind !== 'work' && (!Array.isArray(r.kw) || r.kw.length < 3)) bad('kw needs at least 3 search keywords');
  if (r.confidence !== undefined && !CONFIDENCE.has(r.confidence)) bad('confidence must be established, varies or contested');
  if (r.example !== undefined && (typeof r.example !== 'string' || r.example.length < 8 || r.example.length > 260)) bad('example must be 8-260 characters');
  if (r.works !== undefined) {
    if (!Array.isArray(r.works) || r.works.length > 8) bad('works must be an array of at most 8');
    else for (const w of r.works) {
      if (!w || typeof w.title !== 'string' || typeof w.author !== 'string' || w.title.length < 2 || w.author.length < 3) bad('each work needs a title and an author');
      else if (w.year !== undefined && !(Number.isInteger(w.year) && w.year >= -3000 && w.year <= 2026) && !(typeof w.year === 'string' && /^c\. ?\d{1,4}( BCE| CE)?$/.test(w.year))) bad(`work "${w.title}" has an implausible year`);
    }
  }
  // Kind-specific requirements
  if (r.kind === 'rule') {
    if (typeof r.guide !== 'string' || r.guide.length < 2) bad('a rule needs `guide` (the style guide or standard it comes from)');
    if (typeof r.topic !== 'string' || r.topic.length < 3) bad('a rule needs `topic`');
    if (!CONFIDENCE.has(r.confidence)) bad('a rule needs `confidence`');
    if (typeof r.asOf !== 'string' || r.asOf.length < 3) bad('a rule needs `asOf` (the edition or date it reflects)');
  }
  if (r.kind === 'guide' && (typeof r.asOf !== 'string' || r.asOf.length < 3)) bad('a guide needs `asOf` (current edition or year, as far as known)');
  if (r.kind === 'usage' && !CONFIDENCE.has(r.confidence)) bad('usage needs `confidence`');
  if (r.kind === 'work') {
    if (typeof r.author !== 'string' || r.author.length < 3) bad('a work needs `author`');
    if (!(Number.isInteger(r.year) && r.year >= -3000 && r.year <= 2026) && !(typeof r.year === 'string' && /^c\. ?\d{1,4}( BCE| CE)?$/.test(r.year))) bad('a work needs a plausible `year`');
    if (typeof r.language !== 'string' || r.language.length < 2) bad('a work needs `language` (original language)');
  }
  if (r.kind === 'genre' && !(Array.isArray(r.works) && r.works.length >= 2)) bad('a genre needs at least 2 representative `works`');
  // Text hygiene across every string field
  const texts = [r.name, r.summary, r.example, ...(r.conv ?? []), ...(r.watch ?? []), ...(r.intent ?? []), ...(r.q ?? []), ...(r.refs ?? []), ...(r.aka ?? [])].filter((x) => typeof x === 'string');
  for (const t of texts) {
    if (URL_RE.test(t)) bad(`contains a URL or address: "${t.slice(0, 60)}"`);
    if (longQuote(t)) bad(`quotes more than 14 words verbatim: "${t.slice(0, 60)}…" (paraphrase instead)`);
    if (/\b(?:TODO|FIXME|lorem|placeholder|as an AI)\b/i.test(t)) bad('contains placeholder text');
    if (NO_EXCLAMATION.test(t) && r.kind !== 'usage') bad('no exclamation marks in reference text');
  }
  for (const t of [...(r.refs ?? []), r.asOf, r.guide].filter((x) => typeof x === 'string')) if (CITATION_DETAIL_RE.test(t)) bad(`cites a section/page: "${t}" (name the work and edition only)`);
  return p;
}

test('library: the index lists exactly the data files that exist', () => {
  assert.equal(fs.readFileSync(path.join(LIB_DIR, 'index.js'), 'utf8'), renderIndex(files), 'run: node scripts/build-library-index.mjs');
});

test('library: every file is well-formed (default export of records, a PREFIX, valid records)', () => {
  const problems = [];
  for (const { file, mod, enrich } of loaded) {
    if (!Array.isArray(mod.default)) { problems.push(`${file}: default export must be an array`); continue; }
    if (enrich) {
      for (const r of mod.default) {
        if (!coreIds.has(r.id)) problems.push(`${file} ${r.id}: enrichment must name an existing core entry id`);
        if (!Array.isArray(r.works) && !Array.isArray(r.refs)) problems.push(`${file} ${r.id}: enrichment needs works and/or refs`);
        if (r.works && recordProblems({ id: r.id, kind: 'genre', name: 'x'.repeat(3), summary: 'x'.repeat(60) + '.', kw: ['a1', 'b2', 'c3'], works: r.works, refs: r.refs }, file, null).length) problems.push(...recordProblems({ id: r.id, kind: 'genre', name: 'xxx', summary: 'x'.repeat(60) + '.', kw: ['a1', 'b2', 'c3'], works: r.works, refs: r.refs }, file, null));
      }
      continue;
    }
    if (typeof mod.PREFIX !== 'string' || !/^[a-z0-9][a-z0-9-]*-$/.test(mod.PREFIX)) { problems.push(`${file}: must export PREFIX ending with a hyphen (every id starts with it)`); continue; }
    if (mod.default.length === 0) problems.push(`${file}: empty`);
    for (const r of mod.default) problems.push(...recordProblems(r, file, mod.PREFIX));
  }
  assert.deepEqual(problems.slice(0, 40), [], `${problems.length} problem(s)`);
});

test('library: ids are unique across the whole library and the core, and no entry repeats another by name', () => {
  const problems = [];
  const ids = new Map();
  const names = new Map();
  for (const { file, mod, enrich } of loaded) {
    if (enrich) continue;
    for (const r of mod.default) {
      if (coreIds.has(r.id) || ids.has(r.id)) problems.push(`duplicate id ${r.id} (${file}, ${ids.get(r.id) ?? 'core'})`);
      ids.set(r.id, file);
      const key = r.kind === 'rule' ? `rule|${r.guide}|${r.name.toLowerCase()}` : r.kind === 'work' ? `work|${r.name.toLowerCase()}|${r.author.toLowerCase()}` : `${r.kind}|${r.name.toLowerCase()}`;
      if (coreNames.has(key) || names.has(key)) problems.push(`duplicate ${r.kind} "${r.name}" (${file}, ${names.get(key) ?? 'core'})`);
      names.set(key, file);
    }
  }
  assert.deepEqual(problems.slice(0, 40), [], `${problems.length} duplicate(s)`);
});

test('library: loads on demand, reports honestly, and the core keeps working before and after', async () => {
  const before = KNOWLEDGE.length;
  assert.equal(before, coreEntries().length);
  const n = await loadLibrary();
  assert.equal(libraryStatus().loaded, true, libraryStatus().error ?? '');
  assert.ok(n >= before);
  assert.equal(KNOWLEDGE.length, n);
  assert.equal(await loadLibrary(), n, 'idempotent');
  // The core stays first and unchanged in behaviour.
  assert.equal(search('unreliable narrator contradictions')[0].id, 'unreliable-narration');
  assert.equal(search('emotionally devastating but not melodramatic')[0].id, 'emotional-restraint');
  assert.ok(search('a homeless man befriends a cat').some((e) => e.id === 'companionship-arc'));
  assert.ok(!search('a homeless man befriends a cat').some((e) => e.id === 'beat-sheet'));
  assert.deepEqual(search('zzzz qqqq'), []);
  const stats = libraryStats();
  assert.equal(stats.total, n);
  assert.equal(stats.loaded, true);
});

test('library: when it is large, searching it is fast and nonsense still finds nothing', async () => {
  await loadLibrary();
  const t0 = performance.now();
  for (let i = 0; i < 20; i++) searchScored('how do I punctuate dialogue in a novel', { limit: 5 });
  const per = (performance.now() - t0) / 20;
  assert.ok(per < 60, `a search took ${per.toFixed(1)} ms on ${KNOWLEDGE.length} entries`);
  assert.deepEqual(search('xqzvk wjplm'), []);
  assert.equal(getEntry('definitely-not-an-entry'), null);
});
