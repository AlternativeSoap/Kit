"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import {
  generatePassword,
  PASSWORD_DEFAULT_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./calc";

export function PasswordTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.password;

  const [length, setLength] = useState(() =>
    Number(
      prefillNumber(prefill, "length", {
        min: PASSWORD_MIN_LENGTH,
        max: PASSWORD_MAX_LENGTH,
        integer: true,
      }) ?? PASSWORD_DEFAULT_LENGTH,
    ),
  );
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState(() =>
    generatePassword({
      length,
      lower: true,
      upper: true,
      numbers: true,
      symbols: true,
    }) ?? "",
  );

  const canGenerate = useMemo(
    () => lower || upper || numbers || symbols,
    [lower, upper, numbers, symbols],
  );

  const regenerate = () => {
    const next = generatePassword({ length, lower, upper, numbers, symbols });
    if (next) setPassword(next);
  };

  useEffect(() => {
    if (!canGenerate) {
      setPassword("");
      return;
    }
    const next = generatePassword({ length, lower, upper, numbers, symbols });
    if (next) setPassword(next);
  }, [canGenerate, length, lower, numbers, symbols, upper]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-[12px] border border-border bg-surface px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <p className="break-all font-mono text-lg tracking-tight">{password || "—"}</p>
          {password ? (
            <CopyButton value={password} label={t.copy} copiedLabel={t.copied} />
          ) : null}
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
          <span>{t.length}</span>
          <span className="text-muted">{length}</span>
        </span>
        <input
          type="range"
          min={PASSWORD_MIN_LENGTH}
          max={PASSWORD_MAX_LENGTH}
          value={length}
          onChange={(event) => setLength(Number(event.target.value))}
          className="w-full accent-[var(--accent)]"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["lower", lower, setLower, t.lower],
            ["upper", upper, setUpper, t.upper],
            ["numbers", numbers, setNumbers, t.numbers],
            ["symbols", symbols, setSymbols, t.symbols],
          ] as const
        ).map(([key, value, setter, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value}
              onChange={(event) => setter(event.target.checked)}
              className="h-4 w-4 rounded border-border accent-[var(--accent)]"
            />
            {label}
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={regenerate}
        disabled={!canGenerate}
        className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {t.generate}
      </button>

      {!canGenerate ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : null}
      <p className="text-xs text-muted">{t.disclaimer}</p>
    </div>
  );
}
