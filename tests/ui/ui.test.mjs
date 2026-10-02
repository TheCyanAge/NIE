// End-to-end tests: real Chromium, real UI, real HTTP model server where relevant.
//   npm run test:ui
import baseTest, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { serveWeb } from '../../scripts/serve-web.mjs';
import { makeZip } from '../helpers.js';

// UI_ONLY=1-15,30 runs just those tests (by position): handy for bisecting an interaction between tests.
const only = (process.env.UI_ONLY ?? '').split(',').filter(Boolean).flatMap((r) => { const [a, b = a] = r.split('-').map(Number); return Array.from({ length: b - a + 1 }, (_, i) => a + i); });
let testNo = 0;
const test = (name, fn) => { testNo++; if (!only.length || only.includes(testNo)) baseTest(name, fn); };

const FAKE = fileURLToPath(new URL('../fixtures/fake-llama.mjs', import.meta.url));
const CHROMIUM = process.env.CHROMIUM_PATH ?? ['/opt/pw-browsers/chromium'].find((p) => fs.existsSync(p));
let server;
let browser;

before(async () => {
  server = await serveWeb({ port: 0 });
  browser = await chromium.launch({ executablePath: CHROMIUM, args: ['--disable-dev-shm-usage'] }); // containers often have a tiny /dev/shm
});
after(async () => {
  await browser?.close();
  await server?.close();
});

// ── helpers ──────────────────────────────────────────────────────────────────

/** Open a fresh browser profile. `prefs` are seeded once (not on reload); `init` runs before the app boots. */
async function open({ prefs = { tourOnStartup: false }, query = '', init = null, viewport = { width: 1360, height: 860 } } = {}) {
  const ctx = await browser.newContext({ viewport });
  await ctx.addInitScript((p) => {
    if (!sessionStorage.getItem('__seeded')) {
      sessionStorage.setItem('__seeded', '1');
      if (p) localStorage.setItem('nie.v1.prefs', JSON.stringify(p));
    }
  }, prefs);
  if (init) await ctx.addInitScript(init);
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`[${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
  await page.goto(`${server.url}/${query}`);
  await page.waitForSelector('#story-text');
  return { page, ctx, problems, close: () => ctx.close() };
}

async function run(opts, fn, { allow = null } = {}) {
  const s = await open(opts);
  try {
    await fn(s);
    assert.deepEqual(s.problems.filter((p) => !/favicon/i.test(p) && !(allow && allow.test(p))), [], 'no console errors or warnings');
  } finally {
    await s.close();
  }
}

const TEXT =
  'Suddenly the door opened. She walked slowly into the room and sat down.\n\nHe spoke quietly, and suddenly the lights failed.';

async function addRules(page, ...rules) {
  for (const r of rules) {
    await page.fill('#rule-input', r);
    await page.press('#rule-input', 'Enter');
  }
}

const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
async function startFakeLlama(env = {}) {
  const port = await freePort();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nie-ui-'));
  const model = path.join(dir, 'm.gguf');
  fs.writeFileSync(model, 'GGUF');
  const child = spawn(process.execPath, [FAKE, '-m', model, '--host', '127.0.0.1', '--port', String(port)], { env: { ...process.env, FAKE_LLAMA_CWD_FILE: '/dev/null', FAKE_LLAMA_LOAD_MS: '700', ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => { child.stdout.on('data', (d) => /listening/.test(String(d)) && resolve()); child.on('exit', () => reject(new Error('fake exited'))); });
  return { url: `http://127.0.0.1:${port}`, stop: () => child.kill('SIGTERM') };
}

/** Pretend to be the Electron preload bridge (window.NIE_DESKTOP / NIE_LOCAL / NIE_UPDATER). */
const BRIDGE = () => {
  const L = (window.__bridge = { status: [], chunk: [], state: { state: 'starting', detail: null }, reply: 'Hello from the offline model.', delay: 0, calls: [] });
  window.NIE_DESKTOP = { isDesktop: true, info: async () => ({ version: '0.1.0', platform: 'win32', electron: '44.0.0' }), openFile: async () => null, onMenu: () => () => {} };
  window.NIE_LOCAL = {
    status: async () => L.state,
    onStatus: (cb) => { L.status.push(cb); return () => {}; },
    info: async () => ({ catalog: [{ id: 'qwen', label: 'Qwen2.5 3B Instruct (Q4_K_M)' }], model: { id: 'qwen', fileName: 'Qwen2.5-3B-Instruct-Q4_K_M.gguf', path: 'C:\\NIE\\models\\Qwen2.5-3B-Instruct-Q4_K_M.gguf', exists: true, validation: { ok: true, size: 2.07e9 } }, runtime: { ok: true, problems: [] } }),
    restart: async () => {},
    abort: () => {},
    setAutoDownload: async () => true,
    onChunk: (cb) => L.chunk.push(cb),
    chat: async ({ id, messages }) => {
      L.calls.push(messages);
      if (L.delay) await new Promise((r) => setTimeout(r, L.delay));
      for (const part of L.reply.match(/[\s\S]{1,8}/g)) { L.chunk.forEach((cb) => cb({ id, delta: part })); await new Promise((r) => setTimeout(r, 4)); }
      return { text: L.reply };
    },
  };
  window.__setLocal = (state, detail = null, extra = {}) => { L.state = { state, detail, ...extra }; L.status.forEach((cb) => cb(L.state)); };
};

const bridgeReady = (page) => page.evaluate(() => window.__setLocal('ready'));

// ── shell ────────────────────────────────────────────────────────────────────

test('loads cleanly with the five modes and an honest status when no model is present', async () => {
  await run({}, async ({ page }) => {
    const labels = await page.$$eval('.nav-btn', (b) => b.map((x) => x.textContent.replace(/[^\p{L} ]/gu, '').trim()));
    assert.deepEqual(labels, ['Full Scan', 'Brainstorm', 'Read', 'Projects', 'Settings']);
    assert.equal(await page.getAttribute('.nav-btn[data-view=scan]', 'aria-current'), 'page');
    assert.equal(await page.textContent('#ai-label'), 'NIE · built-in guidance');
    assert.equal(await page.textContent('#ai-banner'), 'Offline NIE is not installed here. Using built-in guidance instead.');
    assert.match(await page.title(), /Untitled project/);
    // There is one assistant identity: nothing in the UI mentions a separate "Local AI".
    assert.ok(!/local ai/i.test(await page.textContent('body')));
  });
});

test('keyboard shortcuts switch modes', async () => {
  await run({}, async ({ page }) => {
    await page.keyboard.press('Control+2');
    assert.equal(await page.getAttribute('.nav-btn[data-view=brainstorm]', 'aria-current'), 'page');
    assert.equal(await page.isVisible('#brainstorm-input'), true);
    await page.keyboard.press('Control+1');
    assert.equal(await page.isVisible('#story-text'), true);
  });
});

