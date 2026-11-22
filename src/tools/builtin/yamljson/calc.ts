export type YamlJsonMode = "jsonToYaml" | "yamlToJson";

export type YamlJsonResult =
  | { ok: true; output: string }
  | { ok: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function needsYamlQuotes(value: string): boolean {
  if (value === "") return true;
  if (/^[&*!|>%@`']/.test(value)) return true;
  if (/[:#{}\[\],&*?|>!%@`]/.test(value)) return true;
  if (/^\s|\s$/.test(value)) return true;
  if (/^(true|false|null|yes|no|on|off)$/i.test(value)) return true;
  if (/^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(value)) return true;
  if (value.includes("\n") || value.includes('"') || value.includes("\\")) return true;
  return false;
}

function quoteYamlString(value: string): string {
  return `"${value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")}"`;
}

function dumpYaml(value: unknown, indent: number): string {
  const pad = "  ".repeat(indent);

  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return quoteYamlString(String(value));
    return String(value);
  }
  if (typeof value === "string") {
    return needsYamlQuotes(value) ? quoteYamlString(value) : value;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((item) => {
        if (isPlainObject(item)) {
          const keys = Object.keys(item);
          if (keys.length === 0) return `${pad}- {}`;
          const nested = dumpYaml(item, indent + 1);
          const lines = nested.split("\n");
          const first = (lines[0] ?? "").replace(/^\s+/, "");
          const rest = lines.slice(1);
          return `${pad}- ${first}${rest.length ? `\n${rest.join("\n")}` : ""}`;
        }
        if (Array.isArray(item)) {
          if (item.length === 0) return `${pad}- []`;
          const nested = dumpYaml(item, indent + 1);
          return `${pad}-\n${nested}`;
        }
        return `${pad}- ${dumpYaml(item, 0)}`;
      })
      .join("\n");
  }

  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) return "{}";
    return keys
      .map((key) => {
        const child = value[key];
        const keyOut = needsYamlQuotes(key) ? quoteYamlString(key) : key;
        if (isPlainObject(child) || Array.isArray(child)) {
          const nested = dumpYaml(child, indent + 1);
          if (
            (isPlainObject(child) && Object.keys(child).length === 0) ||
            (Array.isArray(child) && child.length === 0)
          ) {
            return `${pad}${keyOut}: ${nested}`;
          }
          return `${pad}${keyOut}:\n${nested}`;
        }
        return `${pad}${keyOut}: ${dumpYaml(child, 0)}`;
      })
      .join("\n");
  }

  return quoteYamlString(String(value));
}

export function jsonToYaml(input: string): YamlJsonResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "empty" };
  try {
    const value = JSON.parse(trimmed) as unknown;
    const yaml = dumpYaml(value, 0);
    return { ok: true, output: `${yaml}\n` };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    return { ok: false, error: message };
  }
}

class YamlParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YamlParseError";
  }
}

function stripCommentsAndKeepStrings(line: string): string {
  let out = "";
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (inDouble) {
      out += ch;
      if (ch === "\\" && i + 1 < line.length) {
        out += line[i + 1]!;
        i += 1;
      } else if (ch === '"') {
        inDouble = false;
      }
      continue;
    }
    if (inSingle) {
      out += ch;
      if (ch === "'" && line[i + 1] === "'") {
        out += "'";
        i += 1;
      } else if (ch === "'") {
        inSingle = false;
      }
      continue;
    }
    if (ch === "#") break;
    if (ch === '"') {
      inDouble = true;
      out += ch;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      out += ch;
      continue;
    }
    out += ch;
  }
  return out.replace(/\s+$/, "");
}

