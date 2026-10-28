// Measures, on the REAL model (Qwen2.5-3B, the app's own llama-server arguments) and a REAL encyclopedia pack, how NIE answers a lookup entirely on the writer's computer: which questions
// are quoted from an article with no model, which are summarised by the model from the numbered articles, which are held back or sent nowhere (story talk, requests to write), and
// what each reply says next to the articles it was shown, so a reader that is not the model being measured can check every claim.
// Nothing here ships: it reports (job log + a JSON file) so the prompt and the checks are tuned on evidence.
//
//   node scripts/encyclopedia-lab.mjs --pack dist/encyclopedia/simple-en.niepack --bin apps/desktop/bin --model apps/desktop/models/Qwen2.5-3B-Instruct-Q4_K_M.gguf [options]
// options:  --only a,b  question ids      --threads N  model-server threads      --out FILE  every result as JSON      --dry  no model at all (a canned answer): checks the harness only

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LlamaService } from '../apps/desktop/src/llama-service.js';
import { DEFAULT_MODEL } from '../apps/desktop/src/runtime.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { createProjectData } from '../apps/web/src/engine/project/store.js';
import { loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { createWebService } from '../apps/web/src/engine/web/service.js';
import { buildSources } from '../apps/web/src/engine/web/answer.js';
import { Pack } from '../apps/web/src/engine/encyclopedia/pack.js';
import { LAB_QUESTIONS } from '../tests/fixtures/encyclopedia-lab-questions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def = null) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const sec = (ms) => `${(ms / 1000).toFixed(1)} s`;
const oneLine = (t, n = 240) => String(t).replace(/\s+/g, ' ').trim().slice(0, n);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

await loadLibrary();
const pack = await Pack.open(path.resolve(opt('--pack')));
const web = createWebService({ fetch: async () => { throw new Error('the lab must not touch the network'); }, getConfig: () => ({}), getPack: () => pack });

const dry = args.includes('--dry');
const binDir = path.resolve(opt('--bin', path.join(root, 'apps/desktop/bin')));
const modelPath = path.resolve(opt('--model', path.join(root, 'apps/desktop/models', DEFAULT_MODEL.fileName)));
const threads = opt('--threads') ? Number(opt('--threads')) : undefined;
const service = dry ? { threads: 0, status: { port: 0 }, stop: async () => {} } : new LlamaService({ binDir, modelPath, model: DEFAULT_MODEL, slots: 2, threads, log: () => {} });
if (!dry) {
  const started = await service.start();
  if (started.state !== 'ready') { console.error(`The model did not start: ${started.detail}`); process.exit(1); }
}
console.log(`${dry ? 'DRY RUN (no model); ' : 'model ready; '}threads ${service.threads}; pack ${pack.info.name} ${pack.info.docs} articles`);

const calls = [];
async function labChat(messages, o = {}) {
  if (dry) {
    calls.push({ purpose: o.purpose ?? 'answer', ms: 0, genN: 0, promptN: 0 });
    return o.json ? '{"task":"craft","topic":""}' : 'The sources say something about it [1].';
  }
  const port = service.status.port;
  const body = { model: 'local', messages, stream: false, max_tokens: o.maxTokens ?? 700, temperature: o.temperature ?? 0.7, cache_prompt: true };
  if (o.json) body.response_format = { type: 'json_schema', json_schema: { name: 'reading', strict: true, schema: o.json } };
  const t0 = Date.now();
  const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(300000) });
  if (!res.ok) throw Object.assign(new Error(`The model returned ${res.status}`), { kind: 'http', status: res.status });
  const j = await res.json();
  calls.push({ purpose: o.purpose ?? 'answer', ms: Date.now() - t0, genN: j.timings?.predicted_n ?? 0, promptN: j.timings?.prompt_n ?? 0 });
  const text = j.choices?.[0]?.message?.content ?? '';
  o.onToken?.(text, text);
  return text;
}
const engine = new AIEngine({ local: { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: labChat }, online: null, isOnline: () => false });

