import { STOPWORDS, WORD_RE, clip, estimateTokens, splitSentences, stem, words } from '../util/text.js';
import { sectionText, splitSections } from './sections.js';

/**
 * Reading a text of any length with a model that holds only a few thousand tokens.
 *
 * The whole text is cut into sections (nothing is dropped or rewritten) and indexed by plain word statistics, which is instant and needs no model.
 * For each question NIE is shown: an outline of the WHOLE text, the opening, the sections that best match the question (by BM25 over the writer's own
 * words, with names weighted up), and the latest part; every excerpt is verbatim, labelled with its section number. `stats` says exactly what was shown, so
 * NIE can tell the writer what it looked at instead of implying it read everything.
 */

const tokenize = (s) => (String(s).toLowerCase().match(WORD_RE) ?? []).filter((w) => w.length > 1 && !STOPWORDS.has(w)).map(stem);

/** Capitalised words that are not at the start of a sentence are probably names: they are the best way to find a passage. */
function names(query) {
  const out = new Set();
  for (const m of String(query).matchAll(/\b[A-Z][\p{L}'’-]{2,}\b/gu)) {
    const before = String(query).slice(0, m.index).trimEnd();
    if (before && !/[.!?:]$/.test(before)) out.add(stem(m[0]));
  }
  return out;
}

export function buildIndex(text, sections = splitSections(text)) {
  const tf = sections.map((s) => {
    const m = new Map();
    for (const t of tokenize(sectionText(text, s))) m.set(t, (m.get(t) ?? 0) + 1);
    return m;
  });
  const len = tf.map((m) => [...m.values()].reduce((a, b) => a + b, 0));
  const df = new Map();
  for (const m of tf) for (const t of m.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  return { text, sections, tf, len, df, avg: len.reduce((a, b) => a + b, 0) / (len.length || 1) };
}

/** BM25 over sections. Returns [{ i, score }] best first; sections with no matching word are not returned. */
export function search(index, query, { limit = 6, minScore = 0.01 } = {}) {
  const N = index.sections.length;
  const terms = [...new Set(tokenize(query))];
  const nm = names(query);
  const k1 = 1.2;
  const b = 0.75;
  const scored = [];
  for (let i = 0; i < N; i++) {
    let score = 0;
    for (const t of terms) {
      const f = index.tf[i].get(t) ?? 0;
      if (!f) continue;
      const df = index.df.get(t) ?? 0;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * index.len[i]) / (index.avg || 1)))) * (nm.has(t) ? 1.6 : 1);
    }
    if (score >= minScore) scored.push({ i, score });
  }
  return scored.sort((x, y) => y.score - x.score || x.i - y.i).slice(0, limit);
}

const HEAD_WORDS = /\b(?:opening|beginning|start|starts|first|introduc\w*|prologue|premise|setup|set-up)\b/i;
const TAIL_WORDS = /\b(?:end|ending|endings|final|finale|last|conclusion|conclude|climax|resolution|epilogue|next|forward|continue|where (?:it|this|the story) goes|what happens|now|latest|so far)\b/i;
const MIDDLE_WORDS = /\b(?:middle|midpoint|mid-point|second act|act two|act 2|sagging|saggy|slow)\b/i;

/** Where in the text does the question point? ("is my ending too predictable?" -> the last part.) */
export function positionHints(query) {
  const q = String(query);
  return { head: HEAD_WORDS.test(q), tail: TAIL_WORDS.test(q), middle: MIDDLE_WORDS.test(q) };
}

const firstWords = (text, n) => words(text).slice(0, n).join(' ');
const firstSentence = (text, n = 14) => {
  const s = splitSentences(text.trim().slice(0, 600))[0]?.text ?? text.trim();
  return clip(firstWords(s, n), 120);
};

