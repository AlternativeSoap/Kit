export type CurrencyOption = {
  code: string;
  nameEn: string;
  nameDa: string;
};

/** Common ISO 4217 currencies for the quick converter. */
export const CURRENCIES: CurrencyOption[] = [
  { code: "DKK", nameEn: "Danish krone", nameDa: "Dansk krone" },
  { code: "EUR", nameEn: "Euro", nameDa: "Euro" },
  { code: "USD", nameEn: "US dollar", nameDa: "Amerikansk dollar" },
  { code: "GBP", nameEn: "Pound sterling", nameDa: "Britisk pund" },
  { code: "SEK", nameEn: "Swedish krona", nameDa: "Svensk krone" },
  { code: "NOK", nameEn: "Norwegian krone", nameDa: "Norsk krone" },
  { code: "CHF", nameEn: "Swiss franc", nameDa: "Schweizisk franc" },
  { code: "JPY", nameEn: "Japanese yen", nameDa: "Japansk yen" },
  { code: "CNY", nameEn: "Chinese yuan", nameDa: "Kinesisk yuan" },
  { code: "CAD", nameEn: "Canadian dollar", nameDa: "Canadisk dollar" },
  { code: "AUD", nameEn: "Australian dollar", nameDa: "Australsk dollar" },
  { code: "NZD", nameEn: "New Zealand dollar", nameDa: "Newzealandsk dollar" },
  { code: "PLN", nameEn: "Polish zloty", nameDa: "Polsk zloty" },
  { code: "CZK", nameEn: "Czech koruna", nameDa: "Tjekkisk koruna" },
  { code: "HUF", nameEn: "Hungarian forint", nameDa: "Ungarsk forint" },
  { code: "RON", nameEn: "Romanian leu", nameDa: "Rumænsk leu" },
  { code: "BGN", nameEn: "Bulgarian lev", nameDa: "Bulgarsk lev" },
  { code: "ISK", nameEn: "Icelandic krona", nameDa: "Islandsk krone" },
  { code: "TRY", nameEn: "Turkish lira", nameDa: "Tyrkisk lira" },
  { code: "INR", nameEn: "Indian rupee", nameDa: "Indisk rupee" },
  { code: "KRW", nameEn: "South Korean won", nameDa: "Sydkoreansk won" },
  { code: "SGD", nameEn: "Singapore dollar", nameDa: "Singaporeansk dollar" },
  { code: "HKD", nameEn: "Hong Kong dollar", nameDa: "Hongkong-dollar" },
  { code: "TWD", nameEn: "New Taiwan dollar", nameDa: "Taiwansk dollar" },
  { code: "THB", nameEn: "Thai baht", nameDa: "Thailandsk baht" },
  { code: "MYR", nameEn: "Malaysian ringgit", nameDa: "Malaysisk ringgit" },
  { code: "IDR", nameEn: "Indonesian rupiah", nameDa: "Indonesisk rupiah" },
  { code: "PHP", nameEn: "Philippine peso", nameDa: "Filippinsk peso" },
  { code: "VND", nameEn: "Vietnamese dong", nameDa: "Vietnamesisk dong" },
  { code: "AED", nameEn: "UAE dirham", nameDa: "VAE-dirham" },
  { code: "SAR", nameEn: "Saudi riyal", nameDa: "Saudiarabisk riyal" },
  { code: "ILS", nameEn: "Israeli new shekel", nameDa: "Israelsk shekel" },
  { code: "ZAR", nameEn: "South African rand", nameDa: "Sydafrikansk rand" },
  { code: "EGP", nameEn: "Egyptian pound", nameDa: "Egyptisk pund" },
  { code: "NGN", nameEn: "Nigerian naira", nameDa: "Nigeriansk naira" },
  { code: "KES", nameEn: "Kenyan shilling", nameDa: "Kenyansk shilling" },
  { code: "BRL", nameEn: "Brazilian real", nameDa: "Brasiliansk real" },
  { code: "MXN", nameEn: "Mexican peso", nameDa: "Mexicansk peso" },
  { code: "ARS", nameEn: "Argentine peso", nameDa: "Argentinsk peso" },
  { code: "CLP", nameEn: "Chilean peso", nameDa: "Chilensk peso" },
  { code: "COP", nameEn: "Colombian peso", nameDa: "Colombiansk peso" },
  { code: "PEN", nameEn: "Peruvian sol", nameDa: "Peruviansk sol" },
  { code: "RUB", nameEn: "Russian ruble", nameDa: "Russisk rubel" },
  { code: "UAH", nameEn: "Ukrainian hryvnia", nameDa: "Ukrainsk hryvnia" },
  { code: "PKR", nameEn: "Pakistani rupee", nameDa: "Pakistansk rupee" },
  { code: "BDT", nameEn: "Bangladeshi taka", nameDa: "Bangladeshisk taka" },
  { code: "LKR", nameEn: "Sri Lankan rupee", nameDa: "Srilankansk rupee" },
  { code: "MAD", nameEn: "Moroccan dirham", nameDa: "Marokkansk dirham" },
  { code: "TND", nameEn: "Tunisian dinar", nameDa: "Tunesisk dinar" },
  { code: "QAR", nameEn: "Qatari riyal", nameDa: "Qatarsk riyal" },
  { code: "KWD", nameEn: "Kuwaiti dinar", nameDa: "Kuwaitisk dinar" },
  { code: "BHD", nameEn: "Bahraini dinar", nameDa: "Bahrainsk dinar" },
  { code: "OMR", nameEn: "Omani rial", nameDa: "Omansk rial" },
  { code: "JOD", nameEn: "Jordanian dinar", nameDa: "Jordansk dinar" },
  { code: "XOF", nameEn: "West African CFA franc", nameDa: "Vestafrikansk CFA-franc" },
  { code: "XAF", nameEn: "Central African CFA franc", nameDa: "Centralafrikansk CFA-franc" },
  { code: "XCD", nameEn: "East Caribbean dollar", nameDa: "Østcaribisk dollar" },
  { code: "BTC", nameEn: "Bitcoin", nameDa: "Bitcoin" },
];

function normalize(query: string) {
  return query
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function filterCurrencies(
  query: string,
  locale: "da" | "en",
): CurrencyOption[] {
  const q = normalize(query);
  if (!q) return CURRENCIES;
  const scored = CURRENCIES.map((c) => {
    const code = c.code.toLowerCase();
    const name = normalize(locale === "da" ? c.nameDa : c.nameEn);
    let score = 0;
    if (code === q) score = 100;
    else if (code.startsWith(q)) score = 80;
    else if (code.includes(q)) score = 50;
    else if (name.startsWith(q)) score = 40;
    else if (name.includes(q)) score = 20;
    return { c, score };
  }).filter((row) => row.score > 0);
  scored.sort(
    (a, b) => b.score - a.score || a.c.code.localeCompare(b.c.code),
  );
  return scored.map((row) => row.c);
}

export function resolveCurrencyCode(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!cleaned) return "";
  const exact = CURRENCIES.find((c) => c.code === cleaned);
  if (exact) return exact.code;
  const hits = filterCurrencies(cleaned, "en");
  if (hits.length === 1) return hits[0]!.code;
  if (hits[0] && hits[0].code.startsWith(cleaned)) return hits[0].code;
  return cleaned.slice(0, 8);
}
