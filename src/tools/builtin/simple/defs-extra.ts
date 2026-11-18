/** Extra popular utilities appended into SIMPLE_TOOL_DEFS. */
import type { SimpleResultRow, SimpleToolDef } from "./defs";

function num(v: string | undefined): number | undefined {
  if (v === undefined || !v.trim()) return undefined;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function round(n: number, d = 4): string {
  const f = 10 ** d;
  return String(Math.round(n * f) / f);
}

function money(labelEn: string, labelDa: string, value: string): SimpleResultRow {
  return { labelEn, labelDa, value, numeric: true };
}

const MORSE: Record<string, string> = {
  a: ".-",
  b: "-...",
  c: "-.-.",
  d: "-..",
  e: ".",
  f: "..-.",
  g: "--.",
  h: "....",
  i: "..",
  j: ".---",
  k: "-.-",
  l: ".-..",
  m: "--",
  n: "-.",
  o: "---",
  p: ".--.",
  q: "--.-",
  r: ".-.",
  s: "...",
  t: "-",
  u: "..-",
  v: "...-",
  w: ".--",
  x: "-..-",
  y: "-.--",
  z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "!": "-.-.--",
  " ": "/",
};

const MORSE_REV = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k]),
);

const NATO: Record<string, string> = {
  a: "Alfa",
  b: "Bravo",
  c: "Charlie",
  d: "Delta",
  e: "Echo",
  f: "Foxtrot",
  g: "Golf",
  h: "Hotel",
  i: "India",
  j: "Juliett",
  k: "Kilo",
  l: "Lima",
  m: "Mike",
  n: "November",
  o: "Oscar",
  p: "Papa",
  q: "Quebec",
  r: "Romeo",
  s: "Sierra",
  t: "Tango",
  u: "Uniform",
  v: "Victor",
  w: "Whiskey",
  x: "X-ray",
  y: "Yankee",
  z: "Zulu",
  "0": "Zero",
  "1": "One",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
};

/** Basic Braille patterns for a–z and 0–9 (Unicode Braille). */
const BRAILLE: Record<string, string> = {
  a: "⠁",
  b: "⠃",
  c: "⠉",
  d: "⠙",
  e: "⠑",
  f: "⠋",
  g: "⠛",
  h: "⠓",
  i: "⠊",
  j: "⠚",
  k: "⠅",
  l: "⠇",
  m: "⠍",
  n: "⠝",
  o: "⠕",
  p: "⠏",
  q: "⠟",
  r: "⠗",
  s: "⠎",
  t: "⠞",
  u: "⠥",
  v: "⠧",
  w: "⠺",
  x: "⠭",
  y: "⠽",
  z: "⠵",
  "1": "⠁",
  "2": "⠃",
  "3": "⠉",
  "4": "⠙",
  "5": "⠑",
  "6": "⠋",
  "7": "⠛",
  "8": "⠓",
  "9": "⠊",
  "0": "⠚",
  " ": "⠀",
};

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function cvrValid(digits: string): boolean {
  if (!/^\d{8}$/.test(digits)) return false;
  const w = [2, 7, 6, 5, 4, 3, 2, 1];
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number(digits[i]) * w[i]!;
  return sum % 11 === 0;
}

function cprMod11Ok(digits: string): boolean | null {
  if (!/^\d{10}$/.test(digits)) return null;
  // CPR after Oct 2007 may skip mod-11; still useful as a soft check.
  const w = [4, 3, 2, 7, 6, 5, 4, 3, 2, 1];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * w[i]!;
  return sum % 11 === 0;
}

function easterSunday(year: number): Date {
  // Anonymous Gregorian algorithm
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
  return new Date(year, month - 1, day);
}

function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function wordsEn(n: number): string {
  if (!Number.isFinite(n) || n < 0 || n > 999_999) return "";
  const ones = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const under100 = (x: number): string => {
    if (x < 20) return ones[x]!;
    const t = Math.floor(x / 10);
    const o = x % 10;
    return o ? `${tens[t]}-${ones[o]}` : tens[t]!;
  };
  const under1000 = (x: number): string => {
    if (x < 100) return under100(x);
    const h = Math.floor(x / 100);
    const r = x % 100;
    return r ? `${ones[h]} hundred ${under100(r)}` : `${ones[h]} hundred`;
  };
  if (n < 1000) return under1000(n);
  const th = Math.floor(n / 1000);
  const r = n % 1000;
  return r
    ? `${under1000(th)} thousand ${under1000(r)}`
    : `${under1000(th)} thousand`;
}

function wordsDa(n: number): string {
  if (!Number.isFinite(n) || n < 0 || n > 999_999) return "";
  const ones = [
    "nul",
    "en",
    "to",
    "tre",
    "fire",
    "fem",
    "seks",
    "syv",
    "otte",
    "ni",
    "ti",
    "elleve",
    "tolv",
    "tretten",
    "fjorten",
    "femten",
    "seksten",
    "sytten",
    "atten",
    "nitten",
  ];
  const tens = [
    "",
    "",
    "tyve",
    "tredive",
    "fyrre",
    "halvtreds",
    "tres",
    "halvfjerds",
    "firs",
    "halvfems",
  ];
  const under100 = (x: number): string => {
    if (x < 20) return ones[x]!;
    const t = Math.floor(x / 10);
    const o = x % 10;
    if (!o) return tens[t]!;
    // Danish: ones-og-tens (enogtyve)
    const oneWord = o === 1 ? "en" : ones[o]!;
    return `${oneWord}og${tens[t]}`;
  };
  const under1000 = (x: number): string => {
    if (x < 100) return under100(x);
    const h = Math.floor(x / 100);
    const r = x % 100;
    const hund = h === 1 ? "et hundrede" : `${ones[h]} hundrede`;
    return r ? `${hund} ${under100(r)}` : hund;
  };
  if (n < 1000) return under1000(n);
  const th = Math.floor(n / 1000);
  const r = n % 1000;
  const tus = th === 1 ? "et tusind" : `${under1000(th)} tusind`;
  return r ? `${tus} ${under1000(r)}` : tus;
}

/** Approx moon phase 0–1 from date (simple Conway-ish). */
function moonPhase(d: Date): { nameEn: string; nameDa: string; pct: number } {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  let r = year % 100;
  r %= 19;
  if (r > 9) r -= 19;
  r = ((r * 11) % 30) + month + day;
  if (month < 3) r += 2;
  const age = (r < 0 ? r + 30 : r) % 30;
  const pct = Math.round((age / 29.53) * 100);
  if (age < 2) return { nameEn: "New moon", nameDa: "Nymåne", pct };
  if (age < 7) return { nameEn: "Waxing crescent", nameDa: "Tiltagende sigt", pct };
  if (age < 9) return { nameEn: "First quarter", nameDa: "Første kvarter", pct };
  if (age < 14) return { nameEn: "Waxing gibbous", nameDa: "Tiltagende næsten fuld", pct };
  if (age < 16) return { nameEn: "Full moon", nameDa: "Fuldmåne", pct };
  if (age < 22) return { nameEn: "Waning gibbous", nameDa: "Aftagende næsten fuld", pct };
  if (age < 24) return { nameEn: "Last quarter", nameDa: "Sidste kvarter", pct };
  return { nameEn: "Waning crescent", nameDa: "Aftagende sigt", pct };
}

