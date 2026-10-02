/**
 * Small, dependency-free converters from markup to plain narrative text.
 * Each takes a string and returns plain text with paragraphs separated by blank lines.
 */

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', copy: '©', eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç', uuml: 'ü', ouml: 'ö', auml: 'ä', szlig: 'ß', ntilde: 'ñ' };

export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try {
        return String.fromCodePoint(code);
      } catch {
        return '';
      }
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}

export function htmlToText(html) {
  let s = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|head|noscript|svg)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|article|blockquote|h[1-6]|tr|pre)>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n\n***\n\n')
    .replace(/<[^>]+>/g, '');
  s = decodeEntities(s);
  return s;
}

export function markdownToText(md) {
  return md
    .replace(/^```[\s\S]*?^```/gm, (m) => m.replace(/^```.*$/gm, ''))
    .replace(/^ {0,3}#{1,6}[ \t]+(.*?)[ \t]*#*[ \t]*$/gm, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(^|[^\w*])\*(?![ \t])([^*\n]+?)\*(?!\w)/g, '$1$2')
    .replace(/(^|[^\w_])_(?![ \t])([^_\n]+?)_(?!\w)/g, '$1$2')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/^ {0,3}>[ \t]?/gm, '')
    .replace(/^[ \t]*[-*+][ \t]+/gm, '')
    .replace(/^ {0,3}(?:-{3,}|\*{3,}|_{3,})[ \t]*$/gm, '***');
}

/** Word's document.xml: paragraphs (<w:p>) with runs of <w:t>, tabs and breaks. */
export function docxXmlToText(xml) {
  const paras = [];
  for (const p of xml.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)) {
    let line = '';
    for (const t of p[0].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\s*\/>|<w:br\s*\/>|<w:cr\s*\/>/g)) {
      if (t[1] !== undefined) line += t[1];
      else if (t[0].startsWith('<w:tab')) line += '\t';
      else line += '\n';
    }
    paras.push(decodeEntities(line));
  }
  return paras.join('\n\n');
}

/** OpenDocument content.xml. */
export function odtXmlToText(xml) {
  const body = xml.match(/<office:text[\s\S]*<\/office:text>/)?.[0] ?? xml;
  const withBreaks = body
    .replace(/<text:tab\s*\/>/g, '\t')
    .replace(/<text:line-break\s*\/>/g, '\n')
    .replace(/<text:s(?:\s+text:c="(\d+)")?\s*\/>/g, (_, n) => ' '.repeat(Number(n ?? 1)))
    .replace(/<\/text:(?:p|h)>/g, '\n\n')
    .replace(/<[^>]+>/g, '');
  return decodeEntities(withBreaks);
}

const WIN1252 = [0x20ac, 0x81, 0x201a, 0x192, 0x201e, 0x2026, 0x2020, 0x2021, 0x2c6, 0x2030, 0x160, 0x2039, 0x152, 0x8d, 0x17d, 0x8f, 0x90, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x2dc, 0x2122, 0x161, 0x203a, 0x153, 0x9d, 0x17e, 0x178];
export const cp1252 = (n) => (n >= 0x80 && n <= 0x9f ? String.fromCharCode(WIN1252[n - 0x80]) : String.fromCharCode(n));

const RTF_SKIP = new Set(['fonttbl', 'colortbl', 'stylesheet', 'info', 'pict', 'header', 'footer', 'footnote', 'listtable', 'listoverridetable', 'revtbl', 'generator', 'themedata', 'datastore', 'latentstyles', 'rsidtbl', 'xmlnstbl', 'fldinst', 'bkmkstart', 'bkmkend', 'object', 'private', 'mmathPr']);

/** RTF → text: skips non-body destinations, honours \par, \tab, \'hh and \uN. */
export function rtfToText(rtf) {
  let out = '';
  const stack = []; // {skip, uc}
  let skip = false;
  let uc = 1;
  let i = 0;
  const n = rtf.length;
  while (i < n) {
    const c = rtf[i];
    if (c === '{') {
      stack.push({ skip, uc });
      i++;
      if (rtf[i] === '\\' && rtf[i + 1] === '*') {
        skip = true; // ignorable destination
      }
    } else if (c === '}') {
      const top = stack.pop();
      if (top) ({ skip, uc } = top);
      i++;
    } else if (c === '\\') {
      i++;
      const d = rtf[i];
      if (d === '\\' || d === '{' || d === '}') {
        if (!skip) out += d;
        i++;
      } else if (d === "'") {
        const hex = rtf.slice(i + 1, i + 3);
        if (!skip) out += cp1252(parseInt(hex, 16));
        i += 3;
      } else if (d === '~') {
        if (!skip) out += ' ';
        i++;
      } else if (d === '-' || d === '_') {
        if (!skip && d === '_') out += '-';
        i++;
      } else if (d === '\n' || d === '\r') {
        if (!skip) out += '\n';
        i++;
      } else {
        const m = /^([a-zA-Z]+)(-?\d+)? ?/.exec(rtf.slice(i, i + 40));
        if (!m) {
          i++;
          continue;
        }
        const word = m[1];
        const param = m[2] !== undefined ? parseInt(m[2], 10) : null;
        i += m[0].length;
        if (RTF_SKIP.has(word)) skip = true;
        else if (!skip) {
          if (word === 'par' || word === 'line' || word === 'sect' || word === 'page') out += word === 'line' ? '\n' : '\n\n';
          else if (word === 'tab') out += '\t';
          else if (word === 'emdash') out += '—';
          else if (word === 'endash') out += '–';
          else if (word === 'lquote') out += '‘';
          else if (word === 'rquote') out += '’';
          else if (word === 'ldblquote') out += '“';
          else if (word === 'rdblquote') out += '”';
          else if (word === 'bullet') out += '•';
          else if (word === 'uc' && param !== null) uc = param;
          else if (word === 'u' && param !== null) {
            out += String.fromCharCode(param < 0 ? param + 65536 : param);
            // Skip the fallback characters that follow \uN.
            let skipChars = uc;
            while (skipChars-- > 0 && i < n) {
              if (rtf[i] === '\\' && rtf[i + 1] === "'") i += 4;
              else if (rtf[i] !== '\\' && rtf[i] !== '{' && rtf[i] !== '}') i++;
              else break;
            }
          }
        }
      }
    } else {
      if (!skip && c !== '\n' && c !== '\r') out += c;
      i++;
    }
  }
  return out;
}

/** Collapse a text to tidy narrative form, preserving paragraph and scene breaks. */
export function normalizeText(s) {
  return s
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000​‌‍﻿]/g, '')
    .replace(/ /g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{5,}/g, '\n\n\n\n')
    .trim();
}

/** Windows-1252 → string. (Node's TextDecoder treats this label as Latin-1, so we do not rely on it.) */
export function decodeWin1252(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += cp1252(bytes[i]);
  return out;
}
