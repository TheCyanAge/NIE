import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { LIB_DIR, listDataFiles, renderIndex } from '../scripts/build-library-index.mjs';
import { lintLibrary } from '../scripts/library-lint.mjs';
import { KNOWLEDGE, coreEntries, loadLibrary, libraryStats, libraryStatus, search, searchScored, getEntry } from '../apps/web/src/engine/knowledge/index.js';

/**
 * The big offline library (apps/web/src/engine/knowledge/library/**). Most of it was written in parallel by many
 * authors, so these checks are strict about the things that go wrong at that scale: invented citations, copied text,
 * duplicate ids, thin entries, and facts stated without a source or an edition.
 *
 * Record format and rules: apps/web/src/engine/knowledge/library/README.md
 */

const files = listDataFiles();

test('library: the index lists exactly the data files that exist', () => {
  assert.equal(fs.readFileSync(path.join(LIB_DIR, 'index.js'), 'utf8').replace(/\r\n/g, '\n'), renderIndex(files), 'run: node scripts/build-library-index.mjs'); // a Windows checkout may use CRLF
});

test('library: every file is well-formed, every record passes the checks, and nothing is duplicated', async () => {
  const problems = await lintLibrary();
  assert.deepEqual(problems.slice(0, 40), [], `${problems.length} problem(s)`);
});

test('library: loads on demand, reports honestly, and the core keeps working before and after', async () => {
  const before = KNOWLEDGE.length;
  assert.equal(before, coreEntries().length);
  const n = await loadLibrary();
  assert.equal(libraryStatus().loaded, true, libraryStatus().error ?? '');
  assert.ok(n >= before);
  assert.equal(KNOWLEDGE.length, n);
  assert.equal(await loadLibrary(), n, 'idempotent');
  // The core stays first and unchanged in behaviour.
  assert.equal(search('unreliable narrator contradictions')[0].id, 'unreliable-narration');
  assert.equal(search('emotionally devastating but not melodramatic')[0].id, 'emotional-restraint');
  assert.ok(search('a homeless man befriends a cat').some((e) => e.id === 'companionship-arc'));
  assert.ok(!search('a homeless man befriends a cat').some((e) => e.id === 'beat-sheet'));
  assert.deepEqual(search('zzzz qqqq'), []);
  const stats = libraryStats();
  assert.equal(stats.total, n);
  assert.equal(stats.loaded, true);
});

test('library: when it is large, searching it is fast and nonsense still finds nothing', async () => {
  await loadLibrary();
  const t0 = performance.now();
  for (let i = 0; i < 20; i++) searchScored('how do I punctuate dialogue in a novel', { limit: 5 });
  const per = (performance.now() - t0) / 20;
  assert.ok(per < 60, `a search took ${per.toFixed(1)} ms on ${KNOWLEDGE.length} entries`);
  assert.deepEqual(search('xqzvk wjplm'), []);
  assert.equal(getEntry('definitely-not-an-entry'), null);
});
