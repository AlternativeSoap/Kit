"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
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

type CropRect = { x: number; y: number; w: number; h: number };

function yieldFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

const fieldClass =
  "w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]";
const primaryBtn =
  "rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40";
const secondaryBtn =
  "rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground";
const fileInputClass =
  "block w-full text-sm text-muted file:mr-3 file:rounded-[8px] file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white";

export function ImageTool({ mode }: Props) {
  const dictionary = useDictionary();
  const t = dictionary.imageTool;

  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState<ReadyResult | null>(null);

  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
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
      if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
    };
  }, [clearReady, sourceUrl]);

  const onFile = useCallback(
    async (f: File | null) => {
      setError(null);
      clearReady();
      setProgress(0);
      setFile(f);
      if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
      setSourceUrl(null);
      setImg(null);
      if (!f) return;
      try {
        const { img: loaded, objectUrl } = await loadImageFromFile(f);
        setImg(loaded);
        setSourceUrl(objectUrl);
        setCrop({
          x: 0,
          y: 0,
          w: loaded.naturalWidth,
          h: loaded.naturalHeight,
        });
        setWidth(String(loaded.naturalWidth));
        setHeight(String(loaded.naturalHeight));
        if (f.type === "image/png") setFormat("image/png");
        else if (f.type === "image/webp") setFormat("image/webp");
        else setFormat("image/jpeg");
      } catch {
        setError(t.loadError);
      }
    },
    [clearReady, sourceUrl, t.loadError],
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
        const { x, y, w, h } = crop;
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

  const showSource = Boolean(sourceUrl);
  const showResult = Boolean(ready?.previewUrl);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-5">
        <p className="text-sm text-muted">{t.localNote}</p>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            {t.pickImage}
          </span>
          <input
            type="file"
            accept="image/*,.heic,.heif"
            className={fileInputClass}
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
          <div className="space-y-3">
            <p className="text-sm text-muted">{t.cropHint}</p>
            <div className="grid grid-cols-2 gap-3">
              <Num
                label={t.x}
                value={String(Math.round(crop.x))}
                onChange={(v) => {
                  setCrop((c) => ({ ...c, x: Number(v) || 0 }));
                  markSettingsChanged();
                }}
              />
              <Num
                label={t.y}
                value={String(Math.round(crop.y))}
                onChange={(v) => {
                  setCrop((c) => ({ ...c, y: Number(v) || 0 }));
                  markSettingsChanged();
                }}
              />
              <Num
                label={t.width}
                value={String(Math.round(crop.w))}
                onChange={(v) => {
                  setCrop((c) => ({ ...c, w: Number(v) || 0 }));
                  markSettingsChanged();
                }}
              />
              <Num
                label={t.height}
                value={String(Math.round(crop.h))}
                onChange={(v) => {
                  setCrop((c) => ({ ...c, h: Number(v) || 0 }));
                  markSettingsChanged();
                }}
              />
            </div>
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
                className="accent-[var(--accent)]"
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
                  className={`rounded-[10px] border px-3 py-2 text-sm ${
                    degrees === d
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-surface text-muted hover:text-foreground"
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
                className="accent-[var(--accent)]"
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
                className="accent-[var(--accent)]"
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
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={downloadReady} className={primaryBtn}>
                {t.download}
              </button>
              <button
                type="button"
                disabled={!img || busy}
                onClick={() => void run()}
                className={secondaryBtn}
              >
                {t.processAgain}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={!img || busy}
            onClick={() => void run()}
            className={primaryBtn}
          >
            {busy ? t.working : t.process}
          </button>
        )}

        {error ? <p className="text-sm text-muted">{error}</p> : null}
        {mode === "convert" || mode === "compress" ? (
          <p className="text-xs text-muted">{t.heicNote}</p>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="min-h-48 overflow-hidden rounded-[12px] border border-border bg-black/5 p-3">
          {mode === "crop" && showSource && img ? (
            <CropStage
              src={sourceUrl!}
              naturalW={img.naturalWidth}
              naturalH={img.naturalHeight}
              crop={crop}
              onCropChange={(next) => {
                setCrop(next);
                markSettingsChanged();
              }}
            />
          ) : showResult ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ready!.previewUrl}
              alt=""
              className="mx-auto max-h-[28rem] max-w-full object-contain"
            />
          ) : showSource ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sourceUrl!}
              alt=""
              className="mx-auto max-h-[28rem] max-w-full object-contain"
            />
          ) : (
            <p className="flex h-48 items-center justify-center text-sm text-muted">
              {t.previewEmpty}
            </p>
          )}
        </div>

        {mode === "crop" && showResult ? (
          <div className="overflow-hidden rounded-[12px] border border-border bg-black/5 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              {t.ready}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ready!.previewUrl}
              alt=""
              className="mx-auto max-h-40 max-w-full object-contain"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CropStage({
  src,
  naturalW,
  naturalH,
  crop,
  onCropChange,
}: {
  src: string;
  naturalW: number;
  naturalH: number;
  crop: CropRect;
  onCropChange: (next: CropRect) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  function clientToNatural(clientX: number, clientY: number) {
    const el = wrapRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const scaleX = naturalW / rect.width;
    const scaleY = naturalH / rect.height;
    const x = Math.min(naturalW, Math.max(0, (clientX - rect.left) * scaleX));
    const y = Math.min(naturalH, Math.max(0, (clientY - rect.top) * scaleY));
    return { x, y };
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = clientToNatural(event.clientX, event.clientY);
    dragRef.current = {
      startX: point.x,
      startY: point.y,
      originX: point.x,
      originY: point.y,
    };
    onCropChange({ x: point.x, y: point.y, w: 1, h: 1 });
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const point = clientToNatural(event.clientX, event.clientY);
    const x = Math.min(drag.originX, point.x);
    const y = Math.min(drag.originY, point.y);
    const w = Math.max(1, Math.abs(point.x - drag.originX));
    const h = Math.max(1, Math.abs(point.y - drag.originY));
    onCropChange({ x, y, w, h });
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  const left = (crop.x / naturalW) * 100;
  const top = (crop.y / naturalH) * 100;
  const width = (crop.w / naturalW) * 100;
  const height = (crop.h / naturalH) * 100;

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto inline-block max-h-[28rem] max-w-full cursor-crosshair touch-none select-none overflow-hidden rounded-[8px]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="block max-h-[28rem] max-w-full object-contain"
      />
      <div
        className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
        style={{
          left: `${left}%`,
          top: `${top}%`,
          width: `${width}%`,
          height: `${height}%`,
        }}
      />
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
        className={fieldClass}
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
        className={fieldClass}
      >
        {hidePng ? null : <option value="image/png">{labels.png}</option>}
        <option value="image/jpeg">{labels.jpeg}</option>
        <option value="image/webp">{labels.webp}</option>
      </select>
    </label>
  );
}
