"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useDictionary } from "@/i18n/LanguageProvider";
import { downloadBlob, formatBytes } from "../media/canvas";

function importFromUrl<T>(url: string): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const dyn = new Function("u", "return import(u)") as (u: string) => Promise<T>;
  return dyn(url);
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

function wrapLines(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r\n/g, "\n").split("\n")) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length <= maxChars) {
        current = next;
      } else {
        if (current) lines.push(current);
        if (word.length > maxChars) {
          for (let i = 0; i < word.length; i += maxChars) {
            lines.push(word.slice(i, i + maxChars));
          }
          current = "";
        } else {
          current = word;
        }
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

async function textToPdf(text: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;
  const lineHeight = 14;
  const margin = 48;
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const maxWidth = pageWidth - margin * 2;
  const approxChars = Math.floor(maxWidth / (fontSize * 0.52));
  const lines = wrapLines(text, Math.max(40, approxChars));

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

export function DocToPdfTool() {
  const dictionary = useDictionary();
  const t = dictionary.doctopdfTool;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onFile(file: File | null) {
    setError(null);
    setInfo(null);
    if (!file) return;
    setBusy(true);
    try {
      const name = file.name.toLowerCase();
      let text = "";
      if (
        name.endsWith(".docx") ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        text = await extractDocxText(file);
      } else if (
        name.endsWith(".txt") ||
        name.endsWith(".md") ||
        file.type.startsWith("text/")
      ) {
        text = await file.text();
      } else {
        setError(t.unsupported);
        return;
      }

      if (!text.trim()) {
        setError(t.empty);
        return;
      }

      const bytes = await textToPdf(text);
      const copy = new Uint8Array(bytes);
      const blob = new Blob([copy.buffer], { type: "application/pdf" });
      const base = file.name.replace(/\.[^.]+$/, "") || "document";
      downloadBlob(blob, `${base}.pdf`);
      setInfo(
        t.ready
          .replace("{from}", formatBytes(file.size))
          .replace("{to}", formatBytes(blob.size)),
      );
    } catch {
      setError(t.processError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <p className="text-sm text-muted">{t.intro}</p>
      <p className="text-xs text-muted">{t.note}</p>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.pickFile}</span>
        <input
          type="file"
          accept=".docx,.txt,.md,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-[8px] file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          disabled={busy}
        />
      </label>
      {busy ? <p className="text-sm text-muted">{t.working}</p> : null}
      {info ? <p className="text-sm font-medium text-foreground">{info}</p> : null}
      {error ? <p className="text-sm text-muted">{error}</p> : null}
    </div>
  );
}
