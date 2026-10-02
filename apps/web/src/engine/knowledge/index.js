import { genres } from './genres.js';
import { structures } from './structures.js';
import { styles } from './styles.js';
import { forms } from './forms.js';
import { techniques } from './techniques.js';
import { fromRecord } from './entry.js';
import { WORD_RE, STOPWORDS, stem, clip } from '../util/text.js';

/**
 * The offline narrative library: NIE's permanent, project-independent knowledge.
 * It is reference material that NIE may draw on. It never forces a story into a genre or structure,
 * and it is untouched by creating or deleting projects.
 *
 * Two layers: the CORE entries (the handful of hundreds the engine is built around) are available immediately;
 * the large LIBRARY (style-guide rules, usage, formats, genres with representative works, forms, devices, movements,
 * traditions, publishing) lives in library/ and is loaded on demand with `loadLibrary()`, so the app's first paint is
 * never slowed by it. Until it loads, everything works from the core entries alone.
 */
const CORE = Object.freeze([...genres, ...structures, ...styles, ...forms, ...techniques]);
export let KNOWLEDGE = CORE;
export const coreEntries = () => CORE;

let byId = new Map(KNOWLEDGE.map((k) => [k.id, k]));
let libraryState = { loaded: false, loading: null, files: 0, error: null };
export const libraryStatus = () => ({ loaded: libraryState.loaded, files: libraryState.files, error: libraryState.error });

/**
 * Load the large library (idempotent). Resolves to the number of entries now available.
 * A failure leaves the core library working and is reported honestly through `libraryStatus()`.
 */
export function loadLibrary() {
  if (libraryState.loaded) return Promise.resolve(KNOWLEDGE.length);
  libraryState.loading ??= (async () => {
    try {
      const { LIBRARY_FILES, ENRICH_FILES } = await import('./library/index.js');
      const mods = await Promise.all(LIBRARY_FILES.map((f) => f()));
      const enrich = new Map();
      for (const f of ENRICH_FILES) for (const rec of (await f()).default) enrich.set(rec.id, rec);
      const seen = new Set(CORE.map((k) => k.id));
      const added = [];
      for (const m of mods) {
        for (const rec of m.default) {
          if (seen.has(rec.id)) continue; // ids are unique by test; this only guards a hand-edited file
          seen.add(rec.id);
          added.push(fromRecord(rec));
        }
      }
      // Enrichment adds works/references to core entries without rewriting them.
      const core = CORE.map((k) => {
        const r = enrich.get(k.id);
        return r ? Object.freeze({ ...k, works: r.works ?? k.works, refs: r.refs ?? k.refs }) : k;
      });
      KNOWLEDGE = Object.freeze([...core, ...added]);
      byId = new Map(KNOWLEDGE.map((k) => [k.id, k]));
      index = null;
      libraryState = { loaded: true, loading: null, files: mods.length, error: null };
    } catch (err) {
      libraryState = { loaded: false, loading: null, files: 0, error: String(err?.message ?? err) };
    }
    return KNOWLEDGE.length;
  })();
  return libraryState.loading;
}

export const USAGE_NOTE =
  'Reference knowledge only. These are tools a writer may use or deliberately break — never rules to enforce, never a box to put the story in.';

export const getEntry = (id) => byId.get(id) ?? null;

const tokens = (s) => (String(s).match(WORD_RE) ?? []).map(stem);

