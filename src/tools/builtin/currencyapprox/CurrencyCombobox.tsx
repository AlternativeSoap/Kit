"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import {
  CURRENCIES,
  filterCurrencies,
  resolveCurrencyCode,
  type CurrencyOption,
} from "./currencies";

function labelFor(option: CurrencyOption, da: boolean) {
  return `${option.code} · ${da ? option.nameDa : option.nameEn}`;
}

export function CurrencyCombobox({
  value,
  onChange,
  da,
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  da: boolean;
  label: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [browseAll, setBrowseAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setBrowseAll(false);
      }
    }
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  const filtered = useMemo(() => {
    if (browseAll && !draft.trim()) return CURRENCIES;
    const hits = filterCurrencies(draft, da ? "da" : "en");
    if (hits.length > 0) return hits;
    return browseAll ? CURRENCIES : [];
  }, [browseAll, draft, da]);

  useEffect(() => {
    setActiveIndex(0);
  }, [draft, open, browseAll]);

  function commit(raw = draft) {
    const next = resolveCurrencyCode(raw);
    setDraft(next);
    if (next && next !== value) onChange(next);
  }

  function pick(option: CurrencyOption) {
    setDraft(option.code);
    setOpen(false);
    setBrowseAll(false);
    if (option.code !== value) onChange(option.code);
    inputRef.current?.blur();
  }

  function toggleList() {
    if (open) {
      setOpen(false);
      setBrowseAll(false);
      return;
    }
    setBrowseAll(true);
    setOpen(true);
    inputRef.current?.focus();
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && filtered[activeIndex]
            ? `${listId}-${filtered[activeIndex]!.code}`
            : undefined
        }
        aria-label={label}
        value={draft}
        autoComplete="off"
        spellCheck={false}
        placeholder={da ? "Søg fx USD eller dollar" : "Search e.g. USD or dollar"}
        onChange={(e) => {
          setDraft(e.target.value);
          setBrowseAll(false);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => {
            if (!rootRef.current?.contains(document.activeElement)) {
              setOpen(false);
              setBrowseAll(false);
              commit();
            }
          }, 0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActiveIndex((i) =>
              filtered.length === 0 ? 0 : Math.min(i + 1, filtered.length - 1),
            );
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            setActiveIndex((i) => Math.max(i - 1, 0));
            return;
          }
          if (e.key === "Enter") {
            e.preventDefault();
            const hit = filtered[activeIndex];
            if (open && hit) {
              pick(hit);
              return;
            }
            setOpen(false);
            commit();
            inputRef.current?.blur();
            return;
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            setBrowseAll(false);
            setDraft(value);
          }
        }}
        className={`${fieldClass} w-full pr-9`}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={da ? "Vis alle valutaer" : "Show all currencies"}
        aria-expanded={open}
        className="kit-touch-target absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-foreground sm:w-9"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          toggleList();
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2.5 4.25 6 7.75l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="kit-scrollbar absolute left-0 right-0 top-[calc(100%+4px)] z-[95] max-h-[min(15rem,45dvh)] overflow-y-auto overscroll-contain rounded-[10px] border border-border bg-surface py-1 shadow-suggest touch-pan-y"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">
              {da ? "Ingen match. Tryk Enter for at bruge koden." : "No match. Press Enter to use the code."}
            </li>
          ) : (
            filtered.map((option, index) => {
              const active = option.code === value.toUpperCase();
              const highlighted = index === activeIndex;
              return (
                <li
                  key={option.code}
                  id={`${listId}-${option.code}`}
                  role="option"
                  aria-selected={active}
                >
                  <button
                    type="button"
                    className={`kit-touch-target flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-accent-soft sm:min-h-0 sm:py-2 ${
                      highlighted || active ? "bg-accent-soft" : ""
                    } ${active ? "font-semibold" : ""}`}
                    onClick={() => pick(option)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span className="w-10 font-mono text-[13px]">
                      {option.code}
                    </span>
                    <span className="min-w-0 truncate text-muted">
                      {da ? option.nameDa : option.nameEn}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
