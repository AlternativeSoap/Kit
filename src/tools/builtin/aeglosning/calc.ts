export type CycleInput = {
  /** Last menstrual period start as YYYY-MM-DD. */
  lmpIso: string;
  /** Average cycle length in days. */
  cycleLength: number;
  /** Luteal phase length in days. */
  lutealLength: number;
};

export type CycleKeyDate = {
  iso: string;
  kind: "period" | "fertile_start" | "ovulation" | "fertile_end" | "next_period";
};

export type CycleResult = {
  ovulation: Date;
  fertileStart: Date;
  fertileEnd: Date;
  nextPeriod: Date;
  /** Key dates spanning roughly two cycles from LMP. */
  calendar: CycleKeyDate[];
};

function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== mo - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Estimate ovulation and fertile window from LMP, cycle length, and luteal length.
 * Ovulation ≈ cycleLength − lutealLength days after period start.
 * Fertile window ≈ ovulation − 5 through ovulation + 1.
 */
export function calculateCycle(input: CycleInput): CycleResult | null {
  const lmp = parseIsoDate(input.lmpIso);
  if (!lmp) return null;

  const cycle = input.cycleLength;
  const luteal = input.lutealLength;
  if (!Number.isInteger(cycle) || cycle < 20 || cycle > 45) return null;
  if (!Number.isInteger(luteal) || luteal < 10 || luteal > 16) return null;
  if (luteal >= cycle) return null;

  const ovulationOffset = cycle - luteal;
  const ovulation = addDays(lmp, ovulationOffset);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);
  const nextPeriod = addDays(lmp, cycle);

  const calendar: CycleKeyDate[] = [];

  for (let cycleIndex = 0; cycleIndex < 2; cycleIndex++) {
    const periodStart = addDays(lmp, cycleIndex * cycle);
    const ovu = addDays(periodStart, ovulationOffset);
    const fStart = addDays(ovu, -5);
    const fEnd = addDays(ovu, 1);
    const followingPeriod = addDays(periodStart, cycle);

    calendar.push({ iso: toIso(periodStart), kind: "period" });
    calendar.push({ iso: toIso(fStart), kind: "fertile_start" });
    calendar.push({ iso: toIso(ovu), kind: "ovulation" });
    calendar.push({ iso: toIso(fEnd), kind: "fertile_end" });
    if (cycleIndex === 1) {
      calendar.push({ iso: toIso(followingPeriod), kind: "next_period" });
    }
  }

  calendar.sort((a, b) => a.iso.localeCompare(b.iso));

  return {
    ovulation,
    fertileStart,
    fertileEnd,
    nextPeriod,
    calendar,
  };
}

export function formatCycleDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Parse YYYY-MM-DD to a local Date for display (avoids UTC shift). */
export function dateFromIso(iso: string): Date | null {
  return parseIsoDate(iso);
}
