"use client";

import { useMemo, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateBmi, type BmiCategory } from "./calc";

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

function categoryLabel(category: BmiCategory, labels: {
  underweight: string;
  normal: string;
  overweight: string;
  obese: string;
}): string {
  switch (category) {
    case "underweight":
      return labels.underweight;
    case "normal":
      return labels.normal;
    case "overweight":
      return labels.overweight;
    case "obese":
      return labels.obese;
    default:
      return labels.normal;
  }
}

export function BmiTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.bmi;

  const [height, setHeight] = useState(
    prefillNumber(prefill, "height", { min: 0 }) ?? "175",
  );
  const [weight, setWeight] = useState(
    prefillNumber(prefill, "weight", { min: 0 }) ?? "70",
  );

  const result = useMemo(() => {
    const heightN = parseField(height);
    const weightN = parseField(weight);
    if (heightN === undefined || weightN === undefined) return null;
    return calculateBmi(heightN, weightN);
  }, [height, weight]);

  const categoryText = result ? categoryLabel(result.category, t) : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field label={t.height} hint={t.heightHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label={t.weight} hint={t.weightHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            className={fieldClass}
          />
        </Field>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t.bmi}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatNumber(result.bmi, locale, 1)}
                  </p>
                  <p className="mt-1 text-sm text-muted">{categoryText}</p>
                </div>
                <CopyButton
                  value={formatNumber(result.bmi, locale, 1)}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.healthyRange}</dt>
                <dd className="font-medium text-right">
                  {formatNumber(result.healthyMinKg, locale, 1)} to{" "}
                  {formatNumber(result.healthyMaxKg, locale, 1)} kg
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