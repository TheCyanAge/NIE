import { fnv1a, clip } from '../util/text.js';
import { groundNames } from '../editor/ground.js';
import { isFiller, similarity, splitSentencesLite } from './variety.js';

/**
 * Small talk: "hey", "thanks!", "ok cool", "how are you?", "back again". A person answers these like a person, in a line or two, and does not go looking for something in the
 * project to comment on. Measured in the conversation lab on the real model, a "hey" in Brainstorm got a remark about a "thanks" that was never there: the reply was steered
 * by notes about craft, by a brief that asked it to point at "one specific detail" the writer gave, and by an enforcement step that swapped any comment that added anything for
 * a canned acknowledgement. None of that belongs to a hello.
 *
 * So a small-talk turn is asked on its own: the earlier conversation, one instruction, and (only when there is one) what the writer was working on, in their own words, as
 * something NIE MAY mention, never something it must. The reply is checked in code (short, nothing named that the writer never named, no list, no idea cards), and if the
 * model's answer fails the check, or there is no model, NIE answers with a built-in line that is chosen by what the writer said (a greeting, thanks, "how are you?"), not
 * one stock sentence for everything. It never writes the writer's text; there is nothing here to write.
 */

export const SMALL_TALK_WORDS = 14;
/** The longest a small-talk reply may be: a hello is answered in a line or two. */
export const SMALL_TALK_MAX_WORDS = 45;

