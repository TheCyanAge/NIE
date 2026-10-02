import { detectIntent, updateWorkingPremise } from '../intent/intent.js';
import { interpretProfile } from '../profile/interpret.js';
import { forProfile, search } from '../knowledge/index.js';
import { appendMessage } from '../project/memory.js';
import { scan, scanWithModel } from '../analysis/scan.js';
import { composeMessages } from './prompt.js';
import { builtinReply, DECLINE_EDIT, DECLINE_WRITE } from './builtin.js';
import { guardReply } from './guard.js';
import { nextSuggestions, STARTER } from './suggestions.js';
import { words } from '../util/text.js';

export { STARTER };

/**
 * NIE's orchestrator: one identity, regardless of what answers underneath.
 *
 *   Brainstorm: conversation about ideas. Never drafts or edits the writer's text.
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
   * One Brainstorm turn. Mutates `project` (conversation + working premise); the caller persists it.
   * @returns {{ reply: string, intent: object, route: string, suggestions: object[], declined: boolean }}
   */
  async brainstorm({ project, message, onToken, signal }) {
    const text = String(message ?? '').trim();
    const history = project.conversation.messages;
    const intent = detectIntent(text, { project, hasHistory: history.length > 0, mode: 'brainstorm' });

    appendMessage(project, 'user', text, { intent: intent.type });

    // NIE does not write or edit the writer's text. Decline clearly, without calling any model.
    if (intent.type === 'request-edit' || intent.type === 'request-write') {
      const reply = intent.type === 'request-edit' ? DECLINE_EDIT : DECLINE_WRITE;
      onToken?.(reply, reply);
      return this.#finish(project, intent, reply, 'builtin', true);
    }

    project.conversation.workingPremise = updateWorkingPremise(project.conversation.workingPremise, text, intent);

    const interp = interpretProfile(project.profile, { text: project.storyText });
    const retrieved = this.retrieve(project, text);
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
      extra: report ? `The writer's rules and offline checks found: ${report.headline}` : '',
    });

    let res;
    try {
      res = await this.engine.chat(messages, { onToken, signal, maxTokens: 600, temperature: 0.7 });
    } catch (err) {
      if (err?.kind === 'abort') throw err;
      res = { text: null, route: 'builtin' };
    }

    let reply;
    let route = res.route;
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
      reply = builtinReply({ intent, project, message: text, report });
      route = 'builtin';
      onToken?.(reply, reply);
    }
    return this.#finish(project, intent, reply, route, false);
  }

  #finish(project, intent, reply, route, declined) {
    appendMessage(project, 'assistant', reply, { route });
    project.conversation.suggestionShown = true;
    return { reply, intent, route, declined, suggestions: nextSuggestions({ intent, project }) };
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
