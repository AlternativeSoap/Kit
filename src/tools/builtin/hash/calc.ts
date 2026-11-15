export type HashAlgorithm = "SHA-256" | "SHA-1";

const ALGORITHMS: readonly HashAlgorithm[] = ["SHA-256", "SHA-1"];

export function isHashAlgorithm(value: string): value is HashAlgorithm {
  return (ALGORITHMS as readonly string[]).includes(value);
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function digestText(
  text: string,
  algorithm: HashAlgorithm,
): Promise<string | null> {
  if (typeof globalThis.crypto?.subtle?.digest !== "function") return null;
  const data = new TextEncoder().encode(text);
  try {
    const buffer = await crypto.subtle.digest(algorithm, data);
    return toHex(buffer);
  } catch {
    return null;
  }
}