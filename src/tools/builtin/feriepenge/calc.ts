export const DEFAULT_FERIEPENGE_RATE = 12.5;

export type FeriepengeResult = {
  pay: number;
  ratePercent: number;
  amount: number;
};

export function calculateFeriepenge(
  pay: number,
  ratePercent: number,
): FeriepengeResult | null {
  if (!Number.isFinite(pay) || pay < 0) return null;
  if (!Number.isFinite(ratePercent) || ratePercent < 0 || ratePercent > 100) {
    return null;
  }

  return {
    pay,
    ratePercent,
    amount: (pay * ratePercent) / 100,
  };
}