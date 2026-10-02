import { OpenAICompatClient, AIError } from './openai-client.js';

/**
 * Local-provider adapters. All expose the same small interface to AIEngine:
 *   status(), onStatus(cb), chat(messages, opts)
 */

/** Renderer-side adapter over the Electron preload bridge (`window.NIE_LOCAL`). */
export function createDesktopLocal(bridge) {
  let current = { state: 'starting', detail: null };
  const listeners = new Set();
  const set = (s) => {
    current = { state: s.state, detail: s.detail ?? null };
    listeners.forEach((cb) => cb(current));
  };
  bridge.status().then(set).catch(() => set({ state: 'failed', detail: 'Could not reach the desktop service.' }));
  bridge.onStatus(set);

  let seq = 0;
  const handlers = new Map();
  bridge.onChunk(({ id, delta }) => handlers.get(id)?.(delta));

  return {
    kind: 'desktop',
    status: () => current,
    onStatus(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    restart: () => bridge.restart?.(),
    async chat(messages, { onToken, signal, maxTokens, temperature } = {}) {
      const id = `c${Date.now().toString(36)}${++seq}`;
      let full = '';
      handlers.set(id, (delta) => {
        full += delta;
        onToken?.(delta, full);
      });
      const onAbort = () => bridge.abort(id);
      signal?.addEventListener('abort', onAbort, { once: true });
      try {
        const res = await bridge.chat({ id, messages, options: { maxTokens, temperature } });
        if (res?.error) throw new AIError(res.error, { kind: res.aborted ? 'abort' : 'error' });
        return res.text ?? full;
      } finally {
        handlers.delete(id);
        signal?.removeEventListener('abort', onAbort);
      }
    },
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
