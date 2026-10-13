// Measures, on the REAL model (Qwen2.5-3B, the app's own llama-server arguments), how the idea agent behaves over a whole conversation: does it ask now and then
// (not every turn), one question at a time, never the same one twice and always about THIS writer's idea; does its sheet hold what the writer said and nothing they
// did not; when does it offer to keep the idea; what does a turn cost. Nothing here ships: it reports numbers (job log + a JSON file) so the prompts are tuned on evidence.
//
//   node scripts/agent-lab.mjs --bin apps/desktop/bin --model apps/desktop/models/Qwen2.5-3B-Instruct-Q4_K_M.gguf [options]
// options:
//   --sessions a,b   which scripted writers to run (tests/fixtures/agent-sessions.mjs; default all)    --threads N  model-server threads (default: the app's)
//   --max-steps N    stop each session after N of its messages (default: all)                          --modes a,b  'agent' (default), 'nomind' (agent on, the project's mind off) and/or 'off' (the agent switched off), for comparison
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
import { isPraiseOpener, isStockQuestion, questionsIn, similarity, splitSentencesLite } from '../apps/web/src/engine/orchestrator/variety.js';
import { stemList } from '../apps/web/src/engine/agent/state.js';
import { SESSIONS } from '../tests/fixtures/agent-sessions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def = null) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const sec = (ms) => `${(ms / 1000).toFixed(1)} s`;
const oneLine = (t, n = 300) => String(t).replace(/\s+/g, ' ').trim().slice(0, n);
const norm = (t) => String(t).toLowerCase().replace(/[^\p{L}\p{N} ]+/gu, ' ').replace(/\s+/g, ' ').trim();
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : 'n/a');

await loadLibrary();
const binDir = path.resolve(opt('--bin', path.join(root, 'apps/desktop/bin')));
const modelPath = path.resolve(opt('--model', path.join(root, 'apps/desktop/models', DEFAULT_MODEL.fileName)));
const threads = opt('--threads') ? Number(opt('--threads')) : undefined;
const service = new LlamaService({ binDir, modelPath, model: DEFAULT_MODEL, slots: 2, threads, log: () => {} });
const started = await service.start();
if (started.state !== 'ready') { console.error(`The model did not start: ${started.detail}`); process.exit(1); }
console.log(`model ready; threads ${service.threads}`);

const calls = [];
async function labChat(messages, opts = {}) {
  const port = service.status.port;
  const body = { model: 'local', messages, stream: false, max_tokens: opts.maxTokens ?? 700, temperature: opts.temperature ?? 0.7, cache_prompt: true };
  if (opts.json) body.response_format = { type: 'json_schema', json_schema: { name: 'reading', strict: true, schema: opts.json } };
  const t0 = Date.now();
  const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(opts.timeoutMs ?? 300000) });
  if (!res.ok) throw Object.assign(new Error(`The model returned ${res.status}`), { kind: 'http', status: res.status });
  const j = await res.json();
  calls.push({ purpose: opts.purpose ?? 'answer', ms: Date.now() - t0, genN: j.timings?.predicted_n ?? 0 });
  const text = j.choices?.[0]?.message?.content ?? '';
  opts.onToken?.(text, text);
  return text;
}
const engine = new AIEngine({ local: { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: labChat }, online: null, isOnline: () => false });

const wanted = String(opt('--sessions', SESSIONS.map((s) => s.id).join(','))).split(',');
const maxSteps = Number(opt('--max-steps', 99));
const modes = String(opt('--modes', 'agent')).split(',');
const report = { threads: service.threads, sessions: {} };

function sheetText(p) {
  const a = p.conversation.agent;
  return [...Object.values(a.slots).map((r) => r.value), ...a.extra].join(' | ');
}

