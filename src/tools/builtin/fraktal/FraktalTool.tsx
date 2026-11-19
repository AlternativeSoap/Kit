"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  Field,
  Segmented,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Mode = "mandelbrot" | "julia";
type Palette = "classic" | "fire" | "ocean" | "mono";

type View = { cx: number; cy: number; scale: number };

const DEFAULT_MANDEL: View = { cx: -0.5, cy: 0, scale: 2.6 };
const DEFAULT_JULIA: View = { cx: 0, cy: 0, scale: 2.2 };

function paletteColor(t: number, palette: Palette, escaped: boolean): [number, number, number] {
  if (!escaped) {
    if (palette === "mono") return [18, 18, 20];
    return [8, 10, 16];
  }
  const u = Math.max(0, Math.min(1, t));
  if (palette === "classic") {
    const r = Math.floor(9 * (1 - u) * u * u * u * 255);
    const g = Math.floor(15 * (1 - u) * (1 - u) * u * u * 255);
    const b = Math.floor(8.5 * (1 - u) * (1 - u) * (1 - u) * u * 255);
    return [r, g, b];
  }
  if (palette === "fire") {
    return [
      Math.floor(255 * Math.min(1, u * 1.4)),
      Math.floor(180 * u * u),
      Math.floor(40 * u),
    ];
  }
  if (palette === "ocean") {
    return [
      Math.floor(20 + 40 * u),
      Math.floor(60 + 140 * u),
      Math.floor(100 + 155 * Math.sqrt(u)),
    ];
  }
  const g = Math.floor(40 + 200 * u);
  return [g, g, g];
}

