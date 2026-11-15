/** Minutes since midnight, or null when the token is not a clock time. */
export function parseClockToken(raw: string): number | null {
  const match = /^(\d{1,2})[:.](\d{2})$/.exec(raw.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Elapsed minutes from start to end. Spans that cross midnight roll forward. */
export function minutesBetweenClocks(start: number, end: number): number {
  if (end === start) return 0;
  if (end > start) return end - start;
  return end + 24 * 60 - start;
}

export function formatClock(totalMinutes: number): string {
  const safe = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
