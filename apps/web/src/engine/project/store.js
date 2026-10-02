import { createEmptyProfile, normalizeProfile } from '../profile/profile.js';
import { emptyWorkingPremise } from '../intent/intent.js';
import { uid } from '../util/text.js';

/**
 * Project storage with hard isolation.
 *
 * - Every project lives under its own key prefix; nothing is shared between projects.
 * - `create()` always builds from a factory, never from the previous or active project.
 * - `delete()` removes every key under the project's prefix, so no story context outlives it.
 * - NIE's narrative library is code, not data in this store, so it is unaffected by any of this.
 */

const NS = 'nie.v1.';
const K = {
  index: `${NS}index`,
  active: `${NS}active`,
  prefs: `${NS}prefs`,
  project: (id) => `${NS}project.${id}`,
};
export const PROJECT_SCHEMA = 1;
export { RULE_CATEGORIES };
const MAX_MESSAGES = 300;

export function memoryStorage(initial = {}) {
  const m = new Map(Object.entries(initial));
  return {
    get: (k) => (m.has(k) ? m.get(k) : null),
    set: (k, v) => void m.set(k, String(v)),
    remove: (k) => void m.delete(k),
    keys: () => [...m.keys()],
  };
}

/** Wrap window.localStorage (or any Storage-like) in the adapter interface. Failures degrade to memory. */
export function webStorage(ls) {
  const fallback = memoryStorage();
  let broken = false;
  const guard = (fn, fb) => {
    if (broken) return fb();
    try {
      return fn();
    } catch {
      broken = true;
      return fb();
    }
  };
  return {
    get: (k) => guard(() => ls.getItem(k), () => fallback.get(k)),
    set: (k, v) => guard(() => ls.setItem(k, String(v)), () => fallback.set(k, v)),
    remove: (k) => guard(() => ls.removeItem(k), () => fallback.remove(k)),
    keys: () => guard(() => Array.from({ length: ls.length }, (_, i) => ls.key(i)), () => fallback.keys()),
  };
}

export function createProjectData({ title = 'Untitled project', profile, storyText = '' } = {}) {
  const now = Date.now();
  const p = normalizeProfile(profile ?? createEmptyProfile());
  if (!p.identity.title) p.identity.title = title;
  return {
    version: PROJECT_SCHEMA,
    id: uid('prj'),
    createdAt: now,
    updatedAt: now,
    title,
    profile: p,
    storyText,
    rules: [], // the writer's rules: { id, text, category, enabled }
    memory: {
      characters: [], // { name, aliases: [], notes }
      timeline: [],
      themes: [],
      motifs: [], // recurring phrases/images the writer wants treated as deliberate
      intentional: [], // findings the writer marked as deliberate
      dismissed: [], // finding fingerprints the writer dismissed
    },
    conversation: { messages: [], workingPremise: emptyWorkingPremise(), suggestionShown: false },
    scans: { history: [] },
    source: null, // { name, format, importedAt } when story text came from Read mode
  };
}

const RULE_CATEGORIES = ['character', 'world', 'voice', 'style', 'other'];
function sanitizeRule(r) {
  return {
    id: typeof r.id === 'string' ? r.id : uid('rule'),
    text: r.text.trim(),
    category: RULE_CATEGORIES.includes(r.category) ? r.category : 'other',
    enabled: r.enabled !== false,
    createdAt: Number(r.createdAt) || Date.now(),
  };
}

function migrate(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string') return null;
  const base = createProjectData({ title: raw.title || 'Untitled project' });
  // Take only known fields so stale or foreign data cannot leak in.
  return {
    ...base,
    id: raw.id,
    createdAt: Number(raw.createdAt) || base.createdAt,
    updatedAt: Number(raw.updatedAt) || base.updatedAt,
    title: String(raw.title || base.title),
    profile: normalizeProfile(raw.profile),
    storyText: typeof raw.storyText === 'string' ? raw.storyText : '',
    rules: Array.isArray(raw.rules) ? raw.rules.filter((r) => r && typeof r.text === 'string').map(sanitizeRule) : [],
    memory: { ...base.memory, ...(raw.memory && typeof raw.memory === 'object' ? raw.memory : {}) },
    conversation: {
      messages: Array.isArray(raw.conversation?.messages) ? raw.conversation.messages.slice(-MAX_MESSAGES) : [],
      workingPremise: { ...emptyWorkingPremise(), ...(raw.conversation?.workingPremise ?? {}) },
      suggestionShown: Boolean(raw.conversation?.suggestionShown),
    },
    scans: { history: Array.isArray(raw.scans?.history) ? raw.scans.history.slice(-20) : [] },
    source: raw.source && typeof raw.source === 'object' ? raw.source : null,
  };
}

