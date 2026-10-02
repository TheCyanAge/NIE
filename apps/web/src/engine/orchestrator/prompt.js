import { profileToPromptBlock } from '../profile/profile.js';
import { memoryToPromptBlock } from '../project/memory.js';
import { rulesToPromptBlock } from '../rules/rules.js';
import { describeForPrompt } from '../knowledge/index.js';
import { clip, estimateTokens } from '../util/text.js';

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
  brainstorm: `Mode: brainstorming. Respond to what the writer just said. Build on it, offer a few concrete ideas or angles when useful (as ideas, not as drafted text), and end with a question that moves the idea forward. If they change direction, follow the new direction and say what it changes.`,
};

export const MODE_NAMES = Object.keys(MODES);

const BUDGET = { profile: 1200, rules: 1000, memory: 1100, knowledge: 1300, passage: 3600, history: 2600 };

function section(title, body) {
  return body ? `\n\n## ${title}\n${body}` : '';
}

export function buildSystem({ mode = 'brainstorm', project, interp }) {
  const profile = profileToPromptBlock(project.profile, BUDGET.profile);
  const rules = rulesToPromptBlock(project, BUDGET.rules);
  const memory = memoryToPromptBlock(project, BUDGET.memory);
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
 * @returns {{ messages: {role:string, content:string}[], tokens: number }}
 */
export function composeMessages({ mode = 'brainstorm', project, interp, userMessage, passage = '', history = [], retrieved = [], extra = '' }) {
  const system = buildSystem({ mode, project, interp });
  const userParts = [];
  if (retrieved.length) userParts.push(`Reference notes (tools the writer may use or break, not rules):\n${describeForPrompt(retrieved, BUDGET.knowledge)}`);
  if (passage) userParts.push(`The writer's passage (for reference only; do not rewrite it):\n"""\n${clip(passage, BUDGET.passage)}\n"""`);
  if (extra) userParts.push(extra);
  userParts.push(userMessage);

  const messages = [{ role: 'system', content: system }, ...trimHistory(history), { role: 'user', content: userParts.join('\n\n') }];
  return { messages, tokens: messages.reduce((a, m) => a + estimateTokens(m.content), 0) };
}
