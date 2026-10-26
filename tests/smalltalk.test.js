import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { SMALL_TALK_MAX_WORDS, holdSmallTalk, isSmallTalk, kindOfSmallTalk, smallTalkFallback, smallTalkNote, whereWeWere } from '../apps/web/src/engine/orchestrator/smalltalk.js';
import { loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { modelWithReading, projectWith } from './helpers.js';

await loadLibrary();

function setup({ reply, reading } = {}) {
  const calls = [];
  const reads = [];
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: modelWithReading(typeof reply === 'function' ? reply : () => reply, { calls, reads, reading }) };
  return { o: new Orchestrator({ engine: new AIEngine({ local, online: null, isOnline: () => false }) }), calls, reads };
}
const builtinOnly = () => new Orchestrator({ engine: new AIEngine({ local: null, online: null, isOnline: () => false }) });
const chat = () => ({ task: 'chat', topic: '' });

// ── what kind of small talk it is ─────────────────────────────────────────────

test('small talk is told apart by what the writer said', () => {
  const kinds = { hey: 'greeting', 'Hello!': 'greeting', 'thanks!': 'thanks', 'thank you so much': 'thanks', 'how are you?': 'how-are-you', "how's it going": 'how-are-you', 'hey, back again': 'back', "I'm back": 'back', 'ok cool': 'ack', 'bye for now': 'bye', "I'm so tired today": 'low', "I'm stuck": 'low' };
  for (const [text, kind] of Object.entries(kinds)) assert.equal(kindOfSmallTalk(text), kind, text);
});

test('only a short message the reading calls chat is small talk', () => {
  assert.ok(isSmallTalk({ task: 'chat' }, 'hey'));
  assert.ok(!isSmallTalk({ task: 'ideas' }, 'hey'));
  assert.ok(!isSmallTalk({ task: 'chat' }, 'thanks, that was great, now can you walk me through every single twist you gave me earlier in the heist plot again please'));
  assert.ok(!isSmallTalk(null, 'hey'));
});

// ── "hey" in Brainstorm ───────────────────────────────────────────────────────

test('"hey" gets a hello back: the model sees no library notes, no brief and no idea sheet, only the conversation and one instruction', async () => {
  const { o, calls } = setup({ reply: 'Hey there. What are you in the mood to work on today?', reading: chat });
  const project = projectWith();
  const r = await o.brainstorm({ project, message: 'hey' });
  assert.equal(r.reply, 'Hey there. What are you in the mood to work on today?');
  assert.equal(r.understood.task, 'chat');
  assert.equal(calls.length, 1);
  const prompt = calls[0].messages.map((m) => m.content).join('\n');
  assert.doesNotMatch(prompt, /Reference notes/);
  assert.doesNotMatch(prompt, /What you understand so far|Questions you have already asked|Conventions to keep in mind|This turn:/);
  assert.doesNotMatch(prompt, /one specific detail/);
  assert.match(prompt, /small talk/);
  assert.match(prompt, /They have not told you what they are working on yet/);
  assert.equal(r.ideas.length, 0);
  assert.deepEqual(r.suggestions, []);
});

test('the idea sheet and the project mind are untouched by small talk', async () => {
  const { o } = setup({ reply: 'Hi! Good to see you.', reading: chat });
  const project = projectWith();
  await o.brainstorm({ project, message: 'hey' });
  await o.brainstorm({ project, message: 'thanks!' });
  assert.equal(project.mind.said.length, 0);
  assert.equal(Object.keys(project.conversation.agent.slots).length, 0);
  assert.equal(project.conversation.agent.asked.length, 0);
});

test('when the writer has told NIE about their story, a hello may pick it up in their own words, and the prompt says it is optional', async () => {
  const { o, calls } = setup({ reply: (m) => (/small talk/.test(m.at(-1).content) ? 'Welcome back. Want to go on with the lighthouse keeper?' : 'ok'), reading: (t) => (/lighthouse/.test(t) ? { task: 'tell', topic: '' } : { task: 'chat', topic: '' }) });
  const project = projectWith();
  await o.brainstorm({ project, message: 'I am writing a story about a lighthouse keeper who forges tide tables.' });
  const r = await o.brainstorm({ project, message: 'hey, back again' });
  const prompt = calls.at(-1).messages.at(-1).content;
  assert.match(prompt, /lighthouse keeper who forges tide tables/);
  assert.match(prompt, /MAY mention it/);
  assert.match(r.reply, /lighthouse keeper/);
});