function randomPick(lines: string[], avoid?: string): string {
  const items = lines.map((l) => l.trim()).filter(Boolean);
  if (!items.length) return "";
  if (items.length === 1) return items[0]!;
  const pool = avoid ? items.filter((i) => i !== avoid) : items;
  const use = pool.length ? pool : items;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return use[buf[0]! % use.length]!;
}

/** Wall time in a zone → UTC ms (Intl-only, no libs). */
function zonedWallToUtcMs(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): number {
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const partsOf = (ms: number) => {
    const parts = dtf.formatToParts(new Date(ms));
    const map: Record<string, string> = {};
    for (const p of parts) {
      if (p.type !== "literal") map[p.type] = p.value;
    }
    return Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour) % 24,
      Number(map.minute),
      Number(map.second || "0"),
    );
  };
  let utc = asUtc;
  for (let i = 0; i < 3; i++) {
    const got = partsOf(utc);
    utc += asUtc - got;
  }
  return utc;
}

function formatInZone(ms: number, timeZone: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ms));
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function cprFullYear(yy: number, serial7: number): number {
  if (serial7 <= 3) return 1900 + yy;
  if (serial7 === 4 || serial7 === 9) {
    return yy <= 36 ? 2000 + yy : 1900 + yy;
  }
  if (serial7 >= 5 && serial7 <= 8) {
    return yy <= 57 ? 2000 + yy : 1800 + yy;
  }
  return 1900 + yy;
}

function textToBraille(text: string): { out: string; skipped: number } {
  let out = "";
  let skipped = 0;
  let inNumber = false;
  for (const ch of text.toLowerCase()) {
    if (/\d/.test(ch)) {
      if (!inNumber) {
        out += "⠼";
        inNumber = true;
      }
      out += BRAILLE[ch] ?? "⠿";
      continue;
    }
    inNumber = false;
    if (ch === " ") {
      out += BRAILLE[" "] ?? "⠀";
      continue;
    }
    if (BRAILLE[ch]) out += BRAILLE[ch];
    else {
      out += "⠿";
      skipped += 1;
    }
  }
  return { out, skipped };
}

let lastPick = "";

