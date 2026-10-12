import { estimateTokens, mean, splitParagraphs, splitSentences, STOPWORDS, words } from '../util/text.js';
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
/** Auxiliaries that carry the tense of a verb phrase: the participle after one ("has made", "is built", "had taken") is not a second cue. */
const AUXILIARY = set("is are am be been being was were isn't aren't wasn't weren't has have had hasn't haven't hadn't get gets got gotten having");
/** Past forms that are themselves auxiliaries: always a cue, even after another auxiliary. */
const PAST_AUXILIARY = set("was were wasn't weren't had hadn't did didn't");
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
// "Year four", "Day One", "DAY 12": any case, followed by a separator or the end; what comes after the separator is checked in `isStamp`
const STAMP = new RegExp(
  `^(?:Year|Day|Week|Month|Cycle)\\s+${STAMP_NUMBER}(?:\\s+(?:to|and)\\s+${STAMP_NUMBER})*(?=\\s*(?:[,.:;—–-]|$))`,
  'iu'
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
    dialogue: { share: 0, lines: 0, dashLines: 0, cueLines: 0, cueShare: 0 },
    pov: { label: 'unclear', first: 0, second: 0, third: 0 },
    tense: { label: 'unclear', past: 0, present: 0 },
    register: { label: 'narrative', abstractShare: 0, technicalShare: 0, imageryShare: 0 }, // with no text the label is only a default; promptLine and describeStyle say nothing about it
    structure: [],
    signature: [],
    language: { englishShare: 0, readable: true },
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
        prev: last && start - last.end <= 3 && /^[ \t\u00a0]+$/.test(text.slice(last.end, start)) ? last : null, // a word processor's no-break space is a space
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

const WORD_CHAR = /[\p{L}\p{N}]/u;
const BEFORE_OPENER = /[\s(\[—–-]/;

/**
 * The same spans as util/text.js#dialogueSpans ("straight" and “curly”, never across a line break), found in one pass. That regex rescans the rest of the
 * line from every unclosed “, which is quadratic: a line of 60,000 characters with 10,000 stray marks took a second.
 */
function doubleQuoted(src) {
  const out = [];
  const n = src.length;
  let lineEnd = -1;
  let straightLeft = true; // false once a line has no closing " left
  let curlyLeft = true;
  for (let i = 0; i < n; i++) {
    const c = src.charCodeAt(i);
    if (c !== 34 && c !== 0x201c) continue;
    if (i > lineEnd) {
      lineEnd = src.indexOf('\n', i);
      if (lineEnd < 0) lineEnd = n;
      straightLeft = curlyLeft = true;
    }
    if (c === 34 ? !straightLeft : !curlyLeft) continue;
    const closer = c === 34 ? 34 : 0x201d;
    let j = i + 1;
    while (j < lineEnd && src.charCodeAt(j) !== closer) j++;
    if (j >= lineEnd) {
      if (c === 34) straightLeft = false;
      else curlyLeft = false;
      // Fiction's way of writing one long speech over several paragraphs: no closing mark until the last one, and the next paragraph opens with a mark again.
      // Without this the first paragraphs of every such speech count as the narrator talking ("I", "my", "we") and a third-person story reads as first person.
      if (opensNextParagraph(src, lineEnd)) {
        out.push({ text: src.slice(i, lineEnd), start: i, end: lineEnd });
        i = lineEnd - 1;
      }
      continue;
    }
    out.push({ text: src.slice(i, j + 1), start: i, end: j + 1 });
    i = j;
  }
  return out;
}

/** The next line that has anything on it starts with an opening quotation mark. */
function opensNextParagraph(src, from) {
  let k = from;
  while (k < src.length && /\s/.test(src[k])) k++;
  return k < src.length && (src.charCodeAt(k) === 34 || src.charCodeAt(k) === 0x201c);
}

/**
 * Typographic single quotes (British style): ‘an opening mark that starts a word’, closed by the first ’ that does not sit inside a word ("don’t" has an
 * apostrophe, not a close). Found in one pass: the same pattern as a regex rescans up to 1,500 characters from every unclosed ‘, which took 0.2 s on a line
 * of 20,000 stray marks. The first closer is remembered, because it is the first closer for every opening mark before it on the line.
 */
function curlySingleQuoted(src) {
  const out = [];
  let lineEnd = -1;
  let closer = -1; // the first closing mark after the last opening mark searched; -1 = none on this line
  let searched = false;
  for (let i = src.indexOf('‘'); i >= 0; ) {
    if (i > 0 && WORD_CHAR.test(src[i - 1])) {
      i = src.indexOf('‘', i + 1);
      continue;
    }
    if (i > lineEnd) {
      lineEnd = src.indexOf('\n', i);
      if (lineEnd < 0) lineEnd = src.length;
      searched = false;
    }
    if (!searched || (closer >= 0 && closer <= i)) {
      closer = -1;
      searched = true;
      for (let j = i + 1; j < lineEnd; j++) {
        if (src.charCodeAt(j) === 0x2019 && !WORD_CHAR.test(src[j + 1] ?? '')) {
          closer = j;
          break;
        }
      }
    }
    if (closer >= 0 && closer - i - 1 <= MAX_SPOKEN_CHARS) {
      out.push({ text: src.slice(i, closer + 1), start: i, end: closer + 1 });
      i = src.indexOf('‘', closer + 1);
    } else i = src.indexOf('‘', i + 1);
  }
  return out;
}

/**
 * 'Straight single quotes', as typed in a plain text box by writers who quote with single marks. Only used when the text has no other quotation marks, because
 * an apostrophe looks the same: an opening mark follows a space or dash and precedes a word; a closing one follows punctuation (or a letter and then punctuation)
 * and does not precede a letter; a candidate that meets another opening mark first was a pair of apostrophes ("'em", "'til") and is dropped.
 */
function straightSingleQuoted(src) {
  const out = [];
  for (let from = 0; from < src.length; ) {
    let to = src.indexOf('\n', from);
    if (to < 0) to = src.length;
    for (let i = from; i < to; i++) {
      if (src.charCodeAt(i) !== 39 || (i > from && !BEFORE_OPENER.test(src[i - 1])) || !WORD_CHAR.test(src[i + 1] ?? '')) continue;
      const limit = Math.min(to, i + MAX_SPOKEN_CHARS);
      for (let j = i + 2; j < limit; j++) {
        if (src.charCodeAt(j) !== 39) continue;
        const next = src[j + 1] ?? '';
        if (WORD_CHAR.test(next)) {
          if (BEFORE_OPENER.test(src[j - 1])) break; // another opening mark
          continue; // an apostrophe inside a word
        }
        const prev = src[j - 1];
        if (/[,.!?…;:]/.test(prev) || (WORD_CHAR.test(prev) && /^[,.;:!?)]?$/.test(next))) {
          out.push({ text: src.slice(i, j + 1), start: i, end: j + 1 });
          i = j;
          break;
        }
      }
    }
    from = to + 1;
  }
  return out;
}

/** Every quoted span: "straight", “curly” and ‘single curly’; 'straight single' only in a text that quotes in no other way. A span inside another is part of it. */
function quotedSpans(src) {
  let spans = doubleQuoted(src);
  if (src.includes('‘')) {
    for (const sp of curlySingleQuoted(src)) spans.push(sp);
    spans.sort((a, b) => a.start - b.start || b.end - a.end);
    const out = [];
    for (const sp of spans) if (!out.length || sp.start >= out.at(-1).end) out.push(sp);
    spans = out;
  }
  if (!spans.length && src.includes("'")) {
    const single = straightSingleQuoted(src);
    if (single.length >= 3) spans = single;
  }
  return spans;
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

// Some writers set speech off with a dash at the start of the line instead of quotation marks
const DASH_LEAD = /^[ \t]*[—―–][ \t]*[\p{L}\p{N}"“‘'¿¡]/u;

/** Lines that open with a dash, when there are enough of them (five, and 30% of all lines) to be a way of writing and not a stray dash. */
function dashLines(src) {
  const out = [];
  let lines = 0;
  for (let from = 0; from < src.length; ) {
    let to = src.indexOf('\n', from);
    if (to < 0) to = src.length;
    if (to > from && /\S/.test(src.slice(from, to))) {
      lines++;
      if (DASH_LEAD.test(src.slice(from, Math.min(to, from + 16)))) out.push({ text: src.slice(from, to), start: from, end: to });
    }
    from = to + 1;
  }
  return out.length >= 5 && out.length >= lines * 0.3 ? out : [];
}

// A script sets speech off by the speaker's name in capitals on a line of its own, with the speech on the lines below it
const CUE_NAME = /^\p{Lu}[\p{Lu}\p{N}'’.-]*(?: [\p{Lu}\p{N}'’.-]+){0,3}$/u;
const CUE_NOTE = /\s*\([^)\n]{0,30}\)\s*$/; // "(V.O.)", "(CONT'D)", "(30s, wet coat)"
const SLUG_LINE = /^(?:INT|EXT|I\/E)\b/;

/**
 * Speech in a screenplay or stage script: "TOMAS" on its own line, then what he says. Without this a script reads as "no dialogue" and its lines count as the
 * narrator's. Only counted when it is clearly a way of writing: four speeches or more, and at least two speakers who speak more than once (so a chapter title in
 * capitals above a paragraph is never a speaker).
 */
function cueBlocks(src) {
  const blocks = [];
  const speakers = new Map();
  const isCue = (line) => {
    const t = line.trim();
    if (t.length < 2 || t.length > 40) return null;
    const name = t.replace(CUE_NOTE, '');
    if (name.length < 2 || name.length > 28 || !CUE_NAME.test(name) || name !== name.toUpperCase() || name === name.toLowerCase() || SLUG_LINE.test(name)) return null;
    return name;
  };
  let from = 0;
  let cue = null; // { name, start, speech: [from, to] }
  const close = () => {
    if (cue && cue.speechEnd > cue.speechStart) blocks.push(cue);
    cue = null;
  };
  while (from <= src.length) {
    let to = src.indexOf('\n', from);
    if (to < 0) to = src.length;
    const line = src.slice(from, to);
    if (!/\S/.test(line)) close();
    else {
      const name = isCue(line);
      if (name) {
        close();
        cue = { name, start: from, speechStart: to + 1, speechEnd: to + 1 };
      } else if (cue) cue.speechEnd = to;
    }
    from = to + 1;
  }
  close();
  for (const b of blocks) speakers.set(b.name, (speakers.get(b.name) ?? 0) + 1);
  const repeat = [...speakers.values()].filter((n) => n >= 2).length;
  if (blocks.length < 4 || repeat < 2) return [];
  return blocks.map((b) => ({ start: b.start, end: b.speechEnd, speech: src.slice(b.speechStart, b.speechEnd) }));
}

/** Both kinds of span in order, with any that overlap an earlier one left out. */
function mergeSpans(a, b) {
  if (!b.length) return a;
  const all = [...a, ...b].sort((x, y) => x.start - y.start || y.end - x.end);
  const out = [];
  for (const sp of all) if (!out.length || sp.start >= out.at(-1).end) out.push(sp);
  return out;
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

const SEASONISH = /^(?:early |late |mid-?)?(?:spring|summer|autumn|fall|winter|dawn|dusk|morning|evening|night|noon|midday|midnight|\p{L}+day)$/iu;

/**
 * A label that places what follows in time. "Year four, September" is one; "Year four, the harvest failed and the people went hungry" is a sentence that
 * happens to start the same way: after the separator only a short name (a month, a season, a capitalised title of up to five words) or a short continuation ("and onward") may follow.
 */
function isStamp(s) {
  if (DATE_STAMP.test(s)) return true;
  const m = STAMP.exec(s);
  if (!m) return false;
  const rest = s.slice(m[0].length).replace(/^[\s,.:;—–-]+/, '').replace(/[.:;\s]+$/, '');
  if (!rest) return true;
  const n = words(rest).length;
  return n <= 5 && (/^[\p{Lu}\d]/u.test(rest) || SEASONISH.test(rest) || /^(?:and|to|until|through|again|onwards?)\b/i.test(rest)); // "Year minus four, and the months that follow."
}

/** Sentences for length statistics (headings and time stamps are labels, not sentences) plus the time stamps found. */
function sentencesOf(src) {
  const merged = [];
  for (const p of splitSentences(src)) {
    const prev = merged.at(-1);
    // `"Where?" she asked.` is one sentence, not a question and a two-word fragment. Only the last piece is tested: re-testing a growing sentence is quadratic
    // on "1.1.1.1.1..." (60,000 characters took 0.8 s)
    const quoteTag = prev && CLOSED_BY_QUOTE.test(prev.tail) && /^\p{Ll}/u.test(p.text) && !src.slice(prev.end, p.start).includes('\n');
    // "a COP of 3.5" and "version 2.0.1" are not sentence ends: a full stop with a digit on both sides and no space
    const decimal = prev && prev.end === p.start && src[prev.end - 1] === '.' && /\d/.test(src[prev.end - 2] ?? '') && /^\d/.test(p.text);
    if (quoteTag || decimal) {
      prev.parts.push((decimal ? '' : ' ') + p.text);
      prev.tail = p.text;
      prev.end = p.end;
    } else merged.push({ ...p, tail: p.text, parts: [p.text] });
  }
  for (const s of merged) s.text = s.parts.join('');
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
        if (raw === 'I' && text[t.end] === '.' && (t.start === 0 || text[t.start - 1] === '\n')) continue; // "I. The Beginning": an outline numeral
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
  // a third-person narrator almost never says I / me / my outside quoted speech: a fifth of the pronouns being first person is a diary or memoir that talks about other people, not a third-person story
  if (t >= 0.5 && t - Math.max(f, s) >= 0.15 && f < 0.2) return 'third person';
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
    const p = beforeVerb(t);
    if (PAST_SURE.has(lo)) {
      // "The council has made a decision" and "records are kept in the tower" are present tense: counting "made" and "kept" as past cues made a plain present-tense text read 33% past
      if (!(p && AUXILIARY.has(p.lo) && !PAST_AUXILIARY.has(lo))) past++;
      continue;
    }
    if (PRESENT_SURE.has(lo)) {
      present++;
      continue;
    }
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

const MAX_TERM_CHARS = 40;
const MIN_ENGLISH_SHARE = 0.12; // English prose is 30-60% common words; Spanish, French and German measured 2-5%

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
function signatureOf(tokens, allCaps, english = true) {
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
    if (ORDINARY.has(lo) || form.length < 2 || form.length > MAX_TERM_CHARS) return false; // a 3,000-letter "word" is a pasted blob, not a name
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
      if (key.length > MAX_TERM_CHARS + 20) continue;
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
    !t.cap && f.length >= 4 && f.length <= 24 && !ORDINARY.has(t.lo) && !/\d/.test(t.raw) && !/(?:ly|ing|ed)$/.test(t.lo) && !PAST_SURE.has(t.lo) && !PAST_AFTER_SUBJECT.has(t.lo) && !PRESENT_SURE.has(t.lo) && !BASE_VERBS.has(t.lo);
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
    if (!english) break; // the function words that keep a pair of nouns apart are English ones: in another language "verano había" would look like a coined term
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
  const dashes = dashLines(src);
  const cues = allCaps ? [] : cueBlocks(src);
  const spokenWords = spans.reduce((n, s) => n + words(s.text).length, 0);
  const cueWords = cues.reduce((n, c) => n + words(c.speech).length, 0);
  const tokens = tokenize(src);
  const apart = mergeSpans(mergeSpans(spans, dashes), cues); // what is not narration: quoted speech, lines that open with a dash, speeches under a speaker's name
  const narrationText = apart.length ? withoutSpans(src, apart) : src;
  const narration = apart.length ? tokenize(narrationText) : tokens;

  // Every word list here is English. A text with hardly any common English words ("the", "of", "and"...) is another language, or a list of names: "he" is Spanish for
  // "I have", so person, tense and register read from these lists would be confident nonsense. Say nothing rather than guess.
  let common = 0;
  for (const t of tokens) if (STOPWORDS.has(t.lo)) common++;
  const englishShare = share(common, tokens.length);
  const english = wordTotal < 40 || englishShare >= MIN_ENGLISH_SHARE;

  const { first, second, third } = english ? countPronouns(narration, narrationText, allCaps) : { first: 0, second: 0, third: 0 };
  const pn = first + second + third;
  const pov = { label: povLabel(first, second, third), first: share(first, pn), second: share(second, pn), third: share(third, pn) };

  const { past, present } = english ? countTense(narration, allCaps) : { past: 0, present: 0 };
  const tn = past + present;
  const tense = { label: tenseLabel(past, present), past: share(past, tn), present: share(present, tn) };

  // register
  const { abstract, technical } = english ? measureRegister(tokens, allCaps, src) : { abstract: 0, technical: 0 };
  const abstractShare = share(abstract, tokens.length);
  const technicalShare = share(technical, tokens.length);
  const dialogueShare = Math.min(1, share(spokenWords, wordTotal));
  const cueShare = Math.min(1, share(cueWords, wordTotal));
  const talk = Math.min(1, dialogueShare + cueShare); // speech of either kind, for the register
  const sentenceMean = lengths.length ? mean(lengths) : 0;
  let contractions = 0;
  for (const t of narration) if (/n't$|'(?:re|ll|ve|m|d)$/.test(t.lo)) contractions++;
  const chatty = narration.length > 0 && contractions / narration.length >= 0.03 && sentenceMean <= 16 && (pov.label === 'first person' || pov.label === 'second person');
  const imagery = english ? lyricalness(tokens, starts) : 0;
  let label = 'narrative';
  if (talk >= 0.45 && wordTotal >= 5) label = 'conversational'; // a measured fact, so it needs no more than a few words
  else if (wordTotal < 30) label = 'narrative';
  else if (chatty) label = 'conversational';
  else if (abstractShare + technicalShare >= 0.07 && talk < 0.25) label = 'expository';
  // long explanatory sentences with abstract and technical words, no real dialogue and not told in the past: an explanation, not a story
  else if (abstractShare + technicalShare >= 0.035 && sentenceMean >= 20 && talk < 0.1 && tense.label !== 'past') label = 'expository';
  else if (imagery >= 0.08 && abstractShare < 0.03 && talk < 0.1) label = 'lyrical';

  const structureKinds = structureOf(paras, stamps, wordTotal, src);
  const signature = signatureOf(tokens, allCaps, english);

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
    dialogue: { share: dialogueShare, lines: spans.length, dashLines: dashes.length, cueLines: cues.length, cueShare },
    pov,
    tense,
    register: { label, abstractShare, technicalShare, imageryShare: r3(imagery) },
    structure: structureKinds.map((k) => k.text),
    signature,
    language: { englishShare, readable: english },
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

function dialogueWords({ share, dashLines: dash = 0, cueLines: cue = 0, cueShare = 0 }) {
  // speech set off by a speaker's name or by a dash, which the quotation count does not see
  if (cue >= 4 && cueShare >= 0.05) return `${amount(share + cueShare)} dialogue, set off by speaker names`;
  if (dash >= 5 && share < 0.15) return 'many lines open with a dash';
  return `${amount(share)} quoted dialogue`;
}

/** "almost no", "little", "some", "a lot of", "mostly": a share of the words in plain words. */
function amount(share) {
  if (share < 0.03) return 'almost no';
  if (share < 0.15) return 'little';
  if (share < 0.35) return 'some';
  if (share < 0.6) return 'a lot of';
  return 'mostly';
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
  const english = profile.language?.readable !== false;
  const voice = english
    ? [profile.pov.label === 'mixed' ? 'mixed point of view' : profile.pov.label === 'unclear' ? '' : profile.pov.label, tenseWords(profile.tense, expository)].filter(Boolean).join(', ')
    : 'few common English words, so person, tense and register are not measured';
  const parts = [
    voice,
    sentenceWords(profile, expository),
    // other languages quote in other ways (« », „ “, a dash), so "almost no quoted dialogue" would be a claim the count cannot support
    profile.words >= 100 && (english || profile.dialogue.share >= 0.03 || profile.dialogue.dashLines >= 5) ? dialogueWords(profile.dialogue) : '',
    profile.words >= 100 && english ? `${profile.register.label} register` : '',
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
// a share that only rounds to 0% or 100% is said as "under 1%" / "over 99%": "100% past tense" would claim that not one cue disagreed
const pct = (x) => (finite(x) > 0 && x < 0.005 ? 'under 1%' : finite(x) >= 0.995 && x < 1 ? 'over 99%' : `${Math.round(finite(x) * 100)}%`);

/**
 * Plain English for the writer: what was measured, with the numbers it rests on. It says the figures are counts, and it never praises or judges.
 */
export function describeStyle(profile) {
  const p = profile ?? {};
  if (!(p.words >= 30)) return 'There is not enough text yet to measure a style from.';

  const person = p.pov?.label === 'mixed' ? `written from a mixed point of view (${povShares(p.pov)})` : p.pov?.label && p.pov.label !== 'unclear' ? `written in ${p.pov.label}` : '';
  const tl = p.tense?.label;
  const tenseShare = tl === 'past' || tl === 'present' ? finite(p.tense[tl]) : 0;
  const tense =
    tl === 'past' || tl === 'present'
      ? `its verb cues are ${tenseShare >= 0.95 ? '' : 'mostly '}${tl} tense (${pct(tenseShare)} of those counted)`
      : tl === 'mixed'
        ? `its verb cues move between past tense (${pct(p.tense.past)}) and present tense (${pct(p.tense.present)})`
        : '';
  const s = p.sentence ?? {};
  // the word lists are English ones: say so instead of reporting a point of view that "he" (Spanish for "I have") produced
  const foreign = p.language?.readable === false;
  const first =
    `Counted from the text itself (${num(p.words)} words in ${num(p.sentences ?? 0)} sentences), ` +
    (foreign
      ? "few of its words are common English words, so its point of view, tense and register could not be read with this tool's English word lists"
      : person && tense
        ? `it is ${person}, and ${tense}`
        : person
          ? `it is ${person}`
          : tense || 'its point of view and tense are not clear from the cues available') +
    (p.sentences >= 3 ? `, with sentences averaging ${num(s.mean)} words and the longest running ${num(s.longest)}.` : '.');

  const lines = finite(p.dialogue?.lines);
  const dash = finite(p.dialogue?.dashLines);
  const single = p.paragraphs === 1;
  const structure = (Array.isArray(p.structure) ? p.structure : []).filter((x) => typeof x === 'string' && !(single && /^one unbroken block/.test(x)));
  // "no headings" is a finding, not a kind of structure
  const found = structure.length === 1 && structure[0] === 'no headings' ? 'no headings were found' : structure.length ? `structure found: ${structure.join(', ')}` : '';
  const cue = finite(p.dialogue?.cueLines);
  const dashed = dash ? `${num(dash)} ${dash === 1 ? 'line opens' : 'lines open'} with a dash, which some writers use to set off speech` : '';
  const cued = cue ? `${num(cue)} ${cue === 1 ? 'speech is' : 'speeches are'} set off by a speaker name in capitals on its own line (${pct(p.dialogue?.cueShare ?? 0)} of the words)` : '';
  const other = [dashed, cued].filter(Boolean);
  const spoken = lines
    ? `Quoted dialogue makes up ${pct(p.dialogue?.share ?? 0)} of the words (${num(lines)} quoted ${lines === 1 ? 'line' : 'lines'})`
    : other.length
      ? `No quoted speech was found, but ${other.shift()}`
      : foreign
        ? 'No speech in English-style quotation marks was found'
        : 'No quoted speech was found';
  const second = [
    ...other,
    single ? 'the whole text is a single paragraph' : finite(p.paragraph?.meanWords) > 0 ? `paragraphs average ${Math.round(p.paragraph.meanWords)} words` : '',
    p.words >= 100 && !foreign && typeof p.register?.label === 'string' ? registerClause(p) : '',
    // a single paragraph is already said above
    found,
  ]
    .filter(Boolean)
    .join('; ');

  const signature = Array.isArray(p.signature) ? p.signature.filter((x) => typeof x === 'string') : [];
  const terms = signature.length ? `${signature.length === 1 ? 'A term' : 'Terms'} that recur${signature.length === 1 ? 's' : ''} across the text: ${signature.join(', ')}; every figure` : 'Every figure';
  return `${first} ${spoken}${second ? `; ${second}` : ''}. ${terms} here is counted from the text with simple word lists, not a judgment of its quality.`;
}

/** "first person 33%, third person 67% of the pronouns counted": the numbers a 'mixed' label rests on. */
function povShares(pov) {
  const parts = [
    ['first person', pov.first],
    ['second person', pov.second],
    ['third person', pov.third],
  ].filter(([, x]) => finite(x) >= 0.005);
  return parts.length ? `${parts.map(([name, x]) => `${name} ${pct(x)}`).join(', ')} of the pronouns counted` : 'pronouns point different ways';
}

/** The register label with the counts it was decided on; "narrative" is only what is left when none of the others applies, and the sentence says so. */
function registerClause(p) {
  // what is counted, not what it is called: "technical" is a number, an acronym or a very long word, and "abstract" is a word that ends like "attention", "quality" or "judgement"
  const abstract = `long words ending in -tion, -ity, -ment and the like are ${pct(p.register.abstractShare)} of the words; numbers, acronyms and very long words ${pct(p.register.technicalShare)}`;
  switch (p.register.label) {
    case 'expository':
      return `the word counts read as expository (${abstract})`;
    case 'lyrical':
      return Number.isFinite(p.register.imageryShare)
        ? `the word counts read as lyrical (image words, similes and repeated openings score ${Math.round(p.register.imageryShare * 100)} per 100 words; ${abstract})`
        : `the word counts read as lyrical (${abstract})`;
    case 'conversational':
      return finite(p.dialogue?.share) + finite(p.dialogue?.cueShare) >= 0.45
        ? `the word counts read as conversational (speech is ${pct(finite(p.dialogue.share) + finite(p.dialogue.cueShare))} of the words)`
        : `the word counts read as conversational (short sentences and contractions in the narration; ${abstract})`;
    case 'narrative':
      return `nothing in the word counts marks it as expository, lyrical or conversational (${abstract})`;
    default:
      return `register: ${p.register.label} (${abstract})`;
  }
}
