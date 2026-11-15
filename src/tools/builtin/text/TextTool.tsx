"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { textStats, transformText, type TextTransform } from "./calc";

export function TextTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.text;

  const [value, setValue] = useState(() => prefill?.value ?? "");

  const stats = useMemo(() => textStats(value), [value]);

  const actions: { id: TextTransform; label: string }[] = [
    { id: "upper", label: t.upper },
    { id: "lower", label: t.lower },
    { id: "title", label: t.title },
    { id: "trim", label: t.trim },
    { id: "dedupe", label: t.dedupe },
    { id: "slug", label: t.slug },
    { id: "kebab", label: t.kebab },
    { id: "snake", label: t.snake },
    { id: "camel", label: t.camel },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.input}</span>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={8}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[15px]"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm">
          <p className="text-xs text-muted">{t.chars}</p>
          <p className="text-lg font-semibold">{stats.chars}</p>
        </div>
        <div className="rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm">
          <p className="text-xs text-muted">{t.words}</p>
          <p className="text-lg font-semibold">{stats.words}</p>
        </div>
        <div className="rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm">
          <p className="text-xs text-muted">{t.lines}</p>
          <p className="text-lg font-semibold">{stats.lines}</p>
        </div>
        <div className="rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm">
          <p className="text-xs text-muted">{t.readingTime}</p>
          <p className="text-lg font-semibold">
            {stats.words === 0 ? "—" : `${stats.readingMinutes} ${t.minutes}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setValue((prev) => transformText(prev, item.id))}
            className="kit-touch-target inline-flex items-center rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-muted hover:text-foreground sm:min-h-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {value.trim() ? (
        <div className="flex justify-end">
          <CopyButton value={value} label={t.copy} copiedLabel={t.copied} />
        </div>
      ) : null}
    </div>
  );
}
