import { emptyWorkingPremise } from '../intent/intent.js';
import { MAX_IDEA_CHARS, addToBoard, emptyBrainstorm, isOnBoard, removeFromBoard, updateBoardItem } from '../project/board.js';
import { rememberCharacter, rememberItem } from '../project/memory.js';
import { STOPWORDS, fnv1a, pick } from '../util/text.js';
import { clean, nameIn, placeCore, themeCore } from './ask.js';
import { slotsFor } from './detect.js';
import { openSlots, startSlot } from './sheet.js';
import { LIMITS, clipAtBoundary, getSlot, slotValue, squash, wordsOf } from './state.js';

/**
 * Keeping an idea: the recap NIE shows, the digest that goes on the Idea Board, and the mapping into project memory (characters, themes, motifs,
 * settings, the working premise). Everything shown or stored here is the writer's own words under NIE's slot labels; nothing is composed.
 * A commit records exactly what it ADDED, so `undoCommit` can take back exactly that and nothing the writer put there themselves.
 */

const MAX_LABELS = 6;

/** Labels of the slots still open, core first, at most six ("and 3 more" says there are more; it does not name them). */
function openLabels(state, ctx) {
  const labels = openSlots(state, slotsFor(state, ctx)).map((s) => s.label);
  return labels.length > MAX_LABELS ? [...labels.slice(0, MAX_LABELS), `and ${labels.length - MAX_LABELS} more`] : labels;
}

export function recapText(state, ctx, { partial = false } = {}) {
  const slots = slotsFor(state, ctx).filter((s) => getSlot(state, s.id));
  const lines = [partial ? "I'll keep what we have. Here's what I've got so far, in your words:" : "Here's what I've got so far, in your words:"];
  for (const s of slots) lines.push(`• ${s.label}: ${slotValue(state, s.id)}`);
  for (const e of state.extra) lines.push(`• Also: ${e}`);
  const open = openLabels(state, ctx);
  lines.push('');
  if (open.length) lines.push(`${partial ? "I'm still missing" : 'Still open'}: ${open.join(', ')}`, '');
  lines.push("Want me to keep this on your Idea Board and in this project's memory? You can add or change anything first.");
  return lines.join('\n');
}

/** Chips for the offer, in the shape of the existing suggestion chips (a `send` chip sends at once, a `text` chip fills the composer). */
export function offerChips() {
  return [
    { label: 'Yes, keep it', text: '', send: { ask: 'Yes, keep it.' } },
    { label: 'Let me add something', text: 'Also, ' },
    { label: 'Not yet', text: '', send: { ask: 'Not yet.' } },
  ];
}

/** The word-boundary shortening used when a value must fit: "…" says something was left out. */
function shorten(value, n) {
  if (value.length <= n) return value;
  const cut = value.slice(0, Math.max(1, n - 1));
  const sp = cut.lastIndexOf(' ');
  return `${(sp > n / 2 ? cut.slice(0, sp) : cut).replace(/[\s,;:–—-]+$/, '')}…`;
}

/**
 * 'Label: value · Label: value · Also: ...' in pack order. Over the limit, every value shrinks in proportion (none below 40 characters); if the labels
 * alone still do not fit, the least important items go: the extra details, then the open-ended slots, last first. Never longer than `maxChars`.
 */
export function digest(state, ctx, maxChars = MAX_IDEA_CHARS) {
  const items = slotsFor(state, ctx).filter((s) => getSlot(state, s.id)).map((s, order) => ({ label: s.label, value: slotValue(state, s.id), rank: s.core ? 2 : 1, order }));
  state.extra.forEach((e, i) => items.push({ label: 'Also', value: e, rank: 0, order: 1000 + i }));
  if (!items.length) return '';
  const join = (list) => list.map((i) => `${i.label}: ${i.value}`).join(' · ');
  let text = join(items);
  if (text.length <= maxChars) return text;
  let kept = items;
  for (;;) {
    const fixed = kept.reduce((n, i) => n + i.label.length + 2, 0) + (kept.length - 1) * 3;
    const total = kept.reduce((n, i) => n + i.value.length, 0);
    const scale = Math.max(0, maxChars - fixed) / total;
    text = join(kept.map((i) => ({ ...i, value: shorten(i.value, Math.max(40, Math.floor(i.value.length * scale))) })));
    if (text.length <= maxChars || kept.length === 1) break;
    const drop = [...kept].sort((a, b) => a.rank - b.rank || b.order - a.order)[0]; // extras first, then non-core, last first
    kept = kept.filter((i) => i !== drop);
  }
  return text.length <= maxChars ? text : shorten(text, maxChars);
}

// ── project memory ───────────────────────────────────────────────────────────

