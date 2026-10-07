import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { LocalModelManager } from '../apps/desktop/src/local-manager.js';
import { DEFAULT_MODEL } from '../apps/desktop/src/runtime.js';
import { OpenAICompatClient } from '../apps/web/src/engine/ai/openai-client.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';

const FAKE = fileURLToPath(new URL('./fixtures/fake-llama.mjs', import.meta.url));
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'nie-mgr-'));
const WIN_FILES = ['llama-server.exe', 'llama.dll', 'llama-common.dll', 'ggml.dll', 'ggml-base.dll', 'ggml-cpu-haswell.dll', 'mtmd.dll'];
const MODEL = { ...DEFAULT_MODEL, minBytes: 1000, url: 'set-per-test' };

function layoutWith({ runtime = WIN_FILES, bundledModel = false } = {}) {
  const root = tmp();
  const layout = { binDir: path.join(root, 'bin'), bundledModelsDir: path.join(root, 'models'), userModelsDir: path.join(root, 'user-models'), webRoot: path.join(root, 'web') };
  fs.mkdirSync(layout.binDir); fs.mkdirSync(layout.bundledModelsDir);
  for (const f of runtime) fs.writeFileSync(path.join(layout.binDir, f), 'x');
  if (bundledModel) fs.writeFileSync(path.join(layout.bundledModelsDir, MODEL.fileName), Buffer.concat([Buffer.from('GGUF'), Buffer.alloc(4000, 1)]));
  return layout;
}
const mgr = (layout, extra = {}) => new LocalModelManager({
  layout, model: MODEL, platform: 'win32',
  buildSpawn: ({ args }) => ({ command: process.execPath, args: [FAKE, ...args] }),
  clientFactory: (cfg) => new OpenAICompatClient(cfg),
  env: { ...process.env, FAKE_LLAMA_CWD_FILE: path.join(tmp(), 'c.txt'), FAKE_LLAMA_LOAD_MS: '150', FAKE_LLAMA_REPLY: 'offline NIE speaking' },
  ...extra,
});

test('bundled model: starting → ready automatically, and NIE answers through the one engine', async () => {
  const m = mgr(layoutWith({ bundledModel: true }));
  const states = [];
  m.on('status', (s) => states.push(s.state));
  const s = await m.init();
  assert.equal(s.state, 'ready');
  assert.equal(states[0], 'starting');
  assert.equal(states.at(-1), 'ready');
  const engine = new AIEngine({ local: { status: () => m.status, onStatus: () => () => {}, chat: (msgs, o) => m.chat(msgs, o) }, online: null, isOnline: () => false });
  assert.equal(engine.route(), 'local');
  assert.equal((await engine.chat([{ role: 'user', content: 'hi' }])).text, 'offline NIE speaking');
  await m.stop();
});

test('model missing → downloads it as part of first run, reports progress, then becomes ready', async () => {
  const data = Buffer.concat([Buffer.from('GGUF'), Buffer.alloc(300000, 3)]);
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Length': data.length });
    let i = 0;
    const t = setInterval(() => { // trickle so progress events fire
      if (i >= data.length) { clearInterval(t); return res.end(); }
      res.write(data.subarray(i, i + 60000)); i += 60000;
    }, 10);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const layout = layoutWith();
  const m = mgr(layout, { model: { ...MODEL, url: `http://127.0.0.1:${server.address().port}/m.gguf` } });
  const details = [];
  m.on('status', (s) => details.push(s.detail));
  try {
    const s = await m.init();
    assert.equal(s.state, 'ready');
    assert.ok(details.some((d) => /Downloading the offline model/.test(d ?? '')));
    assert.ok(fs.existsSync(path.join(layout.userModelsDir, MODEL.fileName)));
    assert.equal(m.info().model.exists, true);
    assert.equal(m.info().model.validation.ok, true);
  } finally { await m.stop(); server.close(); server.closeAllConnections?.(); }
});

const trickleServer = async (data, perTickMs = 15) => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Length': data.length });
    let i = 0;
    const t = setInterval(() => {
      if (i >= data.length) { clearInterval(t); return res.end(); }
      res.write(data.subarray(i, i + 30000)); i += 30000;
    }, perTickMs);
    res.on('close', () => clearInterval(t));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return server;
};

