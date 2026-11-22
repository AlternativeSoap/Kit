"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export const fieldClass =
  "kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-base outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:py-2 sm:text-sm";

export const primaryBtnClass =
  "kit-touch-target whitespace-nowrap rounded-[10px] bg-accent px-3.5 py-2.5 text-sm font-medium text-on-accent transition-[transform,opacity,background-color] duration-150 hover:brightness-[1.03] active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 sm:px-4 sm:py-2";

export const secondaryBtnClass =
  "kit-touch-target whitespace-nowrap rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-sm font-medium text-foreground transition-[transform,opacity,background-color,border-color] duration-150 hover:bg-overlay active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 sm:px-4 sm:py-2";

/** Full-width list row for catalog pickers (postnr, unnr, affald, …). */
export const pickerRowClass =
  "kit-picker-row kit-touch-target rounded-[10px] text-foreground hover:bg-overlay";

export const pickerRowActiveClass =
  "kit-picker-row kit-touch-target rounded-[10px] bg-accent-soft text-foreground";

export const fileInputClass =
  "block w-full text-sm text-muted file:mr-3 file:min-h-11 file:rounded-[8px] file:border-0 file:bg-accent file:px-3.5 file:py-2.5 file:text-sm file:font-medium file:text-on-accent disabled:opacity-50 sm:file:min-h-0 sm:file:py-2";

export function ErrorBanner({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-foreground"
    >
      {children}
    </p>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function FileInput({
  label,
  onFile,
  resetOnChange = true,
  className,
  inline = false,
  ...props
}: {
  label: string;
  onFile: (file: File | null) => void;
  resetOnChange?: boolean;
  /** Button-style control for horizontal action rails. */
  inline?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">) {
  const input = (
    <input
      {...props}
      type="file"
      className={inline ? "hidden" : (className ?? fileInputClass)}
      onChange={(e) => {
        const file = e.target.files?.[0] ?? null;
        if (resetOnChange) e.target.value = "";
        onFile(file);
      }}
    />
  );

  if (inline) {
    return (
      <label className={`${secondaryBtnClass} cursor-pointer`}>
        {label}
        {input}
      </label>
    );
  }

  return <Field label={label}>{input}</Field>;
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
  ariaLabel?: string;
}) {
  const scrollable = options.length > 3;
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`kit-segmented ${scrollable ? "kit-segmented-scroll" : ""}`}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={opt.id === value}
          onClick={() => onChange(opt.id)}
          className="kit-segmented-btn kit-touch-target"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function KitSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={props.className ?? fieldClass} />;
}

export function KitInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={props.className ?? fieldClass} />;
}
