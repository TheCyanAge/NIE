import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator, holdToPlan } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { isSuggestion } from '../apps/web/src/engine/agent/ask.js';
import { kindOfReply, numberedItems, pickedItem, replyContext } from '../apps/web/src/engine/orchestrator/replyto.js';
import { loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { modelWithReading, projectWith } from './helpers.js';

await loadLibrary();

const LIST = 'Here are three directions:\n1. The forged tables send a ship onto the rocks.\n2. Someone is paying her to forge them.\n3. The keeper starts to believe the false tides.\nWhich one pulls you?';

// ── what a short message is a reply to ────────────────────────────────────────

test('numbered ideas are found, and "the second one", "number 3" and "that last one" pick the right one', () => {
  assert.deepEqual(numberedItems(LIST).map((i) => i.n), [1, 2, 3]);
  assert.match(pickedItem('the second one is interesting. why would that work?', LIST).text, /paying her/);
  assert.match(pickedItem('number 3', LIST).text, /false tides/);
  assert.match(pickedItem('I like that last one', LIST).text, /false tides/);
  assert.match(pickedItem('#1 please', LIST).text, /ship onto the rocks/);
  assert.equal(pickedItem('go back to the first thing you said', LIST), null, '"the first thing you said" is not "idea 1"');
  assert.equal(pickedItem('the second time she lies', LIST), null);
  assert.equal(pickedItem('the second one', 'Just one thought: what if the tide tables lie?'), null, 'no list, nothing to pick');
});

test('a reply is told apart: picking, going back, pushing back, asking why, agreeing', () => {
  const kinds = {
    'go back to the first thing you said': 'go-back',
    "that's cliché": 'pushback',
    'hmm that feels a bit obvious': 'pushback',
    'too political': 'pushback',
    'can you say more about that?': 'explain',
    'why would that work': 'explain',
    yes: 'agree',
    'I like it': 'agree',
    'and her daughter?': 'follow',
  };
  for (const [text, kind] of Object.entries(kinds)) assert.equal(kindOfReply(text, 'Just one thought.'), kind, text);
  assert.equal(kindOfReply('the second one is interesting. why would that work?', LIST), 'pick');
  assert.equal(kindOfReply('the second one is interesting. why would that work?', 'Just one thought.'), 'explain', 'with no list to pick from it is a question about what NIE said');
});

test('replyContext shows NIE\'s last words and which idea was meant; nothing for a first message, a long message, or when the writer spoke last', () => {
  const past = [{ role: 'user', content: 'a lighthouse keeper forging tide tables' }, { role: 'assistant', content: LIST }];
  const note = replyContext({ text: 'the second one is interesting. why would that work?', past });
  assert.match(note, /reply to what you said last/);
  assert.match(note, /Here are three directions/);
  assert.match(note, /number 2 of your list: "Someone is paying her to forge them\."/);
  assert.match(replyContext({ text: "that's cliché", past }), /pushing back/);
  assert.match(replyContext({ text: 'can you say more about that?', past }), /explain what you said/);
  assert.equal(replyContext({ text: 'hello', past: [] }), '');
  assert.equal(replyContext({ text: 'hello', past: [{ role: 'user', content: 'x' }] }), '');
  assert.equal(replyContext({ text: Array.from({ length: 30 }, () => 'word').join(' '), past }), '');
});

test('the note reaches the model in the turn it belongs to, and only there', async () => {
  const calls = [];
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: modelWithReading((m) => (calls.push(m), 'Because someone else benefits from the lie, the keeper is never alone in it.'), { reading: () => ({ task: 'develop', topic: '' }) }) };
  const o = new Orchestrator({ engine: new AIEngine({ local, online: null, isOnline: () => false }) });
  const project = projectWith();
  project.conversation.messages.push({ role: 'user', content: 'a lighthouse keeper forging tide tables' }, { role: 'assistant', content: LIST });
  await o.brainstorm({ project, message: 'the second one is interesting. why would that work?' });
  const last = calls.at(-1).at(-1).content;
  assert.match(last, /number 2 of your list/);
  assert.ok(last.indexOf('number 2 of your list') < last.indexOf('the second one is interesting'), 'before the message, which stays last');
  const first = projectWith();
  await o.brainstorm({ project: first, message: 'a heist on a floating casino' });
  assert.doesNotMatch(calls.at(-1).at(-1).content, /reply to what you said last/, 'nothing to reply to yet');
});

// ── a turn that does not ask may carry a suggestion ───────────────────────────

test('what is a suggestion: "What if...", "You could...", "Maybe...", "One angle:..."', () => {
  for (const s of ['What if the tables are the only record of a drowned village?', 'You could let her get caught once.', 'Maybe the forger is the one being forged.', 'One angle: she is paid by both sides.', 'And what if nobody checks?']) assert.ok(isSuggestion(s), s);
  for (const s of ['What does she want most?', 'The tides are her whole life.', 'Her eyes fix on the last glimpse of the smokestacks.']) assert.ok(!isSuggestion(s), s);
});

