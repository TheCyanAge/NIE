import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { AIError, OpenAICompatClient } from '../apps/web/src/engine/ai/openai-client.js';
import { DECLINE_EDIT, DECLINE_WRITE } from '../apps/web/src/engine/orchestrator/builtin.js';
import { READING_SCHEMA, TASKS, UNDERSTAND_SYSTEM, applyReading, buildUnderstandMessages, parseReading, taskOfIntent } from '../apps/web/src/engine/orchestrator/understand.js';
import { detectIntent } from '../apps/web/src/engine/intent/intent.js';
import { loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { modelWithReading, projectWith } from './helpers.js';

await loadLibrary();

/** A running offline model whose reading of each message is scripted, and whose answers are `reply`. */
function setup({ reading, reply = 'Here is a thought about that. What do you want the reader to feel?', online = null } = {}) {
  const calls = [];
  const reads = [];
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: modelWithReading(() => reply, { calls, reads, reading }) };
  return { o: new Orchestrator({ engine: new AIEngine({ local, online, isOnline: () => false }) }), calls, reads };
}
const read = (task, topic = '') => () => ({ task, topic });
const builtinOnly = () => new Orchestrator({ engine: new AIEngine({ local: null, online: null, isOnline: () => false }) });

// ── what the model is asked, and how its answer is read ───────────────────────

test('the reading prompt asks for a label and a topic, never prose, and is constrained to the known labels', () => {
  const msgs = buildUnderstandMessages({ text: 'Is my ending too predictable?', history: [{ role: 'user', content: 'My story is a heist.' }, { role: 'assistant', content: 'Nice. Who is on the crew?' }] });
  assert.equal(msgs[0].role, 'system');
  assert.equal(msgs[0].content, UNDERSTAND_SYSTEM, 'the fixed part comes first and never changes, so llama.cpp can reuse it');
  assert.match(msgs[0].content, /You never answer it/);
  for (const t of TASKS) assert.ok(msgs[0].content.includes(`${t}:`) || msgs[0].content.includes(`"task":"${t}"`), `the prompt explains ${t}`);
  assert.match(msgs[1].content, /Writer: My story is a heist\./);
  assert.match(msgs[1].content, /NIE: Nice\. Who is on the crew\?/);
  assert.match(msgs[1].content, /"""\nIs my ending too predictable\?\n"""$/);
  assert.deepEqual(READING_SCHEMA.properties.task.enum, [...TASKS]);
  assert.equal(READING_SCHEMA.additionalProperties, false);
});

test('a very long message is clipped (head and tail) so reading it stays cheap', () => {
  const long = `${'The harbour was quiet. '.repeat(100)}THE END`;
  const msgs = buildUnderstandMessages({ text: long });
  assert.ok(msgs[1].content.length < 900, `${msgs[1].content.length} characters`);
  assert.match(msgs[1].content, /THE END/);
});

test('the model answer is read tolerantly: plain JSON, fenced, chatty, cut off, near-miss labels; anything else is not a reading', () => {
  assert.deepEqual(parseReading('{"task":"craft","topic":"villanelle"}'), { task: 'craft', topic: 'villanelle' });
  assert.deepEqual(parseReading('```json\n{"task": "ideas", "topic": "heist twists"}\n```'), { task: 'ideas', topic: 'heist twists' });
  assert.deepEqual(parseReading('Sure! {"task":"tell","topic":""} Hope that helps'), { task: 'tell', topic: '' });
  assert.deepEqual(parseReading('{"task":"feedback","topic":"endi'), { task: 'feedback', topic: 'endi' }, 'cut off after the label: the label is still usable');
  assert.equal(parseReading('{"task":"About NIE","topic":""}').task, 'about-nie');
  assert.equal(parseReading('{"task":"rewrite","topic":""}').task, 'edit');
  assert.equal(parseReading('{"task":"banana","topic":""}'), null);
  assert.equal(parseReading('I think this writer wants ideas.'), null);
  assert.equal(parseReading(''), null);
  assert.equal(parseReading('{"task":"craft","topic":"one two three four five six seven eight nine ten"}').topic, '', 'a topic that is really a sentence is dropped');
  assert.equal(parseReading('{"task":"craft","topic":"a \\"quoted\\"\\nthing"}').topic, 'a quoted thing');
});

