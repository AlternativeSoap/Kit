import type { Locale } from "@/i18n/types";
import {
  addDays,
  businessDaysBetween,
  daysBetween,
  toInputValue,
} from "@/tools/builtin/dato/calc";
import {
  convertUnits,
  UNITS,
  type UnitCategory,
} from "@/tools/builtin/enheder/calc";
import { calculateTaktSeconds } from "@/tools/builtin/countdown/calc";
import {
  calculateLon,
  DEFAULT_HOURS_PER_WEEK,
  DEFAULT_TREKPROCENT,
  type LonInputMode,
  type LonResult,
} from "@/tools/builtin/lon/calc";
import {
  calculateBraendstof,
  type BraendstofResult,
} from "@/tools/builtin/braendstof/calc";
import {
  calculateFeriepenge,
  DEFAULT_FERIEPENGE_RATE,
  type FeriepengeResult,
} from "@/tools/builtin/feriepenge/calc";
import {
  calculateLan,
  termMonthsFromYearsAndExtra,
  type LanResult,
} from "@/tools/builtin/lan/calc";
import {
  calculateAvance,
  type AvanceResult,
} from "@/tools/builtin/avance/calc";
import {
  calculateTermin,
  type TerminInputMode,
  type TerminResult,
} from "@/tools/builtin/termin/calc";
import {
  calculateKilometerpenge,
  DEFAULT_RATE_PER_KM,
  type KilometerpengeResult,
} from "@/tools/builtin/kilometerpenge/calc";
import {
  calculateMoms,
  type MomsMode,
  type MomsResult,
} from "@/tools/builtin/moms/calc";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/tools/builtin/password/calc";
import {
  percentChange,
  percentOf,
  percentShare,
  type ProcentMode,
} from "@/tools/builtin/procent/calc";
import { evaluateArithmetic, type MathToken } from "./arithmetic";
import { minutesBetweenClocks, parseClockToken } from "./clock";
import { parseColor, type ColorAnswer } from "./color";
import { atNoon, nextYear, parseDateToken } from "./dates";
import { parseEmail, type EmailAnswer } from "./email";
import { MAX_JSON_LENGTH, parseJson, type JsonAnswer } from "./json";
import { NUMBER_SOURCE, parseLocaleNumber } from "./numbers";
import { parseTimestamp, type TimestampAnswer } from "./timestamp";
import { parseUrl, type UrlAnswer } from "./url";
import { parseUuid, type UuidAnswer } from "./uuid";
import { parseJwt, type JwtAnswer } from "./jwt";
import { parseCidr, type CidrAnswer } from "./cidr";

/**
 * What a search query asks for when it is a calculation rather than a tool
 * name. Every variant holds the inputs as they were read plus the result, so
 * the panel can show both and the tool can open with the same values.
 */
export type AnswerSpec =
  | { kind: "math"; tokens: MathToken[]; value: number }
  | { kind: "percent"; mode: ProcentMode; a: number; b: number; value: number }
  | {
      kind: "vat";
      mode: MomsMode;
      amount: number;
      result: MomsResult;
    }
  | {
      kind: "units";
      category: UnitCategory;
      value: number;
      from: string;
      to: string;
      result: number;
    }
  | {
      kind: "dateSpan";
      start: Date;
      end: Date;
      days: number;
      businessDays: number;
    }
  | {
      kind: "dateShift";
      start: Date;
      offset: number;
      businessOnly: boolean;
      result: Date;
    }
  | {
      kind: "clockSpan";
      startMinutes: number;
      endMinutes: number;
      durationMinutes: number;
    }
  | {
      kind: "throughput";
      units: number;
      availableSeconds: number;
      taktSeconds: number;
    }
  | { kind: "password"; length: number }
  | {
      kind: "random";
      min: number;
      max: number;
    }
  | {
      kind: "salary";
      mode: LonInputMode;
      gross: number;
      rate: number;
      /** True when no rate was typed and the tool default was used. */
      rateAssumed: boolean;
      result: LonResult;
    }
  | {
      /** Live rates/forecasts are never invented in Kit. */
      kind: "liveData";
      topic: "currency" | "weather";
      toolId: string;
      slug: string;
    }
  | UrlAnswer
  | ColorAnswer
  | JsonAnswer
  | TimestampAnswer
  | UuidAnswer
  | EmailAnswer
  | {
      kind: "mileage";
      km: number;
      rate: number;
      result: KilometerpengeResult;
    }
  | {
      kind: "fuel";
      km: number;
      consumption: number;
      price: number;
      result: BraendstofResult;
    }
  | {
      kind: "loan";
      principal: number;
      ratePercent: number;
      years: number;
      result: LanResult;
    }
  | {
      kind: "pregnancy";
      mode: TerminInputMode;
      anchor: Date;
      result: TerminResult;
    }
  | {
      kind: "holidayPay";
      pay: number;
      ratePercent: number;
      result: FeriepengeResult;
    }
  | {
      kind: "margin";
      cost: number;
      sell?: number;
      marginPercent?: number;
      markupPercent?: number;
      result: AvanceResult;
    }
  | JwtAnswer
  | CidrAnswer;

const MAX_QUERY_LENGTH = 80;

const N = `(${NUMBER_SOURCE})`;
const SIGNED = `(-?(?:${NUMBER_SOURCE}))`;
/** A number with an optional Danish currency marker: "1250", "1250 kr.", "1250,-". */
const AMOUNT = `${N}(?: ?(?:kr\\.?|dkk)|,-)?`;
const PERCENT = "(?:%|percent|pct\\.?|procent)";
const VAT = "(?:moms|vat|mva)";
const RATE = `(?: (?:at |ved |@ ?)?${N} ?%)?`;