/** One line per section (or an even sample of them for a very long text); always includes the first and the last. */
export function outline(index, { maxLines = 40, skip = new Set() } = {}) {
  const N = index.sections.length;
  const pick = new Set([0, N - 1]);
  if (N > maxLines) for (let k = 0; k < maxLines; k++) pick.add(Math.round((k * (N - 1)) / (maxLines - 1)));
  else for (let i = 0; i < N; i++) pick.add(i);
  const lines = [];
  for (const i of [...pick].sort((a, b) => a - b)) {
    if (i < 0 || i >= N || skip.has(i)) continue;
    const s = index.sections[i];
    const own = s.title ? `${clip(s.title, 40)}: ` : s.under ? `(${clip(s.under, 30)}) ` : '';
    lines.push(`${i + 1}. ${own}${firstSentence(sectionText(index.text, s).replace(/^\s*(?:#+\s*)?[^\n]*\n+(?=\S)/, (h) => (h.length < 90 && s.title ? '' : h)))}`);
  }
  return { lines, sampled: N > maxLines };
}

/**
 * Cut a section down to `cap` characters around the sentence that best matches the question (not blindly from its start, which could throw away the
 * very sentence that matched). With no match, cut from the start, or from the END for the latest part, whose most recent words matter most.
 */
function focusExcerpt(raw, terms, nameTerms, cap, fromEnd = false) {
  if (raw.length <= cap) return { text: raw, whole: true };
  const sents = splitSentences(raw);
  let best = -1;
  let bestScore = 0;
  sents.forEach((sn, k) => {
    let sc = 0;
    for (const t of tokenize(sn.text)) if (terms.has(t)) sc += nameTerms.has(t) ? 1.6 : 1;
    if (sc > bestScore) [best, bestScore] = [k, sc];
  });
  if (best < 0 || fromEnd) {
    const text = fromEnd ? `…${raw.slice(-cap + 1).trimStart()}` : `${raw.slice(0, cap - 1).trimEnd()}…`;
    return { text, whole: false };
  }
  let lo = best;
  let hi = best;
  let start = sents[best].start;
  let end = sents[best].end;
  while (end - start < cap) {
    const wantBefore = lo > 0 && (hi >= sents.length - 1 || best - lo <= hi - best);
    if (wantBefore && end - sents[lo - 1].start <= cap) { lo--; start = sents[lo].start; }
    else if (hi < sents.length - 1 && sents[hi + 1].end - start <= cap) { hi++; end = sents[hi].end; }
    else if (lo > 0 && end - sents[lo - 1].start <= cap) { lo--; start = sents[lo].start; }
    else break;
  }
  if (end - start > cap) end = start + cap; // one sentence longer than the room: keep its start
  return { text: `${start > 0 ? '…' : ''}${raw.slice(start, end).trim()}${end < raw.length ? '…' : ''}`, whole: false };
}

/**
 * Everything NIE is shown of a long text for one message, within `budgetTokens`.
 * @param {{ index: object, query: string, topic?: string, budgetTokens?: number, subject?: 'text'|'passage' }} o  `subject`: whose text it is called in the prompt
 *   (the project's Story Text, or the passage the writer just pasted)
 * @returns {{ block: string, stats: { complete: boolean, sections: number, words: number, shown: {i:number, role:string}[], outlined: number, tokens: number } }}
 */
