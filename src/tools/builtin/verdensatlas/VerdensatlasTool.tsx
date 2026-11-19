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
  COUNTRIES,
  REGIONS,
  matchesCountry,
  popBandLabel,
  regionLabel,
  type RegionId,
} from "./countries";

type View = "list" | "map";

function WorldDots({
  countries,
  selectedId,
  onSelect,
  da,
}: {
  countries: typeof COUNTRIES;
  selectedId: string;
  onSelect: (id: string) => void;
  da: boolean;
}) {
  const visible = new Set(countries.map((c) => c.id));

  return (
    <svg
      viewBox="0 0 100 90"
      className="mx-auto h-auto w-full max-w-lg touch-manipulation"
      role="img"
      aria-label={da ? "Verdenskort med lande" : "World map with countries"}
    >
      <rect width="100" height="90" rx="2" className="fill-muted/15" />
      {/* Simplified continents */}
      <ellipse cx="22" cy="32" rx="16" ry="14" className="fill-muted/20" />
      <ellipse cx="30" cy="55" rx="11" ry="16" className="fill-muted/20" />
      <ellipse cx="52" cy="32" rx="14" ry="10" className="fill-muted/20" />
      <ellipse cx="54" cy="52" rx="12" ry="16" className="fill-muted/20" />
      <ellipse cx="72" cy="40" rx="16" ry="14" className="fill-muted/20" />
      <ellipse cx="84" cy="62" rx="10" ry="8" className="fill-muted/20" />
      <ellipse cx="50" cy="82" rx="8" ry="4" className="fill-muted/15" />

      {COUNTRIES.map((c) => {
        const active = c.id === selectedId;
        const dim = !visible.has(c.id);
        return (
          <circle
            key={c.id}
            cx={c.mx}
            cy={c.my}
            r={active ? 2.4 : 1.5}
            fill={active ? "var(--accent, #5b8def)" : "#6b8cae"}
            stroke={active ? "var(--foreground, #fff)" : "transparent"}
            strokeWidth={0.4}
            opacity={dim ? 0.2 : 1}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={da ? c.nameDa : c.nameEn}
            onClick={() => onSelect(c.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(c.id);
              }
            }}
          />
        );
      })}
    </svg>
  );
}

export function VerdensatlasTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [view, setView] = useState<View>("map");
  const [region, setRegion] = useState<RegionId | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("dk");
  const detailRef = useRef<HTMLElement>(null);

  const filtered = useMemo(() => {
    return COUNTRIES.filter((c) => {
      if (region !== "all" && c.region !== region) return false;
      return matchesCountry(c, query);
    });
  }, [region, query]);

  const selected =
    COUNTRIES.find((c) => c.id === selectedId) ??
    filtered[0] ??
    COUNTRIES[0]!;

  function select(id: string) {
    setSelectedId(id);
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  return (
    <div className="kit-tool mx-auto max-w-4xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Et udvalg af lande på tværs af kontinenter. Søg eller tryk på et punkt for hovedstad, region, valuta, befolkningsbånd og tidszoner."
          : "A curated set of countries across continents. Search or tap a point for capital, region, currency, population band, and time zones."}
      </p>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <Segmented
          value={view}
          onChange={setView}
          ariaLabel={da ? "Visning" : "View"}
          options={[
            { id: "map", label: da ? "Kort" : "Map" },
            { id: "list", label: da ? "Liste" : "List" },
          ]}
        />
        <Field label={da ? "Søg" : "Search"}>
          <KitInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={da ? "Land, hovedstad eller valuta" : "Country, capital, or currency"}
            aria-label={da ? "Søg lande" : "Search countries"}
          />
        </Field>
      </div>

      <div className="kit-h-scroll gap-2">
        {REGIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`${secondaryBtnClass} ${
              region === r.id ? "border-accent bg-accent-soft" : ""
            }`}
            onClick={() => setRegion(r.id)}
          >
            {da ? r.nameDa : r.nameEn}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="kit-tool-panel space-y-3 p-3 sm:p-4">
          {view === "map" ? (
            <WorldDots
              countries={filtered.length ? filtered : COUNTRIES}
              selectedId={selected.id}
              onSelect={select}
              da={da}
            />
          ) : null}

          {filtered.length === 0 ? (
            <p className="text-sm text-muted">
              {da ? "Ingen lande matcher søgningen." : "No countries match the search."}
            </p>
          ) : (
            <ul className="max-h-[280px] space-y-1 overflow-y-auto">
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => select(c.id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-[8px] border px-3 py-2 text-left text-sm transition-colors ${
                      c.id === selected.id
                        ? "border-accent bg-accent-soft text-foreground"
                        : "border-transparent text-muted hover:bg-overlay hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{da ? c.nameDa : c.nameEn}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted">
                      {c.currency}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted">
            {da
              ? `${COUNTRIES.length} lande i atlaset. Punkterne er skematiske, ikke grænser.`
              : `${COUNTRIES.length} countries in the atlas. Dots are schematic, not borders.`}
          </p>
        </section>

        <section ref={detailRef} className="kit-tool-panel space-y-4 p-4 sm:p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {da ? selected.nameDa : selected.nameEn}
            </h2>
            <p className="text-xs text-muted">
              {regionLabel(selected.region, da)}
            </p>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Hovedstad" : "Capital"}
              </dt>
              <dd className="mt-0.5 text-sm text-foreground">
                {da ? selected.capitalDa : selected.capitalEn}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Valuta" : "Currency"}
              </dt>
              <dd className="mt-0.5 text-sm tabular-nums text-foreground">
                {selected.currency}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Befolkning (ca.)" : "Population (approx.)"}
              </dt>
              <dd className="mt-0.5 text-sm text-foreground">
                {popBandLabel(selected.popBand, da)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Region" : "Region"}
              </dt>
              <dd className="mt-0.5 text-sm text-foreground">
                {regionLabel(selected.region, da)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Tidszoner" : "Time zones"}
              </dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
                {da ? selected.tzNoteDa : selected.tzNoteEn}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
