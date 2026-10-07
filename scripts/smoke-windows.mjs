// Smoke test for a PACKAGED NIE: the real exe, the real llama.cpp runtime and the real Qwen model.
//   node scripts/smoke-windows.mjs <folder containing "Narrative Integrity Engine.exe"> [--out smoke-out] [--no-model] [--no-runtime] [--real-profile]
//   node scripts/smoke-windows.mjs --exe <a single portable .exe> [--real-profile] [--download-model]   (no folder layout to inspect)
//   --download-model: the model is NOT in the package; the app must download it on first run (the click-and-run package).
//   --expect-fresh:   the profile must have NO model at the start (so the first-run download is really exercised and cannot be skipped silently)
//   --expect-model:   the profile must ALREADY have the model (a later start must find it, not download it again)
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
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const positional = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--out', '--exe', '--ready-timeout', '--max-minutes'].includes(args[i - 1])));
const dir = path.resolve(positional[0] ?? path.join(root, 'dist-desktop/win-unpacked'));
const outDir = path.resolve(opt('--out', path.join(root, 'smoke-out')));
const skipModel = args.includes('--no-model');
const skipRuntime = args.includes('--no-runtime');
const realProfile = args.includes('--real-profile'); // installed run: use the app's real profile folder, like a user's first launch // local script checks only; the CI run never skips it
const isWin = process.platform === 'win32';
const exeOverride = opt('--exe', null); // a single portable exe: nothing of its layout can be inspected from outside
const downloadModel = args.includes('--download-model');
const expectFresh = args.includes('--expect-fresh');
const expectModel = args.includes('--expect-model');
const exe = exeOverride ? path.resolve(exeOverride) : path.join(dir, isWin ? 'Narrative Integrity Engine.exe' : 'Narrative Integrity Engine');
const resources = path.join(dir, 'resources');
const READY_TIMEOUT_MS = Number(opt('--ready-timeout', downloadModel ? 1200000 : 360000));

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

const spawned = []; // every process we started, so a failed launch can never leave NIE or llama-server running
const allLog = [];
const allProblems = [];
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
  const child = spawn(exe, [`--remote-debugging-port=${port}`, ...(realProfile && isWin ? [] : [`--user-data-dir=${userData}`]), '--disable-gpu', '--no-first-run', ...(isWin ? [] : ['--no-sandbox'])], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: !isWin,
    env: { ...process.env, ELECTRON_ENABLE_LOGGING: '1' },
  });
  spawned.push(child);
  const log = allLog;
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
  const problems = allProblems; // both launches: errors from the real session count, not just the restart
  page.setDefaultTimeout(60000);
  page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`[console] ${m.text()}`); });
  await page.waitForSelector('#story-text', { timeout: 60000 });
  await dismissTour(page);
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
  // The tour starts shortly after the UI (a timer in main.js), so wait for it to appear before deciding there is none.
  await page.waitForSelector('#tour-root .tour-dim', { state: 'attached', timeout: 5000 }).catch(() => {});
  for (let i = 0; i < 3 && (await page.$('#tour-root .tour-dim')); i++) {
    await page.keyboard.press('Escape');
    await sleep(600);
  }
  if (await page.$('#tour-root .tour-dim')) throw new Error('The first-run tour could not be dismissed.');
}

