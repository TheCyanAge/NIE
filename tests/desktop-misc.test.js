import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import { downloadModel } from '../apps/desktop/src/model-download.js';
import { createUpdater, isConfigured, readUpdaterConfig } from '../apps/desktop/src/updater.js';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'nie-dl-'));

function modelBytes(size = 5000, magic = 'GGUF') {
  const b = Buffer.alloc(size, 7);
  b.write(magic, 0, 'latin1');
  return b;
}

/** A server with Range support that can cut the connection partway (to test resume). */
function serve(data, { cutAfter = null, noRange = false, status = 200 } = {}) {
  let cut = cutAfter;
  const hits = [];
  const server = http.createServer((req, res) => {
    hits.push(req.headers.range ?? null);
    if (status !== 200) { res.writeHead(status); return res.end(); }
    const m = /bytes=(\d+)-/.exec(req.headers.range ?? '');
    const start = m && !noRange ? Number(m[1]) : 0;
    const body = data.subarray(start);
    res.writeHead(start ? 206 : 200, { 'Content-Length': body.length, ...(start ? { 'Content-Range': `bytes ${start}-${data.length - 1}/${data.length}` } : {}) });
    if (cut != null && !start) {
      res.write(body.subarray(0, cut));
      cut = null;
      setTimeout(() => res.destroy(), 20);
      return;
    }
    res.end(body);
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r({ url: `http://127.0.0.1:${server.address().port}/m.gguf`, hits, close: () => server.close() })));
}

test('model download: verifies and installs atomically, reporting progress', async () => {
  const data = modelBytes();
  const s = await serve(data);
  const dest = path.join(tmp(), 'models', 'm.gguf');
  const seen = [];
  try {
    const r = await downloadModel({ url: s.url, destPath: dest, minBytes: 1000, onProgress: (p) => seen.push(p.percent) });
    assert.equal(r.size, data.length);
    assert.ok(fs.readFileSync(dest).equals(data));
    assert.equal(fs.existsSync(dest + '.part'), false);
    assert.equal(seen.at(-1), 100);
  } finally { s.close(); }
});

test('model download resumes an interrupted transfer with a Range request', async () => {
  const data = modelBytes(60000);
  const s = await serve(data, { cutAfter: 20000 });
  const dest = path.join(tmp(), 'm.gguf');
  try {
    await assert.rejects(downloadModel({ url: s.url, destPath: dest, minBytes: 1000 }));
    assert.equal(fs.existsSync(dest), false, 'a half-finished download is never the model');
    assert.ok(fs.statSync(dest + '.part').size > 0);
    const r = await downloadModel({ url: s.url, destPath: dest, minBytes: 1000 });
    assert.ok(fs.readFileSync(dest).equals(data));
    assert.match(s.hits.at(-1), /^bytes=\d+-$/);
    assert.equal(r.size, data.length);
  } finally { s.close(); }
});

test('model download rejects HTML error pages, truncated files and checksum mismatches', async () => {
  const bad = await serve(Buffer.from('<html>Access denied</html>'.repeat(400)));
  try {
    await assert.rejects(downloadModel({ url: bad.url, destPath: path.join(tmp(), 'm.gguf'), minBytes: 100 }), /not usable/);
  } finally { bad.close(); }
  const small = await serve(modelBytes(500));
  try {
    const dest = path.join(tmp(), 'm.gguf');
    await assert.rejects(downloadModel({ url: small.url, destPath: dest, minBytes: 10_000 }), /incomplete/);
    assert.equal(fs.existsSync(dest + '.part'), false, 'invalid partial removed');
  } finally { small.close(); }
  const data = modelBytes();
  const s = await serve(data);
  try {
    await assert.rejects(downloadModel({ url: s.url, destPath: path.join(tmp(), 'm.gguf'), minBytes: 100, sha256: 'deadbeef' }), /checksum/);
    const ok = await downloadModel({ url: s.url, destPath: path.join(tmp(), 'n.gguf'), minBytes: 100, sha256: crypto.createHash('sha256').update(data).digest('hex') });
    assert.equal(ok.size, data.length);
  } finally { s.close(); }
  const err = await serve(Buffer.alloc(1), { status: 404 });
  try { await assert.rejects(downloadModel({ url: err.url, destPath: path.join(tmp(), 'x.gguf'), minBytes: 1 }), /404/); } finally { err.close(); }
});

// ── updater ──────────────────────────────────────────────────────────────────

test('placeholder updater config is "not configured", never a fake "up to date"', async () => {
  const dir = tmp();
  const file = path.join(dir, 'updater-config.json');
  fs.writeFileSync(file, JSON.stringify({ provider: 'github', owner: '', repo: '' }));
  assert.equal(isConfigured(readUpdaterConfig(file)), false);
  assert.equal(isConfigured({ provider: 'github', owner: 'YOUR_GITHUB_USER', repo: 'NIE' }), false);
  assert.equal(isConfigured({ provider: 'github', owner: 'TheCyanAge', repo: 'NIE' }), true);
  assert.equal(readUpdaterConfig(path.join(dir, 'missing.json')).owner, '');

  let loaded = 0;
  const u = createUpdater({ isPackaged: true, config: readUpdaterConfig(file), loadAutoUpdater: async () => (loaded++, new EventEmitter()) });
  assert.equal(u.status().state, 'unconfigured');
  assert.match(u.status().message, /aren't configured/);
  assert.equal((await u.check()).state, 'unconfigured');
  assert.equal(loaded, 0, 'the updater library is never touched when unconfigured');
  assert.equal(u.install().ok, false);
});

test('development builds report that updates only work when installed', () => {
  const u = createUpdater({ isPackaged: false, config: { provider: 'github', owner: 'a', repo: 'b' }, loadAutoUpdater: async () => new EventEmitter() });
  assert.equal(u.status().state, 'unconfigured');
  assert.match(u.status().message, /installed app/);
});

test('configured updater: check → available → downloading → downloaded → install', async () => {
  const au = new EventEmitter();
  au.setFeedURL = (f) => (au.feed = f);
  au.checkForUpdates = async () => {
    au.emit('checking-for-update');
    au.emit('update-available', { version: '0.2.0' });
    au.emit('download-progress', { percent: 42.4 });
    au.emit('update-downloaded', { version: '0.2.0' });
  };
  au.quitAndInstall = (...a) => (au.installed = a);
  const seen = [];
  const u = createUpdater({ isPackaged: true, config: { provider: 'github', owner: 'TheCyanAge', repo: 'NIE' }, loadAutoUpdater: async () => au, onStatus: (s) => seen.push(s.state), currentVersion: '0.1.0' });
  assert.equal(u.status().state, 'idle');
  assert.equal(u.install().ok, false, 'nothing to install yet');
  const s = await u.check();
  assert.equal(s.state, 'downloaded');
  assert.deepEqual(seen, ['checking', 'available', 'downloading', 'downloaded']);
  assert.deepEqual(au.feed, { provider: 'github', owner: 'TheCyanAge', repo: 'NIE' });
  assert.equal(u.install().ok, true);
  assert.deepEqual(au.installed, [false, true]);
});

test('updater errors are surfaced, not swallowed', async () => {
  const au = new EventEmitter();
  au.checkForUpdates = async () => { throw new Error('offline'); };
  const u = createUpdater({ isPackaged: true, config: { provider: 'github', owner: 'a', repo: 'b' }, loadAutoUpdater: async () => au });
  const s = await u.check();
  assert.equal(s.state, 'error');
  assert.match(s.message, /offline/);
});
