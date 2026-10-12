import { STOPWORDS, clip, estimateTokens, fnv1a, splitParagraphs, splitSentences, words as wordsIn } from '../util/text.js';
import { AIError } from '../ai/openai-client.js';
import { isHeading, sectionText } from './sections.js';

/**
 * Reading notes: NIE reads a long text ONE SECTION AT A TIME with the model and keeps a short, grounded note per section, so that a model with a
 * window of a few thousand tokens can still know what every part of a 10,000-word text says (not just the five excerpts that fit in one prompt).
 *
 *  - A note is a gist (one plain sentence), the names and invented terms the section really contains, and a few words on how it is written.
 *    Names and terms are kept only if they occur in the section's own text, so a small model cannot invent a character into the notes.
 *  - Notes are cached by the section's content hash: editing a text re-reads only the sections that changed, and a stopped read resumes.
 *  - From the notes the model writes a 3 to 4 sentence overview of the whole.
 *  - Nothing here writes or edits the writer's text; notes are private working data derived from it, and a note made by rules says so (`by`).
 */

export const NOTES_VERSION = 1;

const SHORT_SECTION_WORDS = 40; // fewer words than this: there is nothing to summarise, the text is its own note
const MAX_SECTION_NOTES = 160; // cached notes kept per project (a text of 60 sections plus a couple of earlier versions of it)
const MAX_OVERVIEWS = 6;
const GIST_WORDS = 30;
const OVERVIEW_LIST_TOKENS = 1000;
const OVERVIEW_CHARS = 700;

const deepFreeze = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') deepFreeze(v);
  return Object.freeze(o);
};

/** Constrains the model's note to exactly this shape (llama.cpp turns it into a grammar, so a 3B model cannot ramble). */
export const NOTE_SCHEMA = deepFreeze({
  type: 'object',
  properties: {
    gist: { type: 'string', maxLength: 260 },
    names: { type: 'array', items: { type: 'string', maxLength: 48 }, maxItems: 6 },
    terms: { type: 'array', items: { type: 'string', maxLength: 48 }, maxItems: 4 },
    voice: { type: 'string', maxLength: 70 },
  },
  required: ['gist', 'names', 'terms', 'voice'],
  additionalProperties: false,
});

export const NOTE_SYSTEM =
  "You take private reading notes on ONE part of a writer's text, for yourself. Describe only what this part actually says. Use only words and names that appear in it. Never add ideas of your own, never write, continue or improve the story, never quote long stretches, never praise it. Reply as JSON with these fields: gist: one plain sentence of at most 25 words saying what happens or is explained in this part; names: up to 6 people, places, groups or named things that matter in this part, spelled exactly as the text spells them; terms: up to 4 invented or technical terms this part introduces or explains; voice: 3 to 6 words on how this part is written, for example 'dry, technical, explanatory' or 'tense, close, sensory'.";

/** The messages for one section. The fixed part comes first so llama.cpp can reuse its cache between sections. */
export function buildNoteMessages(sectionText, { i, total, under = '' } = {}) {
  const content = `Part ${i + 1} of ${total}${under ? ` (under "${clip(under, 50)}")` : ''}:\n"""\n${String(sectionText ?? '').trim()}\n"""\nWrite the notes.`;
  return [{ role: 'system', content: NOTE_SYSTEM }, { role: 'user', content }];
}

// ── reading the model's answer ───────────────────────────────────────────────

const squash = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'); // (a hyphen outside a class is literal, and "\-" is a syntax error with the u flag)

