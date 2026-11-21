"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { KitMark } from "@/components/KitMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchShell } from "@/components/search/SearchShell";
import { useChromeOffset } from "@/hooks/useChromeOffset";
import { useDictionary } from "@/i18n/LanguageProvider";

export function ToolChrome() {
  const dictionary = useDictionary();
  const headerRef = useRef<HTMLElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  useChromeOffset(headerRef);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const input = searchWrapRef.current?.querySelector("input");
        input?.focus();
        return;
      }

      if (event.defaultPrevented) return;

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
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm [[data-kit-overlay-open]_&]:z-[calc(var(--kit-overlay-panel-z)+2)] [[data-kit-overlay-open]_&]:bg-background [[data-kit-overlay-open]_&]:backdrop-blur-none"
    >
      <div className="mx-auto flex w-full max-w-5xl items-center gap-1.5 px-2 py-2 sm:gap-3 sm:px-6 sm:py-3">
        <Link
          href="/"
          className="kit-touch-target group flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-sm font-medium text-foreground/80 hover:bg-overlay hover:text-foreground sm:w-auto sm:gap-2 sm:rounded-[8px] sm:px-2"
          aria-label={dictionary.brand}
        >
          <KitMark className="h-5 w-5 transition-[transform] duration-200 group-hover:scale-105" />
          <span className="hidden sm:inline">{dictionary.brand}</span>
        </Link>
        <div
          ref={searchWrapRef}
          className="relative z-50 min-w-0 flex-1 self-center"
        >
          <SearchShell variant="compact" />
        </div>
        <div className="relative z-30 shrink-0 self-center">
          <LanguageSwitcher compact />
        </div>
      </div>
    </header>
  );
}
