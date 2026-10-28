import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { createWebSettings } from '../apps/desktop/src/web-settings.js';
import { createEncyclopediaManager } from '../apps/desktop/src/encyclopedia-manager.js';
import { createWebService } from '../apps/web/src/engine/web/service.js';
import { Pack } from '../apps/web/src/engine/encyclopedia/pack.js';
import { buildFromDump } from '../apps/web/src/engine/encyclopedia/build.js';
import { sampleDump } from './fixtures/cirrus-sample.mjs';
import { cleanEncyclopediaStatus, createBridgeEncyclopedia, createNoEncyclopedia } from '../apps/web/src/ui/encyclopedia.js';

// The main-process side of web search with an offline encyclopedia: `getPack` is whatever the manager has open, and the settings follow it as it comes and goes.

const BUILT = await buildFromDump(Readable.from([sampleDump()]), { name: 'sample', lang: 'en', builtAt: '2026-01-01' });
const BRAVE_KEY = 'BSAsecret-key-0123456789';
const BRAVE_BODY = { web: { results: [{ title: 'The Great Fire', url: 'https://example.org/fire', description: 'London burned in 1666.' }] } };

/** The settings as `main.js` builds them; `held.pack` is what the manager would hand over right now. `calls` are the requests that went out on the network (there must be none for the encyclopedia). */
function desk({ pack = null, start = {} } = {}) {
  let prefs = start;
  const held = { pack };
  const calls = [];
  const web = createWebSettings({
    readPrefs: () => prefs,
    writePrefs: (patch) => (prefs = { ...prefs, ...patch }),
    safeStorage: { isEncryptionAvailable: () => true, encryptString: (s) => Buffer.from(`enc:${s}`), decryptString: (b) => b.toString().replace(/^enc:/, '') },
    createService: createWebService,
    fetch: async (url) => (calls.push(String(url)), new Response(JSON.stringify(BRAVE_BODY), { status: 200, headers: { 'content-type': 'application/json' } })),
    getPack: () => held.pack,
  });
  return { web, held, calls, prefs: () => prefs };
}

test('get().pack follows getPack as the encyclopedia comes and goes', async () => {
  const d = desk();
  assert.equal(d.web.get().pack, false);
  d.held.pack = await Pack.open(BUILT.bytes);
  assert.equal(d.web.get().pack, true);
  d.held.pack = null;
  assert.equal(d.web.get().pack, false);
});

test('with an encyclopedia installed, web search is ready and on with nothing to agree to, whatever the Web setting says', async () => {
  const d = desk({ pack: await Pack.open(BUILT.bytes) });
  const c = d.web.get();
  assert.deepEqual([c.enabled, c.hasKey, c.pack, c.builtinService, c.builtin, c.usingBuiltin], [false, false, true, null, '', false], 'the built-in search is not what runs, so there is no agreement to make');
  assert.deepEqual(d.web.status(), { configured: true, enabled: true, provider: 'pack', label: 'Offline encyclopedia' });
  // turning "Web search" off or on changes nothing about it, and saving never stores an agreement for a service that does not run
  assert.deepEqual(d.web.set({ enabled: false, provider: 'auto' }).pack, true);
  assert.equal(d.web.status().enabled, true);
  assert.equal(d.web.set({ enabled: true, provider: 'auto' }).builtin, '');
  assert.equal(d.prefs().web.enabled, true, 'stored as the writer set it, not forced off for want of an agreement');
  assert.equal(d.web.status().provider, 'pack');
});

test('a lookup is answered from the file on this computer: results, a pack note for the page, a page read, a test, and not one request on the network', async () => {
  const d = desk({ pack: await Pack.open(BUILT.bytes) });
  const res = await d.web.search('how long is the Marlowe Bridge');
  assert.equal(res.provider, 'pack');
  assert.equal(res.results[0].title, 'Marlowe Bridge');
  assert.equal(res.results[0].url, 'https://en.wikipedia.org/wiki/Marlowe_Bridge');
  assert.deepEqual(res.pack, { docs: 6, builtAt: '2026-01-01', name: 'sample' });
  const page = await d.web.read('https://en.wikipedia.org/wiki/Marlowe_Bridge');
  assert.equal(page.title, 'Marlowe Bridge');
  assert.match(page.text, /412 metres/);
  assert.equal(await d.web.read('https://en.wikipedia.org/wiki/Nonesuch'), null);
  assert.deepEqual(await d.web.test(), { ok: true, provider: 'pack', message: 'The offline encyclopedia is ready: 6 articles, on this computer.' });
  assert.deepEqual(d.calls, [], 'nothing was sent anywhere');
  assert.ok(!JSON.stringify([res, page]).includes('/home/'), 'no path of this computer reaches the page');
});

