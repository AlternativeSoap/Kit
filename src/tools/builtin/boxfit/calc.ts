export type BoxDims = {
  w: number;
  h: number;
  d: number;
};

export type BoxFitResult = {
  fits: boolean;
  itemSorted: [number, number, number];
  boxSorted: [number, number, number];
  itemVol: number;
  boxVol: number;
  spareVol: number;
  fillRatio: number;
  leftover: [number, number, number];
  /** Best axis-aligned grid packing for identical copies. */
  maxCount: number;
  grid: { nx: number; ny: number; nz: number; orient: BoxDims };
  volumeCap: number;
};

export type PackItem = {
  id: string;
  name: string;
  dims: BoxDims;
  /** How many the user wants to pack. */
  want: number;
};

export type Placement = {
  itemId: string;
  name: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  colorIndex: number;
};

export type MixPackResult = {
  placements: Placement[];
  packedById: Record<string, number>;
  shortById: Record<string, number>;
  allFit: boolean;
  usedVol: number;
  boxVol: number;
  fillRatio: number;
};

type FreeBox = { x: number; y: number; z: number; w: number; h: number; d: number };

export function parseDim(raw: string): number | null {
  const n = Number(raw.trim().replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function parseCount(raw: string): number | null {
  const n = Number(raw.trim().replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

function orientations(item: BoxDims): BoxDims[] {
  const { w, h, d } = item;
  const raw = [
    { w, h, d },
    { w, d, h },
    { h, w, d },
    { h, d, w },
    { d, w, h },
    { d, h, w },
  ];
  const seen = new Set<string>();
  const out: BoxDims[] = [];
  for (const o of raw) {
    const key = `${o.w}x${o.h}x${o.d}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(o);
  }
  return out;
}

function fitsIn(item: BoxDims, box: BoxDims): boolean {
  return item.w <= box.w + 1e-9 && item.h <= box.h + 1e-9 && item.d <= box.d + 1e-9;
}

/** Max identical copies via axis-aligned grid, best orientation. */
export function maxGridFit(item: BoxDims, box: BoxDims): {
  count: number;
  nx: number;
  ny: number;
  nz: number;
  orient: BoxDims;
} {
  let best = {
    count: 0,
    nx: 0,
    ny: 0,
    nz: 0,
    orient: { w: item.w, h: item.h, d: item.d },
  };
  for (const o of orientations(item)) {
    if (!fitsIn(o, box)) continue;
    const nx = Math.floor(box.w / o.w + 1e-9);
    const ny = Math.floor(box.h / o.h + 1e-9);
    const nz = Math.floor(box.d / o.d + 1e-9);
    const count = nx * ny * nz;
    if (count > best.count) best = { count, nx, ny, nz, orient: o };
  }
  return best;
}

export function computeBoxFit(item: BoxDims, box: BoxDims): BoxFitResult {
  const itemSorted = [item.w, item.h, item.d].sort((a, b) => a - b) as [
    number,
    number,
    number,
  ];
  const boxSorted = [box.w, box.h, box.d].sort((a, b) => a - b) as [
    number,
    number,
    number,
  ];
  const fits =
    itemSorted[0]! <= boxSorted[0]! &&
    itemSorted[1]! <= boxSorted[1]! &&
    itemSorted[2]! <= boxSorted[2]!;
  const itemVol = item.w * item.h * item.d;
  const boxVol = box.w * box.h * box.d;
  const spareVol = Math.max(0, boxVol - itemVol);
  const fillRatio = boxVol > 0 ? Math.min(1, itemVol / boxVol) : 0;
  const leftover: [number, number, number] = [
    boxSorted[0]! - itemSorted[0]!,
    boxSorted[1]! - itemSorted[1]!,
    boxSorted[2]! - itemSorted[2]!,
  ];
  const grid = maxGridFit(item, box);
  const volumeCap = itemVol > 0 ? Math.floor(boxVol / itemVol + 1e-9) : 0;
  return {
    fits,
    itemSorted,
    boxSorted,
    itemVol,
    boxVol,
    spareVol,
    fillRatio,
    leftover,
    maxCount: grid.count,
    grid: {
      nx: grid.nx,
      ny: grid.ny,
      nz: grid.nz,
      orient: grid.orient,
    },
    volumeCap,
  };
}

function splitFree(space: FreeBox, placed: FreeBox): FreeBox[] {
  const out: FreeBox[] = [];
  const right = space.w - placed.w;
  const up = space.h - placed.h;
  const deep = space.d - placed.d;
  if (right > 1e-9) {
    out.push({
      x: space.x + placed.w,
      y: space.y,
      z: space.z,
      w: right,
      h: space.h,
      d: space.d,
    });
  }
  if (up > 1e-9) {
    out.push({
      x: space.x,
      y: space.y + placed.h,
      z: space.z,
      w: placed.w,
      h: up,
      d: space.d,
    });
  }
  if (deep > 1e-9) {
    out.push({
      x: space.x,
      y: space.y,
      z: space.z + placed.d,
      w: placed.w,
      h: placed.h,
      d: deep,
    });
  }
  return out;
}

function volumeOf(b: { w: number; h: number; d: number }) {
  return b.w * b.h * b.d;
}

/**
 * Greedy 3D pack of mixed items (axis-aligned, free-space split).
 * Tries orientations per piece. Not a globally optimal packer.
 */
export function packMixed(items: PackItem[], box: BoxDims): MixPackResult {
  const boxVol = volumeOf(box);
  const free: FreeBox[] = [{ x: 0, y: 0, z: 0, w: box.w, h: box.h, d: box.d }];
  const placements: Placement[] = [];
  const packedById: Record<string, number> = {};
  const shortById: Record<string, number> = {};
  const colorById = new Map<string, number>();

  type Unit = { item: PackItem; colorIndex: number };
  const units: Unit[] = [];
  let color = 0;
  for (const item of items) {
    if (!colorById.has(item.id)) colorById.set(item.id, color++);
    packedById[item.id] = 0;
    shortById[item.id] = 0;
    const want = Math.max(0, Math.floor(item.want));
    for (let i = 0; i < want; i++) {
      units.push({ item, colorIndex: colorById.get(item.id)! });
    }
  }

  units.sort(
    (a, b) => volumeOf(b.item.dims) - volumeOf(a.item.dims),
  );

  for (const unit of units) {
    let placed = false;
    free.sort((a, b) => volumeOf(a) - volumeOf(b));
    for (let fi = 0; fi < free.length; fi++) {
      const space = free[fi]!;
      let bestOrient: BoxDims | null = null;
      for (const o of orientations(unit.item.dims)) {
        if (fitsIn(o, space)) {
          bestOrient = o;
          break;
        }
      }
      if (!bestOrient) continue;
      const block: FreeBox = {
        x: space.x,
        y: space.y,
        z: space.z,
        w: bestOrient.w,
        h: bestOrient.h,
        d: bestOrient.d,
      };
      placements.push({
        itemId: unit.item.id,
        name: unit.item.name,
        x: block.x,
        y: block.y,
        z: block.z,
        w: block.w,
        h: block.h,
        d: block.d,
        colorIndex: unit.colorIndex,
      });
      packedById[unit.item.id] = (packedById[unit.item.id] ?? 0) + 1;
      const leftovers = splitFree(space, block);
      free.splice(fi, 1, ...leftovers);
      placed = true;
      break;
    }
    if (!placed) {
      shortById[unit.item.id] = (shortById[unit.item.id] ?? 0) + 1;
    }
  }

  const usedVol = placements.reduce(
    (s, p) => s + p.w * p.h * p.d,
    0,
  );
  const allFit = Object.values(shortById).every((n) => n === 0);

  return {
    placements,
    packedById,
    shortById,
    allFit,
    usedVol,
    boxVol,
    fillRatio: boxVol > 0 ? Math.min(1, usedVol / boxVol) : 0,
  };
}

export function formatDim(n: number, locale: "da" | "en"): string {
  return n.toLocaleString(locale === "da" ? "da-DK" : "en-US", {
    maximumFractionDigits: 2,
  });
}
