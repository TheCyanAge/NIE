import { STOPWORDS, WORD_RE, clip, estimateTokens } from '../util/text.js';
import { passagesOf } from './sources.js';
import { isNumberish, memoByText, nameStems, normText, tokenize, tokensOf } from './tokens.js';

/**
 * Recall: given what the writer just said, find the earlier things in THIS project that bear on it (what they said before, the idea sheet, ideas kept,
 * the Idea Board, characters, rules, ...), with where each came from, ready to put in front of the model.
 *
 * Plain word statistics, no model: BM25 over the project's passages (`sources.js`), with
 *   - names (capitalised words, and the names of the characters the writer recorded) weighted up, because a name is the best way to find a passage;
 *   - who is who, read from the writer's own phrases ("my mum Dolores", "the baker Ines"): "Mum" finds what was said about Dolores, and the other way round (`roleLinks`);
 *   - a small, fixed set of word families ("want / goal / aim", "set / town / village") and the question word ("where", "who", "when", "how old", "how long") so a question put in
 *     other words still finds the statement, at a lower weight than the writer's own words; a question with no word to look for ("how old am I?") looks for a kind of passage (an age);
 *   - for the best few: neighbouring search words side by side, three words of the question in a row, and "Dad, Ray Pollard" for "what was my dad called?";
 *   - the source's weight (rules and kept ideas over recorded parts over things said over NIE's board ideas) and a mild bonus for what was said lately;
 *   - a floor (`minScore`), so small talk and words that are everywhere in the project find nothing; and a short question made of words this project never used ("who won the world cup")
 *     is not answered with the one word it shares by chance.
 * Every call reads only the project it is given and keeps nothing; `tokens.js` has the memos, keyed by exact text.
 */

// ── word families ────────────────────────────────────────────────────────────

const FAMILIES = {
  goal: 'want wants wanted goal aim desire need seek hope wish quest ambition trying try objective motivation chase dream crave pursue intend',
  place: 'set setting place location located town village city country island world kingdom planet region land coast station',
  time: 'time year season era century period decade date morning night winter summer spring autumn timeline',
  span: 'long span spans cover covers last lasts duration month months week weeks day days hours period year years decade decades century centuries minute minutes runtime',
  deadline: 'deadline deadlines countdown clock ticking timer due urgency limit hurry',
  travel: 'travel travels travelling traveling journey voyage fly flying sail sailing drift drifting cruise trip trek',
  exposition: 'explain explains explaining explanation exposition info information infodump dump backstory worldbuilding',
  hideout: 'hide hides hiding hideout hideaway refuge shelter lair headquarters base safehouse safe',
  music: 'music score soundtrack song songs jazz tune sound',
  image: 'image shot frame visual picture scene',
  history: 'history backstory past background origin origins earlier',
  choose: 'pick picked choose chose chosen decided decide favourite favorite prefer preferred best',
  steal: 'steal steals stealing stole stolen theft thief rob robs robbed robbery heist burglary loot',
  person: 'character person protagonist hero heroine lead main narrator named called name',
  opposition: 'villain antagonist enemy opponent rival rivals nemesis against opposes opposition obstacle threat foe adversary competitor competitors competition competing baddie bad guy',
  ability: 'ability abilities power powers talent talented gift gifted skill skills special strength superpower',
  humour: 'humour humor funny jokes joke comedy comic comedic witty banter gag gags laugh laughs liners',
  stakes: 'stakes lose loses lost risk risks consequence fail fails failure price cost danger',
  theme: 'theme themes message meaning point explore explores subject moral lesson',
  tone: 'tone feel mood atmosphere vibe voice style register feeling emotional language prose diction',
  ending: 'end ending finale conclusion resolution climax twist reveal solved solution outcome last final',
  start: 'begin begins beginning start opens opening inciting hook open first',
  rule: 'rule rules never must always forbid forbidden restriction constraint limit allowed',
  secret: 'secret hidden hiding hide conceal lie lies lying truth deceit honest deceive',
  mother: 'mother mom mum mama mommy mummy parent parents',
  father: 'father dad papa daddy parent parents',
  sibling: 'sister brother sibling twin',
  spouse: 'wife husband spouse partner married marriage',
  offspring: 'son daughter child kid',
  relative: 'grandmother grandfather grandma grandpa uncle aunt cousin nephew niece family',
  friend: 'friend friends companion ally confidant buddy',
  death: 'die dies died death dead kill killed murder murdered drown drowned perish loss lose lost',
  romance: 'romance romantic love lover affair kiss dating relationship couple crush marriage married wedding partner passion',
  audience: 'audience reader readers fans fan market demographic public',
  structure: 'part parts divide divided division chapter chapters section sections act acts structure structured split organised',
  pov: 'pov point view narrator narrate narrated narration perspective person first third',
  length: 'length long short count page pages thousand hundred word words chapter chapters minute minutes runtime episode episodes',
  age: 'age old older young younger aged elderly teenager born birthday',
  group: 'group faction gang crew team club organisation organization movement resistance rebel rebels rebellion underground order guild society',
  gather: 'meet meets meeting gather gathers gathering assemble hideout',
  farewell: 'goodbye farewell parting bye',
  look: 'look looks appearance hair eyes tall short face wears wear dressed',
  money: 'money rich poor debt debts wealthy cost pay paid currency coin coins credits',
  fear: 'afraid fear scared terrified phobia',
  command: 'captain commander leader boss chief head runs run lead leads command commands governs governor admiral general king queen ruler',
  research: 'research check verify confirm archive library source sources investigate',
  genre: 'genre mystery thriller fantasy horror western comedy satire fable memoir noir',
};
/** What a question about a person's work is looking for (only used when the question asks about work). */
const OCCUPATIONS = 'job work works worked career profession occupation employ employed living trade role engineer doctor physician nurse teacher professor captain baker butcher farmer fisherman sailor soldier detective officer lawyer judge priest vicar pastor writer author journalist reporter artist painter musician singer actor cook chef driver pilot mechanic guard clerk merchant trader thief spy scientist student keeper technician archivist librarian curator historian cartographer harbourmaster manager commissioner investigator inspector constable sheriff mayor councillor banker accountant broker dealer smith carpenter builder miner shepherd fisher weaver tailor cobbler innkeeper publican bartender waiter barista receptionist secretary assistant apprentice courier smuggler pirate bounty';
/** Words that name the book rather than say something about it: counted, but a good deal less than the writer's other words. */
const GENERIC_WORDS = 'story book novel project piece writing write written text draft manuscript film movie screenplay script';
const NOISE_WORDS =
  'please pls thanks thank thx hello hi hey bye goodbye cheers welcome sorry ok okay yes yeah yep nope lol haha hmm give tell show help let know think thing things something anything really maybe get got going just also actually again like today tomorrow tonight ' +
  'great good nice awesome perfect amazing cool wonderful lovely brilliant fantastic excellent helpful helps appreciate sounds fine much very kind sort type stuff next';

