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
import { calculateEoq, type HoldingMode } from "./calc";

const HOLDING_MODES: readonly HoldingMode[] = ["perUnit", "percent"];

function parseNum(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function EoqTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [demand, setDemand] = useState(
    prefillNumber(prefill, "demand", { min: 0 }) ??
      prefillNumber(prefill, "d", { min: 0 }) ??
      "12000",
  );
  const [orderCost, setOrderCost] = useState(
    prefillNumber(prefill, "orderCost", { min: 0 }) ??
      prefillNumber(prefill, "s", { min: 0 }) ??
      "250",
  );
  const [holdingMode, setHoldingMode] = useState<HoldingMode>(
    prefillChoice(prefill, "holding", HOLDING_MODES) ??
      prefillChoice(prefill, "mode", HOLDING_MODES) ??
      "perUnit",
  );
  const [holdingCost, setHoldingCost] = useState(
    prefillNumber(prefill, "holdingCost", { min: 0 }) ??
      prefillNumber(prefill, "h", { min: 0 }) ??
      "4",
  );
  const [holdingPercent, setHoldingPercent] = useState(
    prefillNumber(prefill, "holdingPercent", { min: 0 }) ??
      prefillNumber(prefill, "pct", { min: 0 }) ??
      "20",
  );
  const [unitCost, setUnitCost] = useState(
    prefillNumber(prefill, "unitCost", { min: 0 }) ??
      prefillNumber(prefill, "c", { min: 0 }) ??
      "20",
  );

  const result = useMemo(() => {
    const D = parseNum(demand);
    const S = parseNum(orderCost);
    if (D === undefined || S === undefined) return null;
    if (holdingMode === "percent") {
      const pct = parseNum(holdingPercent);
      const C = parseNum(unitCost);
      if (pct === undefined || C === undefined) return null;
      return calculateEoq({
        demand: D,
        orderCost: S,
        holdingMode,
        holdingPercent: pct,
        unitCost: C,
      });
    }
    const H = parseNum(holdingCost);
    if (H === undefined) return null;
    return calculateEoq({
      demand: D,
      orderCost: S,
      holdingMode,
      holdingCost: H,
    });
  }, [demand, orderCost, holdingMode, holdingCost, holdingPercent, unitCost]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";

  const summaryCopy = result
    ? [
        `EOQ ${formatNumber(result.eoqRounded, locale, 0)} (${formatNumber(result.eoqExact, locale, 4)})`,
        `${da ? "Ordrer/år" : "Orders/year"} ${formatNumber(result.ordersPerYear, locale, 2)}`,
        `${da ? "Årlig totalomkostning" : "Annual total cost"} ${formatNumber(result.totalCost, locale, 2)}`,
      ].join("\n")
    : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field
          label={da ? "Årlig efterspørgsel (D)" : "Annual demand (D)"}
          hint={da ? "Enheder pr. år" : "Units per year"}
        >
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={demand}
            onChange={(e) => setDemand(e.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field
          label={da ? "Ordreomkostning (S)" : "Order cost (S)"}
          hint={
            da
              ? "Fast omkostning pr. ordre / opsætning"
              : "Fixed cost per order / setup"
          }
        >
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={orderCost}
            onChange={(e) => setOrderCost(e.target.value)}
            className={fieldClass}
          />
        </Field>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Lageromkostning (H)" : "Holding cost (H)"}
          </p>
          <Segmented
            value={holdingMode}
            onChange={setHoldingMode}
            ariaLabel={da ? "Lageromkostningstype" : "Holding cost type"}
            options={[
              {
                id: "perUnit",
                label: da ? "Pr. enhed / år" : "Per unit / year",
              },
              {
                id: "percent",
                label: da ? "% af enhedspris" : "% of unit cost",
              },
            ]}
          />
        </div>

        {holdingMode === "perUnit" ? (
          <Field
            label={da ? "H pr. enhed pr. år" : "H per unit per year"}
            hint={da ? "Direkte lagerholdningsomkostning" : "Direct holding cost"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={holdingCost}
              onChange={(e) => setHoldingCost(e.target.value)}
              className={fieldClass}
            />
          </Field>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={da ? "Lager % af enhedspris" : "Holding % of unit cost"}
            >
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={holdingPercent}
                onChange={(e) => setHoldingPercent(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label={da ? "Enhedspris (C)" : "Unit cost (C)"}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>
        )}

        <p className="text-xs text-muted">
          {da
            ? "Formel: EOQ = √(2DS/H). Ved % bruges H = C × (procent/100)."
            : "Formula: EOQ = √(2DS/H). With %, H = C × (percent/100)."}
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
          {result ? (
            <>
              <div className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted">
                      {da ? "EOQ (afrundet)" : "EOQ (rounded)"}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      {formatNumber(result.eoqRounded, locale, 0)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {da ? "Eksakt" : "Exact"}:{" "}
                      {formatNumber(result.eoqExact, locale, 4)}
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
                    {da ? "Ordrer pr. år" : "Orders per year"}
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {formatNumber(result.ordersPerYear, locale, 2)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Dage mellem ordrer" : "Days between orders"}
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {formatNumber(result.daysBetweenOrders, locale, 1)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Gns. lager (EOQ/2)" : "Avg inventory (EOQ/2)"}
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {formatNumber(result.avgInventory, locale, 2)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Årlig ordreomkostning" : "Annual order cost"}
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {formatNumber(result.annualOrderCost, locale, 2)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Årlig lageromkostning" : "Annual holding cost"}
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {formatNumber(result.annualHoldingCost, locale, 2)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Samlet årlig omkostning" : "Total annual cost"}
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {formatNumber(result.totalCost, locale, 2)}
                  </dd>
                </div>
                {holdingMode === "percent" ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">
                      {da ? "Beregnet H" : "Derived H"}
                    </dt>
                    <dd className="font-medium tabular-nums">
                      {formatNumber(result.holdingCostH, locale, 4)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </>
          ) : (
            <p className="py-8 text-sm text-muted">
              {da
                ? "Indtast positive værdier for D, S og H."
                : "Enter positive values for D, S, and H."}
            </p>
          )}
        </div>

        {result ? (
          <div className="rounded-[12px] border border-border bg-surface px-4 py-3">
            <p className="mb-2 text-sm font-medium">
              {da
                ? "Omkostningskurve (U-form uden graf)"
                : "Cost curve sample (U-shape without charts)"}
            </p>
            <p className="mb-3 text-xs text-muted">
              {da
                ? "Q ved 50 %, 75 %, 100 %, 125 % og 150 % af EOQ."
                : "Q at 50%, 75%, 100%, 125%, and 150% of EOQ."}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[20rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    <th className="py-2 pr-2 font-medium">% EOQ</th>
                    <th className="py-2 pr-2 font-medium">Q</th>
                    <th className="py-2 pr-2 font-medium">
                      {da ? "Ordre" : "Order"}
                    </th>
                    <th className="py-2 pr-2 font-medium">
                      {da ? "Lager" : "Hold"}
                    </th>
                    <th className="py-2 font-medium">
                      {da ? "Total" : "Total"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.curve.map((p) => (
                    <tr
                      key={p.multiple}
                      className={`border-b border-border/60 ${
                        p.multiple === 1 ? "bg-accent-soft/40" : ""
                      }`}
                    >
                      <td className="py-2 pr-2 tabular-nums">
                        {formatNumber(p.multiple * 100, locale, 0)} %
                      </td>
                      <td className="py-2 pr-2 tabular-nums">
                        {formatNumber(p.q, locale, 2)}
                      </td>
                      <td className="py-2 pr-2 tabular-nums">
                        {formatNumber(p.orderCostAnnual, locale, 2)}
                      </td>
                      <td className="py-2 pr-2 tabular-nums">
                        {formatNumber(p.holdingCostAnnual, locale, 2)}
                      </td>
                      <td className="py-2 font-medium tabular-nums">
                        {formatNumber(p.totalCost, locale, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
