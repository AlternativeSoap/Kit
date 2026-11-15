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

export function daysBetween(start: Date, end: Date): number {
  const ms = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
    Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  return Math.round(ms / 86_400_000);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Weekdays (Mon–Fri) after `start` up to and including `end`, so it mirrors
 * `addDays` with business days. Negative when `end` is before `start`.
 */
export function businessDaysBetween(start: Date, end: Date): number {
  const total = daysBetween(start, end);
  if (total === 0) return 0;

  const step = total > 0 ? 1 : -1;
  const span = Math.abs(total);
  const fullWeeks = Math.floor(span / 7);
  let count = fullWeeks * 5;

  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() + step * fullWeeks * 7);
  for (let i = 0; i < span % 7; i += 1) {
    cursor.setDate(cursor.getDate() + step);
    if (!isWeekend(cursor)) count += 1;
  }

  return step * count;
}

export function addDays(start: Date, amount: number, businessOnly: boolean): Date {
  const result = new Date(start);
  if (!businessOnly) {
    result.setDate(result.getDate() + amount);
    return result;
  }

  const step = amount >= 0 ? 1 : -1;
  let left = Math.abs(amount);
  while (left > 0) {
    result.setDate(result.getDate() + step);
    if (!isWeekend(result)) left -= 1;
  }
  return result;
}

export function formatDisplayDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
