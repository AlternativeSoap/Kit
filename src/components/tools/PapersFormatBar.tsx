"use client";

import type { ReactNode } from "react";
import { FontSizeInput } from "@/components/tools/FontSizeInput";
import { KitSelect, fieldClass, secondaryBtnClass } from "@/components/tools/ui";

export type PapersAlign = "left" | "center" | "right";

export type PapersFormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: PapersAlign;
  color: string;
  background: string;
  fontFamily: string;
  fontSize: number;
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
};

const FONTS = [
  { id: "Calibri, 'Segoe UI', system-ui, sans-serif", label: "Calibri" },
  { id: "Georgia, 'Times New Roman', serif", label: "Georgia" },
  { id: "'Times New Roman', Times, serif", label: "Times" },
  { id: "Arial, Helvetica, sans-serif", label: "Arial" },
  { id: "system-ui, sans-serif", label: "Sans" },
  { id: "ui-monospace, monospace", label: "Mono" },
] as const;

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
      className={`kit-touch-target rounded-[8px] border px-2.5 py-1.5 text-xs font-medium sm:min-h-0 ${
        active
          ? "border-accent bg-accent text-white"
          : "border-border bg-background text-foreground hover:bg-accent-soft"
      }`}
    >
      {children}
    </button>
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
  const ribbon = variant === "ribbon";
  return (
    <div
      className={
        ribbon
          ? "papers-format-bar flex flex-wrap items-center gap-1"
          : "papers-format-bar flex flex-wrap items-center gap-1.5 rounded-[12px] border border-border bg-surface p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
      }
    >
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

      <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />

      <ToolBtn
        active={value.align === "left"}
        onClick={() => onChange({ align: "left" })}
        title={labels.alignLeft}
      >
        {ribbon ? "L" : labels.alignLeft}
      </ToolBtn>
      <ToolBtn
        active={value.align === "center"}
        onClick={() => onChange({ align: "center" })}
        title={labels.alignCenter}
      >
        {ribbon ? "C" : labels.alignCenter}
      </ToolBtn>
      <ToolBtn
        active={value.align === "right"}
        onClick={() => onChange({ align: "right" })}
        title={labels.alignRight}
      >
        {ribbon ? "R" : labels.alignRight}
      </ToolBtn>

      <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />

      <KitSelect
        value={value.fontFamily}
        onChange={(e) => onChange({ fontFamily: e.target.value })}
        className={`${fieldClass} ${ribbon ? "h-8 w-[7rem] py-1 text-xs" : "w-[7.5rem] py-1 text-xs"}`}
        title={labels.fontFamily}
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
        compact={ribbon}
      />

      <label
        className="flex items-center gap-1 rounded-[8px] border border-border bg-background px-1.5 py-1 text-[11px] text-muted"
        title={labels.textColor}
      >
        <span className="font-semibold text-foreground">A</span>
        <input
          type="color"
          value={value.color || "#111111"}
          onChange={(e) => onChange({ color: e.target.value })}
          className="h-6 w-7 cursor-pointer rounded border border-border bg-transparent"
        />
      </label>

      <label
        className="flex items-center gap-1 rounded-[8px] border border-border bg-background px-1.5 py-1 text-[11px] text-muted"
        title={labels.fillColor}
      >
        <span className="inline-block h-3 w-3 rounded-sm border border-border bg-current" />
        <input
          type="color"
          value={value.background || "#ffffff"}
          onChange={(e) => onChange({ background: e.target.value })}
          className="h-6 w-7 cursor-pointer rounded border border-border bg-transparent"
        />
      </label>

      {extras ? (
        <>
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />
          <div className="flex flex-wrap items-center gap-1">{extras}</div>
        </>
      ) : null}
    </div>
  );
}

export { secondaryBtnClass as papersExtraBtnClass };
