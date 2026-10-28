import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { Readable } from 'node:stream';
import { createEncyclopediaManager, plainMessage, readEncyclopediaManifest } from '../apps/desktop/src/encyclopedia-manager.js';
import { downloadModel } from '../apps/desktop/src/model-download.js';
import { Pack } from '../apps/web/src/engine/encyclopedia/pack.js';
import { buildFromDump } from '../apps/web/src/engine/encyclopedia/build.js';
import { sampleDump } from './fixtures/cirrus-sample.mjs';

// The desktop's encyclopedia manager, tested without Electron: real small packs (built by the engine) in a temp folder, a real downloader against a local server, and fakes for the rest.

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'nie-enc-'));
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const PACK = (await buildFromDump(Readable.from([sampleDump()]), { name: 'sample', lang: 'en', builtAt: '2026-01-01' })).bytes;
const OTHER = (await buildFromDump(Readable.from([sampleDump()]), { name: 'other', lang: 'en', builtAt: '2026-02-02', maxDocs: 3 })).bytes; // a different pack: three articles
const JUNK = Buffer.from('this is not an encyclopedia pack at all, only text of about the right shape');

/** A server with Range support. `hold`: the first request sends this many bytes and then waits (until the server closes), so a download can be cancelled in the middle. */
function serve(data, { hold = null, status = 200 } = {}) {
  const hits = [];
  let held = hold;
  const sockets = new Set();
  const server = http.createServer((req, res) => {
    hits.push(req.headers.range ?? null);
    if (status !== 200) { res.writeHead(status); return res.end(); }
    const m = /bytes=(\d+)-/.exec(req.headers.range ?? '');
    const start = m ? Number(m[1]) : 0;
    const body = data.subarray(start);
    res.writeHead(start ? 206 : 200, { 'Content-Length': body.length, ...(start ? { 'Content-Range': `bytes ${start}-${data.length - 1}/${data.length}` } : {}) });
    if (held != null && !start) {
      res.write(body.subarray(0, held));
      held = null; // (the connection stays open and silent)
      return;
    }
    res.end(body);
  });
  server.on('connection', (s) => { sockets.add(s); s.on('close', () => sockets.delete(s)); });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r({ url: `http://127.0.0.1:${server.address().port}/pack.niepack`, hits, close: () => { for (const s of sockets) s.destroy(); server.close(); } })));
}

const manifestFor = (url, data, extra = {}) => ({ url, sha256: sha(data), bytes: data.length, name: 'wikipedia-sample', builtAt: '2026-01-01', docs: 6, ...extra });
/** The manager as `main.js` builds it, with the real downloader (quick to give up) and real packs; `changes` collects every status it announces. */
function desk({ dir = tmp(), manifest = null, download = (o) => downloadModel({ ...o, attempts: 1, retryDelayMs: 5 }), freeBytes = () => 1e12, openPack = (f) => Pack.open(f) } = {}) {
  const changes = [];
  const manager = createEncyclopediaManager({ dir, readManifest: () => manifest, download, openPack, freeBytes, onChange: (s) => changes.push(s) });
  return { manager, dir, changes, files: () => fs.readdirSync(dir).sort() };
}
const put = (dir, name, data) => { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, name), data); };

// ── the manifest ─────────────────────────────────────────────────────────────

