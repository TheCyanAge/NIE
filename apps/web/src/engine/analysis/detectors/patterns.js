import { mk, asIntentional } from '../finding.js';
import { STOPWORDS, WORD_RE, words, clip } from '../../util/text.js';

const FILLER = new Set(['know', "don't", "didn't", "can't", "won't", 'think', 'going', 'want', 'just', 'back', 'then', 'than', 'about', 'there', 'their', 'which', 'would', 'could', 'should', 'really', 'something', 'maybe', 'okay']);
const isContent = (w) => w.length >= 4 && !STOPWORDS.has(w) && !FILLER.has(w);

function tokenize(text) {
  const out = [];
  for (const m of text.matchAll(WORD_RE)) out.push({ w: m[0].toLowerCase(), pos: m.index });
  return out;
}

/**
 * Repetition, with pattern awareness: the same phrase spread across scenes reads as motif or characterization
 * (an observation, or a strength when the writer declared it); the same phrase clustered tightly reads as an echo.
 */
export function repetition(ctx) {
  const { interp, memory } = ctx;
  const toks = tokenize(ctx.text);
  if (toks.length < 60) return [];
  const out = [];

  const nameLike = new Set((ctx.text.match(/\b[A-Z][a-z]{3,}\b/g) ?? []).map((s) => s.toLowerCase()));
  const motifs = (memory.motifs ?? []).map((m) => String(m).toLowerCase());
  const isMotif = (phrase) => motifs.some((m) => phrase.includes(m) || m.includes(phrase));

  // 2) Repeated 3–4 word phrases.
  const grams = new Map();
  for (const n of [4, 3]) {
    for (let i = 0; i + n <= toks.length; i++) {
      const slice = toks.slice(i, i + n);
      if (slice.filter((t) => isContent(t.w)).length < 2) continue;
      if (slice.some((t) => nameLike.has(t.w) && n === 3 && slice.filter((x) => nameLike.has(x.w)).length > 1)) continue;
      const phrase = slice.map((t) => t.w).join(' ');
      const g = grams.get(phrase) ?? { phrase, n, idx: [] };
      g.idx.push(i);
      grams.set(phrase, g);
    }
  }
  const repeated = [...grams.values()].filter((g) => g.idx.length >= 3);
  // Drop 3-grams contained in a 4-gram that repeats equally often.
  const kept = repeated.filter((g) => g.n === 4 || !repeated.some((h) => h.n === 4 && h.phrase.includes(g.phrase) && h.idx.length >= g.idx.length));
  kept.sort((a, b) => b.idx.length - a.idx.length || b.n - a.n);

  let reported = 0;
  const covered = new Set(); // token indices already explained by a reported phrase
  const patternWords = new Set(); // words belonging to a recurring pattern (not worth a separate word-level flag)
  for (const g of kept) {
    if (reported >= 4) break;
    const overlap = g.idx.filter((i) => covered.has(i)).length;
    if (overlap >= Math.ceil(g.idx.length / 2)) continue;
    const positions = g.idx.map((i) => toks[i].pos);
    const scenes = new Set(positions.map((p) => ctx.sceneOf(p)));
    const gaps = g.idx.slice(1).map((v, k) => v - g.idx[k]);
    // Across scenes it is a pattern (motif / habit) however close the lines are; only a tight knot inside one scene is an echo.
    const spread = scenes.size >= 2 || Math.min(...gaps) >= 150;
    const clustered = !spread && Math.max(...gaps) < 60;
    const first = positions[0];
    const quote = ctx.sentenceAround(first);
    const times = g.idx.length;
    for (const i of g.idx) for (let k = 0; k < g.n; k++) covered.add(i + k);
    if (clustered) {
      let f = mk({
        detector: 'repeat-phrase',
        category: 'repetition',
        class: 'possible-issue',
        title: `"${g.phrase}" echoes`,
        message: `"${g.phrase}" comes back ${times}× within a few lines.`,
        quote,
        start: first,
        sceneIndex: ctx.sceneOf(first),
        question: 'Deliberate refrain, or an echo you\'d want to vary?',
        confidence: 0.55,
        key: `phrase:${g.phrase}`,
      });
      if (isMotif(g.phrase)) f = { ...f, class: 'stylistic-observation', message: `"${g.phrase}" returns ${times}× in quick succession, and it's a motif you listed — reads as a deliberate refrain.` };
      else if (interp.tolerates('repetition')) f = asIntentional(f, interp.why('repetition'), 'repetition');
      out.push(f);
      reported++;
    } else if (spread) {
      g.phrase.split(' ').forEach((w) => patternWords.add(w));
      const deliberate = isMotif(g.phrase);
      out.push(
        mk({
          detector: 'pattern-recurring',
          category: 'style',
          class: deliberate ? 'strength' : 'stylistic-observation',
          title: deliberate ? `Motif carried through: "${g.phrase}"` : `Recurring pattern: "${g.phrase}"`,
          message: deliberate
            ? `"${g.phrase}" recurs ${times}× across ${scenes.size} scene${scenes.size === 1 ? '' : 's'}, just as you planned. The repetition is doing motif work.`
            : `"${g.phrase}" recurs ${times}× across ${scenes.size} scene${scenes.size === 1 ? '' : 's'}. That reads as a pattern — a motif or a characterization habit — so I'm not treating each instance as repetition.`,
          quote,
          start: first,
          sceneIndex: ctx.sceneOf(first),
          question: deliberate ? null : 'Is this a motif you want me to track?',
          confidence: 0.6,
          key: `pattern:${g.phrase}`,
          meta: { occurrences: times, scenes: scenes.size, phrase: g.phrase },
        })
      );
      reported++;
    }
  }

  // 1) Dense word repetition inside a 150-word window.
  const WINDOW = 150;
  const counts = new Map();
  const worst = new Map(); // word → {count, startIdx}
  let lo = 0;
  for (let hi = 0; hi < toks.length; hi++) {
    const w = toks[hi].w;
    if (isContent(w) && w.length >= 5 && !nameLike.has(w)) {
      counts.set(w, (counts.get(w) ?? 0) + 1);
      const c = counts.get(w);
      if (c >= 4 && (!worst.has(w) || c > worst.get(w).count)) worst.set(w, { count: c, idx: lo });
    }
    while (hi - lo >= WINDOW) {
      const lw = toks[lo].w;
      if (counts.has(lw)) counts.set(lw, counts.get(lw) - 1);
      lo++;
    }
  }
  [...worst.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .filter(([w]) => !patternWords.has(w))
    .slice(0, 3)
    .forEach(([w, { count, idx }]) => {
      const pos = toks[idx].pos;
      const end = toks[Math.min(toks.length - 1, idx + WINDOW)].pos;
      let f = mk({
        detector: 'repeat-word',
        category: 'repetition',
        class: 'possible-issue',
        title: `"${w}" keeps recurring`,
        message: `"${w}" appears ${count}× within about ${WINDOW} words. It may be doing something on purpose — or it may just be a habit worth varying.`,
        quote: ctx.text.slice(pos, Math.min(end, pos + 200)),
        start: pos,
        end: Math.min(end, pos + 200),
        sceneIndex: ctx.sceneOf(pos),
        question: 'Is the repetition doing work here?',
        confidence: 0.5,
        key: `word:${w}`,
      });
      if (isMotif(w)) f = { ...f, class: 'stylistic-observation', message: `"${w}" recurs ${count}× here, and it's one of the motifs you listed — I'll read it as deliberate.` };
      else if (interp.tolerates('repetition')) f = asIntentional(f, interp.why('repetition'), 'repetition');
      out.push(f);
    });

  return out;
}

/** Very long sentences: a style choice in some projects, a clarity risk in others. */
export function longSentences(ctx) {
  const { interp } = ctx;
  const long = ctx.sentences
    .map((s) => ({ ...s, wc: words(s.text).length }))
    .filter((s) => s.wc >= 55)
    .sort((a, b) => b.wc - a.wc)
    .slice(0, 3);
  return long.map((s) => {
    const veryLong = s.wc >= 90;
    let f = mk({
      detector: 'long-sentence',
      category: 'clarity',
      class: 'possible-issue',
      title: `${s.wc}-word sentence`,
      message: veryLong
        ? `This single sentence runs ${s.wc} words. A reader may lose the thread unless the build-up is the point.`
        : `This sentence runs ${s.wc} words — long, but not necessarily too long if it moves.`,
      quote: clip(s.text, 220),
      start: s.start,
      end: s.end,
      sceneIndex: ctx.sceneOf(s.start),
      question: 'Do you want the reader carried along in one breath here?',
      confidence: veryLong ? 0.55 : 0.4,
      key: `long@${s.start}`,
    });
    if (interp.tolerates('longSentences')) {
      f = { ...f, class: 'stylistic-observation', message: `${f.message} Since ${interp.why('longSentences')}, I'm reading the length as style.`, meta: { reason: interp.why('longSentences') } };
    }
    return f;
  });
}
