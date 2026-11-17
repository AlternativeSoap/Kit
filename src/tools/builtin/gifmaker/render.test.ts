import { describe, expect, it } from "vitest";
import { easeFade } from "./render";

describe("easeFade", () => {
  it("stays within 0–1 and eases the middle", () => {
    expect(easeFade(0)).toBe(0);
    expect(easeFade(1)).toBe(1);
    expect(easeFade(0.5)).toBe(0.5);
    expect(easeFade(0.25)).toBeLessThan(0.25);
    expect(easeFade(0.75)).toBeGreaterThan(0.75);
  });
});