function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[−–]/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/→/g, "->")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/ ?\?+$/, "");
}

function signedNumber(raw: string, locale: Locale): number | null {
  const negative = raw.startsWith("-");
  const value = parseLocaleNumber(negative ? raw.slice(1) : raw, locale);
  if (value === null) return null;
  return negative ? -value : value;
}

/* ------------------------------- VAT -------------------------------- */

type VatPattern = {
  pattern: RegExp;
  amount: number;
  rate: number;
  /** A fixed mode, or the capture group whose word decides it. */
  mode: MomsMode | { group: number };
};

const VAT_ADD_WORDS = new Set([
  "+",
  "plus",
  "med",
  "with",
  "ex",
  "eks",
  "ekskl",
  "excl",
  "exkl",
  "excluding",
  "eksklusiv",
  "eksklusive",
]);

const VAT_PATTERNS: VatPattern[] = [
  // "moms 1250", "vat on 1250", "moms 1250 12%"
  {
    pattern: new RegExp(`^${VAT} (?:af |of |on |på |pa )?${AMOUNT}${RATE}$`),
    amount: 1,
    rate: 2,
    mode: "add",
  },
  // "1250 moms"
  {
    pattern: new RegExp(`^${AMOUNT} ${VAT}${RATE}$`),
    amount: 1,
    rate: 2,
    mode: "add",
  },
  // "1250 + moms", "1250 minus vat"
  {
    pattern: new RegExp(`^${AMOUNT} ?(\\+|plus|-|minus) ?${VAT}${RATE}$`),
    amount: 1,
    rate: 3,
    mode: { group: 2 },
  },
  // "1250 med moms" adds VAT and "1250 uden moms" takes it out. The answer
  // states which way it was read and shows net, VAT and gross together.
  {
    pattern: new RegExp(`^${AMOUNT} (med|with|uden|without) ${VAT}${RATE}$`),
    amount: 1,
    rate: 3,
    mode: { group: 2 },
  },
  // "1250 ekskl. moms", "1250 incl vat"
  {
    pattern: new RegExp(
      `^${AMOUNT} (ex|eks|ekskl|excl|exkl|excluding|eksklusive?|inkl|incl|including|inklusive?)\\.? ${VAT}${RATE}$`,
    ),
    amount: 1,
    rate: 3,
    mode: { group: 2 },
  },
  // "læg moms til 1250", "add vat to 1250"
  {
    pattern: new RegExp(
      `^(?:add|læg|laeg|tilføj|tilfoj) ${VAT} (?:to|til) ${AMOUNT}${RATE}$`,
    ),
    amount: 1,
    rate: 2,
    mode: "add",
  },
  // "træk moms fra 1250", "remove vat from 1250"
  {
    pattern: new RegExp(
      `^(?:remove|subtract|fjern|træk|traek|fratræk|fratraek) ${VAT} (?:from|fra) ${AMOUNT}${RATE}$`,
    ),
    amount: 1,
    rate: 2,
    mode: "remove",
  },
];

// "12% moms af 1250"
const VAT_RATE_FIRST = new RegExp(
  `^${N} ?% ${VAT} (?:af|of|on|på|pa) ${AMOUNT}$`,
);

function parseVat(query: string, locale: Locale): AnswerSpec | null {
  let amountRaw: string | undefined;
  let rateRaw: string | undefined;
  let mode: MomsMode = "add";

  const rateFirst = VAT_RATE_FIRST.exec(query);
  if (rateFirst) {
    rateRaw = rateFirst[1];
    amountRaw = rateFirst[2];
  } else {
    for (const candidate of VAT_PATTERNS) {
      const match = candidate.pattern.exec(query);
      if (!match) continue;
      amountRaw = match[candidate.amount];
      rateRaw = match[candidate.rate];
      mode =
        typeof candidate.mode === "string"
          ? candidate.mode
          : VAT_ADD_WORDS.has(match[candidate.mode.group]!)
            ? "add"
            : "remove";
      break;
    }
  }

  if (!amountRaw) return null;
  const amount = parseLocaleNumber(amountRaw, locale);
  const rate = rateRaw ? parseLocaleNumber(rateRaw, locale) : 25;
  if (amount === null || rate === null) return null;

  const result = calculateMoms(amount, rate, mode);
  return result ? { kind: "vat", mode, amount, result } : null;
}

/* --------------------------- Mileage / fuel -------------------------- */

const MILEAGE_KM_RATE = new RegExp(
  `^${N} ?km ?[*×x] ?${N}(?: ?kr(?: ?/ ?km)?)?$`,
);
const MILEAGE_WORD = new RegExp(
  `^(?:kilometerpenge|kørselsgodtgørelse|korselsgodtgorelse) ?${N}(?: ?km)?$`,
);
const MILEAGE_ALLOWANCE = new RegExp(
  `^${N} ?km (?:allowance|godtgørelse|godtgorelse)$`,
);

const FUEL_TRIP = new RegExp(
  `^${N} ?km ${N} ?(?:l/?100 ?km|l ?per ?100) ${N}(?: ?kr(?: ?/ ?l)?)?$`,
);
const FUEL_WORD = new RegExp(
  `^(?:fuel|brændstof|braendstof) ?${N} ?km ?${N}(?: ?l)? ?${N}(?: ?kr)?$`,
);

