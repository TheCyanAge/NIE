import { createApp } from './ui/app.js';
import { mountScan } from './ui/views/scan.js';
import { mountBrainstorm } from './ui/views/brainstorm.js';
import { mountRead } from './ui/views/read.js';
import { mountProjects } from './ui/views/projects.js';
import { mountSettings } from './ui/views/settings.js';
import { createTour } from './ui/tour.js';
import { startInputGuard } from './ui/recovery.js';
import { mountStatus } from './ui/status.js';
import { openSetup } from './ui/setup.js';
import { $, $$ } from './ui/dom.js';

/**
 * Startup is deliberately cheap: build the UI immediately. The offline model starts in the background in the desktop
 * layer and NIE reports its status as it changes; nothing here waits for it.
 */
const app = createApp();
window.NIE_APP = app; // handy for DevTools and tests

const applyTheme = () => (document.documentElement.dataset.theme = app.prefs.theme === 'light' ? 'light' : 'dark');
applyTheme();
app.on('prefs', ({ key }) => key === 'theme' && applyTheme());

const tour = createTour(app);
const views = {
  scan: mountScan($('#view-scan'), app),
  brainstorm: mountBrainstorm($('#view-brainstorm'), app),
  read: mountRead($('#view-read'), app),
  projects: mountProjects($('#view-projects'), app),
  settings: mountSettings($('#view-settings'), app, { startTour: () => tour.start() }),
};
mountStatus(app);

function showView(view) {
  for (const s of $$('.view')) s.hidden = s.dataset.view !== view;
  for (const b of $$('.nav-btn')) b.setAttribute('aria-current', b.dataset.view === view ? 'page' : 'false');
  document.body.dataset.mode = view;
  requestAnimationFrame(() => { if (!tour.isActive() && !document.querySelector('dialog[open]')) views[view]?.focus?.(); });
}
app.on('view', showView);
for (const b of $$('.nav-btn')) b.addEventListener('click', () => app.setView(b.dataset.view));
showView(app.view);

const paintProject = () => { $('#project-name').textContent = app.project.title; document.title = `${app.project.title} — Narrative Integrity Engine`; };
app.on('project', paintProject);
app.on('projects', paintProject);
app.on('profile', paintProject);
paintProject();
$('#project-chip').addEventListener('click', () => app.setView('projects'));
$('#brand').addEventListener('click', (e) => { e.preventDefault(); app.setView('scan'); });
$('#help-tour').addEventListener('click', () => tour.start());

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && /^[1-5]$/.test(e.key)) {
    e.preventDefault();
    app.setView(['scan', 'brainstorm', 'read', 'projects', 'settings'][Number(e.key) - 1]);
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && app.view === 'scan') { e.preventDefault(); views.scan.runScan(); }
});

window.NIE_DESKTOP?.onMenu((cmd) => {
  if (cmd === 'tour') tour.start();
  else if (cmd === 'open-file') { app.setView('read'); $('#dropzone')?.click(); }
  else if (cmd === 'about') app.setView('settings');
});

const guardMs = Number(new URLSearchParams(location.search).get('guardMs')) || 1500; // tests shorten this
startInputGuard(app, { getInput: () => views[app.view]?.primaryInput?.() ?? null, isTourActive: () => tour.isActive(), intervalMs: guardMs });
window.NIE_OPEN_SETUP = (opts) => openSetup(app, opts);

// First run: a brand-new Untitled project is immediately usable. Offer the tour unless the writer turned it off.
if (app.prefs.tourOnStartup !== false) setTimeout(() => tour.start(), 600);
