"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateAvance } from "./calc";

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

export function AvanceTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.avance;

  const [cost, setCost] = useState(
    prefillNumber(prefill, "cost", { min: 0 }) ?? "80",
  );
  const [sell, setSell] = useState(prefillNumber(prefill, "sell", { min: 0 }) ?? "");
  const [margin, setMargin] = useState(
    prefillNumber(prefill, "margin", { min: 0, max: 99.99 }) ?? "",
  );
  const [markup, setMarkup] = useState(
    prefillNumber(prefill, "markup", { min: 0 }) ?? "",
  );

  const result = useMemo(() => {
    const costN = parseField(cost);
    if (costN === undefined) return null;
    const sellN = parseField(sell);
    const marginN = parseField(margin);
    const markupN = parseField(markup);
    return calculateAvance({
      cost: costN,
      sell: sellN,
      marginPercent: sellN === undefined ? marginN : undefined,
      markupPercent:
        sellN === undefined && marginN === undefined ? markupN : undefined,
    });
  }, [cost, sell, margin, markup]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field label={t.cost} hint={t.costHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </Field>
        <Field label={t.sell} hint={t.sellHint}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={sell}
            onChange={(event) => setSell(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.margin} hint={t.marginHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="99.99"
              step="0.01"
              value={margin}
              onChange={(event) => setMargin(event.target.value)}
              disabled={Boolean(sell.trim())}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] disabled:opacity-50"
            />
          </Field>
          <Field label={t.markup} hint={t.markupHint}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={markup}
              onChange={(event) => setMarkup(event.target.value)}
              disabled={Boolean(sell.trim()) || Boolean(margin.trim())}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] disabled:opacity-50"
            />
          </Field>
        </div>
        <p className="text-sm text-muted">
          {t.relatedNote}{" "}
          <Link href="/t/procent" className="text-accent hover:underline">
            {t.relatedPercent}
          </Link>
          {", "}
          <Link href="/t/moms" className="text-accent hover:underline">
            {t.relatedMoms}
          </Link>
        </p>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t.profit}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatKr(result.profit, locale, 2)}
                  </p>
                </div>
                <CopyButton
                  value={formatNumber(result.profit, locale, 2)}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.margin}</dt>
                <dd className="font-medium">
                  {formatNumber(result.marginPercent, locale, 2)}%
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.markup}</dt>
                <dd className="font-medium">
                  {formatNumber(result.markupPercent, locale, 2)}%
                </dd>
              </div>
              {parseField(sell) === undefined ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{t.sell}</dt>
                  <dd className="font-medium">
                    {formatKr(result.sell, locale, 2)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}