import { Suspense } from "react";
import { HomePage } from "./HomePage";
import { LocaleGate } from "@/i18n/LanguageProvider";
import { getRequestLocale } from "@/i18n/serverLocale";

export default function Page() {
  return (
    <Suspense fallback={<HomePage />}>
      <HomePageBody />
    </Suspense>
  );
}

async function HomePageBody() {
  const serverLocale = await getRequestLocale();
  return (
    <LocaleGate serverLocale={serverLocale}>
      <HomePage />
    </LocaleGate>
  );
}
