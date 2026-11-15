"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { buildPalette, type PaletteMode } from "./calc";

const MODES: PaletteMode[] = [
  "analogous",
  "complementary",
  "triadic",
  "tetradic",
  "mono",
  "shades",
];

export function PaletteTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const { locale } = useLanguage();
  const t = dictionary.paletteTool;
  const da = locale === "da";

  const [hex, setHex] = useState(() => {
    const raw = prefill?.hex?.trim() || prefill?.value?.trim() || "#4a5c3f";
    return raw.startsWith("#") ? raw : `#${raw}`;
  });
  const [mode, setMode] = useState<PaletteMode>("analogous");

  const palette = useMemo(() => buildPalette(hex, mode), [hex, mode]);
  const cssVars = palette
    ?.map((s, i) => `  --color-${i + 1}: ${s.hex};`)
    .join("\n");

  const modeLabel: Record<PaletteMode, string> = {
    analogous: t.modeAnalogous,
    complementary: t.modeComplementary,
    triadic: t.modeTriadic,
    tetradic: t.modeTetradic,
    mono: t.modeMono,
    shades: t.modeShades,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-sm text-muted">{t.privacy}</p>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="block min-w-0">
          <span className="mb-1.5 block text-sm font-medium">{t.seed}</span>
          <div className="flex gap-2">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#4a5c3f"}
              onChange={(event) => setHex(event.target.value)}
              className="h-11 w-14 cursor-pointer rounded-[10px] border border-border bg-surface p-1"
              aria-label={t.seed}
            />
            <input
              type="text"
              value={hex}
              onChange={(event) => setHex(event.target.value)}
              spellCheck={false}
              className="min-w-0 flex-1 rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-sm outline-none focus:border-accent"
            />
          </div>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {MODES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-[10px] border px-3 py-2 text-sm ${
              mode === item
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {modeLabel[item]}
          </button>
        ))}
      </div>

      {!palette ? (
        <p className="text-sm text-muted">{t.invalid}</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-5">
            {palette.map((swatch) => (
              <div
                key={`${swatch.hex}-${swatch.labelEn}`}
                className="overflow-hidden rounded-[12px] border border-border bg-surface"
              >
                <div className="h-20" style={{ backgroundColor: swatch.hex }} />
                <div className="space-y-1 p-2.5">
                  <p className="text-xs text-muted">
                    {da ? swatch.labelDa : swatch.labelEn}
                  </p>
                  <p className="font-mono text-sm text-foreground">{swatch.hex}</p>
                  <CopyButton
                    value={swatch.hex}
                    label={t.copy}
                    copiedLabel={t.copied}
                  />
                </div>
              </div>
            ))}
          </div>

          {cssVars ? (
            <label className="block">
              <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
                <span>{t.cssVars}</span>
                <CopyButton
                  value={`:root {\n${cssVars}\n}`}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </span>
              <pre className="overflow-auto rounded-[10px] border border-border bg-surface p-3 font-mono text-[13px] text-foreground">
                {`:root {\n${cssVars}\n}`}
              </pre>
            </label>
          ) : null}
        </>
      )}
    </div>
  );
}
