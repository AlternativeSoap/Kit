"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import {
  Field,
  KitInput,
  Segmented,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  BOUNDARY_FILL,
  LAYERS,
  PLATES,
  boundaryLabel,
  matchesPlate,
  type BoundaryType,
  type EarthLayer,
} from "./earth";

const PlateWorldMap = dynamic(
  () => import("./PlateWorldMap").then((m) => ({ default: m.PlateWorldMap })),
  {
    ssr: false,
    loading: () => (
      <div className="kit-map-frame-tall flex items-center justify-center rounded-[14px] border border-border text-sm text-muted">
        OpenStreetMap…
      </div>
    ),
  },
);

type Mode = "layers" | "plates";

const BOUNDARY_ORDER: BoundaryType[] = [
  "divergent",
  "convergent",
  "transform",
  "mixed",
];

function layerGradientId(id: string) {
  return `tek-layer-${id}`;
}

function CrossSection({
  selectedId,
  onSelect,
  da,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  da: boolean;
}) {
  const cx = 210;
  const cy = 210;
  const maxR = 168;
  const thicknessVisual = [20, 78, 52, 40];
  let r = maxR;
  const bands: { layer: EarthLayer; outer: number; inner: number }[] = [];
  for (let i = 0; i < LAYERS.length; i++) {
    const outer = r;
    const inner = i === LAYERS.length - 1 ? 0 : r - thicknessVisual[i]!;
    bands.push({ layer: LAYERS[i]!, outer, inner: Math.max(0, inner) });
    r = Math.max(0, inner);
  }

  const selected =
    bands.find((b) => b.layer.id === selectedId) ?? bands[0]!;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)] lg:items-stretch">
      <svg
        viewBox="0 0 420 420"
        className="h-auto w-full touch-manipulation rounded-[14px]"
        role="img"
        aria-label={da ? "Jordens lag i tværsnit" : "Earth layers cross-section"}
      >
        <defs>
          <radialGradient id="tek-space" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#1a2744" />
            <stop offset="100%" stopColor="#0b1220" />
          </radialGradient>
          <radialGradient id="tek-atmosphere" cx="50%" cy="50%" r="50%">
            <stop offset="78%" stopColor="rgba(120,180,255,0)" />
            <stop offset="92%" stopColor="rgba(120,180,255,0.22)" />
            <stop offset="100%" stopColor="rgba(120,180,255,0)" />
          </radialGradient>
          <radialGradient id={layerGradientId("crust")} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e8d4b0" />
            <stop offset="100%" stopColor="#b8956a" />
          </radialGradient>
          <radialGradient id={layerGradientId("mantle")} cx="45%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#d07045" />
            <stop offset="100%" stopColor="#7a3018" />
          </radialGradient>
          <radialGradient id={layerGradientId("outer-core")} cx="45%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#ffc14a" />
            <stop offset="100%" stopColor="#c87510" />
          </radialGradient>
          <radialGradient id={layerGradientId("inner-core")} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fff1a8" />
            <stop offset="100%" stopColor="#e0a820" />
          </radialGradient>
          <filter id="tek-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="tek-half">
            <rect x={cx} y={cy - maxR - 20} width={maxR + 40} height={(maxR + 20) * 2} />
          </clipPath>
        </defs>

        <rect width={420} height={420} fill="url(#tek-space)" />

        {[
          [36, 40],
          [60, 70],
          [380, 50],
          [400, 90],
          [50, 380],
          [390, 370],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 2 === 0 ? 1.1 : 0.7}
            fill="rgba(255,255,255,0.55)"
          />
        ))}

        <circle cx={cx} cy={cy} r={maxR + 18} fill="url(#tek-atmosphere)" />

        {/* Full globe rings */}
        {[...bands].reverse().map(({ layer, outer }) => {
          const isSelected = layer.id === selectedId;
          return (
            <circle
              key={layer.id}
              cx={cx}
              cy={cy}
              r={outer}
              fill={`url(#${layerGradientId(layer.id)})`}
              stroke={isSelected ? "#fff8e7" : "rgba(0,0,0,0.28)"}
              strokeWidth={isSelected ? 3.5 : 1}
              filter={isSelected ? "url(#tek-glow)" : undefined}
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

        {/* Right half: cutaway faces filled with the same layers */}
        <g clipPath="url(#tek-half)" pointerEvents="none">
          <rect
            x={cx}
            y={cy - maxR - 20}
            width={maxR + 40}
            height={(maxR + 20) * 2}
            fill="url(#tek-space)"
          />
          {[...bands].reverse().map(({ layer, outer, inner }) => {
            const d =
              inner <= 0.5
                ? `M ${cx} ${cy - outer}
                   A ${outer} ${outer} 0 0 1 ${cx} ${cy + outer}
                   Z`
                : `M ${cx} ${cy - outer}
                   A ${outer} ${outer} 0 0 1 ${cx} ${cy + outer}
                   L ${cx} ${cy + inner}
                   A ${inner} ${inner} 0 0 0 ${cx} ${cy - inner}
                   Z`;
            return (
              <path
                key={`face-${layer.id}`}
                d={d}
                fill={`url(#${layerGradientId(layer.id)})`}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth={0.8}
                opacity={layer.id === selectedId ? 1 : 0.92}
              />
            );
          })}
          <line
            x1={cx}
            y1={cy - maxR}
            x2={cx}
            y2={cy + maxR}
            stroke="rgba(255,248,231,0.55)"
            strokeWidth={2}
          />
        </g>

        <text
          x={24}
          y={32}
          fill="rgba(255,255,255,0.7)"
          style={{ fontSize: 13, fontWeight: 600 }}
        >
          {da ? "Tværsnit" : "Cutaway"}
        </text>
      </svg>

      <div className="flex flex-col justify-center gap-2 rounded-[14px] border border-border bg-surface p-3 sm:p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {da ? "Lag (klik for at vælge)" : "Layers (click to select)"}
        </p>
        {bands.map(({ layer, outer, inner }) => {
          const active = layer.id === selectedId;
          const depthMid = Math.round(
            ((maxR - (outer + inner) / 2) / maxR) * 6371,
          );
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onSelect(layer.id)}
              className={`kit-touch-target flex w-full items-start gap-3 rounded-[10px] border px-3 py-2.5 text-left transition-colors sm:min-h-0 ${
                active
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-background hover:bg-overlay"
              }`}
            >
              <span
                className="mt-0.5 inline-block h-8 w-8 shrink-0 rounded-full border border-black/10"
                style={{
                  background: `radial-gradient(circle at 35% 30%, #fff6, transparent 45%), ${layer.color}`,
                }}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  {da ? layer.nameDa : layer.nameEn}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  ≈ {layer.thicknessKm.toLocaleString(da ? "da-DK" : "en-US")} km
                  {da ? " tyk" : " thick"}
                  {" · "}
                  {da ? "ca. dybde" : "about"} {depthMid.toLocaleString(da ? "da-DK" : "en-US")} km
                </span>
              </span>
            </button>
          );
        })}
        <p className="pt-1 text-xs text-muted">
          {da
            ? "Højre halvdel viser snitfladen. Skorpen er forstørret, så den kan ses."
            : "The right half shows the cut face. The crust is enlarged so it stays visible."}
        </p>
      </div>
    </div>
  );
}

