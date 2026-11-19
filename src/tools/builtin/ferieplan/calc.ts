/** Danish public holidays (fixed + Easter-based). Copied for ferieplan use. */

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

export function parseIso(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function isoFromUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDaysIso(date: string, days: number): string {
  return isoFromUtc(addDays(parseIso(date), days));
}

/** Monday = 1 … Sunday = 7 (ISO). */
export function weekdayIso(date: string): number {
  const day = parseIso(date).getUTCDay();
  return day === 0 ? 7 : day;
}

export function isWeekend(date: string): boolean {
  const w = weekdayIso(date);
  return w === 6 || w === 7;
}

export type BridgeSpan = {
  id: string;
  start: string;
  end: string;
  holidayDates: string[];
  vacationNeeded: string[];
  weekdaysUsed: number;
  labelDa: string;
  labelEn: string;
};

/**
 * Suggest bridge-day spans: adjacent weekdays that, with holidays + weekends,
 * create a longer free stretch for a small number of vacation days.
 */
export function suggestBridgeSpans(
  year: number,
  holidays: Holiday[],
): BridgeSpan[] {
  const holidaySet = new Set(holidays.map((h) => h.date));
  const spans: BridgeSpan[] = [];

  for (const h of holidays) {
    const w = weekdayIso(h.date);

    // Friday holiday: take Thursday → long weekend Thu–Sun
    if (w === 5) {
      const thu = addDaysIso(h.date, -1);
      if (!holidaySet.has(thu) && !isWeekend(thu)) {
        spans.push({
          id: `fri-${h.date}`,
          start: thu,
          end: addDaysIso(h.date, 2),
          holidayDates: [h.date],
          vacationNeeded: [thu],
          weekdaysUsed: 1,
          labelDa: `${h.nameDa}: tag torsdag fri`,
          labelEn: `${h.nameEn}: take Thursday off`,
        });
      }
    }

    // Monday holiday: take Friday before → Fri–Mon
    if (w === 1) {
      const fri = addDaysIso(h.date, -3);
      if (!holidaySet.has(fri) && weekdayIso(fri) === 5) {
        spans.push({
          id: `mon-${h.date}`,
          start: fri,
          end: h.date,
          holidayDates: [h.date],
          vacationNeeded: [fri],
          weekdaysUsed: 1,
          labelDa: `${h.nameDa}: tag fredag fri`,
          labelEn: `${h.nameEn}: take Friday off`,
        });
      }
    }

    // Thursday holiday (Ascension, Maundy Thursday): take Friday → Thu–Sun
    if (w === 4) {
      const fri = addDaysIso(h.date, 1);
      if (!holidaySet.has(fri) && !isWeekend(fri)) {
        spans.push({
          id: `thu-${h.date}`,
          start: h.date,
          end: addDaysIso(h.date, 3),
          holidayDates: [h.date],
          vacationNeeded: [fri],
          weekdaysUsed: 1,
          labelDa: `${h.nameDa}: tag fredag fri`,
          labelEn: `${h.nameEn}: take Friday off`,
        });
      }
    }
  }

  // Easter cluster: Maundy Thursday through Easter Monday often forms a natural block
  const maundy = holidays.find((h) => h.nameEn === "Maundy Thursday");
  const easterMon = holidays.find((h) => h.nameEn === "Easter Monday");
  if (maundy && easterMon) {
    spans.push({
      id: `easter-${year}`,
      start: maundy.date,
      end: easterMon.date,
      holidayDates: holidays
        .filter((h) => h.date >= maundy.date && h.date <= easterMon.date)
        .map((h) => h.date),
      vacationNeeded: [],
      weekdaysUsed: 0,
      labelDa: "Påskeuge: helligdage dækker allerede blokken",
      labelEn: "Easter week: holidays already cover the block",
    });
  }

  // Deduplicate by id and sort by start
  const seen = new Set<string>();
  return spans
    .filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function countWeekdays(dates: string[]): number {
  return dates.filter((d) => !isWeekend(d)).length;
}

export function eachDay(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addDaysIso(cur, 1);
  }
  return out;
}
