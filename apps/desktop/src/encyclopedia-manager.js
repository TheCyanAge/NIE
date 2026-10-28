import fs from 'node:fs';
import path from 'node:path';
import { defaultFreeBytes } from './model-download.js';

/**
 * Owns the offline encyclopedia file on this computer: finds it at start, downloads it (the address, size and checksum come from the build's `encyclopedia.json`), adds one the writer
 * already has, removes it, and reports ONE honest status the Settings page shows. Everything the outside world provides (the manifest, the downloader, how a pack is opened, where
 * progress goes, free disk space) is passed in, so this is tested without Electron and without a network, and `main.js` and the tests use the same code.
 *
 *   status.state: 'unavailable' | 'absent' | 'downloading' | 'ready' | 'error'
 *     unavailable  this build has no download address (a file the writer already has can still be added)
 *     absent       not installed, and it can be downloaded
 *     ready        a pack is open (an `error` may still be shown beside it: a file the writer chose could not be used, and the one they have is untouched)
 *
 * The pack is used only through `current()` (the web search asks for it on every question). Nothing about its contents is logged or sent anywhere from here.
 */

const EXT = '.niepack';
const MARGIN_BYTES = 50 * 1024 * 1024; // room to keep free besides the file itself
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mb = (bytes) => `${Math.max(1, Math.round(bytes / 1048576)).toLocaleString('en-US')} MB`;

/** A file name made only of letters, digits, dot, dash and underscore (a name from a manifest or from the writer's file never becomes a path). */
const stem = (v) => String(v ?? '').replace(/\.niepack$/i, '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '').slice(0, 80);

/**
 * The build's description of the download, from `encyclopedia.json` (`readText` returns the file). Anything but a complete one (an https address without a login, a 64-digit
 * SHA-256, a size in bytes) means this build does not offer the download: null.
 */
export function readEncyclopediaManifest(readText) {
  try {
    const raw = JSON.parse(readText());
    if (!raw || typeof raw !== 'object') return null;
    const url = String(raw.url ?? '').trim();
    const u = new URL(url);
    if (u.protocol !== 'https:' || u.username || u.password) return null;
    const sha256 = String(raw.sha256 ?? '').trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(sha256)) return null;
    if (typeof raw.bytes !== 'number' || !Number.isSafeInteger(raw.bytes) || raw.bytes <= 0) return null;
    return {
      url,
      sha256,
      bytes: raw.bytes,
      name: stem(raw.name) || 'encyclopedia',
      title: typeof raw.title === 'string' ? raw.title.replace(/\s+/g, ' ').trim().slice(0, 80) : '',
      builtAt: typeof raw.builtAt === 'string' ? raw.builtAt.trim().slice(0, 40) : '',
      docs: Number.isSafeInteger(raw.docs) && raw.docs > 0 ? raw.docs : 0,
    };
  } catch {
    return null;
  }
}

