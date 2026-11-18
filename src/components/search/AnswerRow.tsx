"use client";

import { useDictionary } from "@/i18n/LanguageProvider";
import type { AnswerView } from "@/lib/answers/present";

export type CopyState = "idle" | "copied" | "failed";

type AnswerRowProps = {
  answer: AnswerView;
  active: boolean;
  copyState: CopyState;
  onCopy: () => void;
  onOpenPrefill?: () => void;
  onHover: () => void;
};

/** The result of a calculation typed into search. Selecting it copies the result. */
export function AnswerRow({
  answer,
  active,
  copyState,
  onCopy,
  onOpenPrefill,
  onHover,
}: AnswerRowProps) {
  const t = useDictionary().answers;
  const copied = copyState === "copied";
  const failed = copyState === "failed";
  const opens = answer.primaryAction === "open";
  const largePrimary = !answer.mono && answer.primary.length < 40;

  return (
    <div className="mb-1 border-b border-border pb-2">
      <p className="px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
        {t.group}
      </p>
      <div
        className={`px-4 py-2.5 transition-colors ${
          active ? "bg-accent-soft" : "hover:bg-background"
        }`}
        onMouseEnter={onHover}
      >
        <button
          type="button"
          role="option"
          aria-selected={active}
          className="flex w-full flex-col items-stretch gap-3 text-left sm:flex-row sm:items-start sm:gap-4"
          // Keep focus in the search field so typing can continue.
          onMouseDown={(event) => event.preventDefault()}
          onClick={onCopy}
        >
          <span className="min-w-0 flex-1">
            {answer.swatch ? (
              <span
                className="mb-2 block h-8 w-8 rounded-[8px] border border-border"
                style={{ background: answer.swatch }}
                aria-hidden
              />
            ) : null}
            <span
              className={
                answer.mono
                  ? "block break-all font-mono text-[17px] leading-snug text-foreground"
                  : largePrimary
                    ? "block text-[22px] font-semibold leading-tight tracking-tight tabular-nums text-foreground sm:text-[26px]"
                    : "block break-words text-[17px] font-semibold leading-snug text-foreground"
              }
            >
              {answer.primary}
              {answer.unit ? (
                <span className="ml-1.5 text-[15px] font-medium tracking-normal text-muted">
                  {answer.unit}
                </span>
              ) : null}
            </span>
            {answer.caption ? (
              <span className="mt-1 block text-[13px] text-muted">
                {answer.caption}
              </span>
            ) : null}
            {answer.details.length > 0 ? (
              <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px]">
                {answer.details.map((detail) => (
                  <span key={detail.label} className="min-w-0 break-words">
                    <span className="text-muted">{detail.label}</span>{" "}
                    <span className="font-medium tabular-nums text-foreground">
                      {detail.value}
                    </span>
                  </span>
                ))}
              </span>
            ) : null}
            {failed ? (
              <span className="mt-1.5 block text-[13px] text-foreground">
                {t.copyFailedHelp}
              </span>
            ) : null}
          </span>
          <span
            className={`inline-flex min-h-11 items-center justify-center rounded-[8px] border px-3 py-2 text-xs font-medium transition-colors sm:mt-1 sm:min-h-0 sm:shrink-0 sm:py-1 ${
              copied
                ? "border-accent bg-accent text-on-accent"
                : "border-border bg-surface text-muted"
            }`}
          >
            {opens
              ? t.open
              : copied
                ? t.copied
                : failed
                  ? t.copyFailed
                  : t.copy}
            {active && copyState === "idle" ? (
              <span aria-hidden className="ml-1.5 hidden opacity-70 sm:inline">
                ↵
              </span>
            ) : null}
          </span>
        </button>
        {!opens && answer.href && onOpenPrefill ? (
          <button
            type="button"
            className="mt-2 min-h-11 text-left text-[13px] font-medium text-accent underline-offset-4 hover:underline sm:mt-1 sm:min-h-0 sm:px-0 sm:pb-1"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onOpenPrefill}
          >
            {t.openWithValues}
          </button>
        ) : null}
      </div>
      <span className="sr-only" role="status">
        {copied ? t.copied : failed ? t.copyFailedHelp : ""}
      </span>
    </div>
  );
}
