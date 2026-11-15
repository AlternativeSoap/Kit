"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateLan, termMonthsFromYearsAndExtra } from "./calc";

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

export function LanTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.lan;

  const [principal, setPrincipal] = useState(
    prefillNumber(prefill, "principal", { min: 0 }) ??
      prefillNumber(prefill, "amount", { min: 0 }) ??
      "200000",
  );
  const [rate, setRate] = useState(
    prefillNumber(prefill, "rate", { min: 0, max: 100 }) ?? "3.5",
  );
  const [years, setYears] = useState(
    prefillNumber(prefill, "years", { min: 0, max: 50 }) ?? "30",
  );
  const [extraMonths, setExtraMonths] = useState(
    prefillNumber(prefill, "months", { min: 0, max: 11, integer: true }) ?? "0",
  );

  const result = useMemo(() => {
    const principalN = Number(principal.replace(",", "."));
    const rateN = Number(rate.replace(",", "."));
    const yearsN = Number(years.replace(",", "."));
    const extraN = Number(extraMonths.replace(",", "."));
    const termMonths = termMonthsFromYearsAndExtra(yearsN, extraN);
    if (termMonths === null) return null;
    return calculateLan(principalN, rateN, termMonths);
  }, [principal, rate, years, extraMonths]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field label={t.principal} hint={t.principalHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1000"
            value={principal}
            onChange={(event) => setPrincipal(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </Field>
        <Field label={t.rate} hint={t.rateHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.01"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.years} hint={t.yearsHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </Field>
          <Field label={t.extraMonths} hint={t.extraMonthsHint}>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="11"
              step="1"
              value={extraMonths}
              onChange={(event) => setExtraMonths(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </Field>
        </div>
        <p className="text-sm text-muted">
          {t.relatedNote}{" "}
          <Link href="/t/procent" className="text-accent hover:underline">
            {t.relatedPercent}
          </Link>
          {", "}
          <Link href="/t/lon" className="text-accent hover:underline">
            {t.relatedLon}
          </Link>
        </p>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t.monthlyPayment}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatKr(result.monthlyPayment, locale, 2)}
                  </p>
                </div>
                <CopyButton
                  value={formatNumber(result.monthlyPayment, locale, 2)}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.totalPaid}</dt>
                <dd className="font-medium">
                  {formatKr(result.totalPaid, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.totalInterest}</dt>
                <dd className="font-medium">
                  {formatKr(result.totalInterest, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.termMonths}</dt>
                <dd className="font-medium">{result.termMonths}</dd>
              </div>
            </dl>
            <p className="pb-3 text-xs text-muted">{t.disclaimer}</p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}