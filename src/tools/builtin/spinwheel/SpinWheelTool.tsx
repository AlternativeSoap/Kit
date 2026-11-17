"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fieldClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useDictionary } from "@/i18n/LanguageProvider";

const ITEMS_KEY = "kit:spinwheel-items";
const BASE_SIZE = 420;
const MAX_ITEMS = 60;

type Winner = { label: string; index: number };

/** Evenly spaced hues, with alternating lightness so neighbours always differ. */
function sliceColor(index: number, count: number): string {
  const hue = (110 + (index * 360) / Math.max(count, 1)) % 360;
  const isLastOdd = count % 2 === 1 && index === count - 1 && count > 1;
  const lightness = isLastOdd ? 38 : index % 2 === 0 ? 34 : 42;
  return `hsl(${hue.toFixed(1)} 45% ${lightness}%)`;
}

/** Cryptographically random index without modulo bias. */
function randomIndex(n: number): number {
  if (n <= 1) return 0;
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0]! >= limit);
  return buf[0]! % n;
}

function cleanList(list: unknown, limit = MAX_ITEMS): string[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function loadItems(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ITEMS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? cleanList(parsed) : null;
  } catch {
    return null;
  }
}

function saveItems(items: string[]) {
  try {
    window.localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

function drawWheel(
  canvas: HTMLCanvasElement,
  items: string[],
  rotationDeg: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = BASE_SIZE;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 8;
  const n = Math.max(items.length, 1);

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotationDeg * Math.PI) / 180);

  for (let i = 0; i < n; i++) {
    const start = (i / n) * Math.PI * 2 - Math.PI / 2;
    const end = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = sliceColor(i, n);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const label = items[i] ?? "";
    if (!label) continue;
    const mid = (start + end) / 2;
    ctx.save();
    ctx.rotate(mid);
    // Keep labels upright when they would face left.
    const flip = Math.cos(mid) < 0;
    if (flip) ctx.rotate(Math.PI);
    ctx.fillStyle = "#fff";
    ctx.font = `600 ${n > 24 ? 11 : 14}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = flip ? "left" : "right";
    ctx.textBaseline = "middle";
    const text = label.length > 18 ? `${label.slice(0, 16)}…` : label;
    ctx.fillText(text, flip ? -(radius - 16) : radius - 16, 0);
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
}

export function SpinWheelTool() {
  const dictionary = useDictionary();
  const t = dictionary.spinwheelTool;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const spinBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const spinAgainBtnRef = useRef<HTMLButtonElement>(null);
  const skipBlurRef = useRef(false);

  const [items, setItems] = useState<string[]>(
    () => loadItems() ?? cleanList(t.defaultItems),
  );
  const [draft, setDraft] = useState("");
  const [bulk, setBulk] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [popup, setPopup] = useState(false);
  const [removeWinner, setRemoveWinner] = useState(false);

  const canSpin = !spinning && items.length >= 2;

  /** Update the list and remember it for the next visit. */
  const commit = useCallback((next: string[]) => {
    setItems(next);
    saveItems(next);
  }, []);

  // Size the canvas once for the screen density.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = BASE_SIZE * dpr;
    canvas.height = BASE_SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawWheel(canvas, items, rotationRef.current);
    // The size is set once; later redraws are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw when the options change. During a spin the animation draws.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) drawWheel(canvas, items, rotationRef.current);
  }, [items]);

  useEffect(() => {
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const dismissResult = useCallback(() => {
    setPopup(false);
    spinBtnRef.current?.focus();
  }, []);

  // Dialog behaviour: focus the close button, close on Escape, keep Tab inside.
  useEffect(() => {
    if (!popup) return;
    closeBtnRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismissResult();
        return;
      }
      if (event.key !== "Tab") return;
      const first = spinAgainBtnRef.current ?? closeBtnRef.current;
      const last = closeBtnRef.current;
      if (!first || !last) return;
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [popup, dismissResult]);

  function resetResult() {
    setWinner(null);
    setPopup(false);
  }

  function addItem() {
    if (spinning) return;
    const next = draft.trim();
    if (!next) return;
    if (items.length >= MAX_ITEMS) {
      setNotice(t.tooMany.replace("{max}", String(MAX_ITEMS)));
      return;
    }
    commit([...items, next]);
    setDraft("");
    setNotice("");
    resetResult();
  }

  function applyBulk(mode: "add" | "replace") {
    if (spinning) return;
    const lines = cleanList(bulk.split(/\r?\n/), Number.POSITIVE_INFINITY);
    if (lines.length === 0) return;
    const base = mode === "replace" ? [] : items;
    const merged = [...base, ...lines];
    commit(merged.slice(0, MAX_ITEMS));
    setNotice(
      merged.length > MAX_ITEMS ? t.tooMany.replace("{max}", String(MAX_ITEMS)) : "",
    );
    setBulk("");
    setEditing(null);
    resetResult();
  }

  function removeItem(index: number) {
    if (spinning) return;
    commit(items.filter((_, i) => i !== index));
    setNotice("");
    setEditing(null);
    resetResult();
  }

  function startEdit(index: number) {
    if (spinning) return;
    skipBlurRef.current = false;
    setEditing(index);
    setEditValue(items[index] ?? "");
  }

  function saveEdit() {
    if (editing === null) return;
    const next = editValue.trim();
    if (next && next !== items[editing]) {
      commit(items.map((item, i) => (i === editing ? next : item)));
      resetResult();
    }
    setEditing(null);
  }

  function cancelEdit() {
    skipBlurRef.current = true;
    setEditing(null);
  }

  const startSpin = useCallback((list: string[]) => {
    const canvas = canvasRef.current;
    if (!canvas || list.length < 2) return;
    const n = list.length;
    const slice = 360 / n;
    const targetIndex = randomIndex(n);
    // The pointer is at the top and the wheel turns clockwise.
    const targetAngle = 360 - (targetIndex * slice + slice / 2);
    const extraTurns = 5 + randomIndex(3);
    const start = rotationRef.current % 360;
    const distance = extraTurns * 360 + ((targetAngle - start + 360) % 360);
    const duration = 5200 + randomIndex(1200);
    const t0 = performance.now();

    setSpinning(true);
    setWinner(null);
    setPopup(false);

    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - (1 - p) ** 3;
      rotationRef.current = start + distance * eased;
      drawWheel(canvas, list, rotationRef.current);
      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }
      rotationRef.current %= 360;
      animRef.current = null;
      setSpinning(false);
      setWinner({ label: list[targetIndex] ?? "", index: targetIndex });
      setPopup(true);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  function spin() {
    if (!canSpin) return;
    startSpin(items);
  }

  /** The list that remains once the current result is taken off the wheel. */
  const remainingAfterResult = useMemo(() => {
    if (!winner || !removeWinner) return items;
    return items.filter((_, i) => i !== winner.index);
  }, [items, winner, removeWinner]);

  function spinAgain() {
    if (remainingAfterResult.length < 2) return;
    if (removeWinner && winner) commit(remainingAfterResult);
    setPopup(false);
    startSpin(remainingAfterResult);
  }

  function closeResult() {
    if (removeWinner && winner) {
      commit(remainingAfterResult);
    }
    dismissResult();
  }

  const wheelLabel = `${t.wheelLabel.replace("{count}", String(items.length))}${
    items.length ? `: ${items.join(", ")}` : ""
  }`;

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
          width={BASE_SIZE}
          height={BASE_SIZE}
          role="img"
          aria-label={wheelLabel}
          className="mx-auto block h-auto w-full max-w-[420px]"
        />
        <div className="mt-5 flex justify-center">
          <button
            ref={spinBtnRef}
            type="button"
            disabled={!canSpin}
            onClick={spin}
            className="kit-touch-target rounded-[10px] bg-accent px-6 py-3 text-sm font-medium text-white disabled:opacity-40 sm:min-h-0"
          >
            {spinning ? t.spinning : t.spin}
          </button>
        </div>
        {items.length < 2 ? (
          <p className="mt-3 text-center text-sm text-muted">{t.needItems}</p>
        ) : null}
        <p className="sr-only" role="status" aria-live="polite">
          {winner && !spinning ? t.winnerAnnounce.replace("{winner}", winner.label) : ""}
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted">{t.intro}</p>
        <div className="flex gap-2">
          <input
            value={draft}
            disabled={spinning}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            className={`${fieldClass} min-w-0 flex-1 disabled:opacity-50`}
          />
          <button
            type="button"
            disabled={spinning}
            onClick={addItem}
            className={secondaryBtnClass}
          >
            {t.add}
          </button>
        </div>
        {notice ? <p className="text-sm text-muted">{notice}</p> : null}

        <ul className="divide-y divide-border overflow-hidden rounded-[12px] border border-border bg-surface">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-center justify-between gap-3 px-3 py-1.5 text-sm"
            >
              {editing === index ? (
                <input
                  autoFocus
                  value={editValue}
                  aria-label={t.editLabel}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveEdit();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      cancelEdit();
                    }
                  }}
                  onBlur={() => {
                    if (skipBlurRef.current) {
                      skipBlurRef.current = false;
                      return;
                    }
                    saveEdit();
                  }}
                  className={`${fieldClass} min-w-0 flex-1 py-1.5`}
                />
              ) : (
                <button
                  type="button"
                  disabled={spinning}
                  onClick={() => startEdit(index)}
                  title={t.editHint}
                  aria-label={t.editItem.replace("{item}", item)}
                  className="min-w-0 flex-1 truncate rounded-[8px] py-1.5 text-left hover:text-accent disabled:opacity-60"
                >
                  {item}
                </button>
              )}
              <button
                type="button"
                disabled={spinning}
                onClick={() => removeItem(index)}
                aria-label={`${t.remove}: ${item}`}
                className="kit-touch-target shrink-0 rounded-[8px] px-2.5 py-1.5 text-xs text-muted hover:bg-background hover:text-foreground disabled:opacity-40 sm:min-h-0 sm:min-w-0"
              >
                {t.remove}
              </button>
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <label htmlFor="spinwheel-bulk" className="block text-sm font-medium">
            {t.bulkLabel}
          </label>
          <textarea
            id="spinwheel-bulk"
            value={bulk}
            disabled={spinning}
            rows={4}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={t.bulkPlaceholder}
            className={`${fieldClass} disabled:opacity-50`}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={spinning || !bulk.trim()}
              onClick={() => applyBulk("add")}
              className={secondaryBtnClass}
            >
              {t.bulkAdd}
            </button>
            <button
              type="button"
              disabled={spinning || !bulk.trim()}
              onClick={() => applyBulk("replace")}
              className={secondaryBtnClass}
            >
              {t.bulkReplace}
            </button>
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={removeWinner}
            onChange={(e) => setRemoveWinner(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
          />
          <span>{t.removeWinner}</span>
        </label>
      </div>

      {popup && winner ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeResult();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.resultTitle}
            className="w-full max-w-sm rounded-[16px] border border-border bg-surface p-6 text-center shadow-suggest"
          >
            <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
              {t.resultTitle}
            </p>
            <p className="mt-3 break-words text-2xl font-semibold text-foreground">
              {winner.label}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                ref={spinAgainBtnRef}
                type="button"
                disabled={remainingAfterResult.length < 2}
                onClick={spinAgain}
                className={secondaryBtnClass}
              >
                {t.spinAgain}
              </button>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeResult}
                className={primaryBtnClass}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
