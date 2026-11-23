"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass, Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import {
  prefillChoice,
  prefillNumber,
  type ToolPrefill,
} from "@/tools/prefill";
import { calculateSafetyStock } from "./calc";

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

const LT_MODES = ["off", "on"] as const;
type LtMode = (typeof LT_MODES)[number];

export function SikkerhedslagerTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [demandStdDev, setDemandStdDev] = useState(
    prefillNumber(prefill, "sigma", { min: 0 }) ??
      prefillNumber(prefill, "stddev", { min: 0 }) ??
      "12",
  );
  const [leadTimeDays, setLeadTimeDays] = useState(
    prefillNumber(prefill, "lead", { min: 0 }) ??
      prefillNumber(prefill, "lt", { min: 0 }) ??
      "7",
  );
  const [serviceLevel, setServiceLevel] = useState(
    prefillNumber(prefill, "service", { min: 0.1, max: 99.9 }) ??
      prefillNumber(prefill, "sl", { min: 0.1, max: 99.9 }) ??
      "95",
  );
  const [avgDemand, setAvgDemand] = useState(
    prefillNumber(prefill, "demand", { min: 0 }) ??
      prefillNumber(prefill, "avg", { min: 0 }) ??
      "40",
  );
  const initialLt =
    prefillChoice(prefill, "ltvar", LT_MODES) ??
    (prefillNumber(prefill, "ltsigma", { min: 0 }) ? "on" : "off");
  const [ltMode, setLtMode] = useState<LtMode>(initialLt);
  const [leadTimeStdDev, setLeadTimeStdDev] = useState(
    prefillNumber(prefill, "ltsigma", { min: 0 }) ?? "1",
  );

  const result = useMemo(() => {
    const sigma = parseField(demandStdDev);
    const lt = parseField(leadTimeDays);
    const sl = parseField(serviceLevel);
    if (sigma === undefined || lt === undefined || sl === undefined) {
      return null;
    }
    const avg = parseField(avgDemand);
    const ltSigma = parseField(leadTimeStdDev);
    return calculateSafetyStock({
      demandStdDev: sigma,
      leadTimeDays: lt,
      serviceLevelPercent: sl,
      includeLeadTimeVariability: ltMode === "on",
      avgDemandPerDay: avg,
      leadTimeStdDev: ltSigma,
    });
  }, [
    demandStdDev,
    leadTimeDays,
    serviceLevel,
    avgDemand,
    ltMode,
    leadTimeStdDev,
  ]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";
  const ssText = result ? formatNumber(result.safetyStock, locale, 1) : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={
              da
                ? "Efterspørgsel std.afv. (pr. dag)"
                : "Demand std. dev. (per day)"
            }
            hint={
              da
                ? "σd for daglig efterspørgsel."
                : "σd for daily demand."
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={demandStdDev}
              onChange={(e) => setDemandStdDev(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={da ? "Leveringstid (dage)" : "Lead time (days)"}
            hint={da ? "L i dage." : "L in days."}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={da ? "Serviceniveau (%)" : "Service level (%)"}
            hint={
              da
                ? "Konverteres til Z via normalfordelingen."
                : "Converted to Z via the normal distribution."
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0.1"
              max="99.9"
              step="0.1"
              value={serviceLevel}
              onChange={(e) => setServiceLevel(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={
              da
                ? "Gns. efterspørgsel (pr. dag)"
                : "Avg. demand (per day)"
            }
            hint={
              da
                ? "Valgfri. Bruges til ROP og LT-varians."
                : "Optional. Used for ROP and LT variance."
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={avgDemand}
              onChange={(e) => setAvgDemand(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Leveringstidsvarians" : "Lead time variability"}
          </p>
          <Segmented
            value={ltMode}
            onChange={setLtMode}
            ariaLabel={
              da ? "Leveringstidsvarians" : "Lead time variability"
            }
            options={[
              { id: "off", label: da ? "Fra" : "Off" },
              { id: "on", label: da ? "Til" : "On" },
            ]}
          />
        </div>

        {ltMode === "on" ? (
          <Field
            label={
              da
                ? "Leveringstid std.afv. (dage)"
                : "Lead time std. dev. (days)"
            }
            hint={
              da
                ? "Formel: Z × √(L·σd² + d²·σL²)."
                : "Formula: Z × √(L·σd² + d²·σL²)."
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={leadTimeStdDev}
              onChange={(e) => setLeadTimeStdDev(e.target.value)}
              className={fieldClass}
            />
          </Field>
        ) : null}
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">
                    {da ? "Sikkerhedslager" : "Safety stock"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatNumber(result.safetyStock, locale, 1)}{" "}
                    {da ? "enheder" : "units"}
                  </p>
                </div>
                <CopyButton
                  value={ssText}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Z</dt>
                <dd className="font-medium">
                  {formatNumber(result.z, locale, 3)}
                </dd>
              </div>
              {result.reorderPoint !== null ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Genbestillingspunkt (ROP)" : "Reorder point (ROP)"}
                  </dt>
                  <dd className="font-medium">
                    {formatNumber(result.reorderPoint, locale, 1)}
                  </dd>
                </div>
              ) : null}
              {result.demandDuringLeadTime !== null ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da
                      ? "Efterspørgsel under LT"
                      : "Demand during lead time"}
                  </dt>
                  <dd className="font-medium">
                    {formatNumber(result.demandDuringLeadTime, locale, 1)}
                  </dd>
                </div>
              ) : null}
            </dl>
            <p className="border-t border-border py-3 text-xs text-muted">
              {result.formula === "withLtVariability"
                ? da
                  ? "SS = Z × √(L·σd² + d²·σL²). ROP = d·L + SS når gennemsnitlig efterspørgsel er angivet."
                  : "SS = Z × √(L·σd² + d²·σL²). ROP = d·L + SS when average demand is entered."
                : da
                  ? "SS = Z × σd × √L. ROP = d·L + SS når gennemsnitlig efterspørgsel er angivet."
                  : "SS = Z × σd × √L. ROP = d·L + SS when average demand is entered."}
            </p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Udfyld standardafvigelse, leveringstid og serviceniveau."
              : "Enter demand std. dev., lead time, and service level."}
          </p>
        )}
      </div>
    </div>
  );
}
