"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  PAPER_FONTS,
  displayFontLabel,
  resolveFontFamily,
  type PaperFont,
} from "@/lib/papers/fonts";
import { fieldClass } from "@/components/tools/ui";

function matchesQuery(font: PaperFont, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    font.label.toLowerCase().includes(q) ||
    font.id.toLowerCase().includes(q) ||
    font.keywords?.some((k) => k.includes(q)) === true
  );
}

/** Typeable font field with a dropdown of all fonts for Skriv, Ark, and Dias. */
export function FontFamilyInput({
  value,
  onChange,
  title,
  className,
  placeholder,
}: {
  value: string;
  onChange: (fontFamily: string) => void;
  title?: string;
  className?: string;
  placeholder?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(() => displayFontLabel(value));
  const [open, setOpen] = useState(false);
  const [browseAll, setBrowseAll] = useState(false);

  useEffect(() => {
    setDraft(displayFontLabel(value));
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
    if (browseAll || !draft.trim()) return PAPER_FONTS;
    const hits = PAPER_FONTS.filter((f) => matchesQuery(f, draft.trim()));
    return hits.length > 0 ? hits : PAPER_FONTS;
  }, [browseAll, draft]);

  function commit(raw = draft) {
    const next = resolveFontFamily(raw);
    setDraft(displayFontLabel(next));
    if (next !== value) onChange(next);
  }

  function pick(font: PaperFont) {
    setDraft(font.label);
    setOpen(false);
    setBrowseAll(false);
    if (font.id !== value) onChange(font.id);
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

  const rootGrow = className?.includes("flex-none") ? "shrink-0" : "flex-1";

  return (
    <div
      ref={rootRef}
      className={`relative min-w-0 ${rootGrow}`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        value={draft}
        title={title}
        aria-label={title}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => {
          setDraft(e.target.value);
          setBrowseAll(false);
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
          if (e.key === "Enter") {
            e.preventDefault();
            setOpen(false);
            setBrowseAll(false);
            commit();
            inputRef.current?.blur();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            setBrowseAll(false);
            setDraft(displayFontLabel(value));
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setBrowseAll(true);
            setOpen(true);
          }
        }}
        className={`${className ?? `${fieldClass} min-w-0`} w-full pr-8`}
        style={{ fontFamily: value }}
      />
      <button
        type="button"
        tabIndex={-1}
        title={title}
        aria-label={title}
        aria-expanded={open}
        className="kit-touch-target absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-foreground sm:w-8"
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
          className="kit-scrollbar absolute left-0 right-0 top-[calc(100%+4px)] z-[95] max-h-[min(14rem,42dvh)] overflow-y-auto overscroll-contain rounded-[10px] border border-border bg-surface py-1 shadow-suggest touch-pan-y"
        >
          {filtered.map((font) => {
            const active = displayFontLabel(value) === font.label;
            return (
              <li key={font.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`kit-touch-target flex w-full items-center px-3 py-2.5 text-left text-sm hover:bg-accent-soft sm:min-h-0 sm:py-2 ${
                    active ? "bg-accent-soft font-semibold" : ""
                  }`}
                  style={{ fontFamily: font.id }}
                  onClick={() => pick(font)}
                >
                  {font.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
