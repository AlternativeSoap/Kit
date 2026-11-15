export type TrailerPresetId = "trailer136" | "link" | "tractor" | "custom";

export type TrailerPreset = {
  lengthM: number;
  widthM: number;
  heightM: number;
  /** Typical EUR pallet places for this body. */
  eurPallets: number;
  /** Typical payload range in tons, for display only. */
  payloadTons: string;
};

/**
 * Typical Danish inner dimensions (not legal outer limits).
 * Width is often 2.45–2.48 m; we default to 2.45 m.
 */
export const TRAILER_PRESETS: Record<
  Exclude<TrailerPresetId, "custom">,
  TrailerPreset
> = {
  trailer136: {
    lengthM: 13.6,
    widthM: 2.45,
    heightM: 2.7,
    eurPallets: 33,
    payloadTons: "24–25",
  },
  link: {
    lengthM: 7.5,
    widthM: 2.45,
    heightM: 2.7,
    eurPallets: 18,
    payloadTons: "12–14",
  },
  tractor: {
    lengthM: 7.5,
    widthM: 2.45,
    heightM: 2.6,
    eurPallets: 18,
    payloadTons: "10–14",
  },
};

export type PalletPresetId = "eur" | "industri" | "custom";

export const PALLET_PRESETS: Record<
  Exclude<PalletPresetId, "custom">,
  { lengthM: number; widthM: number; heightM: number }
> = {
  eur: { lengthM: 1.2, widthM: 0.8, heightM: 1.8 },
  industri: { lengthM: 1.2, widthM: 1.0, heightM: 1.8 },
};
