import { h, $, $$, clear, mdLite, pageHead } from '../dom.js';
import { createThinking } from '../thinking.js';
import { STARTER } from '../../engine/orchestrator/index.js';
import { BUTTONS, KINDS, LENSES } from '../../engine/brainstorm/lenses.js';
import { addToBoard, ideaId, isOnBoard, removeFromBoard } from '../../engine/project/board.js';
import { resolveKind } from '../../engine/brainstorm/ideas.js';
import { mountBoard } from './board.js';

/**
 * Brainstorm: NIE as an idea partner for any literary project (stories, characters, worlds, articles, essays, poems, scripts).
 * NIE offers concepts, angles, complications and questions; the writer keeps what pulls at them on the Idea Board.
 * NIE never writes or edits the writer's text. The "Try:" starter appears only while the conversation is empty.
 */
export function mountBrainstorm(root, app) {
  const log = h('div', { class: 'chat-log', id: 'chat-log', role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversation with NIE' });
  const chips = h('div', { class: 'chips chat-chips', id: 'chat-chips' });
  const kindRow = h('div', { class: 'kind-row', id: 'kind-row', role: 'radiogroup', 'aria-label': 'What are you brainstorming?' });
  const lensRow = h('div', { class: 'chips lens-row', id: 'lens-row', 'aria-label': 'Quick idea requests' });
  const input = h('textarea', { id: 'brainstorm-input', class: 'chat-input', rows: '2', 'data-tour': 'brainstorm-input', placeholder: 'Tell NIE what you\'re thinking about, or ask for ideas…', 'aria-label': 'Message to NIE' });
  const send = h('button', { class: 'btn btn-primary', id: 'brainstorm-send', type: 'submit' }, 'Send');
  const stop = h('button', { class: 'btn', id: 'brainstorm-stop', type: 'button', hidden: true, onclick: () => app.session.chatAbort?.abort() }, 'Stop');
  const form = h('form', { class: 'chat-form', onsubmit: (e) => { e.preventDefault(); submit(); } }, input, h('div', { class: 'chat-buttons' }, send, stop));
  const board = mountBoard(app, { onDevelop: (text) => ask({ ask: `Let's develop this idea: ${text}`, lens: 'develop' }), onChange: () => refreshStars() });

  root.append(
    pageHead({ eyebrow: 'Brainstorm', title: 'Brainstorm with NIE', sub: 'Stories, characters, worlds, articles, essays, poems, scripts: anything literary. NIE throws ideas at you and asks the questions that sharpen them. Keep the ones that pull. It never writes or edits your text.' }),
    h('div', { class: 'brain-layout' },
      h('div', { class: 'chat-shell brain-main' }, kindRow, h('div', { class: 'chat' }, log, chips, form), lensRow),
      board.el));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); }
  });

  // ── What are we brainstorming? ──────────────────────────────────────────────
  const kindChoice = () => app.project.brainstorm.kind;
  const effectiveKind = () => (kindChoice() !== 'auto' ? kindChoice() : app.project.brainstorm.detectedKind ?? resolveKind(app.project, '', null).kind);

  function renderKinds() {
    clear(kindRow);
    for (const k of [{ id: 'auto', label: 'Anything', blurb: 'NIE works out what you are making from what you say.' }, ...KINDS]) {
      const on = kindChoice() === k.id;
      kindRow.append(h('button', { class: `chip kind-chip${on ? ' is-active' : ''}`, type: 'button', role: 'radio', 'aria-checked': String(on), title: k.blurb, dataset: { kind: k.id },
        onclick: () => { app.project.brainstorm.kind = k.id; app.saveNow(); renderKinds(); renderLenses(); board.refresh(); } }, k.label));
    }
  }

  function renderLenses() {
    clear(lensRow);
    const ids = kindChoice() === 'auto' && !app.project.brainstorm.detectedKind ? BUTTONS.auto : BUTTONS[effectiveKind()] ?? BUTTONS.auto;
    for (const id of ids) lensRow.append(h('button', { class: 'chip lens-chip', type: 'button', dataset: { lens: id }, onclick: () => ask({ ask: LENSES[id].ask, lens: id }) }, LENSES[id].label));
    if (kindChoice() === 'auto' && !app.project.brainstorm.detectedKind) {
      if (!ids.includes('blend')) lensRow.append(h('button', { class: 'chip lens-chip', type: 'button', dataset: { lens: 'blend' }, onclick: () => ask({ ask: LENSES.blend.ask, lens: 'blend' }) }, LENSES.blend.label));
    }
  }

  // ── Messages ────────────────────────────────────────────────────────────────
  const refreshStars = () => {
    for (const b of $$('.idea-keep', log)) {
      const on = isOnBoard(app.project, b.closest('.idea').dataset.ideaId);
      b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? '★' : '☆';
      b.title = on ? 'Kept on your Idea Board. Tap to remove.' : 'Keep on your Idea Board';
    }
  };

  function ideaCard(idea) {
    // The board identifies an idea by its text (so the same idea is never kept twice); cards use the same key.
    const key = ideaId(idea.text);
    const keep = h('button', { class: 'idea-keep icon-btn', type: 'button', 'aria-label': 'Keep this idea on the Idea Board', 'aria-pressed': 'false',
      onclick: () => {
        if (isOnBoard(app.project, key)) removeFromBoard(app.project, key);
        else addToBoard(app.project, { text: idea.text, lens: idea.lens, kind: idea.kind, source: 'nie' });
        app.saveNow(); refreshStars(); board.refresh();
      } }, '☆');
    return h('li', { class: 'idea', dataset: { ideaId: key } },
      h('span', { class: 'tag idea-lens' }, idea.lensLabel ?? 'Idea'),
      h('p', { class: 'idea-text' }, idea.text),
      h('div', { class: 'idea-actions' }, keep, h('button', { class: 'link idea-develop', type: 'button', onclick: () => ask({ ask: `Let's develop this idea: ${idea.text}`, lens: 'develop' }) }, 'Develop')));
  }

  function bubble(role, text, meta = {}) {
    const body = h('div', { class: 'bubble-body' });
    if (role === 'assistant' && meta.ideas?.length) {
      if (meta.lead) body.append(mdLite(meta.lead));
      body.append(h('ol', { class: 'idea-list' }, ...meta.ideas.map(ideaCard)));
      if (meta.tail) body.append(mdLite(meta.tail));
    } else {
      body.append(mdLite(text));
    }
    return h('div', { class: `msg msg-${role}`, dataset: { role } }, h('div', { class: 'msg-who' }, role === 'user' ? 'You' : 'NIE'), body);
  }

  function setChips(list) {
    clear(chips);
    for (const s of list) chips.append(h('button', { class: 'chip', type: 'button', dataset: { chip: '1' }, onclick: () => {
      if (s.send) return ask(s.send);
      if (!s.text) { if (/rule/i.test(s.label)) app.setView('scan'); return; }
      input.value = s.text; input.focus(); input.setSelectionRange(input.value.length, input.value.length);
    } }, s.label));
  }

  function render() {
    clear(log);
    const msgs = app.project.conversation.messages;
    if (!msgs.length) {
      log.append(h('p', { class: 'empty-note' }, 'Start anywhere. Pick what you are making above, tap an idea button, or just talk: a person, a place, a feeling, a "what if", or "I don\'t know where to start."'));
      setChips([STARTER, { label: 'Surprise me', text: '', send: { ask: 'Surprise me with a few sparks.', lens: 'spark' } }]);
    } else {
      for (const m of msgs) log.append(bubble(m.role, m.content, m));
      setChips(app.session.lastSuggestions ?? [{ label: 'Add more details', text: 'Let me add more details: ' }, { label: 'Give me some ideas', text: '', send: { ask: 'Give me some ideas.' } }]);
    }
    input.value = '';
    busy(false);
    renderKinds();
    renderLenses();
    board.refresh();
    refreshStars();
    log.scrollTop = log.scrollHeight;
  }

  function busy(on) {
    app.session.chatBusy = on;
    send.disabled = on;
    stop.hidden = !on;
  }

  /** A button or chip that sends a request straight away (it is a request, not text for the writer to edit). */
  function ask({ ask: text, lens = null }) {
    if (app.session.chatBusy) return;
    return submit(text, { lens });
  }

  async function submit(override = null, { lens = null } = {}) {
    const text = (override ?? input.value).trim();
    if (!text || app.session.chatBusy) return;
    const sess = app.session;
    const project = app.project;
    if (override == null) input.value = '';
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
        project, message: text, lens, kind: kindChoice() === 'auto' ? null : kindChoice(), signal: sess.chatAbort.signal,
        onToken: (_d, full) => {
          if (app.session !== sess) return;
          if (!streamed) { streamed = true; thinking.remove(); }
          const body = $('.bubble-body', holder) ?? holder.appendChild(h('div', { class: 'bubble-body' }));
          clear(body).append(mdLite(full));
          log.scrollTop = log.scrollHeight;
        },
      });
      if (app.session !== sess) return;
      holder.replaceWith(bubble('assistant', res.reply, res));
      sess.lastSuggestions = res.suggestions;
      setChips(res.suggestions);
      app.saveNow();
      refreshStars();
      renderKinds();
      renderLenses();
      board.refresh();
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
