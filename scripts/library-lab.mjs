// Measures, on the REAL model (Qwen2.5-3B, the app's own llama-server arguments), a conversation ABOUT the library: do the follow-ups ("what about its tropes?", "tell me more",
// "how is it different from horror?", "why did it start in Britain?") get read as follow-ups, does the reply say what the library's record says, and does it name anything the
// library's records do not (the grounding check removes sentences that name a person, title or number found in none of the records the reply could draw on).
// Nothing here ships: it reports numbers (job log + a JSON file) so the prompts and the routing are tuned on evidence.
//
//   node scripts/library-lab.mjs --bin apps/desktop/bin --model apps/desktop/models/Qwen2.5-3B-Instruct-Q4_K_M.gguf [options]
// options:
//   --sessions a,b   which scripted conversations to run (tests/fixtures/library-sessions.mjs; default all)     --threads N  model-server threads (default: the app's)
//   --out FILE       write every result as JSON

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LlamaService } from '../apps/desktop/src/llama-service.js';
import { DEFAULT_MODEL } from '../apps/desktop/src/runtime.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { createProjectData } from '../apps/web/src/engine/project/store.js';
import { getEntry, loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { profilesOf } from '../apps/web/src/engine/knowledge/thread.js';
import { groundNames } from '../apps/web/src/engine/editor/index.js';
import { LIBRARY_SESSIONS } from '../tests/fixtures/library-sessions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def = null) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const sec = (ms) => `${(ms / 1000).toFixed(1)} s`;
const oneLine = (t, n = 320) => String(t).replace(/\s+/g, ' ').trim().slice(0, n);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

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

const wanted = String(opt('--sessions', LIBRARY_SESSIONS.map((s) => s.id).join(','))).split(',');
const report = { threads: service.threads, sessions: {} };

/** Everything the library holds about the subject in focus: the records a reply about it may draw its names and numbers from. */
function recordsText(project) {
  const subject = project.conversation.library?.subject;
  const base = subject ? getEntry(subject.id) : null;
  if (!base) return '';
  const all = [base, ...profilesOf(base.id).values()];
  return all.flatMap((e) => [e.name, e.summary, ...(e.conventions ?? []), ...(e.watchFor ?? []), ...(e.deliberateWhen ?? []), ...(e.works ?? []).map((w) => `${w.title} ${w.author} ${w.year ?? ''}`), ...(e.refs ?? [])]).join('\n');
}

async function runSession(session) {
  const o = new Orchestrator({ engine, variety: 'full' });
  const project = createProjectData({ title: `Lab ${session.id}` });
  const turns = [];
  for (const step of session.steps) {
    const from = calls.length;
    const t0 = Date.now();
    const r = await o.brainstorm({ project, message: step.say });
    const ms = Date.now() - t0;
    const follow = r.library?.follow ?? null;
    const wantedFollow = [].concat(step.follow);
    const records = recordsText(project);
    const grounded = records ? groundNames(r.reply, { sources: [records, step.say], known: ['NIE', project.conversation.library.subject?.name ?? ''], sections: 0 }) : null;
    const mentions = (step.mustMention ?? []).map((alts) => alts.some((a) => r.reply.toLowerCase().includes(a.toLowerCase())));
    turns.push({
      say: step.say, reply: r.reply, ms, route: r.route, intent: r.intent.type,
      read: r.understood ? `${r.understood.by}:${r.understood.task ?? '-'}${r.understood.overruled ? `(was ${r.understood.overruled})` : ''}` : null,
      follow, followOk: wantedFollow.includes(follow),
      notLibrary: step.notLibrary ? !(r.intent.type === 'library-question') : null,
      mentionsOk: step.mustMention ? mentions.every(Boolean) : null,
      ungrounded: grounded ? grounded.removed.map((x) => ({ names: x.names, numbers: x.numbers })) : null,
      calls: calls.slice(from).length,
    });
  }
  const checked = turns.filter((t) => t.mentionsOk !== null);
  const m = {
    turns: turns.length,
    followRead: `${turns.filter((t) => t.followOk).length}/${turns.length}`,
    mentions: checked.length ? `${checked.filter((t) => t.mentionsOk).length}/${checked.length}` : null,
    notHijacked: (() => { const n = turns.filter((t) => t.notLibrary !== null); return n.length ? `${n.filter((t) => t.notLibrary).length}/${n.length}` : null; })(),
    repliesWithUngroundedNames: turns.filter((t) => t.ungrounded?.length).length,
    ungroundedSentences: turns.reduce((a, t) => a + (t.ungrounded?.length ?? 0), 0),
    meanSec: Number((mean(turns.map((t) => t.ms)) / 1000).toFixed(1)),
  };
  console.log(`\n--- ${session.id}: ${JSON.stringify(m)}`);
  turns.forEach((t, i) => console.log(`  ${String(i + 1).padStart(2)}. [${sec(t.ms)} ${t.route} ${t.intent} read ${t.read ?? '-'} follow ${t.follow ?? '-'}${t.followOk ? '' : ' MISREAD'}${t.mentionsOk === false ? ' NOT-MENTIONED' : ''}${t.notLibrary === false ? ' HIJACKED' : ''}${t.ungrounded?.length ? ` UNGROUNDED ${JSON.stringify(t.ungrounded.map((x) => [...x.names, ...x.numbers]))}` : ''}] YOU: ${oneLine(t.say, 110)}\n       NIE: ${oneLine(t.reply, 520)}`));
  return { metrics: m, turns };
}

try {
  for (const session of LIBRARY_SESSIONS.filter((s) => wanted.includes(s.id))) report.sessions[session.id] = await runSession(session);
  const ms = Object.values(report.sessions).map((s) => s.metrics);
  console.log(`\n=== ${ms.length} conversations; follow-ups read as intended ${ms.map((m) => m.followRead).join(', ')}; record words mentioned ${ms.map((m) => m.mentions ?? '-').join(', ')}; story talk kept ${ms.map((m) => m.notHijacked ?? '-').join(', ')}; replies naming something no record has: ${ms.reduce((a, m) => a + m.repliesWithUngroundedNames, 0)}; mean turn ${mean(ms.map((m) => m.meanSec)).toFixed(1)} s`);
} finally {
  report.calls = calls;
  if (opt('--out')) { fs.mkdirSync(path.dirname(path.resolve(opt('--out'))), { recursive: true }); fs.writeFileSync(opt('--out'), JSON.stringify(report, null, 1)); }
  await service.stop();
}
process.exit(0);
