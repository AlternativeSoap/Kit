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

function quantizeFrame(data: Uint8ClampedArray): {
  indexes: Uint8Array;
  palette: number[];
  transparentIndex: number;
} {
  const palette: number[] = [];
  const colorIndex = new Map<number, number>();
  const indexes = new Uint8Array(data.length / 4);
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
  return { indexes, palette, transparentIndex };
}

function writeLzw(
  out: number[],
  indexes: Uint8Array,
): void {
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

  out.push(0x08); // LZW min code size
  writeCode(clear, 9);
  for (let i = 0; i < indexes.length; i++) {
    writeCode(indexes[i]!, 9);
    if ((i + 1) % 120 === 0) writeCode(clear, 9);
  }
  writeCode(end, 9);
  if (bitCount > 0) emitByte(bitBuf & 0xff);
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
    const { indexes, palette, transparentIndex } = quantizeFrame(frame.data);
    const delayCs = Math.max(
      2,
      Math.min(0xffff, Math.round(frame.delayMs / 10)),
    );

    // Graphic Control Extension
    const packed =
      (transparentIndex >= 0 ? 0x01 : 0x00) | // transparent
      (0x02 << 2); // disposal: restore to background
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
