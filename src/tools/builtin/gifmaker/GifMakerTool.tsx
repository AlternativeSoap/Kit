"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
} from "react";
import {
  ErrorBanner,
  Field,
  KitInput,
  KitSelect,
  Segmented,
  fileInputClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useDictionary } from "@/i18n/LanguageProvider";
import { downloadBlob, formatBytes } from "../media/canvas";
import { ProgressBar } from "../media/ProgressBar";
import { encodeAnimatedGif } from "./encodeAnimatedGif";
import {
  buildAnimatedFrames,
  extractVideoFrames,
  type FitMode,
  type SourceFrame,
  type TransitionKind,
} from "./render";

const EXPORT_SIZES = [240, 480, 720, 1080, 1920] as const;
type ExportSize = (typeof EXPORT_SIZES)[number];
const MAX_FRAMES_SOFT = 60;

const ACCEPT =
  "image/*,video/*,.heic,.heif,.avif,.bmp,.gif,.webp,.jpg,.jpeg,.png,.mp4,.webm,.mov,.m4v";

type Ready = {
  blob: Blob;
  filename: string;
  info: string;
  previewUrl: string;
};

let frameSeq = 0;
function nextId() {
  frameSeq += 1;
  return `f-${frameSeq}-${Math.random().toString(36).slice(2, 7)}`;
}

async function fileToBitmap(file: File): Promise<ImageBitmap> {
  if (
    file.type.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|bmp|avif|heic|heif)$/i.test(file.name)
  ) {
    try {
      return await createImageBitmap(file);
    } catch {
      const { loadImageFromFile } = await import("../media/canvas");
      const { img, objectUrl } = await loadImageFromFile(file);
      try {
        return await createImageBitmap(img);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }
  }
  throw new Error("not-image");
}