function parseMileage(query: string, locale: Locale): AnswerSpec | null {
  let kmRaw: string | undefined;
  let rateRaw: string | undefined;

  const kmRate = MILEAGE_KM_RATE.exec(query);
  if (kmRate) {
    kmRaw = kmRate[1];
    rateRaw = kmRate[2];
  } else {
    const word = MILEAGE_WORD.exec(query);
    if (word) {
      kmRaw = word[1];
    } else {
      const allowance = MILEAGE_ALLOWANCE.exec(query);
      if (allowance) kmRaw = allowance[1];
    }
  }

  if (!kmRaw) return null;
  const km = parseLocaleNumber(kmRaw, locale);
  const rate = rateRaw
    ? parseLocaleNumber(rateRaw, locale)
    : DEFAULT_RATE_PER_KM;
  if (km === null || rate === null) return null;

  const result = calculateKilometerpenge(
    km,
    rate,
    "simple",
    20_000,
    2.23,
  );
  return result ? { kind: "mileage", km, rate, result } : null;
}

function parseFuel(query: string, locale: Locale): AnswerSpec | null {
  let kmRaw: string | undefined;
  let consumptionRaw: string | undefined;
  let priceRaw: string | undefined;

  const trip = FUEL_TRIP.exec(query);
  if (trip) {
    kmRaw = trip[1];
    consumptionRaw = trip[2];
    priceRaw = trip[3];
  } else {
    const word = FUEL_WORD.exec(query);
    if (word) {
      kmRaw = word[1];
      consumptionRaw = word[2];
      priceRaw = word[3];
    }
  }

  if (!kmRaw || !consumptionRaw || !priceRaw) return null;
  const km = parseLocaleNumber(kmRaw, locale);
  const consumption = parseLocaleNumber(consumptionRaw, locale);
  const price = parseLocaleNumber(priceRaw, locale);
  if (km === null || consumption === null || price === null) return null;

  const result = calculateBraendstof(km, consumption, price);
  return result
    ? { kind: "fuel", km, consumption, price, result }
  : null;
}

const LOAN_WORD = new RegExp(
  `^(?:loan|lan|lån|mortgage|realkredit) ${N}(?: ?kr)? ${N} ?${PERCENT} ${N}(?: ?(?:y|yr|years?|yrs?|år|ar|m|months?|mdr|måneder|maneder))?$`,
);

function parseLoanTerm(
  raw: string,
  locale: Locale,
  query: string,
): number | null {
  const value = parseLocaleNumber(raw, locale);
  if (value === null || value <= 0) return null;
  const tail = query.slice(query.lastIndexOf(raw) + raw.length).trim();
  if (/^(?:m|months?|mdr|måneder|maneder)/.test(tail)) {
    const months = Math.round(value);
    return months >= 1 && months <= 600 ? months : null;
  }
  return termMonthsFromYearsAndExtra(value, 0);
}

const HOLIDAY_PAY = [
  `^(?:feriepenge|ferietillæg|ferietillaeg|holiday pay|holiday allowance) ${AMOUNT}(?: (?:at |ved |@ ?)?${N} ?%)?$`,
  `^${AMOUNT} (?:feriepenge|ferietillæg|ferietillaeg)$`,
].map((source) => new RegExp(source));

function parseHolidayPay(query: string, locale: Locale): AnswerSpec | null {
  for (const pattern of HOLIDAY_PAY) {
    const match = pattern.exec(query);
    if (!match) continue;
    const pay = parseLocaleNumber(match[1]!, locale);
    if (pay === null || pay < 0) continue;
    const rateRaw = match[2];
    const ratePercent =
      rateRaw !== undefined
        ? parseLocaleNumber(rateRaw, locale)
        : DEFAULT_FERIEPENGE_RATE;
    if (ratePercent === null) continue;
    const result = calculateFeriepenge(pay, ratePercent);
    if (!result) continue;
    return { kind: "holidayPay", pay, ratePercent, result };
  }
  return null;
}

function parseLoan(query: string, locale: Locale): AnswerSpec | null {
  const match = LOAN_WORD.exec(query);
  if (!match) return null;

  const principal = parseLocaleNumber(match[1]!, locale);
  const ratePercent = parseLocaleNumber(match[2]!, locale);
  const termMonths = parseLoanTerm(match[3]!, locale, query);
  if (principal === null || ratePercent === null || termMonths === null) {
    return null;
  }

  const result = calculateLan(principal, ratePercent, termMonths);
  if (!result) return null;

  const years = Math.floor(termMonths / 12);
  return {
    kind: "loan",
    principal,
    ratePercent,
    years,
    result,
  };
}

const PREGNANCY_DUE = /^(?:termin|terminsdato|due date) (.+)$/;
const PREGNANCY_LMP =
  /^(?:graviditet|lmp|sidste menstruation|sm|last period) (.+)$/;

function parsePregnancy(query: string, now: Date): AnswerSpec | null {
  let mode: TerminInputMode | null = null;
  let dateRaw: string | undefined;

  const due = PREGNANCY_DUE.exec(query);
  if (due) {
    mode = "due";
    dateRaw = due[1];
  } else {
    const lmp = PREGNANCY_LMP.exec(query);
    if (lmp) {
      mode = "lmp";
      dateRaw = lmp[1];
    }
  }

  if (!mode || !dateRaw) return null;
  const parsed = parseDateToken(dateRaw.trim(), now);
  if (!parsed) return null;

  const inputValue = toInputValue(parsed.date);
  const result = calculateTermin(mode, inputValue, now);
  if (!result) return null;

  return { kind: "pregnancy", mode, anchor: parsed.date, result };
}

/* ----------------------------- Percent ------------------------------ */

const PERCENT_OF = new RegExp(
  `^(?:what is |what's |hvad er )?${N} ?${PERCENT} (?:of|af) ${AMOUNT}$`,
);

