// Measures, on the REAL model (Qwen2.5-3B, the app's own llama-server arguments), what reading a long text section by section is worth and what it
// costs, and whether NIE stops sounding the same. Nothing here ships: it only reports numbers (job log + a JSON file) so prompts are tuned on evidence.
//
//   node scripts/notes-lab.mjs --bin apps/desktop/bin --model apps/desktop/models/Qwen2.5-3B-Instruct-Q4_K_M.gguf [experiments] [options]
//
// experiments (any combination; default --notes --variety):
//   --notes       the notes pass on the 10,000-word invented story bible (tests/fixtures/story-bible.*): seconds per section (prompt vs generation speed from the
//                 server's own timings), how many notes the model gave in the right form, whether the names/terms it noted are the bible's real ones, and the overview
//   --contexts    the bible's own questions (lookup, whole-text, timeline, style, contradiction, snippet) asked two ways: the old way (the closest passages and an
//                 outline of first words) and the new way (notes on every section + overview + style + the closest passages); how many answers mention what they should
//   --variety     one scripted 10-message conversation about the bible under three settings (the earlier prompt / the new prompt / the new prompt + a different shape
//                 each turn + what not to repeat + cleaning): praise openers, stock questions, questions asked twice, how alike the replies are
// options:
//   --per-kind N  bible questions per kind for --contexts (default 2)      --threads N  model-server threads (default: the app's)
//   --modes a,b   which variety settings to run for --variety (default legacy,prompt,full)
//   --out FILE    write every result as JSON
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LlamaService } from '../apps/desktop/src/llama-service.js';
import { DEFAULT_MODEL } from '../apps/desktop/src/runtime.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { createProjectData } from '../apps/web/src/engine/project/store.js';
import { loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { buildIndex } from '../apps/web/src/engine/reading/context.js';
import { NOTE_SCHEMA, buildNoteMessages, makeOverview, projectNotesCache, readThrough } from '../apps/web/src/engine/reading/notes.js';
import { describeStyle, styleProfile } from '../apps/web/src/engine/reading/style.js';
import { isPraiseOpener, isStockQuestion, questionsIn, similarity, splitSentencesLite } from '../apps/web/src/engine/orchestrator/variety.js';
import { loadBible } from '../tests/fixtures/story-bible.mjs';
import { estimateTokens } from '../apps/web/src/engine/util/text.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def = null) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const flag = (name) => args.includes(name);
const none = !['--notes', '--contexts', '--variety'].some(flag);
const want = { notes: flag('--notes') || none, contexts: flag('--contexts'), variety: flag('--variety') || none };

const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(0)}%` : 'n/a');
const sec = (ms) => `${(ms / 1000).toFixed(1)} s`;
const norm = (t) => String(t).toLowerCase().replace(/[^\p{L}\p{N} ]+/gu, ' ').replace(/\s+/g, ' ').trim();
const mentions = (reply, mustMention) => mustMention.every((alts) => alts.some((a) => norm(reply).includes(norm(a))));
const quantile = (xs, q) => (xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(q * xs.length))] : 0);
const oneLine = (t, n = 400) => String(t).replace(/\s+/g, ' ').trim().slice(0, n);

await loadLibrary();
const binDir = path.resolve(opt('--bin', path.join(root, 'apps/desktop/bin')));
const modelPath = path.resolve(opt('--model', path.join(root, 'apps/desktop/models', DEFAULT_MODEL.fileName)));
const threads = opt('--threads') ? Number(opt('--threads')) : undefined;
const service = new LlamaService({ binDir, modelPath, model: DEFAULT_MODEL, slots: 2, threads, log: () => {} });
const started = await service.start();
if (started.state !== 'ready') { console.error(`The model did not start: ${started.detail}`); process.exit(1); }
console.log(`model ready; threads ${service.threads}; cpus ${(await import('node:os')).default.availableParallelism?.()}`);
// Every call goes to the server directly (not streamed) so its own timings can be recorded: how many prompt tokens it really read, how many it served from
// its cache, and how long reading and writing took. The request is otherwise what the app sends.
const calls = [];
async function labChat(messages, opts = {}) {
  const port = service.status.port;
  const body = { model: 'local', messages, stream: false, max_tokens: opts.maxTokens ?? 700, temperature: opts.temperature ?? 0.7, cache_prompt: true };
  if (opts.json) body.response_format = { type: 'json_schema', json_schema: { name: 'reading', strict: true, schema: opts.json } };
  const t0 = Date.now();
  const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(opts.timeoutMs ?? 300000) });
  if (!res.ok) throw Object.assign(new Error(`The model returned ${res.status}`), { kind: 'http', status: res.status });
  const j = await res.json();
  const t = j.timings ?? {};
  calls.push({ purpose: opts.purpose ?? 'answer', ms: Date.now() - t0, promptN: t.prompt_n ?? 0, cacheN: t.cache_n ?? 0, promptMs: Math.round(t.prompt_ms ?? 0), genN: t.predicted_n ?? 0, genMs: Math.round(t.predicted_ms ?? 0), estimate: messages.reduce((a, m) => a + estimateTokens(m.content), 0), real: j.usage?.prompt_tokens ?? (t.prompt_n ?? 0) + (t.cache_n ?? 0) });
  const text = j.choices?.[0]?.message?.content ?? '';
  opts.onToken?.(text, text);
  return text;
}
const engine = new AIEngine({ local: { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: labChat }, online: null, isOnline: () => false });
function timingSummary(label, from = 0) {
  const rows = calls.slice(from).filter((c) => c.purpose === 'answer' || c.purpose === undefined);
  if (!rows.length) return;
  const med = (f) => quantile(rows.map(f), 0.5);
  const ratio = rows.reduce((a, c) => a + c.estimate, 0) / Math.max(1, rows.reduce((a, c) => a + c.real, 0));
  console.log(`  ${label}: ${rows.length} answers; prompt tokens read fresh (median) ${med((c) => c.promptN)}, served from the server's cache ${med((c) => c.cacheN)}, tokens written ${med((c) => c.genN)}; time ${sec(med((c) => c.ms))} (reading ${sec(med((c) => c.promptMs))}, writing ${sec(med((c) => c.genMs))}); NIE's token estimate / the real count = ${ratio.toFixed(2)}`);
}

const { text: bible, truth } = loadBible();
const index = buildIndex(bible);
const report = { threads: service.threads, bible: { words: truth.words, sections: index.sections.length } };
const project0 = createProjectData({ title: 'Lab', storyText: bible });
const cache0 = projectNotesCache(project0);

/** The server's own speed numbers for one request, so "slow" can be split into reading (prompt) and writing (generation). */
async function timed(messages, extra = {}) {
  const port = service.status.port;
  const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'local', messages, stream: false, temperature: 0, cache_prompt: true, ...extra }) });
  const j = await res.json();
  const t = j.timings ?? {};
  return { text: j.choices?.[0]?.message?.content ?? '', promptTokens: t.prompt_n, promptMs: Math.round(t.prompt_ms ?? 0), promptPerSec: Math.round(t.prompt_per_second ?? 0), genTokens: t.predicted_n, genMs: Math.round(t.predicted_ms ?? 0), genPerSec: Number((t.predicted_per_second ?? 0).toFixed(1)), cached: t.cache_n };
}

// ── 1. the notes pass ────────────────────────────────────────────────────────
let notesRun = null;
async function runNotes() {
  console.log(`\n=== the notes pass on the story bible (${truth.words} words, ${index.sections.length} sections) ===`);
  const progress = [];
  const t0 = Date.now();
  const r = await readThrough({ engine, index, cache: cache0, onProgress: (p) => progress.push(p), coldMs: 240000, warmMs: 150000 });
  const readMs = Date.now() - t0;
  const ov = await makeOverview({ engine, notes: r.notes, cache: cache0, words: truth.words, sections: index.sections.length });
  const ovMs = Date.now() - t0 - readMs;
  const perMs = progress.map((p) => p.ms).filter(Boolean);
  console.log(`read ${r.modelRead}/${r.total} sections with the model in ${sec(readMs)} (complete ${r.complete}, failed ${r.failed}, reasons ${JSON.stringify(r.reasons)})`);
  console.log(`per section: median ${sec(quantile(perMs, 0.5))}, p90 ${sec(quantile(perMs, 0.9))}, max ${sec(Math.max(0, ...perMs))}; overview ${sec(ovMs)} (${ov.by})`);

  // speed split on three sections
  const samples = [0, Math.floor(index.sections.length / 2), index.sections.length - 1];
  const speeds = [];
  for (const i of samples) {
    const s = index.sections[i];
    const m = buildNoteMessages(bible.slice(s.start, s.end), { i, total: index.sections.length, under: s.under });
    speeds.push({ section: i + 1, ...(await timed(m, { max_tokens: 140, response_format: { type: 'json_schema', json_schema: { name: 'note', strict: true, schema: NOTE_SCHEMA } } })) });
  }
  for (const x of speeds) console.log(`  section ${x.section}: prompt ${x.promptTokens} tokens at ${x.promptPerSec} tok/s (${sec(x.promptMs)}), wrote ${x.genTokens} tokens at ${x.genPerSec} tok/s (${sec(x.genMs)})`);

  // do the notes name the bible's real people and terms?
  const lower = (t) => String(t).toLowerCase();
  const sectionHas = (i, name) => (lower(bible.slice(index.sections[i].start, index.sections[i].end)).match(new RegExp(lower(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length;
  let expected = 0;
  let found = 0;
  const missing = [];
  for (const c of truth.cast) {
    for (let i = 0; i < index.sections.length; i++) {
      const names = [c.name, ...(c.aliases ?? [])];
      if (Math.max(...names.map((n) => sectionHas(i, n))) < 2) continue;
      expected++;
      const got = (r.notes[i]?.names ?? []).map(lower);
      if (names.some((n) => got.some((g) => g.includes(lower(n)) || lower(n).includes(g)))) found++; else missing.push(`${c.name}@${i + 1}`);
    }
  }
  let termsFound = 0;
  for (const t of truth.terms) {
    const n = r.notes[t.section - 1];
    const blob = lower(`${(n?.terms ?? []).join(' ')} ${n?.gist ?? ''} ${(n?.names ?? []).join(' ')}`);
    if (blob.includes(lower(t.term))) termsFound++;
  }
  console.log(`names: the notes named a person in ${found}/${expected} (${pct(found, expected)}) of the sections where they appear at least twice${missing.length ? `; missed e.g. ${missing.slice(0, 8).join(', ')}` : ''}`);
  console.log(`terms: the notes captured ${termsFound}/${truth.terms.length} (${pct(termsFound, truth.terms.length)}) of the bible's defined terms in the section that defines them`);
  const castInOverview = truth.cast.filter((c) => lower(ov.text).includes(lower(c.name))).length;
  console.log(`overview mentions ${castInOverview}/${truth.cast.length} of the cast\n  OVERVIEW: ${oneLine(ov.text, 900)}`);
  for (const i of [0, 6, 13, 20, index.sections.length - 1]) {
    const n = r.notes[i];
    console.log(`  note ${i + 1} (${n?.by}): ${oneLine(n?.gist, 200)} | names ${JSON.stringify(n?.names)} | terms ${JSON.stringify(n?.terms)} | voice ${oneLine(n?.voice, 60)}`);
  }
  const style = styleProfile(bible);
  console.log(`style line: ${style.promptLine}\n  ${describeStyle(style)}`);
  notesRun = { readMs, ovMs, modelRead: r.modelRead, total: r.total, reasons: r.reasons, perSectionMs: perMs, speeds, nameRecall: [found, expected], termRecall: [termsFound, truth.terms.length], overview: ov.text, sampleNotes: r.notes.slice(0, 6) };
  report.notes = notesRun;
}

