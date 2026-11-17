/** Pure spreadsheet model and formula helpers for Ark. */

import { parseCsv, type Delimiter } from "../csvexcel/csv";

export type CellMap = Record<string, string>;

export type CellAlign = "left" | "center" | "right";

export type NumberFormat = "general" | "number" | "currency" | "percent";

export type CellStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: CellAlign;
  color?: string;
  background?: string;
  fontFamily?: string;
  fontSize?: number;
  numberFormat?: NumberFormat;
};

export type MergeRange = {
  r0: number;
  c0: number;
  r1: number;
  c1: number;
};

export type SheetDoc = {
  version: 1 | 2;
  kind: "ark";
  title: string;
  rows: number;
  cols: number;
  cells: CellMap;
  /** Per-cell formatting, keyed like A1. */
  styles?: Record<string, CellStyle>;
  /** Merged rectangles (inclusive). Value lives in the top-left cell. */
  merges?: MergeRange[];
};

/** Excel-like starter grid (not a full sheet, but familiar proportions). */
export const DEFAULT_ROWS = 50;
export const DEFAULT_COLS = 16;

export function colLabel(index: number): string {
  let n = index;
  let label = "";
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

export function parseColLabel(label: string): number {
  const s = label.toUpperCase();
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code < 65 || code > 90) return -1;
    n = n * 26 + (code - 64);
  }
  return n - 1;
}

export function cellKey(row: number, col: number): string {
  return `${colLabel(col)}${row + 1}`;
}

export function parseCellRef(ref: string): { row: number; col: number } | null {
  const m = /^([A-Za-z]+)(\d+)$/.exec(ref.trim());
  if (!m) return null;
  const col = parseColLabel(m[1]!);
  const row = Number(m[2]) - 1;
  if (col < 0 || row < 0 || !Number.isFinite(row)) return null;
  return { row, col };
}

export function emptySheet(
  title = "Untitled",
  locale: "da" | "en" = "en",
): SheetDoc {
  const cells: CellMap = {};
  if (locale === "da") {
    cells.A1 = "Punkt";
    cells.B1 = "Antal";
    cells.C1 = "Pris";
    cells.D1 = "Total";
    cells.A2 = "Vare 1";
    cells.B2 = "2";
    cells.C2 = "50";
    cells.D2 = "=B2*C2";
    cells.A3 = "Vare 2";
    cells.B3 = "1";
    cells.C3 = "120";
    cells.D3 = "=B3*C3";
    cells.A4 = "Sum";
    cells.D4 = "=SUM(D2:D3)";
  } else {
    cells.A1 = "Item";
    cells.B1 = "Qty";
    cells.C1 = "Price";
    cells.D1 = "Total";
    cells.A2 = "Item 1";
    cells.B2 = "2";
    cells.C2 = "50";
    cells.D2 = "=B2*C2";
    cells.A3 = "Item 2";
    cells.B3 = "1";
    cells.C3 = "120";
    cells.D3 = "=B3*C3";
    cells.A4 = "Sum";
    cells.D4 = "=SUM(D2:D3)";
  }
  const styles: Record<string, CellStyle> = {
    A1: { bold: true, background: "#e8eef7" },
    B1: { bold: true, background: "#e8eef7" },
    C1: { bold: true, background: "#e8eef7" },
    D1: { bold: true, background: "#e8eef7" },
    D2: { align: "right" },
    D3: { align: "right" },
    A4: { bold: true },
    D4: { bold: true, align: "right", background: "#f3f4f6" },
  };
  return {
    version: 2,
    kind: "ark",
    title,
    rows: DEFAULT_ROWS,
    cols: DEFAULT_COLS,
    cells,
    styles,
    merges: [],
  };
}

export function getRaw(cells: CellMap, row: number, col: number): string {
  return cells[cellKey(row, col)] ?? "";
}

export function setRaw(
  cells: CellMap,
  row: number,
  col: number,
  value: string,
): CellMap {
  const key = cellKey(row, col);
  const next = { ...cells };
  if (!value) delete next[key];
  else next[key] = value;
  return next;
}

export function getStyle(
  styles: Record<string, CellStyle> | undefined,
  row: number,
  col: number,
): CellStyle {
  return styles?.[cellKey(row, col)] ?? {};
}

