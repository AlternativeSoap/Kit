export type BoligInput = {
  homePrice: number;
  downPayment: number;
  interestRatePct: number;
  loanYears: number;
  rentMonthly: number;
  ownershipMonthly: number;
  appreciationPct: number;
  investmentReturnPct: number;
  horizonYears: number;
};

export type YearRow = {
  year: number;
  buyHomeValue: number;
  buyLoanBalance: number;
  buyEquity: number;
  buyCashSpent: number;
  buyNetWorth: number;
  rentPaidCumulative: number;
  rentInvested: number;
  rentNetWorth: number;
  buyAdvantage: number;
};

export type BoligResult = {
  loan: number;
  monthlyLoanPayment: number;
  rows: YearRow[];
  breakEvenYear: number | null;
  finalBuyNetWorth: number;
  finalRentNetWorth: number;
  betterAtHorizon: "buy" | "rent" | "close";
};

function monthlyPayment(principal: number, annualPct: number, years: number) {
  if (principal <= 0) return 0;
  const r = annualPct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
}

function remainingBalance(
  principal: number,
  annualPct: number,
  payment: number,
  monthsPaid: number,
) {
  if (principal <= 0) return 0;
  const r = annualPct / 100 / 12;
  let balance = principal;
  for (let i = 0; i < monthsPaid; i++) {
    if (balance <= 0) return 0;
    const interest = balance * r;
    balance = Math.max(0, balance - (payment - interest));
  }
  return balance;
}

/**
 * Rent vs buy net-worth paths.
 * Buy: home equity (value minus remaining loan).
 * Rent: down payment and monthly cash difference vs buying, invested at the given return.
 * Monthly cash difference = (loan payment + ownership) − rent. Positive means buying costs more
 * each month, so that amount is invested while renting.
 */
export function simulateBolig(input: BoligInput): BoligResult | null {
  const {
    homePrice,
    downPayment,
    interestRatePct,
    loanYears,
    rentMonthly,
    ownershipMonthly,
    appreciationPct,
    investmentReturnPct,
    horizonYears,
  } = input;

  const nums = [
    homePrice,
    downPayment,
    interestRatePct,
    loanYears,
    rentMonthly,
    ownershipMonthly,
    appreciationPct,
    investmentReturnPct,
    horizonYears,
  ];
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (horizonYears < 1 || horizonYears > 40) return null;
  if (loanYears < 1 || loanYears > 40) return null;
  if (downPayment > homePrice) return null;

  const loan = Math.max(0, homePrice - downPayment);
  const monthlyLoanPayment = monthlyPayment(loan, interestRatePct, loanYears);
  const monthlyBuyCash = monthlyLoanPayment + ownershipMonthly;
  const monthlyInvestRate = investmentReturnPct / 100 / 12;
  const annualApprec = 1 + appreciationPct / 100;
  const monthlyDiff = monthlyBuyCash - rentMonthly;

  const rows: YearRow[] = [];
  let breakEvenYear: number | null = null;
  let prevAdvantage: number | null = null;
  let rentPortfolio = downPayment;

  for (let year = 1; year <= horizonYears; year++) {
    for (let m = 0; m < 12; m++) {
      rentPortfolio *= 1 + monthlyInvestRate;
      rentPortfolio += monthlyDiff;
      if (rentPortfolio < 0) rentPortfolio = 0;
    }

    const months = year * 12;
    const buyHomeValue = homePrice * annualApprec ** year;
    const buyLoanBalance = remainingBalance(
      loan,
      interestRatePct,
      monthlyLoanPayment,
      Math.min(months, loanYears * 12),
    );
    const buyEquity = buyHomeValue - buyLoanBalance;
    const buyCashSpent = downPayment + monthlyBuyCash * months;
    const buyNetWorth = buyEquity;
    const rentPaidCumulative = rentMonthly * months;
    const rentInvested = rentPortfolio;
    const rentNetWorth = rentInvested;
    const buyAdvantage = buyNetWorth - rentNetWorth;

    if (
      breakEvenYear === null &&
      prevAdvantage !== null &&
      prevAdvantage < 0 &&
      buyAdvantage >= 0
    ) {
      breakEvenYear = year;
    }
    if (breakEvenYear === null && year === 1 && buyAdvantage >= 0) {
      breakEvenYear = 1;
    }
    prevAdvantage = buyAdvantage;

    rows.push({
      year,
      buyHomeValue,
      buyLoanBalance,
      buyEquity,
      buyCashSpent,
      buyNetWorth,
      rentPaidCumulative,
      rentInvested,
      rentNetWorth,
      buyAdvantage,
    });
  }

  const last = rows[rows.length - 1]!;
  const diff = Math.abs(last.buyNetWorth - last.rentNetWorth);
  const betterAtHorizon =
    diff < Math.max(10000, Math.abs(last.buyNetWorth) * 0.02)
      ? "close"
      : last.buyNetWorth > last.rentNetWorth
        ? "buy"
        : "rent";

  return {
    loan,
    monthlyLoanPayment,
    rows,
    breakEvenYear,
    finalBuyNetWorth: last.buyNetWorth,
    finalRentNetWorth: last.rentNetWorth,
    betterAtHorizon,
  };
}

export function withHigherRate(
  input: BoligInput,
  extraPctPoints: number,
): BoligInput {
  return {
    ...input,
    interestRatePct: input.interestRatePct + extraPctPoints,
  };
}
