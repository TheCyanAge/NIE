import test from 'node:test';
import assert from 'node:assert/strict';
import { ProjectStore, memoryStorage, webStorage, STORAGE_NAMESPACE } from '../apps/web/src/engine/project/store.js';
import { addRule } from '../apps/web/src/engine/rules/rules.js';
import { rememberCharacter, rememberItem, appendMessage, memoryToPromptBlock, markIntentional, dismissFinding } from '../apps/web/src/engine/project/memory.js';
import { KNOWLEDGE } from '../apps/web/src/engine/knowledge/index.js';
import { updateWorkingPremise, detectIntent } from '../apps/web/src/engine/intent/intent.js';

function seededProject(store, title, secret) {
  const p = store.create({ title, storyText: `${secret} walked into the room.` });
  p.profile.genre.primary = 'horror';
  addRule(p, { text: `${secret} can never leave the house`, category: 'world' });
  rememberCharacter(p, { name: secret, notes: `${secret}'s father is Figure` });
  rememberItem(p, 'motifs', `${secret} avoids eye contact`);
  appendMessage(p, 'user', `Tell me about ${secret}`);
  p.conversation.workingPremise = updateWorkingPremise(null, `${secret} is haunted`, detectIntent(`${secret} is haunted`));
  p.scans.history.push({ headline: `${secret} scan` });
  store.save(p);
  return p;
}

test('a new project starts completely clean, even straight after a rich one', () => {
  const store = new ProjectStore(memoryStorage());
  const a = seededProject(store, 'Apply', 'Samantha');
  const b = store.create({ title: 'Cat story' });

  assert.notEqual(a.id, b.id);
  assert.equal(b.storyText, '');
  assert.equal(b.profile.genre.primary, '');
  assert.deepEqual(b.rules, []);
  assert.deepEqual(b.memory.characters, []);
  assert.deepEqual(b.memory.motifs, []);
  assert.deepEqual(b.conversation.messages, []);
  assert.equal(b.conversation.workingPremise.summary, '');
  assert.deepEqual(b.scans.history, []);
  assert.equal(store.activeId, b.id);

  // Nothing of A can be found anywhere B can reach.
  const blob = JSON.stringify(store.load(b.id));
  assert.ok(!blob.includes('Samantha'));
  assert.equal(memoryToPromptBlock(store.load(b.id)), '');
});

test('creating a project never shares object identity with the previous one', () => {
  const store = new ProjectStore(memoryStorage());
  const a = store.create({ title: 'A' });
  const b = store.create({ title: 'B' });
  a.memory.characters.push({ name: 'Leak', aliases: [], notes: '' });
  assert.deepEqual(b.memory.characters, []);
  assert.notEqual(a.memory, b.memory);
  assert.notEqual(a.profile, b.profile);
});

test('deleting a project removes all of its story context from storage', () => {
  const storage = memoryStorage();
  const store = new ProjectStore(storage);
  const a = seededProject(store, 'Apply', 'Samantha');
  const aKeys = storage.keys().filter((k) => k.includes(a.id));
  assert.ok(aKeys.length > 0);

  store.delete(a.id);
  const leftovers = storage.keys().map((k) => `${k}=${storage.get(k)}`).join('\n');
  assert.ok(!leftovers.includes('Samantha'), 'no story text, canon or conversation may remain');
  assert.ok(!leftovers.includes(a.id));
  assert.equal(store.list().length, 0);
  assert.equal(store.activeId, null);
});

test('deleting the active project falls back to another, or to nothing; a new project is then fresh', () => {
  const store = new ProjectStore(memoryStorage());
  const a = store.create({ title: 'A' });
  const b = store.create({ title: 'B' });
  assert.equal(store.activeId, b.id);
  assert.equal(store.delete(b.id), a.id);
  store.delete(a.id);
  assert.equal(store.activeId, null);
  const fresh = store.ensureActive();
  assert.equal(fresh.title, 'Untitled project');
  assert.deepEqual(fresh.memory.characters, []);
});

test('NIE\'s general narrative knowledge is unaffected by creating or deleting projects', () => {
  const before = KNOWLEDGE.length;
  const store = new ProjectStore(memoryStorage());
  const a = seededProject(store, 'Apply', 'Samantha');
  store.delete(a.id);
  store.create({ title: 'New' });
  assert.equal(KNOWLEDGE.length, before);
  assert.ok(KNOWLEDGE.some((k) => k.id === 'unreliable-narration'));
});

test('project memory and library are different things: only project facts reach the prompt block', () => {
  const store = new ProjectStore(memoryStorage());
  const a = seededProject(store, 'Apply', 'Samantha');
  const block = memoryToPromptBlock(a);
  assert.match(block, /Samantha/);
  assert.match(block, /Current working premise/);
  assert.ok(!/unreliable narrator/i.test(block), 'library knowledge is not part of project memory');
});

test('list / rename / persistence round-trip through storage', () => {
  const storage = memoryStorage();
  const s1 = new ProjectStore(storage);
  const a = s1.create({ title: 'One' });
  s1.rename(a.id, 'Renamed');
  const s2 = new ProjectStore(storage);
  assert.equal(s2.list()[0].title, 'Renamed');
  assert.equal(s2.load(a.id).profile.identity.title, 'Renamed');
  assert.equal(s2.activeId, a.id);
});

test('loading tolerates corrupt and foreign data without leaking it', () => {
  const storage = memoryStorage({ [`${STORAGE_NAMESPACE}project.bad`]: '{not json', [`${STORAGE_NAMESPACE}index`]: JSON.stringify([{ id: 'bad', title: 'x', updatedAt: 1 }]) });
  const store = new ProjectStore(storage);
  assert.equal(store.load('bad'), null);
  const p = store.ensureActive();
  assert.equal(p.title, 'Untitled project');
});

test('eraseAll wipes every project but keeps preferences by default', () => {
  const store = new ProjectStore(memoryStorage());
  seededProject(store, 'Apply', 'Samantha');
  store.setPrefs({ tourOnStartup: false });
  store.eraseAll();
  assert.equal(store.list().length, 0);
  assert.equal(store.getPrefs().tourOnStartup, false);
  store.eraseAll({ keepPrefs: false });
  assert.deepEqual(store.getPrefs({ x: 1 }), { x: 1 });
});

test('writer decisions (intentional / dismissed) live in project memory only', () => {
  const store = new ProjectStore(memoryStorage());
  const a = store.create({ title: 'A' });
  const b = store.create({ title: 'B' });
  const finding = { detector: 'tense-drift', quote: 'She walks in.', key: 'tense@10' };
  markIntentional(a, finding);
  dismissFinding(a, { detector: 'x', quote: 'y' });
  assert.equal(a.memory.intentional.length, 1);
  assert.equal(b.memory.intentional.length, 0);
  assert.equal(b.memory.dismissed.length, 0);
});

test('web storage adapter degrades to memory when localStorage throws', () => {
  const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); }, key() { return null; }, length: 0 };
  const store = new ProjectStore(webStorage(broken));
  const p = store.create({ title: 'Works anyway' });
  assert.equal(store.load(p.id).title, 'Works anyway');
});
