/**
 * Sentences of a model's reply, with offsets, so a sentence can be REMOVED whole (never reworded). Every line and every list item starts a new sentence; the
 * "1." / "-" of an item stays with its first sentence; "Dr.", "e.g.", initials and "vs. the" do not end one. Scans by hand: a regex with nested quantifiers
 * over a long run of punctuation would be quadratic, and this runs on every reply.
 */

const TERMINATORS = '.!?…';
const CLOSERS = '"\'”’)]*_';
const LIST_MARK = /^(?:\d{1,3}[.)]|[-*•])[ \t]+/;
const ABBREV_TAIL = /(?:^|[\s("'])(?:mr|mrs|ms|dr|prof|sr|jr|st|vs|e\.g|i\.e|fig|cf|approx|no)\.$/i;
const INITIAL_TAIL = /(?:^|[\s("'])[A-HJ-Z]\.$/;
const hasLetters = (s) => /[\p{L}\p{N}]/u.test(s);
const isWs = (c) => c === 32 || (c >= 9 && c <= 13) || c === 0xa0 || c === 0x2028 || c === 0x2029 || c === 0xfeff || c === 0x3000;

/** @returns {{ start: number, end: number, text: string }[]} in text order, never overlapping, none without a letter or digit */
export function sentenceSpans(text) {
  const src = typeof text === 'string' ? text : '';
  const out = [];
  const push = (a, b) => {
    const t = src.slice(a, b);
    if (hasLetters(t)) out.push({ start: a, end: b, text: t });
  };
  let lineStart = 0;
  while (lineStart <= src.length) {
    let lineEnd = src.indexOf('\n', lineStart);
    if (lineEnd === -1) lineEnd = src.length;
    let s = lineStart;
    let e = lineEnd;
    while (s < e && isWs(src.charCodeAt(s))) s++;
    while (e > s && isWs(src.charCodeAt(e - 1))) e--;
    if (s < e) {
      const mark = LIST_MARK.exec(src.slice(s, Math.min(e, s + 8)));
      let i = mark ? s + mark[0].length : s;
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
            if (ABBREV_TAIL.test(tail) || INITIAL_TAIL.test(tail)) boundary = false;
          }
          if (boundary) {
            let n = k;
            while (n < e && isWs(src.charCodeAt(n))) n++;
            if (n < e && src[n] !== src[n].toUpperCase()) boundary = false; // a lowercase word continues the sentence
          }
        }
        if (boundary) {
          push(start, k);
          start = k;
          while (start < e && isWs(src.charCodeAt(start))) start++;
          i = start;
        } else i = j;
      }
      if (start < e) push(start, e);
    }
    lineStart = lineEnd + 1;
  }
  return out;
}

/**
 * The text without the given spans. A line that is left with nothing (or only a list marker) disappears with them, blank lines do not pile up, and nothing
 * else is touched: no word of what is left is moved or changed.
 */
export function removeSpans(text, spans) {
  const src = typeof text === 'string' ? text : '';
  const cuts = [...spans].sort((a, b) => a.start - b.start);
  const out = [];
  let ci = 0;
  let lineStart = 0;
  while (lineStart <= src.length) {
    let lineEnd = src.indexOf('\n', lineStart);
    if (lineEnd === -1) lineEnd = src.length;
    let line = '';
    let at = lineStart;
    let cut = false;
    while (ci < cuts.length && cuts[ci].start < lineEnd + 1 && cuts[ci].start >= lineStart) {
      const c = cuts[ci++];
      if (c.start < at) continue;
      line += src.slice(at, c.start);
      at = Math.min(c.end, lineEnd);
      while (at < lineEnd && (src[at] === ' ' || src[at] === '\t')) at++; // the blank that separated it from the next sentence
      cut = true;
    }
    line += src.slice(at, lineEnd);
    line = line.replace(/[ \t]+$/, '');
    if (!(cut && /^\s*(?:(?:\d{1,3}[.)]|[-*•])\s*)?$/.test(line))) out.push(line);
    lineStart = lineEnd + 1;
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
