export type CronExplain = {
  expression: string;
  expanded: string;
  fields: [string, string, string, string, string];
  summaryEn: string;
  summaryDa: string;
  valid: boolean;
  error?: string;
};

const ALIASES: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@hourly": "0 * * * *",
  "@midnight": "0 0 * * *",
};

const DOW_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DOW_DA = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
];

const MONTH_EN = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTH_DA = [
  "",
  "januar",
  "februar",
  "marts",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "december",
];

function explainField(
  field: string,
  kind: "minute" | "hour" | "dom" | "month" | "dow",
  locale: "en" | "da",
): string {
  if (field === "*") {
    const any: Record<typeof kind, [string, string]> = {
      minute: ["every minute", "hvert minut"],
      hour: ["every hour", "hver time"],
      dom: ["every day of the month", "hver dag i måneden"],
      month: ["every month", "hver måned"],
      dow: ["every day of the week", "hver ugedag"],
    };
    return locale === "da" ? any[kind][1] : any[kind][0];
  }

  if (field.startsWith("*/")) {
    const step = field.slice(2);
    const templates: Record<typeof kind, [string, string]> = {
      minute: [`every ${step} minutes`, `hvert ${step}. minut`],
      hour: [`every ${step} hours`, `hver ${step}. time`],
      dom: [`every ${step} days of the month`, `hver ${step}. dag i måneden`],
      month: [`every ${step} months`, `hver ${step}. måned`],
      dow: [`every ${step} days of the week`, `hver ${step}. ugedag`],
    };
    return locale === "da" ? templates[kind][1] : templates[kind][0];
  }

  if (kind === "dow") {
    const n = Number(field);
    if (Number.isInteger(n) && n >= 0 && n <= 7) {
      const index = n === 7 ? 0 : n;
      return locale === "da" ? `på ${DOW_DA[index]}` : `on ${DOW_EN[index]}`;
    }
  }

  if (kind === "month") {
    const n = Number(field);
    if (Number.isInteger(n) && n >= 1 && n <= 12) {
      return locale === "da" ? `i ${MONTH_DA[n]}` : `in ${MONTH_EN[n]}`;
    }
  }

  if (kind === "hour") {
    const n = Number(field);
    if (Number.isInteger(n) && n >= 0 && n <= 23) {
      const hh = String(n).padStart(2, "0");
      return locale === "da" ? `kl. ${hh}:00` : `at ${hh}:00`;
    }
  }

  if (kind === "minute") {
    const n = Number(field);
    if (Number.isInteger(n) && n >= 0 && n <= 59) {
      return locale === "da"
        ? `ved minut ${n}`
        : `at minute ${n}`;
    }
  }

  if (kind === "dom") {
    const n = Number(field);
    if (Number.isInteger(n) && n >= 1 && n <= 31) {
      return locale === "da"
        ? `på dag ${n} i måneden`
        : `on day ${n} of the month`;
    }
  }

  return field;
}

function buildSummary(
  fields: [string, string, string, string, string],
  locale: "en" | "da",
): string {
  const [minute, hour, dom, month, dow] = fields;
  const parts = [
    explainField(minute, "minute", locale),
    explainField(hour, "hour", locale),
    explainField(dom, "dom", locale),
    explainField(month, "month", locale),
    explainField(dow, "dow", locale),
  ];
  if (locale === "da") {
    return `Kører ${parts[0]}, ${parts[1]}, ${parts[2]}, ${parts[3]}, ${parts[4]}.`;
  }
  return `Runs ${parts[0]}, ${parts[1]}, ${parts[2]}, ${parts[3]}, ${parts[4]}.`;
}

export function explainCron(expression: string): CronExplain {
  const raw = expression.trim();
  if (!raw) {
    return {
      expression: raw,
      expanded: raw,
      fields: ["", "", "", "", ""],
      summaryEn: "",
      summaryDa: "",
      valid: false,
      error: "empty",
    };
  }

  const lower = raw.toLowerCase();
  const expanded = ALIASES[lower] ?? raw;
  const parts = expanded.split(/\s+/).filter(Boolean);

  if (parts.length !== 5) {
    return {
      expression: raw,
      expanded,
      fields: ["", "", "", "", ""],
      summaryEn: "",
      summaryDa: "",
      valid: false,
      error: "fields",
    };
  }

  const fields = parts as [string, string, string, string, string];
  return {
    expression: raw,
    expanded,
    fields,
    summaryEn: buildSummary(fields, "en"),
    summaryDa: buildSummary(fields, "da"),
    valid: true,
  };
}