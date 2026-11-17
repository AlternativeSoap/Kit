export type RentBuyInput = {
  rentMonthly: number;
  buyPrice: number;
  downPayment: number;
  interestRatePct: number;
  years: number;
  ownershipMonthly: number;
  appreciationPct: number;
};

export type RentBuyResult = {
  loan: number;
  monthlyLoanPayment: number;
  totalRentPaid: number;
  totalBuyCashOut: number;
  homeEquity: number;
  buyNetCost: number;
  rentNetCost: number;
  better: "rent" | "buy" | "close";
};

function monthlyPayment(principal: number, annualPct: number, years: number) {
  if (principal <= 0) return 0;
  const r = annualPct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
}

export function compareRentBuy(input: RentBuyInput): RentBuyResult | null {
  const {
    rentMonthly,
    buyPrice,
    downPayment,
    interestRatePct,
    years,
    ownershipMonthly,
    appreciationPct,
  } = input;
  if (
    [rentMonthly, buyPrice, downPayment, interestRatePct, years, ownershipMonthly, appreciationPct].some(
      (n) => !Number.isFinite(n) || n < 0,
    )
  ) {
    return null;
  }
  if (years < 1 || years > 40 || downPayment > buyPrice) return null;

  const loan = Math.max(0, buyPrice - downPayment);
  const monthlyLoanPayment = monthlyPayment(loan, interestRatePct, years);
  const months = years * 12;
  const totalRentPaid = rentMonthly * months;
  const totalBuyCashOut =
    downPayment + (monthlyLoanPayment + ownershipMonthly) * months;
  const homeValue = buyPrice * (1 + appreciationPct / 100) ** years;
  // Remaining principal after years of amortization.
  const r = interestRatePct / 100 / 12;
  let balance = loan;
  for (let i = 0; i < months; i++) {
    const interest = balance * r;
    const principalPay = monthlyLoanPayment - interest;
    balance = Math.max(0, balance - principalPay);
  }
  const homeEquity = homeValue - balance;
  const buyNetCost = totalBuyCashOut - homeEquity;
  const rentNetCost = totalRentPaid;
  const diff = Math.abs(buyNetCost - rentNetCost);
  const better =
    diff < Math.max(5000, rentNetCost * 0.02)
      ? "close"
      : buyNetCost < rentNetCost
        ? "buy"
        : "rent";

  return {
    loan,
    monthlyLoanPayment,
    totalRentPaid,
    totalBuyCashOut,
    homeEquity,
    buyNetCost,
    rentNetCost,
    better,
  };
}
