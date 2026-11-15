export type PalletType = "eur" | "industri" | "custom";

export const PALLET_LM: Record<"eur" | "industri", number> = {
  eur: 0.4,
  industri: 0.5,
};

export type LadmeterInputs = {
  lengthM?: number;
  widthM?: number;
  heightM?: number;
  palletCount?: number;
  palletType: PalletType;
  customPalletLm?: number;
};

export type LadmeterResult = {
  fromDimensions: number | null;
  fromPallets: number | null;
  recommended: number | null;
  volumeM3: number | null;
};

export function calculateLadmeter(input: LadmeterInputs): LadmeterResult {
  const length = input.lengthM;
  const width = input.widthM;
  const height = input.heightM;

  let fromDimensions: number | null = null;
  if (
    length !== undefined &&
    width !== undefined &&
    length > 0 &&
    width > 0
  ) {
    // Standard truck width reference ~ 2.4 m
    fromDimensions = length * (width / 2.4);
  }

  let fromPallets: number | null = null;
  if (input.palletCount !== undefined && input.palletCount > 0) {
    const perPallet =
      input.palletType === "custom"
        ? (input.customPalletLm ?? 0)
        : PALLET_LM[input.palletType];
    if (perPallet > 0) {
      fromPallets = input.palletCount * perPallet;
    }
  }

  const candidates = [fromDimensions, fromPallets].filter(
    (value): value is number => value !== null,
  );
  const recommended =
    candidates.length === 0 ? null : Math.max(...candidates);

  let volumeM3: number | null = null;
  if (
    length !== undefined &&
    width !== undefined &&
    height !== undefined &&
    length > 0 &&
    width > 0 &&
    height > 0
  ) {
    volumeM3 = length * width * height;
  }

  return { fromDimensions, fromPallets, recommended, volumeM3 };
}
