export type IncomePeriod = "monthly" | "annual";

export type RaadighedInput = {
  income: number;
  incomePeriod: IncomePeriod;
  /** Existing monthly debt payments (loans, cards, etc.). */
  existingDebtsMonthly: number;
  downPayment: number;
  /** Annual interest rate in percent. */
  ratePercent: number;
  /** Loan term in years. */
  termYears: number;
  /**
   * Max share of gross monthly income allowed for housing + debts (DTI-style),
   * e.g. 40 means 40%.
   */
  dtiPercent: number;
};

export type RaadighedResult = {
  monthlyIncome: number;
  maxHousingPayment: number;
  maxLoan: number;
  estimatedMonthlyPayment: number;
  estimatedPurchasePrice: number;
  termMonths: number;
  monthlyRate: number;
};

/** Present value of an annuity (loan principal from fixed payment). */
function loanFromPayment(
  payment: number,
  monthlyRate: number,
  months: number,
): number {
  if (payment <= 0 || months <= 0) return 0;
  if (monthlyRate <= 0) return payment * months;
  const factor = 1 - Math.pow(1 + monthlyRate, -months);
  return (payment * factor) / monthlyRate;
}

/** Fixed payment for a loan (PMT). */
function paymentFromLoan(
  principal: number,
  monthlyRate: number,
  months: number,
): number {
  if (principal <= 0 || months <= 0) return 0;
  if (monthlyRate <= 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function calculateAffordability(
  input: RaadighedInput,
): RaadighedResult | null {
  const {
    income,
    incomePeriod,
    existingDebtsMonthly,
    downPayment,
    ratePercent,
    termYears,
    dtiPercent,
  } = input;

  if (
    ![
      income,
      existingDebtsMonthly,
      downPayment,
      ratePercent,
      termYears,
      dtiPercent,
    ].every(Number.isFinite)
  ) {
    return null;
  }
  if (income <= 0) return null;
  if (existingDebtsMonthly < 0 || downPayment < 0) return null;
  if (ratePercent < 0 || termYears <= 0) return null;
  if (dtiPercent <= 0 || dtiPercent > 100) return null;

  const monthlyIncome =
    incomePeriod === "annual" ? income / 12 : income;
  const maxTotalDebtService = monthlyIncome * (dtiPercent / 100);
  const maxHousingPayment = Math.max(
    0,
    maxTotalDebtService - existingDebtsMonthly,
  );
  if (maxHousingPayment <= 0) return null;

  const termMonths = Math.round(termYears * 12);
  const monthlyRate = ratePercent / 100 / 12;
  const maxLoan = loanFromPayment(
    maxHousingPayment,
    monthlyRate,
    termMonths,
  );
  if (!(maxLoan > 0)) return null;

  const estimatedMonthlyPayment = paymentFromLoan(
    maxLoan,
    monthlyRate,
    termMonths,
  );
  const estimatedPurchasePrice = maxLoan + downPayment;

  return {
    monthlyIncome,
    maxHousingPayment,
    maxLoan,
    estimatedMonthlyPayment,
    estimatedPurchasePrice,
    termMonths,
    monthlyRate,
  };
}
