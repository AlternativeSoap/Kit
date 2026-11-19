"use client";

import { useMemo, useRef, useState } from "react";
import { Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  EVENTS,
  formatYear,
  yearGap,
  type EventCategory,
  type TimelineEvent,
} from "./events";

type Mode = "explore" | "compare";
type CategoryFilter = EventCategory | "all";

const CATEGORIES: EventCategory[] = [
  "science",
  "culture",
  "conflict",
  "exploration",
];

const CATEGORY_COLOR: Record<EventCategory, string> = {
  science: "bg-sky-500",
  culture: "bg-violet-500",
  conflict: "bg-rose-500",
  exploration: "bg-amber-500",
};

function categoryLabel(cat: EventCategory, da: boolean): string {
  if (da) {
    switch (cat) {
      case "science":
        return "Videnskab";
      case "culture":
        return "Kultur";
      case "conflict":
        return "Konflikt";
      case "exploration":
        return "Udforskning";
    }
  }
  switch (cat) {
    case "science":
      return "Science";
    case "culture":
      return "Culture";
    case "conflict":
      return "Conflict";
    case "exploration":
      return "Exploration";
  }
}

function matchesQuery(ev: TimelineEvent, query: string, da: boolean): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const title = (da ? ev.titleDa : ev.titleEn).toLowerCase();
  const blurb = (da ? ev.blurbDa : ev.blurbEn).toLowerCase();
  const yearStr = String(Math.abs(ev.year));
  return (
    title.includes(q) ||
    blurb.includes(q) ||
    yearStr.includes(q) ||
    categoryLabel(ev.category, da).toLowerCase().includes(q)
  );
}

