"use client";

import { useMemo, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateCidr } from "./calc";

export function CidrTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.cidr;

  const [input, setInput] = useState(() => {
    if (prefill?.cidr) return prefill.cidr;
    const ip = prefill?.ip;
    const prefix = prefillNumber(prefill, "prefix", { min: 0, max: 32, integer: true });
    if (ip && prefix) return `${ip}/${prefix}`;
    return "192.168.1.0/24";
  });

  const result = useMemo(() => calculateCidr(input), [input]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t.input}</span>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            placeholder="192.168.0.0/24"
            className={`${fieldClass} font-mono`}
          />
          <span className="mt-1 block text-xs text-muted">{t.inputHint}</span>
        </label>
        <p className="text-sm text-muted">{t.ipv4Only}</p>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <dl className="space-y-2 py-3 text-sm">
            {(
              [
                ["network", result.network],
                ["broadcast", result.broadcast],
                ["firstUsable", result.firstUsable],
                ["lastUsable", result.lastUsable],
                ["hostCount", formatNumber(result.hostCount, locale, 0)],
                ["netmask", result.netmask],
                ["wildcard", result.wildcard],
              ] as const
            ).map(([key, value]) =>
              value ? (
                <div
                  key={key}
                  className="flex flex-col gap-2 border-b border-border/70 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:border-b-0 sm:py-0"
                >
                  <dt className="shrink-0 text-muted">{t[key]}</dt>
                  <dd className="flex min-w-0 flex-wrap items-center gap-2 font-mono text-[13px]">
                    <span className="min-w-0 break-all">{value}</span>
                    {key !== "hostCount" ? (
                      <CopyButton
                        value={value}
                        label={t.copy}
                        copiedLabel={t.copied}
                      />
                    ) : null}
                  </dd>
                </div>
              ) : null,
            )}
          </dl>
        ) : (
          <p className="py-8 text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}