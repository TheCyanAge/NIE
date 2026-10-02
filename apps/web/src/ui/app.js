import { ProjectStore, webStorage, memoryStorage } from '../engine/project/store.js';
import { AIEngine } from '../engine/ai/engine.js';
import { createDesktopLocal, createHttpLocal } from '../engine/ai/local.js';
import { createBridgeOnline, createDirectOnline } from '../engine/ai/online.js';
import { Orchestrator } from '../engine/orchestrator/index.js';
import { createIngestClient } from '../engine/ingest/client.js';
import { debounce } from './dom.js';

/**
 * The application controller: owns the project store, the single NIE engine and the active project.
 *
 * Project isolation lives here: switching, creating or deleting a project replaces `project` AND `session`
 * (all transient context: last scan, highlights, in-flight requests) wholesale and tells every view to rebuild
 * from scratch. Nothing is patched in place, so nothing can carry over.
 */

const PREF_DEFAULTS = { tourOnStartup: true, theme: 'dark', showObservations: true, diagnostics: false };

function newSession() {
  return { report: null, reportText: '', reportAt: 0, scanning: false, abort: null, chatAbort: null, chatBusy: false, readerText: '' };
}

export function createApp() {
  let ls = null;
  try {
    ls = window.localStorage;
    ls.getItem('nie.probe');
  } catch {
    ls = null;
  }
  const store = new ProjectStore(ls ? webStorage(ls) : memoryStorage());
  const isDesktop = Boolean(window.NIE_DESKTOP);

  // One NIE. Offline model (desktop bridge, or a llama-server given as ?llama=<url> in a browser) + optional online provider.
  const params = new URLSearchParams(location.search);
  const llamaUrl = params.get('llama');
  // ?llama=http://127.0.0.1:8080 points a browser at a llama-server; its OpenAI-compatible API lives under /v1.
  const llamaBase = llamaUrl ? `${llamaUrl.replace(/\/+$/, '').replace(/\/v1$/, '')}/v1` : null;
  const localProvider = window.NIE_LOCAL ? createDesktopLocal(window.NIE_LOCAL) : llamaBase ? createHttpLocal({ baseUrl: llamaBase }) : null;
  const directKey = 'nie.v1.online';
  const online = window.NIE_ONLINE
    ? createBridgeOnline(window.NIE_ONLINE)
    : createDirectOnline({
        load: () => {
          try {
            return JSON.parse(ls?.getItem(directKey) ?? 'null');
          } catch {
            return null;
          }
        },
        save: (cfg) => {
          try {
            ls?.setItem(directKey, JSON.stringify(cfg));
          } catch {
            /* ignore */
          }
        },
      });
  const engine = new AIEngine({ local: localProvider, online });
  const orchestrator = new Orchestrator({ engine });
  const ingest = createIngestClient();

  const listeners = new Map();
  const on = (type, cb) => {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type).add(cb);
    return () => listeners.get(type).delete(cb);
  };
  const emit = (type, detail) => (listeners.get(type) ?? []).forEach((cb) => cb(detail));

  const app = {
    store,
    engine,
    orchestrator,
    ingest,
    isDesktop,
    project: store.ensureActive(),
    session: newSession(),
    view: 'scan',
    prefs: store.getPrefs(PREF_DEFAULTS),
    on,
    emit,
  };

  engine.onChange((s) => emit('status', s));
  online.refresh?.().then(() => emit('status', engine.status())).catch(() => {});
  window.addEventListener('online', () => emit('status', engine.status()));
  window.addEventListener('offline', () => emit('status', engine.status()));

  const persist = debounce(() => store.save(app.project), 400);
  app.saveSoon = () => persist();
  app.saveNow = () => {
    persist.cancel();
    store.save(app.project);
  };

  app.setPref = (key, value) => {
    app.prefs = { ...PREF_DEFAULTS, ...store.setPrefs({ [key]: value }) }; // stored values always layer over the defaults
    emit('prefs', { key, value });
  };

  app.setView = (view) => {
    if (app.view === view) return;
    app.view = view;
    emit('view', view);
  };

  function swap(project) {
    app.session.abort?.abort();
    app.session.chatAbort?.abort();
    app.project = project;
    app.session = newSession();
    emit('project', project);
  }

  app.openProject = (id) => {
    app.saveNow();
    const p = store.load(id);
    if (!p) return false;
    store.setActive(id);
    swap(p);
    return true;
  };

  /** A genuinely new project: nothing is copied from the one being left. */
  app.createProject = (title = 'Untitled project') => {
    app.saveNow();
    swap(store.create({ title }));
    return app.project;
  };

  app.renameProject = (id, title) => {
    store.rename(id, title);
    if (id === app.project.id) {
      app.project = store.load(id);
      emit('project', app.project);
    }
  };

  /** Removes the project and every trace of its story context. */
  app.deleteProject = (id) => {
    const wasActive = id === app.project.id;
    if (wasActive) persist.cancel();
    store.delete(id);
    if (wasActive) swap(store.ensureActive());
    else emit('projects');
  };

  app.eraseEverything = () => {
    persist.cancel();
    store.eraseAll({ keepPrefs: true });
    swap(store.ensureActive());
  };

  window.addEventListener('beforeunload', () => app.saveNow());
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && app.saveNow());
  return app;
}
