export function clampNonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

export function hmsToSeconds(hours: number, minutes: number, seconds: number): number {
  return (
    clampNonNegative(hours) * 3600 +
    clampNonNegative(minutes) * 60 +
    clampNonNegative(seconds)
  );
}

export function secondsToHms(total: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const safe = Math.max(0, Math.floor(total));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return { hours, minutes, seconds };
}

export function formatDuration(totalSeconds: number): string {
  const { hours, minutes, seconds } = secondsToHms(totalSeconds);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/** Available production time ÷ demand units = takt time in seconds. */
export function calculateTaktSeconds(
  availableSeconds: number,
  demandUnits: number,
): number | null {
  if (availableSeconds <= 0 || demandUnits <= 0) return null;
  return availableSeconds / demandUnits;
}

export function taktProgress(
  elapsedSeconds: number,
  taktSeconds: number,
): {
  cycleIndex: number;
  progress: number;
  remainingInCycle: number;
} {
  if (taktSeconds <= 0) {
    return { cycleIndex: 0, progress: 0, remainingInCycle: 0 };
  }
  const cycleIndex = Math.floor(elapsedSeconds / taktSeconds);
  const intoCycle = elapsedSeconds % taktSeconds;
  const progress = intoCycle / taktSeconds;
  const remainingInCycle = taktSeconds - intoCycle;
  return { cycleIndex, progress, remainingInCycle };
}

export function remainingTakts(
  remainingSeconds: number,
  taktSeconds: number,
): number {
  if (taktSeconds <= 0 || remainingSeconds <= 0) return 0;
  return Math.floor(remainingSeconds / taktSeconds);
}