test('the manifest of a build is read tolerantly: only a complete one with an https address counts, anything else means the download is not offered', () => {
  const good = { url: 'https://example.org/wiki.niepack', sha256: 'A'.repeat(64), bytes: 1234, name: 'Wikipedia en/2026!', builtAt: '2026-01-01', docs: 50000 };
  const read = (o) => readEncyclopediaManifest(() => (typeof o === 'string' ? o : JSON.stringify(o)));
  assert.deepEqual(read(good), { url: 'https://example.org/wiki.niepack', sha256: 'a'.repeat(64), bytes: 1234, name: 'Wikipedia-en-2026', title: '', builtAt: '2026-01-01', docs: 50000 }, 'the name becomes a safe file name, the checksum lower case');
  assert.equal(read({ ...good, name: '' }).name, 'encyclopedia');
  assert.equal(read({ ...good, name: '../../evil' }).name, 'evil', 'a name never becomes a path');
  assert.equal(read({ ...good, docs: 'many', builtAt: 5 }).docs, 0);
  for (const bad of [
    { url: '', sha256: '', bytes: 0, name: '', builtAt: '', docs: 0 }, // the file as shipped
    { ...good, url: 'http://example.org/x.niepack' },
    { ...good, url: 'https://user:pw@example.org/x.niepack' },
    { ...good, url: 'ftp://example.org/x.niepack' },
    { ...good, url: 'not an address' },
    { ...good, sha256: 'abc' },
    { ...good, sha256: 'z'.repeat(64) },
    { ...good, bytes: 0 },
    { ...good, bytes: -5 },
    { ...good, bytes: 12.5 },
    { ...good, bytes: '1234' },
    [], null, 'not json', '{"url":',
  ]) assert.equal(read(bad), null, JSON.stringify(bad));
  assert.equal(readEncyclopediaManifest(() => { throw new Error('no such file'); }), null, 'a missing file is no download');
  // the manifest this repository ships is either empty (not offered) or complete: never half-filled, and never pointing anywhere but this project's own releases
  const shipped = JSON.parse(fs.readFileSync(new URL('../apps/desktop/encyclopedia.json', import.meta.url), 'utf8'));
  const read1 = readEncyclopediaManifest(() => JSON.stringify(shipped));
  if (shipped.url === '') assert.equal(read1, null, 'empty means the download is not offered');
  else {
    assert.ok(read1, 'a filled manifest must be one the app accepts (https address, 64-digit SHA-256, size)');
    assert.match(read1.url, /^https:\/\/github\.com\/TheCyanAge\/NIE\/releases\/download\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\.niepack$/);
    assert.ok(read1.docs > 0 && read1.builtAt, 'and says what it holds and when it was built');
  }
  assert.match(fs.readFileSync(new URL('../apps/desktop/package.json', import.meta.url), 'utf8'), /"encyclopedia\.json"/, 'and it is packed into the app');
});

test('an error shown to the writer never carries a path', () => {
  assert.equal(plainMessage(Object.assign(new Error("ENOENT: no such file or directory, open 'C:\\Users\\ann\\AppData\\x'"), { code: 'ENOENT', syscall: 'open', path: 'C:\\Users\\ann\\AppData\\x' }), 'The file could not be read.'), 'The file could not be read. (ENOENT)');
  assert.equal(plainMessage(new Error('Failed in /home/ann/.config/nie/encyclopedia/x.niepack'), 'Sorry.'), 'Sorry.');
  assert.equal(plainMessage(new Error('This is not an encyclopedia pack.'), 'Sorry.'), 'This is not an encyclopedia pack.');
  assert.equal(plainMessage(null, 'Sorry.'), 'Sorry.');
});

// ── finding a file at start ──────────────────────────────────────────────────

test('start: with no file it is absent when the build offers a download, and says honestly that it is unavailable when it does not', async () => {
  const offered = desk({ manifest: manifestFor('https://example.org/x.niepack', PACK) });
  const s = await offered.manager.init();
  assert.equal(s.state, 'absent');
  assert.equal(s.available, true);
  assert.equal(s.bytes, PACK.length, 'the size of the download, from the manifest');
  assert.equal(s.builtAt, '2026-01-01');
  assert.equal(offered.manager.current(), null);
  assert.equal(s.error, '');
  assert.equal(s.hasFile, false);
  assert.equal(offered.changes.length, 1, 'announced once');

  const none = desk({ manifest: null });
  const u = await none.manager.init();
  assert.deepEqual([u.state, u.available, u.error, u.progress, u.source], ['unavailable', false, '', null, null]);
  assert.equal(none.manager.current(), null);
  assert.equal((await none.manager.start()).state, 'unavailable', 'nothing to download in this build, so nothing is started');
  assert.equal(fs.existsSync(path.join(none.dir, 'encyclopedia.niepack')), false);
});

