"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ErrorBanner,
  Field,
  Segmented,
  fieldClass,
  fileInputClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useDictionary } from "@/i18n/LanguageProvider";
import {
  ALL_EXPORT_FORMATS,
  LOSSY_FORMATS,
  canEncodeFormat,
  canvasToBlob,
  compressToTarget,
  cropImage,
  downloadBlob,
  drawToCanvas,
  extensionForFormat,
  formatBytes,
  formatFromMimeOrName,
  loadImageFromFile,
  rotateImage,
  type ImageFormat,
} from "./canvas";
import { ProgressBar } from "./ProgressBar";

const FILE_ACCEPT =
  "image/*,.heic,.heif,.avif,.bmp,.gif,.svg,.ico,.tif,.tiff,.webp,.jpg,.jpeg,.png";

export type ImageToolMode =
  | "crop"
  | "resize"
  | "compress"
  | "convert"
  | "rotate";

type Props = { mode: ImageToolMode; allowModeSwitch?: boolean };

type ReadyResult = {
  blob: Blob;
  filename: string;
  info: string;
  notes: string[];
  previewUrl: string;
};

type CropRect = { x: number; y: number; w: number; h: number };

type AspectId = "free" | "1:1" | "4:3" | "16:9";

const ASPECT_RATIOS: Record<AspectId, number | null> = {
  free: null,
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
};

const DEFAULT_QUALITY = 0.8;
const DEFAULT_COMPRESS_QUALITY = 0.95;

function yieldFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Keeps the crop inside the image. Width and height may be 0 while typing. */
function clampCrop(c: CropRect, natW: number, natH: number): CropRect {
  const x = clamp(c.x, 0, Math.max(0, natW - 1));
  const y = clamp(c.y, 0, Math.max(0, natH - 1));
  const w = clamp(c.w, 0, natW - x);
  const h = clamp(c.h, 0, natH - y);
  return { x, y, w, h };
}

/** Forces a crop to a ratio (width / height) without leaving the image. */
function fitAspect(
  c: CropRect,
  ratio: number,
  natW: number,
  natH: number,
  anchor: "w" | "h",
): CropRect {
  const maxW = Math.max(0, natW - c.x);
  const maxH = Math.max(0, natH - c.y);
  if (anchor === "w") {
    const w = Math.min(c.w, maxW, maxH * ratio);
    return { ...c, w, h: w / ratio };
  }
  const h = Math.min(c.h, maxH, maxW / ratio);
  return { ...c, w: h * ratio, h };
}

