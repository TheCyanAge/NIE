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
 *   answerSentence a sentence of the articles that holds every word the question asks about (quoted when the model said the articles do not answer and one plainly does)
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
const INITIAL = /(?:^|[\s(])[A-Z]\.$/; // "Joseph L. Mankiewicz", "J. Miles Dale": a single capital before a full stop is a name's initial
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
    const bare = piece.replace(/["'”’)\]]+$/, '');
    if (end < t.length && (ABBREV.test(bare) || INITIAL.test(bare))) continue;
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
// a reply that says why ("because", "due to") says something the articles must say too: measured on the real model, "The sky appears blue because it is the colour of the sky and sea" was made of words that were all in the articles
const SAYS_WHY = /\b(?:because|since|due to|owing to|thanks to|as a result|therefore|so that|that is why|this is why|which is why|caused by|results? from|is the reason)\b/i;
const GIVES_WHY = /\b(?:because|caus(?:e|es|ed|ing)|due to|owing to|thanks to|result(?:s|ed|ing)?|reasons?|why|therefore|so that|led to|leads? to|leading to|in order to|since)\b/i;
const NUM = /\d[\d,]*(?:\.\d+)?/g;
const numbersOfText = (t) => [...String(t).matchAll(NUM)].map((m) => Number(m[0].replace(/,/g, ''))).filter(Number.isFinite);

/**
 * @param {string} reply
 * @param {{ title: string, text: string, full?: string }[]} sources   (`full` when `text` is only the focused part)
 * @returns {{ text: string, removed: { sentence: string, why: 'words' | 'numbers' | 'reason', missing: string[] }[], emptied: boolean }}
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
  const whyHeld = sources.some((s) => GIVES_WHY.test(String(s.full ?? s.text ?? '')));
  const removed = [];
  const keep = [];
  for (const sentence of splitProse(src)) {
    const sp = { text: sentence };
    const plain = sentence.replace(/\[\d{1,2}\]/g, ' ');
    if (SAYS_ABSENT.test(plain)) {
      keep.push(sentence);
      continue;
    }
    if (!whyHeld && SAYS_WHY.test(plain)) {
      removed.push({ sentence: sp.text, why: 'reason', missing: [] });
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

// ── a sentence that answers ──────────────────────────────────────────────────

// (verbs that change their stem: "Who wrote Frankenstein?" meets "best known for writing the novel")
const IRREGULAR = Object.fromEntries(
  Object.entries({ wrote: 'write', written: 'write', built: 'build', flew: 'fly', flown: 'fly', won: 'win', began: 'begin', begun: 'begin', led: 'lead', took: 'take', taken: 'take', gave: 'give', given: 'give', sold: 'sell', spoke: 'speak', spoken: 'speak', ran: 'run', fought: 'fight', sank: 'sink', sunk: 'sink', drew: 'draw', drawn: 'draw', found: 'find', made: 'make', came: 'come', saw: 'see', seen: 'see', died: 'die' }).map(([a, b]) => [terms(a)[0], terms(b)[0]]),
);
const lemma = (t) => IRREGULAR[t] ?? t;
const FILLER = new Set(['known', 'used', 'called', 'named', 'many', 'much']); // asking words that no sentence needs to repeat
const lemmas = (s) => [...new Set(contentTerms(s).map(lemma))];
const WITHOUT_BRACKET = (title) => String(title ?? '').replace(/\s*\([^)]*\)\s*$/, '');

/**
 * The one sentence of the articles that holds every word the question asks about, for when a small model said the articles do not answer it and one plainly does ("What is the capital of
 * Italy?" next to "The country's capital, Rome, is one of the most famous cities in the world."). A word of the question can be met by the article's own title (every sentence of "Italy"
 * is about Italy) only when the question names that article; at least one word must be in the sentence itself; "how many / when" needs a figure. Quoted whole, never reworded. Null when
 * no sentence does, so a real "the articles don't say" stays one.
 * @param {string} question
 * @param {{ n: number, title: string, text: string, full?: string }[]} sources
 * @returns {{ n: number, title: string, sentence: string } | null}
 */
export function answerSentence(question, sources) {
  const asked = lemmas(question).filter((t) => !FILLER.has(t));
  if (asked.length < 2) return null;
  const numeric = WANTS_A_NUMBER.test(String(question));
  let best = null;
  sources.forEach((s, rank) => {
    const own = new Set(lemmas(WITHOUT_BRACKET(s.title)));
    const named = own.size > 0 && [...own].every((t) => asked.includes(t)); // the question names this article
    splitProse(s.full ?? s.text).forEach((sentence, i) => {
      const words = wordsOf(sentence);
      if (words < 4 || words > 60 || (numeric && !/\d/.test(sentence))) return;
      const have = new Set(lemmas(sentence));
      const lit = asked.filter((t) => have.has(t));
      if (!lit.some((t) => !own.has(t))) return;
      if (asked.some((t) => !have.has(t) && !(named && own.has(t)))) return;
      const score = lit.length * 10 - rank - i / 100;
      if (!best || score > best.score) best = { score, n: s.n, title: s.title, sentence };
    });
  });
  return best ? { n: best.n, title: best.title, sentence: best.sentence } : null;
}
