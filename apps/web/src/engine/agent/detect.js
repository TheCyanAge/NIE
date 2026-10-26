import { detectKind } from '../brainstorm/lenses.js';
import { KINDS } from './packs/schema.js';
import { LIMITS, getSlot, isSlotId, squash } from './state.js';

/**
 * Detecting what the writer is making (a kind, a form such as a sonnet, genres such as a cozy mystery) from their own words, and the slot list
 * that follows from it. Pure, deterministic and fast: it runs on every message.
 *
 * CHOICE (CORE.md is silent on conflicts): an explicit `kindHint` from the UI always wins; otherwise the kind comes from the writer's words
 * (`detectKind`), otherwise from the first matched form or genre that names a base kind. An add-on only applies when its `baseKinds` include
 * the kind, so "a song about a lighthouse story" does not bolt song slots onto a story.
 */

const MAX_TEXT = 6000;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cache = new Map();
/** A keyword that starts with one of these verbs matches the verb in any of its forms. */
const VERB_FORMS = { write: 'write|writes|writing|wrote|written', give: 'give|gives|giving|gave', make: 'make|makes|making|made' }; // (not "keep a diary": a character who keeps one is not the writer's form)

/** A keyword as a whole word or phrase, any run of spaces, with a plural ("sonnets"). Compiled once, with its first word for a cheap "could this even be here?" test. */
function keywordRe(keyword) {
  let k = cache.get(keyword);
  if (!k) {
    const words = keyword.trim().split(/\s+/);
    const verb = VERB_FORMS[words[0].toLowerCase()];
    const body = escapeRe(words.slice(verb ? 1 : 0).join(' ')).replace(/\s+/g, '\\s+').replace(/-/g, '[-\\s]?'); // "picture-book" also matches "picture book"
    const lead = verb ? `(?:${verb})\\s+` : ''; // "write a speech" is also "writing a speech" and "wrote a speech"
    k = { re: new RegExp(`(?<![\\p{L}\\p{N}])${lead}${body}(?:e?s)?(?![\\p{L}\\p{N}])`, 'iu'), first: verb ? '' : keyword.trim().toLowerCase().split(/[\s-]+/)[0] };
    if (cache.size > 4000) cache.clear();
    cache.set(keyword, k);
  }
  return k;
}

/** Add-ons whose keywords occur in the text, best first: the longest matching keyword wins, then more keywords, then the order in the pack. */
function rank(addons, text) {
  const hits = [];
  const lower = text.toLowerCase();
  (Array.isArray(addons) ? addons : []).forEach((addon, order) => {
    if (!addon || typeof addon.id !== 'string' || !Array.isArray(addon.match)) return;
    let best = 0;
    let count = 0;
    for (const kw of addon.match) {
      if (typeof kw !== 'string' || kw.length < 3) continue;
      const { re, first } = keywordRe(kw);
      if (first && !lower.includes(first)) continue; // most keywords are nowhere in a message; skip the regex for those
      if (re.test(text)) {
        count++;
        best = Math.max(best, kw.length);
      }
    }
    if (best) hits.push({ addon, best, count, order });
  });
  return hits.sort((a, b) => b.best - a.best || b.count - a.count || a.order - b.order);
}

export const validKind = (k) => (KINDS.includes(k) ? k : null);
const fits = (addon, kind) => !kind || !Array.isArray(addon.baseKinds) || !addon.baseKinds.length || addon.baseKinds.includes(kind);

