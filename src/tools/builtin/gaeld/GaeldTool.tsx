"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass, secondaryBtnClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import { prefillChoice, prefillNumber, type ToolPrefill } from "@/tools/prefill";
import {
  planPayoff,
  type Debt,
  type PayoffStrategy,
} from "./calc";

const STRATEGIES: readonly PayoffStrategy[] = ["snowball", "avalanche"];
const MAX_DEBTS = 8;

type DebtDraft = {
  id: string;
  name: string;
  balance: string;
  apr: string;
  minPayment: string;
};

function newDebt(index: number, da: boolean): DebtDraft {
  return {
    id: `d-${Date.now()}-${index}`,
    name: da ? `Gæld ${index}` : `Debt ${index}`,
    balance: index === 1 ? "12000" : index === 2 ? "4500" : "8000",
    apr: index === 1 ? "18" : index === 2 ? "22" : "9",
    minPayment: index === 1 ? "400" : index === 2 ? "150" : "250",
  };
}

function parseNum(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function GaeldTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [strategy, setStrategy] = useState<PayoffStrategy>(
    prefillChoice(prefill, "strategy", STRATEGIES) ?? "snowball",
  );
  const [extra, setExtra] = useState(
    prefillNumber(prefill, "extra", { min: 0 }) ?? "500",
  );
  const [debts, setDebts] = useState<DebtDraft[]>(() => [
    newDebt(1, da),
    newDebt(2, da),
  ]);

  const result = useMemo(() => {
    const parsed: Debt[] = [];
    for (const d of debts) {
      const balance = parseNum(d.balance);
      const apr = parseNum(d.apr);
      const minPayment = parseNum(d.minPayment);
      if (
        balance === undefined ||
        apr === undefined ||
        minPayment === undefined
      ) {
        continue;
      }
      parsed.push({
        id: d.id,
        name: d.name.trim() || (da ? "Gæld" : "Debt"),
        balance,
        apr,
        minPayment,
      });
    }
    const extraN = parseNum(extra) ?? 0;
    return planPayoff(parsed, strategy, extraN);
  }, [debts, strategy, extra, da]);

  function updateDebt(id: string, patch: Partial<DebtDraft>) {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    );
  }

  function removeDebt(id: string) {
    setDebts((prev) => (prev.length <= 1 ? prev : prev.filter((d) => d.id !== id)));
  }

  function addDebt() {
    setDebts((prev) => {
      if (prev.length >= MAX_DEBTS) return prev;
      return [...prev, newDebt(prev.length + 1, da)];
    });
  }

  const summaryCopy = result
    ? da
      ? `${result.months} måneder, rente ${formatKr(result.totalInterest, locale, 0)}, rækkefølge: ${result.order.join(" → ")}`
      : `${result.months} months, interest ${formatKr(result.totalInterest, locale, 0)}, order: ${result.order.join(" → ")}`
    : "";

  const previewMonths = result?.schedule.slice(0, 12) ?? [];
  const showMore =
    result && result.schedule.length > 12
      ? result.schedule.length - 12
      : 0;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {STRATEGIES.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setStrategy(id)}
              className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm transition-colors sm:min-h-0 ${
                strategy === id
                  ? "border-accent bg-accent text-on-accent"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {id === "snowball"
                ? da
                  ? "Snowball (laveste saldo)"
                  : "Snowball (lowest balance)"
                : da
                  ? "Avalanche (højeste rente)"
                  : "Avalanche (highest interest)"}
            </button>
          ))}
        </div>

        <Field
          label={da ? "Ekstra pr. måned" : "Extra per month"}
          hint={
            da
              ? "Udover minimumsbetalingerne"
              : "On top of minimum payments"
          }
        >
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="50"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            className={fieldClass}
          />
        </Field>

        <div className="space-y-3">
          {debts.map((debt, index) => (
            <div
              key={debt.id}
              className="rounded-[12px] border border-border bg-surface p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  {da ? `Gæld ${index + 1}` : `Debt ${index + 1}`}
                </p>
                {debts.length > 1 ? (
                  <button
                    type="button"
                    className="text-xs text-muted hover:text-foreground"
                    onClick={() => removeDebt(debt.id)}
                  >
                    {da ? "Fjern" : "Remove"}
                  </button>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={da ? "Navn" : "Name"}>
                  <input
                    className={fieldClass}
                    value={debt.name}
                    onChange={(e) =>
                      updateDebt(debt.id, { name: e.target.value })
                    }
                  />
                </Field>
                <Field label={da ? "Saldo" : "Balance"}>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="100"
                    className={fieldClass}
                    value={debt.balance}
                    onChange={(e) =>
                      updateDebt(debt.id, { balance: e.target.value })
                    }
                  />
                </Field>
                <Field label={da ? "Rente % ÅOP" : "Interest % APR"}>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    className={fieldClass}
                    value={debt.apr}
                    onChange={(e) =>
                      updateDebt(debt.id, { apr: e.target.value })
                    }
                  />
                </Field>
                <Field label={da ? "Min. betaling" : "Min. payment"}>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="10"
                    className={fieldClass}
                    value={debt.minPayment}
                    onChange={(e) =>
                      updateDebt(debt.id, { minPayment: e.target.value })
                    }
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className={secondaryBtnClass}
          disabled={debts.length >= MAX_DEBTS}
          onClick={addDebt}
        >
          {da
            ? `Tilføj gæld (${debts.length}/${MAX_DEBTS})`
            : `Add debt (${debts.length}/${MAX_DEBTS})`}
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
          {result ? (
            <>
              <div className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted">
                      {da ? "Gældfri om" : "Debt-free in"}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      {result.months}{" "}
                      {da
                        ? result.months === 1
                          ? "måned"
                          : "måneder"
                        : result.months === 1
                          ? "month"
                          : "months"}
                    </p>
                  </div>
                  <CopyButton
                    value={summaryCopy}
                    label={da ? "Kopiér" : "Copy"}
                    copiedLabel={da ? "Kopieret" : "Copied"}
                  />
                </div>
              </div>
              <dl className="space-y-2 border-t border-border py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Samlet rente" : "Total interest"}
                  </dt>
                  <dd className="font-medium">
                    {formatKr(result.totalInterest, locale, 0)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Samlet betalt" : "Total paid"}
                  </dt>
                  <dd className="font-medium">
                    {formatKr(result.totalPaid, locale, 0)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {da ? "Afbetalingsrækkefølge" : "Payoff order"}
                  </dt>
                  <dd className="max-w-[60%] text-right font-medium">
                    {result.order.join(" → ")}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="py-8 text-sm text-muted">
              {da
                ? "Tjek saldi og betalinger. Beløbene skal kunne dække renten."
                : "Check balances and payments. Amounts must cover the interest."}
            </p>
          )}
        </div>

        {result && previewMonths.length > 0 ? (
          <div className="rounded-[12px] border border-border bg-surface px-4 py-3">
            <p className="mb-2 text-xs font-medium text-muted">
              {da ? "Måned for måned (udsnit)" : "Month by month (sample)"}
            </p>
            <div className="max-h-64 overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted">
                  <tr>
                    <th className="py-1 pr-2 font-medium">
                      {da ? "Mdr." : "Mo."}
                    </th>
                    <th className="py-1 pr-2 font-medium">
                      {da ? "Rest" : "Left"}
                    </th>
                    <th className="py-1 pr-2 font-medium">
                      {da ? "Rente" : "Int."}
                    </th>
                    <th className="py-1 font-medium">
                      {da ? "Betalt af" : "Paid off"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewMonths.map((row) => (
                    <tr key={row.month} className="border-t border-border">
                      <td className="py-1.5 pr-2 tabular-nums">{row.month}</td>
                      <td className="py-1.5 pr-2 tabular-nums">
                        {formatNumber(row.remainingTotal, locale, 0)}
                      </td>
                      <td className="py-1.5 pr-2 tabular-nums">
                        {formatNumber(row.interestPaid, locale, 0)}
                      </td>
                      <td className="py-1.5 text-muted">
                        {row.paidOff.length
                          ? row.paidOff.join(", ")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {showMore > 0 ? (
              <p className="mt-2 text-xs text-muted">
                {da
                  ? `… og ${showMore} måneder mere til gældfri.`
                  : `… and ${showMore} more months until debt-free.`}
              </p>
            ) : null}
            {result.months > 12 ? (
              <p className="mt-1 text-xs text-muted">
                {da
                  ? `Viser de første 12 af ${result.months} måneder.`
                  : `Showing the first 12 of ${result.months} months.`}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
