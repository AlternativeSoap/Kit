"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { textStats } from "../text/calc";

function importFromUrl<T>(url: string): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const dyn = new Function("u", "return import(u)") as (u: string) => Promise<T>;
  return dyn(url);
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await importFromUrl<{
    getDocument: (src: { data: ArrayBuffer }) => {
      promise: Promise<{
        numPages: number;
        getPage: (n: number) => Promise<{
          getTextContent: () => Promise<{ items: { str?: string }[] }>;
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
    parts.push(content.items.map((item) => item.str ?? "").join(" "));
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
  const [text, setText] = useState(() => prefill?.value ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const stats = useMemo(() => textStats(text), [text]);
  const charsNoSpaces = useMemo(
    () => text.replace(/\s/g, "").length,
    [text],
  );

  async function onFile(file: File | null) {
    setError(null);
    setFileName(null);
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
      setText(next);
      setFileName(file.name);
    } catch {
      setError(t.loadError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-muted">{t.intro}</p>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.pickFile}</span>
        <input
          type="file"
          accept=".pdf,.docx,.txt,.md,application/pdf,text/plain"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-[8px] file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
        />
        {fileName ? (
          <span className="mt-1 block text-xs text-muted">{fileName}</span>
        ) : null}
      </label>

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
          rows={12}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[15px]"
        />
      </label>

      {busy ? <p className="text-sm text-muted">{t.working}</p> : null}
      {error ? <p className="text-sm text-muted">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t.chars} value={stats.chars} />
        <Stat label={t.charsNoSpaces} value={charsNoSpaces} />
        <Stat label={t.words} value={stats.words} />
        <Stat label={t.lines} value={stats.lines} />
      </div>
      <p className="text-sm text-muted">
        {t.readingTime}:{" "}
        {stats.words === 0 ? "—" : `${stats.readingMinutes} ${t.minutes}`}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
