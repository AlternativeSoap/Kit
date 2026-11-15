"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { compareUnitPrices } from "./calc";

type ProductRow = {
  id: string;
  label: string;
  price: string;
  quantity: string;
};

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

function makeRow(id: string, prefill?: ToolPrefill, prefix = ""): ProductRow {
  const labelKey = prefix ? `${prefix}label` : `label${id}`;
  const priceKey = prefix ? `${prefix}price` : `price${id}`;
  const qtyKey = prefix ? `${prefix}qty` : `qty${id}`;
  return {
    id,
    label: prefill?.[labelKey] ?? prefill?.[`label${id}`] ?? "",
    price:
      prefillNumber(prefill, priceKey, { min: 0 }) ??
      prefillNumber(prefill, `price${id}`, { min: 0 }) ??
      (id === "1" ? "24.95" : id === "2" ? "39.95" : ""),
    quantity:
      prefillNumber(prefill, qtyKey, { min: 0 }) ??
      prefillNumber(prefill, `qty${id}`, { min: 0 }) ??
      (id === "1" ? "500" : id === "2" ? "1000" : "1"),
  };
}

export function EnhedsprisTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.enhedspris;

  const [rows, setRows] = useState<ProductRow[]>(() => [
    makeRow("1", prefill),
    makeRow("2", prefill),
    makeRow("3", prefill),
  ]);

  const result = useMemo(() => {
    const items = rows
      .map((row) => {
        const price = parseField(row.price);
        const quantity = parseField(row.quantity);
        if (price === undefined || quantity === undefined) return null;
        return {
          id: row.id,
          label: row.label.trim() || `${t.product} ${row.id}`,
          price,
          quantity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
    return compareUnitPrices(items);
  }, [rows, t.product]);

  const best = result?.rows.find((row) => row.id === result.bestId);

  const updateRow = (id: string, patch: Partial<ProductRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-[12px] border border-border bg-surface p-4 space-y-3"
          >
            <Field label={t.label}>
              <input
                type="text"
                value={row.label}
                onChange={(event) =>
                  updateRow(row.id, { label: event.target.value })
                }
                placeholder={`${t.product} ${row.id}`}
                className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.price}>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={row.price}
                  onChange={(event) =>
                    updateRow(row.id, { price: event.target.value })
                  }
                  className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                />
              </Field>
              <Field label={t.quantity}>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={row.quantity}
                  onChange={(event) =>
                    updateRow(row.id, { quantity: event.target.value })
                  }
                  className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{t.best}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {best
                      ? formatKr(best.unitPrice, locale, 4)
                      : "—"}
                  </p>
                </div>
                {best ? (
                  <CopyButton
                    value={formatNumber(best.unitPrice, locale, 4)}
                    label={t.copy}
                    copiedLabel={t.copied}
                  />
                ) : null}
              </div>
            </div>
            <ul className="space-y-2 border-t border-border py-3 text-sm">
              {result.rows.map((row) => {
                const isBest = row.id === result.bestId;
                return (
                  <li
                    key={row.id}
                    className={`flex items-center justify-between gap-3 rounded-[8px] px-2 py-1.5 ${
                      isBest ? "bg-[var(--accent-soft)]" : ""
                    }`}
                  >
                    <span className="text-muted truncate">{row.label}</span>
                    <span className="font-medium whitespace-nowrap">
                      {formatKr(row.unitPrice, locale, 4)}
                      <span className="ml-2 text-xs text-muted">
                        {t.perUnit}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}