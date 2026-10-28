/**
 * Keeping the N most prominent articles of a dump that is far too big to hold: a min-heap of the N best so far, so memory is N entries however long the dump is.
 * Ties go to the earlier article, which makes a build repeatable.
 */
export class TopN {
  constructor(n) {
    this.n = Math.max(1, Math.floor(n));
    this.heap = []; // [rank, order, entry], the weakest at the top
    this.seen = 0;
  }

  #weaker(a, b) {
    return a[0] < b[0] || (a[0] === b[0] && a[1] > b[1]);
  }

  #up(i) {
    const h = this.heap;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.#weaker(h[i], h[p])) break;
      [h[i], h[p]] = [h[p], h[i]];
      i = p;
    }
  }

  #down(i) {
    const h = this.heap;
    for (;;) {
      let m = i;
      const l = 2 * i + 1;
      const r = l + 1;
      if (l < h.length && this.#weaker(h[l], h[m])) m = l;
      if (r < h.length && this.#weaker(h[r], h[m])) m = r;
      if (m === i) return;
      [h[i], h[m]] = [h[m], h[i]];
      i = m;
    }
  }

  add(entry) {
    const item = [entry.rank, this.seen++, entry];
    if (this.heap.length < this.n) {
      this.heap.push(item);
      this.#up(this.heap.length - 1);
    } else if (this.#weaker(this.heap[0], item)) {
      this.heap[0] = item;
      this.#down(0);
    }
  }

  /** The kept entries, most prominent first. */
  result() {
    return [...this.heap].sort((a, b) => b[0] - a[0] || a[1] - b[1]).map((x) => x[2]);
  }
}