async function ensureNotes() {
  if (Object.keys(project0.readingNotes?.sections ?? {}).length >= index.sections.length - 1) return;
  await runNotes();
}

// ── 2. old way vs new way, on the bible's own questions ──────────────────────
async function runContexts() {
  await ensureNotes();
  console.log('\n=== the bible\'s questions: the old way (closest passages + outline) vs the new way (notes on every section) ===');
  const ctxStart = calls.length;
  const perKind = Number(opt('--per-kind', 2));
  const kinds = [...new Set(truth.questions.map((q) => q.kind))];
  const picks = kinds.flatMap((k) => truth.questions.filter((q) => q.kind === k).slice(0, perKind));
  const rows = [];
  for (const q of picks) {
    const row = { id: q.id, kind: q.kind, ask: q.ask };
    for (const mode of ['old', 'new']) {
      const o = new Orchestrator({ engine, readNotes: mode === 'new', variety: 'full' });
      const proj = structuredClone(project0);
      if (mode === 'old') proj.readingNotes = { v: 1, sections: {}, overviews: {} };
      const t = Date.now();
      const r = await o.brainstorm({ project: proj, message: q.ask });
      row[mode] = { ms: Date.now() - t, ok: mentions(r.reply, q.mustMention), route: r.route, read: r.understood?.task, reply: oneLine(r.reply, 600) };
    }
    rows.push(row);
    console.log(`  [${q.kind}] ${q.ask.slice(0, 70)}\n     old ${row.old.ok ? 'ok ' : 'MISS'} ${sec(row.old.ms)} | new ${row.new.ok ? 'ok ' : 'MISS'} ${sec(row.new.ms)}\n     new reply: ${oneLine(row.new.reply, 330)}`);
  }
  const by = (mode) => rows.filter((r) => r[mode].ok).length;
  console.log(`\nanswers that mention what they should: old ${by('old')}/${rows.length}, new ${by('new')}/${rows.length}`);
  timingSummary('all answers in this experiment', ctxStart);
  for (const k of kinds) { const g = rows.filter((r) => r.kind === k); console.log(`  ${k.padEnd(13)} old ${g.filter((r) => r.old.ok).length}/${g.length}  new ${g.filter((r) => r.new.ok).length}/${g.length}`); }
  report.contexts = rows;
}

