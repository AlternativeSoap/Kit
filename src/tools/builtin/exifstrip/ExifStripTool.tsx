"use client";

import { useState } from "react";
import {
  ErrorBanner,
  Field,
  FileInput,
  KitSelect,
  primaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { downloadBlob } from "../media/canvas";

type OutFormat = "image/jpeg" | "image/png";

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image"));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ExifStripTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [format, setFormat] = useState<OutFormat>("image/jpeg");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("image-clean.jpg");

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const img = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.drawImage(img, 0, 0);
      const mime = format;
      const dataUrl = canvas.toDataURL(mime, mime === "image/jpeg" ? 0.92 : undefined);
      setPreview(dataUrl);
      const base = file.name.replace(/\.[^.]+$/, "") || "image";
      setFileName(`${base}-clean.${mime === "image/png" ? "png" : "jpg"}`);
    } catch {
      setError(
        da
          ? "Billedet kunne ikke indlæses. Prøv JPEG, PNG eller WebP."
          : "Could not load the image. Try JPEG, PNG, or WebP.",
      );
      setPreview(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <p className="text-sm text-muted">
        {da
          ? "Genindlæser billedet uden EXIF/GPS-metadata. Behandles kun i din browser."
          : "Re-encodes the image without EXIF/GPS metadata. Processed only in your browser."}
      </p>
      <Field label={da ? "Outputformat" : "Output format"}>
        <KitSelect
          value={format}
          onChange={(e) => setFormat(e.target.value as OutFormat)}
        >
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG</option>
        </KitSelect>
      </Field>
      <FileInput
        label={da ? "Vælg billede" : "Choose image"}
        accept="image/*"
        onFile={(f) => void onFile(f)}
      />
      <ErrorBanner>{error}</ErrorBanner>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="max-h-80 w-full rounded-[12px] border border-border object-contain bg-surface"
        />
      ) : null}
      <button
        type="button"
        className={primaryBtnClass}
        disabled={!preview || busy}
        onClick={async () => {
          if (!preview) return;
          const res = await fetch(preview);
          const blob = await res.blob();
          downloadBlob(blob, fileName);
        }}
      >
        {busy
          ? da
            ? "Arbejder…"
            : "Working…"
          : da
            ? "Download uden metadata"
            : "Download without metadata"}
      </button>
    </div>
  );
}
