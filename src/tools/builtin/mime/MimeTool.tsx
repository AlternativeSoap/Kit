"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { fieldClass } from "@/components/tools/ui";
import { useDictionary } from "@/i18n/LanguageProvider";
import { extensionToMime, mimeToExtensions } from "./calc";

export function MimeTool() {
  const dictionary = useDictionary();
  const t = dictionary.mimeTool;
  const [input, setInput] = useState("png");

  const result = useMemo(() => {
    const asMime = mimeToExtensions(input);
    if (asMime.length) {
      return {
        kind: "mime" as const,
        mime: input.trim().toLowerCase(),
        extensions: asMime,
      };
    }
    const mime = extensionToMime(input);
    if (mime) {
      return {
        kind: "ext" as const,
        extension: input.trim().toLowerCase().replace(/^\./, "").split(".").pop()!,
        mime,
      };
    }
    return null;
  }, [input]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <p className="text-sm text-muted">{t.privacy}</p>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.input}</span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t.placeholder}
          spellCheck={false}
          className={`${fieldClass} font-mono`}
        />
        <span className="mt-1 block text-xs text-muted">{t.hint}</span>
      </label>

      {!result ? (
        <p className="text-sm text-muted">{t.unknown}</p>
      ) : result.kind === "ext" ? (
        <div className="rounded-[12px] border border-border bg-surface px-4 py-3 space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted">{t.mimeType}</p>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-foreground">{result.mime}</p>
            <CopyButton value={result.mime} label={t.copy} copiedLabel={t.copied} />
          </div>
        </div>
      ) : (
        <div className="rounded-[12px] border border-border bg-surface px-4 py-3 space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted">{t.extensions}</p>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-foreground">
              {result.extensions.map((ext) => `.${ext}`).join(", ")}
            </p>
            <CopyButton
              value={result.extensions.map((ext) => `.${ext}`).join(", ")}
              label={t.copy}
              copiedLabel={t.copied}
            />
          </div>
        </div>
      )}
    </div>
  );
}
