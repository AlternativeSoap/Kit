"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculatePaint } from "./calc";

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function MalingTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [length, setLength] = useState(
    prefillNumber(prefill, "length", { min: 0 }) ??
      prefillNumber(prefill, "laengde", { min: 0 }) ??
      "8",
  );
  const [height, setHeight] = useState(
    prefillNumber(prefill, "height", { min: 0 }) ??
      prefillNumber(prefill, "hoejde", { min: 0 }) ??
      "2.5",
  );
  const [area, setArea] = useState(
    prefillNumber(prefill, "area", { min: 0 }) ??
      prefillNumber(prefill, "areal", { min: 0 }) ??
      "",
  );
  const [openings, setOpenings] = useState(
    prefillNumber(prefill, "openings", { min: 0 }) ?? "2",
  );
  const [coats, setCoats] = useState(
    prefillNumber(prefill, "coats", { min: 1, max: 3, integer: true }) ?? "2",
  );
  const [coverage, setCoverage] = useState(
    prefillNumber(prefill, "coverage", { min: 0 }) ?? "9",
  );
  const [waste, setWaste] = useState(
    prefillNumber(prefill, "waste", { min: 0, max: 100 }) ?? "10",
  );
  const [canSize, setCanSize] = useState(
    prefillNumber(prefill, "can", { min: 0 }) ??
      prefillNumber(prefill, "canSize", { min: 0 }) ??
      "2.5",
  );

  const result = useMemo(() => {
    const areaN = parseField(area);
    return calculatePaint({
      lengthM: parseField(length),
      heightM: parseField(height),
      areaM2: areaN,
      openingsM2: parseField(openings) ?? 0,
      coats: parseField(coats) ?? 0,
      coverageM2PerL: parseField(coverage) ?? 0,
      wastePercent: parseField(waste) ?? 0,
      canSizeL: parseField(canSize),
    });
  }, [length, height, area, openings, coats, coverage, waste, canSize]);

  const litersText = result
    ? formatNumber(result.paintLiters, locale, 2)
    : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <Field
          label={da ? "Areal (m²)" : "Area (m²)"}
          hint={
            da
              ? "Valgfrit. Hvis tomt, bruges længde × højde."
              : "Optional. If empty, length × height is used."
          }
        >
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className={fieldClass}
            placeholder={da ? "Tom = længde × højde" : "Empty = length × height"}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={da ? "Væglængde (m)" : "Wall length (m)"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className={fieldClass}
              disabled={Boolean(area.trim())}
            />
          </Field>
          <Field label={da ? "Væghøjde (m)" : "Wall height (m)"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className={fieldClass}
              disabled={Boolean(area.trim())}
            />
          </Field>
        </div>
        <Field
          label={da ? "Døre og vinduer (m²)" : "Doors and windows (m²)"}
          hint={da ? "Trækkes fra arealet" : "Subtracted from the area"}
        >
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={openings}
            onChange={(e) => setOpenings(e.target.value)}
            className={fieldClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={da ? "Lag (1–3)" : "Coats (1–3)"}>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="3"
              step="1"
              value={coats}
              onChange={(e) => setCoats(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={da ? "Dækning (m²/L)" : "Coverage (m²/L)"}
            hint={da ? "Typisk 8–10 m² pr. liter" : "Typically 8–10 m² per liter"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={coverage}
              onChange={(e) => setCoverage(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={da ? "Spild (%)" : "Waste (%)"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={waste}
              onChange={(e) => setWaste(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={da ? "Spandestørrelse (L)" : "Can size (L)"}
            hint={da ? "Valgfrit" : "Optional"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={canSize}
              onChange={(e) => setCanSize(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">
                    {da ? "Maling nødvendig" : "Paint needed"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {litersText} L
                  </p>
                </div>
                <CopyButton
                  value={litersText}
                  label={da ? "Kopiér" : "Copy"}
                  copiedLabel={da ? "Kopieret" : "Copied"}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Bruttoareal" : "Gross area"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.grossArea, locale, 1)} m²
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Åbninger" : "Openings"}
                </dt>
                <dd className="font-medium">
                  −{formatNumber(result.openings, locale, 1)} m²
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{da ? "Nettoareal" : "Net area"}</dt>
                <dd className="font-medium">
                  {formatNumber(result.netArea, locale, 1)} m²
                </dd>
              </div>
              {result.cansNeeded !== null && result.canSizeL !== null ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Spande foreslået" : "Suggested cans"}
                  </dt>
                  <dd className="font-medium">
                    {result.cansNeeded} × {formatNumber(result.canSizeL, locale, 1)} L
                  </dd>
                </div>
              ) : null}
            </dl>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Udfyld areal eller længde og højde for at beregne."
              : "Enter area or length and height to calculate."}
          </p>
        )}
      </div>
    </div>
  );
}
