export type BreakEvenResult = {
  units: number;
  revenue: number;
  contribution: number;
};

export function calculateBreakEven(args: {
  fixedCosts: number;
  pricePerUnit: number;
  variablePerUnit: number;
}): BreakEvenResult | null {
  const { fixedCosts, pricePerUnit, variablePerUnit } = args;
  if (!(fixedCosts >= 0) || !(pricePerUnit > 0) || !(variablePerUnit >= 0)) {
    return null;
  }
  const contribution = pricePerUnit - variablePerUnit;
  if (!(contribution > 0)) return null;
  const units = fixedCosts / contribution;
  return {
    units,
    revenue: units * pricePerUnit,
    contribution,
  };
}
