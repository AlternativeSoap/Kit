"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  ErrorBanner,
  Field,
  FileInput,
  KitSelect,
  Segmented,
  fieldClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useDeferredText } from "@/hooks/useDeferredText";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { downloadBlob } from "../media/canvas";
import {
  csvToExcelXml,
  isRecordArray,
  objectsToCsv,
  parseCsv,
  rowsToObjects,
  type Delimiter,
} from "./csv";

type Mode = "csvToJson" | "jsonToCsv";
type DelimiterChoice = "auto" | Delimiter;

function withUtf8Bom(text: string): Blob {
  return new Blob(["\uFEFF", text], { type: "text/csv;charset=utf-8" });
}

export function CsvExcelTool({ prefill }: { prefill?: ToolPrefill }) {
  const { dictionary, locale } = useLanguage();
  const t = dictionary.csvexcelTool;
  const [mode, setMode] = useState<Mode>("csvToJson");
  const [delimiterChoice, setDelimiterChoice] =
    useState<DelimiterChoice>("auto");
  const [firstRowIsHeader, setFirstRowIsHeader] = useState(true);
  const [fileError, setFileError] = useState<string | null>(null);
  const {
    text: input,
    setText: setInput,
    deferred,
  } = useDeferredText(prefill?.value ?? "name,age\nAda,36\nBob,41");

  /** Delimiter used when writing CSV. Auto follows the interface language. */
  const exportDelimiter: Delimiter =
    delimiterChoice === "auto" ? (locale === "da" ? ";" : ",") : delimiterChoice;
  /** Explicit delimiter for parsing, or undefined to detect from the text. */
  const parseDelimiter: Delimiter | undefined =
    delimiterChoice === "auto" ? undefined : delimiterChoice;

  const { output, error } = useMemo(() => {
    try {
      if (mode === "csvToJson") {
        const rows = parseCsv(deferred, parseDelimiter);
        const objects = rowsToObjects(rows, firstRowIsHeader);
        if (!objects.length) return { output: "", error: null as string | null };
        return {
          output: JSON.stringify(objects, null, 2),
          error: null as string | null,
        };
      }
      const data: unknown = JSON.parse(deferred);
      if (!isRecordArray(data)) {
        return { output: "", error: t.invalidJson };
      }
      return {
        output: objectsToCsv(data, exportDelimiter),
        error: null as string | null,
      };
    } catch {
      return {
        output: "",
        error: mode === "csvToJson" ? t.invalidCsv : t.invalidJson,
      };
    }
  }, [
    deferred,
    mode,
    parseDelimiter,
    exportDelimiter,
    firstRowIsHeader,
    t.invalidCsv,
    t.invalidJson,
  ]);

  async function onFile(file: File | null) {
    setFileError(null);
    if (!file) return;
    try {
      const content = await file.text();
      if (input.trim() && !window.confirm(t.confirmReplace)) return;
      setInput(content);
      setMode(file.name.toLowerCase().endsWith(".json") ? "jsonToCsv" : "csvToJson");
    } catch {
      setFileError(t.fileError);
    }
  }

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
    downloadBlob(withUtf8Bom(csv), "data.csv");
  }

  function downloadExcel() {
    const csv = mode === "jsonToCsv" ? output : input;
    if (!csv.trim()) return;
    const xml = csvToExcelXml(
      csv,
      mode === "jsonToCsv" ? exportDelimiter : parseDelimiter,
    );
    downloadBlob(
      new Blob(["\uFEFF", xml], {
        type: "application/vnd.ms-excel;charset=utf-8",
      }),
      "data.xls",
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-muted">{t.intro}</p>

      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { id: "csvToJson", label: t.csvToJson },
          { id: "jsonToCsv", label: t.jsonToCsv },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.delimiter}>
          <KitSelect
            value={delimiterChoice}
            onChange={(e) =>
              setDelimiterChoice(e.target.value as DelimiterChoice)
            }
          >
            <option value="auto">{t.delimiterAuto}</option>
            <option value=",">{t.delimiterComma}</option>
            <option value=";">{t.delimiterSemicolon}</option>
            <option value={"\t"}>{t.delimiterTab}</option>
          </KitSelect>
        </Field>
        <FileInput
          label={t.pickFile}
          accept=".csv,.tsv,.txt,.json"
          onFile={(file) => void onFile(file)}
        />
      </div>

      {mode === "csvToJson" ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={firstRowIsHeader}
            onChange={(e) => setFirstRowIsHeader(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          <span>{t.firstRowHeader}</span>
        </label>
      ) : null}

      <Field label={t.input}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          spellCheck={false}
          className={`${fieldClass} font-mono`}
        />
      </Field>

      <ErrorBanner>{error ?? fileError}</ErrorBanner>

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
          className={`${fieldClass} bg-background font-mono`}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {mode === "csvToJson" ? (
          <button
            type="button"
            disabled={!output}
            onClick={downloadJson}
            className={primaryBtnClass}
          >
            {t.downloadJson}
          </button>
        ) : (
          <button
            type="button"
            disabled={!output}
            onClick={downloadCsv}
            className={primaryBtnClass}
          >
            {t.downloadCsv}
          </button>
        )}
        <button
          type="button"
          disabled={!(mode === "jsonToCsv" ? output : input).trim()}
          onClick={downloadExcel}
          className={secondaryBtnClass}
        >
          {t.downloadExcel}
        </button>
        {mode === "csvToJson" ? (
          <button
            type="button"
            disabled={!input.trim()}
            onClick={downloadCsv}
            className={secondaryBtnClass}
          >
            {t.downloadCsv}
          </button>
        ) : null}
      </div>
    </div>
  );
}
