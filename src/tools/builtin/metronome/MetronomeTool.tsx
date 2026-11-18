"use client";

import { useEffect, useRef, useState } from "react";
import {
  Field,
  KitInput,
  Segmented,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Beats = "2" | "3" | "4" | "6";

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.12;

export function MetronomeTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [bpm, setBpm] = useState(100);
  const [beats, setBeats] = useState<Beats>("4");
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [pulseKey, setPulseKey] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const nextNoteRef = useRef(0);
  const beatIndexRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const bpmRef = useRef(bpm);
  const beatsRef = useRef(Number(beats));
  const volumeRef = useRef(volume);
  const tapTimes = useRef<number[]>([]);

  bpmRef.current = bpm;
  beatsRef.current = Number(beats);
  volumeRef.current = volume;

  function ensureCtx() {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctxRef.current) ctxRef.current = new AudioCtx();
    return ctxRef.current;
  }

  function scheduleClick(time: number, strong: boolean) {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = strong ? 1320 : 880;
    const level = Math.max(0.0001, volumeRef.current * (strong ? 0.22 : 0.14));
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(level, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.07);
  }

  function scheduler() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const secondsPerBeat =
      60 / Math.min(240, Math.max(30, bpmRef.current || 100));
    const bar = Math.max(2, beatsRef.current);
    while (nextNoteRef.current < ctx.currentTime + SCHEDULE_AHEAD) {
      const index = beatIndexRef.current % bar;
      scheduleClick(nextNoteRef.current, index === 0);
      const showAt = nextNoteRef.current;
      const delay = Math.max(0, (showAt - ctx.currentTime) * 1000);
      window.setTimeout(() => {
        setBeat(index);
        setPulseKey((k) => k + 1);
      }, delay);
      nextNoteRef.current += secondsPerBeat;
      beatIndexRef.current = index + 1;
    }
  }

  useEffect(() => {
    if (!running) {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    const ctx = ensureCtx();
    if (!ctx) return;
    void ctx.resume();
    nextNoteRef.current = ctx.currentTime + 0.05;
    beatIndexRef.current = 0;
    scheduler();
    timerRef.current = window.setInterval(scheduler, LOOKAHEAD_MS);
    return () => {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
      void ctxRef.current?.close();
    };
  }, []);

  function clampBpm(n: number) {
    return Math.min(240, Math.max(30, Math.round(n) || 100));
  }

  function tapTempo() {
    const now = performance.now();
    const taps = tapTimes.current.filter((t) => now - t < 3000);
    taps.push(now);
    tapTimes.current = taps;
    if (taps.length < 2) return;
    const intervals: number[] = [];
    for (let i = 1; i < taps.length; i++) {
      intervals.push(taps[i]! - taps[i - 1]!);
    }
    const avg =
      intervals.slice(-4).reduce((a, b) => a + b, 0) /
      Math.min(4, intervals.length);
    setBpm(clampBpm(60_000 / avg));
  }

  const effective = clampBpm(bpm);
  const beatCount = Number(beats);

  return (
    <div className="kit-tool mx-auto max-w-xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Stabil klik-metronom. Første slag i takten er skarpere, og tempoet følger lyduret."
          : "Stable click metronome. The first beat is sharper, and tempo follows the audio clock."}
      </p>

      <section className="kit-tool-panel kit-tool-hero">
        <div className="flex justify-center gap-3">
          {Array.from({ length: beatCount }, (_, i) => (
            <span
              key={`${beats}-${i}`}
              className={`kit-beat ${
                running && beat === i
                  ? i === 0
                    ? "is-on is-strong"
                    : "is-on"
                  : ""
              }`}
            />
          ))}
        </div>
        <p
          key={pulseKey}
          className={`font-mono text-5xl font-semibold tabular-nums tracking-tight text-foreground ${
            running ? "kit-bpm-pulse" : ""
          }`}
        >
          {effective}
          <span className="ml-2 align-middle text-sm font-medium text-muted">
            BPM
          </span>
        </p>
        <div className="kit-h-scroll justify-center">
          <button
            type="button"
            className={primaryBtnClass}
            onClick={() => setRunning((v) => !v)}
          >
            {running ? (da ? "Stop" : "Stop") : da ? "Start" : "Start"}
          </button>
          <button type="button" className={secondaryBtnClass} onClick={tapTempo}>
            {da ? "Tap tempo" : "Tap tempo"}
          </button>
        </div>
      </section>

      <section className="kit-tool-panel space-y-5 p-4 sm:p-5">
        <Field
          label="BPM"
          hint={
            bpm !== effective
              ? da
                ? `Afspiller som ${effective}`
                : `Plays as ${effective}`
              : undefined
          }
        >
          <KitInput
            inputMode="numeric"
            value={String(bpm)}
            onChange={(e) => setBpm(Number(e.target.value) || 0)}
            onBlur={() => setBpm(effective)}
          />
        </Field>

        <input
          type="range"
          min={30}
          max={240}
          value={effective}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="kit-range"
          aria-label="BPM"
        />

        <div className="kit-h-scroll">
          {[80, 100, 120, 140].map((v) => (
            <button
              key={v}
              type="button"
              className={secondaryBtnClass}
              onClick={() => setBpm(v)}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Taktart" : "Time signature"}
          </p>
          <Segmented
            value={beats}
            onChange={setBeats}
            ariaLabel={da ? "Taktart" : "Time signature"}
            options={[
              { id: "2", label: "2/4" },
              { id: "3", label: "3/4" },
              { id: "4", label: "4/4" },
              { id: "6", label: "6/8" },
            ]}
          />
        </div>

        <Field label={da ? "Lydstyrke" : "Volume"}>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="kit-range"
            aria-label={da ? "Lydstyrke" : "Volume"}
          />
        </Field>
      </section>
    </div>
  );
}
