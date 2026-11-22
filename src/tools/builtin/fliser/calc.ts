export type TileInput = {
  roomLengthM: number;
  roomWidthM: number;
  tileLengthCm: number;
  tileWidthCm: number;
  gapMm: number;
  wastePercent: number;
  tilesPerBox: number | null;
};

export type TileResult = {
  roomAreaM2: number;
  tileAreaM2: number;
  tilesExact: number;
  tilesNeeded: number;
  boxesNeeded: number | null;
};

export function calculateTiles(input: TileInput): TileResult | null {
  const {
    roomLengthM,
    roomWidthM,
    tileLengthCm,
    tileWidthCm,
    gapMm,
    wastePercent,
    tilesPerBox,
  } = input;

  if (
    ![
      roomLengthM,
      roomWidthM,
      tileLengthCm,
      tileWidthCm,
      gapMm,
      wastePercent,
    ].every(Number.isFinite)
  ) {
    return null;
  }
  if (roomLengthM <= 0 || roomWidthM <= 0) return null;
  if (tileLengthCm <= 0 || tileWidthCm <= 0) return null;
  if (gapMm < 0 || wastePercent < 0) return null;
  if (tilesPerBox !== null && (!Number.isFinite(tilesPerBox) || tilesPerBox <= 0)) {
    return null;
  }

  const roomAreaM2 = roomLengthM * roomWidthM;
  const tileLengthM = tileLengthCm / 100 + gapMm / 1000;
  const tileWidthM = tileWidthCm / 100 + gapMm / 1000;
  const tileAreaM2 = tileLengthM * tileWidthM;
  if (tileAreaM2 <= 0) return null;

  const tilesExact = roomAreaM2 / tileAreaM2;
  const withWaste = tilesExact * (1 + wastePercent / 100);
  const tilesNeeded = Math.ceil(withWaste);
  const boxesNeeded =
    tilesPerBox && tilesPerBox > 0
      ? Math.ceil(tilesNeeded / tilesPerBox)
      : null;

  return {
    roomAreaM2,
    tileAreaM2,
    tilesExact,
    tilesNeeded,
    boxesNeeded,
  };
}
