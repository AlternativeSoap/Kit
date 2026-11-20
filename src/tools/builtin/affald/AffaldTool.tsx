"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, KitInput, Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import {
  FRACTIONS,
  ITEMS,
  fractionById,
  searchItems,
  type FractionId,
  type WasteItem,
} from "./catalog";

type Mode = "search" | "fractions";

function seedFromPrefill(
  prefill: ToolPrefill | undefined,
  da: boolean,
): {
  query: string;
  item: WasteItem | null;
} {
  const itemId = prefill?.item?.trim();
  if (itemId) {
    const byId = ITEMS.find((i) => i.id === itemId) ?? null;
    if (byId) {
      return { query: da ? byId.nameDa : byId.nameEn, item: byId };
    }
  }
  const raw = (prefill?.q ?? "").trim();
  if (!raw) return { query: "", item: null };
  const hits = searchItems(raw);
  return { query: raw, item: hits[0] ?? null };
}

export function AffaldTool({ prefill }: { prefill?: ToolPrefill } = {}) {
  const { locale } = useLanguage();
  const da = locale === "da";
  const seeded = useMemo(() => seedFromPrefill(prefill, da), [prefill, da]);
  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState(seeded.query);
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(
    seeded.item,
  );
  const [selectedFraction, setSelectedFraction] = useState<FractionId | null>(
    seeded.item?.fraction ?? null,
  );

  useEffect(() => {
    const next = seedFromPrefill(prefill, da);
    if (!next.query && !next.item) return;
    setMode("search");
    setQuery(next.query);
    setSelectedItem(next.item);
    setSelectedFraction(next.item?.fraction ?? null);
  }, [prefill, da]);

  const results = useMemo(() => searchItems(query), [query]);
  const activeFraction = selectedFraction
    ? fractionById(selectedFraction)
    : selectedItem
      ? fractionById(selectedItem.fraction)
      : null;

  const itemsInFraction = useMemo(() => {
    if (!activeFraction) return [];
    return ITEMS.filter((i) => i.fraction === activeFraction.id);
  }, [activeFraction]);

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm text-muted">
        {da
          ? `Søg blandt ${ITEMS.length} husholdningsvarer og se hvilken fraktion de typisk hører til i Danmark.`
          : `Search ${ITEMS.length} household items and see which fraction they typically belong to in Denmark.`}
      </p>

      <Segmented
        value={mode}
        options={[
          { id: "search", label: da ? "Søg ting" : "Search items" },
          { id: "fractions", label: da ? "Fraktioner" : "Fractions" },
        ]}
        onChange={(id) => {
          setMode(id);
          if (id === "fractions") setSelectedItem(null);
        }}
        ariaLabel={da ? "Visning" : "View"}
      />

      {mode === "search" ? (
        <>
          <Field label={da ? "Søg" : "Search"}>
            <KitInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                da
                  ? "fx pizza, batteri, pant…"
                  : "e.g. pizza, battery, deposit…"
              }
              autoComplete="off"
            />
          </Field>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <ul className="max-h-96 divide-y divide-border overflow-auto rounded-[12px] border border-border bg-surface">
              {(query.trim() ? results : ITEMS.slice(0, 16)).map((item) => {
                const frac = fractionById(item.fraction);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-overlay ${
                        selectedItem?.id === item.id ? "bg-overlay" : ""
                      }`}
                      onClick={() => {
                        setSelectedItem(item);
                        setSelectedFraction(item.fraction);
                      }}
                    >
                      <span className="font-medium">
                        {da ? item.nameDa : item.nameEn}
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {da ? frac.nameDa : frac.nameEn}
                      </span>
                    </button>
                  </li>
                );
              })}
              {query.trim() && results.length === 0 ? (
                <li className="px-3 py-4 text-sm text-muted">
                  {da ? "Ingen træffere." : "No matches."}
                </li>
              ) : null}
            </ul>

            <div className="space-y-3">
              {selectedItem && activeFraction ? (
                <div className="rounded-[12px] border border-border bg-surface p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ background: activeFraction.color }}
                      aria-hidden
                    />
                    <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                      {da ? activeFraction.nameDa : activeFraction.nameEn}
                    </p>
                  </div>
                  <h2 className="mt-1 font-serif text-xl tracking-tight text-foreground sm:text-2xl">
                    {da ? selectedItem.nameDa : selectedItem.nameEn}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-foreground">
                    {da ? activeFraction.explainDa : activeFraction.explainEn}
                  </p>
                  {selectedItem.tipDa ? (
                    <p className="mt-2 text-sm text-muted">
                      {da ? selectedItem.tipDa : selectedItem.tipEn}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className="mt-3 text-sm text-foreground underline-offset-2 hover:underline"
                    onClick={() => {
                      setMode("fractions");
                      setSelectedFraction(activeFraction.id);
                    }}
                  >
                    {da
                      ? `Se alle i ${activeFraction.nameDa}`
                      : `See all in ${activeFraction.nameEn}`}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  {da
                    ? "Vælg en ting for fraktion og forklaring."
                    : "Select an item for fraction and explanation."}
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <ul className="divide-y divide-border rounded-[12px] border border-border bg-surface">
            {FRACTIONS.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-overlay ${
                    selectedFraction === f.id ? "bg-overlay" : ""
                  }`}
                  onClick={() => setSelectedFraction(f.id)}
                >
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full"
                    style={{ background: f.color }}
                    aria-hidden
                  />
                  <span className="font-medium">
                    {da ? f.nameDa : f.nameEn}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            {activeFraction ? (
              <div className="rounded-[12px] border border-border bg-surface p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ background: activeFraction.color }}
                    aria-hidden
                  />
                  <h2 className="font-serif text-xl tracking-tight text-foreground sm:text-2xl">
                    {da ? activeFraction.nameDa : activeFraction.nameEn}
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">
                  {da ? activeFraction.explainDa : activeFraction.explainEn}
                </p>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.06em] text-muted">
                  {da ? "Eksempler" : "Examples"}
                </p>
                <ul className="mt-1 space-y-1 text-sm">
                  {itemsInFraction.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="text-left hover:underline"
                        onClick={() => {
                          setSelectedItem(item);
                          setMode("search");
                          setQuery(da ? item.nameDa : item.nameEn);
                        }}
                      >
                        {da ? item.nameDa : item.nameEn}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted">
                {da
                  ? "Vælg en fraktion for forklaring og eksempler."
                  : "Select a fraction for explanation and examples."}
              </p>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-muted">
        {da
          ? "Vejledende Danmark-standard. Kommunale regler og skiltning kan afvige. Tjek din lokale affaldsguide."
          : "Indicative Denmark-style guidance. Municipal rules and labels can differ. Check your local waste guide."}
      </p>
    </div>
  );
}
