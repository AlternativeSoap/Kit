"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDictionary } from "@/i18n/LanguageProvider";
import {
  canvasToBlob,
  compressToTarget,
  cropImage,
  downloadBlob,
  drawToCanvas,
  formatBytes,
  loadImageFromFile,
  rotateImage,
  type ImageFormat,
} from "./canvas";
import { ProgressBar } from "./ProgressBar";

export type ImageToolMode =
  | "crop"
  | "resize"
  | "compress"
  | "convert"
  | "rotate";

type Props = { mode: ImageToolMode };

type ReadyResult = {
  blob: Blob;
  filename: string;
  info: string;
  previewUrl: string;
};

function yieldFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

export function ImageTool({ mode }: Props) {
  const dictionary = useDictionary();
  const t = dictionary.imageTool;
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState<ReadyResult | null>(null);

  const [cropX, setCropX] = useState("0");
  const [cropY, setCropY] = useState("0");
  const [cropW, setCropW] = useState("");
  const [cropH, setCropH] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [quality, setQuality] = useState("0.8");
  const [maxKb, setMaxKb] = useState("200");
  const [format, setFormat] = useState<ImageFormat>("image/jpeg");
  const [degrees, setDegrees] = useState<90 | 180 | 270>(90);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const clearReady = useCallback(() => {
    setReady((prev) => {
      if (prev?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      clearReady();
    };
  }, [clearReady]);

  const onFile = useCallback(
    async (f: File | null) => {
      setError(null);
      clearReady();
      setProgress(0);
      setFile(f);
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      setPreview(null);
      setImg(null);
      if (!f) return;
      try {
        const { img: loaded, objectUrl } = await loadImageFromFile(f);
        setImg(loaded);
        setPreview(objectUrl);
        setCropW(String(loaded.naturalWidth));
        setCropH(String(loaded.naturalHeight));
        setWidth(String(loaded.naturalWidth));
        setHeight(String(loaded.naturalHeight));
        if (f.type === "image/png") setFormat("image/png");
        else if (f.type === "image/webp") setFormat("image/webp");
        else setFormat("image/jpeg");
      } catch {
        setError(t.loadError);
      }
    },
    [clearReady, preview, t.loadError],
  );

  const aspect = useMemo(() => {
    if (!img || !img.naturalHeight) return 1;
    return img.naturalWidth / img.naturalHeight;
  }, [img]);

  const exportName = (ext: string) => {
    const base = (file?.name ?? "image").replace(/\.[^.]+$/, "");
    return `${base}-${mode}.${ext}`;
  };

  const extFor = (fmt: ImageFormat) =>
    fmt === "image/png" ? "png" : fmt === "image/webp" ? "webp" : "jpg";

  function markSettingsChanged() {
    clearReady();
    setProgress(0);
  }

  async function run() {
    if (!img) return;
    setBusy(true);
    setError(null);
    clearReady();
    setProgress(4);
    try {
      await yieldFrame();
      let canvas: HTMLCanvasElement;
      let outFormat: ImageFormat = format;
      let q = Number(quality);
      let blob: Blob;
      let infoExtra = "";

      if (mode === "crop") {
        const x = Number(cropX);
        const y = Number(cropY);
        const w = Number(cropW);
        const h = Number(cropH);
        if (
          ![x, y, w, h].every((n) => Number.isFinite(n) && n >= 0) ||
          w < 1 ||
          h < 1
        ) {
          setError(t.invalid);
          return;
        }
        setProgress(30);
        await yieldFrame();
        canvas = cropImage(img, { x, y, w, h });
        outFormat = "image/png";
        setProgress(70);
        blob = await canvasToBlob(canvas, outFormat);
      } else if (mode === "resize") {
        let w = Number(width);
        let h = Number(height);
        if (keepAspect && Number.isFinite(w) && w > 0) h = Math.round(w / aspect);
        else if (keepAspect && Number.isFinite(h) && h > 0)
          w = Math.round(h * aspect);
        if (!(w > 0) || !(h > 0)) {
          setError(t.invalid);
          return;
        }
        setProgress(35);
        await yieldFrame();
        canvas = drawToCanvas(img, w, h);
        outFormat = format;
        setProgress(70);
        blob = await canvasToBlob(
          canvas,
          outFormat,
          outFormat === "image/png" ? undefined : q,
        );
      } else if (mode === "compress") {
        const maxBytes = Math.max(1, Number(maxKb) || 200) * 1024;
        const outType = format === "image/png" ? "image/jpeg" : format;
        const { blob: compressed, quality: usedQ } = await compressToTarget(
          img,
          outType,
          maxBytes,
          (ratio) => setProgress(Math.round(ratio * 100)),
        );
        blob = compressed;
        outFormat = outType;
        infoExtra = ` (${t.quality} ${usedQ.toFixed(2)})`;
      } else if (mode === "convert") {
        setProgress(35);
        await yieldFrame();
        canvas = drawToCanvas(img, img.naturalWidth, img.naturalHeight);
        outFormat = format;
        q = format === "image/png" ? 1 : Number(quality) || 0.92;
        setProgress(70);
        blob = await canvasToBlob(
          canvas,
          outFormat,
          outFormat === "image/png" ? undefined : q,
        );
      } else {
        setProgress(35);
        await yieldFrame();
        canvas = rotateImage(img, degrees, flipH, flipV);
        outFormat = "image/png";
        setProgress(70);
        blob = await canvasToBlob(canvas, outFormat);
      }

      setProgress(100);
      const filename = exportName(extFor(outFormat));
      const previewUrl = URL.createObjectURL(blob);
      setPreview(previewUrl);
      setReady({
        blob,
        filename,
        previewUrl,
        info: `${formatBytes(file?.size ?? 0)} → ${formatBytes(blob.size)}${infoExtra}`,
      });
    } catch {
      setError(t.processError);
      setProgress(0);
    } finally {
      setBusy(false);
    }
  }

  function downloadReady() {
    if (!ready) return;
    downloadBlob(ready.blob, ready.filename);
  }

  const primaryLabel = busy
    ? t.working
    : ready
      ? t.download
      : t.process;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <p className="text-sm text-muted">{t.localNote}</p>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            {t.pickImage}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.heic,.heif"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-background"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {img ? (
          <p className="text-xs text-muted">
            {img.naturalWidth}×{img.naturalHeight}
            {file ? ` · ${formatBytes(file.size)}` : ""}
          </p>
        ) : null}

        {mode === "crop" ? (
          <div className="grid grid-cols-2 gap-3">
            <Num
              label={t.x}
              value={cropX}
              onChange={(v) => {
                setCropX(v);
                markSettingsChanged();
              }}
            />
            <Num
              label={t.y}
              value={cropY}
              onChange={(v) => {
                setCropY(v);
                markSettingsChanged();
              }}
            />
            <Num
              label={t.width}
              value={cropW}
              onChange={(v) => {
                setCropW(v);
                markSettingsChanged();
              }}
            />
            <Num
              label={t.height}
              value={cropH}
              onChange={(v) => {
                setCropH(v);
                markSettingsChanged();
              }}
            />
          </div>
        ) : null}

        {mode === "resize" ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Num
                label={t.width}
                value={width}
                onChange={(v) => {
                  setWidth(v);
                  if (keepAspect && Number(v) > 0) {
                    setHeight(String(Math.round(Number(v) / aspect)));
                  }
                  markSettingsChanged();
                }}
              />
              <Num
                label={t.height}
                value={height}
                onChange={(v) => {
                  setHeight(v);
                  if (keepAspect && Number(v) > 0) {
                    setWidth(String(Math.round(Number(v) * aspect)));
                  }
                  markSettingsChanged();
                }}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={keepAspect}
                onChange={(e) => {
                  setKeepAspect(e.target.checked);
                  markSettingsChanged();
                }}
              />
              {t.keepAspect}
            </label>
            <FormatSelect
              value={format}
              onChange={(v) => {
                setFormat(v);
                markSettingsChanged();
              }}
              labels={t}
            />
          </div>
        ) : null}

        {mode === "compress" ? (
          <div className="space-y-3">
            <Num
              label={t.maxKb}
              value={maxKb}
              onChange={(v) => {
                setMaxKb(v);
                markSettingsChanged();
              }}
            />
            <FormatSelect
              value={format === "image/png" ? "image/jpeg" : format}
              onChange={(v) => {
                setFormat(v);
                markSettingsChanged();
              }}
              labels={t}
              hidePng
            />
          </div>
        ) : null}

        {mode === "convert" ? (
          <div className="space-y-3">
            <FormatSelect
              value={format}
              onChange={(v) => {
                setFormat(v);
                markSettingsChanged();
              }}
              labels={t}
            />
            {format !== "image/png" ? (
              <Num
                label={t.quality}
                value={quality}
                onChange={(v) => {
                  setQuality(v);
                  markSettingsChanged();
                }}
              />
            ) : null}
          </div>
        ) : null}

        {mode === "rotate" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {([90, 180, 270] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    degrees === d
                      ? "border-foreground bg-foreground text-background"
                      : "border-border"
                  }`}
                  onClick={() => {
                    setDegrees(d);
                    markSettingsChanged();
                  }}
                >
                  {d}°
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={flipH}
                onChange={(e) => {
                  setFlipH(e.target.checked);
                  markSettingsChanged();
                }}
              />
              {t.flipH}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={flipV}
                onChange={(e) => {
                  setFlipV(e.target.checked);
                  markSettingsChanged();
                }}
              />
              {t.flipV}
            </label>
          </div>
        ) : null}

        {busy || (progress > 0 && !ready) ? (
          <ProgressBar value={progress} label={t.progress} />
        ) : null}

        {ready ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">{ready.info}</p>
            <p className="text-sm font-medium text-foreground">{t.ready}</p>
            <button
              type="button"
              onClick={downloadReady}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              {t.download}
            </button>
            <button
              type="button"
              disabled={!img || busy}
              onClick={() => void run()}
              className="ml-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground"
            >
              {t.processAgain}
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!img || busy}
            onClick={() => void run()}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40"
          >
            {primaryLabel}
          </button>
        )}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {mode === "convert" || mode === "compress" ? (
          <p className="text-xs text-muted">{t.heicNote}</p>
        ) : null}
      </div>

      <div className="min-h-48 overflow-hidden rounded-lg border border-border bg-black/5 p-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="mx-auto max-h-[28rem] max-w-full object-contain"
          />
        ) : (
          <p className="flex h-48 items-center justify-center text-sm text-muted">
            {t.previewEmpty}
          </p>
        )}
      </div>
    </div>
  );
}

function Num({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}

function FormatSelect({
  value,
  onChange,
  labels,
  hidePng,
}: {
  value: ImageFormat;
  onChange: (v: ImageFormat) => void;
  labels: { png: string; jpeg: string; webp: string; format: string };
  hidePng?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {labels.format}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ImageFormat)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      >
        {hidePng ? null : <option value="image/png">{labels.png}</option>}
        <option value="image/jpeg">{labels.jpeg}</option>
        <option value="image/webp">{labels.webp}</option>
      </select>
    </label>
  );
}
