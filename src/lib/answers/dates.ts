export type ParsedDate = {
  date: Date;
  /** False when the year was left out and the current year was assumed. */
  hasYear: boolean;
};

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  januar: 1,
  feb: 2,
  february: 2,
  februar: 2,
  mar: 3,
  march: 3,
  marts: 3,
  apr: 4,
  april: 4,
  may: 5,
  maj: 5,
  jun: 6,
  june: 6,
  juni: 6,
  jul: 7,
  july: 7,
  juli: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  okt: 10,
  october: 10,
  oktober: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const MONTH_SOURCE = Object.keys(MONTHS)
  .sort((a, b) => b.length - a.length)
  .join("|");

const ISO = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
const NUMERIC = /^(\d{1,2})[./-](\d{1,2})(?:[./-](\d{4}|\d{2}))?\.?$/;
const DAY_MONTH = new RegExp(
  `^(\\d{1,2})(?:\\.|st|nd|rd|th)? (?:of )?(${MONTH_SOURCE})\\.?(?:,? (\\d{4}))?$`,
);
const MONTH_DAY = new RegExp(
  `^(${MONTH_SOURCE})\\.? (\\d{1,2})(?:\\.|st|nd|rd|th)?(?:,? (\\d{4}))?$`,
);

/** Calendar day at noon, so daylight saving shifts never change the date. */
export function atNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

function makeDate(year: number, month: number, day: number): Date | null {
  if (year < 1900 || year > 2200) return null;
  const date = new Date(year, month - 1, day, 12);
  const real =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  return real ? date : null;
}

function shiftDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function fullYear(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const year = Number(raw);
  return raw.length === 2 ? 2000 + year : year;
}

/**
 * Reads one typed date: "today", "i morgen", 2026-03-12, 12/3, 12.3.2026,
 * "12 march", "12. marts 2026" or "march 12". Numeric dates are day first.
 */
export function parseDateToken(raw: string, now: Date): ParsedDate | null {
  const text = raw
    .trim()
    .replace(/^(?:d\.|den|the) /, "")
    .trim();
  if (!text) return null;

  const today = atNoon(now);
  if (text === "today" || text === "now" || text === "i dag" || text === "idag") {
    return { date: today, hasYear: true };
  }
  if (text === "tomorrow" || text === "i morgen" || text === "imorgen") {
    return { date: shiftDays(today, 1), hasYear: true };
  }
  if (
    text === "yesterday" ||
    text === "i går" ||
    text === "igår" ||
    text === "i gaar"
  ) {
    return { date: shiftDays(today, -1), hasYear: true };
  }

  const currentYear = today.getFullYear();

  const iso = ISO.exec(text);
  if (iso) {
    const date = makeDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
    return date ? { date, hasYear: true } : null;
  }

  const numeric = NUMERIC.exec(text);
  if (numeric) {
    let day = Number(numeric[1]);
    let month = Number(numeric[2]);
    // "3/25" can only be month first.
    if (month > 12 && day <= 12) [day, month] = [month, day];
    const date = makeDate(fullYear(numeric[3], currentYear), month, day);
    return date ? { date, hasYear: Boolean(numeric[3]) } : null;
  }

  const dayMonth = DAY_MONTH.exec(text);
  if (dayMonth) {
    const date = makeDate(
      fullYear(dayMonth[3], currentYear),
      MONTHS[dayMonth[2]!]!,
      Number(dayMonth[1]),
    );
    return date ? { date, hasYear: Boolean(dayMonth[3]) } : null;
  }

  const monthDay = MONTH_DAY.exec(text);
  if (monthDay) {
    const date = makeDate(
      fullYear(monthDay[3], currentYear),
      MONTHS[monthDay[1]!]!,
      Number(monthDay[2]),
    );
    return date ? { date, hasYear: Boolean(monthDay[3]) } : null;
  }

  return null;
}

/**
 * Moves a date without a typed year to the next year. 29 February stays put
 * when the next year has no such day.
 */
export function nextYear(date: Date): Date {
  return (
    makeDate(date.getFullYear() + 1, date.getMonth() + 1, date.getDate()) ?? date
  );
}
