export type InflationResult = {
  futureValue: number;
  purchasingPower: number;
  totalInflationPercent: number;
};

export function calculateInflation(args: {
  amount: number;
  annualPercent: number;
  years: number;
}): InflationResult | null {
  const { amount, annualPercent, years } = args;
  if (!(amount >= 0) || !(annualPercent >= 0) || !(years >= 0)) return null;
  const factor = (1 + annualPercent / 100) ** years;
  if (!Number.isFinite(factor) || factor <= 0) return null;
  return {
    futureValue: amount * factor,
    purchasingPower: amount / factor,
    totalInflationPercent: (factor - 1) * 100,
  };
}
