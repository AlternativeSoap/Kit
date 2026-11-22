"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import { processYamlJson, type YamlJsonMode } from "./calc";

const MODES: readonly YamlJsonMode[] = ["jsonToYaml", "yamlToJson"];

const SAMPLE_JSON = `{
  "name": "Kit",
  "tags": ["tools", "local"],
  "meta": {
    "active": true,
    "count": 3
  }
}`;

const SAMPLE_YAML = `name: Kit
tags:
  - tools
  - local
meta:
  active: true
  count: 3
`;

export function YamlJsonTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<YamlJsonMode>(
    prefillChoice(prefill, "mode", MODES) ?? "jsonToYaml",
  );
  const [input, setInput] = useState(() => {
    if (prefill?.value) return prefill.value;
    if (prefill?.json) return prefill.json;
    if (prefill?.yaml) return prefill.yaml;
    const initialMode =
      prefillChoice(prefill, "mode", MODES) ?? "jsonToYaml";
    return initialMode === "yamlToJson" ? SAMPLE_YAML : SAMPLE_JSON;
  });

  const result = useMemo(() => processYamlJson(input, mode), [input, mode]);

  const modes: { id: YamlJsonMode; label: string }[] = [
    { id: "jsonToYaml", label: da ? "JSON → YAML" : "JSON → YAML" },
    { id: "yamlToJson", label: da ? "YAML → JSON" : "YAML → JSON" },
  ];

  const emptyError =
    mode === "jsonToYaml"
      ? da
        ? "Indsæt JSON for at konvertere."
        : "Paste JSON to convert."
      : da
        ? "Indsæt YAML for at konvertere."
        : "Paste YAML to convert.";

  const invalidTitle =
    mode === "jsonToYaml"
      ? da
        ? "Ugyldigt JSON"
        : "Invalid JSON"
      : da
        ? "Ugyldigt YAML"
        : "Invalid YAML";

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
          {mode === "jsonToYaml"
            ? da
              ? "JSON"
              : "JSON"
            : da
              ? "YAML"
              : "YAML"}
        </span>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={12}
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
        </div>
      ) : (
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
            <span>
              {mode === "jsonToYaml"
                ? da
                  ? "YAML"
                  : "YAML"
                : da
                  ? "JSON"
                  : "JSON"}
            </span>
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
            rows={12}
            spellCheck={false}
            className={`${fieldClass} bg-background font-mono`}
          />
        </label>
      )}
    </div>
  );
}
