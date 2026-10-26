import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator, holdToPlan } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { DECLINE_WRITE, DECLINE_WRITE_AGAIN } from '../apps/web/src/engine/orchestrator/builtin.js';
import { holdSmallTalk } from '../apps/web/src/engine/orchestrator/smalltalk.js';
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

test('"yeah exactly" after NIE spoke is a conversation about what it said, whatever the small model labelled it', async () => {
  for (const label of ['unclear', 'tell', 'chat']) {
    const { o, calls } = setup({ reading: task(label), reply: 'Then the keeper is not the only one who knows. What if the harbour master has been reading her tables for years?' });
    const project = projectWith();
    project.conversation.messages.push({ role: 'user', content: 'a lighthouse keeper who forges tide tables' }, { role: 'assistant', content: 'Whoever relies on those tables is trusting her without knowing it.' });
    const r = await o.brainstorm({ project, message: 'yeah exactly' });
    assert.equal(r.understood.task, 'develop', label);
    assert.equal(r.understood.overruled, label);
    assert.doesNotMatch(calls.at(-1).messages.at(-1).content, /could not tell what the writer is asking/);
    assert.match(calls.at(-1).messages.at(-1).content, /Whoever relies on those tables/);
  }
});

test('an answer asks at most one question, and a message about feeling stuck is met by a person first', async () => {
  const { o, calls } = setup({ reading: task('develop'), reply: 'That would change what the keeper risks. Who else reads the tables? How would she know? What would she do then?' });
  const project = projectWith();
  project.conversation.messages.push({ role: 'user', content: 'a lighthouse keeper who forges tide tables' }, { role: 'assistant', content: 'Whoever relies on those tables is trusting her without knowing it.' });
  const r = await o.brainstorm({ project, message: 'can you say more about that?' });
  assert.equal((r.reply.match(/\?/g) ?? []).length, 1, r.reply);
  const stuck = await o.brainstorm({ project: projectWith(), message: "I'm completely stuck on my story and I don't know where to go with it" });
  assert.ok(stuck.reply);
  assert.match(calls.at(-1).messages.at(-1).content, /Begin with one short, human sentence/);
});

test('library notes in a story conversation are only craft that bears on it: no citation rules next to a lighthouse keeper, a heist gets its structure', () => {
  const { o } = setup();
  const project = projectWith();
  const names = (text) => o.storyNotes(project, text).map((e) => `${e.kind}:${e.name}`);
  for (const text of ['a lighthouse keeper forging tide tables', 'retired surgeon what should she want most', 'hey', 'the second one is interesting why would that work', 'hmm that feels a bit obvious']) {
    const found = o.storyNotes(project, text);
    assert.ok(found.length <= 4, text);
    assert.ok(found.every((e) => ['technique', 'structure', 'genre', 'form', 'movement'].includes(e.kind)), `${text}: ${names(text)}`);
    assert.ok(!found.some((e) => /Reference entry|Doctor, Mister|Mr, Mrs|Syllogism|Apposition/.test(e.name)), `${text}: ${names(text)}`);
  }
  assert.deepEqual(o.storyNotes(project, 'hey'), []);
  assert.ok(names('heist twist').some((n) => /Heist structure/.test(n)), names('heist twist').join(' | '));
});

test('a sentence that credits the writer with NIE\'s own idea ("the second twist you mentioned") goes; one that quotes what they really said stays', () => {
  const agentTurn = { enforce: (t) => t, grounded: () => true, ack: 'Noted.' };
  const plan = { act: 'serve', reason: 'question' };
  const said = 'the second one is interesting. why would that work?';
  const writer = ['I have a heist story: four friends rob the museum where one of them works.'];
  const bad = holdToPlan('The second twist you mentioned is interesting because it hands the vault to a hidden artifact with mind-control powers. It works because the friends no longer know who to trust.', plan, agentTurn, said, writer);
  assert.doesNotMatch(bad, /you mentioned/);
  assert.match(bad, /no longer know who to trust/);
  const good = holdToPlan('You said four friends rob the museum where one of them works. That puts the betrayal inside the group, which is why a mole twist lands.', plan, agentTurn, said, writer);
  assert.match(good, /You said four friends rob the museum/);
});

test('filler such as "Sounds intriguing." is not kept as an answer, and a hello is not answered with the writer\'s own sentences or with a question about the story after a thank-you', async () => {
  const { holdSmallTalk } = await import('../apps/web/src/engine/orchestrator/smalltalk.js');
  const project = projectWith();
  const past = [{ role: 'user', content: "I'm writing a mystery set on a night train. The conductor vanishes between two stations." }];
  assert.equal(holdSmallTalk("You're welcome. Sounds intriguing. How does the train's atmosphere influence the passengers' interactions?", { project, text: 'thanks!', past }), "You're welcome.");
  assert.equal(holdSmallTalk("I'm writing a mystery set on a night train. The conductor vanishes between two stations.", { project, text: 'hey, back again', past }), '');
  assert.equal(holdSmallTalk('Welcome back. Want to pick up the night train?', { project, text: 'hey, back again', past }), 'Welcome back. Want to pick up the night train?');
});

