import { PDFDocument } from "pdf-lib";

export type PdfSplitErrorKind =
  | "encrypted"
  | "invalid"
  | "empty"
  | "range"
  | "unknown";

export type PdfSplitError = {
  kind: PdfSplitErrorKind;
  message: string;
};

export type PageRangeResult =
  | { ok: true; pages: number[] }
  | { ok: false; error: PdfSplitError };

function classifyError(error: unknown): PdfSplitError {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  if (
    lower.includes("encrypted") ||
    lower.includes("password") ||
    lower.includes("is encrypted")
  ) {
    return { kind: "encrypted", message };
  }
  if (
    lower.includes("invalid") ||
    lower.includes("failed to parse") ||
    lower.includes("not a pdf") ||
    lower.includes("end of buffer")
  ) {
    return { kind: "invalid", message };
  }
  return { kind: "unknown", message };
}

/**
 * Parse ranges like "1-3,5,8-10" into 1-based page numbers (unique, sorted).
 */
export function parsePageRanges(
  spec: string,
  pageCount: number,
): PageRangeResult {
  const trimmed = spec.trim();
  if (!trimmed) {
    return { ok: false, error: { kind: "empty", message: "No range" } };
  }
  if (pageCount < 1) {
    return {
      ok: false,
      error: { kind: "invalid", message: "PDF has no pages" },
    };
  }

  const pages = new Set<number>();
  const parts = trimmed.split(/[,;\s]+/).filter(Boolean);

  for (const part of parts) {
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(part);
    if (range) {
      let from = Number(range[1]);
      let to = Number(range[2]);
      if (!Number.isInteger(from) || !Number.isInteger(to)) {
        return {
          ok: false,
          error: {
            kind: "range",
            message: `Invalid range "${part}"`,
          },
        };
      }
      if (from > to) {
        const swap = from;
        from = to;
        to = swap;
      }
      if (from < 1 || to > pageCount) {
        return {
          ok: false,
          error: {
            kind: "range",
            message: `Range "${part}" is outside 1–${pageCount}`,
          },
        };
      }
      for (let page = from; page <= to; page += 1) {
        pages.add(page);
      }
      continue;
    }

    const single = /^(\d+)$/.exec(part);
    if (single) {
      const page = Number(single[1]);
      if (!Number.isInteger(page) || page < 1 || page > pageCount) {
        return {
          ok: false,
          error: {
            kind: "range",
            message: `Page ${part} is outside 1–${pageCount}`,
          },
        };
      }
      pages.add(page);
      continue;
    }

    return {
      ok: false,
      error: {
        kind: "range",
        message: `Could not parse "${part}"`,
      },
    };
  }

  if (pages.size === 0) {
    return { ok: false, error: { kind: "empty", message: "No pages" } };
  }

  return { ok: true, pages: [...pages].sort((a, b) => a - b) };
}

export async function loadPdf(
  bytes: ArrayBuffer | Uint8Array,
): Promise<
  | { ok: true; doc: PDFDocument; pageCount: number }
  | { ok: false; error: PdfSplitError }
> {
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: false });
    if (doc.isEncrypted) {
      return {
        ok: false,
        error: { kind: "encrypted", message: "PDF is encrypted" },
      };
    }
    return { ok: true, doc, pageCount: doc.getPageCount() };
  } catch (error) {
    return { ok: false, error: classifyError(error) };
  }
}

/** Extract 1-based pages into a new PDF. */
export async function extractPagesToPdf(
  source: PDFDocument,
  pages1Based: readonly number[],
): Promise<{ ok: true; bytes: Uint8Array } | { ok: false; error: PdfSplitError }> {
  try {
    const out = await PDFDocument.create();
    const zeroBased = pages1Based.map((page) => page - 1);
    const copied = await out.copyPages(source, zeroBased);
    for (const page of copied) {
      out.addPage(page);
    }
    const bytes = await out.save();
    return { ok: true, bytes };
  } catch (error) {
    return { ok: false, error: classifyError(error) };
  }
}

export async function extractEachPage(
  source: PDFDocument,
): Promise<
  | { ok: true; files: { name: string; bytes: Uint8Array }[] }
  | { ok: false; error: PdfSplitError }
> {
  try {
    const count = source.getPageCount();
    const files: { name: string; bytes: Uint8Array }[] = [];
    for (let page = 1; page <= count; page += 1) {
      const result = await extractPagesToPdf(source, [page]);
      if (!result.ok) return result;
      const padded = String(page).padStart(String(count).length, "0");
      files.push({ name: `page-${padded}.pdf`, bytes: result.bytes });
    }
    return { ok: true, files };
  } catch (error) {
    return { ok: false, error: classifyError(error) };
  }
}

export function downloadBytes(
  bytes: Uint8Array,
  fileName: string,
  mime = "application/pdf",
) {
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadSequentially(
  files: ReadonlyArray<{ name: string; bytes: Uint8Array }>,
  delayMs = 250,
) {
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i]!;
    downloadBytes(file.bytes, file.name);
    if (i < files.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
