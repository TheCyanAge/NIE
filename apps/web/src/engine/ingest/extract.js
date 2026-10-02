import { isZip, readZip } from './zip.js';
import { htmlToText, markdownToText, docxXmlToText, odtXmlToText, rtfToText, normalizeText, decodeEntities, decodeWin1252 } from './formats.js';
import { extractPdfBasic } from './pdf.js';
import { words } from '../util/text.js';

/**
 * File → format detection → extractor → normalized narrative text → NIE.
 * Every format ends up as ordinary Story Text, so scanning, brainstorming and reading all work the same way.
 */

export class IngestError extends Error {
  constructor(message, code = 'error') {
    super(message);
    this.name = 'IngestError';
    this.code = code;
  }
}

const TEXT_EXT = new Set(['txt', 'text', 'log', 'csv', 'tsv', 'json', 'yaml', 'yml', 'fountain', 'org', 'tex', 'srt', 'vtt', 'ini', 'rst', 'adoc', 'asc', 'nfo']);
const MD_EXT = new Set(['md', 'markdown', 'mdown', 'mkd']);
const HTML_EXT = new Set(['html', 'htm', 'xhtml', 'xml', 'mhtml']);
const UNSUPPORTED = {
  doc: 'Old binary Word files (.doc) are not supported. Save the file as .docx or .txt and try again.',
  pages: 'Apple Pages files are not supported. Export as Word (.docx) or text and try again.',
  wpd: 'WordPerfect files are not supported. Save as .docx or .txt and try again.',
  wps: 'Microsoft Works files are not supported. Save as .docx or .txt and try again.',
  mobi: 'Kindle (.mobi) files are not supported. Convert to EPUB or text and try again.',
  azw3: 'Kindle (.azw3) files are not supported. Convert to EPUB or text and try again.',
  png: 'This is an image. NIE reads text and has no built-in OCR.',
  jpg: 'This is an image. NIE reads text and has no built-in OCR.',
  jpeg: 'This is an image. NIE reads text and has no built-in OCR.',
  gif: 'This is an image. NIE reads text and has no built-in OCR.',
  zip: 'This is a ZIP archive, not a document. Extract it and open the file inside.',
};

export const SUPPORTED_FORMATS = [
  { id: 'txt', label: 'Plain text', ext: ['txt', 'text', 'log', 'csv', 'tsv', 'json', 'fountain', 'srt', 'vtt', 'rst'] },
  { id: 'markdown', label: 'Markdown', ext: ['md', 'markdown'] },
  { id: 'html', label: 'HTML / XML', ext: ['html', 'htm', 'xhtml', 'xml'] },
  { id: 'rtf', label: 'Rich Text (RTF)', ext: ['rtf'] },
  { id: 'docx', label: 'Word (DOCX)', ext: ['docx'] },
  { id: 'odt', label: 'OpenDocument (ODT)', ext: ['odt'] },
  { id: 'epub', label: 'EPUB e-book', ext: ['epub'] },
  { id: 'pdf', label: 'PDF', ext: ['pdf'] },
];

/** Value for <input type="file" accept="…">. Anything text-like is still attempted even with another extension. */
export const ACCEPT = SUPPORTED_FORMATS.flatMap((f) => f.ext.map((e) => `.${e}`)).join(',');

const extOf = (name) => (String(name).match(/\.([A-Za-z0-9]+)$/)?.[1] ?? '').toLowerCase();
const startsWith = (bytes, str) => [...str].every((c, i) => bytes[i] === c.charCodeAt(0));

export function decodeBytes(bytes) {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return new TextDecoder('utf-8').decode(bytes.subarray(3));
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes.subarray(2));
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes.subarray(2));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return decodeWin1252(bytes);
  }
}

