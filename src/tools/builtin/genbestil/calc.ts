export type RopMode = "simple" | "service";

/** Common service-level → Z pairs (normal distribution). */
export const Z_PRESETS: readonly { servicePct: number; z: number }[] = [
  { servicePct: 50, z: 0 },
  { servicePct: 84, z: 1 },
  { servicePct: 90, z: 1.28 },
  { servicePct: 95, z: 1.65 },
  { servicePct: 97.5, z: 1.96 },
  { servicePct: 99, z: 2.33 },
  { servicePct: 99.9, z: 3.09 },
] as const;

/**
 * Look up or linearly interpolate Z from a service level percentage.
 * Clamps outside the preset range to the nearest endpoint.
 */
export function zFromServicePct(servicePct: number): number | null {
  if (!Number.isFinite(servicePct)) return null;
  if (servicePct < 50 || servicePct > 99.9) {
    // Still allow exact preset hits outside via clamp interpolation ends
  }
  const sorted = [...Z_PRESETS].sort((a, b) => a.servicePct - b.servicePct);
  if (servicePct <= sorted[0].servicePct) return sorted[0].z;
  if (servicePct >= sorted[sorted.length - 1].servicePct) {
    return sorted[sorted.length - 1].z;
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (servicePct >= a.servicePct && servicePct <= b.servicePct) {
      if (b.servicePct === a.servicePct) return a.z;
      const t = (servicePct - a.servicePct) / (b.servicePct - a.servicePct);
      return a.z + t * (b.z - a.z);
    }
  }
  return null;
}

export type SimpleRopInput = {
  mode: "simple";
  /** Average daily demand. */
  dailyDemand: number;
  /** Lead time in days. */
  leadTimeDays: number;
  /** Explicit safety stock (units). */
  safetyStock: number;
};

export type ServiceRopInput = {
  mode: "service";
  /** Average daily demand. */
  dailyDemand: number;
  /** Lead time in days. */
  leadTimeDays: number;
  /** Standard deviation of daily demand. */
  demandStdDev: number;
  /** Service level % (e.g. 95) or direct Z. */
  servicePct?: number;
  z?: number;
};

export type RopInput = SimpleRopInput | ServiceRopInput;

export type RopResult = {
  mode: RopMode;
  demandDuringLt: number;
  safetyStock: number;
  rop: number;
  z: number | null;
  servicePct: number | null;
  /** Note about cycle stock vs reorder point. */
  cycleStockNote: string;
};

export function calculateRop(
  input: RopInput,
  locale: "da" | "en" = "en",
): RopResult | null {
  const { dailyDemand: d, leadTimeDays: L } = input;
  if (!(d >= 0) || !(L >= 0) || !Number.isFinite(d) || !Number.isFinite(L)) {
    return null;
  }

  const demandDuringLt = d * L;
  const cycleStockNote =
    locale === "da"
      ? "ROP er genbestillingspunktet (lager + bestilling undervejs). Cykluslager er typisk EOQ/2 og styrer ordrestørrelse, ikke hvornår du bestiller."
      : "ROP is when to reorder (on-hand + on-order). Cycle stock is typically EOQ/2 and governs order size, not reorder timing.";

  if (input.mode === "simple") {
    const ss = input.safetyStock;
    if (!Number.isFinite(ss) || ss < 0) return null;
    return {
      mode: "simple",
      demandDuringLt,
      safetyStock: ss,
      rop: demandDuringLt + ss,
      z: null,
      servicePct: null,
      cycleStockNote,
    };
  }

  const sigma = input.demandStdDev;
  if (!Number.isFinite(sigma) || sigma < 0) return null;

  let z: number;
  let servicePct: number | null = null;
  if (input.z !== undefined && Number.isFinite(input.z)) {
    z = input.z;
    servicePct = input.servicePct ?? null;
  } else if (input.servicePct !== undefined) {
    const looked = zFromServicePct(input.servicePct);
    if (looked === null) return null;
    z = looked;
    servicePct = input.servicePct;
  } else {
    return null;
  }

  // SS = Z × σ_d × √L  (daily demand stddev, constant lead time)
  const safetyStock = z * sigma * Math.sqrt(L);
  if (!Number.isFinite(safetyStock)) return null;

  return {
    mode: "service",
    demandDuringLt,
    safetyStock,
    rop: demandDuringLt + safetyStock,
    z,
    servicePct,
    cycleStockNote,
  };
}