const lowerKey = (s) => String(s).trim().toLowerCase();
const APPOSITIVE = /^(?:a|an|the|his|her|their|who|whose)\b/i;
const OPENS_NOUN_PHRASE = /^(?:an?|the|my|our|his|her|their)\s+\p{L}/iu;

/** A short noun phrase for a person with no name: "a retired ferry captain who drinks" -> "retired ferry captain". */
function shortNoun(part) {
  const words = clean(part).replace(/^(?:a|an|the|his|her|their|my|our)\s+/i, '').split(/\s+(?:who|that|which|whose|with|in|on|at|from|of)\s+|[,;:()]/i)[0].split(/\s+/).filter(Boolean).slice(0, 4);
  return words.join(' ');
}

/**
 * The people in a character slot's value. "Mara and Corin" is two people; "Mara, a lighthouse keeper" is one (the part after the comma describes her).
 * A person's name is the first capitalised name in their part, else a short noun phrase of at most four words.
 */
export function peopleIn(value) {
  const people = [];
  for (const part of String(value ?? '').split(/\s*(?:,|;|&|\band\b|\bplus\b)\s*/i).map(clean).filter(Boolean)) {
    const name = nameIn(part);
    const last = people.at(-1);
    if (!name && last?.named && APPOSITIVE.test(part)) {
      last.notes = `${last.notes}, ${part}`;
      continue;
    }
    // a person with no name is "a retired ferry captain" / "her brother": a phrase that OPENS with an article or a possessive. A fragment of a sentence ("cannot stop
    // counting the", "never wrote back", "I want to tell") is not a person and must not become a character in the writer's project.
    const who = name ?? (OPENS_NOUN_PHRASE.test(part) ? shortNoun(part) : '');
    if (who && wordsOf(who).some((w) => !STOPWORDS.has(w.toLowerCase()))) people.push({ name: who.slice(0, LIMITS.name), notes: part, named: Boolean(name) });
  }
  const out = people.slice(0, 6);
  if (out.length === 1) out[0].notes = clipAtBoundary(value, LIMITS.extraItem);
  return out.map(({ name, notes }) => ({ name, notes: clipAtBoundary(notes, LIMITS.extraItem) }));
}

/** What the sheet files into memory, without touching the project: characters, themes, motifs, settings and the premise. */
function memoryPlan(state, ctx) {
  const plan = { characters: [], themes: [], motifs: [], settings: [], premise: '' };
  const slots = slotsFor(state, ctx);
  for (const s of slots) {
    const value = slotValue(state, s.id);
    if (!value || !s.memory) continue;
    if (s.memory === 'character') {
      for (const p of peopleIn(value)) if (!plan.characters.some((c) => lowerKey(c.name) === lowerKey(p.name))) plan.characters.push(p);
    // (a theme or a place is filed without the words that introduced it: "forgiveness", not "The theme is forgiveness")
    } else if (s.memory === 'theme') plan.themes.push(clipAtBoundary(themeCore(value), 80));
    else if (s.memory === 'motif') plan.motifs.push(clipAtBoundary(value, 80));
    else if (s.memory === 'setting') plan.settings.push(clipAtBoundary(placeCore(value), 80));
  }
  const start = startSlot(slots);
  if (start) plan.premise = slotValue(state, start.id);
  return plan;
}

const premiseHash = (summary) => fnv1a(String(summary));

/** Write the plan into the project. Returns what is in memory because of this idea (`mapped`) and what this call put there (`added`). */
function applyMemory(project, plan, earlier) {
  const memory = (project.memory ??= {});
  for (const k of ['characters', 'themes', 'motifs']) if (!Array.isArray(memory[k])) memory[k] = [];
  const mapped = { characters: [], themes: [], motifs: [], settings: [] };
  const added = { characters: [], themes: [], motifs: [], settings: [], premise: '' };
  const mine = new Set(earlier.flatMap((c) => c.characters.map(lowerKey)));
  for (const p of plan.characters) {
    const have = memory.characters.find((c) => lowerKey(c.name) === lowerKey(p.name));
    if (!have) {
      rememberCharacter(project, { name: p.name, notes: p.notes });
      added.characters.push(p.name);
    } else if (mine.has(lowerKey(p.name))) rememberCharacter(project, { name: p.name, notes: p.notes }); // one this idea filed earlier: keep its notes current
    mapped.characters.push(p.name); // (a character the writer already had is left exactly as it was)
  }
  for (const [list, key] of [['themes', 'themes'], ['motifs', 'motifs']]) {
    for (const v of plan[list]) {
      if (!memory[key].some((x) => lowerKey(x) === lowerKey(v))) {
        rememberItem(project, key, v);
        added[list].push(v);
      }
      mapped[list].push(v);
    }
  }
  const conv = (project.conversation ??= {});
  const wp = (conv.workingPremise ??= emptyWorkingPremise());
  if (!Array.isArray(wp.settings)) wp.settings = [];
  for (const v of plan.settings) {
    if (wp.settings.some((x) => lowerKey(x) === lowerKey(v))) mapped.settings.push(v);
    else if (wp.settings.length < 8) {
      wp.settings.push(v);
      added.settings.push(v);
      mapped.settings.push(v);
    }
  }
  if (plan.premise && !squash(wp.summary ?? '')) {
    wp.summary = clipAtBoundary(plan.premise, 500);
    added.premise = premiseHash(wp.summary);
  }
  return { mapped, added };
}

