"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass, Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatKr, formatNumber } from "@/lib/format";
import { prefillChoice, prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateAffordability, type IncomePeriod } from "./calc";

const PERIODS: readonly IncomePeriod[] = ["monthly", "annual"];

function parseField(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function RaadighedTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const initialPeriod =
    prefillChoice(prefill, "period", PERIODS) ?? "monthly";
  const [incomePeriod, setIncomePeriod] =
    useState<IncomePeriod>(initialPeriod);
  const [income, setIncome] = useState(
    prefillNumber(prefill, "income", { min: 0 }) ??
      (initialPeriod === "annual" ? "480000" : "40000"),
  );
  const [debts, setDebts] = useState(
    prefillNumber(prefill, "debts", { min: 0 }) ??
      prefillNumber(prefill, "existing", { min: 0 }) ??
      "2000",
  );
  const [downPayment, setDownPayment] = useState(
    prefillNumber(prefill, "down", { min: 0 }) ??
      prefillNumber(prefill, "udbetaling", { min: 0 }) ??
      "200000",
  );
  const [rate, setRate] = useState(
    prefillNumber(prefill, "rate", { min: 0 }) ?? "4",
  );
  const [termYears, setTermYears] = useState(
    prefillNumber(prefill, "term", { min: 1 }) ??
      prefillNumber(prefill, "years", { min: 1 }) ??
      "30",
  );
  const [dti, setDti] = useState(
    prefillNumber(prefill, "dti", { min: 1, max: 100 }) ?? "40",
  );

  const result = useMemo(() => {
    const incomeN = parseField(income);
    const debtsN = parseField(debts);
    const downN = parseField(downPayment);
    const rateN = parseField(rate);
    const termN = parseField(termYears);
    const dtiN = parseField(dti);
    if (
      incomeN === undefined ||
      debtsN === undefined ||
      downN === undefined ||
      rateN === undefined ||
      termN === undefined ||
      dtiN === undefined
    ) {
      return null;
    }
    return calculateAffordability({
      income: incomeN,
      incomePeriod,
      existingDebtsMonthly: debtsN,
      downPayment: downN,
      ratePercent: rateN,
      termYears: termN,
      dtiPercent: dtiN,
    });
  }, [income, incomePeriod, debts, downPayment, rate, termYears, dti]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";
  const loanText = result
    ? formatNumber(result.maxLoan, locale, 0)
    : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Indkomstperiode" : "Income period"}
          </p>
          <Segmented
            value={incomePeriod}
            onChange={setIncomePeriod}
            ariaLabel={da ? "Indkomstperiode" : "Income period"}
            options={[
              { id: "monthly", label: da ? "Månedlig" : "Monthly" },
              { id: "annual", label: da ? "Årlig" : "Annual" },
            ]}
          />
        </div>

        <Field
          label={
            incomePeriod === "annual"
              ? da
                ? "Årlig bruttoindkomst"
                : "Annual gross income"
              : da
                ? "Månedlig bruttoindkomst"
                : "Monthly gross income"
          }
        >
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className={fieldClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={
              da
                ? "Eksisterende gæld (kr/md)"
                : "Existing debts (per month)"
            }
            hint={
              da
                ? "Lån, kreditkort og andre faste ydelser."
                : "Loans, cards, and other fixed payments."
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={debts}
              onChange={(e) => setDebts(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={da ? "Udbetaling (kr)" : "Down payment"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={da ? "Rente (% p.a.)" : "Rate (% p.a.)"}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={da ? "Løbetid (år)" : "Term (years)"}>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={termYears}
              onChange={(e) => setTermYears(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={da ? "DTI-grænse (%)" : "DTI limit (%)"}
            hint={
              da
                ? "Max andel af indkomst til bolig + gæld."
                : "Max share of income for housing + debts."
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={dti}
              onChange={(e) => setDti(e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">
                    {da ? "Max lån" : "Max loan"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {formatKr(result.maxLoan, locale, 0)}
                  </p>
                </div>
                <CopyButton
                  value={loanText}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Estimeret ydelse" : "Estimated payment"}
                </dt>
                <dd className="font-medium">
                  {formatKr(result.estimatedMonthlyPayment, locale, 0)}
                  {da ? "/md" : "/mo"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Max boligydelse" : "Max housing payment"}
                </dt>
                <dd className="font-medium">
                  {formatKr(result.maxHousingPayment, locale, 0)}
                  {da ? "/md" : "/mo"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Estimeret købspris" : "Estimated purchase price"}
                </dt>
                <dd className="font-medium">
                  {formatKr(result.estimatedPurchasePrice, locale, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Månedlig indkomst" : "Monthly income"}
                </dt>
                <dd className="font-medium">
                  {formatKr(result.monthlyIncome, locale, 0)}
                </dd>
              </div>
            </dl>
            <p className="border-t border-border py-3 text-xs text-muted">
              {da
                ? "Vejledende estimat. Ikke bankrådgivning. Tal med din bank før du træffer beslutninger."
                : "Rough estimate only. Not bank advice. Talk to your lender before making decisions."}
            </p>
          </>
        ) : (
          <div className="space-y-3 py-8">
            <p className="text-sm text-muted">
              {da
                ? "Udfyld indkomst og lånedata for at estimere rådighed."
                : "Enter income and loan details to estimate affordability."}
            </p>
            <p className="text-xs text-muted">
              {da
                ? "Vejledende estimat. Ikke bankrådgivning."
                : "Rough estimate only. Not bank advice."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