test('start: a valid file is opened and answers questions; the status carries what the page shows and what the licence needs', async () => {
  const d = desk({ manifest: manifestFor('https://example.org/x.niepack', PACK) });
  put(d.dir, 'wikipedia-sample.niepack', PACK);
  const s = await d.manager.init();
  assert.equal(s.state, 'ready');
  assert.equal(s.docs, 6);
  assert.equal(s.builtAt, '2026-01-01');
  assert.equal(s.bytes, PACK.length);
  assert.equal(s.license, 'CC BY-SA 4.0');
  assert.match(s.attribution, /creativecommons\.org\/licenses\/by-sa\/4\.0/);
  assert.equal(s.hasFile, true);
  assert.equal(s.source, null, 'found on disk, so how it got there is not known');
  assert.equal((await d.manager.current().search('who wrote The Salt Ledger'))[0].title, 'Ilse Quarrel');
  await d.manager.close();
});

test('start: a file that cannot be opened is a plain status, never a crash, and it is left for the writer to remove', async () => {
  const d = desk({ manifest: manifestFor('https://example.org/x.niepack', PACK) });
  put(d.dir, 'wikipedia-sample.niepack', PACK.subarray(0, PACK.length - 40));
  const s = await d.manager.init();
  assert.equal(s.state, 'error');
  assert.match(s.error, /cannot be used: .*cut short/);
  assert.ok(!s.error.includes(d.dir), 'no path');
  assert.equal(d.manager.current(), null);
  assert.equal(s.hasFile, true);
  assert.equal(s.available, true, 'it can be downloaded again');
  assert.deepEqual(d.files(), ['wikipedia-sample.niepack'], 'left where it is');
  const r = await d.manager.remove();
  assert.deepEqual([r.state, r.error, r.hasFile], ['absent', '', false]);
  assert.deepEqual(d.files(), []);

  const junk = desk();
  put(junk.dir, 'x.niepack', JUNK);
  const j = await junk.manager.init();
  assert.equal(j.state, 'error');
  assert.match(j.error, /not an encyclopedia pack/);
});

test('start: of several files the newest one that opens is used', async () => {
  const d = desk();
  put(d.dir, 'old.niepack', PACK);
  put(d.dir, 'new.niepack', JUNK);
  const now = Date.now() / 1000;
  fs.utimesSync(path.join(d.dir, 'old.niepack'), now - 100, now - 100);
  fs.utimesSync(path.join(d.dir, 'new.niepack'), now, now);
  const s = await d.manager.init();
  assert.equal(s.state, 'ready', 'the newer file is no good; the older one is');
  assert.equal(s.error, '');
  await d.manager.close();
});

// ── downloading ──────────────────────────────────────────────────────────────

test('download: the file is fetched, proved to be a pack, put in place and opened; progress is announced on the way', async () => {
  const srv = await serve(PACK);
  const d = desk({ manifest: manifestFor(srv.url, PACK) });
  try {
    await d.manager.init();
    const done = await d.manager.start();
    assert.equal(done.state, 'ready');
    assert.equal(done.source, 'download');
    assert.equal(done.docs, 6);
    assert.deepEqual(d.files(), ['wikipedia-sample.niepack'], 'no .part left behind');
    assert.ok(fs.readFileSync(path.join(d.dir, 'wikipedia-sample.niepack')).equals(PACK));
    assert.equal((await d.manager.current().search('Marlowe Bridge'))[0].title, 'Marlowe Bridge');
    const states = d.changes.map((c) => c.state);
    assert.deepEqual(states.filter((s, i) => s !== states[i - 1]), ['absent', 'downloading', 'ready']);
    const downloading = d.changes.filter((c) => c.state === 'downloading');
    assert.deepEqual(downloading[0].progress, { received: 0, total: PACK.length }, 'announced before the first byte');
    assert.ok(downloading.some((c) => c.progress.received === PACK.length), 'and at the end');
    assert.ok(downloading.every((c, i) => i === 0 || c.progress.received >= downloading[i - 1].progress.received), 'never backwards');
    assert.equal(done.progress, null);
    // asking again changes nothing
    assert.equal((await d.manager.start()).state, 'ready');
    assert.equal(srv.hits.length, 1);
  } finally { srv.close(); await d.manager.close(); }
});

