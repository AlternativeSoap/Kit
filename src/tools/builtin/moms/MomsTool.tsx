"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import { prefillChoice, prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateMoms, type MomsMode } from "./calc";

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

const MODES: readonly MomsMode[] = ["add", "remove"];

export function MomsTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.moms;

  const [amount, setAmount] = useState(
    prefillNumber(prefill, "amount", { min: 0 }) ?? "1000",
  );
  const [mode, setMode] = useState<MomsMode>(
    prefillChoice(prefill, "mode", MODES) ?? "add",
  );
  const [rate, setRate] = useState(
    prefillNumber(prefill, "rate", { min: 0, max: 100 }) ?? "25",
  );

  const result = useMemo(() => {
    const amountN = Number(amount.replace(",", "."));
    const rateN = Number(rate.replace(",", "."));
    return calculateMoms(amountN, rateN, mode);
  }, [amount, rate, mode]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="inline-flex rounded-[10px] border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setMode("add")}
            className={`kit-touch-target rounded-[8px] px-3 py-1.5 text-sm transition-colors sm:min-h-0 ${
              mode === "add"
                ? "bg-accent text-on-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.addVat}
          </button>
          <button
            type="button"
            onClick={() => setMode("remove")}
            className={`kit-touch-target rounded-[8px] px-3 py-1.5 text-sm transition-colors sm:min-h-0 ${
              mode === "remove"
                ? "bg-accent text-on-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.removeVat}
          </button>
        </div>

        <Field
          label={mode === "add" ? t.amountNet : t.amountGross}
          hint={mode === "add" ? t.amountNetHint : t.amountGrossHint}
        >
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
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
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="border-b border-border py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t.net}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatKr(result.net, locale, 2)}
                  </p>
                </div>
                <CopyButton
                  value={formatNumber(result.net, locale, 2)}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <div className="border-b border-border py-3">
              <p className="text-xs text-muted">
                {t.vat} ({formatNumber(result.ratePercent, locale, 1)}%)
              </p>
              <p className="mt-1 text-lg font-medium">
                {formatKr(result.vat, locale, 2)}
              </p>
            </div>
            <div className="py-3">
              <p className="text-xs text-muted">{t.gross}</p>
              <p className="mt-1 text-lg font-medium">
                {formatKr(result.gross, locale, 2)}
              </p>
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
