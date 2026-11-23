export type SmedInput = {
  currentSetupMinutes: number;
  targetSetupMinutes: number;
  setupsPerYear: number;
  hourlyCost: number;
  /** Optional one-time improvement investment for ROI. */
  improvementCost?: number;
};

export type SmedResult = {
  minutesSavedPerSetup: number;
  hoursSavedPerYear: number;
  moneySavedPerYear: number;
  capacityMinutesFreed: number;
  roiYears: number | null;
  roiPercent: number | null;
};

export function calculateSmed(input: SmedInput): SmedResult | null {
  const {
    currentSetupMinutes,
    targetSetupMinutes,
    setupsPerYear,
    hourlyCost,
    improvementCost,
  } = input;

  if (
    ![
      currentSetupMinutes,
      targetSetupMinutes,
      setupsPerYear,
      hourlyCost,
    ].every(Number.isFinite)
  ) {
    return null;
  }
  if (currentSetupMinutes < 0 || targetSetupMinutes < 0) return null;
  if (setupsPerYear < 0 || hourlyCost < 0) return null;
  if (targetSetupMinutes > currentSetupMinutes) return null;

  const minutesSavedPerSetup = currentSetupMinutes - targetSetupMinutes;
  const capacityMinutesFreed = minutesSavedPerSetup * setupsPerYear;
  const hoursSavedPerYear = capacityMinutesFreed / 60;
  const moneySavedPerYear = hoursSavedPerYear * hourlyCost;

  let roiYears: number | null = null;
  let roiPercent: number | null = null;

  if (
    improvementCost !== undefined &&
    Number.isFinite(improvementCost) &&
    improvementCost >= 0
  ) {
    if (improvementCost === 0) {
      roiYears = moneySavedPerYear > 0 ? 0 : null;
      roiPercent = null;
    } else if (moneySavedPerYear > 0) {
      roiYears = improvementCost / moneySavedPerYear;
      roiPercent = (moneySavedPerYear / improvementCost) * 100;
    }
  }

  return {
    minutesSavedPerSetup,
    hoursSavedPerYear,
    moneySavedPerYear,
    capacityMinutesFreed,
    roiYears,
    roiPercent,
  };
}
