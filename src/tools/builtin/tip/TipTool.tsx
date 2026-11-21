"use client";

import { useMemo, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateTip } from "./calc";

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

export function TipTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.tip;

  const [bill, setBill] = useState(
    prefillNumber(prefill, "bill", { min: 0 }) ??
      prefillNumber(prefill, "amount", { min: 0 }) ??
      "500",
  );
  const [tipPercent, setTipPercent] = useState(
    prefillNumber(prefill, "tip", { min: 0 }) ??
      prefillNumber(prefill, "percent", { min: 0 }) ??
      "10",
  );
  const [people, setPeople] = useState(
    prefillNumber(prefill, "people", { min: 1, integer: true }) ?? "2",
  );

  const result = useMemo(() => {
    const billN = parseField(bill);
    const tipN = parseField(tipPercent);
    const peopleN = parseField(people);
    if (billN === undefined || tipN === undefined || peopleN === undefined) {
      return null;
    }
    return calculateTip({
      bill: billN,
      tipPercent: tipN,
      people: peopleN,
    });
  }, [bill, tipPercent, people]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field label={t.bill} hint={t.billHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={bill}
            onChange={(event) => setBill(event.target.value)}
            className={fieldClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.tipPercent} hint={t.tipPercentHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={tipPercent}
              onChange={(event) => setTipPercent(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={t.people} hint={t.peopleHint}>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={people}
              onChange={(event) => setPeople(event.target.value)}
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
                  <p className="text-xs text-muted">{t.total}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatKr(result.total, locale, 2)}
                  </p>
                </div>
                <CopyButton
                  value={formatNumber(result.total, locale, 2)}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.tip}</dt>
                <dd className="font-medium">{formatKr(result.tip, locale, 2)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.perPerson}</dt>
                <dd className="font-medium">
                  {formatKr(result.perPerson, locale, 2)}
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