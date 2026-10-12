import { dialogueSpans, estimateTokens, mean, splitParagraphs, splitSentences, STOPWORDS, words } from '../util/text.js';
import { isHeading } from './sections.js';

/**
 * Style facts, measured from the writer's own text. No model, no randomness, no guessing: the same text always gives the same profile, and every label
 * rests on a count that `describeStyle` can quote back to the writer.
 *
 * Why it exists: a 3B model that is asked to "understand the style" of a long text invents one. Measured facts are cheap, exact and checkable, and they
 * go into the model's prompt as `promptLine` so its replies match the writer's own voice and vocabulary.
 *
 * The heuristics are plain word lists and ratios. They are deliberately conservative: when the evidence is thin (a handful of pronouns, a handful of verb
 * cues) a label says 'unclear' or 'mixed' rather than guessing, and a line that cannot be supported is left out of `promptLine`.
 * Nothing here judges quality. It describes, it never praises or criticises.
 */

// ── word lists ────────────────────────────────────────────────────────────────

const set = (s) => new Set(s.split(/\s+/).filter(Boolean));

/** Words that are never a "distinctive recurring term": function words plus ordinary openers, calendar words and heading words. */
const ORDINARY = new Set([
  ...STOPWORDS,
  ...set(
    'also always never ever many much still even yet really around among within without upon nothing everything something anything someone everyone anyone nobody ' +
      'every another might must shall may one two three four five six seven eight nine ten first second third last next though although however whether since per via ' +
      'like whose perhaps maybe suddenly finally meanwhile later then today tomorrow yesterday tonight soon twice here there yes oh ah okay ok well mr mrs ms dr sir lady lord ' +
      'inside outside across along toward towards despite behind beyond near hence thus therefore instead otherwise mostly almost already indeed besides whereas ' +
      'year years day days week weeks month months season winter summer spring autumn january february march april june july august september october november december ' +
      'monday tuesday wednesday thursday friday saturday sunday chapter part book act scene section prologue epilogue appendix contents morning evening night noon dawn dusk'
  ),
]);

const FIRST = set("me my myself we us our ours ourselves i'm i've i'll i'd we're we've we'll we'd");
const SECOND = set("you your yours yourself yourselves you're you've you'll you'd");
const THIRD = set("he him his himself she her hers herself they them their theirs themselves he's she's they're he'd she'd they'd he'll she'll they'll they've");
const FIRST_I = set("i i'm i've i'll i'd");
// "Part I", "Chapter I": a roman numeral, not the narrator
const NUMERAL_CONTEXT = set('chapter part book act scene section volume vol appendix world war king queen henry louis pope no');

/** Finite past forms that are (almost) never anything else. */
const PAST_SURE = set(
  "was were wasn't weren't had hadn't did didn't went came saw took made knew gave found told held kept stood sat ran began brought wrote spoke heard fell became met paid sent " +
    'spent built bought caught taught understood woke drove rode grew threw wore won slept shook hid broke chose drew flew forgot froze meant sang sank sold stole swam swung tore ' +
    'ate drank dug fought rang sought slid spun sprang strode blew fled flung knelt shone swore got said led'
);
/** Past forms that double as nouns or adjectives: believed only straight after a subject ("she thought", "Mara left"). */
const PAST_AFTER_SUBJECT = set('thought left felt lost rose stuck struck shot lit bent fed bore bled hung');
/** Finite present forms that are (almost) never anything else. */
const PRESENT_SURE = set(
  "is are am isn't aren't does doesn't don't has hasn't haven't i'm you're we're they're he's she's it's that's there's here's what's who's i've you've we've they've"
);
/** Plain verbs: after I / we / you / they they are present tense ("you open", "they eat"). */
const BASE_VERBS = set(
  'go come see take make know think get give find tell feel leave keep hold stand sit run begin bring write speak hear say ask work look want need use try call move play turn start ' +
    'show help talk open close walk wait watch stop press pull push fill add remove place check like love hate live believe remember forget understand learn follow carry build buy pay ' +
    'meet eat drink sleep wake drive ride fall grow win lose wear throw catch break choose hide send spend teach wish hope wonder notice miss mean seem appear become remain stay reach ' +
    'pass pick mix stir pour heat cool cook wash clean fix measure repeat enter hear sense find need keep lift lower slide hunt stalk coordinate'
);
/** Verbs that start an instruction ("Press the switch"): present tense when they open a sentence and a determiner or particle follows. */
const IMPERATIVE = set(
  'open close press hold pull push turn place add remove insert connect attach fill pour stir mix heat wait check make take put keep use follow repeat wash cut pick lift lower slide ' +
    'tighten loosen plug unplug start stop select click choose enter type save write go come look listen remember ensure'
);
const IMPERATIVE_NEXT = set(
  'the a an your it them this that these those each every all any both one two three down up out off on in back away over until for to firmly gently slowly carefully again once immediately first'
);
const NOT_ED = set('need feed seed speed bleed breed weed heed bed red shed wed hundred indeed proceed succeed exceed naked sacred wicked kindred');
const NOT_S = set('this his its was has does is as us yes thus always perhaps sometimes towards afterwards besides whereas hers ours yours theirs themselves means news series');
const SUBJECT = set('i he she we they you it who which that');
const THIRD_SG = set('he she it who which');
const BASE_SUBJECT = set('i we you they');
/** Verbs of thinking and saying: "knew that guards watched" has "that" as a conjunction, so "guards" is a plural noun, not a verb. */
const COGNITION = set(
  'know knows knew think thinks thought believe believes believed say says said see sees saw feel feels felt hope hopes hoped learn learns learned learnt notice notices noticed ' +
    'realize realise realizes realises realized realised find finds found show shows showed suggest suggests suggested ensure ensures ensured mean means meant remember remembers remembered ' +
    'hear hears heard so now'
);
const MODALS = set('would could should might must can will shall may have be been do');
const ADVERB_SKIP = set('not never also always still just often only even already soon then now');

