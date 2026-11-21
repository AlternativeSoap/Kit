"use client";

import { useMemo, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { parseDateInput, toInputValue } from "@/tools/builtin/dato/calc";
import { type ToolPrefill } from "@/tools/prefill";
import { isoWeek } from "./calc";

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

export function UgenummerTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.ugenummer;

  const today = useMemo(() => toInputValue(new Date()), []);
  const [date, setDate] = useState(
    prefillDate(prefill, "date") ?? today,
  );

  const parsedDate = parseDateInput(date);
  const result = parsedDate ? isoWeek(parsedDate) : null;

  const weekdayLabel = useMemo(() => {
    if (!result || !parsedDate) return "";
    const weekdays = "weekdays" in t ? (t as { weekdays?: string[] }).weekdays : undefined;
    if (weekdays && weekdays[result.weekday - 1]) {
      return weekdays[result.weekday - 1];
    }
    return new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-GB", {
      weekday: "long",
    }).format(parsedDate);
  }, [locale, parsedDate, result, t]);

  const headline = result
    ? `${t.week} ${formatNumber(result.week, locale, 0)}`
    : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field label={t.date} hint={t.dateHint}>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
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
                  <p className="text-xs text-muted">{t.isoWeek}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {headline}
                  </p>
                </div>
                <CopyButton
                  value={String(result.week)}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.year}</dt>
                <dd className="font-medium">
                  {formatNumber(result.year, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.weekday}</dt>
                <dd className="font-medium">{weekdayLabel}</dd>
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