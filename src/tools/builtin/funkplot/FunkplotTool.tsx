"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  ErrorBanner,
  Field,
  KitInput,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Token =
  | { kind: "num"; value: number }
  | { kind: "id"; value: string }
  | { kind: "op"; value: string }
  | { kind: "lp" }
  | { kind: "rp" }
  | { kind: "comma" };

type Ast =
  | { type: "num"; value: number }
  | { type: "var" }
  | { type: "const"; name: "pi" | "e" }
  | { type: "unary"; op: "-" | "+"; arg: Ast }
  | { type: "binary"; op: string; left: Ast; right: Ast }
  | { type: "call"; name: string; arg: Ast };

const FUNCS = new Set(["sin", "cos", "tan", "sqrt", "abs", "log", "exp"]);
const COLORS = ["var(--accent)", "#c45c26", "#2f6fed"];

function tokenize(expr: string): Token[] {
  const s = expr.replace(/\s+/g, "");
  const out: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i]!;
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j]!)) j++;
      const n = Number(s.slice(i, j));
      if (!Number.isFinite(n)) throw new Error(`Bad number near "${s.slice(i, j)}".`);
      out.push({ kind: "num", value: n });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < s.length && /[A-Za-z0-9_]/.test(s[j]!)) j++;
      out.push({ kind: "id", value: s.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    if ("+-*/^".includes(ch)) {
      out.push({ kind: "op", value: ch });
      i++;
      continue;
    }
    if (ch === "(") {
      out.push({ kind: "lp" });
      i++;
      continue;
    }
    if (ch === ")") {
      out.push({ kind: "rp" });
      i++;
      continue;
    }
    if (ch === ",") {
      out.push({ kind: "comma" });
      i++;
      continue;
    }
    throw new Error(`Unsupported character "${ch}".`);
  }
  return out;
}

class ExprParser {
  private i = 0;
  constructor(private tokens: Token[]) {}

  peek() {
    return this.tokens[this.i];
  }
  next() {
    return this.tokens[this.i++];
  }

  parse(): Ast {
    if (!this.tokens.length) throw new Error("Empty expression.");
    const ast = this.parseExpr();
    if (this.peek()) throw new Error("Unexpected trailing tokens.");
    return ast;
  }

  parseExpr(): Ast {
    return this.parseAdd();
  }

  parseAdd(): Ast {
    let left = this.parseMul();
    for (;;) {
      const t = this.peek();
      if (t?.kind !== "op" || (t.value !== "+" && t.value !== "-")) break;
      this.next();
      const right = this.parseMul();
      left = { type: "binary", op: t.value, left, right };
    }
    return left;
  }

  parseMul(): Ast {
    let left = this.parsePow();
    for (;;) {
      const t = this.peek();
      if (t?.kind !== "op" || (t.value !== "*" && t.value !== "/")) break;
      this.next();
      const right = this.parsePow();
      left = { type: "binary", op: t.value, left, right };
    }
    return left;
  }

  parsePow(): Ast {
    let left = this.parseUnary();
    const t = this.peek();
    if (t?.kind === "op" && t.value === "^") {
      this.next();
      const right = this.parsePow(); // right-assoc
      left = { type: "binary", op: "^", left, right };
    }
    return left;
  }

