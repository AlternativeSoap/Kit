import { describe, expect, it } from "vitest";
import {
  cellKey,
  colLabel,
  displayValue,
  emptySheet,
  findMergeAt,
  isMergeAnchor,
  mergeCells,
  parseCellRef,
  setRaw,
  setStyle,
} from "./sheet";

describe("ark sheet", () => {
  it("maps column labels", () => {
    expect(colLabel(0)).toBe("A");
    expect(colLabel(25)).toBe("Z");
    expect(colLabel(26)).toBe("AA");
    expect(cellKey(0, 0)).toBe("A1");
    expect(parseCellRef("B12")).toEqual({ row: 11, col: 1 });
  });

  it("evaluates basic formulas", () => {
    let cells = emptySheet().cells;
    cells = setRaw(cells, 0, 0, "10");
    cells = setRaw(cells, 0, 1, "5");
    cells = setRaw(cells, 0, 2, "=A1+B1");
    cells = setRaw(cells, 1, 0, "=SUM(A1:B1)");
    cells = setRaw(cells, 1, 1, "=IF(A1>B1,1,0)");
    expect(displayValue(cells, 0, 2)).toBe("15");
    expect(displayValue(cells, 1, 0)).toBe("15");
    expect(displayValue(cells, 1, 1)).toBe("1");
  });

  it("detects cycles", () => {
    let cells = emptySheet().cells;
    cells = setRaw(cells, 0, 0, "=B1");
    cells = setRaw(cells, 0, 1, "=A1");
    expect(displayValue(cells, 0, 0)).toBe("#CYCLE!");
  });

  it("merges and styles cells", () => {
    const merges = mergeCells([], { r0: 0, c0: 0, r1: 1, c1: 1 });
    const m = findMergeAt(merges, 1, 1);
    expect(m).toBeTruthy();
    expect(isMergeAnchor(m!, 0, 0)).toBe(true);
    expect(isMergeAnchor(m!, 1, 1)).toBe(false);
    const styles = setStyle({}, 0, 0, { bold: true, align: "center" });
    expect(styles.A1?.bold).toBe(true);
    expect(styles.A1?.align).toBe("center");
  });
});
