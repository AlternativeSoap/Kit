"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDictionary } from "@/i18n/LanguageProvider";
import { FORMULAS, type FormulaId } from "./formulas";

type FormulaPickerProps = {
  value: FormulaId;
  onChange: (id: FormulaId) => void;
};

function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

export function FormulaPicker({ value, onChange }: FormulaPickerProps) {
  const dictionary = useDictionary();
  const t = dictionary.calculator;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = t.formulas[value];

  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    return FORMULAS.filter((item) => {
      const copy = t.formulas[item.id];
      if (!q) return true;
      const haystack = normalizeSearch(
        `${copy.name} ${copy.help} ${copy.keywords}`,
      );
      return haystack.includes(q);
    });
  }, [query, t.formulas]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => inputRef.current?.focus());
    }
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full">
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.06em] text-muted">
        {t.formulaLabel}
      </label>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className="kit-touch-target flex w-full items-center justify-between gap-3 rounded-[12px] border border-border bg-surface px-3.5 py-3 text-left transition-colors hover:border-accent/40 sm:min-h-0"
      >
        <span>
          <span className="block text-sm font-medium text-foreground">
            {selected.name}
          </span>
          <span className="mt-0.5 block text-xs text-muted line-clamp-1">
            {selected.help}
          </span>
        </span>
        <span className="shrink-0 text-muted" aria-hidden>
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-[12px] border border-border bg-surface shadow-suggest">
          <div className="border-b border-border p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.formulaSearch}
              aria-label={t.formulaSearch}
              className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-base outline-none focus:border-accent sm:py-2 sm:text-sm"
            />
          </div>
          <ul
            role="listbox"
            aria-label={t.formulaLabel}
            className="kit-scrollbar max-h-[min(16rem,50dvh)] overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted">{t.formulaEmpty}</li>
            ) : (
              filtered.map((item) => {
                const copy = t.formulas[item.id];
                const active = item.id === value;
                return (
                  <li key={item.id} role="option" aria-selected={active}>
                    <button
                      type="button"
                      className={`flex min-h-11 w-full flex-col items-start px-3 py-2.5 text-left transition-colors sm:min-h-0 ${
                        active
                          ? "bg-accent-soft"
                          : "hover:bg-background"
                      }`}
                      onClick={() => {
                        onChange(item.id);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {copy.name}
                      </span>
                      <span className="mt-0.5 text-xs text-muted">
                        {copy.help}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
