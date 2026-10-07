import { clip, words } from '../util/text.js';

/**
 * Understanding: what is the writer asking for?
 *
 * When a language model is running it READS the message first (with the last turns of the chat) and answers with a label and a
 * topic, nothing else. That reading, not a pattern match, decides how NIE answers. When no model is running, the rule-based
 * `detectIntent` does it, and the result says which one it was (`by: 'model' | 'rules'`), so NIE never pretends.
 *
 * The reading is a label, never prose: it cannot write or edit anything. A "write" or "edit" label gets the same fixed decline
 * as the rules do, and the rules' own declines still happen first, before any model call.
 */

export const TASKS = Object.freeze(['ideas', 'develop', 'feedback', 'craft', 'tell', 'write', 'edit', 'about-nie', 'chat', 'unclear']);

/** Constrains the model's answer to exactly this shape (llama.cpp turns it into a grammar, so a 3B model cannot ramble). */
export const READING_SCHEMA = Object.freeze({
  type: 'object',
  properties: { task: { type: 'string', enum: [...TASKS] }, topic: { type: 'string' } },
  required: ['task', 'topic'],
  additionalProperties: false,
});

export const UNDERSTAND_SYSTEM = `You read one message that a writer typed to NIE, a thinking partner for writers, and say what the writer is asking for. You never answer it.
Reply with JSON: {"task": ..., "topic": ...}

task is one of:
ideas: wants ideas, twists, what-ifs, complications, names or options for their own project
develop: wants to go deeper on something already being discussed (an idea, a character, a scene, something NIE just said)
feedback: asks what NIE thinks of their own work, or whether part of it works
craft: asks a general question about writing, grammar, style, a form, a genre, an author or a book (not about their own project)
tell: tells NIE about their project or shares their own writing, without asking for anything
write: asks NIE to write, draft, continue or finish text for them
edit: asks NIE to rewrite, rephrase, fix, polish or proofread their text
about-nie: asks about NIE itself: what it can do, how it works, its model, offline use
chat: greeting, thanks or small talk
unclear: you cannot tell what is being asked

topic is the subject in 1 to 5 words, or "" when there is none.

Examples:
"Give me some twists for my heist story" -> {"task":"ideas","topic":"heist twists"}
"How do I make my villain scarier?" -> {"task":"ideas","topic":"scarier villain"}
"tell me more about the second one" -> {"task":"develop","topic":"second idea"}
"Is my ending too predictable?" -> {"task":"feedback","topic":"ending"}
"What's a villanelle?" -> {"task":"craft","topic":"villanelle"}
"Can I start a sentence with And?" -> {"task":"craft","topic":"starting a sentence with And"}
"A lighthouse keeper starts getting letters from the sea." -> {"task":"tell","topic":"lighthouse keeper"}
"Write a scene where they argue" -> {"task":"write","topic":"argument scene"}
"Tighten this: She walked slowly down the long road." -> {"task":"edit","topic":""}
"What can you do?" -> {"task":"about-nie","topic":""}
"thanks!" -> {"task":"chat","topic":""}
"hmm" -> {"task":"unclear","topic":""}`;

const oneLine = (s, n) => clip(String(s ?? '').replace(/\s+/g, ' ').trim(), n);

/** The messages sent to the model. The fixed part comes first so llama.cpp can reuse it between calls. */
export function buildUnderstandMessages({ text, history = [] }) {
  const recent = history.filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content).slice(-2);
  const parts = [];
  if (recent.length) parts.push(`Earlier in this chat:\n${recent.map((m) => `${m.role === 'user' ? 'Writer' : 'NIE'}: ${oneLine(m.content, m.role === 'user' ? 160 : 220)}`).join('\n')}`);
  const t = String(text ?? '').trim();
  const shown = t.length > 600 ? `${t.slice(0, 450).trimEnd()} … ${t.slice(-120).trimStart()}` : t;
  parts.push(`The writer's new message:\n"""\n${shown}\n"""`);
  return [{ role: 'system', content: UNDERSTAND_SYSTEM }, { role: 'user', content: parts.join('\n\n') }];
}

const ALIASES = { idea: 'ideas', brainstorm: 'ideas', 'about nie': 'about-nie', about_nie: 'about-nie', nie: 'about-nie', question: 'craft', rewrite: 'edit', proofread: 'edit', compose: 'write', greeting: 'chat' };