const families = Object.entries(FAMILIES).map(([name, words]) => [name, [...new Set(tokenize(words))]]);
/** stem -> the other stems of its families */
const EXPAND = new Map();
for (const [, stems] of families) for (const a of stems) for (const b of stems) if (a !== b) (EXPAND.get(a) ?? EXPAND.set(a, new Set()).get(a)).add(b);
const FAMILY = Object.fromEntries(families);
const stemsOf = (words) => [...new Set(tokenize(words))];
const OCCUPATION = stemsOf(OCCUPATIONS);
const GENERIC = new Set(tokenize(GENERIC_WORDS));
// Pseudo terms: a search word that stands for a KIND of passage rather than a word ("a number is in it", "an age", "a size"), for questions whose answer has no word to look for.
const NUMBER = '#n'; // digits, "sixty", "eighth": "how old / how many / how long"
const AGE = '#age'; // "I'm 46", "Okafor, 34,", "a nineteen year old", "aged 12"
const YEAR = '#year'; // "1979", "the 1960s"
const SIZE = '#size'; // "90,000 words", "twelve chapters", "about 100 minutes"
const JOB = '#job'; // a word that names a trade ("archivist", "lock-keeper"), for "what does she do for a living"
const NAME = '#name'; // a capitalised name in the middle of a sentence, for "what is he called"
const isFeature = (t) => t.charCodeAt(0) === 35;

const AGE_IS = /\b(?:i['’]?m|i am|is|was|am|are|aged?|turns?|turned|she['’]s|he['’]s|they['’]re|now)\s+(?:about\s+|almost\s+|nearly\s+|only\s+|just\s+|around\s+)?\d{1,3}\b(?!\s*(?:%|percent|words?|pages?|chapters?|minutes?|mins?|days?|hours?|miles?|years? ago|acts?|parts?|ft|feet|km|kg|metres?|meters?))/i;
const AGE_YO = /years?[-\s]old/i; // "nineteen year old", "34-year-old"
const AGE_APPOSITE = /\p{L}\s*[,(]\s*\d{1,3}\s*[,)]/u; // "Okafor, 34,", "Mara (47)"
const AGE_DIGITS = /\d/;
const hasAge = (text) => (AGE_DIGITS.test(text) && (AGE_IS.test(text) || AGE_APPOSITE.test(text))) || AGE_YO.test(text);
const YEAR_RE = /\b(?:1[0-9]{3}|20[0-9]{2})s?\b/;
const SIZE_UNIT = '(?:words?|pages?|chapters?|minutes?|mins?|episodes?|acts?|hours?|parts?|scenes?|volumes?|books?|issues?|stanzas?|poems?)';
const SIZE_RE = new RegExp(`\\b(?:\\d[\\d,.]*|(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand))\\s*(?:k\\s+)?(?:(?:thousand|hundred|million)\\s+)?${SIZE_UNIT}\\b`, 'i');
const JOB_RE = /\b\p{L}{3,}(?:ist|ician|eer|master|keeper|wright|smith|maker|monger|worker)\b/iu;

const FEATURES = {
  [NUMBER]: (toks) => toks.some(isNumberish),
  [AGE]: (_, text) => hasAge(text),
  [YEAR]: (_, text) => YEAR_RE.test(text),
  [SIZE]: (_, text) => SIZE_RE.test(text),
  [JOB]: (_, text) => JOB_RE.test(text),
  [NAME]: (_, text) => nameStems(text).size > 0,
};

