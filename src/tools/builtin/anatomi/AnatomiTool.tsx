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
  PARTS,
  SYSTEMS,
  matchesPart,
  type BodyPart,
  type SystemId,
} from "./parts";

type Mode = "list" | "map";

function BodySilhouette({
  system,
  parts,
  selectedId,
  onSelect,
  da,
}: {
  system: SystemId | "all";
  parts: BodyPart[];
  selectedId: string;
  onSelect: (id: string) => void;
  da: boolean;
}) {
  const hotspots = parts.filter(
    (p) => system === "all" || p.system === system,
  );

  return (
    <svg
      viewBox="0 0 100 110"
      className="mx-auto h-auto w-full max-w-[220px] touch-manipulation"
      role="img"
      aria-label={da ? "Kropssilhuet" : "Body silhouette"}
    >
      <ellipse cx="50" cy="10" rx="8" ry="9" className="fill-muted/40" />
      <path
        d="M42 18 C42 22 40 24 38 28 L32 48 C30 54 34 56 38 54 L42 42 L42 58 L36 88 C35 92 38 94 41 92 L46 68 L50 70 L54 68 L59 92 C62 94 65 92 64 88 L58 58 L58 42 L62 54 C66 56 70 54 68 48 L62 28 C60 24 58 22 58 18 Z"
        className="fill-muted/30 stroke-border"
        strokeWidth="0.6"
      />
      {hotspots.map((p) => {
        const active = p.id === selectedId;
        return (
          <g key={p.id}>
            <circle
              cx={p.hx}
              cy={p.hy}
              r={active ? 4.2 : 3.2}
              fill={active ? "var(--accent, #5b8def)" : "var(--foreground, #222)"}
              fillOpacity={active ? 1 : 0.55}
              stroke="var(--background, #fff)"
              strokeWidth="0.8"
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
          </g>
        );
      })}
    </svg>
  );
}

export function AnatomiTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [mode, setMode] = useState<Mode>("list");
  const [system, setSystem] = useState<SystemId | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(PARTS[0]?.id ?? "heart");
  const detailRef = useRef<HTMLElement>(null);

  const filtered = useMemo(() => {
    return PARTS.filter((p) => {
      if (system !== "all" && p.system !== system) return false;
      return matchesPart(p, query);
    });
  }, [system, query]);

  const selected =
    PARTS.find((p) => p.id === selectedId) ??
    filtered[0] ??
    PARTS[0]!;

  const systemLabel = (id: SystemId | "all") => {
    if (id === "all") return da ? "Alle systemer" : "All systems";
    const s = SYSTEMS.find((x) => x.id === id);
    return da ? s?.nameDa ?? id : s?.nameEn ?? id;
  };

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
          ? "Udforsk større organer og strukturer efter system. Søg, filtrér, eller tryk på hotspots på silhuetten."
          : "Explore major organs and structures by system. Search, filter, or tap hotspots on the silhouette."}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={mode}
          onChange={setMode}
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
            placeholder={da ? "Navn eller latin" : "Name or Latin"}
            aria-label={da ? "Søg anatomi" : "Search anatomy"}
          />
        </Field>
      </div>

      <div className="kit-h-scroll gap-2">
        <button
          type="button"
          className={`${secondaryBtnClass} ${
            system === "all" ? "border-accent bg-accent-soft" : ""
          }`}
          onClick={() => setSystem("all")}
        >
          {da ? "Alle" : "All"}
        </button>
        {SYSTEMS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`${secondaryBtnClass} ${
              system === s.id ? "border-accent bg-accent-soft" : ""
            }`}
            onClick={() => setSystem(s.id)}
          >
            {da ? s.nameDa : s.nameEn}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="kit-tool-panel space-y-3 p-3 sm:p-4">
          {mode === "map" ? (
            <BodySilhouette
              system={system}
              parts={filtered.length ? filtered : PARTS}
              selectedId={selected.id}
              onSelect={select}
              da={da}
            />
          ) : null}

          {filtered.length === 0 ? (
            <p className="text-sm text-muted">
              {da ? "Ingen dele matcher." : "No parts match."}
            </p>
          ) : (
            <ul className="max-h-[28rem] space-y-1.5 overflow-y-auto kit-scrollbar pr-1">
              {filtered.map((p) => {
                const active = p.id === selected.id;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => select(p.id)}
                      className={`kit-touch-target flex w-full flex-col items-start rounded-[10px] border px-3 py-2 text-left sm:min-h-0 ${
                        active
                          ? "border-accent bg-accent-soft"
                          : "border-border bg-background hover:bg-overlay"
                      }`}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {da ? p.nameDa : p.nameEn}
                      </span>
                      <span className="text-xs text-muted">
                        {systemLabel(p.system)}
                        {p.latin ? ` · ${p.latin}` : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section
          ref={detailRef}
          className="kit-tool-panel space-y-4 p-4 sm:p-5"
        >
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {da ? selected.nameDa : selected.nameEn}
            </h2>
            {selected.latin ? (
              <p className="text-sm italic text-muted">{selected.latin}</p>
            ) : null}
            <p className="mt-1 text-xs text-muted">
              {systemLabel(selected.system)}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
              {da ? "Funktion" : "Function"}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {da ? selected.functionDa : selected.functionEn}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
              {da ? "Sjove fakta" : "Fun fact"}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {da ? selected.factDa : selected.factEn}
            </p>
          </div>
          <p className="text-xs text-muted">
            {da
              ? `${filtered.length} dele i det aktuelle filter.`
              : `${filtered.length} parts in the current filter.`}
          </p>
        </section>
      </div>
    </div>
  );
}
