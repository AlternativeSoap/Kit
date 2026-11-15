"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Locale } from "@/i18n/types";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { locale, setLocale, dictionary } = useLanguage();

  const options: Locale[] = ["en", "da"];

  return (
    <div
      className={`inline-flex items-center gap-1 ${compact ? "" : ""}`}
      role="group"
      aria-label={dictionary.language.label}
    >
      {options.map((option) => {
        const active = option === locale;
        const label =
          option === "en" ? dictionary.language.en : dictionary.language.da;
        return (
          <button
            key={option}
            type="button"
            onClick={() => {
              setLocale(option);
              router.refresh();
            }}
            aria-pressed={active}
            title={label}
            className={`kit-touch-target inline-flex items-center justify-center rounded-[8px] px-3 py-2 text-xs font-medium transition-colors sm:px-2 sm:py-1 ${
              active
                ? "bg-accent text-white"
                : "text-muted hover:bg-accent-soft hover:text-foreground"
            }`}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
