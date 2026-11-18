/** Prepare a photo or screenshot so Tesseract can read it more reliably. */

const TARGET_MAX = 2200;
const UPSCALE_BELOW = 1000;

export async function prepareOcrImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  try {
    const srcW = bitmap.width;
    const srcH = bitmap.height;
    if (srcW < 2 || srcH < 2) {
      throw new Error("Image too small");
    }

    const maxSide = Math.max(srcW, srcH);
    let scale = 1;
    if (maxSide < UPSCALE_BELOW) {
      scale = Math.min(3, TARGET_MAX / maxSide);
    } else if (maxSide > TARGET_MAX) {
      scale = TARGET_MAX / maxSide;
    }

    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas unavailable");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);

    const image = ctx.getImageData(0, 0, w, h);
    const data = image.data;

    let min = 255;
    let max = 0;
    for (let i = 0; i < data.length; i += 4) {
      const g =
        0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
      data[i] = data[i + 1] = data[i + 2] = g;
      if (g < min) min = g;
      if (g > max) max = g;
    }

    const range = Math.max(1, max - min);
    for (let i = 0; i < data.length; i += 4) {
      let v = ((data[i]! - min) / range) * 255;
      // Mild S-curve contrast without crushing thin strokes.
      const n = v / 255;
      v = (n < 0.5 ? 2 * n * n : 1 - Math.pow(-2 * n + 2, 2) / 2) * 255;
      v = Math.max(0, Math.min(255, v));
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }

    ctx.putImageData(image, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (next) => (next ? resolve(next) : reject(new Error("Encode failed"))),
        "image/png",
      );
    });
    return blob;
  } finally {
    bitmap.close();
  }
}

/** Normalize OCR output without inventing words. */
export function cleanOcrText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    // Join hyphenated line breaks common in scans: "eks-\nempel" → "eksempel"
    .replace(/(\p{L})-\n(\p{L})/gu, "$1$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
