"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  contextFromAnswer,
  parseContinuation,
  type ContinuationContext,
} from "@/lib/answers/continuation";
import { parseAnswer } from "@/lib/answers/parse";
import { presentAnswer } from "@/lib/answers/present";
import { copyText, readText } from "@/lib/clipboard";
import {
  bumpUsage,
  findShortcut,
  getExcludedIds,
  getLastOpenedToolId,
  getPinnedSlugs,
  getUsageCounts,
  setLastOpenedToolId,
  setLastSearchMatch,
  togglePin,
} from "@/lib/personal";
import { diagnoseSearch } from "@/lib/search/diagnostics";
import {
  searchContent,
  type ContentHit,
} from "@/lib/search/content";
import { suggestQueries } from "@/lib/search/suggestions";
import {
  getRecentSlugs,
  pushRecentSlug,
  removeRecentSlug,
} from "@/lib/recent";
import {
  emptyStateTools,
  groupSearchHits,
  isExactLibraryQuery,
  isLibraryQuery,
  searchTools,
  type SearchHit,
} from "@/lib/search";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  useIsFinePointer,
  useIsPhoneLayout,
} from "@/hooks/useMediaQuery";
import { useVisualViewportInset } from "@/hooks/useVisualViewportInset";
import { generatePassword } from "@/tools/builtin/password/calc";
import { getToolById } from "@/tools/registry";
import type { ToolDefinition } from "@/tools/types";
import type { CopyState } from "./AnswerRow";
import { SearchField } from "./SearchField";
import { SuggestPanel, type SuggestGroup } from "./SuggestPanel";

type SearchShellProps = {
  variant?: "home" | "compact";
  autoFocus?: boolean;
  onNavigated?: () => void;
};

type GeneratedPassword = { length: number; value: string };
type GeneratedRandom = { min: number; max: number; value: number };

function randomInt(min: number, max: number): number {
  const span = max - min + 1;
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return min + (bytes[0]! % span);
}

/** Lists the answer's tool first so it is one arrow key away. */
function withAnswerTool(
  groups: SuggestGroup[],
  tool: ToolDefinition,
  toolsLabel: string,
): SuggestGroup[] {
  const others = groups
    .map((group) => ({
      ...group,
      tools: group.tools.filter((item) => item.id !== tool.id),
    }))
    .filter((group) => group.tools.length > 0);

  const [first, ...rest] = others;
  if (first && first.label === toolsLabel) {
    return [{ ...first, tools: [tool, ...first.tools] }, ...rest];
  }
  return [{ label: toolsLabel, tools: [tool] }, ...others];
}

