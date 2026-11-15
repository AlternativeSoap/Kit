import type { ToolDefinition } from "@/tools/types";
import describedSites from "./data/described-sites.json";

type DescribedSite = {
  domain: string;
  name: string;
  descriptionEn: string;
  descriptionDa: string;
  category: string;
  popularity?: number;
};

type DescribedPayload = {
  generatedAt?: string;
  count?: number;
  sites: DescribedSite[];
};

const CATEGORY_TAGS: Record<string, string[]> = {
  social: ["social"],
  video: ["video", "media"],
  shopping: ["shopping"],
  news: ["news"],
  tech: ["tech", "code"],
  ai: ["ai"],
  productivity: ["work"],
  travel: ["travel", "maps"],
  finance: ["finance"],
  education: ["education"],
  tools: ["tools"],
  denmark: ["denmark"],
  gaming: ["gaming"],
  health: ["health"],
  gov: ["government"],
  search: ["search"],
  web: ["web"],
};

export type BulkSiteCopy = {
  name: string;
  descriptionEn: string;
  descriptionDa: string;
};

const copyById = new Map<string, BulkSiteCopy>();

function domainToId(domain: string): string {
  return `web-${domain.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`;
}

function aliasesFor(domain: string, name: string): string[] {
  const bare = domain.replace(/^www\./, "");
  const short = bare.split(".")[0] ?? bare;
  return [...new Set([bare, short, domain, name, name.toLowerCase()])];
}

/**
 * Useful destinations with real EN/DA descriptions (not a raw top-sites dump).
 * Source: scripts/data/build-described-sites.mjs → described-sites.json
 */
export function buildBulkCatalog(
  payload: DescribedPayload = describedSites as DescribedPayload,
): ToolDefinition[] {
  copyById.clear();
  const sites = payload.sites ?? [];

  return sites.map((site, index) => {
    const domain = site.domain.toLowerCase();
    const id = domainToId(domain);
    const category = site.category || "web";
    const tags = CATEGORY_TAGS[category] ?? ["web"];
    copyById.set(id, {
      name: site.name,
      descriptionEn: site.descriptionEn,
      descriptionDa: site.descriptionDa,
    });
    return {
      id,
      slug: id,
      name: site.name,
      description: site.descriptionEn,
      aliases: aliasesFor(domain, site.name),
      intents: tags,
      popularity: site.popularity ?? Math.max(20, 70 - Math.floor(index / 20)),
      kind: "external" as const,
      surface: "web" as const,
      href: `https://${domain}`,
      pricing: "unknown" as const,
      registration: "unknown" as const,
      privacy: "unknown" as const,
      platforms: ["web"] as const,
      tags,
      capabilities: ["browse"],
    };
  });
}

export const bulkCatalog: ToolDefinition[] = buildBulkCatalog();

export function getBulkSiteCopy(id: string): BulkSiteCopy | undefined {
  return copyById.get(id);
}
