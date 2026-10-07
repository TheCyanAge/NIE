import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator, STARTER } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { composeMessages, buildSystem, SYSTEM_CORE } from '../apps/web/src/engine/orchestrator/prompt.js';
import { guardReply } from '../apps/web/src/engine/orchestrator/guard.js';
import { DECLINE_EDIT, DECLINE_WRITE } from '../apps/web/src/engine/orchestrator/builtin.js';
import { interpretProfile } from '../apps/web/src/engine/profile/interpret.js';
import { rememberCharacter } from '../apps/web/src/engine/project/memory.js';
import { ProjectStore, memoryStorage } from '../apps/web/src/engine/project/store.js';
import { modelWithReading, projectWith, withRules } from './helpers.js';

const ROBOTIC = /NIE has identified|NIE recommends|NIE flagged|As an AI/i;

const builtinOnly = () => new Orchestrator({ engine: new AIEngine({ local: null, online: null, isOnline: () => false }) });
const stubLocal = (replyFn, calls = []) => ({
  status: () => ({ state: 'ready' }),
  onStatus: () => () => {},
  chat: modelWithReading(replyFn, { calls }),
});
const withModel = (replyFn, calls) => new Orchestrator({ engine: new AIEngine({ local: stubLocal(replyFn, calls), online: null, isOnline: () => false }) });

