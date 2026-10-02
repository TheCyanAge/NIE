// Tiny DOM helpers. No innerHTML with user text anywhere: everything goes through textContent / createTextNode.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** h('div', { class: 'x', dataset: {a: 1}, onclick: fn, hidden: true }, 'text', childEl, ...) */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'text') el.textContent = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  append(el, children);
  return el;
}

export function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** Eyebrow label + serif title + muted subtitle (+ optional action buttons), as used at the top of every mode. */
export function pageHead({ eyebrow, title, sub, actions = [] }) {
  return h('header', { class: 'page-head' },
    h('div', {}, h('span', { class: 'eyebrow' }, eyebrow), h('h1', { class: 'page-title' }, title), sub ? h('p', { class: 'page-sub' }, sub) : null),
    actions.length ? h('div', { class: 'row' }, ...actions) : null);
}

export function clear(el) {
  el.replaceChildren();
  return el;
}

export function debounce(fn, ms) {
  let t;
  const d = (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
  d.flush = (...a) => {
    clearTimeout(t);
    fn(...a);
  };
  d.cancel = () => clearTimeout(t);
  return d;
}

/** A very small markdown subset (paragraphs, "- " bullets, **bold**, *italic*) rendered safely. */
export function mdLite(text) {
  const frag = document.createDocumentFragment();
  const inline = (s) => {
    const out = [];
    const re = /\*\*([^*]+)\*\*|\*([^*\n]+)\*/g;
    let last = 0;
    for (const m of s.matchAll(re)) {
      if (m.index > last) out.push(s.slice(last, m.index));
      out.push(m[1] ? h('strong', {}, m[1]) : h('em', {}, m[2]));
      last = m.index + m[0].length;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  };
  const BULLET = /^\s*[-•]\s+/;
  const NUMBERED = /^\s*\d{1,2}[.)]\s+/;
  for (const block of String(text).split(/\n{2,}/)) {
    const lines = block.split('\n').filter((l) => l.trim());
    const isItem = (l) => BULLET.test(l) || NUMBERED.test(l);
    const items = lines.filter(isItem);
    const list = () => {
      const ordered = NUMBERED.test(items[0]);
      return h(ordered ? 'ol' : 'ul', {}, ...items.map((l) => h('li', {}, ...inline(l.replace(ordered ? NUMBERED : BULLET, '')))));
    };
    if (items.length && items.length === lines.length) {
      frag.append(list());
    } else if (items.length) {
      const head = lines.filter((l) => !isItem(l)).join(' ');
      frag.append(h('p', {}, ...inline(head)));
      frag.append(list());
    } else {
      frag.append(h('p', {}, ...inline(lines.join(' '))));
    }
  }
  return frag;
}

let toastRoot;
export function toast(message, { kind = 'info', ms = 4200 } = {}) {
  toastRoot ??= document.getElementById('toast-root');
  if (!toastRoot) return;
  const t = h('div', { class: `toast toast-${kind}`, role: 'status' }, message);
  toastRoot.append(t);
  setTimeout(() => t.remove(), ms);
}

export const fmtDate = (ts) => new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function download(name, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = h('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
