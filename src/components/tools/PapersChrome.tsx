"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { primaryBtnClass, secondaryBtnClass, fieldClass } from "@/components/tools/ui";

export const papersIconBtnClass =
  "kit-touch-target inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-border bg-surface text-foreground disabled:opacity-40";

export const papersCompactBtnClass =
  "kit-touch-target inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[8px] border border-border bg-surface px-2.5 text-sm font-medium text-foreground disabled:opacity-40";

export function PapersIconBtn({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`${papersIconBtnClass} ${
        active ? "!border-accent !bg-accent !text-on-accent" : "hover:bg-accent-soft"
      }`}
    >
      {children}
    </button>
  );
}

export type PapersMenuItem =
  | {
      type: "action";
      id: string;
      label: string;
      onSelect: () => void;
      disabled?: boolean;
      danger?: boolean;
    }
  | {
      type: "file";
      id: string;
      label: string;
      accept: string;
      onFile: (file: File | null) => void;
      disabled?: boolean;
    }
  | { type: "sep"; id: string };

/** Compact dropdown for grouping secondary actions. */
export function PapersMenu({
  label,
  items,
  variant = "secondary",
  align = "left",
}: {
  label: string;
  items: PapersMenuItem[];
  variant?: "primary" | "secondary" | "compact";
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onDoc(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerClass =
    variant === "primary"
      ? primaryBtnClass
      : variant === "compact"
        ? papersCompactBtnClass
        : secondaryBtnClass;

  return (
    <div ref={rootRef} className="relative inline-flex shrink-0">
      <button
        type="button"
        className={`${triggerClass} inline-flex items-center gap-1.5`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden>
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
        <div
          id={menuId}
          role="menu"
          className={`kit-scrollbar absolute top-[calc(100%+4px)] z-[90] max-h-[min(18rem,50dvh)] min-w-[12rem] overflow-y-auto overscroll-contain rounded-[10px] border border-border bg-surface py-1 shadow-[0_10px_28px_rgba(20,20,20,0.16)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item) => {
            if (item.type === "sep") {
              return (
                <div
                  key={item.id}
                  className="my-1 border-t border-border"
                  role="separator"
                />
              );
            }
            if (item.type === "file") {
              return (
                <label
                  key={item.id}
                  role="menuitem"
                  className={`kit-touch-target flex cursor-pointer items-center px-3 py-2.5 text-sm hover:bg-accent-soft sm:min-h-0 sm:py-2 ${
                    item.disabled ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  {item.label}
                  <input
                    type="file"
                    accept={item.accept}
                    className="hidden"
                    disabled={item.disabled}
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      e.target.value = "";
                      setOpen(false);
                      item.onFile(file);
                    }}
                  />
                </label>
              );
            }
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={`kit-touch-target flex w-full items-center px-3 py-2.5 text-left text-sm hover:bg-accent-soft disabled:opacity-40 sm:min-h-0 sm:py-2 ${
                  item.danger ? "text-red-700" : ""
                }`}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/** Title + primary actions on one compact row. */
export function PapersDocBar({
  titleLabel,
  title,
  onTitleChange,
  children,
}: {
  titleLabel: string;
  title: string;
  onTitleChange: (value: string) => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
      <label className="min-w-0 flex-1">
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          {titleLabel}
        </span>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={fieldClass}
        />
      </label>
      {children ? (
        <div className="flex flex-wrap items-center gap-1.5 sm:pb-0.5">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/* Compact SVG icons used across Papers tools */
export const IconUndo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M4.5 6.5H10a3 3 0 1 1 0 6H8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M6.5 4 4 6.5 6.5 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconRedo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M11.5 6.5H6a3 3 0 1 0 0 6h2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M9.5 4 12 6.5 9.5 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M8 3.5v9M3.5 8h9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect
      x="5.5"
      y="5.5"
      width="7"
      height="7"
      rx="1.2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M10.5 5.5V4.2A1.2 1.2 0 0 0 9.3 3H4.2A1.2 1.2 0 0 0 3 4.2v5.1A1.2 1.2 0 0 0 4.2 10.5H5.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M3.5 5h9M6 5V3.8A.8.8 0 0 1 6.8 3h2.4a.8.8 0 0 1 .8.8V5M6.5 7.5v4M9.5 7.5v4M4.5 5l.6 7.2a1 1 0 0 0 1 .8h3.8a1 1 0 0 0 1-.8L11.5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconBringForward = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="3" y="6" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" />
    <rect x="6" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const IconSendBackward = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="6" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" />
    <rect x="3" y="6" width="7" height="7" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M5 3.8v8.4L12.2 8 5 3.8Z" fill="currentColor" />
  </svg>
);

export const IconRows = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M3 4.5h10M3 8h10M3 11.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 10.5v3M11.5 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconCols = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M4.5 3v10M8 3v10M11.5 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10.5 13h3M12 11.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconSortAsc = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M4 11V5M4 5 2.5 6.5M4 5l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 5h5M8 8h3.5M8 11h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconSortDesc = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M4 5v6M4 11l-1.5-1.5M4 11l1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 5h2M8 8h3.5M8 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconPrint = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M4.5 6V3.5h7V6M4.5 10.5H3.2A1.2 1.2 0 0 1 2 9.3V7.2A1.2 1.2 0 0 1 3.2 6h9.6A1.2 1.2 0 0 1 14 7.2v2.1a1.2 1.2 0 0 1-1.2 1.2H11.5M4.5 9.5h7v3.5h-7V9.5Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);
