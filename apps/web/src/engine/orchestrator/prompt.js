import { profileToPromptBlock } from '../profile/profile.js';
import { memoryToPromptBlock } from '../project/memory.js';
import { boardToPromptBlock } from '../project/board.js';
import { LENSES, kindLabel, kindPhrase } from '../brainstorm/lenses.js';
import { leadNoun } from '../brainstorm/ideas.js';
import { rulesToPromptBlock } from '../rules/rules.js';
import { describeForPrompt } from '../knowledge/index.js';
import { clip, estimateTokens, fnv1a } from '../util/text.js';
import { buildIndex, readingContext } from '../reading/context.js';

/**
 * Prompt composition for conversation (Brainstorm). The 3B local model has a small context window, so every section
 * has a budget, and the *stable* parts (identity, profile, rules, memory) go first so llama.cpp can reuse its prompt
 * cache between turns. (Rule judging uses its own tiny prompt: see rules/judge.js.)
 */

export const SYSTEM_CORE = `You are NIE, a narrative collaborator for writers. Talk like a thoughtful editor who is also a friend: natural, direct, curious. Never write "NIE has identified", "NIE recommends" or "NIE flagged".
Always follow these rules:
1. You NEVER write, rewrite, edit or continue the writer's text. Do not draft prose, dialogue, scenes or replacement wording. You may discuss ideas, ask questions, explain craft, and point to where something is. If asked to write or rewrite, say you don't do that and offer what you can do.
2. Work only from this writer's project (below) and what they tell you. Never bring in characters, plots or genres from anywhere else.
3. Do not assume a genre or form. A report needs no character arc; a journal needs no three acts.
4. An unusual choice may be deliberate. Ask before calling something a mistake.
5. Protect the writer's voice. Never suggest polishing it into generic prose.
6. Be specific to what they told you. No generic advice.
7. If the writer has little to go on, start where they are and ask one to three good questions.
Keep replies short unless they ask for more.`;

const MODES = {
  brainstorm: `Mode: brainstorming partner for any literary project: stories, characters, worlds, articles, essays, memoir, poems, scripts. Be generous with ideas and keep the conversation going. Respond to what the writer just said and build on it. When ideas would help, give 3 to 5 numbered ideas, one or two sentences each: concepts, angles, complications or questions, never drafted prose, dialogue or scene text. Make them different from each other, specific to this project when it has a premise, and surprising rather than safe. Do not repeat ideas already given or kept. End with one question that moves the idea forward. If they change direction, follow the new direction and say what it changes.`,
};

export const MODE_NAMES = Object.keys(MODES);

const BUDGET = { profile: 1200, rules: 1000, memory: 1100, board: 800, knowledge: 1300, passage: 3600, history: 2600 };

function section(title, body) {
  return body ? `\n\n## ${title}\n${body}` : '';
}

export function buildSystem({ mode = 'brainstorm', project, interp }) {
  const profile = profileToPromptBlock(project.profile, BUDGET.profile);
  const rules = rulesToPromptBlock(project, BUDGET.rules);
  const memory = memoryToPromptBlock(project, BUDGET.memory);
  const board = boardToPromptBlock(project, BUDGET.board);
  const reading = [];
  if (interp) {
    reading.push(`Form: ${interp.form.label}${interp.form.source === 'text' ? ' (inferred from the text)' : ''}.`);
    if (!interp.form.traits.plot) reading.push('This form does not need a plot, character arc or dialogue — do not ask for them.');
    const tolerated = Object.keys(interp.tolerance).filter((k) => interp.tolerates(k));
    if (tolerated.length) reading.push(`The profile makes these plausibly deliberate: ${tolerated.join(', ')}. Ask rather than correct.`);
    if (interp.watchesOrnateLanguage) reading.push('The register is clinical/detached; ornate language is worth discussing.');
  }
  return (
    SYSTEM_CORE +
    '\n\n' +
    (MODES[mode] ?? MODES.brainstorm) +
    section('Project profile', profile || '(Nothing declared yet. Start from what the writer tells you; do not invent a genre.)') +
    section("The writer's rules for this project", rules) +
    section('Project memory', memory) +
    section('Idea Board', board) +
    section('How to read this writing', reading.join(' '))
  );
}

/** Trim history to a character budget, newest messages first. */
export function trimHistory(messages, maxChars = BUDGET.history) {
  const out = [];
  let used = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== 'user' && m.role !== 'assistant') continue;
    const content = clip(m.content, 900);
    if (used + content.length > maxChars) break;
    out.unshift({ role: m.role, content });
    used += content.length;
  }
  // A chat must start with a user turn for most templates.
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

/**
 * The local model reads at most 4,096 tokens at once, and a reply of up to 700 tokens plus the chat template's own markup
 * come out of that. A prompt over this estimate (3.6 characters per token) risks being refused by the model.
 */
export const PROMPT_TOKEN_LIMIT = 2900;
/** The smaller prompt used for one automatic retry after the model failed to answer. */
export const RETRY_TOKEN_LIMIT = 1500;

