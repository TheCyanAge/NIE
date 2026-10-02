import { app, BrowserWindow, Menu, ipcMain, dialog, protocol, shell, safeStorage } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveLayout, DEFAULT_MODEL } from './src/runtime.js';
import { LocalModelManager } from './src/local-manager.js';
import { createUpdater, readUpdaterConfig } from './src/updater.js';

/**
 * NIE desktop shell. Responsibilities: the window, serving the web UI, the offline model service,
 * filesystem access, updates and packaging. All narrative intelligence lives in the web layer's engine.
 *
 * Startup is deliberately non-blocking:  launch → window + UI immediately → offline model starts in the background.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const APP_ID = 'com.thecyanage.nie';
app.setAppUserModelId(APP_ID);

protocol.registerSchemesAsPrivileged([{ scheme: 'nie', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

const layout = resolveLayout({ isPackaged: app.isPackaged, resourcesPath: process.resourcesPath, desktopDir: here, userDataDir: app.getPath('userData') });
const iconPath = app.isPackaged ? path.join(process.resourcesPath, 'web', 'assets', 'icon.png') : path.join(layout.webRoot, 'assets', 'icon.png');
const logFile = path.join(app.getPath('userData'), 'nie.log');
const log = (...a) => {
  const line = `[${new Date().toISOString()}] ${a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')}\n`;
  try {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    fs.appendFileSync(logFile, line);
  } catch {
    /* logging must never break the app */
  }
  if (!app.isPackaged) console.log(...a);
};

// ── preferences (main-process owned: model choice, online provider) ──────────

const prefsFile = path.join(app.getPath('userData'), 'desktop-prefs.json');
const readPrefs = () => {
  try {
    return JSON.parse(fs.readFileSync(prefsFile, 'utf8'));
  } catch {
    return {};
  }
};
const writePrefs = (patch) => {
  const next = { ...readPrefs(), ...patch };
  fs.mkdirSync(path.dirname(prefsFile), { recursive: true });
  fs.writeFileSync(prefsFile, JSON.stringify(next, null, 2));
  return next;
};

// ── engine modules live in the web folder (outside the asar when packaged) ───

const engineUrl = (rel) => pathToFileURL(path.join(layout.webRoot, 'src', 'engine', rel)).href;
const { OpenAICompatClient } = await import(engineUrl('ai/openai-client.js'));

// ── offline model ────────────────────────────────────────────────────────────

const prefs0 = readPrefs();
const local = new LocalModelManager({
  layout,
  prefs: prefs0,
  model: DEFAULT_MODEL,
  clientFactory: (cfg) => new OpenAICompatClient(cfg),
  autoDownload: prefs0.autoDownloadModel !== false,
  log,
});

let win = null;
const send = (channel, payload) => {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
};
local.on('status', (s) => send('nie:local:status', s));

const inflight = new Map(); // request id → AbortController

async function streamChat(provider, channel, { id, messages, options = {} }) {
  const ctrl = new AbortController();
  inflight.set(id, ctrl);
  try {
    const text = await provider.chat(messages, {
      signal: ctrl.signal,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      stream: options.stream !== false,
      onToken: (delta) => send(channel, { id, delta }),
    });
    return { text };
  } catch (err) {
    return { error: err?.message ?? String(err), aborted: err?.kind === 'abort' || ctrl.signal.aborted };
  } finally {
    inflight.delete(id);
  }
}

ipcMain.handle('nie:local:status', () => local.status);
ipcMain.handle('nie:local:info', () => local.info());
ipcMain.handle('nie:local:restart', () => local.restart());
ipcMain.handle('nie:local:chat', (_e, req) => streamChat({ chat: (m, o) => local.chat(m, o) }, 'nie:local:chunk', req));
ipcMain.handle('nie:local:set-auto-download', (_e, v) => {
  writePrefs({ autoDownloadModel: Boolean(v) });
  local.autoDownload = Boolean(v);
  return true;
});
ipcMain.on('nie:local:abort', (_e, id) => inflight.get(id)?.abort());
ipcMain.on('nie:online:abort', (_e, id) => inflight.get(id)?.abort());

// ── online provider (optional; NIE works fully without it) ───────────────────

