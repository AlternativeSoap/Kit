import type { Metadata } from "next";
import { Suspense } from "react";
import { LibraryCatalog } from "@/components/library/LibraryCatalog";
import { ToolChrome } from "@/components/tools/ToolChrome";
import { LocaleGate } from "@/i18n/LanguageProvider";
import { getRequestLocale } from "@/i18n/serverLocale";

export const metadata: Metadata = {
  title: "Library",
  description: "Browse every Kit tool and linked site.",
};

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full min-h-dvh flex-1 flex-col overflow-x-clip">
          <div className="sticky top-0 z-40 h-[53px] border-b border-border bg-background/90 pt-[env(safe-area-inset-top)] sm:h-[57px]" />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10" />
        </div>
      }
    >
      <LibraryPageBody />
    </Suspense>
  );
}

async function LibraryPageBody() {
  const serverLocale = await getRequestLocale();

  return (
    <LocaleGate serverLocale={serverLocale}>
      <div className="flex min-h-full min-h-dvh flex-1 flex-col overflow-x-clip">
        <ToolChrome />
        <main className="kit-tool-enter mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10 sm:pb-10">
          <LibraryCatalog />
        </main>
      </div>
    </LocaleGate>
  );
}