let app = null;
const modelInProfile = (ud) => path.join(ud, 'models', DEFAULT_MODEL.fileName);
const userData = realProfile && isWin && process.env.APPDATA ? path.join(process.env.APPDATA, 'Narrative Integrity Engine') : fs.mkdtempSync(path.join(os.tmpdir(), 'nie-smoke-'));
const hadModelAtStart = fs.existsSync(modelInProfile(userData));
if (skipModel) {
  // Without a model the app would start downloading ~2 GB in the background during the test.
  fs.mkdirSync(userData, { recursive: true });
  fs.writeFileSync(path.join(userData, 'desktop-prefs.json'), JSON.stringify({ autoDownloadModel: false }));
}
// A hung renderer or installer must never hold the job until its time limit.
const watchdogMinutes = Number(opt('--max-minutes', downloadModel && !expectModel ? 27 : 22));
const watchdog = setTimeout(() => {
  console.error('WATCHDOG: the smoke test ran too long; stopping everything.');
  // Leave something to read: a silent timeout is the hardest failure to diagnose.
  try { report.error = `WATCHDOG: the smoke test ran longer than ${watchdogMinutes} minutes. Last steps: ${report.steps.slice(-3).map((x) => x.name).join(' | ')}`; fs.writeFileSync(path.join(outDir, 'smoke-report.json'), JSON.stringify(report, null, 2)); } catch { /* ignore */ }
  try { fs.copyFileSync(path.join(userData, 'nie.log'), path.join(outDir, 'nie.log')); } catch { /* may not exist */ }
  try { fs.writeFileSync(path.join(outDir, 'app-output.txt'), allLog.join('')); } catch { /* ignore */ }
  spawned.forEach(killTree);
  process.exit(2);
}, watchdogMinutes * 60 * 1000);
watchdog.unref?.();
try {
  // 1. layout
  step('exe exists', fs.existsSync(exe), exe);
  if (expectFresh) step('the profile starts WITHOUT a model, so the first-run download is really exercised', !hadModelAtStart, hadModelAtStart ? `a model is already at ${modelInProfile(userData)}` : 'no model yet');
  if (expectModel) step('the profile already has the model from the first run, so it must be found, not downloaded again', hadModelAtStart, hadModelAtStart ? 'found' : `no model at ${modelInProfile(userData)}`);
  if (exeOverride) {
    const mb = fs.statSync(exe).size / 1048576;
    step('the single-file exe is a reasonable size (no model inside)', mb > 50 && mb < 900, `${mb.toFixed(0)} MB`);
  }
  if (!exeOverride && !skipRuntime) {
    const rt = validateRuntime(path.join(resources, 'bin'), process.platform);
    step('llama.cpp runtime is complete next to llama-server', rt.ok, rt.ok ? `${rt.files.length} files, CPU backend present` : rt.problems.map((p) => p.message).join(' | '));
    if (isWin) {
      // llama-server imports the Visual C++ runtime. A clean Windows PC may not have it, and CI runners always do, so the
      // DLLs must travel inside the package; otherwise the model would fail to start there ("Offline NIE model failed to start").
      const have = new Set(rt.files.map((f) => f.toLowerCase()));
      const missing = ['vcruntime140.dll', 'vcruntime140_1.dll', 'msvcp140.dll'].filter((f) => !have.has(f));
      step('the Visual C++ runtime DLLs ship inside the package (clean PCs may not have them)', missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : 'vcruntime140, vcruntime140_1, msvcp140');
    }
  }
  if (!exeOverride) {
  // The app's own files must be small and must not contain a copy of the repository (a packaging mistake that bloats the installer).
  const asarUnpacked = path.join(resources, 'app.asar.unpacked');
  const nested = fs.existsSync(path.join(asarUnpacked, 'node_modules', 'narrative-integrity-engine')) || fs.existsSync(path.join(asarUnpacked, 'node_modules', 'nie-desktop'));
  const top = fs.readdirSync(resources).map((n) => { const f = path.join(resources, n); const st = fs.statSync(f); return `${n}${st.isDirectory() ? '/' : ''}`; });
  report.resourcesTop = top;
  // Also look INSIDE app.asar: a dependency named like the repo once dragged the whole repository into the package.
  let inAsar = [];
  try {
    const { createRequire } = await import('node:module');
    const asar = createRequire(path.join(root, 'apps/desktop/package.json'))('@electron/asar');
    inAsar = asar.listPackage(path.join(resources, 'app.asar'), {}).filter((f) => /[\\/]node_modules[\\/](?:narrative-integrity-engine|nie-desktop)[\\/]/.test(f)).slice(0, 5);
  } catch (err) {
    if (process.env.CI) throw err; // in CI this check must really run: it exists to catch the repo-inside-asar mistake
  }
  const asarBytes = fs.statSync(path.join(resources, 'app.asar')).size;
  const stray = fs.readdirSync(resources).filter((n) => !['app.asar', 'bin', 'models', 'web', 'elevate.exe'].includes(n));
  step('the package does not contain a copy of the repository', !nested && inAsar.length === 0 && asarBytes < 20e6 && stray.length === 0, `resources: ${top.join(', ')}; app.asar ${(asarBytes / 1048576).toFixed(1)} MB${stray.length ? `; unexpected: ${stray.join(', ')}` : ''}`);
  step('web UI is bundled', fs.existsSync(path.join(resources, 'web', 'index.html')) && fs.existsSync(path.join(resources, 'web', 'src', 'engine', 'knowledge', 'index.js')), 'resources/web');
  if (!skipModel && !downloadModel) {
    const modelPath = path.join(resources, 'models', DEFAULT_MODEL.fileName);
    const mv = validateModel(modelPath, { minBytes: DEFAULT_MODEL.minBytes });
    step('offline model is bundled and valid (size + GGUF header)', mv.ok, mv.ok ? `${(mv.size / 1073741824).toFixed(2)} GB` : mv.problems.map((p) => p.message).join(' | '));
  }
  if (downloadModel) {
    const bundled = fs.existsSync(path.join(resources, 'models', DEFAULT_MODEL.fileName));
    step('the click-and-run package does not carry the model (it is downloaded on first run)', !bundled, bundled ? 'a model file is inside the package' : 'no model inside');
  }
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
    if (downloadModel && !hadModelAtStart) {
      // The first-run promise: the app starts at once, says honestly that it is downloading, and then becomes ready on its own.
      step('first run: the app says it is downloading the offline model, then becomes ready by itself', seen.some((b) => /Downloading the offline model/i.test(b)) && /Offline NIE ready\./.test(banner), seen.join('  ->  ').slice(0, 300));
      const mv = validateModel(modelInProfile(userData), { minBytes: DEFAULT_MODEL.minBytes });
      step('the downloaded model is saved in the user profile and is intact (size + GGUF header)', mv.ok, mv.ok ? `${(mv.size / 1073741824).toFixed(2)} GB` : mv.problems.map((p) => p.message).join(' | '));
    }
    if (expectModel) step('the app found the existing model and did not download it again', !seen.some((b) => /Downloading the offline model/i.test(b)), seen.join('  ->  ').slice(0, 300));
    step('offline model reaches "Offline NIE ready." (real llama-server, real Qwen)', /Offline NIE ready\./.test(banner), `${seen.join('  ->  ')} after ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    await page.screenshot({ path: path.join(outDir, '2-ready.png') });

    // 4. a real answer from the real model, through the same NIE
    await page.click('.nav-btn[data-view=brainstorm]');
    // A profile that was used before (the portable run follows the installed run in the same profile) already shows an old
    // conversation, so "an assistant bubble exists" proves nothing: wait for NIE's NEW reply (two more stored messages, none pending).
    const countMessages = () => page.evaluate(() => window.NIE_APP.project.conversation.messages.length);
    const answered = (before) => page.waitForFunction((n) => window.NIE_APP.project.conversation.messages.length >= n + 2 && !document.querySelector('.msg-pending'), before, { timeout: 240000 });
    const before1 = await countMessages();
    await page.fill('#brainstorm-input', 'In one or two sentences, what is a villanelle?');
    await page.press('#brainstorm-input', 'Enter');
    await answered(before1);
    const reply = (await page.evaluate(() => [...document.querySelectorAll('.msg-assistant:not(.msg-pending)')].at(-1)?.textContent ?? '')).trim();
    const route = await page.evaluate(() => window.NIE_APP.project.conversation.messages.at(-1).route);
    report.sampleReply = reply.slice(0, 400);
    step('Brainstorm answer comes from the offline model', route === 'local' && reply.length > 20, `route=${route}; "${reply.slice(0, 140).replace(/\s+/g, ' ')}"`);
    await page.screenshot({ path: path.join(outDir, '3-answer.png') });

    // an idea request: either cards (model followed the format) or a plain reply; never an error
    const before2 = await countMessages();
    await page.click('#lens-row [data-lens=twist]');
    await answered(before2);
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
  if (isWin) {
    // Quitting NIE must stop the model server too, or the next launch/uninstall/upgrade finds files locked.
    const t = spawnSync('tasklist', ['/FI', 'IMAGENAME eq llama-server.exe', '/NH'], { encoding: 'utf8' }).stdout ?? '';
    const left = /llama-server\.exe/i.test(t);
    if (left) spawnSync('taskkill', ['/IM', 'llama-server.exe', '/F'], { stdio: 'ignore' });
    step('quitting NIE also stops the model server (llama-server.exe)', !left, left ? 'llama-server.exe was still running after NIE quit' : 'no llama-server.exe left running');
  }
  app = await launch(userData);
  const after = await app.page.evaluate(() => ({ id: window.NIE_APP.project.id, text: window.NIE_APP.project.storyText }));
  step('the project is still there after closing and re-opening NIE', after.id === idBefore && after.text.includes('lighthouse keeper'), after.text.slice(0, 40));
  const bad = allProblems.filter((p) => !/favicon\.ico|ERR_CONNECTION_REFUSED/i.test(p));
  step('no console errors in the packaged UI', bad.length === 0, bad.slice(0, 3).join(' | '));

  report.ok = true;
} catch (err) {
  report.error = String(err?.message ?? err);
  if (!err?.smokeStep) console.error(report.error);
  try { await app?.page?.screenshot({ path: path.join(outDir, 'failure.png') }); } catch { /* ignore */ }
} finally {
  try { fs.copyFileSync(path.join(userData, 'nie.log'), path.join(outDir, 'nie.log')); } catch { /* may not exist */ }
  try { fs.writeFileSync(path.join(outDir, 'app-output.txt'), allLog.join('')); } catch { /* ignore */ }
  await app?.close();
  spawned.forEach(killTree); // never leave NIE or llama-server behind, even when a launch failed halfway
  fs.writeFileSync(path.join(outDir, 'smoke-report.json'), JSON.stringify(report, null, 2));
  console.log(report.ok ? '\nSMOKE TEST PASSED' : `\nSMOKE TEST FAILED: ${report.error ?? ''}`);
  process.exit(report.ok ? 0 : 1);
}
