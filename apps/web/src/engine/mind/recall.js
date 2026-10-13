import { clip, estimateTokens } from '../util/text.js';
import { passagesOf } from './sources.js';
import { nameStems, normText, tokenize, tokensOf } from './tokens.js';

/**
 * Recall: given what the writer just said, find the earlier things in THIS project that bear on it (what they said before, the idea sheet, ideas kept,
 * the Idea Board, characters, rules, ...), with where each came from, ready to put in front of the model.
 *
 * Plain word statistics, no model: BM25 over the project's passages (`sources.js`), with
 *   - names (capitalised words, and the names of the characters the writer recorded) weighted up, because a name is the best way to find a passage;
 *   - a small, fixed set of word families ("want / goal / aim", "set / town / village") and the question word ("where", "who", "when") so a question put in
 *     other words still finds the statement, at a lower weight than the writer's own words;
 *   - the source's weight (rules and kept ideas over recorded parts over things said over NIE's board ideas) and a mild bonus for what was said lately;
 *   - a floor (`minScore`), so small talk and words that are everywhere in the project find nothing.
 * Every call reads only the project it is given and keeps nothing; `tokens.js` has the one memo, keyed by exact text.
 */

// ── word families ────────────────────────────────────────────────────────────

const FAMILIES = {
  goal: 'want wants wanted goal aim desire need seek hope wish quest ambition trying objective motivation chase',
  place: 'set setting place location located town village city country island world kingdom planet region land coast',
  time: 'time year season era century period decade date morning night winter summer spring autumn timeline',
  person: 'character person protagonist hero heroine lead main narrator named called name',
  opposition: 'villain antagonist enemy opponent rival nemesis against opposes opposition obstacle threat',
  stakes: 'stakes lose loses lost risk risks consequence fail fails failure price cost',
  theme: 'theme themes message meaning point explore explores',
  tone: 'tone feel mood atmosphere vibe voice style register',
  ending: 'end ending finale conclusion resolution climax twist reveal solved solution',
  start: 'begin begins beginning start opens opening inciting hook',
  rule: 'rule rules never must always forbid forbidden restriction constraint limit',
  secret: 'secret hidden hiding hide conceal lie lies truth',
  family: 'sister brother mother father friend family wife husband daughter son parent child',
};
const NOISE_WORDS =
  'please pls thanks thank thx hello hi hey bye goodbye cheers welcome sorry ok okay yes yeah yep nope lol haha hmm give tell show help let know think thing things something anything really maybe get got going make just also actually again today tomorrow tonight ' +
  'great good nice awesome perfect amazing cool wonderful lovely brilliant fantastic excellent helpful helps appreciate sounds works fine much very';

