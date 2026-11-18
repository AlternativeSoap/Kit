"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  SimpleToolActions,
  SimpleToolShell,
  simpleGhostBtnClass,
} from "@/components/tools/SimpleToolShell";
import {
  ErrorBanner,
  Field,
  fieldClass,
  primaryBtnClass,
} from "@/components/tools/ui";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import {
  getSimpleDef,
  type SimpleField,
  type SimpleResultRow,
  type SimpleToolDef,
} from "./defs";

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

function isNumericField(field: SimpleField) {
  if (field.kind === "number") return true;
  if (field.kind === "select" || field.multiline) return false;
  const sample = field.defaultValue?.trim() ?? "";
  return sample !== "" && /^-?\d+([.,]\d+)?$/.test(sample);
}

function isCompactField(field: SimpleField) {
  if (field.multiline || field.kind === "select") return false;
  return isNumericField(field);
}

/** Pack short fields into pairs so forms stay scannable. */
function groupFields(fields: SimpleField[]): SimpleField[][] {
  const rows: SimpleField[][] = [];
  let i = 0;
  while (i < fields.length) {
    const current = fields[i]!;
    const next = fields[i + 1];
    if (
      next &&
      isCompactField(current) &&
      isCompactField(next) &&
      !current.hintEn &&
      !current.hintDa &&
      !next.hintEn &&
      !next.hintDa
    ) {
      rows.push([current, next]);
      i += 2;
      continue;
    }
    rows.push([current]);
    i += 1;
  }
  return rows;
}

