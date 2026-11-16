"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDictionary } from "@/i18n/LanguageProvider";

const COLORS = [
  "#3f5d45",
  "#5b7c62",
  "#2f4a36",
  "#8fa894",
  "#46624c",
  "#6e8f76",
  "#334f3a",
  "#7a9a82",
];

const DEFAULT_ITEMS = ["Option A", "Option B", "Option C", "Option D"];

export function SpinWheelTool() {
  const dictionary = useDictionary();
  const t = dictionary.spinwheelTool;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [draft, setDraft] = useState("");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [popup, setPopup] = useState(false);
  const animRef = useRef<number | null>(null);

  const cleanItems = useMemo(
    () => items.map((item) => item.trim()).filter(Boolean),
    [items],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 8;
    const n = Math.max(cleanItems.length, 1);

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);

    for (let i = 0; i < n; i++) {
      const start = (i / n) * Math.PI * 2 - Math.PI / 2;
      const end = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length]!;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();

      const label = cleanItems[i] ?? "—";
      const mid = (start + end) / 2;
      ctx.save();
      ctx.rotate(mid);
      ctx.fillStyle = "#fff";
      ctx.font = "600 14px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const text =
        label.length > 18 ? `${label.slice(0, 16)}…` : label;
      ctx.fillText(text, radius - 16, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fillStyle = "#fafaf8";
    ctx.fill();
    ctx.strokeStyle = "#3f5d45";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }, [cleanItems, rotation]);

  useEffect(() => {
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  function addItem() {
    const next = draft.trim();
    if (!next) return;
    setItems((prev) => [...prev, next]);
    setDraft("");
    setWinner(null);
    setPopup(false);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setWinner(null);
    setPopup(false);
  }

  function spin() {
    if (spinning || cleanItems.length < 2) return;
    setSpinning(true);
    setWinner(null);
    setPopup(false);

    const n = cleanItems.length;
    const slice = 360 / n;
    const targetIndex = Math.floor(Math.random() * n);
    // Pointer is at top; wheel rotates clockwise in our draw.
    const targetAngle = 360 - (targetIndex * slice + slice / 2);
    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const start = rotation % 360;
    const distance = extraTurns * 360 + ((targetAngle - start + 360) % 360);
    const duration = 5200 + Math.random() * 1200;
    const t0 = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      // Ease-out cubic
      const eased = 1 - (1 - p) ** 3;
      setRotation(start + distance * eased);
      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }
      setSpinning(false);
      setWinner(cleanItems[targetIndex] ?? null);
      setPopup(true);
    };
    animRef.current = requestAnimationFrame(tick);
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="relative mx-auto w-full max-w-md">
        <div
          className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2"
          aria-hidden
        >
          <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-accent drop-shadow" />
        </div>
        <canvas
          ref={canvasRef}
          width={420}
          height={420}
          className="mx-auto block h-auto w-full max-w-[420px]"
        />
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            disabled={spinning || cleanItems.length < 2}
            onClick={spin}
            className="kit-touch-target rounded-[10px] bg-accent px-6 py-3 text-sm font-medium text-white disabled:opacity-40 sm:min-h-0"
          >
            {spinning ? t.spinning : t.spin}
          </button>
        </div>
        {cleanItems.length < 2 ? (
          <p className="mt-3 text-center text-sm text-muted">{t.needItems}</p>
        ) : null}
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted">{t.intro}</p>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
            placeholder={t.placeholder}
            className="min-w-0 flex-1 rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
          <button
            type="button"
            onClick={addItem}
            className="kit-touch-target rounded-[10px] border border-border bg-surface px-3 py-2 text-sm font-medium sm:min-h-0"
          >
            {t.add}
          </button>
        </div>
        <ul className="divide-y divide-border overflow-hidden rounded-[12px] border border-border bg-surface">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
            >
              <span className="min-w-0 truncate">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="kit-touch-target shrink-0 rounded-[8px] px-2.5 py-1.5 text-xs text-muted hover:bg-background hover:text-foreground sm:min-h-0 sm:min-w-0"
              >
                {t.remove}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {popup && winner ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
          role="dialog"
          aria-modal="true"
          aria-label={t.resultTitle}
        >
          <div className="w-full max-w-sm rounded-[16px] border border-border bg-surface p-6 text-center shadow-suggest">
            <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
              {t.resultTitle}
            </p>
            <p className="mt-3 break-words text-2xl font-semibold text-foreground">
              {winner}
            </p>
            <button
              type="button"
              onClick={() => setPopup(false)}
              className="kit-touch-target mt-6 rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white sm:min-h-0"
            >
              {t.close}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