test('a search key of the writer\'s own takes over, and removing it gives the encyclopedia back; removing the encyclopedia gives back the built-in search, off until agreed', async () => {
  const d = desk({ pack: await Pack.open(BUILT.bytes) });
  const keyed = d.web.set({ enabled: true, provider: 'auto', apiKey: BRAVE_KEY });
  assert.equal(keyed.pack, true, 'it is still installed');
  assert.deepEqual(d.web.status(), { configured: true, enabled: true, provider: 'brave', label: 'Brave Search' });
  const res = await d.web.search('great fire of london');
  assert.equal(res.provider, 'brave');
  assert.equal(res.pack, undefined);
  assert.equal(d.calls.length, 1, 'now it goes out, as the writer chose');
  assert.equal(d.web.set({ enabled: true, provider: 'auto', clearKey: true }).hasKey, false);
  assert.equal(d.web.status().provider, 'pack');
  d.held.pack = null; // removed
  assert.deepEqual(d.web.get().pack, false);
  assert.deepEqual(d.web.status(), { configured: true, enabled: false, provider: 'wikipedia', label: 'Wikipedia (switched off)' });
  assert.equal((await d.web.search('x')).error.kind, 'not-configured', 'and nothing is looked up until the writer agrees');
});

test('a pack that fails while it is read is an error for the page in words, never a thrown object', async () => {
  const broken = { info: { docs: 3, builtAt: '', name: 'x' }, search: async () => { throw new Error(`EIO: read failed at ${os.tmpdir()}`); }, readUrl: async () => { throw new Error('closed'); } };
  const d = desk({ pack: broken });
  const res = await d.web.search('anything at all');
  assert.equal(res.error.kind, 'bad-response');
  assert.match(res.error.message, /could not be read/);
  assert.ok(!res.error.message.includes(os.tmpdir()));
  assert.equal(await d.web.read('https://en.wikipedia.org/wiki/Marlowe_Bridge'), null);
});

test('the manager and the settings together: a file added makes the encyclopedia the search, removing it takes it away', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nie-enc-set-'));
  const src = path.join(dir, 'in', 'wiki.niepack');
  fs.mkdirSync(path.dirname(src), { recursive: true });
  fs.writeFileSync(src, BUILT.bytes);
  const manager = createEncyclopediaManager({ dir: path.join(dir, 'encyclopedia'), readManifest: () => null, download: async () => { throw new Error('no download here'); }, openPack: (f) => Pack.open(f) });
  const web = createWebSettings({
    readPrefs: () => ({}), writePrefs: () => {}, safeStorage: { isEncryptionAvailable: () => true, encryptString: (s) => Buffer.from(s), decryptString: (b) => b.toString() },
    createService: createWebService, fetch: async () => { throw new Error('no network in this test'); }, getPack: () => manager.current(),
  });
  assert.equal(web.get().pack, false);
  await manager.importFile(src);
  assert.equal(web.get().pack, true);
  assert.equal(web.status().provider, 'pack');
  assert.equal((await web.search('Veldhaven')).results[0].title, 'Veldhaven');
  await manager.remove();
  assert.equal(web.get().pack, false);
  assert.equal(web.status().provider, 'wikipedia');
  fs.rmSync(dir, { recursive: true, force: true });
});

// ── the page's side of the bridge (apps/web/src/ui/encyclopedia.js) ──────────

