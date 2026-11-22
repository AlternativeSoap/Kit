"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass, Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillChoice, prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateConcrete, type BetonShape } from "./calc";

const SHAPES: readonly BetonShape[] = ["slab", "footing", "cylinder"];

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function BetonTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [shape, setShape] = useState<BetonShape>(
    prefillChoice(prefill, "shape", SHAPES) ?? "slab",
  );
  const [length, setLength] = useState(
    prefillNumber(prefill, "length", { min: 0 }) ??
      prefillNumber(prefill, "laengde", { min: 0 }) ??
      "4",
  );
  const [width, setWidth] = useState(
    prefillNumber(prefill, "width", { min: 0 }) ??
      prefillNumber(prefill, "bredde", { min: 0 }) ??
      "3",
  );
  const [depth, setDepth] = useState(
    prefillNumber(prefill, "depth", { min: 0 }) ??
      prefillNumber(prefill, "thickness", { min: 0 }) ??
      prefillNumber(prefill, "height", { min: 0 }) ??
      "0.12",
  );
  const [diameter, setDiameter] = useState(
    prefillNumber(prefill, "diameter", { min: 0 }) ?? "0.3",
  );
  const [waste, setWaste] = useState(
    prefillNumber(prefill, "waste", { min: 0, max: 100 }) ?? "10",
  );
  const [bagYield, setBagYield] = useState(
    prefillNumber(prefill, "bagYield", { min: 0 }) ??
      prefillNumber(prefill, "bag", { min: 0 }) ??
      "0.0125",
  );

  const result = useMemo(() => {
    const wasteN = parseField(waste);
    if (wasteN === undefined) return null;

    const trimmedBag = bagYield.trim();
    const bagYieldM3 =
      trimmedBag === "" ? null : (parseField(trimmedBag) ?? null);
    if (trimmedBag !== "" && bagYieldM3 === null) return null;

    return calculateConcrete({
      shape,
      lengthM: parseField(length) ?? 0,
      widthM: parseField(width) ?? 0,
      depthM: parseField(depth) ?? 0,
      diameterM: parseField(diameter) ?? 0,
      wastePercent: wasteN,
      bagYieldM3,
    });
  }, [shape, length, width, depth, diameter, waste, bagYield]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";
  const volumeText = result
    ? formatNumber(result.volumeM3, locale, 3)
    : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Form" : "Shape"}
          </p>
          <Segmented
            value={shape}
            onChange={setShape}
            ariaLabel={da ? "Betonform" : "Concrete shape"}
            options={[
              { id: "slab", label: da ? "Plade" : "Slab" },
              {
                id: "footing",
                label: da ? "Fundament / rende" : "Footing / trench",
              },
              { id: "cylinder", label: da ? "Søjle" : "Column" },
            ]}
          />
        </div>

        {shape === "cylinder" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={da ? "Diameter (m)" : "Diameter (m)"}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label={da ? "Højde (m)" : "Height (m)"}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={da ? "Længde (m)" : "Length (m)"}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label={da ? "Bredde (m)" : "Width (m)"}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field
              label={
                shape === "slab"
                  ? da
                    ? "Tykkelse (m)"
                    : "Thickness (m)"
                  : da
                    ? "Dybde (m)"
                    : "Depth (m)"
              }
            >
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={da ? "Spild (%)" : "Waste (%)"}
            hint={
              da
                ? "Ekstra til spild og ujævnheder. Typisk 5–15 %."
                : "Extra for waste and uneven ground. Typically 5–15%."
            }
          >
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
            label={
              da
                ? "Sækkeudbytte (m³, valgfri)"
                : "Bag yield (m³, optional)"
            }
            hint={
              da
                ? "Fx ca. 0,0125 m³ for en 25 kg sæk. Tom = kun volumen."
                : "E.g. about 0.0125 m³ for a 25 kg bag. Empty = volume only."
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              value={bagYield}
              onChange={(e) => setBagYield(e.target.value)}
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
                    {da ? "Beton nødvendigt" : "Concrete needed"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {volumeText} m³
                  </p>
                </div>
                <CopyButton
                  value={volumeText}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Uden spild" : "Without waste"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.rawVolumeM3, locale, 3)} m³
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{da ? "Spild" : "Waste"}</dt>
                <dd className="font-medium">
                  {formatNumber(result.wastePercent, locale, 0)} %
                </dd>
              </div>
              {result.bagsNeeded !== null && result.bagYieldM3 !== null ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Sække" : "Bags"}
                  </dt>
                  <dd className="font-medium">
                    {formatNumber(result.bagsNeeded, locale, 0)} ×{" "}
                    {formatNumber(result.bagYieldM3, locale, 4)} m³
                  </dd>
                </div>
              ) : null}
            </dl>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Udfyld mål for at beregne betonvolumen."
              : "Enter dimensions to calculate concrete volume."}
          </p>
        )}
      </div>
    </div>
  );
}
