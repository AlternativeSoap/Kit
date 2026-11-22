"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass, Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillChoice, prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { estimateMovingBoxes, type FlytMode } from "./calc";

const MODES: readonly FlytMode[] = ["rooms", "items"];

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function FlyttekasserTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<FlytMode>(
    prefillChoice(prefill, "mode", MODES) ?? "rooms",
  );
  const [rooms, setRooms] = useState(
    prefillNumber(prefill, "rooms", { min: 0, integer: true }) ?? "3",
  );
  const [books, setBooks] = useState(
    prefillNumber(prefill, "books", { min: 0, integer: true }) ?? "40",
  );
  const [clothes, setClothes] = useState(
    prefillNumber(prefill, "clothes", { min: 0, integer: true }) ?? "30",
  );
  const [kitchen, setKitchen] = useState(
    prefillNumber(prefill, "kitchen", { min: 0, integer: true }) ?? "25",
  );
  const [misc, setMisc] = useState(
    prefillNumber(prefill, "misc", { min: 0, integer: true }) ?? "20",
  );
  const [smallShare, setSmallShare] = useState(
    prefillNumber(prefill, "small", { min: 0 }) ?? "25",
  );
  const [mediumShare, setMediumShare] = useState(
    prefillNumber(prefill, "medium", { min: 0 }) ?? "50",
  );
  const [largeShare, setLargeShare] = useState(
    prefillNumber(prefill, "large", { min: 0 }) ?? "25",
  );

  const result = useMemo(() => {
    const smallN = parseField(smallShare);
    const mediumN = parseField(mediumShare);
    const largeN = parseField(largeShare);
    if (
      smallN === undefined ||
      mediumN === undefined ||
      largeN === undefined
    ) {
      return null;
    }

    return estimateMovingBoxes({
      mode,
      rooms: parseField(rooms) ?? 0,
      books: parseField(books) ?? 0,
      clothes: parseField(clothes) ?? 0,
      kitchen: parseField(kitchen) ?? 0,
      misc: parseField(misc) ?? 0,
      smallShare: smallN / 100,
      mediumShare: mediumN / 100,
      largeShare: largeN / 100,
    });
  }, [
    mode,
    rooms,
    books,
    clothes,
    kitchen,
    misc,
    smallShare,
    mediumShare,
    largeShare,
  ]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";
  const totalText = result
    ? formatNumber(result.totalBoxes, locale, 0)
    : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Beregningsmetode" : "Estimate method"}
          </p>
          <Segmented
            value={mode}
            onChange={setMode}
            ariaLabel={da ? "Metode" : "Method"}
            options={[
              { id: "rooms", label: da ? "Efter rum" : "By rooms" },
              { id: "items", label: da ? "Efter ting" : "By items" },
            ]}
          />
        </div>

        {mode === "rooms" ? (
          <Field
            label={da ? "Antal rum" : "Number of rooms"}
            hint={
              da
                ? "Soveværelser, stue og lignende. Køkken tæller med."
                : "Bedrooms, living rooms, and similar. Include the kitchen."
            }
          >
            <input
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              className={fieldClass}
            />
          </Field>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={da ? "Bøger (stk.)" : "Books (count)"}>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={books}
                onChange={(e) => setBooks(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label={da ? "Tøj (stk.)" : "Clothes (count)"}>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={clothes}
                onChange={(e) => setClothes(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label={da ? "Køkken (stk.)" : "Kitchen items"}>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={kitchen}
                onChange={(e) => setKitchen(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label={da ? "Diverse (stk.)" : "Misc items"}>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={misc}
                onChange={(e) => setMisc(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label={da ? "Små kasser (%)" : "Small boxes (%)"}
            hint={da ? "Andel af totalen" : "Share of total"}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={smallShare}
              onChange={(e) => setSmallShare(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={da ? "Mellem (%)" : "Medium (%)"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={mediumShare}
              onChange={(e) => setMediumShare(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={da ? "Store (%)" : "Large (%)"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={largeShare}
              onChange={(e) => setLargeShare(e.target.value)}
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
                    {da ? "Kasser i alt" : "Boxes total"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {totalText}
                  </p>
                </div>
                <CopyButton
                  value={totalText}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{da ? "Små" : "Small"}</dt>
                <dd className="font-medium">
                  {formatNumber(result.small, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{da ? "Mellem" : "Medium"}</dt>
                <dd className="font-medium">
                  {formatNumber(result.medium, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{da ? "Store" : "Large"}</dt>
                <dd className="font-medium">
                  {formatNumber(result.large, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-2">
                <dt className="text-muted">
                  {da ? "Tape (ruller)" : "Tape (rolls)"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.tapeRolls, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Pakpapir (pakker)" : "Packing paper (packs)"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.paperPacks, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Bobleplast (ruller)" : "Bubble wrap (rolls)"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.bubbleRolls, locale, 0)}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Udfyld rum eller ting for at estimere kasser."
              : "Enter rooms or items to estimate boxes."}
          </p>
        )}
      </div>
    </div>
  );
}
