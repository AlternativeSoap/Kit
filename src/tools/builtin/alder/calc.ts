export type AgeResult = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  nextBirthdayInDays: number;
};

function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Age from a birth date to a reference date (defaults to today, local calendar). */
export function calculateAge(
  birth: Date,
  reference: Date = new Date(),
): AgeResult | null {
  if (Number.isNaN(birth.getTime()) || Number.isNaN(reference.getTime())) {
    return null;
  }

  const birthUtc = utcDate(
    birth.getFullYear(),
    birth.getMonth(),
    birth.getDate(),
  );
  const refUtc = utcDate(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  );
  if (birthUtc > refUtc) return null;

  let years = refUtc.getUTCFullYear() - birthUtc.getUTCFullYear();
  let months = refUtc.getUTCMonth() - birthUtc.getUTCMonth();
  let days = refUtc.getUTCDate() - birthUtc.getUTCDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = utcDate(
      refUtc.getUTCFullYear(),
      refUtc.getUTCMonth(),
      0,
    );
    days += prevMonth.getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const next = utcDate(
    refUtc.getUTCFullYear(),
    birthUtc.getUTCMonth(),
    birthUtc.getUTCDate(),
  );
  if (next <= refUtc) {
    next.setUTCFullYear(next.getUTCFullYear() + 1);
  }

  return {
    years,
    months,
    days,
    totalDays: daysBetween(birthUtc, refUtc),
    nextBirthdayInDays: daysBetween(refUtc, next),
  };
}