test('starting from zero: NIE meets the writer where they are, with no project, profile or genre needed', async () => {
  const project = projectWith();
  const r = await builtinOnly().brainstorm({ project, message: "I have an idea but I don't know how to start." });
  assert.equal(r.intent.type, 'start-from-zero');
  assert.match(r.reply, /let's hear the idea/i);
  assert.match(r.reply, /build from whatever you already have/i);
  assert.ok((r.reply.match(/\?/g) ?? []).length >= 1, 'asks useful questions');
  assert.ok(!ROBOTIC.test(r.reply));
  assert.equal(r.route, 'builtin');
});

test('a fresh premise is read on its own terms, not through another project\'s horror lens', async () => {
  const store = new ProjectStore(memoryStorage());
  const horror = store.create({ title: 'Apply' });
  horror.profile.genre.primary = 'psychological horror';
  rememberCharacter(horror, { name: 'Samantha', notes: "Samantha's father is Figure" });
  store.save(horror);

  const cat = store.create({ title: 'Cat story' });
  const r = await builtinOnly().brainstorm({ project: cat, message: 'A homeless man befriends a cat.' });
  assert.equal(r.intent.type, 'share-premise');
  assert.match(r.reply, /loneliness|companionship/);
  assert.match(r.reply, /grounded|human/);
  assert.ok(!/horror|dread|Samantha|Figure/i.test(r.reply));
  assert.ok(!ROBOTIC.test(r.reply));
  assert.ok(cat.conversation.workingPremise.themes.includes('loneliness'));
  assert.deepEqual(horror.conversation.messages, [], 'the other project was not touched');
});

test('when the writer changes direction, NIE follows and says what it changes', async () => {
  const project = projectWith();
  const o = builtinOnly();
  await o.brainstorm({ project, message: 'A homeless man befriends a cat.' });
  const r = await o.brainstorm({ project, message: 'Actually, the cat is secretly observing him for something.' });
  assert.equal(r.intent.type, 'direction-change');
  assert.match(r.reply, /change of direction|changes the shape/i);
  assert.match(r.reply, /reader/i);
  assert.equal(project.conversation.workingPremise.reality, 'speculative');
  assert.ok(!ROBOTIC.test(r.reply));
});

test('the starter suggestion appears only while the conversation is empty; afterwards suggestions are contextual', async () => {
  const project = projectWith();
  assert.match(STARTER.label, /^Try: /);
  const r1 = await builtinOnly().brainstorm({ project, message: 'A lighthouse keeper who talks to the sea.' });
  assert.ok(r1.suggestions.length >= 2);
  assert.ok(r1.suggestions.every((s) => !s.label.startsWith('Try:')));
  assert.ok(r1.suggestions.some((s) => /Add more details/.test(s.label)));
  assert.equal(project.conversation.suggestionShown, true);
});

// ── NIE never writes or edits ────────────────────────────────────────────────

test('requests to write or edit are declined without calling any model', async () => {
  const calls = [];
  const o = withModel(() => 'Here is a rewrite: "She walked slowly into the room and the light fell across her face in long pale bars."', calls);
  const project = projectWith();
  const edit = await o.brainstorm({ project, message: 'Rewrite this paragraph so it flows better' });
  assert.equal(edit.reply, DECLINE_EDIT);
  assert.equal(edit.declined, true);
  const write = await o.brainstorm({ project, message: 'Write me a scene where they meet' });
  assert.equal(write.reply, DECLINE_WRITE);
  assert.equal(calls.length, 0, 'the model is never asked');
  assert.match(DECLINE_EDIT, /don't rewrite or edit your text/i);
  assert.match(DECLINE_WRITE, /don't write or continue the story/i);
});

test('every system prompt carries the no-writing rule and the writer\'s rules', () => {
  const project = withRules(projectWith(), ['Never use the word "suddenly"', { text: 'Samantha never lies', category: 'character' }]);
  const system = buildSystem({ project, interp: interpretProfile(project.profile) });
  assert.match(SYSTEM_CORE, /NEVER write, rewrite, edit or continue the writer's text/);
  assert.match(system, /Never use the word "suddenly"/);
  assert.match(system, /Character rules: Samantha never lies/);
});

test('guard strips composed passages from model replies but allows quoting the writer back', () => {
  const composed = 'Try something like: "The rain hammered the windows of the old station while she counted the coins in her palm, one by one, until the clock above the door struck midnight and the last train left without her." That could work.';
  const g = guardReply(composed, ['A short message from the writer']);
  assert.equal(g.removed, 1);
  assert.ok(!/hammered the windows/.test(g.text));
  assert.match(g.text, /I don't write text for you/);

  const writerLine = 'The rain hammered the windows of the old station while she counted the coins in her palm, one by one, until the clock above the door struck midnight and the last train left without her.';
  const quoted = guardReply(`You wrote "${writerLine}" and I'd ask what she wants there.`, [writerLine]);
  assert.equal(quoted.removed, 0);
  assert.ok(quoted.text.includes(writerLine));

  assert.equal(guardReply('Short "quote" is fine.', []).removed, 0);
  assert.equal(guardReply('Here:\n```\nSome drafted text\n```\nok', []).removed, 1);
});

test('a model reply that is mostly a drafted passage is replaced by built-in guidance rather than shown', async () => {
  const drafted = '"' + Array.from({ length: 40 }, (_, i) => `word${i}`).join(' ') + '"';
  const o = withModel(() => drafted);
  const r = await o.brainstorm({ project: projectWith(), message: 'A homeless man befriends a cat.' });
  assert.equal(r.route, 'builtin');
  assert.ok(!r.reply.includes('word10'));
});

// ── model path ───────────────────────────────────────────────────────────────

test('with a model: prompt is built from this project only, history is included, reply is stored', async () => {
  const calls = [];
  const o = withModel(() => 'Tell me more about what he wants from the cat.', calls);
  const a = projectWith({ title: 'A' });
  rememberCharacter(a, { name: 'Samantha' });
  const b = withRules(projectWith({ title: 'B', profile: { genre: { primary: 'Slice of life' } } }), ['No adverbs']);

  await o.brainstorm({ project: b, message: 'A homeless man befriends a cat.' });
  const r = await o.brainstorm({ project: b, message: 'He is called Tom.' });
  assert.equal(r.route, 'local');
  assert.equal(calls.length, 2);
  const second = calls[1].messages;
  assert.equal(second[0].role, 'system');
  assert.match(second[0].content, /Slice of life/);
  assert.match(second[0].content, /No adverbs/);
  assert.ok(!JSON.stringify(second).includes('Samantha'));
  assert.deepEqual(second.slice(1, -1).map((m) => m.role), ['user', 'assistant'], 'previous exchange is carried');
  assert.match(second.at(-1).content, /He is called Tom\./);
  assert.equal(b.conversation.messages.length, 4);
  assert.equal(b.conversation.messages.at(-1).route, 'local');
});

test('the system prompt is stable between turns so the local model can reuse its prompt cache', () => {
  const project = projectWith({ profile: { genre: { primary: 'noir' } } });
  const interp = interpretProfile(project.profile);
  const m1 = composeMessages({ project, interp, userMessage: 'hello' }).messages[0].content;
  project.conversation.messages.push({ role: 'user', content: 'x' }, { role: 'assistant', content: 'y' });
  const m2 = composeMessages({ project, interp, userMessage: 'again', history: project.conversation.messages }).messages[0].content;
  assert.equal(m1, m2);
});

test('prompts stay inside a small-model budget even for large projects', () => {
  const project = projectWith({ profile: { identity: { title: 'T' } } });
  for (let i = 0; i < 40; i++) rememberCharacter(project, { name: `Character${i}`, notes: 'n'.repeat(100) });
  for (let i = 0; i < 40; i++) withRules(project, [`Rule number ${i} says never use the word "w${i}"`]);
  const history = Array.from({ length: 60 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'lorem ipsum '.repeat(60) }));
  const { tokens, messages } = composeMessages({ project, interp: interpretProfile(project.profile), userMessage: 'hi', passage: 'p'.repeat(20000), history, retrieved: [] });
  assert.ok(tokens < 3200, `prompt was ${tokens} tokens`);
  assert.equal(messages[1].role, 'user', 'history starts with a user turn');
});

test('model failure falls back to built-in guidance instead of failing the conversation', async () => {
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: async () => { throw new Error('boom'); } };
  const o = new Orchestrator({ engine: new AIEngine({ local, online: null, isOnline: () => false }) });
  const r = await o.brainstorm({ project: projectWith(), message: 'I don\'t know what to write.' });
  assert.equal(r.route, 'builtin');
  assert.match(r.reply, /let's hear the idea/i);
});

test('Orchestrator.scan: offline it uses keyword approximation; with a model it judges meaning by sentence number', async () => {
  const project = withRules(projectWith(), ['Samantha never lies']);
  const text = 'Samantha lied to the guard about the pass. He waved her through.';
  const offline = await builtinOnly().scan({ project, text, observations: false });
  assert.equal(offline.rules.items[0].state, 'approximate');
  assert.equal(offline.findings[0].meta.method, 'keyword');

  const o = withModel(() => '1 | Lies to the guard');
  const online = await o.scan({ project, text, observations: false });
  assert.equal(online.rules.items[0].state, 'judged');
  assert.equal(text.slice(online.findings[0].start, online.findings[0].end), 'Samantha lied to the guard about the pass.');
});
