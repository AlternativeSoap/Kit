import { colorFromHex, colorFromHsl } from "@/tools/builtin/color/calc";

export type PaletteMode =
  | "analogous"
  | "complementary"
  | "triadic"
  | "tetradic"
  | "mono"
  | "shades";

export type PaletteSwatch = {
  hex: string;
  hsl: string;
  labelEn: string;
  labelDa: string;
};

function wrapHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

function swatch(
  h: number,
  s: number,
  l: number,
  labelEn: string,
  labelDa: string,
): PaletteSwatch | null {
  const color = colorFromHsl(wrapHue(h), Math.min(100, Math.max(0, s)), Math.min(100, Math.max(0, l)));
  if (!color) return null;
  return {
    hex: color.hex,
    hsl: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
    labelEn,
    labelDa,
  };
}

export function buildPalette(seedHex: string, mode: PaletteMode): PaletteSwatch[] | null {
  const seed = colorFromHex(seedHex);
  if (!seed) return null;
  const { h, s, l } = seed.hsl;
  const out: (PaletteSwatch | null)[] = [];

  switch (mode) {
    case "analogous":
      out.push(
        swatch(h - 30, s, l, "Analogous −30°", "Analog −30°"),
        swatch(h, s, l, "Seed", "Start"),
        swatch(h + 30, s, l, "Analogous +30°", "Analog +30°"),
        swatch(h + 60, s, l, "Analogous +60°", "Analog +60°"),
        swatch(h - 60, s, l, "Analogous −60°", "Analog −60°"),
      );
      break;
    case "complementary":
      out.push(
        swatch(h, s, l, "Seed", "Start"),
        swatch(h + 180, s, l, "Complement", "Komplementær"),
        swatch(h, s, Math.min(90, l + 15), "Light seed", "Lys start"),
        swatch(h + 180, s, Math.min(90, l + 15), "Light complement", "Lys komplementær"),
        swatch(h, Math.max(10, s - 20), l, "Muted seed", "Dæmpet start"),
      );
      break;
    case "triadic":
      out.push(
        swatch(h, s, l, "Seed", "Start"),
        swatch(h + 120, s, l, "Triadic +120°", "Triade +120°"),
        swatch(h + 240, s, l, "Triadic +240°", "Triade +240°"),
        swatch(h, s, Math.max(12, l - 18), "Dark seed", "Mørk start"),
        swatch(h + 120, s, Math.max(12, l - 18), "Dark +120°", "Mørk +120°"),
      );
      break;
    case "tetradic":
      out.push(
        swatch(h, s, l, "Seed", "Start"),
        swatch(h + 90, s, l, "+90°", "+90°"),
        swatch(h + 180, s, l, "+180°", "+180°"),
        swatch(h + 270, s, l, "+270°", "+270°"),
        swatch(h, Math.max(15, s - 25), Math.min(88, l + 10), "Soft seed", "Blød start"),
      );
      break;
    case "mono":
      out.push(
        swatch(h, s, Math.min(92, l + 28), "Tint", "Lysere"),
        swatch(h, s, Math.min(85, l + 14), "Light", "Lys"),
        swatch(h, s, l, "Seed", "Start"),
        swatch(h, s, Math.max(8, l - 14), "Dark", "Mørk"),
        swatch(h, s, Math.max(5, l - 28), "Shade", "Mørkere"),
      );
      break;
    case "shades":
      out.push(
        swatch(h, Math.min(100, s + 10), Math.min(90, l + 20), "Bright", "Klar"),
        swatch(h, s, l, "Seed", "Start"),
        swatch(h, Math.max(5, s - 15), l, "Desaturated", "Afmættet"),
        swatch(h, s, Math.max(10, l - 20), "Deep", "Dyb"),
        swatch(h, Math.max(8, s - 30), Math.max(8, l - 8), "Grayed", "Grålig"),
      );
      break;
  }

  return out.filter((x): x is PaletteSwatch => Boolean(x));
}