/** Every loaded project has a board; a hand-made or half-loaded one gets an empty board rather than a crash. */
function ensureBoard(project) {
  const b = (project.brainstorm ??= emptyBrainstorm());
  if (!Array.isArray(b.board)) b.board = [];
}

/** The commit of the sheet now on the table (matched by idea number), if any. */
export const lastCommitFor = (state) => [...state.committed].reverse().find((c) => c.idea === state.idea) ?? null;

/** Has the sheet changed since it was last kept? (A sheet never kept counts as changed.) */
export function changedSinceCommit(state, ctx) {
  const last = lastCommitFor(state);
  return !last || last.digest !== digest(state, ctx, MAX_IDEA_CHARS);
}

/**
 * Keep the idea: on the Idea Board (one item per idea: a later commit UPDATES it) and in project memory by each slot's `memory`.
 * @returns {{ state: object, result: object }}
 */
export function commitIdea(project, state, ctx, { now } = {}) {
  const dg = digest(state, ctx, MAX_IDEA_CHARS);
  const open = openLabels(state, ctx);
  const base = { boardId: null, addedToBoard: false, updatedBoard: false, unchanged: false, empty: false, characters: [], themes: [], motifs: [], settings: [], open, digest: dg };
  if (!dg) return { state: { ...state, pending: null, sinceOffer: 0 }, result: { ...base, empty: true } }; // an offer waiting on nothing must not wait for ever

  ensureBoard(project);
  const plan = memoryPlan(state, ctx);
  const names = { characters: plan.characters.map((c) => c.name), themes: plan.themes, motifs: plan.motifs, settings: plan.settings };
  const last = lastCommitFor(state);
  const note = open.length ? `Still open: ${open.join(', ')}`.slice(0, 380) : '';
  if (last && last.digest === dg && isOnBoard(project, last.boardId)) {
    return { state: { ...state, pending: null, sinceOffer: 0, declinedAt: null }, result: { ...base, boardId: last.boardId, unchanged: true, ...names } };
  }

  let boardId;
  let created = false;
  let prev = null;
  // The earlier entry is updated in place (never a duplicate), unless the writer has edited its text since: then their edit stays and the new
  // digest becomes its own entry, because NIE never overwrites the writer's words on their board.
  const earlierItem = last ? project.brainstorm.board.find((x) => x.id === last.boardId) : null;
  if (earlierItem && earlierItem.text === last.digest) {
    prev = { text: earlierItem.text, note: earlierItem.note ?? '' };
    updateBoardItem(project, earlierItem.id, { text: dg, note });
    boardId = earlierItem.id;
  } else {
    const { added, item } = addToBoard(project, { text: dg, kind: state.kind, source: 'writer', note });
    boardId = item?.id ?? null;
    created = added;
    if (added && Number.isFinite(now)) item.createdAt = now;
  }
  const earlier = state.committed.filter((c) => c.idea === state.idea);
  const { mapped, added } = applyMemory(project, plan, earlier);
  const record = { idea: state.idea, turn: state.turn, boardId: boardId ?? '', characters: added.characters, themes: added.themes, motifs: added.motifs, settings: added.settings, premise: added.premise, created, prev, digest: dg, note: note.trim() };
  const committed = [...state.committed, record].filter((c) => c.boardId).slice(-LIMITS.committed);
  return {
    state: { ...state, committed, pending: null, sinceOffer: 0, declinedAt: null },
    result: { ...base, boardId, addedToBoard: created, updatedBoard: Boolean(prev), ...mapped, added },
  };
}

/**
 * Take back the last commit: its board item (or its edit of one) and exactly the memory entries it added.
 * The Idea Board is the writer's: an entry they have edited since NIE kept it (its text or its note is no longer what NIE wrote) is left exactly as it is.
 */
