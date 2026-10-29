import { terms } from './tokens.js';

/**
 * Keeping a small model's answer from an article inside what the article says. Plain code over the numbered passages the model was shown; nothing here writes or rewords:
 * a sentence is kept as it is or it goes, and the reply says when one went.
 *
 *   tidyLead       the leftovers of Wikipedia's markup ("{\displaystyle c}", "Lua error ...", "This short article can be made longer") taken out of an article's opening
 *   focusSources   of each article, its first sentence and the sentences that share words with the question (a 3B model does better with 3 sentences than with a whole lead)
 *   tidyReply      a reply that repeats itself said once, a run of citation marks at the start moved to the end of the first sentence, a runaway reply cut at a sentence
 *   supportCheck   a sentence whose words (or whose figures) the articles do not hold goes: what a model says from its own memory, however likely
 *   absentReply    did the model say the passages do not answer the question?
 *   splitProse     sentences of plain prose (a full stop inside 1,776.05 or after St. or c. does not end one)
 */

// ── what Wikipedia's text leaves behind ─────────────────────────────────────

/** Takes out every {\displaystyle ...} (and its kin) with whatever is nested inside it: the braces are matched, not guessed at. */
function stripMath(text) {
  const start = /\{\\(?:displaystyle|textstyle|scriptstyle)/g;
  let out = '';
  let at = 0;
  let m;
  while ((m = start.exec(text))) {
    if (m.index < at) continue;
    let depth = 0;
    let i = m.index;
    for (; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}' && --depth === 0) break;
    }
    out += text.slice(at, m.index);
    at = Math.min(text.length, i + 1);
    start.lastIndex = at;
  }
  return out + text.slice(at);
}
const NOTICES = [
  /Lua error in [^:]{1,60}:[^.]{0,160}(?:not found|expected|nil value)\.?/gi,
  /This (?:short )?article (?:is a stub\. )?can be (?:made )?(?:longer|expanded)\.?(?: You can help Wikipedia by adding to it\.)?/gi,
  /You can help Wikipedia by (?:adding to|expanding) it\.?/gi,
  /Wikimedia Commons has media related to [^.]{1,120}\.?/gi,
  /The Simple English Wiktionary has a definition for:? [^.]{1,60}\.?/gi,
  /\[(?:source|citation|who|when|clarification|dubious)\?\]/gi,
];
export function tidyLead(text) {
  let t = stripMath(String(text ?? ''));
  for (const re of NOTICES) t = t.replace(re, ' ');
  return t.replace(/\(\s*\)/g, '').replace(/\s+([,.;:!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}

// ── sentences ────────────────────────────────────────────────────────────────

const ABBREV = /(?:^|\s)(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|Mt|Ft|vs|etc|No|Inc|Ltd|Co|Gen|Col|Sgt|Capt|Lt|Rev|Fig|c|ca|approx|e\.g|i\.e|U\.S|U\.K|a\.m|p\.m|B\.C|A\.D)\.$/i;
/**
 * Sentences of plain prose as strings. A full stop inside a number (1,776.05), after an abbreviation (St., c., U.S.) or inside a bracket does not end one: a sentence ends at . ! or ?
 * followed by a space and the start of another (a capital, a digit, a quote or a bracket).
 */
export function splitProse(text) {
  const t = String(text ?? '').replace(/\s+/g, ' ').trim();
  const out = [];
  let start = 0;
  const re = /[.!?]+["'”’)\]]*(?=\s+[A-Z0-9"'“‘(\[]|\s*$)/g;
  let m;
  while ((m = re.exec(t))) {
    const end = m.index + m[0].length;
    const piece = t.slice(start, end);
    if (end < t.length && ABBREV.test(piece.replace(/["'”’)\]]+$/, ''))) continue;
    out.push(piece.trim());
    start = end;
  }
  if (start < t.length) out.push(t.slice(start).trim());
  return out.filter(Boolean);
}

// ── the passages the model is shown ─────────────────────────────────────────

const wordsOf = (s) => (String(s).match(/\p{L}[\p{L}\p{N}'’-]*|\p{N}+/gu) ?? []).length;
const contentTerms = (s) => [...new Set(terms(s, { question: true }))].filter((t) => t.length >= 3 || /\d/.test(t));
const WANTS_A_NUMBER = /\bhow\s+(?:tall|high|long|big|large|far|old|heavy|wide|deep|fast|many|much|early|late)\b|\bwhat\s+(?:year|date|size|height|length|age|population)\b|\bwhen\b/i;
const A_YEAR = /\b(?:1\d{3}|20\d{2})\b/;

/**
 * What of each article the model is shown. The first `whole` articles (the best match) are shown as they are. Of the others, the first sentence and the sentences that bear on the question, in
 * their own order, at most `perSource` of them. A sentence bears on it when it shares a content word with the question, ignoring the words of the article's own title (every sentence of
 * "Mount Everest" is about Mount Everest), or when the question asks "how tall / how many / when" and the sentence has a figure. (Picking by shared words alone dropped "It is about
 * 8,848 metres high" for "How tall is Mount Everest?": measured on the real model.) `full` keeps the whole text; the support check is made against it.
 */
export function focusSources(sources, question, { whole = 1, perSource = 4, maxChars = 800 } = {}) {
  const q = new Set(contentTerms(question));
  const numeric = WANTS_A_NUMBER.test(String(question));
  return sources.map((s, rank) => {
    const text = String(s.text ?? '');
    if (rank < whole || text.length <= maxChars) return { ...s, full: text, text };
    const sentences = splitProse(text);
    if (sentences.length <= perSource) return { ...s, full: text, text };
    const own = new Set(contentTerms(s.title ?? ''));
    const scored = sentences.slice(1).map((x, i) => {
      let score = contentTerms(x).filter((t) => q.has(t) && !own.has(t)).length;
      if (numeric && /\d/.test(x)) score += 2;
      if (numeric && /\bwhen\b/i.test(question) && A_YEAR.test(x)) score += 1;
      return { i: i + 1, x, score };
    }).filter((x) => x.score > 0);
    scored.sort((a, b) => b.score - a.score || a.i - b.i);
    const keep = new Set([0, ...scored.slice(0, perSource - 1).map((x) => x.i)]);
    if (keep.size < 2) keep.add(1); // an article with nothing that matches still shows its first two sentences
    let out = [...keep].sort((a, b) => a - b).map((i) => sentences[i]).join(' ');
    if (out.length > maxChars) out = `${out.slice(0, maxChars - 1).replace(/\s+\S*$/, '')}…`;
    return { ...s, full: text, text: out };
  });
}

// ── the reply ────────────────────────────────────────────────────────────────

const key = (s) => String(s).toLowerCase().replace(/\[\d{1,2}\]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const MARKS_AT_START = /^\s*((?:\[\d{1,2}\][\s,;]*)+)/;

const ONLY_ABSENT = /^\s*(?:\[\d{1,2}\]\s*)*(?:the\s+)?(?:passages?|articles?|sources?)\s+(?:do(?:es)?\s+not|don't|doesn't)\s+say\.?\s*(?:\[\d{1,2}\]\s*)*$/i;

/** @returns {{ text: string, changed: boolean }} */
export function tidyReply(reply, { maxWords = 110 } = {}) {
  const before = String(reply ?? '').replace(/\r/g, '').trim();
  if (!before) return { text: '', changed: false };
  if (/^\s*(?:[-*•]|\d+[.)])\s/m.test(before)) return { text: before, changed: false }; // a list is left as it is
  const seen = new Set();
  const kept = [];
  let count = 0;
  for (let piece of splitProse(before)) {
    const lead = MARKS_AT_START.exec(piece);
    if (lead && lead[0].length < piece.length && !/\[\d{1,2}\]/.test(piece.slice(lead[0].length))) piece = `${piece.slice(lead[0].length).trim()} ${lead[1].replace(/[\s,;]+/g, '')}`; // "[1] The ship sank." → "The ship sank. [1]"
    const k = key(piece);
    if (!k && /^\s*(?:\[\d{1,2}\]\s*)+$/.test(piece)) {
      if (kept.length) kept[kept.length - 1] += ` ${piece.trim()}`; // marks that came after the sentence they belong to
      continue;
    }
    if (!k || seen.has(k)) continue;
    seen.add(k);
    const n = wordsOf(piece);
    if (kept.length && count + n > maxWords) break;
    kept.push(piece);
    count += n;
  }
  // "The passages do not say." after sentences that answer is the refusal pasted onto an answer: it says nothing the answer does not
  const answering = kept.filter((p) => !ONLY_ABSENT.test(p));
  const text = (answering.length ? answering : kept).join(' ').replace(/\s+([.,;:!?])/g, '$1');
  return { text, changed: text !== before };
}

const ABSENT = /^\s*(?:\[\d{1,2}\]\s*)*(?:the\s+)?(?:passages?|articles?|sources?)\s+(?:do(?:es)?\s+not|don't|doesn't)\s+(?:say|tell|answer|cover|have|hold|contain)\b/i;
export const absentReply = (text) => ABSENT.test(String(text ?? ''));

// "The articles do not mention X" says what is missing: it is honest and is never judged by its words
const SAYS_ABSENT = /\b(?:do(?:es)?\s+not|don't|doesn't|did\s+not|cannot|can't|nor\s+do|nor\s+does)\s+(?:\w+\s+){0,2}(?:say|says|mention|mentions|state|states|provide|provides|explain|explains|cover|covers|hold|holds|have|contain|contains|give|gives|describe|describes|specify|specifies|tell|answer)\b|\bnot\s+(?:stated|mentioned|given|known|said)\b|\bit\s+is\s+not\s+known\b/i;
const NUM = /\d[\d,]*(?:\.\d+)?/g;
const numbersOfText = (t) => [...String(t).matchAll(NUM)].map((m) => Number(m[0].replace(/,/g, ''))).filter(Number.isFinite);

/**
 * @param {string} reply
 * @param {{ title: string, text: string, full?: string }[]} sources   (`full` when `text` is only the focused part)
 * @returns {{ text: string, removed: { sentence: string, why: 'words' | 'numbers', missing: string[] }[], emptied: boolean }}
 */
export function supportCheck(reply, sources, { minCoverage = 0.6, minTerms = 4 } = {}) {
  const src = String(reply ?? '');
  const have = new Set();
  const nums = [];
  for (const s of sources) {
    const body = `${s.title ?? ''} ${s.full ?? s.text ?? ''}`;
    for (const t of terms(body)) have.add(t);
    nums.push(...numbersOfText(body));
  }
  const heldNumber = (n) => nums.some((x) => x === n || (x > 0 && Math.abs(x - n) <= 0.005 * x));
  const removed = [];
  const keep = [];
  for (const sentence of splitProse(src)) {
    const sp = { text: sentence };
    const plain = sentence.replace(/\[\d{1,2}\]/g, ' ');
    if (SAYS_ABSENT.test(plain)) {
      keep.push(sentence);
      continue;
    }
    const lacking = numbersOfText(plain).filter((n) => (n >= 10 || /[,.]\d/.test(plain)) && !heldNumber(n));
    if (lacking.length) {
      removed.push({ sentence: sp.text, why: 'numbers', missing: lacking.map(String) });
      continue;
    }
    const ts = contentTerms(plain);
    if (ts.length >= minTerms) {
      const missing = ts.filter((t) => !have.has(t));
      if ((ts.length - missing.length) / ts.length < minCoverage) {
        removed.push({ sentence: sp.text, why: 'words', missing });
        continue;
      }
    }
    keep.push(sp.text);
  }
  const text = keep.join(' ').replace(/\s+([.,;:!?])/g, '$1').trim();
  return { text, removed, emptied: !/[\p{L}\p{N}]/u.test(text) };
}
