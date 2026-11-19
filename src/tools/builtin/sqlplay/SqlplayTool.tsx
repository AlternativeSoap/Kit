"use client";

import { useMemo, useState } from "react";
import {
  ErrorBanner,
  Field,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Row = Record<string, string | number | null>;
type Table = { name: string; columns: string[]; rows: Row[] };

const TABLES: Table[] = [
  {
    name: "employees",
    columns: ["id", "name", "dept", "salary"],
    rows: [
      { id: 1, name: "Ada", dept: "Engineering", salary: 92000 },
      { id: 2, name: "Bo", dept: "Sales", salary: 61000 },
      { id: 3, name: "Cora", dept: "Engineering", salary: 88000 },
      { id: 4, name: "Dan", dept: "HR", salary: 54000 },
      { id: 5, name: "Eva", dept: "Sales", salary: 72000 },
      { id: 6, name: "Finn", dept: "Engineering", salary: 99000 },
    ],
  },
  {
    name: "products",
    columns: ["id", "name", "category", "price"],
    rows: [
      { id: 10, name: "Notebook", category: "Office", price: 12.5 },
      { id: 11, name: "Keyboard", category: "Electronics", price: 49 },
      { id: 12, name: "Mug", category: "Office", price: 8 },
      { id: 13, name: "Monitor", category: "Electronics", price: 220 },
      { id: 14, name: "Stapler", category: "Office", price: 6.5 },
    ],
  },
  {
    name: "orders",
    columns: ["id", "employee_id", "product_id", "qty"],
    rows: [
      { id: 100, employee_id: 1, product_id: 11, qty: 2 },
      { id: 101, employee_id: 2, product_id: 10, qty: 5 },
      { id: 102, employee_id: 5, product_id: 13, qty: 1 },
      { id: 103, employee_id: 1, product_id: 12, qty: 3 },
      { id: 104, employee_id: 3, product_id: 11, qty: 1 },
      { id: 105, employee_id: 6, product_id: 14, qty: 4 },
    ],
  },
];

const EXAMPLES = [
  "SELECT name, salary FROM employees WHERE dept = 'Engineering' ORDER BY salary DESC",
  "SELECT * FROM products WHERE price > 10 AND category = 'Office' LIMIT 3",
  "SELECT e.name, o.qty FROM employees e JOIN orders o ON e.id = o.employee_id WHERE o.qty >= 2",
  "SELECT name, price FROM products ORDER BY price ASC LIMIT 5",
];

type Token = { type: string; value: string };

function tokenize(sql: string): Token[] {
  const src = sql.trim().replace(/;+\s*$/, "");
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i]!;
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      let j = i + 1;
      let val = "";
      while (j < src.length && src[j] !== quote) {
        if (src[j] === "\\" && j + 1 < src.length) {
          val += src[j + 1];
          j += 2;
          continue;
        }
        val += src[j];
        j++;
      }
      if (j >= src.length) throw new Error("Unterminated string literal.");
      tokens.push({ type: "string", value: val });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j]!)) j++;
      tokens.push({ type: "number", value: src.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_.]/.test(src[j]!)) j++;
      const raw = src.slice(i, j);
      const upper = raw.toUpperCase();
      const keywords = new Set([
        "SELECT",
        "FROM",
        "WHERE",
        "AND",
        "OR",
        "ORDER",
        "BY",
        "ASC",
        "DESC",
        "LIMIT",
        "JOIN",
        "ON",
        "AS",
        "INNER",
      ]);
      tokens.push({
        type: keywords.has(upper) ? "kw" : "ident",
        value: keywords.has(upper) ? upper : raw,
      });
      i = j;
      continue;
    }
    if ("=<>!(),*".includes(ch)) {
      if ((ch === "<" || ch === ">" || ch === "!") && src[i + 1] === "=") {
        tokens.push({ type: "op", value: ch + "=" });
        i += 2;
        continue;
      }
      tokens.push({ type: ch === "*" ? "star" : "op", value: ch });
      i++;
      continue;
    }
    throw new Error(`Unsupported character near "${ch}".`);
  }
  return tokens;
}

type ParsedQuery = {
  columns: string[] | "*";
  from: { table: string; alias?: string };
  join?: { table: string; alias?: string; left: string; right: string };
  where?: WhereNode;
  orderBy?: { col: string; dir: "ASC" | "DESC" };
  limit?: number;
};

