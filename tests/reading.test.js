import test from 'node:test';
import assert from 'node:assert/strict';
import { splitSections, sectionText, isHeading, SECTION_MAX_CHARS } from '../apps/web/src/engine/reading/sections.js';
import { buildIndex, search, readingContext, describeReading, positionHints } from '../apps/web/src/engine/reading/context.js';
import { makeLongText, wordCountOf } from './fixtures/long-text.mjs';

const covers = (text, sections) => {
  let at = 0;
  for (const s of sections) {
    if (s.start !== at || s.end < s.start) return false;
    at = s.end;
  }
  return at === text.length;
};

// ── sections: nothing dropped, nothing rewritten ─────────────────────────────

test('every character of a text of any shape lies in exactly one section, in order', () => {
  const texts = [
    '', 'short', 'One line.\n\nTwo lines.', makeLongText({ words: 1500 }).text, makeLongText({ words: 40000 }).text,
    'word '.repeat(30000), 'A sentence. '.repeat(4000), 'x'.repeat(50000), 'Para one.\r\n\r\nPara two.\r\n\r\n'.repeat(500),
    '# Title\n\nSome text here.\n\n## Part\n\n' + 'More text. '.repeat(900), 'Ça va? Très bien — merci. '.repeat(900), '\n\n\n\n' + 'a '.repeat(2000) + '\n\n\n',
  ];
  for (const text of texts) {
    const sections = splitSections(text);
    assert.ok(covers(text, sections), `coverage for a text of ${text.length} characters`);
    assert.equal(sections.map((s) => sectionText(text, s)).join(''), text, 'joining the sections gives back the writer\'s exact text');
    sections.forEach((s, k) => assert.equal(s.i, k));
  }
});

test('sections are a sensible size, split at the writer\'s own structure', () => {
  const { text } = makeLongText({ words: 40000 });
  const sections = splitSections(text);
  assert.ok(sections.length > 100 && sections.length < 200, `${sections.length} sections`);
  for (const s of sections) assert.ok(s.end - s.start <= SECTION_MAX_CHARS + 600, `a section of ${s.end - s.start} characters`); // blank lines around a section are counted in it
  assert.ok(sections.filter((s) => s.title).length >= 60, 'chapter headings are found');
  assert.equal(sections[0].title, 'Chapter 1');
  assert.ok(sections.every((s) => s.under), 'every section knows which chapter it is under');
  assert.ok(isHeading('Chapter 12') && isHeading('# A Title') && isHeading('* * *') && isHeading('IV.') && !isHeading('Chapter 12 was the day she left, and nothing was the same after that, not even the weather over the harbour.'));
});

test('one enormous paragraph, with or without punctuation, is still cut into sections', () => {
  for (const text of ['word '.repeat(30000), 'It was late. '.repeat(5000), 'x'.repeat(40000)]) {
    const sections = splitSections(text);
    assert.ok(sections.length > 5);
    assert.ok(sections.every((s) => s.end - s.start <= SECTION_MAX_CHARS + 50));
  }
});

test('editing one paragraph changes the hash of one section only, so a re-read can skip the rest', () => {
  const { text } = makeLongText({ words: 8000 });
  const before = splitSections(text);
  const at = text.indexOf('Chapter 7');
  const edited = `${text.slice(0, at + 40)}CHANGED${text.slice(at + 40)}`;
  const after = splitSections(edited);
  const changed = after.filter((s) => !before.some((b) => b.hash === s.hash));
  assert.ok(changed.length >= 1 && changed.length <= 2, `${changed.length} sections changed`);
});

// ── finding the part that matters ────────────────────────────────────────────

test('a detail planted anywhere in a long text is found from the question alone, with no model', () => {
  for (const words of [8000, 40000, 148000]) {
    const { text, needles } = makeLongText({ words });
    const index = buildIndex(text);
    for (const n of needles) {
      const top = search(index, n.question, { limit: 3 });
      assert.ok(top.some((r) => sectionText(text, index.sections[r.i]).includes(n.fact)), `${words} words: ${n.question}`);
    }
  }
});

test('a text of 150,000 words is indexed in well under a few seconds', () => {
  const { text } = makeLongText({ words: 148000 });
  const t = Date.now();
  const index = buildIndex(text);
  assert.ok(Date.now() - t < 3000, `${Date.now() - t} ms`);
  assert.ok(index.sections.length > 400);
});

test('a question that points at the ending or the opening is recognised', () => {
  assert.equal(positionHints('is my ending too predictable?').tail, true);
  assert.equal(positionHints('give me ideas to move the story forward').tail, true);
  assert.equal(positionHints('does my opening hook the reader?').head, true);
  assert.equal(positionHints('the middle feels slow').middle, true);
  assert.deepEqual(positionHints('who is Marit?'), { head: false, tail: false, middle: false });
});

// ── what NIE is shown, and what it says it looked at ─────────────────────────