function looksLikeText(bytes) {
  const sample = bytes.subarray(0, 8192);
  if (!sample.length) return true;
  if ((sample[0] === 0xff && sample[1] === 0xfe) || (sample[0] === 0xfe && sample[1] === 0xff)) return true;
  let bad = 0;
  for (const b of sample) if (b === 0 || (b < 9) || (b > 13 && b < 32 && b !== 27)) bad++;
  return bad / sample.length < 0.01;
}

/** Decide what a file is from its name and its first bytes. Magic bytes win over extensions. */
export async function detectFormat(name, bytes) {
  const ext = extOf(name);
  if (startsWith(bytes, '%PDF-')) return { id: 'pdf', label: 'PDF' };
  if (startsWith(bytes, '{\\rtf')) return { id: 'rtf', label: 'Rich Text (RTF)' };
  if (isZip(bytes)) {
    const zip = await readZip(bytes).catch(() => null);
    if (zip) {
      if (zip.has('word/document.xml')) return { id: 'docx', label: 'Word (DOCX)', zip };
      const mime = (await zip.text('mimetype').catch(() => ''))?.trim();
      if (mime === 'application/epub+zip' || zip.has('META-INF/container.xml')) return { id: 'epub', label: 'EPUB e-book', zip };
      if (mime === 'application/vnd.oasis.opendocument.text' || zip.has('content.xml')) return { id: 'odt', label: 'OpenDocument (ODT)', zip };
    }
    return { id: 'zip', label: 'ZIP archive' };
  }
  if (UNSUPPORTED[ext]) return { id: 'unsupported', label: ext.toUpperCase(), reason: UNSUPPORTED[ext] };
  if (MD_EXT.has(ext)) return { id: 'markdown', label: 'Markdown' };
  if (HTML_EXT.has(ext)) return { id: 'html', label: 'HTML / XML' };
  if (ext === 'rtf') return { id: 'rtf', label: 'Rich Text (RTF)' };
  if (TEXT_EXT.has(ext)) return { id: 'txt', label: 'Plain text' };
  const head = decodeBytes(bytes.subarray(0, 2048)).trimStart().toLowerCase();
  if (head.startsWith('<!doctype html') || head.startsWith('<html')) return { id: 'html', label: 'HTML' };
  if (looksLikeText(bytes)) return { id: 'txt', label: ext ? `Text (.${ext})` : 'Plain text' };
  return { id: 'unsupported', label: ext ? ext.toUpperCase() : 'Unknown', reason: `NIE can't read ${ext ? `.${ext}` : 'this kind of'} files yet. It reads text, Markdown, HTML, RTF, Word (.docx), OpenDocument (.odt), EPUB and PDF.` };
}

function resolvePath(base, href) {
  const parts = (base ? base + '/' : '') + decodeURIComponent(href.split('#')[0]);
  const out = [];
  for (const p of parts.split('/')) {
    if (p === '..') out.pop();
    else if (p && p !== '.') out.push(p);
  }
  return out.join('/');
}

function attrs(tag) {
  const o = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"|([\w:-]+)\s*=\s*'([^']*)'/g)) o[m[1] ?? m[3]] = m[2] ?? m[4];
  return o;
}

async function extractEpub(zip) {
  const container = await zip.text('META-INF/container.xml');
  const opfPath = container?.match(/full-path\s*=\s*["']([^"']+)["']/)?.[1];
  const warnings = [];
  const parts = [];
  let title = null;
  if (opfPath && zip.has(opfPath)) {
    const opf = await zip.text(opfPath);
    const dir = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/')) : '';
    title = decodeEntities(opf.match(/<dc:title[^>]*>([\s\S]*?)<\/dc:title>/i)?.[1]?.trim() ?? '') || null;
    const manifest = new Map();
    for (const m of opf.matchAll(/<item\b[^>]*>/gi)) {
      const a = attrs(m[0]);
      if (a.id && a.href) manifest.set(a.id, a);
    }
    for (const m of opf.matchAll(/<itemref\b[^>]*>/gi)) {
      const a = attrs(m[0]);
      const item = manifest.get(a.idref);
      if (!item || !/x?html|xml/.test(item['media-type'] ?? 'html')) continue;
      const path = resolvePath(dir, item.href);
      const html = await zip.text(path);
      if (html) parts.push(htmlToText(html));
    }
  }
  if (!parts.length) {
    warnings.push('Could not read the e-book reading order; used file order instead.');
    for (const n of zip.names().filter((x) => /\.x?html?$/i.test(x)).sort()) parts.push(htmlToText(await zip.text(n)));
  }
  return { text: parts.map((p) => p.trim()).filter(Boolean).join('\n\n\n\n'), title, warnings };
}

