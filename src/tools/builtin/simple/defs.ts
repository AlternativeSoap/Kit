/** Compact definitions for high-demand utility builtins. */

import { EXTRA_SIMPLE_TOOL_DEFS } from "./defs-extra";

export type SimpleField = {
  key: string;
  labelEn: string;
  labelDa: string;
  hintEn?: string;
  hintDa?: string;
  defaultValue?: string;
  multiline?: boolean;
  kind?: "number" | "text" | "select" | "password";
  options?: { value: string; labelEn: string; labelDa: string }[];
};

export type SimpleResultRow = {
  labelEn: string;
  labelDa: string;
  value: string;
  /** Optional localized display for non-numeric human text. */
  valueDa?: string;
  /**
   * Format whole numbers with locale separators too. Rows of finance tools do
   * this by default; decimals are always formatted.
   */
  numeric?: boolean;
  /** Exclude this row from “Copy all” (e.g. secrets). */
  omitFromCopyAll?: boolean;
};

export type SimpleToolDef = {
  id: string;
  nameEn: string;
  nameDa: string;
  descriptionEn: string;
  descriptionDa: string;
  aliases: string[];
  intents: string[];
  tags: string[];
  popularity: number;
  fields: SimpleField[];
  /** When true, results can change without field edits (random tools). */
  volatile?: boolean;
  actionEn?: string;
  actionDa?: string;
  compute: (values: Record<string, string>) => SimpleResultRow[] | null;
};

function num(v: string | undefined): number | undefined {
  if (v === undefined || !v.trim()) return undefined;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function round(n: number, d = 4): string {
  const f = 10 ** d;
  return String(Math.round(n * f) / f);
}

function isoDateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function moneyRow(
  labelEn: string,
  labelDa: string,
  value: string,
): SimpleResultRow {
  return { labelEn, labelDa, value, numeric: true };
}

/** Inclusive integer in [min, max] without modulo bias. */
function randomInt(min: number, max: number): number {
  const span = max - min + 1;
  if (span <= 0) return min;
  if (span > 0x100000000) throw new RangeError("Range too large");
  const maxUnbiased = Math.floor(0x100000000 / span) * span;
  const buf = new Uint32Array(1);
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0]!;
  } while (x >= maxUnbiased);
  return min + (x % span);
}

