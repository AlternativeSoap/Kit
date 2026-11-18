"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import { calculateTermin, type TerminInputMode } from "./calc";

const MODES: readonly TerminInputMode[] = ["lmp", "due"];

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

function formatDisplayDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function TerminTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.termin;

  const [mode, setMode] = useState<TerminInputMode>(
    prefillChoice(prefill, "mode", MODES) ?? "lmp",
  );
  const [date, setDate] = useState(
    prefill?.date ?? prefill?.lmp ?? prefill?.due ?? "",
  );

  const today = useMemo(() => new Date(), []);

  const result = useMemo(
    () => (date ? calculateTermin(mode, date, today) : null),
    [date, mode, today],
  );

  const weekLabel = result
    ? t.weekLabel
        .replace("{week}", String(result.pregnancyWeek))
        .replace("{day}", String(result.pregnancyDayOfWeek))
    : "";

  const trimesterLabel =
    result?.trimester === 1
      ? t.trimester1
      : result?.trimester === 2
        ? t.trimester2
        : t.trimester3;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="inline-flex rounded-[10px] border border-border bg-surface p-1">
          {MODES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`kit-touch-target rounded-[8px] px-3 py-1.5 text-sm transition-colors sm:min-h-0 ${
                mode === item
                  ? "bg-accent text-on-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {item === "lmp" ? t.modeLmp : t.modeDue}
            </button>
          ))}
        </div>

        <Field
          label={mode === "lmp" ? t.lmp : t.dueDate}
          hint={mode === "lmp" ? t.lmpHint : t.dueHint}
        >
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </Field>

        <p className="text-sm text-muted">
          {t.relatedNote}{" "}
          <Link href="/t/barsel" className="text-accent hover:underline">
            {t.relatedBarsel}
          </Link>
          {", "}
          <Link href="/t/dato" className="text-accent hover:underline">
            {t.relatedDato}
          </Link>
        </p>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t.currentWeek}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {weekLabel}
                  </p>
                </div>
                <CopyButton
                  value={weekLabel}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.trimester}</dt>
                <dd className="font-medium">{trimesterLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.dueDate}</dt>
                <dd className="text-right font-medium">
                  {formatDisplayDate(result.due, locale)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.lmp}</dt>
                <dd className="text-right font-medium">
                  {formatDisplayDate(result.lmp, locale)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.daysRemaining}</dt>
                <dd className="font-medium">
                  {result.daysRemaining >= 0
                    ? t.daysCount.replace("{n}", String(result.daysRemaining))
                    : t.pastDue}
                </dd>
              </div>
            </dl>
            <p className="pb-3 text-xs text-muted">{t.disclaimer}</p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}