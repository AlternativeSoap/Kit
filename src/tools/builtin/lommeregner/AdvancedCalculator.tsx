"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { copyText } from "@/lib/clipboard";
import {
  prefillChoice,
  prefillNumber,
  type ToolPrefill,
} from "@/tools/prefill";
import { FormulaPicker } from "./FormulaPicker";
import { FormulaView } from "./FormulaView";
import {
  FORMULAS,
  FORMULA_IDS,
  getFormula,
  parseSlotValue,
  type FormulaId,
} from "./formulas";

type AdvancedCalculatorProps = {
  prefill?: ToolPrefill;
};

function emptySlots(slots: readonly string[]): Record<string, string> {
  const next: Record<string, string> = {};
  for (const id of slots) next[id] = "";
  return next;
}

function formatResult(value: number, locale: "en" | "da"): string {
  if (!Number.isFinite(value)) return "—";
  const tag = locale === "da" ? "da-DK" : "en-US";
  const abs = Math.abs(value);
  // Keep the result box readable: very large/small values use scientific form.
  if (abs !== 0 && (abs >= 1e9 || abs < 1e-6)) {
    return value.toLocaleString(tag, {
      notation: "scientific",
      maximumSignificantDigits: 8,
    });
  }
  return value.toLocaleString(tag, {
    maximumFractionDigits: 8,
  });
}

function slotSymbol(id: string): string {
  return id;
}

