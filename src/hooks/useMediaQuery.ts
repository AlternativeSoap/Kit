"use client";

import { useEffect, useState } from "react";

/** Client media query; starts false to avoid SSR/client mismatch flashes. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

/** Phone / small tablet layout used by search overlays and chrome. */
export function useIsPhoneLayout(): boolean {
  return useMediaQuery("(max-width: 639px)");
}

/** Mouse / trackpad primary pointer (desktop). */
export function useIsFinePointer(): boolean {
  return useMediaQuery("(pointer: fine)");
}
