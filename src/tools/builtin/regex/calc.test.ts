import { describe, expect, it } from "vitest";
import { buildFlags, highlightSegments, testRegex } from "./calc";

describe("regex calc", () => {
  it("finds global matches", () => {
    const result = testRegex("\\d+", "g", "a1 b22");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.matches.map((m) => m.text)).toEqual(["1", "22"]);
  });

  it("reports invalid patterns", () => {
    const result = testRegex("(", "g", "x");
    expect(result.ok).toBe(false);
  });

  it("builds flags and highlights", () => {
    expect(buildFlags({ g: true, i: true })).toBe("gi");
    const segments = highlightSegments("ab12cd", [
      { index: 2, text: "12", groups: [] },
    ]);
    expect(segments).toEqual([
      { text: "ab", hit: false },
      { text: "12", hit: true },
      { text: "cd", hit: false },
    ]);
  });
});
