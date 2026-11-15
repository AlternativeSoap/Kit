import { parseDateInput, toInputValue } from "@/tools/builtin/barsel/calc";

export const PREGNANCY_DAYS = 280;
export const PREGNANCY_WEEKS = 40;

export type TerminInputMode = "lmp" | "due";

export type TerminResult = {
  mode: TerminInputMode;
  lmp: Date;
  due: Date;
  /** Whole weeks completed (0–40+). */
  pregnancyWeek: number;
  pregnancyDayOfWeek: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  daysSinceLmp: number;
};

function daysBetweenCalendar(a: Date, b: Date): number {
  const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((end - start) / 86_400_000);
}

function addCalendarDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function dueFromLmp(lmp: Date): Date {
  return addCalendarDays(lmp, PREGNANCY_DAYS);
}

export function lmpFromDue(due: Date): Date {
  return addCalendarDays(due, -PREGNANCY_DAYS);
}

export function trimesterForWeek(week: number): 1 | 2 | 3 {
  if (week < 14) return 1;
  if (week < 28) return 2;
  return 3;
}

export function calculateTermin(
  mode: TerminInputMode,
  dateInput: string,
  today: Date,
): TerminResult | null {
  const anchor = parseDateInput(dateInput);
  if (!anchor) return null;

  const todayNoon = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    12,
  );

  const lmp = mode === "lmp" ? anchor : lmpFromDue(anchor);
  const due = mode === "due" ? anchor : dueFromLmp(anchor);

  const daysSinceLmp = daysBetweenCalendar(lmp, todayNoon);
  const daysRemaining = daysBetweenCalendar(todayNoon, due);

  const pregnancyWeek = Math.max(0, Math.floor(daysSinceLmp / 7));
  const pregnancyDayOfWeek = Math.max(0, daysSinceLmp % 7);
  const trimester = trimesterForWeek(pregnancyWeek);

  return {
    mode,
    lmp,
    due,
    pregnancyWeek,
    pregnancyDayOfWeek,
    trimester,
    daysRemaining,
    daysSinceLmp,
  };
}

export { parseDateInput, toInputValue };