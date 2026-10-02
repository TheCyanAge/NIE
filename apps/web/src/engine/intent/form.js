import { splitParagraphs, dialogueSpans, words } from '../util/text.js';

/**
 * Guess what *kind of writing* a text is, so NIE reads a report as a report and a journal as a journal.
 * Returns { id, label, confidence, reasons[] }. `prose-fiction` is the fallback, not an assumption of quality.
 */
export function inferForm(text) {
  const t = String(text ?? '');
  const reasons = [];
  const lines = t.split(/\r?\n/);
  const nonEmpty = lines.filter((l) => l.trim());
  if (nonEmpty.length === 0) return { id: 'unknown', label: 'Empty', confidence: 0, reasons: ['No text'] };

  const count = (re) => (t.match(re) ?? []).length;

  // Screenplay
  const slug = count(/^\s*(?:INT\.|EXT\.|INT\/EXT\.?|I\/E\.)/gm);
  const cues = count(/^\s{0,40}[A-Z][A-Z .'’-]{1,28}(?:\s*\((?:V\.O\.|O\.S\.|CONT'D)\))?\s*$/gm);
  if (slug >= 1 || /\bFADE (?:IN|OUT)[:.]/i.test(t)) {
    reasons.push(`${slug} scene heading(s)`);
    return { id: 'screenplay', label: 'Screenplay', confidence: slug >= 2 ? 0.95 : 0.8, reasons };
  }

  // Comic script
  if (/^\s*PAGE\s+(?:ONE|TWO|THREE|\d+)/im.test(t) && /^\s*PANEL\s+\d+/im.test(t)) {
    return { id: 'comic-script', label: 'Comic script', confidence: 0.9, reasons: ['PAGE / PANEL markers'] };
  }

  // Stage play
  const act = /^\s*(?:ACT|SCENE)\s+(?:[IVX]+|\d+|ONE|TWO)\b/im.test(t);
  const speakerLines = count(/^[A-Z][A-Z .'’-]{1,24}[:.]\s+\S/gm);
  if ((act && speakerLines >= 2) || speakerLines >= 6 || /^\s*\(?(?:Enter|Exit|Exeunt)\b/m.test(t)) {
    return { id: 'stage-play', label: 'Stage play', confidence: 0.75, reasons: ['Speaker-labelled dialogue / stage directions'] };
  }
  if (cues >= 4 && slug === 0) {
    return { id: 'screenplay', label: 'Screenplay', confidence: 0.55, reasons: ['Character cues in capitals'] };
  }

  // Epistolary (single letter)
  if (/^\s*Dear\s+\S+/i.test(t) && /(?:Sincerely|Yours|Regards|Love|Best),?\s*\n?\s*\S+\s*$/i.test(t.trim())) {
    return { id: 'epistolary-form', label: 'Letter', confidence: 0.8, reasons: ['Salutation and sign-off'] };
  }

  // Journal: multiple dated entries
  const dated = count(
    /^\s*(?:Dear Diary|(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day\b|\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?\b|Entry\s+\d+)/gim
  );
  if (dated >= 2) return { id: 'journal', label: 'Journal or diary', confidence: Math.min(0.9, 0.55 + dated * 0.1), reasons: [`${dated} dated entries`] };

  // Report
  const headings = count(
    /^\s*(?:#{1,3}\s*)?(?:executive summary|summary|background|scope|methodology|methods|findings|results|analysis|recommendations?|conclusions?|introduction|objectives?|appendix)\s*:?\s*$/gim
  );
  if (headings >= 2) return { id: 'report', label: 'Report', confidence: Math.min(0.9, 0.5 + headings * 0.12), reasons: [`${headings} report-style headings`] };

  // News
  const dateline = /^[A-Z][A-Z .,'’-]{2,}\s*(?:\([A-Z]{2,}\))?\s*[—–-]\s+\S/m.test(t);
  const attributions = count(/\b(?:according to|officials said|said in a statement|told reporters|spokesperson|authorities said)\b/gi);
  if ((dateline && attributions >= 1) || attributions >= 3) {
    return { id: 'news-narrative', label: 'News-style piece', confidence: dateline ? 0.8 : 0.6, reasons: ['Dateline or repeated attribution'] };
  }

  // Poetry: short lines, stanza breaks, few sentence ends
  if (nonEmpty.length >= 4) {
    const lens = nonEmpty.map((l) => l.trim().length).sort((a, b) => a - b);
    const median = lens[Math.floor(lens.length / 2)];
    const sentenceEnds = count(/[.!?]["”’)]?\s+[A-Z]/g);
    const stanzas = t.split(/\n\s*\n/).length;
    if (median <= 48 && sentenceEnds < nonEmpty.length * 0.25 && (stanzas >= 2 || nonEmpty.length >= 6)) {
      return { id: 'poetry', label: 'Poetry', confidence: 0.6, reasons: ['Short lines with stanza-like breaks'] };
    }
  }

  // Essay / argument
  const wc = words(t).length;
  const argCues = count(/\b(?:I argue|this essay|in this essay|I will argue|therefore|moreover|furthermore|in conclusion|on the other hand|it follows that|thesis)\b/gi);
  const dialogue = dialogueSpans(t).length;
  if (wc > 80 && argCues >= 3 && dialogue <= 1) {
    return { id: 'essay', label: 'Essay', confidence: 0.6, reasons: ['Argumentative connectives, no dialogue'] };
  }

  const paras = splitParagraphs(t).length;
  return {
    id: 'prose-fiction',
    label: 'Prose',
    confidence: 0.3,
    reasons: [dialogue ? `${dialogue} spoken line(s)` : 'Continuous prose', `${paras} paragraph(s)`],
  };
}
