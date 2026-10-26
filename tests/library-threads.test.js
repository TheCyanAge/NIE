import test from 'node:test';
import assert from 'node:assert/strict';
import { Orchestrator } from '../apps/web/src/engine/orchestrator/index.js';
import { AIEngine } from '../apps/web/src/engine/ai/engine.js';
import { ProjectStore, memoryStorage } from '../apps/web/src/engine/project/store.js';
import { answerFromLibrary, getEntry, loadLibrary } from '../apps/web/src/engine/knowledge/index.js';
import { FACET_ORDER, MAX_AGE, chipsFor, noteAnswer, profilesOf, resolveFollowUp, subjectFrom } from '../apps/web/src/engine/knowledge/thread.js';
import { emptyThread, sanitizeThread } from '../apps/web/src/engine/knowledge/thread-state.js';
import { mindStats } from '../apps/web/src/engine/mind/index.js';
import { modelWithReading, projectWith } from './helpers.js';

await loadLibrary();

// A conversation ABOUT the library: "what is gothic fiction?" ... "what about its tropes?" ... "tell me more" ... "how is it different from romance?".
// The thread (project.conversation.library) says which subject the last library answer was about; short messages that point back at it are answered from the
// library's records for that subject. Nothing is rewritten for the writer: the library only ever shows its own records.

const GOTHIC = 'genre-spec-gothic-fiction';
const gothic = () => {
  const a = answerFromLibrary('What is gothic fiction?');
  assert.equal(a.entries[0].id, GOTHIC, 'the library answers "what is gothic fiction?" with its own entry');
  return noteAnswer(emptyThread(), a.entries, 1);
};

const noModel = () => new Orchestrator({ engine: new AIEngine({ local: null, online: null, isOnline: () => false }) });
function withModel(replyFn, opts = {}) {
  const calls = [];
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: modelWithReading(replyFn, { calls, ...opts }) };
  return { o: new Orchestrator({ engine: new AIEngine({ local, online: null, isOnline: () => false }) }), calls };
}
const say = (o, project, message) => o.brainstorm({ project, message });

test('the thread state accepts only what it can use: garbage in, a valid (possibly empty) thread out', () => {
  assert.deepEqual(sanitizeThread(undefined), emptyThread());
  assert.deepEqual(sanitizeThread('gothic'), emptyThread());
  assert.deepEqual(sanitizeThread({ subject: 'x' }), emptyThread());
  assert.deepEqual(sanitizeThread({ subject: { id: '../../etc/passwd', name: 'x' } }), emptyThread(), 'an id that is not an id');
  assert.deepEqual(sanitizeThread({ subject: { id: '__proto__' } }), emptyThread() , 'a built-in name is not an id of anything');
  const t = sanitizeThread({ subject: { id: GOTHIC, name: `Gothic‮ fiction${'x'.repeat(500)}`, kind: 'genre' }, shown: ['history', 'history', 'not-a-facet', 7, null], entryShown: 1e9, turn: -5, extra: 'dropped' });
  assert.equal(t.subject.id, GOTHIC);
  assert.ok(!/‮/.test(t.subject.name) && t.subject.name.length <= 120, 'no bidirectional override, clipped');
  assert.deepEqual(t.shown, ['history']);
  assert.ok(t.entryShown <= 100 && t.turn === 0);
  assert.ok(!('extra' in t));
  // survives a JSON round trip unchanged
  assert.deepEqual(sanitizeThread(JSON.parse(JSON.stringify(t))), t);
});

test('a profile belongs to its parent entry, a work belongs to nothing, and every library profile has a parent that exists', () => {
  const profile = getEntry('profile-gothic-fiction-tropes');
  assert.equal(subjectFrom(profile).id, GOTHIC);
  assert.equal(subjectFrom(profile).facet, 'tropes');
  assert.equal(subjectFrom(getEntry(GOTHIC)).facet, null);
  const work = answerFromLibrary('Who wrote Rebecca by Daphne du Maurier?').entries[0];
  assert.equal(work.kind, 'work');
  assert.equal(subjectFrom(work), null, 'no follow-up thread on a single work');
  assert.ok(profilesOf(GOTHIC).size >= 9, 'the example subject has its nine facets');
  assert.deepEqual([...profilesOf(GOTHIC).keys()].sort(), [...FACET_ORDER].sort());
});

