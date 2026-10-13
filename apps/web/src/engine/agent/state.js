import { STOPWORDS, WORD_RE, stem } from '../util/text.js';
import { KINDS, QUESTION_TYPES } from './packs/schema.js';

/**
 * The agent's memory of ONE writer's idea: what they said, in their own words, per slot; what NIE asked; what is waiting for an answer.
 * It is plain JSON stored at `project.conversation.agent`, so it is isolated with the project and removed with it.
 *
 *   { v, idea, kind, form, genres, slots: { [slotId]: { value, turn, via } }, extra, asked, pending, mode,
 *     turn, sinceAsk, sinceOffer, declinedAt, committed, shelf }
 *
 * `idea` numbers the ideas of this project (a new idea bumps it) so a commit can be matched to the sheet it came from; `asked[].type` and
 * `shelf[].{idea,turn}` are small additions to the sketched shape that planning and restoring need.
 * `sanitizeAgentState` is the only door in: whatever is stored (an older version, a hostile file, a hand edit) comes out as a valid state.
 */

export const AGENT_VERSION = 1;
export const MODES = Object.freeze(['auto', 'interview', 'quiet']);
export const VIAS = Object.freeze(['said', 'answered', 'added']);
export const LIMITS = Object.freeze({ value: 220, extraItem: 200, extra: 12, asked: 40, committed: 20, shelf: 3, shelfAsked: 10, genres: 2, slots: 48, text: 300, digest: 700, note: 400, name: 80 });

const SLOT_ID = /^[a-z][a-z0-9-]{1,30}$/;
const ADDON_ID = /^[a-z][a-z0-9-]{1,40}$/;
const BLOCKED = new Set(['__proto__', 'constructor', 'prototype']);

export const isSlotId = (id) => typeof id === 'string' && SLOT_ID.test(id) && !BLOCKED.has(id);
const isAddonId = (id) => typeof id === 'string' && ADDON_ID.test(id) && !BLOCKED.has(id);
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// ── text helpers shared by every agent file ──────────────────────────────────

/** One line of plain text: control characters and runs of whitespace become one space. Never throws. */
export function squash(v) {
  // (the bidirectional overrides and isolates go too: they can make a recap read back to front, and nobody types them on purpose)
  return typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]+/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

/** At most `n` characters, cut at a sentence end when one is late enough, else at a word. No ellipsis: a slot value must stay the writer's own words. */
export function clipAtBoundary(text, n) {
  const s = squash(text);
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const sentence = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (sentence >= n * 0.4) return cut.slice(0, sentence + 1).trim();
  const space = cut.lastIndexOf(' ');
  return (space >= n * 0.5 ? cut.slice(0, space) : cut).replace(/[\s,;:–—-]+$/, '').trim();
}

const hardClip = (v, n) => {
  const s = squash(v);
  return s.length <= n ? s : s.slice(0, n).trim();
};

/** Content-word stems of a text (no stopwords, no 1-2 letter words): what "the same words" means everywhere in the agent. */
export function stemList(text) {
  return (String(text ?? '').slice(0, 20000).match(WORD_RE) ?? [])
    .map((w) => w.toLowerCase())
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .map(stem);
}
export const stemSet = (text) => new Set(stemList(text));
export const wordsOf = (text) => String(text ?? '').slice(0, 20000).match(WORD_RE) ?? [];

// ── the state ────────────────────────────────────────────────────────────────

export function emptyAgentState() {
  return { v: AGENT_VERSION, idea: 1, kind: null, form: null, genres: [], slots: {}, extra: [], asked: [], pending: null, mode: 'auto', turn: 0, sinceAsk: 0, sinceOffer: 0, declinedAt: null, committed: [], shelf: [] };
}

/** The recorded slot, or undefined. Own properties only, so a slot called "constructor" can never read a built-in. */
export function getSlot(state, id) {
  const slots = state?.slots;
  return slots && Object.hasOwn(slots, id) ? slots[id] : undefined;
}
export const slotValue = (state, id) => getSlot(state, id)?.value ?? '';
export const filledIds = (state) => Object.keys(state?.slots ?? {}).filter((id) => getSlot(state, id)?.value);

function int(v, { min = 0, max = 1000000, fallback = 0 } = {}) {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : fallback;
}

