// Small, dependency-free text helpers shared by the UI (browser) and the desktop main process (Node).

export const WORD_RE = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;

export const STOPWORDS = new Set(
  (
    'a about above after again against all am an and any are as at be because been before being below between both but by ' +
    'can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how ' +
    'i if in into is it its itself just me more most my myself no nor not now of off on once only or other our ours ourselves out over own ' +
    'same she should so some such than that the their theirs them themselves then there these they this those through to too under until up ' +
    'very was we were what when where which while who whom why will with would you your yours yourself yourselves said say says'
  ).split(' ')
);

export function words(text) {
  return text.match(WORD_RE) ?? [];
}

export function wordCount(text) {
  return words(text).length;
}

/** Paragraphs separated by one or more blank lines. Offsets index into the original text. */
export function splitParagraphs(text) {
  const out = [];
  const re = /[^\n]+(?:\n(?!\s*\n)[^\n]*)*/g;
  let m;
  while ((m = re.exec(text))) {
    const raw = m[0];
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const lead = raw.length - raw.trimStart().length;
    out.push({ text: trimmed, start: m.index + lead, end: m.index + lead + trimmed.length });
  }
  return out;
}

const ABBREV = /\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e|No)\.$/;

/** Sentence splitter tuned for prose with dialogue. Not linguistics-grade; good enough for heuristics. */
export function splitSentences(text) {
  const out = [];
  const re = /[^.!?…\n]+(?:[.!?…]+["'”’)\]]*|\n|$)/g;
  let m;
  let carry = null;
  while ((m = re.exec(text))) {
    const raw = m[0];
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const lead = raw.length - raw.trimStart().length;
    const piece = { text: trimmed, start: m.index + lead, end: m.index + lead + trimmed.length };
    if (carry) {
      piece.text = carry.text + ' ' + piece.text;
      piece.start = carry.start;
      carry = null;
    }
    if (ABBREV.test(trimmed) && re.lastIndex < text.length) {
      carry = piece;
      continue;
    }
    out.push(piece);
  }
  if (carry) out.push(carry);
  return out;
}

/** Rough token estimate (English prose ≈ 3.6 chars/token). Used only for prompt budgeting. */
export function estimateTokens(s) {
  return Math.ceil((s?.length ?? 0) / 3.6);
}

export function clip(s, n) {
  if (!s) return '';
  return s.length <= n ? s : s.slice(0, Math.max(0, n - 1)).trimEnd() + '…';
}

/** Levenshtein distance with an early-out bound. */
export function levenshtein(a, b, max = Infinity) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** FNV-1a 32-bit hash → 8 hex chars. Used for stable finding fingerprints. */
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function uid(prefix = 'id') {
  const c = globalThis.crypto;
  if (c?.randomUUID) return `${prefix}_${c.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16)}`;
}

/** Minimal stemmer for keyword matching (plural / -ing / -ed). Intentionally crude. */
export function stem(w) {
  w = w.toLowerCase();
  if (w.length > 5 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

/** Remove quoted speech so narration can be analysed separately from dialogue. */
export function stripDialogue(text) {
  return text.replace(/"[^"\n]*"|“[^”\n]*”/g, ' ');
}

/** Extract quoted speech spans. */
export function dialogueSpans(text) {
  const out = [];
  const re = /"[^"\n]*"|“[^”\n]*”/g;
  let m;
  while ((m = re.exec(text))) out.push({ text: m[0], start: m.index, end: m.index + m[0].length });
  return out;
}

export function mean(a) {
  return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
}

export function stdev(a) {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(mean(a.map((x) => (x - m) ** 2)));
}

/** Pick deterministically from a list using a seed string (keeps replies varied but testable). */
export function pick(list, seed = '') {
  if (!list.length) return undefined;
  return list[parseInt(fnv1a(String(seed)), 16) % list.length];
}

export function deepClone(v) {
  return v === undefined ? v : JSON.parse(JSON.stringify(v));
}

/** Small deterministic PRNG (mulberry32) so "random" idea picks are reproducible in tests and stable for a given seed. */
export function seededRandom(seed) {
  let a = parseInt(fnv1a(String(seed)), 16) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic shuffle (Fisher–Yates) using a seeded generator. */
export function seededShuffle(list, seed) {
  const rnd = seededRandom(seed);
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
