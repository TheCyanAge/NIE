import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { composeMessages } from '../apps/web/src/engine/orchestrator/prompt.js';
import { interpretProfile } from '../apps/web/src/engine/profile/interpret.js';
import { detectIntent } from '../apps/web/src/engine/intent/intent.js';
import { parseDevelop, parseMemoryCommand } from '../apps/web/src/engine/brainstorm/commands.js';
import { BUTTONS, KIND_IDS, LENSES, LENSES_BY_KIND, ROTATION, detectKind, detectLens } from '../apps/web/src/engine/brainstorm/lenses.js';
import { FALLBACK_SLOTS, fillSlots, slotsFor } from '../apps/web/src/engine/brainstorm/slots.js';
import { bankFor, generateIdeas, markShown, parseIdeas, resolveKind } from '../apps/web/src/engine/brainstorm/ideas.js';
import { addToBoard, boardToMarkdown, boardToPromptBlock, normalizeBrainstorm, removeFromBoard, updateBoardItem, MAX_BOARD } from '../apps/web/src/engine/project/board.js';
import { ProjectStore, memoryStorage, STORAGE_KEYS } from '../apps/web/src/engine/project/store.js';
import { seededShuffle } from '../apps/web/src/engine/util/text.js';
import { modelWithReading, projectWith } from './helpers.js';

const ROBOTIC = /NIE has identified|NIE recommends|NIE flagged|As an AI/i;
const builtinOnly = () => new Orchestrator({ engine: new AIEngine({ local: null, online: null, isOnline: () => false }) });
const stubLocal = (replyFn, calls = []) => ({
  status: () => ({ state: 'ready' }),
  onStatus: () => () => {},
  chat: modelWithReading(replyFn, { calls }),
});
const withModel = (replyFn, calls) => new Orchestrator({ engine: new AIEngine({ local: stubLocal(replyFn, calls), online: null, isOnline: () => false }) });
const ask = (o, project, message, opts = {}) => o.brainstorm({ project, message, ...opts });

// ── the vocabulary ───────────────────────────────────────────────────────────

test('every kind has a bank, quick-action buttons and a mixed rotation that only use valid lenses', () => {
  for (const kind of KIND_IDS) {
    assert.ok(bankFor(kind).length > 0, `${kind} has ideas`);
    for (const l of [...LENSES_BY_KIND[kind], ...(BUTTONS[kind] ?? []), ...ROTATION[kind]]) assert.ok(LENSES[l], `${kind}: unknown lens ${l}`);
    for (const l of BUTTONS[kind]) assert.ok(LENSES_BY_KIND[kind].includes(l), `${kind}: button ${l} must be a lens that kind supports`);
    for (const l of ROTATION[kind]) assert.ok(LENSES_BY_KIND[kind].includes(l), `${kind}: rotation lens ${l} must be supported`);
  }
  assert.ok(BUTTONS.auto.every((l) => LENSES[l]));
});

test('kinds are read from what the writer says, without mistaking a story for a script or an essay', () => {
  assert.equal(detectKind('I want to write an article about sourdough'), 'article');
  assert.equal(detectKind('ideas for my personal essay'), 'essay');
  assert.equal(detectKind('a poem about the sea'), 'poem');
  assert.equal(detectKind('my screenplay needs a better midpoint'), 'script');
  assert.equal(detectKind('a villain with a soft spot'), 'character');
  assert.equal(detectKind('a fictional country with a strange tax system'), 'world');
  assert.equal(detectKind('A woman plays piano in an empty hotel and the manager reports a noise'), null, 'ordinary verbs and nouns do not pick a kind');
});

test('lens words are only understood from the message when it actually asks for something', () => {
  assert.equal(detectLens('give me some twists'), 'twist');
  assert.equal(detectLens('what could happen next?'), 'next');
  assert.equal(detectLens('how should it end'), 'ending');
  assert.equal(detectLens('Let\'s develop this idea: a clock'), 'develop');
  assert.equal(detectLens('hello there'), null);
});

// ── Idea Board commands ──────────────────────────────────────────────────────

