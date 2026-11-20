"use client";

import { useMemo, useState } from "react";
import {
  Field,
  KitInput,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  computeBoxFit,
  formatDim,
  maxGridFit,
  packMixed,
  parseCount,
  parseDim,
  type BoxDims,
  type Placement,
} from "./calc";

type ItemRow = {
  id: string;
  name: string;
  w: string;
  h: string;
  d: string;
  qty: string;
};

const BOX_DEFAULT = { bw: "65", bh: "30", bd: "25" };

const ITEM_COLORS = [
  { top: "rgba(91, 141, 239, 0.7)", left: "rgba(50, 100, 190, 0.85)", right: "rgba(130, 175, 250, 0.55)" },
  { top: "rgba(61, 155, 143, 0.7)", left: "rgba(35, 120, 110, 0.85)", right: "rgba(100, 190, 175, 0.55)" },
  { top: "rgba(201, 162, 39, 0.7)", left: "rgba(160, 120, 20, 0.85)", right: "rgba(230, 195, 80, 0.55)" },
  { top: "rgba(196, 92, 62, 0.7)", left: "rgba(150, 60, 40, 0.85)", right: "rgba(220, 130, 100, 0.55)" },
  { top: "rgba(120, 100, 200, 0.7)", left: "rgba(85, 65, 160, 0.85)", right: "rgba(160, 145, 230, 0.55)" },
  { top: "rgba(80, 160, 80, 0.7)", left: "rgba(50, 120, 55, 0.85)", right: "rgba(130, 200, 130, 0.55)" },
];

