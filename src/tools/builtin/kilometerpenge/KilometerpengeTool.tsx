"use client";

import { useMemo, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import {
  prefillChoice,
  prefillNumber,
  type ToolPrefill,
} from "@/tools/prefill";
import {
  calculateKilometerpenge,
  DEFAULT_LOW_RATE_PER_KM,
  DEFAULT_RATE_PER_KM,
  DEFAULT_THRESHOLD_KM,
  type KilometerpengeMode,
} from "./calc";

const MODES: readonly KilometerpengeMode[] = ["simple", "threshold"];

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

export function KilometerpengeTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.kilometerpenge;

  const [km, setKm] = useState(
    prefillNumber(prefill, "km", { min: 0 }) ?? "120",
  );
  const [mode, setMode] = useState<KilometerpengeMode>(
    prefillChoice(prefill, "mode", MODES) ?? "simple",
  );
  const [highRate, setHighRate] = useState(
    prefillNumber(prefill, "rate", { min: 0 }) ??
      String(DEFAULT_RATE_PER_KM),
  );
  const [thresholdKm, setThresholdKm] = useState(
    prefillNumber(prefill, "threshold", { min: 0 }) ??
      String(DEFAULT_THRESHOLD_KM),
  );
  const [lowRate, setLowRate] = useState(
    prefillNumber(prefill, "low", { min: 0 }) ??
      String(DEFAULT_LOW_RATE_PER_KM),
  );

  const result = useMemo(() => {
    const kmN = Number(km.replace(",", "."));
    const highN = Number(highRate.replace(",", "."));
    const thresholdN = Number(thresholdKm.replace(",", "."));
    const lowN = Number(lowRate.replace(",", "."));
    return calculateKilometerpenge(kmN, highN, mode, thresholdN, lowN);
  }, [km, highRate, lowRate, mode, thresholdKm]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="inline-flex rounded-[10px] border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setMode("simple")}
            className={`kit-touch-target rounded-[8px] px-3 py-1.5 text-sm transition-colors sm:min-h-0 ${
              mode === "simple"
                ? "bg-accent text-on-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.modeSimple}
          </button>
          <button
            type="button"
            onClick={() => setMode("threshold")}
            className={`kit-touch-target rounded-[8px] px-3 py-1.5 text-sm transition-colors sm:min-h-0 ${
              mode === "threshold"
                ? "bg-accent text-on-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.modeThreshold}
          </button>
        </div>

        <Field label={t.km} hint={t.kmHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={km}
            onChange={(event) => setKm(event.target.value)}
            className={fieldClass}
          />
        </Field>

        <Field label={t.rate} hint={t.rateHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={highRate}
            onChange={(event) => setHighRate(event.target.value)}
            className={fieldClass}
          />
        </Field>

        {mode === "threshold" ? (
          <>
            <Field label={t.threshold} hint={t.thresholdHint}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={thresholdKm}
                onChange={(event) => setThresholdKm(event.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label={t.lowRate} hint={t.lowRateHint}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={lowRate}
                onChange={(event) => setLowRate(event.target.value)}
                className={fieldClass}
              />
            </Field>
          </>
        ) : null}
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="border-b border-border py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t.total}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatKr(result.total, locale, 2)}
                  </p>
                </div>
                <CopyButton
                  value={formatNumber(result.total, locale, 2)}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            {result.mode === "threshold" &&
            result.highPart !== undefined &&
            result.lowPart !== undefined ? (
              <>
                <div className="border-b border-border py-3">
                  <p className="text-xs text-muted">
                    {t.breakdownHigh.replace(
                      "{km}",
                      formatNumber(result.kmAtHigh ?? 0, locale, 0),
                    )}
                  </p>
                  <p className="mt-1 text-lg font-medium">
                    {formatKr(result.highPart, locale, 2)}
                  </p>
                </div>
                <div className="border-b border-border py-3">
                  <p className="text-xs text-muted">
                    {t.breakdownLow.replace(
                      "{km}",
                      formatNumber(result.kmAtLow ?? 0, locale, 0),
                    )}
                  </p>
                  <p className="mt-1 text-lg font-medium">
                    {formatKr(result.lowPart, locale, 2)}
                  </p>
                </div>
              </>
            ) : (
              <div className="border-b border-border py-3">
                <p className="text-xs text-muted">{t.simpleLine}</p>
                <p className="mt-1 text-sm text-muted">
                  {formatNumber(result.km, locale, 1)} km ×{" "}
                  {formatNumber(result.highRate, locale, 2)} kr/km
                </p>
              </div>
            )}
            <p className="pb-3 pt-2 text-xs text-muted">{t.disclaimer}</p>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}