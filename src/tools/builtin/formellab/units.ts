export type UnitCategory =
  | "length"
  | "mass"
  | "temp"
  | "energy"
  | "pressure"
  | "speed";

export type UnitDef = {
  id: string;
  labelDa: string;
  labelEn: string;
  /** Multiply by this to get base unit (except temp). */
  toBase: number;
};

export const CATEGORIES: {
  id: UnitCategory;
  nameDa: string;
  nameEn: string;
  baseDa: string;
  baseEn: string;
}[] = [
  {
    id: "length",
    nameDa: "Længde",
    nameEn: "Length",
    baseDa: "meter",
    baseEn: "meter",
  },
  {
    id: "mass",
    nameDa: "Masse",
    nameEn: "Mass",
    baseDa: "kilogram",
    baseEn: "kilogram",
  },
  {
    id: "temp",
    nameDa: "Temperatur",
    nameEn: "Temperature",
    baseDa: "kelvin",
    baseEn: "kelvin",
  },
  {
    id: "energy",
    nameDa: "Energi",
    nameEn: "Energy",
    baseDa: "joule",
    baseEn: "joule",
  },
  {
    id: "pressure",
    nameDa: "Tryk",
    nameEn: "Pressure",
    baseDa: "pascal",
    baseEn: "pascal",
  },
  {
    id: "speed",
    nameDa: "Hastighed",
    nameEn: "Speed",
    baseDa: "m/s",
    baseEn: "m/s",
  },
];

export const UNITS: Record<UnitCategory, UnitDef[]> = {
  length: [
    { id: "m", labelDa: "meter (m)", labelEn: "meter (m)", toBase: 1 },
    { id: "cm", labelDa: "centimeter (cm)", labelEn: "centimeter (cm)", toBase: 0.01 },
    { id: "mm", labelDa: "millimeter (mm)", labelEn: "millimeter (mm)", toBase: 0.001 },
    { id: "km", labelDa: "kilometer (km)", labelEn: "kilometer (km)", toBase: 1000 },
    { id: "in", labelDa: "tomme (in)", labelEn: "inch (in)", toBase: 0.0254 },
    { id: "ft", labelDa: "fod (ft)", labelEn: "foot (ft)", toBase: 0.3048 },
    { id: "mi", labelDa: "mile (mi)", labelEn: "mile (mi)", toBase: 1609.344 },
  ],
  mass: [
    { id: "kg", labelDa: "kilogram (kg)", labelEn: "kilogram (kg)", toBase: 1 },
    { id: "g", labelDa: "gram (g)", labelEn: "gram (g)", toBase: 0.001 },
    { id: "mg", labelDa: "milligram (mg)", labelEn: "milligram (mg)", toBase: 1e-6 },
    { id: "t", labelDa: "ton (t)", labelEn: "tonne (t)", toBase: 1000 },
    { id: "lb", labelDa: "pound (lb)", labelEn: "pound (lb)", toBase: 0.45359237 },
    { id: "oz", labelDa: "ounce (oz)", labelEn: "ounce (oz)", toBase: 0.028349523125 },
  ],
  temp: [
    { id: "C", labelDa: "Celsius (°C)", labelEn: "Celsius (°C)", toBase: 1 },
    { id: "F", labelDa: "Fahrenheit (°F)", labelEn: "Fahrenheit (°F)", toBase: 1 },
    { id: "K", labelDa: "Kelvin (K)", labelEn: "Kelvin (K)", toBase: 1 },
  ],
  energy: [
    { id: "J", labelDa: "joule (J)", labelEn: "joule (J)", toBase: 1 },
    { id: "kJ", labelDa: "kilojoule (kJ)", labelEn: "kilojoule (kJ)", toBase: 1000 },
    { id: "cal", labelDa: "kalorie (cal)", labelEn: "calorie (cal)", toBase: 4.184 },
    { id: "kcal", labelDa: "kilokalorie (kcal)", labelEn: "kilocalorie (kcal)", toBase: 4184 },
    { id: "Wh", labelDa: "watt-time (Wh)", labelEn: "watt-hour (Wh)", toBase: 3600 },
    { id: "kWh", labelDa: "kilowatt-time (kWh)", labelEn: "kilowatt-hour (kWh)", toBase: 3.6e6 },
  ],
  pressure: [
    { id: "Pa", labelDa: "pascal (Pa)", labelEn: "pascal (Pa)", toBase: 1 },
    { id: "kPa", labelDa: "kilopascal (kPa)", labelEn: "kilopascal (kPa)", toBase: 1000 },
    { id: "bar", labelDa: "bar", labelEn: "bar", toBase: 1e5 },
    { id: "atm", labelDa: "atmosfære (atm)", labelEn: "atmosphere (atm)", toBase: 101325 },
    { id: "mmHg", labelDa: "mmHg", labelEn: "mmHg", toBase: 133.322 },
    { id: "psi", labelDa: "psi", labelEn: "psi", toBase: 6894.76 },
  ],
  speed: [
    { id: "mps", labelDa: "m/s", labelEn: "m/s", toBase: 1 },
    { id: "kmh", labelDa: "km/t", labelEn: "km/h", toBase: 1000 / 3600 },
    { id: "mph", labelDa: "mph", labelEn: "mph", toBase: 1609.344 / 3600 },
    { id: "knot", labelDa: "knob", labelEn: "knot", toBase: 1852 / 3600 },
  ],
};

function tempToKelvin(value: number, unit: string): number | null {
  if (unit === "K") return value;
  if (unit === "C") return value + 273.15;
  if (unit === "F") return ((value - 32) * 5) / 9 + 273.15;
  return null;
}

function kelvinToTemp(k: number, unit: string): number | null {
  if (unit === "K") return k;
  if (unit === "C") return k - 273.15;
  if (unit === "F") return ((k - 273.15) * 9) / 5 + 32;
  return null;
}

export function convertValue(
  category: UnitCategory,
  value: number,
  fromId: string,
  toId: string,
): number | null {
  if (!Number.isFinite(value)) return null;
  if (category === "temp") {
    const k = tempToKelvin(value, fromId);
    if (k == null) return null;
    return kelvinToTemp(k, toId);
  }
  const from = UNITS[category].find((u) => u.id === fromId);
  const to = UNITS[category].find((u) => u.id === toId);
  if (!from || !to) return null;
  const base = value * from.toBase;
  return base / to.toBase;
}

export function formatNum(n: number, da: boolean): string {
  if (!Number.isFinite(n)) return "?";
  const abs = Math.abs(n);
  const opts: Intl.NumberFormatOptions =
    abs !== 0 && (abs < 1e-3 || abs >= 1e6)
      ? { maximumSignificantDigits: 6, notation: "scientific" }
      : { maximumSignificantDigits: 8 };
  return n.toLocaleString(da ? "da-DK" : "en-US", opts);
}
