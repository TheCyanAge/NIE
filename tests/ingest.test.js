import test from 'node:test';
import assert from 'node:assert/strict';
import { extractText, detectFormat, IngestError, decodeBytes, ACCEPT, SUPPORTED_FORMATS } from '../apps/web/src/engine/ingest/extract.js';
import { htmlToText, markdownToText, rtfToText, normalizeText } from '../apps/web/src/engine/ingest/formats.js';
import { readZip } from '../apps/web/src/engine/ingest/zip.js';
import { scan } from '../apps/web/src/engine/analysis/scan.js';
import { makeZip, makePdf, bytes, projectWith, withRules } from './helpers.js';

const ex = (name, data, opts) => extractText({ name, bytes: data }, opts);

test('plain text in UTF-8, UTF-16 and Windows-1252 decodes correctly', async () => {
  assert.equal((await ex('a.txt', bytes('Café “quoted” — dash'))).text, 'Café “quoted” — dash');
  const withBom = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('Bom text')]);
  assert.equal((await ex('a.txt', new Uint8Array(withBom))).text, 'Bom text');
  const utf16 = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('Wide text', 'utf16le')]);
  assert.equal((await ex('a.txt', new Uint8Array(utf16))).text, 'Wide text');
  assert.equal((await ex('a.txt', new Uint8Array(Buffer.from([0x63, 0x61, 0x66, 0xe9, 0x20, 0x93, 0x68, 0x69, 0x94])))).text, 'café “hi”');
});

test('markdown loses its syntax but keeps its paragraphs', async () => {
  const md = '# Chapter One\n\nShe **ran** to the *door* and read [the note](http://x.y).\n\n> a quote\n\n- item\n\n---\n\nAfter.';
  const r = await ex('story.md', bytes(md));
  assert.equal(r.format, 'markdown');
  assert.equal(r.text, 'Chapter One\n\nShe ran to the door and read the note.\n\na quote\n\nitem\n\n***\n\nAfter.');
});

test('HTML: scripts and styles dropped, entities decoded, block breaks kept, title captured', async () => {
  const html = '<html><head><title>My &amp; Story</title><style>p{}</style></head><body><h1>One</h1><p>Hello&nbsp;world &mdash; it&#39;s <b>fine</b>.</p><script>alert(1)</script><p>Two<br>lines</p></body></html>';
  const r = await ex('page.html', bytes(html));
  assert.equal(r.title, 'My & Story');
  assert.equal(r.text, 'One\n\nHello world — it\'s fine.\n\nTwo\nlines');
});

test('RTF: body text only, with paragraphs, accents and unicode', async () => {
  const rtf = '{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Times New Roman;}}{\\colortbl;\\red0\\green0\\blue0;}{\\*\\generator Word;}\\f0\\fs24 First paragraph with caf\\\'e9.\\par Second \\u8212? paragraph with {\\b bold} text.\\par}';
  const r = await ex('a.rtf', bytes(rtf));
  assert.equal(r.format, 'rtf');
  assert.equal(r.text, 'First paragraph with café.\n\nSecond — paragraph with bold text.');
});

test('DOCX: paragraphs become paragraphs; tabs, breaks and tracked deletions handled', async () => {
  const doc = '<?xml version="1.0"?><w:document xmlns:w="x"><w:body>' +
    '<w:p><w:r><w:t>The first</w:t></w:r><w:r><w:t xml:space="preserve"> paragraph &amp; more.</w:t></w:r></w:p>' +
    '<w:p><w:r><w:t>Line one</w:t><w:br/><w:t>Line two</w:t><w:tab/><w:t>tabbed</w:t></w:r></w:p>' +
    '<w:p><w:del><w:r><w:delText>deleted words</w:delText></w:r></w:del><w:r><w:t>Kept.</w:t></w:r></w:p>' +
    '</w:body></w:document>';
  const zip = makeZip({ '[Content_Types].xml': '<Types/>', 'word/document.xml': doc, 'docProps/core.xml': '<cp><dc:title>My Novel</dc:title></cp>' });
  const r = await ex('novel.docx', zip);
  assert.equal(r.format, 'docx');
  assert.equal(r.title, 'My Novel');
  assert.equal(r.text, 'The first paragraph & more.\n\nLine one\nLine two\ttabbed\n\nKept.');
});

