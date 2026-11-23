export type AbcClass = "A" | "B" | "C";

export type AbcItemInput = {
  item: string;
  quantity: number;
  unitPrice: number;
};

export type AbcRankedRow = {
  item: string;
  quantity: number;
  unitPrice: number;
  value: number;
  pct: number;
  cumPct: number;
  class: AbcClass;
  volumePct: number;
  volumeCumPct: number;
  volumeClass: AbcClass;
  dualCode: string;
};

export type AbcClassSummary = {
  class: AbcClass;
  count: number;
  value: number;
  valueShare: number;
  quantity: number;
  quantityShare: number;
};

export type AbcResult = {
  rows: AbcRankedRow[];
  byValue: AbcClassSummary[];
  byVolume: AbcClassSummary[];
  totalValue: number;
  totalQuantity: number;
};

export type AbcThresholds = {
  /** Cumulative value % cutoff for class A (default 80). */
  aPct: number;
  /** Cumulative value % cutoff for class B (default 95). */
  bPct: number;
};

const ITEM_HEADERS = new Set([
  "item",
  "vare",
  "name",
  "navn",
  "sku",
  "produkt",
  "product",
]);
const QTY_HEADERS = new Set([
  "quantity",
  "qty",
  "antal",
  "qty.",
  "stk",
  "amount",
  "volume",
  "volumen",
]);
const PRICE_HEADERS = new Set([
  "unitprice",
  "unit_price",
  "price",
  "pris",
  "enhedspris",
  "cost",
  "kostpris",
]);
const VALUE_HEADERS = new Set([
  "value",
  "vaerdi",
  "total",
  "belob",
  "amountvalue",
]);

function normalizeHeader(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[_-]+/g, "");
}

function parseNumberCell(raw: string): number | undefined {
  const trimmed = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!trimmed) return undefined;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : undefined;
}

