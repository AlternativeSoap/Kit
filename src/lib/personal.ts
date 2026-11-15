import { tools } from "@/tools/registry";
import { getRecentSlugs } from "@/lib/recent";

const SHORTCUTS_KEY = "kit:shortcuts";
const PINS_KEY = "kit:pins";
const USAGE_KEY = "kit:usage";
const LAST_MATCH_KEY = "kit:lastMatch";
const LAST_OPENED_KEY = "kit:lastOpened";
const EXCLUDED_KEY = "kit:excluded";

export type Shortcut = {
  /** User-chosen alias, stored lowercase. */
  alias: string;
  toolId: string;
};

export type LastSearchMatch = {
  toolId: string;
  query: string;
  matchedOn: string;
  at: number;
};

const MAX_SHORTCUTS = 40;
const MAX_PINS = 8;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota / private mode failures.
  }
}

/** Lets open search UIs refresh pins and shortcuts without a full reload. */
export function notifyPersonalChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("kit:personal-changed"));
}

function normalizeAlias(alias: string): string {
  return alias.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getShortcuts(): Shortcut[] {
  const parsed = readJson<unknown>(SHORTCUTS_KEY, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(
      (item): item is Shortcut =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as Shortcut).alias === "string" &&
        typeof (item as Shortcut).toolId === "string",
    )
    .map((item) => ({
      alias: normalizeAlias(item.alias),
      toolId: item.toolId,
    }))
    .filter((item) => item.alias.length > 0 && item.alias.length <= 32);
}

export function findShortcut(query: string): Shortcut | null {
  const alias = normalizeAlias(query);
  if (!alias) return null;
  return getShortcuts().find((item) => item.alias === alias) ?? null;
}

export type ShortcutConflict =
  | { type: "shortcut"; alias: string }
  | { type: "builtin"; alias: string; toolId: string }
  | null;

/** True when the alias collides with another shortcut or a tool alias/slug. */
export function shortcutConflict(
  alias: string,
  exceptToolId?: string,
): ShortcutConflict {
  const normalized = normalizeAlias(alias);
  if (!normalized) return null;

  const existing = getShortcuts().find(
    (item) =>
      item.alias === normalized &&
      (!exceptToolId || item.toolId !== exceptToolId),
  );
  if (existing) return { type: "shortcut", alias: normalized };

  for (const tool of tools) {
    if (exceptToolId && tool.id === exceptToolId) continue;
    const names = [tool.slug, tool.id, ...tool.aliases];
    if (names.some((name) => name.toLowerCase() === normalized)) {
      return { type: "builtin", alias: normalized, toolId: tool.id };
    }
  }
  return null;
}

export function setShortcut(
  alias: string,
  toolId: string,
): { ok: true } | { ok: false; reason: "invalid" | "conflict" | "unknown-tool" } {
  const normalized = normalizeAlias(alias);
  if (!normalized || normalized.length > 32) return { ok: false, reason: "invalid" };
  if (!tools.some((tool) => tool.id === toolId)) {
    return { ok: false, reason: "unknown-tool" };
  }
  if (shortcutConflict(normalized, toolId)) {
    return { ok: false, reason: "conflict" };
  }

  const next = [
    { alias: normalized, toolId },
    ...getShortcuts().filter((item) => item.alias !== normalized),
  ].slice(0, MAX_SHORTCUTS);
  writeJson(SHORTCUTS_KEY, next);
  notifyPersonalChanged();
  return { ok: true };
}

export function removeShortcut(alias: string): Shortcut[] {
  const normalized = normalizeAlias(alias);
  const next = getShortcuts().filter((item) => item.alias !== normalized);
  writeJson(SHORTCUTS_KEY, next);
  notifyPersonalChanged();
  return next;
}

export function getPinnedSlugs(): string[] {
  const parsed = readJson<unknown>(PINS_KEY, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is string => typeof item === "string");
}

export function isPinned(slug: string): boolean {
  return getPinnedSlugs().includes(slug);
}

export function togglePin(slug: string): string[] {
  const current = getPinnedSlugs();
  const next = current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [slug, ...current].slice(0, MAX_PINS);
  writeJson(PINS_KEY, next);
  notifyPersonalChanged();
  return next;
}

/** Move a pinned slug up (-1) or down (+1) in the saved order. */
export function movePin(slug: string, direction: -1 | 1): string[] {
  const current = getPinnedSlugs();
  const index = current.indexOf(slug);
  if (index === -1) return current;
  const target = index + direction;
  if (target < 0 || target >= current.length) return current;
  const next = [...current];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  writeJson(PINS_KEY, next);
  notifyPersonalChanged();
  return next;
}

export function getExcludedIds(): string[] {
  const parsed = readJson<unknown>(EXCLUDED_KEY, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is string => typeof item === "string");
}

export function excludeTool(toolId: string): string[] {
  if (!tools.some((tool) => tool.id === toolId)) return getExcludedIds();
  const next = [
    toolId,
    ...getExcludedIds().filter((id) => id !== toolId),
  ].slice(0, 80);
  writeJson(EXCLUDED_KEY, next);
  notifyPersonalChanged();
  return next;
}

export function restoreExcluded(toolId: string): string[] {
  const next = getExcludedIds().filter((id) => id !== toolId);
  writeJson(EXCLUDED_KEY, next);
  notifyPersonalChanged();
  return next;
}

export function getUsageCounts(): Record<string, number> {
  const parsed = readJson<unknown>(USAGE_KEY, {});
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      out[key] = value;
    }
  }
  return out;
}

export function bumpUsage(toolId: string): void {
  const counts = getUsageCounts();
  counts[toolId] = (counts[toolId] ?? 0) + 1;
  writeJson(USAGE_KEY, counts);
}

export function getLastOpenedToolId(): string | null {
  const parsed = readJson<unknown>(LAST_OPENED_KEY, null);
  return typeof parsed === "string" && parsed.length > 0 ? parsed : null;
}

export function setLastOpenedToolId(toolId: string): void {
  writeJson(LAST_OPENED_KEY, toolId);
}

export function setLastSearchMatch(match: LastSearchMatch): void {
  writeJson(LAST_MATCH_KEY, match);
}

export function getLastSearchMatch(): LastSearchMatch | null {
  const parsed = readJson<unknown>(LAST_MATCH_KEY, null);
  if (!parsed || typeof parsed !== "object") return null;
  const match = parsed as LastSearchMatch;
  if (
    typeof match.toolId !== "string" ||
    typeof match.query !== "string" ||
    typeof match.matchedOn !== "string"
  ) {
    return null;
  }
  return match;
}

export function clearLastSearchMatch(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LAST_MATCH_KEY);
  } catch {
    // ignore
  }
}

/** Removes every Kit personal key, including recent tools. */
export function clearPersonalData(): void {
  if (typeof window === "undefined") return;
  const keys = [
    SHORTCUTS_KEY,
    PINS_KEY,
    USAGE_KEY,
    LAST_MATCH_KEY,
    LAST_OPENED_KEY,
    EXCLUDED_KEY,
    "kit:calculator-mode",
    "kit:enheder-category",
    "kit:recent",
    "grej:recent",
  ];
  for (const key of keys) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
  notifyPersonalChanged();
}

export function personalDataSummary(): {
  shortcuts: number;
  pins: number;
  recent: number;
} {
  return {
    shortcuts: getShortcuts().length,
    pins: getPinnedSlugs().length,
    recent: getRecentSlugs().length,
  };
}
