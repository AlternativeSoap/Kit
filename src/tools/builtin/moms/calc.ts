export type MomsMode = "add" | "remove";

export type MomsResult = {
  net: number;
  vat: number;
  gross: number;
  ratePercent: number;
};

export function calculateMoms(
  amount: number,
  ratePercent: number,
  mode: MomsMode,
): MomsResult | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (!Number.isFinite(ratePercent) || ratePercent < 0 || ratePercent > 100) {
    return null;
  }

  const rate = ratePercent / 100;

  if (mode === "add") {
    const net = amount;
    const vat = net * rate;
    const gross = net + vat;
    return { net, vat, gross, ratePercent };
  }

  const gross = amount;
  const net = gross / (1 + rate);
  const vat = gross - net;
  return { net, vat, gross, ratePercent };
}
