import test from 'node:test';
import assert from 'node:assert/strict';
import { createEmptyProfile, normalizeProfile, profileToPromptBlock, isProfileEmpty } from '../apps/web/src/engine/profile/profile.js';
import { interpretProfile } from '../apps/web/src/engine/profile/interpret.js';

const prof = (over) => normalizeProfile({ ...createEmptyProfile(), ...over });

test('empty profile is valid and NIE stays useful with nothing declared', () => {
  const p = createEmptyProfile();
  assert.ok(isProfileEmpty(p));
  assert.equal(profileToPromptBlock(p), '');
  const i = interpretProfile(p);
  assert.equal(i.form.id, 'prose-fiction');
  assert.ok(Object.values(i.flags).every((v) => v === false));
});

test('normalizeProfile coerces messy input and carries nothing across', () => {
  const p = normalizeProfile({ tone: 'dark, hopeful; absurd', genre: { secondary: 'noir\nsatire' }, junk: 'ignored', identity: { title: '  Apply ' } });
  assert.deepEqual(p.tone, ['dark', 'hopeful', 'absurd']);
  assert.deepEqual(p.genre.secondary, ['noir', 'satire']);
  assert.equal(p.identity.title, 'Apply');
  assert.ok(!('junk' in p));
});

test('prompt block includes what the writer declared and omits the rest', () => {
  const block = profileToPromptBlock(prof({ identity: { title: 'Apply', format: 'novel' }, genre: { primary: 'psychological horror' }, deliberateAbnormalities: ['Tense slips during panic scenes'] }));
  assert.match(block, /Title: Apply/);
  assert.match(block, /Genre: psychological horror/);
  assert.match(block, /Deliberate abnormalities/);
  assert.ok(!/World rules/.test(block));
});

test('fragmented / experimental narrative: fragmentation and shifts are tolerated, not errors', () => {
  const i = interpretProfile(prof({ narrative: { structure: 'Experimental fragmented narrative' } }));
  assert.ok(i.flags.fragmented && i.flags.experimental);
  assert.ok(i.tolerates('tenseShift'));
  assert.ok(i.tolerates('povShift'));
  assert.ok(i.tolerates('fragments'));
  assert.match(i.why('tenseShift'), /fragment/i);
});

test('unreliable narrator: contradictions may be intentional', () => {
  const i = interpretProfile(prof({ narrative: { reliability: 'Unreliable narrator' } }));
  assert.ok(i.flags.unreliable);
  assert.ok(i.tolerates('contradiction'));
  assert.ok(!i.tolerates('tenseShift'), 'unreliability alone does not excuse tense errors');
});

test('surrealism: impossible events are not continuity errors', () => {
  const i = interpretProfile(prof({ genre: { primary: 'Surrealism' } }));
  assert.ok(i.tolerates('impossibleEvents'));
  assert.ok(i.tolerates('contradiction'));
});

test('clinical realism: ornate language is worth discussing', () => {
  const i = interpretProfile(prof({ style: { prose: 'clinical, detached' }, tone: ['clinical realism'] }));
  assert.ok(i.flags.clinical);
  assert.ok(i.watchesOrnateLanguage);
  assert.ok(!i.tolerates('longSentences'));
});

test('deliberate repetition, stream-of-consciousness and maximalism each earn their own tolerance', () => {
  assert.ok(interpretProfile(prof({ style: { prose: 'Hypnotic repetition with refrains' } })).tolerates('repetition'));
  assert.ok(interpretProfile(prof({ style: { prose: 'stream-of-consciousness' } })).tolerates('longSentences'));
  assert.ok(interpretProfile(prof({ style: { prose: 'maximalist and ornate' } })).tolerates('longSentences'));
  assert.ok(!interpretProfile(prof({ style: { prose: 'plain' } })).tolerates('repetition'));
});

test('abnormalities the writer lists are honoured', () => {
  const i = interpretProfile(prof({ deliberateAbnormalities: ['Narrator slips between tenses when frightened'] }));
  assert.ok(i.tolerates('tenseShift'));
  assert.match(i.why('tenseShift'), /listed this as deliberate/);
});

test('POV and tense are read from the profile', () => {
  const i = interpretProfile(prof({ style: { pov: 'First person', tense: 'Present' } }));
  assert.equal(i.pov, 'first');
  assert.equal(i.tense, 'present');
  assert.equal(interpretProfile(prof({ style: { pov: 'third person limited' } })).pov, 'third');
  assert.equal(interpretProfile(prof({ style: { pov: 'third person omniscient' } })).pov, 'omniscient');
});

test('form drives expectations: journals, reports and essays do not need plots, arcs or dialogue', () => {
  for (const format of ['journal', 'report', 'essay', 'news-style narrative']) {
    const i = interpretProfile(prof({ identity: { format } }));
    assert.equal(i.form.traits.plot, false, format);
    assert.equal(i.form.traits.characterArc, false, format);
    assert.equal(i.form.traits.dialogue, false, format);
    assert.equal(i.form.traits.nonFiction, true, format);
  }
  const novel = interpretProfile(prof({ identity: { format: 'novel' } }));
  assert.equal(novel.form.traits.plot, true);
  assert.equal(novel.form.traits.nonFiction, false);
});

test('form can be inferred from the text when the profile does not say', () => {
  const i = interpretProfile(createEmptyProfile(), { text: 'Executive Summary\nThe team reviewed the data and found a gap.\n\nFindings\nRevenue rose 4%.\n\nRecommendations\nContinue the pilot.' });
  assert.equal(i.form.id, 'report');
  assert.equal(i.form.source, 'text');
  assert.equal(i.form.traits.plot, false);
});

test('poetry tolerates repetition by form alone', () => {
  assert.ok(interpretProfile(prof({ identity: { format: 'poetry' } })).tolerates('repetition'));
});
