import type { Dictionary, Locale } from "@/i18n/types";
import { toolHref } from "@/tools/prefill";
import { FRACTIONS, searchItems } from "@/tools/builtin/affald/catalog";
import {
  formatUn,
  getUn,
  searchUn,
  type UnEntry,
} from "@/tools/builtin/unnr/data";
import { searchPostnr, type PostnrRow } from "@/tools/builtin/postnr/data";
import type { CountryId } from "@/tools/builtin/postnr/countries";
import {
  searchElements,
  type PeriodicElement,
} from "@/tools/builtin/periodesystem/elements";
import {
  regionLabel,
  searchCountries,
  type Country,
} from "@/tools/builtin/verdensatlas/countries";
import { searchHolidays } from "@/tools/builtin/helligdage/calc";
import { searchSheetFormulas } from "@/tools/builtin/matematik/formulas";
import { searchCalculatorFormulas } from "@/tools/builtin/lommeregner/formulaSearch";

/** A deep lookup hit that opens a tool with values already filled in. */
export type ContentHit = {
  id: string;
  toolId: string;
  badgeDa: string;
  badgeEn: string;
  titleDa: string;
  titleEn: string;
  subtitleDa: string;
  subtitleEn: string;
  href: string;
  score: number;
};

const UN_PREFIX = /(?:^|\s)(?:un|adr)\s*[-:]?\s*(\d{3,4})\b/i;
const BARE_FOUR = /^(\d{4})$/;
const BARE_CVR = /^(?:cvr\s*[-:]?\s*)?(\d{8})$/i;
const POST_HINT = /postnr|postnummer|postcode|zip/i;
const ELEMENT_HINT = /grundstof|element|atomic|periode/i;
const DK_COUNTRY: CountryId = "DK";

function unHitFromRow(row: UnEntry, score: number): ContentHit {
  return {
    id: `unnr:${row.un}`,
    toolId: "unnr",
    badgeDa: "ADR",
    badgeEn: "ADR",
    titleDa: `UN ${row.un}`,
    titleEn: `UN ${row.un}`,
    subtitleDa: `${row.nameDa} · Klasse ${row.hazardClass}`,
    subtitleEn: `${row.nameEn} · Class ${row.hazardClass}`,
    href: toolHref("unnr", { un: row.un, q: row.un }),
    score,
  };
}

function unHitBare(id: string, score: number): ContentHit {
  const row = getUn(id);
  if (row) return unHitFromRow(row, score);
  return {
    id: `unnr:${id}`,
    toolId: "unnr",
    badgeDa: "ADR",
    badgeEn: "ADR",
    titleDa: `UN ${id}`,
    titleEn: `UN ${id}`,
    subtitleDa: "Åbn i farligt gods",
    subtitleEn: "Open in dangerous goods",
    href: toolHref("unnr", { un: id, q: id }),
    score,
  };
}

function unHits(query: string): ContentHit[] {
  const q = query.trim();
  if (!q) return [];
  const out: ContentHit[] = [];
  const seen = new Set<string>();

  const push = (hit: ContentHit) => {
    if (seen.has(hit.id)) return;
    seen.add(hit.id);
    out.push(hit);
  };

  const prefixed = UN_PREFIX.exec(q);
  if (prefixed?.[1]) {
    const id = formatUn(prefixed[1]);
    push(unHitBare(id, getUn(id) ? 980 : 920));
    return out;
  }

  const bare = BARE_FOUR.exec(q);
  if (bare?.[1] && !POST_HINT.test(q)) {
    const id = formatUn(bare[1]);
    const row = getUn(id);
    if (row) push(unHitFromRow(row, 940));
    return out;
  }

  if (/^\d+$/.test(q) || q.length < 3) return out;

  for (const row of searchUn(q, 5)) {
    push(unHitFromRow(row, 700));
  }
  return out;
}

function postnrHit(row: PostnrRow, score: number, queryValue: string): ContentHit {
  return {
    id: `postnr:${row.id}`,
    toolId: "postnr",
    badgeDa: "Postnr",
    badgeEn: "Postcode",
    titleDa: `${row.nr} ${row.name}`,
    titleEn: `${row.nr} ${row.name}`,
    subtitleDa: row.region ? `${row.region} · Danmark` : "Danmark",
    subtitleEn: row.region ? `${row.region} · Denmark` : "Denmark",
    href: toolHref("postnr", {
      nr: row.nr,
      q: queryValue,
      country: DK_COUNTRY,
    }),
    score,
  };
}

