import { slotsFor } from './detect.js';
import { LIMITS, VIAS, clipAtBoundary, filledIds, getSlot, isSlotId, squash } from './state.js';

/**
 * The idea sheet: what the writer has told NIE, slot by slot, in their own words. Every function here returns a NEW state (the input is never touched).
 * Nothing on the sheet is NIE's wording: a value is a phrase lifted from what the writer said, and an update replaces the earlier one.
 */

/** Record a slot's value. Refuses an empty value (returns the same state) and keeps the writer's wording, clipped to 220 characters at a word. */
export function setSlot(state, id, value, { turn = state.turn, via = 'said' } = {}) {
  const v = clipAtBoundary(typeof value === 'string' ? value : '', LIMITS.value);
  if (!isSlotId(id) || !v) return state;
  const cur = getSlot(state, id);
  const rec = { value: v, turn: Math.max(0, Math.floor(Number(turn)) || 0), via: VIAS.includes(via) ? via : 'said' };
  if (cur && cur.value === rec.value && cur.turn === rec.turn && cur.via === rec.via) return state;
  return { ...state, slots: { ...state.slots, [id]: rec } };
}

export function clearSlot(state, id) {
  if (!getSlot(state, id)) return state;
  const slots = { ...state.slots };
  delete slots[id];
  return { ...state, slots };
}

/** A detail that fits no slot. Kept (newest last, at most 12), never duplicated, clipped to 200 characters; a closing full stop or comma is not part of the detail. */
export function addExtra(state, text) {
  const t = clipAtBoundary(typeof text === 'string' ? text : '', LIMITS.extraItem).replace(/[.;,\s]+$/, '');
  if (!t) return state;
  const key = t.toLowerCase();
  if (state.extra.some((e) => e.toLowerCase() === key)) return state;
  return { ...state, extra: [...state.extra, t].slice(-LIMITS.extra) };
}

// ── which slot means what ────────────────────────────────────────────────────
// The kinds of pack name their slots differently ("protagonist", "role", "places"...). Questions, extraction and the memory mapping all need to find
// "the main character" or "the setting" in whichever pack is in use: first by a well-known id (in order of preference), then by the slot's `memory`.

const ROLE_IDS = {
  who: ['protagonist', 'role', 'main-character', 'hero', 'lead', 'narrator', 'speaker', 'character', 'who', 'person', 'name'],
  place: ['setting', 'places', 'place', 'location', 'where', 'locale', 'backdrop'],
  thing: ['premise', 'difference', 'idea', 'concept', 'topic', 'thesis', 'logline', 'pitch', 'hook', 'angle', 'claim', 'subject'],
  want: ['want', 'goal', 'desire', 'motivation', 'objective', 'ambition', 'drive'],
  other: ['opposition', 'antagonist', 'rival', 'villain', 'opponent', 'adversary', 'nemesis', 'obstacle', 'conflict', 'barrier', 'force'],
  theme: ['theme', 'themes', 'message', 'meaning', 'point', 'takeaway'],
};
const ROLE_MEMORY = { who: 'character', place: 'setting', theme: 'theme' };

/**
 * The slot of this idea that plays a role ('who' | 'place' | 'thing' | 'want' | 'other' | 'theme'), or undefined.
 * `strict` stops at the well-known ids: a slot that merely files into memory as a character (the world pack's "peoples", the essay's "people") is fine
 * for finding a name to slot into a question, but it is NOT somewhere to put a name the writer happened to mention.
 */
export function slotForRole(slots, role, { strict = false } = {}) {
  for (const id of ROLE_IDS[role] ?? []) {
    const s = slots.find((x) => x.id === id);
    if (s) return s;
  }
  return !strict && ROLE_MEMORY[role] ? slots.find((x) => x.memory === ROLE_MEMORY[role]) : undefined;
}

/** The slot a conversation starts from: the first core slot with nothing before it. */
export const startSlot = (slots) => slots.find((s) => s.core && (s.after ?? []).length === 0);

// ── how much NIE understands ─────────────────────────────────────────────────

const READY_SCORE = 0.75;
const READY_CORE = 5;
const READY_TURNS = 4;

/**
 * Unfilled slots in asking order: slots whose prerequisites (`after`) are all filled come first (core before the rest, then pack order), then the
 * ones still waiting on a prerequisite. A prerequisite that this idea does not have (a form dropped it) counts as filled.
 */
