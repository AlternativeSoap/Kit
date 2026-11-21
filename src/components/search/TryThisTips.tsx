"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDictionary } from "@/i18n/LanguageProvider";
import { getToolCopy } from "@/i18n/tools";
import { getExcludedIds } from "@/lib/personal";
import { getToolBySlug, kitTools } from "@/tools/registry";
import type { ToolDefinition } from "@/tools/types";

type SlotId = "lt" | "lm" | "lb" | "ac" | "rt" | "rm" | "rb";

type Slot = {
  id: SlotId;
  className: string;
  near: SlotId[];
};

/** Soft positions around the home search, away from the center field. */
const SLOTS: Slot[] = [
  {
    id: "lt",
    className: "left-[3%] top-[18%] sm:left-[6%] sm:top-[20%]",
    near: ["lm", "ac"],
  },
  {
    id: "lm",
    className: "left-[2%] top-[44%] sm:left-[4%] sm:top-[46%]",
    near: ["lt", "lb"],
  },
  {
    id: "lb",
    className: "left-[4%] top-[70%] sm:left-[7%] sm:top-[72%]",
    near: ["lm"],
  },
  {
    id: "ac",
    className: "left-1/2 top-[8%] -translate-x-1/2 sm:top-[10%]",
    near: ["lt", "rt"],
  },
  {
    id: "rt",
    className: "right-[3%] top-[18%] sm:right-[6%] sm:top-[20%]",
    near: ["rm", "ac"],
  },
  {
    id: "rm",
    className: "right-[2%] top-[44%] sm:right-[4%] sm:top-[46%]",
    near: ["rt", "rb"],
  },
  {
    id: "rb",
    className: "right-[4%] top-[68%] sm:right-[7%] sm:top-[70%]",
    near: ["rm"],
  },
];

const TIP_SLUGS = [
  "dice",
  "periodesystem",
  "moms",
  "password",
  "imgcompress",
  "ocr",
  "coinflip",
  "metronome",
  "gangetabel",
  "arbejdstid",
  "procent",
  "regex",
  "worldclock",
  "dato",
  "encode",
  "lon",
  "myip",
  "pdf",
] as const;

/** Delay after landing / clearing search before the stream starts. */
const IDLE_MS = 2_800;
/** How long a tip stays fully visible before it starts fading out. */
const SHOW_MS = 4_200;
const FADE_MS = 850;
/** Base gap between spawning the next individual tip. */
const STAGGER_MS = 2_100;
const MAX_VISIBLE = 3;

type TipCard = {
  key: string;
  tool: ToolDefinition;
  slot: Slot;
  shown: boolean;
};

function tipTools(excludeIds: string[], used: Set<string>): ToolDefinition[] {
  const bySlug = TIP_SLUGS.map((slug) => getToolBySlug(slug)).filter(
    (tool): tool is ToolDefinition => Boolean(tool),
  );
  const fallback = kitTools.filter((tool) => tool.kind === "builtin");
  const pool = [...bySlug, ...fallback].filter(
    (tool, index, arr) =>
      arr.findIndex((item) => item.id === tool.id) === index &&
      !excludeIds.includes(tool.id) &&
      !used.has(tool.id),
  );
  return pool.sort(() => Math.random() - 0.5);
}

function slotFree(slot: Slot, occupied: Slot[]): boolean {
  return !occupied.some(
    (other) =>
      other.id === slot.id ||
      other.near.includes(slot.id) ||
      slot.near.includes(other.id),
  );
}

function jitter(base: number, spread = 0.28) {
  const delta = base * spread;
  return Math.round(base + (Math.random() * 2 - 1) * delta);
}

