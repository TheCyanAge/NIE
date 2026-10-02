import fs from 'node:fs';
import path from 'node:path';

/**
 * Where the llama.cpp runtime and the model live, and whether they are actually usable.
 * A file existing is not enough: the whole runtime must travel with llama-server, and the model must be intact.
 */

export const DEFAULT_MODEL = Object.freeze({
  id: 'qwen2.5-3b-instruct-q4_k_m',
  label: 'Qwen2.5 3B Instruct (Q4_K_M)',
  fileName: 'Qwen2.5-3B-Instruct-Q4_K_M.gguf',
  // The published file is ~1.93 GB; anything much smaller is truncated or not a model.
  minBytes: 1_800_000_000,
  url: 'https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf',
  contextSize: 4096,
});

/** Models selectable in Settings. The user-facing assistant is always NIE; this only picks its offline brain. */
export const MODEL_CATALOG = Object.freeze([DEFAULT_MODEL]);

export const GENERIC_MIN_MODEL_BYTES = 50 * 1024 * 1024;

export function serverFileName(platform = process.platform) {
  return platform === 'win32' ? 'llama-server.exe' : 'llama-server';
}

/** Resolve runtime/model locations for dev and for the packaged app. */
export function resolveLayout({ isPackaged, resourcesPath, desktopDir, userDataDir }) {
  const base = isPackaged ? resourcesPath : desktopDir;
  return {
    binDir: path.join(base, 'bin'),
    bundledModelsDir: path.join(base, 'models'),
    userModelsDir: path.join(userDataDir, 'models'),
    webRoot: isPackaged ? path.join(resourcesPath, 'web') : path.join(desktopDir, '..', 'web'),
  };
}

const REQUIRED = {
  win32: { exact: ['llama-server.exe', 'llama.dll', 'ggml.dll', 'ggml-base.dll'], cpu: /^ggml-cpu.*\.dll$/i, recommended: ['llama-common.dll', 'mtmd.dll'] },
  linux: { exact: ['llama-server'], any: [/^libllama\.so/, /^libggml\.so/, /^libggml-base\.so/], cpu: /^libggml-cpu.*\.so/, recommended: [] },
  darwin: { exact: ['llama-server'], any: [/^libllama.*\.dylib$/, /^libggml\.dylib$|^libggml\..*\.dylib$/, /^libggml-base.*\.dylib$/], cpu: /^libggml-cpu.*\.(dylib|so)$/, recommended: [] },
};

/**
 * @returns {{ ok: boolean, serverPath: string, problems: {code:string, message:string}[], warnings: string[], files: string[] }}
 */
export function validateRuntime(binDir, platform = process.platform) {
  const spec = REQUIRED[platform] ?? REQUIRED.linux;
  const problems = [];
  const warnings = [];
  let files = [];
  try {
    files = fs.readdirSync(binDir);
  } catch {
    return { ok: false, serverPath: path.join(binDir, serverFileName(platform)), problems: [{ code: 'runtime-missing', message: `The offline runtime folder is missing (${binDir}).` }], warnings, files };
  }
  const has = (n) => files.some((f) => f.toLowerCase() === n.toLowerCase());
  if (!has(serverFileName(platform))) problems.push({ code: 'server-missing', message: `${serverFileName(platform)} is missing from the runtime folder.` });
  for (const f of spec.exact.filter((x) => x !== serverFileName(platform))) if (!has(f)) problems.push({ code: 'dll-missing', message: `${f} is missing. llama-server needs its runtime libraries next to it.` });
  for (const re of spec.any ?? []) if (!files.some((f) => re.test(f))) problems.push({ code: 'dll-missing', message: `A required llama.cpp library matching ${re} is missing.` });
  if (!files.some((f) => spec.cpu.test(f))) {
    problems.push({ code: 'cpu-backend-missing', message: 'The llama.cpp CPU backend (ggml-cpu*) is missing. Without it llama-server reports "no backends are loaded" and cannot load the model.' });
  }
  for (const f of spec.recommended) if (!has(f)) warnings.push(`${f} is not present; llama-server may fail to start if it needs it.`);
  return { ok: problems.length === 0, serverPath: path.join(binDir, serverFileName(platform)), problems, warnings, files };
}

/**
 * Cheap integrity checks: present, plausible size, GGUF header. (Full hashing would delay startup.)
 */
export function validateModel(modelPath, { minBytes = GENERIC_MIN_MODEL_BYTES } = {}) {
  const problems = [];
  let stat;
  try {
    stat = fs.statSync(modelPath);
  } catch {
    return { ok: false, size: 0, problems: [{ code: 'model-missing', message: `The offline model file is missing (${path.basename(modelPath)}).` }] };
  }
  if (!stat.isFile()) return { ok: false, size: 0, problems: [{ code: 'model-missing', message: 'The offline model path is not a file.' }] };
  if (stat.size < minBytes) {
    problems.push({ code: 'model-too-small', message: `The offline model file is only ${(stat.size / 1048576).toFixed(0)} MB; it looks incomplete (expected at least ${(minBytes / 1048576).toFixed(0)} MB).` });
  }
  try {
    const fd = fs.openSync(modelPath, 'r');
    const head = Buffer.alloc(4);
    fs.readSync(fd, head, 0, 4, 0);
    fs.closeSync(fd);
    if (head.toString('latin1') !== 'GGUF') problems.push({ code: 'model-corrupt', message: 'The offline model file is not a valid GGUF model (bad header).' });
  } catch {
    problems.push({ code: 'model-unreadable', message: 'The offline model file could not be read.' });
  }
  return { ok: problems.length === 0, size: stat.size, problems };
}

/** Where the model may live, in priority order: bundled model, then the downloaded copy (or only the user's explicit choice). */
export function modelCandidates({ layout, model = DEFAULT_MODEL, customPath = null }) {
  // An explicit choice is never silently replaced by a different model.
  if (customPath) return [customPath];
  return [path.join(layout.bundledModelsDir, model.fileName), path.join(layout.userModelsDir, model.fileName)];
}

/**
 * First existing candidate wins, unless a `validate(path)` is given, in which case the first *valid* one wins
 * (so a damaged bundled model never shadows a good downloaded copy).
 */
export function locateModel({ layout, model = DEFAULT_MODEL, customPath = null, validate = null }) {
  const candidates = modelCandidates({ layout, model, customPath });
  if (validate) {
    const good = candidates.find((p) => fs.existsSync(p) && validate(p));
    if (good) return { path: good, exists: true, downloadTarget: path.join(layout.userModelsDir, model.fileName) };
    const anyExisting = candidates.find((p) => fs.existsSync(p));
    return { path: anyExisting ?? candidates.at(-1), exists: Boolean(anyExisting), valid: false, downloadTarget: path.join(layout.userModelsDir, model.fileName) };
  }
  const found = candidates.find((p) => {
    try {
      return fs.statSync(p).isFile();
    } catch {
      return false;
    }
  });
  return { path: found ?? candidates.at(-1), exists: Boolean(found), downloadTarget: path.join(layout.userModelsDir, model.fileName) };
}
