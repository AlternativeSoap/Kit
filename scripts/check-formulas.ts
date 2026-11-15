/**
 * Advanced calculator formula checks.
 * Run: npx tsx --tsconfig tsconfig.json scripts/check-formulas.ts
 */
import { getFormula } from "../src/tools/builtin/lommeregner/formulas";

let failed = 0;

function expectOk(
  id: string,
  values: Record<string, number>,
  check: (primary: number) => boolean,
) {
  const formula = getFormula(id);
  if (!formula) {
    console.error(`FAIL missing formula ${id}`);
    failed += 1;
    return;
  }
  const result = formula.evaluate(values);
  if (!result.ok) {
    console.error(`FAIL ${id}`, values, result);
    failed += 1;
    return;
  }
  if (!check(result.primary)) {
    console.error(`FAIL ${id} value`, result.primary);
    failed += 1;
  }
}

expectOk("percentOf", { p: 25, a: 200 }, (v) => Math.abs(v - 50) < 1e-9);
expectOk("percentChange", { a: 80, b: 100 }, (v) => Math.abs(v - 25) < 1e-9);
expectOk("fraction", { a: 3, b: 4 }, (v) => Math.abs(v - 0.75) < 1e-9);
expectOk("compoundInterest", { P: 1000, r: 5, t: 2 }, (v) =>
  Math.abs(v - 1102.5) < 1e-9,
);
expectOk("simpleInterest", { P: 1000, r: 0.05, t: 2 }, (v) =>
  Math.abs(v - 100) < 1e-9,
);
expectOk("bmi", { w: 81, h: 180 }, (v) => Math.abs(v - 25) < 0.05);
expectOk("circleArea", { r: 2 }, (v) => Math.abs(v - Math.PI * 4) < 1e-9);
expectOk("rectangleArea", { l: 3, w: 4 }, (v) => v === 12);
expectOk("triangleArea", { b: 4, h: 3 }, (v) => v === 6);
expectOk("boxVolume", { l: 2, w: 3, h: 4 }, (v) => v === 24);
expectOk("speed", { d: 120, t: 2 }, (v) => v === 60);
expectOk("proportion", { a: 2, b: 3, c: 4 }, (v) => v === 6);
expectOk("pythagoras", { a: 3, b: 4 }, (v) => Math.abs(v - 5) < 1e-9);
expectOk("power", { a: 2, b: 10 }, (v) => v === 1024);
expectOk("sqrt", { a: 9 }, (v) => v === 3);

const domain = getFormula("sqrt")!.evaluate({ a: -1 });
if (domain.ok || domain.reason !== "domain") {
  console.error("FAIL sqrt domain", domain);
  failed += 1;
}

if (failed === 0) {
  console.log("formula checks passed");
  process.exit(0);
}

console.error(`${failed} formula checks failed`);
process.exit(1);
