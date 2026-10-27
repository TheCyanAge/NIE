import { WebError } from './errors.js';

/**
 * Search services NIE can talk to. Every one is "a request out, a list of { title, url, snippet } back"; nothing else about a service leaks into the rest of NIE.
 * Request shapes are the services' documented ones (Tavily: POST /search; Brave: GET /res/v1/web/search with X-Subscription-Token; Serper: POST /search with X-API-KEY;
 * SearXNG: GET /search?format=json). `custom` describes any other JSON search API, so one setting works with whichever service the writer has a key for.
 */

export const SEARCH_LIMIT_MAX = 10;
const HEADER_NAME = /^[A-Za-z0-9-]{1,40}$/;
const SAFE_VALUE = /^[^\r\n\0]{0,200}$/;

const dotted = (obj, path) => {
  let cur = obj;
  for (const part of String(path ?? '').split('.').filter(Boolean)) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[part];
  }
  return cur;
};
const text = (v) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');

/** An address the writer typed for their own service: http is allowed only for a machine on their own network (a SearXNG on localhost), https anywhere. */
export function serviceUrl(raw) {
  let u;
  try {
    u = new URL(String(raw ?? '').trim());
  } catch {
    return null;
  }
  if (u.username || u.password) return null;
  if (u.protocol === 'https:') return u;
  if (u.protocol === 'http:' && /^(?:localhost|127\.\d+\.\d+\.\d+|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|[^.]+\.local)$/i.test(u.hostname)) return u;
  return null;
}

const jsonHeaders = (extra) => ({ Accept: 'application/json', 'Content-Type': 'application/json', ...extra });

export const PROVIDERS = {
  tavily: {
    id: 'tavily',
    label: 'Tavily',
    needsKey: true,
    // (The key is sent as a bearer token and in the body: the documentation shows both and accepts either.)
    build: ({ query, key, limit }) => ({
      url: 'https://api.tavily.com/search',
      method: 'POST',
      headers: jsonHeaders({ Authorization: `Bearer ${key}` }),
      body: JSON.stringify({ api_key: key, query, max_results: limit, search_depth: 'basic', include_answer: false }),
    }),
    parse: (json) => (Array.isArray(json?.results) ? json.results : []).map((r) => ({ title: text(r?.title), url: text(r?.url), snippet: text(r?.content) })),
  },
  brave: {
    id: 'brave',
    label: 'Brave Search',
    needsKey: true,
    build: ({ query, key, limit }) => ({
      url: `https://api.search.brave.com/res/v1/web/search?${new URLSearchParams({ q: query, count: String(Math.min(limit, 20)), text_decorations: 'false' })}`,
      method: 'GET',
      headers: { Accept: 'application/json', 'X-Subscription-Token': key },
    }),
    parse: (json) => (Array.isArray(json?.web?.results) ? json.web.results : []).map((r) => ({ title: text(r?.title), url: text(r?.url), snippet: text(r?.description) })),
  },
  serper: {
    id: 'serper',
    label: 'Serper',
    needsKey: true,
    build: ({ query, key, limit }) => ({
      url: 'https://google.serper.dev/search',
      method: 'POST',
      headers: jsonHeaders({ 'X-API-KEY': key }),
      body: JSON.stringify({ q: query, num: limit }),
    }),
    parse: (json) => (Array.isArray(json?.organic) ? json.organic : []).map((r) => ({ title: text(r?.title), url: text(r?.link), snippet: text(r?.snippet) })),
  },
  searxng: {
    id: 'searxng',
    label: 'SearXNG',
    needsKey: false,
    build: ({ query, baseUrl, key }) => {
      const base = serviceUrl(baseUrl);
      if (!base) throw new WebError('not-configured', 'The SearXNG address must start with https:// (or http:// for a machine on your own network).');
      const url = new URL('search', base.href.endsWith('/') ? base.href : `${base.href}/`);
      url.search = new URLSearchParams({ q: query, format: 'json' }).toString();
      return { url: url.href, method: 'GET', headers: { Accept: 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) } };
    },
    parse: (json) => (Array.isArray(json?.results) ? json.results : []).map((r) => ({ title: text(r?.title), url: text(r?.url), snippet: text(r?.content) })),
  },
  // The built-in search: a small gateway the NIE developers run holds the real key, so no key ships in the installer. It takes the question words and a random install code
  // (to limit abuse; not a name, not an account) and answers in the same shape as every other service.
  nie: {
    id: 'nie',
    label: 'NIE search',
    needsKey: false,
    build: ({ query, limit, gatewayUrl, installId }) => {
      const base = serviceUrl(gatewayUrl);
      if (!base) throw new WebError('not-configured', 'This copy of NIE has no built-in search.');
      if (!/^[A-Za-z0-9-]{8,64}$/.test(String(installId ?? ''))) throw new WebError('not-configured', 'The built-in search has no install code yet.');
      const url = new URL('search', base.href.endsWith('/') ? base.href : `${base.href}/`);
      url.search = new URLSearchParams({ q: query, n: String(Math.min(limit, 8)) }).toString();
      return { url: url.href, method: 'GET', headers: { Accept: 'application/json', 'X-NIE-Install': installId } };
    },
    parse: (json) => (Array.isArray(json?.results) ? json.results : []).map((r) => ({ title: text(r?.title), url: text(r?.url), snippet: text(r?.snippet) })),
  },
  custom: {
    id: 'custom',
    label: 'Custom search service',
    needsKey: false,
    build: ({ query, key, limit, custom }) => {
      const c = custom ?? {};
      const template = String(c.url ?? '');
      if (!template.includes('{query}')) throw new WebError('not-configured', 'The custom address needs {query} where the search words go, for example https://example.com/search?q={query}.');
      const filled = template.replace(/\{query\}/g, encodeURIComponent(query)).replace(/\{key\}/g, encodeURIComponent(key ?? '')).replace(/\{limit\}/g, String(limit));
      const target = serviceUrl(filled);
      if (!target) throw new WebError('not-configured', 'The custom address must start with https:// (or http:// for a machine on your own network).');
      const method = String(c.method).toUpperCase() === 'POST' ? 'POST' : 'GET';
      const headers = { Accept: 'application/json' };
      if (c.headerName) {
        if (!HEADER_NAME.test(c.headerName) || !SAFE_VALUE.test(`${c.headerPrefix ?? ''}${key ?? ''}`)) throw new WebError('not-configured', 'The custom header name or key has characters a header cannot hold.');
        if (key) headers[c.headerName] = `${c.headerPrefix ?? ''}${key}`;
      }
      let body;
      if (method === 'POST') {
        headers['Content-Type'] = 'application/json';
        const json = (v) => JSON.stringify(String(v)).slice(1, -1);
        body = String(c.bodyTemplate || '{"q":"{query}"}').replace(/\{query\}/g, json(query)).replace(/\{key\}/g, json(key ?? '')).replace(/\{limit\}/g, String(limit));
      }
      return { url: target.href, method, headers, body };
    },
    parse: (json, { custom } = {}) => {
      const c = custom ?? {};
      const list = dotted(json, c.resultsPath || 'results');
      return (Array.isArray(list) ? list : []).map((r) => ({ title: text(dotted(r, c.titleKey || 'title')), url: text(dotted(r, c.urlKey || 'url')), snippet: text(dotted(r, c.snippetKey || 'snippet')) }));
    },
  },
};

