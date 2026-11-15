import type { Dictionary } from "@/i18n/types";
import { getToolCopy } from "@/i18n/tools";
import { tools } from "@/tools/registry";
import { normalize } from "./normalize";

export type QuerySuggestion = {
  label: string;
  /** Text inserted into the search field when chosen. */
  query: string;
};

/**
 * Short typed-prefix completions from registry aliases/intents.
 * Never echoes the raw query unchanged. Cap at 5.
 */
export function suggestQueries(
  rawQuery: string,
  dictionary: Dictionary,
  limit = 5,
): QuerySuggestion[] {
  const q = normalize(rawQuery.trim());
  if (q.length < 2 || q.length > 24) return [];

  const out: QuerySuggestion[] = [];
  const seen = new Set<string>();

  const push = (label: string, query: string) => {
    const key = normalize(query);
    if (!key || key === q || seen.has(key)) return;
    if (!key.startsWith(q) && !normalize(label).startsWith(q)) return;
    seen.add(key);
    out.push({ label, query });
  };

  // Prefer the full-catalog browse before ordinary tool name completions.
  const libraryHints: Array<[string, string]> = [
    ["library", "library"],
    ["bibliotek", "bibliotek"],
    ["katalog", "katalog"],
    ["catalog", "catalog"],
  ];
  for (const [label, query] of libraryHints) {
    if (out.length >= limit) break;
    if (normalize(label).startsWith(q)) {
      push(label, query);
    }
  }

  for (const tool of tools) {
    if (out.length >= limit) break;
    const copy = getToolCopy(dictionary, tool.id);
    const candidates = [
      copy.name,
      tool.slug,
      ...(tool.aliases ?? []),
      ...(tool.intents ?? []),
    ];
    for (const candidate of candidates) {
      if (out.length >= limit) break;
      const n = normalize(candidate);
      if (n.startsWith(q) || n.includes(` ${q}`)) {
        push(copy.name, candidate);
      }
    }
  }

  // Pattern hints that are not tool names.
  const patterns: Array<[string, string, string]> = [
    ["en", "25% of ", "25% of 1000"],
    ["en", "vat ", "1250 including VAT"],
    ["en", "%", "25% of 1000"],
    ["da", "25% af ", "25% af 1000"],
    ["da", "moms ", "1250 inkl. moms"],
  ];
  for (const [, prefix, example] of patterns) {
    if (out.length >= limit) break;
    if (normalize(example).startsWith(q) || q.endsWith("%")) {
      if (normalize(prefix).startsWith(q) || q.includes("%")) {
        push(example, example);
      }
    }
  }

  return out.slice(0, limit);
}
