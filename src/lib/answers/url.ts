/** Full-query URL recognition. Never auto-opens. */

const URL_RE =
  /^(https?:\/\/[^\s/$.?#].[^\s]*|www\.[^\s/$.?#].[^\s]*)$/i;

export type UrlAnswer = {
  kind: "url";
  href: string;
  host: string;
};

export function parseUrl(query: string): UrlAnswer | null {
  const trimmed = query.trim();
  if (!URL_RE.test(trimmed)) return null;
  const href = trimmed.toLowerCase().startsWith("www.")
    ? `https://${trimmed}`
    : trimmed;
  try {
    const parsed = new URL(href);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return { kind: "url", href: parsed.href, host: parsed.host };
  } catch {
    return null;
  }
}
