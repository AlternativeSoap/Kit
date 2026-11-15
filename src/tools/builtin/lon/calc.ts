export const LON_RULESET = "2026-approx" as const;

export type LonInputMode = "monthly" | "hourly";

export type LonInputs = {
  mode: LonInputMode;
  bruttoMonthly?: number;
  bruttoHourly?: number;
  hoursPerWeek?: number;
  trekprocent: number;
  monthlyDeduction?: number;
  pensionPercent?: number;
  atpMonthly?: number;
  under18?: boolean;
};

export type LonResult = {
  ruleset: typeof LON_RULESET;
  bruttoMonthly: number;
  bruttoYearly: number;
  bruttoHourly: number;
  nettoMonthly: number;
  nettoYearly: number;
  nettoHourly: number;
  amBidrag: number;
  aSkat: number;
  pensionAmount: number;
  atpAmount: number;
  effectiveTaxPercent: number;
  hoursPerMonth: number;
  precision: "basic" | "improved";
};

/** Starting values the salary tool shows before the user changes anything. */
export const DEFAULT_TREKPROCENT = 38;
export const DEFAULT_HOURS_PER_WEEK = 37;

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;
const AM_RATE = 0.08;

function hoursPerMonth(hoursPerWeek: number): number {
  return (hoursPerWeek * WEEKS_PER_YEAR) / MONTHS_PER_YEAR;
}

export function calculateLon(input: LonInputs): LonResult | null {
  const hoursWeek = input.hoursPerWeek ?? DEFAULT_HOURS_PER_WEEK;
  const hpm = hoursPerMonth(hoursWeek);

  let bruttoMonthly = 0;
  if (input.mode === "monthly") {
    bruttoMonthly = input.bruttoMonthly ?? 0;
  } else {
    bruttoMonthly = (input.bruttoHourly ?? 0) * hpm;
  }

  if (bruttoMonthly <= 0 || !Number.isFinite(input.trekprocent)) {
    return null;
  }

  const trek = Math.min(Math.max(input.trekprocent, 0), 100) / 100;
  const pensionPercent = Math.max(input.pensionPercent ?? 0, 0) / 100;
  const atpAmount = Math.max(input.atpMonthly ?? 0, 0);
  const monthlyDeduction = Math.max(input.monthlyDeduction ?? 0, 0);
  const amApplies = !input.under18;

  const pensionAmount = bruttoMonthly * pensionPercent;
  const afterPension = Math.max(bruttoMonthly - pensionAmount - atpAmount, 0);
  const amBidrag = amApplies ? afterPension * AM_RATE : 0;
  const taxableBase = Math.max(afterPension - amBidrag - monthlyDeduction, 0);
  const aSkat = taxableBase * trek;
  const nettoMonthly = afterPension - amBidrag - aSkat;

  const bruttoHourly =
    input.mode === "hourly" && (input.bruttoHourly ?? 0) > 0
      ? (input.bruttoHourly as number)
      : bruttoMonthly / hpm;
  const nettoHourly = nettoMonthly / hpm;

  const totalTax = bruttoMonthly - nettoMonthly;
  const effectiveTaxPercent =
    bruttoMonthly > 0 ? (totalTax / bruttoMonthly) * 100 : 0;

  const improved =
    input.hoursPerWeek !== undefined ||
    (input.monthlyDeduction !== undefined && input.monthlyDeduction > 0) ||
    (input.pensionPercent !== undefined && input.pensionPercent > 0) ||
    (input.atpMonthly !== undefined && input.atpMonthly > 0) ||
    input.under18 === true;

  return {
    ruleset: LON_RULESET,
    bruttoMonthly,
    bruttoYearly: bruttoMonthly * MONTHS_PER_YEAR,
    bruttoHourly,
    nettoMonthly,
    nettoYearly: nettoMonthly * MONTHS_PER_YEAR,
    nettoHourly,
    amBidrag,
    aSkat,
    pensionAmount,
    atpAmount,
    effectiveTaxPercent,
    hoursPerMonth: hpm,
    precision: improved ? "improved" : "basic",
  };
}
