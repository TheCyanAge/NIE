import test from 'node:test';
import assert from 'node:assert/strict';
import { packs } from '../apps/web/src/engine/agent/index.js';
import { emptyAgentState } from '../apps/web/src/engine/agent/state.js';
import { extractSlots, isAnswer, isShrug } from '../apps/web/src/engine/agent/extract.js';
import { signalsDone } from '../apps/web/src/engine/agent/talk.js';
import { enforceReply } from '../apps/web/src/engine/agent/ask.js';
import { briefFor } from '../apps/web/src/engine/agent/brief.js';
import { applyReading } from '../apps/web/src/engine/orchestrator/understand.js';
import { finishedSentences } from '../apps/web/src/engine/orchestrator/index.js';
import { isPraiseOpener } from '../apps/web/src/engine/orchestrator/variety.js';
import { estimateTokens } from '../apps/web/src/engine/util/text.js';

// Each of these was a real failure seen when the idea agent was played against the REAL model by scripted writers (scripts/agent-lab.mjs, workflow agent-lab).

const ctx = { packs };
const story = () => ({ ...emptyAgentState(), kind: 'story' });
const model = (json) => async () => ({ text: JSON.stringify(json) });

test('a model that gives no main character does not leave the sheet without one when the writer plainly named her', async () => {
  const out = await extractSlots({
    message: "The detective is Wren Alder, a retired postwoman who knows everyone's handwriting.",
    state: story(), ctx, chat: model({ updates: [{ slot: 'setting', value: 'handwriting' }], extra: '' }),
  });
  assert.equal(out.by, 'model');
  assert.ok(out.updates.some((u) => u.slot === 'protagonist' && /Wren Alder/.test(u.value)), JSON.stringify(out.updates));
  assert.ok(out.updates.every((u) => Object.keys(u).sort().join() === 'slot,value'), 'nothing but the slot and the words');
});

test('what the model did put somewhere is not put a second time by the rules', async () => {
  const out = await extractSlots({
    message: 'The main character is Mara, a retired ferry captain who keeps noticing things.',
    state: story(), ctx, chat: model({ updates: [{ slot: 'protagonist', value: 'Mara, a retired ferry captain' }], extra: '' }),
  });
  assert.equal(out.updates.filter((u) => u.slot === 'protagonist').length, 1);
  assert.equal(out.updates.find((u) => u.slot === 'protagonist').value, 'Mara, a retired ferry captain');
});

test('"Skip that one, I\'m not sure." is a shrug made of two shrugs, not an answer to be filed; a tentative answer is still an answer', () => {
  for (const t of ["Skip that one, I'm not sure.", "I don't know, skip it", 'Not sure, skip that.']) {
    assert.equal(isShrug(t), true, t);
    assert.equal(isAnswer(t, { asked: true }), false, t);
  }
  assert.equal(isShrug("I'm not sure, maybe the sea"), false);
});

test('"That\'s about all I have for now." says the writer is done', () => {
  for (const t of ["That's about all I have for now.", "That's all I have", "that's about it", "I think that's everything.", "That's pretty much all there is"]) assert.equal(signalsDone(t), true, t);
  assert.equal(signalsDone("That's all I can say about the dog, but the cat is another story"), false);
});

test('a model that reads a plain statement as a request for ideas is not believed: nothing in it asks for ideas', () => {
  const read = (text, task) => {
    const intent = { type: 'discuss', premiseCues: {}, direction: { changed: false } };
    applyReading(intent, { task, topic: '' }, text);
    return intent.reading;
  };
  const r = read("Also, the letters are written in a hand that matches a dead man's.", 'ideas');
  assert.equal(r.task, 'tell');
  assert.equal(r.overruled, 'ideas');
  assert.equal(read('Give me a few more twists for the middle.', 'ideas').task, 'ideas');
  assert.equal(read('Any twists?', 'ideas').task, 'ideas');
});

test('a reply cut off by the length limit loses its unfinished last sentence, and a finished one is left alone', () => {
  assert.equal(finishedSentences('Mara keeps the lighthouse. Corin wants it gone. And then the'), 'Mara keeps the lighthouse. Corin wants it gone.');
  assert.equal(finishedSentences('Mara keeps the lighthouse. What does Corin want?'), 'Mara keeps the lighthouse. What does Corin want?');
  assert.equal(finishedSentences('A short unfinished thought'), 'A short unfinished thought', 'with nothing finished to fall back on, it is kept');
  assert.equal(finishedSentences(''), '');
});

test('praise addressed to the writer is recognised ("You\'ve outlined a compelling premise...")', () => {
  assert.equal(isPraiseOpener("You've outlined a compelling premise in a lighthouse town."), true);
  assert.equal(isPraiseOpener("That's a poignant choice for a chorus."), true);
  assert.equal(isPraiseOpener("You've named the keeper but not the island."), false);
  assert.equal(isPraiseOpener('You are asking who sent the letters.'), false);
});

test('a reply that is nothing but questions ends with exactly one, even when the model said the same question twice', () => {
  const plan = { act: 'ask', slot: 'protagonist', question: { text: 'Who is the story about?', type: 'open', slot: 'protagonist' } };
  const state = { ...story(), slots: { premise: { value: 'a lighthouse mystery', turn: 1, via: 'said' } } };
  const q = 'What do the people around the main character call them?';
  const out = enforceReply(`${q} ${q}`, plan, { state, ctx: { packs }, askedTexts: [], terms: new Set(['lighthouse']) });
  assert.equal((out.text.match(/\?/g) ?? []).length, 1, out.text);
  const three = enforceReply('What does she want? Who stands against her? Where does it end?', plan, { state, ctx: { packs }, askedTexts: [], terms: new Set(['lighthouse']) });
  assert.equal((three.text.match(/\?/g) ?? []).length, 1, three.text);
});

test('a turn that only acknowledges and asks is told to be short and to add nothing of its own', () => {
  const state = { ...story(), slots: { protagonist: { value: 'Wren Alder', turn: 1, via: 'said' } } };
  for (const act of ['ask', 'reflect']) {
    const brief = briefFor({ plan: { act, slot: 'want', question: { text: 'What does Wren want most?' } }, state, ctx });
    assert.match(brief, /Do not retell their idea, guess what happens next, add any detail of your own, or say how good it is\./);
    assert.ok(estimateTokens(brief) <= 380);
  }
});
