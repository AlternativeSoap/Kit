"use client";

import { useMemo, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { type ToolPrefill } from "@/tools/prefill";
import { contrastRatio } from "./calc";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function normalizeHexInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function swatchColor(hex: string): string | undefined {
  const normalized = normalizeHexInput(hex);
  const raw = normalized.replace(/^#/, "");
  if (raw.length === 3 && /^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw}`;
  }
  return undefined;
}

type ContrastLevelRow = {
  label: string;
  pass: boolean;
};

export function ContrastTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.contrast;

  const [foreground, setForeground] = useState(
    () => normalizeHexInput(prefill?.fg ?? prefill?.foreground ?? "#111827"),
  );
  const [background, setBackground] = useState(
    () => normalizeHexInput(prefill?.bg ?? prefill?.background ?? "#ffffff"),
  );

  const result = useMemo(
    () => contrastRatio(foreground, background),
    [background, foreground],
  );

  const levels: ContrastLevelRow[] = result
    ? [
        { label: t.aaNormal, pass: result.aaNormal },
        { label: t.aaLarge, pass: result.aaLarge },
        { label: t.aaaNormal, pass: result.aaaNormal },
        { label: t.aaaLarge, pass: result.aaaLarge },
      ]
    : [];

  const fgSwatch = swatchColor(foreground);
  const bgSwatch = swatchColor(background);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field label={t.foreground} hint={t.foregroundHint}>
          <div className="flex gap-2">
            <span
              className="h-11 w-11 shrink-0 rounded-[10px] border border-border"
              style={{ backgroundColor: fgSwatch ?? "transparent" }}
              aria-hidden
            />
            <input
              type="text"
              value={foreground}
              onChange={(event) => setForeground(event.target.value)}
              spellCheck={false}
              className={`${fieldClass} min-w-0 flex-1 font-mono`}
            />
          </div>
        </Field>
        <Field label={t.background} hint={t.backgroundHint}>
          <div className="flex gap-2">
            <span
              className="h-11 w-11 shrink-0 rounded-[10px] border border-border"
              style={{ backgroundColor: bgSwatch ?? "transparent" }}
              aria-hidden
            />
            <input
              type="text"
              value={background}
              onChange={(event) => setBackground(event.target.value)}
              spellCheck={false}
              className={`${fieldClass} min-w-0 flex-1 font-mono`}
            />
          </div>
        </Field>
        <div
          className="rounded-[12px] border border-border px-4 py-6 text-center text-lg font-medium"
          style={{
            color: fgSwatch ?? "inherit",
            backgroundColor: bgSwatch ?? "transparent",
          }}
        >
          {t.preview}
        </div>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t.ratio}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatNumber(result.ratio, locale, 2)}:1
                  </p>
                </div>
                <CopyButton
                  value={formatNumber(result.ratio, locale, 2)}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <ul className="space-y-2 border-t border-border py-3 text-sm">
              {levels.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-muted">{row.label}</span>
                  <span
                    className={`font-medium ${
                      row.pass ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {row.pass ? t.pass : t.fail}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}