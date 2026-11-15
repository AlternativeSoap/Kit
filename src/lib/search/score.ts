import type { Dictionary } from "@/i18n/types";
import { getToolCopy } from "@/i18n/tools";
import type { ToolDefinition } from "@/tools/types";
import type { SearchConstraints } from "./constraints";
import { contentTokens, normalize, tokenize } from "./normalize";
import { expandToken } from "./synonyms";
import { isTypoOf } from "./typo";

export type ScoredField = {
  score: number;
  matchedOn: string;
};

type Candidate = {
  label: string;
  weight: number;
  /** Fuzzy / typo allowed. Descriptions stay exact/contains only. */
  allowFuzzy: boolean;
};

function scoreField(
  query: string,
  field: string,
  allowFuzzy: boolean,
): number | null {
  const q = normalize(query);
  const f = normalize(field);
  if (!q || !f) return null;
  if (f === q) return 100;

  const fieldTokens = tokenize(f);

  // Short tokens only match whole words or word starts ("vat" ≠ "valuta",
  // "ai" ≠ "gmail"). No subsequence fuzzy here.
  if (q.length < 4) {
    if (fieldTokens.some((token) => token === q)) return 100;
    if (fieldTokens.some((token) => token.startsWith(q))) return 70;
    return null;
  }

  if (f.startsWith(q)) return 85;
  if (fieldTokens.some((token) => token === q)) return 100;
  if (fieldTokens.some((token) => token.startsWith(q))) return 80;
  if (f.includes(q)) return 70;

  if (!allowFuzzy) return null;

  // Typo against a whole field that is itself a short label.
  if (isTypoOf(q, f)) return 78;

  // Typo against an individual token in the field.
  for (const token of fieldTokens) {
    if (isTypoOf(q, token)) return 76;
  }

  let fi = 0;
  for (const ch of q) {
    const found = f.indexOf(ch, fi);
    if (found === -1) return null;
    fi = found + 1;
  }
  return Math.max(40, 60 - Math.abs(f.length - q.length));
}

function candidatesFor(
  tool: ToolDefinition,
  dictionary: Dictionary,
): Candidate[] {
  const copy = getToolCopy(dictionary, tool.id);
  return [
    { label: copy.name, weight: 0, allowFuzzy: true },
    { label: tool.slug, weight: -2, allowFuzzy: true },
    { label: copy.description, weight: -18, allowFuzzy: false },
    ...tool.aliases.map((alias) => ({
      label: alias,
      weight: -1,
      allowFuzzy: true,
    })),
    ...(tool.intents ?? []).map((intent) => ({
      label: intent,
      weight: 6,
      allowFuzzy: true,
    })),
    ...(tool.tags ?? []).map((tag) => ({
      label: tag,
      weight: 4,
      allowFuzzy: true,
    })),
    ...(tool.capabilities ?? []).map((capability) => ({
      label: capability,
      weight: 3,
      allowFuzzy: true,
    })),
    ...(tool.formats ?? []).map((format) => ({
      label: format,
      weight: 3,
      allowFuzzy: true,
    })),
  ];
}

/** Best score for one query string against one tool. */
export function scoreQueryAgainstTool(
  query: string,
  tool: ToolDefinition,
  dictionary: Dictionary,
): ScoredField | null {
  let best: ScoredField | null = null;
  for (const candidate of candidatesFor(tool, dictionary)) {
    const raw = scoreField(query, candidate.label, candidate.allowFuzzy);
    if (raw === null) continue;
    const score = raw + candidate.weight;
    if (!best || score > best.score) {
      best = { score, matchedOn: candidate.label };
    }
  }
  return best;
}

/**
 * Score one content token, trying synonyms. Returns the best label match.
 */
function scoreTokenAgainstTool(
  token: string,
  tool: ToolDefinition,
  dictionary: Dictionary,
): ScoredField | null {
  let best: ScoredField | null = null;
  const original = normalize(token);
  for (const form of expandToken(token)) {
    const hit = scoreQueryAgainstTool(form, tool, dictionary);
    if (!hit) continue;
    const isSynonym = form !== original;
    // Synonym forms must be strong matches so "moms"→"vat" does not soft-match
    // unrelated words through subsequence noise.
    if (isSynonym && hit.score < 70) continue;
    const synonymPenalty = isSynonym ? 4 : 0;
    const score = hit.score - synonymPenalty;
    if (!best || score > best.score) {
      best = { score, matchedOn: hit.matchedOn };
    }
  }
  return best;
}