const grounded = (words) => (s) => !/smokestack|silent gratitude/i.test(s) && words.some((w) => s.toLowerCase().includes(w));
const turn = (extra = {}) => ({ enforce: (t) => t, grounded: grounded(['tide', 'keeper', 'tables']), ack: 'Noted under premise: a lighthouse keeper.', ...extra });

test('a turn that does not ask keeps its suggestion (even as a "what if" with a question mark) and drops a real question and invented imagery', () => {
  const plan = { act: 'reflect', reason: 'gap' };
  const out = holdToPlan('The tide tables are the keeper\'s whole trade. What if one wrong number sends a ship onto the rocks? Her eyes fix on the last glimpse of the smokestacks. What does she want?', plan, turn(), 'a keeper forges tide tables');
  assert.match(out, /tide tables are the keeper's whole trade/);
  assert.match(out, /What if one wrong number sends a ship onto the rocks\?/);
  assert.doesNotMatch(out, /smokestack/);
  assert.doesNotMatch(out, /What does she want/);
});

test('a suggestion that quotes a line of dialogue is cut; a turn left with nothing says what it recorded instead', () => {
  const plan = { act: 'reflect', reason: 'gap' };
  assert.equal(holdToPlan('What if she says "I never meant for the ship to sink, not ever"?', plan, turn(), ''), 'Noted under premise: a lighthouse keeper.');
  assert.equal(holdToPlan('Her silent gratitude fills the room.', plan, turn(), ''), 'Noted under premise: a lighthouse keeper.');
});

test('an ask turn keeps its one question beside a grounded comment and a suggestion', () => {
  const plan = { act: 'ask', reason: 'core' };
  const t = turn({ enforce: (x) => x });
  const out = holdToPlan('The tide tables matter here. Maybe the keeper is paid to get them wrong. Who pays her?', plan, t, '');
  assert.match(out, /Maybe the keeper is paid to get them wrong\./);
  assert.match(out, /Who pays her\?$/);
});

// ── what the writer is making, when they only describe it ─────────────────────

test('someone doing something is a story premise, so NIE does not open with "what are you making: a story, a poem, an article...?"', async () => {
  const { default: agent } = await import('../apps/web/src/engine/agent/index.js');
  const { detectProject } = await import('../apps/web/src/engine/agent/detect.js');
  const packs = agent.ctx.packs;
  for (const t of ['I am writing about a girl who can hear the dead.', "I'm writing about a lighthouse keeper who forges tide tables.", 'ok let us try anyway. my idea is a boy who finds a map inside a library book']) assert.equal(detectProject(t, { packs }).kind, 'story', t);
  assert.equal(detectProject('I want to write an article about a doctor who lost her license', { packs }).kind, 'article', 'a named form wins');
  assert.equal(detectProject('something about the sea', { packs }).kind, null, 'nothing to go on: still asked');
});

test('"the second one" means the second card the writer sees, whatever numbers the model wrote in its own list', () => {
  const last = { role: 'assistant', content: 'A few more:\n\n3. The vault is a decoy.\n\n4. The mole is the curator.\n\n5. The loot was never there.', ideas: [{ text: 'The vault is a decoy.' }, { text: 'The mole is the curator.' }, { text: 'The loot was never there.' }] };
  assert.match(pickedItem('the second one is interesting', last).text, /mole is the curator/);
  assert.match(pickedItem('that last one', last).text, /never there/);
  assert.match(replyContext({ text: 'the first one, why would that work?', past: [{ role: 'user', content: 'x' }, last] }), /number 1 of your list: "The vault is a decoy\."/);
  // with no cards, the numbered lines are read in the order they appear
  const text = { role: 'assistant', content: '3. The vault is a decoy.\n4. The mole is the curator.\n5. The loot was never there.' };
  assert.match(pickedItem('the second one', text).text, /mole/);
});

test('"go back to the first thing you said" is answered with NIE\'s first real reply shown, not its latest idea', () => {
  const past = [
    { role: 'user', content: 'a thriller about a translator who realises the speech is a lie' },
    { role: 'assistant', content: 'What single thing, if it vanished tomorrow, would set the translator free?', route: 'local' },
    { role: 'user', content: 'give me a few directions' },
    { role: 'assistant', content: '1. The lie is hers.\n\n2. The booth is bugged.', route: 'local', ideas: [{ text: 'The lie is hers.' }, { text: 'The booth is bugged.' }] },
    { role: 'user', content: "that's cliche" },
    { role: 'assistant', content: 'Understood. What if the lie is exposed in a private moment?', route: 'local' },
  ];
  const note = replyContext({ text: 'ok go back to the first thing you said', past });
  assert.match(note, /They mean the first thing you said in this conversation/);
  assert.match(note, /What single thing, if it vanished tomorrow/);
  assert.doesNotMatch(note, /private moment/);
  const small = [{ role: 'assistant', content: 'Hey there.', route: 'local', agent: { act: 'chat' } }, ...past];
  assert.match(replyContext({ text: 'ok go back to the first thing you said', past: small }), /What single thing/, 'a hello is not "the first thing"');
});
