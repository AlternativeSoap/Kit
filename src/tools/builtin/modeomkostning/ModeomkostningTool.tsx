"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass, Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import {
  calculateMeetingCost,
  type RateMode,
} from "./calc";

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function ModeomkostningTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [attendees, setAttendees] = useState("6");
  const [rateMode, setRateMode] = useState<RateMode>("average");
  const [hourlyRate, setHourlyRate] = useState("450");
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("0");
  const [prepMinutes, setPrepMinutes] = useState("15");
  const [weeklyMeetings, setWeeklyMeetings] = useState("1");

  const result = useMemo(() => {
    const attendeesN = parseField(attendees);
    const rateN = parseField(hourlyRate);
    const hoursN = parseField(hours);
    const minutesN = parseField(minutes);
    const prepN = parseField(prepMinutes);
    const weeklyN = parseField(weeklyMeetings);
    if (
      attendeesN === undefined ||
      rateN === undefined ||
      hoursN === undefined ||
      minutesN === undefined ||
      prepN === undefined ||
      weeklyN === undefined
    ) {
      return null;
    }
    return calculateMeetingCost({
      attendees: attendeesN,
      hourlyRate: rateN,
      rateMode,
      hours: hoursN,
      minutes: minutesN,
      prepMinutes: prepN,
      weeklyMeetings: weeklyN,
    });
  }, [
    attendees,
    hourlyRate,
    rateMode,
    hours,
    minutes,
    prepMinutes,
    weeklyMeetings,
  ]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field
          label={da ? "Deltagere" : "Attendees"}
          hint={da ? "Antal personer i mødet" : "Number of people in the meeting"}
        >
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            className={fieldClass}
          />
        </Field>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Timeløn" : "Hourly rate"}
          </p>
          <Segmented
            value={rateMode}
            onChange={setRateMode}
            ariaLabel={da ? "Timelønstype" : "Rate type"}
            options={[
              {
                id: "average",
                label: da ? "Gennemsnit pr. person" : "Average per person",
              },
              {
                id: "total",
                label: da ? "Samlet for alle" : "Total for all",
              },
            ]}
          />
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className={fieldClass}
          />
          <p className="text-xs text-muted">
            {rateMode === "average"
              ? da
                ? "Gennemsnitlig timepris pr. deltager i DKK."
                : "Average hourly cost per attendee in DKK."
              : da
                ? "Samlet timepris for hele gruppen i DKK."
                : "Combined hourly cost for the whole group in DKK."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={da ? "Timer" : "Hours"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={da ? "Minutter" : "Minutes"}>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <Field
          label={da ? "Forberedelsestid (min)" : "Prep time (min)"}
          hint={
            da
              ? "Valgfrit. Lægges til mødetiden for alle deltagere."
              : "Optional. Added to meeting time for all attendees."
          }
        >
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="5"
            value={prepMinutes}
            onChange={(e) => setPrepMinutes(e.target.value)}
            className={fieldClass}
          />
        </Field>

        <Field
          label={da ? "Møder pr. uge" : "Meetings per week"}
          hint={
            da
              ? "Sæt til 0 hvis du ikke vil se årlig omkostning."
              : "Set to 0 to skip the yearly estimate."
          }
        >
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={weeklyMeetings}
            onChange={(e) => setWeeklyMeetings(e.target.value)}
            className={fieldClass}
          />
        </Field>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">
                    {da ? "Samlet omkostning" : "Total cost"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatKr(result.totalCost, locale, 0)}
                  </p>
                </div>
                <CopyButton
                  value={formatNumber(result.totalCost, locale, 2)}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Varighed" : "Duration"}
                </dt>
                <dd className="font-medium">
                  {formatNumber(result.durationMinutes, locale, 0)}{" "}
                  {da ? "min" : "min"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Timepris i alt" : "Total hourly rate"}
                </dt>
                <dd className="font-medium">
                  {formatKr(result.totalHourlyCost, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Pris pr. minut" : "Cost per minute"}
                </dt>
                <dd className="font-medium">
                  {formatKr(result.costPerMinute, locale, 2)}
                </dd>
              </div>
              {result.yearlyCost !== null ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Årlig (52 uger)" : "Yearly (52 weeks)"}
                  </dt>
                  <dd className="font-medium">
                    {formatKr(result.yearlyCost, locale, 0)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Udfyld felterne for at se mødeomkostningen."
              : "Fill in the fields to see the meeting cost."}
          </p>
        )}
      </div>
    </div>
  );
}