/** Take quotation marks off a string the model wrapped in them, unless they belong to speech inside it. */
function unquote(s) {
  const dbl = s.match(/^(["“`])([\s\S]*)(["”`])$/);
  if (dbl && !/["“”`]/.test(dbl[2])) return dbl[2].trim();
  const single = s.match(/^['‘]([^'‘’]*)['’]$/);
  return single ? single[1].trim() : s;
}

/** First `max` words (whitespace-separated) of an already squashed string; "…" only when it was cut mid-thought. */
function clipWords(s, max) {
  const toks = s.split(' ');
  if (toks.length <= max) return s;
  const cut = toks.slice(0, max).join(' ');
  return /[.!?…]["'”’)\]]*$/.test(cut) ? cut : `${cut.replace(/[\s,;:–—-]+$/, '')}…`;
}

/** Replies that are the model talking to NIE instead of taking a note. */
const REFUSAL = /^(?:i\s+(?:cannot|can['’]?t|can\s+not|am\s+(?:sorry|unable)|['’]m\s+(?:sorry|unable))|sorry\b|sure(?:[,.!:]|$)|certainly\b|of\s+course\b|here\s+(?:are|is)\b|note\s*:)|\bas\s+an\s+ai\b/i;

const unescapeJson = (v) => {
  try {
    return JSON.parse(`"${v}"`);
  } catch {
    return v.replace(/\\(.)/g, '$1');
  }
};

/** An answer that is not valid JSON (cut off at the token limit, or wrapped in chatter): pull the fields out one by one. */
function salvage(s) {
  const str = (key) => {
    const m = s.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)`, 'i'));
    return m ? unescapeJson(m[1]) : undefined;
  };
  const arr = (key) => {
    const m = s.match(new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*)`, 'i'));
    return m ? [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => unescapeJson(x[1])) : undefined;
  };
  const found = { gist: str('gist'), names: arr('names'), terms: arr('terms'), voice: str('voice') };
  return found.gist === undefined ? null : found;
}

function readObject(raw) {
  if (raw && typeof raw === 'object') return Array.isArray(raw) ? null : raw;
  const s = String(raw ?? '');
  const block = s.match(/\{[\s\S]*\}/);
  if (block) {
    try {
      const obj = JSON.parse(block[0]);
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj;
    } catch {
      /* fall through to the salvage below */
    }
  }
  return salvage(s);
}

/**
 * Is this name or term in the section's own text (case-insensitive, whole words, any run of spaces)? Returns it spelled the way the TEXT spells it,
 * or null. This is what keeps invented people out of the notes.
 */
