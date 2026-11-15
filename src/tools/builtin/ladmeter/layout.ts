export type Trailer = {
  lengthM: number;
  widthM: number;
  heightM: number;
};

export type LoadLine = {
  id: string;
  label: string;
  lengthM: number;
  widthM: number;
  heightM: number;
  quantity: number;
  autoRotate: boolean;
};

export type Placement = {
  lineId: string;
  label: string;
  sequence: number;
  x: number;
  y: number;
  widthM: number;
  lengthM: number;
  rotated: boolean;
  tooTall: boolean;
};

export type WasteRect = {
  x: number;
  y: number;
  widthM: number;
  lengthM: number;
};

export type OverflowReason = "no_floor_space" | "too_wide";

export type OverflowItem = {
  lineId: string;
  label: string;
  /** 1-based index within that line's quantity. */
  pieceIndex: number;
  reason: OverflowReason;
};

export type OverflowSummary = {
  lineId: string;
  label: string;
  count: number;
  reason: OverflowReason;
};

export type LayoutResult = {
  placements: Placement[];
  waste: WasteRect[];
  usedLengthM: number;
  usedAreaM2: number;
  wasteAreaM2: number;
  trailerAreaM2: number;
  remainingLengthM: number;
  /** Used floor length in meters (shown as ldm for a standard trailer floor). */
  usedLdm: number;
  overflowCount: number;
  overflowItems: OverflowItem[];
  overflowSummary: OverflowSummary[];
  placedCount: number;
};

type Lane = {
  y: number;
  depth: number;
  xCursor: number;
};

type Candidate = {
  x: number;
  y: number;
  widthM: number;
  lengthM: number;
  rotated: boolean;
  nextLane: Lane;
  isNewLane: boolean;
  usedLengthAfter: number;
  remainingLaneWidth: number;
  wasteInLane: number;
};

const EPS = 1e-9;

function orientations(
  lengthM: number,
  widthM: number,
  autoRotate: boolean,
): Array<{ lengthM: number; widthM: number; rotated: boolean }> {
  const base = { lengthM, widthM, rotated: false };
  if (!autoRotate || Math.abs(lengthM - widthM) < EPS) return [base];
  return [base, { lengthM: widthM, widthM: lengthM, rotated: true }];
}

function scoreBetter(a: Candidate, b: Candidate): boolean {
  if (a.usedLengthAfter !== b.usedLengthAfter) {
    return a.usedLengthAfter < b.usedLengthAfter;
  }
  if (a.wasteInLane !== b.wasteInLane) {
    return a.wasteInLane < b.wasteInLane;
  }
  if (a.remainingLaneWidth !== b.remainingLaneWidth) {
    return a.remainingLaneWidth > b.remainingLaneWidth;
  }
  if (a.rotated !== b.rotated) return !a.rotated;
  return false;
}

function candidateInLane(
  trailer: Trailer,
  lane: Lane,
  widthM: number,
  lengthM: number,
  rotated: boolean,
  isNewLane: boolean,
): Candidate | null {
  if (widthM > trailer.widthM + EPS) return null;
  if (lane.xCursor + widthM > trailer.widthM + EPS) return null;

  const newDepth = Math.max(lane.depth, lengthM);
  if (lane.y + newDepth > trailer.lengthM + EPS) return null;

  const remainingLaneWidth = trailer.widthM - (lane.xCursor + widthM);

  return {
    x: lane.xCursor,
    y: lane.y,
    widthM,
    lengthM,
    rotated,
    nextLane: {
      y: lane.y,
      depth: newDepth,
      xCursor: lane.xCursor + widthM,
    },
    isNewLane,
    usedLengthAfter: lane.y + newDepth,
    remainingLaneWidth,
    wasteInLane: Math.max(0, remainingLaneWidth) * newDepth,
  };
}

/**
 * Sequential floor layout along the trailer length.
 * y = 0 is the front (nose). Pieces are placed in list order from front
 * toward the rear door, filling across width in lanes. Residual width that
 * the next piece cannot use is waste for that lane.
 */
