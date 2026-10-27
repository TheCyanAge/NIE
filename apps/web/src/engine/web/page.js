import { WebError } from './errors.js';

/**
 * Reading a page the search found. Only public https pages are fetched (never an address on the writer's own machine or network), redirects are followed by hand and each hop is checked
 * again, the size and the time are capped, and what comes back is plain text with the page's navigation, scripts and styles removed. The text is shown to a model as untrusted data.
 * (A host name that resolves to a private address is not caught here: the check is on the name as written. That is why NIE only fetches pages a search service returned.)
 */

const MAX_BYTES = 1_500_000;
const MAX_HOPS = 3;
const PAGE_TIMEOUT_MS = 9000;
const TEXT_TYPES = /^(?:text\/html|application\/xhtml\+xml|text\/plain)\b/i;
const PRIVATE_V4 = /^(?:0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|22[4-9]\.|2[3-5]\d\.)/;
const LOCAL_SUFFIX = /\.(?:local|localhost|internal|intranet|lan|home|corp|localdomain)$/i;

/** A page address NIE is willing to fetch: https, a public-looking DNS name, the default port, no credentials. */
export function isPublicHttpsUrl(raw) {
  let u;
  try {
    u = new URL(String(raw ?? ''));
  } catch {
    return false;
  }
  if (u.protocol !== 'https:' || u.username || u.password) return false;
  if (u.port && u.port !== '443') return false;
  const host = u.hostname.toLowerCase().replace(/\.$/, '');
  if (!host || host === 'localhost' || LOCAL_SUFFIX.test(host)) return false;
  if (host.includes(':') || host.startsWith('[')) return false; // an IPv6 literal
  if (/^[\d.]+$/.test(host) || /^0x[0-9a-f]+$/i.test(host)) return false; // an IPv4 literal (any spelling): reached through a name or not at all
  if (PRIVATE_V4.test(host)) return false;
  return host.includes('.');
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', copy: '©', middot: '·', eacute: 'é', egrave: 'è', uuml: 'ü', ouml: 'ö', auml: 'ä' };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,8});/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return code > 0 && code < 0x110000 && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : ' ';
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });

const DROP_BLOCKS = /<(script|style|noscript|svg|template|iframe|nav|footer|aside|form|header|figure|button|select|dialog)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const BLOCK_ENDS = /<\/(?:p|div|li|h[1-6]|tr|section|article|blockquote|pre|table|ul|ol)\s*>|<br\s*\/?>/gi;

/** @returns {{ title: string, text: string }} */
export function htmlToText(html) {
  let h = String(html ?? '').replace(/<!--[\s\S]*?-->/g, ' ');
  const title = decode((/<title[^>]*>([\s\S]{0,300}?)<\/title>/i.exec(h)?.[1] ?? '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  h = h.replace(DROP_BLOCKS, ' ');
  // the page's own main content when it says where it is (the longest <main> or <article>)
  let best = '';
  for (const m of h.matchAll(/<(main|article)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)) if (m[2].length > best.length) best = m[2];
  if (best.length > 600) h = best;
  const plain = decode(h.replace(BLOCK_ENDS, '\n').replace(/<[^>]+>/g, ' '));
  const lines = plain
    .split('\n')
    .map((l) => l.replace(/[ \t ]+/g, ' ').trim())
    .filter((l) => l.length >= 35 || /^[A-Z0-9][^.!?]{3,60}$/.test(l)); // menu entries and button labels are short; sentences and headings are not
  return { title, text: lines.join('\n') };
}

/** The first `maxChars` characters, cut at the end of a sentence when there is one near the end. */
export function clipText(s, maxChars) {
  const t = String(s ?? '');
  if (t.length <= maxChars) return t;
  const cut = t.slice(0, maxChars);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('.\n'), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  return (stop > maxChars * 0.6 ? cut.slice(0, stop + 1) : cut).trim();
}

async function readCapped(res, maxBytes) {
  if (!res.body?.getReader) {
    const buf = new Uint8Array(await res.arrayBuffer());
    return buf.length > maxBytes ? buf.slice(0, maxBytes) : buf;
  }
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
    if (total >= maxBytes) {
      await reader.cancel().catch(() => {});
      break;
    }
  }
  const out = new Uint8Array(Math.min(total, maxBytes));
  let at = 0;
  for (const c of chunks) {
    const room = out.length - at;
    if (room <= 0) break;
    out.set(c.length > room ? c.subarray(0, room) : c, at);
    at += Math.min(c.length, room);
  }
  return out;
}

const withTimeout = (signal, ms) => {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  const onAbort = () => ctl.abort();
  signal?.addEventListener('abort', onAbort, { once: true });
  if (signal?.aborted) ctl.abort();
  return { signal: ctl.signal, done: () => { clearTimeout(timer); signal?.removeEventListener('abort', onAbort); } };
};

/** @returns {Promise<{ url: string, title: string, text: string } | null>} null when the page can not be read (blocked address, wrong type, too little text, error) */
export async function readPage(url, { fetch: doFetch, signal, maxChars = 6000, timeoutMs = PAGE_TIMEOUT_MS, maxBytes = MAX_BYTES } = {}) {
  if (typeof doFetch !== 'function') throw new WebError('not-configured', 'No way to fetch pages.');
  const t = withTimeout(signal, timeoutMs);
  try {
    let at = String(url);
    for (let hop = 0; hop <= MAX_HOPS; hop++) {
      if (!isPublicHttpsUrl(at)) return null;
      const res = await doFetch(at, { method: 'GET', redirect: 'manual', signal: t.signal, headers: { Accept: 'text/html,application/xhtml+xml,text/plain;q=0.8', 'User-Agent': 'NIE/1 (writing app; reads a page a search returned)' } });
      if (res.status >= 300 && res.status < 400) {
        const next = res.headers.get('location');
        if (!next) return null;
        at = new URL(next, at).href;
        continue;
      }
      if (!res.ok) return null;
      const type = res.headers.get('content-type') ?? '';
      if (!TEXT_TYPES.test(type)) return null;
      const bytes = await readCapped(res, maxBytes);
      const charset = /charset=([\w-]+)/i.exec(type)?.[1] ?? /<meta[^>]+charset=["']?([\w-]+)/i.exec(new TextDecoder('utf-8').decode(bytes.subarray(0, 2048)))?.[1] ?? 'utf-8';
      let html;
      try {
        html = new TextDecoder(charset).decode(bytes);
      } catch {
        html = new TextDecoder('utf-8').decode(bytes);
      }
      const plain = /^text\/plain/i.test(type);
      const { title, text } = plain ? { title: '', text: html.replace(/\r/g, '').trim() } : htmlToText(html);
      if (text.length < 120) return null;
      return { url: at, title, text: clipText(text, maxChars) };
    }
    return null;
  } catch (err) {
    if (signal?.aborted) throw new WebError('aborted', 'Stopped.');
    return null;
  } finally {
    t.done();
  }
}