function newId() {
  return `item-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultItems(): ItemRow[] {
  return [
    { id: newId(), name: "", w: "25", h: "5", d: "3", qty: "1" },
  ];
}

function iso(x: number, y: number, z: number) {
  const sx = (x - z) * Math.cos(Math.PI / 6);
  const sy = y + (x + z) * Math.sin(Math.PI / 6);
  return { x: sx, y: -sy };
}

function boxCorners(ox: number, oy: number, oz: number, w: number, h: number, d: number) {
  return {
    o: iso(ox, oy, oz),
    x: iso(ox + w, oy, oz),
    y: iso(ox, oy + h, oz),
    z: iso(ox, oy, oz + d),
    xy: iso(ox + w, oy + h, oz),
    xz: iso(ox + w, oy, oz + d),
    yz: iso(ox, oy + h, oz + d),
    xyz: iso(ox + w, oy + h, oz + d),
  };
}

function poly(points: { x: number; y: number }[]) {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

function PackDiagram({
  box,
  placements,
  da,
}: {
  box: BoxDims;
  placements: Placement[];
  da: boolean;
}) {
  const maxEdge = Math.max(box.w, box.h, box.d, 1);
  const unit = 140 / maxEdge;
  const bw = box.w * unit;
  const bh = box.h * unit;
  const bd = box.d * unit;

  const outer = boxCorners(0, 0, 0, bw, bh, bd);
  const drawn = placements.slice(0, 48).map((p) => ({
    ...p,
    corners: boxCorners(p.x * unit, p.y * unit, p.z * unit, p.w * unit, p.h * unit, p.d * unit),
  }));

  const allPts = [
    ...Object.values(outer),
    ...drawn.flatMap((p) => Object.values(p.corners)),
  ];
  const minX = Math.min(...allPts.map((p) => p.x)) - 14;
  const maxX = Math.max(...allPts.map((p) => p.x)) + 14;
  const minY = Math.min(...allPts.map((p) => p.y)) - 18;
  const maxY = Math.max(...allPts.map((p) => p.y)) + 26;
  const width = Math.max(40, maxX - minX);
  const height = Math.max(40, maxY - minY);
  const shift = (p: { x: number; y: number }) => ({
    x: p.x - minX,
    y: p.y - minY,
  });
  const O = Object.fromEntries(
    Object.entries(outer).map(([k, v]) => [k, shift(v)]),
  ) as Record<string, { x: number; y: number }>;

  // Paint back-to-front by x+y+z
  const sorted = [...drawn].sort(
    (a, b) => a.x + a.y + a.z - (b.x + b.y + b.z),
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-lg"
      role="img"
      aria-label={da ? "Pakning i kassen" : "Packing in the box"}
    >
      <polygon
        points={poly([O.z!, O.xz!, O.xyz!, O.yz!])}
        fill="rgba(120,140,160,0.1)"
        stroke="var(--accent)"
        strokeWidth={1.2}
        strokeOpacity={0.45}
      />
      <polygon
        points={poly([O.o!, O.x!, O.xz!, O.z!])}
        fill="rgba(120,140,160,0.06)"
        stroke="var(--accent)"
        strokeWidth={1.4}
      />

      {sorted.map((p, i) => {
        const C = Object.fromEntries(
          Object.entries(p.corners).map(([k, v]) => [k, shift(v)]),
        ) as Record<string, { x: number; y: number }>;
        const colors = ITEM_COLORS[p.colorIndex % ITEM_COLORS.length]!;
        return (
          <g key={`${p.itemId}-${i}`}>
            <polygon
              points={poly([C.o!, C.z!, C.yz!, C.y!])}
              fill={colors.left}
              stroke="rgba(0,0,0,0.18)"
              strokeWidth={0.8}
            />
            <polygon
              points={poly([C.o!, C.x!, C.xy!, C.y!])}
              fill={colors.right}
              stroke="rgba(0,0,0,0.18)"
              strokeWidth={0.8}
            />
            <polygon
              points={poly([C.y!, C.xy!, C.xyz!, C.yz!])}
              fill={colors.top}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth={0.8}
            />
          </g>
        );
      })}

      <polyline
        points={poly([O.o!, O.x!, O.xy!, O.y!, O.o!])}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <line x1={O.y!.x} y1={O.y!.y} x2={O.yz!.x} y2={O.yz!.y} stroke="var(--accent)" strokeWidth={1.4} strokeOpacity={0.7} />
      <line x1={O.x!.x} y1={O.x!.y} x2={O.xz!.x} y2={O.xz!.y} stroke="var(--accent)" strokeWidth={1.4} strokeOpacity={0.7} />
      <line x1={O.xy!.x} y1={O.xy!.y} x2={O.xyz!.x} y2={O.xyz!.y} stroke="var(--accent)" strokeWidth={1.4} strokeOpacity={0.7} />

      <text x={8} y={16} className="fill-foreground" style={{ fontSize: 12, fontWeight: 600 }}>
        {placements.length === 0
          ? da
            ? "Ingen genstande pakket"
            : "No items packed"
          : da
            ? `${placements.length} genstand${placements.length === 1 ? "" : "e"} i kassen`
            : `${placements.length} item${placements.length === 1 ? "" : "s"} in the box`}
        {placements.length > 48
          ? da
            ? " (viser 48)"
            : " (showing 48)"
          : ""}
      </text>
      <text
        x={(O.o!.x + O.x!.x) / 2}
        y={O.o!.y + 14}
        textAnchor="middle"
        className="fill-muted"
        style={{ fontSize: 11 }}
      >
        {formatDim(box.w, da ? "da" : "en")}
      </text>
    </svg>
  );
}

export function BoxfitTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [box, setBox] = useState(BOX_DEFAULT);
  const [items, setItems] = useState<ItemRow[]>(defaultItems);

  function setBoxField(key: keyof typeof BOX_DEFAULT, v: string) {
    setBox((prev) => ({ ...prev, [key]: v }));
  }

  function updateItem(id: string, patch: Partial<ItemRow>) {
    setItems((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addItem() {
    setItems((rows) => [
      ...rows,
      { id: newId(), name: "", w: "10", h: "10", d: "10", qty: "1" },
    ]);
  }

  function removeItem(id: string) {
    setItems((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)));
  }

  function fillMax(id: string) {
    const bw = parseDim(box.bw);
    const bh = parseDim(box.bh);
    const bd = parseDim(box.bd);
    if (bw === null || bh === null || bd === null) return;
    const row = items.find((r) => r.id === id);
    if (!row) return;
    const w = parseDim(row.w);
    const h = parseDim(row.h);
    const d = parseDim(row.d);
    if (w === null || h === null || d === null) return;
    const max = maxGridFit({ w, h, d }, { w: bw, h: bh, d: bd }).count;
    updateItem(id, { qty: String(max) });
  }

  const parsedBox = useMemo(() => {
    const w = parseDim(box.bw);
    const h = parseDim(box.bh);
    const d = parseDim(box.bd);
    if (w === null || h === null || d === null) return null;
    return { w, h, d } satisfies BoxDims;
  }, [box]);

  const parsedItems = useMemo(() => {
    return items.map((row, index) => {
      const w = parseDim(row.w);
      const h = parseDim(row.h);
      const d = parseDim(row.d);
      const qty = parseCount(row.qty);
      const dims =
        w !== null && h !== null && d !== null ? { w, h, d } : null;
      const name =
        row.name.trim() ||
        (da ? `Genstand ${index + 1}` : `Item ${index + 1}`);
      return { row, dims, qty, name };
    });
  }, [items, da]);

  const analysis = useMemo(() => {
    if (!parsedBox) return null;
    const valid = parsedItems.filter(
      (p) => p.dims && p.qty !== null && p.qty > 0,
    );
    const perItem = parsedItems.map((p) => {
      if (!p.dims) return { ...p, alone: null as ReturnType<typeof computeBoxFit> | null };
      return { ...p, alone: computeBoxFit(p.dims, parsedBox) };
    });
    const packItems = valid.map((p) => ({
      id: p.row.id,
      name: p.name,
      dims: p.dims!,
      want: p.qty!,
    }));
    const mixed = packMixed(packItems, parsedBox);
    return { perItem, mixed, packItems };
  }, [parsedBox, parsedItems]);

  return (
    <div className="kit-tool mx-auto max-w-5xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Se om genstande passer i en kasse, hvor mange der er plads til, og pak flere forskellige emner sammen. Drejning er tilladt, men siderne følger kassens akser."
          : "See whether items fit in a box, how many will fit, and pack several different items together. Rotation is allowed, but sides stay axis-aligned."}
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {da ? "Opdateres mens du skriver" : "Updates as you type"}
          </p>

          <div>
            <h2 className="mb-2 text-sm font-medium text-foreground">
              {da ? "Kasse" : "Box"}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <Field label={da ? "Bredde" : "Width"}>
                <KitInput
                  inputMode="decimal"
                  value={box.bw}
                  onChange={(e) => setBoxField("bw", e.target.value)}
                />
              </Field>
              <Field label={da ? "Højde" : "Height"}>
                <KitInput
                  inputMode="decimal"
                  value={box.bh}
                  onChange={(e) => setBoxField("bh", e.target.value)}
                />
              </Field>
              <Field label={da ? "Dybde" : "Depth"}>
                <KitInput
                  inputMode="decimal"
                  value={box.bd}
                  onChange={(e) => setBoxField("bd", e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-foreground">
                {da ? "Genstande" : "Items"}
              </h2>
              <button type="button" className={secondaryBtnClass} onClick={addItem}>
                {da ? "Tilføj genstand" : "Add item"}
              </button>
            </div>

            {items.map((row, index) => (
              <div
                key={row.id}
                className="space-y-2 rounded-[12px] border border-border bg-background/50 p-3"
              >
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div className="flex min-w-[12rem] flex-1 items-end gap-2">
                    <span
                      className="mb-2.5 inline-block h-3 w-3 shrink-0 rounded-[3px]"
                      style={{
                        background:
                          ITEM_COLORS[index % ITEM_COLORS.length]!.top,
                      }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <Field label={da ? "Navn (valgfrit)" : "Name (optional)"}>
                        <KitInput
                          value={row.name}
                          onChange={(e) =>
                            updateItem(row.id, { name: e.target.value })
                          }
                          placeholder={
                            da ? `Genstand ${index + 1}` : `Item ${index + 1}`
                          }
                        />
                      </Field>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={secondaryBtnClass}
                    onClick={() => removeItem(row.id)}
                    disabled={items.length <= 1}
                  >
                    {da ? "Fjern" : "Remove"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Field label={da ? "Bredde" : "Width"}>
                    <KitInput
                      inputMode="decimal"
                      value={row.w}
                      onChange={(e) => updateItem(row.id, { w: e.target.value })}
                    />
                  </Field>
                  <Field label={da ? "Højde" : "Height"}>
                    <KitInput
                      inputMode="decimal"
                      value={row.h}
                      onChange={(e) => updateItem(row.id, { h: e.target.value })}
                    />
                  </Field>
                  <Field label={da ? "Dybde" : "Depth"}>
                    <KitInput
                      inputMode="decimal"
                      value={row.d}
                      onChange={(e) => updateItem(row.id, { d: e.target.value })}
                    />
                  </Field>
                  <Field label={da ? "Antal" : "Qty"}>
                    <KitInput
                      inputMode="numeric"
                      value={row.qty}
                      onChange={(e) => updateItem(row.id, { qty: e.target.value })}
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  className={secondaryBtnClass}
                  onClick={() => fillMax(row.id)}
                >
                  {da ? "Fyld med maks. af denne" : "Fill with max of this"}
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={secondaryBtnClass}
            onClick={() => {
              setBox(BOX_DEFAULT);
              setItems(defaultItems());
            }}
          >
            {da ? "Nulstil" : "Reset"}
          </button>
        </section>

        <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
          {!parsedBox || !analysis ? (
            <p className="text-sm text-muted">
              {da
                ? "Indtast positive mål for kassen og mindst én genstand."
                : "Enter positive sizes for the box and at least one item."}
            </p>
          ) : (
            <>
              <div
                className={`rounded-[12px] border px-4 py-3 ${
                  analysis.mixed.allFit
                    ? "border-accent/40 bg-accent-soft"
                    : "border-[#c45c3e]/55"
                }`}
                style={
                  analysis.mixed.allFit
                    ? undefined
                    : {
                        background:
                          "color-mix(in srgb, #c45c3e 12%, transparent)",
                      }
                }
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? "Samlet pakning" : "Combined pack"}
                </p>
                <p className="mt-1 font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
                  {analysis.mixed.allFit
                    ? da
                      ? "Alt er pakket"
                      : "Everything packed"
                    : da
                      ? "Ikke plads til det hele"
                      : "Not enough room for all"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {da
                    ? `${analysis.mixed.placements.length} stk. pakket · ${Math.round(analysis.mixed.fillRatio * 100)}% fyldt (grådig 3D-pakning).`
                    : `${analysis.mixed.placements.length} pcs packed · ${Math.round(analysis.mixed.fillRatio * 100)}% full (greedy 3D pack).`}
                </p>
              </div>

              <div className="rounded-[12px] border border-border bg-background/50 p-3">
                <PackDiagram
                  box={parsedBox}
                  placements={analysis.mixed.placements}
                  da={da}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? "Pr. genstand" : "Per item"}
                </p>
                {analysis.perItem.map((p, index) => {
                  if (!p.alone) {
                    return (
                      <div
                        key={p.row.id}
                        className="rounded-[10px] border border-border px-3 py-2 text-sm text-muted"
                      >
                        {p.name}: {da ? "ugyldige mål" : "invalid sizes"}
                      </div>
                    );
                  }
                  const packed = analysis.mixed.packedById[p.row.id] ?? 0;
                  const short = analysis.mixed.shortById[p.row.id] ?? 0;
                  const want = p.qty ?? 0;
                  return (
                    <div
                      key={p.row.id}
                      className="rounded-[10px] border border-border bg-background/60 px-3 py-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          <span
                            className="mr-2 inline-block h-2.5 w-2.5 rounded-[3px] align-middle"
                            style={{
                              background:
                                ITEM_COLORS[index % ITEM_COLORS.length]!.top,
                            }}
                            aria-hidden
                          />
                          {p.name}
                        </p>
                        <p className="text-xs text-muted">
                          {formatDim(p.dims!.w, da ? "da" : "en")}×
                          {formatDim(p.dims!.h, da ? "da" : "en")}×
                          {formatDim(p.dims!.d, da ? "da" : "en")}
                        </p>
                      </div>
                      <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-muted">
                            {da ? "Maks. alene i kassen" : "Max alone in box"}
                          </dt>
                          <dd className="font-medium tabular-nums text-foreground">
                            {p.alone.maxCount}
                            <span className="ml-1 text-xs font-normal text-muted">
                              ({p.alone.grid.nx}×{p.alone.grid.ny}×{p.alone.grid.nz})
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted">
                            {da ? "I blandet pakning" : "In mixed pack"}
                          </dt>
                          <dd className="font-medium tabular-nums text-foreground">
                            {packed}/{want}
                            {short > 0 ? (
                              <span className="ml-1 text-xs font-normal text-[#c45c3e]">
                                ({da ? "mangler" : "short"} {short})
                              </span>
                            ) : null}
                          </dd>
                        </div>
                        <div className="sm:col-span-2 text-xs text-muted">
                          {p.alone.fits
                            ? da
                              ? `Én passer. Volumen tillader op til ${p.alone.volumeCap} (gitteret er strammere).`
                              : `One fits. Volume allows up to ${p.alone.volumeCap} (the grid is tighter).`
                            : da
                              ? "Én passer ikke, selv efter drejning."
                              : "One does not fit, even after rotation."}
                        </div>
                      </dl>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
                <div className="rounded-[10px] border border-border px-2 py-2">
                  <p className="text-muted">{da ? "Brugt" : "Used"}</p>
                  <p className="mt-0.5 tabular-nums font-medium text-foreground">
                    {formatDim(analysis.mixed.usedVol, da ? "da" : "en")}
                  </p>
                </div>
                <div className="rounded-[10px] border border-border px-2 py-2">
                  <p className="text-muted">{da ? "Kasse" : "Box"}</p>
                  <p className="mt-0.5 tabular-nums font-medium text-foreground">
                    {formatDim(analysis.mixed.boxVol, da ? "da" : "en")}
                  </p>
                </div>
                <div className="rounded-[10px] border border-border px-2 py-2">
                  <p className="text-muted">{da ? "Ledigt" : "Spare"}</p>
                  <p className="mt-0.5 tabular-nums font-medium text-foreground">
                    {formatDim(
                      Math.max(0, analysis.mixed.boxVol - analysis.mixed.usedVol),
                      da ? "da" : "en",
                    )}
                  </p>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <p className="text-xs text-muted">
        {da
          ? "Brug samme enhed overalt. Pakningen er en hurtig 3D-heuristik (ikke garanteret optimal). Klik “Fyld med maks. af denne” for at sætte antal til det bedste gitter for den genstand alene."
          : "Use the same unit everywhere. Packing is a fast 3D heuristic (not guaranteed optimal). Click “Fill with max of this” to set quantity to the best grid for that item alone."}
      </p>
    </div>
  );
}
