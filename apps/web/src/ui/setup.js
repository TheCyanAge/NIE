import { h } from './dom.js';
import { inferProfileFromDescription } from '../engine/profile/infer.js';
import { normalizeProfile } from '../engine/profile/profile.js';
import { KNOWLEDGE } from '../engine/knowledge/index.js';

/**
 * Project setup: NIE's contract for interpreting this story. Lives in its own <dialog>, which is display:none
 * whenever it is closed, so a setup layer can never sit invisibly on top of the editor.
 */
export function openSetup(app, { isNew = false } = {}) {
  document.getElementById('setup-dialog')?.remove();
  const p = normalizeProfile(app.project.profile);
  const f = {};
  const field = (key, label, value, { list = null, placeholder = '', multiline = false, help = '' } = {}) => {
    const el = multiline ? h('textarea', { class: 'input', rows: '2', placeholder }, value) : h('input', { class: 'input', type: 'text', value, placeholder, list: list ?? undefined });
    el.id = `setup-${key.replace(/\./g, '-')}`;
    f[key] = el;
    return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), el, help ? h('span', { class: 'muted small' }, help) : null);
  };
  const names = (kind) => KNOWLEDGE.filter((k) => k.kind === kind).map((k) => k.name.toLowerCase());
  const datalist = (id, opts) => h('datalist', { id }, ...opts.map((o) => h('option', { value: o })));

  const describe = h('textarea', { id: 'setup-describe', class: 'input', rows: '3', placeholder: 'e.g. A first-person, present-tense psychological horror novel with an unreliable narrator. Dark and eerie, minimalist prose.' });
  const note = h('p', { class: 'muted small', id: 'setup-note', 'aria-live': 'polite' });
  const fill = h('button', { type: 'button', class: 'btn', id: 'setup-fill', onclick: () => {
    const { profile, notes } = inferProfileFromDescription(describe.value);
    const set = (k, v) => v && (f[k].value = Array.isArray(v) ? v.join(', ') : v);
    set('identity.format', profile.identity.format); set('genre.primary', profile.genre.primary); set('genre.secondary', profile.genre.secondary);
    set('tone', profile.tone); set('audience', profile.audience); set('style.prose', profile.style.prose); set('style.pov', profile.style.pov);
    set('style.tense', profile.style.tense); set('narrative.structure', profile.narrative.structure); set('narrative.reliability', profile.narrative.reliability);
    if (profile.authorialIntent.length) f.authorialIntent.value = [f.authorialIntent.value, ...profile.authorialIntent].filter(Boolean).join('\n');
    note.textContent = notes.join(' ');
  } }, 'Fill in from my description');

  const dlg = h('dialog', { id: 'setup-dialog', class: 'dialog dialog-wide', 'aria-labelledby': 'setup-title' },
    h('form', { method: 'dialog', class: 'dialog-body', id: 'setup-form' },
      h('div', { class: 'dialog-head' },
        h('div', {}, h('span', { class: 'eyebrow' }, isNew ? 'Set up' : 'Profile'), h('h2', { id: 'setup-title', class: 'dialog-title' }, isNew ? 'Tell NIE what you\'re making' : 'Project profile'),
          h('p', { class: 'page-sub' }, 'Story ideas, genre support, and narrative direction.')),
        h('button', { class: 'btn btn-sm', value: 'cancel', id: 'setup-close', formnovalidate: true }, 'Close')),
      h('div', { class: 'nie-bubble' }, h('div', { class: 'msg-who' }, 'NIE'), 'Give me anything, even messy or incomplete. I\'ll fill in what I can, and you can correct it.'),
      h('p', { class: 'muted' }, 'This is optional. NIE is useful with nothing filled in, and gets sharper the more you tell it. It uses this to read your writing on its own terms: an unusual choice you declare here is treated as deliberate, not as a mistake. Your rules live in Full Scan.'),
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Describe it in your own words'), describe, h('div', { class: 'row' }, fill, note)),
      h('fieldset', {}, h('legend', {}, 'Identity'),
        field('identity.title', 'Title', p.identity.title), field('identity.author', 'Author', p.identity.author),
        field('identity.format', 'Form', p.identity.format, { list: 'dl-forms', placeholder: 'novel, short story, screenplay, journal, report…' })),
      h('fieldset', {}, h('legend', {}, 'Genre and tone'),
        field('genre.primary', 'Primary genre', p.genre.primary, { list: 'dl-genres' }), field('genre.secondary', 'Other genres (comma-separated)', p.genre.secondary.join(', ')),
        field('tone', 'Tone (comma-separated)', p.tone.join(', '), { placeholder: 'dark, hopeful, absurd…' }), field('audience', 'Audience', p.audience)),
      h('fieldset', {}, h('legend', {}, 'Style'),
        field('style.prose', 'Prose style', p.style.prose, { list: 'dl-styles' }), field('style.pov', 'Point of view', p.style.pov, { placeholder: 'first person, third person limited…' }),
        field('style.tense', 'Tense', p.style.tense, { placeholder: 'past, present, mixed' }), field('style.sentence', 'Sentences', p.style.sentence),
        field('style.dialogue', 'Dialogue', p.style.dialogue), field('style.description', 'Description', p.style.description)),
      h('fieldset', {}, h('legend', {}, 'Narrative'),
        field('narrative.structure', 'Structure', p.narrative.structure, { list: 'dl-structures' }), field('narrative.chronology', 'Chronology', p.narrative.chronology),
        field('narrative.reliability', 'Narrator reliability', p.narrative.reliability), field('narrative.pacing', 'Pacing', p.narrative.pacing)),
      h('fieldset', {}, h('legend', {}, 'Intent'),
        field('authorialIntent', 'What you\'re deliberately doing (one per line)', p.authorialIntent.join('\n'), { multiline: true, help: 'e.g. The story refuses a conventional resolution.' }),
        field('deliberateAbnormalities', 'Unusual choices NIE should treat as deliberate (one per line)', p.deliberateAbnormalities.join('\n'), { multiline: true, help: 'e.g. The narrator slips between tenses when frightened.' }),
        field('instructions', 'Anything else NIE should know', p.instructions, { multiline: true })),
      datalist('dl-forms', names('form')), datalist('dl-genres', names('genre')), datalist('dl-styles', names('style')), datalist('dl-structures', names('structure')),
      h('div', { class: 'dialog-actions sticky' },
        h('button', { class: 'btn', value: 'cancel', id: 'setup-cancel', formnovalidate: true }, isNew ? 'Back' : 'Cancel'),
        h('button', { class: 'btn btn-primary', value: 'save', id: 'setup-save' }, isNew ? 'Finish Setup' : 'Save profile'))));

  dlg.addEventListener('close', () => {
    if (dlg.returnValue === 'save') {
      const val = (k) => f[k].value.trim();
      const next = normalizeProfile({
        identity: { title: val('identity.title'), author: val('identity.author'), format: val('identity.format') },
        genre: { primary: val('genre.primary'), secondary: val('genre.secondary') },
        tone: val('tone'), audience: val('audience'),
        style: { prose: val('style.prose'), pov: val('style.pov'), tense: val('style.tense'), sentence: val('style.sentence'), dialogue: val('style.dialogue'), description: val('style.description') },
        narrative: { structure: val('narrative.structure'), chronology: val('narrative.chronology'), reliability: val('narrative.reliability'), pacing: val('narrative.pacing') },
        authorialIntent: val('authorialIntent'), deliberateAbnormalities: val('deliberateAbnormalities'), instructions: val('instructions'),
      });
      app.project.profile = next;
      if (next.identity.title) app.project.title = next.identity.title;
      app.saveNow();
      app.emit('profile', next);
      app.emit('projects');
    }
    dlg.remove();
  });
  document.body.append(dlg);
  dlg.showModal();
  describe.focus();
  return dlg;
}
