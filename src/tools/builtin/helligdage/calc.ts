/** Danish public holidays (fixed + Easter-based). */

export type Holiday = {
  date: string; // YYYY-MM-DD
  nameDa: string;
  nameEn: string;
};

/** Anonymous Gregorian Easter Sunday for a year. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function danishHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);
  const fixed: Holiday[] = [
    { date: `${year}-01-01`, nameDa: "Nytårsdag", nameEn: "New Year's Day" },
    { date: `${year}-06-05`, nameDa: "Grundlovsdag", nameEn: "Constitution Day" },
    { date: `${year}-12-24`, nameDa: "Juleaftensdag", nameEn: "Christmas Eve" },
    { date: `${year}-12-25`, nameDa: "Juledag", nameEn: "Christmas Day" },
    { date: `${year}-12-26`, nameDa: "2. juledag", nameEn: "Second Day of Christmas" },
  ];
  const movable: Holiday[] = [
    {
      date: iso(addDays(easter, -3)),
      nameDa: "Skærtorsdag",
      nameEn: "Maundy Thursday",
    },
    {
      date: iso(addDays(easter, -2)),
      nameDa: "Langfredag",
      nameEn: "Good Friday",
    },
    {
      date: iso(easter),
      nameDa: "Påskedag",
      nameEn: "Easter Sunday",
    },
    {
      date: iso(addDays(easter, 1)),
      nameDa: "2. påskedag",
      nameEn: "Easter Monday",
    },
    {
      date: iso(addDays(easter, 26)),
      nameDa: "Store bededag",
      nameEn: "Great Prayer Day",
    },
    {
      date: iso(addDays(easter, 39)),
      nameDa: "Kristi himmelfartsdag",
      nameEn: "Ascension Day",
    },
    {
      date: iso(addDays(easter, 49)),
      nameDa: "Pinsedag",
      nameEn: "Whit Sunday",
    },
    {
      date: iso(addDays(easter, 50)),
      nameDa: "2. pinsedag",
      nameEn: "Whit Monday",
    },
  ];
  // Store bededag abolished from 2024 onward as a public holiday.
  const list =
    year >= 2024
      ? movable.filter((h) => h.nameEn !== "Great Prayer Day")
      : movable;
  return [...fixed, ...list].sort((a, b) => a.date.localeCompare(b.date));
}

export function nextHoliday(
  fromIsoDate: string,
  year = Number(fromIsoDate.slice(0, 4)),
): Holiday | null {
  const thisYear = danishHolidays(year);
  const upcoming = thisYear.find((h) => h.date >= fromIsoDate);
  if (upcoming) return upcoming;
  return danishHolidays(year + 1)[0] ?? null;
}

export type HolidayHit = Holiday & { year: number };

/** Match Danish holiday names across the current and next calendar year. */
export function searchHolidays(
  query: string,
  baseYear = new Date().getFullYear(),
  limit = 4,
): HolidayHit[] {
  const raw = query.trim().toLowerCase();
  if (!raw || raw.length < 3) return [];

  const yearInQuery = raw.match(/\b(19|20)\d{2}\b/);
  const year = yearInQuery ? Number(yearInQuery[0]) : baseYear;
  const needle = raw.replace(/\b(19|20)\d{2}\b/g, "").trim();
  // Need a real holiday name fragment. Year alone is not enough.
  if (needle.length < 3) return [];

  const years = yearInQuery ? [year] : [baseYear, baseYear + 1];
  const scored: { hit: HolidayHit; score: number }[] = [];

  for (const y of years) {
    if (y < 1970 || y > 2100) continue;
    for (const h of danishHolidays(y)) {
      const da = h.nameDa.toLowerCase();
      const en = h.nameEn.toLowerCase();
      let score = -1;
      if (da === needle || en === needle) score = 100;
      else if (da.startsWith(needle) || en.startsWith(needle)) score = 90;
      else if (da.includes(needle) || en.includes(needle)) score = 70;
      if (score >= 0) {
        scored.push({ hit: { ...h, year: y }, score });
      }
    }
  }

  scored.sort(
    (a, b) =>
      b.score - a.score || a.hit.date.localeCompare(b.hit.date),
  );
  return scored.slice(0, limit).map((s) => s.hit);
}
