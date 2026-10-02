import { extractText, IngestError } from './extract.js';

/**
 * Parse a file in a Web Worker when available (browser/Electron renderer); otherwise on the current thread (tests, old runtimes).
 */
export function createIngestClient({ workerUrl = new URL('./worker.js', import.meta.url) } = {}) {
  let worker = null;
  let seq = 0;
  const pending = new Map();

  function ensure() {
    if (worker || typeof Worker === 'undefined') return worker;
    try {
      worker = new Worker(workerUrl, { type: 'module' });
      worker.onmessage = (e) => {
        const { id, ok, result, error } = e.data;
        const p = pending.get(id);
        if (!p) return;
        pending.delete(id);
        ok ? p.resolve(result) : p.reject(new IngestError(error.message, error.code));
      };
      worker.onerror = () => {
        worker = null;
        for (const p of pending.values()) p.reject(new IngestError('The file reader stopped unexpectedly.', 'damaged'));
        pending.clear();
      };
    } catch {
      worker = null;
    }
    return worker;
  }

  return {
    async read(file) {
      const bytes = new Uint8Array(file.bytes ?? (await file.arrayBuffer()));
      const name = file.name;
      const w = ensure();
      if (!w) return extractText({ name, bytes });
      const id = ++seq;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        w.postMessage({ id, name, bytes }, [bytes.buffer]);
      });
    },
    dispose() {
      worker?.terminate();
      worker = null;
    },
  };
}
