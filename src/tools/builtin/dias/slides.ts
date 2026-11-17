/** Slide deck model for Dias. */

import type {
  BlockEntrance,
  ImageFit,
  SlideTransition,
} from "./transitions";

export type BlockKind = "title" | "body" | "image" | "shape";

export type SlideBlock = {
  id: string;
  kind: BlockKind;
  x: number; // 0–100 (% of slide)
  y: number;
  w: number;
  h: number;
  text?: string;
  fontFamily: string;
  fontSize: number; // px at 960-wide reference
  color: string;
  align: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fill?: string;
  imageDataUrl?: string;
  /** How an image fills its box. */
  imageFit?: ImageFit;
  /** Entrance animation when the slide plays. */
  entrance?: BlockEntrance;
  z: number;
};

export type Slide = {
  id: string;
  background: string;
  blocks: SlideBlock[];
  /** Transition used when this slide becomes active in Play. */
  transition?: SlideTransition;
};

export type SlidesDoc = {
  version: 1 | 2;
  kind: "dias";
  title: string;
  slides: Slide[];
};

export type { BlockEntrance, ImageFit, SlideTransition };

export const SLIDE_W = 960;
export const SLIDE_H = 540;

let seq = 0;
export function nextBlockId() {
  seq += 1;
  return `b-${Date.now().toString(36)}-${seq}`;
}

export function nextSlideId() {
  seq += 1;
  return `s-${Date.now().toString(36)}-${seq}`;
}

/** PowerPoint-like Calibri defaults on a 16:9 title slide. */
export function defaultTitleBlock(locale: "da" | "en" = "en"): SlideBlock {
  return {
    id: nextBlockId(),
    kind: "title",
    x: 8,
    y: 32,
    w: 84,
    h: 16,
    text: locale === "da" ? "Klik for at tilføje titel" : "Click to add title",
    fontFamily: "Calibri, 'Segoe UI', system-ui, sans-serif",
    fontSize: 44,
    color: "#1a1a1a",
    align: "center",
    entrance: "slideUp",
    z: 1,
  };
}

export function defaultBodyBlock(locale: "da" | "en" = "en"): SlideBlock {
  return {
    id: nextBlockId(),
    kind: "body",
    x: 14,
    y: 52,
    w: 72,
    h: 20,
    text:
      locale === "da" ? "Klik for at tilføje tekst" : "Click to add subtitle",
    fontFamily: "Calibri, 'Segoe UI', system-ui, sans-serif",
    fontSize: 24,
    color: "#404040",
    align: "center",
    entrance: "fade",
    z: 2,
  };
}

export function emptySlide(
  background = "#ffffff",
  locale: "da" | "en" = "en",
): Slide {
  return {
    id: nextSlideId(),
    background,
    transition: "fade",
    blocks: [defaultTitleBlock(locale), defaultBodyBlock(locale)],
  };
}

export function emptyDeck(
  title = "Untitled",
  locale: "da" | "en" = "en",
): SlidesDoc {
  return {
    version: 2,
    kind: "dias",
    title,
    slides: [emptySlide("#ffffff", locale)],
  };
}

/** Stretch an image block to cover the full slide. */
export function fitImageToSlide(block: SlideBlock): SlideBlock {
  return {
    ...block,
    x: 0,
    y: 0,
    w: 100,
    h: 100,
    imageFit: "cover",
    z: 0,
  };
}

export const THEMES: Array<{ id: string; background: string; title: string; body: string }> = [
  { id: "light", background: "#ffffff", title: "#111111", body: "#333333" },
  { id: "ink", background: "#0f172a", title: "#f8fafc", body: "#cbd5e1" },
  { id: "sand", background: "#f5f0e8", title: "#1c1917", body: "#44403c" },
  { id: "forest", background: "#ecfdf5", title: "#064e3b", body: "#065f46" },
  { id: "ocean", background: "#e0f2fe", title: "#0c4a6e", body: "#075985" },
  { id: "slate", background: "#f8fafc", title: "#0f172a", body: "#334155" },
  { id: "rose", background: "#fff1f2", title: "#881337", body: "#9f1239" },
  { id: "midnight", background: "#111827", title: "#f9fafb", body: "#d1d5db" },
];

export function applyTheme(slide: Slide, themeId: string): Slide {
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0]!;
  return {
    ...slide,
    background: theme.background,
    blocks: slide.blocks.map((b) => {
      if (b.kind === "title") return { ...b, color: theme.title };
      if (b.kind === "body") return { ...b, color: theme.body };
      return b;
    }),
  };
}
