export type JwtPart = {
  raw: string;
  json: unknown;
  parseError?: string;
};

export type JwtDecoded = {
  header: JwtPart;
  payload: JwtPart;
  signature: string;
  alg: string | null;
  typ: string | null;
  exp: Date | null;
  iat: Date | null;
};

function base64UrlToBytes(segment: string): Uint8Array | null {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  try {
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function parseJsonPart(segment: string): JwtPart {
  const bytes = base64UrlToBytes(segment);
  if (!bytes) {
    return { raw: segment, json: null, parseError: "invalid_base64" };
  }
  try {
    const text = new TextDecoder().decode(bytes);
    const json = JSON.parse(text) as unknown;
    return { raw: segment, json };
  } catch {
    const text = new TextDecoder().decode(bytes);
    return { raw: segment, json: text, parseError: "invalid_json" };
  }
}

function readClaim(payload: unknown, key: string): unknown {
  if (payload && typeof payload === "object" && key in payload) {
    return (payload as Record<string, unknown>)[key];
  }
  return undefined;
}

function epochToDate(value: unknown): Date | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const ms = value > 1e12 ? value : value * 1000;
  const date = new Date(ms);
  return Number.isFinite(date.getTime()) ? date : null;
}

const JWT_SHAPE =
  /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/;

export function looksLikeJwt(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 20 && JWT_SHAPE.test(trimmed);
}

export function decodeJwt(token: string): JwtDecoded | null {
  const trimmed = token.trim();
  if (!looksLikeJwt(trimmed)) return null;

  const parts = trimmed.split(".");
  if (parts.length !== 3) return null;

  const header = parseJsonPart(parts[0]!);
  const payload = parseJsonPart(parts[1]!);
  const signature = parts[2]!;

  const algRaw = readClaim(header.json, "alg");
  const typRaw = readClaim(header.json, "typ");
  const alg = typeof algRaw === "string" ? algRaw : null;
  const typ = typeof typRaw === "string" ? typRaw : null;

  const exp = epochToDate(readClaim(payload.json, "exp"));
  const iat = epochToDate(readClaim(payload.json, "iat"));

  return { header, payload, signature, alg, typ, exp, iat };
}

export function formatJwtJson(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}