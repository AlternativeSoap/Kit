"use client";

import { useMemo, useState } from "react";
import { Field, KitInput, secondaryBtnClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  addDaysIso,
  countWeekdays,
  danishHolidays,
  eachDay,
  suggestBridgeSpans,
  type BridgeSpan,
} from "./calc";

function money(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function FerieplanTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(String(thisYear));
  const [vacation, setVacation] = useState<Set<string>>(new Set());
  const [travel, setTravel] = useState("");
  const [stay, setStay] = useState("");
  const [food, setFood] = useState("");

  const yearN = Number(year);
  const holidays = useMemo(() => {
    if (!Number.isFinite(yearN) || yearN < 1970 || yearN > 2100) return [];
    return danishHolidays(yearN);
  }, [yearN]);

  const holidaySet = useMemo(
    () => new Set(holidays.map((h) => h.date)),
    [holidays],
  );

  const bridges = useMemo(
    () => suggestBridgeSpans(yearN, holidays),
    [yearN, holidays],
  );

  const vacationList = useMemo(
    () => Array.from(vacation).sort(),
    [vacation],
  );
  const weekdaysUsed = useMemo(
    () => countWeekdays(vacationList),
    [vacationList],
  );

  const budgetTotal = useMemo(() => {
    const t = Number(travel) || 0;
    const s = Number(stay) || 0;
    const f = Number(food) || 0;
    return t + s + f;
  }, [travel, stay, food]);

  function toggleDay(date: string) {
    setVacation((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  function applyBridge(span: BridgeSpan) {
    setVacation((prev) => {
      const next = new Set(prev);
      for (const d of span.vacationNeeded) next.add(d);
      return next;
    });
  }

  function clearVacation() {
    setVacation(new Set());
  }

  const monthLabels = da
    ? [
        "jan",
        "feb",
        "mar",
        "apr",
        "maj",
        "jun",
        "jul",
        "aug",
        "sep",
        "okt",
        "nov",
        "dec",
      ]
    : [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

  // Clickable chips: holidays ±3 days, plus marked vacation and bridge spans.
  const highlightDays = useMemo(() => {
    const set = new Set<string>();
    for (const h of holidays) {
      for (const d of eachDay(addDaysIso(h.date, -3), addDaysIso(h.date, 3))) {
        set.add(d);
      }
    }
    for (const d of vacationList) set.add(d);
    for (const b of bridges) {
      for (const d of b.vacationNeeded) set.add(d);
      for (const d of eachDay(b.start, b.end)) set.add(d);
    }
    return Array.from(set).sort();
  }, [holidays, vacationList, bridges]);

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm text-muted">
        {da
          ? "Planlæg ferie omkring danske helligdage. Find brodage, markér feriedage og læg et enkelt budget."
          : "Plan leave around Danish public holidays. Find bridge days, mark vacation days, and sketch a simple budget."}
      </p>

      <Field label={da ? "År" : "Year"}>
        <KitInput
          type="number"
          min={1970}
          max={2100}
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setVacation(new Set());
          }}
        />
      </Field>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">
          {da ? "Helligdage" : "Public holidays"}
        </h2>
        <ul className="divide-y divide-border rounded-[12px] border border-border bg-surface">
          {holidays.map((h) => (
            <li
              key={h.date + h.nameEn}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <span className="font-medium">
                {da ? h.nameDa : h.nameEn}
              </span>
              <span className="shrink-0 text-muted">{h.date}</span>
            </li>
          ))}
          {holidays.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">
              {da ? "Ugyldigt år." : "Invalid year."}
            </li>
          ) : null}
        </ul>
      </section>

      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-foreground">
            {da ? "Foreslåede brodage" : "Suggested bridge days"}
          </h2>
          {vacation.size > 0 ? (
            <button
              type="button"
              className={secondaryBtnClass}
              onClick={clearVacation}
            >
              {da ? "Ryd feriedage" : "Clear vacation days"}
            </button>
          ) : null}
        </div>
        <ul className="space-y-2">
          {bridges.map((b) => (
            <li
              key={b.id}
              className="rounded-[12px] border border-border bg-surface px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {da ? b.labelDa : b.labelEn}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {b.start} → {b.end}
                    {b.weekdaysUsed > 0
                      ? da
                        ? ` · ${b.weekdaysUsed} feriedag`
                        : ` · ${b.weekdaysUsed} leave day`
                      : da
                        ? " · ingen feriedag nødvendig"
                        : " · no leave day needed"}
                  </p>
                </div>
                {b.vacationNeeded.length > 0 ? (
                  <button
                    type="button"
                    className={secondaryBtnClass}
                    onClick={() => applyBridge(b)}
                  >
                    {da ? "Tilføj feriedag" : "Add leave day"}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
          {bridges.length === 0 ? (
            <li className="text-sm text-muted">
              {da
                ? "Ingen oplagte brodage for dette år."
                : "No obvious bridge days for this year."}
            </li>
          ) : null}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">
          {da ? "Markér feriedage" : "Mark vacation days"}
        </h2>
        <p className="text-xs text-muted">
          {da
            ? "Klik dage omkring helligdage for at markere dem som ferie. Weekender tæller ikke som feriedage."
            : "Click days around holidays to mark them as leave. Weekends do not count as leave days."}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {highlightDays.map((d) => {
            const isHol = holidaySet.has(d);
            const isVac = vacation.has(d);
            const [, m, day] = d.split("-");
            const label = `${Number(day)}. ${monthLabels[Number(m) - 1]}`;
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                disabled={isHol}
                title={d}
                className={`kit-touch-target rounded-[8px] border px-2.5 py-1.5 text-xs sm:min-h-0 ${
                  isHol
                    ? "cursor-default border-border bg-overlay text-muted"
                    : isVac
                      ? "border-accent bg-accent-soft text-foreground"
                      : "border-border bg-surface text-foreground hover:bg-overlay"
                }`}
              >
                {label}
                {isHol ? (da ? " · helligdag" : " · holiday") : null}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-foreground">
          {da
            ? `Valgte feriedage: ${vacationList.length} · heraf hverdage: ${weekdaysUsed}`
            : `Selected leave days: ${vacationList.length} · weekdays used: ${weekdaysUsed}`}
        </p>
      </section>

      <section className="space-y-3 rounded-[12px] border border-border bg-surface p-4">
        <h2 className="text-sm font-medium text-foreground">
          {da ? "Enkel budgetskitse" : "Simple budget sketch"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={da ? "Transport" : "Travel"}>
            <KitInput
              type="number"
              min={0}
              inputMode="decimal"
              value={travel}
              onChange={(e) => setTravel(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label={da ? "Ophold" : "Stay"}>
            <KitInput
              type="number"
              min={0}
              inputMode="decimal"
              value={stay}
              onChange={(e) => setStay(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label={da ? "Mad" : "Food"}>
            <KitInput
              type="number"
              min={0}
              inputMode="decimal"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="0"
            />
          </Field>
        </div>
        <p className="text-sm font-medium text-foreground">
          {da ? "I alt" : "Total"}: {money(budgetTotal)}
        </p>
      </section>

      <p className="text-xs text-muted">
        {da
          ? "Estimater kun. Helligdage, arbejdsregler og priser kan afvige. Tjek din overenskomst og aktuelle billet-/overnatningspriser."
          : "Estimates only. Holidays, workplace rules, and prices can differ. Check your contract and current ticket or lodging prices."}
      </p>
    </div>
  );
}
