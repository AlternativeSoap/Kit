"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  ErrorBanner,
  Field,
  fieldClass,
  primaryBtnClass,
} from "@/components/tools/ui";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import { getSimpleDef, type SimpleResultRow, type SimpleToolDef } from "./defs";

function seedValues(
  def: SimpleToolDef,
  prefill?: ToolPrefill,
): Record<string, string> {
  const init: Record<string, string> = {};
  for (const field of def.fields) {
    const fromPrefill = prefill?.[field.key]?.trim();
    if (field.kind === "select" && field.options) {
      const allowed = field.options.map((o) => o.value);
      const choice = prefillChoice(prefill, field.key, allowed);
      init[field.key] = choice ?? field.defaultValue ?? allowed[0] ?? "";
      continue;
    }
    if (fromPrefill) {
      init[field.key] = fromPrefill;
      continue;
    }
    if (prefill?.value && field.key === "text" && !field.defaultValue) {
      init[field.key] = prefill.value;
      continue;
    }
    init[field.key] = field.defaultValue ?? "";
  }
  return init;
}

/**
 * Localizes plain numbers. Values with a decimal point are always formatted.
 * Whole numbers are formatted only when the row asks for it, so identifiers,
 * bit strings and random digits are never regrouped.
 */
function formatDisplay(
  value: string,
  locale: "da" | "en",
  numeric?: boolean,
): string {
  const trimmed = value.trim();
  if (/^-?\d+\.\d+$/.test(trimmed) || (numeric && /^-?\d+$/.test(trimmed))) {
    const n = Number(trimmed);
    if (Number.isFinite(n)) {
      const digits = trimmed.includes(".")
        ? (trimmed.split(".")[1]?.length ?? 0)
        : 0;
      return formatNumber(n, locale, Math.min(digits, 10));
    }
  }
  return value;
}

function runCompute(
  def: SimpleToolDef,
  values: Record<string, string>,
): { rows: SimpleResultRow[] | null; errored: boolean } {
  const filled = def.fields.some((f) => (values[f.key] ?? "").trim().length > 0);
  try {
    const rows = def.compute(values);
    return { rows, errored: filled && rows === null };
  } catch {
    return { rows: null, errored: filled };
  }
}

function sameValues(
  a: Record<string, string>,
  b: Record<string, string>,
): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) if (a[key] !== b[key]) return false;
  return true;
}

export function SimpleTool({
  id,
  prefill,
}: {
  id: string;
  prefill?: ToolPrefill;
}) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const def = getSimpleDef(id);
  const da = locale === "da";
  const copyLabel = dictionary.contrast.copy;
  const copiedLabel = dictionary.contrast.copied;

  const [values, setValues] = useState<Record<string, string>>(() =>
    def ? seedValues(def, prefill) : {},
  );
  const volatile = Boolean(def?.volatile);

  // Random tools produce a new result only when the button is pressed, never
  // while a field is being edited.
  const [rolled, setRolled] = useState<{
    result: { rows: SimpleResultRow[] | null; errored: boolean };
    values: Record<string, string>;
  } | null>(null);

  const roll = () => {
    if (!def) return;
    setRolled({ result: runCompute(def, values), values: { ...values } });
  };

  // The first result is drawn after mount so the server and client markup match.
  useEffect(() => {
    if (!def?.volatile) return;
    const frame = requestAnimationFrame(() => {
      setRolled({
        result: runCompute(def, values),
        values: { ...values },
      });
    });
    return () => cancelAnimationFrame(frame);
    // Only on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liveComputed = useMemo(() => {
    if (!def || def.volatile) {
      return { rows: null as SimpleResultRow[] | null, errored: false };
    }
    return runCompute(def, values);
  }, [def, values]);

  const computed = volatile
    ? (rolled?.result ?? { rows: null, errored: false })
    : liveComputed;
  const stale = volatile && rolled !== null && !sameValues(rolled.values, values);

  if (!def) return null;

  const actionLabel = da
    ? (def.actionDa ?? "Prøv igen")
    : (def.actionEn ?? "Try again");

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          {def.fields.map((field) => {
            const label = da ? field.labelDa : field.labelEn;
            const hint = da ? field.hintDa : field.hintEn;
            return (
              <Field key={field.key} label={label} hint={hint}>
                {field.kind === "select" && field.options ? (
                  <select
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className={fieldClass}
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {da ? opt.labelDa : opt.labelEn}
                      </option>
                    ))}
                  </select>
                ) : field.multiline ? (
                  <textarea
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    rows={8}
                    className={`${fieldClass} font-mono`}
                  />
                ) : (
                  <input
                    type="text"
                    inputMode={field.kind === "number" ? "decimal" : undefined}
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className={fieldClass}
                  />
                )}
              </Field>
            );
          })}
          {def.fields.length === 0 ? (
            <p className="text-sm text-muted">
              {da
                ? "Resultatet opdateres automatisk."
                : "Results update automatically."}
            </p>
          ) : null}
          {def.volatile ? (
            <button
              type="button"
              onClick={roll}
              className={primaryBtnClass}
            >
              {actionLabel}
            </button>
          ) : null}
          {stale ? (
            <p className="text-sm text-muted">
              {da
                ? `Felterne er ændret. Tryk på "${actionLabel}" for at opdatere resultatet.`
                : `The fields have changed. Press "${actionLabel}" to update the result.`}
            </p>
          ) : null}
          {computed.errored ? (
            <ErrorBanner>
              {da
                ? "Tjek felterne. Nogle værdier kan ikke beregnes endnu."
                : "Check the fields. Some values cannot be calculated yet."}
            </ErrorBanner>
          ) : null}
        </div>

        <div className="rounded-[12px] border border-border bg-surface p-4">
          {computed.rows?.length ? (
            <dl className="divide-y divide-border">
              {computed.rows.map((row, index) => {
                const raw =
                  da && row.valueDa !== undefined ? row.valueDa : row.value;
                const display = formatDisplay(
                  raw,
                  locale,
                  row.numeric ?? def.tags.includes("finance"),
                );
                const primary = index === 0;
                return (
                  <div
                    key={`${row.labelEn}-${index}`}
                    className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                        {da ? row.labelDa : row.labelEn}
                      </dt>
                      <dd
                        className={`mt-1 break-words ${
                          primary
                            ? "text-lg font-semibold text-foreground"
                            : "font-mono text-sm text-foreground"
                        }`}
                      >
                        {display}
                      </dd>
                    </div>
                    <CopyButton
                      value={display}
                      label={copyLabel}
                      copiedLabel={copiedLabel}
                    />
                  </div>
                );
              })}
            </dl>
          ) : (
            <p className="py-4 text-sm text-muted">
              {da
                ? "Udfyld felterne for at se resultatet."
                : "Fill in the fields to see results."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
