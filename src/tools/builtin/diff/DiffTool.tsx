"use client";

import { useMemo, useState } from "react";
import { useDictionary } from "@/i18n/LanguageProvider";
import { diffLines, diffSummary } from "./calc";

const ROW_CLASS: Record<string, string> = {
  same: "bg-transparent text-foreground",
  add: "bg-emerald-500/12 text-emerald-900 dark:text-emerald-100",
  remove: "bg-red-500/12 text-red-900 dark:text-red-100",
};

const PREFIX: Record<string, string> = {
  same: " ",
  add: "+",
  remove: "-",
};

export function DiffTool() {
  const dictionary = useDictionary();
  const t = dictionary.diff;

  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");

  const lines = useMemo(() => diffLines(textA, textB), [textA, textB]);
  const summary = useMemo(() => diffSummary(lines), [lines]);
  const hasInput = textA.length > 0 || textB.length > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.textA}</span>
        <textarea
          value={textA}
          onChange={(event) => setTextA(event.target.value)}
          rows={10}
          spellCheck={false}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[14px]"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.textB}</span>
        <textarea
          value={textB}
          onChange={(event) => setTextB(event.target.value)}
          rows={10}
          spellCheck={false}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[14px]"
        />
      </label>

      <div className="lg:col-span-2">
        {hasInput ? (
          <div className="rounded-[12px] border border-border bg-surface">
            <p className="border-b border-border px-4 py-2 text-xs text-muted">
              {t.summary
                .replace("{added}", String(summary.added))
                .replace("{removed}", String(summary.removed))
                .replace("{same}", String(summary.unchanged))}
            </p>
            <pre className="max-h-[min(28rem,60dvh)] overflow-auto whitespace-pre-wrap break-all p-3 font-mono text-[13px] leading-relaxed">
              {lines.map((line, index) => (
                <div
                  key={`${line.kind}-${index}`}
                  className={`rounded-[4px] px-2 ${ROW_CLASS[line.kind]}`}
                >
                  <span className="select-none opacity-60">{PREFIX[line.kind]} </span>
                  {line.text || " "}
                </div>
              ))}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}