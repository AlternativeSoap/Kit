"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  fieldClass,
  Segmented,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import {
  prefillChoice,
  prefillNumber,
  type ToolPrefill,
} from "@/tools/prefill";
import {
  calculateRop,
  zFromServicePct,
  Z_PRESETS,
  type RopMode,
} from "./calc";

const MODES: readonly RopMode[] = ["simple", "service"];

function parseNum(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function GenbestilTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<RopMode>(
    prefillChoice(prefill, "mode", MODES) ?? "simple",
  );
  const [dailyDemand, setDailyDemand] = useState(
    prefillNumber(prefill, "demand", { min: 0 }) ??
      prefillNumber(prefill, "d", { min: 0 }) ??
      "40",
  );
  const [leadTime, setLeadTime] = useState(
    prefillNumber(prefill, "lead", { min: 0 }) ??
      prefillNumber(prefill, "lt", { min: 0 }) ??
      "7",
  );
  const [safetyStock, setSafetyStock] = useState(
    prefillNumber(prefill, "safety", { min: 0 }) ??
      prefillNumber(prefill, "ss", { min: 0 }) ??
      "50",
  );
  const [demandStdDev, setDemandStdDev] = useState(
    prefillNumber(prefill, "sigma", { min: 0 }) ??
      prefillNumber(prefill, "stddev", { min: 0 }) ??
      "12",
  );
  const [servicePct, setServicePct] = useState(
    prefillNumber(prefill, "service", { min: 50, max: 99.9 }) ?? "95",
  );

  const result = useMemo(() => {
    const d = parseNum(dailyDemand);
    const L = parseNum(leadTime);
    if (d === undefined || L === undefined) return null;
    const loc = da ? "da" : "en";
    if (mode === "simple") {
      const ss = parseNum(safetyStock);
      if (ss === undefined) return null;
      return calculateRop(
        {
          mode: "simple",
          dailyDemand: d,
          leadTimeDays: L,
          safetyStock: ss,
        },
        loc,
      );
    }
    const sigma = parseNum(demandStdDev);
    const svc = parseNum(servicePct);
    if (sigma === undefined || svc === undefined) return null;
    return calculateRop(
      {
        mode: "service",
        dailyDemand: d,
        leadTimeDays: L,
        demandStdDev: sigma,
        servicePct: svc,
      },
      loc,
    );
  }, [
    mode,
    dailyDemand,
    leadTime,
    safetyStock,
    demandStdDev,
    servicePct,
    da,
  ]);

  const zPreview = useMemo(() => {
    const svc = parseNum(servicePct);
    if (svc === undefined) return null;
    return zFromServicePct(svc);
  }, [servicePct]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";

  const summaryCopy = result
    ? [
        `ROP ${formatNumber(result.rop, locale, 2)}`,
        `${da ? "Sikkerhedslager" : "Safety stock"} ${formatNumber(result.safetyStock, locale, 2)}`,
        `${da ? "Efterspørgsel i LT" : "Demand during LT"} ${formatNumber(result.demandDuringLt, locale, 2)}`,
      ].join("\n")
    : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Metode" : "Mode"}
          </p>
          <Segmented
            value={mode}
            onChange={setMode}
            ariaLabel={da ? "ROP-metode" : "ROP mode"}
            options={[
              {
                id: "simple",
                label: da ? "Simpel + sikkerhed" : "Simple + safety",
              },
              {
                id: "service",
                label: da ? "Serviceniveau (Z)" : "Service level (Z)",
              },
            ]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={da ? "Gns. daglig efterspørgsel" : "Avg daily demand"}
            hint={da ? "Enheder pr. dag" : "Units per day"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={dailyDemand}
              onChange={(e) => setDailyDemand(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={da ? "Leveringstid (dage)" : "Lead time (days)"}
            hint={da ? "L i dage" : "L in days"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={leadTime}
              onChange={(e) => setLeadTime(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        {mode === "simple" ? (
          <Field
            label={da ? "Sikkerhedslager" : "Safety stock"}
            hint={
              da
                ? "ROP = daglig efterspørgsel × LT + sikkerhedslager"
                : "ROP = avg daily demand × lead time + safety stock"
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={safetyStock}
              onChange={(e) => setSafetyStock(e.target.value)}
              className={fieldClass}
            />
          </Field>
        ) : (
          <>
            <Field
              label={
                da
                  ? "Std.afvigelse (daglig efterspørgsel)"
                  : "Std. deviation (daily demand)"
              }
              hint={
                da
                  ? "σ_d — sikkerhedslager = Z × σ_d × √L"
                  : "σ_d — safety stock = Z × σ_d × √L"
              }
            >
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={demandStdDev}
                onChange={(e) => setDemandStdDev(e.target.value)}
                className={fieldClass}
              />
            </Field>

            <Field
              label={da ? "Serviceniveau (%)" : "Service level (%)"}
              hint={
                zPreview !== null
                  ? da
                    ? `Z ≈ ${formatNumber(zPreview, locale, 3)} (interpoleret fra tabel)`
                    : `Z ≈ ${formatNumber(zPreview, locale, 3)} (interpolated from table)`
                  : undefined
              }
            >
              <input
                type="number"
                inputMode="decimal"
                min="50"
                max="99.9"
                step="0.1"
                value={servicePct}
                onChange={(e) => setServicePct(e.target.value)}
                className={fieldClass}
              />
            </Field>

            <div className="flex flex-wrap gap-2">
              {Z_PRESETS.map((p) => (
                <button
                  key={p.servicePct}
                  type="button"
                  onClick={() => setServicePct(String(p.servicePct))}
                  className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm transition-colors sm:min-h-0 ${
                    parseNum(servicePct) === p.servicePct
                      ? "border-accent bg-accent text-on-accent"
                      : "border-border bg-surface text-muted hover:text-foreground"
                  }`}
                >
                  {p.servicePct}% → {p.z}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">
                    {da ? "Genbestillingspunkt (ROP)" : "Reorder point (ROP)"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatNumber(result.rop, locale, 2)}
                  </p>
                </div>
                <CopyButton
                  value={summaryCopy}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Efterspørgsel i leveringstid" : "Demand during lead time"}
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(result.demandDuringLt, locale, 2)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Sikkerhedslager" : "Safety stock"}
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(result.safetyStock, locale, 2)}
                </dd>
              </div>
              {result.z !== null ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Z</dt>
                  <dd className="font-medium tabular-nums">
                    {formatNumber(result.z, locale, 3)}
                    {result.servicePct !== null
                      ? ` (${formatNumber(result.servicePct, locale, 1)} %)`
                      : ""}
                  </dd>
                </div>
              ) : null}
            </dl>
            <p className="border-t border-border py-3 text-xs text-muted">
              {result.cycleStockNote}
            </p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Indtast gyldige værdier for efterspørgsel og leveringstid."
              : "Enter valid demand and lead time values."}
          </p>
        )}
      </div>
    </div>
  );
}
