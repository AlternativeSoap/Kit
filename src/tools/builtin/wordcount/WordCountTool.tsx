"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { ErrorBanner, FileInput, fieldClass } from "@/components/tools/ui";
import { useDeferredText } from "@/hooks/useDeferredText";
import { importFromUrl } from "@/lib/cdnImport";
import { useDictionary } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { textStats } from "../text/calc";

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await importFromUrl<{
    getDocument: (src: { data: ArrayBuffer }) => {
      promise: Promise<{
        numPages: number;
        getPage: (n: number) => Promise<{
          getTextContent: () => Promise<{
            items: { str?: string; hasEOL?: boolean }[];
          }>;
        }>;
      }>;
    };
    GlobalWorkerOptions: { workerSrc: string };
  }>("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => `${item.str ?? ""}${item.hasEOL ? "\n" : " "}`)
      .join("")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
    if (pageText) parts.push(pageText);
  }
  return parts.join("\n\n");
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await importFromUrl<{
    extractRawText: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
  }>("https://cdn.jsdelivr.net/npm/mammoth@1.8.0/+esm");
  const result = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer(),
  });
  return result.value;
}

export function WordCountTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.wordcountTool;
  const { text, setText, deferred } = useDeferredText(prefill?.value ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const stats = useMemo(() => textStats(deferred), [deferred]);
  const charsNoSpaces = useMemo(
    () => deferred.replace(/\s/g, "").length,
    [deferred],
  );

  const summary = t.statsSummary
    .replace("{chars}", String(stats.chars))
    .replace("{words}", String(stats.words))
    .replace("{lines}", String(stats.lines));

  async function onFile(file: File | null) {
    setError(null);
    if (!file) return;
    setBusy(true);
    try {
      const name = file.name.toLowerCase();
      let next = "";
      if (name.endsWith(".pdf") || file.type === "application/pdf") {
        next = await extractPdfText(file);
      } else if (
        name.endsWith(".docx") ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        next = await extractDocxText(file);
      } else if (
        name.endsWith(".txt") ||
        name.endsWith(".md") ||
        file.type.startsWith("text/")
      ) {
        next = await file.text();
      } else {
        setError(t.unsupported);
        return;
      }
      if (!next.trim()) {
        setError(t.emptyFile);
        return;
      }
      if (text.trim() && !window.confirm(t.confirmReplace)) return;
      setText(next);
      setFileName(file.name);
    } catch {
      setError(t.loadError);
    } finally {
      setBusy(false);
    }
  }

  const statItems: { label: string; value: string }[] = [
    { label: t.chars, value: String(stats.chars) },
    { label: t.charsNoSpaces, value: String(charsNoSpaces) },
    { label: t.words, value: String(stats.words) },
    { label: t.lines, value: String(stats.lines) },
    { label: t.sentences, value: String(stats.sentences) },
    { label: t.paragraphs, value: String(stats.paragraphs) },
    {
      label: t.readingTime,
      value: stats.words === 0 ? "—" : `${stats.readingMinutes} ${t.minutes}`,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-muted">{t.intro}</p>

      <div>
        <FileInput
          label={t.pickFile}
          accept=".pdf,.docx,.txt,.md,application/pdf,text/plain"
          disabled={busy}
          onFile={(file) => void onFile(file)}
        />
        {fileName ? (
          <span className="mt-1 block text-xs text-muted">{fileName}</span>
        ) : null}
      </div>

      <label className="block">
        <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
          <span>{t.text}</span>
          {text ? (
            <CopyButton value={text} label={t.copy} copiedLabel={t.copied} />
          ) : null}
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
          rows={12}
          className={`${fieldClass} disabled:opacity-60`}
        />
      </label>

      {busy ? <p className="text-sm text-muted">{t.working}</p> : null}
      <ErrorBanner>{error}</ErrorBanner>

      <div className="space-y-2">
        <dl className="flex flex-wrap gap-x-5 gap-y-2 rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm">
          {statItems.map((item) => (
            <div key={item.label} className="flex items-baseline gap-1.5">
              <dt className="text-xs text-muted">{item.label}</dt>
              <dd className="font-semibold tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex justify-end">
          <CopyButton
            value={summary}
            label={t.copyStats}
            copiedLabel={t.statsCopied}
          />
        </div>
      </div>
    </div>
  );
}