const PERCENT_SHARE = [
  // "50 out of 200", "50 ud af 200"
  new RegExp(`^${N} (?:out of|ud af) ${N}$`),
  // "50 of 200 in %", "50 af 200 i procent"
  new RegExp(`^${N} (?:of|af) ${N} (?:in |i |as (?:a )?)?${PERCENT}$`),
  // "what % is 50 of 200", "hvor mange procent er 50 af 200"
  new RegExp(
    `^(?:what|how many|how much|hvor mange|hvor meget) ?${PERCENT} (?:is|er) ${N} (?:of|af) ${N}$`,
  ),
  // "50 is what % of 200", "50 er hvor mange procent af 200"
  new RegExp(
    `^${N} (?:is|er) (?:what|how many|how much|hvor mange|hvor meget) ?${PERCENT} (?:of|af) ${N}$`,
  ),
];

const PERCENT_CHANGE = [
  // "from 100 to 120", "fra 100 til 120 i procent"
  new RegExp(
    `^(?:from|fra) ${SIGNED} (?:to|til) ${SIGNED}(?: (?:in |i )?${PERCENT})?$`,
  ),
  // "change 100 to 120", "stigning fra 100 til 120"
  new RegExp(
    `^(?:change|increase|decrease|difference|ændring|aendring|stigning|fald|forskel) (?:from |fra )?${SIGNED} (?:to|til|->) ${SIGNED}$`,
  ),
  // "100 -> 120"
  new RegExp(`^${SIGNED} ?-> ?${SIGNED}$`),
  // "100 to 120 %", "100 til 120 i procent"
  new RegExp(`^${SIGNED} (?:to|til) ${SIGNED} (?:in |i )?${PERCENT}$`),
];

/** Discount / markup amount: "15% off 200", "rabat 15% af 200", "20% markup on 100". */
const PERCENT_DISCOUNT = [
  new RegExp(
    `^${N} ?${PERCENT} (?:off|of|af|on|på|pa|rabat|discount|markup) ${AMOUNT}$`,
  ),
  new RegExp(
    `^(?:rabat|discount|markup|avance) (?:på |pa |of |af )?${N} ?${PERCENT} (?:(?:off|of|af|on|på|pa) )?${AMOUNT}$`,
  ),
  new RegExp(
    `^${AMOUNT} (?:minus|with |med )?(?:a )?${N} ?${PERCENT} (?:off|rabat|discount)$`,
  ),
];

const DANISH_SHORT_DATE = /^\d{1,2}\.\d{1,2}$/;

function parseMargin(query: string, locale: Locale): AnswerSpec | null {
  const markupOf = new RegExp(`^markup\\s+${N}\\s*%?\\s+of\\s+${N}$`).exec(query);
  if (markupOf) {
    const markupPercent = parseLocaleNumber(markupOf[1]!, locale);
    const cost = parseLocaleNumber(markupOf[2]!, locale);
    if (markupPercent === null || cost === null) return null;
    const result = calculateAvance({ cost, markupPercent });
    if (!result) return null;
    return { kind: "margin", cost, markupPercent, result };
  }

  const costSell = new RegExp(
    `^margin\\s+cost\\s+${N}\\s+sell\\s+${N}$`,
  ).exec(query);
  if (costSell) {
    const cost = parseLocaleNumber(costSell[1]!, locale);
    const sell = parseLocaleNumber(costSell[2]!, locale);
    if (cost === null || sell === null) return null;
    const result = calculateAvance({ cost, sell });
    if (!result) return null;
    return { kind: "margin", cost, sell, result };
  }

  const pair = new RegExp(
    `^(?:avance|margin)\\s+${N}\\s+${N}$`,
  ).exec(query);
  if (pair) {
    const cost = parseLocaleNumber(pair[1]!, locale);
    const sell = parseLocaleNumber(pair[2]!, locale);
    if (cost === null || sell === null) return null;
    const result = calculateAvance({ cost, sell });
    if (!result) return null;
    return { kind: "margin", cost, sell, result };
  }

  return null;
}

function parsePercent(query: string, locale: Locale): AnswerSpec | null {
  const build = (
    mode: ProcentMode,
    aRaw: string,
    bRaw: string,
  ): AnswerSpec | null => {
    const a = signedNumber(aRaw, locale);
    const b = signedNumber(bRaw, locale);
    if (a === null || b === null) return null;
    const value =
      mode === "of"
        ? percentOf(a, b)
        : mode === "change"
          ? percentChange(a, b)
          : percentShare(a, b);
    return value === null ? null : { kind: "percent", mode, a, b, value };
  };

  const of = PERCENT_OF.exec(query);
  if (of) return build("of", of[1]!, of[2]!);

  for (let i = 0; i < PERCENT_DISCOUNT.length; i++) {
    const match = PERCENT_DISCOUNT[i]!.exec(query);
    if (!match) continue;
    // Third pattern captures amount then percent; the others are percent then amount.
    if (i === 2) return build("of", match[2]!, match[1]!);
    return build("of", match[1]!, match[2]!);
  }

  for (const pattern of PERCENT_SHARE) {
    const match = pattern.exec(query);
    if (match) return build("share", match[1]!, match[2]!);
  }

  const mentionsPercent = new RegExp(PERCENT).test(query);
  for (const pattern of PERCENT_CHANGE) {
    const match = pattern.exec(query);
    if (!match) continue;
    // Danish writes dates as 12.3, so "fra 12.3 til 1.5" is a date range.
    const datePair =
      locale === "da" &&
      !mentionsPercent &&
      DANISH_SHORT_DATE.test(match[1]!) &&
      DANISH_SHORT_DATE.test(match[2]!);
    if (datePair) return null;
    return build("change", match[1]!, match[2]!);
  }

  return null;
}

/* ------------------------------ Salary ------------------------------ */

const SALARY_MONTHLY =
  "(?:løn|lon|salary|monthly salary|månedsløn|maanedslon|manedslon|bruttoløn|bruttolon)";
