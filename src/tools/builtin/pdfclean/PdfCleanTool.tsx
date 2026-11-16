"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";

/** Clean text typically copied from PDF: soft wraps, hyphen breaks, extra spaces. */
export function cleanPdfText(input: string): string {
  let text = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // Join hyphenated line breaks: "exam-\nple" → "example"
  text = text.replace(/(\S)-\n(\S)/g, "$1$2");
  // Single newlines inside paragraphs become spaces; keep blank lines as breaks.
  text = text.replace(/([^\n])\n(?!\n)/g, "$1 ");
  text = text.replace(/[ \t\f\v]+/g, " ");
  text = text.replace(/ *\n */g, "\n");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

export function PdfCleanTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.pdfcleanTool;
  const [input, setInput] = useState(() => prefill?.value ?? "");
  const output = useMemo(() => (input ? cleanPdfText(input) : ""), [input]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-muted">{t.intro}</p>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.input}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[15px]"
          placeholder={t.placeholder}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
          <span>{t.output}</span>
          {output ? (
            <CopyButton value={output} label={t.copy} copiedLabel={t.copied} />
          ) : null}
        </span>
        <textarea
          readOnly
          value={output}
          rows={10}
          className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-base outline-none sm:text-[15px]"
        />
      </label>
    </div>
  );
}
