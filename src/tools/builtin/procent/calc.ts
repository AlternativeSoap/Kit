export type ProcentMode = "of" | "change" | "share";

export function percentOf(percent: number, base: number): number | null {
  if (![percent, base].every(Number.isFinite)) return null;
  return (percent / 100) * base;
}

export function percentChange(from: number, to: number): number | null {
  if (![from, to].every(Number.isFinite) || from === 0) return null;
  return ((to - from) / Math.abs(from)) * 100;
}

export function percentShare(part: number, whole: number): number | null {
  if (![part, whole].every(Number.isFinite) || whole === 0) return null;
  return (part / whole) * 100;
}