test('layout survives narrow windows without horizontal scrolling', async () => {
  for (const width of [1360, 900, 700]) {
    await run({ viewport: { width, height: 800 } }, async ({ page }) => {
      for (const v of ['scan', 'brainstorm', 'read', 'projects', 'settings']) {
        await page.click(`.nav-btn[data-view=${v}]`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert.ok(overflow <= 1, `${v} @${width}px overflows by ${overflow}px`);
      }
    });
  }
});

// ── Story Text and rules ─────────────────────────────────────────────────────

test('Story Text is editable and persists across a reload', async () => {
  await run({}, async ({ page }) => {
    await page.fill('#story-text', TEXT);
    await page.waitForFunction(() => document.querySelector('#word-count').textContent === '21 words');
    await page.waitForTimeout(700);
    await page.reload();
    await page.waitForSelector('#story-text');
    assert.equal(await page.inputValue('#story-text'), TEXT);
  });
});

test('rules: added in plain words, shown with how NIE understood them, editable, switchable, removable', async () => {
  await run({}, async ({ page }) => {
    assert.ok((await page.$$('#rule-examples .chip')).length >= 5, 'examples offered when there are no rules');
    await page.click('#rule-examples .chip >> nth=1'); // "No adverbs"
    assert.equal(await page.inputValue('#rule-input'), 'No adverbs');
    await page.press('#rule-input', 'Enter');
    await addRules(page, 'Never use the word "suddenly"', 'Samantha always wears gloves');
    assert.equal((await page.$$('#rule-list .rule')).length, 3);
    const understood = await page.$$eval('.rule-understood', (e) => e.map((x) => x.textContent));
    assert.match(understood[0], /no adverbs/i);
    assert.match(understood[1], /never use "suddenly"/i);
    assert.match(understood[2], /needs the language model/i);
    assert.equal((await page.$$('#rule-examples .chip')).length, 0, 'examples go away once you have rules');

    // edit
    await page.click('button[aria-label="Edit rule: No adverbs"]');
    assert.equal(await page.inputValue('#rule-input'), 'No adverbs');
    await page.fill('#rule-input', 'No exclamation marks');
    await page.press('#rule-input', 'Enter');
    assert.match((await page.$$eval('.rule-text', (e) => e.map((x) => x.textContent))).join('|'), /No exclamation marks/);
    assert.equal((await page.$$('#rule-list .rule')).length, 3, 'editing does not duplicate');

    // switch off / remove
    await page.uncheck('input[aria-label="Rule enabled: No exclamation marks"]');
    assert.equal(await page.$$eval('.rule.is-off', (e) => e.length), 1);
    await page.click('button[aria-label="Delete rule: No exclamation marks"]');
    assert.equal((await page.$$('#rule-list .rule')).length, 2);
    await page.reload();
    await page.waitForSelector('#story-text');
    assert.equal((await page.$$('#rule-list .rule')).length, 2, 'rules persist');
  });
});

// ── Full Scan: where and why ─────────────────────────────────────────────────

test('Full Scan highlights the exact words that break each rule and explains why', async () => {
  await run({}, async ({ page }) => {
    await page.fill('#story-text', TEXT);
    await addRules(page, 'Never use the word "suddenly"', 'No adverbs');
    await page.click('#run-scan');
    await page.waitForSelector('#headline');
    assert.match(await page.textContent('#headline'), /6 places break your rules \(2 rules affected\)/);

    // switches to the Highlights view so the writer sees WHERE
    assert.equal(await page.isVisible('#story-review'), true);
    assert.equal(await page.isVisible('#story-text'), false);
    const marks = await page.$$eval('#story-review mark.hl', (m) => m.map((x) => x.textContent));
    assert.deepEqual(marks, ['Suddenly', 'slowly', 'quietly', 'suddenly']);
    // The reviewed text is exactly the writer's text. NIE did not touch a character.
    assert.equal((await page.textContent('#story-review')).replace(/^\s*Also highlight general observations\s*/, '').trim().replace(/\s+/g, ' '), TEXT.replace(/\s+/g, ' '));
    assert.equal(await page.inputValue('#story-text'), TEXT);

    // Clicking a highlight says why, and which rule it breaks. "Suddenly" breaks two rules at once.
    await page.click('#story-review mark.hl >> nth=0');
    const pop = page.locator('[data-testid=popover]');
    await pop.waitFor();
    const text = await pop.textContent();
    assert.match(text, /"Suddenly" is ruled out by this rule/);
    assert.match(text, /Rule: Never use the word "suddenly"/);
    assert.match(text, /adverbs are ruled out/);
    assert.match(text, /Line 1/);

    // Results list the same places, grouped by rule, with line numbers and the offending span emphasised.
    await page.keyboard.press('Escape');
    const cards = await page.$$eval('#results .finding', (c) => c.length);
    assert.equal(cards, 6);
    const emphasised = await page.$$eval('#results .finding .quote mark', (m) => m.map((x) => x.textContent));
    assert.deepEqual(emphasised.sort(), ['Suddenly', 'Suddenly', 'quietly', 'slowly', 'suddenly', 'suddenly']);
    assert.match(await page.textContent('#results .finding >> nth=0'), /Line 1/);
  });
});

test('"Show in text" jumps to the highlight', async () => {
  await run({}, async ({ page }) => {
    await page.fill('#story-text', TEXT);
    await addRules(page, 'Never use the word "suddenly"');
    await page.click('#run-scan');
    await page.waitForSelector('#story-review mark.hl');
    await page.click('#story-review >> .. >> .seg-btn[data-mode=edit]');
    assert.equal(await page.isVisible('#story-review'), false);
    await page.click('#results .finding >> nth=1 >> text=Show in text');
    assert.equal(await page.isVisible('#story-review'), true);
    assert.ok(await page.waitForSelector('#story-review mark.flash', { timeout: 3000 }));
  });
});

test('the writer can mark a violation as an exception or dismiss it; both stick across scans', async () => {
  await run({}, async ({ page }) => {
    await page.fill('#story-text', TEXT);
    await addRules(page, 'Never use the word "suddenly"');
    await page.click('#run-scan');
    await page.waitForSelector('#headline');
    assert.match(await page.textContent('#headline'), /2 places break your rules/);

    await page.click('#results .finding >> nth=0 >> text=It\'s an exception');
    assert.match(await page.textContent('#headline'), /1 place breaks your rules/);
    assert.equal(await page.$$eval('#results .finding.cls-intentional-possibility', (e) => e.length), 1);
    await page.click('#results .finding.cls-hard-conflict >> text=Dismiss');
    assert.match(await page.textContent('#headline'), /No rule violations found/);

    await page.click('#run-scan');
    await page.waitForFunction(() => /No rule violations/.test(document.querySelector('#headline')?.textContent ?? ''));
    assert.equal((await page.$$('#results .finding.cls-hard-conflict')).length, 0, 'decisions survive a re-scan');
    assert.equal((await page.$$('#results .finding.cls-intentional-possibility')).length, 1);
  });
});

test('rules that need meaning are never faked offline, and the UI says so', async () => {
  await run({}, async ({ page }) => {
    await page.fill('#story-text', 'Samantha took off her gloves and set them on the table. Then she smiled at the guard.');
    await addRules(page, 'Samantha always wears gloves', 'Samantha never lies');
    await page.click('#run-scan');
    await page.waitForSelector('#headline');
    const states = await page.$$eval('.rule-state', (e) => e.map((x) => x.textContent));
    assert.match(states[0], /needs the language model — not checked offline/);
    assert.match(states[1], /keyword approximation/);
    assert.match(await page.textContent('#headline'), /not checked offline/);
    assert.match(await page.textContent('#results'), /Start the offline model/);
  });
});

test('editing after a scan warns that the highlights are for the earlier text', async () => {
  await run({}, async ({ page }) => {
    await page.fill('#story-text', TEXT);
    await addRules(page, 'No adverbs');
    await page.click('#run-scan');
    await page.waitForSelector('#story-review mark.hl');
    await page.click('.seg-btn[data-mode=edit]');
    await page.fill('#story-text', TEXT + ' More words.');
    await page.click('.seg-btn[data-mode=review]');
    assert.equal(await page.isVisible('.banner-warn >> text=The text has changed'), true);
  });
});

test('general observations are optional and clearly separate from rule violations', async () => {
  await run({}, async ({ page }) => {
    const long = Array.from({ length: 65 }, (_, i) => `word${i}`).join(' ') + '.';
    await page.fill('#story-text', `${long} She walked in. He left the room slowly and quietly, and then he came back.`);
    await addRules(page, 'Never use the word "banana"');
    await page.click('#run-scan');
    await page.waitForSelector('#observations');
    assert.match(await page.textContent('#headline'), /No rule violations found .* · \d+ other observation/);
    assert.equal((await page.$$('#story-review mark.hl')).length, 0, 'observations are not highlighted unless asked');
    await page.uncheck('#obs-toggle');
    await page.click('#run-scan');
    await page.waitForFunction(() => !document.querySelector('#observations'));
  });
});

// ── project isolation ────────────────────────────────────────────────────────

test('a new project is genuinely new: nothing from the previous project is visible or stored with it', async () => {
  await run({}, async ({ page }) => {
    await page.fill('#story-text', 'Samantha walked into the room.');
    await addRules(page, 'Samantha never lies');
    await page.click('#run-scan');
    await page.waitForSelector('#headline');
    await page.click('.nav-btn[data-view=brainstorm]');
    await page.fill('#brainstorm-input', 'Samantha is haunted by Figure.');
    await page.press('#brainstorm-input', 'Enter');
    await page.waitForSelector('.msg-assistant:not(.msg-pending)');
    const firstId = await page.evaluate(() => window.NIE_APP.project.id);

    await page.click('.nav-btn[data-view=projects]');
    await page.click('#new-project');
    await page.waitForSelector('#setup-dialog');
    await page.click('#setup-cancel');

    // Every surface is empty.
    assert.equal(await page.inputValue('#story-text'), '');
    assert.equal((await page.$$('#rule-list .rule')).length, 0);
    assert.equal((await page.$$('#results .finding')).length + (await page.$$('#headline')).length, 0);
    await page.click('.nav-btn[data-view=brainstorm]');
    assert.equal((await page.$$('.chat-log .msg')).length, 0);
    assert.match(await page.textContent('#chat-chips'), /^Try: /, 'the starter suggestion is back in a fresh project');
    const secondId = await page.evaluate(() => window.NIE_APP.project.id);
    assert.notEqual(firstId, secondId);

    // New project's stored data has none of the old project's context.
    const stored = await page.evaluate((id) => localStorage.getItem(`nie.v1.project.${id}`), secondId);
    assert.ok(!/Samantha|Figure/.test(stored));
    // And NIE's reply to a fresh idea doesn't import the old project's story.
    await page.fill('#brainstorm-input', 'A homeless man befriends a cat.');
    await page.press('#brainstorm-input', 'Enter');
    await page.waitForSelector('.msg-assistant:not(.msg-pending)');
    const reply = await page.textContent('.msg-assistant:not(.msg-pending)');
    assert.ok(!/Samantha|Figure|haunt|dread/i.test(reply));
    assert.match(reply, /loneliness|companionship/);
  });
});

test('deleting a project removes every trace of it, and the last deletion leaves a fresh Untitled project', async () => {
  await run({}, async ({ page }) => {
    await page.fill('#story-text', 'Samantha SECRETWORD lives here.');
    await addRules(page, 'Never use the word "SECRETWORD"');
    await page.waitForTimeout(600);
    const id = await page.evaluate(() => window.NIE_APP.project.id);
    await page.click('.nav-btn[data-view=projects]');
    await page.click('.project >> text=Delete…');
    await page.click('#confirm-delete');
    await page.waitForFunction((id) => !Object.keys(localStorage).some((k) => k.includes(id)), id);
    const dump = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage))));
    assert.ok(!dump.includes('SECRETWORD'), 'no story text or rule left in storage');
    assert.ok(!dump.includes(id));
    await page.click('.nav-btn[data-view=scan]');
    assert.equal(await page.inputValue('#story-text'), '');
    assert.match(await page.textContent('#project-name'), /Untitled project/);
  });
});

