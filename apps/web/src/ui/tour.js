import { h, clear } from './dom.js';

/**
 * The guided tour. Its overlay (#tour-root) is completely separate from project setup:
 *   • dim + blur layer with a cut-out, so the feature being explained stays crisp and clear
 *   • a ring around the target, and a transparent shield over it, so the target is visible but not interactive
 *   • the tour card, the only interactive part
 * When the tour ends, #tour-root is emptied and hidden, so it can never linger over an input.
 */

export const TOUR_STEPS = [
  { id: 'welcome', title: 'Welcome to NIE', body: 'NIE helps you develop and protect your writing. It never writes or edits your text. It shows you where your writing breaks the rules you set, and helps you think. This quick tour shows you around.', target: null },
  { id: 'story', view: 'scan', target: '[data-tour="story-text"]', title: 'Story Text', body: 'Your writing lives here. Type, paste, or import a file. Everything NIE does reads from this text and never changes it.' },
  { id: 'rules', view: 'scan', target: '[data-tour="rules"]', title: 'Your rules', body: 'Say what must or must not happen, in plain words: "Samantha never lies", "No adverbs", "Stay in third person". NIE shows how it understood each rule.' },
  { id: 'scan', view: 'scan', target: '[data-tour="run-scan"]', title: 'Full Scan', body: 'Run it and NIE highlights, right in your text, every place that breaks a rule, with a short reason. A flag is not always a mistake: you can mark any of them as an exception.' },
  { id: 'import', view: 'scan', target: '[data-tour="import"]', title: 'Import any document', body: 'Bring in Word, PDF, EPUB, RTF, Markdown, HTML or plain text. It becomes your Story Text, ready to scan.' },
  { id: 'brainstorm', target: '[data-tour="nav-brainstorm"]', title: 'Brainstorm', body: 'Talk through an idea, a problem or a "what if". Start with almost nothing. NIE asks questions and follows your lead. It won\'t write for you.' },
  { id: 'read', target: '[data-tour="nav-read"]', title: 'Read', body: 'Open a story, report, journal or essay and have NIE read it aloud, with pause and section skipping. NIE reads each kind of writing on its own terms.' },
  { id: 'projects', target: '[data-tour="nav-projects"]', title: 'Projects and profile', body: 'Each project is its own world: its own story, rules, profile and notes. A new project starts completely fresh, and deleting one removes everything about it.' },
  { id: 'ai', target: '[data-tour="ai-status"]', title: 'Offline AI', body: 'NIE works without the internet. When its offline model is ready this says so, and until then NIE uses built-in guidance and tells you plainly.' },
  { id: 'settings', target: '[data-tour="nav-settings"]', title: 'Settings', body: 'Choose the offline model, check for updates, and turn this tour on or off. You can reopen it any time from Help → Tour.' },
];

