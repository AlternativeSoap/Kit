"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateSmed } from "./calc";

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function SmedTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [currentSetup, setCurrentSetup] = useState(
    prefillNumber(prefill, "current", { min: 0 }) ??
      prefillNumber(prefill, "from", { min: 0 }) ??
      "45",
  );
  const [targetSetup, setTargetSetup] = useState(
    prefillNumber(prefill, "target", { min: 0 }) ??
      prefillNumber(prefill, "to", { min: 0 }) ??
      "15",
  );
  const [setupsPerYear, setSetupsPerYear] = useState(
    prefillNumber(prefill, "setups", { min: 0 }) ??
      prefillNumber(prefill, "year", { min: 0 }) ??
      "200",
  );
  const [hourlyCost, setHourlyCost] = useState(
    prefillNumber(prefill, "cost", { min: 0 }) ??
      prefillNumber(prefill, "rate", { min: 0 }) ??
      "650",
  );
  const [improvementCost, setImprovementCost] = useState(
    prefillNumber(prefill, "investment", { min: 0 }) ??
      prefillNumber(prefill, "improve", { min: 0 }) ??
      "",
  );

  const result = useMemo(() => {
    const current = parseField(currentSetup);
    const target = parseField(targetSetup);
    const setups = parseField(setupsPerYear);
    const rate = parseField(hourlyCost);
    if (
      current === undefined ||
      target === undefined ||
      setups === undefined ||
      rate === undefined
    ) {
      return null;
    }
    const investRaw = improvementCost.trim();
    const invest =
      investRaw === "" ? undefined : parseField(improvementCost);
    if (investRaw !== "" && invest === undefined) return null;
    return calculateSmed({
      currentSetupMinutes: current,
      targetSetupMinutes: target,
      setupsPerYear: setups,
      hourlyCost: rate,
      improvementCost: invest,
    });
  }, [
    currentSetup,
    targetSetup,
    setupsPerYear,
    hourlyCost,
    improvementCost,
  ]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";
  const moneyText = result
    ? formatNumber(result.moneySavedPerYear, locale, 0)
    : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={
              da
                ? "Nuværende omstilling (min)"
                : "Current setup (min)"
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={currentSetup}
              onChange={(e) => setCurrentSetup(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={
              da ? "Mål omstilling (min)" : "Target setup (min)"
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={targetSetup}
              onChange={(e) => setTargetSetup(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={da ? "Omstillinger pr. år" : "Setups per year"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={setupsPerYear}
              onChange={(e) => setSetupsPerYear(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={da ? "Timepris (kr)" : "Hourly cost"}
            hint={
              da
                ? "Omkostning pr. time for omstillingstid."
                : "Cost per hour of setup time."
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={hourlyCost}
              onChange={(e) => setHourlyCost(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <Field
          label={
            da
              ? "Forbedringsinvestering (valgfri)"
              : "Improvement cost (optional)"
          }
          hint={
            da
              ? "Bruges til simpel ROI / tilbagebetalingstid."
              : "Used for a simple ROI / payback note."
          }
        >
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1000"
            value={improvementCost}
            onChange={(e) => setImprovementCost(e.target.value)}
            className={fieldClass}
            placeholder={da ? "Valgfri" : "Optional"}
          />
        </Field>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">
                    {da ? "Besparelse pr. år" : "Savings per year"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatKr(result.moneySavedPerYear, locale, 0)}
                  </p>
                </div>
                <CopyButton
                  value={moneyText}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da
                    ? "Minutter sparet pr. omstilling"
                    : "Minutes saved per setup"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.minutesSavedPerSetup, locale, 1)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Timer sparet pr. år" : "Hours saved per year"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.hoursSavedPerYear, locale, 1)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da
                    ? "Kapacitet frigivet (min/år)"
                    : "Capacity freed (min/year)"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.capacityMinutesFreed, locale, 0)}
                </dd>
              </div>
              {result.roiYears !== null ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Tilbagebetalingstid" : "Payback period"}
                  </dt>
                  <dd className="font-medium">
                    {result.roiYears === 0
                      ? da
                        ? "Straks"
                        : "Immediate"
                      : `${formatNumber(result.roiYears, locale, 2)} ${
                          da ? "år" : "years"
                        }`}
                  </dd>
                </div>
              ) : null}
              {result.roiPercent !== null ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Årlig ROI" : "Annual ROI"}
                  </dt>
                  <dd className="font-medium">
                    {formatNumber(result.roiPercent, locale, 0)}%
                  </dd>
                </div>
              ) : null}
            </dl>
            <p className="border-t border-border py-3 text-xs text-muted">
              {result.roiYears !== null
                ? da
                  ? "ROI er vejledende: årlig besparelse divideret med investering. Medregner ikke produktionseffekter ud over frigivet tid."
                  : "ROI is indicative: yearly savings divided by investment. Does not include production effects beyond freed time."
                : da
                  ? "Angiv en investering for at se tilbagebetalingstid og ROI."
                  : "Enter an investment to see payback and ROI."}
            </p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Udfyld nuværende og mål omstillingstid, antal og timepris. Mål skal være ≤ nuværende."
              : "Enter current and target setup time, setups, and hourly cost. Target must be ≤ current."}
          </p>
        )}
      </div>
    </div>
  );
}