function readOnline() {
  const p = readPrefs().online ?? {};
  let apiKey = '';
  if (p.key) {
    try {
      apiKey = p.encrypted ? safeStorage.decryptString(Buffer.from(p.key, 'base64')) : p.key;
    } catch {
      apiKey = '';
    }
  }
  return { enabled: Boolean(p.enabled), baseUrl: p.baseUrl ?? '', model: p.model ?? '', apiKey };
}
const onlineClient = () => {
  const c = readOnline();
  return new OpenAICompatClient({ baseUrl: c.enabled ? c.baseUrl : '', apiKey: c.apiKey, model: c.model || 'default', timeoutMs: 60000 });
};
ipcMain.handle('nie:online:get', () => {
  const c = readOnline();
  return { enabled: c.enabled, baseUrl: c.baseUrl, model: c.model, hasKey: Boolean(c.apiKey), keyStoredSecurely: safeStorage.isEncryptionAvailable() };
});
ipcMain.handle('nie:online:set', (_e, cfg) => {
  const cur = readPrefs().online ?? {};
  const next = { enabled: Boolean(cfg.enabled), baseUrl: String(cfg.baseUrl ?? '').trim(), model: String(cfg.model ?? '').trim(), key: cur.key, encrypted: cur.encrypted };
  if (typeof cfg.apiKey === 'string' && cfg.apiKey) {
    if (safeStorage.isEncryptionAvailable()) Object.assign(next, { key: safeStorage.encryptString(cfg.apiKey).toString('base64'), encrypted: true });
    else Object.assign(next, { key: cfg.apiKey, encrypted: false });
  }
  if (cfg.clearKey) Object.assign(next, { key: undefined, encrypted: undefined });
  writePrefs({ online: next });
  return true;
});
ipcMain.handle('nie:online:chat', (_e, req) => streamChat(onlineClient(), 'nie:online:chunk', req));
ipcMain.handle('nie:online:test', async () => {
  try {
    await onlineClient().chat([{ role: 'user', content: 'Say OK.' }], { stream: false, maxTokens: 4 });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) };
  }
});

// ── updater ──────────────────────────────────────────────────────────────────

const updater = createUpdater({
  isPackaged: app.isPackaged,
  config: readUpdaterConfig(path.join(here, 'updater-config.json')),
  currentVersion: app.getVersion(),
  loadAutoUpdater: async () => (await import('electron-updater')).default.autoUpdater,
  onStatus: (s) => send('nie:updater:status', s),
});
ipcMain.handle('nie:updater:check', () => updater.check());
ipcMain.handle('nie:updater:status', () => updater.status());
ipcMain.handle('nie:updater:install', () => updater.install());

// ── files and app info ───────────────────────────────────────────────────────

ipcMain.handle('nie:app:info', () => ({
  version: app.getVersion(),
  platform: process.platform,
  packaged: app.isPackaged,
  electron: process.versions.electron,
  userData: app.getPath('userData'),
  logFile,
}));
ipcMain.handle('nie:app:open-external', (_e, url) => (/^https:\/\//.test(url) ? shell.openExternal(url).then(() => true) : false));
ipcMain.handle('nie:files:open', async () => {
  const res = await dialog.showOpenDialog(win, {
    title: 'Open a document for NIE to read',
    properties: ['openFile'],
    filters: [
      { name: 'Documents', extensions: ['txt', 'md', 'markdown', 'docx', 'odt', 'rtf', 'pdf', 'epub', 'html', 'htm'] },
      { name: 'All files', extensions: ['*'] },
    ],
  });
  if (res.canceled || !res.filePaths[0]) return null;
  const file = res.filePaths[0];
  const bytes = await fs.promises.readFile(file);
  return { name: path.basename(file), bytes: new Uint8Array(bytes) };
});

// ── window and serving the UI ────────────────────────────────────────────────

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

function registerWebProtocol() {
  const root = path.resolve(layout.webRoot);
  protocol.handle('nie', async (request) => {
    const { pathname } = new URL(request.url);
    const rel = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
    const full = path.resolve(root, '.' + rel);
    if (full !== root && !full.startsWith(root + path.sep)) return new Response('Forbidden', { status: 403 });
    try {
      const data = await fs.promises.readFile(full);
      return new Response(data, { headers: { 'content-type': MIME[path.extname(full).toLowerCase()] ?? 'application/octet-stream', 'cache-control': 'no-cache' } });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { label: 'File', submenu: [{ label: 'Open document…', accelerator: 'CmdOrCtrl+O', click: () => send('nie:menu', 'open-file') }, { type: 'separator' }, isMac ? { role: 'close' } : { role: 'quit' }] },
    { role: 'editMenu' },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }] },
    { label: 'Help', submenu: [{ label: 'Take the tour', click: () => send('nie:menu', 'tour') }, { label: 'Open log folder', click: () => shell.showItemInFolder(logFile) }, { label: `About NIE ${app.getVersion()}`, click: () => send('nie:menu', 'about') }] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  win = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 960,
    minHeight: 620,
    show: false,
    backgroundColor: '#0e1016',
    title: 'Narrative Integrity Engine',
    icon: iconPath,
    webPreferences: { preload: path.join(here, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: true },
  });
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('nie://')) e.preventDefault();
  });
  win.on('closed', () => (win = null));
  win.loadURL('nie://app/index.html');
}

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.whenReady().then(() => {
  registerWebProtocol();
  buildMenu();
  createWindow();
  // UI first; the offline model initialises in the background (and downloads itself if it was not bundled).
  setImmediate(() => local.init().then((s) => log('local model:', s.state, s.detail ?? '')));
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

let quitting = false;
app.on('before-quit', (e) => {
  if (quitting) return;
  quitting = true;
  e.preventDefault();
  local.stop().finally(() => app.quit());
});
