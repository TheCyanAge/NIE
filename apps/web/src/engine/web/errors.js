/** Why a web search or page read did not work. `kind` is what the caller branches on; `message` is a plain sentence the writer can read. */
export class WebError extends Error {
  /** @param {'not-configured'|'auth'|'rate'|'network'|'bad-response'|'aborted'} kind */
  constructor(kind, message) {
    super(message);
    this.name = 'WebError';
    this.kind = kind;
  }
}
