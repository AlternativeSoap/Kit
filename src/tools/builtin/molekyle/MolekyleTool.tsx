"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Field,
  KitInput,
  Segmented,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  MOLECULES,
  atomColor,
  atomRadius,
  matchesMolecule,
  type Molecule,
} from "./molecules";

type ViewMode = "browse" | "detail";
type SketchMode = "3d" | "2d";

type Vec3 = { x: number; y: number; z: number };

function rotateY(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}

function rotateX(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

function MoleculeViewer3D({ mol }: { mol: Molecule }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rot, setRot] = useState({ x: 0.35, y: 0.4 });
  const drag = useRef<{
    active: boolean;
    lx: number;
    ly: number;
    rx: number;
    ry: number;
  } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const w = Math.max(1, Math.floor(cssW * dpr));
    const h = Math.max(1, Math.floor(cssH * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const projected = mol.atoms.map((atom, i) => {
      let p: Vec3 = { x: atom.x, y: atom.y, z: atom.z };
      p = rotateY(p, rot.y);
      p = rotateX(p, rot.x);
      return { ...atom, i, px: p.x, py: p.y, pz: p.z };
    });

    const maxR = Math.max(
      1.2,
      ...projected.map((a) => Math.hypot(a.px, a.py) + atomRadius(a.el)),
    );
    const scale = (Math.min(cssW, cssH) * 0.38) / maxR;
    const cx = cssW / 2;
    const cy = cssH / 2;

    const screen = projected.map((a) => ({
      ...a,
      sx: cx + a.px * scale,
      sy: cy - a.py * scale,
      r: atomRadius(a.el) * scale * 0.55,
    }));

    for (const bond of mol.bonds) {
      const a = screen[bond.a];
      const b = screen[bond.b];
      if (!a || !b) continue;
      const order = bond.order ?? 1;
      const dx = b.sx - a.sx;
      const dy = b.sy - a.sy;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (-dy / len) * 3.5;
      const ny = (dx / len) * 3.5;
      ctx.strokeStyle = "rgba(120,120,120,0.85)";
      ctx.lineWidth = 2;
      for (let o = 0; o < order; o += 1) {
        const off = order === 1 ? 0 : (o - (order - 1) / 2) * 1;
        ctx.beginPath();
        ctx.moveTo(a.sx + nx * off, a.sy + ny * off);
        ctx.lineTo(b.sx + nx * off, b.sy + ny * off);
        ctx.stroke();
      }
    }

    const sorted = [...screen].sort((a, b) => a.pz - b.pz);
    for (const a of sorted) {
      const color = atomColor(a.el);
      const grd = ctx.createRadialGradient(
        a.sx - a.r * 0.3,
        a.sy - a.r * 0.35,
        a.r * 0.1,
        a.sx,
        a.sy,
        a.r,
      );
      grd.addColorStop(0, "#ffffff");
      grd.addColorStop(0.35, color);
      grd.addColorStop(1, shade(color, -40));
      ctx.beginPath();
      ctx.fillStyle = grd;
      ctx.arc(a.sx, a.sy, a.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();
      if (a.r > 10) {
        ctx.fillStyle = a.el === "H" || a.el === "C" ? "#111" : "#fff";
        ctx.font = `600 ${Math.max(9, a.r * 0.55)}px system-ui,sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(a.el, a.sx, a.sy + 0.5);
      }
    }
  }, [mol, rot]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  function onPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      active: true,
      lx: e.clientX,
      ly: e.clientY,
      rx: rot.x,
      ry: rot.y,
    };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    const d = drag.current;
    if (!d?.active) return;
    const dx = e.clientX - d.lx;
    const dy = e.clientY - d.ly;
    setRot({
      x: d.rx + dy * 0.01,
      y: d.ry + dx * 0.01,
    });
  }

  function onPointerUp() {
    if (drag.current) drag.current.active = false;
  }

  return (
    <canvas
      ref={canvasRef}
      className="h-56 w-full touch-none rounded-[12px] border border-border bg-background sm:h-64"
      style={{ cursor: "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label="3D molecule"
    />
  );
}

function shade(hex: string, amount: number): string {
  const n = hex.replace("#", "");
  const num = Number.parseInt(n.length === 3 ? n.replace(/(.)/g, "$1$1") : n, 16);
  if (!Number.isFinite(num)) return hex;
  const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + amount));
  const b = Math.min(255, Math.max(0, (num & 255) + amount));
  return `rgb(${r},${g},${b})`;
}

function Sketch2D({ mol }: { mol: Molecule }) {
  const pts = mol.sketch2d ?? mol.atoms.map((a) => ({ x: a.x * 0.4, y: -a.y * 0.4 }));
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const scale = 70;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-56 w-full max-w-xs rounded-[12px] border border-border bg-background sm:h-64"
      role="img"
      aria-label="2D structure"
    >
      {mol.bonds.map((bond, i) => {
        const a = pts[bond.a];
        const b = pts[bond.b];
        if (!a || !b) return null;
        const order = bond.order ?? 1;
        const x1 = cx + a.x * scale;
        const y1 = cy + a.y * scale;
        const x2 = cx + b.x * scale;
        const y2 = cy + b.y * scale;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const nx = (-dy / len) * 3;
        const ny = (dx / len) * 3;
        return Array.from({ length: order }, (_, o) => {
          const off = order === 1 ? 0 : o - (order - 1) / 2;
          return (
            <line
              key={`${i}-${o}`}
              x1={x1 + nx * off}
              y1={y1 + ny * off}
              x2={x2 + nx * off}
              y2={y2 + ny * off}
              stroke="currentColor"
              strokeWidth={2}
              className="text-muted"
            />
          );
        });
      })}
      {mol.atoms.map((atom, i) => {
        const p = pts[i];
        if (!p) return null;
        const x = cx + p.x * scale;
        const y = cy + p.y * scale;
        const r = atom.el === "H" ? 10 : 14;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={atomColor(atom.el)} stroke="rgba(0,0,0,0.2)" />
            <text
              x={x}
              y={y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={600}
              fill={atom.el === "H" || atom.el === "C" ? "#111" : "#fff"}
            >
              {atom.el}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function MolekyleTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(MOLECULES[0]?.id ?? "h2o");
  const [view, setView] = useState<ViewMode>("browse");
  const [sketch, setSketch] = useState<SketchMode>("3d");
  const detailRef = useRef<HTMLElement>(null);

  const filtered = useMemo(
    () => MOLECULES.filter((m) => matchesMolecule(m, query)),
    [query],
  );

  const selected = useMemo(
    () => MOLECULES.find((m) => m.id === selectedId) ?? MOLECULES[0]!,
    [selectedId],
  );

  function select(m: Molecule) {
    setSelectedId(m.id);
    setView("detail");
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  return (
    <div className="kit-tool mx-auto max-w-4xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Udforsk almindelige molekyler med formel, molmasse og en enkel 3D-model. Træk for at dreje."
          : "Explore common molecules with formula, molar mass, and a simple 3D model. Drag to rotate."}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={view}
          onChange={setView}
          ariaLabel={da ? "Visning" : "View"}
          options={[
            { id: "browse", label: da ? "Liste" : "Browse" },
            { id: "detail", label: da ? "Detalje" : "Detail" },
          ]}
        />
        <Field label={da ? "Søg" : "Search"}>
          <KitInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={da ? "Navn eller formel" : "Name or formula"}
            aria-label={da ? "Søg molekyle" : "Search molecule"}
          />
        </Field>
      </div>

      {view === "browse" ? (
        <section className="kit-tool-panel space-y-3 p-3 sm:p-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted">
              {da ? "Ingen molekyler matcher søgningen." : "No molecules match your search."}
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {filtered.map((m) => {
                const active = m.id === selectedId;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => select(m)}
                      className={`kit-touch-target flex w-full flex-col items-start gap-0.5 rounded-[10px] border px-3 py-2.5 text-left transition-[background-color,border-color] sm:min-h-0 ${
                        active
                          ? "border-accent bg-accent-soft"
                          : "border-border bg-background hover:bg-overlay"
                      }`}
                    >
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {m.formula}
                      </span>
                      <span className="text-sm text-foreground">
                        {da ? m.nameDa : m.nameEn}
                      </span>
                      <span className="text-xs text-muted">
                        {m.molarMass.toFixed(3)} g/mol
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      <section
        ref={detailRef}
        className="kit-tool-panel space-y-4 p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {da ? selected.nameDa : selected.nameEn}
            </h2>
            <p className="font-mono text-sm text-muted">{selected.formula}</p>
          </div>
          <div className="kit-h-scroll gap-2">
            <button
              type="button"
              className={`${secondaryBtnClass} ${
                sketch === "3d" ? "border-accent bg-accent-soft" : ""
              }`}
              onClick={() => setSketch("3d")}
            >
              3D
            </button>
            <button
              type="button"
              className={`${secondaryBtnClass} ${
                sketch === "2d" ? "border-accent bg-accent-soft" : ""
              }`}
              onClick={() => setSketch("2d")}
            >
              2D
            </button>
          </div>
        </div>

        {sketch === "3d" ? (
          <div className="space-y-2">
            <MoleculeViewer3D mol={selected} />
            <p className="text-xs text-muted">
              {da
                ? "Træk på modellen for at dreje den. Geometrien er forenklet."
                : "Drag the model to rotate it. Geometry is approximate."}
            </p>
          </div>
        ) : (
          <Sketch2D mol={selected} />
        )}

        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {da ? "Molmasse" : "Molar mass"}
            </dt>
            <dd className="mt-0.5 text-sm tabular-nums text-foreground">
              {selected.molarMass.toFixed(3)} g/mol
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {da ? "Atomer" : "Atoms"}
            </dt>
            <dd className="mt-0.5 text-sm text-foreground">{selected.atoms.length}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {da ? "Om" : "About"}
            </dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
              {da ? selected.aboutDa : selected.aboutEn}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {da ? "Anvendelse" : "Uses"}
            </dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-foreground">
              {da ? selected.usesDa : selected.usesEn}
            </dd>
          </div>
        </dl>

        <div className="kit-h-scroll gap-2">
          {MOLECULES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => select(m)}
              className={`kit-touch-target shrink-0 rounded-[8px] border px-2.5 py-1.5 text-xs font-mono sm:min-h-0 ${
                m.id === selectedId
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-border bg-background text-muted hover:text-foreground"
              }`}
            >
              {m.formula}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
