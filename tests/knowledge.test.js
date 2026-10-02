import test from 'node:test';
import assert from 'node:assert/strict';
import { KNOWLEDGE, search, resolveTerms, forProfile, describeForPrompt, getEntry, USAGE_NOTE } from '../apps/web/src/engine/knowledge/index.js';

test('library covers every kind the spec names', () => {
  const kinds = new Set(KNOWLEDGE.map((k) => k.kind));
  for (const k of ['genre', 'structure', 'style', 'form', 'technique']) assert.ok(kinds.has(k), `missing kind ${k}`);
  assert.ok(KNOWLEDGE.length >= 150);
  assert.equal(new Set(KNOWLEDGE.map((k) => k.id)).size, KNOWLEDGE.length, 'ids must be unique');
});

test('spec-listed subgenres, structures, styles and forms are present', () => {
  const want = [
    // genres
    'psychological-horror', 'cosmic-horror', 'body-horror', 'folk-horror', 'analog-horror', 'found-footage',
    'cyberpunk', 'solarpunk', 'time-travel', 'alternate-history', 'urban-fantasy', 'sword-and-sorcery',
    'noir', 'satire', 'tragedy', 'western', 'young-adult', 'childrens-literature',
    // structures
    'three-act', 'five-act', 'heros-journey', 'nonlinear', 'circular', 'nested', 'frame-narrative', 'episodic', 'braided',
    'reverse-chronology', 'in-medias-res', 'vignette', 'anthology', 'epistolary-structure', 'mystery-box-structure',
    // styles
    'minimalist-prose', 'maximalist-prose', 'lyrical-prose', 'clinical-prose', 'second-person', 'third-person-limited',
    'third-person-omniscient', 'objective-narration', 'unreliable-narration', 'stream-of-consciousness',
    // forms
    'screenplay', 'stage-play', 'comic-script', 'journal', 'memoir', 'essay', 'report', 'news-narrative', 'documentary-script', 'poetry', 'interactive-narrative',
  ];
  for (const id of want) assert.ok(getEntry(id), `missing ${id}`);
});

test('every entry is reference material with a summary; unusual-choice guidance exists where it matters', () => {
  for (const k of KNOWLEDGE) assert.ok(k.summary.length > 15, k.id);
  assert.ok(getEntry('unreliable-narration').deliberateWhen.join(' ').toLowerCase().includes('contradiction'));
  assert.ok(getEntry('surrealism').deliberateWhen.join(' ').toLowerCase().includes('not continuity errors'));
  assert.match(USAGE_NOTE, /never rules/i);
});

test('search finds relevant craft knowledge for natural language questions', () => {
  assert.ok(search('how do I make my mystery harder to solve').slice(0, 3).some((e) => e.id === 'mystery-clue-design'));
  assert.equal(search('unreliable narrator contradictions')[0].id, 'unreliable-narration');
  assert.equal(search('emotionally devastating but not melodramatic')[0].id, 'emotional-restraint');
  assert.ok(search('a homeless man befriends a cat').some((e) => e.id === 'companionship-arc'));
  assert.deepEqual(search('zzzz qqqq'), []);
});

test('a cat story does not retrieve a beat-sheet structure by keyword accident', () => {
  assert.ok(!search('a homeless man befriends a cat').some((e) => e.id === 'beat-sheet'));
});

test('profile terms resolve to library entries', () => {
  const ids = resolveTerms(['psychological horror', 'fragmented', 'third person limited', 'Report']).map((e) => e.id);
  assert.deepEqual(ids, ['psychological-horror', 'fragmented', 'third-person-limited', 'report']);
  const fp = forProfile({ genre: { primary: 'Noir', secondary: ['satire'] }, identity: { format: 'screenplay' } }).map((e) => e.id);
  assert.deepEqual(fp.sort(), ['noir', 'satire', 'screenplay']);
});

test('prompt rendering respects its budget', () => {
  const text = describeForPrompt(KNOWLEDGE.slice(0, 40), 600);
  assert.ok(text.length <= 600);
  assert.ok(text.startsWith('- '));
});