export class ProjectStore {
  constructor(storage = memoryStorage()) {
    this.storage = storage;
  }

  #readJSON(key, fallback) {
    try {
      const v = this.storage.get(key);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  }

  #writeIndex(entries) {
    this.storage.set(K.index, JSON.stringify(entries));
  }

  list() {
    const idx = this.#readJSON(K.index, []);
    return (Array.isArray(idx) ? idx : []).filter((e) => e && this.storage.get(K.project(e.id)) != null).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  get activeId() {
    const id = this.storage.get(K.active);
    return id && this.storage.get(K.project(id)) != null ? id : null;
  }

  setActive(id) {
    if (id == null) return void this.storage.remove(K.active);
    if (this.storage.get(K.project(id)) == null) throw new Error(`No such project: ${id}`);
    this.storage.set(K.active, id);
  }

  load(id) {
    return migrate(this.#readJSON(K.project(id), null));
  }

  /** Create a brand-new project. Nothing is inherited from any other project. */
  create(opts = {}) {
    const project = createProjectData(opts);
    this.save(project);
    this.setActive(project.id);
    return project;
  }

  save(project) {
    project.updatedAt = Date.now();
    this.storage.set(K.project(project.id), JSON.stringify(project));
    const idx = this.#readJSON(K.index, []).filter((e) => e.id !== project.id);
    idx.push({ id: project.id, title: project.title, createdAt: project.createdAt, updatedAt: project.updatedAt });
    this.#writeIndex(idx);
    return project;
  }

  rename(id, title) {
    const p = this.load(id);
    if (!p) return null;
    p.title = String(title).trim() || p.title;
    p.profile.identity.title = p.title;
    return this.save(p);
  }

  /** Remove a project and every trace of its story context. Returns the id of the project now active (or null). */
  delete(id) {
    const prefix = K.project(id);
    for (const key of this.storage.keys()) if (key === prefix || key.startsWith(prefix + '.')) this.storage.remove(key);
    this.#writeIndex(this.#readJSON(K.index, []).filter((e) => e.id !== id));
    if (this.storage.get(K.active) === id) {
      const next = this.list()[0];
      next ? this.storage.set(K.active, next.id) : this.storage.remove(K.active);
    }
    return this.activeId;
  }

  /** The active project, creating a clean "Untitled project" on first launch so NIE is usable from zero. */
  ensureActive() {
    const id = this.activeId;
    if (id) {
      const p = this.load(id);
      if (p) return p;
    }
    const first = this.list()[0];
    if (first) {
      const p = this.load(first.id);
      if (p) {
        this.setActive(p.id);
        return p;
      }
    }
    return this.create({ title: 'Untitled project' });
  }

  /** Wipe all project data (and optionally preferences). Used by "Erase all data". */
  eraseAll({ keepPrefs = true } = {}) {
    for (const key of this.storage.keys()) {
      if (!key.startsWith(NS)) continue;
      if (keepPrefs && key === K.prefs) continue;
      this.storage.remove(key);
    }
  }

  getPrefs(defaults = {}) {
    return { ...defaults, ...this.#readJSON(K.prefs, {}) };
  }

  setPrefs(patch) {
    const next = { ...this.getPrefs(), ...patch };
    this.storage.set(K.prefs, JSON.stringify(next));
    return next;
  }
}

export const STORAGE_KEYS = K;
export const STORAGE_NAMESPACE = NS;
export const MAX_STORED_MESSAGES = MAX_MESSAGES;
