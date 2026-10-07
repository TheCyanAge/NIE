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
      const base = [...core, ...added];
      const seenIds = new Set(base.map((k) => k.id));
      const derived = derivedWorks(base).filter((k) => !seenIds.has(k.id));
      KNOWLEDGE = Object.freeze([...base, ...derived]);
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


/**
 * Many works appear only inside another entry's `works` list ("Things Fall Apart" under the African Writers Series). So that a
 * question about such a work can be answered, each listed title that has no record of its own gets a small lookup record built
 * from what the library already says (title, author, year, where it is listed). Nothing is added that the library does not hold.
 */
const surname = (a) => strip(String(a ?? '')).toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^\p{L} ]+/gu, ' ').trim().split(/\s+/).pop() ?? '';
const mainTitle = (t) => noArticle(nameKey(String(t).split(/[:;]| or,? /i)[0]));
export function derivedWorks(entries) {
  const have = new Map(); // main title -> surnames of standalone works
  for (const k of entries) {
    if (k.kind !== 'work') continue;
    for (const t of new Set([mainTitle(k.name), noArticle(nameKey(k.name))])) have.set(t, [...(have.get(t) ?? []), surname(k.author)]);
  }
  const found = new Map();
  for (const k of entries) {
    for (const w of k.works ?? []) {
      if (!w?.title || !w?.author) continue;
      const t = mainTitle(w.title);
      const sn = surname(w.author);
      if (!t || !sn) continue;
      const known = have.get(t);
      if (known && (known.includes(sn) || !known.some(Boolean))) continue;
      const key = `${t}|${sn}`;
      const cur = found.get(key) ?? { w, where: [] };
      if (!cur.where.includes(k.name)) cur.where.push(k.name);
      found.set(key, cur);
    }
  }
  const slug = (s) => nameKey(s).replace(/ /g, '-').slice(0, 60);
  const out = [];
  for (const [key, { w, where }] of found) {
    const [t, sn] = key.split('|');
    out.push(
      fromRecord({
        id: `work-ref-${slug(w.title)}-${sn.replace(/ /g, '-')}`,
        kind: 'work',
        name: String(w.title),
        author: String(w.author),
        year: w.year ?? null,
        summary: `${w.title} is a work by ${w.author}${w.year ? `, first published or first performed in ${w.year}` : ''}. NIE's library lists it as a representative work under: ${where.slice(0, 3).join('; ')}.`,
        kw: [String(w.title).toLowerCase(), String(w.author).toLowerCase()],
        derived: true,
      })
    );
  }
  return out;
}

export const USAGE_NOTE =
  'Reference knowledge only. These are tools a writer may use or deliberately break — never rules to enforce, never a box to put the story in.';

export const getEntry = (id) => byId.get(id) ?? null;

const strip = (s) => String(s).normalize('NFD').replace(/\p{M}/gu, '');
const norm = (w) => w.toLowerCase().replace(/['’]s$/, '').replace(/['’]/g, '');
// Diacritics are ignored ("Négritude" is found by "negritude") and hyphenated words are indexed whole and in parts
// ("three-act" is found by "three act").
const tokens = (s) => {
  const out = [];
  for (const w of strip(s).match(WORD_RE) ?? []) {
    const lw = norm(w);
    out.push(stem(lw));
    if (lw.includes('-')) for (const part of lw.split('-')) if (part) out.push(stem(part));
  }
  return out;
};

