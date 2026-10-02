import { $, $$ } from './dom.js';

/**
 * Input guard + Safe Recovery.
 *
 * Principle: self-heal first, and only show Recovery Mode after a genuine, persistent failure.
 * Every few seconds it checks that the *current mode's* primary input can actually be clicked (nothing invisible on top
 * of it). If something is, it neutralises the stray layer and re-checks. Only if the input stays blocked across several
 * checks does it offer the writer a one-click "Restore workspace".
 * Diagnostics are mode-aware (inputs that aren't on screen are never reported) and throttled.
 */

const KNOWN_STRAY = '#onboarding-chat-form, #onboarding-chat, .setup-footer, .setup-overlay, .onboarding-overlay, .tour-dim, .tour-shield, .tour-ring';

export function startInputGuard(app, { getInput, isTourActive = () => false, intervalMs = 1500, failuresBeforeRecovery = 3 }) {
  const banner = document.getElementById('recovery-banner');
  // The banner lives in the browser's top layer (Popover API), so no stray element can ever sit above it.
  const showBanner = () => { banner.hidden = false; try { if (!banner.matches(':popover-open')) banner.showPopover?.(); } catch { /* unsupported: falls back to z-index */ } };
  const hideBanner = () => { try { if (banner.matches(':popover-open')) banner.hidePopover?.(); } catch { /* ignore */ } banner.hidden = true; };
  const lastLogged = new Map();
  let failures = 0;
  let timer = null;

  const describe = (el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).join('.')}` : ''}`;
  const debug = () => app.prefs.diagnostics || (() => { try { return localStorage.getItem('nie.debug') === '1'; } catch { return false; } })();
  const log = (key, msg) => {
    if (!debug()) return;
    const now = Date.now();
    if (now - (lastLogged.get(key) ?? 0) < 60000) return;
    lastLogged.set(key, now);
    console.warn(`[NIE input guard] ${msg}`);
  };

  /** What (if anything) is sitting on top of this input's centre. */
  function blocker(input) {
    const r = input.getBoundingClientRect();
    if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return null; // not on screen: nothing to check
    const x = Math.min(innerWidth - 2, Math.max(2, r.left + r.width / 2));
    const y = Math.min(innerHeight - 2, Math.max(2, r.top + Math.min(r.height / 2, 40)));
    const top = document.elementFromPoint(x, y);
    if (!top || top === input || input.contains(top)) return null;
    return top;
  }

  /** Neutralise a stray layer without destroying the app. */
  function heal(el) {
    let n = 0;
    for (const stray of $$(KNOWN_STRAY)) {
      if (stray.closest('#tour-root') && isTourActive()) continue;
      stray.style.pointerEvents = 'none';
      if (!stray.closest('#tour-root')) stray.remove();
      n++;
    }
    if (document.body.style.pointerEvents === 'none') { document.body.style.pointerEvents = ''; n++; }
    const tourRoot = document.getElementById('tour-root');
    if (tourRoot && !isTourActive() && (!tourRoot.hidden || tourRoot.childElementCount)) { tourRoot.replaceChildren(); tourRoot.hidden = true; n++; }
    // A closed <dialog> is display:none; a dialog stuck "open" without being modal is not expected to exist.
    if (n === 0 && el && el !== document.body && el !== document.documentElement) {
      const pos = getComputedStyle(el).position;
      if (pos === 'fixed' || pos === 'absolute') { el.style.pointerEvents = 'none'; n++; }
    }
    return n;
  }

  function hardReset() {
    heal(null);
    $$('dialog[open]').forEach((d) => d.close());
    document.getElementById('tour-root')?.replaceChildren();
    if (document.getElementById('tour-root')) document.getElementById('tour-root').hidden = true;
    document.body.style.pointerEvents = '';
    app.setView('scan');
    hideBanner();
    failures = 0;
    app.emit('recovered');
  }

  function check() {
    if (document.hidden || isTourActive() || document.querySelector('dialog[open]')) return;
    const input = getInput();
    if (!input || input.hidden || input.offsetParent === null) { failures = 0; return; }
    // Count every consecutive check that finds the input covered, whether or not a heal cleared it this time:
    // a layer that keeps coming back is a genuine failure, while one that is cleared once and stays gone is not.
    const b = blocker(input);
    if (!b) { failures = 0; hideBanner(); return; }
    failures++;
    log(describe(input), `${describe(input)} is covered by ${describe(b)}; healing`);
    heal(b);
    const still = blocker(input);
    if (!still && failures < failuresBeforeRecovery) { app.emit('healed'); return; } // self-healed: stay quiet
    if (failures >= failuresBeforeRecovery) {
      log('recovery', `${describe(input)} keeps being covered by ${describe(still ?? b)} (${failures} checks in a row); offering Recovery Mode`);
      showBanner();
    }
  }

  $('#recovery-restore', banner)?.addEventListener('click', hardReset);
  timer = setInterval(check, intervalMs);
  return { check, hardReset, stop: () => clearInterval(timer) };
}
