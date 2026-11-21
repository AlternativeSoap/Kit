"use client";

import { useMemo, useState } from "react";
import { Field, KitInput, KitSelect } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { MONTHS_DA, MONTHS_EN, PLANTS, type Plant } from "./data";

type SeasonFilter = "all" | Plant["season"];
type MonthFilter = "all" | `${number}`;

function activeInMonth(plant: Plant, month: number) {
  return (
    plant.sowIndoor.includes(month) ||
    plant.sowOutdoor.includes(month) ||
    plant.harvest.includes(month)
  );
}

function CellMark({
  kind,
  active,
  label,
}: {
  kind: "indoor" | "outdoor" | "harvest";
  active: boolean;
  label: string;
}) {
  if (!active) {
    return <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-overlay/80" aria-hidden />;
  }
  const color =
    kind === "indoor"
      ? "bg-accent/70"
      : kind === "outdoor"
        ? "bg-accent"
        : "bg-foreground/55";
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-[3px] ${color}`}
      title={label}
      aria-label={label}
    />
  );
}

export function HavekalenderTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const months = da ? MONTHS_DA : MONTHS_EN;

  const [query, setQuery] = useState("");
  const [season, setSeason] = useState<SeasonFilter>("all");
  const [monthFilter, setMonthFilter] = useState<MonthFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const monthN = monthFilter === "all" ? null : Number(monthFilter);
    return PLANTS.filter((p) => {
      if (season !== "all" && p.season !== season) return false;
      if (monthN != null && !activeInMonth(p, monthN)) return false;
      if (!q) return true;
      return (
        p.nameDa.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.id.includes(q)
      );
    });
  }, [query, season, monthFilter]);

  const selected = PLANTS.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="kit-tool mx-auto max-w-5xl space-y-5">
      <p className="text-sm text-muted">
        {da
          ? "Sånings- og høstkalender for almindelige danske have- og kolonihaveplanter. Antager tempereret dansk klima."
          : "Sowing and harvest calendar for common Danish garden and allotment plants. Assumes a temperate Danish climate."}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={da ? "Søg plante" : "Search plant"}>
          <KitInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={da ? "fx tomat, kål…" : "e.g. tomato, kale…"}
          />
        </Field>
        <Field label={da ? "Sæson" : "Season"}>
          <KitSelect
            value={season}
            onChange={(e) => setSeason(e.target.value as SeasonFilter)}
          >
            <option value="all">{da ? "Alle" : "All"}</option>
            <option value="spring">{da ? "Forår" : "Spring"}</option>
            <option value="summer">{da ? "Sommer" : "Summer"}</option>
            <option value="autumn">{da ? "Efterår" : "Autumn"}</option>
            <option value="winter">{da ? "Vinter" : "Winter"}</option>
            <option value="yearround">{da ? "Helår" : "Year-round"}</option>
          </KitSelect>
        </Field>
        <Field label={da ? "Aktiv i måned" : "Active in month"}>
          <KitSelect
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value as MonthFilter)}
          >
            <option value="all">{da ? "Alle måneder" : "All months"}</option>
            {months.map((m, i) => (
              <option key={m} value={String(i + 1)}>
                {m}
              </option>
            ))}
          </KitSelect>
        </Field>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-accent/70" />
          {da ? "Så inde" : "Sow indoors"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-accent" />
          {da ? "Så/plant ude" : "Sow/plant out"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-foreground/55" />
          {da ? "Høst" : "Harvest"}
        </span>
      </div>

      {/* Phone: plant cards. Desktop: full month grid. */}
      <ul className="space-y-2 sm:hidden">
        {filtered.map((p) => {
          const active = selectedId === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
                className={`kit-touch-target w-full rounded-[12px] border px-3.5 py-3 text-left transition-colors ${
                  active
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-surface hover:bg-overlay"
                }`}
              >
                <p className="font-medium text-foreground">
                  {da ? p.nameDa : p.nameEn}
                </p>
                <div className="kit-h-scroll mt-2.5 gap-1.5">
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    return (
                      <span
                        key={month}
                        className="inline-flex shrink-0 flex-col items-center gap-1"
                      >
                        <span className="text-[10px] tabular-nums text-muted">
                          {months[i]?.slice(0, 3)}
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <CellMark
                            kind="indoor"
                            active={p.sowIndoor.includes(month)}
                            label={da ? "Så inde" : "Sow indoors"}
                          />
                          <CellMark
                            kind="outdoor"
                            active={p.sowOutdoor.includes(month)}
                            label={da ? "Så/plant ude" : "Sow/plant out"}
                          />
                          <CellMark
                            kind="harvest"
                            active={p.harvest.includes(month)}
                            label={da ? "Høst" : "Harvest"}
                          />
                        </span>
                      </span>
                    );
                  })}
                </div>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 ? (
          <li className="rounded-[12px] border border-border px-3 py-6 text-center text-sm text-muted">
            {da
              ? "Ingen planter matcher filteret."
              : "No plants match the filter."}
          </li>
        ) : null}
      </ul>

      <div className="hidden overflow-x-auto rounded-[12px] border border-border bg-surface sm:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="sticky left-0 z-10 bg-surface px-3 py-2 font-medium">
                {da ? "Plante" : "Plant"}
              </th>
              {months.map((m) => (
                <th key={m} className="px-1 py-2 text-center font-medium">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className={`cursor-pointer border-b border-border/60 transition-colors hover:bg-overlay/60 ${
                  selectedId === p.id ? "bg-overlay" : ""
                }`}
                onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
              >
                <td className="sticky left-0 z-10 bg-surface px-3 py-2 text-sm font-medium">
                  {da ? p.nameDa : p.nameEn}
                </td>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  return (
                    <td key={month} className="px-1 py-2">
                      <div className="flex items-center justify-center gap-0.5">
                        <CellMark
                          kind="indoor"
                          active={p.sowIndoor.includes(month)}
                          label={da ? "Så inde" : "Sow indoors"}
                        />
                        <CellMark
                          kind="outdoor"
                          active={p.sowOutdoor.includes(month)}
                          label={da ? "Så/plant ude" : "Sow/plant out"}
                        />
                        <CellMark
                          kind="harvest"
                          active={p.harvest.includes(month)}
                          label={da ? "Høst" : "Harvest"}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={13}
                  className="px-3 py-6 text-center text-sm text-muted"
                >
                  {da
                    ? "Ingen planter matcher filteret."
                    : "No plants match the filter."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="rounded-[12px] border border-border bg-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-medium">
                {da ? selected.nameDa : selected.nameEn}
              </h3>
              <p className="text-xs text-muted">
                {da ? selected.nameEn : selected.nameDa}
              </p>
            </div>
            <button
              type="button"
              className="text-sm text-muted underline-offset-2 hover:underline"
              onClick={() => setSelectedId(null)}
            >
              {da ? "Luk" : "Close"}
            </button>
          </div>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                {da ? "Så inde" : "Sow indoors"}
              </dt>
              <dd className="text-sm">
                {selected.sowIndoor.length
                  ? selected.sowIndoor.map((m) => months[m - 1]).join(", ")
                  : da
                    ? "Ikke typisk"
                    : "Not typical"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                {da ? "Så/plant ude" : "Sow/plant out"}
              </dt>
              <dd className="text-sm">
                {selected.sowOutdoor.length
                  ? selected.sowOutdoor.map((m) => months[m - 1]).join(", ")
                  : da
                    ? "Ikke typisk"
                    : "Not typical"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                {da ? "Høst" : "Harvest"}
              </dt>
              <dd className="text-sm">
                {selected.harvest.map((m) => months[m - 1]).join(", ")}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                {da ? "Selskab / naboer" : "Companions"}
              </dt>
              <dd className="text-sm">
                {da ? selected.companionsDa : selected.companionsEn}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm">{da ? selected.notesDa : selected.notesEn}</p>
        </div>
      ) : (
        <p className="text-sm text-muted">
          {da ? "Klik på en plante for detaljer og selskabstips." : "Click a plant for details and companion tips."}
        </p>
      )}

      <p className="text-xs text-muted">
        {da
          ? "Zone: tempereret Danmark (ca. USDA 7-8, lokalt milder eller hårdere). Måneder er vejledende. Lokalt vejr, jord og mikroklima varierer."
          : "Zone: temperate Denmark (roughly USDA 7-8, locally milder or harsher). Months are guides. Local weather, soil, and microclimate vary."}
      </p>
    </div>
  );
}