// ── Brainstorm ───────────────────────────────────────────────────────────────

test('Brainstorm helps from zero, never writes for you, and its starter suggestion appears only once', async () => {
  await run({}, async ({ page }) => {
    await page.click('.nav-btn[data-view=brainstorm]');
    assert.match(await page.textContent('#chat-chips'), /Try: A magician's murder mystery/);
    await page.fill('#brainstorm-input', "I have an idea but I don't know how to start.");
    await page.press('#brainstorm-input', 'Enter');
    await page.waitForSelector('.msg-assistant:not(.msg-pending)');
    const reply = await page.textContent('.msg-assistant:not(.msg-pending)');
    assert.match(reply, /let's hear the idea/i);
    assert.match(reply, /build from whatever you already have/i);
    assert.ok(!/NIE has identified|NIE recommends|NIE flagged/.test(reply));
    assert.ok(!/Try:/.test(await page.textContent('#chat-chips')), 'the demo starter is gone after NIE replies');
    assert.ok((await page.$$('#chat-chips .chip')).length >= 2, 'contextual suggestions replace it');

    await page.fill('#brainstorm-input', 'Write me a scene where they meet');
    await page.press('#brainstorm-input', 'Enter');
    await page.waitForFunction(() => document.querySelectorAll('.msg-assistant').length >= 2);
    assert.match(await page.textContent('.msg-assistant >> nth=1'), /I don't write or continue the story for you/);
    await page.fill('#brainstorm-input', 'Rewrite this paragraph so it flows better');
    await page.press('#brainstorm-input', 'Enter');
    await page.waitForFunction(() => document.querySelectorAll('.msg-assistant').length >= 3);
    assert.match(await page.textContent('.msg-assistant >> nth=2'), /I don't rewrite or edit your text/);
  });
});

test('"NIE is thinking 🪶📜..." shows while waiting, with the three dots waving', async () => {
  await run({ init: BRIDGE }, async ({ page }) => {
    await bridgeReady(page);
    await page.evaluate(() => { window.__bridge.delay = 900; window.__bridge.reply = 'Here is a thought.'; });
    await page.click('.nav-btn[data-view=brainstorm]');
    await page.fill('#brainstorm-input', 'A lighthouse keeper who talks to the sea.');
    await page.press('#brainstorm-input', 'Enter');
    const thinking = page.locator('[data-testid=thinking]');
    await thinking.waitFor();
    assert.equal((await thinking.textContent()).trim(), 'NIE is thinking 🪶📜...');
    const anim = await page.$$eval('.nie-dots i', (is) => is.map((i) => { const c = getComputedStyle(i); return { name: c.animationName, delay: c.animationDelay }; }));
    assert.equal(anim.length, 3);
    assert.ok(anim.every((a) => a.name === 'nie-wave'));
    assert.equal(new Set(anim.map((a) => a.delay)).size, 3, 'staggered, so it reads as a wave');
    await page.waitForSelector('[data-testid=thinking]', { state: 'detached' });
    assert.match(await page.textContent('.msg-assistant'), /Here is a thought\./);
  });
});

// ── the one NIE: status and the offline model ────────────────────────────────

test('offline status is honest at every step, using the exact product wording', async () => {
  await run({ init: BRIDGE }, async ({ page }) => {
    assert.equal(await page.textContent('#ai-banner'), 'Offline NIE is starting...');
    assert.equal(await page.textContent('#ai-label'), 'NIE · starting');
    await page.evaluate(() => window.__setLocal('ready'));
    assert.equal(await page.textContent('#ai-banner'), 'Offline NIE ready.');
    assert.equal(await page.textContent('#ai-label'), 'NIE · offline ready');
    await page.evaluate(() => window.__setLocal('failed', 'The llama.cpp CPU backend is missing ("no backends are loaded").'));
    assert.equal(await page.textContent('#ai-banner'), 'Offline NIE model failed to start. Using built-in guidance instead.');
    assert.equal(await page.textContent('#ai-label'), 'NIE · built-in guidance');
    // The model selector and details live in Settings; the cause of a failure is shown there.
    await page.click('#ai-chip');
    assert.match(await page.textContent('#settings-ai-status'), /failed to start/);
    assert.match(await page.textContent('#model-info'), /no backends are loaded/);
    assert.equal(await page.isVisible('#model-select'), true);
  });
});

test('when the offline model is ready NIE answers through it, streamed, as the same NIE', async () => {
  await run({ init: BRIDGE }, async ({ page }) => {
    await bridgeReady(page);
    await page.evaluate(() => { window.__bridge.reply = 'What does he want from the cat?\n\n- Company\n- Something stranger'; });
    await page.click('.nav-btn[data-view=brainstorm]');
    await page.fill('#brainstorm-input', 'A homeless man befriends a cat.');
    await page.press('#brainstorm-input', 'Enter');
    await page.waitForSelector('.msg-assistant:not(.msg-pending)'); // the finished message, not the one still streaming
    assert.match(await page.textContent('.msg-assistant:not(.msg-pending)'), /What does he want/);
    assert.equal(await page.$$eval('.msg-assistant:not(.msg-pending) li', (e) => e.length), 2, 'markdown-lite renders the list');
    const sent = await page.evaluate(() => window.__bridge.calls.at(-1));
    assert.equal(sent[0].role, 'system');
    assert.match(sent[0].content, /NEVER write, rewrite, edit or continue/);
    assert.match(sent.at(-1).content, /A homeless man befriends a cat\./);
    // No separate "Local AI" persona anywhere in the conversation.
    assert.equal(await page.textContent('.msg-assistant .msg-who'), 'NIE');
  });
});

test('with the model ready, meaning-based rules are judged by sentence number and highlighted exactly', async () => {
  await run({ init: BRIDGE }, async ({ page }) => {
    await bridgeReady(page);
    const text = 'Samantha tugged on her gloves. She took them off at the table. Joss watched her hands.';
    await page.evaluate(() => { window.__bridge.reply = '2 | Takes her gloves off\n57 | made up\nRewrite: "She kept them on."'; });
    await page.fill('#story-text', text);
    await addRules(page, 'Samantha always wears gloves');
    await page.click('#run-scan');
    await page.waitForFunction(() => document.querySelector('.rule-state')?.textContent?.includes('judged by the language model'));
    const marks = await page.$$eval('#story-review mark.hl', (m) => m.map((x) => x.textContent));
    assert.deepEqual(marks, ['She took them off at the table.']);
    assert.match(await page.textContent('#results .finding .why'), /Takes her gloves off/);
    assert.ok(!/She kept them on/.test(await page.textContent('body')), 'text the model tried to write never reaches the page');
    assert.equal(await page.inputValue('#story-text'), text);
  });
});

test('a real llama-server-style HTTP model: status goes starting → ready by itself, then it answers', async () => {
  const fake = await startFakeLlama({ FAKE_LLAMA_REPLY: 'I can help with that. Who is he?' });
  try {
    await run({ query: `?llama=${encodeURIComponent(fake.url)}` }, async ({ page }) => {
      assert.match(await page.textContent('#ai-banner'), /Offline NIE is starting/);
      await page.waitForFunction(() => document.querySelector('#ai-label')?.textContent === 'NIE · offline ready', null, { timeout: 8000 });
      assert.equal(await page.textContent('#ai-banner'), 'Offline NIE ready.');
      await page.click('.nav-btn[data-view=brainstorm]');
      await page.fill('#brainstorm-input', 'A lighthouse keeper.');
      await page.press('#brainstorm-input', 'Enter');
      await page.waitForFunction(() => /I can help with that/.test(document.querySelector('.msg-assistant')?.textContent ?? ''), null, { timeout: 8000 });
    }, { allow: /503 \(Service Unavailable\)/ });
  } finally { fake.stop(); }
});

// ── Read mode and import ─────────────────────────────────────────────────────

const DOCX = () => makeZip({
  'word/document.xml': '<w:document><w:p><w:r><w:t>Monday</w:t></w:r></w:p><w:p><w:r><w:t>He left the room quietly.</w:t></w:r></w:p><w:p><w:r><w:t>Suddenly the lights failed.</w:t></w:r></w:p></w:document>',
});

test('Read mode: any supported file becomes Story Text, with the format recognised, and flows into Full Scan', async () => {
  await run({}, async ({ page }) => {
    await page.click('.nav-btn[data-view=read]');
    await page.setInputFiles('#read-input', { name: 'draft.docx', mimeType: 'application/octet-stream', buffer: Buffer.from(DOCX()) });
    await page.waitForFunction(() => window.NIE_APP.project.storyText.includes('Suddenly the lights failed.'));
    assert.match(await page.textContent('#read-info'), /Word \(DOCX\)/);
    assert.match(await page.textContent('#read-info'), /draft\.docx/);
    assert.match(await page.textContent('#read-page'), /He left the room quietly\./);
    assert.match(await page.textContent('.toast'), /Imported .* words from draft\.docx/);

    await addRulesViaScan(page);
    await page.click('#read-to-scan');
    await page.waitForSelector('#headline');
    assert.equal(await page.isVisible('#story-review'), true);
    const marks = await page.$$eval('#story-review mark.hl', (m) => m.map((x) => x.textContent));
    assert.deepEqual(marks, ['quietly', 'Suddenly'], '"Suddenly" breaks two rules but is one highlight');
  });
});

async function addRulesViaScan(page) {
  await page.click('.nav-btn[data-view=scan]');
  await addRules(page, 'No adverbs', 'Never use the word "suddenly"');
  await page.click('.nav-btn[data-view=read]');
}

test('importing over existing text asks first: replace, add to the end, or cancel', async () => {
  await run({}, async ({ page }) => {
    await page.fill('#story-text', 'My own words.');
    await page.setInputFiles('#import-input', { name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('Imported words.') });
    await page.waitForSelector('#imp-append');
    await page.click('#imp-cancel');
    assert.equal(await page.inputValue('#story-text'), 'My own words.');
    await page.setInputFiles('#import-input', { name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('Imported words.') });
    await page.click('#imp-append');
    await page.waitForFunction(() => document.querySelector('#story-text').value.includes('Imported'));
    assert.match(await page.inputValue('#story-text'), /^My own words\.\n+Imported words\.$/);
    await page.setInputFiles('#import-input', { name: 'b.md', mimeType: 'text/markdown', buffer: Buffer.from('# Title\n\nReplaced **text**.') });
    await page.click('#imp-replace');
    await page.waitForFunction(() => document.querySelector('#story-text').value.startsWith('Title'));
    assert.equal(await page.inputValue('#story-text'), 'Title\n\nReplaced text.');
  });
});

test('unreadable files explain themselves and change nothing', async () => {
  await run({}, async ({ page }) => {
    await page.fill('#story-text', 'Keep me.');
    await page.setInputFiles('#import-input', { name: 'old.doc', mimeType: 'application/msword', buffer: Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0, 0, 0, 0]) });
    await page.waitForSelector('.toast-error');
    assert.match(await page.textContent('.toast-error'), /\.docx/);
    assert.equal(await page.inputValue('#story-text'), 'Keep me.');
  });
});

const SPEECH = () => {
  const S = (window.__speech = { spoken: [], current: null, paused: false });
  window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
    speak(u) { S.current = u; S.spoken.push(u.text); }, cancel() { S.current = null; }, pause() { S.paused = true; }, resume() { S.paused = false; },
    getVoices: () => [{ name: 'Test Voice', lang: 'en-GB' }], addEventListener() {},
  } });
  S.finish = () => { const u = S.current; S.current = null; u?.onend?.(); };
};

