/**
 * Starting values for a tool, taken from the URL query string. Search answers
 * link to `/t/<slug>?...` so the tool opens with the numbers already typed.
 * Values are untrusted: every tool validates what it reads and falls back to
 * its normal defaults.
 */
export type ToolPrefill = Readonly<Record<string, string>>;

type ParamValue = string | number | boolean | undefined;

const PLAIN_NUMBER = /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i;

export function toolHref(
  slug: string,
  params: Record<string, ParamValue> = {},
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === false) continue;
    search.set(key, value === true ? "1" : String(value));
  }
  const query = search.toString();
  return query ? `/t/${slug}?${query}` : `/t/${slug}`;
}

/** A numeric value as the string a number input expects, or null. */
export function prefillNumber(
  prefill: ToolPrefill | undefined,
  key: string,
  range: { min?: number; max?: number; integer?: boolean } = {},
): string | null {
  const raw = prefill?.[key];
  if (raw === undefined || !PLAIN_NUMBER.test(raw)) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  if (range.integer && !Number.isInteger(value)) return null;
  if (range.min !== undefined && value < range.min) return null;
  if (range.max !== undefined && value > range.max) return null;
  return raw;
}

export function prefillChoice<T extends string>(
  prefill: ToolPrefill | undefined,
  key: string,
  allowed: readonly T[],
): T | null {
  const raw = prefill?.[key];
  return allowed.find((option) => option === raw) ?? null;
}

export function prefillFlag(
  prefill: ToolPrefill | undefined,
  key: string,
): boolean {
  return prefill?.[key] === "1";
}
