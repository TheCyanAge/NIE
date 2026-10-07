import { detectIntent, extractPremiseCues, updateWorkingPremise } from '../intent/intent.js';
import { interpretProfile } from '../profile/interpret.js';
import { answerFromLibrary, forProfile, search } from '../knowledge/index.js';
import { appendMessage } from '../project/memory.js';
import { addToBoard, boardToChat, emptyBrainstorm, ideaId } from '../project/board.js';
import { scan, scanWithModel } from '../analysis/scan.js';
import { composeMessages, ideaRequestBlock, RETRY_TOKEN_LIMIT } from './prompt.js';
import { aboutNieFacts, aboutNieReply, builtinReply, DECLINE_EDIT, DECLINE_WRITE, libraryMissReply, libraryReply } from './builtin.js';
import { guardReply } from './guard.js';
import { applyReading, readingNote, rulesReading, understandMessage } from './understand.js';
import { ideaSuggestions, nextSuggestions, STARTER } from './suggestions.js';
import { ASKS_FOR_IDEAS, WANTS_MORE } from '../brainstorm/commands.js';
import { KIND_IDS, LENSES, LENSES_BY_KIND, detectKind, detectLens, kindLabel } from '../brainstorm/lenses.js';
import { composeDevelopReply, composeIdeaReply, generateIdeas, leadNoun, markShown, parseIdeas, resolveKind } from '../brainstorm/ideas.js';
import { clip, words } from '../util/text.js';

export { STARTER };

