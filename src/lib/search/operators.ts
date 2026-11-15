export type SearchSurfaceFilter = "kit" | "web" | null;

export type ParsedOperators = {
  surface: SearchSurfaceFilter;
  /** Query with @operators removed. */
  remainder: string;
};

/**
 * Optional power-user filters. Natural language stays the default.
 * Examples: "@kit moms", "@web pdf", "pdf @web"
 *
 * Parsed on the raw string so "@kit" is not split apart by tokenization.
 */
export function parseOperators(query: string): ParsedOperators {
  let remainder = query.trim();
  let surface: SearchSurfaceFilter = null;

  const kitMatch = remainder.match(/(^|\s)@kit\b/i);
  const webMatch = remainder.match(/(^|\s)@web\b/i);

  if (kitMatch) {
    surface = "kit";
    remainder = remainder.replace(/(^|\s)@kit\b/gi, " ").replace(/\s+/g, " ").trim();
  } else if (webMatch) {
    surface = "web";
    remainder = remainder.replace(/(^|\s)@web\b/gi, " ").replace(/\s+/g, " ").trim();
  }

  // Plain-word alternatives for people who avoid @ in the field.
  if (!surface) {
    const tokens = remainder.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.includes("kit-only")) {
      surface = "kit";
      remainder = tokens.filter((token) => token !== "kit-only").join(" ");
    } else if (tokens.includes("web-only")) {
      surface = "web";
      remainder = tokens.filter((token) => token !== "web-only").join(" ");
    }
  }

  return { surface, remainder };
}
