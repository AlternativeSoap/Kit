"use client";

import { useMemo, useRef, useState } from "react";
import { Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  INVENTIONS,
  formatInvYear,
  getInvention,
  pathToRoots,
  type Invention,
} from "./inventions";

type Mode = "graph" | "list";

type LayoutNode = {
  inv: Invention;
  x: number;
  y: number;
};

/** Simple layered layout by year bands. */
function layoutGraph(
  items: Invention[],
  width: number,
  height: number,
): LayoutNode[] {
  const sorted = [...items].sort((a, b) => a.year - b.year);
  const years = sorted.map((i) => i.year);
  const minY = years[0] ?? 0;
  const maxY = years[years.length - 1] ?? 1;
  const span = Math.max(maxY - minY, 1);

  const padX = 48;
  const padY = 36;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;

  // Group into year buckets to reduce overlap
  const buckets = new Map<number, Invention[]>();
  for (const inv of sorted) {
    const band = Math.round(((inv.year - minY) / span) * 12);
    const list = buckets.get(band) ?? [];
    list.push(inv);
    buckets.set(band, list);
  }

  const nodes: LayoutNode[] = [];
  for (const [band, list] of buckets) {
    const y = padY + (band / 12) * usableH;
    list.forEach((inv, i) => {
      const n = list.length;
      const x =
        n === 1
          ? padX + usableW / 2
          : padX + (i / Math.max(n - 1, 1)) * usableW;
      // slight stagger
      const jitter = ((i % 3) - 1) * 10;
      nodes.push({ inv, x, y: y + jitter });
    });
  }
  return nodes;
}

