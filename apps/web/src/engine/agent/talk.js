import { filledIds, getSlot, squash, stemList, stemSet, wordsOf } from './state.js';

/**
 * What the writer is doing: answering "shall I keep this?", asking NIE to change how it talks, asking it to keep the idea, saying they are done,
 * or starting something else. All by rules, so it works with no model and is decided the same way every time.
 * Every parser reads the whole message (short messages only: a command buried in a paragraph of story is not a command).
 */

const straight = (s) => String(s ?? '').replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
const lower = (s) => straight(s).toLowerCase();
const SMILEY = /[\u{1F44D}\u{2705}\u{1F44C}\u{1F64C}\u{1F4AF}\u{1F44F}]/u;

/**
 * The words of a reply as { key, word, i }: key is lower-case letters/digits/apostrophes, word is as typed, i is its place among ALL the words
 * (`.all`), which include emoji and bare punctuation so a detail can be handed back exactly as the writer typed it.
 */
function tokens(text) {
  const all = straight(text).replace(/([,;:!?])(?=\p{L})/gu, '$1 ').split(/\s+/).filter(Boolean);
  const toks = [];
  all.forEach((word, i) => {
    const key = word.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '').replace(/^'+|'+$/g, '');
    if (key) toks.push({ word, key, i });
  });
  return Object.assign(toks, { all });
}
const detailOf = (toks, from) => (from >= toks.length ? '' : toks.all.slice(toks[from].i).join(' ').replace(/^[\s,;:.\-–—]+/, '').trim());

// ── the reply to "shall I keep this?" ────────────────────────────────────────

