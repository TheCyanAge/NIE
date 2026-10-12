import { STOPWORDS, clip, estimateTokens, fnv1a, stem, words } from '../util/text.js';

/**
 * Variety: why NIE's replies stop sounding the same.
 *
 * A 3B model, shown its own earlier replies, copies them: the same praise opener ("Great focus on ...!"), the same numbered list, the same
 * closing question ("Which of these ideas resonates with your vision ...?"). Four deterministic layers work against that, none of them with a model:
 *   - `shapeFor`: a different way to BUILD each reply (an instruction about form, never about content), never one of the last two used.
 *   - `avoidBlock`: what not to repeat (recent openings, questions already asked), for the user part of the prompt.
 *   - `scrubForPrompt`: the model's own past replies as they go back into its history, without the habits it would imitate.
 *   - `refine`: after the reply, remove praise openers and stock/repeated questions, and say when the reply still repeats NIE.
 * Everything here only REMOVES whole sentences or ADDS INSTRUCTIONS ABOUT FORM. Nothing rewrites, rewords or adds a word to a reply,
 * and every export tolerates any input (null, numbers, huge strings) because it runs on every message.
 */

const str = (v) => (typeof v === 'string' ? v : '');
const hasLetters = (s) => /[\p{L}\p{N}]/u.test(s);
const countWords = (s) => words(s).length;
const straight = (s) => s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
const isWs = (c) => c === 32 || (c >= 9 && c <= 13) || c === 0xa0 || c === 0x2028 || c === 0x2029 || c === 0xfeff || c === 0x3000;
/** Ends in '?' (closing quotes, brackets, emphasis marks and further '!' / '?' may follow). Scans from the end: a regex here is quadratic on a long run of '?'. */
function endsWithQ(s) {
  for (let i = s.length - 1; i >= 0; i--) {
    const c = s[i];
    if (c === '?') return true;
    if (!'!"\'”’)]*_'.includes(c)) return false;
  }
  return false;
}
/** Drop trailing '*' and '_' (markdown emphasis) without a regex that backtracks. */
function dropEmphasis(s) {
  let e = s.length;
  while (e > 0 && (s[e - 1] === '*' || s[e - 1] === '_')) e--;
  return s.slice(0, e);
}
const stripMarker = (s) => s.replace(/^(?:\d{1,3}[.)]|[-*•])\s+/, '');

/** Shorten to `n` words (adds an ellipsis only when something was cut). */
function trimWords(s, n) {
  const parts = s.trim().split(/\s+/);
  return parts.length <= n ? parts.join(' ') : `${parts.slice(0, n).join(' ')}…`;
}

// ── sentences ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A small splitter written for model replies (lines, "1." items, "?" and "!"), scanning by hand: a regex with nested
// quantifiers over a 50,000-character run of punctuation would be quadratic, and this runs on every reply.