const SALARY_HOURLY = "(?:timeløn|timelon|hourly|hourly wage|hourly rate|hourly pay)";

const SALARY_PATTERNS: {
  pattern: RegExp;
  mode: LonInputMode;
  /** Capture group for the gross amount. */
  amountGroup: number;
  /** Capture group for an optional withholding rate. */
  rateGroup?: number;
}[] = [
  {
    pattern: new RegExp(`^${SALARY_MONTHLY} (?:af |of |på |pa )?${AMOUNT}${RATE}$`),
    mode: "monthly",
    amountGroup: 1,
    rateGroup: 2,
  },
  {
    pattern: new RegExp(`^${SALARY_HOURLY} (?:af |of |på |pa )?${AMOUNT}${RATE}$`),
    mode: "hourly",
    amountGroup: 1,
    rateGroup: 2,
  },
  {
    pattern: new RegExp(`^${AMOUNT} (?:i )?${SALARY_MONTHLY}${RATE}$`),
    mode: "monthly",
    amountGroup: 1,
    rateGroup: 2,
  },
  {
    pattern: new RegExp(`^${AMOUNT} (?:i )?${SALARY_HOURLY}${RATE}$`),
    mode: "hourly",
    amountGroup: 1,
    rateGroup: 2,
  },
  // "35000 gross to net", "35000 brutto til netto", "35000 bruttoløn til netto 38%"
  {
    pattern: new RegExp(
      `^${AMOUNT} (?:gross|brutto)(?:løn|lon| pay)? (?:to|til|->) (?:net|netto)(?:løn|lon| pay)?${RATE}$`,
    ),
    mode: "monthly",
    amountGroup: 1,
    rateGroup: 2,
  },
  // "netto for 35000", "nettoløn 35000", "net pay 35000"
  {
    pattern: new RegExp(
      `^(?:netto(?:løn|lon)?|nettoløn|nettolon|net pay) (?:for |af |of |på |pa )?${AMOUNT}${RATE}$`,
    ),
    mode: "monthly",
    amountGroup: 1,
    rateGroup: 2,
  },
  // "35000 netto", "35000 nettoløn"
  {
    pattern: new RegExp(
      `^${AMOUNT} (?:netto(?:løn|lon)?|nettoløn|nettolon|net)${RATE}$`,
    ),
    mode: "monthly",
    amountGroup: 1,
    rateGroup: 2,
  },
];

function parseSalary(query: string, locale: Locale): AnswerSpec | null {
  for (const { pattern, mode, amountGroup, rateGroup } of SALARY_PATTERNS) {
    const match = pattern.exec(query);
    if (!match) continue;

    const gross = parseLocaleNumber(match[amountGroup]!, locale);
    const rateRaw = rateGroup !== undefined ? match[rateGroup] : undefined;
    const rate = rateRaw
      ? parseLocaleNumber(rateRaw, locale)
      : DEFAULT_TREKPROCENT;
    if (gross === null || rate === null || rate > 100) return null;

    const result = calculateLon({
      mode,
      bruttoMonthly: mode === "monthly" ? gross : undefined,
      bruttoHourly: mode === "hourly" ? gross : undefined,
      hoursPerWeek: DEFAULT_HOURS_PER_WEEK,
      trekprocent: rate,
    });
    if (!result) return null;

    return {
      kind: "salary",
      mode,
      gross,
      rate,
      rateAssumed: !rateRaw,
      result,
    };
  }
  return null;
}

/* ----------------------------- Password ----------------------------- */

const PASSWORD_WORD = "(?:password|passwd|adgangskode|kodeord)";
const PASSWORD_UNIT = "(?:chars?|characters?|tegn)";

const PASSWORD_PATTERNS = [
  // "password 20", "kodeord 24 tegn", "password generator 20"
  new RegExp(
    `^${PASSWORD_WORD}(?: generator)? (?:på |pa |with |med )?(\\d{1,3})(?: ${PASSWORD_UNIT})?$`,
  ),
  // "20 char password", "24 tegn kodeord"
  new RegExp(`^(\\d{1,3})[ -]?(?:${PASSWORD_UNIT} )?${PASSWORD_WORD}$`),
];

function parsePassword(query: string): AnswerSpec | null {
  for (const pattern of PASSWORD_PATTERNS) {
    const match = pattern.exec(query);
    if (!match) continue;
    const length = Number(match[1]);
    if (length < PASSWORD_MIN_LENGTH || length > PASSWORD_MAX_LENGTH) {
      return null;
    }
    return { kind: "password", length };
  }
  return null;
}

/* ------------------------------ Units ------------------------------- */

const UNIT_ALIASES: Record<string, string[]> = {
  mm: ["mm", "millimeter", "millimeters", "millimetre", "millimetres"],
  cm: ["cm", "centimeter", "centimeters", "centimetre", "centimetres"],
  m: ["m", "meter", "meters", "metre", "metres"],
  km: ["km", "kilometer", "kilometers", "kilometre", "kilometres"],
  in: ["in", "inch", "inches", "tomme", "tommer"],
  ft: ["ft", "foot", "feet", "fod"],
  yd: ["yd", "yard", "yards"],
  mi: ["mi", "mile", "miles"],
  mg: ["mg", "milligram", "milligrams"],
  g: ["g", "gram", "grams"],
  kg: ["kg", "kilo", "kilos", "kilogram", "kilograms"],
  t: ["t", "tonne", "tonnes"],
  oz: ["oz", "ounce", "ounces"],
  lb: ["lb", "lbs", "pound", "pounds"],
  ml: ["ml", "milliliter", "milliliters", "millilitre", "millilitres"],
  l: ["l", "liter", "liters", "litre", "litres"],
  m3: [
    "m3",
    "m³",
    "kubikmeter",
    "cubic meter",
    "cubic meters",
    "cubic metre",
    "cubic metres",
  ],
  gal: ["gal", "gallon", "gallons"],
  c: ["c", "celsius"],
  f: ["f", "fahrenheit"],
  k: ["k", "kelvin"],
  b: ["b", "byte", "bytes"],
  kb: ["kb", "kilobyte", "kilobytes"],
  mb: ["mb", "megabyte", "megabytes"],
  gb: ["gb", "gigabyte", "gigabytes"],
  tb: ["tb", "terabyte", "terabytes"],
  kib: ["kib", "kibibyte", "kibibytes"],
  mib: ["mib", "mebibyte", "mebibytes"],
  gib: ["gib", "gibibyte", "gibibytes"],
  tib: ["tib", "tebibyte", "tebibytes"],
};

