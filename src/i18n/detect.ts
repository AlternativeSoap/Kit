import type { Locale } from "./types";

export const LOCALE_STORAGE_KEY = "kit:locale";
export const LOCALE_COOKIE = "kit-locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "da";
}

/** English or Danish follow the device language. Everything else defaults to English. */
export function localeFromLanguageTag(tag: string | undefined | null): Locale {
  if (!tag) return "en";
  const normalized = tag.toLowerCase();
  if (normalized.startsWith("da")) return "da";
  if (normalized.startsWith("en")) return "en";
  return "en";
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const primary = navigator.language || navigator.languages?.[0];
  return localeFromLanguageTag(primary);
}

export function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

function writeLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function readCookieLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=(en|da)(?:;|$)`),
  );
  return match && isLocale(match[1]) ? match[1] : null;
}

export function writeStoredLocale(locale: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore quota / private mode failures.
  }
  writeLocaleCookie(locale);
}

export function resolveInitialLocale(): Locale {
  return readStoredLocale() ?? readCookieLocale() ?? detectBrowserLocale();
}
