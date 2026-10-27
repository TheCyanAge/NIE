import { h } from './dom.js';

/**
 * NIE's built-in web search sends the words of a question to a service the NIE developers run. The writer is told exactly that, in these words, before it is ever used:
 * Settings and the dialog the Web switch opens show this one text, so it is written once, here.
 */
export const BUILTIN_DISCLOSURE =
  'Ready to use: NIE can look things up for you without any setup. When you use it, the words of your question are sent to a search service run by the NIE developers, which asks a search provider for them and sends the results back. Your manuscript, your project and your earlier messages are never sent. A random install code (not your name, not an account) is sent so the service can limit abuse. The service is built not to keep your questions.';

/**
 * Ask the writer to agree to the built-in search. Resolves true only for "Use NIE's search"; "Not now", Escape and anything else resolve false, and nothing is changed.
 * "Not now" has the focus, so pressing Enter never agrees for the writer.
 */
export function askBuiltinConsent() {
  return new Promise((resolve) => {
    const dlg = h('dialog', { id: 'web-consent', class: 'dialog', 'aria-labelledby': 'web-consent-title' },
      h('form', { method: 'dialog', class: 'dialog-body' },
        h('h2', { id: 'web-consent-title' }, "Use NIE's built-in search?"),
        h('p', { id: 'web-consent-text' }, BUILTIN_DISCLOSURE),
        h('p', { class: 'muted small' }, 'You can take this back at any time in Settings.'),
        h('div', { class: 'dialog-actions end' },
          h('button', { class: 'btn btn-primary', value: 'agree', id: 'web-consent-agree' }, "Use NIE's search"),
          h('button', { class: 'btn btn-quiet', value: 'cancel', id: 'web-consent-later', autofocus: true }, 'Not now'))));
    dlg.addEventListener('close', () => { resolve(dlg.returnValue === 'agree'); dlg.remove(); });
    document.body.append(dlg);
    dlg.showModal();
  });
}
