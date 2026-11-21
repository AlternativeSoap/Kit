"use client";

import { useMemo, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import { slugify, type SlugStyle } from "./calc";

const STYLES: readonly SlugStyle[] = ["kebab", "snake", "camel", "pascal"];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function SlugTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.slug;

  const [text, setText] = useState(() => prefill?.text ?? prefill?.value ?? "");
  const [style, setStyle] = useState<SlugStyle>(
    prefillChoice(prefill, "style", STYLES) ?? "kebab",
  );

  const result = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return "";
    return slugify(trimmed, style);
  }, [style, text]);

  const styleLabel: Record<SlugStyle, string> = {
    kebab: t.styleKebab,
    snake: t.styleSnake,
    camel: t.styleCamel,
    pascal: t.stylePascal,
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field label={t.input} hint={t.inputHint}>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={6}
            className={fieldClass}
          />
        </Field>
        <Field label={t.style}>
          <select
            value={style}
            onChange={(event) => setStyle(event.target.value as SlugStyle)}
            className={fieldClass}
          >
            {STYLES.map((item) => (
              <option key={item} value={item}>
                {styleLabel[item]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <div className="py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted">{t.output}</p>
                <p className="mt-1 break-all font-mono text-lg font-semibold tracking-tight">
                  {result}
                </p>
              </div>
              <CopyButton
                value={result}
                label={t.copy}
                copiedLabel={t.copied}
              />
            </div>
          </div>
        ) : (
          <p className="py-8 text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}