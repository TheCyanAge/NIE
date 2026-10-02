import { clip, fnv1a } from '../util/text.js';
import { MAX_STORED_MESSAGES } from './store.js';

/** Pure helpers for project memory (canon, continuity). All operate on, and return, the given project. */

export function rememberCharacter(project, { name, aliases = [], notes = '' }) {
  const n = String(name ?? '').trim();
  if (!n) return project;
  const list = project.memory.characters;
  const existing = list.find((c) => c.name.toLowerCase() === n.toLowerCase());
  if (existing) {
    existing.aliases = [...new Set([...(existing.aliases ?? []), ...aliases.map(String)])];
    if (notes) existing.notes = notes;
  } else {
    list.push({ name: n, aliases: aliases.map(String), notes: String(notes) });
  }
  return project;
}

export function rememberItem(project, kind, value) {
  const v = typeof value === 'string' ? value.trim() : value;
  if (!v || !Array.isArray(project.memory[kind])) return project;
  const key = JSON.stringify(v).toLowerCase();
  if (!project.memory[kind].some((x) => JSON.stringify(x).toLowerCase() === key)) project.memory[kind].push(v);
  return project;
}

export function forget(project, kind, index) {
  if (Array.isArray(project.memory[kind])) project.memory[kind].splice(index, 1);
  return project;
}

/** Stable fingerprint for a finding so "dismissed" / "intentional" survive re-scans. */
export function findingFingerprint(f) {
  return fnv1a(`${f.detector}|${(f.key ?? f.quote ?? '').toLowerCase().replace(/\s+/g, ' ').slice(0, 120)}`);
}

export function markIntentional(project, finding, note = '') {
  const fp = findingFingerprint(finding);
  if (!project.memory.intentional.some((x) => x.fingerprint === fp)) {
    project.memory.intentional.push({ fingerprint: fp, detector: finding.detector, quote: clip(finding.quote ?? '', 160), note, at: Date.now() });
  }
  return project;
}

export function dismissFinding(project, finding) {
  const fp = findingFingerprint(finding);
  if (!project.memory.dismissed.includes(fp)) project.memory.dismissed.push(fp);
  return project;
}

export const isIntentional = (project, finding) => project.memory.intentional.some((x) => x.fingerprint === findingFingerprint(finding));
export const isDismissed = (project, finding) => project.memory.dismissed.includes(findingFingerprint(finding));

export function appendMessage(project, role, content, meta = {}) {
  const msg = { role, content: String(content), at: Date.now(), ...meta };
  project.conversation.messages.push(msg);
  if (project.conversation.messages.length > MAX_STORED_MESSAGES) {
    project.conversation.messages.splice(0, project.conversation.messages.length - MAX_STORED_MESSAGES);
  }
  return msg;
}

/** Project-only memory block for prompts. Contains nothing from any other project by construction. */
export function memoryToPromptBlock(project, maxChars = 1400) {
  const m = project.memory;
  const lines = [];
  if (m.characters.length) {
    lines.push(
      'Characters: ' +
        m.characters.map((c) => `${c.name}${c.aliases?.length ? ` (also ${c.aliases.join(', ')})` : ''}${c.notes ? ` — ${c.notes}` : ''}`).join('; ')
    );
  }
  if (m.timeline.length) lines.push('Timeline: ' + m.timeline.join(' → '));
  if (m.themes.length) lines.push('Themes: ' + m.themes.join(', '));
  if (m.motifs.length) lines.push('Deliberate motifs/recurring phrases: ' + m.motifs.join('; '));
  if (m.intentional.length) lines.push('Marked deliberate by the writer: ' + m.intentional.slice(-6).map((x) => `"${x.quote}"`).join('; '));
  const wp = project.conversation.workingPremise;
  if (wp?.summary) {
    const bits = [`"${clip(wp.summary, 200)}"`];
    if (wp.characters?.length) bits.push(`figures: ${wp.characters.join(', ')}`);
    if (wp.themes?.length) bits.push(`themes: ${wp.themes.slice(0, 4).join(', ')}`);
    if (wp.reality && wp.reality !== 'unclear') bits.push(`reads as ${wp.reality}`);
    if (wp.revisions?.length) bits.push(`latest change of direction: "${clip(wp.revisions.at(-1).text, 140)}"`);
    lines.push('Current working premise: ' + bits.join('; '));
  }
  return clip(lines.join('\n'), maxChars);
}