test('read-aloud: highlights what is being read, pauses and resumes, and skips by section', async () => {
  await run({ init: SPEECH }, async ({ page }) => {
    await page.fill('#story-text', 'First paragraph here. It has two sentences.\n\nSecond paragraph follows.\n\nThird.');
    await page.click('.nav-btn[data-view=read]');
    await page.waitForSelector('#read-page .chunk');
    assert.equal(await page.isEnabled('#read-play'), true);
    await page.click('#read-play');
    assert.match(await page.textContent('#read-play'), /Pause/);
    assert.match(await page.textContent('.chunk.is-current'), /First paragraph here\. It has two sentences\./);
    await page.evaluate(() => window.__speech.finish());
    assert.match(await page.textContent('.chunk.is-current'), /Second paragraph follows\./);
    await page.click('#read-play'); // pause
    assert.match(await page.textContent('#read-play'), /Resume/);
    assert.equal(await page.evaluate(() => window.__speech.paused), true);
    await page.click('#read-play'); // resume
    await page.click('#read-next');
    assert.match(await page.textContent('.chunk.is-current'), /^Third\./);
    assert.match(await page.textContent('#read-where'), /Section 3 of 3/);
    await page.click('#read-prev');
    assert.match(await page.textContent('.chunk.is-current'), /Second paragraph/);
    await page.click('#read-stop');
    assert.equal(await page.$$eval('.chunk.is-current', (e) => e.length), 0);
    assert.equal(await page.isVisible('#read-voice'), true);
  });
});