async function runSession(session, mode) {
  const o = new Orchestrator({ engine, variety: 'full', agent: mode === 'off' ? null : undefined, mind: mode !== 'nomind' });
  const project = createProjectData({ title: `Lab ${session.id}` });
  const turns = [];
  let lastOffer = false;
  const said = [];
  for (const step of session.steps.slice(0, maxSteps)) {
    if (step.if === 'offer' && !lastOffer) continue;
    const from = calls.length;
    const t0 = Date.now();
    const r = await o.brainstorm({ project, message: step.say });
    const ms = Date.now() - t0;
    lastOffer = r.agent?.handled === 'offer';
    const made = calls.slice(from);
    const qs = questionsIn(r.reply);
    // "related to this session": the question shares a content word with what the writer has said so far (this message included)
    const terms = new Set(stemList(said.concat(step.say).join(' ')));
    const related = qs.map((q) => stemList(q).some((s) => terms.has(s)));
    said.push(step.say);
    turns.push({ say: step.say, kind: step.kind, reply: r.reply, ms, handled: r.agent?.handled ?? null, act: r.agent?.act ?? null, questions: qs, related, extractMs: made.filter((c) => c.purpose === 'extract').reduce((a, c) => a + c.ms, 0), readMs: made.filter((c) => c.purpose === 'understand').reduce((a, c) => a + c.ms, 0), answerMs: made.filter((c) => (c.purpose ?? 'answer') === 'answer').reduce((a, c) => a + c.ms, 0), calls: made.length });
  }
  // What does NIE still hold? The probes are asked after everything else (many turns later), each answer is checked for what the writer said earlier.
  const probeResults = [];
  for (const probe of session.probes ?? []) {
    const t0 = Date.now();
    const r = await o.brainstorm({ project, message: probe.ask });
    const ok = probe.mustMention.every((alts) => alts.some((a) => norm(r.reply).includes(norm(a))));
    probeResults.push({ ask: probe.ask, ok, ms: Date.now() - t0, reply: r.reply, recalled: r.recalled?.length ?? 0 });
  }
  const sheet = sheetText(project);
  const recorded = session.facts.filter((f) => f.any.some((alt) => norm(sheet).includes(norm(alt))));
  // every recorded value must be the writer's own words: a content stem of the sheet that appears in no message the writer sent is something NIE made up
  const writerStems = new Set(stemList(session.steps.map((s) => s.say).join(' ')));
  const invented = [...new Set(stemList(sheet))].filter((s) => !writerStems.has(s));
  const replied = turns.filter((t) => !t.handled);
  const allQs = turns.flatMap((t, i) => t.questions.map((text) => ({ i, text })));
  let repeated = 0;
  for (let a = 0; a < allQs.length; a++) for (let b = a + 1; b < allQs.length; b++) if (allQs[a].i !== allQs[b].i && similarity(allQs[a].text, allQs[b].text) >= 0.6) { repeated++; break; }
  const telling = turns.filter((t) => t.kind === 'tell' || t.kind === 'add' || t.kind === 'shrug');
  const openers = turns.map((t) => splitSentencesLite(t.reply)[0] ?? '');
  let sim = 0;
  let pairs = 0;
  for (let a = 0; a < openers.length; a++) for (let b = a + 1; b < openers.length; b++) { sim += similarity(openers[a], openers[b]); pairs++; }
  const offerAt = turns.findIndex((t) => t.handled === 'offer') + 1;
  const m = {
    turns: turns.length,
    askedTurns: replied.filter((t) => t.questions.length > 0).length,
    askRate: Number((replied.filter((t) => t.questions.length > 0).length / Math.max(1, telling.length)).toFixed(2)),
    askedThreeInARow: turns.some((_, i) => i >= 2 && [0, 1, 2].every((k) => turns[i - k].questions.length > 0)),
    moreThanOneQuestion: replied.filter((t) => t.questions.length > 1).length,
    repeatedQuestions: repeated,
    questionsAboutThisIdea: `${allQs.length ? turns.flatMap((t) => t.related).filter(Boolean).length : 0}/${allQs.length}`,
    stockQuestions: allQs.filter((q) => isStockQuestion(q.text)).length,
    praiseOpeners: openers.filter(isPraiseOpener).length,
    openerLikeness: Number((sim / (pairs || 1)).toFixed(2)),
    recalled: `${recorded.length}/${session.facts.length}`,
    missed: session.facts.filter((f) => !recorded.includes(f)).map((f) => f.id),
    inventedWords: invented.length,
    offeredAtTurn: offerAt || null,
    kept: project.brainstorm.board.length,
    keptCharacters: project.memory.characters.length,
    kind: project.conversation.agent.kind,
    form: project.conversation.agent.form,
    genres: project.conversation.agent.genres,
    probes: probeResults.length ? `${probeResults.filter((p) => p.ok).length}/${probeResults.length}` : null,
    meanSec: Number((mean(replied.map((t) => t.ms)) / 1000).toFixed(1)),
    meanExtractSec: Number((mean(replied.map((t) => t.extractMs)) / 1000).toFixed(1)),
    meanReadSec: Number((mean(replied.map((t) => t.readMs)) / 1000).toFixed(1)),
    meanAnswerSec: Number((mean(replied.map((t) => t.answerMs)) / 1000).toFixed(1)),
  };
  console.log(`\n--- ${session.id} [${mode}]: ${JSON.stringify(m)}`);
  console.log(`    sheet: ${oneLine(sheet, 600)}`);
  probeResults.forEach((p, i) => console.log(`   probe ${i + 1}. [${sec(p.ms)}${p.ok ? '' : ' MISS'}${p.recalled ? ` recalled ${p.recalled}` : ''}] ${oneLine(p.ask, 90)}\n        NIE: ${oneLine(p.reply, 300)}`));
  turns.forEach((t, i) => console.log(`  ${String(i + 1).padStart(2)}. [${sec(t.ms)} ${t.handled ?? t.act ?? ''}${t.extractMs ? ` extract ${sec(t.extractMs)}` : ''}] YOU(${t.kind}): ${oneLine(t.say, 110)}\n       NIE: ${oneLine(t.reply, 420)}`));
  return { metrics: m, turns, sheet, probes: probeResults };
}

try {
  for (const mode of modes) {
    for (const session of SESSIONS.filter((s) => wanted.includes(s.id))) {
      (report.sessions[session.id] ??= {})[mode] = await runSession(session, mode);
    }
    const ms = Object.values(report.sessions).map((s) => s[mode]?.metrics).filter(Boolean);
    const sum = (k) => ms.reduce((a, m) => a + m[k], 0);
    console.log(`\n=== ${mode}: ${ms.length} sessions; ask rate ${mean(ms.map((m) => m.askRate)).toFixed(2)}; three asks in a row in ${ms.filter((m) => m.askedThreeInARow).length}; replies with 2+ questions ${sum('moreThanOneQuestion')}; repeated questions ${sum('repeatedQuestions')}; stock questions ${sum('stockQuestions')}; praise openers ${sum('praiseOpeners')}; mean turn ${mean(ms.map((m) => m.meanSec)).toFixed(1)} s (extract ${mean(ms.map((m) => m.meanExtractSec)).toFixed(1)}, read ${mean(ms.map((m) => m.meanReadSec)).toFixed(1)}, answer ${mean(ms.map((m) => m.meanAnswerSec)).toFixed(1)}); facts recalled ${ms.map((m) => m.recalled).join(', ')}`);
  }
} finally {
  report.calls = calls;
  if (opt('--out')) { fs.mkdirSync(path.dirname(path.resolve(opt('--out'))), { recursive: true }); fs.writeFileSync(opt('--out'), JSON.stringify(report, null, 1)); }
  await service.stop();
}
process.exit(0);