function useSegmentedSelect(field: SimpleField) {
  return (
    field.kind === "select" &&
    !!field.options &&
    field.options.length >= 2 &&
    field.options.length <= 5
  );
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

  const [rolled, setRolled] = useState<{
    result: { rows: SimpleResultRow[] | null; errored: boolean };
    values: Record<string, string>;
  } | null>(null);

  const roll = () => {
    if (!def) return;
    setRolled({ result: runCompute(def, values), values: { ...values } });
  };

  useEffect(() => {
    if (!def?.volatile) return;
    const frame = requestAnimationFrame(() => {
      setRolled({
        result: runCompute(def, values),
        values: { ...values },
      });
    });
    return () => cancelAnimationFrame(frame);
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
  const stale =
    volatile && rolled !== null && !sameValues(rolled.values, values);

  if (!def) return null;

  const actionLabel = da
    ? (def.actionDa ?? "Prøv igen")
    : (def.actionEn ?? "Try again");
  const resetLabel = da ? "Nulstil" : "Reset";
  const copyAllLabel = da ? "Kopiér alle" : "Copy all";
  const resultTitle = da ? "Resultat" : "Result";
  const emptyLabel = da
    ? "Udfyld felterne. Resultatet vises her med det samme."
    : "Fill in the fields. The result shows here right away.";
  const liveHint = da
    ? "Opdateres mens du skriver"
    : "Updates as you type";
  const fieldRows = groupFields(def.fields);

  function setField(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function resetFields() {
    if (!def) return;
    setValues(seedValues(def));
    if (def.volatile) {
      const next = seedValues(def);
      setRolled({ result: runCompute(def, next), values: next });
    }
  }

  const copyAllValue =
    computed.rows
      ?.filter((row) => !row.omitFromCopyAll)
      .map((row) => {
        const raw = da && row.valueDa !== undefined ? row.valueDa : row.value;
        const label = da ? row.labelDa : row.labelEn;
        return `${label}: ${formatDisplay(
          raw,
          locale,
          row.numeric ?? def.tags.includes("finance"),
        )}`;
      })
      .join("\n") ?? "";

  function renderField(field: SimpleField) {
    const label = da ? field.labelDa : field.labelEn;
    const hint = da ? field.hintDa : field.hintEn;
    const value = values[field.key] ?? "";

    if (useSegmentedSelect(field) && field.options) {
      return (
        <div key={field.key} className="space-y-2">
          <div className="text-sm font-medium text-foreground">{label}</div>
          <div className="flex flex-wrap gap-2">
            {field.options.map((opt) => {
              const active = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setField(field.key, opt.value)}
                  className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm transition-colors sm:min-h-0 ${
                    active
                      ? "border-accent bg-accent text-on-accent"
                      : "border-border bg-background text-muted hover:text-foreground"
                  }`}
                >
                  {da ? opt.labelDa : opt.labelEn}
                </button>
              );
            })}
          </div>
          {hint ? <p className="text-xs text-muted">{hint}</p> : null}
        </div>
      );
    }

    return (
      <Field key={field.key} label={label} hint={hint}>
        {field.kind === "select" && field.options ? (
          <select
            value={value}
            onChange={(e) => setField(field.key, e.target.value)}
            className={fieldClass}
          >
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {da ? opt.labelDa : opt.labelEn}
              </option>
            ))}
          </select>
        ) : field.multiline ? (
          <div className="space-y-2">
            <textarea
              value={value}
              onChange={(e) => setField(field.key, e.target.value)}
              rows={Math.min(12, Math.max(5, value.split("\n").length + 1))}
              className={`${fieldClass} min-h-[8rem] font-mono text-[13px] leading-relaxed`}
            />
            {value ? (
              <button
                type="button"
                className={simpleGhostBtnClass}
                onClick={() => setField(field.key, "")}
              >
                {da ? "Ryd tekst" : "Clear text"}
              </button>
            ) : null}
          </div>
        ) : (
          <input
            type={field.kind === "password" ? "password" : "text"}
            inputMode={isNumericField(field) ? "decimal" : undefined}
            value={value}
            onChange={(e) => setField(field.key, e.target.value)}
            className={fieldClass}
            autoComplete={field.kind === "password" ? "new-password" : "off"}
            spellCheck={false}
          />
        )}
      </Field>
    );
  }

  return (
    <SimpleToolShell
      inputs={
        <>
          {!volatile ? (
            <p className="text-xs text-muted">{liveHint}</p>
          ) : null}
          <div className="space-y-4">
            {fieldRows.map((row) =>
              row.length === 2 ? (
                <div
                  key={`${row[0]!.key}-${row[1]!.key}`}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {row.map((field) => renderField(field))}
                </div>
              ) : (
                <div key={row[0]!.key}>{renderField(row[0]!)}</div>
              ),
            )}
          </div>
          {def.fields.length === 0 ? (
            <p className="text-sm text-muted">
              {da
                ? "Resultatet opdateres automatisk."
                : "Results update automatically."}
            </p>
          ) : null}
          {computed.errored ? (
            <ErrorBanner>
              {da
                ? "Tjek felterne. Nogle værdier kan ikke beregnes endnu."
                : "Check the fields. Some values cannot be calculated yet."}
            </ErrorBanner>
          ) : null}
          {stale ? (
            <p className="text-sm text-muted">
              {da
                ? `Felterne er ændret. Tryk på "${actionLabel}" for at opdatere.`
                : `The fields have changed. Press "${actionLabel}" to update.`}
            </p>
          ) : null}
        </>
      }
      footer={
        <SimpleToolActions>
          {def.volatile ? (
            <button type="button" onClick={roll} className={primaryBtnClass}>
              {actionLabel}
            </button>
          ) : null}
          <button
            type="button"
            className={simpleGhostBtnClass}
            onClick={resetFields}
          >
            {resetLabel}
          </button>
        </SimpleToolActions>
      }
      results={
        <>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-foreground">{resultTitle}</h2>
            {computed.rows?.length ? (
              <CopyButton
                value={copyAllValue}
                label={copyAllLabel}
                copiedLabel={copiedLabel}
              />
            ) : null}
          </div>
          {computed.rows?.length ? (
            <dl className="space-y-3">
              {computed.rows.map((row, index) => {
                const raw =
                  da && row.valueDa !== undefined ? row.valueDa : row.value;
                const display = formatDisplay(
                  raw,
                  locale,
                  row.numeric ?? def.tags.includes("finance"),
                );
                const primary = index === 0;
                const multiline = display.includes("\n") || display.length > 80;
                const primaryLarge =
                  primary &&
                  !display.includes("\n") &&
                  display.length <= 28;
                return (
                  <div
                    key={`${row.labelEn}-${index}`}
                    className={`simple-tool-result-row rounded-[12px] border border-border/80 bg-background/70 p-3 ${
                      primary ? "simple-tool-primary" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <dt className="text-xs font-medium text-muted">
                          {da ? row.labelDa : row.labelEn}
                        </dt>
                        <dd
                          className={`mt-1 break-words text-foreground ${
                            primaryLarge
                              ? "text-2xl font-semibold tracking-tight sm:text-3xl"
                              : multiline
                                ? "whitespace-pre-wrap font-mono text-sm leading-relaxed"
                                : primary
                                  ? "font-mono text-base font-semibold leading-relaxed"
                                  : "font-mono text-sm"
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
                  </div>
                );
              })}
            </dl>
          ) : (
            <div className="rounded-[12px] border border-dashed border-border bg-background/50 px-4 py-8 text-center">
              <p className="text-sm text-muted">{emptyLabel}</p>
            </div>
          )}
        </>
      }
    />
  );
}
