export type JsonMode = "format" | "minify" | "validate";

export type JsonProcessResult =
  | { ok: true; output: string }
  | { ok: false; error: string; position?: number };

function errorPosition(message: string): number | undefined {
  const at = /position\s+(\d+)/i.exec(message);
  if (at) return Number(at[1]);
  const lineCol = /line\s+(\d+)\s+column\s+(\d+)/i.exec(message);
  if (lineCol) return undefined;
  return undefined;
}

export function lineColumnAt(
  source: string,
  position: number,
): { line: number; column: number } | null {
  if (!Number.isFinite(position) || position < 0 || position > source.length) return null;
  const before = source.slice(0, position);
  const lines = before.split("\n");
  const line = lines.length;
  const column = (lines[lines.length - 1] ?? "").length + 1;
  return { line, column };
}

export function processJson(input: string, mode: JsonMode): JsonProcessResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "empty" };

  try {
    const value = JSON.parse(trimmed) as unknown;
    if (mode === "validate") {
      return { ok: true, output: "" };
    }
    if (mode === "minify") {
      return { ok: true, output: JSON.stringify(value) };
    }
    return { ok: true, output: JSON.stringify(value, null, 2) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    const position = errorPosition(message);
    return { ok: false, error: message, position };
  }
}