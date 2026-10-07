import { AIError } from './openai-client.js';

/**
 * Streaming chat over the Electron preload bridge. The main process owns the model/provider connection;
 * the renderer sends `{id, messages, options}`, receives chunks on `onChunk`, and gets the final `{text}`/`{error}`.
 */
export function makeBridgeChat(bridge) {
  let seq = 0;
  const handlers = new Map();
  bridge.onChunk(({ id, delta }) => handlers.get(id)?.(delta));
  return async function chat(messages, { onToken, signal, maxTokens, temperature, stream = true, json = null, timeoutMs = null } = {}) {
    const id = `c${Date.now().toString(36)}${++seq}`;
    let full = '';
    handlers.set(id, (delta) => {
      full += delta;
      onToken?.(delta, full);
    });
    const onAbort = () => bridge.abort(id);
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) onAbort();
    try {
      const res = await bridge.chat({ id, messages, options: { maxTokens, temperature, stream, json, timeoutMs } });
      if (res?.error) throw new AIError(res.error, { kind: res.aborted ? 'abort' : 'error' });
      return res.text ?? full;
    } finally {
      handlers.delete(id);
      signal?.removeEventListener('abort', onAbort);
    }
  };
}
