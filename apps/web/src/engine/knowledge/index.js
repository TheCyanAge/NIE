import { genres } from './genres.js';
import { structures } from './structures.js';
import { styles } from './styles.js';
import { forms } from './forms.js';
import { techniques } from './techniques.js';
import { WORD_RE, STOPWORDS, stem, clip } from '../util/text.js';

/**
 * The offline narrative library: NIE's permanent, project-independent knowledge.
 * It is reference material that NIE may draw on. It never forces a story into a genre or structure,
 * and it is untouched by creating or deleting projects.
 */
export const KNOWLEDGE = Object.freeze([...genres, ...structures, ...styles, ...forms, ...techniques]);

export const USAGE_NOTE =
  'Reference knowledge only. These are tools a writer may use or deliberately break — never rules to enforce, never a box to put the story in.';

const byId = new Map(KNOWLEDGE.map((k) => [k.id, k]));
export const getEntry = (id) => byId.get(id) ?? null;

const tokens = (s) => (String(s).match(WORD_RE) ?? []).map(stem);

// BM25-lite index built once on first use.
let index = null;
function build() {
  const docs = KNOWLEDGE.map((k) => {
    const fields = {
      name: tokens([k.name, ...k.aka].join(' ')),
      kw: tokens(k.keywords.join(' ')),
      body: tokens([k.summary, ...k.conventions, ...k.deliberateWhen].join(' ')),
    };
    return { k, fields, len: fields.name.length + fields.kw.length + fields.body.length };
  });
  const df = new Map();
  for (const d of docs) {
    const seen = new Set([...d.fields.name, ...d.fields.kw, ...d.fields.body]);
    for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const avg = docs.reduce((a, d) => a + d.len, 0) / docs.length;
  index = { docs, df, avg, N: docs.length };
}

const WEIGHTS = { name: 4, kw: 3, body: 1 };
const QUERY_FILLER = new Set(['want', 'need', 'idea', 'make', 'help', 'something', 'like', 'could', 'would', 'think', 'know', 'dont', 'don\'t', 'how', 'what', 'also', 'really']);

/** Keyword-ranked search over the library. */
export function search(query, { kinds = null, limit = 6, minScore = 1.2 } = {}) {
  if (!index) build();
  const rawWords = (String(query).match(WORD_RE) ?? []).filter((w) => !STOPWORDS.has(w.toLowerCase()) && !QUERY_FILLER.has(w.toLowerCase()));
  const q = [...new Set(rawWords.map(stem))].filter((t) => t.length > 2);
  if (!q.length) return [];
  const { docs, df, avg, N } = index;
  const k1 = 1.2;
  const b = 0.6;
  const scored = [];
  for (const d of docs) {
    if (kinds && !kinds.includes(d.k.kind)) continue;
    let score = 0;
    for (const t of q) {
      let tf = 0;
      for (const [f, w] of Object.entries(WEIGHTS)) tf += w * d.fields[f].filter((x) => x === t).length;
      if (!tf) continue;
      const idf = Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
      score += (idf * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * d.len) / avg));
    }
    if (score >= minScore) scored.push({ entry: d.k, score });
  }
  scored.sort((a, b2) => b2.score - a.score);
  return scored.slice(0, limit).map((s) => s.entry);
}

/** Resolve free-text profile values (genre, style, form…) to library entries by name, alias or keyword. */
export function resolveTerms(terms) {
  const out = [];
  for (const raw of terms.filter(Boolean)) {
    const t = String(raw).toLowerCase().trim();
    if (!t) continue;
    const exact = KNOWLEDGE.find((k) => k.name.toLowerCase() === t || k.id === t || k.aka.some((a) => a.toLowerCase() === t));
    if (exact) {
      out.push(exact);
      continue;
    }
    const hit = search(t, { limit: 1, minScore: 3 })[0];
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
    const bits = [`${k.name} — ${k.summary}`];
    if (k.deliberateWhen[0]) bits.push(`Often deliberate: ${k.deliberateWhen[0]}.`);
    if (k.questions[0]) bits.push(`Useful question: ${k.questions[0]}`);
    const line = '- ' + clip(bits.join(' '), 330);
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
  technique: 'Techniques',
};