// BM25-lite index, built on first use and rebuilt when the large library arrives.
let index = null;
const tf = (toks) => {
  const m = new Map();
  for (const t of toks) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
};
const nameKey = (s) =>
  strip(s)
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/['’]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(' ')
    .map(stem)
    .join(' ');
const noArticle = (key) => key.replace(/^(?:the|a|an) /, '');
function build() {
  const exact = new Map();
  const docs = KNOWLEDGE.map((k) => {
    const nameToks = tokens([k.name, ...k.aka, k.author ?? ''].join(' '));
    const kwToks = tokens([...k.keywords, k.topic ?? '', k.guide ?? '', ...k.scope].join(' '));
    const bodyToks = tokens([k.summary, ...k.conventions, ...k.deliberateWhen, ...k.watchFor, k.example ?? ''].join(' '));
    for (const [list, tier] of [[[k.name, ...k.aka], 'name'], [k.keywords, 'kw']]) {
      for (const n of list) {
        const key = nameKey(n);
        for (const kk of new Set([key, noArticle(key)])) {
          if (!kk) continue;
          const m = exact.get(kk) ?? new Map();
          if (tier === 'name' || !m.has(k)) m.set(k, tier);
          exact.set(kk, m);
        }
      }
    }
    return {
      k,
      f: { name: tf(nameToks), kw: tf(kwToks), body: tf(bodyToks) },
      len: nameToks.length + kwToks.length + bodyToks.length,
      w: KIND_WEIGHT[k.kind] ?? 1,
      title: new Set(tokens([k.name, ...k.aka].join(' '))),
      nameKeys: [k.name, ...k.aka].map((n) => ` ${nameKey(n)} `),
      // The name's own words without the little ones ("The Epic of Gilgamesh" -> epic, gilgamesh): for exact-title matching.
      cores: [k.name, ...k.aka].map((n) => new Set(tokens(String(n).split(/[:;]|, or | or, /i)[0]).filter((t) => t.length > 1 && !STOPWORDS.has(t)))),
    };
  });
  const df = new Map();
  for (const d of docs) {
    const seen = new Set([...d.f.name.keys(), ...d.f.kw.keys(), ...d.f.body.keys()]);
    for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const avg = docs.reduce((a, d) => a + d.len, 0) / docs.length;
  index = { docs, df, avg, N: docs.length, exact };
}

const WEIGHTS = { name: 4, kw: 3, body: 1 };
// Craft questions should surface craft knowledge first; a bibliographic work only outranks it when the question is about the work.
const KIND_WEIGHT = { work: 0.6, usage: 0.9, rule: 0.95 };
const QUERY_FILLER = new Set(['okay', 'ok', 'allowed', 'acceptable', 'proper', 'properly', 'correct', 'correctly', 'wrong', 'right', 'tell', 'explain', 'describe', 'define', 'meaning', 'mean', 'means', 'difference', 'want', 'need', 'idea', 'make', 'help', 'something', 'like', 'could', 'would', 'think', 'know', 'dont', 'don\'t', 'how', 'what', 'also', 'really']);

/** Keyword-ranked search over the library. Returns entries; use `searchScored` when the strength of the match matters. */
export function search(query, opts = {}) {
  return searchScored(query, opts).map((s) => s.entry);
}

// Words that carry the question, not the topic. "vs" and friends only join two topics.
const JOINERS = new Set(['vs', 'versus', 'or', 'and', 'the', 'a', 'an']);
// Words the stopword list drops but that can BE the topic ("who vs whom", "its or it's", "that or which").
const TOPIC_WORDS = new Set(['who', 'whom', 'whose', 'which', 'that', 'than', 'then', 'their', 'there', 'they', 'them', 'its', 'it']);

/** The content words of a question as index tokens. Two-letter terms count ("AP", "UK", "em dash"). */
function queryTokens(query) {
  const words = (strip(query).match(WORD_RE) ?? []).map(norm).filter((w) => w && !JOINERS.has(w));
  const content = words.filter((w) => !STOPWORDS.has(w) && !QUERY_FILLER.has(w));
  let chosen = content;
  // A question made only of function words ("who vs whom") is about those words.
  if (content.length <= 1) chosen = words.filter((w) => !QUERY_FILLER.has(w) && (!STOPWORDS.has(w) || TOPIC_WORDS.has(w)));
  return [...new Set(chosen.flatMap((w) => [stem(w), ...(w.includes('-') ? w.split('-').filter(Boolean).map(stem) : [])]))].filter((t) => t.length > 1);
}

// "What is a sonnet?" -> "sonnet": the subject of a definition-style question, for an exact name match.
const LEAD_WORDS = new Set('what whats is are was were a an the define explain describe tell me about meaning of does do mean means difference differences between how to i you should can use when who'.split(' '));
function subjectOf(query) {
  const w = nameKey(query).split(' ').filter(Boolean);
  while (w.length > 1 && LEAD_WORDS.has(w[0])) w.shift();
  return w.join(' ');
}

/** Like `search`, but with scores, so a caller can tell "a good answer" from "the least bad entry". */
export function searchScored(query, { kinds = null, limit = 6, minScore = 1.2 } = {}) {
  if (!index) build();
  const q = queryTokens(query);
  if (!q.length) return [];
  const { docs, df, avg, N, exact } = index;
  const k1 = 1.2;
  const b = 0.6;
  const idfs = q.map((t) => Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5)));
  const idfTotal = idfs.reduce((a, x) => a + x, 0);
  const subject = subjectOf(query);
  const subjectKey = subject.split(' ').length >= 2 ? ` ${subject} ` : null;
  const exactHits = new Map();
  for (const key of new Set([noArticle(nameKey(query)), subjectOf(query)])) for (const [k, tier] of exact.get(key) ?? []) if (exactHits.get(k) !== 'name') exactHits.set(k, tier);
  const scored = [];
  for (const d of docs) {
    if (kinds && !kinds.includes(d.k.kind)) continue;
    let score = 0;
    let head = 0; // how much of the question (by rarity) the entry's name, aliases and keywords cover
    let any = 0;
    for (let i = 0; i < q.length; i++) {
      const t = q[i];
      const inHead = d.f.name.has(t) || d.f.kw.has(t);
      const tfv = WEIGHTS.name * (d.f.name.get(t) ?? 0) + WEIGHTS.kw * (d.f.kw.get(t) ?? 0) + WEIGHTS.body * (d.f.body.get(t) ?? 0);
      if (!tfv) continue;
      score += (idfs[i] * tfv * (k1 + 1)) / (tfv + k1 * (1 - b + (b * d.len) / avg));
      if (inHead) head += idfs[i];
      any += inHead ? idfs[i] : idfs[i] * 0.35;
    }
    score *= d.w;
    const isExact = exactHits.has(d.k);
    const nameHas = !isExact && subjectKey && d.nameKeys.some((n) => n.includes(subjectKey));
    if (isExact) score += exactHits.get(d.k) === 'name' ? 30 : 20;
    else if (nameHas) score += 25;
    if (score >= minScore) scored.push({ entry: d.k, score, headCoverage: isExact || nameHas ? 1 : head / idfTotal, coverage: isExact || nameHas ? 1 : any / idfTotal, exact: isExact || !!nameHas });
  }
  scored.sort((a, b2) => b2.score - a.score);
  // Coverage that counts: one name, alias or keyword phrase (plus the guide and topic) must hold most of the question, not
  // several different keywords that each hold a piece of it ("capital" in one, "France" in another).
  // Only the question's informative words count ("how", "write", "rules" do not make an entry about the question).
  const maxIdf = Math.max(...idfs);
  const need = q.map((t, i) => [t, idfs[i]]).filter(([, w]) => w >= TUNE.ratio * maxIdf);
  const needTotal = need.reduce((a, [, w]) => a + w, 0);
  for (const x of scored.slice(0, Math.max(limit, 12))) {
    if (x.exact) continue;
    const k = x.entry;
    const phrases = [[k.name, k.guide ?? '', k.topic ?? ''].join(' '), ...k.aka, ...k.keywords];
    let bestCov = 0;
    for (const ph of phrases) {
      const toks = new Set(tokens(ph));
      let c = 0;
      let n = 0;
      for (const [t, w] of need) if (toks.has(t)) { c += w; n++; }
      // Both measures must agree: by rarity ("France" alone is most of "capital of France") and by count of the question's words.
      const cov = Math.min(c / needTotal, n / need.length);
      if (cov > bestCov) bestCov = cov;
    }
    x.headCoverage = bestCov;
  }
  return scored.slice(0, limit);
}