test('text typed in Full Scan is what Read mode reads, even after Read has already loaded something', async () => {
  await run({}, async ({ page }) => {
    await page.fill('#story-text', 'First version.');
    await page.click('.nav-btn[data-view=read]');
    await page.waitForFunction(() => document.querySelector('#read-page').textContent.includes('First version.'));
    await page.click('.nav-btn[data-view=scan]');
    await page.fill('#story-text', 'Second version, longer now.');
    await page.click('.nav-btn[data-view=read]');
    await page.waitForFunction(() => document.querySelector('#read-page').textContent.includes('Second version'));
    assert.ok(!(await page.textContent('#read-page')).includes('First version'));
  });
});

test('Read mode editing input works and stays in sync with Story Text', async () => {
  await run({}, async ({ page }) => {
    await page.fill('#story-text', 'Original.');
    await page.click('.nav-btn[data-view=read]');
    await page.click('#view-read .seg-btn >> text=Edit');
    await page.fill('#read-editor', 'Edited in Read mode.');
    await page.click('.nav-btn[data-view=scan]');
    assert.equal(await page.inputValue('#story-text'), 'Edited in Read mode.');
  });
});

// ── tour, setup, and the no-blocked-inputs guarantee ─────────────────────────

const rectOf = (page, sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });

const ringReady = (page) => page.waitForFunction(() => { const r = document.querySelector('.tour-ring'); return r && getComputedStyle(r).display === 'block' && r.getBoundingClientRect().width > 0; });
const stepTo = async (page, n) => {
  await page.click('#tour-next');
  await page.waitForFunction((k) => document.querySelector('#tour-count')?.textContent === `${k + 1} of 10`, n);
};

test('tour: the feature being explained stays clear while the rest is dimmed and blurred; the target is not interactive', async () => {
  await run({}, async ({ page }) => {
    await page.click('#help-tour');
    await page.waitForSelector('.tour-card');
    assert.match(await page.textContent('#tour-title'), /Welcome/);
    assert.equal(await page.$eval('.tour-dim', (e) => getComputedStyle(e).clipPath), 'none', 'the welcome step has no target, so nothing is cut out');
    const titles = [];
    const vw = await page.evaluate(() => innerWidth);
    const vh = await page.evaluate(() => innerHeight);
    for (let i = 1; i < 10; i++) {
      await stepTo(page, i);
      await ringReady(page);
      const title = await page.textContent('#tour-title');
      titles.push(title);
      const ring = await rectOf(page, '.tour-ring');
      const card = await rectOf(page, '.tour-card');
      const shield = await rectOf(page, '.tour-shield');
      assert.ok(ring.w > 20 && ring.h > 20, `${title}: there is a visible highlight`);
      assert.ok(card.x >= 0 && card.y >= 0 && card.x + card.w <= vw && card.y + card.h <= vh, `${title}: card is on screen`);
      assert.match(await page.$eval('.tour-dim', (e) => getComputedStyle(e).clipPath), /polygon/, `${title}: the target is cut out of the dimming`);
      assert.ok(await page.$eval('.tour-dim', (e) => getComputedStyle(e).backdropFilter.includes('blur')), `${title}: the rest is blurred`);
      assert.ok(Math.abs(shield.x - ring.x) < 2 && Math.abs(shield.y - ring.y) < 2 && Math.abs(shield.w - ring.w) < 2, `${title}: the shield sits exactly over the highlight`);
      const overlap = !(card.x + card.w <= ring.x || ring.x + ring.w <= card.x || card.y + card.h <= ring.y || ring.y + ring.h <= card.y);
      assert.ok(!overlap, `${title}: the card does not cover the thing it is explaining`);
      // Non-interactive: a click on the highlighted feature is caught by the shield, never reaching the feature.
      const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.dataset?.tourPart ?? null, { x: ring.x + ring.w / 2, y: ring.y + ring.h / 2 });
      assert.equal(hit, 'shield', `${title}: highlighted target is not clickable during the tour`);
    }
    assert.deepEqual(titles, ['Story Text', 'Your rules', 'Full Scan', 'Import any document', 'Brainstorm', 'Read', 'Projects and profile', 'Offline AI', 'Settings']);
  });
});

test('tour: each spotlight lands on the real element it names', async () => {
  await run({}, async ({ page }) => {
    const expect = { 1: '[data-tour="story-text"]', 2: '[data-tour="rules"]', 3: '[data-tour="run-scan"]', 4: '[data-tour="import"]', 5: '[data-tour="nav-brainstorm"]', 6: '[data-tour="nav-read"]', 7: '[data-tour="nav-projects"]', 8: '[data-tour="ai-status"]', 9: '[data-tour="nav-settings"]' };
    await page.click('#help-tour');
    await page.waitForSelector('.tour-card');
    for (let i = 1; i <= 9; i++) {
      await stepTo(page, i);
      await ringReady(page);
      const ring = await rectOf(page, '.tour-ring');
      const real = await rectOf(page, expect[i]);
      assert.ok(Math.abs(ring.x - (real.x - 8)) <= 2 && Math.abs(ring.y - (real.y - 8)) <= 2 && Math.abs(ring.w - (real.w + 16)) <= 4 && Math.abs(ring.h - (real.h + 16)) <= 4, `step ${i}: ring ${JSON.stringify(ring)} vs target ${JSON.stringify(real)}`);
    }
  });
});

test('tour: finishing leaves no overlay behind, and the Story Text is clickable and typeable right after', async () => {
  await run({}, async ({ page }) => {
    await page.click('#help-tour');
    for (let i = 0; i < 9; i++) await page.click('#tour-next');
    assert.equal(await page.isVisible('#tour-startup'), true);
    await page.click('#tour-next'); // Done
    assert.equal(await page.getAttribute('#tour-root', 'hidden'), '');
    assert.equal(await page.$$eval('#tour-root > *', (c) => c.length), 0, 'the overlay DOM is gone, not just hidden');
    await page.click('.nav-btn[data-view=scan]');
    const hit = await page.evaluate(() => { const r = document.querySelector('#story-text').getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width / 2, r.y + 80); return e?.id; });
    assert.equal(hit, 'story-text');
    await page.click('#story-text');
    await page.keyboard.type('Typing works.');
    assert.equal(await page.inputValue('#story-text'), 'Typing works.');
  });
});

test('tour: Escape skips it; the startup preference persists; Help → Tour always works', async () => {
  // On by default: appears at startup.
  const first = await open({ prefs: null });
  try {
    await first.page.waitForSelector('.tour-card', { timeout: 3000 });
    await first.page.click('#tour-skip');
    assert.equal(await first.page.getAttribute('#tour-root', 'hidden'), '');
  } finally { await first.close(); }

  await run({ prefs: null }, async ({ page }) => {
    await page.waitForSelector('.tour-card');
    for (let i = 0; i < 9; i++) await page.click('#tour-next');
    await page.uncheck('#tour-startup');
    await page.click('#tour-next');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('nie.v1.prefs')).tourOnStartup), false);
    await page.reload();
    await page.waitForSelector('#story-text');
    await page.waitForTimeout(1000);
    assert.equal(await page.getAttribute('#tour-root', 'hidden'), '', 'does not reappear once switched off');
    await page.click('#help-tour');
    await page.waitForSelector('.tour-card');
    await page.keyboard.press('Escape');
    assert.equal(await page.getAttribute('#tour-root', 'hidden'), '');
    // And the Settings toggle mirrors it.
    await page.click('.nav-btn[data-view=settings]');
    assert.equal(await page.isChecked('#tour-toggle'), false);
    await page.check('#tour-toggle');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('nie.v1.prefs')).tourOnStartup), true);
    await page.click('#start-tour');
    await page.waitForSelector('.tour-card');
  });
});

