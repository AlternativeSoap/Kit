"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  KitSelect,
  Segmented,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Mode = "flex" | "grid";

const FLEX_DIRS = ["row", "row-reverse", "column", "column-reverse"] as const;
const FLEX_WRAP = ["nowrap", "wrap", "wrap-reverse"] as const;
const JUSTIFY = [
  "flex-start",
  "flex-end",
  "center",
  "space-between",
  "space-around",
  "space-evenly",
] as const;
const ALIGN = [
  "stretch",
  "flex-start",
  "flex-end",
  "center",
  "baseline",
] as const;
const GRID_JUSTIFY = [
  "start",
  "end",
  "center",
  "stretch",
  "space-between",
  "space-around",
  "space-evenly",
] as const;
const GRID_ALIGN = ["start", "end", "center", "stretch"] as const;

const BOX_COLORS = ["#4a5c3f", "#c45c26", "#2f6fed", "#7a4f9a", "#b0892e", "#2a7f7e"];

export function CsslabTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<Mode>("flex");
  const [count, setCount] = useState(5);

  const [flexDir, setFlexDir] = useState<(typeof FLEX_DIRS)[number]>("row");
  const [flexWrap, setFlexWrap] = useState<(typeof FLEX_WRAP)[number]>("wrap");
  const [justify, setJustify] = useState<(typeof JUSTIFY)[number]>("flex-start");
  const [align, setAlign] = useState<(typeof ALIGN)[number]>("stretch");
  const [gap, setGap] = useState(12);

  const [cols, setCols] = useState("1fr 1fr 1fr");
  const [rows, setRows] = useState("auto auto");
  const [gridJustify, setGridJustify] = useState<(typeof GRID_JUSTIFY)[number]>("stretch");
  const [gridAlign, setGridAlign] = useState<(typeof GRID_ALIGN)[number]>("stretch");
  const [gridGap, setGridGap] = useState(12);

  const cssText = useMemo(() => {
    if (mode === "flex") {
      return [
        "display: flex;",
        `flex-direction: ${flexDir};`,
        `flex-wrap: ${flexWrap};`,
        `justify-content: ${justify};`,
        `align-items: ${align};`,
        `gap: ${gap}px;`,
      ].join("\n");
    }
    return [
      "display: grid;",
      `grid-template-columns: ${cols};`,
      `grid-template-rows: ${rows};`,
      `justify-items: ${gridJustify};`,
      `align-items: ${gridAlign};`,
      `gap: ${gridGap}px;`,
    ].join("\n");
  }, [mode, flexDir, flexWrap, justify, align, gap, cols, rows, gridJustify, gridAlign, gridGap]);

  const previewStyle: CSSProperties =
    mode === "flex"
      ? {
          display: "flex",
          flexDirection: flexDir,
          flexWrap,
          justifyContent: justify,
          alignItems: align,
          gap: `${gap}px`,
          minHeight: 220,
        }
      : {
          display: "grid",
          gridTemplateColumns: cols,
          gridTemplateRows: rows,
          justifyItems: gridJustify,
          alignItems: gridAlign,
          gap: `${gridGap}px`,
          minHeight: 220,
        };

  const boxes = Math.max(1, Math.min(12, count));

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Leg med Flexbox og CSS Grid. Ændr kontrollerne, se forhåndsvisningen, og kopiér den færdige CSS."
          : "Play with Flexbox and CSS Grid. Tweak the controls, watch the preview, and copy the finished CSS."}
      </p>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <Segmented
          ariaLabel={da ? "Layout-tilstand" : "Layout mode"}
          value={mode}
          onChange={setMode}
          options={[
            { id: "flex", label: "Flexbox" },
            { id: "grid", label: "Grid" },
          ]}
        />

        <Field label={da ? "Antal bokse" : "Box count"} hint={String(boxes)}>
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            value={boxes}
            onChange={(e) => setCount(Number(e.target.value))}
            className="kit-range w-full"
          />
        </Field>

        {mode === "flex" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="flex-direction">
              <KitSelect value={flexDir} onChange={(e) => setFlexDir(e.target.value as typeof flexDir)}>
                {FLEX_DIRS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </KitSelect>
            </Field>
            <Field label="flex-wrap">
              <KitSelect value={flexWrap} onChange={(e) => setFlexWrap(e.target.value as typeof flexWrap)}>
                {FLEX_WRAP.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </KitSelect>
            </Field>
            <Field label="justify-content">
              <KitSelect value={justify} onChange={(e) => setJustify(e.target.value as typeof justify)}>
                {JUSTIFY.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </KitSelect>
            </Field>
            <Field label="align-items">
              <KitSelect value={align} onChange={(e) => setAlign(e.target.value as typeof align)}>
                {ALIGN.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </KitSelect>
            </Field>
            <Field label="gap" hint={`${gap}px`}>
              <input
                type="range"
                min={0}
                max={48}
                step={1}
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="kit-range w-full"
              />
            </Field>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="grid-template-columns">
              <KitSelect
                value={cols}
                onChange={(e) => setCols(e.target.value)}
              >
                <option value="1fr">1fr</option>
                <option value="1fr 1fr">1fr 1fr</option>
                <option value="1fr 1fr 1fr">1fr 1fr 1fr</option>
                <option value="2fr 1fr">2fr 1fr</option>
                <option value="repeat(4, 1fr)">repeat(4, 1fr)</option>
                <option value="120px 1fr 120px">120px 1fr 120px</option>
              </KitSelect>
            </Field>
            <Field label="grid-template-rows">
              <KitSelect value={rows} onChange={(e) => setRows(e.target.value)}>
                <option value="auto">auto</option>
                <option value="auto auto">auto auto</option>
                <option value="auto auto auto">auto auto auto</option>
                <option value="80px auto">80px auto</option>
                <option value="1fr 2fr">1fr 2fr</option>
              </KitSelect>
            </Field>
            <Field label="justify-items">
              <KitSelect
                value={gridJustify}
                onChange={(e) => setGridJustify(e.target.value as typeof gridJustify)}
              >
                {GRID_JUSTIFY.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </KitSelect>
            </Field>
            <Field label="align-items">
              <KitSelect
                value={gridAlign}
                onChange={(e) => setGridAlign(e.target.value as typeof gridAlign)}
              >
                {GRID_ALIGN.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </KitSelect>
            </Field>
            <Field label="gap" hint={`${gridGap}px`}>
              <input
                type="range"
                min={0}
                max={48}
                step={1}
                value={gridGap}
                onChange={(e) => setGridGap(Number(e.target.value))}
                className="kit-range w-full"
              />
            </Field>
          </div>
        )}
      </section>

      <section className="kit-tool-panel space-y-3 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            {da ? "Forhåndsvisning" : "Preview"}
          </h2>
          <CopyButton
            value={cssText}
            label={da ? "Kopiér CSS" : "Copy CSS"}
            copiedLabel={da ? "Kopieret" : "Copied"}
          />
        </div>
        <div
          className="rounded-[12px] border border-border bg-background p-3"
          style={previewStyle}
        >
          {Array.from({ length: boxes }, (_, i) => (
            <div
              key={i}
              className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-[8px] px-3 py-2 text-sm font-semibold text-white"
              style={{
                background: BOX_COLORS[i % BOX_COLORS.length],
                width: mode === "flex" && flexDir.startsWith("row") ? 64 + (i % 3) * 18 : undefined,
                height: mode === "flex" && flexDir.startsWith("column") ? 48 + (i % 3) * 14 : undefined,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <pre className="overflow-x-auto rounded-[10px] border border-border bg-surface p-3 font-mono text-xs text-foreground">
          {cssText}
        </pre>
      </section>
    </div>
  );
}