type WhereNode =
  | { kind: "cmp"; left: string; op: string; right: string | number }
  | { kind: "and"; left: WhereNode; right: WhereNode }
  | { kind: "or"; left: WhereNode; right: WhereNode };

class Parser {
  private i = 0;
  constructor(private tokens: Token[]) {}

  peek() {
    return this.tokens[this.i];
  }
  next() {
    return this.tokens[this.i++];
  }
  expect(type: string, value?: string) {
    const t = this.next();
    if (!t || t.type !== type || (value != null && t.value !== value)) {
      throw new Error(
        value
          ? `Expected ${value}.`
          : `Unexpected token${t ? ` "${t.value}"` : " at end of query"}.`,
      );
    }
    return t;
  }

  parse(): ParsedQuery {
    this.expect("kw", "SELECT");
    let columns: string[] | "*" = "*";
    const first = this.peek();
    if (first?.type === "star") {
      this.next();
      columns = "*";
    } else {
      columns = [];
      for (;;) {
        const id = this.expect("ident");
        columns.push(id.value);
        if (this.peek()?.value === ",") {
          this.next();
          continue;
        }
        break;
      }
    }

    this.expect("kw", "FROM");
    const fromTable = this.expect("ident").value;
    let fromAlias: string | undefined;
    if (this.peek()?.type === "kw" && this.peek()?.value === "AS") {
      this.next();
      fromAlias = this.expect("ident").value;
    } else if (this.peek()?.type === "ident" && !isClauseStart(this.peek()!.value)) {
      fromAlias = this.next()!.value;
    }

    let join: ParsedQuery["join"];
    if (this.peek()?.type === "kw" && (this.peek()?.value === "JOIN" || this.peek()?.value === "INNER")) {
      if (this.peek()?.value === "INNER") {
        this.next();
        this.expect("kw", "JOIN");
      } else {
        this.next();
      }
      const joinTable = this.expect("ident").value;
      let joinAlias: string | undefined;
      if (this.peek()?.type === "kw" && this.peek()?.value === "AS") {
        this.next();
        joinAlias = this.expect("ident").value;
      } else if (this.peek()?.type === "ident" && !isClauseStart(this.peek()!.value)) {
        joinAlias = this.next()!.value;
      }
      this.expect("kw", "ON");
      const left = this.expect("ident").value;
      this.expect("op", "=");
      const right = this.expect("ident").value;
      join = { table: joinTable, alias: joinAlias, left, right };
    }

    let where: WhereNode | undefined;
    if (this.peek()?.type === "kw" && this.peek()?.value === "WHERE") {
      this.next();
      where = this.parseWhere();
    }

    let orderBy: ParsedQuery["orderBy"];
    if (this.peek()?.type === "kw" && this.peek()?.value === "ORDER") {
      this.next();
      this.expect("kw", "BY");
      const col = this.expect("ident").value;
      let dir: "ASC" | "DESC" = "ASC";
      if (this.peek()?.type === "kw" && (this.peek()?.value === "ASC" || this.peek()?.value === "DESC")) {
        dir = this.next()!.value as "ASC" | "DESC";
      }
      orderBy = { col, dir };
    }

    let limit: number | undefined;
    if (this.peek()?.type === "kw" && this.peek()?.value === "LIMIT") {
      this.next();
      const n = this.expect("number");
      limit = Math.max(0, Math.floor(Number(n.value)));
    }

    if (this.peek()) {
      throw new Error(
        `Unsupported syntax near "${this.peek()!.value}". This playground supports SELECT, FROM, WHERE (AND/OR), ORDER BY, LIMIT, and a single equality JOIN.`,
      );
    }

    return {
      columns,
      from: { table: fromTable, alias: fromAlias },
      join,
      where,
      orderBy,
      limit,
    };
  }

  parseWhere(): WhereNode {
    let node = this.parseCmp();
    while (this.peek()?.type === "kw" && (this.peek()?.value === "AND" || this.peek()?.value === "OR")) {
      const op = this.next()!.value.toLowerCase() as "and" | "or";
      const right = this.parseCmp();
      node = { kind: op, left: node, right };
    }
    return node;
  }

