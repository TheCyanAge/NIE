import { h } from './dom.js';

/**
 * NIE has two built-in web searches, and each sends the words of a question somewhere the writer did not choose: Wikipedia (every build; no key, no server of NIE's) and NIE's own
 * search service (only a build that carries its address). The writer is told exactly that, in these words, before either is ever used, and agrees to each service on its own.
 * Settings and the dialog the Web switch opens show the same text, so each is written once, here.
 */
export const BUILTIN_DISCLOSURE =
  'Ready to use: NIE can look things up for you without any setup. When you use it, the words of your question are sent to a search service run by the NIE developers, which asks a search provider for them and sends the results back. Your manuscript, your project and your earlier messages are never sent. A random install code (not your name, not an account) is sent so the service can limit abuse. The service is built not to keep your questions.';

export const WIKIPEDIA_DISCLOSURE =
  "Ready to use: NIE can look things up on Wikipedia for you without any setup and without a key. When you use it, the words of your question are sent to Wikipedia (run by the Wikimedia Foundation), which sends back matching articles that NIE reads. Your manuscript, your project and your earlier messages are never sent. Wikipedia's servers see the request as they would from any visitor, including your internet address. Wikipedia covers facts, history, people, places and terms well; it is not the whole web, so news, prices and recent events may be missing.";

/**
 * What each built-in service is called where the writer meets it. `name` is for running text; `heading` and `checkbox` are Settings; `question` and `agree` are the dialog;
 * `agreeTo` finishes "Web search stays off until you agree to ..."; `ready` is the Settings status line while the writer has not agreed yet.
 */
export const BUILTIN_SEARCH = Object.freeze({
  nie: { name: "NIE's built-in search", disclosure: BUILTIN_DISCLOSURE, heading: "NIE's built-in search", checkbox: "Use NIE's built-in search", question: "Use NIE's built-in search?", agree: "Use NIE's search", agreeTo: "NIE's built-in search", ready: "NIE's built-in search is ready once you agree to it below." },
  wikipedia: { name: 'Wikipedia', disclosure: WIKIPEDIA_DISCLOSURE, heading: 'Wikipedia (built in)', checkbox: 'Look things up on Wikipedia', question: 'Look things up on Wikipedia?', agree: 'Use Wikipedia', agreeTo: 'look things up on Wikipedia', ready: 'Looking things up on Wikipedia is ready once you agree to it below.' },
});

/**
 * Ask the writer to agree to one built-in service. Resolves true only for its "agree" button; "Not now", Escape and anything else resolve false, and nothing is changed.
 * "Not now" has the focus, so pressing Enter never agrees for the writer. A service with no text here is never asked about (it resolves false).
 */
export function askBuiltinConsent(service = 'nie') {
  const words = BUILTIN_SEARCH[service];
  if (!words) return Promise.resolve(false);
  return new Promise((resolve) => {
    const dlg = h('dialog', { id: 'web-consent', class: 'dialog', 'aria-labelledby': 'web-consent-title', dataset: { service } },
      h('form', { method: 'dialog', class: 'dialog-body' },
        h('h2', { id: 'web-consent-title' }, words.question),
        h('p', { id: 'web-consent-text' }, words.disclosure),
        h('p', { class: 'muted small' }, 'You can take this back at any time in Settings.'),
        h('div', { class: 'dialog-actions end' },
          h('button', { class: 'btn btn-primary', value: 'agree', id: 'web-consent-agree' }, words.agree),
          h('button', { class: 'btn btn-quiet', value: 'cancel', id: 'web-consent-later', autofocus: true }, 'Not now'))));
    dlg.addEventListener('close', () => { resolve(dlg.returnValue === 'agree'); dlg.remove(); });
    document.body.append(dlg);
    dlg.showModal();
  });
}
