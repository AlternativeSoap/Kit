"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { primaryBtnClass, secondaryBtnClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Side = "heads" | "tails";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fairSide(): Side {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0]! % 2 === 0 ? "heads" : "tails";
}

export function CoinFlipTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [side, setSide] = useState<Side>("heads");
  const [flipping, setFlipping] = useState(false);
  const [hasFlipped, setHasFlipped] = useState(false);
  const [turns, setTurns] = useState(0);
  const [flipId, setFlipId] = useState(0);
  const [history, setHistory] = useState<Side[]>([]);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current != null) window.clearTimeout(timer.current);
    };
  }, []);

  function flip() {
    if (flipping) return;
    const next = fairSide();
    const reduced = prefersReducedMotion();
    const duration = reduced ? 40 : 1600;
    const extraSpins = 4 + Math.floor(Math.random() * 3);
    const halfTurns = extraSpins * 2 + (next === "tails" ? 1 : 0);
    const base = side === "tails" ? 1 : 0;

    setHasFlipped(true);
    setSide(next);
    setTurns(base);
    setFlipping(false);
    setFlipId((id) => id + 1);

    if (timer.current != null) window.clearTimeout(timer.current);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setFlipping(true);
        setTurns(base + halfTurns);
      });
    });

    timer.current = window.setTimeout(() => {
      setFlipping(false);
      setTurns(next === "tails" ? 1 : 0);
      setHistory((h) => [next, ...h].slice(0, 20));
    }, duration);
  }

  const rotateX = turns * 180;
  const label =
    side === "heads" ? (da ? "Krone" : "Heads") : da ? "Plat" : "Tails";
  const headsCount = history.filter((s) => s === "heads").length;
  const tailsCount = history.length - headsCount;

  return (
    <div className="kit-tool mx-auto max-w-xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Kast en fair mønt. Den vender ende over ende og lander på plat eller krone. Klik scenen eller tryk mellemrum."
          : "Flip a fair coin. It flips end over end and lands on heads or tails. Click the stage or press Space."}
      </p>

      <div
        className="kit-coin-stage"
        aria-live="polite"
        aria-busy={flipping}
        tabIndex={0}
        role="button"
        onClick={() => {
          if (!flipping) flip();
        }}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            flip();
          }
        }}
      >
        <div
          key={flipId}
          className={`kit-coin-toss${flipping ? " is-flipping" : ""}`}
          style={{ ["--coin-ms"]: "1600ms" } as CSSProperties}
        >
          <div className="kit-coin-scene">
            <div
              className={`kit-coin${flipping ? " is-flipping" : ""}`}
              style={
                {
                  ["--coin-rot"]: `${rotateX}deg`,
                  ["--coin-ms"]: "1600ms",
                } as CSSProperties
              }
            >
              <div className="kit-coin-face kit-coin-heads" aria-hidden>
                <span className="kit-coin-mark">{da ? "K" : "H"}</span>
                <span className="kit-coin-caption">
                  {da ? "Krone" : "Heads"}
                </span>
              </div>
              <div className="kit-coin-face kit-coin-tails" aria-hidden>
                <span className="kit-coin-mark">{da ? "P" : "T"}</span>
                <span className="kit-coin-caption">
                  {da ? "Plat" : "Tails"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-h-[3.25rem] space-y-1 text-sm" aria-live="polite">
            {flipping ? (
              <p className="text-muted">
                {da ? "Mønten snurrer…" : "The coin is spinning…"}
              </p>
            ) : hasFlipped ? (
              <p className="kit-fade-in text-lg font-medium tracking-tight text-foreground">
                {da ? "Resultat" : "Result"}:{" "}
                <span className="text-accent">{label}</span>
              </p>
            ) : (
              <p className="text-muted">
                {da
                  ? "Tryk kast eller klik på mønten."
                  : "Press flip or click the coin."}
              </p>
            )}
            {history.length > 0 && !flipping ? (
              <p className="kit-fade-in text-xs text-muted">
                {da ? "Krone" : "Heads"} {headsCount} ·{" "}
                {da ? "Plat" : "Tails"} {tailsCount}
                <span className="mx-1.5 text-border">·</span>
                {history
                  .slice(0, 8)
                  .map((s) =>
                    s === "heads" ? (da ? "K" : "H") : da ? "P" : "T",
                  )
                  .join(" ")}
              </p>
            ) : null}
          </div>
          <div className="kit-h-scroll">
            {history.length > 0 ? (
              <button
                type="button"
                className={secondaryBtnClass}
                disabled={flipping}
                onClick={(e) => {
                  e.stopPropagation();
                  setHistory([]);
                }}
              >
                {da ? "Ryd historik" : "Clear history"}
              </button>
            ) : null}
            <button
              type="button"
              className={primaryBtnClass}
              disabled={flipping}
              onClick={(e) => {
                e.stopPropagation();
                flip();
              }}
            >
              {flipping
                ? da
                  ? "Kaster…"
                  : "Flipping…"
                : hasFlipped
                  ? da
                    ? "Kast igen"
                    : "Flip again"
                  : da
                    ? "Kast"
                    : "Flip"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
