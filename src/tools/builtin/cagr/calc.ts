export type CagrResult = {
  cagrPercent: number;
  multiple: number;
};

export function calculateCagr(args: {
  startValue: number;
  endValue: number;
  years: number;
}): CagrResult | null {
  const { startValue, endValue, years } = args;
  if (!(startValue > 0) || !(endValue > 0) || !(years > 0)) return null;
  const multiple = endValue / startValue;
  const cagr = multiple ** (1 / years) - 1;
  if (!Number.isFinite(cagr)) return null;
  return {
    cagrPercent: cagr * 100,
    multiple,
  };
}