test('download: a checksum that does not match installs nothing, and says so', async () => {
  const srv = await serve(PACK);
  const d = desk({ manifest: manifestFor(srv.url, PACK, { sha256: 'f'.repeat(64) }) });
  try {
    await d.manager.init();
    const s = await d.manager.start();
    assert.equal(s.state, 'error');
    assert.match(s.error, /^The offline encyclopedia could not be downloaded: The downloaded encyclopedia failed its checksum and was discarded\.$/);
    assert.equal(d.manager.current(), null);
    assert.deepEqual(d.files(), [], 'neither the file nor the part');
    assert.equal(s.available, true, 'and it can be tried again');
  } finally { srv.close(); }
});

test('download: a file that is not a pack, or not the size promised, is discarded before it is put in place', async () => {
  const junk = await serve(JUNK);
  const d = desk({ manifest: manifestFor(junk.url, JUNK) }); // the right size and checksum for what it is, but not a pack
  try {
    await d.manager.init();
    const s = await d.manager.start();
    assert.equal(s.state, 'error');
    assert.match(s.error, /The downloaded encyclopedia is not usable: This is not an encyclopedia pack\./);
    assert.deepEqual(d.files(), [], 'the part file is removed');
  } finally { junk.close(); }

  const short = await serve(PACK.subarray(0, PACK.length - 100));
  const e = desk({ manifest: manifestFor(short.url, PACK, { sha256: sha(PACK.subarray(0, PACK.length - 100)) }) }); // the server has less than the manifest promised
  try {
    await e.manager.init();
    const s = await e.manager.start();
    assert.equal(s.state, 'error');
    assert.match(s.error, /not usable: It is incomplete\./);
    assert.deepEqual(e.files(), []);
  } finally { short.close(); }
});

