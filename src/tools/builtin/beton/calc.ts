export type BetonShape = "slab" | "footing" | "cylinder";

export type BetonInput = {
  shape: BetonShape;
  /** Length or trench length (m). */
  lengthM: number;
  /** Width or trench width (m). Unused for cylinder. */
  widthM: number;
  /** Slab thickness, footing depth, or column height (m). */
  depthM: number;
  /** Cylinder diameter (m). Used only for cylinder. */
  diameterM: number;
  wastePercent: number;
  /** Optional yield volume per bag (m³), e.g. a 25 kg bag. */
  bagYieldM3: number | null;
};

export type BetonResult = {
  shape: BetonShape;
  rawVolumeM3: number;
  volumeM3: number;
  wastePercent: number;
  bagsNeeded: number | null;
  bagYieldM3: number | null;
};

export function calculateConcrete(input: BetonInput): BetonResult | null {
  const { shape, wastePercent, bagYieldM3 } = input;

  if (!Number.isFinite(wastePercent) || wastePercent < 0) return null;
  if (
    bagYieldM3 !== null &&
    (!Number.isFinite(bagYieldM3) || bagYieldM3 <= 0)
  ) {
    return null;
  }

  let rawVolumeM3: number;
  if (shape === "slab" || shape === "footing") {
    const { lengthM, widthM, depthM } = input;
    if (
      ![lengthM, widthM, depthM].every(Number.isFinite) ||
      lengthM <= 0 ||
      widthM <= 0 ||
      depthM <= 0
    ) {
      return null;
    }
    rawVolumeM3 = lengthM * widthM * depthM;
  } else if (shape === "cylinder") {
    const { diameterM, depthM } = input;
    if (
      ![diameterM, depthM].every(Number.isFinite) ||
      diameterM <= 0 ||
      depthM <= 0
    ) {
      return null;
    }
    const radius = diameterM / 2;
    rawVolumeM3 = Math.PI * radius * radius * depthM;
  } else {
    return null;
  }

  if (!(rawVolumeM3 > 0)) return null;

  const volumeM3 = rawVolumeM3 * (1 + wastePercent / 100);
  const bagsNeeded =
    bagYieldM3 !== null ? Math.ceil(volumeM3 / bagYieldM3) : null;

  return {
    shape,
    rawVolumeM3,
    volumeM3,
    wastePercent,
    bagsNeeded,
    bagYieldM3,
  };
}
