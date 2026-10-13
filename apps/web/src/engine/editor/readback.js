import { clip } from '../util/text.js';
import { isPraiseOpener } from '../orchestrator/variety.js';
import { groundNames } from './ground.js';
import { nameWithAliases, rankedCast, standouts, styleLine, termsLine } from './findings.js';
import { sentenceSpans } from './sentences.js';
import { speaksAboutTheWriter } from './voice.js';

/**
 * The read-back of a pasted text that comes with no question.
 *
 * What went wrong without it: a 10,000-word paste with no question got a vague reply in the third person ("How does the writer maintain the reader's curiosity...")
 * that showed nothing had been grasped. This frame is built from COUNTS: what NIE did, how the text is built, how it is written, which names and terms come back,
 * up to three things that stand out (each citing sections), and one specific question in the second person. Every number is a measurement from the Analysis;
 * the only prose that is not a template is the overview the model made from its own notes, and that is used only if it is grounded in the text.
 *
 * It never says "the writer", never praises, never gives an order, and says it read the text only if notes made by the model say so.
 */

const MAX_LINES = 12;
const num = (n) => Math.round(n).toLocaleString('en-US');
const plural = (n, one, many = `${one}s`) => `${num(n)} ${n === 1 ? one : many}`;
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const quoted = (s) => `"${String(s).replace(/["“”]/g, '').replace(/\s+/g, ' ').trim()}"`;

const perOf = (notes) => (Array.isArray(notes) ? notes : Array.isArray(notes?.per) ? notes.per : Array.isArray(notes?.notes) ? notes.notes : []);

/** (1) What NIE did, in counts. It says "read" only for sections a model actually made notes on (or that were short enough to be their own note). */
function didLine(a, notes) {
  const N = a.sectionCount;
  const per = perOf(notes);
  const modelRead = per.filter((n) => n && n.by === 'model').length;
  const read = Math.min(N, per.filter((n) => n && (n.by === 'model' || n.by === 'text')).length);
  const covers = a.covered.complete ? '' : `; the counts cover the first ${num(a.covered.sections)} sections`;
  const size = `${plural(N, 'section')}, ${plural(a.words, 'word')}`;
  if (modelRead > 0 && read >= N) return { text: `I read it one section at a time and kept a short note on each (${size}${covers}).`, modelRead, read };
  if (modelRead > 0) return { text: `I read ${num(read)} of its ${plural(N, 'section')} one at a time and kept a short note on each (${plural(a.words, 'word')} in all${covers}).`, modelRead, read };
  return { text: `I counted and measured it (${size}${covers}); I did not read it section by section with the language model.`, modelRead: 0, read };
}

/** The sources an overview may be checked against: the capitalised words, numbers, names, terms and headings of the text itself. */
function sourcesOf(a) {
  const proper = (a.vocab?.proper ?? []).map((w) => w[0].toUpperCase() + w.slice(1)).join(' | ');
  const numbers = [...(a.vocab?.numbers ?? []), a.sectionCount, a.words, a.covered?.sections, a.covered?.words].filter((n) => Number.isFinite(n)).join(' | ');
  const names = (a.cast ?? []).flatMap((c) => [c.name, ...c.aliases]);
  const terms = (a.terms ?? []).map((t) => t.term);
  const titles = (a.sections ?? []).map((s) => s.title).filter(Boolean);
  return [proper, numbers, ...names, ...terms, ...titles];
}

/** (2) The model's overview, kept only as far as it is grounded: sentences with a name or number the text lacks go, and so does any sentence that talks about the writer in the third person. */
function overviewLine(a, overview, modelRead) {
  const result = { text: '', kept: 0, removed: 0 };
  const raw = typeof overview === 'string' ? overview.replace(/\s+/g, ' ').trim() : '';
  if (!raw || modelRead <= 0) return result;
  const grounded = groundNames(raw.slice(0, 1500), { sources: sourcesOf(a), sections: a.sectionCount });
  const sentences = sentenceSpans(grounded.text).map((s) => s.text.trim()).filter(Boolean);
  const safe = sentences.filter((s) => !speaksAboutTheWriter(s) && !isPraiseOpener(s) && !/\?\s*$/.test(s));
  result.removed = grounded.removed.length + (sentences.length - safe.length);
  const kept = safe.slice(0, 3);
  let text = kept.join(' ');
  if (text.length > 420) text = kept.slice(0, 2).join(' ');
  if (text.length > 420) text = '';
  if (!text) return result;
  result.text = `What it is, from my notes: ${text}`;
  result.kept = kept.length;
  return result;
}

