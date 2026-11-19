"use client";

import { useMemo, useState } from "react";
import { Field, KitInput } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  nearbyPostnr,
  POSTNR,
  searchPostnr,
  type PostnrRow,
} from "./data";

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

const BOUNDS = { minLon: 8.0, maxLon: 15.3, minLat: 54.5, maxLat: 57.85 };

function project(lon: number, lat: number, w: number, h: number, pad = 12) {
  const x =
    pad +
    ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * (w - pad * 2);
  const y =
    pad +
    (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * (h - pad * 2);
  return { x, y };
}

function DenmarkMap({
  selected,
  nearby,
  da,
}: {
  selected: PostnrRow | null;
  nearby: PostnrRow[];
  da: boolean;
}) {
  const w = 420;
  const h = 360;
  const outline = DK_OUTLINE.map(([lon, lat], i) => {
    const p = project(lon, lat, w, h);
    return `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join(" ");

  // Bornholm as a small rectangle marker area
  const bh = project(14.9, 55.15, w, h);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full max-w-md rounded-[12px] border border-border bg-surface"
      role="img"
      aria-label={da ? "Kort over Danmark" : "Map of Denmark"}
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
      {nearby.map((r) => {
        const p = project(r.lon, r.lat, w, h);
        return (
          <circle
            key={`n-${r.nr}`}
            cx={p.x}
            cy={p.y}
            r={3.5}
            fill="currentColor"
            fillOpacity={0.35}
          />
        );
      })}
      {selected ? (
        (() => {
          const p = project(selected.lon, selected.lat, w, h);
          return (
            <g>
              <circle cx={p.x} cy={p.y} r={7} fill="var(--accent)" fillOpacity={0.25} />
              <circle cx={p.x} cy={p.y} r={4} fill="var(--accent)" />
            </g>
          );
        })()
      ) : null}
    </svg>
  );
}

export function PostnrTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PostnrRow | null>(null);
  const [showNearby, setShowNearby] = useState(true);

  const results = useMemo(() => searchPostnr(query, 30), [query]);
  const nearby = useMemo(() => {
    if (!selected || !showNearby) return [];
    return nearbyPostnr(selected, 25, 12);
  }, [selected, showNearby]);

  return (
    <div className="kit-tool mx-auto max-w-4xl space-y-5">
      <p className="text-sm text-muted">
        {da
          ? `Søg blandt ${POSTNR.length} udvalgte danske postnumre med bynavn, kommune og kort. Datasættet er et repræsentativt udsnit.`
          : `Search ${POSTNR.length} curated Danish postcodes with place name, municipality, and map. The dataset is a representative sample.`}
      </p>

      <Field label={da ? "Postnummer eller by" : "Postcode or city"}>
        <KitInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={da ? "fx 8000, Aarhus, Ribe…" : "e.g. 8000, Aarhus, Ribe…"}
          autoComplete="off"
        />
      </Field>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-3">
          <ul className="max-h-80 divide-y divide-border overflow-auto rounded-[12px] border border-border bg-surface">
            {(query.trim() ? results : POSTNR.slice(0, 12)).map((r) => (
              <li key={r.nr}>
                <button
                  type="button"
                  className={`flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-overlay ${
                    selected?.nr === r.nr ? "bg-overlay" : ""
                  }`}
                  onClick={() => {
                    setSelected(r);
                    if (!query.trim()) setQuery(r.nr);
                  }}
                >
                  <span>
                    <span className="font-medium">{r.nr}</span>{" "}
                    <span>{r.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">{r.kommune}</span>
                </button>
              </li>
            ))}
            {query.trim() && results.length === 0 ? (
              <li className="px-3 py-4 text-sm text-muted">
                {da ? "Ingen træffere." : "No matches."}
              </li>
            ) : null}
          </ul>
          {!query.trim() ? (
            <p className="text-xs text-muted">
              {da
                ? "Viser et udsnit indtil du søger. Skriv postnummer eller bynavn."
                : "Showing a sample until you search. Type a postcode or city name."}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <DenmarkMap selected={selected} nearby={nearby} da={da} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showNearby}
              onChange={(e) => setShowNearby(e.target.checked)}
              className="rounded border-border"
            />
            {da ? "Vis nærliggende (ca. 25 km)" : "Show nearby (about 25 km)"}
          </label>

          {selected ? (
            <div className="rounded-[12px] border border-border bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                {da ? "Detalje" : "Detail"}
              </p>
              <p className="mt-1 text-lg font-semibold">
                {selected.nr} {selected.name}
              </p>
              <dl className="mt-2 grid gap-1 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{da ? "Kommune" : "Municipality"}</dt>
                  <dd>{selected.kommune}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{da ? "Bredde" : "Latitude"}</dt>
                  <dd>{selected.lat.toFixed(3)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{da ? "Længde" : "Longitude"}</dt>
                  <dd>{selected.lon.toFixed(3)}</dd>
                </div>
              </dl>
              {nearby.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                    {da ? "I nærheden" : "Nearby"}
                  </p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {nearby.map((n) => (
                      <li key={n.nr}>
                        <button
                          type="button"
                          className="text-left hover:underline"
                          onClick={() => {
                            setSelected(n);
                            setQuery(n.nr);
                          }}
                        >
                          {n.nr} {n.name}
                          <span className="text-muted"> · {n.kommune}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">
              {da
                ? "Vælg et postnummer for kort og detaljer."
                : "Select a postcode for the map and details."}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted">
        {da
          ? "Koordinater er omtrentlige midtpunkter. Ikke et komplet PostNord-register."
          : "Coordinates are approximate centroids. Not a complete PostNord registry."}
      </p>
    </div>
  );
}
