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
import { calculateMinMax, type MinMaxSsMode } from "./calc";

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

const SS_MODES: readonly MinMaxSsMode[] = ["manual", "service"];

export function MinmaxTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [avgDemand, setAvgDemand] = useState(
    prefillNumber(prefill, "demand", { min: 0 }) ??
      prefillNumber(prefill, "avg", { min: 0 }) ??
      "40",
  );
  const [leadTimeDays, setLeadTimeDays] = useState(
    prefillNumber(prefill, "lead", { min: 0 }) ??
      prefillNumber(prefill, "lt", { min: 0 }) ??
      "7",
  );
  const [orderQty, setOrderQty] = useState(
    prefillNumber(prefill, "qty", { min: 0 }) ??
      prefillNumber(prefill, "eoq", { min: 0 }) ??
      "200",
  );
  const [ssMode, setSsMode] = useState<MinMaxSsMode>(
    prefillChoice(prefill, "ssmode", SS_MODES) ?? "manual",
  );
  const [safetyStock, setSafetyStock] = useState(
    prefillNumber(prefill, "ss", { min: 0 }) ?? "50",
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
    const demand = parseField(avgDemand);
    const lt = parseField(leadTimeDays);
    const q = parseField(orderQty);
    if (demand === undefined || lt === undefined || q === undefined) {
      return null;
    }
    return calculateMinMax({
      avgDailyDemand: demand,
      leadTimeDays: lt,
      orderQuantity: q,
      ssMode,
      safetyStock: parseField(safetyStock),
      serviceLevelPercent: parseField(serviceLevel),
      demandStdDev: parseField(demandStdDev),
    });
  }, [
    avgDemand,
    leadTimeDays,
    orderQty,
    ssMode,
    safetyStock,
    serviceLevel,
    demandStdDev,
  ]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";
  const minText = result ? formatNumber(result.minLevel, locale, 1) : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
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
          <Field label={da ? "Leveringstid (dage)" : "Lead time (days)"}>
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

        <Field
          label={
            da
              ? "Ordremængde / EOQ"
              : "Order quantity / EOQ"
          }
          hint={
            da
              ? "Q. Max = Min + Q."
              : "Q. Max = Min + Q."
          }
        >
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={orderQty}
            onChange={(e) => setOrderQty(e.target.value)}
            className={fieldClass}
          />
        </Field>

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
                  ? "Efterspørgsel std.afv."
                  : "Demand std. dev."
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
                    {da ? "Min-niveau" : "Min level"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatNumber(result.minLevel, locale, 1)}
                  </p>
                </div>
                <CopyButton
                  value={minText}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Max-niveau" : "Max level"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.maxLevel, locale, 1)}
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
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Dækning ved Min" : "Coverage at Min"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.coverageDaysAtMin, locale, 1)}{" "}
                  {da ? "dage" : "days"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Dækning ved Max" : "Coverage at Max"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.coverageDaysAtMax, locale, 1)}{" "}
                  {da ? "dage" : "days"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da
                    ? "Anbefalet ordre ved Min"
                    : "Recommended order at Min"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.recommendedOrderQty, locale, 1)}
                </dd>
              </div>
            </dl>
            <p className="border-t border-border py-3 text-xs text-muted">
              {da
                ? "Min = efterspørgsel × LT + SS. Max = Min + Q. Genbestil når lageret når Min."
                : "Min = demand × LT + SS. Max = Min + Q. Reorder when stock hits Min."}
            </p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Udfyld efterspørgsel, leveringstid og ordremængde."
              : "Enter demand, lead time, and order quantity."}
          </p>
        )}
      </div>
    </div>
  );
}