export function undoCommit(project, state, _ctx) {
  const last = state.committed.at(-1);
  if (!last) return { state, removed: null };
  ensureBoard(project);
  const item = project.brainstorm.board.find((x) => x.id === last.boardId);
  const edited = Boolean(item) && (item.text !== last.digest || (typeof last.note === 'string' && String(item.note ?? '').trim() !== last.note));
  let board = 'untouched';
  if (!item) board = last.created || last.prev ? 'gone' : 'untouched';
  else if (edited) board = 'edited';
  else if (last.created) {
    removeFromBoard(project, last.boardId);
    board = 'removed';
  } else if (last.prev) {
    updateBoardItem(project, last.boardId, { text: last.prev.text, note: last.prev.note });
    board = 'restored';
  }
  const memory = project.memory ?? {};
  const without = (list, names) => (Array.isArray(list) ? list.filter((x) => !names.some((n) => lowerKey(n) === lowerKey(typeof x === 'string' ? x : x?.name))) : list);
  if (last.characters.length && Array.isArray(memory.characters)) memory.characters = without(memory.characters, last.characters);
  if (last.themes.length && Array.isArray(memory.themes)) memory.themes = without(memory.themes, last.themes);
  if (last.motifs.length && Array.isArray(memory.motifs)) memory.motifs = without(memory.motifs, last.motifs);
  const wp = project.conversation?.workingPremise;
  if (wp && last.settings.length && Array.isArray(wp.settings)) wp.settings = without(wp.settings, last.settings);
  if (wp && last.premise && wp.summary && premiseHash(wp.summary) === last.premise) wp.summary = '';
  return {
    state: { ...state, committed: state.committed.slice(0, -1), pending: null },
    removed: { boardId: last.boardId, board, characters: last.characters, themes: last.themes, motifs: last.motifs, settings: last.settings, premise: Boolean(last.premise) },
  };
}

// ── what NIE says ────────────────────────────────────────────────────────────

/** Only facts from `result`: what happened on the board, what is in memory because of this idea, and what is still open. */
export function confirmText(result, { what = '' } = {}) {
  if (result.empty) return "There's nothing recorded yet, so there's nothing to keep. Tell me about the idea first.";
  if (result.unchanged) return `That's already on your Idea Board exactly as it stands, so nothing changed.${result.open.length ? ` Still open: ${result.open.join(', ')}.` : ''}`;
  const memory = [['characters', result.characters], ['themes', result.themes], ['motifs', result.motifs], ['settings', result.settings]].filter(([, v]) => v?.length).map(([k, v]) => `${k}: ${v.join(', ')}`);
  const lead = result.addedToBoard ? "It's on your Idea Board" : result.updatedBoard ? 'I updated the entry already on your Idea Board' : 'It was already on your Idea Board';
  const mid = memory.length ? ` and in this project's memory (${memory.join('; ')})` : '';
  const open = result.open.length ? ` Still open: ${result.open.join(', ')}.` : '';
  return `Kept${what ? ` ${what}` : ''}. ${lead}${mid}. Say "show my idea board" any time.${open}`;
}

const HOLD = [
  "No rush. We'll keep going.",
  "Of course. We'll keep building it.",
  'Okay, nothing is saved yet. Carry on whenever you like.',
  "No problem. I'll hold off, and you can say \"keep this idea\" any time.",
  "Sure. We'll keep working on it first.",
  "Fair enough. Let's keep going and I'll leave it unsaved for now.",
];
export const holdText = (seed = '') => pick(HOLD, seed);

const fallbackLabel = (ctx, id) => {
  const lists = [...Object.values(ctx?.packs?.kinds ?? {}).map((k) => k?.slots), ...(ctx?.packs?.forms ?? []).map((a) => a?.add), ...(ctx?.packs?.genres ?? []).map((a) => a?.add)];
  for (const list of lists) {
    const s = Array.isArray(list) ? list.find((x) => x?.id === id) : null;
    if (s?.label) return s.label;
  }
  return String(id).replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
};

/**
 * Say exactly what changed. `updates` are { slot, value, label?, was? } for slots (a `was` means a value was replaced), or { slot: null, value } for a detail
 * that fits no slot ("Noted under "Also""). Ends by asking whether to keep it.
 */
export function addedText(updates, ctx) {
  const list = Array.isArray(updates) ? updates : [];
  const part = (u) => `${u.label ?? fallbackLabel(ctx, u.slot)} - ${u.value}`;
  const slots = list.filter((u) => u.slot);
  const added = slots.filter((u) => !u.was).map(part);
  const changed = slots.filter((u) => u.was).map(part);
  const extra = list.filter((u) => !u.slot).map((u) => u.value);
  const end = (s) => (/[.!?…]$/.test(s) ? s : `${s}.`); // the writer's own words may already end with a mark; never "..", never a full stop after "?"
  const bits = [];
  if (added.length) bits.push(end(`Added: ${added.join('; ')}`));
  if (changed.length) bits.push(end(`Changed: ${changed.join('; ')}`));
  if (extra.length) bits.push(end(`Noted under "Also": ${extra.join('; ')}`));
  if (!bits.length) bits.push("I didn't find anything new to record in that.");
  return `${bits.join(' ')} Anything else, or shall I keep it?`;
}
