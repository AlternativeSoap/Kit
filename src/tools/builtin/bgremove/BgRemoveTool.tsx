"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ErrorBanner,
  Field,
  Segmented,
  fileInputClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { CdnLoadError, importFromUrl } from "@/lib/cdnImport";
import { useDictionary } from "@/i18n/LanguageProvider";
import { downloadBlob, formatBytes, loadImageFromFile } from "../media/canvas";
import { ProgressBar } from "../media/ProgressBar";

type PreviewBg = "checker" | "white" | "black";

const PACKAGE = "@imgly/background-removal@1.7.0";
const PACKAGE_ESM = `https://cdn.jsdelivr.net/npm/${PACKAGE}/+esm`;
const PUBLIC_PATH =
  "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";

/** Start large, then retry smaller if the model runs out of memory. */
const MAX_EDGES = [2048, 1600, 1280, 1024] as const;

const BG_STYLES: Record<PreviewBg, CSSProperties> = {
  checker: {
    backgroundColor: "#ffffff",
    backgroundImage:
      "linear-gradient(45deg,#e5e5e5 25%,transparent 25%,transparent 75%,#e5e5e5 75%),linear-gradient(45deg,#e5e5e5 25%,transparent 25%,transparent 75%,#e5e5e5 75%)",
    backgroundSize: "16px 16px",
    backgroundPosition: "0 0, 8px 8px",
  },
  white: { backgroundColor: "#ffffff" },
  black: { backgroundColor: "#000000" },
};

type RemoveConfig = {
  publicPath?: string;
  model?: "isnet" | "isnet_fp16" | "isnet_quint8";
  device?: "cpu" | "gpu";
  proxyToWorker?: boolean;
  debug?: boolean;
  progress?: (key: string, current: number, total: number) => void;
  output?: {
    format?: "image/png" | "image/jpeg" | "image/webp";
    quality?: number;
    type?: "foreground" | "background" | "mask";
  };
};

type RemoveModule = {
  default?: (
    image: Blob | File | ImageData | ImageBitmap,
    config?: RemoveConfig,
  ) => Promise<Blob>;
  removeBackground?: (
    image: Blob | File | ImageData | ImageBitmap,
    config?: RemoveConfig,
  ) => Promise<Blob>;
};

async function loadRemoveBackground(): Promise<
  NonNullable<RemoveModule["removeBackground"]>
> {
  const mod = await importFromUrl<RemoveModule>(PACKAGE_ESM);
  const fn = mod.removeBackground ?? mod.default;
  if (!fn) throw new Error("Background remover export missing");
  return fn;
}

