import { normalize } from "./normalize";

/** Damerau–Levenshtein distance with early exit above `max`. */
export function editDistance(a: string, b: string, max = 1): number {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > max) return max + 1;
  if (la === 0) return lb;
  if (lb === 0) return la;

  const rows: number[][] = [
    Array.from({ length: lb + 1 }, (_, j) => j),
    Array.from({ length: lb + 1 }, () => 0),
    Array.from({ length: lb + 1 }, () => 0),
  ];

  for (let i = 1; i <= la; i++) {
    const prev = rows[(i - 1) % 3]!;
    const curr = rows[i % 3]!;
    const prevPrev = rows[(i - 2 + 3) % 3]!;
    curr[0] = i;
    let rowMin = curr[0]!;

    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        value = Math.min(value, prevPrev[j - 2]! + 1);
      }
      curr[j] = value;
      if (value < rowMin) rowMin = value;
    }

    if (rowMin > max) return max + 1;
  }

  return rows[la % 3]![lb]!;
}

/**
 * True when `query` is a near miss of `candidate`.
 * Only for tokens of length 4+ so short queries stay strict.
 */
export function isTypoOf(query: string, candidate: string, max = 1): boolean {
  const q = normalize(query);
  const c = normalize(candidate);
  if (q.length < 4 || c.length < 4) return false;
  if (Math.abs(q.length - c.length) > max) return false;
  return editDistance(q, c, max) <= max;
}
