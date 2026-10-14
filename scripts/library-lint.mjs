// Strict checks for the offline library's data files. Used by tests/library.test.js and, per file, by authors:
//   node scripts/library-lint.mjs rules/ap-punctuation.js [more files…]   (paths relative to knowledge/library/)
//   node scripts/library-lint.mjs                                          (everything)
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { LIB_DIR, listDataFiles } from './build-library-index.mjs';
import { coreEntries } from '../apps/web/src/engine/knowledge/index.js';

const KINDS = new Set(['genre', 'structure', 'style', 'form', 'technique', 'rule', 'guide', 'usage', 'format', 'movement', 'tradition', 'work', 'market', 'process', 'profile']);
// A 'profile' is one facet of a genre, form, tradition or movement that already has its own entry (its `parent`): what a writer asks when they ask about the whole subject.
export const PROFILE_FACETS = ['history', 'subgenres', 'tropes', 'readers', 'craft', 'compare', 'canon', 'pitfalls', 'terms'];
const CONFIDENCE = new Set(['established', 'varies', 'contested']);
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const URL_RE = /https?:|www\.|\.(?:com|org|net|edu|gov)\b|@\w+\.\w/i;
const CITATION_DETAIL_RE = /§|\bsec(?:tion)?s?\.?\s*\d|\bpp?\.\s*\d|\bchapters?\s+\d|\bparagraph\s+\d|\bpage\s+\d/i; // invented-looking citation detail
const longQuote = (s) => [...s.matchAll(/["“]([^"”]{1,400})["”]/g)].some((m) => m[1].trim().split(/\s+/).length > 14);
const NO_EXCLAMATION = /!/;

const core = coreEntries();
const coreIds = new Set(core.map((k) => k.id));
const coreNames = new Set(core.map((k) => `${k.kind}|${k.name.toLowerCase()}`));

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
  if (r.kind === 'profile') {
    if (!PROFILE_FACETS.includes(r.topic)) bad(`a profile's \`topic\` is its facet: one of ${PROFILE_FACETS.join(', ')}`);
    if (typeof r.parent !== 'string' || !ID_RE.test(r.parent)) bad('a profile needs `parent`: the id of the genre, form, tradition or movement entry it is about');
    if (!Array.isArray(r.conv) || r.conv.length < 5) bad('a profile needs at least 5 `conv` points (the substance of the facet)');
    if (!CONFIDENCE.has(r.confidence)) bad('a profile needs `confidence`');
    if (!Array.isArray(r.kw) || r.kw.length < 6) bad('a profile needs at least 6 `kw` (how a writer would ask: "history of X", "types of X", "X vs Y"...)');
    if (r.topic === 'readers' && (typeof r.asOf !== 'string' || r.asOf.length < 3)) bad('the readers/market facet needs `asOf` (market practice changes)');
    if (r.topic === 'canon' && !(Array.isArray(r.works) && r.works.length >= 4)) bad('a canon profile needs at least 4 `works`');
    if (r.topic !== 'canon' && r.works !== undefined && r.works.length > 4) bad('only a canon profile lists more than 4 works');
    if (typeof r.name === 'string' && !/^[^:]{2,70}: [a-z]/.test(r.name)) bad('a profile is named "Subject: facet" (e.g. "Gothic fiction: history and origins")');
  }
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


const nameKey = (r) => (r.kind === 'rule' ? `rule|${r.guide}|${r.name.toLowerCase()}` : r.kind === 'work' ? `work|${r.name.toLowerCase()}|${String(r.author).toLowerCase()}` : `${r.kind}|${r.name.toLowerCase()}`);

export async function loadFile(f) {
  try {
    const mod = await import(pathToFileURL(path.join(LIB_DIR, f)).href + `?t=${Date.now()}`);
    return { file: f, mod, enrich: f.startsWith('enrich/') };
  } catch (err) {
    // A file that does not even parse is reported against that file only (another author may be mid-edit).
    return { file: f, mod: { default: null }, enrich: f.startsWith('enrich/'), error: String(err?.message ?? err).split('\n')[0] };
  }
}

/**
 * @param {string[]} [only] limit per-file checks to these files (cross-file duplicate checks still see every file)
 * @returns {Promise<string[]>} problems
 */
export async function lintLibrary(only = null) {
  const all = await Promise.all(listDataFiles().map(loadFile));
  const problems = [];
  const ids = new Map();
  const names = new Map();
  for (const { file, mod, enrich, error } of all) {
    const mine = !only || only.includes(file);
    if (error) { if (mine) problems.push(`${file}: cannot be loaded: ${error}`); continue; }
    if (!Array.isArray(mod.default)) { if (mine) problems.push(`${file}: default export must be an array`); continue; }
    if (enrich) {
      if (!mine) continue;
      for (const r of mod.default) {
        if (!coreIds.has(r.id)) problems.push(`${file} ${r.id}: enrichment must name an existing core entry id`);
        if (!Array.isArray(r.works) && !Array.isArray(r.refs)) problems.push(`${file} ${r.id}: enrichment needs works and/or refs`);
        problems.push(...recordProblems({ id: r.id, kind: 'genre', name: 'xxx', summary: 'x'.repeat(60) + '.', kw: ['a1', 'b2', 'c3'], works: r.works ?? [{ title: 'x1', author: 'xxx' }, { title: 'x2', author: 'xxx' }], refs: r.refs }, file, null));
      }
      continue;
    }
    if (mine) {
      if (typeof mod.PREFIX !== 'string' || !/^[a-z0-9][a-z0-9-]*-$/.test(mod.PREFIX)) problems.push(`${file}: must export PREFIX ending with a hyphen (every id starts with it)`);
      if (mod.default.length === 0) problems.push(`${file}: empty`);
    }
    for (const r of mod.default) {
      if (mine && typeof mod.PREFIX === 'string') problems.push(...recordProblems(r, file, mod.PREFIX));
      if (!r || typeof r.id !== 'string') continue;
      if (mine) {
        if (coreIds.has(r.id) || (ids.has(r.id) && ids.get(r.id) !== file)) problems.push(`duplicate id ${r.id} (${file}, ${ids.get(r.id) ?? 'core'})`);
        const key = nameKey(r);
        if (coreNames.has(key) || (names.has(key) && names.get(key) !== file)) problems.push(`duplicate ${r.kind} "${r.name}" (${file}, ${names.get(key) ?? 'core'})`);
        else if (names.get(key) === file) problems.push(`duplicate ${r.kind} "${r.name}" within ${file}`);
        if (ids.get(r.id) === file) problems.push(`duplicate id ${r.id} within ${file}`);
      }
      ids.set(r.id, ids.get(r.id) ?? file);
      names.set(nameKey(r), names.get(nameKey(r)) ?? file);
    }
  }
  // A work a profile lists must agree with what the rest of the library says about it: the same title by the same author has the same first-publication year.
  const surname = (a) => String(a ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^a-z ]+/g, ' ').trim().split(/\s+/).pop() ?? '';
  const titleKey = (t) => String(t ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().split(/[:;]/)[0].replace(/^(?:the|a|an) /, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const years = new Map(); // title|surname -> Set of years stated outside profiles
  const note = (w, file) => {
    if (!w?.title || !w?.author || w.year === undefined) return;
    const key = `${titleKey(w.title)}|${surname(w.author)}`;
    (years.get(key) ?? years.set(key, new Map()).get(key)).set(String(w.year), file);
  };
  for (const k of core) for (const w of k.works ?? []) note(w, 'core');
  for (const { file, mod, enrich } of all) {
    if (enrich || !Array.isArray(mod.default)) continue;
    for (const r of mod.default) {
      if (r?.kind === 'profile') continue;
      if (r?.kind === 'work') note({ title: r.name, author: r.author, year: r.year }, file);
      for (const w of r?.works ?? []) note(w, file);
    }
  }
  for (const { file, mod, enrich } of all) {
    if (enrich || !Array.isArray(mod.default) || (only && !only.includes(file))) continue;
    for (const r of mod.default) {
      if (r?.kind !== 'profile') continue;
      for (const w of r.works ?? []) {
        const seen = years.get(`${titleKey(w.title)}|${surname(w.author)}`);
        if (seen && w.year !== undefined && !seen.has(String(w.year))) problems.push(`${file} ${r.id}: "${w.title}" by ${w.author} is ${w.year} here but ${[...seen.keys()].join(' / ')} elsewhere in the library (${[...seen.values()][0]}); check the first-publication year`);
      }
    }
  }
  // A profile's parent must be an entry that exists (core, or any library file).
  const known = new Set([...coreIds]);
  for (const { mod, enrich } of all) if (!enrich && Array.isArray(mod.default)) for (const r of mod.default) if (r && typeof r.id === 'string') known.add(r.id);
  for (const { file, mod, enrich } of all) {
    if (enrich || !Array.isArray(mod.default) || (only && !only.includes(file))) continue;
    for (const r of mod.default) if (r?.kind === 'profile' && typeof r.parent === 'string' && !known.has(r.parent)) problems.push(`${file} ${r.id}: parent "${r.parent}" is not an entry in the library`);
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const only = process.argv.slice(2);
  const problems = await lintLibrary(only.length ? only : null);
  if (problems.length) {
    console.error(problems.slice(0, 60).join('\n'));
    console.error(`\n${problems.length} problem(s)${problems.length > 60 ? ' (first 60 shown)' : ''}`);
    process.exit(1);
  }
  console.log(only.length ? `OK: ${only.join(', ')}` : 'OK: whole library');
}
