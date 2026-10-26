import { similarity } from '../orchestrator/variety.js';
import { fnv1a } from '../util/text.js';
import { pickQuestion } from './ask.js';
import { changedSinceCommit } from './commit.js';
import { slotsFor } from './detect.js';
import { askable, grasp } from './sheet.js';
import { filledIds } from './state.js';

/**
 * The planner: WHEN NIE asks, WHICH slot, and when it offers to keep the idea. It is code, not the model: the model only words the reply.
 * It asks at most one question a reply, on some turns only (a gap that varies, like a person), never one already asked, and it never mutates its input.
 *
 *   info: { act: 'info'|'answer'|'question'|'ideas'|'feedback'|'craft'|'chat', updated: slotIds, words, signalsDone }
 *   -> { act: 'ask'|'reflect'|'offer'|'serve', slot?, question?, reason, partial?, alsoAsk?, state }
 */

const hash = (...parts) => parseInt(fnv1a(parts.join('|')), 16);
/** Gaps (in turns) between questions. The mean is 2.3, so about 43% of turns ask; a seeded pick from here is the "varying, like a person". */
export const GAP_PATTERN = Object.freeze([1, 2, 3, 2, 3, 2, 2, 3, 2, 3]);
const RECENT_TURNS = 8; // a slot asked this lately is not asked again
const OFFER_COOL_OFF = 4; // after "not yet", this many turns before NIE offers again
const SERVING = new Set(['question', 'ideas', 'feedback', 'craft']);
const EASY_WORDS = 3;
const LONG_WORDS = 40;

/** Six ways to ask what the writer is making. Each is one question that names no one's project, and none is close to another. */
export const KIND_QUESTIONS = Object.freeze([
  { text: 'What are you making here: a story, a poem, an article, a script, or something else?', type: 'either' },
  { text: 'Is this fiction, nonfiction, a poem, or a script, or are you still deciding?', type: 'either' },
  { text: 'Before we go further, what form do you see this taking?', type: 'open' },
  { text: 'Where do you picture this ending up: on a page, a stage, a screen, or a speaker?', type: 'either' },
  { text: 'What would you call this when you describe it to a friend: a novel, a play, a song, a column?', type: 'concrete' },
  { text: 'Is this meant to tell a story, make an argument, capture a feeling, or something else entirely?', type: 'either' },
]);

/** One of the built-in "what are you making?" questions, never one (or one close to one) already asked. Null when they are used up. */
export function pickKindQuestion({ state, seed = '' }) {
  const asked = state.asked.map((a) => a.text);
  const pool = KIND_QUESTIONS.filter((q) => !asked.some((a) => a === q.text || similarity(a, q.text) >= 0.6));
  if (!pool.length) return null;
  const q = pool[hash(seed, 'kind', state.turn, asked.length) % pool.length];
  return { text: q.text, type: q.type, slot: null };
}

/**
 * How many turns NIE waits after its last question. Seeded by the turn of that question, so it cycles unevenly but the same way for the same history.
 * A long, detailed message (40+ words: the writer is engaged) waits one turn less; a very short one (3 words or fewer: "idk") one more.
 * If the last two questions came on consecutive turns the next waits at least two, so there are never three questions in a row.
 */
export function gapAfter(state, seed, words = 10) {
  const last = state.asked.at(-1)?.turn ?? 0;
  let gap = GAP_PATTERN[hash(seed, last) % GAP_PATTERN.length];
  if (words >= LONG_WORDS) gap -= 1;
  else if (words <= EASY_WORDS) gap += 1;
  gap = Math.min(4, Math.max(1, gap));
  const a = state.asked.at(-1)?.turn;
  const b = state.asked.at(-2)?.turn;
  return a != null && b != null && a - b <= 1 ? Math.max(gap, 2) : gap;
}

const skippedCount = (state, slot) => state.asked.filter((a) => a.slot === slot && a.skipped).length;

/** The slot to ask about and its question: a slot that follows from what was just filled, then core, then the rest; null when nothing can be asked. */
function chooseSlot(state, info, ctx, seed, easy) {
  const slots = slotsFor(state, ctx);
  const recent = new Set(state.asked.filter((a) => a.slot && state.turn - a.turn < RECENT_TURNS).map((a) => a.slot));
  // a slot the writer has passed over twice is not asked again, and it no longer holds back the slots that follow it (else one "idk" would end the interview)
  const passed = new Set(slots.filter((s) => skippedCount(state, s.id) >= 2).map((s) => s.id));
  const ok = askable(state, ctx, slots, { exclude: new Set([...recent, ...passed]), passed });
  const follow = [];
  for (const id of [...info.updated].reverse()) {
    for (const next of slots.find((s) => s.id === id)?.next ?? []) {
      const s = ok.find((x) => x.id === next);
      if (s && !follow.includes(s)) follow.push(s);
    }
  }
  follow.sort((a, b) => Number(b.core) - Number(a.core)); // stable: core first, then the order they follow
  const rest = ok.filter((s) => !follow.includes(s));
  for (const s of [...follow, ...rest.filter((x) => x.core), ...rest.filter((x) => !x.core)]) {
    const question = pickQuestion({ state, slotId: s.id, ctx, seed, easy });
    if (question) return { slot: s.id, question, reason: follow.includes(s) ? 'follows-up' : s.core ? 'core' : 'open' };
  }
  return null;
}

