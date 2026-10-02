import { profileToPromptBlock } from '../profile/profile.js';
import { memoryToPromptBlock } from '../project/memory.js';
import { describeForPrompt } from '../knowledge/index.js';
import { clip, estimateTokens } from '../util/text.js';

/**
 * Prompt composition. The 3B local model has a small context window, so every section has a budget,
 * and the *stable* parts (identity, profile, memory) go first so llama.cpp can reuse its prompt cache between turns.
 */

export const SYSTEM_CORE = `You are NIE, a narrative collaborator for writers. Talk like a thoughtful editor who is also a friend: natural, direct, curious. Never write "NIE has identified", "NIE recommends" or "NIE flagged".
Always follow these rules:
1. Work only from this writer's project (below) and what they tell you. Never bring in characters, plots or genres from anywhere else.
2. Do not assume a genre or form. A report needs no character arc; a journal needs no three acts.
3. An unusual choice may be deliberate. Ask before calling something a mistake.
4. Protect the writer's voice. When suggesting wording, change as little as possible and keep their vocabulary and rhythm. Never polish it into generic prose.
5. Be specific to their actual text. No generic advice.
6. If the writer has little to go on, start where they are and ask one to three good questions.
Keep replies short unless they ask for more.`;

const MODES = {
  brainstorm: `Mode: brainstorming. Respond to what the writer just said. Build on it, offer a few concrete options when useful, and end with a question that moves the idea forward. If they change direction, follow the new direction and say what it changes.`,
  scan: `Mode: reading a passage. List at most 5 observations worth the writer's attention, one per line, in the form:
[class] observation | "short quote from the passage"
class is one of: likely, possible, style, intentional?, strength. Use "intentional?" for anything their profile says may be deliberate. Name strengths too. Do not rewrite anything.`,
  rewrite: `Mode: minimal edit. Suggest the smallest possible change that addresses the concern. Reply with the revised text only, then one short sentence saying what you changed. Keep every word that does not need to change.`,
  read: `Mode: discussing an imported document. Treat it on its own terms (its form is given below). Answer the writer's question about it using only the text.`,
};

export const MODE_NAMES = Object.keys(MODES);

const BUDGET = { profile: 1200, memory: 1100, knowledge: 1300, passage: 3600, history: 2600 };

function section(title, body) {
  return body ? `\n\n## ${title}\n${body}` : '';
}

export function buildSystem({ mode, project, interp }) {
  const profile = profileToPromptBlock(project.profile, BUDGET.profile);
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
  if (passage) userParts.push(`Passage:\n"""\n${clip(passage, BUDGET.passage)}\n"""`);
  if (extra) userParts.push(extra);
  userParts.push(userMessage);

  const messages = [{ role: 'system', content: system }, ...trimHistory(history), { role: 'user', content: userParts.join('\n\n') }];
  return { messages, tokens: messages.reduce((a, m) => a + estimateTokens(m.content), 0) };
}
