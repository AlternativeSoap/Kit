export type FlytMode = "rooms" | "items";

export type FlyttekasserInput = {
  mode: FlytMode;
  /** Number of rooms (bedrooms + living spaces). Used in rooms mode. */
  rooms: number;
  books: number;
  clothes: number;
  kitchen: number;
  misc: number;
  /** Share of boxes that should be small (0–1). */
  smallShare: number;
  /** Share of boxes that should be medium (0–1). */
  mediumShare: number;
  /** Share of boxes that should be large (0–1). Remainder goes to large if shares sum < 1. */
  largeShare: number;
};

export type FlyttekasserResult = {
  mode: FlytMode;
  totalBoxes: number;
  small: number;
  medium: number;
  large: number;
  /** Estimated rolls of packing tape. */
  tapeRolls: number;
  /** Estimated packs of packing paper / tissue. */
  paperPacks: number;
  /** Estimated rolls of bubble wrap. */
  bubbleRolls: number;
};

/** Rough boxes per room when using room count. */
const BOXES_PER_ROOM = 8;

/** Item-to-box factors. */
const BOOKS_PER_SMALL = 25;
const CLOTHES_PER_MEDIUM = 15;
const KITCHEN_PER_MEDIUM = 12;
const MISC_PER_LARGE = 8;

function splitBoxes(
  total: number,
  smallShare: number,
  mediumShare: number,
  largeShare: number,
): { small: number; medium: number; large: number } {
  const sum = smallShare + mediumShare + largeShare;
  const s = sum > 0 ? smallShare / sum : 0.25;
  const m = sum > 0 ? mediumShare / sum : 0.5;
  let small = Math.round(total * s);
  let medium = Math.round(total * m);
  let large = total - small - medium;
  if (large < 0) {
    medium = Math.max(0, medium + large);
    large = 0;
    if (small + medium > total) {
      small = Math.max(0, total - medium);
      medium = total - small;
    }
  }
  return { small, medium, large };
}

export function estimateMovingBoxes(
  input: FlyttekasserInput,
): FlyttekasserResult | null {
  const {
    mode,
    rooms,
    books,
    clothes,
    kitchen,
    misc,
    smallShare,
    mediumShare,
    largeShare,
  } = input;

  if (
    ![rooms, books, clothes, kitchen, misc, smallShare, mediumShare, largeShare].every(
      Number.isFinite,
    )
  ) {
    return null;
  }
  if (
    rooms < 0 ||
    books < 0 ||
    clothes < 0 ||
    kitchen < 0 ||
    misc < 0
  ) {
    return null;
  }
  if (smallShare < 0 || mediumShare < 0 || largeShare < 0) return null;

  let totalBoxes: number;
  if (mode === "rooms") {
    if (rooms <= 0) return null;
    totalBoxes = Math.ceil(rooms * BOXES_PER_ROOM);
  } else {
    const fromBooks = Math.ceil(books / BOOKS_PER_SMALL);
    const fromClothes = Math.ceil(clothes / CLOTHES_PER_MEDIUM);
    const fromKitchen = Math.ceil(kitchen / KITCHEN_PER_MEDIUM);
    const fromMisc = Math.ceil(misc / MISC_PER_LARGE);
    totalBoxes = fromBooks + fromClothes + fromKitchen + fromMisc;
    if (totalBoxes <= 0) return null;
  }

  const { small, medium, large } = splitBoxes(
    totalBoxes,
    smallShare,
    mediumShare,
    largeShare,
  );

  const tapeRolls = Math.max(1, Math.ceil(totalBoxes / 15));
  const paperPacks = Math.max(1, Math.ceil(totalBoxes / 10));
  const bubbleRolls =
    mode === "rooms"
      ? Math.max(1, Math.ceil(rooms / 2))
      : Math.max(1, Math.ceil((kitchen + misc) / 20));

  return {
    mode,
    totalBoxes,
    small,
    medium,
    large,
    tapeRolls,
    paperPacks,
    bubbleRolls,
  };
}