test('the reading call is a short, deterministic, schema-constrained, non-streamed request', async () => {
  const { o, reads } = setup({ reading: read('ideas') });
  await o.brainstorm({ project: projectWith(), message: 'Give me some twists for my heist story.' });
  assert.equal(reads.length, 1);
  const { opts } = reads[0];
  assert.equal(opts.purpose, 'understand');
  assert.equal(opts.temperature, 0);
  assert.equal(opts.stream, false);
  assert.ok(opts.maxTokens <= 80);
  assert.ok(opts.timeoutMs <= 30000);
  assert.deepEqual(opts.json, READING_SCHEMA);
});

test('the HTTP client sends the schema to a server that supports it, and to nobody else', async () => {
  const seen = [];
  const fetchImpl = async (_url, init) => (seen.push(JSON.parse(init.body)), new Response(JSON.stringify({ choices: [{ message: { content: '{"task":"chat","topic":""}' } }] }), { status: 200 }));
  const local = new OpenAICompatClient({ baseUrl: 'http://x/v1', fetchImpl, jsonSchema: true });
  const online = new OpenAICompatClient({ baseUrl: 'http://y/v1', fetchImpl });
  await local.chat([{ role: 'user', content: 'hi' }], { stream: false, json: READING_SCHEMA });
  await online.chat([{ role: 'user', content: 'hi' }], { stream: false, json: READING_SCHEMA });
  assert.equal(seen[0].response_format.type, 'json_schema');
  assert.deepEqual(seen[0].response_format.json_schema.schema, READING_SCHEMA);
  assert.equal(seen[1].response_format, undefined, 'an arbitrary online provider may reject response_format, so it is opt-in');
});

// ── who understood the message ───────────────────────────────────────────────

test('with no model the rules read the message, and the result says so', async () => {
  const r = await builtinOnly().brainstorm({ project: projectWith(), message: 'Give me some twists for my heist story.' });
  assert.deepEqual(r.understood, { by: 'rules', task: 'ideas', topic: '' });
});

test('with a model running, the model reads the message and the result and the stored message say so', async () => {
  const { o, reads } = setup({ reading: read('craft', 'villanelle') });
  const project = projectWith();
  const r = await o.brainstorm({ project, message: "What's a villanelle?" });
  assert.equal(reads.length, 1);
  assert.deepEqual(r.understood, { by: 'model', task: 'craft', topic: 'villanelle' });
  assert.deepEqual(project.conversation.messages.at(-1).understood, { by: 'model', task: 'craft', topic: 'villanelle' });
  assert.equal(project.conversation.messages.at(-2).intent, 'craft-question', 'the stored message carries the intent the reading settled on');
});

test('exact Idea Board commands, bare greetings and the rules\' own declines never wait for the model', async () => {
  const { o, calls, reads } = setup({ reading: read('ideas') });
  const project = projectWith();
  await o.brainstorm({ project, message: 'remember: the cat can talk' });
  await o.brainstorm({ project, message: 'show my idea board' });
  await o.brainstorm({ project, message: 'Write me a scene where they argue.' });
  await o.brainstorm({ project, message: 'Rewrite this paragraph so it sounds less stiff.' });
  assert.equal(reads.length, 0, 'no reading call');
  assert.equal(calls.length, 0, 'no answer call: these never reach a model');
  const g = await o.brainstorm({ project, message: 'thanks!' });
  assert.equal(reads.length, 0, 'a bare greeting is not worth a reading');
  assert.equal(g.understood.by, 'rules');
});

// ── NIE never writes or edits, whoever reads the message ─────────────────────

test('a request to write that the rules missed is still declined, by the same fixed text, before any answer is generated', async () => {
  const msg = 'I was wondering if you might be able to compose the first page of my memoir for me?';
  assert.notEqual(detectIntent(msg).type, 'request-write', 'the rules alone miss this phrasing');
  const { o, calls, reads } = setup({ reading: read('write') });
  const r = await o.brainstorm({ project: projectWith(), message: msg });
  assert.equal(reads.length, 1);
  assert.equal(calls.length, 0, 'no answer call: nothing is generated for a request to write');
  assert.equal(r.reply, DECLINE_WRITE);
  assert.equal(r.declined, true);
  assert.equal(r.route, 'builtin');
  assert.deepEqual(r.understood, { by: 'model', task: 'write', topic: '' });
});

