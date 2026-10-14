import { isHeading, splitSections } from '../reading/sections.js';
import { styleProfile } from '../reading/style.js';
import { scan } from '../analysis/scan.js';
import { CLASSES } from '../analysis/finding.js';
import { STOPWORDS, WORD_RE, fnv1a, splitParagraphs, splitSentences, words as wordsOf } from '../util/text.js';
import { capitalisedRuns, COMMON_CAPS, neverName, OPENERS, ORDINARY_OPENERS, ROLE_WORDS, TITLES } from './names.js';
import { NUMBER_TOKEN, numbersIn, parseDigits, parseNumberWords, isNumberWord } from './numbers.js';

/**
 * The editorial instruments: deterministic analyses of a long text (and of the writer's own rules) whose RESULTS are given to the model as measured facts.
 *
 * Why: a 3B model cannot hold a 10,000-word text in mind, so it cannot judge pacing, consistency, voice shifts or a cast of twelve. A program can count them.
 * Nothing here judges quality, nothing here writes: every result is a count, a position (a 0-based section index, or a character range) or a short fragment of
 * the writer's own words (at most 14 words, always an exact slice of the text). Where an instrument can only suspect something (a name spelt two ways, a measure
 * given two numbers, a phrase that keeps coming back) the result says so by its name and the callers say "possible".
 *
 * Same text -> same Analysis, byte for byte: no clock, no randomness, no module state (callers cache an Analysis by the content hash of its text). Inputs are
 * never mutated. Bounded: at most `maxSections` sections get the per-section measures, whatever the length of the text (`covered` says how many of how many).
 */

export const ANALYSIS_VERSION = 2;

const HARD_CAP_CHARS = 4_000_000; // about 700,000 words: past this the rest of the text is not looked at
const MIN_VOICE_WORDS = 60; // fewer words than this: a section's person and tense are "unclear" (a handful of verbs says nothing)
const NGRAM = 5;
const MAX_PHRASE_WORDS = 14;
const NGRAM_TOKEN_CAP = 160_000; // repeated phrases are looked for in at most this many words
const MAX_FINDINGS = 200;
const STYLE_CAP_CHARS = 450_000; // the whole-text style facts (recurring terms, structure) are read from at most this much of the covered text

const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;
const r3 = (n) => Math.round(n * 1000) / 1000;
const median = (a) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const isPlain = (v) => v !== null && typeof v === 'object';
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const lowerFirst = (w) => w[0] === w[0].toLowerCase() && w[0] !== w[0].toUpperCase();

/** An exact slice of `text` from `start`, ending no later than `end` and no later than the `max`-th word: a quotation of the writer's own words, never a paraphrase (not even a change of blanks: callers that show it flatten the blanks themselves). */
export function fragment(text, start, end, max = MAX_PHRASE_WORDS) {
  const slice = text.slice(start, end);
  let n = 0;
  let cut = slice.length;
  for (const m of slice.matchAll(WORD_RE)) {
    n++;
    if (n === max) cut = m.index + m[0].length;
    if (n > max) break;
  }
  return slice.slice(0, cut).trim();
}

const singular = (w) => {
  const s = String(w).toLowerCase();
  if (s.length > 4 && s.endsWith('ies')) return `${s.slice(0, -3)}y`;
  if (s.length > 4 && /(?:ch|sh|x|ss|zz)es$/.test(s)) return s.slice(0, -2);
  if (s.length > 3 && s.endsWith('s') && !s.endsWith('ss') && !s.endsWith('us')) return s.slice(0, -1);
  return s;
};
const IRREGULAR_PLURAL = new Set(['feet', 'men', 'women', 'people', 'children', 'teeth', 'geese', 'mice']);
const pluralLooking = (w) => IRREGULAR_PLURAL.has(w) || (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us'));

const emptyStyle = () => styleProfile('');

// ── sections ─────────────────────────────────────────────────────────────────

function sectionsOf(src, index) {
  const given = index && typeof index === 'object' && index.text === src && Array.isArray(index.sections) ? index.sections : null;
  const ok = given && given.every((s, k) => s && Number.isFinite(s.start) && Number.isFinite(s.end) && s.start >= 0 && s.end <= src.length && s.start <= s.end && (k === 0 || s.start >= given[k - 1].start));
  const list = ok ? given : splitSections(src);
  return list.map((s, k) => ({
    i: k,
    start: s.start,
    end: s.end,
    words: Number.isFinite(s.words) ? s.words : wordsOf(src.slice(s.start, s.end)).length,
    title: typeof s.title === 'string' ? s.title : '',
    under: typeof s.under === 'string' ? s.under : '',
  }));
}

/** The index of the section a character offset lies in (sections are contiguous), or -1. */
function sectionAt(secs, pos) {
  let lo = 0;
  let hi = secs.length - 1;
  if (hi < 0 || pos < secs[0].start) return -1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (secs[mid].start <= pos) lo = mid;
    else hi = mid - 1;
  }
  return pos <= secs[lo].end || lo === secs.length - 1 ? lo : -1;
}

// ── headings ─────────────────────────────────────────────────────────────────

