import { search } from '../knowledge/index.js';
import { WORD_RE, stem } from '../util/text.js';
import { EXPLICIT_ASK, IDEA_OBJECT, PROSE_OBJECT, parseDevelop, parseMemoryCommand } from '../brainstorm/commands.js';
import { detectLens } from '../brainstorm/lenses.js';

/**
 * Intent recognition by rules: what is the writer trying to do with this message?
 * This is the FALLBACK reading. It is instant and works with no model, and it alone makes the deterministic decisions (the exact Idea Board
 * commands, and declining to write or edit). When a language model is running, `orchestrator/understand.js` reads the message with the
 * model and that reading decides everything else; these rules are then only the starting point it corrects.
 */

const norm = (s) => String(s ?? '').trim();
const wordsOf = (s) => (s.match(WORD_RE) ?? []).length;

const RULES = [
  ['start-from-zero', [
    /\bi (?:have|got|had) (?:an?|some) (?:idea|thing|notion)\b.*\b(?:don'?t|do not|not sure|no idea)\b.*\b(?:start|begin|where|how)\b/i,
    /\b(?:don'?t|do not|not sure|no idea) (?:know )?(?:where|how|what) to (?:start|begin|write)\b/i,
    /\bi (?:want|would like|wanna) to write (?:something|a story|a book|anything)\b.*\b(?:don'?t|do not|not sure)\b/i,
    /\bwhere (?:do|should|would|can) i (?:even )?(?:start|begin)\b/i,
    /\b(?:blank page|writer'?s block|i'?m stuck|i am stuck|nothing to write)\b/i,
    /^\s*i don'?t know what to write\b/i,
    /\bi want to write something\b.*\b(?:don'?t|do not) know\b/i,
    /\bhelp me (?:get started|start|begin)\b/i,
  ]],
  // Questions about NIE itself (what it can do, how it works, its model). Each pattern is the WHOLE question, so "what can you do about my
  // sagging middle?" or a line of dialogue in a pasted scene is not mistaken for one. Answered from facts about NIE, never from the craft library.
  ['about-nie', [
    /^\s*(?:(?:hey|hi|hello|so|ok(?:ay)?)[,!]?\s+)?(?:nie[,:]?\s+)?(?:what|who)\s+(?:are|is)\s+(?:you|nie)(?:\s+(?:exactly|really|actually|even|anyway))?\s*[?!.]*\s*$/i,
    /^\s*(?:(?:hey|hi|hello|so|ok(?:ay)?)[,!]?\s+)?(?:nie[,:]?\s+)?what\s+(?:can|could|do|does)\s+(?:you|nie)\s+(?:actually\s+|really\s+)?(?:do|help\s+(?:me\s+)?with)(?:\s+for\s+(?:me|us|writers?|poets?|novelists?|screenwriters?|a\s+(?:writer|poet|novelist|screenwriter|journalist|student)))?\s*[?!.]*\s*$/i,
    /^\s*(?:so\s+)?what\s+(?:are|is)\s+(?:you|nie)\s+(?:good\s+)?for\s*[?!.]*\s*$/i,
    /^\s*(?:so\s+)?how\s+(?:do|does)\s+(?:you|nie)\s+(?:actually\s+|really\s+)?work\s*[?!.]*\s*$/i,
    /^\s*(?:and\s+|so\s+)?(?:do|does|can|will)\s+(?:you|nie|this)\s+(?:work|run)\s+(?:offline|without\s+(?:the\s+)?(?:internet|wi-?fi))\s*[?!.]*\s*$/i,
    /^\s*(?:are|is)\s+(?:you|nie)\s+(?:an?\s+)?(?:ai|bot|robot|chatbot|offline|online|real|human)\s*[?!.]*\s*$/i,
    /^\s*(?:which|what)\s+(?:model|llm|language\s+model)\b[^.?!]{0,30}\b(?:are\s+you|do\s+you\s+use|you\s+use|you\s+run|is\s+this)\b[^.?!]{0,20}[?!.]*\s*$/i,
    /^\s*(?:so\s+)?who\s+(?:made|built|created|developed)\s+(?:you|nie)\s*[?!.]*\s*$/i,
    /^\s*(?:help|help\s+me|how\s+do\s+i\s+use\s+(?:this|nie))\s*[?.!]*\s*$/i,
    /^\s*what\s+can\s+i\s+(?:ask|use)\s+(?:you|nie|this)\s*[?!.]*\s*$/i,
    // What NIE (or its model, or its library) knows. Whole-question patterns too: "what do you know about villanelles?" is a question about villanelles, not about NIE.
    /^\s*(?:(?:hey|hi|hello|so|and|but|ok(?:ay)?)[,!]?\s+)*(?:nie[,:]?\s+)?(?:what|how\s+much)\s+(?:does|do|did|can|could)\s+(?:your|the|this|nie'?s?)\s+(?:(?:offline|online|local|built-?in|language|ai|small)\s+)*(?:model|llm|ai|brain|database|library|knowledge(?:\s?base)?|memory)\s+(?:actually\s+|really\s+|even\s+)?(?:know|contain|have|hold|cover|include|store|remember)(?:\s+(?:about|of|in\s+it))?\s*[?!.]*\s*$/i,
    /^\s*(?:(?:hey|hi|hello|so|and|but|ok(?:ay)?)[,!]?\s+)*(?:nie[,:]?\s+)?(?:what|how\s+much)\s+(?:do|does|did|can)\s+(?:you|nie)\s+(?:actually\s+|really\s+|even\s+|all\s+)?(?:know|remember)(?:\s+about(?:\s+(?:writing|literature|books|genres?|stories|fiction|poetry|everything|anything|all\s+genres|the\s+genres))?)?\s*[?!.]*\s*$/i,
    /^\s*(?:(?:hey|hi|hello|so|and|but|ok(?:ay)?)[,!]?\s+)*(?:nie[,:]?\s+)?(?:do|does|can)\s+(?:you|nie)\s+(?:really\s+|actually\s+)?know\s+(?:about\s+)?(?:all|every|any|each|everything|anything)(?:\s+(?:about\s+)?(?:the\s+)?(?:genres?|forms?|literature|books|writing|stories|subjects?))?\s*[?!.]*\s*$/i,
    /^\s*(?:(?:hey|hi|hello|so|and|but|ok(?:ay)?)[,!]?\s+)*(?:nie[,:]?\s+)?(?:what\s+(?:genres|forms|books|works|topics|subjects|kinds\s+of\s+(?:writing|books))\s+(?:do|does|can)\s+(?:you|nie)\s+(?:know|cover|have|include)(?:\s+about)?|how\s+(?:big|large)\s+is\s+(?:your|nie'?s?)\s+(?:library|database|knowledge(?:\s?base)?)|what(?:'s|\s+is)\s+in\s+(?:your|nie'?s?)\s+(?:library|database|knowledge(?:\s?base)?)|what\s+(?:are|were)\s+you\s+trained\s+on|how\s+much\s+(?:do|does)\s+(?:your|the)\s+(?:library|database|model)\s+(?:know|have|cover|hold))\s*[?!.]*\s*$/i,
  ]],
  ['direction-change', [
    /^\s*(?:actually|wait|hold on|hmm+|on second thought|scratch that|never ?mind|no,? wait|what if instead|let'?s (?:change|switch|try)|instead)\b/i,
    /\bchange (?:of )?(?:direction|plans?)\b/i,
    /\bactually,?\s+(?:the|he|she|it|they|his|her|their|what|maybe|i)\b/i,
  ]],
  // NIE never writes or edits the writer's text. These are recognised so they can be declined clearly, not half-answered.
  ['request-edit', [
    /^\s*(?:please\s+)?(?:rewrite|rephrase|reword|redo|edit|proofread|fix|polish|tighten|improve|correct|revise|punch up|smooth out)\b/i,
    /\b(?:can|could|would|will) you\b[^.?!]{0,30}\b(?:rewrite|rephrase|reword|edit|proofread|fix|polish|tighten|improve|correct|revise)\b/i,
    /\bmake (?:this|it|that) (?:sound|read|feel|flow|better)\b/i,
  ]],
  ['request-write', [
    /^\s*(?:please\s+)?(?:write|draft|compose|generate|continue|finish|complete|expand|create)\s+(?:me\s+|us\s+)?(?:a|an|the|my|this|that|some|it|one|more|another|about)\b/i,
    /\b(?:can|could|would|will) you\b[^.?!]{0,30}\b(?:write|draft|compose|generate|continue|finish|complete|expand)\b/i,
    /\bwrite (?:me|us|it for)\b|\b(?:write|draft|finish)\b[^.?!]{0,40}\bfor me\b|\bhelp me (?:write|draft)\b/i,
  ]],
  ['feedback-request', [
    /\b(?:does|do|is|are|would|will|can) (?:this|that|it|my|the|these)\b.*\b(?:work|feel|read|sound|land|too|predictable|clear|believable|boring|slow|rushed|confusing|cliche|cliché|obvious)\b/i,
    /\b(?:what do you think|any thoughts|thoughts on|how (?:is|does) (?:this|it)|am i)\b/i,
    /\b(?:feedback|critique|review (?:this|my))\b/i,
  ]],
  ['what-if', [/^\s*what if\b/i, /\bwhat would happen if\b/i, /\b(?:suppose|imagine) (?:that|if)\b/i]],
  ['request-ideas', [
    /\bhow (?:could|can|do|would|should|might) i\b/i,
    /\bi need (?:an?|some|a reason|ideas?|help)\b/i,
    /\bwhat (?:kind|type|sort) of\b/i,
    /\bwhat (?:would|could|should|might) (?:work|happen|go|fit)\b/i,
    /\b(?:give me|any|some) (?:ideas?|suggestions?|options?)\b/i,
    /\b(?:ideas? for|suggest|brainstorm|come up with|think of|figure out|help me (?:think|find|figure|come up))\b/i,
    /\bi want (?:something|it|this|an? \w+(?: \w+)? (?:that|to be)) /i,
  ]],
  ['craft-question', [
    /^\s*(?:what|who|how|why|when|where)(?:'s| is| are| does| do| was| were)\b.*\b(?:narrator|structure|genre|trope|arc|pov|point of view|tense|foreshadow|pacing|subtext|motif|theme|symbol|exposition|dialogue|twist|climax|act|plot|device|style|voice|irony|framing)\b/i,
    /\b(?:explain|define|what does .* mean|difference between|teach me)\b/i,
  ]],
  // Small talk, by rule: a hello, thanks, "how are you?", "back again", a goodbye, "ok cool". Whole messages only; "hey, can you give me ideas?" is not small talk.
  ['greeting', [
    /^\s*(?:hi+|hello|hey+|heya|hiya|yo|howdy|good (?:morning|afternoon|evening)|morning|thanks|thank you|thx|cheers|ok(?:ay)?|cool)\b[\s!.,?]*$/i,
    /^\s*(?:(?:hi+|hello|hey+|heya|hiya|yo|howdy)[\s,!.]*)?(?:how are you(?: doing)?(?: today)?|how'?s it going|how have you been|how'?re you|what'?s up|sup)[\s!.,?]*$/i,
    /^\s*(?:(?:hi+|hello|hey+|yo)[\s,!.]*)?(?:i'?m back(?: again)?|im back|back again|back for more)[\s!.,?]*$|^\s*(?:hi|hello|hey) again[\s!.,?]*$/i,
    /^\s*(?:thanks|thank you|thx|cheers)(?: (?:so much|a lot|very much|again|nie|a bunch))*[\s!.,?]*$/i,
    // "thanks, that helps a lot", "thank you, this is perfect": thanks with a word on how it landed, and nothing asked
    /^\s*(?:thanks|thank you|thx|cheers)(?: (?:so much|a lot|very much|again|nie|a bunch))*[\s,!.]+(?:(?:that|this|it)(?:'s| is| was| has)?\s+)?(?:really |so |very |been )?(?:help(?:s|ed|ful)?|great|good|perfect|useful|awesome|nice|wonderful|brilliant|exactly what i needed|just what i needed|works?)(?:\s+(?:a lot|so much|a ton|loads|lot))?[\s!.]*$/i,
    // a short message with a thank-you in it and nothing asked: "ok i'll try it, thanks", "thanks that's all for today", "thanks for the help"
    /^(?=[^?\n]{1,70}$)(?!.*\b(?:give|write|tell|show|help me|what|how|why|can you|could you|would you|more|another|next|now (?:give|write|tell|show|help|let|can|could)|please|suggest|ideas?|twists?|rewrite|edit|check|scan|keep|remember|add)\b).*\b(?:thanks|thank you|thx|cheers)\b.*$/i,
    // discouragement with nothing about the work in it: "just got another rejection letter", "i dont think i'm any good at this", "i want to give up"
    /^(?!.*\b(?:story|plot|chapter|scene|character|characters|idea|draft|novel|poem|script|ending|opening)\b)(?=[^?\n]{1,70}$).*\b(?:rejection|rejected|(?:don'?t|dont|do not) think i'?m (?:any )?good|not (?:any |that |very )?good (?:at|enough)|i suck|give up|want to quit|waste of time|hopeless)\b.*$/i,
    // plain tiredness, with nothing about the work in it: a person answers it as a person
    /^(?!.*\b(?:story|stuck|plot|chapter|scene|character|characters|write|writing|idea|draft|novel|poem|script|ending|opening)\b)\s*(?:i'?m|i am|im|feeling|so|really)?\s*(?:so |really |very |just |too |kind of |a bit )*(?:tired|exhausted|drained|burn(?:ed|t) out|stressed|overwhelmed|worn out|wiped)(?: (?:today|tonight|right now|lately|again))?(?: and (?:i )?can'?t (?:focus|think|concentrate))?[\s!.]*$|^\s*i can'?t (?:focus|concentrate) (?:today|tonight|right now)?[\s!.]*$/i,
    /^\s*(?:bye+|goodbye|good ?night|see you|see ya|talk (?:to you )?(?:later|soon)|ttyl)(?: (?:now|later|for now|soon|tomorrow))?[\s!.,?]*$/i,
    /^\s*(?:ok(?:ay)?|cool|nice|great|awesome|alright|got it|sounds good|makes sense)(?:[\s,]+(?:cool|thanks|thank you|great|nice|awesome|got it|sounds good|makes sense))?[\s!.,?]*$/i,
  ]],
];

// A question that asks what something is, who made it, or to explain it ("what is a sonnet", "who invented the villanelle", "explain the villanelle"), as opposed to
// one asking for ideas ("what are some twists", "what's a good twist").
const DEFINITION_ASK = /^\s*(?:what(?:'s|\s+(?:is|are|was|were|does|do))\s+(?!some\b|any\b|a good\b|good\b|great\b|better\b|best\b|interesting\b|fun\b|new\b|other\b|more\b|different\b)|who(?:'s|\s+(?:is|are|was|were|wrote|invented|coined))\b|explain\b|define\b|describe\b|tell me about\b|when (?:did|was|were|is)\b|why (?:is|are|do|does)\b)/i;

const PREMISE_SHAPES = [
  /\b(?:a|an|the)\s+(?:[\w'-]+\s+){0,3}?(?:who|that)\s+(?:befriends|meets|finds|discovers|wants|must|tries|learns|falls|becomes|returns|loses|keeps|hides|steals|inherits|wakes|escapes)\b/i,
  /\b(?:a|an|the)\s+(?:[\w'-]+\s+){1,4}(?:befriends|meets|finds|discovers|adopts|hunts|saves|betrays|murders|investigates|inherits|raises|follows|haunts|rescues|stalks)\s+(?:a|an|the|his|her|their)\b/i,
  /\b(?:story|book|novel|script|film|play|poem|piece|idea|premise) (?:about|where|in which|that)\b/i,
  /^\s*(?:i want|i'?d like|i have|my (?:idea|story) is)\b.*\b(?:about|where|who|a story|an? \w+ who)\b/i,
];

export function detectIntent(message, { project = null, mode = 'brainstorm', hasHistory = false, passage = '' } = {}) {
  const text = norm(message);
  const signals = [];
  const types = [];
  if (!text) return { type: 'empty', secondary: [], confidence: 0, signals: [], direction: { changed: false }, premiseCues: emptyCues(), topics: [] };

  // Idea Board commands and "develop this idea" are exact, so they never reach the model or the premise heuristics.
  const memory = parseMemoryCommand(text);
  const develop = memory ? null : parseDevelop(text);
  if (memory || develop) {
    const type = memory ? memory.type : 'develop-idea';
    return { type, memory, idea: develop, secondary: [], confidence: 0.95, signals: [type], mode, direction: { changed: false }, premiseCues: emptyCues(), topics: [] };
  }

  for (const [type, patterns] of RULES) {
    for (const re of patterns) {
      const m = text.match(re);
      if (m) {
        types.push(type);
        signals.push(`${type}: "${m[0].slice(0, 60)}"`);
        break;
      }
    }
  }

  // "Write/create/generate me some ideas, twists, premises…" asks for IDEAS, which is exactly what NIE is for. It stays a
  // request to write when what is being asked for is prose ("write a scene with three twists").
  if (types.includes('request-write') && IDEA_OBJECT.test(text)) {
    const withoutIdeaPhrases = text.replace(new RegExp(`(?:[\\w'-]+\\s+){0,2}${IDEA_OBJECT.source}`, 'gi'), ' ');
    if (!PROSE_OBJECT.test(withoutIdeaPhrases)) {
      types.splice(types.indexOf('request-write'), 1);
      if (!types.includes('request-ideas')) types.push('request-ideas');
    }
  }

  // "Give me some twists for my story" is a request, not a premise, even on a first message with no history.
  // (A lens word alone, like "secrets?", only counts when the message is short enough to be a request.)
  // (Not a question that only asks what a thing is: "What is a sonnet?" or "Explain the villanelle" are questions for the library, though "sonnet" is also a word that names something to write.)
  if (!types.includes('request-ideas') && !types.includes('request-write') && !types.includes('request-edit') && detectLens(text)) {
    if (EXPLICIT_ASK.test(text) || (wordsOf(text) <= 4 && !PREMISE_SHAPES.some((re) => re.test(text)) && !DEFINITION_ASK.test(text))) types.push('request-ideas');
  }

  const wc = wordsOf(text);
  const isQuestion = /\?\s*$/.test(text);
  const premiseShape = PREMISE_SHAPES.some((re) => re.test(text));

  // A "direction change" only counts when there is something to change direction from.
  const hasContext = hasHistory || Boolean(project?.conversation?.workingPremise?.summary);
  let directionCue = null;
  if (types.includes('direction-change')) {
    if (hasContext) directionCue = signals.find((s) => s.startsWith('direction-change')) ?? null;
    else types.splice(types.indexOf('direction-change'), 1);
  }

  let type;
  if (types.includes('start-from-zero')) type = 'start-from-zero';
  else if (types.includes('request-write')) type = 'request-write';
  else if (types.includes('request-edit')) type = 'request-edit';
  else if (types.includes('about-nie')) type = 'about-nie';
  else if (directionCue) type = 'direction-change';
  else if (types.includes('what-if')) type = 'what-if';
  else if (types.includes('craft-question') && isQuestion) type = 'craft-question';
  else if (types.includes('feedback-request')) type = 'feedback-request';
  else if (types.includes('request-ideas')) type = 'request-ideas';
  else if (types.includes('craft-question')) type = 'craft-question';
  else if (types.includes('greeting')) type = 'greeting';
  else if (premiseShape && !isQuestion && wc <= 70) type = 'share-premise';
  else if (!isQuestion && wc >= 25 && /[.!?]/.test(text) && !/\b(?:you|can you|could you|please)\b/i.test(text)) type = 'share-passage';
  else if (!isQuestion && wc >= 3 && wc <= 18 && !hasHistory && !passage) type = 'share-premise';
  else type = 'discuss';

  const secondary = types.filter((t) => t !== type);

  const premiseCues = extractPremiseCues(text);
  const topics = search(text, { limit: 4 }).map((e) => e.id);
  const confidence = types.length || premiseShape ? 0.8 : 0.5;

  return {
    type,
    secondary,
    confidence,
    signals,
    mode,
    direction: { changed: Boolean(directionCue), cue: directionCue },
    premiseCues,
    topics,
  };
}

// ── Premise cues ─────────────────────────────────────────────────────────────

const ROLE_NOUNS =
  'person|guy|lady|gentleman|man|woman|boy|girl|child|kid|baby|teenager|teen|detective|magician|doctor|nurse|soldier|king|queen|prince|princess|robot|android|cat|dog|horse|bird|crow|wolf|fox|ghost|witch|wizard|writer|teacher|student|priest|nun|farmer|sailor|captain|pilot|thief|assassin|spy|mother|father|sister|brother|daughter|son|widow|orphan|stranger|neighbor|neighbour|monster|alien|vampire|dragon|knight|beggar|musician|painter|artist|chef|cop|officer|lawyer|judge|mayor|clown|puppet|ghost|angel|demon|god|goddess';
const ROLE_RE = new RegExp(`\\b(?:a|an|the|his|her|their|this|that)\\s+((?:[a-z'-]+\\s+){0,2}?(?:${ROLE_NOUNS}))\\b`, 'gi');

const SETTING_NOUNS =
  'city|town|village|forest|woods|ship|station|theatre|theater|hospital|school|island|desert|mountain|castle|mansion|house|apartment|street|alley|farm|prison|asylum|lighthouse|church|cemetery|bunker|spaceship|colony|planet|kingdom|circus|hotel|motel|library|museum|subway|train|bus|park|bridge|shelter|harbor|harbour|market|cabin|camp|lab|laboratory|factory|mine';
const SETTING_RE = new RegExp(`\\b(?:in|at|on|inside|aboard|beneath|under|outside|near|behind)\\s+(?:a|an|the)\\s+((?:[a-z'-]+\\s+){0,2}?(?:${SETTING_NOUNS}))\\b`, 'gi');

const THEME_CUES = {
  loneliness: ['homeless', 'alone', 'lonely', 'isolated', 'abandoned', 'widow', 'orphan', 'outcast', 'stranger', 'solitary', 'invisible'],
  companionship: ['befriend', 'friend', 'companion', 'bond', 'pet', 'cat', 'dog', 'together', 'stray', 'adopt'],
  survival: ['homeless', 'survive', 'stranded', 'wilderness', 'apocalypse', 'starv', 'hunted', 'refugee'],
  grief: ['died', 'death', 'funeral', 'widow', 'mourning', 'lost his', 'lost her', 'ghost', 'grave'],
  justice: ['murder', 'detective', 'trial', 'crime', 'investigat', 'killer', 'victim', 'alibi'],
  identity: ['secret identity', 'double', 'mirror', 'who am i', 'amnesia', 'impostor', 'disguise', 'pretend'],
  power: ['king', 'queen', 'empire', 'rebellion', 'throne', 'regime', 'corporation', 'tyrant'],
  fear: ['haunted', 'monster', 'ghost', 'dark', 'stalk', 'terror', 'nightmare', 'curse'],
  love: ['love', 'romance', 'kiss', 'wedding', 'lover', 'marry', 'courtship', 'crush'],
  deception: ['secretly', 'betray', 'lie', 'liar', 'spy', 'observing', 'watching', 'impostor', 'conspir'],
  belonging: ['home', 'family', 'community', 'outsider', 'village', 'newcomer', 'exile'],
  ambition: ['ambition', 'rise', 'career', 'fame', 'prove', 'rival', 'success'],
};

const SPECULATIVE = /\b(?:ghost\w*|magic\w*|wizard\w*|witch\w*|dragon\w*|alien\w*|robot\w*|android\w*|spaceship\w*|time (?:machine|travel)\w*|vampire\w*|demon\w*|curse\w*|spell\w*|psychic\w*|telepath\w*|monster\w*|portal\w*|parallel (?:world|universe)|apocalypse|cyborg\w*|superpower\w*)\b/i;
const ANIMAL_AGENT = /\b(?:cat|dog|crow|bird|rat|fox|wolf|horse|raven|owl)\b[^.!?]{0,40}\b(?:secretly|actually|really|spy|spying|reporting|observing|watching him|watching her)\b/i;
const MYSTERY = /\b(?:murder\w*|detective\w*|clue\w*|whodunit|investigat\w*|suspect\w*|alibi|missing|disappear\w*|poison\w*|heist)\b/i;
const HORROR = /\b(?:haunt\w*|terror\w*|dread\w*|nightmare\w*|stalk\w*|possess\w*|cursed|monster\w*|gore|slasher|creepy|scary)\b/i;
const COMIC = /\b(?:funny|hilarious|comed\w+|absurd\w*|farce|prank\w*|satir\w+|parod\w+|slapstick)\b/i;

function emptyCues() {
  return { characters: [], settings: [], themes: [], reality: 'unclear', modes: [] };
}

export function extractPremiseCues(text) {
  const t = norm(text);
  const cues = emptyCues();
  if (!t) return cues;

  const seen = new Set();
  for (const m of t.matchAll(ROLE_RE)) {
    const phrase = m[1].toLowerCase().trim();
    if (!seen.has(phrase)) {
      seen.add(phrase);
      cues.characters.push(phrase);
    }
  }
  for (const m of t.matchAll(/\b[A-Z][a-z]{2,}\b/g)) {
    const idx = m.index ?? 0;
    const sentenceStart = idx === 0 || /[.!?]\s*$/.test(t.slice(0, idx));
    const w = m[0];
    if (!sentenceStart && !['I', 'The', 'But', 'And'].includes(w) && !seen.has(w.toLowerCase())) {
      seen.add(w.toLowerCase());
      cues.characters.push(w);
    }
  }
  const seenSet = new Set();
  for (const m of t.matchAll(SETTING_RE)) {
    const phrase = m[1].toLowerCase().trim();
    if (!seenSet.has(phrase)) {
      seenSet.add(phrase);
      cues.settings.push(phrase);
    }
  }

  const lower = t.toLowerCase();
  const themeScores = Object.entries(THEME_CUES)
    .map(([theme, kws]) => [theme, kws.filter((k) => new RegExp(`\\b${k}`).test(lower)).length])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  cues.themes = themeScores.slice(0, 4).map(([k]) => k);

  const speculative = SPECULATIVE.test(t) || ANIMAL_AGENT.test(t);
  cues.reality = speculative ? 'speculative' : cues.characters.length || cues.themes.length ? 'realist' : 'unclear';
  if (MYSTERY.test(t)) cues.modes.push('mystery');
  if (HORROR.test(t)) cues.modes.push('horror');
  if (COMIC.test(t)) cues.modes.push('comic');
  if (speculative) cues.modes.push('speculative');
  if (!cues.modes.length && cues.reality === 'realist' && cues.themes.length) cues.modes.push('emotional drama');
  return cues;
}

/**
 * Fold a new message into the project's *working premise*: what the story is currently about.
 * A direction change revises the premise rather than silently stacking onto it.
 */
export function updateWorkingPremise(prev, message, intent) {
  const base = prev && typeof prev === 'object' ? prev : {};
  const cues = intent?.premiseCues ?? extractPremiseCues(message);
  const isPremise = ['share-premise', 'direction-change', 'what-if', 'share-passage'].includes(intent?.type);
  if (!isPremise) return { ...emptyPremise(), ...base };

  const merge = (a = [], b = []) => [...new Set([...a, ...b])].slice(0, 8);
  const changed = intent.type === 'direction-change';
  const next = {
    ...emptyPremise(),
    ...base,
    summary: intent.type === 'share-premise' && !base.summary ? clipSummary(norm(message)) : base.summary || clipSummary(norm(message)),
    characters: merge(base.characters, cues.characters),
    settings: merge(base.settings, cues.settings),
    themes: changed ? merge(cues.themes, base.themes) : merge(base.themes, cues.themes),
    modes: changed ? merge(cues.modes, base.modes) : merge(base.modes, cues.modes),
    reality: cues.reality !== 'unclear' ? (changed || !base.reality || base.reality === 'unclear' ? cues.reality : base.reality) : base.reality ?? 'unclear',
    revisions: [...(base.revisions ?? []), ...(changed ? [{ text: norm(message).slice(0, 240) }] : [])].slice(-6),
  };
  if (changed && cues.reality === 'speculative' && base.reality === 'realist') next.reality = 'speculative';
  return next;
}

/** A pasted chapter must not become the "premise": keep the start of it. */
const clipSummary = (t) => (t.length > 500 ? `${t.slice(0, 499).trimEnd()}…` : t);

function emptyPremise() {
  return { summary: '', characters: [], settings: [], themes: [], modes: [], reality: 'unclear', revisions: [] };
}

export const emptyWorkingPremise = emptyPremise;

/** Rough content-word stems for quick relatedness checks. */
export const contentStems = (s) => (s.match(WORD_RE) ?? []).map(stem);
