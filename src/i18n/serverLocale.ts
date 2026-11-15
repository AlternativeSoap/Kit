import { cookies, headers } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "./detect";
import type { Locale } from "./types";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const headerStore = await headers();
  const fromHeader = headerStore.get("x-kit-locale");
  if (isLocale(fromHeader)) return fromHeader;

  return "en";
}
