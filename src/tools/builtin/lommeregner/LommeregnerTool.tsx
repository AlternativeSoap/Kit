"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/i18n/LanguageProvider";
import { FORMULA_IDS } from "@/tools/builtin/lommeregner/formulas";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import { AdvancedCalculator } from "./AdvancedCalculator";
import { SimpleCalculator } from "./SimpleCalculator";

type CalculatorMode = "simple" | "advanced";

const MODE_KEY = "kit:calculator-mode";

function readStoredMode(): CalculatorMode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MODE_KEY);
    if (raw === "simple" || raw === "advanced") return raw;
  } catch {
    // ignore
  }
  return null;
}

function writeStoredMode(mode: CalculatorMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MODE_KEY, mode);
  } catch {
    // ignore
  }
}

function modeFromPrefill(prefill?: ToolPrefill): CalculatorMode | null {
  const explicit = prefillChoice(prefill, "mode", [
    "simple",
    "advanced",
  ] as const);
  if (explicit) return explicit;
  if (prefillChoice(prefill, "formula", FORMULA_IDS)) return "advanced";
  // A plain numeric result from Instant Answers should open the pad.
  if (prefill?.value) return "simple";
  return null;
}

export function LommeregnerTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.calculator;
  const [mode, setMode] = useState<CalculatorMode>(
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

  const changeMode = (next: CalculatorMode) => {
    setMode(next);
    writeStoredMode(next);
  };

  const active = mode;

  return (
    <div className="mx-auto w-full max-w-lg">
      <div
        className="mb-7 inline-flex items-center gap-1"
        role="group"
        aria-label={t.modeLabel}
      >
        <button
          type="button"
          aria-pressed={active === "simple"}
          onClick={() => changeMode("simple")}
          className={`kit-touch-target rounded-[8px] px-3 py-1.5 text-xs font-medium transition-colors sm:min-h-0 ${
            active === "simple"
              ? "bg-accent text-white"
              : "text-muted hover:bg-accent-soft hover:text-foreground"
          }`}
        >
          {t.modeSimple}
        </button>
        <button
          type="button"
          aria-pressed={active === "advanced"}
          onClick={() => changeMode("advanced")}
          className={`kit-touch-target rounded-[8px] px-3 py-1.5 text-xs font-medium transition-colors sm:min-h-0 ${
            active === "advanced"
              ? "bg-accent text-white"
              : "text-muted hover:bg-accent-soft hover:text-foreground"
          }`}
        >
          {t.modeAdvanced}
        </button>
      </div>

      {active === "simple" ? (
        <SimpleCalculator prefill={prefill} />
      ) : (
        <AdvancedCalculator prefill={prefill} />
      )}
    </div>
  );
}
