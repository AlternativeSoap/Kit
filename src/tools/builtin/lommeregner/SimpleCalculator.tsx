"use client";

import { useCallback, useEffect, useState } from "react";
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

export function SimpleCalculator({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const errorLabel = dictionary.calculator.error;

  const [display, setDisplay] = useState(prefillNumber(prefill, "value") ?? "0");
  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);
  const [history, setHistory] = useState<string[]>([]);

  const isError = display === ERROR_TOKEN;
  const current = Number(isError ? "NaN" : display.replace(",", "."));

  const pressDigit = useCallback(
    (digit: string) => {
      if (fresh || display === "0" || isError) {
        setDisplay(digit);
      } else if (display.replace(".", "").length < 12) {
        setDisplay(display + digit);
      }
      setFresh(false);
    },
    [display, fresh, isError],
  );

  const pressDot = useCallback(() => {
    if (fresh || isError) {
      setDisplay("0.");
    } else if (!display.includes(".")) {
      setDisplay(`${display}.`);
    }
    setFresh(false);
  }, [display, fresh, isError]);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setAccumulator(null);
    setPendingOp(null);
    setFresh(true);
  }, []);

  const commitPending = useCallback(() => {
    if (accumulator === null || !pendingOp || fresh) {
      return accumulator ?? current;
    }
    const next = compute(accumulator, current, pendingOp);
    if (next === null) {
      setDisplay(ERROR_TOKEN);
      setAccumulator(null);
      setPendingOp(null);
      setFresh(true);
      return null;
    }
    const shown = String(Number(next.toPrecision(12)));
    setHistory((items) =>
      [`${accumulator} ${pendingOp} ${current} = ${shown}`, ...items].slice(
        0,
        6,
      ),
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
    },
    [clearAll, commitPending, isError],
  );

  const pressEquals = useCallback(() => {
    if (!pendingOp || accumulator === null) return;
    const value = commitPending();
    if (value === null) return;
    setPendingOp(null);
    setFresh(true);
  }, [accumulator, commitPending, pendingOp]);

  const backspace = useCallback(() => {
    if (fresh) return;
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === ERROR_TOKEN) return "0";
      return prev.slice(0, -1);
    });
  }, [fresh]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
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
      if (event.key === "+") {
        event.preventDefault();
        pressOp("+");
        return;
      }
      if (event.key === "-") {
        event.preventDefault();
        pressOp("-");
        return;
      }
      if (event.key === "*") {
        event.preventDefault();
        pressOp("*");
        return;
      }
      if (event.key === "/") {
        event.preventDefault();
        pressOp("/");
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

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [backspace, clearAll, pressDigit, pressDot, pressEquals, pressOp]);

  const keys: {
    label: string;
    action: () => void;
    tone?: "muted" | "accent";
    className?: string;
  }[] = [
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

  return (
    <div className="mx-auto grid w-full max-w-md gap-6">
      <div className="rounded-[12px] border border-border bg-surface px-4 py-5 text-right">
        <p className="min-h-[1.25rem] text-xs text-muted">
          {pendingOp && accumulator !== null
            ? `${accumulator.toLocaleString(locale === "da" ? "da-DK" : "en-US")} ${pendingOp}`
            : "\u00A0"}
        </p>
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
            className={`rounded-[10px] border border-border px-3 py-4 text-lg font-medium transition-colors ${
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
            {history.map((item) => (
              <li key={item} className="font-mono">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
