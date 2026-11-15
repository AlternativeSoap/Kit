"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import { parseUserAgent } from "./calc";

export function UaTool() {
  const dictionary = useDictionary();
  const t = dictionary.uaTool;
  const [ua, setUa] = useState("");

  useEffect(() => {
    setUa(navigator.userAgent);
  }, []);

  const info = useMemo(() => parseUserAgent(ua), [ua]);

  const rows = [
    { label: t.browser, value: info.browser },
    { label: t.engine, value: info.engine },
    { label: t.os, value: info.os },
    { label: t.device, value: info.device },
    { label: t.mobile, value: info.mobile ? t.yes : t.no },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <p className="text-sm text-muted">{t.privacy}</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setUa(navigator.userAgent)}
          className="rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-foreground"
        >
          {t.useCurrent}
        </button>
      </div>

      <label className="block">
        <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
          <span>{t.userAgent}</span>
          <CopyButton value={ua} label={t.copy} copiedLabel={t.copied} />
        </span>
        <textarea
          value={ua}
          onChange={(event) => setUa(event.target.value)}
          rows={5}
          spellCheck={false}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-[13px] outline-none focus:border-accent"
        />
      </label>

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm"
          >
            <span className="text-muted">{row.label}</span>
            <span className="font-medium text-foreground">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