const YES_MARK = new Set(['yes', 'yep', 'yeah', 'yea', 'yup', 'yeh', 'ya', 'sure', 'ok', 'okay', 'kay', 'alright', 'definitely', 'absolutely', 'agreed', 'correct', 'perfect', 'exactly', 'great', 'good', 'fine', 'lgtm', 'keep', 'save', 'commit', 'store', 'sounds', 'looks', 'works', 'right', 'ahead', 'course', 'affirmative', 'cool', 'nice']);
const YES_FILL = new Set(['it', 'this', 'that', "that's", 'thats', 'is', 'are', 'all', 'idea', 'please', 'pls', 'thanks', 'thank', 'thx', 'you', 'now', 'then', 'the', 'my', 'on', 'to', 'in', 'board', 'memory', 'project', 'for', 'me', 'i', 'think', 'we', 'can', 'go', 'do', 'have', 'of', 'a', 'as', 'so', 'much', 'very', 'really', 'too', 'be', 'sir', 'mate', 'nie', 'everything']);
const YES_PHRASE = /\b(?:please do|go ahead|go for it|do it|of course|i think so|that'?s (?:it|all|everything|right|correct|fine|good|perfect|exactly)|that is (?:right|it|all|everything)|works for me|that works|all good|all set)\b/;
const isYesWord = (k) => YES_MARK.has(k) || /^ye+s+$|^ye+a+h?$|^ye+p+$|^yu+p+$|^ok+a*y*$/.test(k);

const CONNECTOR = new Set(['but', 'except', 'though', 'however', 'although', 'only', 'just', 'and', 'also', 'plus', 'then', 'still']);
const NO_LEAD = /^(?:no+|nope|nah|nay|not (?:yet|now|really|quite|just yet|today|right now|so fast|just now)|wait|hold (?:on|up)|hang on|don'?t|do not|dont|later|maybe later|cancel|stop|never ?mind|negative|let me think|give me a (?:sec|second|moment|minute|bit)|one (?:sec|second|moment|minute))\b/;
// "also", "but actually", "oh and also": every lead-in word goes, so `detail` starts at the writer's own detail
const ADD_LEAD = /^(?:(?:oh|ah|hmm+|hm|um|uh|well|wait|so|ok|okay)\s+){0,2}(?:also|and|plus|add|actually|but|except|additionally|another thing|another detail|one more thing|one more|i'?d add|i would add|i want to add|i'?d like to add|let me add|can you add|please add|just one more thing)(?:\s+(?:also|actually|and|but|plus))*\b/;
// ("What she wants is her brother back." opens with a question word and is a statement: see looksLikeQuestion)
const QUESTIONISH = { test: (t) => looksLikeQuestion(t) || /^\s*(?:is it|are you)\b/i.test(t) };

const countTokens = (matched) => (matched.trim() ? matched.trim().split(/\s+/).length : 0);

// Short replies that mean "not now / not as it is" even though they use a yes-word: "keep going" is the writer asking NIE to carry on, not to keep the idea.
const KEEP_GOING = String.raw`(?:keep|continue|carry)\s+(?:on\s+)?(?:it\s+)?(?:going|asking|talking|working|building|developing|brainstorming|chatting|at it)`;
const NOT_NOW = [
  new RegExp(String.raw`^(?:(?:yes|yeah|ok|okay|no|nope|well|hmm|please|sure|just|let'?s|lets|we can|you can|i want to|can we|could we|i'?d like to)\s+)*(?:${KEEP_GOING}|carry on|continue)\b`),
  /^(?:(?:no|nope|nah|not yet)[,.]?\s+)?(?:(?:it'?s|it is|i'?m|i am|we'?re|we are|this is|that'?s|that is)\s+)?not\s+(?:quite\s+|really\s+|nearly\s+|totally\s+|completely\s+)?(?:done|finished|ready|complete|there|right|correct)\b/,
  /^(?:it|this|that|we|i)\s+(?:still\s+)?needs?\s+(?:a bit more|some more|a little more|more|work)\b/,
  /\b(?:save|keep|commit|store)\s+(?:it|this|that)\s+(?:for|until|till)\s+(?:later|now|tomorrow)\b/,
  /^(?:(?:that'?s|that is|it'?s|it is)\s+)?(?:wrong|incorrect)\b/,
];
// "Let me add something" / "also, one more thing": the writer is about to add a detail but has not said it yet. There is nothing to record.
const FILLER_DETAIL = /^(?:something(?: else| more)?|more(?: details?| stuff| things)?|a (?:few|couple of)(?: more)? (?:things|details)|a detail|(?:some|a bit|a little) more|some details?|one (?:thing|more thing|detail)|another (?:thing|detail)|a thing|things|stuff)[\s.!:,]*$/i;
// words that may trail a yes without changing it ("yes sir", "sure thing", "okay then"); anything else after a yes is a detail or something else entirely
const YES_TAIL = new Set(['sir', 'mate', 'thing', 'definitely', 'absolutely', 'totally', 'certainly', 'obviously', 'honestly', 'thanks', 'thank', 'please', 'pls', 'nie', 'then', 'now', 'great', 'good', 'fine', 'perfect', 'sounds', 'looks', 'works', 'cool', 'nice', 'awesome', 'lovely', 'brilliant', 'boss', 'friend', 'buddy', 'love', 'indeed']);
// whole replies that agree without a yes-word in them
const YES_WHOLE = /^(?:(?:ok|okay|yes|yeah|sure|fine|well|alright)\s+)?(?:why not|whatever you like|whatever works|whatever you think|if you like|if you want|if you think so|i guess so|i suppose so|i think so|fine whatever|sure whatever|go for it)(?:\s+(?:then|please|thanks))?$/;
const THANKS = /^(?:thanks|thank you|thank|cheers|ta|much appreciated|appreciate|great|awesome|lovely|brilliant|nice one|good job|well done)\b/;
const UNCLEAR = Object.freeze({ decision: 'unclear', detail: '' });

/** All the words are "yes" words (and at least one says yes), so the reply says nothing but yes. */
function sayingYes(keys, { needMark = true } = {}) {
  if (!keys.length) return false;
  if (!keys.every((k) => isYesWord(k) || YES_FILL.has(k) || CONNECTOR_YES.has(k))) return false;
  return !needMark || keys.some(isYesWord) || YES_PHRASE.test(keys.join(' '));
}
const CONNECTOR_YES = new Set(['and']);

/**
 * @returns {{ decision: 'yes'|'no'|'add'|'unclear', detail: string, wantsToAdd?: true }}
 * yes = keep it; no = not yet; add = the writer gave a detail (a leading "also/and/but/actually...", or any reply of six words or more that is
 * not clearly yes or no); unclear = too short to tell, or a question. `detail` is the added text with the leading "also" and the like removed.
 * `wantsToAdd` marks an unclear reply that announces a detail without giving it ("let me add something").
 */
export function parseOfferReply(text) {
  const raw = squash(typeof text === 'string' ? text.slice(0, 4000) : '');
  const toks = tokens(raw);
  if (!toks.length) return { decision: SMILEY.test(raw) ? 'yes' : 'unclear', detail: '' };
  const keys = toks.map((t) => t.key);
  const asDetail = (from) => {
    // (the composer chip says "Let me add more details: ", so "more details:" is the lead-in, not part of the detail)
    const detail = detailOf(toks, from).replace(/^(?:(?:some|a few|a couple of)\s+)?(?:more\s+)?(?:details?|things|stuff|something(?:\s+else)?)\s*[:\u2013\u2014-]\s*/i, '');
    if (!detail) return { ...UNCLEAR };
    if (FILLER_DETAIL.test(detail)) return { decision: 'unclear', detail: '', wantsToAdd: true };
    const inner = parseOfferReply(detail);
    if (inner.decision !== 'unclear' || inner.wantsToAdd) return inner; // "actually, yes keep it", "and no, not yet", "no wait, also X" (its own lead-in already removed)
    if (QUESTIONISH.test(detail)) return { ...UNCLEAR };
    return { decision: 'add', detail };
  };

  // 1. an explicit addition: "also ...", "and ...", "one more thing ...", "wait, also ...", "I'd add ..."
  const lead = ADD_LEAD.exec(keys.join(' '));
  if (lead) {
    let n = countTokens(lead[0]);
    if (keys[n] === 'that' && /\badd\b/.test(lead[0])) n++; // "add that the town has no name" -> "the town has no name"
    return asDetail(n);
  }

  // 1b. "keep going", "not done yet", "that's wrong": short replies that use a yes-word but say "not like this, not yet"
  if (keys.length <= 8) {
    const joined = keys.join(' ');
    if (NOT_NOW.some((re) => re.test(joined))) return { decision: 'no', detail: '' };
  }

  // 2. nothing but yes
  if (sayingYes(keys) || YES_WHOLE.test(keys.join(' '))) return { decision: 'yes', detail: '' };

  // 3. a yes followed by something: "yes, but make the ending darker" is a yes AND a detail
  let i = 0;
  while (i < keys.length && (isYesWord(keys[i]) || YES_FILL.has(keys[i])) && keys[i] !== 'and') i++;
  if (i > 0 && keys.slice(0, i).some(isYesWord)) {
    const rest = keys.slice(i);
    if (!rest.length) return { decision: 'yes', detail: '' };
    if (THANKS.test((CONNECTOR.has(rest[0]) ? rest.slice(1) : rest).join(' '))) return { decision: 'yes', detail: '' }; // "yes keep it, and thanks for the help": manners are not a detail
    if (CONNECTOR.has(rest[0])) {
      const inner = asDetail(i + 1);
      return inner.decision === 'unclear' && rest.length === 1 ? { ...UNCLEAR } : inner;
    }
    if (QUESTIONISH.test(raw)) return { ...UNCLEAR }; // "ok so what happens next?" is not a yes
    if (rest.every((k) => YES_TAIL.has(k))) return { decision: 'yes', detail: '' }; // "yes sir", "sure thing"
    if (rest.length >= 3) return asDetail(i);
    // a short, odd tail ("good question", "keep it short", "nice try") is not a yes: fall through to the cases below
  }

  // 4. no, not yet, wait, hold on, don't...
  if (NO_LEAD.test(keys.join(' '))) {
    let n = 0;
    for (let m = NO_LEAD.exec(keys.slice(n).join(' ')); m; m = NO_LEAD.exec(keys.slice(n).join(' '))) n += countTokens(m[0]); // "no, not yet, ..."
    if (n < keys.length && ADD_LEAD.test(keys.slice(n).join(' '))) return asDetail(n); // "no wait, also she has a limp"
    return keys.length - n >= 6 ? asDetail(n) : { decision: 'no', detail: '' }; // a refusal that carries a long detail is a detail
  }

  // 5. anything else of six words or more carries new detail; shorter is unclear
  if (keys.length >= 6) return QUESTIONISH.test(raw) ? { ...UNCLEAR } : { decision: 'add', detail: raw };
  return { ...UNCLEAR };
}

/**
 * The reply OPENS with a yes to the offer and goes on to something else ("yes keep it and show me the board", "ok save it, then give me ideas for the middle").
 * Not "yes, but ..." (that is a reservation).
 */
export function opensWithYes(text) {
  const t = squash(typeof text === 'string' ? text.slice(0, 400) : '');
  return YES_FIRST.test(t) && !/^[^.!?]{0,30}\b(?:but|except|though|however|only|unless)\b/i.test(t);
}
const YES_FIRST = /^\W*(?:(?:so|well|right)[,.!]?\s+)*(?:(?:yes|yeah|yep|yup|absolutely|definitely|sure)\b[,.!]?\s*(?:(?:please\s+)?(?:keep|save|commit|store|do)\s+(?:it|this|that)(?:\s+all)?[,.!]?\s*)?|(?:(?:ok|okay|alright)[,.!]?\s+)?(?:please\s+)?(?:keep|save|commit|store)\s+(?:it|this|that)(?:\s+all)?[,.!]?\s*)(?:(?:and|then|also|plus)\s+)?\S/i;

// ── commands ─────────────────────────────────────────────────────────────────

const shortEnough = (text, max) => wordsOf(text).length <= max;
// A command is something the writer says TO NIE. A line of dialogue ("Stop asking questions," she snapped) or a sentence about someone else ("He wants her to
// stop asking questions") is the story, so commands must open the message, and a message with quotation marks in it is never one.
const QUOTED = /"/;
const CMD_LEAD = String.raw`^\W*(?:(?:ok|okay|alright|all right|so|now|nie|please|hey|well|right|yes|yeah|thanks|thank you|great|actually|um|hmm)[,.!]?\s+)*(?:(?:(?:can|could|would|will) you\s+(?:please\s+)?|you (?:can|may|could|should|might)\s+(?:now\s+)?|(?:i'?d|i would) (?:like|prefer|want) (?:you )?to\s+|i (?:want|need) you to\s+|let'?s\s+|lets\s+|feel free to\s+|go ahead and\s+|please\s+|just\s+|start\s+(?:to\s+)?|begin\s+(?:to\s+)?))*`;
const cmd = (body) => new RegExp(`${CMD_LEAD}${body}`, 'i');

const QUIET = [
  cmd(String.raw`(?:stop|quit|cease|skip|drop|leave off)\s+(?:all\s+|with\s+)?(?:the\s+|these\s+|those\s+|your\s+|any\s+)?(?:asking|questions?|interview\w*|quizzing|grilling)\b`),
  cmd(String.raw`(?:no more|enough|without any|without|no)\s+(?:more\s+|any\s+)?(?:the\s+)?(?:questions?|interview\w*|asking)\b`),
  cmd(String.raw`(?:don'?t|do not|never)\s+(?:ask|interview|question|quiz|grill)\b`),
  cmd(String.raw`(?:i'?d rather not be (?:asked|questioned)|i don'?t want (?:any |more |all those )?(?:questions|to be asked))`),
  /^\W*(?:(?:ok|okay|so|now|nie|please)[,.!]?\s+)*just (?:give|show|send|throw|hit) me (?:some |more |a few )?(?:ideas|suggestions|sparks|options)\b/i,
  cmd(String.raw`leave (?:out )?the questions\b`),
];
const AUTO = [
  cmd(String.raw`ask(?:ing)?\s+(?:me\s+)?(?:questions\s+)?again\b`),
  cmd(String.raw`(?:resume|restart|bring back|turn on|switch on)\s+(?:the |your )?(?:questions|asking|interview)\b`),
  cmd(String.raw`go back to\s+(?:asking|normal|the questions)\b`),
  cmd(String.raw`ask\s+(?:me\s+)?(?:now and then|sometimes|occasionally|when it helps|when you need to)\b`),
];
const INTERVIEW = [
  cmd(String.raw`interview me\b`),
  cmd(String.raw`ask me\s+(?:some |a few |lots of |more |all your |your |many )?questions?\b`),
  cmd(String.raw`ask me\s+(?:one|questions|them)(?: at a time| one by one| one after another)`),
  cmd(String.raw`(?:one (?:question )?at a time|one by one)\b`),
  cmd(String.raw`walk me through\b`),
  cmd(String.raw`(?:quiz|question|grill) me\b`),
  cmd(String.raw`keep asking(?: me)?\b`),
  cmd(String.raw`guide me through\b`),
];

/** @returns {'interview'|'quiet'|'auto'|null} how the writer wants NIE to ask */
export function parseStyleCommand(text) {
  const t = lower(squash(String(text ?? '').slice(0, 400)));
  if (!t || !shortEnough(t, 14) || /\bmyself\b/.test(t) || QUOTED.test(t)) return null;
  if (QUIET.some((re) => re.test(t))) return 'quiet';
  if (AUTO.some((re) => re.test(t))) return 'auto';
  if (INTERVIEW.some((re) => re.test(t))) return 'interview';
  return null;
}

const KEEP_LEAD = String.raw`^\W*(?:(?:ok|okay|alright|so|now|nie|please|yes|yeah|right|well|then|great)[,.!]?\s+)*(?:please\s+)?`;
const KEEP_VERB = String.raw`(?:keep|commit|save|remember|store|lock in|log|file|pin)`;
const KEEP_ALL = String.raw`(?:this|that|it|the|my|our|all|everything)(?:\s+(?:whole|entire|full|complete))?(?:\s+(?:idea|story|premise|concept|piece|poem|essay|article|script|character|world|project|outline|plan|thing|lot))?(?:\s+(?:all|of it|as it is|as is|so far))?`;
const KEEP_TAIL = String.raw`(?:\s+(?:to|on|in|into)\s+(?:my\s+|the\s+|our\s+)?(?:idea\s?board|board|memory|project\s+memory|notes|memory\s+please))?(?:\s+(?:please|now|for me|thanks|thank you))?\W*$`;
const KEEP = [
  new RegExp(`${KEEP_LEAD}${KEEP_VERB}\\s+${KEEP_ALL}${KEEP_TAIL}`, 'i'),
  new RegExp(`${KEEP_LEAD}${KEEP_VERB}\\s+${KEEP_ALL}\\s+(?:to|in|into)\\s+memory${KEEP_TAIL}`, 'i'),
  new RegExp(`${KEEP_LEAD}(?:that'?s|that is)\\s+(?:everything|all|it|the (?:whole )?(?:idea|story|lot))\\W+(?:so\\s+|please\\s+|go ahead and\\s+)?${KEEP_VERB}(?:\\s+(?:it|this|that))?(?:\\s+all)?${KEEP_TAIL}`, 'i'),
  new RegExp(`${KEEP_LEAD}(?:commit|save|add)\\s+(?:(?:this|it|that|everything)\\s+)?to\\s+(?:my\\s+|the\\s+)?(?:idea\\s?board|memory|board)${KEEP_TAIL}`, 'i'),
];

/**
 * An explicit request to keep the WHOLE idea ("keep this idea", "commit this", "remember it all", "that's everything, keep it").
 * "remember this: she is afraid of water" keeps a single note (the Idea Board command) and is NOT this: anything after the object disqualifies it.
 */
export function parseKeepCommand(text) {
  const t = straight(squash(String(text ?? '').slice(0, 300)));
  if (!t || !shortEnough(t, 14) || QUOTED.test(t)) return false;
  return KEEP.some((re) => re.test(t)); // every pattern ends at the end of the message, so a note after the object disqualifies it
}

const DONE = new RegExp(
  String.raw`^\W*(?:(?:ok|okay|so|yeah|yes|well|right|alright|um|hm+|nope|no)[,.!]?\s+)*(?:i (?:think|guess|believe|reckon)\s+)?(?:` +
    String.raw`that'?s (?:it|all|everything|(?:about|pretty much|basically) (?:it|all|everything)|the (?:whole )?(?:idea|story|gist|lot|thing)|all (?:i have|i got|there is))|` +
    String.raw`that is (?:it|all|everything)|i'?m (?:done|finished)|i am (?:done|finished)|(?:there'?s |i have |i got )?nothing (?:else|more)|` +
    String.raw`that covers (?:it|everything)|that about covers it|no more (?:details|ideas)|(?:we'?re|we are) done|all done|` +
    String.raw`i (?:think )?(?:have|got) (?:nothing|no more) to add|that'?s all i (?:have|got)` +
    String.raw`)(?:\s+(?:i have|i got|there is|for now|so far|really|honestly|to be honest|at the moment|right now|i think|i guess|i suppose|thanks|thank you))*\W*` +
    String.raw`(?:(?:so |please |and |go ahead and )?(?:keep|save|commit|remember) (?:it|this|that)(?: all)?(?: please)?\W*)?$`,
  'i'
);

/** The writer says the idea is complete ("that's everything", "I'm done", "nothing else"). */
export function signalsDone(text) {
  const t = straight(squash(String(text ?? '').slice(0, 300)));
  return Boolean(t) && shortEnough(t, 16) && !QUOTED.test(t) && DONE.test(t);
}

// ── starting something else ──────────────────────────────────────────────────

const LEAD = String.raw`^\W*(?:(?:ok|okay|so|well|hmm+|alright|actually|now|nie|oh|um)[,.!]?\s+)*`;
const IDEA_NOUN = String.raw`(?:idea|story|project|poem|essay|article|script|book|novel|piece)`;
const NEWISH = String.raw`(?:new|different|separate|second|other|another)`;
// Where a command ends: the end of the message, a mark, or a word that starts the next clause. "Forget that she ever left" and "Start over in a new town" are story.
const END = String.raw`(?=\s*(?:$|[.,;:!?—–-])|\s+(?:and|but|then|let'?s|lets|please|now|i|we|so)\b)`;
const STRONG_NEW = new RegExp(`${LEAD}(?:(?:i|we)(?:'ve|\\s+have|\\s+got|\\s+had|\\s+also)*\\s+(?:a\\s+|an\\s+|another\\s+)?|here'?s\\s+(?:a\\s+|another\\s+)?|this is\\s+(?:a\\s+|another\\s+)?)(${NEWISH})\\s+(${IDEA_NOUN})\\b`, 'i');
const WEAK_NEW = new RegExp(`${LEAD}(?:a\\s+|an\\s+|another\\s+|one more\\s+)?(${NEWISH})\\s+(${IDEA_NOUN})\\b`, 'i');
// "Another idea for the ending: she burns the key" and "Another idea is that the bell is hers" add to the idea on the table; "Another idea: a robot who paints" starts one.
const SAME_IDEA = /^\s*(?:(?:for|about|on|regarding|concerning|to|of)\s+(?:the|her|his|their|this|that|my|our|its|a\s+(?:scene|chapter|twist|detail|line|moment|part|section|beat|ending|opening|middle|title|name|character))\b|(?:is|was|that|which|she|he|they|it)\b|[:,-]\s*(?:she|he|they|it|her|his|their|the|its|maybe|perhaps|what if|how about|instead|then|we|you|i)\b)/i;
// A bare "another story ..." counts only when the noun closes the phrase ("Another story:", "A different poem."); "Another story she tells is about the sea" is narrative.
const CLOSES_PHRASE = /^\s*(?:$|[:;,.!?—–-])|^\s+(?:idea|concept|premise|project|pitch|entirely|altogether|instead|please|now|then|today|about|where|in which|called|titled|set|with)\b/i;
const NEW_IDEA_AT_START = [
  new RegExp(`${LEAD}(?:let'?s|lets|can we|could we|i (?:want|wanna|'?d like) to|time to|i'?m going to|i will)\\s+(?:(?:switch|move on|change) (?:to|over to|on to) (?:a|an|another|something)\\b|start (?:over|again|fresh|afresh)${END}|begin again${END}|go with something\\b|try something\\b)`, 'i'),
  /^\W*(?:switching to|moving on to)\s+(?:a|an|another|something)\b/i,
  // "Start over." / "Forget that.": said to NIE, so at the start of the message and closing a clause ("He cannot forget that night" is the story)
  new RegExp(`${LEAD}(?:please\\s+)?(?:start|begin)\\s+(?:over|again|afresh|fresh|from scratch)${END}`, 'i'),
  new RegExp(`${LEAD}(?:please\\s+)?forget\\s+(?:that|this|all that|all this|the (?:last|previous|earlier) (?:one|idea))${END}`, 'i'),
];
const NEW_IDEA_SHORT = [
  new RegExp(String.raw`\b(?:try|do|write|work on|talk about|go with|pick|choose) (?:a|an|another) (?:different|new|other) ${IDEA_NOUN}\b`, 'i'),
];

/** The writer says outright that this is something new. */
export function startsNewIdeaExplicitly(text) {
  const t = straight(squash(String(text ?? '').slice(0, 600)));
  if (!t || QUOTED.test(t)) return false;
  if (NEW_IDEA_AT_START.some((re) => re.test(t))) return true;
  const wc = wordsOf(t).length;
  if (wc <= 10 && NEW_IDEA_SHORT.some((re) => re.test(t))) return true;
  const strong = STRONG_NEW.exec(t);
  const m = strong ?? WEAK_NEW.exec(t);
  if (!m) return false;
  const rest = t.slice(m.index + m[0].length);
  if (m[2].toLowerCase() === 'idea') return !SAME_IDEA.test(rest);
  return Boolean(strong) || CLOSES_PHRASE.test(rest);
}

const MIN_WORDS = 12;
const MIN_SHARED = 0.12;
const CONTINUES = /^\W*(?:she|he|her|his|they|their|them|it|its|also|and|but|plus|then|so|because|the same|that|those|these|maybe|perhaps|honestly|sometimes|still|now|however|though|anyway|meanwhile|later|earlier|otherwise|instead|overall|basically|first|next|finally|eventually|actually|there|everyone|everybody|nobody|everything|nothing|somebody|someone|something|anyone|anything|everywhere|somewhere|each|every|many|most|some|all|both|often|always|usually|never|whenever|whoever)\b/i;
/**
 * Things that point back at the idea already on the table: a pronoun for someone in it, "this", "the middle of the story"; and a writer talking about
 * their own thinking or work ("I keep thinking...", "My sister says..."). Such a message is the writer musing about the same idea, never a new one by the
 * overlap test, unless it is shaped like a fresh pitch ("a robot who paints...", "a story about...", "I have a new idea...", "I'm writing a ...").
 */
const POINTS_BACK = /\b(?:she|he|her|hers|his|him|this|the (?:story|book|piece|poem|plot|ending|middle|beginning|opening|draft|manuscript|scene|chapter|idea))\b|^\W*(?:i|we|my|our)\b/i;
const OPENS_WITH_THE = /^\W*the\b/i;
const WORKS = String.raw`(?:story|book|novel|script|screenplay|film|play|poem|piece|essay|article|song|memoir|speech)`;
const FRESH_PITCH = new RegExp(
  [
    // "A robot who paints sunsets...", "The widow who inherits...": the pitch is the subject of the message, so it must open it (a detail such as "In this story the
    // villagers have a ritual that nobody remembers" only contains the same shape)
    String.raw`^\W*(?:an?\s+(?:[\w'-]+\s+){0,3}?(?:who|whose|that)|the\s+(?:[\w'-]+\s+){0,3}?(?:who|whose))\b`,
    // "a story about...", "a poem where..." (an indefinite work, not "the story about")
    String.raw`\b(?:an?|another)\s+(?:[\w'-]+\s+){0,2}?${WORKS}\s+(?:about|where|in which|that|of)\b`,
    String.raw`\b(?:what about a|how about a)\b`,
    // "I have a story about...", "I've got a crazy idea about a robot who...": an "idea" counts only when it goes on to name something new
    String.raw`\b(?:i|we)(?:'ve|\s+have|\s+had)?\s+(?:got\s+)?(?:an?|another)\s+(?:${WORKS}|project)\b`,
    String.raw`\b(?:i|we)(?:'ve|\s+have|\s+had)?\s+(?:got\s+)?(?:an?|another)\s+(?:(?:new|different|fresh|crazy|wild|big|good|great|neat|cool|little|small|funny)\s+)?(?:idea|premise|plot|concept|pitch)\s+(?:about|for|where|of)\s+(?:an?|another|two|three)\b(?![^.!?]{0,30}\b(?:scene|chapter|twist|detail|line|moment|ending|opening|title|name)\b)`,
    // "I'm writing a novel about...", "I also want to work on an article about..."
    String.raw`\b(?:i|we)(?:'m|\s+am|\s+are|'re)\s+(?:writing|working on|making|planning|drafting|thinking of|starting)\s+(?:an?|another)\b`,
    String.raw`\b(?:i|we)\s+(?:also\s+)?(?:want|wanna|would like|plan|hope|need)\s+to\s+(?:write|work on|start|make|draft|try|begin)\s+(?:an?|another)\s+(?:[\w'-]+\s+){0,2}?(?:${WORKS}|idea|project)\b`,
  ].join('|'),
  'i'
);

/**
 * An explicit marker ("new idea", "another idea", "different story", "let's switch to", "start over", "forget that"), OR a substantive message
 * (12+ words) that shares fewer than 12% of its content stems with what is recorded, once the sheet holds three slots or more.
 * The second test is the risky one (a detail about a new part of the idea uses new words), so it is kept conservative. It is off when `skipOverlap`
 * (the writer is plainly answering a question); the writer's `recent` messages count as shared context, because the sheet records only part of what
 * was said; and a message that opens with a pronoun or a connective ("She ...", "But ..."), or points back at someone with "she/he/her/his..." without
 * reading as a fresh pitch, continues something and is never a new idea by this test.
 */
export function isNewIdea(text, state, { skipOverlap = false, recent = [] } = {}) {
  if (startsNewIdeaExplicitly(text)) return true;
  const t = squash(String(text ?? '').slice(0, 2000));
  // "The ferry runs twice a week..." is a detail about something the writer already has far more often than it is a fresh pitch, so a definite article
  // opening counts as pointing back too (a pitch such as "The widow who inherits..." has a fresh-pitch shape and is still new)
  if (skipOverlap || wordsOf(t).length < MIN_WORDS || CONTINUES.test(t) || ((POINTS_BACK.test(t) || OPENS_WITH_THE.test(t)) && !FRESH_PITCH.test(t))) return false;
  const filled = filledIds(state);
  if (filled.length < 3) return false;
  const said = (Array.isArray(recent) ? recent : []).filter((m) => typeof m === 'string' || (m && m.role !== 'assistant')).slice(-6).map((m) => (typeof m === 'string' ? m : String(m.content ?? '')));
  const known = stemSet([...filled.map((id) => getSlot(state, id).value), ...(state.extra ?? []), ...said.filter((m) => squash(m) !== t)].join(' '));
  const mine = [...new Set(stemList(t))];
  if (!mine.length) return false;
  const shared = mine.filter((s) => known.has(s)).length;
  return shared / mine.length < MIN_SHARED;
}

// ── the set-aside idea ───────────────────────────────────────────────────────

const OLD = String.raw`(?:earlier|previous|old|first|other|last|original|set[- ]aside|shelved|parked|prior)`;
const THING = String.raw`(?:idea|story|one|poem|piece|essay|article|script|character|world|project|sheet|draft)`;
const RESTORE = [
  new RegExp(String.raw`\b(?:bring back|restore|go back to|return to|get back to|back to|resume|continue with|continue|pick up|reopen|switch back to|come back to|revisit)\s+(?:with\s+)?(?:the|my|that|our)\s+${OLD}\s+${THING}\b`, 'i'),
  new RegExp(String.raw`\b(?:bring back|restore|go back to|return to|resume|pick up)\s+(?:the|my|that)\s+${THING}\s+(?:i|we)\s+(?:set aside|parked|shelved|had before|had earlier|was working on|were working on)\b`, 'i'),
];
const KEEP_OLD = [
  new RegExp(String.raw`\b(?:keep|save|commit|remember|store|file|pin|put)\s+(?:the|my|that|our)\s+${OLD}\s+${THING}\b`, 'i'),
  new RegExp(String.raw`\b(?:keep|save|commit|remember|store)\s+(?:the|my|that)\s+${THING}\s+(?:i|we)\s+(?:set aside|parked|shelved|had before|had earlier|was working on|were working on)\b`, 'i'),
];

/** "bring back the earlier idea" -> 'restore'; "keep the earlier idea" -> 'keep'; anything else null. */
export function parseShelfCommand(text) {
  const t = straight(squash(String(text ?? '').slice(0, 300)));
  if (!t || !shortEnough(t, 16) || QUOTED.test(t)) return null;
  if (RESTORE.some((re) => re.test(t))) return 'restore';
  if (KEEP_OLD.some((re) => re.test(t))) return 'keep';
  return null;
}

// ── small shared judgements ──────────────────────────────────────────────────

const WH_START = /^\s*(?:what|who|whom|whose|how|why|when|where|which)\b/i;
const AUX_START = /^\s*(?:can|could|would|should|will|shall|may|might|do(?!\s+not\b)|does|did|is|are|am|was|were|have|has)\b/i;
// "What she wants is her brother back." / "Who she really is stays hidden." are statements that open with a question word: the word is followed by a
// pronoun or an article, not by a verb ("what happens", "who is", "how do I"), and does not end in a question mark.
const WH_STATEMENT = /^\s*(?:what|who|whom|whose|how|why|when|where|which)\s+(?:she|he|they|it|we|i|you|her|his|their|my|our|the|a|an|this|that|these|those)\b/i;
/** A question put to NIE (or to themselves): a question mark, or a question word or auxiliary opening the message. */
export function looksLikeQuestion(text) {
  const t = String(text ?? '');
  if (/\?\s*["')\]]*\s*$/.test(t)) return true;
  if (AUX_START.test(t)) return true;
  if (!WH_START.test(t)) return false;
  return !WH_STATEMENT.test(t);
}

// Verbs that only ever address NIE ("write a scene", "suggest a title") are commands; the everyday ones ("find her brother", "make peace", "save the village",
// "tell the truth") are what a writer says when they ANSWER "what does she want?", so they are commands only when they ask NIE for something.
const HARD_IMPERATIVE = /^\s*(?:please\s+)?(?:write|draft|compose|rewrite|edit|fix|continue|finish|suggest|recommend|summari[sz]e|explain|describe|list|generate|brainstorm|help|think|come up|what about|how about)\b/i;
const SOFT_IMPERATIVE = /^\s*(?:please\s+)?(?:give|show|tell|make|create|find|pick|choose)\b/i;
const ASKS_NIE = /\b(?:me|us|please|pls)\b|\b(?:ideas?|suggestions?|options|examples?|twists?|versions?|variations?|alternatives?|poems?|stor(?:y|ies)|scenes?|chapters?|paragraphs?|openings?|headlines?|dialogue|outlines?|summary|lists?|drafts?|lines?|titles?|names?)\b/i;
// "Can you suggest...", "do you think...": said to someone, so said to NIE
const ADDRESSES_YOU = /^\s*(?:please\s+)?(?:can|could|would|will|do|did|have)\s+you\b/i;
/** A request put to NIE ("give me twists", "write a scene"), as opposed to a statement about the idea. */
export const looksLikeRequest = (text) => {
  const t = String(text ?? '');
  return HARD_IMPERATIVE.test(t) || ADDRESSES_YOU.test(t) || (SOFT_IMPERATIVE.test(t) && ASKS_NIE.test(t));
};
/** A request or command rather than a statement about the idea (so it is never recorded as an answer). */
export const looksLikeCommand = (text) => looksLikeRequest(text) || Boolean(parseStyleCommand(text)) || parseKeepCommand(text) || signalsDone(text) || Boolean(parseShelfCommand(text));
