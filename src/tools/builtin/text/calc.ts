export type TextTransform =
  | "upper"
  | "lower"
  | "title"
  | "trim"
  | "dedupe"
  | "pdfclean"
  | "slug"
  | "camel"
  | "snake"
  | "kebab"
  | "sortLines"
  | "reverseChars"
  | "reverseLines";

export type TextStats = {
  chars: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
  /** Approximate reading time in whole minutes (200 wpm). */
  readingMinutes: number;
};

export function textStats(text: string): TextStats {
  const chars = text.length;
  const lines = text.length === 0 ? 0 : text.split("\n").length;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const sentences = trimmed
    ? (trimmed.match(/[^.!?]+(?:[.!?]+|$)/g) ?? []).filter((s) => /\S/.test(s))
        .length
    : 0;
  const paragraphs = trimmed
    ? trimmed.split(/\r?\n\s*\r?\n/).filter((p) => p.trim()).length
    : 0;
  const readingMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));
  return { chars, words, lines, sentences, paragraphs, readingMinutes };
}

export type WordFrequency = { word: string; count: number };

/** Most frequent words (case-insensitive, letters and digits only). */
export function wordFrequency(text: string, limit = 10): WordFrequency[] {
  const counts = new Map<string, number>();
  const matches = text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  if (!matches) return [];
  for (const word of matches) counts.set(word, (counts.get(word) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

/** Replace every occurrence of a literal string. */
export function findReplace(
  text: string,
  find: string,
  replacement: string,
): { text: string; count: number } {
  if (!find) return { text, count: 0 };
  const parts = text.split(find);
  return { text: parts.join(replacement), count: parts.length - 1 };
}

function toTitleCase(line: string): string {
  return line.replace(/\S+/g, (word) => {
    const lower = word.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
}

function toSlugBase(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/gi, "ae")
    .replace(/ø/gi, "oe")
    .replace(/å/gi, "aa")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}

export function transformText(text: string, action: TextTransform): string {
  switch (action) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return text
        .split("\n")
        .map((line) => toTitleCase(line))
        .join("\n");
    case "trim":
      return text.trim();
    case "pdfclean": {
      let cleaned = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      cleaned = cleaned.replace(/(\S)-\n(\S)/g, "$1$2");
      cleaned = cleaned.replace(/([^\n])\n(?!\n)/g, "$1 ");
      cleaned = cleaned.replace(/[ \t\f\v]+/g, " ");
      cleaned = cleaned.replace(/ *\n */g, "\n");
      cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
      return cleaned.trim();
    }
    case "dedupe": {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const line of text.split("\n")) {
        const key = line.trimEnd();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(line);
      }
      return out.join("\n");
    }
    case "sortLines":
      return text
        .split("\n")
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
        .join("\n");
    case "reverseChars":
      return Array.from(text).reverse().join("");
    case "reverseLines":
      return text.split("\n").reverse().join("\n");
    case "slug":
    case "kebab":
      return toSlugBase(text);
    case "snake":
      return toSlugBase(text).replace(/-/g, "_");
    case "camel": {
      const parts = toSlugBase(text).split("-").filter(Boolean);
      return parts
        .map((part, index) =>
          index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
        )
        .join("");
    }
    default:
      return text;
  }
}