type UnitRef = { category: UnitCategory; id: string };

const UNIT_LOOKUP = new Map<string, UnitRef>();
for (const category of Object.keys(UNITS) as UnitCategory[]) {
  for (const unit of UNITS[category]) {
    for (const alias of UNIT_ALIASES[unit.id] ?? [unit.id]) {
      UNIT_LOOKUP.set(alias, { category, id: unit.id });
    }
  }
}

function resolveUnit(raw: string, locale: Locale): UnitRef | null {
  const name = raw.trim();
  // "ton" is 1,000 kg in Danish but can mean a short or long ton in English.
  if (locale === "da" && (name === "ton" || name === "tons")) {
    return { category: "weight", id: "t" };
  }
  return UNIT_LOOKUP.get(name) ?? null;
}

const UNIT_QUERY = new RegExp(`^${SIGNED} ?(.+)$`);
const UNIT_CONNECTORS = [" to ", " in ", " into ", " as ", " til ", " i ", " = ", " -> "];

function parseUnits(query: string, locale: Locale): AnswerSpec | null {
  const match = UNIT_QUERY.exec(query);
  if (!match) return null;

  const value = signedNumber(match[1]!, locale);
  if (value === null) return null;

  const rest = match[2]!
    .replace(/°/g, "")
    .replace(/\b(?:degrees?|grader?) /g, "")
    .trim();

  const pairs: [string, string][] = [];
  for (const connector of UNIT_CONNECTORS) {
    const index = rest.indexOf(connector);
    if (index > 0) {
      pairs.push([rest.slice(0, index), rest.slice(index + connector.length)]);
    }
  }
  const words = rest.split(" ");
  if (words.length === 2) pairs.push([words[0]!, words[1]!]);

  for (const [fromRaw, toRaw] of pairs) {
    const from = resolveUnit(fromRaw, locale);
    const to = resolveUnit(toRaw, locale);
    if (!from || !to || from.category !== to.category || from.id === to.id) {
      continue;
    }
    const result = convertUnits(from.category, value, from.id, to.id);
    if (result === null || !Number.isFinite(result)) continue;
    return {
      kind: "units",
      category: from.category,
      value,
      from: from.id,
      to: to.id,
      result,
    };
  }

  return null;
}

/* ------------------------------ Dates ------------------------------- */

const DAY_WORD = "(?:days?|dage?)";
const BUSINESS_DAY_WORD =
  "(?:business days?|working days?|work days?|workdays?|weekdays?|arbejdsdage?|hverdage?)";
const WEEK_WORD = "(?:weeks?|uger?)";
const PERIOD = `(${BUSINESS_DAY_WORD}|${DAY_WORD}|${WEEK_WORD})`;
const COUNT_PREFIX =
  "(?:days |dage |antal dage |number of days |how many days |hvor mange dage )?";

const SPAN_BETWEEN = new RegExp(
  `^${COUNT_PREFIX}(?:from|fra|between|mellem) (.+?) (?:to|til|and|og|until) (.+)$`,
);
const SPAN_PLAIN = /^(.+?) (?:to|til|->) (.+)$/;
const SPAN_UNTIL = new RegExp(
  `^(?:${DAY_WORD}|how many days|hvor mange dage|antal dage) (?:until|till|til|to|indtil) (.+)$`,
);
const SPAN_SINCE = new RegExp(
  `^(?:${DAY_WORD}|how many days|hvor mange dage|antal dage) (?:since|siden) (.+)$`,
);

const SHIFT_OPERATOR = new RegExp(`^(.+?) ?(\\+|-|plus|minus) ?(\\d{1,5}) ?${PERIOD}$`);
const SHIFT_RELATIVE = new RegExp(
  `^(\\d{1,5}) ${PERIOD} (from|after|fra|efter|before|før|foer) (.+)$`,
);
const SHIFT_FROM_NOW = new RegExp(`^(?:in|om) (\\d{1,5}) ${PERIOD}$`);
const SHIFT_AGO = new RegExp(
  `^(?:for )?(\\d{1,5}) ${PERIOD} (ago|siden|from now)$`,
);

function parsePeriod(
  count: string,
  word: string,
): { days: number; businessOnly: boolean } | null {
  const amount = Number(count);
  if (!Number.isInteger(amount)) return null;
  if (new RegExp(`^${WEEK_WORD}$`).test(word)) {
    return { days: amount * 7, businessOnly: false };
  }
  return {
    days: amount,
    businessOnly: new RegExp(`^${BUSINESS_DAY_WORD}$`).test(word),
  };
}

function buildShift(
  startRaw: string,
  count: string,
  word: string,
  direction: 1 | -1,
  now: Date,
): AnswerSpec | null {
  const start = parseDateToken(startRaw, now);
  const period = parsePeriod(count, word);
  if (!start || !period) return null;
  const offset = direction * period.days;
  return {
    kind: "dateShift",
    start: start.date,
    offset,
    businessOnly: period.businessOnly,
    result: addDays(start.date, offset, period.businessOnly),
  };
}

