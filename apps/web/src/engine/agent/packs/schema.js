import { STOPWORDS, WORD_RE, stem } from '../../util/text.js';
import { isPraiseOpener, isStockQuestion, similarity } from '../../orchestrator/variety.js';

/**
 * What NIE wants to understand about a writer's idea, and the questions it can ask to find out, are DATA: one pack per kind of project
 * (story, character, world, article, essay & memoir, poem, script, other), plus add-on packs for forms (a song, a picture book, a speech...) and genres
 * (a locked-room mystery, a space opera...). This file defines the shape of that data and checks it, so the packs can be written by many hands and still
 * behave the same way: every question is ONE question about the writer's own project, in plain words, never praise, never a stock "what do you think?",
 * and it still reads correctly when NIE knows nothing yet (the placeholders fall back to neutral phrases).
 *
 *   slot:     { id, label, core, weight, hint, after, next, memory?, questions: [{ text, type }] }
 *   kind pack: { kind, intro, noun, slots }                         (8 packs; `slots` has at least 5 core ones)
 *   add-on:    { id, label, match: [keywords], baseKinds?, add: [slot...], drop?: [slotId...] }   (forms and genres)
 *
 * NIE never writes the writer's text (CLAUDE.md rule 1): a question may ask what something is or means, never to draft it.
 */

export const KINDS = Object.freeze(['story', 'character', 'world', 'article', 'essay', 'poem', 'script', 'other']);
/** Where a kept idea files a slot's value in the project's memory (characters, themes, motifs; `setting` becomes part of the working premise). Optional. */
export const MEMORY_KINDS = Object.freeze(['character', 'theme', 'motif', 'setting']);
export const QUESTION_TYPES = Object.freeze(['open', 'either', 'whatif', 'probe', 'reflect', 'concrete', 'constraint', 'reader', 'contrast', 'scale']);

/** Placeholders a question may use: the writer's own material when NIE knows it, otherwise a neutral phrase. [fallback, a realistic sample for tests] */
export const PLACEHOLDERS = Object.freeze({
  who: ['your main character', 'Mara'],
  place: ['your setting', 'the harbour town'],
  thing: ['your idea', 'the drowned bell'],
  want: ['what they want', 'to find her brother'],
  other: ['whoever stands in their way', 'Corin'],
  genre: ['your genre', 'cozy mystery'],
  kind: ['project', 'novel'],
  theme: ['your theme', 'forgiveness'],
});
export const fallbackValues = () => Object.fromEntries(Object.entries(PLACEHOLDERS).map(([k, v]) => [k, v[0]]));
export const sampleValues = () => Object.fromEntries(Object.entries(PLACEHOLDERS).map(([k, v]) => [k, v[1]]));

const SLOT_ID = /^[a-z][a-z0-9-]{1,30}$/;
const PLACEHOLDER = /\{([a-z]+)\}/g;

/** Fill a question's placeholders. Unknown values fall back to the neutral phrase; a placeholder that opens the sentence is capitalised. */
export function fillQuestion(text, values = {}) {
  const fb = fallbackValues();
  const out = String(text).replace(PLACEHOLDER, (_, name) => String(values[name] ?? fb[name] ?? `{${name}}`));
  return out.charAt(0).toUpperCase() + out.slice(1);
}

const contentStems = (s) => (String(s).match(WORD_RE) ?? []).map((w) => w.toLowerCase()).filter((w) => w.length > 2 && !STOPWORDS.has(w)).map(stem);

