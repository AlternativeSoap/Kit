export type GateKind = "AND" | "OR" | "NOT" | "XOR" | "NAND";
export type PresetId = "custom2" | "halfAdder" | "equality";

export function evalGate(kind: GateKind, a: boolean, b: boolean): boolean {
  switch (kind) {
    case "AND":
      return a && b;
    case "OR":
      return a || b;
    case "NOT":
      return !a;
    case "XOR":
      return a !== b;
    case "NAND":
      return !(a && b);
  }
}

export type CircuitResult = {
  outputs: { id: string; labelDa: string; labelEn: string; value: boolean }[];
  wires: { id: string; on: boolean }[];
};

export function runPreset(
  preset: PresetId,
  inputs: { a: boolean; b: boolean; c?: boolean },
  customGate: GateKind,
): CircuitResult {
  const { a, b } = inputs;

  if (preset === "custom2") {
    const out =
      customGate === "NOT" ? evalGate("NOT", a, false) : evalGate(customGate, a, b);
    return {
      outputs: [
        {
          id: "y",
          labelDa: "Y",
          labelEn: "Y",
          value: out,
        },
      ],
      wires: [
        { id: "a", on: a },
        { id: "b", on: customGate !== "NOT" && b },
        { id: "y", on: out },
      ],
    };
  }

  if (preset === "equality") {
    const eq = a === b;
    return {
      outputs: [
        {
          id: "eq",
          labelDa: "A = B",
          labelEn: "A = B",
          value: eq,
        },
      ],
      wires: [
        { id: "a", on: a },
        { id: "b", on: b },
        { id: "eq", on: eq },
      ],
    };
  }

  // Half-adder: Sum = A XOR B, Carry = A AND B
  const sum = a !== b;
  const carry = a && b;
  return {
    outputs: [
      { id: "sum", labelDa: "Sum (S)", labelEn: "Sum (S)", value: sum },
      { id: "carry", labelDa: "Carry (C)", labelEn: "Carry (C)", value: carry },
    ],
    wires: [
      { id: "a", on: a },
      { id: "b", on: b },
      { id: "sum", on: sum },
      { id: "carry", on: carry },
    ],
  };
}

export type TruthRow = {
  a: boolean;
  b: boolean;
  values: boolean[];
};

export function truthTable(
  preset: PresetId,
  customGate: GateKind,
): { headers: string[]; rows: TruthRow[] } {
  const rows: TruthRow[] = [];
  const headers =
    preset === "halfAdder"
      ? ["A", "B", "S", "C"]
      : preset === "equality"
        ? ["A", "B", "EQ"]
        : customGate === "NOT"
          ? ["A", "Y"]
          : ["A", "B", "Y"];

  const combos =
    preset === "custom2" && customGate === "NOT"
      ? [
          { a: false, b: false },
          { a: true, b: false },
        ]
      : [
          { a: false, b: false },
          { a: false, b: true },
          { a: true, b: false },
          { a: true, b: true },
        ];

  for (const c of combos) {
    const r = runPreset(preset, c, customGate);
    rows.push({
      a: c.a,
      b: c.b,
      values: r.outputs.map((o) => o.value),
    });
  }

  return { headers, rows };
}

export function bit(v: boolean): string {
  return v ? "1" : "0";
}
