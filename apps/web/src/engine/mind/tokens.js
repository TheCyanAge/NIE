import { STOPWORDS, WORD_RE, stem } from '../util/text.js';

/**
 * Words as the mind compares them: lower-case content words, stemmed (the same crude stemmer the rest of NIE uses), with possessives and contractions
 * handled ("Mara's" is "mara", "don't" is nothing), irregular forms folded onto their base ("sank" is "sink", "children" is "child") and hyphenated words
 * kept whole AND in their parts ("one-eyed" is found by "one-eyed" and by "eyed"), because a name or a verb that cannot be found when it is written another way
 * is a memory that forgets people.
 *
 * ISOLATION: the only state in this file is a memo of `text -> tokens`. It is keyed by the EXACT text (not a hash, so two different texts can never
 * share an entry), the value is a pure function of that text, and it is bounded twice: by entry count (MEMO_MAX) and by the total characters its keys
 * hold (MEMO_CHARS), and it is emptied when either is reached. A text longer than MEMO_KEY is never kept at all. A project's text therefore can never
 * change what another project gets back, a hostile project cannot make it grow, and the memo only saves re-doing the same work (recall runs on every message).
 * What it hands out cannot be changed by a caller (the list is frozen and the set ignores add / delete / clear), so one caller can never alter what another gets.
 * `memoByText` makes more memos of the same kind (exact text in, frozen answer out, bounded, all emptied by `clearTokenMemo`); recall.js uses one to find who is who in a passage.
 */

const MEMO_MAX = 6000;
const MEMO_CHARS = 1_500_000;
const MEMO_KEY = 800; // longer texts are tokenised each time (they are not statements or passages: only a hostile or odd project holds them)
const LOOK_AT = 4000; // characters of a text that are tokenised
const memo = new Map();
let memoChars = 0;
const memos = []; // how to empty each of the other memos made by `memoByText`

/** Irregular forms, folded onto the form the stemmer then handles ("sank" and "sunk" are "sink"; "hidden" is "hide"). Lower case. */
const IRREGULAR = new Map(
  Object.entries({
    sank: 'sink', sunk: 'sink', sunken: 'sink', ran: 'run', hid: 'hide', hidden: 'hide', wrote: 'write', written: 'write', left: 'leave', went: 'go', gone: 'go',
    took: 'take', taken: 'take', gave: 'give', given: 'give', saw: 'see', seen: 'see', knew: 'know', known: 'know', thought: 'think', brought: 'bring', bought: 'buy',
    caught: 'catch', taught: 'teach', fought: 'fight', lost: 'lose', found: 'find', told: 'tell', felt: 'feel', kept: 'keep', held: 'hold', stood: 'stand',
    began: 'begin', begun: 'begin', broke: 'break', broken: 'break', chose: 'choose', chosen: 'choose', drove: 'drive', driven: 'drive', fell: 'fall', fallen: 'fall',
    flew: 'fly', flown: 'fly', forgot: 'forget', forgotten: 'forget', got: 'get', gotten: 'get', grew: 'grow', grown: 'grow', heard: 'hear', led: 'lead',
    met: 'meet', paid: 'pay', risen: 'rise', sent: 'send', shook: 'shake', shaken: 'shake', sold: 'sell', spoke: 'speak', spoken: 'speak',
    stole: 'steal', stolen: 'steal', swam: 'swim', swum: 'swim', threw: 'throw', thrown: 'throw', woke: 'wake', woken: 'wake', wore: 'wear', worn: 'wear',
    built: 'build', dug: 'dig', drawn: 'draw', drank: 'drink', drunk: 'drink', ate: 'eat', eaten: 'eat', fed: 'feed', 
    made: 'make', meant: 'mean', rang: 'ring', sang: 'sing', sat: 'sit', slept: 'sleep', spent: 'spend', struck: 'strike',
    swore: 'swear', tore: 'tear', torn: 'tear', understood: 'understand', wept: 'weep', done: 'do', died: 'die', dying: 'die', lying: 'lie', lied: 'lie', tying: 'tie',
    children: 'child', men: 'man', women: 'woman', feet: 'foot', teeth: 'tooth', mice: 'mouse', wives: 'wife', knives: 'knife', wolves: 'wolf', thieves: 'thief',
    ladies: 'lady', babies: 'baby', stories: 'story', cities: 'city', mysteries: 'mystery', secrets: 'secret',
  })
);

