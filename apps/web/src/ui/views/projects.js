import { h, clear, fmtDate, pageHead } from '../dom.js';
import { words } from '../../engine/util/text.js';
import { openSetup } from '../setup.js';

/** Projects: create (genuinely fresh), open, rename, delete (removes every trace of that project's context). */
export function mountProjects(root, app) {
  const list = h('ul', { class: 'project-list', id: 'project-list' });
  const newBtn = h('button', { class: 'btn btn-primary', id: 'new-project', 'data-tour': 'new-project', onclick: () => {
    app.createProject();
    app.setView('scan');
    openSetup(app, { isNew: true });
  } }, 'New project');
  root.append(h('div', { class: 'projects' },
    pageHead({ eyebrow: 'Projects', title: 'Your stories', sub: 'Each project has its own story, profile, rules, notes and conversation. A new project starts completely fresh, and deleting one removes everything that belongs to it. NIE\'s general knowledge of storytelling is not affected.', actions: [newBtn] }),
    list));

  function render() {
    clear(list);
    const entries = app.store.list();
    for (const e of entries) {
      const p = app.store.load(e.id);
      const active = e.id === app.project.id;
      const wc = p ? words(p.storyText).length : 0;
      list.append(h('li', { class: `project ${active ? 'is-active' : ''}`, dataset: { projectId: e.id } },
        h('div', { class: 'project-main' },
          h('strong', { class: 'project-title' }, e.title), active ? h('span', { class: 'tag tag-active' }, 'Open') : null,
          h('div', { class: 'muted small' }, `${wc.toLocaleString()} words · ${p?.rules.length ?? 0} rules · edited ${fmtDate(e.updatedAt)}`)),
        h('div', { class: 'project-actions' },
          active ? h('button', { class: 'btn btn-sm', onclick: () => openSetup(app, {}) }, 'Profile…') : h('button', { class: 'btn btn-sm', onclick: () => { app.openProject(e.id); app.setView('scan'); } }, 'Open'),
          h('button', { class: 'btn btn-sm', onclick: () => rename(e) }, 'Rename'),
          h('button', { class: 'btn btn-sm btn-danger', onclick: () => confirmDelete(e) }, 'Delete…'))));
    }
  }

  function rename(e) {
    const dlg = h('dialog', { class: 'dialog' }, h('form', { method: 'dialog', class: 'dialog-body' },
      h('h2', {}, 'Rename project'),
      h('input', { class: 'input', name: 'title', value: e.title, 'aria-label': 'Project name', required: true }),
      h('div', { class: 'dialog-actions end' }, h('button', { class: 'btn btn-primary', value: 'ok' }, 'Rename'), h('button', { class: 'btn btn-quiet', value: 'cancel' }, 'Cancel'))));
    dlg.addEventListener('close', () => {
      const title = dlg.querySelector('input').value.trim();
      if (dlg.returnValue === 'ok' && title) { app.renameProject(e.id, title); render(); }
      dlg.remove();
    });
    document.body.append(dlg);
    dlg.showModal();
    dlg.querySelector('input').select();
  }

  function confirmDelete(e) {
    const dlg = h('dialog', { class: 'dialog', role: 'alertdialog' }, h('form', { method: 'dialog', class: 'dialog-body' },
      h('h2', {}, `Delete “${e.title}”?`),
      h('p', {}, 'This permanently removes its story text, rules, profile, notes and conversation. It cannot be undone.'),
      h('div', { class: 'dialog-actions end' }, h('button', { class: 'btn btn-danger', value: 'delete', id: 'confirm-delete' }, 'Delete project'), h('button', { class: 'btn btn-quiet', value: 'cancel', autofocus: true }, 'Keep it'))));
    dlg.addEventListener('close', () => { if (dlg.returnValue === 'delete') { app.deleteProject(e.id); render(); } dlg.remove(); });
    document.body.append(dlg);
    dlg.showModal();
  }

  app.on('project', render);
  app.on('projects', render);
  app.on('view', (v) => v === 'projects' && render());
  render();
  return { focus: () => newBtn.focus(), primaryInput: () => null };
}
