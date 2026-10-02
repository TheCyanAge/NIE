import { OpenAICompatClient } from './openai-client.js';
import { makeBridgeChat } from './bridge.js';

/**
 * Online providers (optional). NIE works fully without one. Both adapters expose `{ configured, chat }`
 * so AIEngine can treat them identically.
 */

/** Desktop: the main process holds the API key and makes the request (no CORS, key never in the page). */
export function createBridgeOnline(bridge) {
  let cfg = { enabled: false, baseUrl: '', model: '', hasKey: false };
  const chat = makeBridgeChat(bridge);
  return {
    kind: 'bridge',
    get configured() {
      return cfg.enabled && Boolean(cfg.baseUrl);
    },
    config: () => cfg,
    async refresh() {
      cfg = await bridge.getConfig();
      return cfg;
    },
    async save(next) {
      await bridge.setConfig(next);
      return this.refresh();
    },
    test: () => bridge.test(),
    chat,
  };
}

/** Browser-only: talks to the provider directly (needs a CORS-friendly endpoint). Settings live in localStorage. */
export function createDirectOnline({ load, save }) {
  let cfg = load() ?? { enabled: false, baseUrl: '', model: '', apiKey: '' };
  const client = () => new OpenAICompatClient({ baseUrl: cfg.enabled ? cfg.baseUrl : '', apiKey: cfg.apiKey, model: cfg.model || 'default', timeoutMs: 60000 });
  return {
    kind: 'direct',
    get configured() {
      return cfg.enabled && Boolean(cfg.baseUrl);
    },
    config: () => ({ enabled: cfg.enabled, baseUrl: cfg.baseUrl, model: cfg.model, hasKey: Boolean(cfg.apiKey), keyStoredSecurely: false }),
    async refresh() {
      return this.config();
    },
    async save(next) {
      cfg = { ...cfg, enabled: Boolean(next.enabled), baseUrl: next.baseUrl ?? '', model: next.model ?? '', apiKey: next.clearKey ? '' : next.apiKey || cfg.apiKey };
      save(cfg);
      return this.config();
    },
    async test() {
      try {
        await client().chat([{ role: 'user', content: 'Say OK.' }], { stream: false, maxTokens: 4 });
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err?.message ?? String(err) };
      }
    },
    chat: (messages, opts) => client().chat(messages, opts),
  };
}
