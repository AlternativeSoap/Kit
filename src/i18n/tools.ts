import { getBulkSiteCopy } from "@/catalog/bulk";
import { getToolById } from "@/tools/registry";
import type { Dictionary } from "./types";

function isDanishDictionary(dictionary: Dictionary): boolean {
  return dictionary.library.title === "Bibliotek";
}

export function getToolCopy(dictionary: Dictionary, id: string) {
  const localized = dictionary.tools[id];
  if (localized) return localized;

  const bulk = getBulkSiteCopy(id);
  if (bulk) {
    const da = isDanishDictionary(dictionary);
    return {
      name: bulk.name,
      description: da ? bulk.descriptionDa : bulk.descriptionEn,
    };
  }

  const fallback = getToolById(id);
  return {
    name: fallback?.name ?? id,
    description: fallback?.description ?? "",
  };
}
