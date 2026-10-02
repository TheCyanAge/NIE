import { words } from '../util/text.js';

/**
 * Defence in depth for "NIE never writes or edits your text".
 * The prompt already forbids drafting; this removes any long quoted passage in a model reply that is NOT the
 * writer's own words, i.e. something the model composed.
 */

const QUOTED = /"([^"\n]{1,2000})"|“([^”\n]{1,2000})”|"""([\s\S]{1,4000}?)"""|```[\s\S]{1,4000}?```/g;
const MAX_FOREIGN_WORDS = 24;

const squash = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * @param {string} reply     model reply
 * @param {string[]} known   texts the writer supplied (message, story text); quoting these back is fine
 * @returns {{ text: string, removed: number, remaining: string }}  `remaining` is the reply with composed passages removed (before the notice)
 */
export function guardReply(reply, known = []) {
  const corpus = squash(known.join('\n'));
  let removed = 0;
  const text = String(reply ?? '').replace(QUOTED, (full, a, b, c) => {
    const inner = (a ?? b ?? c ?? full).trim();
    if (full.startsWith('```')) {
      removed++;
      return '';
    }
    if (words(inner).length <= MAX_FOREIGN_WORDS) return full;
    if (corpus.includes(squash(inner))) return full;
    removed++;
    return '';
  });
  const cleaned = text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return {
    remaining: cleaned,
    text: removed ? `${cleaned}\n\n(I left out a passage I'd composed: I don't write text for you, only talk through ideas and point at where things are.)`.trim() : cleaned,
    removed,
  };
}
