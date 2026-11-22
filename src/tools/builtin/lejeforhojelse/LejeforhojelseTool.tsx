"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import { prefillChoice, prefillNumber, type ToolPrefill } from "@/tools/prefill";
import {
  calculateRentIncrease,
  type RentIncreaseMode,
} from "./calc";

const MODES: readonly RentIncreaseMode[] = ["percent", "new"];

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function LejeforhojelseTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [current, setCurrent] = useState(
    prefillNumber(prefill, "rent", { min: 0 }) ??
      prefillNumber(prefill, "current", { min: 0 }) ??
      "9500",
  );
  const [mode, setMode] = useState<RentIncreaseMode>(
    prefillChoice(prefill, "mode", MODES) ?? "percent",
  );
  const [percent, setPercent] = useState(
    prefillNumber(prefill, "percent", { min: 0 }) ??
      prefillNumber(prefill, "increase", { min: 0 }) ??
      "3.5",
  );
  const [newRent, setNewRent] = useState(
    prefillNumber(prefill, "new", { min: 0 }) ?? "9832.5",
  );
  const [cap, setCap] = useState(
    prefillNumber(prefill, "cap", { min: 0 }) ?? "",
  );

  const result = useMemo(() => {
    const currentN = parseField(current);
    if (currentN === undefined) return null;
    const capN = parseField(cap);
    if (mode === "percent") {
      const pct = parseField(percent);
      if (pct === undefined) return null;
      return calculateRentIncrease({
        currentRent: currentN,
        mode: "percent",
        increasePercent: pct,
        capPercent: capN,
      });
    }
    const next = parseField(newRent);
    if (next === undefined) return null;
    return calculateRentIncrease({
      currentRent: currentN,
      mode: "new",
      newRent: next,
      capPercent: capN,
    });
  }, [current, mode, percent, newRent, cap]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";

  const summary = result
    ? da
      ? `Ny husleje ${formatKr(result.newRent, locale, 2)}/md (${formatNumber(result.increasePercent, locale, 2)} %). Forskel ${formatKr(result.monthlyDiff, locale, 2)}/md, ${formatKr(result.annualDiff, locale, 2)}/år.`
      : `New rent ${formatKr(result.newRent, locale, 2)}/mo (${formatNumber(result.increasePercent, locale, 2)}%). Diff ${formatKr(result.monthlyDiff, locale, 2)}/mo, ${formatKr(result.annualDiff, locale, 2)}/yr.`
    : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field
          label={da ? "Nuværende husleje (md.)" : "Current rent (monthly)"}
          hint={da ? "Beløb i kroner før stigning" : "Amount before the increase"}
        >
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={fieldClass}
          />
        </Field>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "percent" as const, label: da ? "Stigning i %" : "Increase %" },
              { id: "new" as const, label: da ? "Ny husleje" : "New rent" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm transition-colors sm:min-h-0 ${
                mode === item.id
                  ? "border-accent bg-accent text-on-accent"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {mode === "percent" ? (
          <Field
            label={da ? "Stigning (%)" : "Increase (%)"}
            hint={da ? "Fx 3,5 for 3,5 %" : "e.g. 3.5 for 3.5%"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className={fieldClass}
            />
          </Field>
        ) : (
          <Field label={da ? "Ny husleje (md.)" : "New rent (monthly)"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={newRent}
              onChange={(e) => setNewRent(e.target.value)}
              className={fieldClass}
            />
          </Field>
        )}

        <Field
          label={da ? "Loft % (valgfrit)" : "Cap % (optional)"}
          hint={
            da
              ? "Advarsel hvis stigningen overstiger loftet. Tjek din lejekontrakt og regler."
              : "Warns if the increase exceeds the cap. Check your lease and local rules."
          }
        >
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={cap}
            onChange={(e) => setCap(e.target.value)}
            className={fieldClass}
            placeholder={da ? "Fx 4" : "e.g. 4"}
          />
        </Field>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="text-xs text-muted">
                  {da ? "Ny husleje pr. måned" : "New monthly rent"}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {formatKr(result.newRent, locale, 2)}
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
                  {da ? "Stigning" : "Increase"}
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(result.increasePercent, locale, 2)}%
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Forskel pr. måned" : "Monthly difference"}
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatKr(result.monthlyDiff, locale, 2)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Forskel pr. år" : "Annual difference"}
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatKr(result.annualDiff, locale, 2)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Årlig husleje (ny)" : "Annual rent (new)"}
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatKr(result.annualNew, locale, 2)}
                </dd>
              </div>
            </dl>
            {result.overCap && result.capPercent !== null ? (
              <p className="pb-3 text-sm text-foreground" role="status">
                {da
                  ? `Stigningen overstiger dit angivne loft på ${formatNumber(result.capPercent, locale, 2)} %.`
                  : `The increase exceeds your stated cap of ${formatNumber(result.capPercent, locale, 2)}%.`}
              </p>
            ) : (
              <p className="pb-3 text-xs text-muted">
                {da
                  ? "Vejledende beregning. Danske lejeregler og kontrakter kan sætte andre loft."
                  : "Indicative only. Danish tenancy rules and leases may set different caps."}
              </p>
            )}
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Indtast nuværende husleje og stigning eller ny husleje."
              : "Enter current rent and an increase or new rent."}
          </p>
        )}
      </div>
    </div>
  );
}
