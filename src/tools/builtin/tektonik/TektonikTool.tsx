"use client";

import { useMemo, useRef, useState } from "react";
import {
  Field,
  KitInput,
  Segmented,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  LAYERS,
  PLATES,
  boundaryLabel,
  matchesPlate,
  type EarthLayer,
  type TectonicPlate,
} from "./earth";

type Mode = "layers" | "plates";

function CrossSection({
  selectedId,
  onSelect,
  da,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  da: boolean;
}) {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 160;
  // Ring widths enlarged so crust stays visible (not true scale)
  const thicknessVisual = [18, 70, 48, 36];
  let r = maxR;
  const bandRadii: { layer: EarthLayer; outer: number }[] = [];
  for (let i = 0; i < LAYERS.length; i++) {
    const outer = r;
    const inner = i === LAYERS.length - 1 ? 0 : r - thicknessVisual[i]!;
    bandRadii.push({ layer: LAYERS[i]!, outer });
    r = Math.max(0, inner);
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-auto w-full max-w-md touch-manipulation"
      role="img"
      aria-label={da ? "Jordens lag i tværsnit" : "Earth layers cross-section"}
    >
      <circle cx={cx} cy={cy} r={maxR + 8} className="fill-muted/20" />
      {[...bandRadii].reverse().map(({ layer, outer }) => {
        const selected = layer.id === selectedId;
        return (
          <circle
            key={layer.id}
            cx={cx}
            cy={cy}
            r={outer}
            fill={layer.color}
            stroke={selected ? "var(--accent, #5b8def)" : "rgba(0,0,0,0.25)"}
            strokeWidth={selected ? 3 : 1}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={da ? layer.nameDa : layer.nameEn}
            onClick={() => onSelect(layer.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(layer.id);
              }
            }}
          />
        );
      })}
      <path
        d={`M ${cx} ${cy} L ${cx} ${cy - maxR - 4} A ${maxR + 4} ${maxR + 4} 0 0 1 ${cx + (maxR + 4) * 0.55} ${cy - (maxR + 4) * 0.84} Z`}
        fill="var(--background, #0b0d12)"
        fillOpacity={0.35}
        pointerEvents="none"
      />
    </svg>
  );
}

