"use client";

import { useMemo, useState } from "react";
import { Field, KitInput, Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  DIRECTION_LABEL,
  SCRIPTS,
  searchScripts,
  type DirectionId,
  type WritingSystem,
} from "./scripts";

type FilterId = "all" | DirectionId;

export function SkriftatlasTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [query, setQuery] = useState("");
  const [dirFilter, setDirFilter] = useState<FilterId>("all");
  const [selectedId, setSelectedId] = useState<string | null>("latin");

  const filtered = useMemo(() => {
    let list = searchScripts(query, da);
    if (dirFilter !== "all") {
      list = list.filter((s) => s.direction === dirFilter);
    }
    return list;
  }, [query, dirFilter, da]);

  const selected: WritingSystem | null =
    filtered.find((s) => s.id === selectedId) ??
    SCRIPTS.find((s) => s.id === selectedId) ??
    filtered[0] ??
    null;

  const filterOptions: { id: FilterId; label: string }[] = [
    { id: "all", label: da ? "Alle" : "All" },
    { id: "ltr", label: da ? "V→H" : "L→R" },
    { id: "rtl", label: da ? "H→V" : "R→L" },
    { id: "ttb", label: da ? "T→B" : "T→B" },
    { id: "mixed", label: da ? "Blandet" : "Mixed" },
  ];

  return (
    <div className="kit-tool mx-auto max-w-4xl space-y-5">
      <p className="text-sm text-muted">
        {da
          ? `Atlas over ${SCRIPTS.length} skriftsystemer med prøvetegn, skriveretning og region.`
          : `Atlas of ${SCRIPTS.length} writing systems with sample glyphs, direction, and region.`}
      </p>

      <Field label={da ? "Søg" : "Search"}>
        <KitInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            da
              ? "fx runer, arabisk, hangul…"
              : "e.g. runes, Arabic, Hangul…"
          }
          autoComplete="off"
        />
      </Field>

      <Segmented
        value={dirFilter}
        options={filterOptions}
        onChange={setDirFilter}
        ariaLabel={da ? "Skriveretning" : "Writing direction"}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <ul className="max-h-[28rem] divide-y divide-border overflow-auto rounded-[12px] border border-border bg-surface">
          {filtered.map((script) => (
            <li key={script.id}>
              <button
                type="button"
                className={`flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-overlay ${
                  selected?.id === script.id ? "bg-overlay" : ""
                }`}
                onClick={() => setSelectedId(script.id)}
              >
                <span className="text-sm font-medium text-foreground">
                  {da ? script.nameDa : script.nameEn}
                </span>
                <span className="line-clamp-1 text-xs text-muted">
                  {script.glyphs}
                </span>
              </button>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-sm text-muted">
              {da ? "Ingen træffere." : "No matches."}
            </li>
          ) : null}
        </ul>

        <div>
          {selected ? (
            <div className="rounded-[12px] border border-border bg-surface p-4 sm:p-5">
              <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                {DIRECTION_LABEL[selected.direction][da ? "da" : "en"]}
              </p>
              <h2 className="mt-1 font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
                {da ? selected.nameDa : selected.nameEn}
              </h2>

              <div
                className="mt-4 rounded-[10px] border border-border bg-overlay/40 px-4 py-5 text-center"
                dir={
                  selected.direction === "rtl"
                    ? "rtl"
                    : selected.direction === "ltr"
                      ? "ltr"
                      : "auto"
                }
              >
                <p className="font-serif text-2xl leading-relaxed tracking-wide text-foreground sm:text-3xl">
                  {selected.glyphs}
                </p>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase text-muted">
                    {da ? "Område" : "Region"}
                  </dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
                    {da ? selected.regionDa : selected.regionEn}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-muted">
                    {da ? "Skriveretning" : "Direction"}
                  </dt>
                  <dd className="mt-0.5 text-sm text-foreground">
                    {DIRECTION_LABEL[selected.direction][da ? "da" : "en"]}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-sm leading-relaxed text-foreground">
                {da ? selected.factDa : selected.factEn}
              </p>

              {selected.id === "braille" ? (
                <p className="mt-3 text-xs text-muted">
                  {da
                    ? "Braille er en taktil kode for andre skrifter, ikke et separat talesprog."
                    : "Braille is a tactile code for other scripts, not a separate spoken language."}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">
              {da
                ? "Vælg et skriftsystem for detaljer."
                : "Select a writing system for details."}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted">
        {da
          ? "Prøvetegn er illustrative. Tegnsæt og ortografi varierer efter sprog og tid."
          : "Sample glyphs are illustrative. Character sets and orthography vary by language and era."}
      </p>
    </div>
  );
}