// Someone doing something, as a story premise says it: "a girl who can hear the dead", "a retired surgeon who lost her license", "my protagonist is Marta", "the conductor vanishes between two stations".
// Only when nothing else names what is being made (an article, a poem, a script... are found first), and only for a message long enough to be a premise.
const STORY_SHAPE = /\b(?:a|an|the)\s+(?:[\w'-]+\s+){0,3}?[\w'-]+\s+(?:who|whose)\s+(?:[\w'-]+\s+){0,2}?(?:can|could|has|had|is|was|lost|forges?|forged|hears?|finds?|found|wants?|must|never|keeps?|hides?|steals?|stole|sees?|knows?|discovers?|vanish\w*|disappear\w*|dies|died|returns?|escapes?)\b|\b(?:my|the)\s+(?:protagonist|main character|hero|heroine|villain|narrator|detective)\s+(?:is|was)\b|\b(?:a|an|the)\s+(?:[\w'-]+\s+){0,2}?(?:vanish|disappear)\w*\s+(?:between|from|on|in|at|after)\b/i;

/** @returns {{ kind: string|null, form: string|null, genres: string[] }} */
export function detectProject(text, { packs, kindHint = null } = {}) {
  const t = String(text ?? '').slice(0, MAX_TEXT);
  const forms = rank(packs?.forms, t);
  const genres = rank(packs?.genres, t);
  let kind = validKind(kindHint) ?? detectKind(t);
  if (!kind) kind = forms[0]?.addon.baseKinds?.[0] ?? genres[0]?.addon.baseKinds?.[0] ?? null; // a "sonnet" is a poem
  if (!kind && STORY_SHAPE.test(t)) kind = 'story'; // "a lighthouse keeper who forges tide tables" is a story; asking "what are you making: a story, a poem, an article...?" right after it reads as a form
  return {
    kind,
    form: forms.find((h) => fits(h.addon, kind))?.addon.id ?? null,
    genres: genres.filter((h) => fits(h.addon, kind)).slice(0, LIMITS.genres).map((h) => h.addon.id),
  };
}

const byId = (list, id) => (Array.isArray(list) ? list.find((a) => a?.id === id) ?? null : null);

/** The add-on packs a state points at (ids that no longer exist in `packs`, or are not for this kind, are ignored). */
export function addonsOf(state, ctx) {
  const ok = (a) => a && fits(a, state.kind);
  const form = byId(ctx?.packs?.forms, state.form);
  return { form: ok(form) ? form : null, genres: (state.genres ?? []).map((id) => byId(ctx?.packs?.genres, id)).filter(ok) };
}

/**
 * The ordered slot list for this idea: the kind pack's slots (the 'other' pack when the kind is not known yet), minus what the form and genres drop,
 * plus the slots they add, each inserted right after the last of the slots it follows (`after`) that is in the list, or at the end.
 * Slots with an invalid id are ignored; a later slot with a repeated id is ignored.
 */
export function slotsFor(state, ctx) {
  const kinds = ctx?.packs?.kinds ?? {};
  const pack = kinds[state?.kind ?? 'other'] ?? kinds.other ?? null;
  const list = [];
  const seen = new Set();
  const add = (slot, at = list.length) => {
    if (!slot || !isSlotId(slot.id) || seen.has(slot.id)) return;
    seen.add(slot.id);
    list.splice(at, 0, slot);
  };
  for (const s of pack?.slots ?? []) add(s);
  const { form, genres } = addonsOf(state ?? {}, ctx);
  for (const addon of [form, ...genres]) {
    if (!addon) continue;
    for (const id of addon.drop ?? []) {
      const i = list.findIndex((s) => s.id === id);
      if (i >= 0) {
        list.splice(i, 1);
        seen.delete(id);
      }
    }
  }
  for (const addon of [form, ...genres]) {
    if (!addon) continue;
    const mine = new Set();
    for (const slot of addon.add ?? []) {
      let at = list.length;
      const anchors = (slot.after ?? []).map((id) => list.findIndex((s) => s.id === id)).filter((i) => i >= 0);
      if (anchors.length) {
        at = Math.max(...anchors) + 1;
        while (at < list.length && mine.has(list[at].id)) at++; // keep an add-on's own slots in the order it listed them
      }
      add(slot, at);
      if (seen.has(slot.id)) mine.add(slot.id);
    }
  }
  return list;
}

/**
 * Fold a detection into the sheet. The kind is sticky (the first detection stays) unless `hinted` or the kind is only 'other' ("nothing fits yet", which
 * a clearer description may replace); a form is set once; genres accumulate to two.
 * Values recorded for a slot the idea no longer has (the kind changed) are not lost: they move to the "Also" details.
 * @returns {{ state: object, changed: boolean }}
 */
export function applyDetection(state, det, ctx, { hinted = false } = {}) {
  const next = { ...state, genres: [...state.genres] };
  if (det?.kind && (hinted || !next.kind || next.kind === 'other')) next.kind = det.kind;
  const fitsNow = (id, list) => {
    const addon = byId(list, id);
    return addon && fits(addon, next.kind);
  };
  if (!next.form && det?.form && fitsNow(det.form, ctx?.packs?.forms)) next.form = det.form;
  for (const g of det?.genres ?? []) {
    if (next.genres.length >= LIMITS.genres) break;
    if (!next.genres.includes(g) && fitsNow(g, ctx?.packs?.genres)) next.genres.push(g);
  }
  if (next.kind !== state.kind) {
    // a new kind: a form or genre that is not for it goes, and so (below) does anything recorded for slots it brought
    if (next.form && !fitsNow(next.form, ctx?.packs?.forms)) next.form = null;
    next.genres = next.genres.filter((g) => fitsNow(g, ctx?.packs?.genres));
  }
  const changed = next.kind !== state.kind || next.form !== state.form || next.genres.join() !== state.genres.join();
  return { state: changed ? reconcile(next, ctx, state) : state, changed };
}

/** Move the values of slots this idea does not have (after a kind change) to the extra details, in the writer's words. */
function reconcile(next, ctx, before) {
  if (next.kind === before.kind && next.form === before.form && next.genres.join() === before.genres.join()) return next;
  const valid = new Set(slotsFor(next, ctx).map((s) => s.id));
  const slots = {};
  const extra = [...next.extra];
  for (const id of Object.keys(next.slots)) {
    const rec = getSlot(next, id);
    if (valid.has(id)) slots[id] = rec;
    else if (rec?.value && !extra.some((e) => e.toLowerCase() === rec.value.toLowerCase())) extra.push(squash(rec.value).slice(0, LIMITS.extraItem));
  }
  return { ...next, slots, extra: extra.slice(-LIMITS.extra) };
}
