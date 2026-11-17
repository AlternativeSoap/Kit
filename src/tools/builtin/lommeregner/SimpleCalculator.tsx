"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";

function formatDisplay(value: string, locale: string, errorLabel: string): string {
  if (value === "Error" || value === "Fejl" || value === errorLabel) {
    return errorLabel;
  }
  if (value.includes("e") || value.includes("E")) return value;
  const [intPart, decPart] = value.split(".");
  const formattedInt = Number(intPart || "0").toLocaleString(
    locale === "da" ? "da-DK" : "en-US",
  );
  const decimalSep = locale === "da" ? "," : ".";
  if (decPart !== undefined) {
    return `${formattedInt}${decimalSep}${decPart}`;
  }
  if (value.endsWith(".")) return `${formattedInt}${decimalSep}`;
  return value.includes(".")
    ? value.replace(".", decimalSep)
    : formattedInt;
}

function compute(a: number, b: number, op: string): number | null {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b === 0 ? null : a / b;
  return null;
}

const ERROR_TOKEN = "__ERROR__";

type HistoryEntry = { expression: string; result: string };

function isEditableTarget(target: HTMLElement | null): boolean {
  if (!target) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

function formatResult(value: number): string {
  return String(Number(value.toPrecision(12)));
}

export function SimpleCalculator({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const errorLabel = dictionary.calculator.error;

  const [display, setDisplay] = useState(prefillNumber(prefill, "value") ?? "0");
  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);
  const [overwrite, setOverwrite] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  const isError = display === ERROR_TOKEN;
  const current = Number(isError ? "NaN" : display.replace(",", "."));

  const pressDigit = useCallback(
    (digit: string) => {
      if (display === "-0" && !fresh && !overwrite && !isError) {
        setDisplay(`-${digit}`);
      } else if (fresh || overwrite || display === "0" || isError) {
        setDisplay(digit);
      } else if (display.replace(/[-.]/g, "").length < 12) {
        setDisplay(display + digit);
      }
      setOverwrite(false);
      setFresh(false);
    },
    [display, fresh, isError, overwrite],
  );

  const pressDot = useCallback(() => {
    if (fresh || overwrite || isError) {
      setDisplay("0.");
    } else if (!display.includes(".")) {
      setDisplay(`${display}.`);
    }
    setOverwrite(false);
    setFresh(false);
  }, [display, fresh, isError, overwrite]);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setAccumulator(null);
    setPendingOp(null);
    setFresh(true);
    setOverwrite(false);
  }, []);

  const commitPending = useCallback(() => {
    if (accumulator === null || !pendingOp) return current;
    if (fresh) return accumulator;
    const next = compute(accumulator, current, pendingOp);
    if (next === null) {
      setDisplay(ERROR_TOKEN);
      setAccumulator(null);
      setPendingOp(null);
      setFresh(true);
      return null;
    }
    const shown = formatResult(next);
    setHistory((items) =>
      [
        {
          expression: `${accumulator} ${pendingOp} ${current}`,
          result: shown,
        },
        ...items,
      ].slice(0, 6),
    );
    setDisplay(shown);
    setAccumulator(next);
    return next;
  }, [accumulator, current, fresh, pendingOp]);

  const pressOp = useCallback(
    (op: string) => {
      if (isError) {
        clearAll();
        return;
      }
      const value = commitPending();
      if (value === null) return;
      setAccumulator(value);
      setPendingOp(op);
      setFresh(true);
      setOverwrite(false);
    },
    [clearAll, commitPending, isError],
  );

  const pressEquals = useCallback(() => {
    if (!pendingOp || accumulator === null) return;
    const value = commitPending();
    if (value === null) return;
    setPendingOp(null);
    setFresh(true);
    setOverwrite(false);
  }, [accumulator, commitPending, pendingOp]);

  const backspace = useCallback(() => {
    if (fresh || overwrite) return;
    setDisplay((prev) => {
      if (prev === ERROR_TOKEN) return "0";
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith("-"))) {
        return "0";
      }
      return prev.slice(0, -1);
    });
  }, [fresh, overwrite]);

  const toggleSign = useCallback(() => {
    if (isError) return;
    if (fresh && pendingOp) {
      // Start a negative second operand instead of flipping the stored result.
      setDisplay("-0");
      setFresh(false);
      setOverwrite(false);
      return;
    }
    if (display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : `-${display}`);
  }, [display, fresh, isError, pendingOp]);

  /** Percent of the current value, or of the stored value after + or -. */
  const pressPercent = useCallback(() => {
    if (isError || !Number.isFinite(current)) return;
    if (fresh && pendingOp) return;
    const relativeToStored =
      accumulator !== null && (pendingOp === "+" || pendingOp === "-");
    const value = relativeToStored
      ? (accumulator * current) / 100
      : current / 100;
    setDisplay(formatResult(value));
    if (pendingOp) {
      setFresh(false);
      setOverwrite(true);
    } else {
      setFresh(true);
      setOverwrite(false);
    }
  }, [accumulator, current, fresh, isError, pendingOp]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (isEditableTarget(target)) return;

      const root = rootRef.current;
      const insideRoot = !!root && !!target && root.contains(target);

      // Outside the calculator, "/" stays the global search shortcut.
      if (event.key === "/" && !insideRoot) return;

      // Let focused buttons use Enter and Space as normal activation keys.
      if (
        (event.key === "Enter" || event.key === " ") &&
        target?.closest("button")
      ) {
        return;
      }

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        pressDigit(event.key);
        return;
      }
      if (event.key === "." || event.key === ",") {
        event.preventDefault();
        pressDot();
        return;
      }
      if (event.key === "+" || event.key === "-" || event.key === "*") {
        event.preventDefault();
        pressOp(event.key);
        return;
      }
      if (event.key === "/") {
        event.preventDefault();
        // Stop the search shortcut from also receiving this key.
        event.stopPropagation();
        pressOp("/");
        return;
      }
      if (event.key === "%") {
        event.preventDefault();
        pressPercent();
        return;
      }
      if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        pressEquals();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        clearAll();
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        backspace();
      }
    };

    // Capture phase so this runs before the page-level search shortcut.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [
    backspace,
    clearAll,
    pressDigit,
    pressDot,
    pressEquals,
    pressOp,
    pressPercent,
  ]);

  const keys: {
    label: string;
    action: () => void;
    tone?: "muted" | "accent";
    className?: string;
    ariaLabel?: string;
  }[] = [
    {
      label: "±",
      action: toggleSign,
      tone: "muted",
      className: "col-span-2",
      ariaLabel: dictionary.calculator.toggleSign,
    },
    {
      label: "%",
      action: pressPercent,
      tone: "muted",
      className: "col-span-2",
      ariaLabel: dictionary.calculator.percent,
    },
    { label: "C", action: clearAll, tone: "muted" },
    { label: "⌫", action: backspace, tone: "muted" },
    { label: "÷", action: () => pressOp("/"), tone: "muted" },
    { label: "×", action: () => pressOp("*"), tone: "muted" },
    { label: "7", action: () => pressDigit("7") },
    { label: "8", action: () => pressDigit("8") },
    { label: "9", action: () => pressDigit("9") },
    { label: "−", action: () => pressOp("-"), tone: "muted" },
    { label: "4", action: () => pressDigit("4") },
    { label: "5", action: () => pressDigit("5") },
    { label: "6", action: () => pressDigit("6") },
    { label: "+", action: () => pressOp("+"), tone: "muted" },
    { label: "1", action: () => pressDigit("1") },
    { label: "2", action: () => pressDigit("2") },
    { label: "3", action: () => pressDigit("3") },
    {
      label: "=",
      action: pressEquals,
      tone: "accent",
      className: "row-span-2",
    },
    { label: "0", action: () => pressDigit("0"), className: "col-span-2" },
    { label: locale === "da" ? "," : ".", action: pressDot },
  ];

  const copyValue = isError
    ? ""
    : display.replace(".", locale === "da" ? "," : ".");

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className="mx-auto grid w-full max-w-md gap-6 outline-none"
    >
      <div className="rounded-[12px] border border-border bg-surface px-4 py-5 text-right">
        <div className="flex min-h-[1.75rem] items-center justify-between gap-3">
          {copyValue ? (
            <CopyButton
              value={copyValue}
              label={dictionary.calculator.copyResult}
              copiedLabel={dictionary.calculator.copied}
            />
          ) : (
            <span />
          )}
          <p className="text-xs text-muted">
            {pendingOp && accumulator !== null
              ? `${accumulator.toLocaleString(locale === "da" ? "da-DK" : "en-US")} ${pendingOp}`
              : "\u00A0"}
          </p>
        </div>
        <p className="mt-1 break-all font-mono text-3xl tracking-tight">
          {formatDisplay(display, locale, errorLabel)}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {keys.map((key) => (
          <button
            key={key.label}
            type="button"
            onClick={key.action}
            aria-label={key.ariaLabel}
            className={`kit-touch-target rounded-[10px] border border-border px-3 py-4 text-lg font-medium transition-colors sm:min-h-0 ${
              key.tone === "accent"
                ? "bg-accent text-white hover:opacity-90"
                : key.tone === "muted"
                  ? "bg-background text-foreground hover:bg-accent-soft"
                  : "bg-surface hover:bg-background"
            } ${key.className ?? ""}`}
          >
            {key.label}
          </button>
        ))}
      </div>

      {history.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.06em] text-muted">
            {dictionary.calculator.history}
          </p>
          <ul className="space-y-1 text-sm text-muted">
            {history.map((item, index) => (
              <li
                key={`${index}-${item.expression}-${item.result}`}
                className="font-mono"
              >
                {`${item.expression} = ${item.result}`}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