test('a text that fits is shown whole and NIE may say it read all of it', () => {
  const text = 'The harbour was quiet. A boat came in late.';
  const ctx = readingContext({ index: buildIndex(text), query: 'what happens?', budgetTokens: 1400 });
  assert.equal(ctx.stats.complete, true);
  assert.match(ctx.block, /all of it/);
  assert.match(ctx.block, /A boat came in late\./);
  assert.equal(describeReading(ctx.stats), 'I read all of it (about 9 words).');
});

test('a long text is shown within the budget: an outline of the whole, the latest part, and what matches', () => {
  const { text, needles } = makeLongText({ words: 40000 });
  const index = buildIndex(text);
  for (const n of needles) {
    const ctx = readingContext({ index, query: n.question, budgetTokens: 1400 });
    assert.ok(ctx.stats.tokens <= 1400 * 1.05, `${ctx.stats.tokens} tokens`);
    assert.ok(ctx.block.includes(n.fact), `the planted fact for "${n.question}" is in what the model is shown`);
    assert.ok(ctx.stats.shown.some((s) => s.role === 'latest'), 'the most recent part is always there');
    assert.equal(ctx.stats.complete, false);
  }
  const tail = readingContext({ index, query: 'is my ending too predictable?', budgetTokens: 1400 });
  assert.ok(tail.stats.shown.some((s) => s.i === index.sections.length - 1));
  assert.ok(tail.stats.shown.some((s) => s.role === 'opening'));
  assert.match(tail.block, /Outline of the other sections/);
  assert.match(tail.block, /about 39,907 words in 129 sections/);
});

test('when a section has to be cut, the cut keeps the sentence that matched, not just the start', () => {
  const filler = 'The tide went out and the tide came in and nobody wrote it down. '.repeat(40);
  const text = `Chapter 1\n\n${filler}\n\nZelda Quimby buried the copper compass under the lemon tree.\n\n${filler}\n\n` + `Chapter 2\n\n${filler.repeat(3)}`;
  const index = buildIndex(text, splitSections(text));
  const ctx = readingContext({ index, query: 'Where did Zelda Quimby bury the copper compass?', budgetTokens: 450 });
  assert.match(ctx.block, /Zelda Quimby buried the copper compass under the lemon tree/);
});

test('what NIE says it looked at never claims more than it saw', () => {
  const { text } = makeLongText({ words: 40000 });
  const ctx = readingContext({ index: buildIndex(text), query: 'is my ending too predictable?', budgetTokens: 1400 });
  const said = describeReading(ctx.stats);
  assert.match(said, /about 39,907 words in 129 sections/);
  assert.match(said, /I can't hold all of that in mind at once/);
  assert.match(said, /looked closely at sections 1, 128 and 129/);
  assert.match(said, /skimmed an outline of the rest/);
  assert.doesNotMatch(said, /I read all of it/);
});

test('the same text always gives the same context (no randomness)', () => {
  const { text } = makeLongText({ words: 20000 });
  const a = readingContext({ index: buildIndex(text), query: 'Where was Wren Calloway born?' });
  const b = readingContext({ index: buildIndex(text), query: 'Where was Wren Calloway born?' });
  assert.equal(a.block, b.block);
  assert.equal(wordCountOf(text) > 15000, true);
});

// ── through the orchestrator: a long message and a long Story Text ───────────

import { Orchestrator, LONG_MESSAGE_CHARS, splitPaste } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { modelWithReading, projectWith } from './helpers.js';

const setup = ({ reading = { task: 'tell', topic: '' }, reply = 'Here is a thought. What does the reader know by now?' } = {}) => {
  const calls = [];
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: modelWithReading(() => reply, { calls, reading: () => reading }) };
  return { o: new Orchestrator({ engine: new AIEngine({ local, online: null, isOnline: () => false }) }), calls };
};
const promptOf = (calls) => calls[0].messages.map((m) => m.content).join('\n---\n');
const approxTokens = (calls) => calls[0].messages.reduce((a, m) => a + Math.ceil(m.content.length / 3.6), 0);

