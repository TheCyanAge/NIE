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
  calls.length = 0;
  const r = await say(o, project, 'and the vocabulary?');
  const prompt = calls.map((c) => c.messages.map((m) => m.content).join('\n')).join('\n');
  assert.match(prompt, /vocabulary of the genre/i, 'the vocabulary record is what the model is shown');
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
