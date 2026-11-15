import { NextResponse, type NextRequest } from "next/server";
import {
  isLocale,
  localeFromLanguageTag,
  LOCALE_COOKIE,
} from "@/i18n/detect";

export function proxy(request: NextRequest) {
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(existing)) {
    return NextResponse.next();
  }

  const locale = localeFromLanguageTag(
    request.headers.get("accept-language"),
  );
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-kit-locale", locale);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
