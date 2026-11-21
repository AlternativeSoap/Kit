"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Segmented } from "@/components/tools/ui";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { curatedFor, suggestFormulas } from "./compounds";
import {
  ELEMENTS,
  findElement,
  type ElementCategory,
  type ElementPhase,
  type PeriodicElement,
} from "./elements";
import { lookupFormulas, type PubChemCompound } from "./pubchem";
import "./pt-table.css";

const CATEGORIES: ElementCategory[] = [
  "alkali",
  "alkaline-earth",
  "transition",
  "post-transition",
  "metalloid",
  "nonmetal",
  "halogen",
  "noble-gas",
  "lanthanide",
  "actinide",
  "unknown",
];

const MAX_COMBINE = 4;

const MAIN_BY_SLOT = (() => {
  const map = new Map<string, PeriodicElement>();
  for (const el of ELEMENTS) {
    if (el.category === "lanthanide" || el.category === "actinide") continue;
    if (el.group == null) continue;
    map.set(`${el.period}:${el.group}`, el);
  }
  return map;
})();

const LANTHANIDES = ELEMENTS.filter((el) => el.category === "lanthanide");
const ACTINIDES = ELEMENTS.filter((el) => el.category === "actinide");

type Mode = "explore" | "combine";

function categoryLabel(
  category: ElementCategory,
  t: Record<string, string>,
): string {
  switch (category) {
    case "alkali":
      return t.catAlkali;
    case "alkaline-earth":
      return t.catAlkalineEarth;
    case "transition":
      return t.catTransition;
    case "post-transition":
      return t.catPostTransition;
    case "metalloid":
      return t.catMetalloid;
    case "nonmetal":
      return t.catNonmetal;
    case "halogen":
      return t.catHalogen;
    case "noble-gas":
      return t.catNobleGas;
    case "lanthanide":
      return t.catLanthanide;
    case "actinide":
      return t.catActinide;
    case "unknown":
      return t.catUnknown;
  }
}

function phaseLabel(phase: ElementPhase, t: Record<string, string>): string {
  switch (phase) {
    case "solid":
      return t.phaseSolid;
    case "liquid":
      return t.phaseLiquid;
    case "gas":
      return t.phaseGas;
    case "unknown":
      return t.phaseUnknown;
  }
}

function matchesQuery(el: PeriodicElement, query: string, da: boolean): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (String(el.z) === q) return true;
  if (el.symbol.toLowerCase() === q) return true;
  if (el.symbol.toLowerCase().startsWith(q)) return true;
  if (el.nameEn.toLowerCase().includes(q)) return true;
  if (el.nameDa.toLowerCase().includes(q)) return true;
  if (el.akaDa?.toLowerCase().includes(q)) return true;
  if (da && el.nameDa.toLowerCase().startsWith(q)) return true;
  return false;
}

function ElementCell({
  el,
  selected,
  combined,
  dimmed,
  onSelect,
  da,
}: {
  el: PeriodicElement;
  selected: boolean;
  combined: boolean;
  dimmed: boolean;
  onSelect: (el: PeriodicElement) => void;
  da: boolean;
}) {
  const name = da ? el.nameDa : el.nameEn;
  return (
    <button
      type="button"
      data-cat={el.category}
      data-active={selected ? "true" : "false"}
      data-combine={combined ? "true" : "false"}
      data-dimmed={dimmed ? "true" : "false"}
      aria-pressed={selected || combined}
      aria-label={`${el.z} ${el.symbol} ${name}`}
      title={`${el.symbol} · ${name}`}
      onClick={() => onSelect(el)}
      className="pt-cell pt-cell-fill pt-el"
    >
      <span className="pt-el-z">{el.z}</span>
      <span className="pt-el-symbol">{el.symbol}</span>
      <span className="pt-el-name">{name}</span>
    </button>
  );
}

function MarkerCell({ label }: { label: string }) {
  return (
    <div className="pt-marker" aria-hidden>
      {label}
    </div>
  );
}

function EmptyCell() {
  return <div className="pt-empty" aria-hidden />;
}

