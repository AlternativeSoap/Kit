export type MdNode =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; text: string }
  | { type: "hr" };

function inlineToHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>',
    );
}

export function parseMarkdown(source: string): MdNode[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const nodes: MdNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      nodes.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? "").startsWith("```")) {
        buf.push(lines[i] ?? "");
        i += 1;
      }
      i += 1;
      nodes.push({ type: "code", text: buf.join("\n") });
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1]!.length;
      const text = heading[2] ?? "";
      nodes.push({
        type: level === 1 ? "h1" : level === 2 ? "h2" : "h3",
        text,
      });
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^[-*]\s+/, ""));
        i += 1;
      }
      nodes.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      nodes.push({ type: "ol", items });
      continue;
    }

    const para: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !/^(#{1,3})\s+/.test(lines[i] ?? "") &&
      !/^[-*]\s+/.test(lines[i] ?? "") &&
      !/^\d+\.\s+/.test(lines[i] ?? "") &&
      !(lines[i] ?? "").startsWith("```") &&
      !/^---+$/.test((lines[i] ?? "").trim())
    ) {
      para.push(lines[i] ?? "");
      i += 1;
    }
    nodes.push({ type: "p", text: para.join(" ") });
  }

  return nodes;
}

export function nodesToSafeHtml(nodes: MdNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "h1":
          return `<h1>${inlineToHtml(node.text)}</h1>`;
        case "h2":
          return `<h2>${inlineToHtml(node.text)}</h2>`;
        case "h3":
          return `<h3>${inlineToHtml(node.text)}</h3>`;
        case "p":
          return `<p>${inlineToHtml(node.text)}</p>`;
        case "ul":
          return `<ul>${node.items.map((item) => `<li>${inlineToHtml(item)}</li>`).join("")}</ul>`;
        case "ol":
          return `<ol>${node.items.map((item) => `<li>${inlineToHtml(item)}</li>`).join("")}</ol>`;
        case "code":
          return `<pre><code>${node.text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</code></pre>`;
        case "hr":
          return "<hr/>";
        default:
          return "";
      }
    })
    .join("\n");
}
