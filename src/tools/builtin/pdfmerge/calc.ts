import { PDFDocument } from "pdf-lib";

export type PdfMergeErrorKind = "encrypted" | "invalid" | "empty" | "unknown";

export type PdfMergeError = {
  kind: PdfMergeErrorKind;
  message: string;
  fileName?: string;
};

export type PdfMergeResult =
  | { ok: true; bytes: Uint8Array; pageCount: number }
  | { ok: false; error: PdfMergeError };

function classifyError(error: unknown, fileName?: string): PdfMergeError {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  if (
    lower.includes("encrypted") ||
    lower.includes("password") ||
    lower.includes("is encrypted")
  ) {
    return {
      kind: "encrypted",
      message,
      fileName,
    };
  }
  if (
    lower.includes("invalid") ||
    lower.includes("failed to parse") ||
    lower.includes("not a pdf") ||
    lower.includes("end of buffer") ||
    lower.includes("expected")
  ) {
    return {
      kind: "invalid",
      message,
      fileName,
    };
  }
  return { kind: "unknown", message, fileName };
}

export async function loadPdfBytes(
  bytes: ArrayBuffer | Uint8Array,
  fileName?: string,
): Promise<{ ok: true; doc: PDFDocument; pageCount: number } | { ok: false; error: PdfMergeError }> {
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: false });
    if (doc.isEncrypted) {
      return {
        ok: false,
        error: {
          kind: "encrypted",
          message: "PDF is encrypted",
          fileName,
        },
      };
    }
    return { ok: true, doc, pageCount: doc.getPageCount() };
  } catch (error) {
    return { ok: false, error: classifyError(error, fileName) };
  }
}

export async function mergePdfFiles(
  files: ReadonlyArray<{ name: string; bytes: ArrayBuffer }>,
): Promise<PdfMergeResult> {
  if (files.length === 0) {
    return { ok: false, error: { kind: "empty", message: "No files" } };
  }

  try {
    const merged = await PDFDocument.create();
    let totalPages = 0;

    for (const file of files) {
      const loaded = await loadPdfBytes(file.bytes, file.name);
      if (!loaded.ok) return loaded;

      const pageIndices = loaded.doc.getPageIndices();
      const copied = await merged.copyPages(loaded.doc, pageIndices);
      for (const page of copied) {
        merged.addPage(page);
      }
      totalPages += copied.length;
    }

    const bytes = await merged.save();
    return { ok: true, bytes, pageCount: totalPages };
  } catch (error) {
    return { ok: false, error: classifyError(error) };
  }
}

export function downloadBytes(bytes: Uint8Array, fileName: string, mime = "application/pdf") {
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
