const STORAGE_KEY = "kit:recent";
const MAX_RECENT = 8;

export function getRecentSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate from the previous Grej key if present.
      const legacy = window.localStorage.getItem("grej:recent");
      if (legacy) {
        window.localStorage.setItem(STORAGE_KEY, legacy);
        return JSON.parse(legacy) as string[];
      }
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function pushRecentSlug(slug: string): string[] {
  const next = [
    slug,
    ...getRecentSlugs().filter((item) => item !== slug),
  ].slice(0, MAX_RECENT);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private mode failures.
  }
  return next;
}

export function removeRecentSlug(slug: string): string[] {
  const next = getRecentSlugs().filter((item) => item !== slug);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private mode failures.
  }
  return next;
}
