"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateBraendstof, type EnergyMode } from "./calc";
import { LivePricesPanel } from "./LivePricesPanel";

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

const DEFAULTS: Record<
  EnergyMode,
  { consumption: string; price: string }
> = {
  fuel: { consumption: "5.5", price: "14" },
  electric: { consumption: "18", price: "2.50" },
};

export function BraendstofTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.braendstof;

  const initialMode: EnergyMode =
    prefill?.mode === "electric" || prefill?.energy === "electric"
      ? "electric"
      : "fuel";

  const [mode, setMode] = useState<EnergyMode>(initialMode);
  const [distance, setDistance] = useState(
    prefillNumber(prefill, "km", { min: 0 }) ?? "500",
  );
  const [consumption, setConsumption] = useState(
    prefillNumber(prefill, "consumption", { min: 0 }) ??
      DEFAULTS[initialMode].consumption,
  );
  const [price, setPrice] = useState(
    prefillNumber(prefill, "price", { min: 0 }) ?? DEFAULTS[initialMode].price,
  );

  const selectMode = (next: EnergyMode) => {
    setMode(next);
    setConsumption(DEFAULTS[next].consumption);
    setPrice(DEFAULTS[next].price);
  };

  const applyElectricPrice = (krPerKwh: number) => {
    if (mode !== "electric") {
      setMode("electric");
      setConsumption(DEFAULTS.electric.consumption);
    }
    setPrice(krPerKwh.toFixed(2));
  };

  const result = useMemo(() => {
    const km = Number(distance.replace(",", "."));
    const per100 = Number(consumption.replace(",", "."));
    const kr = Number(price.replace(",", "."));
    return calculateBraendstof(km, per100, kr);
  }, [consumption, distance, price]);

  const electric = mode === "electric";

  return (
    <div className="space-y-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <div role="group" aria-label={t.modeLabel} className="flex flex-wrap gap-1">
            {(
              [
                { id: "fuel" as const, label: t.modeFuel },
                { id: "electric" as const, label: t.modeElectric },
              ] as const
            ).map((option) => {
              const active = option.id === mode;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectMode(option.id)}
                  className={`kit-touch-target inline-flex items-center rounded-[10px] px-3 py-2 text-sm font-medium transition-colors sm:min-h-0 ${
                    active
                      ? "bg-accent text-white"
                      : "text-muted hover:bg-accent-soft hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <Field label={t.distance} hint={t.distanceHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[15px]"
            />
          </Field>
          <Field
            label={electric ? t.consumptionElectric : t.consumption}
            hint={electric ? t.consumptionElectricHint : t.consumptionHint}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={consumption}
              onChange={(event) => setConsumption(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[15px]"
            />
          </Field>
          <Field
            label={electric ? t.priceElectric : t.price}
            hint={electric ? t.priceElectricHint : t.priceHint}
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[15px]"
            />
          </Field>
        </div>

        <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
          {result ? (
            <>
              <div className="border-b border-border py-3">
                <p className="text-xs text-muted">
                  {electric ? t.energyUsed : t.liters}
                </p>
                <p className="mt-1 text-lg font-medium">
                  {formatNumber(result.amountUsed, locale, 2)}{" "}
                  {electric ? "kWh" : "L"}
                </p>
              </div>
              <div className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted">
                      {electric ? t.totalElectric : t.total}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      {formatKr(result.totalCost, locale, 2)}
                    </p>
                  </div>
                  <CopyButton
                    value={formatNumber(result.totalCost, locale, 2)}
                    label={t.copy}
                    copiedLabel={t.copied}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="py-8 text-sm text-muted">{t.empty}</p>
          )}
        </div>
      </div>

      <LivePricesPanel onApplyElectricPrice={applyElectricPrice} />
    </div>
  );
}
