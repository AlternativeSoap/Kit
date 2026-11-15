import type { Dictionary, Locale } from "@/i18n/types";
import {
  formatCompact,
  formatKr,
  formatNumber,
  formatPrecise,
} from "@/lib/format";
import { formatDuration } from "@/tools/builtin/countdown/calc";
import { formatDisplayDate, toInputValue } from "@/tools/builtin/dato/calc";
import { toolHref } from "@/tools/prefill";
import { formatExpression } from "./arithmetic";
import { formatClock } from "./clock";
import type { AnswerSpec } from "./parse";

/** Everything the search panel needs to show one answer. */
export type AnswerView = {
  /** Registry tool id that opens with related values filled in. */
  toolId?: string;
  /** Prefill URL when a destination tool exists. */
  href?: string;
  primary: string;
  /** Short unit shown after the result, such as "mi" or "%". */
  unit?: string;
  /** Monospace result, used for passwords. */
  mono?: boolean;
  /** How the query was read, so a wrong guess is easy to spot. */
  caption: string;
  details: { label: string; value: string }[];
  copyValue: string;
  /** Enter/click copies by default; live-data rows open the destination. */
  primaryAction?: "copy" | "open";
  /** Optional swatch for color answers. */
  swatch?: string;
};

export type AnswerContext = {
  locale: Locale;
  dictionary: Dictionary;
  /** The generated password for a password answer. */
  password?: string;
  /** The generated random value for a random answer. */
  randomValue?: number;
};

const UNIT_SYMBOLS: Record<string, string> = {
  m3: "m³",
  gal: "US gal",
  c: "°C",
  f: "°F",
  k: "K",
  b: "B",
  kb: "KB",
  mb: "MB",
  gb: "GB",
  tb: "TB",
  kib: "KiB",
  mib: "MiB",
  gib: "GiB",
  tib: "TiB",
};

function unitSymbol(id: string): string {
  return UNIT_SYMBOLS[id] ?? id;
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? values[key]! : match,
  );
}

function shortDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Turns a parsed answer into display text and a prefilled tool link. */
export function presentAnswer(
  spec: AnswerSpec,
  { locale, dictionary, password, randomValue }: AnswerContext,
): AnswerView | null {
  const t = dictionary.answers;
  const precise = (value: number) => formatPrecise(value, locale);

  switch (spec.kind) {
    case "math": {
      const primary = precise(spec.value);
      return {
        toolId: "lommeregner",
        href: toolHref("lommeregner", {
          value: String(Number(spec.value.toPrecision(12))),
        }),
        primary,
        caption: formatExpression(spec.tokens, precise),
        details: [],
        copyValue: primary,
      };
    }

    case "percent": {
      const number = formatCompact(spec.value, locale);
      const href = toolHref("procent", {
        mode: spec.mode,
        a: spec.a,
        b: spec.b,
      });
      if (spec.mode === "of") {
        return {
          toolId: "procent",
          href,
          primary: number,
          caption: fill(t.percentOf, { p: precise(spec.a), b: precise(spec.b) }),
          details: [],
          copyValue: number,
        };
      }
      return {
        toolId: "procent",
        href,
        primary: spec.mode === "change" && spec.value > 0 ? `+${number}` : number,
        unit: "%",
        caption: fill(
          spec.mode === "change" ? t.percentChange : t.percentShare,
          { a: precise(spec.a), b: precise(spec.b) },
        ),
        details: [],
        copyValue: number,
      };
    }

    case "vat": {
      const { net, vat, gross, ratePercent } = spec.result;
      const target = spec.mode === "add" ? gross : net;
      return {
        toolId: "moms",
        href: toolHref("moms", {
          amount: spec.amount,
          mode: spec.mode,
          rate: ratePercent,
        }),
        primary: formatKr(target, locale, 2),
        caption: fill(spec.mode === "add" ? t.vatAdded : t.vatIncluded, {
          amount: formatKr(spec.amount, locale, 2),
          rate: precise(ratePercent),
        }),
        details: [
          { label: dictionary.moms.net, value: formatKr(net, locale, 2) },
          { label: dictionary.moms.vat, value: formatKr(vat, locale, 2) },
          { label: dictionary.moms.gross, value: formatKr(gross, locale, 2) },
        ],
        copyValue: formatNumber(target, locale, 2),
      };
    }

    case "mileage": {
      return {
        toolId: "kilometerpenge",
        href: toolHref("kilometerpenge", {
          km: spec.km,
          rate: spec.rate,
        }),
        primary: formatKr(spec.result.total, locale, 2),
        caption: fill(t.mileageCaption, {
          km: precise(spec.km),
          rate: precise(spec.rate),
        }),
        details: [],
        copyValue: formatNumber(spec.result.total, locale, 2),
      };
    }

    case "fuel": {
      return {
        toolId: "braendstof",
        href: toolHref("braendstof", {
          km: spec.km,
          consumption: spec.consumption,
          price: spec.price,
        }),
        primary: formatKr(spec.result.totalCost, locale, 2),
        caption: fill(t.fuelCaption, {
          km: precise(spec.km),
          consumption: precise(spec.consumption),
          price: precise(spec.price),
        }),
        details: [
          {
            label: dictionary.braendstof.liters,
            value: `${formatNumber(spec.result.amountUsed, locale, 2)} L`,
          },
        ],
        copyValue: formatNumber(spec.result.totalCost, locale, 2),
      };
    }

    case "loan": {
      return {
        toolId: "lan",
        href: toolHref("lan", {
          principal: spec.principal,
          rate: spec.ratePercent,
          years: spec.years,
        }),
        primary: formatKr(spec.result.monthlyPayment, locale, 2),
        caption: fill(t.loanCaption, {
          principal: precise(spec.principal),
          rate: precise(spec.ratePercent),
          years: precise(spec.years),
        }),
        details: [
          {
            label: dictionary.lan.totalInterest,
            value: formatKr(spec.result.totalInterest, locale, 0),
          },
        ],
        copyValue: formatNumber(spec.result.monthlyPayment, locale, 2),
      };
    }

    case "holidayPay": {
      return {
        toolId: "feriepenge",
        href: toolHref("feriepenge", {
          pay: spec.pay,
          rate: spec.ratePercent,
        }),
        primary: formatKr(spec.result.amount, locale, 2),
        caption: fill(t.holidayPayCaption, {
          pay: formatKr(spec.pay, locale, 0),
          rate: precise(spec.ratePercent),
        }),
        details: [],
        copyValue: formatNumber(spec.result.amount, locale, 2),
      };
    }

    case "pregnancy": {
      const weekLabel = dictionary.termin.weekLabel
        .replace("{week}", String(spec.result.pregnancyWeek))
        .replace("{day}", String(spec.result.pregnancyDayOfWeek));
      return {
        toolId: "termin",
        href: toolHref("termin", {
          mode: spec.mode,
          date: toInputValue(spec.anchor),
        }),
        primary: weekLabel,
        caption: fill(t.pregnancyCaption, {
          week: precise(spec.result.pregnancyWeek),
          day: precise(spec.result.pregnancyDayOfWeek),
          date: shortDate(spec.result.due, locale),
        }),
        details: [
          {
            label: dictionary.termin.daysRemaining,
            value:
              spec.result.daysRemaining >= 0
                ? dictionary.termin.daysCount.replace(
                    "{n}",
                    String(spec.result.daysRemaining),
                  )
                : dictionary.termin.pastDue,
          },
        ],
        copyValue: weekLabel,
      };
    }

    case "units": {
      const primary = formatCompact(spec.result, locale);
      return {
        toolId: "enheder",
        href: toolHref("enheder", {
          category: spec.category,
          value: spec.value,
          from: spec.from,
          to: spec.to,
        }),
        primary,
        unit: unitSymbol(spec.to),
        caption: fill(t.unitsCaption, {
          value: precise(spec.value),
          from: unitSymbol(spec.from),
          to: unitSymbol(spec.to),
        }),
        details: [],
        copyValue: primary,
      };
    }

    case "dateSpan": {
      const primary = precise(spec.days);
      return {
        toolId: "dato",
        href: toolHref("dato", {
          start: toInputValue(spec.start),
          end: toInputValue(spec.end),
        }),
        primary,
        unit: Math.abs(spec.days) === 1 ? t.day : t.days,
        caption: fill(t.spanCaption, {
          start: shortDate(spec.start, locale),
          end: shortDate(spec.end, locale),
        }),
        details: [{ label: t.weekdays, value: precise(spec.businessDays) }],
        copyValue: primary,
      };
    }

    case "dateShift": {
      const primary = formatDisplayDate(spec.result, locale);
      const count = Math.abs(spec.offset);
      const unit = spec.businessOnly
        ? count === 1
          ? t.weekday
          : t.weekdaysUnit
        : count === 1
          ? t.day
          : t.days;
      return {
        toolId: "dato",
        href: toolHref("dato", {
          start: toInputValue(spec.start),
          offset: spec.offset,
          business: spec.businessOnly,
        }),
        primary,
        caption: fill(spec.offset < 0 ? t.shiftBefore : t.shiftAfter, {
          n: precise(count),
          unit,
          date: shortDate(spec.start, locale),
        }),
        details: [],
        copyValue: primary,
      };
    }

    case "clockSpan": {
      const hours = Math.floor(spec.durationMinutes / 60);
      const minutes = spec.durationMinutes % 60;
      const primary =
        hours > 0
          ? `${precise(hours)}${t.hoursUnit} ${precise(minutes)}${t.minutesUnit}`
          : `${precise(minutes)}${t.minutesUnit}`;
      const copyValue = formatDuration(spec.durationMinutes * 60);
      return {
        toolId: "arbejdstid",
        href: toolHref("arbejdstid", {
          start: formatClock(spec.startMinutes),
          end: formatClock(spec.endMinutes),
        }),
        primary,
        caption: fill(t.clockCaption, {
          start: formatClock(spec.startMinutes),
          end: formatClock(spec.endMinutes),
        }),
        details: [],
        copyValue,
      };
    }

    case "throughput": {
      const rounded = Math.round(spec.taktSeconds * 10) / 10;
      const primary = `${formatNumber(rounded, locale, 1)} s`;
      const availableMinutes = spec.availableSeconds / 60;
      return {
        toolId: "countdown",
        href: toolHref("countdown", {
          hours: Math.floor(spec.availableSeconds / 3600),
          minutes: Math.floor((spec.availableSeconds % 3600) / 60),
          seconds: spec.availableSeconds % 60,
          takt: rounded,
          demand: spec.units,
          available: availableMinutes,
        }),
        primary,
        unit: t.taktPerUnit,
        caption: fill(t.throughputCaption, {
          units: precise(spec.units),
          time: formatDuration(spec.availableSeconds),
        }),
        details: [
          { label: t.unitsCount, value: precise(spec.units) },
          {
            label: t.availableTime,
            value: formatDuration(spec.availableSeconds),
          },
        ],
        copyValue: formatNumber(rounded, locale, 1),
      };
    }

    case "password": {
      if (!password || password.length !== spec.length) return null;
      return {
        toolId: "password",
        href: toolHref("password", { length: spec.length }),
        primary: password,
        mono: true,
        caption: fill(t.passwordCaption, { n: String(spec.length) }),
        details: [],
        copyValue: password,
      };
    }

    case "random": {
      if (
        randomValue === undefined ||
        randomValue < spec.min ||
        randomValue > spec.max
      ) {
        return null;
      }
      const primary = formatNumber(randomValue, locale, 0);
      return {
        toolId: "lommeregner",
        href: toolHref("lommeregner", { value: String(randomValue) }),
        primary,
        caption: fill(t.randomCaption, {
          min: precise(spec.min),
          max: precise(spec.max),
        }),
        details: [],
        copyValue: primary,
      };
    }

    case "salary": {
      const { result } = spec;
      return {
        toolId: "lon",
        href: toolHref("lon", {
          mode: spec.mode,
          gross: spec.gross,
          rate: spec.rate,
        }),
        primary: formatKr(result.nettoMonthly, locale),
        caption: fill(spec.rateAssumed ? t.salaryAssumed : t.salaryGiven, {
          rate: precise(spec.rate),
        }),
        details: [
          {
            label: dictionary.salary.grossMonth,
            value: formatKr(result.bruttoMonthly, locale),
          },
          {
            label: dictionary.salary.hourlyNet,
            value: formatKr(result.nettoHourly, locale, 2),
          },
        ],
        copyValue: formatNumber(result.nettoMonthly, locale, 0),
      };
    }

    case "liveData": {
      return {
        toolId: spec.toolId,
        href: `/t/${spec.slug}`,
        primary:
          spec.topic === "currency" ? t.liveCurrencyTitle : t.liveWeatherTitle,
        caption:
          spec.topic === "currency"
            ? t.liveCurrencyCaption
            : t.liveWeatherCaption,
        details: [],
        copyValue: "",
        primaryAction: "open",
      };
    }

    case "url": {
      return {
        toolId: "qr",
        href: toolHref("qr", { text: spec.href }),
        primary: spec.host,
        caption: "",
        details: [{ label: t.urlHref, value: spec.href }],
        copyValue: spec.href,
      };
    }

    case "color": {
      const { r, g, b } = spec.rgb;
      const { h, s, l } = spec.hsl;
      return {
        toolId: "color",
        href: toolHref("color", { hex: spec.hex }),
        primary: spec.hex,
        caption: "",
        details: [
          { label: "RGB", value: `rgb(${r}, ${g}, ${b})` },
          { label: "HSL", value: `hsl(${h}, ${s}%, ${l}%)` },
        ],
        copyValue: spec.hex,
        swatch: spec.hex,
      };
    }

    case "json": {
      if (!spec.valid) {
        return {
          toolId: "json",
          href: toolHref("json"),
          primary: t.jsonInvalid,
          caption: spec.error ?? "",
          details: [],
          copyValue: "",
        };
      }
      const formatted = spec.formatted ?? "";
      return {
        toolId: "json",
        href: toolHref("json", { value: formatted }),
        primary: t.jsonValid,
        mono: true,
        caption: "",
        details: [],
        copyValue: formatted,
      };
    }

    case "timestamp": {
      const utc = spec.date.toISOString().replace(/\.\d{3}Z$/, "Z");
      const local = new Intl.DateTimeFormat(
        locale === "da" ? "da-DK" : "en-GB",
        {
          dateStyle: "medium",
          timeStyle: "medium",
        },
      ).format(spec.date);
      return {
        toolId: "timestamp",
        href: toolHref("timestamp", { value: String(spec.input), unit: spec.unit }),
        primary: local,
        caption: fill(t.timestampCaption, {
          value: String(spec.input),
          unit: spec.unit === "s" ? t.timestampSeconds : t.timestampMillis,
        }),
        details: [
          { label: t.timestampUtc, value: utc },
          { label: t.timestampLocal, value: local },
        ],
        copyValue: utc,
      };
    }

    case "uuid": {
      return {
        toolId: "uuid",
        href: toolHref("uuid"),
        primary: spec.value,
        mono: true,
        caption: "",
        details: [
          {
            label: t.uuidVersion,
            value: spec.version !== null ? String(spec.version) : "—",
          },
          { label: t.uuidVariant, value: spec.variant },
        ],
        copyValue: spec.value,
      };
    }

    case "email": {
      return {
        primary: spec.address,
        mono: true,
        caption: "",
        details: [
          { label: t.emailLocal, value: spec.local },
          { label: t.emailDomain, value: spec.domain },
        ],
        copyValue: spec.address,
      };
    }

    case "margin": {
      const { result } = spec;
      const href = toolHref("avance", {
        cost: spec.cost,
        ...(spec.sell !== undefined ? { sell: spec.sell } : {}),
        ...(spec.marginPercent !== undefined
          ? { margin: spec.marginPercent }
          : {}),
        ...(spec.markupPercent !== undefined
          ? { markup: spec.markupPercent }
          : {}),
      });
      return {
        toolId: "avance",
        href,
        primary: formatKr(result.profit, locale, 2),
        caption: fill(t.marginCaption, {
          cost: precise(spec.cost),
          sell: precise(result.sell),
        }),
        details: [
          {
            label: dictionary.avance.margin,
            value: `${formatNumber(result.marginPercent, locale, 2)}%`,
          },
          {
            label: dictionary.avance.markup,
            value: `${formatNumber(result.markupPercent, locale, 2)}%`,
          },
        ],
        copyValue: formatNumber(result.profit, locale, 2),
      };
    }

    case "jwt": {
      const alg = spec.alg ?? "—";
      const typ = spec.typ ?? "—";
      return {
        toolId: "jwt",
        href: toolHref("jwt", { token: spec.token }),
        primary: alg,
        caption: fill(t.jwtCaption, { typ }),
        details: [{ label: t.jwtTyp, value: typ }],
        copyValue: spec.token,
        mono: true,
      };
    }

    case "cidr": {
      const { result } = spec;
      return {
        toolId: "cidr",
        href: toolHref("cidr", { cidr: spec.input }),
        primary: result.network,
        caption: fill(t.cidrCaption, {
          prefix: String(result.prefix),
          hosts: formatNumber(result.hostCount, locale, 0),
        }),
        details: [
          { label: dictionary.cidr.netmask, value: result.netmask },
          { label: dictionary.cidr.broadcast, value: result.broadcast },
        ],
        copyValue: result.network,
        mono: true,
      };
    }
  }
}
