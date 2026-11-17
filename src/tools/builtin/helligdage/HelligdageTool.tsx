"use client";

import { useMemo, useState } from "react";
import { Field, KitInput } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { danishHolidays, nextHoliday } from "./calc";

export function HelligdageTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(String(thisYear));

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
        {holidays.map((h) => (
          <li
            key={h.date + h.nameEn}
            className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
          >
            <span className="font-medium">{da ? h.nameDa : h.nameEn}</span>
            <span className="shrink-0 text-muted">{h.date}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">
        {da
          ? "Danske helligdage inkl. bevægelige dage ud fra påske. Store bededag er fjernet fra 2024."
          : "Danish public holidays including movable dates from Easter. Great Prayer Day ends after 2023."}
      </p>
    </div>
  );
}
