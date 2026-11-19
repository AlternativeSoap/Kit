"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, KitInput, Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  contrastRatio,
  formatHsl,
  formatLab,
  formatRgb,
  harmonyColors,
  normalizeHexInput,
  parseHex,
  rgbToHex,
  rgbToHsl,
  rgbToLab,
  simulateCvd,
  type CvdMode,
  type HarmonyKind,
} from "./calc";

const DEFAULT_BG = "#ffffff";
const DEFAULT_COLOR = "#4a5c3f";

export function FarvelabTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [hexDraft, setHexDraft] = useState(DEFAULT_COLOR);
  const [bgDraft, setBgDraft] = useState(DEFAULT_BG);
  const [cvd, setCvd] = useState<CvdMode>("none");
  const [harmony, setHarmony] = useState<HarmonyKind>("complementary");

  const color = useMemo(() => {
    const parsed = parseHex(normalizeHexInput(hexDraft));
    return parsed ?? parseHex(DEFAULT_COLOR)!;
  }, [hexDraft]);

  const validHex = parseHex(normalizeHexInput(hexDraft)) != null;
  const hex = rgbToHex(color);
  const hsl = rgbToHsl(color);
  const lab = rgbToLab(color);
  const simulated = simulateCvd(color, cvd);
  const simHex = rgbToHex(simulated);

  const bgParsed = parseHex(normalizeHexInput(bgDraft));
  const bgHex = bgParsed ? rgbToHex(bgParsed) : DEFAULT_BG;
  const contrast = contrastRatio(hex, bgHex);
  const swatches = harmonyColors(hex, harmony);

  const levels = contrast
    ? [
        { label: da ? "AA normal" : "AA normal", pass: contrast.aaNormal },
        { label: da ? "AA stor" : "AA large", pass: contrast.aaLarge },
        { label: da ? "AAA normal" : "AAA normal", pass: contrast.aaaNormal },
        { label: da ? "AAA stor" : "AAA large", pass: contrast.aaaLarge },
      ]
    : [];

  function applyHex(next: string) {
    setHexDraft(normalizeHexInput(next) || next);
  }

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Undersøg en farve med konverteringer, WCAG-kontrast, farveblindhed og harmonier. Fokus er inspektion, ikke paletbygning."
          : "Inspect a color with conversions, WCAG contrast, colorblind simulation, and harmonies. Built for science, not palette building."}
      </p>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
          <Field label={da ? "Farve" : "Color"}>
            <input
              type="color"
              value={validHex ? hex : DEFAULT_COLOR}
              onChange={(e) => applyHex(e.target.value)}
              className="h-11 w-14 cursor-pointer rounded-[10px] border border-border bg-surface p-1"
              aria-label={da ? "Farvevælger" : "Color picker"}
            />
          </Field>
          <Field
            label="HEX"
            hint={
              !validHex
                ? da
                  ? "Ugyldig hex. Viser sidste gyldige farve."
                  : "Invalid hex. Showing the last valid color."
                : undefined
            }
          >
            <KitInput
              value={hexDraft}
              onChange={(e) => setHexDraft(e.target.value)}
              onBlur={() => {
                const n = normalizeHexInput(hexDraft);
                if (parseHex(n)) setHexDraft(n.toLowerCase());
              }}
              spellCheck={false}
              className="kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </Field>
        </div>

        <div
          className="h-24 rounded-[12px] border border-border"
          style={{ backgroundColor: hex }}
          aria-hidden
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["HEX", hex],
              ["RGB", formatRgb(color)],
              ["HSL", formatHsl(hsl)],
              ["LAB", formatLab(lab)],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex items-start justify-between gap-2 rounded-[10px] border border-border bg-background/50 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted">{label}</p>
                <p className="mt-0.5 truncate font-mono text-sm text-foreground">
                  {value}
                </p>
              </div>
              <CopyButton
                value={label === "HEX" ? hex : value}
                label={da ? "Kopiér" : "Copy"}
                copiedLabel={da ? "Kopieret" : "Copied"}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <h2 className="text-sm font-medium text-foreground">
          {da ? "WCAG-kontrast" : "WCAG contrast"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={da ? "Tekstfarve" : "Text color"}>
            <div className="flex gap-2">
              <span
                className="h-11 w-11 shrink-0 rounded-[10px] border border-border"
                style={{ backgroundColor: hex }}
                aria-hidden
              />
              <KitInput
                value={hex}
                readOnly
                className="kit-field min-w-0 flex-1 rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-sm outline-none"
              />
            </div>
          </Field>
          <Field label={da ? "Baggrund" : "Background"}>
            <div className="flex gap-2">
              <input
                type="color"
                value={bgParsed ? bgHex : DEFAULT_BG}
                onChange={(e) => setBgDraft(e.target.value)}
                className="h-11 w-11 shrink-0 cursor-pointer rounded-[10px] border border-border bg-surface p-1"
                aria-label={da ? "Baggrund" : "Background"}
              />
              <KitInput
                value={bgDraft}
                onChange={(e) => setBgDraft(e.target.value)}
                spellCheck={false}
                className="kit-field min-w-0 flex-1 rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
              />
            </div>
          </Field>
        </div>

        <div
          className="rounded-[12px] border border-border px-4 py-6 text-center"
          style={{ color: hex, backgroundColor: bgHex }}
        >
          <p className="text-base font-medium">
            {da ? "Eksempeltekst Aa" : "Sample text Aa"}
          </p>
          <p className="mt-1 text-sm opacity-90">
            {da
              ? "Stor tekst til AA/AAA-tjek"
              : "Large text for AA/AAA checks"}
          </p>
        </div>

        {contrast ? (
          <div className="space-y-2">
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {contrast.ratio.toFixed(2)}:1
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {levels.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between rounded-[10px] border border-border px-3 py-2 text-sm"
                >
                  <span className="text-muted">{row.label}</span>
                  <span className="font-medium text-foreground">
                    {row.pass ? (da ? "Bestået" : "Pass") : da ? "Fejlet" : "Fail"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted">
            {da ? "Angiv en gyldig baggrundsfarve." : "Enter a valid background color."}
          </p>
        )}
      </section>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <h2 className="text-sm font-medium text-foreground">
          {da ? "Farveblindhed" : "Colorblind simulation"}
        </h2>
        <Segmented
          value={cvd}
          onChange={setCvd}
          ariaLabel={da ? "Simulering" : "Simulation"}
          options={[
            { id: "none", label: da ? "Ingen" : "None" },
            { id: "protanopia", label: "Protanopia" },
            { id: "deuteranopia", label: "Deuteranopia" },
            { id: "tritanopia", label: "Tritanopia" },
          ]}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-xs text-muted">{da ? "Original" : "Original"}</p>
            <div
              className="h-16 rounded-[10px] border border-border"
              style={{ backgroundColor: hex }}
            />
            <p className="mt-1 font-mono text-xs text-muted">{hex}</p>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted">
              {cvd === "none"
                ? da
                  ? "Simuleret (samme)"
                  : "Simulated (same)"
                : da
                  ? "Simuleret"
                  : "Simulated"}
            </p>
            <div
              className="h-16 rounded-[10px] border border-border"
              style={{ backgroundColor: simHex }}
            />
            <p className="mt-1 font-mono text-xs text-muted">{simHex}</p>
          </div>
        </div>
        <p className="text-xs text-muted">
          {da
            ? "Matrix-approksimation. Brugbart til hurtig inspektion, ikke klinisk diagnose."
            : "Matrix approximation. Useful for quick inspection, not clinical diagnosis."}
        </p>
      </section>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <h2 className="text-sm font-medium text-foreground">
          {da ? "Harmonier" : "Harmonies"}
        </h2>
        <Segmented
          value={harmony}
          onChange={setHarmony}
          ariaLabel={da ? "Harmoni" : "Harmony"}
          options={[
            { id: "complementary", label: da ? "Komplementær" : "Complementary" },
            { id: "analogous", label: da ? "Analog" : "Analogous" },
            { id: "split", label: "Split" },
            { id: "triadic", label: da ? "Triadisk" : "Triadic" },
          ]}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {swatches.map((swatch, i) => (
            <button
              key={`${swatch}-${i}`}
              type="button"
              onClick={() => applyHex(swatch)}
              className="overflow-hidden rounded-[12px] border border-border text-left transition-[transform] duration-150 active:scale-[0.98]"
            >
              <div className="h-14" style={{ backgroundColor: swatch }} />
              <div className="space-y-1 p-2.5">
                <p className="text-xs text-muted">
                  {i === 0
                    ? da
                      ? "Base"
                      : "Base"
                    : da
                      ? `Tone ${i + 1}`
                      : `Tone ${i + 1}`}
                </p>
                <p className="font-mono text-sm text-foreground">{swatch}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">
          {da
            ? "Tryk på en swatch for at gøre den til aktiv farve. LAB og kontrast opdateres med det samme."
            : "Tap a swatch to make it the active color. LAB and contrast update right away."}
        </p>
      </section>
    </div>
  );
}
