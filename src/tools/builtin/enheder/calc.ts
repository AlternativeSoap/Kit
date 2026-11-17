export type UnitCategory = "length" | "weight" | "volume" | "temperature" | "data" | "area" | "speed" | "cooking";

type UnitDef = {
  id: string;
  /** Multiply by this to get base unit (except temperature). */
  toBase: number;
};

const LENGTH: UnitDef[] = [
  { id: "mm", toBase: 0.001 },
  { id: "cm", toBase: 0.01 },
  { id: "m", toBase: 1 },
  { id: "km", toBase: 1000 },
  { id: "in", toBase: 0.0254 },
  { id: "ft", toBase: 0.3048 },
  { id: "yd", toBase: 0.9144 },
  { id: "mi", toBase: 1609.344 },
];

const WEIGHT: UnitDef[] = [
  { id: "mg", toBase: 0.000001 },
  { id: "g", toBase: 0.001 },
  { id: "kg", toBase: 1 },
  { id: "t", toBase: 1000 },
  { id: "oz", toBase: 0.028349523125 },
  { id: "lb", toBase: 0.45359237 },
];

const VOLUME: UnitDef[] = [
  { id: "ml", toBase: 0.001 },
  { id: "l", toBase: 1 },
  { id: "m3", toBase: 1000 },
  { id: "gal", toBase: 3.785411784 },
];

const DATA: UnitDef[] = [
  { id: "b", toBase: 1 },
  { id: "kb", toBase: 1000 },
  { id: "mb", toBase: 1_000_000 },
  { id: "gb", toBase: 1_000_000_000 },
  { id: "tb", toBase: 1_000_000_000_000 },
  { id: "kib", toBase: 1024 },
  { id: "mib", toBase: 1024 ** 2 },
  { id: "gib", toBase: 1024 ** 3 },
  { id: "tib", toBase: 1024 ** 4 },
];

const AREA: UnitDef[] = [
  { id: "m2", toBase: 1 },
  { id: "km2", toBase: 1_000_000 },
  { id: "ha", toBase: 10_000 },
  { id: "acre", toBase: 4046.8564224 },
  { id: "tdl", toBase: 5516.2 },
  { id: "ft2", toBase: 0.09290304 },
  { id: "mi2", toBase: 2_589_988.110336 },
];

const SPEED: UnitDef[] = [
  { id: "ms", toBase: 1 },
  { id: "kmh", toBase: 1000 / 3600 },
  { id: "mph", toBase: 0.44704 },
  { id: "kn", toBase: 0.514444 },
];

const COOKING: UnitDef[] = [
  { id: "ml", toBase: 1 },
  { id: "dl", toBase: 100 },
  { id: "l", toBase: 1000 },
  { id: "tsp", toBase: 5 },
  { id: "tbsp", toBase: 15 },
  // US customary cup and US fluid ounce.
  { id: "cup", toBase: 236.588 },
  { id: "floz", toBase: 29.5735 },
];

export const UNITS: Record<UnitCategory, UnitDef[]> = {
  length: LENGTH,
  weight: WEIGHT,
  volume: VOLUME,
  data: DATA,
  temperature: [
    { id: "c", toBase: 1 },
    { id: "f", toBase: 1 },
    { id: "k", toBase: 1 },
  ],
  area: AREA,
  speed: SPEED,
  cooking: COOKING,
};

function toCelsius(value: number, from: string): number | null {
  if (from === "c") return value;
  if (from === "f") return ((value - 32) * 5) / 9;
  if (from === "k") return value - 273.15;
  return null;
}

function fromCelsius(value: number, to: string): number | null {
  if (to === "c") return value;
  if (to === "f") return (value * 9) / 5 + 32;
  if (to === "k") return value + 273.15;
  return null;
}

export function convertUnits(
  category: UnitCategory,
  value: number,
  fromId: string,
  toId: string,
): number | null {
  if (!Number.isFinite(value)) return null;

  if (category === "temperature") {
    const c = toCelsius(value, fromId);
    if (c === null) return null;
    return fromCelsius(c, toId);
  }

  const units = UNITS[category];
  const from = units.find((unit) => unit.id === fromId);
  const to = units.find((unit) => unit.id === toId);
  if (!from || !to) return null;
  const base = value * from.toBase;
  return base / to.toBase;
}

/** The value converted into every other unit of the category. */
export function convertToAll(
  category: UnitCategory,
  value: number,
  fromId: string,
): { id: string; value: number }[] {
  const out: { id: string; value: number }[] = [];
  for (const unit of UNITS[category]) {
    if (unit.id === fromId) continue;
    const converted = convertUnits(category, value, fromId, unit.id);
    if (converted !== null) out.push({ id: unit.id, value: converted });
  }
  return out;
}
