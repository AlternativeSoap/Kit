"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateFeriepenge, DEFAULT_FERIEPENGE_RATE } from "./calc";

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

export function FeriepengeTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.feriepenge;

  const [pay, setPay] = useState(
    prefillNumber(prefill, "pay", { min: 0 }) ?? "30000",
  );
  const [rate, setRate] = useState(
    prefillNumber(prefill, "rate", { min: 0, max: 100 }) ??
      String(DEFAULT_FERIEPENGE_RATE),
  );

  const result = useMemo(() => {
    const payN = Number(pay.replace(",", "."));
    const rateN = Number(rate.replace(",", "."));
    return calculateFeriepenge(payN, rateN);
  }, [pay, rate]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field label={t.pay} hint={t.payHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={pay}
            onChange={(event) => setPay(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </Field>
        <Field label={t.rate} hint={t.rateHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.1"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </Field>
        <p className="text-sm text-muted">
          {t.relatedNote}{" "}
          <Link href="/t/lon" className="text-accent hover:underline">
            {t.relatedLink}
          </Link>
        </p>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t.holidayPay}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatKr(result.amount, locale, 2)}
                  </p>
                </div>
                <CopyButton
                  value={formatNumber(result.amount, locale, 2)}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <p className="pb-3 text-xs text-muted">{t.disclaimer}</p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}