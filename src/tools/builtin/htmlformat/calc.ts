export type HtmlMode = "format" | "minify" | "validate";

export type HtmlProcessResult =
  | { ok: true; output: string }
  | { ok: false; error: string };

function serializeChildren(node: Node, indent: number, pretty: boolean): string {
  let out = "";
  for (const child of Array.from(node.childNodes)) {
    out += serializeNode(child, indent, pretty);
  }
  return out;
}

function isVoidElement(name: string): boolean {
  return (
    /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(
      name,
    )
  );
}

function serializeElement(el: Element, indent: number, pretty: boolean): string {
  const pad = pretty ? "  ".repeat(indent) : "";
  const name = el.tagName.toLowerCase();
  let attrs = "";
  for (const attr of Array.from(el.attributes)) {
    attrs += ` ${attr.name}="${attr.value.replace(/"/g, "&quot;")}"`;
  }

  if (isVoidElement(name)) {
    return pretty ? `${pad}<${name}${attrs}>\n` : `<${name}${attrs}>`;
  }

  const children = Array.from(el.childNodes).filter((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      return (child.textContent ?? "").length > 0;
    }
    return (
      child.nodeType === Node.ELEMENT_NODE ||
      child.nodeType === Node.COMMENT_NODE
    );
  });

  if (children.length === 0) {
    return pretty
      ? `${pad}<${name}${attrs}></${name}>\n`
      : `<${name}${attrs}></${name}>`;
  }

  const onlyText =
    children.length === 1 && children[0]!.nodeType === Node.TEXT_NODE;
  if (onlyText) {
    const text = (children[0]!.textContent ?? "").replace(/\s+/g, " ").trim();
    return pretty
      ? `${pad}<${name}${attrs}>${text}</${name}>\n`
      : `<${name}${attrs}>${text}</${name}>`;
  }

  let inner = "";
  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = (child.textContent ?? "").replace(/\s+/g, " ").trim();
      if (!text) continue;
      inner += pretty ? `${"  ".repeat(indent + 1)}${text}\n` : text;
      continue;
    }
    inner += serializeNode(child, indent + 1, pretty);
  }

  if (pretty) {
    return `${pad}<${name}${attrs}>\n${inner}${pad}</${name}>\n`;
  }
  return `<${name}${attrs}>${inner}</${name}>`;
}

function serializeNode(node: Node, indent: number, pretty: boolean): string {
  const pad = pretty ? "  ".repeat(indent) : "";

  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    return pretty ? `${pad}${text}\n` : text;
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    const body = node.textContent ?? "";
    return pretty ? `${pad}<!--${body}-->\n` : `<!--${body}-->`;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    return serializeElement(node as Element, indent, pretty);
  }

  if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
    const dt = node as DocumentType;
    const publicId = dt.publicId ? ` PUBLIC "${dt.publicId}"` : "";
    const systemId = dt.systemId
      ? `${dt.publicId ? "" : " SYSTEM"} "${dt.systemId}"`
      : "";
    const doctype = `<!DOCTYPE ${dt.name}${publicId}${systemId}>`;
    return pretty ? `${doctype}\n` : doctype;
  }

  return "";
}

function parseHtml(source: string): { doc: Document } | { error: string } {
  if (typeof DOMParser === "undefined") {
    return { error: "DOMParser is not available in this environment." };
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(source, "text/html");
    const errEl = doc.querySelector("parsererror");
    if (errEl) {
      return {
        error:
          errEl.textContent?.replace(/\s+/g, " ").trim().slice(0, 400) ||
          "Invalid HTML",
      };
    }
    return { doc };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Invalid HTML",
    };
  }
}

function documentToString(doc: Document, pretty: boolean): string {
  const parts: string[] = [];

  if (doc.doctype) {
    parts.push(serializeNode(doc.doctype, 0, pretty));
  }

  const html = doc.documentElement;
  if (html) {
    parts.push(serializeNode(html, 0, pretty));
  } else {
    parts.push(serializeChildren(doc, 0, pretty));
  }

  const joined = parts.join("");
  if (pretty) {
    return joined.replace(/\n+$/, "\n");
  }
  return joined.replace(/>\s+</g, "><").trim();
}

function looksLikeFragment(source: string): boolean {
  const trimmed = source.trim();
  return (
    !/^<!DOCTYPE/i.test(trimmed) &&
    !/^<html[\s>]/i.test(trimmed) &&
    !/^<head[\s>]/i.test(trimmed) &&
    !/^<body[\s>]/i.test(trimmed)
  );
}

function fragmentToString(doc: Document, pretty: boolean): string {
  const body = doc.body;
  if (!body) return documentToString(doc, pretty);

  let out = "";
  for (const child of Array.from(body.childNodes)) {
    out += serializeNode(child, 0, pretty);
  }
  if (pretty) return out.replace(/\n+$/, "\n");
  return out.replace(/>\s+</g, "><").trim();
}

export function processHtml(input: string, mode: HtmlMode): HtmlProcessResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "empty" };
  }

  const parsed = parseHtml(trimmed);
  if ("error" in parsed) {
    return { ok: false, error: parsed.error };
  }

  if (mode === "validate") {
    return { ok: true, output: "" };
  }

  try {
    const fragment = looksLikeFragment(trimmed);
    const output = fragment
      ? fragmentToString(parsed.doc, mode === "format")
      : documentToString(parsed.doc, mode === "format");
    return { ok: true, output };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to serialize HTML";
    return { ok: false, error: message };
  }
}
