/** Local-only image helpers (Canvas). Never uploads. */

import { importFromUrl } from "@/lib/cdnImport";

export type ImageFormat =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/bmp"
  | "image/gif"
  | "image/x-icon";

export const LOSSY_FORMATS: ImageFormat[] = ["image/jpeg", "image/webp"];

export const ALL_EXPORT_FORMATS: ImageFormat[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/bmp",
  "image/gif",
  "image/x-icon",
];

const HEIC2ANY_URL = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/+esm";

const encodeSupportCache = new Map<string, boolean>();

function isHeicFile(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

export function extensionForFormat(fmt: ImageFormat): string {
  switch (fmt) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/bmp":
      return "bmp";
    case "image/gif":
      return "gif";
    case "image/x-icon":
      return "ico";
  }
}

export function formatFromMimeOrName(
  mime: string,
  name = "",
): ImageFormat | null {
  const type = mime.toLowerCase();
  const lower = name.toLowerCase();
  if (type === "image/png" || lower.endsWith(".png")) return "image/png";
  if (
    type === "image/jpeg" ||
    type === "image/jpg" ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg")
  ) {
    return "image/jpeg";
  }
  if (type === "image/webp" || lower.endsWith(".webp")) return "image/webp";
  if (type === "image/bmp" || type === "image/x-ms-bmp" || lower.endsWith(".bmp")) {
    return "image/bmp";
  }
  if (type === "image/gif" || lower.endsWith(".gif")) return "image/gif";
  if (
    type === "image/x-icon" ||
    type === "image/vnd.microsoft.icon" ||
    lower.endsWith(".ico")
  ) {
    return "image/x-icon";
  }
  return null;
}

export async function canEncodeFormat(type: ImageFormat): Promise<boolean> {
  if (type === "image/png" || type === "image/jpeg") return true;
  if (type === "image/bmp" || type === "image/gif" || type === "image/x-icon") {
    return true;
  }
  const cached = encodeSupportCache.get(type);
  if (cached !== undefined) return cached;
  const supported = await new Promise<boolean>((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    canvas.toBlob((blob) => {
      resolve(Boolean(blob && blob.type === type));
    }, type, 0.8);
  });
  encodeSupportCache.set(type, supported);
  return supported;
}

async function decodeHeicToBlob(file: File): Promise<Blob> {
  const mod = await importFromUrl<
    | ((opts: {
        blob: Blob;
        toType?: string;
        quality?: number;
      }) => Promise<Blob | Blob[]>)
    | {
        default: (opts: {
          blob: Blob;
          toType?: string;
          quality?: number;
        }) => Promise<Blob | Blob[]>;
      }
  >(HEIC2ANY_URL);
  const heic2any = typeof mod === "function" ? mod : mod.default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });
  const blob = Array.isArray(result) ? result[0] : result;
  if (!blob) throw new Error("HEIC conversion failed");
  return blob;
}

function loadHtmlImage(
  src: string,
): Promise<{ img: HTMLImageElement; objectUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ img, objectUrl: src });
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

async function bitmapToImage(
  bitmap: ImageBitmap,
): Promise<{ img: HTMLImageElement; objectUrl: string }> {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await canvasToNativeBlob(canvas, "image/png");
  const objectUrl = URL.createObjectURL(blob);
  try {
    return await loadHtmlImage(objectUrl);
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

export async function loadImageFromFile(
  file: File,
): Promise<{ img: HTMLImageElement; objectUrl: string }> {
  let source: Blob = file;

  if (isHeicFile(file)) {
    try {
      source = await decodeHeicToBlob(file);
    } catch {
      // Fall through to native decode (Safari often handles HEIC).
    }
  }

  const objectUrl = URL.createObjectURL(source);
  try {
    return await loadHtmlImage(objectUrl);
  } catch {
    URL.revokeObjectURL(objectUrl);
  }

  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(source);
      return bitmapToImage(bitmap);
    } catch {
      // Fall through.
    }
  }

  throw new Error("Could not load image");
}

