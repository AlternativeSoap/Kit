import { describe, expect, it } from "vitest";
import {
  contextFromAnswer,
  parseContinuation,
} from "./continuation";

describe("search continuation", () => {
  it("continues percent-of with a new rate", () => {
    const context = contextFromAnswer(
      { kind: "percent", mode: "of", a: 25, b: 4000, value: 1000 },
      "en",
    );
    const next = parseContinuation("what about 30%?", context);
    expect(next?.kind).toBe("percent");
    if (next?.kind === "percent") {
      expect(next.a).toBe(30);
      expect(next.b).toBe(4000);
      expect(next.value).toBe(1200);
    }
  });

  it("continues unit conversion with a new amount", () => {
    const context = contextFromAnswer(
      {
        kind: "units",
        category: "length",
        value: 10,
        from: "km",
        to: "mi",
        result: 6.21371192,
      },
      "en",
    );
    const next = parseContinuation("and 25 km?", context);
    expect(next?.kind).toBe("units");
    if (next?.kind === "units") {
      expect(next.value).toBe(25);
      expect(next.from).toBe("km");
      expect(next.to).toBe("mi");
    }
  });

  it("ignores unrelated follow-ups", () => {
    const context = contextFromAnswer(
      { kind: "percent", mode: "of", a: 25, b: 4000, value: 1000 },
      "en",
    );
    expect(parseContinuation("password", context)).toBeNull();
    expect(parseContinuation("moms", context)).toBeNull();
  });
});
