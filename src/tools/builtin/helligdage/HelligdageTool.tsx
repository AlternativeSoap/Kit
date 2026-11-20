"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, KitInput } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { danishHolidays, nextHoliday } from "./calc";

function yearFromPrefill(prefill?: ToolPrefill, fallback = new Date().getFullYear()): string {
  const fromYear = prefillNumber(prefill, "year", {
    min: 1970,
    max: 2100,
    integer: true,
  });
  return fromYear ?? String(fallback);
}

export function HelligdageTool({ prefill }: { prefill?: ToolPrefill } = {}) {
  const { locale } = useLanguage();
  const da = locale === "da";
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(() => yearFromPrefill(prefill, thisYear));
  const highlight = (prefill?.q ?? "").trim().toLowerCase();

  useEffect(() => {
    setYear(yearFromPrefill(prefill, thisYear));
  }, [prefill, thisYear]);

  const yearN = Number(year);
  const holidays = useMemo(() => {
    if (!Number.isFinite(yearN) || yearN < 1970 || yearN > 2100) return [];
    return danishHolidays(yearN);
  }, [yearN]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = useMemo(() => nextHoliday(today), [today]);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      {upcoming ? (
        <div className="rounded-[12px] border border-border bg-surface px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
            {da ? "Næste helligdag" : "Next holiday"}
          </p>
          <p className="mt-1 text-sm font-medium">
            {da ? upcoming.nameDa : upcoming.nameEn}
          </p>
          <p className="text-xs text-muted">{upcoming.date}</p>
        </div>
      ) : null}

      <Field label={da ? "År" : "Year"}>
        <KitInput
          type="number"
          min={1970}
          max={2100}
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </Field>

      <ul className="divide-y divide-border rounded-[12px] border border-border bg-surface">
        {holidays.map((h) => {
          const active =
            highlight.length >= 3 &&
            (h.nameDa.toLowerCase().includes(highlight) ||
              h.nameEn.toLowerCase().includes(highlight));
          return (
            <li
              key={h.date + h.nameEn}
              className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm ${
                active ? "bg-accent-soft" : ""
              }`}
            >
              <span className="font-medium">{da ? h.nameDa : h.nameEn}</span>
              <span className="shrink-0 text-muted">{h.date}</span>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted">
        {da
          ? "Danske helligdage inkl. bevægelige dage ud fra påske. Store bededag er fjernet fra 2024."
          : "Danish public holidays including movable dates from Easter. Great Prayer Day ends after 2023."}
      </p>
    </div>
  );
}
