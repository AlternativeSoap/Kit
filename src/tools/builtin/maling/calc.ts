export type MalingInput = {
  /** Wall length in meters (used when area is not set). */
  lengthM?: number;
  /** Wall height in meters (used when area is not set). */
  heightM?: number;
  /** Gross wall area in m² (overrides length × height when set). */
  areaM2?: number;
  /** Doors and windows area to subtract, m². */
  openingsM2?: number;
  /** Number of coats (1–3). */
  coats: number;
  /** Coverage in m² per liter. */
  coverageM2PerL: number;
  /** Extra paint percentage for waste/spillage. */
  wastePercent: number;
  /** Optional can size in liters. */
  canSizeL?: number;
};

export type MalingResult = {
  grossArea: number;
  openings: number;
  netArea: number;
  paintLiters: number;
  cansNeeded: number | null;
  canSizeL: number | null;
};

export function calculatePaint(input: MalingInput): MalingResult | null {
  const coats = input.coats;
  const coverage = input.coverageM2PerL;
  const waste = input.wastePercent;

  if (!Number.isFinite(coats) || coats < 1 || coats > 3) return null;
  if (!Number.isFinite(coverage) || coverage <= 0) return null;
  if (!Number.isFinite(waste) || waste < 0 || waste > 100) return null;

  let grossArea: number;
  if (
    input.areaM2 !== undefined &&
    Number.isFinite(input.areaM2) &&
    input.areaM2 > 0
  ) {
    grossArea = input.areaM2;
  } else if (
    input.lengthM !== undefined &&
    input.heightM !== undefined &&
    Number.isFinite(input.lengthM) &&
    Number.isFinite(input.heightM) &&
    input.lengthM > 0 &&
    input.heightM > 0
  ) {
    grossArea = input.lengthM * input.heightM;
  } else {
    return null;
  }

  const openings =
    input.openingsM2 !== undefined &&
    Number.isFinite(input.openingsM2) &&
    input.openingsM2 >= 0
      ? input.openingsM2
      : 0;

  const netArea = Math.max(0, grossArea - openings);
  if (netArea <= 0) return null;

  const baseLiters = (netArea * coats) / coverage;
  const paintLiters = baseLiters * (1 + waste / 100);

  let cansNeeded: number | null = null;
  let canSizeL: number | null = null;
  if (
    input.canSizeL !== undefined &&
    Number.isFinite(input.canSizeL) &&
    input.canSizeL > 0
  ) {
    canSizeL = input.canSizeL;
    cansNeeded = Math.ceil(paintLiters / input.canSizeL);
  }

  return {
    grossArea,
    openings,
    netArea,
    paintLiters,
    cansNeeded,
    canSizeL,
  };
}
