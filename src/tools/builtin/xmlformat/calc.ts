export type XmlMode = "format" | "minify" | "validate";

export type XmlProcessResult =
  | { ok: true; output: string }
  | { ok: false; error: string; line?: number; column?: number };

function parseXml(source: string): { doc: Document } | { error: string; line?: number; column?: number } {
  if (typeof DOMParser === "undefined") {
    return { error: "DOMParser is not available in this environment." };
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(source, "application/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    const text = parseError.textContent?.trim() || "Invalid XML";
    const loc =
      /line\s+(\d+)(?:\s*(?:at\s*)?column\s+(\d+))?/i.exec(text) ??
      /lineNumber[=:\s]+(\d+).*?columnNumber[=:\s]+(\d+)/i.exec(text);
    return {
      error: text.replace(/\s+/g, " ").slice(0, 400),
      line: loc ? Number(loc[1]) : undefined,
      column: loc?.[2] ? Number(loc[2]) : undefined,
    };
  }
  return { doc };
}

function formatNode(node: Node, indent: number, pretty: boolean): string {
  const pad = pretty ? "  ".repeat(indent) : "";
  const nl = pretty ? "\n" : "";

  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
    return text;
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `${pad}<![CDATA[${node.textContent ?? ""}]]>${nl}`.replace(/\n$/, pretty ? "\n" : "");
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    const body = node.textContent ?? "";
    return pretty ? `${pad}<!--${body}-->\n` : `<!--${body}-->`;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const el = node as Element;
  const name = el.tagName;
  let attrs = "";
  for (const attr of Array.from(el.attributes)) {
    attrs += ` ${attr.name}="${attr.value.replace(/"/g, "&quot;")}"`;
  }

  const children = Array.from(el.childNodes).filter((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      return (child.textContent ?? "").trim().length > 0;
    }
    return (
      child.nodeType === Node.ELEMENT_NODE ||
      child.nodeType === Node.COMMENT_NODE ||
      child.nodeType === Node.CDATA_SECTION_NODE
    );
  });

  if (children.length === 0) {
    return pretty ? `${pad}<${name}${attrs}/>\n` : `<${name}${attrs}/>`;
  }

  const onlyText =
    children.length === 1 && children[0]!.nodeType === Node.TEXT_NODE;
  if (onlyText) {
    const text = formatNode(children[0]!, 0, false);
    return pretty
      ? `${pad}<${name}${attrs}>${text}</${name}>\n`
      : `<${name}${attrs}>${text}</${name}>`;
  }

  let inner = "";
  for (const child of children) {
    inner += formatNode(child, indent + 1, pretty);
  }
  if (pretty) {
    return `${pad}<${name}${attrs}>\n${inner}${pad}</${name}>\n`;
  }
  return `<${name}${attrs}>${inner}</${name}>`;
}

function documentToString(doc: Document, pretty: boolean): string {
  const parts: string[] = [
    pretty
      ? '<?xml version="1.0" encoding="UTF-8"?>\n'
      : '<?xml version="1.0" encoding="UTF-8"?>',
  ];

  for (const child of Array.from(doc.childNodes)) {
    if (child.nodeType === Node.DOCUMENT_TYPE_NODE) continue;
    if (child.nodeType === Node.PROCESSING_INSTRUCTION_NODE) continue;
    parts.push(formatNode(child, 0, pretty));
  }

  const joined = parts.join("");
  return pretty ? joined.replace(/\n+$/, "\n") : joined.replace(/>\s+</g, "><").trim();
}

export function processXml(input: string, mode: XmlMode): XmlProcessResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "empty" };
  }

  const parsed = parseXml(trimmed);
  if ("error" in parsed) {
    return {
      ok: false,
      error: parsed.error,
      line: parsed.line,
      column: parsed.column,
    };
  }

  if (mode === "validate") {
    return { ok: true, output: "" };
  }

  try {
    const output = documentToString(parsed.doc, mode === "format");
    return { ok: true, output };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to serialize XML";
    return { ok: false, error: message };
  }
}
