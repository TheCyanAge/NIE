import { SECTION_TARGET_CHARS, splitSections } from '../reading/sections.js';
import { passagesOf } from './sources.js';
import { mindOf } from './state.js';

/**
 * What NIE holds for one project, counted from what is really there: the status line's numbers and the list the writer can look through and remove from.
 * Only counts and the writer's own words; nothing here claims NIE "understands" or "remembers" more than it recorded.
 */

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const isNote = (id) => id.endsWith(':note');
/** Statements and Idea Board items (kept ideas included) can be removed from here; everything else is managed where the writer made it. */
const removeWith = (p) => (p.source === 'said' ? 'forgetSaid' : (p.source === 'board' || p.source === 'kept') && !isNote(p.id) ? 'removeFromBoard' : null);

function tally(passages, project) {
  const by = {};
  for (const p of passages) by[p.source] = (by[p.source] ?? 0) + 1;
  const ideas = new Set(passages.filter((p) => p.source === 'set-aside').map((p) => p.id.split(':')[1]));
  const notes = project?.readingNotes?.sections && typeof project.readingNotes.sections === 'object' ? Object.keys(project.readingNotes.sections).length : 0;
  return {
    said: mindOf(project).said.length,
    sheet: (by.sheet ?? 0) + (by.extra ?? 0),
    setAside: ideas.size,
    kept: by.kept ?? 0,
    board: passages.filter((p) => p.source === 'board' && !isNote(p.id)).length,
    characters: by.character ?? 0,
    themes: by.theme ?? 0,
    motifs: by.motif ?? 0,
    timeline: by.timeline ?? 0,
    rules: by.rule ?? 0,
    deliberate: by.deliberate ?? 0,
    premise: by.premise ?? 0,
    profile: by.profile ?? 0,
    notes,
  };
}

/** A text longer than this is not cut into sections just to count them (that costs tens of milliseconds each time the list is shown); its count is estimated from its length and said to be "about". */
const COUNT_EXACTLY_UP_TO = 300000;

/** { n, approx }: the sections the long text is read in (`reading/sections.js`). */
function sectionsIn(storyText) {
  if (typeof storyText !== 'string' || !storyText.trim()) return { n: 0, approx: false };
  if (storyText.length > COUNT_EXACTLY_UP_TO) return { n: Math.ceil(storyText.length / SECTION_TARGET_CHARS), approx: true };
  return { n: splitSections(storyText).length, approx: false };
}

function summaryOf(c) {
  const parts = [
    c.said && `${plural(c.said, 'thing')} you've said`,
    c.sheet && `${plural(c.sheet, 'part')} of the idea you're on`,
    c.setAside && `${plural(c.setAside, 'idea')} set aside`,
    c.kept && `${plural(c.kept, 'kept idea')}`,
    c.board && `${plural(c.board, 'other Idea Board item')}`,
    c.characters && plural(c.characters, 'character'),
    c.themes && plural(c.themes, 'theme'),
    c.motifs && plural(c.motifs, 'motif'),
    c.timeline && plural(c.timeline, 'timeline entry', 'timeline entries'),
    c.rules && plural(c.rules, 'rule of yours', 'rules of yours'),
    c.deliberate && `${plural(c.deliberate, 'thing')} you marked as deliberate`,
    c.profile && `${plural(c.profile, 'project setting')}`,
    c.premise && 'your working premise',
  ].filter(Boolean);
  const text = c.textSections ? ` I read your long text (${c.textSectionsApprox ? 'about ' : ''}${plural(c.textSections, 'section')}) separately${c.notes ? ` and keep ${plural(c.notes, 'reading note')} on it` : ''}.` : '';
  if (!parts.length) return `NIE holds nothing for this project yet.${text}`;
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
  return `NIE holds ${list} for this project.${text}`;
}

/**
 * @returns {{ counts: object, items: { id, source, where, text, removable: boolean, removeWith: 'forgetSaid'|'removeFromBoard'|null, by?: 'nie' }[], summary: string }}
 *   `items` is the writer's material in the order of `passagesOf`; `removable` says whether `forgetItem` (record.js) can remove it.
 */
export function describeMind(project) {
  const passages = passagesOf(project);
  const sections = sectionsIn(project?.storyText);
  const counts = { ...tally(passages, project), textSections: sections.n, ...(sections.approx ? { textSectionsApprox: true } : {}) };
  const items = passages.map((p) => {
    const how = removeWith(p);
    return { id: p.id, source: p.source, where: p.where, text: p.text, removable: how !== null, removeWith: how, ...(p.by ? { by: p.by } : {}) };
  });
  return { counts, items, summary: summaryOf(counts) };
}

/** The small version for the status line: how many things NIE holds, and how many of them are statements of the writer's. */
export function mindStats(project) {
  const passages = passagesOf(project);
  const c = tally(passages, project);
  return { said: c.said, total: passages.length, notes: c.notes, line: passages.length ? `NIE holds ${plural(passages.length, 'thing')} for this project` : 'NIE holds nothing for this project yet' };
}
