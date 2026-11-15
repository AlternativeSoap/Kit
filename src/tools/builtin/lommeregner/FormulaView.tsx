"use client";

import type { FormulaNode } from "./formulas";

type FormulaViewProps = {
  nodes: FormulaNode[];
  values: Record<string, string>;
  activeSlot: string;
  onActivate: (slotId: string) => void;
  placeholderLabel: (slotId: string) => string;
  /** Larger type for simple formulas; denser for Wilson-scale layouts. */
  density?: "comfortable" | "compact";
};

function Slot({
  id,
  value,
  active,
  placeholder,
  onActivate,
}: {
  id: string;
  value: string;
  active: boolean;
  placeholder: string;
  onActivate: (id: string) => void;
}) {
  return (
    <button
      type="button"
      data-slot={id}
      data-active={active ? "true" : "false"}
      data-filled={value ? "true" : "false"}
      aria-label={value ? `${placeholder} = ${value}` : `Slot ${placeholder}`}
      aria-pressed={active}
      onClick={() => onActivate(id)}
      className="kit-math-slot mx-0.5 inline-flex min-w-[1.6em] items-center justify-center border-0 bg-transparent px-0.5 font-mono text-[0.95em] tabular-nums outline-none"
    >
      {/* key restarts the underline pulse when focus moves to this slot */}
      <span
        key={active ? `active-${id}` : `idle-${id}`}
        className={`kit-math-slot-value ${value ? "" : "italic text-muted"}`}
      >
        {value || placeholder}
      </span>
    </button>
  );
}

type RenderProps = {
  values: Record<string, string>;
  activeSlot: string;
  onActivate: (slotId: string) => void;
  placeholderLabel: (slotId: string) => string;
  density?: "comfortable" | "compact";
};

function Nodes({
  nodes,
  ...rest
}: RenderProps & { nodes: FormulaNode[] }) {
  return (
    <>
      {nodes.map((node, index) => (
        <Node key={index} node={node} {...rest} />
      ))}
    </>
  );
}

function Node({
  node,
  values,
  activeSlot,
  onActivate,
  placeholderLabel,
  density,
}: RenderProps & { node: FormulaNode }) {
  switch (node.type) {
    case "slot":
      return (
        <Slot
          id={node.id}
          value={values[node.id] ?? ""}
          active={activeSlot === node.id}
          placeholder={placeholderLabel(node.id)}
          onActivate={onActivate}
        />
      );
    case "text":
      return (
        <span className="kit-math-text px-0.5 font-serif tracking-tight">
          {node.value}
        </span>
      );
    case "pm":
      return (
        <span className="kit-math-text px-1.5 font-serif text-[1.05em]">±</span>
      );
    case "frac":
      return (
        <span className="kit-frac mx-1.5 inline-flex flex-col items-stretch align-middle">
          <span className="flex items-center justify-center gap-0.5 px-1.5 pb-1.5">
            <Nodes
              nodes={node.num}
              values={values}
              activeSlot={activeSlot}
              onActivate={onActivate}
              placeholderLabel={placeholderLabel}
              density={density}
            />
          </span>
          <span className="h-[1.5px] w-full bg-foreground/80" />
          <span className="flex items-center justify-center gap-0.5 px-1.5 pt-1.5">
            <Nodes
              nodes={node.den}
              values={values}
              activeSlot={activeSlot}
              onActivate={onActivate}
              placeholderLabel={placeholderLabel}
              density={density}
            />
          </span>
        </span>
      );
    case "sqrt":
      return (
        <span className="kit-sqrt mx-1 inline-flex items-stretch align-middle">
          <span
            className="self-stretch pr-0.5 font-serif leading-none text-foreground/80"
            style={{ fontSize: "1.45em" }}
          >
            √
          </span>
          <span className="border-t-[1.5px] border-foreground/80 pt-1 pl-1">
            <Nodes
              nodes={node.body}
              values={values}
              activeSlot={activeSlot}
              onActivate={onActivate}
              placeholderLabel={placeholderLabel}
              density={density}
            />
          </span>
        </span>
      );
    case "sup":
      return (
        <span className="inline-flex items-start align-middle">
          <span className="inline-flex items-center">
            <Nodes
              nodes={node.base}
              values={values}
              activeSlot={activeSlot}
              onActivate={onActivate}
              placeholderLabel={placeholderLabel}
              density={density}
            />
          </span>
          <sup className="ml-0.5 inline-flex translate-y-[-0.15em] items-center text-[0.72em]">
            <Nodes
              nodes={node.exp}
              values={values}
              activeSlot={activeSlot}
              onActivate={onActivate}
              placeholderLabel={placeholderLabel}
              density={density}
            />
          </sup>
        </span>
      );
    case "group":
      return (
        <span className="inline-flex items-center align-middle font-serif">
          {node.paren ? <span className="px-0.5 text-foreground/70">(</span> : null}
          <Nodes
            nodes={node.items}
            values={values}
            activeSlot={activeSlot}
            onActivate={onActivate}
            placeholderLabel={placeholderLabel}
            density={density}
          />
          {node.paren ? <span className="px-0.5 text-foreground/70">)</span> : null}
        </span>
      );
  }
}

export function FormulaView(props: FormulaViewProps) {
  const density = props.density ?? "comfortable";
  return (
    <div
      className={`kit-math flex max-w-full flex-wrap items-center justify-center gap-y-3 overflow-x-auto overscroll-x-contain leading-none text-foreground [-webkit-overflow-scrolling:touch] ${
        density === "compact"
          ? "text-[0.95rem] sm:text-[1.05rem]"
          : "text-[1.35rem] sm:text-[1.85rem]"
      }`}
      role="group"
      aria-label="Formula"
    >
      <Nodes {...props} density={density} />
    </div>
  );
}