  parseUnary(): Ast {
    const t = this.peek();
    if (t?.kind === "op" && (t.value === "+" || t.value === "-")) {
      this.next();
      return { type: "unary", op: t.value, arg: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  parsePrimary(): Ast {
    const t = this.next();
    if (!t) throw new Error("Unexpected end of expression.");
    if (t.kind === "num") return { type: "num", value: t.value };
    if (t.kind === "id") {
      if (t.value === "x") return { type: "var" };
      if (t.value === "pi") return { type: "const", name: "pi" };
      if (t.value === "e") return { type: "const", name: "e" };
      if (FUNCS.has(t.value)) {
        if (this.peek()?.kind !== "lp") throw new Error(`Expected "(" after ${t.value}.`);
        this.next();
        const arg = this.parseExpr();
        if (this.peek()?.kind !== "rp") throw new Error(`Expected ")" after ${t.value}(...).`);
        this.next();
        return { type: "call", name: t.value, arg };
      }
      throw new Error(`Unknown name "${t.value}". Use x, pi, e, or functions like sin(x).`);
    }
    if (t.kind === "lp") {
      const inner = this.parseExpr();
      if (this.peek()?.kind !== "rp") throw new Error('Expected ")".');
      this.next();
      return inner;
    }
    throw new Error("Unexpected token.");
  }
}

function compile(expr: string): (x: number) => number {
  const ast = new ExprParser(tokenize(expr)).parse();
  const evalAst = (node: Ast, x: number): number => {
    switch (node.type) {
      case "num":
        return node.value;
      case "var":
        return x;
      case "const":
        return node.name === "pi" ? Math.PI : Math.E;
      case "unary":
        return node.op === "-" ? -evalAst(node.arg, x) : evalAst(node.arg, x);
      case "binary": {
        const a = evalAst(node.left, x);
        const b = evalAst(node.right, x);
        switch (node.op) {
          case "+":
            return a + b;
          case "-":
            return a - b;
          case "*":
            return a * b;
          case "/":
            return b === 0 ? NaN : a / b;
          case "^":
            return a ** b;
          default:
            return NaN;
        }
      }
      case "call": {
        const v = evalAst(node.arg, x);
        switch (node.name) {
          case "sin":
            return Math.sin(v);
          case "cos":
            return Math.cos(v);
          case "tan":
            return Math.tan(v);
          case "sqrt":
            return v < 0 ? NaN : Math.sqrt(v);
          case "abs":
            return Math.abs(v);
          case "log":
            return v <= 0 ? NaN : Math.log(v);
          case "exp":
            return Math.exp(v);
          default:
            return NaN;
        }
      }
    }
  };
  return (x) => evalAst(ast, x);
}

type View = { xMin: number; xMax: number; yMin: number; yMax: number };

const DEFAULT_VIEW: View = { xMin: -8, xMax: 8, yMin: -5, yMax: 5 };

export function FunkplotTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [expr1, setExpr1] = useState("sin(x)");
  const [expr2, setExpr2] = useState("x^2 / 10");
  const [expr3, setExpr3] = useState("");
  const [view, setView] = useState<View>(DEFAULT_VIEW);
  const [errors, setErrors] = useState<string[]>([]);
  const [cursor, setCursor] = useState<{ x: number; y: number; vals: (number | null)[] } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ px: number; py: number; view: View } | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  const exprs = useMemo(
    () => [expr1, expr2, expr3].map((s) => s.trim()).filter(Boolean),
    [expr1, expr2, expr3],
  );

  const compiled = useMemo(() => {
    const fns: (((x: number) => number) | null)[] = [];
    const errs: string[] = [];
    for (const e of [expr1, expr2, expr3]) {
      const t = e.trim();
      if (!t) {
        fns.push(null);
        continue;
      }
      try {
        fns.push(compile(t));
      } catch (err) {
        fns.push(null);
        errs.push(`${t}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    return { fns, errs };
  }, [expr1, expr2, expr3]);

  useEffect(() => {
    setErrors(compiled.errs);
  }, [compiled.errs]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, wrap.clientWidth);
    const h = Math.max(240, Math.min(420, Math.round(w * 0.55)));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const v = viewRef.current;
    const xToPx = (x: number) => ((x - v.xMin) / (v.xMax - v.xMin)) * w;
    const yToPx = (y: number) => ((v.yMax - y) / (v.yMax - v.yMin)) * h;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = getComputedStyle(canvas).getPropertyValue("--surface").trim() || "#f7f5f0";
    ctx.fillRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    const xStep = niceStep(v.xMax - v.xMin);
    const yStep = niceStep(v.yMax - v.yMin);
    for (let x = Math.ceil(v.xMin / xStep) * xStep; x <= v.xMax; x += xStep) {
      ctx.beginPath();
      ctx.moveTo(xToPx(x), 0);
      ctx.lineTo(xToPx(x), h);
      ctx.stroke();
    }
    for (let y = Math.ceil(v.yMin / yStep) * yStep; y <= v.yMax; y += yStep) {
      ctx.beginPath();
      ctx.moveTo(0, yToPx(y));
      ctx.lineTo(w, yToPx(y));
      ctx.stroke();
    }

    // axes
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1.25;
    if (v.xMin <= 0 && v.xMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(xToPx(0), 0);
      ctx.lineTo(xToPx(0), h);
      ctx.stroke();
    }
    if (v.yMin <= 0 && v.yMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(0, yToPx(0));
      ctx.lineTo(w, yToPx(0));
      ctx.stroke();
    }

    const samples = Math.min(900, Math.max(200, Math.floor(w * 1.5)));
    compiled.fns.forEach((fn, idx) => {
      if (!fn) return;
      const color = COLORS[idx] ?? COLORS[0]!;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= samples; i++) {
        const x = v.xMin + ((v.xMax - v.xMin) * i) / samples;
        let y: number;
        try {
          y = fn(x);
        } catch {
          started = false;
          continue;
        }
        if (!Number.isFinite(y) || Math.abs(y) > 1e6) {
          started = false;
          continue;
        }
        const px = xToPx(x);
        const py = yToPx(y);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    });
  }, [compiled.fns]);

  useEffect(() => {
    draw();
  }, [draw, view]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw]);

  function clientToWorld(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const v = viewRef.current;
    const x = v.xMin + (px / rect.width) * (v.xMax - v.xMin);
    const y = v.yMax - (py / rect.height) * (v.yMax - v.yMin);
    return { x, y, px, py };
  }

  function onPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY, view: { ...viewRef.current } };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    const world = clientToWorld(e.clientX, e.clientY);
    if (world) {
      const vals = compiled.fns.map((fn) => {
        if (!fn) return null;
        try {
          const y = fn(world.x);
          return Number.isFinite(y) ? y : null;
        } catch {
          return null;
        }
      });
      setCursor({ x: world.x, y: world.y, vals });
    }

    const drag = dragRef.current;
    if (!drag) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dx = ((e.clientX - drag.px) / rect.width) * (drag.view.xMax - drag.view.xMin);
    const dy = ((e.clientY - drag.py) / rect.height) * (drag.view.yMax - drag.view.yMin);
    setView({
      xMin: drag.view.xMin - dx,
      xMax: drag.view.xMax - dx,
      yMin: drag.view.yMin + dy,
      yMax: drag.view.yMax + dy,
    });
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  function onWheel(e: ReactWheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const world = clientToWorld(e.clientX, e.clientY);
    if (!world) return;
    const v = viewRef.current;
    const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12;
    const nxMin = world.x - (world.x - v.xMin) * factor;
    const nxMax = world.x + (v.xMax - world.x) * factor;
    const nyMin = world.y - (world.y - v.yMin) * factor;
    const nyMax = world.y + (v.yMax - world.y) * factor;
    setView({ xMin: nxMin, xMax: nxMax, yMin: nyMin, yMax: nyMax });
  }

  function fmt(n: number) {
    if (Math.abs(n) >= 1000 || (Math.abs(n) > 0 && Math.abs(n) < 0.001)) return n.toExponential(2);
    return n.toFixed(3).replace(/\.?0+$/, (m) => (m.includes(".") ? m.replace(/0+$/, "").replace(/\.$/, "") : m));
  }

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Tegn op til tre udtryk i x. Understøtter + − * / ^, parenteser, sin/cos/tan/sqrt/abs/log/exp samt pi og e. Træk for at panorere, scroll for at zoome."
          : "Plot up to three expressions in x. Supports + − * / ^, parentheses, sin/cos/tan/sqrt/abs/log/exp, plus pi and e. Drag to pan, scroll to zoom."}
      </p>

      <section className="kit-tool-panel space-y-3 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={da ? "Udtryk 1" : "Expression 1"}>
            <KitInput value={expr1} onChange={(e) => setExpr1(e.target.value)} spellCheck={false} />
          </Field>
          <Field label={da ? "Udtryk 2" : "Expression 2"}>
            <KitInput value={expr2} onChange={(e) => setExpr2(e.target.value)} spellCheck={false} />
          </Field>
          <Field label={da ? "Udtryk 3" : "Expression 3"}>
            <KitInput
              value={expr3}
              onChange={(e) => setExpr3(e.target.value)}
              spellCheck={false}
              placeholder="cos(x) + x/5"
            />
          </Field>
        </div>
        {errors.length ? (
          <ErrorBanner>
            {errors.join(" · ")}
          </ErrorBanner>
        ) : null}
        <div className="kit-h-scroll">
          <button type="button" className={secondaryBtnClass} onClick={() => setView(DEFAULT_VIEW)}>
            {da ? "Nulstil view" : "Reset view"}
          </button>
          <button
            type="button"
            className={primaryBtnClass}
            onClick={() => {
              setExpr1("sin(x)");
              setExpr2("cos(x)");
              setExpr3("sin(x)+cos(x)");
            }}
          >
            {da ? "Eksempel" : "Sample"}
          </button>
        </div>
      </section>

      <section className="kit-tool-panel overflow-hidden p-0">
        <div ref={wrapRef} className="relative w-full">
          <canvas
            ref={canvasRef}
            className="block w-full cursor-crosshair touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={() => {
              onPointerUp();
              setCursor(null);
            }}
            onWheel={onWheel}
          />
        </div>
        <div className="border-t border-border px-4 py-2 text-xs text-muted">
          {cursor ? (
            <span className="font-mono">
              x={fmt(cursor.x)}
              {exprs.map((_, i) => {
                const v = cursor.vals[i];
                if (v == null && !compiled.fns[i]) return null;
                return (
                  <span key={i}>
                    {" · "}y{i + 1}={v == null ? "-" : fmt(v)}
                  </span>
                );
              })}
            </span>
          ) : (
            <span>{da ? "Hold markøren over grafen for aflæsning." : "Hover the graph for a readout."}</span>
          )}
        </div>
      </section>
    </div>
  );
}

function niceStep(span: number) {
  const raw = span / 8;
  const pow = 10 ** Math.floor(Math.log10(Math.max(raw, 1e-9)));
  const n = raw / pow;
  if (n < 1.5) return pow;
  if (n < 3.5) return 2 * pow;
  if (n < 7.5) return 5 * pow;
  return 10 * pow;
}
