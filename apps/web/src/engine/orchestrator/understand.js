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
tell: tells NIE about their project, shares a piece of their own writing, or gives a progress update, without asking for anything
write: clearly asks NIE to write, draft, continue or finish text for them
edit: clearly asks NIE to rewrite, rephrase, fix, polish or proofread their text
about-nie: asks about NIE itself: what it can do, how it works, its model, whether it needs the internet, what it does with their text
chat: greeting, thanks or small talk
unclear: too short or vague to tell, or refers to something that is not there

A statement that asks for nothing is tell, never write or edit. Choose write or edit only when the writer is asking NIE to do it.
topic is the subject in 1 to 5 words, or "" when there is none.

Examples:
"Give me some twists for my heist story" -> {"task":"ideas","topic":"heist twists"}
"How do I make my villain scarier?" -> {"task":"ideas","topic":"scarier villain"}
"tell me more about the second one" -> {"task":"develop","topic":"second idea"}
"Is my ending too predictable?" -> {"task":"feedback","topic":"ending"}
"Does my voice stay consistent across the chapters?" -> {"task":"feedback","topic":"voice"}
"What's a villanelle?" -> {"task":"craft","topic":"villanelle"}
"Can I start a sentence with And?" -> {"task":"craft","topic":"starting a sentence with And"}
"My novel is a slow-burn mystery on a fishing island. The narrator is a retired ferry captain." -> {"task":"tell","topic":"mystery novel"}
"just finished chapter nine, took me three weeks" -> {"task":"tell","topic":""}
"Write a scene where they argue" -> {"task":"write","topic":"argument scene"}
"Tighten this: She walked slowly down the long road." -> {"task":"edit","topic":""}
"What can you do?" -> {"task":"about-nie","topic":""}
"does this work without wifi?" -> {"task":"about-nie","topic":"internet"}
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

const REQUEST_VERBS = 'write|draft|compose|rewrite|rephrase|reword|redo|edit|proofread|fix|polish|tighten|improve|correct|revise|smooth|finish|continue|expand|make|change|cut|shorten|trim|rework|turn|convert|give\\s+me\\s+(?!(?:an?\\s+|some\\s+|a\\s+few\\s+|the\\s+|more\\s+|any\\s+)?(?:examples?|ideas?|tips?|advice|suggestions?|options?|names?|twists?|reasons?|lists?|explanations?|definitions?|overviews?|summar(?:y|ies)|angles?|questions?|sources?|references?|titles?|hints?|feedback|thoughts?|an?\\s+example)\\b)|add|swap|replace|simplify|punch|extend|complete|generate|create|produce|summari[sz]e|translate|paraphrase|clean\\s+up|flesh';
const REQUEST_MARKER = new RegExp(
  String.raw`\b(?:can|could|would|will|won'?t|might)\s+(?:you|u|ya)\b|\byou\s+(?:can|could|might|please)\b|\bplease\b|\bpls\b|\bplz\b|\bfor\s+(?:me|us)\b|\bhelp\s+me\b|\bI\s+(?:need|want|'?d\s+like)\s+you\b|\bI\s+was\s+wondering\b|\bgo\s+ahead\b|\b(?:better|another)\s+way\s+to\s+(?:phrase|say|word|put)\b|\bjust\s+(?:${REQUEST_VERBS})\b|(?:^|[.!?:;]\s+|\bthen\s+|\bnow\s+|\bok(?:ay)?[,\s]+|\bso\s+)(?:please\s+|just\s+)?(?:${REQUEST_VERBS})\b`,
  'i'
);
/**
 * Does the message actually ASK for something to be done? A small model sometimes reads a plain statement ("My novel is about a lighthouse
 * keeper…", "just finished chapter nine") or a fragment as "write" or "edit". Declining those would turn a writer's own words into an
 * accusation, so a model reading of write/edit is only believed when the message has a visible request in it.
 */
export const looksLikeARequest = (text) => REQUEST_MARKER.test(String(text ?? ''));

const COMPOSE_WORDS = /\b(?:write|draft|compose|continue|finish|complete|expand|create|generate|produce|ghost-?write|extend|flesh)\b/i;
const CHANGE_WORDS = /\b(?:rewrite|rephrase|reword|redo|edit|proofread|fix|polish|tighten|improve|correct|revise|smooth|shorten|trim|rework|simplify|paraphrase|punch|swap|replace|cut|change|clean\s+up|better\s+way)\b/i;
/** Which refusal fits: a request to compose new text, or to change the writer's own. The model can say one while the words say the other ("compose the first page" is not an edit). */
export function declineKind(text, modelSaid) {
  const compose = COMPOSE_WORDS.test(text);
  const change = CHANGE_WORDS.test(text);
  if (compose && !change) return 'write';
  if (change && !compose) return 'edit';
  return modelSaid;
}

const ADDRESSED = /\b(?:you|your|yours|yourself|nie|u)\b|\bthis\s+(?:app|tool|program|thing|software)\b|\?\s*$|^\s*(?:help|is|are|does|do|did|where|how|what|can|could|which|why|who|when|will|would)\b/i;
/** Is the message put TO NIE (a question or a "you")? A model that reads "My novel is about…" as a question about NIE is not believed. */
export const looksAddressedToNie = (text) => ADDRESSED.test(String(text ?? ''));

/**
 * Let the model's reading decide the intent. Where it agrees with the rules the rules' richer detail is kept (their direction-change
 * cue, a "what if"…); where it disagrees the model wins. The rules' own guess stays on `reading.rules` for the record.
 */
export function applyReading(intent, reading, text) {
  const wc = words(text).length;
  let task = reading.task;
  let overruled = null;
  if ((task === 'write' || task === 'edit') && !looksLikeARequest(text)) {
    overruled = task; // the model said "write"/"edit" but nothing in the message asks for it: not a request, so nothing is declined
    task = /\?\s*$/.test(text) || wc < 3 ? 'unclear' : 'tell';
  } else if (task === 'write' || task === 'edit') {
    task = declineKind(text, task);
  } else if (task === 'about-nie' && !looksAddressedToNie(text)) {
    overruled = task; // "My novel is about…" is a statement, not a question about NIE
    task = wc < 3 ? 'unclear' : 'tell';
  }
  intent.reading = { by: 'model', task, topic: reading.topic, rules: intent.type, ...(overruled ? { overruled } : {}) };
  if (task === taskOfIntent(intent.type)) return intent;
  switch (task) {
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
  if (!reading) return '';
  if (reading.task === 'chat') return "The writer is just being friendly (a greeting, thanks or small talk). Reply in one or two warm sentences. Do not give ideas, lists or advice they did not ask for.";
  if (reading.by !== 'model') return '';
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