test('short messages that point back at the subject are read against it; ones that name something else are not', () => {
  const th = gothic();
  const r = (text, turn = 2, opts = {}) => resolveFollowUp(text, th, { turn, ...opts });
  const facet = (text) => { const x = r(text); return x?.kind === 'facet' ? x.facet : x?.kind ?? null; };

  assert.equal(facet('what about its tropes?'), 'tropes');
  assert.equal(facet('and the history?'), 'history');
  assert.equal(facet('subgenres?'), 'subgenres');
  assert.equal(facet('who are the key authors?'), 'canon');
  assert.equal(facet('what do readers expect'), 'readers');
  assert.equal(facet('how is it built?'), 'craft');
  assert.equal(facet('what is the vocabulary?'), 'terms');
  assert.equal(facet('what are the common pitfalls with it?'), 'pitfalls');
  assert.equal(facet('What are the tropes of gothic fiction?'), 'tropes', 'naming the subject again is the same subject');

  // not follow-ups: they name another subject, or a thing of their own
  assert.equal(r('what are the tropes of romance?'), null);
  assert.equal(r('what are the subgenres of fantasy?'), null);
  assert.equal(r('how do I write dialogue?'), null);
  assert.equal(r('what is a villanelle?'), null);
  assert.equal(r('The detective finds the letter in the attic.'), null);
  assert.equal(r(''), null);
  assert.equal(r('x'.repeat(400)), null);

  // the thread is followed for a few messages, not for ever
  assert.ok(resolveFollowUp('and the history?', th, { turn: 1 + MAX_AGE }));
  assert.equal(resolveFollowUp('and the history?', th, { turn: 2 + MAX_AGE }), null);
  assert.equal(resolveFollowUp('and the history?', th, { turn: 0 }), null, 'a thread from the future (messages were deleted) is not followed');
  assert.equal(resolveFollowUp('and the history?', emptyThread(), { turn: 2 }), null);
  assert.equal(resolveFollowUp('and the history?', sanitizeThread({ subject: { id: 'no-such-entry', name: 'x' }, turn: 1 }), { turn: 2 }), null, 'a subject the library no longer holds');
});

test('"tell me more" shows the rest of the overview, then each facet in turn, then says plainly that this is everything', () => {
  let th = gothic();
  const seen = [];
  for (let turn = 2; turn < 30; turn++) {
    const f = resolveFollowUp('tell me more', th, { turn });
    assert.ok(f, `turn ${turn}`);
    if (f.kind === 'exhausted') {
      assert.match(f.reply, /everything I hold on Gothic fiction/);
      break;
    }
    assert.equal(f.kind, 'more');
    if (f.rest) {
      seen.push('overview');
      th = { ...th, entryShown: 100, turn };
    } else {
      seen.push(f.facet);
      th = noteAnswer(th, f.entries, turn);
    }
  }
  assert.deepEqual(seen, ['overview', ...FACET_ORDER], 'the overview first, then every facet once, in the order of the story of the subject');
  for (const w of ['go on', 'what else?', 'more', 'keep going', 'tell me more about gothic fiction', 'okay, tell me more about it']) {
    assert.equal(resolveFollowUp(w, gothic(), { turn: 2 })?.kind, 'more', w);
  }
  assert.equal(resolveFollowUp('give me more ideas', gothic(), { turn: 2 }), null, 'ideas are another request');
});

