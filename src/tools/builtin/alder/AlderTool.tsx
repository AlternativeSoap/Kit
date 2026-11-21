"use client";

import { useMemo, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { parseDateInput, toInputValue } from "@/tools/builtin/dato/calc";
import { type ToolPrefill } from "@/tools/prefill";
import { calculateAge } from "./calc";

function prefillDate(prefill: ToolPrefill | undefined, key: string): string | null {
  const raw = prefill?.[key];
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = parseDateInput(raw);
  return date && toInputValue(date) === raw ? raw : null;
}

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

export function AlderTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.alder;

  const today = useMemo(() => toInputValue(new Date()), []);
  const [birth, setBirth] = useState(
    prefillDate(prefill, "birth") ?? prefillDate(prefill, "date") ?? "",
  );
  const [reference, setReference] = useState(
    prefillDate(prefill, "reference") ?? prefillDate(prefill, "ref") ?? today,
  );

  const result = useMemo(() => {
    const birthDate = parseDateInput(birth);
    if (!birthDate) return null;
    const refDate = parseDateInput(reference || today);
    if (!refDate) return null;
    return calculateAge(birthDate, refDate);
  }, [birth, reference, today]);

  const headline = result
    ? `${formatNumber(result.years, locale, 0)} ${t.years}, ${formatNumber(result.months, locale, 0)} ${t.months}, ${formatNumber(result.days, locale, 0)} ${t.days}`
  : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field label={t.birth} hint={t.birthHint}>
          <input
            type="date"
            value={birth}
            onChange={(event) => setBirth(event.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label={t.reference} hint={t.referenceHint}>
          <input
            type="date"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
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
                  <p className="text-xs text-muted">{t.age}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {headline}
                  </p>
                </div>
                <CopyButton
                  value={headline}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.totalDays}</dt>
                <dd className="font-medium">
                  {formatNumber(result.totalDays, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.nextBirthday}</dt>
                <dd className="font-medium">
                  {formatNumber(result.nextBirthdayInDays, locale, 0)}
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