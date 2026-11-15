export type UnitCategory = "length" | "weight" | "volume" | "temperature" | "data";

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
