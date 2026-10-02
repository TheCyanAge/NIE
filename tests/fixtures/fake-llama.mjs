// A tiny stand-in for llama-server, used by tests. Speaks the same HTTP protocol:
//   GET  /health                -> 503 while "loading", 200 when ready
//   POST /v1/chat/completions   -> OpenAI-style JSON or SSE stream
// Behaviour is steered by CLI flags so the desktop service can be tested against it as if it were the real binary.
import http from 'node:http';
import fs from 'node:fs';

const args = process.argv.slice(2);
const flag = (name, def = null) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const port = Number(flag('--port', 0));
const host = flag('--host', '127.0.0.1');
const model = flag('-m');
const loadMs = Number(process.env.FAKE_LLAMA_LOAD_MS ?? 150);
const mode = process.env.FAKE_LLAMA_MODE ?? 'ok';
const reply = process.env.FAKE_LLAMA_REPLY ?? 'Hello from the fake model.';

if (mode === 'no-backend') {
  console.error('load_backend: no backends are loaded.');
  console.error('llama_model_load: error loading model: failed to load model');
  process.exit(1);
}
if (mode === 'crash-on-start') process.exit(3);
if (!model || !fs.existsSync(model)) {
  console.error(`error: failed to load model '${model}'`);
  process.exit(1);
}
fs.writeFileSync(process.env.FAKE_LLAMA_CWD_FILE ?? process.cwd() + '/.fake-llama-cwd', [process.cwd(), process.env.PATH ?? '', args.join(' ')].join('\n'));

let ready = false;
setTimeout(() => (ready = true), loadMs);

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(ready ? 200 : 503, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(ready ? { status: 'ok' } : { error: { message: 'Loading model' } }));
  }
  if (req.url === '/v1/chat/completions' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const j = JSON.parse(body || '{}');
      if (!ready) {
        res.writeHead(503);
        return res.end('loading');
      }
      if (mode === 'http-500') {
        res.writeHead(500);
        return res.end('boom');
      }
      const text = process.env.FAKE_LLAMA_ECHO ? JSON.stringify(j.messages) : reply;
      if (j.stream) {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        const parts = text.match(/.{1,6}/gs) ?? [''];
        let i = 0;
        const t = setInterval(() => {
          if (i < parts.length) {
            res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: parts[i++] } }] })}\n\n`);
          } else {
            res.write('data: [DONE]\n\n');
            res.end();
            clearInterval(t);
          }
        }, mode === 'slow' ? 80 : 2);
        res.on('close', () => clearInterval(t));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ choices: [{ message: { role: 'assistant', content: text } }] }));
      }
    });
    return;
  }
  res.writeHead(404);
  res.end();
});
server.listen(port, host, () => console.log(`fake llama listening on ${host}:${port}`));
process.on('SIGTERM', () => { server.closeAllConnections?.(); process.exit(0); });
