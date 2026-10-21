import test from 'node:test';
import assert from 'node:assert/strict';
import { KNOWLEDGE, loadLibrary, answerFromLibrary, facetsAsked, PROFILE_FACETS, getEntry, libraryStats } from '../apps/web/src/engine/knowledge/index.js';

await loadLibrary();
const profiles = KNOWLEDGE.filter((k) => k.kind === 'profile');
const subjectOf = (p) => p.name.split(':')[0].replace(/\s*\(.*?\)\s*/g, ' ').trim();

// Profiles are one facet each of a genre, form, tradition or movement (library/README.md, "Profiles"). These tests are data-driven: they run over EVERY profile in the library, so every file added
// later is held to the same standard without anyone writing a test for it.

test('profiles: every profile belongs to an entry that exists, has a facet, and is named for its subject', () => {
  assert.ok(profiles.length >= 9, `${profiles.length} profiles`);
  for (const p of profiles) {
    assert.ok(getEntry(p.parent), `${p.id}: parent ${p.parent} exists`);
    assert.ok(PROFILE_FACETS[p.topic], `${p.id}: facet ${p.topic}`);
    assert.ok(p.conventions.length >= 5, `${p.id}: has substance`);
    assert.match(p.name, /^[^:]+: [a-z]/);
  }
  const bySubject = new Map();
  for (const p of profiles) bySubject.set(p.parent, new Set([...(bySubject.get(p.parent) ?? []), p.topic]));
  for (const [parent, facets] of bySubject) assert.ok(facets.size >= 5, `${parent} has ${facets.size} facets: a subject is profiled in full or not at all`);
});

test('profiles: the question for each facet finds that facet (at least 92% of all profiles, first or second answer)', () => {
  const misses = [];
  for (const p of profiles) {
    const q = PROFILE_FACETS[p.topic].ask(subjectOf(p));
    const a = answerFromLibrary(q, { limit: 3 });
    const ok = a.strength !== 'none' && a.entries.slice(0, 2).some((e) => e.id === p.id);
    if (!ok) misses.push(`${q} -> ${a.strength}: ${a.entries.map((e) => e.name).join(' | ')} (wanted ${p.id})`);
  }
  assert.ok(misses.length <= Math.ceil(profiles.length * 0.08), `${misses.length} of ${profiles.length} missed:\n${misses.slice(0, 25).join('\n')}`);
});

test('profiles: the way a writer words it (the record\'s own keywords) also finds it', () => {
  const misses = [];
  for (const p of profiles) {
    const q = p.keywords.find((k) => k.split(' ').length >= 3) ?? p.keywords[0];
    const a = answerFromLibrary(q, { limit: 3 });
    const ok = a.strength !== 'none' && a.entries.slice(0, 3).some((e) => e.parent === p.parent || e.id === p.parent);
    if (!ok) misses.push(`${q} -> ${a.strength}: ${a.entries.map((e) => e.name).join(' | ')} (wanted something about ${p.parent})`);
  }
  assert.ok(misses.length <= Math.ceil(profiles.length * 0.08), `${misses.length} of ${profiles.length} missed:\n${misses.slice(0, 25).join('\n')}`);
});

test('profiles: "what is X?" is still answered by X itself, not by one of its facets', () => {
  const wrong = [];
  const seen = new Set();
  for (const p of profiles) {
    if (seen.has(p.parent)) continue;
    seen.add(p.parent);
    const parent = getEntry(p.parent);
    const a = answerFromLibrary(`What is ${parent.name.replace(/\s*\(.*?\)\s*/g, ' ').trim()}?`, { limit: 3 });
    if (a.entries[0]?.kind === 'profile') wrong.push(`${parent.name} -> ${a.entries[0].name}`);
  }
  assert.ok(wrong.length <= Math.ceil(seen.size * 0.08), `the facet answered instead of the subject:\n${wrong.join('\n')}`);
});

test('profiles: which facets a question asks for', () => {
  assert.deepEqual([...facetsAsked('What are the subgenres of fantasy?')], ['subgenres']);
  assert.ok(facetsAsked('How did the detective story begin?').has('history'));
  assert.ok(facetsAsked('What do romance readers expect?').has('readers'));
  assert.ok(facetsAsked("What's the difference between noir and hardboiled?").has('compare'));
  assert.ok(facetsAsked('Who are the key authors of magical realism?').has('canon'));
  assert.ok(facetsAsked('Common tropes in cozy mysteries').has('tropes'));
  assert.equal(facetsAsked('What is a villanelle?').size, 0);
  assert.equal(facetsAsked('').size, 0);
  assert.equal(facetsAsked(null).size, 0);
});

test('profiles: counted honestly in the library stats', () => {
  const st = libraryStats();
  assert.equal(st.byKind.profile, profiles.length);
});

test('profiles: a profile answers only for the subject the question names (the subgenres of fantasy were once answered with those of Gothic fiction)', () => {
  const subjects = ['Fantasy', 'Romance', 'Science fiction', 'the sonnet', 'Quantum basketweaving', 'Epic poetry', 'Comics'];
  const wrong = [];
  for (const subject of subjects) {
    for (const f of Object.values(PROFILE_FACETS)) {
      const q = f.ask(subject);
      const a = answerFromLibrary(q, { limit: 3 });
      // only a profile whose subject the question names may be an ANSWER; a profile may be listed as "related" when the question names part of its subject ("Fantasy" and "Dark fantasy: subgenres")
      const nameWords = (parent) => [parent?.name, ...(parent?.aka ?? [])].filter(Boolean).flatMap((n) => n.replace(/\s*\(.*?\)\s*/g, ' ').split(/[:;]/)[0].toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !['fiction', 'poetry', 'literature', 'writing'].includes(w)));
      for (const e of [...a.entries, ...a.related.slice(0, 1)].filter((x) => x.kind === 'profile')) {
        const parent = getEntry(e.parent);
        const names = [parent?.name, ...(parent?.aka ?? [])].filter(Boolean).map((n) => n.replace(/\s*\(.*?\)\s*/g, ' ').split(/[:;]/)[0].trim().toLowerCase());
        const named = names.some((n) => q.toLowerCase().includes(n));
        const partly = nameWords(parent).some((w) => q.toLowerCase().includes(w));
        if (!named && !(partly && !a.entries.includes(e))) wrong.push(`${q} -> ${e.id}`);
      }
    }
  }
  assert.deepEqual(wrong, []);
  // and naming the subject in other words than the full name still finds it
  assert.equal(answerFromLibrary('gothic subgenres').entries[0].id, 'profile-gothic-fiction-subgenres');
  assert.equal(answerFromLibrary('history of gothic').entries[0].id, 'profile-gothic-fiction-history');
  assert.equal(answerFromLibrary('What is gothic fiction?').entries[0].id, 'genre-spec-gothic-fiction', 'a plain "what is" is still answered by the subject\'s own entry');
});