function buildSpan(start: Date, end: Date): AnswerSpec {
  return {
    kind: "dateSpan",
    start,
    end,
    days: daysBetween(start, end),
    businessDays: businessDaysBetween(start, end),
  };
}

function parseDates(query: string, now: Date): AnswerSpec | null {
  const today = atNoon(now);

  const operator = SHIFT_OPERATOR.exec(query);
  if (operator) {
    const direction = operator[2] === "+" || operator[2] === "plus" ? 1 : -1;
    const shift = buildShift(operator[1]!, operator[3]!, operator[4]!, direction, now);
    if (shift) return shift;
  }

  const relative = SHIFT_RELATIVE.exec(query);
  if (relative) {
    const before = ["before", "før", "foer"].includes(relative[3]!);
    const shift = buildShift(
      relative[4]!,
      relative[1]!,
      relative[2]!,
      before ? -1 : 1,
      now,
    );
    if (shift) return shift;
  }

  const fromNow = SHIFT_FROM_NOW.exec(query);
  if (fromNow) return buildShift("today", fromNow[1]!, fromNow[2]!, 1, now);

  const ago = SHIFT_AGO.exec(query);
  if (ago) {
    return buildShift("today", ago[1]!, ago[2]!, ago[3] === "from now" ? 1 : -1, now);
  }

  const until = SPAN_UNTIL.exec(query);
  if (until) {
    const end = parseDateToken(until[1]!, now);
    if (!end) return null;
    // "days until 1/1" asked in November means the coming 1 January.
    const date = !end.hasYear && end.date < today ? nextYear(end.date) : end.date;
    return buildSpan(today, date);
  }

  const since = SPAN_SINCE.exec(query);
  if (since) {
    const start = parseDateToken(since[1]!, now);
    return start ? buildSpan(start.date, today) : null;
  }

  for (const pattern of [SPAN_BETWEEN, SPAN_PLAIN]) {
    const match = pattern.exec(query);
    if (!match) continue;
    const start = parseDateToken(match[1]!, now);
    const end = parseDateToken(match[2]!, now);
    if (!start || !end) continue;
    // "from 20/12 to 5/1" runs into the next year.
    const endDate =
      !end.hasYear && end.date < start.date ? nextYear(end.date) : end.date;
    return buildSpan(start.date, endDate);
  }

  return null;
}

/* ------------------------------- Math ------------------------------- */

// A typed date such as 2026-03-12 or 12/3/2026 is not a subtraction.
const DATE_LIKE = /^(?:\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})$/;

function parseMath(query: string, locale: Locale): AnswerSpec | null {
  if (DATE_LIKE.test(query)) return null;
  // Clock times are not arithmetic ("7:30-15:45").
  if (/\d[:.]\d{2}/.test(query)) return null;
  const result = evaluateArithmetic(query, locale);
  return result ? { kind: "math", ...result } : null;
}

/* ---------------------------- Clock span ---------------------------- */

const CLOCK_SPAN_PATTERNS = [
  /^(?:from |fra |mellem |between )?(\d{1,2}[:.]\d{2}) (?:to|til|and|og|-|–) (\d{1,2}[:.]\d{2})$/,
  /^(\d{1,2}[:.]\d{2})\s*-\s*(\d{1,2}[:.]\d{2})$/,
];

function parseClockSpan(query: string): AnswerSpec | null {
  for (const pattern of CLOCK_SPAN_PATTERNS) {
    const match = pattern.exec(query);
    if (!match) continue;
    const startMinutes = parseClockToken(match[1]!);
    const endMinutes = parseClockToken(match[2]!);
    if (startMinutes === null || endMinutes === null) continue;
    return {
      kind: "clockSpan",
      startMinutes,
      endMinutes,
      durationMinutes: minutesBetweenClocks(startMinutes, endMinutes),
    };
  }
  return null;
}

/* ---------------------------- Throughput ---------------------------- */

const THROUGHPUT_UNIT =
  "(?:products?|units?|items?|pieces?|stk|styk|enheder|cyklusser|cycles?)";
const THROUGHPUT_TIME =
  "(?:hours?|timer|hrs?|minutes?|mins?|minutter)";

function parseThroughput(query: string, locale: Locale): AnswerSpec | null {
  const match = new RegExp(
    `^${N} ${THROUGHPUT_UNIT} (?:in|på|pa|i|per) ${N} ${THROUGHPUT_TIME}$`,
  ).exec(query);
  if (!match) return null;

  const units = parseLocaleNumber(match[1]!, locale);
  const amount = parseLocaleNumber(match[2]!, locale);
  if (units === null || amount === null || units <= 0 || amount <= 0) {
    return null;
  }

  const timeWord = query.split(" ").at(-1) ?? "";
  const availableSeconds = /min/.test(timeWord) ? amount * 60 : amount * 3600;
  const taktSeconds = calculateTaktSeconds(availableSeconds, units);
  if (taktSeconds === null) return null;

  return {
    kind: "throughput",
    units,
    availableSeconds,
    taktSeconds,
  };
}

/* ------------------------------ Random ------------------------------ */

