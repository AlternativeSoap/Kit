export type CompKind = "battery" | "resistor" | "led" | "switch";

export type SeriesComp = {
  id: string;
  kind: CompKind;
  /** Battery voltage (V), resistor ohms, LED forward V, switch unused */
  value: number;
  /** Switch closed = true */
  closed?: boolean;
};

export const LED_SAFE_MA = 20;
export const LED_DEFAULT_VF = 2.0;

export function fmtOhm(n: number): string {
  if (!Number.isFinite(n)) return "-";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")} MΩ`;
  if (n >= 1000) return `${(n / 1000).toFixed(2).replace(/\.?0+$/, "")} kΩ`;
  return `${n.toFixed(n >= 100 ? 0 : 1).replace(/\.0$/, "")} Ω`;
}

export function fmtV(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return `${n.toFixed(Math.abs(n) >= 10 ? 1 : 2).replace(/\.?0+$/, "")} V`;
}

export function fmtA(n: number): string {
  if (!Number.isFinite(n)) return "-";
  if (Math.abs(n) < 0.001) return `${(n * 1_000_000).toFixed(1)} µA`;
  if (Math.abs(n) < 1) return `${(n * 1000).toFixed(2).replace(/\.?0+$/, "")} mA`;
  return `${n.toFixed(3)} A`;
}

export function fmtW(n: number): string {
  if (!Number.isFinite(n)) return "-";
  if (Math.abs(n) < 0.001) return `${(n * 1000).toFixed(2)} mW`;
  return `${n.toFixed(3).replace(/\.?0+$/, "")} W`;
}

export type CircuitAnalysis = {
  open: boolean;
  supplyV: number;
  totalR: number;
  /** Effective voltage across resistive network after LED drops */
  resistiveV: number;
  current: number;
  ledWarn: boolean;
  drops: {
    id: string;
    kind: CompKind;
    label: string;
    voltage: number;
    power: number;
  }[];
};

export function analyzeSeries(comps: SeriesComp[]): CircuitAnalysis {
  const switches = comps.filter((c) => c.kind === "switch");
  const open = switches.some((s) => !s.closed);
  const batteries = comps.filter((c) => c.kind === "battery");
  const supplyV = batteries.reduce((s, b) => s + Math.max(0, b.value), 0);
  const resistors = comps.filter((c) => c.kind === "resistor");
  const leds = comps.filter((c) => c.kind === "led");
  const totalR = resistors.reduce((s, r) => s + Math.max(0, r.value), 0);
  const ledDrop = leds.reduce((s, l) => s + Math.max(0, l.value), 0);

  if (open || supplyV <= 0) {
    return {
      open,
      supplyV,
      totalR,
      resistiveV: 0,
      current: 0,
      ledWarn: false,
      drops: comps.map((c) => ({
        id: c.id,
        kind: c.kind,
        label: c.kind,
        voltage: 0,
        power: 0,
      })),
    };
  }

  const resistiveV = Math.max(0, supplyV - ledDrop);
  let current = 0;
  if (totalR > 0) {
    current = resistiveV / totalR;
  } else if (leds.length > 0 && supplyV > ledDrop) {
    // No series resistor: treat as unbounded / dangerous
    current = Infinity;
  } else if (leds.length > 0 && supplyV <= ledDrop) {
    current = 0;
  } else {
    current = Infinity;
  }

  const finiteI = Number.isFinite(current) ? current : 0;
  const drops = comps.map((c) => {
    if (c.kind === "battery") {
      return { id: c.id, kind: c.kind, label: "V", voltage: c.value, power: 0 };
    }
    if (c.kind === "switch") {
      return { id: c.id, kind: c.kind, label: "SW", voltage: 0, power: 0 };
    }
    if (c.kind === "led") {
      const v = finiteI > 0 ? c.value : 0;
      return {
        id: c.id,
        kind: c.kind,
        label: "LED",
        voltage: v,
        power: v * finiteI,
      };
    }
    const v = finiteI * c.value;
    return {
      id: c.id,
      kind: c.kind,
      label: "R",
      voltage: v,
      power: v * finiteI,
    };
  });

  const ledMa = Number.isFinite(current) ? current * 1000 : Infinity;
  const ledWarn =
    leds.length > 0 && (ledMa > LED_SAFE_MA || !Number.isFinite(current));

  return {
    open: false,
    supplyV,
    totalR,
    resistiveV,
    current,
    ledWarn,
    drops,
  };
}

/** Resistor color-code bands (0-9) + multipliers + tolerances */
export const COLOR_BANDS = [
  { id: "black", dig: 0, mult: 1, tol: null as number | null, hex: "#1a1a1a" },
  { id: "brown", dig: 1, mult: 10, tol: 1, hex: "#8B4513" },
  { id: "red", dig: 2, mult: 100, tol: 2, hex: "#c62828" },
  { id: "orange", dig: 3, mult: 1_000, tol: null, hex: "#ef6c00" },
  { id: "yellow", dig: 4, mult: 10_000, tol: null, hex: "#f9a825" },
  { id: "green", dig: 5, mult: 100_000, tol: 0.5, hex: "#2e7d32" },
  { id: "blue", dig: 6, mult: 1_000_000, tol: 0.25, hex: "#1565c0" },
  { id: "violet", dig: 7, mult: 10_000_000, tol: 0.1, hex: "#6a1b9a" },
  { id: "grey", dig: 8, mult: 100_000_000, tol: 0.05, hex: "#78909c" },
  { id: "white", dig: 9, mult: 1_000_000_000, tol: null, hex: "#eceff1" },
  { id: "gold", dig: null, mult: 0.1, tol: 5, hex: "#c9a227" },
  { id: "silver", dig: null, mult: 0.01, tol: 10, hex: "#b0bec5" },
] as const;

export type ColorId = (typeof COLOR_BANDS)[number]["id"];

export function decodeResistor(
  b1: ColorId,
  b2: ColorId,
  mult: ColorId,
  tol: ColorId,
): { ohms: number; tolerance: number | null } | null {
  const c1 = COLOR_BANDS.find((c) => c.id === b1);
  const c2 = COLOR_BANDS.find((c) => c.id === b2);
  const cm = COLOR_BANDS.find((c) => c.id === mult);
  const ct = COLOR_BANDS.find((c) => c.id === tol);
  if (!c1 || !c2 || !cm || c1.dig == null || c2.dig == null) return null;
  const ohms = (c1.dig * 10 + c2.dig) * cm.mult;
  return { ohms, tolerance: ct?.tol ?? null };
}

let _uid = 0;
export function uid(prefix: string): string {
  _uid += 1;
  return `${prefix}-${_uid}`;
}
