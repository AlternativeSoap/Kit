import { describe, expect, it } from "vitest";
import { parseColor } from "./color";
import { parseEmail } from "./email";
import { parseJson } from "./json";
import { parseAnswer } from "./parse";
import { parseTimestamp } from "./timestamp";
import { parseUrl } from "./url";
import { parseUuid } from "./uuid";

describe("literal parsers", () => {
  it("parses https URLs", () => {
    const result = parseUrl("https://example.com/path");
    expect(result?.kind).toBe("url");
    expect(result?.host).toBe("example.com");
  });

  it("parses hex and rgb colors", () => {
    expect(parseColor("#6b705c")?.hex).toBe("#6b705c");
    expect(parseColor("rgb(107,112,92)")?.hex).toBe("#6b705c");
  });

  it("validates JSON", () => {
    expect(parseJson('{"name":"KIT"}')?.valid).toBe(true);
    expect(parseJson("{bad")?.valid).toBe(false);
  });

  it("parses unix timestamps", () => {
    expect(parseTimestamp("1700000000")?.unit).toBe("s");
    expect(parseTimestamp("unix 1700000000000")?.unit).toBe("ms");
  });

  it("parses UUIDs and emails", () => {
    expect(
      parseUuid("550e8400-e29b-41d4-a716-446655440000")?.version,
    ).toBe(4);
    expect(parseEmail("hello@example.com")?.domain).toBe("example.com");
  });

  it("does not hijack tool names", () => {
    const now = new Date(2026, 10, 14);
    expect(parseAnswer("moms", "en", now)).toBeNull();
    expect(parseAnswer("json", "en", now)).toBeNull();
    expect(parseAnswer("qr", "en", now)).toBeNull();
  });

  it("wires literals through parseAnswer", () => {
    const now = new Date(2026, 10, 14);
    expect(parseAnswer("#fff", "en", now)?.kind).toBe("color");
    expect(parseAnswer("hello@example.com", "en", now)?.kind).toBe("email");
    expect(parseAnswer("https://kit.example", "en", now)?.kind).toBe("url");
  });
});
