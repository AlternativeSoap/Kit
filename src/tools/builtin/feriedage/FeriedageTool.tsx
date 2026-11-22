"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { parseDateInput, toInputValue } from "@/tools/builtin/dato/calc";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateVacation, DEFAULT_DAYS_PER_YEAR } from "./calc";

function prefillDate(prefill: ToolPrefill | undefined, key: string): string | null {
  const raw = prefill?.[key];
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = parseDateInput(raw);
  return date && toInputValue(date) === raw ? raw : null;
}

function defaultStart(): string {
  const d = new Date();
  d.setMonth(0, 1);
  return toInputValue(d);
}

export function FeriedageTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const today = useMemo(() => toInputValue(new Date()), []);

  const [start, setStart] = useState(
    prefillDate(prefill, "start") ??
      prefillDate(prefill, "from") ??
      defaultStart(),
  );
  const [daysPerYear, setDaysPerYear] = useState(
    prefillNumber(prefill, "days", { min: 0 }) ??
      prefillNumber(prefill, "perYear", { min: 0 }) ??
      String(DEFAULT_DAYS_PER_YEAR),
  );
  const [used, setUsed] = useState(
    prefillNumber(prefill, "used", { min: 0 }) ?? "0",
  );
  const [asOf, setAsOf] = useState(
    prefillDate(prefill, "asOf") ??
      prefillDate(prefill, "date") ??
      today,
  );

  const result = useMemo(() => {
    const startDate = parseDateInput(start);
    const asOfDate = parseDateInput(asOf);
    if (!startDate || !asOfDate) return null;
    const daysN = Number(daysPerYear.replace(",", "."));
    const usedN = Number(used.replace(",", "."));
    if (!Number.isFinite(daysN) || !Number.isFinite(usedN)) return null;
    return calculateVacation({
      startDate,
      asOfDate,
      daysPerYear: daysN,
      usedDays: usedN,
    });
  }, [start, daysPerYear, used, asOf]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";

  const summary = result
    ? da
      ? `Optjent ${formatNumber(result.accrued, locale, 2)} dage, brugt ${formatNumber(result.used, locale, 2)}, resterende ${formatNumber(result.remaining, locale, 2)}. Optjent i år: ${formatNumber(result.earnedThisYear, locale, 2)}.`
      : `Accrued ${formatNumber(result.accrued, locale, 2)} days, used ${formatNumber(result.used, locale, 2)}, remaining ${formatNumber(result.remaining, locale, 2)}. Earned this year: ${formatNumber(result.earnedThisYear, locale, 2)}.`
    : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field
          label={da ? "Ansættelsesstart" : "Employment start"}
          hint={
            da
              ? "Bruges hvis du startede midt i kalenderåret"
              : "Used if you started mid calendar year"
          }
        >
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={fieldClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={da ? "Dage pr. år" : "Days per year"}
            hint={da ? "Standard i DK er ofte 25" : "Denmark often uses 25"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={daysPerYear}
              onChange={(e) => setDaysPerYear(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={da ? "Brugte dage" : "Days used"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={used}
              onChange={(e) => setUsed(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>
        <Field
          label={da ? "Pr. dato" : "As of date"}
          hint={da ? "Beregner optjening frem til denne dag" : "Accrual through this day"}
        >
          <input
            type="date"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
            className={fieldClass}
          />
        </Field>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="text-xs text-muted">
                  {da ? "Resterende dage" : "Days remaining"}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {formatNumber(result.remaining, locale, 2)}
                </p>
              </div>
              <CopyButton
                value={summary}
                label={copyLabel}
                copiedLabel={copiedLabel}
              />
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Optjent (i år)" : "Accrued (this year)"}
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(result.accrued, locale, 2)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Brugt" : "Used"}
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(result.used, locale, 2)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Optjent i år" : "Earned this year"}
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(result.earnedThisYear, locale, 2)}
                </dd>
              </div>
            </dl>
            <p className="pb-3 text-xs text-muted">
              {da
                ? "Enkel proportionel model over kalenderåret. Dansk ferielov bruger ferieår og kan afvige. Tjek kontrakt og HR."
                : "Simple proportional accrual over the calendar year. Danish holiday rules use a holiday year and can differ. Check your contract and HR."}
            </p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Vælg startdato og pr. dato (pr. dato skal være på eller efter start)."
              : "Choose a start date and as-of date (as-of must be on or after start)."}
          </p>
        )}
      </div>
    </div>
  );
}
