import { clip, estimateTokens } from '../util/text.js';
import { slotsFor } from './detect.js';
import { openSlots } from './sheet.js';
import { getSlot, squash } from './state.js';

/**
 * What the model is told on an agent turn: what NIE has recorded in the writer's own words, what is still unknown, the conventions of the genre,
 * the questions already asked, and the one thing to do this turn. Small on purpose (a 3B model has a 4,096-token window and obeys what is nearest
 * the question), and it never asks the model to write the writer's text: it asks for a short reply and at most one question.
 */

export const MAX_BRIEF_TOKENS = 380;

// How much of each part fits, tried in turn until the whole brief is within budget.
const TRIES = [
  { clip: 120, filled: 12, notes: 2, asked: 4, hint: 160, unknown: 6 },
  { clip: 90, filled: 10, notes: 2, asked: 3, hint: 120, unknown: 5 },
  { clip: 70, filled: 8, notes: 1, asked: 2, hint: 90, unknown: 4 },
  { clip: 50, filled: 6, notes: 1, asked: 2, hint: 70, unknown: 3 },
  { clip: 40, filled: 5, notes: 0, asked: 1, hint: 50, unknown: 3 },
  { clip: 30, filled: 4, notes: 0, asked: 1, hint: 0, unknown: 2 },
];

const trimWords = (s, n) => {
  const w = squash(s).split(' ');
  return w.length <= n ? w.join(' ') : `${w.slice(0, n).join(' ')}…`;
};

// NIE never writes the writer's text (CLAUDE.md rule 1). The plan already decides what this turn is for; this line is the last thing the model reads.
// (It avoids the words write/draft/compose/rewrite on purpose: no instruction in a brief may even mention producing text.)
const KEEP_THEIRS = "Stay with ideas, explanations and questions: their prose, dialogue and lines are theirs alone, so give none of your own.";

// Measured on the real model: asked to "reply to what they said", a 3B model retold the writer's plot with details of its own and rated it ("a compelling premise"),
// in three or four sentences that took 40 seconds to write. What is asked for here is short, specific to something they said, and adds nothing.
const NO_RETELL = "Do not retell their idea, guess what happens next, add any detail of your own, or say how good it is.";

function instruction(plan, slot, hintChars) {
  const about = slot ? `${slot.label}${hintChars ? ` (${clip(squash(slot.hint), hintChars)})` : ''}` : 'what kind of piece they are making';
  const q = plan.question?.text ? ` It should be the kind of question: "${plan.question.text}". Do not copy it; do not ask anything already asked.` : ' Do not ask anything already asked.';
  const ask = `ask exactly ONE question about ${about}. Use their own names and terms; make it specific to THIS project.${q}`;
  if (plan.act === 'ask') return `Reply in at most two short sentences that point at one specific detail they gave. ${NO_RETELL} Then ${ask} ${KEEP_THEIRS}`;
  if (plan.act === 'serve') return `Answer what they asked (or give what they asked for). Do not interview them this turn.${plan.alsoAsk ? ` After answering, ${ask}` : ''} ${KEEP_THEIRS}`;
  if (plan.act === 'reflect' && plan.reason === 'chat') return `Answer them the way a thoughtful person would, in one or two short sentences. Do not ask about the details of their project this turn. ${KEEP_THEIRS}`;
  return `Talk like a collaborator who is listening. In at most three short sentences: first answer what they just said (if they asked something, answer it; if they reacted to your last message, respond to THAT), using their own names and terms and adding no fact to their story; then give ONE suggestion of your own that follows from it, and say it as a suggestion: begin it with "What if", "You could", "Maybe" or "One angle:". A suggestion is an angle, a complication or a possibility, in one sentence, never a line of their story and never stated as if it already happened. Do not retell their idea or say how good it is. Ask no other question. ${KEEP_THEIRS}`;
}

/**
 * @param {{ plan: object, state: object, ctx: object, libraryNotes?: string[] }} args
 * @returns {string} at most 380 estimated tokens
 */
export function briefFor({ plan, state, ctx, libraryNotes = [] }) {
  const slots = slotsFor(state, ctx);
  const slot = plan?.slot ? slots.find((s) => s.id === plan.slot) ?? null : null;
  const recorded = slots.filter((s) => getSlot(state, s.id));
  const unknown = openSlots(state, slots).map((s) => s.label);
  const notes = (state.form || state.genres.length) && Array.isArray(libraryNotes) ? libraryNotes.filter((n) => typeof n === 'string' && n.trim()) : [];
  const asked = state.asked.map((a) => a.text);
  // Nothing recorded and no kind of piece known yet: there is nothing to say about the idea, and listing a generic pack's parts ("What it is, Who it is for") would only mislead.
  const blank = recorded.length === 0 && !state.kind;
  // (a turn that asks nothing is not shown what is still unknown or what was asked: it would only tempt it to interview)
  const asking = plan?.act === 'ask' || plan?.act === 'serve';

  let text = '';
  for (const t of TRIES) {
    const shown = new Set([...recorded].sort((a, b) => getSlot(state, b.id).turn - getSlot(state, a.id).turn).slice(0, t.filled).map((s) => s.id));
    const parts = [];
    if (!blank) parts.push(`What you understand so far (the writer's own words):\n${recorded.filter((s) => shown.has(s.id)).map((s) => `- ${s.label}: ${clip(getSlot(state, s.id).value, t.clip)}`).join('\n') || '- Nothing recorded yet.'}`);
    if (unknown.length && !blank && asking) parts.push(`Not yet known: ${unknown.slice(0, t.unknown).join(', ')}`);
    if (notes.length && t.notes) parts.push(`Conventions to keep in mind:\n${notes.slice(0, t.notes).map((n) => `- ${clip(squash(n), 140)}`).join('\n')}`);
    if (asked.length && asking) parts.push(`Questions you have already asked (do not repeat or reword them):\n${asked.slice(-t.asked).map((q) => `- ${trimWords(q, 25)}`).join('\n')}`);
    parts.push(`This turn:\n${instruction(plan ?? {}, slot, t.hint)}`);
    text = parts.join('\n\n');
    if (estimateTokens(text) <= MAX_BRIEF_TOKENS) return text;
  }
  // the instruction alone is longer than the budget allows (a long bank question): keep the end, which is what the model must do
  const limit = Math.floor(MAX_BRIEF_TOKENS * 3.6);
  return text.length <= limit ? text : `${text.slice(0, 220).trimEnd()}\n…\n${text.slice(text.length - (limit - 230))}`;
}
