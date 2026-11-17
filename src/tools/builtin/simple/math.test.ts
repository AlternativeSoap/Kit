import { describe, expect, it } from "vitest";
import { getSimpleDef, type SimpleResultRow } from "./defs";

function run(id: string, values: Record<string, string>): SimpleResultRow[] {
  const def = getSimpleDef(id);
  if (!def) throw new Error(`Missing simple tool ${id}`);
  const rows = def.compute(values);
  if (!rows) throw new Error(`No result for ${id}`);
  return rows;
}

function row(rows: SimpleResultRow[], labelEn: string): string {
  const found = rows.find((r) => r.labelEn === labelEn);
  if (!found) throw new Error(`Missing row ${labelEn}`);
  return found.value;
}

describe("promille", () => {
  const base = { drinks: "2", weight: "75", sex: "male", hours: "0" };

  it("estimates a plausible value from the Widmark formula", () => {
    const rows = run("promille", base);
    // 24 g / (75 kg * 0.68) = 0.47
    expect(Number(row(rows, "Estimated BAC (‰)"))).toBeCloseTo(0.47, 2);
    expect(row(rows, "Alcohol intake")).toBe("24 g");
  });

  it("clamps the result at zero once the alcohol has cleared", () => {
    const rows = run("promille", { ...base, hours: "24" });
    expect(row(rows, "Estimated BAC (‰)")).toBe("0");
  });

  it("returns zero for no drinks", () => {
    const rows = run("promille", { ...base, drinks: "0" });
    expect(row(rows, "Estimated BAC (‰)")).toBe("0");
  });

  it("gives a higher estimate for the lower body water constant", () => {
    const male = Number(
      row(run("promille", base), "Estimated BAC (‰)"),
    );
    const female = Number(
      row(run("promille", { ...base, sex: "female" }), "Estimated BAC (‰)"),
    );
    expect(female).toBeGreaterThan(male);
  });

  it("rejects invalid inputs", () => {
    const def = getSimpleDef("promille")!;
    expect(def.compute({ ...base, weight: "0" })).toBeNull();
    expect(def.compute({ ...base, drinks: "-1" })).toBeNull();
    expect(def.compute({ ...base, hours: "-2" })).toBeNull();
  });
});

describe("shoesize", () => {
  it("bridges adult sizes through EU", () => {
    const rows = run("shoesize", { size: "42", system: "eu" });
    expect(row(rows, "EU")).toBe("42");
    expect(row(rows, "UK")).toBe("8");
    expect(row(rows, "US men")).toBe("9");
    expect(row(rows, "US women")).toBe("10.5");
  });

  it.each([
    ["uk", "8"],
    ["usm", "9"],
    ["usw", "10.5"],
    ["usk", "23"],
  ])("converts %s back to EU 42", (system, size) => {
    const rows = run("shoesize", { size, system });
    expect(row(rows, "EU")).toBe("42");
  });

  it("returns null for unknown systems or bad sizes", () => {
    const def = getSimpleDef("shoesize")!;
    expect(def.compute({ size: "42", system: "xx" })).toBeNull();
    expect(def.compute({ size: "0", system: "eu" })).toBeNull();
    expect(def.compute({ size: "", system: "eu" })).toBeNull();
  });
});

describe("invoicesplit", () => {
  it("splits evenly when the total divides cleanly", () => {
    const rows = run("invoicesplit", { total: "1200", people: "3" });
    expect(row(rows, "Per person")).toBe("400.00");
    expect(row(rows, "Sum of all shares")).toBe("1200.00");
  });

  it("hands out the spare cent so shares add up to the total", () => {
    const rows = run("invoicesplit", { total: "100", people: "3" });
    const shares = rows.filter((r) => r.labelEn !== "Sum of all shares");
    expect(shares.map((r) => r.value)).toEqual(["33.34", "33.33"]);
    expect(row(rows, "Sum of all shares")).toBe("100.00");
  });

  it.each([
    ["100", "7"],
    ["0.10", "3"],
    ["19.99", "4"],
    ["1", "100"],
  ])("keeps the sum equal to the total for %s split %s ways", (total, people) => {
    const rows = run("invoicesplit", { total, people });
    expect(row(rows, "Sum of all shares")).toBe(Number(total).toFixed(2));
  });

  it("rejects missing totals and impossible people counts", () => {
    const def = getSimpleDef("invoicesplit")!;
    expect(def.compute({ total: "100", people: "0" })).toBeNull();
    expect(def.compute({ total: "-5", people: "2" })).toBeNull();
    expect(def.compute({ total: "", people: "2" })).toBeNull();
    expect(def.compute({ total: "100", people: "100001" })).toBeNull();
  });
});
