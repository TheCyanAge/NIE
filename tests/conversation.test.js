import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { DECLINE_WRITE, DECLINE_WRITE_AGAIN } from '../apps/web/src/engine/orchestrator/builtin.js';
import { loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { modelWithReading, projectWith } from './helpers.js';

await loadLibrary();

function setup({ reply = 'A thought.', reading = null } = {}) {
  const calls = [];
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: modelWithReading(typeof reply === 'function' ? reply : () => reply, { calls, reading }) };
  return { o: new Orchestrator({ engine: new AIEngine({ local, online: null, isOnline: () => false }) }), calls };
}
const task = (t) => () => ({ task: t, topic: '' });

test('the same request asked twice gets a second answer that is not the first pasted again, and still no model is asked', async () => {
  const { o, calls } = setup({ reading: task('write') });
  const project = projectWith();
  const a = await o.brainstorm({ project, message: 'write the opening scene for me' });
  const b = await o.brainstorm({ project, message: 'ok then just give me a first line' });
  assert.equal(a.reply, DECLINE_WRITE);
  assert.equal(b.reply, DECLINE_WRITE_AGAIN);
  assert.notEqual(a.reply, b.reply);
  assert.equal(calls.length, 0);
  const c = await o.brainstorm({ project, message: 'please just write one line' });
  assert.equal(c.reply, DECLINE_WRITE, 'after the second answer the first wording is allowed again');
});

test('"are you a real person?" is answered plainly, not with the list of what NIE can do', async () => {
  const { o, calls } = setup({ reading: task('about-nie') });
  const r = await o.brainstorm({ project: projectWith(), message: 'are you a real person?' });
  assert.match(r.reply, /^No, I'm not a person\. I'm NIE, an AI writing partner/);
  assert.ok(r.reply.split(/\s+/).length < 60);
  assert.equal(calls.length, 0);
});

test('"do you remember what my story is about?" is answered from what NIE holds, in the writer\'s own words, never by the model', async () => {
  const { o, calls } = setup({ reading: task('tell') });
  const project = projectWith();
  await o.brainstorm({ project, message: 'I am writing about a girl who can hear the dead.' });
  const before = calls.length;
  const r = await o.brainstorm({ project, message: 'do you remember what my story is about?' });
  assert.equal(calls.length, before, 'the model was not asked');
  assert.equal(r.route, 'builtin');
  assert.match(r.reply, /girl who can hear the dead/);
});

test('a writer with nothing yet gets a human line and a few starting points to react to, not a question about the form of a piece that does not exist', async () => {
  const { o, calls } = setup({
    reading: task('write'), // (what the real model said)
    reply: 'Here are a few starting points:\n\n1. A town where the clocks disagree.\n\n2. A letter that arrives forty years late.\n\n3. Two siblings who inherit a lie.',
  });
  const r = await o.brainstorm({ project: projectWith(), message: "I want to write something but I don't know what yet" });
  assert.equal(r.understood.task, 'ideas');
  assert.equal(r.ideas.length, 3);
  assert.match(r.lead, /pressure|know yet|Nobody knows/);
  assert.equal(r.agent?.act, undefined);
  assert.ok(calls.at(-1).messages.at(-1).content.length > 0);
});

test('"that\'s cliche" is a reply to NIE: it is not filed as a detail of the idea or remembered as something the writer told NIE, and the model is told it is being pushed back on', async () => {
  const { o, calls } = setup({ reply: 'Fair, the double agent is well worn. What if the translator is the only one who knows the speech was edited?', reading: task('develop') });
  const project = projectWith();
  project.conversation.messages.push({ role: 'user', content: 'a thriller about a translator who realises the speech she is translating is a lie' }, { role: 'assistant', content: 'The lie could come from her own side. Who gains if she stays quiet?' });
  const said = project.mind?.said?.length ?? 0;
  const extra = project.conversation.agent.extra.length;
  const r = await o.brainstorm({ project, message: "that's cliché" });
  assert.equal(project.mind.said.length, said, 'not remembered as a statement');
  assert.equal(project.conversation.agent.extra.length, extra, 'not filed under "Also"');
  const prompt = calls.at(-1).messages.at(-1).content;
  assert.match(prompt, /pushing back/);
  assert.match(prompt, /Who gains if she stays quiet\?/);
  assert.match(r.reply, /What if the translator/);
});
