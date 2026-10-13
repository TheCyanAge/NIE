import { STOPWORDS, WORD_RE, stem } from '../util/text.js';

/**
 * Words as the mind compares them: lower-case content words, stemmed (the same crude stemmer the rest of NIE uses), with possessives and contractions
 * handled ("Mara's" is "mara", "don't" is nothing), because a name that cannot be found when it is written one way more often than the other is a memory
 * that forgets people.
 *
 * ISOLATION: the only state in this file is a memo of `text -> tokens`. It is keyed by the EXACT text (not a hash, so two different texts can never
 * share an entry), the value is a pure function of that text, and it holds at most MEMO_MAX entries (it is emptied when full). A project's text
 * therefore can never change what another project gets back; the memo only saves re-doing the same work (recall runs on every message).
 */

const MEMO_MAX = 6000;
const memo = new Map();

/** The word without edge punctuation, possessive 's removed; '' for a contraction tail (n't, 'll, 're, 've, 'm, 'd), which carries no content. */
function core(raw) {
  let w = raw.replace(/^['’-]+|['’-]+$/g, '');
  const poss = /^(.+?)['’]s$/.exec(w);
  if (poss) w = poss[1];
  else if (/['’](?:t|ll|re|ve|m|d)$/.test(w)) return '';
  return w;
}

/** Stems of the content words of `text`, in order, repeats kept. Looks at the first 4,000 characters only. Not memoised. */
export function tokenize(text) {
  const s = typeof text === 'string' ? text.slice(0, 4000) : '';
  const out = [];
  for (const raw of s.toLowerCase().match(WORD_RE) ?? []) {
    const w = core(raw);
    if (w.length > 1 && !STOPWORDS.has(w)) out.push(stem(w));
  }
  return out;
}

/** `{ list, set, neg }` for a text (memoised, see above). The list is frozen; callers must not add to the set. */
export function tokensOf(text) {
  if (typeof text !== 'string') return EMPTY;
  let hit = memo.get(text);
  if (!hit) {
    const list = Object.freeze(tokenize(text)); // (shared by every caller: frozen, so no caller can change what another one gets)
    hit = { list, set: new Set(list), neg: NEGATION.test(text) };
    if (memo.size >= MEMO_MAX) memo.clear();
    memo.set(text, hit);
  }
  return hit;
}
const EMPTY = Object.freeze({ list: Object.freeze([]), set: new Set(), neg: false });
/** "not", "never", "no longer", "can't": negation words are stopwords, so a comparison of content words cannot see them; `neg` lets a caller tell "she is X" from "she is not X". */
const NEGATION = /\b(?:not|no|never|nobody|none|nothing|neither|nor|cannot|without)\b|n['’]t\b/i;

/** Empty the memo (a test hook; nothing else needs it). */
export const clearTokenMemo = () => memo.clear();

/** Lower-case letters and digits only, one space between words: the form in which two texts are "the same text". */
export function normText(text) {
  return typeof text === 'string' ? text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim() : '';
}

/** Stems of capitalised words that do not begin a sentence: probably names, the best way to find a passage. */
export function nameStems(text) {
  const s = typeof text === 'string' ? text.slice(0, 2000) : '';
  const out = new Set();
  for (const m of s.matchAll(/(?<![\p{L}\p{N}])\p{Lu}[\p{L}'’-]{2,}/gu)) {
    const before = s.slice(0, m.index).trimEnd();
    if (!before || /[.!?:]$/.test(before)) continue;
    for (const t of tokenize(m[0])) out.add(t);
  }
  return out;
}
