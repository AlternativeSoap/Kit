export type BmiCategory =
  | "underweight"
  | "normal"
  | "overweight"
  | "obese";

export type BmiResult = {
  bmi: number;
  category: BmiCategory;
  /** Approximate healthy weight range for the given height (kg). */
  healthyMinKg: number;
  healthyMaxKg: number;
};

export function calculateBmi(heightCm: number, weightKg: number): BmiResult | null {
  if (!(heightCm > 0) || !(weightKg > 0)) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (!Number.isFinite(bmi)) return null;

  let category: BmiCategory = "normal";
  if (bmi < 18.5) category = "underweight";
  else if (bmi < 25) category = "normal";
  else if (bmi < 30) category = "overweight";
  else category = "obese";

  return {
    bmi,
    category,
    healthyMinKg: 18.5 * heightM * heightM,
    healthyMaxKg: 24.9 * heightM * heightM,
  };
}
