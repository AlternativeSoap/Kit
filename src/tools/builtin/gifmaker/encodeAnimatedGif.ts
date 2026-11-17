/** Multi-frame GIF89a encoder (local only). */

export type AnimatedGifFrame = {
  /** RGBA pixel buffer, length = width * height * 4 */
  data: Uint8ClampedArray;
  /** Frame delay in milliseconds (clamped to GIF centiseconds). */
  delayMs: number;
};

export type EncodeAnimatedGifOptions = {
  width: number;
  height: number;
  /** 0 = loop forever */
  loops?: number;
};

type Rgb = [number, number, number];

function clampByte(n: number): number {
  return n < 0 ? 0 : n > 255 ? 255 : n | 0;
}

function nearestPaletteIndex(
  palette: number[],
  colorCount: number,
  r: number,
  g: number,
  b: number,
  skipIndex = -1,
): number {
  let best = skipIndex === 0 ? 1 : 0;
  let bestDist = Infinity;
  for (let i = 0; i < colorCount; i++) {
    if (i === skipIndex) continue;
    const pr = palette[i * 3]!;
    const pg = palette[i * 3 + 1]!;
    const pb = palette[i * 3 + 2]!;
    const dr = pr - r;
    const dg = pg - g;
    const db = pb - b;
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
      if (dist === 0) break;
    }
  }
  return best;
}

/** Median-cut palette from opaque pixels (samples large frames). */
function buildMedianCutPalette(
  data: Uint8ClampedArray,
  maxColors: number,
): number[] {
  const pixelCount = data.length / 4;
  const sampleStep = Math.max(1, Math.floor(pixelCount / 80_000));
  const samples: Rgb[] = [];

  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    if (data[i + 3]! < 128) continue;
    samples.push([data[i]!, data[i + 1]!, data[i + 2]!]);
  }

  if (!samples.length) {
    return [0, 0, 0];
  }

  type Box = { pixels: Rgb[]; r0: number; r1: number; g0: number; g1: number; b0: number; b1: number };

  function bounds(pixels: Rgb[]): Box {
    let r0 = 255;
    let r1 = 0;
    let g0 = 255;
    let g1 = 0;
    let b0 = 255;
    let b1 = 0;
    for (const [r, g, b] of pixels) {
      if (r < r0) r0 = r;
      if (r > r1) r1 = r;
      if (g < g0) g0 = g;
      if (g > g1) g1 = g;
      if (b < b0) b0 = b;
      if (b > b1) b1 = b;
    }
    return { pixels, r0, r1, g0, g1, b0, b1 };
  }

  function split(box: Box): [Box, Box] | null {
    const { pixels, r0, r1, g0, g1, b0, b1 } = box;
    if (pixels.length < 2) return null;
    const ranges: Array<{ ch: 0 | 1 | 2; span: number }> = [
      { ch: 0, span: r1 - r0 },
      { ch: 1, span: g1 - g0 },
      { ch: 2, span: b1 - b0 },
    ];
    ranges.sort((a, b) => b.span - a.span);
    const channel = ranges[0]!.ch;
    const sorted = [...pixels].sort((a, b) => a[channel]! - b[channel]!);
    const mid = Math.max(1, Math.floor(sorted.length / 2));
    return [bounds(sorted.slice(0, mid)), bounds(sorted.slice(mid))];
  }

  function average(pixels: Rgb[]): Rgb {
    let r = 0;
    let g = 0;
    let b = 0;
    for (const p of pixels) {
      r += p[0];
      g += p[1];
      b += p[2];
    }
    const n = pixels.length || 1;
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
  }

  let boxes: Box[] = [bounds(samples)];
  while (boxes.length < maxColors) {
    let bestIdx = -1;
    let bestScore = -1;
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i]!;
      if (box.pixels.length < 2) continue;
      const score =
        box.pixels.length *
        Math.max(box.r1 - box.r0, box.g1 - box.g0, box.b1 - box.b0);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    if (bestIdx < 0) break;
    const parts = split(boxes[bestIdx]!);
    if (!parts) break;
    boxes.splice(bestIdx, 1, parts[0], parts[1]);
  }

  const palette: number[] = [];
  for (const box of boxes) {
    const [r, g, b] = average(box.pixels);
    palette.push(r, g, b);
  }
  return palette;
}