export const SIMPLE_TOOL_DEFS: SimpleToolDef[] = [
  {
    id: "discount",
    nameEn: "Discount calculator",
    nameDa: "Rabatberegner",
    descriptionEn: "Sale price and savings from an original price and discount percent.",
    descriptionDa: "Salgspris og besparelse ud fra pris og rabatprocent.",
    aliases: ["discount", "sale", "markdown", "rabat", "tilbud"],
    intents: ["discount", "sale", "rabat"],
    tags: ["finance"],
    popularity: 88,
    fields: [
      { key: "price", labelEn: "Original price", labelDa: "Oprindelig pris", defaultValue: "100" },
      { key: "percent", labelEn: "Discount (%)", labelDa: "Rabat (%)", defaultValue: "20" },
    ],
    compute: (v) => {
      const price = num(v.price);
      const percent = num(v.percent);
      if (price === undefined || percent === undefined || price < 0 || percent < 0) return null;
      const save = price * (percent / 100);
      return [
        { labelEn: "Sale price", labelDa: "Salgspris", value: round(price - save, 2) },
        { labelEn: "You save", labelDa: "Du sparer", value: round(save, 2) },
      ];
    },
  },
  {
    id: "roi",
    nameEn: "ROI calculator",
    nameDa: "ROI-beregner",
    descriptionEn: "Return on investment from cost and gain.",
    descriptionDa: "Afkast af investering ud fra omkostning og gevinst.",
    aliases: ["roi", "return on investment", "afkast"],
    intents: ["roi", "invest", "afkast"],
    tags: ["finance"],
    popularity: 82,
    fields: [
      { key: "cost", labelEn: "Cost", labelDa: "Omkostning", defaultValue: "1000" },
      { key: "gain", labelEn: "Gain / final value", labelDa: "Gevinst / slutværdi", defaultValue: "1300" },
    ],
    compute: (v) => {
      const cost = num(v.cost);
      const gain = num(v.gain);
      if (cost === undefined || gain === undefined || cost === 0) return null;
      const profit = gain - cost;
      return [
        { labelEn: "Profit", labelDa: "Fortjeneste", value: round(profit, 2) },
        { labelEn: "ROI %", labelDa: "ROI %", value: round((profit / cost) * 100, 2) },
      ];
    },
  },
  {
    id: "salaryhourly",
    nameEn: "Salary ↔ hourly",
    nameDa: "Løn ↔ timeløn",
    descriptionEn: "Convert between annual/monthly salary and hourly wage.",
    descriptionDa: "Omregn mellem årsløn/månedsløn og timeløn.",
    aliases: ["hourly salary", "annual salary", "timeløn", "årsløn", "salary hourly"],
    intents: ["salary", "hourly", "løn"],
    tags: ["finance", "salary"],
    popularity: 86,
    fields: [
      { key: "amount", labelEn: "Amount", labelDa: "Beløb", defaultValue: "40000" },
      {
        key: "unit",
        labelEn: "Unit",
        labelDa: "Enhed",
        kind: "select",
        defaultValue: "monthly",
        options: [
          { value: "hourly", labelEn: "Hourly", labelDa: "Timeløn" },
          { value: "monthly", labelEn: "Monthly", labelDa: "Månedsløn" },
          { value: "yearly", labelEn: "Yearly", labelDa: "Årsløn" },
        ],
      },
      { key: "hours", labelEn: "Hours per week", labelDa: "Timer pr. uge", defaultValue: "37" },
    ],
    compute: (v) => {
      const amount = num(v.amount);
      const hours = num(v.hours);
      if (amount === undefined || hours === undefined || hours <= 0) return null;
      const weeks = 52;
      let yearly: number;
      if (v.unit === "hourly") yearly = amount * hours * weeks;
      else if (v.unit === "yearly") yearly = amount;
      else yearly = amount * 12;
      const monthly = yearly / 12;
      const hourly = yearly / (hours * weeks);
      return [
        { labelEn: "Hourly", labelDa: "Timeløn", value: round(hourly, 2) },
        { labelEn: "Monthly", labelDa: "Månedsløn", value: round(monthly, 2) },
        { labelEn: "Yearly", labelDa: "Årsløn", value: round(yearly, 2) },
      ];
    },
  },
  {
    id: "mortgage",
    nameEn: "Mortgage payment",
    nameDa: "Boliglån ydelse",
    descriptionEn: "Estimated fixed monthly payment for a mortgage.",
    descriptionDa: "Estimeret fast månedlig ydelse på et boliglån.",
    aliases: ["mortgage", "home loan", "boliglån", "huslån", "repayment"],
    intents: ["mortgage", "loan", "bolig"],
    tags: ["finance"],
    popularity: 90,
    fields: [
      { key: "principal", labelEn: "Loan amount", labelDa: "Lånebeløb", defaultValue: "2000000" },
      { key: "rate", labelEn: "Annual rate (%)", labelDa: "Årlig rente (%)", defaultValue: "4" },
      { key: "years", labelEn: "Years", labelDa: "År", defaultValue: "30" },
    ],
    compute: (v) => {
      const P = num(v.principal);
      const annual = num(v.rate);
      const years = num(v.years);
      if (P === undefined || annual === undefined || years === undefined || years <= 0) return null;
      const r = annual / 100 / 12;
      const n = years * 12;
      const payment = r === 0 ? P / n : (P * r * (1 + r) ** n) / ((1 + r) ** n - 1);
      return [
        { labelEn: "Monthly payment", labelDa: "Månedlig ydelse", value: round(payment, 2) },
        { labelEn: "Total paid", labelDa: "Samlet betalt", value: round(payment * n, 2) },
        { labelEn: "Total interest", labelDa: "Samlet rente", value: round(payment * n - P, 2) },
      ];
    },
  },
  {
    id: "calorie",
    nameEn: "Calorie / TDEE estimate",
    nameDa: "Kalorie / TDEE-estimat",
    descriptionEn: "Estimated daily calorie need from Mifflin–St Jeor (not medical advice).",
    descriptionDa: "Estimeret dagligt kaloriebehov (Mifflin–St Jeor). Ikke lægefagligt råd.",
    aliases: ["tdee", "bmr", "calories", "kalorier", "forbrænding"],
    intents: ["calorie", "tdee", "health"],
    tags: ["health"],
    popularity: 85,
    fields: [
      { key: "weight", labelEn: "Weight (kg)", labelDa: "Vægt (kg)", defaultValue: "70" },
      { key: "height", labelEn: "Height (cm)", labelDa: "Højde (cm)", defaultValue: "175" },
      { key: "age", labelEn: "Age", labelDa: "Alder", defaultValue: "30" },
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
      {
        key: "activity",
        labelEn: "Activity",
        labelDa: "Aktivitet",
        kind: "select",
        defaultValue: "1.55",
        options: [
          { value: "1.2", labelEn: "Sedentary", labelDa: "Stillesiddende" },
          { value: "1.375", labelEn: "Light", labelDa: "Let" },
          { value: "1.55", labelEn: "Moderate", labelDa: "Moderat" },
          { value: "1.725", labelEn: "Active", labelDa: "Aktiv" },
          { value: "1.9", labelEn: "Very active", labelDa: "Meget aktiv" },
        ],
      },
    ],
    compute: (v) => {
      const w = num(v.weight);
      const h = num(v.height);
      const age = num(v.age);
      const act = num(v.activity) ?? 1.55;
      if (w === undefined || h === undefined || age === undefined) return null;
      const bmr =
        v.sex === "female"
          ? 10 * w + 6.25 * h - 5 * age - 161
          : 10 * w + 6.25 * h - 5 * age + 5;
      return [
        { labelEn: "BMR (kcal)", labelDa: "BMR (kcal)", value: round(bmr, 0) },
        { labelEn: "TDEE (kcal)", labelDa: "TDEE (kcal)", value: round(bmr * act, 0) },
      ];
    },
  },
  {
    id: "sleep",
    nameEn: "Sleep schedule",
    nameDa: "Søvnplan",
    descriptionEn: "Suggested bedtimes from a wake time using 90-minute sleep cycles.",
    descriptionDa: "Foreslåede sengetider ud fra opvågningstid i 90-minutters cyklusser.",
    aliases: ["sleep calculator", "bedtime", "søvn", "sengetid"],
    intents: ["sleep", "søvn"],
    tags: ["health"],
    popularity: 80,
    fields: [
      { key: "wake", labelEn: "Wake time (HH:MM)", labelDa: "Op (HH:MM)", defaultValue: "07:00" },
      { key: "cycles", labelEn: "Cycles (4–6)", labelDa: "Cyklusser (4–6)", defaultValue: "5" },
    ],
    compute: (v) => {
      const m = /^(\d{1,2}):(\d{2})$/.exec(v.wake?.trim() ?? "");
      if (!m) return null;
      const preferred = Math.min(6, Math.max(4, Math.floor(num(v.cycles) ?? 5)));
      const wakeMin = Number(m[1]) * 60 + Number(m[2]);
      const fallAsleep = 15;
      const bedtime = (cycles: number) => {
        const bed = (wakeMin - fallAsleep - cycles * 90 + 24 * 60) % (24 * 60);
        const hh = String(Math.floor(bed / 60)).padStart(2, "0");
        const mm = String(bed % 60).padStart(2, "0");
        return `${hh}:${mm}`;
      };
      return [
        {
          labelEn: `Preferred (${preferred} cycles)`,
          labelDa: `Foretrukket (${preferred} cyklusser)`,
          value: bedtime(preferred),
        },
        { labelEn: "4 cycles (~6 h)", labelDa: "4 cyklusser (~6 t)", value: bedtime(4) },
        { labelEn: "5 cycles (~7.5 h)", labelDa: "5 cyklusser (~7,5 t)", value: bedtime(5) },
        { labelEn: "6 cycles (~9 h)", labelDa: "6 cyklusser (~9 t)", value: bedtime(6) },
      ];
    },
  },
  {
    id: "water",
    nameEn: "Water intake",
    nameDa: "Vandindtag",
    descriptionEn: "Rough daily water target from body weight.",
    descriptionDa: "Grov daglig vandmængde ud fra kropsvægt.",
    aliases: ["water", "hydration", "vand", "væske"],
    intents: ["water", "health", "vand"],
    tags: ["health"],
    popularity: 72,
    fields: [
      { key: "weight", labelEn: "Weight (kg)", labelDa: "Vægt (kg)", defaultValue: "70" },
    ],
    compute: (v) => {
      const w = num(v.weight);
      if (w === undefined || w <= 0) return null;
      const liters = w * 0.033;
      return [
        { labelEn: "Daily target", labelDa: "Dagligt mål", value: `${round(liters, 2)} L` },
        { labelEn: "Glasses (~250 ml)", labelDa: "Glas (~250 ml)", value: round(liters / 0.25, 0) },
      ];
    },
  },
  {
    id: "bodyfat",
    nameEn: "Body fat estimate",
    nameDa: "Fedtprocent-estimat",
    descriptionEn: "US Navy body-fat estimate from circumference measurements.",
    descriptionDa: "US Navy-estimat af fedtprocent ud fra omkredsmål.",
    aliases: ["body fat", "bf%", "fedtprocent"],
    intents: ["bodyfat", "health"],
    tags: ["health"],
    popularity: 74,
    fields: [
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
      { key: "height", labelEn: "Height (cm)", labelDa: "Højde (cm)", defaultValue: "175" },
      { key: "waist", labelEn: "Waist (cm)", labelDa: "Talje (cm)", defaultValue: "80" },
      { key: "neck", labelEn: "Neck (cm)", labelDa: "Hals (cm)", defaultValue: "38" },
      { key: "hip", labelEn: "Hip (cm, female)", labelDa: "Hofte (cm, kvinde)", defaultValue: "95" },
    ],
    compute: (v) => {
      const height = num(v.height);
      const waist = num(v.waist);
      const neck = num(v.neck);
      const hip = num(v.hip);
      if (!height || !waist || !neck) return null;
      const log10 = (x: number) => Math.log(x) / Math.LN10;
      let bf: number;
      if (v.sex === "female") {
        if (!hip) return null;
        bf =
          495 /
            (1.29579 -
              0.35004 * log10(waist + hip - neck) +
              0.221 * log10(height)) -
          450;
      } else {
        bf =
          495 /
            (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) -
          450;
      }
      return [{ labelEn: "Body fat %", labelDa: "Fedtprocent", value: round(bf, 1) }];
    },
  },
  {
    id: "numberbase",
    nameEn: "Number base converter",
    nameDa: "Talsystem-omregner",
    descriptionEn: "Convert integers between binary, octal, decimal, and hex.",
    descriptionDa: "Omregn heltal mellem binær, oktal, decimal og hex.",
    aliases: ["hex", "binary", "base converter", "binær", "hexadecimal"],
    intents: ["convert", "hex", "binary"],
    tags: ["dev"],
    popularity: 84,
    fields: [
      { key: "value", labelEn: "Value", labelDa: "Værdi", defaultValue: "255" },
      {
        key: "from",
        labelEn: "From base",
        labelDa: "Fra base",
        kind: "select",
        defaultValue: "10",
        options: [
          { value: "2", labelEn: "Binary", labelDa: "Binær" },
          { value: "8", labelEn: "Octal", labelDa: "Oktal" },
          { value: "10", labelEn: "Decimal", labelDa: "Decimal" },
          { value: "16", labelEn: "Hex", labelDa: "Hex" },
        ],
      },
    ],
    compute: (v) => {
      const from = Number(v.from) || 10;
      const n = Number.parseInt((v.value ?? "").trim(), from);
      if (!Number.isFinite(n)) return null;
      return [
        { labelEn: "Binary", labelDa: "Binær", value: n.toString(2) },
        { labelEn: "Octal", labelDa: "Oktal", value: n.toString(8) },
        { labelEn: "Decimal", labelDa: "Decimal", value: String(n) },
        { labelEn: "Hex", labelDa: "Hex", value: n.toString(16).toUpperCase() },
      ];
    },
  },
  {
    id: "htmlencode",
    nameEn: "HTML encode / decode",
    nameDa: "HTML encode / decode",
    descriptionEn: "Escape or unescape HTML entities in text.",
    descriptionDa: "Escape eller unescape HTML-entiteter i tekst.",
    aliases: ["html encode", "html entities", "escape html"],
    intents: ["html", "encode", "escape"],
    tags: ["dev", "text"],
    popularity: 78,
    fields: [
      { key: "text", labelEn: "Text", labelDa: "Tekst", multiline: true, defaultValue: "<div>" },
      {
        key: "mode",
        labelEn: "Mode",
        labelDa: "Tilstand",
        kind: "select",
        defaultValue: "encode",
        options: [
          { value: "encode", labelEn: "Encode", labelDa: "Encode" },
          { value: "decode", labelEn: "Decode", labelDa: "Decode" },
        ],
      },
    ],
    compute: (v) => {
      const text = v.text ?? "";
      if (v.mode === "decode") {
        const el =
          typeof document !== "undefined" ? document.createElement("textarea") : null;
        if (!el) {
          return [
            {
              labelEn: "Result",
              labelDa: "Resultat",
              value: text
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&")
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'"),
            },
          ];
        }
        el.innerHTML = text;
        return [{ labelEn: "Result", labelDa: "Resultat", value: el.value }];
      }
      return [
        {
          labelEn: "Result",
          labelDa: "Resultat",
          value: text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;"),
        },
      ];
    },
  },
  {
    id: "randomstring",
    nameEn: "Random string",
    nameDa: "Tilfældig streng",
    descriptionEn: "Generate a random alphanumeric string in your browser.",
    descriptionDa: "Generér en tilfældig alfanumerisk streng i browseren.",
    aliases: ["random string", "random token", "tilfældig streng"],
    intents: ["random", "generate"],
    tags: ["dev"],
    popularity: 76,
    volatile: true,
    actionEn: "Generate again",
    actionDa: "Generér igen",
    fields: [
      { key: "length", labelEn: "Length", labelDa: "Længde", defaultValue: "24" },
      {
        key: "alphabet",
        labelEn: "Alphabet",
        labelDa: "Alfabet",
        kind: "select",
        defaultValue: "alnum",
        options: [
          { value: "alnum", labelEn: "Letters + digits", labelDa: "Bogstaver + tal" },
          { value: "hex", labelEn: "Hex", labelDa: "Hex" },
          { value: "alpha", labelEn: "Letters only", labelDa: "Kun bogstaver" },
        ],
      },
    ],
    compute: (v) => {
      const len = Math.min(256, Math.max(1, Math.floor(num(v.length) ?? 24)));
      const alphabets: Record<string, string> = {
        alnum: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        hex: "0123456789abcdef",
        alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      };
      const alphabet = alphabets[v.alphabet ?? "alnum"] ?? alphabets.alnum!;
      let out = "";
      for (let i = 0; i < len; i++) out += alphabet[randomInt(0, alphabet.length - 1)];
      return [{ labelEn: "String", labelDa: "Streng", value: out }];
    },
  },
  {
    id: "csvjson",
    nameEn: "CSV ↔ JSON",
    nameDa: "CSV ↔ JSON",
    descriptionEn: "Convert simple CSV to JSON objects or flatten JSON arrays to CSV.",
    descriptionDa: "Konvertér simpel CSV til JSON eller JSON-arrays til CSV.",
    aliases: ["csv to json", "json to csv", "csv"],
    intents: ["csv", "json", "convert"],
    tags: ["dev", "data"],
    popularity: 83,
    fields: [
      {
        key: "text",
        labelEn: "Input",
        labelDa: "Input",
        multiline: true,
        defaultValue: "name,age\nAda,36\nBob,41",
      },
      {
        key: "mode",
        labelEn: "Mode",
        labelDa: "Tilstand",
        kind: "select",
        defaultValue: "toJson",
        options: [
          { value: "toJson", labelEn: "CSV → JSON", labelDa: "CSV → JSON" },
          { value: "toCsv", labelEn: "JSON → CSV", labelDa: "JSON → CSV" },
        ],
      },
    ],
    compute: (v) => {
      const text = v.text ?? "";
      try {
        if (v.mode === "toCsv") {
          const data = JSON.parse(text) as Record<string, unknown>[];
          if (!Array.isArray(data) || data.length === 0) return null;
          const keys = Object.keys(data[0]!);
          const lines = [
            keys.join(","),
            ...data.map((row) =>
              keys.map((k) => JSON.stringify(row[k] ?? "")).join(","),
            ),
          ];
          return [{ labelEn: "CSV", labelDa: "CSV", value: lines.join("\n") }];
        }
        const lines = text.trim().split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) return null;
        const headers = lines[0]!.split(",").map((h) => h.trim());
        const rows = lines.slice(1).map((line) => {
          const cols = line.split(",");
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = (cols[i] ?? "").trim();
          });
          return obj;
        });
        return [
          {
            labelEn: "JSON",
            labelDa: "JSON",
            value: JSON.stringify(rows, null, 2),
          },
        ];
      } catch {
        return null;
      }
    },
  },
  {
    id: "lorem",
    nameEn: "Lorem ipsum",
    nameDa: "Lorem ipsum",
    descriptionEn: "Generate placeholder Latin text by word count.",
    descriptionDa: "Generér pladsholdertekst efter antal ord.",
    aliases: ["lorem", "ipsum", "placeholder text", "dummy text"],
    intents: ["lorem", "placeholder"],
    tags: ["text"],
    popularity: 79,
    fields: [
      { key: "words", labelEn: "Words", labelDa: "Ord", defaultValue: "40" },
    ],
    compute: (v) => {
      const count = Math.min(500, Math.max(1, Math.floor(num(v.words) ?? 40)));
      const vocab =
        "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(
          " ",
        );
      const out: string[] = [];
      for (let i = 0; i < count; i++) out.push(vocab[i % vocab.length]!);
      out[0] = "Lorem";
      return [{ labelEn: "Text", labelDa: "Tekst", value: `${out.join(" ")}.` }];
    },
  },
  {
    id: "findreplace",
    nameEn: "Find and replace",
    nameDa: "Find og erstat",
    descriptionEn: "Replace all occurrences of a string in text.",
    descriptionDa: "Erstat alle forekomster af en streng i tekst.",
    aliases: ["find replace", "search replace", "erstat"],
    intents: ["replace", "text"],
    tags: ["text"],
    popularity: 77,
    fields: [
      { key: "text", labelEn: "Text", labelDa: "Tekst", multiline: true, defaultValue: "hello hello" },
      { key: "find", labelEn: "Find", labelDa: "Find", defaultValue: "hello" },
      { key: "replace", labelEn: "Replace with", labelDa: "Erstat med", defaultValue: "hi" },
    ],
    compute: (v) => {
      const find = v.find ?? "";
      if (!find) return null;
      const result = (v.text ?? "").split(find).join(v.replace ?? "");
      return [{ labelEn: "Result", labelDa: "Resultat", value: result }];
    },
  },
  {
    id: "readingtime",
    nameEn: "Reading time",
    nameDa: "Læsetid",
    descriptionEn: "Estimate reading time from word count.",
    descriptionDa: "Estimer læsetid ud fra antal ord.",
    aliases: ["reading time", "læsetid", "words per minute"],
    intents: ["reading", "text"],
    tags: ["text"],
    popularity: 75,
    fields: [
      { key: "text", labelEn: "Text", labelDa: "Tekst", multiline: true, defaultValue: "" },
      { key: "wpm", labelEn: "Words per minute", labelDa: "Ord pr. minut", defaultValue: "200" },
    ],
    compute: (v) => {
      const words = (v.text ?? "").trim().split(/\s+/).filter(Boolean).length;
      const wpm = num(v.wpm) || 200;
      const minutes = words / wpm;
      return [
        { labelEn: "Words", labelDa: "Ord", value: String(words) },
        { labelEn: "Minutes", labelDa: "Minutter", value: round(minutes, 1) },
      ];
    },
  },
  {
    id: "cases",
    nameEn: "Case converter",
    nameDa: "Store/små bogstaver",
    descriptionEn: "Convert text to upper, lower, title, or sentence case.",
    descriptionDa: "Konvertér tekst til store, små, title eller sentence case.",
    aliases: ["uppercase", "lowercase", "title case", "store bogstaver"],
    intents: ["case", "text"],
    tags: ["text"],
    popularity: 78,
    fields: [
      { key: "text", labelEn: "Text", labelDa: "Tekst", multiline: true, defaultValue: "Hello world" },
      {
        key: "mode",
        labelEn: "Case",
        labelDa: "Type",
        kind: "select",
        defaultValue: "upper",
        options: [
          { value: "upper", labelEn: "UPPER", labelDa: "STORE" },
          { value: "lower", labelEn: "lower", labelDa: "små" },
          { value: "title", labelEn: "Title Case", labelDa: "Title Case" },
          { value: "sentence", labelEn: "Sentence case", labelDa: "Sentence case" },
        ],
      },
    ],
    compute: (v) => {
      const text = v.text ?? "";
      let result = text;
      if (v.mode === "upper") result = text.toUpperCase();
      else if (v.mode === "lower") result = text.toLowerCase();
      else if (v.mode === "title")
        result = text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
      else
        result = text.toLowerCase().replace(/^\s*\w/, (c) => c.toUpperCase());
      return [{ labelEn: "Result", labelDa: "Resultat", value: result }];
    },
  },
  {
    id: "wordfreq",
    nameEn: "Word frequency",
    nameDa: "Ordhyppighed",
    descriptionEn: "Count how often each word appears in text.",
    descriptionDa: "Tæl hvor ofte hvert ord optræder i tekst.",
    aliases: ["word count frequency", "ordhyppighed"],
    intents: ["words", "text"],
    tags: ["text"],
    popularity: 70,
    fields: [
      { key: "text", labelEn: "Text", labelDa: "Tekst", multiline: true, defaultValue: "a b a c a" },
    ],
    compute: (v) => {
      const words = (v.text ?? "").toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
      const map = new Map<string, number>();
      for (const w of words) map.set(w, (map.get(w) ?? 0) + 1);
      const top = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
      return [
        { labelEn: "Total words", labelDa: "Antal ord", value: String(words.length) },
        {
          labelEn: "Top words",
          labelDa: "Topord",
          value: top.map(([w, c]) => `${w}: ${c}`).join("\n"),
        },
      ];
    },
  },
  {
    id: "businessdays",
    nameEn: "Business days",
    nameDa: "Hverdage",
    descriptionEn: "Count weekdays between two dates (Mon–Fri).",
    descriptionDa: "Tæl hverdage mellem to datoer (man–fre).",
    aliases: ["business days", "working days", "hverdage", "arbejdsdage"],
    intents: ["date", "business", "hverdage"],
    tags: ["time"],
    popularity: 81,
    fields: [
      { key: "start", labelEn: "Start (YYYY-MM-DD)", labelDa: "Start (ÅÅÅÅ-MM-DD)", defaultValue: "2026-01-01" },
      { key: "end", labelEn: "End (YYYY-MM-DD)", labelDa: "Slut (ÅÅÅÅ-MM-DD)", defaultValue: "2026-01-31" },
    ],
    compute: (v) => {
      const start = new Date(v.start ?? "");
      const end = new Date(v.end ?? "");
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
      let count = 0;
      const d = new Date(start);
      while (d <= end) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) count += 1;
        d.setDate(d.getDate() + 1);
      }
      return [{ labelEn: "Business days", labelDa: "Hverdage", value: String(count) }];
    },
  },
  {
    id: "timezonemeet",
    nameEn: "Meeting across timezones",
    nameDa: "Møde på tværs af tidszoner",
    descriptionEn: "Show a local time in two IANA time zones.",
    descriptionDa: "Vis et lokalt tidspunkt i to IANA-tidszoner.",
    aliases: ["timezone", "meeting planner", "tidszone", "møde"],
    intents: ["timezone", "meeting"],
    tags: ["time"],
    popularity: 82,
    fields: [
      { key: "datetime", labelEn: "Local datetime", labelDa: "Lokalt tidspunkt", defaultValue: "2026-06-15T14:00" },
      { key: "from", labelEn: "From zone", labelDa: "Fra zone", defaultValue: "Europe/Copenhagen" },
      { key: "to", labelEn: "To zone", labelDa: "Til zone", defaultValue: "America/New_York" },
    ],
    compute: (v) => {
      try {
        const date = new Date(v.datetime ?? "");
        if (Number.isNaN(date.getTime())) return null;
        const fmt = (tz: string) =>
          new Intl.DateTimeFormat("en-GB", {
            timeZone: tz,
            dateStyle: "medium",
            timeStyle: "short",
          }).format(date);
        return [
          { labelEn: "From", labelDa: "Fra", value: fmt(v.from || "UTC") },
          { labelEn: "To", labelDa: "Til", value: fmt(v.to || "UTC") },
        ];
      } catch {
        return null;
      }
    },
  },
  {
    id: "gcdlcm",
    nameEn: "GCD & LCM",
    nameDa: "Største fælles divisor & mindste fælles multiplum",
    descriptionEn: "Greatest common divisor and least common multiple of two integers.",
    descriptionDa: "Største fælles divisor og mindste fælles multiplum af to heltal.",
    aliases: ["gcd", "lcm", "greatest common divisor", "sfd", "mfm"],
    intents: ["math", "gcd"],
    tags: ["math"],
    popularity: 74,
    fields: [
      { key: "a", labelEn: "A", labelDa: "A", defaultValue: "12" },
      { key: "b", labelEn: "B", labelDa: "B", defaultValue: "18" },
    ],
    compute: (v) => {
      let a = Math.abs(Math.floor(num(v.a) ?? NaN));
      let b = Math.abs(Math.floor(num(v.b) ?? NaN));
      if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
      const a0 = a;
      const b0 = b;
      while (b) {
        const t = b;
        b = a % b;
        a = t;
      }
      const gcd = a;
      const lcm = gcd === 0 ? 0 : Math.abs(a0 * b0) / gcd;
      return [
        { labelEn: "GCD", labelDa: "SFD", value: String(gcd) },
        { labelEn: "LCM", labelDa: "MFM", value: String(lcm) },
      ];
    },
  },
  {
    id: "prime",
    nameEn: "Prime check",
    nameDa: "Primtalstjek",
    descriptionEn: "Check whether an integer is prime.",
    descriptionDa: "Tjek om et heltal er et primtal.",
    aliases: ["prime", "primtal", "is prime"],
    intents: ["math", "prime"],
    tags: ["math"],
    popularity: 70,
    fields: [{ key: "n", labelEn: "Number", labelDa: "Tal", defaultValue: "97" }],
    compute: (v) => {
      const n = Math.floor(num(v.n) ?? NaN);
      if (!Number.isFinite(n) || n < 0) return null;
      let prime = n > 1;
      for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) {
          prime = false;
          break;
        }
      }
      return [
        {
          labelEn: "Result",
          labelDa: "Resultat",
          value: prime ? "prime" : "not prime",
        },
      ];
    },
  },
  {
    id: "ratio",
    nameEn: "Ratio simplifier",
    nameDa: "Forhold-forenkler",
    descriptionEn: "Simplify a ratio A:B to lowest terms.",
    descriptionDa: "Forenkle et forhold A:B til mindste led.",
    aliases: ["ratio", "simplify ratio", "forhold"],
    intents: ["math", "ratio"],
    tags: ["math"],
    popularity: 73,
    fields: [
      { key: "a", labelEn: "A", labelDa: "A", defaultValue: "16" },
      { key: "b", labelEn: "B", labelDa: "B", defaultValue: "9" },
    ],
    compute: (v) => {
      let a = Math.abs(Math.floor(num(v.a) ?? NaN));
      let b = Math.abs(Math.floor(num(v.b) ?? NaN));
      if (!Number.isFinite(a) || !Number.isFinite(b) || a === 0 || b === 0) return null;
      const a0 = a;
      const b0 = b;
      while (b) {
        const t = b;
        b = a % b;
        a = t;
      }
      return [
        {
          labelEn: "Simplified",
          labelDa: "Forenklet",
          value: `${a0 / a}:${b0 / a}`,
        },
      ];
    },
  },
  {
    id: "pythagoras",
    nameEn: "Pythagoras",
    nameDa: "Pythagoras",
    descriptionEn: "Find the hypotenuse or a leg of a right triangle.",
    descriptionDa: "Find hypotenusen eller et ben i en retvinklet trekant.",
    aliases: ["pythagoras", "hypotenuse", "right triangle"],
    intents: ["math", "triangle"],
    tags: ["math"],
    popularity: 76,
    fields: [
      { key: "a", labelEn: "Side a", labelDa: "Side a", defaultValue: "3" },
      { key: "b", labelEn: "Side b", labelDa: "Side b", defaultValue: "4" },
      {
        key: "find",
        labelEn: "Find",
        labelDa: "Find",
        kind: "select",
        defaultValue: "c",
        options: [
          { value: "c", labelEn: "Hypotenuse c", labelDa: "Hypotenuse c" },
          { value: "a", labelEn: "Leg a (need b,c)", labelDa: "Ben a (brug b,c)" },
        ],
      },
      { key: "c", labelEn: "Side c (optional)", labelDa: "Side c (valgfri)", defaultValue: "" },
    ],
    compute: (v) => {
      const a = num(v.a);
      const b = num(v.b);
      const c = num(v.c);
      if (v.find === "a" && b !== undefined && c !== undefined && c > b) {
        return [{ labelEn: "a", labelDa: "a", value: round(Math.sqrt(c * c - b * b), 4) }];
      }
      if (a === undefined || b === undefined) return null;
      return [{ labelEn: "c", labelDa: "c", value: round(Math.sqrt(a * a + b * b), 4) }];
    },
  },
  {
    id: "area",
    nameEn: "Area calculator",
    nameDa: "Arealberegner",
    descriptionEn: "Area of rectangle, circle, or triangle.",
    descriptionDa: "Areal af rektangel, cirkel eller trekant.",
    aliases: ["area", "areal", "square meters"],
    intents: ["math", "area"],
    tags: ["math"],
    popularity: 80,
    fields: [
      {
        key: "shape",
        labelEn: "Shape",
        labelDa: "Form",
        kind: "select",
        defaultValue: "rect",
        options: [
          { value: "rect", labelEn: "Rectangle", labelDa: "Rektangel" },
          { value: "circle", labelEn: "Circle", labelDa: "Cirkel" },
          { value: "triangle", labelEn: "Triangle", labelDa: "Trekant" },
        ],
      },
      { key: "a", labelEn: "Width / base / radius", labelDa: "Bredde / grundlinje / radius", defaultValue: "10" },
      { key: "b", labelEn: "Height (rect/triangle)", labelDa: "Højde (rektangel/trekant)", defaultValue: "5" },
    ],
    compute: (v) => {
      const a = num(v.a);
      const b = num(v.b);
      if (a === undefined || a < 0) return null;
      let area = 0;
      if (v.shape === "circle") area = Math.PI * a * a;
      else if (v.shape === "triangle") {
        if (b === undefined) return null;
        area = 0.5 * a * b;
      } else {
        if (b === undefined) return null;
        area = a * b;
      }
      return [{ labelEn: "Area", labelDa: "Areal", value: round(area, 4) }];
    },
  },
  {
    id: "volume",
    nameEn: "Volume calculator",
    nameDa: "Volumenberegner",
    descriptionEn: "Volume of a box, cylinder, or sphere.",
    descriptionDa: "Volumen af kasse, cylinder eller kugle.",
    aliases: ["volume", "volumen", "cubic"],
    intents: ["math", "volume"],
    tags: ["math"],
    popularity: 78,
    fields: [
      {
        key: "shape",
        labelEn: "Shape",
        labelDa: "Form",
        kind: "select",
        defaultValue: "box",
        options: [
          { value: "box", labelEn: "Box", labelDa: "Kasse" },
          { value: "cylinder", labelEn: "Cylinder", labelDa: "Cylinder" },
          { value: "sphere", labelEn: "Sphere", labelDa: "Kugle" },
        ],
      },
      { key: "a", labelEn: "Length / radius", labelDa: "Længde / radius", defaultValue: "2" },
      { key: "b", labelEn: "Width / height", labelDa: "Bredde / højde", defaultValue: "3" },
      { key: "c", labelEn: "Height (box)", labelDa: "Højde (kasse)", defaultValue: "4" },
    ],
    compute: (v) => {
      const a = num(v.a);
      const b = num(v.b);
      const c = num(v.c);
      if (a === undefined) return null;
      let vol = 0;
      if (v.shape === "sphere") vol = (4 / 3) * Math.PI * a ** 3;
      else if (v.shape === "cylinder") {
        if (b === undefined) return null;
        vol = Math.PI * a * a * b;
      } else {
        if (b === undefined || c === undefined) return null;
        vol = a * b * c;
      }
      return [{ labelEn: "Volume", labelDa: "Volumen", value: round(vol, 4) }];
    },
  },
  {
    id: "average",
    nameEn: "Average / mean",
    nameDa: "Gennemsnit",
    descriptionEn: "Arithmetic mean of a list of numbers.",
    descriptionDa: "Aritmetisk gennemsnit af en liste tal.",
    aliases: ["average", "mean", "gennemsnit", "middel"],
    intents: ["math", "average"],
    tags: ["math"],
    popularity: 77,
    fields: [
      {
        key: "nums",
        labelEn: "Numbers (comma or space)",
        labelDa: "Tal (komma eller mellemrum)",
        defaultValue: "2, 4, 6, 8",
        multiline: true,
      },
    ],
    compute: (v) => {
      const parts = (v.nums ?? "")
        .split(/[\s,;]+/)
        .map((p) => Number(p.replace(",", ".")))
        .filter((n) => Number.isFinite(n));
      if (!parts.length) return null;
      const sum = parts.reduce((a, b) => a + b, 0);
      return [
        { labelEn: "Count", labelDa: "Antal", value: String(parts.length) },
        { labelEn: "Sum", labelDa: "Sum", value: round(sum, 4) },
        { labelEn: "Average", labelDa: "Gennemsnit", value: round(sum / parts.length, 4) },
      ];
    },
  },
  {
    id: "roman",
    nameEn: "Roman numerals",
    nameDa: "Romertal",
    descriptionEn: "Convert between Arabic numbers and Roman numerals.",
    descriptionDa: "Omregn mellem arabertal og romertal.",
    aliases: ["roman", "romertal", "roman numerals"],
    intents: ["roman", "convert"],
    tags: ["math", "text"],
    popularity: 71,
    fields: [
      { key: "value", labelEn: "Value", labelDa: "Værdi", defaultValue: "2026" },
      {
        key: "mode",
        labelEn: "Mode",
        labelDa: "Tilstand",
        kind: "select",
        defaultValue: "toRoman",
        options: [
          { value: "toRoman", labelEn: "Number → Roman", labelDa: "Tal → Romersk" },
          { value: "toArabic", labelEn: "Roman → Number", labelDa: "Romersk → Tal" },
        ],
      },
    ],
    compute: (v) => {
      const map: [number, string][] = [
        [1000, "M"],
        [900, "CM"],
        [500, "D"],
        [400, "CD"],
        [100, "C"],
        [90, "XC"],
        [50, "L"],
        [40, "XL"],
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"],
      ];
      if (v.mode === "toArabic") {
        const s = (v.value ?? "").toUpperCase().trim();
        let i = 0;
        let n = 0;
        for (const [val, sym] of map) {
          while (s.startsWith(sym, i)) {
            n += val;
            i += sym.length;
          }
        }
        if (i !== s.length) return null;
        return [{ labelEn: "Number", labelDa: "Tal", value: String(n) }];
      }
      let n = Math.floor(num(v.value) ?? NaN);
      if (!Number.isFinite(n) || n < 1 || n > 3999) return null;
      let out = "";
      for (const [val, sym] of map) {
        while (n >= val) {
          out += sym;
          n -= val;
        }
      }
      return [{ labelEn: "Roman", labelDa: "Romersk", value: out }];
    },
  },
  {
    id: "chargeable",
    nameEn: "Chargeable weight",
    nameDa: "Belastbar vægt",
    descriptionEn: "Air freight chargeable weight from dimensions and actual weight.",
    descriptionDa: "Luftfragt belastbar vægt ud fra mål og faktisk vægt.",
    aliases: ["chargeable weight", "volumetric weight", "belasting", "luftfragt"],
    intents: ["freight", "shipping", "weight"],
    tags: ["freight"],
    popularity: 84,
    fields: [
      { key: "l", labelEn: "Length (cm)", labelDa: "Længde (cm)", defaultValue: "120" },
      { key: "w", labelEn: "Width (cm)", labelDa: "Bredde (cm)", defaultValue: "80" },
      { key: "h", labelEn: "Height (cm)", labelDa: "Højde (cm)", defaultValue: "100" },
      { key: "weight", labelEn: "Actual weight (kg)", labelDa: "Faktisk vægt (kg)", defaultValue: "50" },
      { key: "div", labelEn: "Divisor", labelDa: "Divisor", defaultValue: "6000", hintEn: "Often 6000 for air.", hintDa: "Ofte 6000 for luftfragt." },
    ],
    compute: (v) => {
      const l = num(v.l);
      const w = num(v.w);
      const h = num(v.h);
      const weight = num(v.weight);
      const div = num(v.div) || 6000;
      if ([l, w, h, weight].some((x) => x === undefined || x! < 0)) return null;
      const volumetric = (l! * w! * h!) / div;
      const chargeable = Math.max(weight!, volumetric);
      return [
        { labelEn: "Volumetric kg", labelDa: "Volumen kg", value: round(volumetric, 2) },
        { labelEn: "Chargeable kg", labelDa: "Belastbar kg", value: round(chargeable, 2) },
      ];
    },
  },
  {
    id: "grade",
    nameEn: "Grade calculator",
    nameDa: "Karakterberegner",
    descriptionEn: "Weighted average grade from scores and weights.",
    descriptionDa: "Vægtet gennemsnit af karakterer og vægte.",
    aliases: ["grade", "weighted average", "karakter", "gennemsnit"],
    intents: ["grade", "school"],
    tags: ["math", "education"],
    popularity: 79,
    fields: [
      {
        key: "rows",
        labelEn: "score:weight lines",
        labelDa: "karakter:vægt linjer",
        multiline: true,
        defaultValue: "10:2\n7:1\n12:3",
        hintEn: "One score:weight per line.",
        hintDa: "Én karakter:vægt pr. linje.",
      },
    ],
    compute: (v) => {
      const lines = (v.rows ?? "").trim().split(/\r?\n/).filter(Boolean);
      let sum = 0;
      let wsum = 0;
      for (const line of lines) {
        const [s, w] = line.split(/[:;,]/).map((x) => Number(x.replace(",", ".")));
        if (!Number.isFinite(s) || !Number.isFinite(w)) return null;
        sum += s! * w!;
        wsum += w!;
      }
      if (wsum === 0) return null;
      return [{ labelEn: "Weighted average", labelDa: "Vægtet gennemsnit", value: round(sum / wsum, 2) }];
    },
  },
  {
    id: "pace",
    nameEn: "Running pace",
    nameDa: "Løbetempo",
    descriptionEn: "Pace and speed from distance and time.",
    descriptionDa: "Tempo og hastighed ud fra distance og tid.",
    aliases: ["pace", "running", "løbetempo", "min/km"],
    intents: ["pace", "running", "sport"],
    tags: ["health", "sport"],
    popularity: 78,
    fields: [
      { key: "km", labelEn: "Distance (km)", labelDa: "Distance (km)", defaultValue: "5" },
      { key: "minutes", labelEn: "Time (minutes)", labelDa: "Tid (minutter)", defaultValue: "28" },
    ],
    compute: (v) => {
      const km = num(v.km);
      const minutes = num(v.minutes);
      if (!km || !minutes || km <= 0 || minutes <= 0) return null;
      const pace = minutes / km;
      const paceMin = Math.floor(pace);
      const paceSec = Math.round((pace - paceMin) * 60);
      const kmh = km / (minutes / 60);
      return [
        {
          labelEn: "Pace",
          labelDa: "Tempo",
          value: `${paceMin}:${String(paceSec).padStart(2, "0")} /km`,
        },
        { labelEn: "Speed", labelDa: "Hastighed", value: `${round(kmh, 2)} km/h` },
      ];
    },
  },
  {
    id: "invoicesplit",
    nameEn: "Split invoice",
    nameDa: "Del regning",
    descriptionEn: "Split a total evenly or by share count.",
    descriptionDa: "Del et beløb ligeligt mellem antal personer.",
    aliases: ["split bill", "split invoice", "del regning"],
    intents: ["split", "invoice", "bill"],
    tags: ["finance"],
    popularity: 80,
    fields: [
      { key: "total", labelEn: "Total", labelDa: "Total", defaultValue: "1200" },
      { key: "people", labelEn: "People", labelDa: "Personer", defaultValue: "3" },
    ],
    compute: (v) => {
      const total = num(v.total);
      const people = Math.floor(num(v.people) ?? NaN);
      if (
        total === undefined ||
        total < 0 ||
        !Number.isFinite(people) ||
        people < 1 ||
        people > 100_000
      ) {
        return null;
      }
      // Work in whole cents so the shares always add up to the total.
      const cents = Math.round(total * 100);
      const base = Math.floor(cents / people);
      const remainder = cents - base * people;
      const money = (c: number) => (c / 100).toFixed(2);
      const sumRow: SimpleResultRow = {
        labelEn: "Sum of all shares",
        labelDa: "Sum af alle andele",
        value: money(base * people + remainder),
        numeric: true,
      };
      if (remainder === 0) {
        return [
          {
            labelEn: "Per person",
            labelDa: "Pr. person",
            value: money(base),
            numeric: true,
          },
          sumRow,
        ];
      }
      const higher = remainder === 1 ? "Payer 1" : `Payers 1–${remainder}`;
      const higherDa = remainder === 1 ? "Betaler 1" : `Betaler 1–${remainder}`;
      const rest = people - remainder;
      const lower =
        rest === 1 ? `Payer ${people}` : `Payers ${remainder + 1}–${people}`;
      const lowerDa =
        rest === 1 ? `Betaler ${people}` : `Betaler ${remainder + 1}–${people}`;
      return [
        { labelEn: higher, labelDa: higherDa, value: money(base + 1), numeric: true },
        ...(rest > 0
          ? [{ labelEn: lower, labelDa: lowerDa, value: money(base), numeric: true }]
          : []),
        sumRow,
      ];
    },
  },
  {
    id: "pomodoro",
    nameEn: "Pomodoro planner",
    nameDa: "Pomodoro-plan",
    descriptionEn: "Plan classic focus and break intervals. Use Stopwatch or Countdown to run them.",
    descriptionDa: "Planlæg klassiske fokus- og pauseintervaller. Brug Stopur eller Nedtælling til at køre dem.",
    aliases: ["pomodoro", "focus timer", "pomodor"],
    intents: ["timer", "focus", "pomodoro"],
    tags: ["time", "productivity"],
    popularity: 81,
    fields: [
      { key: "focus", labelEn: "Focus minutes", labelDa: "Fokus minutter", defaultValue: "25" },
      { key: "break", labelEn: "Break minutes", labelDa: "Pause minutter", defaultValue: "5" },
    ],
    compute: (v) => {
      const focus = num(v.focus) ?? 25;
      const br = num(v.break) ?? 5;
      return [
        { labelEn: "Focus", labelDa: "Fokus", value: `${focus} min` },
        { labelEn: "Break", labelDa: "Pause", value: `${br} min` },
        {
          labelEn: "Note",
          labelDa: "Bemærkning",
          value: "Use Stopwatch or Countdown to run the intervals live.",
          valueDa: "Brug Stopur eller Nedtælling til at køre intervallerne live.",
        },
      ];
    },
  },
  {
    id: "binary",
    nameEn: "Text ↔ binary",
    nameDa: "Tekst ↔ binær",
    descriptionEn: "Encode text to binary bits or decode binary back to text.",
    descriptionDa: "Kod tekst til binære bits eller afkod binær til tekst.",
    aliases: ["text to binary", "binary decoder", "binær tekst"],
    intents: ["binary", "encode"],
    tags: ["dev"],
    popularity: 72,
    fields: [
      { key: "text", labelEn: "Input", labelDa: "Input", multiline: true, defaultValue: "Hi" },
      {
        key: "mode",
        labelEn: "Mode",
        labelDa: "Tilstand",
        kind: "select",
        defaultValue: "toBin",
        options: [
          { value: "toBin", labelEn: "Text → binary", labelDa: "Tekst → binær" },
          { value: "toText", labelEn: "Binary → text", labelDa: "Binær → tekst" },
        ],
      },
    ],
    compute: (v) => {
      if (v.mode === "toText") {
        const bytes = (v.text ?? "")
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((b) => Number.parseInt(b, 2));
        if (bytes.some((n) => !Number.isFinite(n))) return null;
        return [
          {
            labelEn: "Text",
            labelDa: "Tekst",
            value: String.fromCharCode(...bytes),
          },
        ];
      }
      const out = [...(v.text ?? "")]
        .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
        .join(" ");
      return [{ labelEn: "Binary", labelDa: "Binær", value: out }];
    },
  },
  {
    id: "urlparse",
    nameEn: "URL parser",
    nameDa: "URL-parser",
    descriptionEn: "Split a URL into protocol, host, path, and query.",
    descriptionDa: "Opdel en URL i protokol, host, sti og query.",
    aliases: ["url parse", "parse url", "query string"],
    intents: ["url", "parse"],
    tags: ["dev"],
    popularity: 74,
    fields: [
      {
        key: "url",
        labelEn: "URL",
        labelDa: "URL",
        defaultValue: "https://example.com/path?x=1&y=2",
      },
    ],
    compute: (v) => {
      try {
        const u = new URL(v.url ?? "");
        return [
          { labelEn: "Protocol", labelDa: "Protokol", value: u.protocol },
          { labelEn: "Host", labelDa: "Host", value: u.host },
          { labelEn: "Path", labelDa: "Sti", value: u.pathname },
          { labelEn: "Query", labelDa: "Query", value: u.search || "(none)" },
          { labelEn: "Hash", labelDa: "Hash", value: u.hash || "(none)" },
        ];
      } catch {
        return null;
      }
    },
  },
  {
    id: "datasize",
    nameEn: "Data size converter",
    nameDa: "Datasize-omregner",
    descriptionEn: "Convert between B, KB, MB, GB, and TB (1024-based).",
    descriptionDa: "Omregn mellem B, KB, MB, GB og TB (1024-baseret).",
    aliases: ["mb to gb", "data size", "bytes", "kilobyte"],
    intents: ["convert", "bytes", "data"],
    tags: ["dev", "convert"],
    popularity: 80,
    fields: [
      { key: "value", labelEn: "Value", labelDa: "Værdi", defaultValue: "1" },
      {
        key: "from",
        labelEn: "From",
        labelDa: "Fra",
        kind: "select",
        defaultValue: "GB",
        options: ["B", "KB", "MB", "GB", "TB"].map((u) => ({
          value: u,
          labelEn: u,
          labelDa: u,
        })),
      },
    ],
    compute: (v) => {
      const n = num(v.value);
      if (n === undefined || n < 0) return null;
      const factors: Record<string, number> = {
        B: 1,
        KB: 1024,
        MB: 1024 ** 2,
        GB: 1024 ** 3,
        TB: 1024 ** 4,
      };
      const bytes = n * (factors[v.from ?? "MB"] ?? 1);
      return ["B", "KB", "MB", "GB", "TB"].map((u) => ({
        labelEn: u,
        labelDa: u,
        value: round(bytes / factors[u]!, 6),
      }));
    },
  },
  {
    id: "dpi",
    nameEn: "DPI / print size",
    nameDa: "DPI / printstørrelse",
    descriptionEn: "Print size in inches from pixel dimensions and DPI.",
    descriptionDa: "Printstørrelse i tommer ud fra pixelmål og DPI.",
    aliases: ["dpi", "print size", "ppi"],
    intents: ["dpi", "print", "image"],
    tags: ["image", "design"],
    popularity: 73,
    fields: [
      { key: "w", labelEn: "Width (px)", labelDa: "Bredde (px)", defaultValue: "3000" },
      { key: "h", labelEn: "Height (px)", labelDa: "Højde (px)", defaultValue: "2000" },
      { key: "dpi", labelEn: "DPI", labelDa: "DPI", defaultValue: "300" },
    ],
    compute: (v) => {
      const w = num(v.w);
      const h = num(v.h);
      const dpi = num(v.dpi);
      if (!w || !h || !dpi || dpi <= 0) return null;
      return [
        { labelEn: "Width (in)", labelDa: "Bredde (in)", value: round(w / dpi, 2) },
        { labelEn: "Height (in)", labelDa: "Højde (in)", value: round(h / dpi, 2) },
        {
          labelEn: "Width (cm)",
          labelDa: "Bredde (cm)",
          value: round((w / dpi) * 2.54, 2),
        },
        {
          labelEn: "Height (cm)",
          labelDa: "Højde (cm)",
          value: round((h / dpi) * 2.54, 2),
        },
      ];
    },
  },
  {
    id: "bandwidth",
    nameEn: "Download time",
    nameDa: "Downloadtid",
    descriptionEn: "Estimate download time from file size and bandwidth.",
    descriptionDa: "Estimer downloadtid ud fra filstørrelse og båndbredde.",
    aliases: ["download time", "bandwidth", "hastighed"],
    intents: ["bandwidth", "download"],
    tags: ["dev", "network"],
    popularity: 75,
    fields: [
      { key: "size", labelEn: "File size (MB)", labelDa: "Filstørrelse (MB)", defaultValue: "700" },
      { key: "mbps", labelEn: "Speed (Mbps)", labelDa: "Hastighed (Mbps)", defaultValue: "100" },
    ],
    compute: (v) => {
      const size = num(v.size);
      const mbps = num(v.mbps);
      if (!size || !mbps || size < 0 || mbps <= 0) return null;
      const seconds = (size * 8) / mbps;
      const m = Math.floor(seconds / 60);
      const s = Math.round(seconds % 60);
      return [
        { labelEn: "Seconds", labelDa: "Sekunder", value: round(seconds, 1) },
        { labelEn: "Time", labelDa: "Tid", value: `${m}m ${s}s` },
      ];
    },
  },
  {
    id: "randomnum",
    nameEn: "Random number",
    nameDa: "Tilfældigt tal",
    descriptionEn: "Pick a random integer between min and max (inclusive).",
    descriptionDa: "Vælg et tilfældigt heltal mellem min og max (inkl.).",
    aliases: ["random number", "dice", "tilfældigt tal"],
    intents: ["random", "number"],
    tags: ["math"],
    popularity: 74,
    volatile: true,
    actionEn: "Pick again",
    actionDa: "Vælg igen",
    fields: [
      { key: "min", labelEn: "Min", labelDa: "Min", defaultValue: "1" },
      { key: "max", labelEn: "Max", labelDa: "Max", defaultValue: "100" },
    ],
    compute: (v) => {
      const min = Math.ceil(num(v.min) ?? NaN);
      const max = Math.floor(num(v.max) ?? NaN);
      if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) return null;
      if (max - min + 1 > 0x100000000) return null;
      return [
        {
          labelEn: "Result",
          labelDa: "Resultat",
          value: String(randomInt(min, max)),
        },
      ];
    },
  },
  {
    id: "sortlines",
    nameEn: "Sort lines",
    nameDa: "Sortér linjer",
    descriptionEn: "Sort text lines A–Z or Z–A.",
    descriptionDa: "Sortér tekstlinjer A–Å eller Å–A.",
    aliases: ["sort lines", "sort text", "sortér"],
    intents: ["sort", "text"],
    tags: ["text"],
    popularity: 72,
    fields: [
      {
        key: "text",
        labelEn: "Lines",
        labelDa: "Linjer",
        multiline: true,
        defaultValue: "banana\napple\ncarrot",
      },
      {
        key: "order",
        labelEn: "Order",
        labelDa: "Rækkefølge",
        kind: "select",
        defaultValue: "asc",
        options: [
          { value: "asc", labelEn: "A → Z", labelDa: "A → Å" },
          { value: "desc", labelEn: "Z → A", labelDa: "Å → A" },
        ],
      },
    ],
    compute: (v) => {
      const lines = (v.text ?? "").split(/\r?\n/);
      const sorted = [...lines].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      );
      if (v.order === "desc") sorted.reverse();
      return [{ labelEn: "Result", labelDa: "Resultat", value: sorted.join("\n") }];
    },
  },
  {
    id: "dedupe",
    nameEn: "Remove duplicate lines",
    nameDa: "Fjern dubletlinjer",
    descriptionEn: "Keep the first occurrence of each unique line.",
    descriptionDa: "Behold første forekomst af hver unikke linje.",
    aliases: ["dedupe", "unique lines", "fjern dubletter"],
    intents: ["dedupe", "text"],
    tags: ["text"],
    popularity: 71,
    fields: [
      {
        key: "text",
        labelEn: "Lines",
        labelDa: "Linjer",
        multiline: true,
        defaultValue: "a\nb\na\nc",
      },
    ],
    compute: (v) => {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const line of (v.text ?? "").split(/\r?\n/)) {
        if (seen.has(line)) continue;
        seen.add(line);
        out.push(line);
      }
      return [{ labelEn: "Result", labelDa: "Resultat", value: out.join("\n") }];
    },
  },
  {
    id: "heatindex",
    nameEn: "Heat index",
    nameDa: "Varmeindeks",
    descriptionEn: "Approximate heat index from Celsius temperature and relative humidity.",
    descriptionDa: "Omtrentligt varmeindeks ud fra °C og relativ luftfugtighed.",
    aliases: ["heat index", "feels like", "varmeindeks"],
    intents: ["weather", "heat"],
    tags: ["health"],
    popularity: 68,
    fields: [
      { key: "c", labelEn: "Temp (°C)", labelDa: "Temp (°C)", defaultValue: "32" },
      { key: "rh", labelEn: "Humidity (%)", labelDa: "Fugtighed (%)", defaultValue: "70" },
    ],
    compute: (v) => {
      const c = num(v.c);
      const rh = num(v.rh);
      if (c === undefined || rh === undefined) return null;
      const t = (c * 9) / 5 + 32;
      const r = rh;
      const hi =
        -42.379 +
        2.04901523 * t +
        10.14333127 * r -
        0.22475541 * t * r -
        0.00683783 * t * t -
        0.05481717 * r * r +
        0.00122874 * t * t * r +
        0.00085282 * t * r * r -
        0.00000199 * t * t * r * r;
      const hiC = ((hi - 32) * 5) / 9;
      return [{ labelEn: "Heat index (°C)", labelDa: "Varmeindeks (°C)", value: round(hiC, 1) }];
    },
  },
  {
    id: "textreverse",
    nameEn: "Reverse text",
    nameDa: "Omvend tekst",
    descriptionEn: "Reverse characters or lines in text.",
    descriptionDa: "Vend tegn eller linjer om i tekst.",
    aliases: ["reverse text", "omvend", "backwards"],
    intents: ["text", "reverse"],
    tags: ["text"],
    popularity: 68,
    fields: [
      { key: "text", labelEn: "Text", labelDa: "Tekst", multiline: true, defaultValue: "hello" },
      {
        key: "mode",
        labelEn: "Mode",
        labelDa: "Tilstand",
        kind: "select",
        defaultValue: "chars",
        options: [
          { value: "chars", labelEn: "Characters", labelDa: "Tegn" },
          { value: "lines", labelEn: "Lines", labelDa: "Linjer" },
        ],
      },
    ],
    compute: (v) => {
      const text = v.text ?? "";
      const result =
        v.mode === "lines"
          ? text.split(/\r?\n/).reverse().join("\n")
          : [...text].reverse().join("");
      return [{ labelEn: "Result", labelDa: "Resultat", value: result }];
    },
  },
  {
    id: "leapyear",
    nameEn: "Leap year",
    nameDa: "Skudår",
    descriptionEn: "Check whether a year is a leap year.",
    descriptionDa: "Tjek om et år er et skudår.",
    aliases: ["leap year", "skudår", "leap"],
    intents: ["date", "leap"],
    tags: ["time"],
    popularity: 66,
    fields: [{ key: "year", labelEn: "Year", labelDa: "År", defaultValue: "2026" }],
    compute: (v) => {
      const y = Math.floor(num(v.year) ?? NaN);
      if (!Number.isFinite(y)) return null;
      const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      return [
        {
          labelEn: "Result",
          labelDa: "Resultat",
          value: leap ? "leap year" : "not a leap year",
        },
      ];
    },
  },
  {
    id: "dayofyear",
    nameEn: "Day of year",
    nameDa: "Årets dag",
    descriptionEn: "Day number within the year for a calendar date.",
    descriptionDa: "Dagnummer i året for en kalenderdato.",
    aliases: ["day of year", "julian day of year", "årets dag"],
    intents: ["date", "day"],
    tags: ["time"],
    popularity: 67,
    fields: [
      {
        key: "date",
        labelEn: "Date (YYYY-MM-DD)",
        labelDa: "Dato (ÅÅÅÅ-MM-DD)",
        defaultValue: "2026-11-15",
      },
    ],
    compute: (v) => {
      const d = new Date(v.date ?? "");
      if (Number.isNaN(d.getTime())) return null;
      const start = new Date(d.getFullYear(), 0, 0);
      const diff = d.getTime() - start.getTime();
      const day = Math.floor(diff / 86400000);
      return [{ labelEn: "Day of year", labelDa: "Årets dag", value: String(day) }];
    },
  },
  {
    id: "passwordstrength",
    nameEn: "Password strength",
    nameDa: "Adgangskodestyrke",
    descriptionEn: "Rough strength score from length and character variety (local only).",
    descriptionDa: "Grov styrkescore ud fra længde og tegntyper (kun lokalt).",
    aliases: ["password strength", "password score", "kodeord styrke"],
    intents: ["password", "security"],
    tags: ["security"],
    popularity: 82,
    fields: [
      {
        key: "password",
        labelEn: "Password",
        labelDa: "Adgangskode",
        defaultValue: "",
      },
    ],
    compute: (v) => {
      const p = v.password ?? "";
      let score = 0;
      if (p.length >= 8) score += 1;
      if (p.length >= 12) score += 1;
      if (p.length >= 16) score += 1;
      if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
      if (/\d/.test(p)) score += 1;
      if (/[^A-Za-z0-9]/.test(p)) score += 1;
      const labelsEn = [
        "very weak",
        "weak",
        "fair",
        "good",
        "strong",
        "very strong",
        "excellent",
      ];
      const labelsDa = [
        "meget svag",
        "svag",
        "middel",
        "god",
        "stærk",
        "meget stærk",
        "fremragende",
      ];
      const idx = Math.min(score, labelsEn.length - 1);
      return [
        { labelEn: "Score", labelDa: "Score", value: `${score}/6` },
        {
          labelEn: "Label",
          labelDa: "Niveau",
          value: labelsEn[idx]!,
          valueDa: labelsDa[idx]!,
        },
      ];
    },
  },
  {
    id: "windchill",
    nameEn: "Wind chill",
    nameDa: "Vindafkøling",
    descriptionEn: "Wind chill temperature from °C and wind speed in km/h.",
    descriptionDa: "Vindafkøling ud fra °C og vindhastighed i km/t.",
    aliases: ["wind chill", "feels colder", "vindafkøling"],
    intents: ["weather", "wind"],
    tags: ["health"],
    popularity: 65,
    fields: [
      { key: "c", labelEn: "Temp (°C)", labelDa: "Temp (°C)", defaultValue: "-5" },
      { key: "kmh", labelEn: "Wind (km/h)", labelDa: "Vind (km/t)", defaultValue: "30" },
    ],
    compute: (v) => {
      const t = num(v.c);
      const vkm = num(v.kmh);
      if (t === undefined || vkm === undefined || vkm < 0) return null;
      const wc =
        13.12 +
        0.6215 * t -
        11.37 * vkm ** 0.16 +
        0.3965 * t * vkm ** 0.16;
      return [{ labelEn: "Wind chill (°C)", labelDa: "Vindafkøling (°C)", value: round(wc, 1) }];
    },
  },
  {
    id: "tippercent",
    nameEn: "What percent is tip?",
    nameDa: "Hvor mange procent er tip?",
    descriptionEn: "Find which tip percent a tip amount is of the bill.",
    descriptionDa: "Find hvilken tipprocent et tipbeløb er af regningen.",
    aliases: ["tip percent", "tip %", "drikkepenge procent"],
    intents: ["tip", "percent"],
    tags: ["finance"],
    popularity: 70,
    fields: [
      { key: "bill", labelEn: "Bill", labelDa: "Regning", defaultValue: "100" },
      { key: "tip", labelEn: "Tip amount", labelDa: "Tipbeløb", defaultValue: "15" },
    ],
    compute: (v) => {
      const bill = num(v.bill);
      const tip = num(v.tip);
      if (!bill || tip === undefined) return null;
      return [
        { labelEn: "Tip %", labelDa: "Tip %", value: round((tip / bill) * 100, 2) },
        { labelEn: "Total", labelDa: "Total", value: round(bill + tip, 2) },
      ];
    },
  },
  {
    id: "screenres",
    nameEn: "Screen resolution helper",
    nameDa: "Skærmopløsning",
    descriptionEn: "Megapixels and aspect ratio from width and height in pixels.",
    descriptionDa: "Megapixel og billedformat ud fra bredde og højde i pixels.",
    aliases: ["resolution", "megapixels", "skærmopløsning"],
    intents: ["resolution", "image"],
    tags: ["image", "design"],
    popularity: 69,
    fields: [
      { key: "w", labelEn: "Width (px)", labelDa: "Bredde (px)", defaultValue: "1920" },
      { key: "h", labelEn: "Height (px)", labelDa: "Højde (px)", defaultValue: "1080" },
    ],
    compute: (v) => {
      const w = num(v.w);
      const h = num(v.h);
      if (!w || !h || w <= 0 || h <= 0) return null;
      let a = Math.round(w);
      let b = Math.round(h);
      const a0 = a;
      const b0 = b;
      while (b) {
        const t = b;
        b = a % b;
        a = t;
      }
      return [
        { labelEn: "Megapixels", labelDa: "Megapixel", value: round((w * h) / 1e6, 2) },
        { labelEn: "Aspect", labelDa: "Format", value: `${a0 / a}:${b0 / a}` },
      ];
    },
  },
  {
    id: "luhn",
    nameEn: "Luhn check",
    nameDa: "Luhn-tjek",
    descriptionEn: "Check whether a number passes the Luhn algorithm (cards, IMEI).",
    descriptionDa: "Tjek om et nummer består Luhn-algoritmen (kort, IMEI).",
    aliases: ["luhn", "credit card check", "card valid", "imei check"],
    intents: ["luhn", "card", "validate"],
    tags: ["dev", "everyday"],
    popularity: 80,
    fields: [
      {
        key: "number",
        labelEn: "Number",
        labelDa: "Nummer",
        defaultValue: "4532015112830366",
        hintEn: "Digits only. Spaces are ignored.",
        hintDa: "Kun cifre. Mellemrum ignoreres.",
      },
    ],
    compute: (v) => {
      const digits = (v.number ?? "").replace(/\D/g, "");
      if (digits.length < 2) return null;
      let sum = 0;
      let alt = false;
      for (let i = digits.length - 1; i >= 0; i--) {
        let n = Number(digits[i]);
        if (alt) {
          n *= 2;
          if (n > 9) n -= 9;
        }
        sum += n;
        alt = !alt;
      }
      const ok = sum % 10 === 0;
      return [
        {
          labelEn: "Valid",
          labelDa: "Gyldigt",
          value: ok ? "Yes" : "No",
          valueDa: ok ? "Ja" : "Nej",
        },
        { labelEn: "Digits", labelDa: "Cifre", value: String(digits.length) },
      ];
    },
  },
  {
    id: "iban",
    nameEn: "IBAN check",
    nameDa: "IBAN-tjek",
    descriptionEn: "Validate IBAN format and mod-97 checksum locally.",
    descriptionDa: "Validér IBAN-format og mod-97-kontrolsum lokalt.",
    aliases: ["iban", "iban checker", "bank account", "kontonummer"],
    intents: ["iban", "bank", "validate"],
    tags: ["finance", "everyday"],
    popularity: 86,
    fields: [
      {
        key: "iban",
        labelEn: "IBAN",
        labelDa: "IBAN",
        defaultValue: "DK50 0040 0440 1162 43",
      },
    ],
    compute: (v) => {
      const raw = (v.iban ?? "").replace(/\s+/g, "").toUpperCase();
      if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(raw)) return null;
      const rearranged = raw.slice(4) + raw.slice(0, 4);
      const expanded = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
      let remainder = 0;
      for (const ch of expanded) {
        remainder = (remainder * 10 + Number(ch)) % 97;
      }
      const ok = remainder === 1;
      const pretty = raw.replace(/(.{4})/g, "$1 ").trim();
      return [
        {
          labelEn: "Valid",
          labelDa: "Gyldigt",
          value: ok ? "Yes" : "No",
          valueDa: ok ? "Ja" : "Nej",
        },
        { labelEn: "Normalized", labelDa: "Normaliseret", value: pretty },
        { labelEn: "Country", labelDa: "Land", value: raw.slice(0, 2) },
      ];
    },
  },
  {
    id: "dice",
    nameEn: "Dice roller",
    nameDa: "Terning",
    descriptionEn:
      "Roll real 3D dice with animation, or other dice with more sides.",
    descriptionDa:
      "Kast rigtige 3D-terninger med animation, eller andre terninger med flere sider.",
    aliases: ["dice", "roll dice", "terning", "coin flip", "mønt"],
    intents: ["dice", "random", "game"],
    tags: ["everyday"],
    popularity: 78,
    volatile: true,
    actionEn: "Roll again",
    actionDa: "Kast igen",
    fields: [
      { key: "count", labelEn: "Dice", labelDa: "Antal", defaultValue: "1" },
      { key: "sides", labelEn: "Sides", labelDa: "Sider", defaultValue: "6" },
    ],
    compute: (v) => {
      // Kept for registry metadata; the dedicated DiceTool handles the UI.
      const count = Math.min(20, Math.max(1, Math.floor(num(v.count) ?? 1)));
      const sides = Math.min(1000, Math.max(2, Math.floor(num(v.sides) ?? 6)));
      const rolls: number[] = [];
      for (let i = 0; i < count; i++) {
        rolls.push(randomInt(1, sides));
      }
      const total = rolls.reduce((a, b) => a + b, 0);
      return [
        { labelEn: "Rolls", labelDa: "Kast", value: rolls.join(", ") },
        { labelEn: "Total", labelDa: "Sum", value: String(total) },
      ];
    },
  },
  {
    id: "promille",
    nameEn: "Blood alcohol estimate",
    nameDa: "Promilleberegner",
    descriptionEn:
      "Estimate blood alcohol (promille) from drinks, body weight, and time. Approximate only.",
    descriptionDa:
      "Estimer promille ud fra genstande, kropsvægt og tid. Kun et overslag.",
    aliases: ["promille", "promilleberegner", "bac", "blood alcohol", "alkohol"],
    intents: ["alcohol", "health", "promille"],
    tags: ["health", "everyday"],
    popularity: 85,
    fields: [
      {
        key: "drinks",
        labelEn: "Drinks",
        labelDa: "Genstande",
        defaultValue: "2",
        hintEn: "One standard drink ≈ 12 g alcohol (e.g. 33 cl beer at 4.6%).",
        hintDa: "Én genstand ≈ 12 g alkohol (fx 33 cl øl ved 4,6%).",
      },
      {
        key: "weight",
        labelEn: "Body weight (kg)",
        labelDa: "Kropsvægt (kg)",
        defaultValue: "75",
      },
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
      {
        key: "hours",
        labelEn: "Hours since drinking started",
        labelDa: "Timer siden du begyndte",
        defaultValue: "2",
      },
    ],
    compute: (v) => {
      const drinks = num(v.drinks);
      const weight = num(v.weight);
      const hours = num(v.hours) ?? 0;
      if (
        drinks === undefined ||
        weight === undefined ||
        drinks < 0 ||
        weight <= 0 ||
        hours < 0
      ) {
        return null;
      }
      const grams = drinks * 12;
      const r = v.sex === "female" ? 0.55 : 0.68;
      const raw = grams / (weight * r) - 0.15 * hours;
      const promille = Math.max(0, raw);
      return [
        {
          labelEn: "Estimated BAC (‰)",
          labelDa: "Estimeret promille (‰)",
          value: round(promille, 2),
        },
        {
          labelEn: "Alcohol intake",
          labelDa: "Alkoholindtag",
          value: `${round(grams, 1)} g`,
        },
        {
          labelEn: "Note",
          labelDa: "Bemærkning",
          value:
            "Approximate Widmark estimate only. Not for legal or medical decisions.",
          valueDa:
            "Kun et Widmark-overslag. Ikke til juridiske eller medicinske beslutninger.",
        },
      ];
    },
  },
  {
    id: "shoesize",
    nameEn: "Shoe size converter",
    nameDa: "Skostørrelse-omregner",
    descriptionEn: "Compare EU, UK, and US shoe sizes for men, women, and children.",
    descriptionDa: "Sammenlign EU-, UK- og US-skostørrelser til mænd, kvinder og børn.",
    aliases: ["shoe size", "skostørrelse", "skostorrelse", "eu uk us shoes"],
    intents: ["convert", "size", "shoes"],
    tags: ["everyday", "convert"],
    popularity: 82,
    fields: [
      { key: "size", labelEn: "Size", labelDa: "Størrelse", defaultValue: "42" },
      {
        key: "system",
        labelEn: "From system",
        labelDa: "Fra system",
        kind: "select",
        defaultValue: "eu",
        options: [
          { value: "eu", labelEn: "EU", labelDa: "EU" },
          { value: "uk", labelEn: "UK", labelDa: "UK" },
          { value: "usm", labelEn: "US men", labelDa: "US herrer" },
          { value: "usw", labelEn: "US women", labelDa: "US damer" },
          { value: "usk", labelEn: "US kids", labelDa: "US børn" },
        ],
      },
    ],
    compute: (v) => {
      const size = num(v.size);
      if (size === undefined || size <= 0) return null;
      // Approximate adult/kids bridges via EU hub (brands still vary).
      // Adults: EU ≈ UK+34 ≈ US men+33 ≈ US women+31.5
      // Kids US: EU ≈ US kids + 19
      let eu: number;
      switch (v.system) {
        case "eu":
          eu = size;
          break;
        case "uk":
          eu = size + 34;
          break;
        case "usm":
          eu = size + 33;
          break;
        case "usw":
          eu = size + 31.5;
          break;
        case "usk":
          eu = size + 19;
          break;
        default:
          return null;
      }
      return [
        { labelEn: "EU", labelDa: "EU", value: round(eu, 1) },
        { labelEn: "UK", labelDa: "UK", value: round(eu - 34, 1) },
        { labelEn: "US men", labelDa: "US herrer", value: round(eu - 33, 1) },
        { labelEn: "US women", labelDa: "US damer", value: round(eu - 31.5, 1) },
        { labelEn: "US kids", labelDa: "US børn", value: round(eu - 19, 1) },
        {
          labelEn: "Note",
          labelDa: "Bemærkning",
          value: "Approximate chart. Brands vary.",
          valueDa: "Cirka-tabel. Mærker varierer.",
        },
      ];
    },
  },
  {
    id: "clothingsize",
    nameEn: "Clothing size converter",
    nameDa: "Tøjstørrelse-omregner",
    descriptionEn: "Translate international clothing sizes for tops.",
    descriptionDa: "Oversæt internationale tøjstørrelser til overdele.",
    aliases: ["clothing size", "tøjstørrelse", "tojstorrelse", "dress size"],
    intents: ["convert", "size", "clothing"],
    tags: ["everyday", "convert"],
    popularity: 80,
    fields: [
      {
        key: "size",
        labelEn: "Size",
        labelDa: "Størrelse",
        kind: "select",
        defaultValue: "M",
        options: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"].map((s) => ({
          value: s,
          labelEn: s,
          labelDa: s,
        })),
      },
      {
        key: "who",
        labelEn: "Fit",
        labelDa: "Pasform",
        kind: "select",
        defaultValue: "women",
        options: [
          { value: "women", labelEn: "Women", labelDa: "Damer" },
          { value: "men", labelEn: "Men", labelDa: "Herrer" },
        ],
      },
    ],
    compute: (v) => {
      const letter = (v.size ?? "M").toUpperCase();
      const women: Record<string, { eu: number; uk: number; us: number }> = {
        XXS: { eu: 32, uk: 4, us: 0 },
        XS: { eu: 34, uk: 6, us: 2 },
        S: { eu: 36, uk: 8, us: 4 },
        M: { eu: 40, uk: 12, us: 8 },
        L: { eu: 44, uk: 16, us: 12 },
        XL: { eu: 48, uk: 20, us: 16 },
        XXL: { eu: 52, uk: 24, us: 20 },
        "3XL": { eu: 56, uk: 28, us: 24 },
      };
      const men: Record<string, { eu: number; uk: number; us: number }> = {
        XXS: { eu: 42, uk: 32, us: 32 },
        XS: { eu: 44, uk: 34, us: 34 },
        S: { eu: 46, uk: 36, us: 36 },
        M: { eu: 50, uk: 40, us: 40 },
        L: { eu: 54, uk: 44, us: 44 },
        XL: { eu: 58, uk: 48, us: 48 },
        XXL: { eu: 62, uk: 52, us: 52 },
        "3XL": { eu: 66, uk: 56, us: 56 },
      };
      const row = (v.who === "men" ? men : women)[letter];
      if (!row) return null;
      return [
        { labelEn: "Letter", labelDa: "Bogstav", value: letter },
        { labelEn: "EU", labelDa: "EU", value: String(row.eu) },
        { labelEn: "UK", labelDa: "UK", value: String(row.uk) },
        { labelEn: "US", labelDa: "US", value: String(row.us) },
        {
          labelEn: "Note",
          labelDa: "Bemærkning",
          value: "Approximate chart for tops. Brands vary.",
          valueDa: "Cirka-tabel for overdele. Mærker varierer.",
        },
      ];
    },
  },
  {
    id: "percentagechange",
    nameEn: "Percentage change",
    nameDa: "Procentændring",
    descriptionEn: "How much a value rose or fell between two numbers.",
    descriptionDa: "Hvor meget en værdi er steget eller faldet mellem to tal.",
    aliases: ["percent change", "percentage change", "procentændring", "stigning", "fald procent"],
    intents: ["percent", "change", "finance"],
    tags: ["finance", "math"],
    popularity: 88,
    fields: [
      { key: "from", labelEn: "Start value", labelDa: "Startværdi", kind: "number", defaultValue: "80" },
      { key: "to", labelEn: "End value", labelDa: "Slutværdi", kind: "number", defaultValue: "100" },
    ],
    compute: (v) => {
      const from = num(v.from);
      const to = num(v.to);
      if (from === undefined || to === undefined || from === 0) return null;
      const diff = to - from;
      const change = (diff / Math.abs(from)) * 100;
      const direction =
        diff > 0 ? "increase" : diff < 0 ? "decrease" : "unchanged";
      const directionDa =
        diff > 0 ? "stigning" : diff < 0 ? "fald" : "uændret";
      return [
        { labelEn: "Change %", labelDa: "Ændring %", value: round(change, 2), numeric: true },
        { labelEn: "Difference", labelDa: "Forskel", value: round(diff, 4), numeric: true },
        { labelEn: "Direction", labelDa: "Retning", value: direction, valueDa: directionDa },
      ];
    },
  },
  {
    id: "ruleof72",
    nameEn: "Rule of 72",
    nameDa: "72-reglen",
    descriptionEn: "Estimate years to double money at a given annual return.",
    descriptionDa: "Estimer år til at fordoble penge ved et givet årligt afkast.",
    aliases: ["rule of 72", "72 rule", "double money", "fordoble penge"],
    intents: ["invest", "finance", "compound"],
    tags: ["finance"],
    popularity: 79,
    fields: [
      {
        key: "rate",
        labelEn: "Annual return (%)",
        labelDa: "Årligt afkast (%)",
        kind: "number",
        defaultValue: "7",
        hintEn: "Rough rule of thumb, not exact compound math.",
        hintDa: "Tommelfingerregel, ikke præcis rentes rente.",
      },
    ],
    compute: (v) => {
      const rate = num(v.rate);
      if (rate === undefined || rate <= 0) return null;
      const years = 72 / rate;
      return [
        { labelEn: "Years to double", labelDa: "År til fordobling", value: round(years, 1), numeric: true },
        {
          labelEn: "About",
          labelDa: "Cirka",
          value: `${Math.round(years)} years`,
          valueDa: `${Math.round(years)} år`,
        },
      ];
    },
  },
  {
    id: "compound",
    nameEn: "Compound interest",
    nameDa: "Rentes rente",
    descriptionEn: "Future value with compound interest from principal, rate, and years.",
    descriptionDa: "Fremtidig værdi med rentes rente ud fra beløb, rente og år.",
    aliases: ["compound interest", "rentes rente", "compound", "opsparing rente"],
    intents: ["interest", "finance", "save"],
    tags: ["finance"],
    popularity: 90,
    fields: [
      { key: "principal", labelEn: "Starting amount", labelDa: "Startbeløb", kind: "number", defaultValue: "10000" },
      { key: "rate", labelEn: "Annual rate (%)", labelDa: "Årlig rente (%)", kind: "number", defaultValue: "5" },
      { key: "years", labelEn: "Years", labelDa: "År", kind: "number", defaultValue: "10" },
      {
        key: "n",
        labelEn: "Compounding",
        labelDa: "Rentetilskrivning",
        kind: "select",
        defaultValue: "12",
        options: [
          { value: "1", labelEn: "Yearly", labelDa: "Årligt" },
          { value: "4", labelEn: "Quarterly", labelDa: "Kvartalsvis" },
          { value: "12", labelEn: "Monthly", labelDa: "Månedligt" },
          { value: "365", labelEn: "Daily", labelDa: "Dagligt" },
        ],
      },
    ],
    compute: (v) => {
      const P = num(v.principal);
      const r = num(v.rate);
      const t = num(v.years);
      const n = num(v.n) ?? 12;
      if (P === undefined || r === undefined || t === undefined || P < 0 || t < 0 || n <= 0) return null;
      const fv = P * (1 + r / 100 / n) ** (n * t);
      return [
        moneyRow("Future value", "Slutværdi", round(fv, 2)),
        moneyRow("Interest earned", "Optjent rente", round(fv - P, 2)),
        {
          labelEn: "Growth",
          labelDa: "Vækst",
          value: P === 0 ? "—" : `${round(((fv - P) / P) * 100, 1)} %`,
        },
      ];
    },
  },
  {
    id: "fuelcost",
    nameEn: "Trip fuel cost",
    nameDa: "Turopkostning",
    descriptionEn: "Estimate fuel cost from distance, consumption, and price per liter.",
    descriptionDa: "Estimer brændstofpris ud fra distance, forbrug og literpris.",
    aliases: ["fuel cost", "trip cost", "benzinpris", "dieselforbrug", "kørsel pris"],
    intents: ["fuel", "travel", "cost"],
    tags: ["everyday", "finance"],
    popularity: 87,
    fields: [
      { key: "km", labelEn: "Distance (km)", labelDa: "Distance (km)", kind: "number", defaultValue: "120" },
      { key: "lper100", labelEn: "Use (L/100 km)", labelDa: "Forbrug (L/100 km)", kind: "number", defaultValue: "6.5" },
      { key: "price", labelEn: "Price per liter", labelDa: "Pris pr. liter", kind: "number", defaultValue: "14.5" },
    ],
    compute: (v) => {
      const km = num(v.km);
      const use = num(v.lper100);
      const price = num(v.price);
      if ([km, use, price].some((x) => x === undefined || x! < 0)) return null;
      const liters = (km! * use!) / 100;
      const cost = liters * price!;
      return [
        moneyRow("Trip cost", "Turpris", round(cost, 2)),
        { labelEn: "Fuel used", labelDa: "Brændstof", value: `${round(liters, 2)} L` },
        moneyRow("Cost per km", "Pris pr. km", round(km! === 0 ? 0 : cost / km!, 2)),
      ];
    },
  },
  {
    id: "electricity",
    nameEn: "Electricity cost",
    nameDa: "Elpris for apparat",
    descriptionEn: "Cost of running a device from watts, hours, and price per kWh.",
    descriptionDa: "Pris for at køre et apparat ud fra watt, timer og pris pr. kWh.",
    aliases: ["electricity cost", "kwh cost", "elpris", "watt timer"],
    intents: ["energy", "cost", "electricity"],
    tags: ["everyday", "finance"],
    popularity: 84,
    fields: [
      { key: "watts", labelEn: "Power (W)", labelDa: "Effekt (W)", kind: "number", defaultValue: "60" },
      { key: "hours", labelEn: "Hours per day", labelDa: "Timer pr. dag", kind: "number", defaultValue: "5" },
      { key: "days", labelEn: "Days", labelDa: "Dage", kind: "number", defaultValue: "30" },
      { key: "kwhPrice", labelEn: "Price per kWh", labelDa: "Pris pr. kWh", kind: "number", defaultValue: "2.5" },
    ],
    compute: (v) => {
      const w = num(v.watts);
      const hours = num(v.hours);
      const days = num(v.days);
      const price = num(v.kwhPrice);
      if ([w, hours, days, price].some((x) => x === undefined || x! < 0)) return null;
      if (hours! > 24) return null;
      const kwh = (w! * hours! * days!) / 1000;
      return [
        moneyRow("Cost", "Pris", round(kwh * price!, 2)),
        { labelEn: "Energy", labelDa: "Energi", value: `${round(kwh, 3)} kWh` },
        moneyRow("Per day", "Pr. dag", round(((w! * hours!) / 1000) * price!, 2)),
      ];
    },
  },
  {
    id: "recipe",
    nameEn: "Recipe scaler",
    nameDa: "Opskrift-skaler",
    descriptionEn: "Scale ingredient amounts when changing serving size.",
    descriptionDa: "Skalér ingredienser når du ændrer antal portioner.",
    aliases: ["recipe scale", "servings", "opskrift", "portioner"],
    intents: ["recipe", "cooking", "scale"],
    tags: ["everyday"],
    popularity: 83,
    fields: [
      { key: "from", labelEn: "Original servings", labelDa: "Oprindelige portioner", kind: "number", defaultValue: "4" },
      { key: "to", labelEn: "New servings", labelDa: "Nye portioner", kind: "number", defaultValue: "6" },
      {
        key: "items",
        labelEn: "Ingredients (one per line)",
        labelDa: "Ingredienser (én pr. linje)",
        multiline: true,
        defaultValue: "250 g mel\n2 æg\n1 dl mælk",
        hintEn: "Start each line with a number, e.g. 250 g flour.",
        hintDa: "Start hver linje med et tal, fx 250 g mel.",
      },
    ],
    compute: (v) => {
      const from = num(v.from);
      const to = num(v.to);
      if (!from || !to || from <= 0 || to <= 0) return null;
      const factor = to / from;
      const lines = (v.items ?? "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const m = /^(\d+(?:[.,]\d+)?)\s*(.*)$/.exec(line);
          if (!m) return line;
          const amount = Number(m[1]!.replace(",", "."));
          if (!Number.isFinite(amount)) return line;
          const scaled = amount * factor;
          const nice =
            Math.abs(scaled - Math.round(scaled)) < 1e-9
              ? String(Math.round(scaled))
              : round(scaled, 2);
          return `${nice} ${m[2]}`.trim();
        });
      if (!lines.length) return null;
      return [
        { labelEn: "Scaled recipe", labelDa: "Skaleret opskrift", value: lines.join("\n") },
        { labelEn: "Factor", labelDa: "Faktor", value: round(factor, 3), numeric: true },
      ];
    },
  },
  {
    id: "currencyapprox",
    nameEn: "Quick currency convert",
    nameDa: "Hurtig valutaomregning",
    descriptionEn: "Convert an amount with a rate you provide (for offline estimates).",
    descriptionDa: "Omregn et beløb med en kurs du selv angiver (til hurtige overslag).",
    aliases: ["currency convert", "exchange calc", "valutaomregner", "kurs"],
    intents: ["currency", "convert", "exchange"],
    tags: ["finance", "everyday"],
    popularity: 86,
    fields: [
      { key: "amount", labelEn: "Amount", labelDa: "Beløb", kind: "number", defaultValue: "100" },
      {
        key: "rate",
        labelEn: "Rate (1 from = ? to)",
        labelDa: "Kurs (1 fra = ? til)",
        kind: "number",
        defaultValue: "7.45",
        hintEn: "Example: 1 EUR = 7.45 DKK.",
        hintDa: "Eksempel: 1 EUR = 7,45 DKK.",
      },
      { key: "from", labelEn: "From currency", labelDa: "Fra valuta", defaultValue: "EUR" },
      { key: "to", labelEn: "To currency", labelDa: "Til valuta", defaultValue: "DKK" },
    ],
    compute: (v) => {
      const amount = num(v.amount);
      const rate = num(v.rate);
      if (amount === undefined || rate === undefined || rate <= 0) return null;
      const from = (v.from || "FROM").trim().toUpperCase() || "FROM";
      const to = (v.to || "TO").trim().toUpperCase() || "TO";
      const converted = amount * rate;
      return [
        moneyRow(`Amount in ${to}`, `Beløb i ${to}`, round(converted, 2)),
        moneyRow(`Per 1 ${from}`, `Pr. 1 ${from}`, round(rate, 4)),
        moneyRow(`Back to ${from}`, `Tilbage til ${from}`, round(converted / rate, 2)),
      ];
    },
  },
  {
    id: "vatmargin",
    nameEn: "Price from cost + margin + VAT",
    nameDa: "Pris fra kost + avance + moms",
    descriptionEn: "Build a selling price from cost, margin percent, and VAT.",
    descriptionDa: "Byg en salgspris ud fra kostpris, avanceprocent og moms.",
    aliases: ["selling price", "margin vat", "salgspris", "avance moms"],
    intents: ["price", "vat", "margin"],
    tags: ["finance"],
    popularity: 85,
    fields: [
      { key: "cost", labelEn: "Cost price", labelDa: "Kostpris", kind: "number", defaultValue: "100" },
      { key: "margin", labelEn: "Margin (%)", labelDa: "Avance (%)", kind: "number", defaultValue: "40" },
      { key: "vat", labelEn: "VAT (%)", labelDa: "Moms (%)", kind: "number", defaultValue: "25" },
    ],
    compute: (v) => {
      const cost = num(v.cost);
      const margin = num(v.margin);
      const vat = num(v.vat);
      if ([cost, margin, vat].some((x) => x === undefined || x! < 0)) return null;
      const exVat = cost! * (1 + margin! / 100);
      const incVat = exVat * (1 + vat! / 100);
      return [
        moneyRow("Price incl. VAT", "Pris inkl. moms", round(incVat, 2)),
        moneyRow("Price excl. VAT", "Pris ekskl. moms", round(exVat, 2)),
        moneyRow("VAT amount", "Momsbeløb", round(incVat - exVat, 2)),
        moneyRow("Your margin", "Din avance", round(exVat - cost!, 2)),
      ];
    },
  },
  {
    id: "hoursminutes",
    nameEn: "Hours ↔ minutes ↔ seconds",
    nameDa: "Timer ↔ minutter ↔ sekunder",
    descriptionEn: "Convert a duration between hours, minutes, and seconds.",
    descriptionDa: "Omregn en varighed mellem timer, minutter og sekunder.",
    aliases: ["hours minutes", "time convert", "timer minutter", "sekunder"],
    intents: ["time", "convert"],
    tags: ["time", "everyday"],
    popularity: 81,
    fields: [
      { key: "value", labelEn: "Value", labelDa: "Værdi", kind: "number", defaultValue: "90" },
      {
        key: "unit",
        labelEn: "Unit",
        labelDa: "Enhed",
        kind: "select",
        defaultValue: "minutes",
        options: [
          { value: "hours", labelEn: "Hours", labelDa: "Timer" },
          { value: "minutes", labelEn: "Minutes", labelDa: "Minutter" },
          { value: "seconds", labelEn: "Seconds", labelDa: "Sekunder" },
        ],
      },
    ],
    compute: (v) => {
      const n = num(v.value);
      if (n === undefined || n < 0) return null;
      let seconds = n;
      if (v.unit === "hours") seconds = n * 3600;
      else if (v.unit === "minutes") seconds = n * 60;
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.round(seconds % 60);
      return [
        {
          labelEn: "Clock",
          labelDa: "Ur",
          value: `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
        },
        { labelEn: "Hours", labelDa: "Timer", value: round(seconds / 3600, 4), numeric: true },
        { labelEn: "Minutes", labelDa: "Minutter", value: round(seconds / 60, 4), numeric: true },
        { labelEn: "Seconds", labelDa: "Sekunder", value: round(seconds, 2), numeric: true },
      ];
    },
  },
  {
    id: "ageondate",
    nameEn: "Age on a date",
    nameDa: "Alder på en dato",
    descriptionEn: "Exact age in years, months, and days on a chosen date.",
    descriptionDa: "Præcis alder i år, måneder og dage på en valgt dato.",
    aliases: ["age on date", "exact age", "alder på dato", "fødselsdag alder"],
    intents: ["age", "date"],
    tags: ["time", "everyday"],
    popularity: 80,
    fields: [
      { key: "birth", labelEn: "Birth date", labelDa: "Fødselsdato", defaultValue: "1990-05-20", hintEn: "YYYY-MM-DD", hintDa: "ÅÅÅÅ-MM-DD" },
      { key: "on", labelEn: "On this date", labelDa: "På denne dato", defaultValue: "2026-11-17", hintEn: "YYYY-MM-DD", hintDa: "ÅÅÅÅ-MM-DD" },
    ],
    compute: (v) => {
      const birthParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec((v.birth ?? "").trim());
      const onParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec((v.on ?? "").trim());
      if (!birthParts || !onParts) return null;
      const birth = new Date(Number(birthParts[1]), Number(birthParts[2]) - 1, Number(birthParts[3]));
      const on = new Date(Number(onParts[1]), Number(onParts[2]) - 1, Number(onParts[3]));
      if (Number.isNaN(birth.getTime()) || Number.isNaN(on.getTime()) || on < birth) return null;
      let years = on.getFullYear() - birth.getFullYear();
      let months = on.getMonth() - birth.getMonth();
      let days = on.getDate() - birth.getDate();
      if (days < 0) {
        months -= 1;
        const prev = new Date(on.getFullYear(), on.getMonth(), 0).getDate();
        days += prev;
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      const totalDays = Math.floor((on.getTime() - birth.getTime()) / 86400000);
      return [
        {
          labelEn: "Age",
          labelDa: "Alder",
          value: `${years} years, ${months} months, ${days} days`,
          valueDa: `${years} år, ${months} mdr., ${days} dage`,
        },
        { labelEn: "Total days", labelDa: "Samlede dage", value: String(totalDays) },
      ];
    },
  },
  {
    id: "adddays",
    nameEn: "Add / subtract days",
    nameDa: "Læg til / træk fra dage",
    descriptionEn: "Find a calendar date by adding or subtracting days.",
    descriptionDa: "Find en kalenderdato ved at lægge dage til eller trække fra.",
    aliases: ["add days", "subtract days", "date plus", "dato plus", "dage frem"],
    intents: ["date", "calendar"],
    tags: ["time"],
    popularity: 84,
    fields: [
      { key: "date", labelEn: "Start date", labelDa: "Startdato", defaultValue: "2026-11-17", hintEn: "YYYY-MM-DD", hintDa: "ÅÅÅÅ-MM-DD" },
      { key: "days", labelEn: "Days (+/-)", labelDa: "Dage (+/-)", kind: "number", defaultValue: "14", hintEn: "Use negative numbers to go back.", hintDa: "Brug negative tal for at gå tilbage." },
    ],
    compute: (v) => {
      const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec((v.date ?? "").trim());
      const days = Math.trunc(num(v.days) ?? NaN);
      if (!parts || !Number.isFinite(days)) return null;
      const d = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
      d.setDate(d.getDate() + days);
      const iso = isoDateLocal(d);
      const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
      const weekdayDa = d.toLocaleDateString("da-DK", { weekday: "long" });
      return [
        { labelEn: "Result date", labelDa: "Resultatdato", value: iso },
        { labelEn: "Weekday", labelDa: "Ugedag", value: weekday, valueDa: weekdayDa },
      ];
    },
  },
  {
    id: "countdownhours",
    nameEn: "Time until datetime",
    nameDa: "Tid til tidspunkt",
    descriptionEn: "Days, hours, and minutes remaining until a target datetime.",
    descriptionDa: "Dage, timer og minutter tilbage til et valgt tidspunkt.",
    aliases: ["time until", "hours until", "tid til", "countdown time"],
    intents: ["countdown", "time"],
    tags: ["time"],
    popularity: 82,
    fields: [
      {
        key: "target",
        labelEn: "Target datetime",
        labelDa: "Måltidspunkt",
        defaultValue: "2026-12-24T18:00",
        hintEn: "Format: YYYY-MM-DDTHH:MM",
        hintDa: "Format: ÅÅÅÅ-MM-DDTT:MM",
      },
    ],
    compute: (v) => {
      const target = new Date(v.target ?? "");
      if (Number.isNaN(target.getTime())) return null;
      const diff = target.getTime() - Date.now();
      const past = diff < 0;
      const abs = Math.abs(diff);
      const days = Math.floor(abs / 86400000);
      const hours = Math.floor((abs % 86400000) / 3600000);
      const minutes = Math.floor((abs % 3600000) / 60000);
      return [
        {
          labelEn: past ? "Time since" : "Time left",
          labelDa: past ? "Tid siden" : "Tid tilbage",
          value: `${days}d ${hours}h ${minutes}m`,
          valueDa: `${days}d ${hours}t ${minutes}m`,
        },
        {
          labelEn: "Total hours",
          labelDa: "Timer i alt",
          value: round(abs / 3600000, 1),
          numeric: true,
        },
      ];
    },
  },
  {
    id: "workhours",
    nameEn: "Work hours pay",
    nameDa: "Arbejdstimer løn",
    descriptionEn: "Pay from hours worked and hourly rate, with optional overtime.",
    descriptionDa: "Løn ud fra arbejdstimer og timeløn, med valgfri overtid.",
    aliases: ["work hours", "hourly pay", "overtime", "arbejdstimer", "overtid"],
    intents: ["salary", "hours", "pay"],
    tags: ["finance", "everyday"],
    popularity: 86,
    fields: [
      { key: "hours", labelEn: "Regular hours", labelDa: "Almindelige timer", kind: "number", defaultValue: "37" },
      { key: "ot", labelEn: "Overtime hours", labelDa: "Overtidstimer", kind: "number", defaultValue: "3" },
      { key: "rate", labelEn: "Hourly rate", labelDa: "Timeløn", kind: "number", defaultValue: "180" },
      { key: "otFactor", labelEn: "Overtime factor", labelDa: "Overtidsfaktor", kind: "number", defaultValue: "1.5", hintEn: "1.5 = 50% extra.", hintDa: "1,5 = 50% ekstra." },
    ],
    compute: (v) => {
      const hours = num(v.hours);
      const ot = num(v.ot) ?? 0;
      const rate = num(v.rate);
      const factor = num(v.otFactor) ?? 1.5;
      if (hours === undefined || rate === undefined || hours < 0 || ot < 0 || rate < 0 || factor < 0) return null;
      const regular = hours * rate;
      const overtime = ot * rate * factor;
      return [
        moneyRow("Total pay", "Samlet løn", round(regular + overtime, 2)),
        moneyRow("Regular pay", "Almindelig løn", round(regular, 2)),
        moneyRow("Overtime pay", "Overtidsløn", round(overtime, 2)),
      ];
    },
  },
  {
    id: "loanextra",
    nameEn: "Extra loan payment",
    nameDa: "Ekstra afdrag på lån",
    descriptionEn: "See interest saved if you add a fixed extra monthly payment.",
    descriptionDa: "Se rente sparet hvis du lægger et fast ekstra månedligt afdrag.",
    aliases: ["extra payment", "pay off loan faster", "ekstra afdrag", "indfri lån"],
    intents: ["loan", "finance"],
    tags: ["finance"],
    popularity: 83,
    fields: [
      { key: "principal", labelEn: "Loan amount", labelDa: "Lånebeløb", kind: "number", defaultValue: "200000" },
      { key: "rate", labelEn: "Annual rate (%)", labelDa: "Årlig rente (%)", kind: "number", defaultValue: "5" },
      { key: "years", labelEn: "Years", labelDa: "År", kind: "number", defaultValue: "10" },
      { key: "extra", labelEn: "Extra monthly", labelDa: "Ekstra pr. måned", kind: "number", defaultValue: "500" },
    ],
    compute: (v) => {
      const P = num(v.principal);
      const annual = num(v.rate);
      const years = num(v.years);
      const extra = num(v.extra) ?? 0;
      if (P === undefined || annual === undefined || years === undefined || P <= 0 || years <= 0 || annual < 0) return null;
      const r = annual / 100 / 12;
      const n = Math.round(years * 12);
      const basePay = r === 0 ? P / n : (P * r * (1 + r) ** n) / ((1 + r) ** n - 1);
      const simulate = (payment: number) => {
        let bal = P;
        let months = 0;
        let interest = 0;
        while (bal > 0.01 && months < n * 4) {
          const i = r === 0 ? 0 : bal * r;
          interest += i;
          const principalPay = Math.min(bal, payment - i);
          if (principalPay <= 0) return { months: Infinity, interest: Infinity };
          bal -= principalPay;
          months += 1;
        }
        return { months, interest };
      };
      const normal = simulate(basePay);
      const faster = simulate(basePay + Math.max(0, extra));
      if (!Number.isFinite(faster.months)) return null;
      const monthsSaved = Math.max(0, normal.months - faster.months);
      return [
        moneyRow("Interest saved", "Rente sparet", round(Math.max(0, normal.interest - faster.interest), 2)),
        {
          labelEn: "Months saved",
          labelDa: "Måneder sparet",
          value: String(monthsSaved),
        },
        moneyRow("Base monthly payment", "Basisydelse", round(basePay, 2)),
        {
          labelEn: "Payoff with extra",
          labelDa: "Indfrielse med ekstra",
          value: `${faster.months} months`,
          valueDa: `${faster.months} måneder`,
        },
      ];
    },
  },
  {
    id: "probability",
    nameEn: "Probability helper",
    nameDa: "Sandsynlighed",
    descriptionEn: "Odds from favorable outcomes over total outcomes.",
    descriptionDa: "Sandsynlighed ud fra gunstige udfald over mulige udfald.",
    aliases: ["probability", "odds", "chance", "sandsynlighed"],
    intents: ["math", "probability"],
    tags: ["math"],
    popularity: 74,
    fields: [
      { key: "fav", labelEn: "Favorable outcomes", labelDa: "Gunstige udfald", kind: "number", defaultValue: "1" },
      { key: "total", labelEn: "Total outcomes", labelDa: "Mulige udfald", kind: "number", defaultValue: "6" },
    ],
    compute: (v) => {
      const fav = num(v.fav);
      const total = num(v.total);
      if (fav === undefined || total === undefined || total <= 0 || fav < 0 || fav > total) return null;
      const p = fav / total;
      return [
        { labelEn: "Percent", labelDa: "Procent", value: round(p * 100, 2), numeric: true },
        { labelEn: "Probability", labelDa: "Sandsynlighed", value: round(p, 6), numeric: true },
        {
          labelEn: "Odds for",
          labelDa: "Odds for",
          value: total - fav === 0 ? "certain" : `${round(fav / (total - fav), 3)} : 1`,
          valueDa: total - fav === 0 ? "sikkert" : `${round(fav / (total - fav), 3)} : 1`,
        },
      ];
    },
  },
  {
    id: "percentageof",
    nameEn: "What is X% of Y?",
    nameDa: "Hvad er X% af Y?",
    descriptionEn: "Find a percentage of a number, or the whole when you know the part.",
    descriptionDa: "Find en procentdel af et tal, eller helheden når du kender delen.",
    aliases: ["percent of", "x percent of y", "procent af"],
    intents: ["percent", "math"],
    tags: ["math", "everyday"],
    popularity: 91,
    fields: [
      { key: "percent", labelEn: "Percent (X)", labelDa: "Procent (X)", kind: "number", defaultValue: "15" },
      { key: "of", labelEn: "Of number (Y)", labelDa: "Af tal (Y)", kind: "number", defaultValue: "200" },
    ],
    compute: (v) => {
      const p = num(v.percent);
      const of = num(v.of);
      if (p === undefined || of === undefined) return null;
      const part = (p / 100) * of;
      return [
        {
          labelEn: `${round(p, 2)}% of ${round(of, 4)}`,
          labelDa: `${round(p, 2)}% af ${round(of, 4)}`,
          value: round(part, 4),
          numeric: true,
        },
        {
          labelEn: `If ${round(of, 4)} is ${round(p, 2)}%, the whole is`,
          labelDa: `Hvis ${round(of, 4)} er ${round(p, 2)}%, er helheden`,
          value: p === 0 ? "—" : round(of / (p / 100), 4),
          numeric: p !== 0,
        },
      ];
    },
  },
  {
    id: "aspectfit",
    nameEn: "Fit box in aspect ratio",
    nameDa: "Tilpas boks til billedformat",
    descriptionEn: "Largest width and height that fit inside a box at a given ratio.",
    descriptionDa: "Største bredde og højde der passer i en boks ved et givet format.",
    aliases: ["fit aspect", "letterbox size", "billedformat tilpas"],
    intents: ["aspect", "image", "design"],
    tags: ["image", "design"],
    popularity: 76,
    fields: [
      { key: "boxW", labelEn: "Box width", labelDa: "Boks bredde", kind: "number", defaultValue: "1920" },
      { key: "boxH", labelEn: "Box height", labelDa: "Boks højde", kind: "number", defaultValue: "1080" },
      { key: "rw", labelEn: "Ratio width", labelDa: "Format bredde", kind: "number", defaultValue: "16" },
      { key: "rh", labelEn: "Ratio height", labelDa: "Format højde", kind: "number", defaultValue: "9" },
    ],
    compute: (v) => {
      const boxW = num(v.boxW);
      const boxH = num(v.boxH);
      const rw = num(v.rw);
      const rh = num(v.rh);
      if ([boxW, boxH, rw, rh].some((x) => !x || x! <= 0)) return null;
      const scale = Math.min(boxW! / rw!, boxH! / rh!);
      const w = rw! * scale;
      const h = rh! * scale;
      return [
        { labelEn: "Fitted size", labelDa: "Tilpasset størrelse", value: `${round(w, 1)} × ${round(h, 1)}` },
        { labelEn: "Width", labelDa: "Bredde", value: round(w, 2), numeric: true },
        { labelEn: "Height", labelDa: "Højde", value: round(h, 2), numeric: true },
      ];
    },
  },
  {
    id: "colorhexrgb",
    nameEn: "HEX ↔ RGB",
    nameDa: "HEX ↔ RGB",
    descriptionEn: "Convert between HEX colors and RGB values.",
    descriptionDa: "Omregn mellem HEX-farver og RGB-værdier.",
    aliases: ["hex to rgb", "rgb to hex", "farveomregner", "color convert"],
    intents: ["color", "design", "convert"],
    tags: ["design", "dev"],
    popularity: 88,
    fields: [
      {
        key: "value",
        labelEn: "HEX or R,G,B",
        labelDa: "HEX eller R,G,B",
        defaultValue: "#2F6F4E",
        hintEn: "Examples: #2F6F4E, #abc, or 47, 111, 78",
        hintDa: "Eksempler: #2F6F4E, #abc eller 47, 111, 78",
      },
    ],
    compute: (v) => {
      const raw = (v.value ?? "").trim();
      let hexMatch = /^#?([0-9a-fA-F]{6})$/.exec(raw);
      if (!hexMatch) {
        const short = /^#?([0-9a-fA-F]{3})$/.exec(raw);
        if (short) {
          const s = short[1]!;
          hexMatch = [
            "",
            `${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`,
          ] as unknown as RegExpExecArray;
        }
      }
      if (hexMatch) {
        const hex = hexMatch[1]!.toUpperCase();
        const n = Number.parseInt(hex, 16);
        const r = (n >> 16) & 255;
        const g = (n >> 8) & 255;
        const b = n & 255;
        return [
          { labelEn: "HEX", labelDa: "HEX", value: `#${hex}` },
          { labelEn: "RGB", labelDa: "RGB", value: `${r}, ${g}, ${b}` },
          { labelEn: "CSS", labelDa: "CSS", value: `rgb(${r}, ${g}, ${b})` },
        ];
      }
      const parts = raw.split(/[,\s]+/).map((p) => Number(p));
      if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n) || n < 0 || n > 255)) {
        return null;
      }
      const [r, g, b] = parts as [number, number, number];
      const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0").toUpperCase();
      const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      return [
        { labelEn: "HEX", labelDa: "HEX", value: hex },
        { labelEn: "RGB", labelDa: "RGB", value: `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}` },
        { labelEn: "CSS", labelDa: "CSS", value: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})` },
      ];
    },
  },
  {
    id: "jsonminify",
    nameEn: "JSON minify / pretty",
    nameDa: "JSON minify / pretty",
    descriptionEn: "Validate JSON, then minify it or pretty-print with indentation.",
    descriptionDa: "Validér JSON, og minify eller pretty-print med indrykning.",
    aliases: ["json minify", "json pretty", "json format", "json formatter"],
    intents: ["json", "format", "dev"],
    tags: ["dev"],
    popularity: 87,
    fields: [
      {
        key: "text",
        labelEn: "JSON",
        labelDa: "JSON",
        multiline: true,
        defaultValue: '{"name":"Kit","ok":true,"n":3}',
      },
      {
        key: "mode",
        labelEn: "Mode",
        labelDa: "Tilstand",
        kind: "select",
        defaultValue: "pretty",
        options: [
          { value: "pretty", labelEn: "Pretty", labelDa: "Pretty" },
          { value: "minify", labelEn: "Minify", labelDa: "Minify" },
        ],
      },
    ],
    compute: (v) => {
      try {
        const data = JSON.parse(v.text ?? "");
        const out =
          v.mode === "minify" ? JSON.stringify(data) : JSON.stringify(data, null, 2);
        return [
          { labelEn: "Output", labelDa: "Output", value: out },
          { labelEn: "Characters", labelDa: "Tegn", value: String(out.length) },
        ];
      } catch {
        return null;
      }
    },
  },
  {
    id: "jwtpayload",
    nameEn: "JWT payload peek",
    nameDa: "JWT payload-kig",
    descriptionEn: "Decode a JWT payload locally without verifying the signature.",
    descriptionDa: "Afkod et JWT-payload lokalt uden at verificere signaturen.",
    aliases: ["jwt decode", "jwt payload", "decode jwt"],
    intents: ["jwt", "dev", "decode"],
    tags: ["dev", "security"],
    popularity: 84,
    fields: [
      {
        key: "token",
        labelEn: "JWT",
        labelDa: "JWT",
        multiline: true,
        defaultValue:
          "eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjM0IiwibmFtZSI6IktpdCIsImlhdCI6MTcwMDAwMDAwMH0.",
        hintEn: "Paste header.payload.signature. Signature is not checked.",
        hintDa: "Indsæt header.payload.signature. Signaturen tjekkes ikke.",
      },
    ],
    compute: (v) => {
      const token = (v.token ?? "").trim();
      const parts = token.split(".");
      if (parts.length < 2 || !parts[1]) return null;
      try {
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const pad = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
        const json =
          typeof atob === "function"
            ? decodeURIComponent(
                [...atob(pad)]
                  .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
                  .join(""),
              )
            : Buffer.from(pad, "base64").toString("utf8");
        const pretty = JSON.stringify(JSON.parse(json), null, 2);
        return [
          { labelEn: "Payload", labelDa: "Payload", value: pretty },
          {
            labelEn: "Note",
            labelDa: "Bemærkning",
            value: "Signature is not verified.",
            valueDa: "Signaturen verificeres ikke.",
          },
        ];
      } catch {
        return null;
      }
    },
  },
  {
    id: "passwordphrase",
    nameEn: "Passphrase idea",
    nameDa: "Adgangskode-sætning",
    descriptionEn: "Build a memorable passphrase from random common words.",
    descriptionDa: "Byg en huskevenlig adgangskode af tilfældige almindelige ord.",
    aliases: ["passphrase", "word password", "adgangskode sætning"],
    intents: ["password", "security", "generate"],
    tags: ["security"],
    popularity: 85,
    volatile: true,
    actionEn: "Generate again",
    actionDa: "Generér igen",
    fields: [
      { key: "words", labelEn: "Word count", labelDa: "Antal ord", kind: "number", defaultValue: "4" },
      {
        key: "lang",
        labelEn: "Word list",
        labelDa: "Ordliste",
        kind: "select",
        defaultValue: "en",
        options: [
          { value: "en", labelEn: "English", labelDa: "Engelsk" },
          { value: "da", labelEn: "Danish", labelDa: "Dansk" },
        ],
      },
      {
        key: "sep",
        labelEn: "Separator",
        labelDa: "Separator",
        kind: "select",
        defaultValue: "-",
        options: [
          { value: "-", labelEn: "Hyphen", labelDa: "Bindestreg" },
          { value: " ", labelEn: "Space", labelDa: "Mellemrum" },
          { value: ".", labelEn: "Dot", labelDa: "Punktum" },
        ],
      },
    ],
    compute: (v) => {
      const count = Math.min(10, Math.max(3, Math.floor(num(v.words) ?? 4)));
      const en =
        "apple river quiet yellow garden planet silver mountain ocean candle window forest canyon harbor lantern orbit pebble quarry raven sunset tunnel valley willow zebra coral meadow".split(
          " ",
        );
      const da =
        "æble flod stille gul have planet sølv bjerg hav stearinlys vindue skov kløft havn lygte kredsløb stenbrud ravn solnedgang tunnel dal piletræ zebra koral eng".split(
          " ",
        );
      const vocab = v.lang === "da" ? da : en;
      const picked: string[] = [];
      for (let i = 0; i < count; i++) {
        picked.push(vocab[randomInt(0, vocab.length - 1)]!);
      }
      const phrase = picked.join(v.sep || "-");
      return [
        { labelEn: "Passphrase", labelDa: "Sætning", value: phrase },
        { labelEn: "Characters", labelDa: "Tegn", value: String(phrase.length) },
      ];
    },
  },
  {
    id: "textstats",
    nameEn: "Text stats",
    nameDa: "Tekststatistik",
    descriptionEn: "Count characters, words, sentences, and paragraphs.",
    descriptionDa: "Tæl tegn, ord, sætninger og afsnit.",
    aliases: ["text stats", "character count", "sentence count", "tekststatistik"],
    intents: ["text", "count"],
    tags: ["text"],
    popularity: 86,
    fields: [
      {
        key: "text",
        labelEn: "Text",
        labelDa: "Tekst",
        multiline: true,
        defaultValue: "Hej verden. Dette er sætning to.\n\nNyt afsnit.",
      },
    ],
    compute: (v) => {
      const text = v.text ?? "";
      const chars = text.length;
      const charsNoSpace = text.replace(/\s/g, "").length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const sentences = (text.match(/[^.!?…]+[.!?…]+/g) ?? []).length || (text.trim() ? 1 : 0);
      const paragraphs = text.trim()
        ? text
            .trim()
            .split(/\n\s*\n/)
            .filter(Boolean).length
        : 0;
      return [
        { labelEn: "Words", labelDa: "Ord", value: String(words) },
        { labelEn: "Characters", labelDa: "Tegn", value: String(chars) },
        { labelEn: "Characters (no spaces)", labelDa: "Tegn uden mellemrum", value: String(charsNoSpace) },
        { labelEn: "Sentences", labelDa: "Sætninger", value: String(sentences) },
        { labelEn: "Paragraphs", labelDa: "Afsnit", value: String(paragraphs) },
      ];
    },
  },
  {
    id: "linecounter",
    nameEn: "Line counter",
    nameDa: "Linjetæller",
    descriptionEn: "Count lines, non-empty lines, and blank lines in text.",
    descriptionDa: "Tæl linjer, ikke-tomme linjer og blanke linjer i tekst.",
    aliases: ["line count", "count lines", "linjetæller"],
    intents: ["text", "count", "lines"],
    tags: ["text", "dev"],
    popularity: 78,
    fields: [
      {
        key: "text",
        labelEn: "Text",
        labelDa: "Tekst",
        multiline: true,
        defaultValue: "en\n\nto\ntre",
      },
    ],
    compute: (v) => {
      const lines = (v.text ?? "").split(/\r?\n/);
      const nonEmpty = lines.filter((l) => l.trim().length > 0).length;
      return [
        { labelEn: "Lines", labelDa: "Linjer", value: String(lines.length) },
        { labelEn: "Non-empty", labelDa: "Ikke-tomme", value: String(nonEmpty) },
        { labelEn: "Blank", labelDa: "Blanke", value: String(lines.length - nonEmpty) },
      ];
    },
  },
  {
    id: "listnumber",
    nameEn: "Number a list",
    nameDa: "Nummerér liste",
    descriptionEn: "Add or remove numbers in front of each line.",
    descriptionDa: "Tilføj eller fjern numre foran hver linje.",
    aliases: ["number list", "numbered list", "nummerér liste", "list numbers"],
    intents: ["text", "list"],
    tags: ["text"],
    popularity: 75,
    fields: [
      {
        key: "text",
        labelEn: "Lines",
        labelDa: "Linjer",
        multiline: true,
        defaultValue: "Mælk\nÆg\nBrød",
      },
      {
        key: "mode",
        labelEn: "Mode",
        labelDa: "Tilstand",
        kind: "select",
        defaultValue: "add",
        options: [
          { value: "add", labelEn: "Add numbers", labelDa: "Tilføj numre" },
          { value: "remove", labelEn: "Remove numbers", labelDa: "Fjern numre" },
        ],
      },
    ],
    compute: (v) => {
      const lines = (v.text ?? "").split(/\r?\n/);
      if (v.mode === "remove") {
        return [
          {
            labelEn: "Result",
            labelDa: "Resultat",
            value: lines.map((l) => l.replace(/^\s*\d+[.)]\s+/, "")).join("\n"),
          },
        ];
      }
      let n = 0;
      return [
        {
          labelEn: "Result",
          labelDa: "Resultat",
          value: lines
            .map((l) => {
              if (!l.trim()) return l;
              n += 1;
              return `${n}. ${l}`;
            })
            .join("\n"),
        },
      ];
    },
  },
  {
    id: "unitpricebulk",
    nameEn: "Bulk unit price",
    nameDa: "Stykpris ved mængde",
    descriptionEn: "Unit price and total when buying a pack of items.",
    descriptionDa: "Stykpris og total når du køber en pakke med flere stk.",
    aliases: ["unit price", "pack price", "stykpris", "pakkepris"],
    intents: ["price", "shopping"],
    tags: ["finance", "everyday"],
    popularity: 82,
    fields: [
      { key: "pack", labelEn: "Pack price", labelDa: "Pakkepris", kind: "number", defaultValue: "49" },
      { key: "count", labelEn: "Items in pack", labelDa: "Antal i pakken", kind: "number", defaultValue: "6" },
      { key: "want", labelEn: "How many you need", labelDa: "Hvor mange du skal bruge", kind: "number", defaultValue: "10" },
    ],
    compute: (v) => {
      const pack = num(v.pack);
      const count = num(v.count);
      const want = num(v.want);
      if (pack === undefined || count === undefined || want === undefined || pack < 0 || count <= 0 || want < 0) return null;
      const unit = pack / count;
      const packs = Math.ceil(want / count);
      return [
        moneyRow("Total cost", "Samlet pris", round(packs * pack, 2)),
        moneyRow("Unit price", "Stykpris", round(unit, 2)),
        { labelEn: "Packs to buy", labelDa: "Pakker at købe", value: String(packs) },
        { labelEn: "Leftover items", labelDa: "Til overs", value: String(packs * count - want) },
      ];
    },
  },
  {
    id: "tiponbill",
    nameEn: "Service fee on bill",
    nameDa: "Servicegebyr på regning",
    descriptionEn: "Add a service fee percent and split the new total.",
    descriptionDa: "Læg et servicegebyr i procent oveni og del den nye total.",
    aliases: ["service fee", "servicegebyr", "gebyr regning"],
    intents: ["tip", "bill", "fee"],
    tags: ["finance", "everyday"],
    popularity: 80,
    fields: [
      { key: "bill", labelEn: "Bill", labelDa: "Regning", kind: "number", defaultValue: "800" },
      { key: "fee", labelEn: "Fee (%)", labelDa: "Gebyr (%)", kind: "number", defaultValue: "10" },
      { key: "people", labelEn: "People", labelDa: "Personer", kind: "number", defaultValue: "4" },
    ],
    compute: (v) => {
      const bill = num(v.bill);
      const fee = num(v.fee);
      const people = Math.floor(num(v.people) ?? NaN);
      if (
        bill === undefined ||
        fee === undefined ||
        bill < 0 ||
        fee < 0 ||
        !Number.isFinite(people) ||
        people < 1
      ) {
        return null;
      }
      const feeAmount = bill * (fee / 100);
      const total = bill + feeAmount;
      return [
        moneyRow("Total", "Total", round(total, 2)),
        moneyRow("Per person", "Pr. person", round(total / people, 2)),
        moneyRow("Fee amount", "Gebyrbeløb", round(feeAmount, 2)),
      ];
    },
  },
  {
    id: "temperature",
    nameEn: "Temperature convert",
    nameDa: "Temperatur-omregner",
    descriptionEn: "Convert between Celsius, Fahrenheit, and Kelvin.",
    descriptionDa: "Omregn mellem Celsius, Fahrenheit og Kelvin.",
    aliases: ["celsius", "fahrenheit", "kelvin", "temperatur"],
    intents: ["convert", "temperature"],
    tags: ["everyday", "convert"],
    popularity: 89,
    fields: [
      { key: "value", labelEn: "Value", labelDa: "Værdi", kind: "number", defaultValue: "20" },
      {
        key: "from",
        labelEn: "From",
        labelDa: "Fra",
        kind: "select",
        defaultValue: "C",
        options: [
          { value: "C", labelEn: "Celsius", labelDa: "Celsius" },
          { value: "F", labelEn: "Fahrenheit", labelDa: "Fahrenheit" },
          { value: "K", labelEn: "Kelvin", labelDa: "Kelvin" },
        ],
      },
    ],
    compute: (v) => {
      const n = num(v.value);
      if (n === undefined) return null;
      let c = n;
      if (v.from === "F") c = ((n - 32) * 5) / 9;
      else if (v.from === "K") {
        if (n < 0) return null;
        c = n - 273.15;
      }
      const k = c + 273.15;
      if (k < 0) return null;
      return [
        { labelEn: "Celsius", labelDa: "Celsius", value: round(c, 2), numeric: true },
        { labelEn: "Fahrenheit", labelDa: "Fahrenheit", value: round((c * 9) / 5 + 32, 2), numeric: true },
        { labelEn: "Kelvin", labelDa: "Kelvin", value: round(k, 2), numeric: true },
      ];
    },
  },
  {
    id: "speedconvert",
    nameEn: "Speed convert",
    nameDa: "Hastigheds-omregner",
    descriptionEn: "Convert between km/h, mph, and m/s.",
    descriptionDa: "Omregn mellem km/t, mph og m/s.",
    aliases: ["kmh to mph", "speed converter", "hastighed", "km/t"],
    intents: ["convert", "speed"],
    tags: ["everyday", "convert"],
    popularity: 81,
    fields: [
      { key: "value", labelEn: "Value", labelDa: "Værdi", kind: "number", defaultValue: "100" },
      {
        key: "from",
        labelEn: "From",
        labelDa: "Fra",
        kind: "select",
        defaultValue: "kmh",
        options: [
          { value: "kmh", labelEn: "km/h", labelDa: "km/t" },
          { value: "mph", labelEn: "mph", labelDa: "mph" },
          { value: "ms", labelEn: "m/s", labelDa: "m/s" },
        ],
      },
    ],
    compute: (v) => {
      const n = num(v.value);
      if (n === undefined || n < 0) return null;
      let ms = n;
      if (v.from === "kmh") ms = n / 3.6;
      else if (v.from === "mph") ms = n * 0.44704;
      return [
        { labelEn: "km/h", labelDa: "km/t", value: round(ms * 3.6, 3), numeric: true },
        { labelEn: "mph", labelDa: "mph", value: round(ms / 0.44704, 3), numeric: true },
        { labelEn: "m/s", labelDa: "m/s", value: round(ms, 3), numeric: true },
      ];
    },
  },
  {
    id: "lengthconvert",
    nameEn: "Length convert",
    nameDa: "Længde-omregner",
    descriptionEn: "Convert between meters, kilometers, feet, and miles.",
    descriptionDa: "Omregn mellem meter, kilometer, fod og miles.",
    aliases: ["meters to feet", "km to miles", "længde", "meter fod"],
    intents: ["convert", "length"],
    tags: ["everyday", "convert"],
    popularity: 85,
    fields: [
      { key: "value", labelEn: "Value", labelDa: "Værdi", kind: "number", defaultValue: "1" },
      {
        key: "from",
        labelEn: "From",
        labelDa: "Fra",
        kind: "select",
        defaultValue: "m",
        options: [
          { value: "m", labelEn: "Meters", labelDa: "Meter" },
          { value: "km", labelEn: "Kilometers", labelDa: "Kilometer" },
          { value: "ft", labelEn: "Feet", labelDa: "Fod" },
          { value: "mi", labelEn: "Miles", labelDa: "Miles" },
        ],
      },
    ],
    compute: (v) => {
      const n = num(v.value);
      if (n === undefined || n < 0) return null;
      const toM: Record<string, number> = { m: 1, km: 1000, ft: 0.3048, mi: 1609.344 };
      const meters = n * (toM[v.from ?? "m"] ?? 1);
      return [
        { labelEn: "Meters", labelDa: "Meter", value: round(meters, 4), numeric: true },
        { labelEn: "Kilometers", labelDa: "Kilometer", value: round(meters / 1000, 6), numeric: true },
        { labelEn: "Feet", labelDa: "Fod", value: round(meters / 0.3048, 4), numeric: true },
        { labelEn: "Miles", labelDa: "Miles", value: round(meters / 1609.344, 6), numeric: true },
      ];
    },
  },
  {
    id: "weightconvert",
    nameEn: "Weight convert",
    nameDa: "Vægt-omregner",
    descriptionEn: "Convert between kilograms, grams, pounds, and ounces.",
    descriptionDa: "Omregn mellem kilogram, gram, pounds og ounces.",
    aliases: ["kg to lb", "pounds", "vægtomregner", "kilo gram"],
    intents: ["convert", "weight"],
    tags: ["everyday", "convert"],
    popularity: 86,
    fields: [
      { key: "value", labelEn: "Value", labelDa: "Værdi", kind: "number", defaultValue: "1" },
      {
        key: "from",
        labelEn: "From",
        labelDa: "Fra",
        kind: "select",
        defaultValue: "kg",
        options: [
          { value: "kg", labelEn: "Kilograms", labelDa: "Kilogram" },
          { value: "g", labelEn: "Grams", labelDa: "Gram" },
          { value: "lb", labelEn: "Pounds", labelDa: "Pounds" },
          { value: "oz", labelEn: "Ounces", labelDa: "Ounces" },
        ],
      },
    ],
    compute: (v) => {
      const n = num(v.value);
      if (n === undefined || n < 0) return null;
      const toKg: Record<string, number> = { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523125 };
      const kg = n * (toKg[v.from ?? "kg"] ?? 1);
      return [
        { labelEn: "Kilograms", labelDa: "Kilogram", value: round(kg, 6), numeric: true },
        { labelEn: "Grams", labelDa: "Gram", value: round(kg * 1000, 3), numeric: true },
        { labelEn: "Pounds", labelDa: "Pounds", value: round(kg / 0.45359237, 4), numeric: true },
        { labelEn: "Ounces", labelDa: "Ounces", value: round(kg / 0.028349523125, 4), numeric: true },
      ];
    },
  },
  {
    id: "checklistscore",
    nameEn: "Checklist score",
    nameDa: "Tjeklistescore",
    descriptionEn: "Score a yes/no checklist as percent complete.",
    descriptionDa: "Score en ja/nej-tjekliste som procent færdig.",
    aliases: ["checklist", "progress score", "tjekliste", "færdigprocent"],
    intents: ["checklist", "progress"],
    tags: ["productivity", "everyday"],
    popularity: 77,
    fields: [
      {
        key: "rows",
        labelEn: "Checklist",
        labelDa: "Tjekliste",
        multiline: true,
        defaultValue: "Pak taske:ja\nBilletter:nej\nOplader:ja",
        hintEn: "One item per line as name:yes or name:no",
        hintDa: "Ét punkt pr. linje som navn:ja eller navn:nej",
      },
    ],
    compute: (v) => {
      const lines = (v.rows ?? "").trim().split(/\r?\n/).filter(Boolean);
      if (!lines.length) return null;
      let done = 0;
      for (const line of lines) {
        const flag = (line.includes(":") ? line.split(":").pop() : line)
          ?.trim()
          .toLowerCase();
        if (
          flag === "yes" ||
          flag === "ja" ||
          flag === "1" ||
          flag === "true" ||
          flag === "x" ||
          flag === "done"
        ) {
          done += 1;
        }
      }
      return [
        {
          labelEn: "Complete %",
          labelDa: "Færdig %",
          value: round((done / lines.length) * 100, 1),
          numeric: true,
        },
        { labelEn: "Done", labelDa: "Færdige", value: `${done}/${lines.length}` },
        { labelEn: "Left", labelDa: "Tilbage", value: String(lines.length - done) },
      ];
    },
  },
  ...EXTRA_SIMPLE_TOOL_DEFS,
];

export const SIMPLE_TOOL_IDS = SIMPLE_TOOL_DEFS.map((d) => d.id);

export function getSimpleDef(id: string): SimpleToolDef | undefined {
  return SIMPLE_TOOL_DEFS.find((d) => d.id === id);
}
