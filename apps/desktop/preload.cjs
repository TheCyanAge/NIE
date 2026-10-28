'use strict';
/**
 * Preload bridge: the only door between the web UI and the desktop layer.
 * The renderer has no Node access (contextIsolation on, nodeIntegration off); it can only call what is listed here.
 */
const { contextBridge, ipcRenderer } = require('electron');

const on = (channel, cb) => {
  const handler = (_event, payload) => cb(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
};

contextBridge.exposeInMainWorld('NIE_DESKTOP', {
  isDesktop: true,
  info: () => ipcRenderer.invoke('nie:app:info'),
  /** Native open dialog → { name, bytes } | null. Bytes are parsed in a renderer worker, never in the main process. */
  openFile: () => ipcRenderer.invoke('nie:files:open'),
  onMenu: (cb) => on('nie:menu', cb),
  openExternal: (url) => ipcRenderer.invoke('nie:app:open-external', url),
});

contextBridge.exposeInMainWorld('NIE_LOCAL', {
  status: () => ipcRenderer.invoke('nie:local:status'),
  onStatus: (cb) => on('nie:local:status', cb),
  info: () => ipcRenderer.invoke('nie:local:info'),
  restart: () => ipcRenderer.invoke('nie:local:restart'),
  download: () => ipcRenderer.invoke('nie:local:download'),
  chat: (req) => ipcRenderer.invoke('nie:local:chat', req),
  abort: (id) => ipcRenderer.send('nie:local:abort', id),
  onChunk: (cb) => on('nie:local:chunk', cb),
  setAutoDownload: (v) => ipcRenderer.invoke('nie:local:set-auto-download', v),
});

contextBridge.exposeInMainWorld('NIE_ONLINE', {
  getConfig: () => ipcRenderer.invoke('nie:online:get'),
  setConfig: (cfg) => ipcRenderer.invoke('nie:online:set', cfg),
  test: () => ipcRenderer.invoke('nie:online:test'),
  chat: (req) => ipcRenderer.invoke('nie:online:chat', req),
  abort: (id) => ipcRenderer.send('nie:online:abort', id),
  onChunk: (cb) => on('nie:online:chunk', cb),
});

// Web search (optional). The key goes in through setConfig and never comes back out: getConfig only says whether one is saved.
contextBridge.exposeInMainWorld('NIE_WEB', {
  getConfig: () => ipcRenderer.invoke('nie:web:get'),
  setConfig: (cfg) => ipcRenderer.invoke('nie:web:set', cfg),
  test: () => ipcRenderer.invoke('nie:web:test'),
  status: () => ipcRenderer.invoke('nie:web:status'),
  search: (query, { limit } = {}) => ipcRenderer.invoke('nie:web:search', query, { limit }),
  read: (url) => ipcRenderer.invoke('nie:web:read', url),
});

// The offline encyclopedia. Only its status crosses (never its contents or a path); a failure comes back as { error: { message } }.
contextBridge.exposeInMainWorld('NIE_ENCYCLOPEDIA', {
  status: () => ipcRenderer.invoke('nie:enc:status'),
  download: () => ipcRenderer.invoke('nie:enc:download'),
  cancel: () => ipcRenderer.invoke('nie:enc:cancel'),
  remove: () => ipcRenderer.invoke('nie:enc:remove'),
  /** Opens the native file dialog in the main process → the status, or { cancelled: true }. */
  importFile: () => ipcRenderer.invoke('nie:enc:import'),
  onChanged: (cb) => on('nie:enc:changed', cb),
});

contextBridge.exposeInMainWorld('NIE_UPDATER', {
  check: () => ipcRenderer.invoke('nie:updater:check'),
  status: () => ipcRenderer.invoke('nie:updater:status'),
  install: () => ipcRenderer.invoke('nie:updater:install'),
  onStatus: (cb) => on('nie:updater:status', cb),
});
