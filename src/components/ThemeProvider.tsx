"use client";

import { useEffect } from "react";
import {
  THEME_EVENT,
  THEME_STORAGE_KEY,
  applyResolvedTheme,
  getStoredTheme,
  isThemePreference,
  resolveTheme,
  type ThemePreference,
} from "@/lib/theme";

/**
 * Keeps data-theme in sync with stored preference and OS changes.
 * The blocking script in layout.tsx applies the first paint; this covers updates.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const sync = (preference?: ThemePreference) => {
      const pref = preference ?? getStoredTheme();
      applyResolvedTheme(resolveTheme(pref));
    };

    sync();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMedia = () => {
      if (getStoredTheme() === "system") sync("system");
    };
    media.addEventListener("change", onMedia);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      sync(isThemePreference(event.newValue) ? event.newValue : "system");
    };
    window.addEventListener("storage", onStorage);

    const onTheme = (event: Event) => {
      const detail = (event as CustomEvent<{ preference?: ThemePreference }>)
        .detail;
      sync(detail?.preference);
    };
    window.addEventListener(THEME_EVENT, onTheme);

    return () => {
      media.removeEventListener("change", onMedia);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(THEME_EVENT, onTheme);
    };
  }, []);

  return children;
}
