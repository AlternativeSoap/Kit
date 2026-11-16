"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { downloadBlob } from "../media/canvas";

type Mode = "csvToJson" | "jsonToCsv";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const input = text.replace(/^\uFEFF/, "");
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
    if (ch === ",") {
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

function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length < 2) return [];
  const headers = rows[0]!.map((h, i) => h.trim() || `col${i + 1}`);
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = r[i] ?? "";
    });
    return obj;
  });
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function objectsToCsv(data: Record<string, unknown>[]): string {
  if (!data.length) return "";
  const keys = Object.keys(data[0]!);
  const lines = [
    keys.map(escapeCsv).join(","),
    ...data.map((row) =>
      keys.map((k) => escapeCsv(String(row[k] ?? ""))).join(","),
    ),
  ];
  return lines.join("\r\n");
}

/** Minimal SpreadsheetML that Excel opens as a workbook. */
function csvToExcelXml(csv: string): string {
  const rows = parseCsv(csv);
  const cells = rows
    .map((row) => {
      const tds = row
        .map(
          (cell) =>
            `<Cell><Data ss:Type="String">${cell
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")}</Data></Cell>`,
        )
        .join("");
      return `<Row>${tds}</Row>`;
    })
    .join("");
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Sheet1">
  <Table>${cells}</Table>
 </Worksheet>
</Workbook>`;
}

export function CsvExcelTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.csvexcelTool;
  const [mode, setMode] = useState<Mode>("csvToJson");
  const [input, setInput] = useState(
    () => prefill?.value ?? "name,age\nAda,36\nBob,41",
  );
  const { output, error } = useMemo(() => {
    try {
      if (mode === "csvToJson") {
        const rows = parseCsv(input);
        const objects = rowsToObjects(rows);
        if (!objects.length) return { output: "", error: null as string | null };
        return {
          output: JSON.stringify(objects, null, 2),
          error: null as string | null,
        };
      }
      const data = JSON.parse(input) as Record<string, unknown>[];
      if (!Array.isArray(data) || !data.length) {
        return { output: "", error: t.invalidJson };
      }
      return { output: objectsToCsv(data), error: null as string | null };
    } catch {
      return {
        output: "",
        error: mode === "csvToJson" ? t.invalidCsv : t.invalidJson,
      };
    }
  }, [input, mode, t.invalidCsv, t.invalidJson]);

  function downloadJson() {
    if (!output) return;
    downloadBlob(
      new Blob([output], { type: "application/json" }),
      "data.json",
    );
  }

  function downloadCsv() {
    const csv = mode === "jsonToCsv" ? output : input;
    if (!csv.trim()) return;
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "data.csv");
  }

  function downloadExcel() {
    const csv = mode === "jsonToCsv" ? output : input;
    if (!csv.trim()) return;
    const xml = csvToExcelXml(csv);
    downloadBlob(
      new Blob([xml], { type: "application/vnd.ms-excel" }),
      "data.xls",
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-muted">{t.intro}</p>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["csvToJson", t.csvToJson],
            ["jsonToCsv", t.jsonToCsv],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm sm:min-h-0 ${
              mode === id
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.input}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          spellCheck={false}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[13px]"
        />
      </label>

      {error ? <p className="text-sm text-muted">{error}</p> : null}

      <label className="block">
        <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
          <span>{t.output}</span>
          {output ? (
            <CopyButton value={output} label={t.copy} copiedLabel={t.copied} />
          ) : null}
        </span>
        <textarea
          readOnly
          value={output}
          rows={10}
          className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 font-mono text-base outline-none sm:text-[13px]"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {mode === "csvToJson" ? (
          <button
            type="button"
            disabled={!output}
            onClick={downloadJson}
            className="kit-touch-target rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 sm:min-h-0"
          >
            {t.downloadJson}
          </button>
        ) : (
          <button
            type="button"
            disabled={!output}
            onClick={downloadCsv}
            className="kit-touch-target rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 sm:min-h-0"
          >
            {t.downloadCsv}
          </button>
        )}
        <button
          type="button"
          disabled={!(mode === "jsonToCsv" ? output : input).trim()}
          onClick={downloadExcel}
          className="kit-touch-target rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm font-medium disabled:opacity-40 sm:min-h-0"
        >
          {t.downloadExcel}
        </button>
        {mode === "csvToJson" ? (
          <button
            type="button"
            disabled={!input.trim()}
            onClick={downloadCsv}
            className="kit-touch-target rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm font-medium disabled:opacity-40 sm:min-h-0"
          >
            {t.downloadCsv}
          </button>
        ) : null}
      </div>
    </div>
  );
}
