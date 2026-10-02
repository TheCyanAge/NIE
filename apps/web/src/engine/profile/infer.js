import { KNOWLEDGE } from '../knowledge/index.js';
import { normalizeProfile, createEmptyProfile } from './profile.js';
import { inferForm } from '../intent/form.js';

/**
 * "Tell NIE what you're making": turn a plain description into suggested profile fields.
 * Suggestions only. The writer reviews and edits everything before it is saved, and nothing here invents a genre
 * the description did not point to.
 */

const TONES = ['dark', 'hopeful', 'absurd', 'melancholic', 'clinical', 'bleak', 'tender', 'funny', 'suspenseful', 'eerie', 'warm', 'bitter', 'whimsical', 'gritty', 'romantic', 'lonely', 'ominous', 'playful', 'wry'];

/** Library entries of a kind that the text names outright (name or alias), in order of appearance. No fuzzy guessing. */
function named(text, kind, exclude = () => false) {
  const lower = text.toLowerCase();
  const hits = [];
  for (const e of KNOWLEDGE) {
    if (e.kind !== kind || exclude(e)) continue;
    for (const label of [e.name, ...e.aka]) {
      const l = label.toLowerCase();
      if (l.length < 4) continue;
      const m = new RegExp(`(?<![\\p{L}])${l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}])`, 'iu').exec(lower);
      if (m) {
        hits.push({ e, at: m.index, len: l.length });
        break;
      }
    }
  }
  // Prefer the more specific phrase when one name contains another (e.g. "psychological horror" over "horror").
  const kept = hits.filter((h) => !hits.some((o) => o !== h && o.len > h.len && o.at <= h.at && o.at + o.len >= h.at + h.len));
  return kept.sort((a, b) => a.at - b.at).map((h) => h.e);
}

export function inferProfileFromDescription(description) {
  const text = String(description ?? '').trim();
  const profile = createEmptyProfile();
  const notes = [];
  if (!text) return { profile, notes };
  const lower = text.toLowerCase();

  // Form
  const explicitForm = ['screenplay', 'short story', 'novel', 'stage play', 'poem', 'essay', 'report', 'journal', 'memoir', 'graphic novel', 'comic', 'documentary', 'article'].find((f) => new RegExp(`\\b${f}\\b`).test(lower));
  if (explicitForm) profile.identity.format = explicitForm === 'article' ? 'news-style narrative' : explicitForm;
  else {
    const f = named(text, 'form')[0];
    if (f) profile.identity.format = f.name.toLowerCase();
    else {
      const g = inferForm(text);
      if (g.confidence >= 0.75) profile.identity.format = g.label.toLowerCase();
    }
  }

  // Genres: only those the description names.
  const genres = named(text, 'genre');
  if (genres[0]) profile.genre.primary = genres[0].name.toLowerCase();
  profile.genre.secondary = genres.slice(1, 3).map((e) => e.name.toLowerCase());

  // Tone
  profile.tone = TONES.filter((t) => new RegExp(`\\b${t}\\b`, 'i').test(text)).slice(0, 5);

  // POV and tense
  const pov = text.match(/\b(first|second|third)[- ]person(?:\s+(limited|omniscient|objective))?/i);
  if (pov) profile.style.pov = pov[0].toLowerCase().replace(/-/g, ' ');
  const tense = text.match(/\b(past|present)[- ]tense\b/i);
  if (tense) profile.style.tense = tense[0].toLowerCase().replace(/-/g, ' ');

  // Prose style and structure the description names.
  const style = named(text, 'style', (e) => /person|tense|narration|omniscient|objective|unreliable/.test(e.id))[0];
  if (style) profile.style.prose = style.name.toLowerCase();
  const structure = named(text, 'structure')[0];
  if (structure) profile.narrative.structure = structure.name.toLowerCase();
  if (/unreliable/i.test(text)) profile.narrative.reliability = 'unreliable narrator';
  if (/\bno (?:conventional )?(?:resolution|ending)|open[- ]ended|refuses? (?:to )?resolve/i.test(text)) profile.authorialIntent.push('The story deliberately withholds a conventional resolution.');

  const audience = text.match(/\b(?:for|aimed at|written for)\s+(children|kids|teens|young adults|adults|general readers|readers of [^.,;]+)/i);
  if (audience) profile.audience = audience[1].toLowerCase();

  const filled = [profile.identity.format, profile.genre.primary, profile.tone.length, profile.style.pov, profile.style.prose].filter(Boolean).length;
  notes.push(filled ? 'I filled in what your description pointed to. Please check each field and change anything that is off.' : "I couldn't pin anything down from that yet, so I've left the fields empty rather than guess.");
  return { profile: normalizeProfile(profile), notes };
}
