import { describe, expect, it } from "vitest";
import {
  csvToExcelXml,
  detectDelimiter,
  escapeCsv,
  objectsToCsv,
  parseCsv,
  rowsToObjects,
} from "./csv";

describe("detectDelimiter", () => {
  it("prefers commas for plain comma data", () => {
    expect(detectDelimiter("a,b,c\n1,2,3")).toBe(",");
  });

  it("detects semicolons", () => {
    expect(detectDelimiter("a;b;c\n1;2;3")).toBe(";");
  });

  it("detects tabs", () => {
    expect(detectDelimiter("a\tb\tc\n1\t2\t3")).toBe("\t");
  });

  it("ignores delimiters inside quoted fields", () => {
    expect(detectDelimiter('"a,b,c,d";e;f\n"1,2,3,4";5;6')).toBe(";");
  });

  it("falls back to a comma when there is nothing to count", () => {
    expect(detectDelimiter("hello")).toBe(",");
  });
});

describe("parseCsv", () => {
  it("keeps commas that are inside quotes", () => {
    expect(parseCsv('name,note\nAda,"Hello, world"')).toEqual([
      ["name", "note"],
      ["Ada", "Hello, world"],
    ]);
  });

  it("unescapes doubled quotes", () => {
    expect(parseCsv('a,b\n"say ""hi""",x')).toEqual([
      ["a", "b"],
      ['say "hi"', "x"],
    ]);
  });

  it("keeps line breaks inside quoted fields", () => {
    expect(parseCsv('a,b\n"line1\nline2",x')).toEqual([
      ["a", "b"],
      ["line1\nline2", "x"],
    ]);
  });

  it("strips a leading byte order mark", () => {
    const rows = parseCsv("\uFEFFname,age\nAda,36");
    expect(rows[0]![0]).toBe("name");
  });

  it("handles CRLF and lone CR line endings", () => {
    expect(parseCsv("a,b\r\n1,2\r\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
    expect(parseCsv("a,b\r1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("uses the detected delimiter when none is given", () => {
    expect(parseCsv("a;b\n1;2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("honors an explicit delimiter", () => {
    expect(parseCsv("a;b,c\n1;2,3", ",")).toEqual([
      ["a;b", "c"],
      ["1;2", "3"],
    ]);
  });

  it("drops fully blank rows", () => {
    expect(parseCsv("a,b\n\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("rowsToObjects", () => {
  const rows = [
    ["name", "", "age"],
    ["Ada", "x", "36"],
  ];

  it("uses the first row as headers and names blank ones", () => {
    expect(rowsToObjects(rows, true)).toEqual([
      { name: "Ada", col2: "x", age: "36" },
    ]);
  });

  it("generates headers when the first row is data", () => {
    expect(rowsToObjects(rows, false)).toHaveLength(2);
    expect(rowsToObjects(rows, false)[0]).toEqual({
      col1: "name",
      col2: "",
      col3: "age",
    });
  });
});

describe("escapeCsv and export roundtrip", () => {
  it("quotes values only when needed", () => {
    expect(escapeCsv("plain", ",")).toBe("plain");
    expect(escapeCsv("a,b", ",")).toBe('"a,b"');
    expect(escapeCsv("a;b", ",")).toBe("a;b");
    expect(escapeCsv("a;b", ";")).toBe('"a;b"');
    expect(escapeCsv('say "hi"', ",")).toBe('"say ""hi"""');
    expect(escapeCsv("two\nlines", ",")).toBe('"two\nlines"');
  });

  it.each([",", ";", "\t"] as const)(
    "roundtrips awkward values with delimiter %j",
    (delimiter) => {
      const data = [
        { name: "Ada, Countess", note: 'She said "hello"', other: "a;b" },
        { name: "Bob", note: "line1\nline2", other: "tab\there" },
        { name: "", note: "plain", other: "x" },
      ];
      const csv = objectsToCsv(data, delimiter);
      const rows = parseCsv(csv, delimiter);
      expect(rowsToObjects(rows, true)).toEqual(data);
    },
  );

  it("serializes nested values as JSON and fills missing keys", () => {
    const csv = objectsToCsv([{ a: 1, b: { x: 1 } }, { a: 2, c: null }], ",");
    expect(parseCsv(csv, ",")).toEqual([
      ["a", "b", "c"],
      ["1", '{"x":1}', ""],
      ["2", "", ""],
    ]);
  });

  it("returns an empty string for no rows", () => {
    expect(objectsToCsv([], ",")).toBe("");
  });
});

describe("csvToExcelXml", () => {
  it("escapes XML characters and produces a workbook", () => {
    const xml = csvToExcelXml('a,b\n"x & <y>","say ""hi"""', ",");
    expect(xml).toContain("<Workbook");
    expect(xml).toContain("x &amp; &lt;y&gt;");
    expect(xml).toContain("say &quot;hi&quot;");
  });

  it("removes control characters Excel cannot read", () => {
    const xml = csvToExcelXml("a\nb\u0001c", ",");
    expect(xml).toContain("bc");
    expect(xml).not.toContain("\u0001");
  });
});
