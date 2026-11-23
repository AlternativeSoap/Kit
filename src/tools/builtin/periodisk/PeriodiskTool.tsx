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
import { calculatePeriodicReview, type PeriodicSsMode } from "./calc";

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

const SS_MODES: readonly PeriodicSsMode[] = ["manual", "service"];

export function PeriodiskTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [reviewInterval, setReviewInterval] = useState(
    prefillNumber(prefill, "review", { min: 0 }) ??
      prefillNumber(prefill, "r", { min: 0 }) ??
      "14",
  );
  const [leadTimeDays, setLeadTimeDays] = useState(
    prefillNumber(prefill, "lead", { min: 0 }) ??
      prefillNumber(prefill, "lt", { min: 0 }) ??
      "7",
  );
  const [avgDemand, setAvgDemand] = useState(
    prefillNumber(prefill, "demand", { min: 0 }) ??
      prefillNumber(prefill, "avg", { min: 0 }) ??
      "40",
  );
  const [currentStock, setCurrentStock] = useState(
    prefillNumber(prefill, "stock", { min: 0 }) ??
      prefillNumber(prefill, "onhand", { min: 0 }) ??
      "320",
  );
  const [ssMode, setSsMode] = useState<PeriodicSsMode>(
    prefillChoice(prefill, "ssmode", SS_MODES) ?? "manual",
  );
  const [safetyStock, setSafetyStock] = useState(
    prefillNumber(prefill, "ss", { min: 0 }) ?? "80",
  );
  const [serviceLevel, setServiceLevel] = useState(
    prefillNumber(prefill, "service", { min: 0.1, max: 99.9 }) ?? "95",
  );
  const [demandStdDev, setDemandStdDev] = useState(
    prefillNumber(prefill, "sigma", { min: 0 }) ??
      prefillNumber(prefill, "stddev", { min: 0 }) ??
      "12",
  );

  const result = useMemo(() => {
    const r = parseField(reviewInterval);
    const lt = parseField(leadTimeDays);
    const demand = parseField(avgDemand);
    const stock = parseField(currentStock);
    if (
      r === undefined ||
      lt === undefined ||
      demand === undefined ||
      stock === undefined
    ) {
      return null;
    }
    return calculatePeriodicReview({
      reviewIntervalDays: r,
      leadTimeDays: lt,
      avgDailyDemand: demand,
      currentStock: stock,
      ssMode,
      safetyStock: parseField(safetyStock),
      serviceLevelPercent: parseField(serviceLevel),
      demandStdDev: parseField(demandStdDev),
    });
  }, [
    reviewInterval,
    leadTimeDays,
    avgDemand,
    currentStock,
    ssMode,
    safetyStock,
    serviceLevel,
    demandStdDev,
  ]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";
  const orderText = result ? formatNumber(result.orderQty, locale, 1) : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={da ? "Review-interval R (dage)" : "Review interval R (days)"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={reviewInterval}
              onChange={(e) => setReviewInterval(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={da ? "Leveringstid L (dage)" : "Lead time L (days)"}>
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
            label={
              da
                ? "Gns. daglig efterspørgsel"
                : "Avg. daily demand"
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
          <Field
            label={da ? "Nuværende lager" : "Current stock"}
            hint={
              da
                ? "Ordremængde = S − lager."
                : "Order qty = S − stock."
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Sikkerhedslager" : "Safety stock"}
          </p>
          <Segmented
            value={ssMode}
            onChange={setSsMode}
            ariaLabel={da ? "Sikkerhedslager-metode" : "Safety stock method"}
            options={[
              { id: "manual", label: da ? "Angiv" : "Enter" },
              {
                id: "service",
                label: da ? "Fra service" : "From service",
              },
            ]}
          />
        </div>

        {ssMode === "manual" ? (
          <Field label={da ? "Sikkerhedslager (enheder)" : "Safety stock (units)"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={safetyStock}
              onChange={(e) => setSafetyStock(e.target.value)}
              className={fieldClass}
            />
          </Field>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={da ? "Serviceniveau (%)" : "Service level (%)"}>
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
                  ? "Efterspørgsel std.afv. (pr. dag)"
                  : "Demand std. dev. (per day)"
              }
              hint={
                da
                  ? "SS = Z × σd × √(R+L)."
                  : "SS = Z × σd × √(R+L)."
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
          </div>
        )}
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">
                    {da ? "Ordremængde" : "Order quantity"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatNumber(result.orderQty, locale, 1)}
                  </p>
                </div>
                <CopyButton
                  value={orderText}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Order-up-to S" : "Order-up-to S"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.orderUpTo, locale, 1)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Beskyttelsesperiode R+L" : "Protection period R+L"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.protectionPeriod, locale, 1)}{" "}
                  {da ? "dage" : "days"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Sikkerhedslager" : "Safety stock"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.safetyStock, locale, 1)}
                </dd>
              </div>
            </dl>
            <p className="border-t border-border py-3 text-xs text-muted">
              {da
                ? "S = efterspørgsel × (R+L) + SS. Ordremængde = max(0, S − nuværende lager)."
                : "S = demand × (R+L) + SS. Order qty = max(0, S − current stock)."}
            </p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Udfyld review-interval, leveringstid, efterspørgsel og lager."
              : "Enter review interval, lead time, demand, and stock."}
          </p>
        )}
      </div>
    </div>
  );
}