function grounder(text) {
  return (candidate) => {
    const c = squash(candidate).replace(/^["“‘`]+|["”`,;:]+$/g, '').trim();
    if (c.length < 2 || c.length > 48) return null;
    const pattern = escapeRe(c).replace(/\s+/g, '\\s+').replace(/['’‘]/g, "['’‘]");
    const m = new RegExp(`(?<![\\p{L}\\p{N}])${pattern}(?![\\p{L}\\p{N}])`, 'iu').exec(text);
    return m ? squash(m[0]) : null;
  };
}

function groundedList(value, ground, max) {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[,;\n]/) : [];
  const out = [];
  const seen = new Set();
  for (const item of list) {
    if (typeof item !== 'string') continue;
    const hit = ground(item);
    if (!hit || seen.has(hit.toLowerCase())) continue;
    seen.add(hit.toLowerCase());
    out.push(hit);
    if (out.length >= max) break;
  }
  return out;
}

function cleanVoice(v) {
  const toks = unquote(squash(typeof v === 'string' ? v : '')).replace(/[.;,\s]+$/, '').split(' ').filter(Boolean).slice(0, 8);
  while (toks.length > 1 && toks.join(' ').length > 70) toks.pop();
  const s = toks.join(' ');
  return s ? s[0].toLowerCase() + s.slice(1) : '';
}

/**
 * Read the model's note. Tolerates text around the JSON and a cut-off answer; returns null when there is no usable gist.
 * @returns {{ gist: string, names: string[], terms: string[], voice: string, by: 'model' } | null}
 */
export function parseNote(raw, sectionText = '') {
  const obj = readObject(raw);
  if (!obj) return null;
  let gist = squash(unquote(squash(typeof obj.gist === 'string' ? obj.gist : '')));
  if (wordsIn(gist).length < 3 || REFUSAL.test(gist)) return null;
  gist = clipWords(gist, GIST_WORDS);
  const ground = grounder(String(sectionText ?? ''));
  return { gist, names: groundedList(obj.names, ground, 6), terms: groundedList(obj.terms, ground, 4), voice: cleanVoice(obj.voice), by: 'model' };
}

// ── the rule-based note (no model needed) ────────────────────────────────────

const NOT_NAMES = new Set('january february march april may june july august september october november december monday tuesday wednesday thursday friday saturday sunday year'.split(' '));
// words that open a sentence or a heading without being a name ("Suddenly Delton ran", "Part One")
const OPENERS = new Set('then now later yesterday today tomorrow tonight meanwhile finally perhaps maybe however still once after before during soon here there nobody everyone everybody someone somebody everything nothing something anything many most each every even only just also next last first second third another other both either neither though although since because until while whenever wherever suddenly instead otherwise together already never always often sometimes somehow almost really very quite rather'.split(' '));
const HEADING_WORDS = new Set('chapter part book section act scene prologue epilogue interlude appendix volume'.split(' '));
const TITLE_ABBREV = /\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|Mt|Capt|Col|Gen|Lt|Sgt)\.$/;
const CAP_RUN = /\p{Lu}[\p{L}'’-]*(?:[ \t]+\p{Lu}[\p{L}'’-]*)*/gu;

/** Does a capitalised word at `idx` start a sentence (or a line, or a piece of speech)? Then its capital letter proves nothing about it. */
function startsSentence(text, idx) {
  let k = idx - 1;
  while (k >= 0 && /[ \t"“‘(\[*_#>•-]/.test(text[k])) {
    if (/["“‘]/.test(text[k])) return true;
    k--;
  }
  if (k < 0 || text[k] === '\n' || text[k] === '\r') return true;
  if (/[.!?…]/.test(text[k])) return !TITLE_ABBREV.test(text.slice(Math.max(0, k - 5), k + 1));
  return false;
}

const bareWord = (w) => w.replace(/['’-]+$/, '').replace(/['’]s$/i, '');

/**
 * Capitalised word runs ("Lake Tegano", "Delton") that are probably names. A capitalised word at the start of a sentence counts only if the section
 * also has it capitalised in the middle of a sentence ("Then", "The" and "Nobody" are not names); months, days, "Year" and function words are not names.
 * The one exception is the first word of a run of two or more capitals ("Lake Tegano froze", "Corin Ashby watched"): two capitals in a row are a name
 * unless the first is a plain opener ("Suddenly Delton ran"), a function word or an adverb.
 */
function capitalisedNames(text, limit = 6) {
  const runs = [];
  for (const m of text.matchAll(CAP_RUN)) runs.push({ ws: m[0].split(/[ \t]+/).map(bareWord), initial: startsSentence(text, m.index) });
  const midSentence = new Set();
  for (const r of runs) r.ws.forEach((w, k) => (k > 0 || !r.initial) && midSentence.add(w.toLowerCase()));

  const counts = new Map();
  const bump = (parts) => {
    // function words at the edges of a run ("The Quill") are not part of the name
    while (parts.length && STOPWORDS.has(parts[0].toLowerCase())) parts.shift();
    while (parts.length && STOPWORDS.has(parts.at(-1).toLowerCase())) parts.pop();
    const name = parts.join(' ');
    if (name.length < 2) return;
    const key = name.toLowerCase();
    const seen = counts.get(key);
    if (seen) seen.n++;
    else counts.set(key, { name, n: 1, at: counts.size });
  };
  const commonOpener = (w) => STOPWORDS.has(w) || OPENERS.has(w) || (w.length > 4 && w.endsWith('ly'));
  for (const r of runs) {
    const first = r.ws[0].toLowerCase();
    if (r.initial && HEADING_WORDS.has(first)) continue;
    const keepFirst = !r.initial || midSentence.has(first) || (r.ws.length > 1 && !commonOpener(first));
    const ws = keepFirst ? r.ws : r.ws.slice(1);
    let piece = [];
    for (const w of ws) {
      if (NOT_NAMES.has(w.toLowerCase()) || w.length < 2 || /^I['’]/.test(w)) {
        bump(piece);
        piece = [];
      } else piece.push(w);
    }
    bump(piece);
  }
  const ranked = [...counts.values()].sort((a, b) => b.n - a.n || a.at - b.at);
  const out = [];
  for (const { name } of ranked) {
    const low = ` ${name.toLowerCase()} `;
    if (out.some((o) => ` ${o.toLowerCase()} `.includes(low))) continue; // "Tegano" when "Lake Tegano" is already listed
    out.push(name);
    if (out.length >= limit) break;
  }
  return out;
}

/** The first sentence of the section's own text (not its heading), cut to 30 words. */
function firstSentenceGist(text, section) {
  const paras = splitParagraphs(text).map((p) => p.text);
  while (paras.length > 1 && isHeading(paras[0])) paras.shift(); // a heading says what the section is called, not what it says
  const lead = (paras[0] ?? '').replace(/^(?:[#>*•–—-]+\s*|\d{1,3}[.)]\s+)+/, '');
  const sentence = splitSentences(lead)[0]?.text ?? lead;
  return clipWords(squash(sentence) || squash(section?.title), GIST_WORDS);
}

/**
 * A note made without the model: the section's first sentence and the names in it. It is a pointer, not a reading, and is marked `by: 'rules'` so NIE
 * never claims to have understood a section it only skimmed. Deterministic and fast.
 */
export function rulesNote(sectionText, section = {}) {
  const text = String(sectionText ?? '');
  return { gist: firstSentenceGist(text, section), names: capitalisedNames(text), terms: [], voice: '', by: 'rules' };
}

// ── the pass over a whole text ───────────────────────────────────────────────

export const sectionKey = (section) => `${NOTES_VERSION}:${section.hash}`;

const abortError = () => new AIError('Reading was stopped.', { kind: 'abort' });
const defaultNow = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const average = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

/**
 * Read a text section by section with the model, keeping a note for each.
 *
 * Sections already in the cache are not asked again (their hash is their identity), which makes a stopped or failed read resumable and an edited text
 * cheap. Sections under 40 words are their own note. When the model cannot answer (or answers nonsense three times running) the rest are filled with
 * rule-based notes and `failed` says so: those sections were NOT read, and `complete` stays false. An abort is rethrown; whatever was cached stays.
 *
 * `total` is how many sections the text has; `notes` covers the first `maxSections` of them (and `tooLong` says there were more).
 * @returns {Promise<{ notes: object[], total: number, modelRead: number, complete: boolean, failed: boolean, tooLong: boolean, stoppedEarly: false, reasons: string[], msPerSection: number }>}
 */
export async function readThrough({ engine, index, cache = projectNotesCache({}), signal, onProgress, maxSections = 60, coldMs = 150000, warmMs = 90000, maxFailuresInARow = 3, now = defaultNow } = {}) {
  const all = index?.sections ?? [];
  const text = index?.text ?? '';
  const sections = all.slice(0, maxSections);
  const n = sections.length;
  const tooLong = all.length > maxSections;
  const keys = sections.map(sectionKey);
  const wordCounts = sections.map((s) => s.words ?? wordsIn(sectionText(text, s)).length);
  // touching every key up front also keeps this text's notes safe from being pruned while new ones are added
  const earlier = keys.map((key) => cache.get(key) ?? null);
  // how many sections after k still need the model (for the time left)
  const ahead = new Array(n).fill(0);
  for (let k = n - 2; k >= 0; k--) ahead[k] = ahead[k + 1] + (!earlier[k + 1] && wordCounts[k + 1] >= SHORT_SECTION_WORDS ? 1 : 0);

  const notes = new Array(n);
  const reasons = [];
  const modelMs = []; // how long each good model call took
  let modelRead = 0;
  let cached = 0;
  let failStreak = 0;
  let failed = false;
  let asked = 0;
  const why = (r) => {
    if (!reasons.includes(r)) reasons.push(r);
  };

  for (let k = 0; k < n; k++) {
    if (signal?.aborted) throw abortError();
    const s = sections[k];
    const raw = sectionText(text, s);
    let note = earlier[k] ?? cache.get(keys[k]);
    let ms = 0;
    if (note) {
      cached++;
      if (note.by === 'model') modelRead++;
    } else if (wordCounts[k] < SHORT_SECTION_WORDS) {
      note = { ...rulesNote(raw, s), by: 'text' };
    } else if (failed) {
      note = rulesNote(raw, s);
    } else {
      const timeoutMs = asked === 0 ? coldMs : warmMs; // the first call may have to load the model
      asked++;
      const t0 = now();
      let res = null;
      let thrown = null;
      try {
        res = await engine.chat(buildNoteMessages(raw, { i: k, total: n, under: s.under }), { purpose: 'notes', stream: false, maxTokens: 140, temperature: 0, json: NOTE_SCHEMA, timeoutMs, signal });
      } catch (err) {
        if (err?.kind === 'abort') throw err;
        if (signal?.aborted) throw abortError();
        thrown = err;
      }
      ms = Math.max(0, now() - t0);
      const good = res?.text != null ? parseNote(res.text, raw) : null;
      if (good) {
        cache.set(keys[k], good);
        note = good;
        modelRead++;
        modelMs.push(ms);
        failStreak = 0;
      } else {
        note = rulesNote(raw, s);
        why(res?.text != null ? 'unusable' : (res?.error?.kind ?? thrown?.kind) === 'timeout' ? 'timeout' : 'no-model');
        if (++failStreak >= maxFailuresInARow) failed = true;
      }
    }
    notes[k] = note;
    if (onProgress) {
      const etaMs = modelMs.length ? Math.round(average(modelMs) * (failed ? 0 : ahead[k])) : null;
      try {
        const r = onProgress({ done: k + 1, total: n, modelRead, cached, etaMs, ms });
        if (r && typeof r.then === 'function') r.then(undefined, () => {});
      } catch {
        /* a progress display must never break the reading */
      }
    }
  }

  const complete = !tooLong && notes.every((x) => x.by === 'model' || x.by === 'text');
  return { notes, total: all.length, modelRead, complete, failed, tooLong, stoppedEarly: false, reasons, msPerSection: Math.round(average(modelMs)) };
}

// ── the overview of the whole ────────────────────────────────────────────────

export const OVERVIEW_SYSTEM =
  "You write a short overview of a writer's text from your own private reading notes on its parts. Use only what the notes say. Never add names, ideas or facts of your own, never write, continue or improve the story, never quote it, never praise it. Reply in plain sentences only: no lists, no headings.";

const OVERVIEW_ASK =
  'In 3 or 4 plain sentences say what this text is as a whole: what it is about, who or what the main named people and things are and what each one is to it, and how it is organised. Use only what the notes say. Do not retell the text, quote it, write any story text, or praise it.';

/** Keep an even spread of the lines (the first and the last always) until they fit the budget. */
function thin(lines, budgetTokens) {
  let kept = lines;
  for (;;) {
    const tokens = estimateTokens(kept.join('\n'));
    if (kept.length <= 2 || tokens <= budgetTokens) return kept;
    const target = Math.max(2, Math.floor(kept.length * Math.min(0.9, budgetTokens / tokens)));
    const from = kept;
    kept = Array.from({ length: target }, (_, j) => from[Math.round((j * (from.length - 1)) / (target - 1))]);
  }
}

/**
 * The messages that ask for an overview of the whole text from the per-section notes. A long list of notes is thinned evenly (and the prompt says so)
 * to fit the model's window.
 */
export function overviewMessages(notes, { words: wordTotal, sections: sectionTotal, listTokens = OVERVIEW_LIST_TOKENS } = {}) {
  const lines = (notes ?? []).map((note, k) => [k, squash(note?.gist)]).filter(([, g]) => g).map(([k, g]) => `Part ${k + 1}: ${g}`);
  const shown = thin(lines, listTokens);
  const parts = sectionTotal ?? (notes ?? []).length;
  const size = wordTotal ? `A writer's text of about ${Math.round(wordTotal).toLocaleString('en-US')} words, in ${parts} parts.` : `A writer's text in ${parts} parts.`;
  const lead = `${size} My notes on ${shown.length < lines.length ? `${shown.length} of the ${lines.length} parts (spread evenly through the text)` : 'each part'}:`;
  return [{ role: 'system', content: OVERVIEW_SYSTEM }, { role: 'user', content: `${lead}\n${shown.join('\n')}\n\n${OVERVIEW_ASK}` }];
}

/** Cut at the last full sentence (never mid-sentence, which a reply stopped by its token limit would be). */
function tidyEnd(s, max) {
  const cut = s.length > max;
  if (cut) s = s.slice(0, max);
  if (!cut && /[.!?…]["'”’)\]]*$/.test(s)) return s;
  let last = -1;
  for (const m of s.matchAll(/[.!?…]["'”’)\]]*(?=\s|$)/g)) if (!TITLE_ABBREV.test(s.slice(Math.max(0, m.index - 5), m.index + 1))) last = m.index + m[0].length;
  if (last > 0 && wordsIn(s.slice(0, last)).length >= 15) return s.slice(0, last).trim();
  return cut ? `${s.replace(/\s+\S*$/, '').replace(/[\s,;:–—-]+$/, '')}…` : s;
}

function cleanOverview(raw) {
  const lines = String(raw ?? '')
    .replace(/```\w*/g, ' ')
    .split(/\r?\n/)
    .map((l) => {
      const marker = /^\s*(?:#{1,6}\s+|[-*•+]\s+|\d{1,2}[.)]\s+|>\s+)/.test(l);
      let t = l.replace(/^\s*(?:#{1,6}\s+|[-*•+]\s+|\d{1,2}[.)]\s+|>\s+)/, '').replace(/(\*\*|__)(.*?)\1/g, '$2').trim();
      if (/^\s*#{1,6}\s/.test(l) && wordsIn(t).length < 8) return ''; // a heading, not a sentence
      if (marker && t && !/[.!?…:]["'”’)]*$/.test(t)) t += '.';
      return t;
    })
    .filter(Boolean);
  const s = unquote(squash(lines.join(' ')).replace(/^(?:overview|summary)\s*:\s*/i, ''));
  return tidyEnd(s, OVERVIEW_CHARS);
}

/**
 * The overview of the whole text, from the notes. Cached by the notes themselves, so unchanged notes never cost another call. On any failure
 * (no model, timeout, a reply that is not an overview) the text is '' and `by` is 'rules': the caller then shows no overview rather than a made-up one.
 * @returns {Promise<{ text: string, by: 'model' | 'rules' }>}
 */
export async function makeOverview({ engine, notes, cache, signal, words: wordTotal, sections: sectionTotal } = {}) {
  const gists = (notes ?? []).map((x) => squash(x?.gist)).filter(Boolean);
  if (!gists.length) return { text: '', by: 'rules' };
  const key = `ov:${NOTES_VERSION}:${fnv1a(gists.join('\n'))}`;
  const hit = cache?.getOverview?.(key);
  if (typeof hit === 'string' && hit) return { text: hit, by: 'model' };
  if (signal?.aborted) throw abortError();
  try {
    const res = await engine.chat(overviewMessages(notes, { words: wordTotal, sections: sectionTotal }), { purpose: 'overview', stream: false, maxTokens: 170, temperature: 0.3, timeoutMs: 90000, signal });
    if (res?.text == null) return { text: '', by: 'rules' };
    const text = cleanOverview(res.text);
    if (wordsIn(text).length < 15 || REFUSAL.test(text) || /^[{[]/.test(text)) return { text: '', by: 'rules' };
    cache?.setOverview?.(key, text);
    return { text, by: 'model' };
  } catch (err) {
    if (err?.kind === 'abort') throw err;
    if (signal?.aborted) throw abortError();
    return { text: '', by: 'rules' };
  }
}

// ── storage: the notes belong to the project ─────────────────────────────────

export const emptyReadingNotes = () => ({ v: 1, sections: {}, overviews: {} });

const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const HOSTILE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const okKey = (k) => typeof k === 'string' && /^[\w:.-]{1,64}$/.test(k) && !HOSTILE_KEYS.has(k);
const stamp = (t) => (Number.isFinite(t) && t >= 0 ? t : 0);

/** A note as it is stored: only the five fields, every string and list capped. Rule-made notes are never stored (they are not readings). */
function storedNote(n) {
  if (!isPlain(n) || typeof n.gist !== 'string' || (n.by !== undefined && n.by !== 'model')) return null;
  const gist = clip(squash(n.gist), 300);
  if (!gist) return null;
  const list = (v, max) => (Array.isArray(v) ? v : []).filter((x) => typeof x === 'string').map((x) => squash(x).slice(0, 60)).filter(Boolean).slice(0, max);
  return { gist, names: list(n.names, 6), terms: list(n.terms, 4), voice: squash(typeof n.voice === 'string' ? n.voice : '').slice(0, 80), by: 'model' };
}

/** Drop the least recently used entries beyond `limit` (equal times: the one stored first goes first). */
function prune(map, limit) {
  const keys = Object.keys(map);
  if (keys.length <= limit) return;
  keys.sort((a, b) => map[a].t - map[b].t);
  for (const k of keys.slice(0, keys.length - limit)) delete map[k];
}

/**
 * A clean { v, sections, overviews } from whatever was in storage, for the project store's migrate(): only well-shaped plain objects survive, strings
 * and lists are capped, hostile keys are dropped, the size limits are enforced. Never throws.
 */
export function sanitizeReadingNotes(raw) {
  const out = emptyReadingNotes();
  try {
    if (!isPlain(raw)) return out;
    if (isPlain(raw.sections)) {
      for (const key of Object.keys(raw.sections)) {
        const e = raw.sections[key];
        const n = okKey(key) && isPlain(e) ? storedNote(e.n) : null;
        if (n) out.sections[key] = { n, t: stamp(e.t) };
      }
    }
    if (isPlain(raw.overviews)) {
      for (const key of Object.keys(raw.overviews)) {
        const e = raw.overviews[key];
        const text = okKey(key) && isPlain(e) && typeof e.text === 'string' ? clip(squash(e.text), 800) : '';
        if (text) out.overviews[key] = { text, t: stamp(e.t) };
      }
    }
    prune(out.sections, MAX_SECTION_NOTES);
    prune(out.overviews, MAX_OVERVIEWS);
    return out;
  } catch {
    return emptyReadingNotes();
  }
}

/**
 * The project's cache of reading notes, kept at `project.readingNotes` (created when missing) so it is saved and deleted with the project and never
 * shared with another one. Reading an entry refreshes its time; adding past the limits drops the least recently used. `size()` counts section notes.
 */
export function projectNotesCache(project, { now = Date.now } = {}) {
  const holder = project && typeof project === 'object' ? project : {};
  let last = 0;
  const tick = () => (last = Math.max(now(), last + 1)); // strictly increasing, so "least recently used" is never a tie
  const store = () => {
    const rn = holder.readingNotes;
    if (!(isPlain(rn) && isPlain(rn.sections) && isPlain(rn.overviews))) holder.readingNotes = sanitizeReadingNotes(rn);
    else rn.v = 1;
    return holder.readingNotes;
  };
  store();
  return {
    get(key) {
      const { sections } = store();
      if (!okKey(key) || !Object.hasOwn(sections, key)) return null;
      const n = storedNote(sections[key]?.n);
      if (!n) return null;
      sections[key].t = tick();
      return n;
    },
    set(key, note) {
      const n = okKey(key) ? storedNote(note) : null;
      if (!n) return false;
      const { sections } = store();
      sections[key] = { n, t: tick() };
      prune(sections, MAX_SECTION_NOTES);
      return true;
    },
    getOverview(key) {
      const { overviews } = store();
      if (!okKey(key) || !Object.hasOwn(overviews, key) || typeof overviews[key]?.text !== 'string' || !overviews[key].text) return null;
      overviews[key].t = tick();
      return overviews[key].text;
    },
    setOverview(key, text) {
      const t = typeof text === 'string' ? clip(squash(text), 800) : '';
      if (!okKey(key) || !t) return false;
      const { overviews } = store();
      overviews[key] = { text: t, t: tick() };
      prune(overviews, MAX_OVERVIEWS);
      return true;
    },
    size: () => Object.keys(store().sections).length,
  };
}

/**
 * About how long reading will take, so the writer is told before it starts. `sections` is a count or the sections themselves (short ones cost nothing).
 * The default is the slow end for a 3B model on a laptop CPU; a finished read measures its own `msPerSection`.
 */
export function estimateReadMs({ sections, cachedCount = 0, msPerSection = 25000, overviewMs = 25000 } = {}) {
  const count = Array.isArray(sections) ? sections.filter((s) => (s?.words ?? SHORT_SECTION_WORDS) >= SHORT_SECTION_WORDS).length : Math.max(0, Number(sections) || 0);
  return Math.max(0, count - Math.max(0, cachedCount)) * msPerSection + overviewMs;
}