/**
 * @param {{ name: string, bytes: Uint8Array|ArrayBuffer }} file
 * @param {{ pdf?: (bytes: Uint8Array) => Promise<string|{text:string,warnings?:string[]}>, maxBytes?: number }} [opts]
 * @returns {Promise<{ text: string, format: string, label: string, title: string|null, warnings: string[], stats: {chars:number, words:number} }>}
 */
export async function extractText(file, { pdf, maxBytes = 50 * 1024 * 1024 } = {}) {
  const bytes = file.bytes instanceof Uint8Array ? file.bytes : new Uint8Array(file.bytes);
  if (!bytes.length) throw new IngestError('This file is empty.', 'empty');
  if (bytes.length > maxBytes) throw new IngestError(`This file is ${(bytes.length / 1048576).toFixed(0)} MB, which is larger than the ${(maxBytes / 1048576).toFixed(0)} MB limit.`, 'too-large');

  const fmt = await detectFormat(file.name, bytes);
  const warnings = [];
  let text = '';
  let title = null;

  try {
    switch (fmt.id) {
      case 'unsupported':
        throw new IngestError(fmt.reason, 'unsupported');
      case 'zip':
        throw new IngestError(UNSUPPORTED.zip, 'unsupported');
      case 'txt':
        text = decodeBytes(bytes);
        break;
      case 'markdown':
        text = markdownToText(decodeBytes(bytes));
        break;
      case 'html':
        text = htmlToText(decodeBytes(bytes));
        title = decodeEntities(decodeBytes(bytes).match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '') || null;
        break;
      case 'rtf':
        text = rtfToText(decodeBytes(bytes));
        break;
      case 'docx': {
        const xml = await fmt.zip.text('word/document.xml');
        text = docxXmlToText(xml);
        title = decodeEntities((await fmt.zip.text('docProps/core.xml'))?.match(/<dc:title>([\s\S]*?)<\/dc:title>/)?.[1]?.trim() ?? '') || null;
        break;
      }
      case 'odt':
        text = odtXmlToText(await fmt.zip.text('content.xml'));
        break;
      case 'epub': {
        const r = await extractEpub(fmt.zip);
        text = r.text;
        title = r.title;
        warnings.push(...r.warnings);
        break;
      }
      case 'pdf': {
        const r = pdf ? await pdf(bytes) : await extractPdfBasic(bytes);
        if (typeof r === 'string') text = r;
        else {
          text = r.text;
          warnings.push(...(r.warnings ?? []));
        }
        break;
      }
      default:
        throw new IngestError(`NIE can't read this kind of file yet.`, 'unsupported');
    }
  } catch (err) {
    if (err instanceof IngestError) throw err;
    throw new IngestError(/password/i.test(err?.message) ? 'This file is password-protected.' : `Could not read this ${fmt.label} file: ${err?.message ?? err}`, /password/i.test(err?.message) ? 'protected' : 'damaged');
  }

  text = normalizeText(text);
  if (!text) {
    throw new IngestError(warnings[0] ?? `No text was found in this ${fmt.label} file.`, 'empty');
  }
  return { text, format: fmt.id, label: fmt.label, title, warnings, stats: { chars: text.length, words: words(text).length } };
}
