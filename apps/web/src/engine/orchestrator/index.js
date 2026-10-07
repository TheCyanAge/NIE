import { detectIntent, extractPremiseCues, updateWorkingPremise } from '../intent/intent.js';
import { interpretProfile } from '../profile/interpret.js';
import { answerFromLibrary, forProfile, search } from '../knowledge/index.js';
import { appendMessage } from '../project/memory.js';
import { addToBoard, boardToChat, emptyBrainstorm, ideaId } from '../project/board.js';
import { scan, scanWithModel } from '../analysis/scan.js';
import { composeMessages, ideaRequestBlock, RETRY_TOKEN_LIMIT } from './prompt.js';
import { aboutNieReply, builtinReply, DECLINE_EDIT, DECLINE_WRITE, libraryMissReply, libraryReply } from './builtin.js';
import { guardReply } from './guard.js';
import { applyReading, readingNote, rulesReading, understandMessage } from './understand.js';
import { describeReading } from '../reading/context.js';
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
const RANK = { none: 0, weak: 1, strong: 2 };
const OWN_PROJECT = /\b(?:my|our)\s+(?:story|stories|novel|novella|manuscript|draft|screenplay|script|poem|essay|article|book|memoir|characters?|protagonist|antagonist|villain|hero|heroine|plot|scene|chapter|ending|opening|narrator)\b/i;
/** A message longer than this (about 1,000 tokens) is a pasted text, not a sentence to answer: it is read in sections instead of cut off. */
export const LONG_MESSAGE_CHARS = 3600;
const STORY_TEXT_MIN_CHARS = 400;
const ASK_WORDS = /\?|\bplease\b|\b(?:can|could|would)\s+you\b|\bwhat\b|\bhow\b|\bwhy\b|\bthoughts?\b|\bthink\b|\bfeedback\b|\bhere(?:'s| is| are)\b|\bbelow\b|:\s*$/i;
const PASTED_NO_ASK = "(The writer pasted a text and did not say what they want from it. Respond to what stands out in it and ask one or two good questions. This line is not the writer's wording.)";
/** Which of the writer's own words is the ask, and which is the pasted text? A short first or last paragraph around a long body is the ask. */
export function splitPaste(text) {
  const paras = String(text).split(/\n[ \t]*\n/).map((p) => p.trim()).filter(Boolean);
  let lead = '';
  let trail = '';
  if (paras.length >= 3) {
    if (paras[0].length <= 400 && ASK_WORDS.test(paras[0])) lead = paras.shift();
    if (paras.length >= 2 && paras.at(-1).length <= 400 && ASK_WORDS.test(paras.at(-1))) trail = paras.pop();
    return { ask: [lead, trail].filter(Boolean).join(' '), body: paras.join('\n\n') };
  }
  return { ask: '', body: String(text) };
}
/**
 * Only the most recent long paste is kept in full (follow-up questions are about it). An older one keeps its start and says so, because every
 * message is stored with the project and storage is limited: several 100,000-character pastes would otherwise fill it, silently losing the project.
 */
export function compactOldPastes(messages) {
  for (const m of messages.slice(0, -1)) {
    if (m.role !== 'user' || m.compacted || m.content.length <= LONG_MESSAGE_CHARS) continue;
    m.content = `${m.content.slice(0, 1200).trimEnd()}… [a pasted text of about ${words(m.content).length.toLocaleString('en-US')} words; only its start is kept once a newer paste arrives]`;
    m.compacted = true;
  }
}
/**
 * What does a message with a long pasted text in it mean? Only the writer's OWN words (its short first or last paragraph) are read by the rules: a
 * chapter is full of dialogue like "Can you fix the lamp?" or "Open the memory", which must never be mistaken for a request to NIE.
 */
function pasteIntent(paste, ctx) {
  const base = paste.ask ? detectIntent(paste.ask, ctx) : null;
  const decided = base && !['remember', 'recall', 'develop-idea', 'empty', 'greeting', 'discuss', 'share-premise', 'direction-change', 'start-from-zero'].includes(base.type);
  const intent = decided ? base : { type: 'share-passage', secondary: [], confidence: 0.5, signals: ['pasted text'], mode: ctx.mode, direction: { changed: false }, topics: [] };
  intent.premiseCues = extractPremiseCues(paste.body.slice(0, 6000));
  return intent;
}
const MENTIONS_OWN_TEXT = /\b(?:my|our)\s+(?:story|novel|manuscript|draft|book|screenplay|script|poem|essay|article|piece|chapters?|ending|opening|middle|scene|characters?|protagonist|villain)\b/i;

/** The compact record kept on the reply: what was shown of a long text. */
const summarizeRead = (r) => ({ complete: r.complete, sections: r.sections, words: r.words, subject: r.subject, shown: r.shown.map((x) => x.i + 1) });

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
  async #read({ intent, text, history, signal, button = false }) {
    if (!text || button || ['remember', 'recall', 'develop-idea', 'greeting'].includes(intent.type)) return (intent.reading = rulesReading(intent, button ? 'button' : 'exact'));
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
    const ctx = { project, hasHistory: history.length > 0, mode: 'brainstorm' };
    const paste = text.length > LONG_MESSAGE_CHARS ? splitPaste(text) : null;
    const askText = paste ? paste.ask : text; // what the rules and the library look at: the writer's own words, never a pasted chapter
    const intent = paste ? pasteIntent(paste, ctx) : detectIntent(text, ctx);

    const userMsg = appendMessage(project, 'user', text, { intent: intent.type });
    if (text.length > LONG_MESSAGE_CHARS) compactOldPastes(history);

    // Idea Board commands are exact and need no model.
    if (intent.type === 'remember') {
      intent.reading = rulesReading(intent, 'exact');
      return this.#keep(project, intent, onToken);
    }
    if (intent.type === 'recall') {
      intent.reading = rulesReading(intent, 'exact');
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
    const reading = await this.#read({ intent, text: paste ? paste.ask || text.slice(0, 450) : text, history: history.slice(0, -1), signal, button: Boolean(lensOpt) }); // a tapped quick-action already says what it is
    userMsg.intent = intent.type;
    if (declines()) return decline();
    if (intent.type === 'about-nie') return this.#about({ project, intent, text: askText, onToken });
    const byModel = reading.by === 'model';

    // A general question about craft, style, usage, a form, genre or work: answer from the offline library, with its sources.
    // (Not a premise: it must not become the story's working premise.)
    let lib = null;
    let libMiss = false;
    let ownProject = false;
    const libraryCandidate = text.length > LONG_MESSAGE_CHARS ? false : byModel ? reading.task === 'craft' : intent.type === 'discuss' || intent.type === 'craft-question' || (intent.type === 'share-premise' && GENERAL_Q.test(text));
    if (libraryCandidate) {
      // Naming a character or role ('the detective', 'Samantha', 'he') or "my story" means the writer is talking about their story, not asking the
      // library. Even when the model read it as a general question, that stays a veto for anything but a strong match: a 3B model misreads
      // some questions about the writer's own project, and answering those from the library (or saying the library has nothing) would be wrong.
      const lower = text.toLowerCase();
      const known = [...(project.conversation.workingPremise?.characters ?? []), ...(project.memory?.characters ?? []).map((c) => c.name)];
      const knownName = known.some((n) => n && lower.includes(String(n).toLowerCase()));
      const storyTalk = OWN_PROJECT.test(text) || STORY_TALK.test(text) || extractPremiseCues(text).characters.some((c) => !/^[A-Z]/.test(c)) || knownName;
      ownProject = storyTalk;
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
    const asks = ASKS_FOR_IDEAS.test(askText);
    const develop = intent.type === 'develop-idea' ? intent.idea : null;
    // When the model read the message, only a reading of "ideas" (or a quick-action button) makes idea cards: "tell me more about the
    // twist" is a conversation, not a request for more twists. The rules' guess at a lens word only applies when the rules read it.
    const ideaIntent = intent.type === 'request-ideas' || (!byModel && intent.type === 'discuss');
    let lens = lensOpt && lensOpt !== 'develop' ? lensOpt : null;
    if (!lens && ideaIntent && (asks || words(askText).length <= 7)) lens = detectLens(askText);
    if (!lens && ideaIntent && asks && WANTS_MORE.test(text)) lens = bs.lastLens; // "more!" repeats the last request
    if (lens && !LENSES[lens]) lens = null;
    const isIdeaAsk = !develop && (Boolean(lensOpt) || intent.type === 'request-ideas' || (!byModel && intent.type === 'discuss' && (Boolean(lens) || (asks && /\bideas?\b/i.test(askText)))));

    const resolved = resolveKind(project, askText, kindOpt ?? null);
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
    const stated = detectKind(askText);
    if (stated && (isIdeaAsk || develop || intent.type === 'start-from-zero' || /\b(?:i'?m|i am|i want to|i'?d like to|i need to|let'?s)\s+(?:be\s+)?(?:writing|write|working on|draft)/i.test(askText))) bs.detectedKind = stated;

    if (isIdeaAsk || develop) return this.#ideas({ project, intent, text, kind, lens, develop, note, reading, onToken, signal });

    // ── Conversation (not an idea request) ───────────────────────────────────
    const interp = interpretProfile(project.profile, { text: project.storyText });
    const doc = this.#documentFor({ project, text, intent, reading, history: history.slice(0, -1) });
    const retrieved = lib ? [...new Map([...lib.entries, ...lib.related, ...this.retrieve(project, askText)].map((e) => [e.id, e])).values()].slice(0, 6) : this.retrieve(project, askText);
    const passage = intent.type === 'share-passage' ? text : '';
    const report = passage ? scan({ text: passage, project }) : null;

    const composeArgs = {
      mode: 'brainstorm',
      project,
      interp,
      userMessage: doc.userMessage,
      document: doc.document,
      history: history.slice(0, -1),
      retrieved,
      extra: [readingNote(reading, text, { ownProject }), report ? `The writer's rules and offline checks found: ${report.headline}` : lib ? LIBRARY_NOTE : libMiss ? LIBRARY_MISS_NOTE : ''].filter(Boolean).join('\n\n'),
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
        reply = builtinReply({ intent, project, message: askText, report, modelReady: true, status });
        route = 'builtin';
        honesty = WITHHELD_NOTE;
      }
    } else {
      reply = lib ? libraryReply(lib) : libMiss ? libraryMissReply(answerFromLibrary(text)) : builtinReply({ intent, project, message: askText, report, modelReady: modelReady && Boolean(asked.failure), status });
      route = 'builtin';
      // Starting from nothing is where a few sparks help most: offer some to react to, never a draft.
      if (intent.type === 'start-from-zero') {
        const sparks = generateIdeas({ project, message: askText, kind, lens: 'spark', count: 3 }).ideas;
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
    else {
      // Say what was looked at. (Only when a model answered: a built-in reply never read the text, and must not seem to.)
      const looked = asked.read && !asked.read.complete ? `(${describeReading(asked.read)})` : '';
      const tail = [looked, shortenedNote(asked.trimmed)].filter(Boolean).join('\n\n');
      if (tail) reply = `${reply}\n\n${tail}`;
      if (asked.read) extra = { ...extra, read: summarizeRead(asked.read) };
    }
    return this.#finish(project, intent, reply, route, false, extra);
  }

  /**
   * The long text (if there is one) this message is about, and what the writer actually asked.
   *  - a long pasted message is the text itself; its short first/last paragraph is the ask;
   *  - a follow-up soon after such a paste is about that paste, unless it says "my story/draft…";
   *  - otherwise the project's Story Text, for anything about the writer's own work.
   * Nothing is cut off: the composer shows an outline of the whole plus the parts that matter, and `read` records what was shown.
   * @returns {{ document: {text:string,query:string,topic:string,subject:string}|null, userMessage: string }}
   */
  #documentFor({ project, text, intent, reading, history }) {
    const task = reading?.task ?? null;
    const aboutWork = !['craft', 'about-nie', 'chat', 'write', 'edit'].includes(task) && !['library-question', 'greeting', 'about-nie'].includes(intent.type);
    const topic = reading?.topic ?? '';
    if (text.length > LONG_MESSAGE_CHARS) {
      const { ask, body } = splitPaste(text);
      return { document: { text: body, query: ask, topic, subject: 'passage' }, userMessage: ask || PASTED_NO_ASK };
    }
    if (!aboutWork) return { document: null, userMessage: text };
    if (!MENTIONS_OWN_TEXT.test(text)) {
      const recent = history.slice(-12).reverse().find((m) => m.role === 'user' && m.content.length > LONG_MESSAGE_CHARS);
      if (recent) return { document: { text: splitPaste(recent.content).body, query: text, topic, subject: 'passage' }, userMessage: text };
    }
    if (project.storyText.trim().length >= STORY_TEXT_MIN_CHARS) return { document: { text: project.storyText, query: text, topic, subject: 'text' }, userMessage: text };
    return { document: null, userMessage: text };
  }

  /**
   * Ask the model. If it is ready but the call fails (usually a prompt too long for its window), retry ONCE with a much
   * smaller prompt before giving up. `modelReady` tells the caller whether "the model is missing" would be a lie.
   */
  async #ask({ composeArgs, onToken, signal, temperature }) {
    const ready = () => this.engine.localStatus?.().state === 'ready';
    const full = composeMessages(composeArgs);
    const read = full.reading;
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
        if (again.text) return { res: again, failure: null, modelReady, trimmed: [...new Set([...full.trimmed, ...small.trimmed, 'earlier messages'])], read: small.reading ?? read };
        failure = again.error ?? failure;
      } catch (err) {
        if (err?.kind === 'abort') throw err;
        failure = err;
      }
    }
    return { res: res ?? { text: null, route: 'builtin' }, failure: res?.text ? null : failure, modelReady, trimmed: full.trimmed, read };
  }

  /** Idea requests and "develop this idea": the model when it is running, otherwise the built-in idea library. */
  async #ideas({ project, intent, text, kind, lens, develop, note, reading, onToken, signal }) {
    const bs = project.brainstorm;
    const history = project.conversation.messages;
    const doc = this.#documentFor({ project, text, intent, reading, history: history.slice(0, -1) });
    const askText = doc.document?.subject === 'passage' && text.length > LONG_MESSAGE_CHARS ? doc.userMessage : text;
    const gen = develop ? { ideas: [] } : generateIdeas({ project, message: askText, kind, lens, count: 3 });
    const interp = interpretProfile(project.profile, { text: project.storyText });
    const composeArgs = {
      mode: 'brainstorm',
      project,
      interp,
      userMessage: doc.userMessage,
      document: doc.document,
      history: history.slice(0, -1),
      retrieved: this.retrieve(project, askText),
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
        const cut = [asked.read && !asked.read.complete ? `(${describeReading(asked.read)})` : '', shortenedNote(asked.trimmed)].filter(Boolean).join('\n\n');
        return this.#finish(project, intent, cut ? `${reply}\n\n${cut}` : reply, res.route, false, { ideas, lead: ideas.length ? lead : '', tail: [ideas.length ? parsed.tail : '', cut].filter(Boolean).join('\n\n'), kind, lens, ...(asked.read ? { read: summarizeRead(asked.read) } : {}) });
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
      const reply = [honesty, builtinReply({ intent: { ...intent, type: 'request-ideas' }, project, message: askText, modelReady: Boolean(honesty) })].filter(Boolean).join('\n\n');
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
   * "What can you do? Do you work offline? Which model are you?" is answered from fixed, checked facts about NIE and the real status, whether or
   * not a model is running: a small model asked to describe its own app invents abilities and rambles (measured on the real model), and what NIE says
   * about itself, above all about its own state, has to be exact. The model's part is recognising that this is what the writer asked.
   */
  #about({ project, intent, text, onToken }) {
    const reply = aboutNieReply(this.engine.status?.() ?? null, text);
    onToken?.(reply, reply);
    return this.#finish(project, intent, reply, 'builtin', false);
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
    const understood = intent.reading ? { by: intent.reading.by, task: intent.reading.task, topic: intent.reading.topic ?? '', ...(intent.reading.overruled ? { overruled: intent.reading.overruled } : {}) } : null;
    if (understood) meta.understood = understood;
    if (extra.read) meta.read = extra.read; // what was looked at, for a long text
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