// ── round three, from the second judge ────────────────────────────────────────

test('"give me a few directions" is a request for ideas whatever a small model calls it', async () => {
  const { o } = setup({ reading: task('develop'), reply: '1. The translator is the only one who hears the edit.\n\n2. The speech is true and the lie is hers.\n\n3. Her interpreter booth is bugged.' });
  const r = await o.brainstorm({ project: projectWith(), message: 'give me a few directions' });
  assert.equal(r.understood.task, 'ideas');
  assert.equal(r.understood.overruled, 'develop');
  assert.equal(r.ideas.length, 3);
});

test('the human line for a writer with nothing yet is said to them and is not put in the model\'s prompt', async () => {
  const { o, calls } = setup({ reading: task('write'), reply: '1. A town where the clocks disagree.\n\n2. A letter that arrives forty years late.\n\n3. Two siblings who inherit a lie.' });
  const r = await o.brainstorm({ project: projectWith(), message: "I want to write something but I don't know what yet" });
  assert.match(r.lead, /pressure|know yet|Nobody knows/);
  assert.doesNotMatch(calls.at(-1).messages.at(-1).content, /pressure to have it figured out|You don't have to know yet|Nobody knows what they're writing/);
});

test('after small talk, "yeah" is still small talk, not a comment on a story that does not exist', async () => {
  const { o, calls } = setup({ reading: task('unclear'), reply: 'Fair enough. Take your time.' });
  const project = projectWith();
  const first = await o.brainstorm({ project, message: "I'm so tired today and I can't focus" });
  assert.equal(first.agent?.act, 'chat');
  const before = calls.length;
  const r = await o.brainstorm({ project, message: 'yeah' });
  assert.equal(r.agent?.act, 'chat');
  assert.equal(r.understood.task, 'chat');
  assert.match(calls.at(-1).messages.at(-1).content, /small talk/);
  assert.ok(calls.length > before);
});

test('a hello is not answered with a recap of the project, and a reaction is answered in a few sentences without repeating what NIE already said', () => {
  const project = projectWith();
  const past = [{ role: 'user', content: "I'm writing a mystery set on a night train. The conductor vanishes between two stations." }];
  assert.equal(holdSmallTalk('Got it. You\'re writing a mystery set on a night train where the conductor vanishes between two stations.', { project, text: 'ok cool', past }), '');
  assert.equal(holdSmallTalk("Glad to be back. You're crafting a mystery aboard a night train, with the conductor's disappearance at its heart.", { project, text: 'hey, back again', past }), 'Glad to be back.');
  const agentTurn = { enforce: (t) => t, grounded: () => true, ack: 'Noted.' };
  const recent = ["What if Marta's biggest wish is to heal from the mistake that cost her her license, but she struggles to express it?"];
  const out = holdToPlan("What if Marta's biggest wish is to heal from the mistake that cost her her license, but she struggles to admit it? Maybe the only person she would tell is the patient she lost. You could let a letter go unsent.", { act: 'reflect', reason: 'gap' }, agentTurn, "she'd never admit it though", ["Marta, a retired surgeon who lost her license after a mistake"], { recent });
  assert.doesNotMatch(out, /biggest wish/);
  assert.match(out, /Maybe the only person she would tell/);
  const long = holdToPlan('One. Two is here now. Three comes after that. Four arrives next. Five follows it. Six ends everything.', { act: 'serve', reason: 'question' }, agentTurn, 'yes', [], { maxSentences: 4 });
  assert.equal(long.split(/(?<=\.)\s/).length, 4);
});

test('a writer who says they are stuck is met by a person before the question', async () => {
  const { o } = setup({ reading: task('develop'), reply: 'Which came first for you: a person you could not stop thinking about, or a situation you wanted to see play out?' });
  const r = await o.brainstorm({ project: projectWith(), message: "I'm completely stuck on my story and I don't know where to go with it" });
  assert.match(r.reply, /^(?:That's a frustrating place|Stuck is miserable|That's a hard spot)/);
  assert.match(r.reply, /\?$/, 'and then one question');
  assert.equal((r.reply.match(/\?/g) ?? []).length, 1);
});