export function ImageTool({ mode: modeProp, allowModeSwitch }: Props) {
  const dictionary = useDictionary();
  const t = dictionary.imageTool;

  const [mode, setMode] = useState<ImageToolMode>(modeProp);
  const [seededMode, setSeededMode] = useState<ImageToolMode>(modeProp);

  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState<ReadyResult | null>(null);

  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const [aspectId, setAspectId] = useState<AspectId>("free");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [compressQuality, setCompressQuality] = useState(
    DEFAULT_COMPRESS_QUALITY,
  );
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

  // Follow the prop when the parent switches tools, without touching the loaded image.
  if (seededMode !== modeProp) {
    setSeededMode(modeProp);
    setMode(modeProp);
    setError(null);
    setProgress(0);
    if (ready) {
      if (ready.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(ready.previewUrl);
      }
      setReady(null);
    }
  }

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
        setAspectId("free");
        setCrop({
          x: 0,
          y: 0,
          w: loaded.naturalWidth,
          h: loaded.naturalHeight,
        });
        setWidth(String(loaded.naturalWidth));
        setHeight(String(loaded.naturalHeight));
        const detected = formatFromMimeOrName(f.type, f.name);
        if (detected && mode !== "compress") setFormat(detected);
        else if (detected && LOSSY_FORMATS.includes(detected)) setFormat(detected);
        else if (mode === "compress") setFormat("image/jpeg");
        else setFormat("image/png");
      } catch {
        setError(t.loadError);
      }
    },
    [clearReady, mode, sourceUrl, t.loadError],
  );

  const aspect = useMemo(() => {
    if (!img || !img.naturalHeight) return 1;
    return img.naturalWidth / img.naturalHeight;
  }, [img]);

  const cropRatio = ASPECT_RATIOS[aspectId];

  const exportName = (ext: string) => {
    const base = (file?.name ?? "image").replace(/\.[^.]+$/, "");
    return `${base}-${mode}.${ext}`;
  };

  function markSettingsChanged() {
    clearReady();
    setProgress(0);
  }

  function changeMode(next: ImageToolMode) {
    if (next === mode) return;
    setMode(next);
    setError(null);
    markSettingsChanged();
  }

  function updateCrop(patch: Partial<CropRect>) {
    if (!img) return;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const anchor = patch.h !== undefined && patch.w === undefined ? "h" : "w";
    setCrop((c) => {
      const next = clampCrop({ ...c, ...patch }, natW, natH);
      return cropRatio ? fitAspect(next, cropRatio, natW, natH, anchor) : next;
    });
    markSettingsChanged();
  }

  function selectAspect(id: AspectId) {
    setAspectId(id);
    const ratio = ASPECT_RATIOS[id];
    if (img && ratio) {
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      setCrop((c) => {
        const base: CropRect =
          c.w >= 1 && c.h >= 1 ? c : { x: 0, y: 0, w: natW, h: natH };
        const w = Math.min(base.w, base.h * ratio);
        const fitted = clampCrop({ ...base, w, h: w / ratio }, natW, natH);
        return fitAspect(fitted, ratio, natW, natH, "w");
      });
    }
    markSettingsChanged();
  }

  async function run() {
    if (!img) return;
    setBusy(true);
    setError(null);
    clearReady();
    setProgress(4);
    try {
      await yieldFrame();
      let outFormat: ImageFormat = format;
      let blob: Blob;
      let infoExtra = "";
      const notes: string[] = [];

      if (mode === "crop") {
        if (
          ![crop.x, crop.y, crop.w, crop.h].every(
            (n) => Number.isFinite(n) && n >= 0,
          ) ||
          crop.w < 1 ||
          crop.h < 1
        ) {
          setError(t.invalid);
          setProgress(0);
          return;
        }
        const natW = img.naturalWidth;
        const natH = img.naturalHeight;
        const bounded = clampCrop(crop, natW, natH);
        const x = Math.floor(bounded.x);
        const y = Math.floor(bounded.y);
        const w = Math.max(1, Math.min(Math.round(bounded.w), natW - x));
        const h = Math.max(1, Math.min(Math.round(bounded.h), natH - y));
        setProgress(30);
        await yieldFrame();
        const canvas = cropImage(img, { x, y, w, h });
        setProgress(70);
        blob = await canvasToBlob(
          canvas,
          outFormat,
          LOSSY_FORMATS.includes(outFormat) ? quality : undefined,
        );
      } else if (mode === "resize") {
        let w = Number(width);
        let h = Number(height);
        if (keepAspect && Number.isFinite(w) && w > 0) h = Math.round(w / aspect);
        else if (keepAspect && Number.isFinite(h) && h > 0)
          w = Math.round(h * aspect);
        if (!(w > 0) || !(h > 0)) {
          setError(t.invalid);
          setProgress(0);
          return;
        }
        setProgress(35);
        await yieldFrame();
        const canvas = drawToCanvas(img, w, h);
        setProgress(70);
        blob = await canvasToBlob(
          canvas,
          outFormat,
          LOSSY_FORMATS.includes(outFormat) ? quality : undefined,
        );
      } else if (mode === "compress") {
        const maxBytes = Math.max(1, Number(maxKb) || 200) * 1024;
        const outType = LOSSY_FORMATS.includes(format) ? format : "image/jpeg";
        const result = await compressToTarget(
          img,
          outType,
          maxBytes,
          (ratio) => setProgress(Math.round(ratio * 100)),
          compressQuality,
        );
        blob = result.blob;
        outFormat = outType;
        infoExtra = ` (${t.quality} ${Math.round(result.quality * 100)})`;
        if (result.metTarget === false) {
          notes.push(t.targetNotMet.replace("{max}", formatBytes(maxBytes)));
        }
        if (result.scaled) notes.push(t.scaledDown);
      } else if (mode === "convert") {
        setProgress(35);
        await yieldFrame();
        const canvas = drawToCanvas(img, img.naturalWidth, img.naturalHeight);
        setProgress(70);
        blob = await canvasToBlob(
          canvas,
          outFormat,
          LOSSY_FORMATS.includes(outFormat) ? quality : undefined,
        );
      } else {
        setProgress(35);
        await yieldFrame();
        const canvas = rotateImage(img, degrees, flipH, flipV);
        setProgress(70);
        blob = await canvasToBlob(
          canvas,
          outFormat,
          LOSSY_FORMATS.includes(outFormat) ? quality : undefined,
        );
      }

      setProgress(100);
      const inputSize = file?.size ?? 0;
      if (inputSize > 0 && blob.size > inputSize) notes.push(t.outputLarger);
      const filename = exportName(extensionForFormat(outFormat));
      const previewUrl = URL.createObjectURL(blob);
      setReady({
        blob,
        filename,
        previewUrl,
        notes,
        info: `${formatBytes(inputSize)} → ${formatBytes(blob.size)}${infoExtra}`,
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

  const modeOptions: { id: ImageToolMode; label: string }[] = [
    { id: "crop", label: t.modeCrop },
    { id: "resize", label: t.modeResize },
    { id: "compress", label: t.modeCompress },
    { id: "convert", label: t.modeConvert },
    { id: "rotate", label: t.modeRotate },
  ];

  const formatChanged = (v: ImageFormat) => {
    setFormat(v);
    markSettingsChanged();
  };

  const showQuality =
    mode === "compress" || LOSSY_FORMATS.includes(format);
  const qualityValue = mode === "compress" ? compressQuality : quality;
  const qualityChanged = (v: number) => {
    if (mode === "compress") setCompressQuality(v);
    else setQuality(v);
    markSettingsChanged();
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-5">
        {allowModeSwitch ? (
          <Segmented
            value={mode}
            options={modeOptions}
            onChange={changeMode}
            ariaLabel={t.modeLabel}
          />
        ) : null}
        <p className="text-sm text-muted">{t.localNote}</p>
        <Field label={t.pickImage}>
          <input
            type="file"
            accept={FILE_ACCEPT}
            className={fileInputClass}
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </Field>

        {img ? (
          <p className="text-xs text-muted">
            {img.naturalWidth}×{img.naturalHeight}
            {file ? ` · ${formatBytes(file.size)}` : ""}
          </p>
        ) : null}

        {mode === "crop" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">{t.cropHint}</p>
            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-foreground">
                {t.aspect}
              </span>
              <Segmented
                value={aspectId}
                options={[
                  { id: "free", label: t.aspectFree },
                  { id: "1:1", label: "1:1" },
                  { id: "4:3", label: "4:3" },
                  { id: "16:9", label: "16:9" },
                ]}
                onChange={selectAspect}
                ariaLabel={t.aspect}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Num
                label={t.x}
                value={String(Math.round(crop.x))}
                onChange={(v) => updateCrop({ x: Number(v) || 0 })}
              />
              <Num
                label={t.y}
                value={String(Math.round(crop.y))}
                onChange={(v) => updateCrop({ y: Number(v) || 0 })}
              />
              <Num
                label={t.width}
                value={String(Math.round(crop.w))}
                onChange={(v) => updateCrop({ w: Number(v) || 0 })}
              />
              <Num
                label={t.height}
                value={String(Math.round(crop.h))}
                onChange={(v) => updateCrop({ h: Number(v) || 0 })}
              />
            </div>
            <FormatSelect value={format} onChange={formatChanged} labels={t} />
            {showQuality ? (
              <QualityField
                label={t.quality}
                value={qualityValue}
                onChange={qualityChanged}
              />
            ) : null}
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
            <FormatSelect value={format} onChange={formatChanged} labels={t} />
            {showQuality ? (
              <QualityField
                label={t.quality}
                value={qualityValue}
                onChange={qualityChanged}
              />
            ) : null}
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
              value={LOSSY_FORMATS.includes(format) ? format : "image/jpeg"}
              onChange={formatChanged}
              labels={t}
              lossyOnly
            />
            <QualityField
              label={t.quality}
              value={qualityValue}
              onChange={qualityChanged}
            />
          </div>
        ) : null}

        {mode === "convert" ? (
          <div className="space-y-3">
            <FormatSelect value={format} onChange={formatChanged} labels={t} />
            {showQuality ? (
              <QualityField
                label={t.quality}
                value={qualityValue}
                onChange={qualityChanged}
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
                  className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm sm:min-h-0 ${
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
            <FormatSelect value={format} onChange={formatChanged} labels={t} />
            {showQuality ? (
              <QualityField
                label={t.quality}
                value={qualityValue}
                onChange={qualityChanged}
              />
            ) : null}
          </div>
        ) : null}

        {busy || (progress > 0 && !ready) ? (
          <ProgressBar value={progress} label={t.progress} />
        ) : null}

        {ready ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">{ready.info}</p>
            {ready.notes.map((note) => (
              <p
                key={note}
                role="status"
                className="rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-foreground"
              >
                {note}
              </p>
            ))}
            <p className="text-sm font-medium text-foreground">{t.ready}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadReady}
                className={primaryBtnClass}
              >
                {t.download}
              </button>
              <button
                type="button"
                disabled={!img || busy}
                onClick={() => void run()}
                className={secondaryBtnClass}
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
            className={primaryBtnClass}
          >
            {busy ? t.working : t.process}
          </button>
        )}

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}
        <p className="text-xs text-muted">{t.formatsNote}</p>
        <p className="text-xs text-muted">{t.heicNote}</p>
      </div>

      <div className="order-first space-y-4 lg:order-none">
        <div className="min-h-48 overflow-hidden rounded-[12px] border border-border bg-black/5 p-3">
          {mode === "crop" && showSource && img ? (
            <CropStage
              src={sourceUrl!}
              naturalW={img.naturalWidth}
              naturalH={img.naturalHeight}
              crop={crop}
              ratio={cropRatio}
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

type Corner = "nw" | "ne" | "sw" | "se";
type DragKind = Corner | "move" | "new";

type DragState = {
  kind: DragKind;
  /** Fixed point for resize and new selections, in image pixels. */
  anchorX: number;
  anchorY: number;
  /** Pointer position when the drag began, in image pixels. */
  startX: number;
  startY: number;
  startCrop: CropRect;
};

const HANDLE_HIT_PX = 18;

const OPPOSITE_CORNER: Record<Corner, Corner> = {
  nw: "se",
  ne: "sw",
  sw: "ne",
  se: "nw",
};

const CORNER_CURSOR: Record<Corner, string> = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
};

function cornerPoint(c: CropRect, corner: Corner): { x: number; y: number } {
  return {
    x: corner === "nw" || corner === "sw" ? c.x : c.x + c.w,
    y: corner === "nw" || corner === "ne" ? c.y : c.y + c.h,
  };
}

/** Builds a crop from a fixed corner and the pointer, optionally locked to a ratio. */
function rectFromAnchor(
  ax: number,
  ay: number,
  px: number,
  py: number,
  ratio: number | null,
  natW: number,
  natH: number,
): CropRect {
  const sx = px >= ax ? 1 : -1;
  const sy = py >= ay ? 1 : -1;
  const maxDx = sx > 0 ? natW - ax : ax;
  const maxDy = sy > 0 ? natH - ay : ay;
  let dx = Math.min(Math.abs(px - ax), maxDx);
  let dy = Math.min(Math.abs(py - ay), maxDy);
  if (ratio) {
    const w = Math.min(Math.max(dx, dy * ratio), maxDx, maxDy * ratio);
    dx = w;
    dy = w / ratio;
  }
  const w = Math.max(1, dx);
  const h = Math.max(1, dy);
  return {
    x: Math.max(0, sx > 0 ? ax : ax - w),
    y: Math.max(0, sy > 0 ? ay : ay - h),
    w,
    h,
  };
}

function CropStage({
  src,
  naturalW,
  naturalH,
  crop,
  ratio,
  onCropChange,
}: {
  src: string;
  naturalW: number;
  naturalH: number;
  crop: CropRect;
  ratio: number | null;
  onCropChange: (next: CropRect) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [cursor, setCursor] = useState("crosshair");

  function clientToNatural(clientX: number, clientY: number, bound = true) {
    const el = wrapRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) * naturalW) / rect.width;
    const y = ((clientY - rect.top) * naturalH) / rect.height;
    if (!bound) return { x, y };
    return { x: clamp(x, 0, naturalW), y: clamp(y, 0, naturalH) };
  }

  function hitTest(clientX: number, clientY: number): DragKind {
    const el = wrapRef.current;
    if (!el) return "new";
    const rect = el.getBoundingClientRect();
    const pxPerX = rect.width / naturalW;
    const pxPerY = rect.height / naturalH;
    for (const corner of ["nw", "ne", "sw", "se"] as const) {
      const p = cornerPoint(crop, corner);
      const dist = Math.hypot(
        clientX - (rect.left + p.x * pxPerX),
        clientY - (rect.top + p.y * pxPerY),
      );
      if (dist <= HANDLE_HIT_PX) return corner;
    }
    const coversImage = crop.w >= naturalW - 0.5 && crop.h >= naturalH - 0.5;
    if (!coversImage && crop.w >= 1 && crop.h >= 1) {
      const p = clientToNatural(clientX, clientY, false);
      if (
        p.x >= crop.x &&
        p.x <= crop.x + crop.w &&
        p.y >= crop.y &&
        p.y <= crop.y + crop.h
      ) {
        return "move";
      }
    }
    return "new";
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const kind = hitTest(event.clientX, event.clientY);
    const point = clientToNatural(event.clientX, event.clientY);
    let anchorX = point.x;
    let anchorY = point.y;
    if (kind !== "move" && kind !== "new") {
      const opposite = cornerPoint(crop, OPPOSITE_CORNER[kind]);
      anchorX = opposite.x;
      anchorY = opposite.y;
    }
    dragRef.current = {
      kind,
      anchorX,
      anchorY,
      startX: point.x,
      startY: point.y,
      startCrop: crop,
    };
    if (kind === "new") {
      onCropChange(
        rectFromAnchor(anchorX, anchorY, anchorX, anchorY, ratio, naturalW, naturalH),
      );
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) {
      const kind = hitTest(event.clientX, event.clientY);
      const next =
        kind === "move"
          ? "move"
          : kind === "new"
            ? "crosshair"
            : CORNER_CURSOR[kind];
      if (next !== cursor) setCursor(next);
      return;
    }
    if (drag.kind === "move") {
      const point = clientToNatural(event.clientX, event.clientY, false);
      const { startCrop } = drag;
      onCropChange({
        ...startCrop,
        x: clamp(startCrop.x + point.x - drag.startX, 0, naturalW - startCrop.w),
        y: clamp(startCrop.y + point.y - drag.startY, 0, naturalH - startCrop.h),
      });
      return;
    }
    const point = clientToNatural(event.clientX, event.clientY);
    onCropChange(
      rectFromAnchor(
        drag.anchorX,
        drag.anchorY,
        point.x,
        point.y,
        ratio,
        naturalW,
        naturalH,
      ),
    );
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  const left = (crop.x / naturalW) * 100;
  const top = (crop.y / naturalH) * 100;
  const width = (crop.w / naturalW) * 100;
  const height = (crop.h / naturalH) * 100;

  const handleClass =
    "pointer-events-none absolute h-3 w-3 border border-black/40 bg-white";

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto inline-block max-h-[min(28rem,55dvh)] max-w-full touch-none select-none overflow-hidden rounded-[8px]"
      style={{ cursor }}
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
        className="block max-h-[min(28rem,55dvh)] max-w-full object-contain"
      />
      <div
        className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
        style={{
          left: `${left}%`,
          top: `${top}%`,
          width: `${width}%`,
          height: `${height}%`,
        }}
      >
        <span className={`${handleClass} left-0 top-0`} />
        <span className={`${handleClass} right-0 top-0`} />
        <span className={`${handleClass} bottom-0 left-0`} />
        <span className={`${handleClass} bottom-0 right-0`} />
      </div>
    </div>
  );
}

function QualityField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const percent = clamp(Math.round(value * 100), 1, 100);
  return (
    <Field label={`${label}: ${percent}`}>
      <input
        type="range"
        min={1}
        max={100}
        step={1}
        value={percent}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full accent-[var(--accent)]"
      />
    </Field>
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
    <Field label={label}>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
      />
    </Field>
  );
}

function FormatSelect({
  value,
  onChange,
  labels,
  lossyOnly,
}: {
  value: ImageFormat;
  onChange: (v: ImageFormat) => void;
  labels: {
    png: string;
    jpeg: string;
    webp: string;
    bmp: string;
    gif: string;
    ico: string;
    format: string;
  };
  lossyOnly?: boolean;
}) {
  const [options, setOptions] = useState<ImageFormat[]>(
    lossyOnly ? [...LOSSY_FORMATS] : [...ALL_EXPORT_FORMATS],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const candidates = lossyOnly ? LOSSY_FORMATS : ALL_EXPORT_FORMATS;
      const supported: ImageFormat[] = [];
      for (const fmt of candidates) {
        if (await canEncodeFormat(fmt)) supported.push(fmt);
      }
      if (cancelled) return;
      const next =
        supported.length > 0
          ? supported
          : (["image/png", "image/jpeg"] as ImageFormat[]);
      setOptions(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [lossyOnly]);

  useEffect(() => {
    if (!options.includes(value) && options[0]) onChange(options[0]);
    // Parent passes an inline onChange; only re-sync when options/value change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, value]);

  const labelFor = (fmt: ImageFormat) => {
    switch (fmt) {
      case "image/png":
        return labels.png;
      case "image/jpeg":
        return labels.jpeg;
      case "image/webp":
        return labels.webp;
      case "image/bmp":
        return labels.bmp;
      case "image/gif":
        return labels.gif;
      case "image/x-icon":
        return labels.ico;
    }
  };

  const selectValue = options.includes(value) ? value : options[0] ?? value;

  return (
    <Field label={labels.format}>
      <select
        value={selectValue}
        onChange={(e) => onChange(e.target.value as ImageFormat)}
        className={fieldClass}
      >
        {options.map((fmt) => (
          <option key={fmt} value={fmt}>
            {labelFor(fmt)}
          </option>
        ))}
      </select>
    </Field>
  );
}
