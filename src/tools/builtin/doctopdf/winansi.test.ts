import { describe, expect, it } from "vitest";
import { toWinAnsiSafe } from "./winansi";

describe("toWinAnsiSafe", () => {
  it("leaves plain ASCII untouched", () => {
    expect(toWinAnsiSafe("Hello, world 123")).toEqual({
      text: "Hello, world 123",
      dropped: false,
    });
  });

  it("expands tabs to four spaces", () => {
    expect(toWinAnsiSafe("a\tb")).toEqual({ text: "a    b", dropped: false });
  });

  it("keeps Latin-1 letters used in Danish text", () => {
    const text = "Blåbærgrød på ø, Ærø og café ÿ";
    expect(toWinAnsiSafe(text)).toEqual({ text, dropped: false });
  });

  it("keeps newlines and carriage returns", () => {
    expect(toWinAnsiSafe("a\r\nb\nc")).toEqual({
      text: "a\r\nb\nc",
      dropped: false,
    });
  });

  it("keeps smart quotes, dashes, ellipsis, and the euro sign", () => {
    const text = "\u201Cquote\u201D \u2018x\u2019 \u2013 \u2014 \u2026 \u20AC \u2022";
    expect(toWinAnsiSafe(text)).toEqual({ text, dropped: false });
  });

  it("replaces an emoji with a single question mark", () => {
    expect(toWinAnsiSafe("hi \u{1F600}!")).toEqual({
      text: "hi ?!",
      dropped: true,
    });
  });

  it("replaces characters outside WinAnsi", () => {
    expect(toWinAnsiSafe("\u4F60\u597D")).toEqual({ text: "??", dropped: true });
    expect(toWinAnsiSafe("\u0100").dropped).toBe(true);
  });

  it("replaces control characters other than line breaks", () => {
    expect(toWinAnsiSafe("a\u0001b")).toEqual({ text: "a?b", dropped: true });
  });

  it("reports no dropped characters for an empty string", () => {
    expect(toWinAnsiSafe("")).toEqual({ text: "", dropped: false });
  });
});