function BoundaryLegend({ da }: { da: boolean }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
      {BOUNDARY_ORDER.map((id) => (
        <li key={id} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-[3px] border border-border"
            style={{ background: BOUNDARY_FILL[id] }}
            aria-hidden
          />
          {boundaryLabel(id, da)}
        </li>
      ))}
    </ul>
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
          ? "Se Jordens lag i et skåret tværsnit, eller find pladerne på et verdenskort farvet efter grænsetype."
          : "See Earth's layers in a cutaway section, or find plates on a world map colored by boundary type."}
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
          <section className="kit-tool-panel p-3 sm:p-4">
            <CrossSection
              selectedId={selectedLayer.id}
              onSelect={selectLayer}
              da={da}
            />
          </section>

          <section ref={detailRef} className="kit-tool-panel space-y-4 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-10 w-10 shrink-0 rounded-full border border-border shadow-inner"
                style={{
                  background: `radial-gradient(circle at 35% 30%, #fff6, transparent 45%), ${selectedLayer.color}`,
                }}
                aria-hidden
              />
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {da ? selectedLayer.nameDa : selectedLayer.nameEn}
                </h2>
                <p className="text-xs text-muted">
                  {da ? "Klik en ring i snittet for at skifte lag." : "Click a ring in the cutaway to change layer."}
                </p>
              </div>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[10px] border border-border bg-background/60 px-3 py-2.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? "Tykkelse (ca.)" : "Thickness (approx.)"}
                </dt>
                <dd className="mt-1 text-base tabular-nums text-foreground">
                  {selectedLayer.thicknessKm.toLocaleString(da ? "da-DK" : "en-US")}{" "}
                  km
                </dd>
              </div>
              <div className="rounded-[10px] border border-border bg-background/60 px-3 py-2.5 sm:col-span-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? "Placering" : "Position"}
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {selectedLayer.id === "crust"
                    ? da
                      ? "Yderst"
                      : "Outermost"
                    : selectedLayer.id === "inner-core"
                      ? da
                        ? "Inderst"
                        : "Innermost"
                      : da
                        ? "Mellem lag"
                        : "Middle layer"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? "Fakta" : "Fact"}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-foreground">
                  {da ? selectedLayer.factDa : selectedLayer.factEn}
                </dd>
              </div>
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="kit-tool-panel space-y-3 p-3 sm:p-4">
            <PlateWorldMap
              plates={filteredPlates}
              selectedId={selectedPlate.id}
              onSelect={selectPlate}
              da={da}
            />
            <div className="space-y-2">
              <BoundaryLegend da={da} />
              <p className="text-xs text-muted">
                {da
                  ? "Baggrundskortet er OpenStreetMap. Farvede flader er skematiske plader til undervisning. Grænserne er ikke præcise geologiske kort."
                  : "The base map is OpenStreetMap. Colored regions are schematic teaching plates. Boundaries are not precise geologic maps."}
              </p>
            </div>
            <div className="kit-h-scroll gap-2 px-1">
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
                  <span
                    className="mr-1.5 inline-block h-2.5 w-2.5 rounded-[3px]"
                    style={{ background: BOUNDARY_FILL[p.boundary] }}
                    aria-hidden
                  />
                  {da ? p.nameDa : p.nameEn}
                </button>
              ))}
            </div>
          </section>

          <section ref={detailRef} className="kit-tool-panel space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {da ? selectedPlate.nameDa : selectedPlate.nameEn}
                </h2>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-[3px]"
                    style={{ background: BOUNDARY_FILL[selectedPlate.boundary] }}
                    aria-hidden
                  />
                  {boundaryLabel(selectedPlate.boundary, da)}
                </p>
              </div>
            </div>
            <dl className="grid gap-3">
              <div className="rounded-[10px] border border-border bg-background/60 px-3 py-2.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? "Grænser" : "Boundaries"}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-foreground">
                  {da ? selectedPlate.boundaryDa : selectedPlate.boundaryEn}
                </dd>
              </div>
              <div className="rounded-[10px] border border-border bg-background/60 px-3 py-2.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? "Eksempler" : "Examples"}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-foreground">
                  {da ? selectedPlate.exampleDa : selectedPlate.exampleEn}
                </dd>
              </div>
              <div className="rounded-[10px] border border-border bg-background/60 px-3 py-2.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? "Fakta" : "Fact"}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-foreground">
                  {da ? selectedPlate.factDa : selectedPlate.factEn}
                </dd>
              </div>
            </dl>
          </section>
        </>
      )}
    </div>
  );
}
