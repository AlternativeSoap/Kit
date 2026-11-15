export type UnitPriceRow = {
  id: string;
  label: string;
  price: number;
  quantity: number;
  unitPrice: number;
};

export type UnitPriceResult = {
  rows: UnitPriceRow[];
  bestId: string | null;
};

export function compareUnitPrices(
  items: Array<{ id: string; label: string; price: number; quantity: number }>,
): UnitPriceResult | null {
  const rows: UnitPriceRow[] = [];
  for (const item of items) {
    if (!(item.price >= 0) || !(item.quantity > 0)) continue;
    rows.push({
      ...item,
      unitPrice: item.price / item.quantity,
    });
  }
  if (rows.length === 0) return null;
  const best = rows.reduce((a, b) => (a.unitPrice <= b.unitPrice ? a : b));
  return { rows, bestId: best.id };
}
