import { h, $, $$, clear, debounce, toast, pageHead } from '../dom.js';
import { createThinking } from '../thinking.js';
import { scan, reportAfterDecision } from '../../engine/analysis/scan.js';
import { CLASS_LABELS, CLASS_HELP } from '../../engine/analysis/finding.js';
import { addRule, updateRule, removeRule, CATEGORY_LABELS, RULE_CATEGORIES } from '../../engine/rules/rules.js';
import { parseRule } from '../../engine/rules/parse.js';
import { markIntentional, dismissFinding } from '../../engine/project/memory.js';
import { words } from '../../engine/util/text.js';
import { ACCEPT } from '../../engine/ingest/extract.js';
import { importFileIntoStory } from './import.js';

const EXAMPLES = ['Never use the word "suddenly"', 'No adverbs', 'No sentence longer than 25 words', 'Stay in third person', 'Samantha never lies', 'Magic cannot resurrect the dead'];
const SEVERITY = ['hard-conflict', 'likely-issue', 'possible-issue', 'stylistic-observation', 'intentional-possibility', 'strength'];
const METHOD_LABEL = { pattern: 'exact check', keyword: 'keyword match', model: 'language model' };
const STATE_LABEL = {
  checked: 'checked exactly',
  approximate: 'keyword approximation',
  judged: 'judged by the language model',
  'needs-model': 'needs the language model — not checked offline',
  disabled: 'switched off',
  unchecked: 'not run yet',
};

