"use client";

import { useEffect, useRef } from "react";
import { useDictionary } from "@/i18n/LanguageProvider";
import { getToolCopy } from "@/i18n/tools";
import type { AnswerView } from "@/lib/answers/present";
import type { ToolDefinition } from "@/tools/types";
import { AnswerRow, type CopyState } from "./AnswerRow";
import { HighlightMatch } from "./highlight";

export type SuggestGroup = {
  label: string;
  tools: ToolDefinition[];
  removable?: boolean;
  removeMode?: "recent" | "pin";
};

type SuggestPanelProps = {
  groups: SuggestGroup[];
  query: string;
  /** Position in the keyboard order: the answer first, then every tool. */
  activeIndex: number;
  flatTools: ToolDefinition[];
  open: boolean;
  onSelect: (tool: ToolDefinition) => void;
  onHover: (index: number) => void;
  onRemoveRecent?: (tool: ToolDefinition, mode?: "recent" | "pin") => void;
  /** Result of a calculation typed as the query. Takes the first position. */
  answer?: AnswerView | null;
  copyState?: CopyState;
  onAnswerCopy?: () => void;
  onAnswerOpenPrefill?: () => void;
  /** When set, this tool was opened by a personal shortcut alias. */
  shortcutToolId?: string;
};

export function SuggestPanel({
  groups,
  query,
  activeIndex,
  flatTools,
  open,
  onSelect,
  onHover,
  onRemoveRecent,
  answer = null,
  copyState = "idle",
  onAnswerCopy,
  onAnswerOpenPrefill,
  shortcutToolId,
}: SuggestPanelProps) {
  const dictionary = useDictionary();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef(0);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !open) return;

    const onScroll = () => {
      panel.dataset.scrolling = "true";
      window.clearTimeout(scrollTimer.current);
      scrollTimer.current = window.setTimeout(() => {
        delete panel.dataset.scrolling;
      }, 700);
    };

    panel.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      panel.removeEventListener("scroll", onScroll);
      window.clearTimeout(scrollTimer.current);
      delete panel.dataset.scrolling;
    };
  }, [open]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !open) return;
    const active = panel.querySelector<HTMLElement>('[aria-selected="true"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  if (!open) return null;

  const hasResults = flatTools.length > 0 || answer !== null;
  const indexOffset = answer ? 1 : 0;

  return (
    <div
      ref={panelRef}
      id="kit-suggest"
      role="listbox"
      className="kit-scrollbar kit-suggest-enter absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[min(22rem,calc(100dvh-8rem))] overflow-y-auto overscroll-contain rounded-[12px] border border-border bg-surface shadow-suggest max-sm:max-h-[min(18rem,calc(100dvh-10rem-env(safe-area-inset-bottom)))]"
    >
      {!hasResults ? (
        <p className="px-4 py-5 text-sm text-muted">{dictionary.search.empty}</p>
      ) : (
        <div className="py-2">
          {answer ? (
            <AnswerRow
              answer={answer}
              active={activeIndex === 0}
              copyState={copyState}
              onCopy={() => onAnswerCopy?.()}
              onOpenPrefill={
                answer.href ? () => onAnswerOpenPrefill?.() : undefined
              }
              onHover={() => onHover(0)}
            />
          ) : null}
          {groups.map((group) => {
            if (group.tools.length === 0) return null;
            return (
              <div key={group.label} className="mb-1 last:mb-0">
                <p className="px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
                  {group.label}
                </p>
                <ul>
                  {group.tools.map((tool) => {
                    const index =
                      indexOffset +
                      flatTools.findIndex((t) => t.id === tool.id);
                    const active = index === activeIndex;
                    const copy = getToolCopy(dictionary, tool.id);
                    const opensPrefilled = answer?.toolId === tool.id;
                    return (
                      <li key={tool.id}>
                        <div
                          className={`group/row relative flex w-full items-start gap-3 px-4 py-3 transition-colors sm:py-2.5 ${
                            active ? "bg-accent-soft" : "hover:bg-background"
                          }`}
                          onPointerEnter={() => onHover(index)}
                        >
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            className="flex min-w-0 flex-1 items-start gap-3 pr-10 text-left sm:pr-7"
                            onPointerDown={(event) => {
                              event.preventDefault();
                              onSelect(tool);
                            }}
                          >
                            <span
                              className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                                tool.kind === "external"
                                  ? "bg-muted"
                                  : "bg-accent"
                              }`}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[15px] font-medium text-foreground">
                                <HighlightMatch
                                  text={copy.name}
                                  query={query}
                                />
                                {tool.kind === "external" ? (
                                  <span className="ml-2 text-[12px] font-normal text-muted">
                                    {dictionary.search.externalBadge}
                                  </span>
                                ) : null}
                                {shortcutToolId === tool.id ? (
                                  <span className="ml-2 text-[12px] font-normal text-muted">
                                    {dictionary.search.shortcutBadge}
                                  </span>
                                ) : null}
                              </span>
                              <span className="mt-0.5 block truncate text-[13px] text-muted">
                                {opensPrefilled
                                  ? dictionary.answers.openPrefilled
                                  : copy.description}
                              </span>
                            </span>
                          </button>

                          {group.removable && onRemoveRecent ? (
                            <button
                              type="button"
                              aria-label={`${
                                group.removeMode === "pin"
                                  ? dictionary.search.unpin
                                  : dictionary.search.removeRecent
                              }: ${copy.name}`}
                              title={
                                group.removeMode === "pin"
                                  ? dictionary.search.unpin
                                  : dictionary.search.removeRecent
                              }
                              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[#9a9a94] opacity-100 transition-opacity hover:bg-black/[0.04] hover:text-[#6b6b66] sm:h-6 sm:w-6 sm:opacity-0 sm:group-hover/row:opacity-100 sm:focus-visible:opacity-100"
                              onPointerDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onRemoveRecent(tool, group.removeMode);
                              }}
                            >
                              <svg
                                aria-hidden
                                viewBox="0 0 12 12"
                                className="h-2.5 w-2.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              >
                                <path d="M3 3l6 6M9 3L3 9" />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
