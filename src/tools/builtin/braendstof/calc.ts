export type EnergyMode = "fuel" | "electric";

export type BraendstofResult = {
  distanceKm: number;
  consumptionPer100: number;
  pricePerUnit: number;
  /** Liters or kWh used for the trip. */
  amountUsed: number;
  totalCost: number;
};

/** Same math for fuel (L/100 km, kr/L) and electric (kWh/100 km, kr/kWh). */
export function calculateBraendstof(
  distanceKm: number,
  consumptionPer100: number,
  pricePerUnit: number,
): BraendstofResult | null {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return null;
  if (!Number.isFinite(consumptionPer100) || consumptionPer100 < 0) return null;
  if (!Number.isFinite(pricePerUnit) || pricePerUnit < 0) return null;

  const amountUsed = (distanceKm * consumptionPer100) / 100;
  const totalCost = amountUsed * pricePerUnit;

  return {
    distanceKm,
    consumptionPer100,
    pricePerUnit,
    amountUsed,
    totalCost,
  };
}
