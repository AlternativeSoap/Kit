"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  fieldClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber, formatPercent } from "@/lib/format";
import { calculateBudget, defaultCategories } from "./calc";

type ExpenseRow = {
  id: string;
  name: string;
  amount: string;
};

let nextId = 1;
function uid() {
  nextId += 1;
  return `exp-${nextId}`;
}

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function BudgetTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [salary, setSalary] = useState("32000");
  const [other, setOther] = useState("0");
  const [expenses, setExpenses] = useState<ExpenseRow[]>(() =>
    defaultCategories(da).map((c) => ({ id: uid(), ...c })),
  );

  const result = useMemo(() => {
    const salaryN = parseField(salary);
    const otherN = parseField(other);
    if (salaryN === undefined || otherN === undefined) return null;
    const parsed = expenses.map((e) => {
      const amount = parseField(e.amount);
      if (amount === undefined) return null;
      return { id: e.id, name: e.name.trim() || (da ? "Uden navn" : "Untitled"), amount };
    });
    if (parsed.some((e) => e === null)) return null;
    return calculateBudget(
      { salary: salaryN, other: otherN },
      parsed as Array<{ id: string; name: string; amount: number }>,
    );
  }, [salary, other, expenses, da]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";

  const addExpense = () => {
    setExpenses((prev) => [
      ...prev,
      { id: uid(), name: da ? "Ny post" : "New item", amount: "0" },
    ]);
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => (prev.length <= 1 ? prev : prev.filter((e) => e.id !== id)));
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <p className="text-sm text-muted">
          {da
            ? "Månedligt budget. Intet gemmes. Alt forbliver i browseren."
            : "Monthly budget. Nothing is saved. Everything stays in the browser."}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={da ? "Løn" : "Salary"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={da ? "Anden indkomst" : "Other income"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={other}
              onChange={(e) => setOther(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-foreground">
              {da ? "Udgifter" : "Expenses"}
            </h2>
            <button
              type="button"
              className={secondaryBtnClass}
              onClick={addExpense}
            >
              {da ? "Tilføj kategori" : "Add category"}
            </button>
          </div>
          {expenses.map((row) => (
            <div
              key={row.id}
              className="grid gap-3 sm:grid-cols-[1fr_140px_auto]"
            >
              <Field label={da ? "Kategori" : "Category"}>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) =>
                    setExpenses((prev) =>
                      prev.map((item) =>
                        item.id === row.id
                          ? { ...item, name: e.target.value }
                          : item,
                      ),
                    )
                  }
                  className={fieldClass}
                />
              </Field>
              <Field label={da ? "Beløb" : "Amount"}>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="50"
                  value={row.amount}
                  onChange={(e) =>
                    setExpenses((prev) =>
                      prev.map((item) =>
                        item.id === row.id
                          ? { ...item, amount: e.target.value }
                          : item,
                      ),
                    )
                  }
                  className={fieldClass}
                />
              </Field>
              <div className="flex items-end">
                <button
                  type="button"
                  className={secondaryBtnClass}
                  onClick={() => removeExpense(row.id)}
                  disabled={expenses.length <= 1}
                >
                  {da ? "Fjern" : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">
                    {da ? "Tilbage" : "Remaining"}
                  </p>
                  <p
                    className={`mt-1 text-2xl font-semibold tracking-tight ${
                      result.remaining < 0 ? "text-rose-600 dark:text-rose-400" : ""
                    }`}
                  >
                    {formatKr(result.remaining, locale, 0)}
                  </p>
                </div>
                <CopyButton
                  value={formatNumber(result.remaining, locale, 2)}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>

            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Indkomst" : "Income"}
                </dt>
                <dd className="font-medium">
                  {formatKr(result.incomeTotal, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Udgifter" : "Expenses"}
                </dt>
                <dd className="font-medium">
                  {formatKr(result.expenseTotal, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Brugt af indkomst" : "Used of income"}
                </dt>
                <dd className="font-medium">
                  {formatPercent(result.percentUsed, locale, 1)}
                </dd>
              </div>
            </dl>

            <div className="space-y-3 border-t border-border py-4">
              <p className="text-xs text-muted">
                {da ? "Fordeling af udgifter" : "Expense breakdown"}
              </p>
              {result.breakdown.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="truncate text-muted">{item.name}</span>
                    <span className="font-medium tabular-nums">
                      {formatKr(item.amount, locale, 0)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-overlay">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.min(100, Math.max(0, item.percentOfExpenses))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Udfyld indkomst og udgifter for at se overblikket."
              : "Fill in income and expenses to see the overview."}
          </p>
        )}
      </div>
    </div>
  );
}
