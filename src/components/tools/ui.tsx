"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export const fieldClass =
  "kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]";

export const primaryBtnClass =
  "kit-touch-target rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 sm:min-h-0";

export const secondaryBtnClass =
  "kit-touch-target rounded-[10px] border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground disabled:opacity-40 sm:min-h-0";

export const fileInputClass =
  "block w-full text-sm text-muted file:mr-3 file:rounded-[8px] file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white disabled:opacity-50";

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
  ...props
}: {
  label: string;
  onFile: (file: File | null) => void;
  resetOnChange?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">) {
  return (
    <Field label={label}>
      <input
        {...props}
        type="file"
        className={className ?? fileInputClass}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (resetOnChange) e.target.value = "";
          onFile(file);
        }}
      />
    </Field>
  );
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
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-2"
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm sm:min-h-0 ${
              active
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function KitSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={props.className ?? fieldClass} />;
}

export function KitInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={props.className ?? fieldClass} />;
}
