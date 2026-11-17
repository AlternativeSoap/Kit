/** Document model helpers for Skriv. */

import { computeDocStats, htmlToVisibleText, type DocStats } from "@/lib/papers/stats";

export type PageSize =
  | "a3"
  | "a4"
  | "a5"
  | "letter"
  | "legal"
  | "square";

export type SkrivTextBox = {
  id: string;
  /** Position as % of page width/height */
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  fontFamily: string;
  fontSizePx: number;
  color: string;
  background: string;
  align: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  z: number;
};

export type SkrivDoc = {
  version: 1 | 2;
  kind: "skriv";
  title: string;
  html: string;
  pageSize: PageSize;
  marginMm: number;
  fontFamily: string;
  fontSizePx: number;
  lineHeight: number;
  /** Spellcheck dictionary language (may differ from UI locale). */
  dictLang?: string;
  /** Freely positioned text boxes on the page. */
  boxes?: SkrivTextBox[];
};

const PAGE_MM: Record<PageSize, { w: number; h: number; label: string }> = {
  a3: { w: 297, h: 420, label: "A3" },
  a4: { w: 210, h: 297, label: "A4" },
  a5: { w: 148, h: 210, label: "A5" },
  letter: { w: 215.9, h: 279.4, label: "Letter" },
  legal: { w: 215.9, h: 355.6, label: "Legal" },
  square: { w: 210, h: 210, label: "Square" },
};

export const PAGE_SIZES: PageSize[] = [
  "a5",
  "a4",
  "a3",
  "letter",
  "legal",
  "square",
];

export function pageSizeLabel(size: PageSize): string {
  const p = PAGE_MM[size];
  return `${p.label} · ${Math.round(p.w)} × ${Math.round(p.h)} mm`;
}

/** Word-like defaults: A4 + serif for Danish, Letter + Calibri-like for English. */
export function emptyDoc(
  title = "Untitled",
  locale: "da" | "en" = "en",
): SkrivDoc {
  const da = locale === "da";
  return {
    version: 2,
    kind: "skriv",
    title,
    html: da
      ? "<h1>Titel</h1><p>Begynd at skrive her.</p>"
      : "<h1>Title</h1><p>Start writing here.</p>",
    pageSize: da ? "a4" : "letter",
    marginMm: 20,
    fontFamily: da
      ? "Georgia, 'Times New Roman', serif"
      : "Calibri, 'Segoe UI', system-ui, sans-serif",
    fontSizePx: 12,
    lineHeight: 1.15,
    dictLang: locale,
    boxes: [],
  };
}

export function countWords(html: string): DocStats {
  return computeDocStats(html);
}

export function pageWidthMm(size: PageSize): number {
  return PAGE_MM[size].w;
}

export function pageHeightMm(size: PageSize): number {
  return PAGE_MM[size].h;
}

/** Max preview width so one page fits; larger formats scale down more. */
export function pagePreviewMaxWidthPx(size: PageSize): number {
  switch (size) {
    case "a5":
      return 520;
    case "a4":
      return 680;
    case "letter":
      return 700;
    case "legal":
      return 640;
    case "a3":
      return 760;
    case "square":
      return 560;
  }
}

export function nextBoxId() {
  return `tb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function defaultTextBox(
  locale: "da" | "en",
  fontFamily: string,
): SkrivTextBox {
  return {
    id: nextBoxId(),
    x: 18,
    y: 28,
    w: 40,
    h: 16,
    text: locale === "da" ? "Flytbar tekst" : "Movable text",
    fontFamily,
    fontSizePx: 14,
    color: "#111111",
    background: "#ffffff",
    align: "left",
    z: 1,
  };
}

/** Very small HTML → plain text for .txt export. */
export function htmlToPlainText(html: string): string {
  return htmlToVisibleText(html).trim();
}
