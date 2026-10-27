import { h, $, $$, clear, mdLite, pageHead } from '../dom.js';
import { createThinking } from '../thinking.js';
import { STARTER } from '../../engine/orchestrator/index.js';
import { BUTTONS, KINDS, LENSES } from '../../engine/brainstorm/lenses.js';
import { addToBoard, ideaId, isOnBoard, removeFromBoard } from '../../engine/project/board.js';
import { resolveKind } from '../../engine/brainstorm/ideas.js';
import { mountBoard } from './board.js';
import { sanitizeWebRecord } from '../../engine/web/record.js';
import { providerName } from '../../engine/web/bridge.js';

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
  // The Web switch: on, a factual question is looked up on the web and answered with numbered sources. It stays off unless the writer turned web search on in Settings.
  const webBtn = h('button', { class: 'btn btn-sm web-toggle', id: 'web-toggle', type: 'button', 'aria-pressed': 'false', disabled: true, title: 'Checking web search…', onclick: () => { setWebWanted(!webWanted()); paintWeb(); } }, 'Web');
  const form = h('form', { class: 'chat-form', onsubmit: (e) => { e.preventDefault(); submit(); } }, input, h('div', { class: 'chat-buttons' }, webBtn, send, stop));
  const board = mountBoard(app, { onDevelop: (text) => ask({ ask: `Let's develop this idea: ${text}`, lens: 'develop' }), onChange: () => refreshStars(), onAsk: (text) => ask({ ask: text }) });

  root.append(
    pageHead({ eyebrow: 'Brainstorm', title: 'Brainstorm with NIE', sub: 'Stories, characters, worlds, articles, essays, poems, scripts: anything literary. NIE throws ideas at you and asks the questions that sharpen them. Keep the ones that pull. It never writes or edits your text.' }),
    h('div', { class: 'brain-layout' },
      h('div', { class: 'chat-shell brain-main' }, kindRow, h('div', { class: 'chat' }, log, chips, form), lensRow),
      board.el));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); }
  });

  // ── The Web switch ──────────────────────────────────────────────────────────
  // The choice is a per-person convenience kept in this browser; the switch only works while web search is set up AND turned on in Settings.
  const WEB_KEY = 'nie.v1.webOn';
  const webWanted = () => {
    try {
      const v = window.localStorage.getItem(WEB_KEY);
      return v === 'true' || v === '1';
    } catch {
      return false;
    }
  };
  const setWebWanted = (on) => {
    try {
      window.localStorage.setItem(WEB_KEY, String(on));
    } catch {
      /* the choice is simply not remembered */
    }
  };
  let webState = null; // what web.status() last said
  const webUsable = () => Boolean(webState?.configured && webState.enabled);
  const webOn = () => webUsable() && webWanted();
  function paintWeb() {
    const on = webOn();
    webBtn.disabled = !webUsable();
    webBtn.setAttribute('aria-pressed', String(on));
    const where = providerName(webState?.provider);
    webBtn.title = app.web.kind === 'none' ? 'Web search needs the desktop app.'
      : !webState ? 'Checking web search…'
      : !webState.configured && !webState.enabled ? 'Add a key in Settings and turn web search on there to search the web.'
      : !webState.configured ? 'Add a key in Settings to search the web.'
      : !webState.enabled ? 'Turn web search on in Settings to search the web.'
      : on ? `Web search is on: the words of your question are sent to ${where}. Tap to turn it off.`
      : `Search the web, with numbered sources (the words of your question are sent to ${where}). Tap to turn it on.`;
  }
  async function refreshWeb() {
    webState = await app.web.status().catch(() => null);
    paintWeb();
  }

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

  /** Where a web answer came from: the words that were searched for, the numbered sources (the same numbers as the [1] marks in the reply), and one plain sentence. */
  function webSources(raw) {
    const w = sanitizeWebRecord(raw); // the record is checked again here, so a link is only ever an https one
    if (!w) return null;
    const searched = w.state === 'answered' || w.state === 'results-only' || w.state === 'none-found';
    const query = w.query && (searched || w.state === 'failed') ? h('p', { class: 'web-query muted' }, `${searched ? 'Searched' : 'Tried to search'} the web with ${providerName(w.provider)} for: "${w.query}"`) : null;
    const open = (url) => (e) => {
      if (!window.NIE_DESKTOP?.openExternal) return; // a browser follows the link itself
      e.preventDefault();
      window.NIE_DESKTOP.openExternal(url);
    };
    const list = w.sources.length ? h('ol', { class: 'web-source-list', 'aria-label': 'Sources' }, ...w.sources.map((s) =>
      h('li', { class: 'web-source', value: String(s.n), dataset: { n: String(s.n) } },
        s.url ? h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', onclick: open(s.url) }, s.title) : h('span', {}, s.title),
        s.host ? h('span', { class: 'muted web-host' }, ` · ${s.host}`) : null,
        w.answeredBy !== 'none' ? h('span', { class: 'tag web-read' }, s.read ? 'page read' : 'snippet only') : null))) : null;
    const note = w.note ? h('p', { class: 'web-note muted' }, w.note) : null;
    return query || list || note ? h('div', { class: 'web-sources', dataset: { state: w.state } }, query, list, note) : null;
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
    const web = role === 'assistant' && meta.web ? webSources(meta.web) : null;
    if (web) body.append(web);
    // What NIE looked at is part of the message's record, shown under it (open it to read): written into the reply it made every reply end the same way.
    if (role === 'assistant' && meta.looked) body.append(h('details', { class: 'looked' }, h('summary', {}, 'What I looked at'), h('p', { class: 'muted small' }, meta.looked)));
    // What NIE drew on from earlier in the project for this reply: the writer's own words and where each came from, so nothing it "remembers" is hidden.
    if (role === 'assistant' && meta.recalled?.length) {
      body.append(h('details', { class: 'looked recalled' }, h('summary', {}, `What I remembered from earlier (${meta.recalled.length})`),
        h('ul', { class: 'recalled-list' }, ...meta.recalled.map((r) => h('li', {}, h('span', {}, r.text), h('span', { class: 'muted small' }, ` · ${r.where}`))))));
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

  /** "about 6 min left": honest, rounded, and only said once there is a measured speed behind it. */
  const eta = (ms) => (ms == null ? '' : ms < 45000 ? ' · under a minute left' : ` · about ${Math.max(1, Math.round(ms / 60000))} min left`);
  const progressText = (p) => (p.stage === 'web'
    ? String(p.message ?? '')
    : p.stage === 'overview'
      ? 'Putting what I read together…'
      : `Reading your text, section ${Math.min(p.total, p.done + 1)} of ${p.total}${p.done === 0 && p.cached ? ` (${p.cached} already read earlier)` : ''}${eta(p.etaMs)}`);

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
    let lastProgress = null;
    const progress = h('span', { class: 'muted nie-progress', id: 'read-progress', 'aria-hidden': 'true' });
    try {
      const res = await app.orchestrator.brainstorm({
        project, message: text, lens, kind: kindChoice() === 'auto' ? null : kindChoice(), web: webOn(), signal: sess.chatAbort.signal,
        onProgress: (p) => {
          if (app.session !== sess || streamed) return;
          lastProgress = p;
          progress.textContent = progressText(p);
          if (!progress.isConnected) thinking.after(progress);
          // the notes made so far are kept with the project, so a closed window or a Stop loses nothing
          if (p.stage === 'reading' && p.done > 0 && p.done % 4 === 0) app.saveNow();
        },
        onToken: (_d, full) => {
          if (app.session !== sess) return;
          if (!streamed) { streamed = true; thinking.remove(); progress.remove(); }
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
      const stopped = err?.kind === 'abort' || err?.kind === 'aborted'
        ? (lastProgress?.stage === 'reading' && lastProgress.modelRead > 0 ? `Stopped. I had read ${lastProgress.modelRead} of ${lastProgress.total} sections of your text and kept notes on them; ask again and I'll carry on from there.` : 'Stopped.')
        : `Something went wrong: ${err?.message ?? err}`;
      holder.replaceWith(h('div', { class: 'msg msg-assistant msg-note' }, stopped));
      setChips([{ label: 'Add more details', text: 'Let me add more details: ' }]);
      app.saveNow();
    } finally {
      if (app.session === sess) { busy(false); log.scrollTop = log.scrollHeight; input.focus(); }
    }
  }

  app.on('project', render);
  app.on('web', refreshWeb);
  app.on('view', (v) => { if (v === 'brainstorm') refreshWeb(); });
  render();
  refreshWeb();
  return { focus: () => input.focus(), primaryInput: () => input };
}
