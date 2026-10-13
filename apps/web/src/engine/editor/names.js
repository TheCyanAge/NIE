/**
 * Capitalised words and runs of them: the one place the editor instruments (cast, name spellings, grounding) decide what "looks like a name".
 *
 * A capital letter proves nothing at the start of a sentence ("Then", "Suddenly", "The"), so a run is reported with `initial` (it starts a sentence, a line or a
 * piece of speech) and the callers decide what to do with it. Everything here is plain regex and word lists: no model, no state, same text -> same runs.
 */

export const MONTHS_DAYS = new Set('january february march april may june july august september october november december monday tuesday wednesday thursday friday saturday sunday year'.split(' '));
export const HEADING_WORDS = new Set('chapter part book section act scene prologue epilogue interlude appendix volume page step'.split(' '));
export const TITLES = new Set('mr mrs ms dr miss sir lady lord madam mx prof'.split(' '));

/** Words that open a sentence or a heading without being a name ("Suddenly Delton ran", "Nobody", "Perhaps"). */
export const OPENERS = new Set(
  ('then now later yesterday today tomorrow tonight meanwhile finally perhaps maybe however still once after before during soon here there nobody everyone everybody someone somebody ' +
    'everything nothing something anything many most each every even only just also next last first second third another other both either neither though although since because until ' +
    'while whenever wherever suddenly instead otherwise together already never always often sometimes somehow almost really very quite rather yes no oh ah well so and but or if when ' +
    'what who whom whose why how which this that these those some any all one two three four five six seven eight nine ten').split(' ')
);

/**
 * Ordinary English words that open a sentence of a reply ("Consider Linnet's...", "Pacing slows..."): a capital on one of these is not evidence of a name.
 * Used only to decide whether the first word of a capitalised run at the start of a sentence belongs to the run.
 */
export const ORDINARY_OPENERS = new Set(
  ('consider think notice try ask look imagine suppose remember use keep make let give start begin focus explore avoid read write tell show see say note mention name pick choose ' +
    'compare check find follow add drop cut trim skip hold take put set turn move push pull open close leave stay come go bring send call help need want like love hate wish hope ' +
    'wonder maybe sometimes often usually generally overall instead rather another others another readers writers characters stories scenes chapters sections text draft ' +
    'pacing voice tone style tense person point plot theme setting dialogue narration structure length rhythm opening ending middle beginning section chapter scene part ' +
    'your you we our my it its they their he she his her him them there here where when while whether why how what which who whom whose that this these those such some many ' +
    'most more less few several both either neither each every any all none nothing something anything everything one two three four five six seven eight nine ten ' +
    'also still yet even only just about above after again against along among around before behind below beside between beyond during except inside into near ' +
    'onto outside over past since through throughout toward towards under until upon within without according because besides despite however meanwhile moreover ' +
    'nevertheless otherwise therefore thus then now today tomorrow yesterday later earlier first second third next last finally ' +
    'a an the is are was were be been being am do does did done have has had having will would shall should can could may might must ' +
    'if or and but nor so for as at by in of on to with from up out off down no not yes ok okay oh ah well right sure good great nice better best worse worst ' +
    'sometimes perhaps possibly probably certainly clearly simply really very quite rather too enough ' +
    'questions question ideas idea options option angles angle details detail names name facts fact numbers number words word lines line paragraphs paragraph ' +
    'notes note things thing parts part pieces piece bits bit places place people person time times way ways kind kinds sort sorts type types').split(' ')
);

const ACRONYM = /^[\p{Lu}][\p{Lu}\p{N}]+$/u;

/** Does a capitalised word at `idx` start a sentence, a line or a piece of speech? Then its capital letter proves nothing about it. */
export function startsSentence(text, idx) {
  let k = idx - 1;
  while (k >= 0 && /[ \t"“‘(\[*_#>•-]/.test(text[k])) {
    if (/["“‘]/.test(text[k])) return true;
    k--;
  }
  if (k < 0 || text[k] === '\n' || text[k] === '\r') return true;
  if (text[k] === ':') return true;
  if (/[.!?…]/.test(text[k])) return !/\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|Mt|Capt|Col|Gen|Lt|Sgt)\.$/.test(text.slice(Math.max(0, k - 5), k + 1));
  return false;
}

// a capital that does not follow a letter, then the rest of the word; further capitalised words joined by blanks (never across a line break)
const CAP_RUN = /(?<![\p{L}\p{M}\p{N}'’-])\p{Lu}[\p{L}\p{M}'’-]*(?:[ \t]+\p{Lu}[\p{L}\p{M}'’-]*)*/gu;

/** "Dessa's" -> "Dessa"; "Greyfall-bound" -> "Greyfall"; trailing hyphens and apostrophes dropped. */
export function bareWord(w) {
  let s = String(w).replace(/['’-]+$/, '').replace(/['’]s$/i, '');
  const hy = s.search(/-\p{Ll}/u);
  if (hy > 0) s = s.slice(0, hy);
  return s;
}

/**
 * Runs of capitalised words in `text`: [{ parts, start, end, initial, possessive }].
 * `parts` are bare words (no possessive, no hyphen suffix), acronyms ("HWC") and single letters break a run, `initial` says the run starts a sentence, `possessive`
 * says the run is followed by 's (a strong sign of a name, even at the start of a sentence). `start`/`end` index `text`.
 */
export function capitalisedRuns(text, { limit = 400000 } = {}) {
  const src = String(text ?? '');
  const out = [];
  for (const m of src.matchAll(CAP_RUN)) {
    if (out.length >= limit) break;
    const raw = m[0].split(/[ \t]+/);
    let offset = 0;
    let piece = [];
    let pieceStart = 0;
    const flush = () => {
      if (piece.length) {
        const first = m.index + pieceStart;
        const last = piece.at(-1);
        const end = m.index + last.at + last.raw.length;
        out.push({
          parts: piece.map((p) => p.bare),
          start: first,
          end,
          initial: startsSentence(src, first),
          possessive: /^['’]s\b/i.test(src.slice(end, end + 3)) || /['’]s$/i.test(last.raw),
        });
      }
      piece = [];
    };
    for (const r of raw) {
      const at = m[0].indexOf(r, offset);
      offset = at + r.length;
      const bare = bareWord(r);
      if (bare.length < 2 || ACRONYM.test(bare)) {
        flush();
        continue;
      }
      if (!piece.length) pieceStart = at;
      piece.push({ bare, raw: r, at });
    }
    flush();
  }
  return out;
}

/** A word that can never be (part of) a name: a month, a day, "Year", a heading word, a number-like token. */
export const neverName = (w) => {
  const lo = w.toLowerCase();
  return MONTHS_DAYS.has(lo) || HEADING_WORDS.has(lo) || /\d/.test(w);
};
