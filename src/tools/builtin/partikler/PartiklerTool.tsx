"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Field,
  KitInput,
  fieldClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function isMobile() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 640px)").matches || navigator.maxTouchPoints > 1;
}

function createParticles(
  count: number,
  w: number,
  h: number,
  baseSize: number,
): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.4,
      vy: (Math.random() - 0.5) * 1.4,
      size: baseSize * (0.55 + Math.random() * 0.9),
    });
  }
  return out;
}

export function PartiklerTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const playingRef = useRef(true);
  const gravityRef = useRef(0.04);
  const frictionRef = useRef(0.988);
  const attractRef = useRef(true);
  const colorRef = useRef("#4a5c3f");
  const sizeRef = useRef(3);
  const countRef = useRef(800);

  const [playing, setPlaying] = useState(true);
  const [count, setCount] = useState(800);
  const [maxCount, setMaxCount] = useState(3500);
  const [gravity, setGravity] = useState(0.04);
  const [friction, setFriction] = useState(0.988);
  const [attract, setAttract] = useState(true);
  const [color, setColor] = useState("#4a5c3f");
  const [size, setSize] = useState(3);
  const [fpsHint, setFpsHint] = useState("");

  playingRef.current = playing;
  gravityRef.current = gravity;
  frictionRef.current = friction;
  attractRef.current = attract;
  colorRef.current = color;
  sizeRef.current = size;
  countRef.current = count;

  const resizeAndSeed = useCallback((reseed: boolean) => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = Math.max(1, wrap.clientWidth);
    const cssH = Math.max(220, Math.min(420, Math.round(cssW * 0.55)));
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const maxCount = isMobile() ? 900 : 3500;
    const n = clamp(Math.round(countRef.current) || 400, 50, maxCount);
    if (reseed || particlesRef.current.length !== n) {
      particlesRef.current = createParticles(n, cssW, cssH, sizeRef.current);
    } else {
      // Keep positions, clamp into bounds
      for (const p of particlesRef.current) {
        p.x = clamp(p.x, 0, cssW);
        p.y = clamp(p.y, 0, cssH);
        p.size = sizeRef.current * (0.55 + Math.random() * 0.9);
      }
    }
  }, []);

  const reset = useCallback(() => {
    resizeAndSeed(true);
  }, [resizeAndSeed]);

  useEffect(() => {
    const mobile = isMobile();
    const max = mobile ? 900 : 3500;
    const suggested = mobile ? 400 : 1200;
    setMaxCount(max);
    setCount((c) => (c > max ? suggested : clamp(c, 50, max)));
    resizeAndSeed(true);

    const onResize = () => resizeAndSeed(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [resizeAndSeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let last = performance.now();
    let frames = 0;
    let fpsAccum = 0;

    const tick = (now: number) => {
      rafRef.current = window.requestAnimationFrame(tick);
      const dtMs = Math.min(32, now - last);
      last = now;
      frames += 1;
      fpsAccum += dtMs;
      if (fpsAccum >= 1000) {
        const fps = Math.round((frames * 1000) / fpsAccum);
        setFpsHint(`${fps} fps`);
        frames = 0;
        fpsAccum = 0;
      }

      const wrap = wrapRef.current;
      if (!wrap) return;
      const w = wrap.clientWidth;
      const h = Math.max(220, Math.min(420, Math.round(w * 0.55)));
      const particles = particlesRef.current;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = colorRef.current;

      if (playingRef.current) {
        const g = gravityRef.current;
        const f = frictionRef.current;
        const pointer = pointerRef.current;
        const pull = attractRef.current && pointer.active;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          if (pull) {
            const dx = pointer.x - p.x;
            const dy = pointer.y - p.y;
            const distSq = dx * dx + dy * dy + 40;
            const force = 140 / distSq;
            p.vx += dx * force * 0.02;
            p.vy += dy * force * 0.02;
          }
          p.vy += g;
          p.vx *= f;
          p.vy *= f;
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) {
            p.x = 0;
            p.vx *= -0.85;
          } else if (p.x > w) {
            p.x = w;
            p.vx *= -0.85;
          }
          if (p.y < 0) {
            p.y = 0;
            p.vy *= -0.85;
          } else if (p.y > h) {
            p.y = h;
            p.vy *= -0.72;
          }
        }
      }

      // Small particles as squares (faster); larger ones as circles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        const r = p.size;
        if (r <= 2.5) {
          const d = r * 2;
          ctx.fillRect(p.x - r, p.y - r, d, d);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    // Rebuild sizes when count or size changes
    const max = isMobile() ? 900 : 3500;
    const n = clamp(Math.round(count) || 400, 50, max);
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const w = wrap.clientWidth;
    const h = Math.max(220, Math.min(420, Math.round(w * 0.55)));
    if (particlesRef.current.length !== n) {
      particlesRef.current = createParticles(n, w, h, size);
    } else {
      for (const p of particlesRef.current) {
        p.size = size * (0.55 + Math.random() * 0.9);
      }
    }
  }, [count, size]);

  function exportPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "partikler.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const effectiveCount = clamp(Math.round(count) || 400, 50, maxCount);

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Partikelsystem med tyngdekraft, friktion og valgfri tiltrækning mod pegepinden. Eksporter et PNG-snapshot når du vil."
          : "Particle system with gravity, friction, and optional attractor toward the pointer. Export a PNG snapshot when you like."}
      </p>

      <section className="kit-tool-panel overflow-hidden p-0">
        <div
          ref={wrapRef}
          className="relative w-full touch-none bg-background"
          onPointerDown={(e) => {
            const rect = wrapRef.current?.getBoundingClientRect();
            if (!rect) return;
            pointerRef.current = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
              active: true,
            };
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!pointerRef.current.active) return;
            const rect = wrapRef.current?.getBoundingClientRect();
            if (!rect) return;
            pointerRef.current.x = e.clientX - rect.left;
            pointerRef.current.y = e.clientY - rect.top;
          }}
          onPointerUp={() => {
            pointerRef.current.active = false;
          }}
          onPointerCancel={() => {
            pointerRef.current.active = false;
          }}
        >
          <canvas
            ref={canvasRef}
            className="block w-full"
            aria-label={da ? "Partikel-canvas" : "Particle canvas"}
          />
          <div className="pointer-events-none absolute bottom-2 right-3 font-mono text-[11px] text-muted">
            {fpsHint}
          </div>
        </div>
      </section>

      <div className="kit-h-scroll">
        <button
          type="button"
          className={primaryBtnClass}
          onClick={() => setPlaying((v) => !v)}
        >
          {playing ? (da ? "Pause" : "Pause") : da ? "Afspil" : "Play"}
        </button>
        <button type="button" className={secondaryBtnClass} onClick={reset}>
          {da ? "Nulstil" : "Reset"}
        </button>
        <button type="button" className={secondaryBtnClass} onClick={exportPng}>
          {da ? "Eksporter PNG" : "Export PNG"}
        </button>
      </div>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <Field
          label={da ? `Antal (${effectiveCount})` : `Count (${effectiveCount})`}
          hint={
            da
              ? `Maks ${maxCount} på denne enhed.`
              : `Max ${maxCount} on this device.`
          }
        >
          <input
            type="range"
            min={50}
            max={maxCount}
            step={50}
            value={effectiveCount}
            onChange={(e) => setCount(Number(e.target.value))}
            className="kit-range"
            aria-label={da ? "Antal partikler" : "Particle count"}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={
              da
                ? `Tyngdekraft (${gravity.toFixed(3)})`
                : `Gravity (${gravity.toFixed(3)})`
            }
          >
            <input
              type="range"
              min={0}
              max={40}
              value={Math.round(gravity * 100)}
              onChange={(e) => setGravity(Number(e.target.value) / 100)}
              className="kit-range"
              aria-label={da ? "Tyngdekraft" : "Gravity"}
            />
          </Field>
          <Field
            label={
              da
                ? `Friktion (${friction.toFixed(3)})`
                : `Friction (${friction.toFixed(3)})`
            }
          >
            <input
              type="range"
              min={900}
              max={999}
              value={Math.round(friction * 1000)}
              onChange={(e) => setFriction(Number(e.target.value) / 1000)}
              className="kit-range"
              aria-label={da ? "Friktion" : "Friction"}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={da ? `Størrelse (${size.toFixed(1)})` : `Size (${size.toFixed(1)})`}>
            <input
              type="range"
              min={10}
              max={100}
              value={Math.round(size * 10)}
              onChange={(e) => setSize(Number(e.target.value) / 10)}
              className="kit-range"
              aria-label={da ? "Partikelstørrelse" : "Particle size"}
            />
          </Field>
          <Field label={da ? "Farve" : "Color"}>
            <div className="flex gap-2">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#4a5c3f"}
                onChange={(e) => setColor(e.target.value)}
                className="h-11 w-11 shrink-0 cursor-pointer rounded-[10px] border border-border bg-surface p-1"
                aria-label={da ? "Farve" : "Color"}
              />
              <KitInput
                value={color}
                onChange={(e) => setColor(e.target.value)}
                spellCheck={false}
                className={`${fieldClass} min-w-0 flex-1 font-mono`}
              />
            </div>
          </Field>
        </div>

        <label className="flex items-center gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={attract}
            onChange={(e) => setAttract(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          {da
            ? "Tiltræk partikler mod pegepind eller finger"
            : "Attract particles toward pointer or finger"}
        </label>
      </section>
    </div>
  );
}