test('"how is it different from X?" puts the two entries side by side, with the profile\'s own point when it has one', () => {
  const th = gothic();
  const c = resolveFollowUp('how is it different from horror?', th, { turn: 2 });
  assert.equal(c.kind, 'compare');
  assert.deepEqual(c.entries.map((e) => e.id), [GOTHIC, 'horror']);
  assert.match(c.after, /^On how they differ, my profile of Gothic fiction says: Gothic versus horror:/);
  const same = resolveFollowUp('how is it different from gothic romance?', th, { turn: 2 });
  assert.equal(same.entries[1].name, 'Gothic romance', 'the entry called exactly that, not one that merely has the word');
  const plain = resolveFollowUp('and how does it compare with romance?', th, { turn: 2 });
  assert.equal(plain.entries[1].id, 'romance', '"romance" is Romance, not LGBTQ romance');
  assert.ok(!/versus Gothic romance/.test(plain.after), 'the point about another neighbour is not offered for this one');
  assert.equal(resolveFollowUp('gothic fiction vs horror', th, { turn: 2 })?.kind, 'compare');
});

test('chips offer the facets not yet shown, then stop offering them', () => {
  let th = gothic();
  const labels = () => chipsFor(th).map((c) => c.label);
  assert.deepEqual(labels().slice(0, 4), ['Tell me more', 'History', 'Subgenres', 'Tropes']);
  assert.ok(chipsFor(th).every((c) => c.text === '' ? typeof c.send?.ask === 'string' : typeof c.text === 'string'));
  th = noteAnswer(th, [profilesOf(GOTHIC).get('history')], 2);
  assert.ok(!labels().includes('History'));
  assert.deepEqual(chipsFor(emptyThread()), []);
});

test('a conversation with no model: a library answer, then follow-ups that stay on its subject, with chips that continue it', async () => {
  const o = noModel();
  const project = projectWith();
  const first = await say(o, project, 'What is gothic fiction?');
  assert.equal(first.intent.type, 'library-question');
  assert.equal(project.conversation.library.subject.id, GOTHIC);
  assert.equal(first.library.subject, 'Gothic fiction');
  assert.deepEqual(first.suggestions.slice(0, 2).map((s) => s.label), ['Tell me more', 'History']);

  const tropes = await say(o, project, 'what about its tropes?');
  assert.equal(tropes.route, 'builtin');
  assert.match(tropes.reply, /^Gothic fiction, tropes, motifs and character types:/);
  assert.match(tropes.reply, /haunted or decaying house/);
  assert.equal(tropes.library.follow, 'facet');
  assert.ok(!tropes.suggestions.some((s) => s.label === 'Tropes'), 'what was just shown is not offered again');
  assert.deepEqual(project.conversation.library.shown, ['tropes']);

  const more = await say(o, project, 'tell me more');
  assert.match(more.reply, /^More on Gothic fiction:/);
  assert.match(more.reply, /Rebecca/, 'the works the first answer left out');

  const next = await say(o, project, 'what else?');
  assert.match(next.reply, /^More on Gothic fiction, history and origins:/);

  const diff = await say(o, project, 'how is it different from horror?');
  assert.match(diff.reply, /side by side/);
  assert.match(diff.reply, /Gothic versus horror/);

  // a sticky chip is a plain question and is answered like one
  const chip = first.suggestions.find((s) => s.label === 'Subgenres');
  const chipReply = await say(o, project, chip.send.ask);
  assert.match(chipReply.reply, /branch|subgenre|Southern Gothic/i);
  assert.equal(chipReply.intent.type, 'library-question');
});

test('what NIE says when the subject has nothing more, or no record of the facet, is the truth about what it holds, with no model asked', async () => {
  const { o, calls } = withModel(() => 'SHOULD NOT BE ASKED');
  const project = projectWith();
  await say(o, project, 'What is gothic fiction?');
  calls.length = 0;
  for (let i = 0; i < FACET_ORDER.length + 3; i++) {
    const before = calls.length;
    const r = await say(o, project, 'tell me more');
    if (/everything I hold on Gothic fiction/.test(r.reply)) {
      assert.equal(r.route, 'builtin');
      assert.equal(calls.length, before, 'no model call for a fixed statement of what is held');
      return;
    }
  }
  assert.fail('"tell me more" never ran out');
});

