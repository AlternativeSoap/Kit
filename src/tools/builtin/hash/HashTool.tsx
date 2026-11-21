"use client";

import { useEffect, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import { digestText, type HashAlgorithm } from "./calc";

const ALGORITHMS: readonly HashAlgorithm[] = ["SHA-256", "SHA-1"];

export function HashTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.hash;

  const [algorithm, setAlgorithm] = useState<HashAlgorithm>(
    prefillChoice(prefill, "algo", ALGORITHMS) ??
      prefillChoice(prefill, "algorithm", ALGORITHMS) ??
      "SHA-256",
  );
  const [input, setInput] = useState(() => prefill?.text ?? "");
  const [digest, setDigest] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setUnsupported(false);

    if (!input) {
      setDigest(null);
      return;
    }

    void digestText(input, algorithm).then((value) => {
      if (cancelled) return;
      if (value === null) {
        setUnsupported(true);
        setDigest(null);
      } else {
        setDigest(value);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [algorithm, input]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t.algorithm}</span>
          <select
            value={algorithm}
            onChange={(event) =>
              setAlgorithm(event.target.value as HashAlgorithm)
            }
            className={fieldClass}
          >
            {ALGORITHMS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t.input}</span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={8}
            spellCheck={false}
            className={`${fieldClass} font-mono`}
          />
          <span className="mt-1 block text-xs text-muted">{t.privacy}</span>
        </label>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-4">
        {unsupported ? (
          <p className="text-sm text-muted">{t.unsupported}</p>
        ) : digest ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="break-all font-mono text-sm leading-relaxed">
                {digest}
              </p>
              <CopyButton
                value={digest}
                label={t.copy}
                copiedLabel={t.copied}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}