test('pressing Restart while the model is downloading really restarts it (it used to hand back the cancelled run and fail)', async () => {
  const data = Buffer.concat([Buffer.from('GGUF'), Buffer.alloc(600000, 3)]);
  const server = await trickleServer(data);
  const m = mgr(layoutWith(), { model: { ...MODEL, url: `http://127.0.0.1:${server.address().port}/m.gguf` } });
  const states = [];
  m.on('status', (s) => states.push(`${s.state}:${s.phase ?? ''}`));
  try {
    const first = m.init();
    for (let i = 0; i < 100 && !states.some((x) => x.endsWith('download')); i++) await new Promise((r) => setTimeout(r, 20));
    assert.ok(states.some((x) => x.endsWith('download')), 'download started');
    const s = await m.restart();
    await first;
    assert.equal(s.state, 'ready', `restart ended as ${s.state}: ${s.detail}`);
    assert.ok(!states.some((x) => x.startsWith('failed')), `a cancelled download is not a failure: ${states.join(', ')}`);
  } finally { await m.stop(); server.close(); server.closeAllConnections?.(); }
});

test('"Download the offline model" works even when automatic download is switched off, and does not change that setting', async () => {
  const data = Buffer.concat([Buffer.from('GGUF'), Buffer.alloc(100000, 3)]);
  const server = await trickleServer(data, 5);
  const m = mgr(layoutWith(), { autoDownload: false, model: { ...MODEL, url: `http://127.0.0.1:${server.address().port}/m.gguf` } });
  try {
    assert.equal((await m.init()).state, 'failed');
    assert.equal(m.info().autoDownload, false);
    const s = await m.download();
    assert.equal(s.state, 'ready');
    assert.equal(m.autoDownload, false, 'the saved preference is left alone');
  } finally { await m.stop(); server.close(); server.closeAllConnections?.(); }
});

test('with no internet the failure says so in plain words and carries the "download" phase so the UI can be truthful', async () => {
  const m = mgr(layoutWith(), { model: { ...MODEL, url: 'http://127.0.0.1:1/m.gguf' }, fetchImpl: async () => { throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ENOTFOUND' } }); } });
  const s = await m.init();
  assert.equal(s.state, 'failed');
  assert.equal(s.phase, 'download');
  assert.match(s.detail, /no working internet connection/);
});

test('download failure is reported as a failure, not as "starting forever"', async () => {
  const server = http.createServer((req, res) => { res.writeHead(503); res.end(); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const m = mgr(layoutWith(), { model: { ...MODEL, url: `http://127.0.0.1:${server.address().port}/m.gguf` } });
  try {
    const s = await m.init();
    assert.equal(s.state, 'failed');
    assert.match(s.detail, /could not be downloaded.*503/);
  } finally { server.close(); }
});

test('auto-download can be switched off; the status then says exactly what to do', async () => {
  const m = mgr(layoutWith(), { autoDownload: false });
  const s = await m.init();
  assert.equal(s.state, 'failed');
  assert.match(s.detail, /not installed.*Settings/);
});

test('incomplete runtime is reported before anything else (the missing CPU backend case)', async () => {
  const m = mgr(layoutWith({ runtime: ['llama-server.exe', 'llama.dll', 'ggml.dll', 'ggml-base.dll', 'llama-common.dll', 'mtmd.dll'], bundledModel: true }));
  const s = await m.init();
  assert.equal(s.state, 'failed');
  assert.match(s.detail, /no backends are loaded/);
  const info = m.info();
  assert.equal(info.runtime.ok, false);
  assert.equal(info.runtime.problems[0].code, 'cpu-backend-missing');
});

test('a corrupt bundled model is replaced by a verified download rather than loaded', async () => {
  const layout = layoutWith();
  fs.writeFileSync(path.join(layout.bundledModelsDir, MODEL.fileName), 'this is not a model '.repeat(200));
  const data = Buffer.concat([Buffer.from('GGUF'), Buffer.alloc(5000, 2)]);
  const server = http.createServer((req, res) => { res.writeHead(200, { 'Content-Length': data.length }); res.end(data); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const m = mgr(layout, { model: { ...MODEL, url: `http://127.0.0.1:${server.address().port}/m.gguf` } });
  try {
    assert.equal((await m.init()).state, 'ready');
    assert.ok(m.service.modelPath.startsWith(layout.userModelsDir));
  } finally { await m.stop(); server.close(); server.closeAllConnections?.(); }
});

test('a custom model path that is invalid fails clearly and never falls back silently', async () => {
  const bad = path.join(tmp(), 'mine.gguf');
  fs.writeFileSync(bad, 'nope');
  const m = mgr(layoutWith({ bundledModel: true }), { prefs: { customModelPath: bad } });
  const s = await m.init();
  assert.equal(s.state, 'failed');
});

test('restart gives a fresh process; stop leaves the service unavailable, not "ready"', async () => {
  const m = mgr(layoutWith({ bundledModel: true }));
  await m.init();
  const first = m.service._child.pid;
  const s = await m.restart();
  assert.equal(s.state, 'ready');
  assert.notEqual(m.service._child.pid, first);
  await m.stop();
  assert.equal(m.service.status.state, 'unavailable');
});
