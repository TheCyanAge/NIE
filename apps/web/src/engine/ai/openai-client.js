/**
 * Minimal OpenAI-compatible chat client with streaming. Works unchanged in Node 22 and in the browser.
 * Used for the local llama-server (http://127.0.0.1:<port>/v1) and for any configured online provider.
 */

export class AIError extends Error {
  constructor(message, { status = null, cause = null, kind = 'error' } = {}) {
    super(message);
    this.name = 'AIError';
    this.status = status;
    this.kind = kind; // 'network' | 'http' | 'abort' | 'timeout' | 'bad-response' | 'error'
    if (cause) this.cause = cause;
  }
}

/** Parse an SSE byte stream into `data:` payload strings. */
export async function* sseData(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.search(/\r?\n\r?\n/)) !== -1) {
        const block = buf.slice(0, idx);
        buf = buf.slice(idx).replace(/^\r?\n\r?\n/, '');
        const data = block
          .split(/\r?\n/)
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.slice(5).trimStart())
          .join('\n');
        if (data) yield data;
      }
    }
    const tail = buf.trim();
    if (tail.startsWith('data:')) yield tail.slice(5).trimStart();
  } finally {
    reader.releaseLock?.();
  }
}

export class OpenAICompatClient {
  /** `jsonSchema`: the server can constrain a reply to a JSON schema (llama-server can; an arbitrary online provider may not, so it is opt-in). */
  constructor({ baseUrl, apiKey = '', model = 'default', fetchImpl = globalThis.fetch?.bind(globalThis), timeoutMs = 120000, headers = {}, jsonSchema = false } = {}) {
    this.baseUrl = String(baseUrl ?? '').replace(/\/+$/, '');
    this.apiKey = apiKey;
    this.model = model;
    this.fetch = fetchImpl;
    this.timeoutMs = timeoutMs;
    this.headers = headers;
    this.jsonSchema = jsonSchema;
  }

  get configured() {
    return Boolean(this.baseUrl);
  }

  #headers() {
    const h = { 'Content-Type': 'application/json', ...this.headers };
    if (this.apiKey) h.Authorization = `Bearer ${this.apiKey}`;
    return h;
  }

  async health({ signal } = {}) {
    const root = this.baseUrl.replace(/\/v1$/, '');
    try {
      const res = await this.fetch(`${root}/health`, { signal });
      return { ok: res.ok, status: res.status };
    } catch (cause) {
      return { ok: false, status: 0, error: cause?.message };
    }
  }

  /**
   * `json`: a JSON schema the reply must follow (used to read a message's meaning as a label, never prose). `timeoutMs` overrides the default for one call.
   * @returns {Promise<string>} the full reply text. `onToken(delta, full)` is called for each streamed chunk.
   */
  async chat(messages, { stream = true, onToken, signal, maxTokens = 700, temperature = 0.7, extra = {}, json = null, timeoutMs = null } = {}) {
    if (!this.configured) throw new AIError('No AI endpoint configured', { kind: 'error' });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(new AIError('The model took too long to respond', { kind: 'timeout' })), timeoutMs ?? this.timeoutMs);
    const onAbort = () => ctrl.abort(signal.reason ?? new AIError('Cancelled', { kind: 'abort' }));
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) onAbort();

    try {
      const body = { model: this.model, messages, stream, max_tokens: maxTokens, temperature, cache_prompt: true, ...extra };
      if (json && this.jsonSchema) body.response_format = { type: 'json_schema', json_schema: { name: 'reading', strict: true, schema: json } };
      let res;
      try {
        res = await this.fetch(`${this.baseUrl}/chat/completions`, { method: 'POST', headers: this.#headers(), body: JSON.stringify(body), signal: ctrl.signal });
      } catch (cause) {
        if (ctrl.signal.aborted) throw ctrl.signal.reason instanceof AIError ? ctrl.signal.reason : new AIError('Cancelled', { kind: 'abort', cause });
        throw new AIError(`Could not reach the model: ${cause?.message ?? cause}`, { kind: 'network', cause });
      }
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new AIError(`The model returned ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`, { status: res.status, kind: 'http' });
      }

      if (!stream) {
        const json = await res.json();
        const text = json?.choices?.[0]?.message?.content;
        if (typeof text !== 'string') throw new AIError('The model sent an unexpected response', { kind: 'bad-response' });
        onToken?.(text, text);
        return text;
      }

      let full = '';
      try {
        for await (const data of sseData(res.body)) {
          if (data === '[DONE]') break;
          let json;
          try {
            json = JSON.parse(data);
          } catch {
            continue;
          }
          const delta = json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.text ?? '';
          if (delta) {
            full += delta;
            onToken?.(delta, full);
          }
        }
      } catch (cause) {
        if (ctrl.signal.aborted) throw ctrl.signal.reason instanceof AIError ? ctrl.signal.reason : new AIError('Cancelled', { kind: 'abort', cause });
        throw new AIError(`The model stopped mid-reply: ${cause?.message ?? cause}`, { kind: 'network', cause });
      }
      if (!full.trim()) throw new AIError('The model returned an empty reply', { kind: 'bad-response' });
      return full;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }
}
