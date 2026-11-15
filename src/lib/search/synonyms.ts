import { normalize } from "./normalize";

/**
 * Each group is one meaning. Any member expands to every member.
 * Keep groups small and verified; do not invent product claims here.
 */
const SYNONYM_GROUPS: readonly (readonly string[])[] = [
  ["moms", "vat", "mva"],
  ["procent", "percent", "percentage", "pct"],
  ["rabat", "discount"],
  ["avance", "margin", "markup", "dækningsgrad", "daekningsgrad"],
  ["jwt", "json web token", "jwtoken"],
  ["cron", "crontab", "cronjob"],
  ["cidr", "subnet", "netmask", "subnetwork"],
  ["alder", "age", "birthday", "fodselsdag", "fødselsdag"],
  ["bmi", "bodymass", "kropsmasse"],
  ["tip", "gratuity", "drikkepege", "drikke penge", "regning"],
  ["opsparing", "savings", "compound"],
  ["inflation", "kobekraft", "købekraft"],
  ["enhedspris", "unitprice", "kilopris"],
  ["ugenummer", "weeknumber", "isoweek", "uge"],
  ["aspect", "aspectratio", "billedformat"],
  ["slug", "slugify", "permalink"],
  ["breakeven", "nulpunkt", "breakevenpoint"],
  ["cagr", "growthrate"],
  ["contrast", "wcag", "a11y", "kontrast", "accessibility"],
  ["password", "kodeord", "adgangskode", "passwd"],
  ["enheder", "units", "unit", "convert", "converter", "omregn", "omregning"],
  ["dato", "date", "dates", "calendar", "kalender"],
  ["arbejdsdage", "business", "weekdays", "hverdage", "workdays", "workday"],
  ["lon", "løn", "salary", "pay", "wage", "payroll", "paycheck", "nettoløn", "nettolon"],
  ["netto", "net"],
  ["brutto", "gross"],
  ["barsel", "orlov", "parental", "maternity", "paternity"],
  [
    "ladmeter",
    "ldm",
    "freight",
    "fragt",
    "pallet",
    "palle",
    "læsseplan",
    "laesseplan",
    "trailer",
    "loadplan",
  ],
  ["lommeregner", "calculator", "calc", "math", "beregn", "formel", "formula"],
  ["bmi"],
  ["rente", "interest"],
  ["brøk", "brok", "fraction"],
  ["areal", "area"],
  ["countdown", "timer", "takt", "nedtaeller", "nedtaelling", "takttid"],
  ["stopur", "stopwatch", "splits", "lap"],
  [
    "kilometerpenge",
    "kørselsgodtgørelse",
    "korselsgodtgorelse",
    "mileage",
    "befordring",
  ],
  [
    "braendstof",
    "brændstof",
    "fuel",
    "benzin",
    "diesel",
    "petrol",
    "elbil",
    "electric",
    "ev",
    "kwh",
    "strom",
    "strøm",
    "elpris",
    "spotpris",
    "benzinpris",
    "dieselpris",
  ],
  ["feriepenge", "ferietillæg", "ferietillaeg", "holiday"],
  ["lan", "lån", "loan", "mortgage", "ydelse", "annuitet", "afdrag"],
  ["arbejdstid", "timeseddel", "arbejdstimer", "stempelur"],
  ["hash", "sha256", "checksum"],
  ["diff", "sammenlign"],
  ["termin", "terminsdato", "graviditet", "gravid", "due"],
  ["encode", "base64", "urlencode", "urldecode"],
  ["ai", "chatbot", "llm", "assistant"],
  ["translate", "translation", "oversæt", "oversætter", "translator"],
  ["email", "mail", "e-mail"],
  ["maps", "kort", "navigation", "directions", "rute"],
  ["docs", "document", "dokument", "documents"],
  ["sheets", "spreadsheet", "regneark"],
  ["code", "coding", "developer", "dev", "programming"],
  [
    "image",
    "images",
    "photo",
    "photos",
    "billede",
    "billeder",
    "graphic",
    "graphics",
  ],
  ["pdf"],
  ["merge", "sammenføj", "sammenfoj", "combine"],
  ["split", "opdel", "divide"],
  ["compress", "komprimer", "komprimering", "optimize", "optimer"],
  ["background", "baggrund"],
  ["qr", "qrcode"],
  ["weather", "vejr", "vejrudsigt", "forecast"],
  ["job", "jobs", "career", "jobsogning", "jobsøgning"],
  ["meeting", "møde", "videomøde"],
  ["parcel", "pakke", "shipping", "track"],
  ["color", "colors", "farve", "farver", "palette"],
  ["encyclopedia", "wiki", "leksikon", "opslag"],
  ["free", "gratis", "costless"],
  ["privacy", "private", "privatliv", "privat"],
  ["security", "sikkerhed"],
  ["news", "nyheder"],
];

const EXPANSION = new Map<string, readonly string[]>();

for (const group of SYNONYM_GROUPS) {
  const normalized = group.map(normalize);
  for (const token of normalized) {
    const existing = EXPANSION.get(token) ?? [];
    const merged = Array.from(new Set([...existing, ...normalized]));
    EXPANSION.set(token, merged);
  }
}

/** All synonym forms for a token, including the token itself. */
export function expandToken(token: string): string[] {
  const key = normalize(token);
  return EXPANSION.get(key) ? [...EXPANSION.get(key)!] : [key];
}

/** Unique expanded token set for a list of query tokens. */
export function expandTokens(tokens: string[]): string[] {
  const out = new Set<string>();
  for (const token of tokens) {
    for (const item of expandToken(token)) out.add(item);
  }
  return Array.from(out);
}