test('a request to edit that the rules missed is declined with the fixed text too', async () => {
  const msg = 'Make my villain\'s monologue sound more menacing: \'You will regret this, and I am angry about it.\'';
  const { o, calls } = setup({ reading: read('edit') });
  const r = await o.brainstorm({ project: projectWith(), message: msg });
  assert.equal(calls.length, 0);
  assert.equal(r.reply, DECLINE_EDIT);
  assert.equal(r.declined, true);
});

test('the model\'s reading is only a label: whatever else it says, nothing it says is shown to the writer', async () => {
  const { o, calls } = setup({ reading: () => '{"task":"write","topic":"The tide drew back from the harbour wall and the lamp went dark behind her while nobody stood watching at all"}' });
  const r = await o.brainstorm({ project: projectWith(), message: 'hmm can you maybe do the opening for me' });
  assert.equal(calls.length, 0);
  assert.equal(r.reply, DECLINE_WRITE);
  assert.ok(!r.reply.includes('tide'));
});

// ── the reading steers the answer ────────────────────────────────────────────

test('"more about the twist" is a conversation when the model reads it as develop, not another set of twist cards', async () => {
  const msg = 'more about the twist';
  const rules = await builtinOnly().brainstorm({ project: projectWith(), message: msg });
  assert.ok(rules.ideas.length > 0, 'the rules see the word "twist" and offer idea cards');
  const { o, calls } = setup({ reading: read('develop', 'the twist'), reply: 'The twist matters because of what it makes the reader re-read. Which scene would change most?' });
  const r = await o.brainstorm({ project: projectWith(), message: msg });
  assert.equal(r.ideas.length, 0);
  assert.equal(r.route, 'local');
  assert.equal(calls.length, 1);
  assert.match(calls[0].messages.at(-1).content, /go deeper on something already in this chat/);
});

test('an idea request read by the model still makes idea cards, with the lens the rules found', async () => {
  const { o, calls } = setup({ reading: read('ideas', 'heist twists'), reply: '1. The inside man was never inside.\n2. The vault was already empty.\n3. The getaway driver is the mark.\n\nWhich one scares you?' });
  const r = await o.brainstorm({ project: projectWith(), message: 'Give me some twists for my heist story.' });
  assert.equal(r.ideas.length, 3);
  assert.equal(r.lens, 'twist');
  assert.equal(calls.length, 1);
});

test('a general question the rules cannot place is sent to the library by the model\'s topic, and the model is told what the library holds', async () => {
  const msg = "I keep hearing about a thing where the narration slides into a character's thoughts without any tags, what's it called?";
  const { o, calls } = setup({ reading: read('craft', 'free indirect discourse'), reply: 'It is called free indirect style.' });
  const r = await o.brainstorm({ project: projectWith(), message: msg });
  assert.equal(r.intent.type, 'library-question');
  assert.deepEqual(r.understood, { by: 'model', task: 'craft', topic: 'free indirect discourse' });
  const prompt = calls[0].messages.at(-1).content;
  assert.match(prompt, /free indirect/i, 'the library entry is in the prompt');
  assert.match(prompt, /built-in library/);
});

test('a question about the writer\'s own story is not sent to the library even if it sounds general', async () => {
  const { o, calls } = setup({ reading: read('craft', 'villain'), reply: 'What does he want?' });
  const r = await o.brainstorm({ project: projectWith(), message: 'What is the best way to reveal my villain in chapter two?' });
  assert.notEqual(r.intent.type, 'library-question');
  assert.doesNotMatch(calls[0].messages.at(-1).content, /has nothing on this question/);
});

test('when the model cannot tell what is being asked, it is told to ask rather than guess', async () => {
  const { o, calls } = setup({ reading: read('unclear'), reply: 'Which part do you mean?' });
  await o.brainstorm({ project: projectWith(), message: 'that part' });
  assert.match(calls[0].messages.at(-1).content, /could not tell what the writer is asking/);
});

