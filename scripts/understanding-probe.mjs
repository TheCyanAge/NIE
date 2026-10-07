// Measures how well NIE UNDERSTANDS what a writer asks, on the labelled messages in tests/fixtures/understanding-messages.json.
// It runs the production path (LlamaService with the app's own llama-server arguments -> the schema-constrained client -> understandMessage),
// so what it reports is what the app does, not what a mock does.
//
//   node scripts/understanding-probe.mjs --bin apps/desktop/bin --model apps/desktop/models/Qwen2.5-3B-Instruct-Q4_K_M.gguf
//        [--out understanding-report.json]   write every result as JSON
//        [--sample 100]                      a stratified sample (the same share of every task, evenly spaced) for a quicker check
//        [--e2e]                             also run a short real conversation through the whole orchestrator (slow: it generates answers)
//        [--slots 2]                         model-server slots (2 = the app's setting; 1 shows what one slot cost)
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
