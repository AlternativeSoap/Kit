"use client";

import { useMemo, useState } from "react";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import {
  buildMonthGrid,
  endDateFromWeeks,
  endsMidWeek,
  formatDisplayDate,
  formatWeekdayShort,
  isInRange,
  monthsSpanned,
  parseDateInput,
  sameDay,
  startsMidWeek,
  toInputValue,
  totalDaysFromWeeks,
} from "./calc";

const PRESETS = [2, 10, 14, 24, 32, 48] as const;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function BarselTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.barsel;

  const [startInput, setStartInput] = useState(() => {
    const raw = prefill?.start;
    if (raw && DATE_RE.test(raw) && parseDateInput(raw)) return raw;
    return toInputValue(new Date());
  });
  const [weeks, setWeeks] = useState(
    () => prefillNumber(prefill, "weeks", { min: 0, max: 104, integer: true }) ?? "32",
  );

  const start = parseDateInput(startInput);
  const weekCount = Math.max(0, Math.floor(Number(weeks) || 0));
  const end = start ? endDateFromWeeks(start, weekCount) : null;
  const totalDays = totalDaysFromWeeks(weekCount);

  const months = useMemo(() => {
    if (!start || !end) return [];
    return monthsSpanned(start, end);
  }, [start, end]);

  const weekdayLabels =
    locale === "da"
      ? ["Uge", "Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"]
      : ["Wk", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const monthTitle = (date: Date) =>
    new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-GB", {
      month: "long",
      year: "numeric",
    }).format(date);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t.start}</span>
            <input
              type="date"
              value={startInput}
              onChange={(event) => setStartInput(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t.weeks}</span>
            <input
              type="number"
              min="0"
              max="104"
              step="1"
              value={weeks}
              onChange={(event) => setWeeks(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
            <span className="mt-1 block text-xs text-muted">{t.weeksHint}</span>
          </label>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setWeeks(String(preset))}
                className={`kit-touch-target rounded-[8px] border px-2.5 py-1.5 text-xs sm:min-h-0 ${
                  weekCount === preset
                    ? "border-accent bg-accent text-on-accent"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {preset} {t.weeksShort}
              </button>
            ))}
          </div>

          <div className="space-y-3 rounded-[12px] border border-border bg-surface px-4 py-4">
            <div>
              <p className="text-xs text-muted">{t.end}</p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {end ? formatDisplayDate(end, locale) : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">{t.duration}</p>
              <p className="mt-1 text-sm font-medium">
                {t.durationValue
                  .replace("{n}", String(weekCount))
                  .replace("{d}", String(totalDays))}
              </p>
            </div>
            {start && end ? (
              <div className="space-y-1 border-t border-border pt-3 text-sm">
                <p className="text-foreground">
                  <span className="text-muted">{t.startsOn} </span>
                  {formatWeekdayShort(start, locale)}
                  {startsMidWeek(start) ? (
                    <span className="ml-1.5 rounded-md bg-accent-soft px-1.5 py-0.5 text-[11px] font-medium text-accent">
                      {t.midWeek}
                    </span>
                  ) : null}
                </p>
                <p className="text-foreground">
                  <span className="text-muted">{t.endsOn} </span>
                  {formatWeekdayShort(end, locale)}
                  {endsMidWeek(end) ? (
                    <span className="ml-1.5 rounded-md bg-accent-soft px-1.5 py-0.5 text-[11px] font-medium text-accent">
                      {t.midWeek}
                    </span>
                  ) : null}
                </p>
              </div>
            ) : null}
          </div>

          <p className="text-xs leading-relaxed text-muted">{t.disclaimer}</p>
        </div>

        <div className="space-y-6">
          {start && end ? (
            months.map((month) => {
              const grid = buildMonthGrid(month);
              return (
                <div
                  key={month.toISOString()}
                  className="overflow-x-auto rounded-[12px] border border-border bg-surface p-3 sm:p-4"
                >
                  <h2 className="mb-3 font-serif text-xl tracking-tight capitalize">
                    {monthTitle(month)}
                  </h2>
                  <div className="grid min-w-[17.5rem] grid-cols-[1.75rem_repeat(7,minmax(0,1fr))] gap-y-1 text-center text-[11px] text-muted sm:grid-cols-[2rem_repeat(7,minmax(0,1fr))]">
                    <div className="py-1" aria-hidden />
                    {weekdayLabels.map((label) => (
                      <div key={label} className="py-1 font-medium">
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 space-y-1">
                    {grid.map((row) => {
                      const inRangeFlags = row.map((cell) =>
                        isInRange(cell.date, start, end),
                      );
                      return (
                        <div
                          key={row[0]!.date.toISOString()}
                          className="grid min-w-[17.5rem] grid-cols-[1.75rem_repeat(7,minmax(0,1fr))] gap-y-1 sm:grid-cols-[2rem_repeat(7,minmax(0,1fr))]"
                        >
                          <div className="flex items-center justify-center text-[11px] font-medium text-muted">
                            {row[0]!.week}
                          </div>
                          {row.map((cell, dayIndex) => {
                            const inRange = inRangeFlags[dayIndex]!;
                            const isStart = sameDay(cell.date, start);
                            const isEnd = sameDay(cell.date, end);
                            const prevIn = dayIndex > 0 && inRangeFlags[dayIndex - 1]!;
                            const nextIn =
                              dayIndex < 6 && inRangeFlags[dayIndex + 1]!;
                            const rangeStart = inRange && !prevIn;
                            const rangeEnd = inRange && !nextIn;

                            let shape = "rounded-md";
                            if (inRange && cell.inMonth) {
                              if (rangeStart && rangeEnd) shape = "rounded-md";
                              else if (rangeStart)
                                shape = "rounded-l-md rounded-r-none";
                              else if (rangeEnd)
                                shape = "rounded-r-md rounded-l-none";
                              else shape = "rounded-none";
                            }

                            return (
                              <div
                                key={cell.date.toISOString()}
                                className={`relative flex h-11 flex-col items-center justify-center text-sm sm:h-10 ${shape} ${
                                  !cell.inMonth
                                    ? "text-muted/40"
                                    : isStart || isEnd
                                      ? "bg-accent font-semibold text-on-accent"
                                      : inRange
                                        ? "bg-accent-soft text-foreground"
                                        : "text-foreground"
                                }`}
                                title={
                                  isStart
                                    ? t.start
                                    : isEnd
                                      ? t.end
                                      : undefined
                                }
                              >
                                <span>{cell.date.getDate()}</span>
                                {isStart || isEnd ? (
                                  <span className="absolute bottom-0.5 text-[8px] font-medium uppercase leading-none tracking-wide opacity-90">
                                    {isStart ? t.markStart : t.markEnd}
                                  </span>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted">{t.empty}</p>
          )}
        </div>
      </div>
    </div>
  );
}