test('"remember this" style commands are recognised, with and without the thing to remember', () => {
  assert.deepEqual(parseMemoryCommand('remember this'), { type: 'remember', note: '' });
  assert.deepEqual(parseMemoryCommand('NIE, remember this: the cat can talk'), { type: 'remember', note: 'the cat can talk' });
  assert.deepEqual(parseMemoryCommand('Remember: the clock runs backwards'), { type: 'remember', note: 'the clock runs backwards' });
  assert.deepEqual(parseMemoryCommand("don't forget the lighthouse is empty"), { type: 'remember', note: 'the lighthouse is empty' });
  assert.deepEqual(parseMemoryCommand('save this to my idea board'), { type: 'remember', note: '' });
  assert.deepEqual(parseMemoryCommand('Add this to memory'), { type: 'remember', note: '' });
  for (const t of ['show my idea board', 'bring up memory', 'what do you remember?', 'what have you remembered', 'show me my notes', "what's on the idea board"]) assert.equal(parseMemoryCommand(t)?.type, 'recall', t);
  for (const t of ["She can't remember what happened.", 'A man who remembers every face', 'I remember the cat', 'show the reader nothing', 'Notes on a scandal is a good title']) assert.equal(parseMemoryCommand(t), null, t);
  assert.equal(parseDevelop("Let's develop this idea: a clock that runs backwards"), 'a clock that runs backwards');
  assert.equal(parseDevelop('let us develop'), null);
});

test('asking for ideas is not "writing for you", but asking for prose still is', () => {
  const T = (m) => detectIntent(m, { hasHistory: true }).type;
  for (const m of ['Write me some story ideas', 'Create some twists', 'generate twists for my villain', 'Give me some hooks', 'Come up with a few premises']) assert.ok(!['request-write', 'request-edit'].includes(T(m)), m);
  for (const m of ['Write me a scene with three twists', 'Write me a scene where they meet', 'Draft the opening paragraph', 'Write a poem about it', 'Rewrite this paragraph so it flows better', 'Continue the story', 'Write me an article about bees']) assert.ok(['request-write', 'request-edit'].includes(T(m)), m);
  assert.equal(T('Give me some twists for my story'), 'request-ideas', 'an explicit ask is a request even on a first message');
  assert.notEqual(T('A man hides secrets in a lighthouse'), 'request-ideas', 'a premise that merely contains a lens word is not an idea request');
  assert.equal(detectIntent('A man hides secrets in a lighthouse').type, 'share-premise');
  assert.equal(detectIntent('Give me some twists for my story').type, 'request-ideas', 'with no history too');
  assert.equal(T('remember this'), 'remember');
  assert.equal(T('show my idea board'), 'recall');
  assert.equal(T("Let's develop this idea: a clock"), 'develop-idea');
});

// ── slots ────────────────────────────────────────────────────────────────────

test('slots use only this project\'s own material, and fall back to neutral phrases', () => {
  assert.deepEqual(slotsFor(projectWith()), FALLBACK_SLOTS);
  const p = projectWith();
  p.conversation.workingPremise = { summary: 'A story about a failing theatre', characters: ['magician'], settings: ['theatre'], themes: ['ambition'] };
  const s = slotsFor(p, 'an article about how small towns decide who belongs. Thanks.');
  assert.equal(s.who, 'the magician');
  assert.equal(s.place, 'the theatre');
  assert.equal(s.theme, 'ambition');
  assert.equal(s.topic, 'how small towns decide who belongs');
  assert.equal(fillSlots('{Who} hides it in {place}, for {theme}.', s), 'The magician hides it in the theatre, for ambition.');
  assert.equal(fillSlots('{Who} hides it in {place}.', FALLBACK_SLOTS), 'Your main character hides it in your setting.');
  assert.equal(slotsFor(projectWith({ title: 'Other' })).who, FALLBACK_SLOTS.who, 'another project is not affected');
});

// ── generating ideas ─────────────────────────────────────────────────────────

test('ideas are deterministic for a given project state, and different on the next request', () => {
  const p = projectWith();
  const a = generateIdeas({ project: p, kind: 'story', lens: 'twist', count: 3 });
  const b = generateIdeas({ project: p, kind: 'story', lens: 'twist', count: 3 });
  assert.deepEqual(a.ideas, b.ideas);
  assert.equal(a.ideas.length, 3);
  assert.ok(a.ideas.every((i) => i.lens === 'twist' && i.kind === 'story' && i.text.length > 20));
  markShown(p, a.ideas);
  const c = generateIdeas({ project: p, kind: 'story', lens: 'twist', count: 3 });
  assert.ok(c.ideas.every((i) => !a.ideas.some((x) => x.id === i.id)), 'nothing already shown comes back while there is more to show');
});

