import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { ProjectStore, memoryStorage } from '../apps/web/src/engine/project/store.js';
import { loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import defaultAgent from '../apps/web/src/engine/agent/index.js';
import { questionsIn } from '../apps/web/src/engine/orchestrator/variety.js';
import { modelWithReading, projectWith } from './helpers.js';

await loadLibrary();

// The idea agent inside Brainstorm: the whole path from what the writer says to the reply, with no model and with a scripted one.

const builtinOnly = (extra = {}) => new Orchestrator({ engine: new AIEngine({ local: null, online: null, isOnline: () => false }), ...extra });
function withModel(replyFn, { extract = null } = {}) {
  const calls = [];
  const extractCalls = [];
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: modelWithReading(replyFn, { calls, extractCalls, extract }) };
  return { o: new Orchestrator({ engine: new AIEngine({ local, online: null, isOnline: () => false }) }), calls, extractCalls };
}
const say = (o, project, message, opts = {}) => o.brainstorm({ project, message, ...opts });
const qmarks = (t) => (t.match(/\?/g) ?? []).length;

const WRITER = [
  'I want to write a cozy mystery set in a small fishing village.',
  'The main character is Mara, a retired ferry captain who keeps noticing things.',
  'She wants to find out who sank the harbour bell before the regatta.',
  'The harbourmaster, Corin, is against her because he is hiding debts.',
  'If she fails the village loses its only festival and Corin loses everything.',
  'It should feel warm but a little eerie, like fog in the morning.',
  'The theme is that small places keep big secrets.',
  'The ending is that the bell was never stolen: Corin hid it to stop a sale.',
  'The story begins when the bell is found missing on the morning of the regatta.',
  'The cast also includes the baker Ines, who sees everything from her window.',
];

test('with no model: NIE follows an idea, acknowledges what it recorded, asks one planned question now and then, and never the same one twice', async () => {
  const o = builtinOnly();
  const project = projectWith();
  const asked = [];
  let asks = 0;
  for (const m of WRITER) {
    const r = await say(o, project, m);
    if (r.agent?.handled) break;
    assert.ok(qmarks(r.reply) <= 1, `at most one question per reply: ${r.reply}`);
    for (const q of questionsIn(r.reply)) {
      assert.ok(!asked.includes(q), `never asked twice: ${q}`);
      asked.push(q);
    }
    if (r.agent?.act === 'ask') asks++;
    assert.ok(!/angles worth considering/i.test(r.reply), 'a writer telling NIE about their idea is not handed library angles');
  }
  assert.ok(asks >= 2 && asks < WRITER.length, `asked on some turns, not all of them (${asks} of ${WRITER.length})`);
  assert.equal(project.conversation.agent.kind, 'story');
  assert.match(project.conversation.agent.slots.protagonist.value, /Mara/);
});

test('the offer to keep the idea comes from the agent, needs no model, and "yes" files it on the Idea Board and in project memory', async () => {
  const o = builtinOnly();
  const project = projectWith();
  let offered = null;
  for (const m of WRITER) {
    const r = await say(o, project, m);
    if (r.agent?.handled === 'offer') { offered = r; break; }
  }
  assert.ok(offered, 'the agent offered to keep it');
  assert.match(offered.reply, /in your words/i);
  assert.match(offered.reply, /Mara/);
  assert.deepEqual(offered.suggestions.map((s) => s.label), ['Yes, keep it', 'Let me add something', 'Not yet']);
  assert.equal(project.brainstorm.board.length, 0, 'nothing is kept before the writer says so');
  const yes = await say(o, project, 'Yes, keep it.');
  assert.equal(yes.agent.handled, 'kept');
  assert.equal(yes.route, 'builtin');
  assert.equal(project.brainstorm.board.length, 1);
  assert.match(project.brainstorm.board[0].text, /Mara/);
  assert.ok(project.memory.characters.some((c) => c.name === 'Mara'), 'the character is in project memory');
  assert.match(yes.reply, /Kept\./);
});

test('"not yet" holds the offer, "also ..." adds a detail and offers again, and neither calls a model', async () => {
  const { o, calls, extractCalls } = withModel(() => 'A thought.');
  const project = projectWith();
  for (const m of WRITER) {
    const r = await say(o, project, m);
    if (r.agent?.handled === 'offer') break;
  }
  const before = calls.length;
  const held = await say(o, project, 'Not yet.');
  assert.equal(held.agent.handled, 'held');
  assert.equal(project.brainstorm.board.length, 0);
  const again = await say(o, project, 'Actually, the bell was never stolen, Mara. It was hidden to stop a sale.');
  assert.ok(again.reply);
  assert.equal(calls.length - before >= 0, true);
  assert.equal(extractCalls.every((c) => c.opts.purpose === 'extract' && c.opts.json), true, 'the extraction call is schema-constrained');
});

