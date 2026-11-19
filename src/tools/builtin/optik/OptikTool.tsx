"use client";

import { useMemo, useState } from "react";
import { Field, Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type OpticMode = "lens" | "mirror";

function fmt(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "-";
  const a = Math.abs(n);
  if (a >= 100) return n.toFixed(0);
  if (a >= 10) return n.toFixed(1);
  return n.toFixed(digits);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-surface px-3 py-2.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-mono text-base font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

/** Thin-lens / mirror equation with Cartesian sign convention (object left, light →). */
function solveOptics(f: number, doDist: number) {
  if (Math.abs(doDist) < 1e-9) {
    return { di: NaN, m: NaN, real: false, infinite: false };
  }
  if (Math.abs(doDist - f) < 1e-9) {
    return { di: Infinity, m: Infinity, real: f > 0, infinite: true };
  }
  const di = 1 / (1 / f - 1 / doDist);
  const m = -di / doDist;
  return { di, m, real: di > 0, infinite: false };
}

type RaySeg = { x1: number; y1: number; x2: number; y2: number; dashed?: boolean };

function RayDiagram({
  mode,
  f,
  doDist,
  di,
  m,
  infinite,
}: {
  mode: OpticMode;
  f: number;
  doDist: number;
  di: number;
  m: number;
  infinite: boolean;
}) {
  const W = 640;
  const H = 280;
  const cx = W / 2;
  const cy = H / 2;
  const objH = 48;

  const span = Math.max(
    Math.abs(f) * 2.2,
    Math.abs(doDist) * 1.35,
    infinite ? 0 : Math.abs(di) * 1.35,
    8,
  );
  const scale = (W * 0.42) / span;

  const toX = (phys: number) => cx + phys * scale;
  // Optical distances: object is at −do (left of optic)
  const ox = toX(-doDist);
  const oyTop = cy - objH;
  const fx = toX(f);
  const f2x = toX(-f);

  const showImage = !infinite && Number.isFinite(di) && Number.isFinite(m);
  const ix = showImage ? toX(di) : 0;
  const imgH = showImage ? objH * Math.abs(m) : 0;
  const imgInverted = showImage && m < 0;
  const iyTip = imgInverted ? cy + imgH : cy - imgH;

  const rays: RaySeg[] = [];
  const arrowHead = (
    x: number,
    yTip: number,
    yBase: number,
    color: string,
    key: string,
  ) => {
    const up = yTip < yBase;
    const dir = up ? -1 : 1;
    return (
      <g key={key}>
        <line x1={x} y1={yBase} x2={x} y2={yTip} stroke={color} strokeWidth={2.5} />
        <polygon
          points={
            up
              ? `${x},${yTip} ${x - 5},${yTip - dir * 10} ${x + 5},${yTip - dir * 10}`
              : `${x},${yTip} ${x - 5},${yTip - 10} ${x + 5},${yTip - 10}`
          }
          fill={color}
        />
      </g>
    );
  };

  // Principal rays (paraxial sketch)
  if (mode === "lens") {
    // 1. Parallel → through far focal point (or diverge as if from near F for diverging)
    rays.push({ x1: ox, y1: oyTop, x2: cx, y2: oyTop });
    if (f > 0) {
      const t = (W - 16 - cx) / Math.max(fx - cx, 1e-6);
      const yEnd = oyTop + t * (cy - oyTop);
      rays.push({ x1: cx, y1: oyTop, x2: W - 16, y2: yEnd });
      if (showImage && di < 0) {
        rays.push({ x1: cx, y1: oyTop, x2: ix, y2: iyTip, dashed: true });
      }
    } else {
      // Diverging: emerges as if from near focal point (−|f|)
      const nearF = f2x;
      const slope = (oyTop - cy) / Math.max(cx - nearF, 1e-6);
      rays.push({
        x1: cx,
        y1: oyTop,
        x2: W - 16,
        y2: oyTop + slope * (W - 16 - cx),
      });
      rays.push({ x1: nearF, y1: cy, x2: cx, y2: oyTop, dashed: true });
      if (showImage) {
        rays.push({ x1: cx, y1: oyTop, x2: ix, y2: iyTip, dashed: true });
      }
    }

    // 2. Through optical center
    {
      const slope = (oyTop - cy) / Math.max(ox - cx, 1e-6);
      if (showImage && di < 0) {
        rays.push({ x1: ox, y1: oyTop, x2: cx, y2: cy });
        rays.push({
          x1: cx,
          y1: cy,
          x2: W - 16,
          y2: cy + slope * (W - 16 - cx),
        });
        rays.push({ x1: cx, y1: cy, x2: ix, y2: iyTip, dashed: true });
      } else if (showImage) {
        rays.push({ x1: ox, y1: oyTop, x2: ix, y2: iyTip });
        const ext = ix > cx ? W - 16 : 16;
        const t = (ext - ox) / Math.max(ix - ox, 1e-6);
        rays.push({
          x1: ox,
          y1: oyTop,
          x2: ext,
          y2: oyTop + t * (iyTip - oyTop),
          dashed: true,
        });
      } else {
        rays.push({
          x1: ox,
          y1: oyTop,
          x2: W - 16,
          y2: cy + slope * (W - 16 - cx),
        });
      }
    }

    // 3. Through near focal point → emerges parallel (converging only when object beyond F)
    if (f > 0 && doDist > Math.abs(f)) {
      rays.push({ x1: ox, y1: oyTop, x2: f2x, y2: cy });
      rays.push({ x1: f2x, y1: cy, x2: cx, y2: cy });
      // Actually ray from object through F then to lens height, then parallel
      // Line object through near F, intersect lens, then parallel
      const denom = f2x - ox;
      const yLens = oyTop + ((cy - oyTop) * (cx - ox)) / Math.max(denom, 1e-6);
      rays.pop();
      rays.pop();
      rays.push({ x1: ox, y1: oyTop, x2: cx, y2: yLens });
      rays.push({ x1: cx, y1: yLens, x2: W - 16, y2: yLens });
      if (showImage && di < 0) {
        rays.push({ x1: cx, y1: yLens, x2: ix, y2: iyTip, dashed: true });
      }
    }
  } else {
    // Mirror (reflective side faces left / object)
    // 1. Parallel to axis → reflects through F (concave) or as if from F (convex)
    rays.push({ x1: ox, y1: oyTop, x2: cx, y2: oyTop });
    if (f > 0) {
      const slope = (cy - oyTop) / Math.max(fx - cx, 1e-6);
      rays.push({
        x1: cx,
        y1: oyTop,
        x2: 16,
        y2: oyTop + slope * (16 - cx),
      });
      if (showImage && di > 0) {
        // Real image also on left; extend through image
        rays.push({ x1: cx, y1: oyTop, x2: ix, y2: iyTip });
      } else if (showImage) {
        rays.push({ x1: cx, y1: oyTop, x2: ix, y2: iyTip, dashed: true });
      }
    } else {
      const slope = (oyTop - cy) / Math.max(cx - fx, 1e-6);
      rays.push({
        x1: cx,
        y1: oyTop,
        x2: 16,
        y2: oyTop + slope * (16 - cx),
      });
      rays.push({ x1: fx, y1: cy, x2: cx, y2: oyTop, dashed: true });
      if (showImage) {
        rays.push({ x1: cx, y1: oyTop, x2: ix, y2: iyTip, dashed: true });
      }
    }

    // 2. Toward center of curvature (2F) → reflects back on itself (approx along same line for diagram)
    const cX = toX(2 * f);
    if (Math.abs(cX - ox) > 4) {
      rays.push({ x1: ox, y1: oyTop, x2: cx, y2: cy });
      rays.push({
        x1: cx,
        y1: cy,
        x2: 16,
        y2: cy + ((oyTop - cy) / Math.max(ox - cx, 1e-6)) * (16 - cx),
      });
      if (showImage && di < 0) {
        rays.push({ x1: cx, y1: cy, x2: ix, y2: iyTip, dashed: true });
      }
    }

    // 3. Aimed at F → reflects parallel (concave, object outside F)
    if (f > 0 && doDist > f) {
      const denom = fx - ox;
      const yLens = oyTop + ((cy - oyTop) * (cx - ox)) / Math.max(denom, 1e-6);
      rays.push({ x1: ox, y1: oyTop, x2: cx, y2: yLens });
      rays.push({ x1: cx, y1: yLens, x2: 16, y2: yLens });
      if (showImage && di < 0) {
        rays.push({ x1: cx, y1: yLens, x2: ix, y2: iyTip, dashed: true });
      }
    }
  }

  return (
    <div className="overflow-x-auto rounded-[12px] border border-border bg-overlay/40 p-2 sm:p-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full"
        style={{ minWidth: 280, maxHeight: 320 }}
        role="img"
        aria-label={mode === "lens" ? "Lens ray diagram" : "Mirror ray diagram"}
      >
        {/* Optic axis */}
        <line
          x1={16}
          y1={cy}
          x2={W - 16}
          y2={cy}
          stroke="var(--muted)"
          strokeWidth={1.25}
        />
        <polygon
          points={`${W - 10},${cy} ${W - 20},${cy - 5} ${W - 20},${cy + 5}`}
          fill="var(--muted)"
        />

        {/* Optic element */}
        {mode === "lens" ? (
          <ellipse
            cx={cx}
            cy={cy}
            rx={10}
            ry={78}
            fill="color-mix(in srgb, var(--accent) 18%, transparent)"
            stroke="var(--accent)"
            strokeWidth={2}
          />
        ) : (
          <path
            d={
              f >= 0
                ? `M ${cx + 4} ${cy - 78} Q ${cx - 18} ${cy} ${cx + 4} ${cy + 78}`
                : `M ${cx - 4} ${cy - 78} Q ${cx + 18} ${cy} ${cx - 4} ${cy + 78}`
            }
            fill="none"
            stroke="var(--accent)"
            strokeWidth={3}
          />
        )}

        {/* Focal points */}
        <circle cx={fx} cy={cy} r={3.5} fill="var(--foreground)" />
        <text
          x={fx}
          y={cy + 16}
          textAnchor="middle"
          fontSize={11}
          fill="var(--muted)"
        >
          F
        </text>
        {mode === "lens" || Math.abs(f2x - fx) > 8 ? (
          <>
            <circle cx={f2x} cy={cy} r={3.5} fill="var(--foreground)" />
            <text
              x={f2x}
              y={cy + 16}
              textAnchor="middle"
              fontSize={11}
              fill="var(--muted)"
            >
              {mode === "lens" ? "F′" : "F"}
            </text>
          </>
        ) : null}

        {/* Rays */}
        {rays.map((r, i) => (
          <line
            key={i}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke="var(--accent)"
            strokeWidth={1.4}
            strokeDasharray={r.dashed ? "5 4" : undefined}
            opacity={r.dashed ? 0.75 : 0.95}
          />
        ))}

        {/* Object */}
        {arrowHead(ox, oyTop, cy, "var(--foreground)", "obj")}
        <text
          x={ox}
          y={cy + 28}
          textAnchor="middle"
          fontSize={11}
          fill="var(--muted)"
        >
          O
        </text>

        {/* Image */}
        {showImage && imgH > 2
          ? arrowHead(
              ix,
              iyTip,
              cy,
              "color-mix(in srgb, var(--accent) 70%, var(--foreground))",
              "img",
            )
          : null}
        {showImage ? (
          <text
            x={ix}
            y={imgInverted ? cy + imgH + 18 : cy - imgH - 10}
            textAnchor="middle"
            fontSize={11}
            fill="var(--muted)"
          >
            I
          </text>
        ) : null}
        {infinite ? (
          <text
            x={mode === "lens" ? W - 80 : 80}
            y={40}
            fontSize={12}
            fill="var(--muted)"
          >
            di → ∞
          </text>
        ) : null}
      </svg>
    </div>
  );
}

export function OptikTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<OpticMode>("lens");
  const [f, setF] = useState(4);
  const [doDist, setDoDist] = useState(8);

  const result = useMemo(() => solveOptics(f, doDist), [f, doDist]);

  const typeLabel = (() => {
    if (result.infinite) {
      return da ? "Billede i uendelighed" : "Image at infinity";
    }
    if (!Number.isFinite(result.di)) {
      return da ? "Ugyldigt" : "Invalid";
    }
    if (result.real) {
      return da ? "Reelt billede" : "Real image";
    }
    return da ? "Virtuelt billede" : "Virtual image";
  })();

  const opticHint =
    mode === "lens"
      ? da
        ? "Positiv brændvidde: samlelinse. Negativ: spredelinse. Ligningen er 1/f = 1/do + 1/di."
        : "Positive focal length: converging lens. Negative: diverging. Equation: 1/f = 1/do + 1/di."
      : da
        ? "Positiv brændvidde: konkavt spejl. Negativ: konvekst. Samme linseformel med spejltegn."
        : "Positive focal length: concave mirror. Negative: convex. Same lens formula with mirror signs.";

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Tegn hovedstråler for en tynd linse eller et spejl. Juster brændvidde og objektafstand, og se billedafstand og forstørrelse."
          : "Draw principal rays for a thin lens or a mirror. Adjust focal length and object distance to see image distance and magnification."}
      </p>

      <Segmented
        value={mode}
        onChange={setMode}
        ariaLabel={da ? "Optiktype" : "Optic type"}
        options={[
          { id: "lens", label: da ? "Tynd linse" : "Thin lens" },
          { id: "mirror", label: da ? "Spejl" : "Mirror" },
        ]}
      />

      <RayDiagram
        mode={mode}
        f={f}
        doDist={doDist}
        di={result.di}
        m={result.m}
        infinite={result.infinite}
      />

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <Field
          label={
            da
              ? `Brændvidde f = ${fmt(f)}`
              : `Focal length f = ${fmt(f)}`
          }
          hint={opticHint}
        >
          <input
            type="range"
            min={-10}
            max={10}
            step={0.25}
            value={f}
            onChange={(e) => setF(Number(e.target.value))}
            className="kit-range w-full"
            aria-valuemin={-10}
            aria-valuemax={10}
            aria-valuenow={f}
          />
        </Field>

        <Field
          label={
            da
              ? `Objektafstand do = ${fmt(doDist)}`
              : `Object distance do = ${fmt(doDist)}`
          }
          hint={
            da
              ? "Afstand fra objekt til linse/spejl (altid positiv i denne model)."
              : "Distance from object to the lens or mirror (always positive in this model)."
          }
        >
          <input
            type="range"
            min={1}
            max={16}
            step={0.25}
            value={doDist}
            onChange={(e) => setDoDist(Number(e.target.value))}
            className="kit-range w-full"
            aria-valuemin={1}
            aria-valuemax={16}
            aria-valuenow={doDist}
          />
        </Field>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric
            label={da ? "Billedafstand di" : "Image distance di"}
            value={
              result.infinite
                ? "∞"
                : Number.isFinite(result.di)
                  ? fmt(result.di)
                  : "-"
            }
          />
          <Metric
            label={da ? "Forstørrelse m" : "Magnification m"}
            value={
              result.infinite
                ? "∞"
                : Number.isFinite(result.m)
                  ? fmt(result.m)
                  : "-"
            }
          />
          <Metric label={da ? "Type" : "Type"} value={typeLabel} />
          <Metric
            label={da ? "|m| (størrelse)" : "|m| (size)"}
            value={
              result.infinite
                ? "∞"
                : Number.isFinite(result.m)
                  ? fmt(Math.abs(result.m))
                  : "-"
            }
          />
        </div>

        <p className="text-xs leading-relaxed text-muted">
          {da
            ? "Stiplede stråler viser forlængelser bag spejlet eller den virtuelle side af linsen. Negativ di betyder virtuelt billede. Negativ m betyder omvendt billede."
            : "Dashed rays show extensions behind the mirror or on the virtual side of the lens. Negative di means a virtual image. Negative m means an inverted image."}
        </p>
      </section>
    </div>
  );
}