test('project setup is its own dialog: it fills from a description, saves, and leaves nothing over the editor', async () => {
  await run({}, async ({ page }) => {
    await page.click('.nav-btn[data-view=projects]');
    await page.click('#new-project');
    await page.waitForSelector('#setup-dialog[open]');
    assert.match(await page.textContent('#setup-title'), /Tell NIE what you're making/);
    await page.fill('#setup-describe', 'A first-person, present-tense psychological horror novel with an unreliable narrator. Dark and eerie, minimalist prose.');
    await page.click('#setup-fill');
    assert.equal(await page.inputValue('#setup-genre-primary'), 'psychological horror');
    assert.equal(await page.inputValue('#setup-identity-format'), 'novel');
    assert.equal(await page.inputValue('#setup-style-pov'), 'first person');
    assert.equal(await page.inputValue('#setup-narrative-reliability'), 'unreliable narrator');
    assert.match(await page.inputValue('#setup-tone'), /dark/);
    await page.fill('#setup-identity-title', 'Apply');
    await page.click('#setup-save');
    await page.waitForSelector('#setup-dialog', { state: 'detached' }); // removed from the DOM, not just hidden
    assert.equal(await page.textContent('#project-name'), 'Apply');
    assert.equal(await page.evaluate(() => window.NIE_APP.project.profile.genre.primary), 'psychological horror');
    const hit = await page.evaluate(() => { const r = document.querySelector('#story-text').getBoundingClientRect(); return document.elementFromPoint(r.x + r.width / 2, r.y + 80)?.id; });
    assert.equal(hit, 'story-text');
    // A description that names nothing leaves the fields empty rather than guessing a genre.
    await page.click('.nav-btn[data-view=projects]');
    await page.click('.btn-sm >> text=Profile…');
    await page.fill('#setup-describe', 'A homeless man befriends a cat.');
    await page.fill('#setup-genre-primary', '');
    await page.click('#setup-fill');
    assert.equal(await page.inputValue('#setup-genre-primary'), '');
    assert.match(await page.textContent('#setup-note'), /rather than guess/);
    await page.click('#setup-cancel');
  });
});

test('input guard: a stale onboarding layer over Story Text is cleared automatically, with no Recovery Mode', async () => {
  await run({ query: '?guardMs=250' }, async ({ page }) => {
    await page.evaluate(() => {
      window.__bannerShown = false;
      new MutationObserver(() => { if (!document.getElementById('recovery-banner').hidden) window.__bannerShown = true; }).observe(document.getElementById('recovery-banner'), { attributes: true });
      for (const id of ['onboarding-chat-form', 'onboarding-chat']) {
        const d = document.createElement('div');
        d.id = id;
        d.style.cssText = 'position:fixed;inset:0;z-index:400;background:transparent';
        document.body.append(d);
      }
    });
    await page.waitForFunction(() => !document.getElementById('onboarding-chat-form'), null, { timeout: 4000 });
    const hit = await page.evaluate(() => { const r = document.querySelector('#story-text').getBoundingClientRect(); return document.elementFromPoint(r.x + r.width / 2, r.y + 80)?.id; });
    assert.equal(hit, 'story-text');
    await page.click('#story-text');
    await page.keyboard.type('still works');
    assert.equal(await page.inputValue('#story-text'), 'still works');
    assert.equal(await page.evaluate(() => window.__bannerShown), false, 'self-heal first: the writer never saw Recovery Mode');
  });
});

test('input guard: only a persistent failure shows Recovery Mode, and "Restore workspace" resets the view', async () => {
  await run({ query: '?guardMs=200' }, async ({ page }) => {
    await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;inset:0;z-index:500;pointer-events:auto;background:transparent';
      const css = probe.style.cssText; // the browser's normalised form, so comparing never loops
      const mk = () => { const d = document.createElement('div'); d.id = 'mystery-overlay'; d.style.cssText = css; document.body.append(d); };
      mk();
      // Something that keeps putting the layer back: removal and style changes are both undone.
      new MutationObserver(() => { const d = document.getElementById('mystery-overlay'); if (!d) mk(); else if (d.style.cssText !== css) d.style.cssText = css; }).observe(document.body, { childList: true, attributes: true, subtree: true });
    });
    await page.waitForSelector('#recovery-banner:not([hidden])', { timeout: 6000 });
    assert.match(await page.textContent('#recovery-banner'), /blocking the editor/);
    await page.click('#recovery-restore'); // no force: nothing may sit above the banner
    assert.equal(await page.isHidden('#recovery-banner'), true);
    assert.equal(await page.getAttribute('.nav-btn[data-view=scan]', 'aria-current'), 'page');
  });
});

test('input guard diagnostics are mode-aware and throttled, and silent in production', async () => {
  // Production default: nothing logged even while something is blocking.
  const quiet = await open({ query: '?guardMs=150' });
  try {
    const logs = [];
    quiet.page.on('console', (m) => logs.push(m.text()));
    await quiet.page.evaluate(() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;z-index:500;pointer-events:auto !important'; document.body.append(d); });
    await quiet.page.waitForTimeout(1500);
    assert.deepEqual(logs.filter((l) => /input (guard|blocker)/i.test(l)), []);
  } finally { await quiet.close(); }

  // Diagnostics on: a few messages, not a flood; and none for inputs that aren't on screen.
  const loud = await open({ prefs: { tourOnStartup: false, diagnostics: true }, query: '?guardMs=100' });
  try {
    const logs = [];
    loud.page.on('console', (m) => logs.push(m.text()));
    await loud.page.evaluate(() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;z-index:500;pointer-events:auto !important'; document.body.append(d); });
    await loud.page.waitForTimeout(2000);
    const guard = logs.filter((l) => /\[NIE input guard\]/.test(l));
    assert.ok(guard.length >= 1 && guard.length <= 3, `expected a handful of messages, got ${guard.length}`);
    assert.ok(!guard.some((l) => /brainstorm-input/.test(l)), 'does not report inputs from modes that are not showing');
    logs.length = 0;
    await loud.page.click('.nav-btn[data-view=settings]', { force: true }).catch(() => {});
    await loud.page.evaluate(() => window.NIE_APP.setView('settings'));
    await loud.page.waitForTimeout(1200);
    assert.deepEqual(logs.filter((l) => /\[NIE input guard\]/.test(l)), [], 'Settings has no primary input, so nothing to report');
  } finally { await loud.close(); }
});

// ── Settings ─────────────────────────────────────────────────────────────────

test('Settings: theme, observation preference and data erase', async () => {
  await run({}, async ({ page }) => {
    await page.fill('#story-text', 'Something I wrote.');
    await page.waitForTimeout(600);
    await page.click('.nav-btn[data-view=settings]');
    await page.selectOption('#theme-select', 'light');
    assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
    await page.uncheck('#settings-obs');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('nie.v1.prefs')).showObservations), false);
    await page.reload();
    await page.waitForSelector('#story-text');
    assert.equal(await page.getAttribute('html', 'data-theme'), 'light', 'theme persists');

    await page.click('.nav-btn[data-view=settings]');
    await page.click('#erase-all');
    await page.click('#confirm-erase');
    await page.click('.nav-btn[data-view=scan]');
    assert.equal(await page.inputValue('#story-text'), '');
    const keys = await page.evaluate(() => Object.keys(localStorage));
    assert.ok(keys.includes('nie.v1.prefs'), 'preferences survive an erase');
    assert.equal(await page.evaluate(() => localStorage.getItem('nie.v1.prefs').includes('light')), true);
  });
});

