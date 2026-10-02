import { clip, deepClone } from '../util/text.js';

/**
 * A project profile is NIE's contract for interpreting one story.
 * Everything is optional: NIE is useful with an empty profile and gets sharper as it fills in.
 * The writer's *rules* (what must or must not happen in the text) live in `project.rules`, not here:
 * the profile says how to interpret the writing; the rules say what NIE must check it against.
 */
export function createEmptyProfile() {
  return {
    identity: { title: '', author: '', format: '' },
    genre: { primary: '', secondary: [] },
    tone: [],
    audience: '',
    style: { prose: '', pov: '', tense: '', sentence: '', dialogue: '', description: '' },
    narrative: { chronology: '', reliability: '', structure: '', pacing: '' },
    authorialIntent: [],
    deliberateAbnormalities: [],
    instructions: '',
  };
}

const toStr = (v) => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim());
const toList = (v) => {
  if (Array.isArray(v)) return v.map(toStr).filter(Boolean);
  if (typeof v === 'string') return v.split(/[\n;]+|,(?![^()]*\))/).map(toStr).filter(Boolean);
  return [];
};

/** Coerce arbitrary input into a valid profile, never carrying over anything not in `input`. */
export function normalizeProfile(input = {}) {
  const base = createEmptyProfile();
  const p = input ?? {};
  const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, toStr(obj?.[k])]));
  return {
    identity: pick(p.identity, Object.keys(base.identity)),
    genre: { primary: toStr(p.genre?.primary), secondary: toList(p.genre?.secondary) },
    tone: toList(p.tone),
    audience: toStr(p.audience),
    style: pick(p.style, Object.keys(base.style)),
    narrative: pick(p.narrative, Object.keys(base.narrative)),
    authorialIntent: toList(p.authorialIntent),
    deliberateAbnormalities: toList(p.deliberateAbnormalities),
    instructions: toStr(p.instructions),
  };
}

export function isProfileEmpty(profile) {
  return JSON.stringify(normalizeProfile(profile)) === JSON.stringify(createEmptyProfile());
}

/** A flat list of {field, text} pairs: the corpus the interpreter reads for intent signals. */
export function profileCorpus(profile) {
  const p = normalizeProfile(profile);
  const out = [];
  const add = (field, text) => text && out.push({ field, text });
  add('format', p.identity.format);
  add('genre', p.genre.primary);
  p.genre.secondary.forEach((g) => add('genre', g));
  p.tone.forEach((t) => add('tone', t));
  add('audience', p.audience);
  for (const [k, v] of Object.entries(p.style)) add(`style.${k}`, v);
  for (const [k, v] of Object.entries(p.narrative)) add(`narrative.${k}`, v);
  p.authorialIntent.forEach((t) => add('authorialIntent', t));
  p.deliberateAbnormalities.forEach((t) => add('deliberateAbnormalities', t));
  add('instructions', p.instructions);
  return out;
}

/** Compact, prompt-ready summary of the profile. Returns '' for an empty profile. */
export function profileToPromptBlock(profile, maxChars = 1500) {
  const p = normalizeProfile(profile);
  const lines = [];
  const add = (label, v) => {
    const s = Array.isArray(v) ? v.join('; ') : v;
    if (s) lines.push(`${label}: ${s}`);
  };
  add('Title', p.identity.title);
  add('Form', p.identity.format);
  add('Genre', [p.genre.primary, ...p.genre.secondary].filter(Boolean).join(', '));
  add('Tone', p.tone);
  add('Audience', p.audience);
  add('Prose style', p.style.prose);
  add('POV', p.style.pov);
  add('Tense', p.style.tense);
  add('Sentences', p.style.sentence);
  add('Dialogue', p.style.dialogue);
  add('Description', p.style.description);
  add('Chronology', p.narrative.chronology);
  add('Narrator reliability', p.narrative.reliability);
  add('Structure', p.narrative.structure);
  add('Pacing', p.narrative.pacing);
  add("Author's intent", p.authorialIntent);
  add('Deliberate abnormalities (do not "fix")', p.deliberateAbnormalities);
  add('Writer instructions', p.instructions);
  return clip(lines.join('\n'), maxChars);
}

export const cloneProfile = (p) => normalizeProfile(deepClone(p));