function EventDetail({
  ev,
  da,
  onCompareSlot,
}: {
  ev: TimelineEvent;
  da: boolean;
  onCompareSlot?: (slot: "a" | "b") => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {formatYear(ev.year, da)} · {categoryLabel(ev.category, da)}
        </p>
        <h2 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
          {da ? ev.titleDa : ev.titleEn}
        </h2>
      </div>
      <p className="text-sm leading-relaxed text-foreground">
        {da ? ev.blurbDa : ev.blurbEn}
      </p>
      {onCompareSlot ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCompareSlot("a")}
            className="kit-touch-target rounded-[8px] border border-border px-2.5 py-1.5 text-sm text-muted hover:bg-overlay hover:text-foreground sm:min-h-0"
          >
            {da ? "Sæt som A" : "Set as A"}
          </button>
          <button
            type="button"
            onClick={() => onCompareSlot("b")}
            className="kit-touch-target rounded-[8px] border border-border px-2.5 py-1.5 text-sm text-muted hover:bg-overlay hover:text-foreground sm:min-h-0"
          >
            {da ? "Sæt som B" : "Set as B"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function TidslinjeTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const detailRef = useRef<HTMLElement>(null);

  const [mode, setMode] = useState<Mode>("explore");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  /** 1 = compact, 3 = roomy */
  const [zoom, setZoom] = useState(2);

  const sorted = useMemo(
    () => [...EVENTS].sort((a, b) => a.year - b.year),
    [],
  );

  const filtered = useMemo(() => {
    return sorted.filter((ev) => {
      if (category !== "all" && ev.category !== category) return false;
      return matchesQuery(ev, query, da);
    });
  }, [sorted, category, query, da]);

  const selected = selectedId
    ? (EVENTS.find((e) => e.id === selectedId) ?? null)
    : null;
  const eventA = compareA
    ? (EVENTS.find((e) => e.id === compareA) ?? null)
    : null;
  const eventB = compareB
    ? (EVENTS.find((e) => e.id === compareB) ?? null)
    : null;

  const minYear = filtered[0]?.year ?? -3200;
  const maxYear = filtered[filtered.length - 1]?.year ?? 2020;
  const span = Math.max(maxYear - minYear, 1);

  const selectEvent = (id: string) => {
    setSelectedId(id);
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const gapPx = 28 + zoom * 22;

  return (
    <div className="kit-tool mx-auto w-full max-w-5xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Udforsk en udvalgt tidslinje over verdensbegivenheder. Filtrer, søg, og sammenlign to punkter."
          : "Explore a curated timeline of world events. Filter, search, and compare two points."}
      </p>

      <Segmented
        value={mode}
        onChange={setMode}
        ariaLabel={da ? "Tilstand" : "Mode"}
        options={[
          { id: "explore", label: da ? "Udforsk" : "Explore" },
          { id: "compare", label: da ? "Sammenlign" : "Compare" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1">
          <span className="mb-1.5 block text-sm font-medium">
            {da ? "Søg" : "Search"}
          </span>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                da ? "År, titel eller stikord…" : "Year, title, or keyword…"
              }
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 pr-10 text-base text-foreground outline-none focus:border-accent sm:text-sm"
              autoComplete="off"
              spellCheck={false}
            />
            {query ? (
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 text-sm text-muted hover:text-foreground"
                onClick={() => setQuery("")}
              >
                {da ? "Ryd" : "Clear"}
              </button>
            ) : null}
          </div>
        </label>

        <label className="block sm:w-44">
          <span className="mb-1.5 block text-sm font-medium">
            {da ? "Zoom" : "Zoom"}
          </span>
          <input
            type="range"
            min={1}
            max={3}
            step={1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
            aria-label={da ? "Tidslinje-zoom" : "Timeline zoom"}
          />
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">
          {da ? "Kategori" : "Category"}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`kit-touch-target rounded-[8px] border px-2.5 py-1.5 text-xs ${
              category === "all"
                ? "border-accent bg-accent text-on-accent"
                : "border-border bg-surface text-foreground hover:bg-overlay"
            }`}
          >
            {da ? "Alle" : "All"}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() =>
                setCategory((prev) => (prev === cat ? "all" : cat))
              }
              className={`kit-touch-target inline-flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-xs ${
                category === cat
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-border bg-surface text-foreground hover:bg-overlay"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-sm ${CATEGORY_COLOR[cat]}`}
                aria-hidden
              />
              {categoryLabel(cat, da)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">
          {da ? "Ingen begivenheder matcher." : "No events match."}
        </p>
      ) : (
        <div className="kit-scrollbar max-h-[28rem] overflow-y-auto rounded-[12px] border border-border bg-surface p-3 sm:p-4">
          <div className="relative" style={{ minHeight: filtered.length * gapPx }}>
            <div
              className="absolute bottom-2 left-[0.85rem] top-2 w-px bg-border sm:left-[1.1rem]"
              aria-hidden
            />
            <ol className="relative space-y-0">
              {filtered.map((ev, index) => {
                const active = selectedId === ev.id;
                const isA = compareA === ev.id;
                const isB = compareB === ev.id;
                const frac = (ev.year - minYear) / span;
                return (
                  <li
                    key={ev.id}
                    style={{
                      paddingTop: index === 0 ? 0 : Math.max(4, (zoom - 1) * 8),
                      paddingBottom: 8 + zoom * 4,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => selectEvent(ev.id)}
                      aria-pressed={active}
                      className={`kit-touch-target flex w-full items-start gap-3 rounded-[10px] px-1 py-1.5 text-left transition-colors sm:min-h-0 ${
                        active
                          ? "bg-accent-soft"
                          : "hover:bg-overlay"
                      }`}
                    >
                      <span className="relative mt-1.5 flex w-6 shrink-0 justify-center sm:w-8">
                        <span
                          className={`h-3 w-3 rounded-full ring-2 ring-surface ${CATEGORY_COLOR[ev.category]} ${
                            active ? "scale-125" : ""
                          }`}
                          aria-hidden
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="font-mono text-xs text-muted">
                            {formatYear(ev.year, da)}
                          </span>
                          <span className="text-xs text-muted">
                            {categoryLabel(ev.category, da)}
                          </span>
                          {isA || isB ? (
                            <span className="rounded bg-accent px-1.5 py-0.5 text-[0.65rem] font-medium text-on-accent">
                              {isA && isB ? "A+B" : isA ? "A" : "B"}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-sm font-medium text-foreground">
                          {da ? ev.titleDa : ev.titleEn}
                        </span>
                        {zoom >= 3 ? (
                          <span className="mt-1 block text-xs leading-relaxed text-muted">
                            {da ? ev.blurbDa : ev.blurbEn}
                          </span>
                        ) : null}
                        <span className="sr-only">
                          {Math.round(frac * 100)}% {da ? "på linjen" : "along the line"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}

      <p className="text-xs text-muted">
        {da
          ? `${filtered.length} begivenheder vist · zoom ${zoom}/3`
          : `${filtered.length} events shown · zoom ${zoom}/3`}
      </p>

      {mode === "compare" ? (
        <section
          ref={detailRef}
          className="space-y-4 rounded-[14px] border border-border bg-surface p-4 sm:p-5"
        >
          <h2 className="text-sm font-medium text-foreground">
            {da ? "Sammenlign to begivenheder" : "Compare two events"}
          </h2>
          <p className="text-sm text-muted">
            {da
              ? "Vælg en begivenhed ovenfor, og brug knapperne i detaljerne, eller vælg direkte her."
              : "Select an event above and use the detail buttons, or pick directly here."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["a", "b"] as const).map((slot) => {
              const current = slot === "a" ? eventA : eventB;
              const setSlot = slot === "a" ? setCompareA : setCompareB;
              return (
                <label key={slot} className="block">
                  <span className="mb-1.5 block text-sm font-medium">
                    {slot === "a"
                      ? da
                        ? "Begivenhed A"
                        : "Event A"
                      : da
                        ? "Begivenhed B"
                        : "Event B"}
                  </span>
                  <select
                    value={current?.id ?? ""}
                    onChange={(e) => {
                      const v = e.target.value || null;
                      setSlot(v);
                      if (v) setSelectedId(v);
                    }}
                    className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
                  >
                    <option value="">
                      {da ? "Vælg…" : "Choose…"}
                    </option>
                    {sorted.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {formatYear(ev.year, da)} ·{" "}
                        {da ? ev.titleDa : ev.titleEn}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
          </div>
          {eventA && eventB ? (
            <div className="rounded-[10px] border border-border bg-background px-3 py-3">
              <p className="text-sm text-foreground">
                {da ? "Årsforskel" : "Year gap"}:{" "}
                <span className="font-semibold">
                  {yearGap(eventA.year, eventB.year).toLocaleString(
                    da ? "da-DK" : "en-US",
                  )}{" "}
                  {da ? "år" : "years"}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted">
                {formatYear(eventA.year, da)} → {formatYear(eventB.year, da)}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-muted">A</p>
                  <p className="text-sm font-medium">
                    {da ? eventA.titleDa : eventA.titleEn}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted">B</p>
                  <p className="text-sm font-medium">
                    {da ? eventB.titleDa : eventB.titleEn}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">
              {da
                ? "Vælg både A og B for at se årsforskellen."
                : "Pick both A and B to see the year gap."}
            </p>
          )}
        </section>
      ) : (
        <section
          ref={detailRef}
          className="rounded-[14px] border border-border bg-surface p-4 sm:p-5"
          aria-live="polite"
        >
          {!selected ? (
            <p className="text-sm text-muted">
              {da
                ? "Vælg en begivenhed på tidslinjen for at læse mere."
                : "Select an event on the timeline to read more."}
            </p>
          ) : (
            <EventDetail
              ev={selected}
              da={da}
              onCompareSlot={(slot) => {
                if (slot === "a") setCompareA(selected.id);
                else setCompareB(selected.id);
                setMode("compare");
              }}
            />
          )}
        </section>
      )}
    </div>
  );
}
