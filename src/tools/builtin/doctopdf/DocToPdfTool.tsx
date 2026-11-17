"use client";

import { useEffect, useRef, useState } from "react";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import {
  ErrorBanner,
  Field,
  KitSelect,
  fileInputClass,
  primaryBtnClass,
} from "@/components/tools/ui";
import { CdnLoadError, importFromUrl } from "@/lib/cdnImport";
import { useDictionary } from "@/i18n/LanguageProvider";
import { downloadBlob, formatBytes } from "../media/canvas";
import { toWinAnsiSafe } from "./winansi";

type PageSize = "a4" | "letter";
type FontSize = 10 | 11 | 12;

const PAGE_DIMENSIONS: Record<PageSize, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

const FONT_SIZES: readonly FontSize[] = [10, 11, 12];

type PdfResult = {
  blob: Blob;
  filename: string;
  size: number;
  info: string;
};

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await importFromUrl<{
    extractRawText: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
  }>("https://cdn.jsdelivr.net/npm/mammoth@1.8.0/+esm");
  const result = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer(),
  });
  return result.value;
}

function wrapLines(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  const fits = (s: string) => font.widthOfTextAtSize(s, fontSize) <= maxWidth;

  for (const paragraph of text.replace(/\r\n/g, "\n").split("\n")) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (fits(next)) {
        current = next;
        continue;
      }
      if (current) lines.push(current);
      if (fits(word)) {
        current = word;
        continue;
      }
      // Break oversized tokens by measured width.
      let chunk = "";
      for (const ch of word) {
        const trial = chunk + ch;
        if (chunk && !fits(trial)) {
          lines.push(chunk);
          chunk = ch;
        } else {
          chunk = trial;
        }
      }
      current = chunk;
    }
    if (current) lines.push(current);
  }
  return lines;
}

async function textToPdf(
  text: string,
  pageSize: PageSize,
  fontSize: FontSize,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const lineHeight = Math.round(fontSize * 1.3);
  const margin = 48;
  const { width: pageWidth, height: pageHeight } = PAGE_DIMENSIONS[pageSize];
  const maxWidth = pageWidth - margin * 2;
  const lines = wrapLines(text, font, fontSize, maxWidth);

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  for (const line of lines) {
    if (y < margin + lineHeight) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    page.drawText(line || " ", {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0.08, 0.08, 0.08),
      maxWidth,
    });
    y -= lineHeight;
  }

  return doc.save();
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent"
    />
  );
}

export function DocToPdfTool() {
  const dictionary = useDictionary();
  const t = dictionary.doctopdfTool;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PdfResult | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [fontSize, setFontSize] = useState<FontSize>(11);
  const [file, setFile] = useState<File | null>(null);
  const runIdRef = useRef(0);

  useEffect(
    () => () => {
      runIdRef.current += 1;
    },
    [],
  );

  async function convert(source: File, size: PageSize, font: FontSize) {
    const runId = ++runIdRef.current;
    const stale = () => runIdRef.current !== runId;
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const name = source.name.toLowerCase();
      let text = "";
      if (
        name.endsWith(".docx") ||
        source.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        text = await extractDocxText(source);
      } else if (
        name.endsWith(".txt") ||
        name.endsWith(".md") ||
        source.type.startsWith("text/")
      ) {
        text = await source.text();
      } else {
        if (!stale()) setError(t.unsupported);
        return;
      }
      if (stale()) return;

      if (!text.trim()) {
        setError(t.empty);
        return;
      }

      const safe = toWinAnsiSafe(text);
      const bytes = await textToPdf(safe.text, size, font);
      if (stale()) return;
      const blob = new Blob([new Uint8Array(bytes)], {
        type: "application/pdf",
      });
      const base = source.name.replace(/\.[^.]+$/, "") || "document";
      const ready = t.ready
        .replace("{from}", formatBytes(source.size))
        .replace("{to}", formatBytes(blob.size));
      setResult({
        blob,
        filename: `${base}.pdf`,
        size: blob.size,
        info: safe.dropped ? `${ready} ${t.charsetNote}` : ready,
      });
    } catch (err) {
      if (stale()) return;
      setError(err instanceof CdnLoadError ? t.cdnError : t.processError);
    } finally {
      if (!stale()) setBusy(false);
    }
  }

  function onFile(next: File | null) {
    if (!next) return;
    setFile(next);
    void convert(next, pageSize, fontSize);
  }

  function onPageSize(next: PageSize) {
    setPageSize(next);
    if (file) void convert(file, next, fontSize);
  }

  function onFontSize(next: FontSize) {
    setFontSize(next);
    if (file) void convert(file, pageSize, next);
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <p className="text-sm text-muted">{t.intro}</p>
      <p className="text-xs text-muted">{t.note}</p>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t.pageSize}>
          <KitSelect
            value={pageSize}
            disabled={busy}
            onChange={(e) => onPageSize(e.target.value as PageSize)}
          >
            <option value="a4">{t.pageA4}</option>
            <option value="letter">{t.pageLetter}</option>
          </KitSelect>
        </Field>
        <Field label={t.fontSize}>
          <KitSelect
            value={String(fontSize)}
            disabled={busy}
            onChange={(e) => onFontSize(Number(e.target.value) as FontSize)}
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} pt
              </option>
            ))}
          </KitSelect>
        </Field>
      </div>

      <Field label={t.pickFile}>
        <input
          type="file"
          accept=".docx,.txt,.md,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className={fileInputClass}
          onChange={(e) => {
            const picked = e.target.files?.[0] ?? null;
            e.target.value = "";
            onFile(picked);
          }}
          disabled={busy}
        />
      </Field>

      {busy ? (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-muted"
        >
          <Spinner />
          {t.working}
        </p>
      ) : null}

      {error ? <ErrorBanner>{error}</ErrorBanner> : null}

      {result ? (
        <div className="space-y-3 rounded-[12px] border border-border bg-surface p-4">
          <p className="text-sm font-medium text-foreground">{t.resultTitle}</p>
          <p className="truncate text-sm text-muted">
            {result.filename} · {formatBytes(result.size)}
          </p>
          <p className="text-sm text-muted">{result.info}</p>
          <button
            type="button"
            onClick={() => downloadBlob(result.blob, result.filename)}
            className={primaryBtnClass}
          >
            {t.download}
          </button>
        </div>
      ) : null}
    </div>
  );
}