const IMAGERY = set(
  'light dark shadow shadows moon sun star stars sky sea water river wind rain snow ice fire flame flames ash dust smoke silver gold golden pale glow glowing shimmer shimmering ' +
    'gleam whisper whispers silence silent hush breath bloom blossom petal petals thorn salt tide tides wave waves ocean mist cloud clouds twilight autumn amber crimson scarlet ' +
    'velvet marble feather feathers stone stones ember embers lantern harbour harbor horizon moonlight sunlight starlight dew frost thunder lightning storm'
);

const TERMINAL = /[.!?…]["'”’)\]]*$/;
const CLOSED_BY_QUOTE = /[!?…]["”’']+$/;
const MAX_SPOKEN_CHARS = 1500; // a longer "quote" is almost certainly two stray marks pairing up across narration

// A time stamp is a short label that places what follows in time: "Year six, May.", "Day 12", "March 3, 1987".
const NUMBER_WORD =
  '(?:\\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)';
const STAMP_NUMBER = `(?:(?:minus|negative)\\s+)?${NUMBER_WORD}(?:\\s+and\\s+a\\s+half)?`;
const STAMP = new RegExp(
  `^(?:Year|Day|Week|Month|Cycle)\\s+${STAMP_NUMBER}(?:\\s+(?:to|and)\\s+${STAMP_NUMBER})*(?=\\s*(?:[,.:;—–]|$))`,
  'u'
);
const MONTH = '(?:January|February|March|April|May|June|July|August|September|October|November|December)';
const DATE_STAMP = new RegExp(`^(?:${MONTH}\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s+\\d{4})?|\\d{1,2}(?:st|nd|rd|th)?\\s+${MONTH}(?:,?\\s+\\d{4})?)[.:]?$`, 'u');

// ── small helpers ─────────────────────────────────────────────────────────────

const r1 = (n) => Math.round(n * 10) / 10;
const r3 = (n) => Math.round(n * 1000) / 1000;
const share = (a, b) => (b > 0 ? r3(a / b) : 0);
const median = (a) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const LINE_BREAKS = new RegExp(`\\r\\n?|[${String.fromCharCode(0x2028)}${String.fromCharCode(0x2029)}]`, 'g');

/** CRLF, a byte-order mark and Unicode line separators become plain text; anything that is not a string is "no text". */
function clean(text) {
  if (typeof text !== 'string') return '';
  const body = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  return body.replace(LINE_BREAKS, '\n');
}

/** Letters are mostly capitals: capitalisation then says nothing about names or sentence starts. The first 20,000 characters are enough to tell. */
function isAllCaps(s) {
  let upper = 0;
  let lower = 0;
  const n = Math.min(s.length, 20000);
  for (let i = 0; i < n; i++) {
    const c = s.charCodeAt(i);
    if (c < 128) {
      if (c >= 65 && c <= 90) upper++;
      else if (c >= 97 && c <= 122) lower++;
    } else {
      const ch = s[i];
      if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) upper++;
      else if (ch === ch.toLowerCase() && ch !== ch.toUpperCase()) lower++;
    }
  }
  return upper + lower >= 20 && upper / (upper + lower) > 0.85;
}

function emptyProfile() {
  return {
    words: 0,
    sentences: 0,
    paragraphs: 0,
    sentence: { mean: 0, median: 0, longShare: 0, shortShare: 0, longest: 0 },
    paragraph: { meanWords: 0 },
    dialogue: { share: 0, lines: 0 },
    pov: { label: 'unclear', first: 0, second: 0, third: 0 },
    tense: { label: 'unclear', past: 0, present: 0 },
    register: { label: 'narrative', abstractShare: 0, technicalShare: 0 }, // with no text the label is only a default; promptLine and describeStyle say nothing about it
    structure: [],
    signature: [],
    promptLine: '',
  };
}

// ── tokens ────────────────────────────────────────────────────────────────────

/**
 * Words with the little context the heuristics need: `init` (starts a sentence: after . ! ? … : a line break or an opening quote) and `prev` (the word
 * right before it, only when nothing but blanks lies between, so a comma, a full stop or a removed quotation breaks the link).
 */
function tokenize(text) {
  const re = /([\p{L}\p{N}][\p{L}\p{N}'’-]*)|(["“”‘]|\n|[.!?…:;,])/gu;
  const out = [];
  let initNext = true;
  let last = null;
  let m;
  while ((m = re.exec(text))) {
    if (m[1] !== undefined) {
      const raw = m[1].replace(/[-'’]+$/, '');
      if (!raw) continue;
      const start = m.index;
      const end = start + raw.length;
      const tok = {
        raw,
        lo: raw.replace(/’/g, "'").toLowerCase(),
        start,
        end,
        init: initNext,
        cap: /^\p{Lu}/u.test(raw),
        prev: last && start - last.end <= 3 && /^[ \t]+$/.test(text.slice(last.end, start)) ? last : null,
      };
      initNext = false;
      last = tok;
      out.push(tok);
      continue;
    }
    const c = m[2];
    if (c === '“' || c === '‘') initNext = true;
    else if (c === '"') {
      if (m.index === 0 || /[\s(\[—–-]/.test(text[m.index - 1])) initNext = true; // an opening mark; a closing one leaves things as they were
    } else if (c !== '”' && c !== ';' && c !== ',') initNext = true; // . ! ? … : and line breaks
  }
  return out;
}

// "Mara's hands shook": the word after a possessive is the thing owned, so a possessive is never the subject of the next word
const nameLike = (t) => t.cap && !ORDINARY.has(t.lo) && t.raw.length > 1 && !t.lo.endsWith("'s");
const isAdverb = (lo) => ADVERB_SKIP.has(lo) || (lo.length > 4 && lo.endsWith('ly'));
const beforeVerb = (t) => (t.prev && isAdverb(t.prev.lo) ? t.prev.prev : t.prev);

// ── dialogue ──────────────────────────────────────────────────────────────────

// Typographic single quotes (British style): an opening mark that starts a word, then a closing mark that does not sit inside one ("don’t" has an apostrophe, not a close)
const SINGLE_QUOTED = /(?<![\p{L}\p{N}])‘(?:[^’\n]|’(?=[\p{L}\p{N}])){0,1500}?’(?![\p{L}\p{N}])/gu;

/** Every quoted span: "straight", “curly” and ‘single curly’. A span inside another is part of it. */
function quotedSpans(src) {
  const spans = dialogueSpans(src);
  if (!src.includes('‘')) return spans;
  for (const m of src.matchAll(SINGLE_QUOTED)) spans.push({ text: m[0], start: m.index, end: m.index + m[0].length });
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const out = [];
  for (const sp of spans) if (!out.length || sp.start >= out.at(-1).end) out.push(sp);
  return out;
}

/** Quoted speech, not scare quotes or titles: it ends in punctuation inside the marks or runs four words or more. */
function spokenSpans(src) {
  return quotedSpans(src).filter((s) => {
    if (s.text.length > MAX_SPOKEN_CHARS) return false;
    const inner = s.text.slice(1, -1);
    const n = words(inner).length;
    return n > 0 && (n >= 4 || /[,.!?…;:—–-]\s*$/.test(inner));
  });
}

function withoutSpans(src, spans) {
  let out = '';
  let at = 0;
  for (const s of spans) {
    out += src.slice(at, s.start) + '\n'; // a removed quotation counts as a sentence break
    at = s.end;
  }
  return out + src.slice(at);
}

// ── sentences and paragraphs ──────────────────────────────────────────────────

/** A heading or other label line, not prose. */
function isLabelLine(p) {
  if (p.length > 120 || p.includes('\n')) return false; // a label is short and on one line
  const n = words(p).length;
  if (n === 0) return true; // "* * *", "---"
  return isHeading(p) && (n <= 4 || !TERMINAL.test(p));
}

/** Paragraphs as the writer made them; a text with line breaks but no blank lines is read line by line. */
function paragraphsOf(src) {
  const paras = splitParagraphs(src).map((p) => p.text);
  if (paras.length === 1 && paras[0].includes('\n')) {
    const lines = paras[0].split('\n').map((s) => s.trim()).filter(Boolean);
    if (lines.length >= 3) return lines;
  }
  return paras;
}

const isStamp = (s) => STAMP.test(s) || DATE_STAMP.test(s);

/** Sentences for length statistics (headings and time stamps are labels, not sentences) plus the time stamps found. */
function sentencesOf(src) {
  const merged = [];
  for (const p of splitSentences(src)) {
    const prev = merged.at(-1);
    // `"Where?" she asked.` is one sentence, not a question and a two-word fragment
    if (prev && CLOSED_BY_QUOTE.test(prev.text) && /^\p{Ll}/u.test(p.text) && !src.slice(prev.end, p.start).includes('\n')) {
      prev.text += ' ' + p.text;
      prev.end = p.end;
    } else merged.push({ ...p });
  }
  const stamps = [];
  const prose = [];
  const proseStarts = [];
  const all = [];
  const allStarts = [];
  for (const s of merged) {
    const n = words(s.text).length;
    if (!n) continue;
    if (isStamp(s.text)) {
      stamps.push(s.text.replace(/[.:;]+$/, ''));
      continue;
    }
    const start = (s.text.match(/[\p{L}']+/u) ?? [''])[0].toLowerCase();
    all.push(n);
    allStarts.push(start);
    if ((!TERMINAL.test(s.text) && n <= 9) || isLabelLine(s.text)) continue; // a heading or a trailing label
    prose.push(n);
    proseStarts.push(start);
  }
  return prose.length ? { lengths: prose, starts: proseStarts, stamps } : { lengths: all, starts: allStarts, stamps };
}

// ── person and tense ──────────────────────────────────────────────────────────

function countPronouns(tokens, text, allCaps) {
  let first = 0;
  let second = 0;
  let third = 0;
  for (const t of tokens) {
    const { raw, lo } = t;
    if (FIRST_I.has(lo)) {
      if (raw[0] === 'I') {
        if (raw === 'I' && t.prev && NUMERAL_CONTEXT.has(t.prev.lo)) continue;
        first++;
      } else if (raw === 'i' && text[t.start - 1] !== '(' && !/[).]/.test(text[t.end] ?? '')) first++; // all-lowercase typing; "(i)" is a list marker
      continue;
    }
    if (!allCaps && raw.length > 1 && raw === raw.toUpperCase()) continue; // an acronym ("US", "HE"), not a pronoun
    if (FIRST.has(lo)) first++;
    else if (SECOND.has(lo)) second++;
    else if (THIRD.has(lo)) third++;
  }
  return { first, second, third };
}

/**
 * With the characters' dialogue taken out, a third-person narrator has almost no I/me/my, so a large share of them means a first-person narrator even when
 * he or she mostly talks about other people (a memoir about a grandmother is full of "she"). Second and third person need a clear lead.
 */
function povLabel(first, second, third) {
  const n = first + second + third;
  if (n < 8) return 'unclear';
  const f = first / n;
  const s = second / n;
  const t = third / n;
  if (f >= 0.45 && f >= 0.75 * t && f > s) return 'first person';
  if (t >= 0.5 && t - Math.max(f, s) >= 0.15) return 'third person';
  if (s >= 0.5 && s - Math.max(f, t) >= 0.15) return 'second person';
  return 'mixed';
}

/** A word right after a plural noun that shows it is the verb ("guards watched", "members were"): so the word before it was not one. */
const verbal = (lo) => PAST_SURE.has(lo) || PRESENT_SURE.has(lo) || MODALS.has(lo) || (lo.length >= 4 && lo.endsWith('ed') && !lo.endsWith('eed') && !NOT_ED.has(lo));

/**
 * Counts the clear finite-verb cues in narration: auxiliaries and irregular forms, and -ed / -s / plain verbs straight after a subject.
 * A capital in the middle of a sentence is a name, never a verb ("Mara Jones" is not "Mara" + a verb "Jones"). A sentence-initial word is a name only if the
 * text never writes it in lower case ("Long shadows" is an adjective and a plural noun, "Mara walks" is a name and a verb). An -s word is a verb only if it is not
 * itself followed by a verb ("Council members voted") and, after "that", only when "that" is a relative pronoun ("a ledger that records", not "knew that guards watched").
 */
function countTense(tokens, allCaps) {
  let past = 0;
  let present = 0;
  const lowerSeen = new Set();
  for (const t of tokens) if (!t.cap) lowerSeen.add(t.lo);
  const nameStrict = (p) => nameLike(p) && (!p.init || !lowerSeen.has(p.lo));
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const lo = t.lo;
    if (!allCaps && t.cap && !t.init && !FIRST_I.has(lo)) continue;
    if (PAST_SURE.has(lo)) {
      past++;
      continue;
    }
    if (PRESENT_SURE.has(lo)) {
      present++;
      continue;
    }
    const p = beforeVerb(t);
    const subject = !!p && (SUBJECT.has(p.lo) || (!allCaps && nameLike(p)));
    if (PAST_AFTER_SUBJECT.has(lo)) {
      if (subject) past++;
      continue;
    }
    if (lo === 'have' || lo === 'do') {
      if (p && BASE_SUBJECT.has(p.lo)) present++;
      continue;
    }
    if (lo.length >= 4 && lo.endsWith('ed') && !lo.endsWith('eed') && !NOT_ED.has(lo)) {
      if (subject) past++;
      continue;
    }
    if (lo.length >= 4 && lo.endsWith('s') && !lo.includes("'") && !/(?:ss|us|ous)$/.test(lo) && !NOT_S.has(lo)) {
      const nx = tokens[i + 1];
      const noun = !!nx && nx.prev === t && verbal(nx.lo);
      let by = !!p && (THIRD_SG.has(p.lo) || (!allCaps && nameStrict(p)));
      if (p && p.lo === 'that' && !noun) {
        const q = p.prev;
        by = !(q && (COGNITION.has(q.lo) || PAST_SURE.has(q.lo) || (q.lo.length >= 4 && q.lo.endsWith('ed'))));
      }
      if (by && !noun) present++;
      continue;
    }
    if (BASE_VERBS.has(lo) && p && BASE_SUBJECT.has(p.lo)) {
      present++;
      continue;
    }
    if (t.init && IMPERATIVE.has(lo)) {
      const nx = tokens[i + 1];
      if (nx && nx.prev === t && IMPERATIVE_NEXT.has(nx.lo)) present++;
    }
  }
  return { past, present };
}

function tenseLabel(past, present) {
  const n = past + present;
  if (n < 8) return 'unclear';
  if (past / n >= 0.65) return 'past';
  if (present / n >= 0.65) return 'present';
  return 'mixed';
}

// ── register ──────────────────────────────────────────────────────────────────

const ABSTRACT = /(?:tion|sion|ity|ism|ology)$/;
const ABSTRACT_LONG = /(?:ment|ness|ance|ence)$/;
const ACRONYM = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/;
const ROMAN = /^[IVXLCDM]+$/;

// up to six capitals: longer all-caps words are headings and shouting ("WINDOWS", "SIGNING"), not acronyms
const isAcronym = (raw) => raw.length >= 2 && raw.length <= 7 && ACRONYM.test(raw) && /[A-Z].*[A-Z]|[A-Z]-/.test(raw) && !ROMAN.test(raw) && raw.replace(/-/g, '').length <= 6;

/** Lines with capitals and no lower-case letter at all: slug lines, speaker cues, shouted headings. Not running prose. */
function shoutedLines(text) {
  const out = [];
  for (let from = 0; from <= text.length; ) {
    let to = text.indexOf('\n', from);
    if (to < 0) to = text.length;
    const line = text.slice(from, to);
    if (line === line.toUpperCase() && line !== line.toLowerCase()) out.push({ start: from, end: to, words: words(line).length });
    from = to + 1;
  }
  return out;
}

/**
 * Abstract nouns (nominalisations) and technical vocabulary (acronyms, numbers, very long words) as shares of all words.
 * A word in capitals counts as an acronym only in running prose: "MARA" on a speaker cue or "NIGHT" in "INT. PUB - NIGHT" is layout, and so is any name
 * written in capitals in an action line when the same name also stands alone as a cue.
 */
function measureRegister(tokens, allCaps, text) {
  let abstract = 0;
  let technical = 0;
  const lines = allCaps ? [] : shoutedLines(text);
  const cues = new Set();
  for (const l of lines) if (l.words <= 5) for (const w of words(text.slice(l.start, l.end))) cues.add(w);
  let k = 0;
  for (const t of tokens) {
    const { raw, lo } = t;
    if (lo.length >= 7 && !t.cap && (ABSTRACT.test(lo) || (lo.length >= 8 && ABSTRACT_LONG.test(lo))) && !ORDINARY.has(lo)) abstract++;
    let acronym = false;
    if (!allCaps && isAcronym(raw) && !ORDINARY.has(lo)) {
      while (k < lines.length && lines[k].end <= t.start) k++;
      acronym = !(k < lines.length && lines[k].start <= t.start) && !cues.has(raw);
    }
    if (/\d/.test(raw) || acronym || (!t.cap && /^\p{L}{11,}$/u.test(raw))) technical++;
  }
  return { abstract, technical };
}

/** Light, weather and sense words plus similes ("like a", "as if") and repeated openings, per word. A crude but explainable sign of lyrical prose. */
function lyricalness(tokens, sentences) {
  let n = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (IMAGERY.has(t.lo)) n++;
    const nx = tokens[i + 1];
    if (nx && nx.prev === t && ((t.lo === 'like' && /^(?:a|an|the|some)$/.test(nx.lo)) || (t.lo === 'as' && (nx.lo === 'if' || nx.lo === 'though')))) n += 3;
  }
  let run = 1;
  let repeats = 0;
  for (let i = 1; i < sentences.length; i++) {
    run = sentences[i] && sentences[i] === sentences[i - 1] ? run + 1 : 1;
    if (run >= 3) repeats++;
  }
  return (n + repeats * 2) / Math.max(1, tokens.length);
}

// ── structure ─────────────────────────────────────────────────────────────────

const CHAPTER = /^(?:chapter|prologue|epilogue)\b/i;
const NUMBERED = /^(?:(?:part|book|act|section|scene)\s+(?:\d+|[ivxlc]+|one|two|three|four|five|six|seven|eight|nine|ten)\b|\d{1,3}\.?|[IVXLC]{1,7}\.?)\s*$/i;
const MARKDOWN = /^#{1,6}\s+\S/;
const BREAK = /^(?:\*{3,}|\* \* \*|[-–—_=~]{3,})$/;
// "INT. HARBOUR PUB - NIGHT": the scene heading of a screenplay
const SLUG = /^[ \t]*(?:INT|EXT|INT\.?\s*\/\s*EXT|EXT\.?\s*\/\s*INT|I\/E)(?:\.|\s)[^\n]{0,80}$/gm;

function structureOf(paras, stamps, wordTotal, src) {
  const kinds = [];
  const minStamps = wordTotal < 1000 ? 2 : 3;
  if (stamps.length >= minStamps) {
    const example = stamps.find((s) => s.length <= 32) ?? stamps[0].slice(0, 32);
    kinds.push({ kind: 'stamps', text: `time stamps ("${example}")` });
  }
  let chapters = 0;
  let parts = 0;
  let marks = 0;
  let breaks = 0;
  let titles = 0;
  paras.forEach((p, i) => {
    if (BREAK.test(p)) breaks++;
    else if (MARKDOWN.test(p)) marks++;
    else if (isLabelLine(p) && CHAPTER.test(p)) chapters++;
    else if (isLabelLine(p) && NUMBERED.test(p)) parts++;
    else if (p.length <= 90 && !p.includes('\n') && words(p).length <= 7 && !TERMINAL.test(p) && /^[\p{Lu}\d]/u.test(p) && words(paras[i + 1] ?? '').length >= 20) titles++;
  });
  if (chapters >= 2) kinds.push({ kind: 'chapters', text: 'chapter headings' });
  if (parts >= 2) kinds.push({ kind: 'parts', text: 'numbered parts' });
  if (marks >= 2) kinds.push({ kind: 'marks', text: 'headings marked with #' });
  if (titles >= 3) kinds.push({ kind: 'titles', text: 'titled sections' });
  if (breaks >= 2) kinds.push({ kind: 'breaks', text: 'scene breaks' });
  if ((src.match(SLUG) ?? []).length >= 2) kinds.push({ kind: 'slugs', text: 'screenplay scene headings (INT./EXT.)' });
  if (!kinds.length) kinds.push({ kind: 'none', text: 'no headings' });
  if (paras.length === 1 && wordTotal >= 600) kinds.push({ kind: 'block', text: 'one unbroken block (no paragraph breaks)' });
  return kinds;
}

// ── signature terms ───────────────────────────────────────────────────────────

const slicesFor = (n) => (n < 400 ? 1 : 10);
const bits = (mask) => {
  let n = 0;
  for (let m = mask; m; m &= m - 1) n++;
  return n;
};

/**
 * The terms that mark this text as its own: names, acronyms and coined phrases that keep coming back across it.
 * A capitalised word counts only if it is capitalised in the MIDDLE of a sentence at least once (so "Then", "Suddenly" and every other word that is capitalised
 * only because it starts a sentence is never picked) and is not mostly written in lower case elsewhere (so "Tide" can be a term, "Mark" in "mark my words"
 * cannot). Lower-case phrases must be two content words that almost always occur together, and a term must appear in more than one part of a long text.
 */
function signatureOf(tokens, allCaps) {
  if (allCaps || tokens.length < 40) return [];
  const N = tokens.length;
  const S = slicesFor(N);
  const needSpread = N >= 400 ? 2 : 1;
  const sliceOf = (i) => Math.min(S - 1, Math.floor((i * S) / N));

  const forms = tokens.map((t) => t.raw.replace(/['’]s$/i, ''));
  const lowerCount = new Map();
  const stats = new Map();
  tokens.forEach((t, i) => {
    const form = forms[i];
    const isCap = form.length >= 2 && t.cap;
    if (!isCap) {
      lowerCount.set(t.lo, (lowerCount.get(t.lo) ?? 0) + 1);
      return;
    }
    let s = stats.get(form);
    if (!s) stats.set(form, (s = { mid: 0, init: 0, mask: 0, first: i }));
    if (t.init) s.init++;
    else s.mid++;
    s.mask |= 1 << sliceOf(i);
  });

  const termOk = (form, s) => {
    if (!s) return false;
    const lo = form.toLowerCase();
    if (ORDINARY.has(lo) || form.length < 2) return false;
    const acronym = isAcronym(form);
    if (!acronym && form === form.toUpperCase()) return false; // a shouted word, not a name
    if (acronym) return true;
    return s.mid >= 1 && /\p{Ll}/u.test(form) && form.length >= 3;
  };

  const found = []; // { text, count, score, first, kind, parts }
  const spreadScore = (count, mask) => count * (0.5 + 0.5 * (bits(mask) / S));

  for (const [form, s] of stats) {
    if (!termOk(form, s)) continue;
    const count = s.mid + s.init;
    const lower = lowerCount.get(form.toLowerCase()) ?? 0;
    // an all-caps form of a word the text also writes normally ("WINDOWS" next to "Windows") is shouting, not an acronym
    if (isAcronym(form) && (lower > 0 || stats.has(form[0] + form.slice(1).toLowerCase()))) continue;
    if (count < 3 || lower / count > 0.35 || bits(s.mask) < needSpread) continue;
    found.push({ text: form, count, score: spreadScore(count, s.mask), first: s.first, kind: 'word', parts: [form] });
  }

  // names and terms of two or three capitalised words in a row: "Harbor Light", "Old Salt Market"
  const capTerm = (i) => {
    const f = forms[i];
    const s = stats.get(f);
    return termOk(f, s) && !isAcronym(f) && (!tokens[i].init || s.mid >= 1);
  };
  const phrases = new Map();
  for (let i = 0; i < N; i++) {
    if (!capTerm(i)) continue;
    let j = i;
    while (j + 1 < N && tokens[j + 1].prev === tokens[j] && j - i < 2 && capTerm(j + 1)) j++;
    if (j > i) {
      const key = forms.slice(i, j + 1).join(' ');
      const e = phrases.get(key) ?? { count: 0, mask: 0, first: i, parts: forms.slice(i, j + 1) };
      e.count++;
      e.mask |= 1 << sliceOf(i);
      phrases.set(key, e);
      i = j; // a sequence is counted once
    }
  }
  for (const [key, e] of phrases) {
    if (e.count < 2 || bits(e.mask) < Math.min(needSpread, 2)) continue;
    found.push({ text: key, count: e.count, score: spreadScore(e.count, e.mask) * 1.3, first: e.first, kind: 'phrase', parts: e.parts });
  }

  // two lower-case content words that nearly always appear together: "ember tide", "salt road"
  const pairs = new Map();
  // a coined term is a noun phrase: not a verb form, adverb, or function word
  const content = (t, f) =>
    !t.cap && f.length >= 4 && !ORDINARY.has(t.lo) && !/\d/.test(t.raw) && !/(?:ly|ing|ed)$/.test(t.lo) && !PAST_SURE.has(t.lo) && !PAST_AFTER_SUBJECT.has(t.lo) && !PRESENT_SURE.has(t.lo) && !BASE_VERBS.has(t.lo);
  for (let i = 1; i < N; i++) {
    const a = tokens[i - 1];
    const b = tokens[i];
    if (b.prev !== a || !content(a, forms[i - 1]) || !content(b, forms[i])) continue;
    const key = a.lo + ' ' + b.lo;
    const e = pairs.get(key) ?? { count: 0, mask: 0, first: i - 1, a: a.lo, b: b.lo };
    e.count++;
    e.mask |= 1 << sliceOf(i);
    pairs.set(key, e);
  }
  const minPair = N < 1500 ? 3 : 4;
  for (const [key, e] of pairs) {
    const cohesion = e.count / Math.max(1, Math.min(lowerCount.get(e.a) ?? 1, lowerCount.get(e.b) ?? 1));
    if (e.count < minPair || cohesion < 0.5 || bits(e.mask) < needSpread) continue;
    found.push({ text: key, count: e.count, score: spreadScore(e.count, e.mask), first: e.first, kind: 'coined', parts: [e.a, e.b] });
  }

  found.sort((x, y) => y.score - x.score || x.first - y.first || (x.text < y.text ? -1 : 1));

  // choose: a word that lives inside a chosen phrase is dropped; single words are capped so that coined phrases are not crowded out
  const chosen = [];
  let singles = 0;
  for (const c of found) {
    if (chosen.length >= 8) break;
    if (c.kind === 'word') {
      if (singles >= 6) continue;
      const inside = chosen.some((p) => p.kind !== 'word' && p.parts.includes(c.text) && c.count <= p.count * 1.5 + 1);
      if (inside) continue;
    } else if (chosen.some((p) => p.kind === c.kind && p.text !== c.text && (p.text.includes(c.text) || c.text.includes(p.text)))) continue;
    chosen.push(c);
    if (c.kind === 'word') singles++;
  }
  // a phrase chosen after one of its words removes that word
  return chosen
    .filter((c) => c.kind !== 'word' || !chosen.some((p) => p.kind === 'phrase' && p.parts.includes(c.text) && c.count <= p.count * 1.5 + 1))
    .map((c) => c.text);
}

// ── the profile ───────────────────────────────────────────────────────────────

export function styleProfile(text) {
  const src = clean(text);
  const wordTotal = words(src).length;
  if (!wordTotal) return emptyProfile();
  const allCaps = isAllCaps(src);

  // sentences and paragraphs
  const { lengths, starts, stamps } = sentencesOf(src);
  const paras = paragraphsOf(src);
  const proseParas = paras.filter((p) => !isLabelLine(p));
  const paraWords = (proseParas.length ? proseParas : paras).map((p) => words(p).length);

  // dialogue, and narration with the dialogue taken out (person and tense are the narrator's, not the characters')
  const spans = spokenSpans(src);
  const spokenWords = spans.reduce((n, s) => n + words(s.text).length, 0);
  const tokens = tokenize(src);
  const narration = spans.length ? tokenize(withoutSpans(src, spans)) : tokens;
  const narrationText = spans.length ? withoutSpans(src, spans) : src;

  const { first, second, third } = countPronouns(narration, narrationText, allCaps);
  const pn = first + second + third;
  const pov = { label: povLabel(first, second, third), first: share(first, pn), second: share(second, pn), third: share(third, pn) };

  const { past, present } = countTense(narration, allCaps);
  const tn = past + present;
  const tense = { label: tenseLabel(past, present), past: share(past, tn), present: share(present, tn) };

  // register
  const { abstract, technical } = measureRegister(tokens, allCaps, src);
  const abstractShare = share(abstract, tokens.length);
  const technicalShare = share(technical, tokens.length);
  const dialogueShare = Math.min(1, share(spokenWords, wordTotal));
  const sentenceMean = lengths.length ? mean(lengths) : 0;
  let contractions = 0;
  for (const t of narration) if (/n't$|'(?:re|ll|ve|m|d)$/.test(t.lo)) contractions++;
  const chatty = narration.length > 0 && contractions / narration.length >= 0.03 && sentenceMean <= 16 && (pov.label === 'first person' || pov.label === 'second person');
  let label = 'narrative';
  if (dialogueShare >= 0.45 && wordTotal >= 5) label = 'conversational'; // a measured fact, so it needs no more than a few words
  else if (wordTotal < 30) label = 'narrative';
  else if (chatty) label = 'conversational';
  else if (abstractShare + technicalShare >= 0.07 && dialogueShare < 0.25) label = 'expository';
  // long explanatory sentences with abstract and technical words, no real dialogue and not told in the past: an explanation, not a story
  else if (abstractShare + technicalShare >= 0.035 && sentenceMean >= 20 && dialogueShare < 0.1 && tense.label !== 'past') label = 'expository';
  else if (lyricalness(tokens, starts) >= 0.08 && abstractShare < 0.03 && dialogueShare < 0.1) label = 'lyrical';

  const structureKinds = structureOf(paras, stamps, wordTotal, src);
  const signature = signatureOf(tokens, allCaps);

  const profile = {
    words: wordTotal,
    sentences: lengths.length,
    paragraphs: proseParas.length || paras.length,
    sentence: {
      mean: r1(sentenceMean),
      median: r1(median(lengths)),
      longShare: share(lengths.filter((n) => n > 35).length, lengths.length),
      shortShare: share(lengths.filter((n) => n < 8).length, lengths.length),
      longest: lengths.reduce((m, n) => (n > m ? n : m), 0),
    },
    paragraph: { meanWords: r1(mean(paraWords)) },
    dialogue: { share: dialogueShare, lines: spans.length },
    pov,
    tense,
    register: { label, abstractShare, technicalShare },
    structure: structureKinds.map((k) => k.text),
    signature,
    promptLine: '',
  };
  profile.promptLine = promptLineOf(profile, structureKinds.map((k) => k.kind));
  return profile;
}

// ── the line the model reads ──────────────────────────────────────────────────

export const PROMPT_LINE_MAX_TOKENS = 70;
const PROMPT_PREFIX = 'Style (measured from the text): ';

function tenseWords(tense, expository) {
  if (tense.label === 'mixed') return 'tense moves between past and present';
  if (tense.label !== 'past' && tense.label !== 'present') return '';
  const other = tense.label === 'past' ? 'present' : 'past';
  const minor = tense[other];
  // a story told in the past that explains in the present: "present-tense explanation"; any other minority is just passages
  if (minor >= 0.2) return `mostly ${tense.label} tense with ${other}-tense ${expository && other === 'present' ? 'explanation' : 'passages'}`;
  return `${tense.label} tense`;
}

function sentenceWords(profile, expository) {
  const m = profile.sentence.mean;
  if (profile.sentences < 3) return '';
  const avg = `(average ${Math.round(m)} words)`;
  if (m >= 28) return `very long ${expository ? 'explanatory ' : ''}sentences ${avg}`;
  if (m >= 21) return `long ${expository ? 'explanatory ' : ''}sentences ${avg}`;
  if (m >= 14) return `medium-length sentences ${avg}`;
  if (m >= 9) return `short sentences ${avg}`;
  return `very short sentences ${avg}`;
}

function dialogueWords(share) {
  if (share < 0.03) return 'almost no quoted dialogue';
  if (share < 0.15) return 'little quoted dialogue';
  if (share < 0.35) return 'some quoted dialogue';
  if (share < 0.6) return 'a lot of quoted dialogue';
  return 'mostly quoted dialogue';
}

const STRUCTURE_SHORT = {
  stamps: 'organised under time stamps',
  chapters: 'chapter headings',
  parts: 'numbered parts',
  marks: 'marked headings',
  titles: 'titled sections',
  breaks: 'scene breaks',
  slugs: 'screenplay scene headings',
  block: 'no paragraph breaks',
};

/** One compact line (at most PROMPT_LINE_MAX_TOKENS estimated tokens) for the model. Parts are added in order of use until the budget is spent. */
function promptLineOf(profile, kinds) {
  if (profile.words < 40) return '';
  const expository = profile.register.label === 'expository';
  const voice = [profile.pov.label === 'mixed' ? 'mixed point of view' : profile.pov.label === 'unclear' ? '' : profile.pov.label, tenseWords(profile.tense, expository)].filter(Boolean).join(', ');
  const parts = [
    voice,
    sentenceWords(profile, expository),
    profile.words >= 100 ? dialogueWords(profile.dialogue.share) : '',
    profile.words >= 100 ? `${profile.register.label} register` : '',
    kinds.map((k) => STRUCTURE_SHORT[k]).filter(Boolean)[0] ?? '',
  ];
  const fits = (s) => estimateTokens(s) <= PROMPT_LINE_MAX_TOKENS;
  let line = PROMPT_PREFIX.trimEnd();
  let sep = ' ';
  for (const p of parts) {
    if (!p) continue;
    const next = line + sep + p;
    if (fits(next)) {
      line = next;
      sep = '; ';
    }
  }
  const terms = profile.signature;
  if (terms.length) {
    const head = line + sep + 'recurring terms:';
    let withTerms = '';
    for (let n = 1; n <= terms.length; n++) {
      const next = head + ' ' + terms.slice(0, n).join(', ');
      if (!fits(next)) break;
      withTerms = next;
    }
    if (withTerms) line = withTerms;
  }
  return line === PROMPT_PREFIX.trimEnd() ? '' : line;
}

// ── the paragraph a writer can read ───────────────────────────────────────────

const finite = (x) => (Number.isFinite(x) ? x : 0);
const num = (n) => String(Math.round(finite(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const pct = (x) => (finite(x) > 0 && x < 0.005 ? 'under 1%' : `${Math.round(finite(x) * 100)}%`);

/**
 * Plain English for the writer: what was measured, with the numbers it rests on. It says the figures are counts, and it never praises or judges.
 */
export function describeStyle(profile) {
  const p = profile ?? {};
  if (!(p.words >= 30)) return 'There is not enough text yet to measure a style from.';

  const voice = [];
  if (p.pov?.label === 'mixed') voice.push('written from a mixed point of view');
  else if (p.pov?.label && p.pov.label !== 'unclear') voice.push(`written in ${p.pov.label}`);
  if (p.tense?.label === 'past' || p.tense?.label === 'present') {
    voice.push(`mostly in ${p.tense.label} tense (${pct(p.tense[p.tense.label])} of the verb cues counted)`);
  } else if (p.tense?.label === 'mixed') {
    voice.push(`moving between past tense (${pct(p.tense.past)}) and present tense (${pct(p.tense.present)})`);
  }
  const s = p.sentence ?? {};
  const first =
    `Counted from the text itself (${num(p.words)} words in ${num(p.sentences ?? 0)} sentences), it is ` +
    (voice.length ? voice.join(' and ') : 'not clear in point of view or tense from the cues available') +
    (p.sentences >= 3 ? `, with sentences averaging ${num(s.mean)} words and the longest running ${num(s.longest)}.` : '.');

  const lines = finite(p.dialogue?.lines);
  const single = p.paragraphs === 1;
  const structure = (Array.isArray(p.structure) ? p.structure : []).filter((x) => typeof x === 'string' && !(single && /^one unbroken block/.test(x)));
  const second = [
    lines ? `Quoted dialogue makes up ${pct(p.dialogue?.share ?? 0)} of the words (${num(lines)} quoted ${lines === 1 ? 'line' : 'lines'})` : 'No words sit inside quotation marks',
    single ? 'the whole text is a single paragraph' : finite(p.paragraph?.meanWords) > 0 ? `paragraphs average ${Math.round(p.paragraph.meanWords)} words` : '',
    p.words >= 100 && typeof p.register?.label === 'string'
      ? `the vocabulary reads as ${p.register.label} (abstract nouns are ${pct(p.register.abstractShare)} of the words, technical terms ${pct(p.register.technicalShare)})`
      : '',
    // a single paragraph is already said above
    structure.length ? `structure found: ${structure.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('; ');

  const signature = Array.isArray(p.signature) ? p.signature.filter((x) => typeof x === 'string') : [];
  const terms = signature.length ? `The terms that recur most are ${signature.join(', ')}; every figure` : 'Every figure';
  return `${first} ${second}. ${terms} here is counted from the text with simple word lists, not a judgment of its quality.`;
}
