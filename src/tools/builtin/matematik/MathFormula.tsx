"use client";

import type { ReactNode } from "react";

/** Inline math row. */
export function M({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`kit-math inline-flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-1 text-[1.05rem] leading-none text-foreground ${className}`}
    >
      {children}
    </span>
  );
}

export function MText({ children }: { children: ReactNode }) {
  return <span className="font-serif italic tracking-tight">{children}</span>;
}

export function MOp({ children }: { children: ReactNode }) {
  return (
    <span className="mx-0.5 font-normal not-italic text-foreground/80">
      {children}
    </span>
  );
}

/** Stacked fraction like a textbook. */
export function MFrac({
  num,
  den,
}: {
  num: ReactNode;
  den: ReactNode;
}) {
  return (
    <span className="kit-math-frac inline-flex flex-col items-center align-middle mx-0.5">
      <span className="px-1.5 pb-0.5 text-center font-serif italic leading-tight">
        {num}
      </span>
      <span className="block w-full border-t border-foreground/70" aria-hidden />
      <span className="px-1.5 pt-0.5 text-center font-serif italic leading-tight">
        {den}
      </span>
    </span>
  );
}

export function MPow({
  base,
  exp,
}: {
  base: ReactNode;
  exp: ReactNode;
}) {
  return (
    <span className="inline-flex items-start font-serif italic">
      <span>{base}</span>
      <sup className="ml-0.5 translate-y-[-0.15em] text-[0.65em] not-italic leading-none">
        {exp}
      </sup>
    </span>
  );
}

export function MSub({
  base,
  sub,
}: {
  base: ReactNode;
  sub: ReactNode;
}) {
  return (
    <span className="inline-flex items-end font-serif italic">
      <span>{base}</span>
      <sub className="ml-0.5 translate-y-[0.1em] text-[0.65em] not-italic leading-none">
        {sub}
      </sub>
    </span>
  );
}

export function MSqrt({
  children,
  index,
}: {
  children: ReactNode;
  index?: ReactNode;
}) {
  return (
    <span className="kit-math-sqrt relative inline-flex items-stretch font-serif italic">
      {index != null ? (
        <span className="absolute -left-1 top-0 translate-x-[-100%] text-[0.55em] not-italic leading-none">
          {index}
        </span>
      ) : null}
      <span
        className="relative mr-px self-stretch border-l-2 border-b-2 border-foreground/80"
        style={{
          width: "0.55em",
          borderBottomLeftRadius: "0.15em",
          transform: "skewX(-12deg)",
        }}
        aria-hidden
      />
      <span className="border-t-2 border-foreground/80 px-1.5 pb-0.5 pt-0.5 leading-tight">
        {children}
      </span>
    </span>
  );
}

/** Soft card around a formula for tool headers and formula sheet. */
export function FormulaCard({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[12px] border border-border bg-overlay/40 px-4 py-3">
      {label ? (
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
      ) : null}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