export function layoutLoad(
  trailer: Trailer,
  lines: LoadLine[],
): LayoutResult {
  const placements: Placement[] = [];
  const waste: WasteRect[] = [];

  let lane: Lane | null = null;
  let sequence = 0;
  const overflowItems: OverflowItem[] = [];

  const closeLane = (current: Lane) => {
    const leftover = trailer.widthM - current.xCursor;
    if (leftover > EPS && current.depth > EPS) {
      waste.push({
        x: current.xCursor,
        y: current.y,
        widthM: leftover,
        lengthM: current.depth,
      });
    }
  };

  for (const line of lines) {
    const qty = Math.max(0, Math.floor(line.quantity));
    for (let i = 0; i < qty; i += 1) {
      const opts = orientations(line.lengthM, line.widthM, line.autoRotate);
      let best: Candidate | null = null;

      for (const opt of opts) {
        if (lane) {
          const beside = candidateInLane(
            trailer,
            lane,
            opt.widthM,
            opt.lengthM,
            opt.rotated,
            false,
          );
          if (beside && (!best || scoreBetter(beside, best))) best = beside;
        }

        const nextY = lane ? lane.y + lane.depth : 0;
        const freshLane: Lane = { y: nextY, depth: 0, xCursor: 0 };
        const fresh = candidateInLane(
          trailer,
          freshLane,
          opt.widthM,
          opt.lengthM,
          opt.rotated,
          true,
        );
        if (fresh && (!best || scoreBetter(fresh, best))) best = fresh;
      }

      if (!best) {
        const tooWide = opts.every((opt) => opt.widthM > trailer.widthM + EPS);
        overflowItems.push({
          lineId: line.id,
          label: line.label,
          pieceIndex: i + 1,
          reason: tooWide ? "too_wide" : "no_floor_space",
        });
        continue;
      }

      if (best.isNewLane && lane) {
        closeLane(lane);
      }

      sequence += 1;
      placements.push({
        lineId: line.id,
        label: line.label,
        sequence,
        x: best.x,
        y: best.y,
        widthM: best.widthM,
        lengthM: best.lengthM,
        rotated: best.rotated,
        tooTall:
          line.heightM > 0 && trailer.heightM > 0
            ? line.heightM > trailer.heightM + EPS
            : false,
      });

      lane = best.nextLane;
    }
  }

  if (lane) closeLane(lane);

  const usedLengthM = placements.reduce(
    (max, p) => Math.max(max, p.y + p.lengthM),
    0,
  );
  const usedAreaM2 = placements.reduce(
    (sum, p) => sum + p.widthM * p.lengthM,
    0,
  );
  const wasteAreaM2 = waste.reduce(
    (sum, rect) => sum + rect.widthM * rect.lengthM,
    0,
  );

  const overflowSummary = summarizeOverflow(overflowItems);

  return {
    placements,
    waste,
    usedLengthM,
    usedAreaM2,
    wasteAreaM2,
    trailerAreaM2: trailer.lengthM * trailer.widthM,
    remainingLengthM: Math.max(0, trailer.lengthM - usedLengthM),
    usedLdm: usedLengthM,
    overflowCount: overflowItems.length,
    overflowItems,
    overflowSummary,
    placedCount: placements.length,
  };
}

function summarizeOverflow(items: OverflowItem[]): OverflowSummary[] {
  const map = new Map<string, OverflowSummary>();
  for (const item of items) {
    const key = `${item.lineId}:${item.reason}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, {
        lineId: item.lineId,
        label: item.label,
        count: 1,
        reason: item.reason,
      });
    }
  }
  return Array.from(map.values());
}

/** How many pieces from each line were placed successfully. */
export function placedCountByLine(result: LayoutResult): Map<string, number> {
  const counts = new Map<string, number>();
  for (const placement of result.placements) {
    counts.set(
      placement.lineId,
      (counts.get(placement.lineId) ?? 0) + 1,
    );
  }
  return counts;
}
