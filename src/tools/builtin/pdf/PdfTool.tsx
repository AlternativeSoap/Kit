"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import {
  ErrorBanner,
  Field,
  KitInput,
  Segmented,
  fileInputClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { ProgressBar } from "@/tools/builtin/media/ProgressBar";
import { downloadBlob } from "@/tools/builtin/media/canvas";
import { useDictionary } from "@/i18n/LanguageProvider";

type Mode = "merge" | "split" | "rotate";
type RotateDeg = "90" | "180" | "270";

type ReadyPdf = { blob: Blob; filename: string };

function parsePageRange(input: string, pageCount: number): number[] | null {
  const pages = new Set<number>();
  const parts = input.split(",").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return null;
  for (const part of parts) {
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(part);
    if (range) {
      let start = Number(range[1]);
      let end = Number(range[2]);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
      if (start > end) [start, end] = [end, start];
      for (let i = start; i <= end; i++) {
        if (i < 1 || i > pageCount) return null;
        pages.add(i - 1);
      }
      continue;
    }
    const n = Number(part);
    if (!Number.isInteger(n) || n < 1 || n > pageCount) return null;
    pages.add(n - 1);
  }
  return [...pages].sort((a, b) => a - b);
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function PdfTool() {
  const dictionary = useDictionary();
  const t = dictionary.pdfTool;
  const [mode, setMode] = useState<Mode>("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [range, setRange] = useState("1-1");
  const [rotateBy, setRotateBy] = useState<RotateDeg>("90");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState<ReadyPdf | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  /** Guards page-count loads so a slow read cannot overwrite a newer file. */
  const loadIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      loadIdRef.current += 1;
    };
  }, []);

  const canRun = useMemo(() => {
    if (busy) return false;
    if (mode === "merge") return files.length >= 2;
    return files.length === 1;
  }, [busy, files.length, mode]);

  function clearReady() {
    setReady(null);
  }

  async function loadPageCount(file: File) {
    const loadId = ++loadIdRef.current;
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      if (loadIdRef.current !== loadId) return;
      const count = doc.getPageCount();
      setPageCount(count);
      setRange(count > 1 ? `1-${count}` : "1");
    } catch {
      if (loadIdRef.current !== loadId) return;
      setPageCount(null);
      setError(t.processError);
    }
  }

  async function onPick(list: File[]) {
    setError(null);
    clearReady();
    if (!list.length) return;
    const picked = list.filter(isPdfFile);
    if (!picked.length) {
      setError(t.invalid);
      return;
    }
    if (mode === "split" || mode === "rotate") {
      const first = picked[0]!;
      setFiles([first]);
      setPageCount(null);
      await loadPageCount(first);
    } else {
      setFiles((prev) => [...prev, ...picked]);
      setPageCount(null);
    }
  }

  function changeMode(next: Mode) {
    if (busy || next === mode) return;
    setMode(next);
    clearReady();
    setError(null);
    if (next === "merge") {
      loadIdRef.current += 1;
      setPageCount(null);
      return;
    }
    // Keep a single PDF when moving between extract and rotate.
    const first = files[0];
    if (!first) {
      loadIdRef.current += 1;
      setPageCount(null);
      return;
    }
    if (files.length > 1) setFiles([first]);
    if (pageCount === null || files.length > 1) {
      setPageCount(null);
      void loadPageCount(first);
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    clearReady();
    setError(null);
  }

  function moveFile(index: number, delta: -1 | 1) {
    setFiles((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item!);
      return next;
    });
    clearReady();
  }

  async function run() {
    if (!canRun) return;
    setBusy(true);
    setProgress(8);
    setError(null);
    clearReady();
    try {
      if (mode === "merge") {
        const out = await PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          const bytes = await files[i]!.arrayBuffer();
          const src = await PDFDocument.load(bytes);
          const pages = await out.copyPages(src, src.getPageIndices());
          for (const page of pages) out.addPage(page);
          setProgress(10 + Math.round(((i + 1) / files.length) * 80));
        }
        const saved = await out.save();
        setProgress(100);
        setReady({
          blob: new Blob([Uint8Array.from(saved)], { type: "application/pdf" }),
          filename: "merged.pdf",
        });
      } else if (mode === "split") {
        const file = files[0]!;
        const bytes = await file.arrayBuffer();
        setProgress(30);
        const src = await PDFDocument.load(bytes);
        const count = src.getPageCount();
        const indices = parsePageRange(range, count);
        if (!indices?.length) {
          setError(t.invalidRange.replace("{count}", String(count)));
          setProgress(0);
          return;
        }
        setProgress(55);
        const out = await PDFDocument.create();
        const pages = await out.copyPages(src, indices);
        for (const page of pages) out.addPage(page);
        const saved = await out.save();
        setProgress(100);
        setReady({
          blob: new Blob([Uint8Array.from(saved)], { type: "application/pdf" }),
          filename: "extract.pdf",
        });
      } else {
        const file = files[0]!;
        const bytes = await file.arrayBuffer();
        setProgress(30);
        const doc = await PDFDocument.load(bytes);
        const count = doc.getPageCount();
        const indices = parsePageRange(range, count);
        if (!indices?.length) {
          setError(t.invalidRotateRange.replace("{count}", String(count)));
          setProgress(0);
          return;
        }
        setProgress(60);
        const angle = Number(rotateBy);
        for (const index of indices) {
          const page = doc.getPage(index);
          page.setRotation(degrees((page.getRotation().angle + angle) % 360));
        }
        const saved = await doc.save();
        setProgress(100);
        setReady({
          blob: new Blob([Uint8Array.from(saved)], { type: "application/pdf" }),
          filename: "rotated.pdf",
        });
      }
    } catch {
      if (mountedRef.current) {
        setError(t.processError);
        setProgress(0);
      }
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }

  const modes: { id: Mode; label: string }[] = [
    { id: "merge", label: t.merge },
    { id: "split", label: t.split },
    { id: "rotate", label: t.rotate },
  ];

  const rotateOptions: { id: RotateDeg; label: string }[] = [
    { id: "90", label: "90°" },
    { id: "180", label: "180°" },
    { id: "270", label: "270°" },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <p className="text-sm text-muted">{t.privacy}</p>

      <Segmented
        ariaLabel={t.modeLabel}
        value={mode}
        options={modes}
        onChange={changeMode}
      />

      <Field label={mode === "merge" ? t.pickMany : t.pickOne}>
        <input
          type="file"
          accept="application/pdf,.pdf"
          multiple={mode === "merge"}
          disabled={busy}
          onChange={(event) => {
            const list = event.target.files;
            const picked = list ? [...list] : [];
            event.target.value = "";
            void onPick(picked);
          }}
          className={fileInputClass}
        />
      </Field>

      {files.length > 0 ? (
        <ul className="space-y-2 text-sm text-muted">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <span className="min-w-0 flex-1 truncate">
                {file.name} ({Math.round(file.size / 1024)} KB)
                {pageCount !== null && mode !== "merge"
                  ? ` · ${pageCount} ${t.pageWord}`
                  : ""}
              </span>
              {mode === "merge" ? (
                <span className="flex gap-1">
                  <button
                    type="button"
                    disabled={busy || index === 0}
                    onClick={() => moveFile(index, -1)}
                    aria-label={`${t.moveUp}: ${file.name}`}
                    className={`${secondaryBtnClass} !px-2.5 !py-1.5`}
                  >
                    {t.moveUp}
                  </button>
                  <button
                    type="button"
                    disabled={busy || index === files.length - 1}
                    onClick={() => moveFile(index, 1)}
                    aria-label={`${t.moveDown}: ${file.name}`}
                    className={`${secondaryBtnClass} !px-2.5 !py-1.5`}
                  >
                    {t.moveDown}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => removeFile(index)}
                    aria-label={`${t.removeFile}: ${file.name}`}
                    className={`${secondaryBtnClass} !px-2.5 !py-1.5`}
                  >
                    {t.removeFile}
                  </button>
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {(mode === "split" || mode === "rotate") && pageCount !== null ? (
        <Field
          label={t.pages.replace("{count}", String(pageCount))}
          hint={t.pagesHint}
        >
          <KitInput
            value={range}
            disabled={busy}
            onChange={(event) => {
              setRange(event.target.value);
              setError(null);
              clearReady();
            }}
            placeholder={t.pagesHint}
          />
        </Field>
      ) : null}

      {mode === "rotate" ? (
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">
            {t.rotateAngle}
          </span>
          <Segmented
            ariaLabel={t.rotateAngle}
            value={rotateBy}
            options={rotateOptions}
            onChange={(next) => {
              if (busy) return;
              setRotateBy(next);
              clearReady();
            }}
          />
        </div>
      ) : null}

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}
      {busy ? <ProgressBar value={progress} label={t.working} /> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canRun}
          onClick={() => void run()}
          className={primaryBtnClass}
        >
          {busy
            ? t.working
            : mode === "merge"
              ? t.runMerge
              : mode === "split"
                ? t.runSplit
                : t.runRotate}
        </button>
        {ready ? (
          <button
            type="button"
            onClick={() => downloadBlob(ready.blob, ready.filename)}
            className={secondaryBtnClass}
          >
            {t.download}
          </button>
        ) : null}
      </div>
    </div>
  );
}
