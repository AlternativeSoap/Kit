"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  fieldClass,
  KitSelect,
  Segmented,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import {
  COLOR_HEX,
  colorLabel,
  decodeBands,
  DIGIT_COLORS,
  encodeOhms,
  formatOhms,
  MULTIPLIER_COLORS,
  TOLERANCE_COLORS,
  type BandColor,
  type BandCount,
} from "./calc";

function ColorSelect({
  value,
  onChange,
  colors,
  da,
  label,
}: {
  value: BandColor;
  onChange: (c: BandColor) => void;
  colors: readonly BandColor[];
  da: boolean;
  label: string;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <span
          className="h-8 w-8 shrink-0 rounded-[8px] border border-border"
          style={{ backgroundColor: COLOR_HEX[value] }}
          aria-hidden
        />
        <KitSelect
          value={value}
          onChange={(e) => onChange(e.target.value as BandColor)}
        >
          {colors.map((c) => (
            <option key={c} value={c}>
              {colorLabel(c, da)}
            </option>
          ))}
        </KitSelect>
      </div>
    </Field>
  );
}

function BandPreview({
  colors,
}: {
  colors: BandColor[];
}) {
  return (
    <div className="flex h-10 w-full max-w-xs items-center justify-center gap-1.5 rounded-full border border-border bg-[#c4a574] px-6">
      {colors.map((c, i) => (
        <span
          key={`${c}-${i}`}
          className="h-10 w-2.5 rounded-sm border border-black/10"
          style={{ backgroundColor: COLOR_HEX[c] }}
        />
      ))}
    </div>
  );
}

