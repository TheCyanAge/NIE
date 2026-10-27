/**
 * What a reply keeps of a web search (`message.web`): the service, the words that were sent, the numbered sources and one plain sentence. It is saved with the
 * project, so what comes back from storage is checked here before anything is shown: short strings, at most 8 sources, only https links, one of five states.
 */

export const WEB_STATES = ['answered', 'results-only', 'not-configured', 'failed', 'none-found'];
const ANSWERED_BY = ['offline model', 'online model', 'none'];
export const MAX_WEB_SOURCES = 8;

const short = (v, n) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, n) : '');

/** An https address as a string, or ''. */
export function httpsUrl(v) {
  if (typeof v !== 'string' || v.length > 2000) return '';
  try {
    const u = new URL(v.trim());
    return u.protocol === 'https:' && !u.username && !u.password ? u.href : '';
  } catch {
    return '';
  }
}

/** The valid record, or null when there is nothing trustworthy to show. */
export function sanitizeWebRecord(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !WEB_STATES.includes(raw.state)) return null;
  const sources = (Array.isArray(raw.sources) ? raw.sources : []).slice(0, MAX_WEB_SOURCES).flatMap((s, i) => {
    if (!s || typeof s !== 'object') return [];
    const url = httpsUrl(s.url); // a source that is not https keeps its place in the numbering but is shown without a link
    const host = short(s.host, 120) || (url ? new URL(url).hostname : '');
    const title = short(s.title, 200) || host;
    if (!title) return [];
    return [{ n: Number.isInteger(s.n) && s.n >= 1 && s.n <= 99 ? s.n : i + 1, title, url, host, read: s.read === true }];
  });
  return {
    provider: short(raw.provider, 40),
    query: short(raw.query, 300),
    sources,
    answeredBy: ANSWERED_BY.includes(raw.answeredBy) ? raw.answeredBy : 'none',
    state: raw.state,
    note: short(raw.note, 400),
  };
}
