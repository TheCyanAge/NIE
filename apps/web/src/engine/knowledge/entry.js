/**
 * Knowledge entries are *reference*, never rules. Every entry carries `deliberateWhen`
 * so NIE can recognise that a departure from the convention may be on purpose.
 */
export function entry(id, kind, name, summary, o = {}) {
  return Object.freeze({
    id,
    kind,
    name,
    summary,
    parent: o.parent ?? null,
    aka: o.aka ?? [],
    conventions: o.conv ?? [],
    watchFor: o.watch ?? [],
    deliberateWhen: o.intent ?? [],
    questions: o.q ?? [],
    keywords: o.kw ?? [],
  });
}
