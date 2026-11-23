/** Inverse of the standard normal CDF (Acklam approximation). */
export function normsInv(p: number): number {
  if (!(p > 0 && p < 1)) return NaN;

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614736e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580577e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];

  const plow = 0.02425;
  const phigh = 1 - plow;

  let q: number;
  let r: number;

  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p > phigh) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }

  q = p - 0.5;
  r = q * q;
  return (
    (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
      q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  );
}

export type SafetyStockInput = {
  /** Demand standard deviation (same period as lead time days use daily demand). */
  demandStdDev: number;
  leadTimeDays: number;
  /** Service level as percent, e.g. 95 for 95%. */
  serviceLevelPercent: number;
  /** When true, use demand during lead time with LT variability. */
  includeLeadTimeVariability: boolean;
  /** Average demand per day (needed for LT variability formula and ROP). */
  avgDemandPerDay?: number;
  /** Lead time standard deviation in days. */
  leadTimeStdDev?: number;
};

export type SafetyStockResult = {
  z: number;
  safetyStock: number;
  reorderPoint: number | null;
  formula: "basic" | "withLtVariability";
  demandDuringLeadTime: number | null;
};

export function calculateSafetyStock(
  input: SafetyStockInput,
): SafetyStockResult | null {
  const {
    demandStdDev,
    leadTimeDays,
    serviceLevelPercent,
    includeLeadTimeVariability,
    avgDemandPerDay,
    leadTimeStdDev,
  } = input;

  if (
    ![demandStdDev, leadTimeDays, serviceLevelPercent].every(Number.isFinite)
  ) {
    return null;
  }
  if (demandStdDev < 0 || leadTimeDays < 0) return null;
  if (serviceLevelPercent <= 0 || serviceLevelPercent >= 100) return null;

  const z = normsInv(serviceLevelPercent / 100);
  if (!Number.isFinite(z)) return null;

  let safetyStock: number;
  let formula: SafetyStockResult["formula"];

  if (includeLeadTimeVariability) {
    if (
      avgDemandPerDay === undefined ||
      leadTimeStdDev === undefined ||
      !Number.isFinite(avgDemandPerDay) ||
      !Number.isFinite(leadTimeStdDev)
    ) {
      return null;
    }
    if (avgDemandPerDay < 0 || leadTimeStdDev < 0) return null;

    const variance =
      leadTimeDays * demandStdDev * demandStdDev +
      avgDemandPerDay * avgDemandPerDay * leadTimeStdDev * leadTimeStdDev;
    safetyStock = z * Math.sqrt(Math.max(0, variance));
    formula = "withLtVariability";
  } else {
    safetyStock = z * demandStdDev * Math.sqrt(leadTimeDays);
    formula = "basic";
  }

  if (!Number.isFinite(safetyStock) || safetyStock < 0) return null;

  const hasAvg =
    avgDemandPerDay !== undefined &&
    Number.isFinite(avgDemandPerDay) &&
    avgDemandPerDay >= 0;
  const demandDuringLeadTime = hasAvg
    ? (avgDemandPerDay as number) * leadTimeDays
    : null;
  const reorderPoint =
    demandDuringLeadTime !== null
      ? demandDuringLeadTime + safetyStock
      : null;

  return {
    z,
    safetyStock,
    reorderPoint,
    formula,
    demandDuringLeadTime,
  };
}
