/** Inverse of the standard normal CDF (Acklam approximation). */
function normsInv(p: number): number {
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

export type PeriodicSsMode = "manual" | "service";

export type PeriodicInput = {
  reviewIntervalDays: number;
  leadTimeDays: number;
  avgDailyDemand: number;
  currentStock: number;
  ssMode: PeriodicSsMode;
  safetyStock?: number;
  serviceLevelPercent?: number;
  demandStdDev?: number;
};

export type PeriodicResult = {
  safetyStock: number;
  protectionPeriod: number;
  orderUpTo: number;
  orderQty: number;
  z: number | null;
};

export function calculatePeriodicReview(
  input: PeriodicInput,
): PeriodicResult | null {
  const {
    reviewIntervalDays,
    leadTimeDays,
    avgDailyDemand,
    currentStock,
    ssMode,
    safetyStock: manualSs,
    serviceLevelPercent,
    demandStdDev,
  } = input;

  if (
    ![
      reviewIntervalDays,
      leadTimeDays,
      avgDailyDemand,
      currentStock,
    ].every(Number.isFinite)
  ) {
    return null;
  }
  if (
    reviewIntervalDays < 0 ||
    leadTimeDays < 0 ||
    avgDailyDemand < 0 ||
    currentStock < 0
  ) {
    return null;
  }

  const protectionPeriod = reviewIntervalDays + leadTimeDays;
  let safetyStock: number;
  let z: number | null = null;

  if (ssMode === "manual") {
    if (manualSs === undefined || !Number.isFinite(manualSs) || manualSs < 0) {
      return null;
    }
    safetyStock = manualSs;
  } else {
    if (
      serviceLevelPercent === undefined ||
      demandStdDev === undefined ||
      !Number.isFinite(serviceLevelPercent) ||
      !Number.isFinite(demandStdDev)
    ) {
      return null;
    }
    if (demandStdDev < 0) return null;
    if (serviceLevelPercent <= 0 || serviceLevelPercent >= 100) return null;
    z = normsInv(serviceLevelPercent / 100);
    if (!Number.isFinite(z)) return null;
    safetyStock = z * demandStdDev * Math.sqrt(protectionPeriod);
  }

  const orderUpTo = avgDailyDemand * protectionPeriod + safetyStock;
  const orderQty = Math.max(0, orderUpTo - currentStock);

  return {
    safetyStock,
    protectionPeriod,
    orderUpTo,
    orderQty,
    z,
  };
}