/** The word without edge punctuation, possessive 's removed; '' for a contraction tail (n't, 'll, 're, 've, 'm, 'd), which carries no content. */
function core(raw) {
  let w = raw.replace(/^['’-]+|['’-]+$/g, '');
  const poss = /^(.+?)['’]s$/.exec(w);
  if (poss) w = poss[1];
  else if (/['’](?:t|ll|re|ve|m|d)$/.test(w)) return '';
  return w;
}

/** One lower-case word to its stem; '' when it carries no content (a stopword, one letter). */
function oneStem(w) {
  if (w.length < 2 || STOPWORDS.has(w)) return '';
  const base = IRREGULAR.get(w) ?? w;
  if (STOPWORDS.has(base)) return '';
  return stem(base);
}

/** Stems of the content words of `text`, in order, repeats kept. A hyphenated word gives the whole and each part. Looks at the first 4,000 characters only. Not memoised. */
export function tokenize(text) {
  const s = typeof text === 'string' ? text.slice(0, LOOK_AT) : '';
  const out = [];
  for (const raw of s.toLowerCase().match(WORD_RE) ?? []) {
    const w = core(raw);
    const whole = oneStem(w);
    if (whole) out.push(whole);
    if (w.includes('-')) for (const part of w.split('-')) if (part.length > 1) { const p = oneStem(part); if (p && p !== whole) out.push(p); }
  }
  return out;
}

/** A Set that cannot be changed by a caller (add, delete and clear do nothing), for what the memo hands out to everyone. */
function lockedSet(items) {
  const set = new Set(items);
  const noop = function () {
    return this;
  };
  Object.defineProperties(set, { add: { value: noop }, delete: { value: () => false }, clear: { value: () => {} } });
  return Object.freeze(set);
}

/** `{ list, set, neg }` for a text (memoised, see above). Nothing in it can be changed. */
export function tokensOf(text) {
  if (typeof text !== 'string') return EMPTY;
  let hit = memo.get(text);
  if (!hit) {
    const list = Object.freeze(tokenize(text)); // (shared by every caller: frozen, so no caller can change what another one gets)
    hit = Object.freeze({ list, set: lockedSet(list), neg: NEGATION.test(text.length > LOOK_AT ? text.slice(0, LOOK_AT) : text) });
    if (text.length <= MEMO_KEY) {
      if (memo.size >= MEMO_MAX || memoChars + text.length > MEMO_CHARS) {
        memo.clear();
        memoChars = 0;
      }
      memo.set(text, hit);
      memoChars += text.length;
    }
  }
  return hit;
}
/** "not", "never", "no longer", "can't": negation words are stopwords, so a comparison of content words cannot see them; `neg` lets a caller tell "she is X" from "she is not X". */
const NEGATION = /\b(?:not|no|never|nobody|none|nothing|neither|nor|cannot|without)\b|n['’]t\b/i;
const EMPTY = Object.freeze({ list: Object.freeze([]), set: lockedSet([]), neg: false });

/**
 * A function of one text, remembered by the EXACT text (never by a hash, so two different texts cannot share an answer), for work that is the same every time a text comes round
 * (finding who is who in a passage). Bounded twice (entries, and the characters the keys hold) and emptied when either is reached; a text longer than MEMO_KEY is never kept.
 * What `fn` returns must not be changed by a caller (it is frozen here). Nothing it keeps can reach another project: the answer is a pure function of the text.
 */
export function memoByText(fn, { max = 4000, chars = 1_000_000 } = {}) {
  const seen = new Map();
  let held = 0;
  memos.push(() => {
    seen.clear();
    held = 0;
  });
  return (text) => {
    if (typeof text !== 'string') return fn('');
    let hit = seen.get(text);
    if (hit === undefined) {
      hit = fn(text);
      if (hit && typeof hit === 'object') Object.freeze(hit);
      if (text.length <= MEMO_KEY) {
        if (seen.size >= max || held + text.length > chars) {
          seen.clear();
          held = 0;
        }
        seen.set(text, hit);
        held += text.length;
      }
    }
    return hit;
  };
}

/** Empty the memo (a test hook; nothing else needs it). */
export const clearTokenMemo = () => {
  memo.clear();
  memoChars = 0;
  for (const clear of memos) clear();
};

/** How many texts the memo holds now (a test hook: the memo must stay bounded). */
export const tokenMemoSize = () => ({ entries: memo.size, chars: memoChars });

const NUMBER_WORDS = new Set(
  ('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety ' +
    'hundred thousand million billion first second third fourth fifth sixth seventh eighth ninth tenth').split(' ')
);
/** A stem that is a number ("47", "1960s", "eleven", "third"): a changed number makes a different fact, and a question about "how many" looks for one. */
export const isNumberish = (t) => NUMBER_WORDS.has(t) || /^\d/.test(t);

/** Lower-case letters and digits only, one space between words: the form in which two texts are "the same text". */
export function normText(text) {
  return typeof text === 'string' ? text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim() : '';
}

/** Stems of capitalised words that do not begin a sentence: probably names, the best way to find a passage. */
export function nameStems(text) {
  const s = typeof text === 'string' ? text.slice(0, 2000) : '';
  const out = new Set();
  for (const m of s.matchAll(/(?<![\p{L}\p{N}])\p{Lu}[\p{L}'’-]{2,}/gu)) {
    const before = s.slice(0, m.index).trimEnd();
    if (!before || /[.!?:]$/.test(before)) continue;
    for (const t of tokenize(m[0])) out.add(t);
  }
  return out;
}
