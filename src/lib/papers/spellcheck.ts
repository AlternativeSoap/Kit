/** Lightweight spellcheck for Skriv: bundled DA/EN lists + personal words. */

export type DictLang = "da" | "en" | "de" | "fr" | "es" | "sv" | "nb";

export const DICT_LANGS: DictLang[] = ["da", "en", "de", "fr", "es", "sv", "nb"];

export function isDictLang(value: string): value is DictLang {
  return (DICT_LANGS as string[]).includes(value);
}

const personalCache = new Map<DictLang, Set<string>>();

function personalKey(lang: DictLang) {
  return `kit-papers-personal-dict:${lang}`;
}

export function loadPersonalWords(lang: DictLang): Set<string> {
  const cached = personalCache.get(lang);
  if (cached) return cached;
  const set = new Set<string>();
  try {
    const raw = localStorage.getItem(personalKey(lang));
    if (raw) {
      const list = JSON.parse(raw) as unknown;
      if (Array.isArray(list)) {
        for (const w of list) {
          if (typeof w === "string" && w.trim()) set.add(w.toLowerCase());
        }
      }
    }
  } catch {
    /* ignore */
  }
  personalCache.set(lang, set);
  return set;
}

export function addPersonalWord(lang: DictLang, word: string) {
  const normalized = word.trim().toLowerCase();
  if (!normalized) return;
  const set = loadPersonalWords(lang);
  set.add(normalized);
  try {
    localStorage.setItem(personalKey(lang), JSON.stringify([...set].sort()));
  } catch {
    /* ignore quota */
  }
}

export function removePersonalWord(lang: DictLang, word: string) {
  const set = loadPersonalWords(lang);
  set.delete(word.trim().toLowerCase());
  try {
    localStorage.setItem(personalKey(lang), JSON.stringify([...set].sort()));
  } catch {
    /* ignore */
  }
}

/** Extract word tokens for spellchecking. */
export function extractWords(text: string): string[] {
  return text.match(/[\p{L}][\p{L}'’-]*/gu) ?? [];
}

function hasBundledList(lang: DictLang): boolean {
  return lang === "da" || lang === "en";
}

let enSet: Set<string> | null = null;
let daSet: Set<string> | null = null;

async function getBundledSet(lang: "da" | "en"): Promise<Set<string>> {
  if (lang === "en") {
    if (!enSet) {
      const mod = await import("./wordlists/en");
      enSet = new Set(mod.EN_WORDS);
    }
    return enSet;
  }
  if (!daSet) {
    const mod = await import("./wordlists/da");
    daSet = new Set(mod.DA_WORDS);
  }
  return daSet;
}

export type SpellIssue = { word: string; count: number };

/**
 * Find words not in the bundled list (DA/EN) or personal dictionary.
 * For other languages, only personal-dictionary misses are skipped;
 * browser native spellcheck covers the rest via `lang` on the editor.
 */
export async function findUnknownWords(
  text: string,
  lang: DictLang,
  options?: { limit?: number },
): Promise<SpellIssue[]> {
  const limit = options?.limit ?? 40;
  const personal = loadPersonalWords(lang);
  const bundled = hasBundledList(lang)
    ? await getBundledSet(lang as "da" | "en")
    : null;

  const counts = new Map<string, number>();
  for (const raw of extractWords(text)) {
    const word = raw.toLowerCase();
    if (word.length < 2) continue;
    if (/^\d/.test(word)) continue;
    if (personal.has(word)) continue;
    if (bundled) {
      if (bundled.has(word)) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
    // Third language: no bundled list; rely on browser underline + personal adds.
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

export function browserLangTag(lang: DictLang): string {
  switch (lang) {
    case "da":
      return "da";
    case "en":
      return "en";
    case "de":
      return "de";
    case "fr":
      return "fr";
    case "es":
      return "es";
    case "sv":
      return "sv";
    case "nb":
      return "nb";
  }
}