export function openSlots(state, slots) {
  const have = new Set(slots.map((s) => s.id));
  const done = new Set(filledIds(state));
  const blocked = (s) => (s.after ?? []).some((id) => have.has(id) && !done.has(id));
  return slots
    .map((s, i) => ({ s, i, wait: blocked(s) ? 1 : 0 }))
    .filter(({ s }) => !done.has(s.id))
    .sort((a, b) => a.wait - b.wait || Number(b.s.core) - Number(a.s.core) || a.i - b.i)
    .map(({ s }) => s);
}

/**
 * The open slots that can be asked right now (all prerequisites filled). When none can, every open slot can (a pack must never stall the conversation).
 * `exclude` lists slots that cannot be asked at the moment (asked a moment ago, or declined twice); they are taken out FIRST, so a list that is only
 * "free" because of them does not hide everything else. `passed` lists slots the writer has declined twice: a prerequisite they will not answer does
 * not hold back the slots that follow it.
 */
export function askable(state, ctx, slots = slotsFor(state, ctx), { exclude = null, passed = null } = {}) {
  const have = new Set(slots.map((s) => s.id));
  const done = new Set(filledIds(state));
  const met = (id) => !have.has(id) || done.has(id) || Boolean(passed?.has(id));
  const open = openSlots(state, slots).filter((s) => !exclude?.has(s.id));
  const free = open.filter((s) => (s.after ?? []).every(met));
  return free.length ? free : open;
}

/**
 * How much of the idea NIE has. The kind of piece's own core parts decide it; the defining part a form or genre adds ("what the song comes back to", "who the sleuth is") is
 * still asked about but only ever raises the score: a writer who has told NIE everything else is not kept waiting for an answer to a genre question the rules cannot read.
 * @returns {{ score: number, filledCore: number, totalCore: number, open: string[], ready: boolean }}
 */
export function grasp(state, ctx) {
  const slots = slotsFor(state, ctx);
  const kinds = ctx?.packs?.kinds ?? {};
  const own = new Set((kinds[state?.kind ?? 'other'] ?? kinds.other)?.slots?.map((s) => s.id) ?? slots.map((s) => s.id));
  const core = slots.filter((s) => s.core);
  const required = core.filter((s) => own.has(s.id));
  const total = required.reduce((n, s) => n + s.weight, 0);
  const filled = core.filter((s) => getSlot(state, s.id));
  const got = filled.reduce((n, s) => n + s.weight, 0);
  const score = total ? Math.min(1, got / total) : 0;
  const cfg = ctx?.config ?? {};
  const minCore = Math.min(cfg.minCore ?? READY_CORE, required.length);
  const ready = score >= (cfg.readyScore ?? READY_SCORE) && filled.length >= minCore && state.turn >= (cfg.readyTurns ?? READY_TURNS);
  return { score, filledCore: filled.length, totalCore: required.length, open: openSlots(state, slots).map((s) => s.id), ready };
}

/** What the UI panel shows: what NIE has recorded (the writer's words), what is still open, and how much it grasps. */
export function describe(state, ctx) {
  const slots = slotsFor(state, ctx);
  const g = grasp(state, ctx);
  const labelOf = (list, id) => list.find((a) => a?.id === id)?.label ?? id;
  return {
    kind: state.kind,
    kindLabel: ctx?.packs?.kinds?.[state.kind]?.noun ?? null,
    form: state.form,
    formLabel: state.form ? labelOf(ctx?.packs?.forms ?? [], state.form) : null,
    genres: [...state.genres],
    genreLabels: state.genres.map((id) => labelOf(ctx?.packs?.genres ?? [], id)),
    filled: slots.filter((s) => getSlot(state, s.id)).map((s) => ({ id: s.id, label: s.label, value: getSlot(state, s.id).value })),
    open: g.open.map((id) => slots.find((s) => s.id === id)).filter(Boolean).map((s) => ({ id: s.id, label: s.label, core: s.core })),
    extra: [...state.extra],
    mode: state.mode,
    shelf: state.shelf.map((e) => ({ kind: e.kind, slots: Object.keys(e.slots).length, preview: squash(Object.values(e.slots)[0]?.value ?? e.extra[0] ?? '').slice(0, 80) })),
    grasp: g,
  };
}