export function drawToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function cropImage(
  img: HTMLImageElement,
  crop: { x: number; y: number; w: number; h: number },
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const w = Math.max(1, Math.round(crop.w));
  const h = Math.max(1, Math.round(crop.h));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, w, h);
  return canvas;
}

export function rotateImage(
  img: HTMLImageElement,
  degrees: 90 | 180 | 270 | number,
  flipH = false,
  flipV = false,
): HTMLCanvasElement {
  const rad = (degrees * Math.PI) / 180;
  const swap = Math.abs(degrees) % 180 === 90;
  const w = swap ? img.naturalHeight : img.naturalWidth;
  const h = swap ? img.naturalWidth : img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rad);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  return canvas;
}

function encodeBmp(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  const { width, height } = canvas;
  const image = ctx.getImageData(0, 0, width, height);
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelBytes = rowSize * height;
  const headerSize = 54;
  const buffer = new ArrayBuffer(headerSize + pixelBytes);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint8(0, 0x42); // B
  view.setUint8(1, 0x4d); // M
  view.setUint32(2, headerSize + pixelBytes, true);
  view.setUint32(10, headerSize, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, -height, true); // top-down
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, pixelBytes, true);

  let offset = headerSize;
  const data = image.data;
  for (let y = 0; y < height; y++) {
    let rowOffset = offset;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      bytes[rowOffset++] = data[i + 2]!; // B
      bytes[rowOffset++] = data[i + 1]!; // G
      bytes[rowOffset++] = data[i]!; // R
    }
    offset += rowSize;
  }

  return new Blob([buffer], { type: "image/bmp" });
}

const GIF_MAX_PIXELS = 2_000_000;
const GIF_MAX_EDGE = 1600;

/** Large canvases make the GIF encoder slow and heavy, so scale them down first. */
function limitGifSize(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const { width, height } = canvas;
  if (width * height <= GIF_MAX_PIXELS) return canvas;
  const scale = GIF_MAX_EDGE / Math.max(width, height);
  if (scale >= 1) return canvas;
  return drawToCanvas(canvas, width * scale, height * scale);
}

/** Single-frame GIF89a with a 256-color palette (no animation). */
function encodeGif(source: HTMLCanvasElement): Blob {
  const canvas = limitGifSize(source);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  const { width, height } = canvas;
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;

  const palette: number[] = [];
  const colorIndex = new Map<number, number>();
  const indexes = new Uint8Array(width * height);
  let transparentIndex = -1;

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const a = data[i + 3]!;
    if (a < 128) {
      if (transparentIndex < 0) {
        transparentIndex = palette.length / 3;
        palette.push(0, 0, 0);
      }
      indexes[p] = transparentIndex;
      continue;
    }
    // Quantize slightly so photos fit the 256-color budget.
    const qr = r & 0xf8;
    const qg = g & 0xf8;
    const qb = b & 0xfc;
    const key = (qr << 16) | (qg << 8) | qb;
    let idx = colorIndex.get(key);
    if (idx === undefined) {
      if (palette.length / 3 >= 255) {
        idx = nearestPaletteIndex(palette, qr, qg, qb);
      } else {
        idx = palette.length / 3;
        colorIndex.set(key, idx);
        palette.push(qr, qg, qb);
      }
    }
    indexes[p] = idx;
  }

  while (palette.length < 256 * 3) palette.push(0);

  const out: number[] = [];
  const w = (n: number) => out.push(n & 0xff);
  const w16 = (n: number) => {
    w(n);
    w(n >> 8);
  };

  out.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61); // GIF89a
  w16(width);
  w16(height);
  w(0xf7); // GCT flag, 8-bit
  w(0x00);
  w(0x00);
  for (const c of palette) w(c);

  if (transparentIndex >= 0) {
    out.push(0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, transparentIndex & 0xff, 0x00);
  }

  out.push(0x2c, 0x00, 0x00, 0x00, 0x00);
  w16(width);
  w16(height);
  w(0x00);
  w(0x08); // LZW min code size

  // Uncompressed LZW: clear + index codes + end, reset with clear often.
  const clear = 256;
  const end = 257;
  let bitBuf = 0;
  let bitCount = 0;
  const block: number[] = [];
  const emitByte = (byte: number) => {
    block.push(byte);
    if (block.length === 255) {
      out.push(255, ...block);
      block.length = 0;
    }
  };
  const writeCode = (code: number, size: number) => {
    bitBuf |= code << bitCount;
    bitCount += size;
    while (bitCount >= 8) {
      emitByte(bitBuf & 0xff);
      bitBuf >>= 8;
      bitCount -= 8;
    }
  };

  writeCode(clear, 9);
  for (let i = 0; i < indexes.length; i++) {
    writeCode(indexes[i]!, 9);
    if ((i + 1) % 120 === 0) writeCode(clear, 9);
  }
  writeCode(end, 9);
  if (bitCount > 0) emitByte(bitBuf & 0xff);
  if (block.length) {
    out.push(block.length, ...block);
  }
  out.push(0x00, 0x3b);

  return new Blob([new Uint8Array(out)], { type: "image/gif" });
}

