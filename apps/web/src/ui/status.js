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
    // The four exact status strings stay as they are. Only when the DOWNLOAD failed (not the model starting) is there a truer thing to say.
    const downloadFailed = s.local.state === 'failed' && s.local.phase === 'download';
    banner.textContent = s.route === 'online' ? 'NIE is using an online model.' : downloadFailed ? "The offline model could not be downloaded, so NIE is using its built-in library for now. It tries again next time you open NIE, or press Restart in Settings." : s.local.state === 'starting' && s.local.detail && /Download|Loading|Restart/.test(s.local.detail) ? s.local.detail : s.banner;
    chip.title = banner.textContent;
    chip.dataset.route = s.route;
    chip.dataset.local = s.local.state;
  }
  app.on('status', paint);
  chip.addEventListener('click', () => app.setView('settings'));
  paint();
}
