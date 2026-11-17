import { describe, expect, it } from "vitest";
import { convertToAll, convertUnits } from "./calc";

describe("length", () => {
  it("converts metric lengths", () => {
    expect(convertUnits("length", 1, "km", "m")).toBeCloseTo(1000, 9);
    expect(convertUnits("length", 250, "cm", "m")).toBeCloseTo(2.5, 9);
  });

  it("converts imperial lengths", () => {
    expect(convertUnits("length", 1, "in", "cm")).toBeCloseTo(2.54, 9);
    expect(convertUnits("length", 1, "mi", "km")).toBeCloseTo(1.609344, 9);
    expect(convertUnits("length", 3, "ft", "yd")).toBeCloseTo(1, 9);
  });
});

describe("area", () => {
  it("converts hectares and square kilometres", () => {
    expect(convertUnits("area", 1, "ha", "m2")).toBeCloseTo(10_000, 6);
    expect(convertUnits("area", 1, "km2", "ha")).toBeCloseTo(100, 6);
  });

  it("converts acres to square metres", () => {
    expect(convertUnits("area", 1, "acre", "m2")).toBeCloseTo(4046.856, 2);
  });

  it("converts the Danish tønde land", () => {
    expect(convertUnits("area", 1, "tdl", "m2")).toBeCloseTo(5516.2, 6);
  });
});

describe("speed", () => {
  it("converts km/h and m/s", () => {
    expect(convertUnits("speed", 36, "kmh", "ms")).toBeCloseTo(10, 9);
    expect(convertUnits("speed", 10, "ms", "kmh")).toBeCloseTo(36, 9);
  });

  it("converts mph and knots to km/h", () => {
    expect(convertUnits("speed", 60, "mph", "kmh")).toBeCloseTo(96.56, 2);
    expect(convertUnits("speed", 1, "kn", "kmh")).toBeCloseTo(1.852, 3);
  });
});

describe("cooking", () => {
  it("uses 5 ml teaspoons and 15 ml tablespoons", () => {
    expect(convertUnits("cooking", 1, "tbsp", "tsp")).toBeCloseTo(3, 9);
    expect(convertUnits("cooking", 2, "tsp", "ml")).toBeCloseTo(10, 9);
  });

  it("converts decilitres and litres", () => {
    expect(convertUnits("cooking", 1, "dl", "ml")).toBeCloseTo(100, 9);
    expect(convertUnits("cooking", 1, "l", "dl")).toBeCloseTo(10, 9);
  });

  it("converts a US cup to decilitres", () => {
    expect(convertUnits("cooking", 1, "cup", "dl")).toBeCloseTo(2.366, 3);
  });
});

describe("other categories and edge cases", () => {
  it("converts temperature", () => {
    expect(convertUnits("temperature", 100, "c", "f")).toBeCloseTo(212, 9);
    expect(convertUnits("temperature", 0, "c", "k")).toBeCloseTo(273.15, 9);
    expect(convertUnits("temperature", -40, "f", "c")).toBeCloseTo(-40, 9);
  });

  it("separates decimal and binary data units", () => {
    expect(convertUnits("data", 1, "kb", "b")).toBe(1000);
    expect(convertUnits("data", 1, "kib", "b")).toBe(1024);
  });

  it("returns null for unknown units or invalid numbers", () => {
    expect(convertUnits("length", 1, "m", "nope")).toBeNull();
    expect(convertUnits("length", Number.NaN, "m", "km")).toBeNull();
    expect(convertUnits("temperature", 1, "x", "c")).toBeNull();
  });

  it("lists every other unit and skips the source unit", () => {
    const all = convertToAll("speed", 36, "kmh");
    expect(all.map((row) => row.id)).toEqual(["ms", "mph", "kn"]);
    expect(all[0]!.value).toBeCloseTo(10, 9);
  });
});
