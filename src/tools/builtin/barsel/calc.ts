export function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Inclusive leave: N weeks = N × 7 days starting on `start`.
 * Mid-week starts therefore end mid-week (e.g. Wed → Tue).
 */
export function endDateFromWeeks(start: Date, weeks: number): Date {
  const safeWeeks = Math.max(0, Math.floor(weeks));
  const end = new Date(start);
  if (safeWeeks === 0) return end;
  end.setDate(end.getDate() + safeWeeks * 7 - 1);
  return end;
}

export function totalDaysFromWeeks(weeks: number): number {
  return Math.max(0, Math.floor(weeks)) * 7;
}

/** Monday = 0 … Sunday = 6 */
export function mondayBasedWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function startsMidWeek(date: Date): boolean {
  return mondayBasedWeekday(date) !== 0;
}

export function endsMidWeek(date: Date): boolean {
  return mondayBasedWeekday(date) !== 6;
}

export function formatWeekdayShort(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-GB", {
    weekday: "short",
  }).format(date);
}

/** ISO week number (1–53). */
export function isoWeekNumber(date: Date): number {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isInRange(day: Date, start: Date, end: Date): boolean {
  const t = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
  const s = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const e = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return t >= s && t <= e;
}

export type CalendarCell = {
  date: Date;
  inMonth: boolean;
  week: number;
};

/** Monday-first calendar grid for a month. */
export function buildMonthGrid(month: Date): CalendarCell[][] {
  const first = startOfMonth(month);
  const startWeekday = (first.getDay() + 6) % 7; // Mon=0
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startWeekday);

  const weeks: CalendarCell[][] = [];
  const cursor = new Date(gridStart);

  for (let w = 0; w < 6; w += 1) {
    const row: CalendarCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      row.push({
        date: new Date(cursor),
        inMonth: cursor.getMonth() === month.getMonth(),
        week: isoWeekNumber(cursor),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(row);
    // Stop early if next week is entirely next month and we already filled current month
    if (
      w >= 3 &&
      row.every((cell) => cell.date.getMonth() !== month.getMonth())
    ) {
      weeks.pop();
      break;
    }
  }

  return weeks;
}

export function monthsSpanned(start: Date, end: Date): Date[] {
  const months: Date[] = [];
  let cursor = startOfMonth(start);
  const last = startOfMonth(end);
  while (cursor <= last) {
    months.push(new Date(cursor));
    cursor = addMonths(cursor, 1);
  }
  return months.slice(0, 18);
}

export function formatDisplayDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
