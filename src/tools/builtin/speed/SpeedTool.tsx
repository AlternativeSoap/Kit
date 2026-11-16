"use client";

import { useState } from "react";
import { ProgressBar } from "@/tools/builtin/media/ProgressBar";
import { useDictionary } from "@/i18n/LanguageProvider";

const SIZES = [
  { label: "5 MB", bytes: 5_000_000 },
  { label: "25 MB", bytes: 25_000_000 },
] as const;

function formatMbps(bitsPerSecond: number): string {
  const mbps = bitsPerSecond / 1_000_000;
  if (mbps >= 100) return mbps.toFixed(0);
  if (mbps >= 10) return mbps.toFixed(1);
  return mbps.toFixed(2);
}

export function SpeedTool() {
  const dictionary = useDictionary();
  const t = dictionary.speedTool;
  const [size, setSize] = useState<(typeof SIZES)[number]>(SIZES[0]!);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mbps, setMbps] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setProgress(5);
    setMbps(null);
    setError(null);
    const url = `https://speed.cloudflare.com/__down?bytes=${size.bytes}&r=${Date.now()}`;
    const started = performance.now();
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }
      const reader = response.body.getReader();
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value?.byteLength ?? 0;
        setProgress(Math.min(99, Math.round((received / size.bytes) * 100)));
      }
      const elapsedSec = Math.max(0.001, (performance.now() - started) / 1000);
      const bitsPerSecond = (received * 8) / elapsedSec;
      setMbps(formatMbps(bitsPerSecond));
      setProgress(100);
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <p className="text-sm text-muted">{t.privacy}</p>

      <div className="flex flex-wrap gap-2">
        {SIZES.map((item) => (
          <button
            key={item.bytes}
            type="button"
            disabled={busy}
            onClick={() => setSize(item)}
            className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm sm:min-h-0 ${
              size.bytes === item.bytes
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => void run()}
        className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
      >
        {busy ? t.working : t.start}
      </button>

      {busy ? <ProgressBar value={progress} label={t.working} /> : null}
      {error ? <p className="text-sm text-muted">{error}</p> : null}

      {mbps ? (
        <div className="rounded-[12px] border border-border bg-surface px-5 py-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {t.downloadSpeed}
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-foreground">
            {mbps} <span className="text-lg font-medium text-muted">Mbps</span>
          </p>
          <p className="mt-3 text-xs text-muted">{t.note}</p>
        </div>
      ) : null}
    </div>
  );
}
