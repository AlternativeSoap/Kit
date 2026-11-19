export type ShapeId = "triangle" | "rectangle" | "circle" | "polygon";

export function clampPositive(n: number, fallback = 1): number {
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** Law of cosines: angle opposite side a (degrees). */
export function angleOppositeA(a: number, b: number, c: number): number | null {
  if (a <= 0 || b <= 0 || c <= 0) return null;
  if (a + b <= c || a + c <= b || b + c <= a) return null;
  const cosA = (b * b + c * c - a * a) / (2 * b * c);
  const clamped = Math.min(1, Math.max(-1, cosA));
  return (Math.acos(clamped) * 180) / Math.PI;
}

export function triangleMetrics(a: number, b: number, c: number) {
  const A = angleOppositeA(a, b, c);
  const B = angleOppositeA(b, a, c);
  const C = angleOppositeA(c, a, b);
  if (A == null || B == null || C == null) {
    return { valid: false as const, perimeter: 0, area: 0, A: 0, B: 0, C: 0 };
  }
  const perimeter = a + b + c;
  const s = perimeter / 2;
  const area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
  return { valid: true as const, perimeter, area, A, B, C };
}

export function rectangleMetrics(w: number, h: number) {
  return { area: w * h, perimeter: 2 * (w + h) };
}

export function circleMetrics(r: number) {
  return { area: Math.PI * r * r, perimeter: 2 * Math.PI * r };
}

export function regularPolygonMetrics(sides: number, side: number) {
  const n = clampInt(sides, 3, 12);
  const s = clampPositive(side);
  const perimeter = n * s;
  const area = (n * s * s) / (4 * Math.tan(Math.PI / n));
  return { sides: n, perimeter, area };
}

/** Solve right triangle: missing leg or hypotenuse via Pythagoras. */
export function pythagorasSolve(a: number | null, b: number | null, c: number | null) {
  const hasA = a != null && a > 0;
  const hasB = b != null && b > 0;
  const hasC = c != null && c > 0;
  if (hasA && hasB && !hasC) {
    return { a: a!, b: b!, c: Math.sqrt(a! * a! + b! * b!), solved: "c" as const };
  }
  if (hasA && hasC && !hasB) {
    if (c! <= a!) return null;
    return { a: a!, b: Math.sqrt(c! * c! - a! * a!), c: c!, solved: "b" as const };
  }
  if (hasB && hasC && !hasA) {
    if (c! <= b!) return null;
    return { a: Math.sqrt(c! * c! - b! * b!), b: b!, c: c!, solved: "a" as const };
  }
  if (hasA && hasB && hasC) {
    const ok = Math.abs(a! * a! + b! * b! - c! * c!) < 1e-6;
    return { a: a!, b: b!, c: c!, solved: ok ? ("ok" as const) : ("bad" as const) };
  }
  return null;
}

export function fmt(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "-";
  const rounded = Math.abs(n) >= 100 ? n.toFixed(1) : n.toFixed(digits);
  return rounded.replace(/\.?0+$/, "") || "0";
}
