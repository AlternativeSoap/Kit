"use client";

import { useMemo, useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { ProgressBar } from "@/tools/builtin/media/ProgressBar";
import { useDictionary } from "@/i18n/LanguageProvider";

type Mode = "merge" | "split" | "rotate";
type RotateDeg = 90 | 180 | 270;

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

export function PdfTool() {
  const dictionary = useDictionary();
  const t = dictionary.pdfTool;
  const [mode, setMode] = useState<Mode>("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [range, setRange] = useState("1-1");
  const [rotateBy, setRotateBy] = useState<RotateDeg>(90);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const [readyName, setReadyName] = useState("result.pdf");
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  const canRun = useMemo(() => {
    if (busy) return false;
    if (mode === "merge") return files.length >= 2;
    return files.length === 1;
  }, [busy, files.length, mode]);

  async function onPick(list: FileList | null) {
    setError(null);
    setReadyUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (!list?.length) {
      setFiles([]);
      setPageCount(null);
      return;
    }
    const picked = [...list].filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    if (!picked.length) {
      setFiles([]);
      setError(t.invalid);
      return;
    }
    if (mode === "split" || mode === "rotate") {
      const first = picked[0]!;
      setFiles([first]);
      try {
        const bytes = await first.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const count = doc.getPageCount();
        setPageCount(count);
        setRange(count > 1 ? `1-${count}` : "1");
      } catch {
        setPageCount(null);
        setError(t.processError);
      }
    } else {
      setFiles(picked);
      setPageCount(null);
    }
  }

  async function run() {
    if (!canRun) return;
    setBusy(true);
    setProgress(8);
    setError(null);
    setReadyUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
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
        const copy = Uint8Array.from(saved);
        const blob = new Blob([copy], { type: "application/pdf" });
        setReadyUrl(URL.createObjectURL(blob));
        setReadyName("merged.pdf");
      } else if (mode === "split") {
        const file = files[0]!;
        const bytes = await file.arrayBuffer();
        setProgress(30);
        const src = await PDFDocument.load(bytes);
        const count = src.getPageCount();
        const indices = parsePageRange(range, count);
        if (!indices?.length) {
          setError(t.invalidRange.replace("{count}", String(count)));
          return;
        }
        setProgress(55);
        const out = await PDFDocument.create();
        const pages = await out.copyPages(src, indices);
        for (const page of pages) out.addPage(page);
        const saved = await out.save();
        setProgress(100);
        const copy = Uint8Array.from(saved);
        setReadyUrl(URL.createObjectURL(new Blob([copy], { type: "application/pdf" })));
        setReadyName("extract.pdf");
      } else {
        const file = files[0]!;
        const bytes = await file.arrayBuffer();
        setProgress(30);
        const doc = await PDFDocument.load(bytes);
        const count = doc.getPageCount();
        const indices = parsePageRange(range, count) ?? doc.getPageIndices();
        setProgress(60);
        for (const index of indices) {
          const page = doc.getPage(index);
          page.setRotation(degrees((page.getRotation().angle + rotateBy) % 360));
        }
        const saved = await doc.save();
        setProgress(100);
        const copy = Uint8Array.from(saved);
        setReadyUrl(URL.createObjectURL(new Blob([copy], { type: "application/pdf" })));
        setReadyName("rotated.pdf");
      }
    } catch {
      setError(t.processError);
    } finally {
      setBusy(false);
    }
  }

  const modes: { id: Mode; label: string }[] = [
    { id: "merge", label: t.merge },
    { id: "split", label: t.split },
    { id: "rotate", label: t.rotate },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <p className="text-sm text-muted">{t.privacy}</p>

      <div className="flex flex-wrap gap-2">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              const next = item.id;
              setMode(next);
              setReadyUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
              });
              setError(null);
              // Keep a single PDF when moving between extract and rotate.
              if (next === "merge") {
                // Keep all files for merge; page count only matters for one-file modes.
                setPageCount(null);
                return;
              }
              setFiles((prev) => {
                const first = prev[0];
                if (!first) {
                  setPageCount(null);
                  return [];
                }
                void first.arrayBuffer().then(async (bytes) => {
                  try {
                    const doc = await PDFDocument.load(bytes);
                    const count = doc.getPageCount();
                    setPageCount(count);
                    setRange(count > 1 ? `1-${count}` : "1");
                  } catch {
                    setPageCount(null);
                  }
                });
                return [first];
              });
            }}
            className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm sm:min-h-0 ${
              mode === item.id
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">
          {mode === "merge" ? t.pickMany : t.pickOne}
        </span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          multiple={mode === "merge"}
          onChange={(event) => void onPick(event.target.files)}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-[8px] file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
        />
      </label>

      {files.length > 0 ? (
        <ul className="space-y-1 text-sm text-muted">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`} className="truncate">
              {file.name} ({Math.round(file.size / 1024)} KB)
              {pageCount !== null ? ` · ${pageCount} ${t.pageWord}` : ""}
            </li>
          ))}
        </ul>
      ) : null}

      {(mode === "split" || mode === "rotate") && pageCount !== null ? (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">
            {t.pages.replace("{count}", String(pageCount))}
          </span>
          <input
            value={range}
            onChange={(event) => setRange(event.target.value)}
            placeholder={t.pagesHint}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
          <span className="mt-1 block text-xs text-muted">{t.pagesHint}</span>
        </label>
      ) : null}

      {mode === "rotate" ? (
        <div className="flex flex-wrap gap-2">
          {([90, 180, 270] as const).map((deg) => (
            <button
              key={deg}
              type="button"
              onClick={() => setRotateBy(deg)}
              className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm sm:min-h-0 ${
                rotateBy === deg
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {deg}°
            </button>
          ))}
        </div>
      ) : null}

      {error ? <p className="text-sm text-muted">{error}</p> : null}
      {busy ? <ProgressBar value={progress} label={t.working} /> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canRun}
          onClick={() => void run()}
          className="kit-touch-target rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 sm:min-h-0"
        >
          {busy
            ? t.working
            : mode === "merge"
              ? t.runMerge
              : mode === "split"
                ? t.runSplit
                : t.runRotate}
        </button>
        {readyUrl ? (
          <a
            href={readyUrl}
            download={readyName}
            className="kit-touch-target rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground sm:min-h-0"
          >
            {t.download}
          </a>
        ) : null}
      </div>
    </div>
  );
}