export function PeriodesystemTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const { locale } = useLanguage();
  const t = dictionary.periodesystemTool;
  const da = locale === "da";
  const detailRef = useRef<HTMLElement>(null);

  const initial = useMemo(() => {
    const raw =
      prefill?.z?.trim() ||
      prefill?.symbol?.trim() ||
      prefill?.element?.trim() ||
      prefill?.value?.trim() ||
      "";
    return raw ? findElement(raw) : undefined;
  }, [prefill]);

  const [mode, setMode] = useState<Mode>("explore");
  const [selectedZ, setSelectedZ] = useState<number | null>(
    () => initial?.z ?? null,
  );
  const [combineZs, setCombineZs] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ElementCategory | null>(
    null,
  );
  const [expanded, setExpanded] = useState(false);
  const [searching, setSearching] = useState(false);
  const [pubchemHits, setPubchemHits] = useState<PubChemCompound[]>([]);
  const [combineError, setCombineError] = useState("");
  const [searchedKey, setSearchedKey] = useState("");

  useEffect(() => {
    if (initial?.z) setSelectedZ(initial.z);
  }, [initial?.z]);

  const selected = selectedZ
    ? (ELEMENTS.find((el) => el.z === selectedZ) ?? null)
    : null;

  const combineElements = useMemo(
    () =>
      combineZs
        .map((z) => ELEMENTS.find((el) => el.z === z))
        .filter((el): el is PeriodicElement => Boolean(el)),
    [combineZs],
  );

  const combineSymbols = combineElements.map((el) => el.symbol);
  const curatedHits = useMemo(
    () => curatedFor(combineSymbols),
    [combineSymbols],
  );

  const matchSet = useMemo(() => {
    const set = new Set<number>();
    for (const el of ELEMENTS) {
      const qOk = matchesQuery(el, query, da);
      const cOk = !categoryFilter || el.category === categoryFilter;
      if (qOk && cOk) set.add(el.z);
    }
    return set;
  }, [query, categoryFilter, da]);

  const selectExplore = (el: PeriodicElement) => {
    setSelectedZ(el.z);
    setExpanded(false);
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const toggleCombine = (el: PeriodicElement) => {
    setCombineError("");
    setPubchemHits([]);
    setSearchedKey("");
    setCombineZs((prev) => {
      if (prev.includes(el.z)) return prev.filter((z) => z !== el.z);
      if (prev.length >= MAX_COMBINE) {
        setCombineError(t.combineMax);
        return prev;
      }
      return [...prev, el.z];
    });
  };

  const onCell = (el: PeriodicElement) => {
    if (mode === "combine") toggleCombine(el);
    else selectExplore(el);
  };

  const go = (delta: number) => {
    if (!selected) return;
    const next = ELEMENTS.find((el) => el.z === selected.z + delta);
    if (next) selectExplore(next);
  };

  const isDimmed = (el: PeriodicElement) =>
    Boolean(query.trim() || categoryFilter) && !matchSet.has(el.z);

  const runCombineSearch = async () => {
    if (combineSymbols.length === 0) return;
    const key = combineSymbols.slice().sort().join("+");
    setSearchedKey(key);
    setSearching(true);
    setCombineError("");
    setPubchemHits([]);
    const controller = new AbortController();
    try {
      const formulas = suggestFormulas(combineSymbols);
      const hits = await lookupFormulas(
        formulas,
        combineSymbols,
        controller.signal,
      );
      setPubchemHits(hits);
      if (hits.length === 0 && curatedHits.length === 0) {
        setCombineError(t.combineNone);
      }
    } catch {
      setCombineError(t.combineError);
    } finally {
      setSearching(false);
    }
  };

  const mainCells = [];
  for (let period = 1; period <= 7; period += 1) {
    for (let group = 1; group <= 18; group += 1) {
      const key = `${period}:${group}`;
      if (period === 6 && group === 3) {
        mainCells.push(<MarkerCell key={key} label="57–71" />);
        continue;
      }
      if (period === 7 && group === 3) {
        mainCells.push(<MarkerCell key={key} label="89–103" />);
        continue;
      }
      const el = MAIN_BY_SLOT.get(key);
      if (!el) {
        mainCells.push(<EmptyCell key={key} />);
        continue;
      }
      mainCells.push(
        <ElementCell
          key={key}
          el={el}
          selected={mode === "explore" && selected?.z === el.z}
          combined={mode === "combine" && combineZs.includes(el.z)}
          dimmed={isDimmed(el)}
          onSelect={onCell}
          da={da}
        />,
      );
    }
  }

  const currentKey = combineSymbols.slice().sort().join("+");
  const showPubchem =
    searchedKey === currentKey && (pubchemHits.length > 0 || searching);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <p className="text-sm text-muted">{t.intro}</p>

      <Segmented
        value={mode}
        ariaLabel={dictionary.tools.periodesystem.name}
        options={[
          { id: "explore", label: t.modeExplore },
          { id: "combine", label: t.modeCombine },
        ]}
        onChange={(id) => {
          setMode(id);
          setCombineError("");
        }}
      />

      {mode === "combine" ? (
        <p className="text-sm text-muted">{t.combineIntro}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1">
          <span className="mb-1.5 block text-sm font-medium">{t.search}</span>
          <div className="relative">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
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
                {t.clearSearch}
              </button>
            ) : null}
          </div>
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{t.legend}</p>
        <div className="kit-h-scroll gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter(null)}
            className={`kit-touch-target shrink-0 rounded-[8px] border px-2.5 py-1.5 text-xs ${
              categoryFilter === null
                ? "border-accent bg-accent text-on-accent"
                : "border-border bg-surface text-foreground hover:bg-overlay"
            }`}
          >
            {t.filterAll}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              data-cat={cat}
              onClick={() =>
                setCategoryFilter((prev) => (prev === cat ? null : cat))
              }
              className={`pt-cell kit-touch-target inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-xs text-foreground ${
                categoryFilter === cat
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-surface hover:bg-overlay"
              }`}
            >
              <span
                data-cat={cat}
                className="pt-cell pt-legend-swatch h-2.5 w-2.5 shrink-0 rounded-sm"
              />
              {categoryLabel(cat, t)}
            </button>
          ))}
        </div>
      </div>

      {query.trim() && matchSet.size === 0 ? (
        <p className="text-sm text-muted">{t.noMatch}</p>
      ) : null}

      <div className="pt-table-scroll kit-scrollbar rounded-[12px] border border-border bg-surface p-2 sm:p-3">
        <div className="pt-groups mb-1" aria-hidden>
          {Array.from({ length: 18 }, (_, i) => (
            <span key={i} className="pt-group-label">
              {i + 1}
            </span>
          ))}
        </div>

        <div
          className="pt-main"
          role="grid"
          aria-label={dictionary.tools.periodesystem.name}
        >
          {mainCells}
        </div>

        <div className="mt-4 space-y-2">
          <div className="pt-fblock">
            <div className="flex items-center text-[0.6rem] text-muted sm:text-xs">
              {t.lanthanides}
            </div>
            {LANTHANIDES.map((el) => (
              <ElementCell
                key={el.z}
                el={el}
                selected={mode === "explore" && selected?.z === el.z}
                combined={mode === "combine" && combineZs.includes(el.z)}
                dimmed={isDimmed(el)}
                onSelect={onCell}
                da={da}
              />
            ))}
          </div>
          <div className="pt-fblock">
            <div className="flex items-center text-[0.6rem] text-muted sm:text-xs">
              {t.actinides}
            </div>
            {ACTINIDES.map((el) => (
              <ElementCell
                key={el.z}
                el={el}
                selected={mode === "explore" && selected?.z === el.z}
                combined={mode === "combine" && combineZs.includes(el.z)}
                dimmed={isDimmed(el)}
                onSelect={onCell}
                da={da}
              />
            ))}
          </div>
        </div>
      </div>

      {mode === "combine" ? (
        <section
          ref={detailRef}
          className="space-y-4 rounded-[14px] border border-border bg-surface p-4 sm:p-5"
        >
          <div>
            <h2 className="text-sm font-medium text-foreground">
              {t.combineTray}
            </h2>
            {combineElements.length === 0 ? (
              <p className="mt-2 text-sm text-muted">{t.combineHint}</p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-2">
                {combineElements.map((el) => (
                  <li key={el.z}>
                    <button
                      type="button"
                      data-cat={el.category}
                      onClick={() => toggleCombine(el)}
                      className="pt-cell pt-cell-fill inline-flex items-center gap-2 rounded-[8px] border px-2.5 py-1.5 text-sm"
                      title={t.combineRemove}
                    >
                      <span className="font-semibold">{el.symbol}</span>
                      <span className="text-muted">
                        {da ? el.nameDa : el.nameEn}
                      </span>
                      <span aria-hidden className="text-muted">
                        ×
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={combineElements.length === 0 || searching}
              onClick={() => void runCombineSearch()}
              className="kit-touch-target rounded-[10px] bg-accent px-3.5 py-2.5 text-sm font-medium text-on-accent disabled:opacity-40 sm:min-h-0"
            >
              {searching ? t.combineSearching : t.combineFind}
            </button>
            <button
              type="button"
              disabled={combineElements.length === 0}
              onClick={() => {
                setCombineZs([]);
                setPubchemHits([]);
                setCombineError("");
                setSearchedKey("");
              }}
              className="kit-touch-target rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-overlay disabled:opacity-40 sm:min-h-0"
            >
              {t.combineClear}
            </button>
          </div>

          {combineError ? (
            <p className="text-sm text-muted">{combineError}</p>
          ) : null}

          {curatedHits.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium text-foreground">
                {t.combineCurated}
              </h3>
              <ul className="mt-2 space-y-2">
                {curatedHits.map((item) => (
                  <li
                    key={item.formula}
                    className="rounded-[10px] border border-border bg-background px-3 py-2.5"
                  >
                    <p className="font-mono text-sm font-semibold text-foreground">
                      {item.formula}
                    </p>
                    <p className="text-sm text-foreground">
                      {da ? item.nameDa : item.nameEn}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {da ? item.noteDa : item.noteEn}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {showPubchem ? (
            <div>
              <h3 className="text-sm font-medium text-foreground">
                {t.combinePubChem}
              </h3>
              {searching ? (
                <p className="mt-2 text-sm text-muted">{t.combineSearching}</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {pubchemHits.map((hit) => (
                    <li
                      key={hit.cid}
                      className="rounded-[10px] border border-border bg-background px-3 py-2.5"
                    >
                      <p className="font-mono text-sm font-semibold text-foreground">
                        {hit.formula}
                      </p>
                      <p className="text-sm text-foreground">{hit.title}</p>
                      {hit.iupacName && hit.iupacName !== hit.title ? (
                        <p className="text-xs text-muted">{hit.iupacName}</p>
                      ) : null}
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                        {hit.weight ? (
                          <span>
                            {t.combineWeight}: {hit.weight}
                          </span>
                        ) : null}
                        <a
                          href={hit.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent underline-offset-2 hover:underline"
                        >
                          {t.combineOpen}
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-xs text-muted">{t.combineSource}</p>
            </div>
          ) : null}
        </section>
      ) : (
        <section
          ref={detailRef}
          className="rounded-[14px] border border-border bg-surface p-4 sm:p-5"
          aria-live="polite"
        >
          {!selected ? (
            <p className="text-sm text-muted">{t.selectHint}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    {selected.z} · {selected.symbol}
                  </p>
                  <h2 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
                    {da ? selected.nameDa : selected.nameEn}
                  </h2>
                  {da && selected.akaDa ? (
                    <p className="mt-1 text-sm text-muted">
                      {t.alsoKnownAs}: {selected.akaDa}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="kit-touch-target rounded-[8px] border border-border px-2.5 py-1.5 text-sm text-muted hover:bg-overlay hover:text-foreground sm:min-h-0 sm:min-w-0"
                    onClick={() => {
                      setMode("combine");
                      setCombineZs([selected.z]);
                      setPubchemHits([]);
                      setSearchedKey("");
                      setCombineError("");
                    }}
                  >
                    {t.combineAdd}
                  </button>
                  <button
                    type="button"
                    className="kit-touch-target rounded-[8px] border border-border px-2.5 py-1.5 text-sm text-muted hover:bg-overlay hover:text-foreground sm:min-h-0 sm:min-w-0"
                    onClick={() => go(-1)}
                    disabled={selected.z <= 1}
                  >
                    {t.previous}
                  </button>
                  <button
                    type="button"
                    className="kit-touch-target rounded-[8px] border border-border px-2.5 py-1.5 text-sm text-muted hover:bg-overlay hover:text-foreground sm:min-h-0 sm:min-w-0"
                    onClick={() => go(1)}
                    disabled={selected.z >= 118}
                  >
                    {t.next}
                  </button>
                  <button
                    type="button"
                    className="kit-touch-target rounded-[8px] border border-border px-2.5 py-1.5 text-sm text-muted hover:bg-overlay hover:text-foreground sm:min-h-0 sm:min-w-0"
                    onClick={() => {
                      setSelectedZ(null);
                      setExpanded(false);
                    }}
                  >
                    {t.close}
                  </button>
                </div>
              </div>

              <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted">{t.atomicNumber}</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {selected.z}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">{t.atomicWeight}</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {selected.weight}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">{t.group}</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {selected.group ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">{t.period}</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {selected.period}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">{t.category}</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {categoryLabel(selected.category, t)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">{t.phase}</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {phaseLabel(selected.phase, t)}
                  </dd>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <dt className="text-xs text-muted">{t.electronConfig}</dt>
                  <dd className="font-mono text-sm font-medium text-foreground">
                    {selected.electronConfig}
                  </dd>
                </div>
              </dl>

              <div>
                <h3 className="text-sm font-medium text-foreground">
                  {t.about}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                  {da ? selected.summaryDa : selected.summaryEn}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground">{t.uses}</h3>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-foreground">
                  {(da ? selected.usesDa : selected.usesEn).map((use) => (
                    <li key={use}>{use}</li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  className="kit-touch-target rounded-[8px] border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-overlay sm:min-h-0"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? t.readLess : t.readMore}
                </button>
                {expanded ? (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
                    {da ? selected.deeperDa : selected.deeperEn}
                  </p>
                ) : null}
              </div>

              <p className="text-xs text-muted">{t.weightNote}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
