"use client";

import type { ReactNode } from "react";
import { FontSizeInput } from "@/components/tools/FontSizeInput";
import { KitSelect, fieldClass } from "@/components/tools/ui";
import type { PapersFormatLabels, PapersFormatState } from "./PapersFormatBar";

const FONTS = [
  { id: "Calibri, 'Segoe UI', system-ui, sans-serif", label: "Calibri" },
  { id: "Georgia, 'Times New Roman', serif", label: "Georgia" },
  { id: "'Times New Roman', Times, serif", label: "Times" },
  { id: "Arial, Helvetica, sans-serif", label: "Arial" },
  { id: "system-ui, sans-serif", label: "Sans" },
  { id: "ui-monospace, monospace", label: "Mono" },
] as const;

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
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-[7px] px-2 text-xs font-semibold transition-colors ${
        active
          ? "bg-accent text-white"
          : "text-foreground hover:bg-black/5"
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
      className="papers-selection-bubble fixed z-[80] flex max-w-[min(96vw,28rem)] flex-wrap items-center gap-0.5 rounded-[12px] border border-border bg-surface px-1.5 py-1.5 shadow-[0_8px_28px_rgba(20,20,20,0.16)]"
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

      <KitSelect
        value={value.fontFamily}
        onChange={(e) => onChange({ fontFamily: e.target.value })}
        className={`${fieldClass} h-8 w-[6.2rem] border-0 bg-transparent py-0 text-xs shadow-none`}
        title={labels.fontFamily}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {FONTS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </KitSelect>

      <FontSizeInput
        value={value.fontSize}
        onChange={(fontSize) => onChange({ fontSize })}
        title={labels.fontSize}
        compact
        className={`${fieldClass} h-8 w-[3.2rem] border-0 bg-transparent py-0 text-xs shadow-none`}
      />

      <label
        className="inline-flex h-8 items-center gap-1 rounded-[7px] px-1.5 text-[11px] text-muted hover:bg-black/5"
        title={labels.textColor}
      >
        <span className="font-semibold text-foreground">A</span>
        <input
          type="color"
          value={value.color || "#111111"}
          onChange={(e) => onChange({ color: e.target.value })}
          className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </label>
      <label
        className="inline-flex h-8 items-center gap-1 rounded-[7px] px-1.5 text-[11px] text-muted hover:bg-black/5"
        title={labels.fillColor}
      >
        <span className="inline-block h-3 w-3 rounded-sm border border-border bg-slate-400" />
        <input
          type="color"
          value={value.background || "#ffffff"}
          onChange={(e) => onChange({ background: e.target.value })}
          className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </label>
    </div>
  );
}
