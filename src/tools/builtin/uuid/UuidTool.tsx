"use client";

import { useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { primaryBtnClass } from "@/components/tools/ui";
import { useDictionary } from "@/i18n/LanguageProvider";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import {
  generateUuids,
  UUID_DEFAULT_COUNT,
  UUID_MAX_COUNT,
  UUID_MIN_COUNT,
} from "./calc";

export function UuidTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.uuid;

  const [count, setCount] = useState(() =>
    Number(
      prefillNumber(prefill, "count", {
        min: UUID_MIN_COUNT,
        max: UUID_MAX_COUNT,
        integer: true,
      }) ?? UUID_DEFAULT_COUNT,
    ),
  );
  const [uuids, setUuids] = useState(() => generateUuids(count));

  const regenerate = () => {
    setUuids(generateUuids(count));
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <label className="block">
        <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
          <span>{t.count}</span>
          <span className="text-muted">{count}</span>
        </span>
        <input
          type="range"
          min={UUID_MIN_COUNT}
          max={UUID_MAX_COUNT}
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
          className="kit-range w-full accent-[var(--accent)]"
        />
      </label>

      <button
        type="button"
        onClick={regenerate}
        className={primaryBtnClass}
      >
        {t.generate}
      </button>

      <ul className="space-y-2 rounded-[12px] border border-border bg-surface px-4 py-4">
        {uuids.map((id) => (
          <li key={id} className="flex items-center justify-between gap-3 font-mono text-sm">
            <span className="break-all">{id}</span>
            <CopyButton value={id} label={t.copy} copiedLabel={t.copied} />
          </li>
        ))}
      </ul>

      <CopyButton
        value={uuids.join("\n")}
        label={t.copyAll}
        copiedLabel={t.copied}
      />
    </div>
  );
}