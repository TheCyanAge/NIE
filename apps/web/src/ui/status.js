import { $ } from './dom.js';

/** The single NIE status: chip in the top bar, and the plain-language line in the sidebar. */
export function mountStatus(app) {
  const chip = $('#ai-chip');
  const dot = $('#ai-dot');
  const label = $('#ai-label');
  const banner = $('#ai-banner');
  function paint(s = app.engine.status()) {
    label.textContent = s.label;
    const tone = s.route === 'online' || s.route === 'local' ? 'ok' : s.local.state === 'starting' ? 'wait' : s.local.state === 'failed' ? 'warn' : 'idle';
    dot.dataset.tone = tone;
    banner.textContent = s.route === 'online' ? 'NIE is using an online model.' : s.local.state === 'starting' && s.local.detail && /Download|Loading|Restart/.test(s.local.detail) ? s.local.detail : s.banner;
    chip.title = banner.textContent;
    chip.dataset.route = s.route;
    chip.dataset.local = s.local.state;
  }
  app.on('status', paint);
  chip.addEventListener('click', () => app.setView('settings'));
  paint();
}
