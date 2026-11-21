"use client";

import { useMemo, useState } from "react";
import { Field,
  KitInput,
  Segmented,
  secondaryBtnClass, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  type ShapeId,
  angleOppositeA,
  circleMetrics,
  clampInt,
  clampPositive,
  fmt,
  pythagorasSolve,
  rectangleMetrics,
  regularPolygonMetrics,
  triangleMetrics,
} from "./calc";

type Mode = "shapes" | "pythagoras";

function num(raw: string, fallback: number): number {
  const v = Number(String(raw).replace(",", "."));
  return Number.isFinite(v) ? v : fallback;
}

function ShapePreview({
  shape,
  a,
  b,
  c,
  w,
  h,
  r,
  sides,
  side,
}: {
  shape: ShapeId;
  a: number;
  b: number;
  c: number;
  w: number;
  h: number;
  r: number;
  sides: number;
  side: number;
}) {
  const vb = 200;
  const pad = 24;
  const stroke = "var(--foreground)";
  const fill = "color-mix(in srgb, var(--accent) 22%, transparent)";

  if (shape === "circle") {
    const rad = Math.min(70, Math.max(12, r * 8));
    return (
      <svg viewBox={`0 0 ${vb} ${vb}`} className="h-auto w-full max-w-[280px]" aria-hidden>
        <circle cx={vb / 2} cy={vb / 2} r={rad} fill={fill} stroke={stroke} strokeWidth={2} />
        <line
          x1={vb / 2}
          y1={vb / 2}
          x2={vb / 2 + rad}
          y2={vb / 2}
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <text x={vb / 2 + rad / 2} y={vb / 2 - 6} textAnchor="middle" fontSize={11} fill="var(--muted)">
          r
        </text>
      </svg>
    );
  }

  if (shape === "rectangle") {
    const maxW = vb - pad * 2;
    const maxH = vb - pad * 2;
    const scale = Math.min(maxW / Math.max(w, 0.01), maxH / Math.max(h, 0.01));
    const rw = Math.max(20, w * scale);
    const rh = Math.max(20, h * scale);
    const x = (vb - rw) / 2;
    const y = (vb - rh) / 2;
    return (
      <svg viewBox={`0 0 ${vb} ${vb}`} className="h-auto w-full max-w-[280px]" aria-hidden>
        <rect x={x} y={y} width={rw} height={rh} fill={fill} stroke={stroke} strokeWidth={2} rx={2} />
        <text x={vb / 2} y={y - 6} textAnchor="middle" fontSize={11} fill="var(--muted)">
          w
        </text>
        <text x={x - 8} y={vb / 2} textAnchor="end" fontSize={11} fill="var(--muted)" dominantBaseline="middle">
          h
        </text>
      </svg>
    );
  }

  if (shape === "polygon") {
    const n = clampInt(sides, 3, 12);
    const R = 70;
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      pts.push(`${vb / 2 + R * Math.cos(ang)},${vb / 2 + R * Math.sin(ang)}`);
    }
    return (
      <svg viewBox={`0 0 ${vb} ${vb}`} className="h-auto w-full max-w-[280px]" aria-hidden>
        <polygon points={pts.join(" ")} fill={fill} stroke={stroke} strokeWidth={2} />
        <text x={vb / 2} y={vb - 10} textAnchor="middle" fontSize={11} fill="var(--muted)">
          {n}-gon · s={fmt(side, 1)}
        </text>
      </svg>
    );
  }

  // Triangle: place on base c, scale to fit
  const metrics = triangleMetrics(a, b, c);
  let x1 = pad;
  let y1 = vb - pad;
  let x2 = vb - pad;
  let y2 = vb - pad;
  let x3 = vb / 2;
  let y3 = pad;
  if (metrics.valid) {
    const base = c;
    const height = (2 * metrics.area) / base;
    const foot = (a * a - height * height + base * base) / (2 * base);
    const scale = Math.min((vb - 2 * pad) / base, (vb - 2 * pad) / Math.max(height, 0.01));
    const bx = (vb - base * scale) / 2;
    const by = vb - pad;
    x1 = bx;
    y1 = by;
    x2 = bx + base * scale;
    y2 = by;
    x3 = bx + foot * scale;
    y3 = by - height * scale;
  }

  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} className="h-auto w-full max-w-[280px]" aria-hidden>
      <polygon
        points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
        opacity={metrics.valid ? 1 : 0.45}
      />
      <text x={(x1 + x2) / 2} y={y1 + 14} textAnchor="middle" fontSize={11} fill="var(--muted)">
        c
      </text>
      <text x={(x1 + x3) / 2 - 8} y={(y1 + y3) / 2} textAnchor="middle" fontSize={11} fill="var(--muted)">
        b
      </text>
      <text x={(x2 + x3) / 2 + 8} y={(y2 + y3) / 2} textAnchor="middle" fontSize={11} fill="var(--muted)">
        a
      </text>
    </svg>
  );
}

function MetricCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-surface px-3 py-2.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-foreground">
        {value}
        {unit ? <span className="ml-1 text-xs font-normal text-muted">{unit}</span> : null}
      </p>
    </div>
  );
}

export function GeometriTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<Mode>("shapes");
  const [shape, setShape] = useState<ShapeId>("triangle");

  const [sideA, setSideA] = useState("5");
  const [sideB, setSideB] = useState("4");
  const [sideC, setSideC] = useState("3");
  const [width, setWidth] = useState("6");
  const [height, setHeight] = useState("4");
  const [radius, setRadius] = useState("3");
  const [polySides, setPolySides] = useState("6");
  const [polySide, setPolySide] = useState("2");

  const [pyA, setPyA] = useState("3");
  const [pyB, setPyB] = useState("4");
  const [pyC, setPyC] = useState("");

  const a = clampPositive(num(sideA, 5));
  const b = clampPositive(num(sideB, 4));
  const c = clampPositive(num(sideC, 3));
  const w = clampPositive(num(width, 6));
  const h = clampPositive(num(height, 4));
  const r = clampPositive(num(radius, 3));
  const nSides = clampInt(num(polySides, 6), 3, 12);
  const sLen = clampPositive(num(polySide, 2));

  const tri = useMemo(() => triangleMetrics(a, b, c), [a, b, c]);
  const rect = useMemo(() => rectangleMetrics(w, h), [w, h]);
  const circ = useMemo(() => circleMetrics(r), [r]);
  const poly = useMemo(() => regularPolygonMetrics(nSides, sLen), [nSides, sLen]);

  const pyResult = useMemo(() => {
    const parseOpt = (raw: string) => {
      const t = raw.trim();
      if (!t) return null;
      const v = Number(t.replace(",", "."));
      return Number.isFinite(v) && v > 0 ? v : null;
    };
    return pythagorasSolve(parseOpt(pyA), parseOpt(pyB), parseOpt(pyC));
  }, [pyA, pyB, pyC]);

  const applyRightTriangle = () => {
    if (!pyResult || pyResult.solved === "bad") return;
    setSideA(fmt(pyResult.a, 4));
    setSideB(fmt(pyResult.b, 4));
    setSideC(fmt(pyResult.c, 4));
    setShape("triangle");
    setMode("shapes");
  };

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Tegn figurer, juster mål, og se areal, omkreds og vinkler med det samme. Brug Pythagoras-hjælperen til retvinklede trekanter."
          : "Draw shapes, adjust dimensions, and see area, perimeter, and angles live. Use the Pythagoras helper for right triangles."}
      </p>

      <Segmented
        value={mode}
        onChange={setMode}
        ariaLabel={da ? "Tilstand" : "Mode"}
        options={[
          { id: "shapes", label: da ? "Figurer" : "Shapes" },
          { id: "pythagoras", label: "Pythagoras" },
        ]}
      />

      {mode === "shapes" ? (
        <div className="kit-fade-in space-y-5">
          <Segmented
            value={shape}
            onChange={setShape}
            ariaLabel={da ? "Figur" : "Shape"}
            options={[
              { id: "triangle", label: da ? "Trekant" : "Triangle" },
              { id: "rectangle", label: da ? "Rektangel" : "Rectangle" },
              { id: "circle", label: da ? "Cirkel" : "Circle" },
              { id: "polygon", label: da ? "Polygon" : "Polygon" },
            ]}
          />

          <section className="kit-tool-panel grid gap-5 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:p-5">
            <div className="flex items-center justify-center rounded-[12px] border border-border bg-overlay/40 p-3">
              <ShapePreview
                shape={shape}
                a={a}
                b={b}
                c={c}
                w={w}
                h={h}
                r={r}
                sides={nSides}
                side={sLen}
              />
            </div>

            <div className="space-y-4">
              {shape === "triangle" ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <Field label="a">
                      <KitInput
                        inputMode="decimal"
                        value={sideA}
                        onChange={(e) => setSideA(e.target.value)}
                        className={`${fieldClass} tabular-nums`}
                      />
                    </Field>
                    <Field label="b">
                      <KitInput
                        inputMode="decimal"
                        value={sideB}
                        onChange={(e) => setSideB(e.target.value)}
                        className={`${fieldClass} tabular-nums`}
                      />
                    </Field>
                    <Field label="c">
                      <KitInput
                        inputMode="decimal"
                        value={sideC}
                        onChange={(e) => setSideC(e.target.value)}
                        className={`${fieldClass} tabular-nums`}
                      />
                    </Field>
                  </div>
                  {!tri.valid ? (
                    <p role="alert" className="text-sm text-muted">
                      {da
                        ? "Siderne danner ikke en gyldig trekant. Tjek uligheden a+b>c."
                        : "These sides do not form a valid triangle. Check a+b>c."}
                    </p>
                  ) : null}
                </>
              ) : null}

              {shape === "rectangle" ? (
                <div className="grid grid-cols-2 gap-3">
                  <Field label={da ? "Bredde (w)" : "Width (w)"}>
                    <KitInput
                      inputMode="decimal"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className={`${fieldClass} tabular-nums`}
                    />
                  </Field>
                  <Field label={da ? "Højde (h)" : "Height (h)"}>
                    <KitInput
                      inputMode="decimal"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className={`${fieldClass} tabular-nums`}
                    />
                  </Field>
                </div>
              ) : null}

              {shape === "circle" ? (
                <Field label={da ? "Radius (r)" : "Radius (r)"}>
                  <KitInput
                    inputMode="decimal"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className={`${fieldClass} tabular-nums`}
                  />
                </Field>
              ) : null}

              {shape === "polygon" ? (
                <div className="grid grid-cols-2 gap-3">
                  <Field label={da ? "Antal sider" : "Sides"} hint="3–12">
                    <KitInput
                      inputMode="numeric"
                      value={polySides}
                      onChange={(e) => setPolySides(e.target.value)}
                      onBlur={() => setPolySides(String(nSides))}
                      className={`${fieldClass} tabular-nums`}
                    />
                  </Field>
                  <Field label={da ? "Sidens længde" : "Side length"}>
                    <KitInput
                      inputMode="decimal"
                      value={polySide}
                      onChange={(e) => setPolySide(e.target.value)}
                      className={`${fieldClass} tabular-nums`}
                    />
                  </Field>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                {shape === "triangle" && tri.valid ? (
                  <>
                    <MetricCard label={da ? "Areal" : "Area"} value={fmt(tri.area)} />
                    <MetricCard label={da ? "Omkreds" : "Perimeter"} value={fmt(tri.perimeter)} />
                    <MetricCard label={da ? "Vinkel A (mod a)" : "Angle A (opp. a)"} value={`${fmt(tri.A, 1)}°`} />
                    <MetricCard label={da ? "Vinkel B (mod b)" : "Angle B (opp. b)"} value={`${fmt(tri.B, 1)}°`} />
                    <MetricCard label={da ? "Vinkel C (mod c)" : "Angle C (opp. c)"} value={`${fmt(tri.C, 1)}°`} />
                    <MetricCard
                      label={da ? "Største vinkel" : "Largest angle"}
                      value={`${fmt(Math.max(tri.A, tri.B, tri.C), 1)}°`}
                    />
                  </>
                ) : null}
                {shape === "rectangle" ? (
                  <>
                    <MetricCard label={da ? "Areal" : "Area"} value={fmt(rect.area)} />
                    <MetricCard label={da ? "Omkreds" : "Perimeter"} value={fmt(rect.perimeter)} />
                    <MetricCard label={da ? "Diagonal" : "Diagonal"} value={fmt(Math.sqrt(w * w + h * h))} />
                    <MetricCard
                      label={da ? "Bredde/højde" : "Aspect"}
                      value={fmt(w / h, 3)}
                    />
                  </>
                ) : null}
                {shape === "circle" ? (
                  <>
                    <MetricCard label={da ? "Areal" : "Area"} value={fmt(circ.area)} />
                    <MetricCard label={da ? "Omkreds" : "Circumference"} value={fmt(circ.perimeter)} />
                    <MetricCard label={da ? "Diameter" : "Diameter"} value={fmt(2 * r)} />
                    <MetricCard label="πr²" value={fmt(Math.PI * r * r)} />
                  </>
                ) : null}
                {shape === "polygon" ? (
                  <>
                    <MetricCard label={da ? "Areal" : "Area"} value={fmt(poly.area)} />
                    <MetricCard label={da ? "Omkreds" : "Perimeter"} value={fmt(poly.perimeter)} />
                    <MetricCard
                      label={da ? "Indre vinkel" : "Interior angle"}
                      value={`${fmt(((nSides - 2) * 180) / nSides, 1)}°`}
                    />
                    <MetricCard
                      label={da ? "Ydre vinkel" : "Exterior angle"}
                      value={`${fmt(360 / nSides, 1)}°`}
                    />
                  </>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <section className="kit-fade-in kit-tool-panel space-y-4 p-4 sm:p-5">
          <p className="text-sm text-muted">
            {da
              ? "Udfyld to af a, b og hypotenusen c. Den manglende side beregnes med a² + b² = c²."
              : "Fill in two of a, b, and hypotenuse c. The missing side is solved with a² + b² = c²."}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Field label={da ? "Katete a" : "Leg a"}>
              <KitInput
                inputMode="decimal"
                value={pyA}
                onChange={(e) => setPyA(e.target.value)}
                placeholder="?"
                className={`${fieldClass} tabular-nums`}
              />
            </Field>
            <Field label={da ? "Katete b" : "Leg b"}>
              <KitInput
                inputMode="decimal"
                value={pyB}
                onChange={(e) => setPyB(e.target.value)}
                placeholder="?"
                className={`${fieldClass} tabular-nums`}
              />
            </Field>
            <Field label={da ? "Hypotenuse c" : "Hypotenuse c"}>
              <KitInput
                inputMode="decimal"
                value={pyC}
                onChange={(e) => setPyC(e.target.value)}
                placeholder="?"
                className={`${fieldClass} tabular-nums`}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { a: "3", b: "4", c: "" },
              { a: "5", b: "12", c: "" },
              { a: "8", b: "15", c: "" },
            ].map((ex) => (
              <button
                key={`${ex.a}-${ex.b}`}
                type="button"
                className={secondaryBtnClass}
                onClick={() => {
                  setPyA(ex.a);
                  setPyB(ex.b);
                  setPyC(ex.c);
                }}
              >
                {ex.a}-{ex.b}-?
              </button>
            ))}
          </div>

          {pyResult == null ? (
            <p className="text-sm text-muted">
              {da ? "Angiv præcis to positive værdier for at løse." : "Enter exactly two positive values to solve."}
            </p>
          ) : pyResult.solved === "bad" ? (
            <p role="alert" className="text-sm text-muted">
              {da
                ? "Tallene opfylder ikke Pythagoras. Tjek om c er hypotenusen."
                : "These numbers do not satisfy Pythagoras. Check that c is the hypotenuse."}
            </p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <MetricCard label="a" value={fmt(pyResult.a, 4)} />
                <MetricCard label="b" value={fmt(pyResult.b, 4)} />
                <MetricCard label="c" value={fmt(pyResult.c, 4)} />
              </div>
              <p className="text-sm text-muted">
                {pyResult.solved === "ok"
                  ? da
                    ? "Alle tre sider stemmer."
                    : "All three sides check out."
                  : da
                    ? `Løste ${pyResult.solved}. Indre vinkler: ${fmt(angleOppositeA(pyResult.a, pyResult.b, pyResult.c) ?? 0, 1)}°, ${fmt(angleOppositeA(pyResult.b, pyResult.a, pyResult.c) ?? 0, 1)}°, 90°.`
                    : `Solved ${pyResult.solved}. Interior angles: ${fmt(angleOppositeA(pyResult.a, pyResult.b, pyResult.c) ?? 0, 1)}°, ${fmt(angleOppositeA(pyResult.b, pyResult.a, pyResult.c) ?? 0, 1)}°, 90°.`}
              </p>
              <button type="button" className={secondaryBtnClass} onClick={applyRightTriangle}>
                {da ? "Brug i trekant-visning" : "Use in triangle view"}
              </button>
            </div>
          )}

          <div className="flex justify-center rounded-[12px] border border-border bg-overlay/40 p-4">
            <svg viewBox="0 0 200 160" className="h-auto w-full max-w-[260px]" aria-hidden>
              <polygon
                points="30,140 170,140 30,40"
                fill="color-mix(in srgb, var(--accent) 22%, transparent)"
                stroke="var(--foreground)"
                strokeWidth={2}
              />
              <rect x={30} y={124} width={14} height={14} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
              <text x={100} y={154} textAnchor="middle" fontSize={12} fill="var(--muted)">
                a
              </text>
              <text x={18} y={95} textAnchor="middle" fontSize={12} fill="var(--muted)">
                b
              </text>
              <text x={110} y={80} textAnchor="middle" fontSize={12} fill="var(--muted)">
                c
              </text>
            </svg>
          </div>
        </section>
      )}
    </div>
  );
}
