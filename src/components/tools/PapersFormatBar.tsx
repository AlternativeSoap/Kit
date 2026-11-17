"use client";

import type { ReactNode } from "react";
import { FontSizeInput } from "@/components/tools/FontSizeInput";
import { secondaryBtnClass } from "@/components/tools/ui";

export type PapersAlign = "left" | "center" | "right";
export type PapersBlockStyle = "p" | "h1" | "h2";

export type PapersFormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: PapersAlign;
  color: string;
  background: string;
  fontFamily: string;
  fontSize: number;
  /** Present for Skriv text styles (title / heading / paragraph). */
  block?: PapersBlockStyle;
};

export type PapersFormatLabels = {
  bold: string;
  italic: string;
  underline: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  textColor: string;
  fillColor: string;
  fontFamily: string;
  fontSize: string;
  textStyle?: string;
  styleTitle?: string;
  styleHeading?: string;
  paragraph?: string;
};

const FONTS = [
  { id: "Calibri, 'Segoe UI', system-ui, sans-serif", label: "Calibri" },
  { id: "Georgia, 'Times New Roman', serif", label: "Georgia" },
  { id: "'Times New Roman', Times, serif", label: "Times" },
  { id: "Arial, Helvetica, sans-serif", label: "Arial" },
  { id: "system-ui, sans-serif", label: "Sans" },
  { id: "ui-monospace, monospace", label: "Mono" },
] as const;

/** Compact field styles for ribbon controls (never w-full). */
const ribbonSelectClass =
  "h-10 min-w-0 flex-1 rounded-[8px] border border-border bg-white px-2.5 text-base font-medium text-[#141414] outline-none focus:border-accent sm:h-9 sm:text-sm";

const ribbonSizeClass =
  "h-10 w-[4.25rem] shrink-0 rounded-[8px] border border-border bg-white px-2 text-base font-medium text-[#141414] outline-none focus:border-accent sm:h-9 sm:w-[3.75rem] sm:text-sm";

const styleSelectClass =
  "h-10 w-[7.5rem] shrink-0 rounded-[8px] border border-border bg-white px-2 text-base font-medium text-[#141414] outline-none focus:border-accent sm:h-9 sm:w-[7rem] sm:text-sm";

function ToolBtn({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`kit-touch-target inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-[8px] border px-2.5 text-sm font-semibold sm:h-9 sm:min-h-0 sm:min-w-9 sm:text-xs ${
        active
          ? "border-accent bg-accent text-white"
          : "border-border bg-white text-foreground hover:bg-accent-soft"
      }`}
    >
      {children}
    </button>
  );
}

function resolveFontValue(fontFamily: string) {
  const exact = FONTS.find((f) => f.id === fontFamily);
  if (exact) return exact.id;
  const lower = fontFamily.toLowerCase();
  const fuzzy = FONTS.find(
    (f) =>
      lower.includes(f.label.toLowerCase()) ||
      f.id.toLowerCase().includes(lower.split(",")[0]?.trim() ?? ""),
  );
  return fuzzy?.id ?? FONTS[0]!.id;
}

function BlockStyleSelect({
  value,
  onChange,
  labels,
  className = styleSelectClass,
}: {
  value: PapersBlockStyle;
  onChange: (block: PapersBlockStyle) => void;
  labels: Required<
    Pick<
      PapersFormatLabels,
      "textStyle" | "styleTitle" | "styleHeading" | "paragraph"
    >
  >;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as PapersBlockStyle)}
      className={className}
      title={labels.textStyle}
      aria-label={labels.textStyle}
    >
      <option value="p">{labels.paragraph}</option>
      <option value="h1">{labels.styleTitle}</option>
      <option value="h2">{labels.styleHeading}</option>
    </select>
  );
}

function hasBlockLabels(
  labels: PapersFormatLabels,
): labels is PapersFormatLabels &
  Required<
    Pick<
      PapersFormatLabels,
      "textStyle" | "styleTitle" | "styleHeading" | "paragraph"
    >
  > {
  return !!(
    labels.textStyle &&
    labels.styleTitle &&
    labels.styleHeading &&
    labels.paragraph
  );
}