function PlateMap({
  plates,
  selectedId,
  onSelect,
  da,
}: {
  plates: TectonicPlate[];
  selectedId: string;
  onSelect: (id: string) => void;
  da: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="mx-auto h-auto w-full max-w-lg touch-manipulation"
      role="img"
      aria-label={da ? "Tektoniske plader" : "Tectonic plates"}
    >
      <rect width="100" height="100" rx="2" className="fill-muted/15" />
      {/* Rough continents */}
      <ellipse cx="28" cy="35" rx="14" ry="12" className="fill-muted/25" />
      <ellipse cx="36" cy="62" rx="10" ry="16" className="fill-muted/25" />
      <ellipse cx="55" cy="38" rx="18" ry="12" className="fill-muted/25" />
      <ellipse cx="55" cy="58" rx="12" ry="14" className="fill-muted/25" />
      <ellipse cx="75" cy="55" rx="12" ry="10" className="fill-muted/25" />
      <ellipse cx="50" cy="88" rx="22" ry="8" className="fill-muted/20" />

      {PLATES.map((p) => {
        const active = p.id === selectedId;
        const dimmed = plates.length > 0 && !plates.some((x) => x.id === p.id);
        return (
          <g key={p.id} opacity={dimmed ? 0.25 : 1}>
            <circle
              cx={p.mx}
              cy={p.my}
              r={active ? 4.5 : 3.2}
              fill={active ? "var(--accent, #5b8def)" : "#d97757"}
              stroke="var(--background, #fff)"
              strokeWidth={0.6}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={da ? p.nameDa : p.nameEn}
              onClick={() => onSelect(p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(p.id);
                }
              }}
            />
            {active ? (
              <text
                x={p.mx}
                y={p.my - 6}
                textAnchor="middle"
                style={{ fontSize: 3.2 }}
                className="fill-foreground"
                pointerEvents="none"
              >
                {da ? p.nameDa : p.nameEn}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function TektonikTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [mode, setMode] = useState<Mode>("layers");
  const [query, setQuery] = useState("");
  const [layerId, setLayerId] = useState(LAYERS[0]!.id);
  const [plateId, setPlateId] = useState(PLATES[0]!.id);
  const detailRef = useRef<HTMLElement>(null);

  const filteredPlates = useMemo(
    () => PLATES.filter((p) => matchesPlate(p, query)),
    [query],
  );

  const selectedLayer =
    LAYERS.find((l) => l.id === layerId) ?? LAYERS[0]!;
  const selectedPlate =
    PLATES.find((p) => p.id === plateId) ??
    filteredPlates[0] ??
    PLATES[0]!;

  function selectLayer(id: string) {
    setLayerId(id);
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function selectPlate(id: string) {
    setPlateId(id);
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  return (
    <div className="kit-tool mx-auto max-w-4xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Se Jordens lag i et skematisk tværsnit, eller udforsk større tektoniske plader med grænsetyper og eksempler på skælv og vulkaner."
          : "View Earth’s layers in a schematic cross-section, or explore major tectonic plates with boundary types and quake or volcano examples."}
      </p>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <Segmented
          value={mode}
          onChange={setMode}
          ariaLabel={da ? "Tilstand" : "Mode"}
          options={[
            { id: "layers", label: da ? "Lag" : "Layers" },
            { id: "plates", label: da ? "Plader" : "Plates" },
          ]}
        />
        {mode === "plates" ? (
          <Field label={da ? "Søg" : "Search"}>
            <KitInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={da ? "Plade eller region" : "Plate or region"}
              aria-label={da ? "Søg plader" : "Search plates"}
            />
          </Field>
        ) : null}
      </div>

      {mode === "layers" ? (
        <>
          <section className="kit-tool-panel space-y-3 p-3 sm:p-5">
            <CrossSection
              selectedId={selectedLayer.id}
              onSelect={selectLayer}
              da={da}
            />
            <p className="text-xs text-muted">
              {da
                ? "Ringene er ikke i sand skala. Skorpen er forstørret, så den kan ses."
                : "Rings are not true scale. The crust is enlarged so it stays visible."}
            </p>
            <div className="kit-h-scroll gap-2">
              {LAYERS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => selectLayer(l.id)}
                  className={`kit-touch-target shrink-0 rounded-[8px] border px-2.5 py-1.5 text-xs sm:min-h-0 ${
                    l.id === selectedLayer.id
                      ? "border-accent bg-accent-soft text-foreground"
                      : "border-border bg-background text-muted hover:text-foreground"
                  }`}
                >
                  <span
                    className="mr-1.5 inline-block h-2 w-2 rounded-full"
                    style={{ background: l.color }}
                    aria-hidden
                  />
                  {da ? l.nameDa : l.nameEn}
                </button>
              ))}
            </div>
          </section>

          <section ref={detailRef} className="kit-tool-panel space-y-4 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-8 w-8 shrink-0 rounded-full border border-border"
                style={{ background: selectedLayer.color }}
                aria-hidden
              />
              <h2 className="text-lg font-semibold text-foreground">
                {da ? selectedLayer.nameDa : selectedLayer.nameEn}
              </h2>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? "Tykkelse (ca.)" : "Thickness (approx.)"}
                </dt>
                <dd className="mt-0.5 text-sm tabular-nums text-foreground">
                  {selectedLayer.thicknessKm.toLocaleString(da ? "da-DK" : "en-US")}{" "}
                  km
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? "Fakta" : "Fact"}
                </dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
                  {da ? selectedLayer.factDa : selectedLayer.factEn}
                </dd>
              </div>
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="kit-tool-panel space-y-3 p-3 sm:p-5">
            <PlateMap
              plates={filteredPlates}
              selectedId={selectedPlate.id}
              onSelect={selectPlate}
              da={da}
            />
            <p className="text-xs text-muted">
              {da
                ? "Punkterne er skematiske midtpunkter, ikke præcise pladegrænser."
                : "Dots are schematic centers, not precise plate boundaries."}
            </p>
            <div className="kit-h-scroll gap-2">
              {(filteredPlates.length ? filteredPlates : PLATES).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPlate(p.id)}
                  className={`kit-touch-target shrink-0 rounded-[8px] border px-2.5 py-1.5 text-xs sm:min-h-0 ${
                    p.id === selectedPlate.id
                      ? "border-accent bg-accent-soft text-foreground"
                      : "border-border bg-background text-muted hover:text-foreground"
                  }`}
                >
                  {da ? p.nameDa : p.nameEn}
                </button>
              ))}
            </div>
          </section>

          <section ref={detailRef} className="kit-tool-panel space-y-4 p-4 sm:p-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {da ? selectedPlate.nameDa : selectedPlate.nameEn}
              </h2>
              <p className="text-xs text-muted">
                {boundaryLabel(selectedPlate.boundary, da)}
              </p>
            </div>
            <dl className="grid gap-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? "Grænser" : "Boundaries"}
                </dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
                  {da ? selectedPlate.boundaryDa : selectedPlate.boundaryEn}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? "Eksempler" : "Examples"}
                </dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
                  {da ? selectedPlate.exampleDa : selectedPlate.exampleEn}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? "Fakta" : "Fact"}
                </dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
                  {da ? selectedPlate.factDa : selectedPlate.factEn}
                </dd>
              </div>
            </dl>
            <div className="kit-h-scroll gap-2">
              {(
                [
                  ["divergent", da ? "Divergerende" : "Divergent"],
                  ["convergent", da ? "Konvergent" : "Convergent"],
                  ["transform", "Transform"],
                  ["mixed", da ? "Blandet" : "Mixed"],
                ] as const
              ).map(([id, label]) => (
                <span
                  key={id}
                  className={`${secondaryBtnClass} pointer-events-none opacity-80 ${
                    selectedPlate.boundary === id
                      ? "border-accent bg-accent-soft"
                      : ""
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
