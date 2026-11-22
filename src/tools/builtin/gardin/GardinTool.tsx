"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateCurtain } from "./calc";

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function GardinTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [windowWidth, setWindowWidth] = useState(
    prefillNumber(prefill, "width", { min: 0 }) ??
      prefillNumber(prefill, "bredde", { min: 0 }) ??
      "120",
  );
  const [windowHeight, setWindowHeight] = useState(
    prefillNumber(prefill, "height", { min: 0 }) ??
      prefillNumber(prefill, "hoejde", { min: 0 }) ??
      "240",
  );
  const [fullness, setFullness] = useState(
    prefillNumber(prefill, "fullness", { min: 1.5, max: 3 }) ?? "2",
  );
  const [topHem, setTopHem] = useState(
    prefillNumber(prefill, "topHem", { min: 0 }) ?? "20",
  );
  const [bottomHem, setBottomHem] = useState(
    prefillNumber(prefill, "bottomHem", { min: 0 }) ?? "15",
  );
  const [sideHem, setSideHem] = useState(
    prefillNumber(prefill, "sideHem", { min: 0 }) ?? "5",
  );
  const [fabricWidth, setFabricWidth] = useState(
    prefillNumber(prefill, "fabricWidth", { min: 0 }) ?? "140",
  );
  const [patternRepeat, setPatternRepeat] = useState(
    prefillNumber(prefill, "repeat", { min: 0 }) ??
      prefillNumber(prefill, "pattern", { min: 0 }) ??
      "",
  );

  const result = useMemo(() => {
    const widthN = parseField(windowWidth);
    const heightN = parseField(windowHeight);
    const fullnessN = parseField(fullness);
    const topN = parseField(topHem);
    const bottomN = parseField(bottomHem);
    const sideN = parseField(sideHem);
    const fabricN = parseField(fabricWidth);
    if (
      widthN === undefined ||
      heightN === undefined ||
      fullnessN === undefined ||
      topN === undefined ||
      bottomN === undefined ||
      sideN === undefined ||
      fabricN === undefined
    ) {
      return null;
    }

    const trimmedRepeat = patternRepeat.trim();
    const patternRepeatCm =
      trimmedRepeat === "" ? null : (parseField(trimmedRepeat) ?? null);
    if (trimmedRepeat !== "" && patternRepeatCm === null) return null;

    return calculateCurtain({
      windowWidthCm: widthN,
      windowHeightCm: heightN,
      fullness: fullnessN,
      topHemCm: topN,
      bottomHemCm: bottomN,
      sideHemCm: sideN,
      fabricWidthCm: fabricN,
      patternRepeatCm,
    });
  }, [
    windowWidth,
    windowHeight,
    fullness,
    topHem,
    bottomHem,
    sideHem,
    fabricWidth,
    patternRepeat,
  ]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";
  const metersText = result
    ? formatNumber(result.fabricMeters, locale, 2)
    : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={da ? "Vinduesbredde (cm)" : "Window width (cm)"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={windowWidth}
              onChange={(e) => setWindowWidth(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={da ? "Vindueshøjde (cm)" : "Window height (cm)"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={windowHeight}
              onChange={(e) => setWindowHeight(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <Field
          label={da ? "Fylde (1,5–3)" : "Fullness (1.5–3)"}
          hint={
            da
              ? "1,5 er let fold. 2–2,5 er almindeligt. 3 er meget fyldigt."
              : "1.5 is light gather. 2–2.5 is common. 3 is very full."
          }
        >
          <input
            type="number"
            inputMode="decimal"
            min="1.5"
            max="3"
            step="0.1"
            value={fullness}
            onChange={(e) => setFullness(e.target.value)}
            className={fieldClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label={da ? "Topkant (cm)" : "Top hem (cm)"}
            hint={da ? "Hoved / oplæg" : "Heading allowance"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={topHem}
              onChange={(e) => setTopHem(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={da ? "Underkant (cm)" : "Bottom hem (cm)"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={bottomHem}
              onChange={(e) => setBottomHem(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={da ? "Sidekant (cm)" : "Side hem (cm)"}
            hint={da ? "Pr. side pr. bane" : "Per side per drop"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={sideHem}
              onChange={(e) => setSideHem(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={da ? "Stofbredde (cm)" : "Fabric width (cm)"}
            hint={da ? "Typisk omkring 140 cm" : "Typically around 140 cm"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={fabricWidth}
              onChange={(e) => setFabricWidth(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={
              da ? "Mønster-rapport (cm, valgfri)" : "Pattern repeat (cm, optional)"
            }
            hint={
              da
                ? "Afrunder snitlængde til næste rapport."
                : "Rounds cut length up to the next repeat."
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={patternRepeat}
              onChange={(e) => setPatternRepeat(e.target.value)}
              className={fieldClass}
              placeholder={da ? "Tom = ingen" : "Empty = none"}
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
                    {da ? "Stof nødvendigt" : "Fabric needed"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {metersText} m
                  </p>
                </div>
                <CopyButton
                  value={metersText}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Baner (drops)" : "Drops"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.drops, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Snitlængde pr. bane" : "Cut length per drop"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.cutLengthCm, locale, 0)} cm
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Færdig bredde" : "Finished width"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.finishedWidthCm, locale, 0)} cm
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Udfyld vinduesmål og fylde for at beregne stof."
              : "Enter window size and fullness to calculate fabric."}
          </p>
        )}
      </div>
    </div>
  );
}