export function FraktalTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<Mode>("mandelbrot");
  const [palette, setPalette] = useState<Palette>("classic");
  const [maxIter, setMaxIter] = useState(120);
  const [juliaCr, setJuliaCr] = useState(-0.8);
  const [juliaCi, setJuliaCi] = useState(0.156);
  const [view, setView] = useState<View>(DEFAULT_MANDEL);
  const [rendering, setRendering] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  const dragRef = useRef<{ x: number; y: number; view: View } | null>(null);
  const rafRef = useRef<number | null>(null);
  const paramsRef = useRef({ mode, palette, maxIter, juliaCr, juliaCi });

  viewRef.current = view;
  paramsRef.current = { mode, palette, maxIter, juliaCr, juliaCi };

  const render = useCallback((quick: boolean) => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const cssW = Math.max(1, wrap.clientWidth);
    const cssH = Math.max(240, Math.min(460, Math.round(cssW * 0.62)));
    const mobile =
      typeof window !== "undefined" &&
      (window.matchMedia("(max-width: 640px)").matches || navigator.maxTouchPoints > 1);
    const scaleFactor = quick ? (mobile ? 0.35 : 0.45) : mobile ? 0.7 : 1;
    const w = Math.max(80, Math.floor(cssW * scaleFactor));
    const h = Math.max(60, Math.floor(cssH * scaleFactor));

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const { mode: m, palette: pal, maxIter: iterCap, juliaCr: cr, juliaCi: ci } =
      paramsRef.current;
    const v = viewRef.current;
    const iters = quick
      ? Math.min(60, Math.max(24, Math.floor(iterCap * 0.45)))
      : Math.min(400, Math.max(40, iterCap));

    const img = ctx.createImageData(w, h);
    const data = img.data;
    const aspect = w / h;
    const halfH = v.scale / 2;
    const halfW = halfH * aspect;

    for (let py = 0; py < h; py++) {
      const y0 = v.cy + (py / h) * (2 * halfH) - halfH;
      for (let px = 0; px < w; px++) {
        const x0 = v.cx + (px / w) * (2 * halfW) - halfW;
        let zx: number;
        let zy: number;
        let cx: number;
        let cy: number;
        if (m === "mandelbrot") {
          zx = 0;
          zy = 0;
          cx = x0;
          cy = y0;
        } else {
          zx = x0;
          zy = y0;
          cx = cr;
          cy = ci;
        }

        let i = 0;
        while (i < iters) {
          const zx2 = zx * zx;
          const zy2 = zy * zy;
          if (zx2 + zy2 > 4) break;
          const nzy = 2 * zx * zy + cy;
          zx = zx2 - zy2 + cx;
          zy = nzy;
          i++;
        }

        const escaped = i < iters;
        let t = i / iters;
        if (escaped) {
          const logZn = Math.log(zx * zx + zy * zy) / 2;
          const nu = Math.log(logZn / Math.log(2)) / Math.log(2);
          t = (i + 1 - nu) / iters;
        }
        const [r, g, b] = paletteColor(t, pal, escaped);
        const off = (py * w + px) * 4;
        data[off] = r;
        data[off + 1] = g;
        data[off + 2] = b;
        data[off + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, []);

  const scheduleRender = useCallback(
    (quickFirst: boolean) => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      setRendering(true);
      rafRef.current = requestAnimationFrame(() => {
        render(quickFirst);
        if (quickFirst) {
          rafRef.current = requestAnimationFrame(() => {
            render(false);
            setRendering(false);
          });
        } else {
          setRendering(false);
        }
      });
    },
    [render],
  );

  useEffect(() => {
    scheduleRender(true);
  }, [mode, palette, maxIter, juliaCr, juliaCi, view, scheduleRender]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => scheduleRender(true));
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [scheduleRender]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function resetView() {
    setView(mode === "mandelbrot" ? DEFAULT_MANDEL : DEFAULT_JULIA);
  }

  function onMode(next: Mode) {
    setMode(next);
    setView(next === "mandelbrot" ? DEFAULT_MANDEL : DEFAULT_JULIA);
  }

  function clientToComplex(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    const v = viewRef.current;
    const aspect = rect.width / Math.max(1, rect.height);
    const halfH = v.scale / 2;
    const halfW = halfH * aspect;
    return {
      x: v.cx + px * 2 * halfW - halfW,
      y: v.cy + py * 2 * halfH - halfH,
    };
  }

  function onPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, view: { ...viewRef.current } };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const aspect = rect.width / Math.max(1, rect.height);
    const halfH = drag.view.scale / 2;
    const halfW = halfH * aspect;
    const dx = ((e.clientX - drag.x) / rect.width) * 2 * halfW;
    const dy = ((e.clientY - drag.y) / rect.height) * 2 * halfH;
    setView({
      cx: drag.view.cx - dx,
      cy: drag.view.cy - dy,
      scale: drag.view.scale,
    });
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  function onWheel(e: ReactWheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const c = clientToComplex(e.clientX, e.clientY);
    if (!c) return;
    const v = viewRef.current;
    const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;
    const nextScale = Math.min(8, Math.max(1e-12, v.scale * factor));
    // Keep point under cursor stable
    const t = 1 - nextScale / v.scale;
    setView({
      cx: v.cx + (c.x - v.cx) * t,
      cy: v.cy + (c.y - v.cy) * t,
      scale: nextScale,
    });
  }

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Udforsk Mandelbrot- og Julia-mængder. Scroll for zoom, træk for pan. Opløsningen tilpasses på mobil."
          : "Explore Mandelbrot and Julia sets. Scroll to zoom, drag to pan. Resolution adapts on mobile."}
      </p>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <Segmented
          ariaLabel={da ? "Tilstand" : "Mode"}
          value={mode}
          onChange={onMode}
          options={[
            { id: "mandelbrot", label: "Mandelbrot" },
            { id: "julia", label: "Julia" },
          ]}
        />
        <Segmented
          ariaLabel={da ? "Farvepalet" : "Color palette"}
          value={palette}
          onChange={setPalette}
          options={[
            { id: "classic", label: da ? "Klassisk" : "Classic" },
            { id: "fire", label: da ? "Ild" : "Fire" },
            { id: "ocean", label: da ? "Hav" : "Ocean" },
            { id: "mono", label: da ? "Mono" : "Mono" },
          ]}
        />
        <Field label={da ? "Max iterationer" : "Max iterations"} hint={String(maxIter)}>
          <input
            type="range"
            min={40}
            max={360}
            step={10}
            value={maxIter}
            onChange={(e) => setMaxIter(Number(e.target.value))}
            className="kit-range w-full"
          />
        </Field>
        {mode === "julia" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={da ? "c real" : "c real"} hint={juliaCr.toFixed(3)}>
              <input
                type="range"
                min={-1.5}
                max={1.5}
                step={0.001}
                value={juliaCr}
                onChange={(e) => setJuliaCr(Number(e.target.value))}
                className="kit-range w-full"
              />
            </Field>
            <Field label={da ? "c imag" : "c imag"} hint={juliaCi.toFixed(3)}>
              <input
                type="range"
                min={-1.5}
                max={1.5}
                step={0.001}
                value={juliaCi}
                onChange={(e) => setJuliaCi(Number(e.target.value))}
                className="kit-range w-full"
              />
            </Field>
          </div>
        ) : null}
        <div className="kit-h-scroll">
          <button type="button" className={secondaryBtnClass} onClick={resetView}>
            {da ? "Nulstil view" : "Reset view"}
          </button>
          <button
            type="button"
            className={primaryBtnClass}
            onClick={() => scheduleRender(false)}
          >
            {rendering
              ? da
                ? "Renderer..."
                : "Rendering..."
              : da
                ? "Gengiv skarpt"
                : "Render sharp"}
          </button>
        </div>
      </section>

      <section className="kit-tool-panel overflow-hidden p-0">
        <div ref={wrapRef} className="w-full">
          <canvas
            ref={canvasRef}
            className="block w-full cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onWheel={onWheel}
          />
        </div>
      </section>
    </div>
  );
}
