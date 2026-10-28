import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { validateModel } from './runtime.js';

/**
 * Resumable model download, used when the installer did not bundle the model (or it was removed).
 * Writes to `<dest>.part`, resumes with Range requests, verifies size + GGUF header (+ optional SHA-256),
 * and only then renames into place, so a half-finished download can never be mistaken for a model.
 *
 * It is the whole first-run experience of the small "click and run" package, so it must not hang or crash:
 *  - a connection that stops delivering bytes is abandoned after `stallMs` and resumed from the .part file (up to `attempts` times);
 *  - a full or unwritable disk is a plain-language error, not an unhandled stream error that would take the app down;
 *  - the final rename is retried, because antivirus often holds a freshly written 2 GB file for a moment.
 *
 * It also downloads the offline encyclopedia (a different file, a different check): `validate(partPath)` replaces the GGUF check, `what` names the thing in the messages
 * ("model" by default), `size` says how much room it needs when the server did not, and `margin` is the room to keep free besides. With none of them it behaves as it always did.
 */

const MARGIN_BYTES = 300 * 1024 * 1024;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** "1.9 GB" or "430 MB": how much room a download needs, in words. */
const roomText = (bytes) => (bytes >= 1073741824 ? `${(bytes / 1073741824).toFixed(1)} GB` : `${Math.max(1, Math.round(bytes / 1048576))} MB`);

const diskError = (err, what, size) =>
  err?.code === 'ENOSPC' ? new Error(`The disk is full: the offline ${what} needs about ${size ? roomText(size) : '1.9 GB'} of free space. Free some space and try again; the download will continue where it stopped.`)
  : new Error(`The ${what} file could not be saved (${err?.code ?? err?.message ?? err}). Check that the folder is writable.`);

/** Free bytes on the drive that holds `dir`, or null when the platform cannot say. */
export function defaultFreeBytes(dir) {
  try {
    const s = fs.statfsSync(dir);
    return Number(s.bavail) * Number(s.bsize);
  } catch {
    return null;
  }
}

export async function downloadModel({ url, destPath, minBytes, sha256 = null, onProgress, signal, fetchImpl = globalThis.fetch, stallMs = 60_000, attempts = 3, freeBytes = defaultFreeBytes, retryDelayMs = 1500, validate = null, what = 'model', size = null, margin = MARGIN_BYTES }) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const part = `${destPath}.part`;
  const words = { what, size, margin };

  for (let attempt = 1; ; attempt++) {
    try {
      await fetchIntoPart({ url, part, signal, fetchImpl, stallMs, onProgress, freeBytes, words });
      break;
    } catch (err) {
      const retryable = err?.retryable === true && attempt < attempts && !signal?.aborted;
      if (!retryable) throw err;
      await sleep(retryDelayMs); // the .part file is kept: the next attempt resumes from it
    }
  }

  // (a check that fails or throws discards the part file: what was downloaded is never kept as if it were good)
  let check;
  try {
    check = await (validate ? validate(part) : validateModel(part, { minBytes }));
  } catch (err) {
    check = { ok: false, problems: [{ message: err?.message ?? String(err) }] };
  }
  if (!check?.ok) {
    fs.rmSync(part, { force: true });
    throw new Error(`The downloaded ${what} is not usable: ${(check?.problems ?? []).map((p) => p.message).join(' ')}`.trim());
  }
  if (sha256) {
    const hash = crypto.createHash('sha256');
    await new Promise((resolve, reject) => fs.createReadStream(part).on('data', (d) => hash.update(d)).on('end', resolve).on('error', reject));
    if (hash.digest('hex').toLowerCase() !== sha256.toLowerCase()) {
      fs.rmSync(part, { force: true });
      throw new Error(`The downloaded ${what} failed its checksum and was discarded.`);
    }
  }
  await renameWithRetry(part, destPath, what);
  return { path: destPath, size: check.size ?? fs.statSync(destPath).size };
}

async function renameWithRetry(from, to, what) {
  for (let i = 1; ; i++) {
    try {
      fs.renameSync(from, to);
      return;
    } catch (err) {
      if (i >= 8 || !['EPERM', 'EBUSY', 'EACCES'].includes(err?.code)) throw new Error(`The ${what} downloaded, but could not be put in place (${err?.code ?? err?.message}). Close other programs that may be scanning it and try again.`);
      await sleep(500 * i);
    }
  }
}

async function fetchIntoPart({ url, part, signal, fetchImpl, stallMs, onProgress, freeBytes, words }) {
  const { what, size, margin } = words;
  let have = 0;
  try {
    have = fs.statSync(part).size;
  } catch {
    /* fresh download */
  }

  let res;
  try {
    res = await fetchImpl(url, { headers: have ? { Range: `bytes=${have}-` } : {}, signal, redirect: 'follow' });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw Object.assign(new Error(`No connection to the ${what}'s download site (${err?.cause?.code ?? err?.message ?? err}).`), { retryable: true });
  }
  if (res.status === 416) return; // the partial file is already complete (or invalid): verified by the caller
  if (!res.ok && res.status !== 206) {
    throw Object.assign(new Error(`Download failed: the server returned ${res.status}.`), { retryable: res.status >= 500 });
  }

  const resumed = res.status === 206;
  if (!resumed) have = 0; // server ignored Range: start over
  const len = Number(res.headers.get('content-length')) || 0;
  const total = len ? len + have : 0;

  if (len) {
    const free = freeBytes(path.dirname(part));
    if (free != null && free < len + margin) {
      throw new Error(`There is not enough free disk space for the offline ${what}: it needs about ${roomText(len + margin)} and only ${roomText(free)} is free.`);
    }
  }

  const out = fs.createWriteStream(part, { flags: resumed ? 'a' : 'w' });
  let streamError = null;
  const failed = new Promise((_, reject) => out.on('error', (e) => { streamError = e; reject(diskError(e, what, size)); }));
  failed.catch(() => {}); // observed below; never an unhandled rejection
  let received = have;
  const reader = res.body.getReader();
  try {
    for (;;) {
      let stallTimer;
      const stalled = new Promise((_, reject) => { stallTimer = setTimeout(() => reject(Object.assign(new Error('The download stopped receiving data.'), { retryable: true })), stallMs); });
      let chunk;
      try {
        chunk = await Promise.race([reader.read(), stalled, failed]);
      } finally {
        clearTimeout(stallTimer);
      }
      if (streamError) throw diskError(streamError, what, size);
      const { value, done } = chunk;
      if (done) break;
      if (!out.write(value)) await Promise.race([new Promise((r) => out.once('drain', r)), failed]);
      received += value.length;
      onProgress?.({ received, total, percent: total ? Math.min(100, (received / total) * 100) : null });
    }
  } catch (err) {
    try { await reader.cancel(); } catch { /* already closed */ }
    if (signal?.aborted) throw err;
    if (err?.retryable) throw err;
    if (err?.name === 'TypeError' || err?.cause) throw Object.assign(new Error(`The connection to the ${what}'s download site was interrupted (${err?.cause?.code ?? err?.message}).`), { retryable: true });
    throw err;
  } finally {
    await new Promise((r) => out.end(r));
  }
  if (streamError) throw diskError(streamError, what, size);
  if (total && received < total) throw Object.assign(new Error('The download ended early. Try again and it will resume.'), { retryable: true });
}
