import { getBulkSiteCopy } from "@/catalog/bulk";
import { getSimpleDef } from "@/tools/builtin/simple/defs";
import { getToolById } from "@/tools/registry";
import type { Dictionary } from "./types";

function isDanishDictionary(dictionary: Dictionary): boolean {
  return dictionary.library.title === "Bibliotek";
}

export function getToolCopy(dictionary: Dictionary, id: string) {
  const localized = dictionary.tools[id];
  if (localized) return localized;

  const da = isDanishDictionary(dictionary);

  const simple = getSimpleDef(id);
  if (simple) {
    return {
      name: da ? simple.nameDa : simple.nameEn,
      description: da ? simple.descriptionDa : simple.descriptionEn,
    };
  }

  const bulk = getBulkSiteCopy(id);
  if (bulk) {
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