function splitLine(line: string): string[] {
  if (line.includes("\t")) return line.split("\t");
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

function classifyCum(cumPct: number, aPct: number, bPct: number): AbcClass {
  if (cumPct <= aPct + 1e-9) return "A";
  if (cumPct <= bPct + 1e-9) return "B";
  return "C";
}

function summarize(
  rows: AbcRankedRow[],
  by: "value" | "volume",
  totalValue: number,
  totalQuantity: number,
): AbcClassSummary[] {
  const classes: AbcClass[] = ["A", "B", "C"];
  return classes.map((cls) => {
    const subset = rows.filter((r) =>
      by === "value" ? r.class === cls : r.volumeClass === cls,
    );
    const value = subset.reduce((s, r) => s + r.value, 0);
    const quantity = subset.reduce((s, r) => s + r.quantity, 0);
    return {
      class: cls,
      count: subset.length,
      value,
      valueShare: totalValue > 0 ? (value / totalValue) * 100 : 0,
      quantity,
      quantityShare: totalQuantity > 0 ? (quantity / totalQuantity) * 100 : 0,
    };
  });
}

type WorkingRow = {
  id: number;
  item: string;
  quantity: number;
  unitPrice: number;
  value: number;
};

/** Rank items by value (and volume) into ABC classes. Classic 80/15/5 via 80%/95% cutoffs. */
export function classifyAbc(
  items: AbcItemInput[],
  thresholds: AbcThresholds = { aPct: 80, bPct: 95 },
): AbcResult | null {
  const aPct = Number.isFinite(thresholds.aPct) ? thresholds.aPct : 80;
  const bPct = Number.isFinite(thresholds.bPct) ? thresholds.bPct : 95;
  if (!(aPct > 0) || !(bPct > aPct) || bPct > 100) return null;

  const cleaned: WorkingRow[] = [];
  items.forEach((it, index) => {
    const quantity = it.quantity;
    const unitPrice = it.unitPrice;
    if (
      !Number.isFinite(quantity) ||
      !Number.isFinite(unitPrice) ||
      quantity < 0 ||
      unitPrice < 0
    ) {
      return;
    }
    const value = quantity * unitPrice;
    if (!(value > 0)) return;
    cleaned.push({
      id: index,
      item: it.item.trim() || "—",
      quantity,
      unitPrice,
      value,
    });
  });

  if (cleaned.length === 0) return null;

  const totalValue = cleaned.reduce((s, r) => s + r.value, 0);
  const totalQuantity = cleaned.reduce((s, r) => s + r.quantity, 0);
  if (!(totalValue > 0)) return null;

  const valueRank = [...cleaned].sort(
    (a, b) => b.value - a.value || a.item.localeCompare(b.item) || a.id - b.id,
  );
  const valueInfo = new Map<
    number,
    { pct: number; cumPct: number; class: AbcClass; order: number }
  >();
  let cumValue = 0;
  valueRank.forEach((row, order) => {
    cumValue += row.value;
    const pct = (row.value / totalValue) * 100;
    const cumPct = (cumValue / totalValue) * 100;
    valueInfo.set(row.id, {
      pct,
      cumPct,
      class: classifyCum(cumPct, aPct, bPct),
      order,
    });
  });

  const volumeRank = [...cleaned].sort(
    (a, b) =>
      b.quantity - a.quantity || a.item.localeCompare(b.item) || a.id - b.id,
  );
  const volumeInfo = new Map<
    number,
    { pct: number; cumPct: number; class: AbcClass }
  >();
  let cumQty = 0;
  volumeRank.forEach((row) => {
    cumQty += row.quantity;
    const pct = totalQuantity > 0 ? (row.quantity / totalQuantity) * 100 : 0;
    const cumPct = totalQuantity > 0 ? (cumQty / totalQuantity) * 100 : 0;
    volumeInfo.set(row.id, {
      pct,
      cumPct,
      class: classifyCum(cumPct, aPct, bPct),
    });
  });

  const rows: AbcRankedRow[] = valueRank.map((row) => {
    const v = valueInfo.get(row.id)!;
    const vol = volumeInfo.get(row.id) ?? {
      pct: 0,
      cumPct: 100,
      class: "C" as AbcClass,
    };
    return {
      item: row.item,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      value: row.value,
      pct: v.pct,
      cumPct: v.cumPct,
      class: v.class,
      volumePct: vol.pct,
      volumeCumPct: vol.cumPct,
      volumeClass: vol.class,
      dualCode: `${v.class}${vol.class}`,
    };
  });

  return {
    rows,
    byValue: summarize(rows, "value", totalValue, totalQuantity),
    byVolume: summarize(rows, "volume", totalValue, totalQuantity),
    totalValue,
    totalQuantity,
  };
}

export type ParsedAbcSheet = {
  items: AbcItemInput[];
  warnings: string[];
};

/**
 * Parse CSV/TSV paste. Auto-detects headers (da/en) for item, qty, price, value.
 * Without headers: columns are item, quantity, unitPrice (or item, value).
 */
export function parseAbcPaste(text: string): ParsedAbcSheet {
  const warnings: string[] = [];
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { items: [], warnings };

  const firstCells = splitLine(lines[0]).map(normalizeHeader);
  // Re-normalize VALUE headers that may include æ→ae via NFD strip of æ? æ is a letter.
  // Also accept raw "værdi" via normalizeHeader stripping combining marks from ä etc.
  // Explicitly map vaerdi/værdi: normalizeHeader turns værdi → vaerdi if we replace æ.
  const firstNorm = splitLine(lines[0]).map((h) =>
    normalizeHeader(h.replace(/æ/gi, "ae").replace(/ø/gi, "o").replace(/å/gi, "a")),
  );

  const hasHeader =
    firstNorm.some((h) => ITEM_HEADERS.has(h)) ||
    firstNorm.some((h) => QTY_HEADERS.has(h)) ||
    firstNorm.some((h) => PRICE_HEADERS.has(h)) ||
    firstNorm.some((h) => VALUE_HEADERS.has(h));

  let itemIdx = 0;
  let qtyIdx = 1;
  let priceIdx = 2;
  let valueIdx = -1;
  let dataStart = 0;

  if (hasHeader) {
    dataStart = 1;
    itemIdx = firstNorm.findIndex((h) => ITEM_HEADERS.has(h));
    qtyIdx = firstNorm.findIndex((h) => QTY_HEADERS.has(h));
    priceIdx = firstNorm.findIndex((h) => PRICE_HEADERS.has(h));
    valueIdx = firstNorm.findIndex((h) => VALUE_HEADERS.has(h));
    if (itemIdx < 0) itemIdx = 0;
  } else if (firstCells.length === 2) {
    valueIdx = 1;
    qtyIdx = -1;
    priceIdx = -1;
  }

  const items: AbcItemInput[] = [];
  for (let i = dataStart; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    if (cells.every((c) => !c.trim())) continue;
    const name = (cells[itemIdx] ?? `Item ${items.length + 1}`).trim();
    if (valueIdx >= 0 && (qtyIdx < 0 || priceIdx < 0)) {
      const value = parseNumberCell(cells[valueIdx] ?? "");
      if (value === undefined || value < 0) {
        warnings.push(`Row ${i + 1}: invalid value`);
        continue;
      }
      items.push({ item: name, quantity: 1, unitPrice: value });
      continue;
    }
    const qty = parseNumberCell(cells[qtyIdx] ?? "");
    const price = parseNumberCell(cells[priceIdx] ?? "");
    if (qty === undefined || price === undefined || qty < 0 || price < 0) {
      warnings.push(`Row ${i + 1}: invalid quantity/price`);
      continue;
    }
    items.push({ item: name, quantity: qty, unitPrice: price });
  }

  return { items, warnings };
}

export function abcRowsToCsv(rows: AbcRankedRow[], dual: boolean): string {
  const header = dual
    ? "item,quantity,unitPrice,value,pct,cumPct,valueClass,volumePct,volumeCumPct,volumeClass,dual"
    : "item,quantity,unitPrice,value,pct,cumPct,class";
  const lines = rows.map((r) => {
    const base = [
      csvEscape(r.item),
      r.quantity,
      r.unitPrice,
      round(r.value, 4),
      round(r.pct, 4),
      round(r.cumPct, 4),
    ];
    if (dual) {
      return [
        ...base,
        r.class,
        round(r.volumePct, 4),
        round(r.volumeCumPct, 4),
        r.volumeClass,
        r.dualCode,
      ].join(",");
    }
    return [...base, r.class].join(",");
  });
  return [header, ...lines].join("\n");
}

function round(n: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