export function setStyle(
  styles: Record<string, CellStyle> | undefined,
  row: number,
  col: number,
  patch: Partial<CellStyle>,
): Record<string, CellStyle> {
  const key = cellKey(row, col);
  const next = { ...(styles ?? {}) };
  const merged = { ...(next[key] ?? {}), ...patch };
  const cleaned: CellStyle = {};
  if (merged.bold) cleaned.bold = true;
  if (merged.italic) cleaned.italic = true;
  if (merged.underline) cleaned.underline = true;
  if (merged.align) cleaned.align = merged.align;
  if (merged.color) cleaned.color = merged.color;
  if (merged.background) cleaned.background = merged.background;
  if (merged.fontSize) cleaned.fontSize = merged.fontSize;
  if (merged.numberFormat && merged.numberFormat !== "general") {
    cleaned.numberFormat = merged.numberFormat;
  }
  if (Object.keys(cleaned).length === 0) delete next[key];
  else next[key] = cleaned;
  return next;
}

export function normalizeMerge(a: MergeRange): MergeRange {
  return {
    r0: Math.min(a.r0, a.r1),
    c0: Math.min(a.c0, a.c1),
    r1: Math.max(a.r0, a.r1),
    c1: Math.max(a.c0, a.c1),
  };
}

export function findMergeAt(
  merges: MergeRange[] | undefined,
  row: number,
  col: number,
): MergeRange | null {
  if (!merges?.length) return null;
  for (const raw of merges) {
    const m = normalizeMerge(raw);
    if (row >= m.r0 && row <= m.r1 && col >= m.c0 && col <= m.c1) return m;
  }
  return null;
}

export function isMergeAnchor(m: MergeRange, row: number, col: number): boolean {
  const n = normalizeMerge(m);
  return row === n.r0 && col === n.c0;
}

export function mergeCells(
  merges: MergeRange[] | undefined,
  range: MergeRange,
): MergeRange[] {
  const next = normalizeMerge(range);
  if (next.r0 === next.r1 && next.c0 === next.c1) return merges ?? [];
  const kept = (merges ?? []).filter((raw) => {
    const m = normalizeMerge(raw);
    const overlap =
      m.r0 <= next.r1 &&
      m.r1 >= next.r0 &&
      m.c0 <= next.c1 &&
      m.c1 >= next.c0;
    return !overlap;
  });
  return [...kept, next];
}

export function unmergeAt(
  merges: MergeRange[] | undefined,
  row: number,
  col: number,
): MergeRange[] {
  return (merges ?? []).filter((raw) => {
    const m = normalizeMerge(raw);
    return !(row >= m.r0 && row <= m.r1 && col >= m.c0 && col <= m.c1);
  });
}

export function styleToCss(style: CellStyle): {
  fontWeight?: number;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: CellAlign;
  color?: string;
  background?: string;
  fontFamily?: string;
  fontSize?: string;
} {
  return {
    fontWeight: style.bold ? 700 : undefined,
    fontStyle: style.italic ? "italic" : undefined,
    textDecoration: style.underline ? "underline" : undefined,
    textAlign: style.align,
    color: style.color,
    background: style.background,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
  };
}

function toNumber(value: string): number | null {
  const t = value.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function expandRange(a: string, b: string): string[] {
  const start = parseCellRef(a);
  const end = parseCellRef(b);
  if (!start || !end) return [];
  const r0 = Math.min(start.row, end.row);
  const r1 = Math.max(start.row, end.row);
  const c0 = Math.min(start.col, end.col);
  const c1 = Math.max(start.col, end.col);
  const keys: string[] = [];
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) keys.push(cellKey(r, c));
  }
  return keys;
}

type EvalCtx = {
  cells: CellMap;
  stack: Set<string>;
  cache: Map<string, string>;
};

class CycleError extends Error {
  constructor() {
    super("cycle");
    this.name = "CycleError";
  }
}

function evalRef(ctx: EvalCtx, ref: string): number {
  const parsed = parseCellRef(ref);
  if (!parsed) return NaN;
  const key = cellKey(parsed.row, parsed.col);
  const text = evaluateCell(ctx, key);
  if (text === "#CYCLE!") throw new CycleError();
  const n = toNumber(text);
  return n ?? NaN;
}