test('"You mentioned ..." right after they said it is an echo and goes; a question that shares only "story" and "character" with the session is replaced', async () => {
  const agentTurn = { enforce: (t) => t, grounded: () => true, ack: 'Noted.' };
  const said = "I'm writing about a lighthouse keeper who forges tide tables.";
  const out = holdToPlan('You mentioned the lighthouse keeper forges tide tables. The forging is the whole secret. Who relies on those tables?', { act: 'ask', reason: 'core' }, agentTurn, said, []);
  assert.doesNotMatch(out, /You mentioned/);
  assert.match(out, /The forging is the whole secret/);
  const { default: agent } = await import('../apps/web/src/engine/agent/index.js');
  const { enforceReply } = await import('../apps/web/src/engine/agent/ask.js');
  const { emptyAgentState } = await import('../apps/web/src/engine/agent/state.js');
  const state = { ...emptyAgentState(), kind: 'story' };
  const plan = { act: 'ask', slot: 'premise', question: { text: 'Which came first for you: a person you could not stop thinking about, or a situation you wanted to see play out?', type: 'either' } };
  const fixed = enforceReply("That sounds really challenging. How does that moment connect to your main character's desire and the stakes of the story?", plan, { state, ctx: agent.ctx, askedTexts: [], terms: new Set(['story', 'stuck', 'complet']) });
  assert.match(fixed.text, /Which came first for you/);
});

