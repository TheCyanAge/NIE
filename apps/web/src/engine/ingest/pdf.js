/**
 * Basic, dependency-free PDF text extraction.
 *
 * It handles the common case (text stored in Flate-compressed content streams using simple font encodings).
 * It cannot read scanned pages (no OCR) or fonts that rely on custom glyph maps; callers should surface the
 * warnings it returns. For better coverage the desktop app can inject a pdf.js-based extractor instead.
 */

const latin1 = new TextDecoder('latin1');

async function inflate(bytes) {
  const ds = new DecompressionStream('deflate');
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function unescapePdfString(s) {
  return s.replace(/\\([nrtbf()\\]|[0-7]{1,3}|\r?\n)/g, (_, e) => {
    if (e === 'n') return '\n';
    if (e === 'r') return '\r';
    if (e === 't') return '\t';
    if (e === 'b' || e === 'f') return '';
    if (e === '(' || e === ')' || e === '\\') return e;
    if (/^\r?\n$/.test(e)) return '';
    return String.fromCharCode(parseInt(e, 8));
  });
}

function hexString(h, notes) {
  const clean = h.replace(/\s+/g, '');
  if (clean.length % 4 === 0 && clean.length >= 4) {
    notes.hex++;
    let s = '';
    for (let i = 0; i < clean.length; i += 4) s += String.fromCharCode(parseInt(clean.slice(i, i + 4), 16));
    return s;
  }
  let s = '';
  for (let i = 0; i + 1 < clean.length + 1; i += 2) s += String.fromCharCode(parseInt(clean.slice(i, i + 2).padEnd(2, '0'), 16));
  return s;
}

function contentToLines(content, notes) {
  const lines = [];
  let cur = '';
  const flush = () => {
    if (cur.trim()) lines.push(cur.trim());
    cur = '';
  };
  const tokens = content.matchAll(/\((?:\\[\s\S]|[^\\)])*\)|<[0-9A-Fa-f\s]*>|\[|\]|-?\d*\.?\d+|[A-Za-z'"*]+/g);
  let stack = [];
  let inArray = false;
  let arr = '';
  for (const [tok] of tokens) {
    if (tok === '[') {
      inArray = true;
      arr = '';
    } else if (tok === ']') {
      inArray = false;
      stack.push({ type: 'text', v: arr });
    } else if (tok[0] === '(') {
      const v = unescapePdfString(tok.slice(1, -1));
      if (inArray) arr += v;
      else stack.push({ type: 'text', v });
    } else if (tok[0] === '<') {
      const v = hexString(tok.slice(1, -1), notes);
      if (inArray) arr += v;
      else stack.push({ type: 'text', v });
    } else if (/^-?\d*\.?\d+$/.test(tok)) {
      if (inArray) {
        if (Number(tok) < -250) arr += ' ';
      } else stack.push({ type: 'num', v: Number(tok) });
    } else {
      switch (tok) {
        case 'Tj':
        case 'TJ': {
          const t = stack.pop();
          if (t?.type === 'text') cur += t.v;
          break;
        }
        case "'":
        case '"': {
          flush();
          const t = stack.pop();
          if (t?.type === 'text') cur += t.v;
          break;
        }
        case 'T*':
        case 'ET':
          flush();
          break;
        case 'Td':
        case 'TD': {
          const ty = stack.pop();
          stack.pop();
          if (ty?.type === 'num' && Math.abs(ty.v) > 0.5) flush();
          else cur += ' ';
          break;
        }
        case 'Tm':
          flush();
          break;
        default:
          break;
      }
      stack = [];
    }
  }
  flush();
  return lines;
}

/** Re-flow hard-wrapped lines into paragraphs: a short line that ends a sentence ends the paragraph. */
function reflow(lines) {
  if (!lines.length) return '';
  const sorted = lines.map((l) => l.length).sort((a, b) => a - b);
  const longest = sorted[Math.floor(sorted.length * 0.9)] || 1;
  const paras = [];
  let cur = '';
  for (const line of lines) {
    cur = cur ? (/-$/.test(cur) ? cur.slice(0, -1) + line : cur + ' ' + line) : line;
    if (line.length < longest * 0.6 && /[.!?:"”’)]$/.test(line)) {
      paras.push(cur);
      cur = '';
    }
  }
  if (cur) paras.push(cur);
  return paras.join('\n\n');
}

export async function extractPdfBasic(bytes) {
  const warnings = [];
  const notes = { hex: 0 };
  const raw = latin1.decode(bytes);
  const lines = [];
  let pos = 0;
  let streams = 0;
  let unreadable = 0;
  for (;;) {
    const s = raw.indexOf('stream', pos);
    if (s < 0) break;
    const e = raw.indexOf('endstream', s + 6);
    if (e < 0) break;
    const objStart = raw.lastIndexOf('obj', s);
    const dict = raw.slice(Math.max(0, objStart), s);
    pos = e + 9;
    if (/\/Subtype\s*\/(?:Image|Type1C|CIDFontType0C|OpenType)|\/Length1|\/FontFile|\/XRef|\/ObjStm/.test(dict)) continue;
    let dataStart = s + 6;
    if (raw[dataStart] === '\r') dataStart++;
    if (raw[dataStart] === '\n') dataStart++;
    // Prefer the declared /Length: zlib streams reject trailing bytes such as the newline before "endstream".
    const declared = Number(dict.match(/\/Length\s+(\d+)(?!\s+\d+\s+R)/)?.[1]);
    let dataEnd = Number.isFinite(declared) && declared > 0 && dataStart + declared <= e ? dataStart + declared : e;
    if (dataEnd === e) while (dataEnd > dataStart && (raw[dataEnd - 1] === '\n' || raw[dataEnd - 1] === '\r')) dataEnd--;
    let chunk = bytes.subarray(dataStart, dataEnd);
    try {
      if (/\/FlateDecode/.test(dict)) chunk = await inflate(chunk);
      else if (/\/Filter/.test(dict)) {
        unreadable++;
        continue;
      }
    } catch {
      unreadable++;
      continue;
    }
    const content = latin1.decode(chunk);
    if (!/\bBT\b/.test(content)) continue;
    streams++;
    lines.push(...contentToLines(content, notes));
  }
  const text = reflow(lines);
  if (text.replace(/\s/g, '').length < 20) {
    warnings.push(streams || unreadable ? 'No readable text found. This PDF may be scanned (images of pages) or use fonts NIE cannot decode. Try exporting it as Word or text.' : 'This does not look like a text PDF.');
  } else if (notes.hex > 20) {
    warnings.push('This PDF uses custom font encodings, so some characters may be wrong or missing. Check the text before relying on it.');
  } else if (unreadable) {
    warnings.push('Some parts of this PDF could not be read.');
  }
  return { text, warnings };
}