/** Indexing a long text is quick (about 0.3 s for a 150,000-word novel) but not free, and the same text is asked about turn after turn: keep the last few. */
const INDEXES = new Map();
export function indexFor(text) {
  const key = `${text.length}:${fnv1a(text)}`;
  let idx = INDEXES.get(key);
  if (!idx) {
    idx = buildIndex(text);
    INDEXES.set(key, idx);
    if (INDEXES.size > 3) INDEXES.delete(INDEXES.keys().next().value);
  }
  return idx;
}
export const clearIndexes = () => INDEXES.clear();

/**
 * Sections shrink in steps (reference notes, then history, then the passage) until the whole prompt fits.
 * The writer's own message is only ever shortened as a last resort, and `trimmed` says what was cut so the UI can be honest.
 * @returns {{ messages: {role:string, content:string}[], tokens: number, trimmed: string[] }}
 */
export function composeMessages({ mode = 'brainstorm', project, interp, userMessage, passage = '', document = null, history = [], retrieved = [], extra = '', limit = PROMPT_TOKEN_LIMIT, minimal = false }) {
  const system = buildSystem({ mode, project, interp });
  const count = (msgs) => msgs.reduce((a, m) => a + estimateTokens(m.content), 0);
  // A long text (a pasted passage, or the project's Story Text) is shown as an outline plus the parts that matter for THIS message, within what the
  // window has left after NIE's own instructions, the writer's message and a little room for earlier turns and reference notes.
  const docIndex = document?.text ? indexFor(document.text) : null;
  const docBudget = docIndex ? Math.min(1500, Math.max(450, limit - estimateTokens(system) - estimateTokens(userMessage) - 520)) : 0;
  let reading = null;
  const build = (scale, message) => {
    const userParts = [];
    if (retrieved.length && scale > 0) userParts.push(`Reference notes (tools the writer may use or break, not rules):\n${describeForPrompt(retrieved, Math.floor(BUDGET.knowledge * scale))}`);
    if (docIndex) {
      const ctx = readingContext({ index: docIndex, query: document.query ?? '', topic: document.topic ?? '', budgetTokens: scale > 0 ? Math.max(450, Math.floor(docBudget * scale)) : 450, subject: document.subject });
      reading = ctx.stats;
      if (ctx.block) userParts.push(`${ctx.block}\n\n(Reference only: this is the writer's own text. Do not rewrite, continue or quote it back at length.)`);
    }
    if (passage && scale > 0) userParts.push(`The writer's passage (for reference only; do not rewrite it):\n"""\n${clip(passage, Math.floor(BUDGET.passage * scale))}\n"""`);
    if (extra) userParts.push(extra);
    userParts.push(message);
    return [{ role: 'system', content: system }, ...(scale > 0 ? trimHistory(history, Math.floor(BUDGET.history * scale)) : []), { role: 'user', content: userParts.join('\n\n') }];
  };

  let messages = build(minimal ? 0 : 1, userMessage);
  let trimmed = minimal ? [retrieved.length && 'reference notes', history.length && 'earlier messages', passage && 'your passage'].filter(Boolean) : [];
  if (count(messages) > limit) {
    for (const scale of [0.6, 0.3, 0]) {
      messages = build(scale, userMessage);
      trimmed = [retrieved.length && 'reference notes', history.length && 'earlier messages', passage && 'your passage'].filter(Boolean);
      if (count(messages) <= limit) break;
    }
  }
  if (count(messages) > limit) {
    // Even alone, the writer's message does not fit: keep as much of it as the window allows.
    const overhead = count(build(0, ''));
    const room = Math.max(600, Math.floor((limit - overhead) * 3.6));
    messages = build(0, `${clip(userMessage, room)}\n\n(The writer's message was longer than the offline model can read at once; only the first part is shown here.)`);
    trimmed.push('your message');
  }
  return { messages, tokens: count(messages), trimmed, reading };
}

/**
 * The per-turn instruction for an idea request. It goes in the USER part (not the system prompt) so the system prompt stays
 * identical between turns and llama.cpp can reuse its prompt cache. `seeds` are example ideas from the offline library: they
 * show the size and kind of idea wanted and are explicitly not to be copied.
 */
export function ideaRequestBlock({ kind, lens, seeds = [], develop = null, note = '' }) {
  if (develop) {
    return [
      `The writer wants to develop this idea (${kindLabel(kind).toLowerCase()}): "${develop}"`,
      'Ask 2 or 3 sharp questions about it, then offer 2 or 3 directions it could take as short numbered ideas (concepts, not drafted text). End with one question.',
    ].join('\n');
  }
  const what = lens ? leadNoun(lens) : 'ideas';
  const lines = [`The writer wants ${what} for ${kindPhrase(kind)}${lens ? ` (${LENSES[lens]?.label ?? lens})` : ''}. Give 3 to 5 numbered ideas, one or two sentences each, then one question.`];
  if (note) lines.push(note);
  if (seeds.length) lines.push(`Examples of the size and kind of idea wanted. Do not copy them; be more specific to this writer's project:\n${seeds.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);
  return lines.join('\n');
}
