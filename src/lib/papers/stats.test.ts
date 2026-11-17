import { describe, expect, it } from "vitest";
import { computeDocStats, htmlToVisibleText } from "./stats";

describe("papers stats", () => {
  it("counts words, spaces, and anslag", () => {
    const html = "<p>Hej verden, test.</p>";
    const text = htmlToVisibleText(html);
    expect(text).toContain("Hej");
    const stats = computeDocStats(html);
    expect(stats.words).toBe(3);
    expect(stats.spaces).toBe(2);
    expect(stats.keystrokes).toBe(stats.charsNoSpace);
    expect(stats.keystrokesWithSpaces).toBeGreaterThan(stats.keystrokes);
  });
});
