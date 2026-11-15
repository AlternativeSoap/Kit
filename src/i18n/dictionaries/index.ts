import type { Dictionary, Locale } from "../types";
import { da } from "./da";
import { en } from "./en";

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  da,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
