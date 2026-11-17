"use client";

import { useEffect, useRef, useState } from "react";
import {
  ErrorBanner,
  FileInput,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { canvasPngDataUrl } from "../qr/calc";

type Mode = "pen" | "blur";

export function AnnotateTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const snapshot = useRef<ImageData | null>(null);
  const [mode, setMode] = useState<Mode>("pen");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 3;
  }, []);

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("image"));
        img.src = url;
      });
      URL.revokeObjectURL(url);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxW = 900;
      const scale = Math.min(1, maxW / img.naturalWidth);
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#e11d48";
      ctx.lineWidth = 3;
      setReady(true);
    } catch {
      setError(
        da ? "Billedet kunne ikke indlæses." : "Could not load the image.",
      );
      setReady(false);
    }
  }

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy,
    };
  }

  function applyBlurRect(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
  ) {
    const x = Math.min(x0, x1);
    const y = Math.min(y0, y1);
    const w = Math.max(1, Math.abs(x1 - x0));
    const h = Math.max(1, Math.abs(y1 - y0));
    const sample = ctx.getImageData(x, y, w, h);
    const tmp = document.createElement("canvas");
    tmp.width = Math.max(1, Math.floor(w / 8));
    tmp.height = Math.max(1, Math.floor(h / 8));
    const tctx = tmp.getContext("2d");
    if (!tctx) return;
    const put = document.createElement("canvas");
    put.width = w;
    put.height = h;
    put.getContext("2d")?.putImageData(sample, 0, 0);
    tctx.imageSmoothingEnabled = true;
    tctx.drawImage(put, 0, 0, tmp.width, tmp.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, x, y, w, h);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <p className="text-sm text-muted">
        {da
          ? "Upload et screenshot. Tegn med pen, eller træk et slør-rektangel."
          : "Upload a screenshot. Draw with the pen, or drag a blur rectangle."}
      </p>
      <div className="flex flex-wrap gap-2">
        <FileInput
          label={da ? "Vælg billede" : "Choose image"}
          accept="image/*"
          onFile={(f) => void onFile(f)}
          inline
        />
        <button
          type="button"
          className={mode === "pen" ? primaryBtnClass : secondaryBtnClass}
          onClick={() => setMode("pen")}
        >
          {da ? "Pen" : "Pen"}
        </button>
        <button
          type="button"
          className={mode === "blur" ? primaryBtnClass : secondaryBtnClass}
          onClick={() => setMode("blur")}
        >
          {da ? "Slør" : "Blur"}
        </button>
        <button
          type="button"
          className={primaryBtnClass}
          disabled={!ready}
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const url = canvasPngDataUrl(canvas);
            if (!url) return;
            const a = document.createElement("a");
            a.href = url;
            a.download = "annotated.png";
            a.click();
          }}
        >
          {da ? "Download PNG" : "Download PNG"}
        </button>
      </div>
      <ErrorBanner>{error}</ErrorBanner>
      <canvas
        ref={canvasRef}
        className={`max-w-full rounded-[12px] border border-border bg-[length:16px_16px] bg-[linear-gradient(45deg,#eee_25%,transparent_25%),linear-gradient(-45deg,#eee_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#eee_75%),linear-gradient(-45deg,transparent_75%,#eee_75%)] bg-[position:0_0,0_8px,8px_-8px,-8px_0] ${ready ? "touch-none cursor-crosshair" : "hidden"}`}
        onPointerDown={(e) => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (!canvas || !ctx || !ready) return;
          drawing.current = true;
          canvas.setPointerCapture(e.pointerId);
          const p = pos(e);
          start.current = p;
          if (mode === "pen") {
            ctx.strokeStyle = "#e11d48";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
          } else {
            snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
          }
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (!canvas || !ctx) return;
          const p = pos(e);
          if (mode === "pen") {
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            return;
          }
          if (!start.current || !snapshot.current) return;
          ctx.putImageData(snapshot.current, 0, 0);
          ctx.save();
          ctx.strokeStyle = "rgba(0,0,0,0.45)";
          ctx.lineWidth = 1;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(
            start.current.x,
            start.current.y,
            p.x - start.current.x,
            p.y - start.current.y,
          );
          ctx.restore();
        }}
        onPointerUp={(e) => {
          if (!drawing.current) return;
          drawing.current = false;
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (!canvas || !ctx || mode !== "blur" || !start.current) return;
          if (snapshot.current) ctx.putImageData(snapshot.current, 0, 0);
          const p = pos(e);
          applyBlurRect(ctx, start.current.x, start.current.y, p.x, p.y);
          start.current = null;
          snapshot.current = null;
        }}
      />
    </div>
  );
}
