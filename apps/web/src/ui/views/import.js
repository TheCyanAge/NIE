import { h, toast } from '../dom.js';
import { IngestError } from '../../engine/ingest/extract.js';

/**
 * Read a picked or dropped file into memory NOW. A File taken from an <input type="file"> can stop being readable once the
 * input is cleared (newer Chromium, which Electron ships), which showed up as "This file is empty." Desktop files already
 * carry their bytes.
 */
export async function snapshotFile(file) {
  if (!file) return null;
  if (file.bytes) return file;
  return { name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) };
}

/**
 * File → extraction → Story Text. The imported text becomes ordinary Story Text, so it can be scanned, discussed
 * and read aloud like anything the writer typed. Nothing is replaced without asking.
 */
export async function importFileIntoStory(app, file) {
  let result;
  try {
    result = await app.ingest.read(file);
  } catch (err) {
    toast(err instanceof IngestError || err?.code ? err.message : `Could not read this file: ${err?.message ?? err}`, { kind: 'error', ms: 7000 });
    return null;
  }
  const p = app.project;
  let mode = 'replace';
  if (p.storyText.trim()) mode = await askReplace(file.name, result);
  if (mode === 'cancel') return null;
  p.storyText = mode === 'append' ? `${p.storyText.replace(/\s+$/, '')}\n\n\n\n${result.text}` : result.text;
  p.source = { name: file.name, format: result.format, label: result.label, importedAt: Date.now(), title: result.title };
  if (!p.profile.identity.format && result.format !== 'txt') {
    // Don't impose a form; only record what the file was.
  }
  app.saveNow();
  app.emit('storyChanged', { source: p.source });
  for (const w of result.warnings) toast(w, { kind: 'warn', ms: 8000 });
  toast(`Imported ${result.stats.words.toLocaleString()} words from ${file.name} (${result.label}).`, { kind: 'ok' });
  return result;
}

function askReplace(name, result) {
  return new Promise((resolve) => {
    const dlg = h('dialog', { class: 'dialog', 'aria-labelledby': 'imp-title' },
      h('form', { method: 'dialog', class: 'dialog-body' },
        h('h2', { id: 'imp-title' }, 'You already have Story Text'),
        h('p', {}, `“${name}” has ${result.stats.words.toLocaleString()} words. What should NIE do with it?`),
        h('div', { class: 'dialog-actions end' },
          h('button', { class: 'btn btn-primary', value: 'replace', id: 'imp-replace' }, 'Replace current text'),
          h('button', { class: 'btn', value: 'append', id: 'imp-append' }, 'Add to the end'),
          h('button', { class: 'btn btn-quiet', value: 'cancel', id: 'imp-cancel' }, 'Cancel'))));
    dlg.addEventListener('close', () => { resolve(dlg.returnValue || 'cancel'); dlg.remove(); });
    document.body.append(dlg);
    dlg.showModal();
  });
}