// "Who wrote X?", "author of X", "when was X published?": the answer is a work, and only that work (or nothing).
const WORK_PATTERNS = [
  /\bwho (?:wrote|authored|is the author of|was the author of)\s+(.+)/i,
  /\b(?:the )?author of\s+(.+)/i,
  /\bwhen was\s+(.+?)\s+(?:first )?(?:published|written|released)\b/i,
  /\bwhat year was\s+(.+?)\s+(?:first )?(?:published|written|released)\b/i,
  /\b(?:what|which) genre (?:is|are|was)\s+(.+?)\s*\??$/i,
];
function workQuestion(query) {
  let title = null;
  for (const re of WORK_PATTERNS) {
    const m = String(query).match(re);
    if (m) {
      title = m[1];
      break;
    }
  }
  if (title === null) return null;
  const [titlePart, authorPart] = title.split(/\s+by\s+/i);
  title = titlePart; // "Rebecca by Daphne du Maurier": the title is what is looked up, the author only tells apart works with one title
  const authorToks = authorPart ? tokens(authorPart).filter((t) => t.length > 2 && !STOPWORDS.has(t)) : [];
  const want = [...new Set(tokens(title.replace(/\b(?:the book|the novel|the play|the poem)\b/gi, ' ')).filter((t) => t.length > 1 && !STOPWORDS.has(t)))];
  const matches = [];
  if (want.length) {
    if (!index) build();
    for (const d of index.docs) {
      if (d.k.kind !== 'work') continue;
      const hit = want.filter((t) => d.title.has(t)).length;
      if (hit / want.length < 0.85) continue;
      const exact = d.cores.some((c) => c.size === want.length && want.every((t) => c.has(t)));
      matches.push({ entry: d.k, exact, score: (exact ? 2 : hit / want.length) - d.title.size * 0.001 });
    }
    // When a work has exactly that title, other works that merely contain its words ("Cry, the Beloved Country") are not the answer.
    const byAuthor = (list) => {
      if (!authorToks.length) return list;
      const hit = list.filter((m) => tokens(m.entry.author ?? '').some((t) => authorToks.includes(t)));
      return hit.length ? hit : list;
    };
    if (matches.some((m) => m.exact)) return byAuthor(matches.filter((m) => m.exact)).sort((a, b) => b.score - a.score);
    return byAuthor(matches).sort((a, b) => b.score - a.score);
  }
  return matches.sort((a, b) => b.score - a.score);
}