  parseCmp(): WhereNode {
    if (this.peek()?.value === "(") {
      this.next();
      const inner = this.parseWhere();
      this.expect("op", ")");
      return inner;
    }
    const left = this.expect("ident").value;
    const opTok = this.next();
    if (!opTok || (opTok.type !== "op" && opTok.type !== "kw")) {
      throw new Error("Expected comparison operator (=, !=, <, >, <=, >=).");
    }
    const op = opTok.value;
    if (!["=", "!=", "<>", "<", ">", "<=", ">="].includes(op)) {
      throw new Error(`Unsupported operator "${op}".`);
    }
    const rhs = this.next();
    if (!rhs || (rhs.type !== "string" && rhs.type !== "number" && rhs.type !== "ident")) {
      throw new Error("Expected a value on the right side of the comparison.");
    }
    const right: string | number =
      rhs.type === "number" ? Number(rhs.value) : rhs.value;
    return { kind: "cmp", left, op: op === "<>" ? "!=" : op, right };
  }
}

function isClauseStart(v: string) {
  return ["WHERE", "ORDER", "LIMIT", "JOIN", "INNER", "ON", "AND", "OR", "ASC", "DESC", "BY", "AS"].includes(
    v.toUpperCase(),
  );
}

function findTable(name: string) {
  return TABLES.find((t) => t.name.toLowerCase() === name.toLowerCase());
}

function resolveCol(row: Row, col: string): string | number | null {
  if (col in row) return row[col] ?? null;
  const bare = col.includes(".") ? col.split(".").pop()! : col;
  if (bare in row) return row[bare] ?? null;
  const lower = Object.keys(row).find((k) => k.toLowerCase() === bare.toLowerCase() || k.toLowerCase() === col.toLowerCase());
  return lower != null ? row[lower]! : null;
}

function evalWhere(node: WhereNode, row: Row): boolean {
  if (node.kind === "and") return evalWhere(node.left, row) && evalWhere(node.right, row);
  if (node.kind === "or") return evalWhere(node.left, row) || evalWhere(node.right, row);
  const lv = resolveCol(row, node.left);
  const rv =
    typeof node.right === "string" && !(node.right in row) && Number.isNaN(Number(node.right))
      ? node.right
      : typeof node.right === "number"
        ? node.right
        : typeof node.right === "string" && Object.prototype.hasOwnProperty.call(row, node.right)
          ? row[node.right]
          : node.right;
  const a = lv;
  const b = rv;
  switch (node.op) {
    case "=":
      return a == b;
    case "!=":
      return a != b;
    case "<":
      return Number(a) < Number(b);
    case ">":
      return Number(a) > Number(b);
    case "<=":
      return Number(a) <= Number(b);
    case ">=":
      return Number(a) >= Number(b);
    default:
      return false;
  }
}

function prefixRows(table: Table, alias?: string): Row[] {
  const p = alias ?? table.name;
  return table.rows.map((r) => {
    const out: Row = {};
    for (const c of table.columns) {
      out[c] = r[c] ?? null;
      out[`${p}.${c}`] = r[c] ?? null;
    }
    return out;
  });
}

function runQuery(sql: string): { columns: string[]; rows: Row[] } {
  const tokens = tokenize(sql);
  if (!tokens.length) throw new Error("Empty query.");
  const parsed = new Parser(tokens).parse();

  const leftTable = findTable(parsed.from.table);
  if (!leftTable) {
    throw new Error(
      `Unknown table "${parsed.from.table}". Available: ${TABLES.map((t) => t.name).join(", ")}.`,
    );
  }

  let working = prefixRows(leftTable, parsed.from.alias);

  if (parsed.join) {
    const rightTable = findTable(parsed.join.table);
    if (!rightTable) {
      throw new Error(`Unknown table "${parsed.join.table}".`);
    }
    const rightRows = prefixRows(rightTable, parsed.join.alias);
    const joined: Row[] = [];
    for (const L of working) {
      for (const R of rightRows) {
        if (resolveCol(L, parsed.join.left) == resolveCol(R, parsed.join.right)) {
          joined.push({ ...L, ...R });
        }
      }
    }
    working = joined;
  }

  if (parsed.where) {
    working = working.filter((r) => evalWhere(parsed.where!, r));
  }

  if (parsed.orderBy) {
    const { col, dir } = parsed.orderBy;
    working = [...working].sort((a, b) => {
      const av = resolveCol(a, col);
      const bv = resolveCol(b, col);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return dir === "ASC" ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return dir === "ASC" ? cmp : -cmp;
    });
  }

  if (parsed.limit != null) {
    working = working.slice(0, parsed.limit);
  }

  let columns: string[];
  if (parsed.columns === "*") {
    if (parsed.join) {
      const seen = new Set<string>();
      columns = [];
      for (const r of working) {
        for (const k of Object.keys(r)) {
          if (k.includes(".")) continue;
          if (!seen.has(k)) {
            seen.add(k);
            columns.push(k);
          }
        }
        break;
      }
      if (!columns.length) {
        columns = [...leftTable.columns];
      }
    } else {
      columns = [...leftTable.columns];
    }
  } else {
    columns = parsed.columns;
  }

  const rows = working.map((r) => {
    const out: Row = {};
    for (const c of columns) {
      out[c] = resolveCol(r, c);
    }
    return out;
  });

  return { columns, rows };
}

