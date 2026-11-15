import type { Dictionary } from "@/i18n/types";
import { getToolCopy } from "@/i18n/tools";
import { curatedSuggestions, getToolById, kitTools, tools } from "@/tools/registry";
import type { ToolDefinition } from "@/tools/types";
import { extractConstraints, type SearchConstraints } from "./search/constraints";
import { normalize } from "./search/normalize";
import {
  parseOperators,
  type SearchSurfaceFilter,
} from "./search/operators";
import {
  constraintAdjustment,
  matchToolTokens,
} from "./search/score";

export type MatchTier = "exact" | "strong" | "possible";

export type SearchHit = {
  tool: ToolDefinition;
  score: number;
  matchedOn: string;
  /** Match quality before surface/popularity/constraint boosts. */
  baseScore: number;
  /** How many extracted constraints this tool satisfied. */
  constraintsSatisfied: number;
  /** Internal confidence for ranking and diagnostics. */
  matchTier: MatchTier;
};

export type ParsedSearchQuery = {
  raw: string;
  constraints: SearchConstraints;
  surface: SearchSurfaceFilter;
  /** Text used for lexical matching after constraint words are removed. */
  matchQuery: string;
};

export type SearchOptions = {
  /** Local open counts. Soft boost only; capped so usage cannot override a clear match. */
  usage?: Record<string, number>;
  /** Tool ids the user hid from normal search results. */
  excluded?: string[];
};

/** Exact phrases that browse the full tool list instead of ranking by name. */
const LIBRARY_EXACT = new Set(
  [
    "library",
    "libraries",
    "bibliotek",
    "biblioteker",
    "katalog",
    "catalog",
    "catalogue",
    "all tools",
    "alle vaerktojer",
    "alle værktøjer",
  ].map(normalize),
);

/**
 * Unambiguous prefixes of library keywords. Short prefixes intentionally
 * override description matches like Internet Archive for "bib…".
 */
const LIBRARY_STEMS: ReadonlyArray<{ word: string; min: number }> = [
  { word: "library", min: 3 },
  { word: "libraries", min: 3 },
  { word: "bibliotek", min: 3 },
  { word: "biblioteker", min: 3 },
  { word: "katalog", min: 5 },
  { word: "catalog", min: 5 },
  { word: "catalogue", min: 5 },
].map((item) => ({ word: normalize(item.word), min: item.min }));

