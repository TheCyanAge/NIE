import { clip } from '../util/text.js';

/**
 * Idea templates may mention the writer's own material through slots: {who}, {place}, {topic}, {theme}
 * ({Who}… capitalises the first letter). Slots resolve from THIS project's working premise only, and fall back to
 * neutral phrases, so a template must read correctly both ways ("the detective" and "your main character").
 */

export const SLOT_NAMES = ['who', 'place', 'topic', 'theme'];
export const FALLBACK_SLOTS = Object.freeze({ who: 'your main character', place: 'your setting', topic: 'your topic', theme: 'your central theme' });

/** Realistic values, used by tests to prove templates stay grammatical with real project material. */
export const SAMPLE_SLOTS = Object.freeze({ who: 'the detective', place: 'the theatre', topic: 'how small towns decide who belongs', theme: 'loneliness' });

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function nounPhrase(c) {
  const s = String(c).trim();
  if (!s) return '';
  if (/^(?:the|a|an|your|his|her|their|this|that)\s/i.test(s)) return s;
  if (/^[A-Z]/.test(s)) return s; // a name
  return `the ${s}`;
}

/** @returns {{who:string, place:string, topic:string, theme:string}} */
export function slotsFor(project, message = '') {
  const wp = project?.conversation?.workingPremise ?? {};
  const who = nounPhrase(wp.characters?.[0] ?? project?.memory?.characters?.[0]?.name ?? '') || FALLBACK_SLOTS.who;
  const place = nounPhrase(wp.settings?.[0] ?? '') || FALLBACK_SLOTS.place;
  const theme = wp.themes?.[0] || project?.memory?.themes?.[0] || FALLBACK_SLOTS.theme;
  let topic = FALLBACK_SLOTS.topic;
  const m = `${message}\n${wp.summary ?? ''}`.match(/\babout\s+([^.?!,;\n]{3,70})/i);
  if (m) topic = clip(m[1].trim().split(/\s+/).slice(0, 8).join(' '), 60);
  return { who, place, topic, theme: String(theme) };
}

/** Replace slots in a template. Unknown slots are left alone so tests can catch typos. */
export function fillSlots(template, slots = FALLBACK_SLOTS) {
  return String(template).replace(/\{(who|place|topic|theme)\}/gi, (full, name) => {
    const v = slots[name.toLowerCase()] ?? FALLBACK_SLOTS[name.toLowerCase()];
    return name[0] === name[0].toUpperCase() ? cap(v) : v;
  });
}