const families = Object.entries(FAMILIES).map(([name, words]) => [name, [...new Set(tokenize(words))]]);
/** stem -> the other stems of its families */
const EXPAND = new Map();
for (const [, stems] of families) for (const a of stems) for (const b of stems) if (a !== b) (EXPAND.get(a) ?? EXPAND.set(a, new Set()).get(a)).add(b);
const FAMILY = Object.fromEntries(families);
/** A question word names the kind of thing asked for. (These words are stopwords, so they never count as search words themselves.) */
const CUES = [
  [/\bwhere\b/i, FAMILY.place],
  [/\bwho(?:m|se)?\b/i, FAMILY.person],
  [/\bwhen\b/i, FAMILY.time],
  [/\bwhy\b/i, [...FAMILY.goal.slice(0, 4), ...FAMILY.secret.slice(0, 3)]],
];
const NOISE = new Set(tokenize(NOISE_WORDS));
/** Greetings that contain content words ("good MORNING"): taken out before the message is read for search words. */
const SMALL_TALK = /\b(?:good\s+(?:morning|afternoon|evening|night)|how\s+are\s+you(?:\s+doing)?|how'?s\s+it\s+going|see\s+you(?:\s+(?:later|tomorrow|soon))?|talk\s+(?:later|soon))\b/gi;

const K1 = 1.2;
const B = 0.75;
const MAX_TERMS = 60;
const PER_SOURCE = 3;
const IDF_FLOOR = 0.3;

/** The names the writer recorded in this project (characters and their other names, the premise's figures): their stems. */
function knownNames(project) {
  const out = new Set();
  const add = (v) => {
    if (typeof v === 'string') for (const t of tokenize(v)) out.add(t);
  };
  for (const c of Array.isArray(project?.memory?.characters) ? project.memory.characters.slice(-200) : []) {
    add(c?.name);
    if (Array.isArray(c?.aliases)) c.aliases.slice(0, 10).forEach(add);
  }
  if (Array.isArray(project?.conversation?.workingPremise?.characters)) project.conversation.workingPremise.characters.slice(0, 12).forEach(add);
  return out;
}

/** term -> weight: the writer's own words 1 (names 1.6), a word family 0.6, a question word's family 0.25. Empty when the message has no usable word. */
export function queryTerms(project, query, topic = '') {
  const q = `${typeof query === 'string' ? query : ''} ${typeof topic === 'string' ? topic : ''}`.slice(0, 2000).replace(SMALL_TALK, ' ');
  const terms = new Map();
  const names = nameStems(q);
  const known = knownNames(project);
  for (const t of tokenize(q)) {
    if (NOISE.has(t)) continue;
    terms.set(t, Math.max(terms.get(t) ?? 0, names.has(t) || known.has(t) ? 1.6 : 1));
  }
  if (!terms.size) return terms;
  for (const t of [...terms.keys()]) for (const e of EXPAND.get(t) ?? []) if (!terms.has(e)) terms.set(e, 0.6);
  for (const [re, family] of CUES) if (re.test(q)) for (const e of family) if (!terms.has(e)) terms.set(e, 0.25);
  return terms.size > MAX_TERMS ? new Map([...terms].slice(0, MAX_TERMS)) : terms;
}

// ── scoring ──────────────────────────────────────────────────────────────────

/**
 * BM25 with the idf scaled to 0..1 (a word in one passage of many is about 0.9, a word in a tenth of them about 0.35), so `minScore` means the same for any project size.
 * The scaled idf never falls below IDF_FLOOR: in a project with three passages every word is "common", but two words in common are still a match.
 */
function score(passages, terms, recency) {
  const N = passages.length;
  const df = new Map();
  const hits = new Array(N);
  let totalLen = 0;
  for (let i = 0; i < N; i++) {
    const toks = tokensOf(passages[i].text).list;
    totalLen += toks.length;
    let counts = null;
    for (const t of toks) {
      if (!terms.has(t)) continue;
      counts ??= new Map();
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    hits[i] = counts ? { counts, len: toks.length } : null;
    if (counts) for (const t of counts.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const avg = totalLen / (N || 1) || 1;
  const norm = Math.log(N + 2);
  const out = [];
  for (let i = 0; i < N; i++) {
    const h = hits[i];
    if (!h) continue;
    let s = 0;
    for (const [t, f] of h.counts) {
      const d = df.get(t);
      const idf = Math.max(IDF_FLOOR, Math.log(1 + (N - d + 0.5) / (d + 0.5)) / norm);
      s += terms.get(t) * idf * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * h.len) / avg)));
    }
    const p = passages[i];
    s *= 0.75 + 0.5 * p.weight; // the writer's deliberate acts count for more than a casual remark
    s *= 1 + 0.12 * (recency.get(p.id) ?? 0);
    out.push({ p, score: s });
  }
  return out;
}

/** 0..1 for each statement the writer said: the newest is 1. By order, not by clock, so the same project always ranks the same way. */
function recencyOf(passages) {
  const m = new Map();
  const said = passages.filter((p) => p.source === 'said');
  said.forEach((p, i) => m.set(p.id, said.length > 1 ? i / (said.length - 1) : 1));
  return m;
}

// ── choosing what to show ────────────────────────────────────────────────────

const HEADER = "What you already know about this project, in the writer's own words (most relevant first):";
const NIE_HEADER = "Ideas NIE gave the writer earlier that they kept on the Idea Board (NIE's ideas, not the writer's words):";
const SHOW_CHARS = 300;

const asSet = (v) => (v instanceof Set ? v : new Set(Array.isArray(v) ? v : []));

/** Near duplicates: one is (almost) inside the other, or they share nearly all words. */
function nearDuplicate(a, b) {
  if (!a.size || !b.size) return false;
  let n = 0;
  for (const t of a) if (b.has(t)) n++;
  const small = Math.min(a.size, b.size);
  return (small >= 3 && n / small >= 0.85) || n / (a.size + b.size - n) >= 0.8;
}

/** A test for "already shown elsewhere": by id, by text (without regard to case or punctuation), or as a line of text the caller says is already in the prompt. */
function alreadyShown(exclude, excludeText) {
  const ids = new Set();
  const texts = new Set();
  for (const e of exclude) {
    if (typeof e !== 'string') continue;
    ids.add(e);
    texts.add(normText(e));
  }
  const shown = normText(typeof excludeText === 'string' ? excludeText.slice(0, 40000) : '');
  return (p) => {
    if (ids.has(p.id)) return true;
    const norm = normText(p.text);
    return texts.has(norm) || (shown !== '' && norm.length >= 12 && shown.includes(norm));
  };
}

/**
 * From passages in order of relevance, pick what is shown: no near duplicates, at most `perSource` (3) per source, within `limit` and the token budget.
 * NIE's own board ideas go in a section of their own, so they are never taken for something the writer said.
 */
