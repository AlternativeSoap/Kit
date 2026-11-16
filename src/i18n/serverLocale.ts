import { cookies, headers } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "./detect";
import type { Locale } from "./types";

/**
 * Prefer cookie / request header when a Node request exists.
 * During static export there is no request, so fall back to English.
 * The client LanguageProvider still applies the user's saved locale.
 */
export async function getRequestLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
    if (isLocale(fromCookie)) return fromCookie;

    const headerStore = await headers();
    const fromHeader = headerStore.get("x-kit-locale");
    if (isLocale(fromHeader)) return fromHeader;
  } catch {
    // Static generation / export has no request store.
  }

  return "en";
}
