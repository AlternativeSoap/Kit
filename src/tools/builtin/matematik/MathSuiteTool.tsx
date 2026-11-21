"use client";

import { useMemo, useState } from "react";
import { Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { FormellabTool } from "../formellab/FormellabTool";
import { FraktalTool } from "../fraktal/FraktalTool";
import { FunkplotTool } from "../funkplot/FunkplotTool";
import { GangetabelTool } from "../gangetabel/GangetabelTool";
import { GeometriTool } from "../geometri/GeometriTool";
import { LogikTool } from "../logik/LogikTool";
import { LommeregnerTool } from "../lommeregner/LommeregnerTool";
import { ProcentTool } from "../procent/ProcentTool";
import { SimpleTool } from "../simple/SimpleTool";
import { StatistikTool } from "../statistik/StatistikTool";
import {
  MATH_CATALOG,
  MATH_GROUPS,
  mathEntriesFor,
  mathEntryById,
  type MathGroupId,
  type MathLevel,
} from "./catalog";
import { FormelsamlingTool } from "./FormelsamlingTool";
import { TOOL_FORMULAS } from "./formulas";
import { FormulaCard } from "./MathFormula";

type LevelFilter = MathLevel | "all";

function ToolBody({
  id,
  prefill,
}: {
  id: string;
  prefill?: ToolPrefill;
}) {
  switch (id) {
    case "lommeregner":
      return <LommeregnerTool prefill={prefill} />;
    case "procent":
      return <ProcentTool prefill={prefill} />;
    case "gangetabel":
      return <GangetabelTool />;
    case "geometri":
      return <GeometriTool />;
    case "funkplot":
      return <FunkplotTool />;
    case "formellab":
      return <FormellabTool />;
    case "statistik":
      return <StatistikTool />;
    case "fraktal":
      return <FraktalTool />;
    case "logik":
      return <LogikTool />;
    case "formelsamling":
      return <FormelsamlingTool prefill={prefill} />;
    default:
      return <SimpleTool id={id} prefill={prefill} />;
  }
}

export function MathSuiteTool({
  prefill,
  initial = "lommeregner",
}: {
  prefill?: ToolPrefill;
  initial?: string;
}) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const startEntry = mathEntryById(initial) ?? MATH_CATALOG[0]!;
  const [level, setLevel] = useState<LevelFilter>("all");
  const [group, setGroup] = useState<MathGroupId>(startEntry.group);
  const [selectedId, setSelectedId] = useState(startEntry.id);

  const rows = useMemo(
    () => mathEntriesFor(group, level),
    [group, level],
  );

  const selected = mathEntryById(selectedId) ?? rows[0] ?? startEntry;

  function pickGroup(next: MathGroupId) {
    setGroup(next);
    const list = mathEntriesFor(next, level);
    if (list.length && !list.some((e) => e.id === selectedId)) {
      setSelectedId(list[0]!.id);
    }
  }

  function pickLevel(next: LevelFilter) {
    setLevel(next);
    const list = mathEntriesFor(group, next);
    if (list.length && !list.some((e) => e.id === selectedId)) {
      setSelectedId(list[0]!.id);
    }
  }

  return (
    <div className="kit-tool mx-auto max-w-4xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Skolematematik samlet ét sted. Vælg simpelt eller avanceret, find værktøjet i tabellen, og regn videre."
          : "School math in one place. Pick simple or advanced, find a tool in the table, and keep calculating."}
      </p>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <Segmented
          value={level}
          onChange={pickLevel}
          ariaLabel={da ? "Niveau" : "Level"}
          options={[
            { id: "all", label: da ? "Alle" : "All" },
            { id: "simple", label: da ? "Simpelt" : "Simple" },
            { id: "advanced", label: da ? "Avanceret" : "Advanced" },
          ]}
        />
        <p className="text-xs text-muted">
          {da
            ? `${MATH_CATALOG.length} værktøjer i pakken`
            : `${MATH_CATALOG.length} tools in the pack`}
        </p>
      </div>

      <div className="kit-h-scroll gap-2">
        {MATH_GROUPS.map((g) => {
          const active = g.id === group;
          const count = mathEntriesFor(g.id, level).length;
          return (
            <button
              key={g.id}
              type="button"
              disabled={count === 0}
              onClick={() => pickGroup(g.id)}
              className={`kit-touch-target shrink-0 rounded-[10px] border px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-border bg-surface text-muted hover:bg-overlay hover:text-foreground"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {da ? g.nameDa : g.nameEn}
              <span className="ml-1.5 tabular-nums text-xs opacity-70">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Phone: stacked list. Desktop: formula table. */}
      <ul className="divide-y divide-border overflow-hidden rounded-[12px] border border-border sm:hidden">
        {rows.map((row) => {
          const active = row.id === selected.id;
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => setSelectedId(row.id)}
                className={`kit-touch-target flex w-full items-start justify-between gap-3 px-3.5 py-3 text-left transition-colors ${
                  active
                    ? "bg-accent-soft text-foreground"
                    : "hover:bg-overlay"
                }`}
              >
                <span className="min-w-0">
                  <span className="block font-medium">
                    {da ? row.nameDa : row.nameEn}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted line-clamp-2">
                    {da ? row.blurbDa : row.blurbEn}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-[6px] px-1.5 py-0.5 text-[11px] font-medium ${
                    row.level === "simple"
                      ? "bg-surface text-foreground"
                      : "bg-overlay text-muted"
                  }`}
                >
                  {row.level === "simple"
                    ? da
                      ? "Simpelt"
                      : "Simple"
                    : da
                      ? "Avanceret"
                      : "Advanced"}
                </span>
              </button>
            </li>
          );
        })}
        {rows.length === 0 ? (
          <li className="px-3.5 py-6 text-center text-sm text-muted">
            {da
              ? "Ingen værktøjer i denne gruppe for det valgte niveau."
              : "No tools in this group for the selected level."}
          </li>
        ) : null}
      </ul>

      <div className="hidden overflow-x-auto rounded-[12px] border border-border sm:block">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead className="bg-overlay/60 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2.5 font-medium">
                {da ? "Værktøj" : "Tool"}
              </th>
              <th className="px-3 py-2.5 font-medium">
                {da ? "Niveau" : "Level"}
              </th>
              <th className="px-3 py-2.5 font-medium">
                {da ? "Formel" : "Formula"}
              </th>
              <th className="px-3 py-2.5 font-medium">
                {da ? "Beskrivelse" : "Description"}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const active = row.id === selected.id;
              const formula = TOOL_FORMULAS[row.id];
              return (
                <tr key={row.id} className="border-t border-border">
                  <td className="p-0" colSpan={4}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(row.id)}
                      className={`grid w-full grid-cols-[minmax(7rem,0.9fr)_auto_minmax(10rem,1.2fr)_minmax(0,1.1fr)] items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        active
                          ? "bg-accent-soft text-foreground"
                          : "hover:bg-overlay"
                      }`}
                    >
                      <span className="font-medium">
                        {da ? row.nameDa : row.nameEn}
                      </span>
                      <span
                        className={`justify-self-start rounded-[6px] px-1.5 py-0.5 text-[11px] font-medium ${
                          row.level === "simple"
                            ? "bg-surface text-foreground"
                            : "bg-overlay text-muted"
                        }`}
                      >
                        {row.level === "simple"
                          ? da
                            ? "Simpelt"
                            : "Simple"
                          : da
                            ? "Avanceret"
                            : "Advanced"}
                      </span>
                      <span className="min-w-0 overflow-x-auto">
                        {formula ?? (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </span>
                      <span className="text-muted">
                        {da ? row.blurbDa : row.blurbEn}
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-muted"
                >
                  {da
                    ? "Ingen værktøjer i denne gruppe for det valgte niveau."
                    : "No tools in this group for the selected level."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {selected ? (
        <section
          key={selected.id}
          className="kit-fade-in kit-tool-panel space-y-4 p-4 sm:p-5"
        >
          <header className="space-y-1">
            <p className="text-xs text-muted">
              {(da
                ? MATH_GROUPS.find((g) => g.id === selected.group)?.nameDa
                : MATH_GROUPS.find((g) => g.id === selected.group)?.nameEn) ??
                ""}
              {" · "}
              {selected.level === "simple"
                ? da
                  ? "Simpelt"
                  : "Simple"
                : da
                  ? "Avanceret"
                  : "Advanced"}
            </p>
            <h2 className="font-serif text-2xl tracking-tight text-foreground">
              {da ? selected.nameDa : selected.nameEn}
            </h2>
            <p className="text-sm text-muted">
              {da ? selected.blurbDa : selected.blurbEn}
            </p>
          </header>
          {TOOL_FORMULAS[selected.id] && selected.id !== "formelsamling" ? (
            <FormulaCard label={da ? "Formel" : "Formula"}>
              {TOOL_FORMULAS[selected.id]}
            </FormulaCard>
          ) : null}
          <ToolBody id={selected.id} prefill={prefill} />
        </section>
      ) : null}
    </div>
  );
}
