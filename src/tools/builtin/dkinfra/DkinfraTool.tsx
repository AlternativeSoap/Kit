"use client";

import { useMemo, useState } from "react";
import { Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  CATEGORIES,
  SITES,
  categoryLabel,
  type InfraCategory,
  type InfraSite,
} from "./sites";

/** Rough mainland + islands outline in lon/lat (simplified). */
const DK_OUTLINE: [number, number][] = [
  [8.08, 55.56],
  [8.2, 56.0],
  [8.15, 56.7],
  [8.4, 57.1],
  [8.7, 57.4],
  [9.5, 57.55],
  [10.2, 57.75],
  [10.6, 57.7],
  [10.8, 57.4],
  [10.9, 56.9],
  [11.2, 56.6],
  [10.9, 56.3],
  [11.1, 55.9],
  [11.0, 55.6],
  [10.7, 55.3],
  [10.3, 55.2],
  [9.9, 54.9],
  [9.5, 54.85],
  [9.0, 54.9],
  [8.7, 55.1],
  [8.4, 55.3],
  [8.08, 55.56],
];

const BOUNDS = { minLon: 7.5, maxLon: 15.3, minLat: 54.5, maxLat: 57.85 };

function project(lon: number, lat: number, w: number, h: number, pad = 12) {
  const x =
    pad +
    ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * (w - pad * 2);
  const y =
    pad +
    (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * (h - pad * 2);
  return { x, y };
}

type FilterId = "all" | InfraCategory;

function DenmarkInfraMap({
  sites,
  selected,
  onSelect,
  da,
}: {
  sites: InfraSite[];
  selected: InfraSite | null;
  onSelect: (site: InfraSite) => void;
  da: boolean;
}) {
  const w = 420;
  const h = 360;
  const outline = DK_OUTLINE.map(([lon, lat], i) => {
    const p = project(lon, lat, w, h);
    return `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join(" ");
  const bh = project(14.9, 55.15, w, h);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full max-w-md rounded-[12px] border border-border bg-surface"
      role="img"
      aria-label={da ? "Kort over dansk infrastruktur" : "Map of Danish infrastructure"}
    >
      <path
        d={`${outline} Z`}
        fill="currentColor"
        fillOpacity={0.06}
        stroke="currentColor"
        strokeOpacity={0.25}
        strokeWidth={1.2}
      />
      <rect
        x={bh.x - 10}
        y={bh.y - 8}
        width={22}
        height={16}
        rx={3}
        fill="currentColor"
        fillOpacity={0.06}
        stroke="currentColor"
        strokeOpacity={0.25}
        strokeWidth={1}
      />
      {sites.map((site) => {
        const p = project(site.lon, site.lat, w, h);
        const active = selected?.id === site.id;
        return (
          <g key={site.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={active ? 9 : 7}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onSelect(site)}
            >
              <title>{da ? site.nameDa : site.nameEn}</title>
            </circle>
            <circle
              cx={p.x}
              cy={p.y}
              r={active ? 6 : 4}
              fill={active ? "var(--accent)" : "currentColor"}
              fillOpacity={active ? 1 : 0.45}
              className="pointer-events-none"
            />
          </g>
        );
      })}
    </svg>
  );
}

export function DkinfraTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [filter, setFilter] = useState<FilterId>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return SITES;
    return SITES.filter((s) => s.category === filter);
  }, [filter]);

  const selected =
    filtered.find((s) => s.id === selectedId) ??
    SITES.find((s) => s.id === selectedId) ??
    null;

  const filterOptions: { id: FilterId; label: string }[] = [
    { id: "all", label: da ? "Alle" : "All" },
    ...CATEGORIES.map((c) => ({
      id: c.id as FilterId,
      label: da ? c.labelDa : c.labelEn,
    })),
  ];

  return (
    <div className="kit-tool mx-auto max-w-4xl space-y-5">
      <p className="text-sm text-muted">
        {da
          ? `Udforsk ${SITES.length} udvalgte broer, havne, lufthavne, energianlæg og baneknuder. Koordinater er omtrentlige.`
          : `Explore ${SITES.length} curated bridges, ports, airports, energy sites, and rail hubs. Coordinates are approximate.`}
      </p>

      <Segmented
        value={filter}
        options={filterOptions}
        onChange={setFilter}
        ariaLabel={da ? "Kategori" : "Category"}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-3">
          <ul className="max-h-96 divide-y divide-border overflow-auto rounded-[12px] border border-border bg-surface">
            {filtered.map((site) => (
              <li key={site.id}>
                <button
                  type="button"
                  className={`flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-overlay ${
                    selected?.id === site.id ? "bg-overlay" : ""
                  }`}
                  onClick={() => setSelectedId(site.id)}
                >
                  <span className="font-medium">
                    {da ? site.nameDa : site.nameEn}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {categoryLabel(site.category, da)}
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-sm text-muted">
                {da ? "Ingen lokaliteter i denne kategori." : "No sites in this category."}
              </li>
            ) : null}
          </ul>
        </div>

        <div className="space-y-3">
          <DenmarkInfraMap
            sites={filtered}
            selected={selected}
            onSelect={(site) => setSelectedId(site.id)}
            da={da}
          />

          {selected ? (
            <div className="rounded-[12px] border border-border bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                {categoryLabel(selected.category, da)}
              </p>
              <h2 className="mt-1 font-serif text-xl tracking-tight text-foreground sm:text-2xl">
                {da ? selected.nameDa : selected.nameEn}
              </h2>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase text-muted">
                    {da ? "Hvad" : "What"}
                  </dt>
                  <dd className="mt-0.5 leading-relaxed">
                    {da ? selected.whatDa : selected.whatEn}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-muted">
                    {da ? "Hvorfor det betyder noget" : "Why it matters"}
                  </dt>
                  <dd className="mt-0.5 leading-relaxed">
                    {da ? selected.whyDa : selected.whyEn}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted">
                {selected.lat.toFixed(2)}°N, {selected.lon.toFixed(2)}°E
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted">
              {da
                ? "Vælg en lokalitet på listen eller kortet for detaljer."
                : "Select a site from the list or map for details."}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted">
        {da
          ? "Kurateret oversigt til læring. Ikke et komplet anlægsregister."
          : "Curated overview for learning. Not a complete asset registry."}
      </p>
    </div>
  );
}
