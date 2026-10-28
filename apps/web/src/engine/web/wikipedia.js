import { WebError } from './errors.js';
import { clipText } from './page.js';

/**
 * Wikipedia as a search source that needs no key, no account and no server of ours: the MediaWiki Action API is open to any program that says who it is. It is the search NIE has
 * with nothing set up, so it is deliberately narrow (an encyclopedia, not the whole web) and it says so wherever it is named. Articles are read through the extracts call (plain
 * text of the lead section), not by fetching the page and cutting its navigation away.
 * Wikimedia asks every program for a User-Agent that names it and says how to reach its makers; requests without one may be blocked.
 */

export const WIKIPEDIA_UA = 'NIE/0.1 (https://github.com/TheCyanAge/NIE; a writing app that looks up a question the writer asked)';
const LANG = /^[a-z]{2,3}(?:-[a-z]{2,8})?$/;
const stripTags = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

const apiUrl = (lang, params) => `https://${lang}.wikipedia.org/w/api.php?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`;
export const articleUrl = (title, lang = 'en') => `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(String(title).replace(/ /g, '_'))}`;

export function wikipediaSearchRequest({ query, limit = 6, lang = 'en' }) {
  const l = LANG.test(lang) ? lang : 'en';
  return {
    url: apiUrl(l, { action: 'query', list: 'search', srsearch: query, srlimit: String(Math.max(1, Math.min(8, limit))), srnamespace: '0', srprop: 'snippet' }),
    method: 'GET',
    headers: { Accept: 'application/json', 'User-Agent': WIKIPEDIA_UA, 'Api-User-Agent': WIKIPEDIA_UA },
  };
}

export const parseWikipediaSearch = (json, lang = 'en') =>
  (Array.isArray(json?.query?.search) ? json.query.search : []).filter((r) => typeof r?.title === 'string' && r.title).map((r) => ({ title: r.title, url: articleUrl(r.title, lang), snippet: stripTags(r.snippet) }));

/** `https://en.wikipedia.org/wiki/Eiffel_Tower` (or `/w/index.php?title=...`) → { lang, title }, or null for anything that is not a Wikipedia article address. */
export function wikipediaTarget(raw) {
  let u;
  try {
    u = new URL(String(raw ?? ''));
  } catch {
    return null;
  }
  const m = /^([a-z]{2,3}(?:-[a-z]{2,8})?)\.wikipedia\.org$/.exec(u.hostname.toLowerCase());
  if (!m || u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443')) return null;
  let title = null;
  if (u.pathname.startsWith('/wiki/')) {
    try {
      title = decodeURIComponent(u.pathname.slice(6));
    } catch {
      return null;
    }
  } else if (u.pathname === '/w/index.php') title = u.searchParams.get('title');
  title = title?.replace(/_/g, ' ').trim();
  return title && title.length <= 250 && !/[\u0000-\u001f|<>[\]{}#]/.test(title) ? { lang: m[1], title } : null;
}

/** The lead section of an article as plain text. null when there is none, the page does not exist, or the text is too short to be worth showing. */
export async function readWikipediaPage(url, { fetch: doFetch, signal, maxChars = 6000, timeoutMs = 9000 } = {}) {
  const target = wikipediaTarget(url);
  if (!target || typeof doFetch !== 'function') return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  const onAbort = () => ctl.abort();
  signal?.addEventListener('abort', onAbort, { once: true });
  if (signal?.aborted) ctl.abort();
  try {
    const res = await doFetch(apiUrl(target.lang, { action: 'query', prop: 'extracts', exintro: '1', explaintext: '1', redirects: '1', titles: target.title }), { method: 'GET', headers: { Accept: 'application/json', 'User-Agent': WIKIPEDIA_UA, 'Api-User-Agent': WIKIPEDIA_UA }, signal: ctl.signal });
    if (!res.ok) return null;
    const json = await res.json();
    const pages = json?.query?.pages;
    const list = Array.isArray(pages) ? pages : pages && typeof pages === 'object' ? Object.values(pages) : []; // (the two answer shapes the API has had)
    const page = list.find((p) => typeof p?.extract === 'string' && !p.missing);
    const text = String(page?.extract ?? '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
    if (text.length < 80) return null;
    return { url: articleUrl(page.title ?? target.title, target.lang), title: String(page.title ?? target.title), text: clipText(text, maxChars) };
  } catch {
    if (signal?.aborted) throw new WebError('aborted', 'Stopped.');
    return null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
