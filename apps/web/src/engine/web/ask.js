import { words } from '../util/text.js';

/**
 * When is a message a request to look something up, and what exactly leaves the computer? Plain rules, no model: the writer either says so ("search the web for ...") or turns the
 * Web switch on and asks a factual question. The search words are the writer's question and nothing else: never a pasted text, never the project.
 */

export const QUERY_MAX_WORDS = 24;

const LEAD = /^\s*(?:(?:hey|ok|okay|nie|please|pls|so|and)[,\s]+)*(?:(?:can|could|would|will)\s+you\s+)?(?:(?:please|just)\s+)?(search|google|look\s*up|lookup|find\s+out|find|check)\b[\s,:;-]*/i;
const WEBWORD = /\b(?:the\s+)?(?:web|internet|online|google)\b/i;
const LEAD_WEB = /^(?:(?:for|about|on)\s+)?(?:(?:the\s+)?(?:web|internet)\b|online\b|google\b)\s*(?:for|about|on|that|whether|if|:|,|-)?\s*/i;
const AFTER_FOR = /^(?:for|about|on)\s+/i;
const TRAIL_WEB = /[,;.\s]*(?:and\s+)?(?:please\s+)?(?:search|look\s+it\s+up|google\s+it|check|find\s+it)\s+(?:for\s+it\s+)?(?:on\s+)?(?:the\s+)?(?:web|internet|online|google)\W*$/i;
const TRAIL_ONLINE = /[,;\s]+(?:online|on\s+the\s+(?:web|internet)|on\s+google)\W*$/i;
const SOURCES_CUE = /[,;.\s]*(?:and\s+|but\s+|please\s+)?(?:with|cite|include|show|give\s+me)\s+(?:your\s+|some\s+|the\s+)?(?:sources|citations|references|links)\W*$/i;
const SOURCES_ANY = /\b(?:with|cite|include|show|give\s+me)\s+(?:your\s+|some\s+|the\s+)?(?:sources|citations|references|links)\b/i;

const tidy = (s) => s.replace(/\s+/g, ' ').replace(/^[\s,;:.-]+|[\s,;:?!.-]+$/g, '').trim();

/**
 * @returns {{ query: string, strength: 'search'|'sources' } | null}
 *   'search': the writer said to search or look something up. 'sources': they only asked for sources with an answer, so a NIE with no web search simply answers as it always did.
 */
export function explicitWebAsk(text) {
  const t = String(text ?? '').trim();
  if (!t || t.length > 600) return null;
  const lead = LEAD.exec(t);
  if (lead) {
    const verb = lead[1].toLowerCase().replace(/\s+/g, ' ');
    let rest = t.slice(lead[0].length);
    const hasWebWord = WEBWORD.test(rest.slice(0, 80));
    // "search for X" and "google X" and "look up X" say it themselves; "find" and "check" only mean the web when the web is named
    if (verb === 'search' || verb === 'google' || verb === 'look up' || verb === 'lookup' || hasWebWord) {
      rest = rest.replace(LEAD_WEB, '').replace(AFTER_FOR, '').replace(SOURCES_CUE, '').replace(TRAIL_ONLINE, '').replace(/\s+(?:online|on\s+the\s+(?:web|internet))\b/i, '');
      const query = tidy(rest);
      if (words(query).length >= 1 && !/^(?:it|that|this|them|these|those)$/i.test(query)) return { query, strength: 'search' };
    }
  }
  const trail = TRAIL_WEB.exec(t);
  if (trail && trail.index > 6) {
    const query = tidy(t.slice(0, trail.index).replace(SOURCES_CUE, ''));
    if (words(query).length >= 2) return { query, strength: 'search' };
  }
  if (SOURCES_ANY.test(t) && words(t).length >= 4) return { query: tidy(t.replace(SOURCES_CUE, '')), strength: 'sources' };
  return null;
}

/** Is it too much to send to a search service? A search is a sentence or two, never a pasted text. */
export function queryProblem(query) {
  const q = String(query ?? '').trim();
  if (!q) return 'empty';
  if (words(q).length > QUERY_MAX_WORDS || q.length > 300) return 'long';
  return '';
}

const PRONOUN = /\b(?:it|its|they|them|their|this|that|these|those|he|she|his|her|there|then)\b/i;
const CONTINUES = /^(?:and|but|so|then|what\s+about|how\s+about)\b/i;

/** A short follow-up that means nothing alone ("and when was it built?"). */
export const needsContext = (query) => {
  const q = String(query ?? '').trim();
  return words(q).length <= 7 && (PRONOUN.test(q) || CONTINUES.test(q));
};

/** The words of the last web search in this conversation, if one was made in the last few messages. */
export function previousWebQuery(history) {
  const recent = (Array.isArray(history) ? history : []).slice(-6);
  for (let i = recent.length - 1; i >= 0; i--) if (recent[i]?.role === 'assistant' && recent[i].web?.query) return recent[i].web.query;
  return '';
}

/** The previous question's words with this follow-up after them: used only when no model is there to rewrite the follow-up. */
export const joinFollowUp = (previous, query) => {
  const joined = tidy(`${previous} ${query.replace(CONTINUES, '').replace(/[?!.]+$/, '')}`);
  return words(joined).length <= QUERY_MAX_WORDS ? joined : query;
};

const WH = /^\s*(?:and\s+)?(?:what|who|whom|whose|which|when|where|why|how|is|are|was|were|does|do|did|can|could|will|would|has|have|had)\b/i;
const IMPERATIVE = /^\s*(?:tell\s+me\s+about|explain|define|describe)\b/i;

/** A factual question or a plain request to explain something, as opposed to a statement or talk about a story. `general` is the orchestrator's own pattern for a general question. */
export const looksFactual = (text, general = null) => {
  const t = String(text ?? '').trim();
  if (!t || words(t).length > QUERY_MAX_WORDS) return false;
  return Boolean(general?.test(t)) || IMPERATIVE.test(t) || (WH.test(t) && (/\?\s*$/.test(t) || words(t).length <= 12));
};
