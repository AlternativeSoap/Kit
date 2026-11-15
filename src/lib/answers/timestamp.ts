/**
 * Unix timestamp recognition. Distinguishes seconds vs milliseconds.
 * Bare 4-digit years and ordinary small integers are rejected.
 */

export type TimestampAnswer = {
  kind: "timestamp";
  input: number;
  unit: "s" | "ms";
  date: Date;
};

const LABELED =
  /^(?:unix(?:\s+timestamp)?|timestamp|epoch)\s+(\d{10,13})$/i;
const BARE = /^(\d{10,13})$/;

function interpret(raw: string): TimestampAnswer | null {
  const input = Number(raw);
  if (!Number.isFinite(input) || !Number.isInteger(input)) return null;

  // Milliseconds: 13 digits, or 12 with leading 1 for near-term.
  if (raw.length >= 12) {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return null;
    // Reject absurd years outside 1970–2100-ish for clarity.
    const year = date.getUTCFullYear();
    if (year < 1970 || year > 2100) return null;
    return { kind: "timestamp", input, unit: "ms", date };
  }

  // Seconds: 10 digits covering ~2001–2286, or labeled 10–11.
  if (raw.length === 10 || raw.length === 11) {
    const date = new Date(input * 1000);
    if (Number.isNaN(date.getTime())) return null;
    const year = date.getUTCFullYear();
    if (year < 1970 || year > 2100) return null;
    return { kind: "timestamp", input, unit: "s", date };
  }

  return null;
}

export function parseTimestamp(query: string): TimestampAnswer | null {
  const trimmed = query.trim();
  const labeled = LABELED.exec(trimmed);
  if (labeled) return interpret(labeled[1]!);
  const bare = BARE.exec(trimmed);
  if (bare) return interpret(bare[1]!);
  return null;
}