/** @returns {{ act: string, slot?: string|null, question?: object, reason: string, partial?: boolean, alsoAsk?: boolean, easy?: boolean, state: object }} */
export function planTurn({ state, info = {}, ctx, seed = '' }) {
  const inf = { act: 'info', updated: [], words: 0, signalsDone: false, ...info };
  const telling = inf.act === 'info' || inf.act === 'answer';
  const serving = SERVING.has(inf.act);
  const st = { ...state, asked: state.asked.map((a) => ({ ...a })) };

  // the question NIE asked last time: answered if its slot was just filled, otherwise the writer moved on (skipped)
  if (st.pending?.kind === 'question' && inf.act !== 'chat') {
    const p = st.pending;
    const answered = p.slot === null ? Boolean(st.kind) : inf.updated.includes(p.slot);
    const at = st.asked.findLastIndex((a) => a.text === p.text && a.slot === p.slot && !a.answered && !a.skipped);
    if (at >= 0) st.asked[at] = { ...st.asked[at], answered, skipped: !answered };
    st.pending = null;
  }
  if (telling) {
    st.sinceAsk += 1;
    st.sinceOffer += 1;
  }

  // keeping the idea: when NIE grasps it (and has not just been told "not yet"), or when the writer says they are done
  const g = grasp(st, ctx);
  const filled = filledIds(st).length;
  const offerPending = st.pending?.kind === 'offer';
  const coolEnough = st.declinedAt == null || st.turn - st.declinedAt >= OFFER_COOL_OFF;
  // an idea that was kept and has not changed since is not offered again ("that's it" after a keep, or a few more chat turns, would only repeat the recap)
  const worthOffering = changedSinceCommit(st, ctx);
  const byGrasp = telling && st.mode !== 'quiet' && g.ready && coolEnough && st.sinceOffer >= OFFER_COOL_OFF && worthOffering;
  const byDone = inf.signalsDone && filled >= 2 && !serving && worthOffering;
  if (!offerPending && (byGrasp || byDone)) {
    return { act: 'offer', slot: null, reason: byDone ? 'done' : 'ready', partial: !g.ready, state: { ...st, pending: { kind: 'offer', turn: st.turn, partial: !g.ready }, sinceOffer: 0 } };
  }
  if (offerPending) return { act: serving ? 'serve' : 'reflect', slot: null, reason: 'offer-pending', state: st };

  const easy = telling && inf.words <= EASY_WORDS;
  if (serving) {
    // never interview on a turn where the writer asked NIE something; interview mode answers first, then asks one thing
    if (st.mode === 'interview') {
      const pick = chooseSlot(st, inf, ctx, seed, false);
      if (pick) return { act: 'serve', alsoAsk: true, slot: pick.slot, question: pick.question, reason: 'interview', state: st };
    }
    return { act: 'serve', slot: null, reason: inf.act, state: st };
  }
  if (!telling) return { act: 'reflect', slot: null, reason: 'chat', state: st };
  if (st.mode === 'quiet') return { act: 'reflect', slot: null, reason: 'quiet', state: st };

  const askNow = st.mode === 'interview' || st.asked.length === 0 || st.sinceAsk >= gapAfter(st, seed, inf.words);
  if (!askNow) return { act: 'reflect', slot: null, reason: 'gap', state: st };

  const kindTries = st.asked.filter((a) => a.slot === null).length;
  // (asked once, and only while the idea is young: measured on the real model, "what are you making: a novel, a play, a documentary...?" came back in the middle of a conversation about a flooded city)
  if (!st.kind && kindTries < 1 && st.turn <= 2) {
    const question = pickKindQuestion({ state: st, seed });
    if (question) return { act: 'ask', slot: null, question, reason: 'kind', easy, state: st };
  }
  const pick = chooseSlot(st, inf, ctx, seed, easy);
  if (!pick) return { act: 'reflect', slot: null, reason: 'nothing-to-ask', state: st };
  return { act: 'ask', slot: pick.slot, question: pick.question, reason: st.mode === 'interview' ? 'interview' : pick.reason, first: st.asked.length === 0, easy, state: st };
}
