"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import {
  formatSplitsCopy,
  formatStopurMs,
  type StopurSplit,
} from "./calc";

type RunState = "idle" | "running" | "paused";

export function StopurTool() {
  const dictionary = useDictionary();
  const t = dictionary.stopur;

  const [runState, setRunState] = useState<RunState>("idle");
  const [displayMs, setDisplayMs] = useState(0);
  const [splits, setSplits] = useState<StopurSplit[]>([]);

  const elapsedBeforePause = useRef(0);
  const startedAt = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const elapsedNow = useCallback(() => {
    if (runState !== "running" || startedAt.current === null) {
      return elapsedBeforePause.current;
    }
    return elapsedBeforePause.current + (performance.now() - startedAt.current);
  }, [runState]);

  const tick = useCallback(() => {
    setDisplayMs(elapsedNow());
    rafRef.current = requestAnimationFrame(tick);
  }, [elapsedNow]);

  useEffect(() => {
    if (runState === "running") {
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }
    setDisplayMs(elapsedBeforePause.current);
    return undefined;
  }, [runState, tick]);

  const start = () => {
    startedAt.current = performance.now();
    setRunState("running");
  };

  const pause = () => {
    if (startedAt.current !== null) {
      elapsedBeforePause.current += performance.now() - startedAt.current;
    }
    startedAt.current = null;
    setRunState("paused");
    setDisplayMs(elapsedBeforePause.current);
  };

  const resume = () => {
    startedAt.current = performance.now();
    setRunState("running");
  };

  const reset = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    startedAt.current = null;
    elapsedBeforePause.current = 0;
    setRunState("idle");
    setDisplayMs(0);
    setSplits([]);
  };

  const lap = () => {
    const absoluteMs = elapsedNow();
    const previousAbsolute =
      splits.length > 0 ? splits[splits.length - 1]!.absoluteMs : 0;
    const deltaMs = absoluteMs - previousAbsolute;
    setSplits((prev) => [
      ...prev,
      { index: prev.length + 1, deltaMs, absoluteMs },
    ]);
  };

  const splitsCopy = splits.length > 0 ? formatSplitsCopy(splits) : "";

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="rounded-[12px] border border-border bg-surface px-6 py-8 text-center">
        <p
          className="font-mono text-4xl font-semibold tracking-tight tabular-nums sm:text-6xl"
          aria-live="polite"
        >
          {formatStopurMs(displayMs)}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {runState === "idle" ? (
          <button
            type="button"
            onClick={start}
            className="kit-touch-target inline-flex min-w-[7rem] items-center justify-center rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-on-accent sm:min-h-0"
          >
            {t.start}
          </button>
        ) : null}
        {runState === "running" ? (
          <>
            <button
              type="button"
              onClick={pause}
              className="kit-touch-target inline-flex min-w-[7rem] items-center justify-center rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm font-medium sm:min-h-0"
            >
              {t.pause}
            </button>
            <button
              type="button"
              onClick={lap}
              className="kit-touch-target inline-flex min-w-[7rem] items-center justify-center rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm font-medium sm:min-h-0"
            >
              {t.split}
            </button>
          </>
        ) : null}
        {runState === "paused" ? (
          <button
            type="button"
            onClick={resume}
            className="kit-touch-target inline-flex min-w-[7rem] items-center justify-center rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-on-accent sm:min-h-0"
          >
            {t.resume}
          </button>
        ) : null}
        {runState !== "idle" ? (
          <button
            type="button"
            onClick={reset}
            className="kit-touch-target inline-flex min-w-[7rem] items-center justify-center rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm text-muted hover:text-foreground sm:min-h-0"
          >
            {t.reset}
          </button>
        ) : null}
      </div>

      {splits.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">{t.splitsTitle}</h3>
            <CopyButton
              value={splitsCopy}
              label={t.copySplits}
              copiedLabel={t.copied}
            />
          </div>
          <ul className="divide-y divide-border rounded-[12px] border border-border bg-surface">
            {splits.map((split) => (
              <li
                key={split.index}
                className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 px-3 py-3 text-sm sm:gap-3 sm:px-4"
              >
                <span className="font-medium text-muted">#{split.index}</span>
                <span className="font-mono tabular-nums">
                  +{formatStopurMs(split.deltaMs)}
                </span>
                <span className="font-mono tabular-nums text-muted">
                  {formatStopurMs(split.absoluteMs)}
                </span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-2 px-3 text-xs text-muted sm:gap-3 sm:px-4">
            <span />
            <span>{t.splitDelta}</span>
            <span>{t.splitTotal}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}