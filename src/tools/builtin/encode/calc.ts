export type EncodeMode = "base64" | "url";
export type EncodeAction = "encode" | "decode";

export type EncodeResult =
  | { ok: true; output: string }
  | { ok: false; error: "invalid_base64" | "invalid_uri" };

function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToUtf8(encoded: string): string {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function processEncode(
  input: string,
  mode: EncodeMode,
  action: EncodeAction,
): EncodeResult {
  try {
    if (mode === "base64") {
      if (action === "encode") {
        return { ok: true, output: utf8ToBase64(input) };
      }
      const trimmed = input.replace(/\s/g, "");
      base64ToUtf8(trimmed);
      return { ok: true, output: base64ToUtf8(trimmed) };
    }

    if (action === "encode") {
      return { ok: true, output: encodeURIComponent(input) };
    }
    return { ok: true, output: decodeURIComponent(input) };
  } catch {
    return {
      ok: false,
      error: mode === "base64" ? "invalid_base64" : "invalid_uri",
    };
  }
}