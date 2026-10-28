import { detectIntent, extractPremiseCues, updateWorkingPremise } from '../intent/intent.js';
import { interpretProfile } from '../profile/interpret.js';
import { answerFromLibrary, forProfile, libraryStatus, loadLibrary, search, searchScored } from '../knowledge/index.js';
import { MAX_AGE, afterRest, chipsFor, noteAnswer, resolveFollowUp } from '../knowledge/thread.js';
import { emptyThread } from '../knowledge/thread-state.js';
import { appendMessage } from '../project/memory.js';
import { addToBoard, boardToChat, emptyBrainstorm, ideaId } from '../project/board.js';
import { scan, scanWithModel } from '../analysis/scan.js';
import { composeMessages, ideaRequestBlock, indexFor, RETRY_TOKEN_LIMIT } from './prompt.js';
import { aboutNieReply, builtinReply, DECLINE_EDIT, DECLINE_EDIT_AGAIN, DECLINE_WRITE, DECLINE_WRITE_AGAIN, libraryMissReply, libraryReply } from './builtin.js';
import { guardReply, LEFT_OUT_NOTICE } from './guard.js';
import { avoidBlock, isFiller, refine, shapeFor, similarity, splitSentencesLite } from './variety.js';
import { isReaction, namingNote, opinionNote, replyContext } from './replyto.js';
import { feelingNote, holdSmallTalk, isLowMood, isSmallTalk, smallTalkFallback, smallTalkNote } from './smalltalk.js';
import { applyReading, readingNote, rulesReading, understandMessage } from './understand.js';
import { describeReading, describeSending, isLookupQuestion, search as searchText } from '../reading/context.js';
import { makeOverview, projectNotesCache, readThrough, sectionKey } from '../reading/notes.js';
import { styleProfile } from '../reading/style.js';
import { ideaSuggestions, nextSuggestions, STARTER } from './suggestions.js';
import { ASKS_FOR_IDEAS, WANTS_MORE } from '../brainstorm/commands.js';
import { KIND_IDS, LENSES, LENSES_BY_KIND, detectKind, detectLens, kindLabel } from '../brainstorm/lenses.js';
import { composeDevelopReply, composeIdeaReply, generateIdeas, leadNoun, markShown, parseIdeas, resolveKind } from '../brainstorm/ideas.js';
import { clip, estimateTokens, fnv1a, words } from '../util/text.js';
import defaultAgent from '../agent/index.js';
import { detectProject } from '../agent/detect.js';
import { grasp as agentGrasp } from '../agent/sheet.js';
import { filledIds, stemList, stemSet } from '../agent/state.js';
import { isSuggestion } from '../agent/ask.js';
import { parseKeepCommand } from '../agent/talk.js';
import { clearTokenMemo, describeMind, mindOf, recall, rememberStatements } from '../mind/index.js';
import { analyseText, analysisKey, clearGroundingCache, editorialEvidence, findThirdPerson, groundNames, measuredAnswer, readbackFrame } from '../editor/index.js';
import { profileCorpus } from '../profile/profile.js';
import { AIError } from '../ai/openai-client.js';
import { explicitWebAsk, joinFollowUp, looksFactual, needsContext, previousWebQuery, queryProblem } from '../web/ask.js';
import { buildSources, resultsOnly, verifyAnswer, webMessages } from '../web/answer.js';
import { isBuiltin, isLocal } from '../web/providers.js';
import { definitionalAnswer, definitionSubject } from '../encyclopedia/define.js';
import { absentReply, focusSources, supportCheck, tidyReply } from '../encyclopedia/grounding.js';

export { STARTER };