export function readingContext({ index, query, topic = '', budgetTokens = 1400, subject = 'text' }) {
  const N = index.sections.length;
  const totalWords = index.sections.reduce((a, s) => a + s.words, 0);
  const stats = { complete: false, sections: N, words: totalWords, shown: [], outlined: 0, tokens: 0, subject };
  const what = subject === 'passage' ? 'The passage the writer just pasted' : "The writer's text";
  if (!N) return { block: '', stats: { ...stats, complete: true } };

  // short enough to show whole: nothing is left out
  if (estimateTokens(index.text) <= budgetTokens) {
    stats.complete = true;
    stats.shown = index.sections.map((s) => ({ i: s.i, role: 'all' }));
    const block = `${what} (all of it, about ${totalWords.toLocaleString('en-US')} words):\n"""\n${index.text.trim()}\n"""`;
    return { block, stats: { ...stats, tokens: estimateTokens(block) } };
  }

  const q = `${query} ${topic}`;
  const hints = positionHints(q);
  const terms = new Set(tokenize(q));
  const nameTerms = names(q);
  const ranked = search(index, q, { limit: 5 });
  // How strongly does the question point at particular passages? (a name or a rare word that appears in few sections)
  const lookup = ranked.length > 0 && ranked[0].score >= 4 && !hints.tail && !hints.middle && !hints.head;

  const chosen = new Map(); // i -> role
  chosen.set(N - 1, 'latest');
  if (N > 1 && !lookup) chosen.set(0, 'opening');
  if (hints.middle) chosen.set(Math.floor(N / 2), 'middle');
  for (const r of ranked) if (!chosen.has(r.i) && (!lookup || r.score >= ranked[0].score * 0.45)) chosen.set(r.i, 'match');
  if (hints.head && N > 2 && !chosen.has(1)) chosen.set(1, 'match');
  if (hints.tail && N > 2 && !chosen.has(N - 2)) chosen.set(N - 2, 'match');

  // The budget, by what was asked. The most recent part always gets at least a paragraph or two (it says where the text is now); the opening and the
  // middle get a fixed share; the matching passages share what is left, the best match getting the most. A lookup spends nearly all of it on the matches.
  const totalChars = Math.floor(budgetTokens * 0.72 * 3.6);
  const order = [...chosen.entries()].sort((a, b) => rank(a, ranked, N) - rank(b, ranked, N));
  const fixedShare = { latest: hints.tail ? 0.42 : lookup ? 0.13 : 0.26, opening: 0.12, middle: 0.16 };
  const caps = new Map();
  let fixed = 0;
  for (const [i, role] of order) {
    if (role === 'match') continue;
    const cap = Math.max(role === 'latest' ? 450 : 350, Math.floor(totalChars * fixedShare[role]));
    caps.set(i, cap);
    fixed += cap;
  }
  const matches = order.filter(([, role]) => role === 'match');
  const weights = matches.map((_, k) => 1 / (1 + k * 0.45));
  const wsum = weights.reduce((a, b) => a + b, 0) || 1;
  matches.forEach(([i], k) => caps.set(i, Math.floor((Math.max(0, totalChars - fixed) * weights[k]) / wsum)));
  const parts = [];
  for (const [i, role] of order) {
    const cap = caps.get(i);
    if (cap < 350) continue; // too little room to be worth showing; the outline still lists it
    const raw = sectionText(index.text, index.sections[i]).trim();
    const f = focusExcerpt(raw, terms, nameTerms, cap, role === 'latest');
    parts.push({ i, role, excerpt: f.text, whole: f.whole });
  }
  parts.sort((a, b) => a.i - b.i);
  stats.shown = parts.map((p) => ({ i: p.i, role: p.role, whole: p.whole }));

  const shownSet = new Set(parts.map((p) => p.i));
  const label = (p) => `Section ${p.i + 1}${index.sections[p.i].under ? ` (${clip(index.sections[p.i].under, 40)})` : ''}${p.role === 'opening' ? ', the opening' : p.role === 'latest' ? ', the most recent part' : p.role === 'middle' ? ', from the middle' : ''}`;
  const intro = `${what} is long: about ${totalWords.toLocaleString('en-US')} words in ${N} sections. You cannot see all of it at once, so you are shown an outline of the rest and the parts that matter for this message.`;
  const excerpts = parts.map((p) => `${label(p)}${p.whole ? '' : ' (cut to fit)'}:\n"""\n${p.excerpt}\n"""`);
  // the outline gets what the budget has left, sampled evenly (first and last always kept) rather than cut off at the end
  const left = Math.floor(budgetTokens * 3.6) - [intro, ...excerpts].join('\n\n').length - 70;
  let lines = outline(index, { maxLines: 36, skip: shownSet }).lines;
  while (lines.length > 2 && lines.join('\n').length > left) lines = lines.filter((_, k) => k % 2 === 0 || k === lines.length - 1);
  if (lines.join('\n').length > left) lines = [];
  stats.outlined = lines.length;
  const block = [intro, lines.length ? `Outline of the other sections (number: how each begins):\n${lines.join('\n')}` : '', ...excerpts].filter(Boolean).join('\n\n');
  stats.tokens = estimateTokens(block);
  return { block, stats };
}

