import { detectIntent, extractPremiseCues, updateWorkingPremise } from '../intent/intent.js';
import { interpretProfile } from '../profile/interpret.js';
import { answerFromLibrary, forProfile, search } from '../knowledge/index.js';
import { appendMessage } from '../project/memory.js';
import { addToBoard, boardToChat, emptyBrainstorm, ideaId } from '../project/board.js';
import { scan, scanWithModel } from '../analysis/scan.js';
import { composeMessages, ideaRequestBlock, indexFor, RETRY_TOKEN_LIMIT } from './prompt.js';
import { aboutNieReply, builtinReply, DECLINE_EDIT, DECLINE_WRITE, libraryMissReply, libraryReply } from './builtin.js';
import { guardReply, LEFT_OUT_NOTICE } from './guard.js';
import { avoidBlock, refine, shapeFor, similarity, splitSentencesLite } from './variety.js';
import { applyReading, readingNote, rulesReading, understandMessage } from './understand.js';
import { describeReading, describeSending, isLookupQuestion, search as searchText } from '../reading/context.js';
import { makeOverview, projectNotesCache, readThrough, sectionKey } from '../reading/notes.js';
import { styleProfile } from '../reading/style.js';
import { ideaSuggestions, nextSuggestions, STARTER } from './suggestions.js';
import { ASKS_FOR_IDEAS, WANTS_MORE } from '../brainstorm/commands.js';
import { KIND_IDS, LENSES, LENSES_BY_KIND, detectKind, detectLens, kindLabel } from '../brainstorm/lenses.js';
import { composeDevelopReply, composeIdeaReply, generateIdeas, leadNoun, markShown, parseIdeas, resolveKind } from '../brainstorm/ideas.js';
import { clip, estimateTokens, fnv1a, words } from '../util/text.js';
import defaultAgent from '../agent/index.js';
import { detectProject } from '../agent/detect.js';
import { grasp as agentGrasp } from '../agent/sheet.js';
import { filledIds } from '../agent/state.js';
import { parseKeepCommand } from '../agent/talk.js';
import { describeMind, recall, rememberStatements } from '../mind/index.js';
import { analyseText, analysisKey, clearGroundingCache, editorialEvidence, findThirdPerson, groundNames, readbackFrame } from '../editor/index.js';
import { profileCorpus } from '../profile/profile.js';

export { STARTER };

