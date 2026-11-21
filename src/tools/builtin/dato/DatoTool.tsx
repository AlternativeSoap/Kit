"use client";

import { useMemo, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { prefillFlag, prefillNumber, type ToolPrefill } from "@/tools/prefill";
import {
  addDays,
  daysBetween,
  formatDisplayDate,
  parseDateInput,
  toInputValue,
} from "./calc";

/** A YYYY-MM-DD value from the URL, if it is a real date. */
function prefillDate(prefill: ToolPrefill | undefined, key: string): string | null {
  const raw = prefill?.[key];
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = parseDateInput(raw);
  return date && toInputValue(date) === raw ? raw : null;
}

export function DatoTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.dato;

  const today = useMemo(() => toInputValue(new Date()), []);
  const [start, setStart] = useState(prefillDate(prefill, "start") ?? today);
  const [end, setEnd] = useState(prefillDate(prefill, "end") ?? today);
  const [offset, setOffset] = useState(
    prefillNumber(prefill, "offset", { integer: true }) ?? "10",
  );
  const [businessOnly, setBusinessOnly] = useState(
    prefillFlag(prefill, "business"),
  );

  const startDate = parseDateInput(start);
  const endDate = parseDateInput(end);
  const offsetN = Number(offset);

  const between =
    startDate && endDate ? daysBetween(startDate, endDate) : null;

  const shifted =
    startDate && Number.isFinite(offsetN)
      ? addDays(startDate, Math.trunc(offsetN), businessOnly)
      : null;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="rounded-[12px] border border-border bg-surface p-5 space-y-4">
          <h2 className="text-sm font-medium">{t.betweenTitle}</h2>
          <label className="block">
            <span className="mb-1.5 block text-sm text-muted">{t.start}</span>
            <input
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-muted">{t.end}</span>
            <input
              type="date"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className={fieldClass}
            />
          </label>
          <p className="text-2xl font-semibold tracking-tight">
            {between !== null
              ? t.daysResult.replace("{n}", String(between))
              : "—"}
          </p>
        </div>
      </div>

      <div className="rounded-[12px] border border-border bg-surface p-5 space-y-4">
        <h2 className="text-sm font-medium">{t.shiftTitle}</h2>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">{t.offset}</span>
          <input
            type="number"
            step="1"
            value={offset}
            onChange={(event) => setOffset(event.target.value)}
            className={fieldClass}
            inputMode="numeric"
          />
        </label>
        <label className="kit-touch-target flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={businessOnly}
            onChange={(event) => setBusinessOnly(event.target.checked)}
            className="h-4 w-4 rounded border-border accent-[var(--accent)]"
          />
          {t.businessOnly}
        </label>
        <p className="text-xs text-muted">{t.businessHint}</p>
        <p className="text-2xl font-semibold tracking-tight">
          {shifted
            ? formatDisplayDate(shifted, locale)
            : "—"}
        </p>
      </div>
    </div>
  );
}
