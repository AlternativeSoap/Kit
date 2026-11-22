export type GardinInput = {
  /** Window width in cm. */
  windowWidthCm: number;
  /** Window / finished curtain height in cm. */
  windowHeightCm: number;
  /** Fullness multiplier, typically 1.5–3. */
  fullness: number;
  /** Extra length for heading/top hem (cm). */
  topHemCm: number;
  /** Extra length for bottom hem (cm). */
  bottomHemCm: number;
  /** Side hem per drop edge (cm), applied twice per drop. */
  sideHemCm: number;
  /** Bolt / fabric width (cm), often ~140. */
  fabricWidthCm: number;
  /** Optional vertical pattern repeat (cm). */
  patternRepeatCm: number | null;
};

export type GardinResult = {
  finishedWidthCm: number;
  drops: number;
  cutLengthCm: number;
  fabricMeters: number;
  fabricWidthCm: number;
  patternRepeatCm: number | null;
};

export function calculateCurtain(input: GardinInput): GardinResult | null {
  const {
    windowWidthCm,
    windowHeightCm,
    fullness,
    topHemCm,
    bottomHemCm,
    sideHemCm,
    fabricWidthCm,
    patternRepeatCm,
  } = input;

  if (
    ![
      windowWidthCm,
      windowHeightCm,
      fullness,
      topHemCm,
      bottomHemCm,
      sideHemCm,
      fabricWidthCm,
    ].every(Number.isFinite)
  ) {
    return null;
  }
  if (windowWidthCm <= 0 || windowHeightCm <= 0) return null;
  if (fullness < 1.5 || fullness > 3) return null;
  if (topHemCm < 0 || bottomHemCm < 0 || sideHemCm < 0) return null;
  if (fabricWidthCm <= 0) return null;
  if (
    patternRepeatCm !== null &&
    (!Number.isFinite(patternRepeatCm) || patternRepeatCm < 0)
  ) {
    return null;
  }

  const finishedWidthCm = windowWidthCm * fullness;
  const usableWidthPerDrop = fabricWidthCm - sideHemCm * 2;
  if (usableWidthPerDrop <= 0) return null;

  const drops = Math.max(1, Math.ceil(finishedWidthCm / usableWidthPerDrop));

  let cutLengthCm = windowHeightCm + topHemCm + bottomHemCm;
  if (patternRepeatCm !== null && patternRepeatCm > 0) {
    cutLengthCm = Math.ceil(cutLengthCm / patternRepeatCm) * patternRepeatCm;
  }

  const fabricMeters = (drops * cutLengthCm) / 100;

  return {
    finishedWidthCm,
    drops,
    cutLengthCm,
    fabricMeters,
    fabricWidthCm,
    patternRepeatCm,
  };
}