/** A message for the writer: what the error says when that is plain words, otherwise `fallback` with the system's short code. A path never gets across. */
export function plainMessage(err, fallback = 'Something went wrong.') {
  const msg = String(err?.message ?? err ?? '').replace(/\s+/g, ' ').trim();
  if (!msg || err?.syscall || err?.path || /[A-Za-z]:\\|\\\\|\/(?:home|Users|root|tmp|var|mnt|opt|usr|private)\//.test(msg)) return err?.code ? `${fallback} (${err.code})` : fallback;
  return msg.slice(0, 400);
}
const sentence = (s) => (/[.!?]$/.test(s) ? s : `${s}.`);

/** The usual reasons a download fails, in plain words (the technical message stays out of the page). */
function friendlyDownloadError(err) {
  const msg = plainMessage(err, 'The file could not be saved.');
  if (/ENOTFOUND|EAI_AGAIN|fetch failed|ECONNREFUSED|ECONNRESET|ETIMEDOUT|No connection|interrupted|stopped receiving/i.test(msg)) {
    return "there is no working internet connection to the encyclopedia's download site. Connect and press Try again; the download continues where it stopped.";
  }
  return msg;
}

/**
 * @param {object} deps
 * @param {string} deps.dir                                   the folder the pack lives in (made when needed)
 * @param {() => (object|null)} [deps.readManifest]           `readEncyclopediaManifest(...)` of this build; null when it offers no download
 * @param {Function} deps.download                            `downloadModel` (model-download.js), or anything with its options and result
 * @param {(file: string) => Promise<object>} deps.openPack   the engine's `Pack.open`; it throws a plain-language Error for a file that cannot be used
 * @param {(status: object) => void} [deps.onChange]          called with the new status after every change, progress included
 * @param {(dir: string) => (number|null)} [deps.freeBytes]   free bytes on the drive that holds `dir`, null when unknown
 */
export function createEncyclopediaManager({ dir, readManifest = () => null, download, openPack, onChange = () => {}, freeBytes = defaultFreeBytes, margin = MARGIN_BYTES }) {
  let manifest;
  let manifestRead = false;
  const offered = () => {
    if (!manifestRead) {
      manifestRead = true;
      try {
        manifest = readManifest() ?? null;
      } catch {
        manifest = null;
      }
    }
    return manifest;
  };

  let pack = null; // the open Pack
  let packPath = '';
  let source = null; // how this session got it: 'download' | 'file' (null: found on disk at start, so not known)
  let lastError = '';
  let busy = ''; // '' | 'importing' | 'removing'
  let active = null; // the download in progress: { ctrl, received, total, done }
  let initializing = null;

  const listFiles = (suffix) => {
    try {
      return fs.readdirSync(dir).filter((n) => n.toLowerCase().endsWith(suffix)).map((n) => path.join(dir, n));
    } catch {
      return [];
    }
  };
  /** Pack files in the folder, the newest first. */
  const packFiles = () => listFiles(EXT).map((f) => {
    try {
      return { f, t: fs.statSync(f).mtimeMs };
    } catch {
      return { f, t: 0 }; // (it went away while the folder was being read)
    }
  }).sort((a, b) => b.t - a.t).map((x) => x.f);
  const hasFile = () => pack !== null || packFiles().length > 0;

  function status() {
    const m = offered();
    let info = null;
    try {
      info = pack?.info ?? null;
    } catch {
      info = null;
    }
    const state = active ? 'downloading' : pack ? 'ready' : lastError ? 'error' : m ? 'absent' : 'unavailable';
    return {
      state,
      available: Boolean(m),
      name: info?.name ?? m?.name ?? '',
      // what to call it: the pack's own title, or this build's title for it when the open file is that very pack (a file the writer added is never given the build's name)
      title: info?.title || (m && (!info || info.name === m.name) ? m.title : '') || '',
      docs: info?.docs ?? m?.docs ?? 0,
      bytes: info?.bytes ?? m?.bytes ?? 0,
      builtAt: info?.builtAt ?? m?.builtAt ?? '',
      license: info?.license ?? '',
      attribution: info?.attribution ?? '',
      source: pack ? source : null,
      progress: active ? { received: active.received, total: active.total } : null,
      error: lastError,
      busy,
      hasFile: hasFile(),
    };
  }
  const changed = () => {
    try {
      onChange(status());
    } catch {
      /* a listener that fails must not stop the encyclopedia */
    }
  };

  async function removeFile(file) {
    for (let i = 1; ; i++) {
      try {
        fs.rmSync(file, { force: true });
        return null;
      } catch (err) {
        if (i >= 5 || !['EPERM', 'EBUSY', 'EACCES'].includes(err?.code)) return err;
        await sleep(300 * i);
      }
    }
  }
  /** Any pack file or leftover partial download except `keep`: once one is installed, an older one is only in the way. Best effort. */
  async function dropOthers(keep) {
    for (const f of [...listFiles(EXT), ...listFiles(`${EXT}.part`)]) if (path.resolve(f) !== path.resolve(keep)) await removeFile(f);
  }
  async function renameInto(from, to) {
    for (let i = 1; ; i++) {
      try {
        fs.renameSync(from, to);
        return;
      } catch (err) {
        if (i >= 8 || !['EPERM', 'EBUSY', 'EACCES'].includes(err?.code)) throw Object.assign(new Error(`The file could not be put in place (${err?.code ?? 'error'}). Close other programs that may be scanning it and try again.`), { plain: true });
        await sleep(500 * i);
      }
    }
  }

  /** Open the newest pack file that can be opened. A file that cannot be is left where it is (the writer can remove it) and its message is kept. */
  async function init() {
    initializing = (async () => {
      try {
        fs.mkdirSync(dir, { recursive: true });
        for (const f of listFiles('.import.tmp')) fs.rmSync(f, { force: true }); // an import that was cut short
      } catch {
        /* the folder is made again when something is saved */
      }
      let firstProblem = '';
      for (const f of packFiles()) {
        try {
          pack = await openPack(f);
          packPath = f;
          firstProblem = '';
          break;
        } catch (err) {
          firstProblem ||= `The encyclopedia file on this computer cannot be used: ${sentence(plainMessage(err, 'It could not be opened.'))} Remove it, then download it again or add a file.`;
        }
      }
      lastError = pack ? '' : firstProblem;
      changed();
    })();
    try {
      await initializing;
    } catch {
      /* init never throws: a file that does not open is a status */
    } finally {
      initializing = null;
    }
    return status();
  }

  /** What a downloaded file must be before it is put in place: exactly the size the build promised, and a pack that opens. */
  const checkPart = (m) => async (file) => {
    const size = fs.statSync(file).size;
    if (size !== m.bytes) return { ok: false, size, problems: [{ message: size < m.bytes ? 'It is incomplete.' : 'It is not the file that was expected.' }] };
    try {
      const probe = await openPack(file);
      await probe?.close?.(); // (closed before it is renamed: Windows will not move an open file)
    } catch (err) {
      return { ok: false, size, problems: [{ message: sentence(plainMessage(err, 'It cannot be opened.')) }] };
    }
    return { ok: true, size, problems: [] };
  };

  /** Download the encyclopedia. Resolves with the status when it has finished, failed or been cancelled; it never throws. */
  async function start() {
    if (initializing) await initializing;
    const m = offered();
    if (active || busy || pack || !m) return status();
    const dest = path.join(dir, `${m.name}${EXT}`);
    let have = 0;
    try {
      have = fs.statSync(`${dest}.part`).size;
    } catch {
      /* a fresh download */
    }
    const run = { ctrl: new AbortController(), received: have, total: m.bytes, done: null };
    const before = lastError; // (a file on disk that could not be opened: still true after a cancel)
    active = run;
    lastError = '';
    changed(); // 'downloading' is said before anything else happens
    run.done = (async () => {
      let step = -1;
      try {
        fs.mkdirSync(dir, { recursive: true });
        const free = freeBytes(dir);
        const need = Math.max(0, m.bytes - have) + margin;
        if (free != null && free < need) throw Object.assign(new Error(`There is not enough free disk space for the offline encyclopedia: it needs about ${mb(need)} and only ${mb(free)} is free. Free some space and try again.`), { plain: true });
        await download({
          url: m.url,
          destPath: dest,
          minBytes: m.bytes,
          sha256: m.sha256,
          signal: run.ctrl.signal,
          freeBytes,
          validate: checkPart(m),
          what: 'encyclopedia',
          size: m.bytes,
          margin,
          onProgress: (p) => {
            run.received = p.received;
            run.total = p.total || m.bytes;
            const now = Math.floor((run.received / run.total) * 100);
            if (now !== step || run.received >= run.total) {
              step = now;
              changed();
            }
          },
        });
        pack = await openPack(dest);
        packPath = dest;
        source = 'download';
        lastError = '';
        await dropOthers(dest);
      } catch (err) {
        // Cancel is the writer's own choice, not a failure; the partial file stays so the next download carries on from it.
        const reason = friendlyDownloadError(err);
        lastError = run.ctrl.signal.aborted || err?.name === 'AbortError' ? before : /^(?:There is not enough|The disk is full)/.test(reason) ? reason : `The offline encyclopedia could not be downloaded: ${sentence(reason)}`;
      } finally {
        active = null;
        changed();
      }
    })();
    await run.done;
    return status();
  }

  async function cancel() {
    const run = active;
    if (!run) return status();
    run.ctrl.abort();
    await run.done;
    return status();
  }

  async function remove() {
    if (initializing) await initializing;
    if (busy) return status();
    if (active) await cancel();
    busy = 'removing';
    changed();
    const old = pack;
    pack = null; // (nothing asks the old one again, even while it closes)
    packPath = '';
    source = null;
    try {
      await old?.close?.();
    } catch {
      /* it is being deleted anyway */
    }
    lastError = '';
    let failed = null;
    for (const f of [...listFiles(EXT), ...listFiles(`${EXT}.part`), ...listFiles('.import.tmp')]) failed ??= await removeFile(f);
    if (failed) lastError = `The encyclopedia file could not be removed${failed.code ? ` (${failed.code})` : ''}. Close other programs that may be using it and try again.`;
    busy = '';
    changed();
    return status();
  }

  /** Add a pack file the writer already has: copied under a temporary name, opened to prove it is a pack, and only then put in place. A file that is no good changes nothing. */
  async function importFile(srcPath) {
    if (initializing) await initializing;
    if (active || busy) return status();
    busy = 'importing';
    lastError = '';
    changed();
    let tmp = '';
    try {
      const src = path.resolve(String(srcPath ?? ''));
      let st;
      try {
        st = fs.statSync(src);
      } catch {
        throw Object.assign(new Error('That file could not be found.'), { plain: true });
      }
      if (!st.isFile()) throw Object.assign(new Error('That is not a file.'), { plain: true });
      fs.mkdirSync(dir, { recursive: true });
      const final = path.join(dir, `${stem(path.basename(src)) || 'encyclopedia'}${EXT}`);
      if (pack && path.resolve(final) === path.resolve(src)) return status(); // it is the file already installed
      const free = freeBytes(dir);
      if (free != null && free < st.size + margin) throw Object.assign(new Error(`There is not enough free disk space to add this file: it needs about ${mb(st.size + margin)} and only ${mb(free)} is free. Free some space and try again.`), { plain: true });
      tmp = `${final}.import.tmp`;
      await fs.promises.copyFile(src, tmp);
      try {
        const probe = await openPack(tmp);
        await probe?.close?.();
      } catch (err) {
        throw Object.assign(new Error(`That file cannot be used: ${sentence(plainMessage(err, 'It is not an encyclopedia file.'))}`), { plain: true });
      }
      // The one in use is closed just before the new one takes its place (a file that is open cannot be replaced on Windows); if the swap fails it is opened again.
      const old = pack;
      const oldPath = packPath;
      pack = null;
      await old?.close?.();
      try {
        await renameInto(tmp, final);
        tmp = '';
        pack = await openPack(final);
        packPath = final;
        source = 'file';
      } catch (err) {
        if (oldPath && fs.existsSync(oldPath)) {
          try {
            pack = await openPack(oldPath);
            packPath = oldPath;
          } catch {
            /* nothing to go back to */
          }
        }
        throw err;
      }
      await dropOthers(final);
    } catch (err) {
      lastError = err?.plain ? err.message : sentence(plainMessage(err, 'The file could not be added.'));
      if (tmp) await removeFile(tmp);
    } finally {
      busy = '';
      changed();
    }
    return status();
  }

  async function close() {
    active?.ctrl.abort();
    const old = pack;
    pack = null;
    try {
      await old?.close?.();
    } catch {
      /* closing the app */
    }
  }

  return { init, current: () => pack, status, start, cancel, remove, importFile, close };
}
