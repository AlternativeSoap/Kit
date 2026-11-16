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
  | "kebab";

export type TextStats = {
  chars: number;
  words: number;
  lines: number;
  /** Approximate reading time in whole minutes (200 wpm). */
  readingMinutes: number;
};

export function textStats(text: string): TextStats {
  const chars = text.length;
  const lines = text.length === 0 ? 0 : text.split("\n").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readingMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));
  return { chars, words, lines, readingMinutes };
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