/** Downscale so the model stays within browser memory limits. */
async function prepareImageBlob(
  file: File,
  maxEdge: number,
): Promise<{ blob: Blob; scaled: boolean; width: number; height: number }> {
  const { img, objectUrl } = await loadImageFromFile(file);
  try {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const scale = Math.min(1, maxEdge / Math.max(w, h));
    const tw = Math.max(1, Math.round(w * scale));
    const th = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, tw, th);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Encode failed"))),
        "image/png",
      );
    });
    return { blob, scaled: scale < 0.999, width: tw, height: th };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function BgRemoveTool() {
  const dictionary = useDictionary();
  const t = dictionary.bgremoveTool;
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [fileName, setFileName] = useState("image");
  const [info, setInfo] = useState<string | null>(null);
  const [previewBg, setPreviewBg] = useState<PreviewBg>("checker");
  const [sourceFile, setSourceFile] = useState<File | null>(null);

  const previewRef = useRef<string | null>(null);
  const resultRef = useRef<string | null>(null);
  const runIdRef = useRef(0);
  const removeFnRef = useRef<Awaited<
    ReturnType<typeof loadRemoveBackground>
  > | null>(null);

  function releaseUrls() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    if (resultRef.current) URL.revokeObjectURL(resultRef.current);
    previewRef.current = null;
    resultRef.current = null;
    setPreview(null);
    setResultUrl(null);
    setResultBlob(null);
  }

  useEffect(
    () => () => {
      runIdRef.current += 1;
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      if (resultRef.current) URL.revokeObjectURL(resultRef.current);
    },
    [],
  );

  function resetStatus() {
    setError(null);
    setInfo(null);
    setStatus(null);
    setCancelled(false);
    setProgress(0);
  }

  function cancel() {
    if (!busy) return;
    runIdRef.current += 1;
    setBusy(false);
    setProgress(0);
    setStatus(null);
    setCancelled(true);
  }

  function clearImage() {
    runIdRef.current += 1;
    releaseUrls();
    resetStatus();
    setBusy(false);
    setFileName("image");
    setSourceFile(null);
  }

  async function processFile(file: File) {
    const runId = ++runIdRef.current;
    const stale = () => runIdRef.current !== runId;

    setBusy(true);
    setProgress(4);
    setStatus(t.loadingModel);
    try {
      if (!removeFnRef.current) {
        removeFnRef.current = await loadRemoveBackground();
      }
      if (stale()) return;
      const removeBackground = removeFnRef.current;

      let lastError: unknown = null;
      for (let i = 0; i < MAX_EDGES.length; i++) {
        if (stale()) return;
        const maxEdge = MAX_EDGES[i]!;
        setStatus(
          i === 0 ? t.preparing : t.retrySmaller.replace("{px}", String(maxEdge)),
        );
        setProgress(8 + i * 8);

        let prepared: Awaited<ReturnType<typeof prepareImageBlob>>;
        try {
          prepared = await prepareImageBlob(file, maxEdge);
        } catch (err) {
          lastError = err;
          continue;
        }
        if (stale()) return;

        try {
          setStatus(t.working);
          const blob = await removeBackground(prepared.blob, {
            publicPath: PUBLIC_PATH,
            model: "isnet_quint8",
            device: "cpu",
            proxyToWorker: true,
            output: { format: "image/png", type: "foreground" },
            progress: (key, current, total) => {
              if (stale()) return;
              const ratio = total > 0 ? current / total : 0;
              const downloading = /download|fetch|wasm|model|ort/i.test(key);
              setStatus(downloading ? t.loadingModel : t.working);
              setProgress(Math.min(96, 20 + Math.round(ratio * 76)));
            },
          });
          if (stale()) return;

          if (resultRef.current) URL.revokeObjectURL(resultRef.current);
          const url = URL.createObjectURL(blob);
          resultRef.current = url;
          setResultBlob(blob);
          setResultUrl(url);
          setProgress(100);
          setStatus(null);
          const scaleNote = prepared.scaled
            ? ` · ${prepared.width}×${prepared.height}`
            : "";
          setInfo(
            `${formatBytes(file.size)} → ${formatBytes(blob.size)}${scaleNote}`,
          );
          return;
        } catch (err) {
          lastError = err;
          // Try the next smaller size.
        }
      }

      if (stale()) return;
      if (lastError instanceof CdnLoadError) {
        setError(t.cdnError);
      } else {
        setError(t.processError);
      }
      setProgress(0);
      setStatus(null);
    } catch (err) {
      if (stale()) return;
      setError(err instanceof CdnLoadError ? t.cdnError : t.processError);
      setProgress(0);
      setStatus(null);
    } finally {
      if (!stale()) setBusy(false);
    }
  }

  async function onFile(file: File | null) {
    if (busy) return;
    resetStatus();
    releaseUrls();
    setSourceFile(null);
    if (!file) return;
    if (!file.type.startsWith("image/") && !/\.(heic|heif|avif|webp|png|jpe?g|gif|bmp)$/i.test(file.name)) {
      setError(t.invalidImage);
      return;
    }

    setFileName(file.name.replace(/\.[^.]+$/, "") || "image");
    setSourceFile(file);
    const previewUrl = URL.createObjectURL(file);
    previewRef.current = previewUrl;
    setPreview(previewUrl);
    await processFile(file);
  }

  function download() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, `${fileName}-no-bg.png`);
  }

  const bgOptions: { id: PreviewBg; label: string }[] = [
    { id: "checker", label: t.bgChecker },
    { id: "white", label: t.bgWhite },
    { id: "black", label: t.bgBlack },
  ];

  const hasImage = Boolean(preview);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-muted">{t.intro}</p>
      <p className="text-xs text-muted">{t.note}</p>
      <p className="text-xs text-muted">{t.firstUseNote}</p>

      <Field label={t.pickImage}>
        <input
          type="file"
          accept="image/*,.heic,.heif,.avif,.webp"
          disabled={busy}
          className={fileInputClass}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            e.target.value = "";
            void onFile(file);
          }}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        {busy ? (
          <button type="button" onClick={cancel} className={secondaryBtnClass}>
            {t.cancel}
          </button>
        ) : null}
        {!busy && sourceFile && !resultBlob ? (
          <button
            type="button"
            onClick={() => void processFile(sourceFile)}
            className={primaryBtnClass}
          >
            {t.retry}
          </button>
        ) : null}
        {hasImage ? (
          <button
            type="button"
            disabled={busy}
            onClick={clearImage}
            className={secondaryBtnClass}
          >
            {t.clearImage}
          </button>
        ) : null}
      </div>

      {busy || (progress > 0 && !resultUrl) ? (
        <ProgressBar
          value={progress}
          label={status ?? (busy ? t.working : t.progress)}
        />
      ) : null}

      {cancelled ? <p className="text-sm text-muted">{t.cancelled}</p> : null}
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}
      {info ? <p className="text-sm font-medium text-foreground">{info}</p> : null}

      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-foreground">
          {t.previewBackground}
        </span>
        <Segmented
          ariaLabel={t.previewBackground}
          value={previewBg}
          options={bgOptions}
          onChange={setPreviewBg}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-[12px] border border-border bg-overlay p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            {t.original}
          </p>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="mx-auto max-h-72 max-w-full object-contain"
            />
          ) : (
            <p className="flex h-40 items-center justify-center text-sm text-muted">
              {t.empty}
            </p>
          )}
        </div>
        <div
          className="overflow-hidden rounded-[12px] border border-border p-3"
          style={BG_STYLES[previewBg]}
        >
          <p
            className={`mb-2 text-xs font-medium uppercase tracking-wide ${
              previewBg === "black" ? "text-on-accent/70" : "text-muted"
            }`}
          >
            {t.result}
          </p>
          {resultUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resultUrl}
              alt=""
              className="mx-auto max-h-72 max-w-full object-contain"
            />
          ) : (
            <p className="flex h-40 items-center justify-center bg-surface/80 text-sm text-muted">
              {t.emptyResult}
            </p>
          )}
        </div>
      </div>

      {resultBlob ? (
        <button type="button" onClick={download} className={primaryBtnClass}>
          {t.download}
        </button>
      ) : null}
    </div>
  );
}