export function mountScan(root, app) {
  let mode = 'edit'; // 'edit' | 'review'
  let showObsInText = false;
  const state = { editingRule: null };

  // ── skeleton ──────────────────────────────────────────────────────────────
  const storyText = h('textarea', { id: 'story-text', class: 'story-text', 'data-tour': 'story-text', spellcheck: 'true', placeholder: 'Write or paste your story here, or import a file. NIE never changes your text; it only shows where it breaks your rules.', 'aria-label': 'Story Text' });
  const review = h('div', { id: 'story-review', class: 'story-review', hidden: true, tabindex: '0', 'aria-label': 'Story text with highlighted rule violations' });
  const wordCount = h('span', { class: 'muted', id: 'word-count' }, '0 words');
  const staleBanner = h('div', { class: 'banner banner-warn', hidden: true, role: 'status' }, 'The text has changed since the last scan. Highlights show the text as it was when scanned. ', h('button', { class: 'link', onclick: () => runScan() }, 'Scan again'));
  const modeEdit = h('button', { class: 'seg-btn is-active', 'data-mode': 'edit', onclick: () => setMode('edit') }, 'Edit');
  const modeReview = h('button', { class: 'seg-btn', 'data-mode': 'review', onclick: () => setMode('review') }, 'Highlights');
  const fileInput = h('input', { type: 'file', accept: ACCEPT, hidden: true, id: 'import-input', 'aria-label': 'Import a file' });
  fileInput.addEventListener('change', async () => {
    const f = fileInput.files?.[0];
    fileInput.value = '';
    if (f) await importFileIntoStory(app, f);
  });
  const importBtn = h('button', { class: 'btn', 'data-tour': 'import', id: 'import-btn', onclick: async () => {
    if (window.NIE_DESKTOP?.openFile) {
      const f = await window.NIE_DESKTOP.openFile();
      if (f) await importFileIntoStory(app, f);
    } else fileInput.click();
  } }, 'Import file…');

  const ruleInput = h('input', { id: 'rule-input', class: 'input', type: 'text', placeholder: 'Add a rule, e.g. Samantha never lies', 'aria-label': 'New rule', autocomplete: 'off', maxlength: '300' });
  const ruleCategory = h('select', { id: 'rule-category', class: 'select', 'aria-label': 'Rule category' }, ...RULE_CATEGORIES.map((c) => h('option', { value: c, selected: c === 'other' ? true : null }, CATEGORY_LABELS[c])));
  const ruleList = h('ul', { id: 'rule-list', class: 'rule-list' });
  const examples = h('div', { class: 'chips', id: 'rule-examples' });
  const ruleForm = h('form', { class: 'rule-form', onsubmit: (e) => { e.preventDefault(); submitRule(); } }, ruleInput, ruleCategory, h('button', { class: 'btn btn-primary', type: 'submit', id: 'rule-add' }, 'Add rule'));

  const runBtn = h('button', { class: 'btn btn-primary btn-lg', id: 'run-scan', 'data-tour': 'run-scan', onclick: () => runScan() }, 'Run Full Scan');
  const cancelBtn = h('button', { class: 'btn', id: 'cancel-scan', hidden: true, onclick: () => app.session.abort?.abort() }, 'Cancel');
  const obsToggle = h('input', { type: 'checkbox', id: 'obs-toggle' });
  obsToggle.addEventListener('change', () => { app.setPref('showObservations', obsToggle.checked); });
  const results = h('div', { id: 'results', class: 'results', 'aria-live': 'polite' });
  const progress = h('div', { id: 'scan-progress', class: 'scan-progress', hidden: true });

  root.append(
    pageHead({ eyebrow: 'Full Scan', title: 'Check your story against your rules', sub: 'NIE shows exactly where the text breaks a rule you set, and why. It never changes your words.' }),
    h('div', { class: 'scan-layout' },
      h('section', { class: 'col-editor' },
        h('header', { class: 'col-head' },
          h('h2', {}, 'Story Text'),
          h('div', { class: 'toolbar' }, importBtn, fileInput, h('div', { class: 'seg', role: 'group', 'aria-label': 'View' }, modeEdit, modeReview), wordCount)),
        staleBanner, storyText, review),
      h('section', { class: 'col-side' },
        h('div', { class: 'panel', 'data-tour': 'rules' },
          h('h2', {}, 'Rules'),
          h('p', { class: 'hint' }, 'Tell NIE what must or must not happen in this story, in your own words. NIE will show exactly where the text breaks each rule, and why.'),
          ruleForm, examples, ruleList),
        h('div', { class: 'panel panel-run' },
          h('div', { class: 'run-row' }, runBtn, cancelBtn),
          h('label', { class: 'check' }, obsToggle, ' Also show NIE\'s general observations'),
          progress),
        results))
  );

  // ── editing ───────────────────────────────────────────────────────────────
  const countWords = debounce(() => (wordCount.textContent = `${words(storyText.value).length.toLocaleString()} words`), 150);
  storyText.addEventListener('input', () => {
    app.project.storyText = storyText.value;
    app.project.source = null;
    countWords();
    app.saveSoon();
    updateStale();
  });

  function setMode(next) {
    mode = next;
    storyText.hidden = mode !== 'edit';
    review.hidden = mode !== 'review';
    modeEdit.classList.toggle('is-active', mode === 'edit');
    modeReview.classList.toggle('is-active', mode === 'review');
    if (mode === 'review') renderReview();
    updateStale();
  }

  function updateStale() {
    const r = app.session.report;
    staleBanner.hidden = !(r && mode === 'review' && app.session.reportText !== app.project.storyText);
  }

  // ── rules ─────────────────────────────────────────────────────────────────
  function submitRule() {
    const text = ruleInput.value.trim();
    if (!text) return;
    if (state.editingRule) {
      updateRule(app.project, state.editingRule, { text, category: ruleCategory.value });
      state.editingRule = null;
      $('#rule-add', root).textContent = 'Add rule';
    } else {
      addRule(app.project, { text, category: ruleCategory.value });
    }
    ruleInput.value = '';
    ruleCategory.value = 'other';
    app.saveNow();
    renderRules();
  }

  function renderRules() {
    clear(ruleList);
    clear(examples);
    const rules = app.project.rules;
    const items = new Map((app.session.report?.rules.items ?? []).map((i) => [i.id, i]));
    if (!rules.length) {
      examples.append(h('span', { class: 'muted' }, 'Try one:'), ...EXAMPLES.map((e) => h('button', { class: 'chip', type: 'button', onclick: () => { ruleInput.value = e; ruleInput.focus(); } }, e)));
    }
    for (const r of rules) {
      const parsed = parseRule(r.text);
      const item = items.get(r.id);
      ruleList.append(
        h('li', { class: `rule ${r.enabled ? '' : 'is-off'}`, dataset: { ruleId: r.id } },
          h('label', { class: 'rule-main' },
            h('input', { type: 'checkbox', checked: r.enabled ? true : null, 'aria-label': `Rule enabled: ${r.text}`, onchange: (e) => { updateRule(app.project, r.id, { enabled: e.target.checked }); app.saveNow(); renderRules(); } }),
            h('span', { class: 'rule-text' }, r.text)),
          h('span', { class: `tag tag-cat` }, CATEGORY_LABELS[r.category]),
          h('div', { class: 'rule-actions' },
            h('button', { class: 'icon-btn', title: 'Edit rule', 'aria-label': `Edit rule: ${r.text}`, onclick: () => { state.editingRule = r.id; ruleInput.value = r.text; ruleCategory.value = r.category; $('#rule-add', root).textContent = 'Save rule'; ruleInput.focus(); } }, '✎'),
            h('button', { class: 'icon-btn', title: 'Delete rule', 'aria-label': `Delete rule: ${r.text}`, onclick: () => { removeRule(app.project, r.id); app.saveNow(); renderRules(); renderResults(); } }, '×')),
          h('div', { class: 'rule-understood' }, parsed.understood),
          item ? h('div', { class: `rule-state state-${item.state}` }, `${STATE_LABEL[item.state] ?? item.state}${item.state !== 'disabled' && item.state !== 'needs-model' && item.state !== 'unchecked' ? ` · ${item.count} found` : ''}`) : null,
          item?.note ? h('div', { class: 'rule-note' }, item.note) : null)
      );
    }
  }

  // ── scanning ──────────────────────────────────────────────────────────────
  async function runScan() {
    const sess = app.session;
    const project = app.project;
    const text = project.storyText;
    if (!text.trim()) return toast('Add or import some text first.', { kind: 'warn' });
    if (sess.scanning) return;
    sess.scanning = true;
    runBtn.disabled = true;
    runBtn.textContent = 'Scanning…';
    const observations = app.prefs.showObservations;

    // Phase 1: instant, offline.
    let report = scan({ text, project, observations });
    sess.report = report;
    sess.reportText = text;
    renderRules();
    renderResults();

    // Phase 2: let the language model judge the rules that need meaning (if one is running).
    const needsModel = report.rules.items.some((i) => i.semantic && (i.state === 'approximate' || i.state === 'needs-model'));
    if (needsModel && app.engine.route() !== 'builtin') {
      sess.abort = new AbortController();
      cancelBtn.hidden = false;
      progress.hidden = false;
      clear(progress).append(createThinking('NIE is thinking'), h('span', { class: 'muted', id: 'scan-progress-text' }, ' checking the rules that need meaning…'));
      try {
        const judged = await app.orchestrator.scan({
          project, text, observations, signal: sess.abort.signal,
          onProgress: (p) => { const t = $('#scan-progress-text', progress); if (t) t.textContent = ` rule ${p.ruleIndex + 1} of ${p.ruleTotal}: ${p.ruleText.slice(0, 60)}`; },
        });
        if (app.session === sess) report = judged;
      } catch (err) {
        if (err?.kind !== 'abort') toast(`The language model couldn't finish: ${err?.message ?? err}. Showing the offline results.`, { kind: 'warn' });
      }
    }
    if (app.session !== sess) return; // the project changed underneath us: drop the result on the floor
    sess.report = report;
    sess.reportText = text;
    sess.scanning = false;
    sess.abort = null;
    progress.hidden = true;
    cancelBtn.hidden = true;
    runBtn.disabled = false;
    runBtn.textContent = 'Run Full Scan';
    project.scans.history.push({ at: Date.now(), headline: report.headline, rule: report.ruleCounts });
    project.scans.history = project.scans.history.slice(-20);
    app.saveSoon();
    renderRules();
    renderResults();
    if (report.findings.some((f) => f.section === 'rule' && f.class !== 'intentional-possibility')) setMode('review');
    else if (mode === 'review') renderReview();
    app.emit('report', report);
  }

  function decide(finding, action) {
    const r = app.session.report;
    if (!r) return;
    if (action === 'intentional') markIntentional(app.project, finding);
    else dismissFinding(app.project, finding);
    app.session.report = reportAfterDecision(r, finding, action);
    app.saveSoon();
    renderRules();
    renderResults();
    if (mode === 'review') renderReview();
  }

  // ── results ───────────────────────────────────────────────────────────────
  function findingCard(f) {
    const where = [f.meta?.line ? `Line ${f.meta.line}` : null, app.session.report.scenes > 1 && f.sceneIndex != null ? `scene ${f.sceneIndex + 1}` : null].filter(Boolean).join(' · ');
    return h('li', { class: `finding cls-${f.class}`, dataset: { findingId: f.id } },
      h('div', { class: 'finding-head' },
        where ? h('span', { class: 'where' }, where) : null,
        h('span', { class: `pill pill-${f.class}`, title: CLASS_HELP[f.class] }, CLASS_LABELS[f.class]),
        f.section === 'rule' ? h('span', { class: 'tag' }, METHOD_LABEL[f.meta?.method] ?? '') : null),
      f.quote ? h('blockquote', { class: 'quote' }, markQuote(f)) : null,
      h('p', { class: 'why' }, f.message),
      f.question && f.class !== 'strength' ? h('p', { class: 'ask' }, f.question) : null,
      h('div', { class: 'finding-actions' },
        f.start != null ? h('button', { class: 'btn btn-sm', onclick: () => { setMode('review'); focusMark(f.id); } }, 'Show in text') : null,
        f.class !== 'strength' && f.class !== 'intentional-possibility' ? h('button', { class: 'btn btn-sm', onclick: () => decide(f, 'intentional') }, 'It\'s an exception') : null,
        f.class !== 'strength' ? h('button', { class: 'btn btn-sm btn-quiet', onclick: () => decide(f, 'dismiss') }, 'Dismiss') : null));
  }

  /** The quoted sentence with the exact offending span emphasised. */
  function markQuote(f) {
    const s0 = f.meta?.sentenceStart;
    const text = app.session.reportText;
    if (f.section !== 'rule' || s0 == null || f.start == null) return f.quote;
    const sentence = text.slice(s0, f.meta.sentenceEnd);
    const a = f.start - s0;
    const b = Math.min(f.end - s0, sentence.length);
    if (a < 0 || b <= a || sentence.length > 320) return f.quote;
    return [sentence.slice(0, a), h('mark', {}, sentence.slice(a, b)), sentence.slice(b)];
  }

  function renderResults() {
    clear(results);
    const r = app.session.report;
    if (!r) return;
    results.append(h('div', { class: 'headline', id: 'headline', 'data-testid': 'headline' }, r.headline));

    const ruleFindings = r.findings.filter((f) => f.section === 'rule');
    for (const item of r.rules.items) {
      const mine = ruleFindings.filter((f) => f.meta.ruleId === item.id);
      const head = h('summary', { class: 'group-head' },
        h('span', { class: `status-dot dot-${mine.some((f) => f.class !== 'intentional-possibility') ? 'bad' : item.state === 'needs-model' || item.state === 'unchecked' ? 'unknown' : item.state === 'disabled' ? 'off' : 'ok'}` }),
        h('span', { class: 'group-title' }, item.text),
        h('span', { class: 'group-meta' }, item.state === 'disabled' ? 'switched off' : item.state === 'needs-model' ? 'not checked offline' : `${mine.length} found${item.truncated ? ` (showing ${mine.length} of ${item.total})` : ''}`));
      results.append(h('details', { class: 'group', open: mine.length ? true : null, dataset: { ruleId: item.id } }, head,
        mine.length ? h('ul', { class: 'findings' }, ...mine.map(findingCard)) : h('p', { class: 'muted pad' }, item.state === 'needs-model' ? 'This rule is about meaning. Start the offline model (or connect an online one) and scan again.' : item.state === 'disabled' ? 'Switch the rule on to check it.' : 'No violations found.' + (item.state === 'approximate' ? ' (This was a keyword approximation.)' : ''))));
    }

    const obs = r.findings.filter((f) => f.section === 'observation');
    if (obs.length) {
      results.append(h('details', { class: 'group group-obs', id: 'observations' },
        h('summary', { class: 'group-head' }, h('span', { class: 'group-title' }, 'Other observations'), h('span', { class: 'group-meta' }, `${obs.length}`)),
        h('p', { class: 'muted pad' }, 'General notes read against your profile. These are not rule violations, and a flag is not automatically a mistake.'),
        h('ul', { class: 'findings' }, ...obs.map(findingCard)),
        r.notChecked?.length ? h('p', { class: 'muted pad' }, 'Not judged by these checks (they need the language model): ', r.notChecked.map((c) => c.label.toLowerCase()).join('; '), '.') : null));
    }
    if (r.dismissedCount) results.append(h('p', { class: 'muted pad' }, `${r.dismissedCount} dismissed.`));
  }

  // ── highlights ────────────────────────────────────────────────────────────
  function renderReview() {
    clear(review);
    const r = app.session.report;
    if (!r) {
      review.append(h('p', { class: 'muted pad' }, 'Run a Full Scan and NIE will highlight, right here in your text, every place that breaks one of your rules.'));
      return;
    }
    const text = app.session.reportText;
    // Rule violations are always highlighted (exceptions appear muted); general observations only when asked for.
    const items = r.findings
      .filter((f) => f.start != null && f.end != null && f.end > f.start && (f.section === 'rule' || showObsInText))
      .map((f) => ({ f, start: f.start, end: f.end }));

    const pts = new Set([0, text.length]);
    items.forEach((i) => { pts.add(i.start); pts.add(i.end); });
    const cuts = [...pts].filter((p) => p >= 0 && p <= text.length).sort((a, b) => a - b);
    const frag = document.createDocumentFragment();
    for (let k = 0; k + 1 < cuts.length; k++) {
      const a = cuts[k];
      const b = cuts[k + 1];
      const cover = items.filter((i) => i.start <= a && i.end >= b);
      const piece = text.slice(a, b);
      if (!cover.length) { frag.append(piece); continue; }
      const top = cover.map((c) => c.f).sort((x, y) => SEVERITY.indexOf(x.class) - SEVERITY.indexOf(y.class))[0];
      frag.append(h('mark', { class: `hl hl-${top.class} ${top.section === 'observation' ? 'hl-obs' : ''}`, dataset: { ids: cover.map((c) => c.f.id).join(' ') }, tabindex: '0', role: 'button', 'aria-label': `${CLASS_LABELS[top.class]}: ${top.message}` }, piece));
    }
    review.append(frag);
    $$('mark.hl', review).forEach((m) => {
      m.addEventListener('click', (e) => { e.stopPropagation(); openPopover(m); });
      m.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPopover(m); } });
    });
    const toggle = h('label', { class: 'check review-toggle' }, h('input', { type: 'checkbox', checked: showObsInText ? true : null, onchange: (e) => { showObsInText = e.target.checked; renderReview(); } }), ' Also highlight general observations');
    review.prepend(toggle);
  }

  let popover = null;
  function closePopover() { popover?.remove(); popover = null; }
  function openPopover(mark) {
    closePopover();
    const ids = mark.dataset.ids.split(' ');
    const r = app.session.report;
    const fs = ids.map((id) => r.findings.find((f) => f.id === id)).filter(Boolean);
    popover = h('div', { class: 'popover', role: 'dialog', 'aria-label': 'Why this is highlighted', 'data-testid': 'popover' },
      ...fs.map((f) => h('div', { class: 'pop-item' },
        h('div', { class: 'finding-head' }, h('span', { class: `pill pill-${f.class}` }, CLASS_LABELS[f.class]), f.meta?.line ? h('span', { class: 'where' }, `Line ${f.meta.line}`) : null),
        h('p', { class: 'why' }, f.message),
        f.meta?.ruleText ? h('p', { class: 'muted small' }, 'Rule: ', h('em', {}, f.meta.ruleText)) : null,
        h('div', { class: 'finding-actions' },
          h('button', { class: 'btn btn-sm', onclick: () => { closePopover(); decide(f, 'intentional'); } }, 'It\'s an exception'),
          h('button', { class: 'btn btn-sm btn-quiet', onclick: () => { closePopover(); decide(f, 'dismiss'); } }, 'Dismiss'),
          h('button', { class: 'btn btn-sm btn-quiet', onclick: () => { closePopover(); focusCard(f.id); } }, 'Show in results')))));
    document.body.append(popover);
    const rect = mark.getBoundingClientRect();
    const pw = Math.min(380, window.innerWidth - 24);
    popover.style.width = `${pw}px`;
    popover.style.left = `${Math.max(12, Math.min(window.innerWidth - pw - 12, rect.left))}px`;
    const below = rect.bottom + 8;
    popover.style.top = `${below + popover.offsetHeight > window.innerHeight ? Math.max(12, rect.top - popover.offsetHeight - 8) : below}px`;
  }
  document.addEventListener('click', (e) => { if (popover && !popover.contains(e.target)) closePopover(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopover(); });

  function focusMark(id) {
    const m = $$('mark.hl', review).find((x) => x.dataset.ids.split(' ').includes(id));
    if (!m) return;
    m.scrollIntoView({ block: 'center', behavior: 'smooth' });
    m.classList.add('flash');
    setTimeout(() => m.classList.remove('flash'), 1600);
    m.focus({ preventScroll: true });
  }
  function focusCard(id) {
    const c = $(`[data-finding-id="${id}"]`, results);
    if (!c) return;
    c.closest('details')?.setAttribute('open', '');
    c.scrollIntoView({ block: 'center', behavior: 'smooth' });
    c.classList.add('flash');
    setTimeout(() => c.classList.remove('flash'), 1600);
  }

  // ── lifecycle ─────────────────────────────────────────────────────────────
  function render() {
    closePopover();
    state.editingRule = null;
    $('#rule-add', root).textContent = 'Add rule';
    ruleInput.value = '';
    ruleCategory.value = 'other';
    storyText.value = app.project.storyText;
    wordCount.textContent = `${words(app.project.storyText).length.toLocaleString()} words`;
    obsToggle.checked = app.prefs.showObservations;
    mode = 'edit';
    setMode('edit');
    renderRules();
    renderResults();
    clear(progress);
    progress.hidden = true;
    cancelBtn.hidden = true;
    runBtn.disabled = false;
    runBtn.textContent = 'Run Full Scan';
  }

  app.on('project', render);
  app.on('prefs', ({ key }) => { if (key === 'showObservations') obsToggle.checked = app.prefs.showObservations; });
  const syncStory = () => { storyText.value = app.project.storyText; wordCount.textContent = `${words(app.project.storyText).length.toLocaleString()} words`; };
  app.on('storyChanged', () => { syncStory(); setMode('edit'); updateStale(); });
  // The text can be edited in Read mode too; whenever this mode comes back into view, show the current text.
  app.on('view', (v) => { if (v === 'scan' && storyText.value !== app.project.storyText) { syncStory(); updateStale(); } });
  app.on('runScan', () => runScan());
  render();

  return {
    focus: () => (mode === 'edit' ? storyText.focus() : review.focus()),
    primaryInput: () => (mode === 'edit' ? storyText : review),
    runScan,
  };
}