test('a subject with no profile: a facet question is answered by saying so, not by a guess', async () => {
  const o = noModel();
  const project = projectWith();
  // (a form the library holds an entry for but no profile of; chosen here so the test does not depend on which profiles have been written)
  const form = ['villanelle', 'pantoum', 'sestina', 'ghazal', 'triolet', 'rondeau', 'limerick', 'ballade'].find((f) => {
    const a = answerFromLibrary(`What is a ${f}?`);
    return a.strength === 'strong' && a.entries[0].kind === 'form' && profilesOf(a.entries[0].id).size === 0;
  });
  assert.ok(form, 'the library has a poetic form without a profile');
  const first = await say(o, project, `What is a ${form}?`);
  assert.equal(first.intent.type, 'library-question');
  assert.equal(profilesOf(project.conversation.library.subject.id).size, 0);
  const r = await say(o, project, 'what about its tropes?');
  assert.match(r.reply, /don't have a separate entry on the tropes, motifs and character types of /i);
  assert.match(r.reply, /won't guess/);
  assert.equal(r.route, 'builtin');
});

test('a thread belongs to its project: another project starts without one, and it survives saving and reopening', async () => {
  const o = noModel();
  const a = projectWith({ title: 'A' });
  await say(o, a, 'What is gothic fiction?');
  assert.equal(a.conversation.library.subject.id, GOTHIC);

  const b = projectWith({ title: 'B' });
  assert.equal(b.conversation.library.subject, null, 'factory-fresh');
  const r = await say(o, b, 'tell me more');
  assert.ok(!/Gothic/.test(r.reply), 'project B has no subject to be told more about');
  assert.notEqual(r.library?.follow, 'more');

  // saved, reopened
  const store = new ProjectStore(memoryStorage());
  const created = store.create({ title: 'Saved' });
  await say(o, created, 'What is gothic fiction?');
  store.save(created);
  const reopened = new ProjectStore(store.storage).load(created.id);
  assert.equal(reopened.conversation.library.subject.id, GOTHIC);
  assert.deepEqual(reopened.conversation.library, created.conversation.library);
  const again = await say(o, reopened, 'and the history?');
  assert.match(again.reply, /^Gothic fiction, history and origins:/);

  // deleted: nothing is left under the project's prefix
  store.delete(created.id);
  assert.equal(store.load(created.id), null);
});

test('idea cards end the thread (so "more" means more ideas), and a follow-up is never kept as something the writer told NIE', async () => {
  const o = noModel();
  const project = projectWith();
  await say(o, project, 'What is gothic fiction?');
  const before = mindStats(project).said;
  await say(o, project, 'tell me more');
  await say(o, project, 'what about its tropes?');
  assert.equal(mindStats(project).said, before, 'questions are not statements');
  const ideas = await say(o, project, 'Give me some twists for a haunted house story');
  assert.ok(ideas.ideas.length > 0, 'a request for ideas still gives ideas');
  assert.equal(project.conversation.library.subject, null, 'the library thread ended');
  const more = await say(o, project, 'more');
  assert.ok(more.ideas.length > 0, '"more" after ideas is more ideas');
});

test('with a model: a pronoun question about the subject is answered with its records in front of the model, not with "that is not in my library"', async () => {
  const { o, calls } = withModel(() => 'It started in Britain because the Gothic grew out of that century\'s taste for the medieval past.', { reading: (t) => ({ task: 'craft', topic: '' }) });
  const project = projectWith();
  await say(o, project, 'What is gothic fiction?');
  calls.length = 0;
  const r = await say(o, project, 'why did it start in Britain?');
  const prompt = calls.map((c) => c.messages.map((m) => m.content).join('\n')).join('\n');
  assert.match(prompt, /Castle of Otranto/, 'the subject\'s records were shown to the model');
  assert.ok(!/isn't in my built-in library|has nothing on this question/.test(prompt), 'it was not told the library has nothing');
  assert.equal(r.intent.type, 'library-question');
  assert.equal(r.library.follow, 'context');
  assert.equal(project.conversation.library.subject.id, GOTHIC, 'the thread goes on');
  assert.deepEqual(project.conversation.library.shown, [], 'records only the model saw are not marked as shown to the writer');
});

test('with a model: a facet follow-up is answered by the library\'s record (word for word), not by the model\'s memory', async () => {
  const { o, calls } = withModel(() => 'MODEL TEXT', { reading: () => ({ task: 'craft', topic: '' }) });
  const project = projectWith();
  await say(o, project, 'What is gothic fiction?');
  const r = await say(o, project, 'and the vocabulary?');
  assert.equal(calls.length, 0, 'the model is not asked to retell a record');
  assert.equal(r.route, 'builtin');
  assert.ok(!/MODEL TEXT/.test(r.reply));
  assert.match(r.reply, /vocabulary of the genre/i, 'the vocabulary record is what is shown');
  assert.match(r.reply, /uncanny|sublime|Female Gothic/, 'in the record\'s own words');
  assert.equal(r.library.follow, 'facet');
  assert.deepEqual(project.conversation.library.shown, ['terms']);
});

test('without a model, "what is a sonnet?" is a question for the library, though "sonnet" is also a thing to write; asking for ideas still gives ideas', async () => {
  const o = noModel();
  for (const q of ['What is a sonnet?', 'what is a haiku', 'Explain the villanelle', 'Who invented the sonnet?']) {
    const r = await say(o, projectWith(), q);
    assert.equal(r.intent.type, 'library-question', q);
    assert.match(r.reply, /^From NIE's built-in library:/, q);
  }
  for (const q of ['what are some twists', "what's a good twist", 'give me a sonnet idea']) {
    const r = await say(o, projectWith(), q);
    assert.equal(r.intent.type, 'request-ideas', q);
  }
});

import { LIBRARY_SESSIONS } from './fixtures/library-sessions.mjs';

test('the scripted library conversations (also measured on the real model) are read as intended with no model', async () => {
  for (const session of LIBRARY_SESSIONS) {
    const o = noModel();
    const project = projectWith({ title: session.id });
    for (const step of session.steps) {
      const r = await say(o, project, step.say);
      const wanted = [].concat('followRules' in step ? step.followRules : step.follow);
      const got = r.library?.follow ?? null;
      assert.ok(wanted.includes(got), `${session.id}: "${step.say}" was read as ${got}, wanted ${wanted.join(' or ')}`);
      if (step.notLibrary) assert.ok(!/^From NIE's built-in library|^More on |^[A-Z][^\n]*, [a-z ,]+:\n/.test(r.reply) && r.intent.type !== 'library-question', `${session.id}: "${step.say}" is about the writer's story`);
      if (step.mustMention && !('followRules' in step)) {
        for (const alts of step.mustMention) assert.ok(alts.some((a) => r.reply.toLowerCase().includes(a.toLowerCase())), `${session.id}: "${step.say}" should mention one of ${alts.join(', ')}; got: ${r.reply.slice(0, 200)}`);
      }
    }
  }
});

test('an answer from the library may only name what the library\'s records name: a model that adds an author or a title of its own has that sentence left out, and says so', async () => {
  const invented = 'Gothic fiction began with The Castle of Otranto in 1764. Anne Rice later made the vampire a tragic hero in Interview With The Vampire. Its settings are ruined castles and decaying houses.';
  const { o } = withModel(() => invented, { reading: () => ({ task: 'craft', topic: '' }) });
  const project = projectWith();
  await say(o, project, 'What is gothic fiction?');
  const r = await say(o, project, 'why did it start in Britain?'); // (a pronoun question the library cannot pick out goes to the model)
  assert.equal(r.route, 'local');
  assert.ok(!/Anne Rice|Interview With The Vampire/.test(r.reply), 'the sentence that names what no record names is gone');
  assert.match(r.reply, /Otranto/, 'what the records name stays');
  assert.match(r.reply, /left out part of that reply because it named something I couldn't find in my library/);
});

test('an answer from the library may only state the dates and patterns the records state: a year or a rhyme scheme of the model\'s own has that sentence left out, and says so', async () => {
  const invented = 'Gothic fiction began in Britain with The Castle of Otranto. Its rhyme scheme is typically ABAABCCDDCDEEDCDEE. The form returned in the 1620s.';
  const { o } = withModel(() => invented, { reading: () => ({ task: 'craft', topic: '' }) });
  const project = projectWith();
  await say(o, project, 'What is gothic fiction?');
  const r = await say(o, project, 'why did it start in Britain?');
  assert.equal(r.route, 'local');
  assert.ok(!/ABAABCCDDCDEEDCDEE|1620s/.test(r.reply), 'the scheme and the decade no record has are gone');
  assert.match(r.reply, /Otranto/, 'what is in the records stays');
  assert.match(r.reply, /left out part of that reply because it named something I couldn't find in my library/);
});

test('an answer from the library that names nothing the library holds is replaced by the library\'s own record, with the reason', async () => {
  const { o } = withModel(() => 'Anne Rice and Stephen King shaped it, along with Clive Barker and Poppy Brite.', { reading: () => ({ task: 'craft', topic: '' }) });
  const project = projectWith();
  await say(o, project, 'What is gothic fiction?');
  const r = await say(o, project, 'why did it start in Britain?');
  assert.equal(r.route, 'builtin');
  assert.match(r.reply, /couldn't find in my library|could not find in my library/);
  assert.match(r.reply, /Castle of Otranto/, 'the record itself is shown instead');
});

test('the model is told the library is NIE\'s own, to speak as NIE, to add no names of its own and not to repeat itself', async () => {
  const { o, calls } = withModel(() => 'Gothic fiction began in 1764 with The Castle of Otranto.', { reading: () => ({ task: 'craft', topic: '' }) });
  const project = projectWith();
  await say(o, project, 'What is gothic fiction?');
  await say(o, project, 'why did it start in Britain?');
  assert.equal(calls.length, 1, 'only the pronoun question went to the model');
  const prompt = calls.map((c) => c.messages.map((m) => m.content).join('\n')).join('\n');
  assert.match(prompt, /NIE's built-in library, NIE's own reference; they are not something the writer wrote or sent/);
  assert.match(prompt, /never say "the notes you provided"/);
  assert.match(prompt, /give no example, work or author of your own/);
  assert.match(prompt, /go on to what is new instead of repeating it/);
});

test('only a direct question is answered with the library\'s text: a second clause, a story reference or a request about the shape of the answer goes to the model with the whole message', async () => {
  const asks = [
    ['What is a villanelle, and would it suit a poem about my mother?', 'villanelle'],
    ["What's a sonnet? Please answer in two sentences.", 'sonnet'],
    ['What is noir? I want my detective to be noir, how do I do that?', 'noir'],
    ['In one or two sentences, what is a villanelle?', 'villanelle'],
    ['Should I use a flashback here?', 'flashback'],
  ];
  for (const [q, topic] of asks) {
    const { o, calls } = withModel(() => 'It repeats lines.', { reading: () => ({ task: 'craft', topic }) });
    const r = await say(o, projectWith(), q);
    assert.equal(calls.length, 1, `${q}: the model answers`);
    assert.ok(calls[0].messages.some((m) => m.content.includes(q)), `${q}: it is shown the whole message`);
    assert.equal(r.route, 'local', q);
  }
  const { o, calls } = withModel(() => 'MODEL TEXT', { reading: () => ({ task: 'craft', topic: 'villanelle' }) });
  const r = await say(o, projectWith(), 'What is a villanelle?');
  assert.equal(calls.length, 0, 'a direct question is answered by the library\'s text');
  assert.equal(r.route, 'builtin');
  // a follow-up that carries a clause about the writer's own story is not canned either
  const t = withModel(() => 'It matters in this way.', { reading: () => ({ task: 'craft', topic: '' }) });
  const project = projectWith();
  await say(t.o, project, 'What is noir?');
  const f = await say(t.o, project, 'and the history, does that matter for my detective?');
  assert.equal(t.calls.length, 1, 'the model answers the follow-up that has a story clause');
  assert.equal(f.route, 'local');
});

test('the library\'s text is not used when its first match is a novel for a question about a technique, or was found by keywords alone; a question that names the work still gets the work', async () => {
  for (const q of ['what is a plot twist', 'what is a villain']) {
    const { o, calls } = withModel(() => 'It is a surprise the story has been preparing.', { reading: () => ({ task: 'craft', topic: '' }) });
    const r = await say(o, projectWith(), q);
    assert.equal(calls.length, 1, `${q}: the model answers, with the records it is shown`);
    assert.notEqual(r.route, 'builtin', q);
  }
  const { o, calls } = withModel(() => 'MODEL TEXT', { reading: () => ({ task: 'craft', topic: '' }) });
  for (const q of ['What is Rebecca?', 'Who wrote Rebecca?']) {
    const r = await say(o, projectWith(), q);
    assert.equal(r.route, 'builtin', q);
    assert.match(r.reply, /Rebecca/, q);
  }
  assert.equal(calls.length, 0);
});

test('with an online model the answer is not composed by code: the online model (not measured) answers, and its reply is still checked against the records', async () => {
  const local = { status: () => ({ state: 'ready' }), onStatus: () => () => {}, chat: modelWithReading(() => 'LOCAL TEXT', { reading: () => ({ task: 'craft', topic: 'villanelle' }) }) };
  const online = { configured: true, chat: async () => 'The villanelle repeats two refrain lines.' };
  const o = new Orchestrator({ engine: new AIEngine({ local, online, isOnline: () => true }) });
  const r = await say(o, projectWith(), 'What is a villanelle?');
  assert.equal(r.route, 'online');
  assert.match(r.reply, /repeats two refrain lines/);
});

test('a comparison says when the library holds no note on how the two differ; a book that shares the subject\'s name is not a second card; a movement is not "departed from"', async () => {
  const o = noModel();
  const project = projectWith();
  await say(o, project, 'What is cyberpunk?');
  const r = await say(o, project, 'how is it different from space opera?');
  assert.equal(r.library.follow, 'compare');
  assert.match(r.reply, /Cyberpunk and Space opera, side by side/);
  assert.match(r.reply, /On how they differ, my profile of (?:Cyberpunk|Space opera) says:|I don't hold a separate note on how Cyberpunk and Space opera differ/, 'it either quotes a note or says there is none');
  const haiku = await say(noModel(), projectWith(), 'What is haiku?');
  assert.ok(!/Notable works/.test(haiku.reply), 'the book "Haiku" is not shown as a second card under the form');
  assert.match(haiku.reply, /\*\*Haiku\*\*  ·  Forms/);
  const romanticism = await say(noModel(), projectWith(), 'What is Romanticism?');
  assert.ok(!/Departing from it can be legitimate: .*Romantic tradition/.test(romanticism.reply), 'a movement is not a rule to depart from');
});

test('a question that uses a word from the writer\'s own recent story messages is about the story, not a library question the library cannot answer', async () => {
  const o = noModel();
  const project = projectWith();
  await say(o, project, "My heroine is trapped in her aunt's house and starts hearing someone in the walls.");
  const r = await say(o, project, 'What does the aunt hide?');
  assert.notEqual(r.intent.type, 'library-question');
  assert.ok(!/isn't in my built-in library/.test(r.reply));
});

test('the subject of a thread is the one the question names, even when the closest entries are about something else; a follow-up phrase never renames it', async () => {
  const o = noModel();
  const project = projectWith();
  const r = await say(o, project, 'what are the tropes of romance?');
  assert.equal(project.conversation.library.subject.id, 'romance', 'answered by entries about particular tropes, but the conversation is about Romance');
  assert.equal(r.library.subject, 'Romance');
  const h = await say(o, project, 'and the history?');
  assert.equal(h.library.follow, 'facet');
  assert.equal(project.conversation.library.subject.id, 'romance', '"the history" is a facet, not a subject called History');
  assert.match(h.reply, /^Romance, history and origins:/);
  const more = await say(o, project, 'tell me more');
  assert.match(more.reply, /^More on Romance/);
  // the answer's own first entry still names the subject when the question does not
  const plain = await say(o, projectWith(), 'What is free indirect discourse?');
  assert.match(plain.library.subject, /free indirect/i);
});
