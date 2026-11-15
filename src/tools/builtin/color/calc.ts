import {
  hslToRgb,
  parseColor,
  rgbToHex,
  rgbToHsl,
  type ColorAnswer,
} from "@/lib/answers/color";

export type ColorFormats = {
  hex: string;
  rgb: string;
  hsl: string;
};

export function colorFromHex(hex: string): ColorAnswer | null {
  return parseColor(hex.startsWith("#") ? hex : `#${hex}`);
}

export function colorFromRgb(r: number, g: number, b: number): ColorAnswer | null {
  return parseColor(`rgb(${r}, ${g}, ${b})`);
}

export function colorFromHsl(h: number, s: number, l: number): ColorAnswer | null {
  const rgb = hslToRgb(h, s, l);
  if (!rgb) return null;
  return colorFromRgb(rgb.r, rgb.g, rgb.b);
}

export function formatColorValues(answer: ColorAnswer): ColorFormats {
  const { r, g, b } = answer.rgb;
  const { h, s, l } = answer.hsl;
  return {
    hex: answer.hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
  };
}

export { rgbToHex, rgbToHsl, hslToRgb, parseColor };