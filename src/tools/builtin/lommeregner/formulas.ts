/**
 * Locked formula templates for Advanced calculator mode.
 * Curated from high-use calculator topics: percent, interest, BMI,
 * area/volume, distance/speed, roots/powers, and right triangles.
 */

export type FormulaId =
  | "percentOf"
  | "percentChange"
  | "fraction"
  | "compoundInterest"
  | "simpleInterest"
  | "bmi"
  | "circleArea"
  | "rectangleArea"
  | "triangleArea"
  | "boxVolume"
  | "speed"
  | "proportion"
  | "pythagoras"
  | "power"
  | "sqrt";

export type FormulaNode =
  | { type: "slot"; id: string }
  | { type: "text"; value: string }
  | { type: "frac"; num: FormulaNode[]; den: FormulaNode[] }
  | { type: "sqrt"; body: FormulaNode[] }
  | { type: "sup"; base: FormulaNode[]; exp: FormulaNode[] }
  | { type: "group"; items: FormulaNode[]; paren?: boolean }
  | { type: "pm" };

export type FormulaResult =
  | { ok: true; primary: number; secondary?: number; detail?: string }
  | { ok: false; reason: "incomplete" | "invalid" | "domain" };

export type FormulaDefinition = {
  id: FormulaId;
  /** Slot order for ← → navigation. */
  slots: readonly string[];
  layout: FormulaNode[];
  /** Prefer compact type for denser layouts. */
  density?: "comfortable" | "compact";
  evaluate: (values: Record<string, number>) => FormulaResult;
};

function slot(id: string): FormulaNode {
  return { type: "slot", id };
}

function text(value: string): FormulaNode {
  return { type: "text", value };
}

function frac(num: FormulaNode[], den: FormulaNode[]): FormulaNode {
  return { type: "frac", num, den };
}

function sqrt(body: FormulaNode[]): FormulaNode {
  return { type: "sqrt", body };
}

function sup(base: FormulaNode[], exp: FormulaNode[]): FormulaNode {
  return { type: "sup", base, exp };
}

function group(items: FormulaNode[], paren = false): FormulaNode {
  return { type: "group", items, paren };
}

function requireSlots(
  values: Record<string, number>,
  ids: readonly string[],
): Record<string, number> | null {
  const out: Record<string, number> = {};
  for (const id of ids) {
    const value = values[id];
    if (value === undefined) return null;
    out[id] = value;
  }
  return out;
}

function asRate(raw: number): number {
  // 5 means 5%, 0.05 stays 0.05.
  return raw > 1 ? raw / 100 : raw;
}

