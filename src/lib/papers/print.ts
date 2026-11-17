/** Open a print-friendly window for Papers content. */

export function printHtmlDocument(options: {
  title: string;
  bodyHtml: string;
  pageSize?: string;
}) {
  const { title, bodyHtml, pageSize = "A4" } = options;
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return false;
  win.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: ${pageSize}; margin: 16mm; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 12pt;
      line-height: 1.35;
      color: #111;
      margin: 0;
    }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ccc; padding: 6px; }
    h1 { font-size: 1.7em; margin: 0 0 0.5em; }
    h2 { font-size: 1.35em; margin: 0 0 0.4em; }
    p { margin: 0 0 0.6em; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`);
  win.document.close();
  win.focus();
  window.setTimeout(() => {
    win.print();
  }, 250);
  return true;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