test('the page trusts no status as it arrives: every field is there, short and of the right kind', () => {
  const bare = cleanEncyclopediaStatus(undefined);
  assert.deepEqual(bare, { state: 'unavailable', available: false, name: '', title: '', docs: 0, bytes: 0, builtAt: '', license: '', attribution: '', source: null, progress: null, error: '', busy: '', hasFile: false });
  const odd = cleanEncyclopediaStatus({ state: 'exploding', available: 'yes', docs: -3, bytes: NaN, name: 5, builtAt: 'x'.repeat(100), source: 'cloud', progress: { received: -1, total: 'lots' }, error: 'e'.repeat(1000), busy: 'rebooting', hasFile: 1 });
  assert.deepEqual([odd.state, odd.available, odd.docs, odd.bytes, odd.name, odd.builtAt.length, odd.source, odd.progress, odd.error.length, odd.busy, odd.hasFile], ['unavailable', false, 0, 0, '', 40, null, { received: 0, total: 0 }, 400, '', false]);
  const fine = cleanEncyclopediaStatus({ state: 'downloading', available: true, docs: 5, bytes: 9, progress: { received: 3, total: 9 }, source: 'file', busy: 'importing', hasFile: true });
  assert.deepEqual([fine.state, fine.available, fine.progress, fine.source, fine.busy, fine.hasFile], ['downloading', true, { received: 3, total: 9 }, 'file', 'importing', true]);
});

test('the desktop adapter hands the page a status or words, never a thrown object; pushes from the main process reach whoever listens', async () => {
  const pushes = [];
  const answers = { status: { state: 'absent', available: true, bytes: 100 }, download: { state: 'downloading', available: true, progress: { received: 0, total: 100 } } };
  const bridge = {
    status: async () => answers.status,
    download: async () => answers.download,
    cancel: async () => ({ error: { message: 'Could not stop it.' } }),
    remove: async () => { throw Object.assign(new Error('IPC failed at /home/ann/x'), { code: 'X' }); },
    importFile: async () => ({ cancelled: true }),
    onChanged: (cb) => { pushes.push(cb); return () => {}; },
  };
  const enc = createBridgeEncyclopedia(bridge);
  assert.equal(enc.kind, 'bridge');
  assert.equal(enc.current(), null, 'nothing is known before the first answer');
  assert.equal((await enc.refresh()).state, 'absent');
  assert.equal(enc.current().bytes, 100);
  assert.equal((await enc.download()).status.state, 'downloading');
  assert.deepEqual(await enc.cancel(), { error: { message: 'Could not stop it.' } });
  assert.deepEqual(await enc.remove(), { error: { message: 'The desktop app did not answer.' } }, 'and not the thrown message, which could hold a path');
  assert.deepEqual(await enc.importFile(), { cancelled: true });
  assert.equal(enc.current().state, 'downloading', 'a refusal or a cancelled dialog does not change what is known');
  // a status that carries an error as a string (what went wrong earlier) is a status, not a failure of the call
  answers.status = { state: 'error', available: true, error: 'The offline encyclopedia could not be downloaded: the disk is full.' };
  const failedEarlier = await enc.refresh();
  assert.deepEqual([failedEarlier.state, failedEarlier.error], ['error', 'The offline encyclopedia could not be downloaded: the disk is full.']);
  assert.equal(enc.current().state, 'error');

  const heard = [];
  const stop = enc.onChange((s) => heard.push(s.state));
  enc.onChange(() => { throw new Error('a listener that fails'); });
  const after = [];
  enc.onChange((s) => after.push(s.state));
  pushes[0]({ state: 'ready', available: true });
  assert.deepEqual([heard, after, enc.current().state], [['ready'], ['ready'], 'ready'], 'one failing listener does not silence the next');
  stop();
  pushes[0]({ state: 'absent' });
  assert.deepEqual(heard, ['ready'], 'a listener that stopped hears no more');
  assert.equal(enc.current().state, 'absent');
});

test('the browser adapter says plainly that the offline encyclopedia needs the desktop app', async () => {
  const enc = createNoEncyclopedia();
  assert.equal(enc.kind, 'none');
  assert.equal(enc.current().state, 'unavailable');
  assert.equal((await enc.refresh()).available, false);
  for (const act of ['download', 'cancel', 'remove', 'importFile']) assert.deepEqual(await enc[act](), { error: { message: 'The offline encyclopedia needs the desktop app.' } });
  assert.equal(typeof enc.onChange(() => {}), 'function');
});
