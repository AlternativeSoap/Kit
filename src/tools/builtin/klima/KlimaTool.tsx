"use client";

import { useMemo, useState } from "react";
import { Field, KitInput, KitSelect } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  calculateKlima,
  DEFAULT_FACTORS,
  DIET_T_CO2E,
  DK_AVERAGE_T_CO2E,
  tipsForLargest,
  type DietPattern,
  type EmissionFactors,
} from "./calc";

function num(s: string) {
  return Number(s.replace(",", "."));
}

function fmt(n: number, locale: string, digits = 1) {
  return new Intl.NumberFormat(locale === "da" ? "da-DK" : "en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n);
}

export function KlimaTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [carKm, setCarKm] = useState("12000");
  const [flightsShort, setFlightsShort] = useState("2");
  const [flightsLong, setFlightsLong] = useState("0");
  const [diet, setDiet] = useState<DietPattern>("average");
  const [electricity, setElectricity] = useState("3000");
  const [heating, setHeating] = useState("12000");
  const [showFactors, setShowFactors] = useState(false);

  const [factors, setFactors] = useState<EmissionFactors>({ ...DEFAULT_FACTORS });

  const [factorDraft, setFactorDraft] = useState<Record<keyof EmissionFactors, string>>({
    carKgPerKm: String(DEFAULT_FACTORS.carKgPerKm),
    flightShortKg: String(DEFAULT_FACTORS.flightShortKg),
    flightLongKg: String(DEFAULT_FACTORS.flightLongKg),
    electricityKgPerKwh: String(DEFAULT_FACTORS.electricityKgPerKwh),
    heatingKgPerKwh: String(DEFAULT_FACTORS.heatingKgPerKwh),
  });

  const setFactor = (key: keyof EmissionFactors, value: string) => {
    setFactorDraft((d) => ({ ...d, [key]: value }));
    const n = num(value);
    if (!Number.isFinite(n) || n < 0) return;
    setFactors((f) => ({ ...f, [key]: n }));
  };

  const resetFactors = () => {
    setFactors({ ...DEFAULT_FACTORS });
    setFactorDraft({
      carKgPerKm: String(DEFAULT_FACTORS.carKgPerKm),
      flightShortKg: String(DEFAULT_FACTORS.flightShortKg),
      flightLongKg: String(DEFAULT_FACTORS.flightLongKg),
      electricityKgPerKwh: String(DEFAULT_FACTORS.electricityKgPerKwh),
      heatingKgPerKwh: String(DEFAULT_FACTORS.heatingKgPerKwh),
    });
  };

  const result = useMemo(
    () =>
      calculateKlima({
        carKmPerYear: num(carKm),
        flightsShort: num(flightsShort),
        flightsLong: num(flightsLong),
        diet,
        electricityKwhPerYear: num(electricity),
        heatingKwhPerYear: num(heating),
        factors,
      }),
    [carKm, flightsShort, flightsLong, diet, electricity, heating, factors],
  );

  const tips = result ? tipsForLargest(result.largest) : [];
  const maxBar = Math.max(
    result?.totalTonnes ?? 0,
    DK_AVERAGE_T_CO2E,
    ...(result?.categories.map((c) => c.kg / 1000) ?? [0]),
    0.1,
  );

  const catLabel = (id: string) => {
    if (id === "transport") return da ? "Transport" : "Transport";
    if (id === "food") return da ? "Mad" : "Food";
    return da ? "Bolig" : "Home";
  };

  const dietOptions: { id: DietPattern; label: string }[] = [
    { id: "meatHeavy", label: da ? "Meget kød" : "Meat-heavy" },
    { id: "average", label: da ? "Gennemsnit" : "Average" },
    { id: "flexitarian", label: da ? "Flexitar" : "Flexitarian" },
    { id: "vegetarian", label: da ? "Vegetar" : "Vegetarian" },
    { id: "vegan", label: da ? "Veganer" : "Vegan" },
  ];

  return (
    <div className="kit-tool mx-auto max-w-4xl space-y-6">
      <p className="text-sm text-muted">
        {da
          ? "Grove CO2e-estimater for transport, mad og bolig. Faktorer er synlige og kan ændres."
          : "Rough CO2e estimates for transport, food, and home. Factors are visible and editable."}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <section className="space-y-3 rounded-[12px] border border-border bg-surface p-4">
            <h3 className="text-sm font-medium">{da ? "Transport" : "Transport"}</h3>
            <Field label={da ? "Bil-km pr. år" : "Car km / year"}>
              <KitInput value={carKm} onChange={(e) => setCarKm(e.target.value)} inputMode="decimal" />
            </Field>
            <Field
              label={da ? "Korte/mellemfly (antal, én vej)" : "Short/medium flights (count, one-way)"}
            >
              <KitInput
                value={flightsShort}
                onChange={(e) => setFlightsShort(e.target.value)}
                inputMode="numeric"
              />
            </Field>
            <Field label={da ? "Langdistancefly (antal, én vej)" : "Long-haul flights (count, one-way)"}>
              <KitInput
                value={flightsLong}
                onChange={(e) => setFlightsLong(e.target.value)}
                inputMode="numeric"
              />
            </Field>
          </section>

          <section className="space-y-3 rounded-[12px] border border-border bg-surface p-4">
            <h3 className="text-sm font-medium">{da ? "Mad" : "Food"}</h3>
            <Field
              label={da ? "Kostmønster" : "Diet pattern"}
              hint={
                da
                  ? `Antaget mad-aftryk: ${fmt(DIET_T_CO2E[diet], locale)} t CO2e/år`
                  : `Assumed food footprint: ${fmt(DIET_T_CO2E[diet], locale)} t CO2e/year`
              }
            >
              <KitSelect
                value={diet}
                onChange={(e) => setDiet(e.target.value as DietPattern)}
              >
                {dietOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </KitSelect>
            </Field>
          </section>

          <section className="space-y-3 rounded-[12px] border border-border bg-surface p-4">
            <h3 className="text-sm font-medium">{da ? "Bolig (energi)" : "Home (energy)"}</h3>
            <Field label={da ? "El (kWh/år)" : "Electricity (kWh/year)"}>
              <KitInput
                value={electricity}
                onChange={(e) => setElectricity(e.target.value)}
                inputMode="decimal"
              />
            </Field>
            <Field
              label={da ? "Varme (kWh/år)" : "Heating (kWh/year)"}
              hint={
                da
                  ? "Fjernvarme, gas eller varmepumpe. Omtrentligt forbrug."
                  : "District heat, gas, or heat pump. Approximate use."
              }
            >
              <KitInput
                value={heating}
                onChange={(e) => setHeating(e.target.value)}
                inputMode="decimal"
              />
            </Field>
          </section>

          <div>
            <button
              type="button"
              className="text-sm font-medium text-accent underline-offset-2 hover:underline"
              onClick={() => setShowFactors((v) => !v)}
            >
              {showFactors
                ? da
                  ? "Skjul emissionsfaktorer"
                  : "Hide emission factors"
                : da
                  ? "Vis/rediger emissionsfaktorer"
                  : "Show/edit emission factors"}
            </button>
            {showFactors ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label={da ? "Bil kg/km" : "Car kg/km"}>
                  <KitInput
                    value={factorDraft.carKgPerKm}
                    onChange={(e) => setFactor("carKgPerKm", e.target.value)}
                    inputMode="decimal"
                  />
                </Field>
                <Field label={da ? "Kort fly kg" : "Short flight kg"}>
                  <KitInput
                    value={factorDraft.flightShortKg}
                    onChange={(e) => setFactor("flightShortKg", e.target.value)}
                    inputMode="decimal"
                  />
                </Field>
                <Field label={da ? "Langt fly kg" : "Long flight kg"}>
                  <KitInput
                    value={factorDraft.flightLongKg}
                    onChange={(e) => setFactor("flightLongKg", e.target.value)}
                    inputMode="decimal"
                  />
                </Field>
                <Field label={da ? "El kg/kWh" : "Electricity kg/kWh"}>
                  <KitInput
                    value={factorDraft.electricityKgPerKwh}
                    onChange={(e) => setFactor("electricityKgPerKwh", e.target.value)}
                    inputMode="decimal"
                  />
                </Field>
                <Field label={da ? "Varme kg/kWh" : "Heating kg/kWh"}>
                  <KitInput
                    value={factorDraft.heatingKgPerKwh}
                    onChange={(e) => setFactor("heatingKgPerKwh", e.target.value)}
                    inputMode="decimal"
                  />
                </Field>
                <button
                  type="button"
                  className="self-end rounded-[10px] border border-border px-3 py-2 text-sm"
                  onClick={resetFactors}
                >
                  {da ? "Nulstil faktorer" : "Reset factors"}
                </button>
              </div>
            ) : (
              <ul className="mt-2 space-y-1 text-xs text-muted">
                <li>
                  {da ? "Bil" : "Car"}: {factors.carKgPerKm} kg/km
                </li>
                <li>
                  {da ? "Fly kort/langt" : "Flight short/long"}: {factors.flightShortKg} /{" "}
                  {factors.flightLongKg} kg
                </li>
                <li>
                  {da ? "El/varme" : "Power/heat"}: {factors.electricityKgPerKwh} /{" "}
                  {factors.heatingKgPerKwh} kg/kWh
                </li>
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {!result ? (
            <p className="text-sm text-muted">{da ? "Udfyld gyldige tal." : "Enter valid numbers."}</p>
          ) : (
            <>
              <div className="rounded-[12px] border border-border bg-surface p-4">
                <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                  {da ? "Samlet estimat" : "Total estimate"}
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">
                  {fmt(result.totalTonnes, locale)}{" "}
                  <span className="text-base font-medium text-muted">t CO2e / {da ? "år" : "year"}</span>
                </p>
                <p className="mt-2 text-sm text-muted">
                  {result.vsDkAverageTonnes >= 0
                    ? da
                      ? `${fmt(result.vsDkAverageTonnes, locale)} t over groft DK-gennemsnit (${DK_AVERAGE_T_CO2E} t).`
                      : `${fmt(result.vsDkAverageTonnes, locale)} t above a rough DK average (${DK_AVERAGE_T_CO2E} t).`
                    : da
                      ? `${fmt(Math.abs(result.vsDkAverageTonnes), locale)} t under groft DK-gennemsnit (${DK_AVERAGE_T_CO2E} t).`
                      : `${fmt(Math.abs(result.vsDkAverageTonnes), locale)} t below a rough DK average (${DK_AVERAGE_T_CO2E} t).`}
                </p>
              </div>

              <div className="space-y-3 rounded-[12px] border border-border bg-surface p-4">
                <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                  {da ? "Fordeling" : "Breakdown"}
                </p>
                {result.categories.map((c) => {
                  const t = c.kg / 1000;
                  const pct = Math.min(100, (t / maxBar) * 100);
                  return (
                    <div key={c.id}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{catLabel(c.id)}</span>
                        <span className="text-muted">{fmt(t, locale)} t</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-overlay">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-1">
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{da ? "DK-gennemsnit (groft)" : "DK average (rough)"}</span>
                    <span className="text-muted">{DK_AVERAGE_T_CO2E} t</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-overlay">
                    <div
                      className="h-full rounded-full bg-foreground/35"
                      style={{ width: `${Math.min(100, (DK_AVERAGE_T_CO2E / maxBar) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-border bg-surface p-4">
                <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                  {da
                    ? `Tips (største kategori: ${catLabel(result.largest)})`
                    : `Tips (largest category: ${catLabel(result.largest)})`}
                </p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
                  {tips.map((t) => (
                    <li key={t.id}>{da ? t.da : t.en}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-muted">
        {da
          ? "Kun et illustrativt estimat. Faktorer er forenklet. Scope 3, varer og tjenester er ikke med. Ikke rådgivning."
          : "Illustrative estimate only. Factors are simplified. Scope 3 goods and services are omitted. Not advice."}
      </p>
    </div>
  );
}