export type TokenMatchResult = {
  baseScore: number;
  matchedOn: string;
  matchedTokens: number;
  totalTokens: number;
};

/**
 * Multi-token match: each content token can hit the tool (with synonyms/typos).
 * Long queries need enough token coverage so loose single hits do not win.
 */
export function matchToolTokens(
  query: string,
  tool: ToolDefinition,
  dictionary: Dictionary,
): TokenMatchResult | null {
  const tokens = contentTokens(query);
  if (tokens.length === 0) {
    const whole = scoreQueryAgainstTool(query, tool, dictionary);
    if (!whole) return null;
    return {
      baseScore: whole.score,
      matchedOn: whole.matchedOn,
      matchedTokens: 1,
      totalTokens: 1,
    };
  }

  // Single-token / short phrase: also try the full remainder string first so
  // "password generator" still exact-matches the alias.
  const whole = scoreQueryAgainstTool(query, tool, dictionary);
  const perToken: ScoredField[] = [];
  for (const token of tokens) {
    const hit = scoreTokenAgainstTool(token, tool, dictionary);
    if (hit && hit.score >= 40) perToken.push(hit);
  }

  if (perToken.length === 0 && !whole) return null;

  const matchedTokens = perToken.length;
  const totalTokens = tokens.length;
  // Short multi-word queries must hit every word ("image editor" ≠ compress-only).
  const minCoverage =
    totalTokens <= 1
      ? 1
      : totalTokens <= 3
        ? totalTokens
        : Math.ceil(totalTokens * 0.75);

  // Exact or near-exact phrase matches (aliases like "compress image") win.
  if (whole && whole.score >= 99) {
    return {
      baseScore: whole.score + 36,
      matchedOn: whole.matchedOn,
      matchedTokens: Math.max(matchedTokens, totalTokens),
      totalTokens,
    };
  }
  if (whole && whole.score >= 85) {
    return {
      baseScore: whole.score + 20,
      matchedOn: whole.matchedOn,
      matchedTokens: Math.max(matchedTokens, 1),
      totalTokens,
    };
  }

  if (matchedTokens < minCoverage) {
    if (whole && whole.score >= 70) {
      return {
        baseScore: whole.score,
        matchedOn: whole.matchedOn,
        matchedTokens: 1,
        totalTokens,
      };
    }
    return null;
  }

  // Average across all query tokens so missing words pull the score down.
  const scored = tokens.map((token) => {
    const hit = scoreTokenAgainstTool(token, tool, dictionary);
    return hit && hit.score >= 40 ? hit.score : 0;
  });
  const avg = scored.reduce((sum, value) => sum + value, 0) / totalTokens;
  const coverageBonus = (matchedTokens / totalTokens) * 12;
  const bestLabel = perToken.reduce((a, b) => (a.score >= b.score ? a : b));

  return {
    baseScore: avg + coverageBonus,
    matchedOn: bestLabel.matchedOn,
    matchedTokens,
    totalTokens,
  };
}

export function constraintAdjustment(
  tool: ToolDefinition,
  constraints: SearchConstraints,
): { delta: number; hardReject: boolean; satisfied: number } {
  let delta = 0;
  let satisfied = 0;
  let hardReject = false;

  if (constraints.pricing === "free") {
    if (tool.pricing === "free") {
      delta += 22;
      satisfied += 1;
    } else if (tool.pricing === "freemium") {
      delta += 6;
    } else if (tool.pricing === "paid") {
      hardReject = true;
    } else {
      delta -= 4;
    }
  }

  if (constraints.registration === "none") {
    if (tool.registration === "none") {
      delta += 22;
      satisfied += 1;
    } else if (tool.registration === "optional") {
      delta += 4;
    } else if (tool.registration === "required") {
      hardReject = true;
    } else {
      delta -= 6;
    }
  }

  if (constraints.privacy) {
    if (
      tool.privacy === constraints.privacy ||
      (constraints.privacy === "privacy-focused" && tool.privacy === "local")
    ) {
      delta += 18;
      satisfied += 1;
    } else if (tool.privacy && tool.privacy !== "unknown") {
      delta -= 4;
    }
  }

  if (constraints.openSource) {
    const tags = tool.tags ?? [];
    if (tags.includes("open-source")) {
      delta += 20;
      satisfied += 1;
    } else {
      delta -= 8;
    }
  }

  for (const tag of constraints.tags) {
    if ((tool.tags ?? []).includes(tag) || (tool.formats ?? []).includes(tag)) {
      delta += 14;
      satisfied += 1;
    }
  }

  return { delta, hardReject, satisfied };
}
