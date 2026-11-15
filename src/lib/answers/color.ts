/** HEX and RGB color recognition with conversions. */

export type ColorAnswer = {
  kind: "color";
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  source: "hex" | "rgb";
};

function clampByte(n: number): number | null {
  if (!Number.isFinite(n) || n < 0 || n > 255) return null;
  return Math.round(n);
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
      .toLowerCase()
  );
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 1000) / 10 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return {
    h: Math.round(h * 3600) / 10,
    s: Math.round(s * 1000) / 10,
    l: Math.round(l * 1000) / 10,
  };
}

function fromRgb(r: number, g: number, b: number, source: "hex" | "rgb"): ColorAnswer | null {
  const rb = clampByte(r);
  const gb = clampByte(g);
  const bb = clampByte(b);
  if (rb === null || gb === null || bb === null) return null;
  return {
    kind: "color",
    hex: rgbToHex(rb, gb, bb),
    rgb: { r: rb, g: gb, b: bb },
    hsl: rgbToHsl(rb, gb, bb),
    source,
  };
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGB_RE =
  /^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})(?:\s*[,/]\s*[\d.]+%?)?\s*\)$/i;

export function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } | null {
  if (!Number.isFinite(h) || !Number.isFinite(s) || !Number.isFinite(l)) return null;
  const sn = Math.min(100, Math.max(0, s)) / 100;
  const ln = Math.min(100, Math.max(0, l)) / 100;
  const hn = ((h % 360) + 360) % 360 / 360;
  if (sn === 0) {
    const c = Math.round(ln * 255);
    return { r: c, g: c, b: c };
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return {
    r: Math.round(hue(hn + 1 / 3) * 255),
    g: Math.round(hue(hn) * 255),
    b: Math.round(hue(hn - 1 / 3) * 255),
  };
}

export function parseColor(query: string): ColorAnswer | null {
  const trimmed = query.trim();
  const hex = HEX_RE.exec(trimmed);
  if (hex) {
    let raw = hex[1]!.toLowerCase();
    if (raw.length === 3) {
      raw = raw
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const r = Number.parseInt(raw.slice(0, 2), 16);
    const g = Number.parseInt(raw.slice(2, 4), 16);
    const b = Number.parseInt(raw.slice(4, 6), 16);
    return fromRgb(r, g, b, "hex");
  }

  const rgb = RGB_RE.exec(trimmed);
  if (rgb) {
    return fromRgb(
      Number(rgb[1]),
      Number(rgb[2]),
      Number(rgb[3]),
      "rgb",
    );
  }

  return null;
}
