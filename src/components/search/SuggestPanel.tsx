"use client";

import { useEffect, useRef } from "react";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { getToolCopy } from "@/i18n/tools";
import type { AnswerView } from "@/lib/answers/present";
import type { ContentHit } from "@/lib/search/content";
import type { ToolDefinition } from "@/tools/types";
import { AnswerRow, type CopyState } from "./AnswerRow";
import { HighlightMatch } from "./highlight";

export type SuggestGroup = {
  label: string;
  tools: ToolDefinition[];
  removable?: boolean;
  removeMode?: "recent" | "pin";
};

export type QuerySuggestion = {
  query: string;
  label: string;
};

type SuggestPanelProps = {
  groups: SuggestGroup[];
  query: string;
  /** Keyboard order: answer, then content hits, then every tool. */
  activeIndex: number;
  flatTools: ToolDefinition[];
  open: boolean;
  onSelect: (tool: ToolDefinition) => void;
  onHover: (index: number) => void;
  onRemoveRecent?: (tool: ToolDefinition, mode?: "recent" | "pin") => void;
  /** Result of a calculation typed as the query. Takes the first position. */
  answer?: AnswerView | null;
  /** Deep catalog lookups (ADR, postnr, affald, …). */
  contentHits?: ContentHit[];
  onSelectContent?: (hit: ContentHit) => void;
  copyState?: CopyState;
  onAnswerCopy?: () => void;
  onAnswerOpenPrefill?: () => void;
  /** When set, this tool was opened by a personal shortcut alias. */
  shortcutToolId?: string;
  /** Compact tool-chrome search vs home hero search. */
  variant?: "home" | "compact";
  /** Typed-prefix chips shown inside the panel (never in header flow). */
  suggestions?: QuerySuggestion[];
  onPickSuggestion?: (query: string) => void;
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
  contentHits = [],
  onSelectContent,
  copyState = "idle",
  onAnswerCopy,
  onAnswerOpenPrefill,
  shortcutToolId,
  variant = "home",
  suggestions = [],
  onPickSuggestion,
}: SuggestPanelProps) {
  const dictionary = useDictionary();
  const { locale } = useLanguage();
  const da = locale === "da";
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

  const hasResults =
    flatTools.length > 0 || answer !== null || contentHits.length > 0;
  const answerOffset = answer ? 1 : 0;
  const toolOffset = answerOffset + contentHits.length;
  const compact = variant === "compact";

  return (
    <div
      ref={panelRef}
      id="kit-suggest"
      role="listbox"
      className={`kit-scrollbar kit-suggest-enter overflow-y-auto overscroll-contain touch-pan-y border border-border bg-surface shadow-suggest ${
        compact
          ? "fixed inset-x-2 z-[var(--kit-overlay-panel-z)] max-h-[var(--kit-search-panel-max-h)] rounded-[14px] max-sm:top-[var(--kit-search-panel-top)] sm:absolute sm:inset-x-0 sm:top-[calc(100%+8px)] sm:z-50 sm:max-h-[min(22rem,calc(100dvh-8rem))] sm:rounded-[12px]"
          : "absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[min(22rem,calc(100dvh-8rem))] rounded-[12px] max-sm:z-[var(--kit-overlay-panel-z)] max-sm:max-h-[min(70dvh,calc(100dvh-9rem-var(--kit-keyboard-inset)-var(--kit-safe-bottom)))]"
      }`}
    >
      {suggestions.length > 0 ? (
        <div className="border-b border-border px-3 py-2">
          <ul className="kit-h-scroll gap-1.5 pb-0.5">
            {suggestions.map((item) => (
              <li key={`${item.label}-${item.query}`} className="shrink-0">
                <button
                  type="button"
                  className="kit-touch-target inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-accent hover:bg-accent-soft hover:text-foreground sm:min-h-0 sm:min-w-0 sm:px-2.5 sm:py-1 sm:text-[12px]"
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => onPickSuggestion?.(item.query)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!hasResults ? (
        <p className="px-4 py-5 text-sm text-muted">{dictionary.search.empty}</p>
      ) : (
        <div className="py-1.5 sm:py-2">
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

          {contentHits.length > 0 ? (
            <div className="mb-0.5 last:mb-0">
              <p className="px-3.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.06em] text-muted sm:px-4">
                {dictionary.search.contentGroup}
              </p>
              <ul>
                {contentHits.map((hit, hitIndex) => {
                  const index = answerOffset + hitIndex;
                  const active = index === activeIndex;
                  const title = da ? hit.titleDa : hit.titleEn;
                  const subtitle = da ? hit.subtitleDa : hit.subtitleEn;
                  const badge = da ? hit.badgeDa : hit.badgeEn;
                  return (
                    <li key={hit.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`kit-touch-target flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors sm:min-h-0 sm:px-4 sm:py-2.5 ${
                          active ? "bg-accent-soft" : "hover:bg-background"
                        }`}
                        onPointerEnter={() => onHover(index)}
                        onClick={() => onSelectContent?.(hit)}
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent sm:mt-0.5 sm:h-2 sm:w-2"
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-medium leading-snug text-foreground">
                            <HighlightMatch text={title} query={query} />
                            <span className="ml-2 text-[12px] font-normal text-muted">
                              {badge}
                            </span>
                          </span>
                          <span className="mt-0.5 block line-clamp-2 text-[13px] leading-snug text-muted sm:truncate sm:leading-normal">
                            {subtitle}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {groups.map((group) => {
            if (group.tools.length === 0) return null;
            return (
              <div key={group.label} className="mb-0.5 last:mb-0">
                <p className="px-3.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.06em] text-muted sm:px-4">
                  {group.label}
                </p>
                <ul>
                  {group.tools.map((tool) => {
                    const index =
                      toolOffset +
                      flatTools.findIndex((t) => t.id === tool.id);
                    const active = index === activeIndex;
                    const copy = getToolCopy(dictionary, tool.id);
                    const opensPrefilled = answer?.toolId === tool.id;
                    return (
                      <li key={tool.id}>
                        <div
                          className={`group/row relative flex w-full items-start gap-3 px-3.5 py-2.5 transition-colors sm:px-4 sm:py-2.5 ${
                            active ? "bg-accent-soft" : "hover:bg-background"
                          }`}
                          onPointerEnter={() => onHover(index)}
                        >
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            className="kit-touch-target flex min-w-0 flex-1 items-start gap-3 py-0.5 pr-10 text-left sm:min-h-0 sm:pr-7"
                            onClick={() => onSelect(tool)}
                          >
                            <span
                              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full sm:mt-0.5 sm:h-2 sm:w-2 ${
                                tool.kind === "external"
                                  ? "bg-muted"
                                  : "bg-accent"
                              }`}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[15px] font-medium leading-snug text-foreground">
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
                              <span className="mt-0.5 block line-clamp-2 text-[13px] leading-snug text-muted sm:truncate sm:leading-normal">
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
                              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted opacity-100 transition-opacity hover:bg-overlay hover:text-foreground sm:h-6 sm:w-6 sm:opacity-0 sm:group-hover/row:opacity-100 sm:focus-visible:opacity-100"
                              onClick={(event) => {
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
