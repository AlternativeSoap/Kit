"use client";

import { useEffect, useRef, useState } from "react";
import { useDictionary } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";

const THEMES = {
  dusk: { bg: "#1e1e2e", fg: "#cdd6f4", muted: "#6c7086", accent: "#89b4fa" },
  paper: { bg: "#f6f1e7", fg: "#1c1917", muted: "#78716c", accent: "#b45309" },
  forest: { bg: "#14201a", fg: "#d8e6d4", muted: "#6b8570", accent: "#8fbc8f" },
} as const;

type ThemeId = keyof typeof THEMES;

export function CodeShotTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.codeshotTool;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState(
    () =>
      prefill?.value ??
      `function greet(name) {\n  return \`Hello, \${name}\`;\n}\n\nconsole.log(greet("Kit"));`,
  );
  const [theme, setTheme] = useState<ThemeId>("dusk");
  const [filename, setFilename] = useState("snippet");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = THEMES[theme];
    const lines = (code || " ").replace(/\t/g, "  ").split("\n");
    const padding = 36;
    const lineHeight = 22;
    const titleBar = 36;
    const font = "15px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.font = font;

    let maxWidth = 280;
    for (const line of lines) {
      maxWidth = Math.max(maxWidth, ctx.measureText(line || " ").width);
    }

    const width = Math.min(1200, Math.ceil(maxWidth + padding * 2));
    const height = Math.ceil(titleBar + padding + lines.length * lineHeight + padding);
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = theme === "paper" ? "#e7e0d4" : "#0b0d12";
    ctx.fillRect(0, 0, width, height);

    const radius = 16;
    const x = 12;
    const y0 = 12;
    const w = width - 24;
    const h = height - 24;
    ctx.beginPath();
    ctx.moveTo(x + radius, y0);
    ctx.arcTo(x + w, y0, x + w, y0 + h, radius);
    ctx.arcTo(x + w, y0 + h, x, y0 + h, radius);
    ctx.arcTo(x, y0 + h, x, y0, radius);
    ctx.arcTo(x, y0, x + w, y0, radius);
    ctx.closePath();
    ctx.fillStyle = colors.bg;
    ctx.fill();

    const dots = ["#ff5f56", "#ffbd2e", "#27c93f"];
    dots.forEach((color, i) => {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(36 + i * 18, 34, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = colors.muted;
    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText(filename || "snippet", 100, 38);

    ctx.font = font;
    ctx.fillStyle = colors.fg;
    let y = titleBar + padding;
    for (const line of lines) {
      ctx.fillText(line || " ", padding, y);
      y += lineHeight;
    }
    setReady(true);
  }, [code, filename, theme]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${(filename || "snippet").replace(/[^\w.-]+/g, "-")}.png`;
    a.click();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-muted">{t.privacy}</p>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
        <label className="block min-w-0">
          <span className="mb-1.5 block text-sm font-medium">{t.code}</span>
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            rows={12}
            spellCheck={false}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-[13px] outline-none focus:border-accent"
          />
        </label>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t.filename}</span>
            <input
              value={filename}
              onChange={(event) => setFilename(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <div>
            <span className="mb-1.5 block text-sm font-medium">{t.theme}</span>
            <div className="flex flex-col gap-2">
              {(Object.keys(THEMES) as ThemeId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme(id)}
                  className={`rounded-[10px] border px-3 py-2 text-left text-sm ${
                    theme === id
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-surface text-muted hover:text-foreground"
                  }`}
                >
                  {id === "dusk" ? t.themeDusk : id === "paper" ? t.themePaper : t.themeForest}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-auto rounded-[12px] border border-border bg-black/5 p-3">
        <canvas ref={canvasRef} className="mx-auto max-w-full" />
      </div>

      <button
        type="button"
        onClick={download}
        disabled={!ready}
        className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
      >
        {t.download}
      </button>
    </div>
  );
}