function parseRandom(query: string): AnswerSpec | null {
  // "random", "tilfældigt tal", "random number"
  if (
    /^(?:random(?: number)?|tilfældigt tal|tilfaeldigt tal|dice)$/.test(query)
  ) {
    return { kind: "random", min: 1, max: 100 };
  }

  // "random 6", "random 1-100", "tilfældigt tal 50"
  const maxOnly = /^(?:random(?: number)?|tilfældigt tal|tilfaeldigt tal|dice) (\d{1,6})$/.exec(
    query,
  );
  if (maxOnly) {
    const max = Number(maxOnly[1]);
    if (max < 2) return null;
    return { kind: "random", min: 1, max };
  }

  const range = /^(?:random(?: number)?|tilfældigt tal|tilfaeldigt tal) (\d{1,6})\s*-\s*(\d{1,6})$/.exec(
    query,
  );
  if (range) {
    const min = Number(range[1]);
    const max = Number(range[2]);
    if (max <= min || max - min > 1_000_000) return null;
    return { kind: "random", min, max };
  }

  // "6 digit random", "6 cifret tilfældigt"
  const digits = /^(\d{1,2})[ -]?(?:digit|digits|cifret|cifre)(?: random| tilfældigt| tilfaeldigt)?$/.exec(
    query,
  );
  if (digits) {
    const n = Number(digits[1]);
    if (n < 1 || n > 9) return null;
    const min = n === 1 ? 0 : 10 ** (n - 1);
    const max = 10 ** n - 1;
    return { kind: "random", min, max };
  }

  // "pin 4", "4 digit pin", "pinkode 6"
  const pinNamed =
    /^(?:pin|pinkode|pin code)(?: code)? (\d)$/.exec(query) ??
    /^(\d)[ -]?(?:digit |cifret )?pin(?:kode| code)?$/.exec(query);
  if (pinNamed) {
    const n = Number(pinNamed[1]);
    if (n < 3 || n > 8) return null;
    const min = 10 ** (n - 1);
    const max = 10 ** n - 1;
    return { kind: "random", min, max };
  }

  return null;
}

/* ----------------------------- Live data ---------------------------- */

function parseLiveData(query: string): AnswerSpec | null {
  // Plain tool names should open search hits, not this refusal card.
  if (
    /^(?:valuta|valutakurser|exchange|kurser|nationalbanken|dmi|yr|vejr|weather)$/.test(
      query,
    )
  ) {
    return null;
  }

  const asksCurrencyPair =
    /(?:usd|eur|gbp|dkk|dollar|euro|pund).*(?:to|til|->).*(?:usd|eur|gbp|dkk|dollar|euro|pund)/.test(
      query,
    ) ||
    /^(?:\d[\d.,]* )?(?:usd|eur|gbp|dkk|dollar|euro)s? (?:to|til|->) (?:usd|eur|gbp|dkk|dollar|euro)/.test(
      query,
    ) ||
    /^(?:exchange rate|valutakurs|fx rate)(?: .+)?$/.test(query);

  if (asksCurrencyPair && !/(?:løn|lon|salary|moms|vat)/.test(query)) {
    return {
      kind: "liveData",
      topic: "currency",
      toolId: "valutakurser",
      slug: "valutakurser",
    };
  }

  if (
    /^(?:vejr|weather|vejrudsigt|forecast)(?: (?:today|tomorrow|i dag|i morgen|in copenhagen|i københavn|i kobenhavn|in denmark|i danmark))?$/.test(
      query,
    )
  ) {
    return {
      kind: "liveData",
      topic: "weather",
      toolId: "dmi",
      slug: "dmi",
    };
  }

  return null;
}

/* -------------------------------------------------------------------- */

/**
 * Reads a search query as a calculation or literal. Returns null unless the
 * whole query matches a known phrasing, so ordinary tool searches are never
 * hijacked.
 *
 * Parser order (high level):
 * 1. Literals that need no digits (URL, email, UUID, JSON, color)
 * 2. Live data / random without digits
 * 3. Labeled or strict unix timestamps (before math)
 * 4. Existing VAT / percent / salary / dates / units / math
 */
export function parseAnswer(
  query: string,
  locale: Locale,
  now: Date,
): AnswerSpec | null {
  const rawTrimmed = query.trim();
  // JSON keeps original casing/spacing; allow longer payloads than normal IA.
  if (
    rawTrimmed.length >= 2 &&
    (rawTrimmed[0] === "{" || rawTrimmed[0] === "[") &&
    rawTrimmed.length <= MAX_JSON_LENGTH
  ) {
    const json = parseJson(rawTrimmed);
    if (json) return json;
  }

  const jwt = parseJwt(rawTrimmed);
  if (jwt) return jwt;

  const normalized = normalizeQuery(query);
  if (!normalized) return null;

  // Structural literals before the short-query length gate.
  const literal =
    parseUrl(normalized) ??
    parseUrl(rawTrimmed) ??
    parseEmail(normalized) ??
    parseUuid(normalized) ??
    parseColor(normalized) ??
    parseCidr(normalized);
  if (literal) return literal;

  if (normalized.length > MAX_QUERY_LENGTH) return null;

  // Live data and some random phrasings need no digits.
  const withoutDigit =
    parseLiveData(normalized) ?? parseRandom(normalized);
  if (withoutDigit) return withoutDigit;

  // Unix timestamps: labeled forms, or bare 10–13 digit integers.
  const timestamp = parseTimestamp(normalized);
  if (timestamp) return timestamp;

  if (!/\d/.test(normalized)) return null;

  return (
    parseVat(normalized, locale) ??
    parseMileage(normalized, locale) ??
    parseFuel(normalized, locale) ??
    parseLoan(normalized, locale) ??
    parseHolidayPay(normalized, locale) ??
    parsePregnancy(normalized, now) ??
    parseMargin(normalized, locale) ??
    parsePercent(normalized, locale) ??
    parseSalary(normalized, locale) ??
    parsePassword(normalized) ??
    parseRandom(normalized) ??
    parseClockSpan(normalized) ??
    parseThroughput(normalized, locale) ??
    parseUnits(normalized, locale) ??
    parseDates(normalized, now) ??
    parseMath(normalized, locale)
  );
}
