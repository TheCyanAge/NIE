/**
 * Numbers as a writer writes them: digits ("40,000", "3.5") and number words ("ninety", "twenty-three hundred", "forty thousand", "three hundred and fifty").
 * Shared by the figures instrument (analysis.js) and the number check on replies (ground.js). Plain parsing, no state.
 */

const ATOMS = new Map(
  Object.entries({
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
    fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  })
);
const SCALES = new Map(Object.entries({ hundred: 100, thousand: 1000, million: 1000000 }));

export const isNumberWord = (w) => ATOMS.has(w) || SCALES.has(w);

/**
 * The number written in words that starts at `ws[at]` (lower-case words; "twenty-three" may be one word).
 * @returns {{ value: number, used: number } | null}  `used` is how many entries of `ws` the number takes ("three hundred and fifty" -> 4)
 */
export function parseNumberWords(ws, at = 0) {
  let total = 0;
  let cur = 0;
  let kind = 'start'; // start | ones | tens | scale
  let used = 0;
  let good = 0;
  let value = 0;
  let j = at;
  // "a hundred", "a thousand"
  if ((ws[j] === 'a' || ws[j] === 'an') && SCALES.has(ws[j + 1])) {
    cur = 1;
    kind = 'ones';
    used = 1;
    j++;
  }
  for (; j < ws.length; j++) {
    const w = ws[j];
    if (w === 'and' && kind === 'scale' && ATOMS.has(String(ws[j + 1] ?? '').split('-')[0]) && !SCALES.has(ws[j + 1])) {
      used++;
      continue;
    }
    const atoms = String(w).split('-');
    let ok = atoms.length <= 2 && atoms.every((a) => ATOMS.has(a) || SCALES.has(a));
    if (ok && atoms.length === 2 && !(ATOMS.get(atoms[0]) >= 20 && ATOMS.get(atoms[0]) % 10 === 0 && ATOMS.has(atoms[1]) && ATOMS.get(atoms[1]) < 10 && ATOMS.get(atoms[1]) > 0)) ok = false;
    if (!ok) break;
    let valid = true;
    for (const a of atoms) {
      if (ATOMS.has(a)) {
        const v = ATOMS.get(a);
        if (kind === 'ones' || (kind === 'tens' && (v >= 10 || atoms.length === 1 && v === 0))) {
          valid = false;
          break;
        }
        cur += v;
        kind = v >= 20 ? 'tens' : 'ones';
      } else {
        const s = SCALES.get(a);
        if (s === 100) {
          if (cur === 0 || cur >= 100 && kind === 'scale') {
            valid = false;
            break;
          }
          // "two thousand five hundred": the hundred applies to what follows the thousand, not to the whole
          cur *= 100;
        } else {
          if (cur === 0 && total === 0) {
            valid = false;
            break;
          }
          total += cur * s;
          cur = 0;
        }
        kind = 'scale';
      }
    }
    if (!valid) break;
    used++;
    good = used;
    value = total + cur;
  }
  return good > 0 ? { value, used: good } : null;
}

/** "40,000" / "3.5" / "12" -> a number (null when it is not one). Commas must group thousands. */
export function parseDigits(s) {
  const t = String(s);
  if (!/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$|^\d+(?:\.\d+)?$/.test(t)) return null;
  const v = Number(t.replace(/,/g, ''));
  return Number.isFinite(v) ? v : null;
}

// a digit run (commas grouping thousands, an optional decimal part) or a word
export const NUMBER_TOKEN = /\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?|[\p{L}\p{M}][\p{L}\p{M}'’-]*/gu;

/**
 * Every number in `text`, as the writer wrote it: [{ value, start, end, written, digits }].
 * A digit run glued to letters ("12th", "5km") is left out: it is an ordinal or a unit, not a count to compare.
 */
export function numbersIn(text, { limit = 20000 } = {}) {
  const src = String(text ?? '');
  const out = [];
  const toks = [];
  for (const m of src.matchAll(NUMBER_TOKEN)) {
    toks.push({ raw: m[0], lo: m[0].toLowerCase(), start: m.index, end: m.index + m[0].length, digit: /^\d/.test(m[0]) });
    if (toks.length > limit * 6) break;
  }
  for (let k = 0; k < toks.length && out.length < limit; k++) {
    const t = toks[k];
    if (t.digit) {
      const next = src[t.end];
      if (next !== undefined && /[\p{L}\p{M}]/u.test(next)) continue;
      const prev = src[t.start - 1];
      if (prev !== undefined && /[\p{L}\p{M}]/u.test(prev)) continue;
      const v = parseDigits(t.raw);
      if (v !== null) out.push({ value: v, start: t.start, end: t.end, written: t.raw, digits: true });
      continue;
    }
    if (!isNumberWord(t.lo.split('-')[0]) && t.lo !== 'a' && t.lo !== 'an') continue;
    // number words must sit next to each other in the text (only blanks between them)
    const run = [t];
    for (let j = k + 1; j < toks.length && run.length < 8; j++) {
      if (!/^[ \t]+$/.test(src.slice(run.at(-1).end, toks[j].start))) break;
      run.push(toks[j]);
    }
    const parsed = parseNumberWords(run.map((r) => r.lo), 0);
    if (!parsed) continue;
    const last = run[parsed.used - 1];
    out.push({ value: parsed.value, start: t.start, end: last.end, written: src.slice(t.start, last.end), digits: false });
    k += parsed.used - 1;
  }
  return out;
}
