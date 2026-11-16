"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import {
  buildFlags,
  highlightSegments,
  testRegex,
  type RegexFlagKey,
} from "./calc";

const FLAG_KEYS: RegexFlagKey[] = ["g", "i", "m", "s", "u", "y"];

export function RegexTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.regexTool;
  const flagTitles: Record<RegexFlagKey, string> = {
    g: t.flag_g,
    i: t.flag_i,
    m: t.flag_m,
    s: t.flag_s,
    u: t.flag_u,
    y: t.flag_y,
  };

  const [pattern, setPattern] = useState(() => prefill?.value ?? "\\d+");
  const [text, setText] = useState("Order #42 costs 19.95 and order #7 costs 3.");
  const [flags, setFlags] = useState<Partial<Record<RegexFlagKey, boolean>>>({
    g: true,
  });

  const flagString = useMemo(() => buildFlags(flags), [flags]);
  const result = useMemo(
    () => testRegex(pattern, flagString, text),
    [flagString, pattern, text],
  );
  const segments = useMemo(
    () => (result.ok ? highlightSegments(text, result.matches) : [{ text, hit: false }]),
    [result, text],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-muted">{t.privacy}</p>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="block min-w-0">
          <span className="mb-1.5 block text-sm font-medium">{t.pattern}</span>
          <input
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            spellCheck={false}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[14px]"
          />
        </label>
        <div>
          <span className="mb-1.5 block text-sm font-medium">{t.flags}</span>
          <div className="flex flex-wrap gap-1.5">
            {FLAG_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setFlags((prev) => ({ ...prev, [key]: !prev[key] }))
                }
                className={`kit-touch-target rounded-[8px] border px-2.5 py-2 font-mono text-sm sm:min-h-0 ${
                  flags[key]
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-muted hover:text-foreground"
                }`}
                title={flagTitles[key]}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.testText}</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={8}
          spellCheck={false}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[14px]"
        />
      </label>

      {!result.ok ? (
        <div className="rounded-[12px] border border-border bg-surface px-4 py-3 text-sm text-muted">
          <p className="font-medium text-foreground">{t.invalid}</p>
          <p className="mt-1 break-words">{result.error}</p>
        </div>
      ) : (
        <>
          <div className="rounded-[12px] border border-border bg-surface px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {t.matchCount.replace("{count}", String(result.matches.length))}
              </p>
              <CopyButton
                value={result.matches.map((m) => m.text).join("\n")}
                label={t.copy}
                copiedLabel={t.copied}
              />
            </div>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed">
              {segments.map((part, index) =>
                part.hit ? (
                  <mark
                    key={index}
                    className="rounded-[3px] bg-accent/25 px-0.5 text-foreground"
                  >
                    {part.text || " "}
                  </mark>
                ) : (
                  <span key={index}>{part.text}</span>
                ),
              )}
            </pre>
          </div>

          {result.matches.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t.matches}</p>
              <ul className="space-y-2">
                {result.matches.map((match, index) => (
                  <li
                    key={`${match.index}-${index}`}
                    className="rounded-[10px] border border-border bg-surface px-3 py-2 font-mono text-sm"
                  >
                    <span className="text-muted">
                      #{index + 1} @ {match.index}:{" "}
                    </span>
                    <span className="text-foreground">{match.text || "(empty)"}</span>
                    {match.groups.some(Boolean) ? (
                      <span className="mt-1 block text-xs text-muted">
                        {t.groups}: {match.groups.map((g, i) => `$${i + 1}=${JSON.stringify(g)}`).join(" ")}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
