"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatPercent } from "@/lib/format";
import { prefillChoice, prefillNumber, type ToolPrefill } from "@/tools/prefill";
import {
  calculateLon,
  DEFAULT_HOURS_PER_WEEK,
  DEFAULT_TREKPROCENT,
  type LonInputMode,
} from "./calc";

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

function NumberInput({
  value,
  onChange,
  placeholder,
  step = "1",
  min,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  step?: string;
  min?: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      min={min}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none transition-colors focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
    />
  );
}

function Stat({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 tracking-tight ${
          emphasis ? "text-2xl font-semibold" : "text-lg font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

const MODES: readonly LonInputMode[] = ["monthly", "hourly"];

export function LonTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale, dictionary } = useLanguage();
  const t = dictionary.salary;

  const [mode, setMode] = useState<LonInputMode>(
    prefillChoice(prefill, "mode", MODES) ?? "monthly",
  );
  // "gross" fills the field for the chosen mode; the other keeps its default.
  const gross = prefillNumber(prefill, "gross", { min: 0 });
  const [bruttoMonthly, setBruttoMonthly] = useState(
    (mode === "monthly" ? gross : null) ?? "35000",
  );
  const [bruttoHourly, setBruttoHourly] = useState(
    (mode === "hourly" ? gross : null) ?? "180",
  );
  const [trekprocent, setTrekprocent] = useState(
    prefillNumber(prefill, "rate", { min: 0, max: 100 }) ??
      String(DEFAULT_TREKPROCENT),
  );
  const [hoursPerWeek, setHoursPerWeek] = useState(
    String(DEFAULT_HOURS_PER_WEEK),
  );
  const [monthlyDeduction, setMonthlyDeduction] = useState("");
  const [pensionPercent, setPensionPercent] = useState("");
  const [atpMonthly, setAtpMonthly] = useState("");
  const [under18, setUnder18] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const result = useMemo(() => {
    const parse = (value: string) => {
      const n = Number(value.replace(",", "."));
      return Number.isFinite(n) ? n : undefined;
    };

    return calculateLon({
      mode,
      bruttoMonthly: parse(bruttoMonthly),
      bruttoHourly: parse(bruttoHourly),
      trekprocent: parse(trekprocent) ?? 0,
      hoursPerWeek: parse(hoursPerWeek),
      monthlyDeduction: parse(monthlyDeduction),
      pensionPercent: parse(pensionPercent),
      atpMonthly: parse(atpMonthly),
      under18,
    });
  }, [
    mode,
    bruttoMonthly,
    bruttoHourly,
    trekprocent,
    hoursPerWeek,
    monthlyDeduction,
    pensionPercent,
    atpMonthly,
    under18,
  ]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="inline-flex rounded-[10px] border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setMode("monthly")}
            className={`kit-touch-target rounded-[8px] px-3 py-1.5 text-sm transition-colors sm:min-h-0 ${
              mode === "monthly"
                ? "bg-accent text-on-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.monthly}
          </button>
          <button
            type="button"
            onClick={() => setMode("hourly")}
            className={`kit-touch-target rounded-[8px] px-3 py-1.5 text-sm transition-colors sm:min-h-0 ${
              mode === "hourly"
                ? "bg-accent text-on-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.hourly}
          </button>
        </div>

        {mode === "monthly" ? (
          <Field label={t.grossMonthly}>
            <NumberInput
              value={bruttoMonthly}
              onChange={setBruttoMonthly}
              placeholder="35000"
              min="0"
            />
          </Field>
        ) : (
          <Field label={t.grossHourly}>
            <NumberInput
              value={bruttoHourly}
              onChange={setBruttoHourly}
              placeholder="180"
              min="0"
              step="0.01"
            />
          </Field>
        )}

        <Field label={t.withholding} hint={t.withholdingHint}>
          <NumberInput
            value={trekprocent}
            onChange={setTrekprocent}
            placeholder="38"
            min="0"
            step="0.1"
          />
        </Field>

        <Field label={t.hoursPerWeek} hint={t.hoursHint}>
          <NumberInput
            value={hoursPerWeek}
            onChange={setHoursPerWeek}
            placeholder="37"
            min="1"
            step="0.5"
          />
        </Field>

        <button
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          className="text-sm font-medium text-accent hover:underline"
        >
          {showAdvanced ? t.fewerFields : t.moreFields}
        </button>

        {showAdvanced ? (
          <div className="space-y-5 border-t border-border pt-5">
            <Field label={t.monthlyAllowance} hint={t.monthlyAllowanceHint}>
              <NumberInput
                value={monthlyDeduction}
                onChange={setMonthlyDeduction}
                placeholder="0"
                min="0"
              />
            </Field>
            <Field label={t.pension}>
              <NumberInput
                value={pensionPercent}
                onChange={setPensionPercent}
                placeholder="0"
                min="0"
                step="0.1"
              />
            </Field>
            <Field label={t.atp}>
              <NumberInput
                value={atpMonthly}
                onChange={setAtpMonthly}
                placeholder="99"
                min="0"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={under18}
                onChange={(event) => setUnder18(event.target.checked)}
                className="h-4 w-4 rounded border-border accent-[var(--accent)]"
              />
              {t.under18}
            </label>
          </div>
        ) : null}
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <Stat
              label={t.netMonthly}
              value={formatKr(result.nettoMonthly, locale)}
              emphasis
            />
            <Stat
              label={t.grossMonth}
              value={formatKr(result.bruttoMonthly, locale)}
            />
            <Stat
              label={t.grossYear}
              value={formatKr(result.bruttoYearly, locale)}
            />
            <Stat
              label={t.netYear}
              value={formatKr(result.nettoYearly, locale)}
            />
            <Stat
              label={t.hourlyGross}
              value={formatKr(result.bruttoHourly, locale, 2)}
            />
            <Stat
              label={t.hourlyNet}
              value={formatKr(result.nettoHourly, locale, 2)}
            />
            <Stat
              label={t.effectiveTax}
              value={formatPercent(result.effectiveTaxPercent, locale)}
            />
            <p className="py-3 text-xs leading-relaxed text-muted">
              {t.disclaimer
                .replace("{ruleset}", result.ruleset)
                .replace(
                  "{precision}",
                  result.precision === "improved"
                    ? locale === "da"
                      ? ", forbedret"
                      : ", improved"
                    : "",
                )}
            </p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}