/** @returns {string[]} what is wrong with one question (empty when it is fine) */
export function questionProblems(q, { min = 0 } = {}) {
  const out = [];
  const text = q?.text;
  if (typeof text !== 'string') return ['text is not a string'];
  if (!QUESTION_TYPES.includes(q.type)) out.push(`unknown type "${q.type}"`);
  for (const m of text.matchAll(PLACEHOLDER)) if (!(m[1] in PLACEHOLDERS)) out.push(`unknown placeholder {${m[1]}}`);
  const plain = fillQuestion(text, fallbackValues());
  const sample = fillQuestion(text, sampleValues());
  for (const [label, s] of [['fallback', plain], ['sample', sample]]) {
    if (/\s{2}|\s[?,.]|\bthe the\b|\ba a\b|\byour your\b|\bthey they\b/i.test(s)) out.push(`reads badly with the ${label} values: "${s}"`);
    if (!/\?$/.test(s)) out.push('does not end with a question mark');
    if ((s.match(/\?/g) ?? []).length !== 1) out.push('must be exactly one question');
    if (/\n/.test(s)) out.push('has a line break');
    if (/["“”`]/.test(s)) out.push('has quotation marks (NIE never puts words in a writer\'s mouth)');
    const n = (s.match(WORD_RE) ?? []).length;
    if (n < 5 || n > 32) out.push(`${n} words (want 5 to 32)`);
    if (isPraiseOpener(s.split(/(?<=[.!?])\s+/)[0] ?? s)) out.push('opens with praise');
  }
  if (isStockQuestion(plain)) out.push('is a stock steering question');
  if (/^\s*(?:write|draft|compose|rewrite|continue)\b/i.test(text)) out.push('asks the writer to produce text instead of asking about the idea');
  if (/\b(?:the|a|an)\s*$/i.test(text.replace(/\?$/, ''))) out.push('ends in an article');
  if (min && text.length < min) out.push('too short');
  return out;
}

/** @returns {string[]} problems with one slot (empty when fine). `known` = ids a slot may point to with `after`/`next`. */
export function slotProblems(slot, { known = new Set(), minQuestions = 8, minTypes = 4 } = {}) {
  const out = [];
  const where = `slot ${slot?.id}`;
  if (!SLOT_ID.test(slot?.id ?? '')) out.push(`${where}: bad id`);
  if (typeof slot?.label !== 'string' || slot.label.length < 2 || slot.label.length > 40) out.push(`${where}: label must be 2-40 characters`);
  if (typeof slot?.hint !== 'string' || slot.hint.length < 15 || slot.hint.length > 160) out.push(`${where}: hint must be 15-160 characters (it tells the model what the slot means)`);
  if (typeof slot?.core !== 'boolean') out.push(`${where}: core must be true or false`);
  if (![1, 2, 3].includes(slot?.weight)) out.push(`${where}: weight must be 1, 2 or 3`);
  if (slot?.memory !== undefined && !MEMORY_KINDS.includes(slot.memory)) out.push(`${where}: memory must be one of ${MEMORY_KINDS.join(', ')} (where a kept idea files this slot in project memory)`);
  for (const k of ['after', 'next']) {
    if (!Array.isArray(slot?.[k])) out.push(`${where}: ${k} must be an array`);
    else for (const id of slot[k]) if (!known.has(id)) out.push(`${where}: ${k} points at unknown slot "${id}"`);
  }
  const qs = slot?.questions;
  if (!Array.isArray(qs) || qs.length < minQuestions) out.push(`${where}: needs at least ${minQuestions} questions (has ${qs?.length ?? 0})`);
  else {
    const seen = new Set();
    qs.forEach((q, i) => {
      for (const p of questionProblems(q)) out.push(`${where} question ${i + 1}: ${p}`);
      const key = String(q?.text).toLowerCase();
      if (seen.has(key)) out.push(`${where} question ${i + 1}: duplicate`);
      seen.add(key);
    });
    const types = new Set(qs.map((q) => q.type));
    if (types.size < minTypes) out.push(`${where}: uses only ${types.size} kinds of question (want ${minTypes}+: ${QUESTION_TYPES.join(', ')})`);
    // genuinely different questions, not one question reworded
    for (let a = 0; a < qs.length; a++) {
      for (let b = a + 1; b < qs.length; b++) {
        const sa = contentStems(qs[a].text);
        const sb = contentStems(qs[b].text);
        const shared = sa.filter((x) => sb.includes(x)).length;
        if (shared / Math.max(1, Math.min(sa.length, sb.length)) >= 0.8 && similarity(fillQuestion(qs[a].text), fillQuestion(qs[b].text)) >= 0.6) out.push(`${where}: questions ${a + 1} and ${b + 1} are the same question reworded`);
      }
    }
  }
  return out;
}

/** @returns {string[]} problems with a kind pack */
export function packProblems(pack) {
  const out = [];
  if (!KINDS.includes(pack?.kind)) return [`unknown kind "${pack?.kind}"`];
  if (typeof pack.intro !== 'string' || !pack.intro) out.push('intro missing');
  if (typeof pack.noun !== 'string' || !pack.noun) out.push('noun missing');
  const slots = pack.slots;
  if (!Array.isArray(slots) || slots.length < 8 || slots.length > 24) return [...out, `needs 8 to 24 slots (has ${slots?.length ?? 0})`];
  const ids = slots.map((s) => s.id);
  if (new Set(ids).size !== ids.length) out.push('duplicate slot ids');
  const known = new Set(ids);
  if (slots.filter((s) => s.core).length < 5) out.push('needs at least 5 core slots');
  if (slots.filter((s) => s.core && s.after.length === 0).length < 1) out.push('needs at least one core slot with no prerequisites to start from');
  for (const s of slots) out.push(...slotProblems(s, { known }));
  return out;
}

/** @returns {string[]} problems with an add-on pack (a form or a genre) */
export function addonProblems(a, { baseSlotIds = new Set() } = {}) {
  const out = [];
  if (!/^[a-z][a-z0-9-]{1,40}$/.test(a?.id ?? '')) out.push(`add-on: bad id "${a?.id}"`);
  const where = `add-on ${a?.id}`;
  if (typeof a?.label !== 'string' || !a.label) out.push(`${where}: label missing`);
  if (!Array.isArray(a?.match) || a.match.length < 2 || a.match.some((m) => typeof m !== 'string' || m.length < 3 || m !== m.toLowerCase())) out.push(`${where}: match needs 2+ lowercase keywords (3+ characters)`);
  if (a?.baseKinds && (!Array.isArray(a.baseKinds) || a.baseKinds.some((k) => !KINDS.includes(k)))) out.push(`${where}: baseKinds must be kinds`);
  const add = a?.add;
  if (!Array.isArray(add) || add.length < 2 || add.length > 8) return [...out, `${where}: needs 2 to 8 added slots`];
  const known = new Set([...baseSlotIds, ...add.map((s) => s.id)]);
  if (new Set(add.map((s) => s.id)).size !== add.length) out.push(`${where}: duplicate slot ids`);
  for (const s of add) out.push(...slotProblems(s, { known, minQuestions: 6, minTypes: 3 }));
  if (a.drop && (!Array.isArray(a.drop) || a.drop.some((id) => !baseSlotIds.has(id)))) out.push(`${where}: drop lists slots that do not exist in the base pack`);
  return out;
}
