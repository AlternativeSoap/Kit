"use client";

import { useMemo, useRef, useState } from "react";
import {
  Field,
  KitInput,
  KitSelect,
  Segmented,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  BODIES,
  EXTRAS,
  PLANETS,
  formatDay,
  formatMass,
  type Body,
  type BodyId,
} from "./bodies";

type Mode = "explore" | "weight";
type Scale = "schematic" | "true";

function OrbitDiagram({
  selectedId,
  scale,
  showExtras,
  onSelect,
  da,
}: {
  selectedId: BodyId;
  scale: Scale;
  showExtras: boolean;
  onSelect: (id: BodyId) => void;
  da: boolean;
}) {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;

  const orbitBodies = useMemo(() => {
    const list: Body[] = [BODIES.find((b) => b.id === "sun")!, ...PLANETS];
    if (showExtras) {
      for (const e of EXTRAS) list.push(e);
    }
    return list;
  }, [showExtras]);

  const maxAu = Math.max(...orbitBodies.map((b) => b.distanceAu), 1);

  function orbitRadius(body: Body): number {
    if (body.id === "sun") return 0;
    if (scale === "schematic") {
      const idx = body.orbitIndex || 1;
      return 28 + idx * 28;
    }
    const minR = 36;
    const maxR = 165;
    return minR + (Math.sqrt(body.distanceAu) / Math.sqrt(maxAu)) * (maxR - minR);
  }

  function bodySize(body: Body): number {
    if (body.id === "sun") return 18;
    if (scale === "schematic") {
      if (body.kind === "moon" || body.kind === "dwarf") return 5;
      if (body.id === "jupiter" || body.id === "saturn") return 10;
      if (body.id === "uranus" || body.id === "neptune") return 8;
      return 6;
    }
    const earthR = 6371;
    return Math.max(3, Math.min(16, (body.radiusKm / earthR) * 4));
  }

  const angles: Record<string, number> = {
    sun: 0,
    mercury: -0.4,
    venus: 0.9,
    earth: -1.2,
    moon: -1.0,
    mars: 2.1,
    jupiter: 0.35,
    saturn: -2.4,
    uranus: 1.6,
    neptune: -0.8,
    pluto: 2.8,
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-auto w-full max-w-md touch-manipulation"
      role="img"
      aria-label={da ? "Solsystemets kredsløb" : "Solar system orbits"}
    >
      <circle cx={cx} cy={cy} r={size / 2 - 4} fill="var(--background, #0b0d12)" className="fill-background" />
      {PLANETS.map((p) => {
        const r = orbitRadius(p);
        return (
          <circle
            key={`orbit-${p.id}`}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={1}
            className="text-muted"
          />
        );
      })}
      {showExtras
        ? EXTRAS.filter((e) => e.kind === "dwarf").map((p) => (
            <circle
              key={`orbit-${p.id}`}
              cx={cx}
              cy={cy}
              r={orbitRadius(p)}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.12}
              strokeWidth={1}
              strokeDasharray="3 4"
              className="text-muted"
            />
          ))
        : null}
      {orbitBodies.map((body) => {
        const r = orbitRadius(body);
        const ang = angles[body.id] ?? 0;
        const x = body.id === "sun" ? cx : cx + Math.cos(ang) * r;
        const y = body.id === "sun" ? cy : cy + Math.sin(ang) * r;
        const rad = bodySize(body);
        const selected = body.id === selectedId;
        const label = da ? body.nameDa : body.nameEn;
        return (
          <g key={body.id}>
            <circle
              cx={x}
              cy={y}
              r={rad + (selected ? 4 : 0)}
              fill="none"
              stroke={selected ? "var(--accent, #5b8def)" : "transparent"}
              strokeWidth={2}
            />
            <circle
              cx={x}
              cy={y}
              r={rad}
              fill={body.color}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth={1}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={label}
              onClick={() => onSelect(body.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(body.id);
                }
              }}
            />
            {body.id === "saturn" ? (
              <ellipse
                cx={x}
                cy={y}
                rx={rad + 6}
                ry={rad * 0.35}
                fill="none"
                stroke={body.color}
                strokeOpacity={0.7}
                strokeWidth={1.5}
                pointerEvents="none"
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function SolsystemTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [mode, setMode] = useState<Mode>("explore");
  const [scale, setScale] = useState<Scale>("schematic");
  const [showExtras, setShowExtras] = useState(true);
  const [selectedId, setSelectedId] = useState<BodyId>("earth");
  const [earthKg, setEarthKg] = useState("70");
  const detailRef = useRef<HTMLElement>(null);

  const selected = useMemo(
    () => BODIES.find((b) => b.id === selectedId) ?? BODIES[3]!,
    [selectedId],
  );

  const kg = Number(String(earthKg).replace(",", "."));
  const weightOk = Number.isFinite(kg) && kg >= 0;

  function select(id: BodyId) {
    setSelectedId(id);
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  return (
    <div className="kit-tool mx-auto max-w-4xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Udforsk Solen, planeterne og et par ekstra legemer. Klik på et objekt for fakta, eller beregn din vægt på en anden verden."
          : "Explore the Sun, planets, and a few extras. Click a body for facts, or calculate your weight on another world."}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={mode}
          onChange={setMode}
          ariaLabel={da ? "Tilstand" : "Mode"}
          options={[
            { id: "explore", label: da ? "Udforsk" : "Explore" },
            { id: "weight", label: da ? "Vægt" : "Weight" },
          ]}
        />
        <div className="kit-h-scroll gap-2">
          <button
            type="button"
            className={secondaryBtnClass}
            onClick={() =>
              setScale((s) => (s === "schematic" ? "true" : "schematic"))
            }
          >
            {scale === "schematic"
              ? da
                ? "Skematisk skala"
                : "Schematic scale"
              : da
                ? "Sand afstand"
                : "True distance"}
          </button>
          <button
            type="button"
            className={secondaryBtnClass}
            onClick={() => setShowExtras((v) => !v)}
          >
            {showExtras
              ? da
                ? "Skjul Måne/Pluto"
                : "Hide Moon/Pluto"
              : da
                ? "Vis Måne/Pluto"
                : "Show Moon/Pluto"}
          </button>
        </div>
      </div>

      <section className="kit-tool-panel space-y-3 p-3 sm:p-5">
        <OrbitDiagram
          selectedId={selectedId}
          scale={scale}
          showExtras={showExtras}
          onSelect={select}
          da={da}
        />
        <p className="text-xs text-muted">
          {scale === "schematic"
            ? da
              ? "Kredsløb er jævnt fordelt for overblik. Tryk på et objekt for detaljer."
              : "Orbits are evenly spaced for clarity. Tap a body for details."
            : da
              ? "Afstande følger kvadratroden af AU, så ydre planeter stadig kan ses."
              : "Distances follow the square root of AU so outer planets stay visible."}
        </p>
        <div className="kit-h-scroll gap-2">
          {BODIES.filter(
            (b) =>
              b.kind === "star" ||
              b.kind === "planet" ||
              (showExtras && (b.kind === "moon" || b.kind === "dwarf")),
          ).map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => select(b.id)}
              className={`kit-touch-target shrink-0 rounded-[8px] border px-2.5 py-1.5 text-xs sm:min-h-0 ${
                b.id === selectedId
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-border bg-background text-muted hover:text-foreground"
              }`}
            >
              {da ? b.nameDa : b.nameEn}
            </button>
          ))}
        </div>
      </section>

      {mode === "explore" ? (
        <section
          ref={detailRef}
          className="kit-tool-panel space-y-4 p-4 sm:p-5"
        >
          <div className="flex items-center gap-3">
            <span
              className="inline-block h-8 w-8 shrink-0 rounded-full border border-border"
              style={{ background: selected.color }}
              aria-hidden
            />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {da ? selected.nameDa : selected.nameEn}
              </h2>
              <p className="text-xs capitalize text-muted">
                {selected.kind === "star"
                  ? da
                    ? "Stjerne"
                    : "Star"
                  : selected.kind === "planet"
                    ? da
                      ? "Planet"
                      : "Planet"
                    : selected.kind === "moon"
                      ? da
                        ? "Måne"
                        : "Moon"
                      : da
                        ? "Dværgplanet"
                        : "Dwarf planet"}
              </p>
            </div>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {selected.id === "moon"
                  ? da
                    ? "Afstand fra Solen (ca.)"
                    : "Distance from Sun (approx.)"
                  : da
                    ? "Afstand fra Solen"
                    : "Distance from Sun"}
              </dt>
              <dd className="mt-0.5 text-sm tabular-nums text-foreground">
                {selected.distanceAu === 0
                  ? da
                    ? "Centrum"
                    : "Center"
                  : `${selected.distanceAu.toLocaleString(da ? "da-DK" : "en-US", {
                      maximumFractionDigits: 3,
                    })} AU`}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Radius" : "Radius"}
              </dt>
              <dd className="mt-0.5 text-sm tabular-nums text-foreground">
                {selected.radiusKm.toLocaleString(da ? "da-DK" : "en-US")} km
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Masse" : "Mass"}
              </dt>
              <dd className="mt-0.5 text-sm text-foreground">
                {formatMass(selected, da)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Døgnlængde" : "Day length"}
              </dt>
              <dd className="mt-0.5 text-sm text-foreground">
                {formatDay(selected.dayHours, da)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Måner" : "Moons"}
              </dt>
              <dd className="mt-0.5 text-sm tabular-nums text-foreground">
                {selected.moons}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Tyngde (× Jorden)" : "Gravity (× Earth)"}
              </dt>
              <dd className="mt-0.5 text-sm tabular-nums text-foreground">
                {selected.gravityG.toLocaleString(da ? "da-DK" : "en-US", {
                  maximumFractionDigits: 2,
                })}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Fakta" : "Fact"}
              </dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
                {da ? selected.factDa : selected.factEn}
              </dd>
            </div>
          </dl>
        </section>
      ) : (
        <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
          <h2 className="text-sm font-medium text-foreground">
            {da ? "Vægt på en anden verden" : "Weight on another world"}
          </h2>
          <p className="text-sm text-muted">
            {da
              ? "Indtast din masse på Jorden i kilogram. Resultatet er den kraft du ville føle (i kg-ækvivalent)."
              : "Enter your Earth mass in kilograms. The result is the force you would feel (as kg-equivalent)."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={da ? "Masse på Jorden (kg)" : "Earth mass (kg)"}>
              <KitInput
                inputMode="decimal"
                value={earthKg}
                onChange={(e) => setEarthKg(e.target.value)}
              />
            </Field>
            <Field label={da ? "Verden" : "World"}>
              <KitSelect
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value as BodyId)}
              >
                {BODIES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {da ? b.nameDa : b.nameEn}
                  </option>
                ))}
              </KitSelect>
            </Field>
          </div>
          <div className="rounded-[12px] border border-border bg-background px-4 py-5 text-center">
            {weightOk ? (
              <>
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                  {(kg * selected.gravityG).toLocaleString(da ? "da-DK" : "en-US", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  <span className="text-lg font-medium text-muted">
                    {da ? "kg-ækv." : "kg-eq."}
                  </span>
                </p>
                <p className="mt-2 text-sm text-muted">
                  {da
                    ? `${selected.gravityG.toLocaleString("da-DK", { maximumFractionDigits: 2 })} × jordtyngde på ${selected.nameDa}.`
                    : `${selected.gravityG.toLocaleString("en-US", { maximumFractionDigits: 2 })} × Earth gravity on ${selected.nameEn}.`}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">
                {da ? "Indtast et gyldigt tal." : "Enter a valid number."}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
