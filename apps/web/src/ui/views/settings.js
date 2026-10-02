import { h, $, clear, toast, pageHead } from '../dom.js';

/**
 * Settings: where the writer chooses NIE's model, checks for updates, controls the tour and manages data.
 * The model selector lives HERE, not in the working modes. In the app the writer only ever talks to "NIE".
 */
export function mountSettings(root, app, { startTour }) {
  const section = (title, ...kids) => h('section', { class: 'panel settings-section' }, h('h2', {}, title), ...kids);

  // ── AI ────────────────────────────────────────────────────────────────────
  const aiStatus = h('p', { id: 'settings-ai-status', class: 'status-line', 'aria-live': 'polite' });
  const modelInfo = h('div', { id: 'model-info', class: 'info-grid' });
  const modelSelect = h('select', { class: 'select', id: 'model-select', 'aria-label': 'Offline model' });
  const restartBtn = h('button', { class: 'btn', id: 'restart-model', onclick: async () => { toast('Restarting the offline model…'); await window.NIE_LOCAL?.restart(); refreshModel(); } }, 'Restart offline model');
  const autoDl = h('input', { type: 'checkbox', id: 'auto-download', checked: true, onchange: (e) => window.NIE_LOCAL?.setAutoDownload?.(e.target.checked) });

  const onEnabled = h('input', { type: 'checkbox', id: 'online-enabled' });
  const onUrl = h('input', { class: 'input', id: 'online-url', placeholder: 'https://api.example.com/v1', 'aria-label': 'Online provider base URL' });
  const onModel = h('input', { class: 'input', id: 'online-model', placeholder: 'model name', 'aria-label': 'Online model name' });
  const onKey = h('input', { class: 'input', id: 'online-key', type: 'password', placeholder: 'API key (stored only on this computer)', autocomplete: 'off', 'aria-label': 'API key' });
  const onMsg = h('p', { class: 'muted small', id: 'online-msg', 'aria-live': 'polite' });

  // ── Updates ───────────────────────────────────────────────────────────────
  const upMsg = h('p', { id: 'update-status', class: 'status-line', 'aria-live': 'polite' }, 'Checking…');
  const upCheck = h('button', { class: 'btn', id: 'update-check', onclick: async () => { upMsg.textContent = 'Checking for updates…'; paintUpdate(await window.NIE_UPDATER.check()); } }, 'Check for updates');
  const upInstall = h('button', { class: 'btn btn-primary', id: 'update-install', hidden: true, onclick: () => window.NIE_UPDATER.install() }, 'Restart to install');
  function paintUpdate(s) {
    upMsg.textContent = s?.message || 'Up to date.';
    upInstall.hidden = s?.state !== 'downloaded';
    upCheck.disabled = s?.state === 'unconfigured' || s?.state === 'checking' || s?.state === 'downloading';
  }

  // ── Tour / application ────────────────────────────────────────────────────
  const tourToggle = h('input', { type: 'checkbox', id: 'tour-toggle', onchange: (e) => app.setPref('tourOnStartup', e.target.checked) });
  const theme = h('select', { class: 'select', id: 'theme-select', 'aria-label': 'Theme', onchange: (e) => app.setPref('theme', e.target.value) }, h('option', { value: 'dark' }, 'Dark'), h('option', { value: 'light' }, 'Light'));
  const obs = h('input', { type: 'checkbox', id: 'settings-obs', onchange: (e) => app.setPref('showObservations', e.target.checked) });
  const diag = h('input', { type: 'checkbox', id: 'diag-toggle', onchange: (e) => app.setPref('diagnostics', e.target.checked) });

  root.append(h('div', { class: 'settings' },
    pageHead({ eyebrow: 'Settings', title: 'Make NIE yours', sub: 'Choose how NIE thinks offline, check for updates, and control the tour.' }),
    section('AI', h('p', { class: 'muted' }, 'You always talk to NIE. Online, it can use an online model; offline, it automatically uses the model installed with the app.'), aiStatus,
      h('div', { class: 'row' }, h('label', { class: 'field inline' }, h('span', { class: 'field-label' }, 'Offline model'), modelSelect), restartBtn),
      modelInfo,
      h('label', { class: 'check' }, autoDl, ' Download the offline model automatically if it is missing'),
      h('h3', {}, 'Online model (optional)'),
      h('label', { class: 'check' }, onEnabled, ' Use an online model when I\'m connected'),
      h('div', { class: 'grid2' }, h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Base URL (OpenAI-compatible)'), onUrl), h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Model'), onModel)),
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'API key'), onKey),
      h('div', { class: 'row' }, h('button', { class: 'btn btn-primary', id: 'online-save', onclick: saveOnline }, 'Save'), h('button', { class: 'btn', id: 'online-test', onclick: testOnline }, 'Test connection'), onMsg)),
    section('Updates', upMsg, h('div', { class: 'row' }, upCheck, upInstall)),
    section('Tour', h('label', { class: 'check' }, tourToggle, ' Show this tour on startup'), h('div', { class: 'row' }, h('button', { class: 'btn', id: 'start-tour', onclick: () => startTour() }, 'Start the tour'))),
    section('Application', h('div', { class: 'row' }, h('label', { class: 'field inline' }, h('span', { class: 'field-label' }, 'Theme'), theme)),
      h('label', { class: 'check' }, obs, ' Show NIE\'s general observations in Full Scan (rule checking is always on)'),
      h('label', { class: 'check' }, diag, ' Developer diagnostics (logs UI problems to the console)'),
      h('p', { class: 'muted small', id: 'about-line' })),
    section('Your data', h('p', { class: 'muted' }, 'Everything is stored on this computer. Erasing removes every project and all of its context; NIE\'s general storytelling knowledge is unaffected.'),
      h('button', { class: 'btn btn-danger', id: 'erase-all', onclick: confirmErase }, 'Erase all projects and data…'))));

  function confirmErase() {
    const dlg = h('dialog', { class: 'dialog', role: 'alertdialog' }, h('form', { method: 'dialog', class: 'dialog-body' },
      h('h2', {}, 'Erase everything?'), h('p', {}, 'Every project, its story text, rules, profile, notes and conversations will be permanently removed.'),
      h('div', { class: 'dialog-actions end' }, h('button', { class: 'btn btn-danger', value: 'erase', id: 'confirm-erase' }, 'Erase everything'), h('button', { class: 'btn btn-quiet', value: 'cancel', autofocus: true }, 'Cancel'))));
    dlg.addEventListener('close', () => { if (dlg.returnValue === 'erase') { app.eraseEverything(); toast('All projects erased.', { kind: 'ok' }); } dlg.remove(); });
    document.body.append(dlg);
    dlg.showModal();
  }

  async function saveOnline() {
    await app.engine.online.save({ enabled: onEnabled.checked, baseUrl: onUrl.value, model: onModel.value, apiKey: onKey.value || undefined });
    onKey.value = '';
    onMsg.textContent = 'Saved.';
    refreshOnline();
    app.emit('status', app.engine.status());
  }
  async function testOnline() {
    onMsg.textContent = 'Testing…';
    await saveOnline();
    const r = await app.engine.online.test();
    onMsg.textContent = r.ok ? 'Connected.' : `Could not connect: ${r.error}`;
  }
  async function refreshOnline() {
    const c = (await app.engine.online.refresh?.()) ?? app.engine.online.config();
    onEnabled.checked = c.enabled; onUrl.value = c.baseUrl; onModel.value = c.model;
    onKey.placeholder = c.hasKey ? 'A key is saved. Type to replace it.' : 'API key (stored only on this computer)';
    if (c.hasKey && c.keyStoredSecurely === false) onMsg.textContent = 'This key is stored unencrypted on this computer.';
  }

  async function refreshModel() {
    const st = app.engine.status();
    aiStatus.textContent = st.route === 'online' ? 'NIE is using an online model.' : st.local.message;
    aiStatus.dataset.state = st.route === 'online' ? 'online' : st.local.state;
    const bridge = window.NIE_LOCAL;
    clear(modelInfo);
    if (!bridge) {
      clear(modelSelect).append(h('option', {}, 'Qwen2.5 3B Instruct (Q4_K_M)'));
      modelSelect.disabled = true; restartBtn.disabled = true; autoDl.disabled = true;
      modelInfo.append(h('p', { class: 'muted small' }, 'The offline model runs inside the desktop app. In a browser, NIE uses its built-in guidance unless you connect a llama-server (add ?llama=http://127.0.0.1:8080 to the address).'));
      return;
    }
    const info = await bridge.info().catch(() => null);
    if (!info) return;
    clear(modelSelect);
    for (const m of info.catalog) modelSelect.append(h('option', { value: m.id, selected: m.id === info.model.id ? true : null }, m.label));
    const rows = [['Model file', info.model.exists ? info.model.path : `${info.model.fileName} (not installed)`], ['Model check', info.model.validation ? (info.model.validation.ok ? `OK (${(info.model.validation.size / 1073741824).toFixed(2)} GB)` : info.model.validation.problems.map((p) => p.message).join(' ')) : 'Not installed'], ['Runtime', info.runtime.ok ? 'Complete' : info.runtime.problems.map((p) => p.message).join(' ')]];
    if (st.local.state === 'failed' && st.local.detail) rows.push(['Problem', st.local.detail]);
    if (st.local.state === 'starting' && st.local.detail) rows.push(['Progress', st.local.detail]);
    for (const [k, v] of rows) modelInfo.append(h('div', { class: 'info-k' }, k), h('div', { class: 'info-v' }, v));
  }

  async function refreshAbout() {
    const line = $('#about-line', root);
    if (!window.NIE_DESKTOP) { line.textContent = 'Narrative Integrity Engine (browser build).'; return; }
    const i = await window.NIE_DESKTOP.info().catch(() => null);
    if (i) line.textContent = `Narrative Integrity Engine ${i.version} · ${i.platform} · Electron ${i.electron}`;
  }

  function syncPrefs() {
    tourToggle.checked = app.prefs.tourOnStartup !== false;
    theme.value = app.prefs.theme;
    obs.checked = app.prefs.showObservations;
    diag.checked = app.prefs.diagnostics;
  }

  app.on('status', refreshModel);
  app.on('prefs', syncPrefs);
  app.on('view', (v) => { if (v === 'settings') { refreshModel(); refreshOnline(); syncPrefs(); } });
  if (window.NIE_UPDATER) {
    window.NIE_UPDATER.onStatus(paintUpdate);
    window.NIE_UPDATER.status().then(paintUpdate);
  } else {
    upMsg.textContent = 'Updates are available in the installed desktop app.';
    upCheck.disabled = true;
  }
  syncPrefs(); refreshModel(); refreshOnline(); refreshAbout();
  return { focus: () => {}, primaryInput: () => null };
}
