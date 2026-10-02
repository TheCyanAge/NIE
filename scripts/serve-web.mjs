// Dev/test static server for apps/web (no dependencies). `npm run dev:web` → http://127.0.0.1:5173
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../apps/web');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

export function serveWeb({ port = 5173, host = '127.0.0.1' } = {}) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const full = path.resolve(root, '.' + (rel === '/' ? '/index.html' : rel));
    if (full !== root && !full.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
    fs.readFile(full, (err, data) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(port, host, () => resolve({ server, url: `http://${host}:${server.address().port}`, close: () => new Promise((r) => { server.closeAllConnections?.(); server.close(r); }) })));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { url } = await serveWeb({ port: Number(process.env.PORT ?? 5173) });
  console.log(`NIE web UI: ${url}`);
}
