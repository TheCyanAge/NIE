import { STOPWORDS, fnv1a } from '../util/text.js';
import { bareWord, capitalisedRuns, neverName, OPENERS, ORDINARY_OPENERS, TITLES } from './names.js';
import { numbersIn } from './numbers.js';
import { removeSpans, sentenceSpans } from './sentences.js';

/**
 * Grounding: a reply about the writer's own text may not contain a name (or a number stated as a fact about the text) that occurs nowhere the reply could have
 * learnt it from. Measured on the real model: replies invented names ("Haldric Ombrecht": two real names of the text, put together), set-ups and numbers.
 *
 * `groundNames` REMOVES the sentences that break this and never rewords anything. Sentences are judged one by one:
 *  - a capitalised word in the middle of a sentence, or a run of two or more capitalised words anywhere, must occur in `sources` (the text, the writer's
 *    messages, the project's memory...) or in `known` (NIE's own words, the profile's words, the labels of kinds, forms and genres, the names in a library
 *    answer). A run must occur as a run: "Haldric Ombrecht" is not grounded by "Emeric Haldric" in one place and "Isaura Ombrecht" in another.
 *    (The one capitalised word that opens a sentence proves nothing and is not judged, unless it is followed by 's.)
 *  - a number of ten or more, or one with a comma or a decimal point, in a sentence that speaks of the text ("your chapter", "the draft"), must occur in the
 *    sources (as digits or in words: "ninety" and "90" are the same number). A section or chapter number is a place, not a fact, and is left alone unless
 *    `sections` (how many sections the text has) says it cannot exist.
 * What the check cannot see: a set-up or a fact made of ordinary words. It stops the inventions that can be counted, nothing more.
 */

// ── what the reply may rely on ───────────────────────────────────────────────

// Vocabularies are cached by a hash of the source text (a 10,000-word text is read once, not on every reply). Bounded (the last four sources), keyed by content,
// holding only the words of a source: no project state. `clearGroundingCache` empties it (the caller does so when the writer switches or deletes a project).
const CACHE = new Map();
const CACHE_MAX = 4;

export const clearGroundingCache = () => CACHE.clear();
export const groundingCacheSize = () => CACHE.size;
const SOURCE_CAP_CHARS = 3_000_000;

// A role or title in front of a name ("Commissioner Haldric", "Captain Vane") is not part of the name: the name after it is what must be in a source.
const ROLE_WORDS = new Set(
  ('commissioner captain doctor professor master chief inspector dispatcher keeper king queen prince princess president mayor judge officer sergeant general colonel major admiral ' +
    'lord lady sir father mother brother sister aunt uncle grandmother grandfather detective constable warden bishop priest abbot count duke duchess baron').split(' ')
);

// NIE's own vocabulary and the capitalised words of ordinary English that a reply uses without a source for them
const BUILTIN = 'NIE. Idea Board. Full Scan. Story Text. Project Memory. Brainstorm. Settings. English. American. British. French. German. Spanish. Latin. Greek. Christmas.';

