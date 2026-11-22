"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Segmented, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import {
  downloadDataUrl,
  downloadSvg,
  generateBarcode,
  svgToPngDataUrl,
  type BarcodeMode,
} from "./calc";

const MODES: readonly BarcodeMode[] = ["code128", "ean13"];

export function BarcodeTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<BarcodeMode>(
    prefillChoice(prefill, "mode", MODES) ?? "code128",
  );
  const [text, setText] = useState(
    () => prefill?.value ?? prefill?.text ?? "Kit-123",
  );

  const result = useMemo(() => generateBarcode(mode, text), [mode, text]);

  const errorMessage = (() => {
    if (result.ok) return null;
    if (result.error === "empty") {
      return da ? "Skriv noget tekst eller et nummer." : "Enter some text or a number.";
    }
    if (result.error === "invalid_chars") {
      return da
        ? "Code 128 (B) understøtter kun tegnene ASCII 32–126."
        : "Code 128 (B) only supports ASCII characters 32–126.";
    }
    if (result.error === "ean_digits") {
      return da
        ? "EAN-13 kræver 12 eller 13 cifre."
        : "EAN-13 needs 12 or 13 digits.";
    }
    return da
      ? "Kontrolcifret stemmer ikke. Ret det sidste ciffer, eller brug 12 cifre."
      : "The check digit does not match. Fix the last digit, or enter 12 digits.";
  })();

  const onDownloadSvg = () => {
    if (!result.ok) return;
    downloadSvg(result.svg, mode === "ean13" ? "ean13.svg" : "code128.svg");
  };

  const onDownloadPng = async () => {
    if (!result.ok) return;
    const png = await svgToPngDataUrl(result.svg);
    if (!png) return;
    downloadDataUrl(png, mode === "ean13" ? "ean13.png" : "code128.png");
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Segmented
        value={mode}
        onChange={setMode}
        ariaLabel={da ? "Stregkode-type" : "Barcode type"}
        options={[
          { id: "code128", label: "Code 128" },
          { id: "ean13", label: "EAN-13" },
        ]}
      />

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">
          {mode === "ean13"
            ? da
              ? "Nummer (12 eller 13 cifre)"
              : "Number (12 or 13 digits)"
            : da
              ? "Tekst"
              : "Text"}
        </span>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
          className={`${fieldClass} font-mono`}
          placeholder={mode === "ean13" ? "570123456789" : "ABC-123"}
        />
        {mode === "ean13" ? (
          <span className="mt-1 block text-xs text-muted">
            {da
              ? "Med 12 cifre beregnes kontrolcifret. Med 13 cifre tjekkes det."
              : "With 12 digits the check digit is calculated. With 13 it is verified."}
          </span>
        ) : null}
      </label>

      {!result.ok ? (
        <div className="rounded-[12px] border border-border bg-surface px-4 py-3 text-sm text-muted">
          <p className="font-medium text-foreground">
            {da ? "Ugyldigt input" : "Invalid input"}
          </p>
          <p className="mt-1">{errorMessage}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-3 rounded-[12px] border border-border bg-surface px-4 py-6">
            <div
              className="max-w-full overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: result.svg }}
            />
            <p className="font-mono text-sm text-muted">{result.value}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onDownloadSvg}
              className="kit-touch-target rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-on-accent hover:opacity-90 sm:min-h-0"
            >
              {da ? "Hent SVG" : "Download SVG"}
            </button>
            <button
              type="button"
              onClick={() => void onDownloadPng()}
              className="kit-touch-target rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:bg-overlay sm:min-h-0"
            >
              {da ? "Hent PNG" : "Download PNG"}
            </button>
            <CopyButton
              value={result.value}
              label={da ? "Kopiér" : "Copy"}
              copiedLabel={da ? "Kopieret" : "Copied"}
            />
          </div>
        </>
      )}
    </div>
  );
}