export function AdvancedCalculator({ prefill }: AdvancedCalculatorProps) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.calculator;
  const decimalSep = locale === "da" ? "," : ".";

  const initialFormula =
    prefillChoice(prefill, "formula", FORMULA_IDS) ?? "percentOf";

  const [formulaId, setFormulaId] = useState<FormulaId>(initialFormula);
  const formula = getFormula(formulaId) ?? FORMULAS[0]!;

  const [values, setValues] = useState<Record<string, string>>(() => {
    const base = emptySlots(formula.slots);
    for (const id of formula.slots) {
      const fromPrefill = prefillNumber(prefill, id);
      if (fromPrefill !== null) base[id] = fromPrefill;
    }
    return base;
  });
  const [activeSlot, setActiveSlot] = useState(formula.slots[0] ?? "a");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  /** Enter confirms the answer once every slot is valid. */
  const [committed, setCommitted] = useState(false);
  const [undoStack, setUndoStack] = useState<Record<string, string>[]>([]);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const applyValues = useCallback(
    (updater: (prev: Record<string, string>) => Record<string, string>) => {
      const prev = valuesRef.current;
      const next = updater(prev);
      const changed = formula.slots.some(
        (id) => (prev[id] ?? "") !== (next[id] ?? ""),
      );
      if (!changed) return;
      setUndoStack((stack) => [...stack.slice(-39), { ...prev }]);
      valuesRef.current = next;
      setValues(next);
      setCommitted(false);
      setCopyState("idle");
    },
    [formula.slots],
  );

  const selectFormula = useCallback((id: FormulaId) => {
    const next = getFormula(id);
    if (!next) return;
    const empty = emptySlots(next.slots);
    setFormulaId(id);
    valuesRef.current = empty;
    setValues(empty);
    setActiveSlot(next.slots[0] ?? "a");
    setCopyState("idle");
    setCommitted(false);
    setUndoStack([]);
  }, []);

  const numericValues = useMemo(() => {
    const out: Record<string, number> = {};
    for (const id of formula.slots) {
      const parsed = parseSlotValue(values[id] ?? "", locale);
      if (parsed !== null) out[id] = parsed;
    }
    return out;
  }, [formula.slots, locale, values]);

  const filledCount = formula.slots.filter((id: string) =>
    parseSlotValue(values[id] ?? "", locale) !== null,
  ).length;

  const result = useMemo(
    () => formula.evaluate(numericValues),
    [formula, numericValues],
  );

  const writeDigit = useCallback(
    (digit: string) => {
      applyValues((prev) => {
        const current = prev[activeSlot] ?? "";
        if (current.replace(/[.,-]/g, "").length >= 12) return prev;
        const next =
          current === "0" && digit !== "." && digit !== ","
            ? digit
            : current + digit;
        return { ...prev, [activeSlot]: next };
      });
    },
    [activeSlot, applyValues],
  );

  const writeDot = useCallback(() => {
    applyValues((prev) => {
      const current = prev[activeSlot] ?? "";
      if (current.includes(".") || current.includes(",")) return prev;
      const next =
        current === "" || current === "-"
          ? `0${decimalSep}`
          : current + decimalSep;
      return { ...prev, [activeSlot]: next };
    });
  }, [activeSlot, applyValues, decimalSep]);

  const backspace = useCallback(() => {
    applyValues((prev) => {
      const current = prev[activeSlot] ?? "";
      if (!current) return prev;
      return { ...prev, [activeSlot]: current.slice(0, -1) };
    });
  }, [activeSlot, applyValues]);

  const clearSlot = useCallback(() => {
    applyValues((prev) => {
      if (!(prev[activeSlot] ?? "")) return prev;
      return { ...prev, [activeSlot]: "" };
    });
  }, [activeSlot, applyValues]);

  const clearAll = useCallback(() => {
    applyValues(() => emptySlots(formula.slots));
    setActiveSlot(formula.slots[0] ?? "a");
  }, [applyValues, formula.slots]);

  const moveSlot = useCallback(
    (direction: -1 | 1) => {
      const index = formula.slots.indexOf(activeSlot);
      if (index === -1) {
        setActiveSlot(formula.slots[0]!);
        return;
      }
      const next =
        formula.slots[
          (index + direction + formula.slots.length) % formula.slots.length
        ]!;
      setActiveSlot(next);
    },
    [activeSlot, formula.slots],
  );

  const advanceToNextEmpty = useCallback(() => {
    const index = formula.slots.indexOf(activeSlot);
    for (let step = 1; step <= formula.slots.length; step += 1) {
      const candidate =
        formula.slots[(index + step) % formula.slots.length]!;
      if (parseSlotValue(values[candidate] ?? "", locale) === null) {
        setActiveSlot(candidate);
        return true;
      }
    }
    return false;
  }, [activeSlot, formula.slots, locale, values]);

  const toggleSign = useCallback(() => {
    applyValues((prev) => {
      const current = prev[activeSlot] ?? "";
      if (!current) return { ...prev, [activeSlot]: "-" };
      if (current.startsWith("-")) {
        return { ...prev, [activeSlot]: current.slice(1) };
      }
      return { ...prev, [activeSlot]: `-${current}` };
    });
  }, [activeSlot, applyValues]);

  const copyResult = useCallback(async () => {
    if (!result.ok || !committed) return;
    const text =
      result.secondary !== undefined
        ? `${formatResult(result.primary, locale)} … ${formatResult(result.secondary, locale)}`
        : formatResult(result.primary, locale);
    const ok = await copyText(text);
    setCopyState(ok ? "copied" : "failed");
  }, [committed, locale, result]);

  const undo = useCallback(() => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const previous = stack[stack.length - 1]!;
      valuesRef.current = previous;
      setValues(previous);
      setCommitted(false);
      setCopyState("idle");
      return stack.slice(0, -1);
    });
  }, []);

  /** Enter: fill next empty slot, or confirm the result when ready. */
  const pressEnter = useCallback(() => {
    if (!result.ok) {
      advanceToNextEmpty();
      return;
    }
    setCommitted(true);
  }, [advanceToNextEmpty, result.ok]);

  const keyHandlersRef = useRef({
    advanceToNextEmpty,
    backspace,
    canCopy: false,
    clearSlot,
    copyResult,
    moveSlot,
    pressEnter,
    toggleSign,
    undo,
    writeDigit,
    writeDot,
  });
  keyHandlersRef.current = {
    advanceToNextEmpty,
    backspace,
    canCopy: result.ok && committed,
    clearSlot,
    copyResult,
    moveSlot,
    pressEnter,
    toggleSign,
    undo,
    writeDigit,
    writeDot,
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      const h = keyHandlersRef.current;
      const mod = event.ctrlKey || event.metaKey;
      if (mod && event.key.toLowerCase() === "c") {
        if (!h.canCopy) return;
        event.preventDefault();
        void h.copyResult();
        return;
      }
      if (mod && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        h.undo();
        return;
      }

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        h.writeDigit(event.key);
        return;
      }
      if (event.key === "." || event.key === ",") {
        event.preventDefault();
        h.writeDot();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        h.moveSlot(-1);
        return;
      }
      if (event.key === "ArrowRight" || event.key === "Tab") {
        event.preventDefault();
        if (event.key === "Tab" && !event.shiftKey) {
          h.advanceToNextEmpty();
        } else if (event.key === "Tab" && event.shiftKey) {
          h.moveSlot(-1);
        } else {
          h.moveSlot(1);
        }
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        h.pressEnter();
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        h.backspace();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        h.clearSlot();
        return;
      }
      if (event.key === "-") {
        event.preventDefault();
        h.toggleSign();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const keys: {
    label: string;
    action: () => void;
    tone?: "muted" | "accent";
    className?: string;
  }[] = [
    { label: "C", action: clearAll, tone: "muted" },
    { label: "⌫", action: backspace, tone: "muted" },
    { label: "←", action: () => moveSlot(-1), tone: "muted" },
    { label: "→", action: () => moveSlot(1), tone: "muted" },
    { label: "7", action: () => writeDigit("7") },
    { label: "8", action: () => writeDigit("8") },
    { label: "9", action: () => writeDigit("9") },
    { label: "+/−", action: toggleSign, tone: "muted" },
    { label: "4", action: () => writeDigit("4") },
    { label: "5", action: () => writeDigit("5") },
    { label: "6", action: () => writeDigit("6") },
    { label: decimalSep, action: writeDot, tone: "muted" },
    { label: "1", action: () => writeDigit("1") },
    { label: "2", action: () => writeDigit("2") },
    { label: "3", action: () => writeDigit("3") },
    {
      label: "=",
      action: pressEnter,
      tone: "accent",
      className: "row-span-2",
    },
    { label: "0", action: () => writeDigit("0"), className: "col-span-2" },
  ];

  const density = formula.density ?? "comfortable";
  const editingLabel = t.editingSlot.replace(
    "{slot}",
    slotSymbol(activeSlot),
  );
  const progressLabel = t.slotProgress
    .replace("{filled}", String(filledCount))
    .replace("{total}", String(formula.slots.length));

  return (
    <div className="mx-auto grid w-full max-w-lg gap-6">
      <FormulaPicker value={formulaId} onChange={selectFormula} />

      <section className="relative overflow-hidden rounded-[16px] border border-border bg-gradient-to-b from-surface to-background px-4 py-6 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />

        <div className="mb-6 flex flex-col gap-1 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <p>{editingLabel}</p>
          <p className="tabular-nums">{progressLabel}</p>
        </div>

        <FormulaView
          nodes={formula.layout}
          values={values}
          activeSlot={activeSlot}
          onActivate={setActiveSlot}
          placeholderLabel={slotSymbol}
          density={density}
        />

        <div className="mt-8 flex flex-col items-center gap-2 border-t border-border/80 pt-6">
          {result.ok && committed ? (
            <>
              <p className="font-serif text-sm text-muted">=</p>
              <p className="max-w-full overflow-hidden break-all px-1 text-center font-mono text-2xl tracking-tight sm:text-3xl">
                {formatResult(result.primary, locale)}
                {formulaId === "percentChange" ? " %" : ""}
              </p>
              <button
                type="button"
                onClick={() => void copyResult()}
                className="kit-touch-target mt-1 inline-flex items-center justify-center px-2 text-sm font-medium text-accent underline-offset-4 hover:underline sm:min-h-0 sm:min-w-0"
              >
                {copyState === "copied"
                  ? t.copied
                  : copyState === "failed"
                    ? t.copyFailed
                    : t.copyResult}
              </button>
              <p className="text-xs text-muted">{t.copyShortcut}</p>
            </>
          ) : result.ok ? (
            <p className="max-w-sm text-center text-sm text-muted">
              {t.pressEnterForResult}
            </p>
          ) : (
            <p className="max-w-sm text-center text-sm text-muted">
              {result.reason === "domain"
                ? t.domainError
                : result.reason === "invalid"
                  ? t.invalidError
                  : t.incomplete}
            </p>
          )}
        </div>
      </section>

      <p className="text-center text-xs text-muted">{t.slotHint}</p>

      <div className="grid grid-cols-4 gap-2">
        {keys.map((key) => (
          <button
            key={key.label}
            type="button"
            onClick={key.action}
            className={`kit-touch-target rounded-[12px] border border-border px-3 py-3.5 text-lg font-medium transition-colors ${
              key.tone === "accent"
                ? "bg-accent text-on-accent hover:opacity-90"
                : key.tone === "muted"
                  ? "bg-background text-foreground hover:bg-accent-soft"
                  : "bg-surface hover:bg-background"
            } ${key.className ?? ""}`}
          >
            {key.label}
          </button>
        ))}
      </div>
    </div>
  );
}
