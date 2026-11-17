/** Slide deck model for Dias. */

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
  z: number;
};

export type Slide = {
  id: string;
  background: string;
  blocks: SlideBlock[];
};

export type SlidesDoc = {
  version: 1;
  kind: "dias";
  title: string;
  slides: Slide[];
};

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
    blocks: [defaultTitleBlock(locale), defaultBodyBlock(locale)],
  };
}

export function emptyDeck(
  title = "Untitled",
  locale: "da" | "en" = "en",
): SlidesDoc {
  return {
    version: 1,
    kind: "dias",
    title,
    slides: [emptySlide("#ffffff", locale)],
  };
}

export const THEMES: Array<{ id: string; background: string; title: string; body: string }> = [
  { id: "light", background: "#ffffff", title: "#111111", body: "#333333" },
  { id: "ink", background: "#0f172a", title: "#f8fafc", body: "#cbd5e1" },
  { id: "sand", background: "#f5f0e8", title: "#1c1917", body: "#44403c" },
  { id: "forest", background: "#ecfdf5", title: "#064e3b", body: "#065f46" },
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
