"use client";

import { useMemo, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateInflation } from "./calc";

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

export function InflationTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.inflation;

  const [amount, setAmount] = useState(
    prefillNumber(prefill, "amount", { min: 0 }) ?? "1000",
  );
  const [annualRate, setAnnualRate] = useState(
    prefillNumber(prefill, "rate", { min: 0 }) ?? "3",
  );
  const [years, setYears] = useState(
    prefillNumber(prefill, "years", { min: 0 }) ?? "10",
  );

  const result = useMemo(() => {
    const amountN = parseField(amount);
    const rateN = parseField(annualRate);
    const yearsN = parseField(years);
    if (amountN === undefined || rateN === undefined || yearsN === undefined) {
      return null;
    }
    return calculateInflation({
      amount: amountN,
      annualPercent: rateN,
      years: yearsN,
    });
  }, [amount, annualRate, years]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field label={t.amount} hint={t.amountHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className={fieldClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.rate} hint={t.rateHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={annualRate}
              onChange={(event) => setAnnualRate(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={t.years} hint={t.yearsHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t.futureValue}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatKr(result.futureValue, locale, 2)}
                  </p>
                </div>
                <CopyButton
                  value={formatNumber(result.futureValue, locale, 2)}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.purchasingPower}</dt>
                <dd className="font-medium">
                  {formatKr(result.purchasingPower, locale, 2)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.totalInflation}</dt>
                <dd className="font-medium">
                  {formatNumber(result.totalInflationPercent, locale, 2)}%
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