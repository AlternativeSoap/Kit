"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { colorFromHex, colorFromHsl, colorFromRgb, formatColorValues } from "./calc";

function applyAnswer(
  setHex: (v: string) => void,
  setR: (v: string) => void,
  setG: (v: string) => void,
  setB: (v: string) => void,
  setH: (v: string) => void,
  setS: (v: string) => void,
  setL: (v: string) => void,
  hexValue: string,
) {
  const parsed = colorFromHex(hexValue);
  if (!parsed) return;
  setHex(parsed.hex);
  setR(String(parsed.rgb.r));
  setG(String(parsed.rgb.g));
  setB(String(parsed.rgb.b));
  setH(String(parsed.hsl.h));
  setS(String(parsed.hsl.s));
  setL(String(parsed.hsl.l));
}

export function ColorTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.color;

  const initialHex = prefill?.hex?.trim() ? (prefill.hex.startsWith("#") ? prefill.hex : `#${prefill.hex}`) : "#4a5c3f";
  const initial = colorFromHex(initialHex);

  const [hex, setHex] = useState(initial?.hex ?? initialHex);
  const [r, setR] = useState(String(initial?.rgb.r ?? 74));
  const [g, setG] = useState(String(initial?.rgb.g ?? 92));
  const [b, setB] = useState(String(initial?.rgb.b ?? 63));
  const [h, setH] = useState(String(initial?.hsl.h ?? 88.6));
  const [s, setS] = useState(String(initial?.hsl.s ?? 18.7));
  const [l, setL] = useState(String(initial?.hsl.l ?? 30.4));

  const answer = useMemo(() => {
    const fromHex = colorFromHex(hex);
    if (fromHex) return fromHex;
    const rgb = colorFromRgb(Number(r), Number(g), Number(b));
    if (rgb) return rgb;
    return colorFromHsl(Number(h), Number(s), Number(l));
  }, [hex, r, g, b, h, s, l]);

  const formats = answer ? formatColorValues(answer) : null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div
        className="h-24 w-full rounded-[12px] border border-border"
        style={{ backgroundColor: formats?.hex ?? "transparent" }}
        aria-hidden
      />

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.hex}</span>
        <input
          type="text"
          value={hex}
          onChange={(event) => {
            const next = event.target.value;
            setHex(next);
            applyAnswer(setHex, setR, setG, setB, setH, setS, setL, next.startsWith("#") ? next : `#${next}`);
          }}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["r", r, setR],
            ["g", g, setG],
            ["b", b, setB],
          ] as const
        ).map(([key, val, setter]) => (
          <label key={key} className="block">
            <span className="mb-1.5 block text-sm font-medium">
              {t.rgbLabel.replace("{c}", key.toUpperCase())}
            </span>
            <input
              type="number"
              min={0}
              max={255}
              value={val}
              onChange={(event) => {
                const nextR = key === "r" ? event.target.value : r;
                const nextG = key === "g" ? event.target.value : g;
                const nextB = key === "b" ? event.target.value : b;
                setter(event.target.value);
                const parsed = colorFromRgb(Number(nextR), Number(nextG), Number(nextB));
                if (parsed) applyAnswer(setHex, setR, setG, setB, setH, setS, setL, parsed.hex);
              }}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent"
            />
          </label>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["h", h, setH, 360],
            ["s", s, setS, 100],
            ["l", l, setL, 100],
          ] as const
        ).map(([key, val, setter, max]) => (
          <label key={key} className="block">
            <span className="mb-1.5 block text-sm font-medium">
              {t.hslLabel.replace("{c}", key.toUpperCase())}
            </span>
            <input
              type="number"
              min={0}
              max={max}
              step="0.1"
              value={val}
              onChange={(event) => {
                const nextH = key === "h" ? event.target.value : h;
                const nextS = key === "s" ? event.target.value : s;
                const nextL = key === "l" ? event.target.value : l;
                setter(event.target.value);
                const parsed = colorFromHsl(Number(nextH), Number(nextS), Number(nextL));
                if (parsed) applyAnswer(setHex, setR, setG, setB, setH, setS, setL, parsed.hex);
              }}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent"
            />
          </label>
        ))}
      </div>

      {formats ? (
        <div className="space-y-3 rounded-[12px] border border-border bg-surface px-4 py-4">
          {(
            [
              ["HEX", formats.hex],
              ["RGB", formats.rgb],
              ["HSL", formats.hsl],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted">{label}</p>
                <p className="font-mono text-sm">{value}</p>
              </div>
              <CopyButton value={value} label={t.copy} copiedLabel={t.copied} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">{t.empty}</p>
      )}
    </div>
  );
}