test('asking again and again never repeats until the lens is exhausted, and then starts over instead of going silent', () => {
  const p = projectWith();
  const total = bankFor('story').filter((t) => t.lens === 'twist').length;
  const seen = new Set();
  for (let round = 0; seen.size < total; round++) {
    const { ideas } = generateIdeas({ project: p, kind: 'story', lens: 'twist', count: 3, salt: String(round) });
    for (const i of ideas) assert.ok(!seen.has(i.id), 'no repeats before the bank is used up');
    for (const i of ideas) seen.add(i.id);
    markShown(p, ideas);
    assert.ok(round < 200, 'terminates');
  }
  const again = generateIdeas({ project: p, kind: 'story', lens: 'twist', count: 3 });
  assert.equal(again.ideas.length, 3, 'the cycle restarts');
});

test('a plain "give me ideas" spreads across different lenses', () => {
  for (const kind of KIND_IDS) {
    const { ideas } = generateIdeas({ project: projectWith(), kind, lens: null, count: 4 });
    assert.equal(ideas.length, 4, kind);
    assert.ok(new Set(ideas.map((i) => i.lens)).size >= 3, `${kind}: range of lenses`);
  }
});

test('every lens of every kind can produce ideas', () => {
  for (const kind of KIND_IDS) {
    for (const lens of LENSES_BY_KIND[kind].filter((l) => l !== 'blend')) {
      const { ideas } = generateIdeas({ project: projectWith(), kind, lens, count: 3 });
      assert.equal(ideas.length, 3, `${kind}/${lens}`);
    }
  }
});

test('ideas pick up the writer\'s own material, and nobody else\'s', () => {
  const a = projectWith({ title: 'A' });
  a.conversation.workingPremise = { summary: 'A magician is murdered', characters: ['magician'], settings: ['theatre'], themes: ['ambition'] };
  const b = projectWith({ title: 'B' });
  const joined = (p) => KIND_IDS.flatMap((kind) => generateIdeas({ project: p, kind, lens: null, count: 4 }).ideas.map((i) => i.text)).join('\n');
  assert.match(joined(a) + generateIdeas({ project: a, kind: 'story', lens: 'secret', count: 8 }).ideas.map((i) => i.text).join(' '), /magician|theatre|ambition/);
  assert.ok(!/magician|theatre/.test(joined(b)), 'the other project sees none of it');
});

test('genre blends come from the knowledge library and respect the project\'s declared genre', () => {
  const p = projectWith({ profile: { genre: { primary: 'mystery' } } });
  const { ideas } = generateIdeas({ project: p, kind: 'story', lens: 'blend', count: 3 });
  assert.equal(ideas.length, 3);
  assert.ok(ideas.every((i) => i.lens === 'blend' && /×/.test(i.text) && /\?$/.test(i.text)));
  assert.ok(ideas.every((i) => /^Mystery × /i.test(i.text)), ideas.map((i) => i.text).join('\n'));
  assert.equal(new Set(ideas.map((i) => i.text)).size, 3);
  const open = generateIdeas({ project: projectWith(), kind: 'story', lens: 'blend', count: 2 }).ideas;
  assert.equal(open.length, 2);
});

test('the kind is resolved from an explicit choice, then the message, then earlier context, then the premise', () => {
  const p = projectWith();
  assert.equal(resolveKind(p, '').kind, 'story');
  assert.equal(resolveKind(p, 'ideas for my essay').kind, 'essay');
  p.brainstorm.detectedKind = 'poem';
  assert.equal(resolveKind(p, 'give me ideas').kind, 'poem');
  assert.equal(resolveKind(p, 'give me ideas', 'script').kind, 'script');
  p.brainstorm.kind = 'article';
  assert.deepEqual(resolveKind(p, 'give me a poem idea'), { kind: 'article', source: 'chosen' }, 'a choice made in the picker wins');
});

// ── reading a model's reply ──────────────────────────────────────────────────

