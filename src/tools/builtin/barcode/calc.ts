export type BarcodeMode = "code128" | "ean13";

export type BarcodeResult =
  | { ok: true; svg: string; value: string }
  | { ok: false; error: "empty" | "invalid_chars" | "ean_digits" | "ean_check" };

/** Code 128 patterns: 11 modules each (BWBWBW), indexed 0–106. */
const CODE128_PATTERNS: readonly string[] = [
  "11011001100", "11001101100", "11001100110", "10010011000", "10010001100",
  "10001001100", "10011001000", "10011000100", "10001100100", "11001001000",
  "11001000100", "11000100100", "10110011100", "10011011100", "10011001110",
  "10111001100", "10011101100", "10011100110", "11001110010", "11001011100",
  "11001001110", "11011100100", "11001110100", "11101101110", "11101001100",
  "11100101100", "11100100110", "11101100100", "11100110100", "11100110010",
  "11011011000", "11011000110", "11000110110", "10100011000", "10001011000",
  "10001000110", "10110001000", "10001101000", "10001100010", "11010001000",
  "11000101000", "11000100010", "10110111000", "10110001110", "10001101110",
  "10111011000", "10111000110", "10001110110", "11101110110", "11010001110",
  "11000101110", "11011101000", "11011100010", "11011101110", "11101011000",
  "11101000110", "11100010110", "11101101000", "11101100010", "11100011010",
  "11101111010", "11001000010", "11110001010", "10100110000", "10100001100",
  "10010110000", "10010000110", "10000101100", "10000100110", "10110010000",
  "10110000100", "10011010000", "10011000010", "10000110100", "10000110010",
  "11000010010", "11001010000", "11110111010", "11000010100", "10001111010",
  "10100111100", "10010111100", "10010011110", "10111100100", "10011110100",
  "10011110010", "11110100100", "11110010100", "11110010010", "11011011110",
  "11011110110", "11110110110", "10101111000", "10100011110", "10001011110",
  "10111101000", "10111100010", "11110101000", "11110100010", "10111011110",
  "10111101110", "11101011110", "11110101110", "11010000100", "11010010000",
  "11010011100", "11000111010",
];

const CODE128_STOP = "1100011101011";
const CODE128_START_B = 104;

const EAN_L: readonly string[] = [
  "0001101", "0011001", "0010011", "0111101", "0100011",
  "0110001", "0101111", "0111011", "0110111", "0001011",
];
const EAN_G: readonly string[] = [
  "0100111", "0110011", "0011011", "0100001", "0011101",
  "0111001", "0000101", "0010001", "0001001", "0010111",
];
const EAN_R: readonly string[] = [
  "1110010", "1100110", "1101100", "1000010", "1011100",
  "1001110", "1010000", "1000100", "1001000", "1110100",
];
/** First-digit parity for left group (L vs G). */
const EAN_PARITY: readonly string[] = [
  "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
  "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL",
];

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function modulesToSvg(
  modules: string,
  label: string,
  options: { barWidth?: number; height?: number; quiet?: number } = {},
): string {
  const barWidth = options.barWidth ?? 2;
  const height = options.height ?? 80;
  const quiet = options.quiet ?? 10;
  const bars: string[] = [];
  let x = quiet;
  for (const bit of modules) {
    if (bit === "1") {
      bars.push(
        `<rect x="${x}" y="0" width="${barWidth}" height="${height}" fill="#000"/>`,
      );
    }
    x += barWidth;
  }
  const width = quiet * 2 + modules.length * barWidth;
  const labelY = height + 16;
  const totalHeight = height + 24;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}" role="img" aria-label="${escapeXml(label)}">`,
    `<rect width="100%" height="100%" fill="#fff"/>`,
    ...bars,
    `<text x="${width / 2}" y="${labelY}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" fill="#000">${escapeXml(label)}</text>`,
    `</svg>`,
  ].join("");
}

function encodeCode128B(text: string): BarcodeResult {
  if (!text) return { ok: false, error: "empty" };
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code > 126) {
      return { ok: false, error: "invalid_chars" };
    }
  }

  const values: number[] = [CODE128_START_B];
  for (const ch of text) {
    values.push(ch.charCodeAt(0) - 32);
  }
  let checksum = values[0]!;
  for (let i = 1; i < values.length; i += 1) {
    checksum += values[i]! * i;
  }
  checksum %= 103;
  values.push(checksum);

  let modules = "";
  for (const value of values) {
    modules += CODE128_PATTERNS[value]!;
  }
  modules += CODE128_STOP;

  return {
    ok: true,
    value: text,
    svg: modulesToSvg(modules, text, { quiet: 20 }),
  };
}

export function ean13CheckDigit(twelveDigits: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    const digit = Number(twelveDigits[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return (10 - (sum % 10)) % 10;
}

function encodeEan13(raw: string): BarcodeResult {
  const digits = raw.replace(/\s/g, "");
  if (!digits) return { ok: false, error: "empty" };
  if (!/^\d{12,13}$/.test(digits)) {
    return { ok: false, error: "ean_digits" };
  }

  const body = digits.slice(0, 12);
  const expected = ean13CheckDigit(body);
  if (digits.length === 13) {
    const given = Number(digits[12]);
    if (given !== expected) {
      return { ok: false, error: "ean_check" };
    }
  }
  const full = `${body}${expected}`;

  const first = Number(full[0]);
  const parity = EAN_PARITY[first]!;
  let modules = "101";
  for (let i = 0; i < 6; i += 1) {
    const d = Number(full[i + 1]);
    modules += parity[i] === "L" ? EAN_L[d]! : EAN_G[d]!;
  }
  modules += "01010";
  for (let i = 7; i < 13; i += 1) {
    modules += EAN_R[Number(full[i])]!;
  }
  modules += "101";

  return {
    ok: true,
    value: full,
    svg: modulesToSvg(modules, full, { barWidth: 2, height: 90, quiet: 12 }),
  };
}

export function generateBarcode(mode: BarcodeMode, input: string): BarcodeResult {
  const text = input.trim();
  if (mode === "ean13") return encodeEan13(text);
  return encodeCode128B(text);
}

export function svgToPngDataUrl(svg: string, scale = 2): Promise<string | null> {
  return new Promise((resolve) => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(null);
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

export function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
