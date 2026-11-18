"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import {
  dateToUnix,
  formatLocal,
  formatUtcIso,
  parseIsoInput,
  parseUnixInput,
  type TimestampUnit,
} from "./calc";

export function TimestampTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.timestamp;

  const [unit, setUnit] = useState<TimestampUnit>(
    () => prefillChoice(prefill, "unit", ["s", "ms"] as const) ?? "s",
  );
  const [unix, setUnix] = useState(() => prefill?.value ?? String(Math.floor(Date.now() / 1000)));
  const [iso, setIso] = useState(() => new Date().toISOString());

  const fromUnix = useMemo(() => parseUnixInput(unix, unit), [unix, unit]);
  const fromIso = useMemo(() => parseIsoInput(iso), [iso]);

  const active = fromUnix ?? fromIso;

  const details = active
    ? {
        utc: formatUtcIso(active),
        local: formatLocal(active, locale),
        unixS: dateToUnix(active, "s"),
        unixMs: dateToUnix(active, "ms"),
      }
    : null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex gap-2">
        {(
          [
            ["s", t.seconds],
            ["ms", t.millis],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setUnit(id)}
            className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm sm:min-h-0 ${
              unit === id
                ? "border-accent bg-accent text-on-accent"
                : "border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.unix}</span>
        <input
          type="text"
          inputMode="numeric"
          value={unix}
          onChange={(event) => setUnix(event.target.value)}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.iso}</span>
        <input
          type="text"
          value={iso}
          onChange={(event) => setIso(event.target.value)}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
        />
      </label>

      {details ? (
        <div className="space-y-3 rounded-[12px] border border-border bg-surface px-4 py-4">
          {(
            [
              [t.utc, details.utc],
              [t.local, details.local],
              [t.unixSeconds, details.unixS],
              [t.unixMillis, details.unixMs],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted">{label}</p>
                <p className="font-mono text-sm">{value}</p>
              </div>
              <CopyButton value={value} label={t.copy} copiedLabel={t.copied} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">{t.empty}</p>
      )}

      {fromUnix ? (
        <button
          type="button"
          onClick={() => setIso(fromUnix.toISOString())}
          className="text-sm text-muted underline-offset-2 hover:text-foreground hover:underline"
        >
          {t.syncIso}
        </button>
      ) : null}
    </div>
  );
}