const headingTitle = (t) => t.replace(/^[#\s*_=~–—-]+/, '').trim();

/**
 * The headings inside one section's text: how many (a scene break with no words in it does not count), whether the section OPENS with one, and their titles.
 * The splitter starts a section at a heading only when the section before it is long enough, so a short chapter can sit inside a section: counting sections
 * as "parts under headings" would then say fewer parts than the writer has.
 */
function headingsIn(text, base = 0) {
  const out = { count: 0, first: false, titles: [], marks: [] };
  const paras = splitParagraphs(text);
  for (let k = 0; k < paras.length && out.count < 400; k++) {
    if (!isHeading(paras[k].text)) continue;
    const title = headingTitle(paras[k].text);
    if (!title) continue;
    out.count++;
    if (k === 0) out.first = true;
    out.titles.push(title);
    out.marks.push({ at: base + paras[k].start, title });
  }
  return out;
}

/**
 * The stretches under headings, measured on the text itself: from one titled heading to the next (the last to the end of the covered text), so a chapter that the
 * splitter cut into two sections, or one that shares a section with the end of the one before it, is still one stretch with its true length. Fewer than two
 * headings: no stretches (there is nothing to compare). `from`/`to` are the 0-based sections the stretch touches.
 */
function unitsOf(src, secs, marks, end) {
  if (marks.length < 2) return [];
  return marks.slice(0, 400).map((m, k) => {
    const stop = k + 1 < marks.length ? marks[k + 1].at : end;
    let last = stop; // (the blank lines before the next heading belong to the next section, not to this stretch)
    while (last > m.at + 1 && /\s/.test(src[last - 1])) last--;
    return { from: Math.max(0, sectionAt(secs, m.at)), to: Math.max(0, sectionAt(secs, last - 1)), title: m.title, words: wordsOf(src.slice(m.at, stop)).length };
  });
}

// ── voice ────────────────────────────────────────────────────────────────────

const PURE_PERSON = new Set(['first person', 'second person', 'third person']);
const PURE_TENSE = new Set(['past', 'present']);

function runsOf(values) {
  const out = [];
  values.forEach((value, i) => {
    const last = out.at(-1);
    if (last && last.value === value) last.to = i;
    else out.push({ from: i, to: i, value });
  });
  return out;
}

/** Where the value changes between sections that have a clear value (a section with too few cues, or a mixed one, does not break the comparison). */
function shiftsOf(what, values, pure) {
  const out = [];
  let prev = null;
  values.forEach((v, i) => {
    if (!pure.has(v)) return;
    if (prev && prev.value !== v) out.push({ at: i, what, from: prev.value, to: v, previous: prev.i });
    prev = { value: v, i };
  });
  return out.slice(0, 30);
}

// ── pacing ───────────────────────────────────────────────────────────────────

function outliersOf(items, med) {
  if (!(med > 0) || items.length < 4) return [];
  const out = [];
  items.forEach((it, k) => {
    const ratio = it.words / med;
    // (three decimals: the one decimal a line shows is rounded from the real ratio, not from a rounded one)
    if (ratio >= 2 && it.words >= 100) out.push({ ...it.keep, words: it.words, kind: 'long', ratio: r3(ratio) });
    else if (ratio <= 0.4 && it.words > 0 && k < items.length - 1) out.push({ ...it.keep, words: it.words, kind: 'short', ratio: r3(ratio) });
  });
  return out.sort((a, b) => (a.kind === b.kind ? (a.kind === 'long' ? b.ratio - a.ratio : a.ratio - b.ratio) : a.kind === 'long' ? -1 : 1)).slice(0, 6);
}

function pacingOf(per, total, { dashes = false, units = [] } = {}) {
  const wordCounts = per.map((s) => s.words).filter((w) => w > 0);
  const med = median(wordCounts);
  const outliers = outliersOf(
    per.map((s) => ({ words: s.words, keep: { i: s.i } })),
    med
  );

  // the stretches under one heading (a chapter is the unit a writer paces, not the section the splitter cut it into)
  const unitMedian = median(units.map((u) => u.words).filter((w) => w > 0));
  const unitOutliers = outliersOf(
    units.map((u) => ({ words: u.words, keep: { from: u.from, to: u.to, title: u.title } })),
    unitMedian
  );

  const dialogueByThirds = [];
  if (per.length >= 3) {
    for (let t = 0; t < 3; t++) {
      const a = Math.floor((t * per.length) / 3);
      const b = Math.floor(((t + 1) * per.length) / 3);
      const part = per.slice(a, b);
      const w = part.reduce((n, s) => n + s.words, 0);
      dialogueByThirds.push(w ? r3(part.reduce((n, s) => n + s.dialogueShare * s.words, 0) / w) : 0);
    }
  }

  // rhythm inside the sections: long-sentence stretches, dialogue-heavy and dialogue-free stretches
  // (a section whose counted sentences hold under 60% of its words is verse, a list or a script: its "average sentence" is the length of its lines, not a measure to compare)
  const withSentences = per.filter((s) => s.sentences >= 5 && s.sentences * s.avgSentence >= 0.6 * s.words);
  const sentenceMedian = r1(median(withSentences.map((s) => s.avgSentence)));
  const shareMedian = median(per.filter((s) => s.words >= 100).map((s) => s.dialogueShare));
  const longSentences = withSentences
    .filter((s) => sentenceMedian > 0 && s.avgSentence >= 20 && s.avgSentence >= 1.6 * sentenceMedian)
    .map((s) => ({ i: s.i, avg: s.avgSentence, ratio: r2(s.avgSentence / sentenceMedian) }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 6);
  const dialogue = [];
  if (per.length >= 4 && !dashes) {
    for (const s of per) {
      if (s.words < 100) continue;
      if (s.dialogueShare >= 0.5 && s.dialogueShare >= shareMedian + 0.3) dialogue.push({ i: s.i, share: s.dialogueShare, kind: 'heavy' });
      else if (s.dialogueShare === 0 && shareMedian >= 0.2) dialogue.push({ i: s.i, share: 0, kind: 'none' });
    }
  }

  return {
    median: med,
    outliers,
    dialogueByThirds,
    units,
    unitMedian,
    unitOutliers,
    rhythm: { sentenceMedian, longSentences, dialogue: dialogue.slice(0, 8), dialogueMedian: r3(shareMedian) },
  };
}

// ── tokens (shared by repeats and names) ─────────────────────────────────────

/** Words of the covered text with positions: lower-case form, start/end, section, and whether the gap before it is anything but one blank. */
function tokenise(src, secs, cap = Infinity) {
  const toks = [];
  const lowerCount = new Map();
  const intern = new Map(); // word -> small integer, so a 5-gram can be keyed by numbers instead of by a new string
  let s = 0;
  let prevEnd = -10;
  const re = /[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu;
  for (const m of src.matchAll(re)) {
    const raw = m[0].replace(/[-'’]+$/, '');
    if (!raw) continue;
    while (s < secs.length - 1 && m.index >= secs[s].end) s++;
    const lo = raw.replace(/’/g, "'").toLowerCase();
    if (lowerFirst(raw)) lowerCount.set(lo, (lowerCount.get(lo) ?? 0) + 1);
    if (toks.length < cap) {
      const gap = m.index - prevEnd;
      let id = intern.get(lo);
      if (id === undefined) intern.set(lo, (id = intern.size + 1));
      const joined = gap === 1 && (src[prevEnd] === ' ' || src.charCodeAt(prevEnd) === 0xa0);
      toks.push({ lo, id, start: m.index, end: m.index + raw.length, sec: s, brk: !joined });
    }
    prevEnd = m.index + raw.length;
  }
  return { toks, lowerCount };
}

// ── repeated phrases and sentence openers ────────────────────────────────────

const contentWord = (w) => w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w);

function repeatedPhrases(src, toks) {
  const n = toks.length;
  if (n < NGRAM * 3) return [];
  const ids = new Int32Array(n).fill(-1);
  // A 5-gram is keyed by a 52-bit number mixed from its word ids. A collision could only make a gram look commoner than it is: every candidate is recounted
  // exactly below (word by word), so a wrong key never reaches the result.
  const gramIds = new Map();
  const count = [];
  const nsec = [];
  const lastSec = [];
  for (let k = 0; k + NGRAM <= n; k++) {
    let ok = true;
    let h1 = 0x811c9dc5;
    let h2 = 0x01000193;
    for (let j = 0; j < NGRAM; j++) {
      const t = toks[k + j];
      if (j > 0 && t.brk) {
        ok = false;
        break;
      }
      h1 = Math.imul(h1 ^ t.id, 0x01000193);
      h2 = Math.imul(h2 + t.id, 0x2545f491) ^ (h2 >>> 15);
    }
    if (!ok) continue;
    const key = (h1 >>> 6) * 67108864 + (h2 >>> 6);
    let id = gramIds.get(key);
    if (id === undefined) {
      id = count.length;
      gramIds.set(key, id);
      count.push(0);
      nsec.push(0);
      lastSec.push(-1);
    }
    count[id]++;
    if (lastSec[id] !== toks[k].sec) {
      nsec[id]++;
      lastSec[id] = toks[k].sec;
    }
    ids[k] = id;
  }
  // a gram that comes back in three sections and has two content words in it
  const qualifies = new Map();
  const isQualified = (id) => {
    if (id < 0) return false;
    let q = qualifies.get(id);
    if (q === undefined) {
      q = count[id] >= 3 && nsec[id] >= 3;
      qualifies.set(id, q);
    }
    return q;
  };
  const candidates = new Map(); // phrase -> { tokens: [lo...], first }
  for (let k = 0; k + NGRAM <= n; k++) {
    if (!isQualified(ids[k])) continue;
    let e = k;
    while (e + 1 + NGRAM <= n && isQualified(ids[e + 1])) e++;
    const len = Math.min(MAX_PHRASE_WORDS, e - k + NGRAM);
    // the whole chain of overlapping qualified grams is one phrase; its first gram alone is the fallback if the whole phrase does not come back as often
    for (const size of len > NGRAM ? [len, NGRAM] : [len]) {
      const lows = toks.slice(k, k + size).map((t) => t.lo);
      if (lows.filter(contentWord).length >= 2 && new Set(lows).size >= 3) {
        const key = lows.join(' ');
        if (!candidates.has(key)) candidates.set(key, { lows, first: k });
      }
    }
    k = e; // (windows inside the chain belong to this phrase)
  }
  if (!candidates.size) return [];

  // an exact recount of each candidate: occurrences of the whole phrase, in how many sections
  const wanted = new Set([...candidates.values()].map((c) => c.lows[0]));
  const positions = new Map();
  for (let k = 0; k < n; k++) {
    if (wanted.has(toks[k].lo)) {
      const list = positions.get(toks[k].lo);
      if (list) list.push(k);
      else positions.set(toks[k].lo, [k]);
    }
  }
  const phrases = [];
  for (const c of candidates.values()) {
    let occurrences = 0;
    const secs = new Set();
    let at = -1;
    for (const k of positions.get(c.lows[0]) ?? []) {
      if (k <= at) continue;
      let ok = k + c.lows.length <= n;
      for (let j = 1; ok && j < c.lows.length; j++) ok = !toks[k + j].brk && toks[k + j].lo === c.lows[j];
      if (!ok) continue;
      occurrences++;
      secs.add(toks[k].sec);
      at = k + c.lows.length - 1;
    }
    if (occurrences >= 3 && secs.size >= 3) {
      const a = toks[c.first];
      const b = toks[c.first + c.lows.length - 1];
      phrases.push({ phrase: fragment(src, a.start, b.end), count: occurrences, sections: [...secs].sort((x, y) => x - y), kind: 'phrase', words: c.lows.length, lows: c.lows });
    }
  }
  phrases.sort((a, b) => b.count * b.words - a.count * a.words || a.phrase.localeCompare(b.phrase));
  // a phrase inside a longer phrase that comes back about as often is the same repeat
  const kept = [];
  const contains = (big, small) => {
    for (let s = 0; s + small.length <= big.length; s++) {
      let ok = true;
      for (let j = 0; ok && j < small.length; j++) ok = big[s + j] === small[j];
      if (ok) return true;
    }
    return false;
  };
  for (const p of phrases) {
    if (kept.some((q) => q.lows.length > p.lows.length && q.count >= p.count * 0.7 && contains(q.lows, p.lows))) continue;
    kept.push(p);
    if (kept.length >= 10) break;
  }
  return kept.map(({ lows, words, ...rest }) => rest);
}

const FIRST_WORD = /^[^\p{L}\p{N}]*([\p{L}\p{N}][\p{L}\p{N}'’-]*)/u;

function openerTics(src, secs) {
  const found = new Map(); // lower-case opener -> { phrase, longest, at, sections:Set }
  for (const s of secs) {
    // Sentences are cut at . ! ? only, paragraph by paragraph: a line break inside a paragraph (hard-wrapped prose, the lines of a poem) does not end one, and a
    // heading or a title line with no sentence in it is not one (it breaks a run, it does not count in it). Otherwise a poem's title and its first three lines
    // would be "four sentences in a row".
    const sentences = [];
    for (const para of splitParagraphs(src.slice(s.start, s.end))) {
      const flat = para.text.replace(/\s*\n\s*/g, ' ');
      if (!/[.!?…]["'”’)\]]*$/.test(flat) && wordsOf(flat).length <= 12) {
        sentences.push(null);
        continue;
      }
      // (a paragraph that opens with a quotation mark or a dash is somebody's turn to speak: "To Leeds?" answered by "To Leeds. To anywhere." is two voices, not one tic)
      const speech = /^(?:["“‘«]|[—–]\s)/.test(flat);
      if (speech) sentences.push(null);
      for (const sn of splitSentences(flat)) sentences.push(sn);
      if (speech) sentences.push(null);
    }
    let word = null;
    let run = 0;
    const close = () => {
      if (word && run >= 4) {
        const f = found.get(word.lo) ?? { phrase: word.raw, longest: 0, at: s.i, sections: new Set() };
        f.sections.add(s.i);
        if (run > f.longest) {
          f.longest = run;
          f.at = s.i;
        }
        found.set(word.lo, f);
      }
    };
    for (const sn of sentences) {
      const m = sn ? FIRST_WORD.exec(sn.text) : null;
      // a sentence that opens in lower case or with a digit is a piece cut at "README.md" or "3.5", not a sentence
      if (!m || !/^\p{Lu}/u.test(m[1])) {
        close();
        word = null;
        run = 0;
        continue;
      }
      const lo = m[1].toLowerCase();
      if (word && word.lo === lo) run++;
      else {
        close();
        word = { lo, raw: m[1] };
        run = 1;
      }
    }
    close();
  }
  return [...found.values()]
    .sort((a, b) => b.longest - a.longest || a.phrase.localeCompare(b.phrase))
    .slice(0, 5)
    .map((f) => ({ phrase: f.phrase, count: f.longest, sections: [...f.sections].sort((x, y) => x - y), kind: 'opener', at: f.at }));
}

// ── cast (names the text itself uses) ────────────────────────────────────────

// a word right after a name that tells what the name does ("Linnet said", "Linnet heard"): a name that acts is a person (or a talking thing)
const SPEECH_OR_ACTION = /^(?:said|says|asked|asks|replied|answered|whispered|shouted|muttered|called|cried|laughed|smiled|nodded|looked|turned|walked|ran|came|went|saw|took|made|knew|gave|found|told|held|kept|stood|sat|began|brought|wrote|spoke|heard|fell|became|met|paid|sent|left|felt|thought|got|did|had|was|were|would|could|will|can|is|has|\w+ed)$/;
// "said Banning", "asked Oriel": the verb comes first in dialogue tags, and a name that speaks is a person
const SPEECH_BEFORE = /\b(?:said|says|asked|asks|replied|answered|whispered|shouted|muttered|called|cried|added|sighed|growled|laughed|murmured|snapped|declared|demanded|continued|interrupted)\s+$/i;
const LOCATIVE = new Set('in at to from near above below through across toward towards into beyond outside inside around over under by past behind beside'.split(' '));
const DERIVED_SUFFIXES = ['y', 'ly', 'ed', 'er', 'ers', 'ing', 'ish', 'est', 'en', 'al', 'ic', 'ful', 'ness', 'less', 'able', 'ies', 'ian', 'ese'];
const DETERMINER_BEFORE = new Set('the a an this that these those'.split(' '));
const ORDINAL = new Set('first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth'.split(' '));

function isAllCaps(s) {
  let upper = 0;
  let lower = 0;
  const n = Math.min(s.length, 20000);
  for (let i = 0; i < n; i++) {
    const ch = s[i];
    if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) upper++;
    else if (ch === ch.toLowerCase() && ch !== ch.toUpperCase()) lower++;
  }
  return upper + lower >= 20 && upper / (upper + lower) > 0.85;
}

/** The notes of the reading as a list (note|null per section): the list itself, or the `per` of a notes object, or the `notes` of what readThrough / cachedNotes return. */
const notesList = (notes) => (Array.isArray(notes) ? notes : Array.isArray(notes?.per) ? notes.per : Array.isArray(notes?.notes) ? notes.notes : null);

function noteNamesOf(notesPer) {
  const out = [];
  for (const n of notesPer ?? []) {
    if (!n || !Array.isArray(n.names)) continue;
    for (const name of n.names.slice(0, 8)) if (typeof name === 'string' && name.trim() && name.length <= 60) out.push(name.trim());
  }
  return out;
}

const CUE_LINE = /^[ \t]*([A-Z][A-Z0-9'’.-]*(?: [A-Z][A-Z0-9'’.-]*){0,2})(?:[ \t]*\([^)\n]{0,30}\))?[ \t]*\r?\n(?=[ \t]*\S)/gm;
// Words a screenplay (or a manuscript) sets in capitals that are formatting, not people: a line of one of these is not a speaker, and as a recurring word it is not a term.
const SLUG_WORDS = /^(?:INT|EXT|FADE|CUT|DISSOLVE|SMASH|TITLE|SUPER|CONTINUED|CONT'D|THE END|END|CHAPTER|PART|ACT|SCENE|PROLOGUE|EPILOGUE|MONTAGE|FLASHBACK|INTERCUT|SERIES|ANGLE|CLOSE|WIDE|LATER|MEANWHILE|CONTINUOUS|MORE|INSERT|RESUME|OMITTED|BACK|DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|NOTE|WARNING|STOP)\b/;
const FORMAT_WORDS = new Set('INT EXT CUT FADE DISSOLVE SMASH SUPER CONTINUED CONTINUOUS MONTAGE FLASHBACK INTERCUT LATER MEANWHILE DAY NIGHT DAWN DUSK MORNING EVENING POV VO OS OC SFX FX TITLE'.split(' '));
const NO_CAST = () => ({ cast: [], termNames: [], names: [], proper: [], parts: [] });

/**
 * Names the text uses: capitalised words and runs, counted per section.
 * A capital at the start of a sentence proves nothing, so a single word is a name only if it is also capitalised in the middle of a sentence, comes back at
 * least three times and is not mostly written in lower case elsewhere ("Mark" the term, not "mark my words"). Two or three capitalised words in a row whose
 * words are all names ("Dessa Varnholt") are one name, and a first name or surname that belongs to only one such name counts for it.
 * What the name does decides its `kind`: it acts ("Linnet said"), it is a place ("in Greyfall"), it is a term the text uses with "the" ("the Pass").
 */
function castOf(src, secs, lowerCount, notesPer) {
  const runsRaw = capitalisedRuns(src);
  const M = secs.length;
  const mid = new Set(); // lower-case words seen capitalised in the middle of a sentence
  for (const r of runsRaw) {
    r.parts.forEach((p, k) => {
      if (k > 0 || !r.initial || r.possessive) mid.add(p.toLowerCase());
    });
  }
  const tok = new Map(); // word -> { total, mid }
  const initSections = new Map();
  const initWords = new Map(); // a rare word that only ever opens a sentence ("Linet looked up"): not a name by itself, but a candidate for a slip of one
  const weak = new Map(); // the same words with the sections they open and how often an action or speech verb follows ("Tobias looked", "Tobias did"): see below
  const runStat = new Map(); // "Dessa Varnholt" -> { count, bySec, verb, place, det }
  const proper = new Map(); // lower-case capitalised word -> count (everything capitalised, for grounding replies)
  let s = 0;
  for (const r of runsRaw) {
    for (const p of r.parts) proper.set(p.toLowerCase(), (proper.get(p.toLowerCase()) ?? 0) + 1);
    while (s < M - 1 && r.start >= secs[s].end) s++;
    const parts = r.parts;
    let lead = 0;
    while (lead < parts.length && (STOPWORDS.has(parts[lead].toLowerCase()) || TITLES.has(parts[lead].toLowerCase()))) lead++;
    let end = parts.length;
    while (end > lead && STOPWORDS.has(parts[end - 1].toLowerCase())) end--;
    if (lead >= end) continue;
    if (r.initial && lead === 0) {
      // the first word of a sentence: part of the name only if it is a name elsewhere, or if two capitals in a row make a name ("Corin Ashby watched")
      const first = parts[0].toLowerCase();
      const keep = mid.has(first) || (end - lead > 1 && !OPENERS.has(first) && !ORDINARY_OPENERS.has(first) && !(first.length > 4 && first.endsWith('ly'))) || (r.possessive && end - lead === 1);
      if (!keep) {
        const w = parts[0];
        const plain = end - lead === 1 && !STOPWORDS.has(first) && !OPENERS.has(first) && !ORDINARY_OPENERS.has(first) && !COMMON_CAPS.has(first);
        if (plain && w.length >= 4) {
          initWords.set(w, (initWords.get(w) ?? 0) + 1);
          initSections.set(w, [...(initSections.get(w) ?? []), s]);
        }
        if (plain && w.length >= 3) {
          const wk = weak.get(w) ?? { total: 0, acts: 0, bySec: new Map() };
          const after = /^['’]?s?\s+([\p{L}']+)/u.exec(src.slice(r.end, r.end + 28));
          wk.total++;
          if (after && SPEECH_OR_ACTION.test(after[1].toLowerCase())) wk.acts++;
          wk.bySec.set(s, (wk.bySec.get(s) ?? 0) + 1);
          weak.set(w, wk);
        }
        lead = 1;
      }
    }
    let piece = [];
    let pieceAt = lead;
    const flush = (label = false) => {
      if (!piece.length) return;
      if (label) {
        piece = []; // ("Figure 3", "Day Two": a word that labels a number is not the name of anyone)
        return;
      }
      const key = piece.join(' ');
      const st = runStat.get(key) ?? { count: 0, bySec: new Map(), verb: 0, place: 0, det: 0 };
      st.count++;
      st.bySec.set(s, (st.bySec.get(s) ?? 0) + 1);
      const tail = pieceAt + piece.length >= parts.length;
      let acts = false;
      if (tail) {
        const after = /^['’]?s?\s+([\p{L}']+)/u.exec(src.slice(r.end, r.end + 28));
        acts = Boolean(after && SPEECH_OR_ACTION.test(after[1].toLowerCase()));
      }
      if (!acts && parts.slice(0, pieceAt).every((p) => TITLES.has(p.toLowerCase()) || STOPWORDS.has(p.toLowerCase())) && SPEECH_BEFORE.test(src.slice(Math.max(0, r.start - 16), r.start))) acts = true;
      if (acts) st.verb++;
      if (pieceAt > 0) {
        if (DETERMINER_BEFORE.has(parts[pieceAt - 1].toLowerCase())) st.det++;
      } else {
        const before = /([\p{L}']+)[ \t]+$/u.exec(src.slice(Math.max(0, r.start - 24), r.start));
        const w = before ? before[1].toLowerCase() : '';
        if (DETERMINER_BEFORE.has(w)) st.det++;
        else if (LOCATIVE.has(w)) st.place++;
      }
      runStat.set(key, st);
      piece.forEach((p, q) => {
        const t = tok.get(p) ?? { total: 0, mid: 0 };
        t.total++;
        if (!(r.initial && pieceAt + q === 0) || r.possessive) t.mid++;
        tok.set(p, t);
      });
      piece = [];
    };
    for (let k = lead; k < end; k++) {
      const p = parts[k];
      const lo = p.toLowerCase();
      if (neverName(p) || isNumberWord(lo) || ORDINAL.has(lo) || TITLES.has(lo)) {
        flush(!neverName(p) && !TITLES.has(lo) && (isNumberWord(lo) || ORDINAL.has(lo)) && pieceAt + piece.length === k);
        pieceAt = k + 1;
      } else {
        if (!piece.length) pieceAt = k;
        piece.push(p);
      }
    }
    flush(end === parts.length && /^[ \t]+\d/.test(src.slice(r.end, r.end + 4)));
  }

  const lowerRatio = (part) => {
    const t = tok.get(part);
    return t ? (lowerCount.get(part.toLowerCase()) ?? 0) / t.total : 1;
  };
  const nameWord = (part) => {
    const lo = part.toLowerCase();
    return part.length >= 3 && !STOPWORDS.has(lo) && !OPENERS.has(lo) && !ORDINARY_OPENERS.has(lo) && !COMMON_CAPS.has(lo) && lowerRatio(part) <= 0.35;
  };

  const singles = new Set();
  for (const [part, t] of tok) if (t.total >= 3 && t.mid >= 1 && nameWord(part)) singles.add(part);

  // two or three words in a row, all of them names: "Dessa Varnholt"
  const personLike = [...runStat.entries()].filter(([key]) => {
    const parts = key.split(' ');
    return parts.length >= 2 && parts.length <= 3 && parts.every(nameWord);
  });
  const partOwners = new Map(); // word -> how many such runs hold it
  for (const [key] of personLike) for (const p of new Set(key.split(' '))) partOwners.set(p, (partOwners.get(p) ?? 0) + 1);
  const fulls = personLike.filter(([, st]) => st.count >= 2).sort((a, b) => b[1].count - a[1].count || (a[0] < b[0] ? -1 : 1));

  // which runs hold a word ("Ombrecht" -> "Isaura Ombrecht", "Tobiah Ombrecht"), built once
  const containing = new Map();
  for (const key of runStat.keys()) {
    for (const p of new Set(key.split(' '))) {
      const list = containing.get(p);
      if (list) list.push(key);
      else containing.set(p, [key]);
    }
  }
  const entities = [];
  const claimed = new Set();
  for (const [key] of fulls) {
    // the parts of a full name that belong to it alone are folded into it (they do not become names of their own); only a part the text really uses ON ITS OWN
    // ("Roe said") and that is not a rank or relation ("Captain", "Aunt") is offered as another way the text names the person, and only those are counted with it
    const parts = key.split(' ').filter((p) => singles.has(p) && partOwners.get(p) === 1 && !claimed.has(p));
    parts.forEach((a) => claimed.add(a));
    const aliases = parts.filter((x) => !ROLE_WORDS.has(x.toLowerCase()) && (runStat.get(x)?.count ?? 0) > 0);
    entities.push({ name: key, aliases, parts, forms: new Set([key, ...aliases]), full: true });
  }
  const personLikeKeys = new Set(personLike.map(([k]) => k));
  for (const part of singles) {
    if (claimed.has(part)) continue;
    // a word that is nearly always part of one coined phrase ("Board" in "Idea Board", "Low" in "Low Day") is that phrase's, not a name of its own
    const inside = (containing.get(part) ?? []).filter((k) => k !== part && !personLikeKeys.has(k));
    const insideCount = inside.reduce((n, k) => n + runStat.get(k).count, 0);
    if (inside.length && insideCount / (tok.get(part)?.total || 1) >= 0.8) continue;
    // a word is also counted wherever it sits inside a longer run ("Ombrecht" in "Isaura Ombrecht", "Mara" in "Old Mara")
    const forms = new Set([part, ...(containing.get(part) ?? [])]);
    entities.push({ name: part, aliases: [], forms, full: false });
  }
  // names the reading notes found (each was checked to occur in its section) that the counts alone would miss: counted straight from the text
  const known = new Set(entities.flatMap((e) => [e.name, ...e.aliases]).map((x) => x.toLowerCase()));
  const fromNotes = [...new Set(noteNamesOf(notesPer))]
    .filter((nm) => !known.has(nm.toLowerCase()) && !neverName(nm) && nm.split(' ').every((w) => w.length >= 3 && !STOPWORDS.has(w.toLowerCase())))
    .slice(0, 30);
  if (fromNotes.length) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${fromNotes.sort((x, y) => y.length - x.length).map(escapeRe).join('|')})(?![\\p{L}\\p{N}])`, 'gu');
    const direct = new Map();
    for (const m of src.matchAll(re)) {
      const si = sectionAt(secs, m.index);
      if (si < 0) continue;
      const d = direct.get(m[0]) ?? new Array(M).fill(0);
      d[si]++;
      direct.set(m[0], d);
    }
    for (const [name, bySec] of direct) if (bySec.reduce((x, y) => x + y, 0) >= 2) entities.push({ name, aliases: [], forms: new Set(), full: name.includes(' '), fromNotes: true, direct: bySec });
  }

  // a screenplay names its speakers on a line of their own ("NORA", "DESMOND (O.S.)"): three cues make a name
  const cues = new Map();
  for (const m of src.matchAll(CUE_LINE)) {
    const name = m[1].trim();
    if (name.length < 2 || !/[A-Z]{2}/.test(name) || SLUG_WORDS.test(name) || /[.:]$/.test(name)) continue;
    cues.set(name, (cues.get(name) ?? 0) + 1);
  }
  const cueNames = [...cues].filter(([, n]) => n >= 3).sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).slice(0, 20).map(([name]) => name);
  for (const name of cueNames) {
    if (known.has(name.toLowerCase())) {
      // "Desmond crosses to the sink" and a "DESMOND" cue are one person: the cue lines (and the capitals in a scene heading) are counted with the mixed-case mentions
      const e = entities.find((x) => !x.speaker && [x.name, ...x.aliases].some((n) => n.toLowerCase() === name.toLowerCase()));
      if (e) {
        const bySec = new Array(M).fill(0);
        for (const m of src.matchAll(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(name)}(?![\\p{L}\\p{N}])`, 'gu'))) {
          const si = sectionAt(secs, m.index);
          if (si >= 0) bySec[si]++;
        }
        e.direct = e.direct ? e.direct.map((c, i) => c + bySec[i]) : bySec;
        e.speaker = true;
      }
      continue;
    }
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(name)}(?![\\p{L}\\p{N}])`, 'giu');
    const bySec = new Array(M).fill(0);
    for (const m of src.matchAll(re)) {
      const si = sectionAt(secs, m.index);
      if (si >= 0) bySec[si]++;
    }
    known.add(name.toLowerCase());
    entities.push({ name, aliases: [], forms: new Set(), full: false, fromNotes: false, direct: bySec, speaker: true });
  }

  // A character who is only ever named at the start of a sentence ("Tobias picked up the bag. Tobias looked at the floor.") has no capital in the middle of one to prove
  // it. Four sentences opened by the same word, three of them followed by a verb of doing or saying, a word never written in lower case: counted as a name.
  const taken = new Set(entities.flatMap((e) => [e.name, ...e.aliases, ...(e.parts ?? [])]).map((x) => x.toLowerCase()));
  for (const [w, wk] of weak) {
    const lo = w.toLowerCase();
    if (wk.total < 4 || wk.acts < 3 || taken.has(lo) || known.has(lo) || tok.has(w) || neverName(w) || (lowerCount.get(lo) ?? 0) > 0) continue;
    const bySec = new Array(M).fill(0);
    for (const [si, c] of wk.bySec) bySec[si] = c;
    entities.push({ name: w, aliases: [], forms: new Set(), full: false, direct: bySec, actor: true });
  }

  const cast = [];
  const termNames = [];
  const partsOf = new Map();
  for (const e of entities) {
    const bySec = e.direct ? [...e.direct] : new Array(M).fill(0);
    let verb = 0;
    let place = 0;
    let det = 0;
    let total = 0;
    for (const f of e.forms) {
      const st = runStat.get(f);
      if (!st) continue;
      for (const [si, c] of st.bySec) bySec[si] += c;
      verb += st.verb;
      place += st.place;
      det += st.det;
      total += st.count;
    }
    const sections = [];
    bySec.forEach((c, i) => c > 0 && sections.push(i));
    const mentions = bySec.reduce((a, b) => a + b, 0);
    if (mentions < (e.fromNotes ? 2 : 3)) continue;
    const gaps = [];
    for (let q = 1; q < sections.length; q++) if (sections[q] - sections[q - 1] - 1 >= 3) gaps.push([sections[q - 1] + 1, sections[q] - 1]);
    gaps.sort((a, b) => b[1] - b[0] - (a[1] - a[0]) || a[0] - b[0]);
    const share = (n) => (total ? n / total : 0);
    const kind = e.speaker || e.actor ? 'person' : share(det) >= 0.4 ? 'term' : share(place) >= 0.4 ? 'place' : e.full || (share(det) < 0.15 && share(verb) >= 0.25) ? 'person' : 'name';
    // (the parts that were folded into the full name stay in `partsOf`, for the spelling check and for keeping them out of the terms)
    const aliases = e.aliases.slice(0, 4);
    partsOf.set(e.name, e.parts ?? e.aliases);
    const entry = { name: e.name, aliases, mentions, sections, first: sections[0] ?? 0, last: sections.at(-1) ?? 0, gaps: gaps.slice(0, 5).sort((a, b) => a[0] - b[0]), kind };
    (kind === 'term' ? termNames : cast).push(entry);
  }
  const order = (a, b) => b.mentions - a.mentions || a.first - b.first || (a.name < b.name ? -1 : 1);
  cast.sort(order);
  termNames.sort(order);

  // capitalised phrases that come back and are not a person's name ("Haul Day", "Fill Season"): terms the text coined
  const personWords = new Set(cast.filter((c) => c.kind === 'person').flatMap((c) => [c.name, ...c.aliases]).flatMap((x) => x.split(' ')).map((w) => w.toLowerCase()));
  for (const [key, st] of runStat) {
    const parts = key.split(' ');
    if (parts.length < 2 || parts.length > 3 || st.count < 2 || parts.some((p) => p.length < 3 || personWords.has(p.toLowerCase())) || parts.every(nameWord)) continue;
    if (!termNames.some((t) => t.name === key)) termNames.push({ name: key, aliases: [], mentions: st.count, sections: [...st.bySec.keys()].sort((x, y) => x - y), first: 0, last: 0, gaps: [], kind: 'term' });
  }

  // spellings that look like slips: a word used one to three times, never in lower case, one letter off a name used far more often
  const names = [];
  const bases = [...new Set([...cast, ...termNames].flatMap((c) => [c.name, ...c.aliases, ...(partsOf.get(c.name) ?? [])]).filter((x) => !x.includes(' ')))]
    .map((base) => ({ base, bl: base.toLowerCase(), bt: tok.get(base) }))
    .filter((x) => x.bt);
  const seen = new Set();
  const candidates = new Map(tok);
  for (const [w, n] of initWords) if (!candidates.has(w)) candidates.set(w, { total: n, mid: 0 });
  for (const [part, t] of candidates) {
    if (t.total > 3 || part.length < 4) continue;
    const lo = part.toLowerCase();
    if ((lowerCount.get(lo) ?? 0) > 0 || STOPWORDS.has(lo) || OPENERS.has(lo)) continue;
    for (const { base, bl, bt } of bases) {
      // (cheapest tests first: this runs for every rare word against every name)
      if (base === part || Math.abs(bl.length - lo.length) > 1 || bt.total < Math.max(5, t.total * 4)) continue;
      if (part.length >= 9 ? osa(bl, lo) > 2 : !withinOne(bl, lo)) continue;
      if (bl + 's' === lo || lo + 's' === bl || bl + 'es' === lo || lo + 'es' === bl) continue; // a plural ("the Ombrechts") is not a slip
      if (DERIVED_SUFFIXES.some((sf) => bl + sf === lo || lo + sf === bl)) continue; // ("Marshy", "Marsher": the name with an ending, an ordinary word)
      const pair = `${base}|${part}`;
      if (seen.has(pair)) continue;
      seen.add(pair);
      const where = new Set();
      for (const key of containing.get(part) ?? []) for (const si of runStat.get(key).bySec.keys()) where.add(si);
      for (const si of initSections.get(part) ?? []) where.add(si);
      names.push({ a: base, b: part, sections: [...where].sort((x, y) => x - y), aCount: bt.total, bCount: t.total });
    }
  }
  names.sort((x, y) => y.aCount / y.bCount - x.aCount / x.bCount || (x.b < y.b ? -1 : 1));

  const properList = [...proper.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, 6000).map(([w]) => w);
  return { cast: cast.slice(0, 40), termNames: termNames.slice(0, 40), names: names.slice(0, 10), proper: properList, parts: [...partsOf.values()].flat() };
}

/** Is `b` one edit from `a` (a letter inserted, dropped or replaced, or two neighbours swapped)? Linear, and no table: this is asked for every rare word against every name. */
function withinOne(a, b) {
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0;
  while (i < la && i < lb && a[i] === b[i]) i++;
  if (i === la && i === lb) return true;
  if (la === lb) {
    if (a.slice(i + 1) === b.slice(i + 1)) return true; // one letter replaced
    return i + 1 < la && a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2); // two neighbours swapped
  }
  return la > lb ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}

/** Optimal string alignment distance (insert, delete, replace, swap two neighbours) for short words. */
function osa(a, b) {
  const al = a.length;
  const bl = b.length;
  if (Math.abs(al - bl) > 2) return 3;
  const d = Array.from({ length: al + 1 }, (_, i) => [i, ...new Array(bl).fill(0)]);
  for (let j = 1; j <= bl; j++) d[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[al][bl];
}

// ── figures (numbers with the thing they measure) ────────────────────────────

// Verbs that state what a thing IS or HOLDS ("the tower holds ninety barrels"), not what someone did ("she carried nine buckets"): a state can be given two
// different numbers by mistake, an event can happen twice with different counts.
const ANCHOR_VERBS = new Set(
  ('holds hold contains contain contained measures measure measured weighs weigh weighed has have takes costs cost totals total totalled spans span spanned seats seated ' +
    'numbers numbered requires require required reaches reached lasts last lasted is are was were').split(' ')
);
const FILLERS = new Set('about around roughly nearly almost only just some over under at up to than more less exactly approximately least most upwards a an'.split(' '));
const RELATIVE = new Set(['which', 'that', 'who']);
const PRONOUNS_RESOLVED = new Set(['it', 'this']);
const PRONOUNS_LOST = new Set(['they', 'he', 'she', 'we', 'i', 'you', 'there', 'these', 'those', 'what', 'one']);
const DETERMINERS = new Set('the a an this that these those his her their its our my your some every each all'.split(' '));
const ADVERBISH = (w) => (w.length > 4 && w.endsWith('ly')) || ['also', 'still', 'always', 'never', 'only', 'just', 'often', 'now', 'then', 'already', 'even', 'not', 'usually', 'once'].includes(w);

function sentenceTokens(text) {
  const toks = [];
  for (const m of text.matchAll(NUMBER_TOKEN)) toks.push({ raw: m[0], lo: m[0].toLowerCase().replace(/’/g, "'"), start: m.index, end: m.index + m[0].length, digit: /^\d/.test(m[0]), i: toks.length });
  return toks;
}

/** The head of the subject of a sentence ("The Brimmer is a tarn" -> "Brimmer"), for "It holds forty thousand barrels" in the sentence after it. */
function subjectHead(toks) {
  let k = 0;
  while (k < toks.length && DETERMINERS.has(toks[k].lo)) k++;
  let head = null;
  for (; k < toks.length && k < 4; k++) {
    const t = toks[k];
    if (t.digit || STOPWORDS.has(t.lo) || ANCHOR_VERBS.has(t.lo) || ADVERBISH(t.lo)) break;
    head = t;
  }
  return head;
}

function figuresOf(src, secs, people = new Set()) {
  const groups = new Map();
  let prevHead = null;
  for (const s of secs) {
    for (const sn of splitSentences(src.slice(s.start, s.end))) {
      const base = s.start + sn.start;
      const toks = sentenceTokens(sn.text);
      if (!toks.length) continue;
      for (let k = 0; k < toks.length; k++) {
        const t = toks[k];
        let value = null;
        let used = 1;
        let hyphenUnit = null;
        if (t.digit) {
          const prevCh = sn.text[t.start - 1];
          const nextCh = sn.text[t.end];
          if ((nextCh && /[\p{L}\p{M}]/u.test(nextCh)) || (prevCh && /[\p{L}\p{M}]/u.test(prevCh))) continue;
          value = parseDigits(t.raw);
        } else if (t.lo.includes('-') && isNumberWord(t.lo.split('-')[0]) && !t.lo.split('-').every((a) => isNumberWord(a))) {
          // "a nine-strand rope"
          const [num, ...rest] = t.lo.split('-');
          const p = parseNumberWords([num], 0);
          if (p && rest.length === 1 && /^[a-z]{3,}$/.test(rest[0]) && !STOPWORDS.has(rest[0])) {
            value = p.value;
            hyphenUnit = rest[0];
          }
        } else if (isNumberWord(t.lo.split('-')[0]) || t.lo === 'a' || t.lo === 'an') {
          // number words that follow each other with nothing but blanks between them
          let run = 1;
          while (run < 8 && k + run < toks.length && /^[ \t]+$/.test(sn.text.slice(toks[k + run - 1].end, toks[k + run].start))) run++;
          const p = parseNumberWords(toks.slice(k, k + run).map((x) => x.lo), 0);
          if (p) {
            value = p.value;
            used = p.used;
          }
        }
        if (value === null || value < 2) continue;
        const last = toks[k + used - 1];
        // the thing counted
        let unit = null;
        let unitTok = null;
        if (hyphenUnit) {
          unit = hyphenUnit;
          unitTok = t;
        } else {
          const gap = (a, b) => /^[ \t]+$|^-$/.test(sn.text.slice(a.end, b.start));
          const u1 = toks[k + used];
          if (u1 && !u1.digit && gap(last, u1) && /^[a-z][a-z'’-]{2,}$/.test(u1.raw) && !STOPWORDS.has(u1.lo) && !ADVERBISH(u1.lo) && !/(?:ed|ing)$/.test(u1.lo)) {
            const u2 = toks[k + used + 1];
            const second = u2 && !u2.digit && gap(u1, u2) && /^[a-z][a-z'’-]{2,}$/.test(u2.raw) && !STOPWORDS.has(u2.lo) && !ADVERBISH(u2.lo) && !/(?:ed|ing)$/.test(u2.lo);
            if (second && !pluralLooking(u1.lo) && pluralLooking(u2.lo)) {
              unit = u2.lo;
              unitTok = u2;
            } else {
              unit = u1.lo;
              unitTok = u1;
            }
          }
        }
        if (!unit) continue;
        if (!hyphenUnit && /^[ \t-]+old\b/i.test(sn.text.slice(unitTok.end, unitTok.end + 8))) continue; // "nine years old": a person grows older, the text is not contradicting itself
        if (!hyphenUnit && t.digit && value >= 1000 && value <= 2100 && !t.raw.includes(',') && !pluralLooking(unit)) continue; // a year

        // whose measure it is; `fromTok` is where the quoted fragment starts (the subject as written: "It", "Brimmer", or the noun before "of")
        let ownerTok = null;
        let verbTok = null;
        let fromTok = t;
        let inferred = false;
        if (hyphenUnit) {
          const nx = toks[k + 1];
          if (nx && !nx.digit && /^[a-z]{3,}$/.test(nx.lo) && !STOPWORDS.has(nx.lo) && /^[ \t]+$/.test(sn.text.slice(t.end, nx.start))) ownerTok = nx;
        } else {
          let j = k - 1;
          while (j >= 0 && FILLERS.has(toks[j].lo)) j--;
          if (j >= 0 && ANCHOR_VERBS.has(toks[j].lo)) {
            verbTok = toks[j];
            let q = j - 1;
            while (q >= 0 && ADVERBISH(toks[q].lo)) q--;
            if (q >= 0 && RELATIVE.has(toks[q].lo)) q--;
            if (q >= 0) {
              const cand = toks[q];
              if (PRONOUNS_RESOLVED.has(cand.lo)) {
                if (prevHead) {
                  ownerTok = prevHead;
                  fromTok = cand;
                  inferred = true;
                }
              } else if (!PRONOUNS_LOST.has(cand.lo) && !STOPWORDS.has(cand.lo) && !cand.digit && cand.lo.length >= 3 && !ANCHOR_VERBS.has(cand.lo) && !people.has(cand.lo)) {
                ownerTok = cand;
                fromTok = cand;
              }
            }
          } else if (j >= 1 && toks[j].lo === 'of') {
            const cand = toks[j - 1];
            if (!cand.digit && !STOPWORDS.has(cand.lo) && cand.lo.length >= 3 && !isNumberWord(cand.lo) && !people.has(cand.lo)) {
              ownerTok = cand;
              fromTok = cand;
            }
          }
        }
        if (!ownerTok) continue;
        const owner = singular(ownerTok.lo);
        const unitNorm = singular(unit);
        // a short exact fragment: from the subject to the end of the thing counted (from the verb, or the number, when that is longer than 14 words)
        const to = base + unitTok.end;
        const from = base + Math.min(fromTok.start, t.start);
        let quote = fragment(src, from, to);
        if (wordsOf(src.slice(from, to)).length > MAX_PHRASE_WORDS) quote = fragment(src, base + Math.min(verbTok?.start ?? t.start, t.start), to);
        if (wordsOf(src.slice(base + Math.min(verbTok?.start ?? t.start, t.start), to)).length > MAX_PHRASE_WORDS) quote = fragment(src, base + t.start, to);
        const key = `${owner}|${unitNorm}`;
        const g = groups.get(key) ?? { noun: ownerTok.raw.replace(/['’]s$/i, ''), unit: unitNorm, items: [], proper: false };
        // a capital in the middle of a sentence says it is somebody's or something's NAME ("the Brimmer"); a plain noun ("the room") may be a different one each time
        if (/^\p{Lu}/u.test(ownerTok.raw) && ownerTok.i > 0) g.proper = true;
        if (g.items.length < 12 && !g.items.some((x) => x.section === s.i && x.value === value)) {
          g.items.push({ value, unit: unitTok === t ? unit : unitTok.raw, section: s.i, quote, written: src.slice(base + t.start, to), inferred });
        }
        groups.set(key, g);
        k += used - 1;
      }
      prevHead = subjectHead(toks);
    }
  }
  const out = [];
  for (const g of groups.values()) {
    const secsOf = new Set(g.items.map((x) => x.section));
    if (secsOf.size < 2) continue;
    const conflict = g.items.some((a) => g.items.some((b) => a.section !== b.section && a.value !== b.value));
    out.push({ noun: g.noun, unit: g.unit, items: g.items, conflict, proper: g.proper });
  }
  out.sort((a, b) => Number(b.conflict) - Number(a.conflict) || Number(b.proper) - Number(a.proper) || b.items.length - a.items.length || (a.noun < b.noun ? -1 : 1));
  return out.slice(0, 30);
}

// ── terms ────────────────────────────────────────────────────────────────────

const DEFINING = /\b(?:called|known as|termed)\s+(?:a|an|the)\s+([\p{L}][\p{L}'’-]{2,}(?:\s+\p{Lu}[\p{L}'’-]+)?)/giu;

/**
 * Terms the text keeps using: the style module's recurring terms, capitalised terms ("the Pass"), words the text itself defines ("a steel tank called a belly")
 * and the terms in the reading notes. Each with the sections it occurs in.
 */
function termsOf(src, secs, { signature, notesPer, castNames, termNames }) {
  const defined = new Map();
  for (const m of src.matchAll(DEFINING)) {
    const term = m[1].replace(/['’]s$/i, '');
    const lo = term.toLowerCase();
    if (STOPWORDS.has(lo) || OPENERS.has(lo) || defined.has(lo)) continue;
    defined.set(lo, { term, section: Math.max(0, sectionAt(secs, m.index)) });
  }
  // (a recurring "INT" or "CUT" is the format of a screenplay, not a term of the story)
  const raw = [...signature.filter((t) => !FORMAT_WORDS.has(String(t))).map((t) => ({ t })), ...termNames.map((c) => ({ t: c.name })), ...[...defined.values()].map((d) => ({ t: d.term, defined: true }))];
  // (a term a model noted is believed only as far as the text bears it out: measured on the real model, "Book" came back as a term found in 23 of 25 sections, an ordinary word)
  for (const n of notesPer ?? []) if (n && Array.isArray(n.terms)) for (const t of n.terms.slice(0, 6)) if (typeof t === 'string') raw.push({ t: t.trim(), fromNote: true });
  const seen = new Set();
  const out = [];
  for (const { t, defined: isDef, fromNote } of raw) {
    const key = t.toLowerCase();
    if (!t || t.length > 40 || seen.has(key) || castNames.has(key)) continue;
    if (/^i['’]/.test(key) || TITLES.has(key) || COMMON_CAPS.has(key) || OPENERS.has(key) || ORDINARY_OPENERS.has(key)) continue; // ("I'd", "Prof", "Figure", "Hello": words, not terms of the story)
    seen.add(key);
    let re;
    try {
      // (a capitalised term from a note must be capitalised in the text too: "Book" is not "book")
      re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(t)}(?![\\p{L}\\p{N}])`, fromNote && /^\p{Lu}/u.test(t) ? 'u' : 'iu');
    } catch {
      continue;
    }
    const sections = [];
    for (const s of secs) if (re.test(src.slice(s.start, s.end))) sections.push(s.i);
    if (!sections.length || (isDef && sections.length < 2)) continue;
    if (fromNote && !/^\p{Lu}/u.test(t) && secs.length >= 5 && sections.length > secs.length * 0.8) continue; // a lower-case word in nearly every section is ordinary vocabulary, not a coined term
    const d = defined.get(key);
    out.push(d ? { term: t, sections, defined: d.section } : { term: t, sections });
  }
  out.sort((a, b) => b.sections.length - a.sections.length || a.sections[0] - b.sections[0] || (a.term < b.term ? -1 : 1));
  // "Cuts" next to "Weight Cuts" in the same places is one term
  const whole = out.filter((t) => !out.some((u) => u !== t && u.term.length > t.term.length && new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(t.term)}(?![\\p{L}\\p{N}])`, 'iu').test(u.term) && u.sections.length >= t.sections.length * 0.8));
  return whole.slice(0, 30);
}

// ── time stamps ──────────────────────────────────────────────────────────────

const MONTH_NAMES = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const STAMP_LINE = /^[ \t]*((Year|Day|Week|Month|Cycle)[ \t]+([\p{L}\d][\p{L}\d \t-]{0,28}?)(?:[ \t]*,[ \t]*(January|February|March|April|May|June|July|August|September|October|November|December))?)(?=[ \t]*(?:[.:;—–]|$))/gimu;
const DATE_LINE = /^[ \t]*((January|February|March|April|May|June|July|August|September|October|November|December)\.?[ \t]+(\d{1,2})(?:st|nd|rd|th)?,?[ \t]+(\d{4}))(?=[ \t]*(?:[.:;—–]|$))/gimu;

function timelineOf(src, secs) {
  const stamps = [];
  for (const s of secs) {
    if (stamps.length >= 300) break;
    const text = src.slice(s.start, s.end);
    for (const m of text.matchAll(STAMP_LINE)) {
      const words = m[3].trim().toLowerCase().split(/\s+/);
      const num = /^\d+$/.test(words.join('')) ? { value: Number(words.join('')), used: 1 } : parseNumberWords(words, 0);
      if (!num || num.used !== words.length) continue;
      const month = m[4] ? MONTH_NAMES.indexOf(m[4].toLowerCase()) : -1;
      const family = m[2].toLowerCase();
      // (a "Year two" without a month is compared with other stamps by its year only)
      stamps.push({ section: s.i, label: m[1], family, key: family === 'year' ? num.value * 12 + Math.max(month, 0) : num.value, coarse: family === 'year' && month < 0 });
    }
    for (const m of text.matchAll(DATE_LINE)) {
      const month = MONTH_NAMES.indexOf(m[2].toLowerCase());
      stamps.push({ section: s.i, label: m[1], family: 'date', key: Number(m[4]) * 372 + month * 31 + Number(m[3]), coarse: false });
    }
  }
  // (within a section the stamps of one family stay in text order; the sort is stable)
  stamps.sort((a, b) => a.section - b.section);
  const jumps = [];
  const lastOf = new Map();
  for (const st of stamps) {
    const prev = lastOf.get(st.family);
    const back = prev && (prev.coarse || st.coarse ? Math.floor(st.key / 12) < Math.floor(prev.key / 12) : st.key < prev.key);
    if (back && jumps.length < 20) jumps.push({ at: st.section, from: prev.label, to: st.label, fromSection: prev.section, toSection: st.section });
    lastOf.set(st.family, st);
  }
  return { stamps: stamps.slice(0, 300).map(({ section, label, family, key }) => ({ section, label, family, key })), jumps };
}

// ── the writer's own rules ───────────────────────────────────────────────────

function rulesOf(src, secs, project) {
  const given = project && Array.isArray(project.rules) ? project.rules.filter((r) => r && typeof r.text === 'string' && r.text.trim() && r.enabled !== false) : [];
  if (!given.length) return null;
  const base = { count: 0, total: 0, findings: [], bySection: {}, headline: '', items: [], needsModel: 0, intentional: 0, failed: false };
  if (!src.trim()) return base;
  let report;
  try {
    report = scan({ text: src, project, observations: false });
  } catch {
    return { ...base, failed: true };
  }
  const items = (report.rules?.items ?? []).map((i) => ({ id: i.id, text: i.text, state: i.state, count: i.count ?? 0, total: i.total ?? i.count ?? 0, truncated: Boolean(i.truncated) }));
  const ruleFindings = report.findings.filter((f) => f.section === 'rule');
  const counted = ruleFindings.filter((f) => f.class !== 'intentional-possibility' && f.class !== 'strength' && Number.isFinite(f.start));
  const order = Object.fromEntries(CLASSES.map((c, i) => [c, i]));
  counted.sort((a, b) => (order[a.class] ?? 9) - (order[b.class] ?? 9) || a.start - b.start);
  const bySection = {};
  const findings = [];
  for (const f of counted) {
    const si = sectionAt(secs, f.start);
    if (si < 0) continue;
    bySection[si] = (bySection[si] ?? 0) + 1;
    if (findings.length < MAX_FINDINGS) {
      findings.push({ id: f.id, ruleId: f.meta?.ruleId ?? '', rule: f.meta?.ruleText ?? f.title ?? '', class: f.class, section: si, start: f.start, end: f.end ?? f.start, quote: fragment(src, f.start, Math.max(f.end ?? f.start, f.start + 1)), method: f.meta?.method ?? '' });
    }
  }
  return {
    count: Object.values(bySection).reduce((a, b) => a + b, 0),
    total: items.reduce((a, i) => a + (i.state === 'checked' || i.state === 'approximate' ? i.total : 0), 0),
    findings,
    bySection,
    headline: report.headline ?? '',
    items,
    needsModel: items.filter((i) => i.state === 'needs-model').length,
    intentional: ruleFindings.filter((f) => f.class === 'intentional-possibility').length,
    failed: false,
  };
}

// ── the analysis ─────────────────────────────────────────────────────────────

/** How many headed parts the covered text has, and the first and last heading as written. */
function headingSummary(per) {
  const titles = per.flatMap((s) => s.headTitles ?? []);
  const count = per.reduce((n, s) => n + (s.headings ?? 0), 0);
  return { count, first: titles[0] ?? '', last: titles.at(-1) ?? '' };
}

function emptyAnalysis(maxSections) {
  return {
    v: ANALYSIS_VERSION,
    words: 0,
    sectionCount: 0,
    covered: { sections: 0, of: 0, words: 0, complete: true, maxSections },
    sections: [],
    headings: { count: 0, first: '', last: '' },
    cast: [],
    pacing: { median: 0, outliers: [], dialogueByThirds: [], units: [], unitMedian: 0, unitOutliers: [], rhythm: { sentenceMedian: 0, longSentences: [], dialogue: [], dialogueMedian: 0 } },
    voice: { person: [], tense: [], shifts: [], clear: { person: 0, tense: 0 } },
    names: [],
    repeats: [],
    figures: [],
    terms: [],
    timeline: { stamps: [], jumps: [] },
    rules: null,
    style: emptyStyle(),
    vocab: { proper: [], numbers: [] },
    usedNotes: false,
    failed: [],
  };
}

/**
 * What an Analysis depends on, as a short key: the text, the writer's enabled rules (their words), the notes' names and terms, and `maxSections`. Two calls with the
 * same key give the same Analysis, so a caller can keep the last few in a small cache and skip the work when a follow-up question arrives about the same text.
 */
export function analysisKey(opts) {
  const o = isPlain(opts) ? opts : {};
  const text = typeof o.text === 'string' ? o.text : '';
  const rules = (Array.isArray(o.project?.rules) ? o.project.rules : []).filter((r) => r && typeof r.text === 'string' && r.enabled !== false).map((r) => `${r.id ?? ''}:${r.text}`);
  const per = notesList(o.notes) ?? [];
  const notes = per.map((n) => (n && typeof n === 'object' ? `${n.by ?? ''}|${(Array.isArray(n.names) ? n.names : []).join(',')}|${(Array.isArray(n.terms) ? n.terms : []).join(',')}` : '')).join('\n');
  const limit = Number.isFinite(o.maxSections) && o.maxSections >= 1 ? Math.min(2000, Math.floor(o.maxSections)) : 120;
  return `${ANALYSIS_VERSION}:${text.length}:${fnv1a(text)}:${fnv1a(rules.join('\n'))}:${fnv1a(notes)}:${limit}`;
}

/**
 * @param {{ text: string, index?: object|null, notes?: object|null, project?: object|null, maxSections?: number }} o
 *   `index`: buildIndex(text) (its sections are reused when it is the index of this very text). `notes`: the reading notes, an array of (note|null) or { per }.
 *   `project`: only `project.rules` and what `scan` reads of it (the writer's rules) are used. `maxSections`: how many sections get the measures (the first ones).
 */
export function analyseText(opts) {
  const o = isPlain(opts) ? opts : {};
  const maxSections = Number.isFinite(o.maxSections) && o.maxSections >= 1 ? Math.min(2000, Math.floor(o.maxSections)) : 120;
  let src = typeof o.text === 'string' ? o.text : '';
  if (src.length > HARD_CAP_CHARS) src = src.slice(0, HARD_CAP_CHARS);
  if (!src.trim()) return emptyAnalysis(maxSections);

  const failed = [];
  const safe = (name, fn, fallback) => {
    try {
      return fn();
    } catch {
      failed.push(name);
      return fallback;
    }
  };

  const all = sectionsOf(src, o.index);
  const N = all.length;
  const M = Math.min(N, maxSections);
  const secs = all.slice(0, M);
  const coveredEnd = M ? secs[M - 1].end : 0;
  const covered = src.slice(0, coveredEnd);
  const totalWords = all.reduce((n, s) => n + s.words, 0);
  const notesPer = notesList(o.notes);

  // measures per section (the style module's counts, reused rather than re-derived)
  const per = secs.map((s) => {
    const p = safe('style', () => styleProfile(src.slice(s.start, s.end)), emptyStyle());
    const head = safe('headings', () => headingsIn(src.slice(s.start, s.end), s.start), { count: 0, first: false, titles: [], marks: [] });
    const clear = s.words >= MIN_VOICE_WORDS;
    return {
      i: s.i,
      start: s.start,
      end: s.end,
      words: s.words,
      sentences: p.sentences,
      avgSentence: p.sentence.mean,
      dialogueShare: Math.min(1, r3(p.dialogue.share + p.dialogue.cueShare)),
      person: clear ? p.pov.label : 'unclear',
      tense: clear ? p.tense.label : 'unclear',
      title: s.title,
      under: s.under,
      headings: head.count,
      headFirst: head.first,
      headTitles: head.titles,
      marks: head.marks,
    };
  });

  const style = safe('style', () => styleProfile(covered.length > STYLE_CAP_CHARS ? covered.slice(0, STYLE_CAP_CHARS) : covered), emptyStyle());
  const english = style.language?.readable !== false;
  const { toks, lowerCount } = safe('tokens', () => tokenise(covered, secs, NGRAM_TOKEN_CAP), { toks: [], lowerCount: new Map() });

  const units = safe('units', () => unitsOf(covered, secs, per.flatMap((s) => s.marks), covered.length), []);
  const pacing = safe('pacing', () => pacingOf(per, N, { dashes: (style.dialogue?.dashLines ?? 0) >= 5, units }), emptyAnalysis(maxSections).pacing);
  const voice = safe(
    'voice',
    () => ({
      person: runsOf(per.map((s) => s.person)),
      tense: runsOf(per.map((s) => s.tense)),
      shifts: [...shiftsOf('person', per.map((s) => s.person), PURE_PERSON), ...shiftsOf('tense', per.map((s) => s.tense), PURE_TENSE)].sort((a, b) => a.at - b.at).slice(0, 30),
      clear: { person: per.filter((s) => PURE_PERSON.has(s.person)).length, tense: per.filter((s) => PURE_TENSE.has(s.tense)).length },
    }),
    emptyAnalysis(maxSections).voice
  );

  const castPart = english && !isAllCaps(covered) ? safe('cast', () => castOf(covered, secs, lowerCount, notesPer), NO_CAST()) : NO_CAST();
  const repeats = safe('repeats', () => [...repeatedPhrases(covered, toks), ...openerTics(covered, secs)], []);
  const people = new Set(castPart.cast.filter((c) => c.kind === 'person').flatMap((c) => [c.name, ...c.aliases]).flatMap((x) => x.split(' ')).map((w) => w.toLowerCase()));
  const figures = english ? safe('figures', () => figuresOf(covered, secs, people), []) : [];
  const castNames = new Set([...castPart.cast.flatMap((c) => [c.name, ...c.aliases]), ...castPart.parts].map((x) => x.toLowerCase()));
  const terms = english ? safe('terms', () => termsOf(covered, secs, { signature: Array.isArray(style.signature) ? style.signature : [], notesPer, castNames, termNames: castPart.termNames }), []) : [];
  const timeline = safe('timeline', () => timelineOf(covered, secs), { stamps: [], jumps: [] });
  const rules = safe('rules', () => rulesOf(covered, secs, o.project), null);
  const numbers = safe('numbers', () => [...new Set(numbersIn(covered, { limit: 4000 }).map((n) => n.value))].sort((a, b) => a - b).slice(0, 2000), []);

  return {
    v: ANALYSIS_VERSION,
    words: totalWords,
    sectionCount: N,
    covered: { sections: M, of: N, words: secs.reduce((n, s) => n + s.words, 0), complete: M === N, maxSections },
    sections: per.map(({ i, words, sentences, avgSentence, dialogueShare, person, tense, title, start, end, under, headings }) => ({ i, words, sentences, avgSentence, dialogueShare, person, tense, title, start, end, under, headings })),
    headings: headingSummary(per),
    cast: castPart.cast,
    pacing,
    voice,
    names: castPart.names,
    repeats,
    figures,
    terms,
    timeline,
    rules,
    style,
    vocab: { proper: castPart.proper, numbers },
    usedNotes: Boolean(notesPer && notesPer.some((n) => n && (n.by === 'model' || n.by === 'text' || n.by === 'rules'))),
    failed,
  };
}
