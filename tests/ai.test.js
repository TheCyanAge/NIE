import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import net from 'node:net';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { OpenAICompatClient, AIError, sseData } from '../apps/web/src/engine/ai/openai-client.js';
import { AIEngine, OFFLINE_MESSAGES } from '../apps/web/src/engine/ai/engine.js';
import { createHttpLocal } from '../apps/web/src/engine/ai/local.js';

const FAKE = fileURLToPath(new URL('./fixtures/fake-llama.mjs', import.meta.url));

const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });

async function startFake(env = {}) {
  const port = await freePort();
  const model = fileURLToPath(import.meta.url); // any existing file
  const child = spawn(process.execPath, [FAKE, '-m', model, '--host', '127.0.0.1', '--port', String(port)], { env: { ...process.env, FAKE_LLAMA_CWD_FILE: os.devNull, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    child.stdout.on('data', (d) => /listening/.test(String(d)) && resolve());
    child.on('exit', (c) => reject(new Error('fake exited ' + c)));
  });
  return { port, baseUrl: `http://127.0.0.1:${port}/v1`, stop: () => child.kill('SIGTERM') };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms = 4000) { const t = Date.now(); while (Date.now() - t < ms) { if (await fn()) return true; await sleep(25); } return false; }

test('offline status strings match the product contract exactly', () => {
  assert.equal(OFFLINE_MESSAGES.starting, 'Offline NIE is starting...');
  assert.equal(OFFLINE_MESSAGES.ready, 'Offline NIE ready.');
  assert.equal(OFFLINE_MESSAGES.failed, 'Offline NIE model failed to start. Using built-in guidance instead.');
});

test('SSE parser handles split chunks, CRLF and [DONE]', async () => {
  const enc = new TextEncoder();
  const body = new ReadableStream({ start(c) { c.enqueue(enc.encode('data: {"a":1}\r\n\r\nda')); c.enqueue(enc.encode('ta: {"a":2}\n\ndata: [DONE]\n\n')); c.close(); } });
  const out = [];
  for await (const d of sseData(body)) out.push(d);
  assert.deepEqual(out, ['{"a":1}', '{"a":2}', '[DONE]']);
});

test('client streams tokens and returns the full reply', async () => {
  const fake = await startFake({ FAKE_LLAMA_REPLY: 'Streaming works fine.' });
  try {
    const client = new OpenAICompatClient({ baseUrl: fake.baseUrl });
    assert.ok(await until(async () => (await client.health()).ok));
    const seen = [];
    const text = await client.chat([{ role: 'user', content: 'hi' }], { onToken: (d) => seen.push(d) });
    assert.equal(text, 'Streaming works fine.');
    assert.ok(seen.length > 1, 'delivered incrementally');
    assert.equal(seen.join(''), text);
    assert.equal(await client.chat([{ role: 'user', content: 'hi' }], { stream: false }), 'Streaming works fine.');
  } finally { fake.stop(); }
});

test('client reports http errors, unreachable servers and aborts distinctly', async () => {
  const fake = await startFake({ FAKE_LLAMA_MODE: 'http-500' });
  try {
    const c = new OpenAICompatClient({ baseUrl: fake.baseUrl });
    await until(async () => (await c.health()).ok);
    await assert.rejects(c.chat([{ role: 'user', content: 'x' }]), (e) => e instanceof AIError && e.kind === 'http' && e.status === 500);
  } finally { fake.stop(); }
  const dead = new OpenAICompatClient({ baseUrl: 'http://127.0.0.1:1/v1' });
  await assert.rejects(dead.chat([{ role: 'user', content: 'x' }]), (e) => e.kind === 'network');
  const slow = await startFake({ FAKE_LLAMA_MODE: 'slow', FAKE_LLAMA_REPLY: 'a long slow reply that keeps going and going' });
  try {
    const c = new OpenAICompatClient({ baseUrl: slow.baseUrl });
    await until(async () => (await c.health()).ok);
    const ctrl = new AbortController();
    const p = c.chat([{ role: 'user', content: 'x' }], { signal: ctrl.signal });
    setTimeout(() => ctrl.abort(), 100);
    await assert.rejects(p, (e) => e.kind === 'abort');
  } finally { slow.stop(); }
});

// A stand-in for fetch that streams `tokens`, each after its own delay, so the three time limits can be tested without a real model.
const streamingFetch = (steps) => async (_url, { signal }) => {
  const enc = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const stop = () => controller.error(signal.reason);
      signal.addEventListener('abort', stop, { once: true });
      try {
        for (const [wait, token] of steps) {
          await new Promise((r) => setTimeout(r, wait));
          if (signal.aborted) return;
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: token } }] })}\n\n`));
        }
        controller.enqueue(enc.encode('data: [DONE]\n\n'));
        controller.close();
      } catch { /* aborted */ }
    },
  });
  return { ok: true, status: 200, body, text: async () => '' };
};
const askWith = (steps, opts) => new OpenAICompatClient({ baseUrl: 'http://x/v1', fetchImpl: streamingFetch(steps), ...opts }).chat([{ role: 'user', content: 'hi' }]);

test('a slow computer is not cut off while it is still answering: the limit is on silence, not on the whole reply', async () => {
  // 6 words, 60 ms apart = 360 ms in all, far more than the 150 ms the old single limit would have allowed
  const steps = ['one ', 'two ', 'three ', 'four ', 'five ', 'six'].map((w) => [60, w]);
  assert.equal(await askWith(steps, { timeoutMs: 150, idleMs: 150 }), 'one two three four five six');
});

test('reading a long text may take a long time before the first word, but not forever', async () => {
  assert.equal(await askWith([[120, 'ok']], { timeoutMs: 400, idleMs: 50 }), 'ok', 'the wait for the first word has its own, longer limit');
  await assert.rejects(askWith([[300, 'late']], { timeoutMs: 80, idleMs: 400 }), (e) => e instanceof AIError && e.kind === 'timeout');
});

test('a reply that goes silent half way is stopped, and a runaway reply is capped', async () => {
  await assert.rejects(askWith([[10, 'start '], [300, 'stalled']], { timeoutMs: 400, idleMs: 80 }), (e) => e.kind === 'timeout');
  const endless = Array.from({ length: 40 }, () => [20, 'w ']);
  await assert.rejects(askWith(endless, { timeoutMs: 400, idleMs: 400, maxTotalMs: 150 }), (e) => e.kind === 'timeout');
});

const provider = (state, chat = async () => 'local says hi') => {
  const listeners = new Set();
  return { state, status: () => ({ state: provider.s ?? state }), onStatus: (cb) => (listeners.add(cb), () => listeners.delete(cb)), chat, emit: (cb) => listeners.forEach((l) => l()), set(s) { this.state = s; this.status = () => ({ state: s }); listeners.forEach((l) => l()); } };
};

test('one NIE: online when available, otherwise the installed offline model, otherwise built-in guidance', async () => {
  const local = provider('ready');
  let onlineUp = true;
  const online = { configured: true, chat: async () => 'online says hi' };
  const engine = new AIEngine({ local, online, isOnline: () => onlineUp });
  assert.equal(engine.route(), 'online');
  assert.deepEqual(await engine.chat([]), { text: 'online says hi', route: 'online' });

  onlineUp = false; // internet disappears
  assert.equal(engine.route(), 'local');
  assert.equal((await engine.chat([])).text, 'local says hi');

  local.set('failed');
  assert.equal(engine.route(), 'builtin');
  const res = await engine.chat([]);
  assert.equal(res.text, null);
  assert.equal(res.route, 'builtin');
});

test('online failure falls back to the offline model instead of surfacing an error', async () => {
  const engine = new AIEngine({ local: provider('ready'), online: { configured: true, chat: async () => { throw new AIError('down', { kind: 'network' }); } }, isOnline: () => true });
  const res = await engine.chat([]);
  assert.equal(res.route, 'local');
  assert.equal(res.fellBack, true);
});

test('status never claims readiness it does not have', () => {
  const local = provider('starting');
  const engine = new AIEngine({ local, online: null, isOnline: () => false });
  let s = engine.status();
  assert.equal(s.route, 'builtin');
  assert.equal(s.banner, 'Offline NIE is starting...');
  assert.equal(s.label, 'NIE · starting');
  local.set('ready');
  s = engine.status();
  assert.equal(s.route, 'local');
  assert.equal(s.banner, 'Offline NIE ready.');
  assert.equal(s.label, 'NIE · offline ready');
  local.set('failed');
  assert.equal(engine.status().banner, 'Offline NIE model failed to start. Using built-in guidance instead.');
  const none = new AIEngine({ local: null, online: null, isOnline: () => false });
  assert.equal(none.status().local.state, 'unavailable');
  assert.match(none.status().banner, /built-in guidance/);
});

test('status changes are broadcast to the UI', () => {
  const local = provider('starting');
  const engine = new AIEngine({ local, online: null, isOnline: () => false });
  const seen = [];
  engine.onChange((s) => seen.push(s.local.state));
  local.set('ready');
  local.set('failed');
  assert.deepEqual(seen, ['ready', 'failed']);
});

test('aborts propagate; they are not mistaken for provider failure', async () => {
  const engine = new AIEngine({ local: provider('ready', async () => { throw new AIError('Cancelled', { kind: 'abort' }); }), online: null, isOnline: () => false });
  await assert.rejects(engine.chat([]), (e) => e.kind === 'abort');
});

test('http local adapter reports starting → ready from /health, and chats once ready', async () => {
  const fake = await startFake({ FAKE_LLAMA_LOAD_MS: '400', FAKE_LLAMA_REPLY: 'ready now' });
  const local = createHttpLocal({ baseUrl: fake.baseUrl, pollMs: 50 });
  try {
    const seen = new Set([local.status().state]);
    local.onStatus((s) => seen.add(s.state));
    assert.ok(await until(() => local.status().state === 'ready'));
    assert.ok(seen.has('starting'));
    const engine = new AIEngine({ local, online: null, isOnline: () => false });
    assert.equal((await engine.chat([{ role: 'user', content: 'hi' }], { stream: false })).text, 'ready now');
  } finally { local.stop(); fake.stop(); }
});
