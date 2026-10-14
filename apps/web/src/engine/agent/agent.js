import { EXPLICIT_ASK } from '../brainstorm/commands.js';
import { questionsIn, similarity } from '../orchestrator/variety.js';
import { addToBoard } from '../project/board.js';
import { pick } from '../util/text.js';
import { askTerms, enforceReply, groundedComment } from './ask.js';
import { briefFor } from './brief.js';
import { addedText, changedSinceCommit, commitIdea, confirmText, digest, holdText, lastCommitFor, offerChips, recapText, undoCommit } from './commit.js';
import { applyDetection, detectProject, slotsFor, validKind } from './detect.js';
import { extractSlots, isAnswer, isShrug } from './extract.js';
import { planTurn } from './plan.js';
import { acknowledge } from './reply.js';
import { addExtra, clearSlot, describe, grasp, setSlot, startSlot } from './sheet.js';
import { LIMITS, emptyAgentState, filledIds, freshIdea, getSlot, hasContent, sanitizeAgentState, squash, stemList, stemSet, wordsOf } from './state.js';
import { isNewIdea, looksLikeCommand, looksLikeQuestion, looksLikeRequest, opensWithYes, parseKeepCommand, parseOfferReply, parseShelfCommand, parseStyleCommand, signalsDone, startsNewIdeaExplicitly } from './talk.js';

export { parseShelfCommand };

/**
 * The one object the orchestrator talks to. `createAgent({ packs })` binds the content packs; everything else is a function of
 * (project.conversation.agent, the writer's message, a seed, an optional fake or real `chat`), so it is deterministic and works with no model.
 *
 * One turn, in order: a pending offer and the writer's reply; a style command ("stop asking questions"); "keep this idea"; a set-aside idea
 * ("bring back the earlier idea"); a new idea (the old sheet is SHELVED, never lost); otherwise detect what is being made, read what the writer said
 * into the sheet, plan the turn (ask / reflect / offer / serve), and hand back what the model needs (`brief`, `enforce`) and what to remember (`record`).
 *
 * CHOICES where CORE.md is silent (see also the comments at each use):
 *  - handled.kind 'restored' is added for "bring back the earlier idea"; the turn result may carry `note` (the new-idea notice, or, when one message says yes to
 *    the offer AND asks for something else, "Kept. ..." while the rest of the message goes on as an ordinary one: the orchestrator appends `note` to its reply).
 *  - At the offer, only a DETAIL is filed under "Also". A request ("give me twists"), a question, a pasted text, or a pitch for something else drops the offer
 *    and is answered as an ordinary message; "keep going" and "save it for later" hold it; "yes ... and <something else>" keeps the idea first.
 *  - A keep command with fewer than two things recorded is NOT handled (handled: null, no extraction): "remember this" then reaches the existing
 *    single-note Idea Board command, which is what a writer means when nothing has been recorded.
 *  - With no model (`chat` empty) and no kind known, the first question is answered by the built-in "what are you making?" (handled 'asked-kind');
 *    with a model it goes through the usual ask path so the model can acknowledge what the writer said first.
 *  - A message of 400 words or more is a pasted text, not an idea being described: it is served (act 'feedback'), never interviewed or recorded.
 */

