import { WORD_RE, splitSentences } from '../util/text.js';
import { removeFromBoard } from '../project/board.js';
import { MIND_LIMITS, SAID_KINDS, ensureMind, statementText } from './state.js';
import { tokensOf } from './tokens.js';

/**
 * Recording what the writer says. Only the writer's own statements about their project go in, in their own words, one statement per entry
 * (clipped, never reworded). Everything here works on the project it is given and keeps nothing between calls.
 */

// ── what is not a statement ──────────────────────────────────────────────────

const FILLER = new Set(
  ('yes yeah yep yup no nope nah ok okay k sure fine cool great nice good right thanks thank you thx please hmm hm um uh oh ah well so maybe perhaps alright all got it i see ' +
    'go on ahead continue next skip pass nothing none idk dunno lol haha mhm sorry whatever anyway').split(' ')
);
const SHRUG = /^(?:(?:well|um|uh|hmm|honestly|really|oh|so|yeah|no|sorry)\s+)*(?:(?:i|i'm|im|i am)\s+)?(?:(?:really|just|honestly|still|truly|actually)\s+)*(?:don'?t know|do not know|dunno|idk|not sure|have no idea|no idea|no clue|have no clue|can'?t say|cant say|can'?t think|haven'?t decided|havent decided|haven'?t thought|haven'?t figured|don'?t care|do not care|couldn'?t say|can'?t decide|can'?t tell)\b/;
const SHRUG_TAIL = new Set(
  ('yet really sorry honestly about that it this exactly right now at the moment anything either much myself to be honest sure all just but maybe i guess whatever you choose decide up tbh thing so far').split(' ')
);

const plain = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}'\s]+/gu, ' ').replace(/\s+/g, ' ').trim();

/** "yes", "ok thanks", "I don't know", "no idea yet": answers that tell NIE nothing about the project. */
export function isFiller(text) {
  const t = plain(String(text ?? ''));
  if (!t) return true;
  const toks = t.split(' ');
  if (toks.length <= 8 && toks.every((w) => FILLER.has(w))) return true;
  const m = SHRUG.exec(t);
  if (!m) return false;
  const rest = t.slice(m[0].length).split(' ').filter(Boolean);
  return rest.length <= 5 && rest.every((w) => SHRUG_TAIL.has(w));
}

/**
 * The statement as it would be stored, or null when it is not one: not text, no letters, a paste of 400+ words, filler, or nothing a search could find
 * (every word a stopword: "She did it").
 */
export function cleanStatement(text) {
  if (typeof text !== 'string') return null;
  if (text.length > 6000) return null; // far longer than 400 words of anything: a pasted text
  const head = text.slice(0, 6000);
  if ((head.match(WORD_RE) ?? []).length >= MIND_LIMITS.pasted) return null;
  const s = statementText(head);
  if (!s || !/[\p{L}\p{N}]/u.test(s) || isFiller(s) || !tokensOf(s).list.length) return null;
  return s;
}

// ── the sentences of a message ───────────────────────────────────────────────

const QUESTION_START = /^(?:(?:who|what|which|how|why|where|when)\s+(?:is|are|was|were|do|does|did|can|could|would|should|will|has|have|many|much|about)\b|(?:is|are|was|were|do|does|did|can|could|would|should|will|has|have)\s+(?:it|this|that|there|she|he|they|we|you|i|the|my|your)\b)/i;
const REQUEST_START = new RegExp(
  '^(?:please\\b|pls\\b|can you\\b|could you\\b|would you\\b|will you\\b|can we\\b|could we\\b|let\'?s\\b|lets\\b|help me\\b|give me\\b|tell me\\b|show me\\b|' +
    '(?:write|rewrite|draft|compose|make|create|generate|suggest|brainstorm|list|check|scan|find|remember|forget|add|remove|delete|fix|edit|continue|summari[sz]e|explain|describe|compare|read|look|ask|save|stop|start|use)\\b|' +
    'i (?:want|need|would like|\'?d like|\'?d love|wish) (?:you|nie) to\\b|i (?:want|need|would like|\'?d like) (?:some )?(?:help|ideas|suggestions|feedback|advice|a hand)\\b|' +
    'thanks\\b|thank you\\b|thx\\b|sorry\\b)',
  'i'
);
// (a filler word is only dropped when punctuation follows it: "Well, she left" loses "Well,", "Well water is cold" keeps its first word)
const LEAD = /^(?:(?:yes|yeah|yep|ok|okay|well|so|oh|hmm|um|uh)\b[,.!:;-]+\s*)+|^(?:remember(?:\s+that)?|note(?:\s+that)?|keep in mind(?:\s+that)?|bear in mind(?:\s+that)?|for the record|fyi)\b[,:]?\s*/i;

/** One long sentence cut at clause breaks into pieces that each fit a statement (nothing is dropped). */
function clauses(sentence) {
  if (sentence.length <= MIND_LIMITS.text) return [sentence];
  const parts = sentence.split(/(?<=[;:—–])\s+|\s+[—–]\s+|(?<=,)\s+(?=(?:but|and|so|because|while|which|though|until|before|after)\b)/i);
  const out = [];
  let cur = '';
  for (const p of parts) {
    if (cur && cur.length + 1 + p.length > MIND_LIMITS.text) {
      out.push(cur);
      cur = p;
    } else cur = cur ? `${cur} ${p}` : p;
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * The statements about the project in a message: its sentences of four or more words that are not questions and not requests to NIE ("write...",
 * "can you...", "give me..."), at most 8, so one long message becomes several facts that can be found and cited separately. A pasted text (400+ words) gives none.
 * Returns the writer's own sentences, only trimmed (a leading "yes," or bullet mark is dropped).
 */
export function statementsIn(message) {
  if (typeof message !== 'string' || !message.trim() || message.length > 6000) return [];
  const body = message.trim();
  if ((body.match(WORD_RE) ?? []).length >= MIND_LIMITS.pasted) return [];
  const out = [];
  for (const piece of splitSentences(body)) {
    let s = piece.text.replace(/^(?:[-*•>]+\s*|\d{1,2}[.)]\s+)/u, '').replace(LEAD, '').trim();
    if (!s || /^https?:\/\//i.test(s)) continue;
    if (/\?["'”’)\]*_]*\s*$/.test(s) || QUESTION_START.test(s) || REQUEST_START.test(s)) continue;
    for (const c of clauses(s)) {
      if ((c.match(WORD_RE) ?? []).length < 4) continue;
      out.push(c.trim());
      if (out.length >= MIND_LIMITS.perMessage) return out;
    }
  }
  return out;
}

// ── the record ───────────────────────────────────────────────────────────────

const containment = (a, b) => {
  let n = 0;
  for (const t of a) if (b.has(t)) n++;
  return n / (a.size || 1);
};

/**
 * How many content words two statements share, or -1 when they plainly do not overlap by 90% of the shorter one (so that neither contains the other):
 * it counts over the shorter and stops at the first miss too many, which is what makes comparing a new statement with 600 old ones cheap.
 */
function sharedWords(a, b) {
  const [small, big] = a.size <= b.size ? [a, b] : [b, a];
  const allowed = Math.floor(small.size / 10);
  let hit = 0;
  let miss = 0;
  for (const t of small) {
    if (big.has(t)) hit++;
    else if (++miss > allowed) return -1;
  }
  return hit;
}

/** Stems of everything the project already holds elsewhere (idea sheet, set-aside ideas, Idea Board, memory, premise): a statement made of these words is not lost if it leaves the mind. */
function anchorStems(project) {
  const set = new Set();
  const add = (text) => {
    if (typeof text === 'string') for (const t of tokensOf(text).list) set.add(t);
  };
  const addList = (list, f = add) => {
    if (Array.isArray(list)) for (const x of list.slice(-400)) f(x);
  };
  const sheet = (s) => {
    if (!s || typeof s !== 'object') return;
    for (const rec of Object.values(s.slots && typeof s.slots === 'object' ? s.slots : {})) add(rec?.value);
    addList(s.extra);
  };
  const agent = project.conversation?.agent;
  sheet(agent);
  addList(agent?.shelf, sheet);
  addList(agent?.committed, (c) => add(c?.digest));
  addList(project.brainstorm?.board, (i) => {
    add(i?.text);
    add(i?.note);
  });
  const m = project.memory;
  addList(m?.characters, (c) => {
    add(c?.name);
    addList(c?.aliases);
    add(c?.notes);
  });
  for (const k of ['timeline', 'themes', 'motifs']) addList(m?.[k]);
  addList(m?.intentional, (x) => {
    add(x?.quote);
    add(x?.note);
  });
  const wp = project.conversation?.workingPremise;
  add(wp?.summary);
  addList(wp?.revisions, (r) => add(r?.text));
  for (const k of ['characters', 'settings', 'themes']) addList(wp?.[k]);
  return set;
}

/** Mostly made of words the project holds elsewhere. */
const isAnchored = (entry, anchors) => {
  const toks = tokensOf(entry.text).set;
  return toks.size > 0 && containment(toks, anchors) >= 0.75;
};

/**
 * Keep a statement the writer made about their project. Returns the entry, or null when it was refused (see `cleanStatement`) or the project cannot be written to.
 *
 * A statement whose content stems are 90% inside an entry already held is not stored again (the earlier entry is returned and counts as said again just now); one that
 * contains an earlier entry (90% of that entry's stems) replaces it, so a statement that grows ("she wants the bell" ... "she wants the bell before the regatta") stays one fact.
 * Over the cap (MIND_LIMITS.said) the OLDEST entry whose words are not already held elsewhere in the project goes; if all are held elsewhere, the oldest.
 * @param {object} project
 * @param {string} text
 * @param {{ turn?: number|null, kind?: 'told'|'answered'|'added' }} [opts]  `turn`: the number of the writer's message (the same for every statement of one message)
 */
export function rememberSaid(project, text, { turn = null, kind = 'told' } = {}) {
  if (!project || typeof project !== 'object') return null;
  const s = cleanStatement(text);
  if (!s) return null;
  try {
    const mind = ensureMind(project);
    const t = Number.isFinite(turn) && turn >= 0 ? Math.min(1e9, Math.floor(turn)) : mind.turn;
    const now = Date.now();
    const here = tokensOf(s);
    const mine = here.set;
    const not = here.neg;
    const single = mine.size < 2; // one content word is not enough to call two statements "the same"
    const absorbed = [];
    for (let i = mind.said.length - 1; i >= 0; i--) {
      const e = mind.said[i];
      if (!e || typeof e.text !== 'string') continue;
      const there = tokensOf(e.text);
      const theirs = there.set;
      if (!theirs.size || there.neg !== not) continue; // "she is a captain" does not repeat "she is not a captain"
      const shared = sharedWords(mine, theirs);
      if (shared < 0) continue;
      const newInOld = shared / mine.size;
      const oldInNew = shared / theirs.size;
      if (newInOld >= 0.9 && (!single || oldInNew >= 0.9)) {
        e.turn = Math.max(e.turn, t); // said again: it is current again
        e.at = now;
        mind.turn = Math.max(mind.turn, t);
        return e;
      }
      if (oldInNew >= 0.9) absorbed.push(e);
    }
    if (absorbed.length) mind.said = mind.said.filter((e) => !absorbed.includes(e));
    const entry = { n: mind.seq + 1, turn: t, at: now, text: s, kind: SAID_KINDS.includes(kind) ? kind : 'told' };
    mind.seq = entry.n;
    mind.turn = Math.max(mind.turn, t);
    mind.said.push(entry);
    let anchors = null;
    while (mind.said.length > MIND_LIMITS.said) {
      anchors ??= anchorStems(project);
      const at = mind.said.findIndex((e) => !isAnchored(e, anchors));
      mind.said.splice(at < 0 ? 0 : at, 1);
    }
    return entry;
  } catch {
    return null; // e.g. a frozen project: remembering must never break a reply
  }
}

/**
 * Keep every statement a message makes (`statementsIn`) as the same message: one `turn` for all. Call it ONCE PER WRITER MESSAGE (the message is counted even when
 * it records nothing: a pasted text, a question or a request), so "N messages ago" counts messages. Returns the entries (a repeat returns the entry already held).
 */
export function rememberStatements(project, message, { turn = null, kind = 'told' } = {}) {
  if (!project || typeof project !== 'object') return [];
  let t;
  try {
    const mind = ensureMind(project);
    t = Number.isFinite(turn) && turn >= 0 ? Math.min(1e9, Math.floor(turn)) : mind.turn + 1;
    mind.turn = Math.max(mind.turn, t); // the message counts even when it says nothing to keep
  } catch {
    return [];
  }
  const out = [];
  for (const s of statementsIn(message)) {
    const e = rememberSaid(project, s, { turn: t, kind });
    if (e && !out.includes(e)) out.push(e);
  }
  return out;
}

const numberOf = (id) => (typeof id === 'number' ? id : typeof id === 'string' && /^said:\d{1,10}$/.test(id) ? Number(id.slice(5)) : typeof id === 'string' && /^\d{1,10}$/.test(id) ? Number(id) : NaN);

/** The writer's "forget this": remove one statement (by its number, or its id `said:12`). Returns whether anything was removed. */
export function forgetSaid(project, n) {
  try {
    const id = numberOf(n);
    const list = project?.mind?.said;
    if (!Number.isFinite(id) || !Array.isArray(list)) return false;
    const i = list.findIndex((e) => e?.n === id);
    if (i < 0) return false;
    list.splice(i, 1);
    return true;
  } catch {
    return false;
  }
}

/** "Forget this" for anything `describeMind` lists as removable: a statement (`said:12`) or an Idea Board item (`board:idea_ab12cd34`, `kept:idea_ab12cd34`). */
export function forgetItem(project, id) {
  if (typeof id !== 'string') return false;
  if (id.startsWith('said:')) return forgetSaid(project, id);
  const board = id.startsWith('board:') ? 6 : id.startsWith('kept:') ? 5 : 0; // a kept idea is an Idea Board item too
  if (board && Array.isArray(project?.brainstorm?.board)) return removeFromBoard(project, id.slice(board));
  return false;
}