function postnrHits(query: string): ContentHit[] {
  const q = query.trim();
  if (!q) return [];
  const out: ContentHit[] = [];
  const bare = BARE_FOUR.exec(q)?.[1];
  const hinted = POST_HINT.test(q);
  const codeFromHint = hinted
    ? (q.match(/\b(\d{4})\b/)?.[1] ?? null)
    : null;
  const code = bare ?? codeFromHint;

  if (code) {
    if (bare && getUn(code) && !hinted) return [];
    const rows = searchPostnr(DK_COUNTRY, code, 5);
    for (const row of rows) {
      const exact = row.nr.replace(/\s+/g, "") === code;
      out.push(postnrHit(row, exact ? 960 : 820, row.nr));
    }
    return out;
  }

  // City / place names: require 4+ chars so short tokens like "sin" stay elsewhere.
  if (/^\d+$/.test(q) || q.length < 4) return out;

  for (const row of searchPostnr(DK_COUNTRY, q, 4)) {
    out.push(postnrHit(row, 760, row.name));
  }
  return out;
}

function affaldHits(query: string, locale: Locale): ContentHit[] {
  const q = query.trim();
  if (!q || q.length < 3 || /^\d+$/.test(q)) return [];
  if (UN_PREFIX.test(q) || POST_HINT.test(q) || BARE_CVR.test(q)) return [];

  const da = locale === "da";
  const lower = q.toLowerCase();
  const filtered = searchItems(q).filter((item) => {
    const nameDa = item.nameDa.toLowerCase();
    const nameEn = item.nameEn.toLowerCase();
    if (nameDa.startsWith(lower) || nameEn.startsWith(lower)) return true;
    // Short tokens like "ilt" / "sin" often sit inside unrelated words.
    if (lower.length < 4) return false;
    return nameDa.includes(lower) || nameEn.includes(lower);
  });

  return filtered.slice(0, 4).map((item, index) => {
    const frac = FRACTIONS.find((f) => f.id === item.fraction);
    return {
      id: `affald:${item.id}`,
      toolId: "affald",
      badgeDa: "Affald",
      badgeEn: "Waste",
      titleDa: item.nameDa,
      titleEn: item.nameEn,
      subtitleDa: frac?.nameDa ?? "Affaldssortering",
      subtitleEn: frac?.nameEn ?? "Waste sorting",
      href: toolHref("affald", {
        q: da ? item.nameDa : item.nameEn,
        item: item.id,
      }),
      score: 720 - index * 5,
    };
  });
}

function elementHit(el: PeriodicElement, score: number): ContentHit {
  const aka = el.akaDa ? ` · ${el.akaDa}` : "";
  return {
    id: `periodesystem:${el.z}`,
    toolId: "periodesystem",
    badgeDa: "Grundstof",
    badgeEn: "Element",
    titleDa: `${el.symbol} · ${el.nameDa}${aka}`,
    titleEn: `${el.symbol} · ${el.nameEn}`,
    subtitleDa: `Z ${el.z} · ${el.category}`,
    subtitleEn: `Z ${el.z} · ${el.category}`,
    href: toolHref("periodesystem", {
      symbol: el.symbol,
      z: el.z,
      q: el.symbol,
    }),
    score,
  };
}

function elementHits(query: string): ContentHit[] {
  const q = query.trim();
  if (!q) return [];
  // Leave 4-digit and CVR codes to those providers.
  if (BARE_FOUR.test(q) || BARE_CVR.test(q)) return [];

  const digitsOnly = /^\d{1,3}$/.test(q);
  if (digitsOnly && !ELEMENT_HINT.test(q) && q.length === 1) {
    // Single digit Z is too noisy without a hint.
    return [];
  }

  const needle = q.replace(ELEMENT_HINT, "").trim() || q;
  const lower = needle.toLowerCase();
  let rows = searchElements(needle, 4);
  // Short letter queries are almost always chemical symbols (Fe, O, Na).
  if (/^[a-zæøå]{1,2}$/i.test(needle)) {
    rows = rows.filter((el) => el.symbol.toLowerCase() === lower);
  }
  return rows.map((el, index) => {
    const exactSymbol = el.symbol.toLowerCase() === lower;
    const exactZ = String(el.z) === needle;
    const exactName =
      el.nameDa.toLowerCase() === lower ||
      el.nameEn.toLowerCase() === lower ||
      el.akaDa?.toLowerCase() === lower;
    const score = exactSymbol
      ? 970
      : exactZ
        ? 930
        : exactName
          ? 960
          : 710 - index * 5;
    return elementHit(el, score);
  });
}

function countryHit(c: Country, score: number): ContentHit {
  return {
    id: `verdensatlas:${c.id}`,
    toolId: "verdensatlas",
    badgeDa: "Land",
    badgeEn: "Country",
    titleDa: c.nameDa,
    titleEn: c.nameEn,
    subtitleDa: `${c.capitalDa} · ${c.currency} · ${regionLabel(c.region, true)}`,
    subtitleEn: `${c.capitalEn} · ${c.currency} · ${regionLabel(c.region, false)}`,
    href: toolHref("verdensatlas", { country: c.id, q: c.nameDa }),
    score,
  };
}