export function GifMakerTool() {
  const dictionary = useDictionary();
  const t = dictionary.gifmakerTool;

  const [frames, setFrames] = useState<SourceFrame[]>([]);
  // Balanced defaults: sharp enough, still shareable, calm video sampling.
  const [delayMs, setDelayMs] = useState(400);
  const [exportSize, setExportSize] = useState<ExportSize>(720);
  const [fit, setFit] = useState<FitMode>("contain");
  const [background, setBackground] = useState("#ffffff");
  const [transition, setTransition] = useState<TransitionKind>("none");
  const [transitionMs, setTransitionMs] = useState(350);
  const [transitionSteps, setTransitionSteps] = useState(6);
  const [loopFade, setLoopFade] = useState(true);
  const [loops, setLoops] = useState(0);
  const [pingPong, setPingPong] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [targetDuration, setTargetDuration] = useState("");
  const [videoFps, setVideoFps] = useState(6);
  const [videoMaxFrames, setVideoMaxFrames] = useState(36);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<Ready | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const cancelRef = useRef(false);
  const playTimer = useRef<number | null>(null);

  const clearReady = useCallback(() => {
    setReady((prev) => {
      if (prev?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      clearReady();
      for (const f of frames) {
        f.bitmap.close();
        if (f.previewUrl.startsWith("blob:")) URL.revokeObjectURL(f.previewUrl);
      }
      if (playTimer.current !== null) window.clearInterval(playTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount only
  }, []);

  const estimatedMs = useMemo(() => {
    if (!frames.length) return 0;
    let total = frames.reduce((sum, f) => sum + (f.delayMs ?? delayMs), 0);
    if (pingPong && frames.length > 1) {
      const mid = frames.slice(1, -1);
      total += mid.reduce((sum, f) => sum + (f.delayMs ?? delayMs), 0);
    }
    if (transition !== "none" && frames.length > 1) {
      let edges = pingPong
        ? Math.max(0, frames.length * 2 - 3)
        : frames.length - 1;
      if (loopFade) edges += 1;
      total += edges * transitionMs;
    }
    const target = Number(targetDuration.replace(",", "."));
    if (Number.isFinite(target) && target > 0) return Math.round(target * 1000);
    return total;
  }, [
    frames,
    delayMs,
    pingPong,
    transition,
    transitionMs,
    loopFade,
    targetDuration,
  ]);

  async function addFiles(fileList: FileList | File[] | null) {
    if (!fileList) return;
    setError(null);
    const list = Array.from(fileList);
    if (!list.length) return;
    setBusy(true);
    setProgress(4);
    cancelRef.current = false;
    try {
      const next: SourceFrame[] = [];
      for (let i = 0; i < list.length; i++) {
        if (cancelRef.current) break;
        const file = list[i]!;
        const isVideo =
          file.type.startsWith("video/") ||
          /\.(mp4|webm|mov|m4v)$/i.test(file.name);
        if (isVideo) {
          const { bitmaps, labels } = await extractVideoFrames(file, {
            fps: videoFps,
            maxFrames: videoMaxFrames,
            maxEdge: Math.max(exportSize, 720),
            onProgress: (r) =>
              setProgress(4 + Math.round(((i + r) / list.length) * 90)),
          });
          for (let j = 0; j < bitmaps.length; j++) {
            const bitmap = bitmaps[j]!;
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(bitmap, 0, 0);
            const previewUrl = canvas.toDataURL("image/jpeg", 0.72);
            next.push({
              id: nextId(),
              bitmap,
              label: labels[j] ?? file.name,
              previewUrl,
            });
          }
        } else {
          try {
            const bitmap = await fileToBitmap(file);
            const previewUrl = URL.createObjectURL(file);
            next.push({
              id: nextId(),
              bitmap,
              label: file.name,
              previewUrl,
            });
          } catch {
            setError(t.invalidFile);
          }
        }
        setProgress(4 + Math.round(((i + 1) / list.length) * 90));
      }
      if (next.length) {
        setFrames((prev) => [...prev, ...next]);
        clearReady();
        setPlaying(false);
      }
      setProgress(100);
    } catch {
      setError(t.processError);
    } finally {
      setBusy(false);
      window.setTimeout(() => setProgress(0), 400);
    }
  }

  function removeFrame(id: string) {
    setFrames((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) {
        target.bitmap.close();
        if (target.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(target.previewUrl);
        }
      }
      return prev.filter((f) => f.id !== id);
    });
    clearReady();
  }

  function duplicateFrame(id: string) {
    void (async () => {
      const src = frames.find((f) => f.id === id);
      if (!src) return;
      const cloned = await createImageBitmap(src.bitmap);
      const canvas = document.createElement("canvas");
      canvas.width = cloned.width;
      canvas.height = cloned.height;
      canvas.getContext("2d")?.drawImage(cloned, 0, 0);
      const previewUrl = canvas.toDataURL("image/jpeg", 0.72);
      const copy: SourceFrame = {
        id: nextId(),
        bitmap: cloned,
        label: `${src.label} (copy)`,
        previewUrl,
        delayMs: src.delayMs,
      };
      setFrames((prev) => {
        const idx = prev.findIndex((f) => f.id === id);
        if (idx < 0) {
          cloned.close();
          return prev;
        }
        return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
      });
      clearReady();
    })();
  }

  function moveFrame(fromId: string, toId: string) {
    if (fromId === toId) return;
    setFrames((prev) => {
      const from = prev.findIndex((f) => f.id === fromId);
      const to = prev.findIndex((f) => f.id === toId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      return next;
    });
    clearReady();
  }

  function moveFrameByOffset(id: string, offset: number) {
    setFrames((prev) => {
      const from = prev.findIndex((f) => f.id === id);
      if (from < 0) return prev;
      const to = from + offset;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      return next;
    });
    clearReady();
  }

  function shuffleFrames() {
    setFrames((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = next[i]!;
        next[i] = next[j]!;
        next[j] = tmp;
      }
      return next;
    });
    clearReady();
  }

  function setFrameDelay(id: string, value: string) {
    const n = Number(value);
    setFrames((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              delayMs:
                Number.isFinite(n) && n >= 40
                  ? Math.min(10000, Math.round(n))
                  : undefined,
            }
          : f,
      ),
    );
    clearReady();
  }

  function onDragStart(id: string) {
    setDragId(id);
  }

  function onDragOver(e: ReactDragEvent, id: string) {
    e.preventDefault();
    if (dragId && dragId !== id) e.dataTransfer.dropEffect = "move";
  }

  function onFrameDrop(e: ReactDragEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    const dropped = e.dataTransfer.files;
    if (dropped?.length) {
      setDragId(null);
      void addFiles(dropped);
      return;
    }
    if (dragId) moveFrame(dragId, id);
    setDragId(null);
  }

  function onFilesDrop(e: ReactDragEvent) {
    e.preventDefault();
    setDropActive(false);
    if (e.dataTransfer.files?.length) void addFiles(e.dataTransfer.files);
  }

  function clearAll() {
    setFrames((prev) => {
      for (const f of prev) {
        f.bitmap.close();
        if (f.previewUrl.startsWith("blob:")) URL.revokeObjectURL(f.previewUrl);
      }
      return [];
    });
    clearReady();
    setPlaying(false);
  }

  useEffect(() => {
    if (!playing || frames.length < 1) {
      if (playTimer.current !== null) {
        window.clearInterval(playTimer.current);
        playTimer.current = null;
      }
      return;
    }
    setPreviewIndex(0);
    playTimer.current = window.setInterval(() => {
      setPreviewIndex((i) => (i + 1) % frames.length);
    }, Math.max(80, delayMs));
    return () => {
      if (playTimer.current !== null) window.clearInterval(playTimer.current);
    };
  }, [playing, frames, delayMs]);

  async function exportGif() {
    if (frames.length < 1) {
      setError(t.needFrames);
      return;
    }
    setError(null);
    clearReady();
    setBusy(true);
    setProgress(2);
    cancelRef.current = false;
    try {
      const target = Number(targetDuration.replace(",", "."));
      // Long-edge export sized to the average aspect of all frames.
      // Never upscale past the sharpest source long edge (upscaling makes GIF mush).
      let aspectSum = 0;
      let sourceLongEdge = 0;
      for (const f of frames) {
        aspectSum += f.bitmap.width / Math.max(1, f.bitmap.height);
        sourceLongEdge = Math.max(
          sourceLongEdge,
          f.bitmap.width,
          f.bitmap.height,
        );
      }
      const aspect = aspectSum / frames.length;
      const longEdge = Math.max(
        1,
        Math.min(exportSize, sourceLongEdge || exportSize),
      );
      let outW: number;
      let outH: number;
      if (aspect >= 1) {
        outW = longEdge;
        outH = Math.max(1, Math.round(longEdge / aspect));
      } else {
        outH = longEdge;
        outW = Math.max(1, Math.round(longEdge * aspect));
      }
      outW += outW % 2;
      outH += outH % 2;

      const sized = await buildAnimatedFrames({
        frames,
        width: outW,
        height: outH,
        delayMs,
        fit,
        background,
        transition,
        transitionMs,
        transitionSteps,
        pingPong,
        reverse,
        loopFade,
        targetDurationSec:
          Number.isFinite(target) && target > 0 ? target : null,
        onProgress: (r) => {
          if (!cancelRef.current) setProgress(Math.round(r * 92));
        },
      });

      if (cancelRef.current) {
        setError(t.cancelled);
        return;
      }

      const blob = encodeAnimatedGif(sized.frames, {
        width: outW,
        height: outH,
        loops,
      });
      setProgress(100);
      const previewUrl = URL.createObjectURL(blob);
      const seconds = (sized.totalMs / 1000).toFixed(1);
      setReady({
        blob,
        filename: `animation-${outW}x${outH}.gif`,
        info: t.readyInfo
          .replace("{size}", formatBytes(blob.size))
          .replace("{frames}", String(sized.frames.length))
          .replace("{seconds}", seconds)
          .replace("{px}", String(exportSize)),
        previewUrl,
      });
    } catch {
      setError(t.processError);
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    cancelRef.current = true;
    setBusy(false);
    setProgress(0);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <p className="text-sm text-muted">{t.intro}</p>
      <p className="text-xs text-muted">{t.note}</p>

      <div className="flex flex-wrap gap-3">
        <label className="block min-w-[14rem] flex-1">
          <span className="mb-1.5 block text-sm font-medium">{t.addFiles}</span>
          <input
            type="file"
            accept={ACCEPT}
            multiple
            disabled={busy}
            className={fileInputClass}
            onChange={(e) => {
              // FileList is live — snapshot before clearing the input.
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              void addFiles(files);
            }}
          />
        </label>
        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            disabled={busy || frames.length < 2}
            onClick={shuffleFrames}
            className={secondaryBtnClass}
          >
            {t.shuffle}
          </button>
          <button
            type="button"
            disabled={busy || !frames.length}
            onClick={clearAll}
            className={secondaryBtnClass}
          >
            {t.clearAll}
          </button>
          {busy ? (
            <button type="button" onClick={cancel} className={secondaryBtnClass}>
              {t.cancel}
            </button>
          ) : null}
        </div>
      </div>

      {busy || progress > 0 ? (
        <ProgressBar value={progress} label={busy ? t.working : t.progress} />
      ) : null}

      <ErrorBanner>{error}</ErrorBanner>
      {frames.length > MAX_FRAMES_SOFT ? (
        <p className="text-sm text-muted">
          {t.tooManyFrames.replace("{max}", String(MAX_FRAMES_SOFT))}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">
              {t.framesTitle.replace("{count}", String(frames.length))}
            </h2>
            {frames.length > 0 ? (
              <button
                type="button"
                className={secondaryBtnClass}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? t.stopPreview : t.preview}
              </button>
            ) : null}
          </div>

          {frames.length === 0 ? (
            <div
              className={`flex min-h-[12rem] items-center justify-center rounded-[12px] border border-dashed px-4 text-center text-sm ${
                dropActive
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-border bg-surface text-muted"
              }`}
              onDragEnter={(e) => {
                e.preventDefault();
                setDropActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDropActive(true);
              }}
              onDragLeave={() => setDropActive(false)}
              onDrop={onFilesDrop}
            >
              {t.dropHint}
            </div>
          ) : (
            <ul
              className={`grid grid-cols-2 gap-3 rounded-[12px] sm:grid-cols-3 ${
                dropActive ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""
              }`}
              onDragEnter={(e) => {
                if (e.dataTransfer.types.includes("Files")) {
                  e.preventDefault();
                  setDropActive(true);
                }
              }}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes("Files")) {
                  e.preventDefault();
                  setDropActive(true);
                }
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                  setDropActive(false);
                }
              }}
              onDrop={onFilesDrop}
            >
              {frames.map((frame, index) => (
                <li
                  key={frame.id}
                  draggable={!busy}
                  onDragStart={() => onDragStart(frame.id)}
                  onDragOver={(e) => onDragOver(e, frame.id)}
                  onDrop={(e) => onFrameDrop(e, frame.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`overflow-hidden rounded-[12px] border bg-surface ${
                    dragId === frame.id
                      ? "border-accent opacity-70"
                      : playing && previewIndex === index
                        ? "border-accent"
                        : "border-border"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={frame.previewUrl}
                    alt=""
                    className="aspect-square w-full object-cover"
                    draggable={false}
                  />
                  <div className="space-y-2 p-2">
                    <p className="truncate text-xs text-muted">
                      #{index + 1} · {frame.label}
                    </p>
                    <label className="flex items-center gap-1.5 text-xs text-muted">
                      <input
                        type="number"
                        min={40}
                        max={10000}
                        step={10}
                        disabled={busy}
                        placeholder={String(delayMs)}
                        value={frame.delayMs ?? ""}
                        onChange={(e) => setFrameDelay(frame.id, e.target.value)}
                        className="kit-field w-full rounded-[8px] border border-border bg-background px-2 py-1.5 text-xs"
                      />
                      <span className="shrink-0">{t.frameDelay}</span>
                    </label>
                    <div className="kit-h-scroll gap-1.5">
                      <button
                        type="button"
                        className="kit-touch-target rounded-[8px] border border-border px-3 py-2 text-xs font-medium disabled:opacity-40 sm:min-h-0 sm:px-2 sm:py-1"
                        onClick={() => moveFrameByOffset(frame.id, -1)}
                        disabled={busy || index === 0}
                      >
                        {t.moveUp}
                      </button>
                      <button
                        type="button"
                        className="kit-touch-target rounded-[8px] border border-border px-3 py-2 text-xs font-medium disabled:opacity-40 sm:min-h-0 sm:px-2 sm:py-1"
                        onClick={() => moveFrameByOffset(frame.id, 1)}
                        disabled={busy || index === frames.length - 1}
                      >
                        {t.moveDown}
                      </button>
                      <button
                        type="button"
                        className="kit-touch-target rounded-[8px] border border-border px-3 py-2 text-xs font-medium disabled:opacity-40 sm:min-h-0 sm:px-2 sm:py-1"
                        onClick={() => duplicateFrame(frame.id)}
                        disabled={busy}
                      >
                        {t.duplicate}
                      </button>
                      <button
                        type="button"
                        className="kit-touch-target rounded-[8px] border border-border px-3 py-2 text-xs font-medium disabled:opacity-40 sm:min-h-0 sm:px-2 sm:py-1"
                        onClick={() => removeFrame(frame.id)}
                        disabled={busy}
                      >
                        {t.remove}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4 rounded-[12px] border border-border bg-surface p-4">
          <h2 className="text-sm font-medium">{t.settings}</h2>

          <Field label={t.delayMs} hint={t.delayHint}>
            <KitInput
              type="number"
              min={40}
              max={10000}
              step={10}
              value={delayMs}
              onChange={(e) => setDelayMs(Number(e.target.value) || 500)}
            />
          </Field>

          <Field label={t.exportSize} hint={t.exportSizeHint}>
            <Segmented
              value={String(exportSize) as `${ExportSize}`}
              ariaLabel={t.exportSize}
              options={EXPORT_SIZES.map((n) => ({
                id: String(n) as `${ExportSize}`,
                label: `${n}px`,
              }))}
              onChange={(id) => {
                const next = EXPORT_SIZES.find((n) => String(n) === id);
                if (next) setExportSize(next);
              }}
            />
          </Field>
          {exportSize >= 1080 ? (
            <p className="text-xs text-muted">{t.largeExportHint}</p>
          ) : null}

          <Field label={t.fit}>
            <Segmented
              value={fit}
              ariaLabel={t.fit}
              options={[
                { id: "contain", label: t.fitContain },
                { id: "cover", label: t.fitCover },
                { id: "stretch", label: t.fitStretch },
              ]}
              onChange={(id) => setFit(id)}
            />
          </Field>

          <Field label={t.background}>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-[8px] border border-border bg-surface"
              />
              <KitInput
                value={background}
                onChange={(e) => setBackground(e.target.value)}
              />
            </div>
          </Field>

          <Field label={t.transition}>
            <KitSelect
              value={transition}
              onChange={(e) => setTransition(e.target.value as TransitionKind)}
            >
              <option value="none">{t.transitionNone}</option>
              <option value="crossfade">{t.transitionCrossfade}</option>
              <option value="fadeBlack">{t.transitionFadeBlack}</option>
            </KitSelect>
          </Field>

          {transition !== "none" ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t.transitionMs}>
                  <KitInput
                    type="number"
                    min={50}
                    max={3000}
                    step={50}
                    value={transitionMs}
                    onChange={(e) =>
                      setTransitionMs(Number(e.target.value) || 350)
                    }
                  />
                </Field>
                <Field label={t.transitionSteps}>
                  <KitInput
                    type="number"
                    min={2}
                    max={12}
                    value={transitionSteps}
                    onChange={(e) =>
                      setTransitionSteps(Number(e.target.value) || 6)
                    }
                  />
                </Field>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={loopFade}
                  onChange={(e) => setLoopFade(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
                />
                <span>
                  <span className="block font-medium text-foreground">
                    {t.loopFade}
                  </span>
                  <span className="block text-xs text-muted">{t.loopFadeHint}</span>
                </span>
              </label>
            </div>
          ) : null}

          <Field label={t.targetDuration} hint={t.targetDurationHint}>
            <KitInput
              inputMode="decimal"
              placeholder="e.g. 3"
              value={targetDuration}
              onChange={(e) => setTargetDuration(e.target.value)}
            />
          </Field>

          <Field label={t.loops} hint={t.loopsHint}>
            <KitInput
              type="number"
              min={0}
              max={100}
              value={loops}
              onChange={(e) => setLoops(Math.max(0, Number(e.target.value) || 0))}
            />
          </Field>

          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={pingPong}
                onChange={(e) => setPingPong(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              {t.pingPong}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={reverse}
                onChange={(e) => setReverse(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              {t.reverse}
            </label>
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              {t.videoSection}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.videoFps} hint={t.videoFpsHint}>
                <KitInput
                  type="number"
                  min={1}
                  max={24}
                  value={videoFps}
                  onChange={(e) => setVideoFps(Number(e.target.value) || 8)}
                />
              </Field>
              <Field label={t.videoMaxFrames}>
                <KitInput
                  type="number"
                  min={4}
                  max={120}
                  value={videoMaxFrames}
                  onChange={(e) =>
                    setVideoMaxFrames(Number(e.target.value) || 48)
                  }
                />
              </Field>
            </div>
          </div>

          <p className="text-xs text-muted">
            {t.estimate.replace(
              "{seconds}",
              frames.length ? (estimatedMs / 1000).toFixed(1) : "—",
            )}
          </p>

          <button
            type="button"
            disabled={busy || frames.length < 1}
            onClick={() => void exportGif()}
            className={`${primaryBtnClass} w-full`}
          >
            {t.export}
          </button>
        </section>
      </div>

      {ready ? (
        <section className="space-y-3 rounded-[12px] border border-border bg-surface p-4">
          <p className="text-sm font-medium text-foreground">{ready.info}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ready.previewUrl}
            alt=""
            className="mx-auto max-h-80 max-w-full rounded-[8px] border border-border"
          />
          <button
            type="button"
            className={primaryBtnClass}
            onClick={() => downloadBlob(ready.blob, ready.filename)}
          >
            {t.download}
          </button>
        </section>
      ) : null}
    </div>
  );
}
