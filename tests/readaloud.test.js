import test from 'node:test';
import assert from 'node:assert/strict';
import { chunkForSpeech, Narrator } from '../apps/web/src/engine/readaloud/narrator.js';

const TEXT = 'The first paragraph has two sentences. Here is the second one.\n\nA second paragraph follows, and it is a little longer than the first.\n\nThird.';

function fakeSynth() {
  const spoken = [];
  const synth = {
    spoken, paused: false, current: null, cancelled: 0,
    speak(u) { this.current = u; spoken.push(u.text); },
    cancel() { this.cancelled++; this.current = null; },
    pause() { this.paused = true; }, resume() { this.paused = false; },
    getVoices: () => [{ name: 'Test' }],
    finish() { const u = this.current; this.current = null; u?.onend?.(); },
  };
  class U { constructor(t) { this.text = t; } }
  return { synth, U };
}

test('chunks keep exact offsets into the source text and group sentences within a paragraph', () => {
  const { chunks, sections } = chunkForSpeech(TEXT);
  assert.equal(sections.length, 3);
  for (const c of chunks) assert.equal(TEXT.slice(c.start, c.end).replace(/\s+/g, ' '), c.text);
  assert.equal(chunks[0].text, 'The first paragraph has two sentences. Here is the second one.');
  assert.deepEqual(chunks.map((c) => c.section), [0, 1, 2]);
});

test('very long sentences are broken so speech never stalls', () => {
  const long = Array.from({ length: 60 }, (_, i) => `word${i}`).join(' ') + ', ' + Array.from({ length: 60 }, (_, i) => `more${i}`).join(' ') + '.';
  const { chunks } = chunkForSpeech(long, { maxChars: 200 });
  assert.ok(chunks.length >= 3);
  assert.ok(chunks.every((c) => c.text.length <= 200));
  assert.equal(chunks.map((c) => c.text).join(' ').replace(/\s+/g, ' '), long.replace(/\s+/g, ' '));
});

test('playback advances chunk by chunk and finishes', () => {
  const { synth, U } = fakeSynth();
  const n = new Narrator({ synth, Utterance: U });
  n.load(TEXT);
  const states = [];
  n.on((s) => states.push(s.state));
  n.play();
  assert.equal(synth.spoken.length, 1);
  synth.finish(); synth.finish(); synth.finish();
  assert.deepEqual(synth.spoken, n.chunks.map((c) => c.text));
  assert.equal(n.state, 'done');
  assert.ok(states.includes('playing') && states.at(-1) === 'done');
  n.play(); // replay from the start
  assert.equal(synth.spoken.at(-1), n.chunks[0].text);
});

test('pause and resume do not skip or repeat; stop cancels everything', () => {
  const { synth, U } = fakeSynth();
  const n = new Narrator({ synth, Utterance: U });
  n.load(TEXT);
  n.play();
  n.pause();
  assert.equal(n.state, 'paused');
  assert.equal(synth.paused, true);
  synth.finish(); // an end event arriving while paused must not advance
  assert.equal(synth.spoken.length, 1);
  n.resume();
  assert.equal(n.state, 'playing');
  assert.equal(synth.paused, false);
  n.stop();
  assert.equal(n.state, 'idle');
  const before = synth.spoken.length;
  synth.finish();
  assert.equal(synth.spoken.length, before, 'stale end events are ignored after stop');
});

test('section navigation: next, previous (restart then back), and seek', () => {
  const { synth, U } = fakeSynth();
  const n = new Narrator({ synth, Utterance: U });
  n.load(TEXT);
  n.play();
  n.nextSection();
  assert.equal(n.currentSection(), 1);
  n.nextSection();
  assert.equal(n.currentSection(), 2);
  n.nextSection(); // already last
  assert.equal(n.currentSection(), 2);
  n.prevSection();
  assert.equal(n.currentSection(), 1);
  n.seek(0);
  assert.equal(synth.spoken.at(-1), n.chunks[0].text);
  n.seek(999);
  assert.equal(n.index, n.chunks.length - 1);
});

test('rate and voice changes apply to the next utterance; unsupported environments are reported, not crashed', () => {
  const { synth, U } = fakeSynth();
  const n = new Narrator({ synth, Utterance: U });
  n.load(TEXT);
  n.setRate(9);
  assert.equal(n.rate, 2.5);
  n.setRate(0.1);
  assert.equal(n.rate, 0.5);
  assert.equal(n.voices()[0].name, 'Test');
  const none = new Narrator({ synth: null, Utterance: null });
  assert.equal(none.supported, false);
  none.load(TEXT);
  none.play();
  assert.equal(none.state, 'idle');
});
