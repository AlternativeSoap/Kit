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
  BIOMES,
  CLIMATE_BANDS,
  climateLabel,
  matchesBiome,
  type ClimateBand,
  type Surface,
} from "./biomes";

type View = "list" | "map";
type SurfaceFilter = Surface | "all";

function WorldSchematic({
  biomes,
  selectedId,
  onSelect,
  da,
}: {
  biomes: typeof BIOMES;
  selectedId: string;
  onSelect: (id: string) => void;
  da: boolean;
}) {
  const visible = new Set(biomes.map((b) => b.id));

  return (
    <svg
      viewBox="0 0 100 70"
      className="mx-auto h-auto w-full max-w-lg touch-manipulation"
      role="img"
      aria-label={da ? "Verdens biomes skitse" : "World biomes sketch"}
    >
      <rect width="100" height="70" rx="2" className="fill-muted/15" />
      {/* Rough landmasses */}
      <ellipse cx="25" cy="28" rx="14" ry="12" className="fill-muted/20" />
      <ellipse cx="35" cy="48" rx="10" ry="14" className="fill-muted/20" />
      <ellipse cx="55" cy="30" rx="16" ry="11" className="fill-muted/20" />
      <ellipse cx="55" cy="48" rx="11" ry="12" className="fill-muted/20" />
      <ellipse cx="75" cy="42" rx="12" ry="10" className="fill-muted/20" />
      <ellipse cx="80" cy="55" rx="8" ry="6" className="fill-muted/20" />

      {BIOMES.map((b) => {
        const active = b.id === selectedId;
        const dim = !visible.has(b.id);
        return (
          <g key={b.id} opacity={dim ? 0.2 : 1}>
            <circle
              cx={b.mx}
              cy={b.my}
              r={active ? 4.2 : 3}
              fill={b.color}
              stroke={active ? "var(--accent, #5b8def)" : "rgba(0,0,0,0.3)"}
              strokeWidth={active ? 1.2 : 0.4}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={da ? b.nameDa : b.nameEn}
              onClick={() => onSelect(b.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(b.id);
                }
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function BiomerTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [view, setView] = useState<View>("list");
  const [climate, setClimate] = useState<ClimateBand | "all">("all");
  const [surface, setSurface] = useState<SurfaceFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(BIOMES[0]!.id);
  const detailRef = useRef<HTMLElement>(null);

  const filtered = useMemo(() => {
    return BIOMES.filter((b) => {
      if (climate !== "all" && b.climate !== climate) return false;
      if (surface !== "all" && b.surface !== surface) return false;
      return matchesBiome(b, query);
    });
  }, [climate, surface, query]);

  const selected =
    BIOMES.find((b) => b.id === selectedId) ??
    filtered[0] ??
    BIOMES[0]!;

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
          ? "Udforsk større biomes med klima, planter, dyr og trusler. Filtrér efter klima eller land og vand."
          : "Explore major biomes with climate, plants, animals, and threats. Filter by climate or land and water."}
      </p>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <Segmented
          value={view}
          onChange={setView}
          ariaLabel={da ? "Visning" : "View"}
          options={[
            { id: "list", label: da ? "Liste" : "List" },
            { id: "map", label: da ? "Kort" : "Map" },
          ]}
        />
        <Field label={da ? "Søg" : "Search"}>
          <KitInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={da ? "Biome, plante eller dyr" : "Biome, plant, or animal"}
            aria-label={da ? "Søg biomes" : "Search biomes"}
          />
        </Field>
      </div>

      <div className="kit-h-scroll gap-2">
        {CLIMATE_BANDS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`${secondaryBtnClass} ${
              climate === c.id ? "border-accent bg-accent-soft" : ""
            }`}
            onClick={() => setClimate(c.id)}
          >
            {da ? c.nameDa : c.nameEn}
          </button>
        ))}
      </div>

      <div className="kit-h-scroll gap-2">
        {(
          [
            ["all", da ? "Land og vand" : "Land and water"],
            ["land", da ? "Land" : "Land"],
            ["water", da ? "Vand" : "Water"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`${secondaryBtnClass} ${
              surface === id ? "border-accent bg-accent-soft" : ""
            }`}
            onClick={() => setSurface(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="kit-tool-panel space-y-3 p-3 sm:p-4">
          {view === "map" ? (
            <WorldSchematic
              biomes={filtered.length ? filtered : BIOMES}
              selectedId={selected.id}
              onSelect={select}
              da={da}
            />
          ) : null}

          {filtered.length === 0 ? (
            <p className="text-sm text-muted">
              {da ? "Ingen biomes matcher filtrene." : "No biomes match the filters."}
            </p>
          ) : (
            <ul className="max-h-[320px] space-y-1 overflow-y-auto">
              {filtered.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => select(b.id)}
                    className={`flex w-full items-center gap-2 rounded-[8px] border px-3 py-2 text-left text-sm transition-colors ${
                      b.id === selected.id
                        ? "border-accent bg-accent-soft text-foreground"
                        : "border-transparent text-muted hover:bg-overlay hover:text-foreground"
                    }`}
                  >
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-full"
                      style={{ background: b.color }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {da ? b.nameDa : b.nameEn}
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {climateLabel(b.climate, da)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section ref={detailRef} className="kit-tool-panel space-y-4 p-4 sm:p-5">
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
              <p className="text-xs text-muted">
                {climateLabel(selected.climate, da)}
                {" · "}
                {selected.surface === "land"
                  ? da
                    ? "Land"
                    : "Land"
                  : da
                    ? "Vand"
                    : "Water"}
              </p>
            </div>
          </div>
          <dl className="grid gap-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Temperatur" : "Temperature"}
              </dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
                {da ? selected.tempDa : selected.tempEn}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Nedbør" : "Precipitation"}
              </dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
                {da ? selected.precipDa : selected.precipEn}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Planter" : "Plants"}
              </dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
                {da ? selected.plantsDa : selected.plantsEn}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Dyr" : "Animals"}
              </dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
                {da ? selected.animalsDa : selected.animalsEn}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                {da ? "Trusler" : "Threats"}
              </dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
                {da ? selected.threatDa : selected.threatEn}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
