import { detectIntent, updateWorkingPremise } from '../intent/intent.js';
import { interpretProfile } from '../profile/interpret.js';
import { answerFromLibrary, forProfile, search } from '../knowledge/index.js';
import { appendMessage } from '../project/memory.js';
import { addToBoard, boardToChat, emptyBrainstorm, ideaId } from '../project/board.js';
import { scan, scanWithModel } from '../analysis/scan.js';
import { composeMessages, ideaRequestBlock } from './prompt.js';
import { builtinReply, DECLINE_EDIT, DECLINE_WRITE, libraryMissReply, libraryReply } from './builtin.js';
import { guardReply } from './guard.js';
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
  /** @param {{ engine: import('../ai/engine.js').AIEngine }} o */
  constructor({ engine }) {
    this.engine = engine;
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

    appendMessage(project, 'user', text, { intent: intent.type });

    // Idea Board commands are exact and need no model.
    if (intent.type === 'remember') return this.#keep(project, intent, onToken);
    if (intent.type === 'recall') {
      const reply = boardToChat(project);
      onToken?.(reply, reply);
      return this.#finish(project, intent, reply, 'builtin', false);
    }

    // NIE does not write or edit the writer's text. Decline clearly, without calling any model.
    if (intent.type === 'request-edit' || intent.type === 'request-write') {
      const reply = intent.type === 'request-edit' ? DECLINE_EDIT : DECLINE_WRITE;
      onToken?.(reply, reply);
      return this.#finish(project, intent, reply, 'builtin', true);
    }

    // A general question about craft, style, usage, a form, genre or work: answer from the offline library, with its sources.
    // (Not a premise: it must not become the story's working premise.)
    let lib = null;
    let libMiss = false;
    const libraryCandidate = intent.type === 'discuss' || intent.type === 'craft-question' || (intent.type === 'share-premise' && GENERAL_Q.test(text));
    if (libraryCandidate) {
      const general = GENERAL_Q.test(text) && !STORY_TALK.test(text);
      const a = answerFromLibrary(text);
      if (a.strength === 'strong' || (a.strength === 'weak' && general)) lib = a;
      else if (general && words(text).length >= 3) libMiss = true;
    }
    if (lib || libMiss) intent.type = 'library-question';

    if (intent.type !== 'library-question') project.conversation.workingPremise = updateWorkingPremise(project.conversation.workingPremise, text, intent);

    // ── What is being brainstormed, and is this a request for ideas? ──────────
    const asks = ASKS_FOR_IDEAS.test(text);
    const develop = intent.type === 'develop-idea' ? intent.idea : null;
    const ideaIntent = intent.type === 'request-ideas' || intent.type === 'discuss';
    let lens = lensOpt && lensOpt !== 'develop' ? lensOpt : null;
    if (!lens && ideaIntent && (asks || words(text).length <= 7)) lens = detectLens(text);
    if (!lens && ideaIntent && asks && WANTS_MORE.test(text)) lens = bs.lastLens; // "more!" repeats the last request
    if (lens && !LENSES[lens]) lens = null;
    const isIdeaAsk = !develop && (Boolean(lensOpt) || intent.type === 'request-ideas' || (intent.type === 'discuss' && (Boolean(lens) || (asks && /\bideas?\b/i.test(text)))));

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

    const { messages } = composeMessages({
      mode: 'brainstorm',
      project,
      interp,
      userMessage: text,
      passage: intent.type === 'feedback-request' ? project.storyText.slice(-1800) : '',
      history: history.slice(0, -1),
      retrieved,
      extra: report ? `The writer's rules and offline checks found: ${report.headline}` : lib ? LIBRARY_NOTE : libMiss ? LIBRARY_MISS_NOTE : '',
    });

    let res;
    try {
      res = await this.engine.chat(messages, { onToken, signal, maxTokens: 700, temperature: 0.7 });
    } catch (err) {
      if (err?.kind === 'abort') throw err;
      res = { text: null, route: 'builtin' };
    }

    let reply;
    let route = res.route;
    let extra = {};
    if (res.text) {
      const guarded = guardReply(res.text, [text, project.storyText]);
      reply = guarded.text;
      // If nothing but a composed passage was left, say it with built-in guidance instead.
      if (guarded.removed && words(guarded.remaining).length < 8) reply = '';
      if (!reply) {
        reply = builtinReply({ intent, project, message: text, report });
        route = 'builtin';
      }
    } else {
      reply = lib ? libraryReply(lib) : libMiss ? libraryMissReply(answerFromLibrary(text)) : builtinReply({ intent, project, message: text, report });
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
      onToken?.(reply, reply);
    }
    return this.#finish(project, intent, reply, route, false, extra);
  }

  /** Idea requests and "develop this idea": the model when it is running, otherwise the built-in idea library. */
  async #ideas({ project, intent, text, kind, lens, develop, note, onToken, signal }) {
    const bs = project.brainstorm;
    const history = project.conversation.messages;
    const gen = develop ? { ideas: [] } : generateIdeas({ project, message: text, kind, lens, count: 3 });
    const interp = interpretProfile(project.profile, { text: project.storyText });
    const { messages } = composeMessages({
      mode: 'brainstorm',
      project,
      interp,
      userMessage: text,
      history: history.slice(0, -1),
      retrieved: this.retrieve(project, text),
      extra: ideaRequestBlock({ kind, lens, develop, note, seeds: gen.ideas.slice(0, 2).map((i) => i.text) }),
    });

    let res;
    try {
      res = await this.engine.chat(messages, { onToken, signal, maxTokens: 700, temperature: 0.85 });
    } catch (err) {
      if (err?.kind === 'abort') throw err;
      res = { text: null, route: 'builtin' };
    }

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
        return this.#finish(project, intent, reply, res.route, false, { ideas, lead: ideas.length ? lead : '', tail: ideas.length ? parsed.tail : '', kind, lens });
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
    if (!composed) {
      const reply = builtinReply({ intent: { ...intent, type: 'request-ideas' }, project, message: text });
      onToken?.(reply, reply);
      return this.#finish(project, intent, reply, 'builtin', false, { kind, lens });
    }
    if (note) {
      composed.lead = `${note} ${composed.lead}`;
      composed.text = `${note} ${composed.text}`;
    }
    bs.lastLens = lens;
    onToken?.(composed.text, composed.text);
    return this.#finish(project, intent, composed.text, 'builtin', false, { ideas, lead: composed.lead, tail: composed.tail, kind, lens });
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
    if (ideas.length) Object.assign(meta, { ideas, lead: extra.lead ?? '', tail: extra.tail ?? '', kind: extra.kind ?? null, lens: extra.lens ?? null });
    appendMessage(project, 'assistant', reply, meta);
    project.conversation.suggestionShown = true;
    return {
      reply,
      intent,
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
