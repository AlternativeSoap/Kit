/** Compact definitions for high-demand utility builtins. */

export type SimpleField = {
  key: string;
  labelEn: string;
  labelDa: string;
  hintEn?: string;
  hintDa?: string;
  defaultValue?: string;
  multiline?: boolean;
  kind?: "number" | "text" | "select";
  options?: { value: string; labelEn: string; labelDa: string }[];
};

export type SimpleResultRow = {
  labelEn: string;
  labelDa: string;
  value: string;
  /** Optional localized display for non-numeric human text. */
  valueDa?: string;
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
      const cycles = num(v.cycles);
      if (!m || cycles === undefined || cycles < 1) return null;
      const wakeMin = Number(m[1]) * 60 + Number(m[2]);
      const fallAsleep = 15;
      const bed = (wakeMin - fallAsleep - cycles * 90 + 24 * 60) % (24 * 60);
      const hh = String(Math.floor(bed / 60)).padStart(2, "0");
      const mm = String(bed % 60).padStart(2, "0");
      return [
        { labelEn: "Suggested bedtime", labelDa: "Foreslået sengetid", value: `${hh}:${mm}` },
        { labelEn: "Sleep length", labelDa: "Søvnlængde", value: `${cycles * 1.5} h` },
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
      const bytes = new Uint8Array(len);
      crypto.getRandomValues(bytes);
      let out = "";
      for (let i = 0; i < len; i++) out += alphabet[bytes[i]! % alphabet.length];
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
      const people = num(v.people);
      if (total === undefined || !people || people < 1) return null;
      return [
        { labelEn: "Per person", labelDa: "Pr. person", value: round(total / people, 2) },
      ];
    },
  },
  {
    id: "pomodoro",
    nameEn: "Pomodoro timer",
    nameDa: "Pomodoro-timer",
    descriptionEn: "Classic 25/5 focus intervals (timer runs in the tool page).",
    descriptionDa: "Klassiske 25/5 fokusintervaller (timeren kører på værktøjssiden).",
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
          labelDa: "Note",
          value: "Use the stopwatch tool for a live countdown, or start focus on your phone.",
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
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      const n = min + (buf[0]! % (max - min + 1));
      return [{ labelEn: "Result", labelDa: "Resultat", value: String(n) }];
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
    descriptionEn: "Roll one or more dice with a chosen number of sides.",
    descriptionDa: "Kast en eller flere terninger med valgt antal sider.",
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
      const count = Math.min(20, Math.max(1, Math.floor(num(v.count) ?? 1)));
      const sides = Math.min(1000, Math.max(2, Math.floor(num(v.sides) ?? 6)));
      const rolls: number[] = [];
      for (let i = 0; i < count; i++) {
        rolls.push(1 + Math.floor(Math.random() * sides));
      }
      const total = rolls.reduce((a, b) => a + b, 0);
      return [
        { labelEn: "Rolls", labelDa: "Kast", value: rolls.join(", ") },
        { labelEn: "Total", labelDa: "Sum", value: String(total) },
      ];
    },
  },
];

export const SIMPLE_TOOL_IDS = SIMPLE_TOOL_DEFS.map((d) => d.id);

export function getSimpleDef(id: string): SimpleToolDef | undefined {
  return SIMPLE_TOOL_DEFS.find((d) => d.id === id);
}