/** Strip punctuation/noise so "Bibliotek!" still counts as a library browse. */
function libraryKey(query: string): string {
  return normalize(query)
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True for a complete library keyword such as "library" or "bibliotek". */
export function isExactLibraryQuery(query: string): boolean {
  return LIBRARY_EXACT.has(libraryKey(query));
}

/** True when the query should open or suggest the full tool library. */
export function isLibraryQuery(query: string): boolean {
  const key = libraryKey(query);
  if (!key) return false;
  if (LIBRARY_EXACT.has(key)) return true;
  return LIBRARY_STEMS.some(
    (stem) => key.length >= stem.min && stem.word.startsWith(key),
  );
}

export type LibrarySortOptions = {
  /** Local open counts from this device. */
  usage?: Record<string, number>;
  /**
   * Salt for the “rest is random” tier so order stays stable within a session
   * but can reshuffle across days/reloads.
   */
  randomSalt?: number;
};

function hashSortKey(id: string, salt: number): number {
  let hash = salt >>> 0;
  for (let i = 0; i < id.length; i++) {
    hash = (Math.imul(hash, 31) + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function isToolLikeSite(tool: ToolDefinition): boolean {
  const tags = tool.tags ?? [];
  const capabilities = tool.capabilities ?? [];
  if (
    tags.some((tag) =>
      ["tools", "pdf", "image", "convert", "code", "dev"].includes(tag),
    )
  ) {
    return true;
  }
  return capabilities.some((cap) =>
    [
      "compress",
      "convert",
      "edit",
      "generate",
      "calculate",
      "test",
      "merge",
      "split",
      "format",
    ].includes(cap),
  );
}

/**
 * Library order: most used → generally popular → tool-useful → random rest.
 */
export function sortLibraryEntries(
  entries: ToolDefinition[],
  options: LibrarySortOptions = {},
): ToolDefinition[] {
  const usage = options.usage ?? {};
  const salt = options.randomSalt ?? 1;

  return [...entries].sort((a, b) => {
    const usageA = usage[a.id] ?? 0;
    const usageB = usage[b.id] ?? 0;
    const popA = a.popularity ?? 50;
    const popB = b.popularity ?? 50;

    const tier = (tool: ToolDefinition, used: number, pop: number) => {
      if (used > 0) return 0;
      if (pop >= 85) return 1;
      if (tool.kind === "builtin" || isToolLikeSite(tool)) return 2;
      return 3;
    };

    const tierA = tier(a, usageA, popA);
    const tierB = tier(b, usageB, popB);
    if (tierA !== tierB) return tierA - tierB;

    if (tierA === 0) {
      return usageB - usageA || popB - popA;
    }
    if (tierA === 1 || tierA === 2) {
      return popB - popA || a.id.localeCompare(b.id);
    }
    return (
      hashSortKey(a.id, salt) - hashSortKey(b.id, salt) || a.id.localeCompare(b.id)
    );
  });
}

/** Ranked catalog for the dedicated library page. */
export function listLibraryCatalog(
  dictionary: Dictionary,
  options: LibrarySortOptions = {},
): {
  /** First-party calculators and utilities that run in Kit. */
  builtins: ToolDefinition[];
  /** Linked destinations that open elsewhere. */
  externals: ToolDefinition[];
} {
  void dictionary;
  return {
    builtins: sortLibraryEntries(
      tools.filter((tool) => tool.kind === "builtin"),
      options,
    ),
    externals: sortLibraryEntries(
      tools.filter((tool) => tool.kind === "external"),
      options,
    ),
  };
}

/** Soft score from how often this tool was opened on this device. Max +10. */
export function usageBoost(
  toolId: string,
  usage?: Record<string, number>,
): number {
  if (!usage) return 0;
  const count = usage[toolId] ?? 0;
  if (count <= 0) return 0;
  return Math.min(count, 20) * 0.5;
}

/** Parse operators and natural-language constraints from a raw query. */
export function parseSearchQuery(query: string): ParsedSearchQuery {
  const raw = query.trim();
  const operators = parseOperators(raw);
  const afterOperators = operators.remainder || raw;
  const constraints = extractConstraints(afterOperators);
  const hasConstraintSignal =
    Boolean(constraints.pricing) ||
    Boolean(constraints.registration) ||
    Boolean(constraints.privacy) ||
    Boolean(constraints.openSource) ||
    constraints.tags.length > 0;

  return {
    raw,
    constraints,
    surface: operators.surface,
    // If the user only typed constraints, keep matchQuery empty so we do not
    // re-score the filler words as if they named a tool.
    matchQuery:
      constraints.remainder || (hasConstraintSignal ? "" : afterOperators),
  };
}

function scoreTool(
  parsed: ParsedSearchQuery,
  tool: ToolDefinition,
  dictionary: Dictionary,
  usage?: Record<string, number>,
): SearchHit | null {
  if (parsed.surface === "kit" && tool.surface !== "kit") return null;
  if (parsed.surface === "web" && tool.surface !== "web") return null;

  const { delta, hardReject, satisfied } = constraintAdjustment(
    tool,
    parsed.constraints,
  );
  if (hardReject) return null;

  if (!contentfulRemainder(parsed.matchQuery)) {
    // Constraint-only queries are too broad without a topic word.
    return null;
  }

  const match = matchToolTokens(parsed.matchQuery, tool, dictionary);
  // Tags and pricing/registration only re-rank lexical hits. They must not
  // invent results for unrelated tools that share a broad tag like "tax".
  if (!match) return null;

  const q = normalize(parsed.matchQuery);
  const intentExact = (tool.intents ?? []).some(
    (intent) => normalize(intent) === q,
  );

  return finalizeHit(tool, {
    baseScore: match.baseScore,
    matchedOn: match.matchedOn,
    constraintsSatisfied: satisfied,
    delta,
    intentExact,
    usage,
  });
}

function contentfulRemainder(matchQuery: string): boolean {
  return matchQuery.trim().length > 0;
}

function finalizeHit(
  tool: ToolDefinition,
  args: {
    baseScore: number;
    matchedOn: string;
    constraintsSatisfied: number;
    delta: number;
    intentExact: boolean;
    usage?: Record<string, number>;
  },
): SearchHit {
  const intentBoost = args.intentExact ? 24 : 0;
  const strongMatch = args.baseScore >= 70 || args.intentExact;
  const surfaceBoost = tool.surface === "kit" ? (strongMatch ? 28 : 0) : 0;
  const builtinBoost = tool.kind === "builtin" && strongMatch ? 12 : 0;
  const popularityBoost = (tool.popularity ?? 50) / 20;
  const constraintBoost = args.constraintsSatisfied * 8;
  const personalBoost = usageBoost(tool.id, args.usage);

  const matchTier: MatchTier =
    args.intentExact || args.baseScore >= 95
      ? "exact"
      : args.baseScore >= 70
        ? "strong"
        : "possible";

  return {
    tool,
    matchedOn: args.matchedOn,
    baseScore: args.baseScore,
    constraintsSatisfied: args.constraintsSatisfied,
    matchTier,
    score:
      args.baseScore +
      surfaceBoost +
      builtinBoost +
      popularityBoost +
      intentBoost +
      args.delta +
      constraintBoost +
      personalBoost,
  };
}

function libraryHits(
  parsed: ParsedSearchQuery,
  dictionary: Dictionary,
  options: SearchOptions,
): SearchHit[] {
  const excluded = new Set(options.excluded ?? []);
  const hits: SearchHit[] = [];

  for (const tool of tools) {
    if (excluded.has(tool.id)) continue;
    if (parsed.surface === "kit" && tool.surface !== "kit") continue;
    if (parsed.surface === "web" && tool.surface !== "web") continue;

    hits.push(
      finalizeHit(tool, {
        baseScore: 80,
        matchedOn: "library",
        constraintsSatisfied: 0,
        delta: 0,
        intentExact: false,
        usage: options.usage,
      }),
    );
  }

  return hits.sort((a, b) =>
    getToolCopy(dictionary, a.tool.id).name.localeCompare(
      getToolCopy(dictionary, b.tool.id).name,
      "en",
    ),
  );
}

export function searchTools(
  query: string,
  dictionary: Dictionary,
  options: SearchOptions = {},
): SearchHit[] {
  const q = query.trim();
  if (!q) return [];

  const parsed = parseSearchQuery(q);
  if (
    isLibraryQuery(parsed.matchQuery) ||
    isLibraryQuery(parsed.raw) ||
    isLibraryQuery(q)
  ) {
    return libraryHits(parsed, dictionary, options);
  }

  const excluded = new Set(options.excluded ?? []);
  const hits: SearchHit[] = [];
  for (const tool of tools) {
    if (excluded.has(tool.id)) continue;
    const hit = scoreTool(parsed, tool, dictionary, options.usage);
    if (hit) hits.push(hit);
  }

  return hits.sort(
    (a, b) =>
      b.constraintsSatisfied - a.constraintsSatisfied ||
      b.score - a.score ||
      (b.tool.popularity ?? 0) - (a.tool.popularity ?? 0) ||
      getToolCopy(dictionary, a.tool.id).name.localeCompare(
        getToolCopy(dictionary, b.tool.id).name,
        "en",
      ),
  );
}

export function groupSearchHits(
  hits: SearchHit[],
  dictionary: Dictionary,
  query: string,
): { label: string; tools: ToolDefinition[] }[] {
  const parsed = parseSearchQuery(query);
  const library =
    isLibraryQuery(parsed.matchQuery) ||
    isLibraryQuery(parsed.raw) ||
    isLibraryQuery(query);
  const q = normalize(parsed.matchQuery);
  const intentCluster =
    !library &&
    hits.some(
      (hit) =>
        hit.tool.surface === "web" &&
        (hit.tool.intents ?? []).some((intent) => normalize(intent) === q),
    );

  // Intent clusters (ai, social media…) keep Kit tools only on strong matches.
  const kit = hits
    .filter((hit) => hit.tool.surface === "kit")
    .filter((hit) => !intentCluster || hit.baseScore >= 70)
    .map((hit) => hit.tool);

  const webHits = hits
    .filter((hit) => hit.tool.surface === "web")
    .map((hit) => hit.tool);
  const web = library ? webHits : webHits.slice(0, 12);

  return [
    {
      label: library
        ? dictionary.search.libraryGroup
        : dictionary.search.toolsGroup,
      tools: kit,
    },
    {
      label: library
        ? dictionary.search.libraryWebGroup
        : dictionary.search.webGroup,
      tools: web,
    },
  ].filter((group) => group.tools.length > 0);
}

export type EmptyStateOptions = {
  usage?: Record<string, number>;
  /** Last opened tool id; used for a small related strip. */
  lastOpenedId?: string | null;
};

export function emptyStateTools(
  recentSlugs: string[],
  pinnedSlugs: string[] = [],
  options: EmptyStateOptions = {},
): {
  pinned: ToolDefinition[];
  recent: ToolDefinition[];
  related: ToolDefinition[];
  suggestions: ToolDefinition[];
} {
  const pinned = pinnedSlugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is ToolDefinition => Boolean(tool));

  const pinnedIds = new Set(pinned.map((tool) => tool.id));

  const recent = recentSlugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is ToolDefinition => Boolean(tool))
    .filter((tool) => !pinnedIds.has(tool.id));

  const recentIds = new Set(recent.map((tool) => tool.id));
  const blocked = new Set([...pinnedIds, ...recentIds]);

  const related: ToolDefinition[] = [];
  if (options.lastOpenedId) {
    const last = getToolById(options.lastOpenedId);
    const relatedIds = [
      ...(last?.relatedIds ?? []),
      ...(last?.alternatives ?? []),
    ];
    for (const id of relatedIds) {
      if (blocked.has(id) || related.some((tool) => tool.id === id)) continue;
      const tool = getToolById(id);
      if (!tool) continue;
      related.push(tool);
      blocked.add(id);
      if (related.length >= 3) break;
    }
  }

  const usage = options.usage ?? {};
  const suggestions = curatedSuggestions
    .map((id) => getToolById(id))
    .filter((tool): tool is ToolDefinition => Boolean(tool))
    .filter((tool) => !blocked.has(tool.id))
    .sort(
      (a, b) =>
        (usage[b.id] ?? 0) - (usage[a.id] ?? 0) ||
        (b.popularity ?? 0) - (a.popularity ?? 0),
    );

  if (
    suggestions.length === 0 &&
    recent.length === 0 &&
    pinned.length === 0 &&
    related.length === 0
  ) {
    return {
      pinned,
      recent,
      related,
      suggestions: kitTools.filter((tool) => tool.kind === "builtin"),
    };
  }

  return { pinned, recent, related, suggestions };
}
