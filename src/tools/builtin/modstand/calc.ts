export type BandColor =
  | "black"
  | "brown"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "violet"
  | "grey"
  | "white"
  | "gold"
  | "silver"
  | "none";

export type BandCount = 4 | 5;

export const DIGIT_COLORS: readonly BandColor[] = [
  "black",
  "brown",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "violet",
  "grey",
  "white",
];

export const MULTIPLIER_COLORS: readonly BandColor[] = [
  "black",
  "brown",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "violet",
  "grey",
  "white",
  "gold",
  "silver",
];

export const TOLERANCE_COLORS: readonly BandColor[] = [
  "brown",
  "red",
  "green",
  "blue",
  "violet",
  "grey",
  "gold",
  "silver",
  "none",
];

const DIGIT: Partial<Record<BandColor, number>> = {
  black: 0,
  brown: 1,
  red: 2,
  orange: 3,
  yellow: 4,
  green: 5,
  blue: 6,
  violet: 7,
  grey: 8,
  white: 9,
};

const MULTIPLIER: Partial<Record<BandColor, number>> = {
  black: 1,
  brown: 10,
  red: 100,
  orange: 1_000,
  yellow: 10_000,
  green: 100_000,
  blue: 1_000_000,
  violet: 10_000_000,
  grey: 100_000_000,
  white: 1_000_000_000,
  gold: 0.1,
  silver: 0.01,
};

const TOLERANCE: Partial<Record<BandColor, number>> = {
  brown: 1,
  red: 2,
  green: 0.5,
  blue: 0.25,
  violet: 0.1,
  grey: 0.05,
  gold: 5,
  silver: 10,
  none: 20,
};

export const COLOR_HEX: Record<BandColor, string> = {
  black: "#1a1a1a",
  brown: "#8B4513",
  red: "#D32F2F",
  orange: "#F57C00",
  yellow: "#FBC02D",
  green: "#388E3C",
  blue: "#1976D2",
  violet: "#7B1FA2",
  grey: "#757575",
  white: "#F5F5F5",
  gold: "#C9A227",
  silver: "#B0B0B0",
  none: "#E8E4DC",
};

export function colorLabel(color: BandColor, da: boolean): string {
  const map: Record<BandColor, { da: string; en: string }> = {
    black: { da: "Sort", en: "Black" },
    brown: { da: "Brun", en: "Brown" },
    red: { da: "Rød", en: "Red" },
    orange: { da: "Orange", en: "Orange" },
    yellow: { da: "Gul", en: "Yellow" },
    green: { da: "Grøn", en: "Green" },
    blue: { da: "Blå", en: "Blue" },
    violet: { da: "Violet", en: "Violet" },
    grey: { da: "Grå", en: "Grey" },
    white: { da: "Hvid", en: "White" },
    gold: { da: "Guld", en: "Gold" },
    silver: { da: "Sølv", en: "Silver" },
    none: { da: "Ingen", en: "None" },
  };
  return da ? map[color].da : map[color].en;
}

export type DecodeResult = {
  ohms: number;
  tolerancePercent: number;
  formatted: string;
};

export function decodeBands(args: {
  bands: BandCount;
  digit1: BandColor;
  digit2: BandColor;
  digit3: BandColor;
  multiplier: BandColor;
  tolerance: BandColor;
}): DecodeResult | null {
  const d1 = DIGIT[args.digit1];
  const d2 = DIGIT[args.digit2];
  const mult = MULTIPLIER[args.multiplier];
  const tol = TOLERANCE[args.tolerance];
  if (d1 === undefined || d2 === undefined || mult === undefined || tol === undefined) {
    return null;
  }

  let significand: number;
  if (args.bands === 4) {
    significand = d1 * 10 + d2;
  } else {
    const d3 = DIGIT[args.digit3];
    if (d3 === undefined) return null;
    significand = d1 * 100 + d2 * 10 + d3;
  }

  const ohms = significand * mult;
  return {
    ohms,
    tolerancePercent: tol,
    formatted: formatOhms(ohms),
  };
}

export function formatOhms(ohms: number): string {
  if (!Number.isFinite(ohms)) return "—";
  const abs = Math.abs(ohms);
  if (abs >= 1_000_000) {
    const v = ohms / 1_000_000;
    return `${trimNum(v)} MΩ`;
  }
  if (abs >= 1_000) {
    const v = ohms / 1_000;
    return `${trimNum(v)} kΩ`;
  }
  return `${trimNum(ohms)} Ω`;
}

function trimNum(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toPrecision(6)));
}

function digitColor(n: number): BandColor | null {
  if (n < 0 || n > 9 || !Number.isInteger(n)) return null;
  return DIGIT_COLORS[n] ?? null;
}

function closestMultiplier(factor: number): { color: BandColor; mult: number } | null {
  let best: { color: BandColor; mult: number; err: number } | null = null;
  for (const color of MULTIPLIER_COLORS) {
    const mult = MULTIPLIER[color];
    if (mult === undefined || mult <= 0) continue;
    const err = Math.abs(Math.log10(factor / mult));
    if (!best || err < best.err) best = { color, mult, err };
  }
  return best ? { color: best.color, mult: best.mult } : null;
}

export type EncodeResult = {
  bands: BandCount;
  digit1: BandColor;
  digit2: BandColor;
  digit3: BandColor;
  multiplier: BandColor;
  tolerance: BandColor;
  ohms: number;
  formatted: string;
};

/** Suggest band colors for a resistance value (prefers 4-band when possible). */
export function encodeOhms(
  ohms: number,
  preferredBands: BandCount = 4,
  tolerance: BandColor = "gold",
): EncodeResult | null {
  if (!Number.isFinite(ohms) || ohms <= 0) return null;

  const tryBands = (bands: BandCount): EncodeResult | null => {
    const digits = bands === 4 ? 2 : 3;
    const scale = Math.pow(10, Math.floor(Math.log10(ohms)) - (digits - 1));
    if (!Number.isFinite(scale) || scale <= 0) return null;

    let significand = Math.round(ohms / scale);
    let usedScale = scale;

    const maxSig = bands === 4 ? 99 : 999;
    const minSig = bands === 4 ? 10 : 100;
    if (significand > maxSig) {
      significand = Math.round(significand / 10);
      usedScale *= 10;
    }
    if (significand < minSig && ohms >= 1) {
      // For small values like 4.7 with 4-band: significand 47, mult 0.1
      const altScale = scale / 10;
      const altSig = Math.round(ohms / altScale);
      if (altSig >= minSig && altSig <= maxSig) {
        significand = altSig;
        usedScale = altScale;
      }
    }

    const multInfo = closestMultiplier(usedScale);
    if (!multInfo) return null;

    const sigStr = String(significand).padStart(digits, "0");
    const d1 = digitColor(Number(sigStr[0]));
    const d2 = digitColor(Number(sigStr[1]));
    if (!d1 || !d2) return null;

    let d3: BandColor = "black";
    if (bands === 5) {
      const c3 = digitColor(Number(sigStr[2]));
      if (!c3) return null;
      d3 = c3;
    }

    const decoded = decodeBands({
      bands,
      digit1: d1,
      digit2: d2,
      digit3: d3,
      multiplier: multInfo.color,
      tolerance,
    });
    if (!decoded) return null;

    return {
      bands,
      digit1: d1,
      digit2: d2,
      digit3: d3,
      multiplier: multInfo.color,
      tolerance,
      ohms: decoded.ohms,
      formatted: decoded.formatted,
    };
  };

  if (preferredBands === 5) {
    return tryBands(5) ?? tryBands(4);
  }
  return tryBands(4) ?? tryBands(5);
}
