import { STOPWORDS, WORD_RE, stem } from '../util/text.js';

/**
 * One way of cutting text into search terms, used when a pack is built and when a question is asked of it: they must agree or nothing is found.
 * Lowercase, accents removed, ordinary stop words dropped, plural and -ing/-ed endings trimmed (the same crude stemmer the rest of NIE uses).
 */

const QUESTION_WORDS = new Set(['tell', 'explain', 'define', 'describe', 'give', 'show', 'name', 'please', 'know', 'meaning', 'definition']);

// (the shared stemmer leaves "rise" and "rises" as two different terms, "bridge" and "bridges" too; a final e is dropped so they meet)
const light = (w) => {
  const s = stem(w);
  return s.length > 3 && s.endsWith('e') ? s.slice(0, -1) : s;
};

export const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** @param {{ question?: boolean }} o  `question`: also drop the words people put in front of a topic ("tell me about", "explain") */
export function terms(text, { question = false } = {}) {
  const out = [];
  for (const raw of fold(text).match(WORD_RE) ?? []) {
    const w = raw.replace(/^['’-]+|['’-]+$/g, '');
    if (!w || (w.length < 2 && !/\d/.test(w))) continue;
    if (STOPWORDS.has(w) || (question && QUESTION_WORDS.has(w))) continue;
    out.push(light(w));
  }
  return out;
}

/** The key under which an article is found by its exact name: folded, punctuation as single spaces. "Hamlet (1996 film)" is "hamlet 1996 film". */
export const titleKey = (title) => fold(title).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/** Other keys a title is also known by: without a leading article, and without a trailing disambiguation in brackets. */
export function titleKeys(title) {
  const keys = new Set();
  const add = (k) => k && keys.add(k);
  add(titleKey(title));
  add(titleKey(String(title).replace(/\s*\([^)]*\)\s*$/, '')));
  for (const k of [...keys]) add(k.replace(/^(?:the|a|an) /, ''));
  return [...keys];
}
