/**
 * NIE's single AI identity.
 *
 * The writer talks to "NIE". Whether the words come from an online provider, the installed offline model,
 * or NIE's built-in guidance is routing, not a different assistant. The only place the user chooses a model is Settings.
 *
 * Offline status strings are part of the product contract: they must never claim readiness that isn't real.
 */

export const OFFLINE_MESSAGES = Object.freeze({
  starting: 'Offline NIE is starting...',
  ready: 'Offline NIE ready.',
  failed: 'Offline NIE model failed to start. Using built-in guidance instead.',
  unavailable: 'Offline NIE is not installed here. Using built-in guidance instead.',
});

/**
 * A "local" provider is anything with:
 *   status() → { state: 'starting'|'ready'|'failed'|'unavailable', detail? }
 *   onStatus(cb) → unsubscribe
 *   chat(messages, opts) → Promise<string>
 */

export class AIEngine {
  /**
   * @param {object} o
   * @param {object|null} o.local   local provider (see above)
   * @param {object|null} o.online  OpenAICompatClient-like with `.configured` and `.chat()`
   * @param {() => boolean} o.isOnline
   */
  constructor({ local = null, online = null, isOnline = () => globalThis.navigator?.onLine ?? true } = {}) {
    this.local = local;
    this.online = online;
    this.isOnline = isOnline;
    this.listeners = new Set();
    this._lastRoute = null;
    this._unsub = local?.onStatus?.(() => this.#emit());
  }

  setOnline(online) {
    this.online = online;
    this.#emit();
  }

  onChange(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  #emit() {
    for (const cb of this.listeners) {
      try {
        cb(this.status());
      } catch {
        /* a bad listener must not break the engine */
      }
    }
  }

  localStatus() {
    const s = this.local?.status?.() ?? { state: 'unavailable' };
    return { state: s.state, detail: s.detail ?? null, message: OFFLINE_MESSAGES[s.state] ?? OFFLINE_MESSAGES.unavailable };
  }

  /** What will answer right now. */
  route() {
    if (this.online?.configured && this.isOnline()) return 'online';
    if (this.localStatus().state === 'ready') return 'local';
    return 'builtin';
  }

  status() {
    const local = this.localStatus();
    const route = this.route();
    const online = Boolean(this.online?.configured && this.isOnline());
    const label =
      route === 'online' ? 'NIE · online' : route === 'local' ? 'NIE · offline ready' : local.state === 'starting' ? 'NIE · starting' : 'NIE · built-in guidance';
    return { route, label, local, online, banner: route === 'online' ? null : local.message };
  }

  /**
   * Try online → local. Returns { text, route } on success, or { text: null, route: 'builtin', error } so the caller
   * can use the built-in guidance (and say so). Never throws for provider failures.
   */
  async chat(messages, opts = {}) {
    const errors = [];
    if (this.online?.configured && this.isOnline()) {
      try {
        const text = await this.online.chat(messages, opts);
        this._lastRoute = 'online';
        return { text, route: 'online' };
      } catch (err) {
        if (err?.kind === 'abort') throw err;
        errors.push(err);
      }
    }
    if (this.local && this.localStatus().state === 'ready') {
      try {
        const text = await this.local.chat(messages, opts);
        this._lastRoute = 'local';
        return { text, route: 'local', fellBack: errors.length > 0 };
      } catch (err) {
        if (err?.kind === 'abort') throw err;
        errors.push(err);
      }
    }
    this._lastRoute = 'builtin';
    return { text: null, route: 'builtin', error: errors.at(-1) ?? null };
  }

  dispose() {
    this._unsub?.();
    this.listeners.clear();
  }
}