function evalArgs(ctx: EvalCtx, inside: string): number[] {
  const parts = splitArgs(inside);
  const values: number[] = [];
  for (const part of parts) {
    const range = /^([A-Za-z]+\d+)\s*:\s*([A-Za-z]+\d+)$/.exec(part.trim());
    if (range) {
      for (const key of expandRange(range[1]!, range[2]!)) {
        const text = evaluateCell(ctx, key);
        const n = toNumber(text);
        if (n !== null) values.push(n);
      }
      continue;
    }
    const n = evalExpr(ctx, part.trim());
    if (Number.isFinite(n)) values.push(n);
  }
  return values;
}

function splitArgs(input: string): string[] {
  const out: string[] = [];
  let cur = "";
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!;
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

function evalExpr(ctx: EvalCtx, expr: string): number {
  const cleaned = expr.trim();
  if (!cleaned) return NaN;

  const fn = /^(SUM|AVERAGE|MIN|MAX|COUNT|IF)\s*\((.*)\)\s*$/i.exec(cleaned);
  if (fn) {
    const name = fn[1]!.toUpperCase();
    const inside = fn[2] ?? "";
    if (name === "IF") {
      const args = splitArgs(inside);
      if (args.length < 2) return NaN;
      const cond = evalCondition(ctx, args[0]!.trim());
      return cond
        ? evalExpr(ctx, args[1]!.trim())
        : evalExpr(ctx, (args[2] ?? "0").trim());
    }
    const values = evalArgs(ctx, inside);
    if (name === "SUM") return values.reduce((a, b) => a + b, 0);
    if (name === "AVERAGE")
      return values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
    if (name === "MIN") return values.length ? Math.min(...values) : NaN;
    if (name === "MAX") return values.length ? Math.max(...values) : NaN;
    if (name === "COUNT") return values.length;
  }

  if (/^[A-Za-z]+\d+$/.test(cleaned)) return evalRef(ctx, cleaned);

  // Replace cell refs with numbers, then evaluate basic arithmetic.
  const withNumbers = cleaned.replace(/[A-Za-z]+\d+/g, (ref) => {
    const n = evalRef(ctx, ref);
    return Number.isFinite(n) ? String(n) : "NaN";
  });
  if (!/^[\d.\s+\-*/()]+$/.test(withNumbers.replace(/NaN/g, "0"))) {
    const n = toNumber(withNumbers);
    return n ?? NaN;
  }
  try {
    // Safe-ish: only digits and arithmetic after ref substitution.
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${withNumbers});`)();
    return typeof result === "number" && Number.isFinite(result) ? result : NaN;
  } catch {
    return NaN;
  }
}

function evalCondition(ctx: EvalCtx, expr: string): boolean {
  const ops = ["<=", ">=", "<>", "!=", "=", "<", ">"];
  for (const op of ops) {
    const idx = expr.indexOf(op);
    if (idx < 0) continue;
    const left = evalExpr(ctx, expr.slice(0, idx));
    const right = evalExpr(ctx, expr.slice(idx + op.length));
    if (op === "=") return left === right;
    if (op === "<>" || op === "!=") return left !== right;
    if (op === "<") return left < right;
    if (op === ">") return left > right;
    if (op === "<=") return left <= right;
    if (op === ">=") return left >= right;
  }
  const n = evalExpr(ctx, expr);
  return Number.isFinite(n) && n !== 0;
}

export function evaluateCell(ctx: EvalCtx, key: string): string {
  if (ctx.cache.has(key)) return ctx.cache.get(key)!;
  if (ctx.stack.has(key)) throw new CycleError();
  const raw = ctx.cells[key] ?? "";
  if (!raw.startsWith("=")) {
    ctx.cache.set(key, raw);
    return raw;
  }
  ctx.stack.add(key);
  try {
    const value = evalExpr(ctx, raw.slice(1));
    const text = Number.isFinite(value)
      ? String(Number(value.toPrecision(12)))
      : "#ERR!";
    ctx.cache.set(key, text);
    return text;
  } catch (err) {
    if (err instanceof CycleError) {
      ctx.cache.set(key, "#CYCLE!");
      return "#CYCLE!";
    }
    ctx.cache.set(key, "#ERR!");
    return "#ERR!";
  } finally {
    ctx.stack.delete(key);
  }
}

export function displayValue(cells: CellMap, row: number, col: number): string {
  const key = cellKey(row, col);
  const ctx: EvalCtx = { cells, stack: new Set(), cache: new Map() };
  return evaluateCell(ctx, key);
}

/** Apply number format on top of the evaluated cell value. */
export function formatDisplayValue(
  value: string,
  style: CellStyle | undefined,
  locale: string = "en",
): string {
  const fmt = style?.numberFormat ?? "general";
  if (fmt === "general") return value;
  const n = toNumber(value);
  if (n === null) return value;
  try {
    if (fmt === "number") {
      return n.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }
    if (fmt === "currency") {
      const currency = locale.startsWith("da") ? "DKK" : "EUR";
      return n.toLocaleString(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    if (fmt === "percent") {
      return (n * 100).toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }) + "%";
    }
  } catch {
    return value;
  }
  return value;
}

/** Numbers in a rectangular selection (for status sum/average). */
export function selectionNumbers(
  cells: CellMap,
  r0: number,
  c0: number,
  r1: number,
  c1: number,
): number[] {
  const out: number[] = [];
  const row0 = Math.min(r0, r1);
  const row1 = Math.max(r0, r1);
  const col0 = Math.min(c0, c1);
  const col1 = Math.max(c0, c1);
  for (let r = row0; r <= row1; r++) {
    for (let c = col0; c <= col1; c++) {
      const n = toNumber(displayValue(cells, r, c));
      if (n !== null) out.push(n);
    }
  }
  return out;
}

export function sheetToCsv(doc: SheetDoc, delimiter = ","): string {
  const lines: string[] = [];
  for (let r = 0; r < doc.rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < doc.cols; c++) {
      const value = displayValue(doc.cells, r, c);
      const needsQuote =
        value.includes(delimiter) ||
        value.includes('"') ||
        value.includes("\n") ||
        value.includes("\r");
      row.push(needsQuote ? `"${value.replace(/"/g, '""')}"` : value);
    }
    lines.push(row.join(delimiter));
  }
  // Trim trailing empty rows for nicer exports.
  while (lines.length && lines[lines.length - 1]!.split(delimiter).every((c) => !c)) {
    lines.pop();
  }
  return lines.join("\r\n");
}

