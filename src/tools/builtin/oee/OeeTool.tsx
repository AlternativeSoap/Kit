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
import { calculateOee, type OeeMode, type OeeRating } from "./calc";

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

const MODES: readonly OeeMode[] = ["direct", "computed"];

function ratingLabel(rating: OeeRating, da: boolean): string {
  switch (rating) {
    case "worldClass":
      return da ? "World-class (≥85%)" : "World-class (≥85%)";
    case "good":
      return da ? "God (≥60%)" : "Good (≥60%)";
    case "fair":
      return da ? "Middel (≥40%)" : "Fair (≥40%)";
    case "poor":
      return da ? "Lav (<40%)" : "Poor (<40%)";
  }
}

export function OeeTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<OeeMode>(
    prefillChoice(prefill, "mode", MODES) ?? "direct",
  );

  const [availability, setAvailability] = useState(
    prefillNumber(prefill, "a", { min: 0, max: 100 }) ??
      prefillNumber(prefill, "availability", { min: 0, max: 100 }) ??
      "90",
  );
  const [performance, setPerformance] = useState(
    prefillNumber(prefill, "p", { min: 0, max: 100 }) ??
      prefillNumber(prefill, "performance", { min: 0, max: 100 }) ??
      "95",
  );
  const [quality, setQuality] = useState(
    prefillNumber(prefill, "q", { min: 0, max: 100 }) ??
      prefillNumber(prefill, "quality", { min: 0, max: 100 }) ??
      "99",
  );

  const [plannedTime, setPlannedTime] = useState(
    prefillNumber(prefill, "planned", { min: 0 }) ?? "480",
  );
  const [downtime, setDowntime] = useState(
    prefillNumber(prefill, "downtime", { min: 0 }) ?? "48",
  );
  const [idealCycle, setIdealCycle] = useState(
    prefillNumber(prefill, "cycle", { min: 0 }) ?? "0.5",
  );
  const [totalPieces, setTotalPieces] = useState(
    prefillNumber(prefill, "total", { min: 0 }) ?? "800",
  );
  const [runTime, setRunTime] = useState(
    prefillNumber(prefill, "runtime", { min: 0 }) ?? "432",
  );
  const [goodPieces, setGoodPieces] = useState(
    prefillNumber(prefill, "good", { min: 0 }) ?? "792",
  );

  const result = useMemo(() => {
    if (mode === "direct") {
      const a = parseField(availability);
      const p = parseField(performance);
      const q = parseField(quality);
      if (a === undefined || p === undefined || q === undefined) return null;
      return calculateOee({
        mode: "direct",
        availabilityPercent: a,
        performancePercent: p,
        qualityPercent: q,
      });
    }

    const planned = parseField(plannedTime);
    const down = parseField(downtime);
    const cycle = parseField(idealCycle);
    const total = parseField(totalPieces);
    const run = parseField(runTime);
    const good = parseField(goodPieces);
    if (
      planned === undefined ||
      down === undefined ||
      cycle === undefined ||
      total === undefined ||
      run === undefined ||
      good === undefined
    ) {
      return null;
    }
    return calculateOee({
      mode: "computed",
      plannedTimeMinutes: planned,
      downtimeMinutes: down,
      idealCycleTimeMinutes: cycle,
      totalPieces: total,
      runTimeMinutes: run,
      goodPieces: good,
    });
  }, [
    mode,
    availability,
    performance,
    quality,
    plannedTime,
    downtime,
    idealCycle,
    totalPieces,
    runTime,
    goodPieces,
  ]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";
  const oeeText = result ? formatNumber(result.oeePercent, locale, 1) : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Beregningsmetode" : "Calculation mode"}
          </p>
          <Segmented
            value={mode}
            onChange={setMode}
            ariaLabel={da ? "OEE-metode" : "OEE mode"}
            options={[
              {
                id: "direct",
                label: da ? "Direkte %" : "Direct %",
              },
              {
                id: "computed",
                label: da ? "Fra tider/antal" : "From times/counts",
              },
            ]}
          />
        </div>

        {mode === "direct" ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={da ? "Tilgængelighed %" : "Availability %"}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.1"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label={da ? "Ydeevne %" : "Performance %"}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.1"
                value={performance}
                onChange={(e) => setPerformance(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label={da ? "Kvalitet %" : "Quality %"}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={
                  da
                    ? "Planlagt tid (min)"
                    : "Planned time (min)"
                }
              >
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={plannedTime}
                  onChange={(e) => setPlannedTime(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field
                label={da ? "Nedetid (min)" : "Downtime (min)"}
                hint={da ? "A = (planlagt − nedetid) / planlagt." : "A = (planned − downtime) / planned."}
              >
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={downtime}
                  onChange={(e) => setDowntime(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label={
                  da
                    ? "Ideal cyklustid (min)"
                    : "Ideal cycle time (min)"
                }
              >
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={idealCycle}
                  onChange={(e) => setIdealCycle(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label={da ? "Antal styk i alt" : "Total pieces"}>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={totalPieces}
                  onChange={(e) => setTotalPieces(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field
                label={da ? "Køretid (min)" : "Run time (min)"}
                hint={
                  da
                    ? "P = (ideal × antal) / køretid."
                    : "P = (ideal × pieces) / run time."
                }
              >
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={runTime}
                  onChange={(e) => setRunTime(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>
            <Field
              label={da ? "Gode styk" : "Good pieces"}
              hint={
                da
                  ? "Q = gode / total."
                  : "Q = good / total."
              }
            >
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={goodPieces}
                onChange={(e) => setGoodPieces(e.target.value)}
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
                  <p className="text-xs text-muted">OEE</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatNumber(result.oeePercent, locale, 1)}%
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {ratingLabel(result.rating, da)}
                  </p>
                </div>
                <CopyButton
                  value={oeeText}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Tilgængelighed (A)" : "Availability (A)"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.availabilityPercent, locale, 1)}%
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Ydeevne (P)" : "Performance (P)"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.performancePercent, locale, 1)}%
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Kvalitet (Q)" : "Quality (Q)"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.qualityPercent, locale, 1)}%
                </dd>
              </div>
            </dl>
            <div className="border-t border-border py-3">
              <p className="mb-2 text-xs font-medium text-foreground">
                {da
                  ? "Tabt tid (andel af gap)"
                  : "Lost time (share of gap)"}
              </p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Tilgængelighedstab" : "Availability loss"}
                  </dt>
                  <dd className="font-medium">
                    {formatNumber(result.lossAvailability, locale, 1)}%
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Ydeevnetab" : "Performance loss"}
                  </dt>
                  <dd className="font-medium">
                    {formatNumber(result.lossPerformance, locale, 1)}%
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Kvalitetstab" : "Quality loss"}
                  </dt>
                  <dd className="font-medium">
                    {formatNumber(result.lossQuality, locale, 1)}%
                  </dd>
                </div>
              </dl>
            </div>
            <p className="border-t border-border py-3 text-xs text-muted">
              {da
                ? "OEE = A × P × Q. Benchmarks: world-class ~85%, god ~60%, middel ~40%."
                : "OEE = A × P × Q. Benchmarks: world-class ~85%, good ~60%, fair ~40%."}
            </p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Udfyld A, P og Q eller tider og antal."
              : "Enter A, P, and Q or times and counts."}
          </p>
        )}
      </div>
    </div>
  );
}
