import { sentenceSpans } from './sentences.js';

/**
 * Does a reply talk ABOUT the person NIE is talking TO? ("How does the writer maintain the reader's curiosity...": a 3B model copies the prompt's own
 * "the writer" and answers in the third person, as if the writer were not there.) The product speaks to the writer as "you".
 *
 * Matches "the writer", "this writer", "that writer", "the author", "this author", "the user" (and their possessives): the words a reply uses for the person it
 * addresses. It does NOT match "a writer" or "writers" (craft talk about writers in general), "the author of Dune" or "the writer of <a title>" (someone else),
 * or "the user interface". It can still flag a generic craft sentence such as "the writer must choose", which is why this is a check for the caller to act on
 * (remove the sentence, ask again), never a verdict on its own.
 */

const THIRD = /\b(?:the|this|that|our|said)\s+(?:(?:main|current|same|original|individual)\s+)?(writer|author|user)(?:['’]s)?\b/gi;
const SOMEONE_ELSE = /^\s+of\s+(?:\p{Lu}|["“‘])/u; // "the author of Dune", "the writer of "The Tide""
const NOT_A_PERSON = /^\s+(?:interface|experience|manual|guide|account|settings|name)\b/i; // "the user interface"
// Words in quotation marks are somebody's words (a line of the writer's text, a title, the phrase being discussed), not NIE speaking about the writer.
const QUOTED = /"[^"\n]{0,300}"|“[^”\n]{0,300}”/g;
const mask = (s) => s.replace(QUOTED, (m) => ' '.repeat(m.length));

/**
 * Every place where the text speaks of the person it is talking to in the third person.
 * @returns {{ phrase: string, start: number, end: number, sentence: { text: string, start: number, end: number } }[]}
 */
export function findThirdPerson(text) {
  const src = typeof text === 'string' ? text : '';
  if (!src) return [];
  const spans = sentenceSpans(src);
  const out = [];
  for (const m of mask(src).matchAll(THIRD)) {
    const end = m.index + m[0].length;
    const after = src.slice(end, end + 40);
    const who = m[1].toLowerCase();
    if (/^[-‐]\p{L}/u.test(src.slice(end, end + 2))) continue; // "the user-friendly page", "the author-date style": a compound, not a person
    if (/^\p{Lu}/u.test(m[1]) && /^\s+\p{Lu}/u.test(after)) continue; // a title in capitals: "The Writer's Room", "The Author Speaks"
    if (who !== 'user' && SOMEONE_ELSE.test(after)) continue;
    if (who === 'user' && NOT_A_PERSON.test(after)) continue;
    const sentence = spans.find((s) => s.start <= m.index && m.index < s.end) ?? { text: src.slice(Math.max(0, m.index - 40), end + 40), start: m.index, end };
    out.push({ phrase: m[0], start: m.index, end, sentence: { text: sentence.text, start: sentence.start, end: sentence.end } });
    if (out.length >= 50) break;
  }
  return out;
}

export function speaksAboutTheWriter(text) {
  return findThirdPerson(text).length > 0;
}
