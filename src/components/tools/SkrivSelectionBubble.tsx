"use client";

import type { ReactNode } from "react";
import { FontFamilyInput } from "@/components/tools/FontFamilyInput";
import { FontSizeInput } from "@/components/tools/FontSizeInput";
import type {
  PapersBlockStyle,
  PapersFormatLabels,
  PapersFormatState,
} from "./PapersFormatBar";

const selectClass =
  "h-9 min-w-[6.5rem] max-w-[8rem] rounded-[7px] border border-border bg-surface px-2 text-sm font-medium text-foreground outline-none";

const fontClass =
  "h-9 min-w-[7rem] max-w-[9.5rem] rounded-[7px] border border-border bg-surface px-2 text-sm font-medium text-foreground outline-none";

const sizeClass =
  "h-9 w-[3.5rem] rounded-[7px] border border-border bg-surface px-1.5 text-sm font-medium text-foreground outline-none";

function BubbleBtn({
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
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`kit-touch-target inline-flex h-9 min-w-9 items-center justify-center rounded-[8px] px-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-accent text-on-accent"
          : "text-foreground hover:bg-overlay"
      }`}
    >
      {children}
    </button>
  );
}

export type SelectionBubblePos = { top: number; left: number };

/** Compact floating format controls above a text selection. */
export function SkrivSelectionBubble({
  pos,
  value,
  onChange,
  labels,
}: {
  pos: SelectionBubblePos;
  value: PapersFormatState;
  onChange: (patch: Partial<PapersFormatState>) => void;
  labels: PapersFormatLabels;
}) {
  return (
    <div
      className="papers-selection-bubble fixed z-[80] flex max-w-[min(96vw,30rem)] flex-wrap items-center gap-1 rounded-[12px] border border-border bg-surface px-2 py-1.5 shadow-[0_8px_28px_rgba(20,20,20,0.16)]"
      style={{
        top: pos.top,
        left: pos.left,
        transform: "translate(-50%, -100%)",
      }}
      onMouseDown={(e) => e.preventDefault()}
      role="toolbar"
      aria-label="Format"
    >
      <BubbleBtn
        active={value.bold}
        onClick={() => onChange({ bold: !value.bold })}
        title={labels.bold}
      >
        B
      </BubbleBtn>
      <BubbleBtn
        active={value.italic}
        onClick={() => onChange({ italic: !value.italic })}
        title={labels.italic}
      >
        <span className="italic">I</span>
      </BubbleBtn>
      <BubbleBtn
        active={value.underline}
        onClick={() => onChange({ underline: !value.underline })}
        title={labels.underline}
      >
        <span className="underline">U</span>
      </BubbleBtn>

      <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />

      <BubbleBtn
        active={value.align === "left"}
        onClick={() => onChange({ align: "left" })}
        title={labels.alignLeft}
      >
        L
      </BubbleBtn>
      <BubbleBtn
        active={value.align === "center"}
        onClick={() => onChange({ align: "center" })}
        title={labels.alignCenter}
      >
        C
      </BubbleBtn>
      <BubbleBtn
        active={value.align === "right"}
        onClick={() => onChange({ align: "right" })}
        title={labels.alignRight}
      >
        R
      </BubbleBtn>

      <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />

      {labels.textStyle &&
      labels.paragraph &&
      labels.styleTitle &&
      labels.styleHeading ? (
        <select
          value={value.block ?? "p"}
          onChange={(e) =>
            onChange({ block: e.target.value as PapersBlockStyle })
          }
          className={selectClass}
          title={labels.textStyle}
          aria-label={labels.textStyle}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <option value="p">{labels.paragraph}</option>
          <option value="h1">{labels.styleTitle}</option>
          <option value="h2">{labels.styleHeading}</option>
        </select>
      ) : null}

      <FontFamilyInput
        value={value.fontFamily}
        onChange={(fontFamily) => onChange({ fontFamily })}
        title={labels.fontFamily}
        placeholder={labels.fontSearch ?? labels.fontFamily}
        className={fontClass}
      />

      <FontSizeInput
        value={value.fontSize}
        onChange={(fontSize) => onChange({ fontSize })}
        title={labels.fontSize}
        className={sizeClass}
      />

      <label
        className="inline-flex h-9 items-center gap-1 rounded-[7px] px-1.5 text-sm text-foreground hover:bg-overlay"
        title={labels.textColor}
      >
        <span className="font-bold">A</span>
        <input
          type="color"
          value={value.color || "#111111"}
          onChange={(e) => onChange({ color: e.target.value })}
          className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </label>
    </div>
  );
}