test('a longer message the model reads as a statement about the project updates the working premise, as a premise does', async () => {
  const { o } = setup({ reading: read('tell', 'lighthouse keeper'), reply: 'Who writes the letters?' });
  const project = projectWith();
  await o.brainstorm({ project, message: 'My lighthouse keeper starts getting letters from the sea.' });
  assert.match(project.conversation.workingPremise.summary, /lighthouse keeper/);
});

// ── questions about NIE ──────────────────────────────────────────────────────

test('with no model, "what can you do?" is answered from facts about NIE, stating exactly how NIE is answering', async () => {
  const r = await builtinOnly().brainstorm({ project: projectWith(), message: 'What can you do?' });
  assert.equal(r.intent.type, 'about-nie');
  assert.match(r.reply, /thinking partner for writers/);
  assert.match(r.reply, /never write or edit your text/);
  assert.match(r.reply, /offline language model isn't installed here/);
  assert.ok(!/library\b.*\bNIE flagged/.test(r.reply));
  assert.equal(r.route, 'builtin');
});

test('the rules recognise the usual questions about NIE, and not craft questions, requests or story text that share their words', () => {
  for (const q of ['What can you do?', 'who are you', 'Do you work offline?', 'does this work without wifi?', 'how do you work', 'are you an AI', 'Which model are you running on?', 'who made you', 'help', 'What is NIE?', 'what can you actually do for a poet?']) {
    assert.equal(detectIntent(q).type, 'about-nie', q);
  }
  for (const q of [
    'What is a narrator?', 'What are you going to do with the ending, Sam?', 'How do you write dialogue?',
    'What can you do about a sagging middle?', 'what can you do with my villain', 'how do you work out a twist', 'What do you do when a character is flat?',
    'What can you do with a flashback?', 'how do you work a twist into chapter two?', 'What do you do for a living?',
    'What can you do? Demonstrate by composing a sonnet about the sea.',
    '"What do you do for a living?" she asked. He looked at the sea for a long time before he answered, and the gulls wheeled over the harbour wall as the tide turned.',
  ]) {
    assert.notEqual(detectIntent(q).type, 'about-nie', q);
  }
});

test('a question about NIE is answered from fixed facts and the real status, never by the model, even when a model is running', async () => {
  const { o, calls } = setup({ reading: read('about-nie'), reply: 'I can write your chapters and rewrite any paragraph you like!' });
  const r = await o.brainstorm({ project: projectWith(), message: 'does this work without wifi?' });
  assert.equal(r.intent.type, 'about-nie');
  assert.equal(calls.length, 0, 'the model is not asked to describe NIE');
  assert.equal(r.route, 'builtin');
  assert.match(r.reply, /works with no internet/);
  assert.match(r.reply, /offline language model is running on this computer/, 'and the status line is the real one');
  assert.deepEqual(r.understood, { by: 'model', task: 'about-nie', topic: '' });
});

test('the question picks the facts: internet, model, privacy, Full Scan, writing, or the general description', async () => {
  const ask = async (message) => (await setup({ reading: read('about-nie') }).o.brainstorm({ project: projectWith(), message })).reply;
  assert.match(await ask('is the offline model the same as the online one or are they two different assistants'), /Qwen2\.5 3B Instruct by default/);
  assert.match(await ask('do you store my chapters anywhere or does it stay on my laptop'), /stored on this computer/);
  assert.match(await ask('what about the scan, does that need a connection'), /works with no internet/);
  assert.match(await ask('how does the full scan thing work, like what is it looking for'), /Full Scan: you set the rules/);
  assert.match(await ask('is it true you never edit my text?'), /I never write, rewrite or edit your text/);
  assert.match(await ask('what are your abilities'), /thinking partner for writers[\s\S]*Brainstorm with you/);
  for (const reply of [await ask('what are your abilities'), await ask('which model are you')]) assert.doesNotMatch(reply, /I can (?:write|rewrite|edit|draft)/i);
});

test('what NIE says about its own state matches the real state, word for word', async () => {
  const say = async (local, online = null, isOnline = () => false) => {
    const engine = new AIEngine({ local, online, isOnline });
    return (await new Orchestrator({ engine }).brainstorm({ project: projectWith(), message: 'what can you do?' })).reply;
  };
  const fake = (state, phase = null) => ({ status: () => ({ state, phase }), onStatus: () => () => {}, chat: async () => { throw new Error('not used'); } });
  assert.match(await say(null), /offline language model isn't installed here/);
  assert.match(await say(fake('starting')), /offline language model is still starting/);
  assert.match(await say(fake('starting', 'download')), /offline language model is being downloaded/);
  assert.match(await say(fake('failed')), /offline language model failed to start/);
  assert.match(await say(fake('ready')), /offline language model is running on this computer/);
  assert.match(await say(fake('ready'), { configured: true, chat: async () => '{"task":"about-nie","topic":""}' }, () => true), /online model set up in Settings/);
});

test('a model that reads a plain statement as "write" or "edit" does not get it declined: nothing in it asks for anything', async () => {
  for (const [msg, said] of [
    ['My novel is about a lighthouse keeper who starts getting letters from the sea.', 'write'],
    ['just finished chapter nine. she finally tells him about the fire. took me three weeks', 'edit'],
    ['ok great, thanks, got it', 'edit'],
    ['why does he', 'write'],
    ['...', 'edit'],
  ]) {
    const { o, calls } = setup({ reading: read(said), reply: 'Tell me more about that.' });
    const r = await o.brainstorm({ project: projectWith(), message: msg });
    assert.equal(r.declined, false, msg);
    assert.equal(calls.length, 1, `answered by the model, not declined: ${msg}`);
    assert.equal(r.understood.overruled, said, msg);
    assert.ok(['tell', 'unclear'].includes(r.understood.task), `${msg} -> ${r.understood.task}`);
  }
});

test('a model reading of write/edit is believed when the message does ask, in the ways people ask', async () => {
  for (const msg of ['can u write my speech for my sisters wedding', 'I was wondering if you might be able to compose the first page of my memoir for me?', 'pls write chapter 3', 'ok shorten it then', 'Cut this down to half the words: The meeting, which had been scheduled for early in the morning, went on for what felt like a very long time.', "is there a better way to say 'very tired'? just swap it in my sentence: He was very tired."]) {
    const { o, calls } = setup({ reading: read(/shorten|cut|swap|better way/i.test(msg) ? 'edit' : 'write') });
    const r = await o.brainstorm({ project: projectWith(), message: msg });
    assert.equal(r.declined, true, msg);
    assert.equal(calls.length, 0, msg);
  }
});

test('an unusable reading falls back to the rules, honestly, and the answer is still given', async () => {
  const { o, calls } = setup({ reading: () => 'I think they want ideas', reply: 'What does the reader expect to happen?' });
  const r = await o.brainstorm({ project: projectWith(), message: 'Does this ending feel too predictable?' });
  assert.equal(r.route, 'local');
  assert.equal(calls.length, 1);
  assert.equal(r.understood.by, 'rules');
});

test('a model that keeps failing to read is not asked again for a few messages, so it never doubles the wait, and is tried again afterwards', async () => {
  const { o, reads } = setup({ reading: () => new AIError('boom', { kind: 'network' }) });
  const project = projectWith();
  const say = (m) => o.brainstorm({ project, message: m });
  await say('Does this ending feel too predictable?');
  await say('Does this opening feel too slow?');
  assert.equal(reads.length, 2);
  for (let i = 0; i < 5; i++) await say(`Is chapter ${i + 3} too long?`);
  assert.equal(reads.length, 2, 'paused for five messages');
  const r = await say('Is the middle too long?');
  assert.equal(reads.length, 3, 'tried again after the pause');
  assert.equal(r.understood.by, 'rules');
});

test('one good reading resets the count of failures', async () => {
  let n = 0;
  const { o, reads } = setup({ reading: () => (++n % 2 ? new AIError('boom', { kind: 'network' }) : { task: 'feedback', topic: '' }) });
  const project = projectWith();
  for (let i = 0; i < 6; i++) await o.brainstorm({ project, message: `Is scene ${i} too slow?` });
  assert.equal(reads.length, 6, 'failures that are never consecutive never pause the reading');
});

test('stopping while NIE is reading the message stops the whole turn', async () => {
  const ctrl = new AbortController();
  const { o } = setup({ reading: () => { ctrl.abort(); const e = new Error('aborted'); e.kind = 'abort'; throw e; } });
  await assert.rejects(o.brainstorm({ project: projectWith(), message: 'Does this ending feel too predictable?', signal: ctrl.signal }), /aborted/);
});

test('the online model reads messages too, and no model at all means no reading call', async () => {
  const seen = [];
  const online = { configured: true, chat: async (messages, opts) => (seen.push(opts), opts.purpose === 'understand' ? '{"task":"ideas","topic":""}' : '1. A\n2. B\n3. C') };
  const engine = new AIEngine({ local: null, online, isOnline: () => true });
  const r = await new Orchestrator({ engine }).brainstorm({ project: projectWith(), message: 'any ideas for my ending?' });
  assert.equal(seen[0].purpose, 'understand');
  assert.equal(r.understood.by, 'model');
});

// ── the mapping ──────────────────────────────────────────────────────────────

test('where the model agrees with the rules the rules\' richer detail is kept; where it disagrees the model wins', () => {
  const direction = detectIntent('Actually, the cat is a spy.', { hasHistory: true });
  assert.equal(direction.type, 'direction-change');
  applyReading(direction, { task: 'tell', topic: '' }, 'Actually, the cat is a spy.');
  assert.equal(direction.type, 'direction-change', 'agreed: the direction-change cue stays');

  const mis = detectIntent('what do you think of Dickens?');
  applyReading(mis, { task: 'craft', topic: 'Dickens' }, 'what do you think of Dickens?');
  assert.equal(mis.type, 'craft-question', 'disagreed: the model\'s reading wins');
  assert.equal(mis.reading.rules, 'feedback-request', 'the rules\' own guess is kept on the record');
  assert.equal(taskOfIntent('what-if'), 'ideas');
});

// ── findings from the independent review ─────────────────────────────────────

test('Idea Board commands carry a reading too (the rules decide them, and the result says so)', async () => {
  const project = projectWith();
  const o = builtinOnly();
  const kept = await o.brainstorm({ project, message: 'remember: the cat can talk' });
  const shown = await o.brainstorm({ project, message: 'show my idea board' });
  assert.equal(kept.understood.by, 'rules');
  assert.equal(shown.understood.by, 'rules');
  assert.equal(project.conversation.messages.at(-1).understood.by, 'rules');
});

test('a tapped quick-action (a lens button) is never read by the model, so it can never be declined or redirected', async () => {
  const { o, reads, calls } = setup({ reading: read('edit'), reply: '1. The ending is a lie.\n2. Nobody survives the winter.\n3. The sea keeps count.\n\nWhich one is true?' });
  const r = await o.brainstorm({ project: projectWith(), message: 'Raise the stakes.', lens: 'stakes' });
  assert.equal(reads.length, 0, 'no reading call for a button');
  assert.equal(r.declined, false);
  assert.equal(r.ideas.length, 3);
  assert.equal(calls.length, 1);
  assert.deepEqual(r.understood, { by: 'rules', task: r.understood.task, topic: '' });
});

test('a question about the writer\'s own story that the model misreads as general stays out of the library, and the model is told it is about their project', async () => {
  for (const msg of ['Why does she hide the letter from him in act two?', 'What is the best way to reveal my villain?']) {
    const { o, calls } = setup({ reading: read('craft', 'the letter'), reply: 'What does he gain from the lie?' });
    const r = await o.brainstorm({ project: projectWith(), message: msg });
    assert.notEqual(r.intent.type, 'library-question', msg);
    const prompt = calls[0].messages.at(-1).content;
    assert.doesNotMatch(prompt, /has nothing on this question/, msg);
    assert.match(prompt, /mentions their own project/, msg);
    assert.doesNotMatch(prompt, /not about the writer's own project/, msg);
  }
});
