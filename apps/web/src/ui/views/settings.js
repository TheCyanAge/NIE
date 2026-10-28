import { h, $, clear, toast, pageHead } from '../dom.js';
import { KIND_LABELS, answerFromLibrary, libraryStats, libraryStatus, loadLibrary, searchScored } from '../../engine/knowledge/index.js';
import { WEB_PROVIDER_CHOICES, providerName } from '../../engine/web/bridge.js';
import { BUILTIN_SEARCH } from '../web-consent.js';

// What Web search is, in two parts: in the browser build, which has no built-in search, they are one paragraph; in the desktop app the second part is worded for "Or use your own search key" instead.
const WEB_HOW = "Web search is off until you turn it on. When it is on and you ask NIE to look something up (the Web switch next to the message box, or 'search the web for ...'), the words of that question are sent to the search service you chose, and NIE fetches some of the pages it finds. Your manuscript, your project and your earlier messages are never sent. NIE's offline model, or your online model, reads what comes back and answers with numbered sources.";
const WEB_KEYS = 'You need a key for a search service (Tavily, Brave Search, Serper), the address of a SearXNG instance, or any JSON search API you describe under Custom. The key is stored only on this computer.';
const WEB_OWN_PACK = 'If you have a key for a search service (Tavily, Brave Search, Serper), the address of a SearXNG instance, or a JSON search API you describe under Custom, use it here: the words of your question then go to that service instead of the offline encyclopedia. The key is stored only on this computer.';
const WEB_PACK_RUNS = "The offline encyclopedia on this computer answers your lookups, so nothing you ask is sent anywhere and there is nothing to agree to. NIE's built-in search is not used while it is installed.";
const WEB_OWN = 'If you have a key for a search service (Tavily, Brave Search, Serper), the address of a SearXNG instance, or a JSON search API you describe under Custom, use it here: the words of your question then go to that service, and the built-in search above is not used. The key is stored only on this computer.';

// The offline encyclopedia: what it is, in the words the writer is told (the status line, the buttons and the attribution are filled in from the desktop app's status).
const ENC_INTRO = 'A copy of the opening of tens of thousands of Wikipedia articles, stored on this computer. With it NIE can look things up with no internet and no account, and nothing you ask leaves your computer. It holds the introductions of the most-read articles only, not all of Wikipedia, and it is as old as the date shown.';
const ENC_UNAVAILABLE = 'The encyclopedia is not offered in this build yet. You can still add a file you already have.';
const ENC_NEEDS_DESKTOP = 'The offline encyclopedia needs the desktop app.';
const ENC_FIRST = 'NIE uses it first when you have not added a search key of your own; a key you add still takes over.';
const CC_BY_SA = 'https://creativecommons.org/licenses/by-sa/4.0/';
const encMb = (bytes) => `${bytes > 0 ? Math.max(1, Math.round(bytes / 1048576)).toLocaleString('en-US') : 0} MB`;

