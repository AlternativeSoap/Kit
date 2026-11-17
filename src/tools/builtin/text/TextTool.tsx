"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass, secondaryBtnClass } from "@/components/tools/ui";
import { useDeferredText } from "@/hooks/useDeferredText";
import { useDictionary } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import {
  findReplace,
  textStats,
  transformText,
  wordFrequency,
  type TextTransform,
} from "./calc";

export function TextTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.text;

  const { text: value, setText: setValue, deferred } = useDeferredText(
    prefill?.value ?? "",
  );
  const [find, setFind] = useState("");
  const [replacement, setReplacement] = useState("");
  const [replaceMessage, setReplaceMessage] = useState<string | null>(null);

  const stats = useMemo(() => textStats(deferred), [deferred]);
  const frequency = useMemo(() => wordFrequency(deferred, 10), [deferred]);

  const actions: { id: TextTransform; label: string }[] = [
    { id: "upper", label: t.upper },
    { id: "lower", label: t.lower },
    { id: "title", label: t.title },
    { id: "trim", label: t.trim },
    { id: "pdfclean", label: t.pdfClean },
    { id: "dedupe", label: t.dedupe },
    { id: "sortLines", label: t.sortLines },
    { id: "reverseChars", label: t.reverseChars },
    { id: "reverseLines", label: t.reverseLines },
    { id: "numberLines", label: t.numberLines },
    { id: "unnumberLines", label: t.unnumberLines },
    { id: "slug", label: t.slug },
    { id: "kebab", label: t.kebab },
    { id: "snake", label: t.snake },
    { id: "camel", label: t.camel },
  ];

  function applyAction(id: TextTransform) {
    setReplaceMessage(null);
    setValue((prev) => transformText(prev, id));
  }

  function applyReplace() {
    if (!find) return;
    const result = findReplace(value, find, replacement);
    if (result.count === 0) {
      setReplaceMessage(t.noMatches);
      return;
    }
    setValue(result.text);
    setReplaceMessage(t.replaced.replace("{n}", String(result.count)));
  }

  const statItems: { label: string; value: string }[] = [
    { label: t.chars, value: String(stats.chars) },
    { label: t.words, value: String(stats.words) },
    { label: t.lines, value: String(stats.lines) },
    {
      label: t.readingTime,
      value: stats.words === 0 ? "—" : `${stats.readingMinutes} ${t.minutes}`,
    },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Field label={t.input}>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={8}
          className={`${fieldClass} text-base sm:text-[15px]`}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm"
          >
            <p className="text-xs text-muted">{item.label}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => applyAction(item.id)}
            className="kit-touch-target inline-flex items-center rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-muted hover:text-foreground sm:min-h-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.findLabel}>
            <input
              value={find}
              onChange={(event) => {
                setFind(event.target.value);
                setReplaceMessage(null);
              }}
              spellCheck={false}
              className={fieldClass}
            />
          </Field>
          <Field label={t.replaceLabel}>
            <input
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
              spellCheck={false}
              className={fieldClass}
            />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!find || !value}
            onClick={applyReplace}
            className={secondaryBtnClass}
          >
            {t.replaceAll}
          </button>
          {replaceMessage ? (
            <span role="status" className="text-sm text-muted">
              {replaceMessage}
            </span>
          ) : null}
        </div>
      </div>

      <section aria-labelledby="text-word-frequency">
        <h2 id="text-word-frequency" className="mb-2 text-sm font-medium">
          {t.wordFrequency}
        </h2>
        {frequency.length === 0 ? (
          <p className="text-sm text-muted">{t.noWords}</p>
        ) : (
          <ol className="divide-y divide-border rounded-[10px] border border-border bg-surface text-sm">
            {frequency.map((item) => (
              <li
                key={item.word}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <span className="min-w-0 truncate">{item.word}</span>
                <span className="tabular-nums text-muted">
                  {t.occurrences.replace("{n}", String(item.count))}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {value.trim() ? (
        <div className="flex justify-end">
          <CopyButton value={value} label={t.copy} copiedLabel={t.copied} />
        </div>
      ) : null}
    </div>
  );
}
