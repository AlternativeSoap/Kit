import type { Dictionary } from "@/i18n/types";
import { parseAnswer } from "@/lib/answers/parse";
import { searchTools, type SearchHit } from "@/lib/search";

export type SearchDiagnostic = {
  query: string;
  answerKind: string | null;
  hitCount: number;
  top: Array<{
    id: string;
    score: number;
    baseScore: number;
    matchTier: string;
    matchedOn: string;
  }>;
  ambiguous: boolean;
  empty: boolean;
};

/** Local-only explain helper for fixtures and `?kitDebug=1`. */
export function diagnoseSearch(
  query: string,
  dictionary: Dictionary,
  locale: "en" | "da",
): SearchDiagnostic {
  const answer = parseAnswer(query, locale, new Date());
  const hits = searchTools(query, dictionary);
  const top = hits.slice(0, 5).map((hit: SearchHit) => ({
    id: hit.tool.id,
    score: hit.score,
    baseScore: hit.baseScore,
    matchTier: hit.matchTier,
    matchedOn: hit.matchedOn,
  }));
  const exactOrStrong = hits.filter(
    (hit) => hit.matchTier === "exact" || hit.matchTier === "strong",
  ).length;
  return {
    query,
    answerKind: answer?.kind ?? null,
    hitCount: hits.length,
    top,
    ambiguous: hits.length >= 2 && exactOrStrong === 0,
    empty: hits.length === 0 && !answer,
  };
}
