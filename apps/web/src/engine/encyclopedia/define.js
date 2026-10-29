import { splitProse } from './grounding.js';
import { terms, titleKeys } from './tokens.js';

/**
 * "What is a sonnet?", "Who was Gustave Eiffel?", "Tell me about Veldhaven": a question that asks for the plain meaning of one named thing. When the offline encyclopedia has an article
 * with exactly that name, the answer is the article's own opening sentences, quoted, numbered as source [n], and no model is asked: a small model retelling an encyclopedia introduction is the
 * one place it is measurably worse than the introduction itself (it drops, softens and invents).
 */

const OPENERS = [
  /^(?:what(?:'s|’s| is| are)\s+the\s+)?(?:definition|meaning) of\s+(?:an?\s+|the\s+)?(.+)$/i,
  /^(?:what|who)(?:'s|’s| is| was| are| were)\s+(?:an?\s+|the\s+)?(.+)$/i,
  /^(?:please\s+)?(?:tell me about|tell me what|explain|define|describe)\s+(?:what\s+(?:an?\s+|the\s+)?)?(?:an?\s+|the\s+)?(.+?)(?:\s+(?:is|are|means?))?$/i,
];
// a subject that is about the writer, the conversation or a whole sentence is not a thing in an encyclopedia
const NOT_A_THING = /\b(?:my|mine|our|your|you|me|i|we|this|that|these|those|it|its|he|she|they|them|here|there|story|stories|chapter|scene|character|draft|novel|manuscript|text|writing)\b/i;

/** The thing asked about, or null when the question is not a plain "what/who is X". With `bare`, a short phrase that is only a name ("look up Veldhaven" searched for "Veldhaven") counts too. */
export function definitionSubject(question, { bare = false } = {}) {
  const q = String(question ?? '').replace(/\s+/g, ' ').trim().replace(/[?!.\s]+$/, '');
  if (!q || q.length > 120) return null;
  for (const re of OPENERS) {
    const m = re.exec(q);
    if (!m) continue;
    const subject = m[1].trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim();
    const n = subject.split(/\s+/).length;
    if (subject.length < 2 || n > 6 || NOT_A_THING.test(subject) || /[,;:]/.test(subject)) return null;
    return subject;
  }
  if (bare && !/[?]/.test(question) && q.split(/\s+/).length <= 5 && !NOT_A_THING.test(q) && !/[,;:]/.test(q)) return q;
  return null;
}

const sameName = (a, b) => terms(a).join(' ') === terms(b).join(' ') && terms(a).length > 0;

/** Does this article title name exactly the thing asked about ("Sonnet" for "sonnets"; "Veldhaven (city)" for "Veldhaven")? */
export const titleNames = (title, subject) => titleKeys(title).some((k) => sameName(k, subject));

/**
 * @param {{ question: string, sources: { n: number, title: string, text: string }[], maxChars?: number, bare?: boolean }} o
 * @returns {{ reply: string, n: number, title: string } | null}
 */
export function definitionalAnswer({ question, sources, maxChars = 520, bare = false }) {
  const subject = definitionSubject(question, { bare });
  if (!subject) return null;
  const hits = (Array.isArray(sources) ? sources : []).filter((s) => s?.text && titleNames(s.title, subject));
  // an article with exactly the name, not a bracketed one, comes first
  const source = hits.find((s) => !/\(/.test(s.title)) ?? hits[0];
  if (!source) return null;
  let text = '';
  for (const sentence of splitProse(source.text)) {
    const next = text ? `${text} ${sentence}` : sentence;
    if (text && (next.length > maxChars || text.split(/(?<=[.!?])\s/).length >= 2)) break;
    text = next;
  }
  text = text.trim();
  if (text.length < 30) return null;
  return { reply: `${text} [${source.n}]`, n: source.n, title: source.title };
}
