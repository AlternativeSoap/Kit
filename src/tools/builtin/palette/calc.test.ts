import { describe, expect, it } from "vitest";
import { buildPalette } from "./calc";

describe("palette calc", () => {
  it("builds an analogous palette from a seed", () => {
    const palette = buildPalette("#4a5c3f", "analogous");
    expect(palette?.length).toBeGreaterThanOrEqual(3);
    expect(palette?.some((s) => s.labelEn === "Seed")).toBe(true);
  });

  it("rejects invalid hex", () => {
    expect(buildPalette("not-a-color", "triadic")).toBeNull();
  });
});
