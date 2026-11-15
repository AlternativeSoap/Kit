"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateCagr } from "./calc";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function CagrTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.cagr;

  const [startValue, setStartValue] = useState(
    prefillNumber(prefill, "start", { min: 0 }) ??
      prefillNumber(prefill, "startValue", { min: 0 }) ??
      "100000",
  );
  const [endValue, setEndValue] = useState(
    prefillNumber(prefill, "end", { min: 0 }) ??
      prefillNumber(prefill, "endValue", { min: 0 }) ??
      "180000",
  );
  const [years, setYears] = useState(
    prefillNumber(prefill, "years", { min: 0 }) ?? "5",
  );

  const result = useMemo(() => {
    const startN = parseField(startValue);
    const endN = parseField(endValue);
    const yearsN = parseField(years);
    if (startN === undefined || endN === undefined || yearsN === undefined) {
      return null;
    }
    return calculateCagr({
      startValue: startN,
      endValue: endN,
      years: yearsN,
    });
  }, [endValue, startValue, years]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.startValue} hint={t.startValueHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={startValue}
              onChange={(event) => setStartValue(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </Field>
          <Field label={t.endValue} hint={t.endValueHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={endValue}
              onChange={(event) => setEndValue(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </Field>
        </div>
        <Field label={t.years} hint={t.yearsHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={years}
            onChange={(event) => setYears(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </Field>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t.cagr}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatNumber(result.cagrPercent, locale, 2)}%
                  </p>
                </div>
                <CopyButton
                  value={formatNumber(result.cagrPercent, locale, 2)}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.multiple}</dt>
                <dd className="font-medium">
                  {formatNumber(result.multiple, locale, 3)}×
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}