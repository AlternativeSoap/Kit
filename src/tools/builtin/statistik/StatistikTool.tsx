"use client";

import { useCallback, useMemo, useState } from "react";
import { Field,
  KitInput,
  Segmented,
  primaryBtnClass,
  secondaryBtnClass, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type DistKind = "normal" | "uniform" | "bernoulli";

/** Mulberry32 seeded PRNG. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randn(rng: () => number): number {
  // Box-Muller
  const u = Math.max(1e-12, rng());
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function sampleDist(
  kind: DistKind,
  n: number,
  rng: () => number,
  params: { mean: number; sd: number; min: number; max: number; p: number },
): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    if (kind === "normal") {
      out.push(params.mean + params.sd * randn(rng));
    } else if (kind === "uniform") {
      out.push(params.min + (params.max - params.min) * rng());
    } else {
      out.push(rng() < params.p ? 1 : 0);
    }
  }
  return out;
}

function meanOf(xs: number[]): number {
  if (xs.length === 0) return NaN;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

function medianOf(xs: number[]): number {
  if (xs.length === 0) return NaN;
  const a = [...xs].sort((p, q) => p - q);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 === 0 ? (a[mid - 1] + a[mid]) / 2 : a[mid];
}

function stdevOf(xs: number[]): number {
  if (xs.length < 2) return NaN;
  const m = meanOf(xs);
  let s = 0;
  for (const x of xs) {
    const d = x - m;
    s += d * d;
  }
  return Math.sqrt(s / (xs.length - 1));
}

function fmt(n: number, digits = 3): string {
  if (!Number.isFinite(n)) return "-";
  return n.toFixed(digits);
}

function histogram(
  xs: number[],
  bins: number,
): { edges: number[]; counts: number[]; min: number; max: number } {
  if (xs.length === 0) {
    return { edges: [], counts: [], min: 0, max: 1 };
  }
  let min = xs[0];
  let max = xs[0];
  for (const x of xs) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  if (min === max) {
    min -= 0.5;
    max += 0.5;
  }
  const width = (max - min) / bins;
  const counts = Array.from({ length: bins }, () => 0);
  const edges = Array.from({ length: bins + 1 }, (_, i) => min + i * width);
  for (const x of xs) {
    let i = Math.floor((x - min) / width);
    if (i >= bins) i = bins - 1;
    if (i < 0) i = 0;
    counts[i] += 1;
  }
  return { edges, counts, min, max };
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

function HistogramSvg({
  counts,
  edges,
  color,
  label,
}: {
  counts: number[];
  edges: number[];
  color: string;
  label: string;
}) {
  const W = 520;
  const H = 180;
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const maxC = Math.max(1, ...counts);
  const barW = (W - padL - padR) / Math.max(counts.length, 1);

  return (
    <div className="overflow-x-auto rounded-[12px] border border-border bg-overlay/40 p-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full"
        style={{ minWidth: 260, maxHeight: 220 }}
        role="img"
        aria-label={label}
      >
        <line
          x1={padL}
          y1={H - padB}
          x2={W - padR}
          y2={H - padB}
          stroke="var(--muted)"
          strokeWidth={1}
        />
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={H - padB}
          stroke="var(--muted)"
          strokeWidth={1}
        />
        {counts.map((c, i) => {
          const h = ((H - padT - padB) * c) / maxC;
          const x = padL + i * barW;
          const y = H - padB - h;
          return (
            <rect
              key={i}
              x={x + 1}
              y={y}
              width={Math.max(1, barW - 2)}
              height={h}
              fill={color}
              opacity={0.85}
            />
          );
        })}
        {edges.length > 1 ? (
          <>
            <text
              x={padL}
              y={H - 8}
              fontSize={10}
              fill="var(--muted)"
              textAnchor="start"
            >
              {fmt(edges[0], 2)}
            </text>
            <text
              x={W - padR}
              y={H - 8}
              fontSize={10}
              fill="var(--muted)"
              textAnchor="end"
            >
              {fmt(edges[edges.length - 1], 2)}
            </text>
          </>
        ) : null}
        <text x={8} y={padT + 8} fontSize={10} fill="var(--muted)">
          {maxC}
        </text>
      </svg>
    </div>
  );
}

export function StatistikTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [kind, setKind] = useState<DistKind>("normal");
  const [n, setN] = useState(200);
  const [compare, setCompare] = useState(false);
  const [useSeed, setUseSeed] = useState(true);
  const [seed, setSeed] = useState(42);
  const [tick, setTick] = useState(0);

  const [mean, setMean] = useState(0);
  const [sd, setSd] = useState(1);
  const [umin, setUmin] = useState(0);
  const [umax, setUmax] = useState(1);
  const [p, setP] = useState(0.5);

  const params = useMemo(
    () => ({ mean, sd: Math.max(0.01, sd), min: umin, max: Math.max(umin + 0.01, umax), p: Math.min(1, Math.max(0, p)) }),
    [mean, sd, umin, umax, p],
  );

  const generate = useCallback(() => {
    const baseSeed = useSeed ? seed >>> 0 : (Date.now() ^ (Math.random() * 1e9)) >>> 0;
    const rngA = mulberry32(baseSeed);
    const a = sampleDist(kind, n, rngA, params);
    let b: number[] | null = null;
    if (compare) {
      const rngB = mulberry32((baseSeed + 9973) >>> 0);
      // Slightly shifted second sample for visible comparison
      const paramsB =
        kind === "normal"
          ? { ...params, mean: params.mean + params.sd * 0.6 }
          : kind === "uniform"
            ? {
                ...params,
                min: params.min + (params.max - params.min) * 0.15,
                max: params.max + (params.max - params.min) * 0.15,
              }
            : { ...params, p: Math.min(0.95, params.p + 0.2) };
      b = sampleDist(kind, n, rngB, paramsB);
    }
    return { a, b, baseSeed };
  }, [useSeed, seed, kind, n, params, compare]);

  const data = useMemo(() => {
    void tick;
    return generate();
  }, [generate, tick]);

  const bins = kind === "bernoulli" ? 2 : 16;
  const histA = useMemo(() => histogram(data.a, bins), [data.a, bins]);
  const histB = useMemo(
    () => (data.b ? histogram(data.b, bins) : null),
    [data.b, bins],
  );

  const statsA = useMemo(
    () => ({
      mean: meanOf(data.a),
      median: medianOf(data.a),
      sd: stdevOf(data.a),
    }),
    [data.a],
  );
  const statsB = useMemo(
    () =>
      data.b
        ? {
            mean: meanOf(data.b),
            median: medianOf(data.b),
            sd: stdevOf(data.b),
          }
        : null,
    [data.b],
  );

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Træk prøver fra normal-, uniform- eller Bernoulli-fordeling. Se histogram, middelværdi, median og spredning. Valgfri sammenligning af to prøver."
          : "Draw samples from a normal, uniform, or Bernoulli distribution. See the histogram, mean, median, and spread. Optionally compare two samples."}
      </p>

      <Segmented
        value={kind}
        onChange={setKind}
        ariaLabel={da ? "Fordeling" : "Distribution"}
        options={[
          { id: "normal", label: da ? "Normal" : "Normal" },
          { id: "uniform", label: da ? "Uniform" : "Uniform" },
          { id: "bernoulli", label: "Bernoulli" },
        ]}
      />

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <Field
          label={da ? `Prøvestørrelse n = ${n}` : `Sample size n = ${n}`}
        >
          <input
            type="range"
            min={20}
            max={2000}
            step={10}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="kit-range w-full"
          />
        </Field>

        {kind === "normal" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={da ? `Middel μ = ${fmt(mean, 2)}` : `Mean μ = ${fmt(mean, 2)}`}>
              <input
                type="range"
                min={-5}
                max={5}
                step={0.1}
                value={mean}
                onChange={(e) => setMean(Number(e.target.value))}
                className="kit-range w-full"
              />
            </Field>
            <Field label={da ? `Spredning σ = ${fmt(sd, 2)}` : `Std. dev. σ = ${fmt(sd, 2)}`}>
              <input
                type="range"
                min={0.2}
                max={3}
                step={0.1}
                value={sd}
                onChange={(e) => setSd(Number(e.target.value))}
                className="kit-range w-full"
              />
            </Field>
          </div>
        ) : null}

        {kind === "uniform" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={da ? `Minimum = ${fmt(umin, 2)}` : `Minimum = ${fmt(umin, 2)}`}>
              <input
                type="range"
                min={-5}
                max={5}
                step={0.1}
                value={umin}
                onChange={(e) => setUmin(Number(e.target.value))}
                className="kit-range w-full"
              />
            </Field>
            <Field label={da ? `Maksimum = ${fmt(umax, 2)}` : `Maximum = ${fmt(umax, 2)}`}>
              <input
                type="range"
                min={-5}
                max={5}
                step={0.1}
                value={umax}
                onChange={(e) => setUmax(Number(e.target.value))}
                className="kit-range w-full"
              />
            </Field>
          </div>
        ) : null}

        {kind === "bernoulli" ? (
          <Field
            label={da ? `Sandsynlighed p = ${fmt(p, 2)}` : `Probability p = ${fmt(p, 2)}`}
            hint={da ? "0 = fiasko, 1 = succes (tilnærmet)." : "0 = failure, 1 = success (approx.)."}
          >
            <input
              type="range"
              min={0.05}
              max={0.95}
              step={0.05}
              value={p}
              onChange={(e) => setP(Number(e.target.value))}
              className="kit-range w-full"
            />
          </Field>
        ) : null}

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={useSeed}
              onChange={(e) => setUseSeed(e.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            {da ? "Fast seed (gentagelig)" : "Fixed seed (reproducible)"}
          </label>
          {useSeed ? (
            <Field label={da ? "Seed" : "Seed"}>
              <KitInput
                inputMode="numeric"
                value={String(seed)}
                onChange={(e) => setSeed(Number(e.target.value) || 0)}
                className={`${fieldClass} w-28 tabular-nums`}
              />
            </Field>
          ) : null}
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={compare}
              onChange={(e) => setCompare(e.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            {da ? "Sammenlign to prøver" : "Compare two samples"}
          </label>
          <button
            type="button"
            className={primaryBtnClass}
            onClick={() => setTick((t) => t + 1)}
          >
            {da ? "Træk ny prøve" : "Draw new sample"}
          </button>
          {!useSeed ? (
            <button
              type="button"
              className={secondaryBtnClass}
              onClick={() => setTick((t) => t + 1)}
            >
              {da ? "Tilfældig igen" : "Resample"}
            </button>
          ) : null}
        </div>

        <p className="text-xs text-muted">
          {da
            ? `Seed brugt: ${data.baseSeed}. Prøve B forskydes lidt, så forskellen er synlig.`
            : `Seed used: ${data.baseSeed}. Sample B is shifted slightly so the difference is visible.`}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">
          {da ? "Prøve A" : "Sample A"}
        </h2>
        <HistogramSvg
          counts={histA.counts}
          edges={histA.edges}
          color="var(--accent)"
          label={da ? "Histogram A" : "Histogram A"}
        />
        <div className="grid grid-cols-3 gap-2">
          <Metric label={da ? "Middel" : "Mean"} value={fmt(statsA.mean)} />
          <Metric label={da ? "Median" : "Median"} value={fmt(statsA.median)} />
          <Metric label={da ? "Std.afv." : "Std. Dev."} value={fmt(statsA.sd)} />
        </div>
      </section>

      {compare && histB && statsB ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">
            {da ? "Prøve B (forskudt)" : "Sample B (shifted)"}
          </h2>
          <HistogramSvg
            counts={histB.counts}
            edges={histB.edges}
            color="color-mix(in srgb, var(--foreground) 55%, var(--accent))"
            label={da ? "Histogram B" : "Histogram B"}
          />
          <div className="grid grid-cols-3 gap-2">
            <Metric label={da ? "Middel" : "Mean"} value={fmt(statsB.mean)} />
            <Metric label={da ? "Median" : "Median"} value={fmt(statsB.median)} />
            <Metric label={da ? "Std.afv." : "Std. Dev."} value={fmt(statsB.sd)} />
          </div>
        </section>
      ) : null}

      <section className="kit-tool-panel space-y-2 p-4 text-sm leading-relaxed text-muted sm:p-5">
        <p>
          {da
            ? "Middelværdien er gennemsnittet af alle observationer. Medianen er den midterste værdi, når data er sorteret. Medianen påvirkes mindre af enkelte ekstremværdier."
            : "The mean is the average of all observations. The median is the middle value once the data are sorted. The median is less affected by a few extreme values."}
        </p>
        <p>
          {da
            ? "Standardafvigelsen beskriver spredningen omkring middelværdien. En større værdi betyder, at punkterne ligger længere fra hinanden."
            : "Standard deviation describes spread around the mean. A larger value means the points sit farther apart."}
        </p>
      </section>
    </div>
  );
}