test('a long pasted message is no longer cut off: the model gets an outline of all of it and the parts that matter, and the reply says what was looked at', async () => {
  const { text } = makeLongText({ words: 8000 });
  const message = `Here is my draft, what do you think of how it ends?\n\n${text}`;
  assert.ok(message.length > LONG_MESSAGE_CHARS * 5);
  const { o, calls } = setup({ reading: { task: 'feedback', topic: 'ending' } });
  const r = await o.brainstorm({ project: projectWith(), message });
  assert.equal(calls.length, 1);
  const prompt = promptOf(calls);
  assert.match(prompt, /The passage the writer just pasted is long: about 8,0\d\d words in 2\d sections/);
  assert.match(prompt, /Outline of the other sections/);
  assert.match(prompt, /what do you think of how it ends/, "the writer's own ask reaches the model");
  assert.ok(prompt.includes('Chapter 13'), 'the end of the text is shown');
  assert.ok(approxTokens(calls) <= 2900 * 1.08, `${approxTokens(calls)} tokens`);
  assert.doesNotMatch(r.reply, /longer than I can read at once/);
  assert.match(r.reply, /The passage you pasted is about 8,0\d\d words in 2\d sections\. I can't hold all of that in mind at once/);
  assert.match(r.reply, /skimmed an outline of the rest/);
  assert.equal(r.route, 'local');
});

test('the record kept on the reply says exactly which sections were shown', async () => {
  const { text } = makeLongText({ words: 8000 });
  const project = projectWith();
  const { o } = setup({ reading: { task: 'feedback', topic: 'ending' } });
  await o.brainstorm({ project, message: `What do you think of the ending?\n\n${text}` });
  const read = project.conversation.messages.at(-1).read;
  assert.equal(read.complete, false);
  assert.ok(read.sections > 20 && read.words > 7000);
  assert.ok(read.shown.includes(read.sections), 'the latest section was shown');
  assert.equal(read.subject, 'passage');
});

test('a short message is not treated as a pasted text, and a short Story Text is simply shown whole', async () => {
  const project = projectWith({ storyText: 'The harbour was quiet. Marta counted the boats twice and then a third time, because one was missing. '.repeat(8) });
  const { o, calls } = setup({ reading: { task: 'feedback', topic: 'ending' } });
  const r = await o.brainstorm({ project, message: 'is my ending too predictable?' });
  assert.match(promptOf(calls), /The writer's text \(all of it, about \d+ words\)/);
  assert.doesNotMatch(r.reply, /I can't hold all of that in mind/);
  assert.equal(project.conversation.messages.at(-1).read.complete, true);
});

test('questions about the writer\'s own long Story Text are answered with the part of it that matters, found with no model', async () => {
  const { text, needles } = makeLongText({ words: 40000 });
  const project = projectWith({ storyText: text });
  const n = needles[3];
  const { o, calls } = setup({ reading: { task: 'feedback', topic: '' } });
  const r = await o.brainstorm({ project, message: `In my story, ${n.question} Does that work?` });
  assert.ok(promptOf(calls).includes(n.fact), 'the passage that holds the answer is in front of the model');
  assert.match(r.reply, /Your text is about 39,\d{3} words in 129 sections/);
  assert.ok(approxTokens(calls) <= 2900 * 1.08);
});

test('a follow-up after a long paste is about that paste; "my story" goes back to the Story Text', async () => {
  const pasted = makeLongText({ words: 6000, seed: 3 });
  const story = makeLongText({ words: 6000, seed: 11 });
  const project = projectWith({ storyText: `STORYTEXT ${story.text}` });
  const { o, calls } = setup({ reading: { task: 'feedback', topic: '' } });
  await o.brainstorm({ project, message: `Please look at this opening.\n\n${pasted.text}` });
  await o.brainstorm({ project, message: pasted.needles[2].question });
  assert.match(calls.at(-1).messages.map((m) => m.content).join('\n'), /The passage the writer just pasted is long/);
  await o.brainstorm({ project, message: 'is my ending too predictable?' });
  assert.match(calls.at(-1).messages.map((m) => m.content).join('\n'), /The writer's text is long/);
});

test('craft questions and questions about NIE never drag the writer\'s text in', async () => {
  const { text } = makeLongText({ words: 8000 });
  const project = projectWith({ storyText: text });
  const { o, calls } = setup({ reading: { task: 'craft', topic: 'villanelle' } });
  await o.brainstorm({ project, message: "What's a villanelle?" });
  assert.doesNotMatch(promptOf(calls), /The writer's text/);
});

test('the pasted text is split from the ask: a short first or last paragraph is the writer\'s question', () => {
  const body = 'A long paragraph of the passage itself. '.repeat(60);
  assert.deepEqual(splitPaste(`Can you tell me if the pacing works?\n\n${body}\n\n${body}`).ask, 'Can you tell me if the pacing works?');
  assert.equal(splitPaste(`${body}\n\n${body}\n\nWhat do you think?`).ask, 'What do you think?');
  assert.equal(splitPaste(`${body}\n\n${body}\n\n${body}`).ask, '');
  assert.equal(splitPaste(body).ask, '');
});

test('the premise kept for a project is the start of what was pasted, not all of it', async () => {
  const { text } = makeLongText({ words: 8000 });
  const project = projectWith();
  const { o } = setup();
  await o.brainstorm({ project, message: text });
  assert.ok(project.conversation.workingPremise.summary.length <= 500);
});

test('with no model running a long paste is still checked against the writer\'s rules in full, and no reading is claimed', async () => {
  const { text } = makeLongText({ words: 8000 });
  const o = new Orchestrator({ engine: new AIEngine({ local: null, online: null, isOnline: () => false }) });
  const r = await o.brainstorm({ project: projectWith(), message: text });
  assert.equal(r.route, 'builtin');
  assert.doesNotMatch(r.reply, /I read all of it|looked closely at section/);
});
