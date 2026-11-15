import { qrcodegen } from "./qrcodegen";

const { QrCode } = qrcodegen;

export const QR_MAX_TEXT = 2000;
export const QR_DEFAULT_MARGIN = 2;
export const QR_DEFAULT_SCALE = 5;

export function encodeQr(text: string): qrcodegen.QrCode | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > QR_MAX_TEXT) return null;
  try {
    return QrCode.encodeText(trimmed, QrCode.Ecc.MEDIUM);
  } catch {
    return null;
  }
}

export function drawQrOnCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  scale = QR_DEFAULT_SCALE,
  margin = QR_DEFAULT_MARGIN,
): boolean {
  const qr = encodeQr(text);
  if (!qr) return false;
  const modules = qr.size;
  const pixels = (modules + margin * 2) * scale;
  canvas.width = pixels;
  canvas.height = pixels;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, pixels, pixels);
  ctx.fillStyle = "#000000";
  for (let y = 0; y < modules; y += 1) {
    for (let x = 0; x < modules; x += 1) {
      if (qr.getModule(x, y)) {
        ctx.fillRect((x + margin) * scale, (y + margin) * scale, scale, scale);
      }
    }
  }
  return true;
}

export function canvasPngDataUrl(canvas: HTMLCanvasElement): string | null {
  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}