// Smoke test for a PACKAGED NIE: the real exe, the real llama.cpp runtime and the real Qwen model.
//   node scripts/smoke-windows.mjs <folder containing "Narrative Integrity Engine.exe"> [--out smoke-out] [--no-model] [--no-runtime]
//
// What it proves (the things that cannot be proven by unit tests):
//   1. the package layout is complete (whole llama.cpp runtime incl. CPU backend, model present and valid, web UI bundled)
//   2. the exe starts, shows the UI, and exposes the desktop bridges without giving the page Node access
//   3. status honestly goes starting -> "Offline NIE ready." only after the model really answered
//   4. a real Brainstorm question is answered by the real model (route "local"), as the same NIE
//   5. the project survives closing and re-opening the app
// Works on Windows (CI) and, with an unpacked Linux build, on Linux. It drives the UI over the Chromium DevTools protocol
// (--remote-debugging-port), which needs no Node inspector in the packaged app.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { validateRuntime, validateModel, DEFAULT_MODEL } from '../apps/desktop/src/runtime.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const dir = path.resolve(args.find((a) => !a.startsWith('--')) ?? path.join(root, 'dist-desktop/win-unpacked'));
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const outDir = path.resolve(opt('--out', path.join(root, 'smoke-out')));
const skipModel = args.includes('--no-model');
const skipRuntime = args.includes('--no-runtime'); // local script checks only; the CI run never skips it
const isWin = process.platform === 'win32';
const exe = path.join(dir, isWin ? 'Narrative Integrity Engine.exe' : 'Narrative Integrity Engine');
const resources = path.join(dir, 'resources');
const READY_TIMEOUT_MS = Number(opt('--ready-timeout', 360000));

fs.mkdirSync(outDir, { recursive: true });
const report = { when: new Date().toISOString(), dir, platform: process.platform, steps: [], ok: false };
const step = (name, ok, detail = '') => {
  report.steps.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `: ${detail}` : ''}`);
  if (!ok) throw Object.assign(new Error(`${name}: ${detail}`), { smokeStep: true });
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Await something that may never settle (a closing connection), but not for long. */
const within = (p, ms = 4000) => Promise.race([Promise.resolve(p).catch(() => {}), sleep(ms)]);
const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });

function killTree(child) {
  if (!child?.pid) return;
  try {
    if (isWin) spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else process.kill(-child.pid, 'SIGKILL');
  } catch {
    try { child.kill('SIGKILL'); } catch { /* already gone */ }
  }
}

async function launch(userData) {
  const port = await freePort();
  const child = spawn(exe, [`--remote-debugging-port=${port}`, `--user-data-dir=${userData}`, '--disable-gpu', '--no-first-run', ...(isWin ? [] : ['--no-sandbox'])], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: !isWin,
    env: { ...process.env, ELECTRON_ENABLE_LOGGING: '1' },
  });
  const log = [];
  child.stdout.on('data', (d) => log.push(String(d)));
  child.stderr.on('data', (d) => log.push(String(d)));
  let exited = null;
  child.on('exit', (code, sig) => { exited = { code, sig }; });
  const t0 = Date.now();
  let browser = null;
  while (Date.now() - t0 < 90000 && !browser) {
    if (exited) throw new Error(`NIE exited during startup (${JSON.stringify(exited)}). Output:\n${log.join('').slice(-1500)}`);
    try {
      browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
    } catch {
      await sleep(700);
    }
  }
  if (!browser) throw new Error(`Could not attach to NIE's window within 90 s. Output:\n${log.join('').slice(-1500)}`);
  let page = browser.contexts().flatMap((c) => c.pages())[0];
  const w0 = Date.now();
  while (!page && Date.now() - w0 < 30000) { await sleep(300); page = browser.contexts().flatMap((c) => c.pages())[0]; }
  if (!page) throw new Error('NIE started but no window appeared.');
  const problems = [];
  page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`[console] ${m.text()}`); });
  await page.waitForSelector('#story-text', { timeout: 60000 });
  const alive = () => exited === null;
  return {
    child, browser, page, problems, log,
    // Close the way a person does (so Chromium flushes localStorage to disk); only kill what refuses to quit.
    close: async ({ graceful = true } = {}) => {
      if (graceful) {
        await within((async () => (await browser.newBrowserCDPSession()).send('Browser.close'))());
        if (alive()) await within(page.evaluate(() => window.close()));
        for (let i = 0; i < 40 && alive(); i++) await sleep(250);
      }
      await within(browser.close());
      if (alive()) killTree(child);
      await sleep(1500);
    },
  };
}

/** A first run shows the tour (by design). A person would press Escape or Skip; so does the test. */
async function dismissTour(page) {
  for (let i = 0; i < 3; i++) {
    if (!(await page.$('#tour-root .tour-dim'))) return;
    await page.keyboard.press('Escape');
    await sleep(500);
  }
}

