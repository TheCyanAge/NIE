import { fnv1a, splitParagraphs, splitSentences, words } from '../util/text.js';

/**
 * Cut a text of any length into sections the offline model can read one at a time.
 *
 * Sections follow the writer's own structure: a heading (Chapter 3, Part II, "# Title", a row of asterisks) starts a new section, otherwise paragraphs
 * are packed up to about `target` characters and never split mid-paragraph unless a single paragraph is longer than `max`, in which case it is split at
 * sentence ends. Nothing is rewritten or dropped: every character of the text lies in exactly one section (`start`/`end` index the writer's own text), so
 * "which part did NIE read?" always has an exact answer.
 *
 * ~2,200 characters is about 600 tokens: small enough that several sections plus NIE's own instructions fit in the offline model's window, large enough
 * to keep a scene together.
 */

export const SECTION_TARGET_CHARS = 2200;
export const SECTION_MAX_CHARS = 3400;
export const SECTION_MIN_CHARS = 500;

const HEADING = /^\s*(?:#{1,6}\s+\S[^\n]{0,80}|(?:chapter|part|book|section|act|scene|prologue|epilogue|interlude|appendix)\b[^\n]{0,70}|[IVXLC]{1,7}\.?|\d{1,3}\.?|\*{3,}|[-–—_=~]{3,}|\* \* \*)\s*$/i;

/** A heading is a short line with no sentence in it. */
export function isHeading(paragraph) {
  const t = String(paragraph).trim();
  return t.length > 0 && t.length <= 90 && !t.includes('\n') && HEADING.test(t);
}

const titleOf = (heading) => heading.replace(/^[#\s*_=~–—-]+/, '').trim();

/** Pieces of one very long paragraph, cut at sentence ends (or, with no punctuation at all, at a space near the target). */
function splitLongParagraph(src, para, target, max) {
  const pieces = [];
  let start = null;
  let end = null;
  const push = (a, b) => {
    if (b > a) pieces.push({ start: a, end: b });
  };
  for (const s of splitSentences(src.slice(para.start, para.end))) {
    const a = para.start + s.start;
    const b = para.start + s.end;
    if (start !== null && b - start > target) {
      push(start, end);
      start = null;
    }
    if (start === null) start = a;
    end = b;
    while (end - start > max) {
      let cut = start + target;
      const sp = src.lastIndexOf(' ', cut);
      if (sp > start + target / 2) cut = sp;
      push(start, cut);
      start = cut;
    }
  }
  if (start !== null) push(start, end);
  if (!pieces.length) return [{ start: para.start, end: para.end }];
  pieces[0].start = para.start;
  pieces.at(-1).end = para.end;
  return pieces;
}

/**
 * @returns {{ i: number, start: number, end: number, title: string, under: string, words: number, hash: string }[]}
 *          `title` is the section's own heading; `under` is the nearest heading at or above it (a chapter's later sections have no title but sit under it)
 *          contiguous: section k ends where section k+1 starts, the first starts at 0 and the last ends at text.length
 */
export function splitSections(text, { target = SECTION_TARGET_CHARS, max = SECTION_MAX_CHARS, min = SECTION_MIN_CHARS } = {}) {
  const src = String(text ?? '');

  // 1. units: paragraphs (headings flagged), with an enormous paragraph pre-split at sentence ends
  const units = [];
  for (const para of splitParagraphs(src)) {
    const heading = isHeading(para.text);
    if (!heading && para.end - para.start > max) {
      for (const piece of splitLongParagraph(src, para, target, max)) units.push({ ...piece, heading: false, title: '' });
    } else {
      units.push({ start: para.start, end: para.end, heading, title: heading ? titleOf(para.text) : '' });
    }
  }

  // 2. pack units into sections
  const out = [];
  let cur = null;
  for (const u of units) {
    const size = u.end - u.start;
    const have = cur ? cur.end - cur.start : 0;
    if (cur && have >= min && ((u.heading && have > 0) || have + size > max)) {
      out.push(cur);
      cur = null;
    }
    cur ??= { start: u.start, end: u.start, title: '' };
    if (u.heading && !cur.title) cur.title = u.title;
    cur.end = u.end;
    if (cur.end - cur.start >= target) {
      out.push(cur);
      cur = null;
    }
  }
  if (cur) out.push(cur);

  // a tiny tail belongs to the section before it
  if (out.length > 1 && out.at(-1).end - out.at(-1).start < min / 2) {
    const tail = out.pop();
    out.at(-1).end = tail.end;
  }
  // make the sections contiguous, so every character (the blank lines too) lies in exactly one section
  out.forEach((s, k) => {
    s.i = k;
    s.start = k === 0 ? 0 : out[k - 1].end;
  });
  if (out.length) out.at(-1).end = src.length;
  let under = '';
  out.forEach((s, k) => {
    if (s.title) under = s.title;
    s.under = under;
    if (k < out.length - 1) s.end = out[k + 1].start; // (start of k+1 was set to end of k above; keep them equal)
    const slice = src.slice(s.start, s.end);
    s.words = words(slice).length;
    s.hash = fnv1a(slice);
  });
  return out;
}

export const sectionText = (text, section) => String(text).slice(section.start, section.end);
