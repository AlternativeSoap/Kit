"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillChoice, prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { convertUnits, UNITS, type UnitCategory } from "./calc";

const CATEGORIES = Object.keys(UNITS) as UnitCategory[];

/**
 * The conversion from the URL, or the tool's normal start. A link is used
 * only when the value and both units are valid for its category, so a broken
 * link never mixes its value with the default units.
 */
const CATEGORY_KEY = "kit:enheder-category";

function storedCategory(): UnitCategory | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CATEGORY_KEY);
    if (raw && (CATEGORIES as string[]).includes(raw)) {
      return raw as UnitCategory;
    }
  } catch {
    // ignore
  }
  return null;
}

function initialConversion(prefill: ToolPrefill | undefined) {
  const category = prefillChoice(prefill, "category", CATEGORIES);
  const value = prefillNumber(prefill, "value");
  if (category && value !== null) {
    const ids = UNITS[category].map((unit) => unit.id);
    const from = prefillChoice(prefill, "from", ids);
    const to = prefillChoice(prefill, "to", ids);
    if (from && to) return { category, value, from, to };
  }
  const remembered = storedCategory();
  if (remembered) {
    const first = UNITS[remembered][0]!;
    const second = UNITS[remembered][1] ?? first;
    return {
      category: remembered,
      value: "100",
      from: first.id,
      to: second.id,
    };
  }
  return { category: "length" as UnitCategory, value: "100", from: "cm", to: "m" };
}

export function EnhederTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.enheder;

  const [initial] = useState(() => initialConversion(prefill));
  const [category, setCategory] = useState<UnitCategory>(initial.category);
  const [value, setValue] = useState(initial.value);
  const [fromId, setFromId] = useState(initial.from);
  const [toId, setToId] = useState(initial.to);

  const selectCategory = (next: UnitCategory) => {
    setCategory(next);
    const first = UNITS[next][0]!;
    const second = UNITS[next][1] ?? first;
    setFromId(first.id);
    setToId(second.id);
    try {
      window.localStorage.setItem(CATEGORY_KEY, next);
    } catch {
      // ignore
    }
  };

  const unitLabels = t.units;

  const categories: { id: UnitCategory; label: string }[] = [
    { id: "length", label: t.length },
    { id: "weight", label: t.weight },
    { id: "volume", label: t.volume },
    { id: "data", label: t.data },
    { id: "temperature", label: t.temperature },
  ];

  const units = UNITS[category];

  const result = useMemo(() => {
    const n = Number(value.replace(",", "."));
    return convertUnits(category, n, fromId, toId);
  }, [category, value, fromId, toId]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectCategory(item.id)}
            className={`rounded-[10px] border px-3 py-2 text-sm ${
              category === item.id
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.value}</span>
        <input
          type="number"
          inputMode="decimal"
          step="any"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t.from}</span>
          <select
            value={fromId}
            onChange={(event) => setFromId(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent"
          >
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unitLabels[unit.id] ?? unit.id}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t.to}</span>
          <select
            value={toId}
            onChange={(event) => setToId(event.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent"
          >
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unitLabels[unit.id] ?? unit.id}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-5">
        {result !== null ? (
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted">{t.result}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {formatNumber(result, locale, 6)}{" "}
                <span className="text-lg font-medium text-muted">
                  {unitLabels[toId] ?? toId}
                </span>
              </p>
            </div>
            <CopyButton
              value={formatNumber(result, locale, 6)}
              label={t.copy}
              copiedLabel={t.copied}
            />
          </div>
        ) : (
          <p className="text-sm text-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}
