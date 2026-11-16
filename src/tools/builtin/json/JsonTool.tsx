"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { lineColumnAt, processJson, type JsonMode } from "./calc";

export function JsonTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.json;

  const [input, setInput] = useState(() => prefill?.value ?? '{\n  \n}');
  const [mode, setMode] = useState<JsonMode>("format");

  const result = useMemo(() => processJson(input, mode), [input, mode]);

  const errorDetail = useMemo(() => {
    if (result.ok || result.position === undefined) return null;
    const loc = lineColumnAt(input, result.position);
    if (!loc) return null;
    return t.errorAt.replace("{line}", String(loc.line)).replace("{column}", String(loc.column));
  }, [input, result, t.errorAt]);

  const modes: { id: JsonMode; label: string }[] = [
    { id: "format", label: t.format },
    { id: "minify", label: t.minify },
    { id: "validate", label: t.validate },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
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
        <span className="mb-1.5 block text-sm font-medium">{t.input}</span>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={10}
          spellCheck={false}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[14px]"
        />
      </label>

      {!result.ok ? (
        <div className="rounded-[12px] border border-border bg-surface px-4 py-3 text-sm text-muted">
          <p className="font-medium text-foreground">{t.invalid}</p>
          <p className="mt-1 break-words">{result.error}</p>
          {errorDetail ? <p className="mt-1">{errorDetail}</p> : null}
        </div>
      ) : mode === "validate" ? (
        <p className="rounded-[12px] border border-border bg-surface px-4 py-3 text-sm text-foreground">
          {t.valid}
        </p>
      ) : (
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
            <span>{t.output}</span>
            {result.output ? (
              <CopyButton value={result.output} label={t.copy} copiedLabel={t.copied} />
            ) : null}
          </span>
          <textarea
            readOnly
            value={result.output}
            rows={10}
            className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 font-mono text-base outline-none sm:text-[14px]"
          />
        </label>
      )}
    </div>
  );
}