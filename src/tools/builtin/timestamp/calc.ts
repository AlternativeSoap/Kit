export type TimestampUnit = "s" | "ms";

export function parseUnixInput(value: string, unit: TimestampUnit): Date | null {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null;
  const ms = unit === "s" ? num * 1000 : num;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function dateToUnix(date: Date, unit: TimestampUnit): string {
  const ms = date.getTime();
  if (unit === "s") return String(Math.trunc(ms / 1000));
  return String(ms);
}

export function parseIsoInput(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatUtcIso(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function formatLocal(
  date: Date,
  locale: "da" | "en",
): string {
  return new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
}