test('download: the server being unreachable or refusing is said in plain words', async () => {
  const gone = await serve(PACK, { status: 404 });
  const d = desk({ manifest: manifestFor(gone.url, PACK) });
  try {
    await d.manager.init();
    const s = await d.manager.start();
    assert.equal(s.state, 'error');
    assert.match(s.error, /could not be downloaded: Download failed: the server returned 404\./);
  } finally { gone.close(); }

  const nowhere = desk({ manifest: manifestFor('http://127.0.0.1:1/x.niepack', PACK) });
  const n = await nowhere.manager.start();
  assert.equal(n.state, 'error');
  assert.match(n.error, /no working internet connection to the encyclopedia's download site\. Connect and press Try again/);
});

test('download: with too little free space nothing is requested, and the message says how much is needed', async () => {
  const srv = await serve(PACK);
  const d = desk({ manifest: manifestFor(srv.url, PACK), freeBytes: () => 1024 * 1024 });
  try {
    const s = await d.manager.start();
    assert.equal(s.state, 'error');
    assert.match(s.error, /^There is not enough free disk space for the offline encyclopedia: it needs about \d+ MB and only 1 MB is free\. Free some space and try again\.$/);
    assert.equal(srv.hits.length, 0);
    assert.deepEqual(d.files(), []);
  } finally { srv.close(); }
});

test('download: Cancel stops it without an error and without a half-installed file; the next download carries on from the partial one', async () => {
  const srv = await serve(PACK, { hold: Math.floor(PACK.length / 2) });
  const d = desk({ manifest: manifestFor(srv.url, PACK) });
  try {
    await d.manager.init();
    const running = d.manager.start();
    await new Promise((resolve) => { const t = setInterval(() => { if (d.changes.some((c) => c.state === 'downloading' && c.progress.received > 0)) { clearInterval(t); resolve(); } }, 5); });
    assert.equal(d.manager.status().state, 'downloading');
    const stopped = await d.manager.cancel();
    assert.deepEqual([stopped.state, stopped.error, stopped.progress], ['absent', '', null]);
    assert.equal((await running).state, 'absent');
    assert.equal(d.manager.current(), null);
    assert.ok(!d.files().includes('wikipedia-sample.niepack'), 'nothing is installed');
    assert.deepEqual(d.files(), ['wikipedia-sample.niepack.part'], 'the partial file stays, to resume');

    const done = await d.manager.start();
    assert.equal(done.state, 'ready');
    assert.match(srv.hits.at(-1), /^bytes=\d+-$/, 'it asked only for the rest');
    assert.deepEqual(d.files(), ['wikipedia-sample.niepack']);
  } finally { srv.close(); await d.manager.close(); }
});

test('download: only one at a time, and the manager hands the downloader everything it needs to prove the file', async () => {
  const calls = [];
  let release;
  const gate = new Promise((r) => (release = r));
  const download = async (o) => {
    calls.push(o);
    o.onProgress({ received: 10, total: 0 });
    await gate;
    fs.writeFileSync(`${o.destPath}.part`, PACK);
    assert.deepEqual(await o.validate(`${o.destPath}.part`), { ok: true, size: PACK.length, problems: [] }, 'the check the manager gives the downloader accepts the real pack');
    fs.writeFileSync(`${o.destPath}.part`, JUNK);
    const bad = await o.validate(`${o.destPath}.part`);
    assert.equal(bad.ok, false);
    fs.renameSync(`${o.destPath}.part`, o.destPath);
    fs.writeFileSync(o.destPath, PACK);
  };
  const m = manifestFor('https://example.org/x.niepack', PACK);
  const d = desk({ manifest: m, download });
  await d.manager.init();
  const first = d.manager.start();
  const second = d.manager.start();
  assert.equal(d.manager.status().state, 'downloading');
  assert.deepEqual(d.manager.status().progress, { received: 10, total: PACK.length }, 'the size is the manifest\'s when the server does not say');
  release();
  const [a, b] = await Promise.all([first, second]);
  assert.equal(calls.length, 1, 'one download');
  assert.equal(a.state, 'ready');
  assert.equal(b.state, 'downloading', 'the second call changed nothing and reported what was going on');
  assert.equal(calls[0].url, m.url);
  assert.equal(calls[0].sha256, m.sha256);
  assert.equal(calls[0].minBytes, m.bytes);
  assert.equal(calls[0].what, 'encyclopedia');
  assert.equal(calls[0].size, m.bytes);
  assert.equal(path.basename(calls[0].destPath), 'wikipedia-sample.niepack');
  assert.equal(typeof calls[0].signal.aborted, 'boolean');
  await d.manager.close();
});

test('download: a failure of any kind, even an unexpected exception from a path, reaches the page as words only', async () => {
  const d = desk({ manifest: manifestFor('https://example.org/x.niepack', PACK), download: async () => { throw Object.assign(new Error(`EACCES: permission denied, open '${path.join(os.tmpdir(), 'secret', 'x.part')}'`), { code: 'EACCES', syscall: 'open', path: os.tmpdir() }); } });
  const s = await d.manager.start();
  assert.equal(s.state, 'error');
  assert.ok(!s.error.includes(os.tmpdir()));
  assert.match(s.error, /could not be downloaded: The file could not be saved\. \(EACCES\)\./);
});

// ── removing ─────────────────────────────────────────────────────────────────

test('remove: the pack is closed first, the file is deleted and the status goes back to absent', async () => {
  const d = desk({ manifest: manifestFor('https://example.org/x.niepack', PACK) });
  put(d.dir, 'wikipedia-sample.niepack', PACK);
  put(d.dir, 'wikipedia-sample.niepack.part', Buffer.from('half'));
  await d.manager.init();
  const pack = d.manager.current();
  assert.ok(pack);
  const s = await d.manager.remove();
  assert.deepEqual([s.state, s.hasFile, s.error], ['absent', false, '']);
  assert.equal(d.manager.current(), null);
  assert.deepEqual(d.files(), [], 'the file and a leftover part are gone');
  await assert.rejects(pack.search('bridge'), undefined, 'the old pack was really closed');
  assert.ok(d.changes.some((c) => c.busy === 'removing'), 'announced while it happens');
  assert.equal((await d.manager.remove()).state, 'absent', 'removing nothing is fine');

  const none = desk({ manifest: null });
  put(none.dir, 'x.niepack', PACK);
  await none.manager.init();
  assert.equal((await none.manager.remove()).state, 'unavailable');
});

// ── adding a file the writer already has ────────────────────────────────────

test('import: a pack the writer has is copied in, proved, and opened; the original is left alone', async () => {
  const d = desk({ manifest: null });
  const src = path.join(tmp(), 'My Wikipedia copy.niepack');
  fs.writeFileSync(src, PACK);
  await d.manager.init();
  const s = await d.manager.importFile(src);
  assert.equal(s.state, 'ready');
  assert.equal(s.source, 'file');
  assert.equal(s.docs, 6);
  assert.deepEqual(d.files(), ['My-Wikipedia-copy.niepack'], 'under a safe name, no temporary file left');
  assert.ok(fs.readFileSync(src).equals(PACK), 'the original is untouched');
  assert.equal(d.manager.current().info.name, 'sample');
  assert.ok(d.changes.some((c) => c.busy === 'importing'));
  await d.manager.close();
});

test('import: a file that is not a pack, is cut short or is missing changes nothing, says why, and leaves a working encyclopedia working', async () => {
  const d = desk({ manifest: null });
  const away = tmp();
  fs.writeFileSync(path.join(away, 'junk.niepack'), JUNK);
  fs.writeFileSync(path.join(away, 'cut.niepack'), PACK.subarray(0, PACK.length - 40));
  await d.manager.init();
  let s = await d.manager.importFile(path.join(away, 'junk.niepack'));
  assert.equal(s.state, 'error', 'nothing installed, so the status is the problem');
  assert.match(s.error, /^That file cannot be used: This is not an encyclopedia pack\.$/);
  assert.deepEqual(d.files(), [], 'no copy, no temporary file');
  s = await d.manager.importFile(path.join(away, 'cut.niepack'));
  assert.match(s.error, /That file cannot be used: .*cut short/);
  s = await d.manager.importFile(path.join(away, 'missing.niepack'));
  assert.equal(s.error, 'That file could not be found.');
  assert.ok(!s.error.includes(away));
  s = await d.manager.importFile(away);
  assert.equal(s.error, 'That is not a file.');

  // with one already installed, a bad file is refused beside it
  fs.writeFileSync(path.join(away, 'good.niepack'), PACK);
  assert.equal((await d.manager.importFile(path.join(away, 'good.niepack'))).state, 'ready');
  const kept = d.manager.current();
  s = await d.manager.importFile(path.join(away, 'junk.niepack'));
  assert.equal(s.state, 'ready', 'the encyclopedia in use still works');
  assert.match(s.error, /That file cannot be used/);
  assert.equal(d.manager.current(), kept, 'the very same open pack');
  assert.equal((await kept.search('Marlowe Bridge'))[0].title, 'Marlowe Bridge');
  assert.deepEqual(d.files(), ['good.niepack']);
  await d.manager.close();
});

test('import: a file of the same name replaces the one in use; a differently named one replaces it too, so there is only ever one', async () => {
  const d = desk({ manifest: null });
  const a = tmp();
  const b = tmp();
  fs.writeFileSync(path.join(a, 'wiki.niepack'), PACK);
  fs.writeFileSync(path.join(b, 'wiki.niepack'), OTHER);
  fs.writeFileSync(path.join(b, 'second.niepack'), PACK);
  await d.manager.init();
  assert.equal((await d.manager.importFile(path.join(a, 'wiki.niepack'))).docs, 6);
  const first = d.manager.current();
  const replaced = await d.manager.importFile(path.join(b, 'wiki.niepack'));
  assert.equal(replaced.state, 'ready');
  assert.equal(replaced.docs, 3, 'the new one');
  assert.notEqual(d.manager.current(), first);
  assert.deepEqual(d.files(), ['wiki.niepack']);
  assert.ok(fs.readFileSync(path.join(d.dir, 'wiki.niepack')).equals(OTHER));
  const renamed = await d.manager.importFile(path.join(b, 'second.niepack'));
  assert.equal(renamed.docs, 6);
  assert.deepEqual(d.files(), ['second.niepack'], 'the older file is gone');
  // the installed file offered again is the one already in use
  const again = await d.manager.importFile(path.join(d.dir, 'second.niepack'));
  assert.equal(again.state, 'ready');
  assert.deepEqual(d.files(), ['second.niepack']);
  await d.manager.close();
});

test('import: it also works in a build that offers no download, replaces a broken file, and respects free space', async () => {
  const d = desk({ manifest: null });
  put(d.dir, 'broken.niepack', JUNK);
  const src = path.join(tmp(), 'good.niepack');
  fs.writeFileSync(src, PACK);
  assert.equal((await d.manager.init()).state, 'error');
  const s = await d.manager.importFile(src);
  assert.deepEqual([s.state, s.error, s.available], ['ready', '', false]);
  assert.deepEqual(d.files(), ['good.niepack'], 'the broken file went');
  await d.manager.close();

  const tight = desk({ manifest: null, freeBytes: () => 2 * 1024 * 1024 });
  const t = await tight.manager.importFile(src);
  assert.equal(t.state, 'error');
  assert.match(t.error, /not enough free disk space to add this file: it needs about \d+ MB and only 2 MB is free/);
  assert.deepEqual(tight.files(), []);
});

test('import and download do not run over each other', async () => {
  const srv = await serve(PACK, { hold: 100 });
  const d = desk({ manifest: manifestFor(srv.url, PACK) });
  const src = path.join(tmp(), 'x.niepack');
  fs.writeFileSync(src, PACK);
  try {
    await d.manager.init();
    const running = d.manager.start();
    assert.equal((await d.manager.importFile(src)).state, 'downloading', 'refused while a download runs');
    assert.deepEqual(d.files().filter((f) => f.endsWith('.niepack')), []);
    await d.manager.cancel();
    await running;
    assert.equal((await d.manager.importFile(src)).state, 'ready');
    assert.equal((await d.manager.start()).state, 'ready', 'nothing to download once it is installed');
  } finally { srv.close(); await d.manager.close(); }
});

// ── the downloader, generalised ──────────────────────────────────────────────

test('the downloader takes another check and other words: a file that is not a model installs when its own check passes, and its messages name it', async () => {
  const data = Buffer.from('NIEPACK-ish bytes that are certainly not a GGUF model, long enough to look like a file'.repeat(5));
  const srv = await serve(data);
  try {
    const dir = tmp();
    const dest = path.join(dir, 'a.niepack');
    const seen = [];
    const r = await downloadModel({ url: srv.url, destPath: dest, minBytes: 1, validate: (p) => (seen.push(p), { ok: true, problems: [] }), what: 'encyclopedia' });
    assert.deepEqual(seen, [`${dest}.part`], 'the check sees the part file, before it is renamed');
    assert.equal(r.size, data.length, 'the size is taken from the file when the check does not give one');
    assert.ok(fs.readFileSync(dest).equals(data));

    const refused = path.join(dir, 'b.niepack');
    await assert.rejects(downloadModel({ url: srv.url, destPath: refused, validate: async () => ({ ok: false, problems: [{ message: 'It is not an encyclopedia.' }, { message: 'Really.' }] }), what: 'encyclopedia' }), /^Error: The downloaded encyclopedia is not usable: It is not an encyclopedia\. Really\.$/);
    assert.deepEqual(fs.readdirSync(dir).sort(), ['a.niepack'], 'a refused download leaves nothing');
    await assert.rejects(downloadModel({ url: srv.url, destPath: refused, validate: async () => { throw new Error('boom'); }, what: 'encyclopedia' }), /not usable: boom/, 'a check that throws is a refusal too');
    assert.deepEqual(fs.readdirSync(dir).sort(), ['a.niepack']);

    await assert.rejects(downloadModel({ url: srv.url, destPath: refused, validate: () => ({ ok: true, problems: [] }), sha256: 'beef', what: 'encyclopedia' }), /The downloaded encyclopedia failed its checksum/);
    await assert.rejects(downloadModel({ url: srv.url, destPath: refused, validate: () => ({ ok: true, problems: [] }), what: 'encyclopedia', freeBytes: () => 1000, margin: 10 * 1024 * 1024 }), /not enough free disk space for the offline encyclopedia: it needs about \d+ MB and only 1 MB is free/);
    const ro = path.join(dir, 'no', 'such', 'dir');
    fs.writeFileSync(path.join(dir, 'no'), 'a file where a folder should be');
    await assert.rejects(downloadModel({ url: srv.url, destPath: path.join(ro, 'c.niepack'), validate: () => ({ ok: true, problems: [] }), what: 'encyclopedia', attempts: 1 }));
  } finally { srv.close(); }
});

test('the downloader with no new options says what it always said about a model', async () => {
  const dir = tmp();
  const srv = await serve(Buffer.from('not a model'.repeat(200)));
  try {
    await assert.rejects(downloadModel({ url: srv.url, destPath: path.join(dir, 'm.gguf'), minBytes: 100 }), /^Error: The downloaded model is not usable: The offline model file is not a valid GGUF model \(bad header\)\.$/);
    await assert.rejects(downloadModel({ url: srv.url, destPath: path.join(dir, 'm.gguf'), minBytes: 100, freeBytes: () => 1000 }), /^Error: There is not enough free disk space for the offline model: it needs about 300 MB and only 1 MB is free\.$/);
  } finally { srv.close(); }
});

// ── what the writer sees it called ───────────────────────────────────────────

test('the status names which Wikipedia it is: the pack\'s own title, else this build\'s title for that very pack, never a build\'s title for a file the writer added', async () => {
  assert.equal(readEncyclopediaManifest(() => JSON.stringify(manifestFor('https://example.org/p.niepack', PACK, { title: '  Simple   English Wikipedia ' }))).title, 'Simple English Wikipedia');
  assert.equal(readEncyclopediaManifest(() => JSON.stringify(manifestFor('https://example.org/p.niepack', PACK))).title, '');
  // not installed: the build's title
  const absent = desk({ manifest: manifestFor('https://example.org/p.niepack', PACK, { name: 'sample', title: 'Simple English Wikipedia' }) });
  assert.equal((await absent.manager.init()).title, 'Simple English Wikipedia');
  // installed, and it is the pack this build offers (same name): the build's title, because that pack's header has none
  const same = desk({ manifest: manifestFor('https://example.org/p.niepack', PACK, { name: 'sample', title: 'Simple English Wikipedia' }) });
  put(same.dir, 'sample.niepack', PACK);
  assert.equal((await same.manager.init()).title, 'Simple English Wikipedia');
  // installed, but it is some other file the writer added (another name): not called by the build's title
  const other = desk({ manifest: manifestFor('https://example.org/p.niepack', PACK, { name: 'sample', title: 'Simple English Wikipedia' }) });
  put(other.dir, 'other.niepack', OTHER);
  assert.equal((await other.manager.init()).title, '');
});
