/** Pure CSV and SpreadsheetML helpers, kept free of React for testing. */

export type Delimiter = "," | ";" | "\t";

export function detectDelimiter(text: string): Delimiter {
  const sample = text.slice(0, 4000);
  const counts: Record<Delimiter, number> = { ",": 0, ";": 0, "\t": 0 };
  let inQuotes = false;
  for (let i = 0; i < sample.length; i++) {
    const ch = sample[i]!;
    if (ch === '"') {
      if (inQuotes && sample[i + 1] === '"') {
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (inQuotes) continue;
    if (ch === "," || ch === ";" || ch === "\t") counts[ch]++;
  }
  if (counts["\t"] > counts[","] && counts["\t"] > counts[";"]) return "\t";
  return counts[";"] > counts[","] ? ";" : ",";
}

export function parseCsv(text: string, delimiter?: Delimiter): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const input = text.replace(/^\uFEFF/, "");
  const sep = delimiter ?? detectDelimiter(input);
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!;
    const next = input[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === sep) {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      if (ch === "\r") i++;
      continue;
    }
    if (ch === "\r") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.length) || rows.length === 0) rows.push(row);
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

export function rowsToObjects(
  rows: string[][],
  firstRowIsHeader: boolean,
): Record<string, string>[] {
  if (!rows.length) return [];
  let headers: string[];
  let body: string[][];
  if (firstRowIsHeader) {
    if (rows.length < 2) return [];
    headers = rows[0]!.map((h, i) => h.trim() || `col${i + 1}`);
    body = rows.slice(1);
  } else {
    const width = rows.reduce((max, r) => Math.max(max, r.length), 0);
    headers = Array.from({ length: width }, (_, i) => `col${i + 1}`);
    body = rows;
  }
  return body.map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = r[i] ?? "";
    });
    return obj;
  });
}

export function escapeCsv(value: string, delimiter: Delimiter): string {
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function objectsToCsv(
  data: Record<string, unknown>[],
  delimiter: Delimiter,
): string {
  if (!data.length) return "";
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const row of data) {
    for (const key of Object.keys(row)) {
      if (seen.has(key)) continue;
      seen.add(key);
      keys.push(key);
    }
  }
  const lines = [
    keys.map((k) => escapeCsv(k, delimiter)).join(delimiter),
    ...data.map((row) =>
      keys.map((k) => escapeCsv(csvCell(row[k]), delimiter)).join(delimiter),
    ),
  ];
  return lines.join("\r\n");
}

export function isRecordArray(value: unknown): value is Record<string, unknown>[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) => typeof item === "object" && item !== null && !Array.isArray(item),
    )
  );
}

export function escapeXml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Minimal SpreadsheetML that Excel opens as a workbook. */
export function csvToExcelXml(csv: string, delimiter?: Delimiter): string {
  const rows = parseCsv(csv, delimiter);
  const cells = rows
    .map((row) => {
      const tds = row
        .map(
          (cell) =>
            `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`,
        )
        .join("");
      return `<Row>${tds}</Row>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Sheet1">
  <Table>${cells}</Table>
 </Worksheet>
</Workbook>`;
}
