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

type Wave = "sine" | "square" | "sawtooth" | "triangle";

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.12;
const STEPS = 16;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const WHITE = [0, 2, 4, 5, 7, 9, 11] as const;
const BLACK = [1, 3, 6, 8, 10] as const;

function midiToFreq(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function clampTempo(n: number) {
  return Math.min(240, Math.max(40, Math.round(n) || 120));
}

function emptyPattern(): boolean[] {
  return Array.from({ length: STEPS }, () => false);
}

export function SynthTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [wave, setWave] = useState<Wave>("sine");
  const [gain, setGain] = useState(0.35);
  const [attack, setAttack] = useState(0.01);
  const [decay, setDecay] = useState(0.12);
  const [sustain, setSustain] = useState(0.55);
  const [release, setRelease] = useState(0.2);
  const [octave, setOctave] = useState(4);
  const [tempo, setTempo] = useState(120);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [pattern, setPattern] = useState<boolean[]>(() => {
    const p = emptyPattern();
    p[0] = true;
    p[4] = true;
    p[8] = true;
    p[12] = true;
    return p;
  });
  const [seqNote, setSeqNote] = useState(60); // C4
  const [ready, setReady] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nextNoteRef = useRef(0);
  const stepIndexRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const patternRef = useRef(pattern);
  const tempoRef = useRef(tempo);
  const waveRef = useRef(wave);
  const gainRef = useRef(gain);
  const attackRef = useRef(attack);
  const decayRef = useRef(decay);
  const sustainRef = useRef(sustain);
  const releaseRef = useRef(release);
  const seqNoteRef = useRef(seqNote);
  const heldRef = useRef<Map<number, { osc: OscillatorNode; gain: GainNode }>>(
    new Map(),
  );

  patternRef.current = pattern;
  tempoRef.current = tempo;
  waveRef.current = wave;
  gainRef.current = gain;
  attackRef.current = attack;
  decayRef.current = decay;
  sustainRef.current = sustain;
  releaseRef.current = release;
  seqNoteRef.current = seqNote;

  function ensureCtx() {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctxRef.current) {
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    return ctxRef.current;
  }

  async function unlockAudio() {
    const ctx = ensureCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    setReady(true);
  }

  function scheduleNote(freq: number, time: number, duration = 0.18) {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = waveRef.current;
    osc.frequency.setValueAtTime(freq, time);

    const level = Math.max(0.0001, gainRef.current);
    const a = Math.max(0.001, attackRef.current);
    const d = Math.max(0.001, decayRef.current);
    const s = Math.max(0.0001, Math.min(1, sustainRef.current) * level);
    const r = Math.max(0.001, releaseRef.current);
    const peak = level;
    const noteEnd = time + duration;

    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(peak, time + a);
    g.gain.exponentialRampToValueAtTime(s, time + a + d);
    g.gain.setValueAtTime(s, noteEnd);
    g.gain.exponentialRampToValueAtTime(0.0001, noteEnd + r);

    osc.connect(g);
    g.connect(master);
    osc.start(time);
    osc.stop(noteEnd + r + 0.02);
  }

  function playLive(midi: number) {
    void unlockAudio().then(() => {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master) return;
      stopLive(midi);
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = waveRef.current;
      osc.frequency.value = midiToFreq(midi);
      const level = Math.max(0.0001, gainRef.current);
      const a = Math.max(0.001, attackRef.current);
      const d = Math.max(0.001, decayRef.current);
      const s = Math.max(0.0001, Math.min(1, sustainRef.current) * level);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(level, now + a);
      g.gain.exponentialRampToValueAtTime(s, now + a + d);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      heldRef.current.set(midi, { osc, gain: g });
    });
  }

  function stopLive(midi: number) {
    const ctx = ctxRef.current;
    const held = heldRef.current.get(midi);
    if (!ctx || !held) return;
    const now = ctx.currentTime;
    const r = Math.max(0.001, releaseRef.current);
    try {
      held.gain.gain.cancelScheduledValues(now);
      held.gain.gain.setValueAtTime(Math.max(0.0001, held.gain.gain.value), now);
      held.gain.gain.exponentialRampToValueAtTime(0.0001, now + r);
      held.osc.stop(now + r + 0.02);
    } catch {
      /* already stopped */
    }
    heldRef.current.delete(midi);
  }

  function scheduler() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const secondsPerStep =
      60 / Math.min(240, Math.max(40, tempoRef.current || 120)) / 4;
    while (nextNoteRef.current < ctx.currentTime + SCHEDULE_AHEAD) {
      const index = stepIndexRef.current % STEPS;
      if (patternRef.current[index]) {
        scheduleNote(midiToFreq(seqNoteRef.current), nextNoteRef.current);
      }
      const showAt = nextNoteRef.current;
      const delay = Math.max(0, (showAt - ctx.currentTime) * 1000);
      window.setTimeout(() => setStep(index), delay);
      nextNoteRef.current += secondsPerStep;
      stepIndexRef.current = index + 1;
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
    void ctx.resume().then(() => setReady(true));
    nextNoteRef.current = ctx.currentTime + 0.05;
    stepIndexRef.current = 0;
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
      for (const midi of [...heldRef.current.keys()]) stopLive(midi);
      void ctxRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleStep(i: number) {
    setPattern((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  const baseMidi = 12 * (octave + 1); // C of octave
  const effectiveTempo = clampTempo(tempo);

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Enkel synthesizer med ADSR, klaver og 16-trins sequencer. Tryk Start eller en tangent for at aktivere lyden i browseren."
          : "Simple synthesizer with ADSR, a piano, and a 16-step sequencer. Press Start or a key to unlock audio in the browser."}
      </p>

      {!ready ? (
        <button
          type="button"
          className={primaryBtnClass}
          onClick={() => void unlockAudio()}
        >
          {da ? "Aktiver lyd" : "Enable audio"}
        </button>
      ) : (
        <p className="text-xs text-muted">
          {da ? "Lyd er klar." : "Audio is ready."}
        </p>
      )}

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Bølgeform" : "Waveform"}
          </p>
          <Segmented
            value={wave}
            onChange={setWave}
            ariaLabel={da ? "Bølgeform" : "Waveform"}
            options={[
              { id: "sine", label: da ? "Sinus" : "Sine" },
              { id: "square", label: da ? "Firkant" : "Square" },
              { id: "sawtooth", label: da ? "Sav" : "Saw" },
              { id: "triangle", label: da ? "Trekant" : "Triangle" },
            ]}
          />
        </div>

        <Field label={da ? "Gain" : "Gain"}>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(gain * 100)}
            onChange={(e) => setGain(Number(e.target.value) / 100)}
            className="kit-range"
            aria-label={da ? "Gain" : "Gain"}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["A", attack, setAttack, 0, 0.5],
              ["D", decay, setDecay, 0, 0.8],
              ["S", sustain, setSustain, 0, 1],
              ["R", release, setRelease, 0, 1.5],
            ] as const
          ).map(([label, value, setter, min, max]) => (
            <Field key={label} label={`ADSR · ${label} (${value.toFixed(2)}s)`}>
              <input
                type="range"
                min={min * 1000}
                max={max * 1000}
                value={Math.round(value * 1000)}
                onChange={(e) => setter(Number(e.target.value) / 1000)}
                className="kit-range"
                aria-label={`ADSR ${label}`}
              />
            </Field>
          ))}
        </div>
      </section>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            {da ? "Klaver" : "Piano"}
          </p>
          <div className="kit-h-scroll">
            <button
              type="button"
              className={secondaryBtnClass}
              onClick={() => setOctave((o) => Math.max(2, o - 1))}
            >
              {da ? "Oktav −" : "Octave −"}
            </button>
            <span className="px-2 text-sm tabular-nums text-muted">C{octave}</span>
            <button
              type="button"
              className={secondaryBtnClass}
              onClick={() => setOctave((o) => Math.min(6, o + 1))}
            >
              {da ? "Oktav +" : "Octave +"}
            </button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg select-none touch-manipulation">
          <div className="flex">
            {WHITE.map((semi) => {
              const midi = baseMidi + semi;
              const name = NOTE_NAMES[semi]!;
              return (
                <button
                  key={midi}
                  type="button"
                  className="kit-touch-target relative z-0 flex h-28 flex-1 items-end justify-center rounded-b-[8px] border border-border bg-surface pb-2 text-xs font-medium text-foreground active:bg-accent-soft sm:min-h-0 sm:h-32"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLButtonElement).setPointerCapture(
                      e.pointerId,
                    );
                    playLive(midi);
                    setSeqNote(midi);
                  }}
                  onPointerUp={() => stopLive(midi)}
                  onPointerCancel={() => stopLive(midi)}
                  aria-label={`${name}${octave}`}
                >
                  {name}
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[55%]">
            {BLACK.map((semi) => {
              const midi = baseMidi + semi;
              const name = NOTE_NAMES[semi]!;
              // Black keys sit between white key centers (7 white keys)
              const afterWhiteIndex: Record<number, number> = {
                1: 0,
                3: 1,
                6: 3,
                8: 4,
                10: 5,
              };
              const wi = afterWhiteIndex[semi] ?? 0;
              const left = ((wi + 1) / 7) * 100;
              return (
                <button
                  key={midi}
                  type="button"
                  className="pointer-events-auto absolute top-0 z-10 h-full w-[8%] -translate-x-1/2 rounded-b-[6px] border border-border bg-foreground active:opacity-80"
                  style={{ left: `${left}%` }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    (e.currentTarget as HTMLButtonElement).setPointerCapture(
                      e.pointerId,
                    );
                    playLive(midi);
                    setSeqNote(midi);
                  }}
                  onPointerUp={() => stopLive(midi)}
                  onPointerCancel={() => stopLive(midi)}
                  aria-label={`${name}${octave}`}
                />
              );
            })}
          </div>
        </div>
        <p className="text-xs text-muted">
          {da
            ? `Sekvensernode: ${NOTE_NAMES[seqNote % 12]}${Math.floor(seqNote / 12) - 1}`
            : `Sequencer note: ${NOTE_NAMES[seqNote % 12]}${Math.floor(seqNote / 12) - 1}`}
        </p>
      </section>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            {da ? "16-trins sequencer" : "16-step sequencer"}
          </p>
          <div className="kit-h-scroll">
            <button
              type="button"
              className={primaryBtnClass}
              onClick={() => {
                void unlockAudio().then(() => setRunning((v) => !v));
              }}
            >
              {running ? (da ? "Stop" : "Stop") : da ? "Afspil" : "Play"}
            </button>
            <button
              type="button"
              className={secondaryBtnClass}
              onClick={() => {
                setRunning(false);
                setStep(0);
                setPattern(emptyPattern());
              }}
            >
              {da ? "Ryd" : "Clear"}
            </button>
          </div>
        </div>

        <Field
          label={da ? "Tempo (BPM)" : "Tempo (BPM)"}
          hint={
            tempo !== effectiveTempo
              ? da
                ? `Afspiller som ${effectiveTempo}`
                : `Plays as ${effectiveTempo}`
              : undefined
          }
        >
          <KitInput
            inputMode="numeric"
            value={String(tempo)}
            onChange={(e) => setTempo(Number(e.target.value) || 0)}
            onBlur={() => setTempo(effectiveTempo)}
          />
        </Field>
        <input
          type="range"
          min={40}
          max={240}
          value={effectiveTempo}
          onChange={(e) => setTempo(Number(e.target.value))}
          className="kit-range"
          aria-label="BPM"
        />

        <div
          className="grid gap-1.5 sm:gap-2"
          style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}
        >
          {pattern.map((on, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleStep(i)}
              className={`kit-touch-target aspect-square rounded-[8px] border text-xs font-medium tabular-nums transition-colors sm:min-h-0 ${
                running && step === i
                  ? "border-accent bg-accent text-on-accent"
                  : on
                    ? "border-accent bg-accent-soft text-foreground"
                    : "border-border bg-surface text-muted hover:text-foreground"
              }`}
              aria-pressed={on}
              aria-label={da ? `Trin ${i + 1}` : `Step ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
