/** Lowercase, strip accents, trim. Keeps æ/ø/å as letters for Danish tokens. */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const TOKEN_SPLIT = /[^a-z0-9æøå]+/i;

/** Split a field or query into searchable tokens. */
export function tokenize(value: string): string[] {
  return normalize(value)
    .split(TOKEN_SPLIT)
    .filter(Boolean);
}

/** Words that rarely name a tool on their own. */
const STOPWORDS = new Set(
  [
    "a",
    "an",
    "the",
    "to",
    "for",
    "and",
    "or",
    "of",
    "in",
    "on",
    "with",
    "from",
    "into",
    "as",
    "my",
    "me",
    "i",
    "en",
    "et",
    "de",
    "den",
    "det",
    "til",
    "med",
    "fra",
    "som",
    "paa",
    "pa",
    "og",
    "eller",
    "find",
    "finds",
    "get",
    "open",
    "show",
    "use",
    "using",
    "please",
    "tool",
    "tools",
    "app",
    "apps",
    "site",
    "website",
    "online",
    "vaerktoj",
    "vaerktojer",
  ].map(normalize),
);

export function contentTokens(value: string): string[] {
  return tokenize(value).filter((token) => !STOPWORDS.has(token));
}
