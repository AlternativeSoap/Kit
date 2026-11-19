/** Color science helpers for Farvelab (sRGB, HSL, approximate CIELAB, WCAG, CVD). */

export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };
export type Lab = { L: number; a: number; b: number };

export type ContrastResult = {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
};

export type CvdMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";

export function parseHex(hex: string): Rgb | null {
  const raw = hex.trim().replace(/^#/, "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const clamp = (n: number) =>
    Math.min(255, Math.max(0, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${clamp(r)}${clamp(g)}${clamp(b)}`;
}

export function normalizeHexInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hn = ((h % 360) + 360) % 360;
  const sn = Math.min(100, Math.max(0, s)) / 100;
  const ln = Math.min(100, Math.max(0, l)) / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, tIn: number) => {
    let t = tIn;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hk = hn / 360;
  return {
    r: Math.round(hue2rgb(p, q, hk + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hk) * 255),
    b: Math.round(hue2rgb(p, q, hk - 1 / 3) * 255),
  };
}

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
  const v =
    c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, Math.round(v * 255)));
}

/** Approximate CIELAB (D65) from sRGB. */
export function rgbToLab(rgb: Rgb): Lab {
  const R = srgbToLinear(rgb.r);
  const G = srgbToLinear(rgb.g);
  const B = srgbToLinear(rgb.b);
  const x = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  const y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  const z = R * 0.0193339 + G * 0.119192 + B * 0.9503041;
  const xn = x / 0.95047;
  const yn = y / 1;
  const zn = z / 1.08883;
  const f = (t: number) =>
    t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29;
  const fx = f(xn);
  const fy = f(yn);
  const fz = f(zn);
  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function luminance(rgb: Rgb): number {
  return (
    0.2126 * srgbToLinear(rgb.r) +
    0.7152 * srgbToLinear(rgb.g) +
    0.0722 * srgbToLinear(rgb.b)
  );
}

export function contrastRatio(fgHex: string, bgHex: string): ContrastResult | null {
  const fg = parseHex(fgHex);
  const bg = parseHex(bgHex);
  if (!fg || !bg) return null;
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

/** Brettel-style linear RGB matrices (approximate) for CVD simulation. */
const CVD_MATRICES: Record<Exclude<CvdMode, "none">, number[][]> = {
  protanopia: [
    [0.56667, 0.43333, 0],
    [0.55833, 0.44167, 0],
    [0, 0.24167, 0.75833],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.43333, 0.56667],
    [0, 0.475, 0.525],
  ],
};

export function simulateCvd(rgb: Rgb, mode: CvdMode): Rgb {
  if (mode === "none") return rgb;
  const m = CVD_MATRICES[mode];
  const R = srgbToLinear(rgb.r);
  const G = srgbToLinear(rgb.g);
  const B = srgbToLinear(rgb.b);
  const outR = m[0]![0]! * R + m[0]![1]! * G + m[0]![2]! * B;
  const outG = m[1]![0]! * R + m[1]![1]! * G + m[1]![2]! * B;
  const outB = m[2]![0]! * R + m[2]![1]! * G + m[2]![2]! * B;
  return {
    r: linearToSrgb(outR),
    g: linearToSrgb(outG),
    b: linearToSrgb(outB),
  };
}

export type HarmonyKind = "complementary" | "analogous" | "split" | "triadic";

export function harmonyColors(hex: string, kind: HarmonyKind): string[] {
  const rgb = parseHex(hex);
  if (!rgb) return [];
  const hsl = rgbToHsl(rgb);
  const rot = (deg: number) =>
    rgbToHex(hslToRgb({ h: (hsl.h + deg + 360) % 360, s: hsl.s, l: hsl.l }));
  switch (kind) {
    case "complementary":
      return [rot(0), rot(180)];
    case "analogous":
      return [rot(-30), rot(0), rot(30)];
    case "split":
      return [rot(0), rot(150), rot(210)];
    case "triadic":
      return [rot(0), rot(120), rot(240)];
    default:
      return [rot(0)];
  }
}

export function formatLab(lab: Lab): string {
  return `L ${lab.L.toFixed(1)}, a ${lab.a.toFixed(1)}, b ${lab.b.toFixed(1)}`;
}

export function formatHsl(hsl: Hsl): string {
  return `${Math.round(hsl.h)}°, ${hsl.s.toFixed(1)}%, ${hsl.l.toFixed(1)}%`;
}

export function formatRgb(rgb: Rgb): string {
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}
