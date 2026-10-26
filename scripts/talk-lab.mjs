// Measures, on the REAL model (Qwen2.5-3B, the app's own llama-server arguments), how Brainstorm TALKS over whole conversations: does a message get understood in the context of the chat
// (a standalone message, a reply to NIE's last reply, "yes", "the second one", a greeting after some work), is the answer something a thoughtful person would say, and does it help?
// Nothing here ships: it prints every reply with the writer's message before it (TALK-REPLY lines in the job log) so that someone other than the model being measured can judge each one
// (a rubric and a judge agent: see docs/STATUS.md), and it reports a few counts that need no judge.
//
//   node scripts/talk-lab.mjs --bin apps/desktop/bin --model apps/desktop/models/Qwen2.5-3B-Instruct-Q4_K_M.gguf [options]
// options:
//   --sessions a,b   which scripted conversations to run (tests/fixtures/talk-sessions.mjs; default: the first eleven; "heldout" = the held-out set; "all")     --threads N  model-server threads (default: the app's)
//   --out FILE       write every result as JSON

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LlamaService } from '../apps/desktop/src/llama-service.js';
import { DEFAULT_MODEL } from '../apps/desktop/src/runtime.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { createProjectData } from '../apps/web/src/engine/project/store.js';
import { loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { HELD_OUT_SESSIONS, TALK_SESSIONS } from '../tests/fixtures/talk-sessions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def = null) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const sec = (ms) => `${(ms / 1000).toFixed(1)} s`;
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const wordsOf = (t) => (String(t).match(/[\p{L}\p{N}'’-]+/gu) ?? []).length;

await loadLibrary();
const binDir = path.resolve(opt('--bin', path.join(root, 'apps/desktop/bin')));
const modelPath = path.resolve(opt('--model', path.join(root, 'apps/desktop/models', DEFAULT_MODEL.fileName)));
const threads = opt('--threads') ? Number(opt('--threads')) : undefined;
const service = new LlamaService({ binDir, modelPath, model: DEFAULT_MODEL, slots: 2, threads, log: () => {} });
const started = await service.start();
if (started.state !== 'ready') { console.error(`The model did not start: ${started.detail}`); process.exit(1); }
console.log(`model ready; threads ${service.threads}`);

const calls = [];
async function labChat(messages, o = {}) {
  const port = service.status.port;
  const body = { model: 'local', messages, stream: false, max_tokens: o.maxTokens ?? 700, temperature: o.temperature ?? 0.7, cache_prompt: true };
  if (o.json) body.response_format = { type: 'json_schema', json_schema: { name: 'reading', strict: true, schema: o.json } };
  const t0 = Date.now();
  const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(300000) });
  if (!res.ok) throw Object.assign(new Error(`The model returned ${res.status}`), { kind: 'http', status: res.status });
  const j = await res.json();
  calls.push({ purpose: o.purpose ?? 'answer', ms: Date.now() - t0, genN: j.timings?.predicted_n ?? 0 });
  const text = j.choices?.[0]?.message?.content ?? '';
  o.onToken?.(text, text);
  return text;
}
const engine = new AIEngine({ local: { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: labChat }, online: null, isOnline: () => false });

const ALL = [...TALK_SESSIONS, ...HELD_OUT_SESSIONS];
const asked = String(opt('--sessions', TALK_SESSIONS.map((s) => s.id).join(','))).split(',');
const wanted = asked.flatMap((id) => (id === 'heldout' ? HELD_OUT_SESSIONS.map((x) => x.id) : id === 'all' ? ALL.map((x) => x.id) : [id]));
const report = { threads: service.threads, sessions: {} };

async function runSession(session) {
  const o = new Orchestrator({ engine, variety: 'full' });
  const project = createProjectData({ title: `Talk ${session.id}` });
  const turns = [];
  for (const step of session.steps) {
    const from = calls.length;
    const t0 = Date.now();
    const r = await o.brainstorm({ project, message: step.say });
    const ms = Date.now() - t0;
    turns.push({
      say: step.say, note: step.note ?? '', reply: r.reply, ms, route: r.route, intent: r.intent.type,
      read: r.understood ? `${r.understood.by}:${r.understood.task ?? '-'}${r.understood.overruled ? `(was ${r.understood.overruled})` : ''}` : null,
      agent: r.agent ? `${r.agent.act ?? r.agent.handled ?? '-'}${r.agent.slot ? `:${r.agent.slot}` : ''}` : null,
      cards: r.ideas?.length ?? 0,
      words: wordsOf(r.reply), questions: (r.reply.match(/\?/g) ?? []).length, calls: calls.slice(from).length,
    });
  }
  const m = {
    turns: turns.length,
    meanSec: Number((mean(turns.map((t) => t.ms)) / 1000).toFixed(1)),
    meanWords: Math.round(mean(turns.map((t) => t.words))),
    withQuestion: turns.filter((t) => t.questions > 0).length,
    cards: turns.filter((t) => t.cards > 0).length,
    builtin: turns.filter((t) => t.route === 'builtin').length,
  };
  console.log(`\n--- ${session.id}: ${JSON.stringify(m)}`);
  turns.forEach((t, i) => console.log(`TALK-REPLY ${JSON.stringify({ session: session.id, turn: i + 1, say: t.say, note: t.note, reply: t.reply, route: t.route, intent: t.intent, read: t.read, agent: t.agent, cards: t.cards, sec: Number((t.ms / 1000).toFixed(1)) })}`));
  return { metrics: m, turns };
}

try {
  for (const session of ALL.filter((s) => wanted.includes(s.id))) report.sessions[session.id] = await runSession(session);
  const ms = Object.values(report.sessions).map((s) => s.metrics);
  const total = ms.reduce((a, m) => a + m.turns, 0);
  console.log(`\n=== ${ms.length} conversations, ${total} replies; mean turn ${mean(ms.map((m) => m.meanSec)).toFixed(1)} s; mean reply ${Math.round(mean(ms.map((m) => m.meanWords)))} words; replies with a question ${ms.reduce((a, m) => a + m.withQuestion, 0)}; replies as idea cards ${ms.reduce((a, m) => a + m.cards, 0)}; composed by code ${ms.reduce((a, m) => a + m.builtin, 0)}`);
} finally {
  report.calls = calls;
  if (opt('--out')) { fs.mkdirSync(path.dirname(path.resolve(opt('--out'))), { recursive: true }); fs.writeFileSync(opt('--out'), JSON.stringify(report, null, 1)); }
  await service.stop();
}
process.exit(0);