/** Read the model's answer. Tolerates text around the JSON, a cut-off answer and a few near-miss labels; returns null when it is not usable. */
export function parseReading(raw) {
  const s = String(raw ?? '');
  let obj = null;
  const block = s.match(/\{[\s\S]*\}/);
  if (block) {
    try {
      obj = JSON.parse(block[0]);
    } catch {
      /* fall through to the salvage below */
    }
  }
  let task = typeof obj?.task === 'string' ? obj.task : (s.match(/"task"\s*:\s*"([^"]+)"/i)?.[1] ?? '');
  task = task.toLowerCase().trim();
  task = ALIASES[task] ?? task;
  if (!TASKS.includes(task)) return null;
  const rawTopic = typeof obj?.topic === 'string' ? obj.topic : (s.match(/"topic"\s*:\s*"([^"]*)/i)?.[1] ?? '');
  const topic = rawTopic.replace(/[\u0000-\u001f"“”]/g, ' ').replace(/\s+/g, ' ').trim();
  return { task, topic: words(topic).length <= 8 ? clip(topic, 80) : '' };
}

/**
 * Ask the model what the writer means. Never throws for provider trouble (the caller falls back to the rules); an abort is rethrown.
 * @returns {Promise<{ ok: true, task: string, topic: string, route: string } | { ok: false, error: Error|null, raw?: string }>}
 */
export async function understandMessage({ engine, text, history = [], signal, timeoutMs = 25000 }) {
  try {
    const res = await engine.chat(buildUnderstandMessages({ text, history }), { purpose: 'understand', stream: false, maxTokens: 60, temperature: 0, json: READING_SCHEMA, timeoutMs, signal });
    if (!res?.text) return { ok: false, error: res?.error ?? null };
    const reading = parseReading(res.text);
    return reading ? { ok: true, ...reading, route: res.route } : { ok: false, error: new Error('The model sent back a reading NIE could not use.'), raw: String(res.text).slice(0, 200) };
  } catch (err) {
    if (err?.kind === 'abort') throw err;
    return { ok: false, error: err };
  }
}

/** The task each rule-based intent type stands for, so the two readings can be compared. */
const TASK_OF_INTENT = { 'request-ideas': 'ideas', 'what-if': 'ideas', 'start-from-zero': 'ideas', 'craft-question': 'craft', 'feedback-request': 'feedback', 'share-premise': 'tell', 'share-passage': 'tell', 'direction-change': 'tell', greeting: 'chat', 'develop-idea': 'develop', 'request-write': 'write', 'request-edit': 'edit', 'about-nie': 'about-nie' };
export const taskOfIntent = (type) => TASK_OF_INTENT[type] ?? null;

/**
 * Let the model's reading decide the intent. Where it agrees with the rules the rules' richer detail is kept (their direction-change
 * cue, a "what if"…); where it disagrees the model wins. The rules' own guess stays on `reading.rules` for the record.
 */
export function applyReading(intent, reading, text) {
  intent.reading = { by: 'model', task: reading.task, topic: reading.topic, rules: intent.type };
  if (reading.task === taskOfIntent(intent.type)) return intent;
  const wc = words(text).length;
  switch (reading.task) {
    case 'write': intent.type = 'request-write'; break;
    case 'edit': intent.type = 'request-edit'; break;
    case 'about-nie': intent.type = 'about-nie'; break;
    case 'ideas': intent.type = 'request-ideas'; break;
    case 'craft': intent.type = 'craft-question'; break;
    case 'feedback': intent.type = 'feedback-request'; break;
    case 'tell': intent.type = intent.direction?.changed ? 'direction-change' : wc >= 25 && !/\?\s*$/.test(text) ? 'share-passage' : 'share-premise'; break;
    case 'chat': intent.type = wc <= 12 ? 'greeting' : 'discuss'; break;
    default: intent.type = 'discuss'; // develop, unclear: a conversation with the model, using the whole chat
  }
  return intent;
}

/** What the rules decided, recorded the same way so a result always says who understood the message. */
export const rulesReading = (intent, why = null) => ({ by: 'rules', task: taskOfIntent(intent.type), topic: '', rules: intent.type, ...(why ? { why } : {}) });

/** A short instruction for the answering model, from how the message was read. */
export function readingNote(reading, text, { ownProject = false } = {}) {
  if (!reading || reading.by !== 'model') return '';
  const asks = [];
  if (reading.task === 'unclear') asks.push("I could not tell what the writer is asking. Ask one short question to find out; do not guess and do not give a list of ideas.");
  if (reading.task === 'feedback') asks.push("The writer wants your honest read on their own work. Answer in conversation, point at where something is rather than rewriting it, and ask before calling anything a mistake.");
  if (reading.task === 'tell') asks.push("The writer is telling you about their project. Say back what you understood in a sentence, then ask one or two questions that move it forward.");
  if (reading.task === 'develop') asks.push("The writer wants to go deeper on something already in this chat. Stay with it and use what was said earlier.");
  if (reading.task === 'craft') {
    asks.push(ownProject
      ? "The writer's question mentions their own project, so answer it from what they have told you about it, not as a general lesson."
      : "This is a general question about writing, not about the writer's own project. Answer it directly and briefly.");
  }
  if (reading.topic && words(text).length <= 8) asks.push(`The subject is: ${reading.topic}.`);
  return asks.join(' ');
}