function quantizeFrame(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): {
  indexes: Uint8Array;
  palette: number[];
  transparentIndex: number;
} {
  let needsTransparency = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i]! < 128) {
      needsTransparency = true;
      break;
    }
  }

  const colorSlots = needsTransparency ? 255 : 256;
  const colorPalette = buildMedianCutPalette(data, colorSlots);
  const palette: number[] = [];
  let transparentIndex = -1;

  if (needsTransparency) {
    transparentIndex = 0;
    palette.push(0, 0, 0);
  }
  for (let i = 0; i < colorPalette.length; i += 3) {
    palette.push(colorPalette[i]!, colorPalette[i + 1]!, colorPalette[i + 2]!);
  }
  const colorCount = Math.max(1, Math.min(256, palette.length / 3));
  while (palette.length < 256 * 3) palette.push(0);
  const indexes = new Uint8Array(width * height);

  // Floyd–Steinberg dithering on a working RGB buffer (opaque pixels only).
  const work = new Float32Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const i = p * 4;
      work[p * 3] = data[i]!;
      work[p * 3 + 1] = data[i + 1]!;
      work[p * 3 + 2] = data[i + 2]!;
    }
  }

  const distribute = (x: number, y: number, er: number, eg: number, eb: number, factor: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const p = y * width + x;
    if (data[p * 4 + 3]! < 128) return;
    const o = p * 3;
    work[o] = work[o]! + er * factor;
    work[o + 1] = work[o + 1]! + eg * factor;
    work[o + 2] = work[o + 2]! + eb * factor;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const i = p * 4;
      if (data[i + 3]! < 128) {
        indexes[p] = transparentIndex >= 0 ? transparentIndex : 0;
        continue;
      }

      const o = p * 3;
      const r = clampByte(work[o]!);
      const g = clampByte(work[o + 1]!);
      const b = clampByte(work[o + 2]!);
      const finalIdx = nearestPaletteIndex(
        palette,
        colorCount,
        r,
        g,
        b,
        transparentIndex,
      );
      indexes[p] = finalIdx;

      const pr = palette[finalIdx * 3]!;
      const pg = palette[finalIdx * 3 + 1]!;
      const pb = palette[finalIdx * 3 + 2]!;
      const er = r - pr;
      const eg = g - pg;
      const eb = b - pb;
      distribute(x + 1, y, er, eg, eb, 7 / 16);
      distribute(x - 1, y + 1, er, eg, eb, 3 / 16);
      distribute(x, y + 1, er, eg, eb, 5 / 16);
      distribute(x + 1, y + 1, er, eg, eb, 1 / 16);
    }
  }

  return { indexes, palette, transparentIndex };
}

function writeLzw(out: number[], indexes: Uint8Array): void {
  const minCodeSize = 8;
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  let nextCode = eoi + 1;
  let codeSize = minCodeSize + 1;
  const maxCode = 4095;

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

  const flushBits = () => {
    if (bitCount > 0) {
      emitByte(bitBuf & 0xff);
      bitBuf = 0;
      bitCount = 0;
    }
  };

  // Dictionary: prefix<<8 | nextByte -> code (prefix is previous code)
  const dict = new Map<number, number>();

  const resetDict = () => {
    dict.clear();
    nextCode = eoi + 1;
    codeSize = minCodeSize + 1;
  };

  out.push(minCodeSize);
  writeCode(clear, codeSize);
  resetDict();

  if (!indexes.length) {
    writeCode(eoi, codeSize);
    flushBits();
    if (block.length) out.push(block.length, ...block);
    out.push(0x00);
    return;
  }

  let prefix = indexes[0]!;
  for (let i = 1; i < indexes.length; i++) {
    const k = indexes[i]!;
    const key = (prefix << 8) | k;
    const existing = dict.get(key);
    if (existing !== undefined) {
      prefix = existing;
      continue;
    }

    writeCode(prefix, codeSize);

    if (nextCode <= maxCode) {
      dict.set(key, nextCode);
      if (nextCode === 1 << codeSize && codeSize < 12) {
        codeSize += 1;
      }
      nextCode += 1;
    } else {
      writeCode(clear, codeSize);
      resetDict();
    }
    prefix = k;
  }

  writeCode(prefix, codeSize);
  writeCode(eoi, codeSize);
  flushBits();
  if (block.length) out.push(block.length, ...block);
  out.push(0x00);
}

/** Encode an animated GIF from same-sized RGBA frames. */
export function encodeAnimatedGif(
  frames: AnimatedGifFrame[],
  options: EncodeAnimatedGifOptions,
): Blob {
  if (!frames.length) throw new Error("No frames");
  const { width, height } = options;
  const loops = options.loops ?? 0;
  const out: number[] = [];
  const w = (n: number) => out.push(n & 0xff);
  const w16 = (n: number) => {
    w(n);
    w(n >> 8);
  };

  // Header + logical screen (no global color table; each frame has a local one).
  out.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61); // GIF89a
  w16(width);
  w16(height);
  w(0x70); // no GCT, color resolution 7
  w(0x00);
  w(0x00);

  // Netscape loop extension
  out.push(
    0x21,
    0xff,
    0x0b,
    0x4e,
    0x45,
    0x54,
    0x53,
    0x43,
    0x41,
    0x50,
    0x45,
    0x32,
    0x2e,
    0x30,
    0x03,
    0x01,
  );
  w16(Math.max(0, Math.min(0xffff, loops)));
  out.push(0x00);

  for (const frame of frames) {
    if (frame.data.length !== width * height * 4) {
      throw new Error("Frame size mismatch");
    }
    const { indexes, palette, transparentIndex } = quantizeFrame(
      frame.data,
      width,
      height,
    );
    const delayCs = Math.max(
      2,
      Math.min(0xffff, Math.round(frame.delayMs / 10)),
    );

    // Graphic Control Extension
    const packed =
      (transparentIndex >= 0 ? 0x01 : 0x00) | // transparent
      (0x01 << 2); // disposal: do not dispose (keeps sharpness between frames)
    out.push(0x21, 0xf9, 0x04, packed);
    w16(delayCs);
    w(transparentIndex >= 0 ? transparentIndex : 0);
    out.push(0x00);

    // Image Descriptor + local color table (256 colors)
    out.push(0x2c);
    w16(0);
    w16(0);
    w16(width);
    w16(height);
    w(0x87); // local color table, 8-bit
    for (const c of palette) w(c);

    writeLzw(out, indexes);
  }

  out.push(0x3b);
  return new Blob([new Uint8Array(out)], { type: "image/gif" });
}
