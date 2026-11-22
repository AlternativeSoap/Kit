"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import {
  calculateCycle,
  dateFromIso,
  formatCycleDate,
  type CycleKeyDate,
} from "./calc";

function defaultLmp(): string {
  const d = new Date();
  d.setDate(d.getDate() - 14);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function kindLabel(kind: CycleKeyDate["kind"], da: boolean): string {
  switch (kind) {
    case "period":
      return da ? "Menstruation start" : "Period start";
    case "fertile_start":
      return da ? "Fertil start" : "Fertile start";
    case "ovulation":
      return da ? "Ægløsning" : "Ovulation";
    case "fertile_end":
      return da ? "Fertil slut" : "Fertile end";
    case "next_period":
      return da ? "Næste menstruation" : "Next period";
    default:
      return kind;
  }
}

export function AeglosningTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [lmp, setLmp] = useState(
    prefill?.lmp ?? prefill?.date ?? defaultLmp(),
  );
  const [cycleLength, setCycleLength] = useState(
    prefillNumber(prefill, "cycle", { min: 20, max: 45, integer: true }) ??
      "28",
  );
  const [luteal, setLuteal] = useState(
    prefillNumber(prefill, "luteal", { min: 10, max: 16, integer: true }) ??
      "14",
  );

  const result = useMemo(() => {
    const cycleN = Number(cycleLength.replace(",", "."));
    const lutealN = Number(luteal.replace(",", "."));
    if (!Number.isInteger(cycleN) || !Number.isInteger(lutealN)) return null;
    return calculateCycle({
      lmpIso: lmp,
      cycleLength: cycleN,
      lutealLength: lutealN,
    });
  }, [lmp, cycleLength, luteal]);

  const summaryCopy = result
    ? da
      ? `Ægløsning ${formatCycleDate(result.ovulation, locale)}, fertil ${formatCycleDate(result.fertileStart, locale)} – ${formatCycleDate(result.fertileEnd, locale)}, næste menstruation ${formatCycleDate(result.nextPeriod, locale)}`
      : `Ovulation ${formatCycleDate(result.ovulation, locale)}, fertile ${formatCycleDate(result.fertileStart, locale)} – ${formatCycleDate(result.fertileEnd, locale)}, next period ${formatCycleDate(result.nextPeriod, locale)}`
    : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field
          label={da ? "Sidste menstruation start" : "Last period start"}
          hint={da ? "Første blødningsdag" : "First day of bleeding"}
        >
          <input
            type="date"
            value={lmp}
            onChange={(e) => setLmp(e.target.value)}
            className={fieldClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={da ? "Cykluslængde (dage)" : "Cycle length (days)"}
            hint={da ? "Standard 28" : "Default 28"}
          >
            <input
              type="number"
              inputMode="numeric"
              min="20"
              max="45"
              step="1"
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={da ? "Lutealfase (dage)" : "Luteal length (days)"}
            hint={da ? "Standard 14" : "Default 14"}
          >
            <input
              type="number"
              inputMode="numeric"
              min="10"
              max="16"
              step="1"
              value={luteal}
              onChange={(e) => setLuteal(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>
        <p className="rounded-[10px] border border-border bg-surface px-3 py-2 text-xs text-muted">
          {da
            ? "Dette er et estimat baseret på gennemsnitlige cyklusser, ikke medicinsk rådgivning. Brug det ikke som prævention eller diagnose. Tal med en læge ved spørgsmål om fertilitet eller helbred."
            : "This is an estimate based on average cycles, not medical advice. Do not use it as contraception or diagnosis. Talk to a clinician about fertility or health questions."}
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
          {result ? (
            <>
              <div className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted">
                      {da ? "Estimeret ægløsning" : "Estimated ovulation"}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      {formatCycleDate(result.ovulation, locale)}
                    </p>
                  </div>
                  <CopyButton
                    value={summaryCopy}
                    label={da ? "Kopiér" : "Copy"}
                    copiedLabel={da ? "Kopieret" : "Copied"}
                  />
                </div>
              </div>
              <dl className="space-y-2 border-t border-border py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Fertilt vindue" : "Fertile window"}
                  </dt>
                  <dd className="text-right font-medium">
                    {formatCycleDate(result.fertileStart, locale)}
                    {" – "}
                    {formatCycleDate(result.fertileEnd, locale)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Næste menstruation" : "Next period"}
                  </dt>
                  <dd className="text-right font-medium">
                    {formatCycleDate(result.nextPeriod, locale)}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="py-8 text-sm text-muted">
              {da
                ? "Vælg en gyldig startdato og cykluslængde."
                : "Pick a valid start date and cycle length."}
            </p>
          )}
        </div>

        {result ? (
          <div className="rounded-[12px] border border-border bg-surface px-4 py-3">
            <p className="mb-2 text-xs font-medium text-muted">
              {da
                ? "Nøgledatoer (ca. 2 cyklusser)"
                : "Key dates (about 2 cycles)"}
            </p>
            <ul className="space-y-1.5 text-sm">
              {result.calendar.map((item) => (
                <li
                  key={`${item.kind}-${item.iso}`}
                  className="flex justify-between gap-3 border-t border-border py-1.5 first:border-t-0"
                >
                  <span className="text-muted">{kindLabel(item.kind, da)}</span>
                  <span className="font-medium tabular-nums">
                    {(() => {
                      const d = dateFromIso(item.iso);
                      return d ? formatCycleDate(d, locale) : item.iso;
                    })()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
