import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { loadLibrary, answerFromLibrary, searchScored, libraryStats } from '../apps/web/src/engine/knowledge/index.js';
import { projectWith } from './helpers.js';

await loadLibrary();

const builtinOnly = () => new Orchestrator({ engine: new AIEngine({ local: null, online: null, isOnline: () => false }) });
const stubLocal = (replyFn, calls = []) => ({ status: () => ({ state: 'ready' }), onStatus: () => () => {}, async chat(messages, opts) { calls.push({ messages, opts }); return replyFn(messages); } });
const withModel = (replyFn, calls) => new Orchestrator({ engine: new AIEngine({ local: stubLocal(replyFn, calls), online: null, isOnline: () => false }) });
const ask = (o, project, message) => o.brainstorm({ project, message });

test('offline: a general craft question is answered from the library, says where it came from, and is not a premise', async () => {
  const project = projectWith();
  const r = await ask(builtinOnly(), project, 'What is free indirect discourse?');
  assert.equal(r.intent.type, 'library-question');
  assert.equal(r.route, 'builtin');
  assert.match(r.reply, /^From NIE's built-in library:/);
  assert.match(r.reply, /Free indirect discourse/);
  assert.match(r.reply, /works with no internet/);
  assert.equal(project.conversation.workingPremise.summary, '', 'a question about craft does not become the story\'s premise');
  assert.ok(r.suggestions.length >= 2);
});

test('offline: a question the library cannot answer says so plainly instead of guessing', async () => {
  const r = await ask(builtinOnly(), projectWith(), 'What is the capital of France?');
  assert.equal(r.intent.type, 'library-question');
  assert.match(r.reply, /isn't in my built-in library, and I won't guess/);
  assert.match(r.reply, /add it as a rule in Full Scan/);
});

test('talking about the writer\'s own story is never hijacked by the library', async () => {
  for (const m of ['What does the detective want?', 'Who is the killer in my story?', 'Why would she leave him?']) {
    const r = await ask(builtinOnly(), projectWith(), m);
    assert.notEqual(r.intent.type, 'library-question', m);
    assert.ok(!/From NIE's built-in library/.test(r.reply), m);
  }
});

test('with a model: library notes (with their source) go to the model, with an instruction never to invent citations', async () => {
  const calls = [];
  const o = withModel(() => 'Free indirect discourse blends narrator and character voice.', calls);
  const r = await ask(o, projectWith(), 'What is free indirect discourse?');
  assert.equal(r.route, 'local');
  const user = calls[0].messages.at(-1).content;
  assert.match(user, /Reference notes/);
  assert.match(user, /Free indirect discourse/);
  assert.match(user, /built-in library/);
  assert.match(user, /Never invent citations/);
});

test('with a model: when the library has nothing, the model is told so and told not to invent', async () => {
  const calls = [];
  const o = withModel(() => 'I am not sure.', calls);
  await ask(o, projectWith(), 'What is the capital of France?');
  assert.match(calls[0].messages.at(-1).content, /has nothing on this question/);
  assert.match(calls[0].messages.at(-1).content, /never invent citations/i);
});

test('the library tells strong from weak from nothing, and a weak match must name the topic', () => {
  assert.equal(answerFromLibrary('What is free indirect discourse?').strength, 'strong');
  assert.equal(answerFromLibrary('xqzvk wjplm').strength, 'none');
  assert.ok(searchScored('free indirect discourse', { limit: 1 })[0].score > 10);
});

test('coverage can be reported honestly', () => {
  const s = libraryStats();
  assert.ok(s.total >= 150);
  assert.equal(s.loaded, true);
  assert.ok(s.byKind.genre > 0);
});
