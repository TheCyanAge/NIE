import { profileCorpus, normalizeProfile } from './profile.js';
import { resolveTerms } from '../knowledge/index.js';
import { inferForm } from '../intent/form.js';

/**
 * The interpreter turns a profile into *how to read this writing*.
 * It is what stops NIE from calling deliberate fragmentation "disjointed" or an unreliable
 * narrator's contradictions "continuity errors".
 */

const FLAG_PATTERNS = {
  fragmented: /fragment|disjoint|collage|shard|mosaic|vignette|broken (?:narrative|syntax|sentences?)/i,
  nonlinear: /non-?linear|reverse chron|out of order|braid|circular|jumbled|time[- ]?(?:slip|jump)/i,
  unreliable: /unreliable|untrustworth|lying narrator|deceiv|self-?deception|self-?deceiv|gaslight|misremember/i,
  surreal: /surreal|dream[- ]?logic|absurd(?:ist)?|magical realis|uncanny|kafka|bizarre|non-?sequitur/i,
  clinical: /clinical|detached|dispassionate|forensic|deadpan|reportorial|cold realism|objective narration|observational/i,
  stream: /stream[- ]of[- ]consciousness|free[- ]association|interior monologue|unpunctuated|run-?on/i,
  deliberateRepetition: /repetit|refrain|incantat|anaphora|litany|obsessive|loop(?:ing)?\b|echo(?:ing)?\b/i,
  minimalist: /minimal|sparse|spare|terse|understat/i,
  maximalist: /maximal|ornate|baroque|lush|dense|purple|expansive/i,
  lyrical: /lyric|poetic|prose poem|musical|cadence/i,
  noResolution: /no (?:conventional )?(?:resolution|ending|closure)|open[- ]ended|refuses? (?:to )?(?:resolve|conclude)|ambiguous ending|unresolved|without resolution/i,
  experimental: /experiment|avant[- ]garde|oulipo|unconventional (?:form|format|punctuation|grammar)|breaks? (?:the )?rules/i,
  dialogueHeavy: /dialogue[- ]heavy|talky|mostly dialogue|conversation[- ]driven/i,
  slowBurn: /slow[- ]burn|slow pacing|gradual|patient|deliberate pacing/i,
  episodic: /episodic|picaresque|anthology|vignette/i,
  multiPov: /multi(?:ple)?[- ]?(?:pov|perspective|narrator|viewpoint)|alternating|rotating|epistolary|rashomon|omniscient/i,
  ambiguousIntent: /intentional(?:ly)? (?:ambig|vague|unclear)|leave(?:s)? (?:it )?(?:unexplained|unsaid)/i,
};

const REASON_LABELS = {
  fragmented: 'fragmented structure',
  nonlinear: 'non-linear chronology',
  unreliable: 'unreliable narration',
  surreal: 'surreal / dream-logic',
  clinical: 'a clinical, detached register',
  stream: 'stream-of-consciousness',
  deliberateRepetition: 'deliberate repetition',
  minimalist: 'minimalist prose',
  maximalist: 'maximalist prose',
  lyrical: 'lyrical prose',
  noResolution: 'a deliberately unresolved ending',
  experimental: 'experimental form',
  dialogueHeavy: 'dialogue-heavy writing',
  slowBurn: 'slow-burn pacing',
  episodic: 'episodic structure',
  multiPov: 'multiple perspectives',
  ambiguousIntent: 'intentional ambiguity',
};

const FICTION = { nonFiction: false, scenes: true, characterArc: true, plot: true, dialogue: true };
const NO_NARRATIVE = { nonFiction: true, scenes: false, characterArc: false, plot: false, dialogue: false };

/** What each form reasonably expects. Used so absent features are only "missing" where they belong. */
const FORM_TRAITS = {
  novel: FICTION,
  'short-story': FICTION,
  'prose-fiction': FICTION,
  'fan-fiction': FICTION,
  screenplay: { ...FICTION, interiority: false },
  'stage-play': { ...FICTION, interiority: false },
  'comic-script': { ...FICTION },
  'interactive-narrative': FICTION,
  'game-writing': FICTION,
  'experimental-text': { nonFiction: false, scenes: false, characterArc: false, plot: false, dialogue: false },
  poetry: { nonFiction: false, scenes: false, characterArc: false, plot: false, dialogue: false },
  'prose-poem': { nonFiction: false, scenes: false, characterArc: false, plot: false, dialogue: false },
  lyrics: { nonFiction: false, scenes: false, characterArc: false, plot: false, dialogue: false },
  journal: NO_NARRATIVE,
  memoir: { nonFiction: true, scenes: true, characterArc: false, plot: false, dialogue: false },
  'personal-essay': NO_NARRATIVE,
  essay: NO_NARRATIVE,
  report: NO_NARRATIVE,
  'news-narrative': NO_NARRATIVE,
  'investigative-piece': NO_NARRATIVE,
  'documentary-script': NO_NARRATIVE,
  'narrative-nonfiction': { nonFiction: true, scenes: true, characterArc: false, plot: false, dialogue: false },
  speech: NO_NARRATIVE,
  'worldbuilding-document': NO_NARRATIVE,
  'epistolary-form': { nonFiction: false, scenes: false, characterArc: false, plot: false, dialogue: false },
};

const FORM_LABELS = { 'prose-fiction': 'Prose', unknown: 'Unknown' };

