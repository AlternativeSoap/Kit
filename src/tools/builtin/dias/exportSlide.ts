/** Render Dias slides to PNG (and multi-page PDF via png bytes). */

import { PDFDocument } from "pdf-lib";
import {
  SLIDE_H,
  SLIDE_W,
  type Slide,
  type SlideBlock,
  type SlidesDoc,
} from "./slides";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

async function drawBlock(
  ctx: CanvasRenderingContext2D,
  block: SlideBlock,
): Promise<void> {
  const x = (block.x / 100) * SLIDE_W;
  const y = (block.y / 100) * SLIDE_H;
  const w = (block.w / 100) * SLIDE_W;
  const h = (block.h / 100) * SLIDE_H;

  if (block.kind === "shape") {
    ctx.fillStyle = block.fill ?? "#94a3b8";
    ctx.fillRect(x, y, w, h);
    return;
  }

  if (block.kind === "image" && block.imageDataUrl) {
    try {
      const img = await loadImage(block.imageDataUrl);
      const fit = block.imageFit ?? "contain";
      if (fit === "fill") {
        ctx.drawImage(img, x, y, w, h);
      } else if (fit === "cover") {
        const scale = Math.max(w / img.width, h / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
        ctx.restore();
      } else {
        const scale = Math.min(w / img.width, h / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
      }
    } catch {
      /* skip broken image */
    }
    return;
  }

  const text = block.text ?? "";
  if (!text) return;
  ctx.fillStyle = block.color || "#111";
  ctx.font = `${block.italic ? "italic " : ""}${block.bold ? "700 " : "400 "}${block.fontSize}px ${block.fontFamily}`;
  ctx.textAlign = block.align;
  ctx.textBaseline = "top";
  const textX =
    block.align === "center" ? x + w / 2 : block.align === "right" ? x + w : x;
  const lineHeight = block.fontSize * 1.25;
  const lines = text.split("\n");
  let ty = y + h * 0.04;
  for (const line of lines) {
    if (ty > y + h) break;
    ctx.fillText(line, textX, ty, w * 0.92);
    if (block.underline) {
      const metrics = ctx.measureText(line);
      const underlineY = ty + block.fontSize;
      let ux = textX;
      if (block.align === "center") ux = textX - metrics.width / 2;
      if (block.align === "right") ux = textX - metrics.width;
      ctx.strokeStyle = block.color || "#111";
      ctx.beginPath();
      ctx.moveTo(ux, underlineY);
      ctx.lineTo(ux + metrics.width, underlineY);
      ctx.stroke();
    }
    ty += lineHeight;
  }
}

export async function renderSlideToCanvas(slide: Slide): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = SLIDE_W;
  canvas.height = SLIDE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = slide.background || "#ffffff";
  ctx.fillRect(0, 0, SLIDE_W, SLIDE_H);
  const blocks = [...slide.blocks].sort((a, b) => a.z - b.z);
  for (const block of blocks) {
    await drawBlock(ctx, block);
  }
  return canvas;
}

export async function slideToPngBlob(slide: Slide): Promise<Blob> {
  const canvas = await renderSlideToCanvas(slide);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("png"))),
      "image/png",
    );
  });
}

export async function deckToPdfBytes(doc: SlidesDoc): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (const slide of doc.slides) {
    const png = await slideToPngBlob(slide);
    const bytes = new Uint8Array(await png.arrayBuffer());
    const image = await pdf.embedPng(bytes);
    const page = pdf.addPage([SLIDE_W, SLIDE_H]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: SLIDE_W,
      height: SLIDE_H,
    });
  }
  return pdf.save();
}
