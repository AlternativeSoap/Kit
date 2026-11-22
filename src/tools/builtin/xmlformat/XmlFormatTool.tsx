"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import { processXml, type XmlMode } from "./calc";

const MODES: readonly XmlMode[] = ["format", "minify", "validate"];

const SAMPLE = `<note>
  <to>Ada</to>
  <from>Kit</from>
  <body>Hello</body>
</note>`;

export function XmlFormatTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<XmlMode>(
    prefillChoice(prefill, "mode", MODES) ?? "format",
  );
  const [input, setInput] = useState(
    () => prefill?.value ?? prefill?.xml ?? SAMPLE,
  );

  const result = useMemo(() => processXml(input, mode), [input, mode]);

  const modes: { id: XmlMode; label: string }[] = [
    { id: "format", label: da ? "Formatér" : "Format" },
    { id: "minify", label: da ? "Minificér" : "Minify" },
    { id: "validate", label: da ? "Validér" : "Validate" },
  ];

  const emptyError = da ? "Indsæt XML for at fortsætte." : "Paste XML to continue.";
  const invalidTitle = da ? "Ugyldigt XML" : "Invalid XML";
  const validLabel = da ? "XML er gyldigt." : "XML is valid.";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm sm:min-h-0 ${
              mode === item.id
                ? "border-accent bg-accent text-on-accent"
                : "border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">
          {da ? "Input" : "Input"}
        </span>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={10}
          spellCheck={false}
          className={`${fieldClass} font-mono`}
        />
      </label>

      {!result.ok ? (
        <div className="rounded-[12px] border border-border bg-surface px-4 py-3 text-sm text-muted">
          <p className="font-medium text-foreground">{invalidTitle}</p>
          <p className="mt-1 break-words">
            {result.error === "empty" ? emptyError : result.error}
          </p>
          {result.line !== undefined ? (
            <p className="mt-1">
              {da
                ? `Linje ${result.line}${result.column !== undefined ? `, kolonne ${result.column}` : ""}`
                : `Line ${result.line}${result.column !== undefined ? `, column ${result.column}` : ""}`}
            </p>
          ) : null}
        </div>
      ) : mode === "validate" ? (
        <p className="rounded-[12px] border border-border bg-surface px-4 py-3 text-sm text-foreground">
          {validLabel}
        </p>
      ) : (
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
            <span>{da ? "Output" : "Output"}</span>
            {result.output ? (
              <CopyButton
                value={result.output}
                label={da ? "Kopiér" : "Copy"}
                copiedLabel={da ? "Kopieret" : "Copied"}
              />
            ) : null}
          </span>
          <textarea
            readOnly
            value={result.output}
            rows={10}
            spellCheck={false}
            className={`${fieldClass} bg-background font-mono`}
          />
        </label>
      )}
    </div>
  );
}