export function TryThisTips() {
  const dictionary = useDictionary();
  const [tips, setTips] = useState<TipCard[]>([]);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  const tipsRef = useRef<TipCard[]>([]);
  const timers = useRef<number[]>([]);
  const usedTools = useRef<Set<string>>(new Set());
  const cycle = useRef(0);
  const hovering = useRef(false);
  const active = useRef(false);
  const streamArmed = useRef(false);

  function clearTimers() {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }

  function after(ms: number, fn: () => void) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }

  function setTipsBoth(next: TipCard[] | ((prev: TipCard[]) => TipCard[])) {
    setTips((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      tipsRef.current = resolved;
      return resolved;
    });
  }

  function fadeOutOne(key: string) {
    setTipsBoth((prev) =>
      prev.map((tip) => (tip.key === key ? { ...tip, shown: false } : tip)),
    );
    after(FADE_MS, () => {
      if (hovering.current) return;
      setTipsBoth((prev) => prev.filter((tip) => tip.key !== key));
    });
  }

  function spawnOne() {
    if (!active.current || hovering.current) return;

    const live = tipsRef.current.filter((tip) => tip.shown);
    if (live.length >= MAX_VISIBLE) return;

    // Sometimes keep the scene quieter so 1–3 feels natural over time.
    if (live.length >= 1 && Math.random() < 0.22) return;

    const occupied = live.map((tip) => tip.slot);
    const pool = SLOTS.filter((slot) => slotFree(slot, occupied)).sort(
      () => Math.random() - 0.5,
    );
    const slot = pool[0];
    if (!slot) return;

    let tools = tipTools(getExcludedIds(), usedTools.current);
    if (tools.length === 0) {
      usedTools.current.clear();
      tools = tipTools(getExcludedIds(), usedTools.current);
    }
    const tool = tools[0];
    if (!tool) return;

    usedTools.current.add(tool.id);
    if (usedTools.current.size > 12) {
      usedTools.current = new Set([...usedTools.current].slice(-5));
    }

    const key = `${cycle.current++}-${tool.id}-${slot.id}`;
    const card: TipCard = { key, tool, slot, shown: false };
    setTipsBoth((prev) => [...prev, card]);

    after(40, () => {
      setTipsBoth((prev) =>
        prev.map((tip) => (tip.key === key ? { ...tip, shown: true } : tip)),
      );
    });

    // Start fading out before the next tip(s) fully settle in.
    after(jitter(SHOW_MS), () => {
      if (hovering.current && tipsRef.current.some((t) => t.key === key && t.shown)) {
        return;
      }
      fadeOutOne(key);
    });
  }

  function scheduleNext() {
    if (!active.current || !streamArmed.current) return;
    after(jitter(STAGGER_MS), () => {
      if (!active.current || !streamArmed.current) return;
      if (!hovering.current) spawnOne();
      scheduleNext();
    });
  }

  function stopStream(fade = true) {
    streamArmed.current = false;
    active.current = false;
    setEnabled(false);
    clearTimers();
    hovering.current = false;
    setHoveredKey(null);
    if (fade) {
      setTipsBoth((prev) => prev.map((tip) => ({ ...tip, shown: false })));
      after(FADE_MS, () => setTipsBoth([]));
    } else {
      setTipsBoth([]);
    }
  }

  function startStream() {
    const input = document.getElementById(
      "kit-search",
    ) as HTMLInputElement | null;
    if (!input || input.value.trim()) {
      stopStream(false);
      return;
    }

    clearTimers();
    setTipsBoth([]);
    setHoveredKey(null);
    hovering.current = false;
    active.current = true;
    streamArmed.current = true;
    setEnabled(true);

    after(IDLE_MS, () => {
      const field = document.getElementById(
        "kit-search",
      ) as HTMLInputElement | null;
      if (!field || field.value.trim() || !active.current) return;
      spawnOne();
      scheduleNext();
    });
  }

  useEffect(() => {
    const input = document.getElementById(
      "kit-search",
    ) as HTMLInputElement | null;
    if (!input) return;

    const onInput = () => {
      if (input.value.trim()) {
        stopStream(true);
        return;
      }
      startStream();
    };

    // Empty search keeps the stream alive with or without focus.
    input.addEventListener("input", onInput);

    const bootId = window.setTimeout(() => {
      if (!input.value.trim()) startStream();
    }, 80);
    timers.current.push(bootId);

    return () => {
      clearTimers();
      input.removeEventListener("input", onInput);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once on home
  }, []);

  if (!enabled && tips.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 hidden overflow-hidden min-[960px]:block"
      aria-hidden={tips.length === 0}
    >
      {tips.map((tip) => {
        const copy = getToolCopy(dictionary, tip.tool.id);
        const locked = hoveredKey === tip.key;
        const visible = tip.shown || locked;

        return (
          <Link
            key={tip.key}
            href={`/t/${tip.tool.slug}`}
            onMouseEnter={() => {
              hovering.current = true;
              setHoveredKey(tip.key);
              setTipsBoth((prev) =>
                prev.map((item) =>
                  item.key === tip.key ? { ...item, shown: true } : item,
                ),
              );
            }}
            onMouseLeave={() => {
              hovering.current = false;
              setHoveredKey(null);
              after(500, () => {
                if (hovering.current || !active.current) return;
                fadeOutOne(tip.key);
              });
            }}
            className={`pointer-events-auto absolute max-w-[13.5rem] rounded-[12px] border bg-surface/92 px-3 py-2.5 shadow-suggest backdrop-blur-[2px] transition-[opacity,transform,box-shadow,border-color] duration-[850ms] ease-out ${
              tip.slot.className
            } ${
              visible
                ? locked
                  ? "z-10 scale-100 border-accent/50 opacity-100 shadow-[0_0_0_3px_var(--accent-soft)]"
                  : "scale-100 border-border opacity-[0.46]"
                : "scale-[0.985] border-border opacity-0"
            }`}
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
              {dictionary.search.tryThis}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {copy.name}
            </p>
            <p
              className={`overflow-hidden text-xs leading-snug text-muted transition-all duration-300 ${
                locked
                  ? "mt-1 max-h-24 opacity-100"
                  : "mt-0 max-h-0 opacity-0"
              }`}
            >
              {copy.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

/** Compact discovery chips under home search on phones (floating tips are desktop-only). */
export function MobileTryThisRail() {
  const dictionary = useDictionary();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const input = document.getElementById(
      "kit-search",
    ) as HTMLInputElement | null;
    if (!input) return;
    const sync = () => setHidden(Boolean(input.value.trim()));
    sync();
    input.addEventListener("input", sync);
    return () => input.removeEventListener("input", sync);
  }, []);

  const tools = useMemo(() => {
    const exclude = getExcludedIds();
    return TIP_SLUGS.map((slug) => getToolBySlug(slug))
      .filter((tool): tool is ToolDefinition => Boolean(tool))
      .filter((tool) => !exclude.includes(tool.id))
      .slice(0, 10);
  }, []);

  if (hidden || tools.length === 0) return null;

  return (
    <div className="mt-5 min-[960px]:hidden">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        {dictionary.search.tryThis}
      </p>
      <ul className="kit-h-scroll gap-2">
        {tools.map((tool) => {
          const copy = getToolCopy(dictionary, tool.id);
          return (
            <li key={tool.id}>
              <Link
                href={`/t/${tool.slug}`}
                className="kit-touch-target inline-flex shrink-0 items-center rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-accent-soft"
              >
                {copy.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