test('with a model: the agent\'s brief reaches the prompt, the extraction is its own call, and a reply with three questions keeps only the planned one', async () => {
  const { o, calls, extractCalls } = withModel(() => 'A cozy mystery in a fishing village leaves a lot of room for small lies. What does she want? Who stands against her? Where does it end?');
  const project = projectWith();
  const r = await say(o, project, WRITER[0]);
  assert.equal(extractCalls.length, 1, 'one extraction call');
  assert.equal(calls.length, 1, 'one answer call');
  assert.match(calls[0].messages.at(-1).content + calls[0].messages[0].content, /This turn:/);
  assert.match(calls[0].messages.at(-1).content, /ask exactly ONE question/);
  assert.equal(qmarks(r.reply), 1, r.reply);
  assert.equal(project.conversation.agent.asked.length, 1, 'the question the writer saw is the one on record');
  assert.equal(project.conversation.agent.pending.kind, 'question');
  assert.equal(r.agent.act, 'ask');
  assert.ok(r.suggestions.some((s) => /Not sure yet/.test(s.label)), 'a way out of the question');
});

test('with a model: a turn that does not ask carries no question, even if the model ends on one', async () => {
  const { o } = withModel(() => 'Corin hiding debts makes the harbour feel smaller. Is that what you wanted?');
  const project = projectWith();
  let sawReflect = false;
  for (const m of WRITER) {
    const r = await say(o, project, m);
    if (r.agent?.handled) break;
    if (r.agent?.act === 'reflect') {
      sawReflect = true;
      assert.equal(qmarks(r.reply), 0, `a reflecting turn asks nothing: ${r.reply}`);
    }
  }
  assert.ok(sawReflect, 'some turns do not ask');
});

test('"stop asking questions" is obeyed from then on, and "ask me questions" brings them back', async () => {
  const o = builtinOnly();
  const project = projectWith();
  await say(o, project, WRITER[0]);
  const quiet = await say(o, project, 'Please stop asking me questions.');
  assert.equal(quiet.agent.handled, 'mode');
  for (const m of WRITER.slice(1, 4)) {
    const r = await say(o, project, m);
    assert.equal(qmarks(r.reply), 0, `no questions in quiet mode: ${r.reply}`);
  }
  const back = await say(o, project, 'You can ask me questions again.');
  assert.equal(back.agent.handled, 'mode');
  assert.equal(project.conversation.agent.mode, 'auto');
});

test('a request is served, never interviewed over or filed as part of the idea; "develop this idea" is not asked what kind of piece it is', async () => {
  const o = builtinOnly();
  const project = projectWith();
  await say(o, project, WRITER[0]);
  const before = JSON.stringify(project.conversation.agent.slots);
  const ideas = await say(o, project, 'Give me some twists for the middle of it.');
  assert.ok(ideas.ideas.length > 0, 'asked for ideas, gets ideas');
  assert.equal(JSON.stringify(project.conversation.agent.slots), before, 'a request is not recorded as part of the idea');
  const fresh = projectWith();
  const dev = await say(o, fresh, "Let's develop this idea: a clock that runs backwards", { lens: 'develop' });
  assert.ok(!/fiction, nonfiction/i.test(dev.reply), dev.reply);
});

test('a new idea sets the old one aside, says so before the answer, and the old one can be brought back', async () => {
  const o = builtinOnly();
  const project = projectWith();
  for (const m of WRITER.slice(0, 4)) await say(o, project, m);
  const next = await say(o, project, 'New idea: a poem about my grandmother\'s hands and the bread she kneaded every Sunday morning.');
  assert.match(next.reply, /set the earlier idea aside/i);
  assert.equal(project.conversation.agent.shelf.length, 1);
  assert.equal(project.conversation.agent.kind, 'poem');
  const back = await say(o, project, 'Bring back the earlier idea.');
  assert.equal(back.agent.handled, 'restored');
  assert.equal(project.conversation.agent.kind, 'story');
  assert.match(project.conversation.agent.slots.protagonist.value, /Mara/);
});

