/** Shared font stacks for Skriv, Ark, and Dias. */

export type PaperFont = {
  id: string;
  label: string;
  keywords?: string[];
};

/** Common desktop + web fonts with CSS fallback stacks. */
export const PAPER_FONTS: PaperFont[] = [
  { id: "Calibri, 'Segoe UI', system-ui, sans-serif", label: "Calibri", keywords: ["segoe"] },
  { id: "Cambria, Georgia, serif", label: "Cambria" },
  { id: "Candara, Calibri, sans-serif", label: "Candara" },
  { id: "Corbel, Calibri, sans-serif", label: "Corbel" },
  { id: "Constantia, Georgia, serif", label: "Constantia" },
  { id: "'Segoe UI', system-ui, sans-serif", label: "Segoe UI", keywords: ["segoe ui"] },
  { id: "Arial, Helvetica, sans-serif", label: "Arial" },
  { id: "'Helvetica Neue', Helvetica, Arial, sans-serif", label: "Helvetica" },
  { id: "Verdana, Geneva, sans-serif", label: "Verdana" },
  { id: "Tahoma, Verdana, sans-serif", label: "Tahoma" },
  { id: "'Trebuchet MS', 'Segoe UI', sans-serif", label: "Trebuchet MS", keywords: ["trebuchet"] },
  { id: "'Franklin Gothic Medium', Arial, sans-serif", label: "Franklin Gothic" },
  { id: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif", label: "Gill Sans" },
  { id: "Futura, 'Trebuchet MS', Arial, sans-serif", label: "Futura" },
  { id: "Optima, Candara, sans-serif", label: "Optima" },
  { id: "Avenir, 'Avenir Next', system-ui, sans-serif", label: "Avenir" },
  { id: "system-ui, sans-serif", label: "System Sans", keywords: ["sans", "system"] },
  { id: "Georgia, 'Times New Roman', serif", label: "Georgia" },
  { id: "'Times New Roman', Times, serif", label: "Times New Roman", keywords: ["times"] },
  { id: "Garamond, Georgia, serif", label: "Garamond" },
  { id: "Palatino, 'Palatino Linotype', Georgia, serif", label: "Palatino" },
  { id: "'Book Antiqua', Palatino, serif", label: "Book Antiqua" },
  { id: "ui-monospace, 'Cascadia Code', Consolas, monospace", label: "Mono", keywords: ["monospace", "code"] },
  { id: "Consolas, 'Courier New', monospace", label: "Consolas" },
  { id: "'Courier New', Courier, monospace", label: "Courier New", keywords: ["courier"] },
  { id: "Menlo, Monaco, Consolas, monospace", label: "Menlo" },
  { id: "'Lucida Console', Monaco, monospace", label: "Lucida Console" },
  { id: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif", label: "Lucida Sans" },
  { id: "Impact, Haettenschweiler, sans-serif", label: "Impact" },
  { id: "'Comic Sans MS', 'Segoe Print', cursive", label: "Comic Sans MS", keywords: ["comic"] },
  { id: "Inter, system-ui, sans-serif", label: "Inter" },
  { id: "Roboto, Arial, sans-serif", label: "Roboto" },
  { id: "'Open Sans', Arial, sans-serif", label: "Open Sans" },
  { id: "Lato, Arial, sans-serif", label: "Lato" },
  { id: "Montserrat, Arial, sans-serif", label: "Montserrat" },
  { id: "Poppins, Arial, sans-serif", label: "Poppins" },
  { id: "Nunito, Arial, sans-serif", label: "Nunito" },
  { id: "Merriweather, Georgia, serif", label: "Merriweather" },
  { id: "'Playfair Display', Georgia, serif", label: "Playfair Display", keywords: ["playfair"] },
  { id: "'Source Sans 3', Arial, sans-serif", label: "Source Sans", keywords: ["source sans"] },
  { id: "'Source Serif 4', Georgia, serif", label: "Source Serif", keywords: ["source serif"] },
  { id: "'IBM Plex Sans', 'Segoe UI', sans-serif", label: "IBM Plex Sans" },
  { id: "'IBM Plex Serif', Georgia, serif", label: "IBM Plex Serif" },
  { id: "'IBM Plex Mono', Consolas, monospace", label: "IBM Plex Mono" },
];

function firstFace(fontFamily: string) {
  return fontFamily.split(",")[0]?.replace(/['"]/g, "").trim() ?? fontFamily.trim();
}

/** Friendly label for the current CSS stack. */
export function displayFontLabel(fontFamily: string) {
  const exact = PAPER_FONTS.find((f) => f.id === fontFamily);
  if (exact) return exact.label;
  const face = firstFace(fontFamily).toLowerCase();
  const fuzzy = PAPER_FONTS.find(
    (f) =>
      f.label.toLowerCase() === face ||
      firstFace(f.id).toLowerCase() === face ||
      f.keywords?.some((k) => k === face),
  );
  return fuzzy?.label ?? firstFace(fontFamily);
}

/** Resolve typed search text or a stack into a CSS font-family value. */
export function resolveFontFamily(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return PAPER_FONTS[0]!.id;

  const lower = trimmed.toLowerCase();
  const exactId = PAPER_FONTS.find((f) => f.id.toLowerCase() === lower);
  if (exactId) return exactId.id;

  const exactLabel = PAPER_FONTS.find((f) => f.label.toLowerCase() === lower);
  if (exactLabel) return exactLabel.id;

  const keyword = PAPER_FONTS.find((f) => f.keywords?.some((k) => k === lower));
  if (keyword) return keyword.id;

  const starts = PAPER_FONTS.filter(
    (f) =>
      f.label.toLowerCase().startsWith(lower) ||
      firstFace(f.id).toLowerCase().startsWith(lower),
  );
  if (starts.length === 1) return starts[0]!.id;

  const includes = PAPER_FONTS.filter(
    (f) =>
      f.label.toLowerCase().includes(lower) ||
      f.keywords?.some((k) => k.includes(lower)) ||
      firstFace(f.id).toLowerCase().includes(lower),
  );
  if (includes.length === 1) return includes[0]!.id;

  if (trimmed.includes(",")) return trimmed;

  const face = firstFace(trimmed);
  const needsQuotes = /\s/.test(face);
  const quoted = needsQuotes ? `'${face.replace(/'/g, "")}'` : face;
  return `${quoted}, sans-serif`;
}
