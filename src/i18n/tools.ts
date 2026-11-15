import { getToolById } from "@/tools/registry";
import type { Dictionary } from "./types";

export function getToolCopy(dictionary: Dictionary, id: string) {
  const localized = dictionary.tools[id];
  if (localized) return localized;

  const fallback = getToolById(id);
  return {
    name: fallback?.name ?? id,
    description: fallback?.description ?? "",
  };
}
