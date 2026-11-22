export const DEFAULT_DAYS_PER_YEAR = 25;

export type VacationResult = {
  daysPerYear: number;
  accrued: number;
  used: number;
  remaining: number;
  earnedThisYear: number;
  /** Fraction of the calendar year worked (0–1) used for accrual. */
  yearFraction: number;
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysInYear(year: number): number {
  const leap =
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return leap ? 366 : 365;
}

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getFullYear(), 0, 0);
  const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((now - start) / 86_400_000);
}

/**
 * Accrue vacation days proportionally over the calendar year.
 * Accrual in the as-of year runs from max(employment start, Jan 1) through as-of.
 * Remaining = accrued − used (can be negative if overused).
 */
export function calculateVacation(args: {
  startDate: Date;
  asOfDate: Date;
  daysPerYear: number;
  usedDays: number;
}): VacationResult | null {
  const { daysPerYear, usedDays } = args;
  if (!(daysPerYear >= 0) || !Number.isFinite(daysPerYear)) return null;
  if (!(usedDays >= 0) || !Number.isFinite(usedDays)) return null;

  const start = startOfDay(args.startDate);
  const asOf = startOfDay(args.asOfDate);
  if (asOf.getTime() < start.getTime()) return null;

  const year = asOf.getFullYear();
  const yearStart = new Date(year, 0, 1);
  const accrualStart =
    start.getTime() > yearStart.getTime() ? start : yearStart;

  if (asOf.getTime() < accrualStart.getTime()) {
    return {
      daysPerYear,
      accrued: 0,
      used: usedDays,
      remaining: -usedDays,
      earnedThisYear: 0,
      yearFraction: 0,
    };
  }

  const totalDays = daysInYear(year);
  const from = dayOfYear(accrualStart);
  const to = dayOfYear(asOf);
  // Inclusive day count from accrual start through as-of
  const workedDays = to - from + 1;
  const yearFraction = Math.min(1, Math.max(0, workedDays / totalDays));
  const earnedThisYear = daysPerYear * yearFraction;
  const accrued = earnedThisYear;
  const remaining = accrued - usedDays;

  return {
    daysPerYear,
    accrued,
    used: usedDays,
    remaining,
    earnedThisYear,
    yearFraction,
  };
}
