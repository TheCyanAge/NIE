import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { loadLibrary, answerFromLibrary, searchScored, libraryStats } from '../apps/web/src/engine/knowledge/index.js';
import { libraryMissReply } from '../apps/web/src/engine/orchestrator/builtin.js';
import { modelWithReading, projectWith } from './helpers.js';

await loadLibrary();

const builtinOnly = () => new Orchestrator({ engine: new AIEngine({ local: null, online: null, isOnline: () => false }) });
const stubLocal = (replyFn, calls = []) => ({ status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: modelWithReading(replyFn, { calls }) });
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

test('with a model: a strong match is answered with the library\'s own text and says where it came from; the model is asked to read the message and not to retell the notes', async () => {
  const calls = [];
  const o = withModel(() => 'MODEL TEXT that must not be shown.', calls);
  const r = await ask(o, projectWith(), 'What is free indirect discourse?');
  assert.equal(r.route, 'builtin', 'composed by code from the record');
  assert.equal(r.intent.type, 'library-question');
  assert.match(r.reply, /^From NIE's built-in library:/);
  assert.match(r.reply, /Free indirect discourse/);
  assert.match(r.reply, /works with no internet/);
  assert.ok(!/MODEL TEXT/.test(r.reply));
  assert.equal(calls.length, 0, 'no model was asked to write an answer (measured on the real model, a retelling of the notes was wrong or credited the writer with things they never said in 13 of 33 replies)');
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

// ── Retrieval quality over a library of thousands of entries (fixture: tests/fixtures/library-questions.json) ──
import { readFileSync } from 'node:fs';
const QUESTIONS = JSON.parse(readFileSync(new URL('./fixtures/library-questions.json', import.meta.url), 'utf8'));
const plain = (s) => s.normalize('NFD').replace(/\p{M}/gu, '');

test('questions the library should answer are answered by an entry that is about them (at least 90%)', () => {
  const misses = [];
  for (const [q, re] of QUESTIONS.found) {
    const a = answerFromLibrary(q, { limit: 3 });
    const ok = a.strength !== 'none' && a.entries.some((e) => new RegExp(re, 'i').test(plain(e.name)));
    if (!ok) misses.push(`${q} -> ${a.strength}: ${a.entries.map((e) => e.name).join(' | ')}`);
  }
  assert.ok(misses.length <= QUESTIONS.found.length * 0.1, `${misses.length} of ${QUESTIONS.found.length} missed:\n${misses.join('\n')}`);
});

test('questions outside the library are never answered with a confident, unrelated entry', () => {
  for (const q of QUESTIONS.absent) {
    const a = answerFromLibrary(q);
    assert.equal(a.strength, 'none', `${q} -> ${a.entries.map((e) => e.name).join(' | ')}`);
  }
});

test('"who wrote X" is answered by that work, or the library says it does not hold it', () => {
  const known = answerFromLibrary('who wrote Pride and Prejudice');
  assert.equal(known.strength, 'strong');
  assert.match(known.entries[0].name, /Pride and Prejudice/);
  assert.match(known.entries[0].author, /Austen/);
  const listedOnly = answerFromLibrary('who wrote Things Fall Apart'); // listed inside other entries, no record of its own
  assert.equal(listedOnly.strength, 'strong');
  assert.match(listedOnly.entries[0].author, /Achebe/);
  assert.equal(answerFromLibrary('who wrote The Zanzibar Chronicles of Brimstone Fell').strength, 'none');
});

test('two-letter terms, diacritics and hyphenated names are matched', () => {
  assert.match(answerFromLibrary('AP style numbers').entries.map((e) => e.name).join(' '), /one through nine|number|figures/i);
  assert.equal(answerFromLibrary('what is negritude').strength, 'strong');
  assert.match(answerFromLibrary('what is the three act structure').entries.map((e) => e.name).join(' '), /three-act/i);
  assert.equal(answerFromLibrary('who vs whom').strength, 'strong');
});

test('works listed inside other entries get lookup records, marked as derived, and nothing is invented', () => {
  const s = libraryStats();
  assert.ok(s.derived > 500, `derived lookup records: ${s.derived}`);
  const a = answerFromLibrary('who wrote Things Fall Apart').entries[0];
  assert.equal(a.derived, true);
  assert.match(a.summary, /Chinua Achebe/);
  assert.match(a.summary, /lists it as a representative work under/);
});

test('when nothing answers exactly but entries share the question\'s words, they are offered as the closest, never as the answer', () => {
  const a = answerFromLibrary('how do i cite a legal brief in bluebook');
  assert.equal(a.strength, 'none');
  assert.ok(a.near.length >= 1);
  const reply = libraryMissReply(a);
  assert.match(reply, /I don't have an entry that answers that exactly, and I won't guess/);
  assert.match(reply, /closest entries/);
  assert.match(reply, /Bluebook/);
  assert.ok(!/^From NIE's built-in library:/.test(reply));
  assert.match(libraryMissReply(answerFromLibrary('What is the capital of France?')), /isn't in my built-in library, and I won't guess/);
});
