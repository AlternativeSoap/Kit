export type HoldingMode = "perUnit" | "percent";

export type EoqInput = {
  /** Annual demand D. */
  demand: number;
  /** Order / setup cost S per order. */
  orderCost: number;
  holdingMode: HoldingMode;
  /** Holding cost H per unit per year (when holdingMode = perUnit). */
  holdingCost?: number;
  /** Holding cost as % of unit cost (when holdingMode = percent). */
  holdingPercent?: number;
  /** Unit cost C (needed when holdingMode = percent). */
  unitCost?: number;
};

export type EoqCostPoint = {
  /** Order quantity Q. */
  q: number;
  /** Multiple of EOQ (0.5, 0.75, …). */
  multiple: number;
  orderCostAnnual: number;
  holdingCostAnnual: number;
  totalCost: number;
};

export type EoqResult = {
  /** Exact EOQ = √(2DS/H). */
  eoqExact: number;
  /** Rounded EOQ (nearest whole unit, at least 1). */
  eoqRounded: number;
  holdingCostH: number;
  ordersPerYear: number;
  daysBetweenOrders: number;
  avgInventory: number;
  annualOrderCost: number;
  annualHoldingCost: number;
  totalCost: number;
  curve: EoqCostPoint[];
};

const CURVE_MULTIPLES = [0.5, 0.75, 1, 1.25, 1.5] as const;

function costsAtQ(D: number, S: number, H: number, Q: number) {
  const orderCostAnnual = (D / Q) * S;
  const holdingCostAnnual = (Q / 2) * H;
  return {
    orderCostAnnual,
    holdingCostAnnual,
    totalCost: orderCostAnnual + holdingCostAnnual,
  };
}

/** Wilson EOQ: Q* = √(2DS/H). */
export function calculateEoq(input: EoqInput): EoqResult | null {
  const { demand: D, orderCost: S, holdingMode } = input;
  if (!(D > 0) || !(S > 0)) return null;

  let H: number;
  if (holdingMode === "percent") {
    const pct = input.holdingPercent;
    const C = input.unitCost;
    if (pct === undefined || C === undefined) return null;
    if (!(pct > 0) || !(C > 0)) return null;
    H = C * (pct / 100);
  } else {
    H = input.holdingCost ?? NaN;
    if (!(H > 0)) return null;
  }

  const eoqExact = Math.sqrt((2 * D * S) / H);
  if (!Number.isFinite(eoqExact) || !(eoqExact > 0)) return null;

  const eoqRounded = Math.max(1, Math.round(eoqExact));
  const Q = eoqExact;
  const atOpt = costsAtQ(D, S, H, Q);
  const ordersPerYear = D / Q;
  const daysBetweenOrders = 365 / ordersPerYear;
  const avgInventory = Q / 2;

  const curve: EoqCostPoint[] = CURVE_MULTIPLES.map((multiple) => {
    const q = eoqExact * multiple;
    const c = costsAtQ(D, S, H, q);
    return {
      q,
      multiple,
      orderCostAnnual: c.orderCostAnnual,
      holdingCostAnnual: c.holdingCostAnnual,
      totalCost: c.totalCost,
    };
  });

  return {
    eoqExact,
    eoqRounded,
    holdingCostH: H,
    ordersPerYear,
    daysBetweenOrders,
    avgInventory,
    annualOrderCost: atOpt.orderCostAnnual,
    annualHoldingCost: atOpt.holdingCostAnnual,
    totalCost: atOpt.totalCost,
    curve,
  };
}
