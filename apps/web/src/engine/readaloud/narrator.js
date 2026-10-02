import { splitParagraphs, splitSentences } from '../util/text.js';

/**
 * Read-aloud support. Chromium's speechSynthesis stalls on long utterances, so text is spoken in short chunks
 * (sentences grouped up to ~220 chars), which also gives us precise pause/resume and section navigation.
 */

export function chunkForSpeech(text, { maxChars = 220 } = {}) {
  const chunks = [];
  const sections = [];
  for (const p of splitParagraphs(text)) {
    const sectionIndex = sections.length;
    const first = chunks.length;
    let cur = null;
    const push = () => {
      if (cur) chunks.push({ ...cur, section: sectionIndex });
      cur = null;
    };
    for (const s of splitSentences(p.text)) {
      const abs = { text: s.text, start: p.start + s.start, end: p.start + s.end };
      // A single enormous sentence is broken at commas/semicolons so speech never stalls.
      const pieces = abs.text.length > maxChars ? breakLong(abs, maxChars) : [abs];
      for (const piece of pieces) {
        if (cur && cur.text.length + 1 + piece.text.length <= maxChars) {
          cur.text += ' ' + piece.text;
          cur.end = piece.end;
        } else {
          push();
          cur = { ...piece };
        }
      }
    }
    push();
    if (chunks.length > first) sections.push({ index: sectionIndex, title: p.text.slice(0, 60), start: p.start, end: p.end, firstChunk: first });
  }
  return { chunks, sections };
}

function breakLong(s, max) {
  const out = [];
  let rest = s;
  while (rest.text.length > max) {
    let cut = Math.max(rest.text.lastIndexOf(', ', max), rest.text.lastIndexOf('; ', max), rest.text.lastIndexOf(' ', max));
    if (cut < max * 0.4) cut = max;
    const head = rest.text.slice(0, cut + 1).trim();
    out.push({ text: head, start: rest.start, end: rest.start + cut + 1 });
    rest = { text: rest.text.slice(cut + 1).trim(), start: rest.start + cut + 1, end: rest.end };
  }
  if (rest.text) out.push(rest);
  return out;
}

/** Playback controller. `synth` and `Utterance` are injectable so the state machine is testable. */
export class Narrator {
  constructor({ synth = globalThis.speechSynthesis, Utterance = globalThis.SpeechSynthesisUtterance } = {}) {
    this.synth = synth;
    this.Utterance = Utterance;
    this.chunks = [];
    this.sections = [];
    this.index = 0;
    this.state = 'idle'; // idle | playing | paused | done
    this.rate = 1;
    this.voice = null;
    this._token = 0;
    this.listeners = new Set();
  }

  get supported() {
    return Boolean(this.synth && this.Utterance);
  }

  on(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  #emit() {
    const snap = this.snapshot();
    for (const cb of this.listeners) cb(snap);
  }

  snapshot() {
    return { state: this.state, index: this.index, total: this.chunks.length, chunk: this.chunks[this.index] ?? null, section: this.currentSection(), sections: this.sections.length };
  }

  load(text) {
    this.stop();
    ({ chunks: this.chunks, sections: this.sections } = chunkForSpeech(text));
    this.index = 0;
    this.state = 'idle';
    this.#emit();
    return this.chunks.length;
  }

  currentSection() {
    const c = this.chunks[this.index];
    return c ? c.section : 0;
  }

  voices() {
    return this.synth?.getVoices?.() ?? [];
  }

  setRate(r) {
    this.rate = Math.min(2.5, Math.max(0.5, Number(r) || 1));
    if (this.state === 'playing') this.#speak(this.index); // apply immediately from the current chunk
  }

  setVoice(v) {
    this.voice = v;
    if (this.state === 'playing') this.#speak(this.index);
  }

  play() {
    if (!this.supported || !this.chunks.length) return;
    if (this.state === 'paused') return this.resume();
    if (this.state === 'done') this.index = 0;
    this.state = 'playing';
    this.#speak(this.index);
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.synth.pause();
    this.#emit();
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.synth.resume();
    this.#emit();
  }

  stop() {
    this._token++;
    this.synth?.cancel?.();
    if (this.state !== 'idle') {
      this.state = 'idle';
      this.#emit();
    }
  }

  /** Jump to a chunk (e.g. from a click on the text). */
  seek(index) {
    this.index = Math.min(Math.max(0, index), Math.max(0, this.chunks.length - 1));
    if (this.state === 'playing' || this.state === 'paused') {
      this.state = 'playing';
      this.#speak(this.index);
    } else this.#emit();
  }

  nextSection() {
    const s = this.sections[this.currentSection() + 1];
    if (s) this.seek(s.firstChunk);
  }

  prevSection() {
    const cur = this.currentSection();
    const startOfCur = this.sections[cur]?.firstChunk ?? 0;
    // Pressing "previous" mid-section restarts the section; pressing it at the start goes back one.
    const target = this.index > startOfCur ? cur : Math.max(0, cur - 1);
    this.seek(this.sections[target]?.firstChunk ?? 0);
  }

  #speak(i) {
    const token = ++this._token;
    this.synth.cancel();
    const chunk = this.chunks[i];
    if (!chunk) {
      this.state = 'done';
      this.#emit();
      return;
    }
    this.index = i;
    const u = new this.Utterance(chunk.text);
    u.rate = this.rate;
    if (this.voice) u.voice = this.voice;
    u.onend = () => {
      if (token !== this._token || this.state !== 'playing') return;
      this.#speak(i + 1);
    };
    u.onerror = (e) => {
      if (token !== this._token) return;
      if (e?.error === 'canceled' || e?.error === 'interrupted') return;
      this.state = 'idle';
      this.error = e?.error ?? 'speech failed';
      this.#emit();
    };
    this.#emit();
    this.synth.speak(u);
  }
}