function choose(ranked, { limit, budgetTokens, perSource: maxPerSource = PER_SOURCE }) {
  const items = [];
  const kept = [];
  const perSource = new Map();
  let used = estimateTokens(HEADER);
  for (const { p, score: s } of ranked) {
    if (items.length >= limit) break;
    if ((perSource.get(p.source) ?? 0) >= maxPerSource) continue;
    const toks = tokensOf(p.text).set;
    if (kept.some((k) => nearDuplicate(k, toks))) continue;
    const line = `- ${clip(p.text, SHOW_CHARS)} (${p.where})`;
    const cost = estimateTokens(line) + (p.by === 'nie' && !items.some((x) => x.by === 'nie') ? estimateTokens(NIE_HEADER) : 0);
    if (used + cost > budgetTokens) continue; // a shorter passage further down may still fit
    used += cost;
    perSource.set(p.source, (perSource.get(p.source) ?? 0) + 1);
    kept.push(toks);
    items.push({ id: p.id, source: p.source, where: p.where, text: p.text, score: Math.round(s * 1000) / 1000, ...(p.by ? { by: p.by } : {}) });
  }
  return items;
}

function blockOf(items) {
  const line = (x) => `- ${clip(x.text, SHOW_CHARS)} (${x.where})`;
  const mine = items.filter((x) => x.by !== 'nie');
  const nies = items.filter((x) => x.by === 'nie');
  return [mine.length ? `${HEADER}\n${mine.map(line).join('\n')}` : '', nies.length ? `${NIE_HEADER}\n${nies.map(line).join('\n')}` : ''].filter(Boolean).join('\n\n');
}

function result(items, considered) {
  const sources = {};
  for (const x of items) sources[x.source] = (sources[x.source] ?? 0) + 1;
  return { items, block: blockOf(items), stats: { considered, shown: items.length, sources } };
}

/**
 * The earlier things in this project that bear on `query` (the writer's message; `topic` adds words from NIE's reading of it).
 * @param {object} project
 * @param {string} query
 * @param {{ limit?: number, budgetTokens?: number, exclude?: Set<string>|string[], excludeText?: string, minScore?: number, topic?: string, includeSheet?: boolean, turn?: number, now?: number }} [opts]
 *   `exclude`: passage ids or texts already shown elsewhere; `excludeText`: text already in the prompt (a passage that is a line of it is dropped);
 *   `turn`: the newest message number (for "N messages ago"); `now` is accepted for callers that pass a clock, and unused: recency here is by order.
 * @returns {{ items: { id, source, where, text, score, by? }[], block: string, stats: { considered: number, shown: number, sources: object } }}
 */
export function recall(project, query, { limit = 6, budgetTokens = 420, exclude = new Set(), excludeText = '', minScore = 0.4, topic = '', includeSheet = true, turn = null } = {}) {
  const passages = passagesOf(project, { includeSheet, turn });
  const terms = queryTerms(project, query, topic);
  if (!terms.size || !passages.length) return result([], passages.length);
  const shown = alreadyShown(asSet(exclude), excludeText);
  const scored = score(passages, terms, recencyOf(passages))
    .filter((x) => !shown(x.p))
    .sort((a, b) => b.score - a.score || b.p.weight - a.p.weight);
  // (a passage far behind the best one is a stray word in common, not an answer: it must reach `minScore` and a third of the best one still on offer)
  const floor = Math.max(minScore, (scored[0]?.score ?? 0) * 0.35);
  return result(choose(scored.filter((x) => x.score >= floor), { limit, budgetTokens }), passages.length);
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Everything in this project that mentions any of `names` (for "who is Corin?"): a character's recorded name and other names count as the same person.
 * Strongest sources first, the writer's newest statements first among equals.
 * @returns the same shape as `recall`
 */
export function recallNames(project, names, { limit = 8, budgetTokens = 420, exclude = new Set(), excludeText = '', includeSheet = true, turn = null, perSource = 5 } = {}) {
  const passages = passagesOf(project, { includeSheet, turn });
  const wanted = new Set();
  for (const n of (Array.isArray(names) ? names : [names]).slice(0, 8)) {
    const v = typeof n === 'string' ? n.replace(/\s+/g, ' ').trim().slice(0, 60) : '';
    if (v.length >= 2) wanted.add(v.toLowerCase());
  }
  // one person, several names: a recorded character's name and aliases stand for each other
  for (const c of Array.isArray(project?.memory?.characters) ? project.memory.characters.slice(-200) : []) {
    const all = [c?.name, ...(Array.isArray(c?.aliases) ? c.aliases.slice(0, 10) : [])].filter((x) => typeof x === 'string' && x.trim().length >= 2).map((x) => x.trim().slice(0, 60).toLowerCase());
    if (all.some((x) => wanted.has(x))) all.forEach((x) => wanted.add(x));
  }
  if (!wanted.size) return result([], passages.length);
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${[...wanted].map(escapeRe).join('|')})(?![\\p{L}\\p{N}])`, 'iu');
  const total = passages.length;
  const shown = alreadyShown(asSet(exclude), excludeText);
  const ranked = passages
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => re.test(p.text) && !shown(p))
    .sort((a, b) => b.p.weight - a.p.weight || b.i - a.i)
    .map(({ p }) => ({ p, score: p.weight }));
  return result(choose(ranked, { limit, budgetTokens, perSource }), total);
}
