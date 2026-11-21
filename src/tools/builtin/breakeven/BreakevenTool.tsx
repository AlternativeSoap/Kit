"use client";

import { useMemo, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateBreakEven } from "./calc";

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

export function BreakevenTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.breakeven;

  const [fixedCosts, setFixedCosts] = useState(
    prefillNumber(prefill, "fixed", { min: 0 }) ??
      prefillNumber(prefill, "fixedCosts", { min: 0 }) ??
      "50000",
  );
  const [pricePerUnit, setPricePerUnit] = useState(
    prefillNumber(prefill, "price", { min: 0 }) ?? "200",
  );
  const [variablePerUnit, setVariablePerUnit] = useState(
    prefillNumber(prefill, "variable", { min: 0 }) ?? "80",
  );

  const result = useMemo(() => {
    const fixedN = parseField(fixedCosts);
    const priceN = parseField(pricePerUnit);
    const variableN = parseField(variablePerUnit);
    if (fixedN === undefined || priceN === undefined || variableN === undefined) {
      return null;
    }
    return calculateBreakEven({
      fixedCosts: fixedN,
      pricePerUnit: priceN,
      variablePerUnit: variableN,
    });
  }, [fixedCosts, pricePerUnit, variablePerUnit]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field label={t.fixedCosts} hint={t.fixedCostsHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={fixedCosts}
            onChange={(event) => setFixedCosts(event.target.value)}
            className={fieldClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.pricePerUnit} hint={t.pricePerUnitHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={pricePerUnit}
              onChange={(event) => setPricePerUnit(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={t.variablePerUnit} hint={t.variablePerUnitHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={variablePerUnit}
              onChange={(event) => setVariablePerUnit(event.target.value)}
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
                  <p className="text-xs text-muted">{t.units}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatNumber(result.units, locale, 2)}
                  </p>
                </div>
                <CopyButton
                  value={formatNumber(result.units, locale, 2)}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.revenue}</dt>
                <dd className="font-medium">
                  {formatKr(result.revenue, locale, 2)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.contribution}</dt>
                <dd className="font-medium">
                  {formatKr(result.contribution, locale, 2)}
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