// A general question about craft, style, usage, a form/genre or a work (as opposed to talk about the writer's own story).
const GENERAL_Q = /^\s*(?:what(?:'s|\s+is|\s+are|\s+does|\s+do)\b|how\s+(?:do|should|can|would|does)\s+(?:i|you|one|we|a|an|the)\b|how\s+(?:to|is|are)\b|who\s+(?:wrote|is|was|are|were|invented|coined)\b|which\s+(?:is|one|style|form|genre|guide)\b|when\s+(?:do|should|is|does)\b|(?:explain|define|describe|tell\s+me\s+about)\b|(?:is|are)\s+it\b|difference\s+between|should\s+i\s+(?:use|capitali[sz]e|italici[sz]e|hyphenate|spell|write|format|cite)\b)/i;
const STORY_TALK = /\b(?:my|our|his|her|their|the)\s+(?:story|novel|characters?|protagonist|antagonist|villain|hero|heroine|plot|scene|chapter|draft|ending|opening|twist|narrator|manuscript)\b|\b(?:he|she|him|they|them)\b/i;
const LIBRARY_NOTE = "These notes come from NIE's built-in library, NIE's own reference; they are not something the writer wrote or sent. Speak as NIE in the first person (\"my library\", \"I\"), and never say \"the notes you provided\" or talk about NIE in the third person. When the notes cover the question, answer from them in your own plain words, as one person talking to another, and, only when a note names a style guide, edition or source, say which; mention when practice varies. Use only the names, titles, dates and numbers that are in the notes: give no example, work or author of your own. Never invent citations, section numbers, titles, dates or quotations. If you have already said something earlier in this conversation, go on to what is new instead of repeating it. If the notes do not cover the question, say so plainly."
const LIBRARY_MISS_NOTE = "NIE's built-in library has nothing on this question. Answer only if you are confident, say clearly when you are not sure, and never invent citations, section numbers, titles, dates or quotations.";
const RANK = { none: 0, weak: 1, strong: 2 };
/** "yes", "no", "ok", "maybe": a reply, not a question, so it is never looked up in the library ("yes" found "yes-but"). */
/** A turn that only acknowledges and asks needs a sentence or two, not 700 tokens: the model is held to that (the writer waits for every token on a CPU). */
const SHORT_TURN_TOKENS = 200;
// Said before the first few sparks when the writer has nothing yet: a person first, a list second.
const FROM_NOTHING = [
  "You don't have to know yet. Here are a few starting points to react to; take whichever pulls at you, even if it's only to say no to it.",
  "Nobody knows what they're writing before they start. These are only things to push against.",
  "No pressure to have it figured out. A few sparks to react to, and we'll go from whatever catches.",
];
const LOW_LEADS = [
  "That's a frustrating place to be, and every writer lands there. Let's make it smaller.",
  'Stuck is miserable. We can take it one small piece at a time.',
  "That's a hard spot. You don't have to solve all of it today.",
];
const pickLine = (list, seed) => list[parseInt(fnv1a(String(seed)), 16) % list.length];
const REFLECT_RETRY_NOTES = {
  invented: 'Your last try stated things about their story that they never said. The only facts about their story are the ones in their own words above. Answer again in at most three short sentences: first respond to what they just said, using only their words; then ONE suggestion that begins with "What if", "You could", "Maybe" or "One angle:", so it is clearly your idea and not something already in their story.',
  question: 'Your last try was a question, and this turn asks none. Answer again in at most three short sentences: first respond to what they just said, using their words; then ONE suggestion that begins with "What if", "You could", "Maybe" or "One angle:". Do not end on a question.',
};
const STORY_NOTE_KINDS = new Set(['technique', 'structure', 'genre', 'form', 'movement']);
const STORY_NOTE_MIN_SCORE = 12;
const STORY_NOTE_MIN_COVERAGE = 0.4;
/**
 * The built-in replies of the older design end in a list of questions ("A few things would help me: - ...? - ...?"). The idea agent asks ONE, now and then, so under its
 * plan those lists go (with the line that introduced them); what is left is the part of the reply that says something.
 */
export function withoutQuestionLists(text) {
  const lines = String(text ?? '').split('\n');
  const isItem = (l) => /^\s*(?:[-*\u2022]|\d+[.)])\s/.test(l);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (isItem(l) && l.includes('?')) {
      // the question goes; what the item also says ("...? Letting the reader know first gives you dramatic irony.") stays, as a plain line
      const rest = splitSentencesLite(l.replace(/^\s*(?:[-*\u2022]|\d+[.)])\s+/, '')).filter((x) => !/\?["')\]]*\s*$/.test(x)).join(' ').trim();
      if (words(rest).length >= 4) out.push(rest);
      continue;
    }
    if (/:\s*$/.test(l) && !isItem(l)) {
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      const next = lines[j];
      if (next !== undefined && isItem(next) && next.includes('?')) continue; // the intro of a list of questions
    }
    out.push(l);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
/**
 * Hold a model's reply to the agent's plan. `enforce` handles the questions it can remove whole; a turn that must NOT ask (the writer told NIE something and it is not time
 * to ask) can still come back as a question in one short sentence ("...but what secrets does she carry?"), which `enforce` cannot cut without leaving nothing. Then the question
 * sentences go, and if too little is left NIE's own acknowledgement of what was recorded stands in for the reply. Measured on the real model: without this every turn asked.
 */
/**
 * "You mentioned ...", "what you're saying is ...": a sentence that credits the WRITER with something. Kept only when the words of the sentence are the writer's own (they did say it); when they are NIE's (its own
 * twist, "the second twist you mentioned"), the sentence puts NIE's idea in the writer's mouth and goes. Measured on the real model: "The second twist you mentioned ... a hidden artifact with mind-control powers".
 */
const CREDITS_WRITER = /\b(?:you(?:'ve| have)?\s+(?:also\s+)?(?:said|mention(?:ed)?|noted|told me|describ(?:e|ed)|listed|suggested|wrote|brought up|state[ds]?)|what you(?:'re| are) saying|as you(?:'ve| have)?\s+(?:said|mentioned|noted|told me|described))\b/i;
// The prompt's own labels said back to the writer ("From the notes, it seems you're exploring writing techniques").
const LEAKS_NOTES = /\b(?:from|in|per|according to|based on|using) the (?:reference |library |idea )?notes\b|\breference notes\b|\bthe notes (?:say|suggest|show|mention)\b|\bwhat you understand so far\b/i;
// A name coined for them, ready to use ("how about naming it \"Port Luminaire\"?"): NIE gives directions a name could take, not the name.
const COINED_NAME = /\b(?:call(?:ing)?|nam(?:e|ing)|titl(?:e|ing)|label(?:l?ing)?)\s+(?:it|them|her|him|the \w+|this)\s+["“][^"”]{2,40}["”]|\bhow about\s+["“][^"”]{2,40}["”]/i;
const IN_YOUR_WORDS = /^\s*(?:in|from) your (?:description|message|note|premise|summary|text|words)[,:]?\s*/i;
function withoutFillerAndCredit(out, writerTexts, { said = '', recent = [], maxSentences = 0 } = {}) {
  out = out.replace(/\(\s*(?:you might ask|question|for example)\s*:\s*/gi, '').replace(/^\s*\((?=[^)]*$)/, ''); // "(You might ask: ...": a coaching aside, with its bracket left open
  const parts = splitSentencesLite(out);
  if (parts.length < 2) return out;
  const known = new Set(writerTexts.flatMap((t) => stemList(String(t ?? ''))));
  const own = (x) => {
    const mine = [...new Set(stemList(x))];
    return !mine.length || mine.filter((m) => known.has(m)).length / mine.length >= 0.6;
  };
  const isQ = (x) => /\?["')\]]*\s*$/.test(x);
  // NIE saying again what it said in its last few replies (measured: "What if Marta's biggest wish is to heal ..." three turns running), or asking the writer back the very question they just asked
  const again = (x) => words(x).length >= 5 && recent.some((r) => similarity(x, r) >= 0.7);
  const saidStems = new Set(stemList(String(said ?? '')));
  const sayingItBack = (x) => {
    if (isQ(x) || !CREDITS_WRITER.test(x) || !saidStems.size) return false;
    // (what is credited, without the "In your description, you mention": "You mentioned the keeper forges tide tables." right after they said so)
    const mine = [...new Set(stemList(x.replace(IN_YOUR_WORDS, '').replace(CREDITS_WRITER, '')))];
    return mine.length > 0 && mine.filter((m) => saidStems.has(m)).length / mine.length >= 0.6;
  };
  const echo = (x) => (isQ(x) && said && similarity(x, said) >= 0.6) || sayingItBack(x);
  // (only statements credit the writer: the planned question "What would you call this when you describe it to a friend: a novel, a play, a song, a column?" says "you describe" and asks about nothing they said)
  let kept = parts.filter((x) => !isFiller(x) && !LEAKS_NOTES.test(x) && !COINED_NAME.test(x) && !(!isQ(x) && CREDITS_WRITER.test(x) && !own(x)) && !again(x) && !echo(x));
  if (maxSentences && kept.length > maxSentences) kept = kept.slice(0, maxSentences); // (a reply to a short reaction is short)
  const joined = kept.join(' ').trim();
  return kept.length < parts.length && words(joined).length >= 6 ? joined : out;
}
export function holdToPlan(text, plan, agentTurn, said = '', writerTexts = [], { recent = [], maxSentences = 0 } = {}) {
  let out = agentTurn.enforce(text);
  out = withoutFillerAndCredit(out, [said, ...writerTexts], { said, recent, maxSentences });
  if (plan?.act === 'ask' && said) {
    // A model often opens by saying the writer's own sentence back to them; before a question that is only an echo, so it goes and the question stands.
    const sentences = splitSentencesLite(out);
    const kept = sentences.filter((x) => /\?["')\]]*\s*$/.test(x) || similarity(x, said) < 0.7);
    if (kept.length < sentences.length && kept.some((x) => /\?["')\]]*\s*$/.test(x))) out = kept.join(' ').trim();
  }
  if (plan?.act === 'ask' || plan?.act === 'reflect') {
    // What is not a question is either a SUGGESTION (NIE's own idea, said as one: "What if...", "You could...") or a comment on what the writer said. A comment must stay with their
    // words (measured on the real model: asked to react without adding anything, a 3B model wrote lines of story the writer never wrote), so a comment sentence that brings in
    // imagery of its own is cut, one sentence at a time. A suggestion may bring new things, because it says it is NIE's idea; one that quotes a line of dialogue is cut.
    // A turn left with nothing says what it recorded instead.
    const sentences = splitSentencesLite(out);
    const isQ = (x) => /\?["')\]]*\s*$/.test(x) && !isSuggestion(x);
    const ok = (x) => isQ(x) || (isSuggestion(x) ? !/["“][^"”]{12,}["”]/.test(x) : !agentTurn.grounded || agentTurn.grounded(x));
    const kept = sentences.filter(ok);
    if (kept.length < sentences.length) {
      const questions = kept.filter(isQ).join(' ').trim();
      const rest = kept.filter((x) => !isQ(x)).join(' ').trim();
      out = plan.act === 'ask' ? [rest, questions].filter(Boolean).join(' ') : rest;
      if (!out) out = agentTurn.ack || '';
      if (plan.act === 'ask') out = agentTurn.enforce(out);
    }
  }
  if (plan?.act === 'ask' && !/^\s*(?:\d{1,2}[.)]|[-*•])\s/m.test(out)) {
    // An ask turn asks ONE thing, and it is the planned one at the end: a question the model asked mid-paragraph ("What is her name?") is not removable by `enforce`, so it goes here.
    const parts = splitSentencesLite(out);
    const qs = parts.filter((x) => /\?["')\]]*\s*$/.test(x) && !isSuggestion(x));
    if (qs.length > 1) out = parts.filter((x) => !qs.includes(x) || x === qs.at(-1)).join(' ').trim();
  }
  if (plan?.act === 'serve' && !/^\s*(?:\d{1,2}[.)]|[-*•])\s/m.test(out)) {
    // An answer asks at most one thing (the prompt says so; a 3B model still stacks three): all but the last question sentence go.
    const parts = splitSentencesLite(out);
    const qs = parts.filter((x) => /\?["')\]]*\s*$/.test(x) && !isSuggestion(x));
    if (qs.length > 1) {
      const keep = qs.at(-1);
      const trimmed = parts.filter((x) => !qs.includes(x) || x === keep).join(' ').trim();
      if (words(trimmed).length >= 6) out = trimmed;
    }
  }
  if (plan?.act === 'reflect') {
    // (a turn that does not ask keeps its suggestion and drops any real question)
    const isQ = (x) => /\?["')\]]*\s*$/.test(x) && !isSuggestion(x);
    if (splitSentencesLite(out).some(isQ)) {
      const kept = splitSentencesLite(out).filter((x) => !isQ(x)).join(' ').trim();
      out = words(kept).length >= 4 ? kept : agentTurn.ack || kept || out;
    }
  }
  // The same sentence twice (measured: "What if you had never written about this: what would stay unsaid?" printed two times when the model's copy of the planned question met the planned question): the last one stays.
  const finalParts = splitSentencesLite(out);
  if (finalParts.length > 1) {
    const unique = finalParts.filter((x, i) => !finalParts.slice(i + 1).some((y) => similarity(x, y) >= 0.85));
    if (unique.length < finalParts.length) out = unique.join(' ').trim();
  }
  return out || text;
}
/**
 * A reply cut off by the length limit loses its unfinished last sentence rather than showing half of it. Only a reply that came close to the limit can have been cut off
 * (`maxTokens`): a short reply that ends on a list item or a heading was finished.
 */
export function finishedSentences(text, maxTokens = 0) {
  const t = String(text ?? '').trimEnd();
  if (!t || /[.!?…"”’)\]*_]$/.test(t)) return t;
  if (maxTokens && estimateTokens(t) < maxTokens * 0.85) return t;
  const cut = Math.max(t.lastIndexOf('. '), t.lastIndexOf('? '), t.lastIndexOf('! '), t.lastIndexOf('.\n'), t.lastIndexOf('?\n'), t.lastIndexOf('!\n'));
  return cut > 20 ? t.slice(0, cut + 1) : t;
}
/** "What do you remember about my project?", "what have I told you?": answered from what is really held, not by the model. */
const MIND_QUESTION = /\bwhat\s+(?:do|did|have|can|could)\s+you\s+(?:still\s+)?(?:remember|recall|hold|keep)\b|\bwhat\s+do\s+you\s+(?:know|have)\s+(?:so far\s+)?about\s+(?:my|this|our)\s+(?:story|project|idea|book|novel|script|world|plot|characters?)\b|\bwhat\s+(?:have|did)\s+i\s+(?:told|tell|said|say|given|give|shared)\s+you\b|\b(?:recap|summari[sz]e)\s+(?:everything|all|what)\s+(?:we|i|you)\b|\bdo\s+you\s+(?:still\s+)?(?:remember|recall|know)\s+(?:what|anything|everything|my|the)\b[^?]{0,40}\b(?:story|project|idea|book|novel|script|plot|characters?|about)\b|\b(?:remind me|tell me)\s+what\s+(?:my|the|i|we)\s+(?:story|project|idea|book|novel|script|plot)\b|\bwhat(?:'s| is)\s+my\s+(?:story|project|idea|book|novel|script|plot)\s+about\b/i;
/** Words that make even a "who/what..." question one about what the program has counted (the cast, the pacing, the voice, consistency, the writer's rules). */
const ASKS_FOR_COUNTS = /\b(?:pac(?:e|es|ing)|rhythm|characters?|cast|protagonists?|consisten\w*|contradict\w*|continuity|timelines?|tense|pov|point of view|voice|repeat\w*|overus\w*|rules?)\b/i;
/** How well a recalled passage of the writer's must match a message for it to be about their project (measured: its questions score 0.79 and up, general craft questions find nothing). */
const OWN_PROJECT_RECALL = 0.6;
/** A turn that only acknowledges and asks already carries the idea sheet in the agent's brief; a turn that answers a question does not, and the sheet's labelled parts ("Tone and feel: ...") are where such a question is answered. */
const asksOrReflects = (agentTurn) => ['ask', 'reflect'].includes(agentTurn?.plan?.act);
/** A question about what the writer themselves said or gave NIE earlier. */
const REFERS_BACK = /\b(?:did|do|have|had)\s+I\s+(?:say|said|tell|told|mention|mentioned|give|gave|want|wanted|ask|asked)\b|\bI\s+(?:said|told you|mentioned|gave you|asked for)\b|\bwhat\s+I\s+(?:said|told|gave|wanted|mentioned)\b|\bI\s+gave\s+you\b/i;
const UNGROUNDED_LIBRARY_NOTE = "My offline model answered, but everything it said named something I could not find in my library, so I've left it out. Here is what the library itself says.";
const LEFT_OUT_LIBRARY = "(I left out part of that reply because it named something I couldn't find in my library.)";
/** The words of the library records a reply may draw names, titles, dates and numbers from. */
const recordText = (e) => [e.name, ...(e.aka ?? []), e.summary, ...(e.conventions ?? []), ...(e.watchFor ?? []), ...(e.deliberateWhen ?? []), e.example ?? '', e.author ?? '', e.year ?? '', e.guide ?? '', e.asOf ?? '', e.region ?? '', e.language ?? '', e.scope ?? '', ...(e.questions ?? []), ...(e.works ?? []).map((w) => `${w.title} ${w.author} ${w.year ?? ''}`), ...(e.refs ?? [])].join('\n'); // (everything the model is shown: an edition year in `asOf` or a work's `year` is a date a correct reply may state)
/**
 * A direct question about the subject itself: one short sentence, nothing about the writer's own story, no second clause and no request about the shape of the answer ("in two
 * sentences"). Only such a question is answered by the library's own text; anything else goes to the model, which is shown the same records and the whole message.
 */
const NOT_A_DIRECT_ASK = /\b(?:my|mine|our|i|i'm|i'd|i've|i'll|should|would|could|briefly|short(?:ly)?|summar\w*|nutshell|tl;?dr|simple terms|eli5|bullets?|in (?:one|two|three|four|a few|\d+)(?: or (?:two|three|four))? (?:short )?(?:sentences?|lines?|words?|paragraphs?)|and (?:how|why|would|could|should|can))\b/i;
const FACTUAL_QUESTION = /^\s*(?:and\s+)?(?:what|who|which|when|where|how)\b[^?]*\b(?:is|are|was|were|does|do|did)\b/i;
const ASKS_FOR_A_THING = /\b(?:some|any|good|best|better|ideas?|suggest\w*|examples?|give|help|make|write|improve|avoid|use|can|could|might)\b/i;
const WORK_ASK = /\b(?:who wrote|wrote|written by|author|published|publication|when was)\b/i;
function directLibraryAsk(text) {
  const t = String(text ?? '').trim();
  return Boolean(t) && words(t).length <= 16 && !NOT_A_DIRECT_ASK.test(t) && !/[.!?]\s+\S/.test(t.replace(/\b(?:e\.g|i\.e|vs|approx|c|ca)\./gi, ''));
}
/** True when the message uses a content word the writer used in one of their last few messages that were not library questions: "What does the aunt hide?" after "her aunt's house" is about their story. */
function echoesRecentStory(text, past) {
  const earlier = past.filter((m) => m.role === 'user' && m.intent !== 'library-question' && !m.compacted).slice(-3);
  if (!earlier.length) return false;
  const plain = (t) => String(t).replace(/['\u2019]s\b/gi, ''); // ("aunt's" is the aunt)
  const mine = stemSet(plain(text));
  return earlier.some((m) => [...stemSet(plain(m.content.slice(0, 800)))].some((st) => mine.has(st)));
}
const UNGROUNDED_NOTE = "My offline model answered, but everything it said named something I could not find in your text, so I've left it out. Here is built-in guidance instead.";
const LEFT_OUT_UNBACKED = "(I left out part of that reply because the articles don't back it up.)";
const LEFT_OUT_WEB = "(I left out part of that reply because it named something the sources don't hold.)";
const LEFT_OUT_UNGROUNDED = "(I left out part of that reply because it named something I couldn't find in your text.)";
const BARE_REPLY = /^\W*(?:yes|yeah|yep|yup|sure|ok|okay|no|nope|nah|maybe|perhaps|please|thanks|thank you|right|true|false|hm+|um+)\W*$/i;
const OWN_PROJECT = /\b(?:my|our)\s+(?:story|stories|novel|novella|manuscript|draft|screenplay|script|poem|essay|article|book|memoir|characters?|protagonist|antagonist|villain|hero|heroine|plot|scene|chapter|ending|opening|narrator)\b/i;
/** A message longer than this (about 1,000 tokens) is a pasted text, not a sentence to answer: it is read in sections instead of cut off. */
export const LONG_MESSAGE_CHARS = 3600;
const STORY_TEXT_MIN_CHARS = 400;
const ASK_WORDS = /\?|\bplease\b|\b(?:can|could|would)\s+you\b|\bwhat\b|\bhow\b|\bwhy\b|\bthoughts?\b|\bthink\b|\bfeedback\b|\bhere(?:'s| is| are)\b|\bbelow\b|:\s*$/i;
const PASTED_NO_ASK = "(The writer pasted a text and did not say what they want from it. This line is not the writer's wording.)";
/** A text this long (in sections of about 2,200 characters, so about 22,000 words) is not read through section by section: it is searched instead, as before. */
export const MAX_NOTE_SECTIONS = 60;
const COLD_NOTE_MS = 240000;
const WARM_NOTE_MS = 150000;
/** Asking about the whole text, not one fact in it: reading every section first is worth the wait. */
const WHOLE_HINTS = /\b(?:summar\w+|overall|big picture|whole|entire|throughout|structure[ds]?|pacing|paced|consisten\w+|contradict\w*|conflict\w*|inconsisten\w*|timeline|chronolog\w*|theme\w*|style|voice|tone|register|arc|plot holes?|what(?:'s| is) (?:my|the|this) (?:story|text|piece|draft|bible|world|book) (?:about|like)|understand\w*|feedback|thoughts?|make of)\b/i;
/** Words that point at the writer's own text even when no one says "my story": "this bible", "in the text", "what I pasted". */
const ABOUT_TEXT_MARKERS = /\b(?:this|the|my|our|that)\s+(?:bible|text|draft|manuscript|document|piece|chapter|outline|story|novel|book|script|essay|passage|world|timeline|notes|memo)\b|\bin\s+(?:the|my|this)\s+(?:text|draft|story|bible|book|chapter|document)\b|\bwhat\s+i\s+(?:pasted|shared|wrote|sent)\b|\byou\s+(?:just\s+)?read\b/i;
/** A question whose own words are found strongly in the writer's long text is about that text (BM25 over its sections), whatever it is called. */
const TEXT_MATCH_SCORE = 4.5;
/** One retry of a reply that repeats itself (the same opener, the same questions) costs another answer's time, so it is spent only when the repeat is clear. */
const VARIETY_RETRY = true;
/** Which of the writer's own words is the ask, and which is the pasted text? A short first or last paragraph around a long body is the ask. */
export function splitPaste(text) {
  const paras = String(text).split(/\n[ \t]*\n/).map((p) => p.trim()).filter(Boolean);
  let lead = '';
  let trail = '';
  if (paras.length >= 3) {
    if (paras[0].length <= 400 && ASK_WORDS.test(paras[0])) lead = paras.shift();
    if (paras.length >= 2 && paras.at(-1).length <= 400 && ASK_WORDS.test(paras.at(-1))) trail = paras.pop();
    return { ask: [lead, trail].filter(Boolean).join(' '), body: paras.join('\n\n') };
  }
  return { ask: '', body: String(text) };
}
/**
 * Only the most recent long paste is kept in full (follow-up questions are about it). An older one keeps its start and says so, because every
 * message is stored with the project and storage is limited: several 100,000-character pastes would otherwise fill it, silently losing the project.
 */
export function compactOldPastes(messages) {
  for (const m of messages.slice(0, -1)) {
    if (m.role !== 'user' || m.compacted || m.content.length <= LONG_MESSAGE_CHARS) continue;
    m.content = `${m.content.slice(0, 1200).trimEnd()}… [a pasted text of about ${words(m.content).length.toLocaleString('en-US')} words; only its start is kept once a newer paste arrives]`;
    m.compacted = true;
  }
}
/**
 * What does a message with a long pasted text in it mean? Only the writer's OWN words (its short first or last paragraph) are read by the rules: a
 * chapter is full of dialogue like "Can you fix the lamp?" or "Open the memory", which must never be mistaken for a request to NIE.
 */
function pasteIntent(paste, ctx) {
  const base = paste.ask ? detectIntent(paste.ask, ctx) : null;
  const decided = base && !['remember', 'recall', 'develop-idea', 'empty', 'greeting', 'discuss', 'share-premise', 'direction-change', 'start-from-zero'].includes(base.type);
  const intent = decided ? base : { type: 'share-passage', secondary: [], confidence: 0.5, signals: ['pasted text'], mode: ctx.mode, direction: { changed: false }, topics: [] };
  intent.premiseCues = extractPremiseCues(paste.body.slice(0, 6000));
  return intent;
}
const MENTIONS_OWN_TEXT = /\b(?:my|our)\s+(?:story|novel|manuscript|draft|book|screenplay|script|poem|essay|article|piece|chapters?|ending|opening|middle|scene|characters?|protagonist|villain)\b/i;

/** The compact record kept on the reply: what was shown of a long text. */
const summarizeRead = (r) => ({ complete: r.complete, sections: r.sections, words: r.words, subject: r.subject, shown: r.shown.map((x) => x.i + 1), ...(r.notes ? { notes: { read: r.notes.modelRead, of: r.notes.total, listed: r.notes.listed } } : {}) });

const isShortQuestion = (t) => /\?\s*$/.test(String(t).trim()) && words(t).length <= 25;
/** Which questions are about the whole text (worth reading all of it first) and which ask for one fact in it (answered from the closest passages). */
export function wantsWholeText({ query = '', reading = null } = {}) {
  if (WHOLE_HINTS.test(query)) return true;
  if (reading?.task === 'feedback' || reading?.task === 'develop') return true;
  return !isLookupQuestion(query);
}
const NO_MODEL = { chat: async () => ({ text: null, route: 'builtin' }) };
/**
 * What NIE tells the writer about what it looked at (and, for an online model, what left the computer). It is kept on the message and shown under the
 * reply, not written into it: pasted at the end of every reply it made each reply end the same way.
 */
const lookedAt = (read, route) => [read && !read.complete ? describeReading(read) : '', describeSending(read, route)].filter(Boolean).join(' ');
/** What is kept on the reply about how it was made (small, for the writer's panel and for tests). */
const varietyRecord = (shape, got) => ({ ...(shape ? { shape: shape.id } : {}), ...(got?.polished?.rf?.dropped?.length || got?.retried ? { variety: { dropped: (got.polished?.rf?.dropped ?? []).map((d) => d.kind), retried: Boolean(got.retried) } } : {}) });
/** What NIE drew on from earlier in the project, kept on the reply so the writer can see it: their own words and where each came from. */
const recalledRecord = (r) => r.items.map((i) => ({ where: i.where, text: clip(i.text, 160) }));
const retryNote = (rf, text) => `Your first attempt at this reply repeated how you have been replying (${rf.reasons.join('; ') || 'the same opening and questions'}). Write it again from scratch, differently: do not begin the way that attempt began ("${clip(String(text).split(/(?<=[.!?])\s+/)[0] ?? '', 90)}"), do not praise, and do not end with a question you have asked before.`;

/** After this many model readings in a row fail, stop asking for a few messages (the rules read them) so a broken model never doubles the wait. */
const READING_FAILURES_BEFORE_PAUSE = 2;
const READING_PAUSE_MESSAGES = 5;
// The first reading after the model starts also has to load and warm it (a freshly downloaded model on an ordinary PC took longer than 25 s on a
// Windows runner, so every first message was read by the rules); once one reading has worked, a stalled one is given up on quickly.
const COLD_READING_MS = 100000;
const WARM_READING_MS = 25000;

/** Why the offline model could not answer, in words a writer can act on. */
export function describeModelFailure(err) {
  const msg = String(err?.message ?? err ?? '');
  if (err?.kind === 'timeout') return 'it took too long to answer';
  if (/context|too long|exceed|token/i.test(msg) || err?.status === 400) return 'what I was sent was too long for the offline model to read in one go';
  if (err?.kind === 'network') return 'it stopped responding';
  if (err?.kind === 'bad-response') return 'it sent back something I could not use';
  return `it ran into a problem${msg ? ` (${msg.replace(/\s+/g, ' ').slice(0, 120)})` : ''}`;
}
const modelFailedNote = (err) => `My offline model is running, but I couldn't get an answer from it this time: ${describeModelFailure(err)}. Here is built-in guidance instead.`;
/** Said only when the WRITER's own words (not NIE's notes) were cut to fit the model's window. */
const shortenedNote = (trimmed = []) => (trimmed.includes('your message') ? "(Your message was longer than I can read at once, so I used only the first part of it.)" : trimmed.includes('your passage') ? '(I could only fit part of your passage into what I read this time.)' : '');
const WITHHELD_NOTE = "My offline model did answer, but its answer included wording it had composed for your text, and NIE never writes or edits your text, so I've left it out. Here is built-in guidance instead.";

/**
 * NIE's orchestrator: one identity, regardless of what answers underneath.
 *
 *   Brainstorm: an idea partner for any literary project (stories, characters, worlds, articles, essays, poems, scripts).
 *               It offers concepts, angles, complications and questions. It never drafts or edits the writer's text.
 *   Full Scan:  finds where the text breaks the writer's rules and why. Never proposes replacement text.
 *
 * Everything here reads only the project passed in, so one project can never leak into another.
 */
export class Orchestrator {
  #readFailures = 0;
  #readPause = 0;
  #readWarm = false;
  #styles = new Map();
  #extractFailures = 0;
  #extractPause = 0;
  #analyses = new Map();

  /**
   * @param {{ engine: import('../ai/engine.js').AIEngine, readNotes?: boolean, variety?: 'full'|'prompt'|'legacy', agent?: object|null }} o
   *   `readNotes: false` and `variety` exist so scripts/notes-lab.mjs can measure each new layer against the one before on the real model:
   *   'legacy' = the earlier prompt wording and nothing else; 'prompt' = the new wording; 'full' (the app) = + a different shape each turn, what not to repeat, and cleaning.
   *   `agent: null` turns the idea agent off (agent/: the sheet of the writer's own words, the paced questions, the offer to keep an idea), for the lab's A/B runs.
   *   `mind: false` stops NIE recalling what the writer said earlier (mind/), `editor: false` stops the measured facts about a long text (editor/): both only for A/B runs.
   */
  constructor({ engine, readNotes = true, variety = 'full', agent = defaultAgent, mind = true, editor = true, trace = null, web = null }) {
    this.engine = engine;
    this.web = web; // the one door to the web (engine/web/service.js); null where there is none. Off unless the writer turned it on in Settings.
    this.trace = trace; // (an array, only for the labs: what the model first said on a steered turn, and what it was held to)
    this.readNotes = readNotes;
    this.variety = variety;
    this.agent = agent;
    this.mind = mind;
    this.editor = editor;
  }

  /** The project is being left: nothing computed from its text or words is kept for the next one (the caches are keyed by content, so this is belt and braces). */
  reset() {
    this.#styles.clear();
    this.#analyses.clear();
    clearGroundingCache();
    clearTokenMemo();
  }

  /** The measured facts about a long text (cast, pacing, voice, figures, the writer's rules...), computed once per text and kept for a few turns. Null if anything goes wrong: they are an extra. */
  #analysisFor(text, notes, project) {
    try {
      const per = notes?.per ?? null;
      const key = analysisKey({ text, notes: per, project });
      let a = this.#analyses.get(key);
      if (!a) {
        a = analyseText({ text, index: indexFor(text), notes: per, project });
        this.#analyses.set(key, a);
        if (this.#analyses.size > 3) this.#analyses.delete(this.#analyses.keys().next().value);
      }
      return a;
    } catch {
      return null;
    }
  }

  /** Which message of the project this is, counted by the writer's messages (so "3 messages ago" counts messages, not only the ones that told NIE something). */
  #turnOf(project) {
    return Math.max(mindOf(project).turn, project.conversation.messages.filter((m) => m.role === 'user').length);
  }

  /** What NIE can recall of this project for this message, or null. Called BEFORE the message itself is remembered (so it can never recall itself). */
  #recallFor(project, text, reading, { limit = 5, budgetTokens = 360, agentTurn = null } = {}) {
    if (!this.mind || !text) return null;
    try {
      const r = recall(project, [text, reading?.topic].filter(Boolean).join(' '), { limit, budgetTokens, includeSheet: !asksOrReflects(agentTurn), excludeText: text, turn: this.#turnOf(project) });
      return r.items.length ? r : null;
    } catch {
      return null; // the mind is an extra: it never gets in the way of a reply
    }
  }

  /** Keep what the writer just told NIE (their own words) for the life of this project. */
  #remember(project, text, kind = 'told') {
    if (!this.mind) return;
    try {
      rememberStatements(project, text, { kind, turn: this.#turnOf(project) });
    } catch {
      /* an extra */
    }
  }

  /** "What do you remember?": the real count and the newest, most deliberate things, in the writer's own words. */
  #memoryReply(project) {
    const d = describeMind(project, { turn: this.#turnOf(project) }); // (the writer's message numbers, so "in your last message" is the one before this question)
    // A part of the idea sheet that only repeats a statement of the writer's ("Main character: girl" next to "I am writing about a girl who can hear the dead") is listed once, as the statement.
    const norm = (t) => String(t ?? '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
    const said = d.items.filter((i) => i.source === 'said').map((i) => norm(i.text));
    const repeats = (i) => (i.source === 'sheet' && said.some((t) => t.includes(norm(String(i.text).replace(/^[^:]*:\s*/, ''))))) || (i.source === 'premise' && (/^In your premise,/i.test(i.text) || said.some((t) => t.length > 20 && norm(i.text).includes(t))));
    const pick = d.items.filter((i) => ['said', 'kept', 'character', 'theme', 'premise', 'rule', 'deliberate', 'sheet'].includes(i.source) && !i.by && !repeats(i)).slice(0, 8);
    return [
      pick.length ? `Here is what I have so far, in your own words:\n${pick.map((i) => `• ${clip(i.text, 140)} (${i.where})`).join('\n')}` : '',
      d.summary,
      'All of it is listed under "Everything NIE holds" next to the chat, where you can look through it and remove what you like. It belongs to this project only: no other project can see it.',
    ].filter(Boolean).join('\n\n');
  }

  /**
   * The model call the agent may use to read an idea into its sheet (schema-constrained JSON, purpose 'extract'). Null when no model is running or when
   * it keeps failing: then the rules read the idea instead, and the sheet only ever holds the writer's own words either way.
   */
  #extractChat() {
    if ((this.engine.route?.() ?? 'builtin') === 'builtin') return null;
    if (this.#extractPause > 0) {
      this.#extractPause--;
      return null;
    }
    const failed = () => {
      if (++this.#extractFailures >= 2) {
        this.#extractPause = 5;
        this.#extractFailures = 1;
      }
    };
    return async (messages, opts) => {
      try {
        const r = await this.engine.chat(messages, opts);
        if (r?.text) this.#extractFailures = 0;
        else failed();
        return r;
      } catch (err) {
        if (err?.kind === 'abort') throw err;
        failed();
        return null;
      }
    };
  }

  /** What the offline library says about the form and genres in play, as short lines for the agent's brief (never shown as the writer's own). */
  #libraryNotes(project, text) {
    const packs = this.agent.packs;
    const state = this.agent.state(project);
    const seen = detectProject(text, { packs });
    const ids = [seen.form ?? state.form, ...(seen.genres.length ? seen.genres : state.genres)].filter(Boolean);
    const out = [];
    for (const id of ids.slice(0, 2)) {
      const label = [...(packs.forms ?? []), ...(packs.genres ?? [])].find((a) => a.id === id)?.label;
      const entry = label ? search(label, { limit: 3 }).find((e) => e.kind === 'genre' || e.kind === 'form') : null;
      if (entry) out.push(`${entry.name}: ${clip([entry.summary, entry.conv?.[0]].filter(Boolean).join(' '), 200)}`);
    }
    return out;
  }

  /** One turn of the idea agent. It never gets in the way of a reply: if it fails (other than a Stop), the message is answered as before. */
  async #agentTurn({ project, text, reading, kindHint, signal, past }) {
    if (!this.agent) return null;
    try {
      return await this.agent.turn({
        project, message: text, reading, chat: this.#extractChat(), kindHint, signal,
        recentMessages: past.filter((m) => m.role === 'user').slice(-6).map((m) => String(m.content).slice(0, 600)),
        lastReply: past.at(-1)?.role === 'assistant' ? String(past.at(-1).content ?? '') : '',
        libraryNotes: this.#libraryNotes(project, text),
      });
    } catch (err) {
      if (err?.kind === 'abort') throw err;
      return null;
    }
  }

  /** The agent answered by itself (the offer, the writer's yes, a style command...): no model is needed or called. */
  #handled(project, intent, turn, onToken) {
    const h = turn.handled;
    intent.reading ??= rulesReading(intent, 'exact');
    if (h.kind === 'added') this.#remember(project, project.conversation.messages.at(-1)?.content ?? '', 'added'); // a detail the writer added before keeping the idea
    onToken?.(h.reply, h.reply);
    return this.#finish(project, intent, h.reply, 'builtin', false, { suggestions: h.suggestions, agent: { handled: h.kind, ...(h.committed ? { kept: true } : {}) } });
  }

  /**
   * Small talk (see smalltalk.js). The model answers from the earlier conversation and one instruction; its reply must pass `holdSmallTalk` (short, no list, at most one question,
   * nothing named that the writer never named), otherwise NIE's own line, chosen by what the writer said, stands. Nothing is recorded in the idea sheet or the project's mind.
   */
  async #smallTalk({ project, intent, text, past, onToken, signal }) {
    let reply = '';
    let route = 'builtin';
    let fallback = null;
    if ((this.engine.route?.() ?? 'builtin') !== 'builtin') {
      const composeArgs = { mode: 'brainstorm', project, interp: null, userMessage: text, document: null, history: past, retrieved: [], legacy: this.variety === 'legacy', extra: smallTalkNote({ text, project }) };
      const got = await this.#askClean({ composeArgs, history: past, known: [text, project.storyText], onToken, signal, temperature: 0.8, maxTokens: SHORT_TURN_TOKENS });
      if (got.asked.res.text) {
        reply = holdSmallTalk(got.polished.guarded.text, { project, text, past });
        route = reply ? got.asked.res.route : 'builtin';
        if (!reply) fallback = { reason: 'withheld' };
      } else if (got.asked.failure && got.asked.modelReady) fallback = { reason: 'error', detail: describeModelFailure(got.asked.failure) };
    }
    if (!reply) reply = smallTalkFallback({ text, project });
    if (route === 'builtin') onToken?.(reply, reply);
    return this.#finish(project, intent, reply, route, false, { agent: { act: 'chat' }, ...(fallback ? { fallback } : {}), suggestions: [] });
  }

  /** Chips after a reply that asked a question: an honest way out of it, and the way to keep what there is. */
  #agentChips(turn, project) {
    const plan = turn?.plan;
    if (turn?.handled?.kind === 'asked-kind') return turn.handled.suggestions; // "what are you making?" comes with its answers as chips
    const n = filledIds(this.agent.state(project)).length;
    const keep = n >= 2 ? [{ label: 'Keep this idea', text: '', send: { ask: 'Keep this idea.' } }] : [];
    if (plan?.act === 'ask') return [{ label: 'Not sure yet', text: '', send: { ask: "I'm not sure yet." } }, { label: 'Skip that one', text: '', send: { ask: 'Skip that one.' } }, { label: 'Add more details', text: 'Let me add more details: ' }, ...keep];
    return null;
  }

  /**
   * Understand the message. With a model running, the MODEL reads it (task + topic) and its reading is applied to `intent`;
   * otherwise (no model, an exact command, a bare greeting, or a model that keeps failing) the rules' reading stands.
   * Either way `intent.reading` says which, so a result never claims more understanding than it had.
   */
  async #read({ intent, text, history, signal, button = false }) {
    if (!text || button || ['remember', 'recall', 'develop-idea', 'greeting'].includes(intent.type)) return (intent.reading = rulesReading(intent, button ? 'button' : 'exact'));
    if ((this.engine.route?.() ?? 'builtin') === 'builtin') return (intent.reading = rulesReading(intent, 'no-model'));
    if (this.#readPause > 0) {
      this.#readPause--;
      return (intent.reading = rulesReading(intent, 'model-reading-paused'));
    }
    const r = await understandMessage({ engine: this.engine, text, history, signal, timeoutMs: this.#readWarm ? WARM_READING_MS : COLD_READING_MS });
    if (!r.ok) {
      if (++this.#readFailures >= READING_FAILURES_BEFORE_PAUSE) {
        this.#readPause = READING_PAUSE_MESSAGES;
        this.#readFailures = READING_FAILURES_BEFORE_PAUSE - 1; // one more failure after the pause pauses again
      }
      return (intent.reading = rulesReading(intent, 'model-reading-failed'));
    }
    this.#readFailures = 0;
    this.#readWarm = true;
    applyReading(intent, r, text);
    // "yes", "yeah exactly", "no, I don't like that direction" right after NIE spoke are replies to it. A small model reads them as "I could not tell what is being asked" (and the answer becomes a
    // question back), as small talk, or as something told; they are a conversation about what NIE just said. Recorded as overruled, like the other guards on a reading.
    const last = history.at(-1);
    if (last?.role === 'assistant' && last.agent?.act === 'chat' && words(text).length <= 6 && ['unclear', 'tell', 'develop', 'chat'].includes(intent.reading.task) && (isReaction(text, last) || /^\s*(?:yeah|yep|yes|ok(?:ay)?|sure|true|mm+|hm+|maybe|i guess|kind of|sort of|not really|no|nope)\b/i.test(text))) {
      // (after a hello, a thanks or "how are you?", "yeah" is still small talk: measured on the real model, it was taken for a comment on a story that did not exist)
      intent.reading = { ...intent.reading, overruled: intent.reading.task === 'chat' ? undefined : intent.reading.task, task: 'chat' };
      intent.type = 'greeting';
      return intent.reading;
    }
    if (['unclear', 'tell', 'chat'].includes(intent.reading.task) && last?.role === 'assistant' && isReaction(text, last)) {
      intent.reading = { ...intent.reading, overruled: intent.reading.task, task: 'develop' };
      intent.type = 'discuss';
    }
    return intent.reading;
  }

  /**
   * While a conversation about the library is open, a short factual question that names something the library holds ("what are the tropes of romance?") is a library question,
   * whatever label the model gave it. Measured on the real model, the label of exactly this kind of message flips between "craft" and "ideas" with the smallest change to the
   * prompt or to what came before it (a near-tie for a 3B model), and "ideas" turns a reference question into story cards that credit the writer with a castle they never described.
   * Narrow on purpose: the model read it as ideas, develop, unclear or chat; a library answer was given in the last few messages; it is one short factual question (no "my", no "some",
   * "best", "ideas", "should", no request about the shape of the answer); and the library has a strong answer that the question names, other than a single work.
   * The change is recorded (`understood.overruled`), as the guard against a wrong write/edit label is.
   */
  #stillALibraryQuestion({ project, intent, reading, text }) {
    if (reading?.by !== 'model' || !['ideas', 'develop', 'unclear', 'chat'].includes(reading.task)) return false;
    const thread = project.conversation.library;
    if (!thread?.subject || this.#turnOf(project) - thread.turn > MAX_AGE) return false;
    if (!FACTUAL_QUESTION.test(text) || ASKS_FOR_A_THING.test(text) || !directLibraryAsk(text)) return false;
    const a = answerFromLibrary(text);
    if (a.strength !== 'strong' || !a.nameHit || a.entries[0]?.kind === 'work') return false;
    intent.type = 'craft-question';
    intent.reading = { ...intent.reading, task: 'craft', overruled: reading.task };
    return true;
  }

  /**
   * The craft notes that go with a story conversation. Measured on the real model (and by reading what the search returned), plain word matching over thousands of records
   * puts noise next to a message about someone's story ("a lighthouse keeper forging tide tables" found Syllogism, Apposition and three citation rules; "retired surgeon" found
   * the style rules for "Dr" and "Mister"), and a 3B model then talks about whatever it is handed. So a note goes in only when it is about the craft of making a story (a technique,
   * a structure, a genre, a form, a movement), matches strongly, and covers what the message is about (a bare "hey" finds nothing that strong). The writer's declared genres and forms (their profile) still go in.
   */
  storyNotes(project, text, { limit = 2 } = {}) {
    const declared = forProfile(project.profile).slice(0, 2);
    const t = String(text ?? '').trim();
    if (!t) return declared;
    // (and the message must use a word of the note's own name: "which would you pick?" matched a note on phrasal verbs, and a reply began "From the notes, it seems you're exploring writing techniques")
    const said = new Set(stemList(t));
    const named = (e) => [e.name, ...(e.aka ?? [])].some((n) => stemList(String(n ?? '')).some((w) => said.has(w)));
    const found = searchScored(t, { limit: 6, minScore: STORY_NOTE_MIN_SCORE })
      .filter((x) => STORY_NOTE_KINDS.has(x.entry.kind) && x.headCoverage >= STORY_NOTE_MIN_COVERAGE && named(x.entry))
      .slice(0, limit)
      .map((x) => x.entry);
    return [...new Map([...declared, ...found].map((e) => [e.id, e])).values()].slice(0, limit + 2);
  }

  retrieve(project, text) {
    const declared = forProfile(project.profile);
    const wp = project.conversation.workingPremise;
    const relevant = search(`${text} ${wp?.summary ?? ''}`, { limit: 4 });
    return [...new Map([...declared, ...relevant].map((e) => [e.id, e])).values()].slice(0, 6);
  }

  /**
   * One Brainstorm turn. Mutates `project` (conversation, working premise, Idea Board); the caller persists it.
   * `kind` / `lens` come from the UI's kind picker and quick-action buttons; typed requests are understood too.
   * @returns {Promise<{ reply: string, intent: object, route: string, suggestions: object[], declined: boolean,
   *   ideas: {id:string,kind:string,lens:string,lensLabel:string,text:string}[], lead: string, tail: string, kind: string|null, lens: string|null }>}
   */
  async brainstorm({ project, message, onToken, onProgress, signal, kind: kindOpt = null, lens: lensOpt = null, web: webOn = false }) {
    const text = String(message ?? '').trim();
    project.brainstorm ??= emptyBrainstorm();
    const bs = project.brainstorm;
    const history = project.conversation.messages;
    const ctx = { project, hasHistory: history.length > 0, mode: 'brainstorm' };
    const paste = text.length > LONG_MESSAGE_CHARS ? splitPaste(text) : null;
    const askText = paste ? paste.ask : text; // what the rules and the library look at: the writer's own words, never a pasted chapter
    const intent = paste ? pasteIntent(paste, ctx) : detectIntent(text, ctx);

    const userMsg = appendMessage(project, 'user', text, { intent: intent.type });
    if (text.length > LONG_MESSAGE_CHARS) compactOldPastes(history);

    // "What do you remember about my project?" is answered from what is really held (its count and the writer's own words), never by the model: it would make it up.
    // (Before the Idea Board commands: "what do you remember" is about everything NIE holds, not only the board.)
    if (this.mind && !paste && text.length <= 240 && MIND_QUESTION.test(text)) {
      intent.reading = rulesReading(intent, 'exact');
      const reply = this.#memoryReply(project);
      onToken?.(reply, reply);
      return this.#finish(project, intent, reply, 'builtin', false, { agent: { act: 'memory' } });
    }

    // Idea Board commands are exact and need no model.
    if (intent.type === 'remember') {
      intent.reading = rulesReading(intent, 'exact');
      // "remember this" with an idea being followed keeps the whole idea (what is recorded, and what is missing); "remember: the cat can talk" is a single note
      if (!intent.memory.note || parseKeepCommand(text)) {
        const kept = await this.#agentTurn({ project, text, reading: intent.reading, kindHint: kindOpt, signal, past: history.slice(0, -1) });
        if (kept?.handled) return this.#handled(project, intent, kept, onToken);
      }
      return this.#keep(project, intent, onToken);
    }
    if (intent.type === 'recall') {
      intent.reading = rulesReading(intent, 'exact');
      const reply = boardToChat(project);
      onToken?.(reply, reply);
      return this.#finish(project, intent, reply, 'builtin', false);
    }

    // NIE does not write or edit the writer's text. Decline clearly, without calling any model. (The rules decide this first, so a
    // request they recognise never reaches a model at all.)
    const decline = () => {
      const before = history.slice(0, -1).at(-1)?.content; // (asked again right after a refusal: the second answer is not the first one pasted again)
      const reply = intent.type === 'request-edit' ? (before === DECLINE_EDIT ? DECLINE_EDIT_AGAIN : DECLINE_EDIT) : before === DECLINE_WRITE ? DECLINE_WRITE_AGAIN : DECLINE_WRITE;
      onToken?.(reply, reply);
      return this.#finish(project, intent, reply, 'builtin', true);
    };
    const declines = () => intent.type === 'request-edit' || intent.type === 'request-write';
    if (declines()) {
      intent.reading = rulesReading(intent, 'declined-by-rules');
      return decline();
    }

    // The writer's answer to an offer to keep the idea ("yes", "not yet", "also, ...") is read by the agent's rules first: it needs no model, so it is instant.
    const past = history.slice(0, -1);
    let agentTurn = null;
    if (this.agent && this.agent.state(project).pending?.kind === 'offer') {
      agentTurn = await this.#agentTurn({ project, text: askText, reading: null, kindHint: kindOpt, signal, past });
      if (agentTurn?.handled && agentTurn.handled.kind !== 'asked-kind') return this.#handled(project, intent, agentTurn, onToken);
    }

    // What is the writer asking? The language model reads the message when one is running; the rules read it otherwise.
    // The model only returns a label, so it cannot write anything; a "write"/"edit" label gets the same fixed decline.
    let reading = await this.#read({ intent, text: paste ? paste.ask || text.slice(0, 450) : text, history: history.slice(0, -1), signal, button: Boolean(lensOpt) }); // a tapped quick-action already says what it is
    if (!paste && !lensOpt && this.#stillALibraryQuestion({ project, intent, reading, text: askText })) reading = intent.reading;
    userMsg.intent = intent.type;
    if (declines()) return decline();
    if (intent.type === 'about-nie') return this.#about({ project, intent, text: askText, onToken });
    const byModel = reading.by === 'model';

    // The full library loads in the background after the app starts. A conversation about it that was saved with the project ("and the history?" after reopening it) needs the subject's
    // records to be read at all, so a moment is spent waiting for it, once, rather than reading the message without them. (A failed load is not tried again on every message.)
    if (!libraryStatus().loaded && !libraryStatus().error && project.conversation.library?.subject) await Promise.race([loadLibrary(), new Promise((resolve) => setTimeout(resolve, 8000))]);

    // Is this a question about the writer's own long text (a recent paste, or the project's Story Text) even though it never says "my story"?
    // "What is sedgewire made of?" is asked of the text, not of the craft library, and a small model labels it a general question.
    const aboutText = this.#aboutLongText({ project, text: askText, history: history.slice(0, -1) });

    // A short message that points back at the subject of NIE's last library answer ("what about its tropes?", "tell me more", "how is it different from romance?") is read
    // against that subject, so a conversation about a genre can go back and forth. The writer's message is not rewritten: only the library record it asks for is chosen.
    const turnNow = this.#turnOf(project);
    const thread = project.conversation.library;
    const follow = !paste && !aboutText && !lensOpt && intent.type !== 'develop-idea' ? resolveFollowUp(askText, thread, { turn: turnNow, model: byModel }) : null;

    // A question to look up on the web: the writer said so ("search the web for ..."), or turned the Web switch on and asked a factual question. It is answered from numbered sources and is
    // never recorded as part of the idea or as something the writer told NIE, so it is settled before the idea agent sees the message. (A request to write was declined above, web or not.)
    const webAsk = !paste && !lensOpt && this.web ? await this.#webAsk({ project, text: askText, webOn, reading, aboutText, follow }) : null;
    if (webAsk) return this.#web({ project, intent, text: askText, ask: webAsk, past: history.slice(0, -1), onToken, onProgress, signal });

    // The idea agent: what is being made, what the writer has said about it (in their own words), whether this turn asks something, and whether it is time to offer
    // to keep the idea. A question, a request or a pasted text is served, never recorded as part of the idea.
    // (A button or a typed "develop this idea" is a request for help, not something told to the agent.)
    const requesting = lensOpt || intent.type === 'develop-idea' ? { ...reading, task: 'ideas' } : follow ? { ...reading, task: 'craft' } : reading; // (a follow-up question about a genre is served, never recorded as part of the idea)
    agentTurn ??= await this.#agentTurn({ project, text: askText, reading: requesting, kindHint: kindOpt, signal, past });
    if (agentTurn?.handled && agentTurn.handled.kind !== 'asked-kind') return this.#handled(project, intent, agentTurn, onToken);
    if (agentTurn?.note) {
      // what the agent did on the way ("Kept.", "I've set the earlier idea aside") comes first, before the answer streams
      const lead = `${agentTurn.note}\n\n`;
      const emit = onToken;
      onToken = emit ? (d, full) => emit(d, lead + full) : emit;
    }

    // A hello, a thanks, "how are you?", "ok cool": answered like a person, in a line or two, with nothing fetched for it (no library notes, no recall, no idea sheet to point at).
    if (!paste && !lensOpt && !follow && !aboutText && isSmallTalk(reading, askText)) return this.#smallTalk({ project, intent, text: askText, past, onToken, signal });

    // The subject has nothing more (or no record of that facet): said plainly, from what the library really holds, with no model asked.
    if (follow?.reply) {
      const full = agentTurn?.note ? `${agentTurn.note}\n\n${follow.reply}` : follow.reply;
      onToken?.(full, full);
      project.conversation.library = { ...thread, turn: turnNow };
      return this.#finish(project, intent, full, 'builtin', false, { suggestions: chipsFor(project.conversation.library), library: { subject: thread.subject.name, follow: follow.kind } });
    }

    // What the writer said EARLIER in this project (at any time, not just the last few turns) that bears on this message; then this message is remembered too.
    // (Recall comes first so that a message can never recall itself.) A turn that only acknowledges and asks gets a few items, a turn that answers or gives ideas gets more.
    const shortTurn = ['ask', 'reflect'].includes(agentTurn?.plan?.act);
    const recalled = paste ? null : this.#recallFor(project, askText, reading, { limit: shortTurn ? 3 : 6, budgetTokens: shortTurn ? 230 : 400, agentTurn });
    const reacted = agentTurn?.act === 'question' && isReaction(askText, past.at(-1)?.role === 'assistant' ? past.at(-1).content : ''); // "that's cliche" is a reply to NIE, not something the writer told it
    const toldNie = !paste && !follow && !reacted && !/\?\s*$/.test(askText) && (agentTurn?.act === 'info' || agentTurn?.act === 'answer' || ['tell', 'develop'].includes(reading.task));
    if (toldNie) this.#remember(project, askText, agentTurn?.act === 'answer' ? 'answered' : 'told');

    // A general question about craft, style, usage, a form, genre or work: answer from the offline library, with its sources.
    // (Not a premise: it must not become the story's working premise.)
    let lib = null;
    let ownStrong = false; // the library's strong answer comes from the message itself (or from a follow-up it clearly makes), not from the model's one-word topic
    let libMiss = false;
    let ownProject = false;
    const libraryCandidate = text.length > LONG_MESSAGE_CHARS || aboutText || follow || BARE_REPLY.test(text) ? false : byModel ? reading.task === 'craft' : intent.type === 'discuss' || intent.type === 'craft-question' || (intent.type === 'share-premise' && GENERAL_Q.test(text));
    if (libraryCandidate) {
      // The full library loads in the background after the app starts; a question that may be for it waits a moment for it (once) instead of being answered from the core notes alone
      // or with "my full library is still loading".
      if (!libraryStatus().loaded && !libraryStatus().error) await Promise.race([loadLibrary(), new Promise((resolve) => setTimeout(resolve, 8000))]);
      // Naming a character or role ('the detective', 'Samantha', 'he') or "my story" means the writer is talking about their story, not asking the
      // library. Even when the model read it as a general question, that stays a veto for anything but a strong match: a 3B model misreads
      // some questions about the writer's own project, and answering those from the library (or saying the library has nothing) would be wrong.
      const lower = text.toLowerCase();
      const known = [...(project.conversation.workingPremise?.characters ?? []), ...(project.memory?.characters ?? []).map((c) => c.name)];
      const knownName = known.some((n) => n && lower.includes(String(n).toLowerCase()));
      // The project's own memory is evidence too: measured on the real model, "What tone did I say I wanted?" and "Who owes the guild money, and how much?" were read as general
      // questions about writing and answered from the library, while the writer's own statements that answer them were sitting in the mind. A general question about craft finds
      // nothing of the writer's (what is a MacGuffin? a red herring? good dialogue?); a question about their project does.
      const mindHit = Boolean(recalled?.items.some((i) => i.score >= OWN_PROJECT_RECALL));
      const storyTalk = OWN_PROJECT.test(text) || STORY_TALK.test(text) || extractPremiseCues(text).characters.some((c) => !/^[A-Z]/.test(c)) || knownName || mindHit || echoesRecentStory(text, past);
      ownProject = storyTalk;
      // "What tone did I say I wanted?": it asks about the conversation itself. Whatever the library has on "tone", this is not asking the library, whatever strength the match has.
      const refersBack = mindHit && REFERS_BACK.test(text);
      const general = byModel ? !storyTalk : GENERAL_Q.test(text) && !storyTalk;
      let a = refersBack ? { strength: 'none', entries: [], related: [] } : answerFromLibrary(text);
      ownStrong = a.strength === 'strong';
      // The model's short topic ("villanelle") finds the entry when the long way of asking buries it (never for talk about the writer's own project:
      // a bare topic like "villain" would match the library and skip the check that stops it answering about their story).
      if (general && !refersBack && a.strength !== 'strong' && reading.topic) {
        const b = answerFromLibrary(reading.topic);
        if (RANK[b.strength] > RANK[a.strength]) a = b;
      }
      if (a.strength === 'strong' || (a.strength === 'weak' && general)) lib = a;
      else if (general && words(text).length >= 3) libMiss = true;
    }
    if (follow?.entries) {
      lib = { strength: follow.kind === 'context' ? 'weak' : 'strong', entries: follow.entries, related: [] }; // (a pronoun question the library cannot pick out: the subject's records, as the closest it has)
      ownStrong = follow.kind !== 'context';
    }
    if (lib || libMiss) intent.type = 'library-question';

    if (intent.type !== 'library-question') project.conversation.workingPremise = updateWorkingPremise(project.conversation.workingPremise, text, intent);

    // ── What is being brainstormed, and is this a request for ideas? ──────────
    const asks = ASKS_FOR_IDEAS.test(askText);
    const develop = intent.type === 'develop-idea' ? intent.idea : null;
    // When the model read the message, only a reading of "ideas" (or a quick-action button) makes idea cards: "tell me more about the
    // twist" is a conversation, not a request for more twists. The rules' guess at a lens word only applies when the rules read it.
    const ideaIntent = intent.type === 'request-ideas' || (!byModel && intent.type === 'discuss');
    let lens = lensOpt && lensOpt !== 'develop' ? lensOpt : null;
    if (!lens && ideaIntent && (asks || words(askText).length <= 7)) lens = detectLens(askText);
    if (!lens && ideaIntent && asks && WANTS_MORE.test(text)) lens = bs.lastLens; // "more!" repeats the last request
    if (lens && !LENSES[lens]) lens = null;
    // A writer with nothing yet ("I want to write something but I don't know what") is given a few starting points to react to, whatever label the model gave: measured on the real
    // model, it was read as "write" (then "tell") and answered with "What are you making: a story, a poem, an article...?".
    const fromNothing = byModel && intent.type === 'start-from-zero' && !lensOpt;
    if (fromNothing && !lens) lens = 'spark';
    const isIdeaAsk = !develop && (Boolean(lensOpt) || fromNothing || intent.type === 'request-ideas' || (!byModel && intent.type === 'discuss' && (Boolean(lens) || (asks && /\bideas?\b/i.test(askText)))));

    const resolved = resolveKind(project, askText, kindOpt ?? null);
    let kind = resolved.kind;
    let note = '';
    if (lens && !LENSES_BY_KIND[kind].includes(lens)) {
      const fits = KIND_IDS.filter((k) => LENSES_BY_KIND[k].includes(lens));
      if (resolved.source === 'chosen') {
        note = `${LENSES[lens].label} isn't really a thing for ${kindLabel(kind).toLowerCase()} projects, so here's a mix that fits.`;
        lens = null;
      } else if (fits.length) {
        kind = fits[0];
      }
    }
    // Remember what the writer said they are working on, so "give me ideas" next turn stays in the right lane.
    const stated = detectKind(askText);
    if (stated && (isIdeaAsk || develop || intent.type === 'start-from-zero' || /\b(?:i'?m|i am|i want to|i'?d like to|i need to|let'?s)\s+(?:be\s+)?(?:writing|write|working on|draft)/i.test(askText))) bs.detectedKind = stated;

    const opening = fromNothing ? pickLine(FROM_NOTHING, askText) : ''; // (said to the writer; never put in the prompt, where the model took it for content)
    if (isIdeaAsk || develop) return this.#ideas({ project, intent, text, kind, lens, develop, opening, note: [agentTurn?.note, note].filter(Boolean).join('\n\n'), reading, recalled, onToken, onProgress, signal });

    // ── Conversation (not an idea request) ───────────────────────────────────
    const interp = interpretProfile(project.profile, { text: project.storyText });
    const doc = this.#documentFor({ project, text, intent, reading, history: past, aboutText });
    const noAsk = doc.userMessage === PASTED_NO_ASK;
    // A long text is read section by section first (once: the notes are kept), so NIE can talk about all of it, not five excerpts.
    const notes = await this.#notesFor({ project, doc, reading, noAsk, onProgress, signal });
    // Measured facts about the text (counted by the program: cast, pacing, voice, figures, the writer's rules): the model is given them instead of having to infer them.
    const analysis = doc.document?.text && this.editor ? this.#analysisFor(doc.document.text, notes, project) : null;
    if (analysis && noAsk) {
      // A text pasted with no question: what NIE found in it, from the counts, and one question put to you. No model has to word it, so it cannot make anything up.
      const frame = readbackFrame({ analysis, notes: notes?.per ?? null, overview: notes?.overview ?? '', style: notes?.style ?? '', project });
      const reply = [frame.lines.join('\n'), frame.question].filter(Boolean).join('\n\n');
      if (reply) {
        const full = agentTurn?.note ? `${agentTurn.note}\n\n${reply}` : reply;
        onToken?.(full, full);
        return this.#finish(project, intent, full, 'builtin', false, { agent: { act: 'readback' } });
      }
    }
    // (A single-fact question — "what colour was the door?" — is answered from the closest passages; the counts only help when it asks about something that is counted.)
    const measuredQuery = doc.document?.query || askText;
    const evidence = analysis && !noAsk && (!isLookupQuestion(measuredQuery) || ASKS_FOR_COUNTS.test(measuredQuery)) ? editorialEvidence({ analysis, query: measuredQuery, budgetTokens: 380 }) : null;
    // A question the counts answer exactly (is it consistent about a number, where do its dates run backwards, what tense is it in, how does its pace run) is answered by the
    // counts, in the writer's language, with the one question the finding raises. Measured on the real model, shown the same counts a 3B model still answered such a question with its
    // own words or with the question itself.
    const measured = analysis && !noAsk && !lib && !libMiss ? measuredAnswer({ analysis, query: measuredQuery }) : null;
    if (measured) {
      const full = agentTurn?.note ? `${agentTurn.note}\n\n${measured.text}` : measured.text;
      onToken?.(full, full);
      const looked = `I counted this from your text with ordinary code (${measured.sections === measured.of ? `all ${measured.of}` : `the first ${measured.sections} of ${measured.of}`} sections measured). No language model wrote or checked this answer.`;
      return this.#finish(project, intent, full, 'builtin', false, { agent: { act: 'measured', ...(measured.used.length ? { used: measured.used } : {}) }, looked });
    }
    // (A turn that only acknowledges and asks is steered by the idea agent's brief, which carries the genre's conventions; the general reference notes add prompt to read for little.)
    const steeredShort = Boolean(agentTurn) && !lib && !libMiss && !aboutText && !noAsk && ['ask', 'reflect'].includes(agentTurn.plan?.act);
    const retrieved = lib ? [...new Map([...lib.entries, ...lib.related, ...this.retrieve(project, askText)].map((e) => [e.id, e])).values()].slice(0, 6) : this.storyNotes(project, askText, { limit: steeredShort ? 2 : 3 });
    const shared = intent.type === 'share-passage' ? text : '';
    const passage = doc.document ? '' : shared; // a long paste is already shown through the reading block; do not show its opening a second time
    const report = shared ? scan({ text: doc.document?.subject === 'passage' ? doc.document.text : shared, project }) : null;
    // How to build this reply, which differs from the last ones; and what not to say again (openers, questions already asked).
    const plan = agentTurn?.plan ?? null;
    const asking = plan ? plan.act === 'ask' : undefined; // the shape of the reply agrees with the agent's plan for this turn (ask one question, or none)
    const shape = this.variety !== 'full' || lib || libMiss || steeredShort || reading.task === 'chat' ? null : shapeFor({ history: past, kind: noAsk ? 'readback' : aboutText ? 'lookup' : isShortQuestion(askText) ? 'question' : 'conversation', seed: text, asks: noAsk || aboutText ? undefined : asking });
    // What the agent wants of this reply (what it understands so far, what is not known, this turn's job) goes after the reading note.
    // (Not when the library answers, when the question is about the writer's text, or when the model could not tell what was asked: then the answer is a clarifying question, not the plan.)
    const steer = Boolean(agentTurn) && !lib && !libMiss && !aboutText && !noAsk && !(reading.by === 'model' && reading.task === 'unclear');
    const brief = steer ? agentTurn.brief : '';
    // (With no model, a writer who simply tells NIE about the idea gets an acknowledgement of what was recorded. A reply that has its own content stays: a change of direction, a pasted passage, the first sparks.)
    const telling = steer && Boolean(agentTurn.ack) && (agentTurn.act === 'info' || agentTurn.act === 'answer') && ['share-premise', 'discuss'].includes(intent.type);

    // A short reply to NIE's last message is told what it replies to (and which numbered idea it picks), so it is never answered as if it came from nowhere.
    const replyTo = paste || lensOpt || lib || libMiss || noAsk || aboutText ? '' : replyContext({ text: askText, past });

    const composeArgs = {
      mode: 'brainstorm',
      project,
      interp,
      userMessage: doc.userMessage,
      document: doc.document ? { ...doc.document, notes, style: notes ? '' : this.#styleOf(doc.document.text) } : null,
      // A question about what the text SAYS is self-contained: the brainstorm before it only pulls the answer toward the last idea (measured on the real model)
      // and costs prompt space.
      history: aboutText ? [] : past,
      retrieved,
      legacy: this.variety === 'legacy',
      extra: [shape ? `How to build this reply: ${shape.text}` : '', this.variety === 'full' ? avoidBlock(past) : '', noAsk || aboutText ? '' : readingNote(reading, text, { ownProject }), replyTo, noAsk || aboutText || lib || libMiss ? '' : feelingNote(askText), noAsk || aboutText || lib || libMiss ? '' : opinionNote(askText), noAsk || aboutText || lib || libMiss ? '' : namingNote(askText), lib || libMiss ? '' : evidence?.block ?? '', lib || libMiss || noAsk ? '' : recalled?.block ?? '', brief, report ? `The writer's rules and offline checks found: ${report.headline}` : lib ? LIBRARY_NOTE : libMiss ? LIBRARY_MISS_NOTE : ''].filter(Boolean).join('\n\n'),
    };
    const writerWords = past.filter((m) => m.role === 'user').slice(-12).map((m) => String(m.content ?? '').slice(0, 1200)); // (what the writer really said, for "you mentioned")
    const holdOpts = { recent: past.filter((m) => m.role === 'assistant').slice(-3).flatMap((m) => splitSentencesLite(String(m.content ?? ''))), maxSentences: replyTo ? 4 : 0 };
    const turnTokens = aboutText ? 320 : brief && plan.act !== 'serve' ? SHORT_TURN_TOKENS : 700;
    // An answer to a direct question the library answers well is the library's own text, put together by code, and no model is asked to retell it: measured on the real model (an audit
    // of 33 replies against the records they were built from), a 3B model that retold the notes got something wrong or credited the writer with something they never said in 13 of
    // them. A match the library is only loosely sure of, a pronoun question it cannot pick out, a question with more in it than the subject, and any answer with an online model
    // (not measured) still go to the model, and what it says is checked for names, dates and schemes the records do not hold.
    // (Only for the offline model, which is what was measured; only for a direct question; and never a work's record unless the question names the work or asks who wrote it: the top
    // match is chosen by words, and "what is a plot twist?" can find a novel before it finds the technique.)
    const topEntry = lib?.entries?.[0] ?? null;
    const worksOnly = topEntry?.kind === 'work' && !(WORK_ASK.test(askText) || askText.toLowerCase().includes(String(topEntry.name ?? '').toLowerCase()));
    const byCode = Boolean(lib) && lib.strength === 'strong' && ownStrong && follow?.kind !== 'context' && !analysis && !worksOnly && lib.nameHit !== false && this.engine.route?.() !== 'online' && directLibraryAsk(askText);
    const got = byCode ? { asked: { res: { text: null, route: 'builtin' }, failure: null, modelReady: true, trimmed: [], read: null }, polished: null, retried: false } : await this.#askClean({ composeArgs, history: past, known: [text, project.storyText], onToken, signal, temperature: aboutText ? 0.3 : 0.7, maxTokens: turnTokens, steered: Boolean(brief) });
    const asked = got.asked;
    const res = asked.res;
    const modelReady = asked.modelReady;
    const status = this.engine.status?.() ?? null;

    let reply;
    let route = res.route;
    let extra = {};
    let honesty = asked.failure && modelReady ? modelFailedNote(asked.failure) : '';
    let ungrounded = '';
    if (res.text) {
      const guarded = got.polished.guarded;
      reply = brief ? holdToPlan(finishedSentences(guarded.text, turnTokens), plan, agentTurn, askText, writerWords, holdOpts) : guarded.text; // one question at most, the one planned, about THIS project and never one already asked
      this.trace?.push({ plan: plan?.act ?? null, raw: guarded.text, held: reply });
      // A writer who says they are stuck or tired is met by a person before a question (the model rarely does it, and its comment, which rests on nothing they said, is cut).
      if (brief && isLowMood(askText) && splitSentencesLite(reply)[0] && /\?["')\]]*\s*$/.test(splitSentencesLite(reply)[0])) reply = `${pickLine(LOW_LEADS, askText)} ${reply}`;
      // Every sentence the model gave stated something of its own about the story as if it were so, and none was a suggestion: ask once more, saying exactly that, before the canned acknowledgement stands in.
      if (brief && plan?.act === 'reflect' && agentTurn.ack && reply === agentTurn.ack && res.route !== 'builtin') {
        const again = await this.#askClean({ composeArgs: { ...composeArgs, extra: [composeArgs.extra, REFLECT_RETRY_NOTES[splitSentencesLite(guarded.text).some((x) => !/\?["')\]]*\s*$/.test(x)) ? 'invented' : 'question']].filter(Boolean).join('\n\n') }, history: past, known: [text, project.storyText], onToken, signal, temperature: 0.7, maxTokens: turnTokens, steered: true });
        if (again.asked.res.text) {
          const second = holdToPlan(finishedSentences(again.polished.guarded.text, turnTokens), plan, agentTurn, askText, writerWords, holdOpts);
          if (second && second !== agentTurn.ack) reply = second;
        }
      }
      if (analysis && reply) {
        // An answer about the writer's text may only name what the text (or the writer) names: measured on the real model, replies invented names, numbers and set-ups.
        const g = groundNames(reply, {
          sources: [doc.document.text, profileCorpus(project.profile), evidence?.block ?? '', recalled?.block ?? '', ...project.conversation.messages.filter((m) => m.role === 'user').map((m) => m.content)],
          known: ['NIE', project.title, ...project.memory.characters.flatMap((c) => [c.name, ...(c.aliases ?? [])])].filter(Boolean),
          sections: analysis.sectionCount,
        });
        if (g.removed.length) {
          reply = g.text;
          ungrounded = g.emptied ? 'all' : 'some';
        }
      }
      // An answer from the library may only name what the library's records (or the conversation so far) name: measured on the real model, a reply built from the records still added
      // authors, titles and examples of its own ("Anne Rice", "Rosemary's Baby").
      if (lib && reply && !analysis) {
        const g = groundNames(reply, {
          sources: [...retrieved.map(recordText), ...project.conversation.messages.filter((m) => m.role === 'user' || m.library).map((m) => m.content)],
          known: ['NIE', project.title, project.conversation.library?.subject?.name].filter(Boolean),
          sections: null,
          facts: true, // and the years, centuries and rhyme schemes it states: measured on the real model, a reply gave the villanelle a scheme of its own
        });
        if (g.removed.length) {
          reply = g.text;
          ungrounded = g.emptied ? 'library-all' : 'library-some';
        }
      }
      // If nothing but a composed passage was left, say it with built-in guidance instead.
      if (guarded.removed && words(guarded.remaining).length < 8) reply = '';
      if (!reply && lib) {
        reply = libraryReply(lib, follow ? { lead: follow.lead, after: follow.after, rest: follow.rest, compact: follow.compact } : {});
        route = 'builtin';
        honesty = ungrounded === 'library-all' ? UNGROUNDED_LIBRARY_NOTE : WITHHELD_NOTE;
      } else if (!reply) {
        reply = builtinReply({ intent, project, message: askText, report, modelReady: true, status });
        if (steer) reply = agentTurn.enforce(telling ? agentTurn.ack : withoutQuestionLists(reply));
        route = 'builtin';
        honesty = ungrounded === 'all' ? UNGROUNDED_NOTE : WITHHELD_NOTE;
      }
    } else {
      reply = lib ? libraryReply(lib, follow ? { lead: follow.lead, after: follow.after, rest: follow.rest, compact: follow.compact } : {}) : libMiss ? libraryMissReply(answerFromLibrary(text), { encyclopedia: await this.#encyclopediaOn() }) : builtinReply({ intent, project, message: askText, report, modelReady: modelReady && Boolean(asked.failure), status });
      if (steer) reply = agentTurn.enforce(telling ? agentTurn.ack : withoutQuestionLists(reply)); // told something, no model: a short acknowledgement of what was recorded, and the planned question
      route = 'builtin';
      // Starting from nothing is where a few sparks help most: offer some to react to, never a draft.
      if (intent.type === 'start-from-zero') {
        const sparks = generateIdeas({ project, message: askText, kind, lens: 'spark', count: 3 }).ideas;
        if (sparks.length) {
          const lead = `${reply}\n\nIf it helps, here are a few starting points to react to:`;
          reply = [lead, sparks.map((s, i) => `${i + 1}. ${s.text}`).join('\n')].join('\n\n');
          extra = { ideas: sparks, lead, tail: '', kind, lens: 'spark' };
          markShown(project, sparks);
        }
      }
    }
    if (route === 'builtin' && honesty) {
      reply = `${honesty}\n\n${reply}`;
      if (extra.lead) extra = { ...extra, lead: `${honesty}\n\n${extra.lead}` };
      extra = { ...extra, fallback: asked.failure ? { reason: 'error', detail: describeModelFailure(asked.failure) } : { reason: 'withheld' } };
    }
    if (route === 'builtin') onToken?.(reply, reply);
    else {
      // Say what was looked at. (Only when a model answered: a built-in reply never read the text, and must not seem to.)
      const tail = shortenedNote(asked.trimmed);
      if (tail) reply = `${reply}\n\n${tail}`;
      if (ungrounded === 'some') reply = `${reply}\n\n${LEFT_OUT_UNGROUNDED}`;
      if (ungrounded === 'library-some') reply = `${reply}\n\n${LEFT_OUT_LIBRARY}`;
      if (recalled && !lib && !libMiss) extra = { ...extra, recalled: recalledRecord(recalled) };
      if (asked.read) extra = { ...extra, read: summarizeRead(asked.read), looked: lookedAt(asked.read, route) };
      extra = { ...extra, ...varietyRecord(shape, got) };
    }
    // Remember the question that was really asked (so it is never asked again), and what the agent did on the way.
    if (steer) agentTurn.record(reply);
    if (agentTurn?.note) {
      reply = `${agentTurn.note}\n\n${reply}`;
      if (extra.lead) extra = { ...extra, lead: `${agentTurn.note}\n\n${extra.lead}` };
    }
    // After a library answer the thread points at its subject: what was shown is marked, and the next questions on it are offered as chips.
    let libraryChips = null;
    if (lib) {
      project.conversation.library = follow?.kind === 'context' ? { ...thread, turn: turnNow } : follow?.rest ? afterRest(thread, turnNow) : noteAnswer(thread, lib.entries, turnNow, follow ? '' : askText);
      libraryChips = chipsFor(project.conversation.library);
      if (libraryChips.length) extra = { ...extra, library: { subject: project.conversation.library.subject?.name ?? null, ...(follow ? { follow: follow.kind } : {}) } };
    }
    const chips = libraryChips?.length ? libraryChips : agentTurn ? this.#agentChips(agentTurn, project) : null;
    return this.#finish(project, intent, reply, route, false, { ...extra, ...(chips ? { suggestions: chips } : {}), ...(plan ? { agent: { act: plan.act, ...(plan.slot ? { slot: plan.slot } : {}), reason: plan.reason } } : {}) });
  }

  /** The long text a follow-up could be about: a recent long paste (its body), else the project's Story Text; null when there is none. */
  /** The newest long paste still held in full (an older one has been cut to its start, `compactOldPastes`) among the last `within` messages. */
  #pastedText(history, within) {
    const from = Number.isFinite(within) ? Math.max(0, history.length - within) : 0;
    for (let i = history.length - 1; i >= from; i--) {
      const m = history[i];
      if (m.role === 'user' && !m.compacted && m.content.length > LONG_MESSAGE_CHARS) return m;
    }
    return null;
  }

  #candidateText(project, history) {
    const recent = this.#pastedText(history, Infinity);
    if (recent) return splitPaste(recent.content).body;
    const story = project.storyText ?? '';
    return story.trim().length >= STORY_TEXT_MIN_CHARS ? story : null;
  }

  #aboutLongText({ project, text, history }) {
    if (!text || text.length > LONG_MESSAGE_CHARS) return false;
    const doc = this.#candidateText(project, history);
    if (!doc || estimateTokens(doc) <= 1500) return false;
    if (ABOUT_TEXT_MARKERS.test(text)) return true;
    const top = searchText(indexFor(doc), text, { limit: 1 })[0];
    return Boolean(top && top.score >= TEXT_MATCH_SCORE);
  }

  #styleOf(text) {
    const key = `${text.length}:${fnv1a(text)}`;
    let style = this.#styles.get(key);
    if (style === undefined) {
      style = styleProfile(text).promptLine;
      this.#styles.set(key, style);
      if (this.#styles.size > 3) this.#styles.delete(this.#styles.keys().next().value);
    }
    return style;
  }

  /**
   * The long text (if there is one) this message is about, and what the writer actually asked.
   *  - a long pasted message is the text itself; its short first/last paragraph is the ask;
   *  - a follow-up soon after such a paste is about that paste, unless it says "my story/draft…";
   *  - otherwise the project's Story Text, for anything about the writer's own work.
   * Nothing is cut off: the composer shows an outline of the whole plus the parts that matter, and `read` records what was shown.
   * @returns {{ document: {text:string,query:string,topic:string,subject:string}|null, userMessage: string }}
   */
  #documentFor({ project, text, intent, reading, history, aboutText = false }) {
    const task = reading?.task ?? null;
    const aboutWork = aboutText || (!['craft', 'about-nie', 'chat', 'write', 'edit'].includes(task) && !['library-question', 'greeting', 'about-nie'].includes(intent.type));
    const topic = reading?.topic ?? '';
    if (text.length > LONG_MESSAGE_CHARS) {
      const { ask, body } = splitPaste(text);
      return { document: { text: body, query: ask, topic, subject: 'passage' }, userMessage: ask || PASTED_NO_ASK };
    }
    if (!aboutWork) return { document: null, userMessage: text };
    // ("my story" means the project's Story Text when there is one; with none, the text just pasted is what they mean.)
    if (!MENTIONS_OWN_TEXT.test(text) || project.storyText.trim().length < STORY_TEXT_MIN_CHARS) {
      // The newest pasted text stays attached for a dozen messages. Later it is attached when the message is clearly about it (`aboutText`): a session can run for
      // hundreds of messages and a text pasted at the start is still the writer's, not forgotten after twelve.
      const paste = this.#pastedText(history, aboutText ? Infinity : 12);
      if (paste) return { document: { text: splitPaste(paste.content).body, query: text, topic, subject: 'passage' }, userMessage: text };
    }
    // Telling NIE something new about the project does not need the old text in front of it (and costs the model time to read): feedback, ideas and talk do.
    if ((aboutText || task !== 'tell') && project.storyText.trim().length >= STORY_TEXT_MIN_CHARS) return { document: { text: project.storyText, query: text, topic, subject: 'text' }, userMessage: text };
    return { document: null, userMessage: text };
  }

  /**
   * Read a long text one section at a time (the model, locally, once: every note is kept by the section's hash, so only new or edited sections are read
   * again and a stopped read carries on where it stopped). Returns what NIE knows of the text, or null when the text is short enough to show whole, no
   * model is running here, or the question is one fact that the closest passages answer (nothing is read for that; notes made earlier are still used).
   * Progress goes to `onProgress`; Stop (the signal) rethrows with the notes made so far already kept.
   */
  async #notesFor({ project, doc, reading, noAsk, onProgress, signal }) {
    const document = doc.document;
    if (!document?.text || !this.readNotes) return null;
    const index = indexFor(document.text);
    const N = index.sections.length;
    if (N < 2 || estimateTokens(document.text) <= 1500) return null; // short enough to be shown whole (the reading block does that itself)
    try {
      const cache = projectNotesCache(project);
      const mayRead = (this.engine.route?.() ?? 'builtin') === 'local' && N <= MAX_NOTE_SECTIONS && (noAsk || wantsWholeText({ query: document.query ?? '', reading }));
      let per;
      let modelRead;
      let complete = false;
      let failed = false;
      if (mayRead) {
        const cached = index.sections.filter((s) => cache.get(sectionKey(s))).length;
        onProgress?.({ stage: 'reading', done: 0, total: N, cached, etaMs: null });
        const r = await readThrough({ engine: this.engine, index, cache, signal, maxSections: MAX_NOTE_SECTIONS, coldMs: COLD_NOTE_MS, warmMs: WARM_NOTE_MS, onProgress: (p) => onProgress?.({ stage: 'reading', ...p }) });
        ({ notes: per, modelRead, complete, failed } = r);
      } else {
        per = index.sections.map((s) => cache.get(sectionKey(s)) ?? null);
        modelRead = per.filter((n) => n && (n.by === 'model' || n.by === 'text')).length;
        complete = modelRead === N;
      }
      if (!modelRead) return null;
      let overview = '';
      if (complete) {
        if (mayRead) onProgress?.({ stage: 'overview', done: N, total: N });
        const total = index.sections.reduce((a, x) => a + x.words, 0);
        overview = (await makeOverview({ engine: mayRead ? this.engine : NO_MODEL, notes: per, cache, signal, words: total, sections: N })).text;
      }
      return { per, overview, style: this.#styleOf(document.text), modelRead, total: N, complete, failed };
    } catch (err) {
      if (err?.kind === 'abort') throw err;
      return null; // notes are an extra: if reading them fails, NIE answers from the closest passages as before
    }
  }

  /**
   * Ask, then clean the reply of what makes NIE sound the same each time (praise openers, stock questions, a question it already asked); when it
   * still repeats itself clearly, ask once more with a note saying how. Never adds a word of its own.
   */
  async #askClean({ composeArgs, history, known, onToken, signal, temperature, maxTokens = 700, steered = false }) {
    const polish = (res) => {
      const g = guardReply(res.text, known);
      let rf = this.variety === 'full' ? refine(g.remaining, { history }) : { text: g.remaining, dropped: [], retry: false, reasons: [] };
      // "How does the writer maintain the reader's curiosity...?" said TO the writer: ask once more (the prompt says "you"; a 3B model sometimes copies the instructions' own wording)
      if (this.variety === 'full' && findThirdPerson(rf.text).length) rf = { ...rf, retry: true, reasons: [...rf.reasons, 'it talks about "the writer" to the writer instead of saying "you"'] };
      return { rf, guarded: { remaining: rf.text, removed: g.removed, text: g.removed ? `${rf.text}\n\n${LEFT_OUT_NOTICE}`.trim() : rf.text } };
    };
    let asked = await this.#ask({ composeArgs, onToken, signal, temperature, maxTokens });
    let polished = asked.res.text ? polish(asked.res) : null;
    let retried = false;
    // (Too many questions alone is not worth a second answer when the idea agent steers the reply: it keeps the one planned question and cuts the rest.)
    const worthRetry = polished?.rf.retry && !(steered && polished.rf.reasons.every((r) => r === 'it asks too many questions'));
    if (VARIETY_RETRY && worthRetry && asked.res.route !== 'builtin') {
      retried = true;
      const again = await this.#ask({ composeArgs: { ...composeArgs, extra: [composeArgs.extra, retryNote(polished.rf, polished.rf.text)].filter(Boolean).join('\n\n') }, onToken, signal, temperature: Math.min(1, temperature + 0.15), maxTokens });
      if (again.res.text) {
        const second = polish(again.res);
        if (!(second.guarded.removed && words(second.guarded.remaining).length < 8)) {
          asked = again;
          polished = second;
        }
      }
    }
    return { asked, polished, retried };
  }

  /**
   * Ask the model. If it is ready but the call fails (usually a prompt too long for its window), retry ONCE with a much
   * smaller prompt before giving up. `modelReady` tells the caller whether "the model is missing" would be a lie.
   */
  async #ask({ composeArgs, onToken, signal, temperature, maxTokens = 700 }) {
    const ready = () => this.engine.localStatus?.().state === 'ready';
    const full = composeMessages(composeArgs);
    const read = full.reading;
    let failure = null;
    let res = null;
    try {
      res = await this.engine.chat(full.messages, { onToken, signal, maxTokens, temperature });
    } catch (err) {
      if (err?.kind === 'abort') throw err;
      failure = err;
    }
    if (res && !res.text) failure = res.error ?? failure;
    const modelReady = ready();
    if ((!res || !res.text) && modelReady) {
      const small = composeMessages({ ...composeArgs, limit: RETRY_TOKEN_LIMIT, minimal: true });
      try {
        const again = await this.engine.chat(small.messages, { onToken, signal, maxTokens: 500, temperature });
        if (again.text) return { res: again, failure: null, modelReady, trimmed: [...new Set([...full.trimmed, ...small.trimmed, 'earlier messages'])], read: small.reading ?? read };
        failure = again.error ?? failure;
      } catch (err) {
        if (err?.kind === 'abort') throw err;
        failure = err;
      }
    }
    return { res: res ?? { text: null, route: 'builtin' }, failure: res?.text ? null : failure, modelReady, trimmed: full.trimmed, read };
  }

  /** Idea requests and "develop this idea": the model when it is running, otherwise the built-in idea library. */
  async #ideas({ project, intent, text, kind, lens, develop, opening = '', note, reading, recalled = null, onToken, onProgress, signal }) {
    const bs = project.brainstorm;
    const history = project.conversation.messages;
    const past = history.slice(0, -1);
    const doc = this.#documentFor({ project, text, intent, reading, history: past });
    const askText = doc.document?.subject === 'passage' && text.length > LONG_MESSAGE_CHARS ? doc.userMessage : text;
    const gen = develop ? { ideas: [] } : generateIdeas({ project, message: askText, kind, lens, count: 3 });
    const interp = interpretProfile(project.profile, { text: project.storyText });
    const notes = await this.#notesFor({ project, doc, reading, noAsk: doc.userMessage === PASTED_NO_ASK, onProgress, signal });
    const composeArgs = {
      mode: 'brainstorm',
      project,
      interp,
      userMessage: doc.userMessage,
      document: doc.document ? { ...doc.document, notes, style: notes ? '' : this.#styleOf(doc.document.text) } : null,
      history: past,
      retrieved: this.retrieve(project, askText),
      legacy: this.variety === 'legacy',
      extra: [ideaRequestBlock({ kind, lens, develop, note, seeds: gen.ideas.slice(0, 2).map((i) => i.text) }), recalled?.block ?? '', this.variety === 'full' ? avoidBlock(past) : ''].filter(Boolean).join('\n\n'),
    };
    const got = await this.#askClean({ composeArgs, history: past, known: [text, project.storyText], onToken, signal, temperature: 0.85 });
    const asked = got.asked;
    const res = asked.res;
    const fallbackNote = asked.failure && asked.modelReady ? modelFailedNote(asked.failure) : '';

    const lensLabel = lens ? (LENSES[lens]?.label ?? lens) : 'Idea';
    const toCards = (items) => items.map((t) => ({ id: ideaId(t), kind, lens: lens ?? 'mixed', lensLabel, text: t }));
    const firstTime = !history.some((m) => m.role === 'assistant' && m.ideas?.length);

    if (res.text) {
      const guarded = got.polished.guarded;
      if (!(guarded.removed && words(guarded.remaining).length < 8)) {
        const parsed = develop ? { ideas: [] } : parseIdeas(guarded.remaining);
        const ideas = toCards(parsed.ideas);
        const reply = ideas.length || !opening ? guarded.text : `${opening}\n\n${guarded.text}`;
        if (ideas.length) markShown(project, ideas);
        bs.lastLens = lens;
        const lead = [opening, note, parsed.lead].filter(Boolean).join('\n\n');
        const cut = shortenedNote(asked.trimmed);
        return this.#finish(project, intent, cut ? `${reply}\n\n${cut}` : reply, res.route, false, { ideas, lead: ideas.length ? lead : '', tail: [ideas.length ? parsed.tail : '', cut].filter(Boolean).join('\n\n'), kind, lens, ...(asked.read ? { read: summarizeRead(asked.read), looked: lookedAt(asked.read, res.route) } : {}), ...(recalled ? { recalled: recalledRecord(recalled) } : {}), ...varietyRecord(null, got) });
      }
    }

    // Built-in guidance: deterministic, from the idea library and what the writer has told us.
    let composed;
    let ideas = [];
    if (develop) {
      composed = composeDevelopReply({ project, kind, idea: develop, builtin: true, firstTime });
    } else if (gen.ideas.length) {
      composed = composeIdeaReply({ project, kind, lens, ideas: gen.ideas, builtin: true, firstTime });
      ideas = gen.ideas;
      markShown(project, ideas);
    }
    const honesty = fallbackNote || (res.text ? WITHHELD_NOTE : '');
    const fallback = honesty ? { reason: asked.failure ? 'error' : 'withheld', ...(asked.failure ? { detail: describeModelFailure(asked.failure) } : {}) } : null;
    if (!composed) {
      const reply = [honesty, builtinReply({ intent: { ...intent, type: 'request-ideas' }, project, message: askText, modelReady: Boolean(honesty) })].filter(Boolean).join('\n\n');
      onToken?.(reply, reply);
      return this.#finish(project, intent, reply, 'builtin', false, { kind, lens, fallback });
    }
    if (note) {
      composed.lead = `${note} ${composed.lead}`;
      composed.text = `${note} ${composed.text}`;
    }
    if (opening) {
      composed.lead = `${opening} ${composed.lead}`;
      composed.text = `${opening} ${composed.text}`;
    }
    if (honesty) {
      composed.lead = `${honesty}\n\n${composed.lead}`;
      composed.text = `${honesty}\n\n${composed.text}`;
    }
    bs.lastLens = lens;
    onToken?.(composed.text, composed.text);
    return this.#finish(project, intent, composed.text, 'builtin', false, { ideas, lead: composed.lead, tail: composed.tail, kind, lens, fallback });
  }

  /**
   * "What can you do? Do you work offline? Which model are you?" is answered from fixed, checked facts about NIE and the real status, whether or
   * not a model is running: a small model asked to describe its own app invents abilities and rambles (measured on the real model), and what NIE says
   * about itself, above all about its own state, has to be exact. The model's part is recognising that this is what the writer asked.
   */
  /** Is this message a web request, and what are its search words? null when it is not (or when the web can not be used and the writer only asked for sources). */
  async #webAsk({ project, text, webOn, reading, aboutText, follow }) {
    const said = explicitWebAsk(text);
    let st = null;
    try {
      st = await this.web.status();
    } catch {
      st = null;
    }
    const usable = Boolean(st?.configured && st?.enabled);
    if (said && (said.strength === 'search' || usable)) return { query: said.query, explicit: true };
    if (!webOn || !usable || aboutText || follow) return null;
    // with the Web switch on, a factual question goes to the web; talk about the writer's own story, ideas, feedback and small talk never does
    // (with no model the rules read a plain question as "discuss", which has no task: a question that starts like a general one is still a factual question)
    // (and "Who was Cleopatra?", "Tell me about Mary Shelley.": a plain question about a named thing is a lookup whatever label a small model gave it, unless the name is one of the writer's own characters)
    const subject = ['write', 'edit', 'about-nie'].includes(reading?.task) ? null : definitionSubject(text);
    const mine = [...(project?.conversation?.workingPremise?.characters ?? []), ...(project?.memory?.characters ?? []).map((c) => c.name)].some((n) => n && String(subject ?? '').toLowerCase().includes(String(n).toLowerCase()));
    const named = Boolean(subject) && !mine;
    const factualTask = ['craft', 'unclear'].includes(reading?.task) || (reading?.by === 'rules' && !reading?.task);
    if (!(named || (factualTask && looksFactual(text, GENERAL_Q))) || STORY_TALK.test(text)) return null;
    // A direct question the built-in library holds under its own name ("What is a villanelle?") is answered there: it is written for writers, it is quicker and nothing leaves the computer.
    // The lookup is for what the library does not hold, or when the writer asks for it by name ("look up ...", which was settled above).
    if (!libraryStatus().loaded) await Promise.race([loadLibrary(), new Promise((resolve) => setTimeout(resolve, 3000))]);
    const held = answerFromLibrary(text);
    if (held.strength === 'strong' && held.nameHit !== false && directLibraryAsk(text)) return null;
    return { query: text.replace(/[?!.\s]+$/, '').trim(), explicit: false };
  }

  /** Is the offline encyclopedia the source a lookup would use right now? (Only so NIE does not say it can't look things up when it can.) */
  async #encyclopediaOn() {
    try {
      const st = await this.web?.status?.();
      return Boolean(st?.configured && st.enabled && isLocal(st.provider));
    } catch {
      return false;
    }
  }

  /** A short follow-up ("and when was it built?") made into a search of its own, using the last web question. A model rewrites it when one is running; otherwise the words are joined. */
  async #standaloneQuery(query, previous, signal) {
    const joined = joinFollowUp(previous, query);
    if (this.engine.route?.() === 'builtin') return joined;
    try {
      const res = await this.engine.chat(
        [
          { role: 'system', content: 'Rewrite the follow-up question as one short standalone web search query of at most 12 words. Reply with the query only, no quotes and no explanation.' },
          { role: 'user', content: `Earlier search: ${previous}\nFollow-up: ${query}` },
        ],
        { signal, maxTokens: 40, temperature: 0 },
      );
      const line = String(res?.text ?? '').split('\n')[0].replace(/["“”`]/g, '').replace(/^(?:query|search)\s*:\s*/i, '').trim();
      const shared = (a, b) => { const bs = new Set(words(b).map((w) => w.toLowerCase())); return words(a).some((w) => w.length > 3 && bs.has(w.toLowerCase())); };
      if (line && words(line).length >= 2 && words(line).length <= 14 && (shared(line, previous) || shared(line, query))) return line;
    } catch (err) {
      if (err?.kind === 'abort') throw err;
    }
    return joined;
  }

  /**
   * Search the web, read the best pages, and have whichever model is running (offline, online, or none) answer from numbered sources. Only the writer's question leaves the computer for the
   * search service: never a pasted text, never the project. The answer is checked in code (a citation that points at no source goes; a sentence naming or numbering something no source holds
   * goes) and the sources are listed so the writer can check them. With no model, or nothing left after the check, the results are shown as they came. Nothing here writes for the writer.
   */
  async #web({ project, intent, text, ask, past, onToken, onProgress, signal }) {
    const stop = () => new AIError('Stopped', { kind: 'abort' });
    const meta = { provider: null, query: '', sources: [], answeredBy: 'none', state: 'failed', note: '' };
    const finish = (reply, route, over) => {
      onToken?.(reply, reply);
      return this.#finish(project, intent, reply, route, false, { web: { ...meta, ...over } });
    };
    let st = null;
    try {
      st = await this.web.status();
    } catch {
      st = null;
    }
    meta.provider = st?.provider ?? null;
    if (!st?.configured) {
      const reply = "Web search isn't set up, so I can't look that up. You can add a key for a search service under Web search in Settings; until then I can answer from my library and my model, but I can't see the live web.";
      return finish(reply, 'builtin', { state: 'not-configured', note: 'Web search is not set up.' });
    }
    if (!st.enabled) {
      // (a built-in search is used only after the writer has agreed to it once, so "switched off" is not the whole story for it)
      const builtin = isBuiltin(st.provider);
      const reply = !builtin
        ? 'Web search is switched off. Turn it on under Web search in Settings if you want me to look things up; until then I answer from my library and my model.'
        : st.provider === 'wikipedia'
          ? 'Looking things up on Wikipedia is ready as soon as you agree to it: press the Web switch next to the message box, or tick it under Web search in Settings. Until then I answer from my library and my model.'
          : "Web search is off. NIE's built-in search is ready as soon as you agree to it: press the Web switch next to the message box, or tick it under Web search in Settings. Until then I answer from my library and my model.";
      return finish(reply, 'builtin', { state: 'not-configured', note: builtin ? (st.provider === 'wikipedia' ? 'You have not agreed to look things up on Wikipedia yet.' : "You have not agreed to NIE's built-in search yet.") : 'Web search is switched off.' });
    }

    let query = ask.query;
    const prior = previousWebQuery(past);
    if (needsContext(query) && prior) query = await this.#standaloneQuery(query, prior, signal);
    const problem = queryProblem(query);
    if (problem) {
      const reply = problem === 'long' ? "That's more than I should send to a search service. Ask it in a sentence or two (the search words are the only thing that leaves your computer) and I'll look it up." : 'What should I look up?';
      return finish(reply, 'builtin', { state: 'failed', note: 'Nothing was sent to the search service.' });
    }
    meta.query = query;

    const local = isLocal(st.provider); // the encyclopedia on this computer: nothing is sent anywhere
    onProgress?.({ stage: 'web', message: local ? 'Looking in the offline encyclopedia…' : 'Searching the web…' });
    let found;
    try {
      found = await this.web.search(query, { signal, limit: 6 });
    } catch (err) {
      if (signal?.aborted || err?.kind === 'aborted') throw stop();
      const why = String(err?.message ?? 'The search did not work.');
      return finish(local ? `I couldn't look that up in the offline encyclopedia just now. ${why}` : `I couldn't search the web just now. ${why}`, 'builtin', { state: 'failed', note: why });
    }
    meta.provider = found.provider ?? meta.provider;
    if (!found.results.length) {
      if (local) {
        const size = found.pack?.docs ? `${found.pack.docs.toLocaleString('en-US')} articles` : 'a set of articles';
        return finish(`The offline encyclopedia has nothing on "${query}". It holds the opening of ${size}, the most read ones, so a narrow or very recent subject may simply not be in it. Try other words, or turn the Web switch off and I'll answer from my library and my model, without sources.`, 'builtin', { state: 'none-found', note: 'The offline encyclopedia has no article on this.' });
      }
      return finish(`The search found nothing for "${query}". Try other words, or turn the Web switch off and I'll answer from what I know, without sources.`, 'builtin', { state: 'none-found', note: 'The search service returned no results.' });
    }

    const online = this.engine.route?.() === 'online';
    const top = found.results.slice(0, 3);
    onProgress?.({ stage: 'web', message: local ? `Reading ${top.length} article${top.length === 1 ? '' : 's'}…` : `Reading ${top.length} page${top.length === 1 ? '' : 's'}…` });
    const pages = new Map();
    await Promise.all(
      top.map(async (r) => {
        try {
          const page = await this.web.read(r.url, { signal, maxChars: online ? 4000 : 2600 });
          if (page?.text) pages.set(r.url, page);
        } catch {
          /* a page that can not be read is simply not used: its search snippet still is */
        }
      }),
    );
    if (signal?.aborted) throw stop();
    // (from the encyclopedia: three articles, each cut to the sentences that bear on the question: measured on the real model, five whole openings gave it distractors to write about)
    const wholeSources = buildSources(found.results, pages, online ? { totalChars: 14000, perSourceChars: 4000 } : local ? { maxSources: 3 } : {});
    const sources = local ? focusSources(wholeSources, ask.explicit ? query : text) : wholeSources;
    meta.sources = sources.map(({ n, title, url, host, read }) => ({ n, title, url, host, read }));
    const readCount = sources.filter((s) => s.read).length;
    const asOf = found.pack?.builtAt ? String(found.pack.builtAt).slice(0, 10) : '';
    const counted = local
      ? `${sources.length} article${sources.length === 1 ? '' : 's'} of the offline encyclopedia (Wikipedia, the opening of each${asOf ? `, as of ${asOf}` : ''})`
      : `${sources.length} source${sources.length === 1 ? '' : 's'} (${readCount === 0 ? 'search snippets only' : `${readCount} page${readCount === 1 ? '' : 's'} read, the rest search snippets`})`;

    // "What is X?" with an article of exactly that name: the article's own opening sentences, quoted, no model (a small model's retelling only loses or adds to it)
    const defined = local ? definitionalAnswer({ question: ask.explicit ? query : text, sources: wholeSources, bare: ask.explicit }) : null;
    if (defined) {
      return finish(defined.reply, 'builtin', { state: 'answered', answeredBy: 'encyclopedia', note: `Quoted from the offline encyclopedia article "${defined.title}" (Wikipedia, CC BY-SA 4.0). No model wrote this, and nothing left your computer.` });
    }

    onProgress?.({ stage: 'web', message: local ? 'Writing the answer from the articles…' : 'Writing the answer from the sources…' });
    const messages = webMessages({ question: ask.explicit ? query : text, sources, history: past, local });
    let res = null;
    try {
      res = await this.engine.chat(messages, local ? { signal, maxTokens: 220, temperature: 0.1 } : { signal, maxTokens: 420, temperature: 0.2 });
    } catch (err) {
      if (err?.kind === 'abort') throw err;
    }
    const modelReady = this.engine.route?.() !== 'builtin';
    const asResults = (intro, over) => finish(resultsOnly(sources, intro, local ? { full: true, sentences: 2 } : {}), 'builtin', { state: 'results-only', answeredBy: 'none', note: `No summary was written. These are ${counted} as ${local ? 'the encyclopedia holds them' : 'the search returned them'}.`, ...over });
    const returned = local ? 'the encyclopedia holds' : 'the search returned';
    if (!res?.text) {
      return asResults(modelReady ? `My model couldn't answer from these just now. Here is what ${returned}:` : `No language model is running, so I can't summarise. Here is what ${returned}:`);
    }
    const written = local ? tidyReply(res.text).text : res.text;
    if (local && absentReply(written)) {
      // the model said the articles do not answer it: said plainly, with the articles it looked at, instead of a guess or a dump
      const titles = sources.map((s) => s.title);
      const list = titles.length > 1 ? `${titles.slice(0, -1).join(', ')} and ${titles.at(-1)}` : titles[0];
      return finish(`The articles I found don't answer that. The closest are ${list}.`, res.route ?? 'local', { state: 'answered', answeredBy: res.route === 'online' ? 'online model' : 'offline model', note: `The model found no answer in ${counted}, so it did not guess. Nothing left your computer.` });
    }
    const guarded = guardReply(written, [text]);
    const checked = verifyAnswer(guarded.remaining, local ? sources.map((s) => ({ ...s, text: s.full ?? s.text })) : sources, { question: text });
    // (from the encyclopedia, also: a sentence whose words or figures the articles do not hold is what the model said from its own memory)
    const supported = local && !checked.emptied ? supportCheck(checked.text, sources) : null;
    const shown = supported ? supported.text : checked.text;
    if (checked.emptied || supported?.emptied || words(shown).length < (local ? 4 : 6)) {
      return asResults(local && supported?.emptied ? "I left out what my model wrote because the articles don't back it up. Here is what the closest ones start with:" : `I left out what my model wrote because it named things the ${local ? 'articles' : 'sources'} don't hold. Here is what ${returned}:`);
    }
    const answeredBy = res.route === 'online' ? 'online model' : 'offline model';
    const sent = res.route === 'online' ? Math.max(50, Math.round(words(messages.map((m) => m.content).join(' ')).length / 50) * 50) : 0;
    const uncited = checked.cited.length === 0;
    const note =
      `Written by the ${answeredBy} from ${counted}.` +
      (uncited ? ' It did not say which source each statement came from, so check the list.' : '') +
      (sent ? ` About ${sent} words (your question and the ${local ? 'encyclopedia' : 'web'} text) were sent to your online provider.` : local ? ' Nothing left your computer.' : '');
    let reply = shown;
    if (checked.removed) reply += `\n\n${LEFT_OUT_WEB}`;
    else if (supported?.removed.length) reply += `\n\n${LEFT_OUT_UNBACKED}`;
    if (guarded.removed) reply += `\n\n${LEFT_OUT_NOTICE}`;
    return finish(reply, res.route ?? 'local', { state: 'answered', answeredBy, note });
  }

  #about({ project, intent, text, onToken }) {
    const reply = aboutNieReply(this.engine.status?.() ?? null, text);
    onToken?.(reply, reply);
    return this.#finish(project, intent, reply, 'builtin', false);
  }

  /** "Remember this": keep what the writer said, or the ideas NIE just offered, on this project's Idea Board. */
  #keep(project, intent, onToken) {
    const prior = project.conversation.messages.slice(0, -1);
    let saved = [];
    if (intent.memory.note) {
      saved = [addToBoard(project, { text: intent.memory.note, source: 'writer' })];
    } else {
      // What "this" refers to: the ideas NIE last offered, else what the writer last said. NIE's own replies to board
      // commands ("Kept on your Idea Board…") and the commands themselves are skipped, so a second "remember this" is understood.
      const isBoardTurn = (m) => ['remember', 'recall'].includes(m.intent) || (m.role === 'assistant' && ['remember', 'recall'].includes(prior[prior.indexOf(m) - 1]?.intent));
      const turns = [...prior].reverse().filter((m) => !isBoardTurn(m));
      const lastAssistant = turns.find((m) => m.role === 'assistant');
      const lastUser = turns.find((m) => m.role === 'user' && m.intent !== 'develop-idea');
      if (lastAssistant?.ideas?.length) {
        saved = lastAssistant.ideas.map((i) => addToBoard(project, { text: i.text, lens: i.lens, kind: i.kind, source: 'nie' }));
      } else if (lastUser && words(lastUser.content).length >= 3) {
        saved = [addToBoard(project, { text: lastUser.content, source: 'writer' })];
      }
    }
    const added = saved.filter((r) => r.added);
    let reply;
    if (!saved.length) {
      reply = 'I don\'t have anything to keep yet. Tell me what to remember, like "remember: the cat can talk", or tap the star on any idea I give you.';
    } else if (!added.length) {
      reply = "That's already on your Idea Board.";
    } else {
      reply = `Kept on your Idea Board: ${added.map((r) => `"${clip(r.item.text, 120)}"`).join('; ')}.${added.length > 1 ? " Remove any you don't want from the board." : ''} Say "show my idea board" any time to see what I'm keeping for this project.`;
    }
    onToken?.(reply, reply);
    return this.#finish(project, intent, reply, 'builtin', false);
  }

  #finish(project, intent, reply, route, declined, extra = {}) {
    const ideas = extra.ideas ?? [];
    const meta = { route };
    // Who understood the message and how it was read ('model' = the language model read it; 'rules' = the built-in rules did).
    const understood = intent.reading ? { by: intent.reading.by, task: intent.reading.task, topic: intent.reading.topic ?? '', ...(intent.reading.overruled ? { overruled: intent.reading.overruled } : {}), ...(/^model-reading-/.test(intent.reading.why ?? '') ? { why: intent.reading.why } : {}) } : null; // 'why' only when a running model could not read it
    if (understood) meta.understood = understood;
    if (extra.read) meta.read = extra.read; // what was looked at, for a long text
    if (extra.looked) meta.looked = extra.looked; // ...said in words, shown under the reply
    if (extra.shape) meta.shape = extra.shape; // how the reply was built, so the next one is built differently
    if (extra.variety) meta.variety = extra.variety;
    if (extra.fallback) meta.fallback = extra.fallback; // why the offline model's answer was not used (kept so it can be shown or reported)
    if (extra.recalled?.length) meta.recalled = extra.recalled; // what was recalled from earlier in the project for this reply
    if (extra.agent) meta.agent = extra.agent; // what the idea agent did this turn (asked, offered, kept...), for the panel and for tests
    if (extra.library) meta.library = extra.library; // which subject a conversation about the library is on, and which follow-up this reply was
    if (extra.web) meta.web = extra.web; // a reply from the web: what was searched, the numbered sources, who wrote the answer
    if (ideas.length) project.conversation.library = emptyThread(); // idea cards take over "more" and "tell me more": the library thread ends
    if (ideas.length) Object.assign(meta, { ideas, lead: extra.lead ?? '', tail: extra.tail ?? '', kind: extra.kind ?? null, lens: extra.lens ?? null });
    appendMessage(project, 'assistant', reply, meta);
    project.conversation.suggestionShown = true;
    return {
      reply,
      intent,
      understood,
      route,
      declined,
      ideas,
      looked: extra.looked ?? '',
      lead: extra.lead ?? '',
      tail: extra.tail ?? '',
      kind: extra.kind ?? null,
      lens: extra.lens ?? null,
      agent: extra.agent ?? null,
      recalled: extra.recalled ?? [],
      library: extra.library ?? null,
      web: extra.web ?? null,
      suggestions: extra.suggestions ?? (ideas.length && extra.lens !== 'develop' ? ideaSuggestions({ lens: extra.lens ?? null, ideas }) : nextSuggestions({ intent, project })),
    };
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

export { leadNoun };
