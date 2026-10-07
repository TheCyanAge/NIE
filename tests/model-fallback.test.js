import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator, describeModelFailure } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { AIError } from '../apps/web/src/engine/ai/openai-client.js';
import { composeMessages, PROMPT_TOKEN_LIMIT } from '../apps/web/src/engine/orchestrator/prompt.js';
import { projectWith } from './helpers.js';

/**
 * When the offline model IS running, NIE must never claim it is missing. Two things used to make that claim:
 * a prompt too long for the model's 4,096-token window (the call failed and was swallowed), and an answer that the
 * "NIE never writes your text" guard removed. Both now say what really happened, and a failed call is retried once, smaller.
 */

const FEEDBACK = 'Does this ending feel too predictable?';
const modelWith = (chatFn) => {
  const calls = [];
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, async chat(messages, opts) { calls.push({ messages, opts }); return chatFn(messages, calls.length); } };
  return { o: new Orchestrator({ engine: new AIEngine({ local, online: null, isOnline: () => false }) }), calls };
};
const tooLong = () => new AIError('The model returned 400: the request exceeds the available context size', { status: 400, kind: 'http' });
const chars = (messages) => messages.reduce((a, m) => a + m.content.length, 0);

test('the prompt is capped to what the local model can read, shrinking notes and history before the writer\'s own words', () => {
  const project = projectWith({ storyText: 'The harbour was quiet. '.repeat(400) });
  const history = Array.from({ length: 12 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `Earlier message number ${i} about the lighthouse and the long winter. `.repeat(20) }));
  const big = composeMessages({ project, userMessage: 'Does this ending feel too predictable?', passage: project.storyText.slice(-1800), history, retrieved: [] });
  assert.ok(big.tokens <= PROMPT_TOKEN_LIMIT, `prompt of ${big.tokens} tokens is over the limit`);

  const huge = composeMessages({ project, userMessage: 'A very long paste about a lunar settlement. '.repeat(400), passage: project.storyText.slice(-1800), history });
  assert.ok(huge.tokens <= PROMPT_TOKEN_LIMIT + 60, `a huge message still fits: ${huge.tokens}`);
  assert.ok(huge.trimmed.includes('your message'), 'it says the writer\'s message was shortened');
  assert.match(huge.messages.at(-1).content, /only the first part is shown/);

  const small = composeMessages({ project: projectWith(), userMessage: 'Hello there.' });
  assert.deepEqual(small.trimmed, [], 'a normal prompt is left alone');
});

test('a failed call while the model is ready is retried once with a smaller prompt, and the answer is used', async () => {
  const { o, calls } = modelWith((_m, n) => {
    if (n === 1) throw tooLong();
    return 'What do you want the reader to expect when they reach the last line, and what should still surprise them?';
  });
  const r = await o.brainstorm({ project: projectWith({ storyText: 'The harbour was quiet. '.repeat(120) }), message: FEEDBACK });
  assert.equal(calls.length, 2, 'one retry');
  assert.ok(chars(calls[1].messages) < chars(calls[0].messages), 'the retry prompt is smaller');
  assert.equal(r.route, 'local');
  assert.match(r.reply, /last line/);
  assert.ok(!/without the language model|My offline model is running/.test(r.reply));
});

test('if the model is ready but cannot answer even a small prompt, NIE says so truthfully and never says the model is missing', async () => {
  const { o, calls } = modelWith(() => { throw tooLong(); });
  const project = projectWith();
  const r = await o.brainstorm({ project, message: FEEDBACK });
  assert.equal(calls.length, 2);
  assert.equal(r.route, 'builtin');
  assert.match(r.reply, /My offline model is running, but I couldn't get an answer from it this time: what I was sent was too long/);
  assert.ok(!/without the language model/.test(r.reply), 'the model is not missing, so that must not be said');
  assert.match(r.reply, /I don't want to guess about your story/);
  assert.equal(project.conversation.messages.at(-1).fallback?.reason, 'error');
});

test('when NIE withholds the model\'s answer because it composed text for the writer, it says that', async () => {
  const composed = `Try this: "${'The tide drew back from the harbour wall and the lamp went dark behind her while nobody stood watching at all '.repeat(2)}"`;
  const { o } = modelWith(() => composed);
  const r = await o.brainstorm({ project: projectWith(), message: FEEDBACK });
  assert.equal(r.route, 'builtin');
  assert.match(r.reply, /My offline model did answer, but its answer included wording it had composed for your text, and NIE never writes or edits your text/);
  assert.ok(!r.reply.includes('The tide drew back'), 'the composed passage is not shown');
  assert.ok(!/without the language model/.test(r.reply));
});

test('with NO model, the plain "without the language model" line is still true and still used', async () => {
  const o = new Orchestrator({ engine: new AIEngine({ local: null, online: null, isOnline: () => false }) });
  const r = await o.brainstorm({ project: projectWith(), message: FEEDBACK });
  assert.match(r.reply, /I can't judge that properly without the language model/);
  assert.ok(!/My offline model is running/.test(r.reply));
});

test('an idea request that the ready model cannot answer also says why, and still gives built-in ideas', async () => {
  const { o } = modelWith(() => { throw tooLong(); });
  const r = await o.brainstorm({ project: projectWith(), message: 'Give me some twists.' });
  assert.equal(r.route, 'builtin');
  assert.match(r.reply, /My offline model is running, but I couldn't get an answer from it this time/);
  assert.ok(r.ideas.length > 0, 'the built-in idea library still answers');
});

test('failures are described in words a writer can act on', () => {
  assert.match(describeModelFailure(tooLong()), /too long/);
  assert.match(describeModelFailure(new AIError('The model took too long to respond', { kind: 'timeout' })), /took too long/);
  assert.match(describeModelFailure(new AIError('Could not reach the model: x', { kind: 'network' })), /stopped responding/);
  assert.match(describeModelFailure(new Error('boom')), /ran into a problem \(boom\)/);
});