function countryHits(query: string): ContentHit[] {
  const q = query.trim();
  if (!q || /^\d+$/.test(q)) return [];
  if (UN_PREFIX.test(q) || POST_HINT.test(q) || BARE_CVR.test(q)) return [];
  // ISO ids are 2 letters; names need at least 4 to avoid "sin" → Singapore.
  if (q.length < 2) return [];
  if (q.length === 2 && !/^[a-z]{2}$/i.test(q)) return [];
  if (q.length === 3) return [];

  return searchCountries(q, 4).map((c, index) => {
    const lower = q.toLowerCase();
    const exact =
      c.id === lower ||
      c.nameDa.toLowerCase() === lower ||
      c.nameEn.toLowerCase() === lower ||
      c.capitalDa.toLowerCase() === lower ||
      c.capitalEn.toLowerCase() === lower;
    return countryHit(c, exact ? 950 : 740 - index * 5);
  });
}

function holidayHits(query: string): ContentHit[] {
  const q = query.trim();
  if (!q || /^\d+$/.test(q)) return [];
  const rows = searchHolidays(q, new Date().getFullYear(), 3);
  return rows.map((h, index) => ({
    id: `helligdage:${h.date}`,
    toolId: "helligdage",
    badgeDa: "Helligdag",
    badgeEn: "Holiday",
    titleDa: h.nameDa,
    titleEn: h.nameEn,
    subtitleDa: `${h.date} · Danmark`,
    subtitleEn: `${h.date} · Denmark`,
    href: toolHref("helligdage", { year: h.year, q: h.nameDa }),
    score: 880 - index * 5,
  }));
}

function formulaHits(query: string, dictionary: Dictionary): ContentHit[] {
  const q = query.trim();
  if (!q || q.length < 3 || /^\d+$/.test(q)) return [];
  const out: ContentHit[] = [];
  const labels = dictionary.calculator.formulas;

  const calc = searchCalculatorFormulas(q, 2);
  for (const hit of calc) {
    const name = labels[hit.id]?.name ?? hit.matched;
    out.push({
      id: `lommeregner:${hit.id}`,
      toolId: "lommeregner",
      badgeDa: "Lommeregner",
      badgeEn: "Calculator",
      titleDa: name,
      titleEn: name,
      subtitleDa: "Åbn formlen i avanceret tilstand",
      subtitleEn: "Open the formula in advanced mode",
      href: toolHref("lommeregner", {
        mode: "advanced",
        formula: hit.id,
        q,
      }),
      score: 800 + Math.min(hit.score, 99) / 10,
    });
  }

  // Sheet hits that are not already covered by the calculator.
  const calcIds = new Set(calc.map((h) => h.id));
  for (const row of searchSheetFormulas(q, 3)) {
    const mapped =
      row.id === "pct-of"
        ? "percentOf"
        : row.id === "pct-change"
          ? "percentChange"
          : row.id === "pythagoras"
            ? "pythagoras"
            : null;
    if (mapped && calcIds.has(mapped as (typeof calc)[number]["id"])) continue;
    out.push({
      id: `formelsamling:${row.id}`,
      toolId: "formelsamling",
      badgeDa: "Formel",
      badgeEn: "Formula",
      titleDa: row.nameDa,
      titleEn: row.nameEn,
      subtitleDa: row.topicDa,
      subtitleEn: row.topicEn,
      href: toolHref("formelsamling", { q: row.nameDa }),
      score: 760,
    });
  }

  return out;
}

function cvrHits(query: string): ContentHit[] {
  const q = query.trim();
  const match = BARE_CVR.exec(q);
  if (!match?.[1]) return [];
  const digits = match[1];
  const hinted = /^cvr/i.test(q);
  // Bare 8-digit only with cvr hint, or when not a plausible other code.
  if (!hinted && q.length === 8) {
    // Still useful: Danish CVR is exactly 8 digits.
  }
  return [
    {
      id: `cvrcheck:${digits}`,
      toolId: "cvrcheck",
      badgeDa: "CVR",
      badgeEn: "CVR",
      titleDa: digits,
      titleEn: digits,
      subtitleDa: "Tjek dansk CVR-nummer",
      subtitleEn: "Check a Danish CVR number",
      href: toolHref("cvrcheck", { cvr: digits }),
      score: hinted ? 990 : 900,
    },
  ];
}

/**
 * Deep lookups across curated Kit catalogs.
 * Kept small and synchronous on purpose.
 */
export function searchContent(
  query: string,
  dictionary: Dictionary,
  locale: Locale,
  limit = 8,
): ContentHit[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const merged = [
    ...cvrHits(q),
    ...unHits(q),
    ...postnrHits(q),
    ...elementHits(q),
    ...holidayHits(q),
    ...countryHits(q),
    ...formulaHits(q, dictionary),
    ...affaldHits(q, locale),
  ];

  const byId = new Map<string, ContentHit>();
  for (const hit of merged) {
    const prev = byId.get(hit.id);
    if (!prev || hit.score > prev.score) byId.set(hit.id, hit);
  }

  return Array.from(byId.values())
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);
}
