// Fetches the offline brain for a build: the COMPLETE llama.cpp runtime and the Qwen model.
//   npm run fetch:runtime                       # Windows CPU runtime + model
//   node scripts/fetch-runtime.mjs --no-model   # runtime only
//   node scripts/fetch-runtime.mjs --tag b9085 --asset win-cpu-x64
//
// The whole runtime must travel with llama-server: llama.dll, ggml.dll, ggml-base.dll, a ggml-cpu*.dll backend, ...
// (a missing CPU backend is what produced "no backends are loaded" / "failed to load model").
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readZip } from '../apps/web/src/engine/ingest/zip.js';
import { validateRuntime, DEFAULT_MODEL } from '../apps/desktop/src/runtime.js';
import { downloadModel } from '../apps/desktop/src/model-download.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const flag = (name) => args.includes(name);

const tag = opt('--tag', 'b9085');
const asset = opt('--asset', 'win-cpu-x64');
const platform = asset.startsWith('win') ? 'win32' : asset.startsWith('macos') ? 'darwin' : 'linux';
const binDir = path.join(root, 'apps/desktop/bin');
const modelsDir = path.join(root, 'apps/desktop/models');

async function fetchRuntime() {
  const url = `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/llama-${tag}-bin-${asset}.zip`;
  console.log(`Downloading llama.cpp runtime: ${url}`);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Runtime download failed (${res.status}). Check --tag/--asset against https://github.com/ggml-org/llama.cpp/releases`);
  const zip = await readZip(new Uint8Array(await res.arrayBuffer()));
  fs.mkdirSync(binDir, { recursive: true });
  let n = 0;
  for (const name of zip.names()) {
    if (name.endsWith('/')) continue;
    const bytes = await zip.read(name);
    fs.writeFileSync(path.join(binDir, path.basename(name)), bytes); // flatten: every file next to llama-server
    n++;
  }
  console.log(`Extracted ${n} files into ${path.relative(root, binDir)}`);
  const check = validateRuntime(binDir, platform);
  if (!check.ok) {
    console.error('Runtime is INCOMPLETE:\n - ' + check.problems.map((p) => p.message).join('\n - '));
    process.exitCode = 1;
  } else {
    console.log('Runtime check: complete (' + check.files.length + ' files, CPU backend present).');
    for (const w of check.warnings) console.warn('Note: ' + w);
  }
}

async function fetchModel() {
  const dest = path.join(modelsDir, DEFAULT_MODEL.fileName);
  console.log(`Downloading ${DEFAULT_MODEL.label} (~1.9 GB), resumable: ${DEFAULT_MODEL.url}`);
  let last = -1;
  const r = await downloadModel({
    url: DEFAULT_MODEL.url,
    destPath: dest,
    minBytes: DEFAULT_MODEL.minBytes,
    onProgress: (p) => {
      const pct = p.percent == null ? null : Math.floor(p.percent);
      if (pct !== null && pct !== last && pct % 5 === 0) { last = pct; process.stdout.write(`  ${pct}%\r`); }
    },
  });
  console.log(`\nModel ready: ${path.relative(root, r.path)} (${(r.size / 1073741824).toFixed(2)} GB, GGUF header and size verified)`);
}

try {
  if (!flag('--no-runtime')) await fetchRuntime();
  if (!flag('--no-model')) await fetchModel();
} catch (err) {
  console.error(String(err?.message ?? err));
  process.exit(1);
}