function detectForm(profile, text) {
  const declared = profile.identity.format;
  if (declared) {
    const hit = resolveTerms([declared]).find((e) => e.kind === 'form');
    if (hit) return { id: hit.id, label: hit.name, source: 'profile' };
    const lower = declared.toLowerCase();
    const loose = Object.keys(FORM_TRAITS).find((id) => lower.includes(id.replace(/-/g, ' ')));
    if (loose) return { id: loose, label: declared, source: 'profile' };
  }
  if (text && text.trim().length > 40) {
    const g = inferForm(text);
    if (g.confidence >= 0.55) return { id: g.id, label: g.label, source: 'text', confidence: g.confidence };
  }
  return { id: 'prose-fiction', label: FORM_LABELS['prose-fiction'], source: 'default' };
}

function detectPov(profile) {
  const s = `${profile.style.pov} ${profile.style.prose}`.toLowerCase();
  if (/omniscient/.test(s)) return 'omniscient';
  if (/objective|camera/.test(s)) return 'objective';
  if (/second/.test(s)) return 'second';
  if (/first/.test(s)) return 'first';
  if (/third/.test(s)) return 'third';
  return null;
}

function detectTense(profile) {
  const s = profile.style.tense.toLowerCase();
  if (/mixed|shift|both/.test(s)) return 'mixed';
  if (/present/.test(s)) return 'present';
  if (/past/.test(s)) return 'past';
  return null;
}

export function interpretProfile(rawProfile, { text = '' } = {}) {
  const profile = normalizeProfile(rawProfile);
  const corpus = profileCorpus(profile);
  const flags = Object.fromEntries(Object.keys(FLAG_PATTERNS).map((k) => [k, false]));
  const reasons = {};
  for (const [flag, re] of Object.entries(FLAG_PATTERNS)) {
    for (const { field, text: t } of corpus) {
      const m = t.match(re);
      if (m) {
        flags[flag] = true;
        reasons[flag] ??= `your profile mentions "${t.length > 60 ? m[0] : t}" (${field})`;
        break;
      }
    }
  }

  const form = detectForm(profile, text);
  const traits = FORM_TRAITS[form.id] ?? FICTION;
  const pov = detectPov(profile);
  const tense = detectTense(profile);

  // Form-level reasons so "journal" explains why plot is not expected, etc.
  const formReason = form.source === 'profile' ? `this project is a ${form.label.toLowerCase()}` : `this reads like a ${form.label.toLowerCase()}`;

  const abnormal = profile.deliberateAbnormalities.join(' ').toLowerCase();
  const listed = (re) => re.test(abnormal);
  const firstOf = (pairs) => pairs.find(([cond]) => cond)?.[1] ?? false;
  const poetic = ['poetry', 'prose-poem', 'lyrics'].includes(form.id);

  // Each tolerance is false, or the key of the first reason that makes the pattern plausible on purpose.
  const tolerance = {
    tenseShift: firstOf([[flags.stream, 'stream'], [flags.fragmented, 'fragmented'], [flags.nonlinear, 'nonlinear'], [tense === 'mixed', 'mixedTense'], [listed(/tense/), 'listed']]),
    povShift: firstOf([[flags.multiPov, 'multiPov'], [pov === 'omniscient', 'omniscient'], [flags.stream, 'stream'], [flags.fragmented, 'fragmented'], [flags.experimental, 'experimental'], [listed(/pov|perspective|narrator|viewpoint/), 'listed']]),
    repetition: firstOf([[flags.deliberateRepetition, 'deliberateRepetition'], [flags.stream, 'stream'], [flags.lyrical, 'lyrical'], [poetic || form.id === 'speech', 'formRepeats'], [listed(/repeat|repetit/), 'listed']]),
    longSentences: firstOf([[flags.stream, 'stream'], [flags.maximalist, 'maximalist'], [flags.lyrical, 'lyrical'], [flags.experimental, 'experimental'], [listed(/long sentence|run-?on/), 'listed']]),
    fragments: firstOf([[flags.fragmented, 'fragmented'], [flags.minimalist, 'minimalist'], [flags.stream, 'stream'], [flags.experimental, 'experimental'], [poetic, 'formRepeats'], [listed(/fragment/), 'listed']]),
    contradiction: firstOf([[flags.unreliable, 'unreliable'], [flags.surreal, 'surreal'], [flags.multiPov, 'multiPov']]),
    impossibleEvents: firstOf([[flags.surreal, 'surreal']]),
    slowPace: firstOf([[flags.slowBurn, 'slowBurn'], [flags.minimalist, 'minimalist'], [flags.lyrical, 'lyrical'], [flags.episodic, 'episodic']]),
  };

  /** Reason NIE can quote back to the writer when it treats something as deliberate (null if it should not). */
  const why = (kind) => {
    const key = tolerance[kind];
    if (!key) return null;
    if (key === 'listed') return 'you listed this as deliberate in your profile';
    if (key === 'mixedTense') return 'your profile says the tense is mixed';
    if (key === 'omniscient') return 'your profile says the narration is omniscient';
    if (key === 'formRepeats') return `${form.label.toLowerCase()} often leans on this`;
    return reasons[key] ?? `your profile points to ${REASON_LABELS[key] ?? key}`;
  };
  const tolerates = (kind) => Boolean(tolerance[kind]);

  return {
    profile,
    form: { ...form, traits },
    formReason,
    flags,
    reasons,
    reasonLabels: REASON_LABELS,
    pov,
    tense,
    tolerance,
    tolerates,
    why,
    /** True when the *project* has declared something deliberate about this subject. */
    declaredDeliberate: (re) => re.test(abnormal) || re.test(profile.authorialIntent.join(' ').toLowerCase()),
    /** Clinical register: ornate language is worth discussing rather than assumed good. */
    watchesOrnateLanguage: flags.clinical && !flags.lyrical,
  };
}
