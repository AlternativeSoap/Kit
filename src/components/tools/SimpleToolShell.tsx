"use client";

import type { ReactNode } from "react";
import { secondaryBtnClass } from "@/components/tools/ui";

/** Shared chrome for simple calculators: inputs left, sticky results right. */
export function SimpleToolShell({
  inputs,
  results,
  footer,
}: {
  inputs: ReactNode;
  results: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="simple-tool kit-tool mx-auto w-full max-w-4xl px-0">
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-6">
        <section className="simple-tool-panel min-w-0 space-y-4 rounded-[16px] border border-border bg-surface p-4 sm:p-5">
          {inputs}
          {footer ? <div className="pt-1">{footer}</div> : null}
        </section>
        <section className="simple-tool-panel simple-tool-results min-w-0 rounded-[16px] border border-border bg-surface p-4 sm:p-5 lg:sticky lg:top-[calc(4.5rem+env(safe-area-inset-top))]">
          {results}
        </section>
      </div>
    </div>
  );
}

export function SimpleToolActions({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export const simpleGhostBtnClass = `${secondaryBtnClass} !px-3 !py-2 text-sm`;