// BM25-lite index, built on first use and rebuilt when the large library arrives.
let index = null;
const tf = (toks) => {
  const m = new Map();
  for (const t of toks) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
};
function build() {
  const docs = KNOWLEDGE.map((k) => {
    const name = tokens([k.name, ...k.aka, k.author ?? ''].join(' '));
    const kw = tokens([...k.keywords, k.topic ?? '', k.guide ?? '', ...k.scope].join(' '));
    const body = tokens([k.summary, ...k.conventions, ...k.deliberateWhen, ...k.watchFor, k.example ?? ''].join(' '));
    return { k, f: { name: tf(name), kw: tf(kw), body: tf(body) }, len: name.length + kw.length + body.length, w: KIND_WEIGHT[k.kind] ?? 1 };
  });
  const df = new Map();
  for (const d of docs) {
    const seen = new Set([...d.f.name.keys(), ...d.f.kw.keys(), ...d.f.body.keys()]);
    for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const avg = docs.reduce((a, d) => a + d.len, 0) / docs.length;
  index = { docs, df, avg, N: docs.length };
}

const WEIGHTS = { name: 4, kw: 3, body: 1 };
// Craft questions should surface craft knowledge first; a bibliographic work only outranks it when the question is about the work.
const KIND_WEIGHT = { work: 0.6, usage: 0.9, rule: 0.95 };
const QUERY_FILLER = new Set(['want', 'need', 'idea', 'make', 'help', 'something', 'like', 'could', 'would', 'think', 'know', 'dont', 'don\'t', 'how', 'what', 'also', 'really']);

/** Keyword-ranked search over the library. Returns entries; use `searchScored` when the strength of the match matters. */
export function search(query, opts = {}) {
  return searchScored(query, opts).map((s) => s.entry);
}

/** Like `search`, but with scores, so a caller can tell "a good answer" from "the least bad entry". */
export function searchScored(query, { kinds = null, limit = 6, minScore = 1.2 } = {}) {
  if (!index) build();
  const rawWords = (String(query).match(WORD_RE) ?? []).filter((w) => !STOPWORDS.has(w.toLowerCase()) && !QUERY_FILLER.has(w.toLowerCase()));
  const q = [...new Set(rawWords.map(stem))].filter((t) => t.length > 2);
  if (!q.length) return [];
  const { docs, df, avg, N } = index;
  const k1 = 1.2;
  const b = 0.6;
  const idfs = q.map((t) => Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5)));
  const scored = [];
  for (const d of docs) {
    if (kinds && !kinds.includes(d.k.kind)) continue;
    let score = 0;
    for (let i = 0; i < q.length; i++) {
      const t = q[i];
      const tfv = WEIGHTS.name * (d.f.name.get(t) ?? 0) + WEIGHTS.kw * (d.f.kw.get(t) ?? 0) + WEIGHTS.body * (d.f.body.get(t) ?? 0);
      if (!tfv) continue;
      score += (idfs[i] * tfv * (k1 + 1)) / (tfv + k1 * (1 - b + (b * d.len) / avg));
    }
    score *= d.w;
    if (score >= minScore) scored.push({ entry: d.k, score });
  }
  scored.sort((a, b2) => b2.score - a.score);
  return scored.slice(0, limit);
}

const PROFILE_KINDS = ['genre', 'structure', 'style', 'form', 'technique', 'movement', 'tradition'];

/**
 * How well does the library answer a question? 'strong' = an entry is clearly about it; 'weak' = related entries only;
 * 'none' = nothing relevant. NIE uses this to answer from the library with its sources, or to say plainly that it does not
 * have the answer instead of guessing.
 */
export const STRONG_SCORE = 11;
export function answerFromLibrary(query, { limit = 3, kinds = null } = {}) {
  const scored = searchScored(query, { limit: Math.max(limit, 6), minScore: 1.2, kinds });
  if (!scored.length) return { strength: 'none', entries: [], related: [] };
  const top = scored[0].score;
  // A weak match only counts when the question actually names the entry's topic ("how do I punctuate dialogue" names
  // "dialogue"); otherwise a keyword accident ("the detective wants…" -> mystery) would hijack talk about the writer's story.
  const q = new Set((String(query).match(WORD_RE) ?? []).map(stem));
  const nameStems = tokens([scored[0].entry.name, ...scored[0].entry.aka].join(' '));
  const nameHit = nameStems.some((t) => q.has(t) && t.length > 2 && !STOPWORDS.has(t));
  let strength = top >= STRONG_SCORE ? 'strong' : top >= STRONG_SCORE * 0.55 ? 'weak' : 'none';
  if (strength === 'weak' && !nameHit) strength = 'none';
  if (strength === 'none') return { strength, entries: [], related: scored.slice(0, 3).map((x) => x.entry) };
  // Entries close in score to the best one belong to the answer; the rest are only "related".
  const entries = scored.filter((x) => x.score >= top * 0.72).slice(0, limit).map((x) => x.entry);
  const related = scored.map((x) => x.entry).filter((e) => !entries.includes(e)).slice(0, 4);
  return { strength, entries, related };
}

