import { h, clear, download, toast } from '../dom.js';
import { addToBoard, boardToMarkdown, removeFromBoard, updateBoardItem } from '../../engine/project/board.js';
import { emptyWorkingPremise } from '../../engine/intent/intent.js';
import { kindLabel } from '../../engine/brainstorm/lenses.js';
import { resolveKind } from '../../engine/brainstorm/ideas.js';
import { clip } from '../../engine/util/text.js';

/**
 * The Idea Board: what the writer kept, plus "what NIE understands" about the project so far.
 * Everything here belongs to the active project (it is read from `app.project` on every render), and nothing on it is
 * ever written or rewritten by NIE: the writer adds, edits and removes.
 */
export function mountBoard(app, { onDevelop, onChange = null }) {
  const count = h('span', { class: 'tag', id: 'board-count' }, '0');
  const understands = h('div', { class: 'understands', id: 'understands', 'data-testid': 'understands' });
  const list = h('ul', { class: 'board-list', id: 'board-list' });
  const add = h('input', { class: 'input', id: 'board-add', type: 'text', maxlength: '600', placeholder: 'Add your own idea or note…', 'aria-label': 'Add your own idea to the Idea Board' });
  const addForm = h('form', { class: 'board-add', onsubmit: (e) => { e.preventDefault(); addOwn(); } }, add, h('button', { class: 'btn', type: 'submit' }, 'Add'));
  const copy = h('button', { class: 'btn btn-quiet', id: 'board-copy', type: 'button', onclick: copyAll }, 'Copy');
  const save = h('button', { class: 'btn btn-quiet', id: 'board-download', type: 'button', onclick: () => download(`${slug(app.project.title)}-idea-board.md`, boardToMarkdown(app.project), 'text/markdown') }, 'Download .md');

  const el = h('aside', { class: 'board', id: 'idea-board', 'data-testid': 'idea-board', 'aria-label': 'Idea Board' },
    h('div', { class: 'board-head' }, h('div', {}, h('span', { class: 'eyebrow' }, 'Idea Board'), h('h2', { class: 'board-title' }, 'What you\'re keeping')), count),
    list, addForm, h('div', { class: 'row board-actions' }, copy, save),
    h('div', { class: 'board-sep' }),
    h('span', { class: 'eyebrow' }, 'What NIE understands'), understands);

  const slug = (s) => String(s || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';

  function persist() {
    app.saveNow();
    refresh();
    onChange?.(); // the stars on idea cards in the chat follow the board
  }

  function addOwn() {
    const text = add.value.trim();
    if (!text) return;
    const { added } = addToBoard(app.project, { text, source: 'writer' });
    add.value = '';
    if (!added) toast('That idea is already on your board.');
    persist();
  }

  async function copyAll() {
    const md = boardToMarkdown(app.project);
    try {
      await navigator.clipboard.writeText(md);
      toast('Idea Board copied.', { kind: 'ok' });
    } catch {
      toast('Could not reach the clipboard. Use Download instead.', { kind: 'warn' });
    }
  }

  function item(i) {
    const note = h('input', { class: 'input board-note-input', type: 'text', maxlength: '400', value: i.note ?? '', placeholder: 'A note to yourself…', 'aria-label': 'Note on this idea', hidden: true,
      onkeydown: (e) => { if (e.key === 'Enter') { updateBoardItem(app.project, i.id, { note: note.value }); persist(); } else if (e.key === 'Escape') { note.hidden = true; } } });
    const body = h('p', { class: 'board-text' }, i.text);
    const edit = i.source === 'writer'
      ? h('button', { class: 'link', type: 'button', onclick: () => {
          const ta = h('textarea', { class: 'input', rows: '3', 'aria-label': 'Edit your idea' }, i.text);
          const done = h('button', { class: 'btn', type: 'button', onclick: () => { updateBoardItem(app.project, i.id, { text: ta.value }); persist(); } }, 'Save');
          body.replaceWith(h('div', { class: 'board-edit' }, ta, done));
        } }, 'Edit')
      : null;
    return h('li', { class: 'board-item', dataset: { ideaId: i.id } },
      h('div', { class: 'board-meta' }, h('span', { class: 'tag' }, i.source === 'writer' ? 'Yours' : 'From NIE'), i.kind ? h('span', { class: 'tag' }, kindLabel(i.kind)) : null),
      body,
      i.note ? h('p', { class: 'board-note' }, `Note: ${i.note}`) : null,
      note,
      h('div', { class: 'board-item-actions' },
        h('button', { class: 'link', type: 'button', onclick: () => onDevelop(i.text) }, 'Develop'),
        edit,
        h('button', { class: 'link', type: 'button', onclick: () => { note.hidden = !note.hidden; if (!note.hidden) note.focus(); } }, i.note ? 'Edit note' : 'Note'),
        h('button', { class: 'link link-danger', type: 'button', 'aria-label': 'Remove from Idea Board', onclick: () => { removeFromBoard(app.project, i.id); persist(); } }, 'Remove')));
  }

  function renderUnderstands() {
    const p = app.project;
    const wp = p.conversation.workingPremise ?? {};
    const bs = p.brainstorm;
    const { kind, source } = resolveKind(p, '', null);
    const rows = [];
    rows.push(['Working on', source === 'default' ? 'Not sure yet' : `${kindLabel(kind)}${source === 'chosen' ? '' : ' (from what you said)'}`]);
    if (wp.summary) rows.push(['Premise', clip(wp.summary, 150)]);
    if (wp.characters?.length) rows.push(['Cast', wp.characters.slice(0, 5).join(', ')]);
    if (wp.settings?.length) rows.push(['Setting', wp.settings.slice(0, 3).join(', ')]);
    if (wp.themes?.length) rows.push(['Themes', wp.themes.slice(0, 4).join(', ')]);
    if (wp.reality && wp.reality !== 'unclear') rows.push(['Reads as', [wp.reality, ...(wp.modes ?? []).slice(0, 2)].join(', ')]);
    const hasAny = Boolean(wp.summary || wp.characters?.length || wp.themes?.length || bs.detectedKind);
    clear(understands).append(
      h('dl', { class: 'info-grid' }, ...rows.flatMap(([k, v]) => [h('dt', { class: 'info-k' }, k), h('dd', { class: 'info-v' }, v)])),
      hasAny
        ? h('div', { class: 'row' }, h('span', { class: 'muted small' }, 'Wrong? Tell me, or '), h('button', { class: 'link', id: 'understands-reset', type: 'button', onclick: () => {
            app.project.conversation.workingPremise = emptyWorkingPremise();
            app.project.brainstorm.detectedKind = null;
            persist();
          } }, 'clear what I understand'))
        : h('p', { class: 'muted small' }, 'Nothing yet. Tell me what you are working on and I will keep track of it here, for this project only.'));
  }

  function refresh() {
    const items = app.project.brainstorm.board;
    count.textContent = String(items.length);
    clear(list);
    if (!items.length) list.append(h('li', { class: 'board-empty muted small' }, 'Nothing kept yet. Tap the star on any idea, or say "remember this".'));
    for (const i of [...items].reverse()) list.append(item(i));
    copy.disabled = save.disabled = !items.length;
    renderUnderstands();
  }

  refresh();
  return { el, refresh };
}