export const EXTRA_SIMPLE_TOOL_DEFS: SimpleToolDef[] = [
  {
    id: "amortisering",
    nameEn: "Amortization schedule",
    nameDa: "Amortiseringstabel",
    descriptionEn:
      "See monthly payment and the first rows of principal vs interest for a fixed loan.",
    descriptionDa:
      "Se månedlig ydelse og de første rækker med afdrag kontra renter for et fast lån.",
    aliases: [
      "amortization",
      "amortisation",
      "loan schedule",
      "afdragstabel",
      "ydelsestabel",
      "låneplan",
    ],
    intents: ["loan", "amortization", "afdrag", "lan"],
    tags: ["finance"],
    popularity: 90,
    fields: [
      {
        key: "principal",
        labelEn: "Principal",
        labelDa: "Hovedstol",
        defaultValue: "200000",
        kind: "number",
      },
      {
        key: "rate",
        labelEn: "Annual rate (%)",
        labelDa: "Årlig rente (%)",
        defaultValue: "4.5",
        kind: "number",
      },
      {
        key: "years",
        labelEn: "Years",
        labelDa: "År",
        defaultValue: "20",
        kind: "number",
      },
      {
        key: "extra",
        labelEn: "Extra monthly",
        labelDa: "Ekstra pr. måned",
        defaultValue: "0",
        kind: "number",
      },
      {
        key: "rows",
        labelEn: "Rows to show",
        labelDa: "Rækker at vise",
        defaultValue: "6",
        kind: "number",
        hintEn: "1–24 opening payments",
        hintDa: "1–24 første ydelser",
      },
    ],
    compute: (v) => {
      const P = num(v.principal);
      const annual = num(v.rate);
      const years = num(v.years);
      const extra = Math.max(0, num(v.extra) ?? 0);
      const show = Math.min(24, Math.max(1, Math.floor(num(v.rows) ?? 6)));
      if (
        P === undefined ||
        annual === undefined ||
        years === undefined ||
        P <= 0 ||
        years <= 0
      ) {
        return null;
      }
      const n = Math.round(years * 12);
      const r = annual / 100 / 12;
      const basePayment =
        r === 0 ? P / n : (P * r * (1 + r) ** n) / ((1 + r) ** n - 1);
      const payment = basePayment + extra;
      const out: SimpleResultRow[] = [
        money("Monthly payment", "Månedlig ydelse", round(payment, 2)),
        money(
          "Of which scheduled",
          "Heraf planlagt ydelse",
          round(basePayment, 2),
        ),
      ];
      let balance = P;
      let totalInterest = 0;
      let months = 0;
      let lastPrincipal = 0;
      let lastInterest = 0;
      const schedule: SimpleResultRow[] = [];
      while (balance > 0.005 && months < n + 600) {
        months += 1;
        const interest = balance * r;
        const principal = Math.min(payment - interest, balance);
        if (principal <= 0 && interest > payment) {
          return [
            {
              labelEn: "Error",
              labelDa: "Fejl",
              value: "Payment is too small to cover interest.",
              valueDa: "Ydelsen dækker ikke renten.",
            },
          ];
        }
        balance = Math.max(0, balance - principal);
        totalInterest += interest;
        lastPrincipal = principal;
        lastInterest = interest;
        if (months <= show) {
          schedule.push({
            labelEn: `Payment ${months}`,
            labelDa: `Ydelse ${months}`,
            value: `Principal ${round(principal, 2)}\nInterest ${round(interest, 2)}\nBalance ${round(balance, 2)}`,
            valueDa: `Afdrag ${round(principal, 2)}\nRente ${round(interest, 2)}\nRestgæld ${round(balance, 2)}`,
          });
        }
      }
      out.push(money("Total interest", "Samlede renter", round(totalInterest, 2)));
      out.push(
        money("Months to pay off", "Måneder til fri", String(months)),
      );
      out.push(...schedule);
      if (months > show) {
        out.push({
          labelEn: `Final payment (${months})`,
          labelDa: `Sidste ydelse (${months})`,
          value: `Principal ${round(lastPrincipal, 2)}\nInterest ${round(lastInterest, 2)}\nBalance 0`,
          valueDa: `Afdrag ${round(lastPrincipal, 2)}\nRente ${round(lastInterest, 2)}\nRestgæld 0`,
        });
      }
      return out;
    },
  },
  {
    id: "emailcheck",
    nameEn: "Email format check",
    nameDa: "Email-tjek",
    descriptionEn: "Check whether an address looks like a valid email format.",
    descriptionDa: "Tjek om en adresse ligner et gyldigt e-mailformat.",
    aliases: ["email", "email validator", "validate email", "mail tjek"],
    intents: ["email", "validate"],
    tags: ["developer", "everyday"],
    popularity: 91,
    fields: [
      {
        key: "email",
        labelEn: "Email",
        labelDa: "E-mail",
        defaultValue: "navn@firma.dk",
        kind: "text",
      },
    ],
    compute: (v) => {
      const email = (v.email ?? "").trim();
      if (!email) return null;
      const reasons: string[] = [];
      const reasonsDa: string[] = [];
      if (!email.includes("@")) {
        reasons.push("Missing @");
        reasonsDa.push("Mangler @");
      }
      if (email.includes("..")) {
        reasons.push("Consecutive dots");
        reasonsDa.push("Dobbelte punktummer");
      }
      if (email.length > 254) {
        reasons.push("Longer than 254 characters");
        reasonsDa.push("Længere end 254 tegn");
      }
      const okShape =
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email) &&
        !email.includes("..") &&
        email.length <= 254;
      if (!okShape && reasons.length === 0) {
        reasons.push("Local part or domain looks wrong");
        reasonsDa.push("Lokaldel eller domæne ser forkert ud");
      }
      const domain = email.includes("@") ? email.split("@").pop() ?? "" : "";
      const rows: SimpleResultRow[] = [
        {
          labelEn: "Verdict",
          labelDa: "Resultat",
          value: okShape ? "Valid format" : "Invalid format",
          valueDa: okShape ? "Gyldigt format" : "Ugyldigt format",
        },
        { labelEn: "Domain", labelDa: "Domæne", value: domain || "—" },
      ];
      if (!okShape && reasons.length) {
        rows.push({
          labelEn: "Why",
          labelDa: "Årsag",
          value: reasons.join("; "),
          valueDa: reasonsDa.join("; "),
        });
      }
      if (domain && /[A-Z]/.test(domain)) {
        rows.push({
          labelEn: "Tip",
          labelDa: "Tip",
          value: `Domain is usually lowercase: ${domain.toLowerCase()}`,
          valueDa: `Domæner skrives normalt med små bogstaver: ${domain.toLowerCase()}`,
        });
      }
      rows.push({
        labelEn: "Note",
        labelDa: "Note",
        value: "Does not prove the inbox exists.",
        valueDa: "Beviser ikke at postkassen findes.",
      });
      return rows;
    },
  },
  {
    id: "cvrcheck",
    nameEn: "CVR check",
    nameDa: "CVR-tjek",
    descriptionEn: "Validate an 8-digit Danish CVR number with the mod-11 checksum.",
    descriptionDa: "Valider et 8-cifret dansk CVR-nummer med mod-11-kontrolciffer.",
    aliases: ["cvr", "cvr nummer", "virksomhedsnummer", "company number denmark"],
    intents: ["cvr", "denmark", "business"],
    tags: ["denmark", "everyday"],
    popularity: 88,
    fields: [
      {
        key: "cvr",
        labelEn: "CVR",
        labelDa: "CVR",
        defaultValue: "10103940",
        hintEn: "8 digits",
        hintDa: "8 cifre",
      },
    ],
    compute: (v) => {
      const digits = (v.cvr ?? "").replace(/\D/g, "");
      if (!digits) return null;
      const ok = cvrValid(digits);
      const pretty =
        digits.length === 8
          ? `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)}`
          : digits;
      return [
        {
          labelEn: "Checksum",
          labelDa: "Kontrolciffer",
          value: ok ? "Valid" : digits.length === 8 ? "Invalid" : "Need 8 digits",
          valueDa:
            ok ? "Gyldigt" : digits.length === 8 ? "Ugyldigt" : "Skal være 8 cifre",
        },
        { labelEn: "Normalized", labelDa: "Normaliseret", value: pretty || "—" },
        {
          labelEn: "Note",
          labelDa: "Note",
          value: "Checksum only. Does not look up the company.",
          valueDa: "Kun kontrolciffer. Slår ikke virksomheden op.",
        },
      ];
    },
  },
  {
    id: "cprcheck",
    nameEn: "CPR format check",
    nameDa: "CPR-format-tjek",
    descriptionEn:
      "Check Danish CPR format and date parts locally. Soft mod-11 note only; newer numbers may skip it.",
    descriptionDa:
      "Tjek dansk CPR-format og datodele lokalt. Blød mod-11-note; nyere numre kan springe den over.",
    aliases: ["cpr", "personnummer", "cpr nummer", "danish ssn"],
    intents: ["cpr", "denmark"],
    tags: ["denmark", "everyday"],
    popularity: 86,
    fields: [
      {
        key: "cpr",
        labelEn: "CPR",
        labelDa: "CPR",
        defaultValue: "0101901234",
        hintEn: "DDMMYYXXXX or with hyphen",
        hintDa: "DDMMÅÅXXXX eller med bindestreg",
      },
    ],
    compute: (v) => {
      const raw = (v.cpr ?? "").trim();
      const digits = raw.replace(/\D/g, "");
      if (!digits) return null;
      if (digits.length !== 10) {
        return [
          {
            labelEn: "Format",
            labelDa: "Format",
            value: "Need 10 digits",
            valueDa: "Skal være 10 cifre",
          },
        ];
      }
      const dd = Number(digits.slice(0, 2));
      const mm = Number(digits.slice(2, 4));
      const yy = Number(digits.slice(4, 6));
      const serial7 = Number(digits[6]);
      const fullYear = cprFullYear(yy, serial7);
      const dateOk =
        mm >= 1 &&
        mm <= 12 &&
        dd >= 1 &&
        dd <= daysInMonth(fullYear, mm);
      const mod = cprMod11Ok(digits);
      const formatted = `${digits.slice(0, 6)}-${digits.slice(6)}`;
      return [
        {
          labelEn: "Formatted",
          labelDa: "Formatteret",
          value: formatted,
        },
        {
          labelEn: "Date part",
          labelDa: "Datodel",
          value: dateOk
            ? `${String(dd).padStart(2, "0")}.${String(mm).padStart(2, "0")}.${fullYear}`
            : "Invalid calendar date",
          valueDa: dateOk
            ? `${String(dd).padStart(2, "0")}.${String(mm).padStart(2, "0")}.${fullYear}`
            : "Ugyldig kalenderdato",
        },
        {
          labelEn: "Mod-11",
          labelDa: "Mod-11",
          value:
            mod === true
              ? "Passes (legacy rule)"
              : mod === false
                ? "Fails (may still be valid if issued after 2007)"
                : "—",
          valueDa:
            mod === true
              ? "Består (ældre regel)"
              : mod === false
                ? "Fejler (kan stadig være gyldigt hvis udstedt efter 2007)"
                : "—",
        },
        {
          labelEn: "Privacy",
          labelDa: "Privatliv",
          value: "Checked only in your browser. Nothing is uploaded.",
          valueDa: "Tjekkes kun i din browser. Intet uploades.",
        },
      ];
    },
  },
  {
    id: "morse",
    nameEn: "Morse code",
    nameDa: "Morsealfabet",
    descriptionEn: "Encode text to Morse or decode Morse back to text.",
    descriptionDa: "Kod tekst til Morse eller afkod Morse tilbage til tekst.",
    aliases: ["morse", "morse code", "morsekode", "sos"],
    intents: ["morse", "encode", "decode"],
    tags: ["education", "convert"],
    popularity: 84,
    fields: [
      {
        key: "mode",
        labelEn: "Mode",
        labelDa: "Tilstand",
        kind: "select",
        defaultValue: "encode",
        options: [
          { value: "encode", labelEn: "Text → Morse", labelDa: "Tekst → Morse" },
          { value: "decode", labelEn: "Morse → Text", labelDa: "Morse → Tekst" },
        ],
      },
      {
        key: "text",
        labelEn: "Input",
        labelDa: "Input",
        multiline: true,
        defaultValue: "SOS KIT",
      },
    ],
    compute: (v) => {
      const text = (v.text ?? "").trim();
      if (!text) return null;
      if (v.mode === "decode") {
        let skipped = 0;
        const words = text
          .replace(/\//g, " / ")
          .split(/\s+/)
          .filter(Boolean)
          .map((tok) => {
            if (tok === "/") return " ";
            const hit = MORSE_REV[tok];
            if (!hit) skipped += 1;
            return hit ?? "?";
          })
          .join("")
          .replace(/ +/g, " ")
          .trim();
        const rows: SimpleResultRow[] = [
          { labelEn: "Text", labelDa: "Tekst", value: words || "—" },
        ];
        if (skipped) {
          rows.push({
            labelEn: "Unknown tokens",
            labelDa: "Ukendte tegn",
            value: String(skipped),
            numeric: true,
          });
        }
        rows.push({
          labelEn: "Legend",
          labelDa: "Forklaring",
          value: ". − = dit/dah · space = letter · / = word",
          valueDa: ". − = dit/dah · mellemrum = bogstav · / = ord",
        });
        return rows;
      }
      let skipped = 0;
      const out = text
        .toLowerCase()
        .split("")
        .map((ch) => {
          if (ch === " ") return "/";
          const hit = MORSE[ch];
          if (!hit) skipped += 1;
          return hit ?? "?";
        })
        .join(" ");
      const rows: SimpleResultRow[] = [
        { labelEn: "Morse", labelDa: "Morse", value: out },
      ];
      if (skipped) {
        rows.push({
          labelEn: "Skipped characters",
          labelDa: "Sprunget over",
          value: String(skipped),
          numeric: true,
        });
      }
      rows.push({
        labelEn: "Legend",
        labelDa: "Forklaring",
        value: ". − = dit/dah · space = letter · / = word",
        valueDa: ". − = dit/dah · mellemrum = bogstav · / = ord",
      });
      return rows;
    },
  },
  {
    id: "nato",
    nameEn: "NATO phonetic alphabet",
    nameDa: "NATO-alfabet",
    descriptionEn: "Spell text with the NATO phonetic alphabet.",
    descriptionDa: "Stav tekst med NATO-fonetiske alfabet.",
    aliases: ["nato", "phonetic alphabet", "alfa bravo", "fonetisk alfabet"],
    intents: ["nato", "phonetic", "spell"],
    tags: ["education", "everyday"],
    popularity: 83,
    fields: [
      {
        key: "text",
        labelEn: "Text",
        labelDa: "Tekst",
        defaultValue: "KIT",
      },
    ],
    compute: (v) => {
      const text = (v.text ?? "").trim();
      if (!text) return null;
      const spelled = text
        .toLowerCase()
        .split("")
        .map((ch) => {
          if (ch === " ") return "\n";
          return NATO[ch] ?? ch.toUpperCase();
        })
        .join(" ")
        .replace(/ *\n */g, "\n")
        .trim();
      const letters = text.replace(/\s+/g, "").length;
      return [
        { labelEn: "Spelled", labelDa: "Stavet", value: spelled },
        {
          labelEn: "Characters",
          labelDa: "Tegn",
          value: String(letters),
          numeric: true,
        },
      ];
    },
  },
  {
    id: "braille",
    nameEn: "Braille converter",
    nameDa: "Blindeskrift",
    descriptionEn:
      "Convert letters and digits to Unicode Braille cells (with number indicator).",
    descriptionDa:
      "Konverter bogstaver og cifre til Unicode-blindeskrift (med talkendetegn).",
    aliases: ["braille", "blindeskrift", "punktskrift"],
    intents: ["braille", "accessibility"],
    tags: ["education", "accessibility"],
    popularity: 78,
    fields: [
      {
        key: "text",
        labelEn: "Text",
        labelDa: "Tekst",
        defaultValue: "hello 12",
      },
    ],
    compute: (v) => {
      const text = (v.text ?? "").trim();
      if (!text) return null;
      const { out, skipped } = textToBraille(text);
      const rows: SimpleResultRow[] = [
        { labelEn: "Braille", labelDa: "Blindeskrift", value: out },
      ];
      if (skipped) {
        rows.push({
          labelEn: "Unknown characters",
          labelDa: "Ukendte tegn",
          value: String(skipped),
          numeric: true,
        });
      }
      rows.push({
        labelEn: "Note",
        labelDa: "Note",
        value: "Digits are prefixed with ⠼. Basic Latin only.",
        valueDa: "Cifre får talkendetegnet ⠼. Kun grundlæggende latin.",
      });
      return rows;
    },
  },
  {
    id: "quadratic",
    nameEn: "Quadratic equation",
    nameDa: "Andengradsligning",
    descriptionEn: "Solve ax² + bx + c = 0 for real or complex roots.",
    descriptionDa: "Løs ax² + bx + c = 0 for reelle eller komplekse rødder.",
    aliases: ["quadratic", "andengradsligning", "abc formel", "roots"],
    intents: ["math", "quadratic", "school"],
    tags: ["education", "math"],
    popularity: 87,
    fields: [
      { key: "a", labelEn: "a", labelDa: "a", defaultValue: "1" },
      { key: "b", labelEn: "b", labelDa: "b", defaultValue: "-3" },
      { key: "c", labelEn: "c", labelDa: "c", defaultValue: "2" },
    ],
    compute: (v) => {
      const a = num(v.a);
      const b = num(v.b);
      const c = num(v.c);
      if (a === undefined || b === undefined || c === undefined) return null;
      const eq = `${a}x² ${b >= 0 ? "+" : "−"} ${Math.abs(b)}x ${c >= 0 ? "+" : "−"} ${Math.abs(c)} = 0`;
      if (a === 0) {
        if (b === 0) return null;
        return [
          {
            labelEn: "Type",
            labelDa: "Type",
            value: "Not quadratic (linear)",
            valueDa: "Ikke andengrads (lineær)",
          },
          {
            labelEn: "Linear root",
            labelDa: "Lineær rod",
            value: round(-c / b, 8),
            numeric: true,
          },
        ];
      }
      const d = b * b - 4 * a * c;
      const head: SimpleResultRow = {
        labelEn: "Equation",
        labelDa: "Ligning",
        value: eq,
      };
      if (d > 0) {
        const s = Math.sqrt(d);
        return [
          head,
          { labelEn: "x₁", labelDa: "x₁", value: round((-b + s) / (2 * a), 8), numeric: true },
          { labelEn: "x₂", labelDa: "x₂", value: round((-b - s) / (2 * a), 8), numeric: true },
          { labelEn: "Discriminant", labelDa: "Diskriminant", value: round(d, 8), numeric: true },
        ];
      }
      if (d === 0) {
        return [
          head,
          { labelEn: "x", labelDa: "x", value: round(-b / (2 * a), 8), numeric: true },
          { labelEn: "Discriminant", labelDa: "Diskriminant", value: "0" },
        ];
      }
      const s = Math.sqrt(-d);
      const re = -b / (2 * a);
      const im = s / (2 * a);
      return [
        head,
        {
          labelEn: "x₁",
          labelDa: "x₁",
          value: `${round(re, 6)} + ${round(im, 6)}i`,
        },
        {
          labelEn: "x₂",
          labelDa: "x₂",
          value: `${round(re, 6)} − ${round(im, 6)}i`,
        },
        { labelEn: "Discriminant", labelDa: "Diskriminant", value: round(d, 8), numeric: true },
      ];
    },
  },
  {
    id: "idealweight",
    nameEn: "Ideal weight estimate",
    nameDa: "Idealvægt",
    descriptionEn: "Devine and Robinson ideal body weight estimates from height.",
    descriptionDa: "Devine- og Robinson-estimater for idealvægt ud fra højde.",
    aliases: ["ideal weight", "idealvægt", "devine", "robinson"],
    intents: ["health", "weight"],
    tags: ["health"],
    popularity: 85,
    fields: [
      { key: "height", labelEn: "Height (cm)", labelDa: "Højde (cm)", defaultValue: "175" },
      {
        key: "sex",
        labelEn: "Sex",
        labelDa: "Køn",
        kind: "select",
        defaultValue: "male",
        options: [
          { value: "male", labelEn: "Male", labelDa: "Mand" },
          { value: "female", labelEn: "Female", labelDa: "Kvinde" },
        ],
      },
    ],
    compute: (v) => {
      const cm = num(v.height);
      if (cm === undefined || cm < 100 || cm > 250) {
        return [
          {
            labelEn: "Error",
            labelDa: "Fejl",
            value: "Use a height between 100 and 250 cm.",
            valueDa: "Brug en højde mellem 100 og 250 cm.",
          },
        ];
      }
      const inches = cm / 2.54;
      const over5 = Math.max(0, inches - 60);
      const male = v.sex !== "female";
      const devine = male ? 50 + 2.3 * over5 : 45.5 + 2.3 * over5;
      const robinson = male ? 52 + 1.9 * over5 : 49 + 1.7 * over5;
      const m = cm / 100;
      const bmiLow = 18.5 * m * m;
      const bmiHigh = 24.9 * m * m;
      return [
        money("Devine (kg)", "Devine (kg)", round(devine, 1)),
        money("Robinson (kg)", "Robinson (kg)", round(robinson, 1)),
        {
          labelEn: "BMI 18.5–24.9 band (kg)",
          labelDa: "BMI 18,5–24,9-spænd (kg)",
          value: `${round(bmiLow, 1)} – ${round(bmiHigh, 1)}`,
        },
        {
          labelEn: "Note",
          labelDa: "Note",
          value: "Population formulas, not medical advice.",
          valueDa: "Populationsformler, ikke lægelig rådgivning.",
        },
      ];
    },
  },
  {
    id: "onerm",
    nameEn: "One-rep max",
    nameDa: "1RM-beregner",
    descriptionEn: "Estimate one-rep max from weight and reps (Epley and Brzycki).",
    descriptionDa: "Estimer 1RM ud fra vægt og gentagelser (Epley og Brzycki).",
    aliases: ["1rm", "one rep max", "epley", "styrkeløft", "maxløft"],
    intents: ["fitness", "gym", "1rm"],
    tags: ["health", "fitness"],
    popularity: 89,
    fields: [
      {
        key: "weight",
        labelEn: "Weight lifted",
        labelDa: "Løftet vægt",
        defaultValue: "80",
        kind: "number",
        hintEn: "kg or lb (same unit out)",
        hintDa: "kg eller lb (samme enhed ud)",
      },
      {
        key: "reps",
        labelEn: "Reps",
        labelDa: "Gentagelser",
        defaultValue: "5",
        kind: "number",
        hintEn: "1–12 (Epley is less reliable above ~10)",
        hintDa: "1–12 (Epley er mindre sikker over ca. 10)",
      },
    ],
    compute: (v) => {
      const w = num(v.weight);
      const reps = num(v.reps);
      if (w === undefined || w <= 0) {
        return [
          {
            labelEn: "Error",
            labelDa: "Fejl",
            value: "Enter a positive weight.",
            valueDa: "Angiv en positiv vægt.",
          },
        ];
      }
      if (reps === undefined || reps < 1 || reps > 12 || !Number.isInteger(reps)) {
        return [
          {
            labelEn: "Error",
            labelDa: "Fejl",
            value: "Reps must be a whole number from 1 to 12.",
            valueDa: "Gentagelser skal være et helt tal fra 1 til 12.",
          },
        ];
      }
      const epley = w * (1 + reps / 30);
      const brzycki = reps === 1 ? w : (w * 36) / (37 - reps);
      const avg = (epley + brzycki) / 2;
      return [
        money("Estimated 1RM", "Estimeret 1RM", round(avg, 1)),
        money("Epley", "Epley", round(epley, 1)),
        money("Brzycki", "Brzycki", round(brzycki, 1)),
        money("90%", "90%", round(avg * 0.9, 1)),
        money("80%", "80%", round(avg * 0.8, 1)),
        money("70%", "70%", round(avg * 0.7, 1)),
      ];
    },
  },
  {
    id: "picklist",
    nameEn: "Random picker",
    nameDa: "Tilfældig vælger",
    descriptionEn: "Pick one random item from a list.",
    descriptionDa: "Vælg ét tilfældigt punkt fra en liste.",
    aliases: ["picker", "random choice", "vælg tilfældigt", "lodtrækning"],
    intents: ["random", "pick", "choice"],
    tags: ["everyday", "random"],
    popularity: 90,
    volatile: true,
    actionEn: "Pick again",
    actionDa: "Vælg igen",
    fields: [
      {
        key: "list",
        labelEn: "Options",
        labelDa: "Valg",
        multiline: true,
        defaultValue: "Pizza\nSushi\nBurger\nSalat",
        hintEn: "One option per line",
        hintDa: "Ét valg pr. linje",
      },
    ],
    compute: (v) => {
      const lines = (v.list ?? "").split(/\r?\n/);
      const pick = randomPick(lines, lastPick);
      if (!pick) return null;
      lastPick = pick;
      const items = lines.map((l) => l.trim()).filter(Boolean);
      const shuffled = [...items];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const buf = new Uint32Array(1);
        crypto.getRandomValues(buf);
        const j = buf[0]! % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
      }
      return [
        { labelEn: "Picked", labelDa: "Valgt", value: pick },
        { labelEn: "From", labelDa: "Fra", value: String(items.length), numeric: true },
        {
          labelEn: "Shuffled order",
          labelDa: "Blandet rækkefølge",
          value: shuffled.join("\n"),
        },
      ];
    },
  },
  {
    // Routed to CoinFlipTool (3D). Kept here for search copy and registry.
    id: "coinflip",
    nameEn: "Coin flip",
    nameDa: "Plat eller krone",
    descriptionEn: "Flip a fair 3D coin in the browser.",
    descriptionDa: "Kast en fair 3D-mønt i browseren.",
    aliases: ["coin", "coin flip", "plat eller krone", "møntkast"],
    intents: ["random", "coin"],
    tags: ["everyday", "random"],
    popularity: 90,
    fields: [],
    compute: () => null,
  },
  {
    id: "timezoneconvert",
    nameEn: "Timezone convert",
    nameDa: "Tidszone-omregning",
    descriptionEn: "Convert a local date-time between two IANA time zones.",
    descriptionDa: "Omregn lokal dato-tid mellem to IANA-tidszoner.",
    aliases: ["timezone", "tz convert", "tidszone", "utc convert"],
    intents: ["timezone", "convert", "time"],
    tags: ["time"],
    popularity: 88,
    fields: [
      {
        key: "when",
        labelEn: "Date-time",
        labelDa: "Dato-tid",
        defaultValue: "2026-06-15T14:00",
        hintEn: "YYYY-MM-DDTHH:mm as wall time in the from zone",
        hintDa: "ÅÅÅÅ-MM-DDTT:mm som lokal tid i fra-zonen",
      },
      {
        key: "from",
        labelEn: "From zone",
        labelDa: "Fra zone",
        kind: "select",
        defaultValue: "Europe/Copenhagen",
        options: [
          { value: "Europe/Copenhagen", labelEn: "Copenhagen", labelDa: "København" },
          { value: "UTC", labelEn: "UTC", labelDa: "UTC" },
          { value: "Europe/London", labelEn: "London", labelDa: "London" },
          { value: "America/New_York", labelEn: "New York", labelDa: "New York" },
          { value: "America/Los_Angeles", labelEn: "Los Angeles", labelDa: "Los Angeles" },
          { value: "Asia/Tokyo", labelEn: "Tokyo", labelDa: "Tokyo" },
        ],
      },
      {
        key: "to",
        labelEn: "To zone",
        labelDa: "Til zone",
        kind: "select",
        defaultValue: "America/New_York",
        options: [
          { value: "America/New_York", labelEn: "New York", labelDa: "New York" },
          { value: "Europe/Copenhagen", labelEn: "Copenhagen", labelDa: "København" },
          { value: "UTC", labelEn: "UTC", labelDa: "UTC" },
          { value: "Europe/London", labelEn: "London", labelDa: "London" },
          { value: "America/Los_Angeles", labelEn: "Los Angeles", labelDa: "Los Angeles" },
          { value: "Asia/Tokyo", labelEn: "Tokyo", labelDa: "Tokyo" },
        ],
      },
    ],
    compute: (v) => {
      const when = (v.when ?? "").trim();
      const from = (v.from ?? "").trim();
      const to = (v.to ?? "").trim();
      if (!when || !from || !to) return null;
      const m = when.match(
        /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2})?$/,
      );
      if (!m) {
        return [
          {
            labelEn: "Error",
            labelDa: "Fejl",
            value: "Use YYYY-MM-DDTHH:mm",
            valueDa: "Brug ÅÅÅÅ-MM-DDTT:mm",
          },
        ];
      }
      try {
        const utcMs = zonedWallToUtcMs(
          Number(m[1]),
          Number(m[2]),
          Number(m[3]),
          Number(m[4]),
          Number(m[5]),
          from,
        );
        return [
          {
            labelEn: "In from zone",
            labelDa: "I fra-zone",
            value: formatInZone(utcMs, from),
          },
          {
            labelEn: "In to zone",
            labelDa: "I til-zone",
            value: formatInZone(utcMs, to),
          },
          {
            labelEn: "UTC",
            labelDa: "UTC",
            value: formatInZone(utcMs, "UTC"),
          },
        ];
      } catch {
        return [
          {
            labelEn: "Error",
            labelDa: "Fejl",
            value: "Unknown timezone id",
            valueDa: "Ukendt tidszone-id",
          },
        ];
      }
    },
  },
  {
    id: "moonphase",
    nameEn: "Moon phase",
    nameDa: "Månefase",
    descriptionEn: "Approximate moon phase for a given date.",
    descriptionDa: "Omtrentlig månefase for en given dato.",
    aliases: ["moon", "moon phase", "månefase", "fuldmåne"],
    intents: ["moon", "astronomy"],
    tags: ["education", "everyday"],
    popularity: 82,
    fields: [
      {
        key: "date",
        labelEn: "Date",
        labelDa: "Dato",
        defaultValue: "",
        hintEn: "YYYY-MM-DD (empty = today)",
        hintDa: "ÅÅÅÅ-MM-DD (tom = i dag)",
      },
    ],
    compute: (v) => {
      const raw = (v.date ?? "").trim();
      const today = new Date();
      const fallback = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const d = new Date((raw || fallback) + "T12:00:00");
      if (Number.isNaN(d.getTime())) return null;
      const phase = moonPhase(d);
      const icons: Record<string, string> = {
        "New moon": "●",
        "Waxing crescent": "☽",
        "First quarter": "◐",
        "Waxing gibbous": "◕",
        "Full moon": "○",
        "Waning gibbous": "◔",
        "Last quarter": "◑",
        "Waning crescent": "☾",
      };
      return [
        {
          labelEn: "Phase",
          labelDa: "Fase",
          value: `${icons[phase.nameEn] ?? "☾"} ${phase.nameEn}`,
          valueDa: `${icons[phase.nameEn] ?? "☾"} ${phase.nameDa}`,
        },
        {
          labelEn: "Cycle progress",
          labelDa: "Cyklus-fremskridt",
          value: `${phase.pct}%`,
        },
        {
          labelEn: "Note",
          labelDa: "Note",
          value: "Approximate calendar estimate, not an ephemeris.",
          valueDa: "Omtrentligt kalenderestimat, ikke en ephemeris.",
        },
      ];
    },
  },
  {
    id: "fractionsimplify",
    nameEn: "Simplify fraction",
    nameDa: "Forkort brøk",
    descriptionEn: "Reduce a fraction to lowest terms.",
    descriptionDa: "Forkort en brøk til laveste termer.",
    aliases: ["fraction", "simplify fraction", "brøk", "forkort"],
    intents: ["math", "fraction", "school"],
    tags: ["education", "math"],
    popularity: 86,
    fields: [
      { key: "num", labelEn: "Numerator", labelDa: "Tæller", defaultValue: "24" },
      { key: "den", labelEn: "Denominator", labelDa: "Nævner", defaultValue: "36" },
    ],
    compute: (v) => {
      const n = num(v.num);
      const d = num(v.den);
      if (n === undefined || d === undefined || d === 0) return null;
      const sign = n < 0 !== d < 0 ? -1 : 1;
      const g = gcd(n, d);
      const nn = (sign * Math.abs(n)) / g;
      const dd = Math.abs(d) / g;
      const rows: SimpleResultRow[] = [
        { labelEn: "Simplified", labelDa: "Forkortet", value: `${nn}/${dd}` },
      ];
      if (Math.abs(nn) > dd && dd !== 0) {
        const whole = Math.trunc(nn / dd);
        const rem = Math.abs(nn % dd);
        rows.push({
          labelEn: "Mixed number",
          labelDa: "Blandet tal",
          value: rem === 0 ? String(whole) : `${whole} ${rem}/${dd}`,
        });
      }
      rows.push(
        { labelEn: "Decimal", labelDa: "Decimal", value: round(n / d, 8), numeric: true },
        { labelEn: "GCD", labelDa: "SFD", value: String(g), numeric: true },
      );
      return rows;
    },
  },
  {
    id: "percentfraction",
    nameEn: "Percent to fraction",
    nameDa: "Procent til brøk",
    descriptionEn: "Convert a percent into a simplified fraction.",
    descriptionDa: "Omregn en procent til en forkortet brøk.",
    aliases: ["percent to fraction", "procent til brøk", "% to fraction"],
    intents: ["math", "percent", "fraction"],
    tags: ["education", "math"],
    popularity: 84,
    fields: [
      { key: "percent", labelEn: "Percent", labelDa: "Procent", defaultValue: "37.5" },
    ],
    compute: (v) => {
      const raw = (v.percent ?? "").trim().replace(",", ".").replace(/%/g, "");
      const p = num(raw);
      if (p === undefined) return null;
      const decimals = (raw.split(".")[1] ?? "").length;
      const scale = 10 ** Math.min(6, decimals);
      const scaled = Math.round(p * scale);
      const den = 100 * scale;
      const g = gcd(scaled, den);
      return [
        {
          labelEn: "Fraction",
          labelDa: "Brøk",
          value: `${scaled / g}/${den / g}`,
        },
        {
          labelEn: "Before simplify",
          labelDa: "Før forkortning",
          value: `${scaled}/${den}`,
        },
        {
          labelEn: "Decimal",
          labelDa: "Decimal",
          value: round(p / 100, 8),
          numeric: true,
        },
      ];
    },
  },
  {
    id: "paaske",
    nameEn: "Easter date",
    nameDa: "Påskedato",
    descriptionEn: "Gregorian Easter Sunday and related Danish holidays for a year.",
    descriptionDa: "Gregoriansk påskesøndag og relaterede danske helligdage for et år.",
    aliases: ["easter", "påske", "skærtorsdag", "store bededag", "kristi himmelfart"],
    intents: ["easter", "holiday", "denmark"],
    tags: ["denmark", "time"],
    popularity: 87,
    fields: [
      {
        key: "year",
        labelEn: "Year",
        labelDa: "År",
        defaultValue: String(new Date().getFullYear()),
        kind: "number",
      },
    ],
    compute: (v) => {
      const year = Math.floor(num(v.year) ?? 0);
      if (year < 1583 || year > 4099) {
        return [
          {
            labelEn: "Error",
            labelDa: "Fejl",
            value: "Use a year between 1583 and 4099.",
            valueDa: "Brug et år mellem 1583 og 4099.",
          },
        ];
      }
      const easter = easterSunday(year);
      const rows: SimpleResultRow[] = [
        { labelEn: "Easter Sunday", labelDa: "Påskedag", value: iso(easter) },
        {
          labelEn: "Maundy Thursday",
          labelDa: "Skærtorsdag",
          value: iso(addDays(easter, -3)),
        },
        {
          labelEn: "Good Friday",
          labelDa: "Langfredag",
          value: iso(addDays(easter, -2)),
        },
        {
          labelEn: "Easter Monday",
          labelDa: "2. påskedag",
          value: iso(addDays(easter, 1)),
        },
        {
          labelEn: "Ascension",
          labelDa: "Kristi himmelfart",
          value: iso(addDays(easter, 39)),
        },
        {
          labelEn: "Whit Sunday",
          labelDa: "Pinsedag",
          value: iso(addDays(easter, 49)),
        },
        {
          labelEn: "Whit Monday",
          labelDa: "2. pinsedag",
          value: iso(addDays(easter, 50)),
        },
      ];
      if (year <= 2023) {
        rows.push({
          labelEn: "Great Prayer Day",
          labelDa: "Store bededag",
          value: iso(addDays(easter, 26)),
        });
      }
      return rows;
    },
  },
  {
    id: "talord",
    nameEn: "Number to words",
    nameDa: "Tal til ord",
    descriptionEn: "Write a number in English and Danish words (up to 999,999).",
    descriptionDa: "Skriv et tal med engelske og danske ord (op til 999.999).",
    aliases: ["number to words", "talord", "say number", "in words"],
    intents: ["numbers", "words", "school"],
    tags: ["education", "everyday"],
    popularity: 85,
    fields: [
      { key: "n", labelEn: "Number", labelDa: "Tal", defaultValue: "2026" },
    ],
    compute: (v) => {
      const n = num(v.n);
      if (n === undefined || n < 0 || n > 999_999 || !Number.isInteger(n)) {
        return [
          {
            labelEn: "Error",
            labelDa: "Fejl",
            value: "Enter a whole number from 0 to 999999.",
            valueDa: "Angiv et helt tal fra 0 til 999999.",
          },
        ];
      }
      return [
        { labelEn: "English", labelDa: "Engelsk", value: wordsEn(n) },
        { labelEn: "Danish", labelDa: "Dansk", value: wordsDa(n), valueDa: wordsDa(n) },
      ];
    },
  },
  {
    id: "svgminify",
    nameEn: "SVG minify",
    nameDa: "SVG-minify",
    descriptionEn: "Strip comments and extra whitespace from SVG markup locally.",
    descriptionDa: "Fjern kommentarer og overflødig whitespace fra SVG lokalt.",
    aliases: ["svg", "minify svg", "compress svg", "svg minify"],
    intents: ["svg", "minify", "design"],
    tags: ["design", "developer"],
    popularity: 81,
    fields: [
      {
        key: "svg",
        labelEn: "SVG markup",
        labelDa: "SVG-markup",
        multiline: true,
        defaultValue:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">\n  <!-- icon -->\n  <circle cx="12" cy="12" r="10" />\n</svg>',
      },
    ],
    compute: (v) => {
      const raw = v.svg ?? "";
      if (!raw.trim()) return null;
      const min = raw
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/>\s+</g, "><")
        .replace(/\s{2,}/g, " ")
        .trim();
      const saved = Math.max(0, raw.length - min.length);
      return [
        {
          labelEn: "Saved",
          labelDa: "Sparing",
          value: `${saved} chars (${raw.length} → ${min.length})`,
          valueDa: `${saved} tegn (${raw.length} → ${min.length})`,
        },
        { labelEn: "Minified", labelDa: "Minimeret", value: min },
      ];
    },
  },
  {
    id: "passwordentropy",
    nameEn: "Password entropy",
    nameDa: "Adgangskode-entropi",
    descriptionEn: "Estimate bits of entropy from password length and character sets.",
    descriptionDa: "Estimer bits entropi ud fra længde og tegnsæt i en adgangskode.",
    aliases: ["entropy", "password bits", "password strength bits"],
    intents: ["password", "security", "entropy"],
    tags: ["security", "developer"],
    popularity: 84,
    fields: [
      {
        key: "password",
        labelEn: "Password",
        labelDa: "Adgangskode",
        defaultValue: "",
        kind: "password",
        hintEn: "Stays in your browser. Never uploaded.",
        hintDa: "Bliver i din browser. Uploades aldrig.",
      },
    ],
    compute: (v) => {
      const p = v.password ?? "";
      if (!p) return null;
      let pool = 0;
      if (/[a-z]/.test(p)) pool += 26;
      if (/[A-Z]/.test(p)) pool += 26;
      if (/\d/.test(p)) pool += 10;
      if (/[^a-zA-Z0-9]/.test(p)) pool += 33;
      if (pool === 0) return null;
      const bits = p.length * Math.log2(pool);
      const strength =
        bits < 50
          ? { en: "Weak", da: "Svag" }
          : bits < 80
            ? { en: "Modest", da: "Moderat" }
            : { en: "Strong", da: "Stærk" };
      return [
        {
          labelEn: "Strength",
          labelDa: "Styrke",
          value: strength.en,
          valueDa: strength.da,
        },
        {
          labelEn: "Entropy (bits)",
          labelDa: "Entropi (bits)",
          value: round(bits, 1),
          numeric: true,
        },
        {
          labelEn: "Charset size",
          labelDa: "Tegnsæt-størrelse",
          value: String(pool),
          numeric: true,
        },
        {
          labelEn: "Length",
          labelDa: "Længde",
          value: String(p.length),
          numeric: true,
        },
      ];
    },
  },
  {
    id: "leet",
    nameEn: "Leet speak",
    nameDa: "Leetspeak",
    descriptionEn: "Convert text to basic leetspeak (and back lightly).",
    descriptionDa: "Konverter tekst til simpel leetspeak (og delvist tilbage).",
    aliases: ["leet", "leetspeak", "1337"],
    intents: ["leet", "fun", "encode"],
    tags: ["everyday", "fun"],
    popularity: 76,
    fields: [
      {
        key: "mode",
        labelEn: "Mode",
        labelDa: "Tilstand",
        kind: "select",
        defaultValue: "encode",
        options: [
          { value: "encode", labelEn: "To leet", labelDa: "Til leet" },
          { value: "decode", labelEn: "From leet", labelDa: "Fra leet" },
        ],
      },
      {
        key: "text",
        labelEn: "Text",
        labelDa: "Tekst",
        defaultValue: "elite kit",
      },
    ],
    compute: (v) => {
      const text = v.text ?? "";
      if (!text.trim()) return null;
      const map: Record<string, string> = {
        a: "4",
        e: "3",
        i: "1",
        o: "0",
        s: "5",
        t: "7",
        b: "8",
        g: "9",
      };
      const rev = Object.fromEntries(
        Object.entries(map).map(([k, val]) => [val, k]),
      );
      if (v.mode === "decode") {
        const out = text
          .split("")
          .map((ch) => rev[ch] ?? ch)
          .join("");
        return [{ labelEn: "Text", labelDa: "Tekst", value: out }];
      }
      const out = text
        .split("")
        .map((ch) => {
          const lower = ch.toLowerCase();
          return map[lower] ?? ch;
        })
        .join("");
      return [{ labelEn: "Leet", labelDa: "Leet", value: out }];
    },
  },
  {
    id: "boxfit",
    nameEn: "Box fit",
    nameDa: "Kassepasning",
    descriptionEn: "Check whether an item fits in a box (axis-aligned, any rotation of sides).",
    descriptionDa:
      "Tjek om en genstand passer i en kasse (akseret, alle sideombytninger).",
    aliases: ["box fit", "fits in box", "kasse", "pakning", "dimensions fit"],
    intents: ["shipping", "pack", "fit"],
    tags: ["everyday", "freight"],
    popularity: 82,
    fields: [
      { key: "iw", labelEn: "Item W", labelDa: "Genstand B", defaultValue: "30" },
      { key: "ih", labelEn: "Item H", labelDa: "Genstand H", defaultValue: "20" },
      { key: "id", labelEn: "Item D", labelDa: "Genstand D", defaultValue: "10" },
      { key: "bw", labelEn: "Box W", labelDa: "Kasse B", defaultValue: "40" },
      { key: "bh", labelEn: "Box H", labelDa: "Kasse H", defaultValue: "30" },
      { key: "bd", labelEn: "Box D", labelDa: "Kasse D", defaultValue: "25" },
    ],
    compute: (v) => {
      const item = [num(v.iw), num(v.ih), num(v.id)];
      const box = [num(v.bw), num(v.bh), num(v.bd)];
      if (item.some((x) => x === undefined || x <= 0)) return null;
      if (box.some((x) => x === undefined || x <= 0)) return null;
      const a = [...(item as number[])].sort((x, y) => x - y);
      const b = [...(box as number[])].sort((x, y) => x - y);
      const fits = a[0]! <= b[0]! && a[1]! <= b[1]! && a[2]! <= b[2]!;
      const itemVol = a[0]! * a[1]! * a[2]!;
      const boxVol = b[0]! * b[1]! * b[2]!;
      return [
        {
          labelEn: "Fits",
          labelDa: "Passer",
          value: fits ? "Yes" : "No",
          valueDa: fits ? "Ja" : "Nej",
        },
        {
          labelEn: "Orientation",
          labelDa: "Orientering",
          value: fits
            ? `Sort item ${a.map((x) => round(x, 2)).join("×")} into box ${b.map((x) => round(x, 2)).join("×")}`
            : "No axis mapping fits after sorting sides",
          valueDa: fits
            ? `Sortér genstand ${a.map((x) => round(x, 2)).join("×")} ind i kasse ${b.map((x) => round(x, 2)).join("×")}`
            : "Ingen sideombytning får genstanden til at passe",
        },
        {
          labelEn: "Spare volume",
          labelDa: "Ledig volumen",
          value: fits ? round(boxVol - itemVol, 2) : "—",
          numeric: fits,
        },
        {
          labelEn: "Item volume",
          labelDa: "Genstandsvolumen",
          value: round(itemVol, 2),
          numeric: true,
        },
        {
          labelEn: "Box volume",
          labelDa: "Kassevolumen",
          value: round(boxVol, 2),
          numeric: true,
        },
      ];
    },
  },
  {
    id: "ruleof70",
    nameEn: "Doubling time",
    nameDa: "Fordoblingstid",
    descriptionEn: "Years to double from a growth rate (rule of 70 / 72) plus exact math.",
    descriptionDa: "År til fordobling ud fra vækstrate (70- / 72-reglen) plus eksakt beregning.",
    aliases: ["doubling time", "rule of 70", "fordoblingstid", "70 reglen"],
    intents: ["finance", "growth"],
    tags: ["finance"],
    popularity: 80,
    fields: [
      {
        key: "rate",
        labelEn: "Growth % per year",
        labelDa: "Vækst % pr. år",
        defaultValue: "7",
        kind: "number",
      },
    ],
    compute: (v) => {
      const rate = num(v.rate);
      if (rate === undefined || rate === 0) {
        return [
          {
            labelEn: "Error",
            labelDa: "Fejl",
            value: "Growth rate must be non-zero.",
            valueDa: "Vækstraten må ikke være nul.",
          },
        ];
      }
      if (rate <= -100) {
        return [
          {
            labelEn: "Error",
            labelDa: "Fejl",
            value: "Rate must be greater than -100%.",
            valueDa: "Renten skal være større end −100%.",
          },
        ];
      }
      const exact = Math.log(2) / Math.log(1 + rate / 100);
      const to10x = Math.log(10) / Math.log(1 + rate / 100);
      const rows: SimpleResultRow[] = [
        {
          labelEn: "Exact doubling (years)",
          labelDa: "Eksakt fordobling (år)",
          value: round(exact, 2),
          numeric: true,
        },
      ];
      if (rate > 0) {
        rows.push(
          {
            labelEn: "Rule of 70",
            labelDa: "70-reglen",
            value: round(70 / rate, 2),
            numeric: true,
          },
          {
            labelEn: "Rule of 72",
            labelDa: "72-reglen",
            value: round(72 / rate, 2),
            numeric: true,
          },
          {
            labelEn: "Years to 10×",
            labelDa: "År til 10×",
            value: round(to10x, 2),
            numeric: true,
          },
        );
      }
      return rows;
    },
  },
];
