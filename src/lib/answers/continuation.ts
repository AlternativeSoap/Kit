import type { Locale } from "@/i18n/types";
import { percentOf } from "@/tools/builtin/procent/calc";
import {
  convertUnits,
  type UnitCategory,
} from "@/tools/builtin/enheder/calc";
import type { AnswerSpec } from "./parse";
import { NUMBER_SOURCE, parseLocaleNumber } from "./numbers";

export type ContinuationContext =
  | {
      kind: "percentOf";
      base: number;
      locale: Locale;
    }
  | {
      kind: "units";
      from: string;
      to: string;
      category: UnitCategory;
      locale: Locale;
    };

const N = `(${NUMBER_SOURCE})`;

/** Build short-lived context from a successful answer. */
export function contextFromAnswer(
  spec: AnswerSpec,
  locale: Locale,
): ContinuationContext | null {
  if (spec.kind === "percent" && spec.mode === "of") {
    return { kind: "percentOf", base: spec.b, locale };
  }
  if (spec.kind === "units") {
    return {
      kind: "units",
      from: spec.from,
      to: spec.to,
      category: spec.category,
      locale,
    };
  }
  return null;
}

/**
 * Explicit follow-ups only. Returns null when the query is unrelated or
 * ambiguous so normal search is not polluted.
 */
export function parseContinuation(
  query: string,
  context: ContinuationContext | null,
): AnswerSpec | null {
  if (!context) return null;
  const normalized = query
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/ ?\?+$/, "");
  if (!normalized) return null;

  if (context.kind === "percentOf") {
    const match = new RegExp(
      `^(?:(?:what about|and|og|hvad med) )?${N} ?(?:%|percent|pct\\.?|procent)$`,
    ).exec(normalized);
    if (!match) return null;
    const p = parseLocaleNumber(match[1]!, context.locale);
    if (p === null) return null;
    const value = percentOf(p, context.base);
    if (value === null) return null;
    return {
      kind: "percent",
      mode: "of",
      a: p,
      b: context.base,
      value,
    };
  }

  const unitMatch = new RegExp(
    `^(?:(?:and|og|what about|hvad med) )?${N}(?: ?([a-z²³°]+))?$`,
  ).exec(normalized);
  if (!unitMatch) return null;
  const value = parseLocaleNumber(unitMatch[1]!, context.locale);
  if (value === null) return null;
  const from = unitMatch[2] ? unitMatch[2] : context.from;
  // Only continue when the typed unit matches the prior from-unit, or was omitted.
  if (unitMatch[2] && unitMatch[2] !== context.from) return null;
  const result = convertUnits(context.category, value, from, context.to);
  if (result === null) return null;
  return {
    kind: "units",
    category: context.category,
    value,
    from,
    to: context.to,
    result,
  };
}
