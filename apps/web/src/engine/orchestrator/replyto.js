import { clip } from '../util/text.js';

/**
 * A short message that follows NIE's reply ("the second one is interesting. why would that work?", "yes", "that's cliche", "can you say more about that?", "go back to the first thing
 * you said") means nothing by itself: it is an answer to what NIE just said. A 3B model reading it with the conversation somewhere far up the prompt often answers as if it had come
 * from nowhere. So the turn is told, in the user part right before the message, what the writer is replying to (NIE's own last words, clipped), what kind of reply this looks like, and,
 * when they pick "the second one" from a numbered list, WHICH one: that is settled in code, not left for a small model to count.
 *
 * Nothing here writes anything: it only points the model at what is already in the conversation, and it is a function of the conversation it is given.
 */

export const REPLY_MAX_WORDS = 16;
const LAST_CHARS = 650;

const ORDINALS = { first: 1, '1st': 1, second: 2, '2nd': 2, third: 3, '3rd': 3, fourth: 4, '4th': 4, fifth: 5, '5th': 5 };
const PICK_WORD = /\b(?:the |that |your )?(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th)(?! (?:thing|time|part|draft|chapter|scene|line|sentence|page|act|step|place|few|half|paragraph|question)\b)(?: one| idea| option| twist| suggestion| direction| angle)?\b/i;
const PICK_NUMBER = /(?:\bnumber|\bno\.?|#)\s?([1-9])\b/i;
const LAST_ITEM = /\b(?:the )?(?:last|final) (?:one|idea|option|twist|suggestion|direction|angle)\b|\bthat last one\b/i;
const GO_BACK = /\b(?:go back|back to|return to|come back to|earlier|before that|the first thing you (?:said|mentioned|suggested)|what you said (?:earlier|before))\b/i;
const AGREE = /^\s*(?:yes+|yeah|yep|yup|sure|ok(?:ay)?|exactly|right|true|good point|love (?:it|that)|i like (?:it|that)|that works|that(?:'s| is) (?:good|great|interesting|it|right|perfect|better|cool)|interesting|hm+,? interesting|nice)\b/i;
const PUSHBACK = /\b(?:no+|nope|not really|don'?t (?:like|think|want)|i (?:don'?t|do not) (?:like|think|want)|cliche|obvious|predictable|boring|generic|overdone|too (?:political|dark|cheesy|safe|much|big|small|simple|complicated|slow|familiar)|already (?:been done|seen)|feels (?:flat|off|forced|familiar|obvious|safe|cheesy)|doesn'?t (?:work|fit|feel|sound)|that'?s not|isn'?t (?:right|it|what))\b/i;
const EXPLAIN = /\b(?:why|how come|what do you mean|can you (?:say|explain|tell me) (?:more|that|a bit|again)|say more|tell me more|explain|go on|elaborate|what would that (?:look like|mean|do)|how would (?:that|it)|walk me through)\b/i;
const BEFORE = /^\s*(?:and|but|so|then|what about|how about)\b/i;

const wordCount = (s) => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;

/** The numbered items of a message: [{ n, text }]. */
export function numberedItems(message) {
  const out = [];
  for (const line of String(message ?? '').split('\n')) {
    const m = line.match(/^\s*(\d{1,2})[.)]\s+(.{4,})$/);
    if (m) out.push({ n: Number(m[1]), text: m[2].trim() });
  }
  return out;
}

/**
 * What the writer SEES as a list in NIE's last message, in the order they see it: the idea cards when the reply was cards (the screen numbers them 1, 2, 3 whatever the model's own
 * numbering was), otherwise the numbered lines of the text. `last` is a message or its text.
 */
export function itemsOf(last) {
  const cards = Array.isArray(last?.ideas) ? last.ideas.map((i) => String(i?.text ?? '').trim()).filter(Boolean) : [];
  if (cards.length >= 2) return cards.map((text, i) => ({ n: i + 1, text }));
  return numberedItems(typeof last === 'string' ? last : last?.content).map((it, i) => ({ n: i + 1, text: it.text }));
}

/** Which numbered item of NIE's last message the writer means ("the second one", "#3", "that last one"), or null. */
export function pickedItem(text, last) {
  const items = itemsOf(last);
  if (items.length < 2) return null;
  const t = String(text ?? '');
  if (LAST_ITEM.test(t)) return items.at(-1);
  const byNumber = t.match(PICK_NUMBER);
  if (byNumber) return items.find((i) => i.n === Number(byNumber[1])) ?? null;
  const m = t.match(PICK_WORD);
  if (!m) return null;
  const n = ORDINALS[m[1].toLowerCase()];
  return items.find((i) => i.n === n) ?? null;
}

/** @returns {'pick'|'go-back'|'explain'|'pushback'|'agree'|'follow'} */
export function kindOfReply(text, last) { // (`last` is NIE's last message, or its text)
  const t = String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // ("cliché" and "cliche" are the same word here)
  if (pickedItem(t, last)) return 'pick';
  if (GO_BACK.test(t)) return 'go-back';
  if (PUSHBACK.test(t)) return 'pushback';
  if (EXPLAIN.test(t)) return 'explain';
  if (AGREE.test(t)) return 'agree';
  return 'follow';
}

/** A short reaction to NIE's last message (pushing back, asking why, going back, picking one, agreeing) rather than something new about the project. */
export const REACTION_WORDS = 10;
export const isReaction = (text, last) => Boolean(String((typeof last === 'string' ? last : last?.content) ?? '').trim()) && wordCount(text) <= REACTION_WORDS && ['pushback', 'explain', 'go-back', 'pick', 'agree'].includes(kindOfReply(text, last));

const STANCE = {
  agree: 'They agree or like it. Do not just agree back: take it one step further, say what it opens up or changes.',
  pushback: 'They are pushing back. Take the objection seriously: say in a few words what is fair about it, then go in a different direction, not a variation of the same idea.',
  explain: 'They want you to explain what you said. Give the reasoning in plain words, specific to your last message, not a general lecture.',
  'go-back': 'They want to return to something you said earlier. Find it in the conversation above and pick it up.',
  follow: 'It is a reply to your last message. Answer it as a reply to that, not as a new topic.',
};

/**
 * The note for the turn: what the writer is replying to. '' when it is not a short reply to NIE (the first message, a long message, or when NIE spoke only a card of ideas the
 * writer can see in the history anyway).
 */
export function replyContext({ text, past }) {
  const history = Array.isArray(past) ? past : [];
  const last = history.at(-1);
  if (!last || last.role !== 'assistant' || !String(last.content ?? '').trim()) return '';
  if (wordCount(text) > REPLY_MAX_WORDS) return '';
  const lastText = String(last.content).replace(/\n{3,}/g, '\n\n').trim();
  const kind = kindOfReply(text, last);
  const item = kind === 'pick' ? pickedItem(text, last) : null;
  const lines = [`Their message is a reply to what you said last:\n"""\n${clip(lastText, LAST_CHARS)}\n"""`];
  if (item) lines.push(`They mean number ${item.n} of your list: "${clip(item.text, 220)}". Work with that one.`);
  else lines.push(BEFORE.test(text) && kind === 'follow' ? STANCE.follow : STANCE[kind]);
  lines.push('Keep it to three or four sentences.');
  return lines.join('\n');
}
