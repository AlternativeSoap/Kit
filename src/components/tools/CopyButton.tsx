"use client";

import { useState } from "react";
import { copyText } from "@/lib/clipboard";

export function CopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          const ok = await copyText(value);
          if (!ok) return;
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        }}
        className="kit-touch-target inline-flex items-center justify-center rounded-[8px] border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-background hover:text-foreground sm:px-2.5 sm:py-1"
      >
        {copied ? copiedLabel : label}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}