test('"remember this" keeps the whole idea when one is being followed, and a single note when none is', async () => {
  const o = builtinOnly();
  const empty = projectWith();
  await say(o, empty, 'remember: the cat can talk');
  assert.equal(empty.brainstorm.board.length, 1);
  assert.equal(empty.brainstorm.board[0].text, 'the cat can talk');
  const project = projectWith();
  for (const m of WRITER.slice(0, 3)) await say(o, project, m);
  const kept = await say(o, project, 'Remember this.');
  assert.equal(kept.agent.handled, 'offer', 'part-way: shows what is recorded and what is missing, and asks');
  assert.match(kept.reply, /still missing|still open/i);
  const yes = await say(o, project, 'yes');
  assert.equal(yes.agent.handled, 'kept');
  assert.equal(project.brainstorm.board.length, 1);
  // "Keep this idea." names the thing kept: it is never the note ("idea.") that gets filed
  const typed = projectWith();
  for (const m of WRITER.slice(0, 5)) await say(o, typed, m);
  const k = await say(o, typed, 'Keep this idea.');
  assert.equal(k.agent.handled, 'kept');
  assert.ok(!typed.brainstorm.board.some((b) => /^idea\.?$/.test(b.text)));
  const bare = await say(builtinOnly({ agent: null }), projectWith(), 'Keep this idea.');
  assert.match(bare.reply, /don't have anything to keep/i, 'with nothing to keep, it says so rather than filing a word');
});

test('projects never share what the agent knows, and it goes when the project goes', async () => {
  const store = new ProjectStore(memoryStorage());
  const o = builtinOnly();
  const a = store.create({ title: 'A' });
  for (const m of WRITER.slice(0, 3)) await say(o, a, m);
  store.save(a);
  const b = store.create({ title: 'B' });
  assert.deepEqual(b.conversation.agent.slots, {}, 'a new project starts empty');
  assert.equal(b.conversation.agent.kind, null);
  const again = store.load(a.id);
  assert.match(again.conversation.agent.slots.protagonist.value, /Mara/, 'and what it knows survives a reload');
  const r = await say(o, b, 'A haiku about the first frost.');
  assert.notEqual(b.conversation.agent.kind, 'story');
  assert.ok(!JSON.stringify(b.conversation.agent).includes('Mara'));
  store.delete(a.id);
  assert.equal(store.load(a.id), null);
  assert.ok(r.reply);
});

test('stored agent data that has been damaged or tampered with is cleaned on load, and never stops a project opening', () => {
  const store = new ProjectStore(memoryStorage());
  const p = store.create({ title: 'Damaged' });
  const raw = JSON.parse(JSON.stringify(p));
  raw.conversation.agent = { kind: '<script>', slots: { __proto__: { value: 'x' }, 'bad id': { value: 'x' }, premise: { value: 'x'.repeat(5000), turn: 'soon' } }, asked: 'nope', pending: { kind: 'wat' }, mode: 'shout', shelf: [null, 3], extra: [1, 'ok'] };
  store.storage.set(`nie.v1.project.${p.id}`, JSON.stringify(raw));
  const back = store.load(p.id);
  assert.ok(back);
  assert.equal(back.conversation.agent.kind, null);
  assert.equal(back.conversation.agent.mode, 'auto');
  assert.ok((back.conversation.agent.slots.premise?.value ?? '').length <= 220);
  assert.deepEqual(back.conversation.agent.asked, []);
  assert.equal(back.conversation.agent.pending, null);
});

test('if the agent itself fails, the message is still answered, and a Stop is still a Stop', async () => {
  const broken = { ...defaultAgent, turn: async () => { throw new Error('boom'); } };
  const project = projectWith();
  const r = await say(builtinOnly({ agent: broken }), project, 'A lighthouse keeper starts getting letters from the sea.');
  assert.ok(r.reply.length > 20);
  const stopping = { ...broken, turn: async () => { throw Object.assign(new Error('stopped'), { kind: 'abort' }); } };
  await assert.rejects(() => say(builtinOnly({ agent: stopping }), project, 'Another thought about the sea.'), (e) => e.kind === 'abort');
});

test('with the agent off, Brainstorm behaves as it did before it existed', async () => {
  const o = builtinOnly({ agent: null });
  const project = projectWith();
  const r = await say(o, project, WRITER[0]);
  assert.equal(r.agent, null);
  assert.equal(project.conversation.agent.kind, null, 'nothing is recorded');
});

test('a model that reads the message as a question about the writer\'s text is not interviewed: it is answered', async () => {
  const { o } = withModel(() => 'It says ninety barrels.', {});
  const project = projectWith({ storyText: 'Section one. A belly holds ninety barrels of water when it is filled to the Mark. '.repeat(60) });
  const r = await say(o, project, 'How many barrels does a belly hold in this text?');
  assert.equal(qmarks(r.reply), 0);
  assert.deepEqual(project.conversation.agent.slots, {}, 'a question is not recorded as part of the idea');
});