export function createTour(app) {
  const root = document.getElementById('tour-root');
  let idx = 0;
  let active = false;
  let prevFocus = null;
  let ui = null;
  let raf = 0;

  const isActive = () => active;

  function build() {
    clear(root);
    const dim = h('div', { class: 'tour-dim', 'data-tour-part': 'dim' });
    const ring = h('div', { class: 'tour-ring', 'data-tour-part': 'ring', 'aria-hidden': 'true' });
    const shield = h('div', { class: 'tour-shield', 'data-tour-part': 'shield', 'aria-hidden': 'true' });
    const title = h('h2', { id: 'tour-title', class: 'tour-title' });
    const body = h('p', { class: 'tour-body', id: 'tour-body' });
    const count = h('span', { class: 'muted small', id: 'tour-count' });
    const startup = h('input', { type: 'checkbox', id: 'tour-startup', checked: app.prefs.tourOnStartup !== false ? true : null, onchange: (e) => app.setPref('tourOnStartup', e.target.checked) });
    const startupRow = h('label', { class: 'check tour-startup', hidden: true }, startup, ' Show this tour on startup');
    const back = h('button', { class: 'btn', id: 'tour-back', onclick: () => go(idx - 1) }, 'Back');
    const next = h('button', { class: 'btn btn-primary', id: 'tour-next', onclick: () => (idx >= TOUR_STEPS.length - 1 ? finish() : go(idx + 1)) }, 'Next');
    const skip = h('button', { class: 'btn btn-quiet', id: 'tour-skip', onclick: () => finish() }, 'Skip tour');
    const card = h('div', { class: 'tour-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'tour-title', 'aria-describedby': 'tour-body', 'data-tour-part': 'card' }, title, body, startupRow, h('div', { class: 'tour-foot' }, count, h('div', { class: 'row' }, skip, back, next)));
    root.append(dim, ring, shield, card);
    ui = { dim, ring, shield, card, title, body, count, back, next, startupRow };
  }

  async function go(i) {
    idx = Math.min(Math.max(0, i), TOUR_STEPS.length - 1);
    const step = TOUR_STEPS[idx];
    if (step.view) app.setView(step.view);
    ui.title.textContent = step.title;
    ui.body.textContent = step.body;
    ui.count.textContent = `${idx + 1} of ${TOUR_STEPS.length}`;
    ui.back.disabled = idx === 0;
    ui.next.textContent = idx === TOUR_STEPS.length - 1 ? 'Done' : 'Next';
    ui.startupRow.hidden = idx !== TOUR_STEPS.length - 1;
    position(); // immediately, so the spotlight never lags behind the text
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (!active) return;
    position();
    ui.next.focus();
  }

  function targetRect(step) {
    if (!step.target) return null;
    const el = document.querySelector(step.target);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return null; // hidden or collapsed: never highlight something invisible
    return r;
  }

  function position() {
    if (!active || !ui) return;
    const step = TOUR_STEPS[idx];
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r = targetRect(step);
    const pad = 8;
    if (r) {
      const x1 = Math.max(0, r.left - pad), y1 = Math.max(0, r.top - pad), x2 = Math.min(vw, r.right + pad), y2 = Math.min(vh, r.bottom + pad);
      ui.dim.style.clipPath = `polygon(evenodd, 0 0, ${vw}px 0, ${vw}px ${vh}px, 0 ${vh}px, 0 0, ${x1}px ${y1}px, ${x1}px ${y2}px, ${x2}px ${y2}px, ${x2}px ${y1}px, ${x1}px ${y1}px)`;
      for (const el of [ui.ring, ui.shield]) Object.assign(el.style, { display: 'block', left: `${x1}px`, top: `${y1}px`, width: `${x2 - x1}px`, height: `${y2 - y1}px` });
      ui.card.dataset.placement = 'target';
    } else {
      ui.dim.style.clipPath = 'none';
      ui.ring.style.display = 'none';
      ui.shield.style.display = 'none';
      ui.card.dataset.placement = 'center';
    }
    // Place the card beside the target when there is room, otherwise centred.
    const cw = Math.min(380, vw - 32);
    ui.card.style.width = `${cw}px`;
    const ch = ui.card.offsetHeight;
    let left = (vw - cw) / 2;
    let top = (vh - ch) / 2;
    if (r && vw >= 720) {
      const gap = 16;
      if (r.right + gap + cw + 16 <= vw) { left = r.right + gap + pad; top = r.top; }
      else if (r.left - gap - cw - 16 >= 0) { left = r.left - gap - cw - pad; top = r.top; }
      else if (r.bottom + gap + ch + 16 <= vh) { left = r.left; top = r.bottom + gap + pad; }
      else if (r.top - gap - ch - 16 >= 0) { left = r.left; top = r.top - gap - ch - pad; }
      left = Math.max(16, Math.min(vw - cw - 16, left));
      top = Math.max(16, Math.min(vh - ch - 16, top));
    } else if (r) {
      top = r.bottom + 16 + ch + 16 <= vh ? r.bottom + 16 : Math.max(16, vh - ch - 16);
      left = (vw - cw) / 2;
    }
    Object.assign(ui.card.style, { left: `${left}px`, top: `${top}px` });
  }

  const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(position); };
  const onKey = (e) => {
    if (!active) return;
    if (e.key === 'Escape') { e.preventDefault(); finish(); }
    else if (e.key === 'ArrowRight') go(idx + 1);
    else if (e.key === 'ArrowLeft') go(idx - 1);
    else if (e.key === 'Tab') { // keep focus inside the card
      const f = [...ui.card.querySelectorAll('button:not([disabled]), input')].filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  function start() {
    if (active) return;
    active = true;
    prevFocus = document.activeElement;
    root.hidden = false;
    build();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    document.addEventListener('keydown', onKey, true);
    go(0);
    app.emit('tour', { active: true });
  }

  function finish() {
    if (!active) return;
    active = false;
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onResize, true);
    document.removeEventListener('keydown', onKey, true);
    cancelAnimationFrame(raf);
    // Leave nothing behind: an emptied, hidden root cannot cover anything.
    clear(root);
    root.hidden = true;
    ui = null;
    try { prevFocus?.focus?.(); } catch { /* element may be gone */ }
    app.emit('tour', { active: false });
  }

  return { start, finish, isActive, steps: TOUR_STEPS };
}
