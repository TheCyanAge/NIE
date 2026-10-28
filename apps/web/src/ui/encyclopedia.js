/**
 * The offline encyclopedia as the page sees it (UI glue; the file itself is the desktop app's business, see apps/desktop/src/encyclopedia-manager.js).
 * `bridge` is the preload's `window.NIE_ENCYCLOPEDIA`. Only a status ever crosses: whether it is installed, how far a download is, what went wrong in plain words.
 * Both adapters have the same shape, so the Settings section reads one object:
 *
 *   current()      the last status the page heard, or null before the first answer
 *   refresh()      ask the desktop app again → the status (null when it did not answer)
 *   download() / cancel() / remove() / importFile()   → { status } | { error: { message } } | { cancelled: true }
 *   onChange(cb)   called with every new status (progress included) → a function that stops listening
 */

const STATES = ['unavailable', 'absent', 'downloading', 'ready', 'error'];
const text = (v, max = 400) => (typeof v === 'string' ? v.slice(0, max) : '');
const count = (v) => (Number.isFinite(v) && v >= 0 ? v : 0);

/** A status as the page may rely on it, whatever arrived: every field present, short, and of the right kind. */
export function cleanEncyclopediaStatus(raw) {
  const o = raw && typeof raw === 'object' ? raw : {};
  const p = o.progress && typeof o.progress === 'object' ? { received: count(o.progress.received), total: count(o.progress.total) } : null;
  return {
    state: STATES.includes(o.state) ? o.state : 'unavailable',
    available: o.available === true,
    name: text(o.name, 120),
    title: text(o.title, 80),
    docs: count(o.docs),
    bytes: count(o.bytes),
    builtAt: text(o.builtAt, 40),
    license: text(o.license, 40),
    attribution: text(o.attribution, 600),
    source: o.source === 'download' || o.source === 'file' ? o.source : null,
    progress: p,
    error: text(o.error),
    busy: o.busy === 'importing' || o.busy === 'removing' ? o.busy : '',
    hasFile: o.hasFile === true,
  };
}

const NEEDS_DESKTOP = 'The offline encyclopedia needs the desktop app.';

/** Desktop: the main process holds the file and does every change. */
export function createBridgeEncyclopedia(bridge) {
  let status = null;
  const listeners = new Set();
  const hear = (raw) => {
    status = cleanEncyclopediaStatus(raw);
    for (const cb of [...listeners]) {
      try {
        cb(status);
      } catch {
        /* one listener failing must not stop the others */
      }
    }
    return status;
  };
  /** One change asked of the main process → what came back, as the page uses it. A failure is words, never a thrown object. */
  async function act(call) {
    let res;
    try {
      res = await call();
    } catch {
      return { error: { message: 'The desktop app did not answer.' } };
    }
    // (a failure is `{ error: { message } }`; a status has an `error` too, but as a string: it says what went wrong earlier, and is still a status)
    if (res?.error && typeof res.error === 'object') return { error: { message: text(res.error.message) || 'The offline encyclopedia could not be changed.' } };
    if (res?.cancelled) return { cancelled: true };
    return { status: hear(res) };
  }
  try {
    bridge.onChanged?.(hear);
  } catch {
    /* without the push the page still works: every action returns the new status */
  }
  return {
    kind: 'bridge',
    current: () => status,
    async refresh() {
      const r = await act(() => bridge.status());
      return r.status ?? status;
    },
    download: () => act(() => bridge.download()),
    cancel: () => act(() => bridge.cancel()),
    remove: () => act(() => bridge.remove()),
    importFile: () => act(() => bridge.importFile()),
    onChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}

/** The browser build has no desktop app to hold a file: the offline encyclopedia is a desktop feature, and says so. */
export function createNoEncyclopedia() {
  const status = cleanEncyclopediaStatus({ state: 'unavailable' });
  const refuse = async () => ({ error: { message: NEEDS_DESKTOP } });
  return { kind: 'none', current: () => status, refresh: async () => status, download: refuse, cancel: refuse, remove: refuse, importFile: refuse, onChange: () => () => {} };
}