// ── the check on the model's reply ────────────────────────────────────────────

test('a reply that names something the writer never named, lists things, or runs on is not used: NIE answers in its own words instead', async () => {
  for (const bad of [
    'The "thanks" at the end signals a warm, appreciative tone right from the start.',
    'Hello! Here are some ideas:\n- A detective named Marcus\n- A ghost ship',
    'Hello. Have you thought about Captain Ahab and the whale? It would make a fine start for a story about revenge.',
  ]) {
    const { o } = setup({ reply: bad, reading: chat });
    const r = await o.brainstorm({ project: projectWith(), message: 'hey' });
    assert.equal(r.route, 'builtin', bad);
    assert.doesNotMatch(r.reply, /thanks|Marcus|Ahab|ghost/);
    assert.match(r.reply, /^(?:Hey|Hi|Hello)/);
  }
});

test('holdSmallTalk keeps one question and a short reply', () => {
  const project = projectWith();
  const out = holdSmallTalk('Good to hear from you. What are you working on? And how is it going? Tell me everything about the whole thing.', { project, text: 'hey' });
  assert.equal(out, 'Good to hear from you. What are you working on? Tell me everything about the whole thing.');
  assert.equal(holdSmallTalk('Good to hear from you. What are you working on? And how is it going?', { project, text: 'hey' }), 'Good to hear from you. What are you working on?');
  const long = Array.from({ length: 40 }, () => 'This is a perfectly friendly sentence.').join(' ');
  assert.ok(holdSmallTalk(long, { project, text: 'hey' }).split(/\s+/).length <= SMALL_TALK_MAX_WORDS);
  assert.equal(holdSmallTalk('', { project, text: 'hey' }), '');
});

// ── with no model ─────────────────────────────────────────────────────────────

test('with no model a hello, a thanks and "how are you?" each get their own kind of line', async () => {
  const o = builtinOnly();
  const hello = await o.brainstorm({ project: projectWith(), message: 'hey' });
  const thanks = await o.brainstorm({ project: projectWith(), message: 'thanks!' });
  const how = await o.brainstorm({ project: projectWith(), message: 'how are you?' });
  assert.match(hello.reply, /^(?:Hey|Hi|Hello)/);
  assert.match(thanks.reply, /welcome|glad|any time/i);
  assert.match(how.reply, /good|well|ready/i);
  assert.notEqual(hello.reply, thanks.reply);
  for (const r of [hello, thanks, how]) {
    assert.equal(r.route, 'builtin');
    assert.ok(r.reply.split(/\s+/).length <= 40, r.reply);
  }
});

test('the built-in line can pick up what the writer was making, in their own words', () => {
  const project = projectWith();
  project.mind.said.push({ n: 1, turn: 1, at: 0, text: 'a lighthouse keeper forging tide tables', kind: 'told' });
  assert.deepEqual(whereWeWere(project), ['a lighthouse keeper forging tide tables']);
  assert.match(smallTalkFallback({ text: 'hey', project }), /a lighthouse keeper forging tide tables/);
  assert.doesNotMatch(smallTalkFallback({ text: 'thanks', project }), /lighthouse/, 'a thanks is answered as a thanks');
  assert.match(smallTalkNote({ text: 'hey', project }), /you MAY mention it/);
});

test('small talk in one project is never about another: nothing is kept outside the project object', () => {
  const a = projectWith();
  const b = projectWith();
  a.mind.said.push({ n: 1, turn: 1, at: 0, text: 'a heist on a floating casino', kind: 'told' });
  assert.deepEqual(whereWeWere(b), []);
  assert.doesNotMatch(smallTalkFallback({ text: 'hey', project: b }), /casino/);
});
