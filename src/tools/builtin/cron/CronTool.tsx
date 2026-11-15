"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { type ToolPrefill } from "@/tools/prefill";
import { explainCron } from "./calc";

const EXAMPLES = [
  "0 * * * *",
  "0 0 * * *",
  "0 9 * * 1",
  "@daily",
  "@hourly",
] as const;

export function CronTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.cron;

  const [expression, setExpression] = useState(
    () => prefill?.expression ?? "0 9 * * *",
  );

  const explained = useMemo(() => explainCron(expression), [expression]);

  const summary =
  locale === "da" ? explained.summaryDa : explained.summaryEn;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t.expression}</span>
          <input
            type="text"
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
            spellCheck={false}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
          <span className="mt-1 block text-xs text-muted">{t.expressionHint}</span>
        </label>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => setExpression(sample)}
              className="rounded-[10px] border border-border bg-surface px-3 py-1.5 font-mono text-xs text-muted hover:text-foreground"
            >
              {sample}
            </button>
          ))}
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted">{t.fieldMinute}</dt>
          <dd className="font-mono">{t.fieldMinuteDesc}</dd>
          <dt className="text-muted">{t.fieldHour}</dt>
          <dd className="font-mono">{t.fieldHourDesc}</dd>
          <dt className="text-muted">{t.fieldDom}</dt>
          <dd className="font-mono">{t.fieldDomDesc}</dd>
          <dt className="text-muted">{t.fieldMonth}</dt>
          <dd className="font-mono">{t.fieldMonthDesc}</dd>
          <dt className="text-muted">{t.fieldDow}</dt>
          <dd className="font-mono">{t.fieldDowDesc}</dd>
        </dl>

        <p className="text-sm text-muted">
          {t.relatedNote}{" "}
          <Link href="/t/timestamp" className="text-accent hover:underline">
            {t.relatedTimestamp}
          </Link>
        </p>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-4">
        {explained.valid ? (
          <div className="space-y-4">
            {explained.expanded !== explained.expression ? (
              <p className="text-sm text-muted">
                {t.expanded}:{" "}
                <span className="font-mono text-foreground">
                  {explained.expanded}
                </span>
              </p>
            ) : null}
            <p className="text-[15px] leading-relaxed">{summary}</p>
            <dl className="grid grid-cols-3 gap-3 border-t border-border pt-4 text-center text-xs sm:grid-cols-5 sm:gap-2">
              {explained.fields.map((field, index) => (
                <div key={index} className="min-w-0">
                  <dt className="text-muted">
                    {[
                      t.fieldMinuteShort,
                      t.fieldHourShort,
                      t.fieldDomShort,
                      t.fieldMonthShort,
                      t.fieldDowShort,
                    ][index]}
                  </dt>
                  <dd className="mt-1 break-all font-mono text-sm">{field}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <p className="text-sm text-muted">
            {explained.error === "fields" ? t.invalidFields : t.empty}
          </p>
        )}
      </div>
    </div>
  );
}