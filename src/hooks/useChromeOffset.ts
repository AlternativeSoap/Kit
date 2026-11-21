"use client";

import { useEffect, type RefObject } from "react";

const OFFSET_VAR = "--kit-chrome-offset";
const HEIGHT_VAR = "--kit-chrome-height";

/**
 * Measures the sticky tool header and publishes CSS variables for overlays.
 * `--kit-chrome-offset` is the distance from the viewport top to the header bottom
 * (includes safe-area padding). Prefer this for fixed search panel `top`.
 */
export function useChromeOffset(
  headerRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const root = document.documentElement;

    const publish = () => {
      const rect = header.getBoundingClientRect();
      // Distance from viewport top to header bottom (includes safe-area padding).
      const offset = Math.max(0, Math.round(rect.bottom));
      const padTop = Number.parseFloat(getComputedStyle(header).paddingTop) || 0;
      const contentHeight = Math.max(0, Math.round(rect.height - padTop));

      root.style.setProperty(OFFSET_VAR, `${offset}px`);
      root.style.setProperty(HEIGHT_VAR, `${contentHeight || 60}px`);
    };

    const observer = new ResizeObserver(publish);
    observer.observe(header);
    window.addEventListener("resize", publish);
    window.visualViewport?.addEventListener("resize", publish);
    publish();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", publish);
      window.visualViewport?.removeEventListener("resize", publish);
    };
  }, [headerRef]);
}