test('an ask turn keeps one question, the planned one at the end, and drops "In your description, you mention ..."', async () => {
  const { default: agent } = await import('../apps/web/src/engine/agent/index.js');
  const project = projectWith();
  const msg = 'I am writing about a girl who can hear the dead.';
  const t = await agent.turn({ project, message: msg, reading: { task: 'develop' }, recentMessages: [] });
  assert.equal(t.plan.act, 'ask');
  const out = holdToPlan('In your description, you mention "a girl". What is her name? What does she look like?', t.plan, t, msg, [msg], {});
  assert.doesNotMatch(out, /In your description/);
  assert.equal((out.match(/\?/g) ?? []).length, 1, out);
  assert.match(out, new RegExp(t.plan.question.text.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('the memory answer lists what the writer said once, and says which message it came from', async () => {
  const { o } = setup({ reading: task('tell') });
  const project = projectWith();
  await o.brainstorm({ project, message: 'I am writing about a girl who can hear the dead.' });
  await o.brainstorm({ project, message: 'she hides it from her mother' });
  const r = await o.brainstorm({ project, message: 'do you remember what my story is about?' });
  assert.equal((r.reply.match(/girl who can hear the dead/g) ?? []).length, 1, r.reply);
  assert.match(r.reply, /you said, one message ago|you said, 2 messages ago/);
  assert.doesNotMatch(r.reply, /Main character: girl/);
});

// ── from the first held-out set (conversations nobody had tuned on) ───────────

test('a thank-you with a tail, and a message of discouragement, are small talk by the rules; neither is answered with "what are you making?"', async () => {
  const { detectIntent } = await import('../apps/web/src/engine/intent/intent.js');
  for (const t of ["thanks that's all for today", "ok i'll try it, thanks", 'thanks for the help', 'just got another rejection letter', "i dont think i'm any good at this", 'ok great, thanks, got it']) assert.equal(detectIntent(t, { hasHistory: true }).type, 'greeting', t);
  for (const t of ['thanks, now give me twists', 'thanks. what about the ending?', 'thank you, can you check my draft', 'my rejection letter said the plot was thin']) assert.notEqual(detectIntent(t, { hasHistory: true }).type, 'greeting', t);
  const { o, calls } = setup({ reading: task('tell'), reply: 'Rejections sting, and one letter says little about you. What did it say, if you want to tell me?' });
  const r = await o.brainstorm({ project: projectWith(), message: "i dont think i'm any good at this" });
  assert.equal(r.agent?.act, 'chat');
  assert.match(calls.at(-1).messages.at(-1).content, /Do not agree with a harsh thing they say about themselves/);
  assert.doesNotMatch(r.reply, /fiction, nonfiction|story, a poem/);
});

test('a note only enters when the message uses a word of its name; the prompt\'s own labels are never said back; praise of two words is praise', async () => {
  const { o } = setup();
  const project = projectWith();
  assert.deepEqual(o.storyNotes(project, 'which would you pick?'), []);
  const agentTurn = { enforce: (t) => t, grounded: () => true, ack: 'Noted.' };
  const out = holdToPlan("From the notes, it seems you're exploring writing techniques. Maybe the poem never names her at all.", { act: 'reflect', reason: 'gap' }, agentTurn, 'which would you pick?', []);
  assert.doesNotMatch(out, /From the notes/);
  assert.match(out, /never names her/);
  const { isPraiseOpener } = await import('../apps/web/src/engine/orchestrator/variety.js');
  for (const s of ['Great shift!', 'Great insights!']) assert.ok(isPraiseOpener(s), s);
  for (const s of ['Great Britain is where the story starts.', 'Perfect pitch is the problem.']) assert.ok(!isPraiseOpener(s), s);
});

test('"which is better?" and "what do you think of the name?" are told to give a view with a reason', async () => {
  const { o, calls } = setup({ reading: task('develop'), reply: 'I would go with the town that shares one dream: it gives you a whole community to write about, where a cat is a single image.' });
  await o.brainstorm({ project: projectWith(), message: 'two ideas: a cat that predicts deaths, or a town where everyone shares one dream. which is better?' });
  assert.match(calls.at(-1).messages.at(-1).content, /asking what YOU think/);
  const { opinionNote } = await import('../apps/web/src/engine/orchestrator/replyto.js');
  assert.match(opinionNote('what do you think of the name Elias for a lighthouse keeper?'), /honest view/);
  assert.equal(opinionNote('the second one is interesting'), '');
});

test('a thank-you, a goodbye or "ok cool" is not answered with a remark on the story', async () => {
  const project = projectWith();
  const past = [{ role: 'user', content: "I'm writing a mystery set on a night train. The conductor vanishes between two stations." }];
  assert.equal(holdSmallTalk('The mystery deepens without the conductor.', { project, text: 'ok cool', past }), '');
  assert.equal(holdSmallTalk('Glad to help. Come back whenever you like.', { project, text: 'thanks', past }), 'Glad to help. Come back whenever you like.');
});

// ── from the second held-out set (nobody had tuned on it) ─────────────────────

test('"no, not a romance please" is a boundary, not an edit request; a trailing please asks for nothing, a real request with please still does', async () => {
  const { looksLikeARequest } = await import('../apps/web/src/engine/orchestrator/understand.js');
  for (const t of ['no, not a romance please', 'not so dark please']) assert.equal(looksLikeARequest(t), false, t);
  for (const t of ['please write chapter 3', 'write it please', 'Could you tighten this, please?', 'shorten it please']) assert.equal(looksLikeARequest(t), true, t);
  const { o, calls } = setup({ reading: task('edit'), reply: 'No romance, then. What if they have to trust each other because the snow leaves no choice?' });
  const r = await o.brainstorm({ project: projectWith(), message: 'no, not a romance please' });
  assert.equal(r.declined, false);
  assert.ok(calls.length >= 1);
});

test('"thanks, bye for now" is a goodbye; a name is asked for and gets directions, not a coined name; a repeated sentence is said once; "i hate my protagonist" is met as a feeling', async () => {
  const { detectIntent } = await import('../apps/web/src/engine/intent/intent.js');
  assert.equal(detectIntent('thanks, bye for now', { hasHistory: true }).type, 'greeting');
  const { namingNote } = await import('../apps/web/src/engine/orchestrator/replyto.js');
  assert.match(namingNote('what should I call the port?'), /Do not make one up/);
  assert.equal(namingNote('the first one is a trading port'), '');
  const agentTurn = { enforce: (t) => t, grounded: () => true, ack: 'Noted.' };
  const named = holdToPlan('A name can lean on the trade or on the river. How about "Port Luminaire"? Which direction feels closer?', { act: 'serve', reason: 'question' }, agentTurn, 'what should I call the port?', []);
  assert.doesNotMatch(named, /Port Luminaire/);
  const twice = holdToPlan('Say what you would lose. What if you had never written about this: what would stay unsaid? What if you had never written about this: what would stay unsaid?', { act: 'serve', reason: 'question' }, agentTurn, 'x', []);
  assert.equal((twice.match(/what would stay unsaid/g) ?? []).length, 1, twice);
  const { isLowMood } = await import('../apps/web/src/engine/orchestrator/smalltalk.js');
  assert.ok(isLowMood('i hate my protagonist'));
});

test('every planned "what are you making?" question survives the checks on a reply (one of them says "you describe" and was being taken for a sentence that credits the writer)', async () => {
  const { default: agent } = await import('../apps/web/src/engine/agent/index.js');
  const { KIND_QUESTIONS } = await import('../apps/web/src/engine/agent/plan.js');
  const msg = 'A homeless man befriends a cat.';
  const seen = new Set();
  for (let i = 0; i < 200 && seen.size < KIND_QUESTIONS.length; i++) {
    const project = projectWith();
    const t = await agent.turn({ project, message: msg, reading: { task: 'tell' }, recentMessages: [] });
    if (t.plan.act !== 'ask' || t.plan.reason !== 'kind') continue;
    seen.add(t.plan.question.text);
    const out = holdToPlan('Tell me more about who he is.', t.plan, t, msg, [msg], {});
    assert.ok(out.includes(t.plan.question.text), `kept: ${t.plan.question.text}`);
  }
  assert.ok(seen.size >= 5, `saw ${seen.size} of the kind questions`);
});