export function SearchShell({
  variant = "home",
  autoFocus = false,
  onNavigated,
}: SearchShellProps) {
  const router = useRouter();
  const { locale, dictionary } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef(0);
  const copyTimer = useRef(0);
  /** True while the finger/pointer is on the suggest panel (mobile scroll must not close it). */
  const panelPointerActive = useRef(false);
  /** Counts query changes so a slow copy never reports on a newer answer. */
  const queryEdits = useRef(0);
  const [query, setQuery] = useState("");
  // Home starts closed on phones; desktop fine-pointer opens empty state below.
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const isPhone = useIsPhoneLayout();
  const isFinePointer = useIsFinePointer();
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [pinnedSlugs, setPinnedSlugs] = useState<string[]>([]);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [lastOpenedId, setLastOpenedId] = useState<string | null>(null);
  const [shortcutTick, setShortcutTick] = useState(0);
  const [kitDebug, setKitDebug] = useState(false);
  const [generated, setGenerated] = useState<GeneratedPassword | null>(null);
  const [generatedRandom, setGeneratedRandom] =
    useState<GeneratedRandom | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [continuation, setContinuation] = useState<ContinuationContext | null>(
    null,
  );
  const [pasteMessage, setPasteMessage] = useState<string | null>(null);
  const [personalReady, setPersonalReady] = useState(false);
  const hydratedPersonal = useRef(false);

  useEffect(() => {
    if (hydratedPersonal.current) return;
    hydratedPersonal.current = true;
    queueMicrotask(() => {
      setRecentSlugs(getRecentSlugs());
      setPinnedSlugs(getPinnedSlugs());
      setUsageCounts(getUsageCounts());
      setExcludedIds(getExcludedIds());
      setLastOpenedId(getLastOpenedToolId());
      setKitDebug(
        typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).get("kitDebug") === "1",
      );
      setPersonalReady(true);
    });
  }, []);

  useEffect(() => {
    // Only autofocus when a fine pointer is present (desktop).
    if (autoFocus && isFinePointer) {
      inputRef.current?.focus();
    }
  }, [autoFocus, isFinePointer]);

  useEffect(() => {
    return () => {
      window.clearTimeout(blurTimer.current);
      window.clearTimeout(copyTimer.current);
    };
  }, []);

  // Refresh pins/shortcuts when personal settings change on this page.
  useEffect(() => {
    const refreshPersonal = () => {
      setPinnedSlugs(getPinnedSlugs());
      setRecentSlugs(getRecentSlugs());
      setUsageCounts(getUsageCounts());
      setExcludedIds(getExcludedIds());
      setLastOpenedId(getLastOpenedToolId());
      setShortcutTick((value) => value + 1);
    };
    const closeForModal = () => setOpen(false);
    window.addEventListener("kit:personal-changed", refreshPersonal);
    window.addEventListener("focus", refreshPersonal);
    window.addEventListener("kit:modal-open", closeForModal);
    return () => {
      window.removeEventListener("kit:personal-changed", refreshPersonal);
      window.removeEventListener("focus", refreshPersonal);
      window.removeEventListener("kit:modal-open", closeForModal);
    };
  }, []);

  const trimmed = query.trim();

  const shortcutHit = useMemo(() => {
    void shortcutTick;
    const shortcut = findShortcut(trimmed);
    if (!shortcut) return null;
    const tool = getToolById(shortcut.toolId);
    if (!tool) return null;
    const hit: SearchHit = {
      tool,
      score: 10_000,
      baseScore: 100,
      matchedOn: shortcut.alias,
      constraintsSatisfied: 0,
      matchTier: "exact",
    };
    return hit;
  }, [trimmed, shortcutTick]);

  const libraryBrowse = Boolean(trimmed && isLibraryQuery(trimmed));

  const hits = useMemo(() => {
    if (!trimmed || libraryBrowse) return [];
    if (shortcutHit) return [shortcutHit];
    return searchTools(trimmed, dictionary, {
      usage: usageCounts,
      excluded: excludedIds,
    });
  }, [
    trimmed,
    libraryBrowse,
    dictionary,
    shortcutHit,
    usageCounts,
    excludedIds,
  ]);

  const querySuggestions = useMemo(
    () =>
      trimmed && !libraryBrowse ? suggestQueries(trimmed, dictionary) : [],
    [trimmed, libraryBrowse, dictionary],
  );

  const contentHits = useMemo(
    () =>
      trimmed && !libraryBrowse
        ? searchContent(trimmed, dictionary, locale, 8)
        : [],
    [trimmed, libraryBrowse, dictionary, locale],
  );

  const debugInfo = useMemo(() => {
    if (!kitDebug || !trimmed) return null;
    return diagnoseSearch(trimmed, dictionary, locale);
  }, [kitDebug, trimmed, dictionary, locale]);

  const answerSpec = useMemo(() => {
    if (!trimmed) return null;
    const continued = parseContinuation(trimmed, continuation);
    if (continued) return continued;
    return parseAnswer(trimmed, locale, new Date());
  }, [trimmed, locale, continuation]);

  // Keep continuation only while it still applies; clear on unrelated answers.
  useEffect(() => {
    queueMicrotask(() => {
      if (!trimmed) {
        setContinuation(null);
        return;
      }
      if (!answerSpec) return;
      const next = contextFromAnswer(answerSpec, locale);
      if (next) {
        setContinuation((prev) => {
          if (
            prev &&
            prev.kind === next.kind &&
            JSON.stringify(prev) === JSON.stringify(next)
          ) {
            return prev;
          }
          return next;
        });
        return;
      }
      // Successful unrelated parse clears prior percent/units context.
      if (answerSpec.kind !== "percent" && answerSpec.kind !== "units") {
        setContinuation(null);
      }
    });
  }, [answerSpec, locale, trimmed]);

  const answer = useMemo(() => {
    if (!answerSpec) return null;
    return presentAnswer(answerSpec, {
      locale,
      dictionary,
      password: generated?.value,
      randomValue: generatedRandom?.value,
    });
  }, [answerSpec, locale, dictionary, generated, generatedRandom]);

  const groups: SuggestGroup[] = useMemo(() => {
    if (libraryBrowse) return [];
    if (trimmed) {
      const matched = groupSearchHits(hits, dictionary, trimmed);
      const answerTool =
        answer?.toolId !== undefined
          ? getToolById(answer.toolId)
          : undefined;
      return answerTool
        ? withAnswerTool(matched, answerTool, dictionary.search.toolsGroup)
        : matched;
    }
    // Avoid pinned/recent flash before localStorage is read.
    if (!personalReady) return [];
    const { pinned, recent, related, suggestions } = emptyStateTools(
      recentSlugs,
      pinnedSlugs,
      { usage: usageCounts, lastOpenedId },
    );
    return [
      {
        label: dictionary.search.pinned,
        tools: pinned,
        removable: true,
        removeMode: "pin",
      },
      {
        label: dictionary.search.recent,
        tools: recent,
        removable: true,
        removeMode: "recent",
      },
      { label: dictionary.search.related, tools: related },
      { label: dictionary.search.suggestions, tools: suggestions },
    ];
  }, [
    trimmed,
    libraryBrowse,
    hits,
    answer,
    personalReady,
    recentSlugs,
    pinnedSlugs,
    usageCounts,
    lastOpenedId,
    dictionary,
  ]);

  const flatTools = useMemo(
    () => groups.flatMap((group) => group.tools),
    [groups],
  );

  // Keyboard order: answer, content lookups, then tools.
  const answerOffset = answer ? 1 : 0;
  const contentOffset = answerOffset;
  const toolOffset = answerOffset + contentHits.length;
  const itemCount = toolOffset + flatTools.length;

  const closePanel = useCallback(() => {
    setOpen(false);
  }, []);

  const openLibrary = useCallback(() => {
    window.clearTimeout(blurTimer.current);
    setQuery("");
    setActiveIndex(0);
    setOpen(false);
    onNavigated?.();
    router.push("/library");
  }, [onNavigated, router]);

  const updateQuery = useCallback(
    (value: string) => {
      if (isExactLibraryQuery(value)) {
        openLibrary();
        return;
      }

      setQuery(value);
      setActiveIndex(0);
      queryEdits.current += 1;
      window.clearTimeout(copyTimer.current);
      setCopyState("idle");

      // Passwords and random numbers are created here, not while rendering,
      // and stay stable until the requested range changes.
      const spec = parseAnswer(value, locale, new Date());
      if (spec?.kind !== "password") {
        setGenerated(null);
      } else if (generated?.length !== spec.length) {
        const password = generatePassword({
          length: spec.length,
          lower: true,
          upper: true,
          numbers: true,
          symbols: true,
        });
        setGenerated(password ? { length: spec.length, value: password } : null);
      }

      if (spec?.kind !== "random") {
        setGeneratedRandom(null);
      } else if (
        !generatedRandom ||
        generatedRandom.min !== spec.min ||
        generatedRandom.max !== spec.max
      ) {
        setGeneratedRandom({
          min: spec.min,
          max: spec.max,
          value: randomInt(spec.min, spec.max),
        });
      }
    },
    [generated, generatedRandom, locale, openLibrary],
  );

  const selectTool = useCallback(
    (tool: ToolDefinition) => {
      window.clearTimeout(blurTimer.current);
      const next = pushRecentSlug(tool.slug);
      setRecentSlugs(next);
      bumpUsage(tool.id);
      setLastOpenedToolId(tool.id);
      setLastOpenedId(tool.id);
      setUsageCounts(getUsageCounts());

      const hit = hits.find((item) => item.tool.id === tool.id);
      if (hit) {
        setLastSearchMatch({
          toolId: tool.id,
          query: trimmed,
          matchedOn: hit.matchedOn,
          at: Date.now(),
        });
      }

      // The answer's own tool opens with the same values filled in.
      const href =
        answer && answer.toolId === tool.id && answer.href
          ? answer.href
          : `/t/${tool.slug}`;
      updateQuery("");
      setOpen(false);
      onNavigated?.();
      router.push(href);
    },
    [answer, hits, onNavigated, router, trimmed, updateQuery],
  );

  const selectContent = useCallback(
    (hit: ContentHit) => {
      window.clearTimeout(blurTimer.current);
      const tool = getToolById(hit.toolId);
      if (tool) {
        const next = pushRecentSlug(tool.slug);
        setRecentSlugs(next);
        bumpUsage(tool.id);
        setLastOpenedToolId(tool.id);
        setLastOpenedId(tool.id);
        setUsageCounts(getUsageCounts());
        setLastSearchMatch({
          toolId: tool.id,
          query: trimmed,
          matchedOn: "content",
          at: Date.now(),
        });
      }
      updateQuery("");
      setOpen(false);
      onNavigated?.();
      router.push(hit.href);
    },
    [onNavigated, router, trimmed, updateQuery],
  );

  const openAnswerPrefill = useCallback(() => {
    if (!answer?.href) return;
    const tool = answer.toolId ? getToolById(answer.toolId) : undefined;
    if (tool) {
      const next = pushRecentSlug(tool.slug);
      setRecentSlugs(next);
      bumpUsage(tool.id);
      setLastOpenedToolId(tool.id);
      setLastOpenedId(tool.id);
      setUsageCounts(getUsageCounts());
    }
    updateQuery("");
    setContinuation(null);
    setOpen(false);
    onNavigated?.();
    router.push(answer.href);
  }, [answer, onNavigated, router, updateQuery]);

  const activateAnswer = useCallback(async () => {
    if (!answer) return;
    window.clearTimeout(copyTimer.current);
    // A click that reaches the row without a mousedown (assistive tech, for
    // one) moves focus to it. Typing should always carry on in the field.
    inputRef.current?.focus();

    if (answer.primaryAction === "open" && answer.href) {
      openAnswerPrefill();
      return;
    }

    if (!answer.copyValue) return;

    const edit = queryEdits.current;
    const copied = await copyText(answer.copyValue);
    // The query changed while copying, so this result is no longer shown.
    if (edit !== queryEdits.current) return;
    setCopyState(copied ? "copied" : "failed");
    if (copied) {
      copyTimer.current = window.setTimeout(() => setCopyState("idle"), 1600);
    }
  }, [answer, openAnswerPrefill]);

  const pasteFromClipboard = useCallback(async () => {
    const text = await readText();
    if (text === null) {
      setPasteMessage(dictionary.answers.pasteDenied);
      window.setTimeout(() => setPasteMessage(null), 2400);
      return;
    }
    updateQuery(text);
    setOpen(true);
    setPasteMessage(null);
  }, [dictionary.answers.pasteDenied, updateQuery]);

  const removeFromGroup = useCallback(
    (tool: ToolDefinition, mode?: "recent" | "pin") => {
      window.clearTimeout(blurTimer.current);
      if (mode === "pin") {
        setPinnedSlugs(togglePin(tool.slug));
      } else {
        setRecentSlugs(removeRecentSlug(tool.slug));
      }
      setActiveIndex(0);
    },
    [],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const mod = event.ctrlKey || event.metaKey;
    if (mod && event.shiftKey && event.key.toLowerCase() === "v") {
      event.preventDefault();
      void pasteFromClipboard();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        itemCount === 0 ? 0 : (index + 1) % itemCount,
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        itemCount === 0 ? 0 : (index - 1 + itemCount) % itemCount,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (libraryBrowse) {
        openLibrary();
        return;
      }
      if (answer && activeIndex === 0) {
        void activateAnswer();
        return;
      }
      const contentIndex = activeIndex - contentOffset;
      if (contentIndex >= 0 && contentIndex < contentHits.length) {
        const hit = contentHits[contentIndex];
        if (hit) selectContent(hit);
        return;
      }
      const tool = flatTools[activeIndex - toolOffset];
      if (tool) selectTool(tool);
      return;
    }
    if (event.key === "Escape") {
      setContinuation(null);
      if (query) {
        updateQuery("");
        return;
      }
      closePanel();
      inputRef.current?.blur();
    }
  };

  // Home stays closed until the user types, pastes, or presses arrows.
  // Tool chrome still opens empty-state pins/recent on focus.
  const showPanel =
    open &&
    (libraryBrowse ||
      query.length > 0 ||
      flatTools.length > 0 ||
      contentHits.length > 0);

  // On phones, an open suggest panel is a modal overlay (scroll lock + dim).
  const overlayActive = Boolean(showPanel && isPhone);
  useBodyScrollLock(overlayActive);
  useVisualViewportInset(overlayActive);

  // Touching the list blurs the input on mobile before scroll starts. Keep the
  // panel open for that gesture; only the backdrop / Escape should dismiss it.
  useEffect(() => {
    if (!showPanel) {
      panelPointerActive.current = false;
      return;
    }

    const isInSuggestUi = (target: EventTarget | null) => {
      if (!(target instanceof Node)) return false;
      const panel = document.getElementById("kit-suggest");
      if (panel?.contains(target)) return true;
      return Boolean(
        rootRef.current?.querySelector("[data-kit-library-browse]")?.contains(
          target,
        ),
      );
    };

    const onPointerDown = (event: PointerEvent) => {
      if (isInSuggestUi(event.target)) {
        panelPointerActive.current = true;
        window.clearTimeout(blurTimer.current);
      }
    };

    const onPointerEnd = () => {
      window.setTimeout(() => {
        const touchedPanel = panelPointerActive.current;
        panelPointerActive.current = false;
        const panel = document.getElementById("kit-suggest");
        if (panel?.dataset.scrolling === "true") return;
        // Phone overlay stays open until the backdrop is used.
        if (document.documentElement.dataset.kitOverlayOpen === "1") return;
        if (
          touchedPanel &&
          rootRef.current &&
          !rootRef.current.contains(document.activeElement)
        ) {
          closePanel();
        }
      }, 450);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerEnd, true);
    document.addEventListener("pointercancel", onPointerEnd, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerEnd, true);
      document.removeEventListener("pointercancel", onPointerEnd, true);
    };
  }, [showPanel, closePanel]);

  const panelSuggestions =
    querySuggestions.length > 0 && trimmed && !answer
      ? querySuggestions
      : [];

  return (
    <div
      ref={rootRef}
      className={`relative z-40 w-full ${variant === "home" ? "max-w-xl" : "max-w-none sm:max-w-lg lg:max-w-xl"}`}
    >
      {/* Keep the field above the dim so typing stays sharp on phones. */}
      <div
        className={
          overlayActive
            ? "relative z-[calc(var(--kit-overlay-panel-z)+1)]"
            : "relative"
        }
      >
        <SearchField
          ref={inputRef}
          value={query}
          compact={variant === "compact"}
          expanded={showPanel}
          label={dictionary.search.label}
          onChange={(value) => {
            updateQuery(value);
            if (!isExactLibraryQuery(value)) {
              setOpen(true);
            }
          }}
          onFocus={() => {
            window.clearTimeout(blurTimer.current);
            setPinnedSlugs(getPinnedSlugs());
            setShortcutTick((value) => value + 1);
            // Home autofocus should not force the suggest panel open.
            if (variant === "home" && !query.trim()) return;
            setOpen(true);
          }}
          onBlur={(event) => {
            const next = event.relatedTarget as Node | null;
            if (next && rootRef.current?.contains(next)) {
              return;
            }
            if (panelPointerActive.current) {
              return;
            }
            window.clearTimeout(blurTimer.current);
            blurTimer.current = window.setTimeout(() => {
              if (panelPointerActive.current) return;
              const panel = document.getElementById("kit-suggest");
              if (panel?.dataset.scrolling === "true") return;
              if (!rootRef.current?.contains(document.activeElement)) {
                closePanel();
              }
            }, 200);
          }}
          onKeyDown={onKeyDown}
          placeholder={
            variant === "compact"
              ? dictionary.search.placeholderCompact
              : dictionary.search.placeholder
          }
        />
      </div>
      {pasteMessage ? (
        <p className="pointer-events-none absolute left-0 right-0 top-full z-50 mt-1 px-1 text-xs text-muted">
          {pasteMessage}
        </p>
      ) : null}
      {debugInfo ? (
        <pre className="mt-2 max-h-40 overflow-auto rounded-[8px] border border-border bg-background p-2 text-[10px] text-muted">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      ) : null}

      {overlayActive ? (
        <button
          type="button"
          data-kit-search-backdrop=""
          aria-label={locale === "da" ? "Luk søgning" : "Close search"}
          className={
            variant === "compact"
              ? "fixed inset-x-0 bottom-0 top-[var(--kit-chrome-offset)] z-[var(--kit-overlay-z)] bg-background/55"
              : "fixed inset-0 z-[var(--kit-overlay-z)] bg-background/55"
          }
          onPointerDown={(event) => {
            event.preventDefault();
            panelPointerActive.current = false;
            closePanel();
            inputRef.current?.blur();
          }}
        />
      ) : null}

      {libraryBrowse && open ? (
        <div
          data-kit-library-browse=""
          className={`overflow-hidden border border-border bg-surface shadow-suggest ${
            variant === "compact"
              ? "fixed inset-x-2 z-[var(--kit-overlay-panel-z)] top-[var(--kit-search-panel-top)] rounded-[14px] sm:absolute sm:inset-x-0 sm:top-[calc(100%+8px)] sm:z-50 sm:rounded-[12px]"
              : "absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-[12px] max-sm:z-[var(--kit-overlay-panel-z)]"
          }`}
        >
          <button
            type="button"
            className="kit-touch-target flex w-full flex-col items-start gap-0.5 bg-accent-soft px-4 py-3.5 text-left transition-colors hover:bg-accent-soft sm:min-h-0"
            onPointerDown={(event) => event.preventDefault()}
            onClick={openLibrary}
          >
            <span className="text-sm font-medium text-foreground">
              {dictionary.library.open}
              <span aria-hidden className="ml-1.5 opacity-70">
                ↵
              </span>
            </span>
            <span className="text-[13px] text-muted">
              {dictionary.library.openHint}
            </span>
          </button>
        </div>
      ) : (
        <SuggestPanel
          groups={groups}
          query={trimmed}
          activeIndex={activeIndex}
          flatTools={flatTools}
          open={showPanel}
          variant={variant}
          suggestions={panelSuggestions}
          onPickSuggestion={(next) => {
            if (isLibraryQuery(next)) {
              openLibrary();
              return;
            }
            updateQuery(next);
            setOpen(true);
          }}
          onSelect={selectTool}
          onHover={setActiveIndex}
          onRemoveRecent={removeFromGroup}
          answer={answer}
          contentHits={contentHits}
          onSelectContent={selectContent}
          copyState={copyState}
          onAnswerCopy={() => void activateAnswer()}
          onAnswerOpenPrefill={openAnswerPrefill}
          shortcutToolId={shortcutHit?.tool.id}
        />
      )}
    </div>
  );
}
