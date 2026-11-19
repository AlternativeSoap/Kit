"use client";

import { useMemo, useRef, useState } from "react";
import {
  Field,
  KitInput,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  CONSTELLATIONS,
  STARS,
  constellationOf,
  matchesStar,
  projectStar,
  type Star,
} from "./stars";

const SIZE = 420;

function starRadius(mag: number): number {
  return Math.max(1.4, Math.min(6.5, 5.2 - mag * 0.9));
}

function SkyMap({
  stars,
  selectedId,
  showLines,
  showLabels,
  onSelect,
  da,
}: {
  stars: Star[];
  selectedId: string;
  showLines: boolean;
  showLabels: boolean;
  onSelect: (id: string) => void;
  da: boolean;
}) {
  const byId = useMemo(() => {
    const m = new Map<string, Star>();
    for (const s of STARS) m.set(s.id, s);
    return m;
  }, []);

  const projected = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    for (const s of STARS) {
      const p = projectStar(s, SIZE);
      m.set(s.id, { x: p.x, y: p.y });
    }
    return m;
  }, []);

  const visibleSet = useMemo(
    () => new Set(stars.map((s) => s.id)),
    [stars],
  );

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto h-auto w-full max-w-lg touch-manipulation"
      role="img"
      aria-label={da ? "Nordlig nattehimmel" : "Northern night sky"}
    >
      <defs>
        <radialGradient id="skyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a2240" />
          <stop offset="100%" stopColor="#070a14" />
        </radialGradient>
      </defs>
      <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 2} fill="url(#skyGlow)" />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={SIZE / 2 - 2}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1}
      />

      {showLines
        ? CONSTELLATIONS.map((c) => (
            <g key={`lines-${c.id}`}>
              {c.lines.map(([a, b], i) => {
                const pa = projected.get(a);
                const pb = projected.get(b);
                if (!pa || !pb) return null;
                const dim =
                  !visibleSet.has(a) && !visibleSet.has(b) ? 0.12 : 0.35;
                return (
                  <line
                    key={`${c.id}-${i}`}
                    x1={pa.x}
                    y1={pa.y}
                    x2={pb.x}
                    y2={pb.y}
                    stroke="rgba(180,200,255,1)"
                    strokeOpacity={dim}
                    strokeWidth={1}
                  />
                );
              })}
            </g>
          ))
        : null}

      {showLabels
        ? CONSTELLATIONS.map((c) => {
            const pts = c.lines
              .flatMap(([a, b]) => [a, b])
              .map((id) => projected.get(id))
              .filter((p): p is { x: number; y: number } => Boolean(p));
            if (!pts.length) return null;
            const x = pts.reduce((s, p) => s + p.x, 0) / pts.length;
            const y = pts.reduce((s, p) => s + p.y, 0) / pts.length - 8;
            return (
              <text
                key={`lbl-${c.id}`}
                x={x}
                y={y}
                textAnchor="middle"
                className="fill-white/45"
                style={{ fontSize: 9 }}
                pointerEvents="none"
              >
                {da ? c.nameDa : c.nameEn}
              </text>
            );
          })
        : null}

      {STARS.map((star) => {
        const p = projected.get(star.id);
        if (!p) return null;
        const inFilter = visibleSet.has(star.id);
        const selected = star.id === selectedId;
        const r = starRadius(star.mag);
        const name = da ? star.nameDa : star.nameEn;
        return (
          <g key={star.id} opacity={inFilter ? 1 : 0.18}>
            {selected ? (
              <circle
                cx={p.x}
                cy={p.y}
                r={r + 5}
                fill="none"
                stroke="var(--accent, #5b8def)"
                strokeWidth={1.5}
              />
            ) : null}
            <circle
              cx={p.x}
              cy={p.y}
              r={r}
              fill={selected ? "#fff8e7" : "#e8eefc"}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={name}
              onClick={() => onSelect(star.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(star.id);
                }
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function StjernekortTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [query, setQuery] = useState("");
  const [showLines, setShowLines] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedId, setSelectedId] = useState("polaris");
  const detailRef = useRef<HTMLElement>(null);

  const filtered = useMemo(
    () => STARS.filter((s) => matchesStar(s, query)),
    [query],
  );

  const selected =
    STARS.find((s) => s.id === selectedId) ?? filtered[0] ?? STARS[0]!;
  const constellation = constellationOf(selected);

  function select(id: string) {
    setSelectedId(id);
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  const namedBright = filtered.filter((s) => s.mag <= 2.5);

  return (
    <div className="kit-tool mx-auto max-w-4xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Forenklet nordlig nattehimmel med klare stjerner og større stjernebilleder. Søg eller tryk på et objekt for magnitude, stjernebillede og en kort myte eller fakta."
          : "A simplified northern night sky with bright stars and major constellations. Search or tap an object for magnitude, constellation, and a short myth or fact."}
      </p>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <Field label={da ? "Søg" : "Search"}>
          <KitInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={da ? "Stjerne eller stjernebillede" : "Star or constellation"}
            aria-label={da ? "Søg stjerner" : "Search stars"}
          />
        </Field>
        <div className="kit-h-scroll gap-2">
          <button
            type="button"
            className={`${secondaryBtnClass} ${showLines ? "border-accent bg-accent-soft" : ""}`}
            onClick={() => setShowLines((v) => !v)}
          >
            {da ? "Linjer" : "Lines"}
          </button>
          <button
            type="button"
            className={`${secondaryBtnClass} ${showLabels ? "border-accent bg-accent-soft" : ""}`}
            onClick={() => setShowLabels((v) => !v)}
          >
            {da ? "Navne" : "Labels"}
          </button>
        </div>
      </div>

      <section className="kit-tool-panel space-y-3 p-3 sm:p-5">
        <SkyMap
          stars={filtered}
          selectedId={selected.id}
          showLines={showLines}
          showLabels={showLabels}
          onSelect={select}
          da={da}
        />
        <p className="text-xs text-muted">
          {da
            ? "Projektionen er forenklet for nordlige himmelstrøg. Sydlige objekter ligger nær kanten og kan være lavt eller under horisonten fra Danmark."
            : "The projection is simplified for northern skies. Southern objects sit near the rim and may be low or below the horizon from mid-northern latitudes."}
        </p>
        <div className="kit-h-scroll gap-2">
          {(namedBright.length ? namedBright : filtered).slice(0, 28).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => select(s.id)}
              className={`kit-touch-target shrink-0 rounded-[8px] border px-2.5 py-1.5 text-xs sm:min-h-0 ${
                s.id === selected.id
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-border bg-background text-muted hover:text-foreground"
              }`}
            >
              {da ? s.nameDa : s.nameEn}
            </button>
          ))}
        </div>
      </section>

      <section ref={detailRef} className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {da ? selected.nameDa : selected.nameEn}
          </h2>
          <p className="text-xs text-muted">
            {constellation
              ? da
                ? constellation.nameDa
                : constellation.nameEn
              : da
                ? "Uden for de viste stjernebilleder"
                : "Outside the charted constellations"}
          </p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {da ? "Magnitude" : "Magnitude"}
            </dt>
            <dd className="mt-0.5 text-sm tabular-nums text-foreground">
              {selected.mag.toLocaleString(da ? "da-DK" : "en-US", {
                maximumFractionDigits: 2,
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {da ? "Deklination" : "Declination"}
            </dt>
            <dd className="mt-0.5 text-sm tabular-nums text-foreground">
              {selected.dec.toLocaleString(da ? "da-DK" : "en-US", {
                maximumFractionDigits: 1,
              })}
              °
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
          {constellation ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Stjernebillede" : "Constellation"}
              </dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
                {da ? constellation.mythDa : constellation.mythEn}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>
    </div>
  );
}
