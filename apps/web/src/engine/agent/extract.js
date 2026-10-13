import { extractPremiseCues } from '../intent/intent.js';
import { similarity, splitSentencesLite } from '../orchestrator/variety.js';
import { slotsFor } from './detect.js';
import { slotForRole, startSlot } from './sheet.js';
import { STOPWORDS, stem } from '../util/text.js';
import { LIMITS, clipAtBoundary, filledIds, getSlot, slotValue, squash, stemList, stemSet, wordsOf } from './state.js';
import { looksLikeCommand, looksLikeQuestion } from './talk.js';

/**
 * Reading what the writer said into the idea sheet.
 *
 * With a model: ONE schema-constrained call that lists, per slot, a short phrase the writer actually said. A 3B model is a poor note-taker (it
 * tidies, guesses and sometimes answers instead), so nothing it returns is believed until it is GROUNDED: a value stays only if at least 70% of
 * its content-word stems occur in the writer's message AND it is the message shortened (every content word there, in the same order, no name or figure the
 * writer did not give, no negation dropped or invented), it is short, and it is not a refusal or the prompt read back. The rest is dropped silently.
 * Without a model, or when the model's reply is unusable or grounds to nothing: rules (below). Either way every value is the writer's own words.
 */

export const EXTRACT_SYSTEM = `You listen to a writer describing an idea and note down ONLY what they actually said.
For each listed slot that the message covers, give the slot id and a short phrase copied or lightly shortened from the message.
Never add, guess, improve or tidy. Leave a slot out when the writer did not say it. A detail that fits no slot goes in "extra", also in their words.
Reply with JSON only: {"updates":[{"slot":"id","value":"..."}],"extra":""}`;

const MAX_UPDATES = 4;
const MIN_GROUNDED = 0.7;
const MESSAGE_CHARS = 1500;

/** Constrains the model to the slot ids of THIS idea (llama.cpp turns it into a grammar). */
export function extractionSchema(slotIds) {
  return {
    type: 'object',
    properties: {
      updates: {
        type: 'array',
        maxItems: MAX_UPDATES,
        items: { type: 'object', properties: { slot: { type: 'string', enum: [...slotIds] }, value: { type: 'string', maxLength: LIMITS.value } }, required: ['slot', 'value'], additionalProperties: false },
      },
      extra: { type: 'string', maxLength: LIMITS.value },
    },
    required: ['updates', 'extra'],
    additionalProperties: false,
  };
}

export function buildExtractMessages({ message, slots, question = '' }) {
  const list = slots.map((s) => `${s.id}: ${squash(s.hint).slice(0, 120)}`).join('\n');
  const text = String(message).trim();
  const shown = text.length > MESSAGE_CHARS ? `${text.slice(0, MESSAGE_CHARS).trimEnd()} …` : text;
  const parts = [`Slots:\n${list}`];
  if (question) parts.push(`The writer is answering this question: ${squash(question).slice(0, 240)}`);
  parts.push(`The writer's message:\n"""\n${shown}\n"""`);
  return [{ role: 'system', content: EXTRACT_SYSTEM }, { role: 'user', content: parts.join('\n\n') }];
}

/** Read the model's answer. Tolerates text around the JSON and a cut-off answer; null when nothing usable is there. */
export function parseExtraction(raw) {
  const s = String(raw ?? '');
  let obj = null;
  const block = s.match(/\{[\s\S]*\}/);
  if (block) {
    try {
      obj = JSON.parse(block[0]);
    } catch {
      /* salvage below */
    }
  }
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const updates = Array.isArray(obj.updates) ? obj.updates.filter((u) => u && typeof u.slot === 'string' && typeof u.value === 'string').map((u) => ({ slot: u.slot, value: u.value })) : [];
    const extra = typeof obj.extra === 'string' ? obj.extra : Array.isArray(obj.extra) ? obj.extra.filter((e) => typeof e === 'string').join('; ') : '';
    return { updates, extra };
  }
  const pairs = [...s.matchAll(/"slot"\s*:\s*"([^"]+)"\s*,\s*"value"\s*:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => ({ slot: m[1], value: m[2].replace(/\\"/g, '"') }));
  return pairs.length ? { updates: pairs, extra: '' } : null;
}

// ── grounding ────────────────────────────────────────────────────────────────

