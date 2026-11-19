"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Field,
  KitSelect,
  Segmented,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Quality = "maj" | "min" | "7" | "maj7" | "sus2" | "sus4";

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

/** Circle of fifths order starting at C. */
const FIFTHS = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5] as const;

const QUALITY_INTERVALS: Record<Quality, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  "7": [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
};

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11] as const;
const ROMAN_MAJOR = ["I", "ii", "iii", "IV", "V", "vi", "vii°"] as const;

function midiToFreq(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function noteLabel(pc: number, preferFlat = false) {
  const n = ((pc % 12) + 12) % 12;
  if (preferFlat) {
    const flats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    return flats[n]!;
  }
  return NOTE_NAMES[n]!;
}

function chordTones(root: number, quality: Quality) {
  return QUALITY_INTERVALS[quality].map((i) => (root + i) % 12);
}

function degreeInKey(root: number, key: number): number | null {
  const interval = (root - key + 12) % 12;
  const idx = MAJOR_SCALE.indexOf(interval as (typeof MAJOR_SCALE)[number]);
  return idx >= 0 ? idx : null;
}

function romanForChord(
  root: number,
  key: number,
  quality: Quality,
): string {
  const deg = degreeInKey(root, key);
  if (deg == null) {
    const interval = (root - key + 12) % 12;
    return `b${interval}`;
  }
  const upper = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;
  const lower = ["i", "ii", "iii", "iv", "v", "vi", "vii"] as const;
  const diatonic = ROMAN_MAJOR[deg]!;

  switch (quality) {
    case "maj":
      return upper[deg]!;
    case "min":
      return lower[deg]!;
    case "7":
      return `${diatonic.replace("°", "")}7`;
    case "maj7":
      return `${upper[deg]}maj7`;
    case "sus2":
      return `${upper[deg]}sus2`;
    case "sus4":
      return `${upper[deg]}sus4`;
  }
}

function diatonicHint(root: number, key: number, da: boolean): string {
  const deg = degreeInKey(root, key);
  if (deg == null) {
    return da
      ? "Rodtonen ligger uden for den valgte dur-skala (kromatic/altereret)."
      : "The root is outside the selected major scale (chromatic/altered).";
  }
  const names = da
    ? [
        "Tonika (I)",
        "Supertonika (ii)",
        "Mediant (iii)",
        "Subdominant (IV)",
        "Dominant (V)",
        "Submediant (vi)",
        "Ledetone (vii°)",
      ]
    : [
        "Tonic (I)",
        "Supertonic (ii)",
        "Mediant (iii)",
        "Subdominant (IV)",
        "Dominant (V)",
        "Submediant (vi)",
        "Leading tone (vii°)",
      ];
  return names[deg]!;
}

function wedgePath(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const x0 = cx + r1 * Math.cos(a0);
  const y0 = cy + r1 * Math.sin(a0);
  const x1 = cx + r1 * Math.cos(a1);
  const y1 = cy + r1 * Math.sin(a1);
  const x2 = cx + r0 * Math.cos(a1);
  const y2 = cy + r0 * Math.sin(a1);
  const x3 = cx + r0 * Math.cos(a0);
  const y3 = cy + r0 * Math.sin(a0);
  return `M ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
}

export function AkkorderTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [root, setRoot] = useState(0);
  const [quality, setQuality] = useState<Quality>("maj");
  const [key, setKey] = useState(0);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const tones = useMemo(() => chordTones(root, quality), [root, quality]);
  const roman = useMemo(
    () => romanForChord(root, key, quality),
    [root, key, quality],
  );
  const hint = useMemo(() => diatonicHint(root, key, da), [root, key, da]);

  const chordName = useMemo(() => {
    const r = noteLabel(root);
    const q =
      quality === "maj"
        ? ""
        : quality === "min"
          ? "m"
          : quality === "7"
            ? "7"
            : quality === "maj7"
              ? "maj7"
              : quality;
    return `${r}${q}`;
  }, [root, quality]);

  function ensureCtx() {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctxRef.current) {
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.value = 0.85;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    return ctxRef.current;
  }

  async function unlockAudio() {
    const ctx = ensureCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    setReady(true);
  }

  function playChord() {
    void unlockAudio().then(() => {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master) return;
      setPlaying(true);
      const now = ctx.currentTime;
      const baseMidi = 60 + root; // around C4
      const intervals = QUALITY_INTERVALS[quality];
      const duration = 1.15;

      intervals.forEach((semi, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = midiToFreq(baseMidi + semi);
        const level = 0.18 / Math.sqrt(intervals.length);
        const t0 = now + i * 0.012;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(level, t0 + 0.03);
        g.gain.exponentialRampToValueAtTime(level * 0.7, t0 + 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        osc.connect(g);
        g.connect(master);
        osc.start(t0);
        osc.stop(t0 + duration + 0.05);
      });

      window.setTimeout(() => setPlaying(false), duration * 1000 + 80);
    });
  }

  useEffect(() => {
    return () => {
      void ctxRef.current?.close();
    };
  }, []);

  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const outer = 138;
  const inner = 48;

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Vælg rod og akkordkvalitet på kvintcirklen. Se toner og romertal i den valgte toneart, og afspil akkorden i browseren."
          : "Pick a root and chord quality on the circle of fifths. See tones and Roman numerals in the selected key, and play the chord in the browser."}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {!ready ? (
          <button
            type="button"
            className={primaryBtnClass}
            onClick={() => void unlockAudio()}
          >
            {da ? "Aktiver lyd" : "Enable audio"}
          </button>
        ) : (
          <p className="text-xs text-muted">
            {da ? "Lyd er klar." : "Audio is ready."}
          </p>
        )}
        <button
          type="button"
          className={primaryBtnClass}
          onClick={playChord}
          disabled={playing}
        >
          {playing
            ? da
              ? "Spiller…"
              : "Playing…"
            : da
              ? "Spil akkord"
              : "Play chord"}
        </button>
      </div>

      <section className="kit-tool-panel grid gap-5 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:p-5">
        <div className="mx-auto w-full max-w-[300px]">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="h-auto w-full"
            role="img"
            aria-label={da ? "Kvintcirkel" : "Circle of fifths"}
          >
            {FIFTHS.map((pc, i) => {
              const a0 = (i / 12) * Math.PI * 2 - Math.PI / 2;
              const a1 = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2;
              const mid = (a0 + a1) / 2;
              const selected = pc === root;
              const inKey = degreeInKey(pc, key) != null;
              const lx = cx + ((outer + inner) / 2) * Math.cos(mid);
              const ly = cy + ((outer + inner) / 2) * Math.sin(mid);
              const hue = (i * 30 + 110) % 360;
              return (
                <g key={pc}>
                  <path
                    d={wedgePath(cx, cy, inner, outer, a0, a1)}
                    fill={`hsl(${hue} 42% ${selected ? 42 : inKey ? 36 : 28}%)`}
                    stroke={selected ? "var(--accent)" : "rgba(255,255,255,0.4)"}
                    strokeWidth={selected ? 2.5 : 1}
                    className="cursor-pointer"
                    onClick={() => setRoot(pc)}
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none fill-white text-[11px] font-medium"
                    style={{
                      paintOrder: "stroke",
                      stroke: "rgba(0,0,0,0.35)",
                      strokeWidth: 2,
                    }}
                  >
                    {noteLabel(pc)}
                  </text>
                </g>
              );
            })}
            <circle cx={cx} cy={cy} r={inner - 2} className="fill-surface" />
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              className="fill-foreground text-[12px] font-medium"
            >
              {chordName}
            </text>
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              className="fill-muted text-[10px]"
            >
              {roman}
            </text>
          </svg>
        </div>

        <div className="space-y-4">
          <Field label={da ? "Toneart (dur)" : "Key (major)"}>
            <KitSelect
              value={String(key)}
              onChange={(e) => setKey(Number(e.target.value))}
            >
              {NOTE_NAMES.map((n, i) => (
                <option key={n} value={i}>
                  {n} {da ? "dur" : "major"}
                </option>
              ))}
            </KitSelect>
          </Field>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {da ? "Kvalitet" : "Quality"}
            </p>
            <Segmented
              value={quality}
              onChange={setQuality}
              ariaLabel={da ? "Akkordkvalitet" : "Chord quality"}
              options={[
                { id: "maj", label: "maj" },
                { id: "min", label: "min" },
                { id: "7", label: "7" },
                { id: "maj7", label: "maj7" },
                { id: "sus2", label: "sus2" },
                { id: "sus4", label: "sus4" },
              ]}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FIFTHS.map((pc) => (
              <button
                key={pc}
                type="button"
                className={
                  pc === root
                    ? `${secondaryBtnClass} border-accent bg-accent-soft`
                    : secondaryBtnClass
                }
                onClick={() => setRoot(pc)}
              >
                {noteLabel(pc)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <h2 className="text-sm font-medium text-foreground">
          {da ? "Akkordtoner" : "Chord tones"} · {chordName}
        </h2>
        <div className="flex flex-wrap gap-2">
          {tones.map((pc, i) => (
            <span
              key={`${pc}-${i}`}
              className="rounded-[10px] border border-border bg-background/50 px-3 py-2 font-mono text-sm text-foreground"
            >
              {noteLabel(pc)}
              <span className="ml-1 text-xs text-muted">
                {QUALITY_INTERVALS[quality][i]}
              </span>
            </span>
          ))}
        </div>
        <div className="rounded-[10px] border border-border bg-background/40 px-3 py-3 space-y-1">
          <p className="text-sm text-foreground">
            {da ? "Romertal i" : "Roman numeral in"} {noteLabel(key)}{" "}
            {da ? "dur" : "major"}:{" "}
            <span className="font-mono font-medium">{roman}</span>
          </p>
          <p className="text-sm text-muted">{hint}</p>
        </div>
        <p className="text-xs text-muted">
          {da
            ? "Tryk Spil akkord (eller Aktiver lyd først). Browseren kræver et brugerklik før AudioContext kan starte."
            : "Press Play chord (or Enable audio first). The browser needs a user gesture before AudioContext can start."}
        </p>
      </section>
    </div>
  );
}