export const FORMULAS: FormulaDefinition[] = [
  {
    id: "percentOf",
    slots: ["p", "a"],
    layout: [frac([slot("p")], [text("100")]), text(" × "), slot("a")],
    evaluate: (values) => {
      const v = requireSlots(values, ["p", "a"]);
      if (!v) return { ok: false, reason: "incomplete" };
      return { ok: true, primary: (v.p! / 100) * v.a! };
    },
  },
  {
    id: "percentChange",
    slots: ["a", "b"],
    density: "compact",
    layout: [
      frac([group([slot("b"), text(" − "), slot("a")], true)], [slot("a")]),
      text(" × 100"),
    ],
    evaluate: (values) => {
      const v = requireSlots(values, ["a", "b"]);
      if (!v) return { ok: false, reason: "incomplete" };
      if (v.a === 0) return { ok: false, reason: "domain" };
      return { ok: true, primary: ((v.b! - v.a!) / v.a!) * 100 };
    },
  },
  {
    id: "fraction",
    slots: ["a", "b"],
    layout: [frac([slot("a")], [slot("b")])],
    evaluate: (values) => {
      const v = requireSlots(values, ["a", "b"]);
      if (!v) return { ok: false, reason: "incomplete" };
      if (v.b === 0) return { ok: false, reason: "domain" };
      return { ok: true, primary: v.a! / v.b! };
    },
  },
  {
    id: "compoundInterest",
    slots: ["P", "r", "t"],
    layout: [
      slot("P"),
      text(" × "),
      sup([group([text("1 + "), slot("r")], true)], [slot("t")]),
    ],
    evaluate: (values) => {
      const v = requireSlots(values, ["P", "r", "t"]);
      if (!v) return { ok: false, reason: "incomplete" };
      if (v.t! < 0) return { ok: false, reason: "domain" };
      const primary = v.P! * (1 + asRate(v.r!)) ** v.t!;
      if (!Number.isFinite(primary)) return { ok: false, reason: "domain" };
      return { ok: true, primary };
    },
  },
  {
    id: "simpleInterest",
    slots: ["P", "r", "t"],
    layout: [slot("P"), text(" × "), slot("r"), text(" × "), slot("t")],
    evaluate: (values) => {
      const v = requireSlots(values, ["P", "r", "t"]);
      if (!v) return { ok: false, reason: "incomplete" };
      if (v.t! < 0) return { ok: false, reason: "domain" };
      return { ok: true, primary: v.P! * asRate(v.r!) * v.t! };
    },
  },
  {
    id: "bmi",
    slots: ["w", "h"],
    layout: [frac([slot("w")], [sup([slot("h")], [text("2")])])],
    evaluate: (values) => {
      const v = requireSlots(values, ["w", "h"]);
      if (!v) return { ok: false, reason: "incomplete" };
      let h = v.h!;
      if (h > 3) h = h / 100;
      if (h <= 0 || v.w! <= 0) return { ok: false, reason: "domain" };
      return { ok: true, primary: v.w! / (h * h) };
    },
  },
  {
    id: "circleArea",
    slots: ["r"],
    layout: [text("π × "), sup([slot("r")], [text("2")])],
    evaluate: (values) => {
      const v = requireSlots(values, ["r"]);
      if (!v) return { ok: false, reason: "incomplete" };
      if (v.r! < 0) return { ok: false, reason: "domain" };
      return { ok: true, primary: Math.PI * v.r! * v.r! };
    },
  },
  {
    id: "rectangleArea",
    slots: ["l", "w"],
    layout: [slot("l"), text(" × "), slot("w")],
    evaluate: (values) => {
      const v = requireSlots(values, ["l", "w"]);
      if (!v) return { ok: false, reason: "incomplete" };
      if (v.l! < 0 || v.w! < 0) return { ok: false, reason: "domain" };
      return { ok: true, primary: v.l! * v.w! };
    },
  },
  {
    id: "triangleArea",
    slots: ["b", "h"],
    layout: [frac([slot("b"), text(" × "), slot("h")], [text("2")])],
    evaluate: (values) => {
      const v = requireSlots(values, ["b", "h"]);
      if (!v) return { ok: false, reason: "incomplete" };
      if (v.b! < 0 || v.h! < 0) return { ok: false, reason: "domain" };
      return { ok: true, primary: (v.b! * v.h!) / 2 };
    },
  },
  {
    id: "boxVolume",
    slots: ["l", "w", "h"],
    layout: [slot("l"), text(" × "), slot("w"), text(" × "), slot("h")],
    evaluate: (values) => {
      const v = requireSlots(values, ["l", "w", "h"]);
      if (!v) return { ok: false, reason: "incomplete" };
      if (v.l! < 0 || v.w! < 0 || v.h! < 0) {
        return { ok: false, reason: "domain" };
      }
      return { ok: true, primary: v.l! * v.w! * v.h! };
    },
  },
  {
    id: "speed",
    slots: ["d", "t"],
    layout: [frac([slot("d")], [slot("t")])],
    evaluate: (values) => {
      const v = requireSlots(values, ["d", "t"]);
      if (!v) return { ok: false, reason: "incomplete" };
      if (v.t === 0) return { ok: false, reason: "domain" };
      return { ok: true, primary: v.d! / v.t! };
    },
  },
  {
    id: "proportion",
    slots: ["a", "b", "c"],
    layout: [
      frac([slot("a")], [slot("b")]),
      text(" = "),
      frac([slot("c")], [text("x")]),
    ],
    evaluate: (values) => {
      const v = requireSlots(values, ["a", "b", "c"]);
      if (!v) return { ok: false, reason: "incomplete" };
      if (v.a === 0) return { ok: false, reason: "domain" };
      return { ok: true, primary: (v.b! * v.c!) / v.a! };
    },
  },
  {
    id: "pythagoras",
    slots: ["a", "b"],
    layout: [
      sqrt([
        group([
          sup([slot("a")], [text("2")]),
          text(" + "),
          sup([slot("b")], [text("2")]),
        ]),
      ]),
    ],
    evaluate: (values) => {
      const v = requireSlots(values, ["a", "b"]);
      if (!v) return { ok: false, reason: "incomplete" };
      return { ok: true, primary: Math.hypot(v.a!, v.b!) };
    },
  },
  {
    id: "power",
    slots: ["a", "b"],
    layout: [sup([slot("a")], [slot("b")])],
    evaluate: (values) => {
      const v = requireSlots(values, ["a", "b"]);
      if (!v) return { ok: false, reason: "incomplete" };
      const primary = v.a! ** v.b!;
      if (!Number.isFinite(primary) || Math.abs(primary) > Number.MAX_VALUE) {
        return { ok: false, reason: "domain" };
      }
      return { ok: true, primary };
    },
  },
  {
    id: "sqrt",
    slots: ["a"],
    layout: [sqrt([slot("a")])],
    evaluate: (values) => {
      const v = requireSlots(values, ["a"]);
      if (!v) return { ok: false, reason: "incomplete" };
      if (v.a! < 0) return { ok: false, reason: "domain" };
      return { ok: true, primary: Math.sqrt(v.a!) };
    },
  },
];

export function getFormula(id: string): FormulaDefinition | undefined {
  return FORMULAS.find((item) => item.id === id);
}

export const FORMULA_IDS = FORMULAS.map((item) => item.id);

/** Parse a slot string typed by the user into a finite number. */
export function parseSlotValue(raw: string, locale: "en" | "da"): number | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "-" || trimmed === "." || trimmed === ",") {
    return null;
  }
  const normalized =
    locale === "da"
      ? trimmed.replace(/\./g, "").replace(",", ".")
      : trimmed.replace(/,/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}