const GREETING = /^\s*(?:hi+|hello|hey+|heya|hiya|yo|howdy|sup|good (?:morning|afternoon|evening)|morning|evening)\b/i;
const THANKS = /\b(?:thanks?|thank you|thx|cheers|much appreciated|appreciate (?:it|that|you)|ta)\b/i;
const HOW_ARE_YOU = /\b(?:how are you|how'?s it going|how have you been|how'?re you|what'?s up|how do you do)\b/i;
const BYE = /\b(?:bye|goodbye|good night|goodnight|see you|see ya|talk later|ttyl|gotta go|got to go|signing off|catch you later)\b/i;
const BACK = /\b(?:back again|i'?m back|im back|back for more|hello again|hi again|hey again)\b/i;
// Remarks about the message itself (its tone, what it "signals") instead of an answer to it.
const COMMENTARY = /\b(?:tone|signals?|indicates?|conveys?|implies|at the end|right from the start|your (?:message|greeting|opening)|this message|the message)\b/i;
// NIE saying the writer's project is its own ("I'm writing a mystery set on a night train").
const OWNS_THE_PROJECT = /^\s*(?:i'?m|i am|i was|i have been|i've been)\s+(?:writing|working on|building|making)\b|\bmy (?:story|novel|book|script|poem|premise|protagonist)\b/i;
const FEELING_LOW = /\b(?:tired|exhausted|drained|burnt? ?out|stuck|blocked|stressed|overwhelmed|discouraged|frustrated|can'?t (?:write|think|do this)|no motivation|don'?t know where to (?:start|begin)|not sure where to start)\b/i;

/** @returns {'back'|'thanks'|'bye'|'how-are-you'|'greeting'|'low'|'ack'} */
export function kindOfSmallTalk(text) {
  const t = String(text ?? '');
  if (BACK.test(t)) return 'back';
  if (BYE.test(t)) return 'bye';
  if (HOW_ARE_YOU.test(t)) return 'how-are-you';
  if (FEELING_LOW.test(t)) return 'low';
  if (THANKS.test(t)) return 'thanks';
  if (GREETING.test(t)) return 'greeting';
  return 'ack';
}

const wordCount = (s) => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;

/** Is this message small talk? The reading must say so (a model's, or the rules' for a bare greeting), and it must be short: a long message that mentions "thanks" is a message. */
export function isSmallTalk(reading, text) {
  return reading?.task === 'chat' && wordCount(text) <= SMALL_TALK_WORDS;
}

/**
 * What the writer was working on, in their own words (the last things they told NIE or answered), for NIE to MAY pick up. Empty when they have told it nothing.
 * Only their statements: not NIE's replies, not the library, not a summary written by code.
 */
export function whereWeWere(project, { limit = 2, chars = 120 } = {}) {
  const said = Array.isArray(project?.mind?.said) ? project.mind.said : [];
  const picks = said.filter((s) => s && typeof s.text === 'string' && (s.kind === 'told' || s.kind === 'answered' || !s.kind)).slice(-limit);
  return picks.map((s) => clip(String(s.text).replace(/\s+/g, ' ').trim(), chars));
}

const HOW = {
  greeting: 'They said hello. Say hello back, the way a friend would, and ask what they feel like working on.',
  back: 'They have come back to the conversation. Welcome them back warmly.',
  thanks: 'They are thanking you. Take it graciously in a few words, and leave the door open without pushing.',
  bye: 'They are saying goodbye. Say goodbye warmly in a few words.',
  'how-are-you': "They asked how you are. Answer honestly and briefly: you are an AI writing partner, so say you're ready to work and glad they're here, then turn it back to them.",
  low: 'They sound tired, stuck or discouraged. Say something human about that first, with no advice list. You may ask one gentle question about what would help.',
  ack: 'They are just acknowledging what you said. Respond to that in a few words and let them lead.',
};

/** The instruction for the model on a small-talk turn: it goes in the user part, after the earlier conversation. */
export function smallTalkNote({ text, project }) {
  const kind = kindOfSmallTalk(text);
  const left = whereWeWere(project);
  const pick = left.length
    ? ` What they were working on, in their own words (you MAY mention it in a few words if it fits, you need not): ${left.map((l) => `"${l}"`).join('; ')}.`
    : ' They have not told you what they are working on yet, so do not mention any story or project.';
  return `This is small talk, so answer like a person on the other end, in one or two short sentences (under 40 words).${' '}${HOW[kind]}${pick} Do not give ideas, lists, advice or craft notes, do not quote or describe anything they did not say, do not mention things from earlier unless it is in their own words above, and do not announce what you are about to do. At most one short question.`;
}

const hash = (...p) => parseInt(fnv1a(p.join('|')), 16);
const pick = (list, seed) => list[hash(seed) % list.length];

const LINES = {
  greeting: ['Hey. What are you in the mood to work on?', "Hi. Good to see you. What's on your mind?", 'Hello. Where do you want to start?', "Hey there. What are we making today?"],
  back: ["Welcome back. Where do you want to pick it up?", 'Good to have you back. What are we working on?', "Hey, you're back. What's next?"],
  thanks: ["You're welcome. Anything else you want to turn over?", 'Glad that helped. I am here whenever you want to keep going.', 'Any time. Say the word if you want to keep going.'],
  bye: ['Take care. Your ideas will be here when you come back.', 'Talk soon. Everything stays in this project.', 'Bye for now. Come back whenever you like.'],
  'how-are-you': ["I'm good, and ready to work. I'm an AI, so no bad days. How are you doing, and what are we making?", 'Doing well, thanks for asking. What are you working on?', "Ready when you are. How's the writing going?"],
  low: ["That sounds like a heavy day. We can keep it small: tell me one thing about the piece, or just talk.", "I'm sorry it's heavy right now. Want to talk it through, or shall we try one small thing?", 'That happens to every writer. Say what is in the way, and we will start there.'],
  ack: ['Okay. Where to next?', "Good. What do you want to look at next?", "Sure. I'm here when you want to go on."],
};

/**
 * NIE's own line, with no model (or when the model's line fails the check): chosen by what the writer said. If they have told NIE what they are working on and it is a plain
 * greeting, the line picks it up in their own words; otherwise it asks what they want to work on.
 */
export function smallTalkFallback({ text, project, seed = '' }) {
  const kind = kindOfSmallTalk(text);
  const left = whereWeWere(project, { limit: 1, chars: 70 });
  const s = `${seed}|${text}|${project?.conversation?.messages?.length ?? 0}`;
  if (left.length && ['greeting', 'back'].includes(kind) && left[0].split(/\s+/).length >= 3) {
    return pick([`${kind === 'back' ? 'Welcome back' : 'Hey'}. Do you want to pick up "${left[0]}", or start on something new?`, `${kind === 'back' ? 'Good to have you back' : 'Hi'}. Shall we go on with "${left[0]}", or is it something else today?`], s);
  }
  return pick(LINES[kind] ?? LINES.ack, s);
}

/**
 * Is the model's reply to a small-talk message one a person could have said? Short, no list or card, at most one question, and it names nothing the writer never named
 * (the writer's words, the project's title and NIE are the only names it may use). Returns the reply, trimmed to its first sentences when it ran on, or '' when it fails.
 */
export function holdSmallTalk(reply, { project, text, past = [] } = {}) {
  let out = String(reply ?? '').trim();
  if (!out) return '';
  if (/^\s*(?:[-*•]|\d+[.)])\s/m.test(out) || (/\n\s*\n/.test(out) && wordCount(out) > 30)) return '';
  const kind = kindOfSmallTalk(text);
  const theirs = [text, ...past.filter((m) => m.role === 'user').map((m) => m.content)].flatMap((m) => splitSentencesLite(String(m ?? '')));
  const sentences = splitSentencesLite(out);
  const kept = [];
  let questions = 0;
  for (const s of sentences) {
    const isQuestion = /\?["')\]]*\s*$/.test(s);
    if (isFiller(s)) continue; // "Sounds intriguing." is not an answer to "thanks!"
    if (wordCount(s) >= 5 && theirs.some((e) => similarity(s, e) >= 0.8)) continue; // one of the writer's own sentences said back
    if (OWNS_THE_PROJECT.test(s)) continue; // "I'm writing a mystery set on a night train": NIE is not the writer
    // a thank-you, a goodbye or an "ok" is not followed by a question about the story (measured on the real model: "How does the train's atmosphere influence the passengers?")
    if (isQuestion && ['thanks', 'bye', 'ack'].includes(kind) && wordCount(s) > 8) continue;
    if (isQuestion && ++questions > 1) continue;
    if (wordCount([...kept, s].join(' ')) > SMALL_TALK_MAX_WORDS) break;
    kept.push(s);
  }
  out = kept.join(' ').trim();
  if (!out || wordCount(out) < 2) return '';
  // most of the reply is one of the writer's earlier messages said back (measured: a hello was answered with the writer's own two sentences)
  for (const m of [text, ...past.filter((x) => x.role === 'user').map((x) => x.content)]) if (wordCount(m) >= 5 && similarity(out, String(m)) >= 0.6) return '';
  const writerSaid = [text, ...past.filter((m) => m.role === 'user').map((m) => m.content), ...whereWeWere(project, { limit: 6, chars: 260 })];
  // Talking ABOUT the message instead of answering it ("The 'thanks' at the end signals a warm tone"), or quoting words nobody said, is what a hello must never get.
  if (COMMENTARY.test(out)) return '';
  const lower = writerSaid.join(' \n ').toLowerCase();
  for (const q of out.matchAll(/["“]([^"”]{1,60})["”]/g)) if (!lower.includes(q[1].trim().toLowerCase())) return '';
  const g = groundNames(out, { sources: writerSaid, known: ['NIE', project?.title].filter(Boolean), sections: null });
  if (g.removed.length) return '';
  return out;
}

/**
 * A writer who says they are stuck, tired or discouraged while talking about their work is not making small talk, but a person would not skip past it either. One human sentence first, then the work.
 * '' when the message says nothing of the kind.
 */
/** Does the message say the writer is stuck, tired or discouraged? (a short one: a long message that mentions it is about the work) */
export const isLowMood = (text) => wordCount(text) <= 30 && FEELING_LOW.test(String(text ?? ''));

export function feelingNote(text) {
  const t = String(text ?? '');
  if (wordCount(t) > 30 || !FEELING_LOW.test(t)) return '';
  return "They told you how they feel about the work (stuck, tired or discouraged). Begin with one short, human sentence that meets that (not advice, not \"I understand how you feel\"), then go on with what is asked of you below.";
}
