"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { FontFamilyInput } from "@/components/tools/FontFamilyInput";
import { Field,
  KitInput,
  Segmented,
  secondaryBtnClass, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Align = "left" | "center" | "right" | "justify";

const DEFAULT_TEXT_DA =
  "Den hurtige brune ræv springer over den dovne hund. Typografi handler om læsbarhed, rytme og kontrast.";
const DEFAULT_TEXT_EN =
  "The quick brown fox jumps over the lazy dog. Typography is about readability, rhythm, and contrast.";

function parseHex(hex: string): [number, number, number] | null {
  const raw = hex.trim().replace(/^#/, "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb: [number, number, number]): number {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

function contrastRatio(fg: string, bg: string): number | null {
  const a = parseHex(fg);
  const b = parseHex(bg);
  if (!a || !b) return null;
  const l1 = luminance(a);
  const l2 = luminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function normalizeHex(value: string): string {
  const t = value.trim();
  if (!t) return "";
  return t.startsWith("#") ? t : `#${t}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function TypografiTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [text, setText] = useState(da ? DEFAULT_TEXT_DA : DEFAULT_TEXT_EN);
  const [fontFamily, setFontFamily] = useState(
    "Georgia, 'Times New Roman', serif",
  );
  const [size, setSize] = useState(22);
  const [weight, setWeight] = useState(400);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [align, setAlign] = useState<Align>("left");
  const [fg, setFg] = useState("#1a1a1a");
  const [bg, setBg] = useState("#ffffff");

  const fgHex = normalizeHex(fg);
  const bgHex = normalizeHex(bg);
  const fgOk = parseHex(fgHex) != null;
  const bgOk = parseHex(bgHex) != null;
  const ratio = useMemo(
    () => (fgOk && bgOk ? contrastRatio(fgHex, bgHex) : null),
    [fgHex, bgHex, fgOk, bgOk],
  );

  const sizePx = clamp(Math.round(size) || 16, 10, 96);
  const weightN = clamp(Math.round(weight) || 400, 100, 900);
  const lh = clamp(Number(lineHeight) || 1.5, 0.8, 3);
  const tracking = clamp(Number(letterSpacing) || 0, -0.1, 0.5);

  const cssSnippet = `font-family: ${fontFamily};
font-size: ${sizePx}px;
font-weight: ${weightN};
line-height: ${lh};
letter-spacing: ${tracking}em;
text-align: ${align};
color: ${fgOk ? fgHex : "#1a1a1a"};
background-color: ${bgOk ? bgHex : "#ffffff"};`;

  const aaNormal = ratio != null && ratio >= 4.5;
  const aaaNormal = ratio != null && ratio >= 7;
  const aaLarge = ratio != null && ratio >= 3;

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Live typografi-prøve med skrifttype, størrelse, vægt og kontrast. Kopiér CSS når du er tilfreds."
          : "Live typography specimen with font, size, weight, and contrast. Copy the CSS when it looks right."}
      </p>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <Field label={da ? "Prøvetekst" : "Specimen text"}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className={`${fieldClass} resize-y`}
          />
        </Field>

        <Field label={da ? "Skrifttype" : "Font family"}>
          <FontFamilyInput
            value={fontFamily}
            onChange={setFontFamily}
            title={da ? "Skrifttype" : "Font family"}
            placeholder={da ? "Søg skrifttype…" : "Search fonts…"}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={da ? `Størrelse (${sizePx}px)` : `Size (${sizePx}px)`}>
            <input
              type="range"
              min={10}
              max={72}
              value={sizePx}
              onChange={(e) => setSize(Number(e.target.value))}
              className="kit-range"
              aria-label={da ? "Skriftstørrelse" : "Font size"}
            />
          </Field>
          <Field label={da ? `Vægt (${weightN})` : `Weight (${weightN})`}>
            <input
              type="range"
              min={100}
              max={900}
              step={100}
              value={weightN}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="kit-range"
              aria-label={da ? "Skriftvægt" : "Font weight"}
            />
          </Field>
          <Field
            label={da ? `Linjehøjde (${lh.toFixed(2)})` : `Line height (${lh.toFixed(2)})`}
          >
            <input
              type="range"
              min={80}
              max={300}
              value={Math.round(lh * 100)}
              onChange={(e) => setLineHeight(Number(e.target.value) / 100)}
              className="kit-range"
              aria-label={da ? "Linjehøjde" : "Line height"}
            />
          </Field>
          <Field
            label={
              da
                ? `Bogstavafstand (${tracking.toFixed(2)}em)`
                : `Letter spacing (${tracking.toFixed(2)}em)`
            }
          >
            <input
              type="range"
              min={-10}
              max={50}
              value={Math.round(tracking * 100)}
              onChange={(e) => setLetterSpacing(Number(e.target.value) / 100)}
              className="kit-range"
              aria-label={da ? "Bogstavafstand" : "Letter spacing"}
            />
          </Field>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Justering" : "Alignment"}
          </p>
          <Segmented
            value={align}
            onChange={setAlign}
            ariaLabel={da ? "Justering" : "Alignment"}
            options={[
              { id: "left", label: da ? "Venstre" : "Left" },
              { id: "center", label: da ? "Midt" : "Center" },
              { id: "right", label: da ? "Højre" : "Right" },
              { id: "justify", label: da ? "Lige" : "Justify" },
            ]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={da ? "Tekstfarve" : "Text color"}>
            <div className="flex gap-2">
              <input
                type="color"
                value={fgOk ? fgHex : "#1a1a1a"}
                onChange={(e) => setFg(e.target.value)}
                className="h-11 w-11 shrink-0 cursor-pointer rounded-[10px] border border-border bg-surface p-1"
                aria-label={da ? "Tekstfarve" : "Text color"}
              />
              <KitInput
                value={fg}
                onChange={(e) => setFg(e.target.value)}
                spellCheck={false}
                className={`${fieldClass} min-w-0 flex-1 font-mono`}
              />
            </div>
          </Field>
          <Field label={da ? "Baggrund" : "Background"}>
            <div className="flex gap-2">
              <input
                type="color"
                value={bgOk ? bgHex : "#ffffff"}
                onChange={(e) => setBg(e.target.value)}
                className="h-11 w-11 shrink-0 cursor-pointer rounded-[10px] border border-border bg-surface p-1"
                aria-label={da ? "Baggrund" : "Background"}
              />
              <KitInput
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                spellCheck={false}
                className={`${fieldClass} min-w-0 flex-1 font-mono`}
              />
            </div>
          </Field>
        </div>

        <div className="kit-h-scroll">
          {[400, 500, 600, 700].map((w) => (
            <button
              key={w}
              type="button"
              className={secondaryBtnClass}
              onClick={() => setWeight(w)}
            >
              {w}
            </button>
          ))}
          {[16, 20, 28, 36].map((s) => (
            <button
              key={s}
              type="button"
              className={secondaryBtnClass}
              onClick={() => setSize(s)}
            >
              {s}px
            </button>
          ))}
        </div>
      </section>

      <section
        className="kit-tool-panel kit-tool-hero overflow-hidden p-5 sm:p-8"
        style={{
          backgroundColor: bgOk ? bgHex : "#ffffff",
          color: fgOk ? fgHex : "#1a1a1a",
        }}
      >
        <p
          className="w-full break-words"
          style={{
            fontFamily,
            fontSize: `${sizePx}px`,
            fontWeight: weightN,
            lineHeight: lh,
            letterSpacing: `${tracking}em`,
            textAlign: align,
          }}
        >
          {text || (da ? "Skriv noget tekst…" : "Type some text…")}
        </p>
      </section>

      <section className="kit-tool-panel space-y-3 p-4 sm:p-5">
        <h2 className="text-sm font-medium text-foreground">
          {da ? "Kontrast" : "Contrast"}
        </h2>
        {ratio != null ? (
          <>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {ratio.toFixed(2)}:1
            </p>
            <ul className="grid gap-2 sm:grid-cols-3">
              {(
                [
                  [da ? "AA normal" : "AA normal", aaNormal],
                  [da ? "AA stor" : "AA large", aaLarge],
                  [da ? "AAA normal" : "AAA normal", aaaNormal],
                ] as const
              ).map(([label, pass]) => (
                <li
                  key={label}
                  className="flex items-center justify-between rounded-[10px] border border-border px-3 py-2 text-sm"
                >
                  <span className="text-muted">{label}</span>
                  <span className="font-medium">
                    {pass ? (da ? "Bestået" : "Pass") : da ? "Fejlet" : "Fail"}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-muted">
            {da
              ? "Angiv gyldige hex-farver for tekst og baggrund."
              : "Enter valid hex colors for text and background."}
          </p>
        )}
      </section>

      <section className="kit-tool-panel space-y-3 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-foreground">CSS</h2>
          <CopyButton
            value={cssSnippet}
            label={da ? "Kopiér" : "Copy"}
            copiedLabel={da ? "Kopieret" : "Copied"}
          />
        </div>
        <pre className="overflow-auto rounded-[10px] border border-border bg-background/60 p-3 font-mono text-[13px] text-foreground">
          {cssSnippet}
        </pre>
      </section>
    </div>
  );
}