function strings(list, { max, each }) {
  if (!Array.isArray(list)) return [];
  const out = [];
  const seen = new Set();
  for (const item of list.slice(0, max * 3)) {
    const s = hardClip(item, each);
    if (!s || seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase());
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

function cleanSlots(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  let n = 0;
  for (const id of Object.keys(raw)) {
    if (!isSlotId(id)) continue; // also drops "__proto__" and friends
    const s = raw[id];
    const value = isObject(s) ? hardClip(s.value, LIMITS.value) : '';
    if (!value) continue;
    out[id] = { value, turn: int(s.turn), via: VIAS.includes(s.via) ? s.via : 'said' };
    if (++n >= LIMITS.slots) break;
  }
  return out;
}

function cleanAsked(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const a of raw.slice(-LIMITS.asked * 2)) {
    const text = isObject(a) ? hardClip(a.text, LIMITS.text) : '';
    if (!text) continue;
    out.push({ slot: isSlotId(a.slot) ? a.slot : null, text, type: QUESTION_TYPES.includes(a.type) ? a.type : null, turn: int(a.turn), answered: a.answered === true, skipped: a.skipped === true });
  }
  return out.slice(-LIMITS.asked);
}

function cleanPending(raw) {
  if (!isObject(raw)) return null;
  if (raw.kind === 'question') {
    const text = hardClip(raw.text, LIMITS.text);
    return text ? { kind: 'question', slot: isSlotId(raw.slot) ? raw.slot : null, text, turn: int(raw.turn) } : null;
  }
  if (raw.kind === 'offer') return { kind: 'offer', turn: int(raw.turn), partial: raw.partial === true, ...(raw.again === true ? { again: true } : {}) };
  return null;
}

function cleanCommitted(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const c of raw.slice(-LIMITS.committed * 2)) {
    const boardId = isObject(c) ? hardClip(c.boardId, 64) : '';
    if (!boardId) continue;
    const prev = isObject(c.prev) ? { text: hardClip(c.prev.text, LIMITS.digest), note: hardClip(c.prev.note, LIMITS.note) } : null;
    out.push({
      idea: int(c.idea, { min: 1, fallback: 1 }),
      turn: int(c.turn),
      boardId,
      characters: strings(c.characters, { max: 12, each: LIMITS.name }),
      themes: strings(c.themes, { max: 12, each: LIMITS.name }),
      motifs: strings(c.motifs, { max: 12, each: LIMITS.name }),
      settings: strings(c.settings, { max: 12, each: LIMITS.name }),
      premise: hardClip(c.premise, 16),
      created: c.created !== false,
      prev: prev && prev.text ? prev : null,
      digest: hardClip(c.digest, LIMITS.digest),
      note: hardClip(c.note, LIMITS.note),
    });
  }
  return out.slice(-LIMITS.committed);
}

/** What the sheet itself holds (used for the live sheet and for a shelved one). */
function cleanSheet(raw) {
  const kind = KINDS.includes(raw?.kind) ? raw.kind : null;
  return {
    kind,
    form: isAddonId(raw?.form) ? raw.form : null,
    genres: Array.isArray(raw?.genres) ? [...new Set(raw.genres.filter(isAddonId))].slice(0, LIMITS.genres) : [],
    slots: cleanSlots(raw?.slots),
    extra: strings(raw?.extra, { max: LIMITS.extra, each: LIMITS.extraItem }),
  };
}

function cleanShelf(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const s of raw.slice(-LIMITS.shelf * 2)) {
    if (!isObject(s)) continue;
    const sheet = cleanSheet(s);
    if (!Object.keys(sheet.slots).length && !sheet.extra.length) continue;
    // `asked` is what NIE had asked about that idea, so bringing it back never repeats a question the writer has already seen
    out.push({ ...sheet, shelvedAt: int(s.shelvedAt), idea: int(s.idea, { min: 1, fallback: 1 }), turn: int(s.turn), kept: s.kept === true, asked: cleanAsked(s.asked).slice(-LIMITS.shelfAsked) });
  }
  return out.slice(-LIMITS.shelf);
}

/** Any stored value in, a valid state out. Never throws; unknown keys are dropped; everything is clipped. */
export function sanitizeAgentState(raw) {
  try {
    if (!isObject(raw)) return emptyAgentState();
    const base = emptyAgentState();
    const sheet = cleanSheet(raw);
    const turn = int(raw.turn);
    return {
      ...base,
      ...sheet,
      idea: int(raw.idea, { min: 1, fallback: 1 }),
      asked: cleanAsked(raw.asked),
      pending: cleanPending(raw.pending),
      mode: MODES.includes(raw.mode) ? raw.mode : 'auto',
      turn,
      sinceAsk: int(raw.sinceAsk, { max: 1000 }),
      sinceOffer: int(raw.sinceOffer, { max: 1000 }),
      declinedAt: raw.declinedAt === null || raw.declinedAt === undefined ? null : int(raw.declinedAt, { fallback: 0 }),
      committed: cleanCommitted(raw.committed),
      shelf: cleanShelf(raw.shelf),
    };
  } catch {
    return emptyAgentState();
  }
}

/** The state a new idea starts from: nothing recorded, but the mode, the shelf and the record of what was kept all stay. */
export function freshIdea(state) {
  return { ...emptyAgentState(), idea: (state?.idea ?? 1) + 1, mode: state?.mode ?? 'auto', committed: state?.committed ?? [], shelf: state?.shelf ?? [] };
}

/** True when the sheet holds anything at all. */
export const hasContent = (state) => filledIds(state).length > 0 || (state?.extra?.length ?? 0) > 0;
