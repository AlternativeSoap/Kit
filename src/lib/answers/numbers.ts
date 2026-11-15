import type { Locale } from "@/i18n/types";

/** Regex source for one unsigned number token such as 1250, 12.5 or 1.250,50. */
export const NUMBER_SOURCE = "\\d[\\d.,]*\\d|\\d";

function isGrouped(parts: string[]): boolean {
  const [head, ...rest] = parts;
  return (
    head !== undefined &&
    head.length >= 1 &&
    head.length <= 3 &&
    rest.every((part) => part.length === 3)
  );
}

/**
 * Reads a typed number in either Danish (1.250,50) or English (1,250.50)
 * notation. A lone separator followed by exactly three digits is ambiguous
 * ("1.250"), so the active language decides how to read it.
 */
export function parseLocaleNumber(raw: string, locale: Locale): number | null {
  const text = raw.trim();
  if (!/^\d[\d.,]*$/.test(text) || /[.,]$/.test(text)) return null;

  const dots = text.split(".").length - 1;
  const commas = text.split(",").length - 1;
  let normalized = text;

  if (dots > 0 && commas > 0) {
    const decimal = text.lastIndexOf(".") > text.lastIndexOf(",") ? "." : ",";
    const group = decimal === "." ? "," : ".";
    if ((decimal === "." ? dots : commas) !== 1) return null;
    const [whole = "", fraction = ""] = text.split(decimal);
    if (!isGrouped(whole.split(group))) return null;
    normalized = `${whole.split(group).join("")}.${fraction}`;
  } else if (dots > 0 || commas > 0) {
    const separator = dots > 0 ? "." : ",";
    const parts = text.split(separator);
    if (parts.length > 2) {
      if (!isGrouped(parts)) return null;
      normalized = parts.join("");
    } else {
      const [head = "", tail = ""] = parts;
      const groupSeparator = locale === "da" ? "." : ",";
      const looksGrouped =
        tail.length === 3 && head.length <= 3 && !head.startsWith("0");
      normalized =
        looksGrouped && separator === groupSeparator
          ? `${head}${tail}`
          : `${head}.${tail}`;
    }
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}
