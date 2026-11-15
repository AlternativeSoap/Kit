import type { Locale } from "@/i18n/types";

function localeTag(locale: Locale): string {
  return locale === "da" ? "da-DK" : "en-US";
}

export function formatKr(
  value: number,
  locale: Locale = "en",
  digits = 0,
): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatNumber(
  value: number,
  locale: Locale = "en",
  digits = 2,
): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

/**
 * A number without padding zeros, as the calculator shows it: up to 12
 * significant digits, which also hides floating point noise (0.1 + 0.2).
 */
export function formatPrecise(value: number, locale: Locale = "en"): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(localeTag(locale), {
    maximumSignificantDigits: 12,
  }).format(value === 0 ? 0 : value);
}

/**
 * A rounded result that stays readable at any size: two decimals for large
 * values, four for small ones, and four significant digits below 1.
 */
export function formatCompact(value: number, locale: Locale = "en"): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const options: Intl.NumberFormatOptions =
    abs !== 0 && abs < 1
      ? { maximumSignificantDigits: 4 }
      : { maximumFractionDigits: abs >= 100 ? 2 : 4 };
  return new Intl.NumberFormat(localeTag(locale), options).format(
    value === 0 ? 0 : value,
  );
}

export function formatPercent(
  value: number,
  locale: Locale = "en",
  digits = 1,
): string {
  if (!Number.isFinite(value)) return "—";
  return `${formatNumber(value, locale, digits)} %`;
}