test('model replies are split into lead, ideas and tail; drafted passages in disguise are dropped, never edited', () => {
  const r = parseIdeas('Here are some angles.\n\n1. **The quiet cost:** nobody mentions what the town gave up.\n2. A reader who disagrees\n   and keeps reading anyway.\n- A flipped version.\n\nWhich one stings?');
  assert.equal(r.lead, 'Here are some angles.');
  assert.deepEqual(r.ideas, ['The quiet cost: nobody mentions what the town gave up.', 'A reader who disagrees and keeps reading anyway.', 'A flipped version.']);
  assert.equal(r.tail, 'Which one stings?');
  assert.deepEqual(parseIdeas('Just a thought, no list.').ideas, []);
  assert.deepEqual(parseIdeas('1. Only one idea here.').ideas, [], 'one item is not a set of ideas');
  const long = 'word '.repeat(80).trim();
  const dropped = parseIdeas(`1. ${long}\n2. A short idea.\n3. Another short idea.`);
  assert.deepEqual(dropped.ideas, ['A short idea.', 'Another short idea.']);
  assert.equal(dropped.dropped, 1);
});

// ── the Idea Board ───────────────────────────────────────────────────────────

test('the Idea Board keeps, dedupes, edits, removes and exports, and is bounded', () => {
  const p = projectWith({ title: 'Board' });
  const a = addToBoard(p, { text: '  A clock   that runs backwards.  ', source: 'writer' });
  assert.equal(a.added, true);
  assert.equal(a.item.text, 'A clock that runs backwards.');
  assert.equal(addToBoard(p, { text: 'a clock that runs backwards.' }).added, false, 'same idea (ignoring case and spacing) is not added twice');
  assert.equal(addToBoard(p, { text: '   ' }).added, false);
  const b = addToBoard(p, { text: 'A lighthouse nobody visits.', lens: 'setting', kind: 'story', source: 'nie' });
  assert.equal(updateBoardItem(p, b.item.id, { note: 'maybe the opening' }).note, 'maybe the opening');
  assert.match(boardToMarkdown(p), /# Idea Board: Board\n\n- A clock that runs backwards\.\n- A lighthouse nobody visits\.\s+_Note: maybe the opening_/);
  assert.match(boardToPromptBlock(p), /do not repeat them/);
  const edited = updateBoardItem(p, a.item.id, { text: 'A clock that runs backwards, but only on Sundays.' });
  assert.equal(edited.id, a.item.id, 'the id stays put when the writer edits their own idea');
  assert.equal(addToBoard(p, { text: 'a clock that runs backwards, but only on sundays.' }).added, false, 'and the edited idea still cannot be added again');
  assert.equal(removeFromBoard(p, a.item.id), true);
  assert.equal(p.brainstorm.board.length, 1);
  for (let i = 0; i < MAX_BOARD + 20; i++) addToBoard(p, { text: `Idea number ${i}` });
  assert.equal(p.brainstorm.board.length, MAX_BOARD);
  assert.deepEqual(normalizeBrainstorm(null).board, []);
  assert.deepEqual(normalizeBrainstorm({ board: [{ text: '' }, { nope: 1 }, { text: 'Kept' }] }).board.map((i) => i.text), ['Kept']);
});

test('projects saved before the Idea Board existed still load, and deleting a project deletes its board', () => {
  const store = new ProjectStore(memoryStorage());
  const p = store.create({ title: 'Old' });
  addToBoard(p, { text: 'SECRETIDEA' });
  store.save(p);
  const raw = JSON.parse(store.storage.get(STORAGE_KEYS.project(p.id)));
  delete raw.brainstorm;
  store.storage.set(STORAGE_KEYS.project(p.id), JSON.stringify(raw));
  assert.deepEqual(store.load(p.id).brainstorm, normalizeBrainstorm(null));
  store.save(p);
  assert.ok(store.storage.get(STORAGE_KEYS.project(p.id)).includes('SECRETIDEA'));
  store.delete(p.id);
  assert.ok(!store.storage.keys().some((k) => store.storage.get(k)?.includes('SECRETIDEA')), 'nothing of the board survives deletion');
  assert.deepEqual(store.create({ title: 'New' }).brainstorm, normalizeBrainstorm(null), 'a new project starts with an empty board');
});

// ── Brainstorm turns, offline ────────────────────────────────────────────────

test('offline: a typed request for twists gets concept-level ideas, a question and an honest note about built-in guidance', async () => {
  const project = projectWith();
  const calls = [];
  const r = await ask(builtinOnly(), project, 'Give me some twists for my story');
  assert.equal(r.route, 'builtin');
  assert.equal(r.lens, 'twist');
  assert.equal(r.kind, 'story');
  assert.equal(r.ideas.length, 3);
  assert.ok(r.ideas.every((i) => i.lens === 'twist'));
  assert.ok(r.ideas.every((i) => r.reply.includes(i.text)), 'the chat history carries the ideas');
  assert.match(r.reply, /\?/);
  assert.match(r.reply, /built-in guidance/i);
  assert.ok(!ROBOTIC.test(r.reply));
  assert.ok(!/["“”]/.test(r.ideas.map((i) => i.text).join(' ')), 'ideas contain no quoted (drafted) text');
  assert.ok(r.suggestions.some((s) => s.send?.lens === 'twist' && /More like/.test(s.label)));
  assert.ok(r.suggestions.some((s) => s.send?.ask?.startsWith("Let's develop this idea:")));
  assert.equal(project.conversation.messages.at(-1).ideas.length, 3, 'ideas are stored with the message so the cards come back on reload');
  assert.deepEqual(project.brainstorm.shown.length, 3);
  assert.equal(project.brainstorm.lastLens, 'twist');
  void calls;
});

test('offline: the built-in note is said once, and "more" repeats the last request with new ideas', async () => {
  const project = projectWith();
  const o = builtinOnly();
  const first = await ask(o, project, 'Give me some complications');
  const more = await ask(o, project, 'give me more');
  assert.equal(first.lens, 'complication');
  assert.equal(more.lens, 'complication', '"more" keeps the lens');
  assert.ok(more.ideas.every((i) => !first.ideas.some((x) => x.id === i.id)), 'new ideas');
  assert.match(first.reply, /built-in guidance/i);
  assert.ok(!/built-in guidance/i.test(more.reply), 'said once, not nagged');
});

test('offline: the kind follows what the writer is making, and a button forces the lens', async () => {
  const project = projectWith();
  const o = builtinOnly();
  const art = await ask(o, project, "I'm writing an article about how small towns decide who belongs. Give me some angles.");
  assert.equal(art.kind, 'article');
  assert.equal(art.lens, 'angle');
  assert.equal(project.brainstorm.detectedKind, 'article');
  assert.equal(art.ideas.length, 3);
  // The writer's own topic reaches the ideas: across the whole set of angles, some use it (which ones are drawn varies).
  const allAngles = generateIdeas({ project, message: "I'm writing an article about how small towns decide who belongs.", kind: 'article', lens: 'angle', count: 60 }).ideas.map((i) => i.text);
  assert.ok(allAngles.some((t) => /how small towns decide who belongs/.test(t)), 'topic slot is filled from what the writer said');
  const next = await ask(o, project, 'Give me some ideas'); // no kind words: stay in the same lane
  assert.equal(next.kind, 'article');
  const btn = await ask(o, project, 'Surprise me with a few sparks.', { lens: 'spark' });
  assert.equal(btn.lens, 'spark');
  assert.equal(btn.ideas.length, 3);
});

test('offline: a lens that does not fit the chosen kind says so and offers a mix instead of silently switching', async () => {
  const project = projectWith();
  project.brainstorm.kind = 'poem';
  const r = await ask(builtinOnly(), project, 'Give me some twists', { kind: 'poem' });
  assert.equal(r.kind, 'poem');
  assert.equal(r.lens, null);
  assert.match(r.reply, /isn't really a thing for poem projects/);
  assert.ok(r.ideas.length >= 3);
  assert.ok(r.ideas.every((i) => i.kind === 'poem'));
});

test('offline: a lens that fits only another kind switches when the writer has not chosen one', async () => {
  const project = projectWith();
  const r = await ask(builtinOnly(), project, 'Give me some hooks');
  assert.equal(r.lens, 'hook');
  assert.ok(['article', 'essay'].includes(r.kind), r.kind);
  assert.equal(r.ideas.length, 3);
});

test('offline: starting from zero still meets the writer where they are, and adds a few sparks to react to', async () => {
  const project = projectWith();
  const r = await ask(builtinOnly(), project, "I have an idea but I don't know how to start.");
  assert.equal(r.intent.type, 'start-from-zero');
  assert.match(r.reply, /let's hear the idea/i);
  assert.equal(r.ideas.length, 3);
  assert.ok(r.ideas.every((i) => i.lens === 'spark'));
  assert.match(r.lead, /a few starting points to react to/i);
});

test('keeping ideas: "remember this" keeps what NIE just offered, or the writer\'s own words, without calling a model', async () => {
  const calls = [];
  const o = withModel(() => '1. An idea one.\n2. An idea two.\n3. An idea three.\nWhich one?', calls);
  const project = projectWith();
  const first = await ask(o, project, 'Give me some twists');
  assert.equal(first.ideas.length, 3);
  assert.equal(calls.length, 1);
  const kept = await ask(o, project, 'remember this');
  assert.equal(calls.length, 1, 'no model call for a board command');
  assert.equal(kept.route, 'builtin');
  assert.equal(project.brainstorm.board.length, 3);
  assert.ok(project.brainstorm.board.every((i) => i.source === 'nie'));
  assert.match(kept.reply, /Kept on your Idea Board/);
  assert.match((await ask(o, project, 'remember this')).reply, /already on your Idea Board/);
  const own = await ask(o, project, 'Remember: the cat can talk, but only to the tenant downstairs.');
  assert.equal(project.brainstorm.board.at(-1).source, 'writer');
  assert.equal(project.brainstorm.board.at(-1).text, 'the cat can talk, but only to the tenant downstairs.');
  assert.match(own.reply, /the cat can talk/);
  const shown = await ask(o, project, 'show my idea board');
  assert.match(shown.reply, /Here is what's on your Idea Board/);
  assert.match(shown.reply, /the cat can talk/);
  assert.equal(calls.length, 1);
});

test('keeping ideas: with nothing to keep it says so; an empty board says so', async () => {
  const project = projectWith();
  const o = builtinOnly();
  assert.match((await ask(o, project, 'remember this')).reply, /don't have anything to keep yet/);
  assert.match((await ask(o, project, 'bring up memory')).reply, /Your Idea Board is empty/);
  await ask(o, project, 'A lighthouse keeper who talks to the sea.');
  const kept = await ask(o, projectWith(), 'remember this'); // another project: nothing leaks across
  assert.match(kept.reply, /don't have anything to keep yet/);
  await ask(o, project, 'remember this');
  assert.equal(project.brainstorm.board[0].text, 'A lighthouse keeper who talks to the sea.', 'the writer\'s own previous message is kept as written');
});

test('developing an idea asks sharp questions about it and never writes it out', async () => {
  const project = projectWith();
  const r = await ask(builtinOnly(), project, "Let's develop this idea: a clock that runs backwards");
  assert.equal(r.intent.type, 'develop-idea');
  assert.match(r.reply, /Good one to dig into/);
  assert.equal((r.reply.match(/^\d\. .*\?$/gm) ?? []).length, 3, 'three questions');
  assert.equal(r.ideas.length, 0);
  assert.ok(!ROBOTIC.test(r.reply));
});

test('requests for prose are still declined without a model, and asking for ideas never reaches that path', async () => {
  const calls = [];
  const o = withModel(() => 'x', calls);
  const p = projectWith();
  assert.equal((await ask(o, p, 'Write me a scene with three twists')).declined, true);
  assert.equal((await ask(o, p, 'Rewrite this so it flows')).declined, true);
  assert.equal(calls.length, 0);
});

// ── Brainstorm turns, with a language model ──────────────────────────────────

test('with a model: an idea request carries the kind, lens, seeds and Idea Board, and the system prompt stays cache-stable', async () => {
  const calls = [];
  const o = withModel(() => 'Some angles for you.\n\n1. The thing nobody measures.\n2. A reader who already disagrees.\n3. What the experts quietly avoid.\n\nWhich one would you spend a week on?', calls);
  const project = projectWith();
  addToBoard(project, { text: 'KEPTIDEA about bees', source: 'writer' });
  const r = await ask(o, project, 'Give me some angles for my article about bees');
  assert.equal(r.route, 'local');
  assert.deepEqual(r.ideas.map((i) => i.text), ['The thing nobody measures.', 'A reader who already disagrees.', 'What the experts quietly avoid.']);
  assert.equal(r.lead, 'Some angles for you.');
  assert.equal(r.tail, 'Which one would you spend a week on?');
  assert.ok(r.ideas.every((i) => i.kind === 'article' && i.lens === 'angle' && i.lensLabel === 'Angles'));
  const sent = calls[0].messages;
  assert.match(sent[0].content, /KEPTIDEA about bees/);
  assert.match(sent.at(-1).content, /angles for an article \(Angles\)/);
  assert.match(sent.at(-1).content, /Do not copy them/);
  assert.equal(calls[0].opts.maxTokens, 700);
  // system prompt does not depend on the kind or lens (so llama.cpp can reuse its prompt cache)
  const interp = interpretProfile(project.profile);
  const s1 = composeMessages({ project, interp, userMessage: 'a' }).messages[0].content;
  await ask(o, project, 'Give me some twists');
  assert.equal(calls[1].messages[0].content, s1);
});

test('with a model: a plain conversational reply stays a conversation, not idea cards', async () => {
  const o = withModel(() => 'Tell me more about who he is.');
  const r = await ask(o, projectWith(), 'A homeless man befriends a cat.');
  assert.deepEqual(r.ideas, []);
  assert.equal(r.reply, 'Tell me more about who he is.');
});

test('with a model: a reply that is a drafted passage in an idea list is replaced by built-in ideas, never shown', async () => {
  const drafted = '"' + Array.from({ length: 40 }, (_, i) => `word${i}`).join(' ') + '"';
  const r = await ask(withModel(() => drafted), projectWith(), 'Give me some twists');
  assert.equal(r.route, 'builtin');
  assert.ok(!r.reply.includes('word10'));
  assert.equal(r.ideas.length, 3);
});

test('with a model: an over-long "idea" is dropped rather than shown or edited', async () => {
  const long = 'and then ' + 'she walked on '.repeat(30);
  const r = await ask(withModel(() => `Ideas:\n1. ${long}\n2. A short idea.\n3. Another short idea.\nWhich?`), projectWith(), 'Give me some twists');
  assert.deepEqual(r.ideas.map((i) => i.text), ['A short idea.', 'Another short idea.']);
});

test('with a model that fails: built-in ideas answer instead, and the conversation carries on', async () => {
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: async () => { throw new Error('boom'); } };
  const o = new Orchestrator({ engine: new AIEngine({ local, online: null, isOnline: () => false }) });
  const r = await ask(o, projectWith(), 'Give me some secrets');
  assert.equal(r.route, 'builtin');
  assert.equal(r.ideas.length, 3);
});

test('aborting an idea request surfaces the abort instead of swallowing it', async () => {
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: async () => { const e = new Error('aborted'); e.kind = 'abort'; throw e; } };
  const o = new Orchestrator({ engine: new AIEngine({ local, online: null, isOnline: () => false }) });
  await assert.rejects(ask(o, projectWith(), 'Give me some secrets'), (e) => e.kind === 'abort');
});

test('projects stay isolated: ideas shown, kind and the board never cross over', async () => {
  const store = new ProjectStore(memoryStorage());
  const a = store.create({ title: 'A' });
  const o = builtinOnly();
  await ask(o, a, "I'm writing a poem. Give me some images.");
  addToBoard(a, { text: 'A-ONLY IDEA' });
  const b = store.create({ title: 'B' });
  assert.deepEqual(b.brainstorm, normalizeBrainstorm(null));
  const r = await ask(o, b, 'Give me some ideas');
  assert.equal(r.kind, 'story', 'B does not inherit A\'s poem lane');
  assert.ok(!JSON.stringify(b).includes('A-ONLY IDEA'));
});

test('the shuffle helper is deterministic and does not mutate its input', () => {
  const list = [1, 2, 3, 4, 5, 6, 7, 8];
  const a = seededShuffle(list, 'seed');
  assert.deepEqual(a, seededShuffle(list, 'seed'));
  assert.notDeepEqual(a, seededShuffle(list, 'other seed'));
  assert.deepEqual(list, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual([...a].sort(), list);
});
