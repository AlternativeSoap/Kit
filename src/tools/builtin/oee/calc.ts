export type OeeMode = "direct" | "computed";

export type OeeRating = "worldClass" | "good" | "fair" | "poor";

export type OeeDirectInput = {
  mode: "direct";
  availabilityPercent: number;
  performancePercent: number;
  qualityPercent: number;
};

export type OeeComputedInput = {
  mode: "computed";
  plannedTimeMinutes: number;
  downtimeMinutes: number;
  idealCycleTimeMinutes: number;
  totalPieces: number;
  runTimeMinutes: number;
  goodPieces: number;
};

export type OeeInput = OeeDirectInput | OeeComputedInput;

export type OeeResult = {
  availabilityPercent: number;
  performancePercent: number;
  qualityPercent: number;
  oeePercent: number;
  rating: OeeRating;
  /** Share of the (1 − OEE) gap attributed to each factor (sums to 100 when OEE < 100). */
  lossAvailability: number;
  lossPerformance: number;
  lossQuality: number;
};

function ratingFor(oeePercent: number): OeeRating {
  if (oeePercent >= 85) return "worldClass";
  if (oeePercent >= 60) return "good";
  if (oeePercent >= 40) return "fair";
  return "poor";
}

function lossesFromFactors(
  a: number,
  p: number,
  q: number,
): Pick<OeeResult, "lossAvailability" | "lossPerformance" | "lossQuality"> {
  // Multiplicative gap: compare successive products to attribute lost OEE points.
  const aFrac = a / 100;
  const pFrac = p / 100;
  const qFrac = q / 100;
  const afterA = aFrac;
  const afterAP = aFrac * pFrac;
  const afterAPQ = aFrac * pFrac * qFrac;

  const lossA = Math.max(0, 1 - afterA);
  const lossP = Math.max(0, afterA - afterAP);
  const lossQ = Math.max(0, afterAP - afterAPQ);
  const total = lossA + lossP + lossQ;

  if (total <= 0) {
    return { lossAvailability: 0, lossPerformance: 0, lossQuality: 0 };
  }

  return {
    lossAvailability: (lossA / total) * 100,
    lossPerformance: (lossP / total) * 100,
    lossQuality: (lossQ / total) * 100,
  };
}

export function calculateOee(input: OeeInput): OeeResult | null {
  let availabilityPercent: number;
  let performancePercent: number;
  let qualityPercent: number;

  if (input.mode === "direct") {
    const { availabilityPercent: a, performancePercent: p, qualityPercent: q } =
      input;
    if (![a, p, q].every(Number.isFinite)) return null;
    if (a < 0 || a > 100 || p < 0 || p > 100 || q < 0 || q > 100) return null;
    availabilityPercent = a;
    performancePercent = p;
    qualityPercent = q;
  } else {
    const {
      plannedTimeMinutes,
      downtimeMinutes,
      idealCycleTimeMinutes,
      totalPieces,
      runTimeMinutes,
      goodPieces,
    } = input;

    if (
      ![
        plannedTimeMinutes,
        downtimeMinutes,
        idealCycleTimeMinutes,
        totalPieces,
        runTimeMinutes,
        goodPieces,
      ].every(Number.isFinite)
    ) {
      return null;
    }
    if (plannedTimeMinutes <= 0) return null;
    if (downtimeMinutes < 0 || downtimeMinutes > plannedTimeMinutes) {
      return null;
    }
    if (idealCycleTimeMinutes < 0 || totalPieces < 0 || runTimeMinutes < 0) {
      return null;
    }
    if (goodPieces < 0 || goodPieces > totalPieces) return null;

    const runTime = plannedTimeMinutes - downtimeMinutes;
    if (runTime < 0) return null;

    availabilityPercent = (runTime / plannedTimeMinutes) * 100;

    if (runTimeMinutes <= 0) {
      performancePercent = 0;
    } else {
      performancePercent =
        ((idealCycleTimeMinutes * totalPieces) / runTimeMinutes) * 100;
    }
    // Cap performance at 100% for display sanity (over-speed still allowed up to a soft cap).
    if (performancePercent > 200) performancePercent = 200;

    qualityPercent =
      totalPieces > 0 ? (goodPieces / totalPieces) * 100 : 0;
  }

  const oeePercent =
    (availabilityPercent / 100) *
    (performancePercent / 100) *
    (qualityPercent / 100) *
    100;

  if (!Number.isFinite(oeePercent)) return null;

  const losses = lossesFromFactors(
    availabilityPercent,
    performancePercent,
    qualityPercent,
  );

  return {
    availabilityPercent,
    performancePercent,
    qualityPercent,
    oeePercent,
    rating: ratingFor(oeePercent),
    ...losses,
  };
}
