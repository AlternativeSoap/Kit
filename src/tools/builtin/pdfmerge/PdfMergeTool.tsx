"use client";

import { useId, useState } from "react";
import {
  ErrorBanner,
  fileInputClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { downloadBytes, mergePdfFiles, type PdfMergeError } from "./calc";

type ListedFile = {
  id: string;
  name: string;
  size: number;
  bytes: ArrayBuffer;
};

function formatSize(bytes: number, da: boolean): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return da ? `${kb.toFixed(1)} KB` : `${kb.toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function errorText(error: PdfMergeError, da: boolean): string {
  const name = error.fileName ? ` (${error.fileName})` : "";
  if (error.kind === "empty") {
    return da ? "Vælg mindst én PDF-fil." : "Choose at least one PDF file.";
  }
  if (error.kind === "encrypted") {
    return da
      ? `PDF-filen er krypteret eller adgangskodebeskyttet${name}. Fjern adgangskoden og prøv igen.`
      : `The PDF is encrypted or password-protected${name}. Remove the password and try again.`;
  }
  if (error.kind === "invalid") {
    return da
      ? `Ugyldig eller beskadiget PDF${name}.`
      : `Invalid or damaged PDF${name}.`;
  }
  return da
    ? `Kunne ikke flette PDF-filer${name}: ${error.message}`
    : `Could not merge PDFs${name}: ${error.message}`;
}

export function PdfMergeTool({ prefill: _prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";
  const inputId = useId();

  const [files, setFiles] = useState<ListedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setError(null);
    setStatus(null);
    const next: ListedFile[] = [];
    for (const file of Array.from(list)) {
      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        setError(
          da
            ? `"${file.name}" er ikke en PDF-fil.`
            : `"${file.name}" is not a PDF file.`,
        );
        continue;
      }
      const bytes = await file.arrayBuffer();
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        size: file.size,
        bytes,
      });
    }
    if (next.length > 0) {
      setFiles((prev) => [...prev, ...next]);
    }
  }

  function move(index: number, direction: -1 | 1) {
    setFiles((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item!);
      return copy;
    });
    setError(null);
    setStatus(null);
  }

  function removeAt(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
    setStatus(null);
  }

  async function onMerge() {
    setError(null);
    setStatus(null);
    if (files.length === 0) {
      setError(errorText({ kind: "empty", message: "No files" }, da));
      return;
    }
    setBusy(true);
    try {
      const result = await mergePdfFiles(
        files.map((file) => ({ name: file.name, bytes: file.bytes })),
      );
      if (!result.ok) {
        setError(errorText(result.error, da));
        return;
      }
      downloadBytes(result.bytes, "merged.pdf");
      setStatus(
        da
          ? `Flettet ${files.length} filer (${result.pageCount} sider).`
          : `Merged ${files.length} files (${result.pageCount} pages).`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        da
          ? `Kunne ikke flette PDF-filer: ${message}`
          : `Could not merge PDFs: ${message}`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <p className="text-sm text-muted">
        {da
          ? "Flet flere PDF-filer i browseren. Filene forlader ikke din enhed."
          : "Merge multiple PDF files in your browser. Files never leave your device."}
      </p>

      <label className="block" htmlFor={inputId}>
        <span className="mb-1.5 block text-sm font-medium">
          {da ? "PDF-filer" : "PDF files"}
        </span>
        <input
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={(event) => {
            void addFiles(event.target.files);
            event.target.value = "";
          }}
          className={fileInputClass}
        />
      </label>

      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={file.id}
              className="flex flex-wrap items-center gap-2 rounded-[12px] border border-border bg-surface px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted">{formatSize(file.size, da)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={secondaryBtnClass}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label={da ? "Flyt op" : "Move up"}
                >
                  {da ? "Op" : "Up"}
                </button>
                <button
                  type="button"
                  className={secondaryBtnClass}
                  disabled={index === files.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label={da ? "Flyt ned" : "Move down"}
                >
                  {da ? "Ned" : "Down"}
                </button>
                <button
                  type="button"
                  className={secondaryBtnClass}
                  onClick={() => removeAt(index)}
                >
                  {da ? "Fjern" : "Remove"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={primaryBtnClass}
          disabled={busy || files.length === 0}
          onClick={() => void onMerge()}
        >
          {busy
            ? da
              ? "Fletter…"
              : "Merging…"
            : da
              ? "Flet og download"
              : "Merge and download"}
        </button>
        {files.length > 0 ? (
          <button
            type="button"
            className={secondaryBtnClass}
            disabled={busy}
            onClick={() => {
              setFiles([]);
              setError(null);
              setStatus(null);
            }}
          >
            {da ? "Ryd liste" : "Clear list"}
          </button>
        ) : null}
      </div>

      <ErrorBanner>{error}</ErrorBanner>
      {status ? (
        <p className="rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-foreground">
          {status}
        </p>
      ) : null}
    </div>
  );
}
