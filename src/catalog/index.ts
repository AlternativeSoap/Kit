import type { ToolDefinition } from "@/tools/types";
import { bulkCatalog } from "./bulk";
import { webExtras } from "./extras";
import { curatedWebCatalog } from "./web";

function domainKey(tool: ToolDefinition): string | null {
  if (!tool.href) return null;
  try {
    const host = new URL(tool.href).hostname.toLowerCase().replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

/**
 * Merge curated web + extras over bulk popular sites.
 * Curated wins on id and domain collision.
 */
export function mergeWebCatalog(
  curated: ToolDefinition[] = [...curatedWebCatalog, ...webExtras],
  bulk: ToolDefinition[] = bulkCatalog,
): ToolDefinition[] {
  const byId = new Map<string, ToolDefinition>();
  const domains = new Set<string>();

  for (const tool of curated) {
    byId.set(tool.id, tool);
    const domain = domainKey(tool);
    if (domain) domains.add(domain);
  }

  for (const tool of bulk) {
    if (byId.has(tool.id)) continue;
    const domain = domainKey(tool);
    if (domain && domains.has(domain)) continue;
    byId.set(tool.id, tool);
    if (domain) domains.add(domain);
  }

  return [...byId.values()];
}

export const webCatalog: ToolDefinition[] = mergeWebCatalog();
