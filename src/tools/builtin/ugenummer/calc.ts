/** ISO week number (1–53) for a local calendar date. */
export function isoWeek(date: Date): {
  week: number;
  year: number;
  weekday: number;
} | null {
  if (Number.isNaN(date.getTime())) return null;

  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);

  return {
    week,
    year: utc.getUTCFullYear(),
    weekday: day,
  };
}