/** Resolve free-text profile values (genre, style, form…) to library entries by name, alias or keyword. */
export function resolveTerms(terms) {
  const out = [];
  for (const raw of terms.filter(Boolean)) {
    const t = String(raw).toLowerCase().trim();
    if (!t) continue;
    const exact = KNOWLEDGE.find((k) => k.kind !== 'work' && (k.name.toLowerCase() === t || k.id === t || k.aka.some((a) => a.toLowerCase() === t)));
    if (exact) {
      out.push(exact);
      continue;
    }
    const hit = search(t, { limit: 1, minScore: 3, kinds: PROFILE_KINDS })[0];
    if (hit) out.push(hit);
  }
  return [...new Map(out.map((x) => [x.id, x])).values()];
}

/** Library entries relevant to the project's declared identity. */
export function forProfile(profile) {
  const terms = [
    profile?.genre?.primary,
    ...(profile?.genre?.secondary ?? []),
    profile?.identity?.format,
    profile?.style?.prose,
    profile?.style?.pov,
    profile?.narrative?.structure,
    profile?.narrative?.reliability,
  ];
  return resolveTerms(terms);
}

/** Compact, prompt-ready rendering of entries within a character budget. */
export function describeForPrompt(entries, budgetChars = 1400) {
  const lines = [];
  let used = 0;
  for (const k of entries) {
    const bits = [`${k.name}${k.guide ? ` [${k.guide}${k.asOf ? `, ${k.asOf}` : ''}]` : ''} — ${k.summary}`];
    if (k.kind === 'work' && k.author) bits.push(`By ${k.author}${k.year ? `, ${k.year}` : ''}.`);
    if (k.confidence === 'varies') bits.push('Varies by publisher or house style.');
    if (['rule', 'usage', 'format', 'guide', 'market', 'process'].includes(k.kind)) {
      if (k.conventions[0]) bits.push(k.conventions.slice(0, 2).join(' '));
      if (k.example) bits.push(`Example: ${k.example}`);
    }
    if (k.kind === 'genre' && k.works?.length) bits.push(`Works: ${k.works.slice(0, 3).map((w) => `${w.title} (${w.author})`).join('; ')}.`);
    if (k.deliberateWhen[0]) bits.push(`Often deliberate: ${k.deliberateWhen[0]}.`);
    if (k.questions[0]) bits.push(`Useful question: ${k.questions[0]}`);
    const line = '- ' + clip(bits.join(' '), ['rule', 'usage', 'format'].includes(k.kind) ? 440 : 330);
    if (used + line.length > budgetChars) break;
    lines.push(line);
    used += line.length + 1;
  }
  return lines.join('\n');
}

export const KIND_LABELS = {
  genre: 'Genres',
  structure: 'Structures',
  style: 'Styles and voice',
  form: 'Forms',
  technique: 'Techniques and devices',
  rule: 'Style rules',
  guide: 'Style guides and standards',
  usage: 'Word usage',
  format: 'Manuscript and document formats',
  movement: 'Literary movements',
  tradition: 'Literary traditions',
  work: 'Notable works',
  market: 'Publishing and markets',
  process: 'Editing and revision',
};

/** What the library holds right now, so the app can show its coverage honestly (and so tests can pin it). */
export function libraryStats() {
  const byKind = {};
  const guides = new Set();
  for (const k of KNOWLEDGE) {
    byKind[k.kind] = (byKind[k.kind] ?? 0) + 1;
    if (k.kind === 'rule' && k.guide) guides.add(k.guide);
  }
  return { total: KNOWLEDGE.length, byKind, ruleGuides: [...guides].sort(), loaded: libraryState.loaded };
}
