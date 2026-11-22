"use client";

import { useId, useState } from "react";
import {
  ErrorBanner,
  fieldClass,
  fileInputClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import {
  downloadBytes,
  downloadSequentially,
  extractEachPage,
  extractPagesToPdf,
  loadPdf,
  parsePageRanges,
  type PdfSplitError,
} from "./calc";

type SplitMode = "range" | "each";

const MODES: readonly SplitMode[] = ["range", "each"];

function errorText(error: PdfSplitError, da: boolean, pageCount?: number): string {
  if (error.kind === "empty") {
    return da
      ? "Angiv sider, for eksempel 1-3,5,8-10."
      : "Enter pages, for example 1-3,5,8-10.";
  }
  if (error.kind === "encrypted") {
    return da
      ? "PDF-filen er krypteret eller adgangskodebeskyttet. Fjern adgangskoden og prøv igen."
      : "The PDF is encrypted or password-protected. Remove the password and try again.";
  }
  if (error.kind === "invalid") {
    return da ? "Ugyldig eller beskadiget PDF." : "Invalid or damaged PDF.";
  }
  if (error.kind === "range") {
    const hint =
      pageCount !== undefined
        ? da
          ? ` Dokumentet har ${pageCount} sider.`
          : ` The document has ${pageCount} pages.`
        : "";
    return `${error.message}.${hint}`.trim();
  }
  return da
    ? `Kunne ikke behandle PDF: ${error.message}`
    : `Could not process PDF: ${error.message}`;
}

export function PdfSplitTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";
  const inputId = useId();

  const [mode, setMode] = useState<SplitMode>(
    prefillChoice(prefill, "mode", MODES) ?? "range",
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [ranges, setRanges] = useState(
    () => prefill?.pages ?? prefill?.range ?? "1-3",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function onPick(file: File | null) {
    setError(null);
    setStatus(null);
    setBytes(null);
    setFileName(null);
    setPageCount(null);
    if (!file) return;
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError(da ? "Vælg en PDF-fil." : "Choose a PDF file.");
      return;
    }
    const buffer = await file.arrayBuffer();
    const loaded = await loadPdf(buffer);
    if (!loaded.ok) {
      setError(errorText(loaded.error, da));
      return;
    }
    setBytes(buffer);
    setFileName(file.name);
    setPageCount(loaded.pageCount);
  }

  async function onExtractRange() {
    setError(null);
    setStatus(null);
    if (!bytes || pageCount === null) {
      setError(da ? "Vælg en PDF-fil først." : "Choose a PDF file first.");
      return;
    }
    const parsed = parsePageRanges(ranges, pageCount);
    if (!parsed.ok) {
      setError(errorText(parsed.error, da, pageCount));
      return;
    }
    setBusy(true);
    try {
      const loaded = await loadPdf(bytes);
      if (!loaded.ok) {
        setError(errorText(loaded.error, da));
        return;
      }
      const extracted = await extractPagesToPdf(loaded.doc, parsed.pages);
      if (!extracted.ok) {
        setError(errorText(extracted.error, da, pageCount));
        return;
      }
      const base = (fileName ?? "document").replace(/\.pdf$/i, "");
      downloadBytes(extracted.bytes, `${base}-pages.pdf`);
      setStatus(
        da
          ? `Downloadede ${parsed.pages.length} sider.`
          : `Downloaded ${parsed.pages.length} pages.`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        da
          ? `Kunne ikke udtrække sider: ${message}`
          : `Could not extract pages: ${message}`,
      );
    } finally {
      setBusy(false);
    }
  }

  async function onDownloadEachSelected() {
    setError(null);
    setStatus(null);
    if (!bytes || pageCount === null) {
      setError(da ? "Vælg en PDF-fil først." : "Choose a PDF file first.");
      return;
    }
    const parsed = parsePageRanges(ranges, pageCount);
    if (!parsed.ok) {
      setError(errorText(parsed.error, da, pageCount));
      return;
    }
    setBusy(true);
    try {
      const loaded = await loadPdf(bytes);
      if (!loaded.ok) {
        setError(errorText(loaded.error, da));
        return;
      }
      const files: { name: string; bytes: Uint8Array }[] = [];
      const pad = String(pageCount).length;
      for (const page of parsed.pages) {
        const one = await extractPagesToPdf(loaded.doc, [page]);
        if (!one.ok) {
          setError(errorText(one.error, da, pageCount));
          return;
        }
        files.push({
          name: `page-${String(page).padStart(pad, "0")}.pdf`,
          bytes: one.bytes,
        });
      }
      await downloadSequentially(files);
      setStatus(
        da
          ? `Downloadede ${files.length} filer én ad gangen.`
          : `Downloaded ${files.length} files one by one.`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        da
          ? `Kunne ikke downloade sider: ${message}`
          : `Could not download pages: ${message}`,
      );
    } finally {
      setBusy(false);
    }
  }

  async function onSplitEveryPage() {
    setError(null);
    setStatus(null);
    if (!bytes || pageCount === null) {
      setError(da ? "Vælg en PDF-fil først." : "Choose a PDF file first.");
      return;
    }
    setBusy(true);
    try {
      const loaded = await loadPdf(bytes);
      if (!loaded.ok) {
        setError(errorText(loaded.error, da));
        return;
      }
      const result = await extractEachPage(loaded.doc);
      if (!result.ok) {
        setError(errorText(result.error, da, pageCount));
        return;
      }
      await downloadSequentially(result.files);
      setStatus(
        da
          ? `Downloadede ${result.files.length} sider én ad gangen.`
          : `Downloaded ${result.files.length} pages one by one.`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        da
          ? `Kunne ikke splitte PDF: ${message}`
          : `Could not split PDF: ${message}`,
      );
    } finally {
      setBusy(false);
    }
  }

  const modes: { id: SplitMode; label: string }[] = [
    { id: "range", label: da ? "Sideområder" : "Page ranges" },
    { id: "each", label: da ? "Hver side" : "Every page" },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <p className="text-sm text-muted">
        {da
          ? "Udtræk sider eller split en PDF i browseren. Filen forlader ikke din enhed."
          : "Extract pages or split a PDF in your browser. The file never leaves your device."}
      </p>

      <div className="flex flex-wrap gap-2">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setMode(item.id);
              setError(null);
              setStatus(null);
            }}
            className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm sm:min-h-0 ${
              mode === item.id
                ? "border-accent bg-accent text-on-accent"
                : "border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className="block" htmlFor={inputId}>
        <span className="mb-1.5 block text-sm font-medium">
          {da ? "PDF-fil" : "PDF file"}
        </span>
        <input
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => {
            void onPick(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
          className={fileInputClass}
        />
      </label>

      {fileName && pageCount !== null ? (
        <p className="text-sm text-muted">
          {da
            ? `${fileName} · ${pageCount} sider`
            : `${fileName} · ${pageCount} pages`}
        </p>
      ) : null}

      {mode === "range" ? (
        <>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              {da ? "Sider" : "Pages"}
            </span>
            <input
              type="text"
              value={ranges}
              onChange={(event) => setRanges(event.target.value)}
              placeholder="1-3,5,8-10"
              className={fieldClass}
            />
            <span className="mt-1 block text-xs text-muted">
              {da
                ? "Brug kommaseparerede sider og områder, for eksempel 1-3,5,8-10."
                : "Use comma-separated pages and ranges, for example 1-3,5,8-10."}
            </span>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={primaryBtnClass}
              disabled={busy || !bytes}
              onClick={() => void onExtractRange()}
            >
              {busy
                ? da
                  ? "Arbejder…"
                  : "Working…"
                : da
                  ? "Download som én PDF"
                  : "Download as one PDF"}
            </button>
            <button
              type="button"
              className={secondaryBtnClass}
              disabled={busy || !bytes}
              onClick={() => void onDownloadEachSelected()}
            >
              {da ? "Hver side for sig" : "Each page separately"}
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={primaryBtnClass}
            disabled={busy || !bytes}
            onClick={() => void onSplitEveryPage()}
          >
            {busy
              ? da
                ? "Splitter…"
                : "Splitting…"
              : da
                ? "Download hver side"
                : "Download every page"}
          </button>
        </div>
      )}

      <ErrorBanner>{error}</ErrorBanner>
      {status ? (
        <p className="rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-foreground">
          {status}
        </p>
      ) : null}
    </div>
  );
}
