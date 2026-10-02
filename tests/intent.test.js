import test from 'node:test';
import assert from 'node:assert/strict';
import { detectIntent, updateWorkingPremise, extractPremiseCues, emptyWorkingPremise } from '../apps/web/src/engine/intent/intent.js';
import { inferForm } from '../apps/web/src/engine/intent/form.js';

const T = (msg, opts) => detectIntent(msg, opts).type;

test('writer with nothing yet is recognised as starting from zero', () => {
  assert.equal(T("I have an idea but I don't know how to start."), 'start-from-zero');
  assert.equal(T("I don't know what to write."), 'start-from-zero');
  assert.equal(T('Where do I even begin?'), 'start-from-zero');
});

test('a premise is a premise, and carries its own context rather than another project\'s', () => {
  const i = detectIntent('A homeless man befriends a cat.');
  assert.equal(i.type, 'share-premise');
  assert.deepEqual(i.premiseCues.characters, ['homeless man', 'cat']);
  assert.ok(['loneliness', 'companionship'].every((t) => i.premiseCues.themes.includes(t)));
  assert.equal(i.premiseCues.reality, 'realist');
  assert.ok(!i.premiseCues.modes.includes('horror'));
});

test('the spec\'s brainstorming examples route sensibly', () => {
  assert.equal(T('What if my protagonist was actually the villain?'), 'what-if');
  assert.equal(T('How could I make this mystery harder?'), 'request-ideas');
  assert.equal(T('I need a reason these two characters would become friends.'), 'request-ideas');
  assert.equal(T('What kind of horror would work with this setting?'), 'request-ideas');
  assert.equal(T('Does this ending feel too predictable?'), 'feedback-request');
  assert.equal(T('I want something emotionally devastating but not melodramatic.'), 'request-ideas');
  assert.equal(T('What is an unreliable narrator?'), 'craft-question');
  assert.equal(T('Rewrite this paragraph so it flows better'), 'request-rewrite');
});

test('"Actually…" is a change of direction only when there is something to change from', () => {
  const msg = 'Actually, the cat is secretly observing him for something.';
  assert.notEqual(T(msg), 'direction-change');
  const i = detectIntent(msg, { hasHistory: true });
  assert.equal(i.type, 'direction-change');
  assert.equal(i.direction.changed, true);
  assert.equal(i.premiseCues.reality, 'speculative');
});

test('working premise adapts when the writer changes direction, and does not stack stale assumptions', () => {
  const m1 = 'A homeless man befriends a cat.';
  let wp = updateWorkingPremise(null, m1, detectIntent(m1));
  assert.equal(wp.reality, 'realist');
  assert.ok(wp.themes.includes('loneliness'));
  const m2 = 'Actually, the cat is secretly observing him for something.';
  wp = updateWorkingPremise(wp, m2, detectIntent(m2, { hasHistory: true }));
  assert.equal(wp.reality, 'speculative');
  assert.equal(wp.revisions.length, 1);
  assert.equal(wp.themes[0], 'deception', 'new direction takes priority');
});

test('non-premise chatter does not rewrite the premise', () => {
  const wp = updateWorkingPremise({ ...emptyWorkingPremise(), summary: 'x', reality: 'realist' }, 'thanks', detectIntent('thanks'));
  assert.equal(wp.summary, 'x');
});

test('premise cues for mystery/horror/comic are detected from the writer\'s own words only', () => {
  assert.ok(extractPremiseCues('A magician is murdered backstage at a failing theatre').modes.includes('mystery'));
  assert.ok(!extractPremiseCues('A homeless man befriends a cat').modes.includes('mystery'));
  assert.ok(extractPremiseCues('A haunted lighthouse and a nightmare that stalks the keeper').modes.includes('horror'));
});

test('form sniffing reads reports, journals, scripts and poems on their own terms', () => {
  assert.equal(inferForm('INT. KITCHEN - NIGHT\n\nMARA sits alone.\n\nMARA\nIt is late.').id, 'screenplay');
  assert.equal(inferForm('Executive Summary\nThe team reviewed the data.\n\nFindings\nRevenue rose 4%.\n\nRecommendations\nContinue.').id, 'report');
  assert.equal(inferForm('Monday\nWent to the shop. Nothing in stock.\n\nTuesday\nRained all day.\n\nWednesday\nCalled mum.').id, 'journal');
  assert.equal(inferForm('WASHINGTON (AP) — Officials said Tuesday that the bridge would reopen, according to a statement.').id, 'news-narrative');
  assert.equal(inferForm('The river holds\nits breath\nbefore the bridge\n\nand lets it go\nin small grey stones\nthat do not sink').id, 'poetry');
  assert.equal(inferForm('She opened the door. "Hello," he said. The room smelled of rain and old paper, and neither of them moved.').id, 'prose-fiction');
});