export function csvToSheet(
  csv: string,
  title: string,
  delimiter?: Delimiter,
): SheetDoc {
  const rows = parseCsv(csv, delimiter);
  const doc = emptySheet(title);
  doc.rows = Math.max(DEFAULT_ROWS, rows.length + 5);
  doc.cols = Math.max(
    DEFAULT_COLS,
    rows.reduce((m, r) => Math.max(m, r.length), 0) + 2,
  );
  const cells: CellMap = {};
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r]!.length; c++) {
      const v = rows[r]![c] ?? "";
      if (v) cells[cellKey(r, c)] = v;
    }
  }
  doc.cells = cells;
  return doc;
}

export function sheetToExcelXml(doc: SheetDoc): string {
  const escape = (value: string) =>
    value
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  let maxR = 0;
  let maxC = 0;
  for (const key of Object.keys(doc.cells)) {
    const parsed = parseCellRef(key);
    if (!parsed) continue;
    maxR = Math.max(maxR, parsed.row);
    maxC = Math.max(maxC, parsed.col);
  }
  const rows = Math.max(1, maxR + 1);
  const cols = Math.max(1, maxC + 1);
  const body: string[] = [];
  for (let r = 0; r < rows; r++) {
    const tds: string[] = [];
    for (let c = 0; c < cols; c++) {
      const raw = getRaw(doc.cells, r, c);
      const shown = displayValue(doc.cells, r, c);
      const num = toNumber(shown);
      if (num !== null && !raw.startsWith("=")) {
        tds.push(`<Cell><Data ss:Type="Number">${num}</Data></Cell>`);
      } else {
        tds.push(
          `<Cell><Data ss:Type="String">${escape(shown)}</Data></Cell>`,
        );
      }
    }
    body.push(`<Row>${tds.join("")}</Row>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${escape(doc.title.slice(0, 31) || "Sheet1")}">
  <Table>${body.join("")}</Table>
 </Worksheet>
</Workbook>`;
}