/** The most recent part first, then the best matches, then the opening, so the budget is spent where it helps most. */
function rank([i, role], ranked, N) {
  if (role === 'latest') return 0;
  if (role === 'match') return 1 + ranked.findIndex((r) => r.i === i) / 10;
  if (role === 'middle') return 3;
  return 4; // opening
}

/**
 * What NIE tells the writer it looked at, in plain words. Never says "read" about parts it only saw in an outline.
 */
export function describeReading(stats) {
  const w = stats.words.toLocaleString('en-US');
  if (stats.complete) return `I read all of it (about ${w} words).`;
  const closely = stats.shown.map((x) => x.i + 1).sort((a, b) => a - b);
  const list = closely.length <= 1 ? String(closely[0]) : `${closely.slice(0, -1).join(', ')} and ${closely.at(-1)}`;
  const roles = new Set(stats.shown.map((x) => x.role));
  const why = [roles.has('opening') && 'the opening', roles.has('middle') && 'the middle', roles.has('latest') && 'the most recent part', roles.has('match') && 'what matched what you asked'].filter(Boolean);
  const whyText = why.length <= 1 ? why[0] : `${why.slice(0, -1).join(', ')} and ${why.at(-1)}`;
  return `${stats.subject === 'passage' ? 'The passage you pasted' : 'Your text'} is about ${w} words in ${stats.sections} sections. I can't hold all of that in mind at once, so for this I looked closely at section${closely.length === 1 ? '' : 's'} ${list} (${whyText}) and skimmed an outline of the rest. Ask about any part and I'll look at it.`;
}

/**
 * Is the writer asking what their text SAYS ("who owed the money?", "where did she hide the key?", "how many steps led down?")? Then the answer is in the
 * text, not in a brainstorm; the model is told so (a 3B model asked a factual question about a text it is shown still answered in brainstorming style
 * and speculated about what "might" be there, measured on the real model).
 */
const OPINION = /\b(?:you think|should|could|might|would|can i|may|work|works|working|better|improve|predictable|too (?:slow|fast|long|short|much)|feel|feels|land|lands|ideas?|twist|happen next|next|possible|possibly|maybe|imagine|suppose)\b/i;
export function isLookupQuestion(q) {
  const t = String(q ?? '').trim();
  if (!t || t.length > 400) return false;
  return /^(?:in\s+(?:my|the)\s+(?:story|text|draft|novel|book|chapter\s*\d*|passage|piece|script|essay|poem|scene)\b[^,?:]*[,:]?\s*)?(?:who|whom|whose|what|where|when|which|how\s+(?:many|much|long|old|far)|did|does|do|was|were|is|are)\b/i.test(t) && !OPINION.test(t);
}

/** What the model is told about the text it was shown. */
export function documentNote(query, stats) {
  const partial = stats && !stats.complete;
  if (isLookupQuestion(query)) {
    return `The writer is asking what their text says. Answer from the text shown above in one or two plain sentences, and name the section it is in. If the parts shown do not say, tell them you cannot see it in the parts you were shown${partial ? ' (you were not shown all of it)' : ''}. Do not guess, do not list possibilities, and do not turn the question into brainstorming.`;
  }
  return `(Reference only: this is the writer's own text. Do not rewrite, continue or quote it back at length. Say only what the text shown actually contains${partial ? '; you were not shown all of it, so say so if you are unsure whether something is in the parts you did not see' : ''}.)`;
}
