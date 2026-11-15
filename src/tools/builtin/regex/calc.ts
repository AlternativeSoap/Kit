export type RegexFlagKey = "g" | "i" | "m" | "s" | "u" | "y";

export type RegexMatch = {
  index: number;
  text: string;
  groups: string[];
};

export type RegexResult =
  | { ok: true; matches: RegexMatch[]; flags: string }
  | { ok: false; error: string };

export function buildFlags(selected: Partial<Record<RegexFlagKey, boolean>>): string {
  let flags = "";
  for (const key of ["g", "i", "m", "s", "u", "y"] as const) {
    if (selected[key]) flags += key;
  }
  return flags;
}

export function testRegex(pattern: string, flags: string, text: string): RegexResult {
  if (!pattern) {
    return { ok: true, matches: [], flags };
  }
  try {
    const re = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];
    if (flags.includes("g")) {
      let match: RegExpExecArray | null;
      let guard = 0;
      while ((match = re.exec(text)) !== null) {
        matches.push({
          index: match.index,
          text: match[0] ?? "",
          groups: match.slice(1).map((g) => g ?? ""),
        });
        if (match[0] === "") {
          re.lastIndex += 1;
        }
        if (++guard > 10_000) break;
      }
    } else {
      const match = re.exec(text);
      if (match) {
        matches.push({
          index: match.index,
          text: match[0] ?? "",
          groups: match.slice(1).map((g) => g ?? ""),
        });
      }
    }
    return { ok: true, matches, flags };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid regular expression",
    };
  }
}

/** Split text into segments for highlight rendering. */
export function highlightSegments(
  text: string,
  matches: RegexMatch[],
): { text: string; hit: boolean }[] {
  if (!matches.length) return [{ text, hit: false }];
  const sorted = [...matches].sort((a, b) => a.index - b.index);
  const parts: { text: string; hit: boolean }[] = [];
  let cursor = 0;
  for (const match of sorted) {
    if (match.index < cursor) continue;
    if (match.index > cursor) {
      parts.push({ text: text.slice(cursor, match.index), hit: false });
    }
    const end = match.index + match.text.length;
    parts.push({ text: text.slice(match.index, end), hit: true });
    cursor = end;
  }
  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), hit: false });
  }
  return parts;
}
