/** Unsigned LEB128 integers, the way the postings are stored (small numbers take one byte). */

export function pushVarint(out, n) {
  let v = n >>> 0;
  while (v >= 0x80) {
    out.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  out.push(v);
}

/** @returns {{ value: number, next: number }} */
export function readVarint(buf, at) {
  let value = 0;
  let shift = 0;
  let i = at;
  for (;;) {
    const b = buf[i++];
    if (b === undefined) throw new Error('postings are cut short');
    value |= (b & 0x7f) << shift;
    if (b < 0x80) return { value: value >>> 0, next: i };
    shift += 7;
    if (shift > 28) throw new Error('postings are corrupt');
  }
}