/** What a pasted key (or address) is, so one box serves every service. null when it can not be told. */
export function detectProvider({ key = '', baseUrl = '' } = {}) {
  const k = String(key ?? '').trim();
  const b = String(baseUrl ?? '').trim();
  if (/^tvly-/i.test(k)) return 'tavily';
  if (/^BSA/.test(k)) return 'brave';
  if (/^[0-9a-f]{40}$/i.test(k)) return 'serper';
  if (/^https?:\/\//i.test(k)) return 'searxng';
  if (b && /^https?:\/\//i.test(b) && !k) return 'searxng';
  return null;
}

/**
 * The provider a config stands for, and whether it has what it needs. The writer's own key or address always wins; with none, the built-in search is used when this build has one
 * (`gatewayUrl`). A service the writer chose by name that is missing its key is reported as such and is never swapped for the built-in one.
 */
export function resolveProvider(cfg = {}) {
  const asked = String(cfg.provider ?? 'auto');
  const gateway = Boolean(serviceUrl(cfg.gatewayUrl));
  let id = asked === 'auto' || !PROVIDERS[asked] ? detectProvider({ key: cfg.key, baseUrl: cfg.baseUrl }) : asked;
  if (!id && (asked === 'auto' || asked === 'nie') && gateway && !String(cfg.key ?? '').trim()) id = 'nie';
  const spec = id ? PROVIDERS[id] : null;
  if (!spec) return { id: null, spec: null, ready: false, reason: 'NIE can not tell which search service this key is for. Choose the service in Settings.' };
  if (id === 'nie') return gateway ? { id, spec, ready: true, reason: '' } : { id, spec, ready: false, reason: 'This copy of NIE has no built-in search.' };
  const key = String(cfg.key ?? '').trim();
  if (spec.needsKey && !key) return { id, spec, ready: false, reason: `${spec.label} needs a key.` };
  if (id === 'searxng' && !serviceUrl(/^https?:\/\//i.test(key) ? key : cfg.baseUrl)) return { id, spec, ready: false, reason: 'SearXNG needs the address of your instance.' };
  if (id === 'custom' && !String(cfg.custom?.url ?? '').includes('{query}')) return { id, spec, ready: false, reason: 'The custom service needs an address with {query} in it.' };
  return { id, spec, ready: true, reason: '' };
}
