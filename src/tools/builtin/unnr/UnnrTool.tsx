"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Field,
  KitInput,
  pickerRowActiveClass,
  pickerRowClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import {
  STACK_POLICY_LABEL,
  STACK_SYSTEM_DA,
  STACK_SYSTEM_EN,
  UN_ENTRIES,
  formatUn,
  getUn,
  searchUn,
  type UnEntry,
} from "./data";

function Block({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <div className="text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

function freeQuantityLabel(row: UnEntry, da: boolean): string {
  if (row.exemptionLimit == null) {
    return da ? "Ingen fast grænse (kat. 4)" : "No fixed limit (cat. 4)";
  }
  if (row.exemptionLimit === 0) {
    return da ? "Ingen fritagelse" : "No exemption";
  }
  return da
    ? `Op til ${row.exemptionLimit} L eller kg`
    : `Up to ${row.exemptionLimit} L or kg`;
}

function initialFromPrefill(prefill?: ToolPrefill): {
  query: string;
  selected: UnEntry | null;
} {
  const raw = (prefill?.un ?? prefill?.q ?? "").trim();
  if (!raw) return { query: "", selected: null };
  const id = formatUn(raw);
  const row = getUn(id) ?? searchUn(raw, 1)[0] ?? null;
  return {
    query: row?.un ?? id,
    selected: row && formatUn(row.un) === id ? row : null,
  };
}

export function UnnrTool({ prefill }: { prefill?: ToolPrefill } = {}) {
  const { locale } = useLanguage();
  const da = locale === "da";
  const seeded = useMemo(() => initialFromPrefill(prefill), [prefill]);
  const [query, setQuery] = useState(seeded.query);
  const [selected, setSelected] = useState<UnEntry | null>(seeded.selected);
  const detailRef = useRef<HTMLElement>(null);

  const results = useMemo(() => searchUn(query, 30), [query]);
  const list = query.trim() ? results : UN_ENTRIES.slice(0, 10);

  useEffect(() => {
    const next = initialFromPrefill(prefill);
    if (!next.query) return;
    setQuery(next.query);
    setSelected(next.selected);
  }, [prefill]);

  useEffect(() => {
    if (!selected) return;
    const id = window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [selected?.un]);

  function pick(row: UnEntry) {
    setSelected(row);
  }

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-4">
      <Field label={da ? "Søg" : "Search"}>
        <KitInput
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            if (!next.trim()) setSelected(null);
          }}
          placeholder={da ? "fx 1203, diesel, lithium…" : "e.g. 1203, diesel, lithium…"}
          autoComplete="off"
        />
      </Field>

      <ul className="max-h-64 space-y-0.5 overflow-y-auto">
        {list.map((row) => {
          const name = da ? row.nameDa : row.nameEn;
          const active = selected?.un === row.un;
          return (
            <li key={row.un}>
              <button
                type="button"
                className={`${active ? pickerRowActiveClass : pickerRowClass} items-baseline`}
                onClick={() => pick(row)}
              >
                <span className="w-12 shrink-0 tabular-nums text-muted">
                  {row.un}
                </span>
                <span className="min-w-0 flex-1 truncate">{name}</span>
                <span className="shrink-0 text-xs text-muted">
                  {da ? "Kl." : "Cl."} {row.hazardClass}
                </span>
              </button>
            </li>
          );
        })}
        {query.trim() && list.length === 0 ? (
          <li className="px-3 py-3 text-sm text-muted">
            {da ? "Ingen træffere." : "No matches."}
          </li>
        ) : null}
      </ul>

      {!selected ? (
        <p className="text-xs text-muted">
          {query.trim()
            ? da
              ? `${list.length} træf`
              : `${list.length} match${list.length === 1 ? "" : "es"}`
            : da
              ? `Viser ${list.length} af ${UN_ENTRIES.length}. Skriv for at filtrere.`
              : `Showing ${list.length} of ${UN_ENTRIES.length}. Type to filter.`}
        </p>
      ) : null}

      {selected ? (
        <article
          key={selected.un}
          ref={detailRef}
          className="kit-fade-in kit-tool-panel space-y-5 p-4 sm:p-5"
        >
          <header className="space-y-1">
            <p className="text-xs text-muted">UN {selected.un}</p>
            <h2 className="font-serif text-2xl tracking-tight text-foreground">
              {da ? selected.nameDa : selected.nameEn}
            </h2>
            <p className="text-sm text-muted">
              {da ? "Klasse" : "Class"} {selected.hazardClass}
              {selected.packingGroup ? ` · PG ${selected.packingGroup}` : ""}
              {" · "}
              {selected.classificationCode}
              {" · "}
              {da ? "Tunnel" : "Tunnel"} {selected.tunnelCode}
            </p>
          </header>

          <div className="grid gap-5 sm:grid-cols-2">
            <Block label={da ? "Frimængde" : "Free quantity"}>
              <p>{freeQuantityLabel(selected, da)}</p>
              <p className="mt-1 text-muted">
                LQ {selected.limitedQuantity}
                {" · "}
                EQ {selected.exceptedQuantity}
                {" · "}
                {da ? "Kat." : "Cat."} {selected.transportCategory}
              </p>
            </Block>

            <Block label={da ? "Stakning" : "Stacking"}>
              <p>
                {(da
                  ? STACK_POLICY_LABEL[selected.stack.policy].da
                  : STACK_POLICY_LABEL[selected.stack.policy].en) +
                  ". " +
                  (da ? selected.stack.summaryDa : selected.stack.summaryEn)}
              </p>
              <p className="mt-1 text-muted">
                {(da ? "Må ovenpå: " : "May on top: ") +
                  (da ? selected.stack.mayOnTopDa : selected.stack.mayOnTopEn)}
              </p>
              <p className="mt-1 text-muted">
                {(da ? "Må ikke: " : "Do not: ") +
                  (da ? selected.stack.neverDa : selected.stack.neverEn)}
              </p>
            </Block>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Block label={da ? "I lastbil / trailer" : "On the truck"}>
              {da ? selected.vehicleDa : selected.vehicleEn}
            </Block>
            <Block label={da ? "Håndtering" : "Handling"}>
              {da ? selected.handlingDa : selected.handlingEn}
            </Block>
            <Block label={da ? "Ved spild" : "Spill"}>
              {da ? selected.spillDa : selected.spillEn}
            </Block>
            <Block label={da ? "Ved brand" : "Fire"}>
              {da ? selected.fireDa : selected.fireEn}
            </Block>
            <Block label={da ? "Værnemidler" : "PPE"}>
              {da ? selected.ppeDa : selected.ppeEn}
            </Block>
            <Block label={da ? "Bemærkninger" : "Notes"}>
              {da ? selected.notesDa : selected.notesEn}
            </Block>
          </div>
        </article>
      ) : null}

      <details className="text-sm text-muted">
        <summary className="cursor-pointer text-foreground/80 transition-colors hover:text-foreground">
          {da ? "Generelle stakningsregler" : "General stacking rules"}
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
          {(da ? STACK_SYSTEM_DA : STACK_SYSTEM_EN).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>

      <p className="text-xs leading-relaxed text-muted">
        {da
          ? "Hurtigt overblik, ikke en komplet ADR Table A. Bekræft i gældende ADR, SDS og hos en DGSA før transport."
          : "Quick overview, not a complete ADR Table A. Confirm in the current ADR, SDS, and with a DGSA before transport."}
      </p>
    </div>
  );
}