// A general question about craft, style, usage, a form/genre or a work (as opposed to talk about the writer's own story).
const GENERAL_Q = /^\s*(?:what(?:'s|\s+is|\s+are|\s+does|\s+do)\b|how\s+(?:do|should|can|would|does)\s+(?:i|you|one|we|a|an|the)\b|how\s+(?:to|is|are)\b|who\s+(?:wrote|is|was|are|were|invented|coined)\b|which\s+(?:is|one|style|form|genre|guide)\b|when\s+(?:do|should|is|does)\b|(?:explain|define|describe|tell\s+me\s+about)\b|(?:is|are)\s+it\b|difference\s+between|should\s+i\s+(?:use|capitali[sz]e|italici[sz]e|hyphenate|spell|write|format|cite)\b)/i;
const STORY_TALK = /\b(?:my|our|his|her|their|the)\s+(?:story|novel|characters?|protagonist|antagonist|villain|hero|heroine|plot|scene|chapter|draft|ending|opening|twist|narrator|manuscript)\b|\b(?:he|she|him|they|them)\b/i;
const LIBRARY_NOTE = "These notes come from NIE's built-in library. When they cover the question, answer from them and say which style guide or source they come from, and mention when practice varies. If they do not cover it, say so plainly. Never invent citations, section numbers, titles, dates or quotations.";
const LIBRARY_MISS_NOTE = "NIE's built-in library has nothing on this question. Answer only if you are confident, say clearly when you are not sure, and never invent citations, section numbers, titles, dates or quotations.";
const ABOUT_NIE_NOTE = "The writer is asking about NIE itself. Answer their actual question in your own words, briefly, using ONLY these facts. Do not claim any ability that is not listed, and never say you can write, rewrite or edit their text.";
/** A self-description that claims NIE writes or edits is wrong whatever the model says, so it is replaced by the fixed one. */
const CLAIMS_TO_WRITE = /\b(?:I|NIE)\s+(?:can|will|could|do)\s+(?:also\s+)?(?:write|rewrite|edit|proofread|draft|polish|fix|compose|continue)\s+(?:your|the|a|an|any|it|that|this)\b/i;
const RANK = { none: 0, weak: 1, strong: 2 };
const OWN_PROJECT = /\b(?:my|our)\s+(?:story|stories|novel|novella|manuscript|draft|screenplay|script|poem|essay|article|book|memoir|characters?|protagonist|antagonist|villain|hero|heroine|plot|scene|chapter|ending|opening|narrator)\b/i;
/** After this many model readings in a row fail, stop asking for a few messages (the rules read them) so a broken model never doubles the wait. */
const READING_FAILURES_BEFORE_PAUSE = 2;
const READING_PAUSE_MESSAGES = 5;

/** Why the offline model could not answer, in words a writer can act on. */
export function describeModelFailure(err) {
  const msg = String(err?.message ?? err ?? '');
  if (err?.kind === 'timeout') return 'it took too long to answer';
  if (/context|too long|exceed|token/i.test(msg) || err?.status === 400) return 'what I was sent was too long for the offline model to read in one go';
  if (err?.kind === 'network') return 'it stopped responding';
  if (err?.kind === 'bad-response') return 'it sent back something I could not use';
  return `it ran into a problem${msg ? ` (${msg.replace(/\s+/g, ' ').slice(0, 120)})` : ''}`;
}
const modelFailedNote = (err) => `My offline model is running, but I couldn't get an answer from it this time: ${describeModelFailure(err)}. Here is built-in guidance instead.`;
/** Said only when the WRITER's own words (not NIE's notes) were cut to fit the model's window. */
const shortenedNote = (trimmed = []) => (trimmed.includes('your message') ? "(Your message was longer than I can read at once, so I used only the first part of it.)" : trimmed.includes('your passage') ? '(I could only fit part of your passage into what I read this time.)' : '');
const WITHHELD_NOTE = "My offline model did answer, but its answer included wording it had composed for your text, and NIE never writes or edits your text, so I've left it out. Here is built-in guidance instead.";

/**
 * NIE's orchestrator: one identity, regardless of what answers underneath.
 *
 *   Brainstorm: an idea partner for any literary project (stories, characters, worlds, articles, essays, poems, scripts).
 *               It offers concepts, angles, complications and questions. It never drafts or edits the writer's text.
 *   Full Scan:  finds where the text breaks the writer's rules and why. Never proposes replacement text.
 *
 * Everything here reads only the project passed in, so one project can never leak into another.
 */
export class Orchestrator {
  #readFailures = 0;
  #readPause = 0;

  /** @param {{ engine: import('../ai/engine.js').AIEngine }} o */
  constructor({ engine }) {
    this.engine = engine;
  }

  /**
   * Understand the message. With a model running, the MODEL reads it (task + topic) and its reading is applied to `intent`;
   * otherwise (no model, an exact command, a bare greeting, or a model that keeps failing) the rules' reading stands.
   * Either way `intent.reading` says which, so a result never claims more understanding than it had.
   */
  async #read({ intent, text, history, signal }) {
    if (!text || ['remember', 'recall', 'develop-idea', 'greeting'].includes(intent.type)) return (intent.reading = rulesReading(intent, 'exact'));
    if ((this.engine.route?.() ?? 'builtin') === 'builtin') return (intent.reading = rulesReading(intent, 'no-model'));
    if (this.#readPause > 0) {
      this.#readPause--;
      return (intent.reading = rulesReading(intent, 'model-reading-paused'));
    }
    const r = await understandMessage({ engine: this.engine, text, history, signal });
    if (!r.ok) {
      if (++this.#readFailures >= READING_FAILURES_BEFORE_PAUSE) {
        this.#readPause = READING_PAUSE_MESSAGES;
        this.#readFailures = READING_FAILURES_BEFORE_PAUSE - 1; // one more failure after the pause pauses again
      }
      return (intent.reading = rulesReading(intent, 'model-reading-failed'));
    }
    this.#readFailures = 0;
    applyReading(intent, r, text);
    return intent.reading;
  }

  retrieve(project, text) {
    const declared = forProfile(project.profile);
    const wp = project.conversation.workingPremise;
    const relevant = search(`${text} ${wp?.summary ?? ''}`, { limit: 4 });
    return [...new Map([...declared, ...relevant].map((e) => [e.id, e])).values()].slice(0, 6);
  }

  /**
   * One Brainstorm turn. Mutates `project` (conversation, working premise, Idea Board); the caller persists it.
   * `kind` / `lens` come from the UI's kind picker and quick-action buttons; typed requests are understood too.
   * @returns {Promise<{ reply: string, intent: object, route: string, suggestions: object[], declined: boolean,
   *   ideas: {id:string,kind:string,lens:string,lensLabel:string,text:string}[], lead: string, tail: string, kind: string|null, lens: string|null }>}
   */
  async brainstorm({ project, message, onToken, signal, kind: kindOpt = null, lens: lensOpt = null }) {
    const text = String(message ?? '').trim();
    project.brainstorm ??= emptyBrainstorm();
    const bs = project.brainstorm;
    const history = project.conversation.messages;
    const intent = detectIntent(text, { project, hasHistory: history.length > 0, mode: 'brainstorm' });

    const userMsg = appendMessage(project, 'user', text, { intent: intent.type });

    // Idea Board commands are exact and need no model.
    if (intent.type === 'remember') return this.#keep(project, intent, onToken);
    if (intent.type === 'recall') {
      const reply = boardToChat(project);
      onToken?.(reply, reply);
      return this.#finish(project, intent, reply, 'builtin', false);
    }

    // NIE does not write or edit the writer's text. Decline clearly, without calling any model. (The rules decide this first, so a
    // request they recognise never reaches a model at all.)
    const decline = () => {
      const reply = intent.type === 'request-edit' ? DECLINE_EDIT : DECLINE_WRITE;
      onToken?.(reply, reply);
      return this.#finish(project, intent, reply, 'builtin', true);
    };
    const declines = () => intent.type === 'request-edit' || intent.type === 'request-write';
    if (declines()) {
      intent.reading = rulesReading(intent, 'declined-by-rules');
      return decline();
    }

    // What is the writer asking? The language model reads the message when one is running; the rules read it otherwise.
    // The model only returns a label, so it cannot write anything; a "write"/"edit" label gets the same fixed decline.
    const reading = await this.#read({ intent, text, history: history.slice(0, -1), signal });
    userMsg.intent = intent.type;
    if (declines()) return decline();
    if (intent.type === 'about-nie') return this.#about({ project, intent, text, onToken, signal });
    const byModel = reading.by === 'model';

    // A general question about craft, style, usage, a form, genre or work: answer from the offline library, with its sources.
    // (Not a premise: it must not become the story's working premise.)
    let lib = null;
    let libMiss = false;
    const libraryCandidate = byModel ? reading.task === 'craft' : intent.type === 'discuss' || intent.type === 'craft-question' || (intent.type === 'share-premise' && GENERAL_Q.test(text));
    if (libraryCandidate) {
      // Naming a character or role ('the detective', 'Samantha') means the writer is talking about their story, not asking the library.
      // When the model has read the message it decides what is a general question; only "my story…" and known character names veto it.
      const lower = text.toLowerCase();
      const known = [...(project.conversation.workingPremise?.characters ?? []), ...(project.memory?.characters ?? []).map((c) => c.name)];
      const knownName = known.some((n) => n && lower.includes(String(n).toLowerCase()));
      const storyTalk = byModel ? OWN_PROJECT.test(text) || knownName : STORY_TALK.test(text) || extractPremiseCues(text).characters.some((c) => !/^[A-Z]/.test(c)) || knownName;
      const general = byModel ? !storyTalk : GENERAL_Q.test(text) && !storyTalk;
      let a = answerFromLibrary(text);
      // The model's short topic ("villanelle") finds the entry when the long way of asking buries it (never for talk about the writer's own project:
      // a bare topic like "villain" would match the library and skip the check that stops it answering about their story).
      if (general && a.strength !== 'strong' && reading.topic) {
        const b = answerFromLibrary(reading.topic);
        if (RANK[b.strength] > RANK[a.strength]) a = b;
      }
      if (a.strength === 'strong' || (a.strength === 'weak' && general)) lib = a;
      else if (general && words(text).length >= 3) libMiss = true;
    }
    if (lib || libMiss) intent.type = 'library-question';

    if (intent.type !== 'library-question') project.conversation.workingPremise = updateWorkingPremise(project.conversation.workingPremise, text, intent);

    // ── What is being brainstormed, and is this a request for ideas? ──────────
    const asks = ASKS_FOR_IDEAS.test(text);
    const develop = intent.type === 'develop-idea' ? intent.idea : null;
    // When the model read the message, only a reading of "ideas" (or a quick-action button) makes idea cards: "tell me more about the
    // twist" is a conversation, not a request for more twists. The rules' guess at a lens word only applies when the rules read it.
    const ideaIntent = intent.type === 'request-ideas' || (!byModel && intent.type === 'discuss');
    let lens = lensOpt && lensOpt !== 'develop' ? lensOpt : null;
    if (!lens && ideaIntent && (asks || words(text).length <= 7)) lens = detectLens(text);
    if (!lens && ideaIntent && asks && WANTS_MORE.test(text)) lens = bs.lastLens; // "more!" repeats the last request
    if (lens && !LENSES[lens]) lens = null;
    const isIdeaAsk = !develop && (Boolean(lensOpt) || intent.type === 'request-ideas' || (!byModel && intent.type === 'discuss' && (Boolean(lens) || (asks && /\bideas?\b/i.test(text)))));

    const resolved = resolveKind(project, text, kindOpt ?? null);
    let kind = resolved.kind;
    let note = '';
    if (lens && !LENSES_BY_KIND[kind].includes(lens)) {
      const fits = KIND_IDS.filter((k) => LENSES_BY_KIND[k].includes(lens));
      if (resolved.source === 'chosen') {
        note = `${LENSES[lens].label} isn't really a thing for ${kindLabel(kind).toLowerCase()} projects, so here's a mix that fits.`;
        lens = null;
      } else if (fits.length) {
        kind = fits[0];
      }
    }
    // Remember what the writer said they are working on, so "give me ideas" next turn stays in the right lane.
    const stated = detectKind(text);
    if (stated && (isIdeaAsk || develop || intent.type === 'start-from-zero' || /\b(?:i'?m|i am|i want to|i'?d like to|i need to|let'?s)\s+(?:be\s+)?(?:writing|write|working on|draft)/i.test(text))) bs.detectedKind = stated;

    if (isIdeaAsk || develop) return this.#ideas({ project, intent, text, kind, lens, develop, note, onToken, signal });

    // ── Conversation (not an idea request) ───────────────────────────────────
    const interp = interpretProfile(project.profile, { text: project.storyText });
    const retrieved = lib ? [...new Map([...lib.entries, ...lib.related, ...this.retrieve(project, text)].map((e) => [e.id, e])).values()].slice(0, 6) : this.retrieve(project, text);
    const passage = intent.type === 'share-passage' ? text : '';
    const report = passage ? scan({ text: passage, project }) : null;

    const composeArgs = {
      mode: 'brainstorm',
      project,
      interp,
      userMessage: text,
      passage: intent.type === 'feedback-request' ? project.storyText.slice(-1800) : '',
      history: history.slice(0, -1),
      retrieved,
      extra: [readingNote(reading, text), report ? `The writer's rules and offline checks found: ${report.headline}` : lib ? LIBRARY_NOTE : libMiss ? LIBRARY_MISS_NOTE : ''].filter(Boolean).join('\n\n'),
    };
    const asked = await this.#ask({ composeArgs, onToken, signal, temperature: 0.7 });
    const res = asked.res;
    const modelReady = asked.modelReady;
    const status = this.engine.status?.() ?? null;

    let reply;
    let route = res.route;
    let extra = {};
    let honesty = asked.failure && modelReady ? modelFailedNote(asked.failure) : '';
    if (res.text) {
      const guarded = guardReply(res.text, [text, project.storyText]);
      reply = guarded.text;
      // If nothing but a composed passage was left, say it with built-in guidance instead.
      if (guarded.removed && words(guarded.remaining).length < 8) reply = '';
      if (!reply) {
        reply = builtinReply({ intent, project, message: text, report, modelReady: true, status });
        route = 'builtin';
        honesty = WITHHELD_NOTE;
      }
    } else {
      reply = lib ? libraryReply(lib) : libMiss ? libraryMissReply(answerFromLibrary(text)) : builtinReply({ intent, project, message: text, report, modelReady: modelReady && Boolean(asked.failure), status });
      route = 'builtin';
      // Starting from nothing is where a few sparks help most: offer some to react to, never a draft.
      if (intent.type === 'start-from-zero') {
        const sparks = generateIdeas({ project, message: text, kind, lens: 'spark', count: 3 }).ideas;
        if (sparks.length) {
          const lead = `${reply}\n\nIf it helps, here are a few starting points to react to:`;
          reply = [lead, sparks.map((s, i) => `${i + 1}. ${s.text}`).join('\n')].join('\n\n');
          extra = { ideas: sparks, lead, tail: '', kind, lens: 'spark' };
          markShown(project, sparks);
        }
      }
    }
    if (route === 'builtin' && honesty) {
      reply = `${honesty}\n\n${reply}`;
      if (extra.lead) extra = { ...extra, lead: `${honesty}\n\n${extra.lead}` };
      extra = { ...extra, fallback: asked.failure ? { reason: 'error', detail: describeModelFailure(asked.failure) } : { reason: 'withheld' } };
    }
    if (route === 'builtin') onToken?.(reply, reply);
    else if (shortenedNote(asked.trimmed)) reply = `${reply}\n\n${shortenedNote(asked.trimmed)}`;
    return this.#finish(project, intent, reply, route, false, extra);
  }

  /**
   * Ask the model. If it is ready but the call fails (usually a prompt too long for its window), retry ONCE with a much
   * smaller prompt before giving up. `modelReady` tells the caller whether "the model is missing" would be a lie.
   */
  async #ask({ composeArgs, onToken, signal, temperature }) {
    const ready = () => this.engine.localStatus?.().state === 'ready';
    const full = composeMessages(composeArgs);
    let failure = null;
    let res = null;
    try {
      res = await this.engine.chat(full.messages, { onToken, signal, maxTokens: 700, temperature });
    } catch (err) {
      if (err?.kind === 'abort') throw err;
      failure = err;
    }
    if (res && !res.text) failure = res.error ?? failure;
    const modelReady = ready();
    if ((!res || !res.text) && modelReady) {
      const small = composeMessages({ ...composeArgs, limit: RETRY_TOKEN_LIMIT, minimal: true });
      try {
        const again = await this.engine.chat(small.messages, { onToken, signal, maxTokens: 500, temperature });
        if (again.text) return { res: again, failure: null, modelReady, trimmed: [...new Set([...full.trimmed, ...small.trimmed, 'earlier messages'])] };
        failure = again.error ?? failure;
      } catch (err) {
        if (err?.kind === 'abort') throw err;
        failure = err;
      }
    }
    return { res: res ?? { text: null, route: 'builtin' }, failure: res?.text ? null : failure, modelReady, trimmed: full.trimmed };
  }

  /** Idea requests and "develop this idea": the model when it is running, otherwise the built-in idea library. */
  async #ideas({ project, intent, text, kind, lens, develop, note, onToken, signal }) {
    const bs = project.brainstorm;
    const history = project.conversation.messages;
    const gen = develop ? { ideas: [] } : generateIdeas({ project, message: text, kind, lens, count: 3 });
    const interp = interpretProfile(project.profile, { text: project.storyText });
    const composeArgs = {
      mode: 'brainstorm',
      project,
      interp,
      userMessage: text,
      history: history.slice(0, -1),
      retrieved: this.retrieve(project, text),
      extra: ideaRequestBlock({ kind, lens, develop, note, seeds: gen.ideas.slice(0, 2).map((i) => i.text) }),
    };
    const asked = await this.#ask({ composeArgs, onToken, signal, temperature: 0.85 });
    const res = asked.res;
    const fallbackNote = asked.failure && asked.modelReady ? modelFailedNote(asked.failure) : '';

    const lensLabel = lens ? (LENSES[lens]?.label ?? lens) : 'Idea';
    const toCards = (items) => items.map((t) => ({ id: ideaId(t), kind, lens: lens ?? 'mixed', lensLabel, text: t }));
    const firstTime = !history.some((m) => m.role === 'assistant' && m.ideas?.length);

    if (res.text) {
      const guarded = guardReply(res.text, [text, project.storyText]);
      if (!(guarded.removed && words(guarded.remaining).length < 8)) {
        const parsed = develop ? { ideas: [] } : parseIdeas(guarded.remaining);
        const ideas = toCards(parsed.ideas);
        const reply = guarded.text;
        if (ideas.length) markShown(project, ideas);
        bs.lastLens = lens;
        const lead = [note, parsed.lead].filter(Boolean).join('\n\n');
        const cut = shortenedNote(asked.trimmed);
        return this.#finish(project, intent, cut ? `${reply}\n\n${cut}` : reply, res.route, false, { ideas, lead: ideas.length ? lead : '', tail: [ideas.length ? parsed.tail : '', cut].filter(Boolean).join('\n\n'), kind, lens });
      }
    }

    // Built-in guidance: deterministic, from the idea library and what the writer has told us.
    let composed;
    let ideas = [];
    if (develop) {
      composed = composeDevelopReply({ project, kind, idea: develop, builtin: true, firstTime });
    } else if (gen.ideas.length) {
      composed = composeIdeaReply({ project, kind, lens, ideas: gen.ideas, builtin: true, firstTime });
      ideas = gen.ideas;
      markShown(project, ideas);
    }
    const honesty = fallbackNote || (res.text ? WITHHELD_NOTE : '');
    const fallback = honesty ? { reason: asked.failure ? 'error' : 'withheld', ...(asked.failure ? { detail: describeModelFailure(asked.failure) } : {}) } : null;
    if (!composed) {
      const reply = [honesty, builtinReply({ intent: { ...intent, type: 'request-ideas' }, project, message: text, modelReady: Boolean(honesty) })].filter(Boolean).join('\n\n');
      onToken?.(reply, reply);
      return this.#finish(project, intent, reply, 'builtin', false, { kind, lens, fallback });
    }
    if (note) {
      composed.lead = `${note} ${composed.lead}`;
      composed.text = `${note} ${composed.text}`;
    }
    if (honesty) {
      composed.lead = `${honesty}\n\n${composed.lead}`;
      composed.text = `${honesty}\n\n${composed.text}`;
    }
    bs.lastLens = lens;
    onToken?.(composed.text, composed.text);
    return this.#finish(project, intent, composed.text, 'builtin', false, { ideas, lead: composed.lead, tail: composed.tail, kind, lens, fallback });
  }

  /**
   * "What can you do? Do you work offline?" is answered from facts about NIE: by the model in its own words when one is running
   * (so it can answer the question actually asked), otherwise by a fixed answer. A reply that claims NIE writes or edits text is
   * never used, and neither is one that cannot be trusted about the state of the model: the fixed answer states it exactly.
   */
  async #about({ project, intent, text, onToken, signal }) {
    const status = this.engine.status?.() ?? null;
    let honesty = '';
    let fallback = null;
    if ((this.engine.route?.() ?? 'builtin') !== 'builtin') {
      const composeArgs = { mode: 'brainstorm', project, userMessage: text, history: project.conversation.messages.slice(0, -1), extra: `${ABOUT_NIE_NOTE}\n${aboutNieFacts(status)}` };
      const asked = await this.#ask({ composeArgs, onToken, signal, temperature: 0.3 });
      if (asked.res.text && !CLAIMS_TO_WRITE.test(asked.res.text)) {
        return this.#finish(project, intent, guardReply(asked.res.text, [text, project.storyText]).text, asked.res.route, false);
      }
      if (asked.failure && asked.modelReady) {
        honesty = modelFailedNote(asked.failure);
        fallback = { reason: 'error', detail: describeModelFailure(asked.failure) };
      }
    }
    const reply = [honesty, aboutNieReply(status)].filter(Boolean).join('\n\n');
    onToken?.(reply, reply);
    return this.#finish(project, intent, reply, 'builtin', false, fallback ? { fallback } : {});
  }

  /** "Remember this": keep what the writer said, or the ideas NIE just offered, on this project's Idea Board. */
  #keep(project, intent, onToken) {
    const prior = project.conversation.messages.slice(0, -1);
    let saved = [];
    if (intent.memory.note) {
      saved = [addToBoard(project, { text: intent.memory.note, source: 'writer' })];
    } else {
      // What "this" refers to: the ideas NIE last offered, else what the writer last said. NIE's own replies to board
      // commands ("Kept on your Idea Board…") and the commands themselves are skipped, so a second "remember this" is understood.
      const isBoardTurn = (m) => ['remember', 'recall'].includes(m.intent) || (m.role === 'assistant' && ['remember', 'recall'].includes(prior[prior.indexOf(m) - 1]?.intent));
      const turns = [...prior].reverse().filter((m) => !isBoardTurn(m));
      const lastAssistant = turns.find((m) => m.role === 'assistant');
      const lastUser = turns.find((m) => m.role === 'user' && m.intent !== 'develop-idea');
      if (lastAssistant?.ideas?.length) {
        saved = lastAssistant.ideas.map((i) => addToBoard(project, { text: i.text, lens: i.lens, kind: i.kind, source: 'nie' }));
      } else if (lastUser && words(lastUser.content).length >= 3) {
        saved = [addToBoard(project, { text: lastUser.content, source: 'writer' })];
      }
    }
    const added = saved.filter((r) => r.added);
    let reply;
    if (!saved.length) {
      reply = 'I don\'t have anything to keep yet. Tell me what to remember, like "remember: the cat can talk", or tap the star on any idea I give you.';
    } else if (!added.length) {
      reply = "That's already on your Idea Board.";
    } else {
      reply = `Kept on your Idea Board: ${added.map((r) => `"${clip(r.item.text, 120)}"`).join('; ')}.${added.length > 1 ? " Remove any you don't want from the board." : ''} Say "show my idea board" any time to see what I'm keeping for this project.`;
    }
    onToken?.(reply, reply);
    return this.#finish(project, intent, reply, 'builtin', false);
  }

  #finish(project, intent, reply, route, declined, extra = {}) {
    const ideas = extra.ideas ?? [];
    const meta = { route };
    // Who understood the message and how it was read ('model' = the language model read it; 'rules' = the built-in rules did).
    const understood = intent.reading ? { by: intent.reading.by, task: intent.reading.task, topic: intent.reading.topic ?? '' } : null;
    if (understood) meta.understood = understood;
    if (extra.fallback) meta.fallback = extra.fallback; // why the offline model's answer was not used (kept so it can be shown or reported)
    if (ideas.length) Object.assign(meta, { ideas, lead: extra.lead ?? '', tail: extra.tail ?? '', kind: extra.kind ?? null, lens: extra.lens ?? null });
    appendMessage(project, 'assistant', reply, meta);
    project.conversation.suggestionShown = true;
    return {
      reply,
      intent,
      understood,
      route,
      declined,
      ideas,
      lead: extra.lead ?? '',
      tail: extra.tail ?? '',
      kind: extra.kind ?? null,
      lens: extra.lens ?? null,
      suggestions: ideas.length && extra.lens !== 'develop' ? ideaSuggestions({ lens: extra.lens ?? null, ideas }) : nextSuggestions({ intent, project }),
    };
  }

  /**
   * Full Scan: find where the text breaks the project's rules. The language model (when running) only judges rules
   * that need meaning, by numbered sentence; offline, those rules fall back to keyword matching and say so.
   */
  async scan({ project, text, observations = true, onProgress, signal }) {
    const chat = async (messages, opts) => (await this.engine.chat(messages, opts)).text;
    return scanWithModel({ text, project, observations, chat, signal, onProgress });
  }
}

export { leadNoun };
