import { clip, fnv1a } from '../util/text.js';
import { squash } from './state.js';

/**
 * What NIE says by itself, with no model, when the writer has just told it something: a short acknowledgement that points at what was recorded, in the
 * writer's own words (or just the name of the part), and then the planned question is added to it (ask.js#enforceReply). It is commentary about the sheet,
 * never the writer's manuscript and never praise; and it varies with the turn, so two turns in a row never open the same way.
 */

const WITH_VALUE = [
  (l, v) => `Got it, here's what I have for ${l}: ${v}.`,
  (l, v) => `Okay. ${cap(l)}: ${v}.`,
  (l, v) => `That helps with ${l}: ${v}.`,
  (l, v) => `Noted under ${l}: ${v}.`,
  (l, v) => `I've got ${l} as: ${v}.`,
];
const LABEL_ONLY = [
  (l) => `Got it. That goes under ${l}.`,
  (l) => `Okay, I've noted that under ${l}.`,
  (l) => `That tells me something about ${l}. I've written it down.`,
  (l) => `Noted. That is ${l}.`,
];
const SEVERAL = [
  (a, b) => `Got it. I've noted ${a} and ${b}.`,
  (a, b) => `Okay, that covers ${a} and ${b}.`,
  (a, b) => `Noted: ${a}, and ${b}.`,
];
const NOTHING = ['Okay.', "I'm following.", 'Got it.', 'Mm, okay.', 'Right, I have that.'];
const NUDGE = [
  "Tell me more whenever you're ready.",
  "Keep going; I'm keeping track.",
  'Say more about any part of it.',
  "Take it wherever it goes, and I'll follow.",
  'Whatever comes next, I am listening.',
];

// A different line every turn: the choice starts somewhere that depends on the idea, then moves on by one each turn, so two turns in a row never use the same line.
const rot = (list, seed, turn) => list[(parseInt(fnv1a(String(seed)), 16) + (Number(turn) || 0)) % list.length];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const plain = (v) => squash(v).replace(/[\s.!?;,]+$/, '');
const lower = (label) => squash(label).replace(/^the\s+/i, '').toLowerCase();

/**
 * @param {{ turn?: number, plan: object, shown: { slot: string|null, label?: string, value: string }[], seed?: string }} args
 *   `shown` = what this turn recorded (the writer's words per part, or a detail under "Also").
 * @returns {string}
 */
export function acknowledge({ plan, shown = [], seed = '', turn = 0 } = {}) {
  const parts = shown.filter((s) => s && s.label && s.value);
  let line;
  if (parts.length >= 2) {
    line = rot(SEVERAL, seed, turn)(lower(parts[0].label), lower(parts[1].label));
  } else if (parts.length === 1) {
    const v = plain(parts[0].value);
    line = v.length <= 110 ? rot(WITH_VALUE, seed, turn)(lower(parts[0].label), clip(v, 110)) : rot(LABEL_ONLY, seed, turn)(lower(parts[0].label));
  } else if (shown.length) {
    line = rot(['Noted.', 'I have that down.', 'Okay, I have that as a detail.'], seed, turn);
  } else {
    line = rot(NOTHING, seed, turn);
  }
  // a turn that asks nothing still gives the writer somewhere to go, about half the time
  if (plan?.act === 'reflect' && plan.reason !== 'quiet' && (Number(turn) || 0) % 2 === 0) line += ` ${rot(NUDGE, seed, turn)}`;
  return line;
}
