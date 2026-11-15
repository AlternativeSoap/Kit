import type { Locale } from "@/i18n/types";
import { NUMBER_SOURCE, parseLocaleNumber } from "./numbers";

export type MathOperator = "+" | "-" | "*" | "/";

export type MathToken =
  | { type: "number"; value: number }
  | { type: "operator"; value: MathOperator }
  | { type: "paren"; value: "(" | ")" };

export type MathResult = {
  value: number;
  tokens: MathToken[];
};

const MAX_LENGTH = 80;
const MAX_DEPTH = 12;
const NUMBER_AT = new RegExp(NUMBER_SOURCE, "y");

function tokenize(input: string, locale: Locale): MathToken[] | null {
  const tokens: MathToken[] = [];
  let index = 0;

  while (index < input.length) {
    const char = input[index]!;
    if (char === " ") {
      index += 1;
      continue;
    }

    if (/\d/.test(char)) {
      NUMBER_AT.lastIndex = index;
      const match = NUMBER_AT.exec(input);
      if (!match) return null;
      const value = parseLocaleNumber(match[0], locale);
      if (value === null) return null;
      tokens.push({ type: "number", value });
      index += match[0].length;
      continue;
    }

    if (char === "+" || char === "-" || char === "*" || char === "/") {
      tokens.push({ type: "operator", value: char });
    } else if (char === "x") {
      tokens.push({ type: "operator", value: "*" });
    } else if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char });
    } else {
      return null;
    }
    index += 1;
  }

  return tokens;
}

/**
 * Evaluates plain arithmetic: + - * / and parentheses. Returns null for
 * anything else, including a lone number and division by zero.
 */
export function evaluateArithmetic(
  input: string,
  locale: Locale,
): MathResult | null {
  const text = input.trim().replace(/\s*=$/, "");
  if (!text || text.length > MAX_LENGTH) return null;

  const tokens = tokenize(text, locale);
  if (!tokens || tokens.length < 3) return null;

  let position = 0;
  let binaryOperations = 0;
  let failed = false;

  const peek = () => tokens[position];

  const parseFactor = (depth: number): number => {
    const token = peek();
    if (!token || depth > MAX_DEPTH) {
      failed = true;
      return 0;
    }
    if (token.type === "operator" && (token.value === "-" || token.value === "+")) {
      position += 1;
      const value = parseFactor(depth + 1);
      return token.value === "-" ? -value : value;
    }
    if (token.type === "number") {
      position += 1;
      return token.value;
    }
    if (token.type === "paren" && token.value === "(") {
      position += 1;
      const value = parseExpression(depth + 1);
      const closing = peek();
      if (!closing || closing.type !== "paren" || closing.value !== ")") {
        failed = true;
        return 0;
      }
      position += 1;
      return value;
    }
    failed = true;
    return 0;
  };

  const parseTerm = (depth: number): number => {
    let value = parseFactor(depth);
    for (;;) {
      const token = peek();
      if (
        failed ||
        !token ||
        token.type !== "operator" ||
        (token.value !== "*" && token.value !== "/")
      ) {
        return value;
      }
      position += 1;
      const right = parseFactor(depth);
      binaryOperations += 1;
      if (token.value === "/") {
        if (right === 0) {
          failed = true;
          return 0;
        }
        value /= right;
      } else {
        value *= right;
      }
    }
  };

  const parseExpression = (depth: number): number => {
    let value = parseTerm(depth);
    for (;;) {
      const token = peek();
      if (
        failed ||
        !token ||
        token.type !== "operator" ||
        (token.value !== "+" && token.value !== "-")
      ) {
        return value;
      }
      position += 1;
      const right = parseTerm(depth);
      binaryOperations += 1;
      value = token.value === "+" ? value + right : value - right;
    }
  };

  const value = parseExpression(0);
  if (failed || position !== tokens.length || binaryOperations === 0) {
    return null;
  }
  if (!Number.isFinite(value)) return null;

  return { value, tokens };
}

const OPERATOR_SYMBOL: Record<MathOperator, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

/** Renders the parsed expression so people can see how it was read. */
export function formatExpression(
  tokens: MathToken[],
  formatValue: (value: number) => string,
): string {
  let output = "";
  let previous: MathToken | undefined;

  for (const token of tokens) {
    if (token.type === "number") {
      output += formatValue(token.value);
    } else if (token.type === "paren") {
      output += token.value;
    } else {
      const unary =
        !previous ||
        previous.type === "operator" ||
        (previous.type === "paren" && previous.value === "(");
      output += unary
        ? OPERATOR_SYMBOL[token.value]
        : ` ${OPERATOR_SYMBOL[token.value]} `;
    }
    previous = token;
  }

  return output;
}