test('format is detected from content, not just the extension', async () => {
  const doc = makeZip({ 'word/document.xml': '<w:document><w:p><w:r><w:t>Hidden docx</w:t></w:r></w:p></w:document>' });
  assert.equal((await ex('renamed.dat', doc)).format, 'docx');
  assert.equal((await detectFormat('x.bin', bytes('%PDF-1.4 ...'))).id, 'pdf');
  assert.equal((await ex('mystery', bytes('{\\rtf1 hi\\par}'))).format, 'rtf');
  assert.equal((await ex('noext', bytes('<!DOCTYPE html><html><body><p>Hi there</p></body></html>'))).format, 'html');
  assert.equal((await ex('notes.weird', bytes('Just some words in an odd file.'))).format, 'txt');
});

test('ODT content is read', async () => {
  const content = '<office:document-content><office:body><office:text><text:p>First <text:span>para</text:span>.</text:p><text:h>Heading</text:h><text:p>A<text:s text:c="2"/>B<text:line-break/>C</text:p></office:text></office:body></office:document-content>';
  const zip = makeZip({ mimetype: 'application/vnd.oasis.opendocument.text', 'content.xml': content }, { stored: ['mimetype'] });
  const r = await ex('a.odt', zip);
  assert.equal(r.format, 'odt');
  assert.equal(r.text, 'First para.\n\nHeading\n\nA  B\nC');
});

test('EPUB: chapters follow the spine order, with scene-break spacing between them', async () => {
  const files = {
    mimetype: 'application/epub+zip',
    'META-INF/container.xml': '<container><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
    'OEBPS/content.opf': '<package><metadata><dc:title>The Book</dc:title></metadata><manifest>' +
      '<item id="c2" href="text/ch2.xhtml" media-type="application/xhtml+xml"/>' +
      '<item id="c1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>' +
      '<item id="css" href="s.css" media-type="text/css"/></manifest><spine><itemref idref="c1"/><itemref idref="c2"/></spine></package>',
    'OEBPS/text/ch1.xhtml': '<html><body><h1>One</h1><p>First chapter.</p></body></html>',
    'OEBPS/text/ch2.xhtml': '<html><body><h1>Two</h1><p>Second chapter.</p></body></html>',
  };
  const r = await ex('book.epub', makeZip(files, { stored: ['mimetype'] }));
  assert.equal(r.format, 'epub');
  assert.equal(r.title, 'The Book');
  assert.equal(r.text, 'One\n\nFirst chapter.\n\n\n\nTwo\n\nSecond chapter.');
});

test('PDF: simple text PDFs are read (compressed or not) and reflowed into paragraphs', async () => {
  // Hard-wrapped lines, as a PDF stores them: full-width lines, with a short last line ending each paragraph.
  const lines = [
    'The rain had stopped by the time she reached the station, and the',
    'platform was empty.',
    'Nobody looked up when the stranger walked in out of the cold wet night,',
    'and nobody spoke.',
  ];
  for (const compress of [true, false]) {
    const r = await ex('a.pdf', makePdf(lines, { compress }));
    assert.equal(r.format, 'pdf');
    assert.equal(r.text, 'The rain had stopped by the time she reached the station, and the platform was empty.\n\nNobody looked up when the stranger walked in out of the cold wet night, and nobody spoke.');
  }
});

test('PDF: unreadable PDFs explain themselves instead of returning garbage; a better extractor can be injected', async () => {
  const blank = makePdf([]);
  await assert.rejects(ex('scan.pdf', blank), (e) => e instanceof IngestError && e.code === 'empty' && /scanned|No readable text/i.test(e.message));
  const r = await ex('a.pdf', makePdf(['x']), { pdf: async () => ({ text: 'From pdf.js', warnings: ['careful'] }) });
  assert.equal(r.text, 'From pdf.js');
  assert.deepEqual(r.warnings, ['careful']);
});

test('clear errors for empty, oversized, unsupported and damaged files', async () => {
  await assert.rejects(ex('e.txt', new Uint8Array(0)), (e) => e.code === 'empty');
  await assert.rejects(ex('big.txt', bytes('x'.repeat(100)), { maxBytes: 50 }), (e) => e.code === 'too-large');
  await assert.rejects(ex('old.doc', new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0, 0, 0, 0])), (e) => e.code === 'unsupported' && /\.docx/.test(e.message));
  await assert.rejects(ex('pic.png', new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3])), (e) => e.code === 'unsupported' && /image/.test(e.message));
  await assert.rejects(ex('x.bin', new Uint8Array(Array.from({ length: 400 }, (_, i) => i % 7))), (e) => e.code === 'unsupported');
  await assert.rejects(ex('bad.docx', makeZip({ 'word/document.xml': '<w:document/>' })), (e) => e.code === 'empty');
  await assert.rejects(ex('trunc.docx', makeZip({ 'word/document.xml': '<x/>' }).subarray(0, 40)), IngestError);
  await assert.rejects(ex('archive.zip', makeZip({ 'a.txt': 'hello' })), (e) => e.code === 'unsupported');
});

