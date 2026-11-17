"use client";

import { useEffect, useId, useState } from "react";
import { fieldClass } from "@/components/tools/ui";

export const FONT_SIZE_PRESETS = [
  10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72,
] as const;

/** Number field that accepts any size (type a value) with preset suggestions. */
export function FontSizeInput({
  value,
  onChange,
  title,
  className,
  compact,
}: {
  value: number;
  onChange: (size: number) => void;
  title?: string;
  className?: string;
  compact?: boolean;
}) {
  const listId = useId();
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit() {
    const parsed = Number(String(draft).replace(",", "."));
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const next = Math.min(200, Math.max(6, Math.round(parsed)));
    setDraft(String(next));
    if (next !== value) onChange(next);
  }

  return (
    <>
      <input
        type="number"
        inputMode="numeric"
        min={6}
        max={200}
        step={1}
        list={listId}
        value={draft}
        title={title}
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
            (e.target as HTMLInputElement).blur();
          }
        }}
        className={
          className ??
          `${fieldClass} ${compact ? "h-8 w-[3.4rem] py-1 text-xs" : "w-[4.2rem] py-1 text-xs"}`
        }
      />
      <datalist id={listId}>
        {FONT_SIZE_PRESETS.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </>
  );
}
