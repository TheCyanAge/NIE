/**
 * The state of a conversation about the library, as stored with the project (`project.conversation.library`): which subject the last library answer was about,
 * which facets of it have been shown, and at which message. Plain JSON, so it is isolated with the project and removed with it.
 * `sanitizeThread` is the only door in: whatever is stored (an older version, a hand edit) comes out valid.
 * (Kept apart from thread.js so the project store can use it without loading the library.)
 */

export const THREAD_VERSION = 1;
/** The order in which "tell me more" walks through a subject's facets: the story of it first, what it is made of next, then the market, then the neighbours. */
export const FACET_ORDER = Object.freeze(['history', 'subgenres', 'tropes', 'craft', 'readers', 'compare', 'canon', 'pitfalls', 'terms']);

const ID = /^[a-z0-9][a-z0-9._-]{1,120}$/i;
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
// (control and format characters go: the bidirectional overrides among them can make a name read back to front)
const clip = (v, n) => (typeof v === 'string' ? v.replace(/[\p{Cc}\p{Cf}]+/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, n) : '');
const int = (v, max) => (Number.isFinite(v) ? Math.min(max, Math.max(0, Math.floor(v))) : 0);

export function emptyThread() {
  return { v: THREAD_VERSION, subject: null, shown: [], entryShown: 0, turn: 0 };
}

/** Any stored value in, a valid thread out. Never throws. */
export function sanitizeThread(raw) {
  try {
    if (!isObject(raw) || !isObject(raw.subject)) return emptyThread();
    const id = typeof raw.subject.id === 'string' && ID.test(raw.subject.id) ? raw.subject.id : null;
    if (!id) return emptyThread();
    return {
      v: THREAD_VERSION,
      subject: { id, name: clip(raw.subject.name, 120) || id, kind: clip(raw.subject.kind, 24) },
      shown: [...new Set(Array.isArray(raw.shown) ? raw.shown.filter((f) => FACET_ORDER.includes(f)) : [])],
      entryShown: int(raw.entryShown, 100),
      turn: int(raw.turn, 1000000),
    };
  } catch {
    return emptyThread();
  }
}

export { int as clampInt };