function parseScalar(raw: string): unknown {
  const text = raw.trim();
  if (text === "" || text === "~" || /^null$/i.test(text)) return null;
  if (/^true$/i.test(text)) return true;
  if (/^false$/i.test(text)) return false;
  if (/^[-+]?(0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?$/.test(text)) {
    return Number(text);
  }
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    const quote = text[0]!;
    const inner = text.slice(1, -1);
    if (quote === "'") {
      return inner.replace(/''/g, "'");
    }
    return inner
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
  if (text === "[]") return [];
  if (text === "{}") return {};
  if (text.startsWith("[") && text.endsWith("]")) {
    return parseFlowSequence(text);
  }
  if (text.startsWith("{") && text.endsWith("}")) {
    return parseFlowMap(text);
  }
  return text;
}

function splitFlow(content: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i]!;
    if (inDouble) {
      current += ch;
      if (ch === "\\" && i + 1 < content.length) {
        current += content[i + 1]!;
        i += 1;
      } else if (ch === '"') inDouble = false;
      continue;
    }
    if (inSingle) {
      current += ch;
      if (ch === "'" && content[i + 1] === "'") {
        current += "'";
        i += 1;
      } else if (ch === "'") inSingle = false;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      current += ch;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      current += ch;
      continue;
    }
    if (ch === "[" || ch === "{") depth += 1;
    if (ch === "]" || ch === "}") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function parseFlowSequence(text: string): unknown[] {
  const inner = text.slice(1, -1).trim();
  if (!inner) return [];
  return splitFlow(inner).map((part) => parseScalar(part));
}

function parseFlowMap(text: string): Record<string, unknown> {
  const inner = text.slice(1, -1).trim();
  const out: Record<string, unknown> = {};
  if (!inner) return out;
  for (const part of splitFlow(inner)) {
    const idx = part.indexOf(":");
    if (idx === -1) {
      throw new YamlParseError(`Invalid flow map entry: ${part}`);
    }
    const key = String(parseScalar(part.slice(0, idx).trim()));
    out[key] = parseScalar(part.slice(idx + 1));
  }
  return out;
}

type Line = { indent: number; content: string; line: number };

function prepareLines(source: string): Line[] {
  const rawLines = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const lines: Line[] = [];
  for (let i = 0; i < rawLines.length; i += 1) {
    const cleaned = stripCommentsAndKeepStrings(rawLines[i]!);
    if (!cleaned.trim()) continue;
    const match = /^( *)(.*)$/.exec(cleaned);
    const indent = match?.[1]?.length ?? 0;
    const content = match?.[2] ?? "";
    if (!content) continue;
    if (indent % 2 !== 0) {
      throw new YamlParseError(`Indent must be multiples of 2 spaces (line ${i + 1})`);
    }
    lines.push({ indent, content, line: i + 1 });
  }
  return lines;
}

function parseBlock(lines: Line[], start: number, indent: number): { value: unknown; next: number } {
  if (start >= lines.length) return { value: null, next: start };
  const first = lines[start]!;
  if (first.indent < indent) return { value: null, next: start };

  if (first.content.startsWith("- ") || first.content === "-") {
    return parseSequence(lines, start, indent);
  }
  return parseMapping(lines, start, indent);
}

function parseSequence(lines: Line[], start: number, indent: number): { value: unknown[]; next: number } {
  const items: unknown[] = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.indent < indent) break;
    if (line.indent > indent) {
      throw new YamlParseError(`Unexpected indentation at line ${line.line}`);
    }
    if (!(line.content.startsWith("- ") || line.content === "-")) {
      break;
    }
    const afterDash = line.content === "-" ? "" : line.content.slice(2).trim();
    if (!afterDash) {
      const nested = parseBlock(lines, i + 1, indent + 2);
      items.push(nested.value);
      i = nested.next;
      continue;
    }
    const keyMatch = /^([^:]+):(.*)$/.exec(afterDash);
    if (keyMatch && !afterDash.startsWith("[") && !afterDash.startsWith("{")) {
      const key = String(parseScalar(keyMatch[1]!.trim()));
      const rest = keyMatch[2]!.trim();
      const obj: Record<string, unknown> = {};
      if (rest) {
        obj[key] = parseScalar(rest);
        const nested = parseMapping(lines, i + 1, indent + 2);
        Object.assign(obj, nested.value);
        items.push(obj);
        i = nested.next;
      } else {
        const nested = parseBlock(lines, i + 1, indent + 2);
        obj[key] = nested.value;
        const more = parseMapping(lines, nested.next, indent + 2);
        Object.assign(obj, more.value);
        items.push(obj);
        i = more.next;
      }
      continue;
    }
    items.push(parseScalar(afterDash));
    i += 1;
  }
  return { value: items, next: i };
}

function parseMapping(
  lines: Line[],
  start: number,
  indent: number,
): { value: Record<string, unknown>; next: number } {
  const obj: Record<string, unknown> = {};
  let i = start;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.indent < indent) break;
    if (line.indent > indent) {
      throw new YamlParseError(`Unexpected indentation at line ${line.line}`);
    }
    if (line.content.startsWith("- ") || line.content === "-") break;

    const idx = findKeyColon(line.content);
    if (idx === -1) {
      throw new YamlParseError(`Expected key: value at line ${line.line}`);
    }
    const key = String(parseScalar(line.content.slice(0, idx).trim()));
    const rest = line.content.slice(idx + 1).trim();
    if (rest) {
      obj[key] = parseScalar(rest);
      i += 1;
    } else {
      const nested = parseBlock(lines, i + 1, indent + 2);
      obj[key] = nested.value;
      i = nested.next;
    }
  }
  return { value: obj, next: i };
}

function findKeyColon(content: string): number {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i]!;
    if (inDouble) {
      if (ch === "\\" && i + 1 < content.length) {
        i += 1;
      } else if (ch === '"') inDouble = false;
      continue;
    }
    if (inSingle) {
      if (ch === "'" && content[i + 1] === "'") {
        i += 1;
      } else if (ch === "'") inSingle = false;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === ":") {
      const next = content[i + 1];
      if (next === undefined || next === " " || next === "\t") return i;
      if (i === content.length - 1) return i;
    }
  }
  return -1;
}

export function yamlToJson(input: string): YamlJsonResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "empty" };
  try {
    const lines = prepareLines(trimmed);
    if (lines.length === 0) return { ok: true, output: "null\n" };
    const rootIndent = lines[0]!.indent;
    const { value, next } = parseBlock(lines, 0, rootIndent);
    if (next < lines.length) {
      throw new YamlParseError(`Unexpected content at line ${lines[next]!.line}`);
    }
    return { ok: true, output: `${JSON.stringify(value, null, 2)}\n` };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid YAML";
    return { ok: false, error: message };
  }
}

export function processYamlJson(input: string, mode: YamlJsonMode): YamlJsonResult {
  return mode === "jsonToYaml" ? jsonToYaml(input) : yamlToJson(input);
}
