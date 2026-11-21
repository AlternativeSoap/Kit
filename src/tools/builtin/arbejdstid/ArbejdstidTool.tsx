"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/tools/CopyButton";
import { fieldClass } from "@/components/tools/ui";
import { formatClock } from "@/lib/answers/clock";
import { useDictionary } from "@/i18n/LanguageProvider";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateArbejdstid, splitHoursMinutes } from "./calc";

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

function clockPrefill(prefill: ToolPrefill | undefined, key: string): string {
  const raw = prefill?.[key];
  if (!raw) return "";
  return /^(\d{1,2})[:.](\d{2})$/.test(raw) ? raw.replace(".", ":") : "";
}

export function ArbejdstidTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.arbejdstid;

  const [start, setStart] = useState(
    clockPrefill(prefill, "start") || "08:00",
  );
  const [end, setEnd] = useState(clockPrefill(prefill, "end") || "16:00");
  const [breakMin, setBreakMin] = useState(
    prefillNumber(prefill, "break", { min: 0, integer: true }) ?? "30",
  );

  const result = useMemo(() => {
    const breakN = Number(breakMin.replace(",", "."));
    return calculateArbejdstid(start, end, breakN);
  }, [start, end, breakMin]);

  const net = result ? splitHoursMinutes(result.netMinutes) : null;
  const copyValue =
    net !== null
      ? `${String(net.hours).padStart(2, "0")}:${String(net.minutes).padStart(2, "0")}`
      : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.start} hint={t.startHint}>
            <input
              type="time"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={t.end} hint={t.endHint}>
            <input
              type="time"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>
        <Field label={t.break} hint={t.breakHint}>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="5"
            value={breakMin}
            onChange={(event) => setBreakMin(event.target.value)}
            className={fieldClass}
          />
        </Field>
        <p className="text-sm text-muted">
          {t.relatedNote}{" "}
          <Link
            href="/t/dato"
            className="kit-touch-target inline-flex items-center text-accent hover:underline"
          >
            {t.relatedDato}
          </Link>
          {", "}
          <Link
            href="/t/stopur"
            className="kit-touch-target inline-flex items-center text-accent hover:underline"
          >
            {t.relatedStopur}
          </Link>
        </p>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result && net ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t.netTime}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {t.hoursMinutes
                      .replace("{h}", String(net.hours))
                      .replace("{m}", String(net.minutes))}
                  </p>
                </div>
                <CopyButton
                  value={copyValue}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.grossTime}</dt>
                <dd className="font-medium">
                  {t.hoursMinutes
                    .replace(
                      "{h}",
                      String(splitHoursMinutes(result.grossMinutes).hours),
                    )
                    .replace(
                      "{m}",
                      String(splitHoursMinutes(result.grossMinutes).minutes),
                    )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.span}</dt>
                <dd className="font-medium">
                  {formatClock(result.startMinutes)} –{" "}
                  {formatClock(result.endMinutes)}
                </dd>
              </div>
            </dl>
            {result.grossMinutes < Number(breakMin) ? (
              <p className="pb-3 text-xs text-amber-700 dark:text-amber-400">
                {t.breakTooLong}
              </p>
            ) : null}
          </>
        ) : (
          <p className="py-8 text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}