export function ModstandTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<"colors" | "ohms">("colors");
  const [bands, setBands] = useState<BandCount>(4);
  const [digit1, setDigit1] = useState<BandColor>("brown");
  const [digit2, setDigit2] = useState<BandColor>("black");
  const [digit3, setDigit3] = useState<BandColor>("black");
  const [multiplier, setMultiplier] = useState<BandColor>("red");
  const [tolerance, setTolerance] = useState<BandColor>("gold");
  const [ohmsInput, setOhmsInput] = useState("1000");

  const decoded = useMemo(
    () =>
      decodeBands({
        bands,
        digit1,
        digit2,
        digit3,
        multiplier,
        tolerance,
      }),
    [bands, digit1, digit2, digit3, multiplier, tolerance],
  );

  const encoded = useMemo(() => {
    const n = Number(ohmsInput.replace(",", "."));
    if (!Number.isFinite(n)) return null;
    return encodeOhms(n, bands, tolerance);
  }, [ohmsInput, bands, tolerance]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";

  const previewColors =
    bands === 4
      ? [digit1, digit2, multiplier, tolerance]
      : [digit1, digit2, digit3, multiplier, tolerance];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <Segmented
          value={mode}
          onChange={setMode}
          ariaLabel={da ? "Tilstand" : "Mode"}
          options={[
            { id: "colors", label: da ? "Farver → ohm" : "Colors → ohms" },
            { id: "ohms", label: da ? "Ohm → farver" : "Ohms → colors" },
          ]}
        />
        <Segmented
          value={String(bands) as "4" | "5"}
          onChange={(id) => setBands(Number(id) as BandCount)}
          ariaLabel={da ? "Antal bånd" : "Band count"}
          options={[
            { id: "4", label: da ? "4 bånd" : "4-band" },
            { id: "5", label: da ? "5 bånd" : "5-band" },
          ]}
        />
      </div>

      {mode === "colors" ? (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <ColorSelect
              label={da ? "1. ciffer" : "1st digit"}
              value={digit1}
              onChange={setDigit1}
              colors={DIGIT_COLORS}
              da={da}
            />
            <ColorSelect
              label={da ? "2. ciffer" : "2nd digit"}
              value={digit2}
              onChange={setDigit2}
              colors={DIGIT_COLORS}
              da={da}
            />
            {bands === 5 ? (
              <ColorSelect
                label={da ? "3. ciffer" : "3rd digit"}
                value={digit3}
                onChange={setDigit3}
                colors={DIGIT_COLORS}
                da={da}
              />
            ) : null}
            <ColorSelect
              label={da ? "Multiplikator" : "Multiplier"}
              value={multiplier}
              onChange={setMultiplier}
              colors={MULTIPLIER_COLORS}
              da={da}
            />
            <ColorSelect
              label={da ? "Tolerance" : "Tolerance"}
              value={tolerance}
              onChange={setTolerance}
              colors={TOLERANCE_COLORS}
              da={da}
            />
          </div>

          <div className="rounded-[12px] border border-border bg-surface px-5 py-5 space-y-4">
            <BandPreview colors={previewColors} />
            {decoded ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted">
                      {da ? "Modstand" : "Resistance"}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      {decoded.formatted}
                    </p>
                  </div>
                  <CopyButton
                    value={String(decoded.ohms)}
                    label={copyLabel}
                    copiedLabel={copiedLabel}
                  />
                </div>
                <dl className="space-y-2 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">
                      {da ? "Eksakt" : "Exact"}
                    </dt>
                    <dd className="font-medium">
                      {formatNumber(decoded.ohms, locale, 4)} Ω
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Tolerance</dt>
                    <dd className="font-medium">
                      ±{formatNumber(decoded.tolerancePercent, locale, 2)} %
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="text-sm text-muted">
                {da
                  ? "Vælg gyldige farver for at aflæse modstanden."
                  : "Pick valid colors to read the resistance."}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <Field
              label={da ? "Modstand (ohm)" : "Resistance (ohms)"}
              hint={
                da
                  ? "Indtast værdien i ohm, fx 4700 for 4,7 kΩ."
                  : "Enter the value in ohms, e.g. 4700 for 4.7 kΩ."
              }
            >
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={ohmsInput}
                onChange={(e) => setOhmsInput(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <ColorSelect
              label={da ? "Tolerance" : "Tolerance"}
              value={tolerance}
              onChange={setTolerance}
              colors={TOLERANCE_COLORS}
              da={da}
            />
          </div>

          <div className="rounded-[12px] border border-border bg-surface px-5 py-5 space-y-4">
            {encoded ? (
              <>
                <BandPreview
                  colors={
                    encoded.bands === 4
                      ? [
                          encoded.digit1,
                          encoded.digit2,
                          encoded.multiplier,
                          encoded.tolerance,
                        ]
                      : [
                          encoded.digit1,
                          encoded.digit2,
                          encoded.digit3,
                          encoded.multiplier,
                          encoded.tolerance,
                        ]
                  }
                />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted">
                      {da ? "Foreslåede bånd" : "Suggested bands"}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      {encoded.formatted}
                    </p>
                  </div>
                  <CopyButton
                    value={formatOhms(encoded.ohms)}
                    label={copyLabel}
                    copiedLabel={copiedLabel}
                  />
                </div>
                <ul className="space-y-1.5 border-t border-border pt-3 text-sm">
                  {(
                    encoded.bands === 4
                      ? [
                          [da ? "1. ciffer" : "1st digit", encoded.digit1],
                          [da ? "2. ciffer" : "2nd digit", encoded.digit2],
                          [da ? "Multiplikator" : "Multiplier", encoded.multiplier],
                          ["Tolerance", encoded.tolerance],
                        ]
                      : [
                          [da ? "1. ciffer" : "1st digit", encoded.digit1],
                          [da ? "2. ciffer" : "2nd digit", encoded.digit2],
                          [da ? "3. ciffer" : "3rd digit", encoded.digit3],
                          [da ? "Multiplikator" : "Multiplier", encoded.multiplier],
                          ["Tolerance", encoded.tolerance],
                        ]
                  ).map(([label, color]) => (
                    <li
                      key={String(label)}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-muted">{label}</span>
                      <span className="inline-flex items-center gap-2 font-medium">
                        <span
                          className="h-4 w-4 rounded-[4px] border border-border"
                          style={{
                            backgroundColor: COLOR_HEX[color as BandColor],
                          }}
                        />
                        {colorLabel(color as BandColor, da)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted">
                {da
                  ? "Indtast en positiv modstand for at få farvekoder."
                  : "Enter a positive resistance to get color bands."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