function nearestPaletteIndex(
  palette: number[],
  r: number,
  g: number,
  b: number,
): number {
  let best = 0;
  let bestDist = Infinity;
  const count = Math.min(255, palette.length / 3);
  for (let i = 0; i < count; i++) {
    const pr = palette[i * 3]!;
    const pg = palette[i * 3 + 1]!;
    const pb = palette[i * 3 + 2]!;
    const dist = (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

const ICO_MAX_SIZE = 256;

/** Fits the image inside a transparent 256x256 square when either side is larger. */
function containInIcoSquare(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const { width, height } = canvas;
  if (width <= ICO_MAX_SIZE && height <= ICO_MAX_SIZE) return canvas;
  const scale = Math.min(ICO_MAX_SIZE / width, ICO_MAX_SIZE / height);
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const square = document.createElement("canvas");
  square.width = ICO_MAX_SIZE;
  square.height = ICO_MAX_SIZE;
  const ctx = square.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    canvas,
    Math.floor((ICO_MAX_SIZE - w) / 2),
    Math.floor((ICO_MAX_SIZE - h) / 2),
    w,
    h,
  );
  return square;
}

async function encodeIco(source: HTMLCanvasElement): Promise<Blob> {
  const canvas = containInIcoSquare(source);
  const pngBlob = await canvasToNativeBlob(canvas, "image/png");
  const png = new Uint8Array(await pngBlob.arrayBuffer());
  const header = new ArrayBuffer(22);
  const view = new DataView(header);
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // icon
  view.setUint16(4, 1, true); // count
  // A value of 0 means 256 pixels in the ICO directory.
  view.setUint8(6, canvas.width >= 256 ? 0 : canvas.width);
  view.setUint8(7, canvas.height >= 256 ? 0 : canvas.height);
  view.setUint8(8, 0);
  view.setUint8(9, 0);
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, png.byteLength, true);
  view.setUint32(18, 22, true);
  const out = new Uint8Array(22 + png.byteLength);
  out.set(new Uint8Array(header), 0);
  out.set(png, 22);
  return new Blob([out], { type: "image/x-icon" });
}

function canvasToNativeBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Export failed"));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

/** Opaque formats treat missing alpha as black; paint white first. */
function withWhiteBackground(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const filled = document.createElement("canvas");
  filled.width = canvas.width;
  filled.height = canvas.height;
  const ctx = filled.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, filled.width, filled.height);
  ctx.drawImage(canvas, 0, 0);
  return filled;
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: ImageFormat,
  quality = 0.92,
): Promise<Blob> {
  const source =
    type === "image/jpeg" || type === "image/bmp"
      ? withWhiteBackground(canvas)
      : canvas;
  if (type === "image/bmp") return encodeBmp(source);
  if (type === "image/gif") return encodeGif(source);
  if (type === "image/x-icon") return encodeIco(source);

  const blob = await canvasToNativeBlob(
    source,
    type,
    type === "image/png" ? undefined : quality,
  );
  if (blob.type !== type && type !== "image/png") {
    throw new Error(`Browser cannot encode ${type}`);
  }
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Delay revoke so mobile Safari can start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

export function downloadTextFile(
  text: string,
  filename: string,
  mime = "text/plain;charset=utf-8",
) {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

const COMPRESS_MIN_QUALITY = 0.1;
const COMPRESS_SCALES = [0.85, 0.7, 0.55];

export type CompressResult = {
  blob: Blob;
  /** Quality used for the returned blob, from 0 to 1. */
  quality: number;
  /** False when the output is still larger than the requested limit. */
  metTarget?: boolean;
  /** True when the image was downscaled to get closer to the limit. */
  scaled?: boolean;
};

export async function compressToTarget(
  img: HTMLImageElement,
  type: ImageFormat,
  maxBytes: number,
  onProgress?: (ratio: number) => void,
  /** Highest quality to try, from 0 to 1. */
  maxQuality = 0.95,
): Promise<CompressResult> {
  const lossy: ImageFormat = LOSSY_FORMATS.includes(type) ? type : "image/jpeg";
  const steps = 8;
  const totalAttempts = 1 + COMPRESS_SCALES.length;
  const ceiling = Math.min(1, Math.max(COMPRESS_MIN_QUALITY, maxQuality));

  /** Binary search for the highest quality that fits, or the smallest output when none fits. */
  async function search(
    canvas: HTMLCanvasElement,
    attempt: number,
  ): Promise<{ blob: Blob; quality: number; fits: boolean }> {
    let low = COMPRESS_MIN_QUALITY;
    let high = ceiling;
    let best: Blob | null = null;
    let bestQ = COMPRESS_MIN_QUALITY;
    for (let i = 0; i < steps; i++) {
      const q = (low + high) / 2;
      const blob = await canvasToBlob(canvas, lossy, q);
      if (blob.size <= maxBytes) {
        best = blob;
        bestQ = q;
        low = q;
      } else {
        high = q;
      }
      onProgress?.(Math.min(0.98, (attempt + (i + 1) / (steps + 1)) / totalAttempts));
    }
    if (best) return { blob: best, quality: bestQ, fits: true };
    const floor = await canvasToBlob(canvas, lossy, COMPRESS_MIN_QUALITY);
    return {
      blob: floor,
      quality: COMPRESS_MIN_QUALITY,
      fits: floor.size <= maxBytes,
    };
  }

  onProgress?.(0.02);
  const fullCanvas = drawToCanvas(img, img.naturalWidth, img.naturalHeight);
  let result = await search(fullCanvas, 0);
  if (result.fits) {
    onProgress?.(1);
    return { blob: result.blob, quality: result.quality, metTarget: true, scaled: false };
  }

  let smallest = result;
  let scaled = false;
  for (let s = 0; s < COMPRESS_SCALES.length; s++) {
    const scale = COMPRESS_SCALES[s]!;
    const canvas = drawToCanvas(
      img,
      Math.max(1, img.naturalWidth * scale),
      Math.max(1, img.naturalHeight * scale),
    );
    result = await search(canvas, s + 1);
    if (result.fits) {
      onProgress?.(1);
      return { blob: result.blob, quality: result.quality, metTarget: true, scaled: true };
    }
    if (result.blob.size < smallest.blob.size) {
      smallest = result;
      scaled = true;
    }
  }

  onProgress?.(1);
  return {
    blob: smallest.blob,
    quality: smallest.quality,
    metTarget: false,
    scaled,
  };
}
