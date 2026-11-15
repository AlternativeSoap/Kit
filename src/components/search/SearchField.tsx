"use client";

import { forwardRef } from "react";
import { KitMark } from "@/components/KitMark";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  compact?: boolean;
  id?: string;
  expanded?: boolean;
};

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      value,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      placeholder = "Search for a tool",
      label = "Search for a tool",
      compact = false,
      id = "kit-search",
      expanded = false,
    },
    ref,
  ) {
    return (
      <div className="group relative w-full transition-transform duration-200 ease-out sm:focus-within:scale-[1.01]">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <div
          className={`flex items-center gap-3 rounded-[12px] border bg-surface transition-[border-color,box-shadow] duration-200 ease-out ${
            compact
              ? "border-border px-3 py-2.5"
              : "border-border px-4 py-3.5 shadow-sm sm:py-4"
          } focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-soft)]`}
        >
          <KitMark
            className={`shrink-0 animate-[kit-mark-in_420ms_cubic-bezier(0.22,1,0.36,1)_both] ${
              compact ? "h-5 w-5" : "h-6 w-6"
            }`}
          />
          <input
            ref={ref}
            id={id}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            role="combobox"
            aria-autocomplete="list"
            aria-controls="kit-suggest"
            aria-expanded={expanded}
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className={`w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted sm:text-[17px] ${
              compact ? "sm:text-[16px]" : ""
            }`}
          />
        </div>
      </div>
    );
  },
);
