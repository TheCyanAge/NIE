// Measures how well NIE UNDERSTANDS what a writer asks, on the labelled messages in tests/fixtures/understanding-messages.json.
// It runs the production path (LlamaService with the app's own llama-server arguments -> the schema-constrained client -> understandMessage),
// so what it reports is what the app does, not what a mock does.
//
//   node scripts/understanding-probe.mjs --bin apps/desktop/bin --model apps/desktop/models/Qwen2.5-3B-Instruct-Q4_K_M.gguf
//        [--out understanding-report.json]   write every result as JSON
//        [--sample 100]                      a stratified sample (the same share of every task, evenly spaced) for a quicker check
//        [--e2e]                             also run a short real conversation through the whole orchestrator (slow: it generates answers)
//        [--slots 2]                         model-server slots (2 = the app's setting; 1 shows what one slot cost)
//        [--ab-slots]                        same machine, same conversation, 1 slot vs 2 slots (twice, alternating): what the second prompt cache is worth
//        [--long]                            long-text reading on the real model: questions about facts planted at known places in 8,000 to 148,000 word texts,
//                                            asked the old way (only the last 1,800 characters) and the new way (outline + the parts that matter)
//        [--rules-only]                      no model: just the rule-based baseline (works anywhere)
//
// Numbers are AS SHIPPED: the rules decide first what they decide on their own (exact commands, bare greetings, the requests they recognise as
// write/edit, none of which wait for the model), then the model's reading is applied with the same request check the app uses. "model alone" shows
// the raw label on the messages the model actually read. "accuracy" is exact label agreement. The two numbers that matter for NIE's promise are declineRecall (how many requests to write or
// edit were recognised, so NIE declines them) and falseDecline (how many ordinary requests were wrongly taken for one).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LlamaService } from '../apps/desktop/src/llama-service.js';
import { DEFAULT_MODEL } from '../apps/desktop/src/runtime.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { TASKS, UNDERSTAND_SYSTEM, applyReading, buildUnderstandMessages, taskOfIntent, understandMessage } from '../apps/web/src/engine/orchestrator/understand.js';
import { detectIntent } from '../apps/web/src/engine/intent/intent.js';
import { createProjectData } from '../apps/web/src/engine/project/store.js';
import { loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { composeMessages } from '../apps/web/src/engine/orchestrator/prompt.js';
import { makeLongText, wordCountOf } from '../tests/fixtures/long-text.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def = null) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const flag = (name) => args.includes(name);

const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/understanding-messages.json'), 'utf8'));
const sampleSize = Number(opt('--sample', 0));
const items = sampleSize
  ? fixture.tasks.flatMap((t) => {
      const group = fixture.items.filter((i) => i.task === t);
      const take = Math.min(group.length, Math.ceil(sampleSize / fixture.tasks.length));
      return Array.from({ length: take }, (_, k) => group[Math.floor((k * group.length) / take)]);
    })
  : fixture.items;
const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(1)}%` : 'n/a');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const quantile = (xs, q) => (xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(q * xs.length))] : 0);

const rulesTask = (it) => taskOfIntent(detectIntent(it.text, { hasHistory: Boolean(it.history?.length) }).type) ?? 'none';


// ── long-text reading on the real model ──────────────────────────────────────
if (flag('--long')) {
  await loadLibrary();
  const binDir = path.resolve(opt('--bin', path.join(root, 'apps/desktop/bin')));
  const modelPath = path.resolve(opt('--model', path.join(root, 'apps/desktop/models', DEFAULT_MODEL.fileName)));
  const service = new LlamaService({ binDir, modelPath, model: DEFAULT_MODEL, slots: 2, log: () => {} });
  const st = await service.start();
  if (st.state !== 'ready') { console.error(`The model did not start: ${st.detail}`); process.exit(1); }
  const norm = (t) => String(t).toLowerCase().replace(/[^\p{L}\p{N} ]+/gu, ' ').replace(/\s+/g, ' ').trim();
  const correct = (reply, n) => [n.answer, ...(n.alts ?? [])].some((a) => norm(reply).includes(norm(a)));
  const lengths = String(opt('--lengths', '8000,40000,148000')).split(',').map(Number);
  const perLength = Number(opt('--needles', 6));
  const report = [];
  for (const words of lengths) {
    const { text, needles } = makeLongText({ words });
    const project = createProjectData({ title: 'Long', storyText: text });
    const picks = needles.filter((_, k) => k % Math.max(1, Math.floor(needles.length / perLength)) === 0).slice(0, perLength);
    const row = { words: wordCountOf(text), asked: picks.length, oldHits: 0, newHits: 0, oldMs: 0, newMs: 0, newPromptTokens: 0, misses: [] };
    for (const n of picks) {
      const question = `In my story, ${n.question}`;
      const ask = async (args) => {
        const { messages, tokens } = composeMessages({ mode: 'brainstorm', project, userMessage: question, history: [], ...args });
        const t = Date.now();
        const reply = await service.chat(messages, { maxTokens: 120, temperature: 0.1, stream: false });
        return { reply, ms: Date.now() - t, tokens };
      };
      const before = await ask({ passage: text.slice(-1800) }); // what NIE did: only the last 1,800 characters
      const after = await ask({ document: { text, query: question, topic: '', subject: 'text' } }); // what NIE does now
      if (correct(before.reply, n)) row.oldHits++;
      if (correct(after.reply, n)) row.newHits++; else row.misses.push({ q: n.question, want: n.answer, got: after.reply.slice(0, 140).replace(/\s+/g, ' ') });
      row.oldMs += before.ms;
      row.newMs += after.ms;
      row.newPromptTokens = Math.max(row.newPromptTokens, after.tokens);
    }
    row.oldMs = Math.round(row.oldMs / picks.length);
    row.newMs = Math.round(row.newMs / picks.length);
    report.push(row);
    console.log(`${String(row.words).padStart(7)} words: the old way found ${row.oldHits}/${row.asked}, the new way ${row.newHits}/${row.asked}   (answer time ${row.oldMs} ms -> ${row.newMs} ms, largest prompt ${row.newPromptTokens} tokens)`);
    for (const m of row.misses) console.log(`          missed: ${m.q} -> wanted "${m.want}", got "${m.got}"`);
  }
  // a pasted passage through the whole orchestrator, as in the screenshot that started this
  const o = new Orchestrator({ engine: new AIEngine({ local: { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: (m, op) => service.chat(m, op) }, online: null, isOnline: () => false }) });
  const pasted = makeLongText({ words: 8000, seed: 5 });
  const proj = createProjectData({ title: 'Paste' });
  const t = Date.now();
  const r = await o.brainstorm({ project: proj, message: `Here is my opening. What do you think of the ending?\n\n${pasted.text}` });
  console.log(`\npasted ${wordCountOf(pasted.text)} words through the whole orchestrator: ${((Date.now() - t) / 1000).toFixed(1)} s, read by ${r.understood?.by} as ${r.understood?.task}, route ${r.route}`);
  console.log(`  ${r.reply.slice(0, 700).replace(/\s+/g, ' ')}`);
  if (opt('--out')) { fs.mkdirSync(path.dirname(path.resolve(opt('--out'))), { recursive: true }); fs.writeFileSync(opt('--out'), JSON.stringify({ report, pasted: { reply: r.reply, read: proj.conversation.messages.at(-1).read } }, null, 1)); }
  await service.stop();
  process.exit(0);
}

// ── same-machine A/B: what a second model-server slot is worth ───────────────
if (flag('--ab-slots')) {
  await loadLibrary();
  const binDir = path.resolve(opt('--bin', path.join(root, 'apps/desktop/bin')));
  const modelPath = path.resolve(opt('--model', path.join(root, 'apps/desktop/models', DEFAULT_MODEL.fileName)));
  const script = ["What's a villanelle?", 'My novel is about a lighthouse keeper who starts getting letters from the sea.', 'give me some twists', 'is my ending too predictable?', 'who could be writing the letters?', 'what would the second twist change about the ending?'];
  const runs = [];
  for (const slots of [1, 2, 1, 2]) {
    const service = new LlamaService({ binDir, modelPath, model: DEFAULT_MODEL, slots, log: () => {} });
    const st = await service.start();
    if (st.state !== 'ready') { console.error(`slots=${slots}: the model did not start: ${st.detail}`); process.exit(1); }
    const o = new Orchestrator({ engine: new AIEngine({ local: { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: (m, op) => service.chat(m, op) }, online: null, isOnline: () => false }) });
    const project = createProjectData({ title: 'AB' });
    const ms = [];
    for (const message of script) {
      const t = Date.now();
      await o.brainstorm({ project, message });
      ms.push(Date.now() - t);
    }
    await service.stop();
    runs.push({ slots, ms, total: ms.reduce((a, b) => a + b, 0) });
    console.log(`slots=${slots}: ${ms.map((x) => (x / 1000).toFixed(1)).join(' ')}  total ${(runs.at(-1).total / 1000).toFixed(1)} s`);
    await sleep(500);
  }
  const med = (n) => quantile(runs.filter((r) => r.slots === n).map((r) => r.total), 0.5);
  const turn = (n, i) => Math.round(runs.filter((r) => r.slots === n).reduce((a, r) => a + r.ms[i], 0) / runs.filter((r) => r.slots === n).length);
  console.log(`\nper turn, mean of two runs (ms):\n  turn   1 slot   2 slots`);
  script.forEach((m, i) => console.log(`  ${String(i + 1).padStart(4)}  ${String(turn(1, i)).padStart(7)}  ${String(turn(2, i)).padStart(8)}   ${m.slice(0, 50)}`));
  console.log(`\nconversation total (median): 1 slot ${(med(1) / 1000).toFixed(1)} s, 2 slots ${(med(2) / 1000).toFixed(1)} s => 2 slots is ${(100 * (1 - med(2) / med(1))).toFixed(0)}% faster`);
  if (opt('--out')) { fs.mkdirSync(path.dirname(path.resolve(opt('--out'))), { recursive: true }); fs.writeFileSync(opt('--out'), JSON.stringify({ runs }, null, 1)); }
  process.exit(0);
}

let svc = null;
let results = [];

if (flag('--rules-only')) {
  results = items.map((it) => ({ id: it.id, text: it.text, expected: it.task, hard: Boolean(it.hard), history: Boolean(it.history?.length), got: rulesTask(it), rules: rulesTask(it), ms: 0, ok: true }));
} else {
  const binDir = path.resolve(opt('--bin', path.join(root, 'apps/desktop/bin')));
  const modelPath = path.resolve(opt('--model', path.join(root, 'apps/desktop/models', DEFAULT_MODEL.fileName)));
  svc = new LlamaService({ binDir, modelPath, model: DEFAULT_MODEL, slots: Number(opt('--slots', 2)), log: (...a) => console.log('[llama]', ...a) });
  const t0 = Date.now();
  const st = await svc.start();
  if (st.state !== 'ready') {
    console.error(`The model did not start: ${st.detail}\n${svc.diagnostics.output.slice(-15).join('\n')}`);
    process.exit(1);
  }
  console.log(`Model ready after ${((Date.now() - t0) / 1000).toFixed(1)} s. System prompt: ${UNDERSTAND_SYSTEM.length} characters.`);
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: (m, o) => svc.chat(m, o) };
  const engine = new AIEngine({ local, online: null, isOnline: () => false });

  // Warm-up (the first call also loads the prompt cache), not counted.
  await understandMessage({ engine, text: 'hi there' });

  const DECIDED_BY_RULES = ['request-write', 'request-edit', 'greeting', 'remember', 'recall', 'develop-idea'];
  for (const it of items) {
    const intent = detectIntent(it.text, { hasHistory: Boolean(it.history?.length) });
    const base = { id: it.id, text: it.text, expected: it.task, hard: Boolean(it.hard), history: Boolean(it.history?.length), rules: rulesTask(it) };
    if (DECIDED_BY_RULES.includes(intent.type)) {
      results.push({ ...base, got: base.rules, model: null, ms: 0, ok: true, decidedBy: 'rules' });
      continue;
    }
    const t = Date.now();
    const r = await understandMessage({ engine, text: it.text, history: it.history ?? [] });
    const ms = Date.now() - t;
    let got = base.rules;
    let overruled;
    if (r.ok) {
      applyReading(intent, r, it.text);
      got = intent.reading.task;
      overruled = intent.reading.overruled;
    }
    results.push({ ...base, got: r.ok ? got : 'FAILED', model: r.ok ? r.task : 'FAILED', overruled, topic: r.ok ? r.topic : '', raw: r.ok ? undefined : r.raw, error: r.ok ? undefined : String(r.error?.message ?? ''), ms, ok: r.ok, decidedBy: 'model' });
    if (results.length % 20 === 0) console.log(`  ${results.length}/${items.length} read…`);
  }
}

// ── numbers ──────────────────────────────────────────────────────────────────
const acc = (rs, key = 'got') => rs.filter((r) => r[key] === r.expected).length;
const declines = new Set(['write', 'edit']);
const should = results.filter((r) => declines.has(r.expected));
const shouldNot = results.filter((r) => !declines.has(r.expected));
const summary = {
  n: results.length,
  model: !flag('--rules-only'),
  accuracy: acc(results) / results.length,
  rulesAccuracy: acc(results, 'rules') / results.length,
  hardAccuracy: acc(results.filter((r) => r.hard)) / (results.filter((r) => r.hard).length || 1),
  historyAccuracy: acc(results.filter((r) => r.history)) / (results.filter((r) => r.history).length || 1),
  declineRecall: should.filter((r) => declines.has(r.got)).length / (should.length || 1),
  rulesDeclineRecall: should.filter((r) => declines.has(r.rules)).length / (should.length || 1),
  falseDecline: shouldNot.filter((r) => declines.has(r.got)).length / (shouldNot.length || 1),
  rulesFalseDecline: shouldNot.filter((r) => declines.has(r.rules)).length / (shouldNot.length || 1),
  unusable: results.filter((r) => r.got === 'FAILED').length,
  latencyMs: (() => { const ms = results.filter((r) => r.decidedBy === 'model').map((r) => r.ms); return { mean: Math.round(ms.reduce((a, b) => a + b, 0) / (ms.length || 1)), p50: quantile(ms, 0.5), p90: quantile(ms, 0.9), max: ms.length ? Math.max(...ms) : 0 }; })(),
};

console.log(`\n=== understanding: ${summary.model ? 'the language model' : 'rules only'} on ${summary.n} labelled messages ===`);
console.log(`accuracy              ${pct(acc(results), results.length)}   (the old rules alone: ${pct(acc(results, 'rules'), results.length)})`);
console.log(`hard cases            ${pct(acc(results.filter((r) => r.hard)), results.filter((r) => r.hard).length)}`);
console.log(`with chat history     ${pct(acc(results.filter((r) => r.history)), results.filter((r) => r.history).length)}`);
console.log(`declineRecall         ${pct(should.filter((r) => declines.has(r.got)).length, should.length)}   (requests to write/edit recognised; the old rules: ${pct(should.filter((r) => declines.has(r.rules)).length, should.length)})`);
console.log(`falseDecline          ${pct(shouldNot.filter((r) => declines.has(r.got)).length, shouldNot.length)}   (ordinary requests wrongly taken for write/edit; the old rules: ${pct(shouldNot.filter((r) => declines.has(r.rules)).length, shouldNot.length)})`);
const readByModel = results.filter((r) => r.decidedBy === 'model');
if (readByModel.length) {
  const raw = readByModel.filter((r) => r.model !== 'FAILED');
  const rawDecline = raw.filter((r) => declines.has(r.model) && !declines.has(r.expected)).length;
  console.log(`model alone           read ${readByModel.length} (the rules decided the other ${results.length - readByModel.length}): ${pct(raw.filter((r) => r.model === r.expected).length, raw.length)} exact; wrongly taken for write/edit ${rawDecline}; of those the request check overruled ${raw.filter((r) => r.overruled && !declines.has(r.expected)).length}`);
}
console.log(`unusable readings     ${summary.unusable}`);
summary.modelRead = results.filter((r) => r.decidedBy === 'model').length;
console.log(`latency per reading   mean ${summary.latencyMs.mean} ms, p50 ${summary.latencyMs.p50}, p90 ${summary.latencyMs.p90}, max ${summary.latencyMs.max}`);

console.log('\nper task (recall = of the messages that ARE this task, how many were read as it):');
const labels = [...TASKS, 'none', 'FAILED'];
for (const t of TASKS) {
  const rows = results.filter((r) => r.expected === t);
  const predicted = results.filter((r) => r.got === t);
  const right = rows.filter((r) => r.got === t).length;
  const wrong = labels.filter((l) => l !== t).map((l) => [l, rows.filter((r) => r.got === l).length]).filter(([, n]) => n);
  console.log(`  ${t.padEnd(10)} recall ${pct(right, rows.length).padStart(6)}  precision ${pct(right, predicted.length).padStart(6)}   misread as: ${wrong.map(([l, n]) => `${l} ${n}`).join(', ') || '-'}`);
}
const bad = results.filter((r) => r.got !== r.expected);
console.log(`\n${bad.length} messages read differently from their label:`);
for (const r of bad) console.log(`  #${r.id} [${r.expected} -> ${r.got}]${r.hard ? ' (hard)' : ''} ${r.text.slice(0, 110).replace(/\s+/g, ' ')}`);

