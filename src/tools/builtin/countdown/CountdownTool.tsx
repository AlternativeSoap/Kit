"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import {
  prefillNumber,
  type ToolPrefill,
} from "@/tools/prefill";
import {
  calculateTaktSeconds,
  formatDuration,
  hmsToSeconds,
  remainingTakts,
  taktProgress,
} from "./calc";

const CLOCK_SIZE = 220;
const CLOCK_CENTER = CLOCK_SIZE / 2;
const OUTER_R = 96;
const INNER_R = 78;
const OUTER_C = 2 * Math.PI * OUTER_R;
const INNER_C = 2 * Math.PI * INNER_R;

function NumberInput({
  value,
  onChange,
  min = "0",
  max,
  disabled,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      disabled={disabled}
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-center text-[15px] outline-none transition-colors focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] disabled:opacity-60"
    />
  );
}

function playTaktBeep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.04;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.stop(ctx.currentTime + 0.13);
    window.setTimeout(() => void ctx.close(), 200);
  } catch {
    // Audio may be blocked; ignore.
  }
}

function parseNonNegInt(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

function initialFromPrefill(prefill: ToolPrefill | undefined) {
  const hours = prefillNumber(prefill, "hours", { min: 0, max: 99, integer: true });
  const minutes = prefillNumber(prefill, "minutes", {
    min: 0,
    max: 59,
    integer: true,
  });
  const seconds = prefillNumber(prefill, "seconds", {
    min: 0,
    max: 59,
    integer: true,
  });
  const takt = prefillNumber(prefill, "takt", { min: 0.1 });
  const demand = prefillNumber(prefill, "demand", { min: 1 });
  const available = prefillNumber(prefill, "available", { min: 0.1 });

  const hasDuration = hours !== null || minutes !== null || seconds !== null;
  const hms = hasDuration
    ? {
        hours: hours ?? "0",
        minutes: minutes ?? "0",
        seconds: seconds ?? "0",
      }
    : { hours: "0", minutes: "25", seconds: "0" };

  const totalSeconds = hmsToSeconds(
    Number(hms.hours),
    Number(hms.minutes),
    Number(hms.seconds),
  );

  return {
    ...hms,
    taktSecondsInput: takt ?? "90",
    availableMinutes: available ?? "480",
    demandUnits: demand ?? "320",
    durationMs: totalSeconds * 1000,
  };
}

export function CountdownTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.countdown;
  const [initial] = useState(() => initialFromPrefill(prefill));

  const [hours, setHours] = useState(initial.hours);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [seconds, setSeconds] = useState(initial.seconds);
  const [taktSecondsInput, setTaktSecondsInput] = useState(
    initial.taktSecondsInput,
  );
  const [soundOn, setSoundOn] = useState(false);
  const [availableMinutes, setAvailableMinutes] = useState(
    initial.availableMinutes,
  );
  const [demandUnits, setDemandUnits] = useState(initial.demandUnits);

  const [remainingMs, setRemainingMs] = useState(initial.durationMs);
  const [durationMs, setDurationMs] = useState(initial.durationMs);
  const [running, setRunning] = useState(false);
  const [taktPulse, setTaktPulse] = useState(0);

  const endAtRef = useRef<number | null>(null);
  const durationMsRef = useRef(initial.durationMs);
  const lastTaktRef = useRef(-1);
  const rafRef = useRef(0);

  const configuredSeconds = useMemo(
    () =>
      hmsToSeconds(
        parseNonNegInt(hours),
        parseNonNegInt(minutes),
        parseNonNegInt(seconds),
      ),
    [hours, minutes, seconds],
  );

  const taktSeconds = useMemo(() => {
    const trimmed = taktSecondsInput.trim();
    if (!trimmed) return 0;
    const n = Number(trimmed.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [taktSecondsInput]);

  const suggestedTakt = useMemo(() => {
    const avail = Number(availableMinutes.replace(",", ".")) * 60;
    const demand = Number(demandUnits.replace(",", "."));
    return calculateTaktSeconds(avail, demand);
  }, [availableMinutes, demandUnits]);

  const syncDuration = (nextHours: string, nextMinutes: string, nextSeconds: string) => {
    const totalMs =
      hmsToSeconds(
        parseNonNegInt(nextHours),
        parseNonNegInt(nextMinutes),
        parseNonNegInt(nextSeconds),
      ) * 1000;
    durationMsRef.current = totalMs;
    setDurationMs(totalMs);
    setRemainingMs(totalMs);
    lastTaktRef.current = -1;
  };

  const onHoursChange = (value: string) => {
    setHours(value);
    if (!running) syncDuration(value, minutes, seconds);
  };

  const onMinutesChange = (value: string) => {
    setMinutes(value);
    if (!running) syncDuration(hours, value, seconds);
  };

  const onSecondsChange = (value: string) => {
    setSeconds(value);
    if (!running) syncDuration(hours, minutes, value);
  };

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = () => {
      if (endAtRef.current === null) return;
      const left = Math.max(0, endAtRef.current - Date.now());
      setRemainingMs(left);
      if (left <= 0) {
        setRunning(false);
        endAtRef.current = null;
        setRemainingMs(0);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  const elapsedMs = Math.max(0, durationMs - remainingMs);
  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const elapsedSeconds = elapsedMs / 1000;
  const done = remainingMs <= 0 && durationMs > 0 && !running;
  const totalProgress =
    durationMs > 0 ? Math.min(1, Math.max(0, remainingMs / durationMs)) : 0;

  const takt = useMemo(
    () => taktProgress(elapsedSeconds, taktSeconds),
    [elapsedSeconds, taktSeconds],
  );

  useEffect(() => {
    if (!running || taktSeconds <= 0) return;
    if (takt.cycleIndex > lastTaktRef.current && takt.cycleIndex > 0) {
      if (soundOn) playTaktBeep();
      setTaktPulse((value) => value + 1);
    }
    lastTaktRef.current = takt.cycleIndex;
  }, [running, soundOn, takt.cycleIndex, taktSeconds]);

  const start = () => {
    if (configuredSeconds <= 0 && remainingMs <= 0) return;

    if (remainingMs <= 0) {
      const totalMs = configuredSeconds * 1000;
      if (totalMs <= 0) return;
      durationMsRef.current = totalMs;
      setDurationMs(totalMs);
      setRemainingMs(totalMs);
      lastTaktRef.current = -1;
      endAtRef.current = Date.now() + totalMs;
    } else {
      endAtRef.current = Date.now() + remainingMs;
    }
    setRunning(true);
  };

  const pause = () => {
    setRunning(false);
    endAtRef.current = null;
  };

  const reset = () => {
    setRunning(false);
    endAtRef.current = null;
    const totalMs = configuredSeconds * 1000;
    durationMsRef.current = totalMs;
    setDurationMs(totalMs);
    setRemainingMs(totalMs);
    lastTaktRef.current = -1;
  };

  const useSuggestedTakt = () => {
    if (suggestedTakt === null) return;
    setTaktSecondsInput(String(Math.round(suggestedTakt * 10) / 10));
  };

  const display = formatDuration(remainingSeconds);
  const taktsLeft = remainingTakts(remainingSeconds, taktSeconds);
  const canStart = configuredSeconds > 0 || remainingMs > 0;
  const isPaused = !running && remainingMs > 0 && remainingMs < durationMs;
  const outerOffset = OUTER_C * (1 - totalProgress);
  const innerOffset = INNER_C * (1 - (taktSeconds > 0 ? takt.progress : 0));

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="relative mx-auto w-full max-w-[280px]">
        <svg
          viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
          className="h-auto w-full"
          aria-hidden="true"
        >
          <circle
            cx={CLOCK_CENTER}
            cy={CLOCK_CENTER}
            r={OUTER_R}
            fill="none"
            stroke="var(--border)"
            strokeWidth="10"
          />
          <circle
            cx={CLOCK_CENTER}
            cy={CLOCK_CENTER}
            r={OUTER_R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={OUTER_C}
            strokeDashoffset={outerOffset}
            transform={`rotate(-90 ${CLOCK_CENTER} ${CLOCK_CENTER})`}
            className={done ? "opacity-100" : "opacity-95"}
          />
          {taktSeconds > 0 ? (
            <>
              <circle
                cx={CLOCK_CENTER}
                cy={CLOCK_CENTER}
                r={INNER_R}
                fill="none"
                stroke="var(--accent-soft)"
                strokeWidth="6"
              />
              <circle
                cx={CLOCK_CENTER}
                cy={CLOCK_CENTER}
                r={INNER_R}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={INNER_C}
                strokeDashoffset={innerOffset}
                transform={`rotate(-90 ${CLOCK_CENTER} ${CLOCK_CENTER})`}
                opacity={0.55}
              />
            </>
          ) : null}
        </svg>

        {taktPulse > 0 ? (
          <div
            key={taktPulse}
            className="kit-takt-pulse pointer-events-none absolute inset-[12%] rounded-full border-2 border-accent"
          />
        ) : null}

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
            {done ? t.finished : t.remaining}
          </p>
          <p
            className={`mt-1 font-mono text-[2.75rem] leading-none tracking-tight sm:text-5xl ${
              done ? "text-accent" : "text-foreground"
            }`}
          >
            {display}
          </p>
          {taktSeconds > 0 ? (
            <p className="mt-3 text-sm text-muted">
              {t.taktNow} {takt.cycleIndex + 1}
              <span className="mx-1.5 text-border">·</span>
              {formatDuration(Math.ceil(takt.remainingInCycle))}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {running ? (
          <button
            type="button"
            onClick={pause}
            className="kit-touch-target rounded-[10px] bg-accent px-5 py-2.5 text-sm font-medium text-on-accent hover:opacity-90 sm:min-h-0"
          >
            {t.pause}
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={!canStart}
            className="kit-touch-target rounded-[10px] bg-accent px-5 py-2.5 text-sm font-medium text-on-accent hover:opacity-90 disabled:opacity-50 sm:min-h-0"
          >
            {isPaused ? t.resume : t.start}
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="kit-touch-target rounded-[10px] border border-border bg-surface px-5 py-2.5 text-sm font-medium hover:bg-background sm:min-h-0"
        >
          {t.reset}
        </button>
      </div>

      <fieldset className="space-y-3" disabled={running}>
        <legend className="text-sm font-medium text-foreground">{t.duration}</legend>
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              {t.hours}
            </span>
            <NumberInput
              value={hours}
              onChange={onHoursChange}
              max="99"
              ariaLabel={t.hours}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              {t.minutes}
            </span>
            <NumberInput
              value={minutes}
              onChange={onMinutesChange}
              max="59"
              ariaLabel={t.minutes}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              {t.seconds}
            </span>
            <NumberInput
              value={seconds}
              onChange={onSecondsChange}
              max="59"
              ariaLabel={t.seconds}
            />
          </label>
        </div>
      </fieldset>

      <section className="space-y-4 border-t border-border pt-6">
        <div>
          <h2 className="text-sm font-medium text-foreground">{t.taktTitle}</h2>
          <p className="mt-1 text-sm text-muted">{t.taktIntro}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              {t.taktInterval}
            </span>
            <NumberInput
              value={taktSecondsInput}
              onChange={setTaktSecondsInput}
              min="0"
              ariaLabel={t.taktInterval}
            />
            <span className="mt-1 block text-xs text-muted">
              {t.taktIntervalHint}
            </span>
          </label>

          <label className="flex items-center gap-2 pb-2.5 text-sm">
            <input
              type="checkbox"
              checked={soundOn}
              onChange={(event) => setSoundOn(event.target.checked)}
              className="h-4 w-4 rounded border-border accent-[var(--accent)]"
            />
            {t.sound}
          </label>
        </div>

        {taktSeconds > 0 ? (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted">{t.completedTakts}</dt>
              <dd className="mt-0.5 text-lg font-medium tabular-nums">
                {takt.cycleIndex}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t.remainingTakts}</dt>
              <dd className="mt-0.5 text-lg font-medium tabular-nums">
                {taktsLeft}
              </dd>
            </div>
          </dl>
        ) : null}

        <details className="group rounded-[10px] border border-border bg-surface px-4 py-3">
          <summary className="cursor-pointer list-none text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              {t.calcTitle}
              <span className="text-muted transition-transform group-open:rotate-45">
                +
              </span>
            </span>
          </summary>
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <p className="text-sm text-muted">{t.calcIntro}</p>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                {t.availableTime}
              </span>
              <NumberInput
                value={availableMinutes}
                onChange={setAvailableMinutes}
                min="1"
                ariaLabel={t.availableTime}
              />
              <span className="mt-1 block text-xs text-muted">
                {t.availableTimeHint}
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{t.demand}</span>
              <NumberInput
                value={demandUnits}
                onChange={setDemandUnits}
                min="1"
                ariaLabel={t.demand}
              />
              <span className="mt-1 block text-xs text-muted">{t.demandHint}</span>
            </label>
            <div>
              <p className="text-xs text-muted">{t.suggestedTakt}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                {suggestedTakt !== null
                  ? `${formatNumber(suggestedTakt, locale, 1)} s`
                  : "—"}
              </p>
              {suggestedTakt !== null ? (
                <p className="mt-1 text-sm text-muted">
                  {formatDuration(Math.round(suggestedTakt))} {t.perUnit}
                </p>
              ) : null}
              <button
                type="button"
                onClick={useSuggestedTakt}
                disabled={suggestedTakt === null || running}
                className="kit-touch-target mt-3 rounded-[10px] border border-border px-3 py-2 text-sm font-medium hover:bg-background disabled:opacity-50 sm:min-h-0"
              >
                {t.useSuggested}
              </button>
            </div>
          </div>
        </details>
      </section>

      <p className="text-xs leading-relaxed text-muted">{t.disclaimer}</p>
    </div>
  );
}
