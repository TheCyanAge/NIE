import { h, $, $$, clear, pageHead } from '../dom.js';
import { ACCEPT, SUPPORTED_FORMATS } from '../../engine/ingest/extract.js';
import { Narrator } from '../../engine/readaloud/narrator.js';
import { inferForm } from '../../engine/intent/form.js';
import { importFileIntoStory, snapshotFile } from './import.js';
import { words } from '../../engine/util/text.js';

/**
 * Read mode: bring a document in (any supported format → Story Text), read it aloud with pause/resume and section
 * navigation, and carry on into Full Scan or Brainstorm. The text is the project's Story Text, not a separate copy.
 */
export function mountRead(root, app) {
  const narrator = new Narrator();
  let tab = 'listen'; // 'listen' | 'edit'

  const fileInput = h('input', { type: 'file', accept: ACCEPT, hidden: true, id: 'read-input', 'aria-label': 'Choose a document' });
  fileInput.addEventListener('change', async () => { const f = await snapshotFile(fileInput.files?.[0]); fileInput.value = ''; if (f) await importFileIntoStory(app, f); });
  const drop = h('div', { class: 'dropzone', id: 'dropzone', tabindex: '0', role: 'button', 'aria-label': 'Choose or drop a document', onclick: () => pick(), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } } },
    h('strong', {}, 'Drop a document here, or choose one'),
    h('span', { class: 'muted' }, SUPPORTED_FORMATS.map((f) => f.label).join(' · ')));
  async function pick() {
    if (window.NIE_DESKTOP?.openFile) { const f = await window.NIE_DESKTOP.openFile(); if (f) await importFileIntoStory(app, f); } else fileInput.click();
  }
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', async (e) => { const f = await snapshotFile(e.dataTransfer?.files?.[0]); if (f) await importFileIntoStory(app, f); });

  const info = h('div', { class: 'read-info', id: 'read-info' });
  const listenBtn = h('button', { class: 'seg-btn is-active', onclick: () => setTab('listen') }, 'Listen');
  const editBtn = h('button', { class: 'seg-btn', onclick: () => setTab('edit') }, 'Edit');
  const page = h('div', { class: 'read-page', id: 'read-page', tabindex: '0', 'aria-label': 'Document text' });
  const editor = h('textarea', { id: 'read-editor', class: 'story-text', hidden: true, 'aria-label': 'Edit the document text', spellcheck: 'true' });
  editor.addEventListener('input', () => { app.project.storyText = editor.value; app.project.source = null; app.saveSoon(); narrator.load(editor.value); info.dataset.dirty = '1'; });

  const play = h('button', { class: 'btn btn-primary', id: 'read-play', onclick: () => (narrator.state === 'playing' ? narrator.pause() : narrator.play()) }, '▶ Read aloud');
  const stopBtn = h('button', { class: 'btn', id: 'read-stop', onclick: () => narrator.stop() }, '■ Stop');
  const prev = h('button', { class: 'btn', id: 'read-prev', 'aria-label': 'Previous section', onclick: () => narrator.prevSection() }, '⏮');
  const next = h('button', { class: 'btn', id: 'read-next', 'aria-label': 'Next section', onclick: () => narrator.nextSection() }, '⏭');
  const rate = h('select', { class: 'select', id: 'read-rate', 'aria-label': 'Speed', onchange: () => narrator.setRate(rate.value) }, ...[0.75, 1, 1.25, 1.5, 2].map((r) => h('option', { value: r, selected: r === 1 ? true : null }, `${r}×`)));
  const voice = h('select', { class: 'select', id: 'read-voice', 'aria-label': 'Voice', onchange: () => narrator.setVoice(narrator.voices().find((v) => v.name === voice.value) ?? null) });
  const where = h('span', { class: 'muted', id: 'read-where' });
  const controls = h('div', { class: 'read-controls', 'data-tour': 'read-controls' }, prev, play, stopBtn, next, rate, voice, where);
  const unsupported = h('p', { class: 'banner banner-warn', id: 'read-unsupported', hidden: true }, 'Read-aloud is not available in this environment (no speech voices found). You can still import, edit, scan and discuss your text.');

  const toScan = h('button', { class: 'btn', id: 'read-to-scan', onclick: () => { app.setView('scan'); app.emit('runScan'); } }, 'Scan this against my rules');
  const toBrain = h('button', { class: 'btn', onclick: () => { app.setView('brainstorm'); } }, 'Talk about it with NIE');

  root.append(h('div', { class: 'read' },
    pageHead({ eyebrow: 'Read', title: 'Read anything with NIE', sub: 'Import a story, report, journal, essay or script. It becomes your Story Text, so NIE can read it to you, scan it against your rules and talk it through.' }),
    drop, fileInput, info,
    h('div', { class: 'read-actions' }, h('div', { class: 'seg', role: 'group', 'aria-label': 'Mode' }, listenBtn, editBtn), toScan, toBrain),
    unsupported, controls, page, editor));

  function setTab(next) {
    tab = next;
    listenBtn.classList.toggle('is-active', tab === 'listen');
    editBtn.classList.toggle('is-active', tab === 'edit');
    page.hidden = tab !== 'listen';
    editor.hidden = tab !== 'edit';
    controls.hidden = tab !== 'listen';
    if (tab === 'edit') { narrator.stop(); editor.value = app.project.storyText; editor.focus(); }
    else if (info.dataset.dirty) { delete info.dataset.dirty; load(); }
  }

  /** Paint the text as paragraphs; each paragraph is a navigable section. */
  function paint() {
    clear(page);
    const text = app.project.storyText;
    if (!text.trim()) { page.append(h('p', { class: 'empty-note' }, 'Nothing to read yet. Import a document above, or type in Full Scan.')); return; }
    const { chunks, sections } = narrator;
    let cursor = 0;
    const frag = document.createDocumentFragment();
    chunks.forEach((c, i) => {
      if (c.start > cursor) frag.append(text.slice(cursor, c.start));
      frag.append(h('span', { class: 'chunk', dataset: { i, section: c.section }, onclick: () => { narrator.seek(i); if (narrator.state === 'idle') narrator.play(); } }, text.slice(c.start, c.end)));
      cursor = c.end;
    });
    if (cursor < text.length) frag.append(text.slice(cursor));
    page.append(frag);
    void sections;
  }

  function describe() {
    clear(info);
    const p = app.project;
    const text = p.storyText;
    if (!text.trim()) return;
    const guess = inferForm(text);
    const bits = [];
    if (p.source) bits.push(h('span', { class: 'tag' }, p.source.label), `“${p.source.name}”`);
    bits.push(`${words(text).length.toLocaleString()} words`);
    const declared = p.profile.identity.format;
    const form = declared || (guess.confidence >= 0.55 ? guess.label.toLowerCase() : null);
    const storyLike = !form || /novel|short story|prose|fiction|screenplay|play|comic|poetry|poem/.test(form);
    info.append(
      h('p', {}, ...bits.flatMap((b, i) => (i ? [' · ', b] : [b]))),
      form ? h('p', { class: 'muted' }, `NIE will read this as ${/^[aeiou]/.test(form) ? 'an' : 'a'} ${form}${declared ? ' (from your profile)' : ''}${storyLike ? '' : ', on its own terms: no plot or character arc expected'}.`) : null
    );
  }

  let loadedText = null;
  function load() {
    loadedText = app.project.storyText;
    narrator.load(app.project.storyText);
    paint();
    describe();
    renderVoices();
    updateControls(narrator.snapshot());
  }

  function renderVoices() {
    const voices = narrator.voices();
    clear(voice);
    voice.append(h('option', { value: '' }, voices.length ? 'Default voice' : 'No voices'));
    for (const v of voices) voice.append(h('option', { value: v.name }, `${v.name}${v.lang ? ` (${v.lang})` : ''}`));
    unsupported.hidden = narrator.supported && voices.length > 0;
  }
  if (narrator.supported) narrator.synth.addEventListener?.('voiceschanged', renderVoices);

  function updateControls(s) {
    play.textContent = s.state === 'playing' ? '⏸ Pause' : s.state === 'paused' ? '▶ Resume' : '▶ Read aloud';
    play.disabled = !narrator.supported || !s.total;
    stopBtn.disabled = s.state === 'idle' || s.state === 'done';
    where.textContent = s.total ? `Section ${s.section + 1} of ${Math.max(1, narrator.sections.length)}` : '';
    $$('.chunk.is-current', page).forEach((c) => c.classList.remove('is-current'));
    if (s.state === 'playing' || s.state === 'paused') {
      const el = $(`.chunk[data-i="${s.index}"]`, page);
      if (el) { el.classList.add('is-current'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    }
  }
  narrator.on(updateControls);

  function render() {
    narrator.stop();
    tab = 'listen';
    page.hidden = false; editor.hidden = true; controls.hidden = false;
    listenBtn.classList.add('is-active'); editBtn.classList.remove('is-active');
    load();
  }
  app.on('project', render);
  app.on('storyChanged', () => { if (tab === 'edit') editor.value = app.project.storyText; load(); });
  app.on('view', (v) => { if (v !== 'read') narrator.stop(); else if (loadedText !== app.project.storyText || info.dataset.dirty) { delete info.dataset.dirty; load(); } });
  render();
  return { focus: () => (tab === 'edit' ? editor.focus() : drop.focus()), primaryInput: () => (tab === 'edit' ? editor : null) };
}
