"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { scaleAspect, simplifyAspect } from "./calc";

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

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function AspectTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.aspect;

  const [width, setWidth] = useState(
    prefillNumber(prefill, "width", { min: 0 }) ?? "1920",
  );
  const [height, setHeight] = useState(
    prefillNumber(prefill, "height", { min: 0 }) ?? "1080",
  );
  const [targetWidth, setTargetWidth] = useState(
    prefillNumber(prefill, "targetWidth", { min: 0 }) ?? "",
  );
  const [targetHeight, setTargetHeight] = useState(
    prefillNumber(prefill, "targetHeight", { min: 0 }) ?? "",
  );

  const aspect = useMemo(() => {
    const widthN = parseField(width);
    const heightN = parseField(height);
    if (widthN === undefined || heightN === undefined) return null;
    return simplifyAspect(widthN, heightN);
  }, [height, width]);

  const scaled = useMemo(() => {
    const widthN = parseField(width);
    const heightN = parseField(height);
    if (widthN === undefined || heightN === undefined) return null;
    const targetWN = parseField(targetWidth);
    const targetHN = parseField(targetHeight);
    return scaleAspect({
      width: widthN,
      height: heightN,
      targetWidth: targetWN,
      targetHeight: targetHN,
    });
  }, [height, targetHeight, targetWidth, width]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.width} hint={t.widthHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </Field>
          <Field label={t.height} hint={t.heightHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.targetWidth} hint={t.targetWidthHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={targetWidth}
              onChange={(event) => setTargetWidth(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </Field>
          <Field label={t.targetHeight} hint={t.targetHeightHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={targetHeight}
              onChange={(event) => setTargetHeight(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {aspect ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t.ratio}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {aspect.ratio}
                  </p>
                </div>
                <CopyButton
                  value={aspect.ratio}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            {scaled ? (
              <dl className="space-y-2 border-t border-border py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{t.scaledWidth}</dt>
                  <dd className="font-medium">
                    {formatNumber(scaled.width, locale, 2)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{t.scaledHeight}</dt>
                  <dd className="font-medium">
                    {formatNumber(scaled.height, locale, 2)}
                  </dd>
                </div>
              </dl>
            ) : null}
          </>
        ) : (
          <p className="py-8 text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}