test('Settings → updates: honest in a browser, and honest about an unconfigured updater in the desktop app', async () => {
  await run({}, async ({ page }) => {
    await page.click('.nav-btn[data-view=settings]');
    assert.match(await page.textContent('#update-status'), /installed desktop app/);
    assert.equal(await page.isDisabled('#update-check'), true);
  });
  await run({
    init: () => {
      window.NIE_UPDATER = { status: async () => ({ state: 'unconfigured', message: "Updates aren't configured for this build yet." }), check: async () => ({ state: 'unconfigured', message: "Updates aren't configured for this build yet." }), install: () => {}, onStatus: (cb) => { window.__updCb = cb; } };
    },
  }, async ({ page }) => {
    await page.click('.nav-btn[data-view=settings]');
    await page.waitForFunction(() => /aren't configured/.test(document.querySelector('#update-status').textContent));
    assert.equal(await page.isDisabled('#update-check'), true);
    assert.equal(await page.isHidden('#update-install'), true);
    await page.evaluate(() => window.__updCb({ state: 'downloaded', message: 'Update ready. Restart to install.', version: '0.2.0' }));
    assert.equal(await page.isVisible('#update-install'), true);
    assert.match(await page.textContent('#update-status'), /Restart to install/);
  });
});

test('Settings → online model is optional, saved locally and tested honestly', async () => {
  await run({}, async ({ page }) => {
    await page.click('.nav-btn[data-view=settings]');
    await page.check('#online-enabled');
    const closed = await new Promise((res) => { const sv = net.createServer(); sv.listen(0, '127.0.0.1', () => { const p = sv.address().port; sv.close(() => res(p)); }); });
    await page.fill('#online-url', `http://127.0.0.1:${closed}/v1`);
    await page.fill('#online-model', 'x');
    await page.click('#online-test');
    await page.waitForFunction(() => /Could not connect/.test(document.querySelector('#online-msg').textContent), null, { timeout: 8000 });
    // With no reachable online model and no offline model, NIE still answers with built-in guidance.
    await page.click('.nav-btn[data-view=brainstorm]');
    await page.fill('#brainstorm-input', "I don't know what to write.");
    await page.press('#brainstorm-input', 'Enter');
    await page.waitForSelector('.msg-assistant:not(.msg-pending)', { timeout: 10000 });
    assert.match(await page.textContent('.msg-assistant:not(.msg-pending)'), /let's hear the idea/i);
  }, { allow: /ERR_CONNECTION_REFUSED/ });
});

// ── Brainstorm as an idea partner ────────────────────────────────────────────

const openBrainstorm = (page) => page.click('.nav-btn[data-view=brainstorm]');
const boardCount = (page, n) => page.waitForFunction((n) => document.querySelector('#board-count')?.textContent === String(n), n);
const say = async (page, text) => {
  const before = await page.$$eval('.msg-assistant:not(.msg-pending)', (m) => m.length);
  await page.fill('#brainstorm-input', text);
  await page.press('#brainstorm-input', 'Enter');
  await page.waitForFunction((n) => document.querySelectorAll('.msg-assistant:not(.msg-pending)').length > n, before);
};

test('Brainstorm offers a kind picker, quick idea buttons for what you are making, and an empty Idea Board', async () => {
  await run({}, async ({ page }) => {
    await openBrainstorm(page);
    const kinds = await page.$$eval('#kind-row .kind-chip', (b) => b.map((x) => x.textContent));
    assert.deepEqual(kinds, ['Anything', 'Story', 'Characters', 'World', 'Article', 'Essay & memoir', 'Poem', 'Script']);
    assert.equal(await page.getAttribute('#kind-row [data-kind=auto]', 'aria-checked'), 'true');
    assert.ok((await page.$$('#lens-row .lens-chip')).length >= 6, 'quick idea buttons are there from the start');
    assert.match(await page.textContent('#idea-board'), /Nothing kept yet/);
    assert.equal(await page.textContent('#board-count'), '0');
    assert.match(await page.textContent('#understands'), /Working on\s*Not sure yet/);
    assert.equal(await page.isDisabled('#board-copy'), true, 'nothing to copy yet');
    // The idea partner still says plainly what it will not do.
    assert.match(await page.textContent('[data-view=brainstorm] .page-sub'), /never writes or edits your text/);

    await page.click('#kind-row [data-kind=article]');
    const lenses = await page.$$eval('#lens-row .lens-chip', (b) => b.map((x) => x.textContent));
    assert.ok(lenses.includes('Angles') && lenses.includes('Hooks') && lenses.includes('Counter-arguments'), lenses.join(', '));
    assert.ok(!lenses.includes('Twists'), 'story-only buttons are gone for an article');
    await page.reload();
    await page.waitForSelector('#story-text');
    await openBrainstorm(page);
    assert.equal(await page.getAttribute('#kind-row [data-kind=article]', 'aria-checked'), 'true', 'the choice is kept with the project');
  });
});

test('tapping an idea button sends it, NIE answers with idea cards and a question, and nothing is written for you', async () => {
  await run({}, async ({ page }) => {
    await openBrainstorm(page);
    await page.click('#kind-row [data-kind=article]');
    await page.click('#lens-row [data-lens=angle]');
    await page.waitForSelector('.msg-assistant:not(.msg-pending) .idea');
    assert.equal(await page.textContent('.msg-user .bubble-body'), 'Give me some angles.');
    const cards = await page.$$eval('.msg-assistant .idea', (c) => c.map((x) => ({ lens: x.querySelector('.idea-lens').textContent, text: x.querySelector('.idea-text').textContent })));
    assert.equal(cards.length, 3);
    assert.ok(cards.every((c) => c.lens === 'Angles' && c.text.length > 25));
    assert.match(await page.textContent('.msg-assistant .bubble-body'), /\?/);
    assert.match(await page.textContent('.msg-assistant .bubble-body'), /built-in guidance/i, 'honest about where the ideas come from when no model is running');
    assert.ok(!/NIE has identified|NIE recommends|NIE flagged/.test(await page.textContent('.msg-assistant')));
    const chips = await page.$$eval('#chat-chips .chip', (c) => c.map((x) => x.textContent));
    assert.ok(chips.includes('More like these') && chips.includes('Flip it') && chips.includes('Develop the first one'), chips.join(', '));
    // "More like these" sends straight away and gives different ideas.
    await page.click('#chat-chips >> text=More like these');
    await page.waitForFunction(() => document.querySelectorAll('.msg-assistant:not(.msg-pending) .idea').length >= 6);
    const all = await page.$$eval('.msg-assistant .idea-text', (c) => c.map((x) => x.textContent));
    assert.equal(new Set(all).size, 6, 'six different ideas');
    // Typed requests work the same way, and prose is still declined.
    await say(page, 'Write me a scene with three twists');
    assert.match(await page.textContent('.msg-assistant >> nth=2'), /I don't write or continue the story for you/);
  });
});

test('keeping ideas: star a card, it lands on the Idea Board, survives a reload, and un-starring or removing clears it everywhere', async () => {
  await run({}, async ({ page }) => {
    await openBrainstorm(page);
    await page.click('#lens-row [data-lens=twist]');
    await page.waitForSelector('.msg-assistant .idea');
    const first = await page.textContent('.msg-assistant .idea >> nth=0 >> .idea-text');
    await page.click('.msg-assistant .idea >> nth=0 >> .idea-keep');
    assert.equal(await page.getAttribute('.msg-assistant .idea >> nth=0 >> .idea-keep', 'aria-pressed'), 'true');
    assert.equal(await page.textContent('#board-count'), '1');
    assert.equal(await page.textContent('#board-list .board-item .board-text'), first);
    assert.match(await page.textContent('#board-list .board-item .board-meta'), /From NIE/);
    await page.reload();
    await page.waitForSelector('#story-text');
    await openBrainstorm(page);
    assert.equal(await page.textContent('#board-count'), '1', 'the board is part of the project, so it persists');
    assert.equal(await page.getAttribute('.msg-assistant .idea >> nth=0 >> .idea-keep', 'aria-pressed'), 'true', 'the star is restored on the card');
    assert.equal(await page.getAttribute('.msg-assistant .idea >> nth=1 >> .idea-keep', 'aria-pressed'), 'false');
    await page.click('.msg-assistant .idea >> nth=0 >> .idea-keep');
    assert.equal(await page.textContent('#board-count'), '0');
    // Keep again, then remove from the board: the star clears.
    await page.click('.msg-assistant .idea >> nth=0 >> .idea-keep');
    await page.click('#board-list .board-item >> text=Remove');
    assert.equal(await page.textContent('#board-count'), '0');
    assert.equal(await page.getAttribute('.msg-assistant .idea >> nth=0 >> .idea-keep', 'aria-pressed'), 'false');
  });
});

test('the Idea Board is the writer\'s: add, edit, note, develop, copy-ready export, remove', async () => {
  await run({}, async ({ page, ctx }) => {
    await openBrainstorm(page);
    await page.fill('#board-add', 'A clock that runs backwards.');
    await page.press('#board-add', 'Enter');
    await boardCount(page, 1);
    assert.match(await page.textContent('#board-list .board-meta'), /Yours/);
    await page.click('#board-list .board-item >> text=Edit');
    await page.fill('#board-list textarea', 'A clock that runs backwards, but only on Sundays.');
    await page.click('#board-list .board-edit >> text=Save');
    assert.equal(await page.textContent('#board-list .board-text'), 'A clock that runs backwards, but only on Sundays.');
    await page.click('#board-list .board-item >> text=Note');
    await page.fill('#board-list .board-note-input', 'maybe the opening image');
    await page.press('#board-list .board-note-input', 'Enter');
    assert.match(await page.textContent('#board-list .board-note'), /maybe the opening image/);
    await page.fill('#board-add', 'a clock that runs backwards, but only on sundays.');
    await page.press('#board-add', 'Enter');
    await page.waitForFunction(() => document.querySelector('#board-add').value === '');
    assert.equal(await page.textContent('#board-count'), '1', 'the same idea is not added twice');

    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#board-download')]);
    assert.match(dl.suggestedFilename(), /idea-board\.md$/);
    const body = fs.readFileSync(await dl.path(), 'utf8');
    assert.match(body, /# Idea Board: Untitled project/);
    assert.match(body, /- A clock that runs backwards, but only on Sundays\./);
    assert.match(body, /_Note: maybe the opening image_/);

    await page.click('#board-list .board-item >> text=Develop');
    await page.waitForSelector('.msg-assistant:not(.msg-pending)');
    assert.match(await page.textContent('.msg-user .bubble-body'), /^Let's develop this idea: A clock that runs backwards, but only on Sundays\.$/);
    assert.match(await page.textContent('.msg-assistant .bubble-body'), /Good one to dig into/);
    assert.equal((await page.$$('.msg-assistant .idea')).length, 0, 'questions, not more cards');
    await page.click('#board-list .board-item >> text=Remove');
    assert.equal(await page.textContent('#board-count'), '0');
    void ctx;
  });
});

test('"remember this", "remember: …" and "show my idea board" work in the chat without a model', async () => {
  await run({}, async ({ page }) => {
    await openBrainstorm(page);
    await page.click('#lens-row [data-lens=spark]');
    await page.waitForSelector('.msg-assistant .idea');
    await say(page, 'remember this');
    assert.match(await page.textContent('.msg-assistant >> nth=1'), /Kept on your Idea Board/);
    assert.equal(await page.textContent('#board-count'), '3');
    await say(page, 'Remember: the cat can talk, but only to the tenant downstairs.');
    assert.equal(await page.textContent('#board-count'), '4');
    assert.match(await page.textContent('#board-list .board-item >> nth=0'), /the cat can talk/);
    await say(page, 'bring up memory');
    assert.match(await page.textContent('.msg-assistant >> nth=3'), /on your Idea Board/);
    assert.match(await page.textContent('.msg-assistant >> nth=3'), /the cat can talk/);
  });
});

test('"what NIE understands" follows the conversation, can be cleared, and each project has its own board and kind', async () => {
  await run({}, async ({ page }) => {
    await openBrainstorm(page);
    await say(page, 'A homeless man befriends a cat.');
    const u = await page.textContent('#understands');
    assert.match(u, /Premise\s*A homeless man befriends a cat\./);
    assert.match(u, /Cast\s*homeless man/);
    assert.match(u, /Themes[^]*loneliness/);
    await page.click('#kind-row [data-kind=poem]');
    await page.fill('#board-add', 'PROJECT-A-ONLY idea');
    await page.press('#board-add', 'Enter');
    const idA = await page.evaluate(() => window.NIE_APP.project.id);

    await page.click('#understands-reset');
    assert.match(await page.textContent('#understands'), /Nothing yet|Poem/);
    assert.ok(!/homeless/.test(await page.textContent('#understands')));

    // A new project starts clean: no board, no kind, no premise.
    await page.click('.nav-btn[data-view=projects]');
    await page.click('#new-project');
    await page.waitForSelector('#setup-dialog');
    await page.click('#setup-cancel');
    await openBrainstorm(page);
    assert.equal(await page.textContent('#board-count'), '0');
    assert.equal(await page.getAttribute('#kind-row [data-kind=auto]', 'aria-checked'), 'true');
    assert.match(await page.textContent('#understands'), /Working on\s*Not sure yet/);
    assert.ok(!(await page.evaluate((id) => localStorage.getItem(`nie.v1.project.${window.NIE_APP.project.id}`).includes('PROJECT-A-ONLY'), idA)));

    // Go back to the first project: its board and kind are exactly as they were left.
    await page.evaluate((id) => window.NIE_APP.openProject(id), idA);
    assert.equal(await page.textContent('#board-count'), '1');
    assert.equal(await page.getAttribute('#kind-row [data-kind=poem]', 'aria-checked'), 'true');

    // Deleting that project takes its board with it.
    await page.evaluate((id) => window.NIE_APP.deleteProject(id), idA);
    const dump = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage))));
    assert.ok(!dump.includes('PROJECT-A-ONLY'));
  });
});

test('with the offline model running, NIE asks it for ideas, shows them as cards, and gives it the Idea Board', async () => {
  await run({ init: BRIDGE }, async ({ page }) => {
    await bridgeReady(page);
    await page.evaluate(() => { window.__bridge.reply = 'A few angles to try.\n\n1. What the experts quietly avoid saying.\n2. A reader who already disagrees with you.\n3. The cost nobody counts.\n\nWhich one would you spend a week on?'; });
    await openBrainstorm(page);
    await page.fill('#board-add', 'KEPT-FOR-THE-MODEL idea');
    await page.press('#board-add', 'Enter');
    await page.click('#kind-row [data-kind=article]');
    await page.click('#lens-row [data-lens=angle]');
    await page.waitForSelector('.msg-assistant:not(.msg-pending) .idea');
    const texts = await page.$$eval('.msg-assistant .idea-text', (c) => c.map((x) => x.textContent));
    assert.deepEqual(texts, ['What the experts quietly avoid saying.', 'A reader who already disagrees with you.', 'The cost nobody counts.']);
    assert.match(await page.textContent('.msg-assistant .bubble-body'), /A few angles to try\./);
    assert.match(await page.textContent('.msg-assistant .bubble-body'), /Which one would you spend a week on\?/);
    assert.ok(!/built-in guidance/i.test(await page.textContent('.msg-assistant')), 'no built-in note when the model answered');
    const sent = await page.evaluate(() => JSON.stringify(window.__bridge.calls.at(-1)));
    assert.match(sent, /KEPT-FOR-THE-MODEL idea/);
    assert.match(sent, /for an article/);
  });
});

test('Brainstorm stays usable on a narrow window: one column, board below the chat, nothing overflowing', async () => {
  await run({ viewport: { width: 820, height: 900 } }, async ({ page }) => {
    await openBrainstorm(page);
    const chat = await page.locator('.brain-main').boundingBox();
    const board = await page.locator('#idea-board').boundingBox();
    assert.ok(board.y >= chat.y + chat.height - 2, 'board sits below the chat on a narrow window');
    const overflow = await page.evaluate(() => { const w = document.querySelector('.workspace'); return w.scrollWidth - w.clientWidth; });
    assert.ok(overflow <= 1, `no horizontal overflow (${overflow}px)`);
    assert.ok(await page.isVisible('#brainstorm-input'));
  });
});
