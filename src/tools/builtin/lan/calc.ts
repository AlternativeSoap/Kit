export type LanResult = {
  principal: number;
  annualRatePercent: number;
  termMonths: number;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
};

/** Standard fixed-rate annuity payment (monthly). */
export function calculateLan(
  principal: number,
  annualRatePercent: number,
  termMonths: number,
): LanResult | null {
  if (!Number.isFinite(principal) || principal <= 0) return null;
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return null;
  if (!Number.isInteger(termMonths) || termMonths < 1 || termMonths > 600) {
    return null;
  }

  const monthlyRate = annualRatePercent / 100 / 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / termMonths;
  } else {
    const factor = (1 + monthlyRate) ** termMonths;
    monthlyPayment = (principal * monthlyRate * factor) / (factor - 1);
  }

  const totalPaid = monthlyPayment * termMonths;
  const totalInterest = totalPaid - principal;

  return {
    principal,
    annualRatePercent,
    termMonths,
    monthlyPayment,
    totalPaid,
    totalInterest,
  };
}

export function termMonthsFromYearsAndExtra(
  years: number,
  extraMonths: number,
): number | null {
  if (!Number.isFinite(years) || years < 0) return null;
  if (!Number.isInteger(extraMonths) || extraMonths < 0 || extraMonths > 11) {
    return null;
  }
  const wholeYears = Math.floor(years);
  const months = wholeYears * 12 + extraMonths;
  return months >= 1 ? months : null;
}