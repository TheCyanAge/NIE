import { clip, fnv1a } from '../util/text.js';

/**
 * The Idea Board: ideas the writer kept (from NIE, or their own notes). It lives inside the project, so it is
 * isolated, listed in the project's storage prefix, and removed with the project. NIE never edits the writer's own notes.
 */

export const MAX_BOARD = 200;
export const MAX_IDEA_CHARS = 700;

export const ideaId = (text) => `idea_${fnv1a(String(text).toLowerCase().replace(/\s+/g, ' ').trim())}`;
// An item is found by its id or by what its text says now (so editing the writer's own idea does not let a duplicate in).
const matches = (item, id) => item.id === id || ideaId(item.text) === id;

export function emptyBrainstorm() {
  return { kind: 'auto', detectedKind: null, lastLens: null, shown: [], board: [] };
}

export function normalizeBrainstorm(raw) {
  const base = emptyBrainstorm();
  if (!raw || typeof raw !== 'object') return base;
  const board = Array.isArray(raw.board)
    ? raw.board
        .filter((i) => i && typeof i.text === 'string' && i.text.trim())
        .map((i) => ({
          id: typeof i.id === 'string' ? i.id : ideaId(i.text),
          text: clip(i.text.trim(), MAX_IDEA_CHARS),
          lens: typeof i.lens === 'string' ? i.lens : null,
          kind: typeof i.kind === 'string' ? i.kind : null,
          source: i.source === 'writer' ? 'writer' : 'nie',
          note: typeof i.note === 'string' ? clip(i.note, 400) : '',
          createdAt: Number(i.createdAt) || Date.now(),
        }))
        .slice(-MAX_BOARD)
    : [];
  return {
    kind: typeof raw.kind === 'string' ? raw.kind : 'auto',
    detectedKind: typeof raw.detectedKind === 'string' ? raw.detectedKind : null,
    lastLens: typeof raw.lastLens === 'string' ? raw.lastLens : null,
    shown: Array.isArray(raw.shown) ? raw.shown.filter((s) => typeof s === 'string').slice(-400) : [],
    board,
  };
}

/** @returns {{ added: boolean, item: object }} */
export function addToBoard(project, { text, lens = null, kind = null, source = 'nie', note = '' }) {
  const t = clip(String(text ?? '').replace(/\s+/g, ' ').trim(), MAX_IDEA_CHARS);
  if (!t) return { added: false, item: null };
  const id = ideaId(t);
  const existing = project.brainstorm.board.find((i) => matches(i, id));
  if (existing) return { added: false, item: existing };
  const item = { id, text: t, lens, kind, source: source === 'writer' ? 'writer' : 'nie', note: String(note ?? ''), createdAt: Date.now() };
  project.brainstorm.board.push(item);
  if (project.brainstorm.board.length > MAX_BOARD) project.brainstorm.board.splice(0, project.brainstorm.board.length - MAX_BOARD);
  return { added: true, item };
}

export function removeFromBoard(project, id) {
  const i = project.brainstorm.board.findIndex((x) => matches(x, id));
  if (i >= 0) project.brainstorm.board.splice(i, 1);
  return i >= 0;
}

/** Edit the writer's own note on an item, or the text of an idea they wrote themselves. */
export function updateBoardItem(project, id, patch) {
  const item = project.brainstorm.board.find((x) => x.id === id);
  if (!item) return null;
  if (typeof patch.text === 'string' && patch.text.trim()) item.text = clip(patch.text.replace(/\s+/g, ' ').trim(), MAX_IDEA_CHARS);
  if (typeof patch.note === 'string') item.note = clip(patch.note.trim(), 400);
  return item;
}

export const isOnBoard = (project, id) => project.brainstorm.board.some((x) => matches(x, id));

/** A short block for prompts so the model builds on what was kept instead of repeating it. */
export function boardToPromptBlock(project, maxChars = 800) {
  const items = project.brainstorm?.board ?? [];
  if (!items.length) return '';
  const lines = items.slice(-12).map((i) => `- ${clip(i.text, 160)}${i.note ? ` (writer's note: ${clip(i.note, 80)})` : ''}`);
  return clip(`The writer kept these ideas. Build on them; do not repeat them:\n${lines.join('\n')}`, maxChars);
}

export function boardToMarkdown(project) {
  const items = project.brainstorm?.board ?? [];
  const lines = [`# Idea Board: ${project.title}`, ''];
  if (!items.length) lines.push('_Nothing kept yet._');
  for (const i of items) {
    lines.push(`- ${i.text}${i.note ? `  \n  _Note: ${i.note}_` : ''}`);
  }
  return lines.join('\n') + '\n';
}

/** Plain-chat view of the board: "bring up memory". */
export function boardToChat(project) {
  const items = project.brainstorm.board;
  if (!items.length) return "Your Idea Board is empty. Tell me \"remember this\" about an idea, or tap the star on any idea I give you, and it will be kept here for this project.";
  const shown = items.slice(-12);
  return [
    `Here is what's on your Idea Board${items.length > shown.length ? ` (the latest ${shown.length} of ${items.length})` : ''}:`,
    shown.map((i) => `- ${i.text}${i.note ? ` (your note: ${i.note})` : ''}`).join('\n'),
    'Pick one and say "let\'s develop this idea" if you want to go deeper.',
  ].join('\n\n');
}
