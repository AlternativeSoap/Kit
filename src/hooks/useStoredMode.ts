"use client";

import { useEffect, useState } from "react";

/** Persist a mode string in localStorage without flashing the wrong default. */
export function useStoredMode<T extends string>(
  key: string,
  fallback: T,
  allowed: readonly T[],
): [T, (next: T) => void] {
  const [mode, setMode] = useState<T>(() => {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw && (allowed as readonly string[]).includes(raw)) return raw as T;
    } catch {
      /* ignore */
    }
    return fallback;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, mode);
    } catch {
      /* ignore */
    }
  }, [key, mode]);

  return [mode, setMode];
}
