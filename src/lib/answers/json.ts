/** JSON recognition: validate and pretty-print locally. */

export type JsonAnswer = {
  kind: "json";
  valid: boolean;
  formatted?: string;
  minified?: string;
  error?: string;
};

const MAX_JSON_LENGTH = 4000;

export function parseJson(query: string): JsonAnswer | null {
  const trimmed = query.trim();
  if (trimmed.length < 2 || trimmed.length > MAX_JSON_LENGTH) return null;
  const first = trimmed[0];
  if (first !== "{" && first !== "[") return null;

  try {
    const value = JSON.parse(trimmed) as unknown;
    if (value === null || typeof value !== "object") return null;
    return {
      kind: "json",
      valid: true,
      formatted: JSON.stringify(value, null, 2),
      minified: JSON.stringify(value),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid JSON";
    return {
      kind: "json",
      valid: false,
      error: message,
    };
  }
}

export { MAX_JSON_LENGTH };
