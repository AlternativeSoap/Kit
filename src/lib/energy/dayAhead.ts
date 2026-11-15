export type PriceArea = "DK1" | "DK2";

export type HourPrice = {
  /** Local Danish hour start as ISO-like `YYYY-MM-DDTHH:00:00`. */
  hourDk: string;
  /** Spot price in kr/kWh (from DayAheadPriceDKK / 1000). */
  krPerKwh: number;
};

export type DayAheadSnapshot = {
  area: PriceArea;
  fetchedAt: string;
  current: HourPrice | null;
  past: HourPrice[];
  upcoming: HourPrice[];
  source: "Energi Data Service";
};

type ApiRecord = {
  TimeDK?: string;
  DayAheadPriceDKK?: number | null;
};

type ApiResponse = {
  records?: ApiRecord[];
};

function hourKeyFromTimeDk(timeDk: string): string | null {
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2})/.exec(timeDk);
  if (!match) return null;
  return `${match[1]}:00:00`;
}

/** Aggregate 15-minute Day-Ahead rows into hourly averages (kr/kWh). */
export function aggregateHourlyPrices(records: ApiRecord[]): HourPrice[] {
  const buckets = new Map<string, { sum: number; count: number }>();

  for (const record of records) {
    const timeDk = record.TimeDK;
    const priceMwh = record.DayAheadPriceDKK;
    if (!timeDk || priceMwh === null || priceMwh === undefined) continue;
    if (!Number.isFinite(priceMwh)) continue;
    const key = hourKeyFromTimeDk(timeDk);
    if (!key) continue;
    const bucket = buckets.get(key) ?? { sum: 0, count: 0 };
    bucket.sum += priceMwh / 1000;
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .map(([hourDk, bucket]) => ({
      hourDk,
      krPerKwh: Math.round((bucket.sum / bucket.count) * 10000) / 10000,
    }))
    .sort((a, b) => a.hourDk.localeCompare(b.hourDk));
}

export function splitAroundNow(
  hours: HourPrice[],
  now = new Date(),
): Pick<DayAheadSnapshot, "current" | "past" | "upcoming"> {
  const pad = (n: number) => String(n).padStart(2, "0");
  // Approximate Danish local hour key using Europe/Copenhagen via locale parts.
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Copenhagen",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  const nowKey = `${get("year")}-${get("month")}-${get("day")}T${pad(Number(get("hour")))}:00:00`;

  let current: HourPrice | null = null;
  const past: HourPrice[] = [];
  const upcoming: HourPrice[] = [];

  for (const hour of hours) {
    if (hour.hourDk === nowKey) {
      current = hour;
    } else if (hour.hourDk < nowKey) {
      past.push(hour);
    } else {
      upcoming.push(hour);
    }
  }

  return {
    current,
    past: past.slice(-12),
    upcoming: upcoming.slice(0, 24),
  };
}

export function buildDayAheadUrl(area: PriceArea): string {
  const filter = encodeURIComponent(JSON.stringify({ PriceArea: [area] }));
  // Yesterday start through day after tomorrow for history + published day-ahead.
  return (
    "https://api.energidataservice.dk/dataset/DayAheadPrices" +
    `?start=StartOfDay&startOffset=-P1D&end=StartOfDay&endOffset=P3D` +
    `&filter=${filter}&sort=TimeDK%20ASC` +
    `&columns=TimeDK,DayAheadPriceDKK`
  );
}

const CACHE_TTL_MS = 15 * 60 * 1000;
const snapshotCache = new Map<
  PriceArea,
  { expiresAt: number; snapshot: DayAheadSnapshot }
>();

export async function fetchDayAheadSnapshot(
  area: PriceArea,
  fetchImpl: typeof fetch = fetch,
): Promise<DayAheadSnapshot> {
  const cached = snapshotCache.get(area);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.snapshot;
  }

  const response = await fetchImpl(buildDayAheadUrl(area), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Day-ahead fetch failed (${response.status})`);
  }
  const json = (await response.json()) as ApiResponse;
  const hours = aggregateHourlyPrices(json.records ?? []);
  const split = splitAroundNow(hours);
  const snapshot: DayAheadSnapshot = {
    area,
    fetchedAt: new Date().toISOString(),
    source: "Energi Data Service",
    ...split,
  };
  snapshotCache.set(area, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    snapshot,
  });
  return snapshot;
}
