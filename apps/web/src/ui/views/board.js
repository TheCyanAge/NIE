import { h, clear, download, toast } from '../dom.js';
import { addToBoard, boardToMarkdown, removeFromBoard, updateBoardItem } from '../../engine/project/board.js';
import { emptyWorkingPremise } from '../../engine/intent/intent.js';
import { kindLabel } from '../../engine/brainstorm/lenses.js';
import { resolveKind } from '../../engine/brainstorm/ideas.js';
import { clip, estimateTokens, words } from '../../engine/util/text.js';
import { splitSections } from '../../engine/reading/sections.js';
import { sectionKey } from '../../engine/reading/notes.js';
import { describeMind, forgetItem } from '../../engine/mind/index.js';

/**
 * The Idea Board: what the writer kept, plus "what NIE understands" about the project so far.
 * Everything here belongs to the active project (it is read from `app.project` on every render), and nothing on it is
 * ever written or rewritten by NIE: the writer adds, edits and removes.
 * "Everything NIE holds" lists what the project's mind holds (the writer's own words, with where each came from) and lets the writer remove what they like.
 */
export function mountBoard(app, { onDevelop, onChange = null, onAsk = null }) {
  const count = h('span', { class: 'tag', id: 'board-count' }, '0');
  const understands = h('div', { class: 'understands', id: 'understands', 'data-testid': 'understands' });
  const idea = h('div', { class: 'idea-sheet', id: 'idea-sheet', 'data-testid': 'idea-sheet' });
  const holds = h('div', { class: 'holds', id: 'holds', 'data-testid': 'holds' });
  const list = h('ul', { class: 'board-list', id: 'board-list' });
  const add = h('input', { class: 'input', id: 'board-add', type: 'text', maxlength: '600', placeholder: 'Add your own idea or note…', 'aria-label': 'Add your own idea to the Idea Board' });
  const addForm = h('form', { class: 'board-add', onsubmit: (e) => { e.preventDefault(); addOwn(); } }, add, h('button', { class: 'btn', type: 'submit' }, 'Add'));
  const copy = h('button', { class: 'btn btn-quiet', id: 'board-copy', type: 'button', onclick: copyAll }, 'Copy');
  const save = h('button', { class: 'btn btn-quiet', id: 'board-download', type: 'button', onclick: () => download(`${slug(app.project.title)}-idea-board.md`, boardToMarkdown(app.project), 'text/markdown') }, 'Download .md');

  const el = h('aside', { class: 'board', id: 'idea-board', 'data-testid': 'idea-board', 'aria-label': 'Idea Board' },
    h('div', { class: 'board-head' }, h('div', {}, h('span', { class: 'eyebrow' }, 'Idea Board'), h('h2', { class: 'board-title' }, 'What you\'re keeping')), count),
    list, addForm, h('div', { class: 'row board-actions' }, copy, save),
    h('div', { class: 'board-sep' }),
    h('span', { class: 'eyebrow' }, 'The idea we\'re on'), idea,
    h('div', { class: 'board-sep' }),
    h('span', { class: 'eyebrow' }, 'What NIE understands'), understands,
    h('div', { class: 'board-sep' }),
    h('span', { class: 'eyebrow' }, 'Everything NIE holds'), holds);

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

  // The panel is redrawn often; cutting a long text into sections is quick but not free, so remember the last one.
  let lastText = null;
  let lastSections = [];
  const sectionsOf = (text) => {
    if (text !== lastText) [lastText, lastSections] = [text, splitSections(text)];
    return lastSections;
  };

  /**
   * The idea NIE is following: what the writer has said about it, part by part and in their own words (nothing here is NIE's wording), what is still open,
   * and the choice to keep it. The writer can fix or remove any part, keep the idea now, take a keep back, or change how often NIE asks.
   */
  function renderIdea() {
    const agent = app.orchestrator?.agent;
    clear(idea);
    if (!agent) return;
    const d = agent.describe(app.project);
    const refreshAll = () => { app.saveNow(); refresh(); onChange?.(); };
    if (!d.filled.length && !d.extra.length && !d.shelf.length) {
      idea.append(h('p', { class: 'muted small' }, 'Tell me about what you are making and I will follow it here, in your words. When I have enough, I will ask if you want it kept.'));
      return;
    }
    const title = [d.kindLabel ? d.kindLabel[0].toUpperCase() + d.kindLabel.slice(1) : null, d.formLabel, ...d.genreLabels].filter(Boolean).join(' · ');
    if (title) idea.append(h('p', { class: 'idea-sheet-title' }, title));
    const rows = d.filled.map((f) => {
      const row = h('li', { class: 'sheet-row', dataset: { slot: f.id } });
      const show = () => {
        clear(row).append(
          h('span', { class: 'sheet-label' }, f.label), h('span', { class: 'sheet-value' }, f.value),
          h('span', { class: 'sheet-actions' },
            h('button', { class: 'link', type: 'button', onclick: edit }, 'Edit'),
            h('button', { class: 'link link-danger', type: 'button', 'aria-label': `Remove ${f.label}`, onclick: () => { agent.clear(app.project, f.id); refreshAll(); } }, 'Remove')));
      };
      const edit = () => {
        const ta = h('textarea', { class: 'input', rows: '2', maxlength: '220', 'aria-label': `Your words for ${f.label}` }, f.value);
        clear(row).append(h('span', { class: 'sheet-label' }, f.label), ta,
          h('span', { class: 'sheet-actions' },
            h('button', { class: 'btn', type: 'button', onclick: () => { agent.edit(app.project, f.id, ta.value); refreshAll(); } }, 'Save'),
            h('button', { class: 'link', type: 'button', onclick: show }, 'Cancel')));
        ta.focus();
      };
      show();
      return row;
    });
    if (rows.length) idea.append(h('ul', { class: 'sheet-list' }, ...rows));
    if (d.extra.length) idea.append(h('ul', { class: 'sheet-list sheet-extra' }, ...d.extra.map((e, i) => h('li', { class: 'sheet-row' }, h('span', { class: 'sheet-label' }, 'Also'), h('span', { class: 'sheet-value' }, e),
      h('span', { class: 'sheet-actions' }, h('button', { class: 'link link-danger', type: 'button', 'aria-label': 'Remove this detail', onclick: () => { agent.clearExtra(app.project, i); refreshAll(); } }, 'Remove'))))));
    const open = d.open.filter((o) => o.core).slice(0, 5).map((o) => o.label);
    if (rows.length && open.length) idea.append(h('p', { class: 'muted small sheet-open' }, `Still open: ${open.join(', ')}.`));
    if (d.canKeep) {
      idea.append(h('div', { class: 'row sheet-keep' },
        h('button', { class: 'btn', id: 'idea-keep', type: 'button', disabled: d.kept, onclick: () => { const r = agent.commitNow(app.project); toast(r.reply, { kind: 'ok' }); refreshAll(); } }, d.kept ? 'Kept' : d.everKept ? 'Update what I kept' : 'Keep this idea'),
        d.everKept ? h('button', { class: 'link', id: 'idea-undo', type: 'button', onclick: () => { agent.undo(app.project); toast('Took that back.', { kind: 'ok' }); refreshAll(); } }, 'Take it back') : null));
    }
    const mode = h('select', { class: 'input', id: 'agent-mode', 'aria-label': 'How often NIE asks questions', onchange: () => { agent.setMode(app.project, mode.value); app.saveNow(); } },
      ...[['auto', 'Now and then'], ['interview', 'After most things I say'], ['quiet', 'Not at all']].map(([v, l]) => h('option', { value: v, selected: d.mode === v }, l)));
    idea.append(h('label', { class: 'row sheet-mode' }, h('span', { class: 'muted small' }, 'NIE asks questions: '), mode));
    if (d.shelf.length) {
      idea.append(h('div', { class: 'sheet-shelf' }, h('p', { class: 'muted small' }, `Set aside: ${d.shelf.length} earlier idea${d.shelf.length > 1 ? 's' : ''}${d.shelf.at(-1).preview ? ` (${d.shelf.at(-1).preview}…)` : ''}`),
        onAsk ? h('button', { class: 'link', type: 'button', onclick: () => onAsk('Bring back the earlier idea.') }, 'Bring back the latest') : null));
    }
  }

  function renderUnderstands() {
    const p = app.project;
    const wp = p.conversation.workingPremise ?? {};
    const bs = p.brainstorm;
    const { kind, source } = resolveKind(p, '', null);
    const rows = [];
    rows.push(['Working on', source === 'default' ? 'Not sure yet' : `${kindLabel(kind)}${source === 'chosen' ? '' : ' (from what you said)'}`]);
    const story = p.storyText ?? '';
    if (story.trim()) {
      const n = words(story).length;
      const secs = estimateTokens(story) <= 1400 ? [] : sectionsOf(story);
      const kept = secs.filter((x) => p.readingNotes?.sections?.[sectionKey(x)]).length;
      rows.push(['Your text', estimateTokens(story) <= 1400
        ? `${n.toLocaleString('en-US')} words: short enough to be read whole, and each reply says if it wasn't`
        : `${n.toLocaleString('en-US')} words in ${secs.length} sections: ${kept && kept === secs.length ? 'NIE has read every section, one at a time, and keeps a short note on each' : kept ? `NIE has read ${kept} of them, one at a time, and keeps a short note on each` : 'ask about the text as a whole and NIE reads it section by section first (once, with progress), then keeps notes'}; for a single fact it looks closely at the passages that match, and every reply says what it looked at`]);
    }
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

  const HOLDS_SHOWN = 120;
  let confirmingForget = false;
  let holdsOpen = false; // the list stays open (or closed) as the writer left it while the chat goes on

  /** What the project's mind holds, counted from what is really there, and the writer's way to look through it and remove from it. Only this project's. */
  function renderHolds() {
    const d = describeMind(app.project);
    const said = d.items.filter((i) => i.source === 'said');
    const shown = d.items.slice(0, HOLDS_SHOWN);
    const row = (i) => h('li', { class: 'holds-item', dataset: { id: i.id } },
      h('span', { class: 'holds-text' }, clip(i.text, 220)),
      h('span', { class: 'holds-where muted small' }, `${i.where}${i.by === 'nie' ? ' · NIE\'s idea, kept by you' : ''}`),
      i.removable ? h('button', { class: 'link holds-remove', type: 'button', 'aria-label': `Forget: ${clip(i.text, 60)}`, onclick: () => { forgetItem(app.project, i.id); persist(); } }, 'Remove') : null);
    const forget = said.length
      ? (confirmingForget
          ? h('div', { class: 'row holds-confirm' }, h('span', { class: 'small' }, `Forget the ${said.length} thing${said.length === 1 ? '' : 's'} you've said?`),
              h('button', { class: 'link link-danger', id: 'holds-forget-yes', type: 'button', onclick: () => { for (const i of said) forgetItem(app.project, i.id); confirmingForget = false; persist(); } }, 'Yes, forget them'),
              h('button', { class: 'link', type: 'button', onclick: () => { confirmingForget = false; renderHolds(); } }, 'No'))
          : h('button', { class: 'link', id: 'holds-forget', type: 'button', onclick: () => { confirmingForget = true; renderHolds(); } }, 'Forget what I\'ve said in chat'))
      : null;
    const details = d.items.length
      ? h('details', { class: 'holds-details', id: 'holds-details', open: holdsOpen, ontoggle: (e) => { holdsOpen = e.currentTarget.open; } }, h('summary', {}, `Look through it (${d.items.length})`),
          h('ul', { class: 'holds-list' }, ...shown.map(row)),
          d.items.length > shown.length ? h('p', { class: 'muted small' }, `Showing ${shown.length} of ${d.items.length}.`) : null)
      : null;
    clear(holds).append(
      h('p', { class: 'holds-summary small', id: 'holds-summary' }, d.summary),
      details,
      forget,
      h('p', { class: 'muted small' }, 'These are your own words and settings, kept for this project only. Another project cannot see them, and deleting this project deletes them.'));
  }

  function refresh() {
    const items = app.project.brainstorm.board;
    count.textContent = String(items.length);
    clear(list);
    if (!items.length) list.append(h('li', { class: 'board-empty muted small' }, 'Nothing kept yet. Tap the star on any idea, or say "remember this".'));
    for (const i of [...items].reverse()) list.append(item(i));
    copy.disabled = save.disabled = !items.length;
    renderIdea();
    renderUnderstands();
    renderHolds();
  }

  refresh();
  return { el, refresh };
}
