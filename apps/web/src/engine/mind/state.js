import { clipAtBoundary } from '../agent/state.js';

/**
 * The project's mind: a durable, bounded record of what the WRITER said about their project, kept at `project.mind`. It lives inside the project
 * object, so it is saved with it, isolated from every other project, and removed with it when the project is deleted (store.js deletes every key
 * under the project's prefix). `sanitizeMind` is the only door in: whatever is stored (an older version, a hostile file, a hand edit) comes out as a valid,
 * bounded mind.
 *
 *   { v, said: [{ n, turn, at, text, kind }], seq, turn }
 *
 *   n     the entry's number (grows, never reused: it is the entry's identity for "forget this")
 *   turn  the number of the writer's message it came from (see `turn` below); at: when it was recorded (ms)
 *   text  the writer's own words, one statement, at most MIND_LIMITS.text characters, cut at a word
 *   kind  'told' (volunteered), 'answered' (an answer to a question NIE asked), 'added' (an "also ..." detail)
 *   seq   the number the next entry will get minus one; turn: the highest message number recorded so far
 */

export const MIND_VERSION = 1;
export const MIND_LIMITS = Object.freeze({
  said: 600, // statements kept per project (about 190,000 characters of JSON when full)
  text: 260, // characters per statement
  pasted: 400, // a message of this many words or more is a pasted text, not a statement
  perMessage: 30, // statements taken from one message (a telling of a whole cast is often longer than sixteen facts; a paste is refused by size)
});
export const SAID_KINDS = Object.freeze(['told', 'answered', 'added']);

const NUM_MAX = 1e9; // the largest entry number, message number or count kept (a stored number beyond it is a hand edit)
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
/** An own property only: `{ __proto__: { text: 'x' } }` has no `text`. */
const own = (o, k) => (Object.hasOwn(o, k) ? o[k] : undefined);

function int(v, { min = 0, max = NUM_MAX, fallback = 0 } = {}) {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : fallback;
}

export function emptyMind() {
  return { v: MIND_VERSION, said: [], seq: 0, turn: 0 };
}

/** One statement's text as it is stored: one line, control and direction characters gone, cut at a word. '' when nothing is left. */
export const statementText = (v) => clipAtBoundary(typeof v === 'string' ? v.slice(0, 2000) : '', MIND_LIMITS.text);

function cleanEntry(e) {
  if (!isObject(e)) return null;
  const n = int(own(e, 'n'), { min: 1, fallback: 0 });
  const text = statementText(own(e, 'text'));
  if (!n || !text) return null;
  const kind = own(e, 'kind');
  return { n, turn: int(own(e, 'turn')), at: int(own(e, 'at'), { max: 8.64e15 }), text, kind: SAID_KINDS.includes(kind) ? kind : 'told' };
}

/** Any stored value in, a valid mind out. Never throws; unknown keys are dropped; only the newest entries are looked at, so a hostile list costs little. */
export function sanitizeMind(raw) {
  try {
    if (!isObject(raw)) return emptyMind();
    const list = own(raw, 'said');
    const byN = new Map();
    if (Array.isArray(list)) {
      for (const e of list.slice(-MIND_LIMITS.said * 2)) {
        const c = cleanEntry(e);
        if (c) byN.set(c.n, c); // a repeated number keeps the later entry
      }
    }
    const said = [...byN.values()].sort((a, b) => a.n - b.n).slice(-MIND_LIMITS.said);
    return {
      v: MIND_VERSION,
      said,
      seq: Math.max(int(own(raw, 'seq')), said.at(-1)?.n ?? 0),
      turn: Math.max(int(own(raw, 'turn')), ...said.map((e) => e.turn)),
    };
  } catch {
    return emptyMind();
  }
}

const inRange = (v) => Number.isInteger(v) && v >= 0 && v <= NUM_MAX;

/** Entries as `sanitizeMind` leaves them: numbered in strictly growing order up to `seq`, each with a text and a turn (a hand edit or a bug elsewhere must not reach the code that trusts this). */
function wellFormed(m) {
  let last = 0;
  for (const e of m.said) {
    if (!isObject(e) || !Number.isInteger(e.n) || e.n <= last || e.n > m.seq || typeof e.text !== 'string' || !e.text || e.text.length > MIND_LIMITS.text || !inRange(e.turn)) return false;
    last = e.n;
  }
  return true;
}

/** The project's mind, created (or repaired) when missing or out of shape (numbers out of range, far too many entries, entries that are not entries). Never throws on a project without one. */
export function ensureMind(project) {
  const m = project.mind;
  if (isObject(m) && Array.isArray(m.said) && m.said.length <= MIND_LIMITS.said && inRange(m.seq) && inRange(m.turn) && wellFormed(m)) return m;
  project.mind = sanitizeMind(m);
  return project.mind;
}

/** Entry numbers start again from 1 (in order), for the day `seq` reaches the largest number a stored entry may have: a number must never be clamped into another entry's. */
export function renumber(mind) {
  mind.said.forEach((e, i) => {
    e.n = i + 1;
  });
  mind.seq = mind.said.length;
  return mind;
}

export const NEXT_MAX = NUM_MAX - 1;

/** The mind of a project WITHOUT creating or changing anything (readers must never write to the project they were given). */
export function mindOf(project) {
  const m = project?.mind;
  return isObject(m) && Array.isArray(m.said) ? m : emptyMind();
}
