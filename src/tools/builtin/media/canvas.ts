/** Local-only image helpers (Canvas). Never uploads. */

export type ImageFormat = "image/png" | "image/jpeg" | "image/webp";

export function loadImageFromFile(
  file: File,
): Promise<{ img: HTMLImageElement; objectUrl: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, objectUrl });
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load image"));
    };
    img.src = objectUrl;
  });
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

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: ImageFormat,
  quality = 0.92,
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

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export async function compressToTarget(
  img: HTMLImageElement,
  type: ImageFormat,
  maxBytes: number,
  onProgress?: (ratio: number) => void,
): Promise<{ blob: Blob; quality: number }> {
  let low = 0.1;
  let high = 0.95;
  let best: Blob | null = null;
  let bestQ = 0.8;
  const steps = 8;
  const canvas = drawToCanvas(img, img.naturalWidth, img.naturalHeight);
  onProgress?.(0.05);
  for (let i = 0; i < steps; i++) {
    const q = (low + high) / 2;
    const blob = await canvasToBlob(canvas, type, q);
    if (blob.size <= maxBytes) {
      best = blob;
      bestQ = q;
      low = q;
    } else {
      high = q;
    }
    onProgress?.((i + 1) / (steps + 1));
  }
  if (!best) {
    best = await canvasToBlob(canvas, type, 0.1);
    bestQ = 0.1;
  }
  onProgress?.(1);
  return { blob: best, quality: bestQ };
}
