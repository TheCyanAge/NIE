// Web Worker: parses files off the main thread so the UI never freezes on large documents.
import { extractText } from './extract.js';

self.onmessage = async (e) => {
  const { id, name, bytes } = e.data;
  try {
    const result = await extractText({ name, bytes });
    self.postMessage({ id, ok: true, result });
  } catch (err) {
    self.postMessage({ id, ok: false, error: { message: err?.message ?? String(err), code: err?.code ?? 'error' } });
  }
};
