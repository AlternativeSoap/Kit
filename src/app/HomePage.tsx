"use client";

import Link from "next/link";
import { useEffect } from "react";
import { KitMark } from "@/components/KitMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchShell } from "@/components/search/SearchShell";
import {
  MobileTryThisRail,
  TryThisTips,
} from "@/components/search/TryThisTips";
import { useDictionary } from "@/i18n/LanguageProvider";

export function HomePage() {
  const dictionary = useDictionary();

  useEffect(() => {
    document.title = dictionary.brand;
  }, [dictionary.brand]);

  return (
    <main className="relative flex min-h-full min-h-dvh flex-1 flex-col">
      <TryThisTips />
      <header className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-4 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 sm:pt-6">
        <p className="group flex items-center gap-2 text-sm font-medium tracking-tight text-foreground/80">
          <KitMark className="h-5 w-5" />
          {dictionary.brand}
        </p>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/settings"
            className="kit-touch-target inline-flex items-center justify-center rounded-[8px] px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-accent-soft hover:text-foreground sm:px-2 sm:py-1"
          >
            {dictionary.personal.open}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="pointer-events-none relative z-40 flex flex-1 flex-col items-center justify-start px-4 pb-[max(6rem,env(safe-area-inset-bottom))] pt-24 sm:justify-center sm:px-6 sm:pb-24 sm:pt-20">
        <div className="pointer-events-auto w-full max-w-xl">
          <SearchShell variant="home" autoFocus />
          <MobileTryThisRail />
        </div>
      </div>
    </main>
  );
}
