"use client";

import { useMemo, useState } from "react";
import {
  Field,
  KitInput,
  KitSelect,
  Segmented,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  type ColorId,
  type CompKind,
  type SeriesComp,
  COLOR_BANDS,
  LED_DEFAULT_VF,
  LED_SAFE_MA,
  analyzeSeries,
  decodeResistor,
  fmtA,
  fmtOhm,
  fmtV,
  fmtW,
  uid,
} from "./calc";

type Mode = "circuit" | "colors";

const COLOR_LABELS: Record<ColorId, { da: string; en: string }> = {
  black: { da: "Sort", en: "Black" },
  brown: { da: "Brun", en: "Brown" },
  red: { da: "Rød", en: "Red" },
  orange: { da: "Orange", en: "Orange" },
  yellow: { da: "Gul", en: "Yellow" },
  green: { da: "Grøn", en: "Green" },
  blue: { da: "Blå", en: "Blue" },
  violet: { da: "Violet", en: "Violet" },
  grey: { da: "Grå", en: "Grey" },
  white: { da: "Hvid", en: "White" },
  gold: { da: "Guld", en: "Gold" },
  silver: { da: "Sølv", en: "Silver" },
};

function kindLabel(kind: CompKind, da: boolean): string {
  switch (kind) {
    case "battery":
      return da ? "Batteri" : "Battery";
    case "resistor":
      return da ? "Modstand" : "Resistor";
    case "led":
      return "LED";
    case "switch":
      return da ? "Kontakt" : "Switch";
  }
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-surface px-3 py-2.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-mono text-base font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function Schematic({
  comps,
  analysis,
  currentOn,
}: {
  comps: SeriesComp[];
  analysis: ReturnType<typeof analyzeSeries>;
  currentOn: boolean;
}) {
  const n = Math.max(comps.length, 1);
  const width = Math.max(320, 80 + n * 70);
  const y = 70;
  const startX = 40;
  const endX = width - 40;
  const step = comps.length > 0 ? (endX - startX) / comps.length : endX - startX;
  const stroke = currentOn ? "var(--accent)" : "var(--border)";
  const sw = currentOn ? 2.5 : 1.5;

  return (
    <div className="overflow-x-auto rounded-[12px] border border-border bg-overlay/40 p-3">
      <svg
        viewBox={`0 0 ${width} 140`}
        className="mx-auto h-auto w-full"
        style={{ minWidth: Math.min(width, 480) }}
        aria-hidden
      >
        {/* Top rail */}
        <line x1={startX} y1={y} x2={endX} y2={y} stroke={stroke} strokeWidth={sw} />
        {/* Return path */}
        <line x1={startX} y1={y} x2={startX} y2={120} stroke={stroke} strokeWidth={sw} />
        <line x1={startX} y1={120} x2={endX} y2={120} stroke={stroke} strokeWidth={sw} />
        <line x1={endX} y1={120} x2={endX} y2={y} stroke={stroke} strokeWidth={sw} />

        {comps.map((c, i) => {
          const cx = startX + step * (i + 0.5);
          const drop = analysis.drops.find((d) => d.id === c.id);
          return (
            <g key={c.id}>
              {c.kind === "battery" ? (
                <>
                  <line x1={cx - 10} y1={y - 18} x2={cx - 10} y2={y + 18} stroke="var(--foreground)" strokeWidth={2} />
                  <line x1={cx + 6} y1={y - 10} x2={cx + 6} y2={y + 10} stroke="var(--foreground)" strokeWidth={4} />
                  <text x={cx} y={y - 26} textAnchor="middle" fontSize={10} fill="var(--muted)">
                    {fmtV(c.value)}
                  </text>
                </>
              ) : null}
              {c.kind === "resistor" ? (
                <>
                  <polyline
                    points={`${cx - 22},${y} ${cx - 16},${y - 12} ${cx - 8},${y + 12} ${cx},${y - 12} ${cx + 8},${y + 12} ${cx + 16},${y - 12} ${cx + 22},${y}`}
                    fill="none"
                    stroke="var(--foreground)"
                    strokeWidth={2}
                  />
                  <text x={cx} y={y - 20} textAnchor="middle" fontSize={10} fill="var(--muted)">
                    {fmtOhm(c.value)}
                  </text>
                </>
              ) : null}
              {c.kind === "led" ? (
                <>
                  <path
                    d={`M${cx - 10},${y - 14} L${cx + 12},${y} L${cx - 10},${y + 14} Z`}
                    fill={currentOn ? "color-mix(in srgb, var(--accent) 35%, transparent)" : "var(--surface)"}
                    stroke="var(--foreground)"
                    strokeWidth={2}
                  />
                  <line x1={cx + 12} y1={y - 12} x2={cx + 12} y2={y + 12} stroke="var(--foreground)" strokeWidth={2} />
                  <text x={cx} y={y - 22} textAnchor="middle" fontSize={10} fill="var(--muted)">
                    LED {fmtV(c.value)}
                  </text>
                </>
              ) : null}
              {c.kind === "switch" ? (
                <>
                  <circle cx={cx - 14} cy={y} r={3} fill="var(--foreground)" />
                  <circle cx={cx + 14} cy={y} r={3} fill="var(--foreground)" />
                  <line
                    x1={cx - 14}
                    y1={y}
                    x2={cx + 12}
                    y2={c.closed ? y : y - 16}
                    stroke="var(--foreground)"
                    strokeWidth={2}
                  />
                  <text x={cx} y={y - 22} textAnchor="middle" fontSize={10} fill="var(--muted)">
                    {c.closed ? "ON" : "OFF"}
                  </text>
                </>
              ) : null}
              {drop && (c.kind === "resistor" || c.kind === "led") && currentOn ? (
                <text x={cx} y={y + 28} textAnchor="middle" fontSize={9} fill="var(--accent)">
                  {fmtV(drop.voltage)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function KredslobTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<Mode>("circuit");
  const [comps, setComps] = useState<SeriesComp[]>(() => [
    { id: uid("bat"), kind: "battery", value: 9 },
    { id: uid("r"), kind: "resistor", value: 330 },
    { id: uid("led"), kind: "led", value: LED_DEFAULT_VF },
    { id: uid("sw"), kind: "switch", value: 0, closed: true },
  ]);

  const [b1, setB1] = useState<ColorId>("brown");
  const [b2, setB2] = useState<ColorId>("black");
  const [bm, setBm] = useState<ColorId>("orange");
  const [bt, setBt] = useState<ColorId>("gold");

  const analysis = useMemo(() => analyzeSeries(comps), [comps]);
  const currentOn =
    !analysis.open &&
    Number.isFinite(analysis.current) &&
    analysis.current > 0;
  const decoded = useMemo(() => decodeResistor(b1, b2, bm, bt), [b1, b2, bm, bt]);

  function addComp(kind: CompKind) {
    const defaults: Record<CompKind, Partial<SeriesComp>> = {
      battery: { value: 5 },
      resistor: { value: 220 },
      led: { value: LED_DEFAULT_VF },
      switch: { value: 0, closed: true },
    };
    setComps((prev) => [
      ...prev,
      { id: uid(kind), kind, value: 0, ...defaults[kind] } as SeriesComp,
    ]);
  }

  function updateComp(id: string, patch: Partial<SeriesComp>) {
    setComps((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function removeComp(id: string) {
    setComps((prev) => prev.filter((c) => c.id !== id));
  }

  const digitColors = COLOR_BANDS.filter((c) => c.dig != null) as {
    id: ColorId;
    dig: number;
    hex: string;
  }[];
  const multColors = COLOR_BANDS.filter((c) =>
    ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "grey", "white", "gold", "silver"].includes(
      c.id,
    ),
  );
  const tolColors = COLOR_BANDS.filter((c) => c.tol != null);

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Byg et seriekredsløb med batteri, modstand, LED og kontakt. Se strøm, spændingsfald og effekt efter Ohms lov. Afkod også farvekoder på modstande."
          : "Build a series circuit with battery, resistor, LED, and switch. See current, voltage drops, and power from Ohm's law. Also decode resistor color bands."}
      </p>

      <Segmented
        value={mode}
        onChange={setMode}
        ariaLabel={da ? "Tilstand" : "Mode"}
        options={[
          { id: "circuit", label: da ? "Kredsløb" : "Circuit" },
          { id: "colors", label: da ? "Farvekode" : "Color code" },
        ]}
      />

      {mode === "circuit" ? (
        <div className="kit-fade-in space-y-5">
          <div className="kit-h-scroll flex gap-2">
            {(["battery", "resistor", "led", "switch"] as CompKind[]).map((k) => (
              <button
                key={k}
                type="button"
                className={secondaryBtnClass}
                onClick={() => addComp(k)}
              >
                + {kindLabel(k, da)}
              </button>
            ))}
          </div>

          <Schematic comps={comps} analysis={analysis} currentOn={currentOn} />

          <section className="kit-tool-panel space-y-3 p-4 sm:p-5">
            <h2 className="text-sm font-medium">
              {da ? "Komponenter (serie)" : "Components (series)"}
            </h2>
            <ul className="space-y-2">
              {comps.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center gap-2 rounded-[10px] border border-border bg-surface px-3 py-2"
                >
                  <span className="min-w-[5.5rem] text-sm font-medium">
                    {kindLabel(c.kind, da)}
                  </span>
                  {c.kind === "battery" || c.kind === "resistor" || c.kind === "led" ? (
                    <label className="flex items-center gap-1.5 text-xs text-muted">
                      {c.kind === "battery"
                        ? "V"
                        : c.kind === "resistor"
                          ? "Ω"
                          : da
                            ? "Vf"
                            : "Vf"}
                      <KitInput
                        inputMode="decimal"
                        value={String(c.value)}
                        onChange={(e) =>
                          updateComp(c.id, {
                            value: Number(String(e.target.value).replace(",", ".")) || 0,
                          })
                        }
                        className="kit-field w-24 rounded-[8px] border border-border bg-overlay px-2 py-1.5 text-sm tabular-nums outline-none focus:border-accent"
                      />
                    </label>
                  ) : null}
                  {c.kind === "switch" ? (
                    <button
                      type="button"
                      className={c.closed ? primaryBtnClass : secondaryBtnClass}
                      onClick={() => updateComp(c.id, { closed: !c.closed })}
                      aria-pressed={Boolean(c.closed)}
                    >
                      {c.closed
                        ? da
                          ? "Lukket"
                          : "Closed"
                        : da
                          ? "Åben"
                          : "Open"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={`${secondaryBtnClass} ml-auto`}
                    onClick={() => removeComp(c.id)}
                  >
                    {da ? "Fjern" : "Remove"}
                  </button>
                </li>
              ))}
              {comps.length === 0 ? (
                <li className="text-sm text-muted">
                  {da ? "Tilføj komponenter for at starte." : "Add components to begin."}
                </li>
              ) : null}
            </ul>
          </section>

          <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric label={da ? "Forsyning" : "Supply"} value={fmtV(analysis.supplyV)} />
            <Metric label={da ? "Samlet R" : "Total R"} value={fmtOhm(analysis.totalR)} />
            <Metric
              label={da ? "Strøm" : "Current"}
              value={
                analysis.open
                  ? da
                    ? "0 (åben)"
                    : "0 (open)"
                  : Number.isFinite(analysis.current)
                    ? fmtA(analysis.current)
                    : da
                      ? "Ubegrænset"
                      : "Unbounded"
              }
            />
            <Metric
              label={da ? "Effekt (R+LED)" : "Power (R+LED)"}
              value={fmtW(
                analysis.drops
                  .filter((d) => d.kind === "resistor" || d.kind === "led")
                  .reduce((s, d) => s + d.power, 0),
              )}
            />
          </section>

          {analysis.ledWarn ? (
            <p
              role="alert"
              className="rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-foreground"
            >
              {da
                ? `LED-strøm over ${LED_SAFE_MA} mA (eller ingen serie-modstand). Tilføj eller øg modstanden, så dioden ikke overbelastes.`
                : `LED current above ${LED_SAFE_MA} mA (or missing series resistor). Add or raise resistance so the diode is not overloaded.`}
            </p>
          ) : null}

          {analysis.drops.some((d) => d.kind === "resistor" || d.kind === "led") ? (
            <section className="kit-tool-panel space-y-2 p-4 sm:p-5">
              <h2 className="text-sm font-medium">
                {da ? "Spændingsfald" : "Voltage drops"}
              </h2>
              <ul className="space-y-1.5 text-sm">
                {analysis.drops
                  .filter((d) => d.kind === "resistor" || d.kind === "led")
                  .map((d) => (
                    <li
                      key={d.id}
                      className="flex justify-between gap-2 border-b border-border/60 py-1.5 last:border-0"
                    >
                      <span className="text-muted">
                        {kindLabel(d.kind, da)}
                      </span>
                      <span className="font-mono tabular-nums text-foreground">
                        {fmtV(d.voltage)} · {fmtW(d.power)}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : (
        <section className="kit-fade-in kit-tool-panel space-y-4 p-4 sm:p-5">
          <p className="text-sm text-muted">
            {da
              ? "Vælg fire bånd (to cifre, multiplikator, tolerance) for at aflæse modstandsværdien."
              : "Pick four bands (two digits, multiplier, tolerance) to read the resistor value."}
          </p>

          <div className="mx-auto flex h-16 w-full max-w-sm items-center justify-center gap-2 rounded-[12px] border border-border bg-[#d7c4a3] px-6">
            {[b1, b2, bm, bt].map((id, i) => {
              const c = COLOR_BANDS.find((x) => x.id === id);
              return (
                <span
                  key={i}
                  className="h-14 w-3 rounded-sm border border-black/20"
                  style={{ background: c?.hex ?? "#000" }}
                  title={COLOR_LABELS[id][da ? "da" : "en"]}
                />
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={da ? "1. ciffer" : "1st digit"}>
              <KitSelect
                value={b1}
                onChange={(e) => setB1(e.target.value as ColorId)}
              >
                {digitColors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {COLOR_LABELS[c.id][da ? "da" : "en"]} ({c.dig})
                  </option>
                ))}
              </KitSelect>
            </Field>
            <Field label={da ? "2. ciffer" : "2nd digit"}>
              <KitSelect
                value={b2}
                onChange={(e) => setB2(e.target.value as ColorId)}
              >
                {digitColors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {COLOR_LABELS[c.id][da ? "da" : "en"]} ({c.dig})
                  </option>
                ))}
              </KitSelect>
            </Field>
            <Field label={da ? "Multiplikator" : "Multiplier"}>
              <KitSelect
                value={bm}
                onChange={(e) => setBm(e.target.value as ColorId)}
              >
                {multColors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {COLOR_LABELS[c.id][da ? "da" : "en"]} (×{c.mult})
                  </option>
                ))}
              </KitSelect>
            </Field>
            <Field label={da ? "Tolerance" : "Tolerance"}>
              <KitSelect
                value={bt}
                onChange={(e) => setBt(e.target.value as ColorId)}
              >
                {tolColors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {COLOR_LABELS[c.id][da ? "da" : "en"]} (±{c.tol}%)
                  </option>
                ))}
              </KitSelect>
            </Field>
          </div>

          {decoded ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Metric label={da ? "Værdi" : "Value"} value={fmtOhm(decoded.ohms)} />
                <Metric
                  label={da ? "Tolerance" : "Tolerance"}
                  value={
                    decoded.tolerance != null
                      ? `±${decoded.tolerance}%`
                      : da
                        ? "Ukendt"
                        : "Unknown"
                  }
                />
              </div>
              <button
                type="button"
                className={primaryBtnClass}
                onClick={() => {
                  const ohms = decoded.ohms;
                  setComps((prev) => [
                    ...prev,
                    { id: uid("resistor"), kind: "resistor", value: ohms },
                  ]);
                  setMode("circuit");
                }}
              >
                {da ? "Indsæt i kredsløb" : "Insert into circuit"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted">
              {da ? "Ugyldig farvekombination." : "Invalid color combination."}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
