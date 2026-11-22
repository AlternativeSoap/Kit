export type RentIncreaseMode = "percent" | "new";

export type RentIncreaseResult = {
  currentRent: number;
  newRent: number;
  increasePercent: number;
  monthlyDiff: number;
  annualDiff: number;
  annualNew: number;
  overCap: boolean;
  capPercent: number | null;
};

export function calculateRentIncrease(args: {
  currentRent: number;
  mode: RentIncreaseMode;
  /** Percent increase when mode is "percent". */
  increasePercent?: number;
  /** New monthly rent when mode is "new". */
  newRent?: number;
  /** Optional warning threshold as percent. */
  capPercent?: number;
}): RentIncreaseResult | null {
  const { currentRent, mode } = args;
  if (!(currentRent > 0) || !Number.isFinite(currentRent)) return null;

  let newRent: number;
  let increasePercent: number;

  if (mode === "percent") {
    const pct = args.increasePercent;
    if (pct === undefined || !Number.isFinite(pct) || pct < 0) return null;
    increasePercent = pct;
    newRent = currentRent * (1 + pct / 100);
  } else {
    const next = args.newRent;
    if (next === undefined || !Number.isFinite(next) || next < 0) return null;
    newRent = next;
    increasePercent = ((newRent - currentRent) / currentRent) * 100;
  }

  const monthlyDiff = newRent - currentRent;
  const cap =
    args.capPercent !== undefined && Number.isFinite(args.capPercent)
      ? args.capPercent
      : null;

  return {
    currentRent,
    newRent,
    increasePercent,
    monthlyDiff,
    annualDiff: monthlyDiff * 12,
    annualNew: newRent * 12,
    overCap: cap !== null && increasePercent > cap,
    capPercent: cap,
  };
}
