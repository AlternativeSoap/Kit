export type AvanceResult = {
  cost: number;
  sell: number;
  profit: number;
  marginPercent: number;
  markupPercent: number;
};

export type AvanceSolveMode = "fromPrices" | "fromMargin" | "fromMarkup";

export type AvanceInput = {
  cost: number;
  sell?: number;
  marginPercent?: number;
  markupPercent?: number;
};

/** margin % = (sell − cost) / sell × 100; markup % = (sell − cost) / cost × 100 */
export function calculateAvance(input: AvanceInput): AvanceResult | null {
  const { cost } = input;
  if (!Number.isFinite(cost) || cost < 0) return null;

  let sell = input.sell;
  const marginTarget = input.marginPercent;
  const markupTarget = input.markupPercent;

  const hasSell = sell !== undefined && Number.isFinite(sell) && sell > 0;
  const hasMargin =
    marginTarget !== undefined && Number.isFinite(marginTarget);
  const hasMarkup =
    markupTarget !== undefined && Number.isFinite(markupTarget);

  if (hasSell) {
    if (sell! <= cost) return null;
  } else if (hasMargin && !hasMarkup) {
    if (marginTarget! >= 100 || cost <= 0) return null;
    sell = cost / (1 - marginTarget! / 100);
  } else if (hasMarkup && !hasMargin) {
    if (cost <= 0) return null;
    sell = cost * (1 + markupTarget! / 100);
  } else {
    return null;
  }

  if (sell === undefined || !Number.isFinite(sell) || sell <= cost) return null;

  const profit = sell - cost;
  const marginPercent = (profit / sell) * 100;
  const markupPercent = cost > 0 ? (profit / cost) * 100 : 0;

  return {
    cost,
    sell,
    profit,
    marginPercent,
    markupPercent,
  };
}

export function avanceSolveMode(input: AvanceInput): AvanceSolveMode {
  if (input.sell !== undefined) return "fromPrices";
  if (input.marginPercent !== undefined) return "fromMargin";
  return "fromMarkup";
}