export type RegionId =
  | "europe"
  | "africa"
  | "asia"
  | "north-america"
  | "south-america"
  | "oceania";

export type Country = {
  id: string;
  nameDa: string;
  nameEn: string;
  capitalDa: string;
  capitalEn: string;
  region: RegionId;
  currency: string;
  /** Rough population band label keys */
  popBand: "lt10" | "10to50" | "50to100" | "100to300" | "gt300";
  tzNoteDa: string;
  tzNoteEn: string;
  /** Schematic equirectangular-ish 0–100 */
  mx: number;
  my: number;
};

export const REGIONS: { id: RegionId | "all"; nameDa: string; nameEn: string }[] = [
  { id: "all", nameDa: "Alle regioner", nameEn: "All regions" },
  { id: "europe", nameDa: "Europa", nameEn: "Europe" },
  { id: "africa", nameDa: "Afrika", nameEn: "Africa" },
  { id: "asia", nameDa: "Asien", nameEn: "Asia" },
  { id: "north-america", nameDa: "Nordamerika", nameEn: "North America" },
  { id: "south-america", nameDa: "Sydamerika", nameEn: "South America" },
  { id: "oceania", nameDa: "Oceanien", nameEn: "Oceania" },
];

export const COUNTRIES: Country[] = [
  // Europe
  { id: "dk", nameDa: "Danmark", nameEn: "Denmark", capitalDa: "København", capitalEn: "Copenhagen", region: "europe", currency: "DKK", popBand: "lt10", tzNoteDa: "CET / CEST (UTC+1/+2).", tzNoteEn: "CET / CEST (UTC+1/+2).", mx: 50, my: 28 },
  { id: "no", nameDa: "Norge", nameEn: "Norway", capitalDa: "Oslo", capitalEn: "Oslo", region: "europe", currency: "NOK", popBand: "lt10", tzNoteDa: "CET / CEST.", tzNoteEn: "CET / CEST.", mx: 51, my: 22 },
  { id: "se", nameDa: "Sverige", nameEn: "Sweden", capitalDa: "Stockholm", capitalEn: "Stockholm", region: "europe", currency: "SEK", popBand: "10to50", tzNoteDa: "CET / CEST.", tzNoteEn: "CET / CEST.", mx: 52, my: 24 },
  { id: "fi", nameDa: "Finland", nameEn: "Finland", capitalDa: "Helsinki", capitalEn: "Helsinki", region: "europe", currency: "EUR", popBand: "lt10", tzNoteDa: "EET / EEST (UTC+2/+3).", tzNoteEn: "EET / EEST (UTC+2/+3).", mx: 55, my: 22 },
  { id: "is", nameDa: "Island", nameEn: "Iceland", capitalDa: "Reykjavik", capitalEn: "Reykjavík", region: "europe", currency: "ISK", popBand: "lt10", tzNoteDa: "UTC året rundt.", tzNoteEn: "UTC year-round.", mx: 42, my: 22 },
  { id: "gb", nameDa: "Storbritannien", nameEn: "United Kingdom", capitalDa: "London", capitalEn: "London", region: "europe", currency: "GBP", popBand: "50to100", tzNoteDa: "GMT / BST.", tzNoteEn: "GMT / BST.", mx: 47, my: 30 },
  { id: "ie", nameDa: "Irland", nameEn: "Ireland", capitalDa: "Dublin", capitalEn: "Dublin", region: "europe", currency: "EUR", popBand: "lt10", tzNoteDa: "GMT / IST.", tzNoteEn: "GMT / IST.", mx: 45, my: 30 },
  { id: "fr", nameDa: "Frankrig", nameEn: "France", capitalDa: "Paris", capitalEn: "Paris", region: "europe", currency: "EUR", popBand: "50to100", tzNoteDa: "CET / CEST.", tzNoteEn: "CET / CEST.", mx: 48, my: 34 },
  { id: "de", nameDa: "Tyskland", nameEn: "Germany", capitalDa: "Berlin", capitalEn: "Berlin", region: "europe", currency: "EUR", popBand: "50to100", tzNoteDa: "CET / CEST.", tzNoteEn: "CET / CEST.", mx: 51, my: 32 },
  { id: "nl", nameDa: "Nederlandene", nameEn: "Netherlands", capitalDa: "Amsterdam", capitalEn: "Amsterdam", region: "europe", currency: "EUR", popBand: "10to50", tzNoteDa: "CET / CEST.", tzNoteEn: "CET / CEST.", mx: 49.5, my: 30 },
  { id: "be", nameDa: "Belgien", nameEn: "Belgium", capitalDa: "Bruxelles", capitalEn: "Brussels", region: "europe", currency: "EUR", popBand: "10to50", tzNoteDa: "CET / CEST.", tzNoteEn: "CET / CEST.", mx: 49, my: 31 },
  { id: "es", nameDa: "Spanien", nameEn: "Spain", capitalDa: "Madrid", capitalEn: "Madrid", region: "europe", currency: "EUR", popBand: "50to100", tzNoteDa: "CET / CEST (Kanarieøerne UTC+0/+1).", tzNoteEn: "CET / CEST (Canaries UTC+0/+1).", mx: 46, my: 38 },
  { id: "pt", nameDa: "Portugal", nameEn: "Portugal", capitalDa: "Lissabon", capitalEn: "Lisbon", region: "europe", currency: "EUR", popBand: "10to50", tzNoteDa: "WET / WEST (UTC+0/+1).", tzNoteEn: "WET / WEST (UTC+0/+1).", mx: 44, my: 38 },
  { id: "it", nameDa: "Italien", nameEn: "Italy", capitalDa: "Rom", capitalEn: "Rome", region: "europe", currency: "EUR", popBand: "50to100", tzNoteDa: "CET / CEST.", tzNoteEn: "CET / CEST.", mx: 51, my: 38 },
  { id: "pl", nameDa: "Polen", nameEn: "Poland", capitalDa: "Warszawa", capitalEn: "Warsaw", region: "europe", currency: "PLN", popBand: "10to50", tzNoteDa: "CET / CEST.", tzNoteEn: "CET / CEST.", mx: 53, my: 30 },
  { id: "ua", nameDa: "Ukraine", nameEn: "Ukraine", capitalDa: "Kyiv", capitalEn: "Kyiv", region: "europe", currency: "UAH", popBand: "50to100", tzNoteDa: "EET / EEST.", tzNoteEn: "EET / EEST.", mx: 56, my: 32 },
  { id: "gr", nameDa: "Grækenland", nameEn: "Greece", capitalDa: "Athen", capitalEn: "Athens", region: "europe", currency: "EUR", popBand: "10to50", tzNoteDa: "EET / EEST.", tzNoteEn: "EET / EEST.", mx: 54, my: 40 },
  { id: "ch", nameDa: "Schweiz", nameEn: "Switzerland", capitalDa: "Bern", capitalEn: "Bern", region: "europe", currency: "CHF", popBand: "lt10", tzNoteDa: "CET / CEST.", tzNoteEn: "CET / CEST.", mx: 50, my: 34 },
  { id: "at", nameDa: "Østrig", nameEn: "Austria", capitalDa: "Wien", capitalEn: "Vienna", region: "europe", currency: "EUR", popBand: "lt10", tzNoteDa: "CET / CEST.", tzNoteEn: "CET / CEST.", mx: 52, my: 34 },
  { id: "cz", nameDa: "Tjekkiet", nameEn: "Czechia", capitalDa: "Prag", capitalEn: "Prague", region: "europe", currency: "CZK", popBand: "10to50", tzNoteDa: "CET / CEST.", tzNoteEn: "CET / CEST.", mx: 52, my: 32 },
  { id: "ro", nameDa: "Rumænien", nameEn: "Romania", capitalDa: "Bukarest", capitalEn: "Bucharest", region: "europe", currency: "RON", popBand: "10to50", tzNoteDa: "EET / EEST.", tzNoteEn: "EET / EEST.", mx: 55, my: 36 },
  { id: "ru", nameDa: "Rusland", nameEn: "Russia", capitalDa: "Moskva", capitalEn: "Moscow", region: "europe", currency: "RUB", popBand: "100to300", tzNoteDa: "Mange zoner fra UTC+2 til UTC+12.", tzNoteEn: "Many zones from UTC+2 to UTC+12.", mx: 65, my: 24 },

  // Africa
  { id: "eg", nameDa: "Egypten", nameEn: "Egypt", capitalDa: "Kairo", capitalEn: "Cairo", region: "africa", currency: "EGP", popBand: "100to300", tzNoteDa: "EET (UTC+2).", tzNoteEn: "EET (UTC+2).", mx: 55, my: 44 },
  { id: "ma", nameDa: "Marokko", nameEn: "Morocco", capitalDa: "Rabat", capitalEn: "Rabat", region: "africa", currency: "MAD", popBand: "50to100", tzNoteDa: "UTC+1 det meste af året.", tzNoteEn: "UTC+1 most of the year.", mx: 46, my: 42 },
  { id: "ng", nameDa: "Nigeria", nameEn: "Nigeria", capitalDa: "Abuja", capitalEn: "Abuja", region: "africa", currency: "NGN", popBand: "100to300", tzNoteDa: "WAT (UTC+1).", tzNoteEn: "WAT (UTC+1).", mx: 50, my: 52 },
  { id: "za", nameDa: "Sydafrika", nameEn: "South Africa", capitalDa: "Pretoria", capitalEn: "Pretoria", region: "africa", currency: "ZAR", popBand: "50to100", tzNoteDa: "SAST (UTC+2).", tzNoteEn: "SAST (UTC+2).", mx: 54, my: 72 },
  { id: "ke", nameDa: "Kenya", nameEn: "Kenya", capitalDa: "Nairobi", capitalEn: "Nairobi", region: "africa", currency: "KES", popBand: "50to100", tzNoteDa: "EAT (UTC+3).", tzNoteEn: "EAT (UTC+3).", mx: 58, my: 56 },
  { id: "et", nameDa: "Etiopien", nameEn: "Ethiopia", capitalDa: "Addis Abeba", capitalEn: "Addis Ababa", region: "africa", currency: "ETB", popBand: "100to300", tzNoteDa: "EAT (UTC+3).", tzNoteEn: "EAT (UTC+3).", mx: 58, my: 52 },
  { id: "gh", nameDa: "Ghana", nameEn: "Ghana", capitalDa: "Accra", capitalEn: "Accra", region: "africa", currency: "GHS", popBand: "10to50", tzNoteDa: "GMT (UTC+0).", tzNoteEn: "GMT (UTC+0).", mx: 47, my: 52 },
  { id: "tz", nameDa: "Tanzania", nameEn: "Tanzania", capitalDa: "Dodoma", capitalEn: "Dodoma", region: "africa", currency: "TZS", popBand: "50to100", tzNoteDa: "EAT (UTC+3).", tzNoteEn: "EAT (UTC+3).", mx: 57, my: 60 },

  // Asia
  { id: "tr", nameDa: "Tyrkiet", nameEn: "Turkey", capitalDa: "Ankara", capitalEn: "Ankara", region: "asia", currency: "TRY", popBand: "50to100", tzNoteDa: "TRT (UTC+3).", tzNoteEn: "TRT (UTC+3).", mx: 56, my: 38 },
  { id: "sa", nameDa: "Saudi-Arabien", nameEn: "Saudi Arabia", capitalDa: "Riyadh", capitalEn: "Riyadh", region: "asia", currency: "SAR", popBand: "50to100", tzNoteDa: "AST (UTC+3).", tzNoteEn: "AST (UTC+3).", mx: 58, my: 46 },
  { id: "ae", nameDa: "Forenede Arabiske Emirater", nameEn: "United Arab Emirates", capitalDa: "Abu Dhabi", capitalEn: "Abu Dhabi", region: "asia", currency: "AED", popBand: "10to50", tzNoteDa: "GST (UTC+4).", tzNoteEn: "GST (UTC+4).", mx: 60, my: 46 },
  { id: "in", nameDa: "Indien", nameEn: "India", capitalDa: "New Delhi", capitalEn: "New Delhi", region: "asia", currency: "INR", popBand: "gt300", tzNoteDa: "IST (UTC+5:30) for hele landet.", tzNoteEn: "IST (UTC+5:30) nationwide.", mx: 68, my: 48 },
  { id: "cn", nameDa: "Kina", nameEn: "China", capitalDa: "Beijing", capitalEn: "Beijing", region: "asia", currency: "CNY", popBand: "gt300", tzNoteDa: "Én officiel zone: CST (UTC+8).", tzNoteEn: "One official zone: CST (UTC+8).", mx: 78, my: 38 },
  { id: "jp", nameDa: "Japan", nameEn: "Japan", capitalDa: "Tokyo", capitalEn: "Tokyo", region: "asia", currency: "JPY", popBand: "100to300", tzNoteDa: "JST (UTC+9).", tzNoteEn: "JST (UTC+9).", mx: 86, my: 38 },
  { id: "kr", nameDa: "Sydkorea", nameEn: "South Korea", capitalDa: "Seoul", capitalEn: "Seoul", region: "asia", currency: "KRW", popBand: "50to100", tzNoteDa: "KST (UTC+9).", tzNoteEn: "KST (UTC+9).", mx: 84, my: 36 },
  { id: "id", nameDa: "Indonesien", nameEn: "Indonesia", capitalDa: "Jakarta", capitalEn: "Jakarta", region: "asia", currency: "IDR", popBand: "100to300", tzNoteDa: "Tre zoner: UTC+7 til UTC+9.", tzNoteEn: "Three zones: UTC+7 to UTC+9.", mx: 80, my: 58 },
  { id: "th", nameDa: "Thailand", nameEn: "Thailand", capitalDa: "Bangkok", capitalEn: "Bangkok", region: "asia", currency: "THB", popBand: "50to100", tzNoteDa: "ICT (UTC+7).", tzNoteEn: "ICT (UTC+7).", mx: 76, my: 50 },
  { id: "vn", nameDa: "Vietnam", nameEn: "Vietnam", capitalDa: "Hanoi", capitalEn: "Hanoi", region: "asia", currency: "VND", popBand: "100to300", tzNoteDa: "ICT (UTC+7).", tzNoteEn: "ICT (UTC+7).", mx: 78, my: 48 },
  { id: "ph", nameDa: "Filippinerne", nameEn: "Philippines", capitalDa: "Manila", capitalEn: "Manila", region: "asia", currency: "PHP", popBand: "100to300", tzNoteDa: "PHT (UTC+8).", tzNoteEn: "PHT (UTC+8).", mx: 84, my: 52 },
  { id: "pk", nameDa: "Pakistan", nameEn: "Pakistan", capitalDa: "Islamabad", capitalEn: "Islamabad", region: "asia", currency: "PKR", popBand: "100to300", tzNoteDa: "PKT (UTC+5).", tzNoteEn: "PKT (UTC+5).", mx: 65, my: 44 },
  { id: "bd", nameDa: "Bangladesh", nameEn: "Bangladesh", capitalDa: "Dhaka", capitalEn: "Dhaka", region: "asia", currency: "BDT", popBand: "100to300", tzNoteDa: "BST (UTC+6).", tzNoteEn: "BST (UTC+6).", mx: 72, my: 46 },
  { id: "sg", nameDa: "Singapore", nameEn: "Singapore", capitalDa: "Singapore", capitalEn: "Singapore", region: "asia", currency: "SGD", popBand: "lt10", tzNoteDa: "SGT (UTC+8).", tzNoteEn: "SGT (UTC+8).", mx: 78, my: 56 },
  { id: "il", nameDa: "Israel", nameEn: "Israel", capitalDa: "Jerusalem", capitalEn: "Jerusalem", region: "asia", currency: "ILS", popBand: "10to50", tzNoteDa: "IST / IDT (UTC+2/+3).", tzNoteEn: "IST / IDT (UTC+2/+3).", mx: 56, my: 42 },

  // North America
  { id: "us", nameDa: "USA", nameEn: "United States", capitalDa: "Washington, D.C.", capitalEn: "Washington, D.C.", region: "north-america", currency: "USD", popBand: "100to300", tzNoteDa: "Flere zoner fra UTC−10 til UTC−4 (ekskl. territorier).", tzNoteEn: "Several zones from UTC−10 to UTC−4 (excl. territories).", mx: 22, my: 36 },
  { id: "ca", nameDa: "Canada", nameEn: "Canada", capitalDa: "Ottawa", capitalEn: "Ottawa", region: "north-america", currency: "CAD", popBand: "50to100", tzNoteDa: "Seks hovedzoner fra UTC−8 til UTC−3:30.", tzNoteEn: "Six main zones from UTC−8 to UTC−3:30.", mx: 22, my: 26 },
  { id: "mx", nameDa: "Mexico", nameEn: "Mexico", capitalDa: "Mexico City", capitalEn: "Mexico City", region: "north-america", currency: "MXN", popBand: "100to300", tzNoteDa: "Flere zoner, mest UTC−6.", tzNoteEn: "Several zones, mostly UTC−6.", mx: 18, my: 46 },
  { id: "cu", nameDa: "Cuba", nameEn: "Cuba", capitalDa: "Havana", capitalEn: "Havana", region: "north-america", currency: "CUP", popBand: "10to50", tzNoteDa: "CST / CDT (UTC−5/−4).", tzNoteEn: "CST / CDT (UTC−5/−4).", mx: 28, my: 44 },

  // South America
  { id: "br", nameDa: "Brasilien", nameEn: "Brazil", capitalDa: "Brasília", capitalEn: "Brasília", region: "south-america", currency: "BRL", popBand: "100to300", tzNoteDa: "Flere zoner, mest UTC−3.", tzNoteEn: "Several zones, mostly UTC−3.", mx: 34, my: 60 },
  { id: "ar", nameDa: "Argentina", nameEn: "Argentina", capitalDa: "Buenos Aires", capitalEn: "Buenos Aires", region: "south-america", currency: "ARS", popBand: "50to100", tzNoteDa: "ART (UTC−3).", tzNoteEn: "ART (UTC−3).", mx: 32, my: 72 },
  { id: "cl", nameDa: "Chile", nameEn: "Chile", capitalDa: "Santiago", capitalEn: "Santiago", region: "south-america", currency: "CLP", popBand: "10to50", tzNoteDa: "CLT / CLST (UTC−4/−3); Påskeøen andet.", tzNoteEn: "CLT / CLST (UTC−4/−3); Easter Island differs.", mx: 28, my: 70 },
  { id: "co", nameDa: "Colombia", nameEn: "Colombia", capitalDa: "Bogotá", capitalEn: "Bogotá", region: "south-america", currency: "COP", popBand: "50to100", tzNoteDa: "COT (UTC−5).", tzNoteEn: "COT (UTC−5).", mx: 28, my: 54 },
  { id: "pe", nameDa: "Peru", nameEn: "Peru", capitalDa: "Lima", capitalEn: "Lima", region: "south-america", currency: "PEN", popBand: "50to100", tzNoteDa: "PET (UTC−5).", tzNoteEn: "PET (UTC−5).", mx: 28, my: 60 },

  // Oceania
  { id: "au", nameDa: "Australien", nameEn: "Australia", capitalDa: "Canberra", capitalEn: "Canberra", region: "oceania", currency: "AUD", popBand: "10to50", tzNoteDa: "Flere zoner, inkl. halv-timers forskydninger.", tzNoteEn: "Several zones, including half-hour offsets.", mx: 84, my: 70 },
  { id: "nz", nameDa: "New Zealand", nameEn: "New Zealand", capitalDa: "Wellington", capitalEn: "Wellington", region: "oceania", currency: "NZD", popBand: "lt10", tzNoteDa: "NZST / NZDT (UTC+12/+13).", tzNoteEn: "NZST / NZDT (UTC+12/+13).", mx: 92, my: 76 },
  { id: "pg", nameDa: "Papua Ny Guinea", nameEn: "Papua New Guinea", capitalDa: "Port Moresby", capitalEn: "Port Moresby", region: "oceania", currency: "PGK", popBand: "10to50", tzNoteDa: "PGT (UTC+10).", tzNoteEn: "PGT (UTC+10).", mx: 88, my: 58 },
  { id: "fj", nameDa: "Fiji", nameEn: "Fiji", capitalDa: "Suva", capitalEn: "Suva", region: "oceania", currency: "FJD", popBand: "lt10", tzNoteDa: "FJT (UTC+12).", tzNoteEn: "FJT (UTC+12).", mx: 94, my: 62 },
];

export function popBandLabel(band: Country["popBand"], da: boolean): string {
  switch (band) {
    case "lt10":
      return da ? "Under 10 millioner" : "Under 10 million";
    case "10to50":
      return da ? "Ca. 10 til 50 millioner" : "About 10 to 50 million";
    case "50to100":
      return da ? "Ca. 50 til 100 millioner" : "About 50 to 100 million";
    case "100to300":
      return da ? "Ca. 100 til 300 millioner" : "About 100 to 300 million";
    case "gt300":
      return da ? "Over 300 millioner" : "Over 300 million";
  }
}

export function regionLabel(id: RegionId, da: boolean): string {
  const row = REGIONS.find((r) => r.id === id);
  return da ? row?.nameDa ?? id : row?.nameEn ?? id;
}

export function matchesCountry(c: Country, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    c.nameDa.toLowerCase().includes(q) ||
    c.nameEn.toLowerCase().includes(q) ||
    c.capitalDa.toLowerCase().includes(q) ||
    c.capitalEn.toLowerCase().includes(q) ||
    c.currency.toLowerCase().includes(q) ||
    c.id.toLowerCase() === q
  );
}
