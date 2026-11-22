export type SqlMode = "format" | "minify";

export type SqlProcessResult =
  | { ok: true; output: string }
  | { ok: false; error: string };

const KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "OUTER JOIN",
  "CROSS JOIN",
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "FULL OUTER JOIN",
  "ON",
  "AND",
  "OR",
  "NOT",
  "IN",
  "IS",
  "NULL",
  "AS",
  "ORDER BY",
  "GROUP BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "UNION",
  "UNION ALL",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "CREATE",
  "TABLE",
  "ALTER",
  "DROP",
  "DISTINCT",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "BETWEEN",
  "LIKE",
  "EXISTS",
  "WITH",
  "ASC",
  "DESC",
] as const;

/** Longer phrases first so "ORDER BY" wins over "ORDER" / "BY". */
const KEYWORD_PATTERN = [...KEYWORDS]
  .sort((a, b) => b.length - a.length)
  .map((word) => word.replace(/\s+/g, "\\s+"))
  .join("|");

const KEYWORD_RE = new RegExp(`\\b(?:${KEYWORD_PATTERN})\\b`, "gi");

const INDENT_LINE = /^(ON|AND|OR)$/i;

function uppercaseKeywords(sql: string): string {
  return sql.replace(KEYWORD_RE, (match) =>
    match.replace(/\s+/g, " ").toUpperCase(),
  );
}

function collapseWhitespaceOutsideStrings(sql: string): string {
  let out = "";
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i]!;

    if (ch === "'" || ch === '"' || ch === "`") {
      const quote = ch;
      out += ch;
      i += 1;
      while (i < sql.length) {
        const c = sql[i]!;
        out += c;
        i += 1;
        if (c === "\\" && i < sql.length) {
          out += sql[i]!;
          i += 1;
          continue;
        }
        if (c === quote) {
          if (quote === "'" && sql[i] === "'") {
            out += sql[i]!;
            i += 1;
            continue;
          }
          break;
        }
      }
      continue;
    }

    if (ch === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") {
        out += sql[i]!;
        i += 1;
      }
      continue;
    }

    if (ch === "/" && sql[i + 1] === "*") {
      out += "/*";
      i += 2;
      while (i < sql.length) {
        if (sql[i] === "*" && sql[i + 1] === "/") {
          out += "*/";
          i += 2;
          break;
        }
        out += sql[i]!;
        i += 1;
      }
      continue;
    }

    if (/\s/.test(ch)) {
      out += " ";
      i += 1;
      while (i < sql.length && /\s/.test(sql[i]!)) i += 1;
      continue;
    }

    out += ch;
    i += 1;
  }
  return out.trim().replace(/ +\n/g, "\n").replace(/\n +/g, "\n");
}

function minifySql(sql: string): string {
  return uppercaseKeywords(collapseWhitespaceOutsideStrings(sql))
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s*\(\s*/g, "(")
    .replace(/\s*\)\s*/g, ")")
    .replace(/\s*=\s*/g, " = ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatSql(sql: string): string {
  const normalized = uppercaseKeywords(collapseWhitespaceOutsideStrings(sql));
  const tokens = normalized
    .replace(/\s*,\s*/g, ", ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();

  if (!tokens) return "";

  // Split keeping major clause keywords as line starts.
  const parts = tokens.split(
    /\s+(?=(?:SELECT|FROM|WHERE|INNER JOIN|LEFT OUTER JOIN|RIGHT OUTER JOIN|FULL OUTER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|OUTER JOIN|CROSS JOIN|JOIN|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|UNION ALL|UNION|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|WITH)\b)/i,
  );

  const lines: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const firstWord = (() => {
      const multi =
        /^(INNER JOIN|LEFT OUTER JOIN|RIGHT OUTER JOIN|FULL OUTER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|OUTER JOIN|CROSS JOIN|ORDER BY|GROUP BY|UNION ALL)\b/i.exec(
          trimmed,
        );
      if (multi) return multi[1]!.toUpperCase();
      const single = /^([A-Z]+)\b/.exec(trimmed);
      return single ? single[1]! : "";
    })();

    const indent = INDENT_LINE.test(firstWord) ? "  " : "";

    // Break long SELECT / SET lists on commas.
    if (/^(SELECT|SET|VALUES)\b/i.test(trimmed) && trimmed.includes(",")) {
      const pieces = trimmed
        .split(/,\s*/)
        .map((piece) => piece.trim())
        .filter(Boolean);
      for (let i = 0; i < pieces.length; i += 1) {
        const isLast = i === pieces.length - 1;
        const prefix = i === 0 ? indent : "  ";
        lines.push(`${prefix}${pieces[i]}${isLast ? "" : ","}`);
      }
      continue;
    }

    // AND / OR inside WHERE get an extra indent when embedded in the same part.
    const withBreaks = trimmed.replace(
      /\s+(AND|OR)\s+/gi,
      (_m, conj: string) => `\n  ${conj.toUpperCase()} `,
    );

    for (const line of withBreaks.split("\n")) {
      const clean = line.trim();
      if (!clean) continue;
      if (/^(AND|OR)\b/i.test(clean)) {
        lines.push(`  ${clean}`);
      } else {
        lines.push(`${indent}${clean}`);
      }
    }
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function processSql(input: string, mode: SqlMode): SqlProcessResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "empty" };
  }

  try {
    const output = mode === "minify" ? minifySql(trimmed) : formatSql(trimmed);
    return { ok: true, output };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to format SQL";
    return { ok: false, error: message };
  }
}
