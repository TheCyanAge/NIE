import { OpenAICompatClient } from './openai-client.js';
import { makeBridgeChat } from './bridge.js';

/**
 * Local-provider adapters. All expose the same small interface to AIEngine:
 *   status(), onStatus(cb), chat(messages, opts)
 */

/** Renderer-side adapter over the Electron preload bridge (`window.NIE_LOCAL`). */
export function createDesktopLocal(bridge) {
  let current = { state: 'starting', detail: null };
  const listeners = new Set();
  const set = (s) => {
    current = { state: s.state, detail: s.detail ?? null, percent: s.percent ?? null };
    listeners.forEach((cb) => cb(current));
  };
  bridge.status().then(set).catch(() => set({ state: 'failed', detail: 'Could not reach the desktop service.' }));
  bridge.onStatus(set);
  const chat = makeBridgeChat(bridge);

  return {
    kind: 'desktop',
    status: () => current,
    onStatus(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    restart: () => bridge.restart?.(),
    info: () => bridge.info?.(),
    chat,
  };
}

/**
 * Plain-HTTP adapter for a llama-server you started yourself (browser dev mode, tests).
 * Polls /health so the status reflects reality instead of assuming.
 */
export function createHttpLocal({ baseUrl, pollMs = 1500, fetchImpl } = {}) {
  const client = new OpenAICompatClient({ baseUrl, fetchImpl, model: 'local' });
  let current = { state: 'starting', detail: null };
  const listeners = new Set();
  let timer = null;
  let stopped = false;

  const set = (state, detail = null) => {
    if (current.state === state && current.detail === detail) return;
    current = { state, detail };
    listeners.forEach((cb) => cb(current));
  };

  async function poll() {
    if (stopped) return;
    const h = await client.health();
    if (h.ok) set('ready');
    else if (h.status === 503) set('starting');
    else set(current.state === 'ready' ? 'failed' : 'starting', h.error ?? null);
    timer = setTimeout(poll, pollMs);
  }
  poll();

  return {
    kind: 'http',
    status: () => current,
    onStatus(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    chat: (messages, opts) => client.chat(messages, opts),
    stop() {
      stopped = true;
      clearTimeout(timer);
    },
  };
}