function wordsOfSource(source) {
  const toks = [];
  const caps = [];
  const words = new Set();
  const lower = new Set();
  const pos = new Map();
  let prevEnd = -1;
  const re = /[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu;
  const push = (t, cap) => {
    toks.push(t);
    caps.push(cap);
    if (t !== '|') {
      const list = pos.get(t);
      if (list) list.push(toks.length - 1);
      else pos.set(t, [toks.length - 1]);
    }
  };
  for (const m of source.matchAll(re)) {
    const bare = bareWord(m[0]);
    if (!bare) continue;
    let brk = prevEnd < 0;
    for (let i = Math.max(prevEnd, 0); !brk && i < m.index; i++) {
      const c = source.charCodeAt(i);
      if (c !== 32 && c !== 9 && c !== 0xa0) brk = true;
    }
    if (brk && toks.at(-1) !== '|') push('|', false);
    prevEnd = m.index + m[0].length;
    const lo = bare.toLowerCase().replace(/’/g, "'");
    const cap = bare[0] !== bare[0].toLowerCase() && bare[0] === bare[0].toUpperCase();
    push(lo, cap);
    words.add(lo);
    if (!cap) lower.add(lo);
    if (lo.includes('-')) for (const part of lo.split('-')) if (part) words.add(part);
  }
  return { toks, caps, words, lower, pos, nums: null, source };
}

function vocabularyOf(source) {
  const s = source.length > SOURCE_CAP_CHARS ? source.slice(0, SOURCE_CAP_CHARS) : source;
  const key = `${s.length}:${fnv1a(s)}`;
  const hit = CACHE.get(key);
  if (hit) {
    CACHE.delete(key);
    CACHE.set(key, hit);
    return hit;
  }
  const v = wordsOfSource(s);
  CACHE.set(key, v);
  while (CACHE.size > CACHE_MAX) CACHE.delete(CACHE.keys().next().value);
  return v;
}

let builtinVocab = null;
const numbersOf = (v) => (v.nums ??= new Set(numbersIn(v.source, { limit: 20000 }).map((n) => n.value)));

/** The vocabularies of every source the reply may rely on. `known` entries are short strings: they are read as sources too. */
function vocabularies(sources, known) {
  const list = [];
  for (const s of typeof sources === 'string' ? [sources] : Array.isArray(sources) ? sources : []) if (typeof s === 'string' && s.trim()) list.push(vocabularyOf(s));
  const extra = (Array.isArray(known) ? known : []).filter((k) => typeof k === 'string' && k.trim()).map((k) => k.trim().slice(0, 200));
  list.push((builtinVocab ??= wordsOfSource(BUILTIN))); // (code, not project data)
  if (extra.length) list.push(wordsOfSource(extra.join('\n'))); // (short, so not worth caching)
  return list;
}

const wordKnown = (vs, w) => vs.some((v) => v.words.has(w));
const ordinary = (vs, w) => STOPWORDS.has(w) || OPENERS.has(w) || ORDINARY_OPENERS.has(w) || vs.some((v) => v.lower.has(w));

/** Does the run occur in a source, word after word (a capitalised middle word may sit between: "Commissioner Haldric" for "Commissioner Emeric Haldric")? */
function phraseKnown(vs, parts) {
  for (const v of vs) {
    for (const i of v.pos.get(parts[0]) ?? []) {
      let at = i;
      let ok = true;
      for (let k = 1; ok && k < parts.length; k++) {
        if (v.toks[at + 1] === parts[k]) at += 1;
        else if (v.caps[at + 1] && v.toks[at + 2] === parts[k]) at += 2;
        else ok = false;
      }
      if (ok) return true;
    }
  }
  return false;
}

// ── names ────────────────────────────────────────────────────────────────────

const isLeadingFiller = (parts, k) => {
  const lo = parts[k].toLowerCase();
  return STOPWORDS.has(lo) || TITLES.has(lo) || (ROLE_WORDS.has(lo) && k + 1 < parts.length);
};

/** The capitalised names in one sentence that no source has. */
function unknownNames(sentence, vs) {
  const out = [];
  for (const run of capitalisedRuns(sentence)) {
    const parts = run.parts;
    let lead = 0;
    while (lead < parts.length && isLeadingFiller(parts, lead)) lead++;
    let end = parts.length;
    while (end > lead && STOPWORDS.has(parts[end - 1].toLowerCase())) end--;
    if (lead >= end) continue;
    if (run.initial && lead === 0) {
      const first = parts[0].toLowerCase();
      if (end === 1) {
        if (!run.possessive) continue; // the capital of a sentence's first word proves nothing
      } else if (ordinary(vs, first) || (first.length > 4 && first.endsWith('ly'))) lead = 1;
    }
    let piece = [];
    const flush = () => {
      if (!piece.length) return;
      const lows = piece.map((p) => p.toLowerCase().replace(/’/g, "'"));
      const known = lows.length === 1 ? wordKnown(vs, lows[0]) || ordinary(vs, lows[0]) : phraseKnown(vs, lows) || lows.every((w) => ordinary(vs, w));
      if (!known) out.push(piece.join(' '));
      piece = [];
    };
    for (let k = lead; k < end; k++) {
      const lo = parts[k].toLowerCase();
      if (neverName(parts[k]) || isHeadingNumber(lo)) flush();
      else piece.push(parts[k]);
    }
    flush();
  }
  return [...new Set(out)];
}

const NUMBER_WORD_RE = /^(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million)(?:-\w+)?$/;
const isHeadingNumber = (lo) => NUMBER_WORD_RE.test(lo);

// ── numbers ──────────────────────────────────────────────────────────────────

const ABOUT_THE_TEXT = /\b(?:your|the|this|that|his|her|their)\s+(?:text|draft|story|novel|bible|chapters?|sections?|scenes?|paragraphs?|manuscript|piece|script|poem|essay|book|passage|notes|opening|ending|document|timeline)\b/i;
const LOCATOR = /\b(?:sections?|chapters?|scenes?|paragraphs?|parts?|pages?|lines?|acts?|passages?|numbers?|no\.?|#)\s*$/i;
// "sections 3, 7 and 12" (no nested quantifier: a long run of digits cannot make this backtrack)
const LOCATOR_LIST = /\b(?:sections?|chapters?|scenes?|paragraphs?|parts?|pages?|lines?|acts?)\s+\d+(?:\s*(?:,\s*(?:and|or)|,|and|or|to|&|–|-)\s*\d+)*$/i;

/** Numbers in the sentence that no source has, when the sentence says them as facts about the text. */
function unknownNumbers(sentence, vs, sections) {
  const speaksOfText = ABOUT_THE_TEXT.test(sentence);
  const out = [];
  for (const n of numbersIn(sentence, { limit: 50 })) {
    const before = sentence.slice(Math.max(0, n.start - 40), n.start);
    if (LOCATOR.test(before) || LOCATOR_LIST.test(sentence.slice(Math.max(0, n.start - 60), n.end))) {
      if (Number.isFinite(sections) && sections > 0 && n.digits && n.value > sections) out.push(n.written); // there is no such section
      continue;
    }
    const heavy = n.digits ? n.value >= 10 || /[,.]/.test(n.written) : n.value >= 10;
    if (speaksOfText && heavy && !vs.some((v) => numbersOf(v).has(n.value))) out.push(n.written);
  }
  return [...new Set(out)];
}

// ── the check ────────────────────────────────────────────────────────────────

/**
 * @param {string} reply
 * @param {{ sources?: string[], known?: string[], sections?: number|null }} o
 *   `sources`: everything the reply may have learnt names and numbers from (the writer's text, their messages, the project's memory, the measured facts it was given).
 *   `known`: a short allow-list (NIE's own words, the profile's words, the labels of kinds, forms and genres, the names in a library answer).
 *   `sections`: how many sections the text has, so that "section 99" of a 25-section text is caught.
 * @returns {{ text: string, removed: { sentence: string, names: string[], numbers: string[] }[], emptied: boolean }}
 *   `emptied` is true when nothing is left: the caller says so instead of showing an empty reply.
 */
export function groundNames(reply, { sources = [], known = [], sections = null } = {}) {
  const src = typeof reply === 'string' ? reply : '';
  const result = { text: src, removed: [], emptied: false };
  if (!src.trim()) return { ...result, text: '' };
  const vs = vocabularies(sources, known);
  const cut = [];
  for (const sp of sentenceSpans(src)) {
    const names = unknownNames(sp.text, vs);
    const numbers = unknownNumbers(sp.text, vs, sections);
    if (names.length || numbers.length) {
      cut.push(sp);
      result.removed.push({ sentence: sp.text, names, numbers });
    }
  }
  if (!cut.length) return result;
  const text = removeSpans(src, cut);
  const left = /[\p{L}\p{N}]/u.test(text);
  return { text: left ? text : '', removed: result.removed, emptied: !left };
}