// ── a short real conversation through the whole orchestrator ─────────────────
const e2e = [];
if (svc && flag('--e2e')) {
  await loadLibrary();
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: (m, o) => svc.chat(m, o) };
  const o = new Orchestrator({ engine: new AIEngine({ local, online: null, isOnline: () => false }) });
  const project = createProjectData({ title: 'Probe' });
  console.log('\n=== end to end: reading + answering with the real model ===');
  for (const message of ["What's a villanelle?", 'My novel is about a lighthouse keeper who starts getting letters from the sea.', 'give me some twists', 'is my ending too predictable?', 'does this work without wifi?', 'what can you do?', 'I was wondering if you might be able to compose the first page of my memoir for me?', 'thanks!']) {
    const t = Date.now();
    const r = await o.brainstorm({ project, message });
    const row = { message, ms: Date.now() - t, understood: r.understood, route: r.route, type: r.intent.type, declined: r.declined, reply: r.reply.slice(0, 600) };
    e2e.push(row);
    console.log(`\n> ${message}\n  read by ${r.understood?.by} as ${r.understood?.task}${r.understood?.topic ? ` (${r.understood.topic})` : ''} -> ${r.intent.type}; answered by ${r.route} in ${(row.ms / 1000).toFixed(1)} s${r.declined ? ' (declined)' : ''}\n  ${r.reply.slice(0, 300).replace(/\s+/g, ' ')}`);
  }
}

if (opt('--out')) {
  fs.mkdirSync(path.dirname(path.resolve(opt('--out'))), { recursive: true });
  fs.writeFileSync(opt('--out'), JSON.stringify({ summary, results, e2e, prompt: buildUnderstandMessages({ text: '<message>' })[0].content }, null, 1));
  console.log(`\nWrote ${opt('--out')}`);
}
await svc?.stop();
await sleep(200);
process.exit(0);
