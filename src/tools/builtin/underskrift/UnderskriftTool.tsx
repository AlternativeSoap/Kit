"use client";

import { useEffect, useRef, useState } from "react";
import { primaryBtnClass, secondaryBtnClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { canvasPngDataUrl } from "../qr/calc";

export function UnderskriftTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 560;
    const height = 220;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    const ratio = window.devicePixelRatio || 1;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.clientWidth, 220);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setEmpty(true);
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <p className="text-sm text-muted">
        {da
          ? "Tegn din underskrift med mus eller finger. Download som PNG."
          : "Draw your signature with mouse or finger. Download as PNG."}
      </p>
      <canvas
        ref={canvasRef}
        className="h-[220px] w-full touch-none rounded-[12px] border border-border bg-paper"
        onPointerDown={(e) => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (!canvas || !ctx) return;
          drawing.current = true;
          canvas.setPointerCapture(e.pointerId);
          const p = pos(e);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          setEmpty(false);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = canvasRef.current?.getContext("2d");
          if (!ctx) return;
          const p = pos(e);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
        onPointerCancel={() => {
          drawing.current = false;
        }}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={primaryBtnClass}
          disabled={empty}
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const url = canvasPngDataUrl(canvas);
            if (!url) return;
            const a = document.createElement("a");
            a.href = url;
            a.download = "signature.png";
            a.click();
          }}
        >
          {da ? "Download PNG" : "Download PNG"}
        </button>
        <button type="button" className={secondaryBtnClass} onClick={clear}>
          {da ? "Ryd" : "Clear"}
        </button>
      </div>
    </div>
  );
}
