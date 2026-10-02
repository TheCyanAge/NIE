// Diagnostic: what can the browser actually read from files set with Playwright? (Run by .github/workflows/debug-upload.yml)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright-core';

const exe = process.env.CHROMIUM_PATH || undefined;
const browser = await chromium.launch({ executablePath: exe, args: ['--disable-dev-shm-usage'] });
console.log('browser version:', browser.version());
const page = await browser.newPage();
await page.setContent('<input type="file" id="i">');
const probe = () => page.evaluate(async () => {
  const f = document.querySelector('#i').files[0];
  if (!f) return { error: 'no file' };
  const out = { name: f.name, size: f.size, type: f.type };
  try { out.arrayBufferLength = (await f.arrayBuffer()).byteLength; } catch (e) { out.arrayBufferError = String(e); }
  try { out.text = (await f.text()).slice(0, 30); } catch (e) { out.textError = String(e); }
  return out;
});
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nie-up-'));
const real = path.join(dir, 'real.txt');
fs.writeFileSync(real, 'Imported words.');

await page.setInputFiles('#i', { name: 'mem.txt', mimeType: 'text/plain', buffer: Buffer.from('Imported words.') });
console.log('in-memory buffer :', JSON.stringify(await probe()));
await page.setInputFiles('#i', real);
console.log('file on disk     :', JSON.stringify(await probe()));
await page.setInputFiles('#i', { name: 'tiny.doc', mimeType: 'application/msword', buffer: Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0, 0, 0, 0]) });
console.log('8-byte buffer    :', JSON.stringify(await probe()));
await browser.close();
