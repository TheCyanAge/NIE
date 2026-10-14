import test from 'node:test';
import assert from 'node:assert/strict';
import { detectIntent } from '../apps/web/src/engine/intent/intent.js';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { loadLibrary, libraryStats } from '../apps/web/src/engine/knowledge/index.js';
import { knowledgeReply } from '../apps/web/src/engine/orchestrator/builtin.js';
import { modelWithReading, projectWith } from './helpers.js';

await loadLibrary();

// A writer's screenshot: after NIE listed what it can do, they asked "so what does your offline language model know?" and a small model, reading it as small talk, said
// "My offline language model doesn't have a built-in library of specific works, dates, or citations": wrong, and it contradicted NIE. What NIE says about its own knowledge is now fixed and counted.

const ABOUT_KNOWLEDGE = [
  'so what does your offline language model know?',
  'What does your model know?',
  'what does the library contain?',
  'What do you know?',
  'what do you really know about writing?',
  'And what do you know about all genres?',
  'Do you know about every genre?',
  'do you know everything about literature',
  'what genres do you cover?',
  "how big is your library?",
  "what's in your database?",
  'What are you trained on?',
  'how much does your model know?',
];
const NOT_ABOUT_NIE = [
  'What do you know about villanelles?',
  'what does the library say about sonnets?',
  'What do you know about Gothic fiction in the 1790s?',
  'what can you do about my sagging middle?',
  'Do you know who wrote Rebecca?',
  'what does my model of the world know about grief?',
];

test('questions about what NIE (its model, its library) knows are recognised as questions about NIE, and questions about a topic are not', () => {
  for (const q of ABOUT_KNOWLEDGE) assert.equal(detectIntent(q).type, 'about-nie', q);
  for (const q of NOT_ABOUT_NIE) assert.notEqual(detectIntent(q).type, 'about-nie', q);
});

test('the answer is built from the real library counts, separates the small model from the library, and never says the library is missing', () => {
  const r = knowledgeReply({ route: 'local', local: { state: 'ready' } });
  const st = libraryStats();
  assert.match(r, /two different things/i);
  assert.match(r, /small/i);
  assert.match(r, /no internet/i);
  assert.match(r, /built-in library/i);
  assert.doesNotMatch(r, /doesn'?t have a built-in library|no library/i);
  // the counts are real (rounded down, never above what is there)
  const m = r.match(/about ([\d,]+) written entries/);
  assert.ok(m, 'says how many entries');
  const said = Number(m[1].replace(/,/g, ''));
  assert.ok(said <= st.total - st.derived && said >= (st.total - st.derived) * 0.9, `${said} of ${st.total - st.derived}`);
  const round = (n) => (n >= 1000 ? (Math.floor(n / 100) * 100).toLocaleString('en-US') : n >= 100 ? String(Math.floor(n / 10) * 10) : String(n));
  assert.ok(r.includes(`${round(st.byKind.genre)} genres and subgenres`), 'genres counted from the library');
  assert.ok(r.includes(`${round(st.byKind.work)} notable works`), 'works counted from the library');
  assert.match(r, /cannot be complete|can't be complete/i, 'says it is not complete');
  assert.match(r, /not|rather than entry by entry/i);
  assert.match(r, /offline language model is running/, 'and the real state');
});

test('even when a model reads the question as small talk, NIE answers from the fixed facts, not from the model', async () => {
  const calls = [];
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: modelWithReading(() => "My offline language model doesn't have a built-in library of specific works.", { calls, reading: () => ({ task: 'chat', topic: '' }) }) };
  const o = new Orchestrator({ engine: new AIEngine({ local, online: null, isOnline: () => false }) });
  const project = projectWith();
  const r = await o.brainstorm({ project, message: 'so what does your offline language model know?' });
  assert.equal(r.route, 'builtin');
  assert.equal(calls.length, 0, 'the answering model was not asked');
  assert.equal(r.understood.by, 'model');
  assert.equal(r.understood.task, 'about-nie');
  assert.equal(r.understood.overruled, 'chat');
  assert.doesNotMatch(r.reply, /doesn'?t have a built-in library/);
  assert.match(r.reply, /built-in library/);
});
