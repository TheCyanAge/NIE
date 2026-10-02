import { clip, fnv1a } from '../util/text.js';

/**
 * A flag is not automatically a mistake. Every finding carries a class that says how seriously to take it.
 */
export const CLASSES = ['hard-conflict', 'likely-issue', 'possible-issue', 'stylistic-observation', 'intentional-possibility', 'strength'];

export const CLASS_LABELS = {
  'hard-conflict': 'Hard conflict',
  'likely-issue': 'Likely issue',
  'possible-issue': 'Possible issue',
  'stylistic-observation': 'Stylistic observation',
  'intentional-possibility': 'Could be intentional',
  strength: 'Strength',
};

export const CLASS_HELP = {
  'hard-conflict': 'Clearly breaks something you established for this project.',
  'likely-issue': 'Strong evidence of an inconsistency.',
  'possible-issue': 'Worth a look, but may be fine.',
  'stylistic-observation': 'A pattern in the writing; not necessarily a problem.',
  'intentional-possibility': 'Looks unusual, but your profile suggests it may be deliberate.',
  strength: 'Something that is working.',
};

export function mk(f) {
  const quote = f.quote ? clip(f.quote.replace(/\s+/g, ' ').trim(), 220) : '';
  const finding = {
    detector: f.detector,
    category: f.category,
    class: f.class,
    title: f.title,
    message: f.message,
    quote,
    start: f.start ?? null,
    end: f.end ?? null,
    sceneIndex: f.sceneIndex ?? null,
    question: f.question ?? null,
    confidence: f.confidence ?? 0.5,
    key: f.key ?? quote,
    source: f.source ?? 'rules',
    meta: f.meta ?? {},
  };
  finding.id = fnv1a(`${finding.detector}|${finding.key.toLowerCase()}|${finding.start ?? ''}`);
  return finding;
}

/** Turn a flagged finding into an "intentional possibility" because the profile explains it. */
export function asIntentional(f, reason, noun) {
  return {
    ...f,
    class: 'intentional-possibility',
    message: `${f.message} I'm treating this as a possible ${noun} choice, because ${reason}.`,
    question: f.question ?? 'Is this deliberate? If so, mark it and I\'ll stop raising it.',
    meta: { ...f.meta, demotedFrom: f.class, reason },
  };
}
