/** Rich text statistics for Kit Papers (Skriv and related). */

export type DocStats = {
  /** Characters including spaces (normal count). */
  chars: number;
  /** Characters excluding all whitespace. */
  charsNoSpace: number;
  /** Spaces only (space + nbsp-like after decode). */
  spaces: number;
  /**
   * “Anslag” / keystrokes: letters, digits, and punctuation.
   * Spaces and line breaks are not counted (common Danish school/office rule).
   */
  keystrokes: number;
  /** Anslag including spaces (alternate office rule). */
  keystrokesWithSpaces: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
  readingMinutes: number;
};

export function htmlToVisibleText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|tr|table|blockquote)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

export function computeDocStats(html: string): DocStats {
  const text = htmlToVisibleText(html);
  const chars = text.length;
  const spaces = (text.match(/[ \t\u00a0]/g) ?? []).length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  // Anslag uden mellemrum: non-whitespace characters.
  const keystrokes = charsNoSpace;
  // Anslag med mellemrum: non-control printable run (exclude bare newlines).
  const keystrokesWithSpaces = text.replace(/[\n\r]/g, "").length;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const lines = text.length === 0 ? 0 : text.split("\n").length;
  const sentences = trimmed
    ? (trimmed.match(/[^.!?…]+(?:[.!?…]+|$)/g) ?? []).filter((s) => /\S/.test(s))
        .length
    : 0;
  const paragraphs = trimmed
    ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length
    : trimmed
      ? 1
      : 0;
  const readingMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));
  return {
    chars,
    charsNoSpace,
    spaces,
    keystrokes,
    keystrokesWithSpaces,
    words,
    lines,
    sentences,
    paragraphs,
    readingMinutes,
  };
}