const NEW_IDEA_NOTE = 'I\'ve set the earlier idea aside. Say "bring back the earlier idea" to continue it, or "keep the earlier idea" to put it on your Idea Board.';
const PASTE_WORDS = 400;
const MODE_TEXT = {
  interview: [
    'Okay, I\'ll ask about it one question at a time. Say "stop asking questions" whenever you\'ve had enough.',
    'Happy to. I\'ll ask something after each thing you tell me, and you can say "stop asking questions" any time.',
    "Sure, let's go step by step. I'll ask one thing at a time.",
  ],
  quiet: [
    'Understood. I\'ll stop asking questions and work with what you give me. Say "ask me questions" if you want them back.',
    "No more questions from me. Tell me what you'd like and I'll work from that.",
    'Okay, I\'ll hold back the questions. Say "you can ask again" whenever you like.',
  ],
  auto: [
    'Okay, I\'ll ask now and then when it helps. Say "stop asking questions" if it\'s too much.',
    "Sounds good. I'll mix a question in every so often.",
    "Got it. I'll ask now and again, not every time.",
  ],
};
const GO_AHEAD = ['Go ahead, what would you like to add?', 'Sure. What should I add?', "Of course. What's the detail?"];
// readings that mean the writer is asking NIE for something, so a reply to the offer is not a detail to file
const REQUESTING = new Set(['ideas', 'feedback', 'craft', 'write', 'edit', 'about-nie']);
const REOFFER = ['Should I keep it as it is, or is there something to add first?', 'Shall I keep it as it stands, or do you want to add something first?'];
const KIND_CHIPS = [
  { label: 'A story', text: '', send: { ask: 'It is a story.' } },
  { label: 'A poem', text: '', send: { ask: 'It is a poem.' } },
  { label: 'An article', text: '', send: { ask: 'It is an article.' } },
  { label: 'A script', text: '', send: { ask: 'It is a script.' } },
  { label: 'Something else', text: 'It is ' },
  { label: 'Add more details', text: 'Let me add more details: ' },
];
const AFTER_KEPT = [{ label: 'Show my Idea Board', text: '', send: { ask: 'Show my idea board.' } }, { label: 'Add more details', text: 'Let me add more details: ' }];
const AFTER_HELD = [{ label: 'Add more details', text: 'Let me add more details: ' }, { label: 'Keep this idea', text: '', send: { ask: 'Keep this idea.' } }];
const STATES_INTENT = /^\s*i(?:'d| would)?\s+(?:really\s+)?(?:want|like|hope|plan|intend|need)\s+(?:the |my |it |them |this |people |readers? |listeners? |viewers? |everyone |anyone |her |him )[^?]*$/i;
const GREETING = /^\s*(?:hi|hello|hey|yo|thanks|thank you|ok(?:ay)?|cool|nice|great|good (?:morning|afternoon|evening))\b[\s!.,?]*$/i;

/** What the writer is doing this turn (see `reading.task` in understand.js). No reading: a light rule reading. */
function actOf(reading, text, st, words) {
  if (words >= PASTE_WORDS) return 'feedback';
  const answering = () => (st.pending?.kind === 'question' && isAnswer(text, { asked: true }) ? 'answer' : 'info');
  switch (reading?.task) {
    case 'ideas': return 'ideas';
    // (a 3B model sometimes reads "I want the listener to feel proud and sad" as a craft question or a request for feedback: a first-person statement of intent with no
    // question in it is the writer telling NIE about their piece)
    case 'feedback': return STATES_INTENT.test(text) && !looksLikeRequest(text) ? answering() : 'feedback';
    case 'craft': return STATES_INTENT.test(text) && !looksLikeRequest(text) ? answering() : 'craft';
    case 'chat': return 'chat';
    case 'about-nie': case 'write': case 'edit': return 'question'; // declined or answered elsewhere; never recorded
    // (a message the rules plainly read as a request to NIE is served whatever the reading says: it is never filed as part of the idea or interviewed over)
    // (a 3B model reads "What happened to my heroine's brother?" as the writer telling it something, because it says "my heroine": measured in the memory session of the agent lab,
    // where the three questions asked of NIE were filed under "Also" and one was answered with "I have that down". A question is served, never filed as part of the idea.)
    case 'tell': case 'develop': case 'unclear': return looksLikeRequest(text) || looksLikeQuestion(text) ? 'question' : answering();
    default:
      if (looksLikeQuestion(text)) return 'question';
      if (EXPLICIT_ASK.test(text)) return 'ideas';
      if (looksLikeRequest(text)) return 'question';
      return GREETING.test(text) ? 'chat' : answering();
  }
}

/** Remember the question NIE actually asked (the one in the final reply, after enforce), so what is recorded is what the writer saw. */
export function recordAsk(state, plan, reply) {
  if (!(plan?.act === 'ask' || plan?.alsoAsk)) return state;
  const qs = questionsIn(String(reply ?? ''));
  if (!qs.length) return state;
  const bank = plan.question?.text ?? '';
  const chosen = (bank && qs.find((q) => similarity(q, bank) >= 0.85)) || qs.at(-1);
  const text = squash(chosen).slice(0, LIMITS.text);
  const type = bank && similarity(text, bank) >= 0.85 ? plan.question.type ?? null : null;
  const slot = plan.slot ?? null;
  const last = state.asked.at(-1);
  if (last && last.text === text && last.turn === state.turn && state.pending?.kind === 'question') return state; // recording the same reply twice is one question
  return {
    ...state,
    asked: [...state.asked, { slot, text, type, turn: state.turn, answered: false, skipped: false }].slice(-LIMITS.asked),
    pending: { kind: 'question', slot, text, turn: state.turn },
    sinceAsk: 0,
  };
}

/** Everything in `text` is already on the sheet (a slot value or a detail says it): a repeat is not something new to record. */
function alreadyRecorded(state, text) {
  const mine = stemList(text);
  if (!mine.length) return false;
  const held = [...Object.values(state.slots).map((r) => r?.value), ...state.extra];
  return held.some((h) => {
    const have = stemSet(h);
    return mine.filter((x) => have.has(x)).length / mine.length >= 0.9;
  });
}

export function createAgent({ packs, config = {} } = {}) {
  const ctx = { packs: packs ?? { kinds: {}, forms: [], genres: [] }, config };
  const read = (project) => sanitizeAgentState(project?.conversation?.agent);
  const write = (project, st) => {
    if (project) (project.conversation ??= {}).agent = st;
    return st;
  };

  /** Detect what is being made, read the message into the sheet. `via` says how the words arrived. */
  async function learn({ st, text, via, pendingSlot, kindHint, chat, signal }) {
    const hinted = validKind(kindHint);
    let s = applyDetection(st, detectProject(text, { packs: ctx.packs, kindHint: hinted }), ctx, { hinted: Boolean(hinted) }).state;
    const ex = await extractSlots({ message: text, state: s, ctx, chat, pendingSlot, signal });
    const slots = slotsFor(s, ctx);
    const updated = [];
    const shown = [];
    for (const u of ex.updates) {
      const was = getSlot(s, u.slot)?.value;
      const next = setSlot(s, u.slot, u.value, { turn: s.turn, via: u.slot === pendingSlot ? 'answered' : via });
      if (next === s) continue;
      s = next;
      updated.push(u.slot);
      shown.push({ slot: u.slot, label: slots.find((x) => x.id === u.slot)?.label, value: getSlot(s, u.slot).value, ...(was ? { was } : {}) });
    }
    for (const e of ex.extra) {
      const next = addExtra(s, e);
      if (next !== s) {
        s = next;
        shown.push({ slot: null, value: e });
      }
    }
    return { state: s, updated, shown, by: ex.by };
  }

  /** The current sheet as a shelf entry; when the shelf is full the oldest KEPT one goes, and if none is kept the oldest goes to the Idea Board first (never lost). */
  function shelve(project, st) {
    const entry = { kind: st.kind, form: st.form, genres: [...st.genres], slots: { ...st.slots }, extra: [...st.extra], shelvedAt: st.turn, idea: st.idea, turn: st.turn, kept: !changedSinceCommit(st, ctx), asked: st.asked.slice(-LIMITS.shelfAsked).map((a) => ({ ...a })) };
    const shelf = [...st.shelf];
    let note = '';
    if (shelf.length >= LIMITS.shelf) {
      const kept = shelf.findIndex((e) => e.kept);
      if (kept >= 0) shelf.splice(kept, 1);
      else {
        const old = shelf.shift();
        addToBoard(project, { text: digest({ ...emptyAgentState(), ...old }, ctx), kind: old.kind, source: 'writer', note: 'Set aside earlier' });
        note = ' The oldest idea I had set aside is on your Idea Board now, to make room.';
      }
    }
    return { shelf: [...shelf, entry], note };
  }

  const sheetOf = (e) => ({ kind: e.kind, form: e.form, genres: [...e.genres], slots: { ...e.slots }, extra: [...e.extra] });

  async function turn({ project, message, reading = null, chat = null, kindHint = null, recentMessages = [], signal, libraryNotes = [], seed } = {}) {
    let text = squash(String(message ?? '')).slice(0, 8000);
    const sd = String(seed ?? project?.id ?? 'nie');
    let st = read(project);
    let note = '';

    const finish = ({ handled = null, plan, brief = '', state, ack = '', act = null }) => {
      write(project, state);
      const terms = askTerms(state, [...(Array.isArray(recentMessages) ? recentMessages : []), text]);
      return {
        handled,
        plan,
        brief,
        state,
        act,
        grounded: (comment) => groundedComment(comment, { state, ctx, recentMessages: [...(Array.isArray(recentMessages) ? recentMessages : []), text] }).ok, // does a comment stay with what the writer said?
        ack, // what NIE says itself, with no model, to a writer who has just told it something (reply.js); the planned question is added by enforce()
        ...(note ? { note } : {}),
        enforce: (reply) => enforceReply(reply, plan, { state, ctx, askedTexts: state.asked.map((a) => a.text), terms }).text,
        record: (finalReply) => {
          const cur = read(project);
          const next = recordAsk(cur, plan, finalReply);
          if (next !== cur) write(project, next);
        },
      };
    };
    const handle = (state, kind, reply, suggestions = [], extra = {}) => finish({ state, plan: { act: 'serve', slot: null, reason: kind }, handled: { reply, suggestions, kind, ...extra } });
    // keep the idea NOW and let the orchestrator add what happened to its reply (`note`), because the same message also asks for something else
    const keepFirst = (proj, state) => {
      const done = commitIdea(proj, state, ctx);
      note = confirmText(done.result);
      return done.state;
    };
    if (!text) return finish({ state: st, plan: { act: 'reflect', slot: null, reason: 'empty' } });
    const tag = `${sd}|${st.idea}|${st.turn}`;
    let words = wordsOf(text).length;

    // 1. a pending offer and the writer's reply to it (a command, a request, a pasted text or a different idea just drops the offer)
    if (st.pending?.kind === 'offer') {
      if (parseStyleCommand(text) || parseShelfCommand(text) || startsNewIdeaExplicitly(text) || words >= PASTE_WORDS) {
        st = { ...st, pending: null };
      } else {
        const r = parseOfferReply(text);
        if (r.decision === 'yes') {
          const done = commitIdea(project, st, ctx);
          return handle(done.state, 'kept', confirmText(done.result), AFTER_KEPT, { committed: done.result });
        }
        if (r.decision === 'no') return handle({ ...st, pending: null, declinedAt: st.turn, sinceOffer: 0 }, 'held', holdText(tag), AFTER_HELD);
        if (r.decision === 'add') {
          // a detail is the writer telling NIE more about THIS idea. A request ("give me twists", "write a scene"), a question, or a pitch for something else is not
          // a detail: filing it under "Also" would put a request in the writer's idea and swallow it unanswered. It goes on as an ordinary message.
          const notADetail = REQUESTING.has(reading?.task) || looksLikeCommand(r.detail) || looksLikeQuestion(r.detail) || startsNewIdeaExplicitly(r.detail) || isNewIdea(text, st, { recent: recentMessages });
          if (notADetail) {
            st = { ...st, pending: null };
            if (opensWithYes(text)) {
              // "yes keep it and show me the board", "yes keep it. New idea: ...": the yes is answered here, and what comes after it goes on as an ordinary message
              st = keepFirst(project, st);
              text = squash(r.detail).replace(/^(?:and then|then|and|also|plus)\b[,\s]*/i, '');
              words = wordsOf(text).length;
            }
          } else {
            // the detail is the writer's own addition: read it into the sheet; if it fits no slot it is still recorded, under "Also"
            let s = { ...st, turn: st.turn + 1 };
            const got = await learn({ st: s, text: r.detail, via: 'added', pendingSlot: null, kindHint, chat, signal });
            s = got.state;
            let shown = got.shown;
            if (!shown.length && !alreadyRecorded(s, r.detail)) {
              const withExtra = addExtra(s, r.detail);
              if (withExtra !== s) {
                s = withExtra;
                shown = [{ slot: null, value: s.extra.at(-1) }];
              }
            }
            if (!shown.length) s = { ...s, turn: st.turn }; // a repeat of what is already there told NIE nothing new
            const partial = !grasp(s, ctx).ready;
            s = { ...s, pending: { kind: 'offer', turn: s.turn, partial } };
            return handle(s, 'added', addedText(shown, ctx), offerChips(partial));
          }
        } else if (r.wantsToAdd) {
          return handle(st, 'offer', pick(GO_AHEAD, tag), offerChips(st.pending.partial)); // "let me add something": the offer stays open for the detail
        } else if (looksLikeQuestion(text) || looksLikeCommand(text) || st.pending.again) st = { ...st, pending: null, declinedAt: st.turn, sinceOffer: 0 }; // unclear, and a question or the second time: carry on as a normal message
        else return handle({ ...st, pending: { ...st.pending, again: true } }, 'offer', pick(REOFFER, tag), offerChips(st.pending.partial));
      }
    }

    // 2. how the writer wants NIE to ask
    const mode = parseStyleCommand(text);
    if (mode) return handle({ ...st, mode }, 'mode', pick(MODE_TEXT[mode], tag));

    // 3. "keep this idea": the whole sheet, or what there is of it (the caller shows what is recorded and what is missing)
    if (parseKeepCommand(text)) {
      if (filledIds(st).length < 2) return finish({ state: st, plan: { act: 'serve', slot: null, reason: 'keep-without-sheet' } });
      if (grasp(st, ctx).ready) {
        const done = commitIdea(project, st, ctx);
        return handle(done.state, 'kept', confirmText(done.result), AFTER_KEPT, { committed: done.result });
      }
      return handle({ ...st, pending: { kind: 'offer', turn: st.turn, partial: true }, sinceOffer: 0 }, 'offer', recapText(st, ctx, { partial: true }), offerChips(true));
    }

    // 4. the idea set aside earlier, and a new idea
    const shelfCommand = parseShelfCommand(text);
    if (shelfCommand === 'keep') {
      const e = st.shelf.at(-1);
      if (!e) return handle(st, 'restored', "There's no earlier idea set aside right now.");
      const done = commitIdea(project, { ...emptyAgentState(), ...sheetOf(e), idea: e.idea, turn: e.turn, committed: st.committed }, ctx);
      return handle({ ...st, committed: done.state.committed, shelf: st.shelf.slice(0, -1) }, 'kept', confirmText(done.result, { what: 'the earlier idea' }), AFTER_KEPT, { committed: done.result });
    }
    if (shelfCommand === 'restore') {
      const e = st.shelf.at(-1);
      if (!e) return handle(st, 'restored', "There's no earlier idea set aside right now.");
      const rest = { ...st, shelf: st.shelf.slice(0, -1) };
      const shelved = hasContent(st) ? shelve(project, rest) : { shelf: rest.shelf, note: '' };
      const back = { ...emptyAgentState(), ...sheetOf(e), idea: e.idea, turn: e.turn, mode: st.mode, committed: st.committed, shelf: shelved.shelf, asked: (e.asked ?? []).map((a) => ({ ...a })) };
      const first = back.slots[startSlot(slotsFor(back, ctx))?.id]?.value;
      return handle(back, 'restored', `Okay, I've brought back the earlier idea${first ? `: ${first}` : ''}. The one we were on is set aside; say "bring back the earlier idea" again to swap.${shelved.note}`);
    }
    // CHOICE: the overlap test ("12+ words about nothing recorded") only judges a message that TELLS NIE something. A question, a request for ideas, a
    // feedback request and a pasted text are about the idea on the table, whatever words they use, and must never swap the sheet; an explicit marker still does.
    const tells = ['info', 'answer'].includes(actOf(reading, text, st, words));
    if (isNewIdea(text, st, { skipOverlap: st.pending?.kind === 'question' || !tells, recent: recentMessages })) {
      let base = st;
      if (filledIds(st).length + st.extra.length >= 3 && changedSinceCommit(st, ctx)) {
        const shelved = shelve(project, st);
        base = { ...st, shelf: shelved.shelf };
        note = NEW_IDEA_NOTE + shelved.note;
      }
      st = freshIdea(base);
    }

    // 5. an ordinary message: detect, read, plan
    const act = actOf(reading, text, st, words);
    const telling = act === 'info' || act === 'answer';
    const shrug = telling && isShrug(text);
    let s = telling ? { ...st, turn: st.turn + 1 } : st;
    let learned = { updated: [], shown: [] };
    if (telling) {
      const pendingSlot = act === 'answer' && s.pending?.kind === 'question' ? s.pending.slot : null;
      const askedKind = s.pending?.kind === 'question' && s.pending.slot === null;
      learned = await learn({ st: s, text, via: 'said', pendingSlot, kindHint, chat, signal });
      s = learned.state;
      // CHOICE: the writer answered "what are you making?" with something no kind word names ("It is a speech."): that is the 'other' pack, not a second
      // round of the same question. A later, clearer answer replaces 'other' (see applyDetection).
      if (askedKind && !s.kind && words <= 10 && stemList(text).length >= 1 && !looksLikeQuestion(text) && !looksLikeCommand(text)) s = { ...s, kind: 'other' };
      if ((words < 3 || shrug) && !learned.shown.length) s = { ...s, turn: st.turn }; // "ok", "hmm", "I don't know": nothing was told, so it is not a turn that told NIE something
    }
    // a shrug is as short as an answer can be: the next question is an easier one
    const plan = planTurn({ state: s, info: { act, updated: learned.updated, words: shrug ? Math.min(words, 3) : words, signalsDone: signalsDone(text) }, ctx, seed: `${sd}|${s.idea}` });
    s = plan.state;

    if (plan.act === 'offer') return finish({ state: s, plan, handled: { reply: recapText(s, ctx, { partial: plan.partial }), suggestions: offerChips(plan.partial), kind: 'offer' } });
    if (plan.act === 'ask' && plan.reason === 'kind' && typeof chat !== 'function') {
      s = recordAsk(s, plan, plan.question.text);
      return finish({ state: s, plan, act, handled: { reply: plan.question.text, suggestions: KIND_CHIPS, kind: 'asked-kind' } }); // (`act` says whether the writer told NIE something, so the project mind keeps it)
    }
    const ack = telling && plan.act !== 'serve' ? acknowledge({ plan, shown: learned.shown, seed: `${sd}|${s.idea}`, turn: s.turn }) : '';
    return finish({ state: s, plan, act, ack, brief: briefFor({ plan, state: s, ctx, libraryNotes }) });
  }

  return {
    ctx,
    packs: ctx.packs,
    /** The agent state stored in the project (created, empty, when missing). */
    state: (project) => {
      const st = read(project);
      if (project && !project.conversation?.agent) write(project, st);
      return st;
    },
    turn,
    describe: (project) => {
      const st = read(project);
      const last = lastCommitFor(st);
      return { ...describe(st, ctx), canKeep: filledIds(st).length >= 2, everKept: Boolean(last), kept: Boolean(last) && !changedSinceCommit(st, ctx) };
    },
    /** Keep the idea now (the UI's "keep" button). */
    commitNow: (project) => {
      const done = commitIdea(project, read(project), ctx);
      write(project, done.state);
      return { reply: confirmText(done.result), result: done.result, state: done.state };
    },
    /** Take back the last keep: its Idea Board entry and exactly the memory it added. */
    undo: (project) => {
      const done = undoCommit(project, read(project), ctx);
      write(project, done.state);
      return { removed: done.removed, state: done.state };
    },
    setMode: (project, mode) => write(project, sanitizeAgentState({ ...read(project), mode })),
    /** The writer edits what NIE recorded for a part (the panel): their new words replace the old; an empty value is not recorded. */
    edit: (project, id, value) => {
      const st = read(project);
      return write(project, setSlot(st, id, String(value ?? ''), { turn: st.turn, via: 'added' }));
    },
    /** The writer removes what NIE recorded for a part (the panel). */
    clear: (project, id) => write(project, clearSlot(read(project), id)),
    /** The writer removes a detail recorded under "Also". */
    clearExtra: (project, index) => {
      const st = read(project);
      return write(project, { ...st, extra: st.extra.filter((_, i) => i !== index) });
    },
    recordAsk,
  };
}