// ── 3. does NIE still sound the same? ───────────────────────────────────────
const firstSentence = (t) => splitSentencesLite(String(t))[0] ?? '';
async function runVariety() {
  await ensureNotes();
  console.log('\n=== one conversation about the bible, three ways ===');
  const q = (kind, n = 0) => truth.questions.filter((x) => x.kind === kind)[n];
  const script = [
    { say: bible },
    { say: q('lookup', 0).ask, q: q('lookup', 0) },
    { say: 'Give me some twists for the second half.' },
    { say: q('whole', 0).ask, q: q('whole', 0) },
    { say: q('snippet', 0).ask, q: q('snippet', 0) },
    { say: 'More ideas like that, please.' },
    { say: q('style', 0).ask, q: q('style', 0) },
    { say: q('contradiction', 0).ask, q: q('contradiction', 0) },
    { say: 'Thanks, that helps a lot.' },
    { say: q('timeline', 0).ask, q: q('timeline', 0) },
  ];
  const out = {};
  for (const mode of String(opt('--modes', 'legacy,prompt,full')).split(',')) {
    const from = calls.length;
    const o = new Orchestrator({ engine, readNotes: true, variety: mode });
    const proj = structuredClone(project0);
    proj.storyText = ''; // the first message is the paste itself, as in the writer's screenshot
    const turns = [];
    for (const step of script) {
      const t = Date.now();
      const r = await o.brainstorm({ project: proj, message: step.say });
      const meta = proj.conversation.messages.at(-1);
      turns.push({ ms: Date.now() - t, reply: r.reply, route: r.route, ok: step.q ? mentions(r.reply, step.q.mustMention) : null, shape: meta.shape, variety: meta.variety });
    }
    const replies = turns.map((t) => t.reply.replace(/\n\n\([^)]*(?:sections?|I left out)[^)]*\)\s*$/s, ''));
    const openers = replies.map(firstSentence);
    const qs = replies.flatMap((r, i) => questionsIn(r).map((text) => ({ i, text })));
    let repeated = 0;
    for (let a = 0; a < qs.length; a++) for (let b = a + 1; b < qs.length; b++) if (qs[a].i !== qs[b].i && similarity(qs[a].text, qs[b].text) >= 0.5) { repeated++; break; }
    let simSum = 0;
    let pairs = 0;
    for (let a = 0; a < openers.length; a++) for (let b = a + 1; b < openers.length; b++) { simSum += similarity(openers[a], openers[b]); pairs++; }
    const m = {
      praiseOpeners: openers.filter(isPraiseOpener).length,
      stockQuestions: replies.filter((r) => questionsIn(r).some(isStockQuestion)).length,
      repeatedQuestions: repeated,
      openerLikeness: Number((simSum / (pairs || 1)).toFixed(2)),
      numberedLists: replies.filter((r) => /^\s*1\.\s/m.test(r)).length,
      endWithQuestion: replies.filter((r) => /\?\s*$/.test(r.trim())).length,
      retries: turns.filter((t) => t.variety?.retried).length,
      meanSec: Number((turns.reduce((a, t) => a + t.ms, 0) / turns.length / 1000).toFixed(1)),
      answered: `${turns.filter((t) => t.ok === true).length}/${turns.filter((t) => t.ok !== null).length}`,
    };
    out[mode] = { metrics: m, turns };
    console.log(`\n--- ${mode}: ${JSON.stringify(m)}`);
    timingSummary(mode, from);
    turns.forEach((t, i) => console.log(`  ${String(i + 1).padStart(2)}. [${sec(t.ms)}${t.shape ? ` ${t.shape}` : ''}${t.variety?.retried ? ' RETRIED' : ''}${t.ok === false ? ' MISS' : ''}] ${oneLine(replies[i], 420)}`));
  }
  report.variety = out;
}

try {
  if (want.notes) await runNotes();
  if (want.contexts) await runContexts();
  if (want.variety) await runVariety();
} finally {
  report.calls = calls;
  if (opt('--out')) { fs.mkdirSync(path.dirname(path.resolve(opt('--out'))), { recursive: true }); fs.writeFileSync(opt('--out'), JSON.stringify(report, null, 1)); }
  await service.stop();
}
process.exit(0);
