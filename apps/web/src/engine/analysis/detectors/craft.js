import { mk, asIntentional } from '../finding.js';
import { clip, mean, stdev, words } from '../../util/text.js';
import { inferForm } from '../../intent/form.js';

const BACKSTORY = /\b(?:had been|had once|used to|years ago|months ago|back then|long before|in those days|had always|had never|when (?:he|she|they|I) was (?:a )?(?:child|young|little))\b/gi;

/** Pacing: long unbroken blocks, staccato runs, and dialogue balance — read against the form and profile. */
export function pacing(ctx) {
  const { interp } = ctx;
  const out = [];
  const traits = interp.form.traits;

  if (traits.scenes) {
    // Dense run: ≥5 consecutive long, dialogue-free paragraphs.
    let run = [];
    const flush = () => {
      if (run.length >= 5) {
        const first = run[0];
        let f = mk({
          detector: 'pacing-dense',
          category: 'pacing',
          class: 'possible-issue',
          title: 'Long unbroken stretch',
          message: `${run.length} long paragraphs in a row with no dialogue or scene break. If you want the reader to feel the weight of it, that works; if you want momentum, it may feel like a wall.`,
          quote: clip(first.text, 160),
          start: first.start,
          end: run.at(-1).end,
          sceneIndex: first.scene,
          question: 'Is the slow, dense feel intentional here?',
          confidence: 0.5,
          key: `dense@${first.start}`,
        });
        if (interp.tolerates('slowPace')) f = asIntentional(f, interp.why('slowPace'), 'pacing');
        out.push(f);
      }
      run = [];
    };
    for (const p of ctx.paragraphs) {
      if (p.wordCount >= 90 && !/["“]/.test(p.text)) run.push(p);
      else flush();
    }
    flush();
  }

  // Staccato: ≥8 consecutive very short sentences.
  let streak = [];
  const flushStaccato = () => {
    if (streak.length >= 8 && out.filter((o) => o.detector === 'pacing-staccato').length < 2) {
      let f = mk({
        detector: 'pacing-staccato',
        category: 'style',
        class: 'stylistic-observation',
        title: 'Staccato run',
        message: `${streak.length} very short sentences in a row. That creates a clipped, urgent rhythm — good if it's what you want.`,
        quote: clip(streak.map((s) => s.text).join(' '), 200),
        start: streak[0].start,
        end: streak.at(-1).end,
        sceneIndex: ctx.sceneOf(streak[0].start),
        question: 'Is the clipped rhythm intentional?',
        confidence: 0.5,
        key: `staccato@${streak[0].start}`,
      });
      if (interp.tolerates('fragments')) f = asIntentional(f, interp.why('fragments'), 'rhythm');
      out.push(f);
    }
    streak = [];
  };
  for (const s of ctx.sentences) {
    if (words(s.text).length <= 5) streak.push(s);
    else flushStaccato();
  }
  flushStaccato();

  // Dialogue balance (only where the form expects dialogue).
  if (traits.dialogue && ctx.wordTotal > 300) {
    if (ctx.dialogueRatio > 0.65 && !interp.flags.dialogueHeavy) {
      out.push(
        mk({
          detector: 'dialogue-balance',
          category: 'dialogue',
          class: 'stylistic-observation',
          title: 'Mostly dialogue',
          message: `About ${Math.round(ctx.dialogueRatio * 100)}% of this is spoken. That can feel quick and vivid, but the reader may lose where they are unless there's some anchoring action or setting.`,
          quote: '',
          question: 'Is a dialogue-driven scene what you want here?',
          confidence: 0.45,
          key: 'dialogue-high',
        })
      );
    } else if (ctx.dialogueRatio < 0.02 && ctx.wordTotal > 800 && ctx.dialogue.length === 0) {
      out.push(
        mk({
          detector: 'dialogue-balance',
          category: 'dialogue',
          class: 'stylistic-observation',
          title: 'No spoken dialogue',
          message: 'There\'s no quoted speech in this passage. That\'s a legitimate choice (interior or descriptive writing often works that way) — worth confirming it\'s deliberate.',
          quote: '',
          question: 'Is the absence of dialogue intentional?',
          confidence: 0.4,
          key: 'dialogue-none',
        })
      );
    }
  }
  return out;
}

/** Exposition: paragraphs that stop to explain the past. A question about timing, not a verdict. */
export function exposition(ctx) {
  const { interp } = ctx;
  if (!interp.form.traits.plot) return [];
  const out = [];
  for (const p of ctx.paragraphs) {
    if (p.wordCount < 40) continue;
    const hits = (p.narration.match(BACKSTORY) ?? []).length;
    if (hits >= 3 && out.length < 2) {
      out.push(
        mk({
          detector: 'exposition-block',
          category: 'exposition',
          class: 'possible-issue',
          title: 'Backstory block',
          message: 'This paragraph steps back to explain background. It might be exactly where the reader needs it — or it might pause the scene.',
          quote: clip(p.text, 180),
          start: p.start,
          end: p.end,
          sceneIndex: p.scene,
          question: 'Should the reader learn this now, or discover it later?',
          confidence: 0.45,
          key: `expo@${p.start}`,
        })
      );
    }
  }
  return out;
}

const TAG = /["”]\s*,?\s*(?:[A-Z][a-z]+|he|she|they|I|we)\s+(said|asked|replied|whispered|shouted|muttered|answered|snapped|sighed|growled|murmured|yelled|cried|laughed|hissed|exclaimed|demanded)\b(\s+\w+ly)?/g;

export function dialogueTags(ctx) {
  if (!ctx.interp.form.traits.dialogue) return [];
  const verbs = {};
  let total = 0;
  let adverbs = 0;
  let sample = null;
  for (const m of ctx.text.matchAll(TAG)) {
    total++;
    verbs[m[1]] = (verbs[m[1]] ?? 0) + 1;
    if (m[2]) {
      adverbs++;
      sample ??= m;
    }
  }
  const out = [];
  if (total >= 10) {
    const [top, n] = Object.entries(verbs).filter(([v]) => v !== 'said').sort((a, b) => b[1] - a[1])[0] ?? [];
    if (top && n / total >= 0.4) {
      out.push(
        mk({
          detector: 'dialogue-tags',
          category: 'dialogue',
          class: 'stylistic-observation',
          title: `Lots of "${top}"`,
          message: `"${top}" accounts for ${n} of ${total} speech tags. It's a strong, repeating signal — fine if it's your voice, noticeable if it isn't.`,
          quote: '',
          confidence: 0.4,
          key: `tag:${top}`,
        })
      );
    }
  }
  if (adverbs >= 4) {
    out.push(
      mk({
        detector: 'dialogue-tags',
        category: 'dialogue',
        class: 'stylistic-observation',
        title: 'Adverb-heavy tags',
        message: `${adverbs} speech tags lean on an adverb ("${sample[0].replace(/^["”]\s*,?\s*/, '').trim()}"…). Sometimes the line itself can carry the tone — your call.`,
        quote: ctx.sentenceAround(sample.index),
        start: sample.index,
        confidence: 0.4,
        key: 'tag-adverbs',
      })
    );
  }
  return out;
}

const SIMILE = /\b(?:like (?:a|an|the)|as (?:if|though)|as \w+ as)\b/gi;
const ORNATE = /\b(?:gossamer|ethereal|tapestry|symphony|kaleidoscope|ephemeral|luminous|iridescent|cascad\w+|shimmering|whispers? of|dance of|embrace of)\b/gi;

/** Form and register fit: does the text match what the profile says it is? */
export function formFit(ctx) {
  const { interp } = ctx;
  const out = [];

  // Declared form vs what the text looks like.
  if (interp.form.source === 'profile' && ctx.text.length > 200) {
    const guess = inferForm(ctx.text);
    const declaredFiction = !interp.form.traits.nonFiction;
    const guessNonFiction = ['report', 'news-narrative', 'essay', 'journal'].includes(guess.id);
    const scriptLike = ['screenplay', 'stage-play', 'comic-script'].includes(guess.id);
    const declaredScript = ['screenplay', 'stage-play', 'comic-script'].includes(interp.form.id);
    if (guess.confidence >= 0.75 && ((scriptLike && !declaredScript) || (guessNonFiction && declaredFiction) || (declaredScript && !scriptLike && guess.id === 'prose-fiction'))) {
      out.push(
        mk({
          detector: 'form-mismatch',
          category: 'form',
          class: 'possible-issue',
          title: 'Reads like a different form',
          message: `Your profile says "${interp.form.label}", but this looks like ${guess.label.toLowerCase()} (${guess.reasons.join('; ')}).`,
          quote: '',
          question: 'Has the project changed shape, or is this a deliberate hybrid?',
          confidence: guess.confidence,
          key: `form:${guess.id}`,
        })
      );
    }
  }

  // Clinical register with ornate figurative language.
  if (interp.watchesOrnateLanguage) {
    const similes = (ctx.text.match(SIMILE) ?? []).length;
    const ornate = (ctx.text.match(ORNATE) ?? []).length;
    const density = ((similes + ornate) / Math.max(1, ctx.wordTotal)) * 500;
    if (similes + ornate >= 4 && density >= 1.5) {
      const idx = ctx.text.search(SIMILE);
      out.push(
        mk({
          detector: 'register-clash',
          category: 'tone',
          class: 'stylistic-observation',
          title: 'Ornate language in a clinical register',
          message: `Your profile calls for a clinical, detached register, and this passage has ${similes} simile${similes === 1 ? '' : 's'}${ornate ? ` and ${ornate} ornate phrase${ornate === 1 ? '' : 's'}` : ''}. That contrast could be powerful, or it could pull the voice off course.`,
          quote: idx >= 0 ? ctx.sentenceAround(idx) : '',
          start: idx >= 0 ? idx : null,
          question: 'Is the contrast deliberate?',
          confidence: 0.5,
          key: 'register-clinical-ornate',
        })
      );
    }
  }
  return out;
}

const SENSES = {
  sight: /\b(?:saw|looked|glimpse[ds]?|glanced|gleam\w*|bright|dark|shadow\w*|colou?r\w*|pale|red|blue|green|gold\w*|glow\w*|flicker\w*)\b/gi,
  sound: /\b(?:heard|sound\w*|echo\w*|hum\w*|creak\w*|whisper\w*|silence|silent|clang\w*|rumbl\w*|click\w*|hiss\w*|murmur\w*)\b/gi,
  smell: /\b(?:smell\w*|scent\w*|stench|odou?r|aroma|reek\w*|fragran\w*)\b/gi,
  touch: /\b(?:cold|warm|rough|smooth|cool|damp|wet|dry|sticky|sharp|soft|texture\w*|shiver\w*|trembl\w*|ached?)\b/gi,
  taste: /\b(?:taste\w*|bitter|sweet|sour|salt\w*|metallic|flavou?r)\b/gi,
};

/** Strengths: what's working, so a scan is never only a list of complaints. */
export function strengths(ctx) {
  const out = [];
  const lens = ctx.sentences.map((s) => words(s.text).length).filter(Boolean);
  if (lens.length >= 12) {
    const cv = stdev(lens) / Math.max(1, mean(lens));
    if (cv >= 0.55) {
      out.push(
        mk({
          detector: 'strength-rhythm',
          category: 'style',
          class: 'strength',
          title: 'Varied sentence rhythm',
          message: `Sentence length ranges from ${Math.min(...lens)} to ${Math.max(...lens)} words. That variety gives the prose a pulse instead of a drone.`,
          quote: '',
          confidence: 0.6,
          key: 'rhythm',
        })
      );
    }
  }
  const hit = Object.entries(SENSES).filter(([, re]) => (ctx.text.match(re) ?? []).length >= 2).map(([k]) => k);
  if (hit.length >= 4 && ctx.wordTotal >= 150) {
    out.push(
      mk({
        detector: 'strength-senses',
        category: 'style',
        class: 'strength',
        title: 'Wide sensory range',
        message: `The scene draws on ${hit.length} senses (${hit.join(', ')}), which helps the reader feel present in it.`,
        quote: '',
        confidence: 0.55,
        key: 'senses',
      })
    );
  }
  const names = ctx.memory.characters ?? [];
  if (names.length) {
    const used = names.filter((c) => new RegExp(`\\b${c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(ctx.text));
    if (used.length && ctx.wordTotal >= 200) {
      out.push(
        mk({
          detector: 'strength-names',
          category: 'continuity',
          class: 'strength',
          title: 'Character names are consistent',
          message: `${used.map((c) => c.name).join(', ')} ${used.length === 1 ? 'appears' : 'appear'} consistently with the names in your project memory.`,
          quote: '',
          confidence: 0.5,
          key: 'names-consistent',
        })
      );
    }
  }
  return out;
}
