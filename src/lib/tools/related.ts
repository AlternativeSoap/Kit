import { getToolById, kitTools, tools } from "@/tools/registry";
import type { ToolDefinition } from "@/tools/types";

const MAX_KIT = 4;
const MAX_SITES = 4;

function uniqueTools(
  items: Array<ToolDefinition | undefined | null>,
): ToolDefinition[] {
  const seen = new Set<string>();
  const out: ToolDefinition[] = [];
  for (const item of items) {
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

function haystack(tool: ToolDefinition): string {
  return [
    tool.id,
    tool.slug,
    tool.name,
    ...(tool.aliases ?? []),
    ...(tool.tags ?? []),
    ...(tool.intents ?? []),
    ...(tool.capabilities ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

function mentions(tool: ToolDefinition, ...needles: string[]): boolean {
  const text = ` ${haystack(tool)} `;
  return needles.some((needle) => {
    const n = needle.toLowerCase().trim();
    if (!n) return false;
    // Prefer whole-token matches so "calc" does not hit "calculate".
    if (text.includes(` ${n} `) || text.includes(`-${n}-`) || text.includes(` ${n}-`) || text.includes(`-${n} `)) {
      return true;
    }
    // Allow compact id matches like "imgcompress" for "compress".
    return n.length >= 5 && text.replace(/\s+/g, "").includes(n);
  });
}

/** Too broad to count as a real topic match on their own. */
const WEAK_TAGS = new Set([
  "code",
  "dev",
  "files",
  "everyday",
  "convert",
  "text",
  "time",
  "finance",
  "design",
  "image",
  "tools",
  "web",
]);

function overlapScore(a: ToolDefinition, b: ToolDefinition): {
  score: number;
  strongTags: number;
} {
  const tagsA = new Set(a.tags ?? []);
  const intentsA = new Set(a.intents ?? []);
  const capsA = new Set(a.capabilities ?? []);
  let score = 0;
  let strongTags = 0;
  for (const tag of b.tags ?? []) {
    if (!tagsA.has(tag)) continue;
    if (WEAK_TAGS.has(tag)) {
      score += 1;
      continue;
    }
    score += 3;
    strongTags += 1;
  }
  for (const intent of b.intents ?? []) if (intentsA.has(intent)) score += 2;
  for (const cap of b.capabilities ?? []) if (capsA.has(cap)) score += 1;
  return { score, strongTags };
}

function hostLabel(href: string | undefined): string | null {
  if (!href) return null;
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Curated external fallbacks by topic so every builtin tool can suggest
 * another site when Kit is not enough.
 */
const TOPIC_SITE_FALLBACKS: Array<{
  test: (tool: ToolDefinition) => boolean;
  sites: string[];
}> = [
  {
    test: (t) => mentions(t, "qr", "barcode", "wifiqr", "wifi"),
    sites: ["qrcodemonkey", "qr-code"],
  },
  {
    test: (t) =>
      mentions(t, "invoice", "faktura", "timesheet", "timeseddel", "rent", "leje"),
    sites: ["skat", "wolframalpha"],
  },
  {
    test: (t) =>
      mentions(t, "annotate", "exif", "signature", "underskrift", "screenshot"),
    sites: ["photopea", "squoosh"],
  },
  {
    test: (t) =>
      mentions(t, "holiday", "helligdag", "packing", "pakkeliste", "ics", "calendar"),
    sites: ["google-calendar", "borgerdk"],
  },
  {
    test: (t) => mentions(t, "pdf"),
    sites: ["ilovepdf", "pdf24", "smallpdf"],
  },
  {
    test: (t) =>
      mentions(
        t,
        "image",
        "img",
        "crop",
        "resize",
        "compress",
        "rotate",
        "bgremove",
        "gif",
        "palette",
        "photo",
      ),
    sites: ["squoosh", "photopea", "tinypng", "removebg"],
  },
  {
    test: (t) => mentions(t, "color", "contrast", "hex", "rgb"),
    sites: ["coolors"],
  },
  {
    test: (t) => mentions(t, "password", "passphrase", "hash", "luhn"),
    sites: ["haveibeenpwned", "bitwarden"],
  },
  {
    test: (t) => mentions(t, "json"),
    sites: ["jsonformatter"],
  },
  {
    test: (t) => mentions(t, "regex"),
    sites: ["regex101"],
  },
  {
    test: (t) =>
      mentions(t, "encode", "base64", "uuid", "jwt", "cron", "cidr", "binary"),
    sites: ["mdn", "stackoverflow"],
  },
  {
    test: (t) =>
      mentions(
        t,
        "text",
        "slug",
        "lorem",
        "markdown",
        "diff",
        "word",
        "reading",
        "case",
        "sort",
        "dedupe",
        "findreplace",
        "wordcount",
        "codeshot",
      ),
    sites: ["google-docs", "grammarly"],
  },
  {
    test: (t) =>
      mentions(
        t,
        "calc",
        "math",
        "prime",
        "ratio",
        "pythagoras",
        "area",
        "volume",
        "average",
        "roman",
        "gcd",
        "probability",
        "lommeregner",
        "desmos",
      ),
    sites: ["desmos", "wolframalpha"],
  },
  {
    test: (t) =>
      mentions(
        t,
        "percent",
        "moms",
        "vat",
        "avance",
        "discount",
        "roi",
        "tip",
        "invoice",
        "breakeven",
        "cagr",
        "inflation",
        "compound",
        "ruleof72",
      ),
    sites: ["wolframalpha", "skat"],
  },
  {
    test: (t) =>
      mentions(
        t,
        "loan",
        "lan",
        "mortgage",
        "salary",
        "lon",
        "ferie",
        "opsparing",
        "kilometer",
        "braendstof",
        "fuel",
        "electric",
        "unitprice",
        "enhedspris",
        "currency",
        "valuta",
      ),
    sites: ["valutakurser", "skat-udbetaling", "skat"],
  },
  {
    test: (t) =>
      mentions(
        t,
        "date",
        "dato",
        "time",
        "countdown",
        "stopur",
        "timestamp",
        "timezone",
        "worldclock",
        "ugenummer",
        "businessdays",
        "leapyear",
        "dayofyear",
        "pomodoro",
        "age",
        "alder",
        "work",
        "hours",
      ),
    sites: ["google-calendar", "wolframalpha"],
  },
  {
    test: (t) =>
      mentions(t, "barsel", "termin", "leave", "pregnancy", "parental"),
    sites: ["borgerdk", "sundhed"],
  },
  {
    test: (t) =>
      mentions(
        t,
        "bmi",
        "idealweight",
        "calorie",
        "sleep",
        "water",
        "bodyfat",
        "pace",
        "heat",
        "wind",
        "promille",
        "health",
      ),
    sites: ["sundhed", "web-healthline-com"],
  },
  {
    test: (t) =>
      mentions(
        t,
        "unit",
        "enheder",
        "temperature",
        "length",
        "weight",
        "speedconvert",
        "datasize",
        "dpi",
        "bandwidth",
        "aspect",
        "shoesize",
        "clothing",
      ),
    sites: ["wolframalpha", "web-cloudconvert-com"],
  },
  {
    test: (t) => mentions(t, "video", "vidcompress", "gif"),
    sites: ["web-cloudconvert-com", "canva"],
  },
  {
    test: (t) => mentions(t, "ip", "myip", "ua", "mime", "speedtest"),
    sites: ["speedtest-net", "mdn"],
  },
  {
    test: (t) =>
      mentions(t, "skriv", "ark", "dias", "docx", "csv", "excel", "papers"),
    sites: ["google-docs", "canva"],
  },
  {
    test: (t) => mentions(t, "map", "ladmeter", "trailer", "load"),
    sites: ["google-maps", "krak"],
  },
  {
    test: (t) => mentions(t, "dice", "spin", "random"),
    sites: ["wolframalpha"],
  },
  {
    test: () => true,
    sites: ["chatgpt", "wolframalpha"],
  },
];

function topicFallbackSites(tool: ToolDefinition): ToolDefinition[] {
  for (const entry of TOPIC_SITE_FALLBACKS) {
    if (!entry.test(tool)) continue;
    const resolved = uniqueTools(
      entry.sites
        .map((id) => getToolById(id))
        .filter((item) => item?.kind === "external"),
    );
    if (resolved.length) return resolved;
  }
  return [];
}

function autoRelatedKit(tool: ToolDefinition, exclude: Set<string>): ToolDefinition[] {
  return kitTools
    .filter(
      (item) =>
        item.kind === "builtin" &&
        item.id !== tool.id &&
        !exclude.has(item.id),
    )
    .map((item) => ({ item, ...overlapScore(tool, item) }))
    .filter(({ score, strongTags }) => strongTags >= 1 || score >= 4)
    .sort(
      (a, b) =>
        b.score - a.score || (b.item.popularity ?? 0) - (a.item.popularity ?? 0),
    )
    .map(({ item }) => item)
    .slice(0, MAX_KIT);
}

/** Kit tools and external sites related to a builtin tool page. */
export function resolveRelatedForTool(toolId: string): {
  kit: ToolDefinition[];
  sites: ToolDefinition[];
} {
  const tool = getToolById(toolId);
  if (!tool || tool.kind !== "builtin") {
    return { kit: [], sites: [] };
  }

  const explicitKit = uniqueTools(
    (tool.relatedIds ?? [])
      .map((id) => getToolById(id))
      .filter((item) => item?.kind === "builtin"),
  );

  const kitExclude = new Set(explicitKit.map((item) => item.id));
  const kit = uniqueTools([
    ...explicitKit,
    ...autoRelatedKit(tool, kitExclude),
  ]).slice(0, MAX_KIT);

  const explicitSites = uniqueTools(
    (tool.alternatives ?? [])
      .map((id) => getToolById(id))
      .filter((item) => item?.kind === "external"),
  );

  const reverseSites = tools.filter(
    (item) =>
      item.kind === "external" &&
      item.id !== toolId &&
      ([...(item.relatedIds ?? []), ...(item.alternatives ?? [])].includes(
        toolId,
      ) ||
        [...(item.relatedIds ?? []), ...(item.alternatives ?? [])].includes(
          tool.builtinId ?? toolId,
        )),
  );

  const ranked = tools
    .filter(
      (item) =>
        item.kind === "external" &&
        item.id !== toolId &&
        !explicitSites.some((s) => s.id === item.id) &&
        !reverseSites.some((s) => s.id === item.id),
    )
    .map((item) => ({ item, ...overlapScore(tool, item) }))
    .filter(({ score, strongTags }) => strongTags >= 1 && score >= 5)
    .sort(
      (a, b) =>
        b.score - a.score || (b.item.popularity ?? 0) - (a.item.popularity ?? 0),
    )
    .map(({ item }) => item);

  let sites = uniqueTools([
    ...explicitSites,
    ...reverseSites,
    ...ranked,
  ]);

  if (sites.length < 2) {
    sites = uniqueTools([...sites, ...topicFallbackSites(tool)]);
  }

  return {
    kit,
    sites: sites.slice(0, MAX_SITES),
  };
}

export function relatedSiteHost(tool: ToolDefinition): string | null {
  return hostLabel(tool.href);
}