/** "how old", "how long": the adjective belongs to the question, not to the book ("old paper" is not an answer to "how old is she"). */
const HOW_ADJ = /\bhow\s+(?:old|many|much|long|big|tall|far|often|fast|heavy|wide|deep|high|large|small|short)\b/gi;
const NAME_QUESTION = /\b(?:called|named|names?|who(?:'s|\s+is|\s+was|\s+are|\s+were))\b/i;
const LENGTH_CUE = [...FAMILY.length, ...FAMILY.span].filter((w) => w !== 'long' && w !== 'short');

/**
 * A question names the kind of thing asked for: [pattern, [stems], weight]. The question words are stopwords, so they never count as search words themselves; this is how
 * "where" finds a place and "how old" finds an age. The weights are low (a cue only helps) except where a phrase says exactly what is wanted ("what is the book called").
 */
const CUES = [
  [/\bwhere\b/i, FAMILY.place, 0.25],
  [/\bwho(?:m|se)?\b/i, FAMILY.person, 0.25],
  [/\bwhen\b/i, [...FAMILY.time, NUMBER], 0.25],
  [/\bwhen\b|\bwhat\s+year\b/i, [YEAR], 0.35],
  [/\bwhy\b/i, [...FAMILY.goal.slice(0, 4), ...FAMILY.secret.slice(0, 3)], 0.25],
  [/\bhow\s+(?:old|many|much|big|tall|far|often|long)\b|\bwhat\s+(?:year|age|date|time)\b/i, [NUMBER], 0.5],
  [/\bhow\s+old\b|\b(?:what|which)\s+age\b|\bhow\s+many\s+years\b/i, FAMILY.age, 0.6],
  [/\bhow\s+old\b|\b(?:what|which)\s+age\b|\bhow\s+many\s+years\b|\bwhat\s+age\b/i, [AGE], 1],
  [/\bhow\s+(?:long|big|short)\b|\bhow\s+(?:many|much)\s+(?:words?|pages?|chapters?|minutes?|episodes?|acts?|parts?|scenes?)\b|\bword\s+count\b|\blength\b|\bruntime\b|\brun\s+time\b/i, LENGTH_CUE, 0.5],
  [/\bhow\s+(?:long|big|short)\b|\bhow\s+(?:many|much)\s+(?:words?|pages?|chapters?|minutes?|episodes?|acts?|parts?|scenes?)\b|\bword\s+count\b|\blength\b|\bruntime\b|\brun\s+time\b/i, [SIZE], 0.9],
  [/\bfor\s+a\s+living\b|\b(?:job|career|profession|occupation)\b|\bwhat\s+does\s+\S+\s+do\b|\bworks?\s+as\b/i, [...OCCUPATION, JOB], 0.5],
  [NAME_QUESTION, [NAME], 0.45],
  [/\b(?:title|titled)\b|\b(?:called|named)\b[^.?!]{0,25}\b(?:book|story|novel|piece|project|script|film|series)\b|\b(?:book|story|novel|piece|project|script|film|series)\b[^.?!]{0,25}\b(?:called|named)\b|\bwhat(?:'s|\s+is)\s+it\s+called\b/i, stemsOf('title'), 1.2],
  [/\bwhat\b[^.?!]{0,30}\babout\b|\bpremise\b|\bplot\b|\bsynopsis\b|\bsummary\b/i, stemsOf('premise theme plot idea concept'), 0.5],
  [/\bwriting\s+for\b|\bwho\b[^.?!]{0,20}\bfor\b|\btarget\s+(?:reader|audience)|\bfor\s+whom\b/i, FAMILY.audience, 1],
  [/\bgenre\b|\bwhat\s+(?:kind|type|sort)\s+of\s+(?:story|book|novel|film|movie|piece|project|script|show|series|writing|thing|text|work|genre)\b|\bwhat\s+(?:kind|type|sort)\s+of\s*[?.!]*$/i, FAMILY.genre, 0.6],
  [/\bhow\b[^.?!]{0,12}\b(?:feel|feels|read|reads|sound|sounds)\b/i, FAMILY.tone, 0.4],
];
// the cues that need no word of the question to go with them ("how old am I?")
const BARE_CUES = new Set([AGE, SIZE]);
const NOISE = new Set(tokenize(NOISE_WORDS));
/** Greetings that contain content words ("good MORNING"): taken out before the message is read for search words. */
const SMALL_TALK = /\b(?:good\s+(?:morning|afternoon|evening|night)|how\s+are\s+you(?:\s+(?:doing|feeling|today|this\s+\w+))*|how'?s\s+it\s+going|see\s+you(?:\s+(?:later|tomorrow|soon))?|talk\s+(?:later|soon))\b/gi;

const K1 = 1.2;
const B = 0.75;
const MAX_TERMS = 80;
const PER_SOURCE = 3;
const IDF_FLOOR = 0.3;
const RELATED = 0.5; // a word that begins like the search word ("survival" for "survive") counts half
const PAIR_BONUS = 0.35;
const PHRASE_BONUS = 0.3; // per run of three neighbouring words of the question that the passage has too (stopwords included: "where Carol and I")
const APPOSITIVE_BONUS = 0.6; // "Dad, Ray Pollard": the word of the question is followed by a name
const LINK_WEIGHT = 0.7; // "mum" for "Dolores", when the writer said "my mum Dolores"

/** The names the writer recorded in this project (characters and their other names, the premise's figures): their stems. */
function knownNames(project) {
  const out = new Set();
  try {
    const add = (v) => {
      if (typeof v === 'string') for (const t of tokenize(v)) out.add(t);
    };
    for (const c of Array.isArray(project?.memory?.characters) ? project.memory.characters.slice(-200) : []) {
      add(c?.name);
      if (Array.isArray(c?.aliases)) c.aliases.slice(0, 10).forEach(add);
    }
    if (Array.isArray(project?.conversation?.workingPremise?.characters)) project.conversation.workingPremise.characters.slice(0, 12).forEach(add);
  } catch {
    /* something unreadable in the project: the names found so far stand */
  }
  return out;
}

// ── who is who: "my mum Dolores", "the baker Ines", "Brandt, her boss" ───────

const KINSHIP = 'mum mom mother mama mummy dad father papa daddy gran granny grandma grandmother grandpa grandfather granddad uncle aunt auntie aunty sister brother cousin wife husband son daughter nephew niece friend boss partner fiance fiancee lover neighbour neighbor teacher mentor rival';
const ROLE_STEMS = new Set([...stemsOf(KINSHIP), ...OCCUPATION.filter((w) => !['job', 'work', 'work', 'career', 'profession', 'occupation', 'employ', 'employed', 'living', 'trade', 'role'].includes(w))]);
const NAME_PAT = "\\p{Lu}[\\p{L}'’-]+(?:\\s+\\p{Lu}[\\p{L}'’-]+){0,2}";
const ROLE_THEN_NAME = new RegExp(`(?<![\\p{L}-])([\\p{L}-]{3,})(?:['’]s)?,?\\s+(${NAME_PAT})`, 'gu');
const NAME_THEN_ROLE = new RegExp(`(${NAME_PAT})(?:['’]s)?,?\\s+(?:(?:is|was|are|were)\\s+)?(?:my|his|her|their|our|the|a|an)\\s+((?:[\\p{Ll}'’-]+\\s+){0,2}[\\p{Ll}-]{3,})\\b`, 'gu');
const MAX_LINKS = 300;

/**
 * Role words and the names the writer gave them, from the writer's own phrases ("my mum Dolores", "the baker Ines", "Pim, her assistant"), so that a question about
 * "Mum" finds what was said about Dolores and the other way round. A function of the passages it is given, nothing kept. Returns { roles: stem -> name stems, names: stem -> role stems }.
 */
export function roleLinks(passages) {
  const roles = new Map();
  const names = new Map();
  let n = 0;
  for (const p of passages) {
    if (p.by === 'nie' || p.source === 'rule' || p.source === 'profile') continue;
    for (const [role, name] of rolePairsIn(p.text)) {
      if (n >= MAX_LINKS) return { roles, names };
      (roles.get(role) ?? roles.set(role, new Set()).get(role)).add(name);
      (names.get(name) ?? names.set(name, new Set()).get(name)).add(role);
      n++;
    }
  }
  return { roles, names };
}

/** [role stem, name stem] for each "my mum Dolores" / "Pim, her assistant" in a text (memoised by the exact text: the same passages are read again on every message). */
const rolePairsIn = memoByText((text) => {
  const out = [];
  if (!tokensOf(text).list.some((t) => ROLE_STEMS.has(t))) return out; // (no role word in it: nothing to find)
  const link = (role, name) => {
    // (the role is the last word of the phrase that is one: "a lighthouse keeper" is a keeper)
    const r = tokenize(role).reverse().find((w) => ROLE_STEMS.has(w));
    if (!r) return;
    for (const t of tokenize(name)) if (t !== r && !STOPWORDS.has(t) && t.length >= 2 && out.length < 12) out.push(Object.freeze([r, t]));
  };
  const body = text.length > 400 ? text.slice(0, 400) : text;
  for (const m of body.matchAll(ROLE_THEN_NAME)) link(m[1], m[2]);
  for (const m of body.matchAll(NAME_THEN_ROLE)) link(m[2], m[1]);
  return out;
});

/** The other written forms of a stem: with and without a final "e" ("hid" / "hide", "lov" / "love"), and with a doubled final letter ("stop" / "stopp"). */
function variantsOf(t) {
  const out = [];
  if (t.length >= 3 && /^\p{L}+$/u.test(t)) {
    out.push(t.endsWith('e') ? t.slice(0, -1) : `${t}e`);
    if (/(.)\1$/u.test(t) && t.length > 3) out.push(t.slice(0, -1));
    else if (t.length <= 5 && /[^aeiou][aeiou][bdgmnprt]$/.test(t)) out.push(t + t.at(-1));
  }
  return out;
}

/** Words the cues and the occupation list know (they are about a project even when this one never used them): "job", "genre", "synopsis". */
const CONCEPTS = new Set([...OCCUPATION, ...stemsOf('job jobs career profession occupation genre premise plot synopsis summary length audience reader readers title theme tone mood style voice age old young born year years word words page pages minute minutes chapter chapters act acts scene scenes')]);

const NO_LINKS = Object.freeze({ roles: new Map(), names: new Map() });

/**
 * Is this search word about this project: used in it (or written with another ending), a word the cues know, a role or name the writer gave, or a word whose word family has
 * a member the project uses ("deadline" when the writer says "ticking clock")? `has(stem)` says whether any passage uses the stem (see `projectHas`).
 */
function isGrounded(t, has, links) {
  if (CONCEPTS.has(t) || links.roles.has(t) || links.names.has(t) || has(t) || variantsOf(t).some(has)) return true;
  for (const mate of EXPAND.get(t) ?? []) if (has(mate)) return true;
  return false;
}

/** Every stem the project's passages use: what a question's words are compared with to see whether the question is about this project at all, and the words that "begin like" a search word. */
function vocabOf(passages) {
  const words = new Set();
  for (const p of passages) for (const t of tokensOf(p.text).set) words.add(t);
  return words;
}

/**
 * What a message looks for: { terms, pairs, phrases, appositive }.
 *   terms: term -> weight: the writer's own words 1 (names 1.6, the words that only name the book 0.35), the other forms of a word 0.9, the name the writer gave a role
 *     ("mum" -> Dolores) 0.7, a word family 0.6, a question word's family 0.25, and the pseudo terms above. Empty when the message has no usable word.
 *   pairs: neighbouring search words; phrases: runs of three neighbouring words of the message (stopwords included); appositive: words that should be followed by a name.
 */
function readQuery(project, query, topic, links = NO_LINKS, vocab = null) {
  const has = vocab ? (t) => vocab.has(t) : null;
  const q = `${typeof query === 'string' ? query : ''} ${typeof topic === 'string' ? topic : ''}`.slice(0, 2000).replace(SMALL_TALK, ' ');
  const literal = q.replace(HOW_ADJ, ' ');
  const terms = new Map();
  const names = nameStems(literal);
  const known = knownNames(project);
  const isName = (t) => names.has(t) || known.has(t);
  for (const t of tokenize(literal)) {
    if (NOISE.has(t)) continue;
    terms.set(t, Math.max(terms.get(t) ?? 0, isName(t) ? 1.6 : GENERIC.has(t) ? 0.35 : 1));
  }
  const out = { terms, pairs: new Set(), phrases: new Set(), appositive: [], stranger: null };
  if (!terms.size) {
    // ("how old am I?" has no word to look for, but says what kind of passage it wants)
    for (const [re, family, weight] of CUES) if (re.test(q)) for (const e of family) if (BARE_CUES.has(e)) terms.set(e, weight);
    return out;
  }
  const own = [...terms];
  for (const [t, w] of own) {
    if (w < 1 || isName(t)) continue; // (a name is looked for as written; a generic word brings nothing with it)
    for (const v of variantsOf(t)) if (!terms.has(v)) terms.set(v, 0.9 * w);
  }
  // A short question whose content words (two or more) are all, or (three or more) mostly, words this project never used and has no word family for ("who won the world cup", "how long does it take to boil an egg"), with no name
  // of this project in it, is about something else: only the writer's own words are looked for (no cues, no synonyms), and a passage must have most of them.
  const content = [...new Set(own.filter(([t, w]) => w >= 1 && !isName(t) && !GENERIC.has(t) && t.length >= 3 && !isNumberish(t)).map(([t]) => t))];
  // (only a short question: a longer message is a telling as well, and tells things this project has not heard yet)
  const short = (typeof query === 'string' ? query.match(WORD_RE) ?? [] : []).length <= 10;
  if (has && short && content.length >= 2 && !own.some(([t]) => isName(t) && has(t))) {
    const ungrounded = content.filter((t) => !isGrounded(t, has, links));
    if (ungrounded.length === content.length || (content.length >= 3 && ungrounded.length * 2 > content.length)) {
      out.stranger = content;
      for (const [t] of own) {
        for (const n of links.roles.get(t) ?? []) if (!terms.has(n)) terms.set(n, LINK_WEIGHT);
        for (const r of links.names.get(t) ?? []) if (!terms.has(r)) terms.set(r, 0.5);
      }
      return out;
    }
  }
  for (const [t, w] of own) {
    if (GENERIC.has(t)) continue;
    // who is who: a role in the question finds the name the writer gave it, and a name finds the role words
    for (const n of links.roles.get(t) ?? []) if (!terms.has(n)) terms.set(n, LINK_WEIGHT);
    for (const r of links.names.get(t) ?? []) if (!terms.has(r)) terms.set(r, 0.5);
    if (known.has(t)) continue; // (a character's own name brings no synonyms; a capitalised "Mum" or "Dad" does)
    for (const e of EXPAND.get(t) ?? []) if (!terms.has(e)) terms.set(e, 0.6 * Math.min(1, w));
  }
  for (const [re, family, weight] of CUES) if (re.test(q)) for (const e of family) if (!terms.has(e) || terms.get(e) < weight) terms.set(e, weight);
  if (terms.size > MAX_TERMS) out.terms = new Map([...terms].slice(0, MAX_TERMS));

  const list = tokenize(literal).filter((t) => out.terms.has(t) && !NOISE.has(t) && !GENERIC.has(t));
  for (let i = 0; i + 1 < list.length; i++) out.pairs.add(`${list[i]} ${list[i + 1]}`);
  const w = wordsLower(q);
  for (let i = 0; i + 2 < w.length && out.phrases.size < 40; i++) {
    const tri = w.slice(i, i + 3);
    if (tri.some((x) => x.length > 1 && !STOPWORDS.has(x) && !NOISE.has(x) && !GENERIC.has(tokenize(x)[0] ?? x))) out.phrases.add(tri.join(' '));
  }
  if (NAME_QUESTION.test(q)) out.appositive = [...new Set(w.filter((x) => x.length >= 3 && !STOPWORDS.has(x) && !NOISE.has(x) && !GENERIC.has(x) && !isName(tokenize(x)[0] ?? '')))].slice(0, 6);
  return out;
}

/** term -> weight (see `readQuery`): what a message looks for. Empty when the message has no usable word. */
export function queryTerms(project, query, topic = '') {
  const passages = passagesOf(project);
  return readQuery(project, query, topic, roleLinks(passages), vocabOf(passages)).terms;
}

/** The words of a text, lower case, possessive 's removed (the form in which question and passage are compared for phrases). */
function wordsLower(text) {
  return (typeof text === 'string' ? text.slice(0, 2000).toLowerCase().match(WORD_RE) ?? [] : []).map((x) => x.replace(/['’]s$/, '')).slice(0, 400);
}

/** Does `lower` hold the word `w` (on its own) followed by a capitalised name in `text` ("Dad, Ray Pollard", "mum Dolores")? */
function followedByName(text, lower, w) {
  let from = 0;
  for (let k = 0; k < 4; k++) {
    const i = lower.indexOf(w, from);
    if (i < 0) return false;
    from = i + w.length;
    if ((i > 0 && /\p{L}/u.test(lower[i - 1])) || /\p{L}/u.test(lower[from] ?? '')) continue;
    if (/^,?\s+\p{Lu}/u.test(text.slice(from, from + 8))) return true;
  }
  return false;
}

// ── scoring ──────────────────────────────────────────────────────────────────

/** Does the stem `u` begin like the search word `t`? ("survival" and "survive"; "rebellion" and "rebel") Five letters at least, and most of the shorter word. */
function related(t, u) {
  if (t === u || t.length < 5 || u.length < 5) return false;
  const n = Math.min(t.length, u.length);
  let i = 0;
  while (i < n && t[i] === u[i]) i++;
  return i >= 5 && i >= 0.75 * n;
}

/**
 * BM25 with the idf scaled to 0..1 (a word in one passage of many is about 0.9, a word in a tenth of them about 0.35), so `minScore` means the same for any project size.
 * The scaled idf never falls below IDF_FLOOR: in a project with three passages every word is "common", but two words in common are still a match.
 * Returns each passage that matched anything as { p, raw, mult, score }: `raw` is the word statistics, `mult` what the source and recency make of it.
 */
function score(passages, vocab, { terms }, recency) {
  const N = passages.length;
  const df = new Map();
  const hits = new Array(N);
  let totalLen = 0;
  // words of the passages that begin like a search word (counted half, as the search word)
  const longTerms = [...terms.keys()].filter((t) => t.length >= 5 && !isFeature(t));
  const alias = new Map();
  if (longTerms.length) {
    // (`related` needs five letters in common at the start, so only search words with the same first five letters are compared)
    const byPrefix = new Map();
    for (const t of longTerms) (byPrefix.get(t.slice(0, 5)) ?? byPrefix.set(t.slice(0, 5), []).get(t.slice(0, 5))).push(t);
    for (const u of vocab) {
      if (u.length < 5 || terms.has(u)) continue;
      for (const t of byPrefix.get(u.slice(0, 5)) ?? []) if (related(t, u)) { alias.set(u, t); break; }
    }
  }
  const features = [...terms.keys()].filter(isFeature);
  for (let i = 0; i < N; i++) {
    const toks = tokensOf(passages[i].text).list;
    totalLen += toks.length;
    let counts = null;
    const bump = (t, by) => {
      counts ??= new Map();
      counts.set(t, (counts.get(t) ?? 0) + by);
    };
    for (const tok of toks) {
      if (terms.has(tok)) bump(tok, 1);
      else if (alias.size && alias.has(tok)) bump(alias.get(tok), RELATED);
    }
    for (const f of features) if (FEATURES[f](toks, passages[i].text)) bump(f, 1);
    hits[i] = counts ? { counts, len: toks.length } : null;
    if (counts) for (const t of counts.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const avg = totalLen / (N || 1) || 1;
  const norm = Math.log(N + 2);
  const out = [];
  for (let i = 0; i < N; i++) {
    const h = hits[i];
    if (!h) continue;
    let raw = 0;
    for (const [t, f] of h.counts) {
      const d = df.get(t);
      const idf = Math.max(IDF_FLOOR, Math.log(1 + (N - d + 0.5) / (d + 0.5)) / norm);
      raw += terms.get(t) * idf * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * h.len) / avg)));
    }
    const p = passages[i];
    // the writer's deliberate acts count for more than a casual remark, and what was said lately a little more
    const mult = (0.75 + 0.5 * p.weight) * (1 + 0.12 * (recency.get(p.id) ?? 0));
    out.push({ p, raw, mult, score: raw * mult });
  }
  return out;
}

const REFINE_TOP = 60; // the passages that get the finer (slower) bonuses: the rest cannot reach the top few

/**
 * The finer bonuses, for the best-scoring passages only (they cost a pass over each passage's words): neighbouring search words side by side, three words of the question in a row
 * ("where Carol and I"), and the word of a "what is he called" question followed by a name ("Dad, Ray Pollard"). Returns all the scored passages, best first.
 */
function refine(scored, { pairs, phrases, appositive }) {
  scored.sort((a, b) => b.score - a.score || b.p.weight - a.p.weight);
  if (pairs.size || phrases.size || appositive.length) {
    for (const x of scored.slice(0, REFINE_TOP)) {
      let extra = 0;
      if (pairs.size) {
        const toks = tokensOf(x.p.text).list;
        let pair = 0;
        for (let k = 0; k + 1 < toks.length; k++) if (pairs.has(`${toks[k]} ${toks[k + 1]}`)) pair++;
        extra += PAIR_BONUS * Math.min(2, pair);
      }
      if (phrases.size) {
        const w = wordsLower(x.p.text);
        let run = 0;
        for (let k = 0; k + 2 < w.length; k++) if (phrases.has(`${w[k]} ${w[k + 1]} ${w[k + 2]}`)) run++;
        extra += PHRASE_BONUS * Math.min(2, run);
      }
      if (appositive.length) {
        const lower = x.p.text.toLowerCase();
        if (lower.length === x.p.text.length && appositive.some((w) => followedByName(x.p.text, lower, w))) extra += APPOSITIVE_BONUS;
      }
      x.score = (x.raw + extra) * x.mult;
    }
    scored.sort((a, b) => b.score - a.score || b.p.weight - a.p.weight);
  }
  return scored;
}

/** 0..1 for each statement the writer said: the newest is 1. By order, not by clock, so the same project always ranks the same way. */
function recencyOf(passages) {
  const m = new Map();
  const said = passages.filter((p) => p.source === 'said');
  said.forEach((p, i) => m.set(p.id, said.length > 1 ? i / (said.length - 1) : 1));
  return m;
}

// ── choosing what to show ────────────────────────────────────────────────────

const HEADER = "What you already know about this project, in the writer's own words (most relevant first):";
const NIE_HEADER = "Ideas NIE gave the writer earlier that they kept on the Idea Board (NIE's ideas, not the writer's words):";
const SHOW_CHARS = 300;

/** A question mostly made of words this project never used is answered only by a passage that has most of its words: one word in common ("take" in "boil an egg") is chance. */
function mostlyHas(passage, words) {
  const have = tokensOf(passage.text).set;
  let n = 0;
  for (const w of words) if (have.has(w)) n++;
  return n * 2 >= words.length;
}

const isPlain = (v) => v !== null && typeof v === 'object';
/** A number within bounds, else the default (a caller's NaN, Infinity or text must not turn a bounded answer into an unbounded one). */
const bounded = (v, min, max, fallback) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback);

const asSet = (v) => (v instanceof Set ? v : new Set(Array.isArray(v) ? v : []));

/** The passage `cand` adds nothing to `kept`: (almost) all its words are already there, or the two share nearly all of theirs. (A longer passage that contains a shorter one adds what the shorter lacks, and stays.) */
function nearDuplicate(kept, cand) {
  if (!kept.size || !cand.size) return false;
  let n = 0;
  for (const t of cand) if (kept.has(t)) n++;
  return (cand.size >= 3 && n / cand.size >= 0.85) || n / (kept.size + cand.size - n) >= 0.8;
}

/** A test for "already shown elsewhere": by id, by text (without regard to case or punctuation), or as a line of text the caller says is already in the prompt. */
function alreadyShown(exclude, excludeText) {
  const ids = new Set();
  const texts = new Set();
  for (const e of exclude) {
    if (typeof e !== 'string') continue;
    ids.add(e);
    texts.add(normText(e));
  }
  const shown = normText(typeof excludeText === 'string' ? excludeText.slice(0, 40000) : '');
  if (!ids.size && !shown) return () => false; // (nothing to leave out: no need to normalise every passage)
  return (p) => {
    if (ids.has(p.id)) return true;
    const norm = normText(p.text);
    return texts.has(norm) || (shown !== '' && norm.length >= 12 && shown.includes(norm));
  };
}

/**
 * From passages in order of relevance, pick what is shown: no near duplicates, at most `perSource` (3) per source, within `limit` and the token budget.
 * NIE's own board ideas go in a section of their own, so they are never taken for something the writer said.
 */
function choose(ranked, { limit, budgetTokens, perSource: maxPerSource = PER_SOURCE }) {
  const items = [];
  const kept = [];
  const perSource = new Map();
  let used = estimateTokens(HEADER);
  for (const { p, score: s } of ranked) {
    if (items.length >= limit) break;
    if ((perSource.get(p.source) ?? 0) >= maxPerSource) continue;
    const toks = tokensOf(p.text).set;
    if (kept.some((k) => nearDuplicate(k, toks))) continue;
    const line = `- ${clip(p.text, SHOW_CHARS)} (${p.where})`;
    const cost = estimateTokens(line) + (p.by === 'nie' && !items.some((x) => x.by === 'nie') ? estimateTokens(NIE_HEADER) : 0);
    if (used + cost > budgetTokens) continue; // a shorter passage further down may still fit
    used += cost;
    perSource.set(p.source, (perSource.get(p.source) ?? 0) + 1);
    kept.push(toks);
    items.push({ id: p.id, source: p.source, where: p.where, text: p.text, score: Math.round(s * 1000) / 1000, ...(p.by ? { by: p.by } : {}) });
  }
  return items;
}

function blockOf(items) {
  const line = (x) => `- ${clip(x.text, SHOW_CHARS)} (${x.where})`;
  const mine = items.filter((x) => x.by !== 'nie');
  const nies = items.filter((x) => x.by === 'nie');
  return [mine.length ? `${HEADER}\n${mine.map(line).join('\n')}` : '', nies.length ? `${NIE_HEADER}\n${nies.map(line).join('\n')}` : ''].filter(Boolean).join('\n\n');
}

function result(items, considered) {
  const sources = {};
  for (const x of items) sources[x.source] = (sources[x.source] ?? 0) + 1;
  return { items, block: blockOf(items), stats: { considered, shown: items.length, sources } };
}

/**
 * The earlier things in this project that bear on `query` (the writer's message; `topic` adds words from NIE's reading of it).
 * @param {object} project
 * @param {string} query
 * @param {{ limit?: number, budgetTokens?: number, exclude?: Set<string>|string[], excludeText?: string, minScore?: number, topic?: string, includeSheet?: boolean, turn?: number, now?: number }} [opts]
 *   `exclude`: passage ids or texts already shown elsewhere; `excludeText`: text already in the prompt (a passage that is a line of it is dropped);
 *   `turn`: the newest message number (for "N messages ago"); `now` is accepted for callers that pass a clock, and unused: recency here is by order.
 * @returns {{ items: { id, source, where, text, score, by? }[], block: string, stats: { considered: number, shown: number, sources: object } }}
 */
export function recall(project, query, options) {
  const { limit: wantLimit = 6, budgetTokens: wantBudget = 420, exclude = new Set(), excludeText = '', minScore: wantMin = 0.4, topic = '', includeSheet = true, turn = null } = isPlain(options) ? options : {};
  const limit = bounded(wantLimit, 0, 50, 6);
  const budgetTokens = bounded(wantBudget, 0, 4000, 420);
  const minScore = bounded(wantMin, 0, 1000, 0.4);
  const passages = passagesOf(project, { includeSheet, turn });
  const vocab = vocabOf(passages);
  const read = readQuery(project, query, topic, roleLinks(passages), vocab);
  if (!read.terms.size || !passages.length) return result([], passages.length);
  const shown = alreadyShown(asSet(exclude), excludeText);
  const scored = refine(
    score(passages, vocab, read, recencyOf(passages)).filter((x) => !shown(x.p) && (!read.stranger || mostlyHas(x.p, read.stranger))),
    read
  );
  // (a passage far behind the best one is a stray word in common, not an answer: it must reach `minScore` and a third of the best one still on offer)
  const floor = Math.max(minScore, (scored[0]?.score ?? 0) * 0.35);
  return result(choose(scored.filter((x) => x.score >= floor), { limit, budgetTokens }), passages.length);
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Everything in this project that mentions any of `names` (for "who is Corin?"): a character's recorded name and other names count as the same person.
 * Strongest sources first, the writer's newest statements first among equals.
 * @returns the same shape as `recall`
 */
export function recallNames(project, names, options) {
  const { limit: wantLimit = 8, budgetTokens: wantBudget = 420, exclude = new Set(), excludeText = '', includeSheet = true, turn = null, perSource: wantPer = 5 } = isPlain(options) ? options : {};
  const limit = bounded(wantLimit, 0, 50, 8);
  const budgetTokens = bounded(wantBudget, 0, 4000, 420);
  const perSource = bounded(wantPer, 1, 50, 5);
  const passages = passagesOf(project, { includeSheet, turn });
  const wanted = new Set();
  for (const n of (Array.isArray(names) ? names : [names]).slice(0, 8)) {
    const v = typeof n === 'string' ? n.replace(/\s+/g, ' ').trim().slice(0, 60) : '';
    if (v.length >= 2) wanted.add(v.toLowerCase());
  }
  // one person, several names: a recorded character's name and aliases stand for each other
  try {
    for (const c of Array.isArray(project?.memory?.characters) ? project.memory.characters.slice(-200) : []) {
      const all = [c?.name, ...(Array.isArray(c?.aliases) ? c.aliases.slice(0, 10) : [])].filter((x) => typeof x === 'string' && x.trim().length >= 2).map((x) => x.trim().slice(0, 60).toLowerCase());
      if (all.some((x) => wanted.has(x))) all.forEach((x) => wanted.add(x));
    }
  } catch {
    /* something unreadable in the project: the names given stand */
  }
  if (!wanted.size) return result([], passages.length);
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${[...wanted].map(escapeRe).join('|')})(?![\\p{L}\\p{N}])`, 'iu');
  const total = passages.length;
  const shown = alreadyShown(asSet(exclude), excludeText);
  const ranked = passages
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => re.test(p.text) && !shown(p))
    .sort((a, b) => b.p.weight - a.p.weight || b.i - a.i)
    .map(({ p }) => ({ p, score: p.weight }));
  return result(choose(ranked, { limit, budgetTokens, perSource }), total);
}
