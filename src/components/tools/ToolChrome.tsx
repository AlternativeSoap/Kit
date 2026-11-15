"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { KitMark } from "@/components/KitMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchShell } from "@/components/search/SearchShell";
import { useDictionary } from "@/i18n/LanguageProvider";

export function ToolChrome() {
  const dictionary = useDictionary();
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const input = searchWrapRef.current?.querySelector("input");
        input?.focus();
        return;
      }

      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        event.preventDefault();
        const input = searchWrapRef.current?.querySelector("input");
        input?.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
        <Link
          href="/"
          className="kit-touch-target group flex shrink-0 items-center justify-center gap-2 rounded-[8px] text-sm font-medium text-foreground/80 hover:text-foreground"
          aria-label={dictionary.brand}
        >
          <KitMark className="h-5 w-5 transition-[transform] duration-200 group-hover:scale-105" />
          <span className="hidden sm:inline">{dictionary.brand}</span>
        </Link>
        <div
          ref={searchWrapRef}
          className="relative z-50 min-w-0 flex-1 overflow-visible"
        >
          <SearchShell variant="compact" />
        </div>
        <LanguageSwitcher compact />
      </div>
    </header>
  );
}