const TERMINATORS = '.!?…';
const CLOSERS = '"\'”’)]*_'; // '*' and '_' close markdown emphasis: "**Great focus!** Let's dig" is two sentences, not one
const LIST_MARK = /^(?:\d{1,3}[.)]|[-*•])[ \t]+/;
const BARE_MARK = /^(?:\d{1,3}[.)]|[-*•])$/;
const ABBREV_TAIL = /(?:^|[\s("'])(?:mr|mrs|ms|dr|prof|sr|jr|st|vs|e\.g|i\.e|fig|cf|approx)\.$/i;
const INITIAL_TAIL = /(?:^|[\s("'])[A-HJ-Z]\.$/;

function pushSpan(src, start, end, item, out) {
  const text = src.slice(start, end);
  if (hasLetters(text) && !BARE_MARK.test(text)) out.push({ start, end, text, item });
}

function splitLine(src, s, e, item, out) {
  const mark = LIST_MARK.exec(src.slice(s, Math.min(e, s + 8)));
  let i = mark ? s + mark[0].length : s; // the "1." of an item belongs to its first sentence, so its dot is not a boundary
  let start = s;
  while (i < e) {
    if (!TERMINATORS.includes(src[i])) {
      i++;
      continue;
    }
    let j = i + 1;
    while (j < e && TERMINATORS.includes(src[j])) j++;
    let k = j;
    while (k < e && CLOSERS.includes(src[k])) k++;
    let boundary = k >= e || isWs(src.charCodeAt(k));
    if (boundary && k < e && /^[.…]+$/.test(src.slice(i, j))) {
      if (j - i === 1 && src[i] === '.') {
        const tail = src.slice(Math.max(s, i - 7), i + 1);
        if (ABBREV_TAIL.test(tail) || INITIAL_TAIL.test(tail)) boundary = false; // "Dr.", "e.g.", "J."
      }
      if (boundary) {
        let n = k;
        while (n < e && isWs(src.charCodeAt(n))) n++;
        if (n < e && src[n] !== src[n].toUpperCase()) boundary = false; // "vs. the", "e.g. a lighthouse", "well... maybe": a lowercase word continues the sentence
      }
    }
    if (boundary) {
      pushSpan(src, start, k, item, out);
      start = k;
      while (start < e && isWs(src.charCodeAt(start))) start++;
      i = start;
    } else {
      i = j;
    }
  }
  if (start < e) pushSpan(src, start, e, item, out);
}

/** Sentences with their offsets and whether they sit inside a list item (a "1." / "-" line and its indented continuation). */
function spansOf(text) {
  const src = str(text);
  const out = [];
  let lineStart = 0;
  let prevItem = false;
  while (lineStart <= src.length) {
    let lineEnd = src.indexOf('\n', lineStart);
    if (lineEnd === -1) lineEnd = src.length;
    let s = lineStart;
    let e = lineEnd;
    while (s < e && isWs(src.charCodeAt(s))) s++;
    while (e > s && isWs(src.charCodeAt(e - 1))) e--;
    if (s < e) {
      const item = LIST_MARK.test(src.slice(s, Math.min(e, s + 8))) || (prevItem && s - lineStart >= 2);
      prevItem = item;
      splitLine(src, s, e, item, out);
    } else {
      prevItem = false;
    }
    lineStart = lineEnd + 1;
  }
  return out;
}

/**
 * Sentences of a reply or any text. '?' and '!' are kept; every line and every list item starts a new sentence; the "1." of an item stays with
 * its first sentence; "Dr.", "e.g.", initials and "vs. the" do not end one. Never returns an empty string.
 */
export function splitSentencesLite(text) {
  return spansOf(text).map((s) => s.text);
}

/** The question sentences of a text (list markers removed), trimmed. */
export function questionsIn(text) {
  return spansOf(text)
    .filter((s) => endsWithQ(s.text))
    .map((s) => stripMarker(s.text).trim());
}

// ── praise ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// RULE for isPraiseOpener. A sentence is a praise opener when ALL of these hold:
//   1. It BEGINS with a praise lead (case-insensitive): Great, Good, Nice, Wonderful, Excellent, Fantastic, Awesome, Amazing, Brilliant,
//      Lovely, Terrific, Superb, Interesting, Intriguing, Fascinating, Compelling, Impressive, Perfect, Wow, "What a/an ...",
//      "That's|This is|It's a (great|fascinating|strong|...) ...", "Love this/the ...", "I love|like|enjoy|appreciate this/the/how ...",
//      "Thanks|Thank you for sharing ...", "Well done", "Your premise is intriguing", "Sounds great", "How exciting", "I'm intrigued by ...",
//      "Sure|Absolutely, let's ...", and the same after "Oh/Ah".
//   2. It READS as praise, not as a sentence that happens to start with the same word: it ends with '!', or it is just the lead ("Great."),
//      or the lead is followed within two or three words by a praise noun (focus, start, idea, premise, concept, choice, opening, setup,
//      direction, question, way, ...: "Great focus on the fog ...", "Interesting premise.") and that noun ENDS the phrase (at the end, or before
//      on/for/with/about/here/and/so). A warm lead before a comma ("Awesome, ...") counts when short.
//      Without such a sign the sentence is content: "Great Britain is where the story starts.", "Good and evil swap places in the third act.",
//      "Great opening lines tend to promise a question ...", "Perfect pitch is the problem ...", "Interesting choice of tense in chapter one makes ...".
//      ("Great"/"Good" before a capitalised word is a name, never praise. A sentence that ends with '!' needs no such proof of its noun.)
//   3. It is mostly praise: at most 30 words, and nothing substantial after a dash, semicolon, colon or a "because/which/but ..." clause (more
//      than 5 words there means the sentence is carrying content, so it is kept; `opensWithPraise` is the looser test that still tells `refine` to ask again).

const ADJ = 'great|good|nice|wonderful|excellent|fantastic|awesome|amazing|brilliant|lovely|terrific|superb|interesting|intriguing|fascinating|compelling|impressive|perfect';
const ADJ2 = `${ADJ}|powerful|strong|rich|vivid|striking|thoughtful|clever|smart|solid|promising|haunting|evocative`;
const WARM = new Set(['great', 'wonderful', 'excellent', 'fantastic', 'awesome', 'amazing', 'brilliant', 'lovely', 'terrific', 'superb', 'impressive', 'perfect']);
const NOUN =
  'focus|start|beginning|idea|premise|concept|choice|opening|setup|set-up|direction|question|way|angle|approach|instinct|thinking|observation|detail|image|hook|twist|thought|point|catch|call|job|work|foundation|spark|theme|vision|take|insight|notion|effort|progress|pitch|step|combination|mix|blend';
// A praise noun counts only where a praise sentence would put it: at the end, or before "on/for/with/about/here/and/so" ("Great focus on the fog").
// Followed by anything else it is the start of a noun phrase or a clause, i.e. content: "Great opening lines tend to ...", "Perfect pitch is the
// problem ...", "Interesting choice of tense in chapter one makes ...". A sentence that ends with '!' needs no such check (`LOOSE`).
const PRAISE_FOLLOW = '(?=\\s*(?:[!.,;:?—–]|-\\s|$)|\\s+(?:on|for|with|about|here|there|and|so)\\b)';
const nounWithin = (filler, follow = PRAISE_FOLLOW) => new RegExp(`^[\\s,]*(?:[\\p{L}'-]+\\s+){0,${filler}}?(?:${NOUN})\\b${follow}`, 'iu');
const NOUN2 = nounWithin(2);
const NOUN3 = nounWithin(3);
const NOUN4 = nounWithin(4);
const NOUN2_LOOSE = nounWithin(2, '');
const NOUN3_LOOSE = nounWithin(3, '');
const RE_ADJ = new RegExp(`^(?:(?:really|very|so|truly|just)\\s+)?(${ADJ})\\b`, 'i');
const RE_WHATA = /^what an?\b/i;
const RE_THATS = new RegExp(`^(?:that|this|it)(?:'s| is| was| sounds like| seems like) (?:a|an|such a|quite a) (?:(?:really|very|truly|such|incredibly|genuinely) )?(?:${ADJ2})\\b`, 'i');
const RE_SOUNDS = new RegExp(`^(?:that|this|it) (?:sounds|seems|looks) (?:really |very |truly )?(?:${ADJ2})\\b`, 'i');
const RE_SOUNDS_BARE = new RegExp(`^sounds (?:like (?:a|an) )?(?:really |very |truly )?(?:${ADJ2})\\b`, 'i');
const RE_THATS_ADJ = new RegExp(`^(?:that|this|it)(?:'s| is| was) (?:really |very |truly |so |quite )?(?:${ADJ2})\\b`, 'i');
const RE_YOUR = new RegExp(`^your (?:[\\p{L}'-]+ ){1,8}?(?:is|are|sounds?|seems?|looks?|feels?|has|have) (?:such |really |very |truly |quite |so |already )?(?:a |an )?(?:${ADJ2})\\b`, 'iu');
const RE_HOWADJ = /^how (?:exciting|interesting|fascinating|intriguing|wonderful|fun|cool|great|lovely)\b/i;
const RE_IMPRESSED = /^i(?:'m| am) (?:so |really |very |truly )?(?:intrigued|impressed|fascinated|delighted|thrilled|excited)\b/i;
const RE_HAPPY = /^i(?:'m| am| would be|'d be) (?:so |really |very )?(?:happy|glad|excited|delighted|thrilled|pleased) to\b/i;
const RE_THANKS = /^(?:thanks|thank you)\b(?: so much| very much| a lot)?(?=\s*[!,.:]|\s*$|\s+for (?:sharing|telling|showing|giving|laying|providing|being|that|this|your|those|these|the (?:detail|context|background|extra|update|description))\b)/i;
const RE_ILOVE = /^i(?:'d| would)? (?:really |absolutely |totally |truly )?(?:love|like|enjoy|appreciate|admire) (this|that|the|how|your|it|these|those|where|its)\b/i;
const RE_LOVE = /^love (this|that|the|it|how|your|these|those|what|where)\b/i;
const RE_WOW = /^wow\b/i;
const RE_DONE = /^(?:well|nicely) done\b/i;
const RE_FILLER = /^(?:absolutely|certainly|of course|sure|sure thing|definitely|indeed|exactly)\s*[!.,]*$/i;
const RE_FILLER_LEAD = /^(?:absolutely|certainly|of course|sure|definitely)[,!]\s*(?:let'?s|i(?:'d| would| can| will|'ll)|here(?:'s| are| is))\b/i; // "Sure, let's explore this."


/** A sentence as the praise test sees it: no list marker, no markdown emphasis or quotes around it. (Longer than any praise sentence is cut: it cannot be one.) */
const tidyText = (s) => dropEmphasis(stripMarker(straight(str(s).slice(0, 2100)).trim()).replace(/^[*_"'\s]+/, '')).trim();

/** Looser than `isPraiseOpener`: the sentence leads with praise, however much content is attached to it. */
function opensWithPraise(s) {
  if (!s || s.length > 2000) return false;
  s = s.replace(/^(?:oh|ooh|ah|aha|whoa)[,!.]*\s+(?=\p{L})/iu, ''); // "Oh, what a fascinating idea!"
  const end = /!["')\]]*$/.test(s);
  let m = RE_ADJ.exec(s);
  if (m) {
    const rest = s.slice(m[0].length);
    if (/^\s+\p{Lu}\p{Ll}/u.test(rest)) return false; // "Great Britain", "Good Omens": a name ("EXCELLENT CHOICE!" is only loud)
    if (/^[\s!.…]*$/.test(rest)) return true; // "Great!"
    if (/^\s*[,;:—–-]/.test(rest)) return WARM.has(m[1].toLowerCase()) && (end || countWords(s) <= 9); // "Awesome, let's dig in!"
    if ((end ? NOUN2_LOOSE : NOUN2).test(rest)) return true; // "Great focus on ...", "Interesting premise."
    return end && /^\s+(?:on|for|with|of|about|to|in|that|how|you|your|the|this|these|those|it)\b/i.test(rest); // "Great to see ...!"
  }
  if ((m = RE_WHATA.exec(s))) return (end ? NOUN3_LOOSE : NOUN3).test(s.slice(m[0].length)) || (end && countWords(s) <= 8); // "What a striking image!"
  if ((m = RE_THATS.exec(s))) return end || NOUN2.test(s.slice(m[0].length)); // "That's a fascinating premise!"
  if (RE_SOUNDS.test(s) || RE_SOUNDS_BARE.test(s) || RE_HAPPY.test(s) || RE_IMPRESSED.test(s)) return end || countWords(s) <= 8; // "That sounds fascinating.", "Sounds great!", "I'd be happy to help!"
  if (RE_THATS_ADJ.test(s)) return end || countWords(s) <= 4; // "That's interesting.", "This is fascinating!"; with more words it is a claim ("That's strong because ...")
  if (RE_YOUR.test(s)) return end || countWords(s) <= 7; // "Your premise is intriguing!", but "Your draft is strong on atmosphere but thin on motive." is an assessment
  if (RE_HOWADJ.test(s)) return end || countWords(s) <= 3; // "How exciting!" ("How exciting the chase is depends on ..." is a sentence about something)
  if (RE_THANKS.test(s)) return true; // "Thanks for sharing"
  if ((m = RE_ILOVE.exec(s)) || (m = RE_LOVE.exec(s))) return end || m[1].toLowerCase() === 'how' || NOUN4.test(s.slice(m[0].length));
  if (RE_WOW.test(s)) return end || countWords(s) <= 6;
  if (RE_DONE.test(s) || RE_FILLER.test(s)) return true;
  if (RE_FILLER_LEAD.test(s)) return end || countWords(s) <= 9;
  return false;
}

// More than a few words after a dash, colon, semicolon or a "because/which/but ..." clause is content, not praise: dropping it would drop what NIE said.
const TAIL_SPLIT = /[—–;:]|\s-\s|,?\s(?:because|since|whereas|which|but|however|although|though|while|so that)\s/gi;
function hasContentTail(s) {
  for (const m of s.matchAll(TAIL_SPLIT)) if (countWords(s.slice(m.index + m[0].length)) > 5) return true;
  return false;
}

/** True when the sentence is praise or filler at the start of a reply ("Great focus!", "That's a fascinating premise!"). See the rule above. */
export function isPraiseOpener(sentence) {
  const s = tidyText(str(sentence).slice(0, 600));
  if (!s || s.length > 320 || endsWithQ(s)) return false;
  if (countWords(s) > 30) return false;
  return opensWithPraise(s) && !hasContentTail(s);
}

// ── stock questions ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Steering questions that fit any story and say nothing about this one. Each pattern is anchored (start or end) so a specific question that
// merely begins the same way ("What do you think the keeper hears?", "Which of those two do you want the closing image to be?") is NOT stock.

const THESE = '(?:these|those|the above|them|the following)';
const GENERIC = '(?:ideas?|directions?|options?|angles?|paths?|approaches|approach|possibilities|suggestions?|avenues?|concepts?|sparks?|threads?|twists?|thoughts?|scenarios?|premises|premise)';
const STEER = "(?:do you|would you|did you|are you|resonates?|appeals?|speaks?|feels?|sounds?|stands? out|interests?|excites?|intrigues?|works?|seems?|is (?:most|more|the)|are (?:most|more|the)|should we|shall we)";
const STOCK = [
  new RegExp(`^which (?:one )?(?:of )?${THESE}(?:(?: (?:two|three|four|five|few))? ${GENERIC})? ${STEER}\\b`),
  // "Which idea resonates?" is generic; "Which one would you spend a week on?" asks something particular, so only the verbs of appeal count here
  new RegExp(`^which (?:one|idea|direction|option|angle|approach)s? (?:of ${THESE} )?(?:resonates?|appeals?|speaks?|stands? out|interests?|excites?|intrigues?|feels? (?:right|best)|sounds? (?:best|good|right))\\b`),
  // "Which of these ideas, if any, resonates with you most?": a generic noun, then a steering verb a few words later
  new RegExp(`^which (?:one )?(?:of )?${THESE}(?: (?:two|three|four|five|few))? (?:ideas?|directions?|options?|angles?|approaches|suggestions?|possibilities)\\b[^?]{0,60}\\b(?:resonates?|compelling|appeals?|speaks?|stands? out|excites?|intrigues?|interests?|works? (?:best|better)|feels? (?:right|best)|sounds? (?:best|good|right)|you (?:prefer|like|find|think|want|choose|pick))`),
  /\bdo you see (?:(?:any )?room for|another|a different|an alternative|any other|a better|a new|other) (?:a |an |another |any |other )?(?:different |other |new |further |alternative |better )?(?:direction|angle|approach|option|avenue)s?\b/,
  /^(?:what do you think|what are your thoughts|what do you make of (?:this|that|these|those|it)|what is your take|what's your take|what are you thinking)(?: (?:of|about|on) (?:this|that|these|those|it|all (?:this|that)|the above|them|so far)(?: (?:ideas|directions|options|suggestions|thoughts))?)?[\s?.!]*$/,
  /^how (?:does|do) (?:that|this|it|these|those|all that|these (?:ideas|directions|options)|those (?:ideas|directions|options)) (?:sound|feel|sit|strike you|land|work for you|resonate)(?: with you| to you| for you| so far)*[\s?.!]*$/,
  /^how do you (?:feel|like|find) (?:about )?(?:this|that|these|those|it|the above|all (?:this|that))(?: (?:ideas|directions|options|suggestions))?[\s?.!]*$/,
  /^(?:does|do) (?:that|this|it|these|those|any of (?:these|those|this|them)|one of (?:these|those|them)|either of (?:these|those|them))(?: (?:ideas|directions|options|angles|suggestions))? (?:resonate|resonates|sound|sounds|feel|feels|work|works|appeal|appeals|speak|speaks|ring|rings|click|clicks|help|helps|make sense|spark|sparks|inspire|inspires)(?: (?:good|right|true|well|with you|for you|to you|at all|any better|anything|any ideas|something|like a good (?:start|direction|fit)))*[\s?.!]*$/,
  /^(?:does|do) (?:that|this|it|these|those)(?: ideas)? (?:sound|seem|feel) like something you(?:'d| would)?\b/,
  /^(?:would you like|do you want|shall we|should we) (?:me )?(?:to )?(?:explore|dive|dig|go deeper|expand|develop|talk|discuss|brainstorm|continue|focus|work on|pursue|elaborate|unpack|flesh|move on|suggest|look at|look into)\b/,
  /^(?:what|which) (?:direction|path|angle|approach|route|way)(?: (?:forward|next))? (?:do you want|would you like|are you leaning|should we|are you thinking|feels|do you prefer|do you see|sounds|appeals)\b/,
  /^where (?:would you like|do you want|should we) (?:to )?(?:go|take|start|begin|focus|head)\b/,
  /^what would you like to (?:do|explore|focus on|work on|discuss|dive into|tackle|add|change|try|know|see|talk about)(?: (?:next|first|now|from here|more))?[\s?.!]*$/,
  /^what (?:resonates|stands out|appeals|speaks|jumps out|catches your eye)(?: (?:most|the most))?(?: (?:with|to|for) you)?[\s?.!]*$/,
  /^(?:is|are) there (?:anything|something|anywhere) (?:else )?(?:specific |particular |in particular )?(?:that )?(?:you(?:'d| would)? (?:like|want|need|wish|prefer)|i can (?:help|do|assist)|else)\b/,
  /^is there (?:a|an) (?:particular|specific) (?:direction|angle|aspect|idea|part|element|area|theme)\b[^?]{0,40}\byou(?:'d| would)? (?:like|want|prefer)\b/,
  /^anything else(?: (?:you(?:'d| would) like|i can|you want|to (?:add|explore|discuss)))/,
  /^(?:how|what) (?:else )?(?:can|may|could) i (?:help|assist|support)\b/,
  /^let me know\b/,
  /^feel free to (?:share|ask|let me know|tell me|reach out|explore|add)\b/,
  /^i(?:'d| would) (?:love|like) to (?:hear|know|see) (?:your|what|which|how|more)\b/,
  /^do you have any (?:thoughts|questions|feedback|preferences|other (?:ideas|thoughts|questions)|ideas of your own)\b/,
  /^(?:does|is) (?:that|this|it) (?:make sense|helpful|clear|useful|what you(?:'re| are) looking for)[\s?.!]*$/,
  /^(?:which|what) (?:do you|would you) (?:prefer|choose|pick|like best)[\s?.!]*$/,
  /^which (?:one )?(?:do|would) you (?:prefer|choose|pick|like|favou?r)\b/,
  /^(?:any |your |so |and )?(?:thoughts|feedback|preferences|reactions?|takes?)(?: (?:on|about) (?:these|those|this|that|them|the above))?[\s?.!]*$/,
  /^(?:so )?(?:what|where)(?:'s| is)? next[\s?.!]*$/,
  /^what next[\s?.!]*$/,
  /^where (?:shall|should|do|can|would) (?:we|you) (?:go|take (?:this|it)|head|start|begin|move) (?:from here|next|now)\b/,
  /^how (?:would you like|do you want|shall we|should we) to (?:proceed|continue|move forward|go on|go from here|take (?:this|it) (?:from here|further|forward))\b/,
  /^(?:want|ready|care) (?:to|me to) (?:explore|dive|dig|continue|go deeper|expand|develop|talk|discuss|brainstorm|focus|move on|pick|choose|try|take)(?: (?:into|on|about|in|through|of|any|one|some|more|these|those|this|that|it|them|further|deeper|together|now|next|first|ideas|directions|options|angles))*[\s?.!]*$/,
  /^want (?:more|another|some more|a few more)\b/,
];
const FILLER_LEAD = /^(?:(?:also|and|so|now|okay|ok|well|finally|lastly|but|then|or)\b[,\s]*)+/;

// A steering question has no story in it. The patterns above name the common ones; this catches the many ways of asking them by CLOSED VOCABULARY:
// a question is generic when every word in it is a function word, a generic noun ("idea", "direction", "vision") or a steering verb ("prefer",
// "resonate", "explore"), it contains a steering verb, and it points back at the list ("these", "any of these", "more ideas"). One word about the
// story ("keeper", "scene", "she") makes it specific, so "Which idea would you hand to the keeper?" and "Do you want them to know?" are never stock.
// "this/that/it" are only read as the subject of the question ("Does this fit your vision?"), never as a word inside it.
const FN_WORDS = new Set(
  ('a an the of to in on for with about at as be is are was were am do does did will would could can should shall may might you your yours i me my we us our ' +
    'these those any some all each both either neither none what which how where or and but if so than more most other others further just really very too no not now here there then up out over into from by ' +
    'have has had been get got let also still yet already maybe perhaps among between toward towards off away ahead along back down far well enough much many few').split(' ')
);
const GENERIC_WORD = /^(?:ideas?|directions?|options?|angles?|approach(?:es)?|paths?|possibilit(?:y|ies)|suggestions?|concepts?|visions?|thoughts?|preferences?|favou?rites?|versions?|routes?|avenues?|threads?|twists?|sparks?|premises?|scenarios?|stor(?:y|ies)|drafts?|ways?|ones?|things?|something|anything|everything|else|another|different|new|same|two|three|four|five|first|second|third|last|next|mind|eyes?|attention|start|starting|point|sense|reactions?|takes?|opinions?|feedback|input|feelings?|best|better|good|great|right|true|natural|closest|strongest|compelling|interesting|exciting|promising|useful|helpful|clear|deeper|particular|specific|certain|similar|appealing)$/;
const STEER_STEMS = 'lik|lov|want|wish|prefer|think|feel|see|mak|sound|seem|look|fit|match|align|resonat|appeal|interest|grab|spark|strik|stand|catch|speak|click|ring|inspir|excit|intrigu|captur|suit|agre|pursu|explor|develop|expand|div|dig|continu|proceed|focus|tackl|elaborat|lean|consider|choos|pick|select|hop|wonder';
const STEER_WORD = new RegExp(`^(?:${STEER_STEMS}|preferences?|favou?rites?|opinions?|reactions?|thoughts?)(?:e|es|ed|d|s|ing)?$`);
const VERB_WORD = new RegExp(`^(?:${STEER_STEMS}|work|help|go|take|move|begin|start|try|add|change|know|tell|share|hear|settl|stick|keep|build)(?:e|es|ed|d|s|ing)?$`);
const POINTS_BACK = /^(?:these|those|any|ones?|ideas?|directions?|options?|angles?|approach(?:es)?|paths?|possibilit(?:y|ies)|suggestions?|concepts?|visions?|thoughts?|preferences?|favou?rites?|versions?|routes?|avenues?|sparks?|twists?|premises?|scenarios?|reactions?|opinions?|takes?|feedback|input|something|anything|else|another|different|more|next|further|deeper|forward|continu(?:e|es|ing)|proceed(?:s|ing)?)$/;
const SUBJECT = /^(?:(?:do|did|would|could|can) you (?:think|feel|say|find|believe) )?(?:(?:does|do|did|would|could|can|will|is|are) )?(?:this|that|it|these|those|(?:any|one|either|all|none|each) of these)\b/;

function wordOk(w, prev) {
  if (w === 'them') return prev === 'of';
  if (/n't$/.test(w)) return true;
  const base = w.replace(/'(?:d|re|ll|s|ve|m)$/, '');
  return FN_WORDS.has(base) || GENERIC_WORD.test(base) || VERB_WORD.test(base);
}

function isGenericByVocabulary(s) {
  if (!endsWithQ(s) || /[^\x20-\x7e]|[0-9"]/.test(s)) return false;
  let t = s
    .replace(/\b(any|one|some|all|either|none|each|both|most|many|few) of (?:them|it|this|that)\b/g, '$1 of these')
    .replace(/\b(?:this|that) (idea|direction|option|angle|approach|path|take|concept|version|suggestion|possibility|premise|route)\b/g, 'these $1');
  const subject = SUBJECT.exec(t);
  if (subject) t = t.slice(subject[0].length); // what is asked ABOUT "this" is what must be generic
  const toks = t.match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
  if (toks.length < (subject ? 1 : 2) || toks.length > 18) return false;
  const inMind = /\bin mind\b/.test(t); // "Do you have another direction in mind?" ("What would change your mind?" is a real question)
  let steer = inMind;
  let back = inMind || Boolean(subject) || /^what (?:feel|resonat|appeal|stand|excit|intrigu|interest|speak)/.test(t); // "What stands out to you most?"
  for (let i = 0; i < toks.length; i++) {
    if (!wordOk(toks[i], toks[i - 1])) return false;
    if (STEER_WORD.test(toks[i]) || (subject && /^(?:work|help)(?:s|ed|ing)?$/.test(toks[i]))) steer = true;
    if (POINTS_BACK.test(toks[i])) back = true;
  }
  // "Is this a good direction?": about the direction itself, with nothing about the story in it
  if (subject && !steer) return toks.some((w) => /^(?:right|good|great|better|best|natural|strong|promising|fit|compelling)$/.test(w)) && toks.some((w) => /^(?:directions?|paths?|angles?|approach(?:es)?|options?|ideas?|starts?|fit|ways?)$/.test(w));
  return steer && back;
}

/** True for a generic steering question that would fit any story ("Which of these ideas resonates with you?", "What do you think?"). */
export function isStockQuestion(sentence) {
  let s = straight(str(sentence).slice(0, 400)).trim();
  if (!s || s.length > 320) return false;
  s = dropEmphasis(stripMarker(s).replace(/^[*_"'\s]+/, '')).toLowerCase().replace(/\s+/g, ' ').replace(FILLER_LEAD, '').trim();
  if (!s) return false;
  return STOCK.some((re) => re.test(s)) || isGenericByVocabulary(s);
}

// ── similarity ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
// MEASURE for `similarity(a, b)` (symmetric, 0..1):
//   content = Jaccard overlap of the two sets of CONTENT TERMS: lowercase words with STOPWORDS (and "n't" words) removed, "'s" cut, crudely stemmed.
//   Steering words are first folded into a few concepts, because paraphrased stock questions share meaning, not words: idea/direction/option/
//   angle/approach... -> one "thing", resonate/compelling/appeal/intrigue/prefer -> one "appeal", other/another/different/alternative -> "other",
//   explore/"room for" -> "open". So "Which of these ideas resonates with your vision, or do you see room for a different direction?" and
//   "Which of these directions do you find most compelling, or do you see another angle to explore?" score about 0.7, while two questions that
//   only share the name of a character score well under 0.25.
//   trigrams = Jaccard overlap of the word TRIGRAMS (stems, stopwords kept, but a trigram counts only if it holds a content word), which
//   catches the same phrase reused. The result is the larger of the two. Identical text is 1; nothing in common (or no content words) is 0.

const FOLDS = [
  [/^(?:ideas?|directions?|options?|angles?|approach(?:es)?|possibilit(?:y|ies)|suggestions?|avenues?|concepts?)$/, '#thing'],
  [/^(?:resonat(?:e|es|ed|ing)|compelling|appeal(?:s|ed|ing)?|intrigu(?:e|es|ed|ing)|excit(?:e|es|ed|ing)|prefer(?:s|red)?)$/, '#appeal'],
  [/^(?:other|another|different|alternatives?|else|further)$/, '#other'],
  [/^(?:explore|explores|explored|exploring)$/, '#open'],
];

function wordsOf(text) {
  const out = [];
  for (const w of words(straight(str(text)).toLowerCase().replace(/\broom for\b/g, 'explore'))) {
    const x = w.replace(/'s$/, '').replace(/'+$/, '');
    if (x) out.push(x);
  }
  return out;
}

const isContent = (w) => !STOPWORDS.has(w) && !/n't$/.test(w);
const foldWord = (w) => {
  for (const [re, id] of FOLDS) if (re.test(w)) return id;
  return stem(w);
};

function trigramSet(ws, { stemmed = false, contentOnly = false } = {}) {
  const set = new Set();
  const keep = contentOnly ? ws.map(isContent) : null;
  const toks = stemmed ? ws.map(stem) : ws;
  for (let i = 0; i + 2 < toks.length; i++) {
    if (keep && !(keep[i] || keep[i + 1] || keep[i + 2])) continue;
    set.add(`${toks[i]} ${toks[i + 1]} ${toks[i + 2]}`);
  }
  return set;
}

function profile(text) {
  const ws = wordsOf(text);
  const terms = new Set();
  for (const w of ws) if (isContent(w)) terms.add(foldWord(w));
  return { key: ws.join(' '), terms, grams: trigramSet(ws, { stemmed: true, contentOnly: true }) };
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const x of small) if (large.has(x)) shared++;
  return shared / (a.size + b.size - shared);
}

function simOf(a, b) {
  if (a.key && a.key === b.key) return 1;
  if (!a.terms.size || !b.terms.size) return 0;
  return Math.max(jaccard(a.terms, b.terms), jaccard(a.grams, b.grams));
}

/** How alike two texts are, 0..1 (see the measure above). Symmetric; 1 for the same words; 0 when they share no content word. */
export function similarity(a, b) {
  return simOf(profile(a), profile(b));
}

// ── what NIE said lately ────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * NIE's fixed notes (a decline, a canned answer) are not its voice and must not count as "how it has been replying". The orchestrator stores a
 * message's `route` on the message itself and does not store `declined`, so a built-in route is what marks them there; `declined` is honoured too.
 */
const isFixedNote = (m) => m.declined === true || m.meta?.declined === true || m.route === 'builtin' || m.meta?.route === 'builtin';

function recentMessages(history, n) {
  const h = Array.isArray(history) ? history : [];
  const cap = Number.isFinite(n) ? Math.max(0, Math.min(50, Math.floor(n))) : 5;
  const out = [];
  for (let i = h.length - 1; i >= 0 && out.length < cap; i--) {
    const m = h[i];
    if (m && typeof m === 'object' && m.role === 'assistant' && typeof m.content === 'string' && m.content.trim() && !isFixedNote(m)) out.push(m);
  }
  return out.reverse();
}

/** The contents of the last `n` replies NIE gave in conversation (oldest first), without its fixed notes. */
export function recentAssistant(history, n = 5) {
  return recentMessages(history, n).map((m) => m.content);
}

const MAX_REPLY_CHARS = 12000; // a reply is at most ~3,000 characters; only a broken one is longer, and then the opening and the end are what count

function readReplies(history, n) {
  return recentMessages(history, n).map((m) => {
    const c = m.content;
    const content = c.length > MAX_REPLY_CHARS ? `${c.slice(0, 2000)}\n\n${c.slice(-(MAX_REPLY_CHARS - 2000))}` : c;
    const spans = spansOf(content);
    return { content, shape: m.shape, spans, first: spans[0] ?? null, questions: spans.filter((s) => endsWithQ(s.text)) };
  });
}

/** What the last replies looked like: how they opened, what they asked, and how they were built. */
export function memoryOf(history, n = 6) {
  const openers = [];
  const questions = [];
  const shapes = [];
  const seen = new Set();
  for (const r of readReplies(history, n)) {
    if (r.first) openers.push(trimWords(stripMarker(r.first.text), 14));
    for (const q of r.questions) {
      const text = trimWords(stripMarker(q.text), 25);
      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      questions.push(text);
    }
    if (typeof r.shape === 'string' && r.shape) shapes.push(r.shape);
  }
  return { openers, questions, shapes };
}

const PRAISE_LINE = 'Do not open with praise or an exclamation.';
const AVOID_TOKENS = 120;
// Example counts and lengths tried in turn until the block fits its budget (a small model has little room to spare).
const AVOID_TRIES = [
  { openers: 2, questions: 3, chars: 70 },
  { openers: 2, questions: 2, chars: 60 },
  { openers: 1, questions: 2, chars: 50 },
  { openers: 1, questions: 1, chars: 40 },
  { openers: 0, questions: 1, chars: 40 },
  { openers: 0, questions: 1, chars: 28 },
];

function distinct(list, text, threshold) {
  const p = profile(text);
  if (!list.some((x) => simOf(p, x.p) >= threshold)) list.push({ text, p });
}

/**
 * What the model must not repeat, for the USER part of the prompt (a 3B model obeys what is next to the question far more than what the system
 * prompt said earlier). Lists the recent openings and the questions NIE already asked, newest first, as few examples as fit in 120 tokens.
 * '' when NIE has not replied yet.
 */
export function avoidBlock(history) {
  const replies = readReplies(history, 6).reverse(); // newest first
  if (!replies.length) return '';
  const openers = [];
  const closers = [];
  const inLists = [];
  for (const r of replies) {
    if (r.first && !r.first.item) {
      const t = tidyText(r.first.text);
      if (!opensWithPraise(t)) distinct(openers, trimWords(t, 14), 0.6); // praise openings are already forbidden by the first line
    }
    // A closing question is the habit; a list item's question is an idea. Only the last few of a reply matter, and only a handful are ever shown.
    for (const q of r.questions.slice(-6).reverse()) {
      const list = q.item ? inLists : closers;
      if (list.length < 4) distinct(list, trimWords(stripMarker(q.text), 25), 0.6);
    }
  }
  const asked = closers.length ? closers : inLists;
  const quote = (e, chars) => `"${clip(e.text, chars).replace(/"/g, "'")}"`;
  for (const t of AVOID_TRIES) {
    const parts = [PRAISE_LINE];
    const op = openers.slice(0, t.openers);
    const qs = asked.slice(0, t.questions);
    if (op.length) parts.push(`Do not start with any of the openings you used lately: ${op.map((e) => quote(e, t.chars)).join(', ')}.`);
    if (qs.length) parts.push(`You have already asked: ${qs.map((e) => quote(e, t.chars)).join(', ')}. Do not ask those again or anything like them.`);
    const block = parts.join(' ');
    if (estimateTokens(block) <= AVOID_TOKENS) return block;
  }
  return PRAISE_LINE;
}

// ── cleaning a reply ────────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Remove [from, to) and the gap that joined it to its neighbours, leaving everything else byte for byte. Of the two gaps (before and after the
 * cut) the one with more line breaks stays, so a paragraph that followed a list on a blank line is not glued to the list's last item.
 */
function cut(text, from, to) {
  const before = text.slice(0, from);
  const after = text.slice(to);
  const next = after.search(/\S/);
  if (next === -1) return before.trimEnd() + after; // it was the end of the reply: close the gap before it
  const rest = after.slice(next);
  const kept = before.trimEnd();
  if (!kept) return before + rest; // it was the start of the reply
  const gapBefore = before.slice(kept.length);
  const gapAfter = after.slice(0, next);
  const lines = (g) => g.split('\n').length;
  return kept + (lines(gapAfter) > lines(gapBefore) ? gapAfter : gapBefore) + rest;
}

// Two ways a cut could leave a reply that is not whole. It would begin in the middle of a thought: "And ...", "Because ...", a lowercase word, or
// "It/They/She ..." whose antecedent was the praise just cut. Or it would end on a colon, semicolon, comma or dash, announcing something that is not there.
const startsDangling = (text) => {
  const t = text.trimStart();
  return /^\p{Ll}/u.test(t) || /^(?:and|or|because|plus|it|its|they|their|he|she|his|her|such)\b/i.test(t);
};
const endsOpen = (text) => /[:;,—–-]\s*$/.test(text);

/** Sentences grouped into blocks: a paragraph, or a run of list items, or the lines between them. */
function blocksOf(src, spans) {
  const blocks = [];
  let cur = null;
  for (const sp of spans) {
    const prev = cur ? cur.at(-1) : null;
    if (!cur || sp.item !== prev.item || /\n[ \t\r]*\n/.test(src.slice(prev.end, sp.start))) {
      cur = [];
      blocks.push(cur);
    }
    cur.push(sp);
  }
  return blocks;
}

const SIMILAR_QUESTION = 0.5; // a question this alike to one NIE asked in its last replies is a repeat
const SIMILAR_OPENER = 0.6;
const SAME_RUN = 0.35; // share of this reply's word trigrams already in the previous reply
const MAX_QUESTIONS = 2;
const MAX_ASKED = 60; // the questions of the last replies that a new one is compared with (newest kept)

/**
 * `simOf` >= threshold AND enough in common to mean it: the same words, or at least two content terms. Jaccard on one or two terms is too
 * coarse ("Who is the keeper?" / "Why is the keeper afraid?" share one term and score 0.5), and a question about the same person is not a repeat.
 */
function alike(p, q, threshold) {
  if (simOf(p, q) < threshold) return false;
  if (p.key === q.key) return true;
  let shared = 0;
  for (const t of p.terms) if (q.terms.has(t)) shared++;
  return shared >= 2 || (shared >= 1 && shared === p.terms.size && shared === q.terms.size);
}

/**
 * The parts of a reply that may be removed whole, last first: a stock or repeated question that stands alone as a paragraph (or as the lines
 * between a list and a paragraph), or that ends the reply. Never anything inside a list item, never part of a sentence.
 */
function* removals(src, spans, asked) {
  const kindOf = (sp) => {
    if (sp.item) return null;
    if (isStockQuestion(sp.text)) return 'stock-question';
    if (asked.length && endsWithQ(sp.text)) {
      const p = profile(sp.text);
      if (asked.some((a) => alike(p, a, SIMILAR_QUESTION))) return 'repeat-question';
    }
    return null;
  };
  const blocks = blocksOf(src, spans);
  for (let bi = blocks.length - 1; bi >= 0; bi--) {
    const block = blocks[bi];
    const kinds = [];
    for (const sp of block) {
      const k = kindOf(sp);
      if (!k) break;
      kinds.push(k);
    }
    if (kinds.length === block.length) {
      yield { from: block[0].start, to: block.at(-1).end, drops: block.map((sp, i) => ({ kind: kinds[i], text: sp.text })) };
    } else if (bi === blocks.length - 1) {
      // the last block: only its closing sentences go, the rest of the paragraph stays
      let r = block.length;
      const tail = [];
      while (r > 0) {
        const k = kindOf(block[r - 1]);
        if (!k) break;
        tail.unshift({ kind: k, text: block[r - 1].text });
        r--;
      }
      if (tail.length) yield { from: block[r].start, to: block.at(-1).end, drops: tail };
    }
  }
}

/** Leading praise first (at most two sentences), then stock/repeated questions from the end; nothing that would leave fewer than `minWords` words. */
function clean(text, { minWords, asked }) {
  let cur = text;
  const praise = [];
  for (let i = 0; i < 2; i++) {
    const first = spansOf(cur)[0];
    if (!first || first.item || !isPraiseOpener(first.text)) break;
    const next = cut(cur, first.start, first.end);
    if (countWords(next) < minWords || startsDangling(next)) break; // what follows leans on the praise ("It works because ..."): keep both, `refine` asks again
    praise.push({ kind: 'praise', text: first.text });
    cur = next;
  }
  const questions = [];
  for (let guard = 0; guard < 8; guard++) {
    let done = false;
    for (const r of removals(cur, spansOf(cur), asked)) {
      const next = cut(cur, r.from, r.to);
      // not "Here are some thoughts:" with nothing after the colon; and not a reply that now opens on "It works because ..."
      if (countWords(next) < minWords || endsOpen(next) || (!cur.slice(0, r.from).trim() && startsDangling(next))) continue;
      questions.unshift(...r.drops); // each removal sits before the last one, so the list stays in reading order
      cur = next;
      done = true;
      break;
    }
    if (!done) break;
  }
  return { text: cur, dropped: [...praise, ...questions] };
}

/** The reply as it should go back into the MODEL's history: no praise opener, no stock question, everything else (numbered ideas too) kept. */
export function scrubForPrompt(content) {
  const original = str(content);
  if (!original.trim()) return original;
  const { text } = clean(original, { minWords: 6, asked: [] });
  return text.trim() ? text : original;
}

/**
 * Clean a fresh reply of what makes NIE sound the same each time, and say whether it still does.
 * Only whole sentences are removed (never reworded, never added): a leading praise sentence; a stock or repeated question that stands alone as a
 * paragraph or ends the reply. Nothing inside a list item is touched, and nothing is removed when fewer than 8 words would be left.
 * `retry` is true when, after cleaning, the reply still opens with praise, opens like a recent reply, repeats the previous reply's wording,
 * or asks more than two questions (outside list items, whose questions are the ideas themselves), or what is left is only praise and a
 * generic question.
 */
export function refine(reply, opts) {
  const original = str(reply);
  const result = { text: original, dropped: [], retry: false, reasons: [] };
  if (!hasLetters(original)) return result;
  const prior = readReplies(opts?.history, 6);
  const asked = prior.flatMap((r) => r.questions.map((q) => profile(q.text))).slice(-MAX_ASKED);

  const cleaned = clean(original, { minWords: 8, asked });
  result.text = cleaned.text;
  result.dropped = cleaned.dropped;

  const spans = spansOf(cleaned.text);
  const first = spans[0];
  if (first && !first.item) {
    if (opensWithPraise(tidyText(first.text))) result.reasons.push('it opens with praise');
    const p = profile(first.text);
    if (prior.some((r) => r.first && alike(p, profile(r.first.text), SIMILAR_OPENER))) result.reasons.push('its opening repeats an earlier opening');
  }
  const last = prior.at(-1);
  if (last) {
    const mine = trigramSet(wordsOf(cleaned.text));
    if (mine.size >= 12) {
      const theirs = trigramSet(wordsOf(last.content));
      let shared = 0;
      for (const g of mine) if (theirs.has(g)) shared++;
      if (shared / mine.size >= SAME_RUN) result.reasons.push('it repeats the wording of the previous reply');
    }
  }
  if (spans.filter((s) => !s.item && endsWithQ(s.text)).length > MAX_QUESTIONS) result.reasons.push('it asks too many questions');
  // Whatever could not be removed (too little would be left) is all there is: nothing but praise and a generic question says nothing about the story.
  if (spans.length && spans.every((s) => !s.item && (isStockQuestion(s.text) || isPraiseOpener(s.text)))) result.reasons.push('it says nothing but a generic question');
  else if (spans.length && [spans[0], spans.at(-1)].some((sp) => !sp.item && isStockQuestion(sp.text))) result.reasons.push('it opens or ends on a generic question'); // it could not go: too little (or a colon, or a dangling start) would be left without it
  result.retry = result.reasons.length > 0;
  return result;
}

// ── shapes ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// HOW to build a reply, never what to say. Each text is one or two sentences of instruction about form (length, order, whether to list,
// whether to end on a question). A mix on purpose: most are prose, several forbid a closing question, so no single habit can dominate.
// The words "list" appear only in the shapes that really ask for a list, and "closing question" only where one is forbidden.

const shape = (id, kinds, text) => Object.freeze({ id, kinds: Object.freeze(kinds), text });

export const SHAPES = Object.freeze([
  shape('one-thread', ['conversation', 'question'], 'One short paragraph that builds on the single most interesting thing the writer said, then stop; no closing question.'),
  shape('answer-complication', ['conversation'], 'Two or three sentences answering, then one concrete complication worth considering (no question).'),
  shape('tension-question', ['conversation'], 'Name the tension you see in two sentences, then ask one specific question about it.'),
  shape('three-sparks', ['conversation', 'ideas'], 'A short list of 3 sparks, each tied to something specific the writer said, no closing question.'),
  shape('honest-take', ['conversation', 'question'], 'Give your honest take in three sentences or fewer and say what it rests on, with no closing question.'),
  shape('set-against', ['conversation'], "Set two of the writer's own choices against each other and say what the contrast makes possible, in one paragraph."),
  shape('two-then-ask', ['conversation', 'question'], "Two sentences at most, the second one a single specific question about the writer's own details."),
  shape('what-if-change', ['conversation', 'ideas'], "One what-if built from the writer's own details, then one sentence on what it would change; no closing question."),
  shape('two-cases', ['conversation', 'question'], "Give the strongest case for each of two directions in a sentence apiece, then say which one the writer's own words lean toward."),
  shape('small-detail', ['conversation'], 'Start from one small, odd detail in what the writer said and say what it could mean for the story, as commentary and never as story text, in a short paragraph that ends on a statement.'),
  shape('answer-first', ['question', 'lookup'], 'Answer the question in the first sentence, then give one reason in the second; stop there.'),
  shape('answer-and-where', ['lookup'], 'Answer in the first sentence straight from the text and say which section it is in; if the text does not say, say so plainly. Nothing else.'),
  shape('it-depends', ['question'], "Say in one sentence what the answer depends on, then give the answer for the writer's own case, with no closing question."),
  shape('answer-watch', ['question', 'lookup'], 'Answer plainly in two or three sentences, then name the one thing to watch for.'),
  shape('four-quick', ['ideas'], 'A numbered list of 4 short sparks, each one sentence, each a what-if or a complication, no closing question.'),
  shape('two-paths', ['ideas', 'conversation'], 'Two contrasting directions, each in two sentences, then stop.'),
  shape('one-deep', ['ideas'], 'One idea developed in a short paragraph: the what-if, what it costs a character, and what it changes.'),
  shape('whole-then-one', ['readback'], "First show you understood the whole text in two sentences (what it is and how it is built), then go deep on the one thing most worth the writer's attention."),
  shape('whole-then-tension', ['readback'], 'First show you understood the whole text in two sentences, then name one tension between two of its parts and ask one specific question about it.'),
  shape('whole-then-sparks', ['readback'], 'First show you understood the whole text in one or two sentences, then give a short list of 3 sparks tied to specific parts of it, no closing question.'),
  shape('whole-and-voice', ['readback'], 'First show you understood the whole text by naming its subject and the way it is written, then answer what was asked in one short paragraph, with no closing question.'),
  shape('whole-then-gap', ['readback'], 'First show you understood the whole text in two sentences, then point out one thing it sets up and has not paid off yet.'),
]);

/**
 * Pick how to build the next reply: a shape of this `kind` ('conversation' | 'readback' | 'question' | 'lookup' | 'ideas'; 'lookup' = a question about what the writer's own text says: answer it, never hedge or ask back). Deterministic for a given
 * seed and history. Never the shape of either of the last two replies, and the shape used longest ago comes first (a shape comes back only after
 * every other shape of its kind has been used), so a long conversation cycles instead of settling into one pattern.
 */
export function shapeFor(opts) {
  const history = Array.isArray(opts?.history) ? opts.history : [];
  const kind = SHAPES.some((s) => s.kinds.includes(opts?.kind)) ? opts.kind : 'conversation';
  const seed = typeof opts?.seed === 'string' || typeof opts?.seed === 'number' ? String(opts.seed) : '';
  const used = []; // ids of the replies that carried a shape, newest first
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (m && m.role === 'assistant' && typeof m.shape === 'string' && m.shape) used.push(m.shape);
  }
  const lastTwo = new Set(used.slice(0, 2));
  const pool = SHAPES.filter((s) => s.kinds.includes(kind));
  let eligible = pool.filter((s) => !lastTwo.has(s.id));
  if (!eligible.length) eligible = pool;
  const age = (s) => {
    const at = used.indexOf(s.id);
    return at === -1 ? Infinity : at;
  };
  const tie = (s) => parseInt(fnv1a(`${seed}|${history.length}|${s.id}`), 16);
  return eligible.slice().sort((a, b) => {
    const x = age(a);
    const y = age(b);
    return x === y ? tie(a) - tie(b) : y > x ? 1 : -1;
  })[0];
}
