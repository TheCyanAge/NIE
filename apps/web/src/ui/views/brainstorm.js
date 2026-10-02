import { h, $, clear, mdLite, pageHead } from '../dom.js';
import { createThinking } from '../thinking.js';
import { STARTER } from '../../engine/orchestrator/index.js';

/**
 * Brainstorm: a conversation about ideas. NIE reflects, asks and offers angles; it never writes or edits the writer's text.
 * The "Try:" starter appears only while the conversation is empty. Afterwards the chips follow what was just said.
 */
export function mountBrainstorm(root, app) {
  const log = h('div', { class: 'chat-log', id: 'chat-log', role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversation with NIE' });
  const chips = h('div', { class: 'chips chat-chips', id: 'chat-chips' });
  const input = h('textarea', { id: 'brainstorm-input', class: 'chat-input', rows: '2', 'data-tour': 'brainstorm-input', placeholder: 'Tell NIE what you\'re thinking about…', 'aria-label': 'Message to NIE' });
  const send = h('button', { class: 'btn btn-primary', id: 'brainstorm-send', type: 'submit' }, 'Send');
  const stop = h('button', { class: 'btn', id: 'brainstorm-stop', type: 'button', hidden: true, onclick: () => app.session.chatAbort?.abort() }, 'Stop');
  const form = h('form', { class: 'chat-form', onsubmit: (e) => { e.preventDefault(); submit(); } }, input, h('div', { class: 'chat-buttons' }, send, stop));
  root.append(
    pageHead({ eyebrow: 'Brainstorm', title: 'Think it through with NIE', sub: 'Story ideas, genre support and narrative direction. NIE won\'t write or edit your text. It asks questions and helps you think.' }),
    h('div', { class: 'chat-shell' }, h('div', { class: 'chat' }, log, chips, form)));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); }
  });

  const bubble = (role, text) => {
    const body = h('div', { class: 'bubble-body' });
    body.append(mdLite(text));
    return h('div', { class: `msg msg-${role}`, dataset: { role } }, h('div', { class: 'msg-who' }, role === 'user' ? 'You' : 'NIE'), body);
  };

  function setChips(list) {
    clear(chips);
    for (const s of list) chips.append(h('button', { class: 'chip', type: 'button', dataset: { chip: '1' }, onclick: () => {
      if (!s.text) { if (/rule/i.test(s.label)) app.setView('scan'); return; }
      input.value = s.text; input.focus(); input.setSelectionRange(input.value.length, input.value.length);
    } }, s.label));
  }

  function render() {
    clear(log);
    const msgs = app.project.conversation.messages;
    if (!msgs.length) {
      log.append(h('p', { class: 'empty-note' }, 'Start anywhere. A person, a place, a feeling, a "what if", or just "I don\'t know where to start."'));
      setChips([STARTER]);
    } else {
      for (const m of msgs) log.append(bubble(m.role, m.content));
      setChips(app.session.lastSuggestions ?? [{ label: 'Add more details', text: 'Let me add more details: ' }]);
    }
    input.value = '';
    busy(false);
    log.scrollTop = log.scrollHeight;
  }

  function busy(on) {
    app.session.chatBusy = on;
    send.disabled = on;
    stop.hidden = !on;
  }

  async function submit() {
    const text = input.value.trim();
    if (!text || app.session.chatBusy) return;
    const sess = app.session;
    const project = app.project;
    input.value = '';
    if (!project.conversation.messages.length) clear(log);
    log.append(bubble('user', text));
    const thinking = createThinking('NIE is thinking');
    const holder = h('div', { class: 'msg msg-assistant msg-pending' }, h('div', { class: 'msg-who' }, 'NIE'), thinking);
    log.append(holder);
    log.scrollTop = log.scrollHeight;
    clear(chips);
    busy(true);
    sess.chatAbort = new AbortController();
    let streamed = false;
    try {
      const res = await app.orchestrator.brainstorm({
        project, message: text, signal: sess.chatAbort.signal,
        onToken: (_d, full) => {
          if (app.session !== sess) return;
          if (!streamed) { streamed = true; thinking.remove(); }
          const body = $('.bubble-body', holder) ?? holder.appendChild(h('div', { class: 'bubble-body' }));
          clear(body).append(mdLite(full));
          log.scrollTop = log.scrollHeight;
        },
      });
      if (app.session !== sess) return;
      holder.replaceWith(bubble('assistant', res.reply));
      sess.lastSuggestions = res.suggestions;
      setChips(res.suggestions);
      app.saveNow();
    } catch (err) {
      if (app.session !== sess) return;
      holder.replaceWith(h('div', { class: 'msg msg-assistant msg-note' }, err?.kind === 'abort' ? 'Stopped.' : `Something went wrong: ${err?.message ?? err}`));
      setChips([{ label: 'Add more details', text: 'Let me add more details: ' }]);
      app.saveNow();
    } finally {
      if (app.session === sess) { busy(false); log.scrollTop = log.scrollHeight; input.focus(); }
    }
  }

  app.on('project', render);
  render();
  return { focus: () => input.focus(), primaryInput: () => input };
}
