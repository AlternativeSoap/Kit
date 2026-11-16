"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillChoice, prefillNumber, type ToolPrefill } from "@/tools/prefill";
import {
  percentChange,
  percentOf,
  percentShare,
  type ProcentMode,
} from "./calc";

const MODES: readonly ProcentMode[] = ["of", "change", "share"];

export function ProcentTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.procent;

  const [mode, setMode] = useState<ProcentMode>(
    prefillChoice(prefill, "mode", MODES) ?? "of",
  );
  const [a, setA] = useState(prefillNumber(prefill, "a") ?? "20");
  const [b, setB] = useState(prefillNumber(prefill, "b") ?? "250");

  const result = useMemo(() => {
    const x = Number(a.replace(",", "."));
    const y = Number(b.replace(",", "."));
    if (mode === "of") return percentOf(x, y);
    if (mode === "change") return percentChange(x, y);
    return percentShare(x, y);
  }, [a, b, mode]);

  const modes: { id: ProcentMode; label: string }[] = [
    { id: "of", label: t.modeOf },
    { id: "change", label: t.modeChange },
    { id: "share", label: t.modeShare },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm transition-colors sm:min-h-0 ${
                mode === item.id
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">
            {mode === "of" ? t.percent : mode === "change" ? t.from : t.part}
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={a}
            onChange={(event) => setA(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">
            {mode === "of" ? t.base : mode === "change" ? t.to : t.whole}
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={b}
            onChange={(event) => setB(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </label>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-5">
        {result !== null ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted">{t.result}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">
                  {mode === "of"
                    ? formatNumber(result, locale, 2)
                    : `${formatNumber(result, locale, 2)} %`}
                </p>
              </div>
              <CopyButton
                value={formatNumber(result, locale, 2)}
                label={t.copy}
                copiedLabel={t.copied}
              />
            </div>
            <p className="mt-4 text-sm text-muted">
              {mode === "of"
                ? t.explainOf
                    .replace("{p}", a)
                    .replace("{b}", b)
                    .replace("{r}", formatNumber(result, locale, 2))
                : mode === "change"
                  ? t.explainChange.replace(
                      "{r}",
                      formatNumber(result, locale, 2),
                    )
                  : t.explainShare.replace(
                      "{r}",
                      formatNumber(result, locale, 2),
                    )}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}
