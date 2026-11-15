export type SavingsResult = {
  futureValue: number;
  totalContributed: number;
  interestEarned: number;
};

/** Compound savings with optional regular deposits at period end. */
export function calculateSavings(args: {
  principal: number;
  monthlyDeposit: number;
  annualRatePercent: number;
  years: number;
}): SavingsResult | null {
  const { principal, monthlyDeposit, annualRatePercent, years } = args;
  if (
    !(principal >= 0) ||
    !(monthlyDeposit >= 0) ||
    !(annualRatePercent >= 0) ||
    !(years > 0)
  ) {
    return null;
  }

  const months = Math.round(years * 12);
  const r = annualRatePercent / 100 / 12;
  let balance = principal;

  for (let i = 0; i < months; i += 1) {
    balance = balance * (1 + r) + monthlyDeposit;
  }

  const totalContributed = principal + monthlyDeposit * months;
  return {
    futureValue: balance,
    totalContributed,
    interestEarned: balance - totalContributed,
  };
}
