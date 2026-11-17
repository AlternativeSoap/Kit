import type { AnimatedGifFrame } from "./encodeAnimatedGif";

export type FitMode = "contain" | "cover" | "stretch";
export type TransitionKind = "none" | "crossfade" | "fadeBlack";

export type SourceFrame = {
  id: string;
  /** Decoded bitmap for rendering */
  bitmap: ImageBitmap;
  /** Optional per-frame delay override in ms */
  delayMs?: number;
  label: string;
  previewUrl: string;
};

export function drawFitted(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sw: number,
  sh: number,
  dw: number,
  dh: number,
  fit: FitMode,
  background: string,
) {
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, dw, dh);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (fit === "stretch") {
    ctx.drawImage(source, 0, 0, sw, sh, 0, 0, dw, dh);
    return;
  }

  const scale =
    fit === "cover"
      ? Math.max(dw / sw, dh / sh)
      : Math.min(dw / sw, dh / sh);
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const x = Math.round((dw - w) / 2);
  const y = Math.round((dh - h) / 2);
  ctx.drawImage(source, 0, 0, sw, sh, x, y, w, h);
}

function canvasToFrameData(canvas: HTMLCanvasElement): Uint8ClampedArray {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas not available");
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}

function blendFrames(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
  t: number,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(a.length);
  const u = 1 - t;
  for (let i = 0; i < a.length; i += 4) {
    out[i] = a[i]! * u + b[i]! * t;
    out[i + 1] = a[i + 1]! * u + b[i + 1]! * t;
    out[i + 2] = a[i + 2]! * u + b[i + 2]! * t;
    out[i + 3] = a[i + 3]! * u + b[i + 3]! * t;
  }
  return out;
}

function fadeToColor(
  src: Uint8ClampedArray,
  t: number,
  rgb: [number, number, number],
  toBlack: boolean,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(src.length);
  const [cr, cg, cb] = rgb;
  // toBlack true: 0→0.5 fade out to color, 0.5→1 fade in from color uses other frame
  const amount = toBlack ? Math.min(1, t * 2) : Math.min(1, (1 - t) * 2);
  const u = 1 - amount;
  for (let i = 0; i < src.length; i += 4) {
    out[i] = src[i]! * u + cr * amount;
    out[i + 1] = src[i + 1]! * u + cg * amount;
    out[i + 2] = src[i + 2]! * u + cb * amount;
    out[i + 3] = 255;
  }
  return out;
}

export type BuildGifInput = {
  frames: SourceFrame[];
  width: number;
  height: number;
  delayMs: number;
  fit: FitMode;
  background: string;
  transition: TransitionKind;
  /** Extra ms spent on each transition (split across intermediate frames). */
  transitionMs: number;
  /** Intermediate frames per transition (2–12). */
  transitionSteps: number;
  pingPong: boolean;
  reverse: boolean;
  targetDurationSec: number | null;
  onProgress?: (ratio: number) => void;
};

export async function buildAnimatedFrames(
  input: BuildGifInput,
): Promise<{ frames: AnimatedGifFrame[]; totalMs: number }> {
  const {
    width,
    height,
    delayMs,
    fit,
    background,
    transition,
    transitionMs,
    transitionSteps,
    pingPong,
    reverse,
    targetDurationSec,
    onProgress,
  } = input;

  let sources = [...input.frames];
  if (reverse) sources = sources.reverse();
  if (pingPong && sources.length > 1) {
    sources = [...sources, ...sources.slice(1, -1).reverse()];
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas not available");

  const rendered: Uint8ClampedArray[] = [];
  for (let i = 0; i < sources.length; i++) {
    const frame = sources[i]!;
    drawFitted(
      ctx,
      frame.bitmap,
      frame.bitmap.width,
      frame.bitmap.height,
      width,
      height,
      fit,
      background,
    );
    rendered.push(new Uint8ClampedArray(canvasToFrameData(canvas)));
    onProgress?.(0.15 + (0.35 * (i + 1)) / sources.length);
    await yieldFrame();
  }

  const steps = Math.max(2, Math.min(12, transitionSteps));
  const out: AnimatedGifFrame[] = [];

  for (let i = 0; i < rendered.length; i++) {
    const delay = sources[i]!.delayMs ?? delayMs;
    out.push({ data: rendered[i]!, delayMs: delay });

    if (transition === "none" || i === rendered.length - 1) continue;
    const next = rendered[i + 1]!;
    const cur = rendered[i]!;
    const stepDelay = Math.max(20, Math.round(transitionMs / steps));

    for (let s = 1; s <= steps; s++) {
      const t = s / (steps + 1);
      let data: Uint8ClampedArray;
      if (transition === "crossfade") {
        data = blendFrames(cur, next, t);
      } else {
        // fade through black: first half fade out, second half fade in
        if (t < 0.5) {
          data = fadeToColor(cur, t, [0, 0, 0], true);
        } else {
          data = fadeToColor(next, t, [0, 0, 0], false);
        }
      }
      out.push({ data, delayMs: stepDelay });
    }
    onProgress?.(0.5 + (0.35 * (i + 1)) / rendered.length);
    await yieldFrame();
  }

  if (targetDurationSec !== null && targetDurationSec > 0 && out.length) {
    const current = out.reduce((sum, f) => sum + f.delayMs, 0);
    const target = targetDurationSec * 1000;
    const scale = target / current;
    for (const frame of out) {
      frame.delayMs = Math.max(20, Math.round(frame.delayMs * scale));
    }
  }

  const totalMs = out.reduce((sum, f) => sum + f.delayMs, 0);
  onProgress?.(0.9);
  return { frames: out, totalMs };
}

function yieldFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

/** Sample frames from a video file at a target fps, capped by maxFrames. */
export async function extractVideoFrames(
  file: File,
  options: {
    fps: number;
    maxFrames: number;
    /** Max long edge while sampling (keeps quality, reduces work). */
    maxEdge: number;
    onProgress?: (ratio: number) => void;
  },
): Promise<{ bitmaps: ImageBitmap[]; labels: string[] }> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Video load failed"));
    });

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (duration <= 0) throw new Error("Video has no duration");

    const fps = Math.max(1, Math.min(24, options.fps));
    const idealCount = Math.floor(duration * fps);
    const count = Math.max(1, Math.min(options.maxFrames, idealCount || 1));
    const step = duration / count;

    const vw = video.videoWidth || 1;
    const vh = video.videoHeight || 1;
    const scale = Math.min(1, options.maxEdge / Math.max(vw, vh));
    const tw = Math.max(1, Math.round(vw * scale));
    const th = Math.max(1, Math.round(vh * scale));

    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");

    const bitmaps: ImageBitmap[] = [];
    const labels: string[] = [];

    for (let i = 0; i < count; i++) {
      const t = Math.min(duration - 0.001, i * step);
      await seekVideo(video, t);
      ctx.drawImage(video, 0, 0, tw, th);
      const bitmap = await createImageBitmap(canvas);
      bitmaps.push(bitmap);
      labels.push(`${file.name} @ ${t.toFixed(1)}s`);
      options.onProgress?.((i + 1) / count);
    }

    return { bitmaps, labels };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Seek failed"));
    };
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    try {
      video.currentTime = time;
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}