/** (3) How it is built. */
function builtLine(a) {
  const parts = [];
  const N = a.sectionCount;
  const M = a.covered.sections;
  const median = Math.round(a.pacing?.median ?? 0);
  if (N === 1) parts.push(`a single section of ${plural(a.words, 'word')}`);
  else if (N && median) parts.push(a.covered.complete ? `${plural(N, 'section')} with a median length of ${num(median)} words` : `${plural(N, 'section')}, the first ${num(M)} with a median length of ${num(median)} words`);
  const units = a.pacing?.units ?? [];
  const stamps = a.timeline?.stamps ?? [];
  const structure = (a.style?.structure ?? []).filter((x) => typeof x === 'string' && !(stamps.length >= 3 && /^time stamps/.test(x)) && !/^one unbroken block/.test(x));
  const headed = units.length >= 2;
  if (headed) {
    const first = units.find((u) => u.title);
    const last = [...units].reverse().find((u) => u.title);
    parts.push(`${plural(units.length, 'part')} under headings${first && last && first !== last ? ` (${quoted(clip(first.title, 40))} to ${quoted(clip(last.title, 40))})` : ''}`);
  }
  if (structure.length === 1 && structure[0] === 'no headings') parts.push('no headings were found');
  else for (const x of structure) if (x !== 'no headings' && !(headed && /^(?:chapter headings|titled sections|headings marked with #|numbered parts)$/.test(x))) parts.push(x);
  if (stamps.length >= 3) parts.push(`${plural(stamps.length, 'dated entry', 'dated entries')}, from ${quoted(stamps[0].label)} in section ${stamps[0].section + 1} to ${quoted(stamps.at(-1).label)} in section ${stamps.at(-1).section + 1}`);
  return parts.length ? `How it is built: ${parts.join('; ')}.` : '';
}

/** (4) How it is written. The caller's own description of the style is used when it is safe to say to the writer; otherwise the measured line. */
function writtenLine(a, style) {
  const given = typeof style === 'string' ? style.replace(/\s+/g, ' ').trim() : '';
  if (given && !speaksAboutTheWriter(given) && !/\b(?:great|wonderful|beautiful|compelling|impressive|masterful|brilliant|gripping|vivid)\b/i.test(given)) {
    const sentences = sentenceSpans(given).map((s) => s.text.trim());
    let out = '';
    for (const s of sentences) {
      if ((out ? `${out} ${s}` : s).length > 520) break;
      out = out ? `${out} ${s}` : s;
    }
    if (out) return out;
  }
  const measured = styleLine(a);
  return measured ? `How it is written: ${measured}.` : '';
}

/** (5) Who and what comes back. */
function namesLine(a) {
  const M = a.covered.sections;
  const top = rankedCast(a).slice(0, 3);
  if (!top.length) return '';
  return `Names that keep coming back: ${top.map((c) => `${nameWithAliases(c)} (${c.sections.length} of ${M} ${M === 1 ? 'section' : 'sections'}, from section ${c.first + 1} to ${c.last + 1})`).join(', ')}.`;
}

function termsSentence(a) {
  const list = termsLine(a);
  return list ? `Terms that recur: ${list}.` : '';
}

/**
 * @param {{ analysis: object, notes?: object|Array|null, overview?: string, style?: string, project?: object|null }} o
 *   `notes`: the reading notes (an array of note|null, or { per }); `overview`: the model's overview made from them; `style`: describeStyle(profile) or any
 *   measured description of the style. `project` is accepted for the caller's convenience and not needed.
 * @returns {{ lines: string[], question: string|null, stats: object }}
 */
export function readbackFrame(opts) {
  const { analysis, notes = null, overview = '', style = '' } = opts && typeof opts === 'object' ? opts : {};
  const a = analysis;
  const stats = { lines: 0, standouts: [], sections: 0, covered: 0, words: 0, modelRead: 0, read: 0, overview: 'none', overviewRemoved: 0 };
  if (!a || typeof a !== 'object' || !Array.isArray(a.sections) || !a.sections.length || !a.covered) return { lines: [], question: null, stats };

  const did = didLine(a, notes);
  const ov = overviewLine(a, overview, did.modelRead);
  const found = standouts(a);
  const picked = [];
  for (const f of found) {
    if (picked.length >= 3) break;
    if (picked.some((p) => p.instrument === f.instrument)) continue;
    picked.push(f);
  }
  const lines = [
    did.text,
    ov.text,
    builtLine(a),
    writtenLine(a, style),
    namesLine(a),
    termsSentence(a),
    ...picked.map((f) => `${cap(f.text)}.`),
  ]
    .filter(Boolean)
    .filter((l) => !speaksAboutTheWriter(l) && !isPraiseOpener(l))
    .slice(0, MAX_LINES);

  const question = picked[0]?.question ?? null;
  return {
    lines,
    question,
    stats: {
      lines: lines.length,
      standouts: picked.map((f) => f.id),
      sections: a.sectionCount,
      covered: a.covered.sections,
      words: a.words,
      modelRead: did.modelRead,
      read: did.read,
      overview: ov.text ? (ov.removed ? 'partly' : 'kept') : overview && did.modelRead > 0 ? 'dropped' : 'none',
      overviewRemoved: ov.removed,
    },
  };
}

