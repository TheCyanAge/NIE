import { createProjectData } from '../apps/web/src/engine/project/store.js';

export function projectWith({ profile = {}, memory = {}, storyText = '', title = 'Test' } = {}) {
  const p = createProjectData({ title, storyText });
  p.profile = {
    ...p.profile,
    ...profile,
    identity: { ...p.profile.identity, ...(profile.identity ?? {}) },
    genre: { ...p.profile.genre, ...(profile.genre ?? {}) },
    style: { ...p.profile.style, ...(profile.style ?? {}) },
    narrative: { ...p.profile.narrative, ...(profile.narrative ?? {}) },
  };
  p.memory = { ...p.memory, ...memory };
  return p;
}

export const para = (...sentences) => sentences.join(' ');

import { addRule } from '../apps/web/src/engine/rules/rules.js';

/** Add plain-language rules to a project (strings, or { text, category }). */
export function withRules(project, rules) {
  for (const r of rules) addRule(project, typeof r === 'string' ? { text: r } : r);
  return project;
}