export function PapersFormatBar({
  value,
  onChange,
  labels,
  extras,
  variant = "bar",
}: {
  value: PapersFormatState;
  onChange: (patch: Partial<PapersFormatState>) => void;
  labels: PapersFormatLabels;
  extras?: ReactNode;
  /** ribbon = compact strip for paper chrome; bar = standalone card */
  variant?: "bar" | "ribbon";
}) {
  const fontValue = resolveFontValue(value.fontFamily);

  const tools = (
    <>
      <ToolBtn
        active={value.bold}
        onClick={() => onChange({ bold: !value.bold })}
        title={labels.bold}
      >
        <span className="font-bold">B</span>
      </ToolBtn>
      <ToolBtn
        active={value.italic}
        onClick={() => onChange({ italic: !value.italic })}
        title={labels.italic}
      >
        <span className="italic">I</span>
      </ToolBtn>
      <ToolBtn
        active={value.underline}
        onClick={() => onChange({ underline: !value.underline })}
        title={labels.underline}
      >
        <span className="underline">U</span>
      </ToolBtn>

      <span className="mx-0.5 h-5 w-px shrink-0 bg-border" aria-hidden />

      <ToolBtn
        active={value.align === "left"}
        onClick={() => onChange({ align: "left" })}
        title={labels.alignLeft}
      >
        L
      </ToolBtn>
      <ToolBtn
        active={value.align === "center"}
        onClick={() => onChange({ align: "center" })}
        title={labels.alignCenter}
      >
        C
      </ToolBtn>
      <ToolBtn
        active={value.align === "right"}
        onClick={() => onChange({ align: "right" })}
        title={labels.alignRight}
      >
        R
      </ToolBtn>

      <span className="mx-0.5 h-5 w-px shrink-0 bg-border" aria-hidden />

      <label
        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[8px] border border-border bg-white px-2 sm:h-9"
        title={labels.textColor}
      >
        <span className="text-sm font-bold text-foreground">A</span>
        <input
          type="color"
          value={value.color || "#111111"}
          onChange={(e) => onChange({ color: e.target.value })}
          className="h-6 w-7 cursor-pointer rounded border border-border bg-transparent p-0"
        />
      </label>

      <label
        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[8px] border border-border bg-white px-2 sm:h-9"
        title={labels.fillColor}
      >
        <span className="inline-block h-3.5 w-3.5 rounded-[3px] border border-border bg-amber-200" />
        <input
          type="color"
          value={value.background || "#ffffff"}
          onChange={(e) => onChange({ background: e.target.value })}
          className="h-6 w-7 cursor-pointer rounded border border-border bg-transparent p-0"
        />
      </label>
    </>
  );

  const typeRow = (
    <div className="flex w-full items-center gap-2">
      {hasBlockLabels(labels) ? (
        <BlockStyleSelect
          value={value.block ?? "p"}
          onChange={(block) => onChange({ block })}
          labels={labels}
        />
      ) : null}
      <select
        value={fontValue}
        onChange={(e) => onChange({ fontFamily: e.target.value })}
        className={ribbonSelectClass}
        title={labels.fontFamily}
        aria-label={labels.fontFamily}
      >
        {FONTS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      <FontSizeInput
        value={value.fontSize}
        onChange={(fontSize) => onChange({ fontSize })}
        title={labels.fontSize}
        className={ribbonSizeClass}
      />
    </div>
  );

  if (variant === "ribbon") {
    return (
      <div className="papers-format-bar flex w-full flex-col gap-2">
        <div className="kit-h-scroll w-full gap-1.5">{tools}</div>
        {typeRow}
        {extras ? (
          <div className="kit-h-scroll w-full gap-1.5">{extras}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="papers-format-bar flex flex-wrap items-center gap-1.5 rounded-[12px] border border-border bg-surface p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
      {tools}
      <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />
      {hasBlockLabels(labels) ? (
        <BlockStyleSelect
          value={value.block ?? "p"}
          onChange={(block) => onChange({ block })}
          labels={labels}
          className={`${styleSelectClass} flex-none`}
        />
      ) : null}
      <select
        value={fontValue}
        onChange={(e) => onChange({ fontFamily: e.target.value })}
        className={`${ribbonSelectClass} max-w-[10rem] flex-none`}
        title={labels.fontFamily}
        aria-label={labels.fontFamily}
      >
        {FONTS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      <FontSizeInput
        value={value.fontSize}
        onChange={(fontSize) => onChange({ fontSize })}
        title={labels.fontSize}
        className={ribbonSizeClass}
      />
      {extras ? (
        <>
          <span className="mx-1 hidden h-5 w-px shrink-0 bg-border sm:block" aria-hidden />
          <div className="flex flex-wrap items-center gap-1.5">{extras}</div>
        </>
      ) : null}
    </div>
  );
}

export { secondaryBtnClass as papersExtraBtnClass };
