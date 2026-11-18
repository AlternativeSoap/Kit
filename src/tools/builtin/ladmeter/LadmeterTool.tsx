"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/i18n/LanguageProvider";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import { AdvancedLoadPlanner } from "./AdvancedLoadPlanner";
import { SimpleLadmeter } from "./SimpleLadmeter";

type LadmeterMode = "simple" | "advanced";

const MODE_KEY = "kit:ladmeter-mode";

function readStoredMode(): LadmeterMode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MODE_KEY);
    if (raw === "simple" || raw === "advanced") return raw;
  } catch {
    // ignore
  }
  return null;
}

function writeStoredMode(mode: LadmeterMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MODE_KEY, mode);
  } catch {
    // ignore
  }
}

function modeFromPrefill(prefill?: ToolPrefill): LadmeterMode | null {
  return prefillChoice(prefill, "mode", ["simple", "advanced"] as const);
}

export function LadmeterTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.loadingMeter;
  const [mode, setMode] = useState<LadmeterMode>(
    () => modeFromPrefill(prefill) ?? "simple",
  );

  useEffect(() => {
    const fromPrefill = modeFromPrefill(prefill);
    if (fromPrefill) {
      setMode(fromPrefill);
      return;
    }
    const stored = readStoredMode();
    if (stored) setMode(stored);
  }, [prefill]);

  const changeMode = (next: LadmeterMode) => {
    setMode(next);
    writeStoredMode(next);
  };

  return (
    <div className="w-full">
      <div
        className="mb-7 inline-flex items-center gap-1"
        role="group"
        aria-label={t.modeLabel}
      >
        <button
          type="button"
          aria-pressed={mode === "simple"}
          onClick={() => changeMode("simple")}
          className={`kit-touch-target rounded-[8px] px-3 py-1.5 text-xs font-medium transition-colors sm:min-h-0 ${
            mode === "simple"
              ? "bg-accent text-on-accent"
              : "text-muted hover:bg-accent-soft hover:text-foreground"
          }`}
        >
          {t.modeSimple}
        </button>
        <button
          type="button"
          aria-pressed={mode === "advanced"}
          onClick={() => changeMode("advanced")}
          className={`kit-touch-target rounded-[8px] px-3 py-1.5 text-xs font-medium transition-colors sm:min-h-0 ${
            mode === "advanced"
              ? "bg-accent text-on-accent"
              : "text-muted hover:bg-accent-soft hover:text-foreground"
          }`}
        >
          {t.modeAdvanced}
        </button>
      </div>

      {mode === "simple" ? (
        <SimpleLadmeter prefill={prefill} />
      ) : (
        <AdvancedLoadPlanner />
      )}
    </div>
  );
}
