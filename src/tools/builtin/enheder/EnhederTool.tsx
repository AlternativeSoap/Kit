"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  KitSelect,
  Segmented,
  fieldClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatCompact, formatPrecise } from "@/lib/format";
import { prefillChoice, prefillNumber, type ToolPrefill } from "@/tools/prefill";
import {
  convertToAll,
  convertUnits,
  UNITS,
  type UnitCategory,
} from "./calc";

const CATEGORIES = Object.keys(UNITS) as UnitCategory[];

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

/**
 * The conversion from the URL, or the tool's normal start. A link is used
 * only when the value and both units are valid for its category, so a broken
 * link never mixes its value with the default units.
 */
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

export function EnhederTool({
  prefill,
  forcedCategory,
}: {
  prefill?: ToolPrefill;
  forcedCategory?: UnitCategory;
}) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.enheder;

  const [initial] = useState(() => {
    if (forcedCategory) {
      const first = UNITS[forcedCategory][0]!;
      const second = UNITS[forcedCategory][1] ?? first;
      return { category: forcedCategory, value: "1", from: first.id, to: second.id };
    }
    return initialConversion(prefill);
  });
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
  const unitLabel = (id: string) => unitLabels[id] ?? id;

  const categories: { id: UnitCategory; label: string }[] = [
    { id: "length", label: t.length },
    { id: "weight", label: t.weight },
    { id: "volume", label: t.volume },
    { id: "temperature", label: t.temperature },
    { id: "area", label: t.area },
    { id: "speed", label: t.speed },
    { id: "cooking", label: t.cooking },
    { id: "data", label: t.data },
  ];

  const units = UNITS[category];

  const parsed = useMemo(() => {
    if (!value.trim()) return null;
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }, [value]);

  const result = useMemo(
    () => (parsed === null ? null : convertUnits(category, parsed, fromId, toId)),
    [category, parsed, fromId, toId],
  );

  const allUnits = useMemo(
    () => (parsed === null ? [] : convertToAll(category, parsed, fromId)),
    [category, parsed, fromId],
  );

  const swapUnits = () => {
    setFromId(toId);
    setToId(fromId);
  };

  const unitOptions = units.map((unit) => (
    <option key={unit.id} value={unit.id}>
      {unitLabel(unit.id)}
    </option>
  ));

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {!forcedCategory && (
        <>
          <div className="sm:hidden">
            <Field label={t.category}>
              <KitSelect
                value={category}
                onChange={(event) =>
                  selectCategory(event.target.value as UnitCategory)
                }
              >
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </KitSelect>
            </Field>
          </div>
          <div className="hidden sm:block">
            <Segmented
              value={category}
              options={categories}
              onChange={selectCategory}
              ariaLabel={t.category}
            />
          </div>
        </>
      )}

      <Field label={t.value}>
        <input
          type="number"
          inputMode="decimal"
          step="any"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={fieldClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
        <Field label={t.from}>
          <KitSelect
            value={fromId}
            onChange={(event) => setFromId(event.target.value)}
          >
            {unitOptions}
          </KitSelect>
        </Field>
        <button
          type="button"
          onClick={swapUnits}
          aria-label={t.swap}
          title={t.swap}
          className={`${secondaryBtnClass} justify-self-start sm:justify-self-auto`}
        >
          <span aria-hidden className="mr-1.5 sm:mr-0">
            ⇄
          </span>
          <span className="sm:sr-only">{t.swap}</span>
        </button>
        <Field label={t.to}>
          <KitSelect value={toId} onChange={(event) => setToId(event.target.value)}>
            {unitOptions}
          </KitSelect>
        </Field>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-5">
        {result !== null ? (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted">{t.result}</p>
              <p
                className="mt-1 break-words text-3xl font-semibold tracking-tight"
                aria-live="polite"
              >
                {formatPrecise(result, locale)}{" "}
                <span className="text-lg font-medium text-muted">
                  {unitLabel(toId)}
                </span>
              </p>
            </div>
            <CopyButton
              value={formatPrecise(result, locale)}
              label={t.copy}
              copiedLabel={t.copied}
            />
          </div>
        ) : (
          <p className="text-sm text-muted">{t.empty}</p>
        )}
      </div>

      {allUnits.length > 0 ? (
        <section aria-label={t.allUnits}>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.06em] text-muted">
            {t.allUnits}
          </h2>
          <ul className="grid gap-x-4 sm:grid-cols-2">
            {allUnits.map((row) => {
              const active = row.id === toId;
              return (
                <li key={row.id} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setToId(row.id)}
                    title={t.useAsTarget}
                    aria-pressed={active}
                    className={`flex w-full items-baseline justify-between gap-3 py-1.5 text-left text-sm ${
                      active ? "font-medium text-foreground" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <span className="min-w-0 truncate">{unitLabel(row.id)}</span>
                    <span className="shrink-0 tabular-nums text-foreground">
                      {formatCompact(row.value, locale)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
