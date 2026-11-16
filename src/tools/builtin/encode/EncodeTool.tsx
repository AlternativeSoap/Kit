"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import {
  prefillChoice,
  type ToolPrefill,
} from "@/tools/prefill";
import {
  processEncode,
  type EncodeAction,
  type EncodeMode,
} from "./calc";

const MODES: readonly EncodeMode[] = ["base64", "url"];
const ACTIONS: readonly EncodeAction[] = ["encode", "decode"];

export function EncodeTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.encode;

  const [mode, setMode] = useState<EncodeMode>(
    prefillChoice(prefill, "mode", MODES) ?? "base64",
  );
  const [action, setAction] = useState<EncodeAction>(
    prefillChoice(prefill, "action", ACTIONS) ?? "encode",
  );
  const [input, setInput] = useState(() => prefill?.value ?? "");

  const result = useMemo(
    () => processEncode(input, mode, action),
    [action, input, mode],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="inline-flex rounded-[10px] border border-border bg-surface p-1">
          {MODES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`kit-touch-target rounded-[8px] px-3 py-1.5 text-sm transition-colors sm:min-h-0 ${
                mode === item
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {item === "base64" ? t.tabBase64 : t.tabUrl}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-[10px] border border-border bg-surface p-1">
          {ACTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setAction(item)}
              className={`kit-touch-target rounded-[8px] px-3 py-1.5 text-sm transition-colors sm:min-h-0 ${
                action === item
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {item === "encode" ? t.encode : t.decode}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t.input}</span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={8}
            spellCheck={false}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[14px]"
          />
        </label>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between gap-3 text-sm font-medium">
            <span>{t.output}</span>
            {result.ok && result.output ? (
              <CopyButton
                value={result.output}
                label={t.copy}
                copiedLabel={t.copied}
              />
            ) : null}
          </span>
          {!result.ok ? (
            <div className="rounded-[12px] border border-border bg-surface px-4 py-3 text-sm text-muted">
              <p className="font-medium text-foreground">
                {result.error === "invalid_base64"
                  ? t.invalidBase64
                  : t.invalidUri}
              </p>
            </div>
          ) : (
            <textarea
              readOnly
              value={result.output}
              rows={8}
              spellCheck={false}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-base outline-none sm:text-[14px]"
            />
          )}
        </label>
      </div>
    </div>
  );
}