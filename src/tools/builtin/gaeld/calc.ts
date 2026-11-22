export type Debt = {
  id: string;
  name: string;
  balance: number;
  /** Annual percentage rate. */
  apr: number;
  minPayment: number;
};

export type PayoffStrategy = "snowball" | "avalanche";

export type MonthStep = {
  month: number;
  /** Remaining balances after this month's payments. */
  remainingTotal: number;
  /** Interest paid this month. */
  interestPaid: number;
  /** Principal paid this month. */
  principalPaid: number;
  /** Debt names paid off this month (if any). */
  paidOff: string[];
};

export type PayoffResult = {
  strategy: PayoffStrategy;
  months: number;
  totalInterest: number;
  totalPaid: number;
  order: string[];
  schedule: MonthStep[];
};

const MAX_MONTHS = 600;

function sortDebts(debts: Debt[], strategy: PayoffStrategy): Debt[] {
  const copy = debts.map((d) => ({ ...d }));
  if (strategy === "snowball") {
    copy.sort((a, b) => a.balance - b.balance || a.apr - b.apr);
  } else {
    copy.sort((a, b) => b.apr - a.apr || a.balance - b.balance);
  }
  return copy;
}

/**
 * Simulate month-by-month debt payoff with minimums plus extra payment
 * applied to the current target debt (snowball or avalanche order).
 */
export function planPayoff(
  debts: Debt[],
  strategy: PayoffStrategy,
  extraMonthly: number,
): PayoffResult | null {
  const valid = debts.filter(
    (d) =>
      d.balance > 0 &&
      Number.isFinite(d.balance) &&
      Number.isFinite(d.apr) &&
      d.apr >= 0 &&
      Number.isFinite(d.minPayment) &&
      d.minPayment >= 0,
  );
  if (valid.length === 0) return null;
  if (!Number.isFinite(extraMonthly) || extraMonthly < 0) return null;

  const working = sortDebts(valid, strategy).map((d) => ({
    ...d,
    balance: d.balance,
  }));
  const order: string[] = [];
  const schedule: MonthStep[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  let stalledMonths = 0;

  while (working.some((d) => d.balance > 0.005) && month < MAX_MONTHS) {
    month += 1;
    let interestPaid = 0;
    let principalPaid = 0;
    const paidOff: string[] = [];
    const before = working.reduce(
      (sum, d) => sum + Math.max(0, d.balance),
      0,
    );

    // Accrue interest
    for (const debt of working) {
      if (debt.balance <= 0) continue;
      const interest = (debt.balance * debt.apr) / 100 / 12;
      debt.balance += interest;
      interestPaid += interest;
      totalInterest += interest;
    }

    // Pay minimums
    let leftover = 0;
    for (const debt of working) {
      if (debt.balance <= 0) continue;
      const pay = Math.min(debt.minPayment, debt.balance);
      debt.balance -= pay;
      principalPaid += pay;
      totalPaid += pay;
      if (debt.minPayment > pay) {
        leftover += debt.minPayment - pay;
      }
      if (debt.balance < 0.005) {
        debt.balance = 0;
        paidOff.push(debt.name);
        order.push(debt.name);
      }
    }

    // Extra + freed minimums go to the first open debt in strategy order
    let extraPool = extraMonthly + leftover;
    for (const debt of working) {
      if (extraPool <= 0) break;
      if (debt.balance <= 0) continue;
      const pay = Math.min(extraPool, debt.balance);
      debt.balance -= pay;
      principalPaid += pay;
      totalPaid += pay;
      extraPool -= pay;
      if (debt.balance < 0.005) {
        debt.balance = 0;
        if (!paidOff.includes(debt.name)) {
          paidOff.push(debt.name);
          order.push(debt.name);
        }
      }
    }

    const remainingTotal = working.reduce(
      (sum, d) => sum + Math.max(0, d.balance),
      0,
    );

    schedule.push({
      month,
      remainingTotal,
      interestPaid,
      principalPaid,
      paidOff,
    });

    // Bail if payments cannot reduce balances (interest outruns payments)
    if (remainingTotal >= before - 0.01 && paidOff.length === 0) {
      stalledMonths += 1;
      if (stalledMonths >= 2) return null;
    } else {
      stalledMonths = 0;
    }
  }

  if (working.some((d) => d.balance > 0.005)) return null;

  return {
    strategy,
    months: month,
    totalInterest,
    totalPaid,
    order,
    schedule,
  };
}
