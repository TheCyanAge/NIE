import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { validateModel } from './runtime.js';

/**
 * Resumable model download, used when the installer did not bundle the model (or it was removed).
 * Writes to `<dest>.part`, resumes with Range requests, verifies size + GGUF header (+ optional SHA-256),
 * and only then renames into place, so a half-finished download can never be mistaken for a model.
 */
export async function downloadModel({ url, destPath, minBytes, sha256 = null, onProgress, signal, fetchImpl = globalThis.fetch }) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const part = `${destPath}.part`;
  let have = 0;
  try {
    have = fs.statSync(part).size;
  } catch {
    /* fresh download */
  }

  const res = await fetchImpl(url, { headers: have ? { Range: `bytes=${have}-` } : {}, signal, redirect: 'follow' });
  if (res.status === 416) {
    // The partial file is already complete (or invalid). Fall through to verification below.
  } else if (!res.ok && res.status !== 206) {
    throw new Error(`Download failed: the server returned ${res.status}.`);
  }

  if (res.status !== 416) {
    const resumed = res.status === 206;
    if (!resumed) have = 0; // server ignored Range: start over
    const len = Number(res.headers.get('content-length')) || 0;
    const total = len ? len + have : 0;
    const out = fs.createWriteStream(part, { flags: resumed ? 'a' : 'w' });
    let received = have;
    try {
      const reader = res.body.getReader();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!out.write(value)) await new Promise((r) => out.once('drain', r));
        received += value.length;
        onProgress?.({ received, total, percent: total ? Math.min(100, (received / total) * 100) : null });
      }
    } finally {
      await new Promise((r) => out.end(r));
    }
    if (total && received < total) throw new Error('The download ended early. Try again and it will resume.');
  }

  const check = validateModel(part, { minBytes });
  if (!check.ok) {
    fs.rmSync(part, { force: true });
    throw new Error(`The downloaded model is not usable: ${check.problems.map((p) => p.message).join(' ')}`);
  }
  if (sha256) {
    const hash = crypto.createHash('sha256');
    await new Promise((resolve, reject) => fs.createReadStream(part).on('data', (d) => hash.update(d)).on('end', resolve).on('error', reject));
    if (hash.digest('hex').toLowerCase() !== sha256.toLowerCase()) {
      fs.rmSync(part, { force: true });
      throw new Error('The downloaded model failed its checksum and was discarded.');
    }
  }
  fs.renameSync(part, destPath);
  return { path: destPath, size: check.size };
}
