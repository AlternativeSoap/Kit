"use client";

import type { ReactNode } from "react";

export function ToolShell({
  intro,
  children,
  wide,
}: {
  intro: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={`kit-tool mx-auto space-y-5 ${wide ? "max-w-3xl" : "max-w-2xl"}`}
    >
      <p className="text-sm leading-relaxed text-muted">{intro}</p>
      {children}
    </div>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`kit-tool-panel space-y-4 p-4 sm:p-5 ${className}`}>
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  action,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatStrip({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{children}</div>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[12px] border px-3 py-2.5 ${
        accent
          ? "border-accent/30 bg-accent-soft"
          : "border-border bg-overlay/60"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export type Tone = "neutral" | "ok" | "warn" | "bad" | "critical" | "info";

const TONE: Record<Tone, string> = {
  neutral: "border-border bg-overlay text-foreground",
  ok: "border-emerald-500/30 bg-emerald-500/10 text-foreground",
  warn: "border-amber-500/35 bg-amber-500/12 text-foreground",
  bad: "border-orange-500/35 bg-orange-500/12 text-foreground",
  critical: "border-red-500/40 bg-red-500/12 text-foreground",
  info: "border-accent/30 bg-accent-soft text-foreground",
};

export function ToneBadge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-[8px] border px-2.5 py-1 text-xs font-semibold ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  tone = "info",
  label,
}: {
  value: number;
  tone?: Tone;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const fill =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "warn"
        ? "bg-amber-500"
        : tone === "bad"
          ? "bg-orange-500"
          : tone === "critical"
            ? "bg-red-500"
            : "bg-accent";
  return (
    <div className="space-y-1.5">
      {label ? (
        <div className="flex justify-between gap-2 text-xs text-muted">
          <span>{label}</span>
          <span className="tabular-nums font-medium text-foreground">
            {Math.round(pct)}%
          </span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-overlay">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${fill}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function StepRail({
  steps,
  current,
  onSelect,
}: {
  steps: string[];
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="grid gap-2 sm:grid-cols-5">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <li key={label}>
            <button
              type="button"
              onClick={() => onSelect(n)}
              className={`kit-touch-target flex w-full items-center gap-2 rounded-[12px] border px-3 py-2.5 text-left transition-colors sm:min-h-0 ${
                active
                  ? "border-accent bg-accent-soft"
                  : done
                    ? "border-border bg-surface"
                    : "border-border bg-overlay/40"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  active
                    ? "bg-accent text-on-accent"
                    : done
                      ? "bg-foreground text-surface"
                      : "bg-overlay text-muted"
                }`}
              >
                {done ? "✓" : n}
              </span>
              <span
                className={`min-w-0 truncate text-xs font-medium ${
                  active ? "text-foreground" : "text-muted"
                }`}
              >
                {label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function ChoiceRow({
  selected,
  tone,
  disabled,
  onClick,
  children,
}: {
  selected: boolean;
  tone?: Tone;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  let cls =
    "kit-touch-target w-full rounded-[12px] border px-3.5 py-3 text-left text-sm transition-colors sm:min-h-0 ";
  if (tone) {
    cls += TONE[tone];
  } else if (selected) {
    cls += "border-accent bg-accent-soft text-foreground";
  } else {
    cls += "border-border bg-surface text-foreground hover:bg-overlay";
  }
  return (
    <button type="button" className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export function ActionBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[12px] border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
      {children}
    </div>
  );
}

export function MatrixCell({
  value,
  tone,
}: {
  value: number;
  tone: Tone;
}) {
  const fill =
    tone === "critical"
      ? "bg-red-500/85 text-white"
      : tone === "bad"
        ? "bg-orange-500/80 text-white"
        : tone === "warn"
          ? "bg-amber-400/85 text-black"
          : "bg-emerald-500/80 text-white";
  return (
    <span
      className={`inline-flex h-9 w-full items-center justify-center rounded-[8px] text-xs font-semibold tabular-nums ${fill}`}
    >
      {value}
    </span>
  );
}
