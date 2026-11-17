import { describe, expect, it } from "vitest";
import { encodeAnimatedGif } from "./encodeAnimatedGif";

function solidFrame(
  w: number,
  h: number,
  rgba: [number, number, number, number],
  delayMs: number,
) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = rgba[0];
    data[i + 1] = rgba[1];
    data[i + 2] = rgba[2];
    data[i + 3] = rgba[3];
  }
  return { data, delayMs };
}

describe("encodeAnimatedGif", () => {
  it("writes a GIF89a header and trailer", async () => {
    const blob = encodeAnimatedGif(
      [
        solidFrame(8, 8, [255, 0, 0, 255], 200),
        solidFrame(8, 8, [0, 0, 255, 255], 200),
      ],
      { width: 8, height: 8, loops: 0 },
    );
    expect(blob.type).toBe("image/gif");
    const bytes = new Uint8Array(await blob.arrayBuffer());
    expect(String.fromCharCode(...bytes.slice(0, 6))).toBe("GIF89a");
    expect(bytes[bytes.length - 1]).toBe(0x3b);
    expect(bytes.length).toBeGreaterThan(100);
  });
});