function InventionDetail({
  inv,
  da,
  path,
}: {
  inv: Invention;
  da: boolean;
  path: Invention[];
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {formatInvYear(inv.year, da)} ·{" "}
          {da ? inv.regionDa : inv.regionEn}
        </p>
        <h2 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
          {da ? inv.titleDa : inv.titleEn}
        </h2>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-muted">
            {da ? "Opfinder / kultur" : "Inventor / culture"}
          </dt>
          <dd className="text-sm text-foreground">
            {da ? inv.inventorDa : inv.inventorEn}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">
            {da ? "Forudsætninger" : "Prerequisites"}
          </dt>
          <dd className="text-sm text-foreground">
            {inv.dependsOn.length === 0
              ? da
                ? "Ingen i denne graf (rod)"
                : "None in this graph (root)"
              : inv.dependsOn
                  .map((id) => {
                    const d = getInvention(id);
                    return d ? (da ? d.titleDa : d.titleEn) : id;
                  })
                  .join(", ")}
          </dd>
        </div>
      </dl>
      <div>
        <h3 className="text-sm font-medium text-foreground">
          {da ? "Hvorfor det betød noget" : "Why it mattered"}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          {da ? inv.whyDa : inv.whyEn}
        </p>
      </div>
      {path.length > 1 ? (
        <div>
          <h3 className="text-sm font-medium text-foreground">
            {da ? "Sti tilbage til rødder" : "Path back to roots"}
          </h3>
          <ol className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
            {path.map((p, i) => (
              <li key={p.id} className="inline-flex items-center gap-1.5">
                {i > 0 ? (
                  <span className="text-muted" aria-hidden>
                    ←
                  </span>
                ) : null}
                <span
                  className={
                    p.id === inv.id
                      ? "font-medium text-foreground"
                      : "text-muted"
                  }
                >
                  {da ? p.titleDa : p.titleEn}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

export function OpfindelserTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const detailRef = useRef<HTMLElement>(null);

  const [mode, setMode] = useState<Mode>("graph");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("printing");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INVENTIONS;
    return INVENTIONS.filter((inv) => {
      const title = (da ? inv.titleDa : inv.titleEn).toLowerCase();
      const why = (da ? inv.whyDa : inv.whyEn).toLowerCase();
      const region = (da ? inv.regionDa : inv.regionEn).toLowerCase();
      const inventor = (da ? inv.inventorDa : inv.inventorEn).toLowerCase();
      return (
        title.includes(q) ||
        why.includes(q) ||
        region.includes(q) ||
        inventor.includes(q) ||
        String(Math.abs(inv.year)).includes(q)
      );
    });
  }, [query, da]);

  const selected = selectedId ? getInvention(selectedId) : null;
  const highlight = useMemo(() => {
    if (!selectedId) return new Set<string>();
    return new Set(pathToRoots(selectedId));
  }, [selectedId]);

  const highlightEdges = useMemo(() => {
    const edges = new Set<string>();
    for (const id of highlight) {
      const inv = getInvention(id);
      if (!inv) continue;
      for (const dep of inv.dependsOn) {
        if (highlight.has(dep)) edges.add(`${dep}->${id}`);
      }
    }
    return edges;
  }, [highlight]);

  const pathItems = useMemo(() => {
    if (!selectedId) return [];
    return pathToRoots(selectedId)
      .map((id) => getInvention(id))
      .filter((i): i is Invention => Boolean(i));
  }, [selectedId]);

  const svgW = 720;
  const svgH = 520;
  const layout = useMemo(
    () => layoutGraph(filtered, svgW, svgH),
    [filtered],
  );
  const byId = useMemo(() => {
    const m = new Map<string, LayoutNode>();
    for (const n of layout) m.set(n.inv.id, n);
    return m;
  }, [layout]);

  const edges = useMemo(() => {
    const list: { from: LayoutNode; to: LayoutNode; key: string }[] = [];
    for (const n of layout) {
      for (const dep of n.inv.dependsOn) {
        const from = byId.get(dep);
        if (!from) continue;
        list.push({ from, to: n, key: `${dep}->${n.inv.id}` });
      }
    }
    return list;
  }, [layout, byId]);

  const select = (id: string) => {
    setSelectedId(id);
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const listSorted = useMemo(
    () => [...filtered].sort((a, b) => a.year - b.year),
    [filtered],
  );

  return (
    <div className="kit-tool mx-auto w-full max-w-5xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Følg hvordan opfindelser bygger på hinanden. Vælg en knude for at se forudsætninger og stien til rødderne."
          : "Trace how inventions build on each other. Select a node to see prerequisites and the path to the roots."}
      </p>

      <Segmented
        value={mode}
        onChange={setMode}
        ariaLabel={da ? "Visning" : "View"}
        options={[
          { id: "graph", label: da ? "Graf" : "Graph" },
          { id: "list", label: da ? "Liste" : "List" },
        ]}
      />

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">
          {da ? "Søg" : "Search"}
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            da ? "Opfindelse, år eller område…" : "Invention, year, or region…"
          }
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-base text-foreground outline-none focus:border-accent sm:text-sm"
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">
          {da ? "Ingen opfindelser matcher." : "No inventions match."}
        </p>
      ) : mode === "graph" ? (
        <div className="kit-scrollbar overflow-x-auto rounded-[12px] border border-border bg-surface p-2 sm:p-3">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="h-auto w-full min-w-[28rem]"
            role="img"
            aria-label={da ? "Opfindelsesgraf" : "Invention graph"}
          >
            <title>
              {da ? "Opfindelsesgraf" : "Invention graph"}
            </title>
            {edges.map(({ from, to, key }) => {
              const on = highlightEdges.has(key);
              const dim =
                selectedId != null && highlight.size > 0 && !on;
              return (
                <line
                  key={key}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={on ? "var(--accent)" : "var(--border)"}
                  strokeWidth={on ? 2.5 : 1.25}
                  opacity={dim ? 0.25 : 1}
                />
              );
            })}
            {layout.map(({ inv, x, y }) => {
              const on = highlight.has(inv.id);
              const active = selectedId === inv.id;
              const dim =
                selectedId != null && highlight.size > 0 && !on;
              const label = da ? inv.titleDa : inv.titleEn;
              const short =
                label.length > 16 ? `${label.slice(0, 14)}…` : label;
              return (
                <g
                  key={inv.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer"
                  onClick={() => select(inv.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      select(inv.id);
                    }
                  }}
                  aria-pressed={active}
                  aria-label={`${label}, ${formatInvYear(inv.year, da)}`}
                >
                  <circle
                    r={active ? 14 : 11}
                    fill={
                      active
                        ? "var(--accent)"
                        : on
                          ? "var(--accent-soft)"
                          : "var(--background)"
                    }
                    stroke={
                      on || active ? "var(--accent)" : "var(--border)"
                    }
                    strokeWidth={active ? 2.5 : 1.5}
                    opacity={dim ? 0.3 : 1}
                  />
                  <text
                    y={28}
                    textAnchor="middle"
                    className="fill-foreground"
                    style={{
                      fontSize: 10,
                      opacity: dim ? 0.35 : 1,
                    }}
                  >
                    {short}
                  </text>
                  <text
                    y={-18}
                    textAnchor="middle"
                    className="fill-muted"
                    style={{ fontSize: 9, opacity: dim ? 0.35 : 1 }}
                  >
                    {formatInvYear(inv.year, da)}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="mt-2 px-1 text-xs text-muted">
            {da
              ? "Markering følger afhængigheder tilbage til rødderne. Rul vandret på små skærme."
              : "Highlight follows dependencies back to the roots. Scroll horizontally on small screens."}
          </p>
        </div>
      ) : (
        <div className="kit-scrollbar max-h-[26rem] overflow-y-auto rounded-[12px] border border-border bg-surface">
          <ul className="divide-y divide-border">
            {listSorted.map((inv) => {
              const active = selectedId === inv.id;
              const onPath = highlight.has(inv.id);
              return (
                <li key={inv.id}>
                  <button
                    type="button"
                    onClick={() => select(inv.id)}
                    aria-pressed={active}
                    className={`kit-touch-target flex w-full items-start gap-3 px-3 py-3 text-left sm:min-h-0 ${
                      active
                        ? "bg-accent-soft"
                        : onPath
                          ? "bg-overlay/60"
                          : "hover:bg-overlay"
                    }`}
                  >
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {formatInvYear(inv.year, da)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        {da ? inv.titleDa : inv.titleEn}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {da ? inv.regionDa : inv.regionEn}
                        {inv.dependsOn.length
                          ? ` · ${inv.dependsOn.length} ${
                              da ? "forudsætninger" : "prerequisites"
                            }`
                          : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted">
        {da
          ? `${filtered.length} af ${INVENTIONS.length} opfindelser`
          : `${filtered.length} of ${INVENTIONS.length} inventions`}
      </p>

      <section
        ref={detailRef}
        className="rounded-[14px] border border-border bg-surface p-4 sm:p-5"
        aria-live="polite"
      >
        {selected ? (
          <InventionDetail inv={selected} da={da} path={pathItems} />
        ) : (
          <p className="text-sm text-muted">
            {da
              ? "Vælg en opfindelse for at se detaljer."
              : "Select an invention to see details."}
          </p>
        )}
      </section>
    </div>
  );
}