/** A link that opens in the system browser in the desktop app (the page itself never navigates away), and as an ordinary new-tab link in a browser. */
function externalLink(label, url) {
  return h('a', { href: url, target: '_blank', rel: 'noopener noreferrer', onclick: (e) => { if (!window.NIE_DESKTOP?.openExternal) return; e.preventDefault(); window.NIE_DESKTOP.openExternal(url); } }, label);
}

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
  const downloadBtn = h('button', { class: 'btn btn-primary', id: 'download-model', hidden: true, onclick: async () => { toast('Downloading the offline model…'); downloadBtn.disabled = true; await window.NIE_LOCAL?.download?.(); downloadBtn.disabled = false; refreshModel(); } }, 'Download the offline model (about 1.9 GB)');

  const onEnabled = h('input', { type: 'checkbox', id: 'online-enabled' });
  const onUrl = h('input', { class: 'input', id: 'online-url', placeholder: 'https://api.example.com/v1', 'aria-label': 'Online provider base URL' });
  const onModel = h('input', { class: 'input', id: 'online-model', placeholder: 'model name', 'aria-label': 'Online model name' });
  const onKey = h('input', { class: 'input', id: 'online-key', type: 'password', placeholder: 'API key (stored only on this computer)', autocomplete: 'off', 'aria-label': 'API key' });
  const onMsg = h('p', { class: 'muted small', id: 'online-msg', 'aria-live': 'polite' });

  // ── Web search (optional; off until the writer turns it on) ────────────────
  const webExplain = h('p', { class: 'muted', id: 'web-explain' }, `${WEB_HOW} ${WEB_KEYS}`);
  const webOn = h('input', { type: 'checkbox', id: 'web-enabled' });
  // The built-in search (Wikipedia, or NIE's own service in a build that carries one): shown in the desktop app, with the text the writer is agreeing to. Ticking the box is
  // the agreement to that service, and is saved at once (taking it back too). Which service it is, is set in paintBuiltin.
  const webBuiltin = h('input', { type: 'checkbox', id: 'web-builtin', onchange: (e) => agreeBuiltin(e.target.checked) });
  const webBuiltinHead = h('h3', { id: 'web-builtin-head' });
  const webBuiltinText = h('p', { id: 'web-builtin-text' });
  const webBuiltinLabel = h('span', { id: 'web-builtin-label' });
  const webBuiltinNote = h('p', { class: 'muted small', id: 'web-builtin-note', 'aria-live': 'polite' });
  const webBuiltinCheck = h('label', { class: 'check' }, webBuiltin, webBuiltinLabel);
  const webBuiltinBox = h('div', { class: 'web-builtin', id: 'web-builtin-box', hidden: true }, webBuiltinHead, webBuiltinText, webBuiltinCheck, webBuiltinNote);
  let builtinShown = 'wikipedia'; // the built-in service the block is about
  const webOwnText = h('p', { class: 'muted', id: 'web-own-text' }, WEB_OWN);
  const webOwn = h('div', { id: 'web-own', hidden: true }, h('h3', {}, 'Or use your own search key (optional)'), webOwnText);
  const webProvider = h('select', { class: 'select', id: 'web-provider', 'aria-label': 'Search service', onchange: () => paintWebFields() }, ...WEB_PROVIDER_CHOICES.map(([id, label]) => h('option', { value: id }, label)));
  const webKey = h('input', { class: 'input', id: 'web-key', type: 'password', placeholder: 'Search key (stored only on this computer)', autocomplete: 'off', 'aria-label': 'Search service key' });
  const webAddress = h('input', { class: 'input', id: 'web-address', placeholder: 'https://search.example.org', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'SearXNG address' });
  const webAddressField = h('label', { class: 'field', id: 'web-address-field' }, h('span', { class: 'field-label' }, 'SearXNG address'), webAddress);
  const webMethod = h('select', { class: 'select', id: 'web-custom-method', 'aria-label': 'Request method', onchange: () => paintWebFields() }, h('option', { value: 'GET' }, 'GET'), h('option', { value: 'POST' }, 'POST'));
  const webCustom = {}; // the Custom service's description, one box per field
  const customField = (name, label, placeholder, { area = false } = {}) => {
    webCustom[name] = h(area ? 'textarea' : 'input', { class: 'input', id: `web-custom-${name}`, placeholder, rows: area ? '3' : null, autocomplete: 'off', spellcheck: 'false', 'aria-label': label });
    return h('label', { class: 'field', id: `web-custom-${name}-field` }, h('span', { class: 'field-label' }, label), webCustom[name]);
  };
  const webCustomBox = h('div', { class: 'web-custom', id: 'web-custom', hidden: true },
    h('p', { class: 'muted small' }, 'Describe any JSON search API. Put {query} in the address where the search words go (and {key} or {limit} if the service needs them).'),
    customField('url', 'Address', 'https://example.com/search?q={query}'),
    h('div', { class: 'grid2' }, h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Method'), webMethod), customField('resultsPath', 'Where the results are in the reply', 'results')),
    h('div', { class: 'grid2' }, customField('headerName', 'Header that carries the key', 'Authorization'), customField('headerPrefix', 'Text before the key in that header', 'Bearer ')),
    h('div', { class: 'grid2' }, customField('titleKey', 'Title field of a result', 'title'), customField('urlKey', 'Link field of a result', 'url')),
    customField('snippetKey', 'Text field of a result', 'snippet'),
    customField('bodyTemplate', 'Body to send (POST only)', '{"q":"{query}"}', { area: true }));
  const webDetected = h('p', { id: 'web-detected', class: 'status-line', 'aria-live': 'polite' });
  const webStatus = h('p', { id: 'web-status', class: 'status-line', 'aria-live': 'polite' });
  const webMsg = h('p', { class: 'muted small', id: 'web-msg', 'aria-live': 'polite' });
  const webSave = h('button', { class: 'btn btn-primary', id: 'web-save', onclick: () => saveWeb() }, 'Save');
  const webTest = h('button', { class: 'btn', id: 'web-test', title: 'Sends one search for the word "test" to the service you chose.', onclick: testWeb }, 'Test');
  const webClearKey = h('button', { class: 'btn btn-quiet', id: 'web-clear-key', hidden: true, onclick: () => saveWeb({ clearKey: true }, 'The saved key was removed.') }, 'Remove the saved key');
  const webControls = [webOn, webBuiltin, webProvider, webKey, webAddress, webMethod, ...Object.values(webCustom), webSave, webTest, webClearKey];

  // ── Offline encyclopedia (optional; a file on this computer that web search reads first) ──────────────
  const encNeedsDesktop = app.encyclopedia.kind === 'none' ? h('p', { class: 'status-line', id: 'enc-needs-desktop' }, ENC_NEEDS_DESKTOP) : null;
  const encStatus = h('p', { id: 'enc-status', class: 'status-line', 'aria-live': 'polite' }, 'Checking…');
  const encProgress = h('progress', { id: 'enc-progress', max: '100', value: '0', 'aria-label': 'Encyclopedia download progress', hidden: true });
  const encAnnounce = h('p', { id: 'enc-announce', class: 'sr-only', 'aria-live': 'polite' }); // (heard every tenth of the download; the line above is seen at every percent)
  const encDownload = h('button', { class: 'btn btn-primary', id: 'enc-download', type: 'button', hidden: true, onclick: () => encAct(() => app.encyclopedia.download()) }, 'Download');
  const encCancel = h('button', { class: 'btn', id: 'enc-cancel', type: 'button', hidden: true, onclick: () => encAct(() => app.encyclopedia.cancel()) }, 'Cancel');
  const encRemove = h('button', { class: 'btn btn-danger', id: 'enc-remove', type: 'button', hidden: true, onclick: confirmRemoveEncyclopedia }, 'Remove…');
  const encImport = h('button', { class: 'btn', id: 'enc-import', type: 'button', onclick: () => encAct(() => app.encyclopedia.importFile(), 'The file was added.') }, 'Use a file I already have…');
  const encMsg = h('p', { class: 'muted small', id: 'enc-msg', 'aria-live': 'polite' });
  const encAttribution = h('p', { class: 'muted small', id: 'enc-attribution', hidden: true }, 'Text from Wikipedia, available under ', externalLink('CC BY-SA 4.0', CC_BY_SA), ". Each article's authors are listed in its page history on Wikipedia.");
  const encFirst = h('p', { class: 'muted', id: 'enc-first', hidden: true }, ENC_FIRST);
  let encNote = ''; // what the last action wants said (an error from the desktop app is said from its status)
  let encPending = false; // a call to the desktop app is out: nothing else can be pressed meanwhile
  let encAnnounced = -1;

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

  // ── Knowledge library ─────────────────────────────────────────────────────
  const libSummary = h('p', { id: 'library-summary', class: 'status-line', 'aria-live': 'polite' }, 'Loading NIE\'s library…');
  const libCoverage = h('div', { id: 'library-coverage', class: 'library-coverage' });
  const libInput = h('input', { class: 'input', id: 'library-search', type: 'search', placeholder: 'Search the library: a style rule, a form, a genre, a word, a work…', 'aria-label': 'Search NIE\'s built-in library', autocomplete: 'off' });
  const libResults = h('ul', { id: 'library-results', class: 'library-results' });
  let libTimer = null;
  libInput.addEventListener('input', () => { clearTimeout(libTimer); libTimer = setTimeout(paintLibraryResults, 150); });

  function paintLibrary() {
    const st = libraryStats();
    const status = libraryStatus();
    libSummary.dataset.state = status.error ? 'failed' : status.loaded ? 'ready' : 'starting';
    libSummary.textContent = status.error
      ? `NIE's full library could not be loaded (${status.error}). Core craft notes still work.`
      : status.loaded
        ? `${st.total.toLocaleString()} entries are built in and work with no internet${st.derived ? ` (${st.derived.toLocaleString()} of them are short lookup records for works listed inside other entries)` : ''}. It cannot hold everything; when something isn't in it, NIE says so.`
        : `${st.total.toLocaleString()} core entries are ready; the full library is loading…`;
    clear(libCoverage).append(...Object.entries(st.byKind).sort((a, b) => b[1] - a[1]).map(([k, n]) => h('span', { class: 'tag', title: KIND_LABELS[k] ?? k }, `${KIND_LABELS[k] ?? k}: ${n.toLocaleString()}`)));
    libCoverage.append(h('p', { class: 'muted small library-honesty' }, 'How reliable is it? It was compiled with AI assistance, checked by automatic rules and cross-checks, and spot-checked against independent sources, but it has not been fully verified entry by entry. Treat it as a reference, and check the current edition of a style guide for formal work.'));
    if (st.profileSubjects) libCoverage.append(h('p', { class: 'muted small library-profiles' }, `${st.profileSubjects} genres, forms, traditions and movements have a whole-subject profile (history, subgenres, tropes, what readers expect, how it is built, how it differs from its neighbours, landmark works, pitfalls, vocabulary). Each was written by one AI agent and then fact-checked by a second that searched for the dates, titles and "firsts"; some dates still rest on recall and are worded loosely. Ask for one by name (for example "the history of the essay"), then keep going with "tell me more".`));
    if (st.ruleGuides.length) libCoverage.append(h('p', { class: 'muted small library-guides' }, `Style rules from: ${st.ruleGuides.join(', ')}.`));
    paintLibraryResults();
  }
  function paintLibraryResults() {
    clear(libResults);
    const q = libInput.value.trim();
    if (q.length < 2) return;
    const hits = searchScored(q, { limit: 8 }).map((x) => x.entry);
    if (!hits.length) return void libResults.append(h('li', { class: 'muted small' }, 'Nothing in the built-in library matches that. NIE will say so rather than guess.'));
    for (const e of hits) {
      libResults.append(h('li', { class: 'library-hit' },
        h('div', { class: 'row' }, h('strong', {}, e.name), h('span', { class: 'tag' }, KIND_LABELS[e.kind] ?? e.kind), e.guide ? h('span', { class: 'tag' }, `${e.guide}${e.asOf ? `, ${e.asOf}` : ''}`) : null),
        h('p', { class: 'small' }, e.summary),
        e.works?.length ? h('p', { class: 'muted small' }, `Works: ${e.works.slice(0, 4).map((w) => `${w.title} (${w.author}${w.year ? `, ${w.year}` : ''})`).join('; ')}`) : null));
    }
  }

  root.append(h('div', { class: 'settings' },
    pageHead({ eyebrow: 'Settings', title: 'Make NIE yours', sub: 'Choose how NIE thinks offline, check for updates, and control the tour.' }),
    section('AI', h('p', { class: 'muted' }, 'You always talk to NIE. Online, it can use an online model; offline, it uses the offline model that runs on this computer. NIE downloads that model (about 1.9 GB) the first time it needs it, and until it is ready NIE answers from its built-in library.'), aiStatus,
      h('div', { class: 'row' }, h('label', { class: 'field inline' }, h('span', { class: 'field-label' }, 'Offline model'), modelSelect), restartBtn, downloadBtn),
      modelInfo,
      h('p', { class: 'muted small model-license' }, 'The offline model is Qwen2.5 3B Instruct from Alibaba Cloud\'s Qwen team. It is not part of NIE\'s own code: it is used under the Qwen Research License (research and non-commercial use; commercial use needs a separate licence from its authors). NIE downloads it from the model\'s official page.'),
      h('label', { class: 'check' }, autoDl, ' Download the offline model automatically if it is missing'),
      h('h3', {}, 'Online model (optional)'),
      h('label', { class: 'check' }, onEnabled, ' Use an online model when I\'m connected'),
      h('div', { class: 'grid2' }, h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Base URL (OpenAI-compatible)'), onUrl), h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Model'), onModel)),
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'API key'), onKey),
      h('div', { class: 'row' }, h('button', { class: 'btn btn-primary', id: 'online-save', onclick: saveOnline }, 'Save'), h('button', { class: 'btn', id: 'online-test', onclick: testOnline }, 'Test connection'), onMsg)),
    section('Web search',
      webExplain,
      window.NIE_WEB ? null : h('p', { class: 'status-line', id: 'web-unavailable' }, 'Web search needs the desktop app.'),
      webStatus,
      h('label', { class: 'check' }, webOn, ' Use web search when I ask NIE to look something up'),
      webBuiltinBox, webOwn,
      h('div', { class: 'grid2' }, h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Search service'), webProvider), h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Key'), webKey)),
      webDetected, webAddressField, webCustomBox,
      h('div', { class: 'row' }, webSave, webTest, webClearKey, webMsg)),
    section('Offline encyclopedia',
      h('p', { class: 'muted', id: 'enc-explain' }, ENC_INTRO),
      encNeedsDesktop, encStatus, encProgress, encAnnounce,
      h('div', { class: 'row' }, encDownload, encCancel, encRemove, encImport),
      encMsg, encAttribution, encFirst),
    section("NIE's library", h('p', { class: 'muted' }, 'Style guides and rules, usage, manuscript formats, genres with example works, forms, devices, movements, traditions and publishing norms. It is built in, so NIE can answer from it with no internet. It is reference material: NIE explains it, and only ever enforces your own rules.'),
      libSummary, libCoverage, h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Look something up'), libInput), libResults),
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

  // The service chosen decides which boxes are shown: Automatic and SearXNG take an address, only Custom takes a description of its API.
  function paintWebFields() {
    const p = webProvider.value;
    webAddressField.hidden = p !== 'auto' && p !== 'searxng';
    webCustomBox.hidden = p !== 'custom';
    webDetected.hidden = p !== 'auto';
    $('#web-custom-bodyTemplate-field', root).hidden = webMethod.value !== 'POST';
    webKey.placeholder = webKey.dataset.saved ? 'A key is saved. Type to replace it.' : p === 'auto' ? 'Search key (stored only on this computer)' : 'Search key, if the service needs one (stored only on this computer)';
  }
  function webForm() {
    return {
      enabled: webOn.checked, provider: webProvider.value, baseUrl: webAddress.value.trim(),
      custom: { method: webMethod.value, ...Object.fromEntries(Object.entries(webCustom).map(([k, el]) => [k, el.value])) },
    };
  }
  async function refreshWeb() {
    if (!window.NIE_WEB) { for (const el of webControls) el.disabled = true; paintWebFields(); webStatus.hidden = true; webDetected.hidden = true; return; }
    const [c, st] = await Promise.all([app.web.refresh(), app.web.status()]).catch(() => []);
    if (!c) return void (webStatus.textContent = 'NIE could not read the web search settings.');
    webOn.checked = c.enabled; webProvider.value = c.provider; webAddress.value = c.baseUrl;
    webMethod.value = c.custom?.method === 'POST' ? 'POST' : 'GET';
    for (const [k, el] of Object.entries(webCustom)) el.value = c.custom?.[k] ?? '';
    webKey.dataset.saved = c.hasKey ? '1' : '';
    webClearKey.hidden = !c.hasKey;
    if (c.hasKey && c.keyStoredSecurely === false && !webMsg.textContent) webMsg.textContent = 'This key is stored unencrypted on this computer.';
    paintWebFields();
    paintWebState(c, st);
  }
  /** The explanations that follow from what is saved and what is installed (never the boxes the writer may be typing in). */
  function paintWebState(c, st) {
    const packRuns = st?.provider === 'pack'; // the encyclopedia on this computer answers lookups: nothing to agree to, no web
    paintBuiltin(c, packRuns);
    webTest.title = packRuns ? 'Checks that the offline encyclopedia opens. Nothing is sent anywhere.' : 'Sends one search for the word "test" to the service you chose.';
    // What Automatic made of what was saved (it can not know about a key that is only typed, not saved yet), and what is ready.
    webDetected.textContent = c.detected ? `Automatic detected ${providerName(c.detected)}.`
      : c.hasKey || c.baseUrl ? 'Automatic could not tell which service this is. Choose it from the list.'
      : `Automatic picks the service from what you give it: a Tavily key (starts with tvly-), a Brave Search key (starts with BSA), a Serper key (40 letters and digits) or a SearXNG address (https://...).${packRuns ? ' With none of these it uses the offline encyclopedia on this computer.' : shownService(c) ? ` With none of these it uses ${BUILTIN_SEARCH[shownService(c)].name}.` : ''}`;
    const reason = String(st?.label ?? '').trim();
    webStatus.dataset.state = st?.configured && st.enabled ? 'ready' : st?.configured ? 'starting' : 'failed';
    webStatus.textContent = st?.configured && st.enabled ? (packRuns ? 'Lookups use the offline encyclopedia on this computer.' : `Web search is on, using ${providerName(st.provider)}.`)
      : st?.configured && c.usingBuiltin && c.builtin !== c.builtinService ? `Web search is off. ${BUILTIN_SEARCH[c.builtinService].ready}`
      : st?.configured ? `Web search is off. ${providerName(st.provider)} is set up.`
      : `Web search is not set up yet.${reason ? ` ${/[.!?]$/.test(reason) ? reason : `${reason}.`}` : ''}`;
  }
  /** The encyclopedia was installed or removed while Settings is open: the web search explanations follow, the boxes are left as they are. */
  async function refreshWebState() {
    if (!window.NIE_WEB) return;
    const [c, st] = await Promise.all([app.web.refresh(), app.web.status()]).catch(() => []);
    if (c) paintWebState(c, st);
  }
  // The built-in search that would run with no key of the writer's own (they may have chosen their own service, and then it is the one they would get back): the desktop app has
  // one in every build, the browser build none.
  const shownService = (c) => (window.NIE_WEB ? c.builtinService || (c.gateway ? 'nie' : 'wikipedia') : null);
  // The block shows the agreement as saved, and which service runs: the writer's own, when they have set one up, always wins. An agreement is to one service: Wikipedia's is not NIE's.
  function paintBuiltin(c, packRuns = false) {
    const service = shownService(c);
    const words = BUILTIN_SEARCH[service];
    webBuiltinBox.hidden = !words;
    webOwn.hidden = !words;
    webExplain.textContent = words ? WEB_HOW : `${WEB_HOW} ${WEB_KEYS}`;
    webOwnText.textContent = packRuns ? WEB_OWN_PACK : WEB_OWN;
    webBuiltinCheck.hidden = packRuns;
    if (!words) return;
    if (packRuns) { // with the encyclopedia installed, the built-in search is not what runs: it is not offered, and nothing is asked
      webBuiltinHead.textContent = 'Offline encyclopedia (installed)';
      webBuiltinText.textContent = WEB_PACK_RUNS;
      webBuiltinNote.textContent = '';
      return;
    }
    builtinShown = service;
    const agreed = c.builtin === service;
    webBuiltinHead.textContent = words.heading;
    webBuiltinText.textContent = words.disclosure;
    webBuiltinLabel.textContent = ` ${words.checkbox}`;
    webBuiltin.checked = agreed;
    webBuiltinNote.textContent = !c.usingBuiltin ? `You have your own search service set up below, so that is what runs and ${words.name} is not used. To use the built-in search instead, remove your key and choose Automatic.`
      : !agreed ? 'Web search stays off until you agree here.'
      : c.enabled ? 'You agreed. Untick the box to take it back; web search then stops.'
      : 'You agreed. Web search is switched off.';
  }
  async function saveWeb(extra = {}, done = 'Saved.') {
    const wanted = webOn.checked;
    try {
      await app.web.save({ ...webForm(), apiKey: webKey.value || undefined, ...extra });
      webKey.value = '';
      webMsg.textContent = done;
    } catch (err) {
      webMsg.textContent = `Could not save: ${err?.message ?? err}`;
    }
    await refreshWeb();
    const c = app.web.config();
    // the main process will not run a built-in search before the writer has agreed to it
    if (wanted && extra.builtin !== '' && !c.enabled && c.usingBuiltin && c.builtin !== c.builtinService) webMsg.textContent = `${done} Web search stays off until you agree to ${BUILTIN_SEARCH[c.builtinService].agreeTo}.`;
    app.emit('web'); // the Web switch next to the message box follows what was saved
  }
  // Agreeing also turns web search on when that built-in search is what would run; taking the agreement back is saved at once, and the main process then switches that search off.
  function agreeBuiltin(on) {
    const words = BUILTIN_SEARCH[builtinShown];
    if (on && app.web.config().usingBuiltin && !webKey.value.trim()) webOn.checked = true;
    return saveWeb({ builtin: on ? builtinShown : '' }, on ? `You agreed to ${words.agreeTo}.` : `You took back your agreement to ${words.agreeTo}.`);
  }
  async function testWeb() {
    webMsg.textContent = 'Testing…';
    await saveWeb(); // the test uses what is saved
    const r = await app.web.test();
    webMsg.textContent = r.ok ? r.message : `The test did not work: ${r.message}`;
  }

  // ── Offline encyclopedia ───────────────────────────────────────────────────
  function encStatusText(s) {
    if (!s) return 'Checking…';
    if (s.busy === 'importing') return 'Adding the file…';
    if (s.busy === 'removing') return 'Removing the offline encyclopedia…';
    const built = s.builtAt ? s.builtAt.slice(0, 10) : '';
    if (s.state === 'downloading') {
      const total = s.progress?.total || s.bytes;
      const got = s.progress?.received ?? 0;
      return total ? `Downloading… ${Math.min(100, Math.floor((got / total) * 100))}% (${encMb(got)} of ${encMb(total)})` : `Downloading… ${encMb(got)}`;
    }
    if (s.state === 'ready') {
      const bits = [s.docs ? `${s.docs.toLocaleString('en-US')} articles` : '', built ? `built ${built}` : '', s.bytes ? encMb(s.bytes) : ''].filter(Boolean);
      return `Installed${bits.length ? `: ${bits.join(', ')}` : ''}.`;
    }
    if (s.state === 'error') return s.error || 'The offline encyclopedia could not be used.';
    if (s.state === 'absent') return `Not installed.${s.bytes ? ` The download is about ${encMb(s.bytes)}${built ? ` and was built ${built}` : ''}.` : ''}`;
    return ENC_UNAVAILABLE;
  }
  let encLast = ''; // the state last painted
  function paintEnc(s = app.encyclopedia.current()) {
    const none = app.encyclopedia.kind === 'none';
    const state = s?.state ?? '';
    const downloading = state === 'downloading';
    const ready = state === 'ready';
    const idle = !encPending && !s?.busy;
    encStatus.hidden = none;
    encStatus.textContent = encStatusText(s);
    encStatus.dataset.state = ready ? 'ready' : downloading ? 'starting' : state === 'error' ? 'failed' : '';
    encStatus.setAttribute('aria-live', downloading ? 'off' : 'polite'); // (a download is announced by encAnnounce, a tenth at a time)
    const total = s?.progress?.total || s?.bytes || 0;
    const pct = downloading && total ? Math.min(100, Math.floor(((s.progress?.received ?? 0) / total) * 100)) : null;
    encProgress.hidden = !downloading;
    if (pct == null) encProgress.removeAttribute('value'); else encProgress.value = pct;
    if (pct != null && Math.floor(pct / 10) !== encAnnounced) { encAnnounced = Math.floor(pct / 10); encAnnounce.textContent = `Downloading the offline encyclopedia, ${pct} percent.`; }
    if (encLast === 'downloading' && !downloading) encAnnounce.textContent = ready ? 'The offline encyclopedia finished downloading.' : state === 'error' ? 'The download stopped with a problem.' : 'The download was cancelled.';
    if (!downloading) encAnnounced = -1;
    encLast = state;
    encDownload.hidden = !(state === 'absent' || (state === 'error' && s.available));
    encDownload.textContent = state === 'error' ? 'Try again' : s?.bytes ? `Download (about ${encMb(s.bytes)})` : 'Download';
    encCancel.hidden = !downloading;
    encRemove.hidden = !(ready || (state === 'error' && s.hasFile));
    encDownload.disabled = none || !idle;
    encRemove.disabled = none || !idle;
    encImport.disabled = none || !idle || downloading;
    encCancel.disabled = none || encPending;
    encAttribution.hidden = none || !(ready || downloading);
    encFirst.hidden = none || !ready;
    encMsg.textContent = s?.error && state !== 'error' ? s.error : encNote; // (a file that was refused while another works: said beside it)
  }
  /** One change asked of the desktop app. The buttons wait for it; its outcome is said once. */
  async function encAct(call, done = '') {
    if (encPending) return;
    encPending = true;
    encNote = '';
    paintEnc();
    const r = await call();
    encPending = false;
    encNote = r.error ? r.error.message : r.cancelled || r.status?.error ? '' : done;
    paintEnc(r.status ?? undefined);
  }
  async function refreshEnc() {
    paintEnc();
    const s = await app.encyclopedia.refresh();
    if (!s) { encStatus.textContent = 'NIE could not ask the desktop app about the offline encyclopedia.'; encStatus.dataset.state = 'failed'; return; }
    paintEnc(s);
  }
  function confirmRemoveEncyclopedia() {
    const dlg = h('dialog', { class: 'dialog', role: 'alertdialog', id: 'enc-confirm' }, h('form', { method: 'dialog', class: 'dialog-body' },
      h('h2', {}, 'Remove the offline encyclopedia?'),
      h('p', {}, 'The file is deleted from this computer. Until you download it again or add a file, NIE looks things up the other ways it can: Wikipedia once you agree to it, or a search key of your own.'),
      h('div', { class: 'dialog-actions end' }, h('button', { class: 'btn btn-danger', value: 'remove', id: 'confirm-enc-remove' }, 'Remove it'), h('button', { class: 'btn btn-quiet', value: 'cancel', autofocus: true }, 'Cancel'))));
    dlg.addEventListener('close', () => { if (dlg.returnValue === 'remove') encAct(() => app.encyclopedia.remove(), 'The offline encyclopedia was removed.'); dlg.remove(); });
    document.body.append(dlg);
    dlg.showModal();
  }
  let encReady = false;
  app.encyclopedia.onChange((s) => {
    paintEnc(s);
    if ((s.state === 'ready') !== encReady) { encReady = s.state === 'ready'; refreshWebState(); }
  });

  async function refreshModel() {
    const st = app.engine.status();
    aiStatus.textContent = st.route === 'online' ? 'NIE is using an online model.' : st.local.message;
    aiStatus.dataset.state = st.route === 'online' ? 'online' : st.local.state;
    const bridge = window.NIE_LOCAL;
    clear(modelInfo);
    if (!bridge) {
      clear(modelSelect).append(h('option', {}, 'Qwen2.5 3B Instruct (Q4_K_M)'));
      modelSelect.disabled = true; restartBtn.disabled = true; autoDl.disabled = true; downloadBtn.hidden = true;
      modelInfo.append(h('p', { class: 'muted small' }, 'The offline model runs inside the desktop app. In a browser, NIE uses its built-in guidance unless you connect a llama-server (add ?llama=http://127.0.0.1:8080 to the address).'));
      return;
    }
    const info = await bridge.info().catch(() => null);
    if (!info) return;
    clear(modelSelect);
    for (const m of info.catalog) modelSelect.append(h('option', { value: m.id, selected: m.id === info.model.id ? true : null }, m.label));
    const rows = [['Model file', info.model.exists ? info.model.path : `${info.model.fileName} (not installed)`], ['Model check', info.model.validation ? (info.model.validation.ok ? `OK (${(info.model.validation.size / 1073741824).toFixed(2)} GB)` : info.model.validation.problems.map((p) => p.message).join(' ')) : 'Not installed'], ['Runtime', info.runtime.ok ? 'Complete' : info.runtime.problems.map((p) => p.message).join(' ')]];
    autoDl.checked = info.autoDownload !== false; // show the saved choice, not always ticked
    downloadBtn.hidden = info.model.exists && info.model.validation?.ok !== false;
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
  app.on('library', paintLibrary);
  paintLibrary();
  loadLibrary().then(paintLibrary);
  app.on('view', (v) => { if (v === 'settings') { refreshModel(); refreshOnline(); refreshWeb(); refreshEnc(); syncPrefs(); } });
  if (window.NIE_UPDATER) {
    window.NIE_UPDATER.onStatus(paintUpdate);
    window.NIE_UPDATER.status().then(paintUpdate);
  } else {
    upMsg.textContent = 'Updates are available in the installed desktop app.';
    upCheck.disabled = true;
  }
  syncPrefs(); refreshModel(); refreshOnline(); refreshWeb(); refreshEnc(); refreshAbout();
  return { focus: () => {}, primaryInput: () => null };
}