const only = opt('--only') ? new Set(String(opt('--only')).split(',')) : null;
const questions = LAB_QUESTIONS.filter((q) => !only || only.has(q.id) || only.has(q.after));
const projects = new Map(); // a follow-up shares the conversation of the question it follows
const orchestrator = new Orchestrator({ engine, web, variety: 'full' });
const results = [];

/** The articles the model was shown for a question: the same calls the orchestrator makes (search, read the top three, number them). */
async function sourcesFor(query) {
  const found = await web.search(query, { limit: 6 });
  const pages = new Map();
  for (const r of found.results.slice(0, 3)) {
    const page = await web.read(r.url, { maxChars: 2600 });
    if (page?.text) pages.set(r.url, page);
  }
  return buildSources(found.results, pages).map((s) => ({ n: s.n, title: s.title, text: s.text }));
}

try {
  for (const q of questions) {
    const project = (q.after && projects.get(q.after)) || createProjectData({ title: `Lab ${q.id}` });
    projects.set(q.id, project);
    const from = calls.length;
    const t0 = Date.now();
    let r;
    try {
      r = await orchestrator.brainstorm({ project, message: q.say, web: true });
    } catch (err) {
      console.log(`ERROR ${q.id}: ${err?.message ?? err}`);
      continue;
    }
    const ms = Date.now() - t0;
    const w = r.web ?? null;
    const sources = w?.query ? await sourcesFor(w.query).catch(() => []) : [];
    const row = {
      id: q.id, kind: q.kind, say: q.say, ms, route: r.route, declined: Boolean(r.declined), web: w ? { state: w.state, answeredBy: w.answeredBy, query: w.query, provider: w.provider, note: w.note } : null,
      modelCalls: calls.slice(from).map((c) => c.purpose), genTokens: calls.slice(from).reduce((a, c) => a + c.genN, 0), sources, reply: r.reply,
      cited: /\[\d+\]/.test(r.reply), left: /I left out part of that reply/.test(r.reply),
    };
    results.push(row);
    console.log(`AUDIT ${JSON.stringify({ id: row.id, kind: row.kind, say: row.say, query: w?.query ?? null, state: w?.state ?? null, answeredBy: w?.answeredBy ?? null, route: row.route, declined: row.declined, ms, sources, reply: row.reply })}`);
    console.log(`  ${q.id.padEnd(15)} [${sec(ms)} ${row.route} ${w ? `${w.state}/${w.answeredBy}` : 'no lookup'}${row.cited ? ' cited' : ''}${row.left ? ' SENTENCE-LEFT-OUT' : ''}] ${oneLine(r.reply, 200)}`);
  }
  const byKind = {};
  for (const r of results) (byKind[r.kind] ??= []).push(r);
  console.log('\n=== by kind');
  for (const [kind, rows] of Object.entries(byKind)) {
    const looked = rows.filter((r) => r.web);
    console.log(`${kind.padEnd(11)} ${String(rows.length).padStart(2)} asked; looked up ${looked.length}; quoted ${looked.filter((r) => r.web.answeredBy === 'encyclopedia').length}; model ${looked.filter((r) => /model/.test(r.web.answeredBy)).length}; results-only ${looked.filter((r) => r.web.state === 'results-only').length}; none-found ${looked.filter((r) => r.web.state === 'none-found').length}; cited ${rows.filter((r) => r.cited).length}; sentence left out ${rows.filter((r) => r.left).length}; declined ${rows.filter((r) => r.declined).length}; mean ${mean(rows.map((r) => r.ms / 1000)).toFixed(1)} s`);
  }
  const gen = calls.filter((c) => c.purpose === 'answer' || c.purpose === undefined);
  console.log(`\nmodel calls ${calls.length}; answer calls ${gen.length}; mean generated tokens per answer ${mean(gen.map((c) => c.genN)).toFixed(0)}; mean prompt tokens per answer ${mean(gen.map((c) => c.promptN)).toFixed(0)}`);
} finally {
  if (opt('--out')) { fs.mkdirSync(path.dirname(path.resolve(opt('--out'))), { recursive: true }); fs.writeFileSync(opt('--out'), JSON.stringify({ threads: service.threads, pack: pack.info, results, calls }, null, 1)); }
  await service.stop();
  await pack.close();
}
process.exit(0);