test('every advertised format is accepted by the file picker', () => {
  for (const f of SUPPORTED_FORMATS) for (const e of f.ext) assert.ok(ACCEPT.includes(`.${e}`), e);
});

test('zip reader handles stored and deflated entries and rejects junk', async () => {
  const z = await readZip(makeZip({ 'a.txt': 'hello', 'dir/b.txt': 'x'.repeat(5000) }, { stored: ['a.txt'] }));
  assert.equal(await z.text('a.txt'), 'hello');
  assert.equal((await z.text('dir/b.txt')).length, 5000);
  assert.equal(await z.text('nope'), null);
  await assert.rejects(readZip(new Uint8Array([1, 2, 3, 4])));
});

test('normalisation tidies whitespace but keeps paragraph and scene breaks', () => {
  assert.equal(normalizeText('a\r\nb  \n\n\n\n\n\n\n\nc d​'), 'a\nb\n\n\n\nc d');
  assert.equal(decodeBytes(new Uint8Array([0xe2, 0x80, 0x9c, 0x68, 0x69, 0xe2, 0x80, 0x9d])), '“hi”');
});

test('imported text flows straight into Full Scan and is checked against the project\'s rules', async () => {
  const docx = makeZip({ 'word/document.xml': '<w:document><w:p><w:r><w:t>He left the room quietly.</w:t></w:r></w:p><w:p><w:r><w:t>Suddenly the lights failed.</w:t></w:r></w:p></w:document>' });
  const { text } = await ex('draft.docx', docx);
  const project = withRules(projectWith(), ['Never use the word "suddenly"', 'No adverbs']);
  const r = scan({ text, project, observations: false });
  // "Suddenly" breaks two rules at once (the word is banned, and it is an adverb); both are reported.
  assert.deepEqual(r.findings.map((f) => text.slice(f.start, f.end)), ['quietly', 'Suddenly', 'Suddenly']);
  assert.deepEqual([...new Set(r.findings.map((f) => f.meta.ruleText))].sort(), ['Never use the word "suddenly"', 'No adverbs']);
});

test('markup helpers are safe on hostile input', () => {
  assert.equal(htmlToText('<p>a</p><script>x</script><!-- c --><p>b</p>').trim(), 'a\n\nb');
  assert.equal(markdownToText('**unclosed and `tick'), '**unclosed and `tick');
  assert.equal(rtfToText('{\\rtf1 {\\fonttbl{\\f0 X;}} plain }'), ' plain ');
});

test('a browser File has a bytes() METHOD in current Chromium; it must not be mistaken for the desktop bridge\'s bytes', async () => {
  const { bytesOf, createIngestClient } = await import('../apps/web/src/engine/ingest/client.js');
  const data = new TextEncoder().encode('Imported words.');
  // What a File looks like in Chromium 133+: bytes is a function, arrayBuffer() gives the data.
  const browserFile = { name: 'a.txt', bytes: () => Promise.resolve(data), arrayBuffer: async () => data.buffer.slice(0) };
  assert.equal(new Uint8Array(await bytesOf(browserFile)).length, data.length);
  // What the desktop bridge returns: real bytes, no arrayBuffer().
  const bridgeFile = { name: 'a.txt', bytes: data };
  assert.equal((await bytesOf(bridgeFile)).length, data.length);
  assert.equal(new Uint8Array(await bytesOf({ name: 'b.txt', bytes: data.buffer })).length, data.length, 'an ArrayBuffer works too');
  // End to end through the client (no Worker in Node, so it parses on the current thread).
  const client = createIngestClient();
  const viaBrowserFile = await client.read({ name: 'a.txt', bytes: () => Promise.resolve(data), arrayBuffer: async () => data.buffer.slice(0) });
  assert.equal(viaBrowserFile.text, 'Imported words.');
  const viaBridge = await client.read({ name: 'a.txt', bytes: new Uint8Array(data) });
  assert.equal(viaBridge.text, 'Imported words.');
});
