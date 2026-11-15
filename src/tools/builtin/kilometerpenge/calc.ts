export const DEFAULT_RATE_PER_KM = 3.79;
export const DEFAULT_THRESHOLD_KM = 20_000;
export const DEFAULT_LOW_RATE_PER_KM = 2.23;

export type KilometerpengeMode = "simple" | "threshold";

export type KilometerpengeResult = {
  total: number;
  km: number;
  mode: KilometerpengeMode;
  highRate: number;
  lowRate: number;
  thresholdKm: number;
  /** High-rate portion of the total, threshold mode only. */
  highPart?: number;
  /** Low-rate portion of the total, threshold mode only. */
  lowPart?: number;
  kmAtHigh?: number;
  kmAtLow?: number;
};

export function calculateKilometerpenge(
  km: number,
  highRate: number,
  mode: KilometerpengeMode,
  thresholdKm: number,
  lowRate: number,
): KilometerpengeResult | null {
  if (!Number.isFinite(km) || km < 0) return null;
  if (!Number.isFinite(highRate) || highRate < 0) return null;
  if (!Number.isFinite(lowRate) || lowRate < 0) return null;
  if (!Number.isFinite(thresholdKm) || thresholdKm < 0) return null;

  if (mode === "simple") {
    return {
      total: km * highRate,
      km,
      mode,
      highRate,
      lowRate,
      thresholdKm,
    };
  }

  const kmAtHigh = Math.min(km, thresholdKm);
  const kmAtLow = Math.max(0, km - thresholdKm);
  const highPart = kmAtHigh * highRate;
  const lowPart = kmAtLow * lowRate;

  return {
    total: highPart + lowPart,
    km,
    mode,
    highRate,
    lowRate,
    thresholdKm,
    highPart,
    lowPart,
    kmAtHigh,
    kmAtLow,
  };
}