export const STRONG_SCORE = 11;
// A strong answer must be about what the question names: the entry's own name, aliases and keywords have to cover most of it.
// (Scores alone are not enough: in a library of thousands of entries, one rare word is enough to score "well".)
// Tuned against tests/fixtures/library-questions.json (see tests/library-answers.test.js); exported so the tuning script can move them.
export const TUNE = { ratio: 0.5, strong: 0.6, weak: 0.5, weakScore: 6, hiScore: 18, hiCov: 0.3, nearScore: 14 };
// Talk about the writer's own work ("who is the killer in my story?") is not a reference question, unless it plainly asks for one.
const OWN_WORK = /\b(?:my|our)\s+(?:story|stories|novel|book|manuscript|draft|character|characters|protagonist|hero|heroine|villain|antagonist|narrator|plot|scene|chapter|screenplay|script|poem|essay|memoir|series|world)\b/i;
const REFERENCE_ASK = /\b(?:what is|what are|what's|define|meaning of|difference between|how (?:do|can|should|would) (?:i|you|we)\b|should i\b|can i\b|rule for|rules for|is it (?:\w+ or \w+))\b/i;
export function answerFromLibrary(query, { limit = 3, kinds = null } = {}) {
  if (OWN_WORK.test(query) && !REFERENCE_ASK.test(query)) return { strength: 'none', entries: [], related: [] };
  // A question about who wrote / when was published is answered by that work, or by saying the library does not hold it.
  const work = workQuestion(query);
  if (work) {
    if (!work.length) return { strength: 'none', entries: [], related: [] };
    return { strength: 'strong', entries: work.slice(0, limit).map((x) => x.entry), related: [] };
  }
  const scored = searchScored(query, { limit: Math.max(limit, 6), minScore: 1.2, kinds });
  if (!scored.length) return { strength: 'none', entries: [], related: [] };
  const best = scored[0];
  const top = best.score;
  // A weak match only counts when the question actually names the entry's topic ("how do I punctuate dialogue" names
  // "dialogue"); otherwise a keyword accident ("the detective wants…" -> mystery) would hijack talk about the writer's story.
  const q = new Set(queryTokens(query));
  const nameStems = tokens([best.entry.name, ...best.entry.aka].join(' '));
  const nameHit = best.exact || nameStems.some((t) => q.has(t) && t.length > 1 && !STOPWORDS.has(t));
  let strength = 'none';
  if (top >= STRONG_SCORE && best.headCoverage >= TUNE.strong) strength = 'strong';
  else if (top >= TUNE.weakScore && best.headCoverage >= TUNE.weak && nameHit) strength = 'weak';
  // A very strong lexical match that names the entry covers only part of a long question: the closest entry, offered as such.
  else if (top >= TUNE.hiScore && best.headCoverage >= TUNE.hiCov && nameHit) strength = 'weak';
  if (strength === 'none') {
    // Not an answer, but a good lexical match that shares a word of its NAME with the question is worth showing as "closest".
    const inf = queryTokens(query);
    const near = scored.filter((x) => x.score >= TUNE.nearScore && tokens([x.entry.name, ...x.entry.aka].join(' ')).some((t) => inf.includes(t) && t.length > 3 && !STOPWORDS.has(t))).slice(0, 2).map((x) => x.entry);
    return { strength, entries: [], related: scored.slice(0, 3).map((x) => x.entry), near };
  }
  // Entries close in score to the best one belong to the answer; the rest are only "related".
  const entries = scored.filter((x) => x.score >= top * 0.72 && x.headCoverage >= (strength === 'weak' ? TUNE.hiCov : TUNE.weak)).slice(0, limit).map((x) => x.entry);
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
  const derived = KNOWLEDGE.filter((k) => k.derived).length;
  return { total: KNOWLEDGE.length, derived, byKind, ruleGuides: [...guides].sort(), loaded: libraryState.loaded };
}
