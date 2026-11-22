export type DataLocale = "da" | "en";

export type FieldKey =
  | "name"
  | "email"
  | "phone"
  | "address"
  | "company"
  | "birthdate";

export type PersonRow = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  birthdate?: string;
};

const FIRST_DA = [
  "Anders",
  "Mette",
  "Jonas",
  "Sofie",
  "Lars",
  "Emma",
  "Mikkel",
  "Ida",
  "Frederik",
  "Anna",
  "Christian",
  "Louise",
  "Nikolaj",
  "Camilla",
  "Thomas",
  "Katrine",
  "Peter",
  "Line",
  "Martin",
  "Sara",
];

const LAST_DA = [
  "Nielsen",
  "Jensen",
  "Hansen",
  "Pedersen",
  "Andersen",
  "Christensen",
  "Larsen",
  "Sørensen",
  "Rasmussen",
  "Jørgensen",
  "Petersen",
  "Madsen",
  "Kristensen",
  "Olsen",
  "Thomsen",
];

const STREETS_DA = [
  "Nørrebrogade",
  "Vesterbrogade",
  "Østerbrogade",
  "Amagerbrogade",
  "Gammel Kongevej",
  "Strandvejen",
  "Jagtvej",
  "Istedgade",
  "Frederiksberg Allé",
  "Lyngbyvej",
  "Hovedgaden",
  "Stationsvej",
  "Skolevej",
  "Birkevej",
  "Solbakken",
];

const CITIES_DA = [
  "København",
  "Aarhus",
  "Odense",
  "Aalborg",
  "Esbjerg",
  "Randers",
  "Kolding",
  "Horsens",
  "Vejle",
  "Roskilde",
];

const COMPANIES_DA = [
  "Nordisk Data ApS",
  "Havblik Handel A/S",
  "Grøn Energi Danmark",
  "Kystlinjen Consulting",
  "Byggeri & Bolig ApS",
  "Fjord IT",
  "SundhedsLab A/S",
  "Øresund Logistics",
  "Møllebakken Media",
  "KlarTeknik ApS",
];

const FIRST_EN = [
  "James",
  "Emily",
  "Michael",
  "Olivia",
  "William",
  "Sophia",
  "Benjamin",
  "Ava",
  "Lucas",
  "Mia",
  "Henry",
  "Charlotte",
  "Alexander",
  "Amelia",
  "Daniel",
  "Harper",
  "Matthew",
  "Evelyn",
  "Samuel",
  "Abigail",
];

const LAST_EN = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Wilson",
  "Anderson",
  "Thomas",
];

const STREETS_EN = [
  "Oak Street",
  "Maple Avenue",
  "Cedar Lane",
  "Pine Road",
  "Elm Court",
  "Willow Drive",
  "Birch Boulevard",
  "Cherry Way",
  "Ash Street",
  "Poplar Place",
  "Highland Avenue",
  "River Road",
  "Park Lane",
  "Forest Drive",
  "Lake Street",
];

const CITIES_EN = [
  "Springfield",
  "Riverside",
  "Fairview",
  "Madison",
  "Georgetown",
  "Clinton",
  "Franklin",
  "Greenville",
  "Bristol",
  "Fairfield",
];

const COMPANIES_EN = [
  "Northwind Labs",
  "Summit Analytics",
  "Harbor Softworks",
  "Brightfield Media",
  "Copperline Systems",
  "Evergreen Retail",
  "Blue Orbit Group",
  "Pioneer Health",
  "Cascade Logistics",
  "Silverleaf Consulting",
];

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG for deterministic-ish sequences. */
export function createRng(seed: string | undefined): () => number {
  let state = seed && seed.trim() ? hashSeed(seed.trim()) : Date.now() >>> 0;
  if (state === 0) state = 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(list: readonly T[], rng: () => number): T {
  return list[Math.floor(rng() * list.length)]!;
}

function digits(rng: () => number, count: number): string {
  let out = "";
  for (let i = 0; i < count; i++) {
    out += Math.floor(rng() * 10).toString();
  }
  return out;
}

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function birthdate(rng: () => number): string {
  const year = 1965 + Math.floor(rng() * 40);
  const month = 1 + Math.floor(rng() * 12);
  const day = 1 + Math.floor(rng() * 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function generatePeople(args: {
  count: number;
  locale: DataLocale;
  fields: readonly FieldKey[];
  seed?: string;
}): PersonRow[] {
  const count = Math.min(50, Math.max(1, Math.floor(args.count)));
  const rng = createRng(args.seed);
  const fieldSet = new Set(args.fields);
  const da = args.locale === "da";
  const first = da ? FIRST_DA : FIRST_EN;
  const last = da ? LAST_DA : LAST_EN;
  const streets = da ? STREETS_DA : STREETS_EN;
  const cities = da ? CITIES_DA : CITIES_EN;
  const companies = da ? COMPANIES_DA : COMPANIES_EN;

  const rows: PersonRow[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = pick(first, rng);
    const lastName = pick(last, rng);
    const fullName = `${firstName} ${lastName}`;
    const row: PersonRow = {};

    if (fieldSet.has("name")) row.name = fullName;
    if (fieldSet.has("email")) {
      const domain = da
        ? pick(["mail.dk", "example.dk", "firma.dk", "outlook.dk"], rng)
        : pick(["example.com", "mail.com", "test.org", "demo.io"], rng);
      row.email = `${slugify(firstName)}.${slugify(lastName)}${digits(rng, 2)}@${domain}`;
    }
    if (fieldSet.has("phone")) {
      row.phone = da
        ? `+45 ${digits(rng, 2)} ${digits(rng, 2)} ${digits(rng, 2)} ${digits(rng, 2)}`
        : `+1 (${digits(rng, 3)}) ${digits(rng, 3)}-${digits(rng, 4)}`;
    }
    if (fieldSet.has("address")) {
      const num = 1 + Math.floor(rng() * 199);
      const zip = da
        ? String(1000 + Math.floor(rng() * 8999))
        : String(10000 + Math.floor(rng() * 89999));
      row.address = `${pick(streets, rng)} ${num}, ${zip} ${pick(cities, rng)}`;
    }
    if (fieldSet.has("company")) row.company = pick(companies, rng);
    if (fieldSet.has("birthdate")) row.birthdate = birthdate(rng);

    rows.push(row);
  }
  return rows;
}

export function rowsToCsv(
  rows: PersonRow[],
  fields: readonly FieldKey[],
): string {
  const header = fields.join(",");
  const escape = (value: string) => {
    if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
    return value;
  };
  const lines = rows.map((row) =>
    fields.map((key) => escape(row[key] ?? "")).join(","),
  );
  return [header, ...lines].join("\n");
}

export function rowsToJson(
  rows: PersonRow[],
  fields: readonly FieldKey[],
): string {
  const trimmed = rows.map((row) => {
    const obj: Record<string, string> = {};
    for (const key of fields) {
      const value = row[key];
      if (value !== undefined) obj[key] = value;
    }
    return obj;
  });
  return JSON.stringify(trimmed, null, 2);
}

export const ALL_FIELDS: readonly FieldKey[] = [
  "name",
  "email",
  "phone",
  "address",
  "company",
  "birthdate",
];
