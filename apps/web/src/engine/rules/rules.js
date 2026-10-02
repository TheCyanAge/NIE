import { uid } from '../util/text.js';
import { RULE_CATEGORIES } from '../project/store.js';

/** CRUD for the writer's rules. Rules belong to one project and are removed with it. */

export const CATEGORY_LABELS = { character: 'Character', world: 'World', voice: 'Voice', style: 'Style', other: 'Other' };
export { RULE_CATEGORIES };

export function addRule(project, { text, category = 'other' }) {
  const t = String(text ?? '').trim();
  if (!t) return null;
  const existing = project.rules.find((r) => r.text.toLowerCase() === t.toLowerCase());
  if (existing) return existing;
  const rule = { id: uid('rule'), text: t, category: RULE_CATEGORIES.includes(category) ? category : 'other', enabled: true, createdAt: Date.now() };
  project.rules.push(rule);
  return rule;
}

export function updateRule(project, id, patch) {
  const r = project.rules.find((x) => x.id === id);
  if (!r) return null;
  if (typeof patch.text === 'string' && patch.text.trim()) r.text = patch.text.trim();
  if (RULE_CATEGORIES.includes(patch.category)) r.category = patch.category;
  if (typeof patch.enabled === 'boolean') r.enabled = patch.enabled;
  return r;
}

export function removeRule(project, id) {
  const i = project.rules.findIndex((x) => x.id === id);
  if (i >= 0) project.rules.splice(i, 1);
  return project;
}

export const activeRules = (project) => (project.rules ?? []).filter((r) => r.enabled);

/** The rules as the language model sees them (for conversation), grouped by category. */
export function rulesToPromptBlock(project, maxChars = 1200) {
  const by = {};
  for (const r of activeRules(project)) (by[r.category] ??= []).push(r.text);
  const lines = Object.entries(by).map(([c, list]) => `${CATEGORY_LABELS[c]} rules: ${list.join('; ')}`);
  const s = lines.join('\n');
  return s.length > maxChars ? s.slice(0, maxChars - 1) + '…' : s;
}