// A general question about craft, style, usage, a form/genre or a work (as opposed to talk about the writer's own story).
const GENERAL_Q = /^\s*(?:what(?:'s|\s+is|\s+are|\s+does|\s+do)\b|how\s+(?:do|should|can|would|does)\s+(?:i|you|one|we|a|an|the)\b|how\s+(?:to|is|are)\b|who\s+(?:wrote|is|was|are|were|invented|coined)\b|which\s+(?:is|one|style|form|genre|guide)\b|when\s+(?:do|should|is|does)\b|(?:explain|define|describe|tell\s+me\s+about)\b|(?:is|are)\s+it\b|difference\s+between|should\s+i\s+(?:use|capitali[sz]e|italici[sz]e|hyphenate|spell|write|format|cite)\b)/i;
const STORY_TALK = /\b(?:my|our|his|her|their|the)\s+(?:story|novel|characters?|protagonist|antagonist|villain|hero|heroine|plot|scene|chapter|draft|ending|opening|twist|narrator|manuscript)\b|\b(?:he|she|him|they|them)\b/i;
const LIBRARY_NOTE = "These notes come from NIE's built-in library. When they cover the question, answer from them and say which style guide or source they come from, and mention when practice varies. If they do not cover it, say so plainly. Never invent citations, section numbers, titles, dates or quotations.";
const LIBRARY_MISS_NOTE = "NIE's built-in library has nothing on this question. Answer only if you are confident, say clearly when you are not sure, and never invent citations, section numbers, titles, dates or quotations.";
const RANK = { none: 0, weak: 1, strong: 2 };
/** "yes", "no", "ok", "maybe": a reply, not a question, so it is never looked up in the library ("yes" found "yes-but"). */
/** A turn that only acknowledges and asks needs a sentence or two, not 700 tokens: the model is held to that (the writer waits for every token on a CPU). */
const SHORT_TURN_TOKENS = 200;
/**
 * The built-in replies of the older design end in a list of questions ("A few things would help me: - ...? - ...?"). The idea agent asks ONE, now and then, so under its
 * plan those lists go (with the line that introduced them); what is left is the part of the reply that says something.
 */
export function withoutQuestionLists(text) {
  const lines = String(text ?? '').split('\n');
  const isItem = (l) => /^\s*(?:[-*\u2022]|\d+[.)])\s/.test(l);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (isItem(l) && l.includes('?')) {
      // the question goes; what the item also says ("...? Letting the reader know first gives you dramatic irony.") stays, as a plain line
      const rest = splitSentencesLite(l.replace(/^\s*(?:[-*\u2022]|\d+[.)])\s+/, '')).filter((x) => !/\?["')\]]*\s*$/.test(x)).join(' ').trim();
      if (words(rest).length >= 4) out.push(rest);
      continue;
    }
    if (/:\s*$/.test(l) && !isItem(l)) {
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      const next = lines[j];
      if (next !== undefined && isItem(next) && next.includes('?')) continue; // the intro of a list of questions
    }
    out.push(l);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
/**
 * Hold a model's reply to the agent's plan. `enforce` handles the questions it can remove whole; a turn that must NOT ask (the writer told NIE something and it is not time
 * to ask) can still come back as a question in one short sentence ("...but what secrets does she carry?"), which `enforce` cannot cut without leaving nothing. Then the question
 * sentences go, and if too little is left NIE's own acknowledgement of what was recorded stands in for the reply. Measured on the real model: without this every turn asked.
 */
export function holdToPlan(text, plan, agentTurn, said = '') {
  let out = agentTurn.enforce(text);
  if (plan?.act === 'ask' && said) {
    // A model often opens by saying the writer's own sentence back to them; before a question that is only an echo, so it goes and the question stands.
    const sentences = splitSentencesLite(out);
    const kept = sentences.filter((x) => /\?["')\]]*\s*$/.test(x) || similarity(x, said) < 0.7);
    if (kept.length < sentences.length && kept.some((x) => /\?["')\]]*\s*$/.test(x))) out = kept.join(' ').trim();
  }
  if (plan?.act === 'ask' || plan?.act === 'reflect') {
    // The comment (what is not a question) must stay with what the writer said; invented imagery is cut, and a turn left with nothing says what it recorded instead.
    const sentences = splitSentencesLite(out);
    const isQ = (x) => /\?["')\]]*\s*$/.test(x);
    const comment = sentences.filter((x) => !isQ(x)).join(' ').trim();
    if (comment && agentTurn.grounded && !agentTurn.grounded(comment)) {
      const questions = sentences.filter(isQ).join(' ').trim();
      out = plan.act === 'ask' ? questions : '';
      if (!out) out = agentTurn.ack || '';
      if (plan.act === 'ask') out = agentTurn.enforce(out);
    }
  }
  if (plan?.act === 'reflect' && /\?/.test(out)) {
    const kept = splitSentencesLite(out).filter((s) => !/\?["')\]]*\s*$/.test(s)).join(' ').trim();
    out = words(kept).length >= 4 ? kept : agentTurn.ack || kept || out;
  }
  return out || text;
}
/**
 * A reply cut off by the length limit loses its unfinished last sentence rather than showing half of it. Only a reply that came close to the limit can have been cut off
 * (`maxTokens`): a short reply that ends on a list item or a heading was finished.
 */
export function finishedSentences(text, maxTokens = 0) {
  const t = String(text ?? '').trimEnd();
  if (!t || /[.!?…"”’)\]*_]$/.test(t)) return t;
  if (maxTokens && estimateTokens(t) < maxTokens * 0.85) return t;
  const cut = Math.max(t.lastIndexOf('. '), t.lastIndexOf('? '), t.lastIndexOf('! '), t.lastIndexOf('.\n'), t.lastIndexOf('?\n'), t.lastIndexOf('!\n'));
  return cut > 20 ? t.slice(0, cut + 1) : t;
}
/** "What do you remember about my project?", "what have I told you?": answered from what is really held, not by the model. */
const MIND_QUESTION = /\bwhat\s+(?:do|did|have|can|could)\s+you\s+(?:still\s+)?(?:remember|recall|hold|keep)\b|\bwhat\s+do\s+you\s+(?:know|have)\s+(?:so far\s+)?about\s+(?:my|this|our)\s+(?:story|project|idea|book|novel|script|world|plot|characters?)\b|\bwhat\s+(?:have|did)\s+i\s+(?:told|tell|said|say|given|give|shared)\s+you\b|\b(?:recap|summari[sz]e)\s+(?:everything|all|what)\s+(?:we|i|you)\b/i;
/** Words that make even a "who/what..." question one about what the program has counted (the cast, the pacing, the voice, consistency, the writer's rules). */
const ASKS_FOR_COUNTS = /\b(?:pac(?:e|es|ing)|rhythm|characters?|cast|protagonists?|consisten\w*|contradict\w*|continuity|timelines?|tense|pov|point of view|voice|repeat\w*|overus\w*|rules?)\b/i;
const UNGROUNDED_NOTE = "My offline model answered, but everything it said named something I could not find in your text, so I've left it out. Here is built-in guidance instead.";
const LEFT_OUT_UNGROUNDED = "(I left out part of that reply because it named something I couldn't find in your text.)";
const BARE_REPLY = /^\W*(?:yes|yeah|yep|yup|sure|ok|okay|no|nope|nah|maybe|perhaps|please|thanks|thank you|right|true|false|hm+|um+)\W*$/i;
const OWN_PROJECT = /\b(?:my|our)\s+(?:story|stories|novel|novella|manuscript|draft|screenplay|script|poem|essay|article|book|memoir|characters?|protagonist|antagonist|villain|hero|heroine|plot|scene|chapter|ending|opening|narrator)\b/i;
/** A message longer than this (about 1,000 tokens) is a pasted text, not a sentence to answer: it is read in sections instead of cut off. */
export const LONG_MESSAGE_CHARS = 3600;
const STORY_TEXT_MIN_CHARS = 400;
const ASK_WORDS = /\?|\bplease\b|\b(?:can|could|would)\s+you\b|\bwhat\b|\bhow\b|\bwhy\b|\bthoughts?\b|\bthink\b|\bfeedback\b|\bhere(?:'s| is| are)\b|\bbelow\b|:\s*$/i;
const PASTED_NO_ASK = "(The writer pasted a text and did not say what they want from it. This line is not the writer's wording.)";
/** A text this long (in sections of about 2,200 characters, so about 22,000 words) is not read through section by section: it is searched instead, as before. */
export const MAX_NOTE_SECTIONS = 60;
const COLD_NOTE_MS = 240000;
const WARM_NOTE_MS = 150000;
/** Asking about the whole text, not one fact in it: reading every section first is worth the wait. */
const WHOLE_HINTS = /\b(?:summar\w+|overall|big picture|whole|entire|throughout|structure[ds]?|pacing|paced|consisten\w+|contradict\w*|conflict\w*|inconsisten\w*|timeline|chronolog\w*|theme\w*|style|voice|tone|register|arc|plot holes?|what(?:'s| is) (?:my|the|this) (?:story|text|piece|draft|bible|world|book) (?:about|like)|understand\w*|feedback|thoughts?|make of)\b/i;
/** Words that point at the writer's own text even when no one says "my story": "this bible", "in the text", "what I pasted". */
const ABOUT_TEXT_MARKERS = /\b(?:this|the|my|our|that)\s+(?:bible|text|draft|manuscript|document|piece|chapter|outline|story|novel|book|script|essay|passage|world|timeline|notes|memo)\b|\bin\s+(?:the|my|this)\s+(?:text|draft|story|bible|book|chapter|document)\b|\bwhat\s+i\s+(?:pasted|shared|wrote|sent)\b|\byou\s+(?:just\s+)?read\b/i;
/** A question whose own words are found strongly in the writer's long text is about that text (BM25 over its sections), whatever it is called. */
const TEXT_MATCH_SCORE = 4.5;
/** One retry of a reply that repeats itself (the same opener, the same questions) costs another answer's time, so it is spent only when the repeat is clear. */
const VARIETY_RETRY = true;
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
const summarizeRead = (r) => ({ complete: r.complete, sections: r.sections, words: r.words, subject: r.subject, shown: r.shown.map((x) => x.i + 1), ...(r.notes ? { notes: { read: r.notes.modelRead, of: r.notes.total, listed: r.notes.listed } } : {}) });

const isShortQuestion = (t) => /\?\s*$/.test(String(t).trim()) && words(t).length <= 25;
/** Which questions are about the whole text (worth reading all of it first) and which ask for one fact in it (answered from the closest passages). */
export function wantsWholeText({ query = '', reading = null } = {}) {
  if (WHOLE_HINTS.test(query)) return true;
  if (reading?.task === 'feedback' || reading?.task === 'develop') return true;
  return !isLookupQuestion(query);
}
const NO_MODEL = { chat: async () => ({ text: null, route: 'builtin' }) };
/**
 * What NIE tells the writer about what it looked at (and, for an online model, what left the computer). It is kept on the message and shown under the
 * reply, not written into it: pasted at the end of every reply it made each reply end the same way.
 */
const lookedAt = (read, route) => [read && !read.complete ? describeReading(read) : '', describeSending(read, route)].filter(Boolean).join(' ');
/** What is kept on the reply about how it was made (small, for the writer's panel and for tests). */
const varietyRecord = (shape, got) => ({ ...(shape ? { shape: shape.id } : {}), ...(got?.polished?.rf?.dropped?.length || got?.retried ? { variety: { dropped: (got.polished?.rf?.dropped ?? []).map((d) => d.kind), retried: Boolean(got.retried) } } : {}) });
/** What NIE drew on from earlier in the project, kept on the reply so the writer can see it: their own words and where each came from. */
const recalledRecord = (r) => r.items.map((i) => ({ where: i.where, text: clip(i.text, 160) }));
const retryNote = (rf, text) => `Your first attempt at this reply repeated how you have been replying (${rf.reasons.join('; ') || 'the same opening and questions'}). Write it again from scratch, differently: do not begin the way that attempt began ("${clip(String(text).split(/(?<=[.!?])\s+/)[0] ?? '', 90)}"), do not praise, and do not end with a question you have asked before.`;

/** After this many model readings in a row fail, stop asking for a few messages (the rules read them) so a broken model never doubles the wait. */
const READING_FAILURES_BEFORE_PAUSE = 2;
const READING_PAUSE_MESSAGES = 5;
// The first reading after the model starts also has to load and warm it (a freshly downloaded model on an ordinary PC took longer than 25 s on a
// Windows runner, so every first message was read by the rules); once one reading has worked, a stalled one is given up on quickly.
const COLD_READING_MS = 100000;
const WARM_READING_MS = 25000;

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
  #readWarm = false;
  #styles = new Map();
  #extractFailures = 0;
  #extractPause = 0;
  #analyses = new Map();

  /**
   * @param {{ engine: import('../ai/engine.js').AIEngine, readNotes?: boolean, variety?: 'full'|'prompt'|'legacy', agent?: object|null }} o
   *   `readNotes: false` and `variety` exist so scripts/notes-lab.mjs can measure each new layer against the one before on the real model:
   *   'legacy' = the earlier prompt wording and nothing else; 'prompt' = the new wording; 'full' (the app) = + a different shape each turn, what not to repeat, and cleaning.
   *   `agent: null` turns the idea agent off (agent/: the sheet of the writer's own words, the paced questions, the offer to keep an idea), for the lab's A/B runs.
   *   `mind: false` stops NIE recalling what the writer said earlier (mind/), `editor: false` stops the measured facts about a long text (editor/): both only for A/B runs.
   */
  constructor({ engine, readNotes = true, variety = 'full', agent = defaultAgent, mind = true, editor = true }) {
    this.engine = engine;
    this.readNotes = readNotes;
    this.variety = variety;
    this.agent = agent;
    this.mind = mind;
    this.editor = editor;
  }

  /** The project is being left: nothing computed from its text or words is kept for the next one (the caches are keyed by content, so this is belt and braces). */
  reset() {
    this.#styles.clear();
    this.#analyses.clear();
    clearGroundingCache();
  }

  /** The measured facts about a long text (cast, pacing, voice, figures, the writer's rules...), computed once per text and kept for a few turns. Null if anything goes wrong: they are an extra. */
  #analysisFor(text, notes, project) {
    try {
      const per = notes?.per ?? null;
      const key = analysisKey({ text, notes: per, project });
      let a = this.#analyses.get(key);
      if (!a) {
        a = analyseText({ text, index: indexFor(text), notes: per, project });
        this.#analyses.set(key, a);
        if (this.#analyses.size > 3) this.#analyses.delete(this.#analyses.keys().next().value);
      }
      return a;
    } catch {
      return null;
    }
  }

  /** What NIE can recall of this project for this message, or null. Called BEFORE the message itself is remembered (so it can never recall itself). */
  #recallFor(project, text, reading, { limit = 5, budgetTokens = 360, agentTurn = null } = {}) {
    if (!this.mind || !text) return null;
    try {
      const r = recall(project, [text, reading?.topic].filter(Boolean).join(' '), { limit, budgetTokens, includeSheet: !agentTurn, excludeText: text });
      return r.items.length ? r : null;
    } catch {
      return null; // the mind is an extra: it never gets in the way of a reply
    }
  }

  /** Keep what the writer just told NIE (their own words) for the life of this project. */
  #remember(project, text, kind = 'told') {
    if (!this.mind) return;
    try {
      rememberStatements(project, text, { kind });
    } catch {
      /* an extra */
    }
  }

  /** "What do you remember?": the real count and the newest, most deliberate things, in the writer's own words. */
  #memoryReply(project) {
    const d = describeMind(project);
    const pick = d.items.filter((i) => ['said', 'kept', 'character', 'theme', 'premise', 'rule', 'deliberate', 'sheet'].includes(i.source) && !i.by).slice(0, 8);
    return [
      d.summary,
      pick.length ? `A few of them, in your words:\n${pick.map((i) => `• ${clip(i.text, 140)} (${i.where})`).join('\n')}` : '',
      'All of it is listed under "Everything NIE holds" next to the chat, where you can look through it and remove what you like. It belongs to this project only: no other project can see it.',
    ].filter(Boolean).join('\n\n');
  }

  /**
   * The model call the agent may use to read an idea into its sheet (schema-constrained JSON, purpose 'extract'). Null when no model is running or when
   * it keeps failing: then the rules read the idea instead, and the sheet only ever holds the writer's own words either way.
   */
  #extractChat() {
    if ((this.engine.route?.() ?? 'builtin') === 'builtin') return null;
    if (this.#extractPause > 0) {
      this.#extractPause--;
      return null;
    }
    const failed = () => {
      if (++this.#extractFailures >= 2) {
        this.#extractPause = 5;
        this.#extractFailures = 1;
      }
    };
    return async (messages, opts) => {
      try {
        const r = await this.engine.chat(messages, opts);
        if (r?.text) this.#extractFailures = 0;
        else failed();
        return r;
      } catch (err) {
        if (err?.kind === 'abort') throw err;
        failed();
        return null;
      }
    };
  }

  /** What the offline library says about the form and genres in play, as short lines for the agent's brief (never shown as the writer's own). */
  #libraryNotes(project, text) {
    const packs = this.agent.packs;
    const state = this.agent.state(project);
    const seen = detectProject(text, { packs });
    const ids = [seen.form ?? state.form, ...(seen.genres.length ? seen.genres : state.genres)].filter(Boolean);
    const out = [];
    for (const id of ids.slice(0, 2)) {
      const label = [...(packs.forms ?? []), ...(packs.genres ?? [])].find((a) => a.id === id)?.label;
      const entry = label ? search(label, { limit: 3 }).find((e) => e.kind === 'genre' || e.kind === 'form') : null;
      if (entry) out.push(`${entry.name}: ${clip([entry.summary, entry.conv?.[0]].filter(Boolean).join(' '), 200)}`);
    }
    return out;
  }

  /** One turn of the idea agent. It never gets in the way of a reply: if it fails (other than a Stop), the message is answered as before. */
  async #agentTurn({ project, text, reading, kindHint, signal, past }) {
    if (!this.agent) return null;
    try {
      return await this.agent.turn({
        project, message: text, reading, chat: this.#extractChat(), kindHint, signal,
        recentMessages: past.filter((m) => m.role === 'user').slice(-6).map((m) => String(m.content).slice(0, 600)),
        libraryNotes: this.#libraryNotes(project, text),
      });
    } catch (err) {
      if (err?.kind === 'abort') throw err;
      return null;
    }
  }

  /** The agent answered by itself (the offer, the writer's yes, a style command...): no model is needed or called. */
  #handled(project, intent, turn, onToken) {
    const h = turn.handled;
    intent.reading ??= rulesReading(intent, 'exact');
    if (h.kind === 'added') this.#remember(project, project.conversation.messages.at(-1)?.content ?? '', 'added'); // a detail the writer added before keeping the idea
    onToken?.(h.reply, h.reply);
    return this.#finish(project, intent, h.reply, 'builtin', false, { suggestions: h.suggestions, agent: { handled: h.kind, ...(h.committed ? { kept: true } : {}) } });
  }

  /** Chips after a reply that asked a question: an honest way out of it, and the way to keep what there is. */
  #agentChips(turn, project) {
    const plan = turn?.plan;
    if (turn?.handled?.kind === 'asked-kind') return turn.handled.suggestions; // "what are you making?" comes with its answers as chips
    const n = filledIds(this.agent.state(project)).length;
    const keep = n >= 2 ? [{ label: 'Keep this idea', text: '', send: { ask: 'Keep this idea.' } }] : [];
    if (plan?.act === 'ask') return [{ label: 'Not sure yet', text: '', send: { ask: "I'm not sure yet." } }, { label: 'Skip that one', text: '', send: { ask: 'Skip that one.' } }, { label: 'Add more details', text: 'Let me add more details: ' }, ...keep];
    return null;
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
    const r = await understandMessage({ engine: this.engine, text, history, signal, timeoutMs: this.#readWarm ? WARM_READING_MS : COLD_READING_MS });
    if (!r.ok) {
      if (++this.#readFailures >= READING_FAILURES_BEFORE_PAUSE) {
        this.#readPause = READING_PAUSE_MESSAGES;
        this.#readFailures = READING_FAILURES_BEFORE_PAUSE - 1; // one more failure after the pause pauses again
      }
      return (intent.reading = rulesReading(intent, 'model-reading-failed'));
    }
    this.#readFailures = 0;
    this.#readWarm = true;
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
  async brainstorm({ project, message, onToken, onProgress, signal, kind: kindOpt = null, lens: lensOpt = null }) {
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

    // "What do you remember about my project?" is answered from what is really held (its count and the writer's own words), never by the model: it would make it up.
    // (Before the Idea Board commands: "what do you remember" is about everything NIE holds, not only the board.)
    if (this.mind && !paste && text.length <= 240 && MIND_QUESTION.test(text)) {
      intent.reading = rulesReading(intent, 'exact');
      const reply = this.#memoryReply(project);
      onToken?.(reply, reply);
      return this.#finish(project, intent, reply, 'builtin', false, { agent: { act: 'memory' } });
    }

    // Idea Board commands are exact and need no model.
    if (intent.type === 'remember') {
      intent.reading = rulesReading(intent, 'exact');
      // "remember this" with an idea being followed keeps the whole idea (what is recorded, and what is missing); "remember: the cat can talk" is a single note
      if (!intent.memory.note || parseKeepCommand(text)) {
        const kept = await this.#agentTurn({ project, text, reading: intent.reading, kindHint: kindOpt, signal, past: history.slice(0, -1) });
        if (kept?.handled) return this.#handled(project, intent, kept, onToken);
      }
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

    // The writer's answer to an offer to keep the idea ("yes", "not yet", "also, ...") is read by the agent's rules first: it needs no model, so it is instant.
    const past = history.slice(0, -1);
    let agentTurn = null;
    if (this.agent && this.agent.state(project).pending?.kind === 'offer') {
      agentTurn = await this.#agentTurn({ project, text: askText, reading: null, kindHint: kindOpt, signal, past });
      if (agentTurn?.handled && agentTurn.handled.kind !== 'asked-kind') return this.#handled(project, intent, agentTurn, onToken);
    }

    // What is the writer asking? The language model reads the message when one is running; the rules read it otherwise.
    // The model only returns a label, so it cannot write anything; a "write"/"edit" label gets the same fixed decline.
    const reading = await this.#read({ intent, text: paste ? paste.ask || text.slice(0, 450) : text, history: history.slice(0, -1), signal, button: Boolean(lensOpt) }); // a tapped quick-action already says what it is
    userMsg.intent = intent.type;
    if (declines()) return decline();
    if (intent.type === 'about-nie') return this.#about({ project, intent, text: askText, onToken });
    const byModel = reading.by === 'model';

    // The idea agent: what is being made, what the writer has said about it (in their own words), whether this turn asks something, and whether it is time to offer
    // to keep the idea. A question, a request or a pasted text is served, never recorded as part of the idea.
    // (A button or a typed "develop this idea" is a request for help, not something told to the agent.)
    const requesting = lensOpt || intent.type === 'develop-idea' ? { ...reading, task: 'ideas' } : reading;
    agentTurn ??= await this.#agentTurn({ project, text: askText, reading: requesting, kindHint: kindOpt, signal, past });
    if (agentTurn?.handled && agentTurn.handled.kind !== 'asked-kind') return this.#handled(project, intent, agentTurn, onToken);
    if (agentTurn?.note) {
      // what the agent did on the way ("Kept.", "I've set the earlier idea aside") comes first, before the answer streams
      const lead = `${agentTurn.note}\n\n`;
      const emit = onToken;
      onToken = emit ? (d, full) => emit(d, lead + full) : emit;
    }

    // What the writer said EARLIER in this project (at any time, not just the last few turns) that bears on this message; then this message is remembered too.
    // (Recall comes first so that a message can never recall itself.) A turn that only acknowledges and asks gets a few items, a turn that answers or gives ideas gets more.
    const shortTurn = ['ask', 'reflect'].includes(agentTurn?.plan?.act);
    const recalled = paste ? null : this.#recallFor(project, askText, reading, { limit: shortTurn ? 3 : 6, budgetTokens: shortTurn ? 230 : 400, agentTurn });
    const toldNie = !paste && !/\?\s*$/.test(askText) && (agentTurn?.act === 'info' || agentTurn?.act === 'answer' || ['tell', 'develop'].includes(reading.task));
    if (toldNie) this.#remember(project, askText, agentTurn?.act === 'answer' ? 'answered' : 'told');

    // Is this a question about the writer's own long text (a recent paste, or the project's Story Text) even though it never says "my story"?
    // "What is sedgewire made of?" is asked of the text, not of the craft library, and a small model labels it a general question.
    const aboutText = this.#aboutLongText({ project, text: askText, history: history.slice(0, -1) });

    // A general question about craft, style, usage, a form, genre or work: answer from the offline library, with its sources.
    // (Not a premise: it must not become the story's working premise.)
    let lib = null;
    let libMiss = false;
    let ownProject = false;
    const libraryCandidate = text.length > LONG_MESSAGE_CHARS || aboutText || BARE_REPLY.test(text) ? false : byModel ? reading.task === 'craft' : intent.type === 'discuss' || intent.type === 'craft-question' || (intent.type === 'share-premise' && GENERAL_Q.test(text));
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

    if (isIdeaAsk || develop) return this.#ideas({ project, intent, text, kind, lens, develop, note: [agentTurn?.note, note].filter(Boolean).join('\n\n'), reading, recalled, onToken, onProgress, signal });

    // ── Conversation (not an idea request) ───────────────────────────────────
    const interp = interpretProfile(project.profile, { text: project.storyText });
    const doc = this.#documentFor({ project, text, intent, reading, history: past, aboutText });
    const noAsk = doc.userMessage === PASTED_NO_ASK;
    // A long text is read section by section first (once: the notes are kept), so NIE can talk about all of it, not five excerpts.
    const notes = await this.#notesFor({ project, doc, reading, noAsk, onProgress, signal });
    // Measured facts about the text (counted by the program: cast, pacing, voice, figures, the writer's rules): the model is given them instead of having to infer them.
    const analysis = doc.document?.text && this.editor ? this.#analysisFor(doc.document.text, notes, project) : null;
    if (analysis && noAsk) {
      // A text pasted with no question: what NIE found in it, from the counts, and one question put to you. No model has to word it, so it cannot make anything up.
      const frame = readbackFrame({ analysis, notes: notes?.per ?? null, overview: notes?.overview ?? '', style: notes?.style ?? '', project });
      const reply = [frame.lines.join('\n'), frame.question].filter(Boolean).join('\n\n');
      if (reply) {
        const full = agentTurn?.note ? `${agentTurn.note}\n\n${reply}` : reply;
        onToken?.(full, full);
        return this.#finish(project, intent, full, 'builtin', false, { agent: { act: 'readback' } });
      }
    }
    // (A single-fact question — "what colour was the door?" — is answered from the closest passages; the counts only help when it asks about something that is counted.)
    const measuredQuery = doc.document?.query || askText;
    const evidence = analysis && !noAsk && (!isLookupQuestion(measuredQuery) || ASKS_FOR_COUNTS.test(measuredQuery)) ? editorialEvidence({ analysis, query: measuredQuery, budgetTokens: 380 }) : null;
    // (A turn that only acknowledges and asks is steered by the idea agent's brief, which carries the genre's conventions; the general reference notes add prompt to read for little.)
    const steeredShort = Boolean(agentTurn) && !lib && !libMiss && !aboutText && !noAsk && ['ask', 'reflect'].includes(agentTurn.plan?.act);
    const retrieved = lib ? [...new Map([...lib.entries, ...lib.related, ...this.retrieve(project, askText)].map((e) => [e.id, e])).values()].slice(0, 6) : this.retrieve(project, askText).slice(0, steeredShort ? 2 : 6);
    const shared = intent.type === 'share-passage' ? text : '';
    const passage = doc.document ? '' : shared; // a long paste is already shown through the reading block; do not show its opening a second time
    const report = shared ? scan({ text: doc.document?.subject === 'passage' ? doc.document.text : shared, project }) : null;
    // How to build this reply, which differs from the last ones; and what not to say again (openers, questions already asked).
    const plan = agentTurn?.plan ?? null;
    const asking = plan ? plan.act === 'ask' : undefined; // the shape of the reply agrees with the agent's plan for this turn (ask one question, or none)
    const shape = this.variety !== 'full' || lib || libMiss || reading.task === 'chat' ? null : shapeFor({ history: past, kind: noAsk ? 'readback' : aboutText ? 'lookup' : isShortQuestion(askText) ? 'question' : 'conversation', seed: text, asks: noAsk || aboutText ? undefined : asking });
    // What the agent wants of this reply (what it understands so far, what is not known, this turn's job) goes after the reading note.
    // (Not when the library answers, when the question is about the writer's text, or when the model could not tell what was asked: then the answer is a clarifying question, not the plan.)
    const steer = Boolean(agentTurn) && !lib && !libMiss && !aboutText && !noAsk && !(reading.by === 'model' && reading.task === 'unclear');
    const brief = steer ? agentTurn.brief : '';
    // (With no model, a writer who simply tells NIE about the idea gets an acknowledgement of what was recorded. A reply that has its own content stays: a change of direction, a pasted passage, the first sparks.)
    const telling = steer && Boolean(agentTurn.ack) && (agentTurn.act === 'info' || agentTurn.act === 'answer') && ['share-premise', 'discuss'].includes(intent.type);

    const composeArgs = {
      mode: 'brainstorm',
      project,
      interp,
      userMessage: doc.userMessage,
      document: doc.document ? { ...doc.document, notes, style: notes ? '' : this.#styleOf(doc.document.text) } : null,
      // A question about what the text SAYS is self-contained: the brainstorm before it only pulls the answer toward the last idea (measured on the real model)
      // and costs prompt space.
      history: aboutText ? [] : past,
      retrieved,
      legacy: this.variety === 'legacy',
      extra: [shape ? `How to build this reply: ${shape.text}` : '', this.variety === 'full' ? avoidBlock(past) : '', noAsk || aboutText ? '' : readingNote(reading, text, { ownProject }), lib || libMiss ? '' : evidence?.block ?? '', lib || libMiss || noAsk ? '' : recalled?.block ?? '', brief, report ? `The writer's rules and offline checks found: ${report.headline}` : lib ? LIBRARY_NOTE : libMiss ? LIBRARY_MISS_NOTE : ''].filter(Boolean).join('\n\n'),
    };
    const turnTokens = aboutText ? 320 : brief && plan.act !== 'serve' ? SHORT_TURN_TOKENS : 700;
    const got = await this.#askClean({ composeArgs, history: past, known: [text, project.storyText], onToken, signal, temperature: aboutText ? 0.3 : 0.7, maxTokens: turnTokens, steered: Boolean(brief) });
    const asked = got.asked;
    const res = asked.res;
    const modelReady = asked.modelReady;
    const status = this.engine.status?.() ?? null;

    let reply;
    let route = res.route;
    let extra = {};
    let honesty = asked.failure && modelReady ? modelFailedNote(asked.failure) : '';
    let ungrounded = '';
    if (res.text) {
      const guarded = got.polished.guarded;
      reply = brief ? holdToPlan(finishedSentences(guarded.text, turnTokens), plan, agentTurn, askText) : guarded.text; // one question at most, the one planned, about THIS project and never one already asked
      if (analysis && reply) {
        // An answer about the writer's text may only name what the text (or the writer) names: measured on the real model, replies invented names, numbers and set-ups.
        const g = groundNames(reply, {
          sources: [doc.document.text, profileCorpus(project.profile), evidence?.block ?? '', recalled?.block ?? '', ...project.conversation.messages.filter((m) => m.role === 'user').map((m) => m.content)],
          known: ['NIE', project.title, ...project.memory.characters.flatMap((c) => [c.name, ...(c.aliases ?? [])])].filter(Boolean),
          sections: analysis.sectionCount,
        });
        if (g.removed.length) {
          reply = g.text;
          ungrounded = g.emptied ? 'all' : 'some';
        }
      }
      // If nothing but a composed passage was left, say it with built-in guidance instead.
      if (guarded.removed && words(guarded.remaining).length < 8) reply = '';
      if (!reply) {
        reply = builtinReply({ intent, project, message: askText, report, modelReady: true, status });
        if (steer) reply = agentTurn.enforce(telling ? agentTurn.ack : withoutQuestionLists(reply));
        route = 'builtin';
        honesty = ungrounded === 'all' ? UNGROUNDED_NOTE : WITHHELD_NOTE;
      }
    } else {
      reply = lib ? libraryReply(lib) : libMiss ? libraryMissReply(answerFromLibrary(text)) : builtinReply({ intent, project, message: askText, report, modelReady: modelReady && Boolean(asked.failure), status });
      if (steer) reply = agentTurn.enforce(telling ? agentTurn.ack : withoutQuestionLists(reply)); // told something, no model: a short acknowledgement of what was recorded, and the planned question
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
      const tail = shortenedNote(asked.trimmed);
      if (tail) reply = `${reply}\n\n${tail}`;
      if (ungrounded === 'some') reply = `${reply}\n\n${LEFT_OUT_UNGROUNDED}`;
      if (recalled && !lib && !libMiss) extra = { ...extra, recalled: recalledRecord(recalled) };
      if (asked.read) extra = { ...extra, read: summarizeRead(asked.read), looked: lookedAt(asked.read, route) };
      extra = { ...extra, ...varietyRecord(shape, got) };
    }
    // Remember the question that was really asked (so it is never asked again), and what the agent did on the way.
    if (steer) agentTurn.record(reply);
    if (agentTurn?.note) {
      reply = `${agentTurn.note}\n\n${reply}`;
      if (extra.lead) extra = { ...extra, lead: `${agentTurn.note}\n\n${extra.lead}` };
    }
    const chips = agentTurn ? this.#agentChips(agentTurn, project) : null;
    return this.#finish(project, intent, reply, route, false, { ...extra, ...(chips ? { suggestions: chips } : {}), ...(plan ? { agent: { act: plan.act, ...(plan.slot ? { slot: plan.slot } : {}), reason: plan.reason } } : {}) });
  }

  /** The long text a follow-up could be about: a recent long paste (its body), else the project's Story Text; null when there is none. */
  /** The newest long paste still held in full (an older one has been cut to its start, `compactOldPastes`) among the last `within` messages. */
  #pastedText(history, within) {
    const from = Number.isFinite(within) ? Math.max(0, history.length - within) : 0;
    for (let i = history.length - 1; i >= from; i--) {
      const m = history[i];
      if (m.role === 'user' && !m.compacted && m.content.length > LONG_MESSAGE_CHARS) return m;
    }
    return null;
  }

  #candidateText(project, history) {
    const recent = this.#pastedText(history, Infinity);
    if (recent) return splitPaste(recent.content).body;
    const story = project.storyText ?? '';
    return story.trim().length >= STORY_TEXT_MIN_CHARS ? story : null;
  }

  #aboutLongText({ project, text, history }) {
    if (!text || text.length > LONG_MESSAGE_CHARS) return false;
    const doc = this.#candidateText(project, history);
    if (!doc || estimateTokens(doc) <= 1500) return false;
    if (ABOUT_TEXT_MARKERS.test(text)) return true;
    const top = searchText(indexFor(doc), text, { limit: 1 })[0];
    return Boolean(top && top.score >= TEXT_MATCH_SCORE);
  }

  #styleOf(text) {
    const key = `${text.length}:${fnv1a(text)}`;
    let style = this.#styles.get(key);
    if (style === undefined) {
      style = styleProfile(text).promptLine;
      this.#styles.set(key, style);
      if (this.#styles.size > 3) this.#styles.delete(this.#styles.keys().next().value);
    }
    return style;
  }

  /**
   * The long text (if there is one) this message is about, and what the writer actually asked.
   *  - a long pasted message is the text itself; its short first/last paragraph is the ask;
   *  - a follow-up soon after such a paste is about that paste, unless it says "my story/draft…";
   *  - otherwise the project's Story Text, for anything about the writer's own work.
   * Nothing is cut off: the composer shows an outline of the whole plus the parts that matter, and `read` records what was shown.
   * @returns {{ document: {text:string,query:string,topic:string,subject:string}|null, userMessage: string }}
   */
  #documentFor({ project, text, intent, reading, history, aboutText = false }) {
    const task = reading?.task ?? null;
    const aboutWork = aboutText || (!['craft', 'about-nie', 'chat', 'write', 'edit'].includes(task) && !['library-question', 'greeting', 'about-nie'].includes(intent.type));
    const topic = reading?.topic ?? '';
    if (text.length > LONG_MESSAGE_CHARS) {
      const { ask, body } = splitPaste(text);
      return { document: { text: body, query: ask, topic, subject: 'passage' }, userMessage: ask || PASTED_NO_ASK };
    }
    if (!aboutWork) return { document: null, userMessage: text };
    // ("my story" means the project's Story Text when there is one; with none, the text just pasted is what they mean.)
    if (!MENTIONS_OWN_TEXT.test(text) || project.storyText.trim().length < STORY_TEXT_MIN_CHARS) {
      // The newest pasted text stays attached for a dozen messages. Later it is attached when the message is clearly about it (`aboutText`): a session can run for
      // hundreds of messages and a text pasted at the start is still the writer's, not forgotten after twelve.
      const paste = this.#pastedText(history, aboutText ? Infinity : 12);
      if (paste) return { document: { text: splitPaste(paste.content).body, query: text, topic, subject: 'passage' }, userMessage: text };
    }
    // Telling NIE something new about the project does not need the old text in front of it (and costs the model time to read): feedback, ideas and talk do.
    if ((aboutText || task !== 'tell') && project.storyText.trim().length >= STORY_TEXT_MIN_CHARS) return { document: { text: project.storyText, query: text, topic, subject: 'text' }, userMessage: text };
    return { document: null, userMessage: text };
  }

  /**
   * Read a long text one section at a time (the model, locally, once: every note is kept by the section's hash, so only new or edited sections are read
   * again and a stopped read carries on where it stopped). Returns what NIE knows of the text, or null when the text is short enough to show whole, no
   * model is running here, or the question is one fact that the closest passages answer (nothing is read for that; notes made earlier are still used).
   * Progress goes to `onProgress`; Stop (the signal) rethrows with the notes made so far already kept.
   */
  async #notesFor({ project, doc, reading, noAsk, onProgress, signal }) {
    const document = doc.document;
    if (!document?.text || !this.readNotes) return null;
    const index = indexFor(document.text);
    const N = index.sections.length;
    if (N < 2 || estimateTokens(document.text) <= 1500) return null; // short enough to be shown whole (the reading block does that itself)
    try {
      const cache = projectNotesCache(project);
      const mayRead = (this.engine.route?.() ?? 'builtin') === 'local' && N <= MAX_NOTE_SECTIONS && (noAsk || wantsWholeText({ query: document.query ?? '', reading }));
      let per;
      let modelRead;
      let complete = false;
      let failed = false;
      if (mayRead) {
        const cached = index.sections.filter((s) => cache.get(sectionKey(s))).length;
        onProgress?.({ stage: 'reading', done: 0, total: N, cached, etaMs: null });
        const r = await readThrough({ engine: this.engine, index, cache, signal, maxSections: MAX_NOTE_SECTIONS, coldMs: COLD_NOTE_MS, warmMs: WARM_NOTE_MS, onProgress: (p) => onProgress?.({ stage: 'reading', ...p }) });
        ({ notes: per, modelRead, complete, failed } = r);
      } else {
        per = index.sections.map((s) => cache.get(sectionKey(s)) ?? null);
        modelRead = per.filter((n) => n && (n.by === 'model' || n.by === 'text')).length;
        complete = modelRead === N;
      }
      if (!modelRead) return null;
      let overview = '';
      if (complete) {
        if (mayRead) onProgress?.({ stage: 'overview', done: N, total: N });
        const total = index.sections.reduce((a, x) => a + x.words, 0);
        overview = (await makeOverview({ engine: mayRead ? this.engine : NO_MODEL, notes: per, cache, signal, words: total, sections: N })).text;
      }
      return { per, overview, style: this.#styleOf(document.text), modelRead, total: N, complete, failed };
    } catch (err) {
      if (err?.kind === 'abort') throw err;
      return null; // notes are an extra: if reading them fails, NIE answers from the closest passages as before
    }
  }

  /**
   * Ask, then clean the reply of what makes NIE sound the same each time (praise openers, stock questions, a question it already asked); when it
   * still repeats itself clearly, ask once more with a note saying how. Never adds a word of its own.
   */
  async #askClean({ composeArgs, history, known, onToken, signal, temperature, maxTokens = 700, steered = false }) {
    const polish = (res) => {
      const g = guardReply(res.text, known);
      let rf = this.variety === 'full' ? refine(g.remaining, { history }) : { text: g.remaining, dropped: [], retry: false, reasons: [] };
      // "How does the writer maintain the reader's curiosity...?" said TO the writer: ask once more (the prompt says "you"; a 3B model sometimes copies the instructions' own wording)
      if (this.variety === 'full' && findThirdPerson(rf.text).length) rf = { ...rf, retry: true, reasons: [...rf.reasons, 'it talks about "the writer" to the writer instead of saying "you"'] };
      return { rf, guarded: { remaining: rf.text, removed: g.removed, text: g.removed ? `${rf.text}\n\n${LEFT_OUT_NOTICE}`.trim() : rf.text } };
    };
    let asked = await this.#ask({ composeArgs, onToken, signal, temperature, maxTokens });
    let polished = asked.res.text ? polish(asked.res) : null;
    let retried = false;
    // (Too many questions alone is not worth a second answer when the idea agent steers the reply: it keeps the one planned question and cuts the rest.)
    const worthRetry = polished?.rf.retry && !(steered && polished.rf.reasons.every((r) => r === 'it asks too many questions'));
    if (VARIETY_RETRY && worthRetry && asked.res.route !== 'builtin') {
      retried = true;
      const again = await this.#ask({ composeArgs: { ...composeArgs, extra: [composeArgs.extra, retryNote(polished.rf, polished.rf.text)].filter(Boolean).join('\n\n') }, onToken, signal, temperature: Math.min(1, temperature + 0.15), maxTokens });
      if (again.res.text) {
        const second = polish(again.res);
        if (!(second.guarded.removed && words(second.guarded.remaining).length < 8)) {
          asked = again;
          polished = second;
        }
      }
    }
    return { asked, polished, retried };
  }

  /**
   * Ask the model. If it is ready but the call fails (usually a prompt too long for its window), retry ONCE with a much
   * smaller prompt before giving up. `modelReady` tells the caller whether "the model is missing" would be a lie.
   */
  async #ask({ composeArgs, onToken, signal, temperature, maxTokens = 700 }) {
    const ready = () => this.engine.localStatus?.().state === 'ready';
    const full = composeMessages(composeArgs);
    const read = full.reading;
    let failure = null;
    let res = null;
    try {
      res = await this.engine.chat(full.messages, { onToken, signal, maxTokens, temperature });
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
  async #ideas({ project, intent, text, kind, lens, develop, note, reading, recalled = null, onToken, onProgress, signal }) {
    const bs = project.brainstorm;
    const history = project.conversation.messages;
    const past = history.slice(0, -1);
    const doc = this.#documentFor({ project, text, intent, reading, history: past });
    const askText = doc.document?.subject === 'passage' && text.length > LONG_MESSAGE_CHARS ? doc.userMessage : text;
    const gen = develop ? { ideas: [] } : generateIdeas({ project, message: askText, kind, lens, count: 3 });
    const interp = interpretProfile(project.profile, { text: project.storyText });
    const notes = await this.#notesFor({ project, doc, reading, noAsk: doc.userMessage === PASTED_NO_ASK, onProgress, signal });
    const composeArgs = {
      mode: 'brainstorm',
      project,
      interp,
      userMessage: doc.userMessage,
      document: doc.document ? { ...doc.document, notes, style: notes ? '' : this.#styleOf(doc.document.text) } : null,
      history: past,
      retrieved: this.retrieve(project, askText),
      legacy: this.variety === 'legacy',
      extra: [ideaRequestBlock({ kind, lens, develop, note, seeds: gen.ideas.slice(0, 2).map((i) => i.text) }), recalled?.block ?? '', this.variety === 'full' ? avoidBlock(past) : ''].filter(Boolean).join('\n\n'),
    };
    const got = await this.#askClean({ composeArgs, history: past, known: [text, project.storyText], onToken, signal, temperature: 0.85 });
    const asked = got.asked;
    const res = asked.res;
    const fallbackNote = asked.failure && asked.modelReady ? modelFailedNote(asked.failure) : '';

    const lensLabel = lens ? (LENSES[lens]?.label ?? lens) : 'Idea';
    const toCards = (items) => items.map((t) => ({ id: ideaId(t), kind, lens: lens ?? 'mixed', lensLabel, text: t }));
    const firstTime = !history.some((m) => m.role === 'assistant' && m.ideas?.length);

    if (res.text) {
      const guarded = got.polished.guarded;
      if (!(guarded.removed && words(guarded.remaining).length < 8)) {
        const parsed = develop ? { ideas: [] } : parseIdeas(guarded.remaining);
        const ideas = toCards(parsed.ideas);
        const reply = guarded.text;
        if (ideas.length) markShown(project, ideas);
        bs.lastLens = lens;
        const lead = [note, parsed.lead].filter(Boolean).join('\n\n');
        const cut = shortenedNote(asked.trimmed);
        return this.#finish(project, intent, cut ? `${reply}\n\n${cut}` : reply, res.route, false, { ideas, lead: ideas.length ? lead : '', tail: [ideas.length ? parsed.tail : '', cut].filter(Boolean).join('\n\n'), kind, lens, ...(asked.read ? { read: summarizeRead(asked.read), looked: lookedAt(asked.read, res.route) } : {}), ...(recalled ? { recalled: recalledRecord(recalled) } : {}), ...varietyRecord(null, got) });
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
    const understood = intent.reading ? { by: intent.reading.by, task: intent.reading.task, topic: intent.reading.topic ?? '', ...(intent.reading.overruled ? { overruled: intent.reading.overruled } : {}), ...(/^model-reading-/.test(intent.reading.why ?? '') ? { why: intent.reading.why } : {}) } : null; // 'why' only when a running model could not read it
    if (understood) meta.understood = understood;
    if (extra.read) meta.read = extra.read; // what was looked at, for a long text
    if (extra.looked) meta.looked = extra.looked; // ...said in words, shown under the reply
    if (extra.shape) meta.shape = extra.shape; // how the reply was built, so the next one is built differently
    if (extra.variety) meta.variety = extra.variety;
    if (extra.fallback) meta.fallback = extra.fallback; // why the offline model's answer was not used (kept so it can be shown or reported)
    if (extra.recalled?.length) meta.recalled = extra.recalled; // what was recalled from earlier in the project for this reply
    if (extra.agent) meta.agent = extra.agent; // what the idea agent did this turn (asked, offered, kept...), for the panel and for tests
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
      looked: extra.looked ?? '',
      lead: extra.lead ?? '',
      tail: extra.tail ?? '',
      kind: extra.kind ?? null,
      lens: extra.lens ?? null,
      agent: extra.agent ?? null,
      recalled: extra.recalled ?? [],
      suggestions: extra.suggestions ?? (ideas.length && extra.lens !== 'develop' ? ideaSuggestions({ lens: extra.lens ?? null, ideas }) : nextSuggestions({ intent, project })),
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