let app = null;
const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'nie-smoke-'));
try {
  // 1. layout
  step('exe exists', fs.existsSync(exe), exe);
  if (!skipRuntime) {
    const rt = validateRuntime(path.join(resources, 'bin'), process.platform);
    step('llama.cpp runtime is complete next to llama-server', rt.ok, rt.ok ? `${rt.files.length} files, CPU backend present` : rt.problems.map((p) => p.message).join(' | '));
  }
  // The app's own files must be small and must not contain a copy of the repository (a packaging mistake that bloats the installer).
  const asarUnpacked = path.join(resources, 'app.asar.unpacked');
  const nested = fs.existsSync(path.join(asarUnpacked, 'node_modules', 'narrative-integrity-engine')) || fs.existsSync(path.join(asarUnpacked, 'node_modules', 'nie-desktop'));
  const top = fs.readdirSync(resources).map((n) => { const f = path.join(resources, n); const st = fs.statSync(f); return `${n}${st.isDirectory() ? '/' : ''}`; });
  report.resourcesTop = top;
  step('the package does not contain a copy of the repository', !nested, `resources: ${top.join(', ')}`);
  step('web UI is bundled', fs.existsSync(path.join(resources, 'web', 'index.html')) && fs.existsSync(path.join(resources, 'web', 'src', 'engine', 'knowledge', 'index.js')), 'resources/web');
  if (!skipModel) {
    const modelPath = path.join(resources, 'models', DEFAULT_MODEL.fileName);
    const mv = validateModel(modelPath, { minBytes: DEFAULT_MODEL.minBytes });
    step('offline model is bundled and valid (size + GGUF header)', mv.ok, mv.ok ? `${(mv.size / 1073741824).toFixed(2)} GB` : mv.problems.map((p) => p.message).join(' | '));
  }

  // 2. start the app
  app = await launch(userData);
  const { page } = app;
  const probe = await page.evaluate(() => ({
    desktop: Boolean(window.NIE_DESKTOP?.isDesktop), local: Boolean(window.NIE_LOCAL), updater: Boolean(window.NIE_UPDATER),
    nodeRequire: typeof window.require, nodeProcess: typeof window.process, title: document.title, nav: [...document.querySelectorAll('.nav-btn')].map((b) => b.textContent.replace(/[^\p{L} ]/gu, '').trim()),
  }));
  step('window opens with the UI and the desktop bridges', probe.desktop && probe.local && probe.updater, JSON.stringify(probe.nav));
  step('the page has no Node.js access (secure renderer)', probe.nodeRequire === 'undefined' && probe.nodeProcess === 'undefined');
  await page.screenshot({ path: path.join(outDir, '1-started.png') });

  if (!skipModel) {
    // 3. honest status
    const seen = [];
    const t0 = Date.now();
    let banner = '';
    while (Date.now() - t0 < READY_TIMEOUT_MS) {
      banner = (await page.textContent('#ai-banner').catch(() => '')) ?? '';
      if (banner && seen.at(-1) !== banner) seen.push(banner);
      if (/Offline NIE ready\./.test(banner) || /failed to start/i.test(banner)) break;
      await sleep(1000);
    }
    report.statusHistory = seen;
    step('offline model reaches "Offline NIE ready." (real llama-server, real Qwen)', /Offline NIE ready\./.test(banner), `${seen.join('  ->  ')} after ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    await page.screenshot({ path: path.join(outDir, '2-ready.png') });

    // 4. a real answer from the real model, through the same NIE
    await page.click('.nav-btn[data-view=brainstorm]');
    await page.fill('#brainstorm-input', 'In one or two sentences, what is a villanelle?');
    await page.press('#brainstorm-input', 'Enter');
    await page.waitForSelector('.msg-assistant:not(.msg-pending)', { timeout: 240000 });
    const reply = (await page.textContent('.msg-assistant:not(.msg-pending)')).trim();
    const route = await page.evaluate(() => window.NIE_APP.project.conversation.messages.at(-1).route);
    report.sampleReply = reply.slice(0, 400);
    step('Brainstorm answer comes from the offline model', route === 'local' && reply.length > 20, `route=${route}; "${reply.slice(0, 140).replace(/\s+/g, ' ')}"`);
    await page.screenshot({ path: path.join(outDir, '3-answer.png') });

    // an idea request: either cards (model followed the format) or a plain reply; never an error
    await page.click('#lens-row [data-lens=twist]');
    await page.waitForFunction(() => document.querySelectorAll('.msg-assistant:not(.msg-pending)').length >= 2, null, { timeout: 240000 });
    const ideaRoute = await page.evaluate(() => window.NIE_APP.project.conversation.messages.at(-1).route);
    step('an idea request is answered by the offline model too', ideaRoute === 'local', `route=${ideaRoute}`);
  }

  // 5. persistence across a restart
  await page.fill('#story-text', 'A lighthouse keeper who talks to the sea.').catch(async () => {
    await page.click('.nav-btn[data-view=scan]');
    await page.fill('#story-text', 'A lighthouse keeper who talks to the sea.');
  });
  await sleep(900);
  const idBefore = await page.evaluate(() => window.NIE_APP.project.id);
  await app.close();
  app = await launch(userData);
  const after = await app.page.evaluate(() => ({ id: window.NIE_APP.project.id, text: window.NIE_APP.project.storyText }));
  step('the project is still there after closing and re-opening NIE', after.id === idBefore && after.text.includes('lighthouse keeper'), after.text.slice(0, 40));
  const bad = app.problems.filter((p) => !/favicon|ERR_CONNECTION_REFUSED|503/i.test(p));
  step('no console errors in the packaged UI', bad.length === 0, bad.slice(0, 3).join(' | '));

  report.ok = true;
} catch (err) {
  report.error = String(err?.message ?? err);
  if (!err?.smokeStep) console.error(report.error);
  try { await app?.page?.screenshot({ path: path.join(outDir, 'failure.png') }); } catch { /* ignore */ }
} finally {
  try { fs.copyFileSync(path.join(userData, 'nie.log'), path.join(outDir, 'nie.log')); } catch { /* may not exist */ }
  try { fs.writeFileSync(path.join(outDir, 'app-output.txt'), (app?.log ?? []).join('')); } catch { /* ignore */ }
  await app?.close();
  fs.writeFileSync(path.join(outDir, 'smoke-report.json'), JSON.stringify(report, null, 2));
  console.log(report.ok ? '\nSMOKE TEST PASSED' : `\nSMOKE TEST FAILED: ${report.error ?? ''}`);
  process.exit(report.ok ? 0 : 1);
}
