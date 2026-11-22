"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { calculateTiles } from "./calc";

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function FliserTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [roomLength, setRoomLength] = useState("4.5");
  const [roomWidth, setRoomWidth] = useState("3.2");
  const [tileLength, setTileLength] = useState("30");
  const [tileWidth, setTileWidth] = useState("30");
  const [gapMm, setGapMm] = useState("3");
  const [waste, setWaste] = useState("10");
  const [perBox, setPerBox] = useState("11");

  const result = useMemo(() => {
    const roomLengthM = parseField(roomLength);
    const roomWidthM = parseField(roomWidth);
    const tileLengthCm = parseField(tileLength);
    const tileWidthCm = parseField(tileWidth);
    const gap = parseField(gapMm);
    const wastePercent = parseField(waste);
    if (
      roomLengthM === undefined ||
      roomWidthM === undefined ||
      tileLengthCm === undefined ||
      tileWidthCm === undefined ||
      gap === undefined ||
      wastePercent === undefined
    ) {
      return null;
    }
    const trimmedBox = perBox.trim();
    const tilesPerBox =
      trimmedBox === "" ? null : parseField(trimmedBox) ?? null;
    if (trimmedBox !== "" && tilesPerBox === null) return null;

    return calculateTiles({
      roomLengthM,
      roomWidthM,
      tileLengthCm,
      tileWidthCm,
      gapMm: gap,
      wastePercent,
      tilesPerBox,
    });
  }, [
    roomLength,
    roomWidth,
    tileLength,
    tileWidth,
    gapMm,
    waste,
    perBox,
  ]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={da ? "Rum længde (m)" : "Room length (m)"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={roomLength}
              onChange={(e) => setRoomLength(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={da ? "Rum bredde (m)" : "Room width (m)"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={roomWidth}
              onChange={(e) => setRoomWidth(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={da ? "Flise længde (cm)" : "Tile length (cm)"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={tileLength}
              onChange={(e) => setTileLength(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={da ? "Flise bredde (cm)" : "Tile width (cm)"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={tileWidth}
              onChange={(e) => setTileWidth(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={da ? "Fuge (mm)" : "Gap (mm)"}
            hint={
              da
                ? "Afstand mellem fliser, medregnet i dækning."
                : "Space between tiles, included in coverage."
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={gapMm}
              onChange={(e) => setGapMm(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={da ? "Spild (%)" : "Waste (%)"}
            hint={
              da
                ? "Ekstra til snit og brud. Typisk 5–15 %."
                : "Extra for cuts and breakage. Typically 5–15%."
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={waste}
              onChange={(e) => setWaste(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <Field
          label={da ? "Fliser pr. pakke (valgfri)" : "Tiles per box (optional)"}
          hint={
            da
              ? "Udfyld for at få antal pakker."
              : "Fill in to get the number of boxes."
          }
        >
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={perBox}
            onChange={(e) => setPerBox(e.target.value)}
            className={fieldClass}
          />
        </Field>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">
                    {da ? "Fliser nødvendige" : "Tiles needed"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatNumber(result.tilesNeeded, locale, 0)}
                  </p>
                </div>
                <CopyButton
                  value={String(result.tilesNeeded)}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Rumareal" : "Room area"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.roomAreaM2, locale, 2)} m²
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Effektiv fliseareal" : "Effective tile area"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.tileAreaM2, locale, 4)} m²
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Præcist behov" : "Exact need"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.tilesExact, locale, 2)}
                </dd>
              </div>
              {result.boxesNeeded !== null ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Pakker" : "Boxes"}
                  </dt>
                  <dd className="font-medium">
                    {formatNumber(result.boxesNeeded, locale, 0)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Udfyld rum- og flisemål for at beregne behovet."
              : "Enter room and tile sizes to calculate what you need."}
          </p>
        )}
      </div>
    </div>
  );
}