export function SqlplayTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [sql, setSql] = useState(EXAMPLES[0]!);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ columns: string[]; rows: Row[] } | null>(null);
  const [selectedTable, setSelectedTable] = useState(TABLES[0]!.name);

  const schema = useMemo(() => TABLES.find((t) => t.name === selectedTable) ?? TABLES[0]!, [selectedTable]);

  function run() {
    try {
      const out = runQuery(sql);
      setResult(out);
      setError("");
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Lille undervisnings-SQL over tre hukommelsestabeller. Understøtter SELECT, WHERE med AND/OR, ORDER BY, LIMIT og ét JOIN på lighed."
          : "Tiny educational SQL over three in-memory tables. Supports SELECT, WHERE with AND/OR, ORDER BY, LIMIT, and one equality JOIN."}
      </p>

      <section className="kit-tool-panel space-y-3 p-4 sm:p-5">
        <Field label={da ? "SQL-forespørgsel" : "SQL query"}>
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            rows={5}
            spellCheck={false}
            className="kit-field w-full resize-y rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-sm outline-none focus:border-accent"
          />
        </Field>
        <div className="kit-h-scroll">
          <button type="button" className={primaryBtnClass} onClick={run}>
            {da ? "Kør" : "Run"}
          </button>
          {EXAMPLES.map((ex, i) => (
            <button
              key={ex}
              type="button"
              className={secondaryBtnClass}
              onClick={() => {
                setSql(ex);
                setError("");
              }}
            >
              {da ? `Eksempel ${i + 1}` : `Example ${i + 1}`}
            </button>
          ))}
        </div>
        <ErrorBanner>{error}</ErrorBanner>
      </section>

      <section className="kit-tool-panel space-y-3 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-foreground">
          {da ? "Skema" : "Schema"}
        </h2>
        <div className="kit-h-scroll">
          {TABLES.map((t) => (
            <button
              key={t.name}
              type="button"
              className={t.name === selectedTable ? primaryBtnClass : secondaryBtnClass}
              onClick={() => setSelectedTable(t.name)}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2 pr-3 font-medium">{da ? "Kolonne" : "Column"}</th>
                <th className="py-2 font-medium">{da ? "Eksempel" : "Sample"}</th>
              </tr>
            </thead>
            <tbody>
              {schema.columns.map((c) => (
                <tr key={c} className="border-b border-border/60">
                  <td className="py-1.5 pr-3 font-mono text-foreground">{c}</td>
                  <td className="py-1.5 text-muted">
                    {String(schema.rows[0]?.[c] ?? "")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">
          {da
            ? `${schema.rows.length} rækker i ${schema.name}.`
            : `${schema.rows.length} rows in ${schema.name}.`}
        </p>
      </section>

      {result ? (
        <section className="kit-tool-panel space-y-3 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-foreground">
            {da
              ? `Resultat (${result.rows.length} rækker)`
              : `Result (${result.rows.length} rows)`}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  {result.columns.map((c) => (
                    <th key={c} className="py-2 pr-3 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.length === 0 ? (
                  <tr>
                    <td
                      className="py-3 text-muted"
                      colSpan={Math.max(1, result.columns.length)}
                    >
                      {da ? "Ingen rækker." : "No rows."}
                    </td>
                  </tr>
                ) : (
                  result.rows.map((r, idx) => (
                    <tr key={idx} className="border-b border-border/60">
                      {result.columns.map((c) => (
                        <td key={c} className="py-1.5 pr-3 font-mono text-foreground">
                          {r[c] == null ? "NULL" : String(r[c])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
