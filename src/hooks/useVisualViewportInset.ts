"use client";

import { useEffect } from "react";

const KEYBOARD_VAR = "--kit-keyboard-inset";

/**
 * Publishes the on-screen keyboard inset as a CSS variable while active.
 * Used so fixed search panels shrink above the keyboard on iOS/Android.
 */
export function useVisualViewportInset(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const root = document.documentElement;
    const viewport = window.visualViewport;

    const update = () => {
      if (!viewport) {
        root.style.setProperty(KEYBOARD_VAR, "0px");
        return;
      }
      const inset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      root.style.setProperty(KEYBOARD_VAR, `${Math.round(inset)}px`);
    };

    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      root.style.setProperty(KEYBOARD_VAR, "0px");
    };
  }, [active]);
}