const NOT_AN_ANSWER = /^(?:n\/a|none|null|nothing|unknown|unspecified|not (?:specified|mentioned|stated|given|provided|said|known|applicable|clear)|no (?:information|details?|answer|mention|data)|the writer (?:did not|didn'?t|has not|hasn'?t|does not|doesn'?t)|i (?:cannot|can'?t|could not|couldn'?t|am sorry|'?m sorry|don'?t know|do not know)|sorry\b|as an ai\b)/i;
const ECHOES_PROMPT = /\b(?:slot ids?|json|triple quotes?|the writer'?s message|copied or lightly shortened|note down only|leave (?:it|a slot) out|extra details?)\b/i;
const IS_INSTRUCTION = /^(?:write|draft|compose|rewrite|ask|describe|please|ensure|make sure|note that|you (?:should|must|need)|do not|don'?t)\b/i;

const cleanValue = (v) => squash(v).replace(/^["“'‘`([]+|["”'’`)\]]+$/g, '').replace(/[.;,\s]+$/, '').trim();

// Stems cannot see a "not" (it is a stopword), and a small model drops negations and invents names when it "tidies". So, besides the stem test, a value must
// (1) not name or number anything the writer did not (a capitalised word or a figure that is not in the message), and (2) not turn a negated statement
// into its opposite ("Mara does not want to find her brother" must never become "Mara wants to find her brother"), nor add a "not" the writer never said.
const NEG = /^(?:not|no|never|none|nobody|nowhere|without|neither|nor|cannot|ain'?t)$|n['’]t$/i;
const NEG_WINDOW = 4;
const NAMEISH = /(?<![\p{L}\p{N}])(?:\p{Lu}[\p{L}'’-]+|\d[\d,.]*)/gu;

function sourceOf(text) {
  const words = wordsOf(text).map((w) => w.toLowerCase());
  return { text, tokens: words, stems: stemList(text), raw: new Set(words.flatMap((w) => [w, stem(w), w.replace(/['’]s$/, '')])) };
}

/**
 * The value is the writer's message with some words left out: every content word of it is there, in the same order. That is "copied or lightly shortened"; it is not
 * a paraphrase, it adds nothing ("a dragon" among the writer's own words), and it cannot turn "Corin hates Mara" into "Mara hates Corin".
 */
function isShortening(value, src) {
  let at = 0;
  for (const s of stemList(value)) {
    while (at < src.stems.length && src.stems[at] !== s) at++;
    if (at >= src.stems.length) return false;
    at++;
  }
  return true;
}

/** A capitalised word or a figure in the value that the source never uses. */
function inventsName(value, src) {
  for (const m of value.matchAll(NAMEISH)) {
    const w = m[0].toLowerCase().replace(/['’]s$/, '').replace(/[.,]+$/, '');
    if (!w || (STOPWORDS.has(w) && /^\p{Lu}/u.test(m[0]))) continue; // "The", "She" opening the value
    if (!src.raw.has(w) && !src.raw.has(stem(w))) return true;
  }
  return false;
}

/** The value says the opposite of the writer (a dropped or an invented negation). */
function flipsNegation(value, src) {
  const vTokens = wordsOf(value).map((w) => w.toLowerCase());
  const vNegs = vTokens.filter((w) => NEG.test(w));
  const mNeg = src.tokens.some((w) => NEG.test(w));
  if (vNegs.some((w) => !src.tokens.includes(w))) return true; // a "not" the writer never said (a "never" elsewhere in the message does not make it theirs)
  if (vNegs.length || !mNeg) return false;
  const mine = new Set(stemList(value));
  if (!mine.size) return false;
  for (let i = 0; i < src.tokens.length; i++) {
    if (!NEG.test(src.tokens[i])) continue;
    // the negation reaches the words just after it ("doesn't want to find her brother", "never speaks to her")
    const reach = stemList(src.tokens.slice(i + 1, i + 1 + NEG_WINDOW).join(' '));
    if (reach.some((x) => mine.has(x))) return true;
  }
  return false;
}

/** Is this value the writer's own words? (See the file header.) `vocab` is the set of stems the writer's message contains; `message` (when given) adds the name and negation checks. */
export function isGroundedValue(value, vocab, slot = null, message = null) {
  const v = cleanValue(value);
  if (!v || v.length > LIMITS.value) return false;
  if (NOT_AN_ANSWER.test(v) || ECHOES_PROMPT.test(v) || IS_INSTRUCTION.test(v) || isShrug(v)) return false;
  if (slot && (similarity(v, slot.hint) >= 0.8 || v.toLowerCase().includes(slot.hint.toLowerCase().slice(0, 40)))) return false; // the hint read back
  const stems = stemList(v);
  if (!stems.length) return false;
  if (stems.filter((s) => vocab.has(s)).length / stems.length < MIN_GROUNDED) return false;
  if (message == null) return true;
  const src = typeof message === 'string' ? sourceOf(message) : message;
  return isShortening(v, src) && !inventsName(v, src) && !flipsNegation(v, src);
}

const sameValue = (a, b) => squash(a).toLowerCase().replace(/[.;,]+$/, '') === squash(b).toLowerCase().replace(/[.;,]+$/, '');

/** Keep only grounded, existing, new, distinct updates (at most four). `extra` is kept only when grounded too. */
export function groundExtraction(parsed, { slots, state, vocab, message = null }) {
  const src = message == null ? null : sourceOf(String(message));
  const byId = new Map(slots.map((s) => [s.id, s]));
  const updates = [];
  const seenSlots = new Set();
  const seenValues = new Set();
  for (const u of parsed.updates.slice(0, MAX_UPDATES * 3)) {
    const slot = byId.get(u.slot);
    if (!slot || seenSlots.has(slot.id)) continue;
    const value = cleanValue(u.value);
    if (!isGroundedValue(value, vocab, slot, src)) continue;
    if (getSlot(state, slot.id) && sameValue(slotValue(state, slot.id), value)) continue;
    if (seenValues.has(value.toLowerCase())) continue;
    seenSlots.add(slot.id);
    seenValues.add(value.toLowerCase());
    updates.push({ slot: slot.id, value });
    if (updates.length >= MAX_UPDATES) break;
  }
  const e = cleanValue(parsed.extra ?? '');
  const taken = new Set([...updates.map((u) => u.value.toLowerCase()), ...state.extra.map((x) => x.toLowerCase())]);
  const extra = e && isGroundedValue(e, vocab, null, src) && !taken.has(e.toLowerCase()) ? [clipAtBoundary(e, LIMITS.extraItem)] : [];
  return { updates, extra };
}

// ── the rules (no model) ─────────────────────────────────────────────────────

const NON_ANSWERS = new Set(['idk', 'dunno', 'none', 'nothing', 'unsure', 'maybe', 'skip', 'pass', 'nah', 'nope', 'hmm', 'hm', 'whatever', 'unknown', 'na', 'ok', 'okay', 'yes', 'no', 'sure', 'thanks', 'thx', 'nvm', 'later', 'unclear', 'um', 'uh', 'er', 'mm', 'ah', 'oh', 'eh', 'ha', 'hah', 'yeah', 'yep', 'yup']);

// "I don't know", "no idea what to put here", "I'm not sure yet", "skip that one": a shrug answers nothing, so it must never be filed as the writer's answer
// (it would fill the slot with "I don't know" and make NIE look as if it understood more than it does). Each form must OPEN the message: "She has no idea"
// and "He wants to skip town" are the story.
const SHRUG_FILL = String.raw`^\W*(?:(?:ok|okay|um|uh|hmm+|well|honestly|sorry|so|oh|ah|yeah|er)[,.!]?\s+)*`;
const SHRUGS = [
  String.raw`i\s+(?:really\s+|just\s+|honestly\s+)?(?:don'?t|dont|do not)\s+(?:really\s+)?(?:know|have\s+(?:an?\s+)?(?:idea|answer|clue))`,
  String.raw`(?:i\s+(?:have|got)\s+)?no\s+(?:idea|clue)`,
  String.raw`(?:i'?m\s+|i\s+am\s+)?(?:still\s+)?(?:really\s+)?(?:not\s+(?:really\s+|entirely\s+)?(?:sure|certain|decided)|unsure|undecided)`,
  String.raw`i\s+(?:haven'?t|havent|have not)\s+(?:really\s+)?(?:decided|thought|figured|worked)`,
  String.raw`(?:i'?m\s+|i\s+am\s+)?(?:still\s+)?(?:thinking|figuring)\s+(?:it\s+|that\s+|this\s+)?(?:out|about)`,
  String.raw`(?:i'?ll|i\s+will|let\s+me)\s+think`,
  String.raw`dunno|idk`,
  String.raw`(?:it'?s\s+)?hard\s+to\s+say|i\s+can'?t\s+(?:say|decide|tell)`,
  String.raw`you\s+(?:decide|choose|pick)|you\s+tell\s+me|surprise\s+me|up\s+to\s+you`,
];
const SHRUG = new RegExp(`${SHRUG_FILL}(?:${SHRUGS.join('|')})\\b`, 'i');
const SKIP = /^\W*(?:(?:ok|okay|so|well|um|let'?s|i'?ll|can we|please)\s+)*(?:skip|pass)(?:\s+(?:that|this|it|that one|this one|for now|please|question))*\W*$/i;
const HEDGE = /\b(?:maybe|perhaps|possibly|probably|something like|kind of|sort of|or)\b/i;
const ECHOES_QUESTION = /^[\s,.;:!-]*(?:what|how|why|who|where|when|which|whether|if|about|that|to)\b/i;
/** The message says "I don't know / not sure / skip" and nothing else worth recording. */
export function isShrug(message) {
  const t = squash(typeof message === 'string' ? message.slice(0, 400) : '');
  if (!t || wordsOf(t).length > 10) return false;
  if (SKIP.test(t)) return true;
  const m = SHRUG.exec(t);
  if (!m) return false;
  const rest = t.slice(m.index + m[0].length);
  if (HEDGE.test(rest)) return false; // "I'm not sure, maybe the sea" is a tentative answer
  return stemList(rest).length <= (ECHOES_QUESTION.test(rest) ? 3 : 1); // "I don't know what stands in the way" repeats the question
}

/**
 * The message as a statement the writer made (not a question, not a command, not a shrug) with enough in it to be an answer: two content words, or a
 * single word that is not a filler ("Mara" and "Jo" answer "who is it about?"; "idk" does not). Right after a question (`asked`), one content word with
 * its article is enough too: "the sea", "her brother" and "a key" are real answers.
 */
export function isAnswer(message, { asked = false } = {}) {
  if (looksLikeQuestion(message) || looksLikeCommand(message) || isShrug(message)) return false;
  const ws = wordsOf(message);
  const content = stemList(ws.filter((w) => !NON_ANSWERS.has(w.toLowerCase())).join(' '));
  if (content.length >= 2 || (asked && content.length === 1)) return true;
  if (ws.length !== 1) return false;
  const word = ws[0].toLowerCase();
  return word.length >= 2 && !NON_ANSWERS.has(word) && !STOPWORDS.has(word);
}

/** The cue as the writer typed it (a lower-cased cue is found again in the message so its capital letters and spelling are the writer's). */
function lift(message, phrase) {
  const i = message.toLowerCase().indexOf(String(phrase).toLowerCase());
  return i >= 0 ? message.slice(i, i + phrase.length) : '';
}

// A capitalised word is a person's name only when nothing marks it as a place, a time or an adjective, and something marks it as a person: "in Lagos", "on Monday",
// "across Europe", "a small Cornish village" are not people; "a baker named Ada", "Mara hears", "Ines, a ferry captain" are. (extractPremiseCues treats every
// capitalised word as a "character"; here the first one that passes is the main character, and NIE never glues two together.) Unsure means no name: the
// planner simply asks who it is about, which is better than "What does Cornish want?".
const NOT_NAMES = new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'christmas', 'easter', 'halloween', 'thanksgiving', 'ramadan', 'diwali', 'hanukkah', 'god', 'winter', 'summer', 'autumn', 'spring']);
const BEFORE_NOT_A_PERSON = new Set(['in', 'at', 'on', 'from', 'to', 'near', 'by', 'across', 'during', 'of', 'around', 'inside', 'outside', 'beyond', 'toward', 'towards', 'through', 'into', 'onto', 'off', 'over', 'under', 'beside', 'behind', 'since', 'until', 'before', 'after', 'the', 'a', 'an',
  // someone's relative or friend is not who the story is about
  'friend', 'brother', 'sister', 'mother', 'father', 'wife', 'husband', 'son', 'daughter', 'uncle', 'aunt', 'cousin', 'boss', 'neighbour', 'neighbor', 'lover', 'rival', 'enemy', 'partner', 'colleague', 'teacher', 'student', 'grandmother', 'grandfather', 'mum', 'mom', 'dad']);
const NAME_FOLLOWED_BY = /^(?:['’]s\b|\s+(?:and|is|was|has|had|wants?|needs?|must|can|could|will|would|hears?|sees?|finds?|loves?|hates?|lives?|keeps?|runs?|says?|knows?|goes?|gets?|takes?|makes?|tries|tried|fears?|dreams?|hides?|loses?|leaves?|returns?|meets?|discovers?|decides?|never|always|still|also|just|cannot|can't|doesn't|didn't|isn't|wasn't|hasn't)\b|\s*,\s*(?:an?|the|who|whose|my|her|his)\b|\s*[.!?;:]|\s*$)/i;
const NAME_INTRODUCED_BY = /\b(?:named|called|name is|name's|names?)\s*$/i;
const escapeRe = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function personIn(text, capitalised) {
  for (const name of capitalised) {
    if (NOT_NAMES.has(name.toLowerCase())) continue;
    const re = new RegExp(`(?<![\\p{L}])${escapeRe(name)}(?![\\p{L}])`, 'gu');
    const hits = [...text.matchAll(re)];
    if (!hits.length) continue;
    const at = hits[0].index;
    const prev = text.slice(0, at).match(/([\p{L}'-]+)\W*$/u)?.[1]?.toLowerCase();
    if (prev && BEFORE_NOT_A_PERSON.has(prev)) continue;
    const run = text.slice(at).match(/^\p{Lu}[\p{L}'’-]*(?:\s+\p{Lu}[\p{L}'’-]*){0,2}/u)?.[0] ?? name; // "Ada Penhale", as typed
    const after = text.slice(at + run.length);
    if (NAME_INTRODUCED_BY.test(text.slice(0, at)) || NAME_FOLLOWED_BY.test(after) || hits.length >= 2) return run;
  }
  return null;
}

// ── "The ending is ...", "Mara wants to ...", "It is set in ...": the writer says which slot a sentence is for ──────────────────────────────
// Without a model, a statement that follows a question is taken for its answer. But a writer who says "The theme is loyalty" while NIE asked about the setting has
// said where it goes, so the sentence goes there. Only plain, explicit forms count; anything else stays with the question.
const SAYS = String.raw`(?:is|are|was|will be|should be|must be|has to be|needs to be|would be|feels|sounds|involves)`;
const SYNONYMS = { theme: ['message', 'moral'], setting: ['location'], tone: ['mood', 'atmosphere'], premise: ['logline', 'pitch'], obstacle: ['conflict', 'problem'], opposition: ['antagonist', 'villain'], motifs: ['motif', 'symbol'], motif: ['symbol'], inciting: ['inciting incident'], voice: ['narrator'], stakes: ['stake'] };
const PERSONAL = new Set(['want', 'fear', 'flaw', 'contradiction', 'manner', 'relationships', 'history', 'arc', 'secret', 'habits', 'reputation', 'beliefs', 'skills', 'role']);
const ROUTE_LEAD = String.raw`^(?:(?:and|but|also|oh|so|well|actually|ok|okay)[,\s]+)*`;
const routeCache = new Map();
function routeRes(id) {
  let r = routeCache.get(id);
  if (!r) {
    const keys = [id.replace(/-/g, ' '), ...(SYNONYMS[id] ?? [])].map(escapeRe).join('|');
    const owner = PERSONAL.has(id) ? 'the|my|its|our|her|his|their' : 'the|my|its|our';
    r = {
      says: new RegExp(`${ROUTE_LEAD}(?:${owner})\\s+(?:(?:main|central|overall|real|final|whole|big|core|true)\\s+)?(?:${keys})\\s+${SAYS}\\b`, 'i'),
      label: new RegExp(`${ROUTE_LEAD}(?:the\\s+)?(?:${keys})\\s*[:\\u2013\\u2014-]\\s*(?=\\S)`, 'i'),
    };
    if (routeCache.size > 500) routeCache.clear();
    routeCache.set(id, r);
  }
  return r;
}
const WANTS = /^(?:(?:and|but|also|so|well|actually)[,\s]+)*(?:she|he|they|[\p{Lu}][\p{L}'’-]+(?:\s+[\p{Lu}][\p{L}'’-]+)?)\s+(?:really\s+|just\s+|still\s+|desperately\s+|only\s+)?(?:wants?|needs?|hopes?|longs?|dreams?|wishes)\s+to\b/iu;
const SET_IN = /^(?:(?:and|but|also|so|well|actually)[,\s]+)*(?:it|this|that|the (?:story|book|piece|film|play|script|world|novel))\s+(?:is\s+|all\s+)?(?:set|takes place|happens|unfolds|begins|starts|opens)\s+(?:in|at|on|during|aboard|inside|beneath|around|across)\b/i;
const FEELS = /^(?:(?:and|but|also|so|well|actually)[,\s]+)*(?:i\s+(?:think\s+|want\s+|'d like\s+|would like\s+)?)?(?:it|this|the (?:story|piece|book|poem|film|play|script))\s+(?:should|must|needs to|has to|ought to|to)\s+(?:be|feel|read|sound|look)\b/i;
const IF_FAILS = /^(?:(?:and|but|also|so|well|actually)[,\s]+)*if\s+(?:she|he|they|it|[\p{Lu}][\p{L}'’-]+)\s+(?:fails?|loses?|doesn'?t|does not|can'?t|cannot|never|gives up|gets caught|is caught)\b/iu;

/** The slot a single sentence is plainly for, and the words to file there; null when it does not say. */
function routeSentence(sentence, slots) {
  const ids = new Set(slots.map((x) => x.id));
  const set = (id, value) => (ids.has(id) && cleanValue(value) ? { slot: id, value } : null);
  for (const slot of slots) {
    const r = routeRes(slot.id);
    if (r.says.test(sentence)) return set(slot.id, sentence);
    const label = r.label.exec(sentence);
    if (label) return set(slot.id, sentence.slice(label[0].length));
  }
  if (WANTS.test(sentence)) return set('want', sentence);
  if (SET_IN.test(sentence)) {
    const place = slotForRole(slots, 'place');
    return place ? set(place.id, sentence) : null;
  }
  if (IF_FAILS.test(sentence)) return set('stakes', sentence);
  if (FEELS.test(sentence)) return set(ids.has('tone') ? 'tone' : ids.has('feeling') ? 'feeling' : ids.has('tone-outlet') ? 'tone-outlet' : '', sentence);
  return null;
}

function rulesExtract({ message, state, slots, pendingSlot }) {
  const updates = [];
  const touched = new Set(filledIds(state));
  const put = (slotId, value) => {
    const v = cleanValue(clipAtBoundary(value, LIMITS.value));
    if (!v || updates.length >= MAX_UPDATES || updates.some((u) => u.slot === slotId)) return false;
    if (getSlot(state, slotId) && sameValue(slotValue(state, slotId), v)) return false;
    updates.push({ slot: slotId, value: v });
    touched.add(slotId);
    return true;
  };
  const whole = squash(message);
  // 0. sentences that say which slot they are for go there; the rest is read as before
  const routed = new Set();
  for (const sentence of splitSentencesLite(whole)) {
    const hit = routeSentence(squash(sentence), slots);
    if (hit && !updates.some((u) => u.slot === hit.slot) && put(hit.slot, hit.value)) routed.add(sentence);
  }
  const text = routed.size ? squash(splitSentencesLite(whole).filter((x) => !routed.has(x)).join(' ')) : whole;
  const answer = isAnswer(text);

  // 1. the writer is answering the question NIE asked: the answer goes to that slot, whole, cut at a sentence or word
  const answered = Boolean(pendingSlot && slots.some((s) => s.id === pendingSlot) && isAnswer(text, { asked: true }) && put(pendingSlot, text));
  const start = startSlot(slots);
  const pitch = answer && !answered && wordsOf(text).length >= 6; // a first statement that step 3 will file whole

  // 2. names, places and themes the writer used, into the slots that mean them, when those are still empty
  if (answer || (!looksLikeQuestion(text) && !looksLikeCommand(text) && wordsOf(text).length >= 3)) {
    const cues = extractPremiseCues(text);
    // a person goes only into a slot that IS the main character (not any slot that files into memory as a character), and where that slot is also where
    // the conversation starts (the character pack's "role") the whole statement is the better answer than the bare name, so step 3 takes it
    const who = slotForRole(slots, 'who', { strict: true });
    if (who && !touched.has(who.id) && !(pitch && start?.id === who.id)) {
      const name = personIn(text, cues.characters.filter((c) => /^\p{Lu}/u.test(c)));
      // "her brother" is someone's relative, not the person this is about: a role counts only when it is introduced with "a/an/the"
      const roles = cues.characters.filter((c) => !/^\p{Lu}/u.test(c) && new RegExp(`\\b(?:a|an|the)\\s+(?:[\\p{L}'-]+\\s+){0,2}?${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'iu').test(text));
      const value = name ?? (roles[0] ? lift(text, roles[0]) : '');
      if (value) put(who.id, value);
    }
    const place = slotForRole(slots, 'place');
    if (place && !touched.has(place.id) && cues.settings[0]) put(place.id, lift(text, cues.settings[0]));
    const theme = slotForRole(slots, 'theme', { strict: true });
    if (theme && !theme.core && !touched.has(theme.id)) {
      // a lone theme word never fills a core slot (that would make NIE look as if it grasped the idea better than it does);
      // the cue is NIE's label for a theme; it is the writer's own word only if they used it
      const used = cues.themes.map((t) => text.match(new RegExp(`\\b${t}\\w*`, 'i'))?.[0]).find(Boolean);
      if (used) put(theme.id, used);
    }
  }

  // 3. the first substantive statement becomes the premise (the first core slot with nothing before it), unless it was just taken as the answer to a question
  if (start && pitch && !touched.has(start.id)) put(start.id, text);
  // 4. a statement about the story that fits no part is still something the writer said: it is kept under "Also", in their words, so the recap never loses it.
  // (Only when it is plainly about the story: it names someone or somewhere, or uses words already on the sheet. Remarks about the process are not the idea.)
  let detail = false;
  if (!updates.length && answer && wordsOf(text).length >= 6) {
    const cues = extractPremiseCues(text);
    const mine = stemList(text);
    const held = new Set([...Object.values(state.slots ?? {}).flatMap((r) => stemList(r?.value)), ...(state.extra ?? []).flatMap((e) => stemList(e))]);
    detail = cues.characters.length > 0 || cues.settings.length > 0 || mine.some((x) => held.has(x));
  }
  return { updates, extra: detail ? [text] : [] };
}

/**
 * @param {{ message: string, state: object, ctx: object, chat?: Function|null, pendingSlot?: string|null, signal?: AbortSignal }} args
 * @returns {Promise<{ updates: { slot: string, value: string }[], extra: string[], by: 'model'|'rules' }>}
 */
export async function extractSlots({ message, state, ctx, chat = null, pendingSlot = null, signal } = {}) {
  const text = String(message ?? '').slice(0, 8000);
  const slots = slotsFor(state, ctx);
  if (!squash(text) || !slots.length) return { updates: [], extra: [], by: 'rules' };
  const pending = pendingSlot && slots.some((s) => s.id === pendingSlot) ? pendingSlot : null;

  // (a shrug or a word or two is read by the rules just as well, and a call to a local model costs seconds the writer waits for)
  if (typeof chat === 'function' && wordsOf(text).length > 3 && !isShrug(text)) {
    let res = null;
    try {
      res = await chat(buildExtractMessages({ message: text, slots, question: pending && state.pending?.kind === 'question' && state.pending.slot === pending ? state.pending.text : '' }), {
        purpose: 'extract', stream: false, maxTokens: 180, temperature: 0, json: extractionSchema(slots.map((s) => s.id)), timeoutMs: 40000, signal,
      });
    } catch (err) {
      if (err?.kind === 'abort') throw err;
    }
    const parsed = res?.text ? parseExtraction(res.text) : null;
    if (parsed) {
      const vocab = stemSet(text);
      let source = text;
      if (pending) {
        const recorded = slotValue(state, pending);
        for (const s of stemList(recorded)) vocab.add(s); // a refined answer may reuse what was already recorded for that slot
        source = `${recorded} ${text}`;
      }
      const grounded = groundExtraction(parsed, { slots, state, vocab, message: source });
      if (grounded.updates.length || grounded.extra.length) return { ...grounded, by: 'model' };
    }
  }
  return { ...rulesExtract({ message: text, state, slots, pendingSlot: pending }), by: 